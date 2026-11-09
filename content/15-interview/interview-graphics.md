---
id: interview-graphics
title: Đồ hoạ, shader và render pipeline
icon: 🎨
summary: Mười hai chủ đề đồ hoạ realtime cho vòng phỏng vấn studio game anime — pipeline GPU, URP, shader, ánh sáng, toon shading, trong suốt, post-process, Render Graph, 2D/Spine, texture, GPU profiling trên mobile TBDR, VFX — kèm một shader toon URP chạy được và bộ thẻ luyện nói.
status: deep
read: 1125
level: advanced
order: 23
tags: [interview, shader, rendering, urp, gpu]
related: [interview-unity-tech, unity-shader, unity-gpu-optimization, unity-lighting]
---

Tin tuyển của studio làm RPG anime live-service ghi "đồ hoạ, shader, render pipeline" là điểm cộng. Với một senior Unity, nghĩa là sau vòng kỹ thuật chung ([[interview-unity-tech]]) sẽ có một lượt hỏi **xuống tầng GPU**: không chỉ "SRP Batcher là gì" mà là "pixel này đi từ vertex đến framebuffer qua những bước nào và bước nào đắt trên Mali". Node này không lặp lại các câu rendering cơ bản (draw call, batching, overdraw, shader variant) đã có ở node đó; nó đào sâu hơn về pipeline, toon shading, trong suốt, post-process, URP mở rộng và đọc capture GPU. Mỗi chủ đề gồm đoạn kiến thức cô đọng và bảng "câu hỏi → ý bắt buộc phải chạm". Nền tảng nằm ở [[unity-shader]], [[unity-lighting]], [[unity-gpu-optimization]], [[unity-vfx]] và [[art-direction]].

Số liệu lấy từ hằng số chuẩn của phần cứng/API hoặc từ các node trong kho. Số **đo trên máy của bạn** thì phải là số của bạn.

## 1. Rendering pipeline GPU và các không gian toạ độ

Một đỉnh đi qua: **vertex shader** (biến đổi, ghi `positionCS`) → ghép primitive → **rasterization** (sinh fragment, nội suy thuộc tính) → **fragment shader** (tính màu) → **per-fragment ops** (depth test, stencil test, blend) → framebuffer. Chuỗi không gian: **object** (mesh gốc) → **world** (ma trận Model) → **view** (camera là gốc) → **clip** (ma trận Projection, toạ độ đồng nhất `xyzw`) → **NDC** (chia cho `w`) → **screen** (viewport). Vertex shader xuất ra clip space; phép chia `w` do phần cứng làm. Nội suy thuộc tính trong rasterizer là **perspective-correct**. Depth trong Unity ngày nay dùng **reversed-Z** trên hầu hết API (gần = 1, xa = 0) để tăng độ chính xác ở xa.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Liệt kê các không gian toạ độ từ mesh đến màn hình | Object → World → View → Clip → NDC → Screen; vertex shader ra clip space, chia `w` do phần cứng |
| Vì sao fragment shader đắt hơn vertex shader trên mobile | Số pixel nhiều hơn số đỉnh nhiều bậc, nhân với overdraw; tính được ở vertex thì đưa lên vertex |
| Early-Z là gì, cái gì phá nó | Depth test trước fragment shader để bỏ pixel bị che; `clip()`/`discard`, ghi depth trong fragment (`SV_Depth`) làm mất early-Z; alpha blend vẫn depth-test sớm được nhưng tắt ZWrite nên không che được gì phía sau — lợi ích giảm |
| Normal chuyển sang world space thế nào | Không nhân bằng ma trận Model thẳng nếu có non-uniform scale; dùng nghịch đảo chuyển vị (`TransformObjectToWorldNormal`) |
| Reversed-Z là gì | Gần = 1, xa = 0, tận dụng độ chính xác dồn về phía gần của float; ảnh hưởng cách viết so sánh depth và `UNITY_REVERSED_Z` |

## 2. Forward, Deferred và Forward+ trong URP

**Forward**: mỗi object tính ánh sáng trong fragment shader; chi phí theo số object × số light ảnh hưởng, và URP cũ giới hạn số additional light **mỗi object**. **Forward+** (URP 14 trở đi, có trong Unity 6) chia màn hình thành các tile/cluster rồi gán light theo tile, nên bỏ giới hạn light mỗi object và vẫn giữ MSAA, trong suốt đúng nghĩa. **Deferred** vẽ thuộc tính vật liệu vào **G-buffer** (nhiều render target) rồi tính sáng một lượt: nhiều light rẻ theo số pixel nhưng tốn băng thông ghi/đọc G-buffer, khó với MSAA và trong suốt; trên mobile TBDR chỉ hợp khi GPU giữ được G-buffer trong tile. Với RPG mobile nhắm máy tầm trung, **Forward** (hoặc Forward+) là lựa chọn mặc định, vì ít light và nhân vật toon không cần nhiều light động.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Forward, Deferred, Forward+ khác nhau ở đâu | Nơi tính sáng và cách gán light; Deferred dùng G-buffer; Forward+ gán light theo tile/cluster, hết giới hạn per-object |
| Vì sao Deferred ít hợp mobile tầm trung | Băng thông G-buffer, không MSAA chuẩn, trong suốt vẫn đi đường forward; chỉ đáng khi cảnh nhiều light động |
| Khi nào chọn Forward+ | Cảnh nhiều light động trên cùng vùng mà không muốn mất MSAA/trong suốt; kiểm chi phí trên máy thật |
| Nhân vật anime có cần nhiều real-time light không | Thường một main light + ambient/probe; tránh additional light vì mỗi light là thêm chi phí cho cả pixel shader toon |

## 3. Shader: HLSL, ShaderLab, Shader Graph, keyword, precision

Shader URP gồm **ShaderLab** (khung: `Properties`, `SubShader`, `Tags`, `Pass`, trạng thái `Blend`/`ZWrite`/`Cull`) bọc **HLSL** (`HLSLPROGRAM`). Mỗi pass khai `LightMode` (`UniversalForward`, `ShadowCaster`, `DepthOnly`, `DepthNormals`, `UniversalGBuffer`…). Để SRP Batcher hoạt động, mọi property của material phải nằm trong **một** `CBUFFER_START(UnityPerMaterial)` giống hệt nhau ở mọi pass. Shader Graph sinh ra đúng loại HLSL đó, hợp cho artist, còn code HLSL cho kiểm soát chi tiết (multi-pass, stencil, tối ưu tay). `shader_feature` chỉ build biến thể material dùng, `multi_compile` build mọi tổ hợp; chi tiết ở [[interview-unity-tech]]. Trên mobile, `half` (16-bit) rẻ hơn `float` (32-bit) trên nhiều GPU, nhưng `half` thiếu độ chính xác cho vị trí world, UV lớn hay thời gian tích luỹ.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| ShaderLab với HLSL khác nhau thế nào | ShaderLab là khung khai báo (property, pass, render state); HLSL là code chạy trên GPU |
| Vì sao shader không SRP Batcher compatible | Property nằm ngoài `CBUFFER UnityPerMaterial` hoặc cbuffer khác nhau giữa các pass; kiểm trong Inspector của shader |
| `half` và `float` dùng chỗ nào | `half` cho màu, normal, hệ số 0–1; `float` cho vị trí world, UV tiling lớn, thời gian; sai precision gây vỡ hình chỉ trên một số GPU |
| Khi nào viết HLSL thay vì Shader Graph | Multi-pass (outline), stencil, tối ưu tay, tái dùng include; Graph hợp prototyping và artist, nhưng vẫn phải kiểm số instruction |
| Giảm variant thế nào | Bỏ keyword thừa, `shader_feature`, IPreprocessShaders, URP stripping settings, ShaderVariantCollection để warmup |

## 4. Ánh sáng và đổ bóng

