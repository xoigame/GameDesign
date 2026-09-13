---
title: Debug hiện trường — crash, ANR, log
icon: 🚑
summary: Bug ở máy người chơi mà bạn không cầm được máy: phân biệt crash / ANR / bị kill vì hết RAM, symbolicate stack native, và breadcrumb — thứ rẻ nhất biến "không tái hiện được" thành "sửa được".
status: deep
read: 780
level: advanced
order: 180
tags: [unity, debug, crash, mobile, production]
related: [unity-build-platform, unity-optimization, unity-testing-ci, unity-csharp-memory]
---

Trên máy bạn thì mọi thứ chạy. Vấn đề là 3.000 người chơi trên 400 dòng máy, và bạn chỉ nhận được một dòng: *"game bị văng"*. Node này là quy trình biến dòng đó thành một bug sửa được.

Thứ tự không đổi: **thu thập ngữ cảnh → phân loại đúng hiện tượng → tìm mẫu chung → tái hiện → sửa → xác nhận bằng số liệu bản sau**. Bỏ bước phân loại là nguồn của những tuần đi sai hướng, vì ba hiện tượng dưới đây trông giống hệt nhau với người chơi.

## Ba thứ người chơi đều gọi là "văng"

| Hiện tượng | Dấu hiệu trong dữ liệu | Nguyên nhân hay gặp |
|---|---|---|
| **Crash** | Có stack trace (managed hoặc native), có trong Crashlytics / Play Console | `NullReferenceException` không bắt, lỗi native trong plugin, hỏng bộ nhớ |
| **ANR / treo** | Play Console báo ANR; iOS là watchdog kill | Main thread bị chặn — I/O đồng bộ, parse JSON to, `Resources.UnloadUnusedAssets()`, chờ thread, SDK quảng cáo |
| **Bị hệ điều hành kill vì hết RAM** | **Không có stack trace gì cả**; app biến mất "sạch" | Texture chưa nén, bundle không release, heap phình — xem [[unity-addressables]] và [[unity-csharp-memory]] |

Cái thứ ba là cái hay bị chẩn đoán nhầm nhất: không có stack nên người ta đi tìm lỗi logic, trong khi thứ cần nhìn là biểu đồ bộ nhớ theo thời gian chơi. Dấu hiệu nhận dạng: tỉ lệ "văng" tăng theo **thời lượng phiên chơi** và tập trung ở dòng máy RAM thấp.

## Symbolicate: biến hex thành tên hàm

Bản IL2CPP crash trong code native, nên stack gửi về là một dãy địa chỉ. Muốn đọc được:

- **Android**: bật *Create symbols.zip* (Build Settings) rồi nộp file đó lên Play Console, hoặc dùng `ndk-stack`/`addr2line` với `libil2cpp.so` **đúng bản build đó**. Sai một bản là mọi tên hàm sai theo mà không báo gì.
- **iOS**: giữ `.dSYM` của từng bản; Xcode Organizer symbolicate tự động nếu bạn upload khi archive.
- **Cả hai**: lưu symbol **cùng artifact của bản build**, đánh version rõ ràng. Ba tháng sau không ai nhớ bản 1.4.2 build bằng máy nào.

Với lỗi **managed**, stack có sẵn tên hàm nhưng không có số dòng trừ khi bật *Debug Symbols*/development build. Mẹo rẻ: bọc điểm nghi ngờ bằng `try/catch` rồi `Debug.LogException` kèm ngữ cảnh — bạn mất một chút hiệu năng ở nhánh lỗi và đổi lại được thông tin thật.

## Breadcrumb: thứ rẻ nhất, hiệu quả nhất

Stack trace nói **chỗ** hỏng. Breadcrumb nói **hoàn cảnh** hỏng, và đó mới là thứ giúp bạn tái hiện.

Gắn vào mỗi báo cáo crash một bộ khoá tuỳ ý — Crashlytics gọi là custom key, dịch vụ nào cũng có tương đương:

| Khoá | Vì sao cần |
|---|---|
| `scene`, `level_id`, `game_state` | Thu hẹp từ "cả game" xuống một màn |
| `session_seconds` | Tăng đều theo thời gian chơi ⇒ nghi rò rỉ bộ nhớ |
| `mem_used_mb`, `device_ram_mb` | Phân biệt hết RAM với lỗi logic |
| `save_version`, `player_level`, `gold` | Bắt được lỗi chỉ xảy ra với save cũ hoặc số liệu biên |
| `last_action` (10 hành động gần nhất) | Gần bằng một bản tái hiện thu nhỏ |
| `network`, `locale` | Bug chỉ xảy ra ở 3G chập chờn, hoặc ở locale có dấu phẩy thập phân |

