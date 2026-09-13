---
id: csharp-generic
title: Generic, constraint và AOT
icon: 🧩
summary: Generic biên dịch ra gì cho class và ra gì cho struct, constraint nào bỏ được boxing, static field trong lớp generic thuộc về ai, và vì sao code generic chạy ngon trong Editor lại nổ trên bản IL2CPP.
status: deep
read: 792
level: intermediate
order: 60
tags: [csharp, generic, il2cpp, aot, performance, interview]
related: [csharp-type-system, csharp-collections, unity-build-platform, unity-design-patterns]
---

Generic có ba lý do tồn tại, và trong game thì lý do thứ ba mới là lý do thật: **an toàn kiểu** (không ép kiểu lung tung), **tái sử dụng code** (một `Pool<T>` cho mọi loại), và **không boxing** (value type đi qua generic vẫn là value type).

Lý do thứ ba dẫn thẳng tới phần khó: generic biên dịch ra **hai thứ khác nhau** tuỳ T là class hay struct, và sự khác nhau đó chính là nguyên nhân của loại lỗi khó chịu nhất trong Unity — code chạy hoàn hảo trong Editor rồi ném `ExecutionEngineException` trên điện thoại.

## Generic biên dịch ra cái gì

| T là | Runtime làm gì | Hệ quả |
|---|---|---|
| **Reference type** (`class`) | Dùng **chung một bản** code cho mọi T, vì mọi tham chiếu đều cùng kích thước | Không phình code; mỗi lần truy cập có thêm một lần gián tiếp nhỏ |
| **Value type** (`struct`, `int`, `enum`) | Sinh **một bản riêng cho từng T** | Không boxing, tốc độ như viết tay — đổi lại code phình ra, và **AOT phải sinh sẵn** |

Dòng cuối là gốc của mọi rắc rối trên IL2CPP: bản build là **AOT**, không có JIT để sinh code lúc chạy. Nếu `Pool<MyStruct>` không xuất hiện ở đâu trong code tĩnh, IL2CPP không sinh bản cho nó, và lúc chạy bạn nhận exception thay vì một hàm.

```csharp
// Chạy trong Editor (Mono có JIT), nổ trên IL2CPP nếu T là struct và tổ hợp này
// chưa từng xuất hiện tĩnh ở đâu:
var pool = (IPool)Activator.CreateInstance(typeof(Pool<>).MakeGenericType(structType));
```

Luật thực dụng: **đừng tạo kiểu generic bằng reflection với tham số là value type.** Muốn dữ liệu động thì dùng tham số là class, hoặc "chạm" trước vào tổ hợp cần dùng:

```csharp
#if ENABLE_IL2CPP
[UnityEngine.Scripting.Preserve]
static void AotHints()
{
    // gọi ảo nhưng không bao giờ chạy — chỉ để IL2CPP sinh sẵn các bản generic này
    new Pool<DamageEvent>();
    new Pool<GridPos>();
}
#endif
```

## Constraint — bảng tra

```csharp
where T : class            // T là kiểu tham chiếu; cho phép gán null, so sánh với null
where T : struct           // T là value type, KHÔNG nullable
where T : unmanaged        // struct không chứa tham chiếu nào -> dùng được cho Job/Burst, stackalloc
where T : new()            // có constructor không tham số -> new T() được
where T : MonoBehaviour    // kế thừa từ lớp này
where T : IDamageable      // implement interface này
where T : IEquatable<T>    // constraint tự quy chiếu — mẫu rất hay dùng
```

Constraint không chỉ để chặn sai; nó **mở khoá** cho trình biên dịch:

```csharp
// KHÔNG constraint: phải ép sang interface -> struct bị boxing mỗi lần gọi
void Hit(object target) => ((IDamageable)target).TakeDamage(10);

// CÓ constraint: lời gọi "constrained" — struct gọi thẳng, KHÔNG boxing
void Hit<T>(T target) where T : IDamageable => target.TakeDamage(10);
```

Đây là kỹ thuật đáng nhớ nhất trong node này: **generic + constraint interface là cách duy nhất để dùng interface với struct mà không boxing.** Nó xuất hiện trong mọi API hiệu năng cao của .NET và trong Unity DOTS.

