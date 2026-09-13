---
title: Vật lý trong Unity
icon: 🎱
summary: Rigidbody hay tự viết, FixedUpdate và interpolation, collision matrix, raycast không cấp phát — và vì sao platformer tốt gần như không dùng physics engine.
status: deep
read: 640
level: intermediate
order: 50
tags: [unity, physics, gameplay, feel]
related: [game-feel, combat-systems, unity-game-loop, unity-optimization]
---

Quyết định đầu tiên và quan trọng nhất: **để PhysX/Box2D điều khiển nhân vật, hay tự viết chuyển động và chỉ dùng physics để phát hiện va chạm?** Phần lớn game cảm giác tốt chọn cách hai. Phần lớn prototype chọn cách một rồi mất ba tuần chống lại engine.

## Ba cách điều khiển và khi nào dùng

| Cách | Cảm giác | Dùng khi |
|---|---|---|
| **Dynamic Rigidbody** — `AddForce`, để engine tính | Trôi, có quán tính, khó kiểm soát chính xác | Xe, bóng, vật thể ném, ragdoll, mọi thứ *nên* tuân vật lý |
| **Kinematic Rigidbody + tự tính** — đặt `linearVelocity` hoặc `MovePosition`, engine chỉ báo va chạm | Chính xác từng frame, vẫn tương tác được với dynamic body | Nhân vật hành động, platformer, top-down. **Mặc định nên chọn.** |
| **Tự viết hoàn toàn** — `Raycast`/`Cast` rồi tự dời transform | Kiểm soát tuyệt đối, xác định | Platformer 2D chính xác cao, game có replay/rollback, fighting game |

Nhân vật bằng dynamic rigidbody có ba bệnh kinh điển: trượt trên dốc, bật lên khi va cạnh, và không thể "dừng ngay" khi nhả phím vì ma sát là chuyện của engine. Sửa được, nhưng mỗi lần sửa là một hack chống lại solver. `CharacterController` có sẵn là kinematic dạng đơn giản — dùng được cho 3D nếu không cần tương tác vật lý phức tạp, nhưng nó không có bước lên bậc mượt và không đẩy được dynamic body nếu bạn không tự viết.

## FixedUpdate — nơi vật lý sống

Physics chạy theo bước cố định (`Time.fixedDeltaTime`, mặc định 0.02s = 50Hz), **không đồng bộ với render**. Một frame render có thể chạy 0, 1 hoặc 2 bước physics. Hậu quả:

- Đọc input trong `FixedUpdate` → **mất nhấn**: nút bấm và nhả trong một frame render 16ms có thể rơi giữa hai bước physics 20ms. Đọc input trong `Update`, giữ vào cờ, tiêu thụ trong `FixedUpdate`.
- Đặt velocity trong `Update` → bước physics chạy 2 lần với cùng giá trị hoặc 0 lần → giật.
- Camera follow trong `Update` bám theo rigidbody không bật interpolation → nhân vật rung ở nhịp lệch 60/50Hz.

```csharp
public class KinematicMover2D : MonoBehaviour {
    [SerializeField] float speed = 8f;
    Rigidbody2D rb;
    Vector2 moveInput;
    bool jumpPressed;                       // cờ giữ input giữa các bước

    void Awake() {
        rb = GetComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.interpolation = RigidbodyInterpolation2D.Interpolate;   // bắt buộc nếu camera bám theo
    }

    void Update() {
        moveInput = InputReader.Move;        // đọc mỗi frame render
        if (InputReader.JumpPressedThisFrame) jumpPressed = true;  // giữ, không ghi đè bằng false
    }

    void FixedUpdate() {
        var v = rb.linearVelocity;           // Unity 6; bản 2022 là rb.velocity
        v.x = moveInput.x * speed;
        if (jumpPressed) { v.y = 14f; jumpPressed = false; }        // tiêu thụ cờ
        rb.linearVelocity = v;
    }
}
```

**Interpolation** là cài đặt bị bỏ quên nhiều nhất. Không bật thì mọi thứ dynamic/kinematic nhìn rung nhẹ khi camera bám theo, và người ta đi tối ưu frame rate thay vì bật một checkbox. Bật `Interpolate` cho nhân vật và thứ camera nhìn vào; để `None` cho hàng trăm vật thể nền để tiết kiệm.

Nếu game cần physics mượt hơn ở 120Hz: giảm `Fixed Timestep` xuống 0.01 **và** kiểm tra `Maximum Allowed Timestep` để không rơi vào vòng xoáy chết — frame chậm → nhiều bước physics → frame càng chậm. Khi frame time vượt `Maximum Allowed Timestep`, Unity bỏ bước và game chạy chậm lại (slow motion) thay vì đóng băng.

