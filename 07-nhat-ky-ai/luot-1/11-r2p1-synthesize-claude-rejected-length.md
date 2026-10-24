# Vòng 2 – Tổng hợp pass 1: mục 4–5 (toàn văn)
> **DỮ LIỆU MÔ PHỎNG.** Mọi tham số chỉ là giả định để minh họa, không phải số đo tại trường. Mã A/G/L/GA kế thừa vòng 1. Từ vựng TO-BE theo D6.

## 4. Process Mining
### 4.1 Schema event log (mỗi dòng là một event)
| Trường | Quy tắc / ví dụ |
|---|---|
| event_id | uuid5 sinh từ (scenario, pair_id, seq, activity, lifecycle), nên tái lập được |
| pair_id | P0001: khóa ghép ca AS-IS↔TO-BE |
| case_id | AS-P0001 / TB-P0001 |
| seq | thứ tự event trong ca |
| activity, lifecycle | A01–A17; start/complete theo cột Log |
| timestamp | lưu UTC ISO-8601, hiển thị Asia/Ho_Chi_Minh |
| resource, role | OFF01/officer, APP01/approver, CLK01/clerk, SYS01/system |
| scenario, run_id | AS-IS/TO-BE; run_id ghi phương án độ nhạy |
| data_origin | simulated / demo |
| doc_type, channel | dang_hoc/nvqs/vay_von/hoc_bong; paper/form/web |
| rework_round | số lần A04 trước event |
| decision, origin | chỉ có ở A07; origin ∈ {A03, A06} (D4) |
| reason_code, due_at | reason_code ở A03/A04/A07; due_at ở A04 |
| seed | 20260302 |

### 4.2 Công thức
Đơn vị chính là phút làm việc theo GA1 (450 phút/ngày); báo kèm giờ lịch.
- Xử lý = c(Ai) − s(Ai). Chờ = s(Ai) − c(event liền trước). Hai đoạn c(A04)→c(A05) và c(A11)→c(A12) là **thời gian phía SV**, không tính là chờ của trường.
- T_trường, T_SV định nghĩa như mục 1. Ca chưa có A12 là dữ liệu bị cắt: loại khỏi T_SV và báo riêng.
- Tồn tại thời điểm t: A01 ≤ t và chưa có c(A11 | A13 | A14). Ca «đã cấp, chưa nhận» đếm riêng.
- **Tuổi toàn trình** = t − A01. **Tuổi trường** = tuổi toàn trình − thời gian phía SV (đồng hồ dừng khi chờ SV).
- Quá hạn trường: tuổi trường > GA4 (2250 phút). Quá hạn toàn trình chỉ báo phụ. Quá hạn bổ sung: t > due_at.
- Số vòng = count(A04). Tỷ lệ bổ sung = số ca có ≥1 A04 / tổng số ca.
- Biến thể = chuỗi complete sau ánh xạ chuẩn hóa D6. Trễ phát hiện = event đầu tiên của A13 − due_at.
- A01 (GA10): bộ sinh tạo thời điểm đến theo phút, dùng chung cho hai kịch bản. KPI so sánh làm tròn A01 về 07:30 cho **cả hai**; TO-BE báo thêm bản tính theo phút.

### 4.3 PM4Py và tô màu
- Quy trình: `pm4py.format_dataframe` → lọc complete → `discover_dfg`, `discover_performance_dfg`, `get_variants`. Thời gian theo giờ làm việc tính bằng pandas; DFG hiệu năng của PM4Py ghi rõ «giờ lịch».
- **Một bộ tiêu chí duy nhất**, thống nhất với vòng 1. Chỉ áp cho cạnh của trường (loại A04→A05 và A11→A12), đo bằng phút làm việc:
  - (a) trung vị chờ thuộc top 3 cạnh;
  - (b) ≥50% số ca qua cạnh có chờ > 450 phút;
  - (f) tần suất ≥10% số ca.
