# Slide

| File | Ai làm | Ghi chú |
|---|---|---|
| `Slide-Claude.pptx` | Claude | 13 slide; đã soát số liệu 2 lần; có ghi chú người trình bày |
| `Slide-Codex.pptx` | Codex | 13 slide; tối giản; sơ đồ vẽ bằng hình khối, sửa được trong PowerPoint |
| `Slide-Antigravity.pptx` | Antigravity | 14 slide; nhiều bảng; còn chữ tràn ở slide 1, 2, 6, 8, 13 |

- `hinh-anh/`: 13 hình đánh số dùng cho slide (danh mục và slide dùng hình: `02-tai-lieu/ke-hoach-tao-slide`).
- `ma-nguon/claude/build_deck.js`: dựng lại bản Claude (`cd ma-nguon && npm install`, rồi trong `claude/`: `NODE_PATH=../node_modules PPTX_SKILL=<thư mục skill pptx> node build_deck.js`).
- `ma-nguon/ai-khac/{codex,antigravity}/`: đề bài, đầu vào và `build.js` của từng AI (`node build.js` ghi ra `output/slide.pptx`); `de-bai-giao-cho-ai.md` là đề bài chung.
- `ma-nguon/render.sh <file.pptx> <thư-mục-ảnh>`: render slide ra ảnh để soát (cần Docker).
