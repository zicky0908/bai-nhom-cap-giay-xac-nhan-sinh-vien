# Tổng hợp Rà soát Process Mining (Pass 1 & Pass 2)

> **Lưu ý quan trọng:** Mọi số liệu là **Dữ liệu mô phỏng**. Kết quả phụ thuộc vào giả định tham số (đặc biệt là lịch ký S1 và xác suất bổ sung hồ sơ p), không phải hiệu quả đã chứng minh tại trường.

## 1. Quyết định trên Ledger
- **D1 (Accepted – Mức cao):** `analysis/simulate.py:168–170,261–266` ghi A13 TO-BE có `complete` đứng trước `start` và lệch 1 giây, vi phạm R5.
- **D2 (Accepted – Mức cao):** `analysis/analyze.py:80–93` tính K5 theo tuổi gross thay vì tuổi net (chưa trừ thời gian SV tích lũy đến mốc thứ Sáu 17:00), lệch công thức mục 4.2.
- **D3 (Accepted – Mức trung bình):** `analysis/analyze.py:122–129` thống kê biến thể PM4Py trên chuỗi `complete` thô, chưa chuẩn hóa theo mục 4.2 (bỏ A15/A16, gộp A06+A17, gộp A07 reject+A10).

## 2. Danh sách phát hiện đã xác minh (xếp theo mức nghiêm trọng)

| Mức | File:dòng | Phát hiện & Hậu quả | Cách sửa |
|---|---|---|---|
| **Cao (D1)** | `analysis/simulate.py:168–170, 261–266` | `expire_tobe` ghi `start` và `complete` của A13 cùng thời điểm `due`. Khóa sắp xếp `(e['t'], e['lifecycle'] == 'start')` đặt `False` (`complete`) trước `True` (`start`), sau đó cộng +1 giây cho `start`. Hậu quả: `complete < start` (-1 giây), vi phạm R5; `instances()` ở `analyze.py:28–33` ghép cặp sai cho A13 TO-BE. | Giữ thứ tự chèn ổn định hoặc sửa khóa sắp xếp thành `e['lifecycle'] != 'start'` để `start` luôn đứng trước `complete` khi cùng thời điểm. |
| **Cao (D2)** | `analysis/analyze.py:80–93` | K5 (`K5_overdue_share_med`) tính `work_between(a01_rounded(a), f) > 2250` là tuổi gross, không trừ thời gian SV đã dùng từ `c(A04)` đến `min(f, c(A05), due_at)`. Hậu quả: phóng đại tỷ lệ quá hạn chính ở các ca đang chờ hoặc đã qua vòng bổ sung. | Tại mỗi mốc thứ Sáu `f`, trừ tổng phút làm việc phía SV trong các đoạn `[c(A04), min(f, c(A05), due_at)]` trước mốc `f` để lấy tuổi net; xuất riêng quá hạn gross. |
| **Trung bình (D3)** | `analysis/analyze.py:122–129` | `pm4py_views()` gọi `get_variants` trực tiếp trên các sự kiện `complete`, giữ nguyên A15, A16, A17 và A10 nên không đối chiếu trực tiếp được tỷ lệ biến thể giữa AS-IS và TO-BE theo mục 4.2. | Xuất thêm bảng biến thể đã chuẩn hóa: lọc bỏ A15/A16, ánh xạ chuỗi A06→A17 thành A06 và A07(reject)→A10 thành A07(reject). |
| **Trung bình** | `analysis/simulate.py:179–181, 205–208` | Bước L3 (A07, A10) cộng trực tiếp số phút xử lý vào thời gian lịch (`start + dur`) thay vì `add_work`, và A10 không cập nhật `self.l3_free`. Hậu quả: ca ký lúc 16:00 nếu kéo dài qua 17:00 sẽ tràn ra ngoài giờ GA1; A10 có thể chồng lên A07 của hồ sơ kế tiếp. | Dùng `add_work( align(start), dur )` cho A07, A10 và cập nhật `self.l3_free = end` cho cả A10. |
| **Trung bình** | `analysis/analyze.py:51–61` | Khi tính `t_sv_part`, mọi sự kiện `complete` của A04 đều lấy `dues[k]` kể cả khi hồ sơ chưa có A05 và chưa đến `due_at` (nếu ca còn mở hoặc đóng sớm). Trong cấu hình hiện tại `open_at_horizon = 0` nên không làm lệch số đã xuất, nhưng công thức chưa tổng quát nếu giảm horizon. | Chặn trên bằng `min(end_or_f, a05s[k], dues[k])`. |
| **Thấp** | `analysis/simulate.py:31, 64–67, 134, 270` | (1) `MAX_ROUNDS = 12` cắt trần số vòng bổ sung (trái GA7 không giới hạn, dù xác suất đạt vòng 12 cực nhỏ). (2) `arrivals(seed)` rút từ luồng riêng `[seed, 10^9]` thay vì từ `CaseDraws`, nhưng vẫn bảo toàn CRN giữa các cấu hình. (3) `uuid5` ở dòng 270 thiếu `scenario` so với mô tả mục 4.1 nhưng đã có `cfg_name` nên không trùng khóa. | Đồng bộ tài liệu mục 4.1/4.4 với mã nguồn hoặc đưa `scenario` vào chuỗi tạo UUID5. |
| **Thấp** | `analysis/analyze.py:144, 150, 267–298` | (1) Tiêu chí (b) tại dòng 144 tính tỷ lệ vượt 450 phút theo số lượt qua cạnh (`size`) thay vì theo số ca (`cases`), chỉ lệch nhẹ ở các cạnh có lặp. (2) Bảng `results.md` chưa in K7, K8 và bản TO-BE không làm tròn A01 (mục 4.4). | Tính tiêu chí (b) theo ca hoặc ghi chú rõ tính theo lượt chuyển tiếp; bổ sung chỉ số phụ nếu cần. |

