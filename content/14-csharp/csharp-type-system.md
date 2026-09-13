---
id: csharp-type-system
title: Value type & reference type
icon: 🧬
summary: struct hay class, copy hay tham chiếu, boxing xảy ra ở đâu, và vì sao list[i].hp -= 10 không biên dịch — câu hỏi mở màn của mọi vòng phỏng vấn C# và cũng là nền của mọi quyết định tối ưu sau này.
status: deep
read: 787
level: basic
order: 10
tags: [csharp, struct, class, boxing, memory, interview]
related: [csharp-memory, csharp-collections, csharp-generic, unity-csharp-memory]
refs:
  - "Richter — CLR via C#, ch.5"
  - "Albahari — C# 10 in a Nutshell, ch.2-3"
---

Một câu hỏi tách được junior với mid nhanh hơn mọi câu khác: **"`struct` và `class` khác nhau thế nào?"** Người trả lời "struct nằm trên stack, class nằm trên heap" là người học thuộc một câu đúng một nửa. Câu đầy đủ ngắn hơn và đúng hơn: **`struct` có ngữ nghĩa giá trị, `class` có ngữ nghĩa tham chiếu** — chỗ nằm chỉ là hệ quả, và hệ quả đó có ngoại lệ.

Trong game, câu hỏi này không hàn lâm chút nào. `Vector3`, `Quaternion`, `RaycastHit`, `Color` đều là struct. Chọn sai giữa hai thứ này là cách tạo ra hai loại bug khác nhau: *sửa xong mà không thấy đổi gì* (struct), hoặc *sửa một chỗ mà mười chỗ đổi theo* (class).

## Bảng phân biệt — thuộc bảng này là qua được vòng một

| | `struct` (value type) | `class` (reference type) |
|---|---|---|
| Gán `b = a` | **Copy toàn bộ dữ liệu** | Copy **tham chiếu**, hai biến trỏ cùng một object |
| Nằm ở đâu | Stack, hoặc nội tuyến trong object chứa nó | Luôn trên heap (managed heap) |
| GC có đụng tới không | Không, nếu không bị boxing | Có — mỗi object là một việc cho GC |
| Chi phí một object rỗng | 0 byte thừa | ~16 byte header trên 64-bit, tối thiểu ~24 byte |
| Gán `= null` | Không được, trừ khi `int?` (`Nullable<T>`) | Được |
| Kế thừa | Không. Chỉ implement được interface | Có |
| Constructor không tham số | Có sẵn, gán mọi field về `default` | Phải tự viết nếu cần |
| So sánh `==` mặc định | Không có sẵn (phải tự định nghĩa) | So sánh **tham chiếu** |
| `Equals` mặc định | So từng field — **chậm và sinh rác** nếu có field kiểu tham chiếu |  So tham chiếu |

Hai dòng cuối là chỗ bị bỏ qua nhiều nhất, và cũng là chỗ đắt nhất trong thực tế — xem phần "Struct làm key cho Dictionary" phía dưới.

## "Struct nằm trên stack" — vì sao câu đó sai một nửa

