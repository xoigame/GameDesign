---
title: Finite State Machine
icon: 🔄
summary: Máy trạng thái hữu hạn — kiến trúc AI đơn giản nhất, đủ dùng cho phần lớn kẻ địch nhỏ, và giới hạn của nó.
status: deep
read: 430
level: intermediate
order: 10
tags: [ai, pattern, fundamentals]
related: [behavior-tree, combat-systems, perception]
---

FSM là kiến trúc AI đơn giản nhất: NPC luôn ở **đúng một trạng thái**, và chuyển sang trạng thái khác khi điều kiện thoả mãn.

```
      thấy người chơi          trong tầm đánh
IDLE ──────────────────> CHASE ──────────────> ATTACK
  ^                        │                      │
  │   mất dấu 3s           │      ra khỏi tầm     │
  └────────────────────────┴──────────────────────┘
```

## Cài đặt tối thiểu

```csharp
public abstract class State {
    public virtual void Enter(Agent a) { }
    public abstract State Update(Agent a, float dt);   // trả về state kế tiếp, hoặc this
    public virtual void Exit(Agent a) { }
}

public class ChaseState : State {
    public override void Enter(Agent a) => a.anim.Play("run");

    public override State Update(Agent a, float dt) {
        if (!a.CanSeePlayer() && a.timeSinceSeen > 3f) return new IdleState();
        if (a.DistanceToPlayer() < a.attackRange)      return new AttackState();
        a.MoveTowards(a.player.position, dt);
        return this;
    }
}
```

Ba phương thức `Enter`/`Update`/`Exit` là toàn bộ cấu trúc. `Enter` để bật animation và khởi tạo; `Exit` để dọn dẹp (quan trọng — quên dọn là nguồn bug phổ biến nhất của FSM).

## Vì sao FSM vẫn đáng dùng

- **Dễ gỡ lỗi** — in ra tên trạng thái hiện tại là biết ngay AI đang nghĩ gì. Không kiến trúc nào khác dễ chẩn đoán bằng.
- **Tất định** — cùng đầu vào cho cùng hành vi. Tái hiện bug dễ.
- **Rẻ** — vài chục dòng, không phụ thuộc thư viện.
- **Đủ dùng** — phần lớn kẻ địch nhỏ trong game 2D/indie chỉ cần 3–5 trạng thái.

Đừng bỏ qua FSM vì nó "đơn giản". Rất nhiều game thương mại dùng FSM cho kẻ địch thường và chỉ dùng [[behavior-tree]] cho boss.

## Giới hạn: bùng nổ chuyển tiếp

Vấn đề chí mạng là số cạnh tăng theo **bình phương** số trạng thái. 5 trạng thái → tối đa 20 chuyển tiếp, còn quản được. 12 trạng thái → 132 chuyển tiếp, không ai bảo trì nổi.

Triệu chứng cho thấy bạn đã vượt giới hạn của FSM:
- Thêm một trạng thái mới phải sửa 6 trạng thái cũ.
- Xuất hiện cờ kiểu `wasAttackingBeforeStun` để nhớ nên quay về đâu.
- Cùng một logic (ví dụ "kiểm tra máu thấp") lặp lại ở nhiều trạng thái.

Khi thấy các dấu hiệu trên → chuyển sang [[behavior-tree]].

## Hierarchical FSM — bước đệm

Trước khi bỏ hẳn FSM, có thể nhóm trạng thái thành cụm:

```
COMBAT (siêu trạng thái)
  ├── Approach
  ├── Strafe
  └── Attack
FLEE (siêu trạng thái)
  ├── FindCover
  └── Heal
```

Chuyển tiếp "máu < 20% → FLEE" chỉ cần khai báo **một lần ở cấp cha** thay vì ở từng trạng thái con. Cách này kéo dài tuổi thọ của FSM thêm đáng kể và là bước chuyển tự nhiên sang Behavior Tree.

## 🤖 Prompt cho AI

Đây là việc agent làm rất tốt, vì cấu trúc rõ ràng và kiểm tra được. Prompt hiệu quả cần **bảng chuyển tiếp đầy đủ**, không chỉ mô tả bằng lời:

```
Viết FSM cho kẻ địch "Cung thủ" trong Unity C#.

Trạng thái: Patrol, Alert, Aim, Shoot, Reposition, Flee

Bảng chuyển tiếp:
  Patrol     -> Alert       khi CanSeePlayer()
  Alert      -> Aim         sau 0.4s (thời gian phản ứng)
  Aim        -> Shoot       sau 0.8s (telegraph)
  Shoot      -> Reposition  luôn luôn, sau khi bắn
  Reposition -> Aim         khi đã tới vị trí mới và còn thấy player
  Reposition -> Patrol      khi mất dấu > 4s
  BẤT KỲ    -> Flee        khi hp < 25%

Ràng buộc:
- Mỗi state là một class riêng, kế thừa State
- Enter/Update/Exit; Exit phải huỷ mọi coroutine đã bật
- Không gọi GetComponent trong Update
- Mọi hằng số thời gian đưa vào một ScriptableObject config
```

Dòng `BẤT KỲ -> Flee` là chỗ nên cân nhắc chuyển thẳng sang Hierarchical FSM — nếu bạn có hơn hai luật kiểu "từ bất kỳ đâu", FSM phẳng đã hết đất dùng.

## 🎮 Unity

FSM là thứ nên tự viết bằng C# thuần, **không** dùng Animator làm state machine gameplay.

**Component & nơi đặt**
- `EnemyBrain.cs` — MonoBehaviour trên prefab kẻ địch, giữ state hiện tại
- `States/` — mỗi state một file C# thuần (không kế thừa MonoBehaviour)
- `EnemyConfig` (ScriptableObject) — mọi hằng số thời gian và khoảng cách

**Code**

```csharp
public abstract class State {
    public virtual void Enter(EnemyBrain a) { }
    public abstract State Update(EnemyBrain a, float dt);
    public virtual void Exit(EnemyBrain a) { }
}

public class ChaseState : State {
    public override void Enter(EnemyBrain a) => a.Anim.CrossFade("Run", 0.1f);

    public override State Update(EnemyBrain a, float dt) {
        if (a.Hp01 < a.Cfg.fleeEnter)                 return new FleeState();
        if (!a.Sees && a.TimeSinceSeen > a.Cfg.forget) return new PatrolState();
        if (a.DistanceToPlayer < a.Cfg.attackRange)   return new AttackState();
        a.MoveTowards(a.LastKnownPos, dt);
        return this;
    }

    public override void Exit(EnemyBrain a) => a.StopAllCoroutines();  // dọn dẹp!
}
```

```csharp
public class EnemyBrain : MonoBehaviour {
    [SerializeField] EnemyConfig cfg;
    public EnemyConfig Cfg => cfg;
    public Animator Anim { get; private set; }

    State state;
    float tickTimer;

    void Awake() {
        Anim = GetComponent<Animator>();      // cache, không gọi trong Update
        state = new PatrolState();
        state.Enter(this);
        // lệch pha giữa các NPC để không tick dồn vào cùng frame
        tickTimer = Random.Range(0f, 1f / cfg.tickHz);
    }

    void Update() {
        tickTimer -= Time.deltaTime;
        if (tickTimer > 0f) return;
        float dt = 1f / cfg.tickHz;
        tickTimer += dt;

        var next = state.Update(this, dt);
        if (next != state) {
            state.Exit(this);
            state = next;
            state.Enter(this);
        }
    }

#if UNITY_EDITOR
    void OnDrawGizmosSelected() {
        UnityEditor.Handles.Label(transform.position + Vector3.up * 2f,
                                  state?.GetType().Name ?? "-");
    }
#endif
}
```

**Ba điểm Unity cụ thể**

1. **Đừng dùng Animator Controller làm FSM gameplay.** Animator state machine khó debug, khó test, và trộn lẫn chuyện hiển thị với luật chơi. Animator chỉ nên nhận lệnh từ FSM của bạn.
2. **Tick 8–10 Hz là đủ**, không cần mỗi frame. Với 30 NPC, đây là khác biệt lớn về CPU. Nhớ lệch pha khởi tạo, nếu không cả 30 con cùng tick một frame và gây spike.
3. **`Exit()` phải dọn coroutine.** Đây là nguồn bug số một của FSM trong Unity: chuyển state mà coroutine cũ vẫn chạy.

**Gizmo debug — làm ngay từ đầu**

In tên state lên đầu NPC bằng `Handles.Label` trong `OnDrawGizmosSelected`. Ba dòng code, và nó là lý do FSM dễ gỡ lỗi hơn mọi kiến trúc khác. Xem [[behavior-tree]] khi FSM vượt ~6 state.

