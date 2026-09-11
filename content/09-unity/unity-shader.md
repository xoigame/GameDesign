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
