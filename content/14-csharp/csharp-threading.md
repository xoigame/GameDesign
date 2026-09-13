---
id: csharp-threading
title: Đa luồng và luật main thread
icon: 🧵
summary: Race condition xảy ra chính xác ở đâu, lock/Interlocked/volatile dùng cái nào, mẫu hàng đợi producer–consumer để đưa kết quả về main thread, và vì sao trong Unity thì Job System gần như luôn là câu trả lời đúng.
status: deep
read: 795
level: advanced
order: 90
tags: [csharp, threading, concurrency, race-condition, jobs, interview]
related: [csharp-async, csharp-collections, unity-dots-jobs, unity-optimization]
---

Đa luồng trong game có một luật bao trùm mọi luật khác: **API của engine chỉ gọi được từ main thread.** `transform.position`, `GetComponent`, `Instantiate`, hầu hết mọi thứ trong `UnityEngine` — chạm từ thread khác là exception, hoặc tệ hơn là hỏng âm thầm.

Nên câu hỏi trong game không phải "làm sao chạy song song" mà là **"phần nào của công việc tách được khỏi engine"**. Phần tách được thì đẩy sang thread khác; phần chạm engine thì gom kết quả lại và áp dụng trên main thread. Toàn bộ node này xoay quanh đúng ranh giới đó.

## Tách được và không tách được

| Đẩy sang thread khác được | Phải ở main thread |
|---|---|
| Tìm đường trên lưới dữ liệu thuần (A*, flow field) | Mọi thứ chạm `Transform`, `GameObject`, component |
| Sinh map thủ tục, dựng dữ liệu mesh (mảng số) | `Instantiate`, `Destroy`, `AddComponent` |
| Giải nén, parse JSON, mã hoá save | `Mesh.SetVertices`, mọi lệnh gọi API đồ hoạ |
| Tính toán mô phỏng thuần số | `Time.deltaTime`, `UnityEngine.Random` |
| Toán trên struct: `Vector3`, `Mathf` | Physics, Animator, UI |

`Debug.Log` gọi được từ thread khác, và đó là công cụ chẩn đoán duy nhất bạn có ở đó. `UnityEngine.Random` thì **không** an toàn — mỗi thread cần một `System.Random` riêng, vì `System.Random` cũng không an toàn khi dùng chung.

## Race condition — chính xác thì hỏng ở đâu

```csharp
int counter = 0;
// hai thread cùng chạy dòng này 100.000 lần
counter++;          // KHÔNG nguyên tử: đọc -> cộng 1 -> ghi
```

`counter++` là **ba** thao tác. Hai thread đọc cùng giá trị 41, cả hai cộng thành 42, cả hai ghi 42 — mất một lần đếm. Kết quả cuối nhỏ hơn 200.000 và **khác nhau ở mỗi lần chạy**.

Ngoài chuyện mất cập nhật, còn hai thứ khó thấy hơn:

- **Khả năng nhìn thấy**: thread A ghi vào một field, thread B có thể đọc ra giá trị cũ vô thời hạn vì giá trị mới còn nằm trong cache của lõi khác.
- **Sắp xếp lại lệnh**: trình biên dịch và CPU được phép đổi thứ tự các lệnh miễn là kết quả *trên một thread* không đổi. Nhìn từ thread khác thì thứ tự có thể khác hẳn code bạn viết.

Đó là lý do bug đa luồng "không tái hiện được": nó phụ thuộc vào thời điểm, số lõi, và cả việc có đang chạy profiler hay không.

## `lock`, `Interlocked`, `volatile` — dùng cái nào

```csharp
readonly object gate = new object();            // đối tượng khoá RIÊNG, không public

lock (gate) { counter++; }                       // 1) đoạn tới hạn: nhiều dòng, nhiều biến

Interlocked.Increment(ref counter);              // 2) một phép trên một biến — nhanh hơn lock nhiều

volatile bool running;                           // 3) cờ đọc/ghi từ nhiều thread
```

