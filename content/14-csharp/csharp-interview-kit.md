---
id: csharp-interview-kit
title: Bộ đề phỏng vấn C#
icon: 🎯
summary: Vòng phỏng vấn Unity gồm những gì, lộ trình ôn bảy ngày, sáu bài live-coding hay gặp kèm lời giải chạy được, công thức trả lời bốn bước và bảng tự chấm theo mức junior/mid/senior.
status: deep
read: 798
level: intermediate
order: 120
tags: [csharp, interview, career, live-coding, checklist]
related: [csharp-type-system, csharp-collections, csharp-delegate-event, project-postmortem]
---

Mười một node trước dạy kiến thức. Node này dạy **cách kiến thức đó bị hỏi lại** — vì hai việc đó khác nhau, và người trượt phỏng vấn thường không phải người thiếu kiến thức mà là người chưa bao giờ phải nói nó ra miệng trong 60 giây.

## Một vòng phỏng vấn Unity thường gồm gì

| Vòng | Dài | Hỏi gì | Trượt vì |
|---|---|---|---|
| **Sàng lọc** (HR hoặc lead) | 20–30 phút | Dự án gần nhất, vai trò, engine, quy mô đội | Không kể được dự án thành một hệ thống, không có con số nào |
| **Kỹ thuật C#** | 45–60 phút | `struct`/`class`, collection, delegate/event, GC, async | Trả lời định nghĩa mà không nêu được cơ chế |
| **Kỹ thuật Unity** | 45–60 phút | Vòng đời, prefab, vật lý, tối ưu, Profiler | Nói "tôi tối ưu bằng cách gộp draw call" mà không có số đo |
| **Live coding / bài về nhà** | 60 phút – 2 ngày | Một cấu trúc nhỏ hoàn chỉnh, hoặc một gameplay mini | Code chạy nhưng không nói được đánh đổi |
| **Thiết kế hệ thống** (mid trở lên) | 45–60 phút | Kiến trúc một tính năng: inventory, matchmaking, save | Nhảy vào code trước khi hỏi ràng buộc |

Hai vòng giữa là nơi nhánh này có ích nhất. Vòng live coding thì xem phần "sáu bài" phía dưới.

## Lộ trình bảy ngày

Giả định bạn đã làm Unity được một thời gian và cần **ôn để nói ra được**, không phải học từ đầu.

| Ngày | Đọc | Làm |
|---|---|---|
| 1 | [[csharp-type-system]] | Viết lại `GridPos` có `IEquatable<T>` mà không nhìn tài liệu |
| 2 | [[csharp-collections]] + [[csharp-linq]] | Chạy hai demo đo; nhớ ba con số: grow của `List`, ngưỡng n nhỏ, chi phí `OrderBy().First()` |
| 3 | [[csharp-delegate-event]] | Tự kể lại cơ chế rò rỉ trong 60 giây, có vẽ chiều tham chiếu |
| 4 | [[csharp-memory]] + [[unity-csharp-memory]] | Mở Profiler một dự án cũ, tìm cho ra một chỗ alloc mỗi frame |
| 5 | [[csharp-async]] + [[csharp-exception-null]] | Giải thích được deadlock `.Result` và null giả, không nhìn giấy |
| 6 | Sáu bài live-coding ở node này | Code tay hai bài, bấm giờ 25 phút mỗi bài |
| 7 | [[project-postmortem]] | Viết ra câu chuyện dự án: vai trò, khó khăn, con số, đánh đổi |

Ngày 7 quan trọng ngang sáu ngày đầu cộng lại: câu hỏi mở màn hầu như luôn là *"kể về một dự án anh đã làm"*, và trả lời tệ ở đó thì mọi câu sau đều bị hỏi với thái độ nghi ngờ.

## Sáu bài live-coding hay gặp

