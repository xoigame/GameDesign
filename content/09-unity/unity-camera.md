---
title: Camera & Cinemachine
icon: 🎥
summary: Camera là hệ gameplay, không phải trang trí — dùng Cinemachine 3 thay vì tự viết follow, nhưng hiểu Brain, dead zone, impulse và pixel perfect đủ để biết nó đang làm gì.
status: deep
read: 670
level: intermediate
order: 80
tags: [unity, camera, feel]
related: [game-feel, level-design, unity-vfx, unity-physics]
---

Camera quyết định người chơi **thấy gì và không thấy gì** — nó là công cụ dẫn dắt của [[level-design]] và là một nửa của cảm giác tốc độ ở [[game-feel]]. Vậy mà camera thường là script `Lerp` 15 dòng viết ở tuần 1 rồi vá thêm 200 dòng trong 6 tháng: dead zone, look-ahead, giới hạn biên, rung, zoom khi boss, không xuyên tường. **Cinemachine đã giải hết các bài đó**, có Inspector cho designer chỉnh, và cái giá là học đúng 5 khái niệm: Brain, virtual camera, priority, composer, extension.

Toàn bộ node này nói về **Cinemachine 3.x** (Unity 6): namespace `Unity.Cinemachine`, component `CinemachineCamera` (bản 2.x là `CinemachineVirtualCamera`), `Position Composer` thay `Framing Transposer`, `Rotation Composer` thay `Composer`, `Deoccluder` thay `Collider`, `Orbital Follow` thay `FreeLook`. Code cho 2.x không biên dịch trên 3.x — đừng dán từ tutorial cũ.

## Tự viết hay Cinemachine

| Trường hợp | Chọn | Vì sao |
|---|---|---|
| 2D pixel-perfect, camera chỉ bám hoặc khoá phòng | **Tự viết** 30 dòng | Cần vị trí camera là bội số của 1/PPU, dễ kiểm soát hơn khi không có damping |
| 2D có dead zone, look-ahead, biên level, rung | Cinemachine | Mỗi thứ là một checkbox thay cho 40 dòng có bug |
| 3D third-person, top-down, isometric | Cinemachine | Collision avoidance và blend giữa camera là thứ tự viết tốn hàng tuần |
| Cutscene, nhiều góc máy | Cinemachine + Timeline | Không có lựa chọn khác hợp lý |
| Camera cố định hoàn toàn (puzzle một màn) | Không cần gì | Đừng thêm Brain cho một camera đứng yên |

Chi phí: Brain + 1 camera đang hoạt động khoảng 0.05–0.1ms. Camera **không hoạt động vẫn được cập nhật** theo `Standby Update` (mặc định Round Robin). Có 20 virtual camera "Always" là tự phạt mình; đặt `Never` cho camera cutscene và camera một lần.

## Cấu trúc: một Brain, nhiều virtual camera, blend bằng priority

`CinemachineBrain` nằm trên **Main Camera duy nhất** trong scene. Nó không tự quyết gì — mỗi frame nó chọn `CinemachineCamera` có **priority cao nhất** đang bật, rồi blend từ camera cũ sang camera mới theo `Default Blend` (mặc định EaseInOut 2s — quá dài cho gameplay, đặt 0.5s) hoặc bảng `Custom Blends` cho từng cặp. Mỗi trạng thái camera là một `CinemachineCamera` riêng trong scene: `CM_Follow` (10), `CM_Aim` (20 khi bật), `CM_Boss` (30), `CM_Cutscene` (100).

```csharp
using Unity.Cinemachine;
using UnityEngine;

public class CameraDirector : MonoBehaviour {
    [SerializeField] CinemachineBrain brain;
    [SerializeField] CinemachineCamera followCam, aimCam, bossCam;
    [SerializeField] CinemachineImpulseSource hitImpulse;
    [SerializeField] CinemachineImpulseListener listener;
    CinemachineCamera current;

    void Awake() {
        brain.IgnoreTimeScale = true;                 // rung/blend vẫn chạy trong hitstop timeScale = 0
        listener.Gain = A11y.ShakeScale;              // hệ số trợ năng nhân MỘT lần ở listener, không ở từng nguồn
        Switch(followCam);
    }

    public void Switch(CinemachineCamera next) {
        if (current == next) return;
        if (current != null) current.Priority = 10;   // CM3: gán int được nhờ implicit conversion sang PrioritySettings
        next.Priority = 20;
        current = next;
    }

    /// Điểm DUY NHẤT trong dự án được rung camera. force ~ 0.3 đòn nhẹ, 1.0 đòn nặng, 2.0 boss chết.
    public void Shake(float force) => hitImpulse.GenerateImpulseWithForce(force);

    public void Zoom(float fov, float seconds) => StartCoroutine(LerpFov(fov, seconds));

    System.Collections.IEnumerator LerpFov(float target, float seconds) {
        float start = current.Lens.FieldOfView, t = 0f;
        while (t < seconds) {
            t += Time.unscaledDeltaTime;
            current.Lens.FieldOfView = Mathf.Lerp(start, target, t / seconds);
            yield return null;
        }
    }
}
```

