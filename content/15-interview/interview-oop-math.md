---
id: interview-oop-math
title: OOP, design pattern và toán 2D/3D
icon: 📐
summary: Ngân hàng câu hỏi và kiến thức cô đọng cho ba mảng studio game hay hỏi ngoài giải thuật — OOP và SOLID, các design pattern dùng thật trong game, toán vector/quaternion/va chạm — kèm demo C# console chạy được và 33 câu hỏi đáp có lời giải.
status: deep
read: 1112
level: intermediate
order: 15
tags: [interview, oop, pattern, math, vector]
related: [interview-algorithm, csharp-oop-interface, unity-design-patterns, architecture-patterns]
---

Tin tuyển của các studio game (kể cả studio Nhật như Ateam) thường ghi "thuật toán, cấu trúc dữ liệu, OOP", rồi điểm cộng "toán 2D/3D, design pattern". Phần thuật toán đã có ở [[interview-algorithm]]; node này lo ba mảng còn lại. Chúng hay xuất hiện ở **vòng code** (viết `Command` có undo, viết hàm kiểm tra kẻ địch trong tầm nhìn) lẫn **vòng hỏi đáp** (vì sao không dùng Singleton, quaternion nhân thế nào). Người làm Unity mười năm thường biết *dùng* hết những thứ này nhưng ít khi phải *nói ra* chúng gọn gàng — đó là khoảng trống node này lấp.

