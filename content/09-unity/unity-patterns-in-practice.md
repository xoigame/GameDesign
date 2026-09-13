---
title: Ghép pattern thành kiến trúc
icon: 🧩
summary: Bảng "vấn đề nào dùng pattern nào", một tính năng đi qua mấy lớp, chiều phụ thuộc, anti-pattern quen mặt trong dự án Unity, và cách gỡ một God class.
status: deep
read: 632
level: intermediate
order: 32
tags: [unity, architecture, pattern, design]
related: [unity-design-patterns, architecture-patterns, unity-game-loop, unity-testing-ci, unity-project-structure]
---

[[unity-design-patterns]] nói **từng pattern**: ScriptableObject ba vai, singleton viết sao cho đúng, event C# hay UnityEvent, pool, state machine. Node này nói phần khó hơn và cũng là phần phỏng vấn hỏi nhiều hơn ở mức mid–senior: **ghép chúng lại thành một kiến trúc chịu được sáu tháng và năm người**.

Biết mười pattern mà không biết ghép thì kết quả thường là một dự án có đủ mười pattern và vẫn rối.

## Vấn đề nào dùng gì

Bảng này là thứ đáng thuộc, vì phỏng vấn hay hỏi ngược: "gặp tình huống X thì anh làm sao".

| Vấn đề thật trong dự án | Giải pháp mặc định | Đừng dùng |
|---|---|---|
| Designer cần chỉnh số mà không cần build | **ScriptableObject** làm config | Hằng số trong code, JSON tự parse |
| Hai scene additive cần nói chuyện | **SO event channel** | `GameObject.Find` xuyên scene |
| Nhiều hệ thống cần biết danh sách enemy đang sống | **Runtime set** (SO giữ `List`) | `FindObjectsByType` mỗi frame |
| Một thứ tồn tại đúng một bản, cần truy cập khắp nơi | **Service locator có kỷ luật** (4–8 service) | Singleton cho mọi class |
| Nhân vật có nhiều trạng thái loại trừ nhau | **State machine bằng class thường** | Rừng `if` trong `Update` |
| Cần undo, replay, hoặc netcode xác định | **Command** | Sửa thẳng trạng thái |
| Spawn/huỷ liên tục | **Pool** (`UnityEngine.Pool`) | `Instantiate`/`Destroy` mỗi lần |
| Vũ khí/skill khác nhau về *hành vi* | **Strategy bằng SO** | `switch` theo enum loại |
| Enemy khác nhau về *số liệu* | **Prefab Variant + SO data** | Kế thừa `EnemyArcher : Enemy` |
| UI phải hiện trạng thái game | **View thụ động + event** (MVP) | UI tự đọc `Player.Instance.hp` mỗi frame |
| Cần test logic không cần Editor | **Tách hàm thuần + interface** | Logic nằm trong `MonoBehaviour` |

Điểm chung của cột giữa: **dữ liệu tách khỏi hành vi**, và **người gọi không cần biết người nghe là ai**. Hai nguyên tắc đó giải thích gần hết các lựa chọn.

## Một tính năng đi qua mấy lớp

Ví dụ cụ thể — "người chơi đánh trúng enemy" — vì câu hỏi phỏng vấn hay bắt đầu bằng "mô tả luồng":

1. **Input** đọc nút bấm, chỉ đặt cờ; không tính toán gì ([[unity-input]]).
2. **Combat service** nhận ý định, hỏi `DamageCalculator.Compute(...)` — một **hàm tĩnh thuần**, test được không cần Editor.
3. **Enemy** trừ máu, đổi state trong **state machine** của nó (Hurt → Idle, hoặc → Death).
4. Enemy bắn một **event**: `OnEnemyDamaged(enemy, amount)` qua SO event channel.
5. **UI**, **audio**, **VFX**, **quest** cùng nghe event đó. Không ai trong số này được enemy biết tới — enemy chỉ phát tín hiệu.
6. Khi chết: enemy tự gỡ khỏi **runtime set**, trả mình về **pool**, và loot sinh ra qua một **factory** đọc bảng rơi đồ từ SO.

Điều đáng nói không phải danh sách pattern, mà là **hướng của các mũi tên**: enemy không gọi UI, không gọi audio, không gọi quest. Nó phát ra một sự kiện và xong việc. Đó là thứ cho phép thêm "hiện số damage bay lên" vào tuần sau mà không mở lại file enemy.

