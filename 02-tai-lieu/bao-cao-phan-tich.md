# Báo cáo phân tích – Tự động hóa cấp giấy xác nhận sinh viên

> Nguồn: phiên AI Collaboration Lab ngày 23/10/2026 (3 vòng, 18 lượt gọi; Claude + Antigravity, Codex hết quota).
> Mục 1–3: bản tổng hợp vòng 1 pass 2 (lượt 8, hợp lệ). Mục 4–5: bản tổng hợp vòng 2 pass 2 (lượt 15, hợp lệ).
> Mục 6–7: bản vòng 3 pass 1 (run 1, lượt 18) + phần sửa cuối của run 2 (lượt 4, Claude, hợp lệ) và bổ sung (a)–(c) của run 2 lượt 8.
> Mục 8–10: bản tổng hợp cuối của run 2 (lượt 8, Antigravity) – bị runner loại CHỈ vì vượt 8.192 ký tự; nội dung là output thật. Bản gốc: 07-nhat-ky-ai/luot-2/.
> Toàn bộ là giả định học thuật; số liệu Process Mining là DỮ LIỆU MÔ PHỎNG. Bản gốc từng lượt: 07-nhat-ky-ai/luot-1/.

# Vòng 1 – Bản tổng hợp pass 2 (mục 1–3, toàn văn)
> Đây là **giả định học thuật**, chưa có dữ liệu hay quy trình chính thức của trường. Không trích dẫn quy định pháp luật nào. Nhóm có thể chỉnh mọi mã GAx.

## 1. Business Problem & Process Overview
**Bối cảnh (giả định):** Phòng CTHSSV cấp giấy xác nhận thủ công cho các loại: đang học, hoãn NVQS, vay vốn, học bổng. Quy trình hiện tại: nộp đơn giấy hoặc form → tra danh sách → soạn giấy → trình ký → đóng dấu → báo SV qua điện thoại/Zalo/email.

| Mã | Vấn đề (giả thuyết) | Dấu hiệu kiểm chứng |
|---|---|---|
| P1 | SV không tra được trạng thái (số sổ gán ở A02, không báo SV) | Số lượt hỏi lại/hồ sơ |
| P2 | Thiếu/sai thông tin bị phát hiện muộn | Tỷ lệ hồ sơ có ≥1 lần A04; mã lý do |
| P3 | Chờ ký lâu | Chờ A06→A07 theo giờ làm việc |
| P4 | Quá hạn chỉ lộ ra khi rà sổ | start(A13) − thời điểm hết hạn GA3 |
| P5 | Thông báo không lưu vết | Tỷ lệ A04/A11/A14 có bằng chứng gửi. AS-IS không có nguồn dữ liệu, chỉ đo được ở TO-BE; không dùng để so sánh AS-IS/TO-BE |

**Mục tiêu (dự kiến):** tách thời gian chờ và thời gian xử lý; giảm số vòng bổ sung; có mã hồ sơ và trạng thái minh bạch; cảnh báo quá hạn; thông báo có lưu vết và có lý do.
**Bắt đầu:** A01. **Kết thúc:** E1 (SV nhận giấy), E2 (từ chối kèm lý do), E3 (đóng do quá hạn bổ sung).
**Hai mốc đo:**
- T_trường = complete(A11 | A14 | A13) − A01. Kết thúc ở A11 chứ không ở A09, vì A11 là lúc SV biết kết quả; A09 là mốc nội bộ, báo cáo phụ.
- T_SV = complete(A12) − A01, chỉ tính cho hồ sơ đã có A12. Hồ sơ «đã cấp, chưa nhận» là dữ liệu bị cắt: loại khỏi T_SV, báo cáo riêng số lượng và tuổi.

| Bên liên quan | Lane / role | Vai trò |
|---|---|---|
| Sinh viên | L1 / student | Nộp, bổ sung, nhận |
| Cán bộ CTHSSV | L2 / officer | Tiếp nhận, kiểm tra, soạn, xác nhận cấp, thông báo |
| Lãnh đạo/người được ủy quyền | L3 / approver | Duyệt/từ chối, ký |
| Văn thư | L4 / clerk | Đóng dấu, vào sổ |
| Phòng Đào tạo; cơ quan nhận giấy | – | Nguồn tra cứu; ngoài phạm vi |

**Đầu vào:** MSSV, họ tên, ngày sinh, lớp/khoa, loại giấy, mục đích, số bản, email, tệp kèm theo (GA5). **Đầu ra:** giấy đã ký và đóng dấu, hoặc thông báo từ chối có lý do; sổ/event log.
**Phạm vi:** từ A01 đến E1/E2/E3. **Ngoài phạm vi:** ký số, giá trị pháp lý, tích hợp CSDL trường, cấp lại.

| Mã | Giả định |
|---|---|
| GA1 | Giờ làm việc T2–T6, 07:30–11:30 và 13:30–17:00, Asia/Ho_Chi_Minh |
| GA2 | 1 cán bộ tiếp nhận (kiêm nhiệm), 1 người ký |
| GA3 | Hạn bổ sung 7 ngày làm việc (tham số) |
| GA4 | Ngưỡng quá hạn toàn trình là tham số (ví dụ 5 ngày làm việc), không phải quy định |
| GA5 | Mẫu giấy và hồ sơ kèm theo từng loại: cần xác minh |
| GA6 | A03 có 3 kết quả; chỉ L3 quyết định từ chối, tại A07 |
| GA7 | AS-IS không giới hạn số vòng bổ sung |
| GA8 | Rà quá hạn vào chiều thứ Sáu; start(A13) = lần rà đầu tiên sau hạn |
| GA9 | case_id = số sổ gán ở A02; A01 lấy theo ngày ghi trên đơn |
| GA10 | A01 chỉ có ngày, quy ước = 07:30 ngày đó. Áp dụng như nhau cho AS-IS và TO-BE; TO-BE báo thêm số đo theo phút |
| GA11 | AS-IS không có nhánh L3 yêu cầu bổ sung; nếu phỏng vấn thấy có thì thêm G2→A04 |
| GA12 | «Đã cấp, chưa nhận» không tự đóng; tính vào hồ sơ tồn phía SV |
| GA13 | resource = mã ẩn danh (ví dụ OFF01); role theo lane |
| GA14 | Timer G3 nổ đúng hạn GA3. SV nộp sau hạn không được nhận làm A05 (phải nộp hồ sơ mới); chỉ ghi chú, không ghi event |

