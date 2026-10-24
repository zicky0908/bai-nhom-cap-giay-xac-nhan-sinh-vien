<!-- Slide number: 1 -->
![preencoded.png](icon-tieu-de)
Cấp giấy xác nhận sinh viên: phân tích và tự động hóa quy trình
Trường Cao đẳng Y Dược (bối cảnh giả định cho mục đích học thuật)
Nhóm 4 · TV1, TV2, TV3, TV4

### Notes:
TV1 mở đầu: giới thiệu đề tài và 4 thành viên. Nhấn mạnh: bối cảnh và số liệu là giả định/mô phỏng cho mục đích học thuật, không phải số liệu chính thức của trường.

<!-- Slide number: 2 -->
SV không biết hồ sơ đang ở đâu, cán bộ không đo được chỗ chậm
Không tra được trạng thái
Số sổ gán lúc tiếp nhận nhưng không báo cho SV, nên SV phải hỏi lại nhiều lần
![preencoded.png](icon-van-de-1)
Mục tiêu (dự kiến)
Có mã hồ sơ, tra được trạng thái
Kiểm tra đủ/thiếu ngay khi nộp
Tách thời gian chờ và thời gian xử lý
Nhắc hạn, đóng hồ sơ quá hạn đúng hạn
Thông báo có lưu vết và có lý do
Thiếu hồ sơ phát hiện muộn
Thông tin thiếu/sai chỉ lộ ra khi kiểm tra, dẫn tới bổ sung nhiều vòng
![preencoded.png](icon-van-de-2)
Chờ ký lâu
Hồ sơ đã soạn nằm chờ phiên ký theo lô
![preencoded.png](icon-van-de-3)
Quá hạn chỉ lộ khi rà sổ
Không có mốc thời gian hệ thống; rà hồ sơ quá hạn mỗi chiều thứ Sáu
![preencoded.png](icon-van-de-4)
Thông báo không lưu vết
Báo kết quả qua điện thoại/Zalo, không có bằng chứng đã báo
![preencoded.png](icon-van-de-5)
2

### Notes:
TV1: 5 vấn đề P1–P5 là giả thuyết, cần phỏng vấn cán bộ để xác minh. Vấn đề tô màu cam (chờ ký) là ứng viên điểm nghẽn mà phần Process Mining sẽ kiểm chứng.

<!-- Slide number: 3 -->
Một hồ sơ đi từ lúc nộp tới một trong ba kết cục rõ ràng
Bên tham gia
Sinh viên · Cán bộ CTHSSV · Lãnh đạo phòng · Văn thư · Phòng Đào tạo (nguồn tra cứu)
Đầu vào
MSSV, họ tên, lớp/khoa, loại giấy, mục đích, số bản, email, giấy tờ kèm theo
Bắt đầu
Sinh viên nộp yêu cầu
Kết thúc
E1 nhận giấy · E2 bị từ chối có lý do · E3 đóng do quá hạn bổ sung
Đầu ra
Giấy đã ký, đóng dấu hoặc thông báo từ chối; nhật ký sự kiện
Hai mốc đo thời gian
Thời gian phía trường: từ lúc nộp tới lúc SV biết kết quả. Đây là phần trường kiểm soát được.
Thời gian phía SV: thêm khoảng SV chuẩn bị bổ sung và đến nhận giấy. Tách riêng để không đổ lỗi cho trường.
3

### Notes:
TV1: phạm vi từ lúc nộp tới E1/E2/E3. Ngoài phạm vi: ký số, giá trị pháp lý, tích hợp CSDL của trường. Giả định giờ làm việc T2–T6, 7:30–11:30 và 13:30–17:00.

<!-- Slide number: 4 -->
Quy trình hiện tại: 4 vai trò, nhiều bước làm tay, một vòng bổ sung
![bpmn-as-is](bpmn-as-is)
Đọc sơ đồ: kiểm tra có 3 nhánh (đủ, thiếu, không đủ tư cách); thiếu thì báo SV bổ sung và chờ tới hạn 7 ngày làm việc; quá hạn chỉ được phát hiện khi rà sổ chiều thứ Sáu; lãnh đạo ký theo lô thứ Ba và thứ Năm.
4

