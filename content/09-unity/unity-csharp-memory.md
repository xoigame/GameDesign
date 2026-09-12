---
title: C#, GC và bộ nhớ trong Unity
icon: 🧮
summary: Vì sao game khựng đều đặn mỗi vài giây, cái gì cấp phát mà nhìn code không ra, và chọn giữa Coroutine, async/await, UniTask và Awaitable — phần C# mà Unity trả lời khác .NET thường.
status: deep
read: 635
level: intermediate
order: 35
tags: [unity, csharp, memory, gc, performance]
related: [unity-optimization, unity-game-loop, unity-design-patterns, performance, unity-build-platform]
---

Unity chạy C#, nhưng ba thứ khiến nó không giống .NET thường: **GC không nén và không phân thế hệ**, **ngân sách 16.6ms mỗi frame** biến một lần thu gom thành thứ người chơi nhìn thấy, và **IL2CPP là AOT** nên code chạy tốt trong Editor có thể nổ trên thiết bị. Node này là phần C# mà phỏng vấn Unity hỏi, và là phần [[unity-optimization]] giả định bạn đã biết.

## GC của Unity: không nén, không phân thế hệ

Mono và IL2CPP dùng Boehm — một collector **conservative, non-generational, non-compacting**. Ba hệ quả thực tế, không cái nào có trong .NET trên server:

- **Heap chỉ lớn lên.** Cấp phát 200MB một lần trong màn load thì heap giữ kích cỡ đó tới hết phiên chơi, dù đã thu gom xong. Trên máy 3GB, đó là khác biệt giữa sống và bị hệ điều hành kill.
- **Phân mảnh.** Không nén nghĩa là sau vài giờ chơi, tổng chỗ trống còn nhiều nhưng không có khối liền đủ lớn, nên vẫn phải xin thêm bộ nhớ.
- **Thời gian thu gom tỉ lệ với số object đang sống**, không phải số rác. Giữ 100 nghìn object nhỏ là trả giá ở *mọi* lần GC, kể cả khi không tạo thêm rác.

**Incremental GC** (bật mặc định) chia việc thu gom ra nhiều frame, biến một spike 12ms thành vài lần 1–2ms. Nó **không giảm tổng chi phí**, không cứu được nếu bạn cấp phát nhanh hơn nó dọn, và có write barrier tốn nhẹ ở mỗi lần ghi tham chiếu. Nó là lưới an toàn, không phải giấy phép cấp phát.

Đo bằng cột **GC Alloc** trong Profiler Hierarchy (sắp xếp giảm dần — nhìn 30 giây là ra thủ phạm), hoặc bằng overlay `ProfilerRecorder` như demo cuối node. Mục tiêu thực tế cho gameplay: **0 B mỗi frame ở trạng thái chơi bình thường**. Không phải "ít" mà là 0 — vì 200 B/frame × 60fps × 60 giây = 720KB mỗi phút, và đó là một cú khựng đang được hẹn giờ.

## Cái gì cấp phát mà nhìn code không ra

| Viết thế này | Cấp phát gì | Thay bằng |
|---|---|---|
| `foreach` trên biến kiểu `IEnumerable<T>` | Boxing enumerator | Giữ kiểu cụ thể (`List<T>`, mảng) — enumerator của chúng là struct |
| `list.Where(...).OrderBy(...).ToArray()` | Delegate + closure + mảng mới | Vòng `for` và một buffer dùng lại |
| `() => Do(localVar)` | Closure object mỗi lần tạo | Đưa biến thành field, hoặc cache delegate vào field |
| `Debug.Log($"hp {hp}")` | String mới **và** vẫn chạy ở bản Release | Bọc trong hàm `[Conditional("UNITY_EDITOR")]` |
| `myEnum.ToString()` | Boxing + tra tên qua reflection | Bảng `string[]` tra theo `(int)` |
| `Physics.RaycastAll` | Mảng mới mỗi lần gọi | `RaycastNonAlloc` với buffer là field |
| `GetComponentsInChildren<T>()` | Mảng mới | Overload nhận sẵn `List<T>` |
| `yield return new WaitForSeconds(1f)` | Object mới mỗi vòng lặp | `static readonly WaitForSeconds` cache lại |
| Truyền struct vào tham số kiểu interface | Boxing struct lên heap | Generic `void Take<T>(T x) where T : IDamageable` |
| `label.text = $"{hp}/{max}"` | String mới mỗi frame | `label.SetText("{0}/{1}", hp, max)` — 0 B |

