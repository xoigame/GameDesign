---
id: interview-csharp-bank
title: Ngân hàng câu hỏi C# cho game developer
icon: 🔷
summary: Bảng ôn nhanh 12 chủ đề C# và khoảng 48 câu hỏi có lời giải, trộn Junior/Mid/Senior, viết cho vòng phỏng vấn hỏi sâu ngôn ngữ của một Mobile Game Developer dùng Unity.
status: deep
read: 1113
level: intermediate
order: 13
tags: [interview, csharp, dotnet, language]
related: [csharp-interview-kit, csharp-type-system, csharp-memory, interview-oop-math]
---

Node này là **ngân hàng câu hỏi** gom theo 12 chủ đề, để ôn trong một buổi trước vòng hỏi theo CV. Nó **không** chép lại các câu đã có trong mục 🎤 của nhánh C# — những câu đó nằm ở [[csharp-interview-kit]] và từng node chuyên đề. Ở đây là góc khác: câu bẫy, câu so sánh, câu "đọc đoạn code này nói nó in ra gì". Học sâu thì vào node chuyên đề, ôn nhanh thì dùng bảng dưới.

## Bảng ôn nhanh 12 chủ đề

| # | Chủ đề | Phải nói được | Học sâu |
|---|---|---|---|
| 1 | Kiểu và bộ nhớ | `value type` chứa dữ liệu trực tiếp, `reference type` chứa tham chiếu tới heap · "struct nằm trên stack" là nói sai: struct là field của class thì nằm trong heap cùng class · boxing = bọc value type vào `object` trên heap, `int` thành khoảng 24 byte trên x64 · `string` bất biến nên nối trong vòng lặp sinh rác, dùng `StringBuilder` · literal giống nhau được interning dùng chung một object | [[csharp-type-system]], [[csharp-memory]] |
| 2 | Tham số | `ref` bắt buộc khởi tạo trước, `out` bắt buộc gán trong hàm, `in` truyền tham chiếu chỉ đọc · `params` gói đối số thành mảng nên mỗi lần gọi có thể cấp phát · tham số tuỳ chọn được trình biên dịch nhúng giá trị mặc định vào nơi gọi · named argument giúp đọc code, không đổi hành vi | [[csharp-type-system]] |
| 3 | Class, struct, record | class: tham chiếu, struct: sao chép khi gán · `readonly struct` ngăn sao chép phòng thủ khi dùng `in` · `record` là class có Equals theo giá trị, `with` tạo bản sao · `init` cho phép gán lúc khởi tạo rồi khoá · `record struct` cần C# 10 nên chưa có trong Unity 6 | [[csharp-type-system]], [[csharp-modern]] |
| 4 | Equality | `==` mặc định so tham chiếu với class, so giá trị với struct có overload · `Equals` so theo định nghĩa lớp · override `Equals` thì phải override `GetHashCode` · `IEquatable<T>` tránh boxing khi struct làm key · `ReferenceEquals` luôn so tham chiếu | [[csharp-type-system]], [[csharp-collections]] |
| 5 | OOP | `virtual`/`override` quyết định lúc chạy, `new` che giấu theo kiểu khai báo · `sealed`, `abstract` · `static` thuộc kiểu, không thuộc object · extension method là hàm tĩnh gọi như hàm thành viên · `partial` chia một lớp nhiều file · `internal` theo assembly, `protected internal` là hoặc, `private protected` là và | [[csharp-oop-interface]] |
| 6 | Generic | constraint: `where T : class, struct, new(), unmanaged, IFoo` · `out T` covariance, `in T` contravariance · mỗi tổ hợp tham số kiểu có field `static` riêng · với value type generic tạo mã riêng, với reference type dùng chung mã | [[csharp-generic]] |
| 7 | Delegate và event | delegate là kiểu tham chiếu tới hàm, multicast gọi tuần tự · `event` chỉ cho `+=`/`-=` bên ngoài · `Action` không trả về, `Func` có trả về · lambda bắt biến ngoài tạo closure, sinh object ẩn · lambda không huỷ đăng ký được nếu không giữ tham chiếu | [[csharp-delegate-event]] |
| 8 | Collection | `List` mảng co giãn, `Dictionary` bảng băm, `HashSet` tập, `Queue`/`Stack`, `LinkedList` hiếm khi đáng dùng, `SortedDictionary` cây cân bằng · `Span<T>` là view không cấp phát · `ArrayPool` mượn mảng · `IEnumerable` chỉ duyệt, `ICollection` có Count/Add, `IList` có chỉ số · `yield` sinh máy trạng thái | [[csharp-collections]], [[csharp-memory]] |
| 9 | LINQ | deferred: `Where`, `Select`, `OrderBy` chưa chạy cho tới khi duyệt · immediate: `ToList`, `Count`, `First` · mỗi toán tử sinh iterator và delegate = rác · duyệt hai lần là chạy truy vấn hai lần | [[csharp-linq]] |
| 10 | Exception và tài nguyên | `try/catch/finally`, `catch ... when (điều kiện)` · `throw;` giữ stack, `throw ex;` xoá · `using` gọi `Dispose` kể cả khi lỗi · finalizer chạy do GC, không xác định thời điểm · không dùng exception cho luồng điều khiển thường | [[csharp-exception-null]], [[csharp-memory]] |
| 11 | Async và luồng | `Task` đại diện việc, `async/await` là máy trạng thái chứ không tự tạo thread · `ValueTask` tránh cấp phát khi hay hoàn tất đồng bộ · `async void` chỉ cho event handler · `CancellationToken` để huỷ hợp tác · `lock` loại trừ, `Interlocked` nguyên tử, `volatile` chỉ đảm bảo hiển thị | [[csharp-async]], [[csharp-threading]] |
| 12 | C# hiện đại | Unity 6 dùng C# 9: pattern matching, switch expression, target-typed `new`, local function, tuple, nullable reference (tuỳ chọn), `record` (class), default interface method có hỗ trợ hạn chế · KHÔNG dùng được: `record struct`, `required`, file-scoped namespace, global using, raw string, list pattern | [[csharp-modern]] |

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc ôn câu hỏi C#**

