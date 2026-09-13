---
title: Tối ưu CPU — giải phẫu main thread
icon: 🧠
summary: Một frame gồm những gì, tên nào trong Profiler ứng với khoản nợ nào, và ba đòn bẩy lớn — tick theo ngân sách, LOD cho logic, bỏ việc thay vì làm nhanh hơn.
status: deep
read: 742
level: advanced
order: 142
tags: [unity, performance, cpu, optimization]
related: [unity-optimization, unity-profiling, unity-csharp-memory, unity-dots-jobs, unity-physics]
---

Phần lớn thời gian bị phí khi tối ưu CPU đến từ việc sửa **nhầm loại chi phí**. Trên main thread có ba loại, và chúng đòi ba cách chữa khác hẳn nhau:

| Loại | Trông thế nào trong Profiler | Chữa bằng |
|---|---|---|
| **Overhead gọi hàm** | Nhiều dòng nhỏ, Self thấp, số lần gọi cực lớn | Gọi ít lại: tick tập trung, bỏ `Update` rỗng |
| **Việc thật** | Một vài dòng Self cao | Thuật toán tốt hơn, làm ít hơn, hoặc đẩy sang job |
| **Chờ** | `Gfx.WaitForPresentOnGfxThread`, `GC.Collect`, `Semaphore.WaitForSignal` | Không phải lỗi CPU: xem [[unity-gpu-optimization]], [[unity-csharp-memory]], [[unity-dots-jobs]] |

Nhìn nhầm loại thứ ba thành loại thứ hai là chuyện xảy ra hằng ngày: người ta thấy main thread "bận" 20ms rồi đi tối ưu code C#, trong khi 14ms trong đó là đứng đợi GPU.

## Một frame gồm gì

Thứ tự trong PlayerLoop, và tên bạn sẽ thấy trong Profiler:

| Giai đoạn | Tên trong Profiler | Chứa gì |
|---|---|---|
| Physics | `FixedUpdate.PhysicsFixedUpdate`, `Physics.Processing` | `FixedUpdate` của script, solver, va chạm — chạy 0…n lần mỗi frame |
| Logic | `BehaviourUpdate` | Mọi `Update()` |
| Coroutine | `DelayedCallManager.Update` | `yield return null` và bạn bè |
| Sau logic | `BehaviourLateUpdate` | Mọi `LateUpdate()`, camera bám |
| Animation | `Animator.Update`, `MeshSkinning.Update` | State machine, blend, skinning |
| UI | `Canvas.SendWillRenderCanvases`, `Canvas.BuildBatch` | Layout và dựng lại mesh UI |
| Culling & vẽ | `Camera.Render`, `CullResults.CreateSharedRendererScene` | Chuẩn bị lệnh vẽ cho render thread |

Biết bảng này đổi cách bạn tìm: thấy `BehaviourUpdate` 9ms thì vấn đề ở script; thấy `Canvas.BuildBatch` 6ms thì mọi tối ưu script đều vô ích, vấn đề ở [[unity-ui]]; thấy `Physics.Processing` cao thì sang [[unity-physics]].

## Đòn bẩy 1: gọi ít lại

Mỗi `Update()` là một lần chuyển từ engine (native) sang C# (managed), khoảng **0,5µs** ngay cả khi thân hàm rỗng. 500 script là **0,25ms mỗi frame khi chưa làm gì cả**, và con số đó không xuất hiện ở bất kỳ dòng nào bạn nghi ngờ — nó rải đều trong `BehaviourUpdate`.

Ba mức, làm theo thứ tự:

1. **Xoá `Update()` rỗng** — còn để trống vẫn bị gọi. Đây là mức rẻ nhất và hay bị bỏ qua nhất.
2. **Tick tập trung**: một manager giữ `List<ITickable>` và gọi trong một vòng `for`. Đổi 500 lần chuyển native→managed thành **một**. Phần thưởng kèm theo là thứ tự tick trở nên **xác định** — bạn không còn phụ thuộc vào Script Execution Order.
3. **Tick theo tần suất**, ở đòn bẩy 2 bên dưới.

Ngưỡng thực dụng: dưới ~100 script thì việc này không đáng làm; trên 500 thì nó hiện rõ trong Profiler. Và nhớ rằng nó chỉ cắt **overhead**, không cắt việc thật — nếu mỗi enemy đang tính đường đi mỗi frame thì vấn đề nằm ở đòn bẩy tiếp theo.

