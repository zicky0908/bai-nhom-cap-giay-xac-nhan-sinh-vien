## Phản biện Pass 1 – Kiểm chứng mô phỏng (workcal.py, simulate.py, test_handcalc.py)

> **Lưu ý:** Toàn bộ số liệu và log kiểm tra dưới đây là **Dữ liệu mô phỏng**, phụ thuộc giả định học thuật, không phải số đo thực tế tại trường.

### 1. Xác minh phát hiện của Propose (D1)
- **D1 (Đã xác minh – ĐỒNG Ý, mức Nghiêm trọng cao):** Tại `analysis/simulate.py:168-170`, hàm `expire_tobe` ghi `A13 start` và `A13 complete` có cùng thời điểm `t = due`. Tại `analysis/simulate.py:261`, khóa sắp xếp `key=lambda e: (e['t'], e['lifecycle'] == 'start')` cho giá trị `False` (0) với `complete` và `True` (1) với `start`, nên khi cùng `t` thì `A13 complete` bị xếp đứng trước `A13 start`. Tiếp đó dòng `265-266` cộng thêm 1 giây cho sự kiện đứng sau (`A13 start`).
  - **Hậu quả:** Trên cả 6 cấu hình TO-BE, mọi hồ sơ kết thúc theo nhánh `E3` đều có `seq(complete) < seq(start)` và `timestamp(complete) < timestamp(start)` (vi phạm trực tiếp R5: mỗi `start` phải có `complete >= start`, đồng thời làm `s(A13) = due_at + 1 giây`). Khi `analysis/analyze.py:25-33` chạy `instances(case)`, sự kiện `A13 complete` xuất hiện trước khi `open_['A13']` được mở nên bị ghép mặc định `s = c = due`, còn `A13 start` bị bỏ sót lại trong `open_`.
  - **Cách sửa:** Tại `analysis/simulate.py:261`, đổi thành `key=lambda e: e['t']` (vì Timsort của Python giữ nguyên thứ tự chèn nhân quả trong `self.events`, nơi `officer_done`, `to_l3`, `to_clerk`, `expire_tobe` đều đã ghi `complete` của bước trước trước khi ghi `start` của bước sau), hoặc lưu thêm thứ tự chèn `eid` trong `self.log()` và sắp theo `(e['t'], e['eid'])`.

### 2. Đối chiếu tổng thể tham số mục 4.4 và lịch làm việc GA1

| Hạng mục (Mục 4.4 / GA) | Mã nguồn đối chiếu | Kết quả | Nhận xét |
|---|---|---|---|
| Lịch GA1, `align`, `add_work`, `work_between`, `due_after` | `analysis/workcal.py:11-70` | Khớp | T2–T6, 07:30–11:30 và 13:30–17:00 (450 phút/ngày); `due_after(t, 7)` trả về 17:00 ngày làm việc thứ 7 sau ngày chứa `t` khớp mục 4.6. |
| Quy mô N, kỳ đến, kỳ xả hàng, lưới seed | `analysis/simulate.py:17-20,36-40` | Khớp | `N_CASES = 400`, `ARRIVAL_DAYS = 60` (12 tuần), `HORIZON = 138 * DAY` (tới hết 17/07/2026), 7 cấu hình x 20 seed (`20260302..20260321`). |
| Phân phối loại giấy, tỷ lệ nhánh G1/G2, phản hồi SV | `analysis/simulate.py:23-30,48-58` | Khớp | `doc_type` 40/20/25/15%; không đủ tư cách 5%; `A07` từ `A06` duyệt 97%/từ chối 3%; `A07` từ `A03` từ chối 80%/trả lại 20%; không phản hồi 8%; lognormal trung vị 900 và 675, sigma 0,8. |
| Thời gian xử lý và xác suất bổ sung `p` theo vòng | `analysis/simulate.py:33-39,88-92,133` | Khớp | Lognormal sigma 0,5 cắt trong `[0.5*m, 4*m]`; `p` vòng 1 / vòng sau đúng bảng 4.4 (`0.30/0.15`, `0.15/0.08`, `0.22/0.11`). |
| Hàng đợi L2 1 cán bộ FIFO và quy ước GA10 cho A01 | `analysis/simulate.py:95-113,123-125` | Khớp | `self.queue` dùng `(t, self.n, ...)` bảo đảm FIFO theo `arrival_true`; AS-IS ghi log `A01` lúc 07:30 (`day_open`) nhưng đưa vào hàng đợi `A02` tại `t` thực (`arrival_true`). |
| Rà quá hạn thứ Sáu (AS-IS) và nhắc hạn A16 (TO-BE) | `analysis/simulate.py:151-161` | Khớp | AS-IS dùng `next_at(due, 900, weekdays=(4,))` (thứ Sáu 15:00 >= `due`); TO-BE đặt `remind = due_after(t, 5)` (trước hạn 2 ngày làm việc) và chỉ sinh tối đa 1 `A16` mỗi vòng. |

