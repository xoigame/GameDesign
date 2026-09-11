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
