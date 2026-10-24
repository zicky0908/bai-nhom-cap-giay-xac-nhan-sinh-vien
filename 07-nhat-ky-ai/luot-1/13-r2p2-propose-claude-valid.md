# Vòng 2 – Pass 2 (propose): mục 4–5, bản cải tiến
> **DỮ LIỆU MÔ PHỎNG**: mọi tham số là giả định, không phải số đo tại trường. Bản này sửa bản propose pass 1 theo 13 điểm phản biện (D5/C1 và các điểm 5–13). Bản tổng hợp pass 1 bị lỗi độ dài nên không có để kế thừa.

## 4. Process Mining
### 4.1 Schema (mỗi dòng là 1 event)
| Trường | Ghi chú |
|---|---|
| event_id | uuid5(NS, scenario+pair_id+seq+activity+lifecycle), tái lập được |
| pair_id | P0001…, khóa ghép ca AS-IS↔TO-BE (CRN) |
| case_id | AS-P0001 / TB-P0001 (GA9) |
| activity, lifecycle | A01–A17 (D6); start/complete |
| timestamp | ISO 8601 UTC, hiển thị Asia/Ho_Chi_Minh |
| resource, role | OFF01/officer…, SYS01/system |
| scenario, cfg | AS-IS/TO-BE; mã cấu hình, ví dụ TB-S1-p15 |
| data_origin | simulated / demo |
| doc_type, channel | dang_hoc/nvqs/vay_von/hoc_bong; paper/form/web |
| rework_round | số A04 đã có trước event |
| decision, origin | chỉ có ở A07 (D4) |
| reason_code, due_at | ở A03/A04/A07; due_at ghi ở A04 |
| seed | int |
CSV sắp theo (scenario, pair_id, seq), timestamp đến giây, nên cùng seed cho cùng SHA-256.

### 4.2 Công thức
Đơn vị: phút làm việc theo GA1 (450 phút/ngày), báo kèm giờ lịch.
- Xử lý = c(Ai)−s(Ai). Chờ của trường = s(Ai)−c(event liền trước).
- Thời gian của SV = c(A04)→c(A05) và c(A11)→c(A12); không tính là chờ của trường.
- T_trường, T_SV: như mục 1. T_trường_net = T_trường − thời gian của SV.
- Tồn tại thời điểm t: A01 ≤ t và chưa có c(A11/A13/A14); hồ sơ «đã cấp, chưa nhận» đếm riêng.
- Tuổi gross = t−A01; tuổi net = gross − thời gian chờ SV.
- **Quá hạn chính:** tuổi net > GA4 (2250 phút). Quá hạn phụ: tuổi gross > GA4. Quá hạn bổ sung: t > due_at.
- Tỷ lệ bổ sung = số ca có ≥1 A04 / tổng số ca. Số vòng = count(A04).
- Biến thể = chuỗi các event complete. Khi so AS-IS/TO-BE: bỏ A15/A16, gộp A06+A17 thành A06, gộp A07(reject)+A10 thành A07(reject).
- Trễ phát hiện = s(A13)−due_at.

### 4.3 PM4Py và tô màu (chốt trước khi chạy, công bố cùng seed)
- `format_dataframe` → lọc complete → `discover_dfg`, `discover_performance_dfg` (giờ lịch), `get_variants`. Thời gian theo giờ làm việc tính bằng pandas; ghi rõ đơn vị trên mỗi hình.
- **Đỏ** khi đủ cả ba: (a) trung vị chờ thuộc top 3; (b) ≥50% số ca qua cạnh có chờ > 450 phút; (f) tần suất ≥10% số ca. **Vàng** khi chỉ đạt (a).
- Nhãn «phân tán» khi P90/trung vị > 3; thay cho phép so trung vị–P90 của vòng 1.
- (e) được đáp ứng sẵn vì đo theo phút làm việc.
- Nhãn là «ứng viên nghẽn», không ghi nguyên nhân.

### 4.4 Bộ sinh dữ liệu (DES, numpy.default_rng)
- **Kỳ:** ca đến trong 12 tuần (02/03–22/05/2026), chạy thêm 8 tuần (đến 17/07) để xả hàng. Báo theo cohort tuần đến, kèm số ca còn mở cuối kỳ (cắt phải).
- **CRN:** mỗi pair_id rút trước các giá trị: thời điểm đến (phút), doc_type, U_elig, U_rw[1..5], độ trễ phản hồi của SV mỗi vòng, U_noresp, U_L3, độ trễ nhận giấy, hệ số xử lý. Vòng r phải bổ sung khi U_rw[r] < p_r, nên tập ca bổ sung của TO-BE ⊆ tập của AS-IS.
- **A01:** AS-IS làm tròn về 07:30 (GA10), TO-BE ghi phút thật. Bảng chính dùng bản làm tròn cho cả hai; TO-BE báo thêm bản theo phút.

