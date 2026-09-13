---
id: csharp-collections
title: Collection và độ phức tạp
icon: 🗃
summary: Chọn giữa List, Dictionary, HashSet, Queue theo độ phức tạp chứ không theo thói quen — capacity, rehash, xoá phần tử giữa vòng lặp, và những cấu trúc game cần mà .NET trong Unity không có sẵn.
status: deep
read: 789
level: basic
order: 30
tags: [csharp, collections, performance, data-structures, interview]
related: [csharp-type-system, csharp-linq, csharp-memory, unity-optimization]
refs:
  - "Albahari — C# 10 in a Nutshell, ch.7"
---

Chọn sai collection là chỗ hiếm hoi mà **một dòng code làm chậm cả game**. Tìm một enemy trong `List` 2000 phần tử bằng `Contains` là 2000 phép so sánh; cùng việc đó với `HashSet` là một phép băm. Chạy mỗi frame thì khác biệt đó bằng cả một hệ thống vật lý.

Đây cũng là chủ đề phỏng vấn được hỏi ở mọi mức: junior hỏi "khác nhau thế nào", mid hỏi "chọn cái nào cho tình huống này", senior hỏi "cái gì xảy ra khi nó lớn lên". Ba câu, một kiến thức.

## Bảng tra — thuộc bảng này là đủ cho vòng một

| Cấu trúc | Tra theo chỉ số | Tìm theo giá trị | Thêm cuối | Xoá giữa | Dùng trong game khi |
|---|---|---|---|---|---|
| `T[]` (mảng) | **O(1)** | O(n) | — (cố định) | — | Kích thước biết trước: lưới, buffer, bảng tra |
| `List<T>` | **O(1)** | O(n) | O(1)* | O(n) | Mặc định cho danh sách có thứ tự, số lượng đổi |
| `Dictionary<K,V>` | — | **O(1)** trung bình | O(1)* | O(1) | Tra theo id: `Dictionary<int, Enemy>`, master data |
| `HashSet<T>` | — | **O(1)** trung bình | O(1)* | O(1) | Câu hỏi "có trong tập này không": ô đã thăm, buff đang bật |
| `Queue<T>` | — | O(n) | O(1)* | — | Hàng đợi: BFS tìm đường, hàng chờ sự kiện |
| `Stack<T>` | — | O(n) | O(1)* | — | Object pool, undo, DFS |
| `LinkedList<T>` | O(n) | O(n) | O(1) | O(1) nếu đã có node | **Gần như không bao giờ** — mỗi node là một object cho GC |
| `SortedDictionary<K,V>` | — | O(log n) | O(log n) | O(log n) | Cần duyệt theo thứ tự key |

*O(1) **trung bình đã khấu hao** — thỉnh thoảng một lần thêm phải cấp phát mảng mới và copy toàn bộ. Phần sau nói về đúng cái "thỉnh thoảng" đó.

Hai dòng đáng nhớ nhất: `LinkedList<T>` gần như luôn sai trong game (mỗi phần tử là một object riêng nằm rải rác trên heap — cache miss ở mọi bước duyệt), và `HashSet<T>` bị dùng ít hơn nó đáng được dùng.

## `List<T>` lớn lên bằng cách nào

