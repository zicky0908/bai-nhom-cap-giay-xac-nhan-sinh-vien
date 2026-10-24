"""Bộ sinh event log mô phỏng (DES) cho AS-IS và TO-BE theo mục 4.4 của báo cáo.

DỮ LIỆU MÔ PHỎNG: mọi tham số là giả định để minh họa phương pháp, không phải số đo tại trường.
Dùng CRN: mỗi hồ sơ (pair_id) có luồng ngẫu nhiên riêng default_rng([seed, i]), rút cùng thứ tự
ở mọi cấu hình, nên AS-IS và TO-BE so sánh theo cặp.
"""
import argparse
import heapq
import uuid
from pathlib import Path

import numpy as np
import pandas as pd

from workcal import DAY, WORKDAY, add_work, align, due_after, iso_utc, next_at, work_between

N_CASES = 400
ARRIVAL_DAYS = 60                  # 12 tuần làm việc (02/03–22/05/2026)
HORIZON = 138 * DAY                # chạy tiếp tới hết 17/07/2026 để xả hàng
SEEDS = [20260302 + i for i in range(20)]
NS = uuid.UUID('6f1c2a4e-9b8d-4c1e-8f3a-2d5b7e9a0c11')

DOC_TYPES = ['dang_hoc', 'nvqs', 'vay_von', 'hoc_bong']
DOC_P = [0.40, 0.20, 0.25, 0.15]
P_INELIGIBLE = 0.05
P_REJECT_A06 = 0.03                # origin=A06: approve 97% / reject 3%
P_REJECT_A03 = 0.80                # origin=A03: reject 80% / return 20%
P_NORESP = 0.08
RESP_MEDIAN, PICKUP_MEDIAN, SIGMA = 900, 675, 0.8
P_CENSOR_PICKUP = 0.05
MAX_ROUNDS = 12                    # trần kỹ thuật của mảng rút trước; P(vượt) ~ 0,30 x 0,15^11, không xảy ra

AS_IS_MEDIAN = dict(A02=5, A03=10, A04=3, A06=15, A07=3, A08=2, A09=2, A10=3, A11=3, A13=3, A14=3)
TO_BE_MEDIAN = dict(A03=10, A04=2, A17=5, A07=3, A08=2, A09=2)

CONFIGS = {
    'AS-IS': dict(scenario='AS-IS', sign='batch', p=(0.30, 0.15)),
    **{f'TB-{s}-p{int(p1 * 100)}': dict(scenario='TO-BE', sign='batch' if s == 'S0' else 'daily', p=(p1, p2))
       for s in ('S1', 'S0') for p1, p2 in ((0.15, 0.08), (0.22, 0.11), (0.30, 0.15))},
}
LANES = {'student': 'L1', 'officer': 'L2', 'approver': 'L3', 'clerk': 'L4', 'system': 'L5'}
RESOURCES = {'student': None, 'officer': 'OFF01', 'approver': 'APP01', 'clerk': 'CLK01', 'system': 'SYS01'}


class CaseDraws:
    """Toàn bộ số ngẫu nhiên của một hồ sơ, rút cố định thứ tự để giữ CRN giữa các cấu hình."""

    def __init__(self, seed, i):
        rng = np.random.default_rng([seed, i])
        self.doc_type = DOC_TYPES[int(rng.choice(4, p=DOC_P))]
        self.u_elig, self.u_l3a, self.u_l3b, self.u_ret = rng.random(4)
        self.u_channel, self.u_censor = rng.random(2)
        self.pickup = float(PICKUP_MEDIAN * rng.lognormal(0, SIGMA))
        self.factors = rng.lognormal(0, 0.5, size=(20, 8))   # hệ số xử lý theo (activity, lần)
        self.u_rw = rng.random(MAX_ROUNDS)
        self.u_noresp = rng.random(MAX_ROUNDS)
        self.resp = RESP_MEDIAN * rng.lognormal(0, SIGMA, size=MAX_ROUNDS)