<figure class="fig">
<svg viewBox="0 0 660 230" role="img" aria-label="Sơ đồ stack và heap: biến struct nằm trên stack, biến class trên stack chỉ giữ tham chiếu tới object trên heap, và một struct là field của class thì nằm nội tuyến trong object trên heap">
  <rect x="14" y="30" width="250" height="180" rx="9" class="fig-box"/>
  <rect x="396" y="30" width="250" height="180" rx="9" class="fig-box"/>
  <text x="139" y="52" text-anchor="middle" class="fig-label" font-size="13" font-weight="600">Stack (theo frame hàm)</text>
  <text x="521" y="52" text-anchor="middle" class="fig-label" font-size="13" font-weight="600">Heap (do GC quản)</text>
  <line x1="24" y1="62" x2="254" y2="62" class="fig-line"/>
  <line x1="406" y1="62" x2="636" y2="62" class="fig-line"/>
  <rect x="30" y="74" width="218" height="34" rx="6" fill="#51cf9b" opacity="0.18"/>
  <text x="40" y="89" class="fig-label" font-size="11">Vector3 pos</text>
  <text x="40" y="103" class="fig-muted" font-size="10">12 byte dữ liệu thật nằm ngay đây</text>
  <rect x="30" y="118" width="218" height="34" rx="6" fill="#6ea8fe" opacity="0.18"/>
  <text x="40" y="133" class="fig-label" font-size="11">Enemy enemy</text>
  <text x="40" y="147" class="fig-muted" font-size="10">8 byte: chỉ là địa chỉ</text>
  <rect x="30" y="162" width="218" height="34" rx="6" fill="#b197fc" opacity="0.18"/>
  <text x="40" y="177" class="fig-label" font-size="11">object boxed = pos;</text>
  <text x="40" y="191" class="fig-muted" font-size="10">8 byte: cũng chỉ là địa chỉ</text>
  <line x1="248" y1="135" x2="410" y2="100" class="fig-line" stroke="#6ea8fe" stroke-width="2"/>
  <line x1="248" y1="179" x2="410" y2="170" class="fig-line" stroke="#b197fc" stroke-width="2"/>
  <rect x="410" y="74" width="222" height="58" rx="6" fill="#6ea8fe" opacity="0.14"/>
  <text x="420" y="90" class="fig-label" font-size="11">Enemy (class)</text>
  <text x="420" y="106" class="fig-muted" font-size="10">header 16B + int hp + Vector3 pos</text>
  <text x="420" y="122" class="fig-muted" font-size="10">struct pos nằm NỘI TUYẾN trong đây</text>
  <rect x="410" y="144" width="222" height="48" rx="6" fill="#b197fc" opacity="0.14"/>
  <text x="420" y="162" class="fig-label" font-size="11">box: bản sao của Vector3</text>
  <text x="420" y="178" class="fig-muted" font-size="10">header 16B + 12B — rác cho GC</text>
</svg>
<figcaption>Struct nằm nơi cái chứa nó nằm. Là biến cục bộ thì trên stack; là field của class thì trong heap; bị ép sang object hoặc interface thì bị copy lên heap thành một object riêng — đó là boxing.</figcaption>
</figure>

Ba trường hợp struct **không** nằm trên stack: là field của class, nằm trong mảng hoặc `List<T>` (mảng nằm trên heap), và bị boxing. Nói được ba ngoại lệ này là dấu hiệu hiểu thật chứ không thuộc lòng.

## Boxing — chỗ rác sinh ra mà nhìn code không thấy

Boxing là **copy một value type lên heap** và bọc nó trong một object. Mỗi lần boxing là một lần cấp phát (~24 byte cho một `int`) cộng một lần copy. Trong `Update` chạy 60 lần mỗi giây với 200 đối tượng, đó là con số đáng sợ.

Năm chỗ boxing xảy ra mà code nhìn vô tội:

| Viết thế này | Vì sao boxing |
|---|---|
| `object o = 42;` | Rõ ràng nhất, ai cũng thấy |
| `IDamageable d = myStruct;` | Ép struct sang **interface** — bản sao lên heap |
| `list.Contains(myEnum)` trên `ArrayList` | Collection không generic lưu `object` |
| `string.Format("{0}", hp)` và `$"hp {hp}"` | Tham số `params object[]` → đóng hộp từng số (Unity còn ở .NET Standard 2.1) |
| `myEnum.GetHashCode()` qua `Dictionary` không có comparer | Comparer mặc định của enum đi đường `object` ở runtime cũ |

Cách phát hiện: trong Unity, cột **GC Alloc** của Profiler Hierarchy. Cách phòng: dùng generic thay vì `object`/interface ở chỗ nóng (`void Hit<T>(T x) where T : IDamageable` **không** boxing vì compiler sinh bản riêng cho từng T — xem [[csharp-generic]]).

## `list[i].hp -= 10` — câu hỏi bẫy kinh điển