<figure class="fig">
<svg viewBox="0 0 660 200" role="img" aria-label="Sơ đồ List lớn lên: capacity từ 0 lên 4 lên 8 lên 16, mỗi lần cấp phát mảng mới và copy toàn bộ phần tử, mảng cũ thành rác">
  <text x="20" y="26" class="fig-label" font-size="12" font-weight="600">Add() thứ 5 vào một List đang có Capacity = 4</text>
  <rect x="20" y="40" width="180" height="40" rx="6" fill="#6ea8fe" opacity="0.18"/>
  <text x="30" y="58" class="fig-label" font-size="11">mảng cũ — Capacity 4</text>
  <text x="30" y="73" class="fig-muted" font-size="10">[a][b][c][d]  ← đã đầy</text>
  <line x1="204" y1="60" x2="250" y2="60" class="fig-line" stroke="#ffd43b" stroke-width="2"/>
  <text x="227" y="52" text-anchor="middle" class="fig-muted" font-size="10">1. cấp phát</text>
  <rect x="254" y="34" width="240" height="52" rx="6" fill="#51cf9b" opacity="0.18"/>
  <text x="264" y="52" class="fig-label" font-size="11">mảng mới — Capacity 8</text>
  <text x="264" y="67" class="fig-muted" font-size="10">[a][b][c][d][e][ ][ ][ ]</text>
  <text x="264" y="81" class="fig-muted" font-size="10">2. copy 4 phần tử cũ sang  3. ghi e</text>
  <line x1="110" y1="84" x2="110" y2="118" class="fig-line" stroke="#ff8787" stroke-width="2"/>
  <rect x="20" y="120" width="180" height="34" rx="6" fill="#ff8787" opacity="0.16"/>
  <text x="30" y="141" class="fig-muted" font-size="10">4. mảng cũ thành RÁC cho GC</text>
  <text x="20" y="180" class="fig-muted" font-size="11">Capacity đi theo dãy 0 → 4 → 8 → 16 → 32 … Thêm 1000 phần tử vào List rỗng</text>
  <text x="20" y="194" class="fig-muted" font-size="11">= 9 lần cấp phát và ~2000 lượt copy. new List&lt;T&gt;(1000) = 1 lần, 0 lượt copy.</text>
  <rect x="510" y="110" width="136" height="66" rx="6" class="fig-box"/>
  <text x="578" y="130" text-anchor="middle" class="fig-label" font-size="11">Luật</text>
  <text x="578" y="148" text-anchor="middle" class="fig-muted" font-size="10">Biết trước cỡ bao nhiêu</text>
  <text x="578" y="164" text-anchor="middle" class="fig-muted" font-size="10">thì khai trong constructor.</text>
</svg>
<figcaption>Mỗi lần vượt capacity là một mảng mới, một lượt copy, và một mảng cũ thành rác. Khai trước dung lượng là tối ưu rẻ nhất trong C#: sửa một chỗ, không đổi logic.</figcaption>
</figure>

```csharp
var list = new List<Enemy>(256);       // biết trước cỡ nào thì khai cỡ đó
list.Clear();                          // giữ nguyên capacity — dùng lại được, không cấp phát
list.TrimExcess();                     // trả lại chỗ thừa — chỉ gọi khi thật sự cần
```

`Clear()` **không** trả lại bộ nhớ; nó chỉ đặt `Count = 0`. Đó là tính năng chứ không phải lỗi: một buffer dùng lại mỗi frame nên được `Clear()` chứ đừng `new` lại.

## `Dictionary` tra cứu bằng cách nào, và hỏng ở đâu

Ba bước: băm key → lấy dư cho số bucket → đi theo chuỗi trong bucket đó so sánh bằng `Equals`. Hệ quả:

- **O(1) là trung bình, không phải đảm bảo.** Hash tệ làm mọi key rơi vào một bucket → tụt về O(n).
- **Hash phải ổn định.** Key là object mà bạn sửa field tham gia vào hash sau khi đã thêm vào dictionary → không bao giờ tìm lại được nó. Đây là lý do key nên là kiểu bất biến.
- **Struct làm key thì phải có `IEquatable<T>`**, nếu không mỗi lần tra là một lần so sánh qua reflection — xem [[csharp-type-system]].
- **Thứ tự duyệt không được đảm bảo.** Đừng viết code phụ thuộc vào nó, kể cả khi thực tế nó ổn định.

```csharp
// SAI: hai lần tra cứu cho một câu hỏi
if (map.ContainsKey(id)) { var e = map[id]; e.Tick(); }

// ĐÚNG: một lần
if (map.TryGetValue(id, out var e)) e.Tick();
```

`TryGetValue` là câu trả lời cho một câu hỏi phỏng vấn hay gặp và cũng là thói quen nên có sẵn trong tay.

## Xoá phần tử — ba cách và cái giá

```csharp
// 1) Xoá giữa vòng lặp foreach: NÉM EXCEPTION
foreach (var e in enemies) if (e.dead) enemies.Remove(e);     // InvalidOperationException

// 2) Duyệt ngược: đúng, nhưng RemoveAt là O(n) vì phải dồn mảng
for (int i = enemies.Count - 1; i >= 0; i--)
    if (enemies[i].dead) enemies.RemoveAt(i);

// 3) Swap-back: O(1) mỗi lần xoá — dùng khi THỨ TỰ KHÔNG QUAN TRỌNG
for (int i = enemies.Count - 1; i >= 0; i--)
    if (enemies[i].dead)
    {
        enemies[i] = enemies[enemies.Count - 1];   // kéo phần tử cuối lấp vào
        enemies.RemoveAt(enemies.Count - 1);       // xoá ở cuối: không phải dồn gì
    }
```