**Lambert**: `max(0, N·L)`. **Blinn-Phong** cộng specular theo `N·H`. **PBR cơ bản** (metallic-roughness) bảo toàn năng lượng: albedo, metallic, smoothness, normal map, occlusion; thuật ngữ cần thuộc là BRDF, Fresnel, diffuse/specular. **Shadow map**: vẽ depth cảnh từ góc nhìn light vào texture, rồi khi tô pixel so depth; lỗi đặc trưng là **shadow acne** (so sánh tự chạm) và **peter-panning** (bias quá tay). **Cascade** chia frustum camera thành các lát, gần thì độ phân giải bóng cao; mobile thường 1–2 cascade vì mỗi cascade là thêm một lượt vẽ cảnh. **Baked lightmap** tính trước và rẻ nhất lúc chạy; **light probe** nội suy ánh sáng gián tiếp cho object động; **reflection probe** cho phản chiếu. Xem [[unity-lighting]].

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Lambert với Blinn-Phong | Diffuse theo `N·L`; Blinn-Phong thêm specular theo `N·H`; cả hai không bảo toàn năng lượng như PBR |
| Shadow acne và peter-panning là gì | Acne: depth so sánh chính nó; sửa bằng bias; bias quá lớn thì bóng tách khỏi vật (peter-panning); URP có depth bias và normal bias |
| Cascade shadow đánh đổi gì | Chất lượng bóng gần với chi phí mỗi cascade là một lượt render; mobile giảm số cascade và khoảng cách bóng |
| Baked, mixed và realtime | Baked rẻ nhất nhưng tĩnh; mixed giữ bóng realtime + gián tiếp baked; realtime đắt nhất; object động cần probe |
| Light probe khác lightmap thế nào | Lightmap cho object tĩnh theo UV2; probe là mẫu SH trong không gian cho object động |
| Vì sao nhân vật không "hoà" với bối cảnh baked | Thiếu light probe/ambient khớp bối cảnh; sửa bằng probe, hoặc màu ambient cho shader toon |

## 5. Toon / anime shading

Toon không phải "tắt PBR". Phần lõi là biến độ sáng liên tục thành **bậc**: tính `N·L`, qua `smoothstep` hoặc **ramp texture** để ra vùng sáng/tối, trộn màu base với màu bóng (thường tông tím/lạnh chứ không phải đen). Thêm **rim light** (`1 - N·V`, mũ hoá) để tách nhân vật khỏi nền; **specular** dạng khối cứng; **matcap** cho kim loại/tóc. **Outline** có hai họ: **inverted hull** (vẽ lại mesh phình ra theo normal, cull front, tô một màu — rẻ, chạy mọi nền tảng, cho phép đổi độ dày theo đỉnh, nhưng cần normal mượt/baked vào tangent và tốn thêm một lượt vẽ mesh) và **post-process** (phát hiện cạnh từ depth/normal/ID buffer — độ dày đồng đều theo pixel, nhưng thêm pass toàn màn hình và băng thông). **Face shadow SDF**: mặt anime phải có bóng sạch và không rối, nên dùng texture SDF vẽ tay lưu ngưỡng hướng sáng theo góc quay mặt thay vì `N·L` của mesh. Xem thêm [[art-direction]] về nhất quán phong cách.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Làm toon shading cơ bản thế nào | `N·L` qua smoothstep/ramp, màu bóng riêng, rim, specular khối; điều khiển bằng property cho artist |
| Ramp texture với smoothstep trong code | Ramp cho artist tự vẽ dải màu; smoothstep rẻ và không cần sample texture; chọn theo ai cần chỉnh |
| Inverted hull và post-process outline | Hull: pass thêm theo mesh, độ dày theo đỉnh, lỗi ở cạnh cứng nếu normal không mượt; post: độ dày đều theo màn hình nhưng thêm pass full-screen |
| Vì sao outline inverted hull bị đứt ở góc cứng | Normal bị tách theo face nên phình lệch; dùng smooth normal bake vào tangent/vertex color |
| Face shadow SDF là gì | Texture SDF mặt lưu ngưỡng sáng theo góc; so với góc light trên mặt phẳng ngang để ra bóng mặt sạch |
| Làm sao toon lên máy yếu | Ít sample texture, `half`, tính ở vertex phần có thể, ít keyword, bỏ pass không cần, kiểm với Frame Debugger |

## 6. Trong suốt: sort, blend, test, overdraw

Vật mờ (opaque) vẽ trước, **trước-ra-sau** để early-Z bỏ pixel bị che; vật trong suốt vẽ sau, **sau-ra-trước** theo khoảng cách, tắt `ZWrite` vì ghi depth sẽ che mất cái đứng sau. Thứ tự do `Queue` (Geometry 2000, AlphaTest 2450, Transparent 3000), rồi `sortingOrder`/Sorting Layer cho renderer 2D, rồi khoảng cách camera. **Alpha blend** cần sort và gây overdraw; **alpha test** (`clip`) không cần sort nhưng viền răng cưa và phá early-Z trên nhiều GPU mobile; **alpha to coverage** cần MSAA. **Premultiplied alpha** lưu `rgb * a` trong texture, blend `One OneMinusSrcAlpha`: tránh viền sáng/đen quanh sprite bị filter và cho phép vừa cộng vừa mờ trong một blend. Spine và nhiều sprite pipeline dùng premultiplied.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Vì sao trong suốt phải sort và tắt ZWrite | Blend phụ thuộc thứ tự; ghi depth làm pixel phía sau bị loại sai; sort sau-ra-trước |
| Alpha test với alpha blend | Test: không cần sort nhưng răng cưa và có thể mất early-Z; Blend: mượt nhưng sort + overdraw |
| Premultiplied alpha giải quyết gì | Viền halo khi filter, blend `One OneMinusSrcAlpha`, cho phép additive và alpha trong cùng một shader |
| Tóc nhân vật nửa trong suốt sort lỗi, xử lý sao | Tách pass depth-only trước rồi pass màu, hoặc alpha test + cắt cứng, hoặc sort mesh theo thứ tự cố định; kèm đánh đổi |
| `Queue` ảnh hưởng gì | Quyết định nhóm vẽ và thứ tự; ép offset cho từng lớp (nhân vật, hiệu ứng) để không phụ thuộc khoảng cách |
| Giảm overdraw của hiệu ứng | Cắt quad theo hình hạt (mesh thay vì hình chữ nhật), giảm kích thước và lớp, đổi half-res cho khói |

## 7. Post-processing

**Bloom** trích vùng sáng vượt ngưỡng, làm mờ qua chuỗi downsample/upsample rồi cộng lại; chi phí là chuỗi pass với băng thông. **Color grading** qua **LUT** (look-up table 3D) biến đổi màu rẻ vì thành một lần tra bảng. **Tonemapping** ép HDR về LDR. **Vignette, film grain** gần như miễn phí. Trên mobile tầm trung, mỗi pass full-screen là đọc và ghi lại toàn bộ framebuffer; cho nên giữ ít pass, bloom giảm số lần downsample hoặc bật chất lượng thấp, tắt HDR nếu không cần. **Render Scale** hạ độ phân giải 3D (0,75 = 56% số pixel) rồi upscale, UI vẫn vẽ độ phân giải gốc. Với Unity 6 URP, post-process nằm trong **Volume** với profile.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Bloom hoạt động thế nào, vì sao đắt trên mobile | Ngưỡng sáng, downsample/blur/upsample nhiều lượt, băng thông; giảm iteration, chất lượng thấp |
| LUT color grading là gì | Bảng 3D ánh xạ màu vào-ra, một lần tra cho cả ảnh; artist grade bằng ảnh rồi export |
| Post-process nào rẻ nhất, đắt nhất | Vignette/grain/LUT rẻ; bloom, DoF, SSAO, motion blur đắt vì nhiều pass và đọc depth |
| Render Scale thay đổi gì | Giảm pixel 3D (0,75 → 56% pixel); UI vẫn nét; đánh đổi độ sắc nét; kết hợp upscale (FSR/STP nếu bật) |
| HDR trên mobile | Cần buffer định dạng lớn hơn, tăng băng thông; chỉ bật khi bloom/tonemap thật sự cần |
| Vì sao post-process hay làm tụt fps trên máy thật mà Editor không thấy | Mobile bị giới hạn băng thông, và pass full-screen phá tile memory; Editor chạy GPU desktop che chuyện đó |

## 8. URP mở rộng: Renderer Feature, Render Graph, custom pass

