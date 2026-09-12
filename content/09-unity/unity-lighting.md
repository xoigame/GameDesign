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

**Bẫy thường gặp:** AI viết `volume.sharedProfile.TryGet<Vignette>(out var v); v.intensity.value = 0.6f;` — chạy đúng trong Play Mode, rồi giá trị 0.6 **được lưu vào asset profile** vì `sharedProfile` là asset gốc. Muốn sửa lúc chạy phải dùng `volume.profile` (Unity tự instantiate bản sao riêng cho Volume đó ở lần truy cập đầu, nhớ Destroy trong `OnDestroy`) hoặc chỉ điều khiển `weight` của một Volume riêng.

## 💻 Code

Demo dựng hai thứ hay bị làm sai: một **Volume riêng cho trạng thái máu thấp** điều khiển bằng `weight` (không ghi vào asset profile) có vignette đập theo nhịp, và một **kiểm toán ngân sách đèn realtime** chạy mỗi 0.5s — tắt bóng point light ở xa camera và cảnh báo khi vượt "1 directional + 2 point đổ bóng".

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 370" role="img" aria-label="Hierarchy có Volume_Global, Volume_LowHP với GameplayVolumeDriver, LightBudget và bốn Torch; Inspector hiện Volume Global weight 0 với profile Vignette 0.45 và Saturation -40, GameplayVolumeDriver, Directional Light Mixed và URP Asset shadow distance 40, cascades 2, per object limit 4, Forward+ tắt">
  <rect x="10" y="10" width="200" height="350" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">Main Camera  (Post Processing ☑)</text>
  <text x="22" y="82" class="fig-muted" font-size="12">Directional Light  (Mixed)</text>
  <text x="22" y="100" class="fig-muted" font-size="12">Volume_Global  (weight 1)</text>
  <rect x="16" y="108" width="188" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="22" y="123" class="fig-label" font-size="12" font-weight="600">Volume_LowHP  (weight 0)</text>
  <text x="38" y="143" class="fig-muted" font-size="11">└ GameplayVolumeDriver</text>
  <text x="22" y="163" class="fig-muted" font-size="12">_LightBudget</text>
  <text x="38" y="181" class="fig-muted" font-size="11">└ LightBudget</text>
  <text x="22" y="201" class="fig-muted" font-size="12">▾ Torches</text>
  <text x="38" y="219" class="fig-muted" font-size="11">Torch_01…04  (Point, Mixed, Soft)</text>
  <text x="22" y="247" class="fig-label" font-size="12" font-weight="600">Project</text>
  <text x="22" y="265" class="fig-muted" font-size="11">Settings/VP_LowHP.asset</text>
  <text x="22" y="281" class="fig-muted" font-size="11">Settings/URP_Mobile.asset</text>
  <rect x="16" y="294" width="188" height="58" rx="4" class="fig-box"/>
  <text x="22" y="310" class="fig-label" font-size="11" font-weight="600">Console (LightBudget)</text>
  <text x="22" y="326" fill="#ffd43b" font-size="10">⚠ 3 point light đổ bóng &gt; ngân sách 2</text>
  <text x="22" y="342" class="fig-muted" font-size="10">Torch_04 cách camera 31m → tắt bóng</text>
  <rect x="226" y="10" width="424" height="350" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#b197fc" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Volume_LowHP ▸ Volume</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Mode / Priority</text><text x="440" y="82" class="fig-label" font-size="11">Global   /   10</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Weight</text><text x="440" y="98" class="fig-label" font-size="11">0   (code điều khiển)</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Profile</text><text x="440" y="114" class="fig-label" font-size="11">VP_LowHP</text>
  <text x="250" y="130" class="fig-muted" font-size="11">└ Vignette ▸ Intensity / Smoothness</text><text x="440" y="130" class="fig-label" font-size="11">☑ 0.45   /   ☑ 0.4</text>
  <text x="250" y="146" class="fig-muted" font-size="11">└ Color Adjustments ▸ Saturation</text><text x="440" y="146" class="fig-label" font-size="11">☑ −40</text>
  <rect x="234" y="156" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="169" class="fig-label" font-size="12" font-weight="600">Gameplay Volume Driver (Script)</text>
  <text x="250" y="188" class="fig-muted" font-size="11">Low Hp Volume</text><text x="440" y="188" class="fig-label" font-size="11">Volume_LowHP</text>
  <text x="250" y="204" class="fig-muted" font-size="11">Fade / Pulse Speed</text><text x="440" y="204" class="fig-label" font-size="11">0.3   /   2</text>
  <text x="250" y="220" class="fig-muted" font-size="11">Pulse Amplitude / Low Hp Threshold</text><text x="440" y="220" class="fig-label" font-size="11">0.1   /   0.3</text>
  <text x="250" y="236" class="fig-muted" font-size="11">Debug Health (slider để thử)</text><text x="440" y="236" class="fig-label" font-size="11">1</text>
  <rect x="234" y="246" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="259" class="fig-label" font-size="12" font-weight="600">Directional Light ▸ Light</text>
  <text x="250" y="278" class="fig-muted" font-size="11">Mode / Indirect Multiplier</text><text x="440" y="278" class="fig-label" font-size="11">Mixed   /   1</text>
  <text x="250" y="294" class="fig-muted" font-size="11">Shadow Type</text><text x="440" y="294" class="fig-label" font-size="11">Soft Shadows</text>
  <rect x="234" y="304" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="317" class="fig-label" font-size="12" font-weight="600">URP_Mobile (Universal Render Pipeline Asset)</text>
  <text x="250" y="336" class="fig-muted" font-size="11">Shadows ▸ Max Distance / Cascade Count</text><text x="440" y="336" class="fig-label" font-size="11">40   /   2</text>
  <text x="250" y="352" class="fig-muted" font-size="11">Additional Lights ▸ Per Object Limit · Forward+</text><text x="440" y="352" class="fig-label" font-size="11">4   ·   ☐</text>
