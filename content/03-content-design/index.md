---
title: Level & Content Design
icon: 🗺️
summary: Đổ nội dung vào bộ khung hệ thống — màn chơi, nhịp độ, sinh thủ tục, kể chuyện, giao diện.
status: deep
read: 250
level: basic
order: 30
tags: [content]
related: [systems, foundations]
---

Nếu [[systems]] là bộ luật, thì content design là **những tình huống cụ thể** người chơi thực sự đi qua.

## Các node

- **[[level-design]]** — dẫn dắt, tầm nhìn, nhịp không gian, dạy mà không cần tutorial.
- **[[procedural-generation]]** — sinh nội dung bằng thuật toán, và vì sao "vô hạn" thường có nghĩa là "nhạt".
- **[[pacing]]** — nhịp căng–chùng qua toàn bộ hành trình.
- **[[narrative]]** — kể chuyện qua không gian, cơ chế và hệ thống.

> Phần trình bày — giao diện, âm thanh, art direction — đã tách thành nhánh riêng: [[presentation]].

## Nguyên tắc xuyên suốt

**Dạy bằng không gian, đừng dạy bằng chữ.** Căn phòng đầu tiên có một khoảng trống an toàn để thử cơ chế mới sẽ dạy tốt hơn mọi hộp thoại hướng dẫn. Xem cấu trúc răng cưa ở [[difficulty-curve]].

**Nội dung thủ công đặt tiêu chuẩn, thủ tục nhân bản quy mô.** Đừng bắt đầu bằng procedural. Hãy làm 10 màn tay trước, tìm ra điều gì khiến chúng hay, *rồi* mới mã hoá thành luật sinh. Làm ngược lại gần như luôn cho ra nội dung nhạt nhẽo.

**Mật độ quan trọng hơn kích thước.** Bản đồ nhỏ dày đặc quyết định thú vị luôn thắng bản đồ khổng lồ trống rỗng. Đây là sai lầm phổ biến nhất khi có AI hỗ trợ — sinh ra rất nhiều nội dung trở nên quá rẻ.

## 🤖 Prompt cho AI

AI sinh nội dung với chi phí gần như bằng không, và đó vừa là cơ hội vừa là cái bẫy.

Cơ hội: biến thể, sắp xếp, bản nháp đầu, mô tả vật phẩm, lore rời rạc — AI làm tốt và nhanh.

Cái bẫy: **khối lượng không phải chất lượng**. 500 nhiệm vụ sinh tự động tệ hơn 20 nhiệm vụ viết tay. Nếu người chơi nhận ra nội dung là khuôn mẫu lặp lại, toàn bộ thế giới mất độ tin cậy ngay lập tức.

Cách dùng hợp lý: để AI sinh **nguyên liệu thô và biến thể**, còn con người giữ vai trò **biên tập và sắp đặt**. Xem [[ai-workflow]].
