## 1. Business Problem & Process Overview
**Bối cảnh (giả định):** Phòng CTHSSV cấp giấy xác nhận thủ công cho các loại: đang học, hoãn NVQS, vay vốn, học bổng. Quy trình hiện tại: nộp đơn giấy hoặc form → tra danh sách → soạn giấy → trình ký → đóng dấu → báo SV qua điện thoại/Zalo/email.

| Mã | Vấn đề (giả thuyết) | Dấu hiệu kiểm chứng |
|---|---|---|
| P1 | SV không tra được trạng thái (số sổ gán ở A02, không báo SV) | Số lượt hỏi lại/hồ sơ |
| P2 | Thiếu/sai thông tin bị phát hiện muộn | Tỷ lệ hồ sơ có ≥1 lần A04; mã lý do |
| P3 | Chờ ký lâu | Chờ A06→A07 theo giờ làm việc |
| P4 | Quá hạn chỉ lộ ra khi rà sổ | start(A13) − thời điểm hết hạn GA3 |
| P5 | Thông báo không lưu vết | Tỷ lệ A04/A11/A14 có bằng chứng gửi. AS-IS không có nguồn dữ liệu, chỉ đo được ở TO-BE; không dùng để so sánh AS-IS/TO-BE |

**Mục tiêu (dự kiến):** tách thời gian chờ và thời gian xử lý; giảm số vòng bổ sung; có mã hồ sơ và trạng thái minh bạch; cảnh báo quá hạn; thông báo có lưu vết và có lý do.
**Bắt đầu:** A01. **Kết thúc:** E1 (SV nhận giấy), E2 (từ chối kèm lý do), E3 (đóng do quá hạn bổ sung).
**Hai mốc đo:**
- T_trường = complete(A11 | A14 | A13) − A01. Kết thúc ở A11 chứ không ở A09, vì A11 là lúc SV biết kết quả; A09 là mốc nội bộ, báo cáo phụ.
- T_SV = complete(A12) − A01, chỉ tính cho hồ sơ đã có A12. Hồ sơ «đã cấp, chưa nhận» là dữ liệu bị cắt: loại khỏi T_SV, báo cáo riêng số lượng và tuổi.

| Bên liên quan | Lane / role | Vai trò |
|---|---|---|
| Sinh viên | L1 / student | Nộp, bổ sung, nhận |
| Cán bộ CTHSSV | L2 / officer | Tiếp nhận, kiểm tra, soạn, xác nhận cấp, thông báo |
| Lãnh đạo/người được ủy quyền | L3 / approver | Duyệt/từ chối, ký |
| Văn thư | L4 / clerk | Đóng dấu, vào sổ |
| Phòng Đào tạo; cơ quan nhận giấy | – | Nguồn tra cứu; ngoài phạm vi |

**Đầu vào:** MSSV, họ tên, ngày sinh, lớp/khoa, loại giấy, mục đích, số bản, email, tệp kèm theo (GA5). **Đầu ra:** giấy đã ký và đóng dấu, hoặc thông báo từ chối có lý do; sổ/event log.
**Phạm vi:** từ A01 đến E1/E2/E3. **Ngoài phạm vi:** ký số, giá trị pháp lý, tích hợp CSDL trường, cấp lại.