## Chiều phụ thuộc là luật, không phải gợi ý

```
Core  ←  Gameplay  ←  UI
 (dữ liệu, tiện ích)   (luật chơi)   (hiển thị)
```

Mũi tên chỉ đi một chiều: **UI biết Gameplay, Gameplay không biết UI**. Gameplay cần UI phản ứng thì nó **bắn event**. Khi mỗi tầng là một assembly definition ([[unity-project-structure]]), compiler tự thi hành luật này — và đó là cách duy nhất nó không bị phá sau ba tháng, vì lời nhắc trong tài liệu thì ai cũng quên.

Dấu hiệu chiều phụ thuộc đã hỏng: bạn muốn viết test cho công thức sát thương nhưng phải nạp cả một scene có Canvas.

## Anti-pattern quen mặt trong dự án Unity

Sáu thứ này xuất hiện ở gần như mọi dự án đủ lớn, và biết **triệu chứng** của chúng quan trọng hơn biết tên:

| Anti-pattern | Triệu chứng | Gỡ bằng |
|---|---|---|
| **God GameManager** | Một file 2000 dòng, ai cũng phải sửa, PR nào cũng conflict | Tách theo *trách nhiệm*: SceneFlow, Score, Save, Audio — mỗi cái một service |
| **Singleton chồng singleton** | `A.Instance.B.Instance.C` trong code gameplay | Tiêm phụ thuộc qua Inspector hoặc service locator, giới hạn 4–8 service |
| **Event bus toàn cục** | Sự kiện "đến từ đâu đó", không truy được ai phát, ai nghe | SO event channel **có tên cụ thể** (`OnPlayerDied`), không phải một bus chung cho mọi thứ |
| **Kế thừa MonoBehaviour sâu** | `EnemyFlyingBossPhase2 : EnemyFlying : Enemy : Character` | Composition: component nhỏ + SO strategy |
| **Manager cho mọi danh từ** | `BulletManager`, `TreeManager`, `DoorManager`… mỗi cái một singleton | Chỉ tạo manager khi có **trạng thái toàn cục thật**; còn lại là component |
| **Trạng thái trong `static`** | Chơi lại lần hai thì điểm số nhớ từ lần trước (khi tắt Domain Reload) | Đặt trạng thái trong instance; static chỉ cho hằng số |

Ba cái đầu có chung một gốc: **ai cũng gọi được mọi thứ**. Kiến trúc tốt không phải là nhiều tầng, mà là **ít đường đi hơn** — càng ít cách để hai thứ chạm nhau, càng ít chỗ hỏng.

## Khi nào không dùng pattern

Pattern là chi phí trả trước để đổi lấy khả năng thay đổi về sau. Không có thay đổi về sau thì đó là chi phí thuần:

- **Game jam, prototype vứt đi**: viết thẳng, `public` hết, singleton thoải mái. Prototype tồn tại để trả lời một câu hỏi, không để bảo trì.
- **Tính năng chỉ có một biến thể và sẽ không có thêm**: một `switch` ba nhánh đọc dễ hơn ba ScriptableObject strategy.
- **Đội một người, dự án hai tháng**: service locator và event channel có thể là thừa; nhưng tách dữ liệu ra SO thì gần như luôn đáng, vì nó trả lãi ngay khi cân bằng.

Câu hỏi tự kiểm trước khi thêm một tầng trừu tượng: *"thay đổi nào trong ba tháng tới sẽ rẻ đi nhờ nó?"* Không trả lời được bằng một ví dụ cụ thể thì chưa nên thêm.

## Gỡ một God class

Quy trình đã dùng được, và cũng là câu trả lời tốt cho câu hỏi phỏng vấn "anh refactor thế nào mà không làm hỏng game":

1. **Đừng viết lại.** Viết lại một file 2000 dòng đang chạy là cách chắc chắn nhất để mất hai tuần và thêm bug.
2. **Liệt kê trách nhiệm** trong file: chuyển scene, điểm số, lưu game, âm thanh, spawn… Mỗi trách nhiệm là một ứng viên tách ra.
3. **Tách cái độc lập nhất trước** (thường là Audio hoặc Save): tạo service mới, chuyển code sang, để God class **gọi service** — bên ngoài chưa cần biết gì.
4. **Đổi người gọi dần**, mỗi PR một nhóm; God class teo lại từng bước và game luôn chạy được.
5. **Test trước khi tách** cho phần logic thuần, để biết mình không làm đổi hành vi — xem [[unity-testing-ci]].
6. Xoá phần rỗng còn lại.

