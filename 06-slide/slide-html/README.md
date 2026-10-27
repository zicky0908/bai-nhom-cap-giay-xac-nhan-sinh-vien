# Slide HTML (bản mẫu Slides, đã thay bằng `../trinh-chieu/`)

> Bản trình chiếu chính hiện là `06-slide/trinh-chieu/index.html`. Thư mục này giữ lại để tham khảo.

Bộ slide 16 trang dạng HTML do Claude làm từ nội dung của `../Slide-Claude.pptx`. So với bản PowerPoint, các sơ đồ đã được vẽ lại cho dễ đọc: mỗi sơ đồ chỉ có một luồng chính đi từ trái sang phải, nhánh rẽ tách sang slide riêng, mũi tên đánh số theo thứ tự xảy ra. Khi trình chiếu, ô và mũi tên hiện lần lượt theo lời nói.

## Xem và trình chiếu

- Bản trực tuyến: https://claude.ai/artifact/4b8cKDq1BFB6MiX9LUXmCL (riêng tư; chủ repo phải bấm Share để chia sẻ cho từng người). Có chế độ Present và xuất PDF/PPTX từ trang này.
- Các file trong thư mục này là **mã nguồn** của bản trực tuyến. Mở thẳng file `.html` bằng trình duyệt sẽ không ra đúng như bản trình chiếu: thiếu font, khung 1920×1080, mũi tên (`<x-connector>`) và hiệu ứng.

## Cấu trúc

| File | Nội dung |
|---|---|
| `deck.json` | Thứ tự slide, 4 phần, font Be Vietnam Pro |
| `slides/<id>.html` | Một slide mỗi file; ghi chú người trình bày nằm trong thẻ `<aside>` cuối file |

Thứ tự (số slide · id · người trình bày):

| # | id | Nội dung | TV |
|---|---|---|---|
| 1 | `cover` | Bìa | TV1 |
| 2 | `bai-toan` | 5 vấn đề, mục tiêu dự kiến | TV1 |
| 3 | `tong-quan` | Phạm vi, 3 kết cục, 2 mốc đo thời gian | TV1 |
| 4 | `asis-chinh` | AS-IS luồng chính (swimlane 4 làn) | TV2 |
| 5 | `asis-nhanh` | AS-IS các nhánh: bổ sung, quá hạn, duyệt/từ chối | TV2 |
| 6 | `diem-nghen` | 4 giả thuyết điểm nghẽn H1–H4, tiêu chí | TV2 |
| 7 | `mo-phong` | Thiết kế mô phỏng: AS-IS, S0, S1 | TV3 |
| 8 | `ket-qua` | Kết quả Process Mining: chờ ký 621′ | TV3 |
| 9 | `kiem-chung` | Kiểm chứng bằng tính tay, 12 test | TV3 |
| 10 | `tobe-thay-doi` | 4 thay đổi TO-BE | TV4 |
| 11 | `tobe-luong` | TO-BE swimlane (cùng kiểu slide 4) | TV2 |
| 12 | `kien-truc` | Kiến trúc prototype ①–⑤ | TV4 |
| 13 | `n8n` | Workflow n8n: trigger, condition, action, notification | TV4 |
| 14 | `man-hinh` | 3 ảnh chạy thật | TV4 |
| 15 | `danh-gia` | Đánh giá: đổi lịch ký mới giảm chờ ký | TV4 |
| 16 | `ket-luan` | Giới hạn, 3 bước tiếp theo, chuyển sang demo | TV1 |

## Sửa slide

- Sửa nội dung chữ: sửa trực tiếp trong file `.html` tương ứng, rồi nhờ Claude đăng lại lên đúng link trên (chỉ chủ artifact đăng được).
- Màu: xanh `#0E7C74` / `#0F3A3F` là màu chính; **cam `#D9861A` chỉ dùng cho điểm nghẽn chờ ký**; đỏ `#B8423A` cho từ chối, quá hạn. Chữ không nhỏ hơn 24px.
- Sơ đồ đặt bằng tọa độ tuyệt đối (khung 1920×1080). Dòng chú thích `<!-- ... -->` đầu file ghi tọa độ các ô; dời ô thì phải dời cả `x1 y1 x2 y2` của mũi tên nối vào ô đó.
- Ảnh ở slide 14 trỏ tới `/_blob/...` (ảnh đã tải lên bản trực tuyến); bản gốc là `../hinh-anh/07-`, `08-`, `09-*.png`.
- Mọi số liệu lấy từ `02-tai-lieu/tong-hop-kien-thuc`; slide có số Process Mining phải giữ nhãn "Dữ liệu mô phỏng".
