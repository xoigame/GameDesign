---
id: csharp-memory
title: Mô hình bộ nhớ của C#
icon: 🧠
summary: Cái gì quyết định một object nằm ở đâu và sống bao lâu, IDisposable với finalizer khác nhau thế nào, vì sao nối chuỗi trong vòng lặp là O(n²), và dùng Span/ArrayPool ở đâu cho đúng.
status: deep
read: 793
level: advanced
order: 70
tags: [csharp, memory, gc, idisposable, span, string, interview]
related: [csharp-type-system, csharp-collections, unity-csharp-memory, performance]
refs:
  - "Richter — CLR via C#, ch.21"
---

Node này nói về **mô hình bộ nhớ ở mức ngôn ngữ**: cái gì quyết định chỗ nằm, ai giữ ai sống, và những công cụ C# cho bạn để không cấp phát. Phần GC riêng của Unity — Boehm, incremental, heap không co lại — nằm ở [[unity-csharp-memory]]; ở đây là phần đúng cho mọi runtime.

Lý do phải tách hai node: phỏng vấn hỏi cả hai kiểu. "Vì sao game khựng" là câu hỏi Unity. "`IDisposable` khác finalizer thế nào" là câu hỏi C#, và người chỉ học Unity thường trả lời hỏng đúng ở đó.

## Ba câu hỏi quyết định mọi thứ

| Câu hỏi | Trả lời bởi |
|---|---|
| Nằm ở đâu? | **Kiểu**: value type nằm trong khung hàm hoặc nội tuyến; reference type luôn trên heap |
| Sống bao lâu? | **Khả năng với tới**: còn root nào chạm tới được thì còn sống — xem [[csharp-type-system]] |
| Ai dọn? | **GC** cho bộ nhớ managed; **bạn** cho mọi thứ khác (file, socket, native buffer, texture) |

Dòng thứ ba là chỗ hầu hết bug tài nguyên sinh ra: GC **không** biết gì về file handle, kết nối mạng, hay `NativeArray`. Nó chỉ đếm byte managed.

## Root — vì sao object không chết

Object sống chừng nào còn đường đi tới nó từ một **root**: biến cục bộ đang trong stack, field tĩnh, thanh ghi CPU, và các handle đang ghim. Bốn nguồn rò rỉ thường gặp trong C#, tất cả đều là "vô tình tạo root":

| Nguồn | Vì sao giữ |
|---|---|
| **Collection tĩnh** không bao giờ xoá | Field tĩnh là root vĩnh viễn — `static List<Enemy> all` là rò rỉ nếu chỉ thêm mà không bớt |
| **Event chưa huỷ đăng ký** | Người phát giữ người nghe — chi tiết ở [[csharp-delegate-event]] |
| **Closure bắt `this`** | Lambda dùng một field của lớp thì bắt luôn cả object; lưu lambda đó vào đâu đó lâu dài là giữ cả object |
| **Cache không có hạn** | Dictionary lớn dần mãi; cache không có chính sách xoá thì không phải cache, là rò rỉ có tên đẹp |

Câu nói ngắn cho phỏng vấn: **trong C# không có "rò rỉ bộ nhớ" theo nghĩa C++, chỉ có "vô tình còn giữ tham chiếu".** Mọi vụ rò rỉ đều quy về việc tìm ra ai đang giữ.

## `IDisposable` và finalizer — hai cơ chế khác hẳn nhau

```csharp
public sealed class SaveWriter : IDisposable
{
    FileStream stream;                       // tài nguyên KHÔNG do GC quản
    bool disposed;

    public void Dispose()
    {
        if (disposed) return;                 // Dispose gọi hai lần phải vô hại
        stream?.Dispose();
        stream = null;
        disposed = true;
    }
}

// Dùng: khối using bảo đảm Dispose chạy kể cả khi có exception
using (var w = new SaveWriter()) { w.Write(data); }

// C# 8 (Unity 6 có): using declaration — Dispose chạy ở cuối scope
using var w2 = new SaveWriter();
```

| | `IDisposable` | Finalizer (`~MyClass`) |
|---|---|---|
| Chạy khi nào | **Bạn gọi**, hoặc hết khối `using` | Lúc GC quyết định — **không xác định**, có thể không bao giờ |
| Chi phí | Gần như bằng 0 | Object sống qua thêm ít nhất một chu kỳ GC, vào hàng đợi finalizer |
| Dùng cho | Mọi tài nguyên cần đóng: file, socket, native buffer, `NativeArray` | Chỉ làm **lưới an toàn** cho handle native khi người dùng quên `Dispose` |
| Trong game | Dùng thường xuyên | Gần như không bao giờ tự viết |

