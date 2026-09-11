---
title: Design Pattern trong Unity
icon: 🧩
summary: ScriptableObject ba vai, singleton có giới hạn, service locator có kỷ luật, FSM bằng class thường, pool có sẵn — pattern nào sống được trong MonoBehaviour và bẫy Unity của từng cái.
status: deep
read: 630
level: intermediate
order: 30
tags: [unity, architecture, pattern, code]
related: [architecture-patterns, data-driven-design, unity-game-loop, agent-guardrails]
---

[[architecture-patterns]] đã nói vì sao composition, event bus có chừng mực, và pool. Node này chỉ nói **pattern đó biến thành gì khi chạm MonoBehaviour**: cái gì Unity serialize được, cái gì sống qua scene, cái gì dính vào asset trong Editor mà không dính trên build.

Quyết định quan trọng nhất: **dữ liệu và kênh giao tiếp nằm trong ScriptableObject; logic nằm trong class C# thường; MonoBehaviour chỉ là chỗ móc vào vòng đời**. Ba lớp này càng rõ thì project càng ít singleton.

## ScriptableObject: ba vai, một bẫy

**Vai 1 — config bất biến.** `WeaponData`, `EnemyData`: chỉ đọc lúc chạy. [[data-driven-design]] đã nói kỹ, kể cả bẫy `data.damage += 5` ghi thẳng vào asset.

**Vai 2 — event channel.** Một asset `OnPlayerDied` mà UI, audio, quest cùng tham chiếu qua Inspector. Hai scene additive không tham chiếu được nhau qua Inspector, nhưng cùng tham chiếu một SO thì được:

```csharp
using System; using UnityEngine;

[CreateAssetMenu(menuName = "Events/Int Channel")]
public sealed class IntEventChannel : ScriptableObject {
    [NonSerialized] Action<int> listeners;             // KHÔNG serialize — không được ghi vào asset
    public void Raise(int v) => listeners?.Invoke(v);
    public void Subscribe(Action<int> a)   => listeners += a;
    public void Unsubscribe(Action<int> a) => listeners -= a;
}

// Người nghe: luôn cặp OnEnable/OnDisable
public sealed class GoldLabel : MonoBehaviour {
    [SerializeField] IntEventChannel goldChanged;
    void OnEnable()  => goldChanged.Subscribe(Refresh);
    void OnDisable() => goldChanged.Unsubscribe(Refresh);
    void Refresh(int gold) { /* … */ }
}
```

**Vai 3 — runtime set.** `EnemyRuntimeSet` chứa `List<Enemy>` đang sống; enemy tự `Add` trong `OnEnable`, `Remove` trong `OnDisable`. Spawner, UI đếm quái, AI director cùng đọc một danh sách mà không ai `FindObjectsByType`.

**Bẫy chung cho vai 2 và 3:** trong Editor, SO **sống xuyên các lần Play**. Field runtime không có `[NonSerialized]` sẽ được ghi vào asset khi bạn Save Project — lần Play sau `currentHp` bắt đầu từ 37, và danh sách enemy chứa tham chiếu tới object đã destroy. Trên build asset chỉ đọc nên mọi thứ reset mỗi lần mở game. Hai hành vi khác nhau nghĩa là bug chỉ xuất hiện ở một trong hai nơi. Luật: mọi field thay đổi lúc chạy trong SO mang `[NonSerialized]`, và mọi subscriber gỡ trong `OnDisable` để khi thoát Play danh sách tự rỗng. Nếu tắt Domain Reload, thêm reset qua `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]` cho static.

## Singleton: hai cái, viết đúng

Chấp nhận singleton cho **1–2 thứ thật sự chỉ có một và không giữ trạng thái game**: `GameFlow` (xem [[unity-game-loop]]) và có thể `AudioService`. `GameManager` phình vì nó là chỗ **dễ với tới nhất** từ mọi nơi; mỗi lần ai đó lười truyền tham chiếu, một field mới mọc ở đó.

```csharp
public abstract class PersistentSingleton<T> : MonoBehaviour where T : PersistentSingleton<T> {
    public static T I { get; private set; }
    protected virtual void Awake() {
        if (I != null && I != this) { Destroy(gameObject); return; }   // huỷ bản MỚI
        I = (T)this;
    }
    protected virtual void OnDestroy() { if (I == this) I = null; }     // cần khi tắt Domain Reload
}
```

Không tạo lazy trong getter (`new GameObject` khi `I == null`): nó che thứ tự khởi tạo, và khi được gọi trong `OnDestroy` lúc thoát Play, nó sinh object ma với cảnh báo "Some objects were not cleaned up".

