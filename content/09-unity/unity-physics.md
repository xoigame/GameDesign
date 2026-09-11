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
