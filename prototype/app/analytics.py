from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timezone
from html import escape
import os
from statistics import median

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import CertificateRequest, ProcessEvent


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def summary(db: Session, data_source: str, scenario: str | None = None, as_of: datetime | None = None) -> dict:
    if data_source == "simulated" and as_of is None:
        as_of = datetime.fromisoformat(os.getenv("SIMULATION_SNAPSHOT", "2026-10-01T00:00:00+00:00"))
    query = select(ProcessEvent).where(ProcessEvent.data_source == data_source)
    if scenario:
        query = query.where(ProcessEvent.scenario == scenario)
    if as_of:
        query = query.where(ProcessEvent.timestamp <= as_of)
    events = list(db.scalars(query.order_by(ProcessEvent.case_id, ProcessEvent.timestamp, ProcessEvent.sequence)))
    by_case: dict[str, list[ProcessEvent]] = defaultdict(list)
    for event in events:
        by_case[event.case_id].append(event)
    transitions: Counter[tuple[str, str]] = Counter()
    variants: Counter[str] = Counter()
    processing: dict[str, list[float]] = defaultdict(list)
    waiting: dict[str, list[float]] = defaultdict(list)
    supplemented = 0
    open_cases = []
    now = as_of or datetime.now(timezone.utc)
    default_overdue_hours = int(os.getenv("OVERDUE_HOURS", "48"))
    for case_id, rows in by_case.items():
        completed = [e for e in rows if e.lifecycle == "complete"]
        path = [e.activity for e in completed]
        variants[" → ".join(path)] += 1
        transitions.update(zip(path, path[1:]))
        supplemented += int(any(e.activity == "NEED_SUPPLEMENT" for e in completed))
        starts: dict[tuple[str, int], datetime] = {}
        previous_complete: datetime | None = None
        for event in rows:
            key = (event.activity, event.attempt_no)
            stamp = _aware(event.timestamp)
            if event.lifecycle == "start":
                starts[key] = stamp
                if previous_complete is not None:
                    waiting[event.activity].append(max(0.0, (stamp - previous_complete).total_seconds()))
            elif event.lifecycle == "complete":
                if key in starts:
                    processing[event.activity].append(max(0.0, (stamp - starts[key]).total_seconds()))
                previous_complete = stamp
        terminal = any(e.activity in {"ISSUED", "REJECTED"} and e.lifecycle == "complete" for e in rows)
        if rows and not terminal:
            first = _aware(rows[0].timestamp)
            last = _aware(rows[-1].timestamp)
            stage_age = max(0, (now - last).total_seconds())
            current_activity = rows[-1].activity
            threshold_hours = int(os.getenv(f"OVERDUE_HOURS_{current_activity}", str(default_overdue_hours)))
            open_cases.append({"case_id": case_id, "age_seconds": max(0, (now - first).total_seconds()), "stage_age_seconds": stage_age, "current_activity": current_activity, "overdue_threshold_hours": threshold_hours, "overdue": stage_age > threshold_hours * 3600})
    med = lambda values: round(median(values), 2) if values else 0
    return {
        "data_source": data_source,
        "scenario": scenario,
        "case_count": len(by_case),
        "supplement_rate": round(supplemented / len(by_case), 4) if by_case else 0,
        "transition_frequencies": [{"from": a, "to": b, "count": n} for (a, b), n in sorted(transitions.items())],
        "median_processing_seconds": {k: med(v) for k, v in sorted(processing.items())},
        "median_waiting_seconds": {k: med(v) for k, v in sorted(waiting.items())},
        "variants": [{"path": p, "count": n} for p, n in variants.most_common(10)],
        "open_cases": open_cases,
        "default_overdue_threshold_hours": default_overdue_hours,
        "as_of": now.isoformat(),
        "method_note": "Nguy cơ nghẽn được đánh dấu khi trung vị thời gian chờ hoặc tuổi công đoạn vượt ngưỡng SLA cấu hình; đây không phải kết luận nguyên nhân.",
    }


def process_map_svg(db: Session, data_source: str, scenario: str | None = None) -> str:
    """Discover a DFG with PM4Py, then render a portable SVG without a GUI."""
    try:
        import pandas as pd
        import pm4py
    except ImportError as exc:  # pragma: no cover - dependency is present in Docker
        raise RuntimeError("PM4Py chưa được cài trong môi trường chạy") from exc
    query = select(ProcessEvent).where(ProcessEvent.data_source == data_source, ProcessEvent.lifecycle == "complete")
    if scenario:
        query = query.where(ProcessEvent.scenario == scenario)
    events = list(db.scalars(query.order_by(ProcessEvent.case_id, ProcessEvent.timestamp, ProcessEvent.sequence)))
    if not events:
        raise ValueError("Không có event phù hợp để dựng bản đồ quy trình")
    frame = pd.DataFrame([{"case:concept:name": e.case_id, "concept:name": e.activity, "time:timestamp": _aware(e.timestamp)} for e in events])
    dfg, starts, ends = pm4py.discover_dfg(frame, case_id_key="case:concept:name", activity_key="concept:name", timestamp_key="time:timestamp")
    activities = sorted({name for edge in dfg for name in edge} | set(starts) | set(ends))
    positions = {name: (100 + (index % 4) * 220, 80 + (index // 4) * 140) for index, name in enumerate(activities)}
    height = 180 + ((len(activities) - 1) // 4) * 140
    lines = [f'<svg xmlns="http://www.w3.org/2000/svg" width="920" height="{height}" viewBox="0 0 920 {height}">', '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#64748b"/></marker></defs>', '<rect width="100%" height="100%" fill="#f8fafc"/>']
    for (source, target), count in sorted(dfg.items()):
        x1, y1 = positions[source]; x2, y2 = positions[target]
        lines.append(f'<line x1="{x1 + 75}" y1="{y1 + 25}" x2="{x2 + 75}" y2="{y2 + 25}" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/><text x="{(x1+x2)//2+75}" y="{(y1+y2)//2+16}" font-size="12" fill="#334155">{int(count)}</text>')
    for name in activities:
        x, y = positions[name]; fill = "#ccfbf1" if name in starts else ("#dbeafe" if name in ends else "#ffffff")
        lines.append(f'<rect x="{x}" y="{y}" width="150" height="50" rx="10" fill="{fill}" stroke="#0f766e"/><text x="{x+75}" y="{y+30}" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#0f172a">{escape(name)}</text>')
    lines.append('</svg>')
    return "".join(lines)

