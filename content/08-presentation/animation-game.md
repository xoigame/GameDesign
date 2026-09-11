---
title: Animation cho Game
icon: 🏃
summary: Animation game khác animation phim — responsiveness thắng độ mượt, và frame data là hợp đồng gameplay.
status: deep
read: 340
level: intermediate
order: 20
tags: [presentation, animation, feel]
related: [game-feel, combat-systems, art-direction]
---

Animator phim tối ưu cho **vẻ đẹp**. Animator game tối ưu cho **phản hồi**. Khi hai thứ xung đột, game luôn chọn phản hồi — và đó là điều khiến animation game trông "sai" với người quen làm phim.

## Luật số một: hành động bắt đầu ở frame 1

Người chơi bấm nút → nhân vật phải phản ứng **ngay**, không phải sau 12 frame chuẩn bị đẹp mắt.

```
❌ Phim:  anticipation (8f) → action (6f) → follow-through (10f)
✅ Game:  action bắt đầu f1 → anticipation nén vào 2-3f → follow-through
```

Nếu animation cần anticipation dài để trông có lực, hãy **giữ anticipation nhưng cho hitbox/hiệu ứng xuất hiện sớm**. Người chơi cảm nhận độ trễ qua thời điểm *kết quả* xảy ra, không qua animation.

Ngưỡng thực tế: phản hồi hình ảnh trong **≤2 frame (33ms)**. Trên 100ms là cảm thấy "lag" dù game chạy 60 FPS.

## Frame data là hợp đồng, không phải trang trí

Với game hành động, animation **là** luật chơi. Xem [[combat-systems]]:

```
Startup  →  Active  →  Recovery
```

Hệ quả thiết kế quan trọng: **animation phải khớp hitbox, và hitbox là nguồn chân lý.** Nếu animator kéo dài đòn đánh cho đẹp mà không sửa frame data, người chơi sẽ thấy "trúng mà không ăn sát thương" — lỗi cảm nhận nghiêm trọng nhất trong game hành động.

Quy trình đúng: **chốt frame data trước, animate theo sau.**

## Animation cancel — thứ phân biệt game hay và game ức chế

Cho phép huỷ animation là công cụ responsiveness mạnh nhất:

| Loại cancel | Khi nào | Tác dụng |
|---|---|---|
| Cancel vào né | Trong recovery | Người chơi không bị "khoá" sau khi đánh hụt |
| Cancel vào combo | Cuối active | Combo cảm thấy trôi chảy |
| Cancel khi trúng đòn | Bất kỳ lúc nào | Phản hồi bị đánh là tức thì |
| Turn cancel | Trong startup | Xoay hướng kịp khi kẻ địch di chuyển |

**Không cho cancel gì cả** = nhân vật cảm thấy nặng nề, mất kiểm soát.
**Cho cancel mọi thứ** = mọi đòn đánh mất trọng lượng, spam là tối ưu.

Bảng cancel nên nằm trong file dữ liệu, không trong code — xem [[data-driven-design]].

## Blend và transition

- **Idle → run:** blend 0.08–0.15s. Dài hơn là cảm thấy trượt băng.
- **Bất kỳ → bị đánh:** blend **0s**. Cắt thẳng. Phản hồi bị đánh không được mượt.
- **Run → idle:** có thể dài hơn (0.2s) vì không ảnh hưởng phản hồi.

Nguyên tắc: **transition vào trạng thái người chơi khởi xướng thì nhanh; transition ra thì có thể thong thả.**

## Root motion — cân nhắc kỹ

Root motion (vị trí do animation điều khiển) cho chuyển động tự nhiên, nhưng:
- Khó đồng bộ mạng
- Khó điều chỉnh tốc độ mà không phá animation
- Làm input phản hồi kém hơn

Với game hành động nhanh, **code-driven movement + animation phụ hoạ** thường đúng hơn. Root motion hợp với game nhịp chậm, coi trọng chân thực.

## Chi tiết nhỏ, hiệu quả lớn

- **Lệch pha animation giữa các NPC** — nếu 10 con cùng loại idle đồng bộ, trông như robot. Offset ngẫu nhiên 0–1s.
- **Additive layer** — thở, rung, lắc đầu chồng lên animation chính, rẻ mà sống động.
- **Bất đối xứng** — animation hoàn toàn đối xứng trông giả. Lệch nhẹ một bên.
- **Overshoot** — kết thúc động tác vượt quá đích rồi lùi lại 1–2 frame.

## 🤖 Prompt cho AI

AI **không xem được animation** nên đừng hỏi nó "trông có đẹp không". Nó làm tốt phần **hệ thống trạng thái, bảng cancel, và kiểm tra khớp frame data**.

**Phải nêu rõ:**
- Frame data đầy đủ (startup/active/recovery) — xem [[combat-systems]]
- Bảng cancel: từ trạng thái nào, trong cửa sổ nào, sang được gì
- Thời gian blend cho từng cặp transition, đặc biệt trường hợp blend = 0
- FPS tham chiếu (thường 60) và cách quy đổi frame ↔ giây