| Mã | Giả định |
|---|---|
| GA1 | Giờ làm việc T2–T6, 07:30–11:30 và 13:30–17:00, Asia/Ho_Chi_Minh |
| GA2 | 1 cán bộ tiếp nhận (kiêm nhiệm), 1 người ký |
| GA3 | Hạn bổ sung 7 ngày làm việc (tham số) |
| GA4 | Ngưỡng quá hạn toàn trình là tham số (ví dụ 5 ngày làm việc), không phải quy định |
| GA5 | Mẫu giấy và hồ sơ kèm theo từng loại: cần xác minh |
| GA6 | A03 có 3 kết quả; chỉ L3 quyết định từ chối, tại A07 |
| GA7 | AS-IS không giới hạn số vòng bổ sung |
| GA8 | Rà quá hạn vào chiều thứ Sáu; start(A13) = lần rà đầu tiên sau hạn |
| GA9 | case_id = số sổ gán ở A02; A01 lấy theo ngày ghi trên đơn |
| GA10 | A01 chỉ có ngày, quy ước = 07:30 ngày đó. Áp dụng như nhau cho AS-IS và TO-BE; TO-BE báo thêm số đo theo phút |
| GA11 | AS-IS không có nhánh L3 yêu cầu bổ sung; nếu phỏng vấn thấy có thì thêm G2→A04 |
| GA12 | «Đã cấp, chưa nhận» không tự đóng; tính vào hồ sơ tồn phía SV |
| GA13 | resource = mã ẩn danh (ví dụ OFF01); role theo lane |
| GA14 | Timer G3 nổ đúng hạn GA3. SV nộp sau hạn không được nhận làm A05 (phải nộp hồ sơ mới); chỉ ghi chú, không ghi event |


## 3. Bottleneck – giả thuyết ngang hàng, chưa xếp hạng
| | H1 | H2 | H3 | H4 |
|---|---|---|---|---|
| Vị trí | A06→A07 | Vòng A03→A04→A05→A03 | A02→A03 | A07→A08 (L3→L4) |
| Nguyên nhân giả định | Ký theo lô, người ký vắng | Biểu mẫu không nêu rõ hồ sơ; báo bổ sung mơ hồ | Kiêm nhiệm, tra cứu thủ công | Giấy đã ký chờ chuyển theo lô; không ai phụ trách chuyển tiếp |
| Ảnh hưởng | T_trường dài, SV hỏi lại | Làm lại, tăng E3 | Tồn đầu vào, tuổi tăng | T_trường tăng mà không ai thấy |
| Dữ liệu kiểm chứng | Chờ theo ngày/giờ; lịch người ký; cỡ lô | 3 đoạn: A03c→A04s (trường), A04c→A05 (SV), A05→A03s (trường); số vòng, mã lý do, loại giấy, kênh | Chờ; tồn theo ngày; xử lý A03 | Chờ; giờ chuyển; cỡ lô |

**Không phải nghẽn của trường:** complete(A11)→complete(A12) chỉ dùng để tách T_SV ra khỏi T_trường.

**Tiêu chí:**
- (a) Trung vị thời gian chờ nằm trong top 3 chuyển tiếp.
- (b) ≥50% số ca vượt ngưỡng; so trung vị với P90 để loại ngoại lai.
- (c) Có bằng chứng nguyên nhân (lịch, lô, mã lý do).
- (d) Ngưỡng chốt trước khi sinh dữ liệu, công bố cùng seed.
- (e) So giờ lịch với giờ làm việc; chờ dài chỉ do cuối tuần hoặc nghỉ trưa thì không tính.

(a)+(b) chỉ cho phép gọi là «ứng viên nghẽn». Có thêm (c) mới được nêu nguyên nhân. (d)+(e) là điều kiện để phép đo hợp lệ.

**Nguồn dữ liệu thực:** sổ tiếp nhận (A02), phiếu trình (A06/A07), sổ văn thư (A08), tin nhắn/email đã gửi (A04/A11/A14). Các nguồn này thường chỉ có ngày, nên mô phỏng ở mức phút chỉ minh họa phương pháp.


# Vòng 2 – Bản tổng hợp pass 2: mục 4–5 (toàn văn)
> **DỮ LIỆU MÔ PHỎNG.** Mọi tham số là giả định, không phải số đo tại trường. Mã A/G/L/GA kế thừa vòng 1. Bản này đã xử lý D6/C1 và các điểm 3–9 của phản biện pass 2.


## 4.7 Kết quả Process Mining đã chạy (Dữ liệu mô phỏng)

