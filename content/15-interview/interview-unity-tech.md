---
id: interview-unity-tech
title: Ngân hàng câu hỏi kỹ thuật Unity
icon: 🎮
summary: Mười hai chủ đề kỹ thuật Unity mà vòng phỏng vấn theo CV hay đào — vòng đời, GC, rendering, bộ nhớ, asset, uGUI, vật lý, animation, shader, build mobile, debug và kiến trúc — mỗi chủ đề có bảng câu hỏi kèm ý bắt buộc phải chạm, cuối node là bộ thẻ luyện nói.
status: deep
read: 1124
level: intermediate
order: 22
tags: [interview, unity, optimization, rendering, memory]
related: [interview-cv, csharp-interview-kit, unity-optimization, unity-addressables]
---

Node [[interview-cv]] dạy cách kể từng dòng CV thành câu chuyện. Node này là mặt kia của vòng đó: khi bạn viết "tối ưu render", "Addressables", "IL2CPP" lên CV, người phỏng vấn sẽ **mở đúng chủ đề ấy ra và đào tới đáy**. Người làm Unity mười năm không bị hỏi định nghĩa; họ bị hỏi *"cái đó hỏng trên máy thật thì anh nhìn vào đâu đầu tiên"*. Mỗi chủ đề dưới đây gồm một đoạn kiến thức cô đọng và một bảng "câu hỏi → ý bắt buộc phải chạm". Bảng là thứ để tự kiểm: nếu bạn trả lời mà thiếu ý ở cột phải, câu đó chưa đạt.

Số liệu trong node lấy từ các node chuyên sâu của kho ([[unity-optimization]], [[unity-memory-optimization]], [[unity-build-platform]]…) hoặc là hằng số chuẩn. Số **đo trên dự án của bạn** thì phải là số của bạn — đừng mượn.

## 1. Vòng đời và thứ tự thực thi

Mỗi frame Unity chạy `Awake` → `OnEnable` → `Start` (một lần, trước `Update` đầu tiên của chính script đó), rồi lặp `FixedUpdate` (0, 1 hay nhiều lần tuỳ bước vật lý còn nợ) → `Update` → coroutine → `LateUpdate` → render. `Awake` chạy cho **mọi** object của scene trước khi bất kỳ `Start` nào chạy; chính vì vậy `Awake` dùng để tự khởi tạo, `Start` dùng để nối sang script khác. Thứ tự giữa hai script cùng loại hàm không xác định trừ khi khai trong *Script Execution Order* hoặc `[DefaultExecutionOrder]`. Chi tiết ở [[unity-game-loop]].

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| `Awake` khác `Start` khác `OnEnable` | Awake: chạy cả khi script disabled, một lần; OnEnable: mỗi lần bật, cặp với OnDisable; Start: trước Update đầu, sau mọi Awake |
| Hai script phụ thuộc lúc khởi tạo thì xử lý sao | Không dựa thứ tự Update; dùng Awake tự khởi tạo / Start nối dây, hoặc `[DefaultExecutionOrder]`, hoặc bootstrap tập trung |
| Vì sao input đọc ở `Update`, vật lý ở `FixedUpdate` | Bước vật lý cố định 0,02s mặc định; input có thể mất nếu đọc ở Fixed |
| `Time.deltaTime` trong `FixedUpdate` | Trả về fixedDeltaTime; `Time.timeScale = 0` làm Fixed dừng nhưng Update vẫn chạy |
| Scene load đồng bộ có vấn đề gì | Đóng băng frame vài giây trên mobile; dùng `LoadSceneAsync` + `allowSceneActivation` |

## 2. C# trong Unity: GC, boxing, null giả, coroutine và async

GC của Unity (Boehm, non-generational; Incremental GC có từ 2019.1 chỉ chia nhỏ pause chứ không bỏ pause) quét **toàn heap managed**, nên heap càng lớn mỗi lần quét càng đắt. Mục tiêu thực dụng là **0 byte alloc mỗi frame** ở gameplay: không LINQ, không `string +`, không `foreach` trên kiểu cũ trả enumerator boxing, không closure bắt biến trong `Update`. `GameObject`/`Component` là wrapper managed quanh object native, và `==` được overload — nên `?.` và `??` bỏ qua kiểm tra "đã Destroy" (null giả). Nền tảng ở [[unity-csharp-memory]] và [[csharp-interview-kit]].

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| GC spike là gì, tìm bằng cách nào | Alloc → heap đầy → collect → frame khựng; Profiler cột GC Alloc, Deep Profile, sắp theo GC Alloc |
| Boxing xảy ra ở đâu | Struct ép sang `object`/interface, enum làm key Dictionary không comparer, `string.Format` với value type; một lần box ≈ 24 byte |
| Null giả của Unity | Object native đã Destroy nhưng wrapper managed còn; `== null` được overload, `?.` thì không; dùng `if (obj)` hoặc `obj != null` |
| Coroutine với async/await | Coroutine gắn vòng đời GameObject, yield instruction cache được, dừng khi object disable; async chạy trên main thread qua SynchronizationContext, cần CancellationToken |
| UniTask hơn Task chỗ nào | Struct-based nên ít alloc, tích hợp PlayerLoop, huỷ theo `GetCancellationTokenOnDestroy` |
| `foreach` trong Update có alloc không | `List<T>` và mảng thì không (struct enumerator); duyệt qua `IEnumerable<T>` interface thì box |

## 3. Rendering: draw call, batching, URP

Một draw call đắt vì CPU phải **chuẩn bị state** (SetPass call), không phải vì vẽ tam giác. Trên mobile, **fill rate và băng thông** thường thắng draw call: particle alpha full-screen 200 hạt là 200 lần tô toàn màn hình mà Frame Debugger chỉ hiện 1 draw call ([[unity-gpu-optimization]]). SRP Batcher gộp các draw dùng **cùng shader variant**, mỗi material có chỗ riêng trong constant buffer, nên không yêu cầu cùng material; nó vỡ khi dùng `MaterialPropertyBlock` hoặc shader không tương thích ([[unity-shader]]). Static batching gộp mesh tĩnh vào một vertex buffer lớn (tốn RAM); dynamic batching chỉ cho mesh rất nhỏ và tốn CPU; GPU instancing cho nhiều bản của **cùng mesh + cùng material**.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Draw call là gì, vì sao đắt | CPU-bound: validate state, SetPass call; số SetPass quan trọng hơn số draw |
| SRP Batcher hoạt động thế nào, khi nào vỡ | Constant buffer per-material, cùng shader variant; vỡ khi dùng MaterialPropertyBlock hoặc shader không khai CBUFFER; `.material` tạo bản sao vẫn batch được nhưng sinh thêm material instance (tốn bộ nhớ, dễ rò) |
| Static / dynamic batching / GPU instancing / SRP Batcher | Bốn công cụ khác ràng buộc; trong URP ưu tiên SRP Batcher, instancing cho cây cỏ/số lượng lớn |
| Overdraw là gì, tìm thế nào | Một pixel bị tô nhiều lần (alpha); Scene view Overdraw, Frame Debugger, RenderDoc / Xcode GPU capture |
| URP Renderer Feature dùng khi nào | Chèn pass tuỳ biến (outline, blur) vào pipeline; Unity 6 dùng Render Graph; mỗi pass full-screen ăn băng thông |
| Render Scale 0,75 được gì | Bỏ 44% số pixel của mọi pass 3D, UI vẫn vẽ độ phân giải gốc |
| Game bị GPU-bound hay CPU-bound, phân biệt thế nào | Thử hạ Render Scale: frame time tụt nhiều ⇒ GPU; không đổi ⇒ CPU ([[unity-cpu-optimization]]) |