Cách 3 là mẹo dùng ở khắp nơi trong code game — danh sách enemy đang sống, đạn đang bay, particle. Điều kiện duy nhất là bạn không cần giữ thứ tự. Nói được nó trong phỏng vấn là một điểm cộng rẻ.

## Sắp xếp: `Sort` với `OrderBy`

| | `list.Sort()` | `list.OrderBy(...)` (LINQ) |
|---|---|---|
| Thuật toán | Introsort tại chỗ | Sinh mảng mới rồi sắp |
| Ổn định (giữ thứ tự phần tử bằng nhau) | **Không** | **Có** |
| Cấp phát | ~0 nếu truyền comparer đã cache | Mảng mới + delegate + key |
| Dùng khi | Trong gameplay, mỗi frame | Ngoài gameplay: bảng xếp hạng, UI |

```csharp
// Cache comparer: truyền lambda thẳng vào Sort tạo một delegate mới mỗi lần gọi
static readonly Comparison<Enemy> ByDistance = (a, b) => a.dist.CompareTo(b.dist);
enemies.Sort(ByDistance);
```

"Không ổn định" nghĩa là hai enemy cùng khoảng cách có thể đổi chỗ nhau giữa các lần sắp — UI nhấp nháy không rõ lý do thường là từ đây. Cần ổn định thì thêm một khoá phụ (id) vào phép so sánh.

## Những thứ .NET trong Unity **không** có

Đây là phần hay làm người quen .NET mới nhất bị hụt chân, vì Unity 6 còn ở .NET Standard 2.1:

| Thứ bạn muốn | Có trong .NET 6+ | Trong Unity 6 |
|---|---|---|
| `PriorityQueue<T, TPriority>` | Có | **Không** — tự viết binary heap cho A* |
| `CollectionsMarshal.AsSpan(list)` | Có | **Không** |
| `Dictionary` serialize ra Inspector | — | **Không** — Unity không serialize `Dictionary` |
| Collection cho Job/Burst | — | `NativeArray`, `NativeList` trong package Collections, **phải `Dispose`** |

Hai đường vòng hay dùng: A* thì tự viết heap khoảng 60 dòng (hoặc dùng cấu trúc có sẵn trong package pathfinding); dictionary cần lưu vào save thì giữ hai `List` song song rồi ghép lại trong `ISerializationCallbackReceiver` — xem [[unity-save-data]].

## Lưới 2D: mảng phẳng thắng mảng hai chiều

```csharp
// Chậm hơn: mảng hai chiều thật sự, mỗi truy cập là một lần gọi hàm nội bộ + kiểm biên
int[,] grid2D = new int[64, 64];
int v = grid2D[x, y];

// Nhanh hơn: mảng phẳng, tính chỉ số bằng phép nhân
int[] grid = new int[64 * 64];
int v2 = grid[y * 64 + x];
```

Với lưới duyệt mỗi frame (pathfinding, fog of war, tilemap), mảng phẳng nhanh hơn đáng kể và còn truyền được vào Job. Mảng jagged `int[][]` thì linh hoạt nhưng mỗi hàng là một object riêng — rải rác trên heap.

## Bẫy còn lại

- **`foreach` trên `List<T>` không cấp phát** (enumerator là struct), nhưng `foreach` trên biến kiểu `IEnumerable<T>` thì có (boxing enumerator). Chi tiết ở [[csharp-linq]].
- **`Dictionary` không phải cấu trúc "nhớ thứ tự thêm vào"** — cần thứ tự thì giữ thêm một `List<K>`.
- **`List.Contains` trong vòng lặp** là O(n²) trá hình: 500 phần tử kiểm chéo nhau là 250.000 phép so sánh mỗi frame. Đổi sang `HashSet`.
- **Khai capacity quá tay** cũng là phí: `new List<T>(100000)` cho 10 phần tử là 800KB nằm không.
- **`Queue<T>`/`Stack<T>` cũng có capacity** và cũng grow theo cùng cơ chế — khai trước nếu biết cỡ.
- **Xoá trong `Dictionary` không co mảng lại**: bộ nhớ vẫn giữ nguyên cho tới khi bạn tạo cái mới.