`where T : unmanaged` là constraint riêng của thế giới game: nó đảm bảo struct không chứa tham chiếu nào, tức là copy được sang native memory, truyền vào Job và Burst compile được — xem [[unity-dots-jobs]].

## `static` trong lớp generic thuộc về ai

```csharp
class Counter<T> { public static int Count; }

Counter<int>.Count++;          // 1
Counter<float>.Count++;        // 1  — biến KHÁC, không phải 2
Counter<Enemy>.Count++;        // 1  — lại một biến khác nữa
```

Mỗi **kiểu đóng** (`Counter<int>`, `Counter<float>`) là một kiểu riêng biệt với bộ static field riêng. Đây vừa là bẫy (tưởng chung một bộ đếm) vừa là mẫu rất mạnh: nó cho bạn một **bảng tra theo kiểu, không cần dictionary và không tốn một lần băm nào**.

```csharp
// Cache theo kiểu: mỗi T có slot riêng, truy cập nhanh như đọc một field tĩnh
static class ComponentCache<T> where T : Component
{
    public static readonly string TypeName = typeof(T).Name;
}
```

Trong Unity, mẫu `Singleton<T>` dùng đúng cơ chế này — mỗi lớp con có một instance riêng vì static field nằm ở kiểu đóng.

## Variance: `out`, `in`, và cái bẫy mảng

```csharp
class Enemy { } class Zombie : Enemy { }

IEnumerable<Enemy> all = new List<Zombie>();       // OK: IEnumerable<out T> hiệp biến — chỉ đọc ra
Action<Enemy> logEnemy = e => Log(e);
Action<Zombie> logZombie = logEnemy;               // OK: Action<in T> nghịch biến — chỉ nhận vào
```

- `out T` (**covariance**) — chỉ ra: `IEnumerable<Zombie>` dùng được ở chỗ cần `IEnumerable<Enemy>`.
- `in T` (**contravariance**) — chỉ vào: `Action<Enemy>` dùng được ở chỗ cần `Action<Zombie>`.
- `List<T>` **không** có variance, vì nó vừa đọc vừa ghi.

Và cái bẫy cổ điển, thứ mà C# thừa hưởng từ ngày đầu:

```csharp
object[] arr = new string[2];      // BIÊN DỊCH ĐƯỢC — mảng hiệp biến, nhưng không an toàn
arr[0] = 42;                       // NÉM ArrayTypeMismatchException lúc chạy
```

Mảng trong C# là hiệp biến ở mức biên dịch nhưng phải kiểm kiểu lúc chạy — nghĩa là **mọi lần ghi vào mảng kiểu tham chiếu đều tốn một phép kiểm tra**. Đây là một lý do ít người biết vì sao mảng struct nhanh hơn mảng class ngoài chuyện cache.

## Generic trong Unity — bốn chỗ vướng

| Chỗ | Chuyện gì xảy ra |
|---|---|
| Serialize field generic | Từ **Unity 2020.1** field kiểu generic của bạn serialize được. Trước đó phải tạo lớp con cụ thể: `[Serializable] class IntEvent : UnityEvent<int> { }` |
| `MonoBehaviour` generic | Không gắn thẳng lớp generic lên GameObject được; phải có một lớp con đóng kiểu |
| `GetComponent<T>()` | Là generic method bình thường, dùng thoải mái — nhưng cache kết quả trong `Awake` |
| Job / Burst | Chỉ nhận `where T : unmanaged`; mọi tham chiếu đều bị cấm |

## Chi phí: code phình và thời gian build

Mỗi tổ hợp value type sinh một bản code riêng. `Pool<int>`, `Pool<GridPos>`, `Pool<DamageEvent>` là ba bản. Với IL2CPP điều đó cộng vào **kích thước gói** và **thời gian build** — hai thứ có giới hạn cứng trên mobile và mini game.

Không phải lý do để tránh generic, mà là lý do để đừng generic hoá thứ chỉ có một cách dùng. Một `Pool<T>` là đúng; một `Manager<TConfig, TState, TEvent>` với đúng một tổ hợp là kiến trúc thừa.

## Bẫy còn lại

