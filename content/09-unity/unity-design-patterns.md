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

## 💻 Code

Demo dựng ba vai của ScriptableObject cùng lúc: asset `OnWaveCleared` là event channel, asset `LivingEnemies` là runtime set mà enemy tự đăng ký trong `OnEnable`/`OnDisable`, và `EnemySpawner` dùng `ObjectPool<Enemy>` có sẵn với reset đầy đủ trong `actionOnGet`. Kiểm chứng được: pool xoay vòng đúng 20 object cho vô số wave, danh sách runtime set rỗng khi thoát Play, và channel bắn đúng một lần mỗi wave.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 330" role="img" aria-label="Hierarchy có EnemySpawner với 20 con P_Enemy trong pool, Project có hai asset OnWaveCleared và LivingEnemies; Inspector hiện EnemySpawner, VoidEventChannel và EnemyRuntimeSet">
  <rect x="10" y="10" width="200" height="310" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">▾ Level01</text>
  <rect x="16" y="72" width="188" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="22" y="87" class="fig-label" font-size="12" font-weight="600">▾ EnemySpawner</text>
  <text x="38" y="106" class="fig-muted" font-size="11">P_Enemy(Clone) ×20  (con, pool)</text>
  <text x="22" y="126" class="fig-muted" font-size="11">Main Camera</text>
  <text x="22" y="158" class="fig-label" font-size="12" font-weight="600">Project</text>
  <text x="22" y="176" class="fig-muted" font-size="11">_Project/Core/Events/</text>
  <text x="34" y="194" font-size="11" fill="#51cf9b">OnWaveCleared.asset</text>
  <text x="22" y="212" class="fig-muted" font-size="11">_Project/Core/Sets/</text>
  <text x="34" y="230" font-size="11" fill="#ffd43b">LivingEnemies.asset</text>
  <text x="22" y="248" class="fig-muted" font-size="11">Features/Combat/Prefabs/</text>
  <text x="34" y="266" class="fig-muted" font-size="11">P_Enemy.prefab</text>
  <text x="22" y="292" class="fig-muted" font-size="11">P_Enemy: Enemy (Max Hp 30, Lifetime 3)</text>
  <text x="22" y="308" class="fig-muted" font-size="11">+ Rigidbody (Use Gravity ☐) + Collider</text>
  <rect x="226" y="10" width="424" height="310" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Enemy Spawner (Script)</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Prefab</text><text x="440" y="82" class="fig-label" font-size="11">P_Enemy (Enemy)</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Pool Default / Pool Max</text><text x="440" y="98" class="fig-label" font-size="11">20   /   100</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Enemies Per Wave</text><text x="440" y="114" class="fig-label" font-size="11">10</text>
  <text x="250" y="130" class="fig-muted" font-size="11">Spawn Interval / Spawn Radius</text><text x="440" y="130" class="fig-label" font-size="11">0.2   /   6</text>
  <text x="250" y="146" class="fig-muted" font-size="11">Runtime Set</text><text x="440" y="146" class="fig-label" font-size="11">LivingEnemies</text>
  <text x="250" y="162" class="fig-muted" font-size="11">Wave Cleared Channel</text><text x="440" y="162" class="fig-label" font-size="11">OnWaveCleared</text>
  <rect x="234" y="172" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="185" class="fig-label" font-size="12" font-weight="600">OnWaveCleared (Void Event Channel)</text>
  <text x="250" y="204" class="fig-muted" font-size="11">Description</text><text x="440" y="204" class="fig-label" font-size="11">Spawner raise khi LivingEnemies rỗng</text>
  <text x="250" y="220" class="fig-muted" font-size="11">listeners</text><text x="440" y="220" class="fig-label" font-size="11">[NonSerialized] — không hiện, không vào asset</text>
  <rect x="234" y="230" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="243" class="fig-label" font-size="12" font-weight="600">LivingEnemies (Enemy Runtime Set)</text>
  <text x="250" y="262" class="fig-muted" font-size="11">Items</text><text x="440" y="262" class="fig-label" font-size="11">0  ([NonSerialized], rỗng khi thoát Play)</text>
  <text x="250" y="278" class="fig-muted" font-size="11">Count lúc Play</text><text x="440" y="278" class="fig-label" font-size="11">0 → 10 → 0 → 10 …</text>
  <text x="250" y="304" class="fig-muted" font-size="11">Hai asset SO này được cả Spawner lẫn UI/audio tham chiếu — không ai FindObjectsByType.</text>