## Đòn bẩy 2: LOD cho logic

Đây là đòn bẩy lớn nhất và ít được nói nhất. Hình ảnh có LOD; **logic cũng nên có**. Không có lý do gì để một con quái ở cách 80 mét, sau lưng người chơi, được cập nhật 60 lần mỗi giây.

| Khoảng cách / trạng thái | Tần suất tick | Làm gì |
|---|---|---|
| Đang đánh nhau, trong tầm nhìn | Mỗi frame | Đầy đủ: AI, animation, va chạm |
| Gần nhưng chưa giao chiến (< 30m) | 10 Hz | AI rút gọn, bỏ tìm đường chi tiết |
| Xa (30–80m) | 2 Hz | Chỉ trạng thái tổng quát, di chuyển nội suy |
| Ngoài tầm nhìn / rất xa | 0 — hoặc mô phỏng tổng hợp | Tắt Animator, tắt collider, cập nhật theo mẻ |

Cắt từ 60 Hz xuống 10 Hz là **giảm 83% công việc** của nhóm đó — không một vi tối ưu nào trong hàm tick sánh được. Hai điều cần xử lý cho tử tế: **rải pha** (đừng để cả 200 quái cùng tick ở một frame — chia theo `id % n`, nếu không bạn đổi tải đều thành spike mỗi 6 frame), và **nội suy hiển thị** để mắt không thấy giật khi tick thưa.

Cùng họ với nó là mấy quyết định "bỏ việc" khác, và chúng thường thắng mọi thứ khác cộng lại:

- Không tính thứ không ai nhìn thấy: `OnBecameInvisible`, kiểm tra frustum, hoặc đơn giản là khoảng cách.
- Không kiểm tra thứ hiếm khi đổi mỗi frame: sự kiện thay cho polling.
- Không tìm kiếm cái đã biết: một runtime set (xem [[unity-design-patterns]]) thay cho `FindObjectsByType` mỗi frame.

## Đòn bẩy 3: ngân sách theo mili giây, không theo frame

"Chia việc ra mỗi frame làm một ít" thường được viết thành *mỗi frame xử lý 10 phần tử* — con số đó đúng trên máy bạn và sai trên mọi máy khác. Cách đúng là **ngân sách thời gian**: làm cho tới khi hết 2ms của frame này rồi dừng, phần còn lại để frame sau.

```csharp
var sw = Stopwatch.StartNew();
while (queue.Count > 0 && sw.Elapsed.TotalMilliseconds < budgetMs)
    Process(queue.Dequeue());
```

Dùng cho: sinh địa hình, bake dữ liệu, spawn hàng loạt, parse file lớn, dựng UI danh sách dài. Người chơi thấy loading bar nhích còn hơn đóng băng 3 giây — cùng một tổng thời gian, cảm giác khác hẳn.

## Những khoản nợ quen mặt

**`Instantiate` và `Destroy`** là spike, không phải chi phí đều: tạo 200 viên đạn cùng lúc là một frame 30ms. Pool bằng `UnityEngine.Pool.ObjectPool<T>` có sẵn từ 2021, **pre-warm** lúc load, và nhớ rằng `SetActive(true/false)` cũng không miễn phí trên cây con sâu — pool nên đặt object ra xa camera thay vì bật tắt nếu cây con lớn.

**`GetComponent` và tìm kiếm.** Cache trong `Awake`. Khi phải kiểm tra sự tồn tại, dùng `TryGetComponent` — nó **không cấp phát** khi không tìm thấy, còn `GetComponent` trả `null` thì trong Editor có thể tạo rác cho thông báo lỗi. `GetComponentsInChildren<T>()` tạo mảng mới mỗi lần gọi; dùng overload nhận sẵn `List<T>`.

**Transform.** `SetParent` và đổi vị trí làm bẩn (dirty) cả cây con — cây UI sâu là nơi việc này đắt nhất. Giữ hierarchy phẳng ở chỗ nóng, gom vị trí vào biến cục bộ rồi gán một lần thay vì `transform.position += v` nhiều lần (mỗi lần là một cặp gọi native).

