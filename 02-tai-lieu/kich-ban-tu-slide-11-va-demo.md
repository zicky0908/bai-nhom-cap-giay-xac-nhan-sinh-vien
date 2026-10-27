# Kịch bản tập: slide 11 → hết demo

Dùng để tập phần cuối bài: slide 11–16 (khoảng 7 phút) rồi demo 10 phút. **[Bấm]** = bấm phím → một lần. Lời nói là gợi ý, giữ ý chính và con số, không cần thuộc.

## Chuẩn bị (10 phút trước)

Trong thư mục `05-prototype/`:

1. `docker compose up -d`
2. `python3 scripts/smoke-e2e.py` → phải in `PASS E2E`
3. `sh scripts/reset-demo.sh` → xóa hồ sơ tập và hộp thư (dữ liệu mô phỏng giữ nguyên)

Mở sẵn:

- Slide: `06-slide/trinh-chieu/index.html`, bấm **F** toàn màn hình. Gõ thẳng tới slide 11: bấm **O** rồi chọn slide 11.
- Trình duyệt, 5 tab theo thứ tự: Sinh viên `localhost:8000` · n8n `localhost:5678` (đã đăng nhập, mở sẵn workflow) · Cán bộ `localhost:8000/staff` · Mailpit `localhost:8025` · Analytics `localhost:8000/analytics`.

Trang Cán bộ và tab Executions của n8n không tự cập nhật: **nộp xong hồ sơ thì F5 rồi mới mở.**

---

## Phần 1 · Slide 11–16

### Slide 11 · Sau cải tiến: hệ thống lo phần giấy tờ (1:15)

> Sơ đồ này vẽ cùng kiểu với quy trình hiện tại để dễ so. Hàng giữa màu xanh là hệ thống, gồm trang web và n8n.

1. **[Bấm]** Sinh viên nộp form web.
2. **[Bấm]** Hệ thống kiểm tra form, cấp mã hồ sơ, gửi email.
3. **[Bấm]** Cán bộ kiểm tra tư cách.
4. **[Bấm]** Hệ thống sinh giấy từ mẫu.
5. **[Bấm]** Lãnh đạo ký, giờ chỉ còn hai khung 10 giờ 30 và 16 giờ mỗi ngày. *(ô cam, nhấn giọng)*
6. **[Bấm]** Hệ thống gửi email kết quả, báo văn thư.
7. **[Bấm]** Sinh viên nhận giấy.

> Mọi ô xanh đậm không cần người làm. Con người chỉ còn hai việc cần phán đoán: cán bộ xem tư cách, lãnh đạo ký.

### Slide 12 · Prototype: mỗi phần làm đúng một việc (1:00)

> Nhóm dựng prototype cho phần tự động hóa, đi theo số thứ tự.

- **[Bấm]** ① Người dùng thao tác trên web. ② Web là bên duy nhất ghi trạng thái và nhật ký vào cơ sở dữ liệu.
- **[Bấm]** ③ Có sự kiện thì web gọi sang n8n qua webhook.
- **[Bấm]** ④ n8n gửi email qua Mailpit, một hộp thư thử chạy trên máy, không gửi ra Internet.
- **[Bấm]** ⑤ Gửi xong, n8n báo lại cho web.

> Web chỉ hiện "Đã thông báo" khi nhận được bước 5. Nếu n8n lỗi, hồ sơ giữ trạng thái chờ, không báo thành công giả. Giảng viên đã đồng ý cho nhóm dùng n8n thay Power Automate.

### Slide 13 · Workflow n8n: đủ 5 thành phần đề yêu cầu (1:00)

> Đọc từ ô Trigger ở góc trái dưới: n8n nhận webhook từ web.

- **[Bấm]** Đọc hồ sơ qua API, đây là data source.
- **[Bấm]** Điều kiện thứ nhất: sự kiện này có cần tiền kiểm không.
- **[Bấm]** Có thì hỏi tiếp: sinh viên còn hiệu lực và đủ thông tin không.
- **[Bấm]** Ghi kết quả "đạt" hoặc "cần bổ sung" về web.
- **[Bấm]** Gửi email. Nhánh "Không", ví dụ giấy đã cấp, đi thẳng tới đây.
- **[Bấm]** Báo lại web và trả phản hồi cho webhook.
- **[Bấm]** "1 trigger, 1 data source, 2 điều kiện, 4 action, 1 notification: đủ yêu cầu tối thiểu của đề."

