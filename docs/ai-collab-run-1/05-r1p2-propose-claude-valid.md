# Vòng 1 (mục 1–3), pass 2: cải tiến bản tổng hợp pass 1
> Đây là giả định học thuật. Chưa có dữ liệu hay quy trình chính thức của trường, và bài không trích dẫn quy định pháp luật nào. Bản này **giữ nguyên** mọi phần của pass 1 (bối cảnh, bên liên quan L1–L4, đầu vào/đầu ra, phạm vi, GA1–GA9, H1–H3), chỉ ghi phần sửa và phần bổ sung (đánh dấu *mới*).

## 1. Business Problem & Process Overview (bổ sung)
**Vấn đề viết lại dạng giả thuyết, mỗi vấn đề kèm dấu hiệu cần quan sát:**
| Mã | Giả thuyết | Dấu hiệu kiểm chứng |
|---|---|---|
| P1 | SV không tra được trạng thái hồ sơ | Số lượt SV hỏi lại trên mỗi hồ sơ |
| P2 | Thiếu/sai thông tin bị phát hiện muộn | Tỷ lệ hồ sơ có ≥1 vòng A04; mã lý do bổ sung |
| P3 | Chờ ký lâu | Chờ A06→A07 theo giờ làm việc |
| P4 | Quá hạn chỉ lộ ra khi rà sổ | Độ trễ từ lúc hết hạn GA3 đến A13 |
| P5 *mới* | Thông báo qua điện thoại/Zalo, không lưu vết | Tỷ lệ A04/A11/A14 có bằng chứng đã báo |

**Hai mốc kết thúc để đo (*mới*):**
- T_trường = complete(A11, A14 hoặc A13) − A01. Đây là phần trường kiểm soát.
- T_SV = complete(A12) − A01. Chỉ tính cho E1.
- Mọi chỉ số thời gian phải ghi rõ dùng mốc nào. Tách như vậy để ngày SV đến nhận giấy không bị tính thành điểm nghẽn của trường.

**Giả định bổ sung:**
| Mã | Giả định |
|---|---|
| GA10 | Theo GA9, thời điểm A01 chỉ có ngày, nên chờ A01→A02 tính theo ngày. Bộ mô phỏng sinh đến phút nhưng phải ghi rõ giới hạn này |
| GA11 | AS-IS không mô hình việc L3 yêu cầu bổ sung trực tiếp. Nếu phỏng vấn thấy có, thêm nhánh G2→A04 |
| GA12 | SV chưa đến nhận thì hồ sơ ở trạng thái «đã cấp, chưa nhận»; AS-IS không tự đóng. Hồ sơ này vẫn tính vào hồ sơ tồn phía SV, tách khỏi hồ sơ tồn phía trường |
| GA13 | resource/role trong log: L1=student, L2=officer, L3=approver, L4=clerk. resource là mã người ẩn danh, ví dụ OFF01 |

## 2. AS-IS: chỉ các dòng thay đổi (các dòng khác giữ như pass 1)
| Mã | Hoạt động | Lane | Đi tới | Log |
|---|---|---|---|---|
| A04 | Báo SV bổ sung, nêu mục thiếu và hạn | L2 | G3 | S+C |
| G3 *mới* | Event-based gateway: chờ sự kiện nào đến trước? | L2 | SV nộp bổ sung→A05; timer (hết hạn GA3, phát hiện ở lần rà thứ Sáu GA8)→A13 | – |
| A05 | SV bổ sung, nộp lại | L1 | A03 | C |
| A13 | Đóng hồ sơ quá hạn, báo SV; start = thời điểm rà sổ | L2 | E3 | S+C |

**Vì sao đổi:**
- Pass 1 gắn timer biên vào A05. A05 là sự kiện tức thời của SV và chỉ xảy ra khi SV có nộp, nên không thể «chạy quá hạn» trên A05.
- G3 diễn đạt đúng tình huống «chờ SV hoặc hết hạn». Thay đổi này cũng làm khớp từ vựng G1–G3 trong D2.

**Ràng buộc G2 (*mới*):**
- Nhánh «Không đồng ý đề xuất từ chối→A06» chỉ hợp lệ khi A07 đi tới từ G1 (không đủ tư cách).
- Nếu A07 đi tới từ A06, G2 chỉ có hai nhánh: Duyệt hoặc Từ chối.