> Chạy ngày 24/10/2026: 7 cấu hình × 20 seed × 400 hồ sơ, đơn vị phút làm việc (450 phút/ngày). Code, test và hình: `analysis/` (xem analysis/README.md). Codex và Antigravity đã rà soát code 2 đợt (docs/ai-collab-run-3, run-4); 12 test tự động đều đạt. **Đây là dữ liệu mô phỏng, không phải số đo tại trường.**

| KPI (trung vị qua 20 seed) | AS-IS | TO-BE S0 (vẫn ký theo lô) | TO-BE S1 (ký 2 lần/ngày) | TO-BE S1, p không giảm | Seed S1 tốt hơn AS-IS |
|---|---|---|---|---|---|
| K1 trung vị T_trường | 1.363 | 944 | 788 | 792 | 20/20 |
| K2 P90 T_trường_net | 1.780 | 1.356 | 804 | 810 | 20/20 |
| K3 trung vị chờ trước ký | 551 | 584 | 121 | 120 | 20/20 (S0: 0/20) |
| K4 xử lý của cán bộ/ca | 43 | 21 | 21 | 23 | 20/20 |
| Trễ phát hiện quá hạn bổ sung | 1.239 | 0 | 0 | 0 | – |
| K9 tỷ lệ phải bổ sung | 30,1% | 15,6% | 15,6% | 30,1% | (tham số đầu vào) |

Hình cho slide: `analysis/out/dfg_AS-IS.png`, `dfg_TB-S1-p15.png` (slide 7), `wait_process.png` (slide 7–8), `kpi_compare.png` (slide 12). Event log CSV để kiểm tra độc lập: `analysis/out/eventlog_seed20260302.csv`.

**Thông điệp đã chốt (Codex + Antigravity, run-4):**
1. *Slide 7.* Ở AS-IS, chờ trình ký A06→A07 là ứng viên nghẽn duy nhất đạt đủ 3 tiêu chí (tô đỏ): trung vị 621 phút làm việc, P90 1.201 phút, 63% số ca chờ hơn 1 ngày làm việc, xuất hiện ở 369/400 ca. Ở TO-BE S1 không còn cạnh đỏ; chờ trước ký còn 123 phút.
2. *Slide 7.* Sau khi chuẩn hóa bước tương đương, tỷ lệ hồ sơ đi thẳng tăng từ 62,3% lên 75,5%; tỷ lệ phải bổ sung giảm từ 30,1% xuống 15,6%, nhưng mức giảm này là giả định đầu vào p, không phải phát hiện.
3. *Slide 8.* Các hàm lịch làm việc khớp tính tay trên mốc C001–C004 (843 / 1.693 / 1.233 / 5.740 phút; chờ ký 555 và 585; trễ phát hiện 2.130; tuổi net C004 = 95). Hàm tính KPI được kiểm trực tiếp trên ca C001.
4. *Slide 12.* Qua 20 seed ghép cặp, TO-BE S1 giảm trung vị T_trường 574 phút (từ 1.363 xuống 788) và chờ trước ký 434 phút (từ 551 xuống 121), tốt hơn AS-IS ở 20/20 seed.
5. *Slide 12.* Nếu chỉ tự động hóa mà vẫn ký theo lô (S0), chờ trước ký **không giảm** (+26 phút, 0/20 seed): phần cải thiện chờ ký đến từ đổi lịch ký, không phải từ phần mềm. Phần mềm giảm thao tác cán bộ từ 43 xuống 21 phút/ca và đưa trễ phát hiện quá hạn về 0.

**Không được kết luận:** (1) hiệu quả thực tế tại trường; (2) tự động hóa đơn thuần làm giảm chờ ký; (3) form web chắc chắn giảm một nửa hồ sơ phải bổ sung, hay nhắc hạn làm giảm tỷ lệ đóng quá hạn (K6 giữ 12,7–14,2% vì mô hình giữ cố định hành vi SV); (4) đạt mục tiêu K5: K5 net bằng 0% ở mọi cấu hình nên không phân biệt được kịch bản, thay bằng K5b gross (9,8% so với 0% ở S1) và trễ phát hiện; (5) chờ A01→A02 249 phút là xếp hàng thật (phần lớn do quy ước làm tròn 07:30 của GA10); (6) ngoại suy cho nhiều cán bộ, mùa cao điểm, hay ngày lễ 30/4–1/5 (chưa loại trừ).