Ba dòng đầu chiếm phần lớn trường hợp thật. Và nhớ chiều ngược lại: `foreach` trên `List<T>` hay `Dictionary<K,V>` **không** cấp phát vì enumerator của chúng là struct. Câu "đừng dùng foreach trong Unity" là tàn dư từ Unity 5; nói ra bây giờ sẽ bị hỏi lại.

## Struct, class, và chỗ struct phản chủ

`Vector3`, `Quaternion`, `RaycastHit`, `Color` là struct — truyền đi là **copy**, không cấp phát. Tốt, cho tới khi:

- **Struct lớn** (quá ~16–24 byte) truyền qua lại nhiều: chi phí copy vượt chi phí một tham chiếu. Dùng `in` cho tham số chỉ đọc, `ref` khi thật sự cần sửa.
- **Struct trong `List<T>`**: `list[i].hp -= 10` **không biên dịch**, vì indexer trả về bản sao. Phải lấy ra, sửa, gán lại — hoặc dùng mảng, vì mảng trả về tham chiếu.
- **Struct ép sang interface** → boxing. Đây là cái bẫy im lặng nhất: một `List<ITickable>` chứa struct, tick 500 lần mỗi frame, là 500 object rác mỗi frame.
- **Struct có field thay đổi được** nằm trong class rồi sửa qua property: sửa lên bản sao, mất thay đổi, không cảnh báo.

Luật thực dụng: struct cho dữ liệu nhỏ, bất biến, số lượng lớn. Class cho mọi thứ có định danh riêng.

## Coroutine, async/await, UniTask, Awaitable

Bốn cách làm việc bất đồng bộ; câu hỏi luôn là *chọn cái nào và vì sao*:

| | Coroutine | `async Task` | UniTask | `Awaitable` (Unity 6) |
|---|---|---|---|---|
| Cấp phát | Enumerator + mỗi `WaitForSeconds` | `Task` + state machine (class) | ~0 (struct + pool) | ~0 (pool nội bộ) |
| Tự dừng khi GameObject destroy | **Có** — gắn với MonoBehaviour | **Không** | Có, qua token | Có, qua `destroyCancellationToken` |
| Trả về giá trị | Không | Có | Có | Có |
| `try/catch` quanh chỗ chờ | Không | Có | Có | Có |
| Chạy trên thread khác | Không | Có | Có | Có (`BackgroundThreadAsync`) |
| Cần package ngoài | Không | Không | **Có** | Không |

Cái bẫy đắt nhất nằm ở dòng thứ hai. `async void Start()` rồi `await` một request 3 giây, người chơi thoát scene — **task vẫn chạy**, và khi quay lại thì `this` đã bị destroy: `MissingReferenceException`, hoặc tệ hơn là sửa state của một object không còn tồn tại mà không báo gì. Từ Unity 2022, mọi MonoBehaviour có sẵn `destroyCancellationToken`; truyền nó vào **mọi** chỗ chờ — đây là luật, không phải khuyến nghị.

```csharp
async Awaitable LoadAndShowAsync() {
    var token = destroyCancellationToken;           // huỷ khi GameObject bị destroy
    await Awaitable.WaitForSecondsAsync(0.5f, token);
    await Awaitable.BackgroundThreadAsync();        // sang thread nền để parse
    var parsed = Parse(rawJson);                    // KHÔNG đụng API Unity ở đây
    await Awaitable.MainThreadAsync();              // quay về main thread trước khi chạm UI
    label.SetText(parsed.title);
}
```

Coroutine vẫn đúng cho thứ gắn chặt vòng đời GameObject và không cần trả giá trị: ngắn hơn, tự dọn. Đừng đổi cả dự án sang async vì "hiện đại hơn".

## IL2CPP là AOT — thứ Editor không bắt được

Editor chạy Mono có JIT; bản mobile chạy IL2CPP **không có JIT**. Những thứ biên dịch được nhưng nổ trên thiết bị:

- **`System.Reflection.Emit`**, `dynamic`, và mọi thư viện sinh code lúc chạy — không dùng được.
- **Generic virtual method trên value type** chưa xuất hiện ở đâu trong code tĩnh → `ExecutionEngineException` lúc gọi. Né bằng cách "chạm" tới tổ hợp generic đó một lần trong code, hoặc tránh generic virtual với struct.
- **Managed Stripping** xoá code không ai gọi **tĩnh**: DTO chỉ được tạo qua reflection sẽ biến mất, deserialize ra object toàn giá trị mặc định mà **không có exception**. Chi tiết ở [[unity-build-platform]].