Thêm một **ring buffer log trong RAM**: giữ 200 dòng gần nhất, đính kèm khi crash. Không cần ghi file, không tốn I/O, và khác biệt giữa "lỗi ở `Inventory.Add`" với "lỗi ở `Inventory.Add` ngay sau khi mua gói 3 vật phẩm khi túi đầy" là khác biệt giữa một tuần và một giờ.

## Tìm mẫu chung trước khi đoán

Với một nhóm crash, ba câu hỏi theo thứ tự:

1. **Tập trung ở đâu?** Một dòng máy (driver Mali cũ), một phiên bản OS, một locale, một vùng (mạng chậm), hay một bản app.
2. **Bắt đầu từ bản nào?** So với bản trước: nếu tỉ lệ nhảy vọt ở 1.4.2 thì diff của bản đó là danh sách nghi phạm, không cần đoán.
3. **Tương quan với cái gì?** Thời lượng phiên, số lần vào màn, có mua hàng không. Đây là lúc breadcrumb trả lãi.

Số cần nhìn là **tỉ lệ phiên không lỗi** (crash-free sessions), không phải số vụ crash tuyệt đối — số tuyệt đối tăng khi có nhiều người chơi hơn, và nhìn nhầm nó sẽ hoảng nhầm chỗ. Mốc thực tế cho game mobile: dưới 99% là có vấn đề rõ; 99.5% trở lên là ổn định.

## ANR: main thread bị chặn

Android báo ANR khi main thread không phản hồi quá ~5 giây. Trong Unity, thủ phạm quen mặt:

- Đọc/ghi file đồng bộ trong `Update` hoặc lúc chuyển scene (save lớn, `File.ReadAllText` trên đường dẫn chậm).
- `Resources.UnloadUnusedAssets()` gọi giữa gameplay — nó quét toàn bộ tham chiếu.
- Parse JSON/XML lớn trên main thread; nén/giải nén; tính toán procedural đồng bộ.
- Chờ một thread hoặc một callback SDK (quảng cáo, IAP) ngay trong luồng chính.
- Compile shader variant lần đầu ở máy yếu.

Cách chữa chung: đẩy việc sang thread nền (`Awaitable.BackgroundThreadAsync`, job) hoặc **trải ra nhiều frame**; và luôn có màn che khi làm việc nặng để người chơi thấy hệ thống còn sống.

## Repro: cách làm bug chịu xuất hiện

- **Cheat console trong bản Development**: nhảy màn, đặt vàng, ép state — rút thời gian tái hiện từ 20 phút xuống 20 giây. Xem [[unity-editor-tools]].
- **Nút gửi báo lỗi trong game**: đính save hiện tại + 200 dòng log. Save của người chơi thường là chìa khoá của bug "không tái hiện được".
- **Seed cố định** cho mọi thứ ngẫu nhiên khi ở chế độ debug.
- **Bắt chước điều kiện xấu**: bật giới hạn mạng, chạy trên máy 2GB RAM, để máy nóng 15 phút trước khi test. Phần lớn bug hiện trường sống ở đúng những điều kiện đó.

## Bẫy lộ ra khi build

- Symbol không được lưu: bản 1.4.2 crash, ba tháng sau không ai dựng lại được symbol tương ứng.
- `Debug.Log` mỗi frame trong bản Release: vừa tốn, vừa đẩy log thật ra khỏi buffer.
- Ghi log kèm thông tin cá nhân (email, id thiết bị thô) — vấn đề pháp lý, không chỉ kỹ thuật.
- Bắt hết mọi exception bằng `try/catch` rỗng để "game khỏi văng": lỗi biến mất khỏi báo cáo, dữ liệu hỏng âm thầm, và bạn mất luôn khả năng biết mình đang hỏng.
- Chỉ test trên máy flagship: cả ba nhóm sự cố ở trên đều tập trung ở máy yếu.

## Kiểm tra nhanh

