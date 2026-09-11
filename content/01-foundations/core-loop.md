---
title: Core Loop
icon: 🔁
summary: Chuỗi hành động người chơi lặp lại liên tục — nếu vòng này không vui trong 30 giây, không hệ thống meta nào cứu nổi.
status: deep
read: 40
level: basic
order: 20
tags: [foundations, pillar, core]
related: [progression, player-motivation, game-feel]
---

**Core loop** là chuỗi hành động ngắn nhất mà người chơi lặp đi lặp lại. Nó là đơn vị vui nhỏ nhất của game.

Công thức tổng quát:

```
Hành động → Phản hồi → Phần thưởng → Năng lực mới → (quay lại) Hành động
```

## Ví dụ thật

| Game | Core loop |
|---|---|
| Vampire Survivors | Di chuyển né → tự động sát thương → nhặt gem → lên cấp chọn skill → né được nhiều hơn |
| Slay the Spire | Rút bài → đánh giá thế trận → chơi bài → dọn phòng → thêm bài vào deck |
| Hades | Vào phòng → chiến đấu → nhận boon → mạnh hơn → phòng khó hơn |
| Stardew Valley | Sáng tưới cây → ngày trôi → thu hoạch → bán → mua hạt tốt hơn |

Chú ý: cả bốn đều **mô tả được trong một câu**, và vòng lặp kết thúc bằng *năng lực tăng lên* chứ không chỉ là điểm số.

## Ba tầng lặp

Game tốt gần như luôn có nhiều vòng lặp lồng nhau theo thang thời gian khác nhau:

- **Micro (1–10 giây)** — một cú đánh, một lần nhảy, một lượt bài. Đây là nơi [[game-feel]] sống.
- **Mid (2–10 phút)** — một trận, một tầng hầm, một ngày trong game. Có mở đầu, cao trào, kết thúc rõ ràng.
- **Macro (nhiều giờ)** — mở khoá nhân vật, lên cấp tài khoản, cày trang bị. Đây là [[progression]].

Vòng micro giữ người chơi trong *phiên hiện tại*. Vòng macro kéo họ *quay lại ngày mai*. Thiếu micro → game chán ngay. Thiếu macro → chơi vài hôm rồi bỏ.

## Kiểm tra core loop của bạn

1. **Test 30 giây** — trong 30 giây đầu, người chơi đã thực hiện trọn vẹn vòng lặp ít nhất một lần chưa?
2. **Test không phần thưởng** — tắt hết điểm, XP, loot. Hành động cốt lõi còn vui không? Nếu không, bạn đang dùng phần thưởng để che một cơ chế nhạt. Phần thưởng khuếch đại niềm vui, không tạo ra nó.
3. **Test một câu** — mô tả vòng lặp trong một câu không có chữ "và". Không làm được nghĩa là loop chưa rõ.
4. **Test lần thứ 100** — lần lặp thứ 100 có khác lần thứ nhất không? Nếu giống hệt, bạn cần thêm biến số ([[randomness]]) hoặc chiều sâu quyết định.

## 🤖 Prompt cho AI

Đây là mục **AI hay bịa nhất**. Hãy khai báo tường minh trong [[gdd-for-ai]]:

```yaml
core_loop:
  micro:
    action: "Nhấn chuột trái để chém, cooldown 0.4s"
    feedback: "hitstop 90ms + screenshake 6px + số sát thương bay lên"
    reward: "rơi 1-3 mảnh linh hồn"
  mid:
    unit: "một phòng (~90 giây), 3-6 quái"
    resolution: "dọn sạch phòng → chọn 1 trong 3 buff"
  macro:
    unit: "một run (~25 phút)"
    persistence: "linh hồn còn lại sau khi chết dùng mở khoá vĩnh viễn"
```

Số cụ thể như `0.4s`, `90ms`, `1-3 mảnh` là thứ biến prompt mơ hồ thành code chạy đúng ngay lần đầu. Xem thêm [[prompt-patterns]].