### 3. Bổ sung các phát hiện còn thiếu trong Pass 1

- **Phát hiện 2 (Mức Trung bình – Cao): Chuyển giao L3 sang L4 (`to_clerk`) ở TO-BE không xử lý ngay trong ngày nếu ký ca 16:00, và L3 (`to_l3`, `reject`) cộng phút lịch thay vì phút làm việc GA1.**
  - **Bằng chứng:**
    1. Tại `analysis/simulate.py:210-214`, `to_clerk` tính `start = max(next_at(t, 900 if self.tobe else 990), self.clerk_free)`. Mục 4.4 quy định chuyển L3 sang L4 ở AS-IS là lô 16:30 (`990`), còn TO-BE là «Báo ngay; L4 xử lý 15:00» (mục 5: «Chuyển A07 sang A08 (H4) -> báo L4 ngay»). Do code gộp thành một mốc cứng `next_at(t, 900)` (15:00), mọi hồ sơ TO-BE S1 được ký ở khung 16:00 (`t >= 960`) đều phải đợi tới **15:00 chiều ngày làm việc hôm sau** mới bắt đầu đóng dấu `A08`.
    2. Tại `analysis/simulate.py:179-181` (`to_l3`) và `205-208` (`reject`), thời gian xử lý `A07` và `A10` được cộng thẳng bằng phút lịch (`start + self.dur(...)`, `t + a10`) thay vì `add_work`, không gọi `align(start)` khi `self.l3_free` lấn giờ, và bước `A10` không cập nhật `self.l3_free = t + a10`.
  - **Hậu quả:** Giải thích vì sao trong `analysis/out/results.md`, trung vị chờ `A07 -> A08` ở TO-BE S1 (`162,58` phút làm việc) lại cao hơn cả AS-IS (`136,96` phút) và trở thành cạnh chờ số 1 của trường (tô vàng) ở TO-BE S1. Ngoài ra, nếu lô ký lớn hoặc có `A10`, L3 có thể ghi sự kiện chồng chéo hoặc lấn qua 11:30 / 17:00.
  - **Cách sửa:** Dùng `align` và `add_work` cho `A07`, `A10` và cập nhật `self.l3_free` ở `A10`. Với `to_clerk` ở TO-BE, nếu giữ thiết kế L4 đóng dấu theo khung 15:00 mỗi ngày thì cần thuyết minh rõ trong báo cáo rằng các ca ký khung 16:00 sẽ chờ sang 15:00 hôm sau; nếu theo mục 5 «báo L4 ngay» thì bỏ `next_at(t, 900)` ở TO-BE để L4 xử lý ngay khi rảnh trong giờ làm việc (`max(t, self.clerk_free)`).