- [ ] Symbol (`symbols.zip` / `.dSYM`) lưu cùng mọi bản phát hành
- [ ] Crash report có custom key: scene, session_seconds, mem_used, save_version
- [ ] Ring buffer 200 dòng log gần nhất được đính kèm khi crash
- [ ] Theo dõi **crash-free sessions**, không theo dõi số vụ tuyệt đối
- [ ] Có cheat console và nút gửi báo lỗi trong bản Development
- [ ] Không có `catch { }` rỗng nào trên đường gameplay chính

## 🤖 Prompt cho AI

**Dùng AI thế nào khi đang đuổi một bug hiện trường**

Điểm mạnh lớn nhất của AI ở đây không phải sửa code mà là **đọc stack trace và sinh giả thuyết**: dán một stack managed kèm mô tả hoàn cảnh, nó liệt kê được các nguyên nhân khả dĩ nhanh hơn bạn tra tài liệu. Việc thứ hai nó làm tốt: viết **code thu thập ngữ cảnh** (breadcrumb, ring buffer log, wrapper cho crash SDK) — loại code lặp, nhiều lời, dễ kiểm.

Việc nó **không** làm được: biết game của bạn. Nó không biết màn 7 có một cơ chế đặc biệt, không biết tuần trước bạn đổi cách nạp asset. Nên hãy dùng nó như người soát giả thuyết, và luôn bắt nó xếp hạng: *"nêu 5 giả thuyết, sắp theo xác suất, và với mỗi cái nói tôi phải đo gì để loại trừ"*. Cái "đo gì để loại trừ" mới là phần có giá trị — nó biến một danh sách phỏng đoán thành một kế hoạch.

**Phải nêu rõ** (thiếu là AI đoán bừa):
- Hiện tượng chính xác: có stack không, app biến mất im lặng hay treo rồi văng.
- Tập trung ở đâu: dòng máy, phiên bản OS, bản app, vùng, locale.
- Bắt đầu từ bản nào, và bản đó đổi những gì.
- Có tương quan với thời lượng phiên chơi không (câu hỏi phân biệt rò rỉ bộ nhớ với lỗi logic).
- Backend là IL2CPP hay Mono, và stack đã symbolicate chưa.

**Mẫu prompt**

```
Unity 6, IL2CPP, Android. Hiện tượng: app biến mất, KHÔNG có stack trace
trong Crashlytics. Play Console không ghi ANR. Tỉ lệ tăng theo thời lượng
phiên: dưới 5 phút gần như không có, trên 20 phút là 4%. Tập trung ở máy
RAM 3GB trở xuống. Bắt đầu từ bản 1.4.0 — bản đó chuyển UI sang Addressables.

Nêu 5 giả thuyết, sắp theo xác suất. Với mỗi giả thuyết:
- đo cái gì để xác nhận hoặc loại trừ (công cụ cụ thể, chỉ số cụ thể)
- nếu đúng thì sửa theo hướng nào
KHÔNG đề xuất sửa code trước khi tôi trả lời kết quả đo.
```

**Bẫy thường gặp:** đưa AI một stack trace **chưa symbolicate** (toàn địa chỉ hex và `libil2cpp.so`) rồi hỏi nguyên nhân — nó sẽ tự tin suy diễn từ tên hàm gần đúng hoặc từ mô tả của bạn, và ra một câu chuyện nghe rất hợp lý về một hàm có thể không nằm trong stack. Symbolicate trước, đưa stack thật sau; nếu không symbolicate được thì nói thẳng điều đó trong prompt để nó không giả vờ đọc được.

## 💻 Code