AI làm tốt vai người phỏng vấn giả: hỏi dồn, chấm câu trả lời bạn gõ, chỉ ra chỗ nói thiếu. AI làm dở vai nguồn chân lý về hành vi runtime của Unity: nó hay lẫn .NET hiện đại với Mono/IL2CPP trong Unity 6 và hay khẳng định tính năng C# 10/11 dùng được. Quy trình ba bước: (1) bạn tự trả lời bằng miệng hoặc gõ ra trước, (2) nhờ AI chấm theo thang đã định, (3) mọi khẳng định về Unity phải tự thử trong Editor hoặc đọc tài liệu rồi mới thuộc.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Hỏi dồn | Còn 1–2 ngày, cần luyện phản xạ | "Hỏi tôi từng câu một, không đưa đáp án trước" |
| Chấm đáp án | Sau khi bạn trả lời | "Chấm câu trả lời này theo ba tiêu chí: đúng, có ví dụ game, có lý do" |
| Soi bẫy | Ôn chủ đề hay nhầm | "Cho 5 đoạn code ngắn, mỗi đoạn một bẫy, hỏi in ra gì" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- Phiên bản Unity và Scripting Backend (Mono hay IL2CPP) — quyết định C# 9 hay mới hơn, và chuyện AOT với generic.
- Mức đang ứng tuyển (Senior hay Mid) để AI chọn độ sâu, không hỏi định nghĩa suông.
- Bối cảnh mobile: giới hạn RAM, GC spike, không dùng thread tuỳ tiện.
- Bạn đã mạnh phần nào (ASP.NET, async) để AI không phí thời gian ở đó.

**Mẫu prompt**

```
Đóng vai người phỏng vấn Mobile Game Developer, Unity 6 (C# 9, IL2CPP).
Hỏi tôi 10 câu C# về chủ đề: <chủ đề>, mức Senior, mỗi lần MỘT câu.
Sau mỗi câu trả lời của tôi: chấm 0-3 điểm theo (đúng, có ví dụ game, có lý do),
nêu 1 ý còn thiếu, rồi hỏi câu tiếp. CẤM đưa đáp án trước khi tôi trả lời.
CẤM dùng tính năng C# 10 trở lên khi ra đề, và CẤM bịa con số hiệu năng;
nếu không chắc một con số thì nói "cần đo bằng Profiler".
```

**Bẫy thường gặp:** AI khẳng định `record struct`, file-scoped namespace hay `required` chạy được trong Unity 6; AI trả lời "struct nằm trên stack" như một quy tắc tuyệt đối; AI đưa con số nanosecond cho `lock`, boxing, LINQ mà không có nguồn — nghe thuyết phục nhưng sai theo máy, theo bản runtime. Đồ chấm của AI cũng hay dễ dãi: câu đúng nửa vẫn cho điểm cao.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`int` truyền vào hàm và `Player` truyền vào hàm, hàm sửa tham số — bên gọi thấy gì?**
  → Với `int`, hàm nhận bản sao nên sửa xong bên gọi không thấy gì; với `Player` (class) hàm nhận bản sao của tham chiếu nên sửa field thì bên gọi thấy. Nhưng gán `p = new Player()` trong hàm thì bên gọi không đổi, vì tham chiếu cũng truyền theo giá trị. Muốn đổi cả tham chiếu phải dùng `ref`.
- `Junior` **`string` nối trong vòng lặp 1000 lần có vấn đề gì, sửa thế nào?**
  → Mỗi phép `+` tạo một chuỗi mới vì `string` bất biến, nên 1000 lần là 1000 object rác cho GC, ví dụ khi dựng chuỗi log hay bảng xếp hạng mỗi frame. Dùng `StringBuilder` tái sử dụng (gọi `Clear()`) để chỉ cấp phát bộ đệm một lần. Với chuỗi hiển thị lặp lại mỗi frame còn nên cache khi giá trị không đổi.
- `Junior` **Hai literal `"abc"` giống nhau thì `ReferenceEquals` ra gì?**
  → Ra `true`, vì trình biên dịch gom literal giống nhau vào bảng interning, hai biến trỏ cùng một object. Chuỗi tạo lúc chạy (nối, `Substring`) thì không tự động interning nên `ReferenceEquals` ra `false` dù nội dung bằng. Vì thế so sánh nội dung phải dùng `==` hoặc `string.Equals`, đừng dựa vào tham chiếu.