## 6. Prototype tự động hóa (đã dựng và chạy được)

> Mục này mô tả **prototype thật** đem demo, nằm ở thư mục `prototype/` của repo này (trước ngày 24/10/2026 nằm ở OneDrive, thư mục `student-certificate-staging`). Bản đặc tả trước đây (n8n quyết định mọi chuyển trạng thái, WF1–WF5) được thay bằng kiến trúc dưới đây.

**Kiến trúc 4 dịch vụ (Docker Compose, chạy local):**

| Dịch vụ | Vai trò | Địa chỉ |
|---|---|---|
| App (FastAPI + Jinja + PM4Py) | Giao diện SV, cán bộ, phân tích; **bên duy nhất ghi trạng thái và event log**; kiểm tra vai trò, trạng thái, version, Idempotency-Key | http://localhost:8000 (`/staff`, `/analytics`) |
| PostgreSQL 17 | Data source: hồ sơ, event log, outbox | nội bộ |
| n8n Community 2.44 | Điều phối nghiệp vụ: nhận webhook, đọc hồ sơ, tiền kiểm, gọi chuyển trạng thái, gửi email, callback | http://localhost:5678 |
| Mailpit 1.31 | Hộp thư thử nghiệm local, không gửi ra Internet | http://localhost:8025 |

**Máy trạng thái (app/state_machine.py):** SUBMITTED →(n8n) PRECHECK_OK hoặc NEED_SUPPLEMENT (bắt buộc lý do) → (cán bộ) IN_REVIEW → APPROVED / REJECTED (bắt buộc lý do) / NEED_SUPPLEMENT → (cán bộ) ISSUED; NEED_SUPPLEMENT →(SV gửi lại) SUBMITTED, tăng `attempt_no`. Chuyển trạng thái sai vai trò hoặc sai thứ tự bị từ chối.

**Workflow n8n** (`n8n/workflows/student-certificate.json`), đáp ứng yêu cầu tối thiểu của giảng viên:

| Yêu cầu | Node trong workflow |
|---|---|
| 1 trigger | Webhook "Nhận yêu cầu từ Web" (`POST /webhook/certificate-process`) |
| Data source | HTTP "Đọc hồ sơ và nguồn dữ liệu sinh viên" (API app, đọc PostgreSQL) |
| Condition | IF "Là yêu cầu tiền kiểm?", IF "Đủ điều kiện và đủ thông tin?" |
| ≥ 4 actions | HTTP "Ghi kết quả tiền kiểm đạt", HTTP "Ghi yêu cầu bổ sung", HTTP "Xác nhận đồng bộ thông báo", "Phản hồi thành công" |
| Notification | Send Email "Gửi thông báo qua Mailpit" (SMTP) |

**Chống thành công giả:** giao diện chỉ coi là đã thông báo khi callback từ n8n về (`automation_status = SYNCED`); nếu n8n hoặc callback lỗi, hồ sơ giữ `PENDING`/`FAILED`. Gửi lại cùng Idempotency-Key không tạo hồ sơ mới.

**Kiểm thử đã chạy (24/10/2026):** `scripts/smoke-e2e.py` PASS – tạo hồ sơ, replay Idempotency-Key không tạo trùng, n8n hoàn thành tiền kiểm, cán bộ IN_REVIEW → APPROVED → ISSUED, n8n gửi email và callback SYNCED, event log có cấp giấy và thông báo, Mailpit có thư thật. Sau đó `scripts/reset-demo.sh` xóa riêng 2 ca demo, giữ dữ liệu mô phỏng.