## Collision matrix là thiết kế, không phải cấu hình

`Project Settings > Physics > Layer Collision Matrix`. Đây là công cụ tối ưu **và** công cụ thiết kế mạnh nhất trong physics, và thường bị để mặc định (mọi layer va chạm với mọi layer).

Bố cục layer đã chứng minh hiệu quả ở game hành động:

```
Player          va với: Ground, Enemy, EnemyHitbox, Pickup, Trigger
PlayerHitbox    va với: Enemy                     (chỉ để phát hiện đánh trúng)
Enemy           va với: Ground, Player, PlayerHitbox
EnemyHitbox     va với: Player
Projectile      va với: Ground, Enemy hoặc Player (tuỳ chủ)
Pickup          va với: Player                    (không va với Ground — dùng trigger, không rơi)
Debris/VFX      va với: Ground                    (KHÔNG với nhau — 200 mảnh vỡ va nhau là cách nhanh nhất giết frame)
```

Ba luật rút ra:
- **Hitbox và hurtbox là layer riêng**, không phải collider trên cùng layer với thân. Nếu không, đòn đánh trúng "thân" thay vì trúng vùng bạn muốn, và bạn không thể có i-frame chỉ bằng tắt một collider.
- **Thứ nhiều (đạn, mảnh vỡ, particle collider) không được va với nhau.** Chi phí va chạm tăng theo bình phương số vật thể trong cùng ô của broadphase.
- Mọi `Raycast`/`OverlapCircle` trong code **luôn truyền LayerMask**. Không truyền là quét mọi layer, kể cả trigger và VFX.

## Raycast — làm đúng để không cấp phát

```csharp
// ❌ cấp phát mảng mới mỗi lần gọi
Collider2D[] hits = Physics2D.OverlapCircleAll(pos, radius, enemyMask);

// ✅ buffer dùng lại — Unity 6 dùng ContactFilter2D + mảng cấp sẵn
static readonly Collider2D[] buf = new Collider2D[32];
static ContactFilter2D enemyFilter = new ContactFilter2D {
    useLayerMask = true, layerMask = enemyMask, useTriggers = false
};

int n = Physics2D.OverlapCircle(pos, radius, enemyFilter, buf);
for (int i = 0; i < n; i++) { /* buf[i] */ }
```

Kích cỡ buffer là quyết định thiết kế: 32 nghĩa là đòn đánh trúng tối đa 32 mục tiêu, cái thứ 33 bị bỏ qua **âm thầm**. Log warning khi `n == buf.Length` để biết mình đang mất.

Với 3D, `Physics.RaycastNonAlloc`, `OverlapSphereNonAlloc` tương tự. `Physics.queriesHitTriggers` mặc định `true` — raycast của bạn trúng trigger vùng nhận pickup và bạn tự hỏi vì sao "đạn nổ giữa không trung".

**Ground check** đúng là `BoxCast`/`CapsuleCast` xuống một đoạn ngắn (0.05–0.1) từ đáy collider, không phải một `Raycast` đơn từ tâm — ray đơn trượt khỏi mép nền và nhân vật "rơi" khi đứng nửa người ngoài rìa. Ba ray (trái/giữa/phải) là lựa chọn rẻ nếu không muốn BoxCast.

## Platformer: vật lý là để cảm giác, không phải để đúng

Platformer hay không dùng gia tốc trọng trường thật. Xem [[game-feel]] cho lý thuyết; phần Unity:

```csharp
[SerializeField] float jumpHeight = 3f, timeToApex = 0.4f, maxFallSpeed = 20f;
float gravity, jumpVelocity;
Vector2 v;

void Awake() {
    gravity = -2f * jumpHeight / (timeToApex * timeToApex);   // suy từ chiều cao và thời gian, không chọn tay
    jumpVelocity = -gravity * timeToApex;
}

void FixedUpdate() {
    float g = gravity;
    if (v.y < 0) g *= 2f;                                   // rơi nhanh hơn bay lên — cảm giác "nặng"
    else if (!InputReader.JumpHeld) g *= 3f;                // nhả nút thì cắt nhảy
    v.y += g * Time.fixedDeltaTime;
    v.y = Mathf.Max(v.y, -maxFallSpeed);                    // kẹp tốc độ rơi, không thì xuyên nền ở fps thấp
    rb.linearVelocity = v;
}
```