### Slide 14 · Một hồ sơ chạy thật (0:30)

> Ba ảnh này chụp từ lần chạy thử ngày 24/10: sinh viên nộp form, cán bộ xử lý, email trong Mailpit. Lát nữa phần demo sẽ chạy trực tiếp đúng ba bước này.

### Slide 15 · Phải đổi lịch ký, chờ ký mới giảm (1:15)

- **[Bấm]** biểu đồ trên: "Thời gian phía trường giảm ở cả hai kịch bản: từ 1.363 phút xuống 944 với S0, và 788 với S1."
- **[Bấm]** biểu đồ dưới, chỉ vào thanh cam: "Nhưng thời gian chờ ký thì S0, chỉ có phần mềm, không giảm mà còn tăng nhẹ, 551 lên 584 phút. Các bước trước xong nhanh hơn nên hồ sơ đến bàn lãnh đạo sớm hơn rồi nằm chờ phiên ký lâu hơn. Chỉ S1, có đổi lịch ký, mới giảm xuống 121 phút."
- **[Bấm]** thẻ phải: "So từng cặp qua 20 lần chạy, S1 tốt hơn hiện tại cả 20 lần. Phần mềm vẫn có ích: thao tác cán bộ giảm từ 43 xuống 21 phút mỗi hồ sơ, hồ sơ quá hạn được phát hiện ngay."

> Kết luận: muốn giảm điểm nghẽn phải đổi cách tổ chức, không chỉ mua phần mềm. Đây là kết quả mô phỏng, chưa được nói là hiệu quả thật tại trường.

### Slide 16 · Kết luận (0:45)

> Kết quả của nhóm mới minh họa được phương pháp. Tham số là giả định, prototype chưa có nhắc hạn và đóng hồ sơ tự động.

- **[Bấm]** ba thẻ: "Để kiểm chứng, trường có thể làm ba bước: thu nhật ký thật của một học kỳ; chạy lại Process Mining để xác nhận hay bác giả thuyết chờ ký; thí điểm lịch ký hai khung giờ và form web cho một loại giấy."
- **[Bấm]** nút cam: "Sau đây nhóm xin demo trực tiếp prototype trong 10 phút."

Bấm **Esc** thoát toàn màn hình, chuyển sang trình duyệt.

---

## Phần 2 · Demo 10 phút

| Phút | Tab | Bấm gì | Nói gì |
|---|---|---|---|
| 0:00–0:45 | (slide 12 hoặc nói miệng) | | "Prototype gồm 4 phần chạy trên máy: web, n8n, cơ sở dữ liệu, hộp thư thử Mailpit." |
| 0:45–2:00 | Sinh viên | Điền form hợp lệ → **Nộp** | "Sinh viên nhận ngay mã hồ sơ `GXN-…`. Vài giây sau trạng thái thành *Đã tiền kiểm*: n8n vừa kiểm tra tự động." |
| 2:00–3:30 | n8n | F5 → workflow → tab **Executions** → bấm lần chạy trên cùng | "Đây là lần chạy vừa rồi. Dữ liệu đi qua từng ô: nhận webhook, đọc hồ sơ, hai điều kiện, ghi kết quả đạt, gửi email, báo lại web." Bấm vào ô *Đủ điều kiện…* để chỉ `student.active: true`. |
| 3:30–5:00 | Cán bộ | F5 → **Mở hồ sơ** → **Nhận xử lý** → **Duyệt** → **Xác nhận đã cấp** | "Trạng thái phải đi đúng thứ tự, bấm sai thứ tự sẽ bị chặn. Nút Duyệt đại diện cho quyết định và chữ ký của lãnh đạo; chữ ký thật vẫn ký tay trên giấy." |
| 5:00–5:40 | Mailpit | Mở email trên cùng | "Email đúng mã hồ sơ, đây là bằng chứng đã báo." Quay lại tab Cán bộ, F5: cột thông báo hiện *Đã thông báo*. |
| 5:40–7:00 | Sinh viên → n8n → Cán bộ | Nộp hồ sơ mới với mã SV **25MSB99999** → xem Executions → F5 trang Cán bộ | "Đây là sinh viên đã thôi học. n8n rẽ sang nhánh false, ghi *cần bổ sung* và gửi email báo. Workflow vẫn ghi Succeeded vì n8n chạy trọn vẹn; hồ sơ không đạt là kết quả nghiệp vụ, không phải lỗi hệ thống." |
| 7:00–8:50 | Analytics | Xem mục *Dùng trang Analytics* bên dưới | |
| 8:50–10:00 | (nói) | | "Tóm lại: phần mềm lo phần giấy tờ và lưu vết, còn muốn giảm chờ ký thì phải đổi lịch ký. Mọi số liệu là mô phỏng." |

