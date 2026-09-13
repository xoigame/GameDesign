---
id: csharp-linq
title: LINQ, closure và iterator
icon: 🔎
summary: LINQ chạy lúc nào chứ không phải lúc bạn viết, mỗi mắt xích tốn gì, closure bắt biến đắt ở đâu, và cách viết lại năm truy vấn hay gặp nhất thành vòng lặp 0 byte.
status: deep
read: 790
level: intermediate
order: 40
tags: [csharp, linq, closure, iterator, performance, interview]
related: [csharp-collections, csharp-memory, csharp-delegate-event, unity-csharp-memory]
---

LINQ là thứ đầu tiên người viết C# ngoài game khen và là thứ đầu tiên người tối ưu game xoá đi. Cả hai đều đúng, vì họ nói về hai chỗ khác nhau: LINQ trong editor tool, code load màn, test, backend — tuyệt vời. LINQ trong `Update` với 500 đối tượng — là lý do game khựng.

Biết ranh giới đó, và **giải thích được vì sao**, là một trong những câu hỏi mid-level hay gặp nhất khi phỏng vấn Unity. Đáp án "LINQ chậm" không đủ; phải nói được **nó cấp phát cái gì**.

## LINQ chạy lúc nào — deferred execution

```csharp
var query = enemies.Where(e => e.hp < 50);   // KHÔNG duyệt gì cả — chỉ dựng một iterator
enemies.Add(new Enemy { hp = 10 });          // thêm sau khi đã "viết" truy vấn
int n = query.Count();                       // TỚI ĐÂY mới duyệt — và thấy cả phần tử vừa thêm
```

Truy vấn là **công thức**, không phải kết quả. Nó chỉ chạy khi có người duyệt: `foreach`, `ToList()`, `Count()`, `First()`. Hai hệ quả thực tế:

- **Duyệt hai lần là chạy hai lần.** `if (query.Any()) foreach (var x in query)` duyệt nguồn hai lượt. Nguồn là một file đọc từ đĩa hay một truy vấn đắt thì đó là lỗi hiệu năng im lặng.
- **Nguồn đổi giữa chừng thì kết quả đổi theo**, hoặc ném exception nếu nguồn là collection vừa bị sửa.

Chốt bằng `ToList()`/`ToArray()` khi muốn "chụp" kết quả tại một thời điểm — nhưng nhớ rằng đó là một mảng mới.

## Một dòng LINQ cấp phát những gì

```csharp
float limit = attackRange;                                   // biến cục bộ
var targets = enemies.Where(e => e.dist < limit)             // ① closure ② iterator
                     .OrderBy(e => e.dist)                   // ③ comparer ④ buffer ⑤ mảng key
                     .Take(3)                                // ⑥ iterator
                     .ToArray();                             // ⑦ mảng kết quả
```

| # | Cấp phát gì | Ghi chú |
|---|---|---|
| ① | Object chứa biến bị bắt (**display class**) + một delegate | Chỉ xảy ra khi lambda **bắt biến**. Lambda không bắt gì thì compiler cache lại, 0 byte |
| ② ⑥ | Một iterator object cho mỗi mắt xích | `Where`+`Select` liền nhau được .NET gộp thành một, nhưng vẫn là một object |
| ③ ④ ⑤ | Comparer, buffer nội bộ, mảng khoá sắp xếp | `OrderBy` là mắt xích đắt nhất trong chuỗi |
| ⑦ | Mảng kết quả | Kích thước đúng bằng số phần tử lấy được |

Cỡ vài trăm byte cho **một lần gọi**. Trong `Update` ở 60fps đó là vài chục KB mỗi giây, tức một lần GC mỗi vài chục giây — đúng kiểu khựng đều đặn mô tả ở [[unity-csharp-memory]].

