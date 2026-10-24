**Phản biện pass 2 cho D2 (mục 8–10).** Mục 1–7 giữ nguyên như bản hiện tại và bản tổng hợp pass 1. D2 đi đúng hướng: slide có người trình bày, demo có mốc phút, ca 4 chuyển sang need_info ngay ở B1, đã thêm T13/T14, checklist có cột trạng thái. Còn các lỗi dưới đây. Ledger chỉ ghi lỗi nặng nhất (C1). Các lỗi còn lại chỉ ghi ở đây để người tổng hợp xử lý.

■ **§9 Demo: thứ tự và tính khả thi**
| # | Vấn đề | Đề nghị |
|---|---|---|
| 1 (C1) | B3: OFF01 bấm «SV đã nhận» ngay sau issue. Lúc đó WF5 có thể chưa ghi c(A11), vì Schedule chạy 1 phút một lần cộng thời gian tra Mailpit. Khi đó log có A12 đứng trước A11, trái thứ tự A11 rồi A12 ở bao-cao:220. Bài kiểm tra T10 (log khớp thao tác) cũng có thể sai. | Bước kiểm tra của n8n chỉ cho pickup khi đã có c(A11), nếu chưa thì trả 409. Web khóa nút đến khi outbox ở trạng thái sent. Trong lúc chờ, thuyết minh giấy HTML. |
| 2 | B10 reset trước, rồi mới kiểm Mailpit (T6) và export CSV. Reset xóa ca demo nên không còn ca nào để đối chiếu thư. | Làm theo thứ tự: Executions, dashboard (T10), T6, export CSV, ghi số ca mô phỏng, reset, đếm lại (T12). |
| 3 | B3 có 11 thao tác (claim/eligible, claim/review_ok, claim/approve, claim/stamp, claim/issue, pickup) qua 3 actor_id trong 2,5 phút, lại phải chờ WF5. Không có dư thời gian. | Web demo cần bộ chọn actor_id (chỉ ở mức demo, ghi rõ không phải đăng nhập). Tăng B3 lên khoảng 3 phút bằng cách gộp B8 với B9. |
| 4 | B4 và B6 không nêu bước claim A07 do APP01 làm. Ca 3 tạo sẵn ở PENDING_APPROVAL thì phải sang APPROVING rồi mới reject được. Với bước 403 của CLK01, chưa nói kiểm vai trò trước hay kiểm trạng thái trước, nên kết quả có thể là 409 thay vì 403. | Chốt thứ tự: kiểm vai trò trước khi đọc trạng thái. Tạo sẵn ca 3 ở APPROVING. Dùng ca 3 cho cả B4-403 và B6. |
| 5 | B8 dừng và bật lại n8n, ngay sau đó B9 khởi động lại Postgres và n8n. Như vậy có 2 lần khởi động n8n CE trong khoảng 2 phút, chưa đo thời gian khởi động và nạp lại webhook. | B9 chỉ chạy compose restart một lần rồi kiểm số ca và event. Đo khi tập dượt. |
| 6 | Mốc của ca 4: need_info khoảng 0:45, A16 khoảng 2:45, due khoảng 3:45. WF4 trễ thêm tối đa 1 phút, thư E3 qua WF5 thêm 1 phút, tức khoảng 5:45. Nếu B1 chậm thì không còn dư trước B7 (6:00). | Ghi rõ rằng thư A16 sẽ tới giữa B3. Đặt điều kiện chuyển sang ca 4b: đến 6:00 chưa thấy A13. |

■ **§8 Slide**
- Slide 8 ghi «4 ca mẫu», nhưng §4.6 có 6 dòng (4 ca AS-IS và 2 ca TO-BE). Cần sửa thành «4 ca hiện tại và 2 ca đề xuất».
- Slide 5 ghi «tiêu chí (a)–(e)», đây là mã nội bộ. Nên viết thành lời, ví dụ: chờ lâu nằm trong top 3, phần lớn ca vượt ngưỡng, có bằng chứng nguyên nhân, ngưỡng chốt trước, không tính giờ nghỉ.
- Slide 2 ghi «5 vấn đề viết bằng lời thường» nhưng chưa nêu cụ thể. Cần ghi đủ 5 ý ngắn, có nhãn giả định.
- Slide 11 có 6 cụm ý, vượt giới hạn 2–4 ý. Nên gộp thành 3 ý: yêu cầu tối thiểu, chống gửi trùng, kiểm tra vai trò.
- Phần còn lại giữ nguyên như đề xuất D2.

■ **§10 Checklist: còn thiếu so với brief**
- brief:171 dependency khóa phiên bản; brief:174 bộ sinh dữ liệu và event log mẫu; brief:180 nhật ký hợp tác AI và kết quả kiểm thử; brief:181 hướng dẫn khởi động, tài khoản demo (SV001, OFF01, APP01, CLK01), địa chỉ truy cập và cách reset.
- brief:129–136: các mục dashboard (tồn và quá hạn theo ngưỡng, thời gian chờ và xử lý, so sánh AS-IS/TO-BE); brief:138 công khai tiêu chí tô màu; brief:109 thời gian node n8n không phải thời gian nghiệp vụ; brief:167 smoke test toàn luồng.
- Dòng Bottleneck để «Có» là quá sớm. brief:56 yêu cầu tối thiểu 1 điểm nghẽn, nhưng §3 mới ở mức giả thuyết chưa xếp hạng. Nên để «Chờ chạy» cho tới khi có ít nhất 1 ứng viên đạt tiêu chí (a)+(b) trên dữ liệu mô phỏng.
- Ánh xạ 161 sang T3 và T13 ở B4 là hợp lý nếu sửa theo điểm 4. Ánh xạ 163 cần ghi rõ: kiểm trước khi reset (điểm 2).

■ **Kết luận:** D2 nên được chấp nhận có sửa: theo C1 (chặn pickup đến khi có A11), đảo thứ tự B10, và bổ sung các dòng checklist còn thiếu.

---
Limitations:
- Chưa chạy n8n CE, Postgres, Mailpit hay web. Các mốc thời gian (WF4/WF5 mỗi 1 phút, thời gian khởi động n8n, 11 thao tác của ca 1) là suy luận, cần đo khi tập dượt.
- Ledger chỉ ghi C1 để giữ ngân sách tăng trưởng. Các điểm 3–6 của §9, các điểm của §8 và các dòng checklist còn thiếu chỉ nằm trong summary; người tổng hợp cần xử lý cả các điểm này. C1 của D1 vẫn mở, ngoài phạm vi pass 2.
- Chưa kiểm tra workspace có file BPMN, CSV, workflow JSON hay nhật ký hợp tác AI hay không. Đề nghị đổi trạng thái checklist chỉ dựa trên nội dung báo cáo. Phiên ở chế độ chỉ đọc, không sửa file nào.