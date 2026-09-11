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
