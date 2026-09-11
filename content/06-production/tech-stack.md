---
title: Chọn Tech Stack
icon: 🔧
summary: Engine, ngôn ngữ, công cụ — chọn theo dự án và theo mức độ AI hỗ trợ được.
status: stub
read: 470
level: intermediate
order: 40
tags: [production, tooling]
related: [architecture-patterns, performance, ai-workflow]
---

## Cần bồi đắp

- [ ] So sánh Unity / Godot / Unreal / web (Phaser, three.js) theo loại dự án
- [ ] Tiêu chí chọn: quy mô, nền tảng đích, kinh nghiệm sẵn có, giấy phép
- [ ] Chi phí chuyển engine giữa chừng
- [ ] Chuỗi công cụ: version control cho asset lớn, CI, build tự động

## Ghi chú tạm

**Một tiêu chí mới đáng cân nhắc: AI hỗ trợ engine này tốt tới đâu?**

Yếu tố ảnh hưởng trực tiếp tới năng suất khi làm việc với agent:
- Lượng tài liệu và code công khai của engine (engine phổ biến → AI viết chính xác hơn).
- Ngôn ngữ có kiểm tra kiểu tĩnh giúp phát hiện lỗi AI sinh ra sớm hơn.
- Engine có API ổn định thì ít gặp vấn đề model dùng API đã lỗi thời.
- Dự án dạng text (scene là file text) thì AI đọc/sửa được; dự án dạng binary thì không.

Điểm cuối đáng chú ý: Godot lưu scene dưới dạng text nên agent có thể đọc và sửa trực tiếp. Unity dùng YAML nên đọc được nhưng dễ hỏng nếu sửa tay. Với Unreal, blueprint là binary — agent gần như không can thiệp được, phải làm qua C++.

**Luôn nêu rõ phiên bản engine trong prompt.** Tri thức của model có thời điểm cắt; engine thì cập nhật liên tục. Không nêu phiên bản là nguồn lỗi "API không tồn tại" phổ biến nhất.

## 🤖 Prompt cho AI

Đây là quyết định khó đảo ngược nhất, nên hãy bắt AI phản biện thay vì gợi ý.

**Mẫu prompt**

```
Tôi đang chọn engine cho dự án này:
- Thể loại: <...>
- Quy mô: <số thực thể, 2D/3D, single/multi>
- Nền tảng đích: <...>
- Kinh nghiệm sẵn có của tôi: <...>
- Tôi sẽ làm phần lớn code CÙNG VỚI AI agent.

So sánh <Unity 6> và <Godot 4> cho trường hợp NÀY, gồm cả tiêu chí:
"agent đọc và sửa được project tới mức nào?" (file text hay binary,
độ ổn định API, lượng tài liệu công khai).

Khuyến nghị MỘT cái. Nói rõ cái gì tôi sẽ mất khi chọn nó.
Ước tính chi phí chuyển engine nếu 6 tháng nữa tôi đổi ý.
```

**Luôn nêu phiên bản chính xác trong mọi prompt sau đó.** `Unity 6` khác `Unity 2021` rất nhiều; model sẽ dùng API của phiên bản phổ biến nhất trong dữ liệu huấn luyện nếu bạn không nói.

**Bẫy thường gặp:** hỏi "engine nào tốt nhất" → nhận về bảng so sánh chung chung ai cũng viết được. Ràng buộc cụ thể mới cho ra khuyến nghị dùng được.
