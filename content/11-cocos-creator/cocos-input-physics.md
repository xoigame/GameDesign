---
id: cocos-input-physics
title: Input & vật lý 2D
icon: 🎱
summary: Chạm ở node hay ở global, đổi toạ độ màn hình sang node, vật lý 2D với group/sensor, và khi nào đừng dùng engine vật lý.
status: deep
read: 840
level: intermediate
order: 40
tags: [cocos, input, touch, physics, collision]
related: [cocos-creator, cocos-scene-component, cocos-demo-shooter, unity-physics]
---

Hai thứ này đi chung một node vì chúng dính nhau ở đúng một điểm: **toạ độ**. Phần lớn bug "bấm không ăn" và "va chạm không nổ" đều là bug đổi hệ toạ độ, không phải bug logic.

## Hai đường nhận chạm

| Cách | Bắt được gì | Dùng khi |
|---|---|---|
| `node.on(Node.EventType.TOUCH_START, cb, this)` | Chỉ chạm **trúng node đó** | Nút bấm, thẻ bài, nhân vật kéo được |
| `input.on(Input.EventType.TOUCH_START, cb, this)` | **Mọi** chạm trên màn hình | Bắn khi chạm bất kỳ đâu, joystick ảo, cử chỉ toàn màn |

Điều kiện để đường thứ nhất chạy: node **phải có `UITransform` với `contentSize` khác 0**. Không có thì không có lỗi nào in ra, chỉ là chạm không ăn. Đây là câu trả lời cho 90% câu hỏi "sao nút của em bấm không được".

Sự kiện **nổi từ con lên cha**. Thẻ bài nằm trong danh sách cuộn thì cả hai cùng nhận — muốn chặn thì:

```ts
onTouchStart(e: EventTouch) {
    e.propagationStopped = true;   // cha không nhận nữa
}
```

Popup phải chặn mọi thứ phía sau: gắn component **`BlockInputEvents`** vào node nền của popup. Không có nó thì người chơi bấm xuyên qua lớp mờ và trúng nút ở màn hình dưới — lỗi này hay lọt tới bản phát hành vì trên máy dev ít khi bấm trúng.

## Đổi toạ độ: chỗ sai nhiều nhất

Toạ độ trong sự kiện chạm là **toạ độ UI của màn hình**, còn node sống trong hệ toạ độ của cha nó. Đổi bằng `UITransform`:

```ts
import { EventTouch, UITransform, Vec3 } from 'cc';

private readonly tmp = new Vec3();

onTouchMove(e: EventTouch) {
    const p = e.getUILocation();                       // Vec2, gốc ở giữa màn hình
    this.tmp.set(p.x, p.y, 0);
    const local = this.node.parent!
        .getComponent(UITransform)!
        .convertToNodeSpaceAR(this.tmp);               // -> toạ độ trong lòng cha
    this.node.setPosition(local);
}
```

Ba hàm hay nhầm nhau:

- `e.getLocation()` — toạ độ theo **pixel màn hình**, gốc ở góc dưới trái. Hiếm khi là thứ bạn muốn.
- `e.getUILocation()` — toạ độ **hệ UI**, đã tính design resolution. Gần như luôn dùng cái này.
- `e.getDelta()` — độ dịch từ frame trước, tiện cho kéo thả mà không cần đổi hệ.

## Vật lý 2D: bật đúng ba thứ

```ts
import { PhysicsSystem2D, ERigidBody2DType, Vec2 } from 'cc';

PhysicsSystem2D.instance.enable = true;
PhysicsSystem2D.instance.gravity = new Vec2(0, -640);   // px/s², KHÔNG phải mét
PhysicsSystem2D.instance.fixedTimeStep = 1 / 60;
```

Ba loại `RigidBody2D`, chọn sai là tốn vô ích:

| Type | Ai điều khiển | Dùng cho |
|---|---|---|
| `Static` | Không di chuyển | Tường, sàn, vùng chết |
| `Dynamic` | Engine vật lý | Vật rơi, nảy, bị đẩy |
| `Kinematic` | **Code của bạn** | Nền di động, boss đi theo đường vạch sẵn |