## 4. Bộ nhớ: texture, mipmap, audio

Texture thường chiếm phần lớn bộ nhớ native. Một PNG 2048² để mặc định trên Android là khoảng 21MB, nén ASTC còn khoảng 2,5MB ([[unity-build-platform]]). ASTC 4x4 là 8 bit/pixel, 6x6 xấp xỉ 3,56 bpp, 8x8 là 2 bpp; ETC2 RGB 4 bpp, RGBA 8 bpp. Mipmap tốn thêm 33% nhưng sprite UI vẽ 1:1 thì mipmap lãng phí. `Read/Write Enabled` giữ thêm một bản CPU — nhân đôi RAM. Crunch chỉ giảm dung lượng trên ổ đĩa, giải nén khi nạp. Audio `Decompress On Load` giữ PCM: bài nhạc 3 phút có thể 30MB RAM, nên nhạc phải `Streaming` ([[unity-audio]]). Công cụ: Memory Profiler (snapshot, so hai snapshot) — xem [[unity-memory-optimization]].

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Chọn format texture cho Android/iOS | ASTC cho cả hai (Android hiện đại, iOS A8+); ETC2 cho máy cũ; block size đánh đổi chất lượng/dung lượng |
| Mipmap bật khi nào, tắt khi nào | 3D cần (giảm aliasing + băng thông, +33% RAM); UI/sprite 1:1 tắt |
| `Read/Write Enabled` | Giữ bản sao CPU ⇒ gấp đôi RAM; chỉ bật khi thật cần đọc pixel |
| Load type audio | Decompress On Load cho SFX ngắn; Compressed In Memory; Streaming cho nhạc nền |
| Bộ nhớ tăng 120MB sau 15 phút, tìm thế nào | Memory Profiler 2 snapshot, so diff; phân biệt native và managed; kiểm texture/RenderTexture/atlas phình, asset không Release |
| Managed heap với native memory | `GC.Collect()` không đụng native; texture/mesh/audio nằm native |

## 5. Quản lý asset: Resources, AssetBundle, Addressables

`Resources` đóng gói **mọi thứ trong folder Resources vào build**, nạp index lúc khởi động, không update được — chỉ giữ cho thứ rất nhỏ. AssetBundle là nền tảng; Addressables là lớp quản lý phía trên: địa chỉ, **đếm tham chiếu**, dependency tự giải, catalog, remote hosting. Nguyên tắc cắt group: theo **lúc nội dung được cần**, không theo loại asset. Mỗi `LoadAssetAsync` phải có `Release` tương ứng ([[unity-addressables]]). Google Play: base AAB giới hạn 200MB, vượt thì cần Play Asset Delivery.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Resources vs AssetBundle vs Addressables | Resources không update, tăng thời gian khởi động; Addressables = AssetBundle + ref count + catalog |
| Đếm tham chiếu hoạt động ra sao | Mỗi Load tăng, mỗi Release giảm; về 0 bundle mới unload; Load mà không Release là rò |
| Cắt group thế nào | Theo thời điểm dùng; texture nặng dùng chung tách ra để tránh nhân đôi dependency |
| Catalog remote để làm gì | Cập nhật content không qua store; kiểm `CheckForCatalogUpdates`, tải bundle thay đổi |
| Duplicate dependency là gì | Hai bundle cùng chứa một asset không đánh dấu Addressable ⇒ asset bị nhân bản; xem Analyze rule |
| Khi nào bundle cũ không tương thích | Đổi code/serialization sau khi build ⇒ type tree lệch; cần build lại hoặc giữ tương thích |

## 6. UI uGUI

`Canvas` gom mesh của các `Graphic` con thành batch; **một Graphic đổi** (màu, text, vị trí, `fillAmount`) đánh dấu cả Canvas dirty và cuối frame `Canvas.BuildBatch` dựng lại cả canvas ([[unity-ui]]). Quy tắc: tách canvas theo **tần suất đổi** (HUD động riêng, nền tĩnh riêng). `Raycast Target` chỉ bật cho thứ cần nhận bấm; `Layout Group` lồng nhau chạy layout nhiều lượt. ScrollView nghìn mục phải **tái dùng ô** (pooling). TextMeshPro: `SetText("{0}", n)` không alloc; atlas font Static cho bản ship. Atlas Sprite gộp icon để HUD 40 icon thành 1–3 draw call.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Canvas rebuild là gì | Layout rebuild + graphic rebuild; một Graphic dirty ⇒ cả canvas rebatch |
| Tách canvas thế nào | Theo tần suất đổi; canvas lồng; đừng tách quá vụn vì mỗi canvas thêm draw call |
| `Raycast Target` | Mỗi Graphic bật là một ứng viên cho EventSystem; tắt ở nền, text, icon trang trí |
| Layout Group có vấn đề gì | Lồng nhiều tầng ⇒ layout nhiều lượt, dirty lan lên cha; layout xong thì tắt component |
| ScrollView 1.000 mục làm sao | Pool 10–15 ô nhìn thấy, đổi dữ liệu khi cuộn; không Instantiate 1.000 ô |
| TextMeshPro Dynamic vs Static atlas | Dynamic sinh glyph lúc chạy, tốn RAM + hitch; ship dùng Static, CJK cần atlas lớn |
| Health bar trên đầu 50 enemy | 50 canvas world-space là 50 rebuild; gộp một canvas hoặc vẽ bằng shader/sprite |

## 7. Vật lý

Vật lý chạy theo bước cố định (`Time.fixedDeltaTime` = 0,02s mặc định, tức 50Hz), tách khỏi frame render ([[unity-physics]]). Di chuyển Rigidbody bằng `MovePosition`/`AddForce` trong `FixedUpdate`; di chuyển qua `transform` bỏ qua vật lý và bắt engine đồng bộ lại. Layer Collision Matrix cắt cặp va chạm không cần. `Physics.RaycastNonAlloc` / `OverlapSphereNonAlloc` dùng buffer có sẵn để không alloc. `OnTriggerEnter` cần ít nhất một bên có Rigidbody (kinematic cũng được).

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Vì sao di chuyển Rigidbody trong `FixedUpdate` | Đồng bộ bước vật lý, nội suy (Interpolate) cho mượt, tránh xuyên |
| Vật thể nhanh xuyên tường | Collision Detection Continuous / Continuous Dynamic; hoặc raycast phía trước |
| Layer Collision Matrix | Tắt cặp layer không tương tác ⇒ broadphase ít cặp hơn; rẻ nhất để giảm `Physics.Processing` |
| `Raycast` alloc? | `Physics.RaycastAll` trả mảng mới; dùng `RaycastNonAlloc` hoặc API trả số lượng + buffer tái dùng |
| Trigger không chạy | Không bên nào có Rigidbody; layer matrix tắt; collider không bật isTrigger |
| MeshCollider non-convex | Chỉ dùng cho vật tĩnh; Rigidbody động cần Convex hoặc compound collider |

