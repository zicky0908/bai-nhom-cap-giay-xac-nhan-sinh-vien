# Vòng 2 – Bản tổng hợp pass 2: mục 4–5 (toàn văn)
> **DỮ LIỆU MÔ PHỎNG.** Mọi tham số là giả định, không phải số đo tại trường. Mã A/G/L/GA kế thừa vòng 1. Bản này đã xử lý D6/C1 và các điểm 3–9 của phản biện pass 2.

## 4. Process Mining
### 4.1 Schema (mỗi dòng 1 event, mỗi lần chạy 1 file CSV)
| Trường | Ghi chú |
|---|---|
| event_id | uuid5(NS, cfg+seed+scenario+pair_id+seq+activity+lifecycle), không trùng khi gộp nhiều lần chạy |
| pair_id, seq | Khóa ghép ca AS-IS↔TO-BE; seq là thứ tự event trong ca |
| case_id | AS-P0001 / TB-P0001 (GA9) |
| activity, lifecycle | A01–A17; start/complete |
| timestamp | ISO 8601 UTC, đến giây; hiển thị Asia/Ho_Chi_Minh |
| resource, role, lane | OFF01/officer, APP01, CLK01, SYS01/system; lane theo scenario (D7) |
| scenario, cfg, seed | AS-IS/TO-BE; ví dụ TB-S1-p15 |
| data_origin | simulated / demo |
| doc_type, channel | dang_hoc/nvqs/vay_von/hoc_bong; paper/form/web |
| rework_round | Số A04 đã có trước event |
| decision, origin | Chỉ ở A07 (D4) |
| reason_code, due_at | A03/A04/A07; due_at ghi ở A04 |
| arrival_true | Phút đến thật, dùng cho hàng đợi (xem 4.4) |

**Thứ tự event:** các event cùng phút được cộng thêm +1 giây theo seq. Ví dụ A01 07:30:00, A15 07:30:01, A02 07:30:02. Test bắt buộc: sắp theo timestamp phải trùng với sắp theo (case_id, seq).

### 4.2 Công thức (đơn vị: phút làm việc GA1, 450 phút/ngày; kèm giờ lịch)
- **Xử lý** = c(Ai) − s(Ai).
- **Chờ của trường** = s(Ai) − c(event liền trước).
- **Thời gian của SV** = c(A04) → min(c(A05), due_at), cộng c(A11) → c(A12). Đoạn từ due_at đến s(A13) là trễ phát hiện của trường, không bị trừ.
- **Mốc hoàn thành:** T_trường, T_SV như mục 1. T_trường_net = T_trường − thời gian SV.
- **Tồn tại t:** A01 ≤ t và chưa có c(A11/A13/A14). «Đã cấp, chưa nhận» đếm riêng.
- **Tuổi:** gross = t − A01; net = gross − thời gian SV.
- **Quá hạn:** quá hạn chính khi tuổi net > GA4 (2250 phút); quá hạn phụ khi tuổi gross > GA4; quá hạn bổ sung khi t > due_at.
- **Bổ sung:** tỷ lệ = số ca có ≥1 A04 / tổng số ca; số vòng = count(A04).
- **Trễ phát hiện** = s(A13) − due_at.
- **Biến thể** = chuỗi event complete. Khi so AS-IS/TO-BE: bỏ A15/A16; gộp A06+A17 thành A06; gộp A07(reject)+A10 thành A07(reject).

### 4.3 PM4Py và tô màu (chốt trước khi chạy, công bố cùng seed)
- Quy trình: `format_dataframe` → lọc complete → `discover_dfg`, `get_variants`. `discover_performance_dfg` tính theo giờ lịch nên chỉ dùng để minh họa.
- Tô màu và mọi chỉ số chờ tính bằng pandas theo phút làm việc. Điều kiện (e) chỉ đạt theo cách tính này.
- **Đỏ:** đủ (a) trung vị chờ thuộc top 3, (b) ≥50% số ca qua cạnh chờ > 450 phút, và (f) tần suất ≥10% số ca. **Vàng:** chỉ đạt (a). Ghi thêm nhãn «phân tán» khi P90/trung vị > 3.
- Nhãn hiển thị là «ứng viên nghẽn», không ghi nguyên nhân.