## 2. AS-IS (Swimlane/BPMN)
| Mã | Hoạt động | Lane | Đi tới | Log |
|---|---|---|---|---|
| A01 | Nộp yêu cầu | L1 | A02 | C |
| A02 | Tiếp nhận, ghi sổ, gán số | L2 | A03 | S+C |
| A03 | Kiểm tra thông tin và tư cách, ghi lý do | L2 | G1 | S+C |
| G1 | XOR: kết quả? | L2 | Đủ→A06; Thiếu/sai→A04; Không đủ tư cách→A07 (phiếu đề xuất từ chối) | – |
| A04 | Báo bổ sung, nêu mục thiếu và hạn | L2 | G3 | S+C |
| G3 | Event-based: SV nộp trước hạn→A05; timer hết hạn GA3→A13 | L2 | | – |
| A05 | SV nộp bổ sung | L1 | A03 | C |
| A06 | Soạn giấy và phiếu trình | L2 | A07 | S+C |
| A07 | Xem xét, quyết định, ký nếu duyệt | L3 | G2 | S+C |
| G2 | XOR: decision? | L3 | approve→A08; reject→A10; return→A06 (chỉ khi origin=G1) | – |
| A08 | Đóng dấu, vào sổ | L4 | A09 | S+C |
| A09 | Xác nhận đã cấp | L2 | A11 | S+C |
| A10 | Ghi lý do từ chối | L3 | A14 | S+C |
| A11 | Báo SV có giấy, hẹn nhận | L2 | A12 | S+C |
| A12 | SV nhận giấy | L1 | E1 | C |
| A13 | Đóng hồ sơ quá hạn, báo SV | L2 | E3 | S+C |
| A14 | Báo SV bị từ chối kèm lý do | L2 | E2 | S+C |

**Quy ước log:**
- S+C = có start và complete. C = sự kiện tức thời của SV. Gateway không ghi log.
- Event A07 phải có thuộc tính `decision` (approve/reject/return) và `origin` (A03|A06), để PM4Py kiểm được G2 và R2.
- Chờ = start(Ai) − complete(bước trước). Xử lý = complete(Ai) − start(Ai). Trễ phát hiện quá hạn = start(A13) − hạn GA3.

**Kiểm tra hợp lệ log:**
- R1: mỗi case kết thúc bằng đúng một E, hoặc đang mở.
- R2: A08 chỉ đứng sau A07 có decision=approve.
- R3: A10 đứng ngay trước A14.
- R4: A13 chỉ sau A04 cuối, không có A05 sau đó, và start(A13) ≥ hạn GA3.
- R5: mỗi start có đúng một complete tương ứng, và complete ≥ start.
- R6: số vòng bổ sung = số lần A04.

**Biến thể** (k ≥ 0 là số vòng A04, A05, A03):
- V1: A01–A03, A06–A09, A11, A12.
- V2: V1 kèm k ≥ 1 vòng bổ sung.
- V3: …A06, A07, A10, A14.
- V4: A01–A03, A07, A10, A14.
- V4b: A07 với decision=return, rồi đi tiếp như V1 từ A06.
- V5: A01–A03, k vòng, A04, A13.

**Cách vẽ:** 4 lane ngang; mũi tên quay ngược cho A05→A03 và G2→A06. G3 vẽ bằng ký hiệu event-based gateway, gồm message «SV nộp» và timer «hạn 7 ngày làm việc». Ghi chú: AS-IS phát hiện quá hạn thủ công vào thứ Sáu.

## 3. Bottleneck – giả thuyết ngang hàng, chưa xếp hạng
| | H1 | H2 | H3 | H4 |
|---|---|---|---|---|
| Vị trí | A06→A07 | Vòng A03→A04→A05→A03 | A02→A03 | A07→A08 (L3→L4) |
| Nguyên nhân giả định | Ký theo lô, người ký vắng | Biểu mẫu không nêu rõ hồ sơ; báo bổ sung mơ hồ | Kiêm nhiệm, tra cứu thủ công | Giấy đã ký chờ chuyển theo lô; không ai phụ trách chuyển tiếp |
| Ảnh hưởng | T_trường dài, SV hỏi lại | Làm lại, tăng E3 | Tồn đầu vào, tuổi tăng | T_trường tăng mà không ai thấy |
| Dữ liệu kiểm chứng | Chờ theo ngày/giờ; lịch người ký; cỡ lô | 3 đoạn: A03c→A04s (trường), A04c→A05 (SV), A05→A03s (trường); số vòng, mã lý do, loại giấy, kênh | Chờ; tồn theo ngày; xử lý A03 | Chờ; giờ chuyển; cỡ lô |

**Không phải nghẽn của trường:** complete(A11)→complete(A12) chỉ dùng để tách T_SV ra khỏi T_trường.

**Tiêu chí:**
- (a) Trung vị thời gian chờ nằm trong top 3 chuyển tiếp.
- (b) ≥50% số ca vượt ngưỡng; so trung vị với P90 để loại ngoại lai.
- (c) Có bằng chứng nguyên nhân (lịch, lô, mã lý do).
- (d) Ngưỡng chốt trước khi sinh dữ liệu, công bố cùng seed.
- (e) So giờ lịch với giờ làm việc; chờ dài chỉ do cuối tuần hoặc nghỉ trưa thì không tính.

(a)+(b) chỉ cho phép gọi là «ứng viên nghẽn». Có thêm (c) mới được nêu nguyên nhân. (d)+(e) là điều kiện để phép đo hợp lệ.

**Nguồn dữ liệu thực:** sổ tiếp nhận (A02), phiếu trình (A06/A07), sổ văn thư (A08), tin nhắn/email đã gửi (A04/A11/A14). Các nguồn này thường chỉ có ngày, nên mô phỏng ở mức phút chỉ minh họa phương pháp.


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

## 4.7 Kết quả Process Mining đã chạy (Dữ liệu mô phỏng)

> Chạy ngày 24/10/2026: 7 cấu hình × 20 seed × 400 hồ sơ, đơn vị phút làm việc (450 phút/ngày). Code, test và hình: `04-process-mining/` (xem 04-process-mining/README.md). Codex và Antigravity đã rà soát code 2 đợt (07-nhat-ky-ai/luot-3, run-4); 12 test tự động đều đạt. **Đây là dữ liệu mô phỏng, không phải số đo tại trường.**