```csharp
struct Enemy { public int hp; }

List<Enemy> list = new List<Enemy> { new Enemy { hp = 100 } };
list[0].hp -= 10;          // LỖI BIÊN DỊCH: không gán được vào giá trị trả về

Enemy[] arr = { new Enemy { hp = 100 } };
arr[0].hp -= 10;           // CHẠY ĐÚNG: mảng trả về tham chiếu tới phần tử

foreach (var e in list) e.hp -= 10;   // LỖI BIÊN DỊCH: biến lặp là bản sao chỉ đọc
```

`List<T>` là class bọc một mảng; indexer của nó là một **method** trả về bản sao, nên sửa bản sao là vô nghĩa và compiler chặn. Mảng thì khác: `arr[0]` là truy cập phần tử thật. Cách sửa cho `List`:

```csharp
var e = list[0];           // lấy bản sao
e.hp -= 10;                // sửa bản sao
list[0] = e;               // ghi lại — ba dòng, không có cách ngắn hơn với struct
```

Từ C# 8 có `CollectionsMarshal.AsSpan(list)` cho phép sửa tại chỗ, nhưng nó chỉ có trong .NET Core 3.0 trở lên — **không dùng được trong Unity 6**. Trong Unity, muốn sửa tại chỗ thì dùng mảng, hoặc đổi struct thành class nếu đối tượng có định danh riêng.

## Struct làm key cho `Dictionary` — cái bẫy tốn nhất

Struct không tự có `Equals` nhanh. Nếu bạn không viết gì, `Dictionary` sẽ gọi `ValueType.Equals`, và với struct có field kiểu tham chiếu (hoặc có padding giữa các field), bản cài đặt đó **so từng field bằng reflection** — chậm hàng chục lần và sinh rác ở mỗi lần tra cứu. Hash mặc định cũng tệ: nó có thể chỉ dựa vào field đầu tiên, làm mọi key rơi vào cùng một bucket.

```csharp
// ĐÚNG: implement IEquatable<T> để Dictionary dùng đường generic, không boxing
public readonly struct GridPos : IEquatable<GridPos>
{
    public readonly int X, Y;
    public GridPos(int x, int y) { X = x; Y = y; }

    public bool Equals(GridPos other) => X == other.X && Y == other.Y;
    public override bool Equals(object obj) => obj is GridPos p && Equals(p);
    public override int GetHashCode() => X * 397 ^ Y;          // trộn đều, không chỉ lấy X
}
```

Luật: **struct nào làm key cho `Dictionary`/`HashSet` thì bắt buộc implement `IEquatable<T>` và override `GetHashCode`.** Không có ngoại lệ. Đây là câu hỏi mid-level rất hay gặp vì nó nối hai chủ đề: type system và [[csharp-collections]].

## `ref`, `out`, `in` — ba cách truyền không copy

| Từ khoá | Nghĩa | Dùng khi |
|---|---|---|
| `ref` | Truyền tham chiếu, hai chiều | Cần sửa biến gốc: `void Damage(ref int hp)` |
| `out` | Như `ref` nhưng hàm **bắt buộc** gán | Trả về nhiều giá trị: `TryGetValue(key, out var v)` |
| `in` | Tham chiếu **chỉ đọc** | Struct lớn, chỉ đọc: `void Draw(in Matrix4x4 m)` |

`in` là thứ hay bị dùng sai: nếu struct **không** khai `readonly struct`, compiler phải tạo **bản sao phòng thủ** mỗi lần bạn gọi method trên nó qua `in` — tức là bạn viết `in` để tránh copy nhưng lại tạo ra copy. Nên quy tắc đi kèm: `in` chỉ dùng với `readonly struct`.

```csharp
public readonly struct Damage           // readonly => không có defensive copy
{
    public readonly float Amount;
    public readonly DamageType Type;
    public Damage(float amount, DamageType type) { Amount = amount; Type = type; }
}

void Apply(in Damage d) { /* đọc d.Amount, không copy 8 byte */ }
```

