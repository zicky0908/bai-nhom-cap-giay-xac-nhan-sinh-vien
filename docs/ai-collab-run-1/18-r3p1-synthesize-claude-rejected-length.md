# Vòng 3 – Tổng hợp pass 1: mục 6–10 (toàn văn đã chỉnh sửa)
> Kế thừa A01–A17, L1–L5, G1–G3, GA*, D4–D9. Mọi số liệu Process Mining là **DỮ LIỆU MÔ PHỎNG**. Bản này đã xử lý D8/C1 và toàn bộ phản biện critique pass 1.

## 6. Đặc tả prototype (sẽ dựng bằng n8n CE)
**Phân vai (D8):** Web chỉ hiển thị và gọi webhook, không tự quyết trạng thái. n8n giữ mọi điều kiện và mọi chuyển trạng thái. PostgreSQL là data source. Mailpit là hộp thư thử nghiệm local; tiêu đề email bắt đầu bằng «[EMAIL THỬ NGHIỆM]», không gửi ra Internet.

| Bảng | Trường chính |
|---|---|
| students (mô phỏng) | student_id, full_name, email, enrollment_status |
| requests | case_id, student_id, doc_type, purpose, status, version, rework_round, origin, due_at, remind_at, reason_code, cfg |
| events | Schema 4.1; scenario=TO-BE, data_origin=demo |
| idempotency | key PK, endpoint, request_hash, state (processing/done), response_json |
| notifications (outbox) | msg_id, case_id, template, rework_round, status queued/sent/failed, attempts; UNIQUE(case_id, template, rework_round) |
| work_calendar | date, is_workday, các khung giờ theo GA1 |
| resubmit_tokens | token_hash, case_id, rework_round, expires_at=due_at, used_at |
| form_error_log | submission_id, lỗi, thời điểm |

**Máy trạng thái.** Mỗi task S+C có nút «Nhận xử lý» ghi start; nút quyết định ghi complete (D9). Cặp trạng thái/hành động ngoài bảng thì trả 409 và không ghi event.
| Từ | Hành động → Đến [event] |
|---|---|
| – | submit → SUBMITTED [A01, A15, A02] |
| SUBMITTED, RESUBMITTED | claim → CHECKING [s A03] |
| CHECKING | eligible → DRAFTED [c A03, A06, origin=A06]; need_info → NEED_INFO [c A03, s+c A04]; not_eligible → PENDING_APPROVAL [c A03, origin=A03] |
| DRAFTED | claim → REVIEWING [s A17]; review_ok → PENDING_APPROVAL [c A17] |
| NEED_INFO | resubmit → RESUBMITTED [A05]; remind_at → [A16] (giữ trạng thái); due_at → EXPIRED [s+c A13, E3] |
| PENDING_APPROVAL | claim → APPROVING [s A07] |
| APPROVING | approve → APPROVED; reject+reason → REJECTED [c A07 → A14, E2]; return (chỉ khi origin=A03) → DRAFTED [c A07, A06, đặt origin=A06] |
| APPROVED → STAMPING → STAMPED | claim [s A08]; stamp [c A08] |
| STAMPED → ISSUING → ISSUED | claim [s A09]; issue [c A09 → A11] |
| ISSUED | pickup → CLOSED_ISSUED [A12, E1] |

Sau return, origin được đặt lại thành A06, nên mỗi ca return tối đa 1 lần (D4).

**Idempotency (D9):** mọi POST đều mang idempotency_key. Lệnh đầu tiên của transaction là `INSERT INTO idempotency … ON CONFLICT DO NOTHING`. Nếu insert được 0 dòng thì đọc bản ghi đã có:
- Cùng request_hash, state=done → trả lại response_json cũ.
- Cùng hash, state=processing → 409, kèm hướng dẫn thử lại.
- Khác hash → 422.

Khóa idempotency được commit cùng nghiệp vụ, nên nếu nghiệp vụ lỗi thì khóa cũng rollback. Chuyển trạng thái dùng `UPDATE … WHERE status=ANY(from) AND version=expected`, kèm INSERT event trong cùng CTE; nếu 0 dòng thì trả 409.