Mấu chốt là **luôn có bản chạy được** sau mỗi bước. Refactor kéo dài hai tuần không merge được là refactor thất bại, dù code cuối đẹp tới đâu.

## Kiểm tra nhanh

- [ ] Mỗi tầng là một asmdef, và **compiler** thi hành chiều phụ thuộc
- [ ] Gameplay không gọi thẳng UI; nó bắn event
- [ ] Đếm số singleton: trên 8 là dấu hiệu phải xem lại
- [ ] File dài nhất trong dự án bao nhiêu dòng? Ai phải sửa nó nhiều nhất?
- [ ] Công thức quan trọng nhất (sát thương, kinh tế) test được **không cần mở Editor**
- [ ] Mỗi tầng trừu tượng trả lời được: "thay đổi nào sắp tới rẻ đi nhờ nó?"

## 🤖 Prompt cho AI

**Dùng AI thế nào cho quyết định kiến trúc**

AI có một thiên lệch rất ổn định ở mảng này: **nó thêm tầng**. Hỏi "thiết kế hệ thống inventory", bạn sẽ nhận về interface, factory, repository, event bus và DI container — cho một cái túi 20 ô. Nó tối ưu cho "nghe có vẻ đúng chuẩn", còn bạn phải tối ưu cho "đội mình sửa được trong sáu tháng".

Cách dùng có ích: bắt nó **đề xuất hai phương án ở hai mức trừu tượng khác nhau** — bản tối giản và bản đầy đủ — cùng với *thay đổi nào trong tương lai làm bản đầy đủ đáng tiền*. Câu cuối là câu chốt: nếu không nêu được thay đổi cụ thể, bản tối giản thắng.

Hai việc nó làm rất tốt: **soát chiều phụ thuộc** (dán cấu trúc asmdef và danh sách tham chiếu, nó chỉ ra vòng phụ thuộc nhanh hơn mắt người) và **viết kế hoạch gỡ God class theo từng bước merge được** khi bạn đã đưa danh sách trách nhiệm.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Quy mô thật: bao nhiêu người, bao lâu, game sống bao lâu sau phát hành.
- Cái gì **sắp thay đổi** và cái gì chắc chắn không — đây là dữ kiện quyết định mức trừu tượng.
- Kiến trúc hiện tại: có asmdef chưa, có bao nhiêu singleton, file dài nhất bao nhiêu dòng.
- Ràng buộc: được refactor tới đâu, có phải giữ tương thích save cũ không.
- Ai sẽ đọc code này — designer cũng sửa hay chỉ lập trình viên.

**Mẫu prompt**

```
Unity 6, đội 4 người, game mobile đã phát hành, còn cập nhật 12 tháng nữa.
Hiện tại: 1 GameManager 1800 dòng, 11 singleton, chưa có asmdef.
Sắp tới chắc chắn có: thêm 2 loại enemy mới, thêm chế độ chơi thứ hai,
và bản địa hoá. Chắc chắn KHÔNG có: multiplayer.

1. Đề xuất HAI phương án cho hệ thống chiến đấu: bản tối giản và bản đầy đủ.
   Với bản đầy đủ, nêu rõ thay đổi cụ thể nào trong 12 tháng tới làm nó đáng tiền.
2. Kế hoạch gỡ GameManager thành từng PR: mỗi PR phải merge được và game vẫn chạy.
KHÔNG đề xuất DI container hay ECS trừ khi chỉ ra được lợi ích đo được ở quy mô này.
```

**Bẫy thường gặp:** AI đề xuất **một event bus toàn cục** cho mọi thứ, vì đó là lời khuyên phổ biến nhất trên mạng. Ở dự án thật nó sinh ra đúng cái khó nhất để gỡ: sự kiện đến từ đâu đó, không truy được ai phát và ai nghe, và IDE không giúp được gì vì mọi thứ đều đi qua một `Publish(object)`. Ràng buộc nên viết vào prompt: **event channel phải có tên cụ thể và kiểu cụ thể** (`OnPlayerDied`), không có bus chung; và mỗi channel phải chỉ ra được nơi phát trong không quá hai lần tìm kiếm.