| Công cụ | Dùng cho | Đừng dùng cho |
|---|---|---|
| `lock` | Bảo vệ **nhiều dòng** hoặc nhiều biến phải nhất quán với nhau | Một phép tăng/gán đơn lẻ (dùng `Interlocked`) |
| `Interlocked` | Đếm, đổi chỗ, so-sánh-và-đổi (`CompareExchange`) | Bảo vệ một chuỗi thao tác |
| `volatile` | Cờ dừng, cờ sẵn sàng | Thay thế cho khoá — nó **không** làm `x++` nguyên tử |

Bốn luật về `lock` đủ để tránh hầu hết tai nạn:

1. **Khoá trên một object private `readonly`.** Đừng `lock(this)`, `lock(typeof(X))` hay `lock("chuỗi")` — chuỗi được intern nên cả chương trình đang khoá chung một thứ.
2. **Giữ khoá ngắn nhất có thể.** Tính toán ngoài khoá, chỉ ghi kết quả trong khoá.
3. **Đừng gọi code lạ trong khi giữ khoá** — callback của người khác có thể lấy một khoá khác và tạo ra deadlock.
4. **Nhiều khoá thì luôn lấy theo cùng một thứ tự.** Thread A lấy khoá 1 rồi 2, thread B lấy 2 rồi 1 — đó là toàn bộ công thức của deadlock.

Và một hạn chế của ngôn ngữ: **không `await` được bên trong `lock`.** Cần loại trừ lẫn nhau trong code bất đồng bộ thì dùng `SemaphoreSlim(1,1)` với `await sem.WaitAsync()` — xem [[csharp-async]].

## Mẫu chuẩn trong game: hàng đợi về main thread

Đây là mẫu dùng ở mọi dự án Unity có công việc nền, và là câu trả lời an toàn cho câu hỏi "anh chạy việc nặng ở đâu":

<figure class="fig">
<svg viewBox="0 0 660 190" role="img" aria-label="Sơ đồ producer consumer: các thread nền tính toán rồi đẩy kết quả vào ConcurrentQueue, main thread rút hàng đợi trong Update và áp dụng lên GameObject">
  <rect x="14" y="30" width="160" height="120" rx="9" class="fig-box"/>
  <text x="94" y="52" text-anchor="middle" class="fig-label" font-size="12" font-weight="600">Thread nền</text>
  <text x="94" y="74" text-anchor="middle" class="fig-muted" font-size="10">A* trên mảng int</text>
  <text x="94" y="92" text-anchor="middle" class="fig-muted" font-size="10">parse JSON</text>
  <text x="94" y="110" text-anchor="middle" class="fig-muted" font-size="10">dựng dữ liệu mesh</text>
  <text x="94" y="134" text-anchor="middle" class="fig-muted" font-size="10">KHÔNG chạm engine</text>
  <line x1="176" y1="90" x2="244" y2="90" class="fig-line" stroke="#51cf9b" stroke-width="2"/>
  <text x="210" y="80" text-anchor="middle" class="fig-muted" font-size="10">Enqueue</text>
  <rect x="248" y="52" width="150" height="76" rx="9" fill="#51cf9b" opacity="0.16"/>
  <text x="323" y="76" text-anchor="middle" class="fig-label" font-size="12" font-weight="600">ConcurrentQueue</text>
  <text x="323" y="96" text-anchor="middle" class="fig-muted" font-size="10">kết quả thuần dữ liệu</text>
  <text x="323" y="114" text-anchor="middle" class="fig-muted" font-size="10">an toàn nhiều thread</text>
  <line x1="400" y1="90" x2="468" y2="90" class="fig-line" stroke="#6ea8fe" stroke-width="2"/>
  <text x="434" y="80" text-anchor="middle" class="fig-muted" font-size="10">TryDequeue</text>
  <rect x="472" y="30" width="174" height="120" rx="9" class="fig-box"/>
  <text x="559" y="52" text-anchor="middle" class="fig-label" font-size="12" font-weight="600">Main thread · Update()</text>
  <text x="559" y="74" text-anchor="middle" class="fig-muted" font-size="10">rút tối đa N kết quả/frame</text>
  <text x="559" y="92" text-anchor="middle" class="fig-muted" font-size="10">Instantiate, gán transform</text>
  <text x="559" y="110" text-anchor="middle" class="fig-muted" font-size="10">cập nhật UI</text>
  <text x="559" y="134" text-anchor="middle" class="fig-muted" font-size="10">giới hạn N để không tụt frame</text>
  <text x="20" y="176" class="fig-muted" font-size="11">Ranh giới duy nhất giữa hai thế giới là hàng đợi. Không thread nền nào chạm engine; main thread không chờ thread nền.</text>