| # | Đề | Họ chấm cái gì | Bẫy chết người |
|---|---|---|---|
| 1 | **`Pool<T>`** — pool object tái sử dụng | Bạn có nghĩ tới trả về hai lần, tới prewarm, tới reset trạng thái không | Không reset object lúc trả về ⇒ bug "đạn cũ còn tốc độ cũ" |
| 2 | **Event bus** có huỷ đăng ký an toàn | Vòng đời đăng ký, và huỷ đăng ký **trong lúc** đang bắn sự kiện | Duyệt trực tiếp danh sách listener ⇒ vỡ khi có ai đó `-=` giữa chừng |
| 3 | **Deep copy / shallow copy** | Bạn có phân biệt được copy tham chiếu với copy dữ liệu | `MemberwiseClone` rồi gọi đó là deep copy |
| 4 | **LRU cache** dung lượng cố định | Chọn cấu trúc: `Dictionary` + danh sách liên kết, O(1) cả đọc lẫn ghi | Duyệt tìm phần tử cũ nhất ⇒ O(n) mỗi lần |
| 5 | **Binary heap** cho A* | Bạn biết Unity **không có** `PriorityQueue` | Dùng `List.Sort()` mỗi lần lấy phần tử nhỏ nhất ⇒ O(n log n) mỗi bước |
| 6 | **Xoá nhiều phần tử** khỏi danh sách đang duyệt | Swap-back, duyệt ngược, hiểu vì sao `foreach` ném exception | `foreach` + `Remove` ⇒ `InvalidOperationException` |

Lời giải đầy đủ cho cả sáu bài nằm ở mục 💻 Code của node này.

Cách làm bài quan trọng ngang lời giải. Bốn bước, theo đúng thứ tự:

1. **Hỏi lại ràng buộc trước khi viết dòng nào.** "Có cần an toàn nhiều thread không? n cỡ bao nhiêu? Thứ tự có quan trọng không?" — người phỏng vấn chờ đúng ba câu này.
2. **Nói ra cấu trúc dữ liệu và độ phức tạp** trước khi gõ: "tôi dùng `Dictionary` cộng một danh sách liên kết để cả `Get` lẫn `Put` là O(1)".
3. **Viết bản chạy được trước**, tối ưu sau. Bản chạy được có comment ở chỗ biết là chưa tối ưu thì mạnh hơn bản tối ưu dở dang.
4. **Tự nêu trường hợp biên**: rỗng, một phần tử, trả về hai lần, huỷ giữa chừng. Nêu ra trước khi bị hỏi là điểm cộng lớn nhất trong cả bài.

## Công thức trả lời một câu hỏi C#

Bốn bước, khoảng 45–60 giây. Đủ sâu để thuyết phục, đủ ngắn để không bị cắt lời:

| Bước | Nội dung | Ví dụ với "`struct` khác `class` thế nào" |
|---|---|---|
| 1. **Định nghĩa** | Một câu, thẳng vào câu hỏi | "`struct` là value type, gán là copy dữ liệu; `class` là reference type, gán là copy tham chiếu." |
| 2. **Cơ chế** | Vì sao lại thế, ở mức runtime | "Nên struct không do GC quản, còn mỗi class là một object trên heap kèm ~16 byte header." |
| 3. **Ví dụ game** | Chỗ nó xuất hiện thật | "`Vector3` là struct, nên `transform.position.x = 5` không biên dịch vì `position` trả về bản sao." |
| 4. **Đánh đổi** | Khi nào chọn cái nào, và cái giá | "Struct nhỏ dưới 32 byte thì lợi; nhưng chỉ cần ép sang interface là boxing, mất hết lợi ích." |

Thiếu bước 2 thì nghe như học thuộc. Thiếu bước 4 thì nghe như chưa từng gặp vấn đề thật. Hai bước đó là chỗ phân biệt mức.

## Bảng tự chấm

Đánh dấu thật thà. Mỗi dòng là một thứ người phỏng vấn ở mức đó **mong bạn tự nói ra mà không cần gợi ý**.

**Junior — cần trả lời được hết**

- [ ] `struct` với `class`, và ba chỗ struct không nằm trên stack
- [ ] `List` / `Dictionary` / `HashSet` chọn theo cái gì
- [ ] `Action` / `Func` / `event`, và vì sao `event` chặt hơn field
- [ ] Vì sao xoá phần tử trong `foreach` lại ném exception
- [ ] Vòng đời `Awake` / `OnEnable` / `Start` / `Update` của Unity
- [ ] Đọc được stack trace và nói được lỗi nằm ở dòng nào

**Mid — thêm những dòng này**

- [ ] Boxing xảy ra ở đâu, tốn bao nhiêu, đo bằng gì
- [ ] Sự kiện gây rò rỉ thế nào, và cặp `OnEnable`/`OnDisable`
- [ ] `List` grow ra sao, vì sao khai capacity
- [ ] Vì sao LINQ không dùng trong `Update`, và viết lại thành gì
- [ ] `async/await` không tạo thread, `.Result` treo vì sao
- [ ] Null giả của Unity, và vì sao `?.` sai với Unity object
- [ ] Quy trình tối ưu: đo → chọn hàm → sửa → đo lại

