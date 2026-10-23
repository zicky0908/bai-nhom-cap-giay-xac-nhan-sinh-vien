# Process Mining trên dữ liệu mô phỏng

**Dữ liệu mô phỏng.** Mọi tham số là giả định (mục 4.4 của báo cáo), không phải số đo tại trường. Kết quả không chứng minh hiệu quả thực tế.

## Chạy lại

```bash
cd analysis
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m unittest test_handcalc test_sim   # đối chiếu tính tay + quy tắc hợp lệ log
.venv/bin/python analyze.py                           # 7 cấu hình × 20 seed, khoảng 5 phút
```

Cùng seed cho ra cùng log (seed 20260302…20260321, CRN theo từng hồ sơ).

## File

| File | Nội dung |
|---|---|
| `workcal.py` | Lịch làm việc GA1 (450 phút/ngày), cộng/trừ phút làm việc, hạn bổ sung |
| `simulate.py` | Bộ mô phỏng sự kiện rời rạc AS-IS / TO-BE S0, S1 × 3 mức p |
| `analyze.py` | KPI (pandas), DFG và biến thể (PM4Py), tô màu ứng viên nghẽn, biểu đồ |
| `test_handcalc.py`, `test_sim.py` | Bộ tính tay mục 4.6; R2, R4′, R5; CRN; KPI trên ca C001 |
| `out/eventlog_seed20260302.csv` | Event log xuất để kiểm tra độc lập (AS-IS + TO-BE S1 p 0,15) |
| `out/results.md` | Bảng KPI, hiệu theo cặp, cạnh chờ, biến thể |
| `out/*.png` | DFG AS-IS/TO-BE, KPI so sánh, chờ/xử lý theo bước |

## Quy ước đã chọn

- Chờ của trường = s(bước) − c(bước trước), phút làm việc. Cạnh đi vào A05, A12 (thời gian SV), A16, A13 (timer, cửa sổ bổ sung) không xếp hạng ứng viên nghẽn; trễ phát hiện quá hạn đo riêng (`detect_delay_med`).
- Tô màu: đỏ khi đạt cả (a) trung vị chờ thuộc top 3 cạnh của trường, (b) ≥ 50% số ca qua cạnh chờ > 450 phút, (f) cạnh xuất hiện ở ≥ 10% số ca; vàng khi chỉ đạt (a).
- Hạn bổ sung = 17:00 ngày làm việc thứ 7 sau A04 (như mục 4.6). A01 làm tròn về 07:30 cho cả hai kịch bản (GA10).
- K5 dùng tuổi net (trừ thời gian SV); K5b là bản gross.
- TO-BE: văn thư xử lý lúc 15:00 hằng ngày (mục 4.4), nên giấy ký khung 16:00 được đóng dấu 15:00 hôm sau.
- Không có ngày lễ trong lịch (30/4, 1/5 chưa được loại trừ).
- PM4Py dùng cho `discover_dfg` và `get_variants`; DFG được vẽ bằng matplotlib vì máy chưa cài Graphviz.