## Service Locator có kỷ luật vs DI framework

```csharp
public static class Services {
    static readonly Dictionary<Type, object> map = new();
    public static void Register<T>(T s) where T : class => map[typeof(T)] = s;
    public static T Get<T>() where T : class =>
        map.TryGetValue(typeof(T), out var s) ? (T)s
        : throw new InvalidOperationException($"{typeof(T).Name} chưa đăng ký — gọi trong Awake?");
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    static void Reset() => map.Clear();
}
```

Kỷ luật là bốn luật, không có luật nào là code: đăng ký **chỉ trong Bootstrapper**; đăng ký **interface** (`IAudioService`), không đăng ký class; `Get` **trong `Start`**, không trong `Awake`; `Get` ném lỗi, **không trả null**. Thiếu một luật, Service Locator thành singleton có thêm một bước.

| Quy mô | Dùng gì |
|---|---|
| 1 người, dưới 15 hệ thống | 1–2 singleton + SO event channel. Xong. |
| 2–5 người, 6–12 tháng | Service Locator theo bốn luật trên. Thêm interface để test được. |
| 5+ người, cần scope (per-match, per-scene), test nhiều | **VContainer**: nhanh, ít reflection, có source generator cho IL2CPP. Zenject/Extenject nặng hơn, resolve chậm hơn, ít được bảo trì. |

DI framework trả giá bằng thời gian khởi động và một tầng trừu tượng người mới phải học. Nó đáng khi bạn có nhiều scope sống độc lập; không đáng để "cho sạch".

## State machine bằng class thường

```csharp
public interface IState { void Enter(); void Tick(float dt); void Exit(); }

public sealed class StateMachine {
    public IState Current { get; private set; }
    public void Set(IState next) {
        if (ReferenceEquals(next, Current)) return;
        Current?.Exit();
        Current = next;
        Current?.Enter();
    }
    public void Tick(float dt) => Current?.Tick(dt);
}
```

Mỗi state là một class nhận tham chiếu tới context (`EnemyContext` chứa transform, data, animator). MonoBehaviour chỉ gọi `fsm.Tick(Time.deltaTime)` trong `Update`. **Không dùng Animator làm FSM logic**: transition của nó được đánh giá ở bước animator (trễ một frame), `Has Exit Time` chen vào, tham số là string, và không unit test được. Logic FSM **điều khiển** Animator (`SetBool("Attacking")`), không phải ngược lại. Lý thuyết ở [[fsm]], phần animation ở [[unity-animation]]. Quá 8 state với transition chéo thì sang [[behavior-tree]].

## Command cho undo và replay

```csharp
public interface ICommand { void Execute(); void Undo(); }

public sealed class MoveUnitCommand : ICommand {
    readonly Unit unit; readonly Vector2Int from, to;
    public MoveUnitCommand(Unit u, Vector2Int target) { unit = u; from = u.Cell; to = target; }
    public void Execute() => unit.SetCell(to);
    public void Undo()    => unit.SetCell(from);
}
```

Đáng dùng ở game theo lượt, level editor, và replay (ghi command + số tick, phát lại với cùng seed). **Không đáng** cho input hành động thời gian thực: không có nghĩa "undo một cú nhảy", và input buffer 5 dòng trong hệ input làm việc đó tốt hơn.

## Object pool: dùng cái có sẵn, reset cho đủ

`UnityEngine.Pool.ObjectPool<T>` có từ 2021 (code mẫu ở [[architecture-patterns]]). Đừng tự viết. Việc của bạn là **reset**, và đây là chỗ 90% bug pool nằm:

```csharp
public interface IPoolable { void OnGet(); void OnRelease(); }

public sealed class Bullet : MonoBehaviour, IPoolable {
    Rigidbody2D rb; TrailRenderer trail;
    void Awake() { rb = GetComponent<Rigidbody2D>(); trail = GetComponent<TrailRenderer>(); }
    public void OnGet()     { trail.Clear(); rb.linearVelocity = Vector2.zero; rb.simulated = true; }
    public void OnRelease() { rb.simulated = false; StopAllCoroutines(); }
}
```

Danh sách những gì **không tự reset** khi SetActive: vận tốc rigidbody, trail renderer (vẽ một vệt từ vị trí cũ sang vị trí mới), particle đang phát, coroutine đang chạy, animator state, `transform.localScale` nếu từng bị parent vào object có scale khác, và mọi field bool `isDead`. Pool sống ở Boot mà object trong pool thuộc scene Level → unload scene, stack chứa null. Pool theo scene hoặc `Clear()` khi `sceneUnloaded`.

