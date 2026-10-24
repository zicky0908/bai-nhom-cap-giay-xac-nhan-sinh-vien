# Báo cáo phân tích – Vòng 1 (mục 1–3), bản tổng hợp pass 1
> Mọi nội dung là **giả định học thuật**, chưa có dữ liệu hay quy trình chính thức của trường. Nhóm có thể chỉnh các mã GAx. Bài không trích dẫn quy định pháp luật nào.

## 1. Business Problem & Process Overview
**Bối cảnh (giả định):** Phòng Công tác HSSV (CTHSSV) đang cấp giấy xác nhận thủ công cho các loại: đang học, hoãn NVQS, vay vốn, học bổng. Quy trình gồm: nộp đơn giấy hoặc form online → tra danh sách SV → soạn giấy → trình ký → đóng dấu → báo SV qua điện thoại, Zalo hoặc email cá nhân.

**Vấn đề (giả thuyết, cần phỏng vấn để xác minh):**
- P1: SV không có mã hồ sơ để tra trạng thái. Số sổ chỉ được gán ở A02 và không báo cho SV.
- P2: Thiếu/sai thông tin bị phát hiện muộn, dẫn tới bổ sung nhiều vòng.
- P3: Chờ ký duyệt lâu.
- P4: Không ghi mốc thời gian có hệ thống, nên quá hạn chỉ lộ ra khi rà sổ thủ công.

**Mục tiêu (dự kiến):** tách được thời gian chờ và thời gian xử lý; giảm số vòng bổ sung; có mã hồ sơ và trạng thái minh bạch; cảnh báo quá hạn; thông báo nhất quán, có lý do.

**Bắt đầu:** A01 (SV nộp). **Kết thúc:** E1 SV nhận giấy; E2 SV nhận thông báo từ chối kèm lý do; E3 hồ sơ bị đóng do quá hạn bổ sung.

| Bên liên quan | Lane | Vai trò |
|---|---|---|
| Sinh viên | L1 | Nộp, bổ sung, nhận kết quả |
| Cán bộ CTHSSV | L2 | Tiếp nhận, kiểm tra, soạn giấy, xác nhận cấp, thông báo |
| Lãnh đạo phòng/người được ủy quyền | L3 | Quyết định duyệt/từ chối, ký |
| Văn thư | L4 | Đóng dấu, vào sổ |
| Phòng Đào tạo | – | Nguồn tra cứu tình trạng học tập |
| Cơ quan tiếp nhận giấy | – | Ngoài phạm vi |

**Đầu vào:** MSSV, họ tên, ngày sinh, lớp/khoa, loại giấy, mục đích, số bản, email, tệp kèm theo loại giấy (GA5). **Đầu ra:** giấy đã ký và đóng dấu, hoặc thông báo từ chối có lý do; bản ghi sổ/event log.
**Phạm vi:** từ lúc nộp đến E1/E2/E3. Ngoài phạm vi: ký số, giá trị pháp lý, tích hợp CSDL trường, cấp lại.

| Mã | Giả định |
|---|---|
| GA1 | Giờ làm việc T2–T6, 07:30–11:30 và 13:30–17:00, Asia/Ho_Chi_Minh |
| GA2 | 1 cán bộ tiếp nhận (kiêm nhiệm), 1 người ký |
| GA3 | Hạn bổ sung 7 ngày làm việc (tham số) |
| GA4 | Ngưỡng quá hạn toàn trình là tham số cấu hình (ví dụ 5 ngày làm việc), không phải quy định |
| GA5 | Mẫu giấy và giấy tờ kèm theo từng loại: nhóm cần xác minh |
| GA6 | A03 phân loại ra 3 kết quả. Chỉ L3 được quyết định từ chối, tại A07 |
| GA7 | AS-IS không giới hạn số vòng bổ sung |
| GA8 | AS-IS rà hồ sơ quá hạn vào chiều thứ Sáu hằng tuần; A13 ghi ở lần rà đầu tiên sau hạn |
| GA9 | AS-IS: case_id = số sổ gán ở A02; thời điểm A01 lấy theo ngày nộp ghi trên đơn/form |