</svg>
<figcaption>Spawner giữ pool làm con của chính nó: unload scene là pool đi theo, không còn stack chứa object đã destroy. Enemy không biết Spawner, chỉ biết runtime set và callback trả về pool.</figcaption>
</figure>

**Script**

```csharp
// VoidEventChannel.cs — Unity 6 (6000.x). Asset: Create ▸ Events ▸ Void Channel → _Project/Core/Events/OnWaveCleared.asset
using System;
using UnityEngine;

[CreateAssetMenu(menuName = "Events/Void Channel", fileName = "OnSomething")]
public sealed class VoidEventChannel : ScriptableObject
{
    [TextArea] [SerializeField] string description;   // cho designer biết ai raise, ai nghe — không dùng lúc chạy

    [NonSerialized] Action listeners;                 // KHÔNG serialize: không được ghi vào asset khi Save Project
    [NonSerialized] int raiseCount;

    public int ListenerCount => listeners?.GetInvocationList().Length ?? 0;
    public int RaiseCount => raiseCount;

    public void Raise() { raiseCount++; listeners?.Invoke(); }
    public void Register(Action a)   => listeners += a;
    public void Unregister(Action a) => listeners -= a;

    // Lớp bảo vệ thứ hai: subscriber MonoBehaviour gỡ trong OnDisable là lớp chính;
    // OnDisable của SO chạy khi Domain Reload / unload asset, dọn nốt những gì còn sót.
    void OnDisable() { listeners = null; raiseCount = 0; }
}
```

```csharp
// EnemyRuntimeSet.cs — Unity 6 (6000.x). Asset: Create ▸ Runtime Sets ▸ Enemy → _Project/Core/Sets/LivingEnemies.asset
using System;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(menuName = "Runtime Sets/Enemy", fileName = "LivingEnemies")]
public sealed class EnemyRuntimeSet : ScriptableObject
{
    [NonSerialized] List<Enemy> items = new(64);      // thiếu [NonSerialized] = danh sách object chết dính vào asset

    public IReadOnlyList<Enemy> Items => items;
    public int Count => items.Count;

    /// <summary>Bắn khi phần tử cuối rời set. Khai `event` để không ai `=` ghi đè cả danh sách.</summary>
    public event Action Emptied;

    public void Add(Enemy e)    { if (!items.Contains(e)) items.Add(e); }
    public void Remove(Enemy e) { if (items.Remove(e) && items.Count == 0) Emptied?.Invoke(); }

    void OnDisable() { items.Clear(); Emptied = null; }   // thoát Play: không dính sang lần Play sau
}
```

