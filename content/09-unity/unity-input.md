---
title: Input System
icon: 🕹️
summary: Chọn Input System mới từ ngày đầu, gom mọi cách đọc về một InputReader duy nhất, và đừng đọc nút bấm trong FixedUpdate — phần lớn "input bị nuốt" là ở đó.
status: deep
read: 660
level: basic
order: 70
tags: [unity, input, ux]
related: [game-feel, accessibility, ux-flow, unity-game-loop]
---

Quyết định quan trọng nhất không phải "package nào" — câu đó đã có đáp án — mà là **input đi vào game qua đúng một cửa**. Dự án có `Input.GetKey` trong 5 script, `PlayerInput` Unity Events trong 3 prefab, và `action.ReadValue` rải trong controller là dự án không bao giờ làm được rebinding, không chuyển được sang tay cầm, và không pause được cho đúng. Một lớp `InputReader` là điểm duy nhất chạm vào Input System; phần còn lại của game chỉ biết `Move`, `JumpPressed`, `Attack` — không biết phím nào.

## Mới hay cũ — và cái bẫy "Both"

**Input System** (package, 1.x) thắng Input Manager cũ ở mọi thứ cần cho game ship được: rebinding, control scheme, nhiều tay cầm, touch, và event thay cho polling. Cái duy nhất cũ làm tốt hơn là *bắt đầu nhanh* — 1 dòng `Input.GetAxis("Horizontal")` — và đó chính là cách nó lọt vào dự án.

`Project Settings > Player > Active Input Handling` có ba giá trị. **"Both"** là bẫy: cả `UnityEngine.Input` lẫn package đều chạy, nên team viết lẫn lộn mà không ai bị báo lỗi, `EventSystem` với `StandaloneInputModule` cũ vẫn hoạt động, và bạn phát hiện ra sau 4 tháng khi làm rebinding. Đặt **"Input System Package (New)"**: mọi `Input.GetKey` ném `InvalidOperationException` ngay — đó là tính năng, không phải lỗi.

## Action Map theo ngữ cảnh