Đặt `rb.gravityScale = 0` và tự cộng trọng trường: designer nói "nhảy cao 3 ô, lên đỉnh trong 0.4s" thì số này vào thẳng Inspector, không phải mò `gravityScale` và lực nhảy đến khi trông ổn.

Coyote time (nhảy được 0.1s sau khi rời mép) và jump buffer (nhấn nhảy 0.1s trước khi chạm đất vẫn nhảy) là hai bộ đếm 5 dòng code mỗi cái, và là khác biệt giữa "chặt" và "khó chịu". Cả hai nằm trong `Update`, không phải `FixedUpdate`, vì chúng đo thời gian thật của người chơi.

## Va chạm tốc độ cao và xuyên vật

Đạn nhanh xuyên qua tường mỏng vì ở bước này nó ở bên trái, bước sau đã bên phải. Ba cách theo thứ tự nên thử:
1. **Đạn là raycast**, không phải collider. Mỗi bước physics cast từ vị trí cũ tới vị trí mới. Rẻ nhất, chính xác nhất, chuẩn cho súng.
2. `collisionDetectionMode = Continuous` trên vật thể nhanh. Tốn hơn nhưng vẫn rẻ nếu chỉ vài vật thể. `ContinuousDynamic` chỉ khi cả hai đều chuyển động nhanh.
3. Tăng tần số physics — cách tệ nhất vì phạt toàn bộ game cho vài viên đạn.

Tường mỏng hơn quãng đường vật đi trong một bước (tốc độ × 0.02) sẽ bị xuyên với Discrete. Tính con số này ra khi thiết kế level, đừng đợi QA báo.

## Trigger, OnCollision và những gì thật sự được gọi

- `OnTriggerEnter` yêu cầu **ít nhất một bên có Rigidbody** (kinematic cũng được). Hai collider tĩnh không bao giờ báo gì với nhau — nguồn của 90% câu hỏi "vì sao trigger không chạy".
- Kinematic 2D chỉ nhận va chạm với dynamic, trừ khi bật `useFullKinematicContacts`. Muốn hai kinematic (player và enemy đều kinematic) biết nhau chạm: bật cờ này hoặc dùng overlap thủ công.
- `OnCollisionEnter` được gọi trong bước physics, tức là **trước** `Update` của frame đó. Spawn/Destroy trong callback này an toàn, nhưng đổi `transform` của chính body đang va chạm giữa lúc solver chạy thì cho kết quả khó lường — đặt cờ, xử lý trong `FixedUpdate` kế.
- `Destroy` không xoá ngay. Object bị destroy vẫn có thể nhận thêm một `OnTriggerEnter` trong cùng bước. Dùng cờ `isDead`, đừng trông vào việc object "đã chết".

## Rigidbody và transform — đừng đụng cả hai

Ghi `transform.position` trực tiếp trên object có Rigidbody: engine phải đồng bộ lại, mất interpolation, và có thể teleport xuyên vật. Dời rigidbody bằng `rb.MovePosition` (kinematic) hoặc đặt `rb.position` rồi để bước physics kế xử lý. Đổi scale của collider lúc chạy là cách tốn nhất — engine dựng lại shape. Nếu cần thay đổi kích cỡ hitbox theo animation, bật/tắt nhiều collider con thay vì scale một cái.

Parent một Rigidbody dưới một Rigidbody khác gây hành vi kỳ lạ (con vừa theo cha vừa theo solver). Vật thể "gắn vào" (nhân vật đứng trên thuyền) làm bằng cách cộng vận tốc của nền vào vận tốc nhân vật, không phải parent.

## Bẫy lộ ra khi build

- `Physics.autoSyncTransforms` tắt mặc định từ 2018 — đặt transform rồi raycast **cùng frame** có thể trúng vị trí cũ. Gọi `Physics.SyncTransforms()` nếu bắt buộc, nhưng tốt hơn là không xen kẽ.
- Trên mobile, `Time.fixedDeltaTime = 0.02` với game 30 FPS nghĩa là 1–2 bước physics mỗi frame; nếu frame tụt xuống 20 FPS là 3 bước, mỗi bước tốn thêm. Đo tổng thời gian `FixedUpdate.PhysicsFixedUpdate` trong Profiler, không chỉ tính trung bình.
- `Rigidbody2D.simulated = false` rẻ hơn tắt GameObject khi pool đạn — không phải dựng lại body.
- Mesh Collider lồi (`convex`) giới hạn 255 đỉnh, không lồi thì không va được với mesh collider khác. Vật thể động dùng compound của Box/Capsule, mesh collider chỉ cho địa hình tĩnh.