Nhân vật platformer thường **không** nên là `Dynamic`: ma sát và độ nảy của engine cho ra cảm giác trơn trượt, khó chỉnh. Dùng `Kinematic` rồi tự tính vận tốc, dùng raycast để bám đất — cùng một bài học như [[unity-physics]].

**Collision matrix** (Project Settings → Physics) quyết định nhóm nào đụng nhóm nào. Khai `player`, `enemy`, `bullet-player`, `bullet-enemy`, `pickup` rồi tắt hết những ô không cần: đạn của người chơi **không** kiểm tra với người chơi, đạn không kiểm tra với đạn. Một game bắn súng có 200 viên đạn mà để mọi nhóm đụng nhau là tự nhân số phép kiểm tra lên nhiều lần.

`sensor = true` cho collider chỉ cần **biết là đã chạm** mà không cần bị đẩy: vùng nhặt vật phẩm, vùng kích hoạt, hitbox đạn.

```ts
import { Collider2D, Contact2DType, IPhysics2DContact } from 'cc';

onEnable() {
    const c = this.getComponent(Collider2D)!;
    c.on(Contact2DType.BEGIN_CONTACT, this.onBegin, this);
}
onDisable() {
    const c = this.getComponent(Collider2D)!;
    c.off(Contact2DType.BEGIN_CONTACT, this.onBegin, this);
}
private onBegin(self: Collider2D, other: Collider2D, _c: IPhysics2DContact | null) {
    // KHÔNG destroy ở đây: đang trong lúc engine giải va chạm.
    // Đánh dấu rồi xử lý ở update kế tiếp.
    this.pendingHit = other.node;
}
```

**Đừng huỷ node bên trong callback va chạm.** Đang ở giữa bước giải vật lý, huỷ node ở đó cho ra hành vi khó đoán. Đánh dấu, xử lý ở `update` kế tiếp — đây cũng là lý do `destroy()` dồn tới cuối frame là một điều may.

## Khi nào **đừng** dùng engine vật lý

Với game casual 2D, engine vật lý thường là lựa chọn đắt và khó chỉnh. Bảng quyết định:

| Tình huống | Dùng gì |
|---|---|
| Đạn thẳng vs enemy hình tròn | **Tự kiểm tra khoảng cách**. Rẻ hơn nhiều lần |
| Nhặt vật phẩm khi lại gần | Tự kiểm tra khoảng cách |
| Bắn tia / ngắm | `raycast` |
| Vật rơi, đổ, nảy, chồng lên nhau | Engine vật lý — tự viết sẽ tốn hơn |
| Platformer có dốc, nền di động | Kinematic + raycast, không Dynamic |

Kiểm tra khoảng cách bình phương cho 200 viên đạn × 30 enemy là 6.000 phép nhân mỗi frame — không đáng kể. Còn bật `PhysicsSystem2D` cho từng ấy body là một câu chuyện khác, nhất là trên máy yếu.

```ts
// Rẻ và đủ dùng: so bình phương khoảng cách, không gọi Math.sqrt
const dx = a.x - b.x, dy = a.y - b.y;
if (dx * dx + dy * dy <= r * r) { /* trúng */ }
```

## 🤖 Prompt cho AI

**Dùng AI thế nào cho input và va chạm**

Đây là mảng AI viết ra code **chạy được nhưng sai cảm giác**: nó xử lý chạm ở global khi lẽ ra phải ở node, quên `UITransform`, và mặc định bật engine vật lý cho mọi thứ vì tài liệu mẫu nào cũng làm vậy.

| Giao cho AI | Bạn quyết |
|---|---|
| Chuyển đổi toạ độ, joystick ảo, xử lý đa chạm | Dùng engine vật lý hay tự kiểm tra khoảng cách |
| Thuật toán va chạm tự viết (AABB, circle, spatial hash) | Bảng collision matrix: nhóm nào đụng nhóm nào |
| Chuyển code Unity `Input`/`Physics2D` sang Cocos | Cảm giác điều khiển (đó là việc của [[game-feel]]) |
| Test cho phần toán thuần (không cần engine) | Kinematic hay Dynamic cho nhân vật |

**Phải nêu rõ** (thiếu là AI bật vật lý cho mọi thứ):