Luật: **có `Dispose` thì gọi nó, đừng trông vào finalizer.** Và đừng viết finalizer trừ khi lớp của bạn nắm giữ trực tiếp một con trỏ native — thêm finalizer vào một lớp bình thường là làm mọi instance của nó đắt lên mà không được gì.

## `string` — nguồn rác số một trong code C#

`string` là **bất biến**: mọi thao tác "sửa" đều tạo chuỗi mới.

```csharp
// O(n²): mỗi vòng tạo một chuỗi mới, copy toàn bộ phần đã có
string s = "";
for (int i = 0; i < 1000; i++) s += i + ",";        // ~1000 chuỗi, ~500.000 lượt copy ký tự

// O(n): một buffer lớn dần
var sb = new StringBuilder(4096);
for (int i = 0; i < 1000; i++) sb.Append(i).Append(',');
string result = sb.ToString();                       // chỉ một chuỗi cuối cùng
```

Bốn điều nên thuộc về `string`:

- **Chuỗi ký tự viết thẳng trong code được intern** — hai literal giống nhau là **cùng một object**, nên `==` giữa chúng nhanh. Chuỗi dựng lúc chạy thì không.
- **`==` của `string` so sánh nội dung**, không so tham chiếu (nó được nạp chồng) — khác với mọi class khác.
- **Nội suy `$"..."` với số vẫn cấp phát** trên .NET Standard 2.1: nó đi qua `string.Format` với `params object[]`, nên mỗi số là một lần boxing cộng một mảng.
- **`Substring` tạo chuỗi mới.** Chỉ đọc thì `ReadOnlySpan<char>` cắt được mà không cấp phát: `text.AsSpan(3, 5)`.

Trong game, quy tắc thực dụng: mọi chuỗi hiện trên HUD mỗi frame đều phải đi qua API ghi thẳng vào buffer (`TextMeshPro.SetText` với tham số số) chứ không qua nối chuỗi.

## `Span<T>`, `stackalloc`, `ArrayPool<T>`

Ba công cụ để làm việc với dữ liệu tạm mà không cấp phát trên heap. Cả ba đều dùng được trong Unity 6.

```csharp
// 1) Span trên stack: không chạm heap, tự biến mất khi hết hàm
Span<int> scratch = stackalloc int[64];        // GIỚI HẠN: chỉ vài trăm phần tử, stack rất nhỏ
for (int i = 0; i < scratch.Length; i++) scratch[i] = i * i;

// 2) Span nhìn vào một phần mảng có sẵn — không copy, không cấp phát
int[] buffer = new int[1024];
Span<int> window = buffer.AsSpan(0, 128);

// 3) Mượn mảng lớn rồi trả lại, thay vì new mỗi lần
var pool = System.Buffers.ArrayPool<byte>.Shared;
byte[] rented = pool.Rent(4096);               // có thể trả về mảng DÀI HƠN yêu cầu
try { Process(rented.AsSpan(0, 4096)); }
finally { pool.Return(rented, clearArray: true); }   // quên Return = mất hiệu lực của pool
```

`Span<T>` là `ref struct`: nó **không** làm field của class được, **không** dùng trong `async` hay iterator `yield`, và không bị boxing. Những hạn chế đó không phải phiền phức ngẫu nhiên — chúng chính là thứ đảm bảo nó không bao giờ sống lâu hơn vùng nhớ nó trỏ vào.

`stackalloc` có một cái bẫy chết người: stack chỉ cỡ **1 MB** mỗi thread. `stackalloc` với kích thước lấy từ dữ liệu người dùng là lỗ hổng tràn stack — luôn kẹp một hằng số trần:

```csharp
Span<int> tmp = n <= 128 ? stackalloc int[n] : new int[n];   // mẫu chuẩn
```

## Đo cấp phát ở mức ngôn ngữ

```csharp
long before = GC.GetTotalAllocatedBytes(precise: true);
DoWork();
long bytes = GC.GetTotalAllocatedBytes(true) - before;       // byte đã cấp phát, kể cả đã thu

int gen0 = GC.CollectionCount(0);                             // số lần GC gen 0 đã chạy
```

Hai hàm này là cách rẻ nhất để biến "chắc là nhanh hơn" thành số. Trong Unity thì dùng `ProfilerRecorder` với `"GC Allocated In Frame"` — xem [[unity-csharp-memory]].