### Notes:
TV2: sơ đồ BPMN 2.0, file chỉnh sửa được ở diagrams/as-is.bpmn (mở bằng bpmn.io). Chỉ ra vòng A03→A04→A05→A03 và nhánh từ chối A10→A14.

<!-- Slide number: 5 -->
Bốn vị trí có thể gây trễ, để dữ liệu kiểm chứng
H1
Chờ ký
Soạn giấy → lãnh đạo ký
Nguyên nhân giả định: Ký theo lô, người ký vắng
H2
Vòng bổ sung
Kiểm tra → báo bổ sung → nộp lại
Nguyên nhân giả định: Biểu mẫu không nêu rõ giấy tờ
H3
Chờ kiểm tra
Tiếp nhận → kiểm tra
Nguyên nhân giả định: Cán bộ kiêm nhiệm, tra cứu tay
H4
Chờ chuyển giấy
Lãnh đạo ký → văn thư
Nguyên nhân giả định: Giấy đã ký chờ chuyển theo lô
Tiêu chí công bố trước khi chạy dữ liệu
(a) Trung vị thời gian chờ thuộc 3 chuyển tiếp lớn nhất
(b) Ít nhất 50% số ca qua chuyển tiếp chờ quá 1 ngày làm việc (450 phút)
(f) Chuyển tiếp xuất hiện ở ít nhất 10% số ca
Đạt cả ba mới gọi là ứng viên điểm nghẽn; chỉ nêu nguyên nhân khi có bằng chứng (lịch ký, cỡ lô).
5

### Notes:
TV2: không kết luận nguyên nhân chỉ từ một con số lớn. Thời gian SV đến nhận giấy (A11→A12) không tính là điểm nghẽn của trường. H1 tô cam vì là ứng viên dữ liệu sẽ xác nhận ở slide 7.

<!-- Slide number: 6 -->
Hai kịch bản được mô phỏng trên cùng một dòng hồ sơ đến
400
20
7
hồ sơ mỗi lần chạy, 12 tuần
seed ngẫu nhiên, ghép cặp từng hồ sơ
cấu hình: AS-IS, TO-BE S0/S1 × 3 mức bổ sung

| Tham số | AS-IS | TO-BE | Lý do |
| --- | --- | --- | --- |
| Lịch ký của lãnh đạo | Lô thứ Ba, thứ Năm 14:00 | S1: 10:30 và 16:00 mỗi ngày · S0: giữ lô | Tách tác động của lịch ký |
| Xác suất phải bổ sung (lần 1 / sau) | 0,30 / 0,15 | 0,15 / 0,08 · độ nhạy 0,22 và 0,30 | Chưa có căn cứ, nên chạy độ nhạy |
| Phát hiện quá hạn bổ sung | Rà sổ thứ Sáu 15:00 | Timer đúng hạn | Thay đổi P4 |
| Giữ nguyên ở cả hai | Số hồ sơ, loại giấy, hành vi SV, 1 cán bộ tiếp nhận |  | Cùng cơ sở so sánh |

Dữ liệu mô phỏng
6

### Notes:
TV3: mô phỏng sự kiện rời rạc, cùng seed cho ra cùng log. Mọi tham số là giả định; xác suất bổ sung của TO-BE chưa có căn cứ nên luôn báo kèm độ nhạy. Code và event log CSV ở thư mục analysis/.

<!-- Slide number: 7 -->
Chờ ký là ứng viên điểm nghẽn duy nhất đạt đủ ba tiêu chí
![dfg-as-is](dfg-as-is)
621
phút làm việc: trung vị chờ từ soạn giấy tới lúc ký (A06→A07)
63% số ca chờ quá 1 ngày làm việc; xuất hiện ở 369/400 ca
Biến thể: 62,3% hồ sơ đi thẳng; 18,5% bổ sung 1 vòng; 4,5% bị đóng do quá hạn. Không tính là nghẽn của trường: thời gian SV chuẩn bị bổ sung và đến nhận giấy.
Dữ liệu mô phỏng
7