- **Đỏ** khi đạt a+b+f. **Vàng** khi chỉ đạt (a), hoặc khi P90/trung vị > 3 (nghi có ngoại lai). Tỷ số P90/trung vị hiển thị cạnh nhãn.
- Nhãn chỉ ghi «ứng viên nghẽn». Chỉ nêu nguyên nhân khi có bằng chứng theo tiêu chí (c) của vòng 1. Ngưỡng chốt cùng seed theo tiêu chí (d).

### 4.4 Bộ sinh dữ liệu (mô phỏng sự kiện rời rạc, seed 20260302)
**Số ngẫu nhiên chung (CRN):** `SeedSequence(seed).spawn` tách một luồng riêng cho mỗi thuộc tính. Mỗi pair_id rút trước: thời điểm đến, doc_type, cờ tư cách, U_bs[r] (r = 1..6), U_noresp[r], Z_SV[r], U_L3[1..2], Z_xử_lý cho từng activity, Z_nhận.
- Ca phải bổ sung ở vòng r khi U_bs[r] < p_r. Vì p TO-BE ≤ p AS-IS nên tập ca phải bổ sung ở TO-BE là tập con của AS-IS.
- Thời gian = trung vị·exp(σ·Z), tức phân phối lognormal, cắt trong khoảng [0,3m; 4m] với m là trung vị.

| Tham số | AS-IS | TO-BE | Lý do |
|---|---|---|---|
| Số ca, thời kỳ | 400 ca đến trong 12 tuần kể từ T2 02/03/2026; mô phỏng thêm 6 tuần không có ca mới | giữ | biến thể ~5% có khoảng 20 ca; giảm cắt phải |
| Hồ sơ đến | Poisson trong giờ làm việc, khoảng 6,7 ca/ngày | cùng thời điểm | CRN |
| Loại giấy | 40/20/25/15% | giữ | giả định |
| Không đủ tư cách | 5% | giữ | thuộc tính của SV |
| A07, origin=A06 | approve 97%, reject 3% | giữ | L3 vẫn quyết |
| A07, origin=A03 | reject 80%, return 20% →A06 | giữ | D4 |
| SV bổ sung | lognormal, trung vị 900 phút, σ 0,8; mỗi vòng 8% không phản hồi | giữ | hành vi SV |
| A11→A12 | lognormal, trung vị 675 phút, σ 0,8; 5% không nhận | giữ | |
| L2 | 1 người, FIFO, trong giờ làm việc (tải ≈59%; phải kiểm tra <85%) | giữ | GA2 |
| Xử lý (trung vị, σ) | A02 5', A03 10', A04 5', A06 15', A09 2', A11/A13/A14 3' (σ 0,5); A07 3', A08 2' (σ 0,4) | SYS 0': A02, A06, A11, A13–A16; A17 5'; A04 2' | tự động hóa |
| p bổ sung (lần 1 / lần sau) | 0,30 / 0,15 | 0,15 / 0,08 | form + checklist; chưa có cơ sở nên bắt buộc làm độ nhạy |
| Kênh | giấy 60% / form 40% | web 100% | không ảnh hưởng xác suất trong mô hình |
| Lịch L3 | theo lô T3, T5 lúc 14:00 | phiên 10:30 và 16:00 hằng ngày | H1 |
| L3→L4 | lần chuyển 09:00/15:00 kế tiếp, 30% bị hoãn sang ngày sau | luôn vào lần 09:00/15:00 kế tiếp | H4 |
| Quá hạn | rà T6 15:00 (GA8) | timer đúng due_at; A16 gửi ở due − 2 ngày làm việc | P4 |