</svg>
<figcaption>Producer–consumer: thread nền chỉ sinh dữ liệu thuần, main thread là nơi duy nhất áp dụng chúng vào engine — và rút có giới hạn mỗi frame để không đánh đổi một cú khựng lấy tốc độ.</figcaption>
</figure>

Chi tiết dễ quên: **giới hạn số phần tử rút mỗi frame**. Rút hết một lượt 500 kết quả rồi `Instantiate` 500 object là đúng về đa luồng nhưng vẫn tụt frame — công sức tách thread coi như bỏ.

## Trong Unity, Job System thường là câu trả lời đúng

Tự quản `Thread` trong Unity được, nhưng Job System tốt hơn ở ba điểm mà tự viết rất khó đạt:

- **Hệ thống an toàn** phát hiện hai job cùng ghi một `NativeArray` và báo lỗi ngay trong Editor — bug race biến từ "không tái hiện được" thành "lỗi biên dịch lúc chạy".
- **Dùng chung bộ thread của engine**, không đẻ thêm thread cạnh tranh với worker của Unity.
- **Burst** biên dịch job sang mã máy vector hoá, thường nhanh hơn C# thường nhiều lần.

Đổi lại: chỉ nhận kiểu `unmanaged`, không dùng được `List<T>`, không delegate, không object tham chiếu. Chi tiết ở [[unity-dots-jobs]]. Câu trả lời phỏng vấn gọn: *"C# threading để hiểu cơ chế; trong Unity thì tôi dùng Job System, và chỉ tự quản thread cho việc I/O hoặc thư viện ngoài không hỗ trợ Job."*

## Collection an toàn nhiều thread

| Kiểu | Dùng khi | Bẫy |
|---|---|---|
| `ConcurrentQueue<T>` | Đưa kết quả từ nền về main thread | Không có `Peek` an toàn tuyệt đối; đừng dựa vào `Count` để điều khiển luồng |
| `ConcurrentDictionary<K,V>` | Cache dùng chung nhiều thread | `GetOrAdd` có thể **gọi factory nhiều lần** — factory phải rẻ và không có tác dụng phụ |
| `List<T>`, `Dictionary<K,V>` | Một thread duy nhất | Ghi đồng thời có thể làm **hỏng cấu trúc bên trong**, không chỉ mất dữ liệu — vòng lặp vô hạn là triệu chứng kinh điển |

Dòng cuối đáng nhớ: `Dictionary` bị ghi từ hai thread không chỉ mất một phần tử, nó có thể rơi vào trạng thái hỏng khiến lần đọc sau treo cứng. Đó là lý do "chắc không sao đâu" là câu trả lời tệ.

## Bẫy còn lại

- **Thread pool bị chặn**: gọi `.Result` bên trong một `Task.Run` ăn hết thread pool, và triệu chứng là mọi việc nền chậm dần rồi đứng.
- **Số thread**: `Environment.ProcessorCount` trên mobile thường 4–8, nhưng Unity đã giữ main thread và render thread. Đẻ 16 thread trên điện thoại là chậm hơn chứ không nhanh hơn.
- **`lock` trong `Update`** trên main thread: nếu thread nền đang giữ khoá lâu thì main thread đứng chờ — đúng thứ bạn định tránh.
- **Exception trong thread nền biến mất** nếu không bọc `try/catch`: thread chết im lặng, và bạn chỉ thấy "kết quả không bao giờ về".
- **`DateTime.Now` và `Stopwatch`** an toàn nhiều thread, nhưng `Time.deltaTime` thì không — nó là trạng thái của engine.

## Kiểm tra nhanh

