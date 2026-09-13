---
title: UI trong Unity
icon: 🖼️
summary: UGUI vẫn là lựa chọn cho UI in-game năm 2026; cái giết frame không phải số phần tử mà là Canvas rebuild — tách Canvas theo tần suất đổi, tắt Raycast Target, và đừng lồng Layout Group.
status: deep
read: 680
level: intermediate
order: 90
tags: [unity, ui, ux]
related: [ui-design, ux-hud, ux-flow, accessibility, unity-input]
---

Quyết định quan trọng nhất không phải "UGUI hay UI Toolkit" — mà là **bạn sẽ tổ chức Canvas thế nào trước khi vẽ màn hình thứ hai**. Một Canvas duy nhất chứa cả HUD, menu, popup và số sát thương bay lên là cách phổ biến nhất để có UI chạy 60 FPS trong Editor và 35 FPS trên điện thoại, vì mỗi lần một số đổi là toàn bộ mesh của Canvas đó được dựng lại.

Lý thuyết về thang đo, trạng thái `focused`, ba tầng HUD đã có ở [[ui-design]] và [[ux-hud]]. Node này chỉ nói phần Unity làm sai ở đâu.

## UGUI hay UI Toolkit — năm 2026

| | UGUI (Canvas) | UI Toolkit |
|---|---|---|
| HUD, popup in-game, mobile | **Dùng** — ổn định, mọi package bên thứ ba hỗ trợ | Được, nhưng còn thiếu ở dưới |
| World-space (health bar trên đầu enemy, bảng trong 3D) | Có | **Không** ở runtime (chỉ screen overlay / render texture) |
| Shader, material, particle trong UI | Có — mọi `Graphic` là mesh, gắn material tuỳ ý | Rất hạn chế |
| Animation bằng Animator / tween | Có | Chỉ USS transition, không có Animator |
| Editor tool, cửa sổ, inspector | Được nhưng không ai làm | **Dùng** — Unity 6 khuyến nghị |
| UI dạng document nhiều text (wiki in-game, settings dài) | Được | Tốt hơn — layout flex, styling tập trung |
| AI agent sửa trực tiếp | Prefab YAML, khó | UXML/USS là text, dễ |

Kết luận thực dụng: **UGUI cho mọi thứ người chơi nhìn thấy trong game, UI Toolkit cho mọi thứ trong Editor** ([[unity-editor-tools]]). Lý do không chuyển hết sang UI Toolkit năm 2026 là ba thứ ở bảng trên — world-space, shader/particle trong UI, và Animator. Game nào không cần cả ba (game text, quản lý, puzzle phẳng) thì UI Toolkit là lựa chọn hợp lý, nhưng đó là thiểu số.

## Canvas rebuild — nguồn chi phí thật

Cơ chế: một `Graphic` bất kỳ (Image, Text, RawImage) trong Canvas đổi vertex — đổi màu, đổi text, đổi `fillAmount`, đổi vị trí — đánh dấu Canvas **dirty**. Cuối frame, `Canvas.BuildBatch` dựng lại mesh của **toàn bộ Canvas đó**, không chỉ phần tử đổi. Canvas 300 phần tử mà một con số nhảy mỗi frame là 300 phần tử được dựng lại mỗi frame: 1.5–3 ms trên Snapdragon 6xx, tức 10–20% ngân sách 16 ms.

Cách sửa là tách Canvas theo **tần suất đổi**, không theo chức năng:

```
Canvas_Static      — khung HUD, icon, nền: không bao giờ dirty
Canvas_HUD         — máu, mana, cooldown: đổi vài lần/giây (throttle 10Hz)
Canvas_Dynamic     — số sát thương, combo counter: đổi mỗi frame
Canvas_Menu        — tắt hẳn khi không mở (SetActive false, không phải alpha 0)
```

Canvas con (nested Canvas) cũng cô lập rebuild — thêm component `Canvas` vào child là đủ, nó kế thừa Scaler của cha. Quy tắc: **thứ đổi mỗi frame không được ở chung Canvas với thứ không bao giờ đổi.** Fade bằng `CanvasGroup.alpha` (không dirty), không tween `Image.color` (dirty).

## Raycast Target — tắt mặc định

Mỗi `Image` và `Text` tạo ra có `Raycast Target` bật. `GraphicRaycaster` duyệt **mọi** raycast target trong Canvas cho mỗi sự kiện pointer — trên mobile là mỗi frame có ngón tay chạm. HUD 200 phần tử trong đó 6 cái bấm được → 194 phép kiểm tra thừa mỗi frame chạm.

Tắt trên mọi thứ không nhận input; chỉ giữ trên Button, Toggle, Slider handle, vùng chặn click của popup. Ép bằng một menu item duyệt prefab và tắt cho `Graphic` không có `Selectable` cùng GameObject — 20 dòng, xem [[unity-editor-tools]].

## Layout Group lồng nhau là chi phí bậc thang

`VerticalLayoutGroup` chứa `HorizontalLayoutGroup` chứa `ContentSizeFitter`: mỗi tầng chạy layout hai lượt (đo rồi xếp), và một tầng dirty kéo mọi tầng cha dirty theo. Ba tầng lồng với 50 phần tử là ~0.5 ms; sáu tầng là frame spike thấy được khi mở túi đồ.