## Kiểm tra nhanh

- [ ] Mọi `List`/`Dictionary` có kích thước đoán được đều khai capacity trong constructor
- [ ] Buffer dùng mỗi frame được `Clear()` và dùng lại, không `new` lại
- [ ] Không có `Contains` trên `List` trong vòng lặp nóng — đã đổi sang `HashSet`
- [ ] Xoá nhiều phần tử trong gameplay dùng swap-back, không `RemoveAt` giữa mảng
- [ ] Comparer truyền cho `Sort` được cache vào `static readonly`, không viết lambda tại chỗ
- [ ] Không code nào phụ thuộc vào thứ tự duyệt `Dictionary`

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc chọn cấu trúc dữ liệu**

Đây là chủ đề AI trả lời tốt **nếu** bạn cho nó đúng ba con số: bao nhiêu phần tử, thao tác nào chạy bao nhiêu lần mỗi frame, và có cần giữ thứ tự không. Thiếu ba con số đó thì nó trả về câu trả lời sách giáo khoa ("dùng Dictionary cho tra cứu nhanh") — đúng mà vô dụng.

Việc nó làm tốt nhất là **viết lại một đoạn duyệt tuyến tính thành cấu trúc tra cứu**, và **sinh cấu trúc .NET không có sẵn trong Unity** (binary heap cho A*, ring buffer, spatial hash grid) kèm test. Việc nó làm kém là ước lượng xem có đáng đổi hay không — nó sẽ đổi mọi thứ sang `Dictionary` kể cả khi n = 8, lúc mà duyệt mảng còn nhanh hơn vì nằm liền trong cache.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **n bao nhiêu** — 8, 500 hay 50.000. Dưới ~16 phần tử thì mảng thường thắng mọi cấu trúc băm.
- **Thao tác nào nóng**: thêm, xoá, tra cứu, hay duyệt toàn bộ. Mỗi thao tác chọn ra một cấu trúc khác.
- **Có cần thứ tự không** — quyết định swap-back có dùng được không.
- **Chạy mỗi frame hay mỗi lần load** — quyết định có được phép cấp phát không.
- **Unity hay .NET thường** — `PriorityQueue` và `CollectionsMarshal` không có trong Unity.

**Mẫu prompt**

```
Unity 6 (C# 9, .NET Standard 2.1). Vòng lặp dưới đây chạy MỖI FRAME với n ≈ 800.

<dán code>

Số liệu: Profiler báo 3.1 ms và 12 KB alloc mỗi frame ở hàm này.
Thao tác nóng: kiểm tra "id này đã xử lý chưa" và xoá phần tử đã chết.
Thứ tự phần tử KHÔNG quan trọng.

Việc:
1. Chỉ ra thao tác nào đang là O(n) hoặc O(n²) và vì sao.
2. Đề xuất cấu trúc thay thế, kèm ước lượng số phép tính trước/sau.
3. Viết lại, khai capacity, dùng swap-back nếu hợp.

Ràng buộc:
- KHÔNG dùng PriorityQueue, CollectionsMarshal, hay API .NET 6+
- KHÔNG cấp phát trong vòng lặp
- Nếu n nhỏ tới mức không đáng đổi thì NÓI THẲNG là không đáng
```

**Bẫy thường gặp:** AI đổi mọi thứ sang `Dictionary` kể cả khi n = 10 — với n nhỏ, một mảng nằm liền trong cache thắng cả về tốc độ lẫn bộ nhớ. Bẫy thứ hai: nó đề xuất `PriorityQueue<T,TP>` hoặc `CollectionsMarshal` vì mặc định .NET 6+, hai thứ đó không tồn tại trong Unity. Bẫy thứ ba: nó viết `list.Sort((a,b) => ...)` trong `Update` — mỗi lần gọi là một delegate mới, bắt nó cache vào `static readonly`.

## 💻 Code

Demo đo bốn thứ hay bị đoán sai: `List.Contains` so với `HashSet.Contains`, khai capacity trước so với để nó tự lớn, `RemoveAt` so với swap-back, và `ContainsKey`+indexer so với `TryGetValue`. Chạy bằng `dotnet run`.

**Script**

