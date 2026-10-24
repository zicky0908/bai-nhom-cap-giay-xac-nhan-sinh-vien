# Báo cáo phân tích – Vòng 1 (mục 1–3), bản nháp đề xuất
> Toàn bộ là **giả định học thuật**, chưa có dữ liệu hay quy trình chính thức của trường. Mã giả định GAx có thể chỉnh.

## 1. Business Problem & Process Overview
**Bối cảnh (giả định):** Phòng Công tác HSSV (CTHSSV) cấp giấy xác nhận thủ công: SV nộp đơn giấy hoặc biểu mẫu online, cán bộ tra cứu danh sách SV, soạn giấy, trình ký, đóng dấu rồi báo SV qua điện thoại/Zalo/email cá nhân. Các loại giấy: đang học, hoãn NVQS, vay vốn, học bổng.

**Vấn đề nghiệp vụ (giả thuyết, cần phỏng vấn xác minh):**
- P1: SV không biết hồ sơ đang ở bước nào, phải hỏi lại nhiều lần.
- P2: Thông tin thiếu/sai bị phát hiện muộn → bổ sung nhiều vòng.
- P3: Hồ sơ chờ ký duyệt lâu, có thể do trình ký theo lô.
- P4: Không có dữ liệu thời gian nên không đo hay cảnh báo được quá hạn.

**Mục tiêu (dự kiến):** đo tách được thời gian chờ/xử lý; giảm số vòng bổ sung; minh bạch trạng thái; cảnh báo quá hạn; thông báo kết quả nhất quán, có lý do.

**Điểm bắt đầu:** SV nộp yêu cầu (A01). **Điểm kết thúc:** E1 SV nhận giấy; E2 SV nhận thông báo từ chối kèm lý do; E3 hồ sơ bị đóng do quá hạn bổ sung.

| Bên liên quan | Lane | Vai trò |
|---|---|---|
| Sinh viên | L1-SV | Nộp, bổ sung, nhận kết quả |
| Cán bộ CTHSSV | L2-CB | Tiếp nhận, kiểm tra, soạn giấy, xác nhận đã cấp, thông báo |
| Lãnh đạo phòng/người được ủy quyền | L3-LĐ | Duyệt hoặc từ chối |
| Văn thư | L4-VT | Đóng dấu, vào sổ |
| Phòng Đào tạo (nguồn dữ liệu) | – | Cung cấp tình trạng học tập để tra cứu |
| Cơ quan tiếp nhận giấy (bên ngoài) | – | Ngoài phạm vi, chỉ là bên dùng giấy |

**Đầu vào:** MSSV, họ tên, ngày sinh, lớp/khoa, loại giấy, mục đích, số bản, email liên hệ, tệp kèm (nếu loại giấy yêu cầu – GA5). **Đầu ra:** giấy xác nhận đã ký/đóng dấu, hoặc thông báo từ chối có lý do; bản ghi sổ/event log.

**Phạm vi:** trong: từ lúc nộp đến khi nhận giấy, từ chối, hoặc đóng hồ sơ. Ngoài: ký số, giấy có giá trị pháp lý, tích hợp CSDL của trường, bảng điểm, cấp lại.

| Mã | Giả định (điều chỉnh được) |
|---|---|
| GA1 | Giờ làm việc T2–T6, 07:30–11:30 và 13:30–17:00, Asia/Ho_Chi_Minh |
| GA2 | Một cán bộ tiếp nhận kiêm nhiệm việc khác; một người ký duyệt |
| GA3 | Hạn bổ sung 7 ngày làm việc, quá hạn → E3 |
| GA4 | Ngưỡng quá hạn toàn trình là tham số cấu hình (ví dụ 5 ngày làm việc), không phải quy định |
| GA5 | Mẫu và giấy tờ kèm theo từng loại giấy cần nhóm xác minh với trường |
| GA6 | Từ chối chỉ quyết định ở bước duyệt (A07); A03 chỉ phân loại đủ/thiếu |
| GA7 | Số vòng bổ sung không giới hạn trong AS-IS |

