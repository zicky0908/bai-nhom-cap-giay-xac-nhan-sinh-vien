# Vòng 2 – Pass 1 (propose): mục 4–5
> Toàn bộ số liệu dưới đây là **DỮ LIỆU MÔ PHỎNG**, chưa kiểm chứng tại trường. Mã A/G/L/GA kế thừa từ vòng 1.

## 4. Process Mining
### 4.1 Schema event log (mỗi dòng là một event)
| Trường | Ví dụ | Ghi chú |
|---|---|---|
| event_id | uuid | khóa idempotency |
| case_id | AS-0001 / TB-0001 | GA9 |
| activity | A03 | A01–A16 |
| lifecycle | start / complete | theo cột Log ở mục 2 |
| timestamp | 2026-03-02T08:00:00+07:00 | lưu UTC, hiển thị Asia/Ho_Chi_Minh |
| resource, role | OFF01, officer | GA13; TO-BE có SYS01/system |
| scenario | AS-IS / TO-BE | |
| data_origin | simulated / demo | tách dữ liệu demo |
| doc_type | dang_hoc / nvqs / vay_von / hoc_bong | |
| channel | paper / form / web | |
| rework_round | 0, 1, 2… | số A04 trước event |
| decision, origin | chỉ có ở A07 | D4 |
| reason_code | A03 / A04 / A07 | |
| due_at | ở A04 | hạn GA3 |
| seed | int | |

### 4.2 Công thức
Đơn vị chính là phút làm việc theo GA1 (1 ngày làm việc = 450 phút); báo kèm giờ lịch.
- Xử lý(Ai) = c − s.
- Chờ(Ai) = s(Ai) − c(event liền trước trong case). Đoạn c(trước)→c(A05/A12) là thời gian phía SV, không tính là chờ của trường.
- T_trường, T_SV: định nghĩa như mục 1.
- Tồn tại thời điểm t: A01 ≤ t và chưa có c(A11 | A13 | A14). Hồ sơ «đã cấp, chưa nhận» đếm riêng. Tuổi = t − A01.
- Quá hạn: tuổi > GA4 (mặc định 2250 phút = 5 ngày làm việc). Quá hạn bổ sung: t > due_at.
- Số vòng = count(A04). Tỷ lệ bổ sung = số ca có ≥1 A04 / tổng số ca.
- Biến thể = chuỗi activity của các event complete. Trễ phát hiện = s(A13) − due_at.

### 4.3 PM4Py
- Dùng `format_dataframe`, lọc `lifecycle=complete`, rồi chạy `discover_dfg`, `discover_performance_dfg`, `get_variants`.
- Giờ làm việc tính bằng pandas. DFG hiệu năng của PM4Py dùng giờ lịch nên trình bày cả hai và ghi rõ.
- **Tô màu:**
  - Đỏ khi đủ cả ba: (a) trung vị chờ thuộc top 3; (b) ≥50% số ca qua cạnh có chờ > 450 phút; (c) tần suất ≥10% số ca.
  - Vàng khi chỉ đạt (a).
  - Nhãn là «ứng viên nghẽn», không ghi nguyên nhân.

### 4.4 Bộ sinh dữ liệu
Mô phỏng sự kiện rời rạc, `numpy.default_rng(seed)`, seed = 20260302 (tham số). Dùng số ngẫu nhiên chung (CRN): thuộc tính của từng ca được rút trước.

| Tham số | AS-IS | TO-BE | Lý do |
|---|---|---|---|
| Số hồ sơ, thời kỳ | 400 ca, 12 tuần từ 02/03/2026 | **giữ nguyên** | đủ để biến thể ~5% có khoảng 20 ca |
| Hồ sơ đến | Poisson trong giờ làm việc, khoảng 6,7 ca/ngày | **cùng thời điểm** | |
| Loại giấy | 40/20/25/15% | **giữ nguyên** | giả định |
| Không đủ tư cách | 5% | **giữ nguyên** | thuộc tính của SV |
| A07 (origin=A06) | reject 3%, return 5% | **giữ nguyên** | L3 vẫn quyết |
| SV bổ sung | lognormal, trung vị 2 ngày làm việc, σ = 0,8; 8% không phản hồi | **giữ nguyên** | hành vi của SV |
| A11→A12 | trung vị 1,5 ngày; 5% bị cắt | **giữ nguyên** | |
| L2 | 1 người, FIFO, chỉ trong giờ làm việc | **giữ nguyên** | GA2 |
| Xử lý (trung vị) | A02 5', A03 10', A06 15', A07 3', A08 2', A09 2', A11/A14 3' | A02/A11/A13/A14 do SYS ≈0'; A06 5' | tự động hóa |
| p bổ sung (lần 1 / lần sau) | 0,30 / 0,15 | 0,15 / 0,08 | form + checklist; độ nhạy {0,30; 0,22; 0,15} |
| Kênh | giấy 60% / form 40% | web 100% | |
| Lịch ký L3 | theo lô T3 và T5 lúc 14:00 | hằng ngày 10:30 và 16:00 | H1 |
| L3→L4 | theo lô cuối ngày | báo ngay; L4 xử lý lúc 15:00 | H4 |
| Quá hạn | rà thứ Sáu 15:00 (GA8) | timer đúng due_at | P4 |

