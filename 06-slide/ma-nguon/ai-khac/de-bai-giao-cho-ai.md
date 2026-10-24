Bạn là một AI trong nhóm hợp tác (Claude, Codex, Antigravity). Hãy TỰ thiết kế và dựng MỘT bộ slide PowerPoint (.pptx) của riêng bạn cho bài thuyết trình nhóm 20 phút, đề tài "Phân tích và tự động hóa quy trình cấp giấy xác nhận sinh viên tại trường cao đẳng Y Dược". Một bản do Claude dựng đã có; nhóm muốn có thêm bản của bạn để so sánh, nên đừng cố bắt chước bản khác.

Đầu vào trong thư mục hiện tại (chỉ dùng những gì ở đây, không truy cập mạng):
- inputs/dan-y-13-slide.md: dàn ý 13 slide đã thống nhất (tiêu đề, thông điệp, nội dung, hình, người trình bày). Bám theo dàn ý này; được gộp, tách hoặc đổi thứ tự nếu có lý do, nhưng phải giữ đủ các ý.
- inputs/so-lieu-da-chot.md: bối cảnh, điểm nghẽn, kết quả Process Mining đã chốt (mục 4.7), prototype thật (mục 6), kịch bản demo (mục 9). MỌI con số trên slide phải lấy từ file này; không tự bịa số liệu, nguồn hay quy định.
- inputs/images/: as-is.png, to-be.png (BPMN), dfg_AS-IS.png, dfg_TB-S1-p15.png (bản đồ quy trình), kpi_compare.png, wait_process.png (biểu đồ), student_full.png, staff_detail_top.png, mail_crop.png (ảnh chụp prototype).
- node_modules/: đã cài sẵn pptxgenjs, react, react-dom, react-icons, sharp. KHÔNG chạy npm install.

Yêu cầu:
1. Viết script build.js dùng pptxgenjs (require('pptxgenjs')), chạy bằng `node build.js`, xuất file output/slide.pptx. Bố cục 16:9 (pres.layout = 'LAYOUT_WIDE', 13,33 x 7,5 inch). Màu hex không có dấu #.
2. Tiếng Việt có dấu, câu ngắn, mỗi slide một thông điệp chính; không chữ tràn ra ngoài khung, cỡ chữ nội dung tối thiểu 14pt.
3. Mọi slide có số liệu Process Mining ghi rõ "Dữ liệu mô phỏng". Không khẳng định hiệu quả thực tế tại trường.
4. Mỗi slide có ghi chú cho người trình bày (slide.addNotes) bằng tiếng Việt.
5. Không ghi thời lượng lên slide; không đưa chỉ dẫn nội bộ lên slide.
6. Chỉ tạo hoặc sửa file trong thư mục hiện tại. Chạy `node build.js` để chắc chắn file output/slide.pptx được tạo.

Khi xong, trả lời ngắn: danh sách slide (tiêu đề), lựa chọn thiết kế chính, và mọi chỗ bạn lệch khỏi dàn ý kèm lý do.
