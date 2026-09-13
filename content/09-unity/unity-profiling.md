---
title: Profiling — đo trước khi sửa
icon: 🔬
summary: Đọc Profiler cho đúng, đặt marker của mình, dựng phép đo lặp lại được, và biết khi nào phải bỏ Profiler mà dùng công cụ của hãng GPU.
status: deep
read: 741
level: intermediate
order: 141
tags: [unity, performance, profiling, tooling]
related: [unity-optimization, unity-cpu-optimization, unity-gpu-optimization, unity-memory-optimization, unity-testing-ci]
---

[[unity-optimization]] nói *quy trình*: build Development lên máy yếu nhất rồi mới mở code. Node này nói *cách đọc cái bạn vừa chụp được* — vì phần lớn thời gian bị phí không phải do người ta lười đo, mà do đo xong đọc sai.

Ba câu hỏi quyết định mọi buổi profiling, theo thứ tự: **đo ở đâu** (Editor hay thiết bị), **đo cái gì** (frame trung bình hay frame tệ nhất), và **so với cái gì** (không có mốc so thì mọi con số đều vô nghĩa).

## Cửa sổ Profiler: Timeline hay Hierarchy

Hai chế độ trả lời hai câu khác nhau, và chọn nhầm là đi sai hướng ngay từ đầu:

| | **Timeline** | **Hierarchy** |
|---|---|---|
| Trả lời | Thời gian đi đâu **trong một frame**, thread nào đang đợi thread nào | Hàm nào tốn nhất **cộng dồn** |
| Nhìn thấy | Main thread, Render thread, Job worker chạy song song hay nối đuôi | Bảng sắp xếp được theo Total / Self / GC Alloc |
| Dùng khi | Nghi CPU đợi GPU, nghi job không song song, tìm spike | Đã biết frame nào tệ, muốn biết hàm nào |

Hai cột hay bị đọc nhầm trong Hierarchy: **Total** gồm cả hàm con, **Self** chỉ riêng hàm đó. Một `GameManager.Update` có Total 8ms nhưng Self 0.1ms nghĩa là nó chỉ gọi người khác — tối ưu thân hàm đó là vô ích. Sắp xếp theo **Self** để tìm nơi CPU thật sự cháy, sắp xếp theo **GC Alloc** để tìm nguồn rác.

Và luôn nhớ frame nào đang được xem: bấm vào **cột cao nhất** trong biểu đồ, không phải cột đang chọn sẵn. Tối ưu frame trung bình trong khi người chơi phàn nàn về cú khựng là tối ưu sai frame.

## Deep Profile: công cụ khoanh vùng, không phải công cụ đo

Deep Profile gắn đo đạc vào **mọi** lời gọi hàm managed. Nó cho bạn cây gọi đầy đủ, và đổi lại:

- Game chạy chậm **5–10 lần**, nên mọi con số tuyệt đối là vô nghĩa.
- Tỉ lệ giữa các hàm cũng **méo**: hàm nhỏ gọi nhiều lần chịu overhead nặng hơn hàm to gọi một lần, nên nó trông tốn hơn thực tế.

Cách dùng đúng: chụp bình thường trước để biết *vùng* nào nặng (`BehaviourUpdate`, `Canvas.BuildBatch`…), rồi bật Deep Profile để biết *hàm nào trong vùng đó*, rồi tắt đi và đo lại bằng marker của chính mình. Đừng bao giờ đưa số Deep Profile vào báo cáo.

## Marker của bạn: rẻ, chính xác, chạy được trên bản Release

`ProfilerMarker` là cách đo đúng cho code của mình: chi phí gần như bằng không khi Profiler không bật, tên hiện ngay trong Timeline và Hierarchy, và nó **hoạt động trên bản build** chứ không chỉ trong Editor.

```csharp
static readonly ProfilerMarker EnemyTick = new("Game.EnemyTick");

void Update() {
    using (EnemyTick.Auto()) {          // tự End kể cả khi có exception
        TickEnemies();
    }
}
```