**Kiểm tra tính hợp lệ của log (dùng cho bộ sinh dữ liệu ở vòng 2):**
- R1: mỗi case kết thúc bằng đúng một trong E1/E2/E3, hoặc vẫn đang mở.
- R2: A08 chỉ xuất hiện sau quyết định Duyệt gần nhất.
- R3: A10 luôn đứng ngay trước A14.
- R4: A13 chỉ đứng sau A04 và không có A05 nào sau lần A04 cuối.
- R5: mỗi start có đúng một complete cùng activity, cùng case, và complete ≥ start.
- R6: số vòng bổ sung = số lần A04 xuất hiện.

**Biến thể:**
- V5 sửa thành: A01–A03, k×(A04, A05, A03) với k ≥ 0, rồi A04, A13.
- Cần thống nhất trong slide: V2–V5 có thể kết hợp với số vòng k.

## 3. Bottleneck (bổ sung cho H1–H3)
| | H4 *mới* | H5 *mới* |
|---|---|---|
| Vị trí | A11→A12 (SV đến nhận) | A07→A08 (bàn giao L3→L4) |
| Nguyên nhân giả định | SV bận học/thực tập lâm sàng, hẹn nhận theo khung giờ | Giấy đã ký nằm chờ ở phòng lãnh đạo, chuyển theo lô sang văn thư |
| Ảnh hưởng | Làm T_SV dài thêm nhưng ngoài kiểm soát của trường. Chỉ dùng để tách khỏi T_trường, không coi là nghẽn của trường | Tăng T_trường mà không ai thấy, vì không ai «sở hữu» chuyển tiếp này |
| Dữ liệu kiểm chứng | start/complete của A11, A12; khung hẹn nhận | complete(A07)→start(A08); giờ chuyển giấy; số giấy mỗi lô |

**Nguồn dữ liệu thực để kiểm chứng (khi có), *mới*:**
- A02: sổ tiếp nhận.
- A06/A07: phiếu trình ghi ngày trình và ngày ký.
- A08: sổ văn thư.
- A04/A11/A14: email/tin nhắn đã gửi.
- Dữ liệu thực thường chỉ có ngày, nên kiểm chứng ngoài thực tế chỉ ở mức ngày lịch. Mô phỏng ở mức phút chỉ minh họa phương pháp.

**Bổ sung vào tiêu chí ứng viên:**
- (d) Chốt ngưỡng trước khi sinh dữ liệu và công bố cùng seed, để không chọn ngưỡng theo kết quả.
- (e) Loại trừ nguyên nhân do lịch: so số đo theo giờ lịch và theo giờ làm việc (GA1). Nếu chờ dài chỉ vì cuối tuần/giờ nghỉ trưa thì không gọi là nghẽn.
- Thứ tự kết luận giữ như pass 1: (a)+(b) = ứng viên nghẽn; thêm (c) mới được nêu nguyên nhân; (d)+(e) là điều kiện hợp lệ của phép đo.

---
Limitations:
- C1 (D1) vẫn mở: chỉ người phản biện (antigravity) được giải quyết. Lượt propose trước của antigravity bị contract_error (JSON không hợp lệ), nên không có nội dung để đối chiếu.
- Bản này là delta trên bản tổng hợp pass 1. Người tổng hợp cần ghép lại thành toàn văn: thay dòng A04/A05/A13, thêm G3, thêm GA10–GA13, P5, H4–H5, R1–R6 và tiêu chí (d)(e).
- GA10–GA13, khung hẹn nhận (H4) và việc chuyển giấy theo lô (H5) đều là giả định, cần phỏng vấn cán bộ trường. Việc L3 có yêu cầu bổ sung trực tiếp hay không (GA11) có thể làm đổi G2.
- Ngưỡng số cho các tiêu chí (a)(b) và ngưỡng quá hạn GA4 vẫn chưa chốt. Tiêu chí (d) yêu cầu chốt chúng ở vòng 2 trước khi sinh dữ liệu.
- Phiên đang ở plan mode nhưng không có công cụ Write/ExitPlanMode, nên không tạo plan file. Tôi chỉ đọc docs/project-brief.md và không sửa file nào.