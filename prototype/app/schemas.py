from __future__ import annotations

from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator


class SubmitRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    student_id: str = Field(min_length=3, max_length=32, validation_alias=AliasChoices("student_id", "student_code"))
    full_name: str = Field(min_length=2, max_length=160)
    email: str = Field(min_length=5, max_length=255)
    purpose: str = Field(min_length=3, max_length=500)
    delivery_method: str = Field(default="pickup", pattern="^(pickup|email)$")


class TransitionInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_status: str = Field(validation_alias=AliasChoices("target_status", "action"))
    actor: str = "n8n"
    reason: str | None = Field(default=None, max_length=2000)
    expected_version: int | None = Field(default=None, ge=1)
    resource: str | None = Field(default=None, max_length=80)


class CallbackInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    automation_status: str = Field(validation_alias=AliasChoices("automation_status", "status"))
    mailpit_id: str | None = Field(default=None, max_length=200, validation_alias=AliasChoices("mailpit_id", "message_id"))
    error: str | None = Field(default=None, max_length=2000)
    notification_type: str = Field(default="result", max_length=48)

    @field_validator("automation_status", mode="before")
    @classmethod
    def normalize_status(cls, value: str) -> str:
        normalized = str(value).upper()
        aliases = {"SUCCESS": "SYNCED", "SENT": "SYNCED", "ERROR": "FAILED"}
        normalized = aliases.get(normalized, normalized)
        if normalized not in {"SYNCED", "FAILED"}:
            raise ValueError("status phải là SYNCED/SUCCESS hoặc FAILED/ERROR")
        return normalized


class RequestView(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    case_id: str
    student_id: str
    purpose: str
    delivery_method: str
    status: str
    automation_status: str
    reason: str | None
    attempt_no: int
    version: int
    scenario: str
    data_source: str
    created_at: datetime
    updated_at: datetime