- **Có bật `PhysicsSystem2D` không**, hay tự kiểm tra va chạm.
- **Danh sách nhóm va chạm** và ma trận mong muốn.
- **Chạm ở node hay global**, và node đó đã có `UITransform` chưa.
- **Số lượng đối tượng cùng lúc** — 30 hay 300 quyết định thuật toán.
- **Nhân vật là Kinematic hay Dynamic**, và ai quyết vận tốc.

**Mẫu prompt**

```
Cocos Creator 3.8.x, TypeScript strict, game bắn 2D dọc.
KHÔNG bật PhysicsSystem2D — va chạm tự kiểm tra bằng bình phương khoảng cách.
Cùng lúc tối đa: 200 đạn, 40 enemy.

Việc: viết `CollisionWorld` (scripts/core/, KHÔNG import 'cc') giữ danh sách
{x, y, r, alive} cho hai phe, mỗi frame trả về các cặp trúng nhau.

RÀNG BUỘC:
- Không import 'cc'. Chỉ số học thuần, test được bằng node.
- CẤM cấp phát trong hàm step(): dùng mảng kết quả tái sử dụng.
- CẤM Math.sqrt trong vòng lặp nóng.
- API: step(dt) -> void, hits(): Int32Array các cặp chỉ số.
- Kèm một file test chạy bằng `node --test` kiểm: trúng đúng, không trúng khi
  cách xa đúng 1 pixel, và không cấp phát thêm sau 1000 lần step.
```

**Bẫy thường gặp:** AI gọi `node.destroy()` ngay trong callback `BEGIN_CONTACT` — chạy đúng mười lần rồi lần thứ mười một cho ra trạng thái lạ. Bẫy thứ hai: nó dùng `e.getLocation()` (pixel màn hình) thay cho `e.getUILocation()` (hệ UI), nên kéo thả lệch đúng bằng tỉ lệ co giãn của design resolution — trên máy bạn gần đúng, trên máy khác lệch hẳn.

## 💻 Code

Kéo để di chuyển, chạm để bắn, va chạm tự kiểm tra — không bật engine vật lý.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 280" role="img" aria-label="Hierarchy Canvas chứa Player, BulletLayer, EnemyLayer và TouchArea phủ toàn màn; Inspector của TouchShooter với tốc độ và bán kính trúng">
  <g class="fig-box-g">
    <rect x="10"  y="16" width="280" height="248" rx="9" class="fig-box"/>
    <rect x="320" y="16" width="326" height="248" rx="9" class="fig-box"/>
  </g>
  <text x="26"  y="40"  class="fig-muted" font-size="11">HIERARCHY</text>
  <text x="26"  y="68"  class="fig-label" font-size="13">▾ Canvas</text>
  <text x="42"  y="92"  class="fig-label" font-size="13">TouchArea  ← TouchShooter.ts</text>
  <text x="58"  y="112" class="fig-muted" font-size="11">UITransform phủ kín màn hình</text>
  <text x="42"  y="140" class="fig-label" font-size="13">Player</text>
  <text x="42"  y="168" class="fig-label" font-size="13">BulletLayer</text>
  <text x="42"  y="196" class="fig-label" font-size="13">EnemyLayer</text>
  <text x="42"  y="228" class="fig-muted" font-size="11">Thứ tự node = thứ tự vẽ; layer cùng atlas để gộp draw call</text>
  <text x="336" y="40"  class="fig-muted" font-size="11">INSPECTOR — TouchShooter</text>
  <text x="336" y="68"  class="fig-label" font-size="13">Player</text>
  <text x="580" y="68"  class="fig-muted" font-size="12">Player</text>
  <text x="336" y="96"  class="fig-label" font-size="13">Bullet Prefab</text>
  <text x="580" y="96"  class="fig-muted" font-size="12">bullet.prefab</text>
  <text x="336" y="124" class="fig-label" font-size="13">Bullet Speed</text>
  <text x="580" y="124" class="fig-muted" font-size="12">900</text>
  <text x="336" y="152" class="fig-label" font-size="13">Hit Radius</text>
  <text x="580" y="152" class="fig-muted" font-size="12">28</text>
  <text x="336" y="180" class="fig-label" font-size="13">Follow Lerp</text>
  <text x="580" y="180" class="fig-muted" font-size="12">0.35</text>
  <text x="336" y="216" class="fig-muted" font-size="11">TouchArea phải có UITransform, nếu không chạm không ăn.</text>