**Mẫu prompt**

```
Dựng animation state machine cho nhân vật người chơi. <Engine + phiên bản>.

Trạng thái: Idle, Run, JumpRise, JumpFall, Land, AttackLight, AttackHeavy, Dodge, Hurt

Frame data (60 FPS, nguồn chân lý là file attacks.json, KHÔNG hardcode):
  AttackLight  startup 8  active 4  recovery 12
  AttackHeavy  startup 24 active 6  recovery 32

Bảng cancel:
  AttackLight  recovery f1-f8   -> Dodge, AttackLight
  AttackHeavy  recovery f1-f12  -> Dodge
  BẤT KỲ       bất kỳ lúc nào   -> Hurt   (blend 0s, cắt thẳng)
  AttackLight  startup f1-f3    -> xoay hướng (turn cancel)

Blend time:
  Idle<->Run 0.10s | ->JumpRise 0.05s | Land->Idle 0.12s | ->Hurt 0s

RÀNG BUỘC:
- Hitbox bật/tắt do FRAME DATA điều khiển, KHÔNG do animation event
  (animation đổi không được làm đổi luật chơi)
- Không cho phép state nào khoá input quá 20 frame
- Offset idle ngẫu nhiên 0-1s khi spawn NPC

Kèm test: mọi đòn có active frame nằm trong [startup, startup+active];
không state nào không thoát được; mọi cặp transition có blend time khai báo.
```

**Bẫy thường gặp:** để animation event điều khiển hitbox. Khi đó animator sửa timing cho đẹp là vô tình đổi cân bằng game, và không ai truy ra được. Frame data phải là nguồn chân lý duy nhất.

## 🎮 Unity

Trong Unity, cái bẫy lớn nhất là để **Animator Controller quyết định luật chơi**.

**Component & nơi đặt**
- `Animator` + Animator Controller — chỉ lo hiển thị
- `AttackExecutor` (xem [[combat-systems]]) — giữ frame data, quyết định hitbox
- `AnimationConfig` (ScriptableObject) — bảng blend time

**Nguyên tắc: Animator là nô lệ, không phải chủ**

```csharp
// ✅ FSM/logic quyết định, animator chỉ nhận lệnh
anim.CrossFade("Attack_Light", 0f);     // blend 0 = phản hồi tức thì

// ❌ đọc trạng thái từ animator để ra quyết định gameplay
if (anim.GetCurrentAnimatorStateInfo(0).IsName("Attack")) { ... }
```

Cách thứ hai làm luật chơi phụ thuộc vào tên state trong một file binary mà không test được.

**Blend time — bảng thực dụng**

```csharp
[CreateAssetMenu(menuName = "Game/Animation Config")]
public class AnimationConfig : ScriptableObject {
    public float idleToRun   = 0.10f;
    public float toJump      = 0.05f;
    public float landToIdle  = 0.12f;
    public float toHurt      = 0f;      // CẮT THẲNG — phản hồi bị đánh không được mượt
    public float toAttack    = 0f;      // người chơi khởi xướng -> tức thì
}
```

`toHurt = 0` và `toAttack = 0` là hai giá trị quan trọng nhất. Blend mượt ở đây làm nhân vật cảm thấy trễ và mất kiểm soát.

**Animator settings dễ bỏ sót**

| Setting | Giá trị | Vì sao |
|---|---|---|
| `Culling Mode` | `Cull Update Transforms` | NPC ngoài màn hình không tốn CPU |
| `Update Mode` | `Normal` | `Unscaled Time` sẽ phá hitstop |
| Root Motion | **Tắt** cho game hành động | Xem bên dưới |
| `Has Exit Time` trên transition | **Bỏ tick** | Nguồn "input bị nuốt" phổ biến nhất |

**`Has Exit Time` là thủ phạm số một** của cảm giác "game không phản hồi": nó bắt animation chạy hết mới cho chuyển, nên input của người chơi bị nuốt. Bỏ tick, và điều khiển thời điểm chuyển bằng code.

**Root motion**

Bật root motion nghĩa là animation điều khiển vị trí. Với game hành động nhanh, thường nên **tắt** và dùng code:

```csharp
void OnAnimatorMove() {
    // Lấy rotation từ animation, giữ position do code điều khiển
    transform.rotation = anim.rootRotation;
}
```

**Lệch pha idle giữa các NPC**

```csharp
void Start() {
    // 10 con cùng loại idle đồng bộ trông như robot
    anim.Play("Idle", 0, Random.value);
}
```

Một dòng, và nó là khác biệt giữa "đám đông" và "dàn clone".

**Kiểm tra nhanh**
- Grep `GetCurrentAnimatorStateInfo` — dùng cho logic gameplay ở đâu không?
- Mọi transition đã bỏ `Has Exit Time` chưa?
- Bấm nút đánh giữa lúc animation khác đang chạy: có phản hồi trong 2 frame không?
- Hitstop có làm animation đứng theo không? (nếu không → Update Mode đang sai)