Đặt marker theo **hệ thống**, không theo hàm: `Game.EnemyTick`, `Game.Pathfinding`, `Game.UIRefresh`. Sau một tuần bạn có một bản đồ chi phí đọc được trong 5 giây, thay vì phải bật Deep Profile mỗi lần nghi ngờ.

`ProfilerRecorder` là mặt còn lại: đọc **số liệu ngay trong game** để hiện overlay hoặc ghi log trên bản build — demo ở cuối node. Những khoá hay dùng: `"Main Thread"`, `"Render Thread"`, `"Draw Calls Count"`, `"SetPass Calls Count"`, `"Batches Count"`, `"Vertices Count"`, `"GC Allocated In Frame"`, `"System Used Memory"`.

## Phép đo lặp lại được

Một con số không so được với gì thì không phải phép đo. Bộ quy tắc tối thiểu để hai lần chụp cách nhau một tuần vẫn so được:

1. **Cảnh cố định**: một scene benchmark riêng, camera đi theo đường định sẵn (Timeline hoặc script), không có input người.
2. **Seed cố định** cho mọi thứ ngẫu nhiên; tắt spawn theo thời gian thực.
3. **Warm-up 5 giây** rồi mới bắt đầu đếm — bỏ qua phần nạp shader, Addressables, JIT/Burst compile lần đầu.
4. **300 frame**, lặp **3 lần**, lấy **trung vị** và **p95** — không lấy trung bình, vì trung bình giấu đúng cái spike mà người chơi cảm nhận.
5. Máy **nguội, tháo sạc**, cùng mức pin, cùng bản hệ điều hành. Nhiệt làm hai lần đo cách nhau 10 phút lệch tới 30%.
6. Ghi kết quả kèm **commit hash** và bản Unity vào một file trong repo.

**Profile Analyzer** (package) làm đúng việc so sánh này: nạp hai capture, xem phân phối theo marker — "trung vị `Animator.Update` tăng 1.2ms, p95 tăng 4ms" là câu nói có nghĩa, "nhìn biểu đồ thấy có vẻ nặng hơn" thì không.

Khi phép đo đã ổn định, gắn nó vào CI bằng Performance Testing package và đặt ngưỡng hồi quy — xem [[unity-testing-ci]]. Bắt được "PR này làm frame time tăng 8%" lúc merge rẻ hơn nhiều so với tìm lại sau ba tháng.

## Đo trên thiết bị

Đây là bước phân biệt số liệu thật với số liệu tưởng tượng:

- **Development Build** + *Autoconnect Profiler*; nếu không tự nối được thì `adb forward tcp:34999 localabstract:Unity-<bundleId>` rồi chọn máy trong danh sách Profiler.
- Development Build chậm hơn Release khoảng **10–30%**. Nó đúng để **so sánh tương đối** (trước/sau khi sửa), không đúng để kết luận "game đã đạt 60fps".
- Số cuối cùng lấy trên **bản Release**, bằng overlay `ProfilerRecorder` của chính bạn.
- **Deep Profile trên thiết bị**: đừng. Nó làm game không chạy nổi và số đo vô dụng.
- Profiler trong Editor đo cả Editor (vẽ Scene view, import asset, Domain Reload). Chấp nhận được khi đang so hai đoạn code C# thuần; sai hoàn toàn khi đo GPU, bộ nhớ, hay thời gian load.

## Công cụ nào cho câu hỏi nào