**Senior — thêm những dòng này**

- [ ] Generic biên dịch khác nhau cho class và struct, hệ quả trên IL2CPP
- [ ] Khi nào chấp nhận code xấu, và bằng chứng nào cho phép
- [ ] Ranh giới dữ liệu giữa thread nền và main thread trong một hệ thống thật
- [ ] Ba quyết định kiến trúc bạn từng chốt và cái giá của chúng
- [ ] Chỗ bạn từng sai, phát hiện thế nào, sửa ra sao
- [ ] Dạy lại được một chủ đề trong nhánh này cho người junior

## Câu nên hỏi lại họ

Cuối buổi luôn có "anh có câu hỏi gì không", và câu bạn hỏi nói lên nhiều thứ về bạn:

- "Đội đang đo hiệu năng bằng gì, và ngưỡng nào thì coi là không đạt?"
- "Bản build được test trên thiết bị yếu nhất nào, và bao lâu một lần?"
- "Quy trình review code thế nào, ai duyệt phần gameplay?"
- "Dự án hiện tại nợ kỹ thuật ở đâu nhiều nhất?"
- "Nếu tôi vào, ba tháng đầu được giao gì?"

Ba câu đầu cho bạn biết đội có kỷ luật kỹ thuật hay không — và đó là thông tin bạn thật sự cần.

## Bẫy phổ biến

- **Trả lời câu C# bằng câu Unity.** Hỏi `struct`/`class` mà kể về `ScriptableObject` là dấu hiệu học theo công thức.
- **Nói "còn tuỳ" rồi dừng.** Còn tuỳ vào cái gì — nêu ra, rồi chọn một hướng và bảo vệ nó.
- **Kể dự án không có số.** Bao nhiêu người, bao lâu, bao nhiêu người chơi, fps bao nhiêu, tối ưu từ mấy ms xuống mấy ms.
- **Giấu chỗ không biết.** "Tôi chưa làm phần đó, nhưng tôi đoán nó hoạt động thế này, và tôi sẽ kiểm bằng cách…" mạnh hơn hẳn một câu trả lời bịa.
- **Chê đội cũ.** Nói về vấn đề kỹ thuật thì được, nói về người thì không.
- **Học thuộc mà không chạy code.** Mọi node trong nhánh này đều có demo chạy được; chạy một lần nhớ lâu hơn đọc mười lần.

## 🤖 Prompt cho AI

**Dùng AI thế nào để luyện phỏng vấn**

Sai lầm phổ biến nhất là bảo AI "cho tôi 50 câu hỏi phỏng vấn C# kèm đáp án" rồi ngồi đọc. Đọc đáp án tạo **cảm giác** đã thuộc, và cảm giác đó vỡ ngay khi phải nói ra miệng trước người lạ. Cách dùng đúng là bắt AI đóng vai người phỏng vấn thật: **hỏi từng câu một, chờ bạn trả lời, chấm, rồi đào tiếp** — đúng như người thật sẽ làm.

Ba chế độ luyện, dùng lần lượt trong tuần:

| Chế độ | Câu mở đầu | Mục đích |
|---|---|---|
| **Hỏi đáp một-một** | "Đóng vai người phỏng vấn mid-level. Hỏi tôi từng câu một, chờ tôi trả lời rồi mới hỏi tiếp." | Luyện nói, phát hiện chỗ hổng |
| **Chấm câu trả lời** | "Đây là câu trả lời của tôi: … Chấm theo 4 tiêu chí: định nghĩa, cơ chế, ví dụ, đánh đổi." | Biết mình thiếu bước nào |
| **Đào sâu** | "Tôi trả lời thế này. Hãy hỏi lại 3 câu khó nhất mà người phỏng vấn sẽ hỏi tiếp." | Chuẩn bị cho phần "họ sẽ đào tiếp" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Mức nhắm tới**: junior / mid / senior. Không nói thì AI hỏi ở mức trung bình vô thưởng vô phạt.
- **Vị trí và stack**: gameplay Unity mobile khác hẳn tools/engine programmer.
- **Thời lượng mong muốn** cho mỗi câu trả lời — 60 giây là chuẩn thực tế.
- **Bắt nó chấm gắt.** Không nói thì nó khen mọi câu trả lời, và đó là phản hồi vô dụng.

