---
title: MDA Framework
icon: 🔬
summary: Mechanics → Dynamics → Aesthetics — ngôn ngữ chung để truy ngược từ cảm xúc mong muốn về luật chơi cụ thể.
status: deep
read: 230
level: intermediate
order: 50
tags: [foundations, theory, analysis]
related: [core-loop, player-motivation, balancing-math]
---

MDA (Hunicke, LeBlanc & Zubek, 2004) tách một trò chơi thành ba tầng:

- **Mechanics** — luật chơi và dữ liệu. *"Nhân vật có 100 HP, đòn chém gây 12 sát thương, cooldown 0.4s."*
- **Dynamics** — hành vi phát sinh khi người chơi vận hành các luật đó. *"Người chơi học được nhịp đánh-lùi-đánh."*
- **Aesthetics** — cảm xúc tạo ra. *"Căng thẳng, rồi thoả mãn khi làm chủ."*

## Điểm cốt lõi: hai chiều nhìn ngược nhau

**Người thiết kế** nhìn từ trái sang phải: chỉnh số → hy vọng dynamics thay đổi → hy vọng cảm xúc thay đổi.

**Người chơi** trải nghiệm từ phải sang trái: họ cảm nhận aesthetics trước, chỉ dần dần mới nhận ra mechanics.

Hệ quả thực tiễn: **thiết kế phải đi ngược** — bắt đầu từ cảm xúc bạn muốn, rồi mới truy ngược về luật chơi. Đó chính là nội dung của [[design-pillars]].

## Tám loại "vui" (thay cho từ "vui" mơ hồ)

LeBlanc liệt kê 8 dạng aesthetics — dùng chúng thay vì nói "game phải vui":

| Loại | Nghĩa | Game tiêu biểu |
|---|---|---|
| Sensation | Khoái cảm giác quan | Journey, Tetris Effect |
| Fantasy | Đóng vai, tin vào thế giới | Skyrim |
| Narrative | Kịch tính, diễn biến | Disco Elysium |
| Challenge | Vượt chướng ngại | Celeste, Souls |
| Fellowship | Cộng đồng, đồng đội | It Takes Two |
| Discovery | Khám phá | Outer Wilds |
| Expression | Thể hiện bản thân | Minecraft |
| Submission | Thư giãn, nhịp đều | Stardew Valley |

Chọn **2 loại chính** cho game của bạn. Chọn quá 3 là chưa quyết định gì.

## Dùng để chẩn đoán lỗi

Sức mạnh thật của MDA là khi game "sai sai" mà không rõ vì sao. Truy từ phải sang trái:

> **Aesthetic quan sát được:** người chơi thấy chán ở phút 10.
> **Dynamic nào gây ra?** Họ tìm được một chiến thuật an toàn và lặp lại mãi.
> **Mechanic nào cho phép?** Hồi máu không giới hạn + không có áp lực thời gian.
> **Sửa:** giới hạn số lần hồi máu mỗi phòng, hoặc thêm hao mòn theo thời gian.

Không có MDA, phản ứng thường thấy là "thêm nội dung mới" — trong khi vấn đề nằm ở một mechanic duy nhất.

## Ranh giới của mô hình

MDA bị phê bình vì coi dynamics như thứ suy ra được từ mechanics một cách khá cơ học. Thực tế dynamics phụ thuộc rất nhiều vào **văn hoá và kỳ vọng của người chơi** — cùng một bộ luật, cộng đồng speedrun và người chơi thường sinh ra dynamics hoàn toàn khác. Các mô hình sau này (DDE, Tension) bù lại phần này.

Dù vậy MDA vẫn là khung phổ biến nhất, và đủ dùng cho hầu hết dự án nhỏ.

## 🤖 Prompt cho AI

AI thao tác rất tốt ở tầng **Mechanics** (viết code theo số) và rất kém ở tầng **Aesthetics** (không cảm nhận được). Nó gần như mù ở tầng **Dynamics** — không dự đoán nổi người chơi sẽ lách luật thế nào.

Phân công hợp lý:

- **Bạn** quyết định Aesthetics và phán đoán Dynamics (cần playtest — xem [[playtesting-metrics]]).
- **AI** hiện thực hoá Mechanics và, nếu bạn mô tả rõ luật, có thể chạy mô phỏng để dò Dynamics: *"mô phỏng 10.000 trận với 3 build này, thống kê tỉ lệ thắng"*. Đây là cách dùng AI hiệu quả và ít bị đánh giá thấp — xem [[balancing-math]].