- [ ] Không dòng nào chạm API Unity ngoài main thread
- [ ] Mọi state dùng chung đều được bảo vệ bằng `lock`/`Interlocked`, hoặc là bất biến
- [ ] Đối tượng khoá đều `private readonly`, không `lock(this)` hay `lock(chuỗi)`
- [ ] Thứ tự lấy nhiều khoá là cố định trong toàn dự án
- [ ] Hàng đợi về main thread có giới hạn số phần tử rút mỗi frame
- [ ] Mọi thân hàm chạy trên thread nền có `try/catch` và có đường báo lỗi về
- [ ] Đã cân nhắc Job System trước khi tự tạo `Thread`

## 🤖 Prompt cho AI

**Dùng AI thế nào cho code đa luồng**

Đây là chủ đề cần đảo vai: **đừng nhờ AI viết code đa luồng, hãy nhờ nó soát code đa luồng bạn viết.** Lý do rất cụ thể — code song song sai vẫn chạy đúng trong mọi lần test, nên "AI viết, tôi chạy thử thấy ổn" là quy trình không phát hiện được gì. Ngược lại, rà theo danh sách mẫu lỗi thì AI làm tốt: state dùng chung không khoá, khoá lấy theo thứ tự khác nhau, `lock` trên object công khai, `Dictionary` bị ghi từ nhiều thread.

Và với Unity thì câu hỏi đầu tiên phải là *"việc này có cần thread không, hay Job System làm được?"* — AI hiếm khi tự hỏi câu đó, nó sẽ dựng ngay một `Thread` hoặc `Task.Run`.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Dữ liệu nào dùng chung giữa các thread**, và ai đọc ai ghi. Đây là thông tin duy nhất thật sự quan trọng.
- **Có chạm API engine sau khi tính xong không** — quyết định có cần hàng đợi về main thread.
- **Unity hay .NET thuần**, và nếu Unity thì đã cân nhắc Job System chưa.
- **Số lõi mục tiêu** — điện thoại tầm trung 4–8 lõi, và Unity đã giữ hai.
- **Việc là I/O hay CPU**: I/O thì `async` là đủ, không cần thread.

**Mẫu prompt**

```
Unity 6, Android. Code dưới chạy pathfinding trên thread nền rồi áp dụng kết quả.

<dán code>

Rà theo đúng danh sách này, mỗi mục nêu số dòng:
1. Dòng nào chạm API Unity ngoài main thread
2. State nào dùng chung mà không có lock/Interlocked
3. lock trên object công khai (this, typeof, chuỗi)
4. Nhiều khoá lấy theo thứ tự khác nhau giữa các hàm
5. Collection không an toàn bị ghi từ nhiều thread
6. Thân hàm chạy trên thread nền không có try/catch

Sau đó trả lời: việc này có chuyển sang IJobParallelFor được không, và nếu
được thì cần đổi dữ liệu sang dạng nào (unmanaged, NativeArray).
KHÔNG viết lại toàn bộ; chỉ nêu thay đổi tối thiểu.
```

**Bẫy thường gặp:** AI sinh code gọi API Unity bên trong `Task.Run` hoặc `Parallel.For` — đúng trên .NET, ném exception trong Unity. Bẫy thứ hai: nó "sửa race" bằng cách thêm `volatile` vào một biến đếm, thứ **không** làm `x++` nguyên tử. Bẫy thứ ba: nó khoá quanh cả đoạn tính toán nặng, biến chương trình song song thành chương trình tuần tự có thêm chi phí khoá — bắt nó nói rõ khoá đang bảo vệ **dữ liệu nào** chứ không phải "đoạn code nào".

## 💻 Code

Demo cho thấy race condition bằng số (kết quả sai và khác nhau mỗi lần chạy), so `lock` với `Interlocked`, rồi dựng mẫu producer–consumer với hàng đợi rút có giới hạn — đúng mẫu dùng trong Unity. Chạy bằng `dotnet run`.

**Script**

