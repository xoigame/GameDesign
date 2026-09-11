---
title: Combat Systems
icon: ⚔️
summary: Giải phẫu một hệ thống chiến đấu — frame data, telegraph, tam giác khắc chế, và cách làm nó đọc được.
status: deep
read: 190
level: intermediate
order: 30
tags: [systems, combat]
related: [game-feel, balancing-math, behavior-tree, difficulty-curve]
---

Chiến đấu tốt là một **cuộc hội thoại**: kẻ địch nói (ra đòn), người chơi trả lời (né/đỡ/phản), và cả hai bên đều hiểu ngôn ngữ đó.

## Giải phẫu một đòn đánh

Mọi hành động chiến đấu chia làm ba giai đoạn:

```
Startup  →  Active  →  Recovery
(vung lên)  (gây dmg)  (thu về)
```

- **Startup** là *telegraph* — thứ người chơi đọc để phản ứng. Đây là giai đoạn quan trọng nhất về mặt thiết kế.
- **Active** là cửa sổ gây sát thương thực.
- **Recovery** là cửa sổ trừng phạt — nơi đối phương được thưởng vì đã né đúng.

Bảng tham chiếu thực tế (ở 60 FPS):

| Loại đòn | Startup | Active | Recovery | Ghi chú |
|---|---|---|---|---|
| Đòn nhẹ | 6–10f (100–166ms) | 3–5f | 10–14f | Phải cảm thấy tức thì |
| Đòn nặng | 18–30f (300–500ms) | 5–8f | 25–40f | Phạt nặng nếu hụt |
| Đòn boss chí mạng | 45–70f (750ms–1.2s) | 6–10f | 40–60f | Cần đủ dài để đọc được |

**Luật vàng:** telegraph của kẻ địch phải dài hơn **thời gian phản ứng của con người + thời gian thực hiện hành động né**. Thời gian phản ứng thị giác trung bình là 250ms; người chơi bình thường cần ~400ms để nhận biết + bấm. Telegraph dưới 300ms là không phản ứng được — chỉ ghi nhớ được. Đó là lựa chọn thiết kế hợp lệ, nhưng phải cố ý.

## Đọc được là ưu tiên số một

Người chơi cần trả lời 3 câu hỏi trong mọi khoảnh khắc:

1. **Tôi có đang bị nhắm không?** — dùng hướng nhìn, chỉ báo, âm thanh riêng.
2. **Đòn gì đang tới?** — mỗi đòn cần một hình bóng (silhouette) khác biệt, không chỉ khác animation.
3. **Tôi phải làm gì?** — telegraph phải ánh xạ nhất quán tới hành động đúng (ví dụ: ánh đỏ = không đỡ được, phải né).

Nếu phải chọn giữa đẹp và đọc được, luôn chọn đọc được.

## Tam giác khắc chế

Cấu trúc kéo-búa-bao ép người chơi phải đọc tình huống thay vì spam một nút:

```
Đòn thường  →  thắng  →  Đỡ chậm
Đòn phá đỡ  →  thắng  →  Đỡ
Đỡ          →  thắng  →  Đòn thường
```

Đây là bộ khung tối thiểu tạo ra chiều sâu mà không cần thêm cơ chế. Mở rộng bằng khoảng cách (gần/xa), độ cao, hoặc tài nguyên (stamina).

## Tài nguyên tạo quyết định

Chiến đấu không có tài nguyên sẽ thoái hoá thành spam đòn tối ưu. Các tài nguyên thường dùng:

- **Stamina** — giới hạn cả tấn công lẫn né. Tạo nhịp điệu tự nhiên.
- **Poise / Stagger** — thanh ẩn, đầy thì kẻ địch choáng. Thưởng cho áp lực liên tục.
- **Vị trí** — tài nguyên rẻ nhất và bị đánh giá thấp nhất. Bản đồ có chướng ngại tạo ra quyết định mà không cần thêm chỉ số nào.

## Kiểm tra chất lượng

- **Test dừng khung hình** — dừng game giữa trận. Có đoán được chuyện gì sắp xảy ra không? Nếu không, telegraph chưa đủ rõ.
- **Test một nút** — chỉ bấm nút tấn công. Nếu thắng được, hệ thống thiếu áp lực.
- **Test tắt tiếng** — tắt loa. Còn chơi được không? Nếu không, bạn đang dồn quá nhiều thông tin vào âm thanh (và đây cũng là vấn đề trợ năng).
- **Test lỗi có chủ ý** — cố ý đánh hụt. Hình phạt có tương xứng và dễ hiểu không?

## 🤖 Prompt cho AI

Frame data là thứ AI thực thi chính xác — hãy đưa đúng dạng bảng:

```yaml
attacks:
  light:
    startup_frames: 8
    active_frames: 4
    recovery_frames: 12
    damage: 12
    stamina_cost: 10
    cancelable_into: [light, dodge]
  heavy:
    startup_frames: 24
    active_frames: 6
    recovery_frames: 32
    damage: 34
    armor_frames: [10, 24]     # không bị gián đoạn trong khoảng này
    cancelable_into: []

enemy.brute:
  telegraph:
    slam:  { windup_ms: 900, tell: "phát sáng đỏ + tiếng gầm", counter: "dodge" }
    sweep: { windup_ms: 600, tell: "cúi thấp",                 counter: "jump" }
```

Trường `counter` là thứ biến bảng số thành một **hợp đồng thiết kế**: mỗi đòn kẻ địch phải có đúng một câu trả lời rõ ràng. Yêu cầu agent kiểm tra bất biến này khi thêm kẻ địch mới — xem [[agent-guardrails]].