## Chọn struct hay class — luật thực dụng

Hướng dẫn chính thức của Microsoft: dùng struct khi kiểu **nhỏ hơn 16 byte**, **bất biến**, **sống ngắn**, và **không bị boxing thường xuyên**. Trong game thì luật đó nới ra một chút vì số lượng đối tượng lớn:

| Chọn `struct` khi | Chọn `class` khi |
|---|---|
| Là **giá trị**: toạ độ, sát thương, thời gian, id ô lưới | Là **thực thể có định danh**: người chơi, enemy, item trong túi |
| Số lượng lớn, tạo/huỷ liên tục (particle, hit, sự kiện) | Có vòng đời, có trạng thái thay đổi theo thời gian |
| Cần nằm liền nhau trong bộ nhớ (mảng cho Job/Burst — xem [[unity-dots-jobs]]) | Cần kế thừa hoặc đa hình |
| Không bao giờ cần `null` | Cần `null` để nói "chưa có" |

Một câu kiểm tra nhanh: **"hai cái bằng nhau có nghĩa là gì?"** Nếu hai thứ có cùng giá trị thì *là một* (hai `Vector3(1,2,3)` là cùng một điểm) → struct. Nếu hai thứ có cùng dữ liệu nhưng vẫn là hai đối tượng khác nhau (hai enemy cùng máu vẫn là hai enemy) → class.

## Bẫy còn lại

- **Struct có field thay đổi được (mutable struct)** nằm trong class rồi sửa qua property: `player.Stats.hp -= 10` sửa lên bản sao — Unity còn không báo lỗi nếu `Stats` là field, nhưng báo lỗi nếu là property. Cách chữa an toàn: làm `readonly struct` để compiler chặn từ đầu.
- **`default(T)` với struct không phải là `null`**: `default(GridPos)` là `(0,0)` — một ô hợp lệ. Cần "chưa có giá trị" thì dùng `GridPos?` hoặc một giá trị sentinel rõ ràng.
- **Struct lớn truyền qua lại nhiều** đắt hơn class: một `Matrix4x4` là 64 byte, copy nó 1000 lần mỗi frame tốn hơn hẳn 1000 lần copy con trỏ 8 byte. Dùng `in`.
- **`Nullable<T>` là struct**: `int?` chiếm 8 byte (giá trị + cờ `HasValue`), không phải tham chiếu, và ép nó sang `object` vẫn là boxing.

## Kiểm tra nhanh

- [ ] Mọi struct dùng làm key `Dictionary`/`HashSet` đều implement `IEquatable<T>` + override `GetHashCode`
- [ ] Struct dùng với `in` đều khai `readonly struct`
- [ ] Không có `List<IInterface>` chứa struct ở vòng lặp nóng (boxing mỗi phần tử)
- [ ] Struct nào lớn hơn ~32 byte đều có lý do rõ ràng để vẫn là struct
- [ ] Chỗ nào cần "chưa có giá trị" thì dùng `T?`, không dùng `default(T)` làm sentinel

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc chọn struct/class và soát boxing**

Việc AI làm tốt nhất ở chủ đề này là **soát boxing** — nó nhận ra `List<IInterface>` chứa struct, nội suy chuỗi với số, hay `object` trong chữ ký hàm nhanh hơn mắt người đọc. Việc nó làm kém là **quyết định một kiểu nên là struct hay class**, vì quyết định đó phụ thuộc vào ngữ nghĩa miền (đối tượng này có định danh không?) chứ không phụ thuộc vào code.