Nguyên tắc: thứ gì "tìm kiểu theo tên" đều phải ghim bằng `link.xml` hoặc `[Preserve]`, và phải test trên **bản Release**, không phải Development.

## Native memory — phần không nằm trong GC

Texture, mesh, audio buffer, render target nằm ở **native memory**, không phải managed heap. Nghĩa là:

- Chúng thường chiếm **phần lớn RAM** của một game mobile, và `GC.Collect()` không đụng tới chúng.
- `Resources.UnloadUnusedAssets()` mới là thứ trả lại chúng, và nó **đắt** (quét toàn bộ tham chiếu) — gọi ở màn hình loading, đừng gọi giữa gameplay.
- `NativeArray`, `NativeList` (Collections package) cũng là native: **phải `Dispose`**, và `Allocator` quyết định vòng đời (`Temp` trong một frame, `TempJob` vài frame, `Persistent` lâu dài).

Memory Profiler package là công cụ đúng để nhìn phần này; Profiler thường chỉ cho biết tổng.

## Bẫy lộ ra khi build

- Alloc trong `Update` nhìn "vô hại" trong Editor vì Editor đằng nào cũng cấp phát — chỉ bản build cho con số thật.
- `Debug.Log` chạy cả ở Release, kéo theo format chuỗi và stack trace.
- Heap phình trong màn load rồi không trả lại: máy 3GB chết ở màn thứ ba, máy dev 32GB không bao giờ thấy.
- `async void` nuốt exception — lỗi biến mất không dấu vết.
- `NativeArray` quên `Dispose`: Editor hiện leak warning khi thoát Play, bản build rò rỉ thật và im lặng.

## Kiểm tra nhanh

- [ ] Profiler ở trạng thái chơi bình thường: **GC Alloc = 0 B/frame**
- [ ] Mọi chỗ `await` trong MonoBehaviour có `destroyCancellationToken`
- [ ] Không `async void` nào ngoài event handler bắt buộc
- [ ] `WaitForSeconds` được cache, không `new` trong vòng lặp
- [ ] Mọi `NativeArray` có cặp cấp phát/`Dispose` nhìn thấy được
- [ ] Đo trên bản build Release, máy yếu nhất, phút thứ 15

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc tối ưu bộ nhớ**

AI mạnh ở hai việc và yếu ở một việc. Mạnh: **soát một file để chỉ ra chỗ cấp phát** — nó nhận ra closure, boxing, LINQ nhanh hơn mắt người; và **viết lại một hàm sang phiên bản không alloc** khi bạn đã chỉ đúng hàm. Yếu: **quyết định cái gì đáng tối ưu**, vì nó không có Profiler — nó sẽ tối ưu hàm chạy ba lần mỗi màn và bỏ qua hàm chạy 500 lần mỗi frame.

Quy trình đúng: bạn đo → bạn chọn hàm → AI viết lại → bạn đo lại. Đừng đảo thứ tự. Khi AI khẳng định "cái này không cấp phát", bắt nó nói **vì sao** (enumerator là struct? buffer dùng lại?) — lý do sai là dấu hiệu kết luận sai.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Số đo hiện tại: bao nhiêu B/frame, ở hàm nào, đo bằng gì, trên thiết bị nào.
- Phiên bản Unity và backend (Mono hay IL2CPP) — quyết định thứ gì dùng được.
- Hàm đó chạy bao nhiêu lần mỗi frame. Không nói thì AI tối ưu nhầm chỗ.
- Ràng buộc: có được thêm package (UniTask, Collections) không, có được đổi API công khai không.

**Mẫu prompt**

```
Unity 6, IL2CPP, Android. Profiler báo TickEnemies() cấp phát 4.2 KB/frame,
gọi 1 lần/frame với 120 enemy. File: <dán>

Viết lại để đạt 0 B/frame. Ràng buộc:
- KHÔNG thêm package ngoài
- KHÔNG đổi chữ ký public của EnemyManager
- Giữ nguyên hành vi, kể cả thứ tự duyệt
Với mỗi thay đổi, nói rõ nó bỏ được khoản cấp phát nào và vì sao.
Cuối cùng liệt kê những chỗ bạn NGHI còn alloc nhưng không chắc.
```

