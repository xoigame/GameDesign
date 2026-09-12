---
title: Thư viện ngoài — chọn, cách ly, tích hợp
icon: 🧩
summary: Bản đồ built-in trước / thư viện ngoài sau, bảy tiêu chí chọn, luật bọc sau interface của mình, và bẫy tích hợp thật — asmdef, EDM4U, Gradle, stripping, DOTween.
status: deep
read: 765
level: intermediate
order: 165
tags: [unity, third-party, plugin, tooling, build]
related: [unity-project-structure, unity-build-platform, unity-design-patterns, unity-monetization-sdk, tech-stack]
---

Mỗi thư viện đưa vào dự án là một món nợ có lãi: lãi trả bằng thời gian nâng phiên bản Unity, thời gian gỡ xung đột Gradle, và thời gian viết lại khi tác giả ngừng bảo trì. Nó vẫn thường đáng — nhưng chỉ khi bạn trả lời được một câu trước: **thứ này thay cho bao nhiêu ngày công của mình?** Dưới hai ngày thì tự viết gần như luôn rẻ hơn.

## Built-in trước, ngoài sau

Rất nhiều thư viện phổ biến ra đời khi Unity chưa có thứ tương đương. Bảng này là trạng thái hiện tại (Unity 6 + URP):

| Việc | Có sẵn trong Unity | Thư viện ngoài hay dùng | Ra ngoài khi nào |
|---|---|---|---|
| Tween / animation bằng code | Không có tween chính thức; `Awaitable` + `Mathf.Lerp` đủ cho việc đơn giản | **DOTween** (miễn phí + Pro), PrimeTween, LitMotion | Cần sequence, callback, ease đầy đủ, hàng trăm tween cùng lúc |
| Bất đồng bộ | **`Awaitable`** (Unity 6) | UniTask | Cần chạy trên Unity cũ, hoặc cần bộ toán tử phong phú |
| JSON | `JsonUtility` | **`com.unity.nuget.newtonsoft-json`** (bản chính thức) | Cần Dictionary, đa hình, đọc JSON tuỳ ý — xem [[unity-save-data]] |
| Inspector / công cụ | Attribute built-in, UI Toolkit | Odin Inspector (per-seat), NaughtyAttributes (MIT) | Nhiều ScriptableObject phức tạp — xem [[unity-editor-tools]] |
| Tìm đường | NavMesh (`AI Navigation`) | A* Pathfinding Project | Lưới 2D, hàng trăm agent, cần điều khiển thuật toán |
| Input | **Input System** | Rewired | Console đời cũ, ma trận thiết bị phức tạp |
| Multiplayer | Netcode for GameObjects | Mirror, **Photon Fusion** | Xem [[unity-multiplayer]] — đừng chọn theo tên, chọn theo mô hình authority |
| Audio | AudioMixer + snapshot | FMOD, Wwise | Có sound designer làm song song — xem [[unity-audio]] |
| Camera | **Cinemachine** | (hiếm khi cần) | Xem [[unity-camera]] |
| DI | (không có) | VContainer, Zenject | Xem [[unity-design-patterns]] |
| Bản địa hoá | `com.unity.localization` | I2 Localization | Cần workflow dịch có sẵn, nhiều định dạng nhập/xuất |
| Game feel | (không có) | Feel (More Mountains) | Muốn thư viện hiệu ứng dựng sẵn thay vì tự ghép |

Nhìn bảng này, quy tắc hiện ra: **thư viện đáng nhất là thứ Unity không định làm** (tween, DI, middleware audio), còn thứ Unity đã làm thì dùng bản của Unity để đỡ một nguồn xung đột.

## Bảy tiêu chí chọn

Xếp theo mức độ hay bị bỏ qua, không theo mức quan trọng:

1. **Có đụng native không** (`.aar`, `.jar`, CocoaPods, `.so`). Thư viện C# thuần thì tệ nhất là lỗi biên dịch; thư viện có native kéo theo Gradle, EDM4U, và những buổi chiều không code được dòng nào.
2. **Lần cập nhật gần nhất và ai đang bảo trì.** Một người duy nhất, im lặng 18 tháng, trong khi Unity ra bản mới mỗi năm — đó là rủi ro bạn sẽ gánh, không phải họ.
3. **Có source hay chỉ có DLL.** Có source thì fork được, sửa được, debug bước vào được. Chỉ có DLL nghĩa là khi nó hỏng trên bản Unity mới, bạn chỉ còn cách chờ.
4. **An toàn với IL2CPP + stripping.** Thư viện dựa nhiều vào reflection cần `link.xml`; nếu tác giả không nhắc gì tới AOT, coi như bạn sẽ là người phát hiện — trên build release, xem [[unity-build-platform]].
5. **License và cách tính tiền.** MIT/Apache là rẻ nhất về lâu dài. Per-seat thì nhân với số người sẽ dùng (kể cả người mới vào). Tính theo CCU hoặc doanh thu thì đó là chi phí **vận hành**, không phải chi phí mua.
6. **Có asmdef riêng không.** Không có thì code của bạn trong asmdef **không tham chiếu tới nó được** — chi tiết ở phần dưới.
7. **Kích cỡ build và ảnh hưởng tới thời gian biên dịch.** Một thư viện editor to làm chậm mọi lần recompile của cả đội, kể cả người không dùng nó.

## Luật cách ly: bọc sau interface của mình

Đây là luật đáng giá nhất trong node này. Gọi API của thư viện rải rác trong 300 file nghĩa là **đổi hoặc bỏ nó là viết lại dự án**. Một lớp bọc mỏng thì rẻ:

```csharp
public interface ITweenService {
    ITweenHandle MoveTo(Transform t, Vector3 target, float seconds);
    void KillAllOn(GameObject owner);
}
```

Gameplay chỉ biết `ITweenService`. Bên trong nó là DOTween, PrimeTween, hay coroutine tự viết là chuyện của một file. Lợi ích thấy ngay, không phải lợi ích giả định:

- Đổi thư viện là sửa một adapter, không phải 300 chỗ.
- Test logic không cần thư viện thật — tiêm bản giả, xem [[unity-testing-ci]].
- Chỗ nào cũng phải đi qua adapter nên **dễ áp luật chung** (ví dụ: mọi tween đều tự huỷ khi owner bị destroy).

Ngoại lệ hợp lý: thư viện đã trở thành *ngôn ngữ* của dự án và gần như không thể thay (Cinemachine, Input System, engine networking). Bọc chúng lại chỉ tạo thêm một tầng vô ích.

## Đặt ở đâu trong project

| Cách | Ưu | Nhược |
|---|---|---|
| `Packages/` qua UPM (git URL hoặc registry) | Nâng cấp bằng một dòng trong `manifest.json`; không lẫn vào `Assets/` | Chỉ dùng được nếu tác giả có hỗ trợ UPM |
| `Assets/Plugins/<Tên>/` | Cách phổ biến của Asset Store | Lẫn vào cây asset; **code trong `Plugins/` biên dịch vào assembly tiền định nghĩa** |
| `Assets/_Project/ThirdParty/` (tự chép vào) | Kiểm soát hoàn toàn, sửa được | Nâng cấp = merge tay, dễ mất sửa đổi |

Cái bẫy ở dòng thứ hai đáng nói kỹ: code rời trong `Plugins/` đi vào assembly tiền định nghĩa, mà **assembly có asmdef không tham chiếu ngược được vào đó**. Dự án nào đã chia asmdef theo feature ([[unity-project-structure]]) sẽ gặp lỗi "type or namespace not found" mà mọi thứ nhìn vẫn đúng. Cách chữa: thư viện phải có asmdef riêng (DOTween sinh được qua Utility Panel), hoặc bạn tự thêm một asmdef vào thư mục của nó.

## DOTween — những thứ chỉ lộ ra khi làm thật

Thư viện được dùng nhiều nhất, và cũng là thư viện bị dùng sai nhiều nhất:

- **Chạy Utility Panel sau khi import** (`Tools > Demigiant > DOTween Utility Panel > Setup`). Nó bật các module (UI, TextMeshPro, Physics) và sinh asmdef. Bỏ qua bước này thì `DOText`, `DOFade` trên UI đơn giản là **không tồn tại**, và lỗi trông như bạn gõ sai tên hàm.
- **Tween không tự chết theo object.** Object bị `Destroy` giữa chừng mà tween còn chạy là `MissingReferenceException` ở một frame ngẫu nhiên sau đó. Chữa bằng `.SetLink(gameObject)` cho mọi tween, hoặc `DOTween.Kill(transform)` trong `OnDestroy` — và ép luật đó ở adapter thay vì trông chờ mọi người nhớ.
- **`timeScale = 0`**: tween dừng theo. UI trong menu pause phải `.SetUpdate(true)` — cùng họ với bẫy ở [[unity-game-loop]].
- **Safe Mode** bắt lỗi tween trỏ vào object đã chết rồi im lặng huỷ. Rất tiện lúc phát triển; nhưng nó cũng **giấu đi** chính cái lỗi bạn cần biết, nên đừng coi việc không thấy lỗi là bằng chứng code đúng.
- **Capacity**: `DOTween.SetTweensCapacity(500, 100)` lúc khởi động. Vượt ngưỡng mặc định thì DOTween cấp phát lại mảng nội bộ ngay giữa gameplay — một cú GC không ai ngờ tới, xem [[unity-csharp-memory]].
- **`SetAutoKill(false)` + `Restart()`** cho tween dùng lại nhiều lần (thanh máu, nút bấm): tránh tạo tween mới mỗi lần. Đổi lại bạn phải tự `Kill()` khi xong đời object.
- **`DOText` cấp phát chuỗi mỗi frame.** Với HUD đổi liên tục, dùng cách khác.

## Bẫy tích hợp lộ ra khi build

- **Trùng Newtonsoft.** Nhiều SDK đóng gói sẵn `Newtonsoft.Json.dll` riêng; cộng với package chính thức là hai bản trong build → lỗi "duplicate assembly". Chọn một: xoá DLL của SDK, hoặc bỏ package.
- **EDM4U** (External Dependency Manager) do nhiều SDK cùng mang theo, mỗi cái một phiên bản. Giữ **bản mới nhất**, xoá phần còn lại, rồi *Force Resolve* — chi tiết ở [[unity-monetization-sdk]].
- **Template Gradle tự sửa** (`mainTemplate.gradle`, `gradleTemplate.properties`) không tự cập nhật khi nâng Unity. Sau mỗi lần nâng bản, so lại template của mình với template mặc định mới.
- **Thư viện native cũ** chưa build lại cho yêu cầu page size 16KB của Android hiện đại sẽ rớt ở khâu cài đặt, không phải khâu biên dịch.
- **Stripping** xoá phần bị gọi qua reflection: thư viện chạy trong Editor, chết trên bản Release. `link.xml` hoặc `[Preserve]`.
- **Thư mục `Editor/`**: thư viện trộn code editor vào assembly runtime sẽ làm **build hỏng** với lỗi `UnityEditor` không tồn tại. Đây là dấu hiệu chất lượng đáng để loại từ vòng đánh giá.

## Nâng cấp và gỡ bỏ

Nâng thư viện là một nhiệm vụ riêng, làm trên **nhánh riêng**, không nhét kèm tính năng: đọc changelog, nâng, build **cả Android lẫn iOS**, chạy qua một lượt gameplay. Nhiều thư viện Asset Store không hỗ trợ nâng đè — phải xoá thư mục cũ rồi import lại, và mọi sửa đổi tay của bạn trong đó sẽ bay. Đó là lý do thứ hai (sau khả năng thay thế) để **không sửa thẳng vào code thư viện**: cần sửa thì ghi lại thành patch và ghi chú trong `_Project/ThirdParty/README.md`.

## Kiểm tra nhanh

- [ ] Mỗi thư viện ngoài có một dòng ghi: vì sao chọn, thay cho bao nhiêu ngày công, ai bảo trì
- [ ] Thư viện quan trọng nằm sau interface của mình, không gọi thẳng khắp nơi
- [ ] Thư viện có asmdef riêng, hoặc bạn đã tự thêm
- [ ] Đã build **release trên thiết bị thật** sau mỗi lần thêm/nâng thư viện
- [ ] Không có hai bản Newtonsoft / EDM4U trong project
- [ ] Sửa đổi tay trong code thư viện được ghi lại ở một chỗ
- [ ] License được kiểm trước khi phát hành (per-seat đủ ghế, revenue share đã tính vào)

## 🤖 Prompt cho AI

**Dùng AI thế nào với thư viện ngoài**