## 💻 Code

Demo là **một lát cắt dọc** chạy được: người chơi gây sát thương → enemy trừ máu và phát event → UI/audio nghe → enemy chết thì tự trả về pool và rời runtime set. Bốn pattern ghép lại trong ~120 dòng, và điều đáng nhìn nhất là **enemy không biết UI, audio hay pool tồn tại**.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Sơ đồ asset ScriptableObject, các component trong scene và chiều mũi tên phụ thuộc một chiều">
  <rect x="10" y="10" width="216" height="280" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Asset (ScriptableObject)</text>
  <line x1="10" y1="42" x2="226" y2="42" class="fig-line"/>
  <rect x="16" y="52" width="194" height="20" rx="4" fill="#b197fc" opacity="0.18"/>
  <text x="24" y="67" class="fig-label" font-size="12" font-weight="600">OnEnemyDamaged  (channel)</text>
  <rect x="16" y="78" width="194" height="20" rx="4" fill="#b197fc" opacity="0.18"/>
  <text x="24" y="93" class="fig-label" font-size="12" font-weight="600">AliveEnemies  (runtime set)</text>
  <rect x="16" y="104" width="194" height="20" rx="4" fill="#51cf9b" opacity="0.18"/>
  <text x="24" y="119" class="fig-label" font-size="12" font-weight="600">Goblin  (EnemyData)</text>
  <text x="24" y="142" class="fig-muted" font-size="11">Config: maxHp 30, defense 4</text>
  <line x1="10" y1="156" x2="226" y2="156" class="fig-line"/>
  <text x="22" y="176" class="fig-label" font-size="12" font-weight="600">Hai luật sống còn</text>
  <text x="22" y="196" class="fig-muted" font-size="11">1. Gỡ đăng ký trong OnDisable</text>
  <text x="22" y="212" class="fig-muted" font-size="11">2. Dữ liệu runtime trong SO phải</text>
  <text x="32" y="226" class="fig-muted" font-size="11">tự dọn khi thoát Play</text>
  <text x="22" y="250" class="fig-muted" font-size="10">Trong Editor, SO sống xuyên các lần</text>
  <text x="22" y="264" class="fig-muted" font-size="10">Play — quên hai luật trên là lần Play</text>
  <text x="22" y="278" class="fig-muted" font-size="10">sau có subscriber và enemy đã chết.</text>
  <rect x="242" y="10" width="408" height="280" rx="8" class="fig-box"/>
  <text x="254" y="32" class="fig-label" font-size="13" font-weight="600">Luồng một đòn đánh — mũi tên đi MỘT chiều</text>
  <line x1="242" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="254" y="56" width="120" height="26" rx="5" fill="#6ea8fe" opacity="0.20"/>
  <text x="262" y="73" class="fig-label" font-size="11">Player attack</text>
  <text x="380" y="73" class="fig-muted" font-size="14">→</text>
  <rect x="400" y="56" width="150" height="26" rx="5" fill="#51cf9b" opacity="0.20"/>
  <text x="408" y="73" class="fig-label" font-size="11">DamageCalculator</text>
  <text x="408" y="96" class="fig-muted" font-size="10">hàm tĩnh thuần — test không cần Editor</text>
  <rect x="254" y="110" width="120" height="26" rx="5" fill="#ffd43b" opacity="0.20"/>
  <text x="262" y="127" class="fig-label" font-size="11">Enemy.TakeDamage</text>
  <text x="380" y="127" class="fig-muted" font-size="14">→</text>
  <rect x="400" y="110" width="150" height="26" rx="5" fill="#b197fc" opacity="0.20"/>
  <text x="408" y="127" class="fig-label" font-size="11">OnEnemyDamaged.Raise</text>
  <text x="262" y="160" class="fig-muted" font-size="11">Enemy KHÔNG gọi UI, audio, quest.</text>
  <text x="262" y="176" class="fig-muted" font-size="11">Nó phát tín hiệu rồi xong việc.</text>
  <rect x="254" y="192" width="110" height="24" rx="5" fill="#7fe3ef" opacity="0.20"/>
  <text x="262" y="208" class="fig-label" font-size="11">UI số damage</text>
  <rect x="374" y="192" width="80" height="24" rx="5" fill="#7fe3ef" opacity="0.20"/>
  <text x="382" y="208" class="fig-label" font-size="11">Audio</text>
  <rect x="464" y="192" width="86" height="24" rx="5" fill="#7fe3ef" opacity="0.20"/>
  <text x="472" y="208" class="fig-label" font-size="11">Quest</text>
  <text x="254" y="238" class="fig-muted" font-size="11">Khi chết: rời runtime set (OnDisable) → trả về pool → loot qua factory.</text>
  <text x="254" y="262" class="fig-label" font-size="11" font-weight="600">Thêm "số damage bay lên" tuần sau = thêm một listener.</text>
  <text x="254" y="280" class="fig-muted" font-size="10">Không phải mở lại file Enemy. Đó là toàn bộ lý do của kiến trúc này.</text>