- **`default(T)` không phải `null` khi T là struct** — với `where T : struct` thì `default(T)` là giá trị 0, và so sánh `== null` không biên dịch.
- **So sánh `T` bằng `==` không dùng được** nếu T không có constraint phù hợp; dùng `EqualityComparer<T>.Default.Equals(a, b)` — và với struct có `IEquatable<T>` thì nó đi đường generic, không boxing.
- **`typeof(T)` trong vòng lặp nóng** không miễn phí; đưa vào `static readonly` của một lớp generic như mẫu `ComponentCache<T>` ở trên.
- **Generic virtual method trên value type** là tổ hợp nguy hiểm nhất với IL2CPP: `abstract T Process<T>(T x)` được override và gọi với struct → dễ nổ AOT. Tránh, hoặc ghim bằng `AotHints`.
- **Constraint `new()`** gọi `Activator.CreateInstance` bên dưới, chậm hơn `new` thường rõ rệt; ở chỗ nóng thì truyền vào một factory delegate thay vì dùng `new T()`.

## Kiểm tra nhanh

- [ ] API nóng nhận struct dùng `where T : IInterface` thay vì tham số kiểu interface
- [ ] Không tạo kiểu generic với value type bằng reflection (`MakeGenericType`)
- [ ] Struct truyền vào Job đều thoả `where T : unmanaged`
- [ ] Biết rõ static field trong lớp generic là riêng cho từng T, và chỗ nào đang dựa vào điều đó
- [ ] Đã build thử **IL2CPP Release** trước khi tin code generic chạy được
- [ ] Không generic hoá thứ chỉ có một tổ hợp duy nhất

## 🤖 Prompt cho AI

**Dùng AI thế nào cho code generic**

AI viết generic rất trôi chảy và đó chính là rủi ro: nó sẽ đề xuất `Repository<TEntity, TKey>` cho một game có bốn loại dữ liệu. Chủ đề này cần bạn giữ vai trò **người cắt**, còn AI làm phần cơ học.

Nơi AI thật sự có ích: **thêm constraint đúng** cho một API sẵn có để bỏ boxing, **sinh hint AOT** cho các tổ hợp generic dùng qua dữ liệu, và **giải thích một exception IL2CPP** khi bạn dán stack trace vào. Nơi nó kém: dự đoán kiểu nào sẽ được dùng lúc chạy — nó không biết dự án bạn tạo `Pool<T>` cho những T nào, nên danh sách hint nó sinh ra luôn thiếu.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **T sẽ là class hay struct**, và danh sách T cụ thể nếu biết — quyết định toàn bộ phần AOT.
- **Backend build**: Mono hay IL2CPP, và có bật Managed Stripping mức nào.
- **Có đi qua Job/Burst không** — nếu có thì bắt buộc `unmanaged`.
- **API này có được gọi trong vòng lặp nóng không** — quyết định có đáng đổi sang generic để bỏ boxing hay không.

**Mẫu prompt**

```
Unity 6, IL2CPP, Android, Managed Stripping = Medium.

API hiện tại nhận tham số kiểu interface và đang boxing struct:

<dán code>

Việc:
1. Viết lại thành generic + constraint để bỏ boxing. Giải thích vì sao bản mới
   không boxing (nói tới constrained call, đừng chỉ khẳng định).
2. Liệt kê các tổ hợp generic sẽ xuất hiện, và chỉ ra cái nào có nguy cơ bị
   IL2CPP bỏ qua vì chỉ được tạo qua dữ liệu/reflection.
3. Sinh một hàm AotHints [Preserve] ghim các tổ hợp đó.

Ràng buộc: KHÔNG dùng MakeGenericType. KHÔNG thêm package.
Nếu có chỗ nào bạn không suy ra được T từ code tôi dán, HỎI tôi thay vì đoán.
```

**Bẫy thường gặp:** AI khẳng định một API generic "không boxing" mà không kiểm chỗ T bị ép sang interface bên trong thân hàm — chỉ cần một dòng `IDamageable d = target;` là boxing quay lại. Bẫy thứ hai: nó dùng `Activator.CreateInstance` hoặc `MakeGenericType` để "linh hoạt", thứ chạy ngon trong Editor và chết trên IL2CPP. Bẫy thứ ba: nó không biết static field trong lớp generic là riêng cho từng T, nên viết bộ đếm hay cache tưởng là dùng chung.