Đây là vùng AI sai nhiều nhất trong Unity, và sai theo kiểu khó phát hiện: **nó bịa API rất giống thật**. `DOTween.SetLink`, `SetRecyclable`, các overload của `DOMove` — mỗi bản có khác biệt nhỏ, và model trộn lẫn nhiều bản trong dữ liệu huấn luyện. Code sinh ra nhìn hợp lý, biên dịch mới biết.

Nên chia việc theo mức độ kiểm chứng được:

| Giao được ngay | Phải tự kiểm |
|---|---|
| Viết **adapter** bọc thư viện sau interface của bạn (chỉ cần biết interface) | Tên và chữ ký API của thư viện |
| Chuyển code từ thư viện A sang B khi bạn dán API của cả hai | Phiên bản nào có tính năng nào |
| So sánh hai thư viện theo **tiêu chí bạn đưa ra** | Giá, license, tình trạng bảo trì (dữ liệu cũ) |
| Viết `link.xml`, asmdef, checklist nâng cấp | Hành vi thật khi build release |

Mẹo hiệu quả nhất: **dán đoạn tài liệu hoặc file API thật vào prompt** rồi bắt AI chỉ dùng những gì có trong đó. Và luôn yêu cầu nó đánh dấu chỗ nó không chắc — một danh sách "tôi không chắc ba hàm này có trong bản 1.2" tiết kiệm hơn nhiều so với một câu trả lời tự tin đều.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Tên và số hiệu phiên bản** thư viện, cộng phiên bản Unity. Đây là thông tin bắt buộc, không phải chi tiết phụ.
- Thư viện đặt ở đâu (`Packages/`, `Plugins/`) và code của bạn có nằm trong asmdef không.
- Có được phép sửa code thư viện không (mặc định: không).
- Nền tảng đích — quyết định phần native và stripping.
- Bạn muốn adapter hay dùng thẳng; nếu adapter thì interface do bạn định nghĩa ra sao.

**Mẫu prompt**

```
Unity 6 (6000.0), DOTween 1.2.765 (bản miễn phí), code gameplay nằm trong
asmdef Game.Gameplay. Viết adapter TweenService:
- Cài đặt interface ITweenService tôi đưa dưới đây: <dán>
- Mọi tween PHẢI tự huỷ khi owner GameObject bị destroy
- Mọi tween UI phải chạy được khi Time.timeScale = 0
- Gọi SetTweensCapacity một lần lúc khởi tạo

Ràng buộc: CHỈ dùng API có trong bản 1.2.765; nếu không chắc một hàm có tồn tại
trong bản đó thì nói ra thay vì dùng. KHÔNG sửa code trong thư mục DOTween.
Cuối câu trả lời liệt kê những API bạn đã dùng và bạn chắc chắn tới đâu về từng cái.
```

**Bẫy thường gặp:** AI viết code dùng tính năng của **bản Pro** (hoặc bản mới hơn bản bạn đang cài) mà không nói gì — lỗi hiện ra là "method not found", và người ta mất nửa buổi tưởng mình cài sai. Cùng họ với bẫy đó: nó đề xuất một thư viện đã ngừng bảo trì ba năm bằng giọng rất chắc chắn, vì trong dữ liệu huấn luyện thư viện đó còn sống. **Luôn tự mở trang chủ/repo xem lần commit gần nhất** trước khi tin một lời giới thiệu thư viện — đó là việc của bạn, không phải của nó.

## 💻 Code