```csharp
// Program.cs — .NET 6+ (dotnet new console && dotnet run)
// Mọi con số in ra đều là so sánh tương đối trên cùng một máy, không phải chuẩn tuyệt đối.
using System;
using System.Collections.Generic;
using System.Diagnostics;

static class Program
{
    const int N = 20_000;       // số phần tử
    const int Probes = 50_000;  // số lần tra cứu

    static void Main()
    {
        var rng = new Random(1);
        var ids = new int[N];
        for (int i = 0; i < N; i++) ids[i] = i * 3;

        var list = new List<int>(ids);
        var set = new HashSet<int>(ids);
        var map = new Dictionary<int, int>(N);
        foreach (var id in ids) map[id] = id;

        // 1) tìm trong List (O(n)) so với HashSet (O(1))
        var sw = Stopwatch.StartNew();
        int hits = 0;
        for (int i = 0; i < Probes; i++) if (list.Contains(rng.Next(N * 3))) hits++;
        long listMs = sw.ElapsedMilliseconds;

        sw.Restart();
        hits = 0;
        for (int i = 0; i < Probes; i++) if (set.Contains(rng.Next(N * 3))) hits++;
        long setMs = sw.ElapsedMilliseconds;

        Console.WriteLine($"Contains {Probes} lần trên {N} phần tử:");
        Console.WriteLine($"  List<int>    : {listMs} ms");
        Console.WriteLine($"  HashSet<int> : {setMs} ms   <- cùng câu hỏi, khác cấu trúc\n");

        // 2) capacity: để tự lớn so với khai trước
        long before = GC.GetTotalAllocatedBytes(true);
        var grow = new List<int>();
        for (int i = 0; i < N; i++) grow.Add(i);
        long growBytes = GC.GetTotalAllocatedBytes(true) - before;

        before = GC.GetTotalAllocatedBytes(true);
        var pre = new List<int>(N);
        for (int i = 0; i < N; i++) pre.Add(i);
        long preBytes = GC.GetTotalAllocatedBytes(true) - before;

        Console.WriteLine($"Thêm {N} phần tử:");
        Console.WriteLine($"  List rỗng      : {growBytes / 1024} KB cấp phát (mảng cũ thành rác mỗi lần grow)");
        Console.WriteLine($"  List({N}) : {preBytes / 1024} KB — một lần duy nhất\n");

        // 3) RemoveAt giữa mảng so với swap-back
        Console.WriteLine($"Xoá ~50% phần tử khỏi List {N}:");
        Console.WriteLine($"  RemoveAt  : {TimeRemoveAt(ids)} ms  (mỗi lần xoá phải dồn mảng)");
        Console.WriteLine($"  swap-back : {TimeSwapBack(ids)} ms  (thứ tự bị đảo — chấp nhận được với enemy/đạn)\n");

        // 4) ContainsKey + indexer so với TryGetValue
        sw.Restart();
        long sum = 0;
        for (int i = 0; i < Probes; i++) { int k = ids[i % N]; if (map.ContainsKey(k)) sum += map[k]; }
        long twoLookups = sw.ElapsedMilliseconds;

        sw.Restart();
        sum = 0;
        for (int i = 0; i < Probes; i++) { int k = ids[i % N]; if (map.TryGetValue(k, out var v)) sum += v; }
        long oneLookup = sw.ElapsedMilliseconds;

        Console.WriteLine($"Dictionary {Probes} lần đọc:");
        Console.WriteLine($"  ContainsKey + indexer : {twoLookups} ms  (hai lần băm)");
        Console.WriteLine($"  TryGetValue           : {oneLookup} ms  (một lần)");
        Console.WriteLine($"(hits={hits}, sum={sum} — giữ để trình biên dịch không cắt vòng lặp)");
    }

    static long TimeRemoveAt(int[] src)
    {
        var l = new List<int>(src);
        var sw = Stopwatch.StartNew();
        for (int i = l.Count - 1; i >= 0; i--) if (l[i] % 2 == 0) l.RemoveAt(i);
        sw.Stop();
        return sw.ElapsedMilliseconds;
    }

    static long TimeSwapBack(int[] src)
    {
        var l = new List<int>(src);
        var sw = Stopwatch.StartNew();
        for (int i = l.Count - 1; i >= 0; i--)
            if (l[i] % 2 == 0) { l[i] = l[l.Count - 1]; l.RemoveAt(l.Count - 1); }
        sw.Stop();
        return sw.ElapsedMilliseconds;
    }
}
```