**Mẫu prompt**

```
Đóng vai người phỏng vấn kỹ thuật cho vị trí Unity gameplay programmer mức MID.

Luật:
- Hỏi TỪNG CÂU MỘT. Hỏi xong thì DỪNG và chờ tôi trả lời.
- Sau mỗi câu trả lời của tôi: chấm theo 4 tiêu chí (định nghĩa / cơ chế /
  ví dụ game / đánh đổi), nêu rõ tôi THIẾU cái gì, rồi hỏi một câu đào sâu.
- Chấm GẮT như người phỏng vấn thật. KHÔNG khen xã giao.
- Nếu tôi trả lời sai về cơ chế, nói thẳng là sai và giải thích đúng.

Chủ đề: value type, collection, delegate/event, GC, async trong Unity.
Bắt đầu bằng câu đầu tiên, đừng liệt kê trước danh sách câu hỏi.
```

**Bẫy thường gặp:** AI khen mọi câu trả lời — "rất tốt, bạn đã nắm được ý chính" — kể cả khi bạn nói sai cơ chế; phải yêu cầu chấm gắt bằng chữ. Bẫy thứ hai: nó đưa cả danh sách 50 câu kèm đáp án ngay lần trả lời đầu, biến buổi luyện nói thành buổi đọc. Bẫy thứ ba: nó bịa con số ("boxing tốn 32 byte", "LINQ chậm hơn 40 lần") — mọi con số bạn định mang vào phòng phỏng vấn phải tự đo hoặc lấy từ node có số đo thật.

## 💻 Code

Lời giải cho cả sáu bài live-coding, trong một file chạy được. Đây là code để **đọc rồi tự viết lại**, không phải để chép — trong phòng phỏng vấn không ai cho bạn dán.

**Script**