| KPI (trung vị qua 20 seed) | AS-IS | TO-BE S0 (vẫn ký theo lô) | TO-BE S1 (ký 2 lần/ngày) | TO-BE S1, p không giảm | Seed S1 tốt hơn AS-IS |
|---|---|---|---|---|---|
| K1 trung vị T_trường | 1.363 | 944 | 788 | 792 | 20/20 |
| K2 P90 T_trường_net | 1.780 | 1.356 | 804 | 810 | 20/20 |
| K3 trung vị chờ trước ký | 551 | 584 | 121 | 120 | 20/20 (S0: 0/20) |
| K4 xử lý của cán bộ/ca | 43 | 21 | 21 | 23 | 20/20 |
| Trễ phát hiện quá hạn bổ sung | 1.239 | 0 | 0 | 0 | – |
| K9 tỷ lệ phải bổ sung | 30,1% | 15,6% | 15,6% | 30,1% | (tham số đầu vào) |

Hình cho slide: `04-process-mining/out/dfg_AS-IS.png`, `dfg_TB-S1-p15.png` (slide 7), `wait_process.png` (slide 7–8), `kpi_compare.png` (slide 12). Event log CSV để kiểm tra độc lập: `04-process-mining/out/eventlog_seed20260302.csv`.

**Thông điệp đã chốt (Codex + Antigravity, run-4):**
1. *Slide 7.* Ở AS-IS, chờ trình ký A06→A07 là ứng viên nghẽn duy nhất đạt đủ 3 tiêu chí (tô đỏ): trung vị 621 phút làm việc, P90 1.201 phút, 63% số ca chờ hơn 1 ngày làm việc, xuất hiện ở 369/400 ca. Ở TO-BE S1 không còn cạnh đỏ; chờ trước ký còn 123 phút.
2. *Slide 7.* Sau khi chuẩn hóa bước tương đương, tỷ lệ hồ sơ đi thẳng tăng từ 62,3% lên 75,5%; tỷ lệ phải bổ sung giảm từ 30,1% xuống 15,6%, nhưng mức giảm này là giả định đầu vào p, không phải phát hiện.
3. *Slide 8.* Các hàm lịch làm việc khớp tính tay trên mốc C001–C004 (843 / 1.693 / 1.233 / 5.740 phút; chờ ký 555 và 585; trễ phát hiện 2.130; tuổi net C004 = 95). Hàm tính KPI được kiểm trực tiếp trên ca C001.
4. *Slide 12.* Qua 20 seed ghép cặp, TO-BE S1 giảm trung vị T_trường 574 phút (từ 1.363 xuống 788) và chờ trước ký 434 phút (từ 551 xuống 121), tốt hơn AS-IS ở 20/20 seed.
5. *Slide 12.* Nếu chỉ tự động hóa mà vẫn ký theo lô (S0), chờ trước ký **không giảm** (+26 phút, 0/20 seed): phần cải thiện chờ ký đến từ đổi lịch ký, không phải từ phần mềm. Phần mềm giảm thao tác cán bộ từ 43 xuống 21 phút/ca và đưa trễ phát hiện quá hạn về 0.

**Không được kết luận:** (1) hiệu quả thực tế tại trường; (2) tự động hóa đơn thuần làm giảm chờ ký; (3) form web chắc chắn giảm một nửa hồ sơ phải bổ sung, hay nhắc hạn làm giảm tỷ lệ đóng quá hạn (K6 giữ 12,7–14,2% vì mô hình giữ cố định hành vi SV); (4) đạt mục tiêu K5: K5 net bằng 0% ở mọi cấu hình nên không phân biệt được kịch bản, thay bằng K5b gross (9,8% so với 0% ở S1) và trễ phát hiện; (5) chờ A01→A02 249 phút là xếp hàng thật (phần lớn do quy ước làm tròn 07:30 của GA10); (6) ngoại suy cho nhiều cán bộ, mùa cao điểm, hay ngày lễ 30/4–1/5 (chưa loại trừ).

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


# Vòng 3 – Tổng hợp pass 1: mục 6–10 (toàn văn đã chỉnh sửa)
> Kế thừa A01–A17, L1–L5, G1–G3, GA*, D4–D9. Mọi số liệu Process Mining là **DỮ LIỆU MÔ PHỎNG**. Bản này đã xử lý D8/C1 và toàn bộ phản biện critique pass 1.

## 6. Prototype tự động hóa (đã dựng và chạy được)

> Mục này mô tả **prototype thật** đem demo, nằm ở thư mục `05-prototype/` của repo này (trước ngày 24/10/2026 nằm ở OneDrive, thư mục `student-certificate-staging`). Bản đặc tả trước đây (n8n quyết định mọi chuyển trạng thái, WF1–WF5) được thay bằng kiến trúc dưới đây.

**Kiến trúc 4 dịch vụ (Docker Compose, chạy local):**

| Dịch vụ | Vai trò | Địa chỉ |
|---|---|---|
| App (FastAPI + Jinja + PM4Py) | Giao diện SV, cán bộ, phân tích; **bên duy nhất ghi trạng thái và event log**; kiểm tra vai trò, trạng thái, version, Idempotency-Key | http://localhost:8000 (`/staff`, `/analytics`) |
| PostgreSQL 17 | Data source: hồ sơ, event log, outbox | nội bộ |
| n8n Community 2.44 | Điều phối nghiệp vụ: nhận webhook, đọc hồ sơ, tiền kiểm, gọi chuyển trạng thái, gửi email, callback | http://localhost:5678 |
| Mailpit 1.31 | Hộp thư thử nghiệm local, không gửi ra Internet | http://localhost:8025 |

**Máy trạng thái (app/state_machine.py):** SUBMITTED →(n8n) PRECHECK_OK hoặc NEED_SUPPLEMENT (bắt buộc lý do) → (cán bộ) IN_REVIEW → APPROVED / REJECTED (bắt buộc lý do) / NEED_SUPPLEMENT → (cán bộ) ISSUED; NEED_SUPPLEMENT →(SV gửi lại) SUBMITTED, tăng `attempt_no`. Chuyển trạng thái sai vai trò hoặc sai thứ tự bị từ chối.

**Workflow n8n** (`n8n/workflows/student-certificate.json`), đáp ứng yêu cầu tối thiểu của giảng viên:

| Yêu cầu | Node trong workflow |
|---|---|
| 1 trigger | Webhook "Nhận yêu cầu từ Web" (`POST /webhook/certificate-process`) |
| Data source | HTTP "Đọc hồ sơ và nguồn dữ liệu sinh viên" (API app, đọc PostgreSQL) |
| Condition | IF "Là yêu cầu tiền kiểm?", IF "Đủ điều kiện và đủ thông tin?" |
| ≥ 4 actions | HTTP "Ghi kết quả tiền kiểm đạt", HTTP "Ghi yêu cầu bổ sung", HTTP "Xác nhận đồng bộ thông báo", "Phản hồi thành công" |
| Notification | Send Email "Gửi thông báo qua Mailpit" (SMTP) |