## 8. Animation và Spine

Mỗi Animator tốn khoảng 0,02–0,05ms/frame kể cả đứng yên, nên 200 enemy 2D dùng Animator là 4–10ms ([[unity-animation]]). Giải pháp: `Culling Mode: Cull Completely` khi ngoài màn hình, đổi sprite theo chỉ số frame thay vì Animator, hoặc Spine. Spine là skeleton animation 2D: gọn dung lượng (xương + attachment thay vì nhiều frame), nhưng cần `SkeletonAnimation` update mỗi frame, mesh động ⇒ chi phí CPU và batching (khác atlas/material là vỡ batch); dùng `SkeletonRenderer` chung material + atlas để gộp. `Animator.StringToHash` thay chuỗi trong `SetFloat/SetTrigger`.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Animator tốn ở đâu | Update mỗi frame cho mọi Animator active; state machine + blend + curve; Culling Mode |
| Animator hay tự code với sprite 2D | Nhiều nhân vật đơn giản: đổi frame bằng code/Spine; Animator hợp state phức tạp + blend |
| Has Exit Time + Transition Duration | Mặc định 0,75 và 0,25s ⇒ phản hồi chậm; tắt Exit Time, dùng Fixed Duration theo giây |
| Spine nhiều nhân vật cùng màn hình | Chung atlas/material để batch; giảm số bone, tắt update khi ngoài tầm; skeleton data nạp một lần dùng chung |
| `SetBool("name")` có vấn đề gì | Tra chuỗi mỗi lần; hash trước bằng `StringToHash` |
| Root motion | Chuyển động lấy từ clip, đồng bộ với animation; không hợp game cần điều khiển chính xác bằng code |

## 9. Shader cơ bản

Vertex shader chạy **mỗi đỉnh**, biến đổi toạ độ sang clip space và chuyền dữ liệu; fragment (pixel) shader chạy **mỗi pixel** sau rasterization, tính màu. Chi phí mobile nằm ở fragment: pixel nhiều hơn đỉnh nhiều, và alpha blending làm mất early-Z. `shader_feature` / `multi_compile` sinh **shader variant**: 10 keyword bool ⇒ tối đa 2^10 = 1.024 biến thể, phình build size và build time; chưa warm lên thì lần đầu gặp material là khựng 200–500ms ([[unity-shader]], [[unity-optimization]]). `shader_feature` chỉ build biến thể material dùng tới, `multi_compile` build tất cả.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Vertex vs fragment shader | Per-vertex vs per-pixel; tính ở vertex được thì đưa lên vertex để rẻ |
| Shader variant là gì | Tổ hợp keyword; mỗi tổ hợp một shader compiled; bùng nổ cấp số nhân |
| `multi_compile` vs `shader_feature` | multi_compile: build mọi tổ hợp (chọn runtime); shader_feature: chỉ cái material dùng (không chọn runtime từ code) |
| Giảm variant thế nào | Shader Variant Stripping, IPreprocessShaders, bỏ keyword thừa, ShaderVariantCollection để warmup |
| Vì sao alpha blend đắt trên mobile | Overdraw + mất early-Z/tile-based hidden surface removal; ưu tiên alpha test hoặc opaque |
| Tính ánh sáng ở đâu rẻ nhất | Baked lightmap rẻ hơn realtime; mobile hạn chế additional light, shadow cascade ([[unity-lighting]]) |

## 10. Build mobile

IL2CPP dịch IL sang C++ rồi biên dịch native: build chậm hơn Mono 3–5 lần, nhưng runtime nhanh hơn và là **bắt buộc cho iOS và ARM64 Android** ([[unity-build-platform]]). Managed code stripping loại code không dùng; reflection, JSON, SDK gọi bằng tên thì bị strip nhầm — khai trong `link.xml` hoặc `[Preserve]`. Android: AAB (có Play Asset Delivery), giới hạn base 200MB, ARM64 only cho Release; iOS: Xcode, signing, Metal, ATT. Build Report chỉ ra asset nào phình app.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Mono vs IL2CPP | IL2CPP: AOT, nhanh hơn, khó reverse hơn, bắt buộc iOS; build lâu; generic ảo cần AOT |
| Code stripping và `link.xml` | Strip loại type không tham chiếu tĩnh; reflection/serialize cần preserve; lỗi chỉ lộ trên build |
| Giảm kích thước app thế nào | Build Report; nén texture ASTC; audio Vorbis + Streaming; ARM64 only; Addressables kéo nội dung sau |
| Android khác iOS ở điểm nào | AAB/PAD vs IPA/ODR; Vulkan/GLES vs Metal; permission runtime vs ATT; đa dạng thiết bị vs ít thiết bị |
| Vì sao chỉ ARM64 | Máy ARMv7 cũ ra trước 2015, thêm 40% kích cỡ; Google Play yêu cầu 64-bit |
| Vì sao crash chỉ trên build, Editor thì không | Stripping, IL2CPP generic, shader thiếu variant, khác graphics API, quyền và đường dẫn file |

## 11. Debug crash và profiling trên máy thật

Profile trên **thiết bị thật, bản build thực, máy nguội**: Development Build chậm hơn Release 10–30% (đúng cho so sánh tương đối), nhiệt làm hai lần đo cách 10 phút lệch tới 30% ([[unity-profiling]]). Đọc cột **Self** chứ không phải Total. Xem **max frame time và p95**, không chỉ trung bình: 59fps trung bình vẫn giật nếu cứ 2 giây có một frame 40ms. Công cụ: Unity Profiler (autoconnect qua USB), Frame Debugger, Memory Profiler, Android Studio Profiler / Logcat, Xcode Instruments, Firebase Crashlytics ([[unity-debug-crash]]).

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Quy trình khi game tụt fps | Đo CPU/GPU bound, sắp Hierarchy theo Self, khoanh hàm, sửa một thứ, đo lại, ghi số trước/sau |
| Self vs Total | Total gồm hàm con; Self chỉ riêng hàm; Total lớn Self nhỏ là chỉ gọi người khác |
| Vì sao đo trên máy thật | Mobile GPU tile-based, nhiệt, throttle; Editor không phản ánh |
| Crash chỉ vài % người dùng | Crashlytics gom theo stack, xem thiết bị/OS/RAM; thường OOM trên máy 3GB hoặc driver GPU cụ thể |
| OOM trên iOS | iOS giết app khi vượt giới hạn RAM; Xcode Memory Graph, Memory Profiler tìm texture/RT/atlas lớn |
| Native crash không có stack C# | Symbol file (`.so` symbols, dSYM), `ndk-stack`, Xcode symbolicate |

## 12. Kiến trúc: pattern, ScriptableObject, DI, event, MVP