**Bẫy thường gặp:** AI thay `List<T>` bằng `NativeArray<T>` để "bỏ GC" mà không viết `Dispose`. Trong Editor chỉ hiện một leak warning lúc thoát Play — dễ bỏ qua; trên build là rò rỉ thật, im lặng, và lộ ra sau 40 phút chơi khi máy hết bộ nhớ. Bắt AI chỉ ra cặp cấp phát/giải phóng và `Allocator` cho **từng** native container nó thêm vào.

## 💻 Code

Demo dựng một overlay đo **GC Alloc mỗi frame** bằng `ProfilerRecorder`, và một công tắc chạy cùng một việc theo hai đường: đường cấp phát (LINQ + closure + string nội suy) và đường sạch (vòng `for` + buffer dùng lại + `SetText`). Nhấn Space để đổi và nhìn con số nhảy từ vài KB/frame về 0 — kiểm chứng ngay trong Play Mode, không cần mở Profiler.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Hierarchy có AllocLab với script Alloc Lab và Canvas chứa Label, Inspector hiện các trường Label, Mode, Enemy Count, Toggle Key và bảng kết quả mong đợi">
  <rect x="10" y="10" width="200" height="280" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <rect x="16" y="52" width="188" height="20" rx="4" fill="#b197fc" opacity="0.18"/>
  <text x="22" y="67" class="fig-label" font-size="12" font-weight="600">AllocLab  (AllocLab.cs)</text>
  <text x="22" y="88" class="fig-muted" font-size="12">▾ Canvas  (Screen Space Overlay)</text>
  <text x="38" y="106" class="fig-muted" font-size="11">Label  (TextMeshProUGUI)</text>
  <line x1="10" y1="122" x2="210" y2="122" class="fig-line"/>
  <text x="22" y="142" class="fig-label" font-size="12" font-weight="600">Kết quả mong đợi</text>
  <text x="22" y="162" class="fig-muted" font-size="11">Mode = Allocating</text>
  <text x="34" y="178" class="fig-label" font-size="11">≈ 3–6 KB / frame</text>
  <text x="22" y="198" class="fig-muted" font-size="11">Mode = Clean</text>
  <text x="34" y="214" class="fig-label" font-size="11">0 B / frame</text>
  <line x1="10" y1="230" x2="210" y2="230" class="fig-line"/>
  <text x="22" y="250" class="fig-muted" font-size="10">Số trong Editor chỉ để so hai</text>
  <text x="22" y="264" class="fig-muted" font-size="10">đường với nhau. Con số thật</text>
  <text x="22" y="278" class="fig-muted" font-size="10">lấy ở bản build Release.</text>
  <rect x="226" y="10" width="424" height="280" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#b197fc" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Alloc Lab (Script)  (AllocLab)</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Label</text><text x="440" y="82" class="fig-label" font-size="11">Label (TextMeshProUGUI)</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Mode</text><text x="440" y="98" class="fig-label" font-size="11">Allocating ▾</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Enemy Count</text><text x="440" y="114" class="fig-label" font-size="11">200</text>
  <text x="250" y="130" class="fig-muted" font-size="11">Toggle Key</text><text x="440" y="130" class="fig-label" font-size="11">Space ▾</text>
  <rect x="234" y="144" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="157" class="fig-label" font-size="12" font-weight="600">Overlay hiện gì</text>
  <text x="250" y="176" class="fig-muted" font-size="11">GC Alloc / frame</text><text x="440" y="176" class="fig-label" font-size="11">byte, trung bình 15 frame</text>
  <text x="250" y="192" class="fig-muted" font-size="11">GC Reserved</text><text x="440" y="192" class="fig-label" font-size="11">MB — heap đã xin, không trả lại</text>
  <text x="250" y="208" class="fig-muted" font-size="11">Mode hiện tại</text><text x="440" y="208" class="fig-label" font-size="11">Allocating / Clean</text>
  <rect x="234" y="222" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="235" class="fig-label" font-size="12" font-weight="600">Yêu cầu</text>
  <text x="250" y="254" class="fig-muted" font-size="11">TextMeshPro</text><text x="440" y="254" class="fig-label" font-size="11">có sẵn trong Unity 6</text>
  <text x="250" y="270" class="fig-muted" font-size="11">Input</text><text x="440" y="270" class="fig-label" font-size="11">Input System (package mới)</text>
</svg>
<figcaption>Một GameObject, một script, một label. Nhấn Space để đổi Mode và nhìn con số đổi theo ngay trong Play Mode.</figcaption>
</figure>

**Script**

