# Tổng hợp kiến thức bài nhóm: Cấp giấy xác nhận sinh viên

Tài liệu nội bộ cho 4 thành viên: đọc trước khi làm slide và trước buổi trình bày để ai cũng trả lời được câu hỏi của giảng viên. Bối cảnh là **giả định học thuật**; mọi số liệu Process Mining là **dữ liệu mô phỏng**, không phải số đo tại trường. Bản đầy đủ: `docs/bao-cao-phan-tich.md`.

## 1. Đề bài và cách bài nhóm đáp ứng

Giảng viên yêu cầu nhóm 4 người trình bày 20 phút và demo 10 phút; nộp slide, sơ đồ, dữ liệu, prototype; **không nộp Word**.

| Yêu cầu của giảng viên | Bài nhóm đáp ứng bằng | Slide |
|---|---|---|
| Business Problem & Process Overview | 5 vấn đề P1–P5, phạm vi, đầu vào/đầu ra, 3 kết cục | 2–3 |
| Sơ đồ AS-IS (BPMN/Swimlane) | BPMN 4 lane, có điểm quyết định, từ chối, vòng bổ sung | 4 |
| Ít nhất 1 bottleneck: ở đâu, nguyên nhân, ảnh hưởng | 4 giả thuyết H1–H4; dữ liệu xác nhận H1 (chờ ký) | 5, 7 |
| Process Mining | Mô phỏng 20 seed × 400 hồ sơ; DFG, biến thể, cycle time, chờ, rework, loop | 6–8 |
| TO-BE | BPMN 5 lane (thêm lane Hệ thống) và bảng thay đổi | 9 |
| Prototype: 1 trigger, 4 actions, 1 condition, 1 data source, 1 notification | n8n (giảng viên đã đồng ý thay Power Automate) + web + Mailpit | 10–11 |
| Đánh giá cải tiến | KPI so theo cặp AS-IS/TO-BE, độ nhạy, điều không được kết luận | 12–13 |

## 2. Khái niệm cần nắm

- **BPM (Business Process Management):** quản lý quy trình theo vòng đời: mô hình hóa hiện trạng (AS-IS), phân tích, thiết kế lại (TO-BE), triển khai, đo lường.
- **BPMN / Swimlane:** ký hiệu chuẩn vẽ quy trình. *Lane* là người/bộ phận thực hiện; *task* là bước công việc; *gateway* (hình thoi) là điểm rẽ nhánh; *event* (hình tròn) là bắt đầu, kết thúc, hẹn giờ hoặc nhận tin.
- **Event-based gateway:** chờ sự kiện nào đến trước, ví dụ "SV nộp bổ sung" hay "hết hạn 7 ngày làm việc".
- **Bottleneck (điểm nghẽn):** chỗ hồ sơ phải chờ lâu, làm chậm cả quy trình. Không kết luận nguyên nhân chỉ từ một con số lớn.
- **Event log:** bảng ghi mỗi sự kiện gồm *case_id* (mã hồ sơ), *activity* (bước), *timestamp*, *resource/role*, *lifecycle* (start/complete), *scenario* (AS-IS/TO-BE).
- **Thời gian chờ** = lúc bắt đầu bước này − lúc xong bước trước. **Thời gian xử lý** = lúc xong − lúc bắt đầu cùng bước. **Cycle time** = tổng thời gian từ lúc nộp tới lúc kết thúc.
- **DFG (Directly-Follows Graph):** bản đồ quy trình dựng từ event log; mũi tên A→B nghĩa là B xảy ra ngay sau A; độ dày là tần suất.
- **Biến thể (variant):** một chuỗi bước cụ thể mà hồ sơ đi qua, ví dụ "đi thẳng" hay "bổ sung 1 vòng".
- **Rework / loop:** làm lại; ở bài này là vòng A03 → A04 → A05 → A03 (kiểm tra → báo bổ sung → SV nộp lại → kiểm tra lại).
- **KPI Efficiency** đo tốc độ, công sức (thời gian, thao tác); **KPI Effectiveness** đo kết quả đúng (tỷ lệ bổ sung, đóng quá hạn, thông báo có lưu vết).
- **Phút làm việc:** chỉ tính T2–T6, 07:30–11:30 và 13:30–17:00, nên 1 ngày làm việc = 450 phút.
- **Seed và CRN (ghép cặp):** cùng seed cho ra cùng dữ liệu (tái lập được); AS-IS và TO-BE dùng chung dòng hồ sơ đến nên so sánh công bằng theo từng cặp.
- **n8n:** công cụ tự động hóa quy trình mã nguồn mở, tự host. *Webhook* là địa chỉ nhận yêu cầu (trigger); mỗi bước là một *node*.
- **Idempotency:** gửi lại cùng một yêu cầu (cùng khóa) không tạo bản ghi trùng.
- **Callback:** n8n báo ngược về app sau khi gửi email; giao diện chỉ hiện "Đã thông báo" khi nhận được callback (chống báo thành công giả).