Kiến thức nền xem [[csharp-oop-interface]] (cú pháp C#), [[unity-design-patterns]] và [[architecture-patterns]] (pattern chi tiết), [[unity-patterns-in-practice]] (pattern trong dự án thật).

## A. OOP

### Bốn tính chất, mỗi tính chất một ví dụ game

| Tính chất | Nghĩa ngắn | Ví dụ game |
|---|---|---|
| **Encapsulation** (đóng gói) | Giấu trạng thái, chỉ lộ thao tác hợp lệ | `Health` có `TakeDamage()`, không cho ngoài ghi thẳng `hp = -5`; `hp` chỉ đổi qua một cửa nên chỗ nào cũng clamp, bắn event, kiểm chết |
| **Abstraction** (trừu tượng) | Chỉ lộ "làm gì", giấu "làm thế nào" | `IWeapon.Fire()` — người gọi không biết đó là súng hay phép; thêm vũ khí mới không sửa code gọi |
| **Inheritance** (kế thừa) | Con dùng lại và mở rộng cha, quan hệ "là một" | `Goblin : Enemy`. Dùng được nhưng là tính chất **dễ lạm dụng nhất** (xem composition bên dưới) |
| **Polymorphism** (đa hình) | Cùng lời gọi, hành vi tuỳ kiểu thật | `foreach (var e in enemies) e.Attack();` — mỗi loại tự đánh kiểu của nó, vòng lặp không `switch` theo loại |

### Abstract class hay interface

| | `abstract class` | `interface` |
|---|---|---|
| Có state (field) | Có | Không |
| Có code dùng chung | Có (method thường + abstract) | Chỉ default interface method (C# 8), ít dùng trong game |
| Kế thừa nhiều | Một cha duy nhất | Implement bao nhiêu cũng được |
| Dùng khi | Họ cùng loại thật sự chia sẻ code và state (`EnemyBase`) | Hợp đồng năng lực xuyên họ (`IDamageable`, `IInteractable`) |
| Giá | Cột chặt vào một cây kế thừa | Không tái dùng code — mỗi nơi implement lại |

Quy tắc ngón tay cái: bắt đầu bằng interface cho "con vật này làm được gì", chỉ lên abstract class khi đã thấy code trùng lặp thật. Trong Unity còn một ràng buộc: `GetComponent<IDamageable>()` hoạt động được với interface, nên interface là cách chuẩn để các `MonoBehaviour` không biết nhau mà vẫn nói chuyện.

### Composition over inheritance

Ví dụ kinh điển: game có `Enemy`. Rồi `FlyingEnemy`, `ShootingEnemy`. Rồi designer muốn kẻ địch **vừa bay vừa bắn** — `FlyingShootingEnemy`? Rồi **bay, bắn, và tàng hình**? Cây kế thừa nổ theo tổ hợp: n khả năng cần tới 2^n lớp, mà C# chỉ cho một cha.

```
Kế thừa (nổ tổ hợp)               Composition (cộng dồn)
Enemy                             Enemy = GameObject + các component:
 ├ FlyingEnemy                      Health, Mover(Walk|Fly), Weapon(Gun|Spell),
 ├ ShootingEnemy                    Stealth (tuỳ chọn)
 ├ FlyingShootingEnemy ???          -> ghép theo prefab, designer tự chọn
 └ FlyingShootingStealthEnemy ???
```

Component ghép từng khả năng, hành vi đổi lúc runtime (đóng băng = tháo `Mover`), thêm khả năng mới không đụng code cũ. Đây chính là kiến trúc của Unity (`GameObject` + `Component`). Giá phải trả: nhiều object nhỏ hơn, thứ tự khởi tạo/phụ thuộc giữa component phải quản (ai `GetComponent` ai), và khó đọc "con này làm gì" khi chỉ nhìn một file. Kế thừa vẫn tốt cho cây **nông, ổn định, thật sự "là một"** (một hai tầng).

### SOLID — mỗi chữ một ví dụ Unity

| Chữ | Phát biểu | Ví dụ Unity | Vi phạm trông thế nào |
|---|---|---|---|
| **S** — Single Responsibility | Một lớp một lý do để đổi | Tách `PlayerHealth`, `PlayerMovement`, `PlayerInput` | `Player.cs` 1500 dòng lo cả input, di chuyển, UI, save |
| **O** — Open/Closed | Mở để thêm, đóng để sửa | Thêm loại vũ khí bằng class `IWeapon` mới | Thêm vũ khí phải sửa `switch (weaponType)` ở 8 chỗ |
| **L** — Liskov Substitution | Con thay cha mà không làm hỏng người dùng | `Tank : Enemy` vẫn gọi được `Move()` | `Turret : Enemy` ném `NotImplementedException` ở `Move()` — chỗ nào lặp qua `Enemy` đều nổ |
| **I** — Interface Segregation | Interface nhỏ, đừng ép implement thứ không dùng | `IDamageable`, `IHealable` tách riêng | `ICharacter` có 20 method, tường đá cũng phải implement `Heal()` |
| **D** — Dependency Inversion | Phụ thuộc vào abstraction, không vào lớp cụ thể | `EnemyAI` nhận `ITarget` (inject qua Inspector/constructor) | `EnemyAI` gọi thẳng `GameManager.Instance.player` |

Trong phỏng vấn đừng đọc thuộc lòng năm chữ — chọn hai chữ bạn từng vấp trong dự án thật (thường là S và D) và kể chuyện.

### `override` và `new`, và chi phí virtual call

```csharp
class Enemy { public virtual void Attack() => Console.WriteLine("Enemy"); }
class Boss : Enemy { public override void Attack() => Console.WriteLine("Boss"); }   // đa hình thật
class Imp  : Enemy { public new void Attack()      => Console.WriteLine("Imp"); }    // che (hide)

Enemy e = new Boss(); e.Attack();   // "Boss"  — chọn theo kiểu THẬT lúc chạy
Enemy i = new Imp();  i.Attack();   // "Enemy" — chọn theo kiểu KHAI BÁO lúc biên dịch
```

`override` thay chỗ trong bảng ảo (vtable), `new` chỉ che tên: gọi qua biến kiểu cha vẫn ra bản của cha — nguồn của loại bug "đã sửa Attack mà kẻ địch vẫn đánh kiểu cũ". Hầu như luôn muốn `override`.

Virtual call = đọc con trỏ vtable rồi nhảy gián tiếp, chậm hơn call thường cỡ vài nano-giây và **chặn inlining** của compiler. Một triệu virtual call mỗi frame vẫn chỉ cỡ vài mili-giây trong trường hợp xấu — hiếm khi là nút cổ chai trước alloc và cache miss. Chỉ đáng bận tâm trong vòng lặp nóng hàng chục nghìn phần tử (hệ hạt, mô phỏng đám đông), lúc đó chuyển sang struct + dữ liệu phẳng (xem hướng DOTS). Đừng bỏ interface chỉ vì sợ virtual.

## B. Design pattern hay hỏi ở studio game

Điều người phỏng vấn muốn nghe không phải thuộc 23 pattern GoF, mà là: **bài toán game nào gọi tên pattern này, và nó có giá gì**.

| Pattern | Bài toán game | Cái giá |
|---|---|---|
| **Singleton** | `AudioManager`, `GameManager` cần truy cập từ mọi nơi | Trạng thái toàn cục ẩn: phụ thuộc không nhìn thấy, khó test, thứ tự khởi tạo mong manh, dọn khi đổi scene |
| **Observer / event** | HP đổi → cập nhật thanh máu, âm thanh, achievement mà `Health` không biết ai nghe | Rò rỉ nếu quên huỷ đăng ký, khó lần "ai gọi cái này", thứ tự listener không bảo đảm |
| **State / FSM** | Nhân vật Idle/Run/Jump/Attack, AI tuần tra/đuổi/chạy trốn | Số trạng thái và chuyển tiếp nổ tổ hợp (khi đó chuyển sang Behavior Tree, xem [[fsm]]) |
| **Command** | Undo/redo trong editor, replay, nhập phím tuỳ chỉnh, hàng đợi lệnh mạng | Mỗi hành động thành một object; undo yêu cầu lưu đủ dữ liệu để đảo ngược |
| **Object Pool** | Đạn, hiệu ứng, kẻ địch sinh ra liên tục | Phải reset trạng thái khi trả về; quên reset = bug "đạn cũ còn vận tốc cũ"; giữ bộ nhớ không trả lại |
| **Factory** | Tạo kẻ địch từ id/loại trong dữ liệu level mà người gọi không `new` cụ thể | Thêm một tầng gián tiếp; thừa nếu chỉ có một loại |
| **Strategy** | Đổi thuật toán lúc chạy: AI ngắm, cách tính sát thương, đường đạn | Nhiều class nhỏ; nếu thuật toán chỉ có hai biến thể thì `if` đơn giản hơn |
| **Component** | `GameObject` ghép khả năng — chính là Unity | Phụ thuộc ngầm giữa component, `GetComponent` rải khắp nơi |
| **Service Locator** | Truy cập `IAudio`, `ISave` mà không cột vào lớp cụ thể | Vẫn là toàn cục trá hình; lỗi thiếu service chỉ nổ ở runtime |
| **MVC / MVP** | UI inventory, shop: tách dữ liệu, hiển thị, logic | Nhiều file hơn cho UI nhỏ; binding thủ công dễ lệch pha |
| **Flyweight** | Hàng nghìn kẻ địch chung một bộ chỉ số — `ScriptableObject` | Dữ liệu dùng chung là **bất biến**; ghi vào nó là ghi cho tất cả (và còn ghi cả vào asset trong Editor) |

### Singleton: vì sao bị ghét và thay bằng gì

Singleton giải quyết "cần một và truy cập dễ", nhưng kéo theo ba cái hại: (1) **phụ thuộc ẩn** — nhìn constructor/Inspector không thấy lớp này cần `GameManager`; (2) **không test được** — không thay bằng giả, trạng thái rò giữa các test; (3) **thứ tự khởi tạo** — `Awake` của ai chạy trước? Đổi scene thì `DontDestroyOnLoad` sinh bản trùng.

Thay thế theo mức: **truyền tham chiếu rõ ràng** (kéo vào Inspector, hoặc inject qua constructor với class thuần C#); **ScriptableObject làm kênh sự kiện/dữ liệu** dùng chung; **Service Locator** có interface khi thật sự cần toàn cục; **DI container** (VContainer, Zenject) khi dự án lớn. Với prototype nhỏ, singleton vẫn chấp nhận được — nói được *khi nào* nó ổn mới là câu trả lời senior.

### MVC/MVP cho UI game

`Model` giữ dữ liệu (số vàng, danh sách item, không biết UI tồn tại), `View` chỉ hiển thị và bắn sự kiện người dùng (không có logic), `Presenter` nối hai bên: nghe event của Model để cập nhật View, nhận input từ View để gọi Model. Lợi: đổi UI (uGUI sang UI Toolkit) không đụng logic, test Presenter không cần Unity. Giá: boilerplate; với màn hình đơn giản thì quá tay. Trong Unity, MVP thường vừa đủ hơn MVC vì `View` là `MonoBehaviour` không tự gọi Model.

## C. Toán 2D/3D

### Vector cơ bản

- **Cộng** `a + b`: đi hết a rồi b. **Hiệu** `b - a`: vector **từ a tới b** (hướng nhìn từ a đến b) — dùng nhiều nhất trong game.
- **Độ dài** `|v| = sqrt(x² + y² + z²)`. Căn bậc hai tốn hơn nhân; cần **so sánh** khoảng cách thì dùng `sqrMagnitude` và so với bình phương: `(b - a).sqrMagnitude < range * range`. Đừng gọi `Distance` trong vòng lặp nóng chỉ để so ngưỡng.
- **Normalize** `v / |v|`: chỉ giữ hướng (độ dài 1). Vector gần 0 thì chia cho ~0 sinh NaN — kiểm trước (Unity trả về `Vector3.zero` nếu quá nhỏ).
- Lỗi kinh điển: di chuyển chéo nhanh hơn 1,41 lần khi cộng input `(1,1)` mà quên normalize.

### Dot product

`a · b = ax·bx + ay·by + az·bz = |a||b|cos θ`. Với hai vector **đã normalize**, `dot = cos θ` nằm trong [-1, 1]:

| `dot` | Góc | Ý nghĩa |
|---|---|---|
| `1` | 0° | Cùng hướng |
| `0` | 90° | Vuông góc |
| `-1` | 180° | Ngược hướng |

Ứng dụng: **phía trước hay sau** (`dot(forward, toTarget) > 0` là phía trước); **trong tầm nhìn** — `dot(forward, dirToTarget) >= cos(fov/2)` (so thẳng, khỏi `acos`; FOV 90° thì ngưỡng là `cos 45° ≈ 0,707`); **chiếu** vector a lên b: thành phần dọc theo b là `dot(a, b̂)`, và `proj = b̂ · dot(a, b̂)` — nền của khoảng cách điểm–đoạn, trượt dọc tường (`v - n·dot(v, n)`), phản xạ.

### Cross product

`a × b` (chỉ 3D) cho vector **vuông góc cả hai**, độ dài `|a||b| sin θ`, chiều theo quy tắc bàn tay (Unity dùng hệ **tay trái**, nên chiều ngược với sách toán dùng tay phải — kiểm bằng thử, đừng suy từ trí nhớ). Ứng dụng: **pháp tuyến** của tam giác `cross(b - a, c - a)`; **trái hay phải**: thành phần y của `cross(forward, toTarget)` — trong Unity (tay trái, y lên) dương nghĩa là target nằm bên **phải**; ở demo bên dưới dùng 2D với y lên nên dương là bên **trái**. Diện tích tam giác = ½·|cross|. Chốt: nhớ *cách dùng*, rồi thử với `Vector3.right` và `Vector3.up` để xác nhận dấu trong hệ toạ độ đang làm việc.

### Khoảng cách điểm tới đoạn thẳng

Chiếu điểm `p` lên đường `ab`: `t = dot(p - a, b - a) / |b - a|²`, **kẹp `t` vào [0, 1]** (ngoài khoảng thì điểm gần nhất là đầu mút), điểm gần nhất `a + t(b - a)`, khoảng cách là `|p - điểm đó|`. Dùng cho: viên đạn quét (swept) tránh xuyên mỏng, kiểm tra quái có chạm tia laser, snap vào đường đi.

### Lerp, Slerp, SmoothDamp, và lerp phụ thuộc frame rate

- `Lerp(a, b, t) = a + (b - a)·t`: nội suy **tuyến tính**, `t` kẹp [0,1]. `Slerp` nội suy **trên cung tròn** với tốc độ góc đều — dùng cho hướng/quaternion, vì lerp giữa hai vector làm độ dài hụt ở giữa (và quaternion lerp không giữ chuẩn trừ khi normalize lại).
- `SmoothDamp` lò xo tới đích, có vận tốc — mượt, không giật lúc đổi đích, camera hay dùng.
- **Bẫy lớn nhất:** `x = Lerp(x, target, 0.1f)` mỗi frame là "đuổi theo 10% mỗi frame" — chạy 144fps nhanh hơn 30fps cỡ 5 lần. Sửa bằng độ suy giảm mũ: `x = Lerp(x, target, 1 - exp(-k·dt))`. Mỗi giây luôn đi cùng một phần quãng đường, bất kể fps (demo bên dưới đo: ở k=5, sau 1 giây ra 0,9933 ở cả 30, 60 và 144fps, còn bản "0,1 mỗi frame" ra 0,9576 / 0,9982 / 1).

### Góc: Atan2

`Mathf.Atan2(y, x)` trả góc (radian, trong (-π, π]) của vector `(x, y)` so với trục x, **đúng cả bốn góc phần tư**. `Atan(y/x)` hỏng: mất dấu, chia cho 0 khi `x = 0`. Quay sprite 2D về phía chuột: `angleDeg = Atan2(dir.y, dir.x) * Mathf.Rad2Deg`. Chú ý thứ tự đối số: **y trước, x sau**.

### Ma trận và hệ toạ độ local/world

Một `Matrix4x4` (TRS) gói **dịch chuyển, xoay, co giãn** của một object. Điểm local → world: `world = M · local`; ngược lại dùng ma trận nghịch đảo. Trong Unity: `transform.TransformPoint(local)` (có scale + xoay + dịch), `TransformDirection` (chỉ xoay), `InverseTransformPoint` (world → local). Cha–con là **nhân ma trận**: world của con = world của cha · local của con, và thứ tự nhân quan trọng (xoay rồi dịch khác dịch rồi xoay). Bẫy: scale không đều ở cha làm con xoay bị méo.

### Quaternion

- Biểu diễn xoay bằng 4 số `(x, y, z, w)`, **không dùng để đọc**; cần đọc thì dùng Euler.
- **Gimbal lock**: với góc Euler, khi một trục xoay 90° thì hai trục còn lại trùng nhau, mất một bậc tự do. Quaternion không bị.
- **Không cộng góc Euler** để xoay tích luỹ (`euler += delta` rồi gán lại): kết quả phụ thuộc thứ tự và nhảy giá trị quanh 0/360. Dùng `rotation = Quaternion.Euler(delta) * rotation` hoặc `Quaternion.AngleAxis`.
- **Nhân quaternion = xoay nối**: `q2 * q1` là xoay theo q1 **trước** rồi q2 (đọc từ phải sang trái), và **không giao hoán**. `q * vector` xoay vector đó. `Quaternion.Inverse(q)` là xoay ngược.
- `Quaternion.LookRotation(forward, up)` cho phép xoay để trục z nhìn theo hướng cho trước — cách chuẩn để "quay mặt về phía kẻ địch". Hướng nhìn là `(target - self).normalized`; vector 0 thì cảnh báo/lỗi.

### Va chạm cơ bản

- **AABB vs AABB**: chồng nhau nếu chồng ở **mọi** trục: `minA.x <= maxB.x && maxA.x >= minB.x` (cùng với y, z). Rẻ nhất, không xoay.
- **Circle vs circle**: `|ca - cb|² <= (ra + rb)²` — so bình phương, không căn.
- **Raycast**: tia `o + t·d` cắt hình. Với vòng tròn: giải phương trình bậc hai theo t, delta < 0 là trượt (demo bên dưới). Nhớ tia mỏng + vật nhỏ bay nhanh → xuyên qua (tunneling) nếu chỉ kiểm tra vị trí cuối mỗi frame; cần quét (sweep) hoặc continuous collision.

### Bezier và easing

**Bezier bậc 2**: ba điểm `P0, P1, P2`; lerp hai lần: `B(t) = lerp(lerp(P0,P1,t), lerp(P1,P2,t), t)` = `(1-t)²P0 + 2(1-t)t·P1 + t²P2`. Đường đi cung cong của đạn pháo, đường bay của vật phẩm hút về ví. Bậc 3 thêm một điểm điều khiển, dùng cho đường đi mượt qua nhiều đoạn (spline).

**Easing**: biến `t` thẳng [0,1] thành đường cong — ease-in `t²` (chậm rồi nhanh), ease-out `1-(1-t)²` (nhanh rồi chậm), smoothstep `3t² - 2t³` (êm cả hai đầu). Dùng cho UI, camera, hoạt hình số; nhắc: easing biến đổi *t*, không đổi *đường đi*.

### Ngẫu nhiên có trọng số

Cộng dồn trọng số, bốc `roll ∈ [0, tổng)`, duyệt từ đầu và trả phần tử đầu tiên có cộng dồn > roll. Trọng số 70/25/5 ra tỉ lệ 70%/25%/5%. Là nền của drop table; xem [[randomness]] về pity, seed, và vì sao "ngẫu nhiên thật" thường không đúng cảm giác người chơi. Bẫy: dùng `Random.value` hai lần cho hai lần bốc độc lập khi thiết kế cần "không trùng" → phải loại trừ phần tử đã ra.

### Toạ độ màn hình ↔ thế giới

Ba hệ: **screen** (pixel, gốc góc dưới trái), **viewport** (0–1), **world**. `Camera.ScreenToWorldPoint(screenPos)` cần `z` là khoảng cách từ camera — không có z thì ra điểm ngay trên camera. Với camera perspective, ngắm chuột trong thế giới 3D thì phát **ray** `ScreenPointToRay` rồi raycast vào mặt phẳng/collider, vì một điểm màn hình ứng với cả một **đường** trong không gian. Với UI (Canvas Screen Space - Overlay), dùng `RectTransformUtility.ScreenPointToLocalPointInRectangle`. Xem [[unity-camera]] về chế độ camera và [[unity-physics]] về raycast, [[steering-flocking]] khi cần vector hướng đi cho AI.

## 💻 Code

Một chương trình console .NET, không phụ thuộc `UnityEngine` (tự viết `Vec2`/`Vec3` nhỏ), gom các phép toán và pattern ở trên: nón nhìn, trái/phải, điểm–đoạn, AABB/circle/ray, lerp độc lập fps, Bezier, weighted random và Command có undo. Kiểm chứng được bằng output cụ thể ở mục Chạy thử.

**Script**

```csharp
// Program.cs
using System;
using System.Collections.Generic;

public struct Vec2
{
    public float x, y;
    public Vec2(float x, float y) { this.x = x; this.y = y; }
    public static Vec2 operator +(Vec2 a, Vec2 b) => new Vec2(a.x + b.x, a.y + b.y);
    public static Vec2 operator -(Vec2 a, Vec2 b) => new Vec2(a.x - b.x, a.y - b.y);
    public static Vec2 operator *(Vec2 a, float s) => new Vec2(a.x * s, a.y * s);
    public static float Dot(Vec2 a, Vec2 b) => a.x * b.x + a.y * b.y;
    // Cross 2D = thành phần z của cross 3D: dương = b nằm bên TRÁI a (hệ trục y hướng lên)
    public static float Cross(Vec2 a, Vec2 b) => a.x * b.y - a.y * b.x;
    public float SqrMagnitude => x * x + y * y;
    public float Magnitude => MathF.Sqrt(SqrMagnitude);
    public Vec2 Normalized
    {
        get { float m = Magnitude; return m > 1e-6f ? new Vec2(x / m, y / m) : new Vec2(0, 0); }
    }
    public static Vec2 Lerp(Vec2 a, Vec2 b, float t) => a + (b - a) * t;
    public override string ToString() => $"({x:0.###}, {y:0.###})";
}

public struct Vec3
{
    public float x, y, z;
    public Vec3(float x, float y, float z) { this.x = x; this.y = y; this.z = z; }
    public static Vec3 Cross(Vec3 a, Vec3 b) =>
        new Vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
    public static float Dot(Vec3 a, Vec3 b) => a.x * b.x + a.y * b.y + a.z * b.z;
    public override string ToString() => $"({x:0.###}, {y:0.###}, {z:0.###})";
}

public static class GameMath
{
    // Kẻ địch có nằm trong hình nón nhìn không? So dot với cos(nửa góc), không cần acos.
    public static bool InCone(Vec2 eye, Vec2 forward, Vec2 target, float fovDeg, float range)
    {
        Vec2 to = target - eye;
        if (to.SqrMagnitude > range * range) return false;
        if (to.SqrMagnitude < 1e-12f) return true;
        float cosHalf = MathF.Cos(fovDeg * 0.5f * MathF.PI / 180f);
        return Vec2.Dot(forward.Normalized, to.Normalized) >= cosHalf;
    }

    public static string Side(Vec2 forward, Vec2 target)
    {
        float c = Vec2.Cross(forward, target);
        return c > 0 ? "trái" : c < 0 ? "phải" : "thẳng hàng";
    }

    // Khoảng cách từ điểm p tới đoạn ab: chiếu rồi kẹp t vào [0,1]
    public static float PointSegmentDistance(Vec2 p, Vec2 a, Vec2 b)
    {
        Vec2 ab = b - a;
        float len2 = ab.SqrMagnitude;
        if (len2 < 1e-12f) return (p - a).Magnitude;
        float t = Math.Clamp(Vec2.Dot(p - a, ab) / len2, 0f, 1f);
        return (p - (a + ab * t)).Magnitude;
    }

    public static bool AabbOverlap(Vec2 minA, Vec2 maxA, Vec2 minB, Vec2 maxB) =>
        minA.x <= maxB.x && maxA.x >= minB.x && minA.y <= maxB.y && maxA.y >= minB.y;

    public static bool CircleOverlap(Vec2 ca, float ra, Vec2 cb, float rb)
    {
        float r = ra + rb;
        return (cb - ca).SqrMagnitude <= r * r; // so bình phương, không cần căn
    }

    // Ray vs circle: giải |o + t*d - c|^2 = r^2; d phải đã normalize. Trả t gần nhất >= 0.
    public static bool RayCircle(Vec2 o, Vec2 d, Vec2 c, float r, out float t)
    {
        t = 0;
        Vec2 oc = o - c;
        float b = Vec2.Dot(oc, d);
        float cc = oc.SqrMagnitude - r * r;
        float disc = b * b - cc;
        if (disc < 0) return false;
        float s = MathF.Sqrt(disc);
        t = -b - s;
        if (t < 0) t = -b + s; // điểm bắt đầu nằm trong vòng tròn
        return t >= 0;
    }

    // Lerp độc lập frame rate: hệ số chỉ phụ thuộc k và dt
    public static float DampLerp(float current, float target, float k, float dt) =>
        current + (target - current) * (1f - MathF.Exp(-k * dt));

    public static Vec2 Bezier2(Vec2 p0, Vec2 p1, Vec2 p2, float t)
    {
        Vec2 a = Vec2.Lerp(p0, p1, t);
        Vec2 b = Vec2.Lerp(p1, p2, t);
        return Vec2.Lerp(a, b, t);
    }

    // Chọn theo trọng số: cộng dồn rồi tìm vùng chứa giá trị ngẫu nhiên
    public static int WeightedPick(float[] weights, Random rng)
    {
        float total = 0;
        foreach (float w in weights) total += w;
        float roll = (float)rng.NextDouble() * total;
        float acc = 0;
        for (int i = 0; i < weights.Length; i++)
        {
            acc += weights[i];
            if (roll < acc) return i;
        }
        return weights.Length - 1;
    }
}

// ---- Command pattern có undo ----
public interface ICommand { void Do(); void Undo(); }

public class Player { public Vec2 pos = new Vec2(0, 0); public int gold = 100; }

public class MoveCommand : ICommand
{
    readonly Player p; readonly Vec2 delta;
    public MoveCommand(Player p, Vec2 delta) { this.p = p; this.delta = delta; }
    public void Do() => p.pos = p.pos + delta;
    public void Undo() => p.pos = p.pos - delta;
}

public class SpendGoldCommand : ICommand
{
    readonly Player p; readonly int amount;
    public SpendGoldCommand(Player p, int amount) { this.p = p; this.amount = amount; }
    public void Do() => p.gold -= amount;
    public void Undo() => p.gold += amount;
}

public class CommandHistory
{
    readonly Stack<ICommand> done = new Stack<ICommand>();
    public void Execute(ICommand c) { c.Do(); done.Push(c); }
    public bool Undo()
    {
        if (done.Count == 0) return false;
        done.Pop().Undo();
        return true;
    }
}

public static class Program
{
    public static void Main()
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        Console.WriteLine("== Dot / Cross ==");
        Vec2 eye = new Vec2(0, 0), fwd = new Vec2(1, 0);
        foreach (var t in new[] { new Vec2(5, 1), new Vec2(5, 4), new Vec2(-3, 0), new Vec2(12, 0) })
            Console.WriteLine($"target {t}: trong nón 90 độ tầm 10 = {GameMath.InCone(eye, fwd, t, 90, 10)}, hướng {GameMath.Side(fwd, t)}");
        Vec3 cx = Vec3.Cross(new Vec3(1, 0, 0), new Vec3(0, 1, 0));
        Console.WriteLine($"cross(X, Y) = {cx}, dot(X, Y) = {Vec3.Dot(new Vec3(1, 0, 0), new Vec3(0, 1, 0))}");

        Console.WriteLine("== Điểm - đoạn ==");
        Vec2 a = new Vec2(0, 0), b = new Vec2(10, 0);
        Console.WriteLine($"p(5,3): {GameMath.PointSegmentDistance(new Vec2(5, 3), a, b):0.###}");
        Console.WriteLine($"p(14,3): {GameMath.PointSegmentDistance(new Vec2(14, 3), a, b):0.###} (kẹp về đầu b)");

        Console.WriteLine("== Va chạm ==");
        Console.WriteLine($"AABB chồng: {GameMath.AabbOverlap(new Vec2(0, 0), new Vec2(2, 2), new Vec2(1, 1), new Vec2(3, 3))}");
        Console.WriteLine($"AABB tách:  {GameMath.AabbOverlap(new Vec2(0, 0), new Vec2(2, 2), new Vec2(3, 0), new Vec2(5, 2))}");
        Console.WriteLine($"Circle chạm: {GameMath.CircleOverlap(new Vec2(0, 0), 1, new Vec2(1.5f, 0), 1)}");
        Console.WriteLine($"Circle xa:   {GameMath.CircleOverlap(new Vec2(0, 0), 1, new Vec2(3, 0), 1)}");
        bool hit = GameMath.RayCircle(new Vec2(0, 0), new Vec2(1, 0), new Vec2(5, 0), 1, out float th);
        Console.WriteLine($"Ray trúng: {hit}, t = {th:0.###}");
        hit = GameMath.RayCircle(new Vec2(0, 0), new Vec2(1, 0), new Vec2(5, 3), 1, out th);
        Console.WriteLine($"Ray trượt: {hit}");

        Console.WriteLine("== Lerp độc lập frame rate (1 giây, k=5) ==");
        foreach (int fps in new[] { 30, 60, 144 })
        {
            float naive = 0, damp = 0, dt = 1f / fps;
            for (int i = 0; i < fps; i++)
            {
                naive += (1f - naive) * 0.1f;               // lerp(cur, target, 0.1f) mỗi frame
                damp = GameMath.DampLerp(damp, 1f, 5f, dt);  // 1 - exp(-k*dt)
            }
            Console.WriteLine($"{fps,3} fps: lerp 0.1/frame = {naive:0.####}, damp = {damp:0.####}");
        }

        Console.WriteLine("== Bezier bậc 2 ==");
        Vec2 p0 = new Vec2(0, 0), p1 = new Vec2(5, 10), p2 = new Vec2(10, 0);
        foreach (float t in new[] { 0f, 0.25f, 0.5f, 1f })
            Console.WriteLine($"t={t}: {GameMath.Bezier2(p0, p1, p2, t)}");

        Console.WriteLine("== Weighted random (100000 lần, trọng số 70/25/5) ==");
        var rng = new Random(42);
        float[] w = { 70, 25, 5 };
        int[] count = new int[3];
        for (int i = 0; i < 100000; i++) count[GameMath.WeightedPick(w, rng)]++;
        Console.WriteLine($"Common {count[0] / 1000f:0.0}%, Rare {count[1] / 1000f:0.0}%, Epic {count[2] / 1000f:0.0}%");

        Console.WriteLine("== Command + undo ==");
        var player = new Player();
        var hist = new CommandHistory();
        hist.Execute(new MoveCommand(player, new Vec2(3, 0)));
        hist.Execute(new SpendGoldCommand(player, 30));
        hist.Execute(new MoveCommand(player, new Vec2(0, 4)));
        Console.WriteLine($"sau 3 lệnh: pos {player.pos}, gold {player.gold}");
        hist.Undo(); hist.Undo();
        Console.WriteLine($"undo 2 lần: pos {player.pos}, gold {player.gold}");
        hist.Undo();
        bool more = hist.Undo();
        Console.WriteLine($"undo hết:   pos {player.pos}, gold {player.gold}, còn undo được: {more}");
    }
}
```

**Chạy thử**
- `dotnet new console`, thay `Program.cs` bằng file trên, `dotnet run` (đã chạy trên .NET 10; `Console.OutputEncoding` đặt UTF-8 để thấy tiếng Việt).
- Output thật:

```
== Dot / Cross ==
target (5, 1): trong nón 90 độ tầm 10 = True, hướng trái
target (5, 4): trong nón 90 độ tầm 10 = True, hướng trái
target (-3, 0): trong nón 90 độ tầm 10 = False, hướng thẳng hàng
target (12, 0): trong nón 90 độ tầm 10 = False, hướng thẳng hàng
cross(X, Y) = (0, 0, 1), dot(X, Y) = 0
== Điểm - đoạn ==
p(5,3): 3
p(14,3): 5 (kẹp về đầu b)
== Va chạm ==
AABB chồng: True
AABB tách:  False
Circle chạm: True
Circle xa:   False
Ray trúng: True, t = 4
Ray trượt: False
== Lerp độc lập frame rate (1 giây, k=5) ==
 30 fps: lerp 0.1/frame = 0.9576, damp = 0.9933
 60 fps: lerp 0.1/frame = 0.9982, damp = 0.9933
144 fps: lerp 0.1/frame = 1, damp = 0.9933
== Bezier bậc 2 ==
t=0: (0, 0)
t=0.25: (2.5, 3.75)
t=0.5: (5, 5)
t=1: (10, 0)
== Weighted random (100000 lần, trọng số 70/25/5) ==
Common 69.9%, Rare 25.2%, Epic 5.0%
== Command + undo ==
sau 3 lệnh: pos (3, 4), gold 70
undo 2 lần: pos (3, 0), gold 100
undo hết:   pos (0, 0), gold 100, còn undo được: False
```

- Đọc kết quả: kẻ địch ở `(5,4)` lệch 38,7° so với hướng nhìn nên còn trong nón 90° (nửa góc 45°); hai điểm sau cùng ngoài nón (một ở sau lưng, một quá tầm 10). Cột `lerp 0.1/frame` lệch từ 0,9576 tới 1 theo fps, cột `damp` đứng yên ở 0,9933 — đó là điểm của `1 - exp(-k·dt)`. Seed 42 cho tỉ lệ 69,9/25,2/5,0 sát 70/25/5 sau 100000 lần bốc.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho ôn OOP, pattern và toán game**

AI giỏi nhất ở việc *chất vấn bạn như người phỏng vấn* và *kiểm tra công thức bạn tự viết*; kém ở việc tự khẳng định dấu và chiều của phép toán trong **một hệ toạ độ cụ thể** (Unity tay trái, y lên) và ở việc đưa ra con số hiệu năng "chắc chắn". Quy trình ba bước: (1) bạn tự trả lời ra miệng hoặc ra giấy; (2) AI chấm theo tiêu chí bốn ý — định nghĩa, cơ chế, ví dụ game, đánh đổi; (3) mọi công thức toán bắt AI **kiểm bằng số cụ thể** hoặc chạy được, không nhận phép chứng minh bằng lời.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Vấn đáp | Ôn miệng OOP/pattern | "Đóng vai người phỏng vấn senior Unity, hỏi từng câu một, đợi tôi trả lời rồi mới chấm" |
| Kiểm công thức | Sau khi tự viết hàm toán | "Chạy các test số sau lên hàm này, đừng suy diễn bằng lời" |
| Soi code | Nộp bài live-coding để review | "Tìm chỗ vi phạm Liskov/SRP và nêu cách sửa, trích dòng cụ thể" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- Hệ toạ độ: tay trái hay tay phải, trục nào lên, 2D hay 3D — quyết định dấu của cross product.
- Dùng Unity hay C# thuần: `Mathf` hay `MathF`, `Vector3` hay struct tự viết; có được dùng thư viện không.
- Đơn vị góc (độ hay radian) và thứ tự đối số của `Atan2`.
- Mức người phỏng vấn (Mid hay Senior) và có giới hạn thời gian bao nhiêu phút cho câu code.
- Pattern nào bạn muốn bị hỏi và bài toán game cụ thể đi kèm (inventory, input, projectile...).

**Mẫu prompt**

```
Đóng vai người phỏng vấn senior Unity ở studio game Nhật. Hỏi tôi 10 câu về OOP và
design pattern, MỖI LẦN MỘT CÂU, đợi tôi trả lời mới hỏi tiếp.
Sau mỗi câu trả lời, chấm theo 4 ý: định nghĩa / cơ chế / ví dụ game / đánh đổi — nói
ý nào thiếu. KHÔNG khen chung chung, KHÔNG đưa đáp án trước khi tôi trả lời.
Chủ đề: Singleton vs DI, composition vs inheritance, Command có undo, Observer rò rỉ.
Hệ toạ độ cho câu toán: Unity (tay trái, y lên). Nếu câu hỏi cần công thức, bắt tôi viết
rồi kiểm lại bằng 3 ví dụ số cụ thể, CẤM tự nhận "đúng" khi chưa thử.
```

**Bẫy thường gặp:** AI hay (1) lẫn dấu cross product giữa hệ tay trái và tay phải rồi nói "dương là bên trái" cho Unity; (2) viết `Lerp(a, b, speed * dt)` và gọi đó là độc lập frame rate (nó chỉ gần đúng khi dt nhỏ, và không ổn định khi `speed·dt > 1`); (3) trả lời "dùng Singleton cho tiện" mà không nói giá; (4) nhầm `override` với `new`; (5) ghép quaternion theo thứ tự `q1 * q2` mà không nói xoay nào xảy ra trước; (6) tự bịa con số "virtual call chậm gấp N lần" — yêu cầu nó nêu cách đo.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Bốn tính chất của OOP, và cho một ví dụ game cho mỗi tính chất?**
  → Đóng gói: `Health` chỉ cho đổi máu qua `TakeDamage`, nên clamp và event nằm một chỗ. Trừu tượng: `IWeapon.Fire()` giấu chuyện súng hay phép. Kế thừa: `Goblin : Enemy`, dùng lại code chung. Đa hình: vòng lặp `enemy.Attack()` mỗi loại đánh kiểu riêng mà không cần `switch`, vì lời gọi được chọn theo kiểu thật lúc chạy.
- `Junior` **Abstract class khác interface chỗ nào, chọn cái nào?**
  → Abstract class có state và code dùng chung nhưng chỉ kế thừa được một; interface không state nhưng implement bao nhiêu cũng được. Tôi bắt đầu bằng interface (`IDamageable`) cho năng lực xuyên họ, vì `GetComponent<IDamageable>()` chạy được trong Unity. Chỉ lên abstract class khi thấy code trùng thật giữa các lớp cùng loại.
- `Mid` **`override` và `new` khác nhau thế nào?**
  → `override` thay hàm trong bảng ảo nên gọi qua biến kiểu cha vẫn ra bản của con; `new` chỉ che tên, gọi qua biến kiểu cha vẫn ra bản của cha. Hậu quả là bug "sửa `Attack` mà kẻ địch vẫn đánh kiểu cũ" khi danh sách khai báo kiểu cha. Gần như luôn nên dùng `override`, vì `new` là đa hình giả.
- `Mid` **Virtual call tốn bao nhiêu, có nên tránh trong game?**
  → Đọc vtable rồi nhảy gián tiếp, chậm hơn call thường cỡ vài nano-giây và chặn inlining. Vài nghìn call mỗi frame không đáng kể; nút cổ chai thật thường là alloc và cache miss. Chỉ tránh trong vòng lặp nóng hàng chục nghìn phần tử, và khi đó đổi sang dữ liệu phẳng chứ không bỏ interface khắp nơi.
- `Mid` **Vì sao nên ưu tiên composition hơn inheritance?**
  → Cây kế thừa nổ theo tổ hợp: bay, bắn, tàng hình là 2³ lớp, mà C# chỉ một cha. Composition ghép từng khả năng thành component, đổi được lúc runtime và thêm khả năng không sửa code cũ — đó cũng là kiến trúc của Unity. Giá là phụ thuộc giữa component phải quản lý và khó đọc "con này làm gì" từ một file.
- `Mid` **Giải thích chữ L (Liskov) bằng một ví dụ lỗi trong game?**
  → Con phải thay được cha mà code gọi không biết. Nếu `Turret : Enemy` mà `Move()` ném `NotImplementedException`, mọi chỗ lặp qua `List<Enemy>` và gọi `Move()` sẽ nổ. Cách sửa: tách `IMovable`, chỉ kẻ địch di chuyển được mới implement, vì "tháp pháo" không thật sự là một "kẻ địch biết đi".
- `Mid` **Đưa ví dụ vi phạm Single Responsibility trong Unity và cách sửa?**
  → `Player.cs` 1500 dòng lo input, di chuyển, máu, UI và save: đổi cách lưu game cũng phải sửa file di chuyển, nhiều người sửa cùng lúc là xung đột. Tách thành `PlayerInput`, `PlayerMovement`, `PlayerHealth`, mỗi cái đổi vì một lý do, và nối nhau qua event hoặc interface.
- `Senior` **Dependency Inversion áp vào Unity thế nào, khi `MonoBehaviour` không có constructor?**
  → Lớp cấp cao nhận interface (`ITarget`) thay vì gọi `GameManager.Instance`; truyền qua field serialized trong Inspector, hoặc `Init(...)` khi spawn, hoặc DI container như VContainer cho dự án lớn. Lợi là thay được bản giả khi test và thấy rõ phụ thuộc. Giá là phải cấu hình wiring; không đáng với prototype nhỏ.
- `Senior` **Khi nào kế thừa vẫn là lựa chọn đúng?**
  → Khi cây nông (một hai tầng), ổn định và thật sự là "là một", ví dụ `UIPanelBase` với `Open/Close` chung cho mười panel. Tôi giữ cho Template Method, nơi lớp cha định khung và lớp con điền bước. Dấu hiệu nên bỏ là khi tên lớp bắt đầu ghép hai tính từ (`FlyingShooting...`).
- `Senior` **Interface có default method (C# 8) có thay được abstract class không?**
  → Không hoàn toàn: interface vẫn không giữ state, và default method gọi qua biến kiểu class không thấy được (phải ép về interface). Trong Unity nó còn bị ràng buộc bởi phiên bản C# của engine và IL2CPP. Tôi chỉ dùng cho giá trị mặc định nhỏ để không phá các lớp cũ khi thêm method, chứ không để tái dùng logic lớn.
- `Junior` **Singleton là gì, vì sao nhiều người ghét?**
  → Một instance duy nhất, truy cập toàn cục, ví dụ `AudioManager.Instance`. Ghét vì phụ thuộc ẩn (nhìn Inspector không thấy ai cần ai), khó test vì không thay bằng bản giả, và thứ tự khởi tạo/`DontDestroyOnLoad` hay sinh bug khi đổi scene. Prototype nhỏ thì chấp nhận được; dự án lớn tôi truyền tham chiếu rõ hoặc dùng DI.
- `Mid` **Thay Singleton bằng gì mà vẫn dễ truy cập?**
  → Bốn mức: kéo tham chiếu vào Inspector; inject qua constructor với class thuần; ScriptableObject làm kênh dữ liệu/sự kiện dùng chung; Service Locator có interface khi thật cần toàn cục. Mỗi mức tăng độ trừu tượng và giảm tiện lợi, nên tôi chọn mức thấp nhất đủ dùng cho quy mô dự án.
- `Mid` **Observer/event hay gây bug gì, tránh thế nào?**
  → Rò rỉ: publisher giữ tham chiếu tới subscriber đã bị huỷ, nên `OnDestroy` rồi vẫn bị gọi, hoặc lỗi `MissingReferenceException`. Luôn ghép `+=` ở `OnEnable` với `-=` ở `OnDisable`. Thêm hai bẫy: huỷ đăng ký trong lúc đang bắn (duyệt trên bản sao) và thứ tự listener không được bảo đảm, nên đừng viết logic phụ thuộc thứ tự.
- `Mid` **State pattern/FSM khi nào đủ, khi nào phải đổi sang Behavior Tree?**
  → FSM đủ cho nhân vật có chục trạng thái (Idle, Run, Jump, Attack) với chuyển tiếp rõ ràng. Khi số trạng thái và đường chuyển nổ tổ hợp (AI boss nhiều pha, mỗi trạng thái có thể ngắt bởi chục điều kiện) thì FSM thành mớ mì; Behavior Tree hoặc HFSM tổ chức theo cây, dễ gắn điều kiện hơn. Xem [[fsm]].
- `Mid` **Command pattern cho undo/redo: lưu gì, cài ra sao?**
  → Mỗi hành động là object có `Do()` và `Undo()` mang đủ dữ liệu để đảo (vị trí cũ, số vàng đã trừ), đẩy vào stack. Undo là pop rồi gọi `Undo()`; redo cần stack thứ hai và phải xoá nó khi có lệnh mới. Cùng cấu trúc đó cho replay: ghi danh sách lệnh kèm frame, phát lại để tái hiện trận đấu.
- `Mid` **Object Pool: khi nào dùng, hay sót chỗ nào?**
  → Dùng cho object sinh–huỷ liên tục (đạn, hiệu ứng), vì `Instantiate/Destroy` sinh alloc và GC spike. Sót chỗ quen thuộc nhất là reset trạng thái khi lấy ra (vận tốc, máu, particle, listener đăng ký) và việc trả về hai lần. Ngoài ra pool giữ bộ nhớ không trả lại, nên cần cỡ tối đa hợp lý.
- `Senior` **Service Locator khác Dependency Injection chỗ nào?**
  → Với Service Locator, lớp tự đi hỏi nơi tập trung (`Services.Get<IAudio>()`), nên phụ thuộc vẫn ẩn bên trong và lỗi thiếu service chỉ nổ ở runtime. Với DI, phụ thuộc được đẩy từ ngoài vào qua constructor nên lộ ra ở chữ ký. Tôi dùng Locator như bước đệm gọn khi migrate từ Singleton, rồi chuyển dần sang DI.
- `Mid` **MVC/MVP cho UI game: vì sao tách, tách thế nào?**
  → Model giữ dữ liệu (vàng, danh sách item) mà không biết UI; View chỉ hiển thị và bắn sự kiện người dùng; Presenter nối hai bên. Lợi là đổi UI từ uGUI sang UI Toolkit không đụng logic, và test Presenter không cần Unity. Giá là nhiều file hơn, nên với màn hình đơn giản tôi để một `MonoBehaviour`.
- `Senior` **Flyweight và ScriptableObject: lợi gì, bẫy gì?**
  → Trăm kẻ địch cùng loại chia sẻ một `EnemyData` (máu gốc, tốc độ, tiền thưởng) thay vì mỗi con copy, tiết kiệm bộ nhớ và designer chỉnh một chỗ. Bẫy: nó là asset dùng chung nên ghi vào nó từ runtime là ghi cho tất cả con khác, và trong Editor còn ghi đè luôn asset trên đĩa. Quy tắc của tôi: SO chỉ chứa dữ liệu bất biến, trạng thái đổi nằm ở component.
- `Mid` **Strategy và Factory khác nhau thế nào, cho ví dụ game?**
  → Strategy chọn *cách làm* lúc chạy: cùng một kẻ địch nhưng thay `IAimStrategy` (ngắm thẳng hay dự đoán). Factory chọn *cái được tạo*: từ id trong dữ liệu level tạo ra kẻ địch đúng loại mà người gọi không `new` cụ thể. Một cái đổi hành vi, một cái đổi việc khởi tạo; hay kết hợp: factory tạo kẻ địch đã gắn sẵn strategy.
- `Junior` **`sqrMagnitude` dùng để làm gì, vì sao nhanh hơn?**
  → Nó trả bình phương độ dài, bỏ được phép căn bậc hai. Khi chỉ cần so khoảng cách với ngưỡng, so `sqrMagnitude < range * range` cho cùng kết quả mà rẻ hơn. Phải bình phương cả ngưỡng; tôi dùng `Distance` khi cần chính con số khoảng cách, như hiển thị.
- `Junior` **Dot product cho biết gì?**
  → Với hai vector đã normalize, dot bằng cos của góc giữa chúng: 1 là cùng hướng, 0 là vuông góc, -1 là ngược hướng. Nên `dot(forward, toTarget) > 0` nghĩa là mục tiêu ở phía trước. Vì sao quan trọng: không cần `acos`, chỉ so sánh trực tiếp nên rất rẻ.
- `Mid` **Kiểm tra kẻ địch trong tầm nhìn hình nón như thế nào?**
  → Tính `to = target - eye`, kiểm `to.sqrMagnitude <= range²` trước (rẻ), rồi so `dot(forward, to.normalized) >= cos(fov/2)`; FOV 90° thì ngưỡng là cos 45° ≈ 0,707. Vì sao không `acos`: tốn hơn và thừa. Muốn che khuất thì thêm một raycast từ mắt tới target.
- `Mid` **Dùng cross product để biết mục tiêu bên trái hay phải ra sao?**
  → Lấy `cross(forward, toTarget)` và xét dấu thành phần y (với y lên); chiều dương/âm ứng với trái/phải tuỳ hệ toạ độ. Unity là tay trái nên y dương là bên phải. Vì sao tôi luôn thử bằng `Vector3.forward` và `Vector3.right` trước khi tin trí nhớ: nhầm dấu là lỗi phổ biến nhất ở câu này.
- `Mid` **Tính khoảng cách từ điểm tới đoạn thẳng?**
  → Chiếu điểm lên đường: `t = dot(p - a, b - a) / |b - a|²`, kẹp `t` vào [0, 1] rồi lấy điểm `a + t(b - a)` và đo khoảng cách. Kẹp để ngoài đoạn thì điểm gần nhất là đầu mút, nếu không sẽ tính khoảng cách tới đường thẳng vô hạn. Dùng cho đạn quét hoặc kiểm tra quái chạm tia laser.
- `Mid` **Vì sao `Lerp(a, b, 0.1f)` mỗi frame bị coi là sai, sửa thế nào?**
  → Nó đuổi 10% mỗi *frame*, nên 144fps hội tụ nhanh hơn 30fps nhiều lần. Sửa bằng `1 - exp(-k·dt)`: mỗi giây luôn đi cùng một phần quãng đường bất kể fps. Tôi đã đo: k=5 sau 1 giây cho 0,9933 ở cả 30, 60, 144fps, còn bản 0,1 mỗi frame ra 0,9576 / 0,9982 / 1.
- `Mid` **Lerp, Slerp, SmoothDamp khác nhau ra sao?**
  → Lerp nội suy thẳng, tốc độ đều theo `t`; Slerp đi trên cung tròn với tốc độ góc đều nên dùng cho hướng/quaternion, vì lerp vector làm độ dài hụt ở giữa; SmoothDamp là lò xo có vận tốc, mượt khi đích đổi liên tục nên camera hay dùng. Chọn theo việc cần: đi thẳng, quay, hay bám theo.
- `Junior` **Vì sao dùng `Atan2` thay cho `Atan`?**
  → `Atan(y/x)` mất dấu của hai thành phần nên không phân biệt được bốn góc phần tư và nổ khi `x = 0`. `Atan2(y, x)` nhận cả hai riêng nên trả đúng góc trong (-π, π]. Nhớ thứ tự y trước x, và nhân `Rad2Deg` nếu cần độ.
- `Mid` **Quaternion giải quyết gimbal lock thế nào, vì sao không cộng góc Euler?**
  → Gimbal lock xảy ra với Euler khi một trục xoay 90° làm hai trục còn lại trùng nhau, mất một bậc tự do; quaternion biểu diễn xoay trực tiếp nên không bị. Cộng Euler (`euler += delta`) sai vì xoay không giao hoán và giá trị nhảy quanh 0/360; thay vào đó nhân `Quaternion.Euler(delta) * rotation`.
- `Mid` **`q2 * q1 * v` nghĩa là gì, nhân quaternion có giao hoán không?**
  → Đọc từ phải sang trái: xoay `v` bằng q1 trước rồi q2. Không giao hoán, `q1 * q2` cho xoay khác hẳn, vì xoay quanh trục đã bị xoay khác với xoay quanh trục gốc. Ví dụ game: xoay thân bằng yaw trước rồi mới pitch đầu, đổi thứ tự là đầu nghiêng sai trục.
- `Mid` **`Quaternion.LookRotation` dùng thế nào, lỗi hay gặp?**
  → Truyền hướng nhìn `(target - self).normalized` và vector up, nó cho xoay sao cho trục z hướng theo đó. Lỗi hay gặp: hướng là vector 0 (target trùng vị trí) gây cảnh báo, và hướng song song với up làm xoay không xác định. Muốn quay dần thì kết hợp `RotateTowards` hoặc Slerp thay vì gán thẳng.
- `Mid` **Local và world space: biến điểm local sang world thế nào?**
  → Nhân với ma trận TRS của object (dịch, xoay, co giãn): `transform.TransformPoint(local)`; hướng thì dùng `TransformDirection` vì không có dịch và không có scale. Nghịch đảo là `InverseTransformPoint`. Cha–con là nhân ma trận cha với con, và scale không đều ở cha làm con xoay bị méo.
- `Mid` **Kiểm tra va chạm AABB và circle, vì sao hay dùng chúng?**
  → AABB chồng nhau khi chồng ở mọi trục (`minA.x <= maxB.x && maxA.x >= minB.x`, y tương tự); circle chồng khi `|ca - cb|² <= (ra + rb)²`, so bình phương khỏi căn. Dùng nhiều vì rẻ và đủ cho broad-phase; hình phức tạp thì lọc bằng chúng trước rồi mới kiểm tra chính xác.
- `Senior` **Raycast tia với hình tròn tính thế nào, vật nhỏ bay nhanh xuyên tường là vì sao?**
  → Thế `o + t·d` vào phương trình vòng tròn, ra bậc hai theo t; delta < 0 là trượt, ngược lại lấy nghiệm nhỏ nhất ≥ 0. Xuyên tường (tunneling) xảy ra vì chỉ kiểm tra vị trí cuối mỗi frame nên đạn nhảy qua tường mỏng; cách sửa là quét đoạn đường (sweep/raycast từ vị trí cũ tới mới) hoặc bật continuous collision.
- `Mid` **Bezier bậc 2 tính ra sao, dùng làm gì trong game?**
  → Lerp hai lần: lerp giữa `P0-P1` và `P1-P2` rồi lerp hai kết quả theo cùng t, tương đương `(1-t)²P0 + 2(1-t)t·P1 + t²P2`. Dùng cho đạn bay cung cong hay vật phẩm bay về ví; điểm điều khiển P1 quyết định độ cong. Cần đi mượt qua nhiều đoạn thì chuyển sang spline.
- `Mid` **Bốc ngẫu nhiên có trọng số cài ra sao?**
  → Cộng dồn trọng số, bốc `roll` trong [0, tổng), duyệt và trả phần tử đầu tiên mà cộng dồn vượt roll; trọng số 70/25/5 cho 70/25/5%. Đã chạy 100000 lần ra 69,9/25,2/5,0. Nếu cần "không trùng" thì loại phần tử đã ra khỏi danh sách, vì bốc độc lập có thể ra trùng.
- `Mid` **Đổi toạ độ chuột (màn hình) sang thế giới thế nào?**
  → Với camera orthographic 2D: `ScreenToWorldPoint(mouse)` đủ. Với perspective phải cho `z` là khoảng cách tới camera, hoặc đúng hơn là phát tia `ScreenPointToRay` rồi raycast vào mặt phẳng/collider, vì một điểm màn hình ứng với cả một đường trong không gian. UI Canvas thì dùng `RectTransformUtility.ScreenPointToLocalPointInRectangle`.

**Khung trả lời 60 giây** — "Vì sao nên ưu tiên composition hơn inheritance trong game?"

> Kế thừa buộc tôi chọn một cây duy nhất, mà game thì khả năng cứ chồng lên nhau. Kẻ địch có thể bay, bắn, tàng hình; chỉ ba khả năng đã là tám tổ hợp, mà C# chỉ cho một lớp cha, nên cây kế thừa nổ rất nhanh và designer xin thêm một kiểu là tôi phải sửa cây. Composition thì mỗi khả năng là một component: `Mover`, `Weapon`, `Stealth`, ghép trên prefab, thêm cái mới không đụng code cũ, và đổi được lúc chạy, ví dụ đóng băng là tháo `Mover`. Đó cũng chính là cách Unity tổ chức `GameObject`. Cái giá là phụ thuộc ngầm giữa component, ai `GetComponent` ai, và đọc một file khó biết con này làm gì, nên tôi vẫn giữ kế thừa cho cây nông hai tầng thật sự "là một", như một lớp `UIPanelBase`. Quy tắc của tôi: thấy tên lớp ghép hai tính từ thì dừng và tách thành component.

**Họ sẽ đào tiếp**

- *"Component giao tiếp với nhau thế nào mà không dính chặt?"* → interface (`IDamageable`) và event; tránh `GetComponent` chéo lung tung; nêu rằng phụ thuộc vẫn tồn tại nhưng được khai báo, thường qua `[RequireComponent]` hay field serialized.
- *"Vậy kế thừa dùng khi nào?"* → cây nông, ổn định, thật sự là một; Template Method; lý do là Liskov — con thay được cha không phá người gọi.
- *"Singleton thay bằng gì?"* → truyền tham chiếu, ScriptableObject kênh sự kiện, Service Locator, DI; nêu vì sao: phụ thuộc ẩn và khó test.
- *"Vì sao không dùng `Distance` trong vòng lặp nóng?"* → căn bậc hai tốn, `sqrMagnitude` với ngưỡng bình phương cho cùng kết quả; nêu khi nào vẫn dùng `Distance` (cần giá trị thật).
- *"Slerp khác Lerp thế nào, vì sao?"* → lerp vector làm độ dài hụt ở giữa, slerp đi trên cung tròn với tốc độ góc đều.
- *"Command pattern cho replay cần lưu gì?"* → danh sách lệnh cùng frame/tick, và tất định (seed ngẫu nhiên, thứ tự cập nhật) để phát lại ra đúng kết quả.

**Cờ đỏ**

- Gọi Singleton là "pattern tốt nhất cho manager" mà không nêu được cái giá (phụ thuộc ẩn, khó test, thứ tự khởi tạo).
- Nói "kế thừa để tái dùng code" — đó là lý do sai; kế thừa là quan hệ "là một", tái dùng code là việc của composition.
- Cộng góc Euler để xoay tích luỹ, hoặc không phân biệt được `Quaternion.Euler(a) * q` với `q * Quaternion.Euler(a)`.
- Viết `Lerp(a, b, speed * Time.deltaTime)` và nói "đã độc lập frame rate" mà không nhận ra đó chỉ gần đúng và hỏng khi `speed·dt` lớn.
- Dùng `Atan(y/x)` cho hướng, hoặc dùng `acos` để so góc tầm nhìn thay vì so dot với cos.
- Nói "virtual call chậm nên tôi tránh interface" mà không có số đo.
- Trả lời toán bằng công thức thuộc lòng mà không biết hệ toạ độ Unity là tay trái, nên dấu cross bị ngược.

**Số / ví dụ nên thuộc**

- Dot: `a · b = |a||b|cos θ`; hai vector đã normalize: 1 / 0 / -1 là cùng / vuông / ngược hướng.
- Ngưỡng tầm nhìn: `dot(forward, dir) >= cos(fov/2)`; FOV 90° thì `cos 45° ≈ 0,707`; FOV 60° thì `cos 30° ≈ 0,866`.
- Cross: `(ay·bz - az·by, az·bx - ax·bz, ax·by - ay·bx)`; độ dài `|a||b| sin θ`; `cross(X, Y) = Z` (cùng công thức ở cả hai hệ; chỉ khác chiều xoay nhìn thấy), nên luôn thử bằng `Vector3.forward`/`Vector3.right` để xác nhận dấu.
- Điểm–đoạn: `t = dot(p - a, b - a) / |b - a|²`, kẹp [0, 1].
- Lerp độc lập fps: `1 - exp(-k·dt)`; đo: k=5, 1 giây → 0,9933 ở 30/60/144fps.
- Bezier bậc 2: `(1-t)²P0 + 2(1-t)t·P1 + t²P2`; `t = 0,5` với `(0,0),(5,10),(10,0)` cho `(5,5)`.
- Va chạm: AABB chồng mọi trục; circle `|d|² <= (r1+r2)²`; ray–circle giải bậc hai, `disc < 0` là trượt.
- Quaternion: nhân đọc phải sang trái, không giao hoán; `LookRotation(forward, up)`; gimbal lock xảy ra ở 90° pitch với Euler.
- Weighted random 70/25/5 ở 100000 lần: 69,9 / 25,2 / 5,0%.
- Pattern: Singleton cần nêu được ba cái giá; Observer: `+=` ở `OnEnable` đi với `-=` ở `OnDisable`; Pool: reset khi lấy ra.