## Kiểm tra nhanh
- Nhân vật đứng yên trên dốc 30° có trượt không? Có thì bạn đang dùng dynamic mà chưa xử lý ma sát/dốc.
- Bật `Window > Analysis > Physics Debugger`: có collider nào không nên tồn tại (trên VFX, trên UI, trên mesh trang trí) không?
- Profiler cột `Physics.Processing` ở cảnh đông nhất < 2ms?
- Camera bám nhân vật ở 144Hz có rung không? Không rung là interpolation đúng.
- Bắn đạn nhanh nhất vào tường mỏng nhất trong game 20 lần: xuyên bao nhiêu lần?

## 🤖 Prompt cho AI

AI mặc định viết nhân vật bằng dynamic rigidbody + `AddForce`, đọc input trong `FixedUpdate`, không đặt LayerMask, và trộn `velocity`/`linearVelocity`.

**Phải nêu rõ:**
- Cách điều khiển: dynamic / kinematic / tự viết — và lý do gameplay
- 2D hay 3D (API khác hoàn toàn, `Physics2D` vs `Physics`)
- Tham số cảm giác dưới dạng số thiết kế: chiều cao nhảy, thời gian lên đỉnh, coyote time, tốc độ rơi tối đa
- Bảng layer và cái gì va với cái gì
- Tần số physics và FPS mục tiêu trên máy yếu nhất
- Vật thể nhanh nhất trong game và tường mỏng nhất

**Mẫu prompt**

```
Viết controller nhân vật 2D platformer, Unity 6 (dùng rb.linearVelocity, KHÔNG dùng rb.velocity).

Cách điều khiển: Rigidbody2D Kinematic, gravityScale = 0, tự cộng trọng trường trong FixedUpdate.
Input đọc trong Update qua InputReader (đã có), giữ cờ rồi tiêu thụ trong FixedUpdate.

Số thiết kế (expose qua [SerializeField], KHÔNG hardcode):
- jumpHeight 3.0 ô, timeToApex 0.38s → suy ra gravity và jumpVelocity trong Awake
- Rơi nhanh gấp 2, nhả nút giữa chừng gấp 3, maxFallSpeed 20
- coyoteTime 0.1s, jumpBuffer 0.12s (đếm trong Update)
- Ground check: BoxCast xuống 0.06 với LayerMask Ground, KHÔNG dùng OnCollisionEnter

Layer: Player va với Ground, Enemy, Pickup. KHÔNG va với PlayerHitbox, VFX.
Mọi query physics dùng ContactFilter2D + buffer tĩnh, CẤM OverlapCircleAll / mảng mới.
Bật interpolation. Không đụng transform.position trực tiếp.

Sau khi viết, liệt kê mọi magic number còn trong code.
```

**Bẫy thường gặp:** AI cho ground check bằng `OnCollisionEnter/Exit` với bộ đếm — bộ đếm lệch khi hai collider Ground chạm cùng lúc rồi rời khác lúc, nhân vật "bay" vĩnh viễn. Ground check phải là **query mỗi bước** (cast), không phải trạng thái tích luỹ từ sự kiện.

## 💻 Code

