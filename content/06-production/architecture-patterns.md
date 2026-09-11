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
