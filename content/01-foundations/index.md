---
title: Nền tảng Game Design
icon: 🎯
summary: Những nguyên lý phải nắm trước khi viết dòng code đầu tiên — core loop, động lực người chơi, MDA, game feel.
status: deep
read: 20
level: basic
order: 10
tags: [foundations]
related: [systems, blueprints]
---

Nhánh này trả lời câu hỏi **"cái gì làm một trò chơi trở nên đáng chơi?"**. Nó đứng trước mọi quyết định kỹ thuật.

## Thứ tự nên đi

1. **[[design-pillars]]** — chốt 3 câu mô tả game của bạn. Mọi quyết định sau đều phải quy chiếu về đây.
2. **[[core-loop]]** — vòng lặp người chơi lặp lại hàng nghìn lần. Nếu vòng này chán, không gì cứu được.
3. **[[player-motivation]]** — vì sao người ta chơi tiếp. Quyết định bạn xây hệ thống gì ở [[systems]].
4. **[[game-feel]]** — độ "đã tay". Khác biệt giữa prototype và game thật thường nằm ở đây, không nằm ở tính năng.
5. **[[mda-framework]]** — ngôn ngữ chung để phân tích: luật chơi nào sinh ra trải nghiệm nào.
6. **[[prototyping]]** — cách kiểm chứng nhanh trước khi đầu tư lớn.

## Sai lầm phổ biến

**Bắt đầu từ tính năng thay vì từ trải nghiệm.** "Game của tôi có crafting, có pet, có PvP" không phải là thiết kế — đó là danh sách mua sắm. Thiết kế là: *"người chơi sẽ cảm thấy gì, vào phút thứ 3, phút thứ 30, và giờ thứ 30?"*

**Nhầm độ phức tạp với chiều sâu.** Thêm 40 chỉ số làm game *phức tạp*. Chiều sâu là khi ít luật sinh ra nhiều tình huống đáng suy nghĩ — cờ vây có 2 luật.

**Bỏ qua 30 giây đầu.** Phần lớn người chơi rời đi trước phút thứ 5. Vòng lặp cốt lõi phải cảm nhận được *ngay*, trước khi mọi hệ thống meta kịp mở khoá.

## 🤖 Prompt cho AI

**Dùng AI thế nào ở nhánh này**

Đây là nhánh AI ít hữu dụng nhất cho việc *quyết định* và hữu dụng nhất cho việc *phản biện*. Dùng nó như một publisher hoài nghi, không như người viết hộ.

Ba việc cụ thể: phản biện pillar (pillar nào không loại trừ được gì?), chỉ ra phiên bản generic của ý tưởng bạn, và truy vấn ngược từ trải nghiệm về cơ chế. Xem [[ai-for-design]].

**Không** nhờ: chốt pillar, đánh giá "có vui không", tinh chỉnh game feel. Xem [[ai-limits]].

AI viết code rất nhanh nhưng **không có trực giác về cảm giác chơi**. Nó không biết animation lag 80ms làm cú đấm mất lực. Vì vậy phần này bạn phải tự quyết định và **viết ra thành số cụ thể** trong [[gdd-for-ai]] — ví dụ "hitstop 90ms, screenshake biên độ 6px trong 120ms" — thay vì mô tả "cho nó đã tay".

## 🎮 Unity

Nhánh này đứng **trước** khi mở Unity. Nhưng ba quyết định ở đây có hệ quả trực tiếp lên project settings, nên biết trước thì đỡ phải làm lại.

**Quyết định thiết kế → project setting**

| Quyết định | Setting bị ảnh hưởng |
|---|---|
| Game có frame data (combat chính xác) | `Time > Fixed Timestep = 0.01667` |
| Game 2D pixel art | `Player > Color Space`, pixels-per-unit, Filter Mode Point |
| Game mobile | `Player > Target Frame Rate`, Graphics API, texture compression |
| Có tay cầm / đổi phím | Input System từ ngày đầu — xem [[unity-input]] |

**Prototype nhanh trong Unity — đừng dựng project "đúng chuẩn"**

Ở giai đoạn [[prototyping]], project sạch sẽ là phản tác dụng. Cách nhanh nhất:

```
Assets/
├── _Proto/          ← tất cả ở đây, không chia thư mục
│   ├── Proto.unity
│   └── Proto.cs     ← một file, mọi thứ trong đó
```

Một scene, một script, hình khối màu. Mục tiêu là trả lời **một câu hỏi** (xem [[prototyping]]), không phải dựng nền móng. Khi câu trả lời là "có, cơ chế này vui", lúc đó mới dựng cấu trúc thật theo [[unity-project-structure]].

Thư mục tên `_Proto` (gạch dưới) để sau này grep và xoá dễ.

**Reset nhanh — thứ quan trọng nhất của prototype**

```csharp
void Update() {
    if (Input.GetKeyDown(KeyCode.R)) SceneManager.LoadScene(0);   // reset tức thì
    if (Input.GetKeyDown(KeyCode.Alpha1)) variant = 0;            // đổi biến thể
    if (Input.GetKeyDown(KeyCode.Alpha2)) variant = 1;
}
```

Vòng lặp đánh giá ngắn quan trọng hơn code đẹp. Xem [[prototyping]].

**Kiểm tra nhanh**
- Prototype reset được trong dưới 1 giây chứ?
- Đổi được giữa các biến thể cơ chế bằng một phím chứ?
- Đã chốt Fixed Timestep trước khi làm combat chưa?