**Chạy thử**
- Phần 1: `HashSet` nhanh hơn `List` **hàng trăm lần** ở n = 20.000. Giảm `N` xuống 16 rồi chạy lại — khoảng cách gần như biến mất, và đó là bài học quan trọng hơn: **n nhỏ thì mảng thắng**.
- Phần 2: `List` rỗng cấp phát gấp khoảng **2 lần** so với khai trước, vì mọi mảng trung gian đều thành rác.
- Phần 3: swap-back nhanh hơn `RemoveAt` rõ rệt và khoảng cách giãn ra theo n, vì `RemoveAt` phải dồn phần đuôi sau mỗi lần xoá.
- Phần 4: `TryGetValue` nhanh hơn cỡ **1.5–2 lần** — cùng kết quả, một nửa số lần băm.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`List<T>` và mảng khác nhau thế nào?**
  → Mảng có kích thước cố định, `List<T>` là một class bọc mảng đó và tự cấp mảng lớn hơn khi đầy. Tra theo chỉ số thì cả hai O(1). Khác biệt thực tế là `List` cho phép thêm/xoá, đổi lại có thêm một tầng gián tiếp và những lần grow tốn kém. Và với struct thì mảng sửa tại chỗ được còn `List` thì không, vì indexer trả về bản sao.
- `Junior` **Khi nào dùng `Dictionary`, khi nào dùng `HashSet`?**
  → `Dictionary` khi cần ánh xạ key sang một giá trị — ví dụ `id` sang đối tượng enemy. `HashSet` khi chỉ cần trả lời "có trong tập này không" — ô đã thăm khi tìm đường, danh sách buff đang bật. Cả hai O(1) trung bình; `HashSet` tốn ít bộ nhớ hơn vì không lưu value.
- `Junior` **Xoá phần tử trong lúc `foreach` thì sao?**
  → Ném `InvalidOperationException`, vì enumerator phát hiện collection đã đổi. Cách đúng là duyệt ngược bằng chỉ số, hoặc gom danh sách cần xoá rồi xoá sau vòng lặp.
- `Mid` **`List<T>` lớn lên bằng cách nào, và vì sao nên khai capacity?**
  → Capacity đi theo dãy 0 → 4 → 8 → 16, mỗi lần vượt là **cấp phát mảng mới, copy toàn bộ, mảng cũ thành rác**. Thêm 1000 phần tử vào list rỗng là 9 lần cấp phát và khoảng 2000 lượt copy. Khai `new List<T>(1000)` biến tất cả thành một lần cấp phát — tối ưu rẻ nhất trong C# vì không đổi một dòng logic nào.
- `Mid` **Xoá nhiều phần tử giữa danh sách trong gameplay, anh làm thế nào?**
  → Swap-back: đưa phần tử cuối vào chỗ vừa xoá rồi cắt đuôi, O(1) mỗi lần thay vì O(n) của `RemoveAt`. Điều kiện là thứ tự không quan trọng, mà với danh sách enemy đang sống hay đạn đang bay thì đúng là không quan trọng. Cần giữ thứ tự thì duyệt ngược và chấp nhận chi phí dồn mảng.
- `Mid` **`Dictionary` có luôn O(1) không?**
  → Không, đó là **trung bình**. Hash tệ làm mọi key rơi vào một bucket và tụt về O(n). Hai chỗ hay hỏng trong thực tế: struct làm key mà không implement `IEquatable<T>` nên phải so sánh qua reflection, và `GetHashCode` chỉ dựa trên một field nên trùng bucket hàng loạt.
- `Mid` **`Sort` và `OrderBy` khác nhau ở đâu?**
  → `Sort` sắp tại chỗ, không cấp phát nếu comparer đã cache, nhưng **không ổn định**. `OrderBy` ổn định nhưng sinh mảng mới cộng delegate cộng key — không dùng trong gameplay. Không ổn định nghĩa là hai phần tử bằng nhau có thể đổi chỗ giữa các lần sắp, và đó là nguyên nhân kinh điển của bảng UI nhấp nháy.
- `Senior` **n = 10 thì `Dictionary` có nhanh hơn mảng không?**
  → Thường là không. Dưới cỡ 16 phần tử, duyệt tuyến tính trên một mảng liền thắng, vì toàn bộ dữ liệu nằm trong một hai dòng cache còn băm thì phải tính hash và nhảy tới bucket ở chỗ khác. Đây là ví dụ điển hình cho chuyện độ phức tạp tiệm cận không trả lời được câu hỏi ở n nhỏ — phải đo.
