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

## 💻 Code

Demo dựng một `InputReader` ScriptableObject là cửa duy nhất chạm Input System: hai action map Gameplay/UI không bao giờ cùng bật, jump theo consume-pattern có buffer, và một hàng Settings rebind phím Jump lúc chạy rồi lưu vào PlayerPrefs — kiểm chứng được bằng Input Debugger.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 360" role="img" aria-label="Hierarchy có Canvas với SettingsPanel chứa Row_Jump gắn RebindButton, EventSystem dùng InputSystemUIInputModule, Player gắn PauseToggleDemo; asset GameInput.inputactions và InputReader; Inspector hiện InputReader, Rebind Button, Pause Toggle Demo và UI Input Module">
  <rect x="10" y="10" width="200" height="340" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">▾ Canvas</text>
  <text x="38" y="82" class="fig-muted" font-size="12">▾ SettingsPanel</text>
  <rect x="16" y="90" width="188" height="20" rx="4" fill="#ffd43b" opacity="0.18"/>
  <text x="54" y="105" class="fig-label" font-size="12" font-weight="600">Row_Jump  (RebindButton)</text>
  <text x="70" y="124" class="fig-muted" font-size="11">Btn_Rebind, Label_TMP</text>
  <text x="70" y="140" class="fig-muted" font-size="11">Btn_Reset</text>
  <text x="38" y="158" class="fig-muted" font-size="12">EventSystem</text>
  <text x="54" y="174" class="fig-muted" font-size="11">InputSystemUIInputModule</text>
  <text x="22" y="194" class="fig-muted" font-size="12">Player  (PauseToggleDemo)</text>
  <line x1="10" y1="208" x2="210" y2="208" class="fig-line"/>
  <text x="22" y="228" class="fig-label" font-size="12" font-weight="600">Assets</text>
  <text x="22" y="246" class="fig-muted" font-size="11">GameInput.inputactions</text>
  <text x="34" y="262" class="fig-muted" font-size="11">☑ Generate C# Class → GameInput.cs</text>
  <text x="34" y="278" class="fig-muted" font-size="11">Gameplay: Move Jump Attack Pause</text>
  <text x="34" y="294" class="fig-muted" font-size="11">UI: Navigate Submit Cancel</text>
  <rect x="16" y="302" width="188" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="22" y="317" class="fig-label" font-size="11" font-weight="600">InputReader.asset  (ScriptableObject)</text>
  <text x="22" y="338" class="fig-muted" font-size="10">Active Input Handling: Input System Package (New)</text>
  <rect x="226" y="10" width="424" height="340" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Input Reader  (asset InputReader)</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Jump Buffer (s)</text><text x="440" y="82" class="fig-label" font-size="11">0.12</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Bindings Prefs Key</text><text x="440" y="98" class="fig-label" font-size="11">bindings</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Generated class</text><text x="440" y="114" class="fig-label" font-size="11">GameInput  (không cần kéo asset)</text>
  <rect x="234" y="124" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="137" class="fig-label" font-size="12" font-weight="600">Rebind Button (Script)  (Row_Jump)</text>
  <text x="250" y="156" class="fig-muted" font-size="11">Reader</text><text x="440" y="156" class="fig-label" font-size="11">InputReader</text>
  <text x="250" y="172" class="fig-muted" font-size="11">Action Reference</text><text x="440" y="172" class="fig-label" font-size="11">Gameplay/Jump</text>
  <text x="250" y="188" class="fig-muted" font-size="11">Binding Index</text><text x="440" y="188" class="fig-label" font-size="11">0   (Keyboard: space)</text>
  <text x="250" y="204" class="fig-muted" font-size="11">Label</text><text x="440" y="204" class="fig-label" font-size="11">Label_TMP (TMP_Text)</text>
  <text x="250" y="220" class="fig-muted" font-size="11">Rebind Button / Reset Button</text><text x="440" y="220" class="fig-label" font-size="11">Btn_Rebind / Btn_Reset</text>
  <rect x="234" y="230" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="243" class="fig-label" font-size="12" font-weight="600">Pause Toggle Demo (Script)  (Player)</text>
  <text x="250" y="262" class="fig-muted" font-size="11">Reader</text><text x="440" y="262" class="fig-label" font-size="11">InputReader</text>
  <text x="250" y="278" class="fig-muted" font-size="11">Menu Panel</text><text x="440" y="278" class="fig-label" font-size="11">SettingsPanel</text>
  <rect x="234" y="288" width="408" height="18" rx="3" fill="#b197fc" opacity="0.22"/>
  <text x="242" y="301" class="fig-label" font-size="12" font-weight="600">Input System UI Input Module  (EventSystem)</text>
  <text x="250" y="320" class="fig-muted" font-size="11">Actions Asset</text><text x="440" y="320" class="fig-label" font-size="11">GameInput</text>
  <text x="250" y="336" class="fig-muted" font-size="11">Navigate / Submit / Cancel</text><text x="440" y="336" class="fig-label" font-size="11">UI/Navigate, UI/Submit, UI/Cancel</text>