Nguyên tắc: tách **dữ liệu**, **logic**, **hiển thị** ([[unity-design-patterns]]). `ScriptableObject` là asset dữ liệu dùng chung (cấu hình, event channel) — không alloc mỗi instance, nhưng giá trị sửa trong Editor có thể persist, và trên build thì không ghi ngược xuống asset. Event/Action tách module nhưng nhớ cặp `+=` / `-=`. DI (VContainer, Zenject) cho dependency tường minh, dễ test; Singleton là DI nghèo. MVP cho UI: View chỉ hiển thị + bắn sự kiện, Presenter giữ logic, Model là dữ liệu — logic test được mà không cần scene.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| ScriptableObject dùng để làm gì | Config/dữ liệu dùng chung, event channel; không chứa state runtime nhạy cảm vì sống qua play session trong Editor |
| Singleton có gì sai | Phụ thuộc ẩn, khó test, thứ tự khởi tạo, rò state qua scene; thay bằng DI/Service Locator có kiểm soát |
| DI trong Unity | Container (VContainer/Zenject), constructor injection cho class thường, `[Inject]` cho MonoBehaviour; lợi: test, đổi implementation |
| Event dễ gây lỗi gì | Quên `-=` ⇒ rò + gọi object đã Destroy; thứ tự listener không bảo đảm; debug khó khi chuỗi dài |
| MVP cho UI | View mỏng, Presenter chứa logic test được, Model dữ liệu; tránh MonoBehaviour phình 2.000 dòng |
| Save data | Tách model serialize được khỏi MonoBehaviour; version hoá, migrate; ghi atomic ([[unity-save-data]]) |

## Cách dùng node này trước ngày phỏng vấn

Ba ngày trước: đọc đoạn kiến thức của từng chủ đề, che cột phải bảng, tự nói câu trả lời, mở lại đối chiếu. Hai ngày trước: gắn mỗi chủ đề với **một chuyện thật trong CV của bạn** (ms trước/sau, MB trước/sau). Một ngày trước: chạy chế độ Luyện phỏng vấn trên web, chỉ lật thẻ sau khi đã nói to. Phần lớn người trượt vòng này không phải vì thiếu kiến thức mà vì chỉ trả lời "là gì" mà không trả lời được "vì sao" và "đo bằng gì".

## 🤖 Prompt cho AI

**Dùng AI thế nào cho luyện phỏng vấn kỹ thuật Unity**

AI hợp nhất ở vai **người phỏng vấn đào sâu**: nó hỏi một câu, chờ bạn trả lời, rồi hỏi tiếp vào đúng chỗ bạn nói mơ hồ. AI không hợp ở việc **cung cấp số liệu**: nó rất hay bịa con số Unity ("SRP Batcher nhanh gấp 4 lần", "boxing tốn 32 byte") nghe chắc chắn. Quy trình ba bước: (1) tự trả lời bằng miệng trước, (2) dán câu trả lời cho AI chấm theo các ý bắt buộc ở bảng chủ đề, (3) mọi con số AI đưa ra phải đối chiếu lại với node `unity-*` tương ứng trong kho hoặc tự đo trên Profiler.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| **Hỏi đáp một-một** | Ôn từng chủ đề | "Đóng vai người phỏng vấn Unity senior, hỏi chủ đề rendering mobile, từng câu một." |
| **Đào theo CV** | Ghép CV với kỹ thuật | "CV tôi ghi: <dòng CV>. Hỏi tôi 5 câu đào tới tận cơ chế, từng câu một." |
| **Bẫy cơ chế** | Kiểm chỗ hổng | "Tôi sẽ giải thích cơ chế X. Hãy chỉ ra chỗ tôi nói sai hoặc thiếu." |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Phiên bản Unity và pipeline** đang dùng (Unity 2018 built-in khác Unity 6 URP + Render Graph rất nhiều).
- **Nền tảng và máy mục tiêu**: Android tầm trung hay iOS; RAM bao nhiêu; GPU Mali hay Adreno.
- **Mức nhắm tới** (senior) và **thời lượng mỗi câu trả lời** (60–90 giây).
- **Bắt chấm gắt** và nói rõ AI không được tự đưa con số mà bạn chưa cung cấp.
- Thể loại game (RPG live-service, nhiều UI, nhiều asset từ server) để câu hỏi sát thực tế.

**Mẫu prompt**

```
Đóng vai người phỏng vấn kỹ thuật Unity mức SENIOR cho studio game Nhật làm RPG
live-service trên mobile. Stack của tôi: Unity 6 URP, Addressables, uGUI + TextMeshPro,
Spine, IL2CPP; máy mục tiêu Android tầm trung RAM 4GB và iPhone.

Luật:
- Hỏi TỪNG CÂU MỘT về chủ đề: <rendering / bộ nhớ / uGUI / Addressables / build>.
  Hỏi xong thì DỪNG, chờ tôi trả lời.
- Sau mỗi câu trả lời: chỉ ra ý tôi THIẾU (cơ chế, cách đo, đánh đổi), rồi hỏi một
  câu đào sâu. Chấm GẮT, KHÔNG khen xã giao.
- CẤM tự đưa con số (ms, MB, %) mà tôi chưa đưa. Nếu cần số, nói "cần đo" và hỏi
  tôi đo bằng công cụ nào.
- KHÔNG liệt kê trước danh sách câu hỏi hay đáp án.
- Nếu tôi nói sai cơ chế, nói thẳng là sai rồi giải thích.
```

**Bẫy thường gặp:** AI trả lời mẹo tối ưu chung chung ("gộp draw call, dùng atlas") mà bỏ qua việc **đo trước**, trong khi người phỏng vấn thật chấm cao nhất ở quy trình đo → sửa một thứ → đo lại. Bẫy thứ hai: AI nói về cách của Unity 2018 trong khi bạn dùng Unity 6 (ví dụ Render Graph, Awaitable, Incremental GC), nên phải nêu phiên bản. Bẫy thứ ba: AI bịa API ("`Canvas.RebuildNow()`") hoặc con số không có nguồn; mọi tên hàm và con số phải đối chiếu tài liệu hoặc node `unity-*` trong kho trước khi mang vào phòng phỏng vấn.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`Awake`, `OnEnable` và `Start` khác nhau thế nào?**
  → `Awake` chạy một lần khi object được tạo, kể cả khi script đang disabled; `OnEnable` chạy mỗi lần bật và đi cặp với `OnDisable`; `Start` chạy một lần trước `Update` đầu tiên và sau mọi `Awake` của scene. Vì thế tôi tự khởi tạo ở `Awake`, nối sang script khác ở `Start`, và đăng ký sự kiện ở `OnEnable` để huỷ được ở `OnDisable`.
- `Junior` **Vì sao đọc input ở `Update` còn di chuyển Rigidbody ở `FixedUpdate`?**
  → Vật lý chạy theo bước cố định, mặc định 0,02s tức 50Hz, còn input cập nhật theo frame render. Nếu đọc nhấn phím ở `FixedUpdate`, một cú nhấn-nhả trong 16ms có thể rơi giữa hai bước vật lý và bị mất, vì vậy tôi đọc ở `Update`, giữ vào cờ, rồi tiêu thụ trong `FixedUpdate`.