| Câu hỏi | Công cụ | Thứ nhìn vào |
|---|---|---|
| Thời gian frame đi đâu? | Profiler → Timeline | Main thread vs Render thread vs worker |
| Hàm nào tốn nhất? | Profiler → Hierarchy, sắp theo **Self** | Self ms, số lần gọi |
| Ai đang tạo rác? | Hierarchy, sắp theo **GC Alloc** | B/frame; mục tiêu 0 — xem [[unity-csharp-memory]] |
| Vì sao batch bị vỡ? | **Frame Debugger** | Dòng "Objects are not batched because…" |
| Có bao nhiêu overdraw? | **Rendering Debugger** → Overdraw | Vùng đỏ đậm — xem [[unity-gpu-optimization]] |
| Cái gì đang giữ bộ nhớ? | **Memory Profiler** → snapshot + Compare | Bảng Unity Objects, tham chiếu giữ object |
| GPU tốn ở đâu (fragment, bandwidth)? | Công cụ hãng: Snapdragon Profiler, Arm Streamline, Xcode Metal Frame Capture, RenderDoc | Bộ đếm phần cứng — Unity Profiler không có |
| Bản này có chậm hơn bản trước không? | **Profile Analyzer** + perf test trong CI | Trung vị và p95 theo marker |

Dòng áp chót đáng nhấn: **module GPU của Unity Profiler rất hạn chế trên mobile**. Muốn biết fragment shader tốn bao nhiêu, băng thông đọc/ghi bao nhiêu, tile nào bị overdraw — phải dùng công cụ của hãng GPU. Không biết điều này là lý do người ta đoán mò suốt nhiều ngày về một cảnh GPU-bound.

## Bẫy khi đo

- **Đo ngay sau khi vào Play**: shader đang biên dịch, Addressables đang nạp, Burst đang compile lần đầu. Warm-up trước.
- **vsync che nút thắt**: game đang chạm trần 60fps thì mọi thay đổi đều "không ảnh hưởng". Tạm nâng `targetFrameRate` lên 300 (hoặc tắt vsync trên PC) khi cần thấy khác biệt thật.
- **Trung bình che spike**: 59fps trung bình mà cứ 2 giây một frame 40ms thì người chơi thấy giật. Nhìn **max frame time** và p95.
- **Sửa nhiều thứ rồi mới đo lại**: không biết cái nào có tác dụng. Một thay đổi, một lần đo.
- **Quên máy nóng**: đo phút 1 rồi kết luận, trong khi người chơi sống ở phút 15.
- **Chụp cảnh không tiêu biểu**: menu chính bao giờ cũng 60fps.

## Kiểm tra nhanh

- [ ] Có một **scene benchmark** cố định và một cách chạy nó lặp lại được
- [ ] Marker `ProfilerMarker` phủ các hệ thống chính của bạn, không chỉ dựa vào Deep Profile
- [ ] Overlay `ProfilerRecorder` chạy được trên bản **Release**
- [ ] Mọi số liệu ghi kèm: thiết bị, bản Unity, commit, Development hay Release, phút thứ mấy
- [ ] So sánh bằng **trung vị + p95**, không bằng trung bình
- [ ] Biết chỗ Unity Profiler hết tác dụng và công cụ hãng nào thay thế

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc profiling**

Giới hạn phải nói thẳng: **AI không nhìn thấy capture của bạn**. Mô tả bằng lời rồi hỏi "cái gì chậm" là mời nó đoán, và nó sẽ đoán theo thứ phổ biến trong dữ liệu huấn luyện — thường là "pooling" và "cache GetComponent", bất kể vấn đề của bạn là gì.

Ba việc nó làm tốt: **viết code đo** (marker, overlay `ProfilerRecorder`, script chạy benchmark tự động), **viết script phân tích số liệu đã xuất** (Profile Analyzer và Profiler đều export CSV — đưa nó CSV thì nó tính trung vị, p95, so hai bản rất nhanh), và **đóng vai người phản biện**: bạn kể giả thuyết, nó chỉ ra phép đo nào loại trừ được giả thuyết đó.

Cách hỏi hiệu quả nhất không phải "tối ưu giúp tôi" mà là: *"đây là 5 dòng đầu bảng Hierarchy kèm Self ms và GC Alloc, đây là thiết bị và ngân sách frame — xếp hạng giả thuyết, và với mỗi cái nói tôi phải đo gì để loại trừ"*.