</svg>
<figcaption>Bốn pattern (SO config, event channel, runtime set, pool) ghép thành một luồng; chiều phụ thuộc chỉ đi một hướng.</figcaption>
</figure>

**Script**

```csharp
// EnemyDamagedChannel.cs — kênh sự kiện có TÊN CỤ THỂ và KIỂU CỤ THỂ.
// Không dùng một event bus chung cho mọi thứ: mất khả năng truy vết ai phát, ai nghe.
using System;
using UnityEngine;

[CreateAssetMenu(menuName = "Game/Events/Enemy Damaged")]
public class EnemyDamagedChannel : ScriptableObject
{
    public readonly struct Payload
    {
        public readonly Enemy Target;
        public readonly int Amount;
        public readonly bool Killed;
        public Payload(Enemy target, int amount, bool killed)
        { Target = target; Amount = amount; Killed = killed; }
    }

    public event Action<Payload> Raised;

    public void Raise(in Payload p) => Raised?.Invoke(p);

    // SO sống xuyên các lần Play trong Editor. Không dọn ở đây thì lần Play sau
    // vẫn còn subscriber của lần trước — trỏ vào object đã destroy.
    void OnDisable() => Raised = null;
}
```

```csharp
// EnemyRuntimeSet.cs — ai cũng đọc được danh sách enemy đang sống, không ai phải Find.
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(menuName = "Game/Runtime Set/Enemies")]
public class EnemyRuntimeSet : ScriptableObject
{
    // Field private KHÔNG được serialize, nên nó an toàn. Cái bẫy là field public
    // hoặc [SerializeField] giữ dữ liệu runtime — thứ đó bị ghi thẳng vào asset.
    readonly List<Enemy> items = new();

    public IReadOnlyList<Enemy> Items => items;
    public void Add(Enemy e) { if (!items.Contains(e)) items.Add(e); }
    public void Remove(Enemy e) => items.Remove(e);

    void OnDisable() => items.Clear();
}
```

```csharp
// DamageCalculator.cs — KHÔNG using UnityEngine: test chạy trong mili giây, không cần Editor.
public static class DamageCalculator
{
    public static int Compute(int attack, int defense, bool crit)
    {
        if (defense < 0) defense = 0;              // buff "giáp âm" từng làm sát thương nhân lên
        int raw = crit ? attack * 2 : attack;
        int result = raw - defense;
        return result < 1 ? 1 : result;            // luôn ăn tối thiểu 1
    }
}
```

```csharp
// Enemy.cs — biết dữ liệu của mình và kênh sự kiện. KHÔNG biết UI, audio, pool.
using System;
using UnityEngine;

public class Enemy : MonoBehaviour
{
    [SerializeField] EnemyData data;                  // config bất biến (ScriptableObject)
    [SerializeField] EnemyRuntimeSet runtimeSet;
    [SerializeField] EnemyDamagedChannel damagedChannel;

    int hp;

    /// Spawner nghe để trả về pool. Enemy không tự Destroy — nó không sở hữu vòng đời của mình.
    public event Action<Enemy> Died;

    void OnEnable()
    {
        hp = data.maxHp;
        runtimeSet.Add(this);
    }

    void OnDisable() => runtimeSet.Remove(this);      // quên dòng này là set đầy tham chiếu chết

    public void TakeDamage(int attack, bool crit)
    {
        int dmg = DamageCalculator.Compute(attack, data.defense, crit);
        hp -= dmg;
        bool killed = hp <= 0;

        damagedChannel.Raise(new EnemyDamagedChannel.Payload(this, dmg, killed));
        if (killed) Died?.Invoke(this);
    }
}
```