- `Mid` **Hai script phụ thuộc nhau lúc khởi tạo, anh xử lý thế nào?**
  → Không dựa vào thứ tự `Update` vì Unity không bảo đảm thứ tự giữa các script cùng loại. Tôi cho mỗi script tự khởi tạo ở `Awake`, nối sang script khác ở `Start`, hoặc dùng `[DefaultExecutionOrder(-100)]` cho script nền như bootstrap. Giải pháp bền nhất là một điểm khởi tạo tập trung gọi tuần tự, vì thứ tự nằm trong một chỗ đọc được thay vì rải trong Project Settings.
- `Junior` **GC spike là gì và anh tìm nó bằng cách nào?**
  → Mỗi lần cấp phát managed làm heap đầy dần, đến ngưỡng GC quét toàn heap và frame khựng. Tôi mở Profiler ở CPU Usage, sắp Hierarchy theo cột GC Alloc, tìm hàm cấp phát mỗi frame, vì mục tiêu thực dụng trong gameplay là 0 byte alloc mỗi frame. Chỗ hay gặp là LINQ, nối chuỗi, closure trong `Update`.
- `Mid` **Boxing xảy ra ở đâu trong code Unity và tốn gì?**
  → Boxing là khi value type bị ép sang `object` hoặc interface, tạo một object trên heap, khoảng 24 byte cho một struct nhỏ. Chỗ tôi hay gặp: `string.Format` với số, enum làm key `Dictionary` mà không có comparer riêng, struct truyền qua `IEquatable` ép kiểu. Mỗi lần box là alloc, nên trong `Update` nó tích thành GC spike.
- `Mid` **Null giả của Unity là gì và `?.` sai ở đâu?**
  → Object Unity gồm wrapper managed và object native; sau khi `Destroy` thì native biến mất nhưng wrapper còn sống. Unity overload toán tử `==` để trả `true` khi so với `null`, còn `?.` và `??` kiểm tra tham chiếu thật nên bỏ qua overload đó. Vì vậy với `MonoBehaviour` tôi dùng `if (obj)` hoặc `obj != null`, vì `?.` sẽ gọi hàm trên object đã chết.
- `Senior` **Coroutine, async/await và UniTask — anh chọn thế nào?**
  → Coroutine gắn với vòng đời GameObject nên disable thì dừng, rất hợp việc ngắn gắn object; nhưng khó trả giá trị và xử lý lỗi. Async/await chạy trên main thread qua SynchronizationContext, cần `CancellationToken` vì không tự dừng khi object bị Destroy. UniTask là struct-based nên ít alloc, tích hợp PlayerLoop, nên tôi dùng cho luồng bất đồng bộ dài như load scene, gọi mạng, vì huỷ theo `GetCancellationTokenOnDestroy` an toàn hơn.
- `Mid` **Draw call là gì và vì sao nó đắt?**
  → Mỗi draw call là một lệnh CPU gửi cho GPU, kèm chuẩn bị state; phần đắt là SetPass call khi đổi shader/material, không phải bản thân việc vẽ tam giác. Vì vậy số SetPass call đáng quan tâm hơn số draw call thô, và tôi đọc cả hai trong Frame Debugger trước khi quyết định gộp batch.
- `Mid` **SRP Batcher hoạt động thế nào và khi nào nó vỡ?**
  → SRP Batcher gộp các draw dùng cùng shader variant, mỗi material có vùng riêng trong constant buffer nên không cần cùng material. Nó vỡ khi shader không khai thuộc tính trong CBUFFER chuẩn hoặc khi dùng `MaterialPropertyBlock`. Gọi `.material` không làm vỡ SRP Batcher vì bản sao vẫn cùng shader variant, nhưng mỗi lần gọi sinh một material instance mới phải tự huỷ, nên tôi vẫn ưu tiên `sharedMaterial` và kiểm mọi shader tương thích SRP Batcher trong Frame Debugger.
- `Senior` **Static batching, dynamic batching, GPU instancing và SRP Batcher — chọn cái nào?**
  → Trong URP tôi mặc định dựa vào SRP Batcher vì nó giảm chi phí đổi state mà không gộp mesh. Static batching hợp cảnh tĩnh nhưng đổi bằng RAM vì gộp vertex buffer; dynamic batching chỉ cho mesh rất nhỏ và tốn CPU nên tôi thường tắt. GPU instancing dùng khi có nhiều bản cùng mesh cùng material như cây cỏ, vì một draw vẽ nhiều instance.
- `Senior` **Game tụt fps — GPU-bound hay CPU-bound, anh phân biệt thế nào?**
  → Tôi hạ Render Scale xuống 0,5: nếu frame time giảm mạnh thì GPU-bound, nếu gần như không đổi thì CPU-bound, vì Render Scale chỉ đổi số pixel mà không đụng logic. Sau đó vào Profiler: main thread bận ở script hay đang đợi GPU (`Gfx.WaitForPresent`) cho thấy nghẽn nằm đâu. Làm thế tránh được cảnh tối ưu code C# trong khi 14ms thật ra là đứng đợi GPU.
- `Mid` **Overdraw là gì, vì sao nó giết mobile?**
  → Overdraw là một pixel bị tô nhiều lần, điển hình là particle alpha chồng lớp: 200 hạt full-screen là 200 lần tô toàn màn hình dù Frame Debugger chỉ hiện 1 draw call. GPU mobile bị chặn bởi fill rate và băng thông, vì vậy tôi giảm kích thước quad, cắt bớt lớp, hoặc đổi sang alpha test khi có thể. Công cụ kiểm là chế độ Overdraw ở Scene view và RenderDoc.
- `Senior` **URP Renderer Feature dùng khi nào và có giá gì?**
  → Dùng khi cần chèn một pass tuỳ biến vào pipeline như outline, blur nền, hay vẽ mask. Giá là mỗi pass full-screen đọc và ghi cả framebuffer, trong khi một lần ghi 1080p RGBA8 là khoảng 8MB, nhân 60fps thành băng thông lớn. Trên Unity 6 tôi viết bằng Render Graph, và luôn đo trên máy thật vì tile-based GPU rất nhạy với pass phá tile.
- `Mid` **Anh chọn format texture cho Android và iOS thế nào?**
  → ASTC cho cả hai nền tảng hiện đại: block 4x4 là 8 bit/pixel, 6x6 khoảng 3,56 bpp, 8x8 là 2 bpp, nên chọn block lớn cho texture ít chi tiết và 4x4 cho UI/ký tự nét. ETC2 chỉ giữ cho máy Android rất cũ không hỗ trợ ASTC. Một PNG 2048 để mặc định trên Android khoảng 21MB, nén ASTC còn khoảng 2,5MB, vì thế texture chưa nén là nguồn phình RAM số một.
- `Junior` **Mipmap bật khi nào, tắt khi nào?**
  → Mipmap thêm khoảng 33% bộ nhớ nhưng giảm aliasing và băng thông cho vật thể 3D ở xa, nên bật cho texture 3D. Sprite UI vẽ đúng tỉ lệ 1:1 không bao giờ dùng mip nhỏ hơn, vì vậy tắt đi để tiết kiệm bộ nhớ.