## 💻 Code

Demo ba điều: constraint interface bỏ boxing (đo bằng byte), static field trong lớp generic là riêng cho từng T, và một `Pool<T>` dùng được thật trong game. Chạy bằng `dotnet run`; `Pool<T>` copy thẳng vào dự án Unity được.

**Script**

```csharp
// Program.cs — .NET 6+ (dotnet new console && dotnet run)
using System;
using System.Collections.Generic;

interface IDamageable { void TakeDamage(int amount); int Hp { get; } }

struct Crate : IDamageable        // struct implement interface — chỗ boxing hay xảy ra
{
    public int Hp { get; private set; }
    public void TakeDamage(int amount) => Hp -= amount;
}

// ---- Pool<T>: dùng được thật, copy sang Unity chỉ cần đổi factory ----
public class Pool<T> where T : class
{
    readonly Stack<T> idle;
    readonly Func<T> factory;
    readonly Action<T> onGet, onRelease;
    public int CountIdle => idle.Count;
    public int CountAll { get; private set; }

    public Pool(Func<T> factory, int prewarm = 0, Action<T> onGet = null, Action<T> onRelease = null)
    {
        this.factory = factory ?? throw new ArgumentNullException(nameof(factory));
        this.onGet = onGet; this.onRelease = onRelease;
        idle = new Stack<T>(Math.Max(4, prewarm));
        for (int i = 0; i < prewarm; i++) { idle.Push(factory()); CountAll++; }
    }

    public T Get()
    {
        T item;
        if (idle.Count > 0) item = idle.Pop();
        else { item = factory(); CountAll++; }
        onGet?.Invoke(item);
        return item;
    }

    public void Release(T item)
    {
        if (item == null) return;
        onRelease?.Invoke(item);
        idle.Push(item);           // dự án thật: thêm kiểm tra trả về hai lần
    }
}

class Bullet { public float Speed; public bool Active; }

// ---- static field trong lớp generic ----
static class Counter<T> { public static int Count; }

static class Program
{
    const int N = 500_000;

    static void Main()
    {
        // 1) boxing hay không boxing
        long b0 = GC.GetTotalAllocatedBytes(true);
        for (int i = 0; i < N; i++) HitViaInterface(new Crate());
        long boxed = GC.GetTotalAllocatedBytes(true) - b0;

        b0 = GC.GetTotalAllocatedBytes(true);
        for (int i = 0; i < N; i++) HitGeneric(new Crate());
        long generic = GC.GetTotalAllocatedBytes(true) - b0;

        Console.WriteLine($"{N} lần gọi với struct:");
        Console.WriteLine($"  tham số kiểu interface : {boxed / 1024,6} KB  <- mỗi lần một lần boxing");
        Console.WriteLine($"  generic + constraint   : {generic,6} B   <- constrained call\n");

        // 2) static field là RIÊNG cho từng kiểu đóng
        Counter<int>.Count++;
        Counter<int>.Count++;
        Counter<float>.Count++;
        Counter<Bullet>.Count++;
        Console.WriteLine($"Counter<int>    = {Counter<int>.Count}");
        Console.WriteLine($"Counter<float>  = {Counter<float>.Count}");
        Console.WriteLine($"Counter<Bullet> = {Counter<Bullet>.Count}   <- ba biến khác nhau\n");

        // 3) Pool<T>
        var pool = new Pool<Bullet>(
            factory: static () => new Bullet(),
            prewarm: 32,
            onGet: static b => b.Active = true,
            onRelease: static b => { b.Active = false; b.Speed = 0f; });

        var live = new List<Bullet>(64);
        b0 = GC.GetTotalAllocatedBytes(true);
        for (int frame = 0; frame < 1000; frame++)
        {
            for (int i = 0; i < 16; i++) { var b = pool.Get(); b.Speed = 10f; live.Add(b); }
            for (int i = live.Count - 1; i >= 0; i--) { pool.Release(live[i]); live.RemoveAt(i); }
        }
        long poolBytes = GC.GetTotalAllocatedBytes(true) - b0;

        Console.WriteLine($"Pool: 16.000 lần lấy/trả -> tạo mới tổng cộng {pool.CountAll} object");
        Console.WriteLine($"      cấp phát trong 1000 frame: {poolBytes} B");
    }

    static void HitViaInterface(IDamageable target) => target.TakeDamage(1);          // boxing
    static void HitGeneric<T>(T target) where T : IDamageable => target.TakeDamage(1); // không
}
```

