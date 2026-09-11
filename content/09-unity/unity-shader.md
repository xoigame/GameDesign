---
title: Shader trong URP
icon: 🌈
summary: Shader Graph lo 80% material, HLSL tay cho phần còn lại — nhưng thứ quyết định frame rate không phải shader đẹp hay xấu, mà là nó có phá SRP Batcher hay không.
status: deep
read: 710
level: advanced
order: 120
tags: [unity, shader, rendering, urp]
related: [art-direction, unity-vfx, unity-lighting, unity-optimization]
---

Quyết định quan trọng nhất không phải "viết HLSL hay kéo Shader Graph", mà là **mọi shader trong dự án phải tương thích SRP Batcher, và code gameplay không được vô tình phá điều đó**. Một dự án mobile 300 draw call có thể còn 40 batch nếu shader sạch — hoặc ở lại 300 nếu ai đó gọi `renderer.material.color = …` trong mỗi kẻ địch.

Phần lý thuyết về bảng màu, silhouette, độ đọc được nằm ở [[art-direction]]. Node này chỉ nói phần Unity: làm sao hiện thực hoá cái nhìn đó mà không trả giá bằng frame.

## Shader Graph hay HLSL tay

| | Shader Graph | HLSL tay |
|---|---|---|
| Material thường (PBR, toon, dissolve, scrolling, hit flash) | ✅ **Mặc định** — 80% nhu cầu | Không đáng |
| Cần `half` precision chặt, bỏ nhánh thừa cho mobile yếu | Được (Precision: Half per graph/node) nhưng khó kiểm soát code sinh | ✅ |
| Full-screen pass, hiệu ứng đọc depth/normal | Được qua Fullscreen target (Unity 6) | ✅ khi cần nhiều pass |
| Tính năng Graph không có (stencil tuỳ ý, multi-pass, geometry tricks) | ❌ | ✅ |
| Artist tự sửa được | ✅ | ❌ |

Graph sinh HLSL khá tốt, nhưng **mỗi node là code** — một graph 60 node với 5 `Sample Texture 2D` trên mobile là fragment shader nặng. Bấm *View Generated Shader* ít nhất một lần để biết mình đang ship gì. Khi phải viết tay, viết cho URP bằng `#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"` và `Lighting.hlsl`, không copy shader Built-in từ tutorial 2019.

**Shader Built-in không chạy trên URP.** Material hồng (magenta) nghĩa là shader không biên dịch được cho pipeline hiện tại — thường là asset store viết cho `Standard` hoặc dùng `UnityCG.cginc`. `Window > Rendering > Render Pipeline Converter` đổi được material dùng shader Unity chuẩn (`Standard` → `Universal Render Pipeline/Lit`); **shader tự viết của asset thì không** — phải viết lại. Trước khi mua asset: đọc mô tả có ghi "URP" và phiên bản không, mở ảnh preview xem có material hồng không, và tính sẵn chi phí viết lại nếu shader là điểm bán của asset đó.

## SRP Batcher — luật quan trọng nhất

SRP Batcher gom mọi renderer dùng **cùng shader variant** vào một batch, **kể cả khác material** — miễn là shader khai báo property trong `CBUFFER_START(UnityPerMaterial)` (Shader Graph làm tự động). Nghĩa là 200 kẻ địch với 20 material khác màu, cùng shader, vẫn là một batch. Đây là lý do URP không cần atlas material như Built-in.

Hai cách phá nó mà code gameplay hay làm:

```csharp
// ❌ tạo INSTANCE material mới cho renderer này — rò rỉ nếu không Destroy, và mỗi instance là một material riêng
renderer.material.SetColor("_BaseColor", Color.red);

// ❌ đúng ý đồ hơn, nhưng renderer có MaterialPropertyBlock rơi khỏi SRP Batcher
var mpb = new MaterialPropertyBlock();
mpb.SetFloat("_Flash", 1f);
renderer.SetPropertyBlock(mpb);

// ✅ đổi cho MỌI renderer dùng material đó — khi bạn thật sự muốn thế (đổi theme, đổi thời tiết)
renderer.sharedMaterial.SetColor(BaseColorId, Color.red);
```

`MaterialPropertyBlock` không phải kẻ xấu — nó dành cho **ít object cần giá trị riêng trong thời gian ngắn** (nhân vật bị đánh nhấp nháy 0.1s). Với hàng trăm object cần giá trị riêng lâu dài (màu team, độ hư hại), đưa dữ liệu vào **vertex color / UV2** khi build mesh, hoặc dùng GPU instancing.

