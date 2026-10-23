Pass 1: phát hiện lỗi thứ tự start/complete của A13 TO-BE, cần sửa trước khi dùng log để kiểm chứng timer. Đây là đề xuất từ đọc mã, chưa phải kết luận đồng thuận.

[proposals] [{"id": "D1", "claim": "Mức cao: A13 TO-BE bị xuất complete trước start, vi phạm R5. Cần giữ thứ tự phát sinh khi trùng thời điểm, rồi mới cộng giây theo seq.", "evidence": [{"source": "analysis/simulate.py:168–170,261–266", "detail": "A13 ghi start và complete cùng due; khóa sắp xếp đưa complete lên trước start rồi đẩy start thêm 1 giây."}], "acceptance": ["Mỗi A13 có start đứng trước complete và timestamp complete >= start.", "Đối chiếu R5 và R4′ trên log sinh lại của cả 6 cấu hình TO-BE."]}]

---
Limitations:
- Chỉ đọc mã; chưa chạy mô phỏng hoặc kiểm thử. rg không có sẵn (exit 127); đã dùng nl và sed để đọc nguồn.
- Chưa hoàn tất kiểm chứng toàn bộ pass 1; cần rà thêm hàng đợi FIFO, tài nguyên L3, giới hạn vòng và R1–R8. Chưa kiểm pass 2. Mọi số liệu là dữ liệu mô phỏng.