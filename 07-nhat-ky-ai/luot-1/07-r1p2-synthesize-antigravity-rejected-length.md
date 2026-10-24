# Báo cáo phân tích – Vòng 1 (mục 1–3), bản tổng hợp hoàn chỉnh (Pass 2)
> Mọi nội dung là **giả định học thuật**, chưa có dữ liệu hay quy trình chính thức của trường. Nhóm có thể điều chỉnh các mã `GAx`. Báo cáo không trích dẫn quy định pháp luật hay số liệu thực tế.

## 1. Business Problem & Process Overview
**Bối cảnh (giả định):** Phòng Công tác HSSV (CTHSSV) trường Cao đẳng Y Dược đang xử lý thủ công yêu cầu cấp giấy xác nhận sinh viên (đang học, hoãn NVQS, vay vốn NHCSXH, xin học bổng). Quy trình hiện tại: SV nộp đơn giấy hoặc điền form rời rạc → cán bộ tra cứu danh sách SV → soạn giấy → trình lãnh đạo ký → chuyển văn thư đóng dấu → báo SV qua điện thoại/Zalo/email cá nhân.

**Các vấn đề nghiệp vụ (giả thuyết cần xác minh qua phỏng vấn & dữ liệu):**
| Mã | Giả thuyết vấn đề | Dấu hiệu / Dữ liệu kiểm chứng |
|---|---|---|
| P1 | SV không có mã hồ sơ để tự tra cứu trạng thái (số sổ gán ở A02 không báo cho SV) | Số lượt SV hỏi lại trực tiếp/Zalo trên mỗi hồ sơ |
| P2 | Thiếu/sai thông tin phát hiện muộn do form đầu vào thiếu ràng buộc theo loại giấy | Tỷ lệ hồ sơ có ≥1 vòng bổ sung (A04); phân bố mã lý do bổ sung (`reason_code`) |
| P3 | Thời gian chờ ký duyệt kéo dài | Thời gian chờ `complete(A06) → start(A07)` tính theo giờ làm việc |
| P4 | Hồ sơ quá hạn bổ sung chỉ phát hiện khi rà sổ thủ công định kỳ | Độ trễ phát hiện: từ mốc hết hạn `GA3` đến `start(A13)` |
| P5 | Thông báo thủ công (điện thoại/Zalo) không lưu vết hệ thống | Ở AS-IS hầu như không có log (chỉ ghi nhận định tính); chỉ đo định lượng tỷ lệ gửi thành công ở TO-BE |

**Mục tiêu cải tiến (dự kiến):** Tách bạch thời gian chờ và thời gian xử lý; giảm tỷ lệ phải bổ sung hồ sơ; cấp mã theo dõi minh bạch ngay khi nộp; tự động cảnh báo quá hạn; chuẩn hóa thông báo có lưu vết và kèm lý do rõ ràng.

**Điểm bắt đầu & kết thúc:**
- **Bắt đầu:** `A01` – Sinh viên nộp yêu cầu.
- **Kết thúc:** `E1` (SV đã nhận giấy), `E2` (Bị từ chối kèm lý do), `E3` (Đóng hồ sơ do quá hạn bổ sung).
- **Hai mốc đo thời gian hoàn thành:**
  - `T_trường = complete(A11 | A14 | A13) − complete(A01)`: Thời gian thuộc phạm vi kiểm soát của trường. Với nhánh duyệt (`E1`), mốc kết thúc `T_trường` đặt tại `A11` (đã báo SV có giấy) thay vì `A09` vì nghĩa vụ phục vụ của trường chỉ hoàn tất khi đã phát thông báo cho SV.
  - `T_SV = complete(A12) − complete(A01)`: Tổng thời gian đến tay SV (chỉ tính cho các hồ sơ đã có `A12`; hồ sơ đã qua `A11` nhưng chưa có `A12` tại thời điểm cắt dữ liệu được phân loại là *right-censored / tồn phía SV*, không gộp vào trung vị `T_SV`).