Demo dựng `CrashContext`: một service ở Boot scene giữ **ring buffer 200 dòng log**, gắn **custom key** cho báo cáo crash (scene, thời lượng phiên, bộ nhớ, save version), ghi breadcrumb hành động của người chơi, và tự đóng gói toàn bộ khi có exception. Đây là phần hạ tầng bạn muốn có **trước** khi cần tới nó.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 290" role="img" aria-label="Hierarchy Boot scene có Systems chứa CrashContext, Inspector hiện Log Capacity, Sample Interval và bảng custom key gửi kèm báo cáo">
  <rect x="10" y="10" width="210" height="270" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy  (scene Boot)</text>
  <line x1="10" y1="42" x2="220" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">▾ Systems</text>
  <rect x="26" y="72" width="188" height="20" rx="4" fill="#ff8787" opacity="0.20"/>
  <text x="34" y="87" class="fig-label" font-size="12" font-weight="600">CrashContext</text>
  <text x="34" y="108" class="fig-muted" font-size="11">AudioService</text>
  <text x="34" y="124" class="fig-muted" font-size="11">SaveService</text>
  <line x1="10" y1="140" x2="220" y2="140" class="fig-line"/>
  <text x="22" y="160" class="fig-label" font-size="12" font-weight="600">Vì sao ở Boot</text>
  <text x="22" y="180" class="fig-muted" font-size="11">Phải sống trước mọi hệ thống</text>
  <text x="22" y="196" class="fig-muted" font-size="11">khác để bắt được exception</text>
  <text x="22" y="212" class="fig-muted" font-size="11">lúc khởi tạo.</text>
  <text x="22" y="236" class="fig-muted" font-size="11">[DefaultExecutionOrder(-1000)]</text>
  <text x="22" y="258" class="fig-muted" font-size="10">Xem node Vòng đời game về</text>
  <text x="22" y="272" class="fig-muted" font-size="10">Boot scene và bản trùng.</text>
  <rect x="236" y="10" width="414" height="270" rx="8" class="fig-box"/>
  <text x="248" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="236" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="244" y="50" width="398" height="18" rx="3" fill="#ff8787" opacity="0.22"/>
  <text x="252" y="63" class="fig-label" font-size="12" font-weight="600">Crash Context (Script)</text>
  <text x="260" y="82" class="fig-muted" font-size="11">Log Capacity</text><text x="450" y="82" class="fig-label" font-size="11">200 dòng</text>
  <text x="260" y="98" class="fig-muted" font-size="11">Sample Interval</text><text x="450" y="98" class="fig-label" font-size="11">5 giây</text>
  <text x="260" y="114" class="fig-muted" font-size="11">Breadcrumb Capacity</text><text x="450" y="114" class="fig-label" font-size="11">10 hành động</text>
  <rect x="244" y="128" width="398" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="252" y="141" class="fig-label" font-size="12" font-weight="600">Custom key gửi kèm mỗi báo cáo</text>
  <text x="260" y="160" class="fig-muted" font-size="11">scene / game_state</text><text x="450" y="160" class="fig-label" font-size="11">thu hẹp phạm vi</text>
  <text x="260" y="176" class="fig-muted" font-size="11">session_seconds</text><text x="450" y="176" class="fig-label" font-size="11">tăng đều ⇒ nghi rò rỉ</text>
  <text x="260" y="192" class="fig-muted" font-size="11">mem_managed_mb</text><text x="450" y="192" class="fig-label" font-size="11">GC heap</text>
  <text x="260" y="208" class="fig-muted" font-size="11">device_ram_mb / device</text><text x="450" y="208" class="fig-label" font-size="11">phân biệt hết RAM</text>
  <text x="260" y="224" class="fig-muted" font-size="11">save_version</text><text x="450" y="224" class="fig-label" font-size="11">bug chỉ có ở save cũ</text>
  <text x="260" y="240" class="fig-muted" font-size="11">last_actions</text><text x="450" y="240" class="fig-label" font-size="11">10 hành động gần nhất</text>
  <text x="252" y="266" class="fig-muted" font-size="10">Thay hai hàm Send* bằng SDK thật (Crashlytics / Cloud Diagnostics).</text>
</svg>
<figcaption>CrashContext nằm ở Boot scene và chạy trước mọi thứ. Phần gửi đi được cô lập trong hai hàm để cắm SDK nào cũng được.</figcaption>
</figure>

**Script**

