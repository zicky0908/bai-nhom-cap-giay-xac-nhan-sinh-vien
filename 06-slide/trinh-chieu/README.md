# Trình chiếu (bản chính)

16 slide trong một file `index.html`, có hiệu ứng: mũi tên tự vẽ kèm chấm "hồ sơ" chạy dọc, số đếm lên, biểu đồ mọc dần, điểm nghẽn chờ ký phát sáng cam. Không cần cài gì, không cần mạng.

## Mở và trình chiếu

1. Mở `index.html` bằng Chrome hoặc Edge (nhấp đúp file).
2. Bấm **F** để toàn màn hình.
3. Bấm **→** (hoặc Space, click chuột, nút bút trình chiếu) để hiện bước tiếp theo; hết bước thì sang slide sau.

Thứ tự bấm khớp kịch bản trình bày (mỗi chỗ ghi **[Bấm]** là một lần bấm →).

| Phím | Tác dụng |
|---|---|
| → · Space · PageDown · click nửa phải | Bước / slide tiếp |
| ← · PageUp · click 1/4 trái | Lùi |
| Home · End | Slide đầu · slide cuối |
| F | Toàn màn hình |
| N | Hiện/ẩn ghi chú người nói ở đáy màn hình (kèm TV phụ trách, bước, mốc thời gian) |
| P | Mở cửa sổ ghi chú riêng có đồng hồ bấm giờ (kéo sang màn hình laptop khi chiếu ra máy chiếu) |
| O | Danh sách 16 slide để nhảy nhanh |
| Ctrl + P | In / lưu PDF, mỗi slide một trang, hiện đủ mọi bước |

Không có mạng thì chữ hiện bằng font Segoe UI thay cho Be Vietnam Pro, vẫn đủ dấu tiếng Việt.

## Phân vai

TV1: slide 1–3, 16 · TV2: 4–6 · TV3: 7–9, 15 · TV4: 10–14. Góc phải dưới mỗi slide ghi người trình bày.

## Sửa slide

- Mỗi slide là một khối `<section class="slide" …>` trong `index.html`, có chú thích `<!-- 4 · AS-IS luồng chính -->` ở đầu. Ghi chú người nói nằm trong `<aside class="notes">`.
- `data-step="n"`: phần tử hiện ở lần bấm thứ n. `data-step="0"` hiện ngay khi vào slide (có hiệu ứng).
- Mũi tên: `<path class="e" data-p="x1,y1 x2,y2" data-r="hv">` theo tọa độ khung 1920×1080. `data-r`: `hv` ngang rồi dọc, `vh` dọc rồi ngang, `hvh`/`vhv` gấp khúc; nhiều điểm thì liệt kê hết trong `data-p`. Thêm `data-flow` để có chấm chạy dọc. Màu: thêm class `hot` (cam), `teal`, `red`, `pale`, `light`; `dash` là nét đứt.
- Dời một ô thì phải sửa cả tọa độ mũi tên nối vào ô đó.
- `data-count="621"`: số đếm từ 0 lên. Class `pulse`: phát sáng cam. Class `bar`: thanh mọc dần.
- Màu cam (#D9861A) chỉ dùng cho điểm nghẽn chờ ký. Mọi số liệu lấy từ `02-tai-lieu/tong-hop-kien-thuc`; slide có số Process Mining giữ nhãn "Dữ liệu mô phỏng".
- Ảnh màn hình nằm trong `anh/` (chép từ `../hinh-anh/`).