**Chống thành công giả:** giao diện chỉ coi là đã thông báo khi callback từ n8n về (`automation_status = SYNCED`); nếu n8n hoặc callback lỗi, hồ sơ giữ `PENDING`/`FAILED`. Gửi lại cùng Idempotency-Key không tạo hồ sơ mới.

**Kiểm thử đã chạy (24/10/2026):** `scripts/smoke-e2e.py` PASS – tạo hồ sơ, replay Idempotency-Key không tạo trùng, n8n hoàn thành tiền kiểm, cán bộ IN_REVIEW → APPROVED → ISSUED, n8n gửi email và callback SYNCED, event log có cấp giấy và thông báo, Mailpit có thư thật. Sau đó `scripts/reset-demo.sh` xóa riêng 2 ca demo, giữ dữ liệu mô phỏng.

**Kiểm thử qua giao diện web (24/10/2026, trình duyệt tự động, `05-prototype/scripts/kiem-thu-giao-dien/ui_e2e.py` và `05-prototype/scripts/kiem-thu-giao-dien/ui_supplement.py`):** luồng nộp form → n8n tiền kiểm → cán bộ nhận xử lý, duyệt, cấp giấy → email trong Mailpit, trạng thái SYNCED đạt; vòng cán bộ yêu cầu bổ sung (có lý do) → SV gửi lại → n8n tiền kiểm lại với `attempt_no = 2` đạt. Trong lúc chuẩn bị đã sửa 3 lỗi của prototype (reset không xóa khóa idempotency; cấp giấy qua API không gửi thông báo, khiến smoke test trước đó PASS giả; trùng khóa nhật ký khi có hai thông báo trong một lượt), xem `05-prototype/docs/chuan-bi-truoc-demo.md`. 20 test tự động của prototype đạt.

**Khác biệt với mô hình phân tích (cần nói rõ khi trình bày):** prototype gộp một số bước so với BPMN TO-BE (ví dụ tiền kiểm tự động của n8n đứng trước bước cán bộ xem xét; chưa có timer nhắc hạn A16 và đóng hồ sơ quá hạn A13). Trang Analytics trong app chạy PM4Py trên bộ mô phỏng nhỏ của app (seed 43044, 120 ca mỗi kịch bản) để minh họa; **số liệu chính của bài** lấy từ bộ mô phỏng 20 seed ở mục 4.7.

## 7. Đánh giá cải tiến (mục tiêu đều là DỰ KIẾN)
| KPI | Loại | Công thức (phút làm việc) | Mục tiêu dự kiến |
|---|---|---|---|
| K1 T_trường | Efficiency | c(A11/A14/A13) − c(A01), trung vị/P90 | Trung vị TO-BE < AS-IS ở ≥18/20 seed, báo riêng S0/S1 |
| K2 T_trường_net | Efficiency | K1 − thời gian SV | P90 ≤ GA4 (2250) |
| K3 Chờ trước A07 | Efficiency | s(A07) − c(event trước) | Trung vị ≤ 450 ở S1; S0 chỉ báo cáo |
| K4 Xử lý L2/ca | Efficiency | Σ(c−s) của các task L2 | Thấp hơn AS-IS ở 20/20 seed |
| K5 Quá hạn chính | Efficiency | Số ca có tuổi net > GA4 tại mốc thứ Sáu 17:00 / số ca tồn | Thấp hơn AS-IS ở ≥18/20 seed |
| K6 Tỷ lệ E3 | Effectiveness | Số ca A13 / số ca có A04 | Chỉ mô tả, vì A16 không đổi hành vi SV trong mô phỏng |
| K7 Thông báo có bằng chứng nhận | Effectiveness | Số ca kết thúc có thư trong Mailpit API / số ca kết thúc | 100% |
| K8 Từ chối có lý do | Effectiveness | Số A07 reject có reason_code / số reject | 100% |
| K9 Tỷ lệ bổ sung, số vòng | Effectiveness | Số ca có ≥1 A04 / tổng ca; count(A04) | Chỉ mô tả, vì p là tham số đầu vào |

**Kiểm thử hệ thống (đạt/không đạt, không phải KPI cải tiến):**
- T1: số case/event trùng = 0.
- T2: c(A13) − due_at ≤ 2 phút.
- T3: hành động sai trạng thái trả 409.
- T4: không có thông báo thành công giả.
- T5: khởi động lại không mất dữ liệu.

**Nguồn và tần suất đo:** dữ liệu lấy từ bảng events. Mô phỏng: đo 1 lần cho mỗi cấu hình × 20 seed. Demo: đo mỗi lần chạy. Thí điểm thật (giai đoạn sau): đo hằng tuần.

**Bảng so sánh:** các cột AS-IS | TO-BE-S0 | TO-BE-S1 | độ nhạy p; mỗi ô ghi trung vị (min–max của 20 seed). Hiện để trống vì chưa chạy.

**Giới hạn:** kết quả phụ thuộc tham số giả định; L2 chỉ có 1 người; mô hình chưa được kiểm định bằng log thật; phần lớn mức cải thiện đến từ S1 và p.

### Cập nhật cuối cho mục 7 (run 2)

**Tổng hợp pass 1: bản cuối mục 6–7.** Mục 1–5 giữ nguyên như bản hiện tại. Mục 8–10 làm ở pass 2. D1 được chấp nhận, có sửa theo C1. C1 vẫn mở cho tới khi người phản biện đóng. Phần nào không nêu dưới đây thì giữ nguyên như bản hiện tại (bao-cao:248–322).