### 4.4 Bộ sinh dữ liệu (DES, numpy.default_rng)
- **Kỳ:** ca đến trong 12 tuần (02/03–22/05/2026), chạy tiếp 8 tuần để xả hàng (đến 17/07). Báo cáo theo cohort tuần đến, kèm số ca còn mở (cắt phải).
- **Số ca:** N = 400 cố định. Thời điểm đến là 400 điểm đều ngẫu nhiên, sắp tăng dần, trên phút làm việc của 12 tuần. Đây là Poisson có điều kiện theo N, ≈6,7 ca/ngày.
- **CRN:** mỗi pair_id có luồng ngẫu nhiên riêng `default_rng([seed, i])`. Từ luồng này rút theo thứ tự: thời điểm đến, doc_type, U_elig, U_L3, độ trễ nhận giấy, hệ số xử lý. Sau đó, mỗi vòng r rút U_rw[r], U_noresp[r] và độ trễ phản hồi[r], không giới hạn số vòng (GA7). Vòng r cần bổ sung khi U_rw[r] < p_r; SV không phản hồi khi U_noresp[r] < 0,08. Vì p_TO-BE ≤ p_AS-IS ở mọi vòng, tập ca bổ sung TO-BE ⊆ AS-IS.
- **A01 AS-IS:** log ghi 07:30 (GA10), nhưng hàng đợi dùng arrival_true, tức s(A02) ≥ arrival_true. Bảng chính dùng bản làm tròn cho cả hai kịch bản; TO-BE báo thêm bản theo phút.

| Tham số | AS-IS | TO-BE | Lý do |
|---|---|---|---|
| N, doc_type 40/20/25/15%, không đủ tư cách 5% | – | giữ | Cùng cơ sở so sánh |
| A07 origin=A06 | approve 97 / reject 3% | giữ | L3 vẫn quyết |
| A07 origin=A03 | reject 80 / return 20% | giữ | D4 |
| Phản hồi SV | lognormal, trung vị 900 phút, σ 0,8 | giữ | Hành vi SV |
| A11→A12 | lognormal, trung vị 675 phút, σ 0,8 | giữ | |
| Xử lý | lognormal σ 0,5, cắt trong [0,5m; 4m]; m: A02 5, A03 10, A06 15, A07 3, A08/A09 2, A04/A11/A13/A14 3 | SYS = 0; A17 5; A04 2 | Tự động hóa |
| p bổ sung (lần 1/lần sau) | 0,30/0,15 | 0,15/0,08; độ nhạy 0,22/0,11 và 0,30/0,15 | Chưa có căn cứ |
| L2 | 1 người, FIFO | giữ | GA2 |
| Ký L3 | Lô T3/T5 14:00 | S1: 10:30 và 16:00 hằng ngày; S0: giữ lô | Tách tác động H1 |
| L3→L4 | Lô 16:30 | Báo ngay; L4 xử lý 15:00 | H4 |
| Quá hạn | Rà thứ Sáu 15:00 | Timer đúng due_at | P4 |

- A16 không làm thay đổi hành vi SV.
- **Lưới chạy:** AS-IS + TO-BE{S0,S1}×{3 mức p} = 7 cấu hình × 20 seed (20260302…+19). Báo trung vị và min–max giữa các seed.

### 4.5 Kết quả (gắn nhãn «Dữ liệu mô phỏng»)
- DFG tần suất và DFG thời gian; top 5 biến thể.
- Tỷ lệ bổ sung và phân bố số vòng; cột chồng chờ/xử lý.
- Tồn và tuổi theo tuần; số ca quá hạn net/gross tại mốc t.
- Bảng AS-IS/TO-BE (trung vị, P90): T_trường, T_trường_net, T_SV, chờ trước A07, tỷ lệ bổ sung, tỷ lệ E3, trễ phát hiện. Có cột S0/S1 và cột độ nhạy p.

### 4.6 Tính tay (phút làm việc)
| Ca | Biến thể | T_trường | T_SV | Chờ trước A07 | Khác |
|---|---|---|---|---|---|
| C001 | V1 | 843 | 990 | 555 | |
| C002 | V2, k=1 | 1693 | 1950 | 585 | |
| C003 | V4 (origin=A03) | 1233 | – | – | |
| C004 | V5 | 5740 | – | – | Thời gian SV 3505; net 2235; trễ phát hiện 2130 |
| TB-C002 | V2 | 1262 | 1519 | 55 (A17→A07) | SV nhận sau 257 phút, như AS-IS |
| TB-C004 | V5 | 3600 | – | – | s(A13) = due_at = 13/03 17:00; trễ phát hiện 0; net 95 |

Tại mốc 13/03 12:00, C004 có tuổi gross 3390 (quá hạn phụ) và tuổi net 95 (chưa quá hạn chính). Mốc chi tiết từng event của C001–C004 giữ như bản propose pass 1; TB-C002/TB-C004 giữ như bản propose pass 2.