- `Junior` **`ref`, `out`, `in` khác nhau thế nào? Cho ví dụ game.**
  → `ref` đọc và ghi, biến phải khởi tạo trước; `out` hàm bắt buộc gán, bên gọi không cần khởi tạo, như `TryGetValue(id, out var enemy)`; `in` truyền tham chiếu chỉ đọc để khỏi sao chép struct lớn như ma trận. Dùng `out` trả nhiều giá trị mà không cấp phát tuple object, vì nó chỉ ghi thẳng vào biến của bên gọi.
- `Junior` **`params` có miễn phí không?**
  → Không: mỗi lần gọi với danh sách rời, trình biên dịch tạo một mảng mới trên heap để gói đối số. Hàm `Log(params object[] args)` gọi mỗi frame vừa sinh mảng vừa boxing các giá trị `int`. Với hàm nóng nên viết sẵn vài overload cố định số tham số, vì overload thì không cần mảng.
- `Junior` **`override` và `new` trên method cùng tên khác nhau thế nào?**
  → `override` thay hành vi theo kiểu thật của object lúc chạy, nên `Weapon w = new Shotgun(); w.Fire()` gọi bản của `Shotgun`. `new` chỉ che giấu, việc chọn hàm dựa vào kiểu khai báo, nên cùng đoạn trên có thể gọi bản của `Weapon`. Trong game dễ gây lỗi âm thầm khi lớp cha giữ danh sách vũ khí, vì gọi qua kiểu cha sẽ bỏ qua bản `new`.
- `Junior` **`internal`, `protected internal`, `private protected` khác nhau ra sao?**
  → `internal` thấy được trong cùng assembly — trong Unity là cùng asmdef. `protected internal` là *hoặc*: lớp con ở bất kỳ đâu hoặc bất kỳ ai cùng assembly; `private protected` là *và*: chỉ lớp con nằm trong cùng assembly. Ý nghĩa thực tế là chia module bằng asmdef, vì `internal` giấu chi tiết khỏi module khác.
- `Mid` **`Dictionary<Vector2Int, Tile>` chạy đúng nhưng chậm và sinh rác — nghi ở đâu?**
  → Nghi `Vector2Int` không cài `IEquatable` đúng cách trong phiên bản bạn dùng hoặc bạn tự viết struct key thiếu `IEquatable<T>`, nên mỗi lần so sánh phải boxing `Equals(object)`. Struct tự viết làm key phải override `GetHashCode` và cài `IEquatable<T>` để tránh boxing, vì `Dictionary` mặc định gọi qua comparer. Kiểm bằng Profiler xem `GC.Alloc` ở dòng tra bảng; nếu cần, truyền `IEqualityComparer<T>` riêng vào constructor.
- `Mid` **Override `Equals` mà quên `GetHashCode` thì hỏng ở đâu?**
  → Hai object bằng nhau theo `Equals` lại có hash khác, nên bỏ vào `HashSet`/`Dictionary` thì tra không ra hoặc chứa trùng. Ví dụ hai `ItemStack` cùng id vẫn thành hai khoá. Quy tắc: hai object bằng nhau thì hash bắt buộc bằng nhau, vì bảng băm tìm theo hash trước rồi mới gọi `Equals`.
- `Mid` **Vì sao `==` của `string` so nội dung còn `==` của class thường so tham chiếu?**
  → `string` overload toán tử `==` để so theo nội dung, còn class không overload thì dùng so tham chiếu mặc định của `object`. Hệ quả trong game: so hai `ItemData` thường là so tham chiếu, nên hai bản ScriptableObject nhân bản trông giống nhau vẫn khác. Muốn so theo giá trị phải override `Equals` hoặc dùng `record`, vì khi đó compiler sinh so sánh từng field.
- `Mid` **`readonly struct` giải quyết vấn đề gì khi dùng với `in`?**
  → Khi gọi hàm trên một struct không `readonly` qua tham số `in`, trình biên dịch tạo bản sao phòng thủ vì sợ hàm làm đổi dữ liệu, mất lợi ích của `in`. Đánh dấu `readonly struct` cho trình biên dịch biết không có gì đổi nên bỏ bản sao. Với struct lớn như dữ liệu một viên đạn gọi nhiều lần mỗi frame thì sao chép là chi phí thật, vì vậy cặp `in` + `readonly struct` đi với nhau.
- `Mid` **`init` và `readonly` field khác nhau thế nào?**
  → `readonly` field chỉ gán được trong constructor; `init` là accessor của property, cho gán trong object initializer lúc tạo rồi khoá, tiện cho cấu hình như `new SpawnConfig { Count = 5 }`. Nên `init` hợp với dữ liệu cấu hình bất biến, `readonly` hợp với trạng thái nội bộ. Lưu ý Unity 6 cần định nghĩa lớp giả `IsExternalInit` mới dùng được `init`, vì thiếu kiểu này trình biên dịch báo lỗi.
- `Mid` **Static field trong lớp generic `Pool<T>` có bao nhiêu bản?**
  → Mỗi tổ hợp tham số kiểu là một kiểu riêng nên có một bản static riêng: `Pool<Bullet>.count` và `Pool<Enemy>.count` độc lập. Ta dùng được tính chất này để làm cache theo kiểu mà không cần `Dictionary<Type, ...>`. Bẫy là lẫn tưởng rằng bộ đếm chung; vì mỗi kiểu có bản riêng nên đếm tổng phải cộng tay.