Demo dựng đúng luật cách ly: một `ITweenService` do bạn định nghĩa, một bản cài đặt **chạy được ngay không cần cài gì** (coroutine), và một bản DOTween nằm sau define symbol. Đổi thư viện là đổi một dòng đăng ký. Mọi tween tự chết theo owner — luật ép ở adapter, không trông chờ người gọi nhớ.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Sơ đồ thư mục với Plugins DOTween có asmdef, thư mục Tween của dự án, và Inspector của TweenBootstrap kèm bảng define symbol">
  <rect x="10" y="10" width="250" height="280" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Project</text>
  <line x1="10" y1="42" x2="260" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">▾ Assets/Plugins/</text>
  <text x="38" y="82" class="fig-muted" font-size="11">▾ Demigiant/DOTween/</text>
  <text x="54" y="98" class="fig-label" font-size="11">DOTween.dll</text>
  <text x="54" y="114" class="fig-label" font-size="11">DOTween.Modules.asmdef</text>
  <text x="54" y="130" class="fig-muted" font-size="10">(Utility Panel sinh ra — thiếu</text>
  <text x="54" y="144" class="fig-muted" font-size="10">nó thì asmdef của bạn không</text>
  <text x="54" y="158" class="fig-muted" font-size="10">tham chiếu tới DOTween được)</text>
  <rect x="16" y="168" width="238" height="20" rx="4" fill="#51cf9b" opacity="0.18"/>
  <text x="22" y="183" class="fig-label" font-size="12" font-weight="600">▾ _Project/Core/Tween/</text>
  <text x="38" y="202" class="fig-muted" font-size="11">ITweenService.cs</text>
  <text x="38" y="218" class="fig-muted" font-size="11">CoroutineTweenService.cs</text>
  <text x="38" y="234" class="fig-muted" font-size="11">DoTweenService.cs</text>
  <text x="38" y="250" class="fig-muted" font-size="11">TweenBootstrap.cs</text>
  <text x="38" y="266" class="fig-label" font-size="11">Game.Core.asmdef</text>
  <text x="22" y="284" class="fig-muted" font-size="10">Gameplay chỉ biết ITweenService.</text>
  <rect x="276" y="10" width="374" height="280" rx="8" class="fig-box"/>
  <text x="288" y="32" class="fig-label" font-size="13" font-weight="600">Inspector / Project Settings</text>
  <line x1="276" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="284" y="50" width="358" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="292" y="63" class="fig-label" font-size="12" font-weight="600">Tween Bootstrap (Script)  — ở scene Boot</text>
  <text x="300" y="82" class="fig-muted" font-size="11">Tweener Capacity</text><text x="500" y="82" class="fig-label" font-size="11">500</text>
  <text x="300" y="98" class="fig-muted" font-size="11">Sequence Capacity</text><text x="500" y="98" class="fig-label" font-size="11">100</text>
  <text x="300" y="114" class="fig-muted" font-size="11">Log Implementation</text><text x="500" y="114" class="fig-label" font-size="11">☑ (in ra bản đang dùng)</text>
  <rect x="284" y="128" width="358" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="292" y="141" class="fig-label" font-size="12" font-weight="600">Player Settings ▸ Scripting Define Symbols</text>
  <text x="300" y="160" class="fig-muted" font-size="11">Chưa cài DOTween</text><text x="500" y="160" class="fig-label" font-size="11">(để trống)</text>
  <text x="300" y="176" class="fig-muted" font-size="11">Đã cài DOTween</text><text x="500" y="176" class="fig-label" font-size="11">USE_DOTWEEN</text>
  <text x="292" y="198" class="fig-muted" font-size="10">Define đặt cho TỪNG nền tảng — nhớ đặt cả Android lẫn iOS.</text>
  <rect x="284" y="210" width="358" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="292" y="223" class="fig-label" font-size="12" font-weight="600">Đổi thư viện = đổi một dòng</text>
  <text x="300" y="242" class="fig-muted" font-size="11">TweenBootstrap.Create()</text>
  <text x="300" y="258" class="fig-muted" font-size="11">Gameplay không đổi một dòng nào</text>
  <text x="300" y="276" class="fig-muted" font-size="11">Test tiêm bản giả cũng qua đây</text>
</svg>
<figcaption>Thư viện nằm ở Plugins với asmdef riêng; adapter nằm trong asmdef của dự án; gameplay chỉ thấy interface.</figcaption>
</figure>

**Script**

```csharp
// ITweenService.cs — Unity 6. Interface của BẠN, không phải của thư viện.
// Gameplay chỉ include file này; không file gameplay nào được "using DG.Tweening".
using System;
using UnityEngine;

public interface ITweenHandle
{
    bool IsActive { get; }
    void Kill(bool complete = false);
}

public interface ITweenService
{
    ITweenHandle MoveTo(Transform target, Vector3 to, float seconds, Action onDone = null, bool unscaled = false);
    ITweenHandle FadeCanvas(CanvasGroup group, float to, float seconds, Action onDone = null, bool unscaled = true);

    /// Huỷ mọi tween thuộc về owner. Adapter tự gắn owner cho từng tween, nên
    /// người gọi không phải nhớ — và không ai quên.
    void KillAllOn(GameObject owner);
}
```