## 3. Bối cảnh và bài toán (giả định)

Phòng Công tác HSSV cấp giấy xác nhận thủ công cho 4 loại: đang học, hoãn nghĩa vụ quân sự, vay vốn, học bổng. Quy trình: nộp đơn giấy/form → tra danh sách → soạn giấy → trình ký → đóng dấu → báo SV qua điện thoại/Zalo.

| Mã | Vấn đề (giả thuyết) | Dấu hiệu kiểm chứng |
|---|---|---|
| P1 | SV không tra được trạng thái hồ sơ | Số lần SV hỏi lại |
| P2 | Thiếu/sai thông tin phát hiện muộn | Tỷ lệ hồ sơ phải bổ sung |
| P3 | Chờ ký lâu | Thời gian chờ từ soạn giấy tới lúc ký |
| P4 | Quá hạn chỉ lộ ra khi rà sổ thứ Sáu | Độ trễ từ lúc hết hạn tới lúc đóng hồ sơ |
| P5 | Thông báo không lưu vết | Tỷ lệ thông báo có bằng chứng (chỉ đo được ở TO-BE) |

**Phạm vi:** từ lúc SV nộp tới 1 trong 3 kết cục: E1 nhận giấy, E2 bị từ chối có lý do, E3 đóng do quá hạn bổ sung. Ngoài phạm vi: ký số, giá trị pháp lý, tích hợp CSDL của trường.

**Giả định chính:** 1 cán bộ tiếp nhận kiêm nhiệm, 1 người ký; hạn bổ sung 7 ngày làm việc; ngưỡng quá hạn toàn trình 5 ngày làm việc (tham số, không phải quy định).

**Hai mốc đo:** *thời gian phía trường* (nộp → SV biết kết quả) và *thời gian phía SV* (thêm khoảng SV chuẩn bị bổ sung và đến nhận giấy). Tách riêng để không tính thời gian của SV thành điểm nghẽn của trường.

## 4. Quy trình hiện tại (AS-IS)

Hình: `2-hinh-anh/01-bpmn-as-is.png`; file chỉnh được: `diagrams/as-is.bpmn` (mở bằng demo.bpmn.io).

1. SV nộp yêu cầu (A01) → cán bộ tiếp nhận, ghi sổ (A02) → kiểm tra thông tin và tư cách (A03).
2. Kết quả kiểm tra có 3 nhánh: **đủ** → soạn giấy (A06); **thiếu/sai** → báo SV bổ sung (A04), chờ SV nộp lại (A05) hoặc hết hạn → đóng hồ sơ (A13, E3); **không đủ tư cách** → trình lãnh đạo từ chối.
3. Lãnh đạo xem xét và ký (A07, ký theo lô thứ Ba và thứ Năm): duyệt → văn thư đóng dấu (A08) → xác nhận đã cấp (A09) → báo SV (A11) → SV nhận giấy (A12, E1); từ chối → ghi lý do (A10) → báo SV (A14, E2).
4. Quá hạn bổ sung chỉ được phát hiện khi rà sổ chiều thứ Sáu.

## 5. Điểm nghẽn