**Các bên liên quan (Stakeholders & Lanes):**
| Bên liên quan | Lane | Vai trò trong quy trình |
|---|---|---|
| Sinh viên | L1 (`student`) | Nộp yêu cầu, bổ sung hồ sơ, nhận kết quả |
| Cán bộ CTHSSV | L2 (`officer`) | Tiếp nhận, kiểm tra tư cách, yêu cầu bổ sung, soạn giấy, xác nhận cấp, gửi thông báo |
| Lãnh đạo phòng / Người được ủy quyền | L3 (`approver`) | Xem xét, quyết định duyệt/từ chối/trả lại, ký giấy xác nhận |
| Văn thư | L4 (`clerk`) | Đóng dấu mộc, vào sổ văn bản đi |
| Phòng Đào tạo | Ngoài BPMN | Nguồn dữ liệu tra cứu tình trạng học tập của SV |
| Cơ quan nhận giấy | Ngoài phạm vi | Ngân hàng, địa phương, đơn vị cấp học bổng |

**Đầu vào:** MSSV, họ tên, ngày sinh, lớp/khoa, loại giấy (`cert_type`), mục đích, số bản, kênh liên hệ (email/SĐT), minh chứng đính kèm theo loại giấy (`GA5`).
**Đầu ra:** Giấy xác nhận đã ký & đóng dấu (`E1`), hoặc thông báo từ chối có lý do (`E2`), hoặc thông báo đóng hồ sơ quá hạn (`E3`); bản ghi sổ theo dõi / event log.
**Phạm vi:** Từ `A01` đến `E1/E2/E3`. Ngoài phạm vi: chữ ký số pháp lý, tích hợp ERP/CSDL đào tạo chính thức, quy trình cấp lại bản sao.

**Bảng giả định nghiệp vụ (có thể cấu hình):**
| Mã | Nội dung giả định |
|---|---|
| GA1 | Giờ làm việc: Thứ 2–Thứ 6, sáng 07:30–11:30, chiều 13:30–17:00 (`Asia/Ho_Chi_Minh`). |
| GA2 | Định biên nhân sự xử lý: 01 cán bộ CTHSSV kiêm nhiệm (`OFF01`), 01 lãnh đạo ký (`APP01`), 01 văn thư (`CLK01`). |
| GA3 | Thời hạn SV bổ sung hồ sơ: `7` ngày làm việc kể từ `complete(A04)`. Timer nổ đúng thời điểm hết hạn `GA3`. |
| GA4 | Ngưỡng SLA toàn trình (`T_trường`): tham số cấu hình (mặc định thử nghiệm `3` hoặc `5` ngày làm việc), không phải quy định cứng. |
| GA5 | Danh mục giấy tờ kèm theo từng loại giấy (ví dụ: vay vốn cần mẫu thông tin tín dụng): nhóm xác minh khi khảo sát. |
| GA6 | `A03` phân loại 3 nhánh. Thẩm quyền từ chối chính thức thuộc `L3` tại `A07`. |
| GA7 | AS-IS không giới hạn số vòng bổ sung `k` miễn SV nộp lại trước khi hết hạn `GA3` của vòng đó. |
| GA8 | AS-IS rà sổ quá hạn thủ công vào chiều thứ Sáu hằng tuần (15:00–17:00). Nếu SV nộp bổ sung (`A05`) sau khi hết hạn `GA3` (kể cả trước lúc cán bộ rà sổ), hồ sơ vẫn bị coi là quá hạn và chuyển sang `A13`; khoảng từ lúc hết hạn `GA3` đến `start(A13)` là thời gian chờ phát hiện quá hạn. |
| GA9 | AS-IS gán `case_id` theo số sổ tại `A02`; SV không biết mã này khi nộp ở `A01`. |
| GA10 | Dữ liệu thực tế ở sổ giấy chỉ ghi ngày; khi quy đổi sang timestamp để đối chiếu với mô phỏng, nếu thiếu giờ của `A01` thì chuẩn hóa về đầu giờ làm việc (`07:30`) cùng ngày ở cả AS-IS và TO-BE. |
| GA11 | AS-IS giả định `L3` không trực tiếp yêu cầu SV bổ sung (nếu có trong thực tế sẽ mở rộng nhánh `G2 → A04`). |
| GA12 | Hồ sơ đã qua `A11` nhưng SV chưa nhận (`A12`) được tách riêng thành tồn phía SV (`pending_pickup`), không tính vào tồn đọng xử lý của trường (`WIP_trường`). |
| GA13 | Chuẩn hóa `role`/`resource` trong log: `L1=student`, `L2=officer`, `L3=approver`, `L4=clerk`; mã nhân sự ẩn danh (`OFF01`, `APP01`, `CLK01`). |

---

