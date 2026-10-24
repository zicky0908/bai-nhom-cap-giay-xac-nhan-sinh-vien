"""Lịch làm việc GA1: T2–T6, 07:30–11:30 và 13:30–17:00, giờ Asia/Ho_Chi_Minh.

Thời gian nội bộ là số phút (float) kể từ T0 = 2026-03-02 00:00 giờ địa phương (thứ Hai).
Không có ngày lễ (giới hạn đã công bố trong báo cáo).
"""
from datetime import datetime, timedelta, timezone

T0 = datetime(2026, 3, 2)  # naive, giờ địa phương
TZ = timezone(timedelta(hours=7))
DAY = 1440
SHIFTS = ((450, 690), (810, 1020))  # 07:30–11:30, 13:30–17:00
WORKDAY = sum(b - a for a, b in SHIFTS)  # 450


def is_workday(day):
    return day % 7 < 5  # T0 là thứ Hai


def align(t):
    """Thời điểm làm việc sớm nhất >= t."""
    day = int(t // DAY)
    while True:
        if is_workday(day):
            for a, b in SHIFTS:
                start, end = day * DAY + a, day * DAY + b
                if t < end:
                    return max(t, start)
        day += 1
        t = day * DAY


def add_work(t, minutes):
    """Cộng `minutes` phút làm việc vào t (t được căn vào giờ làm trước)."""
    t = align(t)
    while True:
        day = int(t // DAY)
        for a, b in SHIFTS:
            end = day * DAY + b
            if day * DAY + a <= t < end:
                if t + minutes <= end:
                    return t + minutes
                minutes -= end - t
                t = align(end)
                break
        else:
            t = align(t)


def work_between(t1, t2):
    """Số phút làm việc trong [t1, t2); âm nếu t2 < t1."""
    if t2 < t1:
        return -work_between(t2, t1)
    total, day = 0.0, int(t1 // DAY)
    while day * DAY < t2:
        if is_workday(day):
            for a, b in SHIFTS:
                lo, hi = max(t1, day * DAY + a), min(t2, day * DAY + b)
                if hi > lo:
                    total += hi - lo
        day += 1
    return total


def due_after(t, workdays):
    """Hạn = 17:00 của ngày làm việc thứ `workdays` sau ngày chứa t (quy ước của mục 4.6)."""
    day = int(t // DAY)
    while workdays:
        day += 1
        workdays -= is_workday(day)
    return day * DAY + SHIFTS[-1][1]


def next_at(t, clock, weekdays=range(5)):
    """Thời điểm sớm nhất >= t rơi đúng giờ `clock` (phút trong ngày) vào các thứ cho trước."""
    day = int(t // DAY)
    while True:
        cand = day * DAY + clock
        if day % 7 in weekdays and cand >= t:
            return cand
        day += 1


def to_local(t):
    return T0 + timedelta(minutes=t)


def from_local(dt):
    return (dt - T0).total_seconds() / 60


def iso_utc(t):
    return to_local(t).replace(tzinfo=TZ).astimezone(timezone.utc).isoformat(timespec='seconds')
