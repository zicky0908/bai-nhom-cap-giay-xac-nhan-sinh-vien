# Đối chiếu yêu cầu giảng viên và bằng chứng

| Yêu cầu | Hiện thực / bằng chứng dự kiến | Cách trình diễn |
|---|---|---|
| Business Problem & Process Overview | `docs/assumptions.md`, AS-IS và TO-BE | Slide vấn đề, phạm vi và tác nhân |
| AS-IS BPMN/Swimlane | `docs/as-is.mmd` | Mở sơ đồ Mermaid hoặc ảnh xuất từ nguồn này |
| Ít nhất một bottleneck | Dashboard thời gian chờ theo bước; quy tắc ở `measurement-method.md` | Lọc AS-IS, chỉ bước vượt ngưỡng và giải thích đây là “nguy cơ” |
| Process Mining | Event log, API CSV, biến thể và tần suất chuyển bước | Mở `/analytics`, sau đó tải CSV |
| TO-BE | `docs/to-be.mmd` | Chỉ rõ phần người làm, API ghi trạng thái và n8n tự động hóa |
| 1 trigger | n8n Webhook | Mở workflow n8n |
| Ít nhất 4 actions | Đọc hồ sơ, gọi transition, gửi SMTP, callback trạng thái | Đi theo từng node trong workflow |
| 1 condition | IF kiểm tra đủ trường/tư cách | Cho một hồ sơ hợp lệ và một hồ sơ cần bổ sung |
| 1 data source | PostgreSQL qua API ứng dụng | Mở danh sách hồ sơ và event log |
| 1 notification | SMTP đến Mailpit | Mở Mailpit và xem email thử nghiệm |
| Đánh giá cải tiến | Bộ sinh cùng seed, AS-IS/TO-BE cùng cơ sở | So sánh metric và nêu rõ giới hạn mô phỏng |
| Prototype chạy được | FastAPI + PostgreSQL + n8n + Mailpit bằng Compose | Thực hiện luồng demo 10 phút |
| Dữ liệu & sơ đồ | CSV xuất được; hai tệp Mermaid chỉnh sửa được | Tải CSV, mở nguồn sơ đồ |
| Không có thành công giả | `automation_status=PENDING/FAILED/SYNCED` và outbox | Tắt n8n, nộp hồ sơ, chứng minh UI không báo đã thông báo |

## Trạng thái nghiệm thu

Chỉ đánh dấu “đã kiểm chứng” sau khi smoke test chạy thật. Việc một file hoặc endpoint tồn tại chưa đủ để kết luận luồng đã hoạt động toàn bộ.