</svg>
<figcaption>Mọi script tham chiếu asset InputReader qua Inspector — không singleton. Map UI chỉ có 3 action; dùng template UI mặc định (có thêm Point, Click, ScrollWheel…) thì phải implement thêm hàm rỗng tương ứng trong IUIActions.</figcaption>
</figure>

**Script**

```csharp
// InputReader.cs — Unity 6 (6000.x), Input System 1.11+. Tạo asset: Assets ▸ Create ▸ Game ▸ Input Reader.
// Cần asset GameInput.inputactions với map Gameplay (Move: Value/Vector2; Jump, Attack, Pause: Button)
// và map UI (Navigate: Value/Vector2; Submit, Cancel: Button), tick "Generate C# Class" → class GameInput.
// Đây là NƠI DUY NHẤT trong game using UnityEngine.InputSystem (RebindButton là phần UI của lớp này).
using System;
using UnityEngine;
using UnityEngine.InputSystem;

[CreateAssetMenu(menuName = "Game/Input Reader")]
public class InputReader : ScriptableObject, GameInput.IGameplayActions, GameInput.IUIActions
{
    [SerializeField] float jumpBuffer = 0.12f;            // cửa sổ buffer nhấn nhảy (giây, unscaled)
    [SerializeField] string bindingsPrefsKey = "bindings";

    GameInput input;
    float jumpPressedAt = -10f;

    // --- Gameplay: phần còn lại của game chỉ biết những thứ này, không biết phím nào ---
    public Vector2 Move { get; private set; }
    public bool JumpHeld { get; private set; }
    public bool JumpPressed => Time.unscaledTime - jumpPressedAt <= jumpBuffer;   // đọc không tiêu thụ
    public event Action Attack;
    public event Action Pause;

    // --- UI ---
    public event Action Cancel;

    public bool GameplayEnabled => input != null && input.Gameplay.enabled;

    void OnEnable()
    {
        if (input == null)
        {
            input = new GameInput();
            input.Gameplay.SetCallbacks(this);
            input.UI.SetCallbacks(this);
            input.asset.LoadBindingOverridesFromJson(PlayerPrefs.GetString(bindingsPrefsKey, ""));   // override lưu theo id binding
        }
        EnableGameplay();
    }

    void OnDisable()
    {
        input?.Disable();
        Move = Vector2.zero; JumpHeld = false;             // SO giữ state xuyên Play khi tắt Domain Reload
    }

    /// Hai map KHÔNG bao giờ cùng bật — "bấm A trong menu, nhân vật phía sau nhảy" là vì thế.
    public void EnableGameplay() { input.UI.Disable(); input.Gameplay.Enable(); }
    public void EnableUI()       { input.Gameplay.Disable(); input.UI.Enable(); Move = Vector2.zero; JumpHeld = false; }

    /// Consume-pattern: gọi trong FixedUpdate của controller. Trả true đúng MỘT lần cho mỗi lần nhấn.
    public bool ConsumeJump()
    {
        if (!JumpPressed) return false;
        jumpPressedAt = -10f;
        return true;
    }

    // --- Rebinding. Generated class giữ BẢN SAO của asset, nên phải tra action trong input.asset;
    //     dùng thẳng InputActionReference.action là rebind lên asset gốc và không có tác dụng gì. ---
    public InputAction ResolveAction(InputActionReference reference) => input.asset.FindAction(reference.action.id);
    public void SaveBindings() => PlayerPrefs.SetString(bindingsPrefsKey, input.asset.SaveBindingOverridesAsJson());
    public void ResetAllBindings() { input.asset.RemoveAllBindingOverrides(); SaveBindings(); }

    // --- IGameplayActions: phải implement MỌI hàm — thêm action vào asset là lỗi biên dịch nhắc bạn xử lý ---
    public void OnMove(InputAction.CallbackContext ctx) => Move = ctx.ReadValue<Vector2>();

    public void OnJump(InputAction.CallbackContext ctx)
    {
        if (ctx.performed) { JumpHeld = true; jumpPressedAt = Time.unscaledTime; }   // chỉ đặt cờ — KHÔNG đặt velocity ở đây
        else if (ctx.canceled) JumpHeld = false;
    }

    public void OnAttack(InputAction.CallbackContext ctx) { if (ctx.performed) Attack?.Invoke(); }
    public void OnPause(InputAction.CallbackContext ctx)  { if (ctx.performed) Pause?.Invoke(); }

    // --- IUIActions: Navigate/Submit do InputSystemUIInputModule xử lý; ở đây chỉ cần Cancel để đóng menu ---
    public void OnNavigate(InputAction.CallbackContext ctx) { }
    public void OnSubmit(InputAction.CallbackContext ctx)   { }
    public void OnCancel(InputAction.CallbackContext ctx)   { if (ctx.performed) Cancel?.Invoke(); }
}
```