**Renderer Feature** là điểm cắm vào Renderer của URP: viết một `ScriptableRendererFeature` thêm một hay nhiều `ScriptableRenderPass` vào đúng sự kiện (`BeforeRenderingOpaques`, `AfterRenderingTransparents`…). Dùng cho outline post, vẽ nhân vật vào mask riêng, blur nền popup, vẽ object với override material (`RenderObjects` có sẵn). **Render Graph** là hệ thống của Unity 6: pass khai báo **tài nguyên đọc/ghi** (texture handle), graph tự xếp thứ tự, gộp pass, **cấp phát/giải phóng texture tạm** và loại pass thừa; mục đích là bộ nhớ và băng thông tốt hơn, và API mới cho pass viết bằng `RecordRenderGraph`. Pass kiểu cũ (`Execute`) chạy ở **Compatibility Mode** và sẽ bị loại dần. Trên mobile TBDR, graph có thể gộp các pass thành **native render pass** để giữ dữ liệu trong tile memory.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Renderer Feature dùng khi nào | Chèn pass tuỳ biến ở đúng event; outline post, mask, blur; hoặc `RenderObjects` có sẵn để override material/depth |
| Render Graph khác pipeline cũ thế nào | Pass khai báo đọc/ghi tài nguyên, graph tự quản lifetime, gộp và cull pass; `RecordRenderGraph` thay `Execute` |
| Vì sao Render Graph giúp mobile | Cấp phát RT tạm tái dùng, bỏ pass thừa, cho phép merge pass (native render pass) để giữ dữ liệu trong tile |
| Migrate Renderer Feature cũ sang Unity 6 | Viết lại theo API Render Graph (`RecordRenderGraph`, `UnsafePass`/`RasterPass`), dùng Compatibility Mode tạm thời |
| Camera Stacking với Renderer Feature | Hiểu overlay camera chạy pass riêng; mỗi camera thêm chi phí; cân nhắc thay bằng Render Objects |
| Debug một Renderer Feature sai | Frame Debugger để xem pass có chạy đúng event, RT đúng chưa; Rendering Debugger; RenderDoc cho nội dung buffer |

## 9. 2D: sprite atlas, sprite mesh, sorting, UI shader, Spine

**Sprite Atlas** gộp sprite vào chung texture để cùng material thì batch được; vỡ batch khi xen kẽ material/texture khác ở giữa theo thứ tự sort. **Sprite mesh** (Tight vs Full Rect): mesh ôm sát hình giảm overdraw vùng trong suốt nhưng thêm đỉnh. **Sorting Layer** + `order in layer` quyết định thứ tự vẽ 2D (trong suốt không theo ZWrite). **UI shader** (uGUI): đi qua `Canvas` với `Mask`/`RectMask2D`/stencil; shader UI riêng phải giữ các property stencil nếu dùng `Mask`. **Spine**: mesh động mỗi frame, dùng material riêng cho blend mode (thường premultiplied alpha, có material additive/multiply), và thêm **shader tuỳ biến** (hiệu ứng flash hit, dissolve, outline) bằng cách thay shader của material; vỡ batch khi khác atlas hoặc khác blend. Chi tiết tối ưu Spine ở [[interview-unity-tech]].

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Vì sao batch vỡ với 2D | Sort theo thứ tự xen kẽ material/texture khác nhau; gộp atlas và nhóm Sorting Layer để các sprite cùng atlas liền nhau |
| Sprite Tight với Full Rect | Tight giảm overdraw vùng trong suốt nhưng thêm đỉnh; Full Rect dùng cho sprite lấp đầy hình chữ nhật |
| Thêm shader hiệu ứng cho nhân vật Spine thế nào | Gán material dùng shader tuỳ biến; giữ premultiplied alpha và blend mode đúng; chung material để vẫn batch |
| Vì sao shader UI tự viết làm Mask hỏng | Thiếu khối property và trạng thái `Stencil` (`_Stencil`, `_StencilComp`…), nên Mask không cắt đúng |
| Spine nhiều nhân vật cùng màn | Chung atlas và material, ít bone, tắt update ngoài tầm, một skeleton data dùng chung; kiểm bằng Frame Debugger |
| Pixel nhìn vỡ/nhoè khi scale sprite | Filter mode, pixels per unit, camera pixel-perfect; tránh scale không nguyên |

## 10. Texture: nén, mipmap, filtering, sRGB và linear

GPU đọc **trực tiếp texture nén theo khối** (ASTC, ETC2 trên mobile; BC trên desktop), nên nén giảm cả bộ nhớ lẫn băng thông. ASTC 4x4 = 8 bpp, 6x6 ≈ 3,56 bpp, 8x8 = 2 bpp (các số này nằm trong [[interview-unity-tech]]). **Mipmap** thêm khoảng 33% bộ nhớ, giảm aliasing và tăng cache hit khi vật ở xa. **Filtering**: point (không nội suy), bilinear, trilinear (nội suy giữa hai mip), anisotropic (cải thiện bề mặt nhìn nghiêng, tốn thêm sample). **sRGB vs linear**: texture màu (albedo) lưu sRGB và phải bật `sRGB (Color Texture)` để GPU chuyển về linear khi sample; texture **dữ liệu** (normal, mask, ramp, SDF) phải tắt sRGB. Dự án nên dùng **Linear colour space**; Gamma chỉ còn cho máy rất cũ.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Vì sao GPU cần texture nén chuyên dụng | Giải nén theo khối bằng phần cứng, giữ nén trong bộ nhớ; PNG/JPG chỉ nén trên ổ đĩa |
| Mipmap để làm gì | Chống aliasing ở xa, cache hit tốt hơn; tốn khoảng 33% bộ nhớ; UI 1:1 tắt |
| sRGB với linear texture | Albedo là sRGB để lệch sáng đúng; normal/mask/ramp/SDF tắt sRGB nếu không dữ liệu bị méo |
| Linear với Gamma colour space | Linear cho phép tính ánh sáng đúng vật lý, cần texture sRGB đánh dấu đúng; Gamma rẻ hơn nhưng sai cộng sáng |
| Ramp texture bị sai màu, kiểm gì | Tắt sRGB, filter Clamp, không mipmap, định dạng không nén quá tay làm vỡ bậc |
| Anisotropic filtering đắt khi nào | Nhiều sample cho bề mặt nghiêng; mặt đường/sàn bật, UI/nhân vật thường không cần |

## 11. GPU profiling và GPU mobile TBDR

Công cụ: **Frame Debugger** (Unity: xem từng draw/pass, event, render target), **RenderDoc** (capture frame trên PC/Android, xem buffer, shader, từng draw), **Xcode GPU Frame Capture** và **Metal System Trace** (iOS), **Android GPU Inspector** (Android), và profiler hãng (Arm Streamline/Performance Studio cho Mali, Snapdragon Profiler cho Adreno). Phân loại nghẽn: **fill-rate/fragment-bound** (hạ Render Scale thấy frame time giảm), **vertex-bound** (hạ độ phức tạp mesh/LOD mới giảm), **bandwidth-bound** (texture lớn, nhiều pass full-screen, RT độ phân giải cao), **CPU-bound** (GPU đợi lệnh). GPU mobile phổ biến là **TBDR** (tile-based deferred rendering): chia màn hình thành các tile nhỏ, vẽ cả tile trong bộ nhớ on-chip rồi mới ghi ra bộ nhớ chính một lần, nên bộ nhớ đệm tile rẻ còn **load/store** của attachment (đọc lại màu/depth đầu pass, ghi ra cuối pass) là chi phí đáng kể. Vì vậy cần: không `Load` thừa (clear thay vì load), không `Store` depth/MSAA khi không cần, tránh đọc lại framebuffer giữa pass (full-screen pass phá tile), và dùng native render pass.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Fill-rate-bound với vertex-bound khác nhau thế nào, thử gì | Hạ Render Scale giảm frame time ⇒ fragment/fill; giảm mesh/LOD giảm ⇒ vertex; còn lại là bandwidth hoặc CPU |
| TBDR là gì, vì sao quan trọng | Vẽ theo tile trong on-chip memory rồi ghi một lần; rẻ cho overdraw opaque nhờ HSR nhưng đắt khi load/store hoặc phá tile |
| Load/store chi phí ở đâu | Đầu pass đọc attachment từ bộ nhớ chính, cuối pass ghi ra; clear thay load, bỏ store cho depth/MSAA khi không cần |
| Vì sao pass đọc lại màn hình đắt | Phải lưu tile ra bộ nhớ rồi nạp lại; mỗi full-screen pass tách render pass |
| Anh mở RenderDoc để tìm gì | Draw nào tốn, render target nào và format gì, texture nào lớn bất thường, số lần sample; so với Frame Debugger |
| Dùng công cụ nào cho Mali, Adreno, Apple | Arm Performance Studio (Mali), Snapdragon Profiler (Adreno), AGI cho Android nói chung, Xcode GPU capture (Apple) |
| Thermal throttling ảnh hưởng đo thế nào | Máy nóng giảm xung nhịp nên số đo trôi; đo cả máy nguội và máy nóng, nhìn p95 chứ không trung bình |