- `Mid` **Variance: vì sao `IEnumerable<Zombie>` gán được cho `IEnumerable<Enemy>` nhưng `List<Zombie>` thì không?**
  → `IEnumerable<out T>` chỉ trả `T` ra nên an toàn khi coi `Zombie` là `Enemy`. `List<T>` vừa đọc vừa ghi: nếu cho gán sang `List<Enemy>` thì có thể `Add` một `Archer` vào danh sách zombie, vỡ kiểu. Vì thế variance chỉ áp cho interface/delegate đánh dấu `in`/`out`, và với struct (value type) variance không áp dụng, vì bố cục bộ nhớ của hai struct khác nhau không thể coi là một.
- `Mid` **Closure trong vòng `for` bắt biến `i` — lỗi kinh điển là gì?**
  → Lambda bắt chính biến `i` chứ không bắt giá trị, nên nếu gọi sau vòng lặp thì mọi lambda đều thấy giá trị cuối. Ví dụ gắn `onClick` cho 5 nút bằng `() => Select(i)` thì bấm nút nào cũng chọn nút thứ 5. Sửa bằng cách chép vào biến cục bộ trong thân vòng lặp (`var idx = i;`), vì mỗi vòng sinh một biến riêng.
- `Mid` **Multicast delegate: nếu hàm giữa ném exception, các hàm sau thế nào, và giá trị trả về lấy của hàm nào?**
  → Exception dừng chuỗi gọi ngay, các hàm đăng ký sau không được chạy; ví dụ một handler `OnDeath` lỗi làm handler cộng điểm không chạy. Với delegate có giá trị trả về, chỉ giá trị của hàm cuối cùng được giữ. Muốn an toàn thì duyệt `GetInvocationList()` và bọc từng lời gọi trong try/catch, vì khi đó mỗi hàm được gọi độc lập.
- `Mid` **`IEnumerable`, `ICollection`, `IList` khác nhau thế nào, tham số hàm nên nhận cái nào?**
  → `IEnumerable<T>` chỉ duyệt tới; `ICollection<T>` thêm `Count`, `Add`, `Remove`; `IList<T>` thêm truy cập theo chỉ số. Hàm chỉ đọc nên nhận kiểu hẹp nhất cần dùng, ví dụ `IReadOnlyList<T>` nếu cần chỉ số. Nhưng nhận `IEnumerable` rồi `foreach` trên `List` truyền vào sẽ boxing enumerator struct, vì vậy ở hàm nóng trong `Update` nhận thẳng `List<T>` hoặc mảng.
- `Mid` **`foreach` trên `List<T>` có sinh rác không?**
  → Với `List<T>` thì không, vì enumerator là struct và trình biên dịch gọi thẳng, không boxing. Chỉ sinh rác khi duyệt qua biến kiểu `IEnumerable<T>` (boxing enumerator) hoặc qua LINQ. Do đó quy tắc "tránh foreach trên Update" của đời Unity cũ không còn đúng với List, mặc dù vẫn nên cẩn thận với mọi thứ qua interface.
- `Mid` **`Dictionary` duyệt theo thứ tự thêm vào không, và `SortedDictionary` dùng khi nào?**
  → `Dictionary` không đảm bảo thứ tự, không nên dựa vào nó dù thực tế thường ra theo thứ tự thêm. `SortedDictionary` giữ khoá có thứ tự bằng cây, thêm/tra O(log n), hợp bảng xếp hạng cần luôn sắp xếp. Nhưng nếu chỉ cần sắp một lần rồi đọc thì `List` + `Sort` rẻ hơn, vì cây tốn bộ nhớ theo từng nút.
- `Mid` **`LinkedList` có đáng dùng trong game không?**
  → Hiếm: mỗi nút là một object heap, duyệt nhảy khắp bộ nhớ nên cache miss nhiều, thường chậm hơn `List` dù chèn giữa O(1). Chỉ đáng dùng khi giữ sẵn tham chiếu nút để xoá O(1) với danh sách lớn, như hàng đợi timer cần xoá tuỳ ý. Trong đa số trường hợp mảng liên tục thắng, vì CPU ưa dữ liệu nằm sát nhau.
- `Mid` **`Where(...).ToList()` rồi lại `Count`: chạy mấy lần, ai chịu chi phí?**
  → `Where` hoãn lại, `ToList()` mới duyệt nguồn một lần và cấp phát một danh sách mới, `Count` sau đó chỉ đọc thuộc tính. Nếu bỏ `ToList()` và gọi `Count()` trên truy vấn thì mỗi lần là một lần duyệt nguồn. Kết quả dùng nhiều lần thì nên chốt bằng `ToList()` một lần ngoài `Update`, còn dùng một lần thì để nguyên, vì chốt sớm chỉ tốn thêm một danh sách.
