# Nhật ký hợp tác AI — P6

## Phiên phân tích kiến trúc

- Report: `/tmp/ai-lab-p6-collab-20261023.jsonl.report.json`.
- Kết quả phiên: `partial`, dừng vì hết ngân sách đã cấp cho phiên.
- 13 lần thử gọi cho 12 lượt dự kiến; hoàn thành 11 lượt logic; 2 lỗi.
- Claude: 7/7 lần thành công. Antigravity: 4/4 lần thành công. Codex: 0/2; cả hai lần lỗi vì workspace chưa được CLI coi là thư mục Git tin cậy (`--skip-git-repo-check` chưa dùng).
- Không coi hai lỗi Codex là đóng góp và không thay bằng kết quả giả lập.

## Quyết định đã chấp nhận

1. **D2 — Event log:** cặp start/complete theo `(case_id, activity, attempt_no)`, lưu UTC; cùng seed phải tái lập được dữ liệu.
2. **D3 — Kiến trúc:** bốn service gồm app FastAPI/Jinja/PM4Py, PostgreSQL, n8n và Mailpit. API là bên duy nhất ghi trạng thái/event; n8n điều phối qua API; outbox và callback ngăn thành công giả.
3. **D5 — State machine:** n8n sở hữu tiền kiểm; app sở hữu thao tác người dùng/cán bộ. Thông báo là `automation_status` + event `NOTIFY_SENT`, không ghi đè trạng thái nghiệp vụ cuối.

## Điều chỉnh có đồng thuận phản biện

- D7 bổ sung lọc `data_source` bắt buộc, tách demo/mô phỏng, quy ước bước tức thời `start=complete`, reset chỉ xóa dữ liệu demo. Antigravity xác nhận D7 giải quyết phản biện D6-C1; phiên hết ngân sách trước lượt synthesize cuối nên ledger vẫn để D7 ở trạng thái proposed.

## Điểm mở được xử lý bảo thủ khi triển khai

- D8-C1: tổng tuổi hồ sơ không đủ cho quá hạn theo từng bước. Khi hiện thực phải lọc event `timestamp <= as_of`, tính `stage_age = as_of - last_event_ts` và dùng snapshot cố định cho mô phỏng. Đây là phản biện mở cuối phiên, không được ghi sai thành quyết định đã chấp nhận.

## Ảnh hưởng đến hiện thực

- Giao diện tách dữ liệu mô phỏng và demo, hiển thị PENDING/FAILED/SYNCED, có khóa gửi trùng ở mọi form thay đổi trạng thái.
- Dashboard công khai công thức cảnh báo và không suy luận nguyên nhân chắc chắn.
- Sơ đồ TO-BE thể hiện rõ API là sole writer và n8n là bộ điều phối.
- Kết quả chạy test và smoke test phải được ghi bổ sung sau khi thực thi; nhật ký này không tự tuyên bố chúng đã đạt.
