---
id: csharp-oop-interface
title: OOP, interface và composition
icon: 🧱
summary: abstract class hay interface, virtual/override/new khác nhau ra sao, vì sao cây kế thừa trong game luôn gãy ở tầng thứ ba, và SOLID nói bằng ví dụ game chứ không bằng định nghĩa.
status: deep
read: 788
level: basic
order: 20
tags: [csharp, oop, interface, solid, composition, interview]
related: [csharp-type-system, csharp-generic, unity-design-patterns, architecture-patterns]
refs:
  - "Nystrom — Game Programming Patterns, ch. Component"
  - "Albahari — C# 10 in a Nutshell, ch.3"
---

Phỏng vấn hỏi OOP theo hai tầng. Tầng một là cú pháp: `abstract` khác `interface` chỗ nào, `override` khác `new` chỗ nào — trả lời được là qua. Tầng hai mới là tầng thật: **"cây kế thừa của anh sâu mấy tầng?"** Người trả lời "năm, sáu tầng" thường chưa từng bảo trì một game qua năm thứ hai.

Trong game, kế thừa gãy sớm hơn ở mọi lĩnh vực khác, vì yêu cầu thiết kế thay đổi theo cách không xếp thành cây được: hôm nay `Enemy` bay, mai `Enemy` bay **và** tàng hình, hôm kia rương gỗ cũng biết bay. Unity trả lời bằng composition — mọi thứ là component gắn lên GameObject. C# trả lời bằng interface và delegate. Node này là phần ngôn ngữ của câu trả lời đó.

## `abstract class` hay `interface` — bảng quyết định