**Phải nêu rõ** (thiếu là AI đoán bừa):
- Thiết bị, bản Unity, Development hay Release, đo ở Editor hay trên máy.
- Ngân sách frame mục tiêu (ms, không phải fps) và con số hiện tại.
- Số liệu **dán ra**: tên marker + Self ms + số lần gọi + GC Alloc. Không dán thì đừng hỏi.
- Cảnh đang đo có gì (bao nhiêu nhân vật, bao nhiêu particle, UI nào đang mở).
- Đã thử gì rồi và kết quả ra sao.

**Mẫu prompt**

```
Unity 6, Android tầm trung (Snapdragon 6-series), bản Development, đo trên máy,
cảnh combat 40 enemy. Ngân sách 16.6 ms, hiện tại 27 ms.

Profiler → Hierarchy, sắp theo Self, 5 dòng đầu (Self ms | Calls | GC Alloc):
<dán>
Timeline: Gfx.WaitForPresentOnGfxThread = 1.2 ms.

Xếp hạng giả thuyết theo xác suất. Với MỖI giả thuyết:
- phép đo cụ thể để xác nhận hoặc loại trừ (công cụ nào, nhìn con số nào)
- nếu đúng thì hướng sửa, kèm mức cải thiện bạn kỳ vọng tính bằng ms
KHÔNG đề xuất sửa code trước khi tôi trả lời kết quả đo.
```

**Bẫy thường gặp:** AI đọc một con số Deep Profile rồi kết luận chắc nịch — trong khi Deep Profile làm game chậm 5–10 lần và **méo tỉ lệ** giữa các hàm, nên thứ tự trong bảng đó có thể khác hẳn thực tế. Bẫy anh em: nó lấy số đo trong **Editor** làm căn cứ cho hành vi trên thiết bị. Trong prompt phải ghi rõ số này đo ở đâu và bằng chế độ gì; nếu không, câu trả lời sẽ rất tự tin và sai nền tảng.

## 💻 Code

Demo dựng `PerfHud`: overlay đọc số liệu bằng `ProfilerRecorder` — **chạy được trên bản Release**, nơi Profiler không nối vào được — cộng một `ProfilerMarker` mẫu, và sau mỗi cửa sổ 300 frame nó tự in **trung vị + p95 + frame tệ nhất** ra log. Đây là thứ biến "hình như mượt hơn" thành ba con số dán được vào PR.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 290" role="img" aria-label="Hierarchy có PerfHud trong scene Boot và Inspector với Sample Window, Warmup Seconds cùng bảng các khoá ProfilerRecorder">
  <rect x="10" y="10" width="214" height="270" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy  (scene Boot)</text>
  <line x1="10" y1="42" x2="224" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">▾ Systems</text>
  <rect x="26" y="72" width="190" height="20" rx="4" fill="#ffd43b" opacity="0.20"/>
  <text x="34" y="87" class="fig-label" font-size="12" font-weight="600">PerfHud</text>
  <text x="34" y="108" class="fig-muted" font-size="11">▾ Canvas (Overlay)</text>
  <text x="48" y="124" class="fig-muted" font-size="11">Label (TextMeshProUGUI)</text>
  <line x1="10" y1="140" x2="224" y2="140" class="fig-line"/>
  <text x="22" y="160" class="fig-label" font-size="12" font-weight="600">Vì sao ở scene Boot</text>
  <text x="22" y="180" class="fig-muted" font-size="11">Sống suốt phiên, đo được cả</text>
  <text x="22" y="194" class="fig-muted" font-size="11">lúc chuyển scene — đúng chỗ</text>
  <text x="22" y="208" class="fig-muted" font-size="11">hay có spike nhất.</text>
  <line x1="10" y1="224" x2="224" y2="224" class="fig-line"/>
  <text x="22" y="244" class="fig-muted" font-size="10">Bọc trong #if DEVELOPMENT_BUILD</text>
  <text x="22" y="258" class="fig-muted" font-size="10">hoặc để sau một tổ hợp phím nếu</text>
  <text x="22" y="272" class="fig-muted" font-size="10">không muốn người chơi thấy.</text>
  <rect x="240" y="10" width="410" height="270" rx="8" class="fig-box"/>
  <text x="252" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="240" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="248" y="50" width="394" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="256" y="63" class="fig-label" font-size="12" font-weight="600">Perf Hud (Script)</text>
  <text x="264" y="82" class="fig-muted" font-size="11">Label</text><text x="470" y="82" class="fig-label" font-size="11">Label (TextMeshProUGUI)</text>
  <text x="264" y="98" class="fig-muted" font-size="11">Sample Window</text><text x="470" y="98" class="fig-label" font-size="11">300 frame</text>
  <text x="264" y="114" class="fig-muted" font-size="11">Warmup Seconds</text><text x="470" y="114" class="fig-label" font-size="11">5</text>
  <text x="264" y="130" class="fig-muted" font-size="11">Log Summary</text><text x="470" y="130" class="fig-label" font-size="11">☑ in ra trung vị / p95 / max</text>
  <rect x="248" y="144" width="394" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="256" y="157" class="fig-label" font-size="12" font-weight="600">Khoá ProfilerRecorder dùng trong demo</text>
  <text x="264" y="176" class="fig-muted" font-size="11">Internal ▸ Main Thread</text><text x="470" y="176" class="fig-label" font-size="11">nano giây → ms</text>
  <text x="264" y="192" class="fig-muted" font-size="11">Render ▸ Draw Calls Count</text><text x="470" y="192" class="fig-label" font-size="11">số lệnh vẽ</text>
  <text x="264" y="208" class="fig-muted" font-size="11">Render ▸ SetPass Calls Count</text><text x="470" y="208" class="fig-label" font-size="11">số lần đổi trạng thái</text>
  <text x="264" y="224" class="fig-muted" font-size="11">Memory ▸ GC Allocated In Frame</text><text x="470" y="224" class="fig-label" font-size="11">byte, mục tiêu 0</text>
  <text x="264" y="240" class="fig-muted" font-size="11">Memory ▸ System Used Memory</text><text x="470" y="240" class="fig-label" font-size="11">tổng RAM app đang dùng</text>
  <text x="256" y="266" class="fig-muted" font-size="10">Khoá viết SAI thì recorder chỉ .Valid = false, không có lỗi — luôn kiểm tra Valid.</text>
