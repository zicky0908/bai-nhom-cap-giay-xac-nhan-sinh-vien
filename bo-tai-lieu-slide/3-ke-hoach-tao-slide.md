# Kế hoạch tạo slide

Mục tiêu: bộ slide cho **20 phút trình bày** (13 slide, khoảng 1,5 phút mỗi slide), tiếp theo là **10 phút demo** trên prototype. Nộp file slide cho giảng viên; không nộp Word. Kiến thức nền nằm ở `1-tong-hop-kien-thuc`; hình nằm ở thư mục `2-hinh-anh/`.

## 1. Ba bản slide đã có để tham khảo

| Bản | File (OneDrive, tên đầy đủ `Slide-cap-giay-xac-nhan-sinh-vien-<AI>.pptx`) | Điểm mạnh | Cần lưu ý |
|---|---|---|---|
| Claude | `…-Claude.pptx` | Đã soát số liệu 2 lần; có ghi chú người trình bày; biểu đồ sửa được | BPMN là ảnh, chữ nhỏ khi chiếu |
| Codex | `…-Codex.pptx` | Tối giản, dễ trình bày; sơ đồ vẽ bằng hình khối nên sửa được trong PowerPoint | Sơ đồ AS-IS rút gọn, thiếu vài nhánh |
| Antigravity | `…-Antigravity.pptx` | Nhiều bảng, đầy đủ chi tiết, hợp để đọc | Chữ tràn ở slide 1, 2, 6, 8, 13; slide 8 ghi "Khớp 100%" cho hồ sơ TO-BE chưa được kiểm |

**Đề xuất:** lấy một bản làm khung (Claude hoặc Codex), chép thêm slide hay của bản khác nếu cần, rồi cả nhóm sửa câu chữ theo giọng của mình. Không ghép 3 phong cách trong cùng một file.

## 2. Chi tiết 13 slide

Thời lượng ở cột cuối chỉ để tập nói, **không ghi lên slide**.

| # | Tiêu đề (thông điệp) | Nội dung chính trên slide | Hình | Người | Nói |
|---|---|---|---|---|---|
| 1 | Cấp giấy xác nhận sinh viên: phân tích và tự động hóa quy trình | Tên đề tài, nhóm, 4 thành viên; dòng nhỏ "bối cảnh giả định cho mục đích học thuật" | (không) | TV1 | 0:45 |
| 2 | SV không biết hồ sơ đang ở đâu, cán bộ không đo được chỗ chậm | 5 vấn đề P1–P5, mỗi vấn đề 1 dòng; mục tiêu dự kiến | (icon) | TV1 | 1:30 |
| 3 | Một hồ sơ đi từ lúc nộp tới một trong ba trạng thái kết thúc | Bên tham gia, đầu vào, bắt đầu, kết thúc E1/E2/E3, đầu ra; hai mốc đo thời gian | (dạng SIPOC) | TV1 | 1:15 |
| 4 | Quy trình hiện tại: 4 vai trò, nhiều bước làm tay, một vòng bổ sung | Sơ đồ BPMN AS-IS; 1 câu hướng dẫn đọc sơ đồ | 01-bpmn-as-is | TV2 | 2:00 |
| 5 | Bốn vị trí có thể gây trễ, để dữ liệu kiểm chứng | H1–H4: vị trí, nguyên nhân giả định, **ảnh hưởng**; 3 tiêu chí (a)(b)(f) | (thẻ, tô màu H1) | TV2 | 1:30 |
| 6 | Hai kịch bản được mô phỏng trên cùng một dòng hồ sơ | 400 hồ sơ / 20 seed / 7 cấu hình; bảng tham số giữ nguyên và thay đổi; nhãn "Dữ liệu mô phỏng" | (số lớn + bảng) | TV3 | 1:30 |
| 7 | Chờ ký là ứng viên điểm nghẽn duy nhất đạt đủ ba tiêu chí | DFG AS-IS; số 621 phút, 63%, 369/400 ca; biến thể; cycle time, rework, loop | 03-dfg-as-is (thêm 06-cho-va-xu-ly nếu đủ chỗ) | TV3 | 2:00 |
| 8 | Công thức trong code khớp số tính tay trên hồ sơ mẫu | Bảng C001–C004; 12 test đạt; 2 AI rà code | (bảng) | TV3 | 1:15 |
| 9 | TO-BE: bỏ bước thừa, tự động hóa giấy tờ và thông báo | Sơ đồ BPMN TO-BE; 4 nhóm thay đổi: kiểm soát lại, tự động hóa, loại bỏ, giữ nguyên | 02-bpmn-to-be | TV2 | 2:00 |
| 10 | Prototype: app ghi trạng thái, n8n điều phối, Mailpit lưu email | 4 dịch vụ; bảng ánh xạ trigger / data source / condition / 4 actions / notification | 13-workflow-n8n | TV4 | 1:45 |
| 11 | Một hồ sơ chạy thật: từ form nộp tới email thử nghiệm | 3 ảnh màn hình theo thứ tự nộp → cán bộ xử lý → email | 07, 08, 09 (dự phòng: 10, 11, 12) | TV4 | 1:30 |
| 12 | Đổi lịch ký mới giảm chờ ký; phần mềm giảm thao tác cán bộ | Biểu đồ thời gian phía trường và chờ ký (AS-IS / S0 / S1); 20/20 seed; dòng "Không được kết luận" | 05-kpi-so-sanh (hoặc biểu đồ vẽ lại trong PowerPoint) | TV4 | 2:00 |
| 13 | Kết quả mô phỏng chỉ minh họa phương pháp; cần nhật ký thật để kiểm chứng | Giới hạn; 3 bước tiếp theo; chuyển sang demo | (không) | TV1 | 0:45 |