## 12. VFX và particle

Particle System (Shuriken) mô phỏng trên **CPU**, vẽ bằng billboard quad; chi phí chính là **overdraw** của quad alpha lớn chồng nhau, rồi tới CPU cập nhật hạt và số lượng system. **VFX Graph** mô phỏng trên **GPU** (compute shader), hợp số hạt lớn (hàng chục nghìn trở lên) nhưng cần GPU hỗ trợ compute — chưa chắc có trên máy mobile yếu, và có chi phí cố định khi khởi tạo. Mobile RPG thường dùng Particle System cho số hạt nhỏ, ưu tiên ít hạt lớn hơn nhiều hạt nhỏ, texture sheet chung atlas, dùng **mesh particle** hoặc cắt quad theo hình hạt, tắt va chạm/trails/lights khi không cần. Vẽ skill effect nhiều lớp trên nhân vật dễ biến thành bão overdraw. Xem [[unity-vfx]].

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Particle System với VFX Graph | CPU, mọi nền tảng, ít hạt; VFX Graph GPU compute, nhiều hạt, đòi hỏi compute shader; mobile tầm trung thường chọn Particle System |
| Chi phí particle nằm đâu | Overdraw quad alpha, rồi CPU update; nhiều system nhỏ tốn hơn một system lớn do overhead |
| Giảm chi phí hiệu ứng skill | Ít lớp, quad ôm hình hạt, texture sheet chung atlas, half-res cho khói, giới hạn số hạt tối đa, tắt khi ngoài màn |
| Pool hiệu ứng thế nào | Prewarm và tái dùng thay `Instantiate`, tắt thay vì huỷ; tránh hitch ngay lúc skill đầu tiên |
| Khi nào dùng additive thay alpha blend | Additive không cần sort và rẻ hơn khi sắp chồng, hợp lửa/sáng; không hợp khói tối |
| Vì sao hiệu ứng đầu tiên lần nào cũng khựng | Compile shader lần đầu hoặc nạp texture/asset lần đầu; warmup và prewarm ở loading |

## Cách dùng node này trước ngày phỏng vấn

Hai ngày trước: vẽ tay sơ đồ pipeline GPU và chuỗi không gian toạ độ, tự nói to một lần không nhìn giấy. Một ngày trước: chọn **một nhân vật hoặc một hiệu ứng trong dự án của bạn** và kể nó đi qua pipeline thế nào, tốn ở đâu, bạn đo bằng gì. Nếu ban phỏng vấn mở màn hình và hỏi "vẽ cho tôi một shader toon", mục dưới giúp bạn có sẵn khung; nhưng đừng học thuộc, hãy đọc hiểu từng pass.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho luyện đồ hoạ, shader và render pipeline**

AI hợp nhất ở hai vai: **người phỏng vấn đào cơ chế** (hỏi từng câu, bắt bạn giải thích pixel đi qua pipeline thế nào) và **người đọc lại shader** của bạn, chỉ ra chỗ sai precision, sai không gian toạ độ, thiếu CBUFFER. AI **không đáng tin** ở hai việc: viết shader URP chạy được ngay (nó hay trộn Built-in với URP) và đưa **con số hiệu năng** (ms, MB, "nhanh gấp N lần"). Quy trình: (1) tự nói bằng miệng, (2) nhờ AI chấm theo ý bắt buộc ở bảng chủ đề, (3) mọi shader AI viết phải **biên dịch trong Unity 6 thật** và mọi con số phải đối chiếu node `unity-*` hay tự đo.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| **Hỏi đáp một-một** | Ôn từng chủ đề | "Đóng vai interviewer đồ hoạ cho studio game anime, hỏi về toon shading và pipeline URP, từng câu một." |
| **Soi code shader** | Có shader trong dự án | "Dưới đây là shader URP của tôi. Chỉ ra lỗi không gian toạ độ, precision và SRP Batcher, KHÔNG viết lại cả file." |
| **Bẫy cơ chế** | Kiểm chỗ hổng | "Tôi sẽ giải thích inverted hull outline. Hãy chỉ ra chỗ tôi nói sai hoặc thiếu." |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Phiên bản Unity và pipeline**: Unity 6 (6000.x) URP; Forward, Forward+ hay Deferred; còn dùng Compatibility Mode hay đã sang Render Graph.
- **Nền tảng và GPU mục tiêu**: Android tầm trung (Mali hay Adreno), iPhone; Vulkan hay GLES3 hay Metal.
- **Loại nội dung**: nhân vật toon anime 3D hay 2D/Spine; có bóng đổ realtime không; có post-process (bloom, LUT) không.
- **Ràng buộc shader**: phải SRP Batcher compatible, số sample texture tối đa, dùng `half` ở đâu.
- **Chế độ trả lời**: ngắn 60–90 giây, chấm gắt, không tự đưa số mà bạn chưa cung cấp.

**Mẫu prompt**

```
Đóng vai người phỏng vấn kỹ thuật đồ hoạ mức SENIOR cho studio game Nhật làm RPG anime
live-service trên mobile. Stack của tôi: Unity 6 (6000.x) URP Forward+, Render Graph,
Spine, bloom + LUT, Android tầm trung (Mali/Adreno, RAM 4GB) và iPhone, Vulkan/Metal.

Luật:
- Hỏi TỪNG CÂU MỘT về chủ đề: <toon shading / outline / TBDR load-store / trong suốt / Render Graph>.
  Hỏi xong thì DỪNG, chờ tôi trả lời.
- Sau mỗi câu trả lời: chỉ ra ý tôi THIẾU (cơ chế, cách đo trên Frame Debugger/RenderDoc,
  đánh đổi), rồi hỏi một câu đào sâu. Chấm GẮT, KHÔNG khen xã giao.
- CẤM tự đưa con số (ms, MB, %, "nhanh gấp N lần") mà tôi chưa đưa. Cần số thì nói "cần đo".
- Mọi đoạn shader phải theo cú pháp URP (HLSLPROGRAM, Core.hlsl/Lighting.hlsl,
  CBUFFER UnityPerMaterial, TransformObjectToHClip). CẤM CGPROGRAM, UnityCG.cginc,
  UNITY_MATRIX_MVP, #pragma surface và mọi cú pháp Built-in.
- KHÔNG liệt kê trước danh sách câu hỏi hay đáp án.
```

**Bẫy thường gặp:** AI **trộn cú pháp Built-in với URP**: viết `CGPROGRAM`, `#include "UnityCG.cginc"`, `UnityObjectToClipPos`, `_LightColor0`, surface shader; những dòng đó biên dịch ra shader hồng hoặc lỗi trong URP. Bẫy thứ hai: nó viết CBUFFER sai hoặc để property ngoài `UnityPerMaterial` nên mất SRP Batcher mà không báo; kiểm trong Inspector. Bẫy thứ ba: nó bịa số ("outline post rẻ hơn hull 3 lần", "Render Graph giảm 30% bộ nhớ"); đừng mang số nào vào phòng phỏng vấn nếu chưa tự đo. Bẫy thứ tư: nó coi mọi GPU như desktop và bỏ qua TBDR, load/store, `half` precision; hãy nói rõ GPU mobile ngay đầu prompt.

## 💻 Code

Shader URP hoàn chỉnh, nhỏ, dùng cho nhân vật anime: ramp mềm theo `N·L`, màu bóng riêng, rim light, và pass outline inverted hull. Viết cho Unity 6 (6000.x) URP, Forward/Forward+.