#### §7 Đánh giá (mọi mục tiêu đều là DỰ KIẾN)
- **Nhóm so sánh AS-IS/TO-BE:** K1, K2, K3 giữ nguyên. K5 ghi rõ mốc đo là mọi thứ Sáu 17:00 trong 12 tuần đến, báo trung vị qua các mốc. Mỗi KPI báo thêm hiệu theo cặp cùng seed (nhờ CRN), gồm trung vị và min–max của hiệu. Ngưỡng >=18/20 seed được chốt trước khi chạy và công bố cùng seed.
- **Nhóm chỉ mô tả (không đặt mục tiêu):** K4 (mức giảm đến từ tham số: A06 15 phút thành A17 5 phút, A04 3 phút xuống 2 phút); K6; K9; trễ phát hiện = s(A13) − due_at (đã có ở §4.5; TO-BE bằng 0 do thiết kế timer, kiểm trên demo bằng T2). Không thêm K10.
- **Nguồn và tần suất cho từng KPI:** lấy từ bảng events mô phỏng, đo 1 lần cho mỗi cấu hình × 20 seed; khi thí điểm sau này thì đo hằng tuần. Dữ liệu demo chỉ để minh họa, không dùng để so sánh.
- **P1** không có KPI định lượng vì AS-IS không có dữ liệu; kiểm bằng T8.
- **Kiểm thử (đạt/không đạt):** T1–T5 giữ nguyên; T2 trên demo đo bằng phút lịch. T6: mọi ca kết thúc đều có thư trong Mailpit (K7 cũ). T7: reject thiếu lý do trả 422; có lý do thì có thư A14 (K8 cũ, brief:159). T8: hồ sơ hợp lệ đi tới A11, có thư, SV tra được mã và trạng thái (brief:157). T9: vòng bổ sung rồi xử lý tiếp (brief:158). T10: event log và dashboard khớp thao tác demo (brief:163). T11: chỉ số khớp số tính tay ở §4.6 (brief:164). T12: reset chỉ xóa data_origin=demo; CSV export đọc lại được bằng PM4Py (brief:152). T13: sai vai trò trả 403, không có event. T14: 2 request trùng key gửi song song: chỉ 1 case, không có lỗi 500.
- **Bảng so sánh:** thêm cột hiệu theo cặp; vẫn để trống vì chưa chạy. Phần giới hạn của §7 giữ nguyên.

**Xử lý phản biện:** C1: áp dụng ranh giới mới (n8n quyết định, fn_apply chỉ ghi nguyên tử, HTML ghi cùng c(A06)). Điểm 2: thêm bảng ánh xạ node. Điểm 3: A02 là event tạo mã, email chỉ là outbox. Điểm 4: actor_id chỉ có ở bảng events của demo. Điểm 5: gọi là kiểm tra vai trò mức demo. Điểm 6: thêm run_id. Điểm 7: DEMO tính phút lịch, T2 đo theo phút lịch. Điểm 8: bỏ K10, đưa vào nhóm chỉ mô tả.

- **Bổ sung nhỏ vào §6 để khớp D2/C1:** (a) trong WF2, node kiểm tra vai trò theo actor_id chạy TRƯỚC khi đọc và kiểm tra trạng thái hồ sơ, nên sai vai trò luôn trả 403; (b) hành động pickup (A12) chỉ hợp lệ khi hồ sơ ở trạng thái ISSUED VÀ đã có sự kiện c(A11) (tức outbox đã sent), nếu WF5 chưa ghi c(A11) thì trả 409; giao diện web khóa nút «SV đã nhận» cho tới khi outbox = sent; (c) thanh chọn nhanh actor_id (SV001, OFF01, APP01, CLK01) trên web chỉ là công cụ chuyển vai phục vụ demo, không phải cơ chế xác thực người dùng.