```csharp
// Program.cs — .NET 6+ (dotnet new console && dotnet run)
using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

static class Program
{
    const int Threads = 4;
    const int PerThread = 250_000;

    static int unsafeCounter;
    static int lockedCounter;
    static int interlockedCounter;
    static readonly object gate = new object();      // private readonly: đúng cách

    static void Main()
    {
        Console.WriteLine($"{Threads} thread × {PerThread} lần tăng = kỳ vọng {Threads * PerThread}\n");

        // 1) không đồng bộ: sai, và sai khác nhau mỗi lần
        var sw = Stopwatch.StartNew();
        RunParallel(() => unsafeCounter++);
        Console.WriteLine($"  không khoá  : {unsafeCounter,9}  ({sw.ElapsedMilliseconds,3} ms)  <- MẤT dữ liệu");

        // 2) lock
        sw.Restart();
        RunParallel(() => { lock (gate) lockedCounter++; });
        Console.WriteLine($"  lock        : {lockedCounter,9}  ({sw.ElapsedMilliseconds,3} ms)");

        // 3) Interlocked
        sw.Restart();
        RunParallel(() => Interlocked.Increment(ref interlockedCounter));
        Console.WriteLine($"  Interlocked : {interlockedCounter,9}  ({sw.ElapsedMilliseconds,3} ms)  <- đúng và rẻ hơn\n");

        // 4) producer–consumer: nền tính, "main thread" áp dụng
        ProducerConsumerDemo();
    }

    static void RunParallel(Action body)
    {
        var tasks = new Task[Threads];
        for (int t = 0; t < Threads; t++)
            tasks[t] = Task.Run(() => { for (int i = 0; i < PerThread; i++) body(); });
        Task.WaitAll(tasks);
    }

    // Mẫu dùng trong Unity: thread nền chỉ sinh DỮ LIỆU, main thread áp dụng vào engine.
    static void ProducerConsumerDemo()
    {
        var results = new ConcurrentQueue<PathResult>();
        var done = 0;
        const int Jobs = 200;
        const int MaxApplyPerFrame = 8;               // trần để không tụt frame

        for (int j = 0; j < Jobs; j++)
        {
            int id = j;
            Task.Run(() =>
            {
                try
                {
                    var path = SolvePath(id);          // toán thuần, KHÔNG chạm engine
                    results.Enqueue(new PathResult { Id = id, Length = path });
                }
                catch (Exception e)
                {
                    // thread nền nuốt exception = "kết quả không bao giờ về"
                    results.Enqueue(new PathResult { Id = id, Length = -1, Error = e.Message });
                }
                finally { Interlocked.Increment(ref done); }
            });
        }

        int frame = 0, applied = 0, maxInOneFrame = 0;
        while (applied < Jobs)
        {
            frame++;
            int thisFrame = 0;
            while (thisFrame < MaxApplyPerFrame && results.TryDequeue(out var r))
            {
                // ĐÂY là chỗ duy nhất được Instantiate / gán transform trong Unity
                applied++; thisFrame++;
                if (r.Length < 0) Console.WriteLine($"   job {r.Id} lỗi: {r.Error}");
            }
            maxInOneFrame = Math.Max(maxInOneFrame, thisFrame);
            Thread.Sleep(1);                           // giả lập một frame
        }

        Console.WriteLine($"4) producer–consumer: {Jobs} job xong sau {frame} 'frame'");
        Console.WriteLine($"   nhiều nhất {maxInOneFrame} kết quả được áp dụng trong một frame (trần {MaxApplyPerFrame})");
        Console.WriteLine($"   thread nền đã chạy xong: {Volatile.Read(ref done)}/{Jobs}");
    }

    struct PathResult { public int Id; public int Length; public string Error; }

    static int SolvePath(int seed)
    {
        var rng = new Random(seed);                    // MỖI thread một Random riêng
        int acc = 0;
        for (int i = 0; i < 20_000; i++) acc += rng.Next(0, 3);
        return acc;
    }
}
```

**Chạy thử**
- Dòng "không khoá" in ra một số **nhỏ hơn 1.000.000** và **đổi mỗi lần chạy** — đó là race condition, nhìn thấy bằng số chứ không bằng lý thuyết.
- `lock` và `Interlocked` đều ra đúng 1.000.000; `Interlocked` thường nhanh hơn `lock` vài lần cho phép tăng một biến.
- Phần 4: số kết quả áp dụng trong một "frame" không bao giờ vượt trần 8, dù hàng đợi có lúc dồn hàng chục phần tử. Bỏ trần đi rồi chạy lại để thấy một frame nuốt cả trăm kết quả — đúng kiểu khựng mà tách thread lẽ ra phải tránh.
- Thử đổi `ConcurrentQueue` thành `Queue` thường: kết quả sẽ sai hoặc ném exception ngẫu nhiên, và không phải lần chạy nào cũng lộ ra.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Trong Unity, cái gì không gọi được từ thread khác?**
  → Gần như toàn bộ `UnityEngine`: `Transform`, `GameObject`, `Instantiate`, `Destroy`, component, physics, UI. Chỉ toán học thuần trên struct như `Vector3`, `Mathf` là an toàn, và `Debug.Log` gọi được. `UnityEngine.Random` thì không an toàn — mỗi thread cần một `System.Random` riêng.