## 2. AS-IS (Swimlane/BPMN)
| Mã | Hoạt động | Lane | Loại | Đi tới | Log |
|---|---|---|---|---|---|
| A01 | Nộp yêu cầu | L1 | Task (start event trước) | A02 | complete |
| A02 | Tiếp nhận, ghi sổ/bảng tính | L2 | Task | A03 | start+complete |
| A03 | Kiểm tra thông tin và tư cách SV | L2 | Task | G1 | start+complete |
| G1 | Hồ sơ đủ và đúng? | L2 | XOR | Có→A06; Không→A04 | – |
| A04 | Báo SV bổ sung (nêu mục thiếu) | L2 | Task | A05 | complete |
| A05 | SV bổ sung, nộp lại | L1 | Task + timer biên GA3 | A03 (lặp); hết hạn→A13 | complete |
| A06 | Soạn giấy, trình ký | L2 | Task | A07 | start+complete |
| A07 | Xem xét phê duyệt | L3 | Task | G2 | start+complete |
| G2 | Duyệt? | L3 | XOR | Duyệt→A08; Từ chối→A10 | – |
| A08 | Ký, đóng dấu, vào sổ | L4 | Task | A09 | complete |
| A09 | Xác nhận đã cấp giấy | L2 | Task | A11 | complete |
| A10 | Ghi lý do từ chối | L3 | Task | A11 | complete |
| A11 | Thông báo kết quả cho SV | L2 | Task | E1/E2 | complete |
| A12 | SV nhận giấy | L1 | Task | E1 | complete |
| A13 | Đóng hồ sơ do quá hạn bổ sung | L2 | Task | E3 | complete |

**Vẽ lại:** 4 lane ngang L1–L4. Vòng lặp A03→G1→A04→A05→A03 vẽ mũi tên quay ngược. Timer biên trên A05 dẫn tới A13. A11 tách 2 luồng theo kết quả: duyệt → A12 → E1; từ chối → E2.

**Biến thể chính:** V1 thẳng A01–A03, A06–A09, A11, A12; V2 = V1 + k vòng (A04, A05, A03); V3 từ chối (A07→A10→A11); V4 đóng do quá hạn (A13).

## 3. Bottleneck (giả thuyết cần kiểm chứng)
| | B1 (chính) | B2 | B3 (ứng viên) |
|---|---|---|---|
| Vị trí | Chuyển tiếp A06→A07 (chờ ký) | Vòng A03→A04→A05→A03 | Chuyển tiếp A02→A03 (chờ kiểm tra) |
| Nguyên nhân giả định | Ký theo lô, người ký vắng, không có nhắc hạn | Biểu mẫu không nêu rõ giấy tờ theo loại giấy; báo bổ sung không cụ thể | Cán bộ kiêm nhiệm (GA2), tra cứu thủ công |
| Ảnh hưởng | Kéo dài tổng thời gian, SV hỏi lại nhiều (P1, P3) | Tăng khối lượng làm lại, tăng tỷ lệ E3 | Tồn hồ sơ đầu vào, tuổi hồ sơ tăng |
| Dữ liệu kiểm chứng | complete(A06)→start(A07) theo ngày/giờ; lịch vắng người ký; số hồ sơ mỗi lần ký | Số vòng/hồ sơ; mã lý do bổ sung; loại giấy; kênh nộp | start(A03)−complete(A02); số hồ sơ tồn theo ngày; thời gian xử lý A03 |

**Nguyên tắc:** chỉ gọi là nghẽn khi thỏa đồng thời: (a) trung vị thời gian chờ thuộc nhóm cao nhất, (b) xuất hiện ở đa số hồ sơ chứ không do vài ca ngoại lai (so sánh trung vị với P90), (c) có bằng chứng nguyên nhân (lịch, lô, lý do). Ngưỡng cụ thể chốt ở vòng 2. Một con số thời gian lớn đơn lẻ không đủ để kết luận nguyên nhân.

---
Limitations:
- Toàn bộ bối cảnh, đơn vị (Phòng CTHSSV), lane, giờ làm việc và các hạn GA1–GA7 là giả định; nhóm cần xác minh bằng phỏng vấn cán bộ của trường. Bài không trích dẫn quy định pháp luật nào về giấy hoãn NVQS hay vay vốn.
- Tiêu chí nghẽn ở mục 3 mới là định tính; ngưỡng số (ví dụ phân vị, tỷ trọng thời gian) cần chốt ở vòng 2 cùng bộ sinh dữ liệu.
- Chưa có sơ đồ BPMN dạng file; bảng mục 2 là đặc tả để vẽ (ví dụ trên draw.io hoặc bpmn.io).
- Brief gốc yêu cầu triển khai n8n/web/Docker, nhưng nhiệm vụ đợt này giới hạn ở nội dung báo cáo; chưa có file nào được tạo.
- Phiên đang ở chế độ plan mode nhưng không có công cụ Write/ExitPlanMode, nên không tạo plan file; chỉ trả về JSON theo hợp đồng.