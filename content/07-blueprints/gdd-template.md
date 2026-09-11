---
title: GDD Template
icon: 📄
summary: Mẫu tài liệu thiết kế sẵn sàng cho AI đọc — sao chép, điền vào, chỉ agent tới đó.
status: deep
read: 150
level: basic
order: 10
tags: [blueprint, template, key]
related: [gdd-for-ai, design-pillars, agent-guardrails]
---

Sao chép toàn bộ khối dưới đây thành `content/07-blueprints/<tên-game>.md` rồi điền. Phần trong `<>` là chỗ cần thay.

---

```markdown
---
title: <Tên game>
icon: 🎮
summary: <Một câu mô tả>
status: deep
tags: [blueprint]
---

# <Tên game> — GDD

## 0. TL;DR
<Thể loại>, <nền tảng>, phiên chơi <X phút>.
Điểm khác biệt: <một câu — thứ game này làm mà game khác không làm>.

## 1. Design Pillars — BẤT KHẢ XÂM PHẠM

1. **<Pillar 1>**
   Loại trừ: <tính năng A>, <tính năng B>
2. **<Pillar 2>**
   Loại trừ: <...>
3. **<Pillar 3>**
   Loại trừ: <...>

> Agent: nếu một đề xuất mâu thuẫn với pillar nào, hãy TỪ CHỐI
> và nói rõ pillar nào bị vi phạm.

## 2. Core Loop

### Micro (<X> giây)
- Hành động: <...>
- Phản hồi: <hitstop Xms, screenshake Xpx, âm thanh Y>
- Phần thưởng: <...>

### Mid (<X> phút)
- Đơn vị: <một phòng / một trận / một ngày>
- Kết thúc khi: <...>
- Người chơi nhận: <...>

### Macro (<X> giờ)
- Đơn vị: <một run / một chương>
- Giữ lại sau khi kết thúc: <...>

## 3. Hệ thống

### 3.1 <Tên hệ thống>
- **Mục đích:** <phục vụ động lực nào — xem [[player-motivation]]>
- **Đầu vào:** <...>
- **Đầu ra:** <...>
- **Công thức:**
  ```
  <công thức cụ thể>
  ```
- **Bảng số:**

  | Cấp | Giá trị | Chi phí |
  |---|---|---|
  | 1 | | |

### 3.2 <Hệ thống tiếp theo>
...

## 4. Nội dung

### Kẻ địch

| Id | HP | DMG | Tốc độ | Telegraph | Cách đối phó | Ngân sách |
|---|---|---|---|---|---|---|
| grunt | 30 | 8 | 3.0 | 400ms vung tay | né | 2 |

### Vật phẩm / kỹ năng

| Id | Loại | Hiệu ứng | Chi phí | Độ hiếm |
|---|---|---|---|---|

## 5. Ràng buộc kỹ thuật

- Engine: <tên + PHIÊN BẢN CHÍNH XÁC>
- Ngôn ngữ: <...>
- Nền tảng đích: <...>
- Ngân sách hiệu năng: <FPS mục tiêu>, tối đa <N> thực thể đồng thời
- Cấu trúc dữ liệu: <ScriptableObject / JSON / CSV — xem [[data-driven-design]]>

## 6. BẤT BIẾN — không vi phạm nếu chưa hỏi

| Id | Luật | Cách phát hiện vi phạm |
|---|---|---|
| INV-01 | <...> | <...> |
| INV-02 | <...> | <...> |

## 7. KHÔNG thuộc phạm vi

Game này KHÔNG có:
- <...>
- <...>

> Agent: đừng thêm những thứ trên, kể cả khi chúng "thường có" ở thể loại này.

## 8. Nhật ký quyết định

### <YYYY-MM-DD> — <Quyết định>
Cân nhắc: <A vs B>
Chọn: <...>
Lý do: <...>
Xem lại nếu: <điều kiện>

## 9. Đang bỏ ngỏ

- ❓ <câu hỏi chưa chốt — agent phải HỎI, không tự quyết>
```

---

## Ba mục quan trọng nhất

Nếu chỉ có thời gian điền ba mục, hãy chọn:

**Mục 1 — Design Pillars.** Không có nó, AI cho ra game generic. Phần *"Loại trừ"* quan trọng ngang phần khẳng định.

**Mục 6 — Bất biến.** Không có nó, agent sẽ vô tình phá thiết kế của bạn trong lúc "giúp". Cột *"Cách phát hiện"* biến nguyện vọng thành luật kiểm tra được — xem [[agent-guardrails]].

**Mục 7 — Không thuộc phạm vi.** Không có nó, agent thêm tính năng theo mặc định của ngành. Đây là mục ít người viết nhất và tiết kiệm nhiều thời gian nhất.

## Cách chỉ agent tới tài liệu

Trong `CLAUDE.md` ở gốc repo game (không phải repo này):

```markdown
# Dự án <Tên game>

Trước khi làm bất cứ việc gì, đọc:
1. `design/GDD.md` — tài liệu thiết kế đầy đủ
2. Mục 1 (Pillars), 6 (Bất biến), 7 (Ngoài phạm vi) là RÀNG BUỘC CỨNG

Nếu một yêu cầu mâu thuẫn với các mục trên, hãy DỪNG và hỏi tôi.
```

