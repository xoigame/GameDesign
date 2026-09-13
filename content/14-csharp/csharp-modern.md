---
id: csharp-modern
title: C# hiện đại trong Unity
icon: 🆕
summary: Unity hỗ trợ C# mấy, tính năng nào dùng được ngay, tính năng nào biên dịch được nhưng đừng dựa vào, và cái nào thật sự làm code gameplay ngắn hơn hoặc nhanh hơn.
status: deep
read: 797
level: intermediate
order: 110
tags: [csharp, language-version, pattern-matching, record, unity, interview]
related: [csharp-type-system, csharp-oop-interface, unity-build-platform, csharp-memory]
---

Nửa số mẹo C# trên mạng không biên dịch được trong Unity, và lý do rất đơn giản: **Unity 6 dừng ở C# 9**, trong khi thế giới .NET đã ở C# 12–13. Biết ranh giới đó tiết kiệm rất nhiều thời gian — của bạn và của người review code bạn dán từ AI về.

## Unity nào dùng C# mấy

| Unity | Phiên bản C# | Thư viện |
|---|---|---|
| 2019.4 LTS | 7.3 | .NET Standard 2.0 |
| 2020.3 LTS | **8.0** | .NET Standard 2.0 |
| 2021.3 LTS | **9.0** | .NET Standard 2.1 |
| 2022.3 LTS | 9.0 | .NET Standard 2.1 |
| **Unity 6 (6000.x)** | **9.0** | .NET Standard 2.1 |

Unity có nói tới việc hiện đại hoá runtime (CoreCLR, .NET mới) trên lộ trình, nhưng **chưa có trong 6000.0** — nên khi phỏng vấn, câu trả lời an toàn và đúng là "Unity 6 là C# 9, phần runtime mới còn ở lộ trình".

## Dùng được gì trong Unity 6

**C# 7.x — dùng thoải mái, và nên dùng**

```csharp
if (dict.TryGetValue(id, out var enemy)) { }          // out var
var (hit, dist) = Probe(ray);                          // tuple — ValueTuple là STRUCT, không cấp phát
void Local() { }                                       // local function
ref int slot = ref grid[i];                            // ref local: sửa tại chỗ trong mảng
void Draw(in Matrix4x4 m) { }                          // in: tham chiếu chỉ đọc
_ = SomethingIDontNeed();                              // discard
```

Tuple đáng nói riêng: `(bool hit, float dist)` là **`ValueTuple`, một struct**, nên trả về hai giá trị từ một hàm không hề cấp phát. Đây là cách thay cho việc tạo một class nhỏ chỉ để gói hai số.

**C# 8 — dùng được, trừ một thứ**

```csharp
// switch expression: hợp với state machine và bảng tra
string Label(GameState s) => s switch
{
    GameState.Menu    => "Menu",
    GameState.Playing => "Đang chơi",
    GameState.Paused  => "Tạm dừng",
    _                 => "Không rõ",                    // _ bắt buộc, nếu không sẽ có cảnh báo
};

using var writer = new SaveWriter();                    // using declaration
cache ??= new Dictionary<int, Item>();                  // ??=
ReadOnlySpan<char> tail = text.AsSpan()[3..];           // Index/Range — chắc chắn chạy với string/Span
```

**Không dùng được: default interface method.** Cú pháp có trong C# 8 nhưng nó cần hỗ trợ từ runtime mà Unity không có — đừng thiết kế kiến trúc dựa vào nó.

**C# 9 — dùng được, có hai chỗ cần kiểm**

```csharp
var list = new List<Enemy>();                           // target-typed new
Enemy e = new();                                        // ngắn hơn nữa

// pattern matching kết hợp: and / or / not
bool Dangerous(Enemy e) => e is { Hp: > 50, Type: EnemyType.Boss or EnemyType.Elite };
if (target is not null && hp is > 0 and < 20) Warn();

var dead = enemies.Where(static x => x.Hp <= 0);        // static lambda: cấm bắt biến -> 0 byte

public record DamageEvent(int Amount, DamageType Type); // record: so sánh theo GIÁ TRỊ
```

Hai chỗ cần kiểm trên bản Unity của bạn trước khi dựa vào:

- **`record` và `init`** — nếu trình biên dịch báo thiếu `System.Runtime.CompilerServices.IsExternalInit`, thêm một file shim năm dòng là xong (khai một `static class IsExternalInit` rỗng trong namespace đó).
- **Covariant return** (override trả về kiểu con) cần hỗ trợ runtime; nếu bản Unity của bạn không nhận thì đừng vòng vèo, cứ giữ kiểu trả về cũ.