**Đừng gọi `GC.Collect()`** để "dọn cho sạch": nó đẩy nguyên một đợt thu gom vào đúng frame bạn gọi, và với GC không phân thế hệ của Unity thì đó là quét toàn bộ heap. Chỗ hiếm hoi hợp lý là ngay sau màn hình loading, khi vài chục ms không ai thấy.

## Bẫy còn lại

- **`GC.GetTotalMemory(false)` không phải lượng bộ nhớ đã dùng** — nó là ước lượng heap managed, không tính native, không tính texture.
- **Object lớn**: trên .NET, object từ **85.000 byte** trở lên vào Large Object Heap và không bị nén. Unity dùng Boehm nên không có LOH riêng, nhưng nguyên tắc "đừng cấp phát mảng khổng lồ liên tục" vẫn đúng.
- **`Dispose` không xoá object khỏi bộ nhớ** — nó chỉ đóng tài nguyên bên ngoài. Object vẫn do GC dọn như thường.
- **Quên `pool.Return`** làm `ArrayPool` trở thành một cách cấp phát vòng vo, chậm hơn `new`.
- **Struct lớn trong `async`** hoặc trong closure sẽ bị nâng lên heap — cái bạn tưởng là value type lại thành object.

## Kiểm tra nhanh

- [ ] Mọi kiểu implement `IDisposable` đều được dùng qua `using` hoặc có chỗ gọi `Dispose` rõ ràng
- [ ] Không có finalizer nào trong code, trừ lớp ôm handle native
- [ ] Không nối chuỗi trong vòng lặp — đã dùng `StringBuilder` hoặc API ghi thẳng
- [ ] `stackalloc` luôn có trần hằng số, không lấy kích thước từ dữ liệu ngoài
- [ ] Mọi `ArrayPool.Rent` có `Return` trong `finally`
- [ ] Collection tĩnh nào cũng có đường xoá phần tử, và cache nào cũng có hạn mức
- [ ] Có số đo trước/sau cho mỗi thay đổi vì lý do bộ nhớ

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc soát bộ nhớ**

Chia làm hai loại việc, và đừng trộn chúng. Loại một là **soát cấp phát trong một file** — AI làm tốt, nó nhận ra nối chuỗi, closure, boxing, `ToList()` thừa nhanh hơn người đọc. Loại hai là **tìm nguồn rò rỉ** — AI làm kém, vì rò rỉ là chuyện *ai đang giữ tham chiếu* và câu trả lời nằm rải khắp dự án, không nằm trong file bạn dán.

Với loại hai, cách dùng đúng là đưa AI **danh sách nghi phạm theo mẫu** (collection tĩnh, event chưa huỷ, closure bắt `this`, cache không hạn) rồi bảo nó rà từng mẫu trong đoạn code bạn có — chứ không hỏi "code này có rò rỉ không".

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Runtime**: .NET (GC phân thế hệ, có LOH) hay Unity (Boehm, không nén). Lời khuyên khác nhau ở một số chỗ.
- **Số đo hiện tại**: bao nhiêu byte mỗi lần gọi, đo bằng gì, ở hàm nào.
- **Hàm chạy bao nhiêu lần** — một lần lúc load thì đừng tối ưu.
- **Tài nguyên nào là native** (file, socket, `NativeArray`, texture) — GC không đụng tới chúng.

**Mẫu prompt**

```
Unity 6 (.NET Standard 2.1). Hàm dưới chạy 1 lần/frame, Profiler báo 6 KB alloc/frame.

<dán code>

Rà theo đúng danh sách này, mỗi mục trả lời có/không kèm số dòng:
1. Nối chuỗi hoặc nội suy $"" có số
2. Closure bắt biến (kể cả bắt this)
3. Boxing: struct ép sang interface/object
4. Collection mới trong hàm (new List/Array/ToList)
5. yield return hoặc LINQ
6. Tài nguyên IDisposable/native không có Dispose

Sau đó viết lại phiên bản 0 B/frame, giữ NGUYÊN hành vi.
KHÔNG dùng CollectionsMarshal hay API .NET 6+. Nếu phải dùng ArrayPool thì
Return phải nằm trong finally.
```