Chi tiết đáng nói trong phỏng vấn: **chi phí nằm ở việc bắt biến, không phải ở chữ lambda**. `e => e.hp < 50` không bắt gì nên delegate được cache một lần; `e => e.hp < limit` bắt `limit` nên mỗi lần chạy sinh một object mới. Từ C# 9 (Unity 6 có) bạn ép được điều đó thành lỗi biên dịch:

```csharp
var dead = enemies.Where(static e => e.hp <= 0);   // static lambda: cấm bắt biến, khỏi lo
```

## Năm truy vấn hay gặp và bản viết lại 0 byte

```csharp
// 1) Tìm phần tử đầu thoả điều kiện
var t = enemies.FirstOrDefault(e => e.dist < r);
// ->
Enemy t = null;
for (int i = 0; i < enemies.Count; i++) if (enemies[i].dist < r) { t = enemies[i]; break; }

// 2) Có cái nào không
if (enemies.Any(e => e.dist < r)) { }
// ->
bool found = false;
for (int i = 0; i < enemies.Count && !found; i++) found = enemies[i].dist < r;

// 3) Lấy nhỏ nhất / gần nhất
var nearest = enemies.OrderBy(e => e.dist).First();
// ->  không cần sắp xếp gì cả, chỉ cần một lượt duyệt
Enemy nearest2 = null; float best = float.MaxValue;
for (int i = 0; i < enemies.Count; i++)
    if (enemies[i].dist < best) { best = enemies[i].dist; nearest2 = enemies[i]; }

// 4) Lọc ra danh sách
var alive = enemies.Where(e => e.hp > 0).ToList();
// ->  buffer là FIELD, Clear() giữ capacity
aliveBuffer.Clear();
for (int i = 0; i < enemies.Count; i++) if (enemies[i].hp > 0) aliveBuffer.Add(enemies[i]);

// 5) Gom nhóm
var byType = enemies.GroupBy(e => e.type).ToDictionary(g => g.Key, g => g.ToList());
// ->  Dictionary<K, List<V>> dựng sẵn, mỗi List Clear() thay vì new
foreach (var kv in byTypeCache) kv.Value.Clear();
for (int i = 0; i < enemies.Count; i++) byTypeCache[enemies[i].type].Add(enemies[i]);
```

Số 3 đáng để ý nhất: `OrderBy(...).First()` là **O(n log n) để lấy một phần tử** trong khi một vòng duyệt là O(n). Đây là lỗi hiệu năng phổ biến nhất trong code gameplay viết bằng LINQ, và nó không liên quan gì tới cấp phát — nó sai về thuật toán.

## `Any()` hay `Count() > 0`

```csharp
if (list.Count > 0) { }            // O(1) — thuộc tính của List
if (enumerable.Any()) { }          // dừng ngay ở phần tử đầu
if (enumerable.Count() > 0) { }    // DUYỆT HẾT rồi mới so sánh  ← sai
```

`Count()` của LINQ có đường tắt khi nguồn là `ICollection<T>`, nhưng với một chuỗi `Where(...)` thì không có đường tắt nào — nó duyệt trọn nguồn. Với một truy vấn đắt hoặc một chuỗi vô hạn, `Count() > 0` là bug chứ không chỉ là chậm.

## `yield return` — iterator tự viết

```csharp
public IEnumerable<Vector2Int> Neighbors(Vector2Int c)
{
    yield return new Vector2Int(c.x + 1, c.y);
    yield return new Vector2Int(c.x - 1, c.y);
    yield return new Vector2Int(c.x, c.y + 1);
    yield return new Vector2Int(c.x, c.y - 1);
}
```

Trình biên dịch biến hàm này thành một **class máy trạng thái**; mỗi lần gọi là một object mới (~50–70 byte). Đổi lại nó lười: người gọi `break` sớm thì phần còn lại không bao giờ chạy.

