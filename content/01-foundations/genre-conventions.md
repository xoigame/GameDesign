---
title: Quy ước thể loại
icon: 📚
summary: Kỳ vọng mặc định người chơi mang theo khi bước vào một thể loại — biết để dùng, và để cố ý phá.
status: stub
read: 70
level: basic
order: 60
tags: [foundations, genre]
related: [design-pillars, ux-hud]
---

Mỗi thể loại đi kèm một bộ kỳ vọng ngầm. Tuân theo thì người chơi hiểu game ngay mà không cần tutorial; phá vỡ thì phải trả giá bằng công sức dạy lại — và phải đáng.

## Cần bồi đắp

- [ ] Bảng quy ước theo thể loại: roguelike, metroidvania, deckbuilder, survivor-like, tower defense, idle
- [ ] Với mỗi thể loại: core loop chuẩn, độ dài phiên chơi kỳ vọng, mô hình tiến trình, layout UI mặc định
- [ ] Case study về phá vỡ quy ước thành công (Outer Wilds bỏ tiến trình vật phẩm, Hades kể chuyện qua cái chết)
- [ ] Đối chiếu quy ước theo nền tảng: mobile vs PC vs console

## Ghi chú tạm

Quy ước thể loại là **ngân sách tutorial miễn phí**. Người chơi deckbuilder đã biết thế nào là deck, draw, discard, energy. Dùng đúng từ vựng đó thì tiết kiệm được cả một màn hướng dẫn.

Ngược lại, mỗi lần phá vỡ quy ước, hãy tự hỏi: *điều này mua được gì cho [[design-pillars]] của tôi?* Nếu câu trả lời là "cho khác biệt" thì chưa đủ.

## 🤖 Prompt cho AI

Quy ước thể loại là **ngân sách tutorial miễn phí** — nhưng chỉ khi bạn nói rõ mình theo hay phá.

**Phải nêu rõ:**
- Thể loại tham chiếu + 2–3 game cụ thể ("giống Slay the Spire, không giống Hearthstone")
- Quy ước nào bạn **cố ý phá**, và phá để được gì
- Nền tảng đích — quy ước mobile khác PC rất nhiều

**Mẫu prompt**

```
Thể loại: deckbuilder roguelike. Tham chiếu: Slay the Spire, Monster Train.

Giữ nguyên quy ước: energy mỗi lượt, draw/discard/exhaust, bản đồ phân nhánh.
CỐ Ý PHÁ: không có relic. Sức mạnh chỉ đến từ cấu trúc deck.
  → mọi đề xuất dạng "vật phẩm cho buff thụ động" đều bị từ chối.

Liệt kê những gì người chơi deckbuilder sẽ MẶC ĐỊNH kỳ vọng mà game tôi
không có, để tôi biết chỗ nào cần dạy lại.
```

**Bẫy thường gặp:** nói "làm game roguelike" rồi ngạc nhiên khi AI thêm meta-progression cộng chỉ số. Quy ước ngầm của thể loại chính là thứ AI điền vào chỗ trống.

## 🎮 Unity

Trong Unity, quy ước thể loại quy về **chọn đúng package và template** ngay từ `New Project`. Chọn sai thì mất vài ngày làm lại.

**Template và package theo thể loại**

| Thể loại | Template | Package cần thêm |
|---|---|---|
| 2D platformer / roguelike | 2D (URP) | Input System, Cinemachine, TextMeshPro |
| 3D hành động | 3D (URP) | + AI Navigation, Cinemachine |
| Top-down 2D | 2D (URP) | + Tilemap Extras (Rule Tile) |
| Mobile casual | 2D/3D Mobile | + Addressables (giảm dung lượng build) |
| Multiplayer | bất kỳ | Netcode for GameObjects — xem [[unity-multiplayer]] |

**URP hay Built-in?** URP cho dự án mới, gần như không ngoại lệ — Built-in đang ở chế độ bảo trì. Chi tiết ở [[unity-lighting]].

**Package nên thêm ngay, đừng chờ**

```
com.unity.inputsystem        ← đổi phím, tay cầm. Thêm sau rất mệt.
com.unity.cinemachine        ← camera. Tự viết follow là lãng phí.
com.unity.textmeshpro        ← chữ. Text cũ không dùng cho dự án mới.
com.unity.ai.navigation      ← NavMesh (từ 2022 đã tách package)
```

Input System là cái đáng nhấn: nó đổi cách đọc input trên toàn bộ code. Thêm ở tháng thứ ba nghĩa là sửa mọi script có `Input.GetKey`. Xem [[unity-input]].

**Phá vỡ quy ước — chi phí trong Unity**

Quy ước thể loại thường trùng với **cái Unity làm sẵn**. Ví dụ:
- Muốn camera không theo nhân vật → không dùng được preset Cinemachine, phải tự viết
- Muốn UI không dùng Canvas → phải render bằng mesh, mất hết layout system

Không phải lý do để không phá vỡ, nhưng nên biết giá trước.

**Kiểm tra nhanh**
- Đã thêm Input System chứ? (không dùng `Input.GetKey` ở đâu)
- URP hay Built-in? Dự án mới nên URP.
- `Window > Package Manager`: có package nào cài mà không dùng không? (tăng thời gian build)