| | Vị trí | Nguyên nhân giả định | Ảnh hưởng |
|---|---|---|---|
| **H1** | Chờ ký (soạn giấy → lãnh đạo ký) | Ký theo lô, người ký vắng | Kéo dài thời gian phía trường; SV hỏi lại |
| H2 | Vòng bổ sung | Biểu mẫu không nêu rõ giấy tờ | Làm lại nhiều lần; tăng hồ sơ bị đóng quá hạn |
| H3 | Chờ kiểm tra đầu vào | Cán bộ kiêm nhiệm, tra cứu tay | Ứ đọng đầu vào |
| H4 | Chờ chuyển giấy sang văn thư | Chuyển theo lô | Thêm thời gian mà không ai theo dõi |

**Tiêu chí ứng viên điểm nghẽn (công bố trước khi chạy dữ liệu):** (a) trung vị thời gian chờ thuộc 3 chuyển tiếp lớn nhất; (b) ít nhất 50% số ca qua chuyển tiếp chờ quá 1 ngày làm việc; (f) chuyển tiếp xuất hiện ở ít nhất 10% số ca. Đạt cả ba mới gọi là ứng viên; chỉ nêu nguyên nhân khi có bằng chứng (lịch ký, cỡ lô).

**Kết quả:** chỉ **H1 (chờ ký)** đạt cả ba tiêu chí.

## 6. Process Mining trên dữ liệu mô phỏng

**Thiết kế:** 400 hồ sơ mỗi lần chạy trong 12 tuần (thêm 8 tuần để xử lý hết hồ sơ tồn), 20 seed, 7 cấu hình: AS-IS; TO-BE S1 (ký 2 lần/ngày: 10:30 và 16:00); TO-BE S0 (tự động hóa nhưng vẫn ký theo lô); mỗi loại TO-BE có 3 mức xác suất phải bổ sung (0,15 / 0,22 / 0,30). Giữ nguyên ở mọi kịch bản: số hồ sơ, loại giấy, hành vi SV, số cán bộ.

**Công cụ:** Python; PM4Py (`discover_dfg`, `get_variants`) dựng bản đồ quy trình và biến thể; thời gian chờ/xử lý tính bằng pandas theo phút làm việc. Code và event log CSV: `analysis/`.

**Kết quả chính (seed 20260302 cho bản đồ; 20 seed cho KPI):**

- Chờ ký A06→A07: trung vị **621 phút làm việc**, P90 1.201 phút, 63% số ca chờ quá 1 ngày làm việc, xuất hiện ở 369/400 ca.
- Biến thể AS-IS: 62,3% đi thẳng; 18,5% bổ sung 1 vòng rồi nhận giấy; 3,5% bổ sung 2 vòng; 4,5% bổ sung rồi bị đóng quá hạn.
- Cycle time phía trường (AS-IS, trung vị 20 seed): 1.363 phút (P90 2.816).
- Rework: 30,1% hồ sơ phải bổ sung; trung bình 0,35 vòng lặp mỗi hồ sơ.
- Cạnh A01→A02 (249 phút) bị tô vàng phần lớn do quy ước làm tròn giờ nộp về 07:30, không phải xếp hàng thật.
- Không tính là nghẽn của trường: thời gian SV chuẩn bị bổ sung (A04→A05) và đến nhận giấy (A11→A12).

**Kiểm chứng:** bộ tính tay 4 hồ sơ mẫu (C001 = 843, C002 = 1.693, C003 = 1.233, C004 = 5.740 phút; chờ ký 555 và 585; trễ phát hiện quá hạn C004 = 2.130) khớp với hàm trong code; hàm tính KPI được kiểm trực tiếp trên ca C001; 12 test tự động đạt. Codex và Antigravity rà code 2 đợt, các lỗi tìm được đã sửa trước khi chốt số.

## 7. Quy trình đề xuất (TO-BE)

Hình: `2-hinh-anh/02-bpmn-to-be.png`; file chỉnh được: `diagrams/to-be.bpmn`.