| Tham số | AS-IS | TO-BE | Lý do |
|---|---|---|---|
| Số ca | 400, Poisson ~6,7 ca/ngày | giữ | cùng cơ sở so sánh |
| doc_type | 40/20/25/15% | giữ | giả định |
| Không đủ tư cách | 5% | giữ | thuộc tính của SV |
| A07, origin=A06 | approve 97/reject 3% | giữ | L3 vẫn quyết |
| A07, origin=A03 | reject 80/return 20% | giữ | L3 có thể bác kết luận ở G1 (D4) |
| Phản hồi SV | lognormal, trung vị 900 phút, σ 0,8; 8% không phản hồi | giữ | hành vi của SV |
| A11→A12 | lognormal, trung vị 675 phút, σ 0,8 | giữ | |
| Xử lý L2–L4 | lognormal σ 0,5, cắt trong [0,5m; 4m]; m: A02 5, A03 10, A06 15, A07 3, A08/A09 2, A04/A11/A13/A14 3 | bước SYS = 0; A17 5; A04 2 | tự động hóa |
| p bổ sung (lần 1/lần sau) | 0,30/0,15 | 0,15/0,08; độ nhạy 0,22 và 0,30 | chưa có căn cứ |
| L2 | 1 người, FIFO | giữ | GA2 |
| Lịch ký L3 | lô T3/T5 lúc 14:00 | S1: 10:30 và 16:00 hằng ngày; S0: giữ lô T3/T5 | H1; S0 tách riêng tác động |
| L3→L4 | lô 16:30 | L4 xử lý lúc 15:00 sau khi được báo | H4 |
| Quá hạn | rà thứ Sáu 15:00 | timer đúng due_at | P4 |

- σ = 0,5 cho P90 ≈ 1,9 lần trung vị (việc hành chính ổn định); σ = 0,8 cho P90 ≈ 2,8 lần (hành vi SV phân tán).
- A16 không thay đổi hành vi của SV trong mô hình.
- **Lưới chạy:** AS-IS và TO-BE {S0, S1} × {p 0,30; 0,22; 0,15}, tổng 7 cấu hình × 20 seed (20260302 đến +19). Báo trung vị và khoảng min–max giữa các seed; không chọn seed đẹp.

### 4.5 Kết quả (gắn nhãn «Dữ liệu mô phỏng»)
- DFG tần suất và DFG thời gian; top 5 biến thể.
- Tỷ lệ bổ sung và phân bố số vòng; cột chồng chờ/xử lý.
- Tồn và tuổi hồ sơ theo tuần; quá hạn net/gross tại mốc t.
- Bảng AS-IS/TO-BE (trung vị, P90) cho: T_trường, T_trường_net, T_SV, chờ trước A07, tỷ lệ bổ sung, tỷ lệ E3, trễ phát hiện. Có cột S0/S1 và cột độ nhạy p.

### 4.6 Tính tay
**AS-IS C001–C004:** giữ nguyên bản pass 1 (đã tính lại khớp: 843/1693/1233/5740 phút). Bổ sung:
- C004 tại mốc 13/03 12:00: tuổi gross 3390 phút, quá hạn phụ; tuổi net 95 phút, **không** quá hạn chính.
- C003 có origin=A03, rơi vào nhánh reject.

**TO-BE:** giữ nguyên các mốc L2 để cô lập tác động; độ trễ của SV giống AS-IS (CRN).
- **TB-C002:**
  - 02/03: A01/A15/A02 complete 07:30; A03 10:00–10:10; A04 10:30–10:35 (due 11/03 17:00).
  - 04/03: A05c 08:00; A03 09:00–09:08; A06c 09:08; A17 09:30–09:35; A07 10:30–10:34; A08 15:00–15:02; A09 15:30–15:32; A11c 15:32.
  - 05/03: A12c 10:19 (cùng độ trễ 257 phút như AS-IS).
  - Kết quả: T_trường 1262 phút (AS-IS 1693); T_SV 1519 (AS-IS 1950); chờ A17→A07 55 (AS-IS A06→A07 585).
- **TB-C004:**
  - 04/03: A01/A15/A02 complete 07:30; A03 08:30–08:40; A04 09:00–09:05 (due 13/03 17:00).
  - 11/03: A16c 17:00. 13/03: A13c 17:00.
  - Kết quả: T_trường 3600 phút (AS-IS 5740); trễ phát hiện 0 (AS-IS 2130); đạt R4′.