**GPU instancing** dành cho hàng trăm–nghìn *cùng mesh cùng material* (cỏ, đá, đạn). Lưu ý URP: renderer tương thích SRP Batcher thì Unity **ưu tiên SRP Batcher và bỏ qua** checkbox *Enable GPU Instancing* trên material. Muốn instancing thật, gọi `Graphics.RenderMeshInstanced` với mảng matrix — không có GameObject, không có Transform, rẻ nhất có thể. Unity 6 còn có **GPU Resident Drawer** (URP Asset, cần Forward+) tự instancing MeshRenderer thường — bật rồi đo, đừng tin mặc định.

## Hit flash — code mẫu và đánh đổi

```csharp
public class HitFlash : MonoBehaviour {
    static readonly int FlashId = Shader.PropertyToID("_FlashAmount");   // đúng REFERENCE trong Shader Graph
    [SerializeField] float duration = 0.08f;
    Renderer rend; MaterialPropertyBlock mpb; float t = -1f;

    void Awake() { rend = GetComponent<Renderer>(); mpb = new MaterialPropertyBlock(); }

    public void Flash() => t = duration;

    void Update() {
        if (t < 0f) return;
        t -= Time.deltaTime;
        if (t <= 0f) { rend.SetPropertyBlock(null); return; }   // xoá block → quay lại SRP batch
        mpb.SetFloat(FlashId, t / duration);
        rend.SetPropertyBlock(mpb);
    }
}
```

Điểm mấu chốt là dòng `SetPropertyBlock(null)`: object chỉ rời batch **trong lúc nhấp nháy**, hết là quay lại. Nếu 50 kẻ địch cùng nhấp nháy khi bom nổ → 50 draw call thêm trong 5 frame — chấp nhận được. Nếu ai đó để block ở đó mãi vì "không có gì thay đổi" → 50 draw call vĩnh viễn. Hitstop và rung kèm theo xem [[unity-vfx]].

## Hiệu ứng thường gặp trong Shader Graph

- **Dissolve** — `Simple Noise` (scale 20–40) → `Step` với `_Dissolve` (0…1) → nối vào **Alpha** + bật Alpha Clip; lấy `Step(noise, _Dissolve + 0.05) − Step(noise, _Dissolve)` nhân màu HDR vào **Emission** để có viền cháy. Trên mobile, alpha clip tốn (xem bên dưới) — cân nhắc chỉ bật ở kẻ địch đang chết.
- **Outline** — hai trường phái. *Inverted hull*: pass thứ hai vẽ mesh phình theo normal, `Cull Front` — Shader Graph không đa pass, nên làm bằng một MeshRenderer con với material outline riêng, hoặc viết HLSL. *Screen-space*: Renderer Feature đọc depth/normal, phát hiện cạnh — một pass full-screen cho cả cảnh, không phụ thuộc mesh, nhưng tốn fill rate toàn màn hình trên mobile.
- **Toon** — `Custom Function` node lấy main light, `Dot(N, L)` → `Step` hoặc sample ramp texture 1D → nhân màu. Hàm phải chặn preview:

```hlsl
void MainLight_half(float3 worldPos, out half3 dir, out half3 color, out half atten) {
#ifdef SHADERGRAPH_PREVIEW
    dir = half3(0.5, 0.5, 0); color = 1; atten = 1;
#else
    Light l = GetMainLight(TransformWorldToShadowCoord(worldPos));
    dir = l.direction; color = l.color; atten = l.shadowAttenuation * l.distanceAttenuation;
#endif
}
```

- **Vertex displacement** (cỏ, cờ) — `Position` (Object) + `Sine(Time × speed + worldPos.x)` × `_Amplitude` × mask từ UV.y (chân cỏ không lay) → **Vertex Position**. Vertex shader rẻ hơn fragment nhiều lần trên mobile — ưu tiên đẩy hiệu ứng lên đây.
- **Sprite 2D** — target *Universal → Sprite Lit / Sprite Unlit*. Texture chính **phải có Reference `_MainTex`**, nếu không SpriteRenderer không đưa sprite vào được và bạn thấy ô trắng. Sprite Lit mới nhận Light 2D (xem [[unity-lighting]]).
- **Scrolling UV** — `Tiling And Offset` với Offset = `Time × _Speed`. Dùng `Fraction` nếu chạy lâu để tránh mất precision `half` sau vài phút.

