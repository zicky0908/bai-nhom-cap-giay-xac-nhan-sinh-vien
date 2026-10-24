D2 được xác minh: K5 chưa trừ thời gian SV. Loại A05/A12 và timer A16 khỏi chờ trường hợp lý; riêng A13 phải tách trễ phát hiện sau due_at.
Thông điệp slide, chỉ mô tả kết quả hiện có:
- Slide 7 — Dữ liệu mô phỏng: A06→A07 chờ trung vị 620 phút, là ứng viên nghẽn.
- Slide 8 — Dữ liệu mô phỏng: chờ ký AS-IS/S0-p15/S1-p15 là 548/584/121 phút; phụ thuộc lịch ký.
- Slide 12 — Dữ liệu mô phỏng: P90 toàn trình S1 tăng 1.311→2.584 phút khi p tăng 0,15→0,30. Chưa chứng minh hiệu quả tại trường.

[proposals] [{"id": "D3", "claim": "Chưa chuẩn hóa biến thể khi so AS-IS/TO-BE theo mục 4.2; cần xuất thêm bảng đã chuẩn hóa.", "evidence": [{"source": "analysis/analyze.py:122–129; docs/bao-cao-phan-tich.md:156", "detail": "get_variants nhận chuỗi complete còn A15/A16/A17; chưa gộp nhánh reject."}], "acceptance": ["Bảng so sánh bỏ A15/A16, gộp A06+A17 và A07(reject)+A10 theo mục 4.2."]}]

---
Limitations:
- Chỉ đọc nguồn và kết quả; chưa chạy kiểm thử, chưa kiểm hết K1–K9. rg không có sẵn. Số slide còn chịu lỗi D1; chưa định lượng ảnh hưởng. Chưa xác minh tử số theo ca của (b): code tính theo lượt qua cạnh. Không sửa tệp.