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

---
Limitations:
- D1/C1 vẫn mở trong ledger vì chỉ antigravity được giải quyết. D1 đã bị thay bằng D2 (accepted); nội dung C1 đã được xử lý trong bảng mục 2. Các lượt propose và synthesize của antigravity bị contract_error, nên không có nội dung để đối chiếu.
- Đã xử lý trong văn bản các điểm 1–7 của phản biện pass 2: thuộc tính decision/origin (D4); A12 chỉ có complete và đo complete(A11)→complete(A12); H4 cũ bị loại khỏi danh sách nghẽn, chỉ dùng để tách T_SV; dữ liệu bị cắt khỏi T_SV; quy ước A01=07:30 (GA10); P5 chỉ đo được ở TO-BE; T_trường kết thúc ở A11, giải thích vì sao không dùng A09. H5 của bản nháp được đổi mã thành H4.
- Chưa chốt ngưỡng số cho (a)(b), GA4 và cỡ lô; vòng 2 phải chốt trước khi sinh dữ liệu theo tiêu chí (d). Vòng 2 cũng phải sinh thuộc tính decision/origin, tính trễ phát hiện quá hạn, và mô phỏng hồ sơ bị cắt.
- GA1–GA14, đơn vị CTHSSV, việc phân công ký và quy tắc nộp sau hạn (GA14) đều là giả định; cần phỏng vấn cán bộ. GA14 có thể đổi sang nhận hồ sơ trễ nếu thực tế khác; khi đó phải sửa G3 và R4. Chưa có file BPMN; bảng mục 2 là đặc tả để vẽ trên bpmn.io hoặc draw.io.
- Phiên ở plan mode nhưng không có công cụ Write/ExitPlanMode, nên không tạo plan file và không sửa file nào. Lượt này không đọc lại brief; các trích dẫn dòng lấy lại từ ledger.