## 2. Quy trình AS-IS (Swimlane / BPMN Specification)
**Bảng đặc tả hoạt động và điều hướng BPMN:**
| Mã | Tên hoạt động / Gateway | Lane | Đi tới | Log Lifecycle | Thuộc tính / Quy tắc nghiệp vụ |
|---|---|---|---|---|---|
| Start | Start Event: Phát sinh nhu cầu | L1 | A01 | – | – |
| A01 | Nộp yêu cầu cấp giấy | L1 | A02 | `complete` | Sự kiện tức thời; ghi nhận `cert_type`, `channel` |
| A02 | Tiếp nhận, vào sổ, gán số hồ sơ | L2 | A03 | `start+complete` | Gán `case_id` |
| A03 | Kiểm tra thông tin & tư cách SV | L2 | G1 | `start+complete` | Ghi kết quả kiểm tra `check_result` (`valid`, `missing`, `ineligible`) và `reason_code` |
| G1 | XOR: Kết quả kiểm tra? | L2 | `valid`→A06; `missing`→A04; `ineligible`→A07 | – | Ca không đủ tư cách chuyển thẳng `A07` kèm đề xuất từ chối, không soạn giấy ở `A06` |
| A04 | Báo SV bổ sung (nêu mục thiếu & hạn GA3) | L2 | G3 | `start+complete` | Tăng biến đếm vòng bổ sung `supplement_round += 1` |
| G3 | Event-based Gateway: Chờ SV hay hết hạn? | L2 | Trước hạn `GA3`→A05; Chạm hạn `GA3`→A13 | – | Timer nổ đúng mốc hết hạn `GA3`. Mọi `A05` đến sau mốc `GA3` đều không hợp lệ |
| A05 | SV nộp bổ sung thông tin/minh chứng | L1 | A03 | `complete` | Chỉ xảy ra khi `timestamp(A05) <= complete(A04) + GA3` |
| A06 | Soạn giấy xác nhận & phiếu trình | L2 | A07 | `start+complete` | – |
| A07 | Xem xét, quyết định; ký nếu duyệt | L3 | G2 | `start+complete` | Ghi thuộc tính event `decision` (`approve`, `reject`, `return_to_draft`) |
| G2 | XOR: Quyết định của L3? | L3 | `approve`→A08; `reject`→A10; `return_to_draft`→A06 | – | Nhánh `return_to_draft → A06` chỉ hợp lệ khi bước liền trước `A07` là `A03` (qua `G1` nhánh `ineligible`) |
| A08 | Đóng dấu mộc, vào sổ văn thư | L4 | A09 | `start+complete` | – |
| A09 | Xác nhận hoàn tất cấp giấy trên sổ | L2 | A11 | `start+complete` | – |
| A10 | Ghi nhận lý do từ chối chính thức | L3 | A14 | `start+complete` | Ghi `reject_reason` |
| A11 | Thông báo SV đã có giấy & hẹn nhận | L2 | A12 | `start+complete` | Kết thúc `T_trường` cho nhánh duyệt |
| A12 | SV đến nhận giấy xác nhận | L1 | E1 | `complete` | Kết thúc `T_SV` → End Event `E1` (Đã cấp) |
| A13 | Đóng hồ sơ quá hạn bổ sung & báo SV | L2 | E3 | `start+complete` | `start(A13)` diễn ra tại kỳ rà sổ thứ Sáu (`GA8`) đầu tiên sau khi timer `GA3` nổ → End Event `E3` (Quá hạn) |
| A14 | Thông báo từ chối kèm lý do cho SV | L2 | E2 | `start+complete` | Kết thúc `T_trường` cho nhánh từ chối → End Event `E2` (Từ chối) |

