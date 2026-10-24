# Vòng 3 – Propose pass 1: mục 6–10
> Kế thừa A01–A17, L1–L5, G1–G3, GA*, D4–D7. Số liệu Process Mining là **dữ liệu mô phỏng**.

## 6. Đặc tả prototype (dựng sau bằng n8n CE)
**Phân vai (D8):** Web chỉ hiển thị và gọi webhook. n8n giữ mọi điều kiện và chuyển trạng thái. PostgreSQL là nguồn dữ liệu. Mailpit là hộp thư thử nghiệm local; tiêu đề email bắt đầu bằng «[EMAIL THỬ NGHIỆM]».

| Bảng | Trường chính |
|---|---|
| students (mô phỏng) | student_id, full_name, email, enrollment_status |
| requests | case_id, student_id, doc_type, purpose, status, version, rework_round, origin, due_at, reason_code, reminder_round |
| events | Schema 4.1; scenario=TO-BE, data_origin=demo |
| idempotency | key (PK), endpoint, request_hash, response_json |
| notifications | msg_id, case_id, template, rework_round, status; UNIQUE(case_id, template, rework_round) |

**Máy trạng thái.** Nút «Nhận xử lý» ghi start; nút quyết định ghi complete. Mọi cặp trạng thái/hành động ngoài bảng: HTTP 409, không ghi event.
| Từ | Hành động → Đến [activity] |
|---|---|
| – | submit → SUBMITTED [A01, A15, A02] |
| SUBMITTED, RESUBMITTED | claim → CHECKING [s A03] |
| CHECKING | eligible → DRAFTED [c A03, A06]; need_info → NEED_INFO [A04]; not_eligible → PENDING_APPROVAL (origin=A03) |
| DRAFTED | review_ok → PENDING_APPROVAL (origin=A06) [A17] |
| NEED_INFO | resubmit → RESUBMITTED [A05]; timer due−2 ngày làm việc → [A16] (1 lần/vòng); timer due → EXPIRED [A13, E3] |
| PENDING_APPROVAL | approve → APPROVED; reject + reason → REJECTED [A07, A14, E2]; return (chỉ khi origin=A03) → DRAFTED [A06] |
| APPROVED → STAMPED → ISSUED → CLOSED_ISSUED | stamp [A08]; issue [A09, A11]; pickup [A12, E1] |

**Workflow**
- **WF1 Nộp:** Webhook POST /submit (trigger) → Postgres tra idempotency; nếu trùng thì trả lại phản hồi cũ → Code A15 → IF lỗi: ghi form_error_log, trả 422 → Postgres tra students (data source) → một transaction INSERT requests + events + idempotency → Send Email (SMTP Mailpit) → Respond 201.
- **WF2 Hành động:** POST /action {case_id, action, expected_version, idempotency_key, actor, reason_code} → Switch theo action (condition) → `UPDATE … WHERE status=ANY(from) AND version=expected`, kèm INSERT event trong cùng CTE → IF 0 dòng: trả 409. Nhánh need_info đặt due_at = now + GA3 và gửi email có link token. Nhánh eligible chạy Code sinh giấy từ mẫu. Nhánh reject trả 422 nếu thiếu reason_code.
- **WF3 Bổ sung:** /resubmit?token. Chỉ nhận khi status=NEED_INFO và now ≤ due_at; ngược lại trả 410.
- **WF4 Hạn:** Schedule mỗi 1 phút để giữ \|s(A13) − due_at\| ≤ 1 phút (R4′). A16 chạy khi reminder_round < rework_round.
- **Email lỗi:** notification ghi failed; không ghi c(A11/A14); giao diện cảnh báo, không hiện thành công. Thời gian chạy node không được tính là thời gian nghiệp vụ.
- **Đủ yêu cầu tối thiểu:** trigger (Webhook, Schedule); ≥4 action (Postgres insert, Postgres update, Code sinh giấy, Send Email, Respond); condition (IF/Switch); data source (PostgreSQL); notification (Mailpit).

