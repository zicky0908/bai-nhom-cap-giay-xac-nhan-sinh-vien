Hãy dùng hệ thống AI Collaboration Lab hiện có trên máy tôi để triển khai bài nhóm dưới đây. Tôi yêu cầu thực hiện công việc, không chỉ đề xuất kế hoạch.

## 1. Kiểm tra dự án hiện có

Thư mục dự kiến:
`/home/ntlam/projects/ai-collaboration-lab`

Trước khi thay đổi:
- Đọc AGENTS.md, README, cấu hình và mã nguồn orchestrator.
- Kiểm tra trạng thái Git, các thay đổi chưa commit và kết quả chạy gần nhất.
- Xác minh khả năng gọi Codex, Claude và Antigravity thực tế; không mặc định các kết nối vẫn hoạt động.
- Bảo toàn công việc hiện có, không ghi đè thay đổi ngoài phạm vi.
- Tách mã nguồn bài nhóm khỏi mã nguồn orchestrator theo cấu trúc phù hợp với repository.

Tôi cho phép mở rộng hệ thống từ giai đoạn chỉ tranh luận sang thực hiện đề tài này: tạo/sửa file trong workspace dự án, cài dependency cần thiết, chạy kiểm thử và chạy dịch vụ local bằng Docker. Không triển khai công khai hoặc mua dịch vụ.

## 2. Sử dụng hệ thống hợp tác AI thật sự

Dùng Python Orchestrator hiện có để các AI phối hợp phân tích, phản biện, triển khai và kiểm thử.

Giới hạn đã thống nhất:
- Tối đa 3 vòng tranh luận.
- Tối đa 18 lượt gọi AI cho đợt thực hiện này.
- Luân phiên vai trò đề xuất, phản biện và kiểm chứng.
- Ghi lại lời gọi, phản hồi, quyết định, lỗi, timeout và thay đổi liên quan.
- Không tự đặt lại ngân sách để vượt giới hạn.

Hãy kiểm tra cách repository định nghĩa “vòng” và “lượt gọi”, rồi áp dụng rõ ràng. Nếu orchestrator chưa hỗ trợ sửa code/chạy test, hãy bổ sung phần tối thiểu cần thiết, với phạm vi thao tác giới hạn trong workspace đề tài.

Không mô phỏng cuộc tranh luận và không tự nhận đã gọi một AI khi chưa có kết quả thực tế. Nếu một kết nối lỗi, thử khắc phục trong phạm vi hợp lý rồi báo rõ tình trạng; không âm thầm thay bằng một mô hình duy nhất.

Có thể dùng các subagent hỗ trợ, nhưng chúng không thay thế việc gọi các công cụ AI qua orchestrator theo yêu cầu trên.

## 3. Đề tài và bối cảnh

Tên đề tài:
“Phân tích và tự động hóa quy trình cấp giấy xác nhận sinh viên tại trường cao đẳng Y Dược.”

Bối cảnh nghiệp vụ dự kiến:
- Sinh viên nộp yêu cầu cấp giấy xác nhận.
- Cán bộ kiểm tra thông tin và tư cách sinh viên.
- Hồ sơ thiếu hoặc sai thông tin cần bổ sung.
- Hồ sơ hợp lệ được chuyển phê duyệt.
- Hồ sơ có thể được duyệt hoặc từ chối.
- Sau phê duyệt, cán bộ xác nhận đã cấp giấy và hệ thống thông báo kết quả.

Đây là prototype học thuật. Chưa có dữ liệu thực tế hoặc quy trình chính thức của trường; các giả định phải được ghi rõ và có thể điều chỉnh.

Giảng viên đã chấp nhận thay Power Automate bằng công cụ khác. Không cần hỏi lại tôi về việc thay công cụ.

## 4. Yêu cầu bài nhóm của giảng viên

- Nhóm 4 học viên.
- Trình bày Business Problem và Process Overview.
- Mô tả AS-IS bằng BPMN hoặc Swimlane.
- Xác định tối thiểu 1 bottleneck: vị trí, nguyên nhân và ảnh hưởng.
- Có phân tích Process Mining với dữ liệu thực hoặc mô phỏng.
- Đề xuất quy trình TO-BE.
- Prototype tự động hóa chạy được, tối thiểu:
  - 1 trigger.
  - 4 actions.
  - 1 condition.
  - 1 data source.
  - 1 notification.