Quy trình dùng được: bạn mô tả **ngữ nghĩa** ("hai cái bằng nhau thì có phải là một không, có bao nhiêu cái cùng lúc, có cần null không"), AI đề xuất, bạn quyết. Rồi giao cho AI việc cơ học: sinh `IEquatable<T>`, `GetHashCode`, và rà các chỗ boxing còn sót.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Kích thước và số field** của kiểu đang bàn — AI không đoán được 12 byte hay 120 byte.
- **Số lượng tồn tại cùng lúc** và **tần suất tạo mới**: 10 cái mỗi màn khác hẳn 5000 cái mỗi frame.
- **Có dùng làm key của Dictionary/HashSet không** — nếu có thì bắt buộc phải sinh `IEquatable<T>`.
- **Có cần null không**, và nếu có thì "chưa có giá trị" biểu diễn thế nào.
- Chạy trên Unity (bản nào) hay .NET — quyết định `CollectionsMarshal`, `record struct` có dùng được không.

**Mẫu prompt**

```
Unity 6 (C# 9). Tôi có kiểu dữ liệu sau, hiện là class:

<dán class>

Ngữ cảnh: tồn tại ~3000 cái cùng lúc, tạo mới ~200 cái mỗi giây, KHÔNG cần null,
hai cái cùng giá trị coi như một, có dùng làm key của Dictionary.

Việc:
1. Nói rõ nên là struct hay class, kèm lý do dựa trên ngữ nghĩa VÀ kích thước byte.
2. Nếu là struct: viết lại thành readonly struct + IEquatable<T> + GetHashCode trộn đều.
3. Liệt kê MỌI chỗ trong code tôi dán sẽ boxing sau khi đổi, và cách sửa từng chỗ.

Ràng buộc: KHÔNG dùng record struct, CollectionsMarshal, hay cú pháp C# 10+.
Chỗ nào bạn không chắc thì nói "không chắc", đừng đoán.
```

**Bẫy thường gặp:** AI đổi class thành struct để "bỏ GC" nhưng bỏ qua chỗ kiểu đó bị ép sang interface — kết quả là boxing ở mỗi lần dùng, tức là **vẫn cấp phát, cộng thêm một lần copy**. Bẫy thứ hai: nó sinh `GetHashCode()` chỉ dùng một field, làm mọi key rơi vào một bucket và `Dictionary` tụt về O(n). Bẫy thứ ba: nó đề xuất `CollectionsMarshal.AsSpan` cho `List<struct>` — API đó không có trong Unity.

## 💻 Code

Demo đo ba thứ trong một file: chi phí cấp phát của class so với struct, cái giá thật của boxing, và khác biệt giữa struct có `IEquatable<T>` với struct không có khi làm key `Dictionary`. Chạy bằng `dotnet run`, hoặc dán thân `Main` vào `Start()` của một MonoBehaviour rồi đổi `Console.WriteLine` thành `Debug.Log`.

**Script**

