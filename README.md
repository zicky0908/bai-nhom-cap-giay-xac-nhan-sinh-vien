# Bài nhóm: Phân tích và tự động hóa quy trình cấp giấy xác nhận sinh viên

Bài thu hoạch nhóm (4 học viên) môn BPM & AI: phân tích quy trình cấp giấy xác nhận sinh viên tại một trường cao đẳng Y Dược (bối cảnh giả định), Process Mining trên dữ liệu mô phỏng, thiết kế quy trình cải tiến và prototype tự động hóa bằng n8n. Trình bày 20 phút + demo 10 phút.

> Mọi số liệu Process Mining là **dữ liệu mô phỏng**, không phải số đo tại trường.

## Cấu trúc thư mục

| Thư mục | Nội dung | Mở đầu từ |
|---|---|---|
| `01-de-bai/` | Đề bài của giảng viên, yêu cầu chi tiết của nhóm, tài liệu môn học | `de-bai-giang-vien.txt` |
| `02-tai-lieu/` | Báo cáo phân tích đầy đủ; tổng hợp kiến thức; kế hoạch tạo slide (Word + Markdown) | `tong-hop-kien-thuc.docx` |
| `03-so-do-quy-trinh/` | Sơ đồ BPMN AS-IS / TO-BE: file chỉnh sửa (`.bpmn`) và ảnh (`.png`) | `as-is.bpmn` (mở bằng demo.bpmn.io) |
| `04-process-mining/` | Bộ mô phỏng 20 seed, phân tích PM4Py, kết quả, event log CSV, test | `out/results.md` |
| `05-prototype/` | Web (FastAPI) + PostgreSQL + n8n + Mailpit chạy bằng Docker; kịch bản demo | `docs/chuan-bi-truoc-demo.md` |
| `06-slide/` | 3 bản slide (Claude, Codex, Antigravity), 13 hình dùng cho slide, mã nguồn dựng slide | `Slide-Claude.pptx` |
| `07-nhat-ky-ai/` | Nhật ký 6 lượt hợp tác giữa Claude, Codex và Antigravity | `README.md` |

## Chạy nhanh prototype

```bash
cd 05-prototype
cp .env.example .env              # lần đầu; đổi các giá trị change-me
docker compose up -d              # web :8000, n8n :5678, Mailpit :8025
sh scripts/seed-demo.sh 43044 120 # lần đầu: nạp dữ liệu mô phỏng cho trang Analytics
python3 scripts/smoke-e2e.py      # kiểm tra toàn luồng, phải in PASS E2E
sh scripts/reset-demo.sh          # dọn hồ sơ demo và hộp thư thử nghiệm
```

| Trang | Địa chỉ |
|---|---|
| Sinh viên | http://localhost:8000 |
| Cán bộ | http://localhost:8000/staff |
| Phân tích quy trình | http://localhost:8000/analytics |
| n8n (tạo tài khoản owner lần đầu) | http://localhost:5678 |
| Hộp thư thử nghiệm Mailpit | http://localhost:8025 |

## Chạy lại phân tích

```bash
cd 04-process-mining
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m unittest test_handcalc test_sim
.venv/bin/python analyze.py       # khoảng 5 phút, ghi vào out/
```

## Ghi chú

- Giảng viên đã đồng ý thay Power Automate bằng n8n tự host.
- `.venv/`, `node_modules/`, file `.env` và file trung gian không đưa vào git (xem `.gitignore`); cài lại theo hướng dẫn trong từng thư mục.
- Phân tích được thực hiện cùng các AI qua orchestrator ở repo `ai-collaboration-lab`; chi tiết ở `07-nhat-ky-ai/`.