**Setup**
- Tạo file `ToonRimOutline.shader` trong `Assets/Shaders/`, tạo Material dùng shader `Demo/ToonRimOutline`, gán lên mesh nhân vật.
- Outline inverted hull cần normal mượt. Mesh có hard edge thì outline đứt ở góc; bake normal mượt vào tangent hoặc vertex color rồi đổi shader để đọc từ đó.

**Script**

```hlsl
// ToonRimOutline.shader — Unity 6 URP (Forward / Forward+)
Shader "Demo/ToonRimOutline"
{
    Properties
    {
        [MainTexture] _BaseMap ("Base Map", 2D) = "white" {}
        [MainColor]   _BaseColor ("Base Color", Color) = (1, 1, 1, 1)
        _ShadowColor ("Shadow Color", Color) = (0.55, 0.5, 0.7, 1)
        _RampThreshold ("Ramp Threshold", Range(0, 1)) = 0.5
        _RampSmooth ("Ramp Smoothness", Range(0.001, 0.5)) = 0.05
        _RimColor ("Rim Color", Color) = (1, 1, 1, 1)
        _RimPower ("Rim Power", Range(0.5, 8)) = 3
        _RimStrength ("Rim Strength", Range(0, 1)) = 0.5
        _OutlineColor ("Outline Color", Color) = (0.1, 0.07, 0.1, 1)
        _OutlineWidth ("Outline Width (world units)", Range(0, 0.05)) = 0.01
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "RenderPipeline" = "UniversalPipeline" "Queue" = "Geometry" }

        // Dùng chung cho mọi pass: CBUFFER GIỐNG HỆT nhau thì SRP Batcher mới hoạt động.
        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        TEXTURE2D(_BaseMap);
        SAMPLER(sampler_BaseMap);

        CBUFFER_START(UnityPerMaterial)
            float4 _BaseMap_ST;
            half4  _BaseColor;
            half4  _ShadowColor;
            half   _RampThreshold;
            half   _RampSmooth;
            half4  _RimColor;
            half   _RimPower;
            half   _RimStrength;
            half4  _OutlineColor;
            float  _OutlineWidth;
        CBUFFER_END
        ENDHLSL

        // ---------- Pass 1: tô màu toon ----------
        Pass
        {
            Name "ToonForward"
            Tags { "LightMode" = "UniversalForward" }

            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN
            #pragma multi_compile_fragment _ _SHADOWS_SOFT

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS   : NORMAL;
                float2 uv         : TEXCOORD0;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float2 uv         : TEXCOORD0;
                float3 normalWS   : TEXCOORD1;
                float3 positionWS : TEXCOORD2;
            };

            Varyings vert(Attributes IN)
            {
                Varyings OUT;
                OUT.positionWS = TransformObjectToWorld(IN.positionOS.xyz);
                OUT.positionCS = TransformWorldToHClip(OUT.positionWS);
                OUT.normalWS   = TransformObjectToWorldNormal(IN.normalOS);
                OUT.uv         = TRANSFORM_TEX(IN.uv, _BaseMap);
                return OUT;
            }

            half4 frag(Varyings IN) : SV_Target
            {
                half3 normalWS = normalize(IN.normalWS);
                half3 viewDirWS = GetWorldSpaceNormalizeViewDir(IN.positionWS);

                // Main light + bóng đổ (shadowCoord tính theo world position)
                float4 shadowCoord = TransformWorldToShadowCoord(IN.positionWS);
                Light mainLight = GetMainLight(shadowCoord);

                // Lambert -> bậc: smoothstep quanh ngưỡng, nhân bóng đổ
                half ndl = dot(normalWS, mainLight.direction);
                half lit = smoothstep(_RampThreshold - _RampSmooth,
                                      _RampThreshold + _RampSmooth,
                                      ndl * 0.5h + 0.5h);
                lit *= mainLight.shadowAttenuation * mainLight.distanceAttenuation;

                half3 albedo = SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, IN.uv).rgb * _BaseColor.rgb;

                // Vùng tối pha màu bóng (tông lạnh), vùng sáng giữ albedo
                half3 diffuse = lerp(albedo * _ShadowColor.rgb, albedo, lit) * mainLight.color;

                // Ambient từ light probe / spherical harmonics, giữ nhẹ để không làm bẹt bóng
                half3 ambient = SampleSH(normalWS) * albedo * 0.5h;

                // Rim light: mạnh ở rìa, chỉ hiện phía có sáng để không sáng đều quanh người
                half rim = pow(1.0h - saturate(dot(normalWS, viewDirWS)), _RimPower);
                half3 rimCol = rim * _RimStrength * _RimColor.rgb * saturate(ndl + 0.3h);

                return half4(diffuse + ambient + rimCol, 1.0h);
            }
            ENDHLSL
        }

        // ---------- Pass 2: outline inverted hull ----------
        // Cull Front: chỉ vẽ mặt sau của bản mesh phình ra theo normal.
        // LightMode SRPDefaultUnlit: URP vẽ pass này cùng pass forward.
        Pass
        {
            Name "Outline"
            Tags { "LightMode" = "SRPDefaultUnlit" }
            Cull Front
            ZWrite On

            HLSLPROGRAM
            #pragma vertex vertOutline
            #pragma fragment fragOutline

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS   : NORMAL;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
            };

            Varyings vertOutline(Attributes IN)
            {
                Varyings OUT;
                float3 positionWS = TransformObjectToWorld(IN.positionOS.xyz);
                float3 normalWS   = TransformObjectToWorldNormal(IN.normalOS);
                // Phình theo normal trong world space: độ dày theo đơn vị thế giới
                positionWS += normalWS * _OutlineWidth;
                OUT.positionCS = TransformWorldToHClip(positionWS);
                return OUT;
            }

            half4 fragOutline(Varyings IN) : SV_Target
            {
                return _OutlineColor;
            }
            ENDHLSL
        }

        // ---------- Pass 3: đổ bóng của chính nhân vật ----------
        Pass
        {
            Name "ShadowCaster"
            Tags { "LightMode" = "ShadowCaster" }
            ZWrite On
            ZTest LEqual
            ColorMask 0
            Cull Back

            HLSLPROGRAM
            #pragma vertex vertShadow
            #pragma fragment fragShadow
            #pragma multi_compile_vertex _ _CASTING_PUNCTUAL_LIGHT_SHADOW

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            float3 _LightDirection;
            float3 _LightPosition;

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS   : NORMAL;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
            };

            Varyings vertShadow(Attributes IN)
            {
                Varyings OUT;
                float3 positionWS = TransformObjectToWorld(IN.positionOS.xyz);
                float3 normalWS   = TransformObjectToWorldNormal(IN.normalOS);

            #if _CASTING_PUNCTUAL_LIGHT_SHADOW
                float3 lightDirectionWS = normalize(_LightPosition - positionWS);
            #else
                float3 lightDirectionWS = _LightDirection;
            #endif

                float4 positionCS = TransformWorldToHClip(ApplyShadowBias(positionWS, normalWS, lightDirectionWS));
            #if UNITY_REVERSED_Z
                positionCS.z = min(positionCS.z, UNITY_NEAR_CLIP_VALUE);
            #else
                positionCS.z = max(positionCS.z, UNITY_NEAR_CLIP_VALUE);
            #endif
                OUT.positionCS = positionCS;
                return OUT;
            }

            half4 fragShadow(Varyings IN) : SV_Target
            {
                return 0;
            }
            ENDHLSL
        }
    }
}
```