## 5. TO-BE
**Lane:** L1 SV, L2 cán bộ, L3 duyệt, L4 văn thư, L5 hệ thống (web + n8n).
| Mã | Hoạt động | Lane | Đi tới | Log |
|---|---|---|---|---|
| A01 | Nộp form web, checklist theo loại giấy | L1 | A15 | C |
| A15 | Kiểm tra định dạng | L5 | G0: lỗi → báo trên form, không tạo case (đếm riêng); đạt → A02 | C |
| A02 | Tạo mã hồ sơ, gửi email xác nhận | L5 | A03 | C |
| A03 | Kiểm tra tư cách theo checklist, chọn mã lý do | L2 | G1: đủ → A06; thiếu → A04; không đủ tư cách → A07 | S+C |
| A04 | Chọn mục thiếu, bấm gửi; SYS gửi email mẫu kèm link | L2 | G3 | S+C |
| G3 | Event-based: SV nộp → A05; timer due−2 ngày làm việc → A16 → G3 (1 lần); timer due → A13 | L5 | | – |
| A16 | Nhắc hạn | L5 | G3 | C |
| A05 | SV bổ sung qua link | L1 | A03 | C |
| A06 | Sinh giấy từ mẫu | L5 | A17 | C |
| A17 | Rà giấy | L2 | A07 | S+C |
| A07 | start: mở hồ sơ trong khung ký; complete: ký bản in và chọn quyết định, reject bắt buộc có lý do | L3 | G2: approve → A08; reject → A14; return → A06 (chỉ khi origin=A03) | S+C |
| A08 | Đóng dấu (L4 được báo tự động) | L4 | A09 | S+C |
| A09 | Xác nhận đã cấp | L2 | A11 | S+C |
| A11/A14/A13 | Email thử nghiệm qua Mailpit | L5 | A12→E1 / E2 / E3 | C |

**Đối chiếu AS-IS → nguyên nhân → TO-BE:**
- Đơn giấy (P2, H2) → form + A15: kiểm soát lại.
- Sổ tay (H3, P1) → mã hồ sơ tự động: tự động hóa.
- Báo bổ sung mơ hồ (H2, P5) → email mẫu: tự động hóa.
- Rà quá hạn thứ Sáu (P4) → timer + A16: tự động hóa.
- Soạn giấy tay (H1) → A06 SYS + A17: tự động hóa.
- Ký theo lô (H1) → 2 khung giờ, cảnh báo khi chờ > 450 phút: kiểm soát lại.
- A07→A08 (H4) → báo L4 ngay: kiểm soát lại.
- A10 → gộp vào A07: loại bỏ.
- Gọi điện báo kết quả (P5) → email có lưu vết: tự động hóa.

**Không đổi:** L3 quyết định; ký và đóng dấu bản giấy; A12; tiêu chí tư cách.

**Kiểm tra hợp lệ log TO-BE:**
- R3′: A07 có decision=reject phải có reason_code và đi tới A14.
- R4′: s(A13) = due_at, sai lệch ±1 phút.
- R7: mỗi mã thuộc đúng 1 lane.
- R8: tối đa 1 A16 mỗi vòng.

**Cách vẽ:** 5 lane; G3 vẽ bằng ký hiệu event-based gateway, có 3 nhánh.

---
Limitations:
- D5/C1 vẫn mở trong ledger. Văn bản đã xử lý đủ 4 điểm của C1: tách tham số A07 theo origin; event_id dùng uuid5; khóa ghép pair_id và U_rw cho từng ca/vòng; thêm 8 tuần xả hàng và báo theo cohort. Người phản biện cần xác nhận và resolve C1. D1/C1 vẫn mở, chỉ antigravity được giải quyết.
- Tất cả tham số ở 4.4 đều là giả định chưa có cơ sở: 80/20% ở origin=A03, σ 0,5/0,8, lô 16:30, trung vị 675 phút, 8 tuần xả hàng. Hai nguồn chính tạo ra mức cải thiện là lịch ký S1 và p của TO-BE, nên bắt buộc trình bày cùng S0 và độ nhạy p. Ngưỡng tô màu và GA4 phải chốt trước khi chạy.
- Các ca TO-BE (TB-C002, TB-C004) và tuổi net 95 phút do người đề xuất tự tính tay, người phản biện cần tính lại. TB-C002 giả định L2 giữ nguyên mốc thời gian. Trong mô phỏng thật, L2 làm FIFO nên các mốc sẽ khác.
- Chưa xác minh PM4Py hỗ trợ giờ làm việc trong DFG hiệu năng. Định nghĩa thời gian net (trừ thời gian của SV) là đề xuất mới, cần nhóm thống nhất xem quá hạn chính dùng net hay gross.
- Đã đọc docs/project-brief.md. Phiên ở plan mode nhưng không có công cụ Write/ExitPlanMode, nên không tạo plan file và không sửa file nào. Bản tổng hợp phải giữ summary dưới 8192 ký tự (lần trước lỗi ở 11139).