- `Mid` **`catch (Exception e) when (e is TimeoutException)` khác `catch (TimeoutException)` thế nào?**
  → Bộ lọc `when` chạy trước khi stack bị tháo, nên stack trace và biến cục bộ còn nguyên cho tới khi quyết định bắt. Dùng được điều kiện phức tạp hơn kiểu, ví dụ chỉ bắt lỗi mạng có mã 503 để thử lại, còn lỗi khác bay tiếp. Cách này sạch hơn bắt rồi `throw;`, vì không làm đổi luồng với lỗi mình không xử lý.
- `Mid` **Dùng `using` mà object ném lỗi trong constructor thì `Dispose` có chạy không?**
  → Không, vì object chưa được tạo xong thì chưa có biến để gọi `Dispose`. Vì thế constructor giữ tài nguyên (file, socket) nên tự dọn nếu lỗi giữa chừng. Ví dụ lớp mở hai file, file thứ hai lỗi thì phải đóng file đầu trong khối try/catch của constructor.
- `Mid` **Finalizer có nên viết cho lớp giữ tài nguyên native trong game không?**
  → Chỉ khi giữ tài nguyên không được quản lý (handle, bộ nhớ native) và quên `Dispose` là có thể xảy ra; viết finalizer làm lưới an toàn, `Dispose` gọi `GC.SuppressFinalize`. Finalizer chạy trên thread riêng, thời điểm không xác định, và object sống thêm một chu kỳ GC, nên không lập logic game trên nó. Tốt hơn là `SafeHandle` hoặc `NativeArray` có `Dispose` rõ ràng, vì chúng đã lo sẵn phần này.
- `Mid` **`async void` sai ở đâu, ngoại trừ chỗ nào?**
  → Exception trong `async void` không bắt được ở nơi gọi, có thể đổ lên context và làm sập hoặc bị nuốt im lặng, lại không `await` được. Chỉ chấp nhận cho event handler (như `OnClick`) vì chữ ký bắt buộc `void`. Mọi chỗ khác trả `Task`, hoặc `Awaitable`/UniTask trong Unity, vì còn có thể `await` và bắt lỗi.
- `Mid` **`Task.Run` trong Unity dùng khi nào, và sau đó chạm `transform` được không?**
  → Dùng cho việc nặng CPU thuần dữ liệu như phân tích save file, giải nén, tìm đường trên mảng, vì nó chạy trên thread pool tách khỏi main thread. Không được chạm `transform`, `GameObject` hay API Unity ở đó; phải quay về main thread bằng `SynchronizationContext` hoặc `await` trở về. Với mobile nên giới hạn số tác vụ song song, vì nhiều thread tranh nhau ít lõi.
- `Senior` **Struct chứa field `List<int>` — sao chép struct thì sao, và có nên thế không?**
  → Sao chép struct chỉ chép tham chiếu `List`, hai bản trỏ cùng một danh sách, nên sửa ở bản này lộ ra ở bản kia: sao chép nông ngoài ý muốn. Với dữ liệu snapshot trạng thái trận đấu, đây là nguồn lỗi khó thấy. Hoặc đổi sang mảng và sao chép tường minh, hoặc dùng class, vì struct tốt nhất khi toàn field là value type.
- `Senior` **Bạn thiết kế cache theo kiểu bằng `static` trong class generic thay vì `Dictionary<Type, X>`. Ưu và rủi ro?**
  → Ưu: tra bằng truy cập field tĩnh, không băm, không khoá, và nhanh hơn `Dictionary<Type,...>` đáng kể trên đường nóng. Rủi ro: dữ liệu sống suốt vòng đời domain nên không tự dọn khi đổi scene, test dính trạng thái cũ, và đa luồng cần tự bảo vệ. Với IL2CPP còn phải đảm bảo các tổ hợp kiểu được sinh sẵn, vì generic trên value type tạo mã lúc biên dịch AOT.
- `Senior` **Generic trên value type chạy Editor tốt nhưng bản IL2CPP báo lỗi thiếu mã — cơ chế là gì?**
  → IL2CPP biên dịch trước (AOT) nên chỉ sinh mã cho tổ hợp generic nó thấy được lúc build; gọi bằng reflection hay `MakeGenericType` với value type có thể thiếu mã. Sửa bằng cách tham chiếu tường minh tổ hợp đó ở đâu đó trong code hoặc tránh reflection. Cho nên tính năng động kiểu này phải thử trên bản build thật, vì Editor dùng Mono JIT che mất lỗi.
- `Senior` **Vì sao closure trong `Update` bị coi là nguy hiểm, và bạn sửa thế nào?**
  → Lambda có bắt biến ngoài sẽ cấp phát một object closure mỗi lần tạo, nên viết `list.Find(x => x.id == myId)` mỗi frame là rác mỗi frame. Lambda không bắt gì thì được cache tĩnh, không sinh rác. Sửa bằng vòng for tay, hoặc truyền trạng thái qua tham số hàm, vì cách đó không cần closure.
- `Senior` **`lock(this)` hoặc `lock(typeof(X))` sai ở đâu?**
  → Bất kỳ đoạn code ngoài nào cũng có thể khoá cùng object đó, gây deadlock ngoài tầm nhìn của lớp bạn viết. Nên khoá trên một object riêng `private readonly object _gate = new object();` vì không ai ngoài lớp chạm vào được. Tương tự không khoá trên chuỗi, vì interning khiến hai module độc lập vô tình dùng chung một khoá.
