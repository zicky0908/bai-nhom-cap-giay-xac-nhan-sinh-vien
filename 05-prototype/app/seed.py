from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .models import CertificateRequest, ProcessEvent, Student


ACTIVITIES = ["SUBMITTED", "PRECHECK", "STAFF_REVIEW", "APPROVED", "ISSUED", "NOTIFY_SENT"]


def seed_simulated(db: Session, seed: int = 43044, cases: int = 60, snapshot: datetime | None = None) -> dict:
    """Create reproducible AS-IS/TO-BE history; never touches live demo rows."""
    rng = random.Random(seed)
    snapshot = snapshot or datetime(2026, 10, 1, tzinfo=timezone.utc)
    db.execute(delete(ProcessEvent).where(ProcessEvent.data_source == "simulated"))
    existing_request_ids = list(db.scalars(select(CertificateRequest.id).where(CertificateRequest.data_source == "simulated")))
    if existing_request_ids:
        db.execute(delete(CertificateRequest).where(CertificateRequest.id.in_(existing_request_ids)))
    simulated_student_ids = list(db.scalars(select(Student.student_id).where(Student.student_id.like("SIM-%"))))
    if simulated_student_ids:
        db.execute(delete(Student).where(Student.student_id.in_(simulated_student_ids)))
    for scenario in ("AS-IS", "TO-BE"):
        for index in range(cases):
            sid = f"SIM-{scenario}-{index:04d}"
            student = Student(student_id=sid, full_name=f"Sinh viên mô phỏng {index + 1}", email=f"sim{index + 1}@example.test", active=True)
            db.add(student)
            start = snapshot - timedelta(days=45) + timedelta(hours=index * 8)
            is_open = rng.random() < 0.12
            request = CertificateRequest(case_id=f"SIM-{scenario}-{index + 1:04d}", student_id=sid, purpose="Bổ sung hồ sơ", status="SUBMITTED", automation_status="SYNCED", scenario=scenario, data_source="simulated", created_at=start, updated_at=start)
            db.add(request); db.flush()
            supplement = rng.random() < (0.35 if scenario == "AS-IS" else 0.20)
            path = list(ACTIVITIES)
            if supplement: path.insert(2, "NEED_SUPPLEMENT")
            if is_open:
                path = path[: rng.choice((2, 3))]
            current = start
            for position, activity in enumerate(path):
                wait_hours = rng.uniform(12, 48) if scenario == "AS-IS" else rng.uniform(2, 16)
                if activity == "NEED_SUPPLEMENT": wait_hours = rng.uniform(24, 72)
                current += timedelta(hours=wait_hours)
                processing = timedelta(minutes=rng.uniform(5, 45)) if activity == "STAFF_REVIEW" else timedelta(0)
                role = "student" if activity in {"SUBMITTED", "NEED_SUPPLEMENT"} else ("n8n" if activity in {"PRECHECK", "NOTIFY_SENT"} else "staff")
                db.add(ProcessEvent(request_id=request.id, case_id=request.case_id, activity=activity, lifecycle="start", timestamp=current, role=role, scenario=scenario, data_source="simulated", attempt_no=1, sequence=position * 2 + 1))
                db.add(ProcessEvent(request_id=request.id, case_id=request.case_id, activity=activity, lifecycle="complete", timestamp=current + processing, role=role, scenario=scenario, data_source="simulated", attempt_no=1, sequence=position * 2 + 2))
                current += processing
            last_activity = path[-1]
            state_by_activity = {"SUBMITTED": "SUBMITTED", "PRECHECK": "PRECHECK_OK", "NEED_SUPPLEMENT": "NEED_SUPPLEMENT", "STAFF_REVIEW": "IN_REVIEW", "APPROVED": "APPROVED", "ISSUED": "ISSUED", "NOTIFY_SENT": "ISSUED"}
            request.status = state_by_activity[last_activity]
            request.automation_status = "SYNCED" if last_activity == "NOTIFY_SENT" else "PENDING"
            request.updated_at = current
    db.commit()
    return {"seed": seed, "cases_per_scenario": cases, "snapshot": snapshot.isoformat()}