```csharp
// RebindButton.cs — một hàng trong màn Settings: nhãn phím hiện tại + nút Rebind + nút Reset. Cần TextMeshPro.
using TMPro;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;

public class RebindButton : MonoBehaviour
{
    [SerializeField] InputReader reader;
    [SerializeField] InputActionReference actionReference;   // kéo Gameplay/Jump từ asset vào
    [SerializeField] int bindingIndex = 0;                    // composite (WASD): trỏ vào binding CON, không phải cha
    [SerializeField] TMP_Text label;
    [SerializeField] Button rebindButton;
    [SerializeField] Button resetButton;

    InputAction action;
    InputActionRebindingExtensions.RebindingOperation op;

    void Start()
    {
        action = reader.ResolveAction(actionReference);       // action trong bản sao của GameInput, không phải asset gốc
        rebindButton.onClick.AddListener(StartRebind);
        resetButton.onClick.AddListener(ResetBinding);
        RefreshLabel();
    }

    void OnDestroy() => op?.Dispose();

    void StartRebind()
    {
        bool wasEnabled = action.enabled;
        action.Disable();                                     // BẮT BUỘC — rebind action đang bật là ném lỗi
        label.text = "Nhấn phím mới… (Esc huỷ)";

        op = action.PerformInteractiveRebinding(bindingIndex)
            .WithControlsExcluding("<Mouse>/position")
            .WithControlsExcluding("<Mouse>/delta")
            .WithCancelingThrough("<Keyboard>/escape")
            .OnMatchWaitForAnother(0.1f)                      // chờ 100ms để bắt cả tổ hợp
            .OnCancel(_ => Finish(wasEnabled))
            .OnComplete(_ => { reader.SaveBindings(); Finish(wasEnabled); })
            .Start();
    }

    void Finish(bool reEnable)
    {
        op?.Dispose(); op = null;
        if (reEnable) action.Enable();                        // đang ở menu (map Gameplay tắt) thì KHÔNG bật lẻ mỗi Jump
        RefreshLabel();
    }

    void ResetBinding()
    {
        action.RemoveBindingOverride(bindingIndex);
        reader.SaveBindings();
        RefreshLabel();
    }

    void RefreshLabel()
    {
        // Lấy từ binding thật, không hardcode. controlPath ("space", "buttonSouth") là khoá tra sprite glyph nếu muốn hiện icon.
        label.text = action.GetBindingDisplayString(bindingIndex, out string deviceLayout, out string controlPath);
    }
}
```

