from __future__ import annotations

from dataclasses import dataclass


class TransitionError(ValueError):
    pass


class ActorError(PermissionError):
    pass


@dataclass(frozen=True)
class Rule:
    actor: str
    reason_required: bool = False
    increment_attempt: bool = False


RULES: dict[tuple[str, str], Rule] = {
    ("SUBMITTED", "PRECHECK_OK"): Rule("n8n"),
    ("SUBMITTED", "NEED_SUPPLEMENT"): Rule("n8n", reason_required=True),
    ("PRECHECK_OK", "IN_REVIEW"): Rule("staff"),
    ("IN_REVIEW", "NEED_SUPPLEMENT"): Rule("staff", reason_required=True),
    ("IN_REVIEW", "APPROVED"): Rule("staff"),
    ("IN_REVIEW", "REJECTED"): Rule("staff", reason_required=True),
    ("NEED_SUPPLEMENT", "SUBMITTED"): Rule("student", increment_attempt=True),
    ("APPROVED", "ISSUED"): Rule("staff"),
}


def validate_transition(current: str, target: str, actor: str, reason: str | None) -> Rule:
    rule = RULES.get((current, target))
    if rule is None:
        raise TransitionError(f"Không thể chuyển từ {current} sang {target}")
    if rule.actor != actor:
        raise ActorError(f"Vai trò {actor} không được phép thực hiện chuyển trạng thái này")
    if rule.reason_required and not (reason or "").strip():
        raise ValueError("Phải nhập lý do")
    return rule