**Không có trong Unity 6 — mọi thứ từ C# 10 trở lên**

| Tính năng | Phiên bản | Thay bằng |
|---|---|---|
| `namespace Game;` (file-scoped) | C# 10 | Namespace có ngoặc như cũ |
| `global using` | C# 10 | `using` ở từng file |
| `record struct` | C# 10 | `readonly struct` + `IEquatable<T>` viết tay |
| `required` member | C# 11 | Constructor có tham số bắt buộc |
| Raw string literal `"""` | C# 11 | Chuỗi verbatim `@"…"` |
| List pattern `[1, 2, ..]` | C# 11 | So sánh `Length` rồi chỉ số |
| Primary constructor cho class | C# 12 | Constructor thường |

## Ba tính năng thật sự đổi cách viết code game

Không phải tính năng mới nào cũng đáng đưa vào dự án. Ba cái dưới đây đáng, vì chúng đổi được cả độ dài lẫn độ an toàn:

**1. Switch expression cho máy trạng thái và bảng tra**

```csharp
// Trước: 15 dòng switch, dễ quên break, dễ quên case mới
// Sau: một biểu thức, compiler cảnh báo nếu thiếu nhánh cho enum
float Multiplier(DamageType t, ArmorType a) => (t, a) switch
{
    (DamageType.Fire,     ArmorType.Wood)  => 2.0f,
    (DamageType.Fire,     ArmorType.Metal) => 0.5f,
    (DamageType.Piercing, ArmorType.Metal) => 1.5f,
    _                                      => 1.0f,
};
```

Bảng tương khắc viết bằng tuple pattern đọc gần như bảng thật — đây là chỗ C# hiện đại thắng rõ nhất trong code gameplay.

**2. Pattern matching thay cho chuỗi `if` lồng nhau**

```csharp
// Trước
if (hit != null && hit.Target != null && hit.Target.Hp > 0 && hit.Damage >= 10) …

// Sau — và nó còn tự lo phần null
if (hit is { Target.Hp: > 0, Damage: >= 10 }) …
```

Cẩn thận một chỗ: mẫu `is { … }` dùng so sánh **null thật**, nên với `UnityEngine.Object` đã destroy nó **không** nhận ra — xem [[csharp-exception-null]]. Dùng cho dữ liệu C# thuần thì tuyệt.

**3. `record` cho dữ liệu bất biến**

```csharp
public record SpawnConfig(string PrefabId, int Count, float Interval);

var a = new SpawnConfig("goblin", 3, 1.5f);
var b = new SpawnConfig("goblin", 3, 1.5f);
bool same = a == b;                    // TRUE — record so sánh theo giá trị
var faster = a with { Interval = 0.5f };   // tạo bản sao đổi một field
```

Hợp cho: payload sự kiện, snapshot trạng thái, cấu hình đọc từ file, DTO của tầng mạng. **Không** hợp cho: dữ liệu chạy mỗi frame — `record` là class, nên mỗi `with` là một object mới. Và Unity **không serialize** `record` vào Inspector; dữ liệu designer sửa thì vẫn dùng `[Serializable] class` hoặc `ScriptableObject` — xem [[data-driven-design]].

## Tính năng "hiện đại" nào tốt cho hiệu năng

| Tính năng | Vì sao đáng dùng ở code nóng |
|---|---|
| `static` lambda / `static` local function | Cấm bắt biến ⇒ trình biên dịch cache delegate, 0 byte |
| `readonly struct` | Bỏ bản sao phòng thủ khi truyền bằng `in` |
| `in` parameter | Không copy struct lớn |
| `ValueTuple` (`(a, b)`) | Trả nhiều giá trị không cấp phát |
| `Span<T>` / `stackalloc` | Làm việc với dữ liệu tạm không chạm heap — xem [[csharp-memory]] |
| `ref` local / `ref return` | Sửa phần tử mảng tại chỗ, không copy |

Còn hai thứ đi **ngược** lại nếu dùng sai chỗ: `record` (mỗi `with` là một object) và LINQ với cú pháp mới (vẫn cấp phát y như cũ — xem [[csharp-linq]]).

## Bẫy còn lại