**Chuỗi và log.** `Debug.Log` **vẫn chạy trên bản Release** và kéo theo format chuỗi cùng stack trace. Bọc trong hàm `[Conditional("UNITY_EDITOR")]`, hoặc tắt bằng `Debug.unityLogger.logEnabled` — chi tiết ở [[unity-csharp-memory]].

**`SendMessage` và `BroadcastMessage`**: tra hàm theo tên bằng reflection, chậm hơn gọi trực tiếp hàng chục lần và không có lỗi biên dịch khi đổi tên. Không có lý do nào để giữ chúng trong code mới.

## Khi nào mới nên đa luồng

Thứ tự đúng là: **bỏ việc → làm việc ít hơn → làm nhanh hơn → làm song song**. Đẩy một thuật toán tồi sang job chỉ làm nó tồi trên bốn lõi, và trả thêm chi phí lập lịch cùng độ phức tạp.

Job + Burst đáng khi việc đó **thuần dữ liệu, số lượng lớn, không chạm API Unity**: mô phỏng hàng nghìn phần tử, lưới tìm đường, culling tự viết, biến dạng mesh. Ngưỡng thực dụng là **vài nghìn phần tử trở lên** — dưới đó chi phí chia việc lớn hơn công việc. Chi tiết và bốn luật an toàn ở [[unity-dots-jobs]].

Và nhớ ranh giới cứng: **API Unity chỉ gọi được trên main thread** (trừ đường `TransformAccess`). Nghĩa là phần lớn code gameplay không đi song song được, nên đòn bẩy 1–3 ở trên mới là nơi bạn thật sự kiếm được mili giây.

## Bẫy lộ ra khi build

- `Debug.Log` còn trong đường nóng: Editor nuốt được, thiết bị thì không.
- Đo trong Editor: `BehaviourUpdate` ở đó gồm cả script của Editor và kiểm tra an toàn (null check của Unity đắt hơn trên bản Debug).
- Tick manager nhưng quên **rải pha**: tải trung bình đẹp, cứ 6 frame một spike.
- Pool nhưng không reset đủ trạng thái: viên đạn thứ hai mang theo trail của viên trước — xem [[unity-design-patterns]].
- Coroutine sinh sôi: mỗi enemy một coroutine `while(true)` là 200 mục trong `DelayedCallManager`, cộng một object enumerator mỗi lần khởi động lại.

## Kiểm tra nhanh

- [ ] Đếm số `Update()` trong dự án: bao nhiêu cái **thật sự** cần chạy 60 lần mỗi giây?
- [ ] Có tick theo tần suất (LOD logic) cho nhóm đông nhất chưa?
- [ ] Việc nặng chạy theo **ngân sách ms**, không theo "mỗi N frame"
- [ ] Không còn `FindObjectsByType`, `SendMessage`, `GetComponent` trong `Update`
- [ ] Spawn hàng loạt đi qua pool đã pre-warm
- [ ] Đã kiểm tra `Gfx.WaitForPresentOnGfxThread` **trước khi** kết luận CPU-bound

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc tối ưu CPU**

Điểm mù cố hữu: AI không biết **cái gì chạy bao nhiêu lần**. Nó đọc một file rồi tối ưu thứ nhìn "xấu" — thường là vi tối ưu vô hại như đổi `foreach` thành `for` — trong khi thứ đáng sửa là một hàm được gọi 200 lần mỗi frame ở file khác. Nó cũng gần như không bao giờ tự đề xuất **bỏ việc** (giảm tần suất, cắt theo khoảng cách), vì đó là quyết định thiết kế chứ không phải quyết định code.

Nên chia việc: bạn mang **số đo và tần suất gọi**, nó mang phương án. Hỏi đúng cách là *"hàm này chạy 200 lần/frame, Self 4ms — liệt kê phương án theo thứ tự **ms tiết kiệm được**, có cả phương án giảm tần suất chứ không chỉ phương án viết lại"*.

Ba việc nó làm tốt ngay: viết **tick manager kèm rải pha**, viết **hàng đợi có ngân sách ms**, và soát một file để chỉ ra cấp phát cùng lời gọi lặp thừa.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Hàm chạy **bao nhiêu lần mỗi frame**, với bao nhiêu đối tượng.
- Self ms và Total ms lấy từ Profiler, đo trên thiết bị nào.
- Ngân sách frame mục tiêu, tính bằng ms.
- Được phép đổi hành vi tới đâu: giảm tần suất cập nhật có chấp nhận được không?
- Có được thêm package (Collections, Burst) không.