## 2. AS-IS (Swimlane/BPMN)
| Mã | Hoạt động | Lane | Đi tới | Log |
|---|---|---|---|---|
| A01 | Nộp yêu cầu (sau start event) | L1 | A02 | C |
| A02 | Tiếp nhận, ghi sổ, gán số | L2 | A03 | S+C |
| A03 | Kiểm tra thông tin và tư cách, ghi lý do | L2 | G1 | S+C |
| G1 | XOR: kết quả kiểm tra? | L2 | Đủ→A06; Thiếu/sai→A04; Không đủ tư cách→A07 (phiếu đề xuất từ chối, không soạn giấy) | – |
| A04 | Báo SV bổ sung, nêu mục thiếu | L2 | A05 | S+C |
| A05 | SV bổ sung, nộp lại | L1 | A03; timer biên (GA3+GA8)→A13 | C |
| A06 | Soạn giấy và phiếu trình | L2 | A07 | S+C |
| A07 | Xem xét, quyết định; ký nếu duyệt | L3 | G2 | S+C |
| G2 | XOR: quyết định? | L3 | Duyệt→A08; Từ chối→A10; Không đồng ý đề xuất từ chối→A06 | – |
| A08 | Đóng dấu, vào sổ | L4 | A09 | S+C |
| A09 | Xác nhận đã cấp giấy | L2 | A11 | S+C |
| A10 | Ghi lý do từ chối | L3 | A14 | S+C |
| A11 | Báo SV đã có giấy, hẹn nhận | L2 | A12 | S+C |
| A12 | SV nhận giấy | L1 | E1 | C |
| A13 | Đóng hồ sơ quá hạn, báo SV | L2 | E3 | S+C |
| A14 | Báo SV bị từ chối kèm lý do | L2 | E2 | S+C |

**Quy ước log:** S+C = có cả start và complete. C = sự kiện tức thời, dùng cho bước của SV vì không quan sát được thời gian SV xử lý. Gateway không ghi log.
- Thời gian chờ = start(Ai) − complete(bước trước).
- Thời gian xử lý = complete(Ai) − start(Ai).

**Cách vẽ lại:**
- 4 lane ngang L1–L4.
- Vòng A03→G1→A04→A05→A03 vẽ mũi tên quay ngược.
- Nhánh G2→A06 vẽ mũi tên quay ngược.
- Timer biên trên A05 ghi nhãn "hạn 7 ngày làm việc, phát hiện khi rà sổ thứ Sáu". Ở AS-IS đây là bước thủ công, không phải cảnh báo tự động.

**Biến thể (có thể kết hợp với nhau):**
- V1 (thẳng): A01–A03, A06–A09, A11, A12.
- V2: V1 + k×(A04, A05, A03).
- V3 (từ chối sau khi soạn giấy): A01–A03, A06, A07, A10, A14.
- V4 (không đủ tư cách): A01–A03, A07, A10, A14.
- V4b: L3 trả về, đi tiếp như V1 từ A06.
- V5 (quá hạn bổ sung): A01–A04, A13.