```csharp
// PauseToggleDemo.cs — chứng minh chuyển map: Pause (map Gameplay) mở menu → chỉ map UI bật; Cancel (map UI) đóng → ngược lại.
// Cả hai action cùng gán Escape nhưng không bao giờ cùng bật, nên không có chuyện một lần bấm mở-đóng-mở.
using UnityEngine;

public class PauseToggleDemo : MonoBehaviour
{
    [SerializeField] InputReader reader;
    [SerializeField] GameObject menuPanel;

    void OnEnable()  { reader.Pause += Open;  reader.Cancel += Close; menuPanel.SetActive(false); }
    void OnDisable() { reader.Pause -= Open;  reader.Cancel -= Close; }

    void Open()
    {
        reader.EnableUI();                 // Gameplay tắt: Move về zero, Jump không lọt xuống controller
        menuPanel.SetActive(true);
        Time.timeScale = 0f;               // Input System không đo bằng timeScale — buffer vẫn đúng nhờ unscaledTime
    }

    void Close()
    {
        Time.timeScale = 1f;
        menuPanel.SetActive(false);
        reader.EnableGameplay();
    }

    void FixedUpdate()
    {
        // Controller thật đặt velocity ở đây; demo chỉ log để đếm.
        if (reader.ConsumeJump()) Debug.Log($"Jump tiêu thụ ở FixedUpdate, Move = {reader.Move}");
    }
}
```

**Chạy thử**
- Mở **Window ▸ Analysis ▸ Input Debugger ▸ Actions** lúc Play: `Gameplay` Enabled, `UI` Disabled. Nhấn Esc: đảo ngược ngay, và `Move` trong asset InputReader (Inspector chế độ Debug) về (0, 0) cùng frame. Esc lần nữa: về như cũ, không nhấp nháy.
- Đặt `Application.targetFrameRate = 30`, bấm Space 20 lần dồn dập: Console đúng 20 dòng "Jump tiêu thụ" — không nhảy đôi, không mất lần nào, vì cờ đặt ở callback và tiêu thụ ở FixedUpdate.
- Bấm Rebind rồi nhấn J: nhãn đổi từ `Space` sang `J`; Space không log nữa, J log. Stop rồi Play lại: nhãn vẫn `J` — PlayerPrefs key `bindings` có JSON override theo id binding.
- Bấm Reset: nhãn về `Space`, JSON không còn override cho Jump. Nhấn Esc giữa lúc rebind: huỷ, nhãn giữ phím cũ.
- Cố ý thay `reader.ResolveAction(actionReference)` bằng `actionReference.action`: nhãn đổi sang J nhưng Space vẫn nhảy, J không — đó là bẫy "bản sao asset" của generated class, và là lý do InputReader phải là người tra action.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | Input System mới khác `Input.GetAxis` cũ ở đâu? |
| Junior | `started` / `performed` / `canceled` trong callback nghĩa là gì? |
| Mid | Đọc input ở `Update` hay `FixedUpdate`? Nhảy bị "ăn mất" thì vì sao? |
| Mid | Làm rebinding cho người chơi tự đổi phím — các bước? |
| Senior | Người chơi rút tay cầm giữa trận, cắm lại tay cầm khác. Game phải làm gì? |
| Senior | Mở menu mà nhân vật vẫn chạy theo hướng cuối cùng. Nguyên nhân kiến trúc? |

**Khung trả lời 60 giây** — "Anh tổ chức input thế nào?"

