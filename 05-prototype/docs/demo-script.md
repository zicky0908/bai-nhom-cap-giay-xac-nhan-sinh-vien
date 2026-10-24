# Kịch bản demo 10 phút

## Chuẩn bị trước giờ demo

- Khởi động đủ `app`, `postgres`, `n8n`, `mailpit` và kiểm tra health.
- Import/kích hoạt workflow n8n, cấu hình token nội bộ và SMTP Mailpit.
- Seed dữ liệu mô phỏng. Mở sẵn bốn tab: Sinh viên, Cán bộ, Analytics, Mailpit; n8n để tab dự phòng.
- Reset **chỉ dữ liệu demo**. Không reset dữ liệu mô phỏng.

## Luồng trình diễn

| Thời gian | Người trình bày | Thao tác | Kết quả mong đợi |
|---:|---|---|---|
| 0:00–0:45 | TV1 | Giới thiệu vấn đề, phạm vi và bốn thành phần | Người xem hiểu đây là prototype local |
| 0:45–2:00 | TV2 | Nộp hồ sơ hợp lệ ở trang Sinh viên | Nhận mã hồ sơ; trạng thái thông báo là PENDING trước callback |
| 2:00–3:30 | TV2 | Mở n8n, chỉ Webhook → GET → IF → transition → SMTP → callback | Chứng minh n8n làm nghiệp vụ thật, không chỉ là sơ đồ |
| 3:30–5:10 | TV3 | Cán bộ nhận xử lý, duyệt và xác nhận đã cấp giấy | Trạng thái đi đúng thứ tự; event start/complete được ghi |
| 5:10–5:50 | TV3 | Mở Mailpit | Có email thử nghiệm đúng mã hồ sơ; UI đổi sang SYNCED |
| 5:50–7:00 | TV3 | Chọn hồ sơ thứ hai, yêu cầu bổ sung rồi gửi lại | Có vòng lặp bổ sung; `attempt_no` tăng |
| 7:00–8:50 | TV4 | Mở Analytics, lọc AS-IS/TO-BE và tải CSV | Thấy biến thể, waiting/processing, tồn đọng; nhãn dữ liệu mô phỏng rõ ràng |
| 8:50–9:30 | TV4 | Giải thích quy tắc cảnh báo và giới hạn | Không khẳng định nguyên nhân chỉ từ một giá trị lớn |
| 9:30–10:00 | TV1 | Tổng kết cải tiến và bước triển khai thật | Phân biệt kết quả mô phỏng với hiệu quả đã chứng minh |

## Phương án dự phòng

- Nếu n8n chậm: dùng hồ sơ đã chuẩn bị sẵn, mở log/outbox và Mailpit để chứng minh từng mốc.
- Nếu workflow lỗi: không nói hồ sơ thành công; chỉ trạng thái PENDING/FAILED và giải thích cơ chế chống thành công giả.
- Nếu dashboard chưa render bản đồ: tải event log CSV và trình bày bảng metric/biến thể.