```csharp
// EnemySpawner.cs — sở hữu vòng đời: pool có sẵn của Unity, pre-warm lúc load.
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Pool;

public class EnemySpawner : MonoBehaviour
{
    [SerializeField] Enemy prefab;
    [SerializeField] int prewarm = 32;

    ObjectPool<Enemy> pool;

    void Awake()
    {
        pool = new ObjectPool<Enemy>(
            createFunc: () => { var e = Instantiate(prefab, transform); e.Died += Release; return e; },
            actionOnGet: e => e.gameObject.SetActive(true),
            actionOnRelease: e => e.gameObject.SetActive(false),
            actionOnDestroy: e => { e.Died -= Release; Destroy(e.gameObject); },
            collectionCheck: true, defaultCapacity: prewarm, maxSize: 256);

        // Trả giá Instantiate lúc load, không phải lúc đang đánh nhau.
        var warm = new List<Enemy>(prewarm);
        for (int i = 0; i < prewarm; i++) warm.Add(pool.Get());
        foreach (var e in warm) pool.Release(e);
    }

    public Enemy Spawn(Vector3 position)
    {
        var e = pool.Get();
        e.transform.position = position;
        return e;
    }

    void Release(Enemy e) => pool.Release(e);
}
```

```csharp
// CombatFeedback.cs — UI/audio chỉ NGHE. Thêm listener mới không phải mở file Enemy.
using TMPro;
using UnityEngine;

public class CombatFeedback : MonoBehaviour
{
    [SerializeField] EnemyDamagedChannel damagedChannel;
    [SerializeField] AudioSource hitSfx;
    [SerializeField] TextMeshProUGUI lastHitLabel;

    void OnEnable()  => damagedChannel.Raised += OnDamaged;
    void OnDisable() => damagedChannel.Raised -= OnDamaged;   // luật sống còn, không có ngoại lệ

    void OnDamaged(EnemyDamagedChannel.Payload p)
    {
        if (hitSfx != null) hitSfx.Play();
        if (lastHitLabel != null) lastHitLabel.SetText("-{0}{1}", p.Amount, p.Killed ? 1 : 0);
    }
}
```

**Chạy thử**
- Tạo ba asset (`OnEnemyDamaged`, `AliveEnemies`, một `EnemyData`), kéo vào Inspector của prefab Enemy và của `CombatFeedback`. Gọi `Spawn(...)` rồi `TakeDamage(12, false)`: số damage hiện, âm thanh kêu, và enemy chết thì **tự biến mất về pool**.
- **Phép thử quan trọng nhất**: thêm một listener mới (ví dụ đếm số enemy đã giết cho quest) — bạn viết một file mới và kéo channel vào, **không mở file `Enemy.cs`**. Đó là toàn bộ giá trị của kiến trúc này, và cũng là cách chứng minh nó cho người phỏng vấn.
- Bỏ dòng `OnDisable` gỡ đăng ký trong `CombatFeedback`, Play hai lần liên tiếp trong Editor: lần thứ hai mỗi cú đánh gọi handler **hai lần**. Đây là bug SO event channel kinh điển, và nhìn thấy nó một lần thì nhớ mãi.
- Bỏ `runtimeSet.Remove(this)` trong `OnDisable`: sau vài đợt spawn, `AliveEnemies.Items` đầy tham chiếu tới enemy đã tắt — mọi hệ thống đếm quái bắt đầu sai.
- Viết test EditMode cho `DamageCalculator` — file test **không `using UnityEngine`** dòng nào, chạy trong mili giây. Đó là phần thưởng của việc tách hàm thuần, xem [[unity-testing-ci]].

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao không nên để mọi thứ trong một `GameManager`?**
  → Vì nó thành chỗ ai cũng phải sửa: mọi PR đụng cùng một file nên conflict liên tục, không test được phần nào riêng, và không ai dám xoá code cũ vì không rõ ai đang dùng. Cách chia đúng là **theo trách nhiệm** — SceneFlow, Save, Audio, Score — mỗi cái một service có thể thay thế và test riêng.