## Renderer Feature và Render Graph (URP 17)

Trước khi viết code: **Unity 6 có Full Screen Pass Renderer Feature sẵn**. Thêm vào Universal Renderer, gán material từ Shader Graph target *Fullscreen*, chọn `Injection Point` (After Rendering Post Processing cho vignette máu, Before Rendering Transparents cho hiệu ứng cần depth). Ba phần tư nhu cầu "tôi cần custom pass" dừng ở đây.

Khi phải viết `ScriptableRendererFeature`: URP 17 dùng **Render Graph** — pass ghi đè `RecordRenderGraph(RenderGraph, ContextContainer)` và khai báo tài nguyên qua `builder.UseTexture` / `SetRenderAttachment`, không còn `Execute(ScriptableRenderContext, ref RenderingData)` với `CommandBuffer` thủ công. Code mẫu trên mạng viết cho URP 12–14 sẽ **chỉ chạy khi bật Compatibility Mode** (Graphics Settings → *Compatibility Mode (Render Graph Disabled)*) — bật tuỳ chọn đó là từ chối mọi tối ưu Render Graph, đừng coi là cách sửa lâu dài.

## Shader variant và thời gian build

Mỗi `#pragma multi_compile A B` **nhân đôi** số variant; URP đã có ~20 keyword nội bộ. Một shader Lit đầy đủ có hàng nghìn variant, và thời gian build 40 phút của bạn phần lớn là biên dịch chúng.

- `shader_feature` thay `multi_compile` cho keyword **do material bật** — chỉ variant thật sự dùng được build. `multi_compile` chỉ khi keyword đổi lúc chạy bằng `Shader.EnableKeyword`.
- URP Asset → *Shader Stripping*: bật *Strip Unused Variants*, *Strip Unused Post Processing Variants*, và **tắt tính năng không dùng** (Terrain Holes, Light Layers, Decal) — mỗi feature là một keyword.
- **Khựng lần đầu** khi shader biên dịch lúc chạy: tạo `ShaderVariantCollection` bằng nút *Save to asset* trong Graphics Settings sau khi chơi hết cảnh, rồi `collection.WarmUp()` ở màn loading. Unity 6 thêm `GraphicsStateCollection` (precompile pipeline state cho Vulkan/Metal) — cùng ý, sâu hơn.

## Precision và mobile

- Mặc định **`half`** cho màu, UV, normal; `float` chỉ cho world position và depth. Shader Graph: đặt Precision *Half* ở cấp graph, chỉnh *Single* cho node cần.
- `pow`, `sin`, `exp`, `normalize` trong fragment tốn trên Mali/Adreno cũ — đẩy lên vertex, hoặc thay bằng texture lookup / xấp xỉ `x*x`.
- **Alpha test (clip) tốn trên tile GPU** vì tắt early-Z cho object đó — 100 lá cây alpha-clip trên mobile là fill rate ngập. Dùng mesh cắt theo hình thay cho quad + clip khi được.
- Transparent: `ZWrite Off` là đúng mặc định; bật lên để "sửa" sorting sẽ tạo lỗ đen ở mép. Blend mode Additive rẻ hơn Alpha vì không cần sort chính xác.
- **Texture sampling**: mipmap bật cho mọi thứ trong 3D (tắt = cache miss + shimmer); tắt cho UI và sprite 2D pixel-perfect. Sample thứ 4–5 trong một fragment là lúc bắt đầu thấy trên máy yếu.

## Sorting cho transparent

Transparent vẽ **sau** opaque, sort theo khoảng cách tâm bounding box tới camera, từ xa tới gần. Hai object chồng nhau có tâm gần bằng nhau → thứ tự lật qua lại giữa frame — hiện tượng "nhấp nháy" khi camera xoay. Sửa bằng **Sorting Priority** trên material URP (−50…50, thực chất là offset Render Queue) — không sửa bằng đổi `ZWrite`. Trong 2D, `Sorting Layer` + `Order in Layer` quyết định, và particle chồng sprite xem [[unity-vfx]].

## Bẫy lộ ra khi build