## 3. Đánh giá việc loại cạnh khỏi «chờ của trường» (`analyze.py:21, 145–147`)
- **Loại `A04→A05` và `A11→A12`: Hợp lý.** Đây là thời gian sinh viên chuẩn bị hồ sơ bổ sung và đến nhận giấy (thuộc L1 / phía SV theo mục 3 và mục 4.2).
- **Loại cạnh đi vào `A16` (`A04→A16`): Hợp lý.** A16 là timer nhắc hạn tự động ở mốc `due_at - 2 ngày làm việc`, không phải bước chờ xử lý của trường.
- **Loại cạnh đi vào `A13` (`A04→A13` ở AS-IS, `A16→A13` ở TO-BE): Chỉ hợp lý một phần.** Trong khoảng từ `c(A04)` đến `s(A13)`, phần từ `c(A04)` đến `due_at` là cửa sổ 7 ngày làm việc chờ sinh viên (3.150 phút), nhưng phần từ `due_at` đến `s(A13)` là **trễ phát hiện quá hạn của trường** (mục 4.2). Việc loại toàn bộ cạnh `A04→A13` giúp tránh trộn 7 ngày của SV vào DFG chờ của trường, nhưng làm ẩn độ trễ phát hiện trên đồ thị DFG (trung vị 1.239 phút ở AS-IS, 4.312,66 phút tổng chờ trên cạnh `A04→A13`). Cách xử lý đúng: giữ loại khỏi xếp hạng top 3 chờ xử lý thường quy nhưng phải thuyết minh kèm chỉ số `detect_delay_med` (AS-IS: 1.239 phút; TO-BE: 0 phút).

## 4. Phạm vi kết luận hợp lệ từ `results.md`
- **ĐƯỢC PHÉP kết luận:**
  1. Trên bộ dữ liệu mô phỏng, bước chuyển tiếp `A06→A07` (chờ duyệt ký) ở AS-IS đạt đủ tiêu chí `(a)+(b)+(f)` để xác nhận là **ứng viên điểm nghẽn** (màu đỏ, trung vị chờ 620,18 phút, 63% lượt vượt 450 phút, xuất hiện ở 369/400 ca).
  2. Việc rút ngắn thời gian chờ ký (K3) và tổng thời gian phía trường (K1) trong mô phỏng chủ yếu đến từ **thay đổi lịch ký từ theo lô sang 2 khung giờ/ngày (S1)** chứ không chỉ nhờ tự động hóa phần mềm: cấu hình `TB-S0-p15` (tự động hóa nhưng giữ ký theo lô) có K3 trung vị 584 phút (kém hơn AS-IS 548 phút ở 20/20 seed), trong khi `TB-S1-p15` giảm K3 xuống 121 phút (tốt hơn AS-IS ở 20/20 seed).
  3. Phân tích độ nhạy cho thấy đuôi phân phối thời gian toàn trình (`K1_t_truong_p90`) phụ thuộc mạnh vào giả định giảm tỷ lệ bổ sung `p`: khi `p` tăng từ 0,15 lên 0,30 (giữ lịch ký S1), P90 của `T_trường` tăng từ 1.311 lên 2.584 phút.
  4. Cơ chế timer ở TO-BE đưa độ trễ phát hiện hồ sơ quá hạn bổ sung (`detect_delay_med`) từ trung vị 1.239 phút (AS-IS rà chiều thứ Sáu) về 0 phút theo thiết kế mô hình.