```csharp
// AllocLab.cs — Unity 6 (6000.x). Gắn lên GameObject "AllocLab", kéo một TextMeshProUGUI vào Label.
// Nhấn Space để đổi giữa đường cấp phát và đường sạch, nhìn GC Alloc/frame đổi theo.
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TMPro;
using Unity.Profiling;
using UnityEngine;
using UnityEngine.InputSystem;

public class AllocLab : MonoBehaviour
{
    public enum Mode { Allocating, Clean }

    [SerializeField] TextMeshProUGUI label;
    [SerializeField] Mode mode = Mode.Allocating;
    [SerializeField] int enemyCount = 200;
    [SerializeField] Key toggleKey = Key.Space;

    ProfilerRecorder allocRecorder;      // byte cấp phát trong frame
    ProfilerRecorder reservedRecorder;   // heap đã xin của hệ điều hành

    struct Enemy { public int hp; public float distance; }

    readonly List<Enemy> enemies = new();
    readonly List<Enemy> buffer = new();                    // dùng lại, không cấp phát mỗi frame
    static readonly WaitForSeconds OneSecond = new(1f);     // cache, không new trong coroutine

    void OnEnable()
    {
        allocRecorder = ProfilerRecorder.StartNew(ProfilerCategory.Memory, "GC Allocated In Frame", 15);
        reservedRecorder = ProfilerRecorder.StartNew(ProfilerCategory.Memory, "GC Reserved Memory");

        enemies.Clear();
        for (int i = 0; i < enemyCount; i++)
            enemies.Add(new Enemy { hp = Random.Range(1, 100), distance = Random.Range(0f, 50f) });

        StartCoroutine(HeartbeatRoutine());
    }

    void OnDisable()
    {
        allocRecorder.Dispose();
        reservedRecorder.Dispose();
    }

    void Update()
    {
        var kb = Keyboard.current;
        if (kb != null && kb[toggleKey].wasPressedThisFrame)
            mode = mode == Mode.Allocating ? Mode.Clean : Mode.Allocating;

        int near = mode == Mode.Allocating ? CountNearAllocating() : CountNearClean();
        if (label == null) return;

        if (mode == Mode.Allocating)
            // string nội suy: một string mới mỗi frame — chính dòng này cũng là alloc
            label.text = $"Allocating | {AverageAlloc()} B/frame | heap {ReservedMb():0.0} MB | gan: {near}";
        else
            // SetText format thẳng vào buffer nội bộ của TMP: 0 B
            label.SetText("Clean | {0} B/frame | heap {1:0.0} MB | gan: {2}", AverageAlloc(), ReservedMb(), near);
    }

    // ---- đường CẤP PHÁT: LINQ + closure + mảng mới mỗi frame ----
    int CountNearAllocating()
    {
        float limit = 10f;                                  // biến cục bộ bị closure bắt
        var near = enemies.Where(e => e.distance < limit)    // delegate + closure object
                          .OrderBy(e => e.distance)          // comparer + buffer nội bộ
                          .ToArray();                        // mảng mới mỗi frame
        return near.Length;
    }

    // ---- đường SẠCH: vòng for trên List<T>, buffer dùng lại ----
    int CountNearClean()
    {
        buffer.Clear();                                      // giữ capacity, không cấp phát
        for (int i = 0; i < enemies.Count; i++)
        {
            var e = enemies[i];                              // struct: copy trên stack
            if (e.distance < 10f) buffer.Add(e);
        }
        return buffer.Count;
    }

    IEnumerator HeartbeatRoutine()
    {
        // "yield return new WaitForSeconds(1f)" tạo một object mỗi vòng; cache thì không.
        while (enabled) yield return OneSecond;
    }

    long AverageAlloc()
    {
        if (!allocRecorder.Valid || allocRecorder.Count == 0) return 0;
        long sum = 0;
        for (int i = 0; i < allocRecorder.Count; i++) sum += allocRecorder.GetSample(i).Value;
        return sum / allocRecorder.Count;
    }

    float ReservedMb() => reservedRecorder.Valid ? reservedRecorder.LastValue / (1024f * 1024f) : 0f;
}
```

**Chạy thử**
- Play với `Mode = Allocating`: overlay hiện khoảng **3–6 KB/frame** (đổi theo `Enemy Count`), và `heap` nhích lên đều.
- Nhấn Space: con số về **0 B/frame** và đứng yên; `heap` ngừng lớn.
- Mở Profiler → Hierarchy → sắp xếp theo cột **GC Alloc**: ở Allocating, `AllocLab.Update` nằm đầu bảng; ở Clean nó biến khỏi danh sách.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | `struct` và `class` khác nhau thế nào? `Vector3` là cái nào? |
| Junior | Coroutine dừng khi nào? |
| Mid | Game khựng đều mỗi vài giây dù fps trung bình vẫn ổn. Nghi gì? |
| Mid | Kể ba thứ cấp phát mà nhìn code không thấy. |
| Senior | `async/await` trong MonoBehaviour nguy hiểm ở đâu? |
| Senior | Vì sao code chạy trong Editor mà nổ trên bản IL2CPP? |