> Một `InputReader` ở giữa: nó là nơi **duy nhất** biết tới Input System, đọc bằng **generated C# class** để đổi tên action là lỗi biên dịch chứ không phải lỗi lúc chạy, rồi phát ra event và giá trị đã chuẩn hoá cho gameplay. Không script nào khác được gọi thẳng `ReadValue`. Nhờ vậy thêm chế độ hold-to-toggle, thêm trợ năng, hay giả lập input để test chỉ sửa một chỗ.
>
> Chia **Action Map theo ngữ cảnh**: `Gameplay`, `UI`, `Dialogue`, `Vehicle`. Mở menu là `Gameplay.Disable()` + `UI.Enable()`. Đây cũng là câu trả lời cho chuyện "mở menu mà nhân vật vẫn chạy": hướng di chuyển cuối cùng còn nằm trong biến, nên khi tắt map phải **xoá state** về 0, chứ không chỉ ngừng nghe.
>
> Và luật cứng: event chỉ **đặt cờ**, còn vận tốc luôn đặt trong `FixedUpdate`.

**Họ sẽ đào tiếp**

- *"Vì sao event không được đặt velocity trực tiếp?"* → Handler chạy khi Input System xử lý event, ngoài nhịp `FixedUpdate`, nên bước physics kế có thể ghi đè hoặc áp hai lần. Code vẫn biên dịch, nhảy "gần như luôn" được, và hỏng ở màn hình 144Hz — đúng loại bug không ai tái hiện được trên máy dev.
- *"Nhảy bị ăn mất?"* → `WasPressedThisFrame()` đọc trong `FixedUpdate` sẽ **bỏ sót** khi frame render nhiều hơn bước physics. Cách đúng: `Update` bắt sự kiện và set `jumpBuffered = true` kèm thời hạn (jump buffer ~0.1s), `FixedUpdate` tiêu thụ cờ đó. Coyote time (~0.1s) là cặp bài trùng.
- *"Rebinding?"* → `PerformInteractiveRebinding()` với `WithControlsExcluding("Mouse")`, chặn phím hệ thống, ghi `SaveBindingOverridesAsJson()` vào save, nạp lại lúc khởi động, và **luôn có nút Reset** — người chơi tự khoá mình ra ngoài là chuyện có thật. Hiện tên phím bằng `InputControlPath.ToHumanReadableString`, đừng hiện đường dẫn thô.
- *"Đổi thiết bị nóng?"* → Nghe `InputUser.onChange` hoặc `PlayerInput.onControlsChanged` để đổi **glyph** trong UI ngay lập tức: chơi bằng gamepad mà tooltip hiện "Nhấn E" là lỗi hay bị bỏ qua nhất trong QA. Cũng nhớ dừng game khi tay cầm ngắt kết nối giữa trận.
- *"Deadzone?"* → Đặt bằng **processor trong asset** (Stick Deadzone, Invert, Scale), không nhét `if (Mathf.Abs(x) < 0.2f)` rải rác trong code. Mặc định của Unity thường quá nhỏ cho tay cầm cũ.
- *"Mobile?"* → Touch qua `EnhancedTouch` hoặc on-screen control; nhớ tách vùng chạm UI khỏi vùng gameplay (`IsPointerOverGameObject`) và test trên máy có safe area.

**Cờ đỏ**

- Bật cả hai backend ("Both") rồi trộn `Input.GetKey` với Input System trong cùng dự án — hai nguồn chân lý, và bug chỉ lộ trên một nền tảng.
- Gọi `ReadValue` rải rác trong 10 script.
- Không tắt Action Map khi vào menu, rồi vá bằng một cờ `isPaused` trong mỗi handler.
- Hardcode "Nhấn Space để nhảy" vào text UI.
- Không xử lý được trường hợp không có bàn phím (console/mobile) trong flow "Press any key to start".

**Số / ví dụ nên thuộc**

- Jump buffer ≈ 0.1s, coyote time ≈ 0.1s — hai con số làm platformer "cảm giác chuẩn".
- `started` (vừa chạm ngưỡng) → `performed` (thoả interaction, ví dụ Hold đủ lâu) → `canceled` (nhả).
- Generated C# class là mặc định; `PlayerInput` component chỉ khi cần local co-op chia thiết bị.