Luật:
- Layout Group chỉ ở **một tầng**, cho danh sách thật sự động. Layout cố định thì đặt anchor tay.
- Danh sách trên 30 mục (inventory, leaderboard, shop) dùng **virtualized list**: chỉ tạo đủ cell lấp `ScrollRect` viewport + 2, tái dùng khi cuộn. Tự viết 150 dòng hoặc dùng package; **không** `Instantiate` 500 cell rồi ẩn.

## TextMeshPro — ba việc phải làm

Từ Unity 6, TextMeshPro nằm trong package `com.unity.ugui` 2.0, namespace vẫn `TMPro`.

**Không cấp phát khi đổi số.** `label.text = $"{hp}/{max}"` tạo string mới mỗi frame → GC. Dùng `label.SetText("{0}/{1}", hp, max)` — TMP format số vào buffer nội bộ, 0 B alloc.

**Atlas Static cho font ship, Dynamic chỉ để phát triển.** Dynamic atlas thêm glyph lúc chạy — lần đầu gặp chữ mới là một lần render SDF (0.5–2 ms/glyph) đúng lúc người chơi mở màn hình, và glyph không bao giờ được xoá khỏi RAM. Trước khi ship: `Atlas Population Mode = Static`, **Update Atlas Texture** với toàn bộ chuỗi trong game (Unity Localization xuất được danh sách ký tự), bật `Multi Atlas Textures` nếu không đủ.

**Tiếng Việt và font fallback.** Phần lớn font đẹp trên itch/Google Fonts thiếu `ẳ`, `ỡ`, `ữ`. TMP không báo lỗi — nó tìm trong **Fallback Font Assets**, không có thì hiện ô vuông, và lỗi chỉ lộ khi có bản dịch. Dán chuỗi `"ăâđêôơư ắằẳẵặ ấầẩẫậ ếềểễệ ốồổỗộ ớờởỡợ ứừửữự"` vào một TMP text ngay tuần đầu; cần fallback thì thêm Noto Sans và chấp nhận dấu không cùng nét. CJK gần như luôn cần font riêng và atlas 4096.

SDF: `Sampling Point Size` 60–90, `Padding` ≥ 10% point size — outline/glow ăn vào padding, thiếu là viền bị cắt. Chữ pixel-art dùng Bitmap, không SDF.

## Scaler và safe area

`Canvas Scaler`: `Scale With Screen Size`, tham chiếu 1920×1080, `Match Width Or Height`. Hệ số match:
- **PC/console, tỉ lệ chủ yếu 16:9 → `Match = 1`** (theo chiều cao), như [[ui-design]] khuyến nghị: ultrawide chỉ thêm khoảng trống hai bên.
- **Mobile, tỉ lệ từ 4:3 (iPad) đến 21:9 → `Match = 0.5`**: không bên nào phình quá; đổi lại phải kiểm tra ở cả hai cực.

Safe area: notch, camera đục lỗ, thanh home gesture. Mọi thứ bấm được nằm trong một RectTransform con được kéo về `Screen.safeArea`:

```csharp
[RequireComponent(typeof(RectTransform))]
public class SafeAreaFitter : MonoBehaviour {
    RectTransform rt;
    Rect lastSafe; Vector2Int lastScreen;

    void Awake() { rt = GetComponent<RectTransform>(); Apply(); }

    void Update() {                                   // một phép so sánh struct mỗi frame, rẻ
        if (Screen.safeArea != lastSafe || Screen.width != lastScreen.x || Screen.height != lastScreen.y)
            Apply();
    }

    void Apply() {
        lastSafe = Screen.safeArea;
        lastScreen = new Vector2Int(Screen.width, Screen.height);
        Vector2 min = lastSafe.position, max = lastSafe.position + lastSafe.size;
        min.x /= Screen.width;  min.y /= Screen.height;
        max.x /= Screen.width;  max.y /= Screen.height;
        rt.anchorMin = min; rt.anchorMax = max;
        rt.offsetMin = rt.offsetMax = Vector2.zero;   // anchor lo hết, không còn offset tay
    }
}
```

Nền, hình trang trí nằm **ngoài** SafeArea để tràn hết màn; nút và text nằm **trong**. Test bằng `Device Simulator` với iPhone 15 + Galaxy S24 Ultra + iPad là đủ ba cực.

Anchor thay hardcode: mỗi phần tử anchor vào góc/cạnh gần nhất, phần tử kéo giãn có anchor min/max khác nhau và `offset` là lề. Nếu code UI đang nhân `Screen.width` với hệ số, anchor đã sai.

## Kiến trúc: View không biết gì

Áp dụng MVP nhẹ — chi tiết pattern và event channel ở [[unity-design-patterns]]:

```csharp
public class HealthView : MonoBehaviour {                 // chỉ vẽ, không logic
    [SerializeField] Image fill;
    [SerializeField] TMP_Text label;
    public void Render(int hp, int max) {
        fill.fillAmount = (float)hp / max;
        label.SetText("{0}/{1}", hp, max);
    }
}

public class HealthPresenter : MonoBehaviour {            // nghe event, đẩy vào View
    [SerializeField] HealthView view;
    [SerializeField] HealthChangedChannel channel;        // ScriptableObject event
    void OnEnable()  => channel.Raised += view.Render;
    void OnDisable() => channel.Raised -= view.Render;
}
```