Lúc mở chi tiết hồ sơ ở trang Cán bộ, nếu bị hỏi vì sao mỗi bước có hai dòng: "Mỗi bước ghi hai mốc, bắt đầu và xong, để Process Mining tách được thời gian xử lý và thời gian chờ."

### Dùng trang Analytics (7:00–8:50)

Trang này đọc event log trong cơ sở dữ liệu và phân tích bằng PM4Py. Dữ liệu ở đây là **bộ demo 120 hồ sơ sinh ngẫu nhiên đơn giản** (`05-prototype/app/seed.py`): mỗi bước chờ ngẫu nhiên 12–48 giờ ở AS-IS và 2–16 giờ ở TO-BE, tỷ lệ bổ sung đặt sẵn 35% và 20%. Nó **không** mô phỏng lịch ký và khác hẳn bộ 20 lần × 400 hồ sơ trên slide. Vì vậy dùng trang này để cho thấy **chức năng phân tích chạy được trên event log của hệ thống**, không trích số ở đây làm kết luận.

1. Ô **Nguồn dữ liệu** chọn *Mô phỏng*, ô **Kịch bản** chọn *AS-IS* → **Áp dụng**.
   > "Đây là quy trình hiện tại: 120 hồ sơ, 9 đường đi khác nhau, 36,7% phải bổ sung, 27 hồ sơ còn tồn lúc chụp."
2. Chỉ vào **Bản đồ quy trình**: "PM4Py tự dựng sơ đồ này từ event log; số trên mũi tên là số lần hồ sơ đi qua."
3. Kéo xuống **Đường đi của hồ sơ**: "Đường đi thẳng có 54 hồ sơ; đường thứ hai có vòng bổ sung, 37 hồ sơ."
4. Đổi **Kịch bản** sang *TO-BE* → **Áp dụng**.
   > "Cùng một trang, đổi kịch bản là các chỉ số tính lại từ event log: còn 5 đường đi, tỷ lệ bổ sung 16,7%, tồn 15 hồ sơ. Bộ này chỉ để minh họa chức năng; kết quả phân tích chính thức là slide 8 và 15."
5. Bảng **Thời gian chờ và xử lý**: chỉ cần nói "trang tách riêng thời gian chờ và thời gian xử lý của từng công đoạn, tính bằng giây theo đồng hồ thật". Không đọc từng số.
6. Bấm **Xuất event log CSV**: "Ai cũng tải được event log để tự phân tích lại; mỗi dòng là một sự kiện có mã hồ sơ, hoạt động, mốc bắt đầu hoặc xong, thời gian."
7. (Tùy chọn) Đổi **Nguồn dữ liệu** sang *Demo trực tiếp* → **Áp dụng**: thấy đúng 2 hồ sơ vừa demo.

Tránh sa vào: cột **Đánh giá** chỉ là nhãn chung, chưa so ngưỡng thật; danh sách **Tồn đọng theo bước** rất dài và tính tới mốc chụp dữ liệu, không cần đọc.

### Nếu trục trặc

- Hồ sơ đứng ở *Đang chờ tự động hóa* quá 30 giây: mở n8n → Executions xem lỗi, và nói đây chính là cơ chế không báo thành công giả.
- Máy hoặc mạng hỏng: quay lại slide 14, trình bày bằng ba ảnh chụp.

Tập xong: `sh scripts/reset-demo.sh` để xóa hồ sơ vừa tạo.