Đáng dùng cho: sinh dữ liệu lớn mà chỉ lấy một phần, duyệt cây, và toàn bộ Coroutine của Unity (`IEnumerator` chính là cơ chế này). Không đáng dùng cho: hàm trả về đúng bốn phần tử gọi mỗi frame trong pathfinding — ở đó hãy ghi thẳng vào một buffer do người gọi truyền vào.

```csharp
public void GetNeighbors(Vector2Int c, List<Vector2Int> buffer)   // 0 byte, người gọi giữ buffer
{
    buffer.Clear();
    buffer.Add(new Vector2Int(c.x + 1, c.y));
    // …
}
```

Mẫu "người gọi truyền buffer" chính là cách Unity thiết kế `Physics.RaycastNonAlloc` và `GetComponents(List<T>)` — thấy API nào có overload nhận `List<T>` thì đó là lý do.

## Ranh giới dùng được

| Chỗ | LINQ? | Vì sao |
|---|---|---|
| Editor tool, script build | **Thoải mái** | Chạy một lần, không có người chơi nào đang chờ |
| Load màn, khởi tạo, đọc config | **Được** | Vài chục ms lúc loading không ai thấy |
| UI mở bảng, sắp bảng xếp hạng | **Được**, nếu không mở mỗi frame | Một lần bấm là một lần chạy |
| `Update`, `FixedUpdate`, vòng lặp AI | **Không** | Nhân với 60 lần mỗi giây |
| Trong Job / Burst | **Không dùng được** | Job chỉ nhận kiểu blittable, không delegate |
| Test tự động | **Thoải mái** | Đọc được quan trọng hơn nhanh |

Cách nói trong phỏng vấn: *"LINQ là công cụ của code chạy một lần; vòng lặp là công cụ của code chạy mỗi frame."*

## Bẫy còn lại

- **`foreach` trên biến kiểu `IEnumerable<T>`** boxing enumerator, kể cả khi nguồn là `List<T>`. Giữ kiểu cụ thể ở biến cục bộ.
- **Trả `IEnumerable<T>` từ API công khai** giấu mất chi phí: người gọi không biết mỗi lần duyệt là một lần chạy lại. Trả `List<T>` hoặc nhận buffer.
- **Truy vấn bắt `this`**: lambda dùng field của lớp thì nó bắt luôn `this`, giữ sống cả object — nguồn rò rỉ khi truy vấn được lưu vào field tĩnh.
- **`ToList()` trong vòng lặp** là mảng mới mỗi vòng; đây là cách nhanh nhất để biến một hàm O(n) thành O(n²) về cấp phát.
- **LINQ trong Coroutine** vẫn tính là mỗi frame nếu coroutine `yield return null` mỗi frame.

## Kiểm tra nhanh

- [ ] Không có `using System.Linq` nào trong file chạy mỗi frame (grep là đủ)
- [ ] Truy vấn nào duyệt hai lần đã được `ToList()` một lần
- [ ] Không có `OrderBy(...).First()` — đã đổi thành một vòng duyệt tìm min
- [ ] Lambda trong code nóng đều là `static` hoặc không bắt biến
- [ ] Hàm nóng trả dữ liệu qua buffer của người gọi, không `yield return`
- [ ] Đã đo GC Alloc trước/sau khi bỏ LINQ, không chỉ tin là nhanh hơn

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc bỏ LINQ khỏi code nóng**

Đây là một trong số ít việc AI làm **rất** tốt: dịch một chuỗi LINQ sang vòng lặp tương đương là phép biến đổi cơ học, nó hiếm khi sai. Nhưng có hai chỗ nó vấp đều đặn: **nó bỏ mất ngữ nghĩa lười** (truy vấn gốc dừng sớm, vòng lặp nó viết duyệt hết), và **nó không nhận ra `OrderBy(...).First()` nên thành một vòng tìm min** thay vì một vòng sắp xếp.

