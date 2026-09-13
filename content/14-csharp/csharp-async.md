---
id: csharp-async
title: async/await và Task
icon: ⏳
summary: async/await biên dịch thành cái gì, SynchronizationContext quyết định code chạy trên thread nào, vì sao .Result treo cả game, và cách huỷ một tác vụ đang chờ cho đúng.
status: deep
read: 794
level: intermediate
order: 80
tags: [csharp, async, await, task, cancellation, interview]
related: [csharp-threading, csharp-exception-null, unity-csharp-memory, unity-network-client]
---

`async/await` bị hiểu nhầm theo hai hướng ngược nhau. Hướng thứ nhất: "nó chạy song song" — sai, `await` **không** tạo thread nào cả. Hướng thứ hai: "nó chỉ là cú pháp đẹp cho callback" — đúng một nửa, nhưng bỏ qua phần quan trọng nhất là **continuation chạy ở đâu**.

Câu trả lời đúng gói trong một dòng: `await` **cắt hàm của bạn làm nhiều mảnh**, chạy mảnh đầu, đăng ký phần còn lại làm continuation, rồi trả điều khiển về cho người gọi. Khi việc kia xong, phần còn lại chạy tiếp — trên thread nào thì tuỳ **SynchronizationContext**. Trong Unity, context đó đưa bạn về main thread, và đó là lý do `await` dùng được với API engine trong khi `Thread` thì không.

## Trình biên dịch làm gì với `async`

```csharp
async Task<int> LoadScoreAsync(string url)
{
    var json = await http.GetStringAsync(url);   // ① điểm cắt
    var score = Parse(json);
    await Task.Delay(100);                        // ② điểm cắt
    return score;
}
```

Trình biên dịch dựng một **máy trạng thái**: một struct (ở bản Release) giữ biến cục bộ và số hiệu trạng thái, cộng một `Task` để người gọi chờ. Mỗi điểm cắt là một trạng thái. Hệ quả đáng nhớ:

- **Hàm trả về ngay tại `await` đầu tiên chưa xong** — không phải chạy tới cuối rồi mới trả.
- **Nếu mọi `await` đều đã xong sẵn**, hàm chạy tuyến tính từ đầu tới cuối, không nhảy thread nào.
- **Cấp phát**: một `Task` cộng máy trạng thái bị nâng lên heap khi có điểm cắt thật — cỡ trăm byte một lần gọi. Không đáng kể cho một request mạng; đáng kể nếu gọi mỗi frame.

`ValueTask<T>` tồn tại cho trường hợp "thường xong ngay": nó tránh cấp phát `Task` khi kết quả có sẵn. Đổi lại luật dùng khắt khe hơn — **chỉ được `await` một lần**, không lưu lại, không `WhenAll`.

## `await` chạy tiếp ở đâu — SynchronizationContext

| Nơi chạy | `SynchronizationContext.Current` | Sau `await` bạn ở đâu |
|---|---|---|
| Unity (main thread) | `UnitySynchronizationContext` | **Quay lại main thread** — gọi API engine được |
| Console / thư viện | `null` | Trên một thread của thread pool — **bất kỳ thread nào** |
| Sau `ConfigureAwait(false)` | Bị bỏ qua | Thread pool, kể cả trong Unity → **cấm chạm API engine** |

```csharp
// Unity: đúng
var data = await LoadAsync(url);          // quay về main thread
transform.position = data.spawnPoint;      // an toàn

// Unity: sai, và chỉ nổ lúc chạy
var data2 = await LoadAsync(url).ConfigureAwait(false);
transform.position = data2.spawnPoint;     // UnityException: chỉ gọi được từ main thread
```

`ConfigureAwait(false)` là lời khuyên chuẩn khi viết **thư viện** trên .NET (tránh phụ thuộc context của người gọi). Trong code gameplay Unity thì gần như luôn **sai**, vì bạn muốn quay về main thread. Biết phân biệt hai bối cảnh đó là câu trả lời senior.

## `.Result` và `.Wait()` — cách treo cả game bằng một dòng

```csharp
// Trên thread có SynchronizationContext (main thread của Unity, UI thread của WinForms):
var data = LoadAsync(url).Result;     // TREO VĨNH VIỄN
```