```csharp
// Program.cs — .NET 6+ (dotnet new console && dotnet run)
// Sáu lời giải live-coding. Mỗi lớp đều dùng được trong Unity (C# 9) nguyên vẹn.
using System;
using System.Collections.Generic;

// ============ BÀI 1: Pool<T> ============
public class Pool<T> where T : class
{
    readonly Stack<T> idle;
    readonly HashSet<T> busy;                       // chống trả về hai lần — thứ họ chờ bạn nghĩ tới
    readonly Func<T> create;
    readonly Action<T> onGet, onRelease;
    public int CountAll { get; private set; }
    public int CountIdle => idle.Count;

    public Pool(Func<T> create, int prewarm = 0, Action<T> onGet = null, Action<T> onRelease = null)
    {
        this.create = create ?? throw new ArgumentNullException(nameof(create));
        this.onGet = onGet; this.onRelease = onRelease;
        idle = new Stack<T>(Math.Max(4, prewarm));
        busy = new HashSet<T>();
        for (int i = 0; i < prewarm; i++) { idle.Push(create()); CountAll++; }
    }

    public T Get()
    {
        T item = idle.Count > 0 ? idle.Pop() : Grow();
        busy.Add(item);
        onGet?.Invoke(item);
        return item;
    }

    public bool Release(T item)
    {
        if (item == null) return false;
        if (!busy.Remove(item)) return false;       // trả hai lần, hoặc trả thứ không phải của pool
        onRelease?.Invoke(item);                     // RESET ở đây, nếu không sẽ mang trạng thái cũ
        idle.Push(item);
        return true;
    }

    T Grow() { CountAll++; return create(); }
}

// ============ BÀI 2: Event bus huỷ đăng ký an toàn ============
public class EventBus<TArg>
{
    readonly List<Action<TArg>> listeners = new List<Action<TArg>>();
    readonly List<Action<TArg>> scratch = new List<Action<TArg>>();   // bản sao để bắn, dùng lại

    public void Subscribe(Action<TArg> h) { if (h != null && !listeners.Contains(h)) listeners.Add(h); }
    public void Unsubscribe(Action<TArg> h) { listeners.Remove(h); }

    public void Raise(TArg arg)
    {
        scratch.Clear();
        scratch.AddRange(listeners);                 // bắn trên BẢN SAO: listener huỷ giữa chừng không vỡ
        for (int i = 0; i < scratch.Count; i++)
        {
            try { scratch[i](arg); }
            catch (Exception e) { Console.WriteLine($"   listener lỗi, bỏ qua: {e.Message}"); }
        }
    }
    public int Count => listeners.Count;
}

// ============ BÀI 3: shallow copy so với deep copy ============
public class Loadout
{
    public string Name;
    public List<string> Items = new List<string>();

    public Loadout Shallow() => (Loadout)MemberwiseClone();   // Items DÙNG CHUNG
    public Loadout Deep() => new Loadout { Name = Name, Items = new List<string>(Items) };
}

// ============ BÀI 4: LRU cache O(1) ============
public class LruCache<TKey, TValue>
{
    readonly int capacity;
    readonly Dictionary<TKey, LinkedListNode<(TKey key, TValue val)>> map;
    readonly LinkedList<(TKey key, TValue val)> order;   // đầu = mới dùng nhất

    public LruCache(int capacity)
    {
        if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity));
        this.capacity = capacity;
        map = new Dictionary<TKey, LinkedListNode<(TKey, TValue)>>(capacity);
        order = new LinkedList<(TKey, TValue)>();
    }

    public bool TryGet(TKey key, out TValue value)
    {
        if (!map.TryGetValue(key, out var node)) { value = default; return false; }
        order.Remove(node); order.AddFirst(node);     // O(1) vì đã cầm node
        value = node.Value.val;
        return true;
    }

    public void Put(TKey key, TValue value)
    {
        if (map.TryGetValue(key, out var node))
        {
            node.Value = (key, value);
            order.Remove(node); order.AddFirst(node);
            return;
        }
        if (map.Count >= capacity)
        {
            var last = order.Last;                     // phần tử lâu không dùng nhất
            order.RemoveLast();
            map.Remove(last.Value.key);
        }
        map[key] = order.AddFirst((key, value));
    }
    public int Count => map.Count;
}

// ============ BÀI 5: binary heap cho A* (Unity không có PriorityQueue) ============
public class MinHeap<T>
{
    readonly List<T> items;
    readonly Comparison<T> cmp;

    public MinHeap(Comparison<T> cmp, int capacity = 16)
    { this.cmp = cmp; items = new List<T>(capacity); }

    public int Count => items.Count;

    public void Push(T item)
    {
        items.Add(item);
        int i = items.Count - 1;
        while (i > 0)
        {
            int parent = (i - 1) / 2;
            if (cmp(items[i], items[parent]) >= 0) break;
            (items[i], items[parent]) = (items[parent], items[i]);
            i = parent;
        }
    }

    public T Pop()
    {
        if (items.Count == 0) throw new InvalidOperationException("heap rỗng");
        T top = items[0];
        items[0] = items[items.Count - 1];
        items.RemoveAt(items.Count - 1);              // swap-back, O(1)
        int i = 0;
        while (true)
        {
            int l = i * 2 + 1, r = l + 1, best = i;
            if (l < items.Count && cmp(items[l], items[best]) < 0) best = l;
            if (r < items.Count && cmp(items[r], items[best]) < 0) best = r;
            if (best == i) break;
            (items[i], items[best]) = (items[best], items[i]);
            i = best;
        }
        return top;
    }
}

// ============ BÀI 6: xoá nhiều phần tử khi đang duyệt ============
public static class ListOps
{
    public static int RemoveAllSwapBack<T>(List<T> list, Predicate<T> match)
    {
        int removed = 0;
        for (int i = list.Count - 1; i >= 0; i--)
            if (match(list[i]))
            {
                list[i] = list[list.Count - 1];       // kéo phần tử cuối lấp vào
                list.RemoveAt(list.Count - 1);        // xoá ở cuối: O(1), không dồn mảng
                removed++;
            }
        return removed;
    }
}

class Bullet { public float Speed; public bool Active; public override string ToString() => $"B({Speed})"; }

static class Program
{
    static void Main()
    {
        // 1) Pool
        var pool = new Pool<Bullet>(static () => new Bullet(), prewarm: 2,
            onGet: static b => b.Active = true,
            onRelease: static b => { b.Active = false; b.Speed = 0f; });   // reset!
        var b1 = pool.Get(); b1.Speed = 9f;
        pool.Release(b1);
        var b2 = pool.Get();
        Console.WriteLine($"1) Pool: lấy lại cùng object = {ReferenceEquals(b1, b2)}, speed sau reset = {b2.Speed}");
        Console.WriteLine($"   trả về lần hai bị chặn: {pool.Release(b2)} rồi {pool.Release(b2)}");

        // 2) Event bus: listener tự huỷ đăng ký GIỮA LÚC đang bắn
        var bus = new EventBus<int>();
        Action<int> a = null, c = null;
        a = v => { Console.WriteLine($"2) A nhận {v}, tự huỷ đăng ký"); bus.Unsubscribe(a); };
        Action<int> bErr = v => throw new InvalidOperationException("B hỏng");
        c = v => Console.WriteLine($"   C vẫn nhận {v} dù A đã huỷ và B ném exception");
        bus.Subscribe(a); bus.Subscribe(bErr); bus.Subscribe(c);
        bus.Raise(7);
        Console.WriteLine($"   còn {bus.Count} listener\n");

        // 3) shallow vs deep
        var src = new Loadout { Name = "P1" }; src.Items.Add("sword");
        var sh = src.Shallow(); var dp = src.Deep();
        src.Items.Add("shield");
        Console.WriteLine($"3) gốc={src.Items.Count} shallow={sh.Items.Count} deep={dp.Items.Count}");
        Console.WriteLine($"   shallow dùng CHUNG list: {ReferenceEquals(src.Items, sh.Items)}\n");

        // 4) LRU
        var lru = new LruCache<int, string>(2);
        lru.Put(1, "a"); lru.Put(2, "b");
        lru.TryGet(1, out _);                          // 1 thành mới dùng nhất
        lru.Put(3, "c");                                // đẩy 2 ra, KHÔNG phải 1
        Console.WriteLine($"4) LRU(2): còn 1? {lru.TryGet(1, out _)} | còn 2? {lru.TryGet(2, out _)} | còn 3? {lru.TryGet(3, out _)}\n");

        // 5) MinHeap
        var heap = new MinHeap<(int node, float f)>(static (x, y) => x.f.CompareTo(y.f));
        foreach (var n in new[] { (1, 4.5f), (2, 1.2f), (3, 3.3f), (4, 0.7f) }) heap.Push(n);
        Console.Write("5) MinHeap lấy ra theo thứ tự f: ");
        while (heap.Count > 0) Console.Write($"{heap.Pop().node} ");
        Console.WriteLine("\n");

        // 6) xoá swap-back
        var bullets = new List<Bullet>();
        for (int i = 0; i < 10; i++) bullets.Add(new Bullet { Speed = i });
        int gone = ListOps.RemoveAllSwapBack(bullets, static b => b.Speed % 2 == 0);
        Console.WriteLine($"6) xoá {gone} viên, còn {bullets.Count}: {string.Join(" ", bullets)}");
        Console.WriteLine("   thứ tự bị đảo — đó là cái giá của swap-back, và với đạn thì không sao");
    }
}
```