Một asset `.inputactions` với ít nhất hai map: **Player** (Move, Jump, Attack, Interact, Pause) và **UI** (Navigate, Submit, Cancel, Point, Click — Unity sinh sẵn). Thường thêm **Menu**/**Dialogue** nếu ngữ cảnh đó có nút riêng. Bệnh kinh điển "mở menu, bấm A để chọn, nhân vật phía sau nhảy" là vì cả hai map cùng bật. Mở menu = tắt Player, bật UI; đóng = ngược lại. Không bật hai map có phím trùng cùng lúc, trừ map "Global" chỉ chứa Pause/Screenshot.

`Pause` nằm ở map Player, `Unpause` (cùng phím) nằm ở map UI — hai action, cùng binding, không bao giờ cùng bật, nên không có chuyện bấm một lần mở-đóng-mở.

## Ba cách đọc — chọn một

| Cách | Ưu | Nhược | Dùng khi |
|---|---|---|---|
| **Generated C# class** (tick "Generate C# Class" trên asset) | Kiểu tĩnh, đổi tên action là lỗi biên dịch, không tham chiếu scene | Phải commit file sinh ra; một instance mỗi người chơi | **Mặc định.** Mọi game 1 người chơi |
| `PlayerInput` component + Unity Events / Send Messages | Kéo thả, tự chia thiết bị cho local co-op, `onControlsChanged` sẵn | Logic trong Inspector không grep được; Send Messages dùng reflection theo tên | Local co-op split-device 2–4 người |
| Polling `action.ReadValue<T>()` / `WasPressedThisFrame()` mỗi frame | Đơn giản, giống Input cũ | Phải giữ tham chiếu action; dễ rải khắp nơi | Bên trong InputReader, không ở nơi khác |

Khuyến nghị: generated class bọc trong **một ScriptableObject `InputReader`**, mọi hệ thống tham chiếu asset này qua Inspector. ScriptableObject sống xuyên scene, không cần singleton, mock được trong test.

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

[CreateAssetMenu(menuName = "Game/Input Reader")]
public class InputReader : ScriptableObject, GameInput.IPlayerActions {
    GameInput input;                                   // class sinh từ GameInput.inputactions

    public Vector2 Move { get; private set; }
    public bool JumpHeld { get; private set; }
    public event System.Action JumpPressed, AttackPressed, PausePressed;

    float jumpBufferedAt = -10f;

    void OnEnable() {
        if (input == null) { input = new GameInput(); input.Player.SetCallbacks(this); }
        EnableGameplay();
    }
    void OnDisable() { input?.Disable(); Move = Vector2.zero; JumpHeld = false; }   // SO giữ state xuyên Play khi tắt Domain Reload

    public void EnableGameplay() { input.UI.Disable(); input.Player.Enable(); }
    public void EnableUI()       { input.Player.Disable(); input.UI.Enable(); Move = Vector2.zero; }

    public void OnMove(InputAction.CallbackContext ctx) => Move = ctx.ReadValue<Vector2>();

    public void OnJump(InputAction.CallbackContext ctx) {
        if (ctx.performed) { JumpHeld = true; jumpBufferedAt = Time.unscaledTime; JumpPressed?.Invoke(); }
        else if (ctx.canceled) JumpHeld = false;
    }
    public void OnAttack(InputAction.CallbackContext ctx) { if (ctx.performed) AttackPressed?.Invoke(); }
    public void OnPause(InputAction.CallbackContext ctx)  { if (ctx.performed) PausePressed?.Invoke(); }
    public void OnInteract(InputAction.CallbackContext ctx) { }

    /// Input buffer: nhấn trong `window` giây gần đây thì tính, và tiêu thụ luôn.
    public bool ConsumeJump(float window = 0.12f) {
        if (Time.unscaledTime - jumpBufferedAt > window) return false;
        jumpBufferedAt = -10f;
        return true;
    }
}
```

Phải implement **mọi** phương thức của `IPlayerActions`, kể cả để trống — thêm action vào asset là lỗi biên dịch nhắc bạn xử lý. Đó là lý do chọn interface thay cho `action.performed += …` từng cái.

## "Pressed this frame" và bẫy FixedUpdate

`action.WasPressedThisFrame()` trả `true` trong **frame render** có sự kiện nhấn. Gọi nó trong `FixedUpdate` thì: frame có 2 bước physics → nhảy đôi; frame không có bước physics nào → mất nhấn. Đây là nguồn phổ biến nhất của "thỉnh thoảng bấm nhảy không nhảy" và không tái hiện được vì phụ thuộc FPS. Cách đúng đã ở [[unity-physics]]: đọc trong callback/`Update`, giữ cờ hoặc timestamp, tiêu thụ trong `FixedUpdate`. `ConsumeJump` ở trên là dạng có buffer sẵn — 100–150ms theo [[game-feel]].

`InputSystem.settings.updateMode` mặc định `ProcessEventsInDynamicUpdate`. Đổi sang `ProcessEventsInFixedUpdate` làm `WasPressedThisFrame` đúng trong FixedUpdate nhưng **sai trong Update** — đừng đổi để chữa một chỗ rồi hỏng chỗ khác.

## Rebinding lúc chạy

```csharp
InputActionRebindingExtensions.RebindingOperation op;

public void StartRebind(InputAction action, int bindingIndex, System.Action onDone) {
    action.Disable();                                  // BẮT BUỘC — action đang bật thì rebind ném lỗi
    op = action.PerformInteractiveRebinding(bindingIndex)
        .WithControlsExcluding("<Mouse>/position")
        .WithControlsExcluding("<Mouse>/delta")
        .WithCancelingThrough("<Keyboard>/escape")
        .OnMatchWaitForAnother(0.1f)                   // chờ 100ms để bắt cả tổ hợp
        .OnCancel(o => Finish(action, onDone))
        .OnComplete(o => {
            PlayerPrefs.SetString("bindings", action.actionMap.asset.SaveBindingOverridesAsJson());
            Finish(action, onDone);
        })
        .Start();
}

void Finish(InputAction action, System.Action onDone) { op?.Dispose(); op = null; action.Enable(); onDone(); }

// Lúc khởi động: input.asset.LoadBindingOverridesFromJson(PlayerPrefs.GetString("bindings", ""));
```

Ba chi tiết hay thiếu: **composite** (WASD là một `2DVector` với 4 binding con) — `bindingIndex` phải trỏ vào binding con có `isPartOfComposite`, không phải binding cha; **binding của scheme khác** — rebind phím trên keyboard không được đụng binding gamepad, lọc bằng `action.bindings[i].groups`; và **trùng phím** — Input System không cấm hai action cùng phím, bạn phải tự kiểm và hỏi "đổi hay hoán". Luôn có nút Reset (`action.RemoveAllBindingOverrides()`). JSON override lưu theo **id** binding, không phải theo thứ tự — sửa asset không làm mất setting người chơi.

## Đổi thiết bị nóng và glyph đúng

Người chơi rút tay cầm giữa trận: game phải pause và hiện "Tay cầm đã ngắt", không phải để nhân vật đứng chịu đòn. `InputSystem.onDeviceChange` với `InputDeviceChange.Disconnected` là chỗ móc. Với `PlayerInput`, `onControlsChanged` báo scheme mới (`"Gamepad"`, `"Keyboard&Mouse"`); với generated class, đọc `ctx.control.device` trong callback và tự đổi scheme khi thiết bị khác scheme hiện tại.

Glyph "Nhấn [A] để nhặt" lấy từ binding thật, không hardcode:

```csharp
string label = interactAction.GetBindingDisplayString(
    InputBinding.MaskByGroup(currentScheme), out string deviceLayout, out string controlPath);
// controlPath = "buttonSouth" → tra sprite trong TMP Sprite Asset theo deviceLayout ("DualShockGamepad" / "XInputController")
```

`controlPath` mới là khoá tra sprite; `label` chỉ là chữ dự phòng. Bẫy: chuột rung nhẹ trên bàn cũng đổi scheme về Keyboard&Mouse, glyph nhấp nháy A ↔ E. Chỉ đổi scheme khi có **nhấn nút**, bỏ qua `Mouse/delta` và `Mouse/position`.

## Deadzone và processor — trong asset, không trong code

Stick gamepad cũ trôi 0.05–0.1 khi thả. Processor **Stick Deadzone** (min 0.125, max 0.925 mặc định) đặt trên **binding gamepad** của action Move — không đặt trên action, vì nó sẽ áp lên cả WASD và làm phím "chưa đủ nghiêng". Scale Vector 2 cho độ nhạy, Invert Vector 2 cho đảo trục Y. Tất cả trong asset để designer chỉnh không cần build.

Setting của người chơi (độ nhạy, đảo Y) đổi processor lúc chạy mà không sửa asset:

```csharp
input.Player.Look.ApplyParameterOverride("scaleVector2:x", sensitivity);   // Input System 1.5+
input.Player.Look.ApplyParameterOverride("invertVector2:invertY", invertY);
```

## Mobile

- **On-Screen Stick / On-Screen Button** (có sẵn trong package) gửi sự kiện như một `Gamepad` ảo — cùng action map, không cần code riêng. Đủ cho 90% game.
- Đa chạm thật (hai ngón cùng lúc, cử chỉ) dùng **`EnhancedTouch`**: `EnhancedTouchSupport.Enable()` rồi `Touch.activeTouches`. Không bật thì `Touchscreen.current` chỉ tiện cho một ngón.
- **Chạm xuyên qua UI** — chạm nút Pause mà nhân vật bắn. `EventSystem.current.IsPointerOverGameObject()` không tham số với Input System mới **luôn sai và có warning**; phải truyền `touchId`, và **không gọi trong callback action** (UI chưa xử lý xong frame đó). Kiểm trong `Update` trước khi tiêu thụ chạm, hoặc cấu hình để action Fire chỉ nhận từ vùng joystick — hoặc đơn giản nhất: UI chiếm layer trên, mọi chạm gameplay đi qua một `Image` trong suốt có `IPointerDownHandler`, UI ăn chạm trước theo đúng luật raycast.

## UI navigation bằng gamepad

Thay `StandaloneInputModule` bằng **`InputSystemUIInputModule`** trên EventSystem, trỏ vào map UI của asset. Hai bệnh: (1) **mất selected object** — bấm chuột ra vùng trống là `EventSystem.currentSelectedGameObject = null`, D-pad không còn di chuyển được gì. Chữa: mỗi màn hình nhớ `lastSelected`, và trong `Update` nếu `currentSelectedGameObject == null` mà có input Navigate thì `SetSelectedGameObject(lastSelected)`. (2) **focus mặc định** khi mở panel — gọi `EventSystem.current.SetSelectedGameObject(firstButton)` trong `OnEnable` sau một frame (panel chưa layout xong ở frame đầu). Cả hai đều là yêu cầu ở [[ux-flow]]; Unity không làm giúp.

## Input trong pause

`Time.timeScale = 0` **không** dừng Input System — nó đo thời gian bằng đồng hồ thực riêng. Hệ quả hai chiều: `Hold` interaction (giữ 0.4s để chạy) vẫn kích trong pause, tốt cho "giữ để bỏ qua cutscene"; nhưng logic tự viết cộng `Time.deltaTime` để đo giữ nút thì đứng — dùng `Time.unscaledDeltaTime` cho mọi thứ input. `FixedUpdate` không chạy khi `timeScale = 0`, nên bất kỳ cờ input nào chỉ được tiêu thụ trong `FixedUpdate` sẽ tích luỹ trong pause và nổ ra lúc resume — reset cờ khi vào pause. Xem thứ tự thực thi ở [[unity-game-loop]].

## Trợ năng — rẻ nếu làm trong InputReader

Vì mọi input qua một cửa, ba việc ở [[accessibility]] chỉ tốn vài dòng: **toggle thay hold** (Sprint/Aim/Crouch — `if (A11y.HoldToToggle) held = !held` trong callback `performed`), **remap** (đã có ở trên), và **chống bấm nhầm** cho hành động không hoàn được — Hold interaction 0.5s cho "Xoá save", hoặc xác nhận hai bước. Mashing (bấm liên tục để thoát QTE) phải có lựa chọn thay bằng giữ.

## Bẫy lộ ra khi build

- File C# sinh từ asset không được regenerate trên máy build — **commit file `.cs` đó**, đừng để trong `.gitignore`.
- `Keyboard.current` / `Gamepad.current` là **null** khi không có thiết bị (mobile không có bàn phím, PC chưa cắm tay cầm). Mọi truy cập trực tiếp phải kiểm null; qua action thì không cần.
- **Supported Devices** trong Input System settings: đã liệt kê thì thiết bị ngoài danh sách bị bỏ qua hoàn toàn — tay cầm Android lạ "không nhận" là vì đây.
- WebGL: trình duyệt không báo gamepad cho tới khi người chơi **bấm một nút** trên nó — màn hình "Press any button" là bắt buộc, không phải trang trí.
- Android: nhiều tay cầm Bluetooth map sai layout; test ít nhất Xbox và một tay cầm rẻ tiền không tên trước khi ship.

## Kiểm tra nhanh
- Mở **Window > Analysis > Input Debugger**, mở menu trong game: map Player hiện *Disabled*, map UI *Enabled*? Đóng menu thì ngược lại?
- Giới hạn 30 FPS (`Application.targetFrameRate = 30`), bấm nhảy 20 lần dồn dập: đủ 20 lần nhảy, không nhảy đôi?
- Rút tay cầm giữa gameplay: game pause trong 1 frame, glyph đổi sang bàn phím; cắm lại nhận trong 1 giây?
- Rebind Jump sang phím khác, tắt mở game: phím mới còn? Bấm Reset về mặc định được?
- Mobile: chạm nút Pause 20 lần — nhân vật không bắn/nhảy lần nào?

## 🤖 Prompt cho AI

AI mặc định viết `Input.GetKeyDown(KeyCode.Space)` trong `Update` của từng script, hoặc trộn Input cũ với package mới vì Player Settings đang "Both".

**Phải nêu rõ:**
- Input System package phiên bản mấy, Active Input Handling đặt gì
- Cách đọc: generated class trong InputReader ScriptableObject, hay `PlayerInput` component
- Danh sách action map và action, cái nào Button / Value / Pass Through, interaction nào (Hold, Tap, Press)
- Control scheme (Keyboard&Mouse, Gamepad, Touch) và cái nào phải hỗ trợ ở bản ship
- Cửa sổ input buffer (giây), hành động nào toggle được, hành động nào cần Hold để xác nhận
- Nơi tiêu thụ input: Update hay FixedUpdate — và ai giữ cờ giữa hai bên

**Mẫu prompt**

```
Viết InputReader (ScriptableObject) cho Unity 6, Input System 1.11, Active Input Handling = Input System Package (New).
Asset GameInput.inputactions đã có, đã tick Generate C# Class → class GameInput.

Action map Player: Move (Value, Vector2), Jump (Button), Attack (Button), Interact (Button, Hold 0.4s), Pause (Button).
Action map UI: dùng mặc định của Unity cho InputSystemUIInputModule.
Scheme: Keyboard&Mouse, Gamepad. Touch làm sau, KHÔNG viết code touch bây giờ.

Ràng buộc:
- InputReader implement GameInput.IPlayerActions, là NƠI DUY NHẤT gọi API UnityEngine.InputSystem. CẤM UnityEngine.Input.
- Expose: Vector2 Move, bool JumpHeld, event JumpPressed/AttackPressed/PausePressed, bool ConsumeJump(window 0.12s dùng Time.unscaledTime).
- EnableGameplay()/EnableUI(): hai map KHÔNG bao giờ cùng bật; khi sang UI phải reset Move về zero.
- Mọi phép đo thời gian dùng unscaledTime (phải chạy khi timeScale = 0).
- KHÔNG đọc WasPressedThisFrame trong FixedUpdate ở bất kỳ đâu; controller tiêu thụ cờ từ InputReader.
- Deadzone/invert đặt bằng processor trong asset, code chỉ ApplyParameterOverride cho setting người chơi.
- Rebind: hàm StartRebind(action, bindingIndex) có exclude Mouse/position + delta, cancel bằng Escape, lưu SaveBindingOverridesAsJson; xử lý composite (binding con).

Kèm: danh sách phương thức IPlayerActions phải implement, và nơi gọi EnableUI/EnableGameplay trong luồng pause.
```

**Bẫy thường gặp:** AI viết `if (ctx.performed) JumpPressed?.Invoke()` đúng, rồi để controller nghe event và **đặt velocity ngay trong handler** — handler chạy giữa lúc Input System xử lý event, ngoài `FixedUpdate`, nên bước physics kế ghi đè hoặc chạy hai lần. Code biên dịch, nhảy "gần như luôn" được, hỏng ở 144Hz. Event từ InputReader chỉ được **đặt cờ**; vận tốc luôn đặt trong `FixedUpdate`.