```csharp
// CrashContext.cs — Unity 6 (6000.x). Đặt trên GameObject "CrashContext" trong scene Boot.
// Không phụ thuộc SDK nào: hai hàm SendKey/SendReport là chỗ cắm Crashlytics hoặc dịch vụ khác.
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.SceneManagement;

[DefaultExecutionOrder(-1000)]          // chạy trước mọi hệ thống khác
public class CrashContext : MonoBehaviour
{
    public static CrashContext Instance { get; private set; }

    [SerializeField] int logCapacity = 200;
    [SerializeField] int breadcrumbCapacity = 10;
    [SerializeField] float sampleInterval = 5f;

    readonly Queue<string> logRing = new();
    readonly Queue<string> breadcrumbs = new();
    readonly Dictionary<string, string> keys = new();
    readonly StringBuilder sb = new(4096);
    float startTime, nextSample;

    void Awake()
    {
        // Huỷ bản MỚI, giữ bản cũ đang có subscriber — xem node Vòng đời game.
        if (Instance != null && Instance != this) { Destroy(gameObject); return; }
        Instance = this;
        DontDestroyOnLoad(gameObject);
        startTime = Time.realtimeSinceStartup;

        Application.logMessageReceived += OnLog;
        SceneManager.activeSceneChanged += OnSceneChanged;

        SetKey("device", SystemInfo.deviceModel);
        SetKey("device_ram_mb", SystemInfo.systemMemorySize.ToString());
        SetKey("gfx", SystemInfo.graphicsDeviceName);
        SetKey("app_version", Application.version);
    }

    void OnDestroy()
    {
        if (Instance != this) return;
        Application.logMessageReceived -= OnLog;
        SceneManager.activeSceneChanged -= OnSceneChanged;
        Instance = null;
    }

    void Update()
    {
        if (Time.unscaledTime < nextSample) return;
        nextSample = Time.unscaledTime + sampleInterval;

        SetKey("session_seconds", Mathf.RoundToInt(Time.realtimeSinceStartup - startTime).ToString());
        // GC heap: đọc được ở cả bản Release. Bộ nhớ NATIVE (texture, mesh, audio) cần
        // Profiler.GetTotalAllocatedMemoryLong() và chỉ có số thật ở bản Development.
        SetKey("mem_managed_mb", (System.GC.GetTotalMemory(false) / (1024 * 1024)).ToString());
    }

    void OnSceneChanged(Scene from, Scene to) => SetKey("scene", to.name);

    /// Ghi một hành động của người chơi. Gọi ở chỗ có ý nghĩa, không gọi mỗi frame.
    public void Breadcrumb(string action)
    {
        Push(breadcrumbs, breadcrumbCapacity, action);
        SetKey("last_actions", string.Join(" > ", breadcrumbs));
    }

    public void SetKey(string key, string value)
    {
        keys[key] = value;
        SendKey(key, value);                       // -> SDK thật
    }

    void OnLog(string condition, string stack, LogType type)
    {
        if (type == LogType.Log) return;           // chỉ giữ warning/error/exception
        Push(logRing, logCapacity, type + ": " + condition);
        if (type == LogType.Exception) SendReport(condition, stack, Dump());
    }

    static void Push(Queue<string> q, int cap, string line)
    {
        q.Enqueue(line);
        while (q.Count > cap) q.Dequeue();
    }

    /// Toàn bộ ngữ cảnh dưới dạng text — đính kèm báo cáo, hoặc gắn vào nút "gửi lỗi" trong game.
    public string Dump()
    {
        sb.Clear();
        foreach (var kv in keys) sb.Append(kv.Key).Append('=').Append(kv.Value).Append('\n');
        sb.Append("--- log ---\n");
        foreach (var line in logRing) sb.Append(line).Append('\n');
        return sb.ToString();
    }

    // ----- chỗ cắm SDK: thay hai hàm này, phần trên không đổi -----
    static void SendKey(string key, string value)
    {
        // Crashlytics.SetCustomKey(key, value);
    }

    static void SendReport(string message, string stack, string context)
    {
        // Crashlytics.Log(context); Crashlytics.LogException(new System.Exception(message + "|" + stack));
        Debug.Log("[CrashContext] báo cáo đã đóng gói, " + context.Length + " ký tự");
    }
}
```

**Chạy thử**
- Play từ scene Boot, gọi `CrashContext.Instance.Breadcrumb("mua_goi_3_vat_pham")` ở vài chỗ, rồi cố tình ném một exception. Console hiện dòng `[CrashContext] báo cáo đã đóng gói…` — nghĩa là ngữ cảnh đã được gom đúng lúc crash, không phải sau đó.
- Gọi `CrashContext.Instance.Dump()` từ một nút debug và in ra: phải thấy `session_seconds` tăng, `scene` đổi theo màn, và 10 hành động gần nhất theo đúng thứ tự.
- Cắm SDK thật vào hai hàm `SendKey`/`SendReport`, build bản Development, ép crash trên thiết bị, rồi kiểm tra báo cáo trên dashboard có đủ custom key không. Làm việc này **trước** khi phát hành, vì lúc cần thì đã muộn.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Người chơi báo "game bị văng" — anh hỏi lại những gì?**
  → Máy gì và bản Android/iOS nào, bản app nào, đang ở màn hình nào, có tái hiện được không, và **game biến mất ngay hay đứng đơ một lúc rồi mới tắt**. Câu cuối quan trọng nhất vì nó tách ba loại khác hẳn nhau: crash có stack trace, **ANR** (main thread bị chặn), và **bị hệ điều hành kill vì hết RAM**.