Quy trình dùng được: bạn chỉ đúng hàm (theo Profiler, không theo cảm giác) → AI viết lại → bạn đối chiếu hành vi biên: danh sách rỗng, nhiều phần tử bằng nhau, thứ tự kết quả. Chính ba trường hợp biên đó là chỗ bản viết lại hay khác bản gốc.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Thứ tự kết quả có quan trọng không** — quyết định có được thay `OrderBy` bằng tìm min hay không.
- **Danh sách rỗng thì mong đợi gì**: `First()` ném exception, `FirstOrDefault()` trả `null`. Hai hành vi khác nhau.
- **Buffer tái sử dụng được đặt ở đâu** (field của lớp? static?) và ai được phép giữ tham chiếu tới nó.
- **n bao nhiêu và chạy bao nhiêu lần mỗi frame** — nếu n = 5 và chạy một lần mỗi giây thì đừng đổi gì cả.

**Mẫu prompt**

```
Unity 6 (C# 9). Hàm dưới chạy trong Update, n ≈ 600, Profiler báo 8 KB alloc/frame.

<dán hàm>

Viết lại KHÔNG dùng LINQ, mục tiêu 0 B/frame. Ràng buộc:
- Buffer phải là field của lớp, Clear() để dùng lại — KHÔNG new trong hàm
- Giữ NGUYÊN hành vi khi danh sách rỗng và khi có nhiều phần tử bằng nhau
- Nếu truy vấn gốc dừng sớm thì bản mới cũng phải dừng sớm
- Nếu có OrderBy(...).First() thì đổi thành một vòng tìm min, nói rõ độ phức tạp trước/sau

Sau đó liệt kê các trường hợp biên mà hành vi CÓ THỂ khác bản gốc.
```

**Bẫy thường gặp:** AI viết lại `FirstOrDefault` thành một vòng lặp **duyệt hết** thay vì `break` ở phần tử đầu — đúng kết quả, sai độ phức tạp, và với n lớn thì còn chậm hơn LINQ. Bẫy thứ hai: nó tạo `new List<T>()` bên trong hàm được gọi mỗi frame, tức là chỉ dời chỗ cấp phát chứ không bỏ. Bẫy thứ ba: nó giữ nguyên lambda bắt biến trong vòng lặp nóng vì "đằng nào cũng không phải LINQ" — closure vẫn cấp phát.

## 💻 Code

Demo ba thứ: chi phí thật của một chuỗi LINQ so với vòng lặp tương đương, bug duyệt hai lần của deferred execution, và khác biệt giữa lambda bắt biến với lambda `static`. Chạy bằng `dotnet run`.

**Script**

