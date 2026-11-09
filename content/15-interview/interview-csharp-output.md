---
id: interview-csharp-output
title: Đoán output C# — 30 câu đố "in ra gì, vì sao"
icon: 🔮
summary: Ba mươi đoạn C# ngắn kiểu vòng 1 code — closure trong vòng lặp, struct copy, string interning, boxing, thứ tự khởi tạo, deferred execution, finally, async, overflow, làm tròn, delegate, record — mỗi câu có đáp án đã chạy thật trên .NET 10, lý do, và chỗ bẫy này cắn vào game Unity.
status: deep
read: 1131
level: advanced
order: 33
tags: [interview, csharp, output, closure, struct, linq, async]
related: [interview-unity-tech, interview-oop-math, csharp-type-system, csharp-delegate-event, csharp-linq, csharp-exception-null, csharp-async, csharp-collections]
refs:
  - "Jon Skeet — C# in Depth (closure, iterator, async)"
  - "Microsoft Learn — C# language reference"
---

# Đoán output C# — 30 câu đố

Vòng code của nhiều công ty (Ateam gồm cả) hay mở bằng một đoạn C# 5 dòng: **"in ra gì, vì sao?"**.
Đây không phải câu đố mẹo để bắt bí: mỗi câu là một cơ chế ngôn ngữ mà nếu hiểu sai sẽ thành bug
thật trong game. Người phỏng vấn muốn nghe bạn **lần theo từng bước thực thi**, không phải bạn
đoán đúng bằng trực giác.