- `Junior` **Kể một bug khó nhất anh từng sửa.**
  → Kể theo **quy trình thu hẹp giả thuyết**, không kể như một câu chuyện ly kỳ: hiện tượng là gì, chia đôi ở đâu, giả thuyết nào bị loại bằng bằng chứng nào, và cuối cùng cái gì xác nhận nguyên nhân. Người phỏng vấn nghe cách bạn suy luận; cốt truyện hay mà không có bước loại trừ nào thì không nói lên điều gì.
- `Junior` **ANR là gì? Trong Unity thì thường do đâu?**
  → Main thread không phản hồi quá **~5 giây** trên Android. Nguyên nhân quen thuộc: I/O đồng bộ khi save hoặc chuyển scene, `Resources.UnloadUnusedAssets()` gọi giữa gameplay, parse JSON lớn, chờ callback SDK quảng cáo, và compile shader lần đầu trên máy yếu. Chữa bằng cách đẩy sang thread nền hoặc trải ra nhiều frame.
- `Mid` **Crash chỉ xảy ra trên bản Release, không xảy ra trong Editor. Anh làm gì?**
  → Nghi ba nhóm khác biệt Editor/build: **IL2CPP AOT** (`Reflection.Emit`, generic virtual trên value type), **Managed Stripping** xoá thứ chỉ gọi qua reflection, và thời gian — build chạy nhanh hơn nên race condition lộ ra. Bước đầu tiên là build Development có stack trace đầy đủ và **symbolicate**, đừng đoán trước khi có tên hàm.
- `Mid` **Stack trace toàn hex thì làm sao đọc?**
  → Bản IL2CPP crash trong code native nên phải **symbolicate**: `symbols.zip` cho Android (nộp lên Play Console hoặc dùng `ndk-stack`), `.dSYM` cho iOS. Phải là symbol của **đúng bản build đó** — dùng nhầm bản thì tên hàm sai mà không có cảnh báo nào. Vì vậy symbol phải được lưu cùng artifact của từng bản phát hành.
- `Mid` **Làm sao tăng khả năng tái hiện một bug từ người chơi?**
  → Cheat console để nhảy thẳng tới trạng thái. Nút gửi báo lỗi trong game **đính kèm save của người chơi** — thường chính nó là chìa khoá. Seed cố định ở chế độ debug. Và dựng lại điều kiện xấu: máy 2 GB RAM, mạng chập chờn, máy đã nóng 15 phút. Test trên flagship là cách bỏ sót phần lớn báo cáo.
- `Senior` **App biến mất mà không có stack trace nào. Chẩn đoán?**
  → Gần như chắc là **bị hệ điều hành kill vì hết RAM** — không có exception nên không có gì để ghi lại. Xác nhận bằng mẫu: tỉ lệ **tăng theo thời lượng phiên chơi** và tập trung ở máy RAM thấp. Sau đó đi theo hướng bộ nhớ: texture, audio, và rò rỉ handle Addressables, chứ không đi tìm lỗi logic.
- `Senior` **Anh theo dõi chỉ số ổn định nào, và ngưỡng bao nhiêu?**
  → **Crash-free sessions**, không phải số vụ tuyệt đối — số tuyệt đối tăng theo lượng người chơi và làm mình hoảng nhầm chỗ. Dưới **99%** là có vấn đề rõ, từ **99,5%** trở lên là ổn định. Kèm theo là chia theo dòng máy và theo bản app, vì một bản hỏng trên một dòng máy hay bị trung bình che mất.
- `Senior` **Bắt hết exception cho game khỏi văng — sai ở đâu?**
  → Đó là đổi một lỗi **nhìn thấy** lấy một lỗi **âm thầm**: dữ liệu hỏng dần, người chơi mất tiến trình, và mình mất luôn báo cáo để sửa. `catch { }` rỗng trên đường gameplay chính là cờ đỏ. Bắt exception phải đi kèm ghi nhận (breadcrumb, log) và một đường xử lý thật, chứ không phải nuốt cho êm.