Demo dựng một nhân vật platformer 2D bằng Rigidbody2D Kinematic: tự cộng trọng trường, coyote time, jump buffer, ground check bằng BoxCast, mọi query không cấp phát. Thả vào scene có vài BoxCollider2D layer `Ground` là chạy.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 340" role="img" aria-label="Hierarchy có Player với Rigidbody2D, CapsuleCollider2D và PlatformerController2D; Inspector hiện giá trị từng field">
  <rect x="10" y="10" width="200" height="320" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">▾ Level</text>
  <text x="38" y="84" class="fig-muted" font-size="12">Ground_01  (Layer: Ground)</text>
  <text x="38" y="102" class="fig-muted" font-size="12">Ground_02  (Layer: Ground)</text>
  <rect x="16" y="112" width="188" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="22" y="127" class="fig-label" font-size="12" font-weight="600">▸ Player  (Layer: Player)</text>
  <text x="22" y="160" class="fig-muted" font-size="11">Main Camera</text>
  <text x="22" y="200" class="fig-muted" font-size="11">Project Settings ▸ Physics 2D</text>
  <text x="22" y="218" class="fig-muted" font-size="11">Layer Collision Matrix:</text>
  <text x="34" y="236" class="fig-muted" font-size="11">Player ✕ Ground   ✓</text>
  <text x="34" y="254" class="fig-muted" font-size="11">Player ✕ Player   ✗</text>
  <text x="34" y="272" class="fig-muted" font-size="11">Ground ✕ Ground   ✗</text>
  <text x="22" y="306" class="fig-muted" font-size="11">Fixed Timestep: 0.02</text>
  <rect x="226" y="10" width="424" height="320" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector — Player</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Rigidbody 2D</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Body Type</text><text x="440" y="82" class="fig-label" font-size="11">Kinematic</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Interpolate</text><text x="440" y="98" class="fig-label" font-size="11">Interpolate</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Use Full Kinematic Contacts</text><text x="440" y="114" class="fig-label" font-size="11">☐</text>
  <text x="250" y="130" class="fig-muted" font-size="11">Constraints ▸ Freeze Rotation Z</text><text x="440" y="130" class="fig-label" font-size="11">☑</text>
  <rect x="234" y="140" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="153" class="fig-label" font-size="12" font-weight="600">Capsule Collider 2D</text>
  <text x="250" y="172" class="fig-muted" font-size="11">Size</text><text x="440" y="172" class="fig-label" font-size="11">X 0.8   Y 1.8</text>
  <rect x="234" y="182" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="195" class="fig-label" font-size="12" font-weight="600">Platformer Controller 2D (Script)</text>
  <text x="250" y="214" class="fig-muted" font-size="11">Move Speed</text><text x="440" y="214" class="fig-label" font-size="11">8</text>
  <text x="250" y="230" class="fig-muted" font-size="11">Jump Height</text><text x="440" y="230" class="fig-label" font-size="11">3</text>
  <text x="250" y="246" class="fig-muted" font-size="11">Time To Apex</text><text x="440" y="246" class="fig-label" font-size="11">0.38</text>
  <text x="250" y="262" class="fig-muted" font-size="11">Fall Gravity Mult / Cut Mult</text><text x="440" y="262" class="fig-label" font-size="11">2   /   3</text>
  <text x="250" y="278" class="fig-muted" font-size="11">Max Fall Speed</text><text x="440" y="278" class="fig-label" font-size="11">20</text>
  <text x="250" y="294" class="fig-muted" font-size="11">Coyote Time / Jump Buffer</text><text x="440" y="294" class="fig-label" font-size="11">0.1   /   0.12</text>
  <text x="250" y="310" class="fig-muted" font-size="11">Ground Mask</text><text x="440" y="310" class="fig-label" font-size="11">Ground</text>
  <text x="250" y="326" class="fig-muted" font-size="11">Ground Check Distance</text><text x="440" y="326" class="fig-label" font-size="11">0.06</text>
</svg>
<figcaption>Player = Rigidbody2D Kinematic + CapsuleCollider2D + script. Gravity Scale không quan trọng vì script tự cộng trọng trường. Layer Player không va với chính nó.</figcaption>
</figure>

**Script**

