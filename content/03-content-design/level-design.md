---
title: Level Design
icon: 🏗️
summary: Dẫn dắt người chơi bằng không gian — sight line, landmark, vòng lặp không gian, và dạy học không lời.
status: deep
read: 260
level: intermediate
order: 10
tags: [content, level]
related: [pacing, combat-systems, difficulty-curve, procedural-generation]
---

Level design là nghệ thuật **khiến người chơi làm điều bạn muốn mà họ tưởng đó là ý mình**.

## Dẫn dắt không lời

Người chơi đi theo, gần như vô thức, theo thứ tự ưu tiên sau:

1. **Ánh sáng** — mạnh nhất. Mắt luôn đi về phía sáng nhất trong khung hình.
2. **Chuyển động** — cờ bay, hơi nước, NPC đi lại.
3. **Tương phản màu** — một điểm màu ấm giữa nền lạnh.
4. **Đường dẫn hình học** — hành lang, lan can, vệt sáng trên sàn.
5. **Landmark** — công trình cao nhìn thấy từ xa, làm điểm định hướng.

Half-Life 2 và Dishonored là giáo trình mẫu mực của bốn kỹ thuật đầu. Nếu phải đặt biển chỉ đường, thường là bố cục đã thất bại.

## Ngôn ngữ hình khối

Người chơi học nghĩa từ hình dạng rất nhanh, miễn là bạn nhất quán:

- Chỗ bám được luôn có màu/chất liệu riêng (vàng trong Uncharted, trắng trong Mirror's Edge).
- Chỗ phá được luôn có cùng dấu hiệu nứt.
- Kẻ địch nguy hiểm có hình bóng khác biệt ở kích thước thu nhỏ.

**Kiểm tra bằng hình bóng đen:** tô toàn bộ màn hình thành đen trắng thuần. Nếu vẫn phân biệt được kẻ địch, vật thể tương tác và lối đi, thiết kế hình khối của bạn tốt.

## Vòng lặp không gian

Level tuyến tính buộc người chơi đi ngược đường cũ để quay lại — chán. Giải pháp: **vòng lặp và đường tắt**.

Cấu trúc của Dark Souls: đi xa, mở một cánh cửa tắt quay về điểm xuất phát. Hiệu ứng kép:
- Phần thưởng không gian, cảm nhận được ngay, không cần vật phẩm.
- Người chơi xây được bản đồ trong đầu → cảm giác làm chủ nơi chốn.

## Nhịp không gian

Đừng để mọi căn phòng đều là trận đánh. Nhịp cơ bản:

```
Khám phá  →  Chiến đấu  →  Thưởng  →  Nghỉ  →  (lặp)
   ngắn       cao trào     ngắn      dài
```

Khoảng nghỉ **cần thiết về mặt chức năng**, không phải thời gian chết: nó cho phép người chơi xử lý thông tin, và tạo tương phản khiến trận sau căng hơn. Xem [[pacing]].

## Dạy học qua ba nhịp

Công thức đưa cơ chế mới vào mà không cần tutorial:

1. **Bối cảnh an toàn** — giới thiệu cơ chế ở nơi thất bại không bị phạt. (Nấm đầu tiên trong Mario đi *về phía* người chơi trong một hành lang kín — không thể tránh được việc học.)
2. **Áp dụng có phạt** — dùng cơ chế đó với rủi ro thật.
3. **Kết hợp** — cơ chế mới + cơ chế cũ trong cùng một bài toán.

Sau ba nhịp này, cơ chế đã thuộc về vốn từ vựng của người chơi và có thể dùng tự do.

## Danh sách kiểm tra một màn chơi

- [ ] Người chơi luôn biết đi hướng nào trong vòng 3 giây sau khi vào phòng mới.
- [ ] Có ít nhất một landmark nhìn thấy từ nhiều vị trí.
- [ ] Có đường tắt hoặc vòng lặp, không phải hành lang một chiều.
- [ ] Cơ chế mới được giới thiệu an toàn trước khi bị kiểm tra.
- [ ] Có khoảng nghỉ trước và sau cao trào.
- [ ] Test hình bóng đen vẫn đọc được.
- [ ] Có ít nhất một tuyến đường thay thế hoặc bí mật cho người chơi tò mò.

## 🤖 Prompt cho AI

AI **rất kém ở bố cục không gian** — nó không có trực giác 3D và không cảm nhận được khoảng cách hay tầm nhìn. Đừng nhờ nó "thiết kế một màn chơi hay".

Nhưng nó rất hữu ích ở những việc quanh đó:
- Sinh bố cục dạng lưới theo **ràng buộc** bạn viết ra ("9×9, đúng 1 lối vào, 2 lối ra, không có hành lang cụt dài quá 3 ô, tối thiểu 2 vòng lặp").
- Kiểm tra bất biến trên dữ liệu màn chơi: có đường đi được không, có phòng mồ côi không, mật độ kẻ địch có vượt ngân sách không.
- Sinh biến thể trang trí từ một bố cục nền do bạn dựng.

Nói cách khác: **bạn thiết kế không gian, AI thi hành luật và kiểm tra.**
