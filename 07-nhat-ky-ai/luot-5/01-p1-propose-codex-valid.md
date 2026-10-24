Pass 1: phát hiện TO-BE đặt A05 sai lane và dùng hai phần tử M1/M2 thay cho hoạt động sinh viên. AS-IS có đủ A01–A14, ba nhánh G1, vòng bổ sung, nhánh duyệt/từ chối/trả lại và E1/E2/E3 trong bảng nguồn. TO-BE có A15–A17, bỏ A10 đúng đặc tả; G3b bổ sung giúp nhắc một lần mỗi vòng, chưa nên coi là phần tử thừa. Cần phản biện tiếp việc hai gateway chờ thay cấu trúc G3 ba nhánh, khả năng nhận bổ sung sau hạn và điều kiện trả lại: hiện điều kiện chỉ xuất hiện trong nhãn. Chưa kết luận tính đúng chuẩn hay khả năng mở bằng bpmn.io ở pass này.

[proposals] [{"id": "D1", "claim": "Sửa TO-BE: A05 phải thuộc L1; M1/M2 hiện gắn nhãn A05 nhưng nằm L5. Giữ sự kiện nhận ở L5 với tên riêng, thêm A05 ở L1 và nối cả M1/M2 qua A05 về A03.", "evidence": [{"source": "docs/bao-cao-phan-tich.md:239; diagrams/generate_bpmn.py:248–252", "detail": "Đặc tả A05 thuộc L1; NODES đặt M1/M2 mang nhãn A05 ở L5; XML xác nhận tại to-be.bpmn:35–39."}], "acceptance": ["A05 xuất hiện đúng một lần trong lane L1.", "M1/M2 không mang mã A05; cả hai dẫn qua A05 về A03."]}]

---
Limitations:
- Chưa có phản biện hoặc quyết định chấp nhận. Đây là đề xuất cần kiểm chứng tiếp.
- rg và python không có sẵn; đã đọc bằng nl, sed và grep. Lần đọc gộp bị cắt; đã đọc lại phần đặc tả liên quan. Chưa chạy kiểm tra XML hoặc bpmn.io. Không sửa tệp.