**Chạy thử**
- Bài 1: `ReferenceEquals` ra `True` (đúng object được tái sử dụng) và `speed = 0` (đã reset). Lần `Release` thứ hai trả về `False` — chính là trường hợp biên người phỏng vấn hay hỏi.
- Bài 2: A huỷ đăng ký ngay trong lúc sự kiện đang bắn, B ném exception, mà C **vẫn nhận được** — vì `Raise` chạy trên bản sao và bọc từng listener trong `try/catch`. Bỏ `scratch` đi rồi chạy lại để thấy nó vỡ.
- Bài 3: `shallow` đếm 2 (dùng chung list với gốc), `deep` đếm 1. Một dòng in ra đủ để phân biệt hai khái niệm.
- Bài 4: sau `Put(3)`, khoá **2** bị đẩy ra chứ không phải 1 — vì 1 vừa được `TryGet` nên nó là mới dùng nhất.
- Bài 5: heap in ra `4 2 3 1` — đúng thứ tự `f` tăng dần, mỗi lần lấy là O(log n).
- Bài 6: còn 5 viên, thứ tự bị đảo. Nói được vì sao đảo, và vì sao trong trường hợp này không sao, là phần chấm điểm thật.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Kể về một dự án anh đã làm.**
  → Trả lời theo bốn nhịp trong 90 giây: game gì và cho ai, **tôi sở hữu hệ thống nào**, một khó khăn kỹ thuật có số đo, và kết quả. Ví dụ: "game bắn súng mobile, đội 6 người, 8 tháng; tôi phụ trách combat và tối ưu; frame time trên Redmi Note 9 từ 31ms xuống 16ms bằng cách bỏ alloc trong Update và gộp draw call; ra mắt được 40.000 lượt tải tháng đầu."
