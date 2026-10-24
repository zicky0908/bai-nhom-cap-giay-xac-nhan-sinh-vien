**Phản biện pass 1 (mục 6–7) cho D1.** Mục 1–5 giữ nguyên như bản hiện tại. Đã đọc bao-cao:100–387, brief:60–198 và critique 17. D1 đi đúng hướng ở 6.1, 6.2, 6.5, 6.6 và ở việc tách K4/K7/K8. Tuy vậy còn các điểm dưới đây; điểm 1 được ghi vào ledger thành D1/C1.

| # | Vấn đề | Căn cứ | Đề nghị cho người tổng hợp |
|---|---|---|---|
| 1 (C1) | Đưa idempotency, kiểm tra trạng thái/version, UPDATE, events và outbox vào fn_* khiến n8n chỉ còn chuyển tiếp request, trái D8 (bao-cao:249) và brief:94–98. Ngoài ra c(A06) được commit trong hàm, trong khi giấy chỉ được sinh ở Code node sau khi commit. Nếu Code lỗi, log có A06 nhưng không có giấy. | brief:94; bao-cao:267, 289 | Hàm chỉ làm phần nguyên tử: khóa idempotency, UPDATE có điều kiện và INSERT events. n8n quyết định to_state, event và template, rồi truyền vào làm tham số. Với eligible và return: sinh HTML trong n8n trước, rồi truyền vào hàm để ghi cùng transaction. |
| 2 | Đếm yêu cầu tối thiểu: với mô hình mỗi POST một node Postgres, cần liệt kê lại ít nhất 4 action thực sự do n8n làm (gọi hàm, Code sinh giấy, Send Email, HTTP gọi Mailpit, ghi wf_errors) | brief:60–64; bao-cao:296 | Thêm bảng «node → loại yêu cầu» vào §6 |
| 3 | A02 «gửi email xác nhận» vẫn ghi trong transaction, còn A11/A14 lại do WF5 ghi. Critique 17 điểm 4 đã nêu sự không thống nhất này nhưng D1 chưa xử lý | bao-cao:208, 293 | Ghi rõ: A02 là event tạo mã hồ sơ; email xác nhận chỉ là bản ghi outbox, không phải event |
| 4 | actor_id là trường mới, không có trong schema §4.1 (đã chốt) | bao-cao:131–141 | Chỉ thêm actor_id vào bảng events của §6, ghi «mở rộng cho demo, không xuất ra CSV phân tích» |
| 5 | Header Auth dùng chung một khóa và actor_id do client gửi: đây chỉ là kiểm tra vai trò ở mức demo, không phải xác thực người dùng | đề xuất 6.7 | Ghi giới hạn; không gọi là «xác thực» |
| 6 | event_id của ca demo dùng công thức khác §4.1. Sau mỗi lần reset, case_id TB-… dễ sinh lại, nên event_id có thể trùng với CSV đã export trước đó | bao-cao:129, 131 | Thêm run_id hoặc tiền tố DM- cho case_id của ca demo |
| 7 | DEMO tính theo phút lịch là hợp lý, nhưng phải ghi đây là ngoại lệ so với §4.2 (phút GA1) và T2 của demo đo bằng phút lịch | bao-cao:145, 295 | Thêm 1 dòng vào cfg=DEMO |
| 8 | K10 trùng với «trễ phát hiện» đã có trong §4.5. Mục tiêu «TO-BE = 0 theo cấu tạo» không phải KPI so sánh được, tức là trái chính tiêu chí D1 dùng để loại K4 | bao-cao:190; ledger D1 acceptance | Đưa K10 sang nhóm «chỉ mô tả» hoặc gộp vào T2 |

**Kiểm tra khẳng định của D1 (chưa chạy, mức suy luận):**
- Node Postgres của n8n có chế độ Query Batching = Transaction, nhưng chế độ này chỉ áp dụng trong một node. Vì vậy nhận định «không giữ transaction qua nhiều node» là hợp lý.
- INSERT ON CONFLICT chờ transaction đang giữ cùng khóa unique: đúng với PostgreSQL. Bỏ nhánh processing là hợp lý.
- Mailpit có API search theo subject. Nhúng msg_id vào tiêu đề thư là khả thi.

**Ghi chú cho pass 2:** §10 hiện còn trỏ tới K1–K9 và T1–T5 (bao-cao:382, 385), cần cập nhật theo T1–T12 và nhóm KPI mới. §9 bước 8 phụ thuộc vào điểm 7.

---
Limitations:
- Chưa chạy n8n, PostgreSQL hay Mailpit. Các nhận định về Query Batching, khóa ON CONFLICT và API search của Mailpit là suy luận, cần kiểm thử khi dựng.
- Chỉ ghi C1 vào ledger do giới hạn tăng trưởng mỗi lượt; các điểm 2–8 nằm trong summary, người tổng hợp cần xử lý hoặc ghi vào limitations.
- Chưa đọc các file khác trong ai-collab-run-1 ngoài file critique 17. Phiên đang ở chế độ chỉ đọc; không tạo hay sửa file nào.