Nhắc hạn A16 **không** làm thay đổi hành vi SV trong mô hình, để tránh thiên vị cho TO-BE.

### 4.5 Kết quả trình bày (ghi nhãn «Dữ liệu mô phỏng»)
- DFG tần suất và DFG thời gian.
- Top 5 biến thể kèm %.
- Tỷ lệ bổ sung và phân bố số vòng.
- Cột chồng chờ/xử lý theo từng bước.
- Tồn và tuổi hồ sơ theo tuần.
- Số hồ sơ quá hạn tại một mốc t.
- Bảng AS-IS/TO-BE: trung vị và P90 của T_trường, T_SV; chờ A06→A07; tỷ lệ bổ sung; tỷ lệ E3; trễ phát hiện. Kèm cột độ nhạy.

### 4.6 Bộ kiểm tra tính tay (AS-IS, 4 ca)
- **C001 (V1):**
  - T2 02/03: A01c 07:30; A02 08:00–08:05; A03 09:00–09:10 (đủ); A06 10:00–10:15.
  - T3 03/03: A07 14:00–14:05 (approve, origin=A06); A08 15:00–15:02; A09 15:30–15:32; A11 16:00–16:03.
  - T4 04/03: A12c 09:00.
- **C002 (V2, k=1):**
  - T2 02/03: A01c 07:30; A02 09:00–09:05; A03 10:00–10:10 (thiếu); A04 10:30–10:35, due = T4 11/03 17:00.
  - T4 04/03: A05c 08:00; A03 09:00–09:08 (đủ); A06 09:30–09:45.
  - T5 05/03: A07 14:00–14:04 (approve); A08 14:30–14:32; A09 15:00–15:02; A11 15:10–15:13.
  - T6 06/03: A12c 10:00.
- **C003 (V4):**
  - T3 03/03: A01c 07:30; A02 08:00–08:05; A03 08:30–08:40 (không đủ tư cách).
  - T5 05/03: A07 14:00–14:03 (reject, origin=A03); A10 14:03–14:08; A14 15:00–15:03.
- **C004 (V5):**
  - T4 04/03: A01c 07:30; A02 08:00–08:05; A03 08:30–08:40 (thiếu); A04 09:00–09:05, due = T6 13/03 17:00. SV không nộp bổ sung.
  - T6 20/03: A13 15:00–15:10.

| Chỉ số | C001 | C002 | C003 | C004 |
|---|---|---|---|---|
| T_trường (phút làm việc) | 843 | 1693 | 1233 | 5740 |
| T_trường (giờ lịch) | 32h33 | 79h43 | 55h33 | 391h40 |
| T_SV (phút làm việc) | 990 | 1950 | – | – |
| Chờ A06→A07 | 555 | 585 | – | – |
| Số vòng | 0 | 1 | 0 | 1 |

Tổng hợp:
- Trung vị T_trường = 1463 phút; trung bình = 2377,25 phút.
- Tỷ lệ bổ sung = 2/4 = 50%. Có 4 biến thể, mỗi biến thể 1 ca.
- Trễ phát hiện C004 = 2130 phút (4,73 ngày làm việc; 166 giờ lịch). Ở TO-BE trễ phát hiện = 0.
- Mốc T6 13/03 12:00: tồn 1 ca (C004), tuổi 3390 phút > 2250 nên **quá hạn toàn trình**; nhưng **chưa** quá hạn bổ sung, vì due_at là 17:00.
- DFG (số lần chuyển tiếp):
  - Mỗi cạnh 4 lần: A01→A02, A02→A03.
  - Mỗi cạnh 2 lần: A03→A06, A03→A04, A06→A07, A07→A08, A08→A09, A09→A11, A11→A12.
  - Mỗi cạnh 1 lần: A04→A05, A05→A03, A03→A07, A07→A10, A10→A14, A04→A13.

## 5. TO-BE
**Lane:** L1 SV, L2 cán bộ, L3 duyệt, L4 văn thư, L5 hệ thống (web + n8n).