- `Mid` **`Read/Write Enabled` và Crunch ảnh hưởng thế nào?**
  → `Read/Write Enabled` giữ thêm một bản texture trong RAM CPU để đọc pixel, tức gấp đôi bộ nhớ, nên tôi chỉ bật khi code thật sự cần đọc pixel. Crunch chỉ giảm dung lượng trên ổ đĩa, nhưng khi nạp vẫn giải nén ra dạng đầy đủ nên không giảm RAM. Vì thế nó giúp kích cỡ tải về chứ không giúp bộ nhớ chạy.
- `Senior` **Memory Profiler báo tăng 120MB sau 15 phút chơi, anh tìm thế nào?**
  → Chụp hai snapshot cách nhau, so diff và tách native với managed trước, vì `GC.Collect()` không đụng native. Nếu native tăng thì kiểm texture, RenderTexture, font atlas Dynamic, asset Addressables Load mà chưa Release; nếu managed tăng thì tìm collection phình, event quên `-=`. Tôi chụp ở phút 1 và phút 15 trên máy thật vì nhiệt và heap chỉ lộ sau một thời gian.
- `Mid` **Load type audio chọn thế nào?**
  → SFX ngắn dùng Decompress On Load để phát tức thì, voice vừa phải dùng Compressed In Memory, còn nhạc nền dùng Streaming. Vì `Decompress On Load` giữ dạng PCM, một bài nhạc 3 phút có thể thành khoảng 30MB RAM.
- `Mid` **Resources, AssetBundle và Addressables khác nhau thế nào?**
  → `Resources` đóng gói mọi thứ trong thư mục vào build, nạp index lúc khởi động và không cập nhật được nên chỉ giữ cho thứ rất nhỏ. AssetBundle là nền tảng đóng gói có thể tải từ xa nhưng tôi phải tự quản dependency và vòng đời. Addressables là lớp phía trên: địa chỉ, đếm tham chiếu, dependency tự giải và catalog, vì thế tôi dùng nó cho mọi nội dung live-service.
- `Senior` **Cắt group Addressables theo tiêu chí gì?**
  → Theo lúc nội dung được cần, không theo loại asset. "Tất cả texture một bundle" nghĩa là nạp 200MB cho một màn hình chỉ cần 3MB. Asset dùng chung cho nhiều màn thì tách riêng để không nhân bản dependency, và tôi chạy Analyze rule để bắt duplicate trước khi build.
- `Senior` **Đếm tham chiếu của Addressables hoạt động ra sao và lỗi điển hình là gì?**
  → Mỗi `LoadAssetAsync` hoặc `InstantiateAsync` tăng đếm, mỗi `Release` giảm, về 0 thì bundle mới được unload. Lỗi điển hình là Load mà không Release, hoặc Release hai lần, nên bộ nhớ không về hoặc asset biến mất giữa chừng. Tôi bọc trong một lớp handle riêng gắn với vòng đời màn hình để Release đi theo scope.
- `Mid` **Catalog remote dùng để làm gì và cập nhật content thế nào?**
  → Catalog remote cho phép phát hành nội dung mới mà không qua store: client gọi kiểm cập nhật catalog, so với bản cục bộ, tải bundle đã đổi. Với RPG live-service vì sự kiện đổi liên tục, đây là cách ra content hằng tuần mà không build lại app. Giới hạn là chỉ thay được asset, không thay được code đã build.
- `Mid` **Canvas rebuild là gì và anh giảm nó thế nào?**
  → Khi một `Graphic` trong Canvas đổi màu, text hay vị trí, cả Canvas bị đánh dấu dirty và cuối frame `Canvas.BuildBatch` dựng lại cả canvas. Tôi tách canvas theo tần suất đổi: HUD thay đổi liên tục một canvas, nền tĩnh một canvas khác, vì rebuild tính theo canvas chứ không theo từng phần tử. Không tách quá vụn vì mỗi canvas thêm ít nhất một draw call.
- `Junior` **`Raycast Target` là gì, vì sao nên tắt?**
  → Mỗi Graphic bật `Raycast Target` là một ứng viên EventSystem phải xét khi có chạm, nên màn hình nhiều ảnh nền, text, icon trang trí sẽ tốn thời gian raycast vô ích. Tôi chỉ bật cho nút và vùng thật sự nhận bấm, vì mặc định Unity bật cho mọi Image và Text.
- `Mid` **ScrollView có 1.000 mục, anh làm thế nào?**
  → Không bao giờ `Instantiate` 1.000 ô. Tôi tạo pool vừa đủ ô nhìn thấy cộng vài ô đệm, khoảng 10–15 ô, và khi cuộn thì đẩy ô ra khỏi màn hình xuống cuối, đổi dữ liệu rồi đặt lại vị trí. Vì mỗi ô là một đống `Graphic` và `LayoutGroup`, 1.000 ô là hàng nghìn rebuild.
- `Mid` **`Layout Group` lồng nhau có vấn đề gì?**
  → Mỗi tầng chạy layout hai lượt (đo rồi xếp) và một tầng dirty kéo các tầng cha dirty theo, nên ba tầng lồng với nhiều phần tử có thể tốn mili-giây mỗi lần đổi nội dung. Tôi giảm số tầng, đặt kích thước cố định khi biết trước, và tắt component layout sau khi xếp xong với phần tử tĩnh.
- `Mid` **TextMeshPro: Dynamic atlas hay Static atlas?**
  → Dynamic thêm glyph lúc chạy, nên lần đầu gặp chữ mới là một lần render SDF ngay lúc người chơi mở màn hình, gây hitch, và atlas phình không giảm lại. Bản ship tôi dùng Static atlas, sinh sẵn mọi ký tự game cần. Với game có tiếng Nhật thì atlas 4096² dạng alpha khoảng 16MB, vì vậy phải tính vào ngân sách RAM.
- `Senior` **Vì sao di chuyển Rigidbody bằng `transform.position` là sai?**
  → Gán `transform.position` là dịch chuyển tức thời, bỏ qua mô phỏng vật lý, nên có thể xuyên collider và buộc engine đồng bộ lại transform với physics, thêm chi phí. Tôi dùng `MovePosition` hoặc `AddForce` trong `FixedUpdate` và bật Interpolate để hình mượt theo frame render. Với vật thể nhanh bật Continuous collision detection vì bước 0,02s đủ cho đạn bay xuyên tường mỏng.
- `Mid` **Physics ăn 8ms/frame với 200 object, anh xử lý theo thứ tự nào?**
  → Mở Profiler, nhìn `Physics.Processing` và `Physics.Simulate`, rồi bắt đầu từ thứ rẻ nhất: Layer Collision Matrix để tắt cặp không cần, vì nó cắt số cặp broadphase. Sau đó đổi collider phức tạp sang primitive, cho Rigidbody ngủ, giảm tần suất `fixedDeltaTime` nếu game chịu được, và dùng `RaycastNonAlloc`. Tôi đo lại sau mỗi bước.
- `Junior` **`OnTriggerEnter` không chạy, anh kiểm gì?**
  → Ít nhất một bên phải có Rigidbody (kinematic cũng được), hai collider tĩnh không bao giờ báo gì với nhau. Sau đó kiểm collider đã bật `isTrigger`, cặp layer có bị tắt trong Layer Collision Matrix không. Đây là nguyên nhân của phần lớn câu hỏi "vì sao trigger không chạy".