**Quy ước tính thời gian & ràng buộc toàn vẹn Event Log (`R1–R6`):**
- **Thời gian xử lý (Service/Processing time) của bước `Ai` (L2–L4):** `complete(Ai) − start(Ai)`.
- **Thời gian chờ (Waiting/Queue time) trước bước `Ai`:** `start(Ai) − complete(bước liền trước)`. Đặc biệt tại `G3 → A13`, khoảng từ lúc hết hạn `GA3` đến `start(A13)` là thời gian chờ phát hiện quá hạn (do rà sổ theo tuần `GA8`).
- **Ràng buộc kiểm tra log tự động:**
  - `R1`: Mỗi hồ sơ đã đóng kết thúc tại đúng một trong ba hoạt động `A12` (`E1`), `A14` (`E2`), hoặc `A13` (`E3`).
  - `R2`: `A08` chỉ xuất hiện ngay sau `A07` có `decision = approve`; nhánh `A07 → A06` chỉ xuất hiện khi bước trước `A07` là `A03` và `decision = return_to_draft`.
  - `R3`: `A10` chỉ xuất hiện ngay sau `A07` có `decision = reject` và luôn đi tới `A14`.
  - `R4`: `A13` chỉ xuất hiện sau `A04` khi không có sự kiện `A05` nào thỏa `timestamp(A05) <= complete(A04) + GA3`, và `start(A13) >= complete(A04) + GA3`.
  - `R5`: Mọi hoạt động thuộc `L2–L4` đều có cặp `start` và `complete` khớp nhau với `complete >= start`; các hoạt động `A01, A05, A12` chỉ có `complete`.
  - `R6`: Số vòng bổ sung của hồ sơ `supplement_count = count(A04)`.

**Các biến thể quy trình (Process Variants) điển hình:**
- `V1` (Luồng thẳng chuẩn): `A01 → A02 → A03 → A06 → A07 → A08 → A09 → A11 → A12`.
- `V2` (Có bổ sung `k ≥ 1` lần rồi duyệt): `A01 → A02 → A03 → [A04 → A05 → A03]×k → A06 → A07 → A08 → A09 → A11 → A12`.
- `V3` (Đủ hồ sơ nhưng bị từ chối ở bước ký): `A01 → A02 → A03 → [A04 → A05 → A03]×k → A06 → A07 → A10 → A14` (`k ≥ 0`).
- `V4` (Không đủ tư cách ngay từ `A03`, `L3` đồng ý từ chối): `A01 → A02 → A03 → A07 → A10 → A14`.
- `V4b` (`L2` đề xuất từ chối nhưng `L3` yêu cầu cấp, trả về soạn giấy): `A01 → A02 → A03 → A07 → A06 → A07 → A08 → A09 → A11 → A12`.
- `V5` (Quá hạn bổ sung ở vòng thứ `k+1`): `A01 → A02 → A03 → [A04 → A05 → A03]×k → A04 → A13` (`k ≥ 0`).

---

## 3. Phân tích Bottleneck (Các giả thuyết ứng viên & Thiết kế kiểm chứng)
> Không kết luận nguyên nhân nghẽn chỉ từ một con số thời gian lớn. Tách riêng các giả thuyết nghẽn nội bộ của trường (`H1–H4`, tác động vào `T_trường`) và phép tách độ trễ nhận giấy phía sinh viên (`S_SV`, tác động vào `T_SV`).

| Mã | Vị trí (Bước / Chuyển tiếp) | Nguyên nhân giả định | Ảnh hưởng nghiệp vụ | Dữ liệu & Phép đo cần để kiểm chứng |
|---|---|---|---|---|
| **H1** | Chuyển tiếp `A06 → A07` (Chờ lãnh đạo ký duyệt) | Lãnh đạo gom hồ sơ ký theo lô cuối ngày/cuối tuần hoặc bận họp; không có cơ chế nhắc hạn tự động | Kéo dài `T_trường`, làm tăng số lượt SV hỏi tiến độ (`P1, P3`) | Phân phối `start(A07) − complete(A06)` theo giờ làm việc; tương quan giữa thời điểm `complete(A06)` với cụm giờ `start(A07)` (dấu hiệu xử lý theo lô); lịch công tác của `L3` |
| **H2** | Vòng lặp bổ sung `A03 → A04 → A05 → A03` | Biểu mẫu đầu vào không kiểm tra ràng buộc theo `cert_type`; nội dung báo bổ sung ở `A04` không rõ khiến SV nộp thiếu nhiều lần | Tăng khối lượng làm lại (`rework`) cho `L2`, kéo dài thời gian toàn trình, tăng nguy cơ rơi vào `E3` (`A13`) | Tách 3 đoạn: (1) `start(A04) − complete(A03)` (trễ báo bổ sung - phía trường); (2) `complete(A05) − complete(A04)` (thời gian SV chuẩn bị - phía SV); (3) `start(A03_lặp) − complete(A05)` (chờ kiểm tra lại - phía trường); thống kê theo `reason_code`, `cert_type`, `channel` |
| **H3** | Chuyển tiếp `A02 → A03` (Chờ kiểm tra ban đầu) | Cán bộ `L2` kiêm nhiệm (`GA2`), phải tra cứu thủ công tình trạng SV từ dữ liệu Phòng Đào tạo | Ứ đọng hồ sơ đầu vào (`WIP_trường` tăng), tăng tuổi hồ sơ ngay từ chặng đầu | `start(A03) − complete(A02)` theo giờ làm việc; số lượng hồ sơ tồn ở trạng thái chờ `A03` theo từng khung giờ trong ngày |
| **H4** | Chuyển tiếp `A07 → A08` (Bàn giao từ L3 sang Văn thư L4) | Giấy đã ký nằm chờ tại bàn lãnh đạo, gom chuyển theo đợt sang văn thư; không có người chịu trách nhiệm SLA chuyển giao | Tăng `T_trường` ngầm sau khi đã duyệt mà SV vẫn chưa được báo nhận giấy | `start(A08) − complete(A07)` theo giờ làm việc; tần suất gom lô tại `start(A08)` |

