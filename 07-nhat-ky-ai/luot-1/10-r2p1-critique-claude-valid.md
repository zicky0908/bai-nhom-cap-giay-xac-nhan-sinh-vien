# Vòng 2 – Pass 1: phản biện mục 4–5
> Áp dụng cho bản propose của vòng 2. Mọi số liệu trong bản đó là DỮ LIỆU MÔ PHỎNG.

## Kết quả tính lại bộ 4 ca (4.6)
Đã tính lại thủ công theo GA1, với 450 phút làm việc mỗi ngày và nghỉ trưa 11:30–13:30. **Tất cả khớp:** 843 / 1693 / 1233 / 5740 phút; giờ lịch 32h33 / 79h43 / 55h33 / 391h40; T_SV 990 / 1950; chờ A06→A07 là 555 / 585; trung vị 1463 và trung bình 2377,25; trễ phát hiện 2130 phút (166 giờ lịch); tuổi 3390 phút tại mốc 13/03 12:00; các hạn 11/03 và 13/03; số đếm DFG. 02/03/2026 đúng là thứ Hai.

## Lỗi phải sửa (ghi vào D5/C1)
1. **Mâu thuẫn với D4.** 4.4 ghi «A07 (origin=A06): return 5%». D4 và V4b chỉ cho phép return khi origin=A03, nên log sinh ra sẽ vi phạm kiểm tra hợp lệ. Cần tách hai bộ tham số: origin=A06 gồm approve/reject; origin=A03 gồm reject/return.
2. **event_id = uuid làm hỏng tiêu chí của D5** («cùng seed cho ra cùng SHA-256»). uuid4 không tái lập được. Phải dùng uuid5 sinh từ (scenario, case, seq, activity, lifecycle) hoặc rút từ rng.
3. **Cách làm CRN với p bổ sung chưa rõ.** Mỗi ca và mỗi vòng cần rút trước một U~U(0,1), rồi bổ sung khi U < p. Như vậy tập ca phải bổ sung ở TO-BE là tập con của AS-IS. Cần thêm khóa ghép ca, vì AS-0001 và TB-0001 hiện chưa có trường ghép.
4. **Cắt phải ở cuối kỳ.** Hồ sơ đến muộn trong 12 tuần sẽ chưa đóng. Nếu chỉ tính trung vị trên ca đã xong thì kết quả lệch về phía TO-BE. Cần mô phỏng thêm một khoảng sau ca đến cuối cùng, hoặc báo cáo theo cohort ngày đến kèm số ca còn mở.

## Thiếu so với yêu cầu GV / brief
5. **Phân phối thời gian xử lý** mới chỉ có trung vị, chưa có họ phân phối và σ. Yêu cầu 4 đòi phân phối và giải thích từng tham số.
6. **Thời gian xử lý A01** (chỉ có ngày, GA10) ở AS-IS và **thời điểm đến** của CRN (theo phút) chưa thống nhất. Cần nói rõ AS-IS làm tròn về 07:30 và TO-BE có cùng phiên bản làm tròn để so sánh.
7. **Bộ tính tay chỉ có AS-IS.** Nên thêm TO-BE cho C002 và C004 để đối chiếu trễ phát hiện = 0, R4′ và A16.
8. **Chưa đủ cơ sở cho các thay đổi TO-BE.** Lịch ký 10:30/16:00 và p 0,15/0,08 là hai tham số tạo ra phần lớn mức cải thiện, nhưng chưa có căn cứ. Độ nhạy mới chỉ áp cho p; cần làm thêm cho lịch ký, gồm cả trường hợp TO-BE vẫn ký theo lô T3/T5 (brief:147).

## Mâu thuẫn mô hình TO-BE
9. **Từ vựng activity.** A15 và A16 nằm ngoài D2 (A01–A14). Cần một quyết định mở rộng từ vựng.
10. **Lane không rõ ràng.** A06 thuộc «L5+L2» và A04 thuộc L5 nhưng do L2 bấm, trong khi một task BPMN chỉ thuộc một lane. Nên tách A06 thành hai bước (L5 sinh giấy, L2 rà) và ghi resource của A04.
11. **Mốc thời gian A07 ở TO-BE.** «Duyệt trên hàng đợi» và «ký bản in lúc 10:30/16:00» là hai mốc khác nhau. Cần nói rõ start/complete ứng với mốc nào; nếu không, so sánh chờ A06→A07 sẽ không công bằng.
12. **Quá hạn GA4 tính cả thời gian chờ SV.** Ví dụ C004 bị gắn nhãn quá hạn toàn trình trong khi đang chờ SV bổ sung. Nên báo thêm một phiên bản dừng đồng hồ khi chờ SV, hoặc ghi rõ GA4 bao gồm thời gian của SV.
13. **Tiêu chí tô màu (4.3) khác tiêu chí vòng 1.** 4.3 bỏ phép so trung vị với P90 và thêm (c) tần suất ≥10%. Cần thống nhất một bộ tiêu chí và chốt trước khi chạy.

Những điểm ổn: lược đồ có đủ các trường bắt buộc của brief:119-127; có tách data_origin (brief:148); A16 không làm thay đổi hành vi SV; bảng AS-IS→TO-BE có đủ loại thay đổi.

---
Limitations:
- Phản biện dựa trên bản propose vòng 2 pass 1 và brief (đã đọc docs/project-brief.md). Chưa chạy được PM4Py hay Python vì đang ở chế độ chỉ đọc. Bộ 4 ca chỉ được kiểm tra bằng tính tay, nên vẫn cần unit test.
- Ledger: D1/C1 vẫn mở, chỉ antigravity được giải quyết. Lượt này chỉ thêm D5/C1. Người tổng hợp nên đề xuất thêm một decision mở rộng từ vựng activity (A15, A16, tách A06), vì D2 chỉ có A01–A14.
- Các điểm 5–13 trong summary không ghi vào ledger để tiết kiệm ngân sách tăng trưởng. Người tổng hợp vẫn phải xử lý từng điểm trong toàn văn mục 4–5.
- Plan mode không có công cụ Write, nên không tạo file nào.