```csharp
// Enemy.cs — Unity 6 (6000.x). Trên prefab P_Enemy cùng Rigidbody (Use Gravity ☐) + Collider bất kỳ.
// Đăng ký vào runtime set theo cặp OnEnable/OnDisable; chết thì TRẢ VỀ POOL, không Destroy.
using UnityEngine;

public sealed class Enemy : MonoBehaviour
{
    [SerializeField] float maxHp = 30f;
    [SerializeField] float lifetime = 3f;      // demo: tự chết sau N giây để thấy pool xoay vòng

    public float Hp { get; private set; }

    EnemyRuntimeSet set;                       // Spawner gán qua Init — Enemy không biết Spawner là ai
    System.Action<Enemy> release;
    Rigidbody rb;
    TrailRenderer trail;
    float age;
    bool released;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        trail = GetComponent<TrailRenderer>();  // có thể null — reset có kiểm tra
    }

    public void Init(EnemyRuntimeSet runtimeSet, System.Action<Enemy> releaseToPool)
    {
        set = runtimeSet;
        release = releaseToPool;
    }

    void OnEnable()  { if (set != null) set.Add(this); }
    void OnDisable() { if (set != null) set.Remove(this); }

    /// <summary>Pool gọi trong actionOnGet, SAU SetActive(true). Mọi thứ SetActive KHÔNG tự reset nằm ở đây.</summary>
    public void ResetState()
    {
        Hp = maxHp;
        age = 0f;
        released = false;
        transform.localScale = Vector3.one;    // từng bị parent vào object có scale khác thì lệch
        if (rb != null) { rb.linearVelocity = Vector3.zero; rb.angularVelocity = Vector3.zero; }   // 2022 LTS: rb.velocity
        if (trail != null) trail.Clear();      // không Clear: vệt kéo từ chỗ chết cũ sang chỗ spawn mới
        StopAllCoroutines();
    }

    public void TakeDamage(float dmg) { Hp -= dmg; if (Hp <= 0f) Die(); }

    void Update()
    {
        age += Time.deltaTime;
        if (age >= lifetime) Die();
    }

    void Die()
    {
        if (released) return;                  // collectionCheck của pool sẽ ném lỗi nếu Release hai lần
        released = true;
        release?.Invoke(this);
    }
}
```

```csharp
// EnemySpawner.cs — Unity 6 (6000.x). Trên GameObject "EnemySpawner" trong scene Level.
// Pool có sẵn của Unity; việc của ta là createFunc + reset trong actionOnGet, và nghe runtime set để biết wave sạch.
using System.Collections;
using UnityEngine;
using UnityEngine.Pool;

public sealed class EnemySpawner : MonoBehaviour
{
    [Header("Pool")]
    [SerializeField] Enemy prefab;
    [SerializeField] int poolDefault = 20;
    [SerializeField] int poolMax = 100;

    [Header("Wave")]
    [SerializeField] int enemiesPerWave = 10;
    [SerializeField] float spawnInterval = 0.2f;
    [SerializeField] float spawnRadius = 6f;

    [Header("Kênh ScriptableObject")]
    [SerializeField] EnemyRuntimeSet runtimeSet;
    [SerializeField] VoidEventChannel waveClearedChannel;

    ObjectPool<Enemy> pool;
    int wave;

    void Awake()
    {
        pool = new ObjectPool<Enemy>(
            createFunc: Create,
            actionOnGet: e => { e.gameObject.SetActive(true); e.ResetState(); },   // SetActive trước để Rigidbody nhận velocity
            actionOnRelease: e => e.gameObject.SetActive(false),
            actionOnDestroy: e => Destroy(e.gameObject),
            collectionCheck: true,                                                // Editor: bắt Release hai lần
            defaultCapacity: poolDefault,
            maxSize: poolMax);
    }

    void OnEnable()  => runtimeSet.Emptied += OnAllDead;
    void OnDisable() { runtimeSet.Emptied -= OnAllDead; StopAllCoroutines(); }

    void Start() => StartCoroutine(SpawnWave());

    Enemy Create()
    {
        var e = Instantiate(prefab, transform);   // con của Spawner: unload scene là pool đi theo
        e.Init(runtimeSet, pool.Release);         // Init SAU Instantiate — OnEnable đầu tiên chưa có set nên không Add
        e.gameObject.SetActive(false);
        return e;
    }

    IEnumerator SpawnWave()
    {
        wave++;
        for (int i = 0; i < enemiesPerWave; i++)
        {
            var e = pool.Get();                   // thiếu thì Create, không thì lấy object cũ → actionOnGet
            var dir = Random.insideUnitCircle.normalized * spawnRadius;
            e.transform.SetPositionAndRotation(transform.position + new Vector3(dir.x, 0f, dir.y), Quaternion.identity);
            yield return new WaitForSeconds(spawnInterval);
        }
    }

    void OnAllDead()
    {
        waveClearedChannel.Raise();               // UI, audio, quest tự nghe asset này — Spawner không biết họ
        StartCoroutine(NextWaveAfter(1f));
    }

    IEnumerator NextWaveAfter(float seconds)
    {
        yield return new WaitForSeconds(seconds);
        yield return SpawnWave();
    }

    void OnGUI()
    {
        GUILayout.BeginArea(new Rect(10, 10, 420, 60), GUI.skin.box);
        GUILayout.Label($"Wave {wave}   Sống: {runtimeSet.Count}   Pool active/all: {pool.CountActive}/{pool.CountAll}");
        GUILayout.Label($"OnWaveCleared: raised {waveClearedChannel.RaiseCount} · listeners {waveClearedChannel.ListenerCount}");
        GUILayout.EndArea();
    }
}
```