- `Junior` **"Composition over inheritance" trong Unity nghĩa là gì?**
  → Thay vì `EnemyFlyingBoss : EnemyFlying : Enemy : Character`, mỗi hành vi là một component nhỏ gắn vào prefab: `Health`, `Mover`, `Shooter`. Enemy mới là một tổ hợp component khác, không phải một lớp con mới. Kế thừa trong Unity còn vướng chỗ MonoBehaviour không tự khởi tạo được, nên cây kế thừa sâu rất khó tái dùng.
- `Junior` **Hai scene additive muốn nói chuyện với nhau thì làm sao?**
  → Không tham chiếu trực tiếp được qua Inspector, nên dùng một **ScriptableObject làm kênh sự kiện**: cả hai scene cùng trỏ tới một asset, một bên `Raise`, bên kia đăng ký nghe. Luật kèm theo là **gỡ đăng ký trong `OnDisable`**, vì trong Editor SO sống xuyên các lần Play và subscriber cũ sẽ còn lại.
- `Mid` **Thiết kế hệ thống inventory — anh bắt đầu từ đâu?**
  → Bắt đầu từ **dữ liệu**: item là ScriptableObject (id, icon, stack tối đa, hiệu ứng), inventory là một class C# thuần giữ danh sách slot — không phải MonoBehaviour, để test được. Rồi tới **sự kiện**: inventory bắn `OnInventoryChanged`, UI nghe và vẽ lại; UI không hỏi inventory mỗi frame. Cuối cùng mới tới lưu: serialize **id + số lượng**, không serialize tham chiếu asset — xem [[unity-save-data]].
- `Mid` **UI đọc thẳng `Player.Instance.hp` mỗi frame có gì sai?**
  → Ba thứ: UI phụ thuộc vào Player nên không test và không tái dùng được; nó cập nhật 60 lần/giây cho một giá trị đổi vài lần mỗi phút; và khi có thêm nguồn máu khác (shield, bot đồng đội) thì phải sửa UI. Cách đúng là Player bắn event khi máu đổi, UI nghe — chỗ nào cần "kéo" thì kéo một lần lúc mở màn hình.
- `Mid` **Năm người làm cùng dự án, làm sao để không giẫm chân nhau?**
  → Chia theo **feature** chứ không theo loại file, mỗi feature một thư mục và một asmdef ([[unity-project-structure]]); giao tiếp giữa feature bằng event chứ không gọi thẳng, nên hai người hiếm khi sửa cùng file. Thêm hai thói quen: nội dung nằm trong **prefab** thay vì trong scene (scene YAML là chỗ conflict tệ nhất), và scene chia additive theo vai trò.
- `Senior` **`GameManager` 1800 dòng, game đang phát hành. Refactor thế nào?**
  → Không viết lại. Liệt kê **trách nhiệm** trong file, tách cái độc lập nhất trước (thường là Audio hoặc Save) thành service, để `GameManager` tạm thời **gọi service** đó — bên ngoài chưa cần đổi gì. Rồi đổi người gọi dần, mỗi PR một nhóm, **mỗi bước đều merge được và game vẫn chạy**. Có test cho phần logic thuần trước khi tách để biết mình không đổi hành vi.
- `Senior` **Event bus toàn cục có gì xấu?**
  → Nó đổi một vấn đề dễ thấy (phụ thuộc trực tiếp) lấy một vấn đề khó thấy hơn: sự kiện "đến từ đâu đó", không truy được ai phát và ai nghe, IDE không giúp được vì mọi thứ đi qua `Publish(object)`. Tôi dùng **kênh có tên và kiểu cụ thể** — `OnPlayerDied` là một asset riêng — để luôn tìm được nơi phát trong hai lần tìm kiếm.
- `Senior` **Khi nào anh cố tình không dùng pattern?**
  → Khi không trả lời được câu *"thay đổi nào trong ba tháng tới rẻ đi nhờ nó"*. Prototype và game jam thì viết thẳng, singleton thoải mái — nó tồn tại để trả lời một câu hỏi rồi bị vứt. Tính năng chỉ có một biến thể thì một `switch` ba nhánh đọc dễ hơn ba ScriptableObject strategy. Pattern là chi phí trả trước, không phải huy hiệu.