- Gọi `material.SetFloat("Flash Amount", …)` theo **Display Name** thay vì **Reference** (`_FlashAmount`) — không lỗi, không tác dụng. Luôn `Shader.PropertyToID` một lần và đặt reference bắt đầu bằng `_`.
- Shader chỉ dùng qua `Shader.Find` trong code **bị strip khỏi build** — thêm vào *Always Included Shaders* hoặc tham chiếu qua Material trong Inspector.
- Shader biên dịch trong Editor (DX11) nhưng lỗi trên Android (GLES3/Vulkan) vì dùng hàm hoặc precision không có — kiểm tra *Compile and show code* với platform Android trước khi build.
- `Shader.EnableKeyword` toàn cục với keyword khai báo `shader_feature` → variant không tồn tại trong build, Unity im lặng chọn variant gần nhất.

## Kiểm tra nhanh
- Frame Debugger ở cảnh đông nhất: số **SRP Batch** dưới 1/5 số draw call? Bấm vào một batch bị ngắt và đọc lý do — "Objects have different shaders", "different keywords", hay "Node has a MaterialPropertyBlock".
- `Window > Analysis > Rendering Debugger` → Material → *Material Override* = Wireframe hoặc Overdraw: vùng đỏ đậm trên mobile có rộng hơn 1/4 màn hình không?
- Đếm variant: Editor.log sau build, dòng `Compiling shader "…" pass "…"` — shader nào > 500 variant?
- Tìm `\.material\.` trong toàn bộ code: mỗi kết quả là một instance material — có `Destroy` tương ứng không?
- Lần đầu vào cảnh trên máy thật có khựng > 100ms không? Có thì warmup chưa đủ variant.

## 🤖 Prompt cho AI

AI viết shader theo cú pháp Built-in (`UnityCG.cginc`, `UnityObjectToClipPos`, `_MainTex_ST` không có CBUFFER) rồi bảo "tương thích URP", và đổi màu bằng `renderer.material` trong Update mà không biết vừa phá SRP Batcher.

**Phải nêu rõ:**
- URP phiên bản nào (17 với Render Graph, hay 14 dùng `Execute` cũ) — API Renderer Feature khác hoàn toàn
- Shader Graph hay HLSL tay, và vì sao (mobile precision / tính năng thiếu / artist sửa)
- Tên **Reference** của mọi property sẽ gọi từ code
- Có bao nhiêu object dùng shader này cùng lúc → quyết định MPB / vertex color / instancing
- Nền tảng yếu nhất và GPU (Mali-G52, Adreno 610…) để chọn `half` và số sample
- Keyword nào đổi lúc chạy (`multi_compile`) và keyword nào chỉ bật ở material (`shader_feature`)

**Mẫu prompt**

```
Viết shader HLSL cho Unity 6 (6000.0.x) + URP 17. Không phải Shader Graph.

Mục đích: toon shading 2 bậc + hit flash + dissolve cho kẻ địch, mobile Android (Mali-G52), ~150 kẻ địch cùng cảnh.

Bắt buộc:
- #include từ Packages/com.unity.render-pipelines.universal/ShaderLibrary (Core.hlsl, Lighting.hlsl). CẤM UnityCG.cginc, CẤM UnityObjectToClipPos.
- Mọi property trong CBUFFER_START(UnityPerMaterial) … CBUFFER_END để tương thích SRP Batcher.
- Reference: _BaseMap, _BaseColor, _RampStep (0.5), _FlashAmount (0–1), _Dissolve (0–1), _EdgeColor (HDR).
- Dùng half cho màu/normal/UV, float chỉ cho positionWS và shadow coord.
- Tối đa 2 texture sample trong fragment. CẤM pow/exp trong fragment.
- Dissolve dùng shader_feature _DISSOLVE_ON (bật per material), KHÔNG dùng multi_compile.
- Có pass ShadowCaster và DepthOnly để đổ bóng và Depth prepass đúng.

Kèm script C# HitFlash dùng MaterialPropertyBlock, gọi SetPropertyBlock(null) khi hết flash.
Sau khi viết, liệt kê số variant sinh ra và lý do từng keyword.
```

**Bẫy thường gặp:** AI thêm `#pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN` cùng năm keyword URP khác "cho chắc" — shader biên dịch, trông đúng, nhưng thời gian build tăng 10 phút và bản Android có hàng trăm variant không bao giờ dùng. Yêu cầu AI **giải thích từng keyword** và bỏ những cái không khớp cài đặt URP Asset của bạn.