**Mẫu prompt**

```
Unity 6, Android tầm trung. Profiler (bản Development, trên máy):
BehaviourUpdate 9,2 ms, trong đó EnemyBrain.Update Self 6,1 ms / 180 lần gọi.
Ngân sách 16,6 ms, hiện 24 ms. File: <dán>

Liệt kê phương án theo thứ tự ƯỚC LƯỢNG MS TIẾT KIỆM, gồm cả:
- phương án GIẢM TẦN SUẤT (tick theo khoảng cách, rải pha) chứ không chỉ viết lại code
- phương án bỏ hẳn việc (không tính thứ ngoài tầm nhìn)
Với mỗi phương án: đổi hành vi gì, rủi ro gì, đo lại bằng marker nào.
KHÔNG đề xuất Jobs/ECS trừ khi số phần tử vượt vài nghìn — nói rõ vì sao nếu đề xuất.
```

**Bẫy thường gặp:** AI đề xuất **Jobs hoặc DOTS cho 180 đối tượng** vì đó là câu trả lời "đúng sách" cho từ khoá "tối ưu". Ở quy mô này, chi phí lập lịch cộng với việc phải bỏ mọi API Unity (Transform, GetComponent, Animator) thường ăn hết phần tiết kiệm, còn bạn thì trả bằng một kiến trúc phức tạp hơn nhiều. Ràng buộc "không đề xuất Jobs dưới vài nghìn phần tử" nên viết thẳng vào prompt — và nếu nó vẫn đề xuất, bắt nó ước lượng ms tiết kiệm để tự thấy con số không thuyết phục.

## 💻 Code

Demo dựng `TickManager` gói cả ba đòn bẩy vào một chỗ: **một** lời gọi thay cho N lần `Update`, **tần suất theo khoảng cách** (mỗi frame / 10 Hz / 2 Hz / tắt), **rải pha** để không dồn spike, và một hàng đợi việc nặng chạy theo **ngân sách mili giây**. Kèm marker để thấy ngay hiệu quả trong Profiler.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 290" role="img" aria-label="Inspector của TickManager với ngưỡng khoảng cách và bảng bậc tick, kèm Hierarchy có TickManager và 1000 enemy">
  <rect x="10" y="10" width="220" height="270" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="230" y2="42" class="fig-line"/>
  <rect x="16" y="52" width="198" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="24" y="67" class="fig-label" font-size="12" font-weight="600">TickManager</text>
  <text x="24" y="88" class="fig-muted" font-size="11">Player  (Viewer)</text>
  <text x="24" y="106" class="fig-muted" font-size="11">▾ Enemies</text>
  <text x="38" y="122" class="fig-muted" font-size="11">1000 × TickedEnemy</text>
  <line x1="10" y1="138" x2="230" y2="138" class="fig-line"/>
  <text x="22" y="158" class="fig-label" font-size="12" font-weight="600">So sánh trong Profiler</text>
  <text x="22" y="178" class="fig-muted" font-size="11">Bản cũ: BehaviourUpdate</text>
  <text x="32" y="192" class="fig-muted" font-size="11">1000 lời gọi rải rác</text>
  <text x="22" y="212" class="fig-muted" font-size="11">Bản mới: Game.Tick</text>
  <text x="32" y="226" class="fig-muted" font-size="11">1 lời gọi, đọc được ms ngay</text>
  <text x="22" y="250" class="fig-muted" font-size="10">Marker là thứ cho phép so</text>
  <text x="22" y="264" class="fig-muted" font-size="10">trước/sau bằng con số, không</text>
  <text x="22" y="278" class="fig-muted" font-size="10">bằng cảm giác.</text>
  <rect x="246" y="10" width="404" height="270" rx="8" class="fig-box"/>
  <text x="258" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="246" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="254" y="50" width="388" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="262" y="63" class="fig-label" font-size="12" font-weight="600">Tick Manager (Script)</text>
  <text x="270" y="82" class="fig-muted" font-size="11">Viewer</text><text x="470" y="82" class="fig-label" font-size="11">Player (Transform)</text>
  <text x="270" y="98" class="fig-muted" font-size="11">Near Distance</text><text x="470" y="98" class="fig-label" font-size="11">30 m — tick mỗi frame</text>
  <text x="270" y="114" class="fig-muted" font-size="11">Far Distance</text><text x="470" y="114" class="fig-label" font-size="11">80 m — tick 10 Hz</text>
  <text x="270" y="130" class="fig-muted" font-size="11">Cull Distance</text><text x="470" y="130" class="fig-label" font-size="11">150 m — ngừng tick hẳn</text>
  <text x="270" y="146" class="fig-muted" font-size="11">Work Budget Ms</text><text x="470" y="146" class="fig-label" font-size="11">2,0 ms mỗi frame</text>
  <text x="270" y="162" class="fig-muted" font-size="11">Reclassify Per Frame</text><text x="470" y="162" class="fig-label" font-size="11">64 (rải việc đo khoảng cách)</text>
  <rect x="254" y="176" width="388" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="262" y="189" class="fig-label" font-size="12" font-weight="600">Bốn bậc tick</text>
  <text x="270" y="208" class="fig-muted" font-size="11">Bậc 0  &lt; 30 m</text><text x="470" y="208" class="fig-label" font-size="11">mỗi frame</text>
  <text x="270" y="224" class="fig-muted" font-size="11">Bậc 1  30–80 m</text><text x="470" y="224" class="fig-label" font-size="11">10 Hz — giảm 83% công việc</text>
  <text x="270" y="240" class="fig-muted" font-size="11">Bậc 2  80–150 m</text><text x="470" y="240" class="fig-label" font-size="11">2 Hz</text>
  <text x="270" y="256" class="fig-muted" font-size="11">Bậc 3  &gt; 150 m</text><text x="470" y="256" class="fig-label" font-size="11">không tick</text>
  <text x="262" y="276" class="fig-muted" font-size="10">Rải pha theo chỉ số đăng ký: không để cả nhóm cùng tick ở một frame.</text>