### Notes:
TV3: DFG dựng bằng PM4Py (discover_dfg), thời gian chờ tính bằng pandas theo phút làm việc. Cạnh đỏ đạt (a)+(b)+(f); cạnh vàng chỉ đạt (a). Cạnh A01→A02 vàng phần lớn do quy ước làm tròn giờ nộp về 7:30, không phải xếp hàng thật.

<!-- Slide number: 8 -->
Công thức trong code khớp số tính tay trên hồ sơ mẫu

| Hồ sơ mẫu | Biến thể | Thời gian phía trường | Chờ ký | Ghi chú |
| --- | --- | --- | --- | --- |
| C001 | Đi thẳng, được duyệt | 843 | 555 | Khớp test tự động |
| C002 | Bổ sung 1 vòng | 1.693 | 585 | Khớp test tự động |
| C003 | Không đủ tư cách | 1.233 | – | Khớp test tự động |
| C004 | Quá hạn bổ sung, đóng | 5.740 | – | Trễ phát hiện 2.130; tuổi net 95 |

![preencoded.png](icon-kiem-thu)
12 test tự động đều đạt
Hàm lịch làm việc khớp bộ tính tay C001–C004
Hàm tính KPI kiểm trực tiếp trên ca C001
Log mô phỏng đúng quy tắc: start trước complete, chỉ đóng dấu sau khi duyệt
Codex và Gemini rà code 2 đợt, tìm và sửa 3 lỗi tính KPI
Đơn vị: phút làm việc (1 ngày = 450 phút).
Dữ liệu mô phỏng
8

### Notes:
TV3: bộ tính tay ở mục 4.6 báo cáo. Không nói 'khớp 100% mọi ca': test gọi hàm KPI trực tiếp mới có ca C001. Kể ngắn về lỗi tìm được: thời gian xử lý từng bị tính cả giờ nghỉ trưa.

<!-- Slide number: 9 -->
TO-BE: bỏ bước thừa, tự động hóa giấy tờ và thông báo
![bpmn-to-be](bpmn-to-be)
Kiểm soát lại
Form web có checklist; ký 2 khung giờ/ngày; báo văn thư ngay
Tự động hóa
Mã hồ sơ, sinh giấy từ mẫu, email bổ sung, nhắc hạn, đóng quá hạn
Loại bỏ
Bước ghi lý do từ chối riêng (gộp vào bước duyệt, bắt buộc lý do)
Giữ nguyên
Lãnh đạo quyết định; ký và đóng dấu giấy; tiêu chí tư cách
9

### Notes:
TV2: ô nền xanh là bước hệ thống tự làm. A05 (SV nộp bổ sung) nằm ở làn Sinh viên. File chỉnh sửa: diagrams/to-be.bpmn. Lưu ý prototype demo hiện thực một phần TO-BE (chưa có nhắc hạn và đóng quá hạn tự động).

<!-- Slide number: 10 -->
Prototype: app ghi trạng thái, n8n điều phối, Mailpit lưu email
![preencoded.png](icon-dich-vu-1)
![preencoded.png](icon-dich-vu-2)
![preencoded.png](icon-dich-vu-3)
![preencoded.png](icon-dich-vu-4)
Web app (FastAPI)
Giao diện SV, cán bộ, phân tích. Bên duy nhất ghi trạng thái và nhật ký
PostgreSQL
Data source: hồ sơ, nhật ký sự kiện, hàng đợi thông báo
n8n Community
Nhận webhook, tiền kiểm, gọi chuyển trạng thái, gửi email, callback
Mailpit
Hộp thư thử nghiệm local, không gửi ra Internet
Workflow n8n đáp ứng yêu cầu tối thiểu
Trigger
Webhook nhận yêu cầu từ web
Data source
Đọc hồ sơ và dữ liệu SV qua API
Condition
IF tiền kiểm? · IF đủ điều kiện và đủ thông tin?
4 actions
Ghi đạt · ghi yêu cầu bổ sung · xác nhận đồng bộ · phản hồi
Notification
Gửi email qua Mailpit (SMTP)
10