## 8. Dàn ý slide (20 phút, thay toàn bộ mục 8; không ghi thời lượng hay mã nội bộ lên slide)
- **Slide 1 – Cấp giấy xác nhận sinh viên: phân tích và tự động hóa quy trình** | Thông điệp: Giới thiệu đề tài, phạm vi thử nghiệm học thuật và nhóm thực hiện | Nội dung: (1) tên đề tài và 4 loại giấy xác nhận trong phạm vi; (2) mục tiêu phân tích quy trình kết hợp tự động hóa; (3) phạm vi prototype học thuật, dùng dữ liệu mô phỏng, không phát hành giấy có giá trị pháp lý | Hình: sơ đồ phạm vi đề tài và 4 thành viên | Trình bày: TV1.
- **Slide 2 – Bài toán nghiệp vụ (giả định học thuật)** | Thông điệp: Sinh viên khó theo dõi tiến độ, cán bộ mất thời gian xử lý thủ công và rà sổ | Nội dung: (1) 5 vấn đề giả định: sinh viên không tra cứu được trạng thái hồ sơ, hồ sơ thiếu thông tin phát hiện muộn, chờ trình ký theo đợt lâu, hồ sơ quá hạn chỉ lộ ra khi rà sổ cuối tuần, thông báo kết quả không lưu vết; (2) mục tiêu dự kiến: cấp mã tra cứu minh bạch, kiểm tra biểu mẫu ngay khi nộp, tách thời gian chờ và xử lý, tự động nhắc hạn và lưu vết thông báo | Hình: sơ đồ các bên liên quan (Sinh viên, Cán bộ tiếp nhận, Lãnh đạo ký, Văn thư) | Trình bày: TV1.
- **Slide 3 – Tổng quan quy trình đầu-cuối** | Thông điệp: Quy trình đi từ lúc sinh viên nộp yêu cầu đến một trong ba kết cục rõ ràng | Nội dung: (1) đầu vào (thông tin sinh viên, loại giấy, mục đích, minh chứng) và đầu ra (giấy xác nhận hoặc thông báo từ chối có lý do, nhật ký sự kiện); (2) ba kết cục: sinh viên nhận giấy, từ chối có lý do, đóng hồ sơ do quá hạn bổ sung; (3) hai thước đo tách biệt: thời gian phía trường và tổng thời gian tính cả phía sinh viên | Hình: sơ đồ SIPOC và ranh giới 2 mốc đo thời gian | Trình bày: TV1.
- **Slide 4 – Quy trình hiện tại (giả định)** | Thông điệp: Quy trình hiện tại qua 4 vai trò với nhiều bước thủ công và vòng lặp bổ sung | Nội dung: (1) luồng xử lý qua 4 làn: sinh viên nộp đơn, cán bộ ghi sổ và kiểm tra, lãnh đạo duyệt ký, văn thư đóng dấu; (2) ba nhánh sau kiểm tra: đủ điều kiện, yêu cầu bổ sung, hoặc trình từ chối; (3) việc rà soát hồ sơ quá hạn bổ sung chỉ thực hiện thủ công vào chiều thứ Sáu | Hình: sơ đồ BPMN quy trình hiện tại (4 làn ngang) | Trình bày: TV2.
- **Slide 5 – Các ứng viên điểm nghẽn** | Thông điệp: Bốn vị trí có nguy cơ gây trễ được đặt làm giả thuyết ngang hàng để kiểm chứng bằng dữ liệu | Nội dung: (1) bốn vị trí ứng viên: chờ ký theo đợt, vòng lặp yêu cầu bổ sung, chờ kiểm tra đầu vào do kiêm nhiệm, và chờ chuyển giấy đã ký sang đóng dấu; (2) nguyên nhân giả định và ảnh hưởng của từng vị trí tới thời gian chờ của sinh viên; (3) tiêu chí xác nhận điểm nghẽn công bố trước: thời gian chờ trung vị thuộc nhóm 3 bước cao nhất, từ một nửa số ca trở lên vượt ngưỡng, có bằng chứng nguyên nhân và chỉ tính theo giờ làm việc | Hình: sơ đồ BPMN đánh dấu 4 vị trí kèm bảng tóm tắt vị trí – nguyên nhân – ảnh hưởng | Trình bày: TV2.
- **Slide 6 – Thiết kế dữ liệu mô phỏng (nhãn: Dữ liệu mô phỏng)** | Thông điệp: Hai kịch bản hiện tại và đề xuất được mô phỏng trên cùng cơ sở ngẫu nhiên để so sánh công bằng | Nội dung: (1) mô phỏng 400 hồ sơ trong 12 tuần đến cộng 8 tuần xả hàng, lặp lại qua 20 hạt giống ngẫu nhiên độc lập; (2) ghép cặp từng hồ sơ giữa hai kịch bản bằng cùng luồng số ngẫu nhiên để giảm nhiễu; (3) công khai các tham số giữ cố định (tỷ lệ loại giấy, hành vi sinh viên) và tham số thay đổi (tự động hóa thao tác, lịch ký, kiểm tra đầu vào) | Hình: bảng đối chiếu tham số cố định và tham số thay đổi giữa hai kịch bản | Trình bày: TV3.
- **Slide 7 – Kết quả khai phá quy trình (nhãn: Dữ liệu mô phỏng)** | Thông điệp: Bản đồ quy trình làm rõ luồng biến thể phổ biến và vị trí có thời gian chờ lớn nhất | Nội dung: (1) bản đồ tần suất và thời gian chuyển bước, các biến thể quy trình phổ biến nhất; (2) tỷ lệ hồ sơ phải bổ sung và phân bố số vòng lặp; (3) quy tắc tô màu ứng viên nghẽn tính theo phút làm việc: màu đỏ khi thuộc nhóm 3 bước chờ lâu nhất, từ 50% số ca chờ quá 1 ngày làm việc và chiếm từ 10% tổng số ca | Hình: đồ thị luồng trực tiếp (DFG) có tô màu kèm hộp chú giải công thức | Trình bày: TV3.
- **Slide 8 – Kiểm chứng công thức bằng tính tay (nhãn: Dữ liệu mô phỏng)** | Thông điệp: Số liệu thời gian do công cụ tính khớp hoàn toàn với kết quả tính tay trên tập hồ sơ mẫu | Nội dung: (1) chọn 4 hồ sơ mẫu của quy trình hiện tại và 2 hồ sơ mẫu của quy trình đề xuất đại diện cho các nhánh xử lý; (2) đối chiếu từng đại lượng: thời gian chờ, thời gian xử lý, thời gian sinh viên phản hồi và độ trễ phát hiện quá hạn; (3) xác nhận công cụ trừ đúng giờ nghỉ và tách đúng thời gian của trường khỏi thời gian của sinh viên | Hình: bảng đối chiếu 6 hồ sơ mẫu giữa cột tính tay và cột kết quả từ mã nguồn | Trình bày: TV3.
- **Slide 9 – Quy trình đề xuất (TO-BE)** | Thông điệp: Loại bỏ bước thừa, tự động hóa sinh giấy và thông báo, kiểm soát dữ liệu ngay từ biểu mẫu | Nội dung: (1) kiểm tra định dạng ngay khi nộp biểu mẫu web và cấp mã hồ sơ tự động; (2) hệ thống tự sinh bản thảo giấy xác nhận từ mẫu, tự động nhắc hạn và đóng hồ sơ đúng thời điểm quá hạn; (3) giữ nguyên thẩm quyền duyệt của lãnh đạo và đóng dấu của văn thư, bổ sung thông báo qua hộp thư có lưu vết | Hình: sơ đồ BPMN quy trình đề xuất (5 làn, có làn hệ thống) và bảng ánh xạ thay đổi | Trình bày: TV2.
- **Slide 10 – Kiến trúc prototype tự động hóa** | Thông điệp: Giao diện web chỉ hiển thị, n8n quyết định toàn bộ nghiệp vụ, cơ sở dữ liệu bảo đảm tính nguyên tử | Nội dung: (1) phân vai rõ ràng: web gửi yêu cầu, 5 luồng công việc trên n8n kiểm tra điều kiện và quyết định trạng thái, PostgreSQL lưu trữ nguyên tử; (2) máy trạng thái chặt chẽ có bước nhận xử lý và hoàn tất cho từng công đoạn; (3) hộp thư thử nghiệm nội bộ Mailpit lưu bằng chứng nhận thư trước khi ghi nhận sự kiện hoàn tất thông báo | Hình: sơ đồ kiến trúc các thành phần và sơ đồ máy trạng thái hồ sơ | Trình bày: TV4.
- **Slide 11 – Đáp ứng yêu cầu kỹ thuật tối thiểu và an toàn giao dịch** | Thông điệp: Hệ thống thỏa mãn đầy đủ cấu phần tự động hóa tối thiểu và chống trùng lặp dữ liệu | Nội dung: (1) ánh xạ đủ cấu phần bắt buộc: bộ kích hoạt (nhận biểu mẫu và lịch định kỳ), điều kiện rẽ nhánh, 7 hành động xử lý, nguồn dữ liệu PostgreSQL và thông báo qua Mailpit; (2) cơ chế khóa chống gửi trùng bảo đảm bấm gửi lại hoặc gửi song song không tạo hồ sơ hay sự kiện thừa; (3) kiểm tra đúng vai trò trước khi thực hiện thao tác và không hiển thị thông báo thành công giả khi dịch vụ lỗi | Hình: bảng ánh chiếu yêu cầu kỹ thuật sang các nút xử lý trong n8n | Trình bày: TV4.
- **Slide 12 – Đánh giá cải tiến và kiểm thử hệ thống (nhãn: Dữ liệu mô phỏng – Mục tiêu dự kiến)** | Thông điệp: Mô phỏng cho thấy tiềm năng giảm thời gian chờ, đồng thời hệ thống vượt qua bộ kiểm thử kỹ thuật | Nội dung: (1) nhóm chỉ số so sánh hai kịch bản theo cặp hạt giống: thời gian hoàn thành phía trường, thời gian ròng, thời gian chờ duyệt và tỷ lệ quá hạn; (2) nhóm chỉ số mô tả đặc trưng quy trình: thời gian thao tác của cán bộ, tỷ lệ đóng do quá hạn, tỷ lệ bổ sung và độ trễ phát hiện quá hạn bằng 0; (3) kết quả 14 bài kiểm thử đạt/không đạt về luồng nghiệp vụ, chống trùng, phân quyền, chịu lỗi và toàn vẹn dữ liệu | Hình: biểu đồ cột so sánh trung vị kèm khoảng min–max qua 20 hạt giống và bảng kết quả kiểm thử | Trình bày: TV4.
- **Slide 13 – Giới hạn nghiên cứu và kế hoạch tiếp theo** | Thông điệp: Kết quả mô phỏng chỉ minh họa phương pháp, cần nhật ký thực tế tại trường để kiểm định | Nội dung: (1) giới hạn hiện tại: tham số thời gian và tỷ lệ bổ sung là giả định, giả sử 1 cán bộ tiếp nhận, chưa tích hợp cơ sở dữ liệu thật; (2) kế hoạch thu thập nhật ký thực tế từ sổ tiếp nhận, phiếu trình và hộp thư trong giai đoạn thí điểm; (3) lộ trình hiệu chỉnh tham số mô phỏng và đo kiểm hằng tuần khi triển khai thực tế | Hình: sơ đồ lộ trình 3 bước từ prototype học thuật đến thí điểm tại trường | Trình bày: TV1.
- **Phân công nhóm 4 thành viên:** Trình bày 20 phút (~5 phút/người): TV1 (slide 1–3, 13), TV2 (slide 4–5, 9), TV3 (slide 6–8), TV4 (slide 10–12). Demo 10 phút: TV3 thao tác trên giao diện, TV4 thuyết minh kết quả và log, TV1 bấm giờ và kích hoạt phương án dự phòng khi cần, TV2 điều phối phần hỏi đáp.