- **Chép code C# 11 từ AI hoặc StackOverflow**: file-scoped namespace và `required` là hai thứ hay lọt vào nhất. Đọc thấy IDE đỏ thì nhìn phiên bản trước khi nghi máy hỏng.
- **`record` trong Inspector**: Unity không vẽ nó. Dữ liệu cần designer sửa thì đừng dùng record.
- **Switch expression thiếu nhánh `_`** ném `SwitchExpressionException` lúc chạy chứ không báo lúc biên dịch — luôn có nhánh mặc định trừ khi cố ý muốn nổ.
- **Pattern `is { }` với Unity object**: không thấy object đã destroy.
- **`init` mà không có shim** trên một số bản Unity: lỗi biên dịch khó hiểu về `IsExternalInit`.
- **Bật `LangVersion` cao trong .csproj**: Unity sinh lại file project nên thay đổi đó bị ghi đè, và kể cả giữ được thì runtime vẫn không có API mới.

## Kiểm tra nhanh

- [ ] Biết chính xác bản Unity của dự án dùng C# mấy
- [ ] Không có cú pháp C# 10+ nào trong code (file-scoped namespace, `required`, `record struct`)
- [ ] Mọi switch expression trên enum đều có nhánh `_`
- [ ] `record` chỉ dùng cho dữ liệu bất biến ngoài vòng lặp nóng, không dùng chỗ cần Inspector
- [ ] Lambda trong code nóng đều là `static`
- [ ] Không thiết kế nào dựa vào default interface method

## 🤖 Prompt cho AI

**Dùng AI thế nào khi phiên bản ngôn ngữ bị khoá**

Đây là chủ đề mà **một dòng ràng buộc trong prompt tiết kiệm cả buổi sửa lỗi**. AI mặc định trả về C# mới nhất, nên nếu không nói gì, tỉ lệ nhận về code không biên dịch được trong Unity là rất cao — và triệu chứng thì trông như lỗi cấu hình chứ không như lỗi phiên bản.

Cách dùng hiệu quả nhất là ngược lại: nhờ AI **hạ cấp** một đoạn code C# mới về C# 9, giải thích từng chỗ đổi. Nó làm việc này rất chính xác, và bạn học được luôn tính năng nào thuộc phiên bản nào.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **"C# 9, .NET Standard 2.1, Unity 6"** — viết thẳng vào prompt, mỗi lần.
- **Code này có cần hiện trong Inspector không** — quyết định `record` dùng được hay không.
- **Có chạy mỗi frame không** — quyết định `record`/`with` có hợp lý không.
- **Có đụng `UnityEngine.Object` không** — quyết định pattern `is { }` có an toàn không.

**Mẫu prompt**

```
Ràng buộc cứng: Unity 6, C# 9, .NET Standard 2.1.
KHÔNG dùng: file-scoped namespace, global using, record struct, required,
raw string literal, list pattern, primary constructor, default interface method.

Việc: viết lại đoạn dưới đây cho biên dịch được trong Unity 6.

<dán code C# mới>

Với mỗi chỗ phải đổi, ghi một dòng: "<tính năng> là C# <phiên bản> -> thay bằng <cách viết>".
Cuối cùng: chỉ ra chỗ nào tôi NÊN giữ nguyên vì nó là C# 9 hợp lệ, kẻo tôi tưởng
phải sửa hết.
```

**Bẫy thường gặp:** AI "hạ cấp" code bằng cách thay `record` thành `class` nhưng quên viết `Equals`/`GetHashCode` — bạn mất luôn ngữ nghĩa so sánh theo giá trị mà không được cảnh báo, và bug lộ ra ở chỗ so sánh hai config tưởng giống nhau. Bẫy thứ hai: nó dùng `is { }` cho Unity object và khẳng định đã kiểm tra null an toàn. Bẫy thứ ba: nó gợi ý sửa `LangVersion` trong `.csproj` — Unity sinh lại file đó, và runtime vẫn thiếu API dù compiler có chịu.

## 💻 Code

Một file duy nhất gom mọi tính năng C# 8–9 **dùng được trong Unity 6**, mỗi tính năng kèm một ví dụ game thật. Chạy bằng `dotnet run`; mọi dòng trong đây đều biên dịch được trên Unity 6, trừ những dòng ghi rõ là phản ví dụ.

**Script**