- `Senior` **`volatile` có đủ để đếm số kẻ địch bị hạ từ nhiều thread không?**
  → Không, vì `count++` là ba bước đọc–cộng–ghi và `volatile` chỉ đảm bảo mỗi lần đọc/ghi thấy giá trị mới nhất, không làm cả ba bước thành nguyên tử. Hai thread có thể cùng đọc 5 và cùng ghi 6, mất một lần đếm. Dùng `Interlocked.Increment`, vì nó nguyên tử và rẻ hơn `lock` cho một biến đếm.
- `Senior` **Mô tả máy trạng thái mà `async` sinh ra và hệ quả cho hiệu năng mobile.**
  → Trình biên dịch biến mỗi hàm `async` thành một struct/class máy trạng thái giữ biến cục bộ qua các điểm `await`, và trả `Task` hoàn tất hoặc chưa. Nếu hàm hay hoàn tất đồng bộ (như đọc cache) thì `ValueTask` tránh cấp phát một `Task` mỗi lần. Trên mobile nên gom các `await` nhỏ trong vòng nóng lại hoặc dùng `Awaitable`/UniTask, vì rác của từng lần cộng dồn lên.
- `Senior` **Bạn thấy `ConfigureAwait(false)` trong code Unity — nói gì với đồng nghiệp?**
  → Trong Unity tiếp tục sau `await` thường cần ở main thread để chạm API Unity, còn `ConfigureAwait(false)` có thể nhảy sang thread pool, rồi chạm `transform` là lỗi hoặc sập. Nó chỉ có ích trong thư viện thuần .NET không dính Unity, như tầng mạng dùng lại từ server ASP.NET. Trong gameplay nên bỏ nó đi vì sau `await` phải còn ở main thread, còn tầng thư viện tách riêng thì giữ.
- `Senior` **Chọn `Span<T>` hay `ArrayPool<T>` để phân tích gói tin mạng nhận mỗi frame?**
  → `Span<T>` là view lên vùng nhớ có sẵn, không cấp phát, hợp để cắt và đọc gói trong bộ đệm đã có, nhưng nó là `ref struct` nên không để trong field class hay dùng qua `await`. `ArrayPool<T>` hợp khi cần mượn một bộ đệm lớn tạm rồi trả lại. Hai cái đi cùng: mượn mảng từ pool, đọc bằng `Span`, trả mảng — và nhớ trả, vì quên trả thì pool cạn dần.