```csharp
// Program.cs — .NET 6+ (dotnet new console && dotnet run)
// Trong Unity: copy thân Main vào Start(), đổi Console.WriteLine -> Debug.Log.
using System;
using System.Collections.Generic;
using System.Diagnostics;

class EnemyClass { public int Hp; public float X, Y, Z; }
struct EnemyStruct { public int Hp; public float X, Y, Z; }

// Key KHÔNG có IEquatable: Dictionary phải đi đường ValueType.Equals
struct SlowKey { public int X, Y; public object Tag; }

// Key CÓ IEquatable: Dictionary dùng comparer generic, không boxing
readonly struct FastKey : IEquatable<FastKey>
{
    public readonly int X, Y;
    public FastKey(int x, int y) { X = x; Y = y; }
    public bool Equals(FastKey o) => X == o.X && Y == o.Y;
    public override bool Equals(object o) => o is FastKey k && Equals(k);
    public override int GetHashCode() => X * 397 ^ Y;
}

interface IDamageable { int Hp { get; } }
struct Boxed : IDamageable { public int Hp { get; set; } }

static class Program
{
    const int N = 1_000_000;

    static void Main()
    {
        Console.WriteLine($"64-bit: {Environment.Is64BitProcess}\n");

        // 1) Cấp phát: 1 triệu class so với 1 triệu struct trong mảng
        long before = GC.GetTotalAllocatedBytes(true);
        var classes = new EnemyClass[N];
        for (int i = 0; i < N; i++) classes[i] = new EnemyClass { Hp = i };
        long classBytes = GC.GetTotalAllocatedBytes(true) - before;

        before = GC.GetTotalAllocatedBytes(true);
        var structs = new EnemyStruct[N];
        for (int i = 0; i < N; i++) structs[i] = new EnemyStruct { Hp = i };
        long structBytes = GC.GetTotalAllocatedBytes(true) - before;

        Console.WriteLine($"1M class : {classBytes / 1024 / 1024} MB  (mảng con trỏ + N object)");
        Console.WriteLine($"1M struct: {structBytes / 1024 / 1024} MB  (một mảng liền, 0 object)\n");

        // 2) Boxing: cùng một struct, một đường qua interface, một đường generic
        before = GC.GetTotalAllocatedBytes(true);
        int sum = 0;
        for (int i = 0; i < N; i++) { IDamageable d = new Boxed { Hp = i }; sum += d.Hp; }
        long boxBytes = GC.GetTotalAllocatedBytes(true) - before;

        before = GC.GetTotalAllocatedBytes(true);
        for (int i = 0; i < N; i++) sum += TakeGeneric(new Boxed { Hp = i });
        long genericBytes = GC.GetTotalAllocatedBytes(true) - before;

        Console.WriteLine($"1M lần ép sang interface: {boxBytes / 1024 / 1024} MB  <- boxing");
        Console.WriteLine($"1M lần qua generic      : {genericBytes} B   <- 0\n");

        // 3) Dictionary: key có và không có IEquatable
        Console.WriteLine($"Dictionary 200k lần tra, key KHÔNG IEquatable: {TimeSlowKey()} ms");
        Console.WriteLine($"Dictionary 200k lần tra, key CÓ    IEquatable: {TimeFastKey()} ms");
        Console.WriteLine($"(giữ sum để trình biên dịch không cắt vòng lặp: {sum})");
    }

    static int TakeGeneric<T>(T x) where T : IDamageable => x.Hp;   // không boxing

    static long TimeSlowKey()
    {
        var map = new Dictionary<SlowKey, int>();
        for (int i = 0; i < 1000; i++) map[new SlowKey { X = i, Y = i, Tag = null }] = i;
        var sw = Stopwatch.StartNew();
        int hit = 0;
        for (int i = 0; i < 200_000; i++)
            if (map.TryGetValue(new SlowKey { X = i % 1000, Y = i % 1000, Tag = null }, out _)) hit++;
        sw.Stop();
        return sw.ElapsedMilliseconds;
    }

    static long TimeFastKey()
    {
        var map = new Dictionary<FastKey, int>();
        for (int i = 0; i < 1000; i++) map[new FastKey(i, i)] = i;
        var sw = Stopwatch.StartNew();
        int hit = 0;
        for (int i = 0; i < 200_000; i++)
            if (map.TryGetValue(new FastKey(i % 1000, i % 1000), out _)) hit++;
        sw.Stop();
        return sw.ElapsedMilliseconds;
    }
}
```

**Chạy thử**
- Phần 1: mảng class tốn cỡ **32–40 MB** (8 byte con trỏ + ~32 byte mỗi object), mảng struct cỡ **15 MB** (16 byte × 1M, một khối liền). Tỉ lệ quan trọng hơn con số tuyệt đối.
- Phần 2: đường interface cấp phát **~24 MB**, đường generic in ra **0 B**. Đây là chỗ nhìn thấy boxing bằng số.
- Phần 3: key không có `IEquatable` chậm hơn **cỡ 5–20 lần** tuỳ runtime. Bỏ field `Tag` đi rồi chạy lại: khoảng cách thu hẹp — đó là bằng chứng rằng field kiểu tham chiếu mới là thứ đẩy `ValueType.Equals` vào đường reflection.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`struct` và `class` khác nhau thế nào?**
  → `struct` là value type: gán là **copy toàn bộ dữ liệu**, không do GC quản, không kế thừa được, không gán `null` được. `class` là reference type: gán là copy **tham chiếu**, object nằm trên heap và do GC thu. Câu một dòng: struct là *giá trị*, class là *thực thể có định danh* — hai `Vector3(1,2,3)` là cùng một điểm, còn hai enemy cùng máu vẫn là hai enemy.
