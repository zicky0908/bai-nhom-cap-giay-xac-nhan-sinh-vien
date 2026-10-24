# Kiểm thử qua giao diện web

Chạy kịch bản demo bằng trình duyệt tự động (Playwright) và chụp màn hình; prototype phải đang chạy.

| Script | Kiểm tra |
|---|---|
| `ui_e2e.py` | SV nộp form → n8n tiền kiểm → cán bộ nhận xử lý, duyệt, cấp giấy → email Mailpit, trạng thái SYNCED |
| `ui_supplement.py` | Cán bộ yêu cầu bổ sung → SV gửi lại → n8n tiền kiểm lại (`attempt_no = 2`) |
| `chup-man-hinh.py` | Chụp các trang chính |

```bash
python3 -m venv .venv && .venv/bin/pip install playwright==1.47.0 && .venv/bin/python -m playwright install chromium
mkdir -p shots && .venv/bin/python ui_e2e.py
sh ../reset-demo.sh        # dọn dữ liệu demo sau khi thử
```