Cho mảng tạm: `ListPool<T>.Get()` / `Release` và `CollectionPool` — hết `new List<>()` trong hàm nóng.

## Observer: C# event vs UnityEvent

| | `event Action<T>` | `UnityEvent<T>` |
|---|---|---|
| Nối trong Inspector | Không | Có — designer nối được |
| Hiệu năng | Gọi trực tiếp | Persistent listener qua reflection, chậm hơn nhiều lần, có thể cấp phát khi Invoke |
| Đổi tên hàm | Lỗi biên dịch (tốt) | Kết nối **mất âm thầm**, Inspector hiện "Missing" |
| Gỡ đăng ký | Code phải tự gỡ | Persistent listener theo object; `AddListener` lúc chạy vẫn phải gỡ |

Luật: `UnityEvent` cho **hook của designer trên prefab** (nút, trigger vùng, cutscene); C# event **giữa các hệ thống**. Luôn khai `event`, không khai `public Action<T>` trần — ai cũng có thể `=` ghi đè cả danh sách.

## Một `Update()` thay cho 500

Mỗi `Update()` là một lần vượt ranh giới native → managed. Unity đo 10.000 `Update()` rỗng tốn khoảng 1ms trên PC trước khi làm bất cứ việc gì; một manager gọi 10.000 hàm C# tốn khoảng một phần mười. Trên điện thoại nhân 3–5.

```csharp
public interface ITickable { void Tick(float dt); }

public sealed class TickManager : MonoBehaviour {
    readonly List<ITickable> items = new(512), toAdd = new(), toRemove = new();
    public void Add(ITickable t)    => toAdd.Add(t);
    public void Remove(ITickable t) => toRemove.Add(t);

    void Update() {
        foreach (var t in toAdd)    items.Add(t);       // sửa danh sách NGOÀI vòng lặp
        foreach (var t in toRemove) items.Remove(t);
        toAdd.Clear(); toRemove.Clear();
        float dt = Time.deltaTime;
        for (int i = 0; i < items.Count; i++) items[i].Tick(dt);
    }
}
```

Lợi thứ hai lớn hơn lợi thứ nhất: bạn có **một chỗ** để chạy AI ở 10Hz thay vì 60Hz, tick theo khoảng cách tới camera, hay tạm dừng cả nhóm. Xem [[unity-optimization]]. Object quên `Remove` trước khi destroy → `MissingReferenceException` ở frame kế; lại là cặp `OnEnable`/`OnDisable`.

## Strategy qua ScriptableObject

```csharp
public abstract class BulletBehaviour : ScriptableObject {
    public abstract void Tick(Bullet b, float dt);     // KHÔNG giữ trạng thái — trạng thái ở Bullet
}

[CreateAssetMenu(menuName = "Bullets/Homing")]
public sealed class HomingBehaviour : BulletBehaviour {
    [SerializeField] float turnDegPerSec = 240f;
    public override void Tick(Bullet b, float dt) { /* xoay b.Direction về b.Target */ }
}
```

`WeaponData` giữ một `BulletBehaviour`; designer kéo `Homing`, `Bounce`, `Pierce` vào mà không cần dev. Một asset dùng cho 500 viên đạn nên **không được có field runtime** — mọi trạng thái nằm trên `Bullet`.

## MVP cho UI

Model là dữ liệu thuần, View là MonoBehaviour chỉ hiện, Presenter nối hai bên qua event. UI không đọc `PlayerStats` trực tiếp. Chi tiết và code ở [[unity-ui]].

## Interface vs abstract MonoBehaviour

`[SerializeField] IDamageable target;` hiện **trống** trong Inspector: Unity không serialize interface. Bốn lối ra:
- Serialize `Component`, `TryGetComponent<IDamageable>` trong `Awake`, kiểm tra trong `OnValidate`.
- `[SerializeReference]` cho class thường đa hình (không phải `UnityEngine.Object`); cần drawer chọn kiểu.
- Strategy qua SO như trên — đa hình có Inspector, không cần drawer.
- Abstract MonoBehaviour: kéo thả được, đa hình được, nhưng ăn slot kế thừa duy nhất.

Luật: interface cho **hợp đồng logic** (test giả lập được); abstract MonoBehaviour hoặc SO khi cần **tham chiếu trong Inspector**. Generic MonoBehaviour (`Pool<T> : MonoBehaviour`) không gắn được vào GameObject; phải có lớp con cụ thể.