## 🤖 Prompt cho AI

Template này được thiết kế để **dán thẳng vào prompt**. Ba mục dưới đây là phần agent phải tuân thủ.

**Mẫu prompt dùng template**

```
Đây là GDD của dự án: <dán mục 1, 2, 5, 6, 7 — bỏ phần chưa điền>

Trước khi làm bất cứ việc gì, xác nhận lại với tôi:
1. Nhắc lại 3 Design Pillars và những gì mỗi cái LOẠI TRỪ
2. Liệt kê mọi bất biến INV-xx, và với mỗi cái nói bạn sẽ tự kiểm tra thế nào
3. Liệt kê mọi mục tôi để trống hoặc đánh ❓

Nếu một yêu cầu của tôi sau này mâu thuẫn với các mục trên,
DỪNG LẠI và chỉ ra mục nào bị vi phạm. Đừng âm thầm làm theo.
```

**Kiểm tra template đã điền đủ chưa**

```
Đọc GDD của tôi. Chấm điểm mức độ sẵn sàng cho agent theo từng mục:
  ĐỦ   — agent code được ngay, không phải đoán
  THIẾU SỐ — có mô tả nhưng thiếu giá trị cụ thể
  MƠ HỒ — agent sẽ phải tự bịa

Với mỗi mục THIẾU SỐ hoặc MƠ HỒ, hỏi tôi đúng câu hỏi cần thiết để điền vào.
Ưu tiên theo thứ tự: Pillars > Bất biến > Ngoài phạm vi > Core loop > còn lại.
```

**Bẫy thường gặp:** điền mục 3 và 4 (hệ thống, nội dung) thật chi tiết nhưng bỏ trống mục 1, 6, 7. Đó là ba mục quyết định game của bạn khác game generic — thiếu chúng thì mọi chi tiết còn lại chỉ là trang trí.

## 🎮 Unity

Template ở trên là bản chung. Với Unity, thêm **mục 5b** dưới đây — đây là mục agent cần nhất và hay thiếu nhất.

**Mục 5b — dán vào GDD của bạn**

```markdown
## 5b. Trạng thái Unity project (agent KHÔNG đọc được, đây là sự thật)

### Phiên bản
Unity        6000.0.32f1
Render       URP 17.x        (hoặc: Built-in / HDRP)
Packages     Input System 1.8 · Cinemachine 3.1 · TextMeshPro 3.2
             AI Navigation 2.0 · (Addressables: không dùng)

### Project Settings
Color Space       Linear
Fixed Timestep    0.01667
Max Allowed TS    0.1
Target Frame Rate 60
Active Input       Input System Package (Input Manager cũ TẮT)

### Layer & Collision
6  Player          9  EnemyProj
7  Enemy          10  Hazard
8  PlayerProj     11  Interactable
TẮT va chạm: Player↔PlayerProj · Enemy↔EnemyProj · PlayerProj↔EnemyProj

### Tags
PlayerSpawn · LevelExit · Landmark

### Assembly Definition
Game.Core    noEngineReferences: true     ← logic thuần, test EditMode
Game.Unity   refs: Game.Core, InputSystem, Cinemachine
Game.Editor  refs: Game.Unity

### AudioMixer
Master > [ Music, SFX > (Player, Enemy, World), UI, Ambience ]
Exposed params: MusicVol, SfxVol, UiVol, AmbienceVol

### Chuyển động
Rigidbody2D  hay  tự viết?  → <chọn một>
Nếu Rigidbody: Collision Detection = Continuous, Interpolate = Interpolate

### UI
UGUI  hay  UI Toolkit?  → <chọn một>
CanvasScaler: Scale With Screen Size · 1920x1080 · Match = 1 (chiều cao)
```

**Vì sao mục này quan trọng nhất trong GDD Unity**

Mỗi dòng là một lỗi cụ thể agent sẽ mắc nếu thiếu:

| Thiếu dòng | Lỗi agent mắc |
|---|---|
| Phiên bản | Dùng `rb.velocity` (đã đổi tên ở Unity 6) |
| Active Input | Viết `Input.GetKey`, không chạy |
| Layer number | Đặt layer sai, va chạm không xảy ra |
| Collision matrix | Đạn người chơi tự bắn trúng người chơi |
| Exposed params | `SetFloat` trả về false, im lặng không làm gì |
| Assembly | `using UnityEngine` trong Core → lỗi compile |
| Color Space | Màu hiệu ứng trông sai |

**Kiểm tra template đã đủ cho Unity chưa**

```
Đọc GDD của tôi. Đóng vai agent sắp viết code Unity từ tài liệu này.

Liệt kê mọi thứ bạn PHẢI TỰ ĐOÁN vì tài liệu không nói — đặc biệt các thứ
chỉ tồn tại trong Unity Editor mà không nằm trong code:
ProjectSettings, layer, collision matrix, Animator, AudioMixer,
Assembly Definition, import settings.

Với mỗi chỗ, nói bạn sẽ mặc định chọn gì và hậu quả nếu đoán sai.
Đừng sửa tài liệu.
```

**Kiểm tra nhanh**
- Mục 5b đã điền chưa? Layer có ghi đúng số chưa?
- Đã nêu Input System mới hay cũ chưa?
- Đã nêu Rigidbody hay tự viết chuyển động chưa?