**Phép tách độ trễ ngoài phạm vi kiểm soát của trường (`S_SV`):**
- **Vị trí:** Chuyển tiếp `complete(A11) → complete(A12)` (từ lúc báo có giấy đến lúc SV đến nhận, vì `A12` chỉ ghi `complete`).
- **Ý nghĩa:** SV đi học hoặc thực tập lâm sàng tại bệnh viện nên đến nhận muộn. Khoảng thời gian này làm tăng `T_SV` nhưng **không phải bottleneck của trường**; được đo tách biệt để bảo vệ tính chính xác của KPI nội bộ (`T_trường`).

**Tiêu chí định lượng xác nhận điểm nghẽn (sẽ áp dụng ở Vòng 2):**
1. **Tiêu chí (a) – Độ lớn tương đối:** Trung vị (Median) thời gian chờ (tính theo giờ làm việc `GA1`) nằm trong Top 3 chuyển tiếp toàn quy trình.
2. **Tiêu chí (b) – Độ phổ biến & Độ lệch:** Có ít nhất 50% hồ sơ đi qua chuyển tiếp đó vượt ngưỡng chờ cấu hình; đồng thời đối chiếu `Median` và `P90` để phân biệt nghẽn hệ thống (cả Median và P90 đều cao) với nghẽn cục bộ do ngoại lai (Median thấp, P90 vọt cao).
3. **Tiêu chí (c) – Bằng chứng cơ chế:** Có dấu hiệu dữ liệu đi kèm (như cụm timestamp xử lý theo lô ở `A07`/`A08`, hoặc tập trung `reason_code` theo `cert_type` ở `A04`).
4. **Tiêu chí (d) – Chống chọn ngưỡng hậu nghiệm:** Các ngưỡng đánh giá và tham số `GA3, GA4` phải được khóa cố định cùng `random_seed` trước khi chạy mô phỏng.
5. **Tiêu chí (e) – Khử nhiễu lịch làm việc:** Luôn báo cáo song song *giờ lịch (calendar time)* và *giờ làm việc (business hours theo `GA1`)*; không kết luận một chuyển tiếp là nghẽn nếu thời gian chờ dài chỉ do rơi vào ban đêm hoặc cuối tuần.

---
Limitations:
- D3 được chấp nhận về mặt kiến trúc và nội dung phản biện C1 (của claude trên D3) đã được khắc phục hoàn toàn trong văn bản mục 1–2 (timer G3 nổ đúng hạn GA3, A05 đến sau hạn GA3 bị chặn và đưa vào A13 ở kỳ rà sổ GA8; thêm thuộc tính decision và quy tắc bước liền trước cho G2/R2). Tuy nhiên theo quy tắc ledger, chỉ tác giả phản biện (claude) mới có quyền phát hành resolution đóng C1 của D3 ở lượt tiếp theo.
- Toàn bộ giả định GA1–GA13, cấu trúc 4 lane L1–L4 và danh mục lý do bổ sung/từ chối là giả định học thuật; nhóm cần xác minh khi khảo sát thực tế tại trường và chốt bộ tham số số học (ngưỡng SLA GA4, phân phối xác suất, seed) ở Vòng 2 trước khi chạy mô phỏng.
- Tuân thủ nghiêm ngặt chế độ chỉ đọc (read-only) và chính sách công cụ: không chỉnh sửa file, không gọi công cụ shell/command, chỉ tổng hợp dựa trên dữ liệu hợp lệ.