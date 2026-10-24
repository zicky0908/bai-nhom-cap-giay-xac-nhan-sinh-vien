from __future__ import annotations

import csv
import io
import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from datetime import datetime, timezone

from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException, Query, Request, Response, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .analytics import process_map_svg, summary
from .database import create_schema, get_db
from .models import CertificateRequest, IdempotencyRecord, OutboxMessage, ProcessEvent, Student, utcnow
from .schemas import CallbackInput, RequestView, SubmitRequest, TransitionInput
from .service import add_instant_event, replay, remember, submit, transition
from .state_machine import ActorError, TransitionError

@asynccontextmanager
async def lifespan(_: FastAPI):
    create_schema()
    yield


app = FastAPI(title="Cấp giấy xác nhận sinh viên", version="0.1.0", lifespan=lifespan)
APP_DIR = Path(__file__).parent
templates = Jinja2Templates(directory=str(APP_DIR / "templates"))
app.mount("/static", StaticFiles(directory=str(APP_DIR / "static"), check_dir=False), name="static")
INTERNAL_TOKEN = os.getenv("INTERNAL_API_TOKEN", "change-me-in-env")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "change-me-in-env")
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "")


def require_key(value: str | None) -> str:
    if not value:
        raise HTTPException(400, "Thiếu Idempotency-Key")
    return value


def require_internal(x_internal_token: str = Header(default="")) -> None:
    if x_internal_token != INTERNAL_TOKEN:
        raise HTTPException(403, "Internal token không hợp lệ")


def get_request(db: Session, case_id: str) -> CertificateRequest:
    row = db.scalar(select(CertificateRequest).where(CertificateRequest.case_id == case_id))
    if row is None:
        raise HTTPException(404, "Không tìm thấy hồ sơ")
    return row


@app.get("/health")
@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "time": utcnow().isoformat()}


def dispatch_to_n8n(case_id: str, operation: str, key: str) -> None:
    """Best-effort delivery; the durable outbox remains PENDING on any failure."""
    if not N8N_WEBHOOK_URL:
        return
    import httpx

    try:
        httpx.post(N8N_WEBHOOK_URL, json={"case_id": case_id, "operation": operation, "idempotency_key": key}, timeout=10).raise_for_status()
    except Exception:
        # A retry worker/n8n poll can consume the durable outbox later.
        return


def dispatch_after_transition(background_tasks: BackgroundTasks, case_id: str, target: str, version: int) -> None:
    """Chuyển trạng thái nào có thông báo/tiền kiểm thì gửi sang n8n; dùng chung cho API và giao diện web."""
    if target in {"SUBMITTED", "NEED_SUPPLEMENT", "REJECTED", "ISSUED"}:
        operation = "precheck" if target == "SUBMITTED" else "notify"
        background_tasks.add_task(dispatch_to_n8n, case_id, operation, f"{operation}:{case_id}:v{version}")