View không `FindFirstObjectByType<Player>()`, không đọc `PlayerStats` — test được bằng `Render(37, 100)` từ nút debug, đổi nguồn dữ liệu (local → network) không đụng UI.

**Màn hình là prefab có `Show/Hide` async và một stack** — luồng menu ở [[ux-flow]] hiện thực hoá bằng:

```csharp
public abstract class UIScreen : MonoBehaviour {
    [SerializeField] CanvasGroup group;
    [SerializeField] Selectable firstSelected;            // focus mặc định cho gamepad

    public virtual async Awaitable Show() {               // Unity 6 Awaitable; 2022 dùng coroutine/UniTask
        gameObject.SetActive(true);
        group.interactable = group.blocksRaycasts = false;
        await Fade(0f, 1f, 0.15f);
        group.interactable = group.blocksRaycasts = true;
        if (firstSelected) EventSystem.current.SetSelectedGameObject(firstSelected.gameObject);
    }
    public virtual async Awaitable Hide() {
        group.interactable = group.blocksRaycasts = false;
        await Fade(1f, 0f, 0.10f);
        gameObject.SetActive(false);
    }
    async Awaitable Fade(float a, float b, float dur) {
        for (float t = 0; t < dur; t += Time.unscaledDeltaTime) {   // unscaled: menu mở khi timeScale = 0
            group.alpha = Mathf.Lerp(a, b, t / dur);
            await Awaitable.NextFrameAsync();
        }
        group.alpha = b;
    }
}

public class ScreenStack : MonoBehaviour {
    readonly Stack<UIScreen> stack = new();
    public async Awaitable Push(UIScreen s) {
        if (stack.TryPeek(out var top)) top.GetComponent<CanvasGroup>().interactable = false;
        stack.Push(s); await s.Show();
    }
    public async Awaitable Pop() {                        // gắn vào Esc / nút B, mọi màn hình
        if (!stack.TryPop(out var top)) return;
        await top.Hide();
        if (stack.TryPeek(out var below)) below.GetComponent<CanvasGroup>().interactable = true;
    }
}
```

`interactable = false` trên màn dưới là thứ chặn lỗi "bấm xuyên popup vào nút phía sau" — lỗi QA báo nhiều nhất ở menu.

## UI khi `timeScale = 0`

Pause đặt `Time.timeScale = 0` ([[unity-game-loop]]) và UI chết theo nếu không chuẩn bị: Animator trên UI phải để `Update Mode = Unscaled Time`; DOTween thêm `.SetUpdate(true)`; coroutine dùng `WaitForSecondsRealtime`; `Awaitable.WaitForSecondsAsync` **theo scaled time** — dùng vòng `unscaledDeltaTime` như trên. Particle trong UI (confetti màn thắng) bật `Main > Use Unscaled Time`.

## World-space UI

Health bar trên đầu 50 enemy = 50 Canvas world-space = 50 lần rebuild + 50 draw call. Hai lựa chọn tốt hơn:
- **Một Canvas screen-space** duy nhất, mỗi bar là một Image được đặt bằng `Camera.WorldToScreenPoint` mỗi frame — một Canvas dynamic, batch tốt.
- **Không dùng Canvas**: bar là hai `SpriteRenderer` (nền + fill scale theo trục X) hoặc một quad với shader nhận `_Fill` qua MaterialPropertyBlock ([[unity-shader]]). Rẻ nhất, sort chung với sprite thế giới.

Canvas world-space chỉ dành cho thứ ít và cần tương tác thật trong 3D (bảng điều khiển, màn hình máy tính trong game).

## Sprite Atlas và draw call

UI không atlas: mỗi Image dùng texture khác là một draw call. HUD 40 icon = 40 draw call, atlas hoá còn 1–3. Tạo `Sprite Atlas` (Unity 6 mặc định V2), kéo thư mục `Assets/Art/UI` vào, `Include in Build` **bật**. Bẫy: Editor luôn hiện đúng vì Sprite Packer mode `Always Enabled`, còn build thiếu atlas thì sprite hiện **trắng** hoặc rớt về texture rời — không lỗi, không log. Text và Image xen kẽ vẫn phá batch (material khác nhau), nên nhóm Image cạnh Image trong hierarchy khi có thể.

## Localization và chuỗi dài

Unity Localization package: `LocalizeStringEvent` gắn lên TMP text, bảng string là asset, hỗ trợ plural và smart string `{count} vật phẩm`. Cái vỡ là **layout**: "Play" → "Bắt đầu chơi" → "Spiel starten" dài gấp 3. Quy tắc: nút có `Auto Size` với min 60% cỡ gốc, panel text có `ContentSizeFitter` theo chiều dọc, và **test bằng pseudo-locale** (Localization có sẵn: kéo dài chuỗi 30% và thêm dấu) trước khi có bản dịch thật.

## Gamepad, bàn phím, và trợ năng

Input System với `InputSystemUIInputModule` thay `StandaloneInputModule` — chi tiết ở [[unity-input]]. Mỗi màn hình đặt `firstSelected` như code trên; `Navigation` của Selectable để `Explicit` ở layout lưới/phức tạp vì `Automatic` chọn theo khoảng cách hình học và nhảy sai ở grid không đều. Ẩn cursor khi có gamepad input, hiện lại khi chuột động.