**Kiểm tra nhanh**
- Chọn một NPC trong Scene view — có thấy tên state đang chạy không?
- Đổi `tickHz` từ 10 xuống 2 — hành vi vẫn đúng, chỉ chậm hơn?
- Profiler với 30 NPC: AI không được vượt 1ms/frame.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **FSM là gì? Ba phương thức của một trạng thái dùng để làm gì?**
  → NPC luôn ở **đúng một trạng thái** và chuyển sang trạng thái khác khi điều kiện thoả mãn. Ba phương thức: `Enter` bật animation và khởi tạo, `Update` chạy logic mỗi tick, `Exit` dọn dẹp. `Exit` là chỗ quan trọng nhất — quên dọn ở đó là nguồn bug phổ biến nhất của FSM.
- `Junior` **Vì sao FSM vẫn đáng dùng dù nó "đơn giản"?**
  → Bốn lý do thực tế: **dễ gỡ lỗi** — in tên trạng thái là biết ngay AI đang nghĩ gì, không kiến trúc nào dễ chẩn đoán bằng; **tất định** nên tái hiện bug dễ; **rẻ**, vài chục dòng không cần thư viện; và **đủ dùng** — phần lớn kẻ địch nhỏ chỉ cần 3–5 trạng thái. Nhiều game thương mại dùng FSM cho địch thường, BT cho boss.
- `Junior` **Số chuyển tiếp tăng theo quy luật nào khi thêm trạng thái?**
  → Theo **bình phương** số trạng thái. 5 trạng thái là tối đa 20 chuyển tiếp, còn quản được; 12 trạng thái là 132 chuyển tiếp, không ai bảo trì nổi. Đây là lý do FSM không phải lựa chọn tệ mà là lựa chọn **có ngưỡng** — biết ngưỡng ở đâu quan trọng hơn biết kiến trúc nào "tốt hơn".
- `Mid` **Ba dấu hiệu cho thấy đã vượt giới hạn của FSM?**
  → Thêm một trạng thái mới phải sửa sáu trạng thái cũ. Xuất hiện cờ kiểu `wasAttackingBeforeStun` để nhớ nên quay về đâu. Và cùng một logic — "kiểm tra máu thấp" — lặp lại ở nhiều trạng thái. Thấy đủ ba thì chuyển sang behavior tree; thấy một thì cân nhắc hierarchical FSM trước.
- `Mid` **Hierarchical FSM giải quyết được gì?**
  → Nó nhóm các trạng thái thành cụm có trạng thái cha, nên điều kiện chung — ví dụ "máu thấp thì chạy" — viết **một lần ở cha** thay vì lặp ở mọi con. Nó là bước đệm rẻ: giữ được ưu điểm dễ gỡ lỗi của FSM mà giảm bớt phần bùng nổ chuyển tiếp, và không phải viết lại toàn bộ AI.
- `Mid` **Quên dọn trong `Exit` gây ra lỗi kiểu gì?**
  → Loại lỗi **rò rỉ trạng thái** giữa các trạng thái: animation còn chạy, coroutine còn sống, NavMeshAgent còn đường đi cũ, hoặc một cờ `isInvulnerable` không bao giờ tắt. Triệu chứng điển hình là bug chỉ xuất hiện sau một chuỗi chuyển tiếp nhất định, nên rất khó tái hiện — và đó cũng là lý do `Exit` phải đối xứng với `Enter`.
- `Senior` **Anh chọn FSM hay behavior tree cho một dự án mới thế nào?**
  → Theo **số hành vi dự kiến và mức độ chúng chia sẻ điều kiện**. Dưới năm trạng thái, ít điều kiện chung: FSM, vì nó rẻ và dễ chẩn đoán. Nhiều hành vi có ưu tiên cạnh tranh nhau: BT, vì ưu tiên nằm ở cấu trúc. Và tôi không ngại dùng cả hai trong một game — địch thường FSM, boss BT là cấu hình rất phổ biến.
- `Senior` **Chuyển một FSM đã lớn sang BT — anh làm thế nào để không phải viết lại tất cả?**
  → Giữ nguyên phần **hành động** (các `Enter/Update/Exit` đã có) và chỉ thay phần **quyết định**: bọc mỗi trạng thái thành một node Action, rồi dựng cây ưu tiên trên đó. Chuyển từng nhánh một, để hai hệ thống cùng sống trong giai đoạn chuyển. Cái tốn thời gian thật là bóc các cờ "nhớ trạng thái trước" ra khỏi hành động.