**Bẫy thường gặp:** AI đề xuất `stackalloc` với kích thước biến — chạy đúng trong test rồi tràn stack trên dữ liệu thật; luôn bắt nó kẹp một trần hằng số. Bẫy thứ hai: nó thêm finalizer `~MyClass()` "cho chắc", làm mọi instance đắt lên và sống thêm một chu kỳ GC. Bẫy thứ ba: nó gọi `GC.Collect()` sau khi giải phóng để "chứng minh đã sạch" — trong game đó là một cú khựng tự tạo.

## 💻 Code

Demo đo bốn thứ bằng byte: nối chuỗi so với `StringBuilder`, `Substring` so với `Span`, `new byte[]` so với `ArrayPool`, và `Dispose` so với finalizer. Chạy bằng `dotnet run`.

**Script**

```csharp
// Program.cs — .NET 6+ (dotnet new console && dotnet run)
using System;
using System.Buffers;
using System.Diagnostics;
using System.Text;

sealed class WithDispose : IDisposable
{
    public static int Closed;
    bool disposed;
    public void Dispose() { if (disposed) return; disposed = true; Closed++; }
}

sealed class WithFinalizer
{
    public static int Finalized;
    ~WithFinalizer() { Finalized++; }          // chạy lúc nào thì GC quyết, không phải bạn
}

static class Program
{
    static void Main()
    {
        const int N = 5000;

        // 1) nối chuỗi so với StringBuilder
        long b0 = GC.GetTotalAllocatedBytes(true);
        var sw = Stopwatch.StartNew();
        string s = "";
        for (int i = 0; i < N; i++) s += i.ToString() + ",";
        long concatBytes = GC.GetTotalAllocatedBytes(true) - b0;
        long concatMs = sw.ElapsedMilliseconds;

        b0 = GC.GetTotalAllocatedBytes(true);
        sw.Restart();
        var sb = new StringBuilder(N * 5);
        for (int i = 0; i < N; i++) sb.Append(i).Append(',');
        string s2 = sb.ToString();
        long sbBytes = GC.GetTotalAllocatedBytes(true) - b0;

        Console.WriteLine($"Nối {N} mẩu chuỗi:");
        Console.WriteLine($"  s += ...       : {concatBytes / 1024,7} KB | {concatMs} ms   <- O(n²)");
        Console.WriteLine($"  StringBuilder  : {sbBytes / 1024,7} KB | {sw.ElapsedMilliseconds} ms");
        Console.WriteLine($"  (cùng kết quả: {s.Length == s2.Length})\n");

        // 2) Substring so với ReadOnlySpan<char>
        string csv = string.Join(',', new int[2000]);
        b0 = GC.GetTotalAllocatedBytes(true);
        long sum = 0;
        for (int i = 0; i + 5 < csv.Length; i += 6) sum += csv.Substring(i, 5).Length;
        long subBytes = GC.GetTotalAllocatedBytes(true) - b0;

        b0 = GC.GetTotalAllocatedBytes(true);
        ReadOnlySpan<char> span = csv.AsSpan();
        for (int i = 0; i + 5 < span.Length; i += 6) sum += span.Slice(i, 5).Length;
        long spanBytes = GC.GetTotalAllocatedBytes(true) - b0;

        Console.WriteLine($"Cắt chuỗi ~333 lần:");
        Console.WriteLine($"  Substring : {subBytes,7} B");
        Console.WriteLine($"  Span      : {spanBytes,7} B   <- không cấp phát, chỉ là cửa sổ nhìn vào\n");

        // 3) new byte[] so với ArrayPool
        b0 = GC.GetTotalAllocatedBytes(true);
        for (int i = 0; i < 2000; i++) { var tmp = new byte[4096]; tmp[0] = 1; }
        long newBytes = GC.GetTotalAllocatedBytes(true) - b0;

        var pool = ArrayPool<byte>.Shared;
        b0 = GC.GetTotalAllocatedBytes(true);
        for (int i = 0; i < 2000; i++)
        {
            byte[] rented = pool.Rent(4096);
            try { rented[0] = 1; }
            finally { pool.Return(rented); }       // quên dòng này là pool vô nghĩa
        }
        long poolBytes = GC.GetTotalAllocatedBytes(true) - b0;

        Console.WriteLine($"2000 buffer 4 KB:");
        Console.WriteLine($"  new byte[4096] : {newBytes / 1024,7} KB");
        Console.WriteLine($"  ArrayPool      : {poolBytes / 1024,7} KB\n");

        // 4) Dispose so với finalizer
        for (int i = 0; i < 1000; i++) { using var d = new WithDispose(); }
        for (int i = 0; i < 1000; i++) { var f = new WithFinalizer(); }

        Console.WriteLine($"Dispose đã chạy : {WithDispose.Closed}/1000  <- ngay lập tức, xác định");
        Console.WriteLine($"Finalizer đã chạy: {WithFinalizer.Finalized}/1000  <- chưa chắc cái nào");
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();
        Console.WriteLine($"Finalizer sau 2 lần GC ép buộc: {WithFinalizer.Finalized}/1000");
        Console.WriteLine($"(sum={sum})");
    }
}
```