Trợ năng ([[accessibility]]) trong Unity gói gọn: một `UiTheme` ScriptableObject giữ hệ số cỡ chữ 1.0/1.25/1.5 và mọi TMP text lấy `fontSize = baseSize * theme.textScale` qua một component `ThemedText`; chế độ contrast cao đổi bảng màu trong cùng asset. Ép ngay từ đầu, không phải retrofit 200 text về sau. Cỡ chữ nhỏ nhất 13 px ở 1080p, 20 px cho console.

## Bẫy lộ ra khi build

- `Canvas` để `Pixel Perfect` bật trên mobile: mỗi frame snap vị trí mọi phần tử → rebuild liên tục khi có tween. Tắt, chỉ bật cho pixel-art game có scaler nguyên.
- `Screen.safeArea` trả về cả màn hình ở frame đầu trên một số Android — vì thế code trên kiểm tra lại trong `Update`, không chỉ `Awake`.
- IL2CPP strip: `LocalizeStringEvent` với `UnityEvent` generic bị strip khi `Managed Stripping Level = High` → thêm `link.xml` cho `Unity.Localization`. Xem [[unity-build-platform]].
- Font Dynamic atlas trên build: glyph mới sinh lúc chạy tốn RAM và không được xoá — game chat tiếng Việt chạy 2 giờ có atlas 8 MB. Static hoặc `Clear Dynamic Data On Build`.
- `EventSystem` nhiều hơn một trong scene (mỗi scene additive tự có) → input UI nhân đôi hoặc mất. Một `EventSystem` ở bootstrap scene, cấm trong scene khác.

## Kiểm tra nhanh

- Profiler > UI module: `Canvas.BuildBatch` ở HUD tĩnh (không đánh, không nhận sát thương) phải **0 lần/giây**. Có là Canvas tách sai.
- Frame Debugger: HUD đầy đủ ≤ 8 draw call UI. Trên 15 là thiếu atlas hoặc Text/Image xen kẽ.
- Tìm mọi `Graphic` có Raycast Target bật: số đó phải ≈ số Selectable + số popup blocker.
- Rút chuột, cắm gamepad, đi hết mọi màn hình bằng D-pad và B: không kẹt ở đâu, không màn nào mất focus.
- Device Simulator iPhone 15 landscape + Galaxy Fold mở: không nút nào dưới notch, không text nào tràn.

## 🤖 Prompt cho AI

AI dựng UI Unity trên **một Canvas duy nhất**, bật Raycast Target mọi nơi, gán `text = $"..."` mỗi frame, lồng ba tầng Layout Group, và dùng `WaitForSeconds` cho menu pause.

**Phải nêu rõ:**
- UGUI hay UI Toolkit, và phiên bản Unity (Awaitable chỉ có từ 2023.1)
- Cách tách Canvas: danh sách Canvas theo tần suất đổi
- Độ phân giải tham chiếu, hệ số match, có safe area không
- Input: chuột / gamepad / touch — và yêu cầu focus mặc định
- Font và ngôn ngữ đích (tiếng Việt cần fallback), atlas static hay dynamic
- Có màn hình nào mở khi `timeScale = 0` không

**Mẫu prompt**

```
Dựng hệ thống UI cho Unity 6000.0 LTS, URP, UGUI + TextMeshPro, Input System.
Mobile Android/iOS landscape, tham chiếu 1920x1080, Scale With Screen Size, Match 0.5.

Canvas — BẮT BUỘC tách đúng 4 Canvas, không thêm không bớt:
  Canvas_Static (khung HUD), Canvas_HUD (máu/mana, cập nhật tối đa 10Hz),
  Canvas_Dynamic (số sát thương), Canvas_Menu (SetActive false khi đóng).
Mọi thứ bấm được nằm trong SafeArea RectTransform bám Screen.safeArea; nền nằm ngoài.

Ràng buộc:
- Raycast Target CHỈ bật trên Selectable và popup blocker. Kèm menu item Tools/UI/Fix Raycast Targets.
- TMP: dùng SetText(format, args), CẤM gán .text với string interpolation trong Update.
- KHÔNG lồng Layout Group quá 1 tầng. Inventory 200 ô dùng virtualized list, cell pool = viewport + 2.
- Mỗi màn hình là prefab kế thừa UIScreen với Show/Hide trả về Awaitable, fade bằng
  unscaledDeltaTime (menu mở khi timeScale = 0). Có ScreenStack; Esc và nút B gọi Pop.
- Mỗi màn hình có firstSelected; Navigation Explicit ở màn lưới.
- View không tham chiếu gameplay; Presenter nghe ScriptableObject event channel.
- Font: NotoSans-VN làm fallback, atlas Static, kèm chuỗi test đủ dấu tiếng Việt.

Sau khi viết, liệt kê mọi Graphic còn Raycast Target bật và mọi chỗ cấp phát string trong Update.
```

**Bẫy thường gặp:** AI tách Canvas đúng nhưng đặt `HealthBar` (đổi mỗi lần nhận sát thương) **cùng Canvas** với `DamageNumber` (đổi mỗi frame) vì "cùng là combat UI". Kết quả: thanh máu vẫn bị rebuild mỗi frame khi có số bay. Tách theo **tần suất đổi**, không theo chủ đề — kiểm tra bằng `Canvas.BuildBatch` trong Profiler, không kiểm tra bằng đọc tên Canvas.

## 💻 Code