## 9. Kịch bản demo 10 phút (trên prototype staging)

**Trước giờ demo:** `docker compose up -d` trong thư mục staging; kiểm tra 5 địa chỉ ở mục 6 trả về 200; chạy `sh scripts/reset-demo.sh` (chỉ xóa dữ liệu demo); mở sẵn các tab Sinh viên, Cán bộ, Analytics, Mailpit, n8n. Không dùng `docker compose down -v` (xóa dữ liệu).

| Thời gian | Người | Thao tác | Kết quả mong đợi |
|---|---|---|---|
| 0:00–0:45 | TV1 | Giới thiệu 4 thành phần và phạm vi prototype local | Người xem hiểu đây là bản thử nghiệm |
| 0:45–2:00 | TV2 | Nộp hồ sơ hợp lệ ở trang Sinh viên | Nhận mã hồ sơ GXN-…; thông báo ở trạng thái PENDING trước callback |
| 2:00–3:30 | TV2 | Mở n8n, đi qua Webhook → đọc hồ sơ → IF → ghi kết quả → SMTP → callback | n8n thực sự xử lý, không chỉ là hình minh họa |
| 3:30–5:10 | TV3 | Cán bộ nhận xử lý, duyệt, xác nhận đã cấp | Trạng thái đúng thứ tự; event start/complete được ghi |
| 5:10–5:50 | TV3 | Mở Mailpit | Có email thử nghiệm đúng mã hồ sơ; giao diện đổi sang SYNCED |
| 5:50–7:00 | TV3 | Hồ sơ thứ hai: yêu cầu bổ sung (có lý do), SV gửi lại | Vòng bổ sung; `attempt_no` tăng |
| 7:00–8:50 | TV4 | Mở Analytics, lọc AS-IS/TO-BE, tải CSV; chiếu kết quả 20 seed (slide 7, 11) | Biến thể, chờ/xử lý, tồn đọng; nhãn "Dữ liệu mô phỏng" |
| 8:50–9:30 | TV4 | Thử thao tác sai thứ tự / gửi lại cùng khóa | Bị từ chối; không tạo hồ sơ trùng |
| 9:30–10:00 | TV1 | Tổng kết | Phân biệt kết quả mô phỏng với hiệu quả đã chứng minh |

**Dự phòng:** n8n chậm → dùng hồ sơ đã chuẩn bị sẵn và chỉ log/outbox, Mailpit; workflow lỗi → nói rõ hồ sơ còn PENDING/FAILED (minh họa chống thành công giả); Analytics không render → mở CSV và hình `04-process-mining/out/*.png`; hỏng máy → ảnh chụp màn hình gắn nhãn "Bằng chứng ghi sẵn".