## 💻 Code

Demo dựng một shader URP viết tay (unlit, hit flash + dissolve) tương thích SRP Batcher, và một driver dùng `MaterialPropertyBlock` để chỉ **object bị đánh** rời batch trong 0.08s rồi quay lại. Kiểm chứng bằng Frame Debugger: 50 kẻ địch cùng shader = 1 SRP Batch, con đang nhấp nháy tách ra, hết flash gộp lại.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 360" role="img" aria-label="Hierarchy có ba Enemy dùng chung material M_Enemy, Frame Debugger báo SRP Batch tương thích; Inspector hiện material M_Enemy với shader Custom/HitFlashDissolve và component FlashDissolveDriver">
  <rect x="10" y="10" width="200" height="340" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">Main Camera</text>
  <text x="22" y="82" class="fig-muted" font-size="12">Directional Light</text>
  <text x="22" y="100" class="fig-muted" font-size="12">▾ Enemies</text>
  <rect x="16" y="108" width="188" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="38" y="123" class="fig-label" font-size="12" font-weight="600">Enemy_01  (M_Enemy)</text>
  <text x="38" y="143" class="fig-muted" font-size="12">Enemy_02  (M_Enemy)</text>
  <text x="38" y="161" class="fig-muted" font-size="12">Enemy_03  (M_Enemy)</text>
  <text x="22" y="196" class="fig-label" font-size="12" font-weight="600">Project</text>
  <text x="22" y="214" class="fig-muted" font-size="11">Shaders/HitFlashDissolve.shader</text>
  <text x="22" y="230" class="fig-muted" font-size="11">Materials/M_Enemy.mat</text>
  <text x="22" y="246" class="fig-muted" font-size="11">Scripts/FlashDissolveDriver.cs</text>
  <rect x="16" y="260" width="188" height="82" rx="4" class="fig-box"/>
  <text x="22" y="276" class="fig-label" font-size="11" font-weight="600">Frame Debugger</text>
  <text x="22" y="292" class="fig-muted" font-size="10">SRP Batch  ·  3 draws</text>
  <text x="22" y="306" fill="#51cf9b" font-size="10">SRP Batcher: compatible</text>
  <text x="22" y="322" class="fig-muted" font-size="10">Enemy_02 (đang flash) tách riêng:</text>
  <text x="22" y="336" fill="#ffd43b" font-size="10">"Node has a MaterialPropertyBlock"</text>
  <rect x="226" y="10" width="424" height="340" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector — Enemy_01</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#b197fc" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">M_Enemy (Material)</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Shader</text><text x="440" y="82" class="fig-label" font-size="11">Custom/HitFlashDissolve</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Base Map</text><text x="440" y="98" class="fig-label" font-size="11">T_Enemy_Albedo</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Noise Tex</text><text x="440" y="114" class="fig-label" font-size="11">T_Noise_Perlin (Wrap: Repeat)</text>
  <text x="250" y="130" class="fig-muted" font-size="11">Base Color</text><text x="440" y="130" class="fig-label" font-size="11">#FFFFFF</text>
  <text x="250" y="146" class="fig-muted" font-size="11">Flash Amount / Dissolve</text><text x="440" y="146" class="fig-label" font-size="11">0   /   0   (code ghi đè)</text>
  <text x="250" y="162" class="fig-muted" font-size="11">Edge Width</text><text x="440" y="162" class="fig-label" font-size="11">0.05</text>
  <text x="250" y="178" class="fig-muted" font-size="11">Edge Color (HDR)</text><rect x="440" y="168" width="12" height="12" rx="2" fill="#ffd43b"/><text x="458" y="178" class="fig-label" font-size="11">#FFD43B</text>
  <rect x="234" y="188" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="201" class="fig-label" font-size="12" font-weight="600">Mesh Renderer</text>
  <text x="250" y="220" class="fig-muted" font-size="11">Materials [0]</text><text x="440" y="220" class="fig-label" font-size="11">M_Enemy  (shared — KHÔNG instance)</text>
  <text x="250" y="236" class="fig-muted" font-size="11">Cast Shadows</text><text x="440" y="236" class="fig-label" font-size="11">On</text>
  <rect x="234" y="246" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="259" class="fig-label" font-size="12" font-weight="600">Flash Dissolve Driver (Script)</text>
  <text x="250" y="278" class="fig-muted" font-size="11">Flash Duration</text><text x="440" y="278" class="fig-label" font-size="11">0.08</text>
  <text x="250" y="294" class="fig-muted" font-size="11">Dissolve Duration</text><text x="440" y="294" class="fig-label" font-size="11">0.6</text>
  <text x="250" y="310" class="fig-muted" font-size="11">Auto Demo</text><text x="440" y="310" class="fig-label" font-size="11">☑  (flash ×2 rồi dissolve, lặp)</text>
  <text x="250" y="326" class="fig-muted" font-size="11">Destroy When Dissolved</text><text x="440" y="326" class="fig-label" font-size="11">☐</text>
  <text x="250" y="342" class="fig-muted" font-size="10">Play Mode: chuột phải header component ▸ Flash / Dissolve để kích tay</text>