- `Junior` **"Struct luôn nằm trên stack" — đúng hay sai?**
  → Sai, nó nằm ở chỗ cái chứa nó nằm. Biến cục bộ thì trên stack; là field của một class thì nằm nội tuyến trong object đó trên heap; nằm trong mảng thì cả mảng ở trên heap. Và khi bị boxing thì bản sao của nó cũng lên heap.
- `Junior` **Boxing là gì, khi nào xảy ra?**
  → Là copy một value type lên heap rồi bọc trong object — mỗi lần tốn một lần cấp phát cộng một lần copy. Hay xảy ra nhất khi ép struct sang `object` hoặc sang **interface**, và khi truyền số vào hàm nhận `params object[]` như `string.Format`. Trong game, một `List<ITickable>` chứa struct tick 500 lần mỗi frame là 500 object rác mỗi frame.
- `Mid` **Vì sao `list[0].hp -= 10` không biên dịch với `List<struct>` mà mảng thì được?**
  → Vì indexer của `List<T>` là một method trả về **bản sao** của phần tử, nên gán vào bản sao là vô nghĩa và compiler chặn thẳng. Mảng thì trả về chính phần tử nên sửa được. Cách sửa với `List`: lấy ra, sửa, gán lại — ba dòng, không có đường tắt trong Unity vì `CollectionsMarshal` không có ở đó.
- `Mid` **Struct dùng làm key `Dictionary` thì cần chú ý gì?**
  → Bắt buộc implement `IEquatable<T>` và override `GetHashCode`. Nếu không, `Dictionary` rơi vào `ValueType.Equals` mặc định — với struct có field kiểu tham chiếu, bản cài đặt đó so sánh bằng reflection, chậm hàng chục lần và sinh rác ở **mỗi** lần tra cứu. Hash mặc định cũng có thể chỉ dựa vào field đầu, làm mọi key rơi vào một bucket.
- `Mid` **`ref` và `in` khác nhau thế nào, dùng `in` sai thì mất gì?**
  → `ref` là tham chiếu hai chiều, `in` là tham chiếu chỉ đọc dùng để tránh copy struct lớn. Bẫy là nếu struct không khai `readonly struct` thì mỗi lần gọi method trên tham số `in`, compiler tạo một **bản sao phòng thủ** — bạn viết `in` để tránh copy mà lại sinh ra copy. Nên luật là `in` chỉ đi với `readonly struct`.
- `Senior` **Khi nào anh đổi một class thành struct, và anh kiểm tra gì trước khi đổi?**
  → Khi kiểu đó là giá trị thuần, nhỏ (dưới ~32 byte), số lượng lớn và tạo/huỷ liên tục — ví dụ một sự kiện va chạm hay một ô lưới. Trước khi đổi tôi kiểm ba thứ: nó có bị ép sang interface ở đâu không (boxing sẽ xoá sạch lợi ích), có cần `null` không, và có bị sửa tại chỗ trong `List<T>` không. Sau khi đổi thì đo lại GC Alloc, vì đổi mà không đo là đoán.
- `Senior` **Mutable struct nguy hiểm ở chỗ nào?**
  → Ở chỗ nó sửa nhầm bản sao mà không báo gì. `player.Stats.hp -= 10` với `Stats` là property sẽ không biên dịch, nhưng nhiều trường hợp khác thì biên dịch được và lặng lẽ mất thay đổi — ví dụ sửa trong biến lặp `foreach`, hoặc sửa một struct lấy ra từ collection. Cách chặn từ gốc là khai `readonly struct` để trình biên dịch cấm mọi đường sửa.