**Chạy thử**
- Mở Frame Debugger: nhân vật hiện thành hai draw, vì mỗi pass của shader là một lượt vẽ mesh. URP vẽ tag `SRPDefaultUnlit` trước `UniversalForward`, nên thấy `Outline` trước rồi tới `ToonForward` — mặt sau phình ra bị phần thân vẽ đè lên, chỉ còn viền lộ ở rìa. Trong Inspector của shader, mục "SRP Batcher" phải hiện "compatible".
- Shader này **chưa có pass `DepthOnly`/`DepthNormals`**: nếu bật SSAO hoặc tính năng cần depth prepass, nhân vật sẽ thiếu trong depth texture. Dự án thật nên thêm hai pass đó (chép theo mẫu của shader Lit) trước khi dùng. Shader được soát theo API URP 17 (Unity 6) nhưng chưa biên dịch thử trong Editor — mở trong Unity 6 kiểm tra trước khi dựa vào.
- Tăng `_OutlineWidth` từ 0 lên 0,02: viền dày đều theo đơn vị thế giới. Nhân vật đứng xa thì viền trông mỏng đi, đây là hành vi đúng của outline world-space; muốn độ dày không đổi theo màn hình thì phải nhân theo `positionCS.w`.
- Kéo `_RampSmooth` về 0,001: bóng thành cạnh cứng kiểu cel; tăng lên 0,3: bóng mềm.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vertex shader và fragment shader khác nhau thế nào, và đi qua những không gian toạ độ nào?**
  → Vertex shader chạy mỗi đỉnh, biến đổi vị trí từ object qua world, view rồi ra clip space; sau đó phần cứng chia cho `w` để ra NDC và ánh xạ sang screen. Fragment shader chạy mỗi pixel sau rasterization để tính màu. Vì số pixel nhiều hơn số đỉnh rất nhiều nên chi phí mobile nằm ở fragment, phép tính nào đưa lên vertex được thì nên đưa.
- `Junior` **Early-Z là gì và cái gì phá nó?**
  → Early-Z là bài kiểm tra depth chạy trước fragment shader để bỏ pixel bị che, giúp không tính màu phí. Nó bị mất hoặc giảm tác dụng khi shader dùng `clip`/`discard`, tự ghi depth, hoặc khi dùng alpha blend, vì GPU không biết trước pixel có bị loại hay không. Vì thế opaque vẽ trước theo thứ tự trước-ra-sau là cách rẻ nhất.
- `Mid` **Vì sao phải đổi normal sang world space bằng ma trận đặc biệt thay vì nhân ma trận Model?**
  → Khi object có non-uniform scale thì nhân normal bằng ma trận Model làm normal không còn vuông góc với bề mặt. Phải dùng ma trận nghịch đảo chuyển vị, và trong URP hàm `TransformObjectToWorldNormal` làm việc đó. Sai chỗ này thì ánh sáng lệch hướng ở nhân vật bị scale méo.
- `Mid` **Forward, Deferred và Forward+ khác nhau ở đâu, anh chọn cái nào cho RPG mobile?**
  → Forward tính sáng ngay trong fragment shader của từng object; Deferred ghi thuộc tính vào G-buffer rồi tính sáng một lượt, nhiều light rẻ nhưng tốn băng thông, khó MSAA và trong suốt; Forward+ gán light theo tile nên hết giới hạn light mỗi object mà vẫn có MSAA. RPG mobile thường chỉ một main light nên tôi chọn Forward, hoặc Forward+ khi cảnh có nhiều light động, vì băng thông G-buffer là thứ đắt nhất trên máy tầm trung.
- `Mid` **Shader của anh không SRP Batcher compatible, anh kiểm gì?**
  → Inspector của shader báo lý do; thường là property nằm ngoài `CBUFFER_START(UnityPerMaterial)` hoặc CBUFFER khác nhau giữa các pass. Tôi khai mọi property trong một CBUFFER giống hệt ở HLSLINCLUDE dùng chung cho mọi pass. Vì SRP Batcher gộp theo shader variant và ghi cbuffer của từng material, nên chỉ cần một pass lệch là cả shader mất batch.
- `Mid` **Khi nào dùng `half` và khi nào phải dùng `float`?**
  → `half` 16-bit rẻ hơn trên nhiều GPU mobile nên tôi dùng cho màu, normal, hệ số 0–1 và kết quả ánh sáng. Vị trí world, UV lớn hay thời gian tích luỹ phải dùng `float` vì `half` có tối đa khoảng 3 chữ số thập phân hữu ích và lệch mạnh ở giá trị lớn, nên hình vỡ hoặc giật. Lỗi này nguy hiểm vì chỉ lộ trên một số GPU, Editor thì không thấy.
- `Mid` **Viết shader bằng HLSL hay Shader Graph, anh chọn thế nào?**
  → Shader Graph hợp prototyping và để artist chỉnh, cũng sinh ra HLSL tương thích SRP Batcher. HLSL tôi chọn khi cần multi-pass (outline), stencil, tái dùng include hay tối ưu tay từng instruction. Dù chọn cái nào tôi vẫn mở Frame Debugger và đếm sample texture, vì Graph dễ làm người ta thêm node mà không thấy giá.
- `Senior` **Anh làm sao giảm shader variant nhưng không làm hỏng hình?**
  → Bỏ keyword không dùng, đổi `multi_compile` thành `shader_feature` ở nơi không cần chọn lúc chạy, và dùng IPreprocessShaders để cắt tổ hợp không bao giờ xuất hiện. Sau đó thu danh sách variant thật sự dùng vào `ShaderVariantCollection` rồi warmup ở loading, vì cắt quá tay sẽ làm shader hồng trên build. Tôi kiểm bằng cách chơi qua các màn hình chính trên bản build thật.
- `Junior` **Lambert với Blinn-Phong khác nhau chỗ nào?**
  → Lambert chỉ có diffuse `max(0, N·L)`, Blinn-Phong thêm specular dựa trên `N·H` với `H` là vector nửa giữa light và view. Cả hai không bảo toàn năng lượng như PBR, nhưng vì rẻ nên vẫn hợp cho shader toon, nơi ta chủ động bẻ kết quả ra bậc.
- `Mid` **Shadow acne và peter-panning là gì, sửa thế nào?**
  → Acne là bề mặt tự đổ bóng sọc vì so depth với chính nó; sửa bằng depth bias và normal bias. Bias quá tay thì bóng tách khỏi vật, gọi là peter-panning. Trong URP tôi chỉnh hai bias trên Light và giữ khoảng cách bóng ngắn, vì bias phụ thuộc kích thước texel shadow.
- `Mid` **Cascade shadow đánh đổi gì và trên mobile chọn thế nào?**
  → Cascade chia frustum thành các lát để vùng gần có độ phân giải bóng cao, nhưng mỗi cascade là thêm một lượt vẽ cảnh vào shadow map. Mobile tầm trung tôi dùng 1–2 cascade, khoảng cách bóng ngắn, và bóng mềm chỉ khi đo thấy đủ ngân sách, vì shadow là một trong những chi phí fill-rate lớn nhất của cảnh.
- `Mid` **Nhân vật động trông "dán" lên bối cảnh đã bake, anh sửa thế nào?**
  → Nhân vật không nhận lightmap nên không có ánh sáng gián tiếp của bối cảnh. Tôi đặt light probe quanh vùng chơi để nhân vật nội suy SH, và trong shader toon cộng ambient từ `SampleSH` ở mức nhẹ. Nhờ vậy màu bóng nhân vật đổi theo từng khu vực, không bị một màu cố định.
- `Mid` **Anh làm toon shading cho nhân vật thế nào về mặt kỹ thuật?**
  → Tôi tính `N·L`, qua `smoothstep` hoặc ramp texture để thành hai-ba bậc, trộn màu base với màu bóng pha tông lạnh chứ không đen thuần. Thêm rim light theo `1 - N·V` chỉ ở phía có sáng, specular dạng khối, và outline. Mọi thứ đưa ra property để artist chỉnh, vì toon là bài toán phong cách nên cần vòng lặp nhanh giữa shader và art.
- `Mid` **Ramp texture hay smoothstep trong code?**
  → Smoothstep rẻ, không tốn sample texture và đủ cho hai bậc, nhưng artist khó chỉnh dải màu. Ramp texture cho artist tự vẽ dải màu và nhiều bậc, đổi lại thêm một lần sample và phải tắt sRGB, tắt mipmap, đặt Clamp. Tôi chọn theo nhu cầu chỉnh của art: nhân vật chính dùng ramp, quái nền dùng smoothstep.