- `Senior` **AI kẹt trong một trạng thái không thoát ra được. Anh chẩn đoán từ đâu?**
  → In **tên trạng thái và thời gian đã ở trong đó** — FSM mạnh đúng ở chỗ này. Rồi kiểm tra ba khả năng: điều kiện thoát không bao giờ đúng (thường do một giá trị perception đã cũ), `Exit` của trạng thái trước không dọn nên điều kiện bị khoá, hoặc hai chuyển tiếp đối nghịch nhau khiến nó nhảy qua lại mà nhìn như đứng yên. Thêm một **thời gian trần** cho mỗi trạng thái là lưới an toàn rẻ.

**Khung trả lời 60 giây** — "Khi nào FSM đủ, và khi nào phải bỏ nó?"

> FSM đủ khi NPC có **3–5 trạng thái** và các trạng thái ít chia sẻ điều kiện với nhau. Nó rẻ, tất định, và dễ chẩn đoán hơn mọi kiến trúc khác — in tên trạng thái ra là biết ngay AI đang nghĩ gì, thứ mà behavior tree không cho mình miễn phí.
>
> Giới hạn của nó là **số chuyển tiếp tăng theo bình phương số trạng thái**: 5 trạng thái là 20 cạnh, 12 trạng thái là 132 cạnh. Nên tôi không đợi tới lúc đếm cạnh mà nhìn ba triệu chứng: thêm một trạng thái phải sửa sáu cái cũ, xuất hiện cờ kiểu `wasAttackingBeforeStun`, và cùng một điều kiện lặp lại ở nhiều nơi.
>
> Thấy các dấu hiệu đó thì bước đệm rẻ là **hierarchical FSM** — nhóm trạng thái lại, điều kiện chung viết một lần ở cha. Nếu vẫn không đủ thì chuyển sang behavior tree, và chuyển dần: giữ nguyên phần hành động, chỉ thay phần quyết định.

**Họ sẽ đào tiếp**

- *"Vì sao `Exit` lại là nguồn bug phổ biến nhất?"* → Vì `Enter` luôn được viết (ai cũng nhớ bật animation) còn `Exit` thì hay bị bỏ trống. Hệ quả là trạng thái rò rỉ sang nhau: coroutine còn sống, cờ bất tử không tắt, đường đi cũ còn nguyên. Luật của tôi là `Exit` phải **đối xứng** với `Enter` — bật gì ở đây thì tắt đúng cái đó ở kia.
- *"FSM có test được không?"* → Rất dễ, và đó là ưu điểm ít người khai thác: trạng thái là logic thuần, nên đưa một đầu vào giả rồi khẳng định trạng thái kế tiếp là xong — chạy trong EditMode, không cần scene. Điều kiện là đừng để trạng thái gọi thẳng API engine; tách phần đó ra ngoài.
- *"Nhiều NPC cùng FSM có tốn không?"* → Không đáng kể nếu không tick mỗi frame. Cùng luật với BT: **5–10 lần/giây** là đủ, và trải đều tick giữa các agent. Phần tốn thật thường là perception (raycast) chứ không phải bản thân máy trạng thái.
- *"Dùng AI để viết FSM thì giao gì?"* → Giao phần khung và phần lặp: sinh các lớp trạng thái, bảng chuyển tiếp, và **soát tìm trạng thái không có đường ra** hoặc cặp chuyển tiếp đối nghịch. Việc duyệt đồ thị đó máy làm đúng và nhanh, còn quyết định NPC *nên* làm gì thì vẫn là thiết kế.

**Cờ đỏ**

- `Exit` để trống ở mọi trạng thái.
- Dùng cờ ngoài để nhớ "trước đó tôi đang làm gì".
- Nói FSM lỗi thời mà không nói được ngưỡng nó vỡ ở đâu.
- Một trạng thái không có điều kiện thoát và không có thời gian trần.
- Trộn logic quyết định với code gọi API engine, nên không test được.

**Số / ví dụ nên thuộc**

- Ba phương thức: **`Enter` / `Update` / `Exit`**; `Exit` đối xứng với `Enter`.
- Số chuyển tiếp tăng theo **bình phương**: 5 trạng thái → 20 cạnh · 12 → **132 cạnh**.
- Ngưỡng thực dụng: **3–5 trạng thái** thì FSM đủ.
- Ba triệu chứng vượt giới hạn: sửa 6 trạng thái cũ · cờ `wasXBeforeY` · điều kiện lặp lại.
- Tick **5–10 lần/giây**, trải đều giữa các agent.
