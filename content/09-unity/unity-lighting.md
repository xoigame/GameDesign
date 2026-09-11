---
title: Ánh sáng & Post-processing
icon: 💡
summary: Linear color space từ ngày đầu, baked cho mọi thứ đứng yên, realtime chỉ cho thứ thật sự đổi — và post-processing là nơi mobile mất frame nhiều nhất mà không ai để ý.
status: deep
read: 720
level: intermediate
order: 130
tags: [unity, lighting, rendering, urp]
related: [art-direction, unity-shader, unity-optimization, unity-build-platform]
---

Quyết định đầu tiên và không đảo được: **Linear hay Gamma color space** (`Project Settings > Player > Color Space`). Đổi sau khi đã có 200 material và bảng màu chốt là chỉnh lại toàn bộ — mọi màu trông tối hơn hoặc bệch hơn, mọi gradient đổi hình. Chọn **Linear** trừ khi bạn làm pixel art 2D thuần và muốn màu hex trong file PNG hiện y nguyên trên màn hình. Lý do lịch sử để chọn Gamma (OpenGL ES 2 không hỗ trợ Linear) đã hết — Unity 6 không còn build GLES2.

Quyết định thứ hai là **HDR** (URP Asset → Quality → HDR, và checkbox trên Camera). Có HDR mới có bloom đúng nghĩa (chỉ vùng sáng hơn 1.0 mới loé) và tonemapping có ý nghĩa. Giá: render target 64-bit thay 32-bit → tốn băng thông trên mobile, thường 1–3ms. Chọn *HDR Precision: 32 Bit* (R11G11B10) nếu không cần alpha, giảm nửa chi phí.

Bảng màu, hướng sáng, độ đọc được — phần thiết kế nằm ở [[art-direction]]. Node này nói cách làm nó sáng lên trong URP mà không mất frame.

## Realtime, Baked hay Mixed

| Loại game | Chọn | Vì sao |
|---|---|---|
| Mobile, level tĩnh, đèn không đổi | **Baked** toàn bộ, 0 đèn realtime | Lightmap là texture — rẻ nhất có thể, có GI, có bóng mềm miễn phí |
| Ngày/đêm, thời tiết đổi | **Realtime**: 1 directional + Environment Lighting đổi theo giờ | Không bake được thứ thay đổi; giữ số đèn tối thiểu |
| Indoor có đèn đổi màu, nhấp nháy, tắt được | **Mixed – Shadowmask**: bake indirect + bóng tĩnh, đèn vẫn realtime cho vật động | Có GI và bóng vật động, đèn vẫn điều khiển được |
| Mobile yếu nhưng cần bóng nhân vật | **Mixed – Subtractive** | Rẻ nhất trong nhóm Mixed: chỉ một bóng realtime từ main light |
| 2D | Light 2D (xem dưới) | Hệ riêng, không dùng lightmap |

Luật vàng: **object đứng yên → Static + baked; object động → nhận sáng từ probe**. Đèn `Mode: Realtime` chiếu lên object static đắt gấp nhiều lần mà không có GI — trường hợp tệ nhất là để mặc định rồi tự hỏi vì sao cảnh phẳng và chậm.

## Giới hạn đèn của URP và Forward+

URP Forward truyền thống: **1 main light** (directional mạnh nhất) + **Additional Lights** với giới hạn **per-object** — mặc định 4, tối đa 8 (URP Asset → Lighting → *Per Object Limit*). Object thứ chín đèn rọi vào bị bỏ đèn yếu nhất, nên cảnh có nhiều đèn nhỏ sẽ thấy đèn "tắt phụt" khi nhân vật đi qua ranh giới.

**Forward+** (Universal Renderer → Rendering Path) bỏ giới hạn per-object bằng cách chia màn hình thành cluster. Bật khi: cảnh có > 8 đèn realtime chồng lấn, hoặc bạn muốn GPU Resident Drawer / GPU Occlusion Culling của Unity 6 (đều cần Forward+). Không bật khi: mobile với 1–3 đèn — chi phí dựng cluster mỗi frame lớn hơn thứ nó tiết kiệm.

## Lightmapping cho ra kết quả thật