Với 4–5 trạng thái, đổi priority từ code là đủ. Trên 8 trạng thái theo vùng level, dùng **trigger volume** bật/tắt camera con, hoặc `CinemachineStateDrivenCamera` nếu trạng thái đã có trong Animator. Đừng viết switch-case 15 nhánh.

## 2D: Position Composer, dead zone, look-ahead, Confiner

`CinemachineCamera` với **Position Composer** là camera 2D chuẩn. Bốn tham số quyết định cảm giác:

- **Dead Zone** 0.1–0.2 (tỉ lệ màn hình) — nhân vật di chuyển trong vùng này camera không nhúc nhích. Không có dead zone, mọi bước nhỏ đều kéo camera, người chơi say. Dead zone rộng quá thì cảm giác camera "lười".
- **Damping** 0.3–0.6 cho x, 0.8–1.2 cho y trong platformer — y chậm hơn để nhảy không kéo camera nảy theo. Damping trên 1s là nhân vật dash lọt khỏi khung.
- **Look-ahead** `Time` 0.3–0.5s, `Smoothing` 10, bật `IgnoreY` — camera nhìn trước theo hướng chạy, cho người chơi thấy kẻ địch trước khi lao vào. Bẫy: look-ahead tính từ **vận tốc target**, nên quay đầu liên tục là camera lắc qua lại; smoothing cao chữa được nhưng trễ thêm.
- **Hard Limits** — hộp mà nhân vật không bao giờ ra khỏi, dù damping chưa đuổi kịp. Đây là chốt an toàn cho dash.

**`CinemachineConfiner2D`** (extension) giữ khung camera trong một `PolygonCollider2D` bao level. Nó tự tính vùng hợp lệ cho orthographic size hiện tại; đổi zoom phải gọi `InvalidateBoundingShapeCache()`. Collider biên đặt trên layer riêng **không va chạm với gì** (xem collision matrix ở [[unity-physics]]) — không thì đạn nổ vào biên camera.

## 3D third-person: Orbital Follow + Rotation Composer + Deoccluder

Bộ chuẩn: **Orbital Follow** (kiểu `ThreeRing`: Top/Center/Bottom, mỗi vòng bán kính và độ cao riêng — cho phép camera gần khi nhìn từ trên, xa khi ngang) + **Rotation Composer** nhìn vào một `Tracking Target` là điểm ở **ngang vai**, không phải chân nhân vật + `CinemachineInputAxisController` đọc action Look từ Input System, không đọc `Mouse.delta` tay.

**Deoccluder** là extension chống camera xuyên tường: `Collide Against` = layer tường (không gồm Player, không gồm trigger), `Minimum Distance From Target` 0.3, strategy `Pull Camera Forward` cho hành động nhanh, `Preserve Camera Height` cho khám phá. Bẫy kinh điển: mọi thứ ở layer Default → Deoccluder né cả cây cỏ, cột nhỏ, và chính nhân vật; camera nhảy phựt liên tục. Tạo layer `CameraBlock` chỉ cho tường và địa hình, gán tag `IgnoreTag` cho nhân vật. `Damping When Occluded` 0 (né ngay), `Damping` 0.5 (trở về từ tốn).

## Bám Rigidbody: Update Method và interpolation

Camera bám vật thể chạy bằng physics là nơi rung xuất hiện nhiều nhất, và người ta đi chỉnh damping thay vì chỉnh đúng chỗ. Hai điều kiện phải cùng có:

1. **Rigidbody bật Interpolate** — không thì vị trí chỉ đổi 50 lần/giây, camera 144Hz thấy nó nhảy bậc. Đây là việc của [[unity-physics]].
2. **Brain `Update Method` = Smart Update** (mặc định) hoặc `Late Update`. Smart Update tự phát hiện target đổi trong FixedUpdate và theo nhịp đó. Nếu vẫn rung sau khi bật interpolation: đặt hẳn `Late Update` và `Blend Update Method` = `Late Update`. Chỉ dùng `Fixed Update` khi *mọi thứ* camera nhìn đều là physics và không interpolate — hiếm.