</svg>
<figcaption>Ba đòn bẩy nằm trong một component: gọi ít lại, tick theo khoảng cách, và ngân sách ms cho việc nặng.</figcaption>
</figure>

**Script**

```csharp
// ITickable.cs
using UnityEngine;

public interface ITickable
{
    /// Dùng để tính khoảng cách tới viewer. Trả null nếu luôn cần tick mỗi frame.
    Transform Anchor { get; }
    void Tick(float dt);
}
```

```csharp
// TickManager.cs — Unity 6. Đặt trên một GameObject ở scene Boot.
using System;
using System.Collections.Generic;
using System.Diagnostics;
using Unity.Profiling;
using UnityEngine;
using Debug = UnityEngine.Debug;

public class TickManager : MonoBehaviour
{
    public static TickManager Instance { get; private set; }

    [SerializeField] Transform viewer;
    [SerializeField] float nearDistance = 30f;
    [SerializeField] float farDistance = 80f;
    [SerializeField] float cullDistance = 150f;
    [SerializeField] float workBudgetMs = 2f;
    [SerializeField] int reclassifyPerFrame = 64;

    static readonly ProfilerMarker TickMarker = new("Game.Tick");
    static readonly ProfilerMarker BudgetMarker = new("Game.BudgetedWork");

    // Bậc 0: mỗi frame · 1: 10 Hz · 2: 2 Hz · 3: không tick
    static readonly float[] Interval = { 0f, 0.1f, 0.5f, float.PositiveInfinity };

    sealed class Entry
    {
        public ITickable Target;
        public int Tier;
        public float Accum;
        public int Phase;
    }

    readonly List<Entry> entries = new(256);
    readonly Queue<Action> heavyWork = new();
    readonly Stopwatch sw = new();
    int cursor;

    void Awake()
    {
        if (Instance != null && Instance != this) { Destroy(gameObject); return; }
        Instance = this;
    }

    void OnDestroy() { if (Instance == this) Instance = null; }

    public void Register(ITickable t)
    {
        // Phase = chỉ số đăng ký: hai object liền nhau sẽ tick lệch pha nhau.
        entries.Add(new Entry { Target = t, Phase = entries.Count });
    }

    public void Unregister(ITickable t)
    {
        // Vòng for thường, không LINQ/lambda: hàm này chạy lúc destroy hàng loạt.
        for (int i = entries.Count - 1; i >= 0; i--)
            if (ReferenceEquals(entries[i].Target, t)) entries.RemoveAt(i);
    }

    /// Việc nặng không cần xong ngay: sinh lưới, parse, dựng UI danh sách dài.
    public void EnqueueHeavy(Action work) => heavyWork.Enqueue(work);

    void Update()
    {
        float dt = Time.deltaTime;

        using (TickMarker.Auto())
        {
            ReclassifySlice();                       // rải việc đo khoảng cách ra nhiều frame

            for (int i = 0; i < entries.Count; i++)
            {
                var e = entries[i];
                if (e.Tier == 0) { e.Target.Tick(dt); continue; }
                if (e.Tier >= 3) continue;           // quá xa: không tick

                e.Accum += dt;
                if (e.Accum < Interval[e.Tier]) continue;
                e.Target.Tick(e.Accum);              // truyền dt THẬT của lần tick này
                e.Accum = 0f;
            }
        }

        using (BudgetMarker.Auto()) RunHeavyWork();
    }

    /// Mỗi frame chỉ phân loại lại một lát danh sách — 1000 phép đo khoảng cách
    /// mỗi frame cũng là chi phí, và nó không cần chính xác tới từng frame.
    void ReclassifySlice()
    {
        if (viewer == null || entries.Count == 0) return;
        int n = Mathf.Min(reclassifyPerFrame, entries.Count);
        Vector3 eye = viewer.position;

        for (int k = 0; k < n; k++)
        {
            cursor = (cursor + 1) % entries.Count;
            var e = entries[cursor];
            var anchor = e.Target.Anchor;
            if (anchor == null) { e.Tier = 0; continue; }

            float d = Vector3.Distance(eye, anchor.position);
            int tier = d < nearDistance ? 0 : d < farDistance ? 1 : d < cullDistance ? 2 : 3;
            if (tier == e.Tier) continue;

            e.Tier = tier;
            // Lệch pha khi đổi bậc: nếu không, cả nhóm vừa đổi bậc sẽ tick cùng một frame.
            e.Accum = tier >= 1 && tier <= 2 ? Interval[tier] * ((e.Phase % 8) / 8f) : 0f;
        }
    }

    /// Làm việc nặng cho tới khi hết ngân sách của frame này — KHÔNG phải "mỗi frame N phần tử",
    /// vì N đúng trên máy bạn và sai trên mọi máy khác.
    void RunHeavyWork()
    {
        if (heavyWork.Count == 0) return;
        sw.Restart();
        while (heavyWork.Count > 0 && sw.Elapsed.TotalMilliseconds < workBudgetMs)
            heavyWork.Dequeue().Invoke();
        sw.Stop();
    }
}
```

