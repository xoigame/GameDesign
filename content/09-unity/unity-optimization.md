---
title: Tối ưu hoá Unity
icon: ⚡
summary: Đo trên máy đích với build thật, xác định CPU hay GPU trước khi chạm code — và nhận ra rằng import settings quyết định hiệu năng nhiều hơn mọi thuật toán bạn viết.
status: deep
read: 740
level: advanced
order: 140
tags: [unity, optimization, performance]
related: [performance, unity-ui, unity-shader, unity-build-platform]
---

Quy trình đúng chỉ có một: **build Development lên máy yếu nhất, nối Profiler qua máy thật, chụp 300 frame ở cảnh đông nhất, rồi mới mở code**. Profiler trong Editor đo cả Editor; máy dev có GPU gấp 20 lần điện thoại; và thứ tốn nhất trên mobile (băng thông bộ nhớ, nhiệt) không tồn tại trên PC. Mọi tối ưu làm trước bước này là đoán.

Ngân sách frame, GC alloc cơ bản, `NonAlloc`, và overlay `ProfilerRecorder` đã ở [[performance]]. Node này đi tiếp: xác định bottleneck, từng lớp CPU/GPU/bộ nhớ, và cái gì đáng làm sớm.

## Bước 0: CPU hay GPU?

Mở Profiler → CPU Usage → Timeline, tìm trên main thread:
- **`Gfx.WaitForPresentOnGfxThread`** lớn → CPU đợi GPU → **GPU-bound**. Tối ưu code C# lúc này vô ích; đi tới phần GPU.
- **`Gfx.WaitForCommands`** lớn → main thread đợi render thread → quá nhiều draw call / state change → phần batching.
- **`WaitForTargetFPS`** → bạn đang chạm `targetFrameRate` hoặc vsync, mọi thứ ổn.
- Không có cái nào, main thread đầy script/physics/animation → **CPU-bound**, đi tới phần CPU.

Nhớ hai trạng thái: nhiệt độ làm số đổi sau 10 phút chơi, nên chụp ở phút 1 **và** phút 15. **Profile Analyzer** (package) so hai capture theo phân phối — "trung vị tăng 1.2ms ở `Animator.Update`" thay vì nhìn hai biểu đồ đoán.

## CPU: những khoản nợ hay gặp

**Script.** Mỗi `Update()` là một lần gọi native→managed ~0.5µs dù rỗng: 500 script rỗng = 0.25ms mỗi frame, chưa làm gì. Manager tick tập trung với `List<ITickable>` hoặc xoá `Update` khỏi script không cần. LINQ, `foreach` trên `List<T>` (ổn), `foreach` trên interface `IEnumerable<T>` (boxing enumerator), closure bắt biến cục bộ trong lambda, `string` nối trong log — đều là alloc. `Debug.Log` **vẫn chạy trong bản Release** và tốn: format chuỗi, lấy stack trace. Bọc bằng hàm `[Conditional("UNITY_EDITOR")]` hoặc tắt `Debug.unityLogger.logEnabled` ngoài Editor.

**Physics.** Xem [[unity-physics]] về collision matrix và buffer; ở đây chỉ nhắc con số cần nhìn: `Physics.Processing` và số bước `FixedUpdate` mỗi frame khi frame tụt.

**Animator.** `Culling Mode: Cull Update Transforms` cho mọi nhân vật không phải player — ngoài camera thì chỉ tính state machine, không tính bone. Rig import bật *Optimize Game Objects* để bỏ 60 Transform con (mỗi Transform là một object Unity đồng bộ mỗi frame); giữ lại bone cần gắn vũ khí bằng *Extra Transforms to Expose*. Quality Settings → *Skin Weights*: 2 bone trên mobile là đủ, 4 chỉ cho nhân vật chính. 50 kẻ địch × 40 bone × 4 weight là thứ Profiler hiện tên `MeshSkinning.Update`.

**Canvas.** Một chữ đổi là cả Canvas rebuild — tách Canvas theo tần suất đổi, xem [[unity-ui]]. Trong Profiler nó tên `Canvas.SendWillRenderCanvases` và `Canvas.BuildBatch`.

## GPU: draw call, batch và fill rate

Bốn cơ chế gom draw call, và chúng loại trừ nhau theo thứ tự ưu tiên:

