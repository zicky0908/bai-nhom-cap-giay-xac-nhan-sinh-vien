from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Student(Base):
    __tablename__ = "students"

    student_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255))
    active: Mapped[bool] = mapped_column(default=True)


class CertificateRequest(Base):
    __tablename__ = "certificate_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.student_id"), index=True)
    purpose: Mapped[str] = mapped_column(String(500))
    delivery_method: Mapped[str] = mapped_column(String(32), default="pickup")
    status: Mapped[str] = mapped_column(String(32), default="SUBMITTED", index=True)
    automation_status: Mapped[str] = mapped_column(String(16), default="PENDING", index=True)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    attempt_no: Mapped[int] = mapped_column(Integer, default=1)
    version: Mapped[int] = mapped_column(Integer, default=1)
    scenario: Mapped[str] = mapped_column(String(8), default="TO-BE", index=True)
    data_source: Mapped[str] = mapped_column(String(16), default="demo", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    student: Mapped[Student] = relationship(lazy="joined")
    events: Mapped[list[ProcessEvent]] = relationship(back_populates="request", cascade="all, delete-orphan")


class ProcessEvent(Base):
    __tablename__ = "process_events"
    __table_args__ = (
        UniqueConstraint("case_id", "activity", "lifecycle", "attempt_no", "sequence", name="uq_event_identity"),
        Index("ix_events_filter", "data_source", "scenario", "timestamp"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    request_id: Mapped[str] = mapped_column(ForeignKey("certificate_requests.id", ondelete="CASCADE"), index=True)
    case_id: Mapped[str] = mapped_column(String(40), index=True)
    activity: Mapped[str] = mapped_column(String(64), index=True)
    lifecycle: Mapped[str] = mapped_column(String(16))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    role: Mapped[str] = mapped_column(String(32))
    resource: Mapped[str | None] = mapped_column(String(80), nullable=True)
    scenario: Mapped[str] = mapped_column(String(8), index=True)
    data_source: Mapped[str] = mapped_column(String(16), index=True)
    attempt_no: Mapped[int] = mapped_column(Integer, default=1)
    sequence: Mapped[int] = mapped_column(Integer, default=1)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    request: Mapped[CertificateRequest] = relationship(back_populates="events")


class IdempotencyRecord(Base):
    __tablename__ = "idempotency_records"
    __table_args__ = (UniqueConstraint("scope", "key", name="uq_idempotency_scope_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scope: Mapped[str] = mapped_column(String(120))
    key: Mapped[str] = mapped_column(String(160))
    request_hash: Mapped[str] = mapped_column(String(64))
    status_code: Mapped[int] = mapped_column(Integer)
    response_json: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class OutboxMessage(Base):
    __tablename__ = "outbox_messages"
    __table_args__ = (UniqueConstraint("dedupe_key", name="uq_outbox_dedupe"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    request_id: Mapped[str] = mapped_column(ForeignKey("certificate_requests.id", ondelete="CASCADE"), index=True)
    case_id: Mapped[str] = mapped_column(String(40), index=True)
    event_type: Mapped[str] = mapped_column(String(48), index=True)
    dedupe_key: Mapped[str] = mapped_column(String(200))
    payload_json: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), default="PENDING", index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    available_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)