</svg>
<figcaption>Overlay dùng được trên bản Release; Profiler thì không nối vào Release được. Đây là cách duy nhất lấy số cuối cùng đúng.</figcaption>
</figure>

**Script**

```csharp
// PerfHud.cs — Unity 6 (6000.x). Gắn lên GameObject "PerfHud" ở scene Boot,
// kéo một TextMeshProUGUI vào Label. Chạy được trên bản Release.
using System.Collections.Generic;
using System.Text;
using TMPro;
using Unity.Profiling;
using UnityEngine;

public class PerfHud : MonoBehaviour
{
    [SerializeField] TextMeshProUGUI label;
    [SerializeField] int sampleWindow = 300;      // số frame gom lại rồi mới kết luận
    [SerializeField] float warmupSeconds = 5f;    // bỏ qua shader compile, Addressables, Burst
    [SerializeField] bool logSummary = true;

    ProfilerRecorder mainThread, drawCalls, setPass, gcAlloc, sysMemory;
    readonly List<float> frames = new(512);
    readonly StringBuilder sb = new(256);
    float startTime;

    // Marker của chính bạn: hiện trong Timeline, chi phí ~0 khi Profiler tắt.
    static readonly ProfilerMarker HudSample = new("PerfHud.Sample");

    void OnEnable()
    {
        startTime = Time.realtimeSinceStartup;
        mainThread = ProfilerRecorder.StartNew(ProfilerCategory.Internal, "Main Thread", 15);
        drawCalls  = ProfilerRecorder.StartNew(ProfilerCategory.Render, "Draw Calls Count");
        setPass    = ProfilerRecorder.StartNew(ProfilerCategory.Render, "SetPass Calls Count");
        gcAlloc    = ProfilerRecorder.StartNew(ProfilerCategory.Memory, "GC Allocated In Frame");
        sysMemory  = ProfilerRecorder.StartNew(ProfilerCategory.Memory, "System Used Memory");
    }

    void OnDisable()
    {
        mainThread.Dispose(); drawCalls.Dispose(); setPass.Dispose();
        gcAlloc.Dispose(); sysMemory.Dispose();
    }

    void Update()
    {
        using (HudSample.Auto())
        {
            float frameMs = Time.unscaledDeltaTime * 1000f;
            bool warmedUp = Time.realtimeSinceStartup - startTime > warmupSeconds;

            if (warmedUp)
            {
                frames.Add(frameMs);
                if (frames.Count >= sampleWindow) Summarize();
            }

            if (label == null) return;
            sb.Clear();
            sb.Append(frameMs.ToString("0.0")).Append(" ms  (")
              .Append(Mathf.RoundToInt(1f / Mathf.Max(0.0001f, Time.unscaledDeltaTime))).Append(" fps)\n");
            sb.Append("main ").Append(Ms(mainThread).ToString("0.0")).Append(" ms\n");
            sb.Append("draw ").Append(Value(drawCalls)).Append("  setpass ").Append(Value(setPass)).Append('\n');
            sb.Append("gc ").Append(Value(gcAlloc)).Append(" B/frame\n");
            sb.Append("mem ").Append((Value(sysMemory) / (1024 * 1024)).ToString()).Append(" MB");
            if (!warmedUp) sb.Append("   [warmup]");
            label.SetText(sb);
        }
    }

    /// Trung vị + p95 + frame tệ nhất. KHÔNG dùng trung bình: nó giấu đúng cái spike
    /// mà người chơi cảm nhận được.
    void Summarize()
    {
        frames.Sort();
        float median = frames[frames.Count / 2];
        int i95 = Mathf.Clamp(Mathf.RoundToInt(frames.Count * 0.95f) - 1, 0, frames.Count - 1);
        if (logSummary)
            Debug.Log($"[PerfHud] {frames.Count} frame — trung vị {median:0.0} ms | p95 {frames[i95]:0.0} ms " +
                      $"| max {frames[frames.Count - 1]:0.0} ms | {SystemInfo.deviceModel} " +
                      $"| Unity {Application.unityVersion} | {(Debug.isDebugBuild ? "Development" : "Release")}");
        frames.Clear();
    }

    static long Value(ProfilerRecorder r) => r.Valid ? r.LastValue : 0;

    /// "Main Thread" trả về NANO giây; lấy trung bình cửa sổ 15 mẫu cho đỡ nhảy số.
    static double Ms(ProfilerRecorder r)
    {
        if (!r.Valid || r.Count == 0) return 0;
        double sum = 0;
        for (int i = 0; i < r.Count; i++) sum += r.GetSample(i).Value;
        return sum / r.Count * 1e-6;
    }
}
```