```csharp
// TickedEnemy.cs — thay cho một MonoBehaviour có Update().
using UnityEngine;

public class TickedEnemy : MonoBehaviour, ITickable
{
    public Transform Anchor => transform;

    void OnEnable()  => TickManager.Instance?.Register(this);
    void OnDisable() => TickManager.Instance?.Unregister(this);

    public void Tick(float dt)
    {
        // Việc thật của enemy. dt là thời gian TỪ LẦN TICK TRƯỚC, không phải Time.deltaTime —
        // nên mọi phép nhân theo thời gian vẫn đúng khi đang tick ở 10 Hz hay 2 Hz.
        transform.Rotate(0f, 20f * dt, 0f);
    }
}
```

**Chạy thử**
- Spawn 1000 `TickedEnemy` quanh player, Play, mở Profiler → Hierarchy: chỉ còn **một** dòng `Game.Tick` đọc được ms, thay vì 1000 lời gọi rải trong `BehaviourUpdate`.
- Cho player đi xa dần: số enemy ở bậc 0 giảm, `Game.Tick` tụt theo — đó là **LOD cho logic** hiện thành con số, không phải lời hứa.
- Tắt rải pha (đặt `e.Accum = 0f` cho mọi bậc) rồi xem lại biểu đồ frame: xuất hiện đúng cái spike chu kỳ mà rải pha sinh ra để tránh.
- Thử `TickManager.Instance.EnqueueHeavy(...)` với 500 việc nặng: frame time tăng đúng khoảng `Work Budget Ms`, không phải một cú đóng băng — nhìn marker `Game.BudgetedWork` để xác nhận.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **500 script đều có `Update()` rỗng thì tốn gì?**
  → Mỗi `Update` là một lần chuyển từ engine sang C#, khoảng **0,5µs** kể cả khi thân hàm rỗng — 500 script là **0,25 ms mỗi frame khi chưa làm gì**. Tệ hơn là nó rải đều trong `BehaviourUpdate` nên không hiện ra ở dòng nào bạn nghi ngờ. Cách chữa rẻ nhất là xoá `Update` rỗng; sau đó mới tới tick tập trung.