</svg>
<figcaption>Không có <code>RigidBody2D</code> nào trong demo này — và đó là điểm chính.</figcaption>
</figure>

**Script**

```ts
// TouchShooter.ts — kéo để lái, tự bắn, va chạm bằng bình phương khoảng cách.
import { _decorator, Component, Node, Prefab, Vec3, EventTouch, UITransform, instantiate, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TouchShooter')
export class TouchShooter extends Component {
    @property(Node) player: Node = null!;
    @property(Node) bulletLayer: Node = null!;
    @property(Node) enemyLayer: Node = null!;
    @property(Prefab) bulletPrefab: Prefab = null!;
    @property bulletSpeed = 900;
    @property hitRadius = 28;
    @property followLerp = 0.35;
    @property fireInterval = 0.12;

    private target = new Vec3();
    private pool: Node[] = [];
    private live: Node[] = [];
    private timer = 0;
    private topY = 0;
    private readonly a = new Vec3();
    private readonly b = new Vec3();

    onLoad() {
        this.player.getPosition(this.target);
        this.topY = view.getVisibleSize().height / 2 + 50;
    }

    onEnable() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouch, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouch, this);
    }
    onDisable() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouch, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouch, this);
    }

    private onTouch(e: EventTouch) {
        const p = e.getUILocation();                    // hệ UI, KHÔNG phải getLocation()
        this.a.set(p.x, p.y, 0);
        const local = this.player.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(this.a);
        this.target.set(local.x, local.y, 0);
    }

    update(dt: number) {
        // 1. người chơi bám theo ngón tay, có trễ nhẹ cho đỡ giật
        this.player.getPosition(this.a);
        this.a.lerp(this.target, this.followLerp);
        this.player.setPosition(this.a);

        // 2. bắn theo nhịp
        this.timer += dt;
        if (this.timer >= this.fireInterval) { this.timer -= this.fireInterval; this.fire(); }

        // 3. đạn bay + kiểm tra trúng
        const r2 = this.hitRadius * this.hitRadius;
        const enemies = this.enemyLayer.children;
        for (let i = this.live.length - 1; i >= 0; i--) {
            const bullet = this.live[i];
            bullet.getPosition(this.a);
            this.a.y += this.bulletSpeed * dt;
            bullet.setPosition(this.a);

            let hit: Node | null = null;
            for (let j = 0; j < enemies.length; j++) {
                const e = enemies[j];
                if (!e.active) continue;
                e.getPosition(this.b);
                const dx = this.a.x - this.b.x, dy = this.a.y - this.b.y;
                if (dx * dx + dy * dy <= r2) { hit = e; break; }   // không dùng sqrt
            }
            if (hit) { hit.active = false; this.recycle(i, bullet); continue; }
            if (this.a.y > this.topY) this.recycle(i, bullet);
        }
    }

    private recycle(index: number, bullet: Node) {
        this.live.splice(index, 1);
        bullet.active = false;
        this.pool.push(bullet);
    }

    private fire() {
        const b = this.pool.pop() ?? instantiate(this.bulletPrefab);
        if (!b.parent) b.setParent(this.bulletLayer);
        this.player.getPosition(this.a);
        b.setPosition(this.a);
        b.active = true;
        this.live.push(b);
    }
}
```

**Chạy thử**
- Kéo ngón tay: người chơi bám theo, **không lệch** khi đổi tỉ lệ preview sang 4:3 rồi 20:9. Lệch nghĩa là đang dùng sai hàm toạ độ.
- Bắn liên tục 60 giây: `BulletLayer.children.length` chững lại quanh 20–30.
- Đặt `hitRadius = 0`: không viên nào ăn — xác nhận va chạm đang thật sự chạy bằng bán kính chứ không phải trúng ngẫu nhiên.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Nút bấm không nhận chạm, không lỗi nào in ra. Anh kiểm gì đầu tiên?**
  → Kiểm node có `UITransform` và `contentSize` khác 0 không, vì đó là thứ định nghĩa vùng nhận chạm và thiếu nó thì không có lỗi nào được in. Sau đó xem có node nào phủ lên trên nuốt sự kiện, và có đang nghe nhầm ở `input` global thay vì trên node không.