- `Senior` **Làm sao biết kiến trúc đang xấu đi?**
  → Bằng dấu hiệu đo được, không bằng cảm giác: file dài nhất đang bao nhiêu dòng và ai phải sửa nó nhiều nhất; số singleton (trên 8 là đáng xem lại); thời gian compile sau một thay đổi nhỏ; số PR conflict ở cùng vài file; và phép thử sắc nhất — **muốn test công thức sát thương có phải nạp cả một scene có Canvas không**.

**Khung trả lời 60 giây** — "Thiết kế hệ thống chiến đấu cho game của chúng tôi đi"

> Tôi bắt đầu bằng ba câu hỏi ngược: game bao nhiêu người làm, sống bao lâu sau phát hành, và **cái gì sắp thay đổi** — vì mức trừu tượng đúng phụ thuộc vào câu thứ ba, không phụ thuộc vào pattern nào đẹp.
>
> Với một game mobile có cập nhật dài, tôi tách bốn lớp. **Dữ liệu** là ScriptableObject: chỉ số vũ khí, skill, enemy — designer chỉnh không cần build. **Logic thuần** là hàm tĩnh: công thức sát thương nhận struct, trả số, test được không cần mở Editor. **Thực thể** là MonoBehaviour mỏng: trừ máu, đổi state, rồi **bắn một event**. Và **mọi thứ phản ứng** — UI, âm thanh, VFX, quest — chỉ đăng ký nghe event đó.
>
> Điểm mấu chốt là chiều mũi tên: enemy không gọi UI, không gọi audio. Nhờ vậy tuần sau thêm "số damage bay lên" là viết một listener mới, không mở lại file enemy. Còn thứ tôi **không** thêm nếu chưa cần: DI container, event bus toàn cục, và ECS — ba thứ này phải chỉ ra được lợi ích đo được ở quy mô cụ thể thì mới đáng.

**Họ sẽ đào tiếp**

- *"Vì sao logic để ở class thuần chứ không ở MonoBehaviour?"* → Để test chạy trong mili giây mà không cần Editor, và để tái dùng cho bot, cho mô phỏng cân bằng, cho server. Dấu hiệu đi đúng: file test không `using UnityEngine` dòng nào.
- *"SO event channel có nhược điểm gì?"* → Khó lần ngược ai đang nghe (phải tìm theo asset), và dễ tạo thói quen "mọi thứ đều là event" khiến luồng khó đọc. Tôi giới hạn nó cho giao tiếp **giữa các hệ thống**, còn trong một hệ thống thì gọi thẳng.
- *"Bao nhiêu singleton là nhiều?"* → Không có con số tuyệt đối, nhưng trên 8 thì thường là dấu hiệu chúng đang được dùng thay cho việc thiết kế quyền sở hữu. Điều quan trọng hơn số lượng là: singleton có bị gọi từ code gameplay rải rác không, hay chỉ được tiêm vào lúc khởi tạo.
- *"Kiến trúc này có làm chậm game không?"* → Event có chi phí, nhưng ở mức vài nghìn lần mỗi giây thì không đáng kể so với những thứ ở [[unity-cpu-optimization]]. Chỗ phải cẩn thận là đừng bắn event **mỗi frame cho mỗi thực thể** — cái đó là lỗi tần suất, không phải lỗi pattern.

**Cờ đỏ**

- Kể tên tám pattern nhưng không có ví dụ nào từ dự án thật.
- Nhét interface và factory cho một tính năng chỉ có một biến thể.
- Đề xuất viết lại toàn bộ khi được hỏi về refactor.
- Không phân biệt "gọi thẳng" và "phát event" theo bối cảnh — chọn một kiểu cho mọi thứ.
- Không nói được cái giá của pattern mình đề xuất.

**Số / ví dụ nên thuộc**

- Chiều phụ thuộc: **Core ← Gameplay ← UI**, và asmdef là thứ thi hành nó.
- Ngưỡng đáng xem lại: **trên 8 singleton**, file trên ~500 dòng, compile lâu sau thay đổi nhỏ.
- Phép thử kiến trúc nhanh nhất: **test công thức sát thương có cần nạp scene không**.
- Câu hỏi trước khi thêm một tầng: *"thay đổi nào trong ba tháng tới rẻ đi nhờ nó?"*