Vòng khoá chết kinh điển: `.Result` **chặn** main thread để chờ task; task xong và muốn chạy continuation **trên chính main thread đó**; main thread đang bị chặn nên không bao giờ chạy continuation; task không bao giờ hoàn thành. Không exception, không log — chỉ đứng hình.

Luật: **`async` thì `async` suốt đường.** Không có cách đúng để chờ đồng bộ một tác vụ bất đồng bộ trên thread có context. Nếu bắt buộc phải có điểm chuyển, hãy làm ở ranh giới ngoài cùng (ví dụ `async void` cho một event handler) chứ đừng chặn ở giữa.

## Huỷ: `CancellationToken`

Huỷ trong .NET là **hợp tác**: không ai giết được task của bạn, chính code của bạn phải kiểm tra và dừng.

```csharp
async Task LoadWithTimeoutAsync(CancellationToken outer)
{
    using var cts = CancellationTokenSource.CreateLinkedTokenSource(outer);
    cts.CancelAfter(TimeSpan.FromSeconds(5));                 // hết 5 giây thì tự huỷ

    try
    {
        var json = await FetchAsync(url, cts.Token);          // token đi XUỐNG tận hàm chờ
        cts.Token.ThrowIfCancellationRequested();             // chốt trước khi làm việc nặng
        Apply(json);
    }
    catch (OperationCanceledException)
    {
        // huỷ là chuyện BÌNH THƯỜNG, không phải lỗi — đừng log như lỗi
    }
}
```

Trong Unity, mọi `MonoBehaviour` từ 2022 trở đi có sẵn `destroyCancellationToken`; truyền nó vào **mọi** chỗ chờ là luật, không phải khuyến nghị — nếu không, continuation quay về chạm vào object đã destroy. Chi tiết Unity ở [[unity-csharp-memory]].

## `async void` — một chỗ dùng, một lý do tránh

```csharp
async void OnButtonClick()        // CHẤP NHẬN ĐƯỢC: event handler, không ai await nó
{
    try { await DoWorkAsync(); }
    catch (Exception e) { Log(e); }   // BẮT BUỘC có try/catch, vì không ai bắt hộ
}

async void LoadEverything() { … }  // SAI: không ai await được, lỗi biến mất, không biết khi nào xong
```

Ba vấn đề của `async void`: không `await` được nên không biết lúc nào xong; exception **không** vào task mà ném thẳng lên context, thường là crash hoặc mất tăm; và không test được. Dùng đúng một chỗ: handler của event có chữ ký `void` bắt buộc — và luôn kèm `try/catch` ôm trọn thân hàm.

## Chạy song song thật

```csharp
// Tuần tự: 3 request mất 300ms
var a = await FetchAsync(url1);
var b = await FetchAsync(url2);
var c = await FetchAsync(url3);

// Song song: 3 request mất ~100ms
var ta = FetchAsync(url1);                 // khởi động, CHƯA await
var tb = FetchAsync(url2);
var tc = FetchAsync(url3);
var all = await Task.WhenAll(ta, tb, tc);  // chờ cả ba
```

Khác biệt nằm ở chỗ **khởi động trước rồi mới chờ**. Đây là câu hỏi phỏng vấn rất hay gặp vì nó tách người dùng `await` theo thói quen với người hiểu nó làm gì.

Hai hàm đi kèm: `Task.WhenAny` để lấy cái xong trước (dùng làm timeout thủ công), và `IProgress<T>` để báo tiến độ về main thread một cách an toàn.

Lưu ý về exception: `WhenAll` chờ **tất cả**, và nếu nhiều task cùng hỏng thì `await` chỉ ném ra exception **đầu tiên** — muốn xem hết thì đọc `task.Exception` (một `AggregateException`).

## Bốn cách bất đồng bộ trong Unity — chọn cái nào

| | Coroutine | `async Task` | UniTask | `Awaitable` (Unity 6) |
|---|---|---|---|---|
| Tự dừng khi object destroy | **Có** | Không | Có, qua token | Có, qua `destroyCancellationToken` |
| Trả về giá trị | Không | Có | Có | Có |
| `try/catch` quanh chỗ chờ | Không | Có | Có | Có |
| Cấp phát | Enumerator + mỗi `WaitForSeconds` | Task + máy trạng thái | ~0 | ~0 |
| Cần package ngoài | Không | Không | **Có** | Không |