| Cơ chế | Điều kiện | Cái giá |
|---|---|---|
| **SRP Batcher** (mặc định URP) | Cùng shader variant, shader tương thích | Không có — nhưng `MaterialPropertyBlock` và `renderer.material` phá nó, xem [[unity-shader]] |
| **Static Batching** | Object Static, cùng material | Gộp mesh lúc build → **bộ nhớ ×2** (mỗi instance giữ bản copy vertex đã transform); 1000 cây static là 1000 mesh copy |
| **GPU Instancing** | Cùng mesh + material, gọi `Graphics.RenderMeshInstanced` hoặc GPU Resident Drawer (Unity 6, cần Forward+) | Setup code; URP ưu tiên SRP Batcher nếu renderer tương thích |
| **Dynamic Batching** | Mesh < 300 đỉnh, cùng material | Gần vô dụng trên URP vì SRP Batcher đã làm tốt hơn; tốn CPU transform mỗi frame. Tắt. |

Trên mobile, **fill rate và băng thông** thường thắng draw call. Một particle system 200 hạt full-screen alpha là 200 lần vẽ toàn màn hình ở 1080p — GPU chết mà Frame Debugger chỉ hiện 1 draw call. Rendering Debugger → Overdraw đỏ đậm là dấu hiệu; cách chữa nằm ở [[unity-vfx]] (particle nhỏ, ít lớp, Additive). UI full-screen panel mờ 50% chồng lên game 3D là một lớp overdraw không ai tính.

## Texture — 80% bộ nhớ, 50% băng thông

Bộ nhớ của một texture 2048×2048 kèm mipmap:

| Định dạng | Kích cỡ | Ghi chú |
|---|---|---|
| RGBA32 (không nén) | **21 MB** | "Trông đúng trong Editor" và giết máy 3GB |
| ETC2 RGBA8 | 5.3 MB | Android cũ, chất lượng kém ở gradient |
| **ASTC 6×6** | **2.5 MB** | Mặc định nên chọn cho cả Android và iOS hiện đại |
| ASTC 8×8 | 1.4 MB | Texture nền, normal map ít chi tiết |
| ASTC 4×4 | 5.3 MB | UI, texture nhân vật chính cần nét |

Ba việc bắt buộc, làm bằng **Preset** và validator import (xem [[unity-editor-tools]]) chứ không làm tay:
- Platform Override cho Android/iOS: format ASTC, **Max Size** theo mục đích (UI icon 256, prop 512, nhân vật 1024, hầu như không gì cần 2048 trên màn 1080p).
- **Mipmap Streaming** bật (Quality Settings → Texture Streaming, budget ví dụ 256MB) + texture bật *Streaming Mipmaps* → chỉ tải mip cần cho khoảng cách camera.
- Sprite atlas cho 2D/UI — không phải vì draw call (SRP Batcher không áp dụng cho UI/sprite), mà vì UGUI batch theo texture.

## Mesh, LOD và culling

- **LOD Group** với tỉ lệ thực dụng: LOD0 tới 60% chiều cao màn hình, LOD1 tới 25%, LOD2 tới 8%, Cull dưới đó. Mỗi LOD giảm ~50–70% tam giác. Object nhỏ dưới 1m chỉ cần LOD0 + Cull. Crossfade tốn shader variant và overdraw — tắt trên mobile.
- **Read/Write Enabled** trên mesh và texture: tắt (mặc định) — bật là giữ bản copy trong RAM cho CPU đọc, gấp đôi bộ nhớ. Chỉ bật ở mesh bạn thật sự sửa bằng code.
- **Occlusion Culling** (Window → Rendering → Occlusion Culling → Bake) đáng khi indoor nhiều phòng, thành phố dày; không đáng ở đồng bằng mở hoặc top-down (mọi thứ đều thấy). Cost bake và runtime CPU query — đo trước sau.
- **Camera far plane** đúng khoảng nhìn thực (top-down: 50, không phải 1000) và `Camera.layerCullDistances` cho layer trang trí nhỏ (cull ở 30m dù far plane 200m).

## Bộ nhớ: rò rỉ và giữ lại

**Memory Profiler** (package `com.unity.memoryprofiler`): chụp snapshot ở menu, chơi 10 phút, chụp lại, tab *Compare* — cái gì tăng mà không nên tăng. Bốn nguồn phổ biến:
- `renderer.material` / `new Material` không `Destroy` → Material Count tăng đều theo số kẻ địch từng spawn.
- `Texture2D`/`Mesh`/`RenderTexture` tạo lúc chạy không `Destroy`/`Release`.
- Addressables handle không `Release` → bundle không bao giờ unload.
- Asset tham chiếu từ ScriptableObject/static field → giữ trong RAM dù đã đổi scene. `Resources.UnloadUnusedAssets()` sau khi unload scene mới dọn được thứ **không còn tham chiếu**.