**Kiểm thử qua giao diện web (24/10/2026, trình duyệt tự động, `slides/ui_e2e.py` và `slides/ui_supplement.py`):** luồng nộp form → n8n tiền kiểm → cán bộ nhận xử lý, duyệt, cấp giấy → email trong Mailpit, trạng thái SYNCED đạt; vòng cán bộ yêu cầu bổ sung (có lý do) → SV gửi lại → n8n tiền kiểm lại với `attempt_no = 2` đạt. Trong lúc chuẩn bị đã sửa 3 lỗi của prototype (reset không xóa khóa idempotency; cấp giấy qua API không gửi thông báo, khiến smoke test trước đó PASS giả; trùng khóa nhật ký khi có hai thông báo trong một lượt), xem `prototype/docs/chuan-bi-truoc-demo.md`. 20 test tự động của prototype đạt.

**Khác biệt với mô hình phân tích (cần nói rõ khi trình bày):** prototype gộp một số bước so với BPMN TO-BE (ví dụ tiền kiểm tự động của n8n đứng trước bước cán bộ xem xét; chưa có timer nhắc hạn A16 và đóng hồ sơ quá hạn A13). Trang Analytics trong app chạy PM4Py trên bộ mô phỏng nhỏ của app (seed 43044, 120 ca mỗi kịch bản) để minh họa; **số liệu chính của bài** lấy từ bộ mô phỏng 20 seed ở mục 4.7.


## 9. Kịch bản demo 10 phút (trên prototype staging)

**Trước giờ demo:** `docker compose up -d` trong thư mục staging; kiểm tra 5 địa chỉ ở mục 6 trả về 200; chạy `sh scripts/reset-demo.sh` (chỉ xóa dữ liệu demo); mở sẵn các tab Sinh viên, Cán bộ, Analytics, Mailpit, n8n. Không dùng `docker compose down -v` (xóa dữ liệu).

| Thời gian | Người | Thao tác | Kết quả mong đợi |
|---|---|---|---|
| 0:00–0:45 | TV1 | Giới thiệu 4 thành phần và phạm vi prototype local | Người xem hiểu đây là bản thử nghiệm |
| 0:45–2:00 | TV2 | Nộp hồ sơ hợp lệ ở trang Sinh viên | Nhận mã hồ sơ GXN-…; thông báo ở trạng thái PENDING trước callback |
| 2:00–3:30 | TV2 | Mở n8n, đi qua Webhook → đọc hồ sơ → IF → ghi kết quả → SMTP → callback | n8n thực sự xử lý, không chỉ là hình minh họa |
| 3:30–5:10 | TV3 | Cán bộ nhận xử lý, duyệt, xác nhận đã cấp | Trạng thái đúng thứ tự; event start/complete được ghi |
| 5:10–5:50 | TV3 | Mở Mailpit | Có email thử nghiệm đúng mã hồ sơ; giao diện đổi sang SYNCED |
| 5:50–7:00 | TV3 | Hồ sơ thứ hai: yêu cầu bổ sung (có lý do), SV gửi lại | Vòng bổ sung; `attempt_no` tăng |
| 7:00–8:50 | TV4 | Mở Analytics, lọc AS-IS/TO-BE, tải CSV; chiếu kết quả 20 seed (slide 7, 11) | Biến thể, chờ/xử lý, tồn đọng; nhãn "Dữ liệu mô phỏng" |
| 8:50–9:30 | TV4 | Thử thao tác sai thứ tự / gửi lại cùng khóa | Bị từ chối; không tạo hồ sơ trùng |
| 9:30–10:00 | TV1 | Tổng kết | Phân biệt kết quả mô phỏng với hiệu quả đã chứng minh |

**Dự phòng:** n8n chậm → dùng hồ sơ đã chuẩn bị sẵn và chỉ log/outbox, Mailpit; workflow lỗi → nói rõ hồ sơ còn PENDING/FAILED (minh họa chống thành công giả); Analytics không render → mở CSV và hình `analysis/out/*.png`; hỏng máy → ảnh chụp màn hình gắn nhãn "Bằng chứng ghi sẵn".