- **KHÔNG ĐƯỢC kết luận:**
  1. Không được kết luận hệ thống đã chứng minh hiệu quả thực tế tại trường hoặc khẳng định nguyên nhân gốc rễ tại trường (vì thiếu bằng chứng thực địa theo tiêu chí c).
  2. Không được kết luận form web tự động giúp giảm 50% tỷ lệ hồ sơ phải bổ sung hay giảm tỷ lệ đóng quá hạn E3 ngoài đời thực (vì `p` là tham số giả định đầu vào và bước nhắc hạn A16 được thiết kế không làm thay đổi hành vi sinh viên trong mô phỏng).
  3. Không được dùng chỉ số `K5_overdue_share_med` hiện tại làm tỷ lệ quá hạn ròng (net) cho đến khi sửa lỗi D2.

## 5. Thông điệp khuyến nghị cho Slide 7, 8 và 12
- **Slide 7 (Khai phá quy trình & Ứng viên nghẽn) — [Dữ liệu mô phỏng]:** Trong kịch bản hiện tại (AS-IS, seed 20260302, N = 400), hai biến thể phổ biến nhất chiếm 80,8% tổng số ca (62,3% đi thẳng và 18,5% qua 1 vòng bổ sung); bước chờ trình ký `A06→A07` là ứng viên điểm nghẽn duy nhất tô đỏ với trung vị chờ 620 phút làm việc (P90 = 1.198 phút, 63% lượt qua cạnh vượt ngưỡng 450 phút).
- **Slide 8 (Kiểm chứng công thức & Tách tác động lịch ký) — [Dữ liệu mô phỏng]:** Phép đo theo lịch làm việc GA1 khớp 100% với bộ tính tay mẫu (C001–C004) và tách rõ tác động tổ chức khỏi công nghệ: nếu chỉ tự động hóa nhưng giữ lịch ký theo đợt (`TB-S0-p15`), trung vị chờ ký K3 là 584 phút (không cải thiện so với 548 phút của AS-IS); chỉ khi kết hợp lịch ký 2 lần/ngày (`TB-S1-p15`), K3 mới giảm xuống 121 phút.
- **Slide 12a (Hiệu quả kỳ vọng & Độ nhạy tham số p) — [Dữ liệu mô phỏng]:** Qua 20 seed ghép cặp CRN, kịch bản `TB-S1-p15` giảm trung vị `T_trường` (K1) từ 1.363 xuống 788 phút và P90 của `T_trường_net` (K2) từ 1.780 xuống 804 phút (tốt hơn AS-IS ở 20/20 seed); tuy nhiên khi xác suất bổ sung `p` không giảm (`TB-S1-p30`), P90 của `T_trường` tăng từ 1.311 lên 2.584 phút, chứng tỏ kết quả toàn trình phụ thuộc mạnh vào hành vi nộp hồ sơ của sinh viên.
- **Slide 12b (Thao tác cán bộ & Phát hiện quá hạn) — [Dữ liệu mô phỏng]:** Tự động hóa bước tạo mã, sinh dự thảo và gửi thông báo giúp giảm thời gian xử lý trực tiếp của cán bộ L2 (K4) từ trung vị 203 phút/ca xuống 88–99 phút/ca ở cả 20/20 seed, đồng thời timer tự động đưa độ trễ phát hiện quá hạn bổ sung từ trung vị 1.239 phút (rà sổ chiều thứ Sáu) về 0 phút.

[decisions] [{"id": "D2", "status": "accepted", "reason": "Xác minh analyze.py:85 chỉ tính work_between(a01_rounded(a), f) là tuổi gross, chưa trừ thời gian SV tích lũy đến mốc f như công thức quá hạn chính ở mục 4.2.", "evidence": [{"source": "analysis/analyze.py:80–93; docs/bao-cao-phan-tich.md:149–153", "detail": "net_age chỉ gọi work_between(A01,f), không trừ thời gian SV; đặc tả yêu cầu tuổi net >2250."}]}, {"id": "D3", "status": "accepted", "reason": "Xác minh analyze.py:122–129 truyền trực tiếp chuỗi complete vào get_variants, chưa bỏ A15/A16 và chưa gộp A06+A17 hay A07(reject)+A10 theo mục 4.2.", "evidence": [{"source": "analysis/analyze.py:122–129; docs/bao-cao-phan-tich.md:156", "detail": "get_variants nhận chuỗi complete còn A15/A16/A17; chưa gộp nhánh reject."}]}]

---
Limitations:
- Rà soát tĩnh chỉ đọc mã nguồn và tệp kết quả có sẵn; không chạy lại bộ mô phỏng hay sửa tệp theo đúng quy định read-only.
- Các con số trích dẫn từ results.md cho Slide 7, 8, 12 phản ánh kết quả đã xuất hiện hành (trước khi sửa lỗi thứ tự start/complete của A13 ở D1 và lỗi công thức tuổi net K5 ở D2); riêng K1, K2, K3 ở các ca hoàn tất bình thường không bị ảnh hưởng bởi D1 và D2.