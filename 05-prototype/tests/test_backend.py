from sqlalchemy import func, select

from app.database import SessionLocal
from app.models import CertificateRequest, ProcessEvent
from app.seed import seed_simulated


def create(client, key="submit-1"):
    return client.post("/api/requests", headers={"Idempotency-Key": key}, json={"student_id": "25MSB43044", "full_name": "Nguyễn Thành Lâm", "email": "lam@example.test", "purpose": "Xác nhận đang học", "delivery_method": "pickup"})


def internal_transition(client, case_id, target, key, version, reason=None):
    return client.post(f"/api/internal/requests/{case_id}/transition", headers={"X-Internal-Token": "test-internal", "Idempotency-Key": key}, json={"target_status": target, "actor": "n8n", "reason": reason, "expected_version": version})


def human_transition(client, case_id, target, key, version, reason=None, actor="staff"):
    return client.post(f"/api/requests/{case_id}/transition", headers={"Idempotency-Key": key}, json={"target_status": target, "actor": actor, "reason": reason, "expected_version": version})


def test_happy_path_and_notification_callback(client):
    submitted = create(client).json(); case_id = submitted["case_id"]
    assert internal_transition(client, case_id, "PRECHECK_OK", "precheck", 1).status_code == 200
    assert human_transition(client, case_id, "IN_REVIEW", "claim", 2).status_code == 200
    assert human_transition(client, case_id, "APPROVED", "approve", 3).status_code == 200
    issued = human_transition(client, case_id, "ISSUED", "issue", 4).json()
    assert issued["automation_status"] == "PENDING"
    callback = client.post(f"/api/internal/requests/{case_id}/automation-callback", headers={"X-Internal-Token": "test-internal", "Idempotency-Key": "notify-1"}, json={"automation_status": "SYNCED", "mailpit_id": "mail-42"})
    assert callback.json()["automation_status"] == "SYNCED"
    detail = client.get(f"/api/requests/{case_id}").json()
    assert any(e["activity"] == "NOTIFY_SENT" and e["lifecycle"] == "complete" for e in detail["events"])


def test_idempotency_replay_writes_no_duplicate(client):
    first = create(client, "same-key")
    second = create(client, "same-key")
    assert first.json() == second.json()
    with SessionLocal() as db:
        assert db.scalar(select(func.count(CertificateRequest.id))) == 1
        assert db.scalar(select(func.count(ProcessEvent.id))) == 2


def test_same_key_different_payload_conflicts(client):
    create(client, "same-key")
    response = client.post("/api/requests", headers={"Idempotency-Key": "same-key"}, json={"student_id": "25MSB43044", "full_name": "Nguyễn Thành Lâm", "email": "lam@example.test", "purpose": "Mục đích khác", "delivery_method": "pickup"})
    assert response.status_code == 409


def test_supplement_loop_increments_attempt(client):
    row = create(client).json(); case_id = row["case_id"]
    needed = internal_transition(client, case_id, "NEED_SUPPLEMENT", "need-more", 1, "Thiếu thông tin").json()
    assert needed["attempt_no"] == 1
    resubmitted = human_transition(client, case_id, "SUBMITTED", "resubmit", 2, actor="student").json()
    assert resubmitted["attempt_no"] == 2


def test_wrong_actor_state_and_missing_reason_do_not_write_events(client):
    row = create(client).json(); case_id = row["case_id"]
    with SessionLocal() as db: before = db.scalar(select(func.count(ProcessEvent.id)))
    assert human_transition(client, case_id, "PRECHECK_OK", "wrong-actor", 1).status_code == 403
    assert human_transition(client, case_id, "APPROVED", "wrong-state", 1).status_code == 409
    missing = internal_transition(client, case_id, "NEED_SUPPLEMENT", "missing-reason", 1)
    assert missing.status_code == 422
    with SessionLocal() as db: assert db.scalar(select(func.count(ProcessEvent.id))) == before


def test_stale_version_rejected(client):
    row = create(client).json(); case_id = row["case_id"]
    assert internal_transition(client, case_id, "PRECHECK_OK", "precheck", 1).status_code == 200
    assert human_transition(client, case_id, "IN_REVIEW", "stale", 1).status_code == 409


def test_reset_only_deletes_demo(client):
    create(client)
    with SessionLocal() as db:
        from app.models import Student
        student = Student(student_id="SIM-1", full_name="Sim", email="sim@example.test", active=True); db.add(student)
        db.add(CertificateRequest(case_id="SIM-TO-BE-1", student_id="SIM-1", purpose="test", scenario="TO-BE", data_source="simulated")); db.commit()
    response = client.post("/api/demo/reset", headers={"X-Admin-Token": "test-admin"})
    assert response.json() == {"deleted_demo_cases": 1, "simulated_data_preserved": True}
    with SessionLocal() as db: assert db.scalar(select(func.count(CertificateRequest.id))) == 1


