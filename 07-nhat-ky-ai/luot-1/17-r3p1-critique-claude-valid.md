# Vòng 3 – Critique pass 1: mục 6–10
Đã đọc lại docs/project-brief.md (chỉ đọc). Bản propose bám sát D4–D8, nhưng còn các lỗ hổng dưới đây, xếp theo mức độ nghiêm trọng.

## §6 Prototype
1. **Idempotency (D8, ghi vào ledger D8/C1):** WF1 tra bảng idempotency trước rồi mới INSERT. Đây là kiểu check-then-act: hai request đồng thời cùng key đều qua được bước tra, request thứ hai lỗi PK và trả 500. Cần `INSERT idempotency … ON CONFLICT DO NOTHING` làm lệnh đầu tiên của transaction. Cần so request_hash: cùng key nhưng payload khác thì trả 422. WF2 và WF3 chưa nói rõ cơ chế idempotency.
2. **Thiếu start event, trái D7:** chỉ A03 có claim. Theo §5, A17, A07, A08 và A09 đều phải log S+C, nhưng máy trạng thái chỉ có complete. Vì vậy K3 (s(A07)) và K4 (Σ(c−s) của L2) không đo được trên dữ liệu demo. Cần thêm claim cho từng trạng thái chờ, hoặc ghi rõ demo không đo K3/K4.
3. **origin sau return:** return → DRAFTED → A06 → A17, nhưng không nói origin có được đặt lại thành A06 hay không. Nếu không đặt lại, A07 có thể return vô hạn lần, trái D4.
4. **Email và commit:** A02 được ghi trong transaction, trước khi gửi email, trong khi A11/A14 lại chỉ ghi sau khi gửi thành công. Hai quy tắc không thống nhất. Cũng chưa có cơ chế gửi lại email lỗi (WF5 hoặc Error Workflow), nên ca lỗi email kẹt ở ISSUED mà không có c(A11).
5. **Timer:** chưa đặc tả cách tính due_at = now + GA3 theo phút làm việc trong n8n (cần bảng lịch/ngày nghỉ). Schedule 1 phút cộng độ trễ thực thi có thể vượt ngưỡng ±1 phút của R4′, nên cần ghi s(A13)=due_at, giống bản mô phỏng. Ca demo có hạn 2 phút nên mốc «due − 2 ngày làm việc» rơi vào trước lúc tạo ca. Cần cfg demo riêng (GA3_demo, mốc nhắc A16_demo).
6. **Tranh chấp WF3 với WF4:** khi SV nộp bổ sung đúng lúc timer đến hạn, cả hai nhánh phải dùng `UPDATE … WHERE status='NEED_INFO'` để chỉ một bên thắng. Token cần dùng một lần và có hạn; không nên đặt trong query string nếu được ghi vào log.

## §7 KPI
- K1 lấy mục tiêu «P90 ≤ GA4», nhưng GA4 được định nghĩa trên tuổi net còn K1 là gross, nên hai đại lượng không cùng thước đo.
- K4, K5, K7 chỉ ghi «Giảm», chưa có mức mục tiêu dự kiến. Yêu cầu 7 đòi tần suất đo cho từng KPI, nhưng bản nháp chỉ có một dòng chung.
- K8 đếm «email sent» theo SMTP là chưa đủ. Bằng chứng nhận phải lấy từ API hoặc hộp thư Mailpit (brief:105).
- K9 và K10 là thuộc tính thiết kế: chúng kiểm thử tính đúng, không đo mức cải tiến. Nên tách thành nhóm «kiểm thử hệ thống».

## §8 Slide
- Thiếu cột «Nội dung» mà yêu cầu 8 bắt buộc.
- Thông điệp slide 2 («cán bộ ghi tay») được viết như sự thật. Cần ghi là giả định.
- Chưa chỉ rõ ai trình bày phần nào trong 20 phút và ai demo.

## §9 Demo
- Thiếu ba ca kiểm thử bắt buộc: n8n/dịch vụ lỗi thì giao diện không báo thành công giả (brief:162); khởi động lại dịch vụ không mất dữ liệu (brief:165); reset chỉ xóa dữ liệu demo (brief:152).
- Phương án «dùng ảnh chụp Mailpit» phải gắn nhãn là bằng chứng ghi sẵn.

## §10 Checklist
- Thiếu các dòng: phân công 4 thành viên, export CSV, nhãn «Dữ liệu mô phỏng», tách dữ liệu demo khỏi dữ liệu mô phỏng, bộ test nghiệm thu brief:157-165, và workflow JSON xuất được (brief:99).

---
Limitations:
- Lượt này là critique: chưa viết lại toàn văn các mục 6–10. Người tổng hợp cần xử lý cả 6 điểm của §6 và các thiếu sót của §7–§10. Chỉ điểm 1–2 của §6 được ghi vào ledger (D8/C1); các điểm khác chỉ nằm trong summary để giữ ngân sách tăng trưởng.
- Chưa chạy n8n, PostgreSQL hay Mailpit. Các nhận định về độ trễ của Schedule trigger, về lỗi PK khi request đồng thời, và về cách n8n xử lý transaction/CTE là suy luận, cần kiểm thử khi triển khai.
- Ledger: D1/C1 vẫn mở, chờ antigravity xử lý. D8 mới được đề xuất, chưa có quyết định, và nay có thêm phản biện mở D8/C1.
- Phiên ở plan mode, chỉ đọc. Không tạo hay sửa file nào, kể cả file kế hoạch.