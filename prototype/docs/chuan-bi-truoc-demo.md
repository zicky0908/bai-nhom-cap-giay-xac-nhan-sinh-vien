# Chuẩn bị trước giờ demo

Làm theo thứ tự, trong thư mục `prototype/` của repo (WSL: `/home/ntlam/projects/student-certificate/prototype`). Kịch bản 10 phút nằm ở `demo-script.md`.

## Một lần, trước buổi tập đầu tiên

- [ ] Mở http://localhost:5678 và **tạo tài khoản owner n8n** (email, tên, mật khẩu do nhóm tự đặt; chỉ lưu trên máy). Nếu sau đó không thấy workflow "Cấp giấy xác nhận sinh viên - Điều phối nghiệp vụ", chạy `sh scripts/setup-n8n.sh` rồi tải lại trang.
- [ ] Nạp dữ liệu mô phỏng cho trang Analytics (chỉ cần một lần; volume giữ lại): `sh scripts/seed-demo.sh 43044 120`.
- [ ] Tập toàn bộ kịch bản ít nhất một lần, bấm giờ.

## Ngày demo (khoảng 10 phút trước giờ)

1. `docker compose up -d` (không dùng `docker compose down -v`: lệnh này xóa dữ liệu).
2. Kiểm tra 5 địa chỉ đều mở được: http://localhost:8000, http://localhost:8000/staff, http://localhost:8000/analytics, http://localhost:5678, http://localhost:8025.
3. `python3 scripts/smoke-e2e.py` → phải in `PASS E2E`. Nếu FAIL, xem mục Sự cố.
4. `sh scripts/reset-demo.sh` → xóa hồ sơ demo vừa tạo khi smoke test và dọn hộp thư Mailpit; dữ liệu mô phỏng giữ nguyên.
5. Mở sẵn các tab: Sinh viên, Cán bộ, Analytics, Mailpit, n8n (đã đăng nhập).
6. Mở file slide; slide 11 có ảnh chụp dự phòng nếu demo trực tiếp trục trặc.

## Sự cố thường gặp

| Hiện tượng | Xử lý |
|---|---|
| Hồ sơ đứng ở "Chờ thông báo" (PENDING) quá 30 giây | Mở n8n → Executions xem lỗi; nói rõ đây là cơ chế chống "thành công giả" |
| n8n đòi đăng nhập giữa chừng | Đăng nhập bằng tài khoản owner đã tạo |
| Trang không mở được | `docker compose ps`; container nào không `healthy` thì `docker compose restart <tên>` |

## Đã kiểm chứng ngày 24/10/2026

- 20 test tự động của prototype đạt.
- Sau reset: 2 lần smoke test liên tiếp đạt (`PASS E2E`).
- Qua giao diện web (trình duyệt tự động): luồng nộp → tiền kiểm → nhận xử lý → duyệt → cấp giấy → email đạt; vòng yêu cầu bổ sung → SV gửi lại → tiền kiểm lại (`attempt_no = 2`) đạt.

## Lỗi đã sửa trong lần chuẩn bị này

1. Reset không xóa khóa idempotency, nên hồ sơ đánh số lại sau reset bị n8n báo 409 và kẹt ở PENDING.
2. Cấp giấy qua API không gửi thông báo sang n8n (chỉ giao diện web gửi); smoke test trước đó PASS giả do callback tiền kiểm đến muộn.
3. Hai thông báo trong cùng một lượt (tiền kiểm và cấp giấy) làm callback thứ hai lỗi 500 vì trùng khóa nhật ký sự kiện.
4. Smoke test giờ chỉ đạt khi có thông báo **sau** bước cấp giấy; reset dọn thêm hộp thư Mailpit.