**Chạy thử**
- Phần 1: đường interface cấp phát cỡ **12 MB** cho 500.000 lần gọi (24 byte mỗi lần boxing); đường generic in ra **0 B**. Cùng một struct, cùng một hàm, khác nhau đúng ở constraint.
- Phần 2: ba bộ đếm ra `2`, `1`, `1` — bằng chứng rằng `Counter<int>` và `Counter<float>` là hai kiểu khác nhau với hai static field khác nhau.
- Phần 3: sau 1000 frame lấy/trả 16 viên đạn mỗi frame, tổng số object **được tạo** vẫn là 32 (số prewarm), và cấp phát trong vòng lặp là **0 B**. Đó là toàn bộ lý do object pool tồn tại.
- Thử đổi `Pool<T>` sang `where T : struct` rồi build IL2CPP với một T chỉ được tạo qua reflection — đó là lúc `ExecutionEngineException` xuất hiện.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Generic để làm gì, khác `object` chỗ nào?**
  → Ba việc: an toàn kiểu lúc biên dịch, tái sử dụng code, và **không boxing** với value type. Dùng `object` thì mỗi lần đưa struct vào là một lần copy lên heap và mỗi lần lấy ra là một lần ép kiểu có thể sai lúc chạy. Generic giữ nguyên kiểu nên trình biên dịch bắt lỗi sớm và runtime không phải đóng hộp gì.
- `Junior` **`where T : new()` nghĩa là gì?**
  → T phải có constructor không tham số, để trong thân hàm gọi được `new T()`. Lưu ý nhỏ mà ít người biết: bên dưới nó đi qua `Activator.CreateInstance`, chậm hơn `new` thường đáng kể — ở chỗ nóng thì truyền vào một `Func<T>` factory thay vì dựa vào constraint này.
- `Mid` **Generic biên dịch ra gì?**
  → Tuỳ T. Với **reference type**, mọi T dùng chung một bản code vì mọi tham chiếu cùng kích thước. Với **value type**, runtime sinh một bản riêng cho từng T — nhờ vậy không boxing và tốc độ như viết tay, đổi lại code phình ra. Chính vế thứ hai là gốc của các lỗi AOT trên IL2CPP.
- `Mid` **Làm sao gọi method của interface trên một struct mà không boxing?**
  → Dùng generic có constraint: `void Hit<T>(T x) where T : IDamageable`. Trình biên dịch phát ra lời gọi **constrained**, gọi thẳng vào bản cài đặt của struct, không đóng hộp. Nếu viết tham số kiểu `IDamageable` thì mỗi lần gọi là một lần boxing — đo được bằng 24 byte mỗi lần.
- `Mid` **`static` trong một lớp generic thuộc về đâu?**
  → Về từng **kiểu đóng**: `Counter<int>` và `Counter<float>` có hai static field khác nhau. Đây vừa là bẫy khi tưởng dùng chung, vừa là mẫu hữu ích — nó cho một bảng tra theo kiểu nhanh hơn `Dictionary<Type, …>` vì không phải băm gì cả.
- `Senior` **Vì sao code generic chạy trong Editor mà nổ trên bản IL2CPP?**
  → Vì IL2CPP là AOT: mọi tổ hợp generic với value type phải được **sinh sẵn lúc build**. Editor chạy Mono có JIT nên tổ hợp nào cũng sinh được lúc chạy. Nếu một tổ hợp chỉ xuất hiện qua reflection hay `MakeGenericType` thì build không có bản đó và runtime ném `ExecutionEngineException`. Cách chữa là ghim tổ hợp bằng một hàm `[Preserve]` gọi tới nó, hoặc thiết kế lại để không tạo generic động.