## 3. Bottleneck – 3 giả thuyết ngang hàng (chưa xếp hạng)
| | H1 | H2 | H3 |
|---|---|---|---|
| Vị trí | Chuyển tiếp A06→A07 (chờ ký) | Vòng A03→A04→A05→A03 | Chuyển tiếp A02→A03 (chờ kiểm tra) |
| Nguyên nhân giả định | Ký theo lô, người ký vắng, không có nhắc hạn | Biểu mẫu không nêu rõ giấy tờ theo loại giấy; báo bổ sung không cụ thể | Cán bộ kiêm nhiệm (GA2), tra cứu thủ công |
| Ảnh hưởng | Tổng thời gian dài hơn, SV hỏi lại (P1, P3) | Làm lại nhiều, tăng tỷ lệ E3 | Tồn hồ sơ đầu vào, tuổi hồ sơ tăng |
| Dữ liệu kiểm chứng | start(A07)−complete(A06) theo ngày/giờ; lịch vắng người ký; số hồ sơ mỗi lô | Tách 3 đoạn: complete(A03)→start(A04) = trễ báo bổ sung (phía trường); complete(A04)→complete(A05) = SV chuẩn bị (phía SV); complete(A05)→start(A03) = chờ kiểm tra lại (phía trường). Kèm số vòng, mã lý do, loại giấy, kênh nộp | start(A03)−complete(A02); số hồ sơ tồn theo ngày; thời gian xử lý A03 |

**Tiêu chí ứng viên (ngưỡng số chốt ở vòng 2):**
- (a) Trung vị thời gian chờ nằm trong top 3 chuyển tiếp.
- (b) Ít nhất 50% hồ sơ đi qua chuyển tiếp đó có thời gian chờ vượt ngưỡng cấu hình. So sánh trung vị với P90 để loại trường hợp chỉ do vài ca ngoại lai.
- (c) Có bằng chứng nguyên nhân (lịch, lô ký, mã lý do).

Thỏa (a)+(b) thì chỉ gọi là "ứng viên nghẽn". Phải có thêm (c) mới được nêu nguyên nhân. Thời gian tính theo cả giờ làm việc (GA1) lẫn giờ lịch.

---
Limitations:
- C1 (D1) vẫn mở vì chỉ người phản biện (antigravity) được giải quyết. Bản tổng hợp xử lý C1 như sau: G1 có 3 nhánh, ca không đủ tư cách đi thẳng A07 không qua soạn giấy; ký chuyển sang A07 (L3); A08 chỉ đóng dấu; tách thông báo thành A11 (có giấy) và A14 (từ chối); mọi task L2–L4 ghi start+complete. Từ vựng 'G1–G3' trong claim D2: bảng hiện mới dùng G1 và G2, còn G3 để dành cho TO-BE (ví dụ kiểm tra tự động). Nếu pass 2 thấy không cần thì ghi lại cho rõ.
- Phản biện ngoài ledger đã được xử lý trong văn bản: (1) bỏ nhãn 'B1 chính', thay bằng H1–H3 ngang hàng; (2) H2 tách 3 đoạn thời gian phía trường/phía SV; (3) mâu thuẫn P4 với timer: AS-IS phát hiện quá hạn thủ công khi rà sổ thứ Sáu (GA8); (4) mã hồ sơ ở AS-IS gán tại A02 và không báo SV (GA9, P1).
- Nhánh G2→A06 (L3 không đồng ý đề xuất từ chối) và chuyển giao A07→A08 (L3→L4) chưa được xét là giả thuyết nghẽn; vòng 2 cân nhắc thêm làm H4 nếu dữ liệu mô phỏng có.
- Ngưỡng số cho tiêu chí nghẽn (top 3, 50%, ngưỡng chờ) mới là đề xuất ứng viên; cần chốt ở vòng 2 cùng tham số bộ sinh dữ liệu và cách tính theo giờ làm việc.
- GA1–GA9, đơn vị Phòng CTHSSV và việc phân công ký đều là giả định; nhóm cần phỏng vấn cán bộ trường để xác minh. Chưa có file sơ đồ BPMN, bảng mục 2 là đặc tả để vẽ trên draw.io hoặc bpmn.io.
- Phiên ở plan mode nhưng không có công cụ Write/ExitPlanMode, nên không tạo plan file; chỉ đọc docs/project-brief.md và trả JSON theo hợp đồng. Brief gốc yêu cầu triển khai n8n/web/Docker, nhưng đợt này chỉ làm nội dung báo cáo.