@app.post("/api/requests", status_code=status.HTTP_202_ACCEPTED)
def create_request(data: SubmitRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")) -> dict:
    try:
        key = require_key(idempotency_key)
        result = submit(db, data, key)
        background_tasks.add_task(dispatch_to_n8n, result["case_id"], "precheck", f"precheck:{result['case_id']}:v{result['version']}")
        return result
    except ValueError as exc:
        db.rollback()
        raise HTTPException(409, str(exc)) from exc


@app.get("/api/requests", response_model=list[RequestView])
def list_requests(data_source: str = Query(default="demo", pattern="^(demo|simulated)$"), db: Session = Depends(get_db)):
    return list(db.scalars(select(CertificateRequest).where(CertificateRequest.data_source == data_source).order_by(CertificateRequest.created_at.desc())))


@app.get("/api/requests/{case_id}")
def request_detail(case_id: str, db: Session = Depends(get_db)) -> dict:
    row = get_request(db, case_id)
    events = list(db.scalars(select(ProcessEvent).where(ProcessEvent.case_id == case_id).order_by(ProcessEvent.timestamp, ProcessEvent.sequence)))
    return {"request": RequestView.model_validate(row), "student": {"student_id": row.student.student_id, "full_name": row.student.full_name, "email": row.student.email, "active": row.student.active}, "events": [{"activity": e.activity, "lifecycle": e.lifecycle, "timestamp": e.timestamp, "role": e.role, "attempt_no": e.attempt_no} for e in events]}


@app.post("/api/requests/{case_id}/transition")
def human_transition(case_id: str, data: TransitionInput, background_tasks: BackgroundTasks, db: Session = Depends(get_db), idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")) -> dict:
    if data.actor == "n8n":
        raise HTTPException(403, "n8n phải dùng API nội bộ")
    row = get_request(db, case_id)
    try:
        result = transition(db, row, data, require_key(idempotency_key))
        dispatch_after_transition(background_tasks, case_id, result["status"], result["version"])
        return result
    except ActorError as exc:
        db.rollback(); raise HTTPException(403, str(exc)) from exc
    except TransitionError as exc:
        db.rollback(); raise HTTPException(409, str(exc)) from exc
    except RuntimeError as exc:
        db.rollback(); raise HTTPException(409, str(exc)) from exc
    except ValueError as exc:
        db.rollback(); raise HTTPException(422, str(exc)) from exc


@app.get("/api/internal/requests/{case_id}", dependencies=[Depends(require_internal)])
def internal_request(case_id: str, db: Session = Depends(get_db)) -> dict:
    row = get_request(db, case_id)
    complete = bool(row.purpose.strip() and row.student.email.strip())
    return {"case_id": row.case_id, "status": row.status, "version": row.version, "purpose": row.purpose, "student": {"student_id": row.student.student_id, "active": row.student.active, "email": row.student.email, "full_name": row.student.full_name}, "email": row.student.email, "full_name": row.student.full_name, "complete": complete, "required_fields_complete": complete}


@app.post("/api/internal/requests/{case_id}/transition", dependencies=[Depends(require_internal)])
def internal_transition(case_id: str, data: TransitionInput, db: Session = Depends(get_db), idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")) -> dict:
    action_map = {
        "precheck_ok": "PRECHECK_OK", "need_supplement": "NEED_SUPPLEMENT",
        "PRECHECK_PASS": "PRECHECK_OK", "REQUEST_SUPPLEMENT": "NEED_SUPPLEMENT",
        "PRECHECK_OK": "PRECHECK_OK", "NEED_SUPPLEMENT": "NEED_SUPPLEMENT",
    }
    data.target_status = action_map.get(data.target_status, data.target_status)
    if data.actor != "n8n":
        raise HTTPException(403, "API nội bộ này chỉ chấp nhận actor n8n")
    row = get_request(db, case_id)
    try:
        return transition(db, row, data, require_key(idempotency_key))
    except ActorError as exc:
        db.rollback(); raise HTTPException(403, str(exc)) from exc
    except TransitionError as exc:
        db.rollback(); raise HTTPException(409, str(exc)) from exc
    except RuntimeError as exc:
        db.rollback(); raise HTTPException(409, str(exc)) from exc
    except ValueError as exc:
        db.rollback(); raise HTTPException(422, str(exc)) from exc


@app.post("/api/internal/requests/{case_id}/automation-callback", dependencies=[Depends(require_internal)])
def automation_callback(case_id: str, data: CallbackInput, db: Session = Depends(get_db), idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")) -> dict:
    key = require_key(idempotency_key); row = get_request(db, case_id); payload = data.model_dump(); scope = f"callback:{case_id}"
    try:
        cached = replay(db, scope, key, payload)
        if cached is not None:
            return cached
        row.automation_status = data.automation_status
        if data.automation_status == "SYNCED":
            add_instant_event(db, row, "NOTIFY_SENT", "n8n", metadata={"mailpit_id": data.mailpit_id, "type": data.notification_type})
        pending = list(db.scalars(select(OutboxMessage).where(OutboxMessage.request_id == row.id, OutboxMessage.status == "PENDING")))
        for message in pending:
            message.status = "DONE" if data.automation_status == "SYNCED" else "FAILED"
            message.processed_at = utcnow(); message.last_error = data.error
        response = {"case_id": case_id, "status": row.status, "automation_status": row.automation_status}
        remember(db, scope, key, payload, response); db.commit(); return response
    except ValueError as exc:
        db.rollback(); raise HTTPException(409, str(exc)) from exc


@app.get("/api/internal/outbox", dependencies=[Depends(require_internal)])
def outbox(limit: int = Query(default=20, ge=1, le=100), db: Session = Depends(get_db)) -> list[dict]:
    rows = list(db.scalars(select(OutboxMessage).where(OutboxMessage.status == "PENDING", OutboxMessage.available_at <= utcnow()).order_by(OutboxMessage.id).limit(limit)))
    return [{"id": r.id, "case_id": r.case_id, "event_type": r.event_type, "payload": json.loads(r.payload_json), "attempts": r.attempts} for r in rows]


@app.get("/api/analytics/summary")
def analytics_summary(data_source: str = Query(default="simulated", pattern="^(demo|simulated)$"), scenario: str | None = Query(default=None, pattern="^(AS-IS|TO-BE)$"), as_of: datetime | None = None, db: Session = Depends(get_db)) -> dict:
    return summary(db, data_source, scenario, as_of)


@app.get("/api/analytics/events.csv")
def export_events(data_source: str = Query(default="simulated", pattern="^(demo|simulated)$"), scenario: str | None = Query(default=None, pattern="^(AS-IS|TO-BE)$"), db: Session = Depends(get_db)) -> Response:
    query = select(ProcessEvent).where(ProcessEvent.data_source == data_source)
    if scenario: query = query.where(ProcessEvent.scenario == scenario)
    rows = list(db.scalars(query.order_by(ProcessEvent.case_id, ProcessEvent.timestamp, ProcessEvent.sequence)))
    stream = io.StringIO(newline=""); writer = csv.writer(stream, lineterminator="\n")
    writer.writerow(["case_id", "activity", "timestamp", "resource", "role", "scenario", "data_source", "lifecycle", "attempt_no"])
    for e in rows: writer.writerow([e.case_id, e.activity, e.timestamp.isoformat(), e.resource or "", e.role, e.scenario, e.data_source, e.lifecycle, e.attempt_no])
    return Response(stream.getvalue(), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": "attachment; filename=event-log.csv"})


@app.get("/api/analytics/process-map.svg")
def analytics_process_map(data_source: str = Query(default="simulated", pattern="^(demo|simulated)$"), scenario: str | None = Query(default=None, pattern="^(AS-IS|TO-BE)$"), db: Session = Depends(get_db)) -> Response:
    try:
        svg = process_map_svg(db, data_source, scenario)
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    return Response(svg, media_type="image/svg+xml")


@app.post("/api/demo/reset")
def reset_demo(db: Session = Depends(get_db), x_admin_token: str = Header(default="")) -> dict:
    if x_admin_token != ADMIN_TOKEN: raise HTTPException(403, "Admin token không hợp lệ")
    rows = list(db.execute(select(CertificateRequest.id, CertificateRequest.case_id).where(CertificateRequest.data_source == "demo")))
    ids, case_ids = [r.id for r in rows], [r.case_id for r in rows]
    count = len(ids)
    if ids:
        db.execute(delete(ProcessEvent).where(ProcessEvent.request_id.in_(ids)))
        db.execute(delete(OutboxMessage).where(OutboxMessage.request_id.in_(ids)))
        db.execute(delete(CertificateRequest).where(CertificateRequest.id.in_(ids)))
    # Mã hồ sơ demo được đánh số lại sau reset. Khóa idempotency của hồ sơ không còn tồn tại
    # (n8n dùng case_id + hậu tố, form nộp dùng sinh viên + mục đích) phải bị xóa, nếu không hồ sơ
    # mới cùng mã bị 409 hoặc nhận lại mã của hồ sơ đã xóa. Dọn cả bản ghi mồ côi từ lần reset cũ.
    remaining = set(db.scalars(select(CertificateRequest.case_id)))
    for record in db.scalars(select(IdempotencyRecord)):
        kind, _, case_id = record.scope.partition(":")
        if kind == "submit":
            case_id = json.loads(record.response_json).get("case_id")
        if kind in ("transition", "callback", "submit") and case_id not in remaining:
            db.delete(record)
    db.commit()
    return {"deleted_demo_cases": count, "simulated_data_preserved": True}


def _template(name: str, request: Request, **context):
    return templates.TemplateResponse(request=request, name=name, context={"request": request, **context})


@app.get("/", response_class=HTMLResponse)
def student_page(request: Request):
    return _template("index.html", request)


@app.post("/requests")
async def submit_form(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    form = await request.form()
    data = SubmitRequest(student_code=str(form.get("student_code") or form.get("student_id") or ""), full_name=str(form.get("full_name") or ""), email=str(form.get("email") or ""), purpose=str(form.get("purpose") or ""), delivery_method=str(form.get("delivery_method") or "pickup"))
    key = str(form.get("idempotency_key") or f"web-submit:{data.student_id}:{data.purpose}")
    result = submit(db, data, key)
    background_tasks.add_task(dispatch_to_n8n, result["case_id"], "precheck", f"precheck:{result['case_id']}:v{result['version']}")
    return RedirectResponse(f"/requests/{result['case_id']}", status_code=303)


@app.get("/requests/{case_id}", response_class=HTMLResponse)
def student_detail_page(case_id: str, request: Request, db: Session = Depends(get_db)):
    row = get_request(db, case_id)
    return _template("request_detail.html", request, item=row, student=row.student)


@app.post("/requests/{case_id}/actions/{action}")
async def page_action(case_id: str, action: str, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    row = get_request(db, case_id); form = await request.form()
    action_map = {"claim": ("IN_REVIEW", "staff"), "approve": ("APPROVED", "staff"), "reject": ("REJECTED", "staff"), "request-supplement": ("NEED_SUPPLEMENT", "staff"), "supplement": ("SUBMITTED", "student"), "issue": ("ISSUED", "staff")}
    if action not in action_map: raise HTTPException(404, "Hành động không tồn tại")
    target, actor = action_map[action]
    result = transition(db, row, TransitionInput(target_status=target, actor=actor, reason=str(form.get("reason") or "") or None, expected_version=int(form.get("version") or row.version), resource=str(form.get("resource") or actor)), str(form.get("idempotency_key") or f"web:{case_id}:{action}:v{row.version}"))
    dispatch_after_transition(background_tasks, case_id, target, result["version"])
    return RedirectResponse(f"/staff/requests/{case_id}" if actor == "staff" else f"/requests/{case_id}", status_code=303)


@app.get("/staff", response_class=HTMLResponse)
def staff_page(request: Request, db: Session = Depends(get_db)):
    items = list(db.scalars(select(CertificateRequest).where(CertificateRequest.data_source == "demo").order_by(CertificateRequest.updated_at.desc())))
    return _template("staff.html", request, items=items)


@app.get("/staff/requests/{case_id}", response_class=HTMLResponse)
def staff_detail_page(case_id: str, request: Request, db: Session = Depends(get_db)):
    row = get_request(db, case_id)
    events = list(db.scalars(select(ProcessEvent).where(ProcessEvent.case_id == case_id).order_by(ProcessEvent.timestamp, ProcessEvent.sequence)))
    return _template("staff_detail.html", request, item=row, student=row.student, events=events)


@app.get("/analytics", response_class=HTMLResponse)
def analytics_page(request: Request, data_source: str = "simulated", scenario: str | None = None, db: Session = Depends(get_db)):
    return _template("analytics.html", request, metrics=summary(db, data_source, scenario), data_source=data_source, scenario=scenario)


@app.get("/api/events.csv")
def export_events_alias(data_source: str = Query(default="simulated", pattern="^(demo|simulated)$"), scenario: str | None = Query(default=None, pattern="^(AS-IS|TO-BE)$"), db: Session = Depends(get_db)):
    return export_events(data_source, scenario, db)


@app.post("/demo/reset")
async def reset_demo_form(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    reset_demo(db, str(form.get("admin_token") or ""))
    return RedirectResponse("/staff", status_code=303)

