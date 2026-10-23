# Prototype cấp giấy xác nhận sinh viên

Prototype học thuật chạy local gồm bốn dịch vụ: giao diện/API FastAPI, PostgreSQL, n8n Community Edition và hộp thư thử nghiệm Mailpit. n8n thực sự nhận webhook, đọc hồ sơ từ API, phân nhánh tiền kiểm, gọi chuyển trạng thái, gửi SMTP và callback về ứng dụng. Mail không được gửi ra Internet.

## Yêu cầu

- Docker Engine và Docker Compose đang chạy trong WSL2.
- Các cổng `8000`, `5678`, `8025` và `1025` chưa bị ứng dụng khác sử dụng.
- Chạy lệnh từ thư mục dự án này.

## Khởi động lần đầu

1. Tạo cấu hình local và thay toàn bộ giá trị `change-me` bằng chuỗi ngẫu nhiên riêng:

   ```bash
   cp .env.example .env
   ```

2. Khởi động cơ sở dữ liệu, Mailpit và n8n; sau đó import credential local và workflow:

   ```bash
   sh scripts/setup-n8n.sh
   ```

3. Build và chạy ứng dụng:

   ```bash
   docker compose up -d --build app
   ```

4. Tạo dữ liệu mô phỏng AS-IS/TO-BE có seed cố định:

   ```bash
   sh scripts/seed-demo.sh 43044 120
   ```

5. Kiểm tra nhanh hạ tầng và toàn luồng:

   ```bash
   sh scripts/smoke-infra.sh
   python3 scripts/smoke-e2e.py
   ```

Smoke E2E chỉ báo đạt khi hồ sơ đi qua app → n8n → Mailpit → callback, `automation_status=SYNCED`, event log có `ISSUED` và `NOTIFY_SENT`, đồng thời Mailpit có thư thật. Nếu n8n hoặc callback lỗi, script dừng với mã lỗi thay vì coi giao diện là thành công.

## Địa chỉ truy cập

| Thành phần | URL | Mục đích |
|---|---|---|
| Cổng sinh viên | <http://localhost:8000/> | Nộp và theo dõi hồ sơ |
| Màn hình cán bộ | <http://localhost:8000/staff> | Kiểm tra, duyệt, từ chối, cấp giấy |
| Phân tích | <http://localhost:8000/analytics> | Process mining và AS-IS/TO-BE |
| n8n Editor | <http://localhost:5678/> | Trình diễn workflow |
| Mailpit | <http://localhost:8025/> | Bằng chứng email local |

Ứng dụng prototype không có tài khoản đăng nhập. Lần đầu mở n8n Editor, n8n có thể yêu cầu tạo **owner local**; đây chỉ là tài khoản trên máy, không cần dịch vụ trả phí. Workflow webhook đã được script import/publish. Nếu workflow chưa hiện sau khi tạo owner, chạy lại `sh scripts/setup-n8n.sh` rồi tải lại trang.

## Dữ liệu và reset an toàn

- `sh scripts/seed-demo.sh <seed> <số-ca-mỗi-kịch-bản>` thay riêng dữ liệu `simulated` bằng bộ tái lập mới.
- `sh scripts/reset-demo.sh` gọi endpoint có `ADMIN_TOKEN` và chỉ xóa dữ liệu `demo`; không xóa dữ liệu mô phỏng.
- Export CSV tại `http://localhost:8000/api/analytics/events.csv?data_source=simulated&scenario=AS-IS`.

Không dùng `docker compose down -v` trong demo vì tùy chọn `-v` xóa dữ liệu. Dừng bình thường bằng:

```bash
docker compose stop
```

Khởi động lại bằng `docker compose up -d`; các named volume `pg_data`, `n8n_data`, `mailpit_data` giữ dữ liệu. Muốn dừng và bỏ container/network nhưng vẫn giữ volume:

```bash
docker compose down
```

## Workflow và ranh giới trách nhiệm

- App là thành phần duy nhất ghi trạng thái hồ sơ và event log, có kiểm tra actor, trạng thái, version và `Idempotency-Key`.
- n8n nhận `POST /webhook/certificate-process` với `case_id`, `operation` và `idempotency_key`.
- n8n đọc hồ sơ qua API nội bộ, chạy IF cho tư cách/độ đầy đủ, gọi transition `PRECHECK_PASS` hoặc `REQUEST_SUPPLEMENT`, gửi email SMTP tới Mailpit rồi callback `SYNCED`.
- Token nội bộ chỉ đến từ biến môi trường. Workflow JSON không chứa token thật.
- UI chỉ được coi đã thông báo khi callback thành công; khi n8n lỗi, hồ sơ vẫn `PENDING`/`FAILED`.

Workflow nguồn nằm tại `n8n/workflows/student-certificate.json`; credential Mailpit local nằm tại `n8n/credentials/mailpit.smtp.credentials.json`.

## Kiểm thử phát triển

```bash
python -m pip install -r requirements-dev.txt
python -m pytest -q tests
```

Các kiểm thử hạ tầng còn xác nhận image n8n/Mailpit và PM4Py được pin phiên bản, workflow có trigger/condition/actions/SMTP/callback, reset có phạm vi an toàn và script E2E kiểm chứng thông báo thật.

