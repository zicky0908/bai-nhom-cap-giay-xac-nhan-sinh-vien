#!/usr/bin/env python3
"""Run one real happy path through app -> n8n -> Mailpit -> callback."""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
import uuid


APP = os.getenv("APP_URL", "http://localhost:8000").rstrip("/")
MAILPIT = os.getenv("MAILPIT_URL", "http://localhost:8025").rstrip("/")
TIMEOUT = int(os.getenv("SMOKE_TIMEOUT_SECONDS", "90"))


def call(method: str, url: str, payload: dict | None = None, headers: dict | None = None) -> dict:
    body = json.dumps(payload).encode() if payload is not None else None
    merged = {"Accept": "application/json", **(headers or {})}
    if body is not None:
        merged["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=body, method=method, headers=merged)
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            raw = response.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace")
        raise RuntimeError(f"{method} {url} -> HTTP {exc.code}: {detail}") from exc


def detail(case_id: str) -> dict:
    return call("GET", f"{APP}/api/requests/{case_id}")


def wait_for(case_id: str, predicate, description: str) -> dict:
    deadline = time.monotonic() + TIMEOUT
    last: dict = {}
    while time.monotonic() < deadline:
        last = detail(case_id)
        if predicate(last):
            print(f"OK: {description}")
            return last
        time.sleep(1)
    request_state = last.get("request", last)
    raise RuntimeError(
        f"Timeout chờ {description}; trạng thái cuối={request_state.get('status')}, "
        f"automation_status={request_state.get('automation_status')}. "
        "Không được coi giao diện là thành công khi n8n/callback chưa hoàn tất."
    )


def transition(case_id: str, target: str, actor: str, version: int, key: str) -> dict:
    return call(
        "POST",
        f"{APP}/api/requests/{case_id}/transition",
        {"target_status": target, "actor": actor, "expected_version": version, "resource": "smoke-test"},
        {"Idempotency-Key": key},
    )


def main() -> int:
    run_id = uuid.uuid4().hex[:10]
    email = f"smoke-{run_id}@example.test"
    submit_key = f"smoke-submit-{run_id}"
    submitted = call(
        "POST",
        f"{APP}/api/requests",
        {
            "student_id": f"SMOKE-{run_id}",
            "full_name": "Sinh viên kiểm thử E2E",
            "email": email,
            "purpose": "Xác nhận sinh viên để kiểm thử E2E",
            "delivery_method": "pickup",
        },
        {"Idempotency-Key": submit_key},
    )
    case_id = submitted["case_id"]
    print(f"OK: tạo hồ sơ {case_id}")

    replayed = call(
        "POST",
        f"{APP}/api/requests",
        {
            "student_id": f"SMOKE-{run_id}",
            "full_name": "Sinh viên kiểm thử E2E",
            "email": email,
            "purpose": "Xác nhận sinh viên để kiểm thử E2E",
            "delivery_method": "pickup",
        },
        {"Idempotency-Key": submit_key},
    )
    if replayed["case_id"] != case_id:
        raise RuntimeError("Idempotency lỗi: gửi lại tạo case_id khác")
    print("OK: replay Idempotency-Key không tạo hồ sơ mới")

    current = wait_for(
        case_id,
        lambda d: d["request"]["status"] in {"PRECHECK_OK", "NEED_SUPPLEMENT"},
        "n8n hoàn thành nhánh tiền kiểm",
    )
    if current["request"]["status"] != "PRECHECK_OK":
        raise RuntimeError("Hồ sơ đầy đủ nhưng n8n chuyển sang NEED_SUPPLEMENT")

    row = current["request"]
    claimed = transition(case_id, "IN_REVIEW", "staff", row["version"], f"smoke-claim-{run_id}")
    approved = transition(case_id, "APPROVED", "staff", claimed["version"], f"smoke-approve-{run_id}")
    issued = transition(case_id, "ISSUED", "staff", approved["version"], f"smoke-issue-{run_id}")
    if issued["automation_status"] != "PENDING":
        raise RuntimeError("ISSUED phải ở PENDING cho tới khi n8n gửi mail và callback")
    print("OK: luồng cán bộ IN_REVIEW -> APPROVED -> ISSUED")

    def notified_after_issue(d: dict) -> bool:
        # Phải là thông báo SAU khi cấp giấy; callback tiền kiểm đến muộn không được tính (tránh PASS giả).
        events = d["events"]
        issued = [i for i, e in enumerate(events) if e["activity"] == "ISSUED" and e["lifecycle"] == "complete"]
        return bool(issued) and d["request"]["status"] == "ISSUED" and d["request"]["automation_status"] == "SYNCED" and any(
            e["activity"] == "NOTIFY_SENT" and e["lifecycle"] == "complete" for e in events[issued[-1] + 1:])

    final = wait_for(case_id, notified_after_issue, "n8n gửi thông báo cấp giấy và callback SYNCED")
    completed = {(e["activity"], e["lifecycle"]) for e in final["events"]}
    if ("ISSUED", "complete") not in completed or ("NOTIFY_SENT", "complete") not in completed:
        raise RuntimeError("Event log thiếu ISSUED/NOTIFY_SENT complete")
    print("OK: event log phản ánh cấp giấy và thông báo")

    messages = call("GET", f"{MAILPIT}/api/v1/messages")
    if case_id not in json.dumps(messages, ensure_ascii=False):
        raise RuntimeError(f"Mailpit không có bằng chứng thư cho {case_id}")
    print("OK: Mailpit có email thử nghiệm thực tế")
    print(f"PASS E2E: {case_id}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"FAIL E2E: {exc}", file=sys.stderr)
        raise SystemExit(1)

