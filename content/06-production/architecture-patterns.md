---
title: Architecture Patterns
icon: 🧱
summary: ECS, component, event bus, object pool — chọn kiến trúc theo quy mô thật của dự án, không theo xu hướng.
status: deep
read: 550
level: intermediate
order: 10
tags: [production, architecture, code]
related: [data-driven-design, performance, ai-workflow]
---

## Chọn theo quy mô, không theo xu hướng

| Quy mô | Kiến trúc phù hợp |
|---|---|
| < 50 thực thể, prototype | OOP thường, MonoBehaviour. Đừng nghĩ nhiều. |
| 50–500 thực thể | Component-based, có object pool |
| 500–5000 thực thể | ECS hoặc data-oriented cho hệ thống nóng |
| > 5000 thực thể | ECS toàn phần, xử lý theo lô, SIMD |

**ECS bị lạm dụng nghiêm trọng.** Nó giải quyết vấn đề hiệu năng ở quy mô lớn, đổi lại bằng độ phức tạp và tốc độ thử nghiệm chậm đi. Game indie dưới 200 thực thể dùng ECS thường tự làm khó mình mà không thu được gì.

Câu hỏi kiểm tra: *"tôi có thật sự có vấn đề hiệu năng đã đo được không?"* Nếu chưa đo, chưa cần ECS.

## Composition over inheritance

Cây kế thừa sâu là nguồn đau khổ kinh điển trong gamedev:

```
❌  Entity → Character → Enemy → FlyingEnemy → FlyingShootingEnemy → ???
```

Cây này hỏng ngay khi bạn cần một kẻ địch *vừa bay vừa bắn vừa nổ khi chết*. Kế thừa không diễn tả được tổ hợp.

```
✅  Enemy = [Health] + [Flying] + [Shooter] + [Explodes] + [DropsLoot]
```

Component ghép tự do. Đây cũng là kiến trúc **AI agent làm việc tốt nhất** — thêm hành vi mới = thêm một component, không đụng gì tới code cũ.

## Event bus — dùng có chừng mực

```csharp
EventBus.Publish(new EnemyDiedEvent(enemy, killer));

// Các hệ thống độc lập cùng lắng nghe
QuestSystem.On<EnemyDiedEvent>(e => UpdateQuestProgress(e));
LootSystem.On<EnemyDiedEvent>(e => SpawnLoot(e.enemy.position));
StatsSystem.On<EnemyDiedEvent>(e => stats.kills++);
```

Ưu điểm: các hệ thống không biết nhau, thêm/bớt tự do.

Nhược điểm nghiêm trọng: **luồng thực thi trở nên vô hình**. Khi có bug, bạn không biết cái gì chạy khi nào, và không thể đọc code để lần ra. Đây cũng là chỗ AI agent dễ sai nhất — nó không thấy được các liên kết ngầm.

Nguyên tắc thực dụng: dùng event cho **giao tiếp giữa các hệ thống lớn**, dùng gọi hàm trực tiếp cho **giao tiếp trong một hệ thống**. Và luôn có công cụ log/trace mọi event ở chế độ debug.

## Object pooling

Bắt buộc với mọi thứ sinh ra thường xuyên: đạn, hạt, số sát thương, kẻ địch.

```csharp
public class Pool<T> where T : Component {
    readonly Stack<T> available = new();
    readonly T prefab;

    public T Get() {
        var obj = available.Count > 0 ? available.Pop() : Object.Instantiate(prefab);
        obj.gameObject.SetActive(true);
        return obj;
    }

    public void Return(T obj) {
        obj.gameObject.SetActive(false);
        available.Push(obj);
    }
}
```