**Chạy thử**
- Phần 1: nối chuỗi cấp phát **hàng chục MB** cho 5000 mẩu, `StringBuilder` cỡ **vài chục KB**. Chênh lệch ba chữ số, và nó lớn theo bình phương số vòng lặp.
- Phần 2: `Substring` cấp phát vài chục KB, `Span` in ra **0 B**.
- Phần 3: `ArrayPool` gần bằng 0 sau vài vòng đầu, vì mảng được mượn lại. Xoá dòng `pool.Return` rồi chạy lại — con số nhảy lên bằng đường `new`, đó là cách thấy tận mắt vì sao quên `Return` là hỏng.
- Phần 4: `Dispose` chạy **1000/1000 ngay lập tức**; finalizer thường in ra **0** trước khi ép GC, và kể cả sau hai lần `GC.Collect()` cũng không đảm bảo đủ 1000. Đó là toàn bộ lý do đừng trông vào finalizer để đóng tài nguyên.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Cái gì quyết định object nằm trên stack hay heap?**
  → Kiểu của nó. Reference type luôn trên heap; value type nằm trong khung hàm nếu là biến cục bộ, hoặc nội tuyến trong cái chứa nó. Và một value type bị boxing thì bản sao của nó cũng lên heap.
- `Junior` **`IDisposable` để làm gì?**
  → Để đóng thứ GC không biết: file, socket, kết nối, native buffer. GC chỉ đếm byte managed nên nó không biết bạn đang mở một file. Dùng qua `using` để `Dispose` chạy cả khi có exception; từ C# 8 có `using var x = ...` chạy ở cuối scope.
- `Junior` **`string` bất biến nghĩa là gì, hệ quả là gì?**
  → Không sửa được tại chỗ: mọi thao tác tạo chuỗi mới. Hệ quả thực tế là `s += x` trong vòng lặp thành O(n²) — mỗi vòng copy lại toàn bộ phần đã có. Nối nhiều thì dùng `StringBuilder`; trong game thì tránh hẳn bằng cách ghi thẳng vào API nhận số.
- `Mid` **`Dispose` và finalizer khác nhau thế nào, khi nào viết finalizer?**
  → `Dispose` chạy khi **bạn** gọi, xác định về thời điểm, gần như miễn phí. Finalizer chạy khi GC quyết định — không xác định, có thể không bao giờ trước khi app tắt — và làm object sống thêm ít nhất một chu kỳ GC. Tôi chỉ viết finalizer cho lớp ôm trực tiếp một handle native, như lưới an toàn khi người dùng quên `Dispose`. Lớp bình thường thì không bao giờ.
- `Mid` **Rò rỉ bộ nhớ trong C# xảy ra kiểu gì, nếu đã có GC?**
  → Không phải rò rỉ theo nghĩa C++ mà là **vô tình còn giữ tham chiếu**. Bốn nguồn hay gặp: collection tĩnh chỉ thêm không bớt, event chưa huỷ đăng ký, closure bắt `this` rồi được lưu lâu dài, và cache không có hạn mức. Cách tìm là hỏi "ai đang giữ" — memory profiler chỉ ra được chuỗi tham chiếu tới root.
- `Mid` **`Span<T>` là gì, nó giải quyết chuyện gì?**
  → Một cửa sổ nhìn vào vùng nhớ có sẵn — mảng, chuỗi, hay `stackalloc` — cho phép cắt và xử lý mà **không copy, không cấp phát**. Nó là `ref struct` nên không làm field của class được và không dùng trong `async`; chính hạn chế đó bảo đảm nó không sống lâu hơn vùng nhớ nó trỏ vào.
- `Senior` **`stackalloc` nguy hiểm ở đâu?**
  → Stack mỗi thread chỉ cỡ 1 MB, nên `stackalloc` với kích thước lấy từ dữ liệu bên ngoài là lỗ tràn stack — và tràn stack thì không bắt được, process chết ngay. Mẫu an toàn là kẹp trần: `n <= 128 ? stackalloc int[n] : new int[n]`.
