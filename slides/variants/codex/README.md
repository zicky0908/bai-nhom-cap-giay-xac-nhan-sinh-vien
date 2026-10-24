# PowerPoint do Codex thiết kế

Chạy lại: `node build.js`. Không cần cài thêm thư viện, không truy cập mạng.

Kết quả: `output/slide.pptx`, khổ rộng 16:9, 13 slide có ghi chú tiếng Việt và phân công thuyết trình trong notes.

Thiết kế: nền kem, xanh đậm, xanh ngọc; cam nhấn điểm nghẽn và giới hạn. Sơ đồ và biểu đồ KPI dùng đối tượng PowerPoint có thể sửa. Nội dung chữ chính từ 14 pt; chân trang và số trang là thông tin phụ. Ảnh giao diện là bằng chứng ghi sẵn từ các ảnh được cung cấp.

## Điều chỉnh so với dàn ý

- Giữ 13 slide và thứ tự chủ đề. Slide 4, 7, 9 dùng sơ đồ rút gọn từ BPMN/DFG để đọc được khi chiếu, không trình bày như bản BPMN đầy đủ. Bản gốc vẫn ở `inputs/images/`.
- Slide 8 chỉ dùng các mốc tính tay của C001–C004 được mục 4.7 xác nhận. Không tự thêm hai hồ sơ TO-BE, hoặc tự gán ý nghĩa KPI cho các mốc chưa được tài liệu định danh.
- Slide 10–11 phản ánh prototype thật ở mục 6: app duy nhất ghi trạng thái và event log; n8n điều phối, SMTP và callback. Thay đặc tả cũ về năm workflow/bảy hành động bằng workflow đã chạy với ít nhất bốn hành động. Phân biệt phần đã chạy với timer/sinh bản thảo của mô hình đích.
- Slide 11 đưa bằng chứng giao diện và 20 test prototype đã đạt, thay con số 14 test cũ; phân biệt test kỹ thuật với kết quả mô phỏng ở slide 12.
- Slide 12 vẽ lại biểu đồ trung vị tổng hợp qua 20 seed, không tự dựng min–max vì file số liệu không có các giá trị biên. Biểu đồ gốc có khoảng min–max ở `inputs/images/kpi_compare.png`. Nhấn riêng S0 để tránh quy cải thiện chờ ký cho phần mềm.
- Nội dung chi tiết (định nghĩa thước đo, giới hạn, nhánh xử lý, kịch bản demo, phân công) có trong speaker notes, giữ slide ít chữ.

## Nguồn và kiểm tra

Chỉ dùng `inputs/dan-y-13-slide.md`, `inputs/so-lieu-da-chot.md` và ảnh trong `inputs/images/`. Mọi KPI là dữ liệu mô phỏng. Không suy ra hiệu quả vận hành thật tại trường.

Đã chạy build và kiểm tra cấu trúc ZIP/XML, đủ 13 notes, nhãn mô phỏng và các đối tượng nằm trong khổ slide. Các ảnh `preview-*.png` là bản xem bố cục SVG do script sinh, không phải kết quả render từ Microsoft PowerPoint. `layout-audit.json` ghi kích thước hộp chữ để hỗ trợ rà soát. Không có phần mềm Office/LibreOffice trong môi trường để render trực tiếp PPTX.
