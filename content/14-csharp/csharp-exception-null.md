---
id: csharp-exception-null
title: Exception, null và null giả của Unity
icon: 🚨
summary: Bắt lỗi ở tầng nào, vì sao throw ex xoá mất stack trace, mẫu Try… thay cho exception trong vòng lặp nóng, và cái bẫy lớn nhất của Unity — object đã destroy thì == null là true nhưng ?. lại không thấy.
status: deep
read: 796
level: intermediate
order: 100
tags: [csharp, exception, null, unity, debugging, interview]
related: [csharp-async, csharp-memory, unity-debug-crash, unity-testing-ci]
---

Hai chủ đề này đi chung một node vì trong game chúng là cùng một câu hỏi: **khi có gì đó không đúng, code phản ứng thế nào?** Và vì Unity thêm vào đây một cơ chế của riêng nó — `null` giả — thứ làm cho kiến thức C# chuẩn trở thành sai nếu áp dụng máy móc.

## Exception: cơ chế và cái giá

Khi `throw` chạy, runtime **gỡ ngăn xếp** đi ngược lên tìm `catch` phù hợp, chạy mọi `finally` trên đường đi, và dựng stack trace. Chi phí:

| Tình huống | Giá |
|---|---|
| Khối `try` không có exception nào | **Gần như bằng 0** — không có lý do tránh `try` vì hiệu năng |
| Một lần `throw` + `catch` | Cỡ **vài microsecond** — đắt gấp hàng nghìn lần một lời gọi hàm |
| `throw` trong vòng lặp mỗi frame | Thảm hoạ, và là dấu hiệu dùng exception làm luồng điều khiển |

Kết luận thực dụng: **`try/catch` rẻ, `throw` đắt.** Nên đặt `try` ở đâu không phải câu hỏi hiệu năng; ném cái gì và ném bao nhiêu lần mới là.

## Dùng exception khi nào, dùng `Try…` khi nào

```csharp
// SAI: dùng exception làm luồng điều khiển, chạy mỗi frame
try { var dmg = int.Parse(input); Apply(dmg); }
catch (FormatException) { /* bỏ qua */ }

// ĐÚNG: mẫu Try… — trả về bool, không ném
if (int.TryParse(input, out var dmg)) Apply(dmg);
```

| Dùng exception | Dùng `Try…`/giá trị trả về |
|---|---|
| Điều kiện **bất thường**: file save hỏng, phản hồi server sai định dạng | Điều kiện **bình thường**: người chơi gõ sai, không tìm thấy item, hết lượt |
| Lỗi không xử lý tại chỗ được, phải báo lên trên | Lỗi có phương án dự phòng ngay tại chỗ |
| Xảy ra hiếm | Xảy ra thường xuyên, nhất là trong vòng lặp |

Bốn `Try…` nên thuộc: `int.TryParse`, `dict.TryGetValue`, `TryGetComponent` (Unity), và tự viết `TryConsume`/`TrySpend` cho kinh tế trong game — nơi "không đủ tiền" là chuyện bình thường, không phải ngoại lệ.

## `throw;` và `throw ex;` — một dấu chấm phẩy đổi cả stack trace

```csharp
catch (Exception ex)
{
    Log(ex);
    throw;         // ĐÚNG: giữ nguyên stack trace gốc
}

catch (Exception ex)
{
    Log(ex);
    throw ex;      // SAI: stack trace bị đặt lại TỪ ĐÂY — mất chỗ lỗi thật sự xảy ra
}
```

Đây là câu hỏi phỏng vấn kinh điển, và nó có hệ quả thật: log production chỉ ra dòng `throw ex` chứ không ra dòng gây lỗi. Muốn ném lại từ một chỗ khác mà vẫn giữ stack thì dùng `ExceptionDispatchInfo.Capture(ex).Throw()`.

Hai công cụ đi kèm ít người dùng:

```csharp
// Bộ lọc: chỉ bắt khi thoả điều kiện, và KHÔNG gỡ ngăn xếp khi điều kiện sai
catch (WebException e) when (e.Status == WebExceptionStatus.Timeout) { Retry(); }

// finally luôn chạy — kể cả khi có exception, kể cả khi return trong try
finally { spinner.Hide(); }
```

Bộ lọc `when` hơn hẳn việc bắt rồi ném lại: khi điều kiện sai, ngăn xếp **chưa** bị gỡ, nên debugger dừng đúng chỗ lỗi phát sinh.

## Bắt ở tầng nào

Ba tầng, ba cách xử lý khác nhau:

| Tầng | Bắt gì | Làm gì |
|---|---|---|
| **Sát chỗ lỗi** | Lỗi có phương án dự phòng: file config hỏng → dùng mặc định | Xử lý im lặng, ghi log cảnh báo |
| **Ranh giới hệ thống** (gọi API, đọc save, nạp asset) | Mọi lỗi của hệ thống con đó | Đổi sang lỗi có nghĩa cho tầng trên: `SaveCorruptedException` |
| **Ngoài cùng** (handler sự kiện, vòng lặp game) | Lỗi chưa ai bắt | Ghi log, báo cáo crash, giữ cho game không chết — xem [[unity-debug-crash]] |

Thứ không nên làm là `catch (Exception) { }` rỗng ở giữa chừng: nó biến một lỗi ồn ào thành một bug im lặng, và bug im lặng thì tìm bằng tuần chứ không bằng phút.

Chi tiết riêng của Unity: exception ném ra từ `Update` của **một** MonoBehaviour không làm chết game — Unity bắt ở ranh giới mỗi callback, log đỏ, rồi chạy tiếp object khác. Tiện, nhưng nguy hiểm: một script hỏng có thể ném mỗi frame trong nhiều phút mà game vẫn "chạy", và log thì trôi mất.

## `null` trong C# — bộ công cụ

```csharp
int? maybe = null;                        // Nullable<int>: value type + cờ HasValue
string name = user?.Profile?.Name;        // null-conditional: dừng ở null đầu tiên
string shown = name ?? "Khách";           // null-coalescing
cache ??= new Dictionary<int, Item>();    // gán nếu đang null (C# 8)
if (item is null) return;                 // so sánh THAM CHIẾU, bỏ qua toán tử == nạp chồng
```