</svg>
<figcaption>Ba Enemy dùng chung một material — không có instance. Driver chỉ gắn property block lên renderer đang flash/dissolve và gỡ (`SetPropertyBlock(null)`) khi xong.</figcaption>
</figure>

**Script**

```hlsl
// HitFlashDissolve.shader — Unity 6 (6000.x) + URP 17. Unlit, HLSL tay, tương thích SRP Batcher.
// Ba pass (Forward, ShadowCaster, DepthOnly) dùng chung MỘT CBUFFER qua HLSLINCLUDE — đây là điều kiện
// để SRP Batcher nhận; dùng UsePass lấy pass của shader khác sẽ làm CBUFFER lệch và mất tương thích.
Shader "Custom/HitFlashDissolve"
{
    Properties
    {
        _BaseMap("Base Map", 2D) = "white" {}
        _NoiseTex("Noise Tex", 2D) = "gray" {}
        _BaseColor("Base Color", Color) = (1, 1, 1, 1)
        _FlashAmount("Flash Amount", Range(0, 1)) = 0
        _Dissolve("Dissolve", Range(0, 1)) = 0
        _EdgeWidth("Edge Width", Range(0, 0.2)) = 0.05
        [HDR] _EdgeColor("Edge Color", Color) = (1, 0.83, 0.23, 1)
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "Queue" = "AlphaTest" "RenderPipeline" = "UniversalPipeline" }

        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        TEXTURE2D(_BaseMap);  SAMPLER(sampler_BaseMap);
        TEXTURE2D(_NoiseTex); SAMPLER(sampler_NoiseTex);

        // Mọi property của material nằm trong đúng một CBUFFER này → SRP Batcher gom được.
        CBUFFER_START(UnityPerMaterial)
            float4 _BaseMap_ST;
            float4 _NoiseTex_ST;
            half4  _BaseColor;
            half   _FlashAmount;
            half   _Dissolve;
            half   _EdgeWidth;
            half4  _EdgeColor;
        CBUFFER_END

        struct Attributes
        {
            float4 positionOS : POSITION;
            float3 normalOS   : NORMAL;
            float2 uv         : TEXCOORD0;
        };

        struct Varyings
        {
            float4 positionHCS : SV_POSITION;
            float2 uv          : TEXCOORD0;   // half đủ cho UV, nhưng interpolator luôn là float
            float2 uvNoise     : TEXCOORD1;
        };

        // Dissolve dùng chung cho cả 3 pass: bóng và depth cũng phải "thủng" theo mesh.
        half SampleNoiseAndClip(float2 uvNoise)
        {
            half noise = SAMPLE_TEXTURE2D(_NoiseTex, sampler_NoiseTex, uvNoise).r;
            clip(noise - _Dissolve);
            return noise;
        }
        ENDHLSL

        Pass
        {
            Name "Unlit"
            Tags { "LightMode" = "UniversalForward" }
            Cull Back
            ZWrite On

            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            Varyings vert(Attributes IN)
            {
                Varyings OUT;
                OUT.positionHCS = TransformObjectToHClip(IN.positionOS.xyz);
                OUT.uv      = TRANSFORM_TEX(IN.uv, _BaseMap);
                OUT.uvNoise = TRANSFORM_TEX(IN.uv, _NoiseTex);
                return OUT;
            }

            half4 frag(Varyings IN) : SV_Target
            {
                half noise = SampleNoiseAndClip(IN.uvNoise);
                half4 col = SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, IN.uv) * _BaseColor;

                // Dải cạnh dissolve: pixel còn sống nhưng noise nằm trong [_Dissolve, _Dissolve + _EdgeWidth].
                // step() thay if — không rẽ nhánh trong fragment. Nhân step(0.001, _Dissolve) để không có viền khi chưa dissolve.
                half edge = step(noise, _Dissolve + _EdgeWidth) * step(0.001h, _Dissolve);
                col.rgb += _EdgeColor.rgb * edge;              // emission HDR → Bloom bắt được nếu bật

                col.rgb = lerp(col.rgb, half3(1, 1, 1), _FlashAmount);   // hit flash: trộn trắng
                return col;
            }
            ENDHLSL
        }

        Pass
        {
            Name "ShadowCaster"
            Tags { "LightMode" = "ShadowCaster" }
            ZWrite On
            ZTest LEqual
            ColorMask 0

            HLSLPROGRAM
            #pragma vertex vertShadow
            #pragma fragment fragShadow
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Shadows.hlsl"

            float3 _LightDirection;   // URP set per-pass; không phải property material nên nằm ngoài CBUFFER

            Varyings vertShadow(Attributes IN)
            {
                Varyings OUT;
                float3 positionWS = TransformObjectToWorld(IN.positionOS.xyz);
                float3 normalWS   = TransformObjectToWorldNormal(IN.normalOS);
                OUT.positionHCS   = TransformWorldToHClip(ApplyShadowBias(positionWS, normalWS, _LightDirection));
            #if UNITY_REVERSED_Z
                OUT.positionHCS.z = min(OUT.positionHCS.z, UNITY_NEAR_CLIP_VALUE);
            #else
                OUT.positionHCS.z = max(OUT.positionHCS.z, UNITY_NEAR_CLIP_VALUE);
            #endif
                OUT.uv      = IN.uv;
                OUT.uvNoise = TRANSFORM_TEX(IN.uv, _NoiseTex);
                return OUT;
            }

            half4 fragShadow(Varyings IN) : SV_Target
            {
                SampleNoiseAndClip(IN.uvNoise);   // bóng cũng thủng theo dissolve
                return 0;
            }
            ENDHLSL
        }

        Pass
        {
            Name "DepthOnly"
            Tags { "LightMode" = "DepthOnly" }
            ZWrite On
            ColorMask R

            HLSLPROGRAM
            #pragma vertex vertDepth
            #pragma fragment fragDepth

            Varyings vertDepth(Attributes IN)
            {
                Varyings OUT;
                OUT.positionHCS = TransformObjectToHClip(IN.positionOS.xyz);
                OUT.uv      = IN.uv;
                OUT.uvNoise = TRANSFORM_TEX(IN.uv, _NoiseTex);
                return OUT;
            }

            half fragDepth(Varyings IN) : SV_Target
            {
                SampleNoiseAndClip(IN.uvNoise);
                return IN.positionHCS.z;
            }
            ENDHLSL
        }
    }
}
```