| Mã | Hoạt động | Lane | Đi tới | Log |
|---|---|---|---|---|
| A01 | Nộp form web; trường bắt buộc; tệp theo checklist của từng loại giấy | L1 | A15 | C |
| A15 | Kiểm tra định dạng tự động | L5 | G0: lỗi → báo ngay trên form, không tạo hồ sơ; đạt → A02 | C |
| A02 | Tạo mã hồ sơ, gửi email xác nhận | L5 | A03 | C |
| A03 | Kiểm tra tư cách theo checklist, chọn mã lý do | L2 | G1 (như AS-IS) | S+C |
| A04 | Email bổ sung theo mẫu (mục thiếu, hạn, link); L2 bấm gửi | L5 | G3 | S+C |
| G3 | Event-based: SV nộp → A05; timer (due − 2 ngày) → A16 → quay lại G3; timer due → A13 | L5 | | – |
| A16 | Nhắc hạn, chỉ gửi 1 lần | L5 | G3 | C |
| A05 | SV bổ sung qua link | L1 | A03 | C |
| A06 | Sinh giấy từ mẫu; L2 rà lại | L5+L2 | A07 | S+C |
| A07 | Duyệt trên hàng đợi; khi reject phải nhập lý do; ký bản in lúc 10:30 hoặc 16:00 | L3 | G2: approve → A08; reject → A14; return → A06 (chỉ khi origin=A03) | S+C |
| A08 | Đóng dấu; L4 nhận thông báo tự động | L4 | A09 | S+C |
| A09 | Xác nhận đã cấp | L2 | A11 | S+C |
| A11 / A14 / A13 | Email thử nghiệm qua Mailpit | L5 | A12→E1 / E2 / E3 | C |

| AS-IS | Nguyên nhân | TO-BE | Loại thay đổi |
|---|---|---|---|
| A01 đơn giấy | P2, H2 | form có validate (A15) | kiểm soát lại |
| A02 ghi sổ tay | H3, P1 | mã hồ sơ tự động | tự động hóa |
| A04 báo mơ hồ | H2, P5 | email mẫu có link | tự động hóa |
| Rà quá hạn thứ Sáu | P4 | timer + A16 | tự động hóa |
| A06 soạn tay | H1 | sinh từ mẫu | tự động hóa |
| Ký theo lô không định | H1 | 2 khung giờ/ngày; cảnh báo khi chờ > 450 phút | kiểm soát lại |
| A07→A08 | H4 | báo L4 ngay | kiểm soát lại |
| A10 | thừa bước | gộp vào A07 | loại bỏ |
| A11/A14/A13 gọi điện | P5 | email có lưu vết | tự động hóa |

**Không đổi:** L3 quyết định; ký và đóng dấu bản giấy (không dùng ký số); A12; tiêu chí tư cách.

**Kiểm tra hợp lệ log TO-BE:**
- R3′: A07 có decision=reject phải có reason_code và đi tới A14.
- R4′: s(A13) = due_at, sai lệch ±1 phút.

**Cách vẽ:** 5 lane. G3 có 3 nhánh. Ghi chú: các bước L5 là email thử nghiệm local.

---
Limitations:
- Mọi tham số ở 4.4 (400 ca, 6,7 ca/ngày, các tỷ lệ 5/3/5/8%, p bổ sung TO-BE 0,15/0,08, lịch ký) là giả định để minh họa, không phải số đo. Mức p của TO-BE chưa có cơ sở nên bắt buộc báo kèm kết quả độ nhạy. Ngưỡng 450 phút, GA4 = 2250 phút và các tiêu chí tô màu (a)(b)(c) phải chốt và công bố cùng seed trước khi chạy, theo tiêu chí (d) của vòng 1.
- Bộ 4 ca ở 4.6 do người đề xuất tự tính tay. Người phản biện cần tính lại, nhất là các ca qua giờ nghỉ trưa (C001: 555 phút, C004: 2130 phút). Nên đưa bộ này thành unit test. Lịch nghỉ lễ đang để rỗng.
- Chưa xác minh phiên bản PM4Py có hỗ trợ tính theo giờ làm việc trong performance DFG hay không. Nếu không có thì toàn bộ thời gian theo giờ làm việc tính bằng pandas.
- Bảng AS-IS ở vòng 1 ghi «return chỉ khi origin=G1», còn D4 ghi origin=A03. Ý nghĩa giống nhau nhưng nên thống nhất một cách viết là origin=A03.
- Ở TO-BE, A10 bị gộp vào A07. Vì vậy biến thể V3/V4 của hai kịch bản khác nhau một bước: khi so biến thể cần ánh xạ A07(reject)+A10 ↔ A07(reject). A15 lỗi không tạo case nên không có trong log; nếu cần số liệu thì phải đếm riêng.
- Ledger: D1/C1 vẫn mở (chỉ antigravity được giải quyết). Lượt này chỉ thêm D5, không chạm vào các ID cũ. Đã đọc lại docs/project-brief.md để lấy trích dẫn dòng. Plan mode không có công cụ Write nên không tạo file nào.