```csharp
// Program.cs — .NET 6+ (dotnet new console && dotnet run)
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

class Enemy { public int Hp; public float Dist; }

static class Program
{
    const int N = 2000;
    const int Frames = 600;          // giả lập 10 giây ở 60fps

    static readonly List<Enemy> Enemies = new List<Enemy>(N);
    static readonly List<Enemy> Buffer = new List<Enemy>(N);   // buffer dùng lại

    static void Main()
    {
        var rng = new Random(7);
        for (int i = 0; i < N; i++)
            Enemies.Add(new Enemy { Hp = rng.Next(0, 100), Dist = (float)rng.NextDouble() * 50f });

        // ---- 1) LINQ so với vòng lặp, đo cả thời gian lẫn byte ----
        long b0 = GC.GetTotalAllocatedBytes(true);
        var sw = Stopwatch.StartNew();
        int sink = 0;
        for (int f = 0; f < Frames; f++) sink += LinqWay(12f);
        sw.Stop();
        long linqBytes = GC.GetTotalAllocatedBytes(true) - b0;
        long linqMs = sw.ElapsedMilliseconds;

        b0 = GC.GetTotalAllocatedBytes(true);
        sw.Restart();
        for (int f = 0; f < Frames; f++) sink += LoopWay(12f);
        sw.Stop();
        long loopBytes = GC.GetTotalAllocatedBytes(true) - b0;

        Console.WriteLine($"{Frames} frame, n={N}:");
        Console.WriteLine($"  LINQ    : {linqMs,4} ms | {linqBytes / 1024,6} KB | {linqBytes / Frames,5} B/frame");
        Console.WriteLine($"  vòng lặp: {sw.ElapsedMilliseconds,4} ms | {loopBytes / 1024,6} KB | {loopBytes / Frames,5} B/frame\n");

        // ---- 2) deferred execution: nguồn đổi thì kết quả đổi ----
        var pending = new List<int> { 1, 2, 3 };
        var query = pending.Where(x => x > 1);           // chưa chạy
        pending.Add(99);                                  // thêm SAU khi viết truy vấn
        Console.WriteLine($"deferred: query.Count() = {query.Count()}  (3, vì 99 cũng được tính)");
        var snapshot = pending.Where(x => x > 1).ToList();
        pending.Add(100);
        Console.WriteLine($"snapshot: đã ToList() nên vẫn = {snapshot.Count}\n");

        // ---- 3) lambda bắt biến so với static lambda ----
        b0 = GC.GetTotalAllocatedBytes(true);
        for (int f = 0; f < Frames; f++) sink += CountCapturing(50);
        long capturing = GC.GetTotalAllocatedBytes(true) - b0;

        b0 = GC.GetTotalAllocatedBytes(true);
        for (int f = 0; f < Frames; f++) sink += CountStatic();
        long noCapture = GC.GetTotalAllocatedBytes(true) - b0;

        Console.WriteLine($"lambda BẮT biến   : {capturing,7} B tổng — display class mới mỗi lần gọi");
        Console.WriteLine($"lambda static     : {noCapture,7} B tổng — delegate được cache một lần");
        Console.WriteLine($"(sink={sink})");
    }

    // O(n log n) + nhiều object mỗi lần gọi
    static int LinqWay(float range)
    {
        var near = Enemies.Where(e => e.Dist < range && e.Hp > 0)
                          .OrderBy(e => e.Dist)
                          .Take(3)
                          .ToArray();
        return near.Length;
    }

    // O(n), 0 byte: buffer là field, chỉ giữ 3 phần tử gần nhất bằng chèn có thứ tự
    static int LoopWay(float range)
    {
        Buffer.Clear();
        for (int i = 0; i < Enemies.Count; i++)
        {
            var e = Enemies[i];
            if (e.Dist >= range || e.Hp <= 0) continue;
            int at = Buffer.Count;
            while (at > 0 && Buffer[at - 1].Dist > e.Dist) at--;
            if (at >= 3) continue;
            Buffer.Insert(at, e);
            if (Buffer.Count > 3) Buffer.RemoveAt(Buffer.Count - 1);
        }
        return Buffer.Count;
    }

    static int CountCapturing(int limit)
    {
        int c = 0;
        Func<Enemy, bool> p = e => e.Hp > limit;        // bắt 'limit' -> object mới mỗi lần
        for (int i = 0; i < Enemies.Count; i++) if (p(Enemies[i])) c++;
        return c;
    }

    static int CountStatic()
    {
        int c = 0;
        Func<Enemy, bool> p = static e => e.Hp > 50;    // không bắt gì -> compiler cache
        for (int i = 0; i < Enemies.Count; i++) if (p(Enemies[i])) c++;
        return c;
    }
}
```