```csharp
// Program.cs — mọi tính năng dưới đây đều hợp lệ với C# 9 (Unity 6).
using System;
using System.Collections.Generic;
using System.Linq;

enum DamageType { Physical, Fire, Piercing }
enum ArmorType { None, Wood, Metal }
enum GameState { Menu, Playing, Paused, GameOver }

// record: so sánh theo giá trị, có sẵn ToString đẹp, có 'with'
record SpawnConfig(string PrefabId, int Count, float Interval);

// readonly struct + IEquatable: kiểu giá trị dùng ở code nóng
readonly struct GridPos : IEquatable<GridPos>
{
    public readonly int X, Y;
    public GridPos(int x, int y) { X = x; Y = y; }
    public bool Equals(GridPos o) => X == o.X && Y == o.Y;
    public override bool Equals(object o) => o is GridPos p && Equals(p);
    public override int GetHashCode() => X * 397 ^ Y;
    public override string ToString() => $"({X},{Y})";
}

class Enemy
{
    public int Hp { get; init; }               // init: chỉ gán lúc khởi tạo (cần shim trên vài bản Unity)
    public DamageType Weakness { get; init; }
    public GridPos Cell { get; init; }
}

static class Program
{
    static void Main()
    {
        // 1) switch expression + tuple pattern = bảng tương khắc
        Console.WriteLine("1) bảng tương khắc:");
        foreach (var (dmg, armor) in new[]
                 { (DamageType.Fire, ArmorType.Wood), (DamageType.Fire, ArmorType.Metal),
                   (DamageType.Piercing, ArmorType.Metal), (DamageType.Physical, ArmorType.None) })
            Console.WriteLine($"   {dmg,-8} vs {armor,-5} = ×{Multiplier(dmg, armor)}");

        // 2) pattern matching: and / or / not / property pattern
        var enemies = new List<Enemy>
        {
            new Enemy { Hp = 80, Weakness = DamageType.Fire,     Cell = new GridPos(1, 1) },
            new Enemy { Hp = 15, Weakness = DamageType.Piercing, Cell = new GridPos(2, 3) },
            new Enemy { Hp = 0,  Weakness = DamageType.Physical, Cell = new GridPos(0, 0) },
        };

        Console.WriteLine("\n2) phân loại bằng pattern:");
        foreach (var e in enemies) Console.WriteLine($"   {e.Cell} hp={e.Hp,3} -> {Classify(e)}");

        // 3) record: so sánh giá trị + with
        var baseCfg = new SpawnConfig("goblin", 3, 1.5f);
        var sameCfg = new SpawnConfig("goblin", 3, 1.5f);
        var faster = baseCfg with { Interval = 0.5f };
        Console.WriteLine($"\n3) record:");
        Console.WriteLine($"   baseCfg == sameCfg : {baseCfg == sameCfg}   <- so sánh theo GIÁ TRỊ");
        Console.WriteLine($"   ReferenceEquals    : {ReferenceEquals(baseCfg, sameCfg)}   <- vẫn là hai object");
        Console.WriteLine($"   faster             : {faster}");

        // 4) tuple trả nhiều giá trị — ValueTuple là struct, không cấp phát
        var (hit, dist) = Probe(12f);
        Console.WriteLine($"\n4) tuple: hit={hit}, dist={dist}");

        // 5) static local function: cấm bắt biến -> không cấp phát closure
        Console.WriteLine($"5) tổng hp còn sống: {SumAlive(enemies)}");

        // 6) using declaration + ??= + Index/Range
        string log = "2026-09-13 ERROR mất kết nối";
        Console.WriteLine($"6) ngày: {log.AsSpan()[..10].ToString()} | mức: {log.Split(' ')[1]}");

        // 7) switch expression trên state — thiếu nhánh _ là ném lúc CHẠY, không phải lúc biên dịch
        foreach (GameState s in Enum.GetValues(typeof(GameState)))
            Console.WriteLine($"   {s} -> {Label(s)}");
    }

    static float Multiplier(DamageType t, ArmorType a) => (t, a) switch
    {
        (DamageType.Fire, ArmorType.Wood) => 2.0f,
        (DamageType.Fire, ArmorType.Metal) => 0.5f,
        (DamageType.Piercing, ArmorType.Metal) => 1.5f,
        _ => 1.0f,
    };

    static string Classify(Enemy e) => e switch
    {
        { Hp: <= 0 } => "đã chết",
        { Hp: < 20, Weakness: DamageType.Fire or DamageType.Piercing } => "sắp chết, có điểm yếu",
        { Hp: < 20 } => "sắp chết",
        not null => "khoẻ",
        _ => "không rõ",
    };

    static string Label(GameState s) => s switch
    {
        GameState.Menu => "Menu",
        GameState.Playing => "Đang chơi",
        GameState.Paused => "Tạm dừng",
        _ => "Kết thúc",                  // luôn có nhánh này, nếu không sẽ ném lúc chạy
    };

    static (bool hit, float dist) Probe(float range)
    {
        float d = range * 0.5f;
        return (d < range, d);            // ValueTuple: struct, 0 byte trên heap
    }

    static int SumAlive(List<Enemy> list)
    {
        // static local function: trình biên dịch CẤM nó bắt biến ngoài -> không tạo closure
        static bool Alive(Enemy e) => e.Hp > 0;

        int sum = 0;
        for (int i = 0; i < list.Count; i++) if (Alive(list[i])) sum += list[i].Hp;
        return sum;
    }
}
```