**Mọi đáp án dưới đây đã chạy thật** (.NET 10, C# 14, `dotnet run`) — xem mục Code ở cuối.
Kiến thức nền: [[csharp-type-system]], [[csharp-delegate-event]], [[csharp-linq]],
[[csharp-exception-null]], [[csharp-async]], [[csharp-collections]].

Cách luyện: **che phần đáp án, tự viết ra output trước**, rồi mới đối chiếu. Sai câu nào thì
đọc "Vì sao", rồi tự sửa một chữ trong code và đoán lại.

> Ghi chú về Unity: Unity 6 dùng C# 9 (một số tính năng C# 10+ chưa có) và Mono/IL2CPP. Output các
> câu ở đây là hành vi của ngôn ngữ nên giống nhau; chỉ câu 25 (thứ tự Dictionary) là chi tiết
> triển khai, và câu 1–2 đúng từ C# 5 trở đi.

---

## Nhóm A — Closure, struct, string

### Câu 1 — Closure bắt biến trong `for`

```csharp
var acts = new List<Action>();
for (int i = 0; i < 3; i++) acts.Add(() => Console.Write(i + " "));
foreach (var a in acts) a();
```

**Đáp án:** `3 3 3`
**Vì sao:** vòng `for` chỉ có **một** biến `i` dùng chung cho cả ba lần lặp, và lambda bắt *biến* chứ không bắt *giá trị*. Lúc gọi, vòng lặp đã chạy xong nên `i` = 3. Sửa: `int copy = i;` trong thân vòng rồi bắt `copy`.
**Trong game:** đăng ký `button.onClick.AddListener(() => Select(i))` trong vòng `for` tạo danh sách nút — mọi nút đều chọn phần tử cuối.

### Câu 2 — Closure bắt biến trong `foreach`

```csharp
var acts = new List<Action>();
foreach (var i in new[] { 0, 1, 2 }) acts.Add(() => Console.Write(i + " "));
foreach (var a in acts) a();
```

**Đáp án:** `0 1 2`
**Vì sao:** từ C# 5, biến lặp của `foreach` được tạo **mới cho mỗi lần lặp** nên mỗi lambda bắt một biến riêng. Trước C# 5 kết quả là `2 2 2`. `for` thì vẫn dùng chung biến — đó là điểm khác nhau hay bị hỏi.
**Trong game:** cùng kiểu code `foreach (var item in items) btn.onClick.AddListener(() => Buy(item))` chạy đúng, còn bản `for` thì sai — hai đoạn nhìn gần giống mà khác nghĩa.

### Câu 3 — Struct copy khi gán, trong `List`, trong mảng

```csharp
struct P { public int X; }
var a = new P { X = 1 }; var b = a; b.X = 5;
Console.Write(a.X + " ");
var list = new List<P> { new P { X = 1 } };
var p = list[0]; p.X = 5;
Console.Write(list[0].X + " ");
var arr = new[] { new P { X = 1 } };
arr[0].X = 5;
Console.Write(arr[0].X);
```

**Đáp án:** `1 1 5`
**Vì sao:** gán struct là **sao chép giá trị**, nên sửa `b` hoặc `p` không đụng bản gốc. Indexer của `List<T>` trả về một bản copy, vì thế dòng `list[0].X = 5;` bị **lỗi biên dịch CS1612** (đã kiểm — nên không nằm trong Program.cs). Mảng thì khác: `arr[0]` là chính ô nhớ, sửa tại chỗ được.
**Trong game:** `List<Particle>` rồi `particles[i].life -= dt` không biên dịch được; người ta lách bằng `var p = list[i]; p.life -= dt;` quên ghi lại `list[i] = p` — bug im lặng vì code vẫn chạy.

### Câu 4 — Struct qua property và gọi method làm đổi trạng thái

```csharp
struct Counter { public int N; public void Inc() => N++; }
class Holder {
    public Counter C { get; } = new Counter();
    public Counter Field = new Counter();
}
var h = new Holder();
h.C.Inc(); h.Field.Inc();
Console.Write(h.C.N + " " + h.Field.N);
```

**Đáp án:** `0 1`
**Vì sao:** `h.C` là property nên mỗi lần đọc nhận một **bản copy**; `Inc()` tăng bản copy rồi bỏ đi (không lỗi biên dịch vì đây là gọi method, khác với gán field). `h.Field` là field nên `Inc()` chạy trên chính nó.
**Trong game:** struct "bộ đếm hồi chiêu" nằm sau property `public Cooldown Skill { get; }` — gọi `Skill.Tick(dt)` mỗi frame mà cooldown không bao giờ giảm.

### Câu 5 — String bất biến

```csharp
string s = "abc";
s.ToUpper();
string t = s;
s += "d";
Console.Write(s + " " + t);
```

**Đáp án:** `abcd abc`
**Vì sao:** mọi method của `string` trả về string **mới**; `s.ToUpper();` không gán kết quả nên bị bỏ đi. `s += "d"` tạo string mới gán cho `s`, còn `t` vẫn trỏ string cũ.
**Trong game:** nối chuỗi trong `Update()` (`label.text += ...`, `"Score: " + score`) cấp phát rác mỗi frame; dùng `StringBuilder` hoặc cache chuỗi và chỉ cập nhật khi giá trị đổi.

### Câu 6 — Interning, `ReferenceEquals` và `==`

```csharp
string a = "hel" + "lo";
string b = "hello";
string c = new string(new[] { 'h', 'e', 'l', 'l', 'o' });
object o1 = b, o2 = c;
Console.Write(ReferenceEquals(a, b) + " " + ReferenceEquals(b, c) + " " + (b == c) + " "
    + (o1 == o2) + " " + o1.Equals(o2) + " " + ReferenceEquals(b, string.Intern(c)));
```

**Đáp án:** `True False True False True True`
**Vì sao:** `"hel" + "lo"` là hằng số, compiler gộp thành `"hello"` và literal được **intern** nên cùng tham chiếu với `b`. `c` tạo lúc chạy nên là object khác. `b == c` gọi toán tử `==` của `string` (so nội dung); nhưng `o1 == o2` có kiểu tĩnh `object` nên chỉ so **tham chiếu** → `False`, còn `Equals` là virtual nên so nội dung.
**Trong game:** so sánh `tag`/tên bằng `(object)x == (object)y` hay qua generic không ràng buộc cho kết quả sai; so tên node bằng `==` trên `string` thì đúng nhưng chậm hơn so hash — nên so `int` id hoặc `Animator.StringToHash`.

### Câu 7 — Boxing: `==` và `Equals`

```csharp
int i = 5; long l = 5;
object a = i, b = i;
Console.Write((a == b) + " " + a.Equals(b) + " " + (i == l) + " " + i.Equals(l) + " " + a.Equals(l));
```

**Đáp án:** `False True True False False`
**Vì sao:** `object a = i` và `object b = i` **boxing hai lần** thành hai object riêng, `==` trên `object` so tham chiếu → `False`. `Equals` của `Int32` so giá trị → `True`. `i == l` thăng `i` lên `long` rồi so số → `True`; nhưng `i.Equals(l)` chọn overload `Equals(object)` (vì `long` không tự hạ xuống `int`), box `l` thành `Int64`, mà `Int32.Equals` yêu cầu cùng kiểu → `False`.
**Trong game:** `Dictionary<object, X>` hoặc event bus kiểu `object` với khoá `int` và `long` lẫn lộn không bao giờ khớp; boxing còn là nguồn cấp phát rác ẩn khi truyền struct vào tham số `object`.

---

## Nhóm B — Khởi tạo, kế thừa, virtual

### Câu 8 — Static constructor và thứ tự khởi tạo

```csharp
static int Log(string s) { Console.Write(s + "; "); return 0; }
class Base { public Base() => Log("Base ctor"); }
class Derived : Base {
    static int s = Log("static field");
    int f = Log("field");
    static Derived() => Log("static ctor");
    public Derived() => Log("ctor");
}
new Derived(); new Derived();
```

**Đáp án:** `static field; static ctor; field; Base ctor; ctor; field; Base ctor; ctor;`
**Vì sao:** phần static chạy **một lần**, trước lần dùng đầu tiên: initializer static theo thứ tự viết, rồi static constructor. Mỗi lần `new`: initializer của field instance trong lớp con chạy **trước**, rồi mới gọi constructor lớp cha, rồi tới thân constructor lớp con (ngược với C++ và ngược với thứ tự "cha trước" mà nhiều người đoán).
**Trong game:** singleton/service khởi tạo trong static field phụ thuộc thứ tự — hai lớp static tham chiếu nhau cho giá trị `null`/0 tuỳ ai chạy trước; Unity còn không đảm bảo thứ tự `Awake` giữa các MonoBehaviour.

### Câu 9 — Gọi `virtual` trong constructor

```csharp
class Base { public Base() { Init(); } protected virtual void Init() { } }
class Derived : Base {
    string name;
    public Derived() { name = "set"; }
    protected override void Init() => Console.Write(name == null ? "null" : name);
}
class Derived2 : Base {
    string name = "init";
    protected override void Init() => Console.Write(name == null ? "null" : name);
}
new Derived(); Console.Write(" "); new Derived2();
```

**Đáp án:** `null init`
**Vì sao:** constructor lớp cha gọi `Init()` virtual thì **bản override của lớp con chạy**, dù constructor lớp con chưa chạy. Gán trong thân constructor (`name = "set"`) chưa xảy ra nên `name` còn `null`; còn initializer ngay tại khai báo (`= "init"`) chạy trước constructor cha nên đã có giá trị (xem câu 8).
**Trong game:** lớp `BaseEnemy` gọi `virtual Setup()` trong constructor thường (không phải `Awake`) rồi lớp con dùng field chưa gán → `NullReferenceException` khó hiểu. Tránh gọi virtual trong constructor.

### Câu 10 — `new` ẩn và `override`

```csharp
class A { public virtual string V() => "A.V"; public string N() => "A.N"; }
class B : A { public override string V() => "B.V"; public new string N() => "B.N"; }
A x = new B();
Console.Write(x.V() + " " + x.N() + " " + ((B)x).N());
```

**Đáp án:** `B.V A.N B.N`
**Vì sao:** `virtual/override` chọn method theo **kiểu thực của object** (lúc chạy). `new` chỉ *ẩn* tên, việc chọn method dựa vào **kiểu của biến** (lúc biên dịch): biến kiểu `A` thì gọi `A.N`, ép sang `B` mới gọi `B.N`.
**Trong game:** định nghĩa lại `Start()`/`Update()` bằng `new` trong lớp con MonoBehaviour trong khi cha gọi qua tham chiếu cha → hành vi tuỳ biến tham chiếu; và `new` còn làm Unity không thấy method (Unity gọi message theo tên qua reflection).

---

## Nhóm C — LINQ, iterator, ngoại lệ

### Câu 11 — Deferred execution của `Select`

```csharp
int calls = 0;
var q = new[] { 1, 2, 3 }.Select(n => { calls++; return n * 2; });
Console.Write(calls + " ");
q.ToList(); q.ToList();
Console.Write(calls);
```

**Đáp án:** `0 6`
**Vì sao:** `Select` chỉ *dựng* một truy vấn lười; lambda chưa chạy dòng nào lúc khai báo (`calls` = 0). Mỗi lần duyệt (`ToList`) chạy lại toàn bộ chuỗi, nên 2 lần × 3 phần tử = 6 lần.
**Trong game:** `var enemies = list.Where(e => e.IsAlive);` giữ làm field rồi duyệt nhiều lần mỗi frame — chạy lại bộ lọc mỗi lần, và nếu lambda đọc trạng thái đã đổi thì kết quả cũng đổi. Cần snapshot thì `.ToList()` một lần.

### Câu 12 — `yield return` chạy lười

```csharp
static IEnumerable<int> Gen() {
    Console.Write("A "); yield return 1;
    Console.Write("B "); yield return 2;
    Console.Write("C ");
}
var g = Gen();
Console.Write("created ");
foreach (var x in g) Console.Write($"got{x} ");
```

**Đáp án:** `created A got1 B got2 C`
**Vì sao:** gọi `Gen()` chỉ tạo ra một state machine, **chưa chạy dòng nào** của thân hàm (nên "created" in trước). Mỗi `MoveNext()` của `foreach` chạy tới `yield return` kế tiếp rồi dừng; code giữa hai lần `yield` chạy đúng lúc consumer xin phần tử tiếp theo.
**Trong game:** coroutine Unity chính là iterator — `StartCoroutine(Fade())` mới chạy tới `yield` đầu tiên; còn validate tham số bên trong hàm iterator thì ngoại lệ chỉ ném khi bắt đầu duyệt, không phải lúc gọi.

### Câu 13 — `finally` chạy dù đã `return`

```csharp
static int F() {
    int x = 1;
    try { return x; }
    finally { x = 2; Console.Write("fin "); }
}
Console.Write(F());
```

**Đáp án:** `fin 1`
**Vì sao:** `return x` đã **đọc và lưu giá trị 1** vào chỗ chờ trả về, rồi mới chạy `finally`; `finally` đổi biến `x` thành 2 nhưng giá trị đã lưu không đổi. Còn "fin " in trước số 1 vì `F()` phải chạy xong thì `Console.Write` mới có giá trị để in.
**Trong game:** `finally` dùng để nhả lock/pool object/`isLoading = false` dù lỗi hay return sớm; nhưng đừng mong `finally` đổi được giá trị trả về kiểu giá trị — với kiểu tham chiếu thì sửa object bên trong lại có hiệu lực.

### Câu 14 — Ngoại lệ trong `finally`

```csharp
try {
    try { throw new Exception("A"); }
    finally { throw new Exception("B"); }
}
catch (Exception e) { Console.Write(e.Message); }
```

**Đáp án:** `B`
**Vì sao:** ngoại lệ ném trong `finally` **thay thế** ngoại lệ đang bay; "A" biến mất không để lại dấu vết. Đó là lý do code trong `finally` phải cực kỳ ít khả năng lỗi.
**Trong game:** `finally { file.Close(); }` ném lỗi lúc đang xử lý lỗi ghi save → log chỉ thấy lỗi `Close`, mất nguyên nhân gốc; khi chẩn đoán crash, nhớ rằng ngoại lệ bạn thấy có thể không phải ngoại lệ đầu tiên.

### Câu 15 — `throw;` và `throw ex;`

```csharp
[MethodImpl(MethodImplOptions.NoInlining)]
static void Thrower() => throw new Exception("x");
static void Rethrow1() { try { Thrower(); } catch { throw; } }
static void Rethrow2() { try { Thrower(); } catch (Exception e) { throw e; } }

try { Rethrow1(); } catch (Exception e) { Console.Write(e.StackTrace.Contains("Thrower") + " "); }
try { Rethrow2(); } catch (Exception e) { Console.Write(e.StackTrace.Contains("Thrower")); }
```

**Đáp án:** `True False`
**Vì sao:** `throw;` ném lại *nguyên* ngoại lệ, giữ stack trace gốc (có `Thrower`). `throw e;` coi như ném **mới** tại dòng đó nên stack trace bị cắt, mất frame nơi lỗi thật sự xảy ra. (Trình phân tích còn cảnh báo CA2200.) Muốn bọc thêm ngữ cảnh: `throw new MyException("...", e);`.
**Trong game:** log crash Firebase/Sentry chỉ chỉ tới hàm catch-ném-lại thay vì dòng gây lỗi thật — mất hàng giờ truy lỗi trên bản build.

---

## Nhóm D — Async

### Câu 16 — Ngoại lệ của `async Task` chỉ lộ khi `await`

```csharp
static async Task Fail() { await Task.Delay(1); throw new InvalidOperationException("boom"); }

try { var t = Fail(); Console.Write("after call "); await t; }
catch (Exception e) { Console.Write("caught " + e.Message); }
```

**Đáp án:** `after call caught boom`
**Vì sao:** ngoại lệ trong `async Task` không bay ra khỏi lời gọi mà được **nhét vào `Task`**; chỉ khi `await t` (hoặc `.Wait()`/`.Result`) nó mới được ném lại. Gọi mà quên `await` thì lỗi bị nuốt im lặng. `async void` thì ngược lại nguy hiểm hơn: không có Task để chờ, ngoại lệ bị đẩy lên `SynchronizationContext` (hoặc thread pool, làm sập process) — vì vậy không đưa vào chương trình mẫu.
**Trong game:** hàm `async void OnClickBuy()` là ngoại lệ hợp lệ duy nhất cho event handler; chỗ khác dùng `async UniTask`/`async Task` và luôn `await` hoặc `.Forget()` có log lỗi.

### Câu 17 — Task chạy ngay khi gọi (hot task)

```csharp
static async Task Work() {
    Console.Write("A ");
    await Task.Delay(10);
    Console.Write("C ");
}
var t = Work();
Console.Write("B ");
await t;
```

**Đáp án:** `A B C`
**Vì sao:** `async` method chạy **đồng bộ** từ đầu cho tới `await` đầu tiên chưa hoàn thành — "A" in ngay trong lời gọi `Work()`. Task trả về là task "đã bắt đầu" (hot), không phải công thức chờ chạy như `IEnumerable`. Phần sau `await` được lên lịch tiếp tục sau 10ms.
**Trong game:** gọi `LoadSceneAsync()` không `await` vẫn bắt đầu tải ngay; ngược lại giả định "chưa await thì chưa chạy" làm bạn nghĩ có thời gian cấu hình sau đó, trong khi phần đồng bộ đã chạy xong.

---

## Nhóm E — Số học

### Câu 18 — Tràn số nguyên: `unchecked` và `checked`

```csharp
int x = int.MaxValue;
x++;
Console.Write(x + " ");
try { checked { x = int.MaxValue; x++; } } catch (OverflowException) { Console.Write("overflow "); }
int big = 300; Console.Write((byte)big);
```

**Đáp án:** `-2147483648 overflow 44`
**Vì sao:** mặc định C# **không kiểm tràn**: `int.MaxValue + 1` quay vòng thành `int.MinValue`. Trong khối `checked` thì ném `OverflowException`. Ép `300` sang `byte` cắt còn 8 bit thấp: 300 − 256 = 44. (Ghi chú: biểu thức hằng như `int.MaxValue + 1` bị compiler từ chối bằng lỗi CS0220 nên ví dụ dùng biến.)
**Trong game:** tiền/EXP lưu `int` cộng dồn vượt 2,1 tỉ thành số âm; đây là lỗi kinh điển của game idle — dùng `long` hoặc `BigInteger`/số mũ tự cài.

### Câu 19 — Chia nguyên, chia dư, làm tròn

```csharp
Console.Write(-7 / 2 + " " + -7 % 2 + " " + Math.Floor(-7 / 2.0) + " "
    + Math.Round(2.5) + " " + Math.Round(3.5) + " " + Math.Round(2.5, MidpointRounding.AwayFromZero));
```

**Đáp án:** `-3 -1 -4 2 4 3`
**Vì sao:** chia số nguyên **cắt về 0** (−3,5 → −3) và phần dư mang dấu số bị chia (−7 % 2 = −1), khác `Math.Floor` (−4). `Math.Round` mặc định là *banker's rounding* — làm tròn về số chẵn gần nhất nên 2,5 → 2 và 3,5 → 4; muốn kiểu "5 thì lên" phải truyền `MidpointRounding.AwayFromZero`.
**Trong game:** chia lưới/index âm (`x / cellSize` với x = −1 cho ô 0 chứ không phải −1) làm nhân vật ở rìa bản đồ sai ô; làm tròn giá/tiền thưởng bằng `Math.Round` mặc định cho ra số lệch với bảng thiết kế.

### Câu 20 — `float`, `double`, `decimal`

```csharp
double a = 0.1, b = 0.2; float fa = 0.1f, fb = 0.2f; decimal da = 0.1m, db = 0.2m;
Console.Write((a + b == 0.3) + " " + (a + b) + " " + (fa + fb == 0.3f) + " "
    + (da + db == 0.3m) + " " + (1.0m + 1.00m));
```

**Đáp án:** `False 0.30000000000000004 True True 2.00`
**Vì sao:** 0,1 và 0,2 không biểu diễn chính xác bằng nhị phân, tổng `double` lệch 0,3 một chút nên `==` sai. Kết quả `float` ở đây tình cờ khớp (do làm tròn về 24 bit) — **không được dựa vào** việc đó. `decimal` lưu cơ số 10 nên chính xác với số thập phân, và nhớ cả số chữ số sau dấu phẩy (`2.00`).
**Trong game:** so `transform.position == target` hay `hp == 0f` với float thì dùng `Mathf.Approximately` hoặc ngưỡng epsilon; tiền thật thì `decimal` hoặc số nguyên đơn vị nhỏ nhất (xu) — Unity thường bỏ `decimal` vì chậm trên mobile nên dùng `long`.

---

## Nhóm F — Null, pattern, ref, params

### Câu 21 — `??`, `?.`, nullable lan truyền

```csharp
string s = null; int? n = null; string t = null;
Console.Write((s?.Length ?? -1) + " " + ((n + 1) == null) + " " + (n > 0) + " " + (n <= 0) + " ");
t ??= "def"; Console.Write(t);
```

**Đáp án:** `-1 True False False def`
**Vì sao:** `s?.Length` là `null` (kiểu `int?`), `?? -1` thay bằng −1. Phép toán số học trên `int?` null cho ra null (nên `n + 1 == null`); còn **mọi phép so sánh thứ tự** (`>`, `<=`) với null đều `False` — cả `n > 0` lẫn `n <= 0` đều sai. `??=` chỉ gán khi vế trái là null.
**Trong game:** `?.` và `??` **không an toàn với `UnityEngine.Object`**: object đã `Destroy` bị Unity coi là "null giả" (`== null` là true) nhưng `?.` kiểm null tham chiếu thật nên vẫn đi tiếp và văng `MissingReferenceException`. Với component dùng `if (obj)` hoặc `obj == null`.

### Câu 22 — Pattern matching với `switch`

```csharp
static string Kind(object o) => o switch {
    null => "null",
    int n when n < 0 => "neg",
    int => "int",
    string { Length: 0 } => "empty",
    string => "str",
    _ => "other"
};
foreach (var o in new object[] { null, -5, 7, "", "a", 3.5 }) Console.Write(Kind(o) + " ");
```

**Đáp án:** `null neg int empty str other`
**Vì sao:** switch expression thử các nhánh **từ trên xuống**, nhánh nào khớp đầu tiên thắng; vì vậy nhánh có điều kiện (`when n < 0`, `{ Length: 0 }`) phải đặt **trước** nhánh tổng quát cùng kiểu, nếu không compiler báo lỗi nhánh không tới được. `3.5` là `double` nên rơi vào `_`.
**Trong game:** xử lý lệnh/sự kiện kiểu `switch (cmd) { MoveCmd { Speed: > 10 } => ..., MoveCmd => ... }` gọn hơn chuỗi `is`/`as`; thứ tự nhánh sai là nguồn bug logic im lặng.

### Câu 23 — `ref` local và gán lại tham chiếu

```csharp
int[] a = { 1, 2, 3 };
ref int r = ref a[1];
r = 20;
r = ref a[2];
r = 30;
Console.Write(string.Join(",", a));
```

**Đáp án:** `1,20,30`
**Vì sao:** `ref int r = ref a[1]` làm `r` là **bí danh** của ô `a[1]`, nên `r = 20` ghi thẳng vào mảng. `r = ref a[2]` (có chữ `ref` ở vế phải) *đổi ô mà `r` trỏ tới* chứ không sao chép giá trị; sau đó `r = 30` ghi vào `a[2]`. `a[1]` giữ nguyên 20.
**Trong game:** `ref` local/`ref return` cho phép sửa struct trong mảng/`Span<T>` không copy — hữu ích trong hot loop (ECS-lite, particle) nơi câu 3 và 4 làm bạn mất dữ liệu.

### Câu 24 — `params` rỗng và `null`

```csharp
static string P(params object[] xs) => xs == null ? "null" : xs.Length.ToString();
Console.Write(P() + " " + P(null) + " " + P((object)null) + " " + P(1, 2) + " "
    + P(new int[] { 1, 2 }) + " " + P(new[] { "a", "b" }));
```

**Đáp án:** `0 null 1 2 1 2`
**Vì sao:** `P()` tạo mảng rỗng (độ dài 0, không phải null). `P(null)` khớp dạng **thường**: `null` được coi là chính mảng → `xs == null`. `P((object)null)` ép để dùng dạng mở rộng: mảng 1 phần tử chứa null. `int[]` không phải `object[]` nên cả mảng bị bọc thành **1 phần tử**; `string[]` thì có hiệp biến sang `object[]` nên được dùng thẳng, độ dài 2.
**Trong game:** hàm log kiểu `Log(string fmt, params object[] args)`: truyền nhầm một `int[]` hay `null` làm tham số sai kiểu; và mỗi lời gọi `params` đều cấp phát mảng — tránh trong `Update`.

---

## Nhóm G — Collection, delegate, event

### Câu 25 — Thứ tự duyệt `Dictionary` (câu bẫy)

```csharp
var d = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2, ["c"] = 3 };
d.Remove("b");
d["d"] = 4;
Console.Write(string.Join(" ", d.Keys));
```

**Đáp án:** `a d c` (trên .NET 10; **không được đảm bảo**)
**Vì sao:** tài liệu nói rõ thứ tự duyệt `Dictionary` là *không xác định*. Cài đặt hiện tại lưu theo mảng entry nên trông như thứ tự chèn, nhưng `Remove` để lại một "ô trống" trong danh sách, và phần tử mới `d` **lấp vào ô trống đó** (giữa `a` và `c`) thay vì nối cuối. Dựa vào thứ tự này là bug chờ nổ khi đổi runtime hay phiên bản.
**Trong game:** serialize save/replay hay sinh UI từ `Dictionary` rồi dựa vào thứ tự → mỗi máy một kiểu, desync lockstep. Cần thứ tự ổn định thì dùng `List` + dictionary tra cứu, hoặc `SortedDictionary`.

### Câu 26 — Sửa collection trong `foreach`

```csharp
var list = new List<int> { 1, 2, 3 };
try {
    foreach (var x in list) { if (x == 2) list.Remove(x); Console.Write(x + " "); }
}
catch (InvalidOperationException) { Console.Write("InvalidOperationException "); }
Console.Write(list.Count);
```

**Đáp án:** `1 2 InvalidOperationException 2`
**Vì sao:** enumerator của `List<T>` ghi nhớ một số `version`; `Remove` tăng version nên lần `MoveNext()` kế tiếp phát hiện và ném `InvalidOperationException` ("Collection was modified"). Lưu ý phần tử đang xử lý vẫn in ra (2) vì ngoại lệ chỉ ném ở lần lặp sau; và việc xoá **đã xảy ra** (Count = 2).
**Trong game:** xoá đạn/kẻ thù chết ngay trong vòng `foreach` là lỗi số một; cách chuẩn là duyệt `for` ngược (`for (int i = list.Count - 1; i >= 0; i--)`), dùng `RemoveAll(pred)`, hoặc gom vào danh sách chờ xoá rồi xoá sau vòng lặp.

### Câu 27 — Delegate multicast trả về giá trị cuối

```csharp
Func<int> f = () => 1; f += () => 2; f += () => 3;
Action a = () => Console.Write("x "); a += () => Console.Write("y ");
Console.Write(f() + " "); a();
```

**Đáp án:** `3 x y`
**Vì sao:** `+=` nối thêm vào danh sách gọi (invocation list). Gọi delegate chạy lần lượt **theo thứ tự đăng ký**, mọi handler đều chạy nhưng giá trị trả về chỉ lấy của **handler cuối cùng**; kết quả của hai handler đầu bị vứt bỏ. Muốn thu hết kết quả phải dùng `GetInvocationList()`.
**Trong game:** event kiểu `Func<bool> CanAttack` nhiều bên đăng ký chỉ phản ánh bên đăng ký sau cùng — veto của các bên khác bị bỏ qua. Dùng `Action` cho sự kiện, và với "hỏi ý kiến" thì duyệt `GetInvocationList()` và AND/OR lại.

### Câu 28 — `event -=` với lambda khác

```csharp
class Btn { public event Action Click; public void Fire() => Click?.Invoke(); }
static int hits;
static void Hit() => hits++;

var b1 = new Btn(); hits = 0;
b1.Click += () => hits++;
b1.Click -= () => hits++;
b1.Fire();
Console.Write(hits + " ");
var b2 = new Btn(); hits = 0;
b2.Click += Hit;
b2.Click -= Hit;
b2.Fire();
Console.Write(hits);
```

**Đáp án:** `1 0`
**Vì sao:** hai lambda viết giống hệt nhau vẫn là **hai delegate khác nhau** (khác chỗ khai báo, nên khác instance), nên `-=` với lambda thứ hai không tìm thấy gì để gỡ. Method group `Hit` thì delegate so sánh bằng target + method nên `-=` gỡ được.
**Trong game:** `OnEnable` đăng ký `+= () => ...` rồi `OnDisable` gỡ `-= () => ...` — không gỡ được, handler vẫn sống, object bị giữ qua tham chiếu và bị gọi cả khi đã `Destroy` → rò rỉ bộ nhớ và `MissingReferenceException`. Luôn lưu delegate vào field hoặc dùng method.

---

## Nhóm H — Struct và record

### Câu 29 — `Equals`/`GetHashCode` mặc định của struct

```csharp
struct P { public int X, Y; }
class C { public int X; }
var a = new P { X = 1, Y = 2 }; var b = new P { X = 1, Y = 2 };
var s = new HashSet<P> { a };
Console.Write(a.Equals(b) + " " + (a.GetHashCode() == b.GetHashCode()) + " "
    + s.Contains(b) + " " + new C().Equals(new C()));
```

**Đáp án:** `True True True False`
**Vì sao:** struct kế thừa `ValueType.Equals/GetHashCode` so sánh **theo giá trị các field**, nên hai struct cùng nội dung bằng nhau, cùng hash, và tìm thấy trong `HashSet`. Class thì mặc định so **tham chiếu** → `False`. (Dòng `a == b` không biên dịch được với struct tự định nghĩa: lỗi CS0019, phải tự viết `operator ==`.)
**Trong game:** dùng struct làm khoá `Dictionary` (vd `Vector2Int` ô lưới) chạy đúng nhưng mặc định chậm và có thể boxing do dùng reflection — tự cài `IEquatable<T>` và `GetHashCode` (`HashCode.Combine(X, Y)`) cho struct dùng làm khoá nóng.

### Câu 30 — Bằng nhau của `record`

```csharp
record R(int X, List<int> L);
record R2(int X, string Y);
var l = new List<int> { 1 };
var a = new R(1, l); var b = new R(1, l); var c = new R(1, new List<int> { 1 });
Console.Write((a == b) + " " + (a == c) + " " + ReferenceEquals(a, b) + " "
    + (new R2(1, "a") with { X = 2 }).X + " " + new R2(1, "a"));
```

**Đáp án:** `True False False 2 R2 { X = 1, Y = a }`
**Vì sao:** `record` tự sinh `Equals`/`==` so **từng field** (value equality) dù vẫn là class, nên `a == b` đúng mà `ReferenceEquals` sai. Nhưng field `List<int>` được so bằng `Equals` của nó (so tham chiếu), nên hai list *nội dung giống* vẫn khác nhau → `a == c` là `False`. `with` tạo bản copy nông có sửa field; `ToString()` được sinh sẵn.
**Trong game:** `record` tiện cho config/DTO bất biến (cần C# 9, Unity 2021.2+; trong Unity phải tự khai báo lớp `System.Runtime.CompilerServices.IsExternalInit` mới dùng được record/`init`); đừng kỳ vọng record chứa list/mảng so sánh theo nội dung.

---

*Không đưa vào chương trình:* **readonly struct và defensive copy** (struct `readonly` tránh copy phòng thủ khi gọi qua `in`/`readonly` field) — khác biệt này chỉ nằm ở hiệu năng, **không quan sát được qua output**, nên không phải câu đố đoán output. Gặp nó ở câu hỏi lý thuyết, xem [[csharp-type-system]].

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc luyện đoán output C#**

AI rất hợp để *sinh thêm biến thể* và *giải thích từng bước thực thi*, nhưng **không được tin AI về output** — nó đoán bằng trí nhớ, không chạy code. Quy trình ba bước: (1) bạn tự đoán và viết output ra giấy; (2) nhờ AI giải thích cơ chế *không cho nó biết đáp án*; (3) **chạy thật bằng `dotnet run`** và đối chiếu. Kết quả thật là trọng tài duy nhất.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Sinh biến thể | Đã hiểu câu gốc, muốn thử kiểu khác | "Cho tôi 5 biến thể của câu 1, đổi đúng một chữ, chưa nói đáp án" |
| Giảng từng bước | Sai đáp án, không hiểu vì sao | "Lần theo từng dòng thực thi, ghi giá trị mỗi biến sau mỗi dòng" |
| Chấm bài nói | Luyện nói 60 giây | "Anh là người phỏng vấn, nghe tôi giải thích và chỉ ra chỗ mơ hồ" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- Phiên bản C# và runtime (Unity 6 = C# 9 trên Mono/IL2CPP; .NET 10 = C# 14): hành vi `foreach` closure, record, `with` khác nhau theo phiên bản.
- Có bật `checked`, `Nullable`, `ImplicitUsings` hay không — đổi câu 18 và 21.
- Debug hay Release (ảnh hưởng inlining và stack trace ở câu 15) và có tối ưu hoá hay không.
- Culture của máy (`vi-VN` in dấu phẩy thập phân, đổi output câu 19–20).
- Bạn muốn AI chỉ **giải thích** hay phải **chạy code** (bắt buộc ghi rõ "chạy bằng dotnet, dán output thật").

**Mẫu prompt**

```
Tôi đang ôn phỏng vấn C#. Đây là đoạn code (C# 12, .NET 8, console, Debug):
<dán code 3-10 dòng>

Bước 1: KHÔNG đoán. Tạo project dotnet tạm, chạy dotnet run, dán output THẬT.
Bước 2: lần theo từng dòng thực thi, ghi giá trị mỗi biến sau mỗi dòng.
Bước 3: nêu cơ chế ngôn ngữ chính (vd: closure bắt biến, boxing, deferred execution)
        bằng một câu, và một chỗ trong game Unity mà lỗi này gây bug.
Bước 4: sinh 3 biến thể đổi đúng một chữ, mỗi biến thể cho output khác; chạy lại để kiểm.
CẤM: tự khẳng định output khi chưa chạy; CẤM dùng phiên bản C# khác với tôi nêu.
Ghi rõ đoạn nào là chi tiết triển khai (không có trong spec) thay vì hành vi đảm bảo.
```

**Bẫy thường gặp:** AI **đoán output sai nhưng giải thích trôi chảy và tự tin** — đặc biệt ở các câu có quy tắc tinh tế như `Math.Round` banker, `-7 % 2`, `params` với `null`, thứ tự khởi tạo (câu 8), hay `a == b` trên `object` đã boxing. Nó cũng hay trộn hành vi của các phiên bản (nói `foreach` closure vẫn là `2 2 2`), hoặc coi thứ tự `Dictionary` như bảo đảm. Luôn chạy thật; câu AI "chắc chắn" mà khác output thật là dấu hiệu bạn đang học một lời giải bịa.

## 💻 Code

Một chương trình console duy nhất chạy cả 30 câu: mỗi câu in nhãn `Câu N:` rồi output. Dùng để kiểm đáp án và để bạn sửa một chữ rồi chạy lại xem output đổi ra sao.

**Setup**
- Cài .NET SDK 8 trở lên (đã chạy thật trên .NET 10): `dotnet new console -n csout`, thay `Program.cs` bằng file dưới, trong `csproj` đặt `<Nullable>disable</Nullable>` (để các `null` trần không bị cảnh báo), rồi `dotnet run`.
- Cần C# 9+: switch expression, `string { Length: 0 }`, `record`, `ref` local, `??=`, `with`. Chép vào Unity 6 (C# 9) thì dùng được hầu hết; `record` cần tự khai báo lớp `IsExternalInit`, và `async Task Main` thay bằng `async void`/UniTask tuỳ chỗ gọi.
- `CultureInfo.InvariantCulture` được đặt đầu `Main` để output giống nhau trên máy `vi-VN`.
- Không có trong chương trình: câu 3 phần `list[0].X = 5;` (lỗi biên dịch CS1612, đã kiểm riêng) và dòng `a == b` với struct ở câu 29 (CS0019).

**Script**

```csharp
using System.Globalization;
using System.Runtime.CompilerServices;

// 30 câu đố đoán output. Cần .NET 8+ / C# 12 trở lên (record, switch expression, pattern `and`,
// `ref` local, `??=`). Mỗi câu in nhãn "Câu N:" rồi output trên dòng kế.
class Program
{
    static void Head(int n) => Console.WriteLine($"Câu {n}:");

    static async Task Main()
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
        CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;
        Q1(); Q2(); Q3(); Q4(); Q5(); Q6(); Q7(); Q8(); Q9(); Q10();
        Q11(); Q12(); Q13(); Q14(); Q15();
        await Q16(); await Q17();
        Q18(); Q19(); Q20(); Q21(); Q22(); Q23(); Q24(); Q25(); Q26(); Q27(); Q28(); Q29(); Q30();
    }

    // ---------- Câu 1: closure + for ----------
    static void Q1()
    {
        Head(1);
        var acts = new List<Action>();
        for (int i = 0; i < 3; i++) acts.Add(() => Console.Write(i + " "));
        foreach (var a in acts) a();
        Console.WriteLine();
    }

    // ---------- Câu 2: closure + foreach ----------
    static void Q2()
    {
        Head(2);
        var acts = new List<Action>();
        foreach (var i in new[] { 0, 1, 2 }) acts.Add(() => Console.Write(i + " "));
        foreach (var a in acts) a();
        Console.WriteLine();
    }

    // ---------- Câu 3: struct copy ----------
    struct P3 { public int X; }
    static void Q3()
    {
        Head(3);
        var a = new P3 { X = 1 };
        var b = a; b.X = 5;
        Console.Write(a.X + " ");
        var list = new List<P3> { new P3 { X = 1 } };
        var p = list[0]; p.X = 5;
        Console.Write(list[0].X + " ");
        var arr = new[] { new P3 { X = 1 } };
        arr[0].X = 5;
        Console.WriteLine(arr[0].X);
        // list[0].X = 5;  // lỗi biên dịch CS1612 (kiểm riêng)
    }

    // ---------- Câu 4: struct qua property ----------
    struct Counter { public int N; public void Inc() => N++; }
    class Holder { public Counter C { get; } = new Counter(); public Counter Field = new Counter(); }
    static void Q4()
    {
        Head(4);
        var h = new Holder();
        h.C.Inc(); h.Field.Inc();
        Console.WriteLine(h.C.N + " " + h.Field.N);
    }

    // ---------- Câu 5: string immutable ----------
    static void Q5()
    {
        Head(5);
        string s = "abc";
        s.ToUpper();
        string t = s;
        s += "d";
        Console.WriteLine(s + " " + t);
    }

    // ---------- Câu 6: interning / ReferenceEquals / == ----------
    static void Q6()
    {
        Head(6);
        string a = "hel" + "lo";
        string b = "hello";
        string c = new string(new[] { 'h', 'e', 'l', 'l', 'o' });
        object o1 = b, o2 = c;
        Console.WriteLine(ReferenceEquals(a, b) + " " + ReferenceEquals(b, c) + " " + (b == c) + " "
            + (o1 == o2) + " " + o1.Equals(o2) + " " + ReferenceEquals(b, string.Intern(c)));
    }

    // ---------- Câu 7: boxing, == và Equals ----------
    static void Q7()
    {
        Head(7);
        int i = 5; long l = 5;
        object a = i, b = i;
        Console.WriteLine((a == b) + " " + a.Equals(b) + " " + (i == l) + " " + i.Equals(l) + " " + a.Equals(l));
    }

    // ---------- Câu 8: static ctor + thứ tự khởi tạo ----------
    static int Log(string s) { Console.Write(s + "; "); return 0; }
    class Base8 { public Base8() => Log("Base ctor"); }
    class Derived8 : Base8
    {
        static int s = Log("static field");
        int f = Log("field");
        static Derived8() => Log("static ctor");
        public Derived8() => Log("ctor");
    }
    static void Q8()
    {
        Head(8);
        new Derived8(); new Derived8();
        Console.WriteLine();
    }

    // ---------- Câu 9: virtual trong constructor ----------
    class Base9 { public Base9() { Init(); } protected virtual void Init() { } }
    class Derived9 : Base9
    {
        string name;
        public Derived9() { name = "set"; }
        protected override void Init() => Console.Write(name == null ? "null" : name);
    }
    class Derived9b : Base9
    {
        string name = "init";
        protected override void Init() => Console.Write(name == null ? "null" : name);
    }
    static void Q9()
    {
        Head(9);
        new Derived9(); Console.Write(" "); new Derived9b();
        Console.WriteLine();
    }

    // ---------- Câu 10: new vs override ----------
    class A10 { public virtual string V() => "A.V"; public string N() => "A.N"; }
    class B10 : A10 { public override string V() => "B.V"; public new string N() => "B.N"; }
    static void Q10()
    {
        Head(10);
        A10 x = new B10();
        Console.WriteLine(x.V() + " " + x.N() + " " + ((B10)x).N());
    }

    // ---------- Câu 11: deferred execution ----------
    static void Q11()
    {
        Head(11);
        int calls = 0;
        var q = new[] { 1, 2, 3 }.Select(n => { calls++; return n * 2; });
        Console.Write(calls + " ");
        q.ToList(); q.ToList();
        Console.WriteLine(calls);
    }

    // ---------- Câu 12: yield lười ----------
    static IEnumerable<int> Gen()
    {
        Console.Write("A "); yield return 1;
        Console.Write("B "); yield return 2;
        Console.Write("C ");
    }
    static void Q12()
    {
        Head(12);
        var g = Gen();
        Console.Write("created ");
        foreach (var x in g) Console.Write($"got{x} ");
        Console.WriteLine();
    }

    // ---------- Câu 13: finally + return ----------
    static int F13() { int x = 1; try { return x; } finally { x = 2; Console.Write("fin "); } }
    static void Q13()
    {
        Head(13);
        Console.WriteLine(F13());
    }

    // ---------- Câu 14: exception trong finally ----------
    static void Q14()
    {
        Head(14);
        try { try { throw new Exception("A"); } finally { throw new Exception("B"); } }
        catch (Exception e) { Console.WriteLine(e.Message); }
    }

    // ---------- Câu 15: throw vs throw ex ----------
    [MethodImpl(MethodImplOptions.NoInlining)] static void Thrower() => throw new Exception("x");
    static void Rethrow1() { try { Thrower(); } catch { throw; } }
    static void Rethrow2() { try { Thrower(); } catch (Exception e) { throw e; } }
    static void Q15()
    {
        Head(15);
        try { Rethrow1(); } catch (Exception e) { Console.Write(e.StackTrace.Contains("Thrower") + " "); }
        try { Rethrow2(); } catch (Exception e) { Console.WriteLine(e.StackTrace.Contains("Thrower")); }
    }

    // ---------- Câu 16: async Task exception ----------
    static async Task Fail() { await Task.Delay(1); throw new InvalidOperationException("boom"); }
    static async Task Q16()
    {
        Head(16);
        try { var t = Fail(); Console.Write("after call "); await t; }
        catch (Exception e) { Console.WriteLine("caught " + e.Message); }
    }

    // ---------- Câu 17: hot task ----------
    static async Task Work() { Console.Write("A "); await Task.Delay(10); Console.Write("C "); }
    static async Task Q17()
    {
        Head(17);
        var t = Work(); Console.Write("B "); await t;
        Console.WriteLine();
    }

    // ---------- Câu 18: overflow ----------
    static void Q18()
    {
        Head(18);
        int x = int.MaxValue;
        x++;
        Console.Write(x + " ");
        try { checked { x = int.MaxValue; x++; } } catch (OverflowException) { Console.Write("overflow "); }
        int big = 300; Console.WriteLine((byte)big);
    }

    // ---------- Câu 19: chia nguyên, làm tròn ----------
    static void Q19()
    {
        Head(19);
        Console.WriteLine(-7 / 2 + " " + -7 % 2 + " " + Math.Floor(-7 / 2.0) + " " + Math.Round(2.5) + " "
            + Math.Round(3.5) + " " + Math.Round(2.5, MidpointRounding.AwayFromZero));
    }

    // ---------- Câu 20: float / decimal ----------
    static void Q20()
    {
        Head(20);
        double a = 0.1, b = 0.2; float fa = 0.1f, fb = 0.2f; decimal da = 0.1m, db = 0.2m;
        Console.WriteLine((a + b == 0.3) + " " + (a + b) + " " + (fa + fb == 0.3f) + " " + (da + db == 0.3m) + " " + (1.0m + 1.00m));
    }

    // ---------- Câu 21: ?? và ?. ----------
    static void Q21()
    {
        Head(21);
        string s = null; int? n = null; string t = null;
        Console.Write((s?.Length ?? -1) + " " + ((n + 1) == null) + " " + (n > 0) + " " + (n <= 0) + " ");
        t ??= "def"; Console.WriteLine(t);
    }

    // ---------- Câu 22: pattern matching ----------
    static string Kind(object o) => o switch
    {
        null => "null",
        int n when n < 0 => "neg",
        int => "int",
        string { Length: 0 } => "empty",
        string => "str",
        _ => "other"
    };
    static void Q22()
    {
        Head(22);
        foreach (var o in new object[] { null, -5, 7, "", "a", 3.5 }) Console.Write(Kind(o) + " ");
        Console.WriteLine();
    }

    // ---------- Câu 23: ref local ----------
    static void Q23()
    {
        Head(23);
        int[] a = { 1, 2, 3 };
        ref int r = ref a[1];
        r = 20;
        r = ref a[2];
        r = 30;
        Console.WriteLine(string.Join(",", a));
    }

    // ---------- Câu 24: params ----------
    static string P24(params object[] xs) => xs == null ? "null" : xs.Length.ToString();
    static void Q24()
    {
        Head(24);
        Console.WriteLine(P24() + " " + P24(null) + " " + P24((object)null) + " " + P24(1, 2) + " "
            + P24(new int[] { 1, 2 }) + " " + P24(new[] { "a", "b" }));
    }

    // ---------- Câu 25: thứ tự Dictionary ----------
    static void Q25()
    {
        Head(25);
        var d = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2, ["c"] = 3 };
        d.Remove("b"); d["d"] = 4;
        Console.WriteLine(string.Join(" ", d.Keys));
    }

    // ---------- Câu 26: sửa collection khi foreach ----------
    static void Q26()
    {
        Head(26);
        var list = new List<int> { 1, 2, 3 };
        try { foreach (var x in list) { if (x == 2) list.Remove(x); Console.Write(x + " "); } }
        catch (InvalidOperationException) { Console.Write("InvalidOperationException "); }
        Console.WriteLine(list.Count);
    }

    // ---------- Câu 27: multicast delegate ----------
    static void Q27()
    {
        Head(27);
        Func<int> f = () => 1; f += () => 2; f += () => 3;
        Action a = () => Console.Write("x "); a += () => Console.Write("y ");
        Console.Write(f() + " "); a();
        Console.WriteLine();
    }

    // ---------- Câu 28: event -= lambda ----------
    class Btn { public event Action Click; public void Fire() => Click?.Invoke(); }
    static int hits;
    static void Hit() => hits++;
    static void Q28()
    {
        Head(28);
        var b1 = new Btn(); hits = 0;
        b1.Click += () => hits++;
        b1.Click -= () => hits++;
        b1.Fire();
        Console.Write(hits + " ");
        var b2 = new Btn(); hits = 0;
        b2.Click += Hit;
        b2.Click -= Hit;
        b2.Fire();
        Console.WriteLine(hits);
    }

    // ---------- Câu 29: struct Equals / GetHashCode ----------
    struct P29 { public int X, Y; }
    class C29 { public int X; }
    static void Q29()
    {
        Head(29);
        var a = new P29 { X = 1, Y = 2 }; var b = new P29 { X = 1, Y = 2 };
        var s = new HashSet<P29> { a };
        Console.WriteLine(a.Equals(b) + " " + (a.GetHashCode() == b.GetHashCode()) + " " + s.Contains(b) + " " + new C29().Equals(new C29()));
    }

    // ---------- Câu 30: record equality ----------
    record R(int X, List<int> L);
    record R2(int X, string Y);
    static void Q30()
    {
        Head(30);
        var l = new List<int> { 1 };
        var a = new R(1, l); var b = new R(1, l); var c = new R(1, new List<int> { 1 });
        Console.WriteLine((a == b) + " " + (a == c) + " " + ReferenceEquals(a, b) + " " + (new R2(1, "a") with { X = 2 }).X + " " + new R2(1, "a"));
    }
}
```

**Chạy thử**

Output thật (`dotnet run`, .NET 10, 30/30 khớp với đáp án phía trên):

```
Câu 1:
3 3 3 
Câu 2:
0 1 2 
Câu 3:
1 1 5
Câu 4:
0 1
Câu 5:
abcd abc
Câu 6:
True False True False True True
Câu 7:
False True True False False
Câu 8:
static field; static ctor; field; Base ctor; ctor; field; Base ctor; ctor; 
Câu 9:
null init
Câu 10:
B.V A.N B.N
Câu 11:
0 6
Câu 12:
created A got1 B got2 C 
Câu 13:
fin 1
Câu 14:
B
Câu 15:
True False
Câu 16:
after call caught boom
Câu 17:
A B C 
Câu 18:
-2147483648 overflow 44
Câu 19:
-3 -1 -4 2 4 3
Câu 20:
False 0.30000000000000004 True True 2.00
Câu 21:
-1 True False False def
Câu 22:
null neg int empty str other 
Câu 23:
1,20,30
Câu 24:
0 null 1 2 1 2
Câu 25:
a d c
Câu 26:
1 2 InvalidOperationException 2
Câu 27:
3 x y 
Câu 28:
1 0
Câu 29:
True True True False
Câu 30:
True False False 2 R2 { X = 1, Y = a }
```

- Câu nào khác kết quả bạn đoán thì đó là câu cần ôn lại; nếu **khác đáp án trong node này**, hãy kiểm phiên bản runtime (câu 20, 25 phụ thuộc chi tiết triển khai).
- Thử sửa: đổi `for` ở câu 1 thành `int copy = i;` rồi bắt `copy` → `0 1 2`; bỏ `NoInlining` ở câu 15 và chạy Release để thấy stack trace đổi.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`for (int i=0;i<3;i++) acts.Add(() => Console.Write(i));` rồi gọi cả ba — in ra gì?**
  → In `333`. Vì vòng `for` chỉ có một biến `i` dùng chung và lambda bắt biến chứ không bắt giá trị, nên lúc gọi `i` đã là 3. Sửa bằng cách chép sang biến cục bộ trong thân vòng lặp.
- `Junior` **`foreach (var i in new[]{0,1,2}) acts.Add(() => Console.Write(i));` — in ra gì, và trước C# 5 thì sao?**
  → In `012`. Vì từ C# 5, `foreach` tạo biến lặp mới cho mỗi vòng nên mỗi lambda bắt một biến riêng. Trước C# 5 nó dùng chung biến và in `222`.
- `Junior` **`var b = a; b.X = 5; Console.Write(a.X);` với `a` là struct có `X = 1` — in ra gì?**
  → In `1`. Vì gán struct sao chép toàn bộ giá trị nên `b` là bản độc lập. Nếu `a` là class thì `b` và `a` trỏ cùng object và in `5`.
- `Mid` **`var list = new List<P>{ new P{X=1} }; list[0].X = 5;` với `P` là struct — chuyện gì xảy ra, còn mảng thì sao?**
  → Lỗi biên dịch CS1612, vì indexer của `List<T>` trả về bản copy nên sửa nó vô nghĩa và compiler chặn. Với mảng `arr[0].X = 5` hợp lệ vì `arr[0]` là chính ô nhớ. Cách sửa với list là lấy ra, sửa, rồi gán lại `list[0] = p`.
- `Mid` **`h.C.Inc()` với `C` là property trả struct `Counter`, còn `h.Field.Inc()` với `Field` là field — mỗi dòng đổi gì?**
  → Dòng property không đổi gì (N vẫn 0), dòng field tăng N lên 1. Vì property trả về bản copy rồi `Inc()` chạy trên bản copy đó; field thì `Inc()` chạy trên chính nó.
- `Junior` **`string s="abc"; s.ToUpper(); string t=s; s+="d";` — `s` và `t` là gì?**
  → `s` là `abcd`, `t` là `abc`. Vì string bất biến: `ToUpper()` trả string mới mà không được gán nên bị bỏ, còn `+=` tạo string mới gán cho `s`, `t` vẫn trỏ string cũ.
- `Mid` **`object o1="hello", o2=new string("hello".ToCharArray());` thì `o1 == o2` và `o1.Equals(o2)` là gì?**
  → `==` cho `False`, `Equals` cho `True`. Vì kiểu tĩnh là `object` nên `==` chỉ so tham chiếu, còn `Equals` là virtual và `string` override để so nội dung. Muốn cùng tham chiếu thì `string.Intern`.
- `Mid` **`int i=5; object a=i, b=i;` — `a == b` và `a.Equals(b)` là gì, vì sao?**
  → `False` và `True`. Vì mỗi lần gán sang `object` là một lần boxing tạo object mới, `==` so tham chiếu nên khác; `Int32.Equals` so giá trị nên bằng nhau.
- `Mid` **`int i=5; long l=5; i.Equals(l)` — `True` hay `False`?**
  → `False`. Vì `long` không tự hạ xuống `int` nên chọn `Equals(object)`, box `l` thành `Int64` và `Int32.Equals` đòi cùng kiểu. Ngược lại `i == l` là `True` vì `i` được nâng lên `long`.
- `Senior` **`Derived` có static field, static ctor, instance field, và cha có ctor — thứ tự in khi `new Derived()` hai lần?**
  → `static field; static ctor; field; Base ctor; ctor;` rồi lần hai chỉ `field; Base ctor; ctor;`. Vì phần static chạy một lần trước lần dùng đầu, còn initializer field của lớp con chạy trước constructor lớp cha.
- `Senior` **`Base()` gọi `Init()` virtual, `Derived` override và đọc `name` gán trong ctor — in ra gì?**
  → `null`. Vì override của lớp con chạy ngay trong constructor cha, lúc đó thân constructor lớp con chưa chạy nên `name` chưa được gán. Nếu `name` gán bằng initializer ngay khi khai báo thì có giá trị, vì initializer chạy trước ctor cha.
- `Mid` **`A x = new B();` với `A.V` virtual được `B` override và `A.N` bị `B` ẩn bằng `new` — `x.V()`, `x.N()` in gì?**
  → `B.V` và `A.N`. Vì `override` chọn theo kiểu thực lúc chạy, còn `new` chỉ ẩn tên và chọn theo kiểu của biến lúc biên dịch. Ép `((B)x).N()` mới ra `B.N`.
- `Mid` **`var q = nums.Select(n => { calls++; return n*2; });` rồi gọi `q.ToList()` hai lần với 3 phần tử — `calls` sau khai báo và sau cùng là bao nhiêu?**
  → `0` rồi `6`. Vì `Select` lười, khai báo chưa chạy lambda nào, mỗi lần duyệt lại chạy lại cả chuỗi (3 × 2). Cần chốt một lần thì `ToList()` và giữ list.
- `Mid` **`var g = Gen();` với `Gen` có `yield return` và `Console.Write` giữa chừng — chuyện gì xảy ra ngay dòng đó?**
  → Không in gì cả. Vì gọi iterator method chỉ tạo state machine, thân hàm chỉ chạy khi có `MoveNext()` đầu tiên. Mỗi lần xin phần tử mới thì chạy tới `yield return` kế tiếp rồi dừng.
- `Mid` **`try { return x; } finally { x = 2; }` với `x = 1` — hàm trả về bao nhiêu?**
  → Trả `1`. Vì `return x` đã lưu giá trị lại trước khi `finally` chạy, `finally` đổi biến cục bộ nhưng không đổi giá trị đã lưu. Với kiểu tham chiếu, sửa nội dung object trong `finally` thì vẫn thấy được.
- `Mid` **`try { throw new Exception("A"); } finally { throw new Exception("B"); }` — `catch` bên ngoài thấy gì?**
  → Thấy `B`. Vì ngoại lệ ném trong `finally` thay thế ngoại lệ đang bay, `A` biến mất không dấu vết. Nên giữ `finally` đơn giản và tránh code dễ lỗi trong đó.
- `Mid` **`catch { throw; }` so với `catch (Exception e) { throw e; }` — khác gì ở stack trace?**
  → `throw;` giữ nguyên stack trace gốc, còn `throw e;` reset stack trace về dòng đó nên mất frame nơi lỗi thật xảy ra. Vì vậy log crash chỉ thấy chỗ ném lại; muốn thêm ngữ cảnh thì bọc `new Exception("...", e)`.
- `Senior` **`var t = FailAsync(); Console.Write("x"); await t;` với `FailAsync` ném ngoại lệ — lúc nào ngoại lệ lộ ra, còn `async void` thì sao?**
  → In `x` trước, ngoại lệ lộ ra ở `await t`. Vì với `async Task` ngoại lệ được nhét vào Task và chỉ ném lại khi await. `async void` không có Task để chờ nên ngoại lệ bị đẩy lên SynchronizationContext hoặc thread pool và có thể làm sập process, nên chỉ dùng cho event handler.
- `Senior` **`var t = Work(); Console.Write("B"); await t;` với `Work` in `A`, `await Task.Delay(10)`, in `C` — output?**
  → `A B C`. Vì `async` method chạy đồng bộ tới `await` đầu tiên chưa xong, nên `A` in ngay trong lời gọi. Task là hot, không như `IEnumerable` lười.
- `Mid` **`int x = int.MaxValue; x++;` rồi trong `checked` làm lại, và `(byte)300` — kết quả?**
  → `-2147483648`, `OverflowException`, và `44`. Vì mặc định `unchecked` quay vòng thành `int.MinValue`, `checked` ném lỗi, còn ép sang byte giữ 8 bit thấp (300 − 256 = 44). Tiền cộng dồn kiểu `int` là bug game idle kinh điển.
- `Junior` **`-7 / 2`, `-7 % 2`, `Math.Floor(-7 / 2.0)` — ba giá trị?**
  → `-3`, `-1`, `-4`. Vì chia nguyên cắt về 0, phần dư mang dấu số bị chia, còn `Floor` làm tròn xuống −∞. Dùng để tính chỉ số ô lưới âm phải cẩn thận.
- `Mid` **`Math.Round(2.5)`, `Math.Round(3.5)`, `Math.Round(2.5, MidpointRounding.AwayFromZero)` — in ra gì?**
  → `2`, `4`, `3`. Vì `Math.Round` mặc định là banker's rounding (về số chẵn gần nhất). Muốn kiểu làm tròn "5 thì lên" của bảng tính thì truyền `AwayFromZero`.
- `Junior` **`0.1 + 0.2 == 0.3` với `double` và với `decimal` — kết quả?**
  → `False` với `double` (tổng là `0.30000000000000004`) và `True` với `decimal`. Vì 0,1 và 0,2 không biểu diễn chính xác bằng nhị phân, còn `decimal` lưu cơ số 10. So float thì dùng epsilon hoặc `Mathf.Approximately`.
- `Mid` **`int? n = null; n + 1 == null`, `n > 0`, `n <= 0` — ba giá trị?**
  → `True`, `False`, `False`. Vì số học trên nullable null cho null, còn mọi phép so sánh thứ tự với null đều sai nên cả `n > 0` lẫn `n <= 0` đều `False`. Đừng giả định "không lớn hơn thì là nhỏ hơn hoặc bằng".
- `Senior` **`gameObject?.name` khi `gameObject` đã `Destroy` ở Unity — an toàn không?**
  → Không an toàn. Vì Unity override `== null` để coi object đã huỷ là null, nhưng `?.` kiểm null tham chiếu thật nên vẫn đi tiếp và ném `MissingReferenceException`. Với `UnityEngine.Object` hãy dùng `if (obj)` hoặc `obj == null`.
- `Mid` **`o switch { int n when n < 0 => "neg", int => "int", string{Length:0} => "empty", _ => "other" }` với `-5`, `7`, `""`, `3.5` — kết quả?**
  → `neg`, `int`, `empty`, `other`. Vì các nhánh thử từ trên xuống và nhánh đầu khớp thắng, nên nhánh có điều kiện phải đứng trước nhánh tổng quát cùng kiểu; `3.5` là `double` nên rơi vào `_`.
- `Senior` **`int[] a={1,2,3}; ref int r = ref a[1]; r = 20; r = ref a[2]; r = 30;` — mảng cuối là gì?**
  → `1,20,30`. Vì `ref` local là bí danh của ô nhớ nên `r = 20` ghi vào `a[1]`, còn `r = ref a[2]` đổi ô mà `r` trỏ tới rồi `r = 30` ghi vào `a[2]`. Dùng được để sửa struct trong mảng không copy.
- `Senior` **`P(params object[] xs)` — độ dài của `xs` khi gọi `P()`, `P(null)`, `P((object)null)`, `P(new int[]{1,2})`?**
  → `0`, `xs` là `null`, `1`, và `1`. Vì `P(null)` khớp dạng thường nên `null` chính là mảng; ép `(object)` đưa vào dạng mở rộng; `int[]` không phải `object[]` nên bị bọc thành một phần tử. `string[]` thì được dùng thẳng nhờ hiệp biến.
- `Senior` **thêm `a,b,c` vào `Dictionary`, `Remove("b")`, thêm `d` rồi in `Keys` — thứ tự?**
  → Hiện tại in `a d c`, nhưng không được đảm bảo. Vì `d` lấp vào ô trống mà `b` để lại; thứ tự duyệt `Dictionary` là chi tiết triển khai nên đừng dựa vào nó để serialize hay sinh UI.
- `Junior` **`foreach (var x in list) { if (x == 2) list.Remove(x); }` với `list = {1,2,3}` — chuyện gì xảy ra, sửa thế nào?**
  → Ném `InvalidOperationException` ở lần lặp kế tiếp vì version của collection đã đổi, và phần tử đã bị xoá thật. Sửa bằng `for` ngược, `RemoveAll(pred)`, hoặc gom danh sách xoá rồi xoá sau vòng lặp.
- `Mid` **`Func<int> f = () => 1; f += () => 2; f += () => 3; f()` — trả về gì, hai giá trị kia đâu?**
  → Trả `3`. Vì delegate multicast chạy mọi handler theo thứ tự đăng ký nhưng chỉ trả giá trị của handler cuối; hai giá trị đầu bị bỏ. Muốn lấy hết thì duyệt `GetInvocationList()`.
- `Mid` **`btn.Click += () => n++; btn.Click -= () => n++;` rồi `Fire()` — handler còn chạy không?**
  → Còn chạy, `n` thành 1. Vì hai lambda giống chữ vẫn là hai delegate khác nhau nên `-=` không tìm thấy gì để gỡ. Dùng method group hoặc lưu delegate vào field để gỡ được, kẻo rò rỉ và gọi vào object đã huỷ.
- `Senior` **struct `P{int X,Y;}` dùng làm khoá `HashSet<P>` không override gì — `Equals`, `GetHashCode` và `Contains` hoạt động sao?**
  → Đều theo giá trị field nên hai `P` cùng nội dung bằng nhau, cùng hash và `Contains` đúng. Nhưng cài mặc định dựa trên `ValueType` chậm và có thể boxing, nên struct làm khoá nóng cần tự cài `IEquatable<T>` và `GetHashCode` với `HashCode.Combine`.
- `Senior` **`record R(int X, List<int> L)` — `new R(1, l) == new R(1, l)` và với list khác instance nội dung giống?**
  → `True` khi cùng list, `False` khi list khác instance. Vì record so từng field bằng `Equals` của field, mà `List<T>` chỉ so tham chiếu. Dùng record cho dữ liệu bất biến có field giá trị, đừng kỳ vọng nó so sánh sâu collection.

**Khung trả lời 60 giây** — "Anh làm thế nào khi gặp câu hỏi đoán output mà không chắc?"

> Em không đoán bằng trực giác, em chạy code trong đầu từng dòng như một trình thông dịch, và nói to ra từng bước để người phỏng vấn thấy lập luận. Em ghi giá trị mỗi biến sau mỗi dòng, và tự hỏi bốn thứ hay gây bẫy: biến bị bắt hay bị copy, giá trị hay tham chiếu, chạy lười hay chạy ngay, và thứ tự khởi tạo. Nếu vẫn không chắc, em nói rõ em chắc phần nào, không chắc phần nào, rồi nêu giả thuyết cùng cách kiểm chứng: gõ vào dotnet hoặc LINQPad thì mất ba mươi giây. Nếu là chi tiết triển khai không có trong spec, như thứ tự duyệt Dictionary, em nói luôn là không nên dựa vào nó. Quan trọng nhất là em đưa ra một đáp án rõ ràng chứ không trả lời "còn tuỳ", và sẵn sàng sửa khi được gợi ý.

**Họ sẽ đào tiếp**

- *"Sửa câu closure trong `for` thế nào, và vì sao C# 5 đổi `foreach` mà không đổi `for`?"* → chép sang biến cục bộ trong thân vòng; `for` có một biến khai báo ngoài thân và `i++` sửa chính nó nên đổi sẽ phá nghĩa vòng lặp; `foreach` thì biến chỉ đọc nên tách mỗi vòng an toàn.
- *"Khác nhau giữa `ReferenceEquals`, `==`, `Equals` với string và object?"* → `==` chọn theo kiểu tĩnh lúc biên dịch (overload của `string` so nội dung, của `object` so tham chiếu); `Equals` virtual chọn theo kiểu thực; `ReferenceEquals` luôn so tham chiếu; nhắc interning của literal.
- *"Struct copy ảnh hưởng hiệu năng và độ đúng thế nào, khi nào dùng `ref`/`in`/`readonly struct`?"* → struct lớn copy tốn, `in` truyền tham chiếu chỉ đọc, `readonly struct` tránh copy phòng thủ; `ref` local/return sửa tại chỗ không copy; struct nên nhỏ (≤16 byte) và bất biến.
- *"Làm sao thu mọi exception của nhiều Task, và vì sao `async void` nguy hiểm?"* → `Task.WhenAll` gom `AggregateException` (chỉ ném phần tử đầu khi `await`, các lỗi khác ở `Task.Exception`); `async void` không có Task để bắt, ngoại lệ vào SynchronizationContext và có thể sập process.
- *"Vì sao thứ tự khởi tạo field/ctor/static như vậy, và tránh bẫy gọi virtual trong constructor thế nào?"* → initializer lớp con chạy trước ctor cha để field readonly có giá trị sớm nhất có thể, nhưng override chạy khi lớp con chưa xong; tránh bằng `Awake/Initialize` riêng hoặc factory.
- *"Deferred execution gây bug ở đâu, và `ToList()` hay `ToArray()` khác gì?"* → truy vấn chạy lại mỗi lần duyệt, thấy trạng thái mới của nguồn (và gọi lại lambda có side effect); `ToList/ToArray` chốt một snapshot ngay; cẩn trọng với closure bắt biến lặp trong LINQ.
- *"Làm sao đảm bảo một event không rò rỉ khi đăng ký bằng lambda?"* → lưu delegate vào field để `-=` đúng instance, hoặc dùng method group; gỡ trong `OnDisable/OnDestroy`; cân nhắc weak event hoặc token huỷ.

**Cờ đỏ**

- Đoán output bằng trực giác rồi khẳng định chắc nịch mà không lần theo từng dòng — người phỏng vấn đổi một chữ là sập.
- Trả lời "`3 3 3` vì lambda bắt giá trị" — sai cơ chế: lambda bắt *biến*, đó là chỗ phân biệt người hiểu và người học thuộc.
- Nói thứ tự `Dictionary` là thứ tự chèn mà không biết đó là chi tiết triển khai không đảm bảo.
- Nhầm `throw ex;` với `throw;`, hoặc không biết `finally` có thể che mất ngoại lệ gốc.
- Nghĩ `async` method "chưa chạy cho tới khi await", hoặc quên rằng `async void` làm lỗi không bắt được.
- Cho rằng `==` trên `object` đã boxing so giá trị, hoặc `0.1 + 0.2 == 0.3` đúng vì "máy tính chính xác".
- Dùng `?.` hay `??` trên `UnityEngine.Object` mà không biết cơ chế "null giả" của Unity.
- Im lặng khi không chắc thay vì nêu giả thuyết và cách kiểm chứng.

**Số / ví dụ nên thuộc**

- `for` closure → `3 3 3`; `foreach` closure (từ C# 5) → `0 1 2`.
- `int.MaxValue` = 2147483647; `+1` (unchecked) → `-2147483648`; `(byte)300` = 44.
- `-7 / 2` = −3, `-7 % 2` = −1, `Math.Floor(-7 / 2.0)` = −4; `Math.Round(2.5)` = 2, `Math.Round(3.5)` = 4.
- `0.1 + 0.2` = `0.30000000000000004` (double); `0.1m + 0.2m == 0.3m` là `True`.
- `Select` 3 phần tử duyệt hai lần → lambda chạy 6 lần, khai báo xong mới 0 lần.
- Thứ tự khởi tạo: static field → static ctor → instance field (lớp con) → ctor cha → ctor con.
- Delegate multicast trả giá trị của handler cuối; hai lambda giống chữ là hai delegate khác nhau.
- `params object[]`: `P()` → 0, `P(null)` → mảng null, `P(new int[]{1,2})` → độ dài 1.
- Lỗi biên dịch cần nhớ: CS1612 (sửa trường của struct trả về từ indexer/property), CS0220 (hằng số tràn), CS0019 (`==` trên struct tự định nghĩa).
- Struct nên ≤16 byte; `record` so từng field nhưng collection trong record chỉ so tham chiếu.
