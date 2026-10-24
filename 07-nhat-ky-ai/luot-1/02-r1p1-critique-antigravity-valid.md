# Phản biện Vòng 1 (Mục 1–3) – Pass 1

## 1. Phản biện Mục 1 (Business Problem & Process Overview)
- **Mâu thuẫn giữa GA6 và nghiệp vụ kiểm tra tư cách SV (A03):** GA6 quy định A03 chỉ phân loại đủ/thiếu và mọi quyết định từ chối chỉ xảy ra tại A07. Tuy nhiên, nếu SV không đủ tư cách (đã thôi học, bảo lưu, không thuộc đối tượng hoãn NVQS/vay vốn), việc đẩy vào vòng bổ sung (A04–A05) là vô nghĩa vì SV không thể bổ sung tư cách; ngược lại, chuyển sang A06 (Soạn giấy, trình ký) rồi mới để L3 từ chối ở A07 gây lãng phí công soạn giấy. **Đề nghị sửa:** Hoặc cho phép A03 chuyển thẳng ca không đủ tư cách sang trình L3 từ chối (bỏ qua khâu soạn giấy in), hoặc đổi A06 thành "Lập phiếu trình/dự thảo" và chỉ in/đóng dấu tại A08 sau khi duyệt.
- **Thiếu cơ chế định danh hồ sơ ở AS-IS:** P1 nêu SV không biết trạng thái hồ sơ, nhưng mục Đầu vào/Đầu ra chưa làm rõ ở AS-IS SV có được cấp `case_id` ngay khi nộp (A01) hay chỉ khi cán bộ ghi sổ (A02).

## 2. Phản biện Mục 2 (AS-IS Swimlane/BPMN)
- **Mâu thuẫn bảng và mô tả tại A11–A12:** Trong bảng, cột `Đi tới` của A11 ghi `E1/E2` (làm A12 bị cô lập, không có luồng đi vào), trong khi lời giải thích bên dưới ghi `duyệt → A12 → E1; từ chối → E2`. **Đề nghị sửa:** Thêm gateway `G3 (Kết quả duyệt?)` sau A11 (`Duyệt → A12 → E1; Từ chối → E2`) hoặc tách rõ 2 hoạt động thông báo để bảng đủ chuẩn vẽ lại BPMN.
- **Lệch vai trò tại A08:** GA2 xác định L3 là người ký duyệt, nhưng bảng gán A08 ("Ký, đóng dấu, vào sổ") cho L4 (Văn thư). **Đề nghị sửa:** Thao tác "Ký" thuộc A07 (L3), còn A08 (L4) chỉ "Đóng dấu, vào sổ".
- **Mâu thuẫn giữa P4 và Timer biên GA3 (A05→A13):** P4 khẳng định AS-IS "không có dữ liệu thời gian nên không đo hay cảnh báo được quá hạn", nhưng A05 lại có timer biên 7 ngày chuyển sang A13. Cần làm rõ ở AS-IS việc đóng hồ sơ quá hạn (A13) chỉ diễn ra thủ công/không đều khi cán bộ rà sổ định kỳ (gây tồn đọng hồ sơ mở), khác với timer tự động ở TO-BE.
- **Thiếu `start+complete` để tách thời gian chờ và xử lý:** Bảng chỉ log `complete` cho A04, A05, A08–A13. Nếu A08 (đóng dấu) hoặc A04/A11 chỉ có `complete`, PM4Py không tách được thời gian chờ chuyển giao (handover L3→L4, L2→L1) khỏi thời gian xử lý thực tế. Cần bổ sung `start+complete` cho tối thiểu A08 (hoặc mọi task tác nghiệp của L2/L3/L4) và quy ước rõ các sự kiện tức thời.

## 3. Phản biện Mục 3 (Bottleneck)
- **Gắn nhãn `B1 (chính)` trước khi có dữ liệu:** Việc định danh sẵn B1 là nghẽn chính khi chưa chạy dữ liệu mô phỏng (Mục 4) dễ dẫn tới thiên kiến xác nhận. Cần trình bày B1, B2, B3 ngang hàng là **3 giả thuyết điểm nghẽn** cần kiểm chứng.
- **Phép đo B2 chưa tách lỗi từ phía trường và phía SV:** Trong vòng lặp `A03→A04→A05→A03`, cần tách `complete(A04)→complete(A05)` (thời gian SV chuẩn bị bổ sung) với `complete(A05)→start(A03)` (thời gian hồ sơ bổ sung nằm chờ cán bộ kiểm tra lại) và `complete(A03)→complete(A04)` (độ trễ báo bổ sung).

---
Limitations:
- Bản đề xuất chưa quy ước rõ hoạt động nào là sự kiện tức thời (chỉ có complete) và hoạt động nào có thời lượng (start+complete), ảnh hưởng trực tiếp tới schema event log ở Vòng 2.
- Chưa làm rõ trong AS-IS thủ công cán bộ phát hiện hồ sơ quá hạn bổ sung (GA3) bằng cách nào khi P4 nêu không có công cụ theo dõi thời gian.