**Chạy thử**
- Play từ scene Boot: overlay hiện frame time, main thread, draw call, SetPass, GC/frame và RAM. Trong 5 giây đầu có chữ `[warmup]` — số ở giai đoạn đó **không** được tính.
- Sau 300 frame, Console in một dòng tóm tắt kèm tên máy, bản Unity và Development/Release. Dán thẳng dòng đó vào PR là đủ để người review biết bạn đo ở đâu.
- Mở Profiler → Timeline, tìm marker **`PerfHud.Sample`** — đó là cách marker của bạn hiện ra. Bọc `TickEnemies()` hay `RefreshUI()` tương tự và bản đồ chi phí của game hiện ra sau một buổi.
- Thử gõ sai một khoá (ví dụ `"Draw Call Count"` thiếu chữ s): recorder chỉ `Valid = false`, overlay hiện 0, **không có lỗi nào**. Đây là lý do luôn kiểm `Valid` trước khi tin con số.
- Build Release rồi chạy lại: overlay vẫn hoạt động, và con số thường tốt hơn Development **10–30%**. Đó mới là con số để kết luận.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Anh đo hiệu năng bằng gì, và đo ở đâu?**
  → Profiler của Unity, nhưng **trên thiết bị đích với bản Development**, không phải trong Editor — Profiler chạy trong Editor đo cả Editor (Scene view, import asset) nên sai nền tảng. Con số cuối cùng thì lấy trên **bản Release** bằng overlay `ProfilerRecorder` tự viết, vì Profiler không nối vào Release được.