- `Senior` **`default(T)` với value type có gì phải cẩn thận?**
  → `default` của struct là toàn bộ field bằng 0, mà 0 thường là một giá trị **hợp lệ**: `default(GridPos)` là ô (0,0). Nên không dùng được `default` để nói "chưa có giá trị" — phải dùng `T?` hoặc một sentinel rõ ràng như `(-1,-1)` có đặt tên. Đây là nguồn của loại bug im lặng: nhân vật nhảy về gốc toạ độ thay vì báo lỗi.

**Khung trả lời 60 giây** — "`struct` và `class` khác nhau thế nào, chọn cái nào?"

> Khác nhau ở **ngữ nghĩa**, chỗ nằm chỉ là hệ quả. `struct` là value type: gán là copy toàn bộ dữ liệu, không kế thừa, không `null`, và GC không phải quản nó. `class` là reference type: gán là copy tham chiếu, object nằm trên heap, GC thu dọn.
>
> Câu tôi dùng để chọn là: **"hai cái bằng nhau thì có phải là một không?"** Hai `Vector3(1,2,3)` là cùng một điểm nên nó là struct. Hai enemy cùng 100 máu vẫn là hai enemy khác nhau nên nó là class. Thêm ràng buộc kỹ thuật: struct nên nhỏ, dưới cỡ 32 byte, và bất biến.
>
> Chỗ dễ sai nhất khi chọn struct là **boxing**: chỉ cần ép nó sang một interface là bạn mất hết lợi ích, vì bản sao bị đẩy lên heap. Và nếu dùng struct làm key `Dictionary` thì phải implement `IEquatable<T>`, nếu không mỗi lần tra cứu đi qua reflection.

**Họ sẽ đào tiếp**

- *"Struct có luôn ở trên stack không?"* → Không. Là field của class thì nó nằm nội tuyến trong object trên heap; nằm trong mảng thì theo mảng; bị boxing thì bản sao lên heap. Nó nằm ở chỗ cái chứa nó nằm.
- *"Boxing tốn đúng bao nhiêu?"* → Một lần cấp phát cỡ 24 byte cho một `int` trên 64-bit (16 byte header + dữ liệu, làm tròn lên), cộng một lần copy, cộng việc cho GC sau này. Nhân với số lần gọi mỗi frame mới ra con số đáng quan tâm.
- *"Vì sao `List<struct>` không sửa tại chỗ được?"* → Indexer là method trả về bản sao. Mảng trả về phần tử thật nên sửa được. Với `List` phải lấy ra — sửa — gán lại.
- *"Làm sao để chắc chắn một struct không bị copy oan?"* → Khai `readonly struct`, truyền bằng `in`, và tránh mọi chỗ ép sang interface. `readonly` còn giúp trình biên dịch bỏ được bản sao phòng thủ.
- *"Anh đo boxing bằng gì trong Unity?"* → Cột GC Alloc trong Profiler Hierarchy, sắp giảm dần; hoặc `ProfilerRecorder` cho overlay tại chỗ. Luôn đo trên bản build, không đo trong Editor — xem [[unity-csharp-memory]].

**Cờ đỏ**

- "Struct nằm trên stack, class nằm trên heap" nói xong rồi dừng — đúng một nửa và không nêu được ngoại lệ nào.
- Đổi class sang struct "cho nhanh" mà không kiểm chỗ nào ép sang interface.
- Dùng struct mutable rồi khẳng định "vẫn sửa được bình thường".
- Dùng struct làm key `Dictionary` mà không biết tới `IEquatable<T>`.
- Nghĩ `default(T)` đóng vai `null` được với value type.

**Số / ví dụ nên thuộc**

- Header object trên 64-bit: **~16 byte**, nên một class rỗng vẫn tốn **~24 byte**.
- Boxing một `int` ≈ **24 byte** + một lần copy.
- Ngưỡng tham khảo của Microsoft cho struct: **≤ 16 byte**, bất biến, sống ngắn. `Vector3` = **12 byte**, `Matrix4x4` = **64 byte**.
- Struct làm key `Dictionary` không có `IEquatable<T>`: chậm **cỡ 5–20 lần** và sinh rác mỗi lần tra.