```csharp
// CoroutineTweenService.cs — bản cài đặt KHÔNG cần thư viện nào, chạy được ngay.
// Đủ cho dự án nhỏ, và là lưới an toàn khi còn đang cân nhắc chọn thư viện.
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public sealed class CoroutineTweenService : MonoBehaviour, ITweenService
{
    sealed class Handle : ITweenHandle
    {
        public bool IsActive { get; private set; } = true;
        public bool CompleteOnKill;
        public void Kill(bool complete = false) { CompleteOnKill = complete; IsActive = false; }
        public void Finish() => IsActive = false;
    }

    readonly Dictionary<int, List<Handle>> byOwner = new();   // instanceID của owner -> tween đang chạy

    public ITweenHandle MoveTo(Transform target, Vector3 to, float seconds, Action onDone = null, bool unscaled = false)
    {
        Vector3 from = target.position;
        return Run(target.gameObject, seconds, unscaled, onDone,
                   k => { if (target) target.position = Vector3.LerpUnclamped(from, to, Ease(k)); });
    }

    public ITweenHandle FadeCanvas(CanvasGroup group, float to, float seconds, Action onDone = null, bool unscaled = true)
    {
        float from = group.alpha;
        return Run(group.gameObject, seconds, unscaled, onDone,
                   k => { if (group) group.alpha = Mathf.LerpUnclamped(from, to, Ease(k)); });
    }

    public void KillAllOn(GameObject owner)
    {
        if (!owner || !byOwner.TryGetValue(owner.GetInstanceID(), out var list)) return;
        for (int i = list.Count - 1; i >= 0; i--) list[i].Kill();
        list.Clear();
    }

    static float Ease(float k) { float inv = 1f - k; return 1f - inv * inv * inv; }   // ease-out cubic

    ITweenHandle Run(GameObject owner, float seconds, bool unscaled, Action onDone, Action<float> apply)
    {
        var h = new Handle();
        int key = owner.GetInstanceID();
        if (!byOwner.TryGetValue(key, out var list)) byOwner[key] = list = new List<Handle>();
        list.Add(h);
        StartCoroutine(Play(owner, h, list, seconds, unscaled, onDone, apply));
        return h;
    }

    IEnumerator Play(GameObject owner, Handle h, List<Handle> list,
                     float seconds, bool unscaled, Action onDone, Action<float> apply)
    {
        float k = 0f;
        while (k < 1f && h.IsActive)
        {
            if (!owner) break;                     // owner đã destroy: dừng im lặng, không ném
            k += (unscaled ? Time.unscaledDeltaTime : Time.deltaTime) / Mathf.Max(0.0001f, seconds);
            apply(Mathf.Clamp01(k));
            yield return null;
        }
        if (owner && (h.IsActive || h.CompleteOnKill)) { apply(1f); onDone?.Invoke(); }
        h.Finish();
        list.Remove(h);
    }
}
```

```csharp
// DoTweenService.cs — bản cài đặt bằng DOTween. Chỉ biên dịch khi có define USE_DOTWEEN,
// nên file này nằm trong repo được kể cả khi máy khác chưa import DOTween.
#if USE_DOTWEEN
using System;
using DG.Tweening;
using UnityEngine;

public sealed class DoTweenService : ITweenService
{
    sealed class DoHandle : ITweenHandle
    {
        readonly Tween tween;
        public DoHandle(Tween t) { tween = t; }
        public bool IsActive => tween != null && tween.IsActive();
        public void Kill(bool complete = false) { if (IsActive) tween.Kill(complete); }
    }

    public DoTweenService(int tweeners, int sequences)
    {
        DOTween.Init(recycleAllByDefault: false, useSafeMode: true, logBehaviour: LogBehaviour.ErrorsOnly);
        // Vượt capacity là DOTween cấp phát lại mảng nội bộ GIỮA gameplay -> một cú GC.
        DOTween.SetTweensCapacity(tweeners, sequences);
    }

    public ITweenHandle MoveTo(Transform target, Vector3 to, float seconds, Action onDone = null, bool unscaled = false)
    {
        var t = target.DOMove(to, seconds)
                      .SetUpdate(unscaled)              // true = không theo Time.timeScale
                      .SetLink(target.gameObject)       // tự huỷ khi object bị destroy (DOTween 1.2+)
                      .SetId(target.gameObject.GetInstanceID())
                      .OnComplete(() => onDone?.Invoke());
        return new DoHandle(t);
    }

    public ITweenHandle FadeCanvas(CanvasGroup group, float to, float seconds, Action onDone = null, bool unscaled = true)
    {
        var t = group.DOFade(to, seconds)
                     .SetUpdate(unscaled)
                     .SetLink(group.gameObject)
                     .SetId(group.gameObject.GetInstanceID())
                     .OnComplete(() => onDone?.Invoke());
        return new DoHandle(t);
    }

    // Nhờ SetId ở trên, huỷ theo owner là một lời gọi — không cần tự giữ danh sách.
    public void KillAllOn(GameObject owner) => DOTween.Kill(owner.GetInstanceID());
}
#endif
```