- `Junior` **Cột Total và Self trong Hierarchy khác nhau thế nào?**
  → Total gồm cả hàm con, Self chỉ riêng thân hàm đó. Một `GameManager.Update` có Total 8 ms nhưng Self 0,1 ms nghĩa là nó chỉ gọi người khác — sửa thân hàm đó không được gì. Tôi sắp theo **Self** để tìm nơi CPU thật sự cháy, và theo **GC Alloc** để tìm nguồn rác.
- `Junior` **Deep Profile dùng khi nào?**
  → Chỉ để **khoanh vùng**, không để lấy số. Nó đo mọi lời gọi managed nên game chậm 5–10 lần và tỉ lệ giữa các hàm bị méo — hàm nhỏ gọi nhiều lần trông tốn hơn thực tế. Quy trình: chụp thường để biết vùng nặng, bật Deep Profile để biết hàm nào trong vùng đó, rồi tắt đi và đo lại bằng marker của mình.
- `Mid` **Làm sao biết một thay đổi thật sự cải thiện hay chỉ là nhiễu?**
  → Phép đo phải lặp lại được: scene benchmark cố định, camera đi đường định sẵn, seed cố định, warm-up 5 giây, 300 frame, lặp 3 lần, so **trung vị và p95** chứ không so trung bình. Máy phải nguội và tháo sạc, vì nhiệt làm hai lần đo cách nhau 10 phút lệch tới 30%. Profile Analyzer so hai capture theo phân phối — đó mới là câu trả lời cho "có tốt hơn không".
- `Mid` **Vì sao không nên báo cáo bằng fps trung bình?**
  → Vì trung bình giấu spike: 59 fps trung bình mà cứ hai giây một frame 40 ms thì người chơi thấy giật còn báo cáo vẫn đẹp. Tôi nhìn **max frame time và p95**, và nói bằng **mili giây** — 60→50 fps là mất 3,3 ms, 30→25 fps là mất 6,7 ms, cùng "5 fps" nhưng khối lượng phải cắt khác gấp đôi.
- `Mid` **Đã có Deep Profile rồi thì marker tự đặt để làm gì?**
  → Vì `ProfilerMarker` gần như miễn phí khi Profiler tắt và **chạy được trên bản build**, còn Deep Profile thì không dùng nổi trên thiết bị. Tôi đặt marker theo hệ thống — `Game.EnemyTick`, `Game.Pathfinding`, `Game.UIRefresh` — nên mở Timeline là thấy bản đồ chi phí ngay, không phải bật Deep Profile mỗi lần nghi ngờ.
- `Senior` **Profiler báo GPU thấp nhưng game vẫn chậm trên mobile. Anh làm gì?**
  → Không tin module GPU của Unity trên mobile, nó rất hạn chế. Nhìn `Gfx.WaitForPresentOnGfxThread` trên main thread để biết CPU có đang đợi GPU không, rồi làm phép thử nhị phân: **hạ Render Scale xuống 0,5** — frame time cải thiện mạnh thì nút thắt là fill rate hoặc băng thông. Muốn con số thật thì phải dùng công cụ hãng: Snapdragon Profiler, Arm Streamline, hoặc Xcode Metal Frame Capture.
- `Senior` **Làm sao ngăn hiệu năng tụt dần qua từng bản?**
  → Biến phép đo thành test: scene benchmark chạy tự động trong CI bằng Performance Testing package, đặt ngưỡng hồi quy, PR nào làm trung vị frame time vượt ngưỡng thì đỏ. Bắt "PR này tăng 8%" lúc merge rẻ hơn nhiều so với ba tháng sau đi tìm trong 400 commit. Kèm theo là ghi mọi số đo với commit hash, thiết bị và bản Unity.