- due_at = 17:00 của ngày làm việc thứ 7 sau ngày A04 (GA3).
- A07 ở TO-BE: start = lúc L3 mở hồ sơ trong phiên; complete = quyết định và ký bản in trong cùng phiên. Ngữ nghĩa này giống lô ký AS-IS.
- A16 không làm thay đổi hành vi SV, để tránh thiên vị cho TO-BE.
- **Tái lập:** CSV sắp theo (scenario, case_id, seq), định dạng cố định, UTF-8, LF. Cùng seed phải cho cùng SHA-256.
- **Cắt phải:** KPI báo theo cohort tuần đến, kèm số ca còn mở cuối kỳ. Chạy thêm độ nhạy bỏ tuần 1, vì hệ thống khởi động với hàng đợi rỗng.
- **Độ nhạy bắt buộc**, cùng seed: lịch ký {hằng ngày; giữ lô T3/T5} × p lần 1 của TO-BE {0,30; 0,22; 0,15}, tổng 6 lần chạy. Bảng kết quả chính luôn kèm hai dòng bảo thủ: TO-BE giữ lô T3/T5, và TO-BE với p = 0,30.

### 4.5 Kết quả trình bày (ghi nhãn «Dữ liệu mô phỏng»)
- DFG tần suất và DFG thời gian, tô màu theo 4.3.
- Bảng tần suất, trung vị và P90 của từng chuyển tiếp.
- Top 5 biến thể kèm %.
- Tỷ lệ bổ sung và phân bố số vòng.
- Cột chồng chờ/xử lý theo từng bước.
- Tồn và tuổi trường theo tuần; số ca quá hạn tại mốc t.
- Bảng AS-IS/TO-BE: trung vị và P90 của T_trường, T_SV; chờ trước A07; tỷ lệ bổ sung; tỷ lệ E3; trễ phát hiện; số ca mở. Kèm 6 cột độ nhạy.

### 4.6 Bộ tính tay
Đây là fixture để kiểm tra công thức, không sinh từ bộ sinh dữ liệu.

**AS-IS** (phản biện đã tính lại, khớp):
- **C001:**
  - 02/03: A01 07:30; A02 08:00–08:05; A03 09:00–09:10 (đủ); A06 10:00–10:15.
  - 03/03: A07 14:00–14:05 (approve, origin=A06); A08 15:00–15:02; A09 15:30–15:32; A11 16:00–16:03.
  - 04/03: A12 09:00.
- **C002:**
  - 02/03: A01 07:30; A02 09:00–09:05; A03 10:00–10:10 (thiếu); A04 10:30–10:35, due 11/03 17:00.
  - 04/03: A05 08:00; A03 09:00–09:08 (đủ); A06 09:30–09:45.
  - 05/03: A07 14:00–14:04 (approve); A08 14:30–14:32; A09 15:00–15:02; A11 15:10–15:13.
  - 06/03: A12 10:00.
- **C003:**
  - 03/03: A01 07:30; A02 08:00–08:05; A03 08:30–08:40 (không đủ tư cách).
  - 05/03: A07 14:00–14:03 (reject, origin=A03); A10 14:03–14:08; A14 15:00–15:03.
- **C004:**
  - 04/03: A01 07:30; A02 08:00–08:05; A03 08:30–08:40 (thiếu); A04 09:00–09:05, due 13/03 17:00. Không có A05.
  - 20/03: A13 15:00–15:10.

**TO-BE** (CRN giữ nguyên số phút làm việc phía SV):
- **TB-C002:**
  - 02/03: A01/A15/A02 07:30; A03 09:00–09:10 (thiếu); A04 09:10–09:12, due 11/03 17:00.
  - 03/03: A05 16:07 (cách A04 745 phút, như AS-IS); A03 16:20–16:28; A06 16:28 (SYS); A17 16:35–16:40.
  - 04/03: A07 10:30–10:34 (approve); A08 15:00–15:02; A09 15:10–15:12; A11 15:12 (SYS).
  - 05/03: A12 09:59 (cách A11 257 phút, như AS-IS).
- **TB-C004:**
  - 04/03: A01/A15/A02 07:30; A03 08:30–08:40 (thiếu); A04 08:45–08:47, due 13/03 17:00.
  - 11/03: A16 17:00.
  - 13/03: A13 17:00 (SYS).