```csharp
// TweenBootstrap.cs — đặt trên GameObject "Systems" ở scene Boot (xem node Vòng đời game).
// ĐỔI THƯ VIỆN = ĐỔI FILE NÀY. Không file gameplay nào phải sửa.
using UnityEngine;

[DefaultExecutionOrder(-500)]
public class TweenBootstrap : MonoBehaviour
{
    public static ITweenService Tween { get; private set; }

    [SerializeField] int tweenerCapacity = 500;
    [SerializeField] int sequenceCapacity = 100;
    [SerializeField] bool logImplementation = true;

    bool isOwner;

    void Awake()
    {
        if (Tween != null) { Destroy(gameObject); return; }   // huỷ bản MỚI, giữ bản cũ
        isOwner = true;
        DontDestroyOnLoad(gameObject);
#if USE_DOTWEEN
        Tween = new DoTweenService(tweenerCapacity, sequenceCapacity);
#else
        Tween = gameObject.AddComponent<CoroutineTweenService>();
#endif
        if (logImplementation) Debug.Log("[Tween] đang dùng " + Tween.GetType().Name);
    }

    void OnDestroy() { if (isOwner) Tween = null; }   // bản trùng đã tự destroy ở Awake
}
```

**Chạy thử**
- Chưa cài DOTween: Play từ scene Boot, Console in `[Tween] đang dùng CoroutineTweenService`. Gọi `TweenBootstrap.Tween.MoveTo(transform, target, 0.5f)` — object chạy tới đích với ease-out.
- **Kiểm chứng luật tự huỷ**: gọi `MoveTo` với thời gian 5 giây rồi `Destroy` object đang tween giữa chừng. Không có `MissingReferenceException` nào — đây chính là lỗi mà một dự án dùng thẳng DOTween rải rác sẽ gặp ở frame ngẫu nhiên.
- Cài DOTween, chạy Utility Panel, thêm define `USE_DOTWEEN` cho **từng nền tảng** trong Player Settings: Console đổi sang `DoTweenService`, gameplay **không sửa một dòng nào**. Đó là toàn bộ giá trị của lớp adapter, đo được trong hai phút.
- Đặt `Time.timeScale = 0` rồi gọi `FadeCanvas`: vẫn chạy, vì mặc định của nó là `unscaled: true`.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | Anh hay dùng thư viện ngoài nào? Dùng để làm gì? |
| Junior | DOTween: tween đang chạy mà object bị destroy thì sao? |
| Mid | Anh quyết định dùng thư viện ngoài hay tự viết dựa trên gì? |
| Mid | Thêm một SDK vào là build Android hỏng. Anh tìm nguyên nhân ở đâu? |
| Senior | Làm sao để sau này đổi hoặc bỏ một thư viện mà không viết lại dự án? |
| Senior | Anh từng phải gỡ bỏ thư viện nào chưa? Vì sao và tốn bao lâu? |

**Khung trả lời 60 giây** — "Chọn thư viện ngoài hay tự viết?"

