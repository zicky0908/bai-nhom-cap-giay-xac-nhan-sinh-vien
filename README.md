# Bài nhóm: Phân tích và tự động hóa quy trình cấp giấy xác nhận sinh viên

Repo chứa **toàn bộ** bài thu hoạch nhóm (4 học viên) môn BPM & AI: đề bài, tài liệu, sơ đồ quy trình, Process Mining, prototype, slide và nhật ký làm việc với AI. Đọc hết file này trước khi sửa bất cứ thứ gì.

> **Dành cho AI đọc repo này:** mục [Quy tắc bắt buộc](#5-quy-tắc-bắt-buộc) là ràng buộc cứng. Nguồn sự thật cho mọi con số là `02-tai-lieu/tong-hop-kien-thuc.md` (mục 6 và 9) và `04-process-mining/out/results.md`. Đừng tự tính lại, làm tròn khác, hay bịa số liệu.

## 1. Bài này là gì

- **Đề tài:** quy trình sinh viên xin giấy xác nhận (đang học, hoãn nghĩa vụ quân sự, vay vốn, học bổng) tại một trường cao đẳng Y Dược. Bối cảnh là **giả định học thuật**, không có số liệu thật của trường.
- **Giảng viên yêu cầu** (`01-de-bai/de-bai-giang-vien.txt`, Phần II): 20 phút trình bày + 10 phút demo; nộp slide, sơ đồ, file dữ liệu, prototype; **không nộp Word**. Nội dung: Business Problem, AS-IS (BPMN/Swimlane), ít nhất 1 bottleneck (ở đâu, nguyên nhân, ảnh hưởng), Process Mining, TO-BE, prototype tự động hóa (1 trigger, 4 actions, 1 condition, 1 data source, 1 notification), đánh giá cải tiến.
- **Công cụ đã chọn:** n8n Community tự host thay cho Power Automate (giảng viên đã đồng ý); Python + PM4Py cho Process Mining; web FastAPI; Mailpit làm hộp thư thử nghiệm; tất cả chạy local bằng Docker.
- **Kết luận chính** (dữ liệu mô phỏng): điểm nghẽn là **chờ lãnh đạo ký** (trung vị 621 phút làm việc). Đổi lịch ký sang 2 lần/ngày giảm thời gian phía trường từ 1.363 xuống 788 phút; nếu chỉ tự động hóa mà vẫn ký theo lô thì chờ ký **không giảm**.

## 2. Cấu trúc thư mục

```
├── 01-de-bai/              Đề bài và tài liệu môn học (chỉ đọc)
├── 02-tai-lieu/            Tài liệu nội dung: đọc để hiểu bài, làm slide, trả lời câu hỏi
├── 03-so-do-quy-trinh/     Sơ đồ BPMN AS-IS / TO-BE
├── 04-process-mining/      Mô phỏng + phân tích (Python, PM4Py) và kết quả
├── 05-prototype/           Ứng dụng demo: web + n8n + Mailpit + PostgreSQL (Docker)
├── 06-slide/               Trình chiếu HTML (bản chính), bản cũ, hình, mã nguồn
└── 07-nhat-ky-ai/          Câu trả lời thật của các AI qua 6 lượt làm việc
```

| File / thư mục | Là gì | Khi nào dùng |
|---|---|---|
| `01-de-bai/de-bai-giang-vien.txt` | Đề bài của giảng viên (bài cá nhân + bài nhóm) | Kiểm tra bài có đáp ứng đủ yêu cầu |
| `01-de-bai/yeu-cau-cua-nhom.md` | Yêu cầu chi tiết nhóm tự đặt (công cụ, chức năng, cách đo, nghiệm thu) | Hiểu vì sao prototype làm như vậy |
| `01-de-bai/tai-lieu-mon-hoc/` | Slide bài giảng (PDF + bản chữ `.txt`) | Đối chiếu thuật ngữ, khung lý thuyết |
| **`02-tai-lieu/tong-hop-kien-thuc.docx`** | **Tóm tắt toàn bộ bài**: khái niệm, AS-IS, điểm nghẽn, kết quả, TO-BE, prototype, KPI, câu hỏi thường gặp | **Đọc đầu tiên.** Nguồn số liệu cho slide |
| **`02-tai-lieu/ke-hoach-tao-slide.docx`** | Kế hoạch 13 slide: nội dung, hình, người trình bày, thời lượng; checklist nộp | Khi làm hoặc sửa slide |
| `02-tai-lieu/bao-cao-phan-tich.md` | Báo cáo phân tích đầy đủ, chi tiết nhất (mục 1–10) | Khi cần chi tiết hoặc căn cứ |
| `02-tai-lieu/*.md` | Bản Markdown của 2 file Word ở trên | Sửa nội dung rồi tạo lại Word (mục 4.4) |
| `03-so-do-quy-trinh/as-is.bpmn`, `to-be.bpmn` | Sơ đồ BPMN 2.0 chỉnh sửa được | Mở và sửa bằng https://demo.bpmn.io |
| `03-so-do-quy-trinh/*.png` | Ảnh sơ đồ | Chèn slide |
| `04-process-mining/out/results.md` | Bảng KPI 20 seed, biến thể, cạnh chờ | Nguồn số liệu gốc |
| `04-process-mining/out/eventlog_seed20260302.csv` | Event log mô phỏng (AS-IS + TO-BE) | Nộp làm "file dữ liệu"; kiểm tra độc lập |
| `05-prototype/docs/chuan-bi-truoc-demo.md` | Checklist trước giờ demo | **Trước mỗi buổi tập / demo** |
| `05-prototype/docs/demo-script.md` | Kịch bản demo 10 phút | Tập demo |
| `05-prototype/docs/slide-outline.md`, `ai-collaboration-log.md` | Dàn ý và nhật ký **cũ** của phiên dựng prototype | Chỉ tham khảo; bản chuẩn là `02-tai-lieu/ke-hoach-tao-slide` |
| **`06-slide/trinh-chieu/index.html`** | **Bản trình chiếu chính**: 16 slide có hiệu ứng, mở bằng trình duyệt, không cần mạng; phím N xem ghi chú người nói | **Dùng để trình bày** (phím tắt, cách sửa: `README.md` cùng thư mục) |
| `06-slide/slide-html/` | Bản trước làm bằng mẫu Slides của Claude, chỉ xem qua link | Tham khảo |
| `06-slide/Slide-Claude.pptx` | Bản slide do Claude làm (13 slide, có ghi chú người nói) | Bản đề xuất làm khung |
| `06-slide/Slide-Codex.pptx`, `Slide-Antigravity.pptx` | Hai bản do Codex và Antigravity làm từ cùng dàn ý | So sánh, lấy ý |
| `06-slide/hinh-anh/01…13-*.png` | 13 hình đánh số dùng cho slide | Chèn slide (bảng hình ↔ slide trong kế hoạch) |
| `07-nhat-ky-ai/` | Đề bài giao cho AI và câu trả lời thật của từng lượt | Minh chứng hợp tác AI; tra lại lý do một quyết định |

## 3. Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| Phân tích (bài toán, AS-IS, điểm nghẽn, TO-BE, KPI) | Xong, đã được Codex và Antigravity rà |
| Sơ đồ BPMN | Xong, đã rà khớp đặc tả |
| Process Mining | Xong: 7 cấu hình × 20 seed × 400 hồ sơ; 12 test đạt |
| Prototype | Chạy được; 20 test đạt; smoke test toàn luồng đạt; đã thử qua giao diện ngày 24/10/2026 |
| Slide | Có 3 bản; **nhóm cần chọn 1 bản, sửa câu chữ theo giọng của mình, tập nói** |
| Còn thiếu | Timer nhắc hạn và tự đóng hồ sơ quá hạn chưa có trong prototype (đã ghi là giới hạn); chưa có dữ liệu thật của trường |

## 4. Cách làm các việc thường gặp

### 4.1 Hiểu bài để trình bày
Đọc `02-tai-lieu/tong-hop-kien-thuc.docx` (7 trang), đặc biệt mục 11 "Câu hỏi giảng viên có thể hỏi". Xem phần mình trình bày trong `02-tai-lieu/ke-hoach-tao-slide.docx`, mục 2.

### 4.2 Sửa slide
- **Bản chính là `06-slide/trinh-chieu/index.html`**: sửa thẳng trong file (mỗi slide một khối `<section>`, ghi chú người nói trong `<aside class="notes">`), mở lại bằng trình duyệt để xem. Cách đặt bước hiện, mũi tên, số đếm: `06-slide/trinh-chieu/README.md`. Các ý dưới áp dụng cho bản PowerPoint.
- Mở file trong `06-slide/` bằng PowerPoint và sửa trực tiếp. Sửa xong, commit file `.pptx`.
- Lấy hình trong `06-slide/hinh-anh/`; tên file có số thứ tự khớp bảng hình trong kế hoạch.
- Mọi con số lấy từ `02-tai-lieu/tong-hop-kien-thuc` mục 6 và 9; slide nào có số liệu Process Mining phải ghi "Dữ liệu mô phỏng".
- Mã nguồn trong `06-slide/ma-nguon/` chỉ để dựng lại bản gốc của từng AI. Bản Claude cần bộ công cụ pptx của Claude nên thành viên khác không cần chạy; cứ sửa trực tiếp trong PowerPoint.

### 4.3 Chạy prototype và demo
Cần: Docker (Docker Desktop trên Windows hoặc Docker trong WSL2), các cổng 8000, 5678, 8025, 1025 còn trống.

Lần đầu trên một máy mới:

```bash
cd 05-prototype
cp .env.example .env              # nên đổi các giá trị change-me
sh scripts/setup-n8n.sh           # khởi động PostgreSQL, Mailpit, n8n; import workflow + credential
docker compose up -d --build app  # build và chạy web
sh scripts/seed-demo.sh 43044 120 # nạp dữ liệu mô phỏng cho trang Analytics
```

Những lần sau và trước mỗi buổi demo:

```bash
cd 05-prototype
docker compose up -d              # khởi động 4 dịch vụ
python3 scripts/smoke-e2e.py      # phải in "PASS E2E"
sh scripts/reset-demo.sh          # xóa hồ sơ demo + email thử nghiệm, giữ dữ liệu mô phỏng
```

| Trang | Địa chỉ | Dùng để |
|---|---|---|
| Sinh viên | http://localhost:8000 | Nộp yêu cầu, tra cứu bằng mã hồ sơ |
| Cán bộ | http://localhost:8000/staff | Nhận xử lý, duyệt, từ chối, yêu cầu bổ sung, xác nhận đã cấp |
| Phân tích | http://localhost:8000/analytics | Process Mining trên dữ liệu mô phỏng của app, xuất CSV |
| n8n | http://localhost:5678 | Xem workflow và tab Executions. Lần đầu phải tạo tài khoản owner (chỉ lưu trên máy) |
| Mailpit | http://localhost:8025 | Xem email hệ thống gửi (không gửi ra Internet) |

n8n chạy ngầm: khi SV nộp hồ sơ hoặc cán bộ đổi trạng thái, web gọi webhook sang n8n; n8n kiểm tra điều kiện, ghi kết quả, gửi email qua Mailpit rồi báo về web. Dấu vết trên web: "Trạng thái tự động hóa" chuyển sang "Đã thông báo", và nhật ký hồ sơ có dòng do n8n thực hiện. Dừng bằng `docker compose stop`; **không dùng `docker compose down -v`** (xóa sạch dữ liệu). Chi tiết: `05-prototype/README.md`, `05-prototype/docs/chuan-bi-truoc-demo.md`.

### 4.4 Sửa tài liệu Word
Sửa file `.md` trong `02-tai-lieu/`, rồi tạo lại `.docx`:

```bash
cd 02-tai-lieu/cong-cu && npm install
node md2docx.js ../tong-hop-kien-thuc.md ../tong-hop-kien-thuc.docx
node md2docx.js ../ke-hoach-tao-slide.md ../ke-hoach-tao-slide.docx
```

Nếu sửa thẳng file Word thì nhớ sửa cả bản `.md` cho khớp.

### 4.5 Sửa sơ đồ BPMN
Mở `03-so-do-quy-trinh/*.bpmn` trên https://demo.bpmn.io, sửa, tải về `.bpmn` và xuất `.png`, ghi đè vào thư mục này rồi chép ảnh sang `06-slide/hinh-anh/` (giữ tên `01-bpmn-as-is.png`, `02-bpmn-to-be.png`). Hoặc sửa bảng nút/luồng trong `generate_bpmn.py` rồi chạy lại.

### 4.6 Chạy lại Process Mining
```bash
cd 04-process-mining
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m unittest test_handcalc test_sim   # 12 test
.venv/bin/python analyze.py                           # khoảng 5 phút, ghi đè out/
```
Đổi tham số trong `simulate.py` sẽ làm đổi mọi con số: phải cập nhật `02-tai-lieu` và slide theo.

## 5. Quy tắc bắt buộc

1. **Số liệu Process Mining là mô phỏng.** Luôn ghi nhãn "Dữ liệu mô phỏng"; không trình bày như hiệu quả đã chứng minh tại trường.
2. **Không bịa số liệu, nguồn, quy định pháp luật.** Mọi con số lấy từ `02-tai-lieu/tong-hop-kien-thuc` (mục 6, 9) hoặc `04-process-mining/out/results.md`.
3. **Những điều không được kết luận** (mục 9 của tài liệu kiến thức): hiệu quả thực tế tại trường; phần mềm tự thân làm giảm chờ ký; form web chắc chắn giảm một nửa hồ sơ phải bổ sung; nhắc hạn làm giảm tỷ lệ đóng quá hạn.
4. **Prototype không giống hệt TO-BE:** chưa có timer nhắc hạn và tự đóng quá hạn. Nói rõ khi được hỏi.
5. **Không đưa bí mật vào git:** `05-prototype/.env` đã bị loại trừ; không commit mật khẩu, token, tài khoản n8n.
6. **Sửa ở một nơi:** mọi thay đổi làm trong repo này rồi commit; không giữ bản sửa riêng ngoài repo.

## 6. Làm việc chung trên repo

```bash
git clone https://github.com/zicky0908/bai-nhom-cap-giay-xac-nhan-sinh-vien.git
git pull                                    # trước khi sửa
git add -A && git commit -m "Mô tả ngắn" && git push
```

File `.pptx` và `.docx` là file nhị phân, git không gộp được khi hai người cùng sửa một file. Báo nhau trước khi sửa cùng một file slide; mỗi người nên sửa phần slide của mình rồi một người ghép.

Không đưa vào git (cài lại theo hướng dẫn): `.venv/`, `node_modules/`, `05-prototype/.env`, file PDF tạm, ảnh soát lỗi slide. Xem `.gitignore`.

## 7. Nguồn gốc nội dung

Phân tích được thực hiện qua orchestrator `ai-collaboration-lab`, cho Claude, Codex và Antigravity lần lượt đề xuất, phản biện và tổng hợp; code mô phỏng, phân tích và slide bản Claude do Claude Code viết, được Codex và Antigravity rà chéo; prototype dựng trong một phiên riêng ngày 23/10/2026 và được sửa 3 lỗi ngày 24/10/2026. Chi tiết từng lượt: `07-nhat-ky-ai/README.md`.