- `Mid` **Animator tốn gì và 200 enemy 2D xử lý thế nào?**
  → Mỗi Animator active tốn khoảng 0,02–0,05ms/frame kể cả đứng yên, nên 200 enemy là 4–10ms chỉ để cập nhật. Tôi đặt Culling Mode để dừng khi ngoài màn hình, hoặc bỏ Animator mà đổi sprite theo chỉ số frame bằng code, hay dùng Spine. Lý do là Animator mạnh ở state machine và blend phức tạp, còn sprite đơn giản thì quá nặng so với giá trị mang lại.
- `Senior` **Spine ảnh hưởng hiệu năng thế nào, tối ưu ra sao?**
  → Spine gọn dung lượng vì lưu xương và attachment thay vì nhiều frame, nhưng mesh được cập nhật mỗi frame nên tốn CPU, và nhân vật khác atlas hay material thì vỡ batch. Tôi dùng chung atlas và material cho nhân vật cùng màn, giảm số bone, tắt update khi ngoài tầm nhìn, và nạp skeleton data một lần dùng chung. Đo bằng Profiler cột `SkeletonAnimation` và Frame Debugger để thấy batch.
- `Junior` **Vertex shader và fragment shader khác nhau thế nào?**
  → Vertex shader chạy mỗi đỉnh, biến đổi vị trí sang clip space và chuyền dữ liệu; fragment shader chạy mỗi pixel sau rasterization để tính màu. Vì số pixel nhiều hơn số đỉnh rất nhiều, chi phí mobile nằm ở fragment, nên phép tính nào tính được ở vertex thì đưa lên vertex.
- `Mid` **Shader variant là gì, `multi_compile` khác `shader_feature` chỗ nào?**
  → Mỗi tổ hợp keyword là một shader compiled riêng, nên 10 keyword bool có thể sinh tới 2^10 = 1.024 biến thể, phình thời gian build và dung lượng. `multi_compile` build mọi tổ hợp để chọn được lúc chạy; `shader_feature` chỉ build tổ hợp material thực sự dùng, nên gọn hơn nhưng không bật được keyword từ code nếu không có material tương ứng.
- `Senior` **Lần đầu thấy hiệu ứng game khựng 300ms trên máy thật, anh nghĩ tới gì?**
  → Rất có thể là shader compile lần đầu thấy variant mới, tức hitch 200–500ms. Tôi gom các variant thực sự dùng vào `ShaderVariantCollection` và warmup ở màn loading, đồng thời stripping các variant thừa để bản build gọn. Kiểm bằng cách vào cảnh lần đầu trên máy thật xem còn khựng trên 100ms không.
- `Mid` **IL2CPP khác Mono thế nào và vì sao lại dùng?**
  → IL2CPP dịch IL sang C++ rồi biên dịch native, nên runtime nhanh hơn Mono, khó reverse hơn, và là bắt buộc trên iOS (không cho JIT); cái giá là build chậm hơn 3–5 lần, lần đầu có thể 15–40 phút. Vì thế tôi không xoá thư mục `Library` trên CI để giữ cache incremental.
- `Mid` **Code stripping là gì và `link.xml` để làm gì?**
  → Managed code stripping loại code không được tham chiếu tĩnh để giảm kích cỡ. Hệ quả là code gọi bằng reflection, serializer JSON hay SDK tra theo tên bị strip nhầm, và lỗi chỉ lộ ra trên build chứ không ở Editor. Tôi khai các assembly/type cần giữ trong `link.xml` hoặc đánh `[Preserve]`, vì đó là cách duy nhất cho stripper biết.
- `Senior` **App nặng 400MB, anh giảm thế nào?**
  → Mở Build Report xem asset nào chiếm nhiều, thường là texture chưa nén. Nén ASTC, giảm kích thước texture UI 4096 không cần thiết, audio Vorbis và Streaming cho nhạc, ARM64 only cho Release (ARMv7 thêm khoảng 40% kích cỡ). Cuối cùng kéo nội dung không cần ngay (level sau, skin, voice phụ) sang Addressables tải sau, vì Google Play giới hạn base AAB 200MB và app nhỏ thì tải qua di động dễ hơn.
- `Mid` **Android và iOS khác nhau thế nào khi build Unity?**
  → Android xuất AAB (có Play Asset Delivery), nhắm Vulkan rồi OpenGLES3, quyền cấp lúc chạy, thiết bị rất đa dạng nên phải test dải máy yếu. iOS xuất project Xcode rồi ký, dùng Metal, có ATT cho quảng cáo, thiết bị ít mà ổn định hơn nhưng app bị giết khi vượt giới hạn RAM. Vì vậy cùng một bản build phải test riêng hai nền tảng.
- `Senior` **Chạy tốt trong Editor, crash trên build — anh nghĩ tới gì?**
  → Thủ phạm hay gặp nhất là stripping (type bị strip khi gọi bằng reflection), IL2CPP không sinh code cho generic ảo, thiếu shader variant, khác graphics API, hoặc đường dẫn file và quyền khác nhau. Tôi lấy log từ máy thật qua Logcat/Xcode, bật Development Build để có stack, và nếu là crash native thì dùng symbol file với `ndk-stack`. Quan trọng là luôn test bản IL2CPP Release sớm, vì Editor ẩn gần hết các lỗi này.
- `Senior` **Anh profile trên máy thật thế nào để số đo đáng tin?**
  → Máy nguội, tháo sạc, cùng mức pin và bản hệ điều hành, vì nhiệt làm hai lần đo cách nhau 10 phút lệch tới 30%. Tôi chụp ở phút 1 và phút 15, nhìn max frame time và p95 chứ không chỉ trung bình, vì 59fps trung bình vẫn giật nếu cứ 2 giây có một frame 40ms. Development Build chậm hơn Release 10–30% nên chỉ dùng so sánh tương đối.
- `Senior` **Crashlytics báo crash 2% người dùng trên một dòng máy, anh làm gì?**
  → Gom theo stack trace, xem thiết bị, OS, RAM còn trống và breadcrumb ngay trước crash. Nếu là OOM thì thường nằm ở máy RAM thấp nên tôi chụp Memory Profiler trên chính dòng máy đó; nếu là native crash trong driver GPU thì xem Graphics API và tạm tắt tính năng liên quan cho nhóm máy đó. Vì crash chỉ lộ ở thiết bị cụ thể, tôi cần thiết bị thật hoặc farm chứ Editor không tái hiện được.
- `Mid` **ScriptableObject dùng vào việc gì và bẫy ở đâu?**
  → Dùng cho dữ liệu cấu hình dùng chung (stat, bảng drop) và event channel, vì nó là asset nên nhiều object tham chiếu một bản, không nhân bản dữ liệu. Bẫy là sửa giá trị trong Play Mode của Editor sẽ persist còn trên build thì không ghi ngược xuống asset, nên tôi không giữ state runtime của người chơi trong đó mà tách ra model riêng để lưu.