**Chạy thử**
- Phần 1 in ra bảng tương khắc; đọc code sẽ thấy nó gần như chính là cái bảng — đó là lý do tuple pattern đáng dùng cho dữ liệu cân bằng.
- Phần 3: `baseCfg == sameCfg` ra **`True`** trong khi `ReferenceEquals` ra `False` — hai object khác nhau nhưng bằng nhau về giá trị. Đổi `record` thành `class` rồi chạy lại: `==` thành `False`, và đó chính là cái bạn mất khi "hạ cấp" record thành class mà quên viết `Equals`.
- Phần 7: thử xoá nhánh `_` trong `Label` rồi chạy — biên dịch vẫn qua (chỉ cảnh báo), nhưng gặp `GameState.GameOver` là ném `SwitchExpressionException` lúc chạy.
- Dán cả file này vào Unity 6 (bỏ `Main`, gói vào một MonoBehaviour): mọi dòng đều biên dịch. Nếu `init` báo lỗi `IsExternalInit` thì thêm file shim năm dòng.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Unity 6 dùng C# phiên bản nào?**
  → C# 9, trên .NET Standard 2.1 — giống Unity 2021.3 và 2022.3. Nghĩa là record, pattern matching, switch expression, target-typed `new` đều dùng được; còn file-scoped namespace, `global using`, `required`, raw string literal thì không vì chúng là C# 10 trở lên.
- `Junior` **Switch expression khác `switch` thường thế nào?**
  → Nó là **biểu thức** nên trả về giá trị và gán thẳng được, không cần `break`, và trình biên dịch cảnh báo khi thiếu nhánh cho enum. Bẫy là thiếu nhánh `_` thì lúc chạy ném `SwitchExpressionException` chứ không báo lúc biên dịch.
- `Mid` **`record` là gì, khi nào dùng trong game?**
  → Là class do compiler sinh sẵn `Equals`, `GetHashCode`, `ToString` và toán tử `with` để tạo bản sao đổi vài field — tức là **so sánh theo giá trị**. Tôi dùng cho payload sự kiện, snapshot trạng thái, DTO mạng, config đọc từ file. Không dùng ở vòng lặp mỗi frame vì mỗi `with` là một object mới, và không dùng cho dữ liệu cần hiện trong Inspector vì Unity không serialize record.
- `Mid` **Tuple trả về có cấp phát không?**
  → Không. `(bool, float)` là `ValueTuple`, một **struct**, nên trả hai giá trị từ một hàm không tạo rác. Đây là cách thay cho việc đẻ một class nhỏ chỉ để gói hai số — nhưng nếu tuple bị bắt vào closure hay ép sang `object` thì vẫn boxing như mọi struct khác.
- `Mid` **Tính năng C# mới nào anh dùng để giảm cấp phát?**
  → `static` lambda và `static` local function — chúng cấm bắt biến nên trình biên dịch cache được delegate, 0 byte thay vì một object mỗi lần gọi. Cùng nhóm còn có `readonly struct` để bỏ bản sao phòng thủ khi truyền bằng `in`, và `Span`/`stackalloc` cho dữ liệu tạm.
- `Senior` **Tính năng nào biên dịch được trong Unity nhưng anh vẫn tránh?**
  → **Default interface method**: cú pháp là C# 8 nhưng nó cần hỗ trợ từ runtime mà Unity không có, nên đừng thiết kế kiến trúc dựa vào nó. Ngoài ra tôi cẩn thận với covariant return vì cũng phụ thuộc runtime, và với `init` thì kiểm trước xem bản Unity có cần shim `IsExternalInit` không.