- `Senior` **Covariance và contravariance là gì, mảng có an toàn không?**
  → `out T` cho phép dùng `IEnumerable<Zombie>` ở chỗ cần `IEnumerable<Enemy>` — chỉ đọc nên an toàn. `in T` là chiều ngược lại, dùng cho tham số đầu vào như `Action<in T>`. Mảng thì hiệp biến từ thời C# 1 nhưng **không an toàn**: `object[] a = new string[2]; a[0] = 42;` biên dịch được và ném `ArrayTypeMismatchException` lúc chạy — nghĩa là mọi lần ghi vào mảng kiểu tham chiếu đều phải kiểm kiểu.
- `Senior` **Generic có cái giá nào trong game mobile không?**
  → Có: mỗi tổ hợp value type sinh một bản code riêng, cộng vào **kích thước gói** và **thời gian build IL2CPP**. Với mini game hay game có hạn mức dung lượng thì đó là thứ đo được. Nên tôi generic hoá thứ thật sự có nhiều tổ hợp — pool, container, sự kiện có tham số — và không generic hoá thứ chỉ có một cách dùng.

**Khung trả lời 60 giây** — "Generic biên dịch ra gì, và vì sao nó liên quan tới IL2CPP?"

> Generic biên dịch ra hai thứ khác nhau tuỳ T. Nếu T là **reference type**, mọi T dùng chung một bản code, vì tham chiếu nào cũng cùng kích thước. Nếu T là **value type**, runtime sinh một bản riêng cho từng T — nhờ vậy không có boxing và tốc độ ngang code viết tay cho kiểu đó.
>
> Vế thứ hai là chỗ nối với IL2CPP. Bản build mobile là **AOT**, không có JIT, nên mọi tổ hợp generic với struct phải được sinh sẵn lúc build. Nếu một tổ hợp chỉ được tạo qua reflection hoặc `MakeGenericType` thì trong Editor nó chạy — Mono có JIT — còn trên điện thoại thì ném `ExecutionEngineException`.
>
> Nên hai luật của tôi là: không tạo generic động với value type, và nếu buộc phải có tổ hợp sinh theo dữ liệu thì ghim nó bằng một hàm `[Preserve]` gọi tới tổ hợp đó, rồi **build IL2CPP Release thử** trước khi tin là xong.

**Họ sẽ đào tiếp**

- *"Constraint nào bỏ được boxing?"* → `where T : IInterface` — trình biên dịch phát ra constrained call nên struct gọi thẳng. Tham số kiểu interface thì boxing mỗi lần.
- *"`unmanaged` để làm gì?"* → Đảm bảo struct không chứa tham chiếu nào, nên copy sang native memory được — điều kiện bắt buộc để dùng trong Job và Burst.
- *"Static field trong lớp generic?"* → Riêng cho từng kiểu đóng. Dùng làm cache theo kiểu thì rất nhanh; tưởng dùng chung thì thành bug.
- *"Sao biết build có bị thiếu tổ hợp generic không?"* → Chỉ có một cách chắc chắn: build IL2CPP Release và chạy trên thiết bị, đi qua đúng luồng dùng tổ hợp đó. Development build và Editor đều không tái hiện được — xem [[unity-build-platform]].
- *"Generic có làm build to lên không?"* → Có, mỗi tổ hợp value type là một bản code. Đáng chú ý với mobile và mini game; không phải lý do tránh generic, mà là lý do đừng generic hoá thứ chỉ dùng một kiểu.

**Cờ đỏ**

- Nói generic "chỉ là đường cú pháp cho `object`" — sai hẳn về cơ chế và về boxing.
- Dùng `MakeGenericType`/`Activator.CreateInstance` với value type rồi khẳng định chạy được trên mobile.
- Không biết static field trong lớp generic là riêng cho từng T.
- Generic hoá mọi lớp trong dự án, tạo `Manager<TA, TB, TC>` với đúng một tổ hợp.
- Chỉ test trong Editor rồi kết luận code generic an toàn.

**Số / ví dụ nên thuộc**

- Reference type dùng **chung một bản** code; value type sinh **một bản cho mỗi T**.
- Boxing một struct ≈ **24 byte** mỗi lần gọi qua tham số kiểu interface.
- Constraint bỏ boxing: **`where T : IInterface`** (constrained call).
- Lỗi AOT điển hình: **`ExecutionEngineException`**, chỉ xuất hiện trên bản IL2CPP.
- `where T : unmanaged` là điều kiện vào được **Job/Burst**.
