# Bối cảnh, giả định và giới hạn

## Business problem

Quy trình cấp giấy xác nhận sinh viên thường đi qua nhiều người, nhiều lần chuyển thông tin và có thể thiếu một nơi tra cứu thống nhất. Khi hồ sơ thiếu, sinh viên khó biết cần bổ sung gì; cán bộ khó nhìn nhanh hồ sơ nào đang chờ lâu; dữ liệu phục vụ cải tiến quy trình bị phân tán.

Prototype tập trung vào ba mục tiêu: minh bạch trạng thái, tự động hóa tiền kiểm/thông báo và tạo event log đủ để phân tích quy trình.

## Giả định có thể điều chỉnh

- Sinh viên có mã số, email và trạng thái đang học để tiền kiểm.
- Cán bộ phải chủ động bấm “Nhận xử lý”; thao tác này là mốc bắt đầu đo thời gian xử lý thủ công.
- Yêu cầu bổ sung và từ chối luôn cần lý do.
- Giấy được nhận trực tiếp hoặc theo hình thức do prototype cấu hình; email trong Mailpit chỉ là bằng chứng thông báo local.
- Tên trạng thái, ngưỡng SLA và thời gian mô phỏng không phải quy định chính thức của trường.

## Ngoài phạm vi

Không tích hợp hệ thống đào tạo thật, SQL Server của trường, chữ ký số, phát hành giấy pháp lý, thanh toán, đăng nhập định danh hoặc gửi email ra Internet.

## Quyền sở hữu logic

API ứng dụng là bên duy nhất ghi trạng thái và event trong transaction. n8n điều phối tiền kiểm và thông báo nhưng chỉ thay đổi dữ liệu thông qua API nội bộ. Giao diện không báo “đã thông báo” trước callback `SYNCED`.