## 5. TO-BE
**Lane** (theo scenario, D7): L1 SV, L2 cán bộ, L3 duyệt, L4 văn thư, L5 hệ thống (web + n8n).
| Mã | Hoạt động | Lane | Đi tới | Log |
|---|---|---|---|---|
| A01 | Nộp form web, checklist theo loại giấy | L1 | A15 | C |
| A15 | Kiểm tra định dạng | L5 | G0: lỗi → báo trên form, ghi vào form_error_log (submission_id, lỗi, giờ), không tạo case; đạt → A02 | C |
| A02 | Tạo mã hồ sơ, gửi email xác nhận | L5 | A03 | C |
| A03 | Kiểm tra tư cách, chọn mã lý do | L2 | G1: đủ → A06; thiếu → A04; không đủ tư cách → A07 | S+C |
| A04 | Chọn mục thiếu; email do SYS01 gửi, lưu msg_id | L2 | G3 | S+C |
| G3 | Event-based: SV nộp → A05; timer due − 2 ngày làm việc → A16 (1 lần/vòng); timer due → A13 | L5 | | – |
| A05 | SV bổ sung qua link | L1 | A03 | C |
| A06 | Sinh giấy từ mẫu | L5 | A17 | C |
| A17 | Rà giấy | L2 | A07 | S+C |
| A07 | start: mở hồ sơ trong khung ký; complete: ký và chọn quyết định (reject bắt buộc có lý do) | L3 | approve → A08; reject → A14; return → A06 (chỉ khi origin=A03) | S+C |
| A08 | Đóng dấu (L4 được báo tự động) | L4 | A09 | S+C |
| A09 | Xác nhận đã cấp | L2 | A11 | S+C |
| A11/A14 | Email thử nghiệm qua Mailpit | L5 | A12 → E1 / E2 | C |
| A13 | Đóng hồ sơ quá hạn + email; start = timer | L5 | E3 | S+C |

**AS-IS → nguyên nhân → TO-BE:**
- Đơn giấy (P2, H2) → form + A15: kiểm soát lại.
- Ghi sổ tay (H3, P1) → mã hồ sơ tự động: tự động hóa.
- Báo bổ sung mơ hồ (H2, P5) → email mẫu: tự động hóa.
- Rà quá hạn thứ Sáu (P4) → timer + A16: tự động hóa.
- Soạn giấy tay (H1) → A06 + A17: tự động hóa.
- Ký theo lô (H1) → 2 khung giờ ký, cảnh báo khi chờ > 450 phút: kiểm soát lại.
- Chuyển A07→A08 (H4) → báo L4 ngay: kiểm soát lại.
- A10 → gộp vào A07: loại bỏ.
- Gọi điện báo kết quả (P5) → email có lưu vết: tự động hóa.

**Không đổi:** L3 quyết định; ký và đóng dấu giấy; A12; tiêu chí tư cách.

**Kiểm tra hợp lệ TO-BE:** giữ R1, R2, R5, R6. Thêm:
- R3′: A07 reject có reason_code và đi tới A14.
- R4′: |s(A13) − due_at| ≤ 1 phút.
- R7: trong mỗi scenario, mỗi mã thuộc đúng 1 lane.
- R8: tối đa 1 A16 mỗi vòng.

**Cách vẽ:** 5 lane; G3 là event-based gateway với 3 nhánh; mũi tên quay lại A05→A03 và return→A06.

---
Limitations:
- Ledger: D1/C1 vẫn mở vì chỉ antigravity được resolve; D1 đã bị D2 thay thế. D6/C1 được resolve bằng D7, do cùng agent claude là người nêu phản biện. D3, D4, D5, D7 là accepted; D6 là rejected.
- Các điểm 3–9 của phản biện pass 2 chỉ được xử lý trong văn bản: định nghĩa thời gian SV dùng min(c(A05), due_at); uuid5 có thêm cfg+seed; thứ tự event dùng +1 giây theo seq; CRN dùng luồng RNG theo ca, không giới hạn vòng, U_noresp theo vòng, độ nhạy p kèm giá trị «lần sau», N cố định với thời điểm đến đều ngẫu nhiên; arrival_true cho hàng đợi AS-IS; form_error_log cho A15; tô màu tính bằng pandas. Mô phỏng không sinh lỗi A15 vì nằm ngoài phạm vi so sánh.
- Mọi tham số ở 4.4 vẫn là giả định chưa có cơ sở: 80/20, σ, lô 16:30, các trung vị, 8 tuần xả hàng, p TO-BE. Mức cải thiện chủ yếu đến từ S1 và p, nên phải luôn trình bày kèm S0 và độ nhạy p. GA4 và các ngưỡng tô màu phải chốt trước khi chạy.
- Các số liệu tính tay mới (C004: thời gian SV 3505, net 2235; TB-C004 net 95) do người tổng hợp tự tính, chưa được kiểm lại. Chưa chạy Python/PM4Py, nên cách PM4Py xử lý timestamp trùng và tính tương thích của format_dataframe cần unit test ở giai đoạn triển khai. Mốc chi tiết từng event của các ca tham chiếu đến bản propose, không chép lại vì giới hạn độ dài.
- Nhóm cần chọn quá hạn chính là net hay gross, và xác nhận lane L5 là hợp lý khi trình bày BPMN. Lượt này không đọc lại brief; trích dẫn lấy từ ledger. Phiên ở plan mode, không có công cụ Write, nên không tạo hay sửa file nào. Vòng 3 cần dùng D7 khi đặc tả node n8n (timer A13, A16, Mailpit).