</svg>
<figcaption>Volume_LowHP là Volume Global thứ hai, weight 0, priority cao hơn Volume_Global. Driver chỉ kéo weight và pulse intensity trên bản profile đã instantiate. LightBudget đọc URP Asset không cần — nó đếm component Light trong cảnh.</figcaption>
</figure>

**Script**

```csharp
// GameplayVolumeDriver.cs — Unity 6 (6000.x) + URP 17. Điều khiển Volume_LowHP: weight mượt 0→1 trong 0.3s, vignette đập theo nhịp khi máu thấp.
// volume.profile (KHÔNG phải volume.sharedProfile) trả về bản sao được instantiate riêng cho Volume này — ghi vào nó không làm bẩn asset.
// Bản sao là ScriptableObject sống trong bộ nhớ → Destroy ở OnDestroy.
using System.Collections;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

public class GameplayVolumeDriver : MonoBehaviour
{
    [SerializeField] Volume lowHpVolume;                       // Volume riêng, Global, weight 0, profile có Vignette + Color Adjustments
    [SerializeField] float fade = 0.3f;
    [SerializeField] float pulseSpeed = 2f;                    // Hz
    [SerializeField] float pulseAmplitude = 0.1f;              // ± quanh intensity gốc trong profile (0.45)
    [SerializeField, Range(0f, 1f)] float lowHpThreshold = 0.3f;
    [SerializeField, Range(0f, 1f)] float debugHealth = 1f;   // kéo slider trong Play Mode để thử, không cần hệ máu thật

    Vignette vignette;
    ColorAdjustments colorAdjustments;
    float baseIntensity;
    bool lowHp;
    Coroutine fadeRoutine;

    void Awake()
    {
        if (lowHpVolume == null) { Debug.LogError("Chưa gán Volume_LowHP", this); enabled = false; return; }

        VolumeProfile profile = lowHpVolume.profile;           // instantiate lần đầu truy cập
        if (!profile.TryGet(out vignette) || !profile.TryGet(out colorAdjustments))
        {
            Debug.LogError("Profile cần có Vignette và Color Adjustments (bật override Intensity / Saturation)", this);
            enabled = false; return;
        }
        baseIntensity = vignette.intensity.value;              // 0.45 từ profile — không hardcode ở đây
        lowHpVolume.weight = 0f;
    }

    /// <summary>Gọi từ hệ máu với giá trị 0…1. Chỉ đổi trạng thái khi qua ngưỡng — không fade lại mỗi lần trúng đòn.</summary>
    public void SetHealth(float normalized)
    {
        bool nowLow = normalized <= lowHpThreshold;
        if (nowLow == lowHp) return;
        lowHp = nowLow;
        if (fadeRoutine != null) StopCoroutine(fadeRoutine);
        fadeRoutine = StartCoroutine(FadeWeight(lowHp ? 1f : 0f));
    }

    IEnumerator FadeWeight(float target)
    {
        float start = lowHpVolume.weight, t = 0f;
        while (t < fade)
        {
            t += Time.unscaledDeltaTime;                        // hitstop/slow-mo không được kéo dài fade
            lowHpVolume.weight = Mathf.Lerp(start, target, t / fade);
            yield return null;
        }
        lowHpVolume.weight = target;
        fadeRoutine = null;
    }

    void Update()
    {
        SetHealth(debugHealth);                                // demo; dự án thật bỏ dòng này, để hệ máu gọi SetHealth
        if (!lowHp) return;

        // Pulse quanh giá trị gốc, cùng pha với Saturation để "tim đập" đồng bộ. Sin thay AnimationCurve cho gọn.
        float pulse = 0.5f + 0.5f * Mathf.Sin(Time.unscaledTime * pulseSpeed * 2f * Mathf.PI);
        vignette.intensity.value = baseIntensity + pulseAmplitude * (pulse * 2f - 1f);
        colorAdjustments.saturation.value = Mathf.Lerp(-40f, -60f, pulse);
    }

    void OnDestroy()
    {
        // Gỡ bản profile đã instantiate (và các component con của nó) để không rò rỉ qua nhiều lần load scene.
        if (lowHpVolume == null || !lowHpVolume.HasInstantiatedProfile()) return;
        var profile = lowHpVolume.profile;
        foreach (var c in profile.components) Destroy(c);
        Destroy(profile);
    }
}
```