- `Junior` **Race condition là gì?**
  → Là khi kết quả phụ thuộc vào thứ tự chạy của các thread. Ví dụ kinh điển: `counter++` gồm ba bước đọc–cộng–ghi, hai thread đọc cùng một giá trị rồi cùng ghi đè, mất một lần đếm. Triệu chứng đặc trưng là kết quả **khác nhau ở mỗi lần chạy**.
- `Mid` **`lock` và `Interlocked` khác nhau, dùng cái nào?**
  → `Interlocked` cho một phép trên một biến — tăng, gán, so-sánh-và-đổi; nó là lệnh nguyên tử của CPU nên rẻ hơn nhiều. `lock` cho đoạn tới hạn gồm nhiều dòng hoặc nhiều biến phải nhất quán với nhau. Đếm một biến mà dùng `lock` thì đúng nhưng phí.
- `Mid` **`volatile` giải quyết chuyện gì, không giải quyết chuyện gì?**
  → Nó bảo đảm mọi lần đọc/ghi biến đó thật sự chạm bộ nhớ và hạn chế việc sắp xếp lại lệnh quanh nó — hợp cho một cờ dừng. Nó **không** làm `x++` nguyên tử, nên không thay được `lock` hay `Interlocked`. Thấy ai "sửa race" bằng cách thêm `volatile` vào biến đếm là biết chưa hiểu vấn đề.
- `Mid` **Deadlock xảy ra thế nào, chặn ra sao?**
  → Hai thread giữ hai khoá và mỗi bên chờ khoá của bên kia. Cách chặn rẻ nhất là **luôn lấy nhiều khoá theo cùng một thứ tự** trong toàn dự án. Ngoài ra: giữ khoá ngắn, không gọi code lạ trong khi giữ khoá, và nếu cần thì `Monitor.TryEnter` có timeout để phát hiện thay vì treo.
- `Mid` **Đưa kết quả từ thread nền về main thread trong Unity thế nào?**
  → `ConcurrentQueue` cộng một vòng rút trong `Update`. Thread nền chỉ sinh **dữ liệu thuần**, main thread là nơi duy nhất áp dụng vào engine. Chi tiết quan trọng mà nhiều người quên: **giới hạn số phần tử rút mỗi frame** — rút hết 500 kết quả rồi `Instantiate` một lượt thì vẫn tụt frame, coi như công tách thread đổ đi.
- `Senior` **Khi nào anh tự tạo thread trong Unity?**
  → Hiếm. Việc song song nặng thì tôi dùng Job System: nó có hệ thống an toàn phát hiện hai job cùng ghi một `NativeArray` ngay trong Editor, dùng chung bộ thread của engine, và Burst biên dịch ra mã vector hoá. Tôi chỉ tự tạo thread cho I/O chặn hoặc khi buộc phải gọi một thư viện ngoài không hỗ trợ Job — và khi đó kết quả vẫn đi qua hàng đợi về main thread.
- `Senior` **`Dictionary` bị ghi từ hai thread thì sao?**
  → Không chỉ mất phần tử: cấu trúc bên trong có thể hỏng, và triệu chứng kinh điển là lần đọc sau **treo trong vòng lặp vô hạn**. Đó là loại bug tệ nhất vì nó xuất hiện trên máy người chơi chứ không phải máy mình. Dùng chung thì `ConcurrentDictionary`, và nhớ `GetOrAdd` có thể gọi factory nhiều lần nên factory phải rẻ và không có tác dụng phụ.