Demo dựng một HUD máu theo MVP trên UGUI: Canvas tách theo tần suất đổi, vùng bấm bám `Screen.safeArea`, View không cấp phát và chỉ đụng Graphic khi giá trị đổi, Presenter throttle 10 Hz. Kiểm chứng được bằng `Canvas.BuildBatch` trong Profiler và Device Simulator.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 380" role="img" aria-label="Hierarchy UI_Root với Canvas_Static, Canvas_HUD chứa SafeArea, HP_Group, HP_Bar, HP_Text; Inspector hiện Canvas Scaler, Canvas, Image, TMP, HudView, HudPresenter">
  <rect x="10" y="10" width="200" height="360" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <rect x="16" y="50" width="188" height="18" rx="4" fill="#b197fc" opacity="0.18"/>
  <text x="22" y="63" class="fig-label" font-size="12" font-weight="600">▾ UI_Root  (HudPresenter)</text>
  <text x="30" y="81" class="fig-label" font-size="12">▾ Canvas_Static</text>
  <text x="46" y="97" class="fig-muted" font-size="11">Frame_BG  (Image, ngoài SafeArea)</text>
  <rect x="16" y="102" width="188" height="18" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="30" y="115" class="fig-label" font-size="12" font-weight="600">▾ Canvas_HUD</text>
  <text x="42" y="131" class="fig-label" font-size="12">▾ SafeArea  (SafeAreaFitter)</text>
  <text x="54" y="147" class="fig-label" font-size="12">▾ HP_Group  (HudView)</text>
  <text x="66" y="163" class="fig-muted" font-size="11">HP_Bar  (Image Filled)</text>
  <text x="66" y="179" class="fig-muted" font-size="11">HP_Text  (TMP)</text>
  <text x="30" y="197" class="fig-muted" font-size="11">EventSystem</text>
  <line x1="10" y1="210" x2="210" y2="210" class="fig-line"/>
  <text x="22" y="230" class="fig-muted" font-size="11">Canvas_Static: không bao giờ dirty</text>
  <text x="22" y="248" class="fig-muted" font-size="11">Canvas_HUD: đổi ≤ 10 Hz (throttle)</text>
  <text x="22" y="266" class="fig-muted" font-size="11">Frame_BG ngoài SafeArea → tràn màn</text>
  <text x="22" y="284" class="fig-muted" font-size="11">Bar/Text trong SafeArea → né notch</text>
  <text x="22" y="316" class="fig-muted" font-size="11">Device Simulator:</text>
  <text x="22" y="332" class="fig-muted" font-size="11">iPhone 15 · Galaxy S24 U · iPad</text>
  <text x="22" y="356" class="fig-muted" font-size="11">Demo: J −7 · K +15 · giữ H −1/frame</text>
  <rect x="226" y="10" width="424" height="360" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector — 6 component chính</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Canvas Scaler  ·  Canvas_Static (và Canvas_HUD)</text>
  <text x="250" y="82" class="fig-muted" font-size="11">UI Scale Mode</text><text x="440" y="82" class="fig-label" font-size="11">Scale With Screen Size</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Reference Resolution</text><text x="440" y="98" class="fig-label" font-size="11">X 1920   Y 1080</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Match Width Or Height</text><text x="440" y="114" class="fig-label" font-size="11">0.5</text>
  <rect x="234" y="124" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="137" class="fig-label" font-size="12" font-weight="600">Canvas  ·  Canvas_HUD</text>
  <text x="250" y="156" class="fig-muted" font-size="11">Render Mode</text><text x="440" y="156" class="fig-label" font-size="11">Screen Space – Overlay</text>
  <text x="250" y="172" class="fig-muted" font-size="11">Pixel Perfect</text><text x="440" y="172" class="fig-label" font-size="11">☐</text>
  <rect x="234" y="182" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="195" class="fig-label" font-size="12" font-weight="600">Image  ·  HP_Bar</text>
  <text x="250" y="214" class="fig-muted" font-size="11">Image Type / Fill Method</text><text x="440" y="214" class="fig-label" font-size="11">Filled  /  Horizontal</text>
  <text x="250" y="230" class="fig-muted" font-size="11">Raycast Target</text><text x="440" y="230" class="fig-label" font-size="11">☐</text>
  <rect x="234" y="240" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="253" class="fig-label" font-size="12" font-weight="600">TextMeshPro – Text (UI)  ·  HP_Text</text>
  <text x="250" y="272" class="fig-muted" font-size="11">Raycast Target</text><text x="440" y="272" class="fig-label" font-size="11">☐</text>
  <rect x="234" y="282" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="295" class="fig-label" font-size="12" font-weight="600">Hud View (Script)  ·  HP_Group</text>
  <text x="250" y="314" class="fig-muted" font-size="11">Fill / Label</text><text x="440" y="314" class="fig-label" font-size="11">HP_Bar  /  HP_Text</text>
  <rect x="234" y="324" width="408" height="18" rx="3" fill="#b197fc" opacity="0.22"/>
  <text x="242" y="337" class="fig-label" font-size="12" font-weight="600">Hud Presenter (Script)  ·  UI_Root</text>
  <text x="250" y="356" class="fig-muted" font-size="11">View / Max Hp / Push Interval</text><text x="440" y="356" class="fig-label" font-size="11">HP_Group  /  100  /  0.1</text>