**Chạy thử**
- Play: HUD `Sống` tăng 0 → 10 trong 2 giây, `Pool active/all` lên `10/10`. Sau 3 giây enemy chết dần, `Sống` về 0, `raised 1`, một giây sau wave 2. Từ wave 2 trở đi `Pool all` đứng ở 10 — không có `Instantiate` nào nữa (Profiler ▸ CPU không còn `Instantiate`).
- Đổi `Lifetime` của prefab thành 1 và `Spawn Interval` 0.05: `Pool all` vẫn không vượt 10 vì object chết trước khi wave spawn xong — đó là pool đang tái dụng. Đặt `Lifetime` 30 và `Enemies Per Wave` 150: `Pool all` chạm 100 rồi enemy thứ 101 vẫn spawn nhưng khi Release bị Destroy thay vì vào pool (`maxSize`).
- Hierarchy lúc Play: 10 `P_Enemy(Clone)` active và phần còn lại tối màu dưới `EnemySpawner`. Chọn `LivingEnemies.asset` ở Inspector chế độ Debug: **không** có field `items` — vì `[NonSerialized]`. Xoá attribute đó, Play rồi Stop, Save Project: asset giờ chứa 10 tham chiếu `None (Enemy)` — đúng bẫy thân bài mô tả.
- Xoá trail: thêm `TrailRenderer` (Time 0.5) vào prefab, comment dòng `trail.Clear()`: mỗi lần spawn thấy vệt kéo từ chỗ enemy chết wave trước sang chỗ mới. Bật lại dòng đó → hết.
- Edit ▸ Project Settings ▸ Editor ▸ Enter Play Mode Options, tắt Domain Reload, Play → Stop → Play: HUD wave 1 vẫn `raised 0` lúc bắt đầu và `Sống` bắt đầu từ 0 — nhờ `OnDisable` của Enemy gỡ khỏi set khi scene bị huỷ. Gọi `Die()` hai lần trên cùng enemy (bỏ guard `released`): Console đỏ `Trying to release an object that has already been released to the pool` — đó là `collectionCheck` đang làm việc.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Singleton trong Unity viết thế nào cho đúng? Nhược điểm là gì?**
  → Guard phải huỷ **bản mới**: `if (Instance != null) { Destroy(gameObject); return; }` rồi `Instance = this; DontDestroyOnLoad(gameObject);`. Nhược điểm cụ thể trong Unity, không phải câu thần chú "anti-pattern": thứ tự khởi tạo không đảm bảo, bản trùng khi quay lại scene cũ, và không thay được bằng mock khi test.