Trên mobile, hệ điều hành giết app ở ngưỡng bộ nhớ, không báo lỗi — xem ngưỡng ở [[unity-build-platform]]. `Application.lowMemory` là cảnh báo cuối để xoá cache.

## Burst + Jobs — khi nào đáng

Đáng: **> 5.000 phần tử**, hàm thuần trên mảng số (boids, pathfinding grid, culling tự viết, mesh deform, sinh địa hình). Không đáng: 50 kẻ địch gọi `GetComponent`, logic có `GameObject`/`Transform`/class, hoặc thứ chỉ chạy một lần khi load. Burst không chạy trên WebGL (rơi về C# thường, main thread).

```csharp
using Unity.Burst; using Unity.Collections; using Unity.Jobs; using Unity.Mathematics;

[BurstCompile]
struct IntegrateJob : IJobParallelFor {
    [ReadOnly] public NativeArray<float3> velocity;
    public NativeArray<float3> position;
    public float dt;
    public void Execute(int i) => position[i] += velocity[i] * dt;
}

// gọi trong Update — Persistent allocator cho mảng sống nhiều frame, Dispose trong OnDestroy
var job = new IntegrateJob { velocity = vel, position = pos, dt = Time.deltaTime };
JobHandle h = job.Schedule(pos.Length, 128);     // batch 64–256; nhỏ hơn là overhead, lớn hơn là mất song song
h.Complete();                                     // hoặc Complete ở LateUpdate để CPU làm việc khác trong lúc chờ
```

Ghi kết quả về Transform bằng `IJobParallelForTransform` với `TransformAccessArray` — không đọc `NativeArray` rồi gán `transform.position` trong vòng for, điều đó trả lại 90% chi phí vừa tiết kiệm. Cần `Unity.Collections`, `Unity.Mathematics`, `Unity.Burst` trong asmdef; lần đầu vào Play Mode Burst biên dịch mất vài giây — không phải game chậm.

## Mobile: nhiệt, targetFrameRate, và 30 vs 60

`Application.targetFrameRate` mặc định trên mobile là **30** — không đặt thì game chạy 30 dù máy làm được 60. `QualitySettings.vSyncCount` bị bỏ qua trên mobile; chỉ `targetFrameRate` có tác dụng. Con số đúng không phải "cao nhất có thể": máy chạy 60 FPS ở 90% GPU sẽ **throttle sau 8–12 phút** xuống 40 FPS giật, trong khi 30 FPS ổn định ở 45% GPU chạy cả giờ. Game hành động nhanh chọn 60 và phải chừa 40% ngân sách; game chiến thuật/puzzle chọn 30 và dùng phần dư cho hình ảnh. **Adaptive Performance** (package, provider Samsung/Android) cho biết mức nhiệt và tự hạ Render Scale/LOD bias trước khi hệ điều hành throttle — đáng cài cho mọi game mobile 3D.

## Thời gian load

- **Shader warmup** ở màn loading từ `ShaderVariantCollection` (xem [[unity-shader]]) — không thì khựng 200–500ms mỗi lần thấy material mới.
- **Addressables preload** dependency cho level kế ngay khi vào level này; `Addressables.DownloadDependenciesAsync` ở màn chọn level.
- `Awake`/`Start` nặng (dựng lưới 100×100, parse JSON 5MB) chia qua nhiều frame: coroutine `yield return null` mỗi 2ms công việc, hoặc Unity 6 `await Awaitable.NextFrameAsync()`. Người chơi thấy loading bar nhích còn hơn đóng băng 3 giây rồi hiện.
- Scene load: `LoadSceneAsync` + `allowSceneActivation = false` tới khi sẵn sàng; tách cảnh nặng thành additive để tải phần nhìn thấy trước.

## Tối ưu sớm: sai và đúng

**Sai** — tốn thời gian, không có số chứng minh:
- ECS/DOTS cho game 50 object. Hoặc Jobs cho vòng lặp 200 phần tử.
- Tự viết object pool khi `UnityEngine.Pool.ObjectPool<T>` có sẵn từ 2021.
- `struct` hoá mọi thứ, cache `transform` (đã cache nội bộ từ Unity 5), so chuỗi bằng hash tự viết.
- Gộp mesh tay khi SRP Batcher đã lo.

**Đúng** — rẻ khi làm ở tuần 1, đắt gấp trăm khi làm ở tháng 6:
- Preset import cho texture/audio/mesh theo thư mục, validator chặn asset sai.
- Collision matrix và layer đặt xong trước khi có 200 prefab.
- Canvas tách theo tần suất cập nhật ngay từ màn HUD đầu tiên.
- `targetFrameRate` và Render Scale nối vào menu cài đặt từ bản build đầu.
- Assembly Definition để compile 3 giây thay 40 — không phải hiệu năng game, nhưng là hiệu năng team.

## Bẫy lộ ra khi build

- Editor dùng texture không nén để hiện nhanh — chỉ build mới thấy ASTC làm mờ normal map; đổi normal map sang ASTC 4×4 hoặc 5×5.
- `Development Build` chậm hơn Release 10–30% (IL2CPP Debug config, profiler hook) — con số cuối cùng phải đo trên Release với `ProfilerRecorder` overlay.
- Memory Profiler trong Editor đếm cả asset Editor giữ — chỉ snapshot trên build mới đúng.
- Throttling làm hai lần đo cách nhau 10 phút khác 30% — luôn để máy nguội, tháo sạc trước khi đo.

## Kiểm tra nhanh
- Trên build Development, máy đích, cảnh đông nhất: `Gfx.WaitForPresentOnGfxThread` chiếm bao nhiêu % frame? > 30% là GPU-bound.
- Memory Profiler: tổng texture trong RAM < 1/3 ngân sách (ví dụ < 400MB trên máy 3GB)? Texture nào RGBA32 lớn hơn 512?
- Frame Debugger cảnh đông nhất: số batch < 150 trên mobile, < 1000 trên PC?
- Chơi 15 phút liên tục trên máy đích: FPS phút 15 so phút 1 tụt bao nhiêu? > 15% là nhiệt.
- Tìm `Update()` trong toàn bộ code, đếm: có bao nhiêu cái không thật sự cần chạy mỗi frame?

## 🤖 Prompt cho AI

AI "tối ưu" bằng cách viết lại thuật toán C# trong khi bottleneck là GPU fill rate hoặc texture 21MB — nó chưa đo nên không biết, và mặc định mọi vấn đề là code.

**Phải nêu rõ:**
- Kết quả profile thật: CPU hay GPU-bound, marker nào tốn nhất, trên máy nào
- Máy đích yếu nhất, FPS mục tiêu (30 hay 60) và ngân sách ms cho hệ thống đang sửa
- Số phần tử ở tình huống xấu nhất (kẻ địch, hạt, draw call)
- Package đã có (Burst, Collections, Addressables, Adaptive Performance) — CẤM thêm mới
- Ràng buộc bộ nhớ (RAM tổng, ngân sách texture)
- Cái gì **không được** đổi (API public, thứ tự render, format save)

**Mẫu prompt**

```
Tối ưu hệ thống boids 3.000 con trong Unity 6 (6000.0.x), URP, Android Mali-G52, mục tiêu 60 FPS.

Số đo hiện tại (Profiler trên build Development, máy thật):
- Boids.Update 9.8ms main thread, GC Alloc 0 B. Gfx.WaitForPresent ~0. → CPU-bound ở script này.
- Mỗi boid là MonoBehaviour có Update, dùng Physics.OverlapSphereNonAlloc tìm 8 láng giềng.

Mục tiêu: Boids ≤ 2.5ms.
Bắt buộc:
- Chuyển sang IJobParallelFor + [BurstCompile], NativeArray<float3> cho position/velocity, spatial hash trên NativeParallelMultiHashMap. CẤM Physics API trong job.
- Ghi về Transform bằng IJobParallelForTransform. CẤM gán transform.position trong vòng for C#.
- Một MonoBehaviour quản lý toàn bộ, KHÔNG có Update trên từng boid.
- Persistent allocator, Dispose đúng trong OnDestroy. Không cấp phát mỗi frame.
- Chỉ dùng Unity.Burst, Unity.Collections, Unity.Mathematics có sẵn. KHÔNG dùng Entities/ECS.
- Không đổi interface public IBoidSpawner đang được UI gọi.

Sau khi viết: nêu marker Profiler nào tôi cần nhìn để xác nhận, và điểm nào chưa chắc chạy trên IL2CPP.
```

**Bẫy thường gặp:** AI schedule job rồi `Complete()` ngay dòng sau trong `Update` — code chạy, nhanh hơn nhờ Burst, nhưng main thread vẫn đứng chờ nên phần song song gần như bằng 0. Kết quả trông "tối ưu xong" trong khi mất nửa lợi ích. Yêu cầu schedule ở `Update`, `Complete()` ở `LateUpdate`, và đo cả hai cách.

## 💻 Code

Demo dựng một **overlay ngân sách frame** đọc `ProfilerRecorder` (chạy cả trên bản Release, không cần Development Build) và một hệ **2.000 boid** có nút chuyển giữa `IJobParallelFor` + Burst và vòng `for` thường — để thấy chênh lệch ms bằng chính overlay đó, không phải bằng cảm giác.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 360" role="img" aria-label="Hierarchy có _Perf với PerfBudget, Boids với BoidsJobDemo và 2000 Boid gốc; Package Manager có Burst, Collections, Mathematics; Inspector hiện PerfBudget frame budget 12ms, draw call budget 300, show overlay, và BoidsJobDemo count 2000, use jobs, radius 20">
  <rect x="10" y="10" width="200" height="340" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">Main Camera  (0, 25, −45)</text>
  <text x="22" y="82" class="fig-muted" font-size="12">Directional Light</text>
  <rect x="16" y="90" width="188" height="20" rx="4" fill="#ff8787" opacity="0.18"/>
  <text x="22" y="105" class="fig-label" font-size="12" font-weight="600">_Perf  └ PerfBudget</text>
  <rect x="16" y="114" width="188" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="22" y="129" class="fig-label" font-size="12" font-weight="600">Boids  └ BoidsJobDemo</text>
  <text x="22" y="151" class="fig-muted" font-size="11">Boid (Clone) ×2000 — ở ROOT, không</text>
  <text x="22" y="165" class="fig-muted" font-size="11">làm con của Boids (xem comment)</text>
  <text x="22" y="193" class="fig-label" font-size="12" font-weight="600">Package Manager</text>
  <text x="22" y="211" class="fig-muted" font-size="11">com.unity.burst          ✓ 1.8.x</text>
  <text x="22" y="227" class="fig-muted" font-size="11">com.unity.collections    ✓ 2.5.x</text>
  <text x="22" y="243" class="fig-muted" font-size="11">com.unity.mathematics    ✓ 1.3.x</text>
  <rect x="16" y="256" width="188" height="86" rx="4" class="fig-box"/>
  <text x="22" y="272" class="fig-label" font-size="11" font-weight="600">Overlay (góc trên trái khi Play)</text>
  <text x="22" y="288" fill="#51cf9b" font-size="10">CPU main  3.4 / 12 ms</text>
  <text x="22" y="302" fill="#51cf9b" font-size="10">GC alloc  0 B</text>
  <text x="22" y="316" fill="#ff8787" font-size="10">Draw calls  2003 / 300  ⚠</text>
  <text x="22" y="330" class="fig-muted" font-size="10">SetPass  6   ·   Boids: jobs 0.6 ms</text>
  <rect x="226" y="10" width="424" height="340" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#ff8787" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Perf Budget (Script)  — trên _Perf</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Frame Budget Ms</text><text x="440" y="82" class="fig-label" font-size="11">12   (≈ 83 FPS, chừa 30% cho nhiệt ở 60)</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Gc Budget Bytes</text><text x="440" y="98" class="fig-label" font-size="11">0</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Draw Call Budget</text><text x="440" y="114" class="fig-label" font-size="11">300</text>
  <text x="250" y="130" class="fig-muted" font-size="11">Show Overlay</text><text x="440" y="130" class="fig-label" font-size="11">☑</text>
  <text x="250" y="146" class="fig-muted" font-size="11">Warn Interval</text><text x="440" y="146" class="fig-label" font-size="11">1   (giây, throttle LogWarning)</text>
  <rect x="234" y="156" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="169" class="fig-label" font-size="12" font-weight="600">Boids Job Demo (Script)  — trên Boids</text>
  <text x="250" y="188" class="fig-muted" font-size="11">Count</text><text x="440" y="188" class="fig-label" font-size="11">2000</text>
  <text x="250" y="204" class="fig-muted" font-size="11">Use Jobs</text><text x="440" y="204" class="fig-label" font-size="11">☑   (nút trên màn hình đổi lúc Play)</text>
  <text x="250" y="220" class="fig-muted" font-size="11">Prefab</text><text x="440" y="220" class="fig-label" font-size="11">None  → tự tạo Cube 0.3, bỏ Collider</text>
  <text x="250" y="236" class="fig-muted" font-size="11">Radius</text><text x="440" y="236" class="fig-label" font-size="11">20</text>
  <text x="250" y="252" class="fig-muted" font-size="11">Speed</text><text x="440" y="252" class="fig-label" font-size="11">4</text>
  <rect x="234" y="262" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="275" class="fig-label" font-size="12" font-weight="600">Profiler (Window ▸ Analysis) — marker cần nhìn</text>
  <text x="250" y="294" class="fig-muted" font-size="11">Use Jobs ☐</text><text x="440" y="294" class="fig-label" font-size="11">BoidsJobDemo.Update  ≈ 3–6 ms</text>
  <text x="250" y="310" class="fig-muted" font-size="11">Use Jobs ☑</text><text x="440" y="310" class="fig-label" font-size="11">SteerJob (Burst) trên Worker 0…N</text>
  <text x="440" y="326" class="fig-label" font-size="11">main thread chỉ còn Schedule + Complete</text>
  <text x="250" y="342" class="fig-muted" font-size="10">Lần đầu Play: Burst biên dịch vài giây (Jobs ▸ Burst ▸ Enable Compilation ☑) — không phải game chậm.</text>
</svg>
<figcaption>Hai script trên hai object riêng. Overlay đỏ ở Draw calls là cố ý: 2.000 cube là 2.000 draw dù SRP Batcher gom thành ít batch — đó là lúc cần `RenderMeshInstanced` (xem thân bài), không phải tối ưu C#.</figcaption>
</figure>

**Script**

```csharp
// PerfBudget.cs — Unity 6 (6000.x). Overlay ngân sách frame qua ProfilerRecorder; chạy trên bản Release (không cần Development Build).
// Marker Render ("Draw Calls Count", "SetPass Calls Count") có thể không hợp lệ trên vài nền tảng ở Release → luôn kiểm .Valid.
using System.Text;
using Unity.Profiling;
using UnityEngine;

public class PerfBudget : MonoBehaviour
{
    [SerializeField] float frameBudgetMs = 12f;
    [SerializeField] long gcBudgetBytes = 0;
    [SerializeField] int drawCallBudget = 300;
    [SerializeField] bool showOverlay = true;
    [SerializeField] float warnInterval = 1f;              // LogWarning tối đa 1 lần/giây khi vượt

    ProfilerRecorder mainThread, gcAlloc, drawCalls, setPass;
    readonly StringBuilder sb = new(256);
    string overlayText = "";
    float nextRefresh, nextWarn;
    bool overBudget;
    GUIStyle style;

    public float MainThreadMs { get; private set; }
    public long GcBytes { get; private set; }
    public long DrawCalls { get; private set; }

    void OnEnable()
    {
        // capacity 15 → lấy trung bình 15 frame, đỡ nhấp nháy số
        mainThread = ProfilerRecorder.StartNew(ProfilerCategory.Internal, "Main Thread", 15);
        gcAlloc    = ProfilerRecorder.StartNew(ProfilerCategory.Memory, "GC Allocated In Frame");
        drawCalls  = ProfilerRecorder.StartNew(ProfilerCategory.Render, "Draw Calls Count");
        setPass    = ProfilerRecorder.StartNew(ProfilerCategory.Render, "SetPass Calls Count");
    }

    void OnDisable()
    {
        mainThread.Dispose(); gcAlloc.Dispose(); drawCalls.Dispose(); setPass.Dispose();
    }

    void Update()
    {
        MainThreadMs = AverageMs(mainThread);
        GcBytes = gcAlloc.Valid ? gcAlloc.LastValue : -1;
        DrawCalls = drawCalls.Valid ? drawCalls.LastValue : -1;

        overBudget = MainThreadMs > frameBudgetMs || GcBytes > gcBudgetBytes || DrawCalls > drawCallBudget;

        if (overBudget && Time.unscaledTime >= nextWarn)
        {
            nextWarn = Time.unscaledTime + warnInterval;
            Debug.LogWarning($"[PerfBudget] main {MainThreadMs:F1}/{frameBudgetMs} ms · GC {GcBytes} B · draw {DrawCalls}/{drawCallBudget}");
        }

        // StringBuilder.ToString() cấp phát → chỉ dựng chuỗi 4 lần/giây; frame có refresh sẽ tự hiện vài trăm byte GC — đó là overlay.
        if (showOverlay && Time.unscaledTime >= nextRefresh)
        {
            nextRefresh = Time.unscaledTime + 0.25f;
            sb.Clear();
            sb.Append("CPU main  ").Append(MainThreadMs.ToString("F1")).Append(" / ").Append(frameBudgetMs).Append(" ms\n");
            sb.Append("GC alloc  ").Append(GcBytes < 0 ? "n/a" : GcBytes.ToString()).Append(" B\n");
            sb.Append("Draw calls  ").Append(DrawCalls < 0 ? "n/a" : DrawCalls.ToString()).Append(" / ").Append(drawCallBudget).Append('\n');
            sb.Append("SetPass  ").Append(setPass.Valid ? setPass.LastValue.ToString() : "n/a");
            overlayText = sb.ToString();
        }
    }

    static float AverageMs(ProfilerRecorder r)
    {
        int n = r.Count;
        if (!r.Valid || n == 0) return -1f;
        double sum = 0;
        for (int i = 0; i < n; i++) sum += r.GetSample(i).Value;   // nanosecond
        return (float)(sum / n * 1e-6);
    }

    void OnGUI()
    {
        if (!showOverlay) return;
        style ??= new GUIStyle(GUI.skin.label) { fontSize = 16, fontStyle = FontStyle.Bold };
        style.normal.textColor = overBudget ? new Color(1f, 0.53f, 0.53f) : new Color(0.32f, 0.81f, 0.61f);
        GUI.Label(new Rect(10, 10, 400, 100), overlayText, style);
    }
}
```

```csharp
// BoidsJobDemo.cs — Unity 6 (6000.x). CẦN package: com.unity.burst, com.unity.collections, com.unity.mathematics (Package Manager ▸ Unity Registry).
// 2000 boid quay quanh tâm trong bán kính 20. Nút trên màn hình đổi giữa IJobParallelFor+Burst và vòng for thường — cùng thuật toán.
using Unity.Burst;
using Unity.Collections;
using Unity.Jobs;
using Unity.Mathematics;
using UnityEngine;
using UnityEngine.Jobs;

public class BoidsJobDemo : MonoBehaviour
{
    [SerializeField] int count = 2000;
    [SerializeField] bool useJobs = true;
    [SerializeField] Transform prefab;                 // trống → tự tạo cube 0.3 không collider
    [SerializeField] float radius = 20f;
    [SerializeField] float speed = 4f;

    NativeArray<float3> positions, velocities;
    TransformAccessArray transforms;                   // ghi vị trí trên worker thread — không gán transform.position trong for
    Transform[] managed;                               // cho nhánh không job
    JobHandle handle;
    float frameStart, lastMs;
    string label = "";
    float nextLabel;

    [BurstCompile]
    struct SteerJob : IJobParallelFor
    {
        public NativeArray<float3> positions;
        public NativeArray<float3> velocities;
        public float dt, radius, speed;

        public void Execute(int i)
        {
            float3 p = positions[i], v = velocities[i];
            float3 swirl = math.cross(math.up(), math.normalizesafe(p)) * speed;             // quay quanh trục Y
            float3 pull  = math.lengthsq(p) > radius * radius ? -math.normalize(p) * speed : float3.zero;   // ra khỏi bán kính → kéo về
            v = math.normalizesafe(v + (swirl + pull) * dt) * speed;
            positions[i]  = p + v * dt;
            velocities[i] = v;
        }
    }

    [BurstCompile]
    struct WriteTransformJob : IJobParallelForTransform
    {
        [ReadOnly] public NativeArray<float3> positions;
        [ReadOnly] public NativeArray<float3> velocities;

        public void Execute(int i, TransformAccess t)
        {
            t.position = positions[i];
            t.rotation = quaternion.LookRotationSafe(velocities[i], math.up());
        }
    }

    void Start()
    {
        positions  = new NativeArray<float3>(count, Allocator.Persistent);   // sống nhiều frame → Persistent, Dispose ở OnDestroy
        velocities = new NativeArray<float3>(count, Allocator.Persistent);
        transforms = new TransformAccessArray(count);
        managed    = new Transform[count];

        var rng = new Unity.Mathematics.Random(1234);
        for (int i = 0; i < count; i++)
        {
            positions[i]  = rng.NextFloat3Direction() * rng.NextFloat(0f, radius);
            velocities[i] = rng.NextFloat3Direction() * speed;
            Transform t = prefab != null ? Instantiate(prefab) : MakeCube();
            t.name = "Boid";
            // Để ở ROOT: IJobParallelForTransform chỉ chạy song song giữa các cây hierarchy khác nhau —
            // 2000 con của cùng một parent sẽ chạy tuần tự trên một worker.
            t.SetPositionAndRotation(positions[i], Quaternion.identity);
            transforms.Add(t);
            managed[i] = t;
        }
    }

    static Transform MakeCube()
    {
        var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
        Destroy(go.GetComponent<Collider>());          // 2000 BoxCollider di chuyển = Physics cập nhật broadphase vô ích
        go.transform.localScale = Vector3.one * 0.3f;
        return go.transform;
    }

    void Update()
    {
        frameStart = Time.realtimeSinceStartup;
        float dt = Time.deltaTime;

        if (useJobs)
        {
            var steer = new SteerJob { positions = positions, velocities = velocities, dt = dt, radius = radius, speed = speed };
            JobHandle h = steer.Schedule(count, 64);                               // batch 64: 2000/64 ≈ 32 gói chia cho worker
            var write = new WriteTransformJob { positions = positions, velocities = velocities };
            handle = write.Schedule(transforms, h);                                // phụ thuộc h; Complete ở LateUpdate
            return;
        }

        // Nhánh thường: cùng phép toán, chạy trên main thread, ghi transform từng cái
        for (int i = 0; i < count; i++)
        {
            Vector3 p = positions[i], v = velocities[i];
            Vector3 swirl = Vector3.Cross(Vector3.up, p.normalized) * speed;
            Vector3 pull  = p.sqrMagnitude > radius * radius ? -p.normalized * speed : Vector3.zero;
            v = (v + (swirl + pull) * dt).normalized * speed;
            p += v * dt;
            positions[i] = p; velocities[i] = v;
            managed[i].SetPositionAndRotation(p, v.sqrMagnitude > 1e-6f ? Quaternion.LookRotation(v) : Quaternion.identity);
        }
        lastMs = (Time.realtimeSinceStartup - frameStart) * 1000f;
    }

    void LateUpdate()
    {
        if (useJobs)
        {
            handle.Complete();                          // main thread rảnh suốt Update của script khác; giờ mới chờ
            lastMs = (Time.realtimeSinceStartup - frameStart) * 1000f;   // gồm cả phần chờ — công bằng với nhánh for
        }
        if (Time.unscaledTime >= nextLabel)             // dựng chuỗi 4 lần/giây để không tự sinh GC mỗi frame
        {
            nextLabel = Time.unscaledTime + 0.25f;
            label = $"Boids ({count}): {(useJobs ? "JOBS+BURST" : "for thường")}  {lastMs:F2} ms  —  bấm để đổi";
        }
    }

    void OnGUI()
    {
        if (GUI.Button(new Rect(10, 120, 420, 32), label))
        {
            handle.Complete();                          // đổi chế độ giữa frame: chắc chắn không còn job đang chạm NativeArray
            useJobs = !useJobs;
        }
    }

    void OnDestroy()
    {
        handle.Complete();                              // Dispose khi job còn chạy → lỗi safety system
        if (positions.IsCreated)  positions.Dispose();
        if (velocities.IsCreated) velocities.Dispose();
        if (transforms.isCreated) transforms.Dispose();
    }
}
```

**Chạy thử**
- Play với `Use Jobs ☐`: nút ghi khoảng **3–6 ms** (tuỳ CPU) và Profiler ▸ CPU ▸ Timeline hiện `BoidsJobDemo.Update` một khối dài trên main thread. Bấm nút: số tụt xuống **0.3–0.8 ms**, Timeline hiện `SteerJob (Burst)` và `WriteTransformJob` rải trên Worker 0…N, main thread chỉ còn `Schedule` và một `Complete` ngắn ở `LateUpdate`.
- Đổi `handle.Complete()` từ `LateUpdate` sang ngay sau `Schedule` trong `Update`: số ms tăng gấp ~2 — đó là bẫy ở mục 🤖: Burst vẫn nhanh nhưng main thread đứng chờ.
- Overlay `PerfBudget`: `GC alloc 0 B` ở hầu hết frame (frame có refresh chuỗi lên vài trăm byte — do chính overlay); `Draw calls ≈ 2003 / 300` **đỏ** và Console một `LogWarning` mỗi giây, không nhiều hơn. Đổi `Count` = 250 → về xanh.
- Mở Jobs ▸ Burst ▸ *Enable Compilation* ☐ rồi Play lại với jobs: ms tăng 5–10 lần — phần lớn lợi ích đến từ Burst, không phải từ đa luồng.
- Đưa 2000 boid làm con của `Boids` (sửa `t.SetParent(transform)`): nhánh jobs chậm đi rõ vì `IJobParallelForTransform` chỉ song song hoá giữa các root khác nhau.