- `Senior` **Kể một lần anh đo sai rồi đi nhầm hướng.**
  → Dạng trả lời tốt: nêu phép đo đã tin nhầm (Editor, Deep Profile, frame ngay sau load, máy đã nóng), nói phát hiện ra bằng cách nào, và **đổi quy trình gì sau đó** — ví dụ từ đó luôn warm-up 5 giây và luôn ghi kèm điều kiện đo. Người phỏng vấn nghe cách bạn sửa quy trình, không nghe bạn thông minh tới đâu.

**Khung trả lời 60 giây** — "Quy trình profiling của anh thế nào?"

> Trước hết là đo **đúng chỗ**: build Development lên máy yếu nhất trong danh sách hỗ trợ, nối Profiler qua máy thật, chụp ở cảnh đông nhất — và chụp cả phút 1 lẫn phút 15, vì máy nóng lên thì throttle, và con số phút 15 mới là con số người chơi thấy.
>
> Đọc thì theo thứ tự: **Timeline** trước để biết main thread có đang *đợi* GPU hay đợi job không; nếu không thì sang **Hierarchy**, sắp theo Self để tìm hàm cháy CPU và theo GC Alloc để tìm nguồn rác. Deep Profile chỉ để khoanh vùng, không lấy số từ đó.
>
> Và phép đo phải lặp lại được, nếu không thì không kết luận được gì: scene benchmark cố định, warm-up 5 giây, 300 frame, ba lần, so trung vị và p95. Cuối cùng tôi luôn có một overlay `ProfilerRecorder` chạy trên bản Release — đó mới là môi trường thật, vì Development build chậm hơn Release chừng 10–30%.

**Họ sẽ đào tiếp**

- *"Đo trong Editor sai ở chỗ nào?"* → Editor có chi phí riêng (Scene view, import, Domain Reload), GPU máy dev mạnh gấp hàng chục lần điện thoại, và bộ nhớ thì Editor giữ thêm asset của chính nó. Chấp nhận được khi so hai đoạn C# thuần; sai hoàn toàn với GPU, bộ nhớ và thời gian load.
- *"Gõ sai khoá `ProfilerRecorder` thì sao?"* → Recorder chỉ `Valid = false`, overlay hiện 0, **không có lỗi nào**. Luôn kiểm `Valid` trước khi tin con số.
- *"vsync có ảnh hưởng phép đo không?"* → Có. Đang chạm trần 60fps thì mọi thay đổi đều "không tác dụng". Tạm nâng `targetFrameRate` rất cao khi cần thấy khác biệt thật, rồi đặt lại khi đo trải nghiệm thật.
- *"Bao nhiêu frame là đủ?"* → Khoảng 300 frame ở cảnh tiêu biểu, lặp ba lần. Ít hơn thì p95 vô nghĩa; nhiều hơn thì nhiệt xen vào và bạn đang đo hai thứ cùng lúc.

**Cờ đỏ**

- Đưa số Deep Profile hoặc số đo trong Editor ra làm bằng chứng.
- Nói "tối ưu được 20%" mà không nói đo ở máy nào, bản gì, cảnh nào.
- Chỉ nhìn fps trung bình, không nhìn p95 hay max frame time.
- Sửa năm chỗ rồi mới đo lại một lần.
- Không biết Unity Profiler gần như không đo được GPU trên mobile.

**Số / ví dụ nên thuộc**

- Development Build chậm hơn Release khoảng **10–30%**.
- Deep Profile: chậm **5–10 lần** và méo tỉ lệ giữa các hàm.
- Cửa sổ đo thực dụng: **warm-up 5s → 300 frame → lặp 3 lần → trung vị + p95**.
- 60fps = **16,6 ms**; 30fps = 33 ms. Nói bằng ms, quy ra fps chỉ khi nói với người ngoài kỹ thuật.
- Khoá recorder hay dùng: `Main Thread`, `Draw Calls Count`, `SetPass Calls Count`, `GC Allocated In Frame`, `System Used Memory`.