```csharp
// LightBudget.cs — Unity 6 (6000.x) + URP 17. Kiểm toán đèn realtime mỗi 0.5s (coroutine, KHÔNG mỗi frame):
// tắt bóng point/spot light cách camera > 25m, khôi phục khi lại gần, cảnh báo khi vượt ngân sách "1 directional + 2 point đổ bóng".
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LightBudget : MonoBehaviour
{
    [SerializeField] Camera targetCamera;                  // trống → Camera.main
    [SerializeField] float checkInterval = 0.5f;
    [SerializeField] float shadowCullDistance = 25f;
    [SerializeField] int maxShadowedDirectional = 1;
    [SerializeField] int maxShadowedPunctual = 2;          // point + spot

    // Bóng gốc của từng đèn để khôi phục — không được "đoán" lại là Soft hay Hard
    readonly Dictionary<Light, LightShadows> originalShadows = new();
    bool wasOverBudget;

    public int RealtimeLights { get; private set; }
    public int ShadowedDirectional { get; private set; }
    public int ShadowedPunctual { get; private set; }

    void OnEnable()
    {
        if (targetCamera == null) targetCamera = Camera.main;
        StartCoroutine(AuditLoop());
    }

    IEnumerator AuditLoop()
    {
        var wait = new WaitForSecondsRealtime(checkInterval);   // tạo MỘT lần, tái dùng
        while (enabled)
        {
            Audit();
            yield return wait;
        }
    }

    void Audit()
    {
        if (targetCamera == null) return;
        Vector3 camPos = targetCamera.transform.position;
        int realtime = 0, shadowedDir = 0, shadowedPunctual = 0;

        // FindObjectsByType cấp phát một mảng — chấp nhận được ở tần suất 2 lần/giây. Dự án lớn: đèn tự đăng ký vào danh sách khi OnEnable.
        var lights = FindObjectsByType<Light>(FindObjectsSortMode.None);
        foreach (var l in lights)
        {
            if (!l.enabled) continue;
            if (l.bakingOutput.lightmapBakeType == LightmapBakeType.Baked) continue;   // Baked không tốn lúc chạy
            realtime++;

            if (l.type == LightType.Directional)
            {
                if (l.shadows != LightShadows.None) shadowedDir++;
                continue;
            }

            // Point/Spot: nhớ bóng gốc lần đầu gặp, rồi bật/tắt theo khoảng cách tới camera
            if (!originalShadows.TryGetValue(l, out var original))
            {
                original = l.shadows;
                originalShadows[l] = original;
            }
            if (original == LightShadows.None) continue;

            float dist = Vector3.Distance(camPos, l.transform.position);
            l.shadows = dist > shadowCullDistance ? LightShadows.None : original;
            if (l.shadows != LightShadows.None) shadowedPunctual++;
        }

        RealtimeLights = realtime;
        ShadowedDirectional = shadowedDir;
        ShadowedPunctual = shadowedPunctual;

        bool over = shadowedDir > maxShadowedDirectional || shadowedPunctual > maxShadowedPunctual;
        if (over && !wasOverBudget)                      // chỉ log khi CHUYỂN trạng thái, không spam mỗi 0.5s
            Debug.LogWarning($"[LightBudget] {shadowedDir} directional + {shadowedPunctual} point/spot đổ bóng " +
                             $"(ngân sách {maxShadowedDirectional} + {maxShadowedPunctual}). Mỗi bóng là một lần vẽ lại cảnh.", this);
        else if (!over && wasOverBudget)
            Debug.Log("[LightBudget] Đã về trong ngân sách bóng.", this);
        wasOverBudget = over;
    }

    void OnDisable()
    {
        foreach (var kv in originalShadows)
            if (kv.Key != null) kv.Key.shadows = kv.Value;     // trả bóng gốc khi tắt hệ
        originalShadows.Clear();
    }
}
```