| | `abstract class` | `interface` |
|---|---|---|
| Chứa dữ liệu (field) | **Có** | Không (chỉ property, không state) |
| Chứa code sẵn | Có | Chỉ qua default implementation (C# 8) — hiếm dùng trong Unity |
| Một lớp kế thừa được mấy | **Một** | Nhiều |
| Constructor | Có | Không |
| Trả lời câu hỏi nào | "Cái này **là** gì" | "Cái này **làm được** gì" |
| Dùng trong game khi | Nhiều lớp chia chung state và luồng xử lý: `EnemyBase` giữ `hp`, `OnDeath` | Nhiều lớp không họ hàng cùng nhận một hành vi: `IDamageable`, `ISaveable`, `IPoolable` |

Câu chốt để nhớ: **`abstract` chia sẻ *cài đặt*, `interface` chia sẻ *hợp đồng*.** Một object trong game thường **là** một thứ nhưng **làm được** nhiều thứ — nên trong thực tế bạn có ít abstract class và nhiều interface.

Chi tiết Unity quan trọng: `MonoBehaviour` đã chiếm mất suất kế thừa duy nhất của bạn. Mọi chia sẻ hành vi khác phải đi qua interface hoặc component — đây là lý do kỹ thuật khiến code Unity nghiêng hẳn về composition, không phải chuyện phong cách.

## `virtual` / `override` / `new` — câu hỏi phân loại kinh điển

```csharp
class Weapon
{
    public virtual string Fire() => "bang";
    public string Reload() => "click";
}

class Shotgun : Weapon
{
    public override string Fire() => "boom";     // GHI ĐÈ: thay hẳn bản của cha
    public new string Reload() => "cha-chunk";   // CHE: chỉ che khi biến có kiểu Shotgun
}

Weapon w = new Shotgun();
w.Fire();     // "boom"   — chọn theo kiểu THẬT lúc chạy
w.Reload();   // "click"  — chọn theo kiểu KHAI BÁO lúc biên dịch  ← chỗ bẫy
```

`override` dùng bảng method ảo nên đi theo **kiểu thật của object**. `new` chỉ che tên ở mức biên dịch, nên kết quả phụ thuộc **kiểu của biến** — hai dòng code giống hệt nhau cho ra hai kết quả khác nhau tuỳ bạn khai biến là `Weapon` hay `Shotgun`. Đó là lý do `new` gần như luôn là dấu hiệu thiết kế sai; C# bắt bạn viết rõ từ khoá đó để không ai vô tình che nhầm.

Ba từ khoá đi kèm:

- `abstract` — không có thân hàm, lớp con **bắt buộc** override.
- `sealed override` — override rồi khoá lại, không cho lớp cháu đè tiếp. Còn giúp JIT/AOT gọi trực tiếp thay vì tra bảng.
- `base.Fire()` — gọi bản của lớp cha từ trong bản override.

## Chi phí thật của đa hình

Trong vòng lặp nóng (mỗi frame, hàng nghìn lần), ba cách gọi có giá khác nhau:

| Cách gọi | Cơ chế | Chi phí tương đối |
|---|---|---|
| Gọi hàm thường (`sealed`, `static`) | Gọi thẳng, có thể được inline | 1× |
| `virtual` / `override` | Một lần tra bảng method ảo | ~1.2–2× |
| Qua `interface` | Tra bảng interface, khó inline hơn | ~1.5–3× |

Con số này **không** quan trọng ở 90% code trong game: gọi virtual vài trăm lần mỗi frame là vô hình. Nó chỉ quan trọng ở vòng lặp hàng chục nghìn lần — lúc đó câu trả lời đúng thường không phải "bỏ virtual" mà là "đổi cách bố trí dữ liệu", ví dụ chuyển sang mảng struct và Job — xem [[unity-dots-jobs]].

Điều đáng nói trong phỏng vấn là **thứ tự ưu tiên**: đo trước, và nếu phải bỏ đa hình thì bỏ vì lý do dữ liệu (cache miss) chứ không phải vì lý do bảng ảo.

## Vì sao cây kế thừa trong game luôn gãy ở tầng thứ ba

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="So sánh cây kế thừa sâu bị trùng lặp khi cần enemy vừa bay vừa tàng hình, với mô hình composition nơi enemy là một vỏ rỗng gắn thêm các component hành vi">
  <text x="20" y="24" class="fig-label" font-size="12" font-weight="600">Kế thừa — gãy ở tầng 3</text>
  <rect x="20" y="34" width="110" height="30" rx="6" class="fig-box"/>
  <text x="75" y="53" text-anchor="middle" class="fig-label" font-size="11">Enemy</text>
  <line x1="75" y1="64" x2="45" y2="84" class="fig-line"/>
  <line x1="75" y1="64" x2="180" y2="84" class="fig-line"/>
  <rect x="0" y="84" width="105" height="30" rx="6" class="fig-box"/>
  <text x="52" y="103" text-anchor="middle" class="fig-label" font-size="11">FlyingEnemy</text>
  <rect x="128" y="84" width="105" height="30" rx="6" class="fig-box"/>
  <text x="180" y="103" text-anchor="middle" class="fig-label" font-size="11">StealthEnemy</text>
  <rect x="40" y="140" width="170" height="46" rx="6" fill="#ff8787" opacity="0.18"/>
  <text x="125" y="159" text-anchor="middle" class="fig-label" font-size="11">FlyingStealthEnemy?</text>
  <text x="125" y="176" text-anchor="middle" class="fig-muted" font-size="10">chép code từ cả hai nhánh</text>
  <line x1="52" y1="114" x2="90" y2="140" class="fig-line" stroke="#ff8787"/>
  <line x1="180" y1="114" x2="160" y2="140" class="fig-line" stroke="#ff8787"/>
  <text x="125" y="208" text-anchor="middle" class="fig-muted" font-size="10">tầng 4: FlyingStealthExplodingEnemy</text>
  <text x="125" y="224" text-anchor="middle" class="fig-muted" font-size="10">— và tới đây thì không ai cứu được nữa</text>
  <line x1="330" y1="20" x2="330" y2="236" class="fig-line"/>
  <text x="360" y="24" class="fig-label" font-size="12" font-weight="600">Composition — phẳng</text>
  <rect x="360" y="34" width="120" height="30" rx="6" class="fig-box"/>
  <text x="420" y="53" text-anchor="middle" class="fig-label" font-size="11">Enemy (vỏ rỗng)</text>
  <line x1="420" y1="64" x2="420" y2="80" class="fig-line"/>
  <rect x="360" y="80" width="130" height="26" rx="6" fill="#51cf9b" opacity="0.18"/>
  <text x="425" y="97" text-anchor="middle" class="fig-muted" font-size="10">FlyMovement : IMovement</text>
  <rect x="360" y="112" width="130" height="26" rx="6" fill="#51cf9b" opacity="0.18"/>
  <text x="425" y="129" text-anchor="middle" class="fig-muted" font-size="10">StealthAbility</text>
  <rect x="360" y="144" width="130" height="26" rx="6" fill="#51cf9b" opacity="0.18"/>
  <text x="425" y="161" text-anchor="middle" class="fig-muted" font-size="10">ExplodeOnDeath</text>
  <rect x="506" y="80" width="140" height="90" rx="6" class="fig-box"/>
  <text x="576" y="100" text-anchor="middle" class="fig-muted" font-size="10">Tổ hợp mới = thêm</text>
  <text x="576" y="116" text-anchor="middle" class="fig-muted" font-size="10">một dòng trong data,</text>
  <text x="576" y="132" text-anchor="middle" class="fig-muted" font-size="10">không thêm class.</text>
  <text x="576" y="154" text-anchor="middle" class="fig-muted" font-size="10">Designer tự ghép được.</text>
  <text x="500" y="208" class="fig-muted" font-size="10">Cái giá: khó lần theo luồng chạy hơn, và</text>
  <text x="500" y="224" class="fig-muted" font-size="10">phải tự định nghĩa thứ tự các component chạy.</text>
</svg>
<figcaption>Kế thừa xếp hành vi thành cây; yêu cầu thật của game lại là tổ hợp. Cứ thêm một hành vi độc lập thì số tổ hợp nhân đôi, và cây không biểu diễn được điều đó.</figcaption>
</figure>

Luật thực dụng: **kế thừa tối đa hai tầng** (`MonoBehaviour` → của bạn), mọi thứ khác là interface hoặc component. Khi thấy mình sắp viết tầng thứ ba, hỏi lại: cái phân biệt tầng này với tầng trên là **dữ liệu** (thì đưa vào ScriptableObject — xem [[data-driven-design]]) hay **hành vi** (thì tách thành component).

## SOLID bằng ví dụ game

Định nghĩa thì ai cũng đọc được; phỏng vấn hỏi để nghe **ví dụ**:

| Chữ | Nghĩa một câu | Ví dụ trong game |
|---|---|---|
| **S** — trách nhiệm đơn | Một lớp chỉ có một lý do để bị sửa | `PlayerController` chỉ đọc input và di chuyển; máu, âm thanh, hiệu ứng nằm ở nơi khác |
| **O** — mở/đóng | Thêm hành vi bằng thêm code, không sửa code cũ | Thêm loại đạn mới = thêm một `ScriptableObject` + một `IProjectileBehaviour`, không đụng `WeaponSystem` |
| **L** — thay thế được | Lớp con dùng được ở mọi chỗ lớp cha dùng được | `InvincibleDummy : IDamageable` nhận sát thương mà không chết là **vi phạm** nếu code gọi giả định máu phải giảm |
| **I** — tách interface | Đừng bắt ai implement thứ họ không cần | Tách `IDamageable` với `IHealable` thay vì một `ICombatEntity` mười hàm |
| **D** — đảo phụ thuộc | Phụ thuộc vào hợp đồng, không vào lớp cụ thể | `EnemyAI` nhận `IPlayerLocator`, không gọi thẳng `PlayerManager.Instance` |

Chữ **D** là chữ trả lời được nhiều câu phỏng vấn nhất, vì nó dẫn thẳng sang testability: chỗ nào gọi `Singleton.Instance` thì chỗ đó không viết được unit test — xem [[unity-testing-ci]].

## Bốn công cụ hay dùng mà ít người nói được tên

```csharp
// 1) Explicit interface implementation — giấu hàm khỏi API công khai của lớp
public class Chest : IDamageable
{
    void IDamageable.TakeDamage(int amount) { /* chỉ gọi được khi ép sang IDamageable */ }
}

// 2) Extension method — thêm hàm cho kiểu mình không sở hữu (kể cả Vector3)
public static class VectorExt
{
    public static Vector3 Flat(this Vector3 v) => new Vector3(v.x, 0f, v.z);
}

// 3) partial class — tách file sinh tự động khỏi file viết tay
public partial class SaveData { }      // file này do codegen sinh
public partial class SaveData { }      // file này người viết

// 4) Lớp lồng + private constructor — ép mọi người tạo đối tượng qua factory
public class Ability
{
    private Ability() { }
    public static Ability Create(AbilityConfig cfg) => new Ability();
}
```

Explicit implementation đáng nhớ nhất vì nó là câu trả lời cho "hai interface có cùng tên hàm thì sao" — một câu hỏi mid-level hay gặp.

## Bẫy còn lại

- **Gọi method ảo trong constructor**: lớp cha chạy constructor trước, gọi hàm đã bị lớp con override, mà field của lớp con **chưa được gán** → `null` khó hiểu. Đây là lý do Unity khuyên khởi tạo trong `Awake`/`Start` chứ không phải constructor.
- **Interface không serialize được trong Inspector.** Unity không vẽ field kiểu interface. Đường vòng: giữ field kiểu `MonoBehaviour` rồi ép kiểu, hoặc dùng `[SerializeReference]` cho object thường (không phải `UnityEngine.Object`).
- **`GetComponent<IInterface>()` chạy được** trong Unity — hay bị tưởng là không. Nhưng nó chậm hơn `GetComponent<ConcreteType>()`, nên cache lại trong `Awake`.
- **Equals/GetHashCode quên đi cùng nhau**: override `Equals` mà không override `GetHashCode` làm hỏng mọi `Dictionary`/`HashSet` chứa kiểu đó. Trình biên dịch chỉ cảnh báo, không chặn.
- **`protected` field** bị lạm dụng: nó là API công khai với mọi lớp con, và sửa nó sau này là đổi hợp đồng với chính mình.

## Kiểm tra nhanh

- [ ] Không có cây kế thừa nào sâu quá hai tầng dưới `MonoBehaviour`
- [ ] Không có từ khoá `new` nào để che method — nếu có thì đó là chủ ý, có comment
- [ ] Mỗi interface dưới 5 hàm, tên đọc lên nghe như một khả năng (`IDamageable`, `ISaveable`)
- [ ] Không gọi method ảo trong constructor
- [ ] Lớp nào override `Equals` thì cũng override `GetHashCode`
- [ ] Hệ thống cấp cao nhận interface qua tham số, không gọi `Singleton.Instance` bên trong

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc thiết kế lớp và tách interface**

AI có một thiên kiến rất mạnh ở chủ đề này: **nó thích kế thừa và thích trừu tượng sớm**. Hỏi "thiết kế hệ thống enemy" thì mười lần như mười nó trả về `Enemy` → `MeleeEnemy` → `BossMeleeEnemy`, kèm ba interface cho những thứ chỉ có một cài đặt. Đó là kiến trúc trông chuyên nghiệp và sẽ phải viết lại ở tháng thứ ba.

Cách dùng đúng: **đưa cho AI danh sách hành vi thật, bắt nó đề xuất cách tổ hợp, và cấm nó tạo tầng kế thừa thứ ba**. Nó rất giỏi ở việc sau đó: sinh interface, sinh lớp cài đặt, viết adapter, đổi từ `Singleton.Instance` sang tiêm phụ thuộc qua constructor.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Danh sách hành vi cụ thể** và hành vi nào tổ hợp được với hành vi nào — đây là thông tin duy nhất quyết định thiết kế.
- **Chạy trong Unity hay C# thuần**: có `MonoBehaviour` thì suất kế thừa đã bị chiếm, và interface không serialize được.
- **Ai tạo nội dung**: nếu designer phải ghép hành vi không qua lập trình viên thì bắt buộc data-driven, không phải lớp mới.
- **Số lượng và tần suất gọi**: 20 enemy hay 5000 — quyết định có chấp nhận interface dispatch trong vòng lặp không.

**Mẫu prompt**

```
Unity 6, C# 9. Thiết kế phần enemy cho một game hành động.

Hành vi thật (tổ hợp tự do với nhau):
- di chuyển: đi bộ / bay / dịch chuyển
- tấn công: cận chiến / bắn / nổ khi chết
- phòng thủ: giáp / tàng hình / hồi máu

Yêu cầu:
- KHÔNG quá 2 tầng kế thừa (MonoBehaviour -> lớp của tôi là hết)
- Tổ hợp mới phải ghép được bằng DỮ LIỆU (ScriptableObject), không cần class mới
- Interface tối đa 4 hàm, đặt tên theo khả năng
- Nêu rõ thứ tự các component chạy trong một frame và ai sở hữu máu

Trả về: sơ đồ quan hệ + chữ ký các interface + MỘT ví dụ enemy ghép từ 3 hành vi.
KHÔNG viết cài đặt chi tiết ở bước này.
```

**Bẫy thường gặp:** AI trừu tượng hoá sớm — tạo `IEnemyFactory`, `IEnemyRepository`, `IEnemyService` cho một game có 6 loại enemy. Bẫy thứ hai: nó đặt state (máu) vào nhiều component cùng lúc, và khi hai component cùng trừ máu thì không ai biết ai là nguồn chân lý. Bắt nó chỉ rõ **một** chủ sở hữu cho mỗi mẩu state. Bẫy thứ ba: nó dùng `new` để che method của lớp cha rồi giải thích như thể đó là override.

## 💻 Code

Demo in ra khác biệt giữa `override` và `new` — thứ đọc mô tả thì gật gù nhưng nhìn output mới nhớ — cộng một ví dụ composition nhỏ cho thấy tổ hợp hành vi không cần class mới. Chạy bằng `dotnet run`.

**Script**

```csharp
// Program.cs — .NET 6+ (dotnet new console && dotnet run)
using System;
using System.Collections.Generic;

// ---------- phần 1: override vs new ----------
class Weapon
{
    public virtual string Fire() => "Weapon.Fire";
    public string Reload() => "Weapon.Reload";
    public Weapon() { Console.WriteLine("  ctor cha gọi: " + Fire()); }  // BẪY: gọi hàm ảo trong ctor
}

class Shotgun : Weapon
{
    readonly string ammoName = "shell";                 // gán SAU khi ctor cha chạy xong
    public override string Fire() => "Shotgun.Fire (" + (ammoName ?? "CHƯA GÁN") + ")";
    public new string Reload() => "Shotgun.Reload";
}

// ---------- phần 2: composition ----------
interface IAbility { string Name { get; } void Tick(Actor self, float dt); }

class Actor
{
    public string Name;
    public int Hp = 100;                                 // MỘT chủ sở hữu duy nhất của máu
    readonly List<IAbility> abilities = new List<IAbility>();
    public Actor With(IAbility a) { abilities.Add(a); return this; }
    public void Tick(float dt) { foreach (var a in abilities) a.Tick(this, dt); }
    public override string ToString() => $"{Name} hp={Hp}";
}

class Regen : IAbility
{
    public string Name => "Regen";
    public void Tick(Actor self, float dt) { self.Hp = Math.Min(100, self.Hp + (int)(5 * dt)); }
}

class Burning : IAbility
{
    public string Name => "Burning";
    public void Tick(Actor self, float dt) { self.Hp -= (int)(12 * dt); }
}

class Fly : IAbility
{
    public string Name => "Fly";
    public void Tick(Actor self, float dt) { /* chỉ đổi cách di chuyển, không đụng máu */ }
}

static class Program
{
    static void Main()
    {
        Console.WriteLine("— phần 1: override vs new —");
        Shotgun s = new Shotgun();
        Weapon w = s;                                    // CÙNG một object, hai kiểu khai báo

        Console.WriteLine($"w.Fire()   = {w.Fire()}");   // override -> theo kiểu THẬT
        Console.WriteLine($"s.Fire()   = {s.Fire()}");
        Console.WriteLine($"w.Reload() = {w.Reload()}"); // new -> theo kiểu KHAI BÁO
        Console.WriteLine($"s.Reload() = {s.Reload()}");

        Console.WriteLine("\n— phần 2: composition —");
        var bat = new Actor { Name = "Bat" }.With(new Fly()).With(new Regen());
        var burningBat = new Actor { Name = "BurningBat" }.With(new Fly()).With(new Burning());
        // tổ hợp thứ ba: KHÔNG cần class mới
        var burningRegenBat = new Actor { Name = "Phoenix" }.With(new Fly()).With(new Burning()).With(new Regen());

        for (int frame = 0; frame < 3; frame++)
            foreach (var a in new[] { bat, burningBat, burningRegenBat }) a.Tick(1f);

        Console.WriteLine(bat);
        Console.WriteLine(burningBat);
        Console.WriteLine(burningRegenBat);
    }
}
```

**Chạy thử**
- Dòng đầu in ra `Shotgun.Fire (CHƯA GÁN)`: constructor của lớp cha gọi hàm ảo **trước khi** field `ammoName` của lớp con được gán. Đây là lý do đừng gọi hàm ảo trong constructor — trong Unity thì đừng khởi tạo trong constructor, dùng `Awake`.
- `w.Fire()` và `s.Fire()` cho **cùng** kết quả (override), nhưng `w.Reload()` ra `Weapon.Reload` còn `s.Reload()` ra `Shotgun.Reload` — cùng một object, hai kết quả, chỉ vì kiểu khai báo khác nhau. Đó là `new`.
- Phần 2: `Phoenix` tổ hợp ba hành vi mà không có class nào tên `FlyingBurningRegenActor`. Đổi thứ tự `.With(...)` rồi chạy lại — máu cuối khác đi, và đó chính là cái giá của composition: **thứ tự chạy trở thành thứ bạn phải tự định nghĩa**.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`abstract class` và `interface` khác nhau thế nào, khi nào dùng cái nào?**
  → `abstract class` chia sẻ **cài đặt**: có field, có code sẵn, có constructor, nhưng chỉ kế thừa được một. `interface` chia sẻ **hợp đồng**: không state, implement được nhiều cái. Trong Unity thì `MonoBehaviour` đã chiếm mất suất kế thừa duy nhất, nên thực tế tôi dùng ít abstract class và nhiều interface như `IDamageable`, `ISaveable`.
- `Junior` **`override` và `new` khác nhau thế nào?**
  → `override` ghi đè thật: gọi qua biến kiểu cha vẫn chạy bản của con, vì nó đi qua bảng method ảo. `new` chỉ **che** tên ở mức biên dịch: cùng một object mà khai biến kiểu cha thì chạy bản cha, khai kiểu con thì chạy bản con. Vì gây nhầm lẫn như vậy nên `new` gần như luôn là dấu hiệu thiết kế sai.
- `Junior` **Interface trong Unity có `GetComponent` được không?**
  → Được, `GetComponent<IDamageable>()` chạy bình thường. Hai lưu ý: nó chậm hơn tìm theo kiểu cụ thể nên cần cache trong `Awake`, và Unity **không** vẽ được field kiểu interface trong Inspector — muốn kéo thả thì giữ field kiểu `MonoBehaviour` rồi ép kiểu, hoặc dùng `[SerializeReference]`.
- `Mid` **Vì sao nên ưu tiên composition hơn kế thừa trong game?**
  → Vì yêu cầu của game là **tổ hợp** chứ không phải phân loại. Có enemy bay, có enemy tàng hình, rồi sẽ có enemy vừa bay vừa tàng hình — cây kế thừa không biểu diễn được tổ hợp nên bạn phải chép code hoặc đẻ ra tầng thứ tư. Với composition, tổ hợp mới là một dòng dữ liệu, và designer ghép được mà không cần lập trình viên.
- `Mid` **Cái giá của composition là gì?**
  → Khó lần theo luồng chạy hơn: nhìn một object không biết ngay nó làm gì, phải xem nó gắn những component nào. Và **thứ tự chạy** trở thành thứ mình phải tự định nghĩa — hai component cùng sửa máu theo thứ tự khác nhau cho kết quả khác nhau. Nên luật của tôi là mỗi mẩu state có đúng một chủ sở hữu, và thứ tự tick được khai báo rõ chứ không phụ thuộc thứ tự gắn component.
- `Mid` **Giải thích SOLID bằng ví dụ trong game, đừng dùng định nghĩa.**
  → Ví dụ chữ **O**: thêm loại đạn mới nên là thêm một ScriptableObject và một `IProjectileBehaviour`, không phải sửa `switch` trong `WeaponSystem`. Ví dụ chữ **D**: `EnemyAI` nhận `IPlayerLocator` qua tham số thay vì gọi `PlayerManager.Instance` — nhờ vậy test được bằng một locator giả. Chữ **D** là chữ đổi được nhiều nhất vì nó quyết định code có viết test được hay không.
- `Senior` **Cây kế thừa của anh sâu mấy tầng, và vì sao?**
  → Tối đa hai: `MonoBehaviour` rồi tới lớp của tôi. Khi thấy mình sắp viết tầng thứ ba, tôi hỏi cái phân biệt tầng này là **dữ liệu** hay **hành vi**. Dữ liệu thì đưa vào ScriptableObject, hành vi thì tách thành component. Tầng thứ ba hầu như luôn là dấu hiệu tôi đang mã hoá một tổ hợp thành một cái tên.
- `Senior` **Đa hình có đáng lo về hiệu năng không?**
  → Ở 90% code thì không: một lần tra bảng ảo là vài nanosecond, gọi vài trăm lần mỗi frame là vô hình. Nó chỉ đáng nói khi vòng lặp chạy hàng chục nghìn lần, và khi đó thủ phạm thật thường là **cache miss** do object nằm rải rác trên heap, không phải chi phí gọi hàm. Cách chữa đúng lúc đó là đổi bố trí dữ liệu — mảng struct, Job, Burst — chứ không phải bỏ `virtual`.
- `Senior` **Vì sao không nên gọi method ảo trong constructor?**
  → Vì constructor của lớp cha chạy trước, và nó sẽ gọi bản đã override của lớp con trong khi field của lớp con **chưa được gán** — bạn nhận `null` hoặc giá trị 0 ở chỗ không ai ngờ. Trong Unity điều này ít gặp hơn vì ta khởi tạo ở `Awake`/`Start` chứ không ở constructor, nhưng lý do gốc thì giống nhau: đừng chạy code phụ thuộc trạng thái chưa dựng xong.

**Khung trả lời 60 giây** — "Anh tổ chức code enemy thế nào, kế thừa hay composition?"

> Composition, và lý do rất cụ thể chứ không phải khẩu hiệu. Yêu cầu của game là **tổ hợp**: hôm nay có enemy bay, mai có enemy tàng hình, rồi chắc chắn sẽ có enemy vừa bay vừa tàng hình. Cây kế thừa không biểu diễn được tổ hợp — tới tầng thứ ba là bắt đầu chép code.
>
> Nên cấu trúc của tôi là: `Enemy` gần như là vỏ rỗng, giữ máu và danh sách hành vi. Mỗi hành vi là một component implement một interface nhỏ — di chuyển, tấn công, phòng thủ. Tổ hợp mới là một dòng dữ liệu trong ScriptableObject, designer ghép được mà không cần tôi.
>
> Cái giá thì tôi cũng nói luôn vì nó thật: khó lần theo luồng chạy hơn, và thứ tự chạy giữa các component trở thành thứ phải tự định nghĩa. Tôi xử lý bằng hai luật — mỗi mẩu state có đúng một chủ sở hữu, và thứ tự tick khai báo rõ ràng chứ không phụ thuộc thứ tự gắn component.

**Họ sẽ đào tiếp**

- *"Vậy anh không bao giờ dùng kế thừa?"* → Có chứ, tối đa hai tầng và khi các lớp con thật sự chia chung state và luồng xử lý — ví dụ một `EnemyBase` giữ máu và sự kiện chết. Kế thừa để **chia sẻ cài đặt** thì được; kế thừa để **phân loại** thì hỏng.
- *"Interface hay abstract class cho `IDamageable`?"* → Interface, vì nhận sát thương là một **khả năng**, và những thứ nhận sát thương không cùng họ: người chơi, enemy, rương gỗ, tường phá được. Không có state chung nào để chia sẻ.
- *"Thứ tự component chạy do gì quyết định?"* → Do tôi khai báo, không do Unity. Dựa vào thứ tự gắn component hay `Script Execution Order` là cách để lại bug không tái hiện được — xem [[unity-game-loop]].
- *"`new` để làm gì nếu nó sai?"* → Nó tồn tại cho tình huống lớp cha ở thư viện ngoài thêm một method trùng tên với method của bạn; C# bắt viết rõ `new` để bạn xác nhận là cố ý. Trong code của chính mình thì gần như luôn nên đổi tên thay vì che.
- *"Interface dispatch có chậm không?"* → Chậm hơn gọi trực tiếp cỡ 1.5–3 lần, nhưng con số đó chỉ có nghĩa ở vòng lặp hàng chục nghìn lần. Đo trước; và nếu phải bỏ thì thường vì bố trí dữ liệu chứ không vì bảng ảo.

**Cờ đỏ**

- Vẽ cây kế thừa năm tầng và gọi đó là "thiết kế OOP tốt".
- Trả lời SOLID bằng đúng năm định nghĩa sách giáo khoa, không có ví dụ nào từ dự án thật.
- Nói "interface luôn tốt hơn abstract class" mà không nêu được trường hợp ngược lại.
- Tạo interface cho mọi lớp trong dự án, kể cả những lớp chỉ có một cài đặt duy nhất và sẽ mãi như vậy.
- Không phân biệt được `override` và `new` khi nhìn code.

**Số / ví dụ nên thuộc**

- Độ sâu kế thừa nên có trong game Unity: **tối đa 2 tầng** dưới `MonoBehaviour`.
- Chi phí tương đối: gọi trực tiếp 1× · virtual ~1.2–2× · interface ~1.5–3×.
- Kích thước interface lành mạnh: **dưới 5 hàm**, tên đọc lên là một khả năng.
- Ba tên interface hay dùng trong game: `IDamageable`, `ISaveable`, `IPoolable`.