</svg>
<figcaption>Canvas_Static và Canvas_HUD là hai Canvas gốc riêng, cùng thiết lập Scaler (hoặc lồng Canvas_HUD vào Canvas_Static để kế thừa Scaler — vẫn cô lập rebuild). Mọi Graphic tắt Raycast Target vì HUD này không bấm được.</figcaption>
</figure>

**Script**

```csharp
// SafeAreaFitter.cs — Unity 6 (6000.x). Gắn lên RectTransform con trực tiếp của Canvas_HUD; mọi thứ bấm được là con của nó.
using UnityEngine;

[RequireComponent(typeof(RectTransform))]
[ExecuteAlways]                                   // áp dụng cả trong Edit Mode để thấy ngay khi đổi thiết bị trong Device Simulator
public class SafeAreaFitter : MonoBehaviour
{
    RectTransform rt;
    Rect lastSafe;
    Vector2Int lastScreen;
    ScreenOrientation lastOrientation;

    void Awake()    { rt = GetComponent<RectTransform>(); Apply(); }
    void OnEnable() { Apply(); }

    void Update()
    {
        // Ba phép so sánh struct mỗi frame — rẻ. Phải kiểm trong Update vì một số Android trả
        // safeArea = cả màn hình ở frame đầu, và xoay máy không có callback riêng.
        if (Screen.safeArea != lastSafe
            || Screen.width != lastScreen.x || Screen.height != lastScreen.y
            || Screen.orientation != lastOrientation)
            Apply();
    }

    void Apply()
    {
        if (rt == null) rt = GetComponent<RectTransform>();
        lastSafe = Screen.safeArea;
        lastScreen = new Vector2Int(Screen.width, Screen.height);
        lastOrientation = Screen.orientation;
        if (lastScreen.x == 0 || lastScreen.y == 0) return;   // Editor đôi lúc trả 0 khi chưa có Game view

        Vector2 min = lastSafe.position;
        Vector2 max = lastSafe.position + lastSafe.size;
        min.x /= lastScreen.x; min.y /= lastScreen.y;
        max.x /= lastScreen.x; max.y /= lastScreen.y;

        rt.anchorMin = min;
        rt.anchorMax = max;
        rt.offsetMin = rt.offsetMax = Vector2.zero;           // anchor lo hết, không còn offset tay
    }
}
```

```csharp
// HudView.cs — View thuần: chỉ vẽ, không biết PlayerHealth là gì. Test được không cần gameplay bằng menu chuột phải.
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class HudView : MonoBehaviour
{
    [SerializeField] Image fill;            // HP_Bar — Image Type: Filled, Fill Method: Horizontal, Raycast Target tắt
    [SerializeField] TMP_Text label;        // HP_Text — Raycast Target tắt

    int lastCur = int.MinValue, lastMax = int.MinValue;

    public void SetHealth(int cur, int max)
    {
        if (cur == lastCur && max == lastMax) return;    // không đổi → không đụng Graphic → Canvas không dirty
        lastCur = cur; lastMax = max;

        fill.fillAmount = max > 0 ? (float)cur / max : 0f;
        label.SetText("{0}/{1}", cur, max);              // TMP format số vào buffer nội bộ: 0 B alloc
    }

    [ContextMenu("Render 37/100 (test View không cần gameplay)")]
    void DebugRender() => SetHealth(37, 100);
}
```

```csharp
// HudPresenter.cs — nghe event từ model, đẩy vào View với throttle 10 Hz. Model PlayerHealth giả lập nằm cuối file.
using UnityEngine;
using UnityEngine.InputSystem;

public class HudPresenter : MonoBehaviour
{
    [SerializeField] HudView view;
    [SerializeField, Min(1)] int maxHp = 100;
    [SerializeField, Min(0f)] float pushInterval = 0.1f;   // Canvas_HUD đổi tối đa 10 lần/giây

    PlayerHealth model;
    bool dirty;
    int pendingCur, pendingMax;
    float nextPush;

    void Awake() => model = new PlayerHealth(maxHp);

    void OnEnable()
    {
        model.Changed += OnHealthChanged;
        OnHealthChanged(model.Current, model.Max);
        Flush();                                          // lần đầu đẩy ngay, không đợi throttle
    }

    void OnDisable() => model.Changed -= OnHealthChanged;

    void OnHealthChanged(int cur, int max)
    {
        pendingCur = cur; pendingMax = max; dirty = true; // chỉ ghi nhớ giá trị mới nhất, không đụng View ở đây
    }

    void Update()
    {
        // Input demo: J trừ 7, K hồi 15, giữ H trừ 1 mỗi frame (60 event/giây) để thấy throttle làm việc
        var kb = Keyboard.current;
        if (kb != null)
        {
            if (kb.jKey.wasPressedThisFrame) model.Damage(7);
            if (kb.kKey.wasPressedThisFrame) model.Heal(15);
            if (kb.hKey.isPressed) model.Damage(1);
        }

        if (dirty && Time.unscaledTime >= nextPush) Flush();
    }

    void Flush()
    {
        view.SetHealth(pendingCur, pendingMax);
        dirty = false;
        nextPush = Time.unscaledTime + pushInterval;
    }
}

/// Model giả lập — plain C#, không MonoBehaviour. Dự án thật thay bằng model / event channel của bạn (xem unity-design-patterns).
public class PlayerHealth
{
    public int Current { get; private set; }
    public int Max { get; private set; }
    public event System.Action<int, int> Changed;

    public PlayerHealth(int max) { Max = max; Current = max; }

    public void Damage(int amount)
    {
        int next = Mathf.Max(0, Current - amount);
        if (next == Current) return;                      // đã 0 máu: không bắn event thừa
        Current = next; Changed?.Invoke(Current, Max);
    }

    public void Heal(int amount)
    {
        int next = Mathf.Min(Max, Current + amount);
        if (next == Current) return;
        Current = next; Changed?.Invoke(Current, Max);
    }
}
```