Kiểm tra ở màn hình **144Hz**, không phải 60 — lệch 50/60 khó thấy, lệch 50/144 rõ như ban ngày.

## Impulse: rung có ngân sách

`CinemachineImpulseSource` (trên nguồn rung: nhân vật, vũ khí, boss) phát tín hiệu; `CinemachineImpulseListener` (extension trên camera) nhận và rung. Ưu điểm so với tự viết: rung theo **khoảng cách** (nổ xa rung nhẹ), nhiều nguồn cộng dồn đúng, và `Gain` trên listener là **một nút vặn duy nhất** cho trợ năng — điều [[accessibility]] yêu cầu.

Ngân sách rung: Impulse Shape `Bump` 0.15–0.2s cho đòn thường, `Explosion` 0.3–0.4s cho nổ, `Rumble` chỉ cho môi trường (động đất). Force 0.3 / 1.0 / 2.0 cho nhẹ / nặng / kết liễu — tỉ lệ 1:3:6, để đòn thường không lẫn với đòn lớn. Rung liên tục quá 0.5s là say. Đặt `Channel` riêng cho rung UI (trúng đòn hiện màu đỏ) và rung gameplay để tắt riêng.

Hitstop `timeScale = 0` làm Impulse đứng hình giữa chừng nếu Brain không `IgnoreTimeScale` — rung, hitstop và flash phải cùng chạy trên đồng hồ thực; phối hợp ba thứ này ở [[unity-vfx]].

## Target Group cho co-op và boss

`CinemachineTargetGroup` với 2–4 target (mỗi target có `Weight` và `Radius`) làm một `Tracking Target` — camera tự đặt ở tâm và **Group Framing** trên Position Composer tự zoom để bao hết. Boss fight: nhân vật weight 1, boss weight 0.6, để camera nghiêng về người chơi. Bẫy co-op: hai người chạy hai hướng, camera zoom ra tới `Maximum Ortho Size` rồi vẫn không đủ — cần luật gameplay (kéo người tụt lại, hoặc chặn ở mép) chứ không phải camera.

## Pixel perfect: PPU, orthographic size, và jitter

Game pixel art có ba con số phải khớp: **PPU** của sprite (16 hoặc 32), **độ phân giải tham chiếu** (320×180 hoặc 640×360), và **orthographic size** = `refResY / (2 × PPU)` — 180 / (2×16) = 5.625. Lệch một trong ba là pixel không đều: một hàng pixel dày, hàng kế mỏng.

Component **Pixel Perfect Camera** (URP có sẵn, `UnityEngine.Rendering.Universal`) ép orthographic size và làm tròn vị trí camera về lưới pixel. Với Cinemachine, thêm extension `CinemachinePixelPerfect` lên virtual camera — không thì damping của Composer cho vị trí lẻ pixel và sprite **nhấp nháy** khi camera chạy, rõ nhất ở đường viền 1px. Tuỳ chọn `Upscale Render Texture` render ở 320×180 rồi phóng — rẻ hơn nhiều trên mobile và pixel luôn đều, đổi lại xoay sprite bị răng cưa (thường là điều pixel art muốn).

## Camera stacking trong URP

Camera Main là `Base`; thêm camera `Overlay` cho UI world-space không bị post-processing, hoặc cho vũ khí FPS không xuyên tường (FOV riêng). Mỗi camera thêm tốn một lượt culling + setup, ~0.3–0.8ms trên mobile — 2 camera là bình thường, 4 là phải có lý do. Minimap không nên là camera thứ ba render mỗi frame: render vào `RenderTexture` **10 lần/giây** bằng `camera.Render()` thủ công với `enabled = false`, hoặc tốt hơn là vẽ minimap bằng UI từ dữ liệu vị trí — không cần camera.

Overlay camera **không** nhận post-processing riêng và không clear background — đúng ý cho UI, nhưng nếu muốn vũ khí FPS có bloom thì phải bật trên Base.

## Những thứ nhỏ