```csharp
// FlashDissolveDriver.cs — Unity 6 (6000.x) + URP 17. Gắn lên object có Renderer dùng material shader Custom/HitFlashDissolve.
// MaterialPropertyBlock làm renderer RỜI SRP Batcher trong lúc block còn gắn → chỉ dùng cho ít object, thời gian ngắn,
// và gỡ block (SetPropertyBlock(null)) ngay khi hiệu ứng xong. Hàng trăm object cần giá trị riêng lâu dài → vertex color / instancing.
using System.Collections;
using UnityEngine;

[RequireComponent(typeof(Renderer))]
public class FlashDissolveDriver : MonoBehaviour
{
    // PropertyToID một lần, theo REFERENCE trong shader (bắt đầu bằng _), không phải Display Name.
    static readonly int FlashId    = Shader.PropertyToID("_FlashAmount");
    static readonly int DissolveId = Shader.PropertyToID("_Dissolve");

    [SerializeField] float flashDuration = 0.08f;
    [SerializeField] float dissolveDuration = 0.6f;
    [SerializeField] bool autoDemo = true;               // flash ×2 rồi dissolve ra/vào, lặp — để thấy trong Frame Debugger
    [SerializeField] bool destroyWhenDissolved = false;

    Renderer rend;
    MaterialPropertyBlock mpb;
    Coroutine flashRoutine, dissolveRoutine;
    float flash, dissolve;                                // 0 = không hiệu ứng

    void Awake()
    {
        rend = GetComponent<Renderer>();
        mpb = new MaterialPropertyBlock();                // tạo MỘT lần, tái dùng — không new mỗi frame
    }

    void Start()
    {
        if (autoDemo) StartCoroutine(DemoLoop());
    }

    [ContextMenu("Flash")]
    public void Flash()
    {
        if (flashRoutine != null) StopCoroutine(flashRoutine);
        flashRoutine = StartCoroutine(FlashRoutine());
    }

    [ContextMenu("Dissolve")]
    public void Dissolve() => Dissolve(reverse: false);

    public void Dissolve(bool reverse)
    {
        if (dissolveRoutine != null) StopCoroutine(dissolveRoutine);
        dissolveRoutine = StartCoroutine(DissolveRoutine(reverse));
    }

    IEnumerator FlashRoutine()
    {
        float t = 0f;
        while (t < flashDuration)
        {
            t += Time.deltaTime;
            flash = 1f - t / flashDuration;               // 1 → 0: trắng rồi tắt dần
            Apply();
            yield return null;
        }
        flash = 0f;
        Apply();                                          // về 0 → có thể gỡ block
        flashRoutine = null;
    }

    IEnumerator DissolveRoutine(bool reverse)
    {
        float t = 0f;
        while (t < dissolveDuration)
        {
            t += Time.deltaTime;
            float k = Mathf.Clamp01(t / dissolveDuration);
            dissolve = reverse ? 1f - k : k;
            Apply();
            yield return null;
        }
        dissolve = reverse ? 0f : 1f;
        Apply();
        dissolveRoutine = null;
        if (!reverse && destroyWhenDissolved) Destroy(gameObject);
    }

    IEnumerator DemoLoop()
    {
        var pause = new WaitForSeconds(0.7f);
        while (true)
        {
            Flash(); yield return pause;
            Flash(); yield return pause;
            Dissolve(reverse: false); yield return new WaitForSeconds(dissolveDuration + 0.4f);
            Dissolve(reverse: true);  yield return new WaitForSeconds(dissolveDuration + 0.7f);
        }
    }

    void Apply()
    {
        // Cả hai về 0 → GỠ block: renderer quay lại SRP Batch ngay frame sau. Đây là dòng quan trọng nhất.
        if (flash <= 0f && dissolve <= 0f)
        {
            rend.SetPropertyBlock(null);
            return;
        }
        mpb.SetFloat(FlashId, flash);
        mpb.SetFloat(DissolveId, dissolve);
        rend.SetPropertyBlock(mpb);
    }

    void OnDisable()
    {
        flash = dissolve = 0f;
        if (rend != null) rend.SetPropertyBlock(null);    // object bị pool/tắt giữa hiệu ứng không được giữ block mãi
    }
}
```