## 10. Checklist ánh xạ yêu cầu giảng viên sang bằng chứng (thay toàn bộ mục 10)
- **1. Nhóm 4 học viên, trình bày 20 phút và demo 10 phút (brief:53,66,178,179):** §8 (dàn ý 13 slide, phân công TV1–TV4), §9 (kịch bản 9 bước có mốc phút và dự phòng) | Trạng thái: Có trong báo cáo.
- **2. Bài toán nghiệp vụ và tổng quan quy trình (brief:54):** §1 (P1–P5, SIPOC, 2 mốc đo T_trường và T_SV, GA1–GA14), slide 2–3 | Trạng thái: Có trong báo cáo.
- **3. Mô tả AS-IS bằng BPMN/Swimlane chỉnh sửa được (brief:55,175):** §2 (bảng A01–A14, 4 lane, quy tắc R1–R6, biến thể V1–V5), slide 4 | Trạng thái: Đã có 03-so-do-quy-trinh/as-is.bpmn (chỉnh được) và as-is.png; Codex + Antigravity đã rà (ai-collab-run-5).
- **4. Tối thiểu 1 điểm nghẽn: vị trí, nguyên nhân, ảnh hưởng (brief:56):** §3 (4 ứng viên H1–H4, tiêu chí công khai (a)–(e)), slide 5 | Trạng thái: Đã chốt trên dữ liệu mô phỏng: A06→A07 (chờ ký, H1) đạt đủ tiêu chí (a)(b)(f) (mục 4.7).
- **5. Khai phá quy trình, tách thời gian node khỏi nghiệp vụ, công khai tiêu chí tô màu và đủ mục dashboard (brief:57,109,111–138):** §4.1–4.5 (schema, công thức phút làm việc, tô màu đỏ/vàng, thiết kế DES 20 seed CRN, các biểu đồ tồn/quá hạn/chờ/xử lý/so sánh), §6 (thời gian chạy node không tính vào nghiệp vụ), slide 6–7 | Trạng thái: Đã chạy (mục 4.7, 04-process-mining/): DFG, biến thể, chờ/xử lý, KPI 20 seed, CSV; dashboard web chờ dựng cùng n8n.
- **6. Đề xuất quy trình TO-BE và sơ đồ chỉnh sửa được (brief:58,175):** §5 (bảng A01–A17 qua 5 lane, ánh xạ nguyên nhân sang thay đổi, R3'/R4'/R7/R8), slide 9 | Trạng thái: Đã có 03-so-do-quy-trinh/to-be.bpmn (chỉnh được) và to-be.png; Codex + Antigravity đã rà (ai-collab-run-5).
- **7. Prototype tối thiểu 1 trigger, 4 actions, 1 condition, 1 data source, 1 notification; n8n xử lý nghiệp vụ thật; xuất workflow JSON và hướng dẫn import (brief:59–64,94–99,173):** §6 (bảng ánh xạ 2 trigger, 4 condition, 7 action, PostgreSQL, Mailpit; phân vai n8n quyết định trạng thái; WF1–WF5), slide 10–11, demo B1–B7, B9 | Trạng thái: Đặc tả có trong báo cáo; chờ dựng và xuất file JSON.
- **8. Thông báo có bằng chứng nhận thực sự qua Mailpit, gắn nhãn thử nghiệm (brief:105):** §6 (WF5 đối chiếu Mailpit API theo msg_id trước khi ghi c(A11/A14), tiêu đề có nhãn [EMAIL THỬ NGHIỆM]), demo B1, B3, B6, B7, B9 (T6) | Trạng thái: Đặc tả có trong báo cáo; chờ dựng.
- **9. Dữ liệu mô phỏng có seed, bộ sinh dữ liệu, event log mẫu, nhãn «Dữ liệu mô phỏng», tách dữ liệu demo, xuất CSV và reset an toàn (brief:142–152,174):** §4.1, §4.4, §6 (run_id, data_origin=simulated/demo), slide 6–8, 12, demo B9 (T10, T12) | Trạng thái: Đặc tả có trong báo cáo; chờ viết script sinh dữ liệu và dựng.
- **10. Đánh giá cải tiến, giải thích phương pháp đo và giới hạn (brief:65,177):** §7 (nhóm KPI so sánh K1, K2, K3, K5; nhóm mô tả K4, K6, K9, trễ phát hiện; kiểm thử T1–T14; giới hạn mô hình), slide 12–13 | Trạng thái: Phương pháp và khung đánh giá có trong báo cáo; bảng số liệu chờ chạy.
- **11. Mã nguồn khóa phiên bản dependency, Docker Compose và .env.example không chứa bí mật (brief:171,172):** §6 (đặc tả biến môi trường, volume, Header Auth trong .env) | Trạng thái: Chờ dựng.
- **12. Nhật ký hợp tác AI, quyết định kiến trúc và kết quả kiểm thử (brief:180):** thư mục 07-nhat-ky-ai/luot-1/, §6–7 (quyết định phân vai D1/D2, T1–T14) | Trạng thái: Nhật ký phân tích và quyết định đã có; kết quả chạy kiểm thử chờ dựng.
- **13. Hướng dẫn khởi động, tài khoản demo, địa chỉ truy cập và cách reset (brief:181):** §6 (tài khoản demo SV001, OFF01, APP01, CLK01), §9 (trình tự khởi động và reset) | Trạng thái: Đặc tả có trong báo cáo; tài liệu README vận hành chờ hoàn thiện khi dựng.
- **14. Smoke test toàn luồng và ánh xạ bộ kiểm thử nghiệm thu (brief:157–167):** (a) brief:157 luồng hợp lệ tới cấp giấy và thông báo -> T8, demo B3; (b) brief:158 vòng bổ sung rồi xử lý tiếp -> T9, demo B5; (c) brief:159 từ chối có lý do và thông báo -> T7, demo B6; (d) brief:160 gửi lại không tạo bản ghi/event trùng -> T1 (demo B2) và T14 (2 request song song chạy trước giờ); (e) brief:161 chặn hành động không hợp lệ trạng thái/vai trò -> T3 (409 sai trạng thái, gồm cả chặn pickup trước khi có c(A11)) và T13 (403 sai vai trò), demo B3, B4; (f) brief:162 dịch vụ lỗi không báo thành công giả -> T4, demo B8; (g) brief:163 event log và dashboard khớp thao tác demo -> T10, demo B9 (kiểm tra trước khi reset); (h) brief:164 đối chiếu chỉ số thời gian với tập tính tay -> T11, §4.6, slide 8; (i) brief:165 khởi động lại không mất dữ liệu -> T5, demo B8; (j) brief:152 xuất CSV độc lập và reset chỉ xóa dữ liệu demo -> T12, demo B9; (k) timer quá hạn và bằng chứng nhận thư cho mọi ca kết thúc -> T2 (demo B7) và T6 (demo B9, kiểm tra trước khi reset) | Trạng thái: Kịch bản và tiêu chí nghiệm thu có trong báo cáo; chờ chạy thực tế.

**Xử lý toàn bộ phản biện pass 2:** (1) D2/C1 (pickup sớm): khóa nút trên web và chặn ở n8n trả 409 nếu chưa có c(A11); (2) B10 đảo thứ tự: kiểm T10, T6, xuất CSV rồi mới reset để kiểm T12; (3) thêm thanh chọn actor_id mức demo, tăng B3 lên 3 phút và gộp B8/B9 thành 1 lần khởi động lại; (4) kiểm tra vai trò trước trạng thái, tạo sẵn ca 3 ở APPROVING dùng chung cho B4 (403) và B6 (422 rồi reject); (5) làm rõ mốc phút của ca 4 và ngưỡng chuyển sang ca 4b lúc 6:15; (6) sửa toàn bộ slide 2, 5, 8, 11 để bỏ mã nội bộ, viết rõ 5 vấn đề giả định, ghi đúng 4 ca hiện tại + 2 ca đề xuất, gộp slide 11 còn 3 ý; (7) bổ sung đủ brief:109, 129–138, 167, 171, 174, 180, 181 và đổi trạng thái Bottleneck sang chờ chạy mô phỏng.