- `Junior` **Anh học C# từ đâu và tự đánh giá mình ở mức nào?**
  → Nói thật mức và nói kèm bằng chứng cụ thể thay vì tính từ: "tôi tự tin ở phần value type, collection, delegate và tối ưu alloc vì đã làm qua Profiler nhiều; phần đa luồng thì tôi hiểu cơ chế nhưng chỉ dùng qua Job System, chưa tự quản thread trong dự án thật." Câu trả lời có ranh giới rõ thì đáng tin hơn câu "tôi khá ổn".
- `Junior` **Anh làm gì khi gặp một lỗi chưa từng thấy?**
  → Tái hiện cho ổn định trước, vì lỗi không tái hiện được thì không sửa được. Sau đó thu hẹp: đọc stack trace tới dòng đầu tiên trong code của mình, chặn nhị phân bằng cách tắt bớt hệ thống, và so với lần build gần nhất còn chạy đúng. Chỉ sửa khi đã giải thích được **vì sao** nó xảy ra.
- `Mid` **Bài live coding: viết một object pool.**
  → Hỏi ràng buộc trước: có nhiều thread không, có cần prewarm không, object có cần reset khi trả về không. Rồi dựng `Stack<T>` cho phần rỗi, một `HashSet<T>` cho phần đang dùng để chặn trả về hai lần, callback `onGet`/`onRelease` để reset trạng thái. Tôi luôn nói rõ hai trường hợp biên: trả về hai lần, và trả về một object không thuộc pool.
- `Mid` **Vì sao `foreach` + `Remove` lại ném exception, và anh làm thế nào?**
  → Vì enumerator giữ một số phiên bản của collection và phát hiện nó đã đổi giữa chừng. Tôi duyệt ngược bằng chỉ số; và nếu thứ tự không quan trọng thì swap-back — kéo phần tử cuối lấp vào chỗ vừa xoá rồi cắt đuôi, O(1) thay vì O(n) mỗi lần xoá.
- `Mid` **Anh tối ưu một màn chơi tụt fps theo trình tự nào?**
  → Đo trước, không sửa gì cả. Mở Profiler trên **thiết bị thật**, xác định nghẽn ở CPU hay GPU, rồi sắp Hierarchy theo cột tốn nhất. Nếu là GC Alloc thì tìm hàm cấp phát mỗi frame; nếu là draw call thì gộp batch. Sửa **một** thứ, đo lại, ghi số trước sau. Thứ tôi không làm là tối ưu theo cảm giác hay theo danh sách mẹo trên mạng.
- `Mid` **Deep copy và shallow copy khác nhau thế nào?**
  → Shallow copy chép từng field: field kiểu tham chiếu thì chép **địa chỉ**, nên hai bản dùng chung cùng một list. Deep copy tạo bản sao mới cho cả những object bên trong. `MemberwiseClone` là shallow — gọi nó rồi bảo đó là deep copy là lỗi kinh điển. Trong game chỗ này hay cắn nhau ở save game và ở cấu hình dùng chung giữa các instance.
- `Senior` **Anh thiết kế hệ thống inventory cho một game mobile có IAP thế nào?**
  → Hỏi ràng buộc trước: có server không, item có xếp chồng không, có giao dịch giữa người chơi không, bao nhiêu ô. Rồi chốt ranh giới: **server là nguồn chân lý** của mọi thứ có giá trị, client giữ bản sao để hiển thị. Client gửi **ý định** chứ không gửi kết quả, mọi thay đổi ví đi kèm idempotency key. Phía C# thì item là dữ liệu bất biến đọc từ master data, còn số lượng nằm trong một `Dictionary<int, int>` — xem [[project-contract]].
- `Senior` **Anh từng sai lầm kỹ thuật nào đáng nhớ?**
  → Chọn một lỗi **có hệ quả đo được** và có bài học chuyển giao được, không chọn lỗi vặt. Cấu trúc: tôi đã quyết định gì, vì sao lúc đó nó hợp lý, hậu quả là gì bằng số, phát hiện thế nào, và giờ tôi làm khác ở đâu. Người phỏng vấn tìm khả năng tự nhìn lại, không tìm người chưa bao giờ sai.