**Chạy thử**
- Vào Play, kéo `Debug Health` xuống dưới 0.3: viền tối hiện lên trong 0.3s rồi **đập** 2 lần/giây (intensity 0.35↔0.55), màu bệch đi (saturation −40…−60). Kéo lên trên 0.3: mờ đi trong 0.3s. Kéo qua lại **trong** vùng < 0.3 không làm fade chạy lại.
- Thoát Play rồi mở `VP_LowHP.asset`: Intensity vẫn **0.45**, Saturation vẫn **−40**. Nếu asset đổi thì code đang chạm `sharedProfile` — đây là bẫy được nói ở thân bài.
- `Time.timeScale = 0.2` (đổi trong Project Settings ▸ Time lúc Play): fade vẫn 0.3s thật và nhịp đập vẫn 2 Hz — vì dùng `unscaledDeltaTime` / `unscaledTime`.
- Đặt 4 Torch có bóng, kéo camera ra xa hơn 25m: Frame Debugger số dòng `AdditionalLightsShadow` giảm theo từng đuốc, Console báo một lần khi vượt "1 + 2" và một lần khi về ngân sách — không lặp mỗi 0.5s.
- Profiler ▸ CPU: `LightBudget.Audit` chỉ xuất hiện 2 lần/giây; GC Alloc trong frame có audit là một mảng nhỏ (`FindObjectsByType`), các frame khác 0 B.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | Realtime, Baked, Mixed khác nhau thế nào? |
| Junior | Vật động trong cảnh đã bake trông tối thui / trôi nổi. Vì sao? |
| Mid | URP giới hạn bao nhiêu đèn? Forward+ giải quyết gì, và khi nào **không** nên bật? |
| Mid | Post-processing nào rẻ, nào đắt trên mobile? |
| Senior | Cảnh mobile đẹp trong Editor, 22fps trên máy. Anh cắt gì trước ở phần ánh sáng? |
| Senior | Sửa giá trị Volume lúc chạy thế nào cho đúng? |

**Khung trả lời 60 giây** — "Chọn chiến lược ánh sáng thế nào?"

