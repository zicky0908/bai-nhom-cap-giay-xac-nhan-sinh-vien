# Sơ đồ BPMN AS-IS / TO-BE

| File | Nội dung |
|---|---|
| `as-is.bpmn`, `to-be.bpmn` | BPMN 2.0 có tọa độ; mở và chỉnh bằng https://demo.bpmn.io hoặc Camunda Modeler |
| `as-is.png`, `to-be.png` | Ảnh xem trước cho slide, vẽ từ cùng tọa độ |
| `generate_bpmn.py` | Bảng nút/luồng theo mục 2 và mục 5 của báo cáo; sửa bảng rồi chạy lại |

```bash
../analysis/.venv/bin/python generate_bpmn.py
```

Quy ước: A05 (SV nộp bổ sung) vẽ bằng sự kiện nhận tin nhắn sau event-based gateway; AS-IS dùng timer "hết hạn, phát hiện khi rà thứ Sáu", TO-BE dùng timer nhắc trước 2 ngày làm việc và timer đến hạn. Ô nền xanh trong ảnh xem trước là bước hệ thống tự làm (service/send task).