| Loại thay đổi | Nội dung |
|---|---|
| Kiểm soát lại | Form web có trường bắt buộc và checklist giấy tờ theo loại giấy; lãnh đạo ký 2 khung giờ/ngày, cảnh báo khi chờ quá 1 ngày làm việc; báo văn thư ngay khi đã ký |
| Tự động hóa | Tạo mã hồ sơ và email xác nhận; sinh giấy từ mẫu (cán bộ rà lại); email bổ sung có mục thiếu, hạn, link nộp lại; nhắc trước hạn 2 ngày; đóng hồ sơ đúng hạn; email kết quả có lưu vết |
| Loại bỏ | Bước ghi lý do từ chối riêng (gộp vào bước duyệt, bắt buộc nhập lý do) |
| Giữ nguyên | Lãnh đạo quyết định; ký và đóng dấu giấy; tiêu chí tư cách |

## 8. Prototype (đã dựng và chạy được)

Thư mục `prototype/`, chạy bằng Docker Compose trên máy:

| Thành phần | Vai trò | Địa chỉ |
|---|---|---|
| Web app (FastAPI) | Giao diện SV, cán bộ, phân tích; **bên duy nhất ghi trạng thái và nhật ký** | http://localhost:8000 |
| PostgreSQL | Data source: hồ sơ, nhật ký sự kiện, hàng đợi thông báo | nội bộ |
| n8n Community | Điều phối: nhận webhook, tiền kiểm, gọi chuyển trạng thái, gửi email, callback | http://localhost:5678 |
| Mailpit | Hộp thư thử nghiệm local, không gửi ra Internet | http://localhost:8025 |

**Workflow n8n** (hình `13-workflow-n8n.png`): trigger là Webhook "Nhận yêu cầu từ Web"; data source là HTTP "Đọc hồ sơ và nguồn dữ liệu sinh viên"; condition là 2 nút IF ("Là yêu cầu tiền kiểm?", "Đủ điều kiện và đủ thông tin?"); actions là "Ghi kết quả tiền kiểm đạt", "Ghi yêu cầu bổ sung", "Xác nhận đồng bộ thông báo", "Phản hồi thành công"; notification là Send Email "Gửi thông báo qua Mailpit".

**Trạng thái hồ sơ:** SUBMITTED → (n8n) PRECHECK_OK hoặc NEED_SUPPLEMENT → (cán bộ) IN_REVIEW → APPROVED / REJECTED / NEED_SUPPLEMENT → ISSUED. SV gửi lại hồ sơ bổ sung thì lượt xử lý (`attempt_no`) tăng.

**Đã kiểm chứng ngày 24/10/2026:** smoke test toàn luồng đạt; qua giao diện web, luồng cấp giấy và vòng yêu cầu bổ sung đều đạt; 20 test của prototype đạt.

**Khác với BPMN TO-BE:** prototype gộp một số bước và chưa có timer nhắc hạn/đóng quá hạn tự động. Trang Analytics trong app dùng 120 ca (seed 43044) để minh họa; số liệu chính của bài lấy từ bộ 20 seed.

## 9. Đánh giá cải tiến (dữ liệu mô phỏng, mục tiêu dự kiến)

| KPI (trung vị 20 seed, phút làm việc) | AS-IS | TO-BE S0 (ký theo lô) | TO-BE S1 (ký 2 lần/ngày) |
|---|---|---|---|
| Thời gian phía trường | 1.363 | 944 | 788 |
| P90 thời gian phía trường (đã trừ thời gian SV) | 1.780 | 1.356 | 804 |
| Chờ trước khi ký | 551 | 584 | 121 |
| Thao tác của cán bộ mỗi hồ sơ | 43 | 21 | 21 |
| Trễ phát hiện quá hạn bổ sung | 1.239 | 0 | 0 |

- S1 tốt hơn AS-IS ở **20/20 seed** về thời gian phía trường và chờ ký (p = 0,15).
- **Phát hiện quan trọng nhất:** S0 (tự động hóa mà vẫn ký theo lô) **không giảm chờ ký** (0/20 seed; 3/20 và 4/20 khi p = 0,22 và 0,30). Muốn giảm chờ ký phải đổi lịch ký; phần mềm giảm thao tác cán bộ (43 → 21 phút/hồ sơ) và đưa trễ phát hiện quá hạn về 0.
- K5 (tỷ lệ hồ sơ quá hạn tính theo tuổi ròng) bằng 0% ở mọi kịch bản nên không phân biệt được; thay bằng tuổi gộp (9,8% ở AS-IS so với 0% ở S1) và trễ phát hiện.
- K6 (tỷ lệ đóng do quá hạn, 12,7–14,2%) không giảm vì mô hình cố ý giữ nguyên tỷ lệ SV không phản hồi 8%.