- `Junior` **`ScriptableObject` khác `MonoBehaviour` chỗ nào? Dùng khi nào?**
  → SO là asset, không gắn vào GameObject, không có `Update`, sống độc lập với scene. Dùng cho ba vai: **config bất biến** (`WeaponData`), **event channel** (một asset `OnPlayerDied` mà UI, audio, quest cùng tham chiếu), và **runtime set** (một SO giữ `List<Enemy>` đang sống, thay cho `FindObjectsByType` mỗi frame).
- `Junior` **Vì sao `currentHp` trong ScriptableObject lần Play sau lại bắt đầu từ 37?**
  → Vì trong Editor, SO **sống xuyên các lần Play** và field runtime không có `[NonSerialized]` sẽ bị ghi thẳng vào asset. Trên build thì asset chỉ đọc nên reset sạch mỗi lần mở game — hai hành vi khác nhau, nghĩa là bug chỉ lộ ở một nơi. `[NonSerialized]` cộng gỡ đăng ký trong `OnDisable` là hai luật sống còn của SO.
- `Mid` **`event Action<T>` của C# và `UnityEvent<T>` — chọn cái nào, vì sao?**
  → Không phải cái nào tệ hơn mà là **khác mục đích**. UnityEvent nối được trong Inspector nên designer dùng được; đổi lại nó gọi qua reflection (chậm hơn nhiều lần, có thể cấp phát khi Invoke) và **đổi tên hàm thì kết nối mất âm thầm** — Inspector chỉ hiện "Missing". Luật: logic giữa code dùng `event Action`; chỗ designer cần nối tay thì UnityEvent hoặc SO event channel.
- `Mid` **500 script cùng có `Update()` rỗng thì tốn gì?**
  → Mỗi lần gọi là một chuyến native→managed khoảng **0,5 µs** kể cả khi thân hàm rỗng — khoảng **0,25 ms mỗi frame** khi chưa làm gì cả. Chữa bằng một manager tick `List<ITickable>`, và **xoá hẳn** `Update` khỏi script không cần: để trống vẫn bị gọi.
- `Mid` **Object pool thì tự viết hay dùng có sẵn?**
  → Dùng `UnityEngine.Pool.ObjectPool<T>` có sẵn. Cái khó không nằm ở pool mà ở **reset cho đủ**: trail, particle, vận tốc rigidbody, coroutine đang chạy, animator state. Quên một cái là viên đạn thứ hai bay ra với vệt khói của viên trước — và loại bug đó rất khó truy vì nó phụ thuộc thứ tự tái sử dụng.
- `Senior` **Team 5 người, 12 tháng: Service Locator hay DI framework?**
  → Tuỳ hai thứ: có cần **scope** (per-match, per-scene) không, và có cần test với mock không. Dưới 15 hệ thống và một người làm thì 1–2 singleton cộng SO event channel là đủ, thêm container chỉ là chi phí. Team 5 người 12 tháng thì DI thường đáng; VContainer hơn Zenject ở chỗ ít reflection và có source generator cho IL2CPP.
- `Senior` **Kể một chỗ anh cố tình không dùng pattern vì nó thừa.**
  → Ví dụ thật: một game jam hai tuần, tôi để hai singleton `AudioManager` và `GameManager` gọi thẳng nhau thay vì dựng event bus. Lý do: vòng đời dự án ngắn hơn thời gian mà chi phí ghép chặt kịp phát sinh. Pattern mua **khả năng thay đổi trong tương lai**; không có tương lai đó thì nó chỉ là chi phí.
- `Senior` **Tắt Domain Reload thì `static` có tự reset không?**
  → **Không** — đó chính là cái đánh đổi: vào Play Mode nhanh hơn nhiều, nhưng mọi `static` và mọi đăng ký sự kiện giữ nguyên từ lần Play trước. Cách chữa là `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]` để tự tay reset. Không biết điều này thì triệu chứng là "chạy lần đầu đúng, lần hai sai".

**Khung trả lời 60 giây** — "Anh dùng ScriptableObject vào những việc gì?"

