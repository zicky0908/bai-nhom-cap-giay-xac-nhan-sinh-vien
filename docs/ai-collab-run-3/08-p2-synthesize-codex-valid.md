Ưu tiên sửa D1 rồi tính lại kết quả. Pass 2 xác minh D2, D3. Tiêu chí (b) đang tính theo lượt, chưa theo ca (analyze.py:142–150). Loại A05/A12 và timer A16 hợp lý; A13 cần tách trễ sau due_at (mục 4.2). Chưa dùng K5 để kết luận giảm quá hạn net.
Thông điệp từ results.md: slide 7 — Dữ liệu mô phỏng: A06→A07 chờ trung vị 620 phút, ứng viên nghẽn. Slide 8 — Dữ liệu mô phỏng: chờ ký AS-IS/S0-p15/S1-p15 là 548/584/121 phút. Slide 12 — Dữ liệu mô phỏng: P90 toàn trình S1 tăng 1.311→2.584 phút khi p tăng 0,15→0,30. Phụ thuộc giả định, chưa chứng minh hiệu quả tại trường.

[decisions] [{"id": "D2", "status": "accepted", "reason": "K5 dùng tuổi gross, trái yêu cầu net.", "evidence": [{"source": "analysis/analyze.py:85", "detail": "Không trừ thời gian SV tại mốc rà."}]}, {"id": "D3", "status": "accepted", "reason": "Chưa chuẩn hóa biến thể khi so hai quy trình.", "evidence": [{"source": "analysis/analyze.py:122–129", "detail": "get_variants nhận trực tiếp chuỗi complete."}]}]

---
Limitations:
- Chỉ đọc; chưa chạy test, kiểm hết K1–K9 hoặc định lượng ảnh hưởng D1. Cần kiểm tiếp lịch L3/A10, giới hạn vòng và CRN từ pass 1. Số slide là kết quả hiện có, cần tính lại sau sửa lỗi.