**Chạy thử**
- Phần 1: LINQ cấp phát cỡ **vài trăm byte mỗi frame** trong khi vòng lặp in ra **0 B/frame**. Thời gian cũng chênh vài lần, phần lớn do `OrderBy` sắp toàn bộ danh sách chỉ để lấy 3 phần tử.
- Phần 2: `query.Count()` ra **3** dù lúc viết truy vấn danh sách chỉ có 2 phần tử thoả — bằng chứng trực quan cho deferred execution. Bản `ToList()` thì đứng yên.
- Phần 3: lambda bắt biến cấp phát tổng vài chục KB, lambda `static` in ra **0 B**. Đây là chỗ thấy rõ "chi phí nằm ở việc bắt biến, không nằm ở chữ lambda".

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **LINQ là gì, nó chạy khi nào?**
  → LINQ là tập hàm mở rộng trên `IEnumerable<T>` dùng lambda để lọc, biến đổi, sắp xếp. Điểm quan trọng là nó **lười**: viết `Where(...)` không duyệt gì cả, chỉ dựng một iterator; tới lúc `foreach`, `ToList()` hay `Count()` mới thật sự chạy. Nên nếu nguồn đổi giữa chừng, kết quả đổi theo.
- `Junior` **`Any()` và `Count() > 0` khác nhau thế nào?**
  → `Any()` dừng ngay khi gặp phần tử đầu tiên; `Count()` duyệt hết rồi mới so sánh. Với một chuỗi `Where(...)` đắt hoặc nguồn lớn thì khác biệt là cả một lượt duyệt thừa. Với `List` thì `list.Count` là thuộc tính O(1), dùng thẳng cái đó.
- `Mid` **Vì sao không dùng LINQ trong `Update`?**
  → Vì mỗi lần gọi cấp phát: một display class nếu lambda bắt biến, một iterator cho mỗi mắt xích, và với `OrderBy` thì thêm comparer, buffer và mảng khoá. Cỡ vài trăm byte một lần gọi, nhân 60 lần mỗi giây là vài chục KB mỗi giây — một lịch hẹn GC. Ngoài gameplay thì tôi dùng LINQ thoải mái vì đọc dễ hơn hẳn.
- `Mid` **Chi phí của lambda nằm ở đâu?**
  → Ở việc **bắt biến**, không phải ở chữ lambda. Lambda không bắt gì được trình biên dịch cache thành một delegate tĩnh, dùng lại mãi, 0 byte. Lambda bắt một biến cục bộ thì mỗi lần chạy sinh một object chứa biến đó cộng một delegate. Từ C# 9 có thể viết `static e => ...` để trình biên dịch **cấm** bắt biến — rất hợp cho code nóng.
- `Mid` **`enemies.OrderBy(e => e.dist).First()` sai ở đâu?**
  → Sai về thuật toán trước khi sai về cấp phát: nó sắp toàn bộ danh sách, O(n log n), để lấy đúng một phần tử — trong khi một vòng duyệt tìm min là O(n). Với 2000 enemy mỗi frame thì đó là khác biệt lớn. Đây cũng là lỗi LINQ phổ biến nhất tôi gặp trong code gameplay.
- `Mid` **`yield return` sinh ra cái gì?**
  → Trình biên dịch dựng một class máy trạng thái; mỗi lần gọi hàm là một object mới cỡ 50–70 byte, và thân hàm chạy từng đoạn theo mỗi lần `MoveNext`. Nó là cơ chế đứng sau Coroutine của Unity. Đáng dùng khi cần lười và có thể dừng sớm; không đáng dùng cho hàm trả bốn phần tử gọi mỗi frame — chỗ đó ghi vào buffer của người gọi.
- `Senior` **Duyệt một truy vấn LINQ hai lần thì sao?**
  → Nó chạy hai lần, vì truy vấn là công thức chứ không phải kết quả. `if (q.Any()) foreach (var x in q)` duyệt nguồn hai lượt; nếu nguồn là đọc file hay truy vấn database thì đó là lỗi thật chứ không chỉ chậm. Cách chặn là `ToList()` một lần rồi dùng lại, và trong API công khai thì trả `List<T>` thay vì `IEnumerable<T>` để người gọi không tự bắn vào chân.