- `Junior` **`GetComponent` gọi trong `Update` có sao không?**
  → Có: nó duyệt danh sách component của object mỗi lần gọi. Cache trong `Awake` là đủ cho 99% trường hợp. Khi phải kiểm tra sự tồn tại thì dùng `TryGetComponent` — nó không cấp phát khi không tìm thấy. Và `GetComponentsInChildren<T>()` tạo mảng mới mỗi lần, nên dùng overload nhận sẵn `List<T>`.
- `Junior` **Nhìn tên nào trong Profiler để biết vấn đề nằm ở script hay ở UI?**
  → `BehaviourUpdate` là toàn bộ `Update()` của script; `Canvas.SendWillRenderCanvases` và `Canvas.BuildBatch` là UI dựng lại mesh; `Physics.Processing` là solver; `Animator.Update` và `MeshSkinning.Update` là animation. Thấy `Canvas.BuildBatch` 6 ms thì mọi tối ưu script đều vô ích — vấn đề nằm ở cách tách Canvas.
- `Mid` **Có 200 enemy, mỗi con tính đường đi mỗi frame. Anh làm gì trước?**
  → Không tối ưu hàm tính đường trước — **giảm tần suất** trước. Enemy ngoài tầm nhìn hoặc cách xa 30 m không cần cập nhật 60 lần/giây: cắt xuống 10 Hz là bỏ 83% công việc của nhóm đó, nhiều hơn mọi vi tối ưu trong hàm. Hai thứ phải làm kèm: **rải pha** theo chỉ số để không dồn tất cả vào một frame, và nội suy hiển thị để mắt không thấy giật.
- `Mid` **Chia việc nặng ra nhiều frame thế nào cho đúng?**
  → Theo **ngân sách mili giây**, không theo "mỗi frame N phần tử": làm tới khi hết 2 ms của frame này rồi dừng, phần còn lại để frame sau. Lý do là N đúng trên máy bạn và sai trên máy yếu hơn — cùng một code, máy yếu sẽ khựng. Dùng cho sinh địa hình, spawn hàng loạt, parse file lớn, dựng UI danh sách dài.
- `Mid` **`Instantiate` 200 viên đạn cùng lúc bị khựng. Sửa sao?**
  → Đó là **spike**, không phải chi phí đều, nên pool là câu trả lời: `UnityEngine.Pool.ObjectPool<T>` có sẵn từ 2021, cộng **pre-warm** lúc load để không trả giá ở lần bắn đầu. Lưu ý `SetActive` trên cây con sâu cũng không miễn phí — với prefab lớn, đưa object ra xa camera rẻ hơn bật/tắt. Và pool phải **reset đủ trạng thái**: trail, particle, vận tốc, coroutine đang chạy.
- `Senior` **Khi nào anh chuyển sang Job System?**
  → Sau khi đã đi hết ba bước rẻ hơn: **bỏ việc → làm ít hơn → làm nhanh hơn**, rồi mới **làm song song**. Job đáng khi việc đó thuần dữ liệu, không chạm API Unity, và có **vài nghìn phần tử trở lên**; dưới ngưỡng đó chi phí lập lịch ăn hết phần tiết kiệm. Và nhớ ranh giới cứng: API Unity chỉ gọi được trên main thread, nên phần lớn code gameplay không đi song song được.
- `Senior` **Main thread bận 20 ms. Anh kết luận CPU-bound ngay chứ?**
  → Không. Phải nhìn xem trong 20 ms đó có bao nhiêu là **đứng đợi**: `Gfx.WaitForPresentOnGfxThread` là đợi GPU, `GC.Collect` là đợi thu gom rác, `Semaphore.WaitForSignal` là đợi worker. Đi tối ưu code C# khi 14 ms là đợi GPU thì sửa cả tuần cũng không đổi gì — lúc đó việc cần làm nằm ở phía GPU.
