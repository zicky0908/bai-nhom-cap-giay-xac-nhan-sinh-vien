"""Kiểm tra hợp lệ log mô phỏng (R2, R4′, R5) và công thức KPI trên ca tính tay C001."""
import unittest
from datetime import datetime

import pandas as pd

import analyze
import simulate
from workcal import from_local


class LogRules(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.logs = {cfg: simulate.simulate(cfg, simulate.SEEDS[0]) for cfg in ('AS-IS', 'TB-S1-p15', 'TB-S0-p30')}

    def test_r5_start_before_complete(self):
        for cfg, log in self.logs.items():
            for cid, case in log.groupby('case_id'):
                self.assertTrue(case.t_min.is_monotonic_increasing, (cfg, cid))
                open_ = {}
                for r in case.itertuples():
                    if r.lifecycle == 'start':
                        self.assertNotIn(r.activity, open_, (cfg, cid, r.activity))
                        open_[r.activity] = r.t_min
                    elif r.activity in open_:
                        self.assertGreaterEqual(r.t_min, open_.pop(r.activity), (cfg, cid))
                self.assertEqual(open_, {}, (cfg, cid))

    def test_r2_stamp_only_after_approve(self):
        for cfg, log in self.logs.items():
            comp = log[log.lifecycle == 'complete']
            for cid, case in comp.groupby('case_id'):
                acts = list(case.activity)
                if 'A08' in acts:
                    a07 = case[case.activity == 'A07'].decision.tolist()
                    self.assertEqual(a07[-1], 'approve', (cfg, cid))

    def test_r4_prime_timer_on_due(self):
        log = self.logs['TB-S1-p15']
        a13 = log[(log.activity == 'A13') & (log.lifecycle == 'start')]
        self.assertGreater(len(a13), 0)
        for r in a13.itertuples():
            self.assertLessEqual(abs(pd.Timestamp(r.timestamp) - pd.Timestamp(r.due_at)).total_seconds(), 60)

    def test_officer_queue_stable(self):
        # Cán bộ bận ~64% thời gian: chờ tiếp nhận A02 không được tích tụ theo tuần (lỗi giữ chỗ tác vụ tương lai)
        for seed in simulate.SEEDS[:5]:
            log = simulate.simulate('AS-IS', seed)
            a02 = log[(log.activity == 'A02') & (log.lifecycle == 'start')].set_index('case_id').t_min
            arr = log[log.activity == 'A01'].set_index('case_id').arrival_true
            waits = [analyze.work_between(from_local(pd.Timestamp(arr[c]).tz_convert('Asia/Ho_Chi_Minh').tz_localize(None)), a02[c])
                     for c in a02.index]
            self.assertLess(pd.Series(waits).quantile(0.9), 900, seed)

    def test_crn_same_arrivals_and_doc_types(self):
        a, b = self.logs['AS-IS'], self.logs['TB-S1-p15']
        first = lambda log: log[log.activity == 'A01'].set_index('pair_id')[['arrival_true', 'doc_type']]
        pd.testing.assert_frame_equal(first(a), first(b))


def ev(act, life, when, role, **kw):
    t = from_local(datetime.strptime(when, '%d/%m %H:%M').replace(year=2026))
    return dict(case_id='C001', pair_id=1, activity=act, lifecycle=life, t_min=t, role=role,
                decision=kw.get('decision'), due_at=None)


class CaseMetricsC001(unittest.TestCase):
    def test_c001(self):
        rows = [ev('A01', 'complete', '02/03 07:30', 'student')]
        for act, s, c, role in [('A02', '02/03 08:00', '02/03 08:05', 'officer'),
                                ('A03', '02/03 09:00', '02/03 09:10', 'officer'),
                                ('A06', '02/03 10:00', '02/03 10:15', 'officer'),
                                ('A07', '03/03 14:00', '03/03 14:05', 'approver'),
                                ('A08', '03/03 15:00', '03/03 15:02', 'clerk'),
                                ('A09', '03/03 15:30', '03/03 15:32', 'officer'),
                                ('A11', '03/03 16:00', '03/03 16:03', 'officer')]:
            rows += [ev(act, 'start', s, role), ev(act, 'complete', c, role, decision='approve' if act == 'A07' else None)]
        rows.append(ev('A12', 'complete', '04/03 09:00', 'student'))
        m = analyze.case_metrics(pd.DataFrame(rows))
        self.assertEqual(m['t_truong'], 843)
        self.assertEqual(m['t_sv'], 990)
        self.assertEqual(m['wait_a07'], 555)
        self.assertEqual(m['l2_proc'], 5 + 10 + 15 + 2 + 3)   # phút làm việc, không tính giờ nghỉ


class Direct(unittest.TestCase):
    def test_net_age_c004(self):
        # C004 (mục 4.6): tại 13/03 12:00 tuổi gross 3390, net 95 (SV đang trong hạn bổ sung)
        row = pd.Series(dict(a01=ev('A01', 'c', '04/03 07:30', 's')['t_min'],
                             sv_windows=[(ev('A04', 'c', '04/03 09:05', 'o')['t_min'], ev('A04', 'c', '13/03 17:00', 'o')['t_min'])]))
        gross, net = analyze.net_age(row, ev('X', 'c', '13/03 12:00', 'o')['t_min'])
        self.assertEqual((gross, net), (3390, 95))

    def test_dispatch_never_reserves_future_task(self):
        sim = simulate.Sim('AS-IS', simulate.SEEDS[0])
        case = dict(case_id='X', d=simulate.CaseDraws(simulate.SEEDS[0], 0), occ={})
        future = 600.0                                     # thứ Hai 10:00
        simulate.heapq.heappush(sim.queue, (future, 0, case, 'A03', lambda t, c: None, {}))
        sim.dispatch(480.0)                                # 08:00: việc chưa sẵn sàng
        self.assertEqual(sim.officer_free, 0.0)
        self.assertEqual(sim.events, [])
        simulate.heapq.heappush(sim.queue, (480.0, 1, case, 'A02', lambda t, c: None, {}))
        sim.dispatch(480.0)                                # việc sẵn sàng chạy ngay, việc tương lai vẫn chờ
        self.assertEqual(sim.events[0]['activity'], 'A02')
        self.assertEqual(sim.events[0]['t'], 480.0)


if __name__ == '__main__':
    unittest.main()