- `Senior` **Tính năng C# 9 nào anh dùng để code gọn mà vẫn an toàn cho Unity, và cái nào tránh?**
  → Dùng switch expression, pattern matching với `is` kiểm kiểu/thuộc tính trên object thuần, local function, target-typed `new`, vì chúng chỉ là đường tắt biên dịch. Tránh `?.`, `??` và `is null` trên đối tượng `UnityEngine.Object`, vì chúng bỏ qua toán tử `==` đã overload của Unity (object bị Destroy vẫn "không null" với C#). Với default interface method thì thử trên IL2CPP trước khi dựa vào.
- `Senior` **So sánh `nullable reference types` với `[CanBeNull]` kiểu cũ trong dự án Unity lớn.**
  → Nullable reference types cho cảnh báo lúc biên dịch toàn dự án, bắt dereference null sớm, nhưng với `MonoBehaviour` các field gán qua Inspector khiến trình biên dịch tưởng null, sinh nhiều cảnh báo giả. Có thể bật theo từng asmdef cho tầng logic thuần, nơi dữ liệu không đến từ Inspector. Lợi ích rõ nhất ở code thuần C#, còn lớp gắn Unity thì giữ chú thích thủ công vì cảnh báo giả làm nhiễu.
- `Senior` **Bạn bắt gặp `catch { }` rỗng trong code cũ của game. Xử lý thế nào?**
  → Nó nuốt lỗi nên crash thật hiện ra ở chỗ khác, rất khó lần; trước hết đổi thành ghi log kèm exception và loại exception cần xử lý. Sau đó hỏi vì sao nó từng cần: nếu là lỗi mạng chập chờn thì đổi thành thử lại có giới hạn, nếu là lỗi lập trình thì sửa nguồn. Không bỏ thẳng, vì có thể có luồng nào đó đang dựa vào việc lỗi được nuốt.
- `Junior` **`List<T>` và `T[]` truyền vào hàm, hàm thêm một phần tử — được không?**
  → Mảng có kích thước cố định nên không `Add` được, muốn thêm phải tạo mảng mới và sao chép; `List<T>` thì `Add` thẳng, tự mở rộng bên trong. Ví dụ danh sách đạn đang bay hay đổi số lượng thì dùng `List`, còn bảng chỉ số kỹ năng cố định thì dùng mảng. Mảng nhẹ hơn một chút vì không có lớp bọc.
- `Junior` **`static` class và `singleton` khác nhau thế nào?**
  → Lớp `static` không có thể hiện, không kế thừa, không cài interface; singleton là một object thật nên cài được interface, thay được khi test. Ví dụ `AudioManager` dạng singleton có thể thay bản giả lúc test, còn `MathUtil` làm lớp static là hợp lý. Cả hai đều là trạng thái toàn cục, vì vậy dễ làm code dính chặt nhau.
- `Junior` **Extension method viết thế nào và có truy cập được `private` không?**
  → Là hàm `static` trong lớp `static`, tham số đầu có `this`, rồi gọi như hàm thành viên: `transform.SetX(1f)`. Nó không truy cập được thành viên `private` vì thực chất chỉ là hàm tĩnh bên ngoài. Hợp để bổ sung tiện ích cho kiểu của Unity không sửa được, vì ta không có mã nguồn để thêm hàm vào đó.
- `Mid` **`partial class` dùng để làm gì trong dự án game?**
  → Chia một lớp ra nhiều file, hai chỗ quen thuộc là code sinh tự động (ví dụ lớp dữ liệu sinh từ bảng cấu hình) và tách lớp `Player` lớn thành các file theo nhóm chức năng. Lợi là file sinh tự động bị ghi đè không động vào phần viết tay. Tuy vậy lạm dụng để chia một lớp phình to chỉ che giấu vấn đề, vì lớp vẫn gánh quá nhiều trách nhiệm.
- `Mid` **Tuple `(int, string)` và `struct` tự viết: chọn gì cho giá trị trả về?**
  → `ValueTuple` là struct nên không cấp phát, tiện cho trả hai ba giá trị cục bộ như `(hit, damage)`. Nhưng tên field dễ nhầm khi truyền xa, và không thêm được hành vi; dữ liệu đi qua nhiều tầng thì nên đặt tên bằng struct. Tuple chỉ nên giữ trong phạm vi hẹp; khi là API công khai thì struct có tên dễ đọc hơn, vì người gọi không phải đoán thứ tự field.
- `Mid` **Default interface method (C# 8) trong Unity: dùng được không, có nên không?**
  → Biên dịch được với C# 9 nhưng hỗ trợ runtime có hạn chế tuỳ nền tảng và backend, nên phải thử trên bản IL2CPP trước khi dựa vào. Ngay cả khi chạy, gọi nó phải qua biến kiểu interface, không gọi trực tiếp trên lớp cài. Tôi chỉ dùng cho mở rộng interface cũ mà không phá code đã có, vì nó gây nhầm ở các lớp dùng chung.
- `Mid` **Local function khác lambda thế nào, và có sinh rác không?**
  → Local function có tên, đệ quy được và nếu không bị chuyển thành delegate thì không cấp phát, vì trình biên dịch chuyển bắt biến thành struct truyền qua tham số. Lambda gán vào `Action` thì luôn là object delegate, và nếu bắt biến thì thêm closure. Với helper nhỏ trong hàm xử lý mỗi frame, local function rẻ hơn lambda.
- `Mid` **Switch expression với pattern thay `if/else` dài: ví dụ và giới hạn?**
  → Ví dụ `state switch { Idle => 0f, Run => 5f, _ => 2f }` ngắn, là một biểu thức nên gán thẳng và trình biên dịch cảnh báo khi thiếu nhánh. Giới hạn: logic nhiều bước hay có tác dụng phụ thì `switch` thường dễ đọc hơn. Dùng nó cho phép ánh xạ giá trị, vì lúc đó cả khối chỉ là một phép tra.
- `Senior` **Bạn thiết kế `GetHashCode` cho struct `GridPos(x, y)` làm key bản đồ lớn. Cân nhắc gì?**
  → Hash tốt phải phân bố đều: `x ^ y` cho hash trùng nhiều (ví dụ (1,2) và (2,1)), nên trộn bằng `HashCode.Combine` hoặc nhân với số nguyên tố; nếu `HashCode.Combine` không có trong phiên bản Unity đang dùng thì tự trộn. Cài `IEquatable<GridPos>` để tránh boxing. Hash tệ làm các khoá dồn vào cùng ô băm nên tra tiến gần O(n), vì vậy đáng đo thử với dữ liệu thật.
- `Senior` **Vì sao hiển thị một lỗi stack trace "đẹp" ở production lại cần `throw;` và `when`, không phải try/catch rộng?**
  → Giữ nguyên stack trace gốc giúp báo lỗi từ người chơi (crash report) chỉ đúng dòng sinh lỗi, còn `throw ex;` hay bọc exception mới làm mất dấu. `when` cho lọc trước khi tháo stack, nên chỉ bắt loại lỗi biết cách xử lý. Cách này cho dữ liệu chẩn đoán tốt hơn, vì crash report là thứ duy nhất ta có khi lỗi xảy ra trên máy người chơi.

**Khung trả lời 60 giây** — "Khi nào anh dùng struct thay vì class trong game?"

> Tôi dùng struct khi dữ liệu nhỏ, thường dưới khoảng 16 byte, bất biến hoặc gần bất biến, và có rất nhiều bản sao sống ngắn — ví dụ một điểm trên lưới, một hit result, một cặp id với số lượng, hay phần tử trong mảng hàng nghìn viên đạn. Lý do là struct không tốn một object heap riêng nên không áp lực lên GC, và khi nằm trong mảng thì dữ liệu sát nhau giúp cache CPU duyệt nhanh. Tôi không dùng struct cho thứ lớn, cần chia sẻ trạng thái, hoặc có tính đa hình, vì sao chép tốn kém và dễ sửa nhầm bản sao. Tôi cũng đề phòng boxing khi struct bị ép sang interface hoặc `object`, và nếu làm key của `Dictionary` thì phải cài `IEquatable<T>` cùng `GetHashCode`. Cuối cùng tôi không đoán mà đo bằng Profiler, xem `GC.Alloc` trước và sau khi đổi.

**Họ sẽ đào tiếp**

- *"Struct có thật sự nằm trên stack không?"* → không: chỉ biến cục bộ thường nằm trên stack; field của class hay phần tử của mảng class thì nằm trên heap cùng chủ của nó.
- *"Boxing chính xác là gì và tốn bao nhiêu?"* → bọc value type vào object trên heap, int thành khoảng 24 byte trên x64, thêm một khoản rác; gây ra khi ép sang `object`/interface hay gọi `Equals(object)`.
- *"Vì sao `list[0].hp -= 10` không biên dịch với `List<struct>`?"* → indexer trả bản sao nên sửa bản sao vô nghĩa; compiler chặn để khỏi mất sửa đổi; mảng thì trả tham chiếu tới phần tử nên được.
- *"Override `Equals` có bắt buộc override `GetHashCode` không và vì sao?"* → có; bảng băm tìm theo hash trước, hai object bằng nhau mà hash khác thì tra không thấy.
- *"`==` với object Unity đã Destroy trả gì?"* → Unity overload `==` để object đã Destroy coi như null dù tham chiếu C# còn khác null; vì thế `?.` và `??` sai trên loại này.
- *"`async/await` có tạo thread không?"* → không tự tạo; nó là máy trạng thái, tiếp tục ở context ban đầu; chỉ `Task.Run` hay I/O mới dùng thread pool.
- *"Lambda không bắt biến thì có cấp phát không?"* → thường không, vì compiler cache delegate tĩnh; có bắt biến thì sinh closure mỗi lần tạo.
- *"`throw;` khác `throw ex;` ở đâu?"* → `throw;` giữ stack trace gốc, `throw ex;` đặt lại stack tại chỗ throw nên mất dấu nơi lỗi thật.
- *"Làm sao chọn giữa `List`, `HashSet`, `Dictionary`?"* → xem thao tác chính: duyệt/theo thứ tự (List), tra tồn tại (HashSet), tra theo khoá (Dictionary); với tập nhỏ vài phần tử mảng thường thắng vì không băm.
- *"Tính năng C# nào của .NET mới mà Unity 6 chưa có?"* → `record struct`, `required`, file-scoped namespace, global using, raw string, list pattern (C# 10 trở lên); Unity 6 dừng ở C# 9.

**Cờ đỏ**

- Nói "struct nằm trên stack, class nằm trên heap" như quy tắc tuyệt đối mà không nhắc ngoại lệ field của class và boxing.
- Nói `async` tức là chạy thread khác — lộ ra chưa hiểu máy trạng thái và context.
- Dùng `?.` hoặc `??` trên `GameObject`/`MonoBehaviour` mà không biết toán tử `==` bị overload.
- Khẳng định "LINQ chậm, cấm hết" mà không phân biệt lúc khởi tạo (chấp nhận được) với `Update` (rác mỗi frame).
- `catch (Exception) { }` rỗng được bào chữa là "để game khỏi crash".
- Gọi `GC.Collect()` để "giải quyết" giật hình, thay vì tìm nguồn cấp phát.
- Dùng `lock` hoặc `volatile` để "chữa" mọi thứ đa luồng mà không giải thích được vì sao cần cái nào.
- Không phân biệt được `override` và `new`, hoặc nhầm `virtual` với `abstract`.
- Nhận `record` là struct (trong C# 9 nó là class) nên nói sai về cấp phát.
- Khoe dùng tính năng mới nhất của .NET mà không nhắc ràng buộc phiên bản C# và IL2CPP của Unity.

**Số / ví dụ nên thuộc**

- Boxing một `int` trên x64: khoảng **24 byte** trên heap và một lần cấp phát.
- `List<T>` tăng dung lượng **0 → 4 → 8 → 16…**, mỗi lần là cấp phát mới và sao chép toàn bộ.
- `Contains` trên `List` là **O(n)**, trên `HashSet` là **O(1)** trung bình; `Dictionary` tra theo khoá **O(1)** trung bình.
- `OrderBy(...).First()` là **O(n log n)**, vòng tìm nhỏ nhất là **O(n)**.
- Unity 6 dùng **C# 9**; không có `record struct`, `required`, file-scoped namespace, global using.
- `try` không ném: **gần như 0 chi phí**; một lần `throw` tốn cỡ **vài microsecond** nên không dùng cho luồng thường.
- `counter++` là **ba** thao tác (đọc, cộng, ghi); `Interlocked.Increment` nguyên tử và thường nhanh hơn `lock` cho một biến đếm.
- `throw;` giữ stack trace, `throw ex;` đặt lại stack.
- `out T` là covariance (chỉ ra), `in T` là contravariance (chỉ vào); `List<T>` không có variance.
- `GC.GetTotalAllocatedBytes(true)` và `GC.CollectionCount(0)` là hai hàm đo cấp phát tại chỗ.
- `internal` theo assembly (asmdef trong Unity), `private protected` = lớp con **và** cùng assembly, `protected internal` = lớp con **hoặc** cùng assembly.