- `Senior` **Cấu trúc nào .NET trong Unity không có mà game hay cần?**
  → `PriorityQueue<T,TPriority>` là ví dụ đau nhất — nó có từ .NET 6 còn Unity 6 ở .NET Standard 2.1, nên làm A* là phải tự viết binary heap. Ngoài ra `CollectionsMarshal.AsSpan` để sửa `List<struct>` tại chỗ cũng không có, và `Dictionary` thì Unity không serialize được nên phải tách thành hai list song song khi lưu.

**Khung trả lời 60 giây** — "Anh chọn collection dựa trên cái gì?"

> Ba câu hỏi, theo thứ tự. Thứ nhất: **thao tác nào chạy nhiều nhất** — tra cứu, thêm, xoá hay duyệt hết. Thứ hai: **n bao nhiêu**. Thứ ba: **có cần giữ thứ tự không**.
>
> Ra được ba câu đó thì lựa chọn gần như tự hiện. Tra theo id nhiều thì `Dictionary`. Chỉ hỏi "có hay không" thì `HashSet`. Duyệt tuần tự và thêm ở cuối thì `List`. Và nếu n dưới cỡ 16 thì tôi để nguyên mảng, vì ở cỡ đó cache thắng thuật toán — băm còn chậm hơn duyệt thẳng.
>
> Hai thói quen đi kèm mà tôi luôn làm: **khai capacity** khi đoán được số lượng, vì mỗi lần `List` grow là một mảng mới cộng một lượt copy cộng rác; và **swap-back** khi xoá nhiều phần tử mà thứ tự không quan trọng, để mỗi lần xoá là O(1) thay vì O(n).

**Họ sẽ đào tiếp**

- *"Vì sao n nhỏ thì mảng thắng?"* → Vì dữ liệu nằm liền nhau, một hai lần nạp cache là xong, trong khi băm phải tính hash rồi nhảy tới bucket nằm chỗ khác. Ngưỡng thực tế khoảng 8–16 phần tử, và cách duy nhất để chắc là đo.
- *"`Clear()` có trả lại bộ nhớ không?"* → Không, nó chỉ đặt `Count = 0` và giữ nguyên capacity. Đó là lý do buffer dùng mỗi frame nên `Clear()` rồi dùng lại. Muốn trả lại thật thì `TrimExcess()`.
- *"Swap-back hỏng ở đâu?"* → Ở chỗ cần thứ tự — hàng đợi lượt đánh, danh sách UI có sắp xếp. Và nếu code khác đang giữ chỉ số vào list đó thì chỉ số sẽ trỏ nhầm phần tử sau khi swap.
- *"Struct làm key `Dictionary` cần gì?"* → `IEquatable<T>` và `GetHashCode` trộn đều nhiều field. Không có thì mỗi lần tra đi qua `ValueType.Equals` bằng reflection — chậm hàng chục lần và sinh rác.
- *"`foreach` trên `List` có cấp phát không?"* → Không, vì enumerator của `List<T>` là struct. Có cấp phát khi biến được khai kiểu `IEnumerable<T>`, lúc đó enumerator bị boxing.

**Cờ đỏ**

- Trả lời "dùng `Dictionary` cho nhanh" mà không hỏi n bao nhiêu.
- Không biết `List` grow bằng cách nhân đôi và copy.
- Dùng `LinkedList<T>` trong game vì "xoá giữa nhanh" — quên rằng mỗi node là một object rải rác trên heap.
- Khẳng định `Dictionary` luôn O(1), không nêu được trường hợp tụt về O(n).
- Viết `list.Sort((a,b) => ...)` trong `Update` và không thấy delegate mới mỗi frame.

**Số / ví dụ nên thuộc**

- `List<T>` grow: **0 → 4 → 8 → 16…**, mỗi lần là cấp phát mới + copy toàn bộ.
- Ngưỡng mảng thắng cấu trúc băm: khoảng **8–16 phần tử**.
- `Contains` trên `List` là **O(n)**, trên `HashSet` là **O(1)** trung bình.
- Swap-back: **O(1)** mỗi lần xoá, đổi lại mất thứ tự.
- `PriorityQueue` và `CollectionsMarshal`: **không có** trong Unity 6.