**Chạy thử**
- Play, không bấm gì: Profiler ▸ UI ▸ `Canvas.BuildBatch` = 0 lần/giây cho cả hai Canvas. Nhấn J: text `93/100`, `fillAmount` 0.93, chỉ Canvas_HUD rebuild **một** lần; Canvas_Static vẫn 0.
- Giữ H trong 1 giây: model bắn ~60 event nhưng Canvas_HUD chỉ rebuild ~10 lần (Push Interval 0.1). Đặt Push Interval = 0 → ~60 lần. Nhấn K khi đã 100 máu: không có event, không rebuild.
- Profiler ▸ Memory ▸ GC Alloc của `HudView.SetHealth` = 0 B. Thử đổi thành `label.text = $"{cur}/{max}"` để thấy ~40–60 B mỗi lần gọi.
- Device Simulator iPhone 15 landscape → xoay portrait: khung `SafeArea` co lại ngay frame kế, HP_Bar/HP_Text không dưới notch hay thanh home; Frame_BG (ngoài SafeArea) vẫn tràn hết màn.
- Không Play, chuột phải header Hud View ▸ "Render 37/100": HUD hiện `37/100` — View chạy độc lập gameplay. Bật Pixel Perfect trên Canvas_HUD rồi giữ H: rebuild tăng gấp đôi vì snap vị trí mỗi frame.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Anchor và pivot khác nhau thế nào? Canvas có mấy Render Mode?**
  → **Anchor** neo RectTransform vào cha — nó quyết định phần tử co giãn ra sao khi cha đổi kích thước. **Pivot** là điểm gốc của chính phần tử, dùng cho xoay và scale. Canvas có ba Render Mode: Screen Space – Overlay (mặc định, vẽ sau cùng), Screen Space – Camera (chịu ảnh hưởng camera, chèn được hiệu ứng), và World Space (UI nằm trong thế giới).
- `Junior` **`Canvas Scaler` cài sao cho UI đúng trên nhiều tỉ lệ màn hình?**
  → `UI Scale Mode = Scale With Screen Size`, đặt `Reference Resolution` bằng tỉ lệ thiết kế, rồi chỉnh `Match` giữa Width và Height theo hướng game: game dọc thường Match nghiêng về Width, game ngang nghiêng về Height. Để `Constant Pixel Size` là UI sẽ bé xíu trên máy độ phân giải cao.
- `Junior` **Safe area trên điện thoại tai thỏ xử lý thế nào?**
  → Một component đọc `Screen.safeArea` rồi đặt anchor của một RectTransform bọc ngoài toàn bộ UI. Phải test cả xoay ngang và cả máy màn hình đục lỗ. Đây là loại lỗi **chỉ lộ trên thiết bị thật** — giả lập không thấy — nên nó hay tới tay QA ở tuần cuối.
- `Mid` **UI làm tụt fps. Anh bắt đầu từ đâu?**
  → Profiler, tìm hai cái tên: `Canvas.SendWillRenderCanvases` và `Canvas.BuildBatch`. Chúng nói chi phí nằm ở **rebuild**, và luật của rebuild là một phần tử đổi thì **cả Canvas** dựng lại mesh. Nên cách chữa là **tách Canvas theo tần suất đổi**, không phải giảm số UI.
- `Mid` **Tách Canvas theo tiêu chí gì?**
  → Theo **tần suất thay đổi**, không theo chủ đề. HUD tĩnh một Canvas, thanh máu một Canvas, số damage bay mỗi frame một Canvas riêng. Tách theo chủ đề — "combat UI chung một Canvas" — là sai, vì số damage nhảy mỗi frame sẽ kéo cả thanh máu và khung ảnh nhân vật rebuild theo.
- `Mid` **Ba việc rẻ mà hiệu quả nhất với UI Unity là gì?**
  → Tắt `Raycast Target` trên mọi `Image`/`Text` không bấm được — mặc định nó bật, và mỗi cái là một phép kiểm mỗi lần chạm. Bỏ Layout Group lồng nhau ở chỗ nóng, vì mỗi tầng là một lượt dirty lan xuống. Và pool item trong list thay vì `Instantiate` khi mở.
- `Senior` **Trước khi ship, anh làm gì với TextMeshPro?**
  → Ba việc. Dùng `label.SetText("{0}/{1}", hp, max)` thay `label.text = $"..."` — 0 byte alloc thay vì một string mới mỗi frame. Đổi atlas sang **Static** và Update Atlas Texture với toàn bộ chuỗi trong game; Dynamic render SDF lúc chạy, 0,5–2 ms mỗi glyph mới, đúng lúc người chơi mở màn hình. Và kiểm **tiếng Việt** — phần lớn font đẹp thiếu `ẳ ỡ ữ`, TMP không báo lỗi mà lặng lẽ hiện ô vuông.