> Ba vai. Một là config bất biến — `WeaponData`, `EnemyData`, chỉ đọc lúc chạy, designer sửa không cần build. Hai là **event channel**: một asset `OnPlayerDied` mà UI, audio, quest cùng tham chiếu qua Inspector — đây là cách duy nhất để hai scene additive nói chuyện với nhau mà không cần tìm nhau bằng `Find`. Ba là **runtime set**: một SO giữ `List<Enemy>` đang sống, enemy tự `Add` trong `OnEnable` và `Remove` trong `OnDisable`, nên spawner và UI đếm quái đọc chung một danh sách thay vì `FindObjectsByType` mỗi frame.
>
> Bẫy đi kèm vai 2 và 3 thì phải nói ngay: trong Editor, SO **sống xuyên các lần Play**. Field runtime không có `[NonSerialized]` sẽ bị ghi vào asset — lần Play sau `currentHp` bắt đầu từ 37, danh sách enemy đầy tham chiếu tới object đã destroy. Trên build thì asset chỉ đọc nên reset sạch mỗi lần mở game. Hai hành vi khác nhau nghĩa là bug chỉ lộ ở một nơi.

**Họ sẽ đào tiếp**

- *"Vì sao `UnityEvent` lại tệ hơn?"* → Không hẳn tệ, mà **khác mục đích**. UnityEvent nối được trong Inspector nên designer dùng được; đổi lại nó gọi qua reflection (chậm hơn nhiều lần, có thể cấp phát khi Invoke) và khi bạn **đổi tên hàm thì kết nối mất âm thầm** — Inspector chỉ hiện "Missing", không có lỗi biên dịch. Luật của tôi: logic giữa code dùng `event Action`, chỗ designer cần nối tay thì UnityEvent hoặc SO event channel.
- *"500 `Update()` rỗng tốn bao nhiêu?"* → Mỗi lần gọi là một chuyến native→managed khoảng 0.5µs kể cả khi thân hàm rỗng: ~0.25ms mỗi frame khi chưa làm gì. Chữa bằng một manager tick `List<ITickable>`, và **xoá hẳn** `Update` khỏi script không cần (để trống vẫn bị gọi).
- *"Khi nào mới cần DI framework?"* → Khi cần **scope** (per-match, per-scene) và khi cần test có mock. Dưới 15 hệ thống và một người làm thì 1–2 singleton + SO event channel là đủ; thêm container lúc đó chỉ là chi phí. VContainer hơn Zenject ở chỗ ít reflection và có source generator cho IL2CPP.
- *"Object pool thì tự viết hay dùng có sẵn?"* → Dùng `UnityEngine.Pool.ObjectPool<T>` có sẵn. Cái khó không nằm ở pool mà ở **reset cho đủ**: trail, particle, rigidbody velocity, coroutine đang chạy, animator state — quên một cái là viên đạn thứ hai bay ra với vệt khói của viên trước.

**Cờ đỏ**

- Nói "singleton là anti-pattern" như một câu thần chú mà không nói được *nó hỏng ở đâu trong Unity cụ thể* (thứ tự init, bản trùng, không test được).
- Khai `public List<Enemy> Items` trong runtime set SO **không** `[NonSerialized]`.
- `FindObjectOfType` / `GetComponent` trong `Update`.
- Kể tên 8 pattern nhưng không có ví dụ nào từ dự án thật; hoặc ngược lại, nhét Command + Visitor vào một game 2 tuần.
- Không biết Domain Reload tắt thì `static` **không** tự reset giữa các lần Play.

**Số / ví dụ nên thuộc**

- ~0.5µs cho một lần gọi `Update` rỗng; 500 script ≈ 0.25ms/frame.
- `[NonSerialized]` + gỡ đăng ký trong `OnDisable` là hai luật sống còn của SO event channel.
- `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]` để reset `static` khi tắt Domain Reload.