- `Senior` **Tick manager có nhược điểm gì?**
  → Ba cái. Thứ tự tick trở thành trách nhiệm của bạn (đổi lại là nó **xác định**, không còn phụ thuộc Script Execution Order). Object phải tự đăng ký và **huỷ đăng ký trong `OnDisable`**, quên là giữ tham chiếu tới object đã destroy. Và nó chỉ cắt **overhead gọi hàm** — nếu mỗi tick vẫn làm việc nặng thì nó không cứu được gì, lúc đó phải quay lại giảm tần suất hoặc sửa thuật toán.

**Khung trả lời 60 giây** — "Game CPU-bound, anh làm gì?"

> Trước hết xác nhận **đúng là CPU-bound**: nhìn Timeline xem main thread có đang đợi GPU (`Gfx.WaitForPresentOnGfxThread`) hay đợi GC không. Nếu đúng là CPU thì sang Hierarchy, sắp theo **Self**, và phân loại chi phí thành ba nhóm: overhead gọi hàm, việc thật, và chờ — ba nhóm này chữa bằng ba cách khác hẳn nhau.
>
> Rồi đi theo thứ tự rẻ trước: **bỏ việc** (không tính thứ ngoài tầm nhìn, sự kiện thay cho polling), **giảm tần suất** (LOD cho logic — enemy xa tick 10 Hz thay vì 60 Hz là bỏ 83% công việc), **gọi ít lại** (tick tập trung thay cho 500 `Update`), rồi mới tới **làm nhanh hơn** và cuối cùng là **làm song song** bằng job.
>
> Ba bước đầu gần như luôn cho nhiều mili giây hơn hai bước cuối, và rủi ro thấp hơn hẳn. Người ta hay nhảy thẳng vào bước cuối vì nó nghe kỹ thuật hơn.

**Họ sẽ đào tiếp**

- *"Rải pha là gì và vì sao cần?"* → Nếu 200 object cùng tick ở 10 Hz mà không lệch pha, cứ 6 frame lại có một frame làm việc của cả 200 — tải trung bình đẹp nhưng người chơi thấy giật đều. Lệch pha theo chỉ số đăng ký biến spike thành tải phẳng.
- *"Truyền `Time.deltaTime` hay thời gian từ lần tick trước?"* → Thời gian **từ lần tick trước**. Tick ở 10 Hz mà nhân với `Time.deltaTime` thì mọi chuyển động chậm đi 6 lần — bug rất hay gặp khi mới chuyển sang tick thưa.
- *"`SendMessage` thì sao?"* → Tra hàm theo tên bằng reflection, chậm hơn gọi trực tiếp hàng chục lần, và đổi tên hàm thì hỏng âm thầm vì không có lỗi biên dịch. Không có lý do giữ nó trong code mới.
- *"Cây Transform sâu ảnh hưởng gì?"* → Đổi vị trí hoặc `SetParent` làm bẩn cả cây con; UI sâu là nơi đắt nhất. Giữ hierarchy phẳng ở chỗ nóng, và gom nhiều phép cộng vị trí vào một lần gán thay vì `transform.position +=` nhiều lần.

**Cờ đỏ**

- Nhảy vào Jobs/DOTS cho 200 object.
- Tối ưu vi mô (`for` thay `foreach`) trước khi giảm tần suất hoặc bỏ việc.
- Kết luận CPU-bound mà chưa loại trừ phần "đợi GPU".
- "Chia ra mỗi frame làm 10 cái" — con số cứng, không phải ngân sách ms.
- Không biết `Debug.Log` chạy cả trên bản Release.

**Số / ví dụ nên thuộc**

- `Update()` rỗng ≈ **0,5µs** mỗi lời gọi; 500 script ≈ 0,25 ms/frame.
- 60 Hz → 10 Hz là **bỏ 83%** công việc của nhóm đó.
- Ngân sách chia việc thực dụng: **1–2 ms mỗi frame**.
- Ngưỡng đáng đưa sang job: **vài nghìn phần tử** thuần dữ liệu.
- Tên cần nhớ: `BehaviourUpdate`, `Canvas.BuildBatch`, `Physics.Processing`, `Animator.Update`, `Gfx.WaitForPresentOnGfxThread`.