ACT_INDEX = {a: k for k, a in enumerate(
    ['A02', 'A03', 'A04', 'A06', 'A07', 'A08', 'A09', 'A10', 'A11', 'A13', 'A14', 'A17'])}


def arrivals(seed):
    rng = np.random.default_rng([seed, 10 ** 9])
    work = np.sort(rng.uniform(0, ARRIVAL_DAYS * WORKDAY, N_CASES))
    return [add_work(0, float(w)) for w in work]


class Sim:
    def __init__(self, cfg_name, seed):
        self.cfg_name, self.cfg, self.seed = cfg_name, CONFIGS[cfg_name], seed
        self.tobe = self.cfg['scenario'] == 'TO-BE'
        self.median = TO_BE_MEDIAN if self.tobe else AS_IS_MEDIAN
        self.heap, self.n = [], 0
        self.queue, self.officer_free = [], 0.0
        self.l3_free = self.clerk_free = 0.0
        self.events = []

    # ---- hạ tầng sự kiện ----
    def at(self, t, fn, *args):
        self.n += 1
        heapq.heappush(self.heap, (t, self.n, fn, args))

    def log(self, c, t, act, life, role, **extra):
        self.events.append(dict(case=c, t=t, activity=act, lifecycle=life, role=role, **extra))

    def dur(self, c, act):
        k = c['occ'].get(act, 0)
        c['occ'][act] = k + 1
        m = self.median[act]
        return float(np.clip(m * c['d'].factors[ACT_INDEX[act], min(k, 7)], 0.5 * m, 4 * m))

    # ---- cán bộ L2: 1 người, FIFO, chỉ trong giờ làm việc ----
    def officer(self, t, c, act, then, **extra):
        heapq.heappush(self.queue, (t, self.n, c, act, then, extra))
        self.n += 1
        self.dispatch(t)

    def dispatch(self, now):
        if self.officer_free > now or not self.queue:
            return
        if self.queue[0][0] > now:                       # chưa có việc sẵn sàng: không giữ chỗ cán bộ
            self.at(self.queue[0][0], lambda t: self.dispatch(t))
            return
        ready, _, c, act, then, extra = heapq.heappop(self.queue)
        start = align(max(now, ready))
        end = add_work(start, self.dur(c, act))
        self.officer_free = end
        self.log(c, start, act, 'start', 'officer', **extra)
        self.at(end, self.officer_done, c, act, then, extra)

    def officer_done(self, t, c, act, then, extra):
        self.log(c, t, act, 'complete', 'officer', **extra)
        then(t, c)
        self.dispatch(t)

    # ---- luồng nghiệp vụ ----
    def arrive(self, t, c):
        if self.tobe:
            self.log(c, t, 'A01', 'complete', 'student')
            self.log(c, t, 'A15', 'complete', 'system')
            self.log(c, t, 'A02', 'complete', 'system')
            self.officer(t, c, 'A03', self.after_check)
        else:
            day_open = int(t // DAY) * DAY + 450          # GA10: A01 ghi 07:30 ngày nộp
            self.log(c, day_open, 'A01', 'complete', 'student')
            self.officer(t, c, 'A02', lambda t2, c2: self.officer(t2, c2, 'A03', self.after_check))

    def after_check(self, t, c):
        d, r = c['d'], c['round']
        if not c['checked'] and d.u_elig < P_INELIGIBLE:
            c['checked'] = True
            return self.to_l3(t, c, 'A03')
        c['checked'] = True
        p = self.cfg['p'][0 if r == 0 else 1]
        if r < MAX_ROUNDS and d.u_rw[r] < p:
            return self.officer(t, c, 'A04', self.wait_student, reason_code='thieu_ho_so')
        self.draft(t, c)

    def draft(self, t, c):
        if self.tobe:
            self.log(c, t, 'A06', 'complete', 'system')
            self.officer(t, c, 'A17', lambda t2, c2: self.to_l3(t2, c2, 'A06'))
        else:
            self.officer(t, c, 'A06', lambda t2, c2: self.to_l3(t2, c2, 'A06'))

    def wait_student(self, t, c):
        d, r = c['d'], c['round']
        due = due_after(t, 7)
        self.events[-1]['due_at'] = due                   # ghi due_at vào event c(A04)
        resp_at = add_work(t, float(d.resp[r]))
        responds = d.u_noresp[r] >= P_NORESP and resp_at <= due
        if self.tobe:
            remind = due_after(t, 5)
            if not responds or resp_at > remind:
                self.at(remind, lambda t2, c2: self.log(c2, t2, 'A16', 'complete', 'system'), c)
        if responds:
            self.at(resp_at, self.resubmit, c)
        elif self.tobe:
            self.at(due, self.expire_tobe, c, due)
        else:
            sweep = next_at(due, 900, weekdays=(4,))     # GA8: rà thứ Sáu 15:00
            self.at(sweep, lambda t2, c2: self.officer(t2, c2, 'A13', self.close, due_at=due), c)

    def resubmit(self, t, c):
        self.log(c, t, 'A05', 'complete', 'student')
        c['round'] += 1
        self.officer(t, c, 'A03', self.after_check)

    def expire_tobe(self, t, c, due):
        self.log(c, due, 'A13', 'start', 'system', due_at=due)
        self.log(c, due, 'A13', 'complete', 'system', due_at=due)
        self.close(t, c)

    def close(self, t, c):
        c['end'] = 'E3'

    def to_l3(self, t, c, origin):
        sessions = ((630, range(5)), (960, range(5))) if self.cfg['sign'] == 'daily' else ((840, (1, 3)),)
        session = min(next_at(t, clock, days) for clock, days in sessions)
        start = align(max(session, self.l3_free))
        end = add_work(start, self.dur(c, 'A07'))
        d = c['d']
        if origin == 'A03':
            decision = 'reject' if d.u_ret < P_REJECT_A03 else 'return'
        else:
            u = d.u_l3b if c['returned'] else d.u_l3a
            decision = 'reject' if u < P_REJECT_A06 else 'approve'
        # AS-IS: L3 ghi lý do từ chối (A10) ngay sau A07, trong cùng lượt giữ tài nguyên L3
        a10_end = add_work(end, self.dur(c, 'A10')) if decision == 'reject' and not self.tobe else None
        self.l3_free = a10_end or end
        self.log(c, start, 'A07', 'start', 'approver', origin=origin)
        self.log(c, end, 'A07', 'complete', 'approver', origin=origin, decision=decision,
                 reason_code='khong_du_tu_cach' if decision == 'reject' and origin == 'A03' else
                 ('ly_do_khac' if decision == 'reject' else None))
        if decision == 'approve':
            self.at(end, self.to_clerk, c)
        elif decision == 'return':
            c['returned'] = True
            self.at(end, self.draft, c)
        elif self.tobe:
            self.at(end, self.reject, c)
        else:
            self.log(c, end, 'A10', 'start', 'approver')
            self.log(c, a10_end, 'A10', 'complete', 'approver')
            self.at(a10_end, self.reject, c)

    def reject(self, t, c):
        if self.tobe:
            self.log(c, t, 'A14', 'complete', 'system')
            c['end'] = 'E2'
        else:
            self.officer(t, c, 'A14', lambda t2, c2: c2.update(end='E2'))

    def to_clerk(self, t, c):
        start = max(next_at(t, 900 if self.tobe else 990), self.clerk_free)
        start = align(start)
        end = add_work(start, self.dur(c, 'A08'))
        self.clerk_free = end
        self.log(c, start, 'A08', 'start', 'clerk')
        self.log(c, end, 'A08', 'complete', 'clerk')
        self.at(end, lambda t2, c2: self.officer(t2, c2, 'A09', self.notify_issued), c)

    def notify_issued(self, t, c):
        if self.tobe:
            self.log(c, t, 'A11', 'complete', 'system')
            self.pickup(t, c)
        else:
            self.officer(t, c, 'A11', self.pickup)

    def pickup(self, t, c):
        c['end'] = 'issued'
        if c['d'].u_censor >= P_CENSOR_PICKUP:
            self.at(add_work(t, c['d'].pickup), self.picked, c)

    def picked(self, t, c):
        self.log(c, t, 'A12', 'complete', 'student')
        c['end'] = 'E1'

    # ---- chạy ----
    def run(self):
        prefix = 'TB' if self.tobe else 'AS'
        cases = []
        for i, t in enumerate(arrivals(self.seed)):
            d = CaseDraws(self.seed, i)
            c = dict(pair_id=i + 1, case_id=f'{prefix}-P{i + 1:04d}', d=d, round=0, occ={},
                     checked=False, returned=False, end=None, arrival=t)
            cases.append(c)
            self.at(t, self.arrive, c)
        while self.heap:
            t, _, fn, args = heapq.heappop(self.heap)
            if t > HORIZON:
                break
            fn(t, *args)
        return self.to_frame(cases)

    def to_frame(self, cases):
        rows = []
        order = {}
        for e in self.events:
            if e['t'] > HORIZON:
                continue
            c = e['case']
            order.setdefault(c['case_id'], []).append(e)
        for c in cases:
            # sort ổn định theo t: khi trùng giờ giữ thứ tự ghi (start trước complete, bước trước bước sau)
            evs = sorted(order.get(c['case_id'], []), key=lambda e: e['t'])
            rounds, last = 0, None
            for seq, e in enumerate(evs, 1):
                ts = round(e['t'] * 60)                          # giây
                if last is not None and ts <= last:
                    ts = last + 1                                # +1 giây giữ thứ tự theo seq
                last = ts
                role = e['role']
                rows.append(dict(
                    event_id=str(uuid.uuid5(NS, f"{self.cfg_name}|{self.seed}|{c['pair_id']}|{seq}|{e['activity']}|{e['lifecycle']}")),
                    pair_id=c['pair_id'], seq=seq, case_id=c['case_id'], activity=e['activity'],
                    lifecycle=e['lifecycle'], timestamp=iso_utc(ts / 60), t_min=ts / 60,
                    resource=RESOURCES[role] or f"SV{c['pair_id']:04d}", role=role, lane=LANES[role],
                    scenario=self.cfg['scenario'], cfg=self.cfg_name, seed=self.seed, data_origin='simulated',
                    doc_type=c['d'].doc_type,
                    channel='web' if self.tobe else ('paper' if c['d'].u_channel < 0.6 else 'form'),
                    rework_round=rounds, decision=e.get('decision'), origin=e.get('origin'),
                    reason_code=e.get('reason_code'),
                    due_at=iso_utc(e['due_at']) if e.get('due_at') is not None else None,
                    arrival_true=iso_utc(c['arrival']) if e['activity'] == 'A01' else None,
                ))
                if e['activity'] == 'A04' and e['lifecycle'] == 'complete':
                    rounds += 1
        return pd.DataFrame(rows)


def simulate(cfg_name, seed):
    return Sim(cfg_name, seed).run()


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--out', default='out')
    ap.add_argument('--seeds', type=int, default=len(SEEDS))
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(exist_ok=True)
    frames = []
    for cfg in CONFIGS:
        for seed in SEEDS[:args.seeds]:
            frames.append(simulate(cfg, seed))
    log = pd.concat(frames, ignore_index=True)
    log.to_parquet(out / 'eventlog_all.parquet', index=False) if _has_parquet() else None
    main_log = log[(log.seed == SEEDS[0]) & log.cfg.isin(['AS-IS', 'TB-S1-p15'])]
    main_log.drop(columns=['t_min']).to_csv(out / f'eventlog_seed{SEEDS[0]}.csv', index=False)
    log.to_pickle(out / 'eventlog_all.pkl')
    print(f'{len(log)} events, {log.case_id.nunique()} case ids, {len(frames)} runs')


def _has_parquet():
    try:
        import pyarrow  # noqa: F401
        return True
    except ImportError:
        return False


if __name__ == '__main__':
    main()