Chọn nhanh: việc gắn chặt vòng đời GameObject và không cần trả giá trị thì **Coroutine**; việc có kết quả, có lỗi cần bắt, hoặc cần chạy nền thì **`Awaitable`** (Unity 6) hoặc **UniTask** (bản Unity cũ). `async Task` trần chỉ nên dùng ở lớp không đụng tới engine — ví dụ tầng gọi API trong [[unity-network-client]].

## Bẫy còn lại

- **Bấm hai lần chạy hai luồng tải.** `async` không tự chống tái nhập; cần một cờ `isLoading` hoặc huỷ luồng cũ trước khi khởi động luồng mới.
- **`Task.Run` cho việc chạm engine**: mọi API Unity gọi trong đó đều ném exception. `Task.Run` chỉ dành cho tính toán thuần C#.
- **Fire-and-forget không bắt lỗi**: gọi một `async Task` mà không `await` thì exception nằm im trong task, không ai thấy.
- **`await` trong `lock`** không biên dịch được — và đó là điều tốt; xem [[csharp-threading]] về khoá bất đồng bộ.
- **Đo thời gian bằng `Stopwatch` xuyên qua `await`** vẫn đúng, nhưng `Time.deltaTime` của Unity thì không — nó theo frame.

## Kiểm tra nhanh

- [ ] Không có `.Result`/`.Wait()` nào trên main thread
- [ ] Mọi `async void` đều là event handler và đều có `try/catch` ôm trọn thân
- [ ] Mọi chuỗi `await` trong MonoBehaviour đều nhận `destroyCancellationToken`
- [ ] `OperationCanceledException` được bắt riêng và không log như lỗi
- [ ] Các tác vụ độc lập được khởi động trước rồi `WhenAll`, không `await` lần lượt
- [ ] Có cờ chống tái nhập ở mọi thao tác người chơi bấm được nhiều lần

## 🤖 Prompt cho AI

**Dùng AI thế nào cho code bất đồng bộ**

AI viết `async/await` đúng cú pháp gần như luôn luôn, và sai về **bối cảnh** rất thường xuyên — vì mặc định của nó là code server ASP.NET, nơi `ConfigureAwait(false)` là chuẩn và không có main thread nào để bảo vệ. Đưa vào Unity thì đúng lời khuyên đó lại thành lỗi.

Việc nên giao: viết tầng gọi API có retry và timeout, chuyển một chuỗi callback sang `async`, thêm `CancellationToken` xuyên suốt một chuỗi hàm (việc cơ học, dễ sót nếu làm tay). Việc không nên giao: quyết định chỗ nào cần bất đồng bộ — phần lớn code gameplay không cần, và biến nó thành `async` chỉ thêm cấp phát cùng nguồn lỗi mới.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Chạy trong Unity hay .NET thuần**, và nếu Unity thì bản nào — quyết định `Awaitable`, UniTask hay `Task`.
- **Sau khi chờ xong có chạm API engine không** — quyết định `ConfigureAwait` và chỗ quay về main thread.
- **Huỷ theo cái gì**: object bị destroy, người chơi bấm huỷ, hay hết thời gian. Ba nguồn huỷ khác nhau.
- **Việc là I/O hay tính toán**: I/O thì `await` thẳng; tính toán nặng mới cần `Task.Run`.
- **Người dùng có bấm được nhiều lần không** — quyết định cần cờ chống tái nhập.

**Mẫu prompt**

```
Unity 6, C# 9. Viết lớp gọi API cho client: GET /profile, POST /purchase.

Ràng buộc bối cảnh:
- Sau khi chờ xong CÓ chạm UI (TextMeshPro), nên phải ở main thread — KHÔNG ConfigureAwait(false)
- Huỷ theo destroyCancellationToken của MonoBehaviour gọi nó
- Timeout 8 giây mỗi request, retry 2 lần cho lỗi mạng, KHÔNG retry cho lỗi 4xx
- POST /purchase phải chống bấm hai lần (idempotency key + cờ đang chạy)

Yêu cầu code:
- KHÔNG async void ngoài event handler
- KHÔNG .Result, .Wait()
- OperationCanceledException bắt riêng, không log như lỗi
- Nêu rõ mỗi await đang chờ cái gì và quay về thread nào
```