```csharp
// PlatformerController2D.cs — Unity 6 (6000.x). Dùng Input System cũ (Keyboard) để demo không phụ thuộc asset;
// trong dự án thật thay hai dòng đọc input bằng InputReader của bạn (xem unity-input).
using UnityEngine;

[RequireComponent(typeof(Rigidbody2D), typeof(CapsuleCollider2D))]
public class PlatformerController2D : MonoBehaviour
{
    [Header("Di chuyển")]
    [SerializeField] float moveSpeed = 8f;

    [Header("Nhảy — số thiết kế, không phải lực")]
    [SerializeField] float jumpHeight = 3f;
    [SerializeField] float timeToApex = 0.38f;
    [SerializeField] float fallGravityMult = 2f;
    [SerializeField] float cutGravityMult = 3f;
    [SerializeField] float maxFallSpeed = 20f;
    [SerializeField] float coyoteTime = 0.1f;
    [SerializeField] float jumpBuffer = 0.12f;

    [Header("Ground check")]
    [SerializeField] LayerMask groundMask;
    [SerializeField] float groundCheckDistance = 0.06f;

    Rigidbody2D rb;
    CapsuleCollider2D col;
    ContactFilter2D groundFilter;
    readonly RaycastHit2D[] groundHits = new RaycastHit2D[4];

    float gravity, jumpVelocity;
    float moveX;
    bool jumpHeld;
    float coyoteTimer, bufferTimer;      // đếm trong Update: đo thời gian thật của người chơi
    bool grounded;
    Vector2 velocity;

    void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        col = GetComponent<CapsuleCollider2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.interpolation = RigidbodyInterpolation2D.Interpolate;
        rb.freezeRotation = true;

        groundFilter = new ContactFilter2D { useLayerMask = true, layerMask = groundMask, useTriggers = false };
        RecomputeJump();
    }

    void OnValidate() => RecomputeJump();

    void RecomputeJump()
    {
        gravity = -2f * jumpHeight / (timeToApex * timeToApex);
        jumpVelocity = -gravity * timeToApex;
    }

    void Update()
    {
        // --- input: đọc mỗi frame render, giữ vào cờ/bộ đếm ---
        var kb = UnityEngine.InputSystem.Keyboard.current;
        moveX = (kb.dKey.isPressed || kb.rightArrowKey.isPressed ? 1f : 0f)
              - (kb.aKey.isPressed || kb.leftArrowKey.isPressed ? 1f : 0f);
        jumpHeld = kb.spaceKey.isPressed;
        if (kb.spaceKey.wasPressedThisFrame) bufferTimer = jumpBuffer;

        // --- bộ đếm cảm giác ---
        coyoteTimer = grounded ? coyoteTime : coyoteTimer - Time.deltaTime;
        bufferTimer -= Time.deltaTime;
    }

    void FixedUpdate()
    {
        grounded = CheckGround();

        velocity.x = moveX * moveSpeed;

        // nhảy khi: có buffer còn hạn VÀ (đang chạm đất hoặc còn coyote)
        if (bufferTimer > 0f && coyoteTimer > 0f)
        {
            velocity.y = jumpVelocity;
            bufferTimer = 0f;
            coyoteTimer = 0f;
        }

        float g = gravity;
        if (velocity.y < 0f) g *= fallGravityMult;
        else if (!jumpHeld) g *= cutGravityMult;

        if (grounded && velocity.y < 0f) velocity.y = 0f;   // đứng trên nền: không tích luỹ vận tốc âm
        else velocity.y += g * Time.fixedDeltaTime;

        velocity.y = Mathf.Max(velocity.y, -maxFallSpeed);
        rb.linearVelocity = velocity;                        // 2022 LTS: rb.velocity
    }

    bool CheckGround()
    {
        // BoxCast từ đáy capsule xuống một đoạn ngắn — ray đơn trượt khỏi mép nền
        Bounds b = col.bounds;
        Vector2 origin = new(b.center.x, b.min.y + 0.02f);
        Vector2 size = new(b.size.x * 0.9f, 0.04f);
        int n = Physics2D.BoxCast(origin, size, 0f, Vector2.down, groundFilter, groundHits, groundCheckDistance);
        if (n == groundHits.Length) Debug.LogWarning("Ground buffer đầy — tăng kích cỡ groundHits");
        return n > 0;
    }

    void OnDrawGizmosSelected()
    {
        if (col == null) col = GetComponent<CapsuleCollider2D>();
        Bounds b = col.bounds;
        Gizmos.color = grounded ? Color.green : Color.red;
        Gizmos.DrawWireCube(new Vector3(b.center.x, b.min.y + 0.02f - groundCheckDistance / 2f, 0f),
                            new Vector3(b.size.x * 0.9f, 0.04f + groundCheckDistance, 0f));
    }
}
```

**Chạy thử**
- Đứng yên trên nền: gizmo dưới chân màu xanh, `rb.linearVelocity.y` đúng 0 (xem Inspector ở chế độ Debug).
- Nhấn Space rồi nhả ngay: nhảy thấp hơn rõ so với giữ Space — nếu bằng nhau thì `cutGravityMult` không có tác dụng (kiểm `jumpHeld`).
- Chạy khỏi mép và nhấn Space trong 0.1s: vẫn nhảy (coyote). Nhấn Space 0.1s trước khi chạm đất: nhảy ngay khi chạm (buffer).
- Đổi `jumpHeight` thành 6 khi đang Play: đỉnh nhảy cao gấp đôi mà `timeToApex` không đổi — chứng minh gravity được suy ra, không chọn tay.
- Profiler ▸ Memory ▸ GC Alloc của script này = 0 B/frame.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao code vật lý phải nằm trong `FixedUpdate`?**
  → Vì physics chạy theo nhịp cố định (mặc định 0,02 s = 50 Hz), độc lập với frame rate. Đặt lực hay vận tốc trong `Update` thì kết quả phụ thuộc máy chạy nhanh hay chậm — cùng một cú nhảy cao khác nhau trên hai máy. Nhưng **đọc input vẫn ở `Update`**, rồi dùng ở `FixedUpdate`, nếu không sẽ mất frame bấm.