- `Senior` **Singleton có gì sai và anh thay bằng gì?**
  → Singleton là phụ thuộc ẩn: class nào cũng gọi `Instance` nên khó test, thứ tự khởi tạo mong manh và state rò qua scene. Tôi dùng DI (VContainer hoặc Zenject) để khai dependency tường minh qua constructor, nhờ vậy thay được implementation bằng bản giả khi test. Với dự án nhỏ thì một Service Locator có kiểm soát cũng chấp nhận được.
- `Senior` **Thiết kế MVP cho một màn hình UI phức tạp thế nào?**
  → View là MonoBehaviour mỏng chỉ giữ tham chiếu uGUI và bắn sự kiện nhấn; Presenter là class C# thường chứa logic và gọi View qua interface; Model là dữ liệu từ server hoặc cache. Lợi ích là Presenter test được bằng unit test không cần scene, và MonoBehaviour không phình 2.000 dòng. Tôi nhớ huỷ đăng ký sự kiện khi đóng màn hình, vì Presenter sống lâu hơn View sẽ rò.

**Khung trả lời 60 giây** — "Anh tối ưu một game Unity mobile theo quy trình nào?"

> Tôi không bao giờ bắt đầu bằng sửa; tôi bắt đầu bằng đo. Bước một là chụp Profiler trên thiết bị thật yếu nhất trong danh sách hỗ trợ, bản Development Build, máy nguội, ở phút 1 và phút 15, rồi xác định game đang nghẽn CPU hay GPU bằng cách hạ Render Scale xem frame time đổi bao nhiêu. Bước hai là khoanh một hàm hoặc một pass: CPU thì sắp Hierarchy theo cột Self, GPU thì xem Frame Debugger và băng thông, bộ nhớ thì so hai snapshot ở Memory Profiler. Bước ba là sửa **đúng một thứ**, đo lại cùng kịch bản, và ghi số trước sau vào PR; ví dụ ở dự án gần nhất tôi đưa frame time từ 27ms xuống 16ms bằng cách bỏ alloc trong `Update` và giảm overdraw của particle. Vì tôi đo trước và sau mỗi bước, tôi biết chính xác bước nào có tác dụng, và tôi gắn ngưỡng vào test hiệu năng để không ai vô tình đưa lỗi quay lại.

**Họ sẽ đào tiếp**

- *"Anh biết GPU hay CPU-bound bằng cách nào?"* → Hạ Render Scale: frame time giảm mạnh là GPU, không đổi là CPU; sau đó xác nhận bằng Profiler thấy main thread đang đợi GPU (`Gfx.WaitForPresent`) hay bận ở script.
- *"Vì sao đo trên máy thật mà không phải Editor?"* → Mobile GPU là tile-based, có throttle nhiệt, driver khác; Editor chạy trên GPU desktop nên che hết các nghẽn này.
- *"Đọc Self hay Total?"* → Self cho biết chi phí riêng của hàm; Total lớn mà Self nhỏ nghĩa là hàm đó chỉ gọi người khác, tối ưu nó vô ích.
- *"Vì sao 59fps trung bình vẫn giật?"* → Trung bình che spike; phải nhìn max frame time và p95, ví dụ cứ 2 giây một frame 40ms là người chơi thấy khựng.
- *"Draw call thấp rồi mà vẫn chậm?"* → Chuyển sang fill rate và băng thông: overdraw, full-screen pass, độ phân giải; Frame Debugger chỉ 1 draw call vẫn có thể là 200 lần tô toàn màn hình.
- *"Bộ nhớ tăng dần thì tìm thế nào?"* → Hai snapshot Memory Profiler, tách native/managed, tìm texture, RenderTexture, font atlas, asset Addressables chưa Release.
- *"Sau khi sửa làm sao biết không tái phát?"* → Performance Testing package đặt ngưỡng hồi quy trong CI ([[unity-testing-ci]]), bắt tăng frame time ngay lúc merge.
- *"Nếu bật thử tính năng thì hiệu năng đổi, anh quyết định ra sao?"* → Dựa vào số đo: ngân sách 16,6ms ở 60fps, tính phần còn dư, đánh đổi chất lượng hình với frame time, rồi chọn có bằng chứng.
- *"Anh áp dụng quy trình này cho Ateam-style RPG live-service thế nào?"* → Trọng tâm là UI nặng (canvas, atlas, font CJK), tải asset từ server (Addressables, dung lượng), và máy tầm trung RAM thấp; đo ở các màn có nhiều UI và combat đông.

**Cờ đỏ**

- Trả lời "gộp draw call" ngay khi nghe "tối ưu" mà chưa nói tới việc đo hay xác định CPU/GPU-bound.
- Nói tối ưu trên Editor hoặc trên máy mạnh của chính mình, không nhắc máy thật yếu nhất.
- Dùng `?.` hoặc `??` với `MonoBehaviour` rồi bảo "vẫn an toàn", không biết null giả.
- Nói Addressables "tự giải phóng" mà không nhắc đếm tham chiếu và `Release`.
- Gọi `GC.Collect()` như cách sửa rò bộ nhớ, trong khi phần lớn bộ nhớ là native.
- Bật mọi thứ đẹp rồi "tối ưu sau", hoặc nói con số không nhớ đo ở đâu, trên máy nào.
- Không phân biệt được `shader_feature` với `multi_compile`, hoặc nói variant "không ảnh hưởng gì".
- Bảo IL2CPP/stripping "Editor chạy được là được", chưa từng gặp lỗi chỉ xuất hiện trên build.
- Chê SDK hoặc đội cũ thay vì nói rõ cơ chế lỗi và cách đã xử lý.

**Số / ví dụ nên thuộc**

- Ngân sách frame: **16,6ms** ở 60fps, **33,3ms** ở 30fps; mục tiêu alloc gameplay: **0 B/frame**.
- Boxing một struct nhỏ ≈ **24 byte**; mỗi `Update()` rỗng tốn ≈ **0,5µs**, 500 script ≈ **0,25ms/frame**.
- Texture: ASTC 4x4 = **8 bpp**, 6x6 ≈ **3,56 bpp**, 8x8 = **2 bpp**; mipmap **+33%**; PNG 2048 mặc định ≈ **21MB** → ASTC ≈ **2,5MB**.
- Một lần ghi toàn màn hình 1080p RGBA8 ≈ **8MB**; font atlas 4096² alpha ≈ **16MB**; RenderTexture 1080p RGBA + depth ≈ **12MB**.
- Nhạc 3 phút `Decompress On Load` ≈ **30MB** RAM; bước vật lý mặc định **0,02s** (50Hz).
- Render Scale **0,75** bỏ **44%** pixel; shader variant: 10 keyword bool ⇒ tối đa **1.024** biến thể.
- Animator ≈ **0,02–0,05ms**/frame/nhân vật đứng yên; 200 enemy ⇒ **4–10ms**.
- Development Build chậm hơn Release **10–30%**; nhiệt làm hai lần đo cách 10 phút lệch tới **30%**; IL2CPP build chậm **3–5 lần**.
- Google Play: base AAB **200MB**; ARMv7 thêm khoảng **40%** kích cỡ; `Instantiate` 200 viên đạn cùng lúc ≈ frame **30ms** (pool + prewarm để tránh).
- Câu chuyện của riêng bạn: **máy nào, ms/MB trước và sau, công cụ nào đo ra**.