- Đánh giá cải tiến.
- Thời lượng dự kiến: 20 phút trình bày và 10 phút demo.
- Sản phẩm: slide, sơ đồ quy trình, dữ liệu nếu có, prototype và demo; không yêu cầu nộp Word.

Trước mắt ưu tiên hoàn thiện hệ thống chạy được, bằng chứng phân tích và tài liệu làm slide. Chưa cần tạo PowerPoint nếu việc đó làm chậm prototype.

## 5. Hướng triển khai đã chọn

- n8n Community Edition tự host: thực hiện tự động hóa nghiệp vụ.
- Python + PM4Py: phân tích process mining.
- Một giao diện web tiếng Việt: gửi hồ sơ, xử lý/duyệt và xem phân tích.
- Chạy local trên laptop, ưu tiên Docker Compose.
- Chọn công nghệ frontend và database đơn giản, dễ bảo trì, phù hợp repository hiện có.
- Không cần tài khoản Microsoft hoặc dịch vụ trả phí.

Các chức năng chính:
1. Sinh viên gửi yêu cầu và nhận mã hồ sơ.
2. Cán bộ xem danh sách và chi tiết hồ sơ.
3. Kiểm tra, yêu cầu bổ sung và gửi lại.
4. Duyệt hoặc từ chối, kèm lý do.
5. Xác nhận đã cấp giấy.
6. Thông báo kết quả.
7. Ghi event log.
8. Phân tích quy trình và so sánh AS-IS/TO-BE.

Không mở rộng sang hệ thống quản lý đào tạo đầy đủ. Chưa cần tích hợp SQL Server của trường, ký số hay phát hành giấy có giá trị pháp lý.

## 6. Tích hợp web với n8n

n8n phải thực sự thực hiện các phần nghiệp vụ quan trọng, không chỉ xuất hiện dưới dạng sơ đồ minh họa.

- Web gọi n8n bằng webhook/API.
- n8n xử lý điều kiện, gọi dịch vụ cần thiết, cập nhật dữ liệu và thực hiện thông báo.
- Xác định rõ thành phần nào chịu trách nhiệm cho từng trạng thái để tránh logic bị nhân đôi.
- Có workflow JSON xuất được và hướng dẫn import/cấu hình.
- Không dùng cơ chế nhúng editor n8n thương mại.
- Có thể mở editor n8n ở tab riêng để chứng minh workflow khi demo.

Phần phân tích nằm trong giao diện web chung và dùng dữ liệu phát sinh từ quy trình.

Thông báo phải có bằng chứng gửi/nhận thực sự. Nếu không có tài khoản email, ưu tiên hộp thư thử nghiệm local như Mailpit hoặc giải pháp tương đương. Ghi rõ đây là email thử nghiệm, không tuyên bố đã gửi ra Internet.

## 7. Process Mining và cách đo điểm nghẽn

Không đồng nhất thời gian chạy node n8n với thời gian xử lý nghiệp vụ.

Event log cần đủ dữ liệu để phân biệt:
- Thời gian chờ.
- Thời gian xử lý.
- Tổng thời gian hoàn thành.
- Hồ sơ đang tồn và tuổi hồ sơ.
- Vòng lặp yêu cầu bổ sung.
- Các nhánh xử lý khác nhau.

Thiết kế schema phù hợp, tối thiểu có:
- case_id.
- activity.
- timestamp.
- resource hoặc role.
- scenario: AS-IS/TO-BE.
- lifecycle hoặc cặp sự kiện bắt đầu/kết thúc nếu cần để tính thời gian xử lý.

Ghi thời điểm có múi giờ nhất quán; hiển thị theo Asia/Ho_Chi_Minh.

Dashboard cần có:
- Bản đồ quy trình dựng từ event log bằng PM4Py.
- Tần suất chuyển bước và thời gian giữa các bước.
- Biểu đồ thời gian chờ/xử lý theo công đoạn khi dữ liệu cho phép.
- Các biến thể quy trình phổ biến.
- Tỷ lệ hồ sơ phải bổ sung.
- Hồ sơ đang chờ và quá hạn theo ngưỡng cấu hình.
- So sánh AS-IS và TO-BE.

Nếu tô màu bước/chuyển tiếp có nguy cơ nghẽn, hãy công khai công thức hoặc tiêu chí. Không tự suy ra nguyên nhân chắc chắn chỉ từ một giá trị thời gian lớn.