- `Junior` **`OnTriggerEnter` không được gọi — kiểm tra những gì?**
  → Ba thứ theo thứ tự. **Phải có ít nhất một bên mang Rigidbody** — hai static collider không sinh sự kiện nào. Layer phải bật trong collision matrix. Và một bên phải `Is Trigger`. Nhớ thêm: va chạm *không* trigger cần ít nhất một bên là dynamic; hai kinematic chỉ sinh trigger.
- `Junior` **Vì sao không dùng `transform.position` để dời một Rigidbody?**
  → Vì nó dời object mà không qua solver: bỏ qua va chạm ở bước đó, làm hỏng vận tốc tích luỹ, và ép đồng bộ lại transform. Dùng `MovePosition`/`MoveRotation` cho kinematic, lực hoặc vận tốc cho dynamic. Đụng cả hai đường là nguồn của những bug "thỉnh thoảng lọt sàn" không tái hiện được.
- `Mid` **Viên đạn bay nhanh xuyên qua tường. Nguyên nhân và cách sửa?**
  → Tunneling: vật đi xa hơn bề dày collider trong một bước 0,02 s nên bước sau đã ở bên kia tường. Chữa theo thứ tự rẻ → đắt: `Collision Detection = Continuous` (hoặc `Continuous Speculative` cho vật nhỏ), làm collider dày hơn, hạ `Fixed Timestep`. Với đạn thì cách đúng là **đừng dùng rigidbody** — `SphereCast` từ vị trí cũ tới vị trí mới mỗi bước.
- `Mid` **Ground check của anh viết thế nào? Vì sao không dùng `OnCollisionEnter/Exit`?**
  → `BoxCast` hoặc `CapsuleCast` xuống 0,05–0,1 từ đáy collider, **query mỗi bước**, không phải trạng thái tích luỹ từ event. Ray đơn từ tâm trượt khỏi mép nền, nhân vật "rơi" khi đứng nửa người ngoài rìa. Bộ đếm Enter/Exit thì lệch khi hai collider nền chạm cùng lúc và rời khác lúc — nhân vật bay vĩnh viễn, và bug chỉ xuất hiện ở chỗ ghép hai sàn.
- `Mid` **Vì sao nhân vật rung nhẹ dù frame rate ổn định?**
  → Thiếu **Interpolate**. Physics chạy 50 Hz còn màn hình 60–120 Hz, không nội suy thì vị trí hiển thị nhảy bậc. Đây là một checkbox trên Rigidbody, nhưng triệu chứng lại giống hệt vấn đề hiệu năng — nên rất nhiều người đi tối ưu frame rate trong khi lỗi nằm ở đó.
- `Senior` **Di chuyển nhân vật: `CharacterController`, Rigidbody kinematic, hay tự cast? Chọn thế nào?**
  → Mặc định tôi chọn **Kinematic Rigidbody và tự tính vận tốc**, vì lý do cảm giác: nhân vật hành động cần dừng ngay khi nhả phím và đạt tốc tối đa trong vài frame, còn dynamic body có quán tính nên luôn trôi. Dynamic để dành cho thứ *nên* tuân vật lý: xe, bóng, thùng, ragdoll. Tự cast hoàn toàn chỉ khi cần xác định tuyệt đối — platformer pixel-perfect, replay, rollback netcode.
- `Senior` **Physics ăn 8 ms/frame trên mobile với 200 object. Thứ tự anh xử lý?**
  → Đo trước: `Physics.Processing` và số bước `FixedUpdate` mỗi frame. Rồi theo thứ tự hiệu quả: **collision matrix** (rẻ nhất, bỏ hàng nghìn cặp broadphase), primitive collider thay mesh collider, `NonAlloc` cho query, hạ solver iteration cho vật không cần chính xác, cho vật đứng yên **sleep**, và cuối cùng mới nới `Fixed Timestep` từ 0,02 lên 0,03 — nhớ chỉnh `maximumDeltaTime` theo.
- `Senior` **Khi nào "sai vật lý" thật ra là "đúng thiết kế"?**
  → Platformer hay cần gravity khác nhau lúc lên và lúc xuống, coyote time, jump buffer, và vận tốc bị cắt khi nhả nút nhảy. Không cái nào đúng vật lý cả, nhưng cả bốn đều làm nhân vật **cảm giác** đúng. Lẫn hai chuyện này là lý do có người đi sửa mass và drag hàng tuần cho một vấn đề thuộc về thiết kế.

**Khung trả lời 60 giây** — "Anh điều khiển nhân vật bằng cách nào?"