- `Senior` **UGUI hay UI Toolkit cho HUD game mobile?**
  → Runtime HUD mobile: **UGUI**, vì UI Toolkit runtime chưa có world-space, khó gắn shader/material/particle vào UI, và không dùng Animator được. Editor tool thì ngược lại — UI Toolkit là thứ Unity khuyến nghị, và UXML/USS là text nên dễ diff, dễ để agent sửa. Trả lời "cái nào cũng được" là trả lời trượt.
- `Senior` **Game có 20 màn hình UI — kiến trúc thế nào để không thành 20 `if`?**
  → Mỗi màn hình là một prefab có `Show()/Hide()` async. Một `UIStack` quản lý push/pop và cả nút Back của Android. View **không biết** gameplay: nó nhận dữ liệu và bắn event lên. Lợi ích thực tế lớn nhất là mở thẳng một màn hình để test được, không phải bấm qua bốn menu mỗi lần sửa một chữ.

**Khung trả lời 60 giây** — "UI tụt fps, anh debug thế nào?"

> Mở Profiler tìm hai cái tên: `Canvas.SendWillRenderCanvases` và `Canvas.BuildBatch`. Chúng nói rằng chi phí nằm ở **rebuild**, và luật của rebuild là: một phần tử đổi thì **cả Canvas** dựng lại mesh. Nên cách chữa không phải là giảm số UI, mà là **tách Canvas theo tần suất đổi** — HUD tĩnh một Canvas, thanh máu một Canvas, số damage bay mỗi frame một Canvas riêng. Tách theo chủ đề ("combat UI chung một Canvas") là sai, vì số damage sẽ kéo thanh máu rebuild theo.
>
> Sau đó là ba việc rẻ: tắt `Raycast Target` trên mọi `Image`/`Text` không bấm được — mặc định nó bật và mỗi cái là một phép kiểm mỗi lần chạm; bỏ Layout Group lồng nhau ở chỗ nóng, vì mỗi tầng là một lượt dirty lan xuống; và pool các item trong list thay vì `Instantiate` khi mở.

**Họ sẽ đào tiếp**

- *"UGUI hay UI Toolkit?"* → Runtime HUD game mobile: **UGUI**, vì UI Toolkit runtime chưa có world-space, khó gắn shader/material/particle vào UI, và không dùng Animator được. Editor tool thì ngược lại — UI Toolkit là thứ Unity khuyến nghị, và UXML/USS là text nên dễ diff, dễ để AI sửa. Trả lời "cái nào cũng được" là trả lời trượt.
- *"TextMeshPro, ba việc?"* → (1) `label.SetText("{0}/{1}", hp, max)` thay cho `label.text = $"..."` — 0 byte alloc thay vì một string mới mỗi frame. (2) Đổi atlas sang **Static** và Update Atlas Texture với toàn bộ chuỗi trong game trước khi ship; Dynamic render SDF lúc chạy, 0.5–2ms mỗi glyph mới, đúng lúc người chơi mở màn hình. (3) **Tiếng Việt**: phần lớn font đẹp thiếu `ẳ ỡ ữ`; TMP không báo lỗi, nó lặng lẽ tìm Fallback rồi hiện ô vuông. Dán một chuỗi đủ dấu vào TMP ngay tuần đầu.
- *"Safe area?"* → Tai thỏ và thanh gesture: một component đọc `Screen.safeArea` rồi đặt anchor của một RectTransform bọc ngoài. Phải test cả xoay ngang và cả máy có màn hình đục lỗ; đây là loại lỗi chỉ lộ trên thiết bị thật, giả lập không thấy.
- *"UI khi `timeScale = 0`?"* → Animator của UI phải để `Unscaled Time`, tween phải `SetUpdate(true)`, và mọi coroutine đợi phải là `WaitForSecondsRealtime` — nếu không, menu pause đứng hình đúng lúc cần nó nhất.
- *"Kiến trúc 20 màn hình?"* → Mỗi màn hình là một prefab có `Show()/Hide()` async, một `UIStack` quản lý push/pop và nút Back của Android, View **không biết** gameplay — nó nhận dữ liệu và bắn event lên. Nhờ vậy mở thẳng một màn hình để test được, không phải bấm qua bốn menu.

**Cờ đỏ**

- Không biết một Canvas rebuild là rebuild **toàn bộ** Canvas đó.
- Để `Raycast Target` bật trên mọi thứ, kể cả ảnh nền.
- `GameObject.Find("HealthBar")` trong `Update`.
- Bật/tắt UI bằng `SetActive` liên tục cho popup nặng (mỗi lần bật là một lần rebuild + `Awake` lại) thay vì tắt `CanvasGroup.alpha` + `blocksRaycasts` hoặc tắt component `Canvas`.
- Nói "UI Toolkit mới hơn nên tốt hơn" mà không biết nó thiếu world-space ở runtime.

**Số / ví dụ nên thuộc**

- Tên trong Profiler: `Canvas.SendWillRenderCanvases`, `Canvas.BuildBatch`.
- TMP dynamic atlas: 0.5–2ms cho mỗi glyph mới, và glyph không bị xoá khỏi RAM.
- CJK gần như luôn cần atlas 4096 và font riêng.
- Chuỗi test tiếng Việt: `ăâđêôơư ắằẳẵặ ấầẩẫậ ếềểễệ ốồổỗộ ớờởỡợ ứừửữự`.
