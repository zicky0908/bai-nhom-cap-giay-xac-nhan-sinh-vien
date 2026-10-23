# Phản biện vòng 1, pass 2 (mục 1–3)
Tôi đã đối chiếu bản propose pass 2 (delta) với bản tổng hợp pass 1, D2, D3 và docs/project-brief.md:107-150. Hướng sửa G3 là đúng: bỏ timer biên khỏi A05 và tách hai mốc T_trường/T_SV. Tuy vậy vẫn còn các lỗ hổng sau, người tổng hợp cần xử lý khi ghép thành toàn văn.

**Đã ghi vào ledger (C1 của D3):** G3 chưa định nghĩa trường hợp A05 đến sau hạn GA3 nhưng trước lần rà thứ Sáu (GA8). Timer nên nổ đúng hạn. Khoảng trễ từ lúc hết hạn đến lúc phát hiện là thời gian chờ trước start(A13), không phải một phần của timer. Nếu không sửa, R4 và chỉ số P4 sẽ không đo được nhất quán.

**Các điểm khác (chưa ghi ledger, cần sửa trong văn bản):**
1. **Gateway không ghi log, nhưng R2 và ràng buộc G2 lại cần biết kết quả quyết định.** Kết quả của A07 phải là thuộc tính của event, ví dụ `decision` = approve/reject/return. Nhánh G2→A06 chỉ hợp lệ khi đi tới từ G1, nên cần thêm thuộc tính `origin` hoặc kiểm tra theo bước liền trước trong trace. Thiếu hai thuộc tính này thì PM4Py không kiểm được R2.
2. **Mâu thuẫn A12.** A12 được quy ước chỉ ghi complete, nhưng H4 lại dùng "start/complete của A12". Cần sửa H4 thành complete(A11)→complete(A12).
3. **H4 không phải giả thuyết nghẽn của trường.** Chính bản nháp cũng thừa nhận điều này. Nên đổi thành "phép tách T_SV" để slide không ghi "5 bottleneck".
4. **GA12 tạo dữ liệu bị cắt (censoring).** Hồ sơ "đã cấp, chưa nhận" chưa có A12 nên phải loại khỏi T_SV, hoặc báo cáo riêng. Không được tính T_SV đến thời điểm cắt dữ liệu.
5. **GA10 và T_trường.** A01 chỉ có ngày, nên mọi T_trường/T_SV ở AS-IS chỉ chính xác đến mức ngày. Cần ghi rõ quy ước: A01 = 00:00 hay = giờ mở cửa? Quy ước này phải giống nhau ở AS-IS và TO-BE, nếu không phép so sánh bị lệch.
6. **P5 trong AS-IS gần như không có nguồn dữ liệu.** Thông báo qua điện thoại/Zalo không lưu vết. Chỉ số này chỉ đo được ở TO-BE; cần ghi rõ để tránh so sánh không cùng cơ sở.
7. **T_trường cho E1 kết thúc ở A11.** Cần nêu lý do không dùng A09 (xác nhận cấp). Cách chọn này ảnh hưởng tới KPI ở vòng 3.

---
Limitations:
- Đây là lượt phản biện chỉ đọc. Tôi chỉ đọc docs/project-brief.md, không sửa file và không tạo plan file vì không có công cụ Write/ExitPlanMode. C1 của D1 vẫn mở; chỉ antigravity được giải quyết.
- Các điểm 1–7 trong summary chưa được ghi thành critique trong ledger, vì ngân sách mỗi lượt khuyến nghị chỉ một critique. Người tổng hợp cần xử lý trực tiếp trong toàn văn, hoặc lượt sau ghi thành critique riêng.