- `Senior` **Vì sao đẻ nhiều thread trên mobile lại chậm hơn?**
  → Vì số lõi thật thường 4–8, và Unity đã giữ main thread cùng render thread. Thêm thread không tạo thêm lõi; nó chỉ thêm chi phí chuyển ngữ cảnh, thêm cạnh tranh cache, và trên mobile còn kéo theo nhiệt và throttle. Tôi đặt số worker theo `Environment.ProcessorCount` trừ đi phần engine giữ, và đo lại trên thiết bị thật.

**Khung trả lời 60 giây** — "Anh chạy việc nặng ở đâu trong Unity?"

> Xuất phát từ một ranh giới: **API engine chỉ gọi được từ main thread.** Nên tôi tách công việc làm hai nửa. Nửa tính toán — tìm đường, sinh map, parse dữ liệu, dựng mảng đỉnh cho mesh — là toán thuần trên dữ liệu, đẩy ra khỏi main thread được. Nửa áp dụng — `Instantiate`, gán `transform`, cập nhật UI — bắt buộc ở main thread.
>
> Cầu nối giữa hai nửa là một **`ConcurrentQueue`**: thread nền đẩy kết quả vào, `Update` rút ra và áp dụng. Và tôi luôn đặt **trần số phần tử rút mỗi frame**, vì rút một lượt 500 kết quả rồi Instantiate hết thì vẫn tụt frame.
>
> Trong Unity thì mặc định của tôi là **Job System** chứ không phải tự tạo `Thread`: hệ thống an toàn của nó bắt được lỗi hai job cùng ghi một mảng ngay trong Editor, nó dùng chung bộ thread của engine, và Burst thường nhanh hơn nhiều lần. Tự quản thread tôi chỉ để cho I/O hoặc thư viện ngoài.

**Họ sẽ đào tiếp**

- *"Vì sao không Instantiate từ thread nền?"* → Vì engine giữ trạng thái nội bộ không đồng bộ hoá: scene graph, hàng đợi render, hệ thống vật lý. Unity chặn thẳng bằng exception, và đó là điều may mắn — nếu không thì hỏng âm thầm.
- *"`lock` khoá cái gì?"* → Khoá **dữ liệu**, không khoá đoạn code. Tôi đặt tên biến khoá theo dữ liệu nó bảo vệ, để khi đọc lại biết ngay phạm vi.
- *"Thứ tự khoá quan trọng ở đâu?"* → Hai thread lấy hai khoá theo thứ tự ngược nhau là công thức deadlock. Cố định thứ tự trong toàn dự án là cách chặn rẻ nhất.
- *"Bug race tìm bằng cách nào?"* → Không tìm bằng cách chạy thử, vì nó không tái hiện đều. Tôi thu hẹp bằng cách rà state dùng chung, dựng stress test lặp hàng nghìn lần, log kèm thread id, và nếu là Unity thì chuyển sang Job để hệ thống an toàn bắt hộ.
- *"`async` có phải đa luồng không?"* → Không. `await` không tạo thread; nó cắt hàm và lên lịch phần còn lại — xem [[csharp-async]]. I/O thì `async` là đủ; chỉ tính toán nặng mới cần thread.

**Cờ đỏ**

- Gọi API Unity trong `Task.Run` hoặc `Parallel.For`.
- "Sửa race" bằng cách thêm `volatile`.
- `lock(this)` hoặc khoá trên một chuỗi.
- Dùng `Dictionary` chung cho nhiều thread vì "chỉ đọc thôi mà" — trong khi vẫn có một chỗ ghi.
- Đẻ hàng chục thread trên mobile rồi ngạc nhiên vì chậm hơn.
- Khẳng định code đa luồng đúng vì "test chạy qua" — test không chứng minh được gì về race.

**Số / ví dụ nên thuộc**

- `counter++` = **ba** thao tác: đọc, cộng, ghi.
- `Interlocked.Increment` nhanh hơn `lock` **vài lần** cho một biến đếm.
- Mobile tầm trung: **4–8 lõi**, Unity đã giữ main + render thread.
- Mẫu chuẩn: `ConcurrentQueue` + rút **có trần** mỗi frame.
- `Dictionary` ghi từ hai thread có thể gây **vòng lặp vô hạn** lúc đọc.