- `Mid` **Outline inverted hull và post-process: anh chọn gì cho mobile?**
  → Inverted hull vẽ lại mesh phình theo normal với Cull Front, rẻ, chạy mọi nền tảng và điều chỉnh độ dày theo đỉnh, nhưng tốn thêm một lượt vẽ mesh và vỡ ở góc cứng nếu normal không mượt. Post-process dựa depth/normal/ID buffer cho độ dày đồng đều theo pixel nhưng thêm pass toàn màn hình và băng thông. Với nhân vật anime mobile tôi chọn inverted hull, vì pass toàn màn hình phá tile memory trên TBDR.
- `Senior` **Outline inverted hull bị đứt ở góc cứng, anh xử lý ra sao?**
  → Vì normal ở góc cứng bị tách theo từng face nên các mặt phình theo hướng khác nhau và hở. Tôi bake normal mượt (trung bình normal của các đỉnh trùng vị trí) vào tangent hoặc vertex color ở bước import, rồi pass outline đọc từ đó thay cho normal gốc. Nhờ vậy normal dùng để phình tách khỏi normal dùng để tô sáng.
- `Senior` **Bóng mặt anime, làm sao để sạch không rối?**
  → `N·L` của mesh mặt ra bóng lổn nhổn theo topology, nên tôi dùng face shadow SDF: một texture lưu ngưỡng sáng theo góc quay mặt do artist vẽ. Shader so góc light trên mặt phẳng ngang với ngưỡng đó để ra ranh giới bóng sạch, thường đối xứng lật theo bên trái-phải. Texture này là dữ liệu nên phải tắt sRGB.
- `Mid` **Vì sao vật trong suốt phải sort và tắt ZWrite?**
  → Blend phụ thuộc thứ tự: phải vẽ sau-ra-trước thì màu mới đúng. Nếu ghi depth, một lớp trong suốt phía trước sẽ loại bỏ pixel của lớp phía sau, nên ta tắt ZWrite cho trong suốt. Vì sort theo object chứ không theo pixel nên các vật giao cắt vẫn có thể sai.
- `Senior` **Tóc nhân vật nửa trong suốt sort lỗi, anh xử lý thế nào?**
  → Cách ổn nhất là tránh blend: dùng alpha test cắt cứng kèm outline để răng cưa không lộ, vì nhân vật toon chấp nhận cạnh sắc. Nếu bắt buộc mềm thì tách hai pass, một pass depth-only trước rồi pass màu, hoặc ép thứ tự vẽ cố định theo lớp mesh. Mỗi cách đánh đổi: test mất early-Z trên nhiều GPU mobile, blend tốn overdraw.
- `Mid` **Premultiplied alpha là gì, vì sao Spine hay dùng?**
  → Texture lưu sẵn `rgb * a` và blend theo `One OneMinusSrcAlpha`. Nhờ vậy filtering không sinh viền sáng hoặc đen quanh sprite, và một shader có thể vừa cộng sáng vừa mờ bằng cách điều chỉnh alpha. Nếu nhập sai chế độ thì viền nhân vật có quầng, nên tôi kiểm cờ premultiplied của atlas khi import.
- `Mid` **Bloom đắt ở đâu trên mobile, anh giảm thế nào?**
  → Bloom trích vùng sáng rồi làm mờ qua chuỗi downsample và upsample, mỗi bước đọc và ghi lại một texture, nên chi phí là băng thông chứ không phải phép tính. Tôi giảm số iteration, bật chất lượng thấp, và hạ độ phân giải bloom. Ngoài ra tôi chỉ bật HDR khi bloom thật sự cần, vì buffer HDR tăng băng thông.
- `Mid` **LUT color grading là gì và vì sao rẻ?**
  → LUT là texture 3D ánh xạ màu vào sang màu ra, nên cả quá trình chỉnh màu thành một lần tra bảng mỗi pixel bất kể artist chỉnh phức tạp thế nào. Artist grade bằng ảnh rồi export LUT. Đó là lý do color grading rẻ hơn bloom hay DoF nhiều.
- `Senior` **Render Scale 0,75 thật ra giảm bao nhiêu và đánh đổi gì?**
  → Mỗi chiều giảm còn 0,75 nên số pixel còn 0,75² ≈ 56%, tức bỏ khoảng 44% pixel của mọi pass 3D. Đánh đổi là hình mềm hơn; UI vẫn vẽ ở độ phân giải gốc nên chữ vẫn nét. Tôi dùng nó vừa như công cụ chẩn đoán GPU-bound, vừa làm tuỳ chọn chất lượng cho máy yếu.
- `Senior` **Renderer Feature dùng khi nào, và Render Graph thay đổi gì ở Unity 6?**
  → Renderer Feature cắm pass tuỳ biến vào đúng event của URP, ví dụ outline post, mask nhân vật, blur nền popup. Render Graph để pass khai báo tài nguyên đọc và ghi, graph tự xếp thứ tự, tái dùng texture tạm, loại pass thừa, và có thể gộp pass thành native render pass trên mobile. Vì thế pass cũ viết kiểu `Execute` phải chuyển sang `RecordRenderGraph` để không rơi vào Compatibility Mode.
- `Mid` **Batch 2D vỡ, anh làm gì?**
  → Mở Frame Debugger xem lý do không gộp được: thường là sprite khác atlas hoặc material xen kẽ nhau trong thứ tự sort. Tôi gộp sprite cùng atlas, nhóm theo Sorting Layer để các sprite cùng atlas nằm liền kề, và dùng chung material. Đo lại số batch sau mỗi thay đổi.
- `Mid` **Mask uGUI bị hỏng sau khi anh viết shader UI riêng, nguyên nhân?**
  → Shader UI tự viết thiếu khối property và trạng thái Stencil (`_Stencil`, `_StencilComp`, `_StencilOp`, `_StencilReadMask`…) mà uGUI Mask ghi vào material. Không có thì stencil không cắt đúng nên nội dung tràn ra. Tôi sao chép khối Stencil từ UI/Default rồi thêm hiệu ứng vào.
- `Mid` **Nhận biết sRGB hay linear cho từng texture, anh làm thế nào?**
  → Texture màu (albedo, icon) là sRGB và bật `sRGB (Color Texture)`; texture dữ liệu như normal, mask, ramp, SDF mặt phải tắt sRGB, vì bật thì GPU chuyển gamma lên dữ liệu và làm méo giá trị. Một ramp toon sai màu hoặc SDF mặt bóng lệch thường chính là lỗi này.
- `Junior` **Mipmap, bilinear, trilinear, anisotropic khác nhau thế nào?**
  → Mipmap là chuỗi ảnh nhỏ dần; bilinear nội suy trong một mip, trilinear nội suy thêm giữa hai mip, anisotropic lấy thêm sample cho bề mặt nhìn nghiêng. Càng về sau càng đắt, nên tôi bật anisotropic cho nền đất, tắt cho UI vì UI vẽ 1:1.
- `Senior` **Vì sao đo GPU phải dùng máy thật, và đo bằng gì?**
  → Mobile GPU là tile-based, có throttle nhiệt và băng thông bị giới hạn, còn Editor chạy GPU desktop che hết mấy nghẽn này. Tôi dùng Frame Debugger xem pass và RT, RenderDoc hoặc Android GPU Inspector xem từng draw, và Xcode GPU capture cho iPhone. Đo ở máy nguội và nóng, vì máy nóng xung nhịp giảm làm số đo trôi.
- `Senior` **TBDR là gì và chi phí load/store nghĩa là gì?**
  → GPU mobile chia màn hình thành các tile, vẽ cả tile trong bộ nhớ on-chip rồi ghi ra bộ nhớ chính một lần, nên overdraw opaque rất rẻ nhờ loại sớm. Chi phí nằm ở load (đọc attachment từ bộ nhớ chính vào tile đầu pass) và store (ghi ra cuối pass). Vì thế tôi dùng clear thay vì load, không store depth hay MSAA khi không cần, và tránh pass đọc lại framebuffer.
- `Senior` **Vì sao một pass full-screen đọc lại màn hình lại đắt trên mobile?**
  → Pass đó cần màu của pass trước làm input, nên GPU phải kết thúc render pass, ghi tile ra bộ nhớ chính rồi nạp lại; đó là chi phí băng thông đầy đủ chứ không còn trong tile. Mỗi pass như vậy là một vòng store và load. Cho nên tôi gộp hiệu ứng vào ít pass nhất và để Render Graph gộp pass khi có thể.