**Bẫy thường gặp:** AI rắc `ConfigureAwait(false)` khắp nơi theo thói quen server, và code Unity sau đó chạm `transform` trên thread pool — exception chỉ xuất hiện lúc chạy, đúng vào đường đi ít test nhất. Bẫy thứ hai: nó bọc việc chạm API Unity trong `Task.Run` để "khỏi chặn main thread", thứ luôn sai. Bẫy thứ ba: nó bắt `OperationCanceledException` chung với `Exception` rồi log lỗi đỏ mỗi lần người chơi đổi scene.

## 💻 Code

Demo bốn thứ: máy trạng thái cấp phát bao nhiêu, tuần tự so với `WhenAll`, `async void` nuốt lỗi thế nào, và huỷ bằng `CancellationToken` hoạt động ra sao. Chạy bằng `dotnet run`.

**Script**

```csharp
// Program.cs — .NET 6+ (dotnet new console && dotnet run)
// Lưu ý: console KHÔNG có SynchronizationContext, nên .Result ở đây không treo.
// Chính vì vậy phần deadlock chỉ mô tả, không demo — nó chỉ tái hiện trên Unity/UI thread.
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

static class Program
{
    static async Task Main()
    {
        // 1) cấp phát của một async method có điểm cắt thật
        long b0 = GC.GetTotalAllocatedBytes(true);
        for (int i = 0; i < 1000; i++) await AlreadyDoneAsync(i);      // không cắt: xong ngay
        long noSuspend = GC.GetTotalAllocatedBytes(true) - b0;

        b0 = GC.GetTotalAllocatedBytes(true);
        for (int i = 0; i < 1000; i++) await SuspendsAsync(i);         // có cắt: Task + máy trạng thái
        long withSuspend = GC.GetTotalAllocatedBytes(true) - b0;

        Console.WriteLine("1000 lần gọi async:");
        Console.WriteLine($"  xong ngay, không cắt : {noSuspend,8} B  ({noSuspend / 1000} B mỗi lần)");
        Console.WriteLine($"  có await thật sự     : {withSuspend,8} B  ({withSuspend / 1000} B mỗi lần)\n");

        // 2) tuần tự so với song song
        var sw = Stopwatch.StartNew();
        await FetchAsync("a"); await FetchAsync("b"); await FetchAsync("c");
        long seq = sw.ElapsedMilliseconds;

        sw.Restart();
        var ta = FetchAsync("a"); var tb = FetchAsync("b"); var tc = FetchAsync("c");
        await Task.WhenAll(ta, tb, tc);
        Console.WriteLine($"3 việc, mỗi việc 100ms:");
        Console.WriteLine($"  await lần lượt : {seq} ms");
        Console.WriteLine($"  WhenAll        : {sw.ElapsedMilliseconds} ms  <- khởi động trước, chờ sau\n");

        // 3) async void nuốt lỗi
        Console.WriteLine("3) async void:");
        try { FireAndForgetVoid(); }
        catch (Exception) { Console.WriteLine("   bắt được (sẽ KHÔNG xảy ra)"); }
        await Task.Delay(150);
        Console.WriteLine("   -> lỗi trong async void không tới được try/catch của người gọi");

        Console.WriteLine("   async Task thì bắt được:");
        try { await FireAndForgetTask(); }
        catch (InvalidOperationException e) { Console.WriteLine($"   bắt được: {e.Message}\n"); }

        // 4) huỷ hợp tác
        using var cts = new CancellationTokenSource();
        var work = LongWorkAsync(cts.Token);
        await Task.Delay(250);
        cts.Cancel();                                   // người chơi bấm huỷ / đổi scene
        try { await work; }
        catch (OperationCanceledException) { Console.WriteLine("4) đã huỷ — đây là luồng BÌNH THƯỜNG, không log như lỗi"); }
    }

    static async Task<int> AlreadyDoneAsync(int x) { await Task.CompletedTask; return x; }

    static async Task<int> SuspendsAsync(int x) { await Task.Yield(); return x; }

    static async Task<string> FetchAsync(string name)
    {
        await Task.Delay(100);                          // giả lập I/O
        return name;
    }

    static async void FireAndForgetVoid()
    {
        await Task.Delay(50);
        // Ném ở đây là ném thẳng lên SynchronizationContext: console sẽ báo unhandled,
        // Unity sẽ log đỏ rồi đi tiếp — trong cả hai trường hợp, người GỌI không bắt được.
        try { throw new InvalidOperationException("lỗi trong async void"); }
        catch (Exception e) { Console.WriteLine($"   phải tự bắt TRONG hàm: {e.Message}"); }
    }

    static async Task FireAndForgetTask()
    {
        await Task.Delay(50);
        throw new InvalidOperationException("lỗi trong async Task");
    }

    static async Task LongWorkAsync(CancellationToken token)
    {
        for (int i = 0; i < 20; i++)
        {
            token.ThrowIfCancellationRequested();       // huỷ là HỢP TÁC: phải tự kiểm
            await Task.Delay(50, token);
        }
    }
}
```