**Khung trả lời 60 giây** — "App văng ở máy người chơi, không tái hiện được. Anh làm gì?"

> Việc đầu tiên là **phân loại**, vì ba hiện tượng rất khác nhau đều được người chơi gọi là "văng": crash có stack trace; **ANR** là main thread bị chặn quá vài giây; và **bị hệ điều hành kill vì hết RAM** thì không có stack gì cả, app biến mất sạch. Đi sai nhánh ở bước này là mất cả tuần.
>
> Rồi tìm **mẫu chung**: tập trung ở dòng máy nào, phiên bản OS nào, bắt đầu từ bản app nào, và có tương quan với thời lượng phiên chơi không. Câu cuối là câu phân biệt rò rỉ bộ nhớ với lỗi logic: tỉ lệ tăng theo thời gian chơi và tập trung ở máy RAM thấp thì gần như chắc là bộ nhớ.
>
> Thứ làm cả quy trình này khả thi là **breadcrumb** — custom key gắn kèm mỗi báo cáo: scene, thời lượng phiên, bộ nhớ, save version, 10 hành động gần nhất, cộng một ring buffer 200 dòng log trong RAM. Rẻ, và đó là khác biệt giữa "lỗi ở `Inventory.Add`" và "lỗi ở `Inventory.Add` ngay sau khi mua gói 3 món khi túi đầy".

**Họ sẽ đào tiếp**

- *"Stack toàn hex thì sao?"* → Bản IL2CPP crash trong code native nên phải **symbolicate**: `symbols.zip` cho Android (nộp lên Play Console hoặc dùng `ndk-stack`), `.dSYM` cho iOS. Phải là symbol của **đúng bản build đó** — dùng nhầm bản thì tên hàm sai mà không có cảnh báo nào, nên symbol phải được lưu cùng artifact của từng bản phát hành.
- *"ANR trong Unity do đâu?"* → Main thread bị chặn: I/O đồng bộ khi save hoặc chuyển scene, `Resources.UnloadUnusedAssets()` gọi giữa gameplay, parse JSON lớn, chờ callback SDK quảng cáo, compile shader lần đầu trên máy yếu. Chữa bằng cách đẩy sang thread nền hoặc trải ra nhiều frame, và luôn có màn che để người chơi biết hệ thống còn sống.
- *"Chỉ số nào?"* → **Crash-free sessions**, không phải số vụ tuyệt đối — số tuyệt đối tăng theo lượng người chơi và làm bạn hoảng nhầm chỗ. Dưới 99% là có vấn đề rõ, từ 99.5% trở lên là ổn định.
- *"Làm sao tái hiện?"* → Cheat console để nhảy thẳng tới trạng thái; nút gửi báo lỗi trong game đính kèm **save của người chơi** (thường chính nó là chìa khoá); seed cố định ở chế độ debug; và dựng lại điều kiện xấu — máy 2GB, mạng chập chờn, máy đã nóng 15 phút.
- *"Bắt hết exception cho game khỏi văng thì sao?"* → Đó là đổi một lỗi nhìn thấy lấy một lỗi âm thầm: dữ liệu hỏng dần, người chơi mất tiến trình, và bạn mất luôn báo cáo. Bắt exception phải đi kèm ghi nhận và một đường xử lý thật.

**Cờ đỏ**

- Kể bug theo kiểu ly kỳ mà không kể **cách thu hẹp giả thuyết** — người phỏng vấn nghe quy trình, không nghe cốt truyện.
- Không lưu symbol theo bản.
- `catch { }` rỗng trên đường gameplay chính.
- Chỉ test trên máy flagship.
- Không phân biệt được crash, ANR và bị kill vì hết RAM.

**Số / ví dụ nên thuộc**

- ANR: main thread không phản hồi quá **~5 giây** (Android).
- Crash-free sessions: **< 99%** là có vấn đề, **≥ 99.5%** là ổn định.
- Ring buffer **200 dòng** log + **10** breadcrumb hành động gần nhất.
- Android `symbols.zip`, iOS `.dSYM` — lưu cùng mỗi bản phát hành.