- **Phát hiện 3 (Mức Trung bình): Chặn cứng `MAX_ROUNDS = 12` và khác biệt nhỏ trong cách mô tả luồng RNG của CRN so với mục 4.4.**
  - **Bằng chứng:**
    1. `analysis/simulate.py:31,55-57,134` tiền cấp phát mảng ngẫu nhiên theo `MAX_ROUNDS = 12` và chặn `if r < MAX_ROUNDS`, trong khi mục 1 (GA7) và mục 4.4 ghi «không giới hạn số vòng bổ sung».
    2. Mục 4.4 mô tả rút thời điểm đến từ cùng luồng `default_rng([seed, i])` của từng hồ sơ, nhưng `analysis/simulate.py:64-67` rút 400 thời điểm đến từ `default_rng([seed, 10**9])` rồi sắp tăng dần.
  - **Hậu quả:** Với `p = 0,30/0,15`, xác suất một hồ sơ vượt 12 vòng là `0,30 * 0,15^11` (xấp xỉ `2,6e-10`), nên trên 400 ca x 20 seed thực tế không xảy ra cắt vòng. Việc tách RNG của `arrivals(seed)` thực chất giúp tạo đúng quá trình Poisson có điều kiện đã sắp thứ tự thời gian mà không làm xáo trộn ghép cặp `pair_id`, đồng thời vẫn giữ nguyên CRN tuyệt đối giữa 7 cấu hình.
  - **Cách sửa:** Ghi chú rõ giới hạn kỹ thuật `MAX_ROUNDS = 12` (hoặc rút lười theo vòng khi `r >= 12`) và giữ nguyên thiết kế `arrivals(seed)` hiện tại.

- **Phát hiện 4 (Mức Thấp): Khác biệt nhỏ về chuỗi khóa `event_id`, tỷ lệ cắt phải `P_CENSOR_PICKUP` và phạm vi kiểm thử R1–R8 / `test_handcalc.py`.**
  - **Bằng chứng:**
    1. `analysis/simulate.py:270` tạo `uuid5` từ `cfg_name|seed|pair_id|seq|activity|lifecycle` (thiếu trường `scenario` so với công thức chữ ở mục 4.1, nhưng `cfg_name` đã phân biệt duy nhất kịch bản nên không bao giờ trùng).
    2. `analysis/simulate.py:30,228` đặt `P_CENSOR_PICKUP = 0.05` (5% hồ sơ đã có `A11` không sinh `A12` để minh họa hồ sơ «đã cấp, chưa nhận» theo GA12 và mục 4.2), dù con số 5% chưa liệt kê trong bảng 4.4.
    3. `analysis/test_handcalc.py:11-39` đã kiểm chứng khớp hoàn toàn 4 ca tính tay AS-IS (`C001–C004`), nhưng chưa thêm assert cho 2 ca TO-BE (`TB-C002` với `T_truong = 1262`, `T_SV = 1519`, chờ `A17->A07 = 55`; và `TB-C004` với `T_truong = 3600`, `detect_delay = 0`, `net = 95`) ở mục 4.6.
    4. Kiểm tra R1–R8 trên logic sinh log: R1, R2, R3, R3', R6, R7, R8 đều đạt; R4 đạt ở AS-IS; riêng **R5 bị vi phạm ở TO-BE (và kéo theo `s(A13)` lệch 1 giây ở R4') do lỗi D1**.

---
Limitations:
- Chế độ rà soát chỉ đọc (read-only) theo chính sách không gọi công cụ thực thi lệnh: toàn bộ kiểm chứng dựa trên đọc mã nguồn và đối chiếu kết quả đã xuất trong analysis/out/.
- Mọi số liệu trong báo cáo và kết quả chạy đều là dữ liệu mô phỏng phục thuộc giả định (đặc biệt lịch ký S1 và xác suất bổ sung p), không phải hiệu quả thực tế tại trường.
- Lượt này thực hiện vai trò phản biện cho Pass 1; phần rà soát chi tiết Pass 2 (công thức KPI trong analyze.py, tô màu DFG và thông điệp slide 7, 8, 12) sẽ được thực hiện ở Pass 2 theo phân công.