**Chạy thử**
- Phần 1: hàm không có điểm cắt thật cấp phát rất ít; hàm có `await Task.Yield()` tốn cỡ **100–200 byte mỗi lần gọi**. Đủ để thấy vì sao `async` không hợp cho thứ chạy mỗi frame, và vì sao `ValueTask` tồn tại.
- Phần 2: tuần tự ~**300ms**, `WhenAll` ~**100ms**. Cùng số việc, khác chỗ đặt `await`.
- Phần 3: dòng "bắt được" của người gọi **không** in ra — chứng minh `async void` không đưa lỗi về cho ai. Bản `async Task` thì bắt được bình thường.
- Phần 4: sau 250ms, `Cancel()` làm `await work` ném `OperationCanceledException`. Bắt riêng nó và **không** log như lỗi — đó là luồng bình thường khi người chơi đổi màn.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`async/await` có tạo thread mới không?**
  → Không. `await` chỉ cắt hàm thành các mảnh và đăng ký phần sau làm continuation; việc đang chờ có chạy trên thread khác hay không là do bản thân việc đó, không do `await`. Với I/O thì thường chẳng có thread nào chờ cả — hệ điều hành báo về khi xong.
- `Junior` **`Task` và `void` trong hàm async khác nhau thế nào?**
  → `async Task` thì người gọi `await` được, biết lúc nào xong, và bắt được exception. `async void` thì không ai chờ được, và exception ném thẳng lên context chứ không vào task — thường là crash hoặc mất tăm. Chỉ dùng `async void` cho event handler bắt buộc chữ ký `void`, và luôn kèm `try/catch` ôm trọn thân hàm.
- `Mid` **Vì sao `.Result` treo chương trình?**
  → Vì nó chặn thread hiện tại để chờ task, trong khi continuation của task lại được lên lịch chạy **trên chính thread đó** do SynchronizationContext. Thread bị chặn nên continuation không bao giờ chạy, task không bao giờ xong — khoá chết, không exception, không log. Trên Unity hay UI thread là treo cả ứng dụng; trong console thì không tái hiện vì ở đó không có context.
- `Mid` **`ConfigureAwait(false)` dùng khi nào?**
  → Khi viết thư viện trên .NET và không cần quay lại context của người gọi — nó tránh phụ thuộc và giảm một lần chuyển ngữ cảnh. Trong code Unity chạm tới engine thì gần như luôn **sai**, vì sau `await` bạn muốn ở main thread; đặt `ConfigureAwait(false)` rồi gọi `transform.position` là exception lúc chạy.
- `Mid` **Ba việc độc lập, mỗi việc 100ms — làm sao xong trong 100ms?**
  → Khởi động cả ba trước rồi mới chờ: gọi ba hàm để lấy ba `Task`, sau đó `await Task.WhenAll(...)`. `await` lần lượt là 300ms vì mỗi lần chờ xong mới khởi động cái tiếp theo. Lưu ý khi nhiều task cùng hỏng thì `await WhenAll` chỉ ném exception đầu tiên; muốn đủ thì đọc `task.Exception`.
- `Mid` **Huỷ một tác vụ đang chạy thế nào?**
  → Bằng `CancellationToken`, và huỷ là **hợp tác** — không ai giết được task, code phải tự kiểm `ThrowIfCancellationRequested()` hoặc truyền token xuống các hàm chờ. Trong Unity, mọi MonoBehaviour có sẵn `destroyCancellationToken`, truyền nó vào mọi chỗ chờ để continuation không quay lại chạm object đã destroy.
- `Senior` **`async` có cấp phát không, đáng lo ở đâu?**
  → Có: một `Task` cộng máy trạng thái bị nâng lên heap khi có điểm cắt thật, cỡ trăm byte mỗi lần gọi. Không đáng gì cho một request mạng; đáng kể nếu ai đó biến một hàm chạy mỗi frame thành `async`. Nếu hàm thường xong ngay thì `ValueTask` bỏ được khoản cấp phát đó, đổi lại chỉ được `await` một lần và không lưu lại được.