## Bẫy hay gặp

- `target?.Invoke()` với `target` là `UnityEngine.Object` đã destroy: `?.` không dùng toán tử `==` mà Unity nạp chồng, object "giả null" lọt qua rồi ném `MissingReferenceException`. Dùng `if (target != null)`.
- `e += () => Foo();` rồi `e -= () => Foo();` không gỡ gì — lambda mới. Giữ delegate trong field hoặc dùng method group.
- SO event channel không được scene/prefab nào trong build tham chiếu → **không có trong build**; `Resources.Load` nó trả null. Mọi channel nằm trong một `ChannelRegistry` SO mà Boot tham chiếu.
- Tắt Domain Reload để Play nhanh hơn rồi mọi static và SO runtime dính từ lần trước; bật lại khi debug hành vi lạ trước khi nghi code.

## Kiểm tra nhanh
- Play → Stop → Play với Domain Reload tắt: log giống hệt lần đầu? Event nào bắn hai lần?
- Grep `.I.` và `.Instance`: chỉ ≤ 2 kiểu xuất hiện?
- Grep `void Update()` rồi đếm cái chỉ có `if (…) return;`: chuyển sang event hoặc TickManager.
- Profiler `BehaviourUpdate` với 500 enemy active: dưới 0.5ms trên máy mục tiêu?
- Grep `+= () =>` và `+= delegate`: mỗi cái có gỡ được không?

## 🤖 Prompt cho AI

AI dùng singleton cho mọi hệ thống, `FindFirstObjectByType` trong `Start` để "lấy tham chiếu", tự viết pool thay vì `ObjectPool<T>`, và làm FSM bằng Animator vì "Unity có sẵn".

**Phải nêu rõ:**
- Số singleton cho phép và tên chúng; mọi thứ khác đi qua đâu (SO channel / Service Locator / VContainer)
- Danh sách SO channel đã có và quy ước đặt tên (`OnPlayerDied`, `OnGoldChanged`)
- FSM bằng class thường hay Animator; ai điều khiển ai
- Pool bằng `UnityEngine.Pool`, và danh sách thứ phải reset trong `OnGet`/`OnRelease`
- `Update()` được phép ở đâu; còn lại qua `ITickable`
- Domain Reload bật hay tắt (quyết định reset static)

**Mẫu prompt**

```
Viết hệ thống Enemy cho Unity 6000.0 (URP), theo kiến trúc đã có:
- Singleton duy nhất được dùng: GameFlow.I. CẤM thêm singleton, CẤM FindFirstObjectByType/FindObjectsByType.
- Tham chiếu giữa hệ thống qua Services.Get<T>() (interface) gọi trong Start, KHÔNG trong Awake.
- Sự kiện: SO channel có sẵn ở _Project/Core/Events (VoidEventChannel, IntEventChannel, EnemyEventChannel).
  Subscribe trong OnEnable, Unsubscribe trong OnDisable, CẤM lambda.
- FSM: class thường implement IState (Idle/Chase/Attack/Dead), EnemyBrain.Update chỉ gọi fsm.Tick.
  Animator chỉ nhận SetBool/SetTrigger từ state; CẤM đọc Animator state để quyết định logic.
- Hành vi tấn công là ScriptableObject Strategy (AttackBehaviour abstract) — KHÔNG field runtime trong SO.
- Spawn qua UnityEngine.Pool.ObjectPool<Enemy> defaultCapacity 32, maxSize 128, collectionCheck true.
  OnGet phải reset: hp, fsm về Idle, rb.linearVelocity, Animator.Rebind(), mọi coroutine. Liệt kê rõ.
- Enemy đăng ký vào EnemyRuntimeSet (SO, List [NonSerialized]) trong OnEnable/OnDisable.
- Field public qua [SerializeField] private. Config số ở EnemyData (SO) — KHÔNG hardcode.

Trước khi viết code: liệt kê class, class nào là MonoBehaviour, class nào là SO, class nào là C# thuần.
```

**Bẫy thường gặp:** AI khai `public List<Enemy> Items` trong runtime set SO **không** có `[NonSerialized]`. Trên build chạy đúng; trong Editor sau lần Play thứ hai danh sách có 12 tham chiếu "null" và AI director đếm sai số quái. Bạn debug gameplay hai tiếng trong khi lỗi nằm ở một attribute — và AI sẽ không tự nhận ra vì code của nó "đúng" theo mọi tài liệu về `List<T>`.