Lý do không chỉ là tốc độ cấp phát: trong môi trường có GC (C#, Unity), cấp phát liên tục gây **giật lag định kỳ** khi GC chạy — và giật lag rõ ràng hơn nhiều so với FPS thấp đều. Xem [[performance]].

## Tách logic khỏi biểu diễn

Ranh giới quan trọng nhất về mặt kiểm thử:

```
Logic thuần (không phụ thuộc engine)
    ↓ (sự kiện / trạng thái)
Lớp biểu diễn (animation, hạt, âm thanh, UI)
```

Lợi ích:
- Unit test được logic mà không cần chạy engine — nhanh hơn hàng trăm lần.
- Mô phỏng được (chạy 10.000 trận không cần render — xem [[balancing-math]]).
- Thay đổi hình ảnh không chạm vào luật chơi.
- AI agent test được thay đổi của chính nó.

Thực hiện: giữ logic trong class C# thuần, MonoBehaviour chỉ là lớp vỏ mỏng gọi vào logic đó.

## 🤖 Prompt cho AI

Viết quy ước kiến trúc vào `CLAUDE.md` — đây là cách rẻ nhất để code sinh ra khớp với phần còn lại của dự án:

```markdown
## Kiến trúc

- Component-based. Hệ thống mới = component mới, KHÔNG thêm tầng kế thừa.
- Logic gameplay nằm trong class C# thuần ở Core/, không phụ thuộc UnityEngine.
- MonoBehaviour chỉ là adapter: đọc input, gọi Core, cập nhật hiển thị.
- Mọi thứ spawn thường xuyên phải qua Pool<T>.
- Event bus chỉ dùng giữa các hệ thống cấp cao, KHÔNG dùng trong nội bộ hệ thống.
- Không singleton trừ 3 cái đã có: GameManager, AudioManager, ConfigLoader.
```

Ràng buộc *"logic không phụ thuộc UnityEngine"* đặc biệt có giá trị: nó ép agent viết code kiểm thử được, và tự động cho bạn khả năng mô phỏng.

## 🎮 Unity

Unity đẩy bạn về phía component sẵn rồi. Việc cần làm là **giữ logic tách khỏi MonoBehaviour**.

**Cấu trúc thư mục khuyến nghị**

```
Assets/Scripts/
├── Core/            ← C# thuần, KHÔNG using UnityEngine
│   ├── Combat/      DamageCalculator, StatusEffects
│   └── Economy/     ShopPricing, LootRoller
├── Unity/           ← MonoBehaviour, chỉ là lớp vỏ mỏng
└── Tests/
    └── EditMode/    ← test Core/, chạy trong mili giây
```

Ranh giới `Core/` không phụ thuộc `UnityEngine` là thứ cho bạn:
- Test chạy ở **EditMode** (mili giây) thay vì PlayMode (vài giây mỗi lần)
- Mô phỏng 10.000 trận không cần render — xem [[balancing-math]]
- AI agent tự kiểm chứng được thay đổi của nó

**Object pooling — Unity đã có sẵn**

Đừng tự viết pool. `UnityEngine.Pool.ObjectPool<T>` có từ Unity 2021:

```csharp
using UnityEngine.Pool;

public class BulletSpawner : MonoBehaviour {
    [SerializeField] Bullet prefab;
    ObjectPool<Bullet> pool;

    void Awake() {
        pool = new ObjectPool<Bullet>(
            createFunc:      () => Instantiate(prefab),
            actionOnGet:     b  => b.gameObject.SetActive(true),
            actionOnRelease: b  => b.gameObject.SetActive(false),
            actionOnDestroy: b  => Destroy(b.gameObject),
            collectionCheck: true,      // BẬT trong dev: bắt lỗi release hai lần
            defaultCapacity: 32,
            maxSize: 256);
    }

    public Bullet Spawn() {
        var b = pool.Get();
        b.Init(onDone: () => pool.Release(b));
        return b;
    }
}
```

`collectionCheck: true` bắt được lỗi trả cùng một object về pool hai lần — bug rất khó truy nếu không có nó. Tắt nó trong build release.

**Singleton — giới hạn số lượng**

Unity làm singleton quá dễ nên dự án nào cũng có 15 cái. Nguyên tắc: tối đa 3, và chúng phải là **dịch vụ không trạng thái game** (AudioManager, ConfigLoader, TimeManager). Mọi thứ khác truyền qua tham chiếu hoặc ScriptableObject.

**Cái bẫy `GetComponent` trong Update**

```csharp
// ❌ chạy 60 lần/giây × số object
void Update() => GetComponent<Rigidbody2D>().velocity = v;

// ✅ cache một lần
Rigidbody2D rb;
void Awake() => rb = GetComponent<Rigidbody2D>();
void Update() => rb.linearVelocity = v;      // Unity 6 đổi tên: velocity -> linearVelocity
```

**Kiểm tra nhanh**
- `grep -r "using UnityEngine" Assets/Scripts/Core/` → phải rỗng.
- Test EditMode chạy dưới 1 giây cho toàn bộ `Core/`.
- Không có `Instantiate`/`Destroy` nào trong code chạy mỗi frame.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Chọn kiến trúc theo tiêu chí nào?**
  → Theo **quy mô thật của dự án**, không theo xu hướng. Dưới 50 thực thể và còn prototype: OOP thường, MonoBehaviour, đừng nghĩ nhiều. 50–500: component-based cộng object pool. 500–5000: ECS hoặc data-oriented cho **hệ thống nóng**. Trên 5000: ECS toàn phần, xử lý theo lô.
- `Junior` **Vì sao composition hơn inheritance trong gamedev?**
  → Vì **kế thừa không diễn tả được tổ hợp**. Cây `Enemy → FlyingEnemy → ...` hỏng ngay khi cần một kẻ địch vừa bay vừa bắn vừa nổ khi chết. Component ghép tự do thì mỗi khả năng là một mảnh độc lập. Lợi ích kèm theo: đây cũng là kiến trúc **agent làm việc tốt nhất** — thêm hành vi là thêm một component, không đụng code cũ.
- `Junior` **Vì sao object pool bắt buộc với đạn và hạt?**
  → Không chỉ vì tốc độ cấp phát. Trong môi trường có GC, cấp phát liên tục gây **giật lag định kỳ** khi GC chạy — và giật lag rõ ràng hơn nhiều so với FPS thấp đều. Pool biến một chuỗi spike thành chi phí phẳng, nên nó sửa đúng thứ người chơi cảm nhận được.
- `Mid` **Câu hỏi kiểm tra trước khi dùng ECS là gì?**
  → *"Tôi có thật sự có vấn đề hiệu năng **đã đo được** không?"* Chưa đo thì chưa cần ECS. Nó giải quyết hiệu năng ở quy mô lớn và đổi lại bằng độ phức tạp cùng **tốc độ thử nghiệm chậm đi** — game indie dưới 200 thực thể dùng ECS thường tự làm khó mình mà không thu được gì.
- `Mid` **Event bus mạnh ở đâu, và nhược điểm nghiêm trọng là gì?**
  → Mạnh ở chỗ các hệ thống **không biết nhau**, thêm bớt tự do. Nhược điểm nghiêm trọng: **luồng thực thi trở nên vô hình** — có bug thì không biết cái gì chạy khi nào và không đọc code lần ra được. Đây cũng là chỗ AI agent dễ sai nhất, vì nó không thấy các liên kết ngầm.
- `Mid` **Vậy dùng event ở đâu, gọi hàm trực tiếp ở đâu?**
  → Event cho **giao tiếp giữa các hệ thống lớn** — combat báo cho UI, audio, quest. Gọi hàm trực tiếp cho **giao tiếp trong một hệ thống**, nơi thứ tự và luồng cần đọc được. Và bất kể chọn gì, luôn có công cụ **log/trace mọi event** ở chế độ debug; không có nó thì event bus là một hộp đen.
- `Senior` **Ranh giới kiến trúc nào quan trọng nhất về mặt kiểm thử?**
  → **Tách logic khỏi biểu diễn.** Logic là luật chơi, công thức, máy trạng thái — C# thuần, không tham chiếu API engine, test được trong EditMode. Biểu diễn là thứ đọc trạng thái và vẽ ra. Dấu hiệu đi đúng: file test logic không có dòng `using UnityEngine` nào. Lợi ích phụ là đổi engine chỉ phải viết lại phần biểu diễn.
- `Senior` **Kiến trúc nào làm việc tốt nhất với AI agent, và vì sao?**
  → **Component + dữ liệu dạng text + ranh giới rõ**. Agent thêm một component mà không đụng code cũ; agent sửa bảng số mà mình review bằng diff; và agent không cần hiểu toàn bộ hệ thống mới làm được một việc nhỏ. Ngược lại, event bus ngầm và trạng thái toàn cục là hai thứ làm agent sai nhiều nhất — cùng lý do làm người mới vào dự án sai nhiều nhất.
- `Senior` **Đội đề xuất viết lại sang ECS để "tối ưu". Anh phản hồi thế nào?**
  → Hỏi hai câu: **số đo trước và sau** dự kiến là gì, và phần nào của game thật sự nóng. Rồi đề xuất hướng rẻ hơn: chuyển **chỉ vòng lặp nóng** sang mảng struct cộng job cộng Burst, giữ nguyên phần còn lại là GameObject — thường lấy được phần lớn lợi ích với một phần nhỏ chi phí. Viết lại toàn bộ chỉ đáng khi quy mô thực thể đã ở bậc mà GameObject không gánh nổi.

**Khung trả lời 60 giây** — "Anh chọn kiến trúc cho một dự án game thế nào?"

> Theo **quy mô thật**, không theo xu hướng. Dưới năm mươi thực thể và còn đang prototype thì OOP thường là đúng — đừng nghĩ nhiều. Năm mươi tới năm trăm thì component-based cộng object pool. Trên năm trăm thì mới tính tới data-oriented cho các hệ thống nóng, và ECS toàn phần chỉ khi đã ở bậc hàng nghìn.
>
> Hai nguyên tắc tôi giữ ở mọi quy mô. **Composition thay cho inheritance**, vì cây kế thừa không diễn tả được tổ hợp — một kẻ địch vừa bay vừa bắn vừa nổ khi chết là đủ làm vỡ mọi cây. Và **tách logic khỏi biểu diễn**: luật chơi là C# thuần, test được, không tham chiếu API engine.
>
> Event bus thì dùng có chừng mực: giữa các hệ thống lớn thì có, trong một hệ thống thì gọi hàm trực tiếp. Nhược điểm của nó rất thật — luồng thực thi thành vô hình, và khi có bug thì không đọc code lần ra được. Nên nếu dùng, tôi luôn làm kèm công cụ trace mọi event ở chế độ debug.

**Họ sẽ đào tiếp**

- *"ECS bị lạm dụng ở chỗ nào?"* → Ở chỗ người ta chọn nó vì hiệu năng **chưa đo** và vì nó nghe hiện đại. Cái mất cụ thể là **tốc độ thử nghiệm**: mọi thay đổi nhỏ đều phải đi qua nhiều lớp, và với game đang tìm lối chơi thì tốc độ thử nghiệm quan trọng hơn hiệu năng. Nó đáng khi số thực thể đã là vấn đề đo được.
- *"Object pool khó ở đâu?"* → Không ở pool mà ở **reset cho đủ**: trail, particle, vận tốc rigidbody, coroutine đang chạy, animator state. Quên một cái là viên đạn thứ hai bay ra mang theo trạng thái của viên trước, và bug đó phụ thuộc thứ tự tái sử dụng nên rất khó truy.
- *"Làm sao biết mình đang lạm dụng event?"* → Khi phải **đặt breakpoint để biết chuyện gì xảy ra tiếp theo** trong một luồng lẽ ra đọc được, và khi một hành động đơn giản kích hoạt bảy handler ở bảy file. Lúc đó event đang làm việc của một lời gọi hàm, và cái giá là toàn bộ khả năng đọc hiểu.
- *"Kiến trúc ảnh hưởng gì tới thời gian onboard người mới?"* → Rất nhiều, và đó là chi phí ít được tính nhất. Người mới hiểu được một hệ thống khi họ **đọc được luồng**; component rõ ràng và ranh giới logic/biểu diễn rút thời gian đó xuống, còn trạng thái toàn cục và event ngầm kéo nó dài ra. Cùng đúng những thứ làm agent làm việc tốt hơn hay tệ hơn.

**Cờ đỏ**

- Chọn ECS trước khi có số đo hiệu năng nào.
- Cây kế thừa bốn tầng cho kẻ địch.
- Event bus cho mọi giao tiếp, kể cả trong cùng một hệ thống.
- Không có công cụ trace event ở chế độ debug.
- Logic game bám chặt API engine ở mọi lớp, nên không test được gì.

**Số / ví dụ nên thuộc**

- Quy mô → kiến trúc: **< 50** OOP thường · **50–500** component + pool · **500–5000** ECS/data-oriented cho hệ thống nóng · **> 5000** ECS toàn phần.
- Câu hỏi kiểm tra trước ECS: **"đã đo được vấn đề hiệu năng chưa?"**
- Event bus: giữa **hệ thống lớn** thì dùng, trong **một hệ thống** thì gọi trực tiếp; luôn có trace ở debug.
- Pool bắt buộc cho: **đạn · hạt · số sát thương · kẻ địch**.
- Dấu hiệu tách logic đúng: file test logic **không có `using UnityEngine`**.