> Mặc định tôi chọn **Kinematic Rigidbody và tự tính vận tốc**: đặt `linearVelocity` hoặc `MovePosition` trong `FixedUpdate`, engine chỉ lo phát hiện va chạm. Lý do là cảm giác: nhân vật hành động cần dừng ngay khi nhả phím và đạt tốc tối đa trong vài frame, còn dynamic body có quán tính nên luôn trôi — bạn sẽ đi chống lại engine bằng drag và mass. Dynamic tôi để dành cho thứ *nên* tuân vật lý: xe, bóng, thùng, ragdoll.
>
> Tự cast hoàn toàn thì chỉ khi cần xác định tuyệt đối — platformer 2D pixel-perfect, game có replay hoặc rollback netcode. Và dù chọn cách nào cũng phải bật **Interpolate** cho nhân vật: physics chạy 50Hz còn màn hình 60–120Hz, không nội suy thì hình rung nhẹ và người ta đi tối ưu frame rate trong khi vấn đề là một checkbox.

**Họ sẽ đào tiếp**

- *"Vì sao không `transform.position` cho rigidbody?"* → Nó dời object mà không qua solver: bỏ qua va chạm ở bước đó, làm hỏng vận tốc tích luỹ và ép đồng bộ lại transform. Dùng `MovePosition`/`MoveRotation` (kinematic) hoặc lực/vận tốc (dynamic). Đụng cả hai đường là nguồn của những bug "thỉnh thoảng lọt sàn".
- *"`OnTriggerEnter` im lặng thì sao?"* → Ba thứ theo thứ tự: **phải có ít nhất một bên mang Rigidbody** (hai static collider không sinh sự kiện), layer phải bật trong collision matrix, và một bên phải `Is Trigger`. Nhớ thêm: va chạm *không* trigger cần ít nhất một bên là dynamic — hai kinematic chỉ sinh trigger.
- *"Tunneling?"* → Vật đi xa hơn bề dày collider trong một bước 0.02s thì bước sau đã ở bên kia tường. Chữa theo thứ tự rẻ→đắt: `Collision Detection = Continuous` (hoặc `Continuous Speculative` cho vật nhỏ), làm collider dày hơn, hạ `Fixed Timestep`, và với đạn thì **đừng dùng rigidbody** — `SphereCast` từ vị trí cũ tới vị trí mới mỗi bước.
- *"Ground check?"* → `BoxCast`/`CapsuleCast` xuống 0.05–0.1 từ đáy collider, **query mỗi bước**, không phải trạng thái tích luỹ từ event. Ray đơn từ tâm trượt khỏi mép nền và nhân vật "rơi" khi đứng nửa người ngoài rìa. Bộ đếm `OnCollisionEnter/Exit` lệch khi hai collider nền chạm cùng lúc và rời khác lúc — nhân vật bay vĩnh viễn, và bug đó chỉ xuất hiện ở chỗ ghép hai sàn.
- *"Tối ưu physics?"* → Đo trước: `Physics.Processing` và số bước `FixedUpdate` mỗi frame. Rồi: **collision matrix** (rẻ nhất, bỏ hàng nghìn cặp broadphase), primitive collider thay mesh collider, `NonAlloc` cho query, hạ solver iteration cho vật không cần chính xác, để vật đứng yên **sleep**, và cuối cùng mới nới `Fixed Timestep` từ 0.02 lên 0.03 (nhớ chỉnh `maximumDeltaTime` theo).

**Cờ đỏ**

- Đọc input trong `FixedUpdate` (mất frame bấm) — đọc ở `Update`, dùng ở `FixedUpdate`.
- `Physics.RaycastAll` mỗi frame (cấp phát mảng), hoặc raycast mà không truyền `layerMask`.
- Dùng `MeshCollider` không convex cho vật di chuyển.
- Chỉnh `Fixed Timestep` xuống 0.005 "cho mượt" mà không nói tới chi phí CPU gấp 4.
- Không phân biệt được "vật lý đúng" và "cảm giác đúng": platformer hay cần gravity khác lúc lên/xuống, coyote time, jump buffer — đó là thiết kế, không phải sai vật lý.

**Số / ví dụ nên thuộc**

- `Fixed Timestep` mặc định 0.02s = 50Hz; `maximumDeltaTime` 0.333s chặn spiral of death.
- Ground check cast 0.05–0.1 đơn vị.
- Thứ tự chữa tunneling: Continuous → collider dày hơn → hạ timestep → bỏ rigidbody và tự cast.
