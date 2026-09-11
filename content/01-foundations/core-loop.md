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

<figure class="fig">
<svg viewBox="0 0 660 200" role="img" aria-label="Vòng lặp bốn bước: Hành động, Phản hồi, Phần thưởng, Năng lực mới, rồi quay lại Hành động">
  <defs>
    <marker id="cl-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="14"  y="26" width="140" height="54" rx="9" class="fig-box"/>
    <rect x="184" y="26" width="140" height="54" rx="9" class="fig-box"/>
    <rect x="354" y="26" width="140" height="54" rx="9" class="fig-box"/>
    <rect x="524" y="26" width="122" height="54" rx="9" class="fig-box"/>
  </g>
  <text x="84"  y="49" text-anchor="middle" class="fig-label" font-size="14">Hành động</text>
  <text x="84"  y="68" text-anchor="middle" class="fig-muted" font-size="11">bấm nút</text>
  <text x="254" y="49" text-anchor="middle" class="fig-label" font-size="14">Phản hồi</text>
  <text x="254" y="68" text-anchor="middle" class="fig-muted" font-size="11">hitstop, âm thanh</text>
  <text x="424" y="49" text-anchor="middle" class="fig-label" font-size="14">Phần thưởng</text>
  <text x="424" y="68" text-anchor="middle" class="fig-muted" font-size="11">loot, XP</text>
  <text x="585" y="49" text-anchor="middle" class="fig-label" font-size="14">Năng lực mới</text>
  <text x="585" y="68" text-anchor="middle" class="fig-muted" font-size="11">mạnh hơn</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cl-a)" fill="none">
    <path d="M156 53 H180"/>
    <path d="M326 53 H350"/>
    <path d="M496 53 H520"/>
    <path d="M585 82 V132 Q585 150 567 150 H102 Q84 150 84 132 V86"/>
  </g>
  <text x="334" y="172" text-anchor="middle" class="fig-muted" font-size="11">
    lặp lại hàng nghìn lần — mỗi vòng người chơi phải mạnh hơn một chút
  </text>
</svg>
<figcaption>Vòng lặp khép kín: điểm mấu chốt là mũi tên quay về — nếu vòng kết thúc ở &ldquo;phần thưởng&rdquo; mà năng lực không đổi, đó chỉ là điểm số chứ chưa phải core loop.</figcaption>
</figure>

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

## 🎮 Unity

Core loop trong Unity là câu hỏi **vòng lặp nào chạy ở đâu**. Đặt sai tầng là nguồn bug timing khó truy.

**Ba tầng lặp → ba nơi trong Unity**

| Tầng | Unity | Lưu ý |
|---|---|---|
| Micro (1–10s) | `Update` / `FixedUpdate` | Frame data ở `FixedUpdate`, xem [[combat-systems]] |
| Mid (2–10 phút) | State máy cấp scene | Không `DontDestroyOnLoad` |
| Macro (nhiều giờ) | State máy cấp app + save | Bootstrap scene, xem [[unity-game-loop]] |

**Vòng micro: `Update` hay `FixedUpdate`?**

```csharp
// Input: Update (bắt mọi lần bấm, kể cả frame nhanh)
void Update() {
    if (input.AttackPressed) queuedAttack = true;     // BUFFER, không xử lý ngay
}

// Luật chơi: FixedUpdate (tất định, 60Hz)
void FixedUpdate() {
    if (queuedAttack) { queuedAttack = false; ExecuteAttack(); }
}
```

Đọc input trong `FixedUpdate` sẽ **bỏ lỡ** lần bấm nếu frame rate cao hơn 60. Xử lý luật trong `Update` thì frame rate cao/thấp cho kết quả khác nhau. Buffer trong `Update`, xử lý trong `FixedUpdate` là cách đúng — và nó cũng chính là `input buffer` ở [[game-feel]].

**Vòng mid: state máy cấp scene, không cờ rải rác**

```csharp
public enum RoomState { Entering, Fighting, Cleared, Rewarding, Exiting }

// Một enum, một chỗ chuyển. KHÔNG dùng bool isFighting + bool isCleared —
// hai cờ cho bốn trạng thái, hai trong đó vô nghĩa.
```

**Vòng macro: bootstrap + additive scene**

```csharp
// Bootstrap scene sống suốt, chứa AudioManager/ConfigLoader/SaveSystem.
// Scene gameplay load additive và unload khi hết run.
await SceneManager.LoadSceneAsync("Run", LoadSceneMode.Additive);
```

Chi tiết ở [[unity-game-loop]]. Điểm quan trọng: **đừng `DontDestroyOnLoad` từng manager một** — chúng sẽ nhân bản khi load lại scene. Một bootstrap scene giải quyết gọn.

**Bẫy Unity cụ thể**
- **Đọc input trong `FixedUpdate`** → mất input ở frame rate cao.
- **`Time.deltaTime` trong `FixedUpdate`** → dùng `Time.fixedDeltaTime`.
- **`DontDestroyOnLoad` nhiều manager** → nhân bản sau khi load scene lại.
- **Hitstop bằng `timeScale = 0`** làm `FixedUpdate` dừng — đúng ý, nhưng coroutine phải dùng `WaitForSecondsRealtime`.

**Kiểm tra nhanh**
- Chạy ở 240 FPS (tắt vsync): bấm tấn công nhanh có mất input không?
- Load lại scene gameplay: có manager nào bị nhân đôi không?
- `Time.fixedDeltaTime` dùng đúng trong `FixedUpdate` chứ?