**Chạy thử**
- Tạo material từ shader `Custom/HitFlashDissolve`, gán một noise texture (Wrap Repeat) vào Noise Tex; nếu material **hồng** là project chưa dùng URP hoặc Graphics Settings chưa gán URP Asset.
- Nhân 3 Enemy dùng chung M_Enemy, không chạm `.material`. `Window ▸ Analysis ▸ Frame Debugger` ▸ Enable: cả ba nằm trong **một** dòng `SRP Batch` (3 draws). Chọn shader trong Inspector: mục *SRP Batcher* phải ghi **compatible** — ghi *not compatible* là có property nằm ngoài CBUFFER.
- Bật Play: mỗi 0.7s một cú flash 0.08s (≈ 5 frame ở 60 FPS); đúng lúc đó Frame Debugger tách Enemy đang flash thành draw riêng với lý do "Node has a MaterialPropertyBlock", frame kế tiếp gộp lại — nếu **không gộp lại** thì `SetPropertyBlock(null)` chưa được gọi.
- Dissolve 0.6s: mesh thủng theo noise với viền vàng `#FFD43B`; **bóng dưới đất thủng theo** (ShadowCaster pass cũng clip). Bật Bloom trong Volume, viền loé — vì cộng emission HDR thay vì lerp.
- Đặt `Flash Duration` = 0.5 ngay trong Play: flash dài rõ mà không cần sửa shader — chứng minh giá trị đi qua MPB. Kiểm `Shader.PropertyToID("_FlashAmount")` bằng cách đổi thành `"Flash Amount"` (Display Name): không lỗi, không hiệu ứng.