- `Senior` **Coroutine hay async trong Unity?**
  → Coroutine cho việc gắn chặt vòng đời GameObject và không cần trả giá trị — nó tự dừng khi object tắt, ngắn gọn hơn. `Awaitable` của Unity 6 hoặc UniTask cho việc có kết quả, cần `try/catch`, hoặc cần chạy trên thread nền rồi quay về. `async Task` trần thì tôi giữ ở tầng không đụng engine, ví dụ lớp gọi API.
- `Senior` **Người chơi bấm nút tải hai lần thì sao?**
  → Mặc định là hai luồng tải chạy song song, và cái về sau ghi đè cái về trước — `async` không tự chống tái nhập. Tôi xử lý bằng một trong hai cách: cờ `isLoading` chặn lần bấm thứ hai, hoặc huỷ luồng cũ bằng `CancellationTokenSource` rồi khởi động luồng mới. Với thao tác động tới tiền thì thêm idempotency key phía server — xem [[project-contract]].

**Khung trả lời 60 giây** — "`async/await` thật sự làm gì?"

> `await` **không** tạo thread. Nó cắt hàm của tôi thành nhiều mảnh: chạy mảnh đầu tới điểm chờ, đăng ký phần còn lại làm continuation, rồi **trả điều khiển về cho người gọi** ngay lúc đó. Khi việc kia xong, phần còn lại chạy tiếp.
>
> Câu hỏi quan trọng là **chạy tiếp ở đâu**, và câu trả lời là SynchronizationContext. Trong Unity, context đưa tôi về main thread, nên sau `await` tôi chạm `transform` được bình thường. Trong console hay thư viện thì không có context, continuation rơi vào thread pool.
>
> Hai luật tôi giữ. Một: **không bao giờ `.Result` hay `.Wait()` trên main thread** — thread bị chặn, continuation cần chính thread đó, thành khoá chết không log gì. Hai: **`async` thì `async` suốt đường**, và mọi chuỗi chờ trong MonoBehaviour đều nhận `destroyCancellationToken`, để người chơi đổi scene giữa chừng thì continuation không quay lại chạm vào object đã chết.

**Họ sẽ đào tiếp**

- *"Vậy I/O chờ trên thread nào?"* → Không thread nào cả. Với I/O thật, hệ điều hành báo về khi xong và continuation mới được lên lịch. Chỉ tính toán nặng mới cần một thread, và khi đó phải nói rõ là `Task.Run`.
- *"`ConfigureAwait(false)` thì sao?"* → Bỏ qua context, continuation rơi vào thread pool. Đúng cho thư viện .NET, sai cho code Unity chạm engine.
- *"Exception trong async đi đâu?"* → Vào chính `Task`, và bật ra tại chỗ `await`. Với `async void` thì ném thẳng lên context — người gọi không bắt được, nên phải `try/catch` bên trong.
- *"Huỷ thế nào?"* → `CancellationToken`, hợp tác. Trong Unity dùng `destroyCancellationToken`; bắt `OperationCanceledException` riêng và coi nó là luồng bình thường.
- *"`ValueTask` khác gì?"* → Tránh cấp phát khi kết quả thường có sẵn, đổi lại chỉ `await` được một lần và không lưu lại hay `WhenAll` được.

**Cờ đỏ**

- "`await` chạy trên thread khác nên nhanh hơn."
- Dùng `.Result` rồi giải thích "để cho đơn giản".
- `ConfigureAwait(false)` trong code Unity chạm tới `transform`, `GameObject`.
- `async void` ở khắp nơi, không có `try/catch`.
- Bọc API Unity trong `Task.Run` để "khỏi chặn main thread".
- Coi `OperationCanceledException` là lỗi và log đỏ mỗi lần đổi scene.

**Số / ví dụ nên thuộc**

- Một `async` có điểm cắt thật: cỡ **100–200 byte** mỗi lần gọi (Task + máy trạng thái).
- Ba việc 100ms: tuần tự **300ms**, `WhenAll` **~100ms**.
- `destroyCancellationToken` — có sẵn trong MonoBehaviour từ **Unity 2022**.
- `.Result` trên thread có context = **khoá chết**, không exception.
- `ValueTask`: chỉ `await` **một lần**.