- `Camera.main` được cache nội bộ từ Unity 2020.2, nhưng vẫn trả về **null** khi camera có tag MainCamera bị tắt hoặc chưa có. Cache vào field ở `Awake`, và hỏi `CinemachineBrain.OutputCamera` nếu đang dùng Cinemachine.
- **FOV và tốc độ:** Unity dùng FOV dọc. 60° mặc định, third-person 50–65, racing 75–90. Tăng 8–12° trong 0.15–0.2s khi sprint/dash rồi trả về — cảm giác nhanh hơn thật mà không đổi tốc độ. Ultrawide: chuyển sang FOV ngang cố định bằng `Camera.HorizontalToVerticalFieldOfView(hFov, aspect)`, không thì người chơi 21:9 thấy ít hơn 16:9.
- **Cutscene:** Timeline có `Cinemachine Track`; mỗi clip là một `Cinemachine Shot` trỏ vào virtual camera, chồng hai clip là blend. Cùng Brain, nên kết thúc cutscene tự blend về camera gameplay — không cần code.

## Bẫy lộ ra khi build

- Test trên màn hình 60Hz trong Editor, ship cho người chơi 144Hz — rung do thiếu interpolation chỉ họ thấy.
- Composer dùng `Screen` ratio — UI safe area trên điện thoại tai thỏ che mất phần dead zone bên trái; kiểm với tỉ lệ 20:9.
- Confiner2D cache theo orthographic size; đổi độ phân giải lúc chạy (đổi cửa sổ) mà không invalidate là camera thoát khỏi biên.
- Deoccluder raycast mỗi frame vào layer `Collide Against` — layer chứa 5000 mesh collider địa hình chi tiết là 0.5ms chỉ để né. Gộp địa hình vào collider đơn giản hơn trên layer `CameraBlock`.
- Quên `Standby Update = Never` cho 30 camera cutscene → 30 camera tính toán mỗi frame ở màn không có cutscene.

## Kiểm tra nhanh
- Màn 144Hz, nhân vật Rigidbody chạy thẳng 5 giây: nền có rung bậc không? Không là interpolation + Update Method đúng.
- Dash tốc độ tối đa liên tiếp 3 lần: nhân vật có chạm Hard Limits không? Chạm là damping quá cao.
- `A11y.ShakeScale = 0`: chơi hết một trận boss, không còn rung nào (chỉ có một `Listener.Gain` để tắt).
- Profiler `CinemachineBrain.LateUpdate` với 5 virtual camera bật < 0.3ms.
- Pixel art: quay video 60fps lúc camera chạy, dừng frame, zoom 400%: viền sprite có hàng pixel dày mỏng không đều không?

## 🤖 Prompt cho AI

AI tự viết `CameraFollow` bằng `Vector3.Lerp` trong `Update`, hoặc dùng API Cinemachine 2.x (`CinemachineVirtualCamera`, `GetCinemachineComponent<CinemachineFramingTransposer>()`) không biên dịch trên 3.x.

**Phải nêu rõ:**
- Phiên bản Cinemachine (3.x, namespace `Unity.Cinemachine`) và render pipeline
- 2D hay 3D; nếu 2D thì PPU, độ phân giải tham chiếu, orthographic size suy ra
- Danh sách trạng thái camera và priority, blend giữa từng cặp (giây)
- Số dead zone / damping / look-ahead — theo tỉ lệ màn hình và giây
- Ngân sách rung: force cho nhẹ / nặng / kết liễu, thời lượng, và hệ số trợ năng đặt ở đâu
- Target di chuyển bằng Rigidbody hay transform (quyết định Update Method)

**Mẫu prompt**

```
Dựng camera cho platformer 2D pixel art, Unity 6, URP, Cinemachine 3.1 (namespace Unity.Cinemachine, component CinemachineCamera).
KHÔNG dùng API Cinemachine 2.x (CinemachineVirtualCamera, FramingTransposer, GetCinemachineComponent).
KHÔNG tự viết script follow bằng Lerp.

Pixel: PPU 16, tham chiếu 320x180 → orthographic size 5.625. Dùng Pixel Perfect Camera (URP) + extension CinemachinePixelPerfect.
Nhân vật: Rigidbody2D Kinematic, Interpolate bật. Brain Update Method = Smart Update, IgnoreTimeScale = true.

Camera CM_Follow (priority 10): Position Composer — dead zone 0.15 x 0.1, damping x 0.4 / y 1.0,
  look-ahead time 0.4s smoothing 10 ignoreY, Hard Limits 0.8 x 0.7. Confiner2D bám PolygonCollider2D layer CameraBounds (không va gì).
Camera CM_Boss (priority 20 khi bật): Target Group [player weight 1 radius 1, boss weight 0.6 radius 3], Group Framing.
Default Blend 0.5s EaseInOut; CM_Follow→CM_Boss 1.0s.

Rung: một CinemachineImpulseSource duy nhất trên CameraDirector, Impulse Shape Bump 0.2s.
Force: 0.3 đòn nhẹ / 1.0 đòn nặng / 2.0 boss chết. Listener.Gain = A11y.ShakeScale, là NƠI DUY NHẤT nhân hệ số trợ năng.
CẤM mọi transform.position += trên camera ngoài Cinemachine.

Viết CameraDirector.cs với Switch(cam), Shake(force). Liệt kê từng component/extension phải thêm trên từng GameObject và giá trị Inspector.
```