## 7. Đánh giá cải tiến
| KPI | Loại | Công thức (phút làm việc) | Mục tiêu dự kiến |
|---|---|---|---|
| K1 T_trường trung vị/P90 | Efficiency | c(A11/A14/A13) − c(A01) | P90 ≤ GA4 |
| K2 T_trường_net | Efficiency | K1 − thời gian SV | Thấp hơn AS-IS ở cả S0 và S1 |
| K3 Chờ trước A07 | Efficiency | s(A07) − c(event trước) | Trung vị ≤ 450 |
| K4 Xử lý của L2/ca | Efficiency | Σ(c−s) của lane L2 | Giảm |
| K5 Quá hạn chính | Efficiency | Số ca có tuổi net > GA4, chốt thứ Sáu 17:00 | Giảm |
| K6 Tỷ lệ bổ sung | Effectiveness | Số ca có ≥1 A04 / tổng ca | Chỉ mô tả, vì p là tham số đầu vào |
| K7 Tỷ lệ E3 | Effectiveness | Số ca A13 / số ca có A04 | Giảm |
| K8 Thông báo có lưu vết | Effectiveness | Số ca có email sent / số ca kết thúc | 100% |
| K9 Trễ phát hiện quá hạn | Effectiveness | s(A13) − due_at | ≤ 1 phút |
| K10 Bản ghi/event trùng | Effectiveness | Số case/event trùng idempotency_key | 0 |

- **Nguồn:** bảng events. Mô phỏng đo một lần cho mỗi cấu hình; demo đo theo tuần.
- **Bảng so sánh:** cột AS-IS, TO-BE-S0, TO-BE-S1 và độ nhạy p; mỗi ô ghi trung vị (min–max của 20 seed). Chưa có số vì chưa chạy.
- **Giới hạn:** kết quả phụ thuộc tham số giả định; L2 chỉ có 1 người; mô hình chưa được kiểm định; K6 là đầu vào nên không phải bằng chứng.

## 8. Dàn ý slide (TV1: 1–4, TV2: 5–8, TV3: 9–10 và demo, TV4: 11–12, demo dự phòng và Q&A)
| # | Tiêu đề | Thông điệp | Hình |
|---|---|---|---|
| 1 | Giấy xác nhận SV: phân tích và tự động hóa | Đề tài, nhóm | – |
| 2 | Bài toán | SV không biết hồ sơ đang ở đâu; cán bộ ghi tay | Sơ đồ bên liên quan |
| 3 | Tổng quan quy trình | Từ nộp đến nhận giấy hoặc đóng hồ sơ; đầu vào/đầu ra, giả định | SIPOC |
| 4 | AS-IS | 4 lane, vòng bổ sung, nhánh từ chối | BPMN AS-IS |
| 5 | Điểm nghẽn ứng viên | Chờ ký theo lô, rà quá hạn hằng tuần; cần dữ liệu để kiểm chứng | BPMN đánh dấu H1–H4 |
| 6 | Dữ liệu mô phỏng | Seed, CRN, tham số giữ cố định/thay đổi | Bảng tham số |
| 7 | Kết quả mining | DFG tô màu theo công thức, top 5 biến thể | DFG |
| 8 | Đối chiếu tính tay | Chỉ số PM4Py/pandas khớp với C001–C004 | Bảng |
| 9 | TO-BE | Bước bỏ, tự động hóa, kiểm soát lại | BPMN TO-BE |
| 10 | Prototype | n8n giữ trạng thái; chống gửi trùng | Sơ đồ khối + máy trạng thái |
| 11 | Đánh giá | Mô phỏng gợi ý mức cải thiện, chưa chứng minh | Cột AS-IS/S0/S1 |
| 12 | Giới hạn và bước tiếp | Cần thu log thật để kiểm chứng | – |
Slide 6–8 và 11 có nhãn «Dữ liệu mô phỏng».

