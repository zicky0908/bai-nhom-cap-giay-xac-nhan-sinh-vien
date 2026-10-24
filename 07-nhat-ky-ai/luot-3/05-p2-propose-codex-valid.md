Thông điệp tạm dùng từ results.md, chưa phải hiệu quả tại trường:
- Slide 7 — Dữ liệu mô phỏng: A06→A07 chờ trung vị 620 phút, là ứng viên nghẽn.
- Slide 8 — Dữ liệu mô phỏng: chờ ký 548→121 phút với S1-p15; S0-p15 là 584 phút. Kết quả phụ thuộc lịch ký.
- Slide 12 — Dữ liệu mô phỏng: P90 toàn trình S1 tăng 1.311→2.584 phút khi p tăng 0,15→0,30; không suy ra hiệu quả thực tế.

[proposals] [{"id": "D2", "claim": "Mức cao: K5 dùng tuổi gross nhưng được trình bày như quá hạn chính. Cần trừ thời gian SV tích lũy đến mốc t và báo gross riêng.", "evidence": [{"source": "analysis/analyze.py:80–93; docs/bao-cao-phan-tich.md:149–153", "detail": "net_age chỉ gọi work_between(A01,f), không trừ thời gian SV; đặc tả yêu cầu tuổi net >2250."}], "acceptance": ["Ca đang chờ bổ sung được trừ thời gian SV đến min(t,due_at).", "Xuất riêng tỷ lệ quá hạn net và gross; tính lại K5."]}]

---
Limitations:
- Chỉ đọc, chưa chạy kiểm thử. Chưa kiểm hết K1–K9. Biến thể chưa chuẩn hóa; loại toàn bộ cạnh vào A13 có thể che trễ phát hiện của trường, cần xác minh tiếp. A05/A12 thuộc thời gian SV; A16 là timer. Số slide lấy từ kết quả hiện có, còn chịu lỗi D1.