**Bẫy thường gặp:** AI thêm Impulse cho rung nhưng để `Brain.IgnoreTimeScale = false`, rồi hitstop `timeScale = 0` làm rung **đứng hình ở đỉnh biên độ** trong 90ms — camera lệch cứng rồi bật về, trông như lag thay vì lực. Chạy thử không hitstop thì hoàn toàn bình thường, nên không ai thấy tới khi ghép hai hệ thống.

## 💻 Code

Demo dựng ba `CinemachineCamera` (Follow / Aim / Boss) đổi bằng Priority qua một `CameraDirector` duy nhất, rung bằng Impulse với ngân sách force 0.3 / 1.0 / 2.0 và một hệ số trợ năng ở `Listener.Gain`, và `CinemachineTargetGroup` thêm boss vào khung khi vào trận — kiểm chứng được bằng thanh blend trong Inspector của Brain.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 380" role="img" aria-label="Hierarchy có Main Camera với CinemachineBrain và Impulse Listener, ba camera CM_Follow CM_Aim CM_Boss, BossGroup, CameraDirector, Player và Boss; Inspector hiện CinemachineCamera và Position Composer của CM_Follow, Brain của Main Camera và script Camera Director">
  <rect x="10" y="10" width="200" height="360" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">▾ Main Camera</text>
  <text x="38" y="82" class="fig-muted" font-size="11">CinemachineBrain</text>
  <text x="38" y="98" class="fig-muted" font-size="11">CinemachineImpulseListener</text>
  <rect x="16" y="108" width="188" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="22" y="123" class="fig-label" font-size="12" font-weight="600">CM_Follow   (priority 10)</text>
  <text x="22" y="144" class="fig-muted" font-size="12">CM_Aim       (20 khi bật, còn lại 0)</text>
  <text x="22" y="162" class="fig-muted" font-size="12">CM_Boss      (30 khi bật, còn lại 0)</text>
  <text x="22" y="180" class="fig-muted" font-size="12">BossGroup  (TargetGroup)</text>
  <rect x="16" y="188" width="188" height="20" rx="4" fill="#b197fc" opacity="0.18"/>
  <text x="22" y="203" class="fig-label" font-size="12" font-weight="600">CameraDirector (+ ImpulseSource)</text>
  <text x="22" y="224" class="fig-muted" font-size="12">Player  (Rigidbody, Interpolate)</text>
  <text x="22" y="242" class="fig-muted" font-size="12">Boss</text>
  <line x1="10" y1="258" x2="210" y2="258" class="fig-line"/>
  <text x="22" y="278" class="fig-label" font-size="12" font-weight="600">Brain chọn priority cao nhất</text>
  <text x="22" y="296" class="fig-muted" font-size="11">Follow  10   luôn bật</text>
  <text x="22" y="312" class="fig-muted" font-size="11">Aim     20   giữ chuột phải</text>
  <text x="22" y="328" class="fig-muted" font-size="11">Boss    30   khi vào boss</text>
  <text x="22" y="344" class="fig-muted" font-size="11">Blend giữa hai camera: 0.6 s</text>
  <text x="22" y="362" class="fig-muted" font-size="10">Package: com.unity.cinemachine 3.x</text>
  <rect x="226" y="10" width="424" height="360" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Cinemachine Camera  (CM_Follow)</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Priority</text><text x="440" y="82" class="fig-label" font-size="11">10</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Tracking Target</text><text x="440" y="98" class="fig-label" font-size="11">Player</text>
  <rect x="234" y="108" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="121" class="fig-label" font-size="12" font-weight="600">Position Composer  (CM_Follow)</text>
  <text x="250" y="140" class="fig-muted" font-size="11">Damping</text><text x="440" y="140" class="fig-label" font-size="11">X 0.5   Y 0.5   Z 0.5</text>
  <text x="250" y="156" class="fig-muted" font-size="11">Composition ▸ Dead Zone</text><text x="440" y="156" class="fig-label" font-size="11">☑   0.1 × 0.2</text>
  <text x="250" y="172" class="fig-muted" font-size="11">Look-ahead ▸ Time / Smoothing</text><text x="440" y="172" class="fig-label" font-size="11">0.3 s   /   10</text>
  <text x="250" y="188" class="fig-muted" font-size="11">Composition ▸ Hard Limits</text><text x="440" y="188" class="fig-label" font-size="11">☑   0.8 × 0.8</text>
  <rect x="234" y="198" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="211" class="fig-label" font-size="12" font-weight="600">Cinemachine Brain  (Main Camera)</text>
  <text x="250" y="230" class="fig-muted" font-size="11">Default Blend</text><text x="440" y="230" class="fig-label" font-size="11">Ease In Out   0.6 s</text>
  <text x="250" y="246" class="fig-muted" font-size="11">Update Method / Blend Update</text><text x="440" y="246" class="fig-label" font-size="11">Smart Update / Late Update</text>
  <text x="250" y="262" class="fig-muted" font-size="11">Ignore Time Scale</text><text x="440" y="262" class="fig-label" font-size="11">☑   (script đặt ở Awake)</text>
  <text x="250" y="278" class="fig-muted" font-size="11">Impulse Listener ▸ Gain</text><text x="440" y="278" class="fig-label" font-size="11">1.0   (= Shake Scale)</text>
  <rect x="234" y="288" width="408" height="18" rx="3" fill="#b197fc" opacity="0.22"/>
  <text x="242" y="301" class="fig-label" font-size="12" font-weight="600">Camera Director (Script)  (CameraDirector)</text>
  <text x="250" y="320" class="fig-muted" font-size="11">Follow / Aim / Boss Cam</text><text x="440" y="320" class="fig-label" font-size="11">CM_Follow / CM_Aim / CM_Boss</text>
  <text x="250" y="336" class="fig-muted" font-size="11">Boss Group / Impulse Source</text><text x="440" y="336" class="fig-label" font-size="11">BossGroup / Bump 0.2 s (cùng GO)</text>
  <text x="250" y="352" class="fig-muted" font-size="11">Shake Scale</text><text x="440" y="352" class="fig-label" font-size="11">1.0</text>
