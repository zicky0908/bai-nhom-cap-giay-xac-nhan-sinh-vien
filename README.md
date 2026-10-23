# Cấp giấy xác nhận sinh viên – bài nhóm BPM & AI

Phân tích và tự động hóa quy trình cấp giấy xác nhận sinh viên (bối cảnh giả định: trường cao đẳng Y Dược). Mọi số liệu Process Mining là **dữ liệu mô phỏng**.

| Thư mục | Nội dung |
|---|---|
| `docs/` | Báo cáo phân tích đầy đủ (`bao-cao-phan-tich.md`), đề bài nhóm (`project-brief.md`), nhật ký hợp tác AI (`ai-collab-run-1` … `run-6`) |
| `analysis/` | Mô phỏng 20 seed, KPI, PM4Py, biểu đồ, test tính tay (xem `analysis/README.md`) |
| `diagrams/` | BPMN 2.0 AS-IS/TO-BE chỉnh được (`*.bpmn`) và ảnh cho slide |
| `slides/` | File slide `Slide-cap-giay-xac-nhan-sinh-vien.pptx` và script dựng lại (`build_deck.js`) |
| `prototype/` | Web FastAPI + PostgreSQL + n8n + Mailpit (Docker Compose), kịch bản demo và checklist `prototype/docs/chuan-bi-truoc-demo.md` |

## Chạy nhanh

```bash
cd prototype && docker compose up -d          # web http://localhost:8000, n8n :5678, Mailpit :8025
python3 scripts/smoke-e2e.py && sh scripts/reset-demo.sh
```

Dựng lại slide: `cd slides && npm install && python3 -m venv .venv && .venv/bin/pip install python-pptx pymupdf playwright`, rồi `NODE_PATH=$PWD/node_modules PPTX_SKILL=<thư mục skill pptx> node build_deck.js`.

Phân tích được thực hiện cùng các AI (Claude, Codex, Antigravity) qua orchestrator ở repo `ai-collaboration-lab`.
