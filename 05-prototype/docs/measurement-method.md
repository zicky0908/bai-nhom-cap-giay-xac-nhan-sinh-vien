# Phương pháp đo Process Mining

## 1. Phạm vi và nguồn dữ liệu

Event log dùng cùng từ vựng hoạt động cho hồ sơ mô phỏng và hồ sơ demo. Mọi truy vấn phải chỉ rõ `data_source`:

- `simulated`: dữ liệu lịch sử được sinh bằng seed, dùng để so sánh AS-IS/TO-BE.
- `demo`: dữ liệu phát sinh khi trình diễn, hiển thị riêng và không trộn vào so sánh.

Mọi timestamp được lưu theo UTC và hiển thị theo `Asia/Ho_Chi_Minh`. Các bước tức thời ghi hai event `start` và `complete` cùng timestamp.

## 2. Công thức

Với cùng `(case_id, activity, attempt_no)`:

- Thời gian xử lý = `complete(activity) - start(activity)`.
- Thời gian chờ bước kế tiếp = `start(next_activity) - complete(previous_activity)`.
- Tuổi hồ sơ = `as_of - first(SUBMITTED.timestamp)`.
- Tuổi tại bước = `as_of - last_event.timestamp`, chỉ xét event có `timestamp <= as_of`.
- Hồ sơ mở = chưa có event `ISSUED/complete` hoặc `REJECTED/complete` tại `as_of`.
- Tỷ lệ bổ sung = số hồ sơ có ít nhất một `NEED_SUPPLEMENT` / tổng số hồ sơ.

`as_of` là `snapshot_ts` cấu hình cố định với dữ liệu mô phỏng và thời điểm hiện tại với dữ liệu demo. Thời gian chạy node n8n không được dùng làm thời gian nghiệp vụ.

## 3. Tiêu chí cảnh báo

Một bước được gắn nhãn **nguy cơ nghẽn** khi trung vị thời gian chờ vượt ngưỡng SLA cấu hình của bước đó. Hồ sơ được đánh dấu quá hạn khi tuổi tại bước vượt ngưỡng tương ứng.

Nhãn này không chứng minh nguyên nhân. Muốn kết luận nguyên nhân cần đối chiếu quy định, khối lượng hồ sơ và phỏng vấn cán bộ/sinh viên.

## 4. So sánh AS-IS và TO-BE

Hai kịch bản giữ cùng seed, số hồ sơ, thời điểm đến và phân phối loại yêu cầu. Chỉ thay các đòn bẩy đã công khai, ví dụ tiền kiểm tự động, hàng đợi điện tử và thông báo tự động. Kết quả là ước lượng trên dữ liệu mô phỏng, không phải hiệu quả đã được chứng minh tại trường.

## 5. Kiểm chứng tối thiểu

1. Fixture nhỏ được tính tay cho waiting, processing, age, stage_age và supplement rate.
2. Cùng seed và snapshot phải cho CSV giống nhau theo byte.
3. Thêm hoặc reset dữ liệu demo không làm thay đổi metric/CSV mô phỏng.
4. Event start/complete không bị ghép chéo giữa các lần bổ sung (`attempt_no`).
