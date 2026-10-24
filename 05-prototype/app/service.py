from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import CertificateRequest, IdempotencyRecord, OutboxMessage, ProcessEvent, Student
from .schemas import SubmitRequest, TransitionInput
from .state_machine import validate_transition


INSTANT_ACTIVITIES = {"SUBMITTED", "PRECHECK", "SUPPLEMENT_SUBMITTED", "ISSUED", "NOTIFY_SENT", "REJECTED", "APPROVED"}


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _json(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, sort_keys=True, default=str)


def request_hash(data: Any) -> str:
    return hashlib.sha256(_json(data).encode()).hexdigest()


def replay(db: Session, scope: str, key: str, payload: Any) -> dict[str, Any] | None:
    row = db.scalar(select(IdempotencyRecord).where(IdempotencyRecord.scope == scope, IdempotencyRecord.key == key))
    if row is None:
        return None
    if row.request_hash != request_hash(payload):
        raise ValueError("Idempotency-Key đã được dùng với nội dung khác")
    return json.loads(row.response_json)


def remember(db: Session, scope: str, key: str, payload: Any, response: dict[str, Any], status_code: int = 200) -> None:
    db.add(IdempotencyRecord(scope=scope, key=key, request_hash=request_hash(payload), status_code=status_code, response_json=_json(response)))


def next_case_id(db: Session) -> str:
    number = (db.scalar(select(func.count(CertificateRequest.id))) or 0) + 1
    return f"GXN-{utcnow():%Y%m%d}-{number:04d}"


def add_event(
    db: Session,
    request: CertificateRequest,
    activity: str,
    lifecycle: str,
    role: str,
    *,
    timestamp: datetime | None = None,
    resource: str | None = None,
    metadata: dict[str, Any] | None = None,
    sequence: int = 1,
) -> ProcessEvent:
    row = ProcessEvent(
        request_id=request.id,
        case_id=request.case_id,
        activity=activity,
        lifecycle=lifecycle,
        timestamp=timestamp or utcnow(),
        role=role,
        resource=resource,
        scenario=request.scenario,
        data_source=request.data_source,
        attempt_no=request.attempt_no,
        sequence=sequence,
        metadata_json=_json(metadata) if metadata else None,
    )
    db.add(row)
    return row


def add_instant_event(db: Session, request: CertificateRequest, activity: str, role: str, **kwargs: Any) -> None:
    stamp = kwargs.pop("timestamp", None) or utcnow()
    # Một hoạt động có thể lặp trong cùng lượt nộp (ví dụ NOTIFY_SENT cho tiền kiểm rồi cho cấp giấy):
    # lần sau nối tiếp số thứ tự thay vì trùng khóa uq_event_identity.
    last = db.scalar(select(func.max(ProcessEvent.sequence)).where(
        ProcessEvent.request_id == request.id, ProcessEvent.activity == activity,
        ProcessEvent.attempt_no == request.attempt_no)) or 0
    add_event(db, request, activity, "start", role, timestamp=stamp, sequence=last + 1, **kwargs)
    add_event(db, request, activity, "complete", role, timestamp=stamp, sequence=last + 2, **kwargs)


def enqueue(db: Session, request: CertificateRequest, event_type: str) -> None:
    dedupe = f"{request.case_id}:{event_type}:v{request.version}"
    payload = {"case_id": request.case_id, "event_type": event_type, "version": request.version}
    db.add(OutboxMessage(request_id=request.id, case_id=request.case_id, event_type=event_type, dedupe_key=dedupe, payload_json=_json(payload)))


def submit(db: Session, data: SubmitRequest, key: str) -> dict[str, Any]:
    payload = data.model_dump()
    cached = replay(db, "submit", key, payload)
    if cached is not None:
        return cached
    student = db.get(Student, data.student_id)
    if student is None:
        student = Student(student_id=data.student_id, full_name=data.full_name, email=data.email, active=True)
        db.add(student)
    else:
        student.full_name, student.email = data.full_name, data.email
    request = CertificateRequest(
        case_id=next_case_id(db), student_id=data.student_id, purpose=data.purpose,
        delivery_method=data.delivery_method, status="SUBMITTED", automation_status="PENDING",
        scenario="TO-BE", data_source="demo",
    )
    db.add(request)
    db.flush()
    add_instant_event(db, request, "SUBMITTED", "student", resource=data.student_id)
    enqueue(db, request, "PRECHECK_REQUESTED")
    response = {"case_id": request.case_id, "status": request.status, "automation_status": request.automation_status, "version": request.version}
    remember(db, "submit", key, payload, response, 202)
    db.commit()
    return response


def transition(db: Session, request: CertificateRequest, data: TransitionInput, key: str) -> dict[str, Any]:
    payload = data.model_dump()
    scope = f"transition:{request.case_id}"
    cached = replay(db, scope, key, payload)
    if cached is not None:
        return cached
    if data.expected_version is not None and data.expected_version != request.version:
        raise RuntimeError("Phiên bản hồ sơ đã thay đổi; hãy tải lại dữ liệu")
    old = request.status
    rule = validate_transition(old, data.target_status, data.actor, data.reason)
    now = utcnow()
    if old == "PRECHECK_OK" and data.target_status == "IN_REVIEW":
        add_event(db, request, "STAFF_REVIEW", "start", data.actor, timestamp=now, resource=data.resource)
    elif old == "IN_REVIEW":
        add_event(db, request, "STAFF_REVIEW", "complete", data.actor, timestamp=now, resource=data.resource)
    if rule.increment_attempt:
        request.attempt_no += 1
        add_instant_event(db, request, "SUPPLEMENT_SUBMITTED", data.actor, timestamp=now, resource=data.resource)
    elif data.target_status == "PRECHECK_OK":
        add_instant_event(db, request, "PRECHECK", data.actor, timestamp=now, resource=data.resource)
    elif data.target_status in INSTANT_ACTIVITIES:
        add_instant_event(db, request, data.target_status, data.actor, timestamp=now, resource=data.resource, metadata={"reason": data.reason} if data.reason else None)
    elif data.target_status == "NEED_SUPPLEMENT":
        add_instant_event(db, request, "NEED_SUPPLEMENT", data.actor, timestamp=now, resource=data.resource, metadata={"reason": data.reason})
    request.status = data.target_status
    request.reason = data.reason
    request.version += 1
    request.updated_at = now
    if data.target_status == "SUBMITTED":
        request.automation_status = "PENDING"
        enqueue(db, request, "PRECHECK_REQUESTED")
    elif data.target_status in {"NEED_SUPPLEMENT", "REJECTED", "ISSUED"}:
        request.automation_status = "PENDING"
        enqueue(db, request, "NOTIFICATION_REQUESTED")
    response = {"case_id": request.case_id, "previous_status": old, "status": request.status, "automation_status": request.automation_status, "attempt_no": request.attempt_no, "version": request.version}
    remember(db, scope, key, payload, response)
    db.commit()
    return response

