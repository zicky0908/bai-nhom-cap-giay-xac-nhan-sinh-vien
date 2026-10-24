Pass 1: xác minh và chấp nhận D1, mức cao: A13 TO-BE bị đảo complete trước start. Sửa bằng thứ tự chèn ổn định khi trùng giờ, rồi kiểm tra lại R5. R4′ cho phép lệch 1 phút nên lệch 1 giây chưa vi phạm R4′.
Phát hiện bổ sung đã đọc lại: simulate.py:179–181,205–208 cộng phút lịch cho L3; A10 không giữ tài nguyên, có thể chồng A07. Cần dùng lịch GA1 và đặt chỗ L3 cho cả A10.
Không coi chờ sang hôm sau của ký 16:00 là lỗi: mục 4.4:181 quy định L4 xử lý 15:00. MAX_ROUNDS=12 trái mô tả không giới hạn; chưa định lượng ảnh hưởng trên log. CRN vẫn dùng chung lượt rút giữa cấu hình, nhưng nguồn thời điểm đến khác mô tả.
Mọi kết quả là Dữ liệu mô phỏng, phụ thuộc giả định S1 và p; chưa chứng minh hiệu quả tại trường.

[decisions] [{"id": "D1", "status": "accepted", "reason": "Đã đọc lại: khóa sắp xếp đẩy complete lên trước start khi cùng giờ, vi phạm R5.", "evidence": [{"source": "analysis/simulate.py:168–170,261–266", "detail": "A13 ghi cùng giờ; complete được xếp trước start rồi start tăng 1 giây."}]}]

---
Limitations:
- Chỉ đọc nguồn; chưa chạy kiểm thử hay xác nhận R1–R8 trên log. Chưa kiểm Pass 2. rg không có sẵn, dùng grep. Không sửa tệp.