`#nullable enable` (C# 8) bật kiểm tra null lúc biên dịch: `string?` là có thể null, `string` là không. Trong Unity dùng được **theo từng file**, nhưng API của engine hầu như chưa được chú thích nên bật cho cả dự án sẽ ngập cảnh báo — bật cho code thuần C# của bạn thì hợp lý.

## Null giả của Unity — bẫy lớn nhất trong node này

`UnityEngine.Object` **nạp chồng toán tử `==`**. Khi bạn `Destroy` một GameObject, phần C# của nó vẫn còn trên heap, nhưng phần native đã chết; toán tử nạp chồng kiểm điều đó và trả về `true` cho `obj == null`.

Hệ quả: những cách kiểm tra null **không đi qua toán tử** sẽ thấy object vẫn "sống".

```csharp
var go = someDestroyedGameObject;

go == null        // true   — toán tử nạp chồng của Unity, ĐÚNG như bạn mong đợi
go is null        // FALSE  — pattern matching so sánh tham chiếu, bỏ qua toán tử
go?.name          // VẪN CHẠY — null-conditional cũng bỏ qua toán tử -> MissingReferenceException
go ?? fallback    // trả về go (đã chết), không trả fallback
```

| Viết thế này với `UnityEngine.Object` | Kết quả |
|---|---|
| `if (obj == null)` / `if (!obj)` | **Đúng** — dùng cái này |
| `if (obj is null)` | Sai: object đã destroy vẫn lọt qua |
| `obj?.DoSomething()` | Sai: gọi vào object đã chết |
| `obj ?? backup` | Sai: nhận về object đã chết |

Bộ analyzer đi kèm Unity (và Rider) cảnh báo đúng hai trường hợp này — `UNT0008` cho `?.` và `UNT0007` cho `??` trên Unity object. Thấy cảnh báo đó thì đừng tắt, hãy sửa.

Luật gọn để nhớ và để nói trong phỏng vấn: **với `UnityEngine.Object` thì chỉ dùng `==`/`!=` hoặc ép sang `bool`; với object C# thuần thì `?.` và `??` dùng thoải mái.**

Lưu ý thêm: mỗi lần `obj == null` với Unity object là một lời gọi toán tử có kiểm tra native, **không** miễn phí như so sánh tham chiếu. Trong vòng lặp nóng thì cache kết quả thay vì kiểm mỗi frame.

## Ba nguồn `NullReferenceException` trong Unity

| Triệu chứng | Nguyên nhân thật |
|---|---|
| `NullReferenceException` ngay khi vào Play | Field `[SerializeField]` chưa kéo thả trong Inspector — thêm `[RequireComponent]` hoặc kiểm trong `Awake` và log rõ tên field |
| `MissingReferenceException` giữa trận | Object đã bị `Destroy` nhưng còn ai đó giữ tham chiếu — thường là một danh sách hoặc một event chưa huỷ đăng ký, xem [[csharp-delegate-event]] |
| Null chỉ trên bản build, không có trong Editor | Code stripping xoá thứ chỉ gọi qua reflection, nên deserialize ra object rỗng — xem [[unity-build-platform]] |

Ba dòng này trả lời được gần hết câu hỏi "gặp `NullReferenceException` thì anh làm gì" — vì chúng phân biệt **ba nguyên nhân khác nhau** thay vì nói chung chung "kiểm tra null trước khi dùng".

## Bẫy còn lại

- **`catch (Exception)` rỗng** — im lặng nuốt lỗi. Nếu thật sự muốn bỏ qua thì viết comment nói rõ vì sao.
- **Bắt `OperationCanceledException` chung với lỗi thật**: huỷ là luồng bình thường, đừng log đỏ — xem [[csharp-async]].
- **Ném exception trong `finally`** che mất exception gốc.
- **Ném exception từ property getter** — người đọc code không bao giờ ngờ tới.
- **WebGL**: chế độ xử lý exception ảnh hưởng kích thước và tốc độ bản build; chọn mức thấp nhất mà vẫn chẩn đoán được.
- **`Debug.LogError` không phải là xử lý lỗi**: nó chỉ ghi lại. Sau khi ghi vẫn phải quyết định — dừng, thử lại, hay dùng giá trị mặc định.

## Kiểm tra nhanh

- [ ] Không `catch (Exception)` rỗng nào không có comment giải thích
- [ ] Mọi chỗ ném lại dùng `throw;`, không `throw ex;`
- [ ] Việc "có thể không tìm thấy" đi qua `Try…`, không qua exception
- [ ] Không `?.` hay `??` nào trên `UnityEngine.Object`
- [ ] Mọi field `[SerializeField]` bắt buộc đều được kiểm trong `Awake` và log kèm tên object
- [ ] Có một tầng ngoài cùng bắt mọi lỗi chưa ai bắt và báo cáo về nơi đọc được

## 🤖 Prompt cho AI

**Dùng AI thế nào cho xử lý lỗi**

AI có hai thiên kiến ngược nhau ở chủ đề này, và cả hai đều tệ theo cách riêng. Một: nó **bọc mọi thứ trong `try/catch`** rồi log, biến mọi lỗi thành cảnh báo và không lỗi nào dừng được chương trình. Hai: khi được nhờ "xử lý lỗi", nó **ném exception cho cả những trường hợp bình thường** như không tìm thấy item.

Việc đáng giao: chuyển một hàm ném exception sang mẫu `Try…`, rà các chỗ `throw ex` thành `throw`, sinh lớp exception riêng cho một hệ thống con, và — rất hợp với AI — **rà toàn bộ `?.`/`??` trên Unity object**, thứ mắt người bỏ sót rất dễ.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Lỗi này bình thường hay bất thường** — quyết định `Try…` hay exception. AI không suy ra được từ code.
- **Ai xử lý được lỗi này**: chỗ gọi có phương án dự phòng không, hay phải báo lên UI.
- **Chạy trong Unity hay C# thuần** — quyết định luật null giả có áp dụng không.
- **Bản build có gửi báo cáo crash không**, và log đi đâu.
- **Hàm có nằm trong vòng lặp nóng không** — quyết định có được phép ném hay không.

**Mẫu prompt**

```
Unity 6, C# 9. Rà file dưới đây về xử lý lỗi và null.

<dán file>

Việc, theo đúng thứ tự:
1. Liệt kê mọi `?.` và `??` đang áp lên kiểu kế thừa UnityEngine.Object.
   Với mỗi chỗ: viết lại bằng == null và giải thích ngắn vì sao (null giả).
2. Liệt kê mọi `throw ex;` -> đổi thành `throw;`.
3. Liệt kê mọi catch rỗng, nói rõ lỗi nào đang bị nuốt.
4. Chỉ ra chỗ nào đang dùng exception cho trường hợp BÌNH THƯỜNG
   (không tìm thấy, không đủ tiền) và viết lại theo mẫu TryXxx(out …).

KHÔNG thêm try/catch mới ở chỗ chưa có. KHÔNG đổi kiến trúc.
Chỗ nào không chắc lỗi là bình thường hay bất thường thì HỎI tôi.
```

**Bẫy thường gặp:** AI dùng `?.` trên `GetComponent<T>()` vì đó là cách viết C# hiện đại — và code đó gọi vào object đã destroy mà không ai thấy cho tới khi có người báo lỗi lạ. Bẫy thứ hai: nó bọc cả `Update` trong `try/catch` để "an toàn", che luôn mọi bug logic. Bẫy thứ ba: nó viết `catch (Exception e) { Debug.LogError(e); }` rồi coi như đã xử lý — ghi log không phải là xử lý, vẫn phải quyết định làm gì tiếp.

## 💻 Code

Demo ba thứ đo được: giá thật của `throw` so với mẫu `Try…`, `throw ex` xoá stack trace thế nào, và **mô phỏng null giả của Unity** bằng một lớp nạp chồng `==` — cách duy nhất để thấy cơ chế đó chạy mà không cần mở Unity. Chạy bằng `dotnet run`.

**Script**

```csharp
// Program.cs — .NET 6+ (dotnet new console && dotnet run)
using System;
using System.Diagnostics;

// Mô phỏng UnityEngine.Object: nạp chồng == để "đã destroy" được coi như null.
// Đây đúng là cơ chế Unity dùng, viết lại tối giản để chạy được ngoài Unity.
class FakeUnityObject
{
    public string Name = "Panel";
    public bool Destroyed;

    public static bool operator ==(FakeUnityObject a, FakeUnityObject b)
    {
        bool aNull = a is null || a.Destroyed;      // 'is null' ở ĐÂY là so sánh tham chiếu thật
        bool bNull = b is null || b.Destroyed;
        return aNull && bNull ? true : ReferenceEquals(a, b);
    }
    public static bool operator !=(FakeUnityObject a, FakeUnityObject b) => !(a == b);
    public static implicit operator bool(FakeUnityObject o) => !(o is null) && !o.Destroyed;

    public override bool Equals(object o) => ReferenceEquals(this, o);
    public override int GetHashCode() => base.GetHashCode();
    public string Describe() => $"tôi là {Name}, Destroyed={Destroyed}";
}

static class Program
{
    const int N = 20_000;

    static void Main()
    {
        // 1) throw so với TryParse
        var bad = "abc";
        var sw = Stopwatch.StartNew();
        int ok = 0;
        for (int i = 0; i < N; i++)
        {
            try { ok += int.Parse(bad); } catch (FormatException) { }
        }
        long throwMs = sw.ElapsedMilliseconds;

        sw.Restart();
        for (int i = 0; i < N; i++) if (int.TryParse(bad, out var v)) ok += v;
        long tryMs = sw.ElapsedMilliseconds;

        Console.WriteLine($"{N} lần xử lý chuỗi sai:");
        Console.WriteLine($"  Parse + catch : {throwMs,5} ms");
        Console.WriteLine($"  TryParse      : {tryMs,5} ms   <- không ném thì không tốn gì\n");

        // 2) throw; so với throw ex;
        Console.WriteLine("2) stack trace sau khi ném lại:");
        Console.WriteLine($"  throw;    -> {FirstFrame(() => RethrowCorrect())}");
        Console.WriteLine($"  throw ex; -> {FirstFrame(() => RethrowWrong())}   <- mất chỗ lỗi thật\n");

        // 3) null giả
        var panel = new FakeUnityObject();
        panel.Destroyed = true;                      // tương đương Destroy(gameObject)

        Console.WriteLine("3) object đã 'Destroy':");
        Console.WriteLine($"  panel == null   : {panel == null}    <- toán tử nạp chồng: ĐÚNG");
        Console.WriteLine($"  panel is null   : {panel is null}    <- so sánh tham chiếu: KHÔNG thấy");
        Console.WriteLine($"  if (!panel)     : {!panel}    <- ép sang bool: ĐÚNG");
        Console.WriteLine($"  panel?.Describe(): {panel?.Describe()}");
        Console.WriteLine("  ^ dòng trên VẪN chạy vào object đã chết — trong Unity đây là MissingReferenceException");
        var backup = new FakeUnityObject { Name = "Backup" };
        Console.WriteLine($"  (panel ?? backup).Name : {(panel ?? backup).Name}   <- nhận về Panel đã chết, không phải Backup");
    }

    static void RethrowCorrect()
    {
        try { Deep(); }
        catch (InvalidOperationException) { throw; }          // giữ stack gốc
    }

    static void RethrowWrong()
    {
        try { Deep(); }
        catch (InvalidOperationException ex) { throw ex; }     // đặt lại stack từ đây
    }

    static void Deep() => throw new InvalidOperationException("lỗi thật nằm ở Deep()");

    // Lấy dòng đầu của stack trace để thấy nó trỏ vào đâu
    static string FirstFrame(Action a)
    {
        try { a(); return "(không ném)"; }
        catch (Exception e)
        {
            var line = (e.StackTrace ?? "").Split('\n')[0].Trim();
            return line.Length > 70 ? line.Substring(0, 70) : line;
        }
    }
}
```

**Chạy thử**
- Phần 1: đường `Parse + catch` chậm hơn `TryParse` **hàng trăm lần** ở 20.000 lần lặp. Đó là lý do mẫu `Try…` tồn tại — không phải vì `try` đắt, mà vì `throw` đắt.
- Phần 2: dòng `throw;` in ra frame `Deep()` — chỗ lỗi thật. Dòng `throw ex;` in ra `RethrowWrong()` — chỗ ném lại. Đúng một dấu chấm phẩy khác nhau, và nó là khác biệt giữa tìm ra bug trong 5 phút hay trong hai ngày.
- Phần 3: `panel == null` ra `True` trong khi `panel is null` ra `False`, và `panel?.Describe()` **vẫn chạy** rồi in ra `Destroyed=True`. Đây chính là cơ chế null giả của Unity, thấy tận mắt: `?.` bỏ qua toán tử nạp chồng nên nó không biết object đã chết.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`try/catch` có làm chậm chương trình không?**
  → Khối `try` khi không có exception gần như miễn phí, nên không có lý do tránh nó vì hiệu năng. Đắt là lúc **ném**: mỗi lần `throw` tốn cỡ vài microsecond vì phải gỡ ngăn xếp và dựng stack trace. Nên vấn đề không phải đặt `try` ở đâu mà là ném bao nhiêu lần.
- `Junior` **Khi nào dùng exception, khi nào trả về `false`?**
  → Exception cho chuyện **bất thường**: save hỏng, phản hồi server sai định dạng. Mẫu `Try…` cho chuyện **bình thường**: người chơi gõ sai, không tìm thấy item, không đủ tiền. Quy tắc kiểm tra nhanh là hỏi "chuyện này xảy ra mỗi phiên chơi không" — có thì đừng ném.
- `Junior` **`?.` và `??` làm gì?**
  → `?.` dừng chuỗi truy cập khi gặp `null` và trả về `null`; `??` cho giá trị thay thế khi vế trái `null`. Cả hai rất tiện với object C# thuần — nhưng với `UnityEngine.Object` thì **không được dùng**, vì chúng bỏ qua toán tử `==` nạp chồng của Unity.
- `Mid` **`throw;` và `throw ex;` khác nhau thế nào?**
  → `throw;` giữ nguyên stack trace gốc; `throw ex;` đặt lại stack từ dòng đó, nên log chỉ ra chỗ ném lại chứ không ra chỗ lỗi thật sự xảy ra. Muốn ném lại từ nơi khác mà vẫn giữ stack thì dùng `ExceptionDispatchInfo.Capture(ex).Throw()`.
- `Mid` **Vì sao `obj?.Method()` nguy hiểm với Unity object?**
  → Vì Unity nạp chồng toán tử `==` để object đã `Destroy` được coi như `null`, trong khi tham chiếu C# vẫn còn. Toán tử `?.` và `??` **không** đi qua toán tử nạp chồng — chúng so sánh tham chiếu thật — nên chúng thấy object vẫn sống và gọi thẳng vào đó, kết quả là `MissingReferenceException`. Luật của tôi: với Unity object chỉ dùng `== null` hoặc ép sang `bool`.
- `Mid` **Gặp `NullReferenceException` thì anh làm gì?**
  → Phân loại trước đã, vì có ba nguyên nhân khác hẳn nhau. Nếu nổ ngay khi vào Play thì thường là field `[SerializeField]` chưa kéo trong Inspector. Nếu là `MissingReferenceException` giữa trận thì có ai đó giữ tham chiếu tới object đã destroy — hay gặp nhất là một event chưa huỷ đăng ký. Nếu chỉ nổ trên bản build thì nghi code stripping xoá mất thứ chỉ dùng qua reflection.
- `Senior` **Anh bắt exception ở tầng nào?**
  → Ba tầng. Sát chỗ lỗi nếu có phương án dự phòng — config hỏng thì dùng mặc định. Ở ranh giới hệ thống con thì đổi lỗi kỹ thuật thành lỗi có nghĩa cho tầng trên, ví dụ `SaveCorruptedException`. Và một tầng ngoài cùng bắt mọi thứ chưa ai bắt để báo cáo crash. Thứ tôi không làm là `catch (Exception) {}` ở giữa chừng — nó biến lỗi ồn ào thành bug im lặng.
- `Senior` **Unity nuốt exception trong `Update`, tốt hay xấu?**
  → Cả hai. Tốt vì một script hỏng không làm chết cả game. Xấu vì một script có thể ném mỗi frame suốt mười phút mà người chơi vẫn "chơi được", còn log thì trôi và không ai đọc. Nên tôi luôn có một tầng ghi nhận: gom lỗi theo chữ ký, đếm số lần, và gửi về dịch vụ báo cáo crash thay vì chỉ `Debug.LogError`.
- `Senior` **`#nullable enable` có đáng bật trong dự án Unity không?**
  → Đáng, nhưng theo từng file và chỉ cho code thuần C# — tầng logic, tầng dữ liệu, tầng gọi API. Bật cho cả dự án thì ngập cảnh báo vì API của engine phần lớn chưa được chú thích nullable, và cảnh báo mà không ai sửa thì thành nhiễu. Lợi ích thật nằm ở chỗ nó biến một lớp bug runtime thành cảnh báo lúc biên dịch.

**Khung trả lời 60 giây** — "`null` trong Unity khác `null` trong C# thế nào?"

> Unity nạp chồng toán tử `==` cho `UnityEngine.Object`. Khi bạn `Destroy` một GameObject, phần native của nó chết ngay nhưng **object C# vẫn còn trên heap**; toán tử nạp chồng kiểm điều đó và trả về `true` cho `obj == null`. Mục đích là để code đọc tự nhiên.
>
> Cái giá là những cách kiểm tra **không đi qua toán tử** sẽ thấy object vẫn sống: `obj is null` trả về `false`, `obj?.Method()` gọi thẳng vào object đã chết, và `obj ?? backup` trả về chính object chết đó. Trong Unity, kết quả là `MissingReferenceException` ở một chỗ trông hoàn toàn vô hại.
>
> Nên luật của tôi rất cứng: với `UnityEngine.Object` thì chỉ `== null`, `!= null`, hoặc ép sang `bool` — `if (!panel)`. Với object C# thuần thì `?.` và `??` dùng thoải mái. Bộ analyzer của Unity cũng cảnh báo đúng hai trường hợp này, và tôi coi cảnh báo đó là lỗi chứ không tắt đi.

**Họ sẽ đào tiếp**

- *"Vì sao Unity làm vậy?"* → Để `if (target == null)` vẫn đúng sau khi object bị destroy, thay vì bắt lập trình viên nhớ một API riêng. Đổi lại nó phá vỡ giả định "null là null" của các toán tử C# mới hơn.
- *"Kiểm tra null có tốn gì không?"* → Với Unity object thì có: mỗi lần `== null` là một lời gọi toán tử kèm kiểm tra phía native, không phải so sánh con trỏ. Trong vòng lặp nóng thì cache kết quả.
- *"`TryGetComponent` khác gì `GetComponent`?"* → Trả về `bool` thay vì null giả, và tránh khoản cấp phát nhỏ khi không tìm thấy trong Editor. Nó cũng làm ý định rõ hơn: "có thì dùng, không có thì thôi".
- *"Ba nguồn `NullReferenceException` trong Unity?"* → Field chưa kéo trong Inspector; tham chiếu tới object đã destroy; và code stripping xoá mất thứ chỉ gọi qua reflection nên deserialize ra rỗng.
- *"Ghi log đã là xử lý lỗi chưa?"* → Chưa. Sau khi ghi vẫn phải quyết định: thử lại, dùng giá trị mặc định, hay dừng và báo người chơi. `Debug.LogError` rồi đi tiếp là cách để bug sống lâu.

**Cờ đỏ**

- `catch (Exception) { }` rỗng, hoặc bọc cả `Update` trong try/catch "cho an toàn".
- `throw ex;` và không biết nó xoá stack trace.
- Dùng `?.` trên `GetComponent<T>()` hay bất cứ Unity object nào.
- Dùng exception cho luồng bình thường, ví dụ `try { Parse } catch` mỗi frame.
- Nói "kiểm tra null trước khi dùng" mà không phân biệt được ba nguyên nhân gây null trong Unity.

**Số / ví dụ nên thuộc**

- `try` không ném: **gần như 0**. Một lần `throw`: **vài microsecond**.
- `throw;` giữ stack, `throw ex;` **đặt lại** stack.
- Với `UnityEngine.Object`: **`==`/`!=`/`bool` đúng**; **`is null`, `?.`, `??` sai**.
- Cảnh báo của Unity analyzer: **UNT0007** (`??`) và **UNT0008** (`?.`).
- Ba nguồn null trong Unity: Inspector chưa kéo · object đã destroy · code stripping.