- `Mid` **Khi nào dùng `PhysicsSystem2D`, khi nào tự kiểm tra va chạm?**
  → Hỏi mình cần *phản ứng* vật lý hay chỉ cần *biết đã chạm*. Đạn thẳng với enemy tròn chỉ cần biết, nên so bình phương khoảng cách là đủ: 200 đạn × 30 enemy là 6.000 phép nhân mỗi frame, gần như miễn phí. Vật rơi, đổ, chồng lên nhau thì dùng engine, vì tự viết sẽ tốn hơn nhiều.
- `Senior` **Game bắn 300 đạn, 50 enemy tụt còn 30fps trên Android tầm trung. Anh làm gì?**
  → Đo trước: xem thời gian nằm ở draw call hay ở logic. Nếu ở logic thì tắt engine vật lý chuyển sang kiểm tra khoảng cách và cắt ma trận va chạm cho đạn không kiểm với đạn. Nếu ở draw call thì gom đạn và enemy về chung atlas. Và gom 300 component `update` thành một manager tick, vì riêng chi phí gọi hàm đã là một khoản cố định.

**Khung trả lời 60 giây** — "Khi nào dùng engine vật lý, khi nào tự kiểm tra?"

> Tôi hỏi một câu: mình có cần *phản ứng* vật lý, hay chỉ cần *biết là đã chạm*. Đạn thẳng đụng enemy tròn, nhặt vật phẩm khi lại gần — chỉ cần biết đã chạm, nên tôi so bình phương khoảng cách, không gọi căn bậc hai, và chi phí gần như bằng không: hai trăm đạn nhân ba mươi enemy là sáu nghìn phép nhân mỗi frame. Còn vật rơi, đổ, chồng lên nhau, nảy thì tôi dùng engine, vì tự viết sẽ tốn hơn nhiều. Nhân vật platformer thì tôi để Kinematic và tự tính vận tốc, dùng raycast để bám đất, vì Dynamic cho cảm giác trơn trượt rất khó chỉnh. Bật vật lý cho mọi thứ là lựa chọn mặc định của tài liệu mẫu, không phải của game shipping.

**Họ sẽ đào tiếp**

- *"Chạm không ăn thì kiểm gì?"* → Node có `UITransform` không, `contentSize` có khác 0 không, có node nào ở trên chặn không, và có đang nghe nhầm ở global không.
- *"Collision matrix để làm gì?"* → Tắt những cặp không cần kiểm tra. Đạn với đạn, đạn với chủ của nó — bỏ được là giảm thẳng số phép kiểm.
- *"Vì sao không `destroy` trong callback va chạm?"* → Đang giữa bước giải vật lý. Đánh dấu rồi xử lý ở `update` kế tiếp.
- *"`getLocation` khác `getUILocation` ra sao?"* → Một cái là pixel màn hình, một cái là hệ UI đã tính design resolution. Dùng nhầm thì lệch đúng bằng tỉ lệ co giãn.

**Cờ đỏ**

- "Cứ bật vật lý cho chắc" — không phân biệt được nhu cầu phản ứng với nhu cầu phát hiện.
- Không biết `UITransform` quyết định vùng chạm.
- Dùng `Math.sqrt` trong vòng lặp kiểm va chạm.
- Popup không chặn input phía sau, và không biết có `BlockInputEvents`.

**Số / ví dụ nên thuộc**

- `PhysicsSystem2D.instance.fixedTimeStep = 1/60`; trọng lực tính bằng **pixel/s²**, không phải mét.
- Ba loại body: `Static` / `Dynamic` / `Kinematic` — nhân vật platformer chọn Kinematic.
- `sensor = true` cho hitbox và vùng kích hoạt.
- So bình phương khoảng cách, **không** `sqrt`.
- Popup → `BlockInputEvents`; chặn nổi sự kiện → `e.propagationStopped = true`.