**Workflow (export JSON WF1–WF5 kèm hướng dẫn import):**
- **WF1 /submit** (Webhook trigger): idempotency → Code A15 → IF lỗi: ghi form_error_log, trả 422 → tra students (data source) → transaction tạo requests + events + outbox email xác nhận → Respond 201.
- **WF2 /action:** Switch theo action (condition) → UPDATE có điều kiện.
  - need_info: due_at = add_work_minutes(now, GA3), remind_at = add_work_minutes(due_at, −900) theo work_calendar; tạo token, đưa email vào outbox.
  - eligible/return: Code sinh giấy từ mẫu.
  - reject thiếu reason_code: 422.
- **WF3 /resubmit:** token nằm ở fragment (#) của link, form gửi lên qua body POST, chỉ dùng 1 lần. Chỉ nhận khi `status='NEED_INFO' AND now ≤ due_at`; ngược lại trả 410.
- **WF4 Schedule mỗi phút:** `UPDATE … SET status='EXPIRED' WHERE status='NEED_INFO' AND due_at ≤ now`. Ghi s(A13)=due_at (thời điểm timer, khớp mô phỏng), c(A13)=thời điểm chạy. A16 ghi khi remind_at ≤ now và chưa nhắc ở vòng này. WF3 và WF4 cùng điều kiện status nên chỉ một bên thắng.
- **WF5 Outbox:** gửi SMTP tới Mailpit, rồi kiểm tra thư qua Mailpit API theo Message-ID. Có thư thì đặt sent và ghi c(A11/A14). Lỗi thì thử lại tối đa 3 lần, mỗi lần cách 5 phút; vẫn lỗi thì đặt failed, dashboard cảnh báo và có nút gửi lại. Quy tắc chung: event nghiệp vụ commit trong transaction, event thông báo chỉ ghi khi đã có bằng chứng nhận thư.
- **Lỗi dịch vụ:** web timeout 10 giây hoặc nhận 5xx thì báo «Chưa ghi nhận, vui lòng thử lại» và giữ nguyên key để thử lại. Web chỉ báo thành công khi nhận 2xx có case_id và version. Thời gian chạy node n8n không được tính là thời gian nghiệp vụ.
- **cfg=DEMO:** GA3_demo = 3 phút, nhắc trước hạn 1 phút; data_origin=demo và bị loại khỏi KPI mô phỏng.
- **Yêu cầu tối thiểu:** trigger (Webhook, Schedule); action (Postgres insert/update, Code sinh giấy, Send Email, HTTP gọi Mailpit API); condition (IF/Switch); data source (PostgreSQL); notification (Mailpit).

## 7. Đánh giá cải tiến (mục tiêu đều là DỰ KIẾN)
| KPI | Loại | Công thức (phút làm việc) | Mục tiêu dự kiến |
|---|---|---|---|
| K1 T_trường | Efficiency | c(A11/A14/A13) − c(A01), trung vị/P90 | Trung vị TO-BE < AS-IS ở ≥18/20 seed, báo riêng S0/S1 |
| K2 T_trường_net | Efficiency | K1 − thời gian SV | P90 ≤ GA4 (2250) |
| K3 Chờ trước A07 | Efficiency | s(A07) − c(event trước) | Trung vị ≤ 450 ở S1; S0 chỉ báo cáo |
| K4 Xử lý L2/ca | Efficiency | Σ(c−s) của các task L2 | Thấp hơn AS-IS ở 20/20 seed |
| K5 Quá hạn chính | Efficiency | Số ca có tuổi net > GA4 tại mốc thứ Sáu 17:00 / số ca tồn | Thấp hơn AS-IS ở ≥18/20 seed |
| K6 Tỷ lệ E3 | Effectiveness | Số ca A13 / số ca có A04 | Chỉ mô tả, vì A16 không đổi hành vi SV trong mô phỏng |
| K7 Thông báo có bằng chứng nhận | Effectiveness | Số ca kết thúc có thư trong Mailpit API / số ca kết thúc | 100% |
| K8 Từ chối có lý do | Effectiveness | Số A07 reject có reason_code / số reject | 100% |
| K9 Tỷ lệ bổ sung, số vòng | Effectiveness | Số ca có ≥1 A04 / tổng ca; count(A04) | Chỉ mô tả, vì p là tham số đầu vào |

**Kiểm thử hệ thống (đạt/không đạt, không phải KPI cải tiến):**
- T1: số case/event trùng = 0.
- T2: c(A13) − due_at ≤ 2 phút.
- T3: hành động sai trạng thái trả 409.
- T4: không có thông báo thành công giả.
- T5: khởi động lại không mất dữ liệu.

**Nguồn và tần suất đo:** dữ liệu lấy từ bảng events. Mô phỏng: đo 1 lần cho mỗi cấu hình × 20 seed. Demo: đo mỗi lần chạy. Thí điểm thật (giai đoạn sau): đo hằng tuần.

**Bảng so sánh:** các cột AS-IS | TO-BE-S0 | TO-BE-S1 | độ nhạy p; mỗi ô ghi trung vị (min–max của 20 seed). Hiện để trống vì chưa chạy.

**Giới hạn:** kết quả phụ thuộc tham số giả định; L2 chỉ có 1 người; mô hình chưa được kiểm định bằng log thật; phần lớn mức cải thiện đến từ S1 và p.

## 8. Dàn ý slide (20 phút)
| # | Tiêu đề | Thông điệp | Nội dung | Hình |
|---|---|---|---|---|
| 1 | Giấy xác nhận SV: phân tích và tự động hóa | Đề tài, nhóm | Tên đề tài, 4 thành viên | – |
| 2 | Bài toán (giả định) | SV không biết hồ sơ đang ở bước nào | Các vấn đề P1–P5, mục tiêu | Sơ đồ bên liên quan |
| 3 | Tổng quan quy trình | Từ nộp hồ sơ đến E1/E2/E3 | Đầu vào/đầu ra, phạm vi, giả định | SIPOC |
| 4 | AS-IS | 4 lane, vòng bổ sung | A01–A14, G1–G3 | BPMN AS-IS |
| 5 | Điểm nghẽn ứng viên | Chờ ký theo lô, rà quá hạn hằng tuần | H1–H4, dữ liệu cần để kiểm chứng | BPMN có đánh dấu |
| 6 | Dữ liệu mô phỏng | Cùng cơ sở so sánh | Seed, CRN, tham số cố định/thay đổi | Bảng tham số |
| 7 | Kết quả mining | Ứng viên nghẽn theo tiêu chí công khai | DFG, top 5 biến thể, tỷ lệ bổ sung | DFG tô màu |
| 8 | Đối chiếu tính tay | Chỉ số tính bằng công cụ khớp tính tay | C001–C004, TB-C002/C004 | Bảng |
| 9 | TO-BE | Bỏ, tự động hóa, kiểm soát lại | Bảng đối chiếu AS-IS→TO-BE | BPMN TO-BE |
| 10 | Prototype | n8n giữ trạng thái, chống gửi trùng | WF1–WF5, idempotency | Sơ đồ khối + máy trạng thái |
| 11 | Đánh giá | Mô phỏng gợi ý mức cải thiện, chưa chứng minh | K1–K9, S0/S1 | Biểu đồ cột |
| 12 | Giới hạn và bước tiếp theo | Cần log thật để kiểm chứng | Giới hạn, kế hoạch thu dữ liệu | – |

Slide 6–8 và 11 gắn nhãn «Dữ liệu mô phỏng».

**Phân công:**
- TV1: slide 1–3.
- TV2: slide 4–5.
- TV3: slide 6–8.
- TV4: slide 9–12.
- Demo: TV3 thao tác, TV4 thuyết minh, TV1 giữ phương án dự phòng, TV2 điều phối Q&A.

## 9. Kịch bản demo (10 phút)
**Trước giờ demo:** chạy docker compose up, reset dữ liệu demo, mở các tab web, n8n và Mailpit.

| Bước | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Tạo ca 4 với cfg=DEMO, rồi SV001 nộp hồ sơ hợp lệ | Có mã TB-…, email [EMAIL THỬ NGHIỆM], event A01/A15/A02 |
| 2 | Gửi lại cùng key | Cùng mã hồ sơ, số event không đổi |
| 3 | Nộp hồ sơ thiếu trường | Lỗi hiện trên form, form_error_log +1, không tạo case |
| 4 | Ca 1: claim/eligible → claim/review → claim/approve → stamp → issue | Giấy sinh từ mẫu; email kết quả trong Mailpit |
| 5 | Bấm approve lần nữa | 409, không có event mới |
| 6 | Ca 2: need_info → SV bổ sung qua link | rework_round=1, ca quay lại CHECKING |
| 7 | Ca 3: reject không lý do, rồi reject có lý do | Lần đầu 422; lần sau có email A14 |
| 8 | Xem ca 4 | Có A16, sau đó A13 và email E3 |
| 9 | Dừng container n8n rồi thao tác | Web báo «Chưa ghi nhận», không báo thành công; bật lại n8n |
| 10 | Restart compose | Dữ liệu còn nguyên |
| 11 | Mở Executions, export CSV, mở dashboard | Ca demo được tách khỏi dữ liệu mô phỏng |
| 12 | Reset demo | Chỉ xóa data_origin=demo; số ca mô phỏng không đổi |

**Rủi ro và dự phòng:**
- n8n dừng: chứng minh bằng bước 9, rồi bật lại.
- Mailpit lỗi: dùng ảnh chụp gắn nhãn «Bằng chứng ghi sẵn».
- Timer chậm: dùng ca quá hạn chuẩn bị sẵn.
- Hỏng máy: laptop thứ hai chạy cùng compose, kèm video ghi sẵn có gắn nhãn.

## 10. Checklist
| Yêu cầu | Phần | Bằng chứng |
|---|---|---|
| 1 Bài toán, tổng quan | §1, slide 2–3 | Phạm vi, giả định |
| 2 AS-IS | §2, slide 4 | Bảng A01–A14, BPMN |
| 3 Bottleneck | §3, slide 5 | H1–H4, dữ liệu kiểm chứng |
| 4 Process Mining | §4, slide 6–8 | Schema, seed/CRN, DFG, tính tay, CSV |
| 5 TO-BE | §5, slide 9 | Bảng đối chiếu, BPMN TO-BE |
| 6 Prototype | §6, slide 10 | WF1–WF5 JSON, máy trạng thái, Mailpit |
| 7 Đánh giá | §7, slide 11 | K1–K9, T1–T5 |
| 8 Slide và phân công 4 TV | §8 | Dàn ý 12 slide |
| 9 Demo | §9 | 12 bước, phương án dự phòng |
| Test nghiệm thu brief:157–165 | §9 bước 1–12 | T1–T5, Mailpit API |
| Nhãn mô phỏng, tách dữ liệu demo, reset an toàn | §4.1, §9 bước 11–12 | data_origin, cfg |

---
Limitations:
- Ledger sau lượt này: D8/C1 đã được resolve (claude là người nêu phản biện). D8 và D9 là accepted. D1/C1 vẫn mở vì chỉ antigravity được resolve; D1 đã bị D2 thay thế. D3, D4, D5, D7 là accepted; D6 là rejected.
- Các phản biện critique r3p1 ngoài ledger (điểm §6.3–§6.6, §7–§10) chỉ được xử lý trong văn bản: origin đặt lại thành A06 sau return; outbox WF5 gửi lại email lỗi; work_calendar và add_work_minutes để tính due_at; s(A13)=due_at, c(A13)=thời điểm chạy; WF3 và WF4 cùng điều kiện UPDATE; token dùng 1 lần, đặt ở fragment; cfg=DEMO; K1/K2 tách gross/net; mục tiêu tính theo số seed đạt; K9 cũ/K10 cũ chuyển thành T1–T5; slide có cột Nội dung và phân công; demo thêm các bước lỗi dịch vụ, restart, reset; checklist bổ sung các dòng còn thiếu.
- Chưa dựng hay chạy n8n, PostgreSQL, Mailpit hay PM4Py. Những điểm sau mới là đặc tả, cần kiểm thử khi triển khai: Mailpit API tìm thư theo Message-ID, độ trễ Schedule ≤2 phút (T2), timeout 10 giây, retry 3 lần × 5 phút, transaction/CTE trong node Postgres của n8n, xử lý request đồng thời. Mục tiêu «≥18/20 seed» và GA3_demo = 3 phút là lựa chọn của người tổng hợp, chưa có căn cứ, nhóm có thể điều chỉnh.
- Nhóm cần chốt các điểm sau:
- Khung giờ GA1 cụ thể trong work_calendar và ngày nghỉ.
- Phân công TV1–TV4.
- Dữ liệu SV mô phỏng trong bảng students.
- Quá hạn chính tính theo net hay gross.

K6 (E3) gần như không phản ánh A16, vì mô phỏng giả định nhắc hạn không đổi hành vi SV.
- Lượt này đã đọc docs/project-brief.md, chỉ đọc. Phiên ở plan mode; không tạo hay sửa file nào, kể cả file kế hoạch. Pass 2 của vòng 3 nên cải thiện trực tiếp bản này, không viết lại từ đầu.