**Không được kết luận:** hiệu quả thực tế tại trường; phần mềm tự thân làm giảm chờ ký; form web chắc chắn giảm một nửa hồ sơ phải bổ sung (đó là giả định đầu vào); nhắc hạn làm giảm tỷ lệ đóng quá hạn.

## 10. Giới hạn và bước tiếp theo

- Giới hạn: tham số là giả định; 1 cán bộ tiếp nhận; chưa loại trừ ngày lễ 30/4–1/5; prototype chưa có timer nhắc hạn và đóng quá hạn tự động.
- Bước 1: thu sổ tiếp nhận, phiếu trình, sổ văn thư của một học kỳ để dựng event log thật.
- Bước 2: hiệu chỉnh tham số, chạy lại Process Mining, xác nhận hoặc bác giả thuyết H1.
- Bước 3: thí điểm lịch ký 2 khung giờ và form web cho một loại giấy, đo hằng tuần.

## 11. Câu hỏi giảng viên có thể hỏi

| Câu hỏi | Gợi ý trả lời |
|---|---|
| Sao dùng dữ liệu mô phỏng? | Trường đang làm trên sổ giấy/Zalo, chưa có log theo phút. Nhóm mô phỏng 20 seed ghép cặp, chạy độ nhạy, và nêu lộ trình thu log thật. |
| Sao S0 tự động hóa mà chờ ký còn tăng nhẹ? | Vẫn ký theo lô thứ Ba/thứ Năm; các bước trước xong sớm hơn nên hồ sơ chờ phiên ký lâu hơn. Phải đổi lịch ký (S1) mới giảm. |
| Prototype khác TO-BE thế nào? | Có luồng cốt lõi, idempotency, chống báo thành công giả; chưa có timer nhắc hạn và đóng quá hạn tự động. |
| Có nhắc hạn sao tỷ lệ đóng quá hạn không giảm? | Mô hình giữ cố định hành vi SV để không thổi phồng hiệu quả; timer chỉ đưa trễ phát hiện quá hạn về 0. |
| Sao chọn n8n thay Power Automate? | Giảng viên đã đồng ý; n8n miễn phí, tự host, không cần tài khoản Microsoft, có workflow JSON xuất được. |
| Làm sao biết công thức tính đúng? | Bộ tính tay 4 hồ sơ mẫu khớp code; 12 test tự động; 2 AI rà code độc lập. |
| Nếu n8n lỗi khi demo? | Hồ sơ giữ trạng thái "Chờ thông báo", không báo thành công giả; mở n8n Executions để xem lỗi. |

## 12. Thuật ngữ và mã hoạt động

| Mã | Ý nghĩa | Mã | Ý nghĩa |
|---|---|---|---|
| A01 | SV nộp yêu cầu | A09 | Xác nhận đã cấp |
| A02 | Tiếp nhận, ghi sổ / tạo mã hồ sơ | A10 | Ghi lý do từ chối (chỉ AS-IS) |
| A03 | Kiểm tra thông tin và tư cách | A11 | Báo SV có giấy |
| A04 | Báo SV bổ sung | A12 | SV nhận giấy |
| A05 | SV nộp bổ sung | A13 | Đóng hồ sơ quá hạn |
| A06 | Soạn giấy / sinh giấy từ mẫu | A14 | Báo SV bị từ chối |
| A07 | Lãnh đạo xem xét, ký | A15 | Kiểm tra định dạng form (TO-BE) |
| A08 | Văn thư đóng dấu | A16, A17 | Nhắc hạn; cán bộ rà giấy (TO-BE) |

**Nguồn trong repo:** `docs/bao-cao-phan-tich.md` (báo cáo đầy đủ), `analysis/out/results.md` (bảng KPI), `prototype/docs/demo-script.md` (kịch bản demo), `prototype/docs/chuan-bi-truoc-demo.md` (checklist).