- `Senior` **Khi nào anh vẫn giữ LINQ dù đang tối ưu?**
  → Ở mọi chỗ chạy một lần: editor tool, script build, đọc config lúc load, test, và code UI mở theo thao tác người chơi. Đổi LINQ thành vòng lặp ở đó chỉ làm code khó đọc mà không đo được khác biệt nào. Tôi chỉ xoá LINQ ở chỗ Profiler chỉ đích danh, và luôn đo lại sau khi xoá.

**Khung trả lời 60 giây** — "Vì sao LINQ không dùng trong gameplay?"

> Vì hai lý do, và lý do thứ hai nặng hơn lý do người ta hay nói.
>
> Lý do thứ nhất là **cấp phát**: mỗi lần gọi sinh ra một iterator cho mỗi mắt xích, cộng một object chứa biến bị lambda bắt, và nếu có `OrderBy` thì thêm comparer, buffer và mảng khoá. Vài trăm byte một lần, nhân 60 lần mỗi giây — đó là một lịch hẹn GC.
>
> Lý do thứ hai là **thuật toán**. Viết LINQ dễ khiến người ta chọn nhầm độ phức tạp: `OrderBy(...).First()` là O(n log n) để lấy một phần tử, trong khi một vòng duyệt tìm min là O(n). Cái này không sửa được bằng cách tối ưu cấp phát.
>
> Nên ranh giới của tôi rất rõ: LINQ ở code chạy một lần — editor tool, load màn, UI, test; vòng lặp ở code chạy mỗi frame. Và tôi chỉ xoá LINQ ở chỗ Profiler chỉ ra, kèm số đo trước sau.

**Họ sẽ đào tiếp**

- *"Lambda nào thì không cấp phát?"* → Lambda không bắt biến nào: trình biên dịch cache thành delegate tĩnh. Bắt một biến cục bộ thì mỗi lần gọi là một object mới. `static` lambda của C# 9 biến việc bắt biến thành lỗi biên dịch.
- *"`Where` trả về gì?"* → Một iterator object, chưa duyệt gì. `Where` liền sau `Select` được .NET gộp lại thành một iterator duy nhất, nhưng vẫn là một object mới mỗi lần gọi.
- *"Thay `GroupBy` bằng gì?"* → Một `Dictionary<K, List<V>>` dựng sẵn, mỗi lần dùng thì `Clear()` từng list thay vì tạo mới. Mất vài dòng, đổi lại 0 byte.
- *"Trả `IEnumerable<T>` từ hàm public có vấn đề gì?"* → Nó giấu chi phí: người gọi không biết mỗi lần duyệt là một lần chạy lại, và cũng không biết có được duyệt hai lần không. Trả `List<T>` hoặc nhận buffer thì hợp đồng rõ ràng.
- *"Trong Job/Burst dùng LINQ được không?"* → Không. Job chỉ nhận kiểu blittable và không cho phép delegate hay object tham chiếu — xem [[unity-dots-jobs]].

**Cờ đỏ**

- "LINQ chậm" nói xong rồi dừng, không nêu được nó cấp phát cái gì.
- Xoá LINQ khỏi toàn dự án kể cả editor tool và test, rồi gọi đó là tối ưu.
- Không biết truy vấn duyệt hai lần thì chạy hai lần.
- Viết lại `FirstOrDefault` thành vòng lặp mà quên `break`.
- Nghĩ mọi lambda đều cấp phát, hoặc ngược lại, nghĩ không lambda nào cấp phát.

**Số / ví dụ nên thuộc**

- Một chuỗi `Where → OrderBy → Take → ToArray`: cỡ **vài trăm byte mỗi lần gọi**.
- Máy trạng thái của `yield return`: **~50–70 byte** mỗi lần gọi hàm iterator.
- `OrderBy(...).First()` là **O(n log n)**; vòng tìm min là **O(n)**.
- Lambda không bắt biến: **0 byte** (được cache). Bắt biến: một object mỗi lần chạy.
