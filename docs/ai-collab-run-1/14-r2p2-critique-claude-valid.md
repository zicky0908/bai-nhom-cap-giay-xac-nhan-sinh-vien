# Vòng 2 – Pass 2: phản biện bản propose mục 4–5
> Mọi số liệu là DỮ LIỆU MÔ PHỎNG.

## Đã tính lại tay, khớp
- TB-C002: T_trường 1262, T_SV 1519, chờ A17→A07 55 phút, SV nhận sau 257 phút.
- TB-C004: T_trường 3600; A16 lúc 11/03 17:00 (due trừ 2 ngày làm việc).
- C004: tuổi gross 3390, net 95 phút.
- 7 cấu hình; P90/trung vị là 1,9 với σ 0,5 và 2,8 với σ 0,8.

## Lỗi phải sửa
1. **A13 ở TO-BE chỉ ghi complete (C)** (D6/C1). Vì vậy s(A13) trong R4′ và «trễ phát hiện = s(A13) − due_at» không xác định. Cách sửa: ghi start+complete cho A13, hoặc định nghĩa lại bằng c(A13).
2. **Lane thay đổi theo kịch bản** (D6/C1). A02/A06/A11/A13/A14 chuyển từ L2 sang L5 ở TO-BE, nên tiêu chí «mỗi mã đúng 1 lane» và R7 phải áp dụng riêng cho từng kịch bản. Thêm nữa, A04 ở L2 nhưng email lại do SYS gửi, nên cần ghi rõ resource.
3. **Định nghĩa net che mất P4.** Ở AS-IS V5, đoạn từ due_at đến s(A13) là lỗi phát hiện chậm của trường, nhưng hiện bị trừ như thời gian của SV. Sửa: thời gian SV = c(A04) → min(c(A05), due_at).
4. **event_id uuid5 chưa có cfg và seed.** Gộp 140 lần chạy thì ID sẽ trùng nhau. Thêm cfg+seed vào chuỗi sinh ID, hoặc tách mỗi lần chạy ra một file.
5. **Trùng timestamp.** A01/A15/A02 cùng 07:30; A03c và A06c cùng 09:08. Nếu PM4Py sắp xếp theo timestamp, thứ tự có thể đảo và DFG sai. Cần một khóa phụ seq ổn định, rồi kiểm tra bằng test.
6. **CRN chưa chặt.**
   - U_rw[1..5] giới hạn 5 vòng, mâu thuẫn với GA7 (không giới hạn vòng).
   - Chưa rõ U_noresp rút một lần mỗi ca hay mỗi vòng.
   - Phần độ nhạy p 0,22/0,30 thiếu giá trị «lần sau».
   - «400 ca» và «Poisson» mâu thuẫn: cần chọn N cố định (thời điểm đến rải đều) hoặc N ngẫu nhiên.
7. **A01 ở AS-IS.** Ghi 07:30 trong log nhưng hàng đợi phải dùng phút đến thật, tức s(A02) ≥ phút đến thật. Cần ghi rõ điều này.
8. **A15 lỗi «không tạo case».** Chưa nói các lần lỗi này ghi vào đâu, case_id là gì.
9. **(e) chỉ đúng khi tô màu bằng phút làm việc tính trong pandas**, không dùng DFG hiệu năng của PM4Py (DFG này tính theo giờ lịch).

## Ledger
D5/C1 đã được resolve, vì bản pass 2 xử lý đủ 4 điểm. Mở thêm D6/C1 (điểm 1–2). Các điểm 3–9 chỉ ghi ở đây; người tổng hợp phải xử lý trong toàn văn mục 4–5.

---
Limitations:
- D1/C1 vẫn mở; chỉ antigravity được resolve. D6/C1 mới mở; người tổng hợp sửa bảng TO-BE, R4′ và R7.
- Điểm 3–9 không ghi vào ledger để giữ trong ngân sách byte; người tổng hợp vẫn phải xử lý. uuid5 thiếu cfg/seed có thể cần một critique D5/C2 sau.
- Chỉ kiểm tra bằng tính tay, chưa chạy Python/PM4Py. Cách PM4Py xử lý timestamp trùng nhau chưa được xác minh.
- Lượt này không đọc lại brief; trích dẫn lấy từ ledger và transcript. Không có công cụ Write nên không tạo plan file và không sửa file nào.