## 8. Dữ liệu mô phỏng và đánh giá

Tạo dữ liệu giả lập có seed để tái lập, đủ số hồ sơ và biến thể để phân tích có ý nghĩa.

- Dữ liệu AS-IS cần phản ánh các giả định có giải thích, chẳng hạn chờ kiểm tra, chờ duyệt hoặc bổ sung nhiều lần.
- Dữ liệu TO-BE cần xuất phát từ các thay đổi quy trình cụ thể.
- Dùng cùng cơ sở so sánh và công khai những gì được giữ cố định/thay đổi.
- Không chọn số liệu chỉ để tạo kết quả đẹp.
- Phân biệt dữ liệu lịch sử mô phỏng với hồ sơ phát sinh từ demo trực tiếp.
- Hiển thị nhãn “Dữ liệu mô phỏng” rõ ràng.
- Không trình bày mức cải thiện mô phỏng như hiệu quả đã chứng minh tại trường.

Cho phép export event log CSV để kiểm tra độc lập. Có chức năng khôi phục dữ liệu demo mà không xóa nhầm dữ liệu ngoài phạm vi.

## 9. Kiểm thử và nghiệm thu

Phải kiểm chứng:
- Hồ sơ hợp lệ đi tới duyệt, cấp giấy và nhận thông báo.
- Hồ sơ cần bổ sung đi qua vòng bổ sung rồi được xử lý tiếp.
- Hồ sơ bị từ chối có lý do và thông báo.
- Gửi lại cùng yêu cầu không tạo bản ghi hoặc event trùng ngoài ý muốn.
- Hành động duyệt không hợp lệ với trạng thái hiện tại được xử lý đúng.
- Khi n8n/dịch vụ phụ trợ lỗi, giao diện không hiển thị thành công giả.
- Event log và dashboard phản ánh đúng các thao tác demo.
- Các chỉ số thời gian được đối chiếu bằng một tập dữ liệu nhỏ có kết quả tính tay.
- Khởi động lại dịch vụ không làm mất dữ liệu đã lưu.

Chạy smoke test toàn luồng. Kiểm tra giao diện bằng trình duyệt nếu có công cụ. Báo đúng những gì đã kiểm chứng và những gì còn thiếu.

## 10. Sản phẩm cần có

- Mã nguồn và dependency được khóa phiên bản phù hợp.
- Docker Compose và .env.example không chứa bí mật.
- Workflow n8n JSON.
- Dữ liệu giả lập, bộ sinh dữ liệu và event log mẫu.
- Sơ đồ AS-IS/TO-BE có nguồn chỉnh sửa được.
- Tài liệu ánh xạ từng yêu cầu giảng viên sang chức năng/bằng chứng.
- Giải thích phương pháp đo và giới hạn phân tích.
- Kịch bản demo 10 phút, gồm trình tự thao tác và kết quả mong đợi.
- Dàn ý slide cho phần trình bày 20 phút và gợi ý phân công 4 thành viên.
- Nhật ký hợp tác AI, quyết định kiến trúc và kết quả kiểm thử.
- Hướng dẫn khởi động, tài khoản demo, địa chỉ truy cập và cách reset.

Lưu sản phẩm trong repository/workspace phù hợp trên máy này.

## 11. Cách làm việc

Bắt đầu bằng kiểm tra trạng thái hiện có, sau đó nêu ngắn gọn kết quả và tiến hành triển khai. Không dừng ở kế hoạch.

Tự quyết định các lựa chọn kỹ thuật thông thường. Không yêu cầu tôi xác nhận lại các nội dung đã được cho phép. Chỉ hỏi khi thiếu thông tin thực sự chặn công việc hoặc cần thao tác ngoài phạm vi cho phép.

Trong quá trình làm, cập nhật ngắn gọn những gì đã chạy được, vấn đề còn tồn tại và bước tiếp theo. Nếu hết ngân sách gọi AI, lưu checkpoint và báo rõ; không giả vờ đã hoàn thành.

Khi kết thúc, đưa:
1. Những phần đã hoàn thành.
2. Kết quả kiểm thử thực tế.
3. Lệnh khởi động và URL truy cập.
4. Trình tự demo.
5. Hạn chế hoặc công việc còn lại.