"""Đối chiếu công thức với bộ tính tay ở mục 4.6 của báo cáo (AS-IS C001–C004)."""
import unittest
from datetime import datetime
from workcal import from_local, work_between, add_work, due_after


def m(s):
    return from_local(datetime.strptime(s, '%d/%m %H:%M').replace(year=2026))


class HandCalc(unittest.TestCase):
    def test_t_truong(self):
        # T_trường = c(A11 | A14 | A13) − A01, phút làm việc
        self.assertEqual(work_between(m('02/03 07:30'), m('03/03 16:03')), 843)   # C001
        self.assertEqual(work_between(m('02/03 07:30'), m('05/03 15:13')), 1693)  # C002
        self.assertEqual(work_between(m('03/03 07:30'), m('05/03 15:03')), 1233)  # C003
        self.assertEqual(work_between(m('04/03 07:30'), m('20/03 15:10')), 5740)  # C004

    def test_calendar_hours(self):
        hours = lambda a, b: (m(b) - m(a)) / 60
        self.assertAlmostEqual(hours('02/03 07:30', '03/03 16:03'), 32 + 33 / 60)
        self.assertAlmostEqual(hours('04/03 07:30', '20/03 15:10'), 391 + 40 / 60)

    def test_t_sv_and_wait(self):
        self.assertEqual(work_between(m('02/03 07:30'), m('04/03 09:00')), 990)   # T_SV C001
        self.assertEqual(work_between(m('02/03 07:30'), m('06/03 10:00')), 1950)  # T_SV C002
        self.assertEqual(work_between(m('02/03 10:15'), m('03/03 14:00')), 555)   # chờ A06→A07 C001
        self.assertEqual(work_between(m('04/03 09:45'), m('05/03 14:00')), 585)   # chờ A06→A07 C002

    def test_due_and_detection(self):
        # Hạn bổ sung = 17:00 ngày làm việc thứ 7 sau A04 (C002, C004)
        self.assertEqual(due_after(m('02/03 10:35'), 7), m('11/03 17:00'))
        self.assertEqual(due_after(m('04/03 09:05'), 7), m('13/03 17:00'))
        self.assertEqual(add_work(m('02/03 11:00'), 60), m('02/03 14:00'))
        # C004: trễ phát hiện = s(A13) − due_at; báo cáo dùng due 13/03 17:00
        self.assertEqual(work_between(m('13/03 17:00'), m('20/03 15:00')), 2130)
        # Tuổi tại 13/03 12:00
        self.assertEqual(work_between(m('04/03 07:30'), m('13/03 12:00')), 3390)


if __name__ == '__main__':
    unittest.main()