| Chỉ số | C001 | C002 | C003 | C004 | TB-C002 | TB-C004 |
|---|---|---|---|---|---|---|
| T_trường (phút làm việc) | 843 | 1693 | 1233 | 5740 | 1242 | 3600 |
| T_trường (giờ lịch) | 32h33 | 79h43 | 55h33 | 391h40 | 55h42 | 225h30 |
| T_SV (phút làm việc) | 990 | 1950 | – | – | 1499 | – |
| Chờ trước A07 | 555 | 585 | – | – | 200 (sau A17) | – |
| Số vòng | 0 | 1 | 0 | 1 | 1 | 1 |
| Trễ phát hiện | – | – | – | 2130 | – | 0 |

**Tổng hợp AS-IS:**
- Trung vị T_trường = 1463 phút; trung bình = 2377,25 phút. Tỷ lệ bổ sung = 50%. Có 4 biến thể.
- Mốc 13/03 12:00, C004: tuổi toàn trình 3390 phút > 2250, nên quá hạn toàn trình. Tuổi trường chỉ 95 phút (đồng hồ dừng từ c(A04) 09:05), nên **không** quá hạn trường; cũng chưa quá hạn bổ sung.
- DFG: A01→A02 và A02→A03 mỗi cạnh 4 lần. A03→A06, A03→A04, A06→A07, A07→A08, A08→A09, A09→A11, A11→A12 mỗi cạnh 2 lần. A04→A05, A05→A03, A03→A07, A07→A10, A10→A14, A04→A13 mỗi cạnh 1 lần.

## 5. TO-BE
Gồm 5 lane: L1 SV, L2 cán bộ, L3 duyệt, L4 văn thư, L5 hệ thống (web + n8n).

| Mã | Hoạt động | Lane | Đi tới | Log |
|---|---|---|---|---|
| A01 | Nộp form web: trường bắt buộc, tệp theo checklist của từng loại giấy | L1 | A15 | C |
| A15 | Kiểm tra định dạng tự động | L5 | G0: lỗi → báo ngay trên form, không tạo ca (đếm riêng); đạt → A02 | C |
| A02 | Tạo mã hồ sơ, gửi email xác nhận | L5 | A03 | C |
| A03 | Kiểm tra tư cách theo checklist, chọn mã lý do | L2 | G1: đủ → A06; thiếu/sai → A04; không đủ tư cách → A07 | S+C |
| A04 | Chọn mục thiếu theo mẫu rồi bấm gửi; n8n gửi email kèm link và hạn | L2 (OFF01) | G3 | S+C |
| G3 | Event-based: SV nộp → A05; timer due − 2 ngày → A16 → quay lại G3 (1 lần); timer due → A13 | L5 | | – |
| A16 | Email nhắc hạn | L5 | G3 | C |
| A05 | SV bổ sung qua link | L1 | A03 | C |
| A06 | Sinh giấy và phiếu trình từ mẫu | L5 | A17 | C |
| A17 | Rà giấy do hệ thống sinh | L2 | A07 | S+C |
| A07 | Duyệt trong phiên 10:30/16:00; reject bắt buộc nhập lý do; ký bản in | L3 | G2: approve → A08; reject → A14; return → A06 (chỉ khi origin=A03) | S+C |
| A08 | Đóng dấu (L4 nhận thông báo tự động) | L4 | A09 | S+C |
| A09 | Xác nhận đã cấp | L2 | A11 | S+C |
| A11 / A14 / A13 | Email thử nghiệm qua Mailpit: báo có giấy / từ chối kèm lý do / đóng hồ sơ quá hạn | L5 | A12 / E2 / E3 | C |
| A12 | SV nhận giấy | L1 | E1 | C |

| AS-IS | Nguyên nhân | TO-BE | Loại thay đổi |
|---|---|---|---|
| A01 đơn giấy | P2, H2 | form có kiểm tra (A15) | kiểm soát lại |
| A02 ghi sổ tay | H3, P1 | tạo mã hồ sơ tự động | tự động hóa |
| A04 báo mơ hồ | H2, P5 | email theo mẫu, có link | tự động hóa |
| Rà quá hạn thứ Sáu | P4 | timer + A16 | tự động hóa |
| A06 soạn tay | H1 | A06 sinh từ mẫu + A17 rà | tự động hóa |
| Ký theo lô T3/T5 | H1 | 2 phiên/ngày; cảnh báo khi chờ A17→A07 > 450 phút | kiểm soát lại |
| A07→A08 theo lô | H4 | báo L4 ngay | kiểm soát lại |
| A10 | bước thừa | gộp vào A07 | loại bỏ |
| A11/A13/A14 gọi điện | P5 | email có lưu vết | tự động hóa |