- `Senior` **Game anime tụt fps trên máy yếu, anh chẩn đoán GPU thế nào?**
  → Hạ Render Scale trước: nếu frame time giảm nhiều là fragment/fill-bound, rồi mở Frame Debugger tìm pass tốn, đặc biệt full-screen pass và particle alpha lớn. Nếu không đổi thì xem CPU. Sau khi khoanh vùng tôi đo lại sau mỗi thay đổi, vì GPU mobile nhạy với băng thông hơn là với số phép tính.
- `Mid` **Particle System và VFX Graph, anh chọn cái nào cho mobile tầm trung?**
  → Particle System chạy trên CPU, mọi nền tảng, hợp số hạt nhỏ; VFX Graph chạy trên GPU qua compute shader, hợp hàng chục nghìn hạt nhưng đòi hỏi compute và có chi phí khởi tạo. RPG mobile tầm trung thường ít hạt nên tôi chọn Particle System, vì tương thích rộng và chi phí chính vẫn là overdraw chứ không phải mô phỏng.
- `Mid` **Hiệu ứng skill nhiều lớp làm tụt fps, anh giảm thế nào?**
  → Chi phí chính là overdraw của quad alpha lớn chồng nhau, nên tôi giảm số lớp, cắt quad ôm hình hạt hoặc dùng mesh particle, dùng texture sheet chung atlas, và hạ độ phân giải cho khói. Đặt giới hạn số hạt tối đa mỗi skill. Đo lại bằng Frame Debugger và chế độ Overdraw.
- `Mid` **Hiệu ứng khựng lần đầu xuất hiện trên máy thật, anh nghĩ tới gì?**
  → Rất có thể shader compile lần đầu thấy variant mới hoặc texture, mesh nạp lần đầu. Tôi warmup shader qua `ShaderVariantCollection`, prewarm pool hiệu ứng ở màn loading, và kiểm bằng cách vào cảnh lần đầu trên bản build thật.

**Khung trả lời 60 giây** — "Anh làm toon shading cho nhân vật anime trên mobile thế nào?"

> Tôi chia thành ba lớp: shading, outline và chi phí. Về shading, tôi tính `N·L` rồi qua smoothstep hoặc ramp texture để ra hai-ba bậc, màu bóng pha tông lạnh chứ không đen, thêm rim light ở phía có sáng và đưa mọi thứ ra property cho artist chỉnh. Mặt nhân vật dùng face shadow SDF để bóng sạch, chứ `N·L` của mesh mặt sẽ ra bóng rối. Outline tôi dùng inverted hull với Cull Front, normal mượt bake vào tangent để không đứt ở góc cứng, vì post-process outline thêm pass toàn màn hình mà GPU tile-based rất ngại. Về chi phí, tôi giữ mọi property trong một CBUFFER để SRP Batcher hoạt động, dùng `half` cho màu và ánh sáng, ít keyword, và mở Frame Debugger xem nhân vật tốn bao nhiêu pass. Cuối cùng tôi đo trên máy tầm trung thật, so frame time trước và sau mỗi thay đổi, vì toon đẹp mà tụt fps thì không ship được.

**Họ sẽ đào tiếp**

- *"Vì sao không dùng post-process outline?"* → Thêm pass toàn màn hình, đọc lại framebuffer phá tile trên TBDR, tốn băng thông; đổi lại độ dày đều theo pixel và không cần mesh phụ.
- *"Outline độ dày không đổi theo khoảng cách làm sao?"* → Nhân độ phình với `positionCS.w` (hoặc khoảng cách) để bù phối cảnh, đổi lại phải tự kiểm lại ở FOV và góc nhìn khác.
- *"Làm sao shader vẫn SRP Batcher compatible khi có nhiều pass?"* → Một CBUFFER `UnityPerMaterial` giống hệt ở mọi pass, đặt trong HLSLINCLUDE dùng chung; kiểm trong Inspector.
- *"Vì sao không dùng Deferred cho game này?"* → Băng thông G-buffer, trong suốt vẫn đi đường forward, MSAA khó; cảnh ít light thì không đáng.
- *"Render Graph giúp gì cho mobile?"* → Cấp phát RT tạm tái dùng, loại pass thừa, gộp pass thành native render pass để giữ dữ liệu trong tile.
- *"Load/store là gì và anh tránh nó thế nào?"* → Đọc attachment vào tile đầu pass, ghi ra cuối pass; dùng clear thay load, không store depth/MSAA thừa, tránh pass đọc lại framebuffer.
- *"Alpha test hay alpha blend cho tóc?"* → Test: không sort nhưng mất early-Z và răng cưa; blend: mượt nhưng sort và overdraw; nêu lựa chọn kèm điều kiện (viền toon che răng cưa).
- *"Nhân vật bị tối/bẹt hơn bối cảnh thì sao?"* → Thiếu ánh sáng gián tiếp: thêm light probe, ambient `SampleSH`, kiểm sRGB/linear và tonemapping.
- *"Khi nào dùng Shader Graph thay vì viết HLSL?"* → Prototype, artist tự chỉnh; HLSL khi cần multi-pass, stencil, tối ưu từng instruction; kiểm số sample cả hai.
- *"Đo GPU thế nào khi không có máy thật?"* → Không đáng tin: Editor che nghẽn băng thông và TBDR; phải có máy thật tầm trung và dùng RenderDoc/AGI/Xcode.

**Cờ đỏ**

- Trả lời "dùng Deferred cho nhiều light" mà không nhắc băng thông G-buffer, MSAA và máy mục tiêu là mobile.
- Nói fragment và vertex shader "chạy như nhau" hoặc không biết fragment mới là chỗ đắt trên mobile.
- Viết shader URP bằng `CGPROGRAM`, `UnityCG.cginc` hay surface shader, tức trộn Built-in với URP.
- Không biết SRP Batcher cần CBUFFER `UnityPerMaterial`, hoặc nói "shader nào cũng batch được".
- Bật alpha blend khắp nơi vì "đẹp", không nhắc sort, overdraw và early-Z.
- Gắn nhãn texture dữ liệu (normal, ramp, SDF) là sRGB hoặc không phân biệt sRGB với linear.
- Đề xuất post-process outline hay bloom nặng cho mobile mà không nói tới băng thông và tile memory.
- Nói đã tối ưu GPU nhưng chỉ đo trong Editor, không dùng Frame Debugger, RenderDoc hay công cụ thiết bị thật.
- Không biết `half` có thể sai trên một số GPU, hoặc dùng `half` cho vị trí world.
- Bảo "Render Graph chỉ là đổi API" mà không nói tới quản lý tài nguyên và gộp pass.

**Số / ví dụ nên thuộc**

- Chuỗi không gian: **Object → World → View → Clip → NDC → Screen**; vertex shader xuất **clip space**, chia `w` do phần cứng.
- Mipmap thêm khoảng **33%** bộ nhớ; ASTC 4x4 = **8 bpp**, 6x6 ≈ **3,56 bpp**, 8x8 = **2 bpp**.
- Render Scale **0,75** ⇒ khoảng **56%** số pixel (bỏ **44%**); Render Scale **0,5** ⇒ **25%** số pixel.
- Một lần ghi toàn màn hình 1080p RGBA8 ≈ **8MB**.
- Shader variant: 10 keyword bool ⇒ tối đa **1.024** biến thể.
- Thứ tự `Queue`: Geometry **2000**, AlphaTest **2450**, Transparent **3000**.
- `half` là **16-bit**, `float` là **32-bit**; giá trị lớn nhất của `half` là **65504**.
- Pass LightMode URP cần thuộc: **UniversalForward**, **ShadowCaster**, **DepthOnly**, **DepthNormals**, **SRPDefaultUnlit** (dùng cho outline).
- Blend premultiplied alpha: **`One OneMinusSrcAlpha`**; alpha blend thường: **`SrcAlpha OneMinusSrcAlpha`**.
- Công cụ GPU: **Frame Debugger**, **RenderDoc**, **Xcode GPU Frame Capture**, **Android GPU Inspector**, **Arm Performance Studio** (Mali), **Snapdragon Profiler** (Adreno).
- Câu chuyện của riêng bạn: **máy nào, pass nào, ms/MB trước và sau, công cụ nào đo ra**.