### Notes:
TV4: giảng viên đã đồng ý thay Power Automate bằng n8n tự host. Giao diện chỉ báo 'đã thông báo' khi n8n callback về (SYNCED); n8n lỗi thì hồ sơ giữ PENDING/FAILED, không báo thành công giả. Gửi lại cùng khóa không tạo hồ sơ trùng.

<!-- Slide number: 11 -->
Một hồ sơ chạy thật: từ form nộp tới email thử nghiệm
![man-hinh-sinh-vien](man-hinh-sinh-vien)
![man-hinh-can-bo](man-hinh-can-bo)
![man-hinh-mailpit](man-hinh-mailpit)
1. Sinh viên nộp form
Nhận mã hồ sơ GXN-…; n8n tiền kiểm tự động
2. Cán bộ nhận xử lý, duyệt, cấp giấy
Mỗi bước ghi start/complete; thao tác sai thứ tự bị từ chối
3. Email trong Mailpit
Có bằng chứng thư; trạng thái đổi sang 'Đã thông báo'
Đã chạy thử qua giao diện ngày 24/10/2026: luồng cấp giấy và vòng yêu cầu bổ sung đều đạt.
11

### Notes:
TV4: phần demo trực tiếp 10 phút sẽ đi đúng 3 bước này, cộng vòng yêu cầu bổ sung. Hồ sơ trong ảnh là dữ liệu demo, xóa được bằng scripts/reset-demo.sh.

<!-- Slide number: 12 -->
Đổi lịch ký mới giảm chờ ký; phần mềm giảm thao tác cán bộ

### Chart: Thời gian phía trường (trung vị, phút LV)

| Category | Phút làm việc |
| --- | --- |
| AS-IS | 1363.0 |
| TO-BE S0 (ký theo lô) | 944.0 |
| TO-BE S1 (ký 2 lần/ngày) | 788.0 |

### Chart: Chờ trước khi ký (trung vị, phút LV)

| Category | Phút làm việc |
| --- | --- |
| AS-IS | 551.0 |
| TO-BE S0 (ký theo lô) | 584.0 |
| TO-BE S1 (ký 2 lần/ngày) | 121.0 |

So theo cặp, 20 seed
S1 tốt hơn AS-IS ở 20/20 seed về thời gian phía trường và chờ ký
S0 không giảm chờ ký (0/20 seed)
Thao tác cán bộ: 43 → 21 phút/ca
Trễ phát hiện quá hạn: 1.239 → 0 phút
Không được kết luận: hiệu quả thực tế tại trường; phần mềm tự thân làm giảm chờ ký; form web chắc chắn giảm một nửa hồ sơ phải bổ sung (đó là giả định đầu vào).
Dữ liệu mô phỏng
12

### Notes:
TV4: đây là phát hiện quan trọng nhất. Nếu tự động hóa mà vẫn ký theo lô (S0) thì chờ ký không giảm, nên muốn cải thiện phải đổi cả cách tổ chức (lịch ký), không chỉ mua phần mềm. Mọi mục tiêu KPI là dự kiến.

<!-- Slide number: 13 -->
Kết quả mô phỏng chỉ minh họa phương pháp; cần nhật ký thật để kiểm chứng
Giới hạn: tham số là giả định, 1 cán bộ tiếp nhận, chưa loại trừ ngày lễ; prototype chưa có nhắc hạn và đóng quá hạn tự động
Bước 1: thu sổ tiếp nhận, phiếu trình, sổ văn thư của một học kỳ để dựng event log thật
Bước 2: hiệu chỉnh tham số, chạy lại Process Mining, xác nhận hoặc bác giả thuyết H1
Bước 3: thí điểm lịch ký 2 khung giờ và form web cho một loại giấy, đo hằng tuần

### Notes:
TV1 kết luận và mời câu hỏi, sau đó chuyển sang demo 10 phút.