**Không đổi:** L3 vẫn quyết định; ký và đóng dấu bản giấy (không dùng ký số); A12; tiêu chí tư cách.

**Kiểm tra hợp lệ log TO-BE:**
- Giữ R1, R2, R5, R6 của AS-IS.
- R3′: A07 có decision=reject phải có reason_code và đi tới A14.
- R4′: c(A13) = due_at (sai lệch ±1 phút), và không có A05 sau A04 cuối cùng.
- R7: mỗi vòng có tối đa 1 A16, và A16 phải trước due_at.
- R8: log TO-BE không có A10.

**Ánh xạ khi so biến thể (D6):** A07(reject)+A10 ↔ A07(reject); A06+A17 ↔ A06; bỏ A15 và A16.

**Cách vẽ:** 5 lane. G3 là event-based gateway với 3 nhánh (message SV nộp, timer nhắc hạn, timer hết hạn). Chú thích: «email thử nghiệm local (Mailpit), không gửi ra Internet».

---
Limitations:
- Ledger: D5/C1 đã được claude (người nêu phản biện) giải quyết; D5 accepted. Thêm D6 (A15/A16/A17, ánh xạ biến thể), accepted. D1/C1 vẫn mở vì chỉ antigravity được giải quyết; D1 đã bị thay bằng D2. Các điểm 5–13 của phản biện được xử lý trong văn bản: 5 phân phối lognormal kèm σ; 6 quy ước làm tròn A01 cho cả hai kịch bản; 7 thêm fixture TB-C002/TB-C004; 8 độ nhạy 2×3 kèm hai dòng bảo thủ; 9 D6; 10 A04 thuộc L2, tách A06/A17; 11 ngữ nghĩa start/complete của A07 trong phiên; 12 tuổi trường dừng đồng hồ khi chờ SV; 13 một bộ tiêu chí tô màu a+b+f, kèm tỷ số P90/trung vị.
- Các tham số mới đều là giả định chưa có cơ sở: A07 origin=A03 reject 80%/return 20%; L3→L4 hoãn 30%; các σ 0,4/0,5/0,8; cắt trong [0,3m; 4m]; 6 tuần chạy thêm; ngưỡng P90/trung vị > 3; tần suất ≥10%. Tất cả phải chốt và công bố cùng seed trước khi chạy. Kiểu ghi «origin=G1» ở bảng AS-IS vòng 1 cần sửa thành origin=A03 cho thống nhất với D4.
- Fixture TB-C002/TB-C004 do người tổng hợp tính tay; cần một người khác tính lại và đưa vào unit test cùng 4 ca AS-IS. Lịch nghỉ lễ đang để rỗng. Các fixture không sinh từ bộ sinh dữ liệu (ví dụ AS-IS C002 có A08 lúc 14:30, không theo luật chuyển 09:00/15:00), nên chỉ dùng để kiểm công thức.
- CRN chỉ đồng bộ thuộc tính của từng ca; thứ tự hàng đợi L2/L3 vẫn khác nhau giữa hai kịch bản. Một seed không đủ để kết luận: nên chạy nhiều bản lặp (ví dụ 30 seed) và báo khoảng giá trị. Kết quả TO-BE không phải hiệu quả đã chứng minh. Chưa xác minh PM4Py có hỗ trợ giờ làm việc trong performance DFG hay không. Phải khóa phiên bản numpy để SeedSequence cho cùng hash.
- Đã đọc lại docs/project-brief.md để lấy trích dẫn. Phiên ở plan mode nhưng không có công cụ Write/ExitPlanMode, nên không tạo plan file và không sửa file nào. Chưa chạy Python hay PM4Py.