- `Senior` **Anh review code của người khác theo thứ tự nào?**
  → Đúng — hành vi có khớp yêu cầu không, và có test không. Rồi tới ranh giới — code này đặt đúng tầng chưa, có tạo phụ thuộc vòng không. Rồi tới vòng đời và tài nguyên: `+=` có `-=` không, `Dispose` có không, có alloc trong `Update` không. Cuối cùng mới tới đặt tên và phong cách. Đảo thứ tự này là cách review mất thời gian mà bỏ lọt bug thật.

**Khung trả lời 60 giây** — "Giới thiệu về kinh nghiệm C# của anh"

> Tôi làm gameplay bằng C# trong Unity được **N năm**, chủ yếu ở mảng combat và tối ưu. Phần tôi chắc tay nhất là ba thứ: **value type và boxing**, **collection cùng độ phức tạp**, và **vòng đời sự kiện** — vì đó đúng là ba chỗ tôi phải đụng tới nhiều nhất khi đi tìm chỗ game khựng.
>
> Ví dụ cụ thể ở dự án gần nhất: game tụt xuống khoảng 31ms mỗi frame trên máy tầm trung. Tôi mở Profiler, sắp Hierarchy theo cột GC Alloc, và thủ phạm là ba hàm dùng LINQ trong `Update` cùng một chỗ nối chuỗi cho HUD. Viết lại bằng vòng lặp với buffer dùng lại và `SetText` — alloc về **0 byte mỗi frame**, frame time xuống còn **16ms**.
>
> Chỗ tôi còn ít kinh nghiệm là đa luồng tự quản: tôi hiểu cơ chế `lock`, `Interlocked`, race condition, nhưng trong dự án thật tôi dùng Job System vì hệ thống an toàn của nó bắt lỗi giúp. Đó là thứ tôi muốn làm sâu hơn.

**Họ sẽ đào tiếp**

- *"Vì sao LINQ lại là thủ phạm?"* → Mỗi lần gọi sinh iterator cho từng mắt xích cộng closure nếu lambda bắt biến; `OrderBy(...).First()` còn sai cả độ phức tạp — O(n log n) để lấy một phần tử.
- *"Anh đo trên máy nào?"* → Thiết bị thật yếu nhất trong danh sách hỗ trợ, bản build Release, và đo ở phút thứ 15 chứ không phải phút đầu — vì heap phình và nhiệt độ máy đều cần thời gian để lộ ra.
- *"Sau khi sửa anh kiểm chứng thế nào?"* → Đo lại đúng kịch bản đó, ghi số trước/sau vào PR, và thêm một ngưỡng cảnh báo trong test hiệu năng để không ai vô tình đưa alloc quay lại.
- *"Nếu không được dùng Job System thì sao?"* → Tôi tự dựng producer–consumer: thread nền chỉ sinh dữ liệu thuần, `ConcurrentQueue` chuyển về, main thread rút có trần mỗi frame và là nơi duy nhất chạm API engine.
- *"Anh học cái mới thế nào?"* → Viết một file nhỏ thử, đo bằng Profiler hoặc `GC.GetTotalAllocatedBytes`, và với Unity thì luôn build IL2CPP một lần trước khi tin.

**Cờ đỏ**

- Kể dự án mà không có một con số nào.
- Nói "tôi biết hết" hoặc ngược lại, "cái đó tôi chưa gặp" rồi im.
- Trong live coding: gõ ngay mà không hỏi ràng buộc, không nói độ phức tạp.
- Không tự nêu được trường hợp biên cho code mình vừa viết.
- Chê đội cũ hoặc đổ lỗi cho designer khi được hỏi về khó khăn.
- Trả lời câu C# bằng ví dụ Unity, hoặc ngược lại — dấu hiệu học theo công thức thay vì hiểu.

**Số / ví dụ nên thuộc**

- Ngân sách frame: **16.6ms** ở 60fps, **33.3ms** ở 30fps. Mục tiêu alloc: **0 B/frame**.
- `List` grow **0 → 4 → 8 → 16**; ngưỡng mảng thắng cấu trúc băm: **8–16 phần tử**.
- Boxing một struct ≈ **24 byte**; LRU và pool đều phải **O(1)**.
- Unity 6 = **C# 9**, .NET Standard 2.1; không có `PriorityQueue`.
- Cặp vòng đời sự kiện: **`OnEnable` += / `OnDisable` -=**.
- Câu chuyện dự án của riêng bạn: **số người, số tháng, số người chơi, số ms trước/sau**.