- `Senior` **`ArrayPool` dùng khi nào, hỏng khi nào?**
  → Dùng cho buffer lớn, sống ngắn, tạo lại liên tục — đọc mạng, giải nén, xử lý ảnh. Hỏng khi quên `Return`, lúc đó nó thành một cách cấp phát vòng vo chậm hơn `new`. Hai luật đi kèm: `Return` trong `finally`, và mảng mượn về có thể **dài hơn** yêu cầu nên phải làm việc theo `Span` cắt đúng độ dài.
- `Senior` **Vì sao không nên gọi `GC.Collect()`?**
  → Vì nó đẩy nguyên một đợt thu gom vào đúng frame bạn gọi. Trên .NET nó còn phá heuristic của GC phân thế hệ; trong Unity, collector không phân thế hệ nên đó là quét toàn bộ heap — một cú khựng tự tạo. Chỗ duy nhất tôi chấp nhận là ngay sau màn hình loading.

**Khung trả lời 60 giây** — "Rò rỉ bộ nhớ trong C# xảy ra thế nào?"

> Trong C# không có rò rỉ theo nghĩa quên `free` như C++. Có GC, nên mọi vụ rò rỉ đều quy về một câu: **ai đó vẫn còn giữ tham chiếu tới thứ lẽ ra phải chết.**
>
> Bốn nguồn tôi kiểm đầu tiên, theo thứ tự. Một: **collection tĩnh** chỉ thêm mà không bớt — field tĩnh là root vĩnh viễn. Hai: **event chưa huỷ đăng ký** — người phát giữ người nghe, nên panel UI của scene cũ còn sống kéo theo cả texture. Ba: **closure bắt `this`** rồi được lưu vào đâu đó lâu dài. Bốn: **cache không có hạn mức** — cache không có chính sách xoá thì không phải cache.
>
> Cách tìm thì tôi không đoán: dùng memory profiler chụp hai lần, so hai ảnh, rồi nhìn **chuỗi tham chiếu tới root** của kiểu đang tăng. Và tách bạch hai chuyện: managed heap là việc của GC, còn file, socket, native buffer thì GC không biết — cái đó phải `Dispose`.

**Họ sẽ đào tiếp**

- *"Vì sao GC không dọn được chúng?"* → Vì còn đường đi tới object từ một root: field tĩnh, biến cục bộ đang sống, hoặc một delegate đang giữ `Target`. GC không đoán ý định, nó chỉ đi theo tham chiếu.
- *"Native memory thì sao?"* → GC không đụng tới. Texture, mesh, audio buffer, `NativeArray` phải trả bằng `Dispose` hoặc API của engine — trong Unity còn có `Resources.UnloadUnusedAssets`, xem [[unity-csharp-memory]].
- *"`Dispose` có giải phóng object không?"* → Không. Nó đóng tài nguyên bên ngoài; object vẫn nằm trên heap tới khi GC dọn. Hai chuyện độc lập nhau.
- *"Đo bằng gì?"* → `GC.GetTotalAllocatedBytes(true)` quanh đoạn cần đo, `GC.CollectionCount(0)` để đếm số lần thu gom. Trong Unity thì `ProfilerRecorder` với `"GC Allocated In Frame"`.
- *"Chuỗi thì sao?"* → Bất biến nên mọi thao tác tạo chuỗi mới; nối trong vòng lặp là O(n²). `StringBuilder` cho việc dựng chuỗi, `ReadOnlySpan<char>` cho việc đọc và cắt.

**Cờ đỏ**

- "C# có GC nên không rò rỉ được."
- Viết finalizer cho lớp thường "cho chắc".
- Gọi `GC.Collect()` trong gameplay để dọn cho sạch.
- Không phân biệt managed heap với native memory.
- Dùng `ArrayPool` mà không có `Return` trong `finally`.

**Số / ví dụ nên thuộc**

- Nối chuỗi trong vòng lặp: **O(n²)** về cả thời gian lẫn cấp phát.
- Stack mỗi thread: cỡ **1 MB** — trần cho `stackalloc`.
- Trên .NET, object ≥ **85.000 byte** vào Large Object Heap (Unity dùng Boehm nên không có LOH riêng).
- Finalizer khiến object sống thêm **ít nhất một chu kỳ GC**.
- `GC.GetTotalAllocatedBytes(true)` và `GC.CollectionCount(0)` — hai hàm đo tại chỗ.
