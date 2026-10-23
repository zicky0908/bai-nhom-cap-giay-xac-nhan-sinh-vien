# Bản đồ giao diện

- `/`: sinh viên nộp hồ sơ và tra cứu bằng mã hồ sơ.
- `/requests/{case_id}`: trạng thái, timeline, lý do và form gửi bổ sung khi hợp lệ.
- `/staff`: danh sách dữ liệu demo, tìm kiếm và lọc trạng thái.
- `/staff/requests/{case_id}`: thao tác nhận xử lý, yêu cầu bổ sung, duyệt, từ chối và xác nhận cấp giấy.
- `/analytics`: lọc nguồn/kịch bản, chỉ số, biến thể, tồn đọng và tải CSV.
- Mailpit và n8n mở ở tab riêng trong buổi demo.

Giao diện responsive, dùng HTML server-rendered và JavaScript tăng cường. Nếu JavaScript lỗi, các form nghiệp vụ vẫn gửi được; riêng ô tra cứu nhanh cần nhập URL hồ sơ trực tiếp hoặc bổ sung endpoint tìm kiếm phía server.

## Contract form

Mọi form thay đổi trạng thái gửi `idempotency_key`. Form cán bộ còn gửi `version` để API phát hiện thao tác trên dữ liệu cũ. Lý do là bắt buộc với yêu cầu bổ sung/từ chối. Nút submit bị khóa sau lần nhấn đầu tiên để giảm thao tác lặp phía trình duyệt; backend vẫn là lớp bảo vệ quyết định.