> Theo việc ánh sáng có **đổi** hay không. Mobile với level tĩnh: **Baked toàn bộ**, 0 đèn realtime — lightmap chỉ là một texture, có GI và bóng mềm gần như miễn phí. Có chu kỳ ngày/đêm: **Realtime** với đúng một directional light cộng Environment Lighting đổi theo giờ, giữ số đèn tối thiểu. Indoor có đèn bật/tắt và vật động cần bóng: **Mixed – Shadowmask**. Mobile yếu mà vẫn cần bóng nhân vật: **Subtractive**.
>
> Và điều kiện đi kèm với Baked: vật động phải có **Light Probe**, nếu không nó lấy ánh sáng môi trường mặc định và trông như dán vào cảnh chứ không thuộc về cảnh. Probe đặt dày ở nơi ánh sáng đổi nhanh (cửa ra vào, ranh sáng-tối), thưa ở chỗ đồng đều.

**Họ sẽ đào tiếp**

- *"Forward+?"* → Renderer thường của URP giới hạn số đèn **per-object** (mặc định 8 additional light, mobile thường hạ xuống 4), nên đèn thứ 9 đơn giản là biến mất trên object đó. Forward+ chia màn hình thành cluster nên bỏ được giới hạn đó, và là **điều kiện bắt buộc** cho GPU Resident Drawer / GPU Occlusion Culling của Unity 6. Nhưng nó dựng cluster mỗi frame — mobile chỉ có 1–3 đèn thì bật vào là **lỗ**.
- *"Bóng tốn ở đâu?"* → Shadow map là một lần render cảnh thêm cho mỗi đèn đổ bóng. Cắt theo thứ tự: giảm `Shadow Distance` (thứ rẻ nhất và hiệu quả nhất), giảm số cascade, hạ độ phân giải shadow map, tắt bóng cho đèn phụ, và với mobile thì cân nhắc bóng giả — một quad tối dưới chân nhân vật là đủ cho rất nhiều game.
- *"Post-processing?"* → Gần như miễn phí vì gộp chung một pass Uber: Tonemapping, Color Adjustments, Vignette, Film Grain. Đắt: Depth of Field 3–6ms (Bokeh đắt gấp ~3 Gaussian — mobile thường bỏ hẳn), Bloom 1.5–3ms (tắt High Quality Filtering, Max Iterations 4, threshold > 1.0 khi có HDR). Chọn tonemapper cũng là quyết định art: **ACES** hợp cảnh thực, nhưng nó bão hoà và tối vùng đỏ nên art pastel hay bị "cháy" — lúc đó dùng Neutral rồi bù bằng Color Adjustments.
- *"Cứu fps nhanh nhất?"* → `Render Scale` trong URP Asset: 0.75 bỏ 44% số pixel cho mọi pass 3D mà UI vẫn nét vì Canvas vẽ ở độ phân giải gốc. Unity 6 có **STP** upscale nét hơn FSR ở cùng scale, tốn thêm ~1ms. Đây là công tắc nên nối vào cài đặt chất lượng cho người chơi chọn.
- *"Sửa Volume lúc chạy?"* → `volume.sharedProfile` là **asset gốc** — sửa nó trong Play Mode là ghi vĩnh viễn vào file, và bạn commit nhầm lúc nào không hay. Dùng `volume.profile` (Unity tạo bản sao riêng, nhớ Destroy trong `OnDestroy`), hoặc sạch hơn: một Volume riêng cho hiệu ứng đó và chỉ điều khiển `weight`.

**Cờ đỏ**

- Bake xong không đặt Light Probe.
- Để `Shadow Distance` mặc định 50m trên mobile.
- Bật realtime GI "cho đẹp" trên mobile.
- Không biết vì sao đèn thứ 9 không có tác dụng.
- Nói "bật Bloom lên cho lung linh" mà không biết threshold và chi phí.

**Số / ví dụ nên thuộc**

- URP additional light mặc định 8 per-object (mobile hay đặt 4); Forward+ bỏ giới hạn đó.
- DoF 3–6ms · Bloom 1.5–3ms · Tonemapping/Color/Vignette ≈ 0.
- Render Scale 0.75 ≈ giảm 44% pixel.