- `Senior` **Pattern matching `is { … }` có an toàn với Unity object không?**
  → Không. Nó dùng so sánh **null thật**, trong khi Unity nạp chồng `==` để object đã destroy được coi như null. Nên `hit is { Target.Hp: > 0 }` sẽ lọt qua với một object đã bị `Destroy` và ném `MissingReferenceException`. Với dữ liệu C# thuần thì pattern matching rất tốt; với `UnityEngine.Object` thì tôi quay về `== null` — xem [[csharp-exception-null]].
- `Senior` **Không có `record struct` thì thay bằng gì?**
  → `readonly struct` viết tay `IEquatable<T>` và `GetHashCode`. Mất vài chục dòng so với một dòng `record struct`, nhưng đó là thứ thật sự cần trong code nóng: giá trị bất biến, so sánh theo giá trị, không cấp phát. Tôi thường sinh sẵn một template cho nó vì mọi dự án đều cần vài kiểu như vậy.

**Khung trả lời 60 giây** — "Unity hỗ trợ C# tới đâu, và anh dùng gì trong đó?"

> Unity 6, 2022.3 và 2021.3 đều là **C# 9 trên .NET Standard 2.1**. Ranh giới đó quan trọng vì code chép từ mạng hay từ AI thường là C# 11–12 và sẽ đỏ ngay trong IDE — file-scoped namespace, `required`, `record struct` là ba thứ hay lọt vào nhất.
>
> Trong phần dùng được, ba thứ tôi dùng thật sự nhiều. **Switch expression với tuple pattern** cho bảng tương khắc và máy trạng thái — code đọc gần như chính cái bảng thiết kế. **Pattern matching** thay chuỗi `if` lồng nhau. Và **`record`** cho dữ liệu bất biến: payload sự kiện, DTO mạng, snapshot.
>
> Hai chỗ tôi cẩn thận. `record` là class nên mỗi `with` là một object — không đưa vào vòng lặp mỗi frame, và Unity cũng không serialize nó vào Inspector. Còn pattern `is { }` thì dùng null thật, nên với `UnityEngine.Object` đã destroy nó không nhận ra — chỗ đó tôi vẫn viết `== null`.

**Họ sẽ đào tiếp**

- *"Vì sao Unity không lên C# mới hơn?"* → Vì nó gắn với runtime Mono/IL2CPP và thư viện .NET Standard 2.1; nâng phiên bản ngôn ngữ kéo theo nâng runtime. Unity có nói tới hiện đại hoá runtime trên lộ trình nhưng chưa có trong 6000.0.
- *"`record` có serialize được không?"* → Không, Unity không vẽ record trong Inspector. Dữ liệu designer sửa thì dùng `[Serializable] class` hoặc ScriptableObject.
- *"Tuple có miễn phí không?"* → `ValueTuple` là struct nên không cấp phát trên heap. Nhưng nếu bị bắt vào closure hoặc ép sang `object` thì boxing như mọi struct.
- *"`static` lambda được gì?"* → Trình biên dịch cấm nó bắt biến, nên delegate được cache thành một instance dùng lại — 0 byte mỗi lần gọi thay vì một object.
- *"Thiếu nhánh trong switch expression?"* → Chỉ là cảnh báo lúc biên dịch, nhưng ném `SwitchExpressionException` lúc chạy. Luôn có nhánh `_` trừ khi cố ý muốn nổ sớm.

**Cờ đỏ**

- Khẳng định dùng `required` hay file-scoped namespace trong dự án Unity 6.
- Dùng `record` cho dữ liệu tạo mỗi frame và không thấy vấn đề cấp phát.
- Nghĩ tuple cấp phát, hoặc ngược lại, nghĩ mọi struct đều không bao giờ cấp phát.
- Dựa vào default interface method trong thiết kế cho Unity.
- Đổi `LangVersion` trong `.csproj` rồi tưởng đã có C# 11.

**Số / ví dụ nên thuộc**

- Unity 2021.3 / 2022.3 / 6: **C# 9**, .NET Standard 2.1. Unity 2020.3: C# 8. Unity 2019.4: C# 7.3.
- Không có trong Unity 6: file-scoped namespace · `global using` · `record struct` · `required` · raw string · list pattern.
- Không hỗ trợ dù là C# 8: **default interface method**.
- `ValueTuple` là **struct** ⇒ trả nhiều giá trị không cấp phát.
- `record` là **class** ⇒ mỗi `with` là một object mới.