Tổng khoảng 19,5 phút, chừa 30 giây chuyển người.

**Phân công trình bày:** TV1 slide 1–3 và 13; TV2 slide 4–5 và 9; TV3 slide 6–8; TV4 slide 10–12. **Demo 10 phút:** TV3 thao tác, TV4 thuyết minh, TV1 bấm giờ và giữ phương án dự phòng, TV2 điều phối hỏi đáp (kịch bản: `prototype/docs/demo-script.md`).

## 3. Danh mục hình (thư mục 2-hinh-anh)

| File | Nội dung | Dùng ở slide |
|---|---|---|
| 01-bpmn-as-is.png | BPMN quy trình hiện tại, 4 lane | 4 |
| 02-bpmn-to-be.png | BPMN quy trình đề xuất, 5 lane (ô xanh là bước hệ thống) | 9 |
| 03-dfg-as-is.png | Bản đồ quy trình AS-IS, cạnh đỏ là ứng viên điểm nghẽn | 7 |
| 04-dfg-to-be.png | Bản đồ quy trình TO-BE S1, không còn cạnh đỏ | 7 hoặc 9 (tùy chọn) |
| 05-kpi-so-sanh.png | 3 KPI theo kịch bản, trung vị và min–max qua 20 seed | 12 |
| 06-cho-va-xu-ly.png | Thời gian chờ và xử lý theo bước, AS-IS và TO-BE | 7 (tùy chọn) |
| 07-man-hinh-sinh-vien.png | Trang SV nộp yêu cầu | 11 |
| 08-man-hinh-can-bo-chi-tiet.png | Trang cán bộ: chi tiết hồ sơ đã cấp | 11 |
| 09-email-mailpit.png | Email thử nghiệm trong Mailpit | 11 |
| 10-trang-phan-tich.png | Trang phân tích trong app (dữ liệu mô phỏng 120 ca) | 11 hoặc dự phòng demo |
| 11-danh-sach-ho-so.png | Danh sách hồ sơ của cán bộ | dự phòng demo |
| 12-vong-bo-sung.png | Trang SV khi được yêu cầu bổ sung | dự phòng demo |
| 13-workflow-n8n.png | Workflow n8n, đánh dấu trigger / condition / action / notification | 10 |

Muốn chỉnh sơ đồ BPMN: mở `diagrams/*.bpmn` bằng https://demo.bpmn.io, sửa, rồi xuất PNG/SVG.

## 4. Nguyên tắc thiết kế

- Mỗi slide một thông điệp; tiêu đề là câu kết luận, không phải tên chủ đề.
- Chữ nội dung tối thiểu 14pt, tiêu đề 26pt trở lên; tối đa khoảng 40 chữ mỗi slide, phần giải thích để vào ghi chú người trình bày.
- Một bộ màu xuyên suốt; màu cam/đỏ chỉ dùng cho điểm nghẽn để người nghe nhận ra ngay.
- Mọi slide có số liệu Process Mining ghi "Dữ liệu mô phỏng" (slide 6, 7, 8, 12).
- Số liệu chỉ lấy từ `1-tong-hop-kien-thuc`; không làm tròn khác đi giữa các slide.
- Không ghi thời lượng, chỉ dẫn nội bộ hay chữ "TODO" lên slide.

## 5. Các bước thực hiện

| Bước | Việc | Người | Xong khi |
|---|---|---|---|
| 1 | Cả nhóm đọc `1-tong-hop-kien-thuc`, chọn bản slide làm khung | Cả nhóm | Đã chốt 1 bản |
| 2 | Mỗi người sửa slide mình trình bày, viết ghi chú nói | TV1–TV4 | Mỗi slide có ghi chú |
| 3 | Đối chiếu mọi con số với mục 6 và 9 của tài liệu kiến thức | TV3 | Không còn số lệch |
| 4 | Tạo tài khoản owner n8n, nạp dữ liệu mô phỏng, chạy thử demo | TV3, TV4 | Smoke test PASS, đã reset |
| 5 | Tập toàn bộ 20 phút + demo 10 phút, bấm giờ | Cả nhóm | Vừa thời lượng |
| 6 | Xuất bản cuối (.pptx và PDF dự phòng), nộp | TV1 | Đã nộp |

## 6. Checklist trước khi nộp

- [ ] Đủ 7 yêu cầu của giảng viên (bảng mục 1 của tài liệu kiến thức)
- [ ] Bottleneck nêu đủ: ở đâu, nguyên nhân, ảnh hưởng
- [ ] Prototype nêu đủ: 1 trigger, 4 actions, 1 condition, 1 data source, 1 notification
- [ ] Nhãn "Dữ liệu mô phỏng" ở slide 6, 7, 8, 12
- [ ] Có dòng "Không được kết luận" hoặc giới hạn ở slide 12–13
- [ ] Không chữ tràn khung khi mở bằng PowerPoint trên máy chiếu
- [ ] Mỗi slide có ghi chú người trình bày
- [ ] Ảnh chụp dự phòng sẵn sàng nếu demo trực tiếp trục trặc