**Khung trả lời 60 giây** — "Game khựng đều mỗi vài giây, anh làm gì?"

> Nghi GC trước: khựng **đều đặn theo chu kỳ** là chữ ký của nó, khác hẳn tụt fps liên tục. Mở Profiler, sắp xếp Hierarchy theo cột **GC Alloc** giảm dần — thường 30 giây là ra hàm thủ phạm, và gần như luôn là LINQ, closure trong lambda, hoặc string nối trong `Update`.
>
> Phần nên nói thêm là **vì sao nó đau hơn ở Unity**: collector là Boehm — không nén, không phân thế hệ — nên heap chỉ lớn lên chứ không co lại, và thời gian mỗi lần thu gom tỉ lệ với **số object đang sống**, không phải số rác vừa tạo. Incremental GC chia spike ra nhiều frame nhưng không giảm tổng chi phí.
>
> Mục tiêu tôi đặt là 0 B/frame ở trạng thái chơi bình thường. Không phải cầu toàn: 200 B/frame ở 60fps là 720KB mỗi phút — một cú khựng đang được hẹn giờ.

**Họ sẽ đào tiếp**

- *"Ba thứ cấp phát mà nhìn không ra?"* → Closure bắt biến cục bộ trong lambda; boxing khi struct bị ép sang interface (một `List<ITickable>` chứa struct, tick 500 lần/frame = 500 object rác); và `foreach` trên biến kiểu **interface** `IEnumerable<T>`. Nói được cả chiều ngược lại mới thuyết phục: `foreach` trên `List<T>` **không** alloc vì enumerator là struct.
- *"`async/await` nguy ở đâu?"* → `Task` **không** tự huỷ khi GameObject bị destroy. Người chơi thoát scene giữa lúc đang chờ, continuation quay lại và chạm vào `this` đã chết. Từ Unity 2022 mọi MonoBehaviour có `destroyCancellationToken` — truyền vào mọi chỗ chờ. Và `async void` nuốt exception, chỉ dùng cho event handler bắt buộc.
- *"UniTask hay Awaitable?"* → `Awaitable` của Unity 6 có sẵn, không thêm package, đủ cho phần lớn việc. UniTask hơn về số toán tử và chạy được trên phiên bản Unity cũ. Coroutine chưa chết: ngắn hơn và tự dừng theo vòng đời GameObject.
- *"Vì sao IL2CPP nổ mà Editor không?"* → Editor chạy Mono có JIT, build là AOT: `Reflection.Emit` và `dynamic` không tồn tại; generic virtual trên value type chưa dùng tĩnh thì ném `ExecutionEngineException`; Managed Stripping xoá thứ chỉ gọi qua reflection, làm deserialize ra object rỗng **mà không có exception nào**.
- *"`list[i].hp -= 10` với `List<struct>`?"* → Không biên dịch, vì indexer trả về **bản sao**. Phải lấy ra, sửa, gán lại — hoặc dùng mảng, vì mảng trả về tham chiếu.

**Cờ đỏ**

- "Tôi gọi `GC.Collect()` cho chắc" — đẩy nguyên một spike vào đúng frame mình gọi.
- "Đừng dùng `foreach` trong Unity" — đúng với Unity 5, sai từ lâu.
- Không phân biệt managed heap và native memory: texture, mesh, audio buffer **không** nằm trong GC heap, và chúng thường mới là phần lớn RAM.
- Đo GC alloc trong Editor rồi kết luận cho bản build.
- Tối ưu theo cảm giác, không có con số trước/sau.

**Số / ví dụ nên thuộc**

- Ngân sách thực tế: **0 B/frame** khi chơi bình thường; 200 B/frame ≈ 720KB/phút.
- GC của Unity là Boehm: **non-generational, non-compacting**, heap không trả lại hệ điều hành.
- `ProfilerRecorder` với `"GC Allocated In Frame"` và `"GC Reserved Memory"` để đo tại chỗ.
- `destroyCancellationToken` — có sẵn trong MonoBehaviour từ Unity 2022.