def test_data_source_isolation_in_analytics_and_csv(client):
    create(client)
    demo = client.get("/api/analytics/summary", params={"data_source": "demo"}).json()
    simulated = client.get("/api/analytics/summary", params={"data_source": "simulated"}).json()
    assert demo["case_count"] == 1 and simulated["case_count"] == 0
    csv_text = client.get("/api/analytics/events.csv", params={"data_source": "simulated"}).text
    assert "GXN-" not in csv_text


def test_seed_is_reproducible_and_contains_backlog(client):
    with SessionLocal() as db:
        seed_simulated(db, seed=123, cases=12)
    first = client.get("/api/analytics/events.csv", params={"data_source": "simulated"}).content
    metrics = client.get("/api/analytics/summary", params={"data_source": "simulated"}).json()
    assert metrics["open_cases"]
    with SessionLocal() as db:
        seed_simulated(db, seed=123, cases=12)
    second = client.get("/api/analytics/events.csv", params={"data_source": "simulated"}).content
    assert first == second


def test_process_map_endpoint_uses_pm4py_when_available(client):
    import pytest
    pytest.importorskip("pm4py")
    with SessionLocal() as db:
        seed_simulated(db, seed=7, cases=3)
    response = client.get("/api/analytics/process-map.svg", params={"data_source": "simulated", "scenario": "AS-IS"})
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/svg+xml")
    assert b"<svg" in response.content


def test_main_page_routes_render(client):
    created = create(client).json()
    assert client.get("/").status_code == 200
    assert client.get("/staff").status_code == 200
    assert client.get(f"/requests/{created['case_id']}").status_code == 200
    assert client.get(f"/staff/requests/{created['case_id']}").status_code == 200
    assert client.get("/analytics").status_code == 200


def test_reset_clears_idempotency_so_renumbered_case_works(client):
    first = create(client).json()["case_id"]
    assert internal_transition(client, first, "PRECHECK_OK", "n8n-key:pass", 1).status_code == 200
    client.post("/api/demo/reset", headers={"X-Admin-Token": "test-admin"})
    second = create(client).json()["case_id"]
    assert second == first  # đánh số lại sau reset, đúng tình huống buổi demo
    # n8n sinh lại cùng khóa cho hồ sơ mới: phải được chấp nhận, không 409
    assert internal_transition(client, second, "PRECHECK_OK", "n8n-key:pass", 1).status_code == 200


def test_api_issue_dispatches_notification_to_n8n(client, monkeypatch):
    import app.main as main
    sent = []
    monkeypatch.setattr(main, "dispatch_to_n8n", lambda case_id, operation, key: sent.append((case_id, operation, key)))
    case_id = create(client).json()["case_id"]
    internal_transition(client, case_id, "PRECHECK_OK", "n8n-pass", 1)
    version = 2
    for target, key in (("IN_REVIEW", "c"), ("APPROVED", "a"), ("ISSUED", "i")):
        version = human_transition(client, case_id, target, key, version).json()["version"]
    # Trước đây chỉ giao diện web gửi thông báo; cấp giấy qua API để hồ sơ kẹt ở PENDING.
    assert (case_id, "notify", f"notify:{case_id}:v{version}") in sent


def test_two_notifications_in_one_attempt_are_both_logged(client):
    # Thông báo tiền kiểm rồi thông báo cấp giấy cùng attempt_no: trước đây callback thứ hai lỗi 500 (trùng khóa event).
    case_id = create(client).json()["case_id"]
    internal_transition(client, case_id, "PRECHECK_OK", "p", 1)
    cb = lambda key: client.post(f"/api/internal/requests/{case_id}/automation-callback", headers={"X-Internal-Token": "test-internal", "Idempotency-Key": key}, json={"automation_status": "SYNCED", "mailpit_id": key})
    assert cb("precheck-cb").status_code == 200
    for target, key, version in (("IN_REVIEW", "c", 2), ("APPROVED", "a", 3), ("ISSUED", "i", 4)):
        assert human_transition(client, case_id, target, key, version).status_code == 200
    assert cb("issue-cb").status_code == 200
    events = client.get(f"/api/requests/{case_id}").json()["events"]
    assert sum(e["activity"] == "NOTIFY_SENT" and e["lifecycle"] == "complete" for e in events) == 2