> Tôi hỏi ba câu theo thứ tự. **Unity đã có chưa?** Rất nhiều thư viện phổ biến ra đời khi engine còn thiếu — giờ `Awaitable`, Input System, Cinemachine, Localization đã có sẵn, dùng bản của Unity là bớt một nguồn xung đột. **Nó thay cho bao nhiêu ngày công của mình?** Dưới hai ngày thì tự viết gần như luôn rẻ hơn, vì mỗi thư viện là một món nợ phải trả lãi mỗi lần nâng Unity. **Nó có đụng native không?** Thư viện C# thuần thì tệ nhất là lỗi biên dịch; thư viện có `.aar` hay CocoaPods kéo theo Gradle, EDM4U, và những buổi chiều không viết được dòng code nào.
>
> Rồi mới tới các tiêu chí thường lệ: lần cập nhật gần nhất, có source hay chỉ có DLL, an toàn với IL2CPP và stripping, license tính theo ghế hay theo doanh thu.
>
> Và dù chọn gì, tôi **bọc nó sau interface của mình**. Gameplay gọi `ITweenService`, không gọi `DG.Tweening`. Nhờ vậy đổi thư viện là sửa một adapter thay vì ba trăm chỗ, và test chạy được mà không cần thư viện thật.

**Họ sẽ đào tiếp**

- *"DOTween với object bị destroy?"* → Tween vẫn chạy và ném `MissingReferenceException` ở một frame ngẫu nhiên **sau đó**, nên chỗ báo lỗi không phải chỗ gây lỗi. Chữa bằng `.SetLink(gameObject)` trên mọi tween hoặc `DOTween.Kill` trong `OnDestroy` — và tôi ép luật đó trong adapter, vì trông chờ cả đội nhớ là cách chắc chắn để có ngày quên.
- *"Còn bẫy DOTween nào?"* → `timeScale = 0` làm tween dừng, nên UI menu pause phải `SetUpdate(true)`. Safe Mode nuốt lỗi — tiện khi phát triển nhưng đừng coi "không thấy lỗi" là bằng chứng code đúng. Và `SetTweensCapacity` lúc khởi động, vì vượt ngưỡng mặc định là DOTween cấp phát lại mảng nội bộ ngay giữa gameplay.
- *"Build Android hỏng sau khi thêm SDK?"* → Nghi theo thứ tự: **trùng thư viện** (hai bản Newtonsoft, hai bản EDM4U — giữ bản mới nhất rồi Force Resolve), template Gradle tự sửa đã cũ so với bản Unity hiện tại, `minSdk` bị SDK đẩy lên, và thư viện native chưa hỗ trợ yêu cầu page size 16KB của Android mới — cái này rớt lúc **cài đặt**, không rớt lúc biên dịch.
- *"Vì sao phải bọc sau interface?"* → Ba lợi ích đo được: đổi thư viện sửa một file; test logic không cần thư viện thật; và có **một chỗ duy nhất** để áp luật chung. Ngoại lệ là thứ đã thành ngôn ngữ của dự án như Cinemachine hay Input System — bọc lại chỉ thêm một tầng vô ích.
- *"Đặt thư viện ở đâu?"* → Ưu tiên `Packages/` qua UPM vì nâng cấp bằng một dòng trong `manifest.json`. Nếu ở `Assets/Plugins/` thì nhớ: code rời trong `Plugins/` đi vào assembly tiền định nghĩa, mà **asmdef của bạn không tham chiếu ngược vào đó được** — dự án chia asmdef sẽ gặp lỗi "type not found" mà mọi thứ nhìn vẫn đúng.

**Cờ đỏ**

- Kể tên thư viện mà không nói được nó thay cho việc gì.
- Sửa thẳng vào code thư viện, rồi bản nâng cấp xoá sạch.
- Gọi API thư viện rải rác khắp dự án, không có lớp cách ly nào.
- Không biết license: per-seat thiếu ghế, hoặc revenue share chưa tính vào giá thành.
- "Import về thấy chạy là được" — chưa từng build release trên thiết bị sau khi thêm.

**Số / ví dụ nên thuộc**

- Ngưỡng thực dụng: thư viện thay dưới **2 ngày công** thì tự viết.
- DOTween: `.SetLink()` · `.SetUpdate(true)` cho timeScale 0 · `SetTweensCapacity(500, 100)`.
- Hai thứ hay trùng nhất trong build Android: **Newtonsoft.Json** và **EDM4U**.
- Code trong `Assets/Plugins/` nằm ở assembly tiền định nghĩa — asmdef không tham chiếu vào được.