</svg>
<figcaption>CM_Boss có Tracking Target = BossGroup và bật Group Framing trên Position Composer. Priority của Aim/Boss về 0 khi không dùng để Brain không bao giờ chọn nhầm. Rigidbody Player phải bật Interpolate.</figcaption>
</figure>

**Script**

```csharp
// CameraDirector.cs — Unity 6 (6000.x), Cinemachine 3.x (com.unity.cinemachine, namespace Unity.Cinemachine).
// KHÔNG biên dịch trên Cinemachine 2.x (CinemachineVirtualCamera / FramingTransposer). Đặt trên GameObject
// "CameraDirector" cùng với một CinemachineImpulseSource (Impulse Shape: Bump, Duration 0.2 s).
using Unity.Cinemachine;
using UnityEngine;

[RequireComponent(typeof(CinemachineImpulseSource))]
public class CameraDirector : MonoBehaviour
{
    public enum State { Follow, Aim, Boss }

    [Header("Cinemachine")]
    [SerializeField] CinemachineBrain brain;                  // trên Main Camera
    [SerializeField] CinemachineImpulseListener listener;     // extension trên Main Camera
    [SerializeField] CinemachineCamera followCam;             // priority 10, luôn bật
    [SerializeField] CinemachineCamera aimCam;                // priority 20 khi bật
    [SerializeField] CinemachineCamera bossCam;               // priority 30 khi bật, Tracking Target = BossGroup
    [SerializeField] CinemachineTargetGroup bossGroup;

    [Header("Priority — Brain chọn số cao nhất đang bật")]
    [SerializeField] int followPriority = 10;
    [SerializeField] int aimPriority = 20;
    [SerializeField] int bossPriority = 30;

    [Header("Rung")]
    [Range(0f, 1f)] [SerializeField] float shakeScale = 1f;   // trợ năng: nhân MỘT lần ở Listener.Gain, không ở từng nguồn

    [Header("Demo")]
    [SerializeField] Transform player;
    [SerializeField] Transform demoBoss;

    CinemachineImpulseSource impulse;
    public State Current { get; private set; }

    void Awake()
    {
        impulse = GetComponent<CinemachineImpulseSource>();
        brain.IgnoreTimeScale = true;                  // rung và blend vẫn chạy khi hitstop timeScale = 0
        SetShakeScale(shakeScale);

        // Priority cố định theo trạng thái; camera không hoạt động về 0 để Brain không bao giờ chọn nhầm.
        followCam.Priority = followPriority;           // CM3: gán int được nhờ implicit conversion sang PrioritySettings
        aimCam.Priority = 0;
        bossCam.Priority = 0;

        if (bossGroup.Targets.Count == 0) bossGroup.AddMember(player, 1f, 1f);   // người chơi luôn là thành viên, weight 1
        Current = State.Follow;
    }

    /// Điểm DUY NHẤT đổi trạng thái camera. Không GameObject nào khác được đụng Priority.
    public void Set(State state)
    {
        if (state == Current) return;
        aimCam.Priority  = state == State.Aim  ? aimPriority  : 0;
        bossCam.Priority = state == State.Boss ? bossPriority : 0;
        Current = state;
    }

    public void EnterBoss(Transform boss)
    {
        bossGroup.AddMember(boss, 0.6f, 3f);           // weight 0.6 < 1: khung nghiêng về người chơi
        Set(State.Boss);
    }

    public void ExitBoss(Transform boss)
    {
        bossGroup.RemoveMember(boss);
        Set(State.Follow);
    }

    /// Điểm DUY NHẤT được rung camera. force 0.3 đòn nhẹ / 1.0 đòn nặng / 2.0 kết liễu (tỉ lệ 1:3:6).
    public void Shake(float force) => impulse.GenerateImpulseWithForce(force);

    public void SetShakeScale(float scale)
    {
        shakeScale = Mathf.Clamp01(scale);
        listener.Gain = shakeScale;                    // 0 = tắt hẳn mọi rung, kể cả boss chết — một nút vặn duy nhất
    }

    // --- demo input: thay bằng InputReader trong dự án thật (xem unity-input) ---
    void Update()
    {
        var kb = UnityEngine.InputSystem.Keyboard.current;
        var mouse = UnityEngine.InputSystem.Mouse.current;
        if (kb == null || mouse == null) return;

        if (Current != State.Boss)                     // đang boss thì Aim bị khoá — trạng thái cao hơn thắng
            Set(mouse.rightButton.isPressed ? State.Aim : State.Follow);

        if (kb.bKey.wasPressedThisFrame)
        {
            if (Current == State.Boss) ExitBoss(demoBoss);
            else EnterBoss(demoBoss);
        }

        if (kb.fKey.wasPressedThisFrame)     Shake(0.3f);   // đòn nhẹ
        if (kb.spaceKey.wasPressedThisFrame) Shake(1f);     // đòn nặng
        if (kb.kKey.wasPressedThisFrame)     Shake(2f);     // kết liễu
        if (kb.digit0Key.wasPressedThisFrame) SetShakeScale(shakeScale > 0f ? 0f : 1f);   // bật/tắt trợ năng
    }

    void OnValidate()
    {
        if (listener != null) listener.Gain = Mathf.Clamp01(shakeScale);   // kéo slider trong Editor thấy ngay
    }
}
```

**Chạy thử**
- Play, giữ chuột phải: Inspector của CinemachineBrain hiện thanh blend `CM_Follow → CM_Aim` chạy trong 0.6 s, mục Live Camera đổi. Nhả: blend ngược, cũng 0.6 s. Đổi Default Blend thành Cut: đổi tức thì.
- Nhấn B: `BossGroup ▸ Targets` từ 1 lên 2 thành viên (Player weight 1 radius 1, Boss weight 0.6 radius 3), CM_Boss Priority 30 → camera lùi ra bao cả hai, tâm khung lệch về Player. Giữ chuột phải lúc này: không đổi — Aim bị khoá bởi trạng thái Boss. Nhấn B lần nữa: Boss rời group, về Follow.
- Nhấn F / Space / K: biên độ rung tăng theo 0.3 / 1.0 / 2.0 và dứt sau ~0.2 s (Bump). Nhấn 0: Shake Scale về 0, ba phím rung không còn tác dụng dù `GenerateImpulseWithForce` vẫn được gọi — chỉ có một chỗ để tắt.
- Nhấn Space rồi ngay lập tức gõ `Time.timeScale = 0` (hoặc pause bằng nút ▮▮ rồi Step): rung vẫn chạy hết vì `IgnoreTimeScale`. Tắt cờ này: camera đứng kẹt lệch ở đỉnh biên độ cho tới khi resume.
- Player chạy bằng Rigidbody thẳng 5 s trên màn 144Hz: nền không rung bậc. Tắt Interpolate trên Rigidbody: rung — chứng minh vấn đề nằm ở Rigidbody, không phải ở Damping của Composer.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | Cinemachine gồm những phần nào? Brain và virtual camera khác nhau chỗ nào? |
| Junior | Camera bám nhân vật nên viết trong `Update` hay `LateUpdate`? Vì sao? |
| Mid | Camera chui qua tường ở góc hẹp. Anh xử lý thế nào? |
| Mid | Camera rung nhẹ khi nhân vật chạy dù frame rate ổn. Nghi gì? |
| Senior | Rung camera (hitstop + impulse) làm sao cho ra "lực" chứ không ra "lag"? |
| Senior | Khi nào anh **không** dùng Cinemachine? |

**Khung trả lời 60 giây** — "Anh dựng camera cho game third-person thế nào?"

> Một `CinemachineBrain` trên Main Camera, nhiều virtual camera, chuyển qua lại bằng **priority** chứ không bật/tắt GameObject — nhờ vậy blend giữa hai góc máy là việc của Brain, không phải việc của tôi. Third-person thì Orbital Follow + Rotation Composer + **Deoccluder** chống xuyên tường.
>
> Chỗ ai cũng vấp là Deoccluder: để mặc định thì `Collide Against` gồm cả layer Default, nên camera né luôn cây cỏ, cột nhỏ và chính nhân vật — camera nhảy phựt liên tục và người ta đổ cho Cinemachine. Cách làm đúng là một layer riêng `CameraBlock` chỉ chứa tường và địa hình, cộng `IgnoreTag` cho nhân vật, `Damping When Occluded` = 0 để né tức thì và `Damping` ~0.5 để trở về từ tốn.
>
> Ngược lại, 2D pixel-perfect chỉ bám hoặc khoá phòng thì tôi **tự viết 30 dòng** — cần vị trí camera là bội số của 1/PPU, thêm damping vào là ra jitter.

**Họ sẽ đào tiếp**

- *"Vì sao `LateUpdate`?"* → Camera phải đọc vị trí **sau khi** nhân vật đã di chuyển trong frame đó; đặt ở `Update` thì tuỳ thứ tự script mà camera bám vị trí của frame trước — hiện ra thành giật nhẹ, không đều.
- *"Bám vật thể chạy bằng physics?"* → Vị trí chuẩn nằm ở bước physics, nên camera phải theo `Update Method = Fixed`/`Smart` của Brain **và** rigidbody phải bật `Interpolate`. Thiếu một trong hai là rung, và người ta thường đi tối ưu fps thay vì sửa hai ô cài đặt.
- *"Rung mà thành lag?"* → Bẫy kinh điển: hitstop đặt `timeScale = 0` trong 90ms trong khi `Brain.IgnoreTimeScale = false`, nên impulse **đứng hình ngay đỉnh biên độ** rồi bật về. Chạy thử không hitstop thì bình thường — lỗi chỉ xuất hiện khi ghép hai hệ thống. Rung cũng cần **ngân sách**: biên độ theo mức sự kiện, và một nguồn duy nhất cộng dồn, nếu không bốn hệ thống cùng rung là màn hình nhũn.
- *"Pixel perfect jitter?"* → Orthographic size phải khớp PPU và chiều cao màn hình; camera phải snap về lưới pixel; và đừng để damping đẩy camera vào giữa hai pixel.
- *"Co-op hai người?"* → `CinemachineTargetGroup` với weight/radius theo từng người chơi, cộng giới hạn zoom out; chỉ dùng cho co-op màn hình chung hoặc boss to.

**Cờ đỏ**

- Chuyển góc máy bằng `SetActive` từng camera (mất blend, mất state).
- Thêm CinemachineBrain cho một camera đứng yên trong game puzzle một màn.
- Viết camera collision bằng một raycast từ nhân vật tới camera rồi kẹp khoảng cách, không xử lý damping → camera giật liên tục.
- Không biết Confiner 2D cần collider dạng polygon và cần bake lại khi đổi biên.
- Đổi FOV liên tục để tạo cảm giác tốc độ mà không nói tới say chuyển động (motion sickness).

**Số / ví dụ nên thuộc**

- `Damping When Occluded` = 0, `Damping` ≈ 0.5, `Minimum Distance From Target` ≈ 0.3.
- Camera bám physics: Brain `Update Method = Fixed` + rigidbody `Interpolate`.
- Pixel perfect: vị trí camera là bội số của 1/PPU.