## 9. Kịch bản demo
| Bước | Thao tác | Kết quả mong đợi |
|---|---|---|
| 0 | Reset dữ liệu data_origin=demo; mở tab web, n8n, Mailpit | Dashboard 0 ca demo |
| 1 | SV001 nộp hồ sơ hợp lệ | Có mã TB-…, email thử nghiệm, event A01/A15/A02 |
| 2 | Gửi lại cùng key | Cùng mã, không có bản ghi/event mới |
| 3 | Nộp thiếu trường | Báo lỗi trên form, không tạo case |
| 4 | Claim → eligible → review → approve → stamp → issue | Có giấy sinh từ mẫu; email kết quả |
| 5 | Bấm approve lần nữa | 409, không có event |
| 6 | Ca 2: need_info → SV bổ sung | rework_round=1, quay lại CHECKING |
| 7 | Ca 3: reject không lý do, rồi reject có lý do | Lần đầu bị chặn; lần sau có email A14 |
| 8 | Ca 4: hạn demo 2 phút | Có A16, rồi A13 và email E3 |
| 9 | Mở Executions của n8n, export CSV, mở dashboard | Ca demo tách riêng khỏi dữ liệu mô phỏng |

**Rủi ro và dự phòng:**
- n8n dừng: giao diện phải báo lỗi; quay lại sau và chạy tiếp.
- Mailpit không nhận: dùng ảnh chụp.
- Timer chậm: dùng ca quá hạn chuẩn bị sẵn.
- Hỏng máy: laptop thứ hai chạy Docker Compose, kèm video ghi sẵn.

## 10. Checklist
| Yêu cầu GV | Phần | Bằng chứng |
|---|---|---|
| Business Problem, Overview | §1, slide 2–3 | Bảng phạm vi, giả định |
| AS-IS | §2, slide 4 | Bảng A01–A14, BPMN |
| Bottleneck | §3, slide 5 | H1–H4, dữ liệu kiểm chứng |
| Process Mining | §4, slide 6–8 | Bộ sinh dữ liệu có seed, DFG, tính tay |
| TO-BE | §5, slide 9 | Bảng đối chiếu, BPMN |
| Prototype (trigger, 4 action, condition, data source, notification) | §6, slide 10, demo | WF1–WF4, Mailpit |
| Đánh giá | §7, slide 11 | K1–K10 |
| 20 + 10 phút | §8–9 | Dàn ý slide, kịch bản demo |

---
Limitations:
- Đã đọc docs/project-brief.md (chỉ đọc). Chưa dựng hay chạy n8n, PostgreSQL, Mailpit hay PM4Py. Mọi tên node, mã HTTP (409/410/422) và câu SQL dạng CTE chỉ là đặc tả, cần kiểm thử khi triển khai. Phiên đang ở plan mode, không tạo hay sửa file nào.
- Mục tiêu KPI là mục tiêu dự kiến, chưa có căn cứ thực tế. Bảng so sánh AS-IS/S0/S1 để trống vì chưa chạy 20 seed. K6 phụ thuộc trực tiếp vào tham số p nên không được dùng làm bằng chứng cải tiến.
- Còn mở, cần người phản biện xem xét: (1) Khi email lỗi, trạng thái vẫn được commit nhưng không ghi c(A11/A14). Cần chốt cơ chế gửi lại (Error Workflow hay WF5) và KPI K8. (2) Ghi s(A13) bằng thời điểm chạy, với polling 1 phút. (3) Gộp A07 approve, A08 và A09 thành chuỗi trạng thái; có cần thêm start event cho L4 khi demo không. (4) Hạn demo 2 phút khác GA3; phải ghi cfg riêng để không lẫn với dữ liệu mô phỏng.
- Ledger: chỉ đề xuất D8. D1/C1 vẫn mở, chờ antigravity xử lý. Slide chưa ghi số trang, logo hay thời lượng (đúng yêu cầu). Nhóm cần xác nhận cách phân công TV1–TV4 và tên SV mô phỏng trong bảng students.