- Object cần: **Static → Contribute GI** bật, và mesh có **Lightmap UV** — bật *Generate Lightmap UVs* trong import mesh nếu artist chưa làm UV2. Cảnh báo "UV overlap" trong Lighting window là thật: hai mặt dùng cùng vùng lightmap → bóng của mặt này rò sang mặt kia. Tăng *Pack Margin* hoặc sửa UV, đừng bỏ qua.
- **Lightmap Resolution** mặc định 40 texel/unit là cho demo. Mobile thực dụng **8–16**; PC 20–30. Với *Max Lightmap Size* 2048, tính nhanh: 16 texel/unit trên level 50×50m ≈ hai lightmap 2048 — vừa. Object nhỏ trang trí giảm *Scale in Lightmap* xuống 0.2–0.5.
- **Progressive GPU** nhanh hơn CPU 5–10 lần, cần VRAM ≥ 4GB; nếu rơi về CPU giữa chừng, đó là hết VRAM — giảm *Max Lightmap Size* hoặc đóng Chrome.
- Unity 6 **bỏ Auto Generate** — phải bấm *Generate Lighting*. Lightmap là asset trong thư mục cùng tên scene và **phải commit** (hoặc bake trên CI, xem [[unity-build-platform]]); một người quên commit là cả team thấy cảnh đen.
- Mixed light có **Indirect Multiplier**: đặt 1 cho đèn thật, 0 cho đèn "fill" chỉ để chiếu sáng vật động.

## Light Probe — cho vật động trong cảnh baked

Nhân vật đi trong cảnh baked mà không có probe sẽ nhận sáng từ Environment Lighting đều tăm tắp — sáng trưng trong hầm tối. Light Probe Group giải quyết, với hai luật: **đặt probe ở ranh giới sáng/tối** (cửa, gốc cột đèn, mép bóng) và **không rải lưới đều** — 1000 probe trong khoảng sân bằng phẳng chỉ tốn bake và không thay đổi gì. Chiều cao: một lớp ngang tầm nhân vật, một lớp trên đầu 2–3m.

Unity 6 URP có **Adaptive Probe Volumes (APV)** — probe tự động theo thể tích, có per-pixel thay per-object, hết bệnh nhân vật "nhảy" độ sáng khi qua ranh probe. Đáng dùng cho dự án mới 3D; Light Probe Group vẫn rẻ hơn cho mobile yếu.

Trên object động, `Mesh Renderer → Light Probes: Blend Probes` là đúng; `Off` cho vật nhỏ nhiều (đạn, mảnh vỡ) để bớt việc CPU.

## Reflection Probe

Material có smoothness sẽ phản chiếu skybox nếu không có probe — nhân vật trong hầm phản chiếu trời xanh. Một **Reflection Probe Baked** mỗi phòng, **Box Projection** bật cho phòng chữ nhật, **Resolution 128** đủ cho mobile (256 cho PC, 512 chỉ khi phản chiếu là gameplay). Bật *Reflection Probe Blending* trên Universal Renderer để hết bệnh "lật" phản chiếu khi đi qua ranh probe. Realtime reflection probe là 6 lần render cảnh — không dùng trên mobile, PC thì chỉ một cái và *Refresh Mode: Via Scripting* khi cần.

## Bóng — thứ tốn nhất trong realtime

URP Asset → Shadows:
- **Max Distance**: 30–50m cho third-person, 15–20m mobile. Xa hơn là lãng phí texel vào thứ người chơi không thấy.
- **Cascade Count**: 1–2 trên mobile, 3–4 trên PC. Mỗi cascade là render lại cảnh từ hướng đèn.
- **Soft Shadows** tốn thêm 4–9 sample/pixel — tắt trên mobile yếu, hoặc chọn *Low*.
- **Shadow acne** (sọc trên mặt nghiêng) → tăng *Depth Bias*; **peter-panning** (bóng rời chân vật) → giảm Depth Bias, tăng *Normal Bias*. Chỉnh theo cặp, mỗi lần một bước 0.1–0.2, và nhìn trên máy đích vì shadow map resolution khác.
- Additional light đổ bóng dùng chung **Shadow Atlas** — 4 point light có bóng chia nhau atlas 1024 là mỗi mặt nhận 128px, mờ nhoè. Trên mobile: **1 directional có bóng + ≤ 2 point light không bóng**, còn muốn bóng vật động rẻ thì dùng blob shadow (quad + texture tròn mờ).

## 2D — Light 2D trong URP 2D Renderer

Cần **2D Renderer** (không phải Universal Renderer) và sprite dùng shader *Sprite-Lit* (xem [[unity-shader]]). Bốn loại: **Global** (ambient, luôn có một cái), **Spot** (tên cũ Point — đổi từ 2021.2, code dùng `Light2D.LightType.Point` vẫn chạy), **Freeform** (polygon tự vẽ — cửa sổ, vùng sáng có hình), **Sprite** (dùng texture làm hình đèn — lửa, cookie).

Chi phí không nằm ở số đèn mà ở **Blend Style**: mỗi style là một render target toàn màn hình. Mặc định có 4; dùng 1 (Multiply) là đủ cho hầu hết game, thêm 1 (Additive) cho hiệu ứng phát sáng. **Normal map cho sprite** đặt qua *Secondary Textures* trong Sprite Editor với tên `_NormalMap` — Light 2D mới cho cảm giác khối. **Shadow Caster 2D** tự động lấy hình từ sprite outline, nhưng 100 caster là 100 lần vẽ shadow mesh mỗi đèn — chỉ bật ở tường và cột.

## Post-processing Volume

Một **Global Volume** với profile chung; **Local Volume** (có Collider trigger, *Blend Distance* 2–5m) cho khu vực đặc biệt. `Priority` cao thắng khi chồng. Camera phải bật *Post Processing*, và mỗi Camera trong stack tự có checkbox riêng.

Chi phí thực trên mobile tầm trung (1080p, Mali-G52), thứ tự tốn nhất trước:

| Effect | Chi phí | Ghi chú |
|---|---|---|
| Depth of Field | 3–6ms | *Gaussian* rẻ hơn *Bokeh* ba lần; hầu hết game mobile bỏ hẳn |
| Bloom | 1.5–3ms | Tắt *High Quality Filtering*, giảm *Max Iterations* xuống 4; threshold **> 1.0** khi có HDR, không thì cả màn hình loé |
| Motion Blur | 1–2ms | Nhiều người chơi tắt — cho tuỳ chọn |
| Chromatic Aberration, Lens Distortion | 0.5–1ms | Full-screen sample thêm |
| Tonemapping, Color Adjustments, Vignette, Film Grain | ~0 | Gộp vào một pass Uber — dùng thoải mái |

**ACES** cho cảnh thực tế, contrast cao, nhưng nó *bão hoá và tối vùng đỏ* — art stylized/pastel hay bị "cháy" → dùng **Neutral** rồi bù bằng Color Adjustments. Quyết định này liên quan trực tiếp tới bảng màu đã chốt.

Điều khiển Volume từ gameplay (bị đánh → vignette đỏ, chậm thời gian → chromatic):

```csharp
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

public class DamageVignette : MonoBehaviour {
    [SerializeField] Volume hurtVolume;           // Volume riêng, Global, weight = 0, profile có Vignette đỏ
    float t;
    public void Hit() => t = 1f;
    void Update() {
        if (t <= 0f) return;
        t -= Time.unscaledDeltaTime * 3f;         // 0.33s, không bị timeScale ảnh hưởng
        hurtVolume.weight = Mathf.Clamp01(t);
    }
}
```

Dùng **`weight` của một Volume riêng** thay vì `profile.TryGet<Vignette>(out v)` rồi ghi `v.intensity.value` — cách sau sửa thẳng vào asset profile trong Editor, và giá trị bạn "tạm đổi" bị lưu vĩnh viễn. Hiệu ứng hitstop, rung kèm theo xem [[unity-vfx]].

## Skybox, Environment và Render Scale

Skybox HDR cubemap vẽ full-screen mỗi frame và tốn băng thông sample — trên mobile, **Environment Lighting Source: Gradient** + Camera Background Color rẻ hơn rõ, và với cảnh indoor người chơi không nhìn thấy trời. Nếu cần skybox, 6 mặt 512 nén ASTC đủ.

**Render Scale** trong URP Asset (0.5–1.0) là công tắc cứu máy yếu: 0.75 giảm 44% pixel cho mọi pass 3D, UI vẫn nét vì Canvas vẽ ở độ phân giải gốc. Unity 6 có **STP** (Spatial-Temporal Post-processing) upscale — hình nét hơn FSR ở cùng scale, tốn thêm ~1ms. Nối với cài đặt chất lượng người chơi chọn, xem [[unity-optimization]].

## Bẫy lộ ra khi build

- Bake trên máy dev với *Lightmap Encoding: High Quality* nhưng Player Settings Android đặt *Normal Quality* → lightmap trên máy có dải màu (banding) ở vùng tối.
- Lightmap không được ép nén → 4 lightmap 2048 RGBA = 64MB RAM. Kiểm tra *Lightmap Compression* trong Lighting window là *Normal Quality* hoặc thấp hơn cho mobile.
- HDR bật trong URP Asset nhưng Camera tắt (hoặc ngược lại) → bloom threshold hoạt động khác giữa hai camera trong stack.
- Volume có Collider nhưng object mang Collider lại là Static → không kích hoạt được khi camera đi vào vì camera cần **Volume Trigger** được gán (`Camera → Environment → Volume Trigger`).
- Reflection Probe realtime để mặc định *Every Frame* trên một asset mua về → 6 lần vẽ cảnh mỗi frame, không hiện tên trong Profiler ở chỗ dễ thấy.

## Kiểm tra nhanh
- Frame Debugger: có bao nhiêu dòng *Shadow* / `MainLightShadow` và `AdditionalLightsShadow`? Mỗi dòng là một lần vẽ lại cảnh.
- Scene view → Draw Mode → **Light Overlap**: vùng đỏ là > 4 đèn baked chồng lấn → shadowmask rơi về baked, mất bóng động.
- Rendering Debugger → Rendering → **Overdraw**: full-screen post và particle cộng lại có làm cả màn đỏ không?
- Tắt hết post-processing: FPS trên máy đích tăng bao nhiêu? > 15% là post đang chiếm ngân sách quá lớn.
- Kéo một cube động vào góc tối nhất của cảnh: nó có tối theo không? Không thì probe thiếu ở đó.

## 🤖 Prompt cho AI

AI đặt 6 point light realtime có đổ bóng "cho đẹp", bật cả Bloom + DoF + Motion Blur trong một Volume, và không hề hỏi color space hay nền tảng.

**Phải nêu rõ:**
- Linear hay Gamma, HDR bật hay không
- Baked / Mixed / Realtime — và cái gì trong cảnh đứng yên, cái gì đổi
- Số đèn realtime tối đa và có đổ bóng hay không, trên máy yếu nhất
- Ngân sách ms cho post-processing và effect nào **bị cấm**
- Lightmap resolution và max size (nếu baked)
- 3D hay 2D (Light 2D là hệ hoàn toàn khác)

**Mẫu prompt**

```
Thiết lập lighting cho một cảnh indoor (hầm ngục) trong Unity 6 + URP 17, Linear, HDR bật (32-bit precision).
Nền tảng: Android tầm trung (Mali-G52), mục tiêu 60 FPS, ngân sách lighting + post ≤ 4ms.

Ràng buộc:
- Lighting Mode: Mixed – Subtractive. Toàn bộ kiến trúc Static + Contribute GI, lightmap 12 texel/unit, max size 2048.
- Realtime: CHỈ 1 directional (main light) có bóng, Max Distance 20m, 2 cascade, Soft Shadows tắt. Các đèn đuốc là Baked, Indirect Multiplier 1. KHÔNG có additional light realtime đổ bóng.
- Light Probe Group: đặt probe ở cửa, gốc đuốc, mép bóng — KHÔNG rải lưới đều. Liệt kê toạ độ từng probe.
- 1 Reflection Probe Baked mỗi phòng, Box Projection, 128.
- Post-processing: một Global Volume với Tonemapping Neutral (KHÔNG ACES), Color Adjustments, Vignette. CẤM Depth of Field, Motion Blur, Chromatic Aberration. Bloom threshold 1.2, Max Iterations 4, High Quality Filtering tắt.
- Viết script DamageVignette điều khiển weight của một Volume riêng, dùng unscaledDeltaTime, KHÔNG ghi vào profile asset.

Kèm checklist kiểm tra bằng Frame Debugger sau khi bake.
```

**Bẫy thường gặp:** AI viết `volume.profile.TryGet<Vignette>(out var v); v.intensity.value = 0.6f;` — chạy đúng trong Play Mode, rồi giá trị 0.6 **được lưu vào asset profile** vì `volume.profile` trả về asset gốc, không phải bản sao. Muốn sửa lúc chạy phải dùng `volume.profile = Instantiate(profile)` hoặc điều khiển `weight` của Volume riêng.
