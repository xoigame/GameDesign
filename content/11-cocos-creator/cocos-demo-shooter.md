---
id: cocos-demo-shooter
title: Demo — game bắn súng
icon: 🔫
summary: Dựng một game bắn máy bay dọc trong Cocos: vòng lặp hệ thống, wave đọc từ JSON, mẫu đạn, cân bằng TTK và ngân sách 300 viên đạn trên máy yếu.
status: deep
read: 890
level: intermediate
order: 110
tags: [cocos, demo, shooter, gameplay, data-driven]
related: [cocos-creator, cocos-input-physics, combat-systems, difficulty-curve]
---

Node này dựng một **game bắn máy bay dọc** (vertical shooter) — thể loại phù hợp nhất với H5 và mini game: chơi một tay, hiểu trong ba giây, một ván 60–90 giây.

Thiết kế chiến đấu và độ khó nằm ở [[combat-systems]] và [[difficulty-curve]]; ở đây là **cách hiện thực hoá trong Cocos** sao cho 300 viên đạn vẫn chạy 60fps trên máy rẻ.

## Kiến trúc: hệ thống, không phải component rải rác

Sai lầm kinh điển: mỗi viên đạn một component `Bullet.ts` có `update`, mỗi enemy một `Enemy.ts` có `update`. Ba trăm đối tượng thành ba trăm lời gọi hàm mỗi frame, cộng chi phí cố định mà profiler chỉ vào "engine" ([[cocos-optimization]]).

Cách chạy tốt: **vài hệ thống, mỗi hệ thống một vòng lặp**.

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Vòng lặp một frame: GameClock cấp dt, rồi lần lượt Input, Spawn, Bullet, Enemy, Collision, Juice; mỗi hệ thống là một vòng lặp phẳng">
  <defs>
    <marker id="cds-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="96" width="120" height="58" rx="9" class="fig-box"/>
    <rect x="164" y="16" width="150" height="48" rx="9" class="fig-box"/>
    <rect x="164" y="76" width="150" height="48" rx="9" class="fig-box"/>
    <rect x="164" y="136" width="150" height="48" rx="9" class="fig-box"/>
    <rect x="164" y="196" width="150" height="48" rx="9" class="fig-box"/>
    <rect x="360" y="76" width="150" height="48" rx="9" class="fig-box"/>
    <rect x="360" y="136" width="150" height="48" rx="9" class="fig-box"/>
    <rect x="548" y="106" width="100" height="48" rx="9" class="fig-box"/>
  </g>
  <text x="70"  y="120" text-anchor="middle" class="fig-label" font-size="13">GameClock</text>
  <text x="70"  y="139" text-anchor="middle" class="fig-muted" font-size="11">dt · hitstop</text>
  <text x="239" y="36"  text-anchor="middle" class="fig-label" font-size="12">InputSystem</text>
  <text x="239" y="53"  text-anchor="middle" class="fig-muted" font-size="10">ngón tay → ý định</text>
  <text x="239" y="96"  text-anchor="middle" class="fig-label" font-size="12">SpawnSystem</text>
  <text x="239" y="113" text-anchor="middle" class="fig-muted" font-size="10">wave từ JSON</text>
  <text x="239" y="156" text-anchor="middle" class="fig-label" font-size="12">BulletSystem</text>
  <text x="239" y="173" text-anchor="middle" class="fig-muted" font-size="10">một vòng lặp phẳng</text>
  <text x="239" y="216" text-anchor="middle" class="fig-label" font-size="12">EnemySystem</text>
  <text x="239" y="233" text-anchor="middle" class="fig-muted" font-size="10">đường đi + mẫu bắn</text>
  <text x="435" y="96"  text-anchor="middle" class="fig-label" font-size="12">CollisionSystem</text>
  <text x="435" y="113" text-anchor="middle" class="fig-muted" font-size="10">bình phương k.cách</text>
  <text x="435" y="156" text-anchor="middle" class="fig-label" font-size="12">JuiceKit</text>
  <text x="435" y="173" text-anchor="middle" class="fig-muted" font-size="10">hitstop · shake · số</text>
  <text x="598" y="126" text-anchor="middle" class="fig-label" font-size="12">Render</text>
  <text x="598" y="143" text-anchor="middle" class="fig-muted" font-size="10">engine lo</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cds-a)" fill="none">
    <path d="M130 110 Q147 110 147 40 H160"/>
    <path d="M130 120 Q147 120 147 100 H160"/>
    <path d="M130 130 Q147 130 147 160 H160"/>
    <path d="M130 140 Q147 140 147 220 H160"/>
    <path d="M314 100 H356"/>
    <path d="M435 124 V132"/>
    <path d="M510 100 Q529 100 529 130 H544"/>
  </g>
</svg>
<figcaption>Một frame đi qua sáu hệ thống theo thứ tự cố định. Thứ tự này là thiết kế, không phải ngẫu nhiên: va chạm phải chạy <em>sau</em> khi đạn đã di chuyển.</figcaption>
</figure>

## Wave đọc từ dữ liệu, không hardcode

Đây là quyết định tiết kiệm nhiều thời gian nhất của cả node. Cân bằng một game bắn là **chỉnh số hàng trăm lần**; mỗi lần chỉnh mà phải sửa code rồi chờ biên dịch là một lần bạn chỉnh ít đi.

```json
// assets/data/waves.json
{
  "waves": [
    { "at": 0,  "enemy": "grunt",  "count": 6,  "interval": 0.35, "path": "sine",   "hp": 3 },
    { "at": 8,  "enemy": "zipper", "count": 10, "interval": 0.18, "path": "dive",   "hp": 2 },
    { "at": 20, "enemy": "turret", "count": 3,  "interval": 1.20, "path": "static", "hp": 12, "fire": "spread3" },
    { "at": 40, "enemy": "boss",   "count": 1,  "interval": 0,    "path": "boss",   "hp": 220, "fire": "spiral" }
  ]
}
```

Bảng này nằm ở `assets/data/`, nạp bằng `JsonAsset`, và có một `interface` TS mô tả kiểu để không bị `any` bò khắp nơi — xem [[data-driven-design]]. Người thiết kế chỉnh file này; lập trình viên không phải mở lại.

## Ba mẫu đạn đủ cho một game

| Mẫu | Cách tính | Cảm giác |
|---|---|---|
| `aimed` | Một viên hướng thẳng về phía người chơi | Ép người chơi phải di chuyển |
| `spreadN` | N viên toả đều quanh hướng gốc, góc cố định | Ép chọn khe để né |
| `spiral` | Góc tăng dần mỗi lần bắn | Tạo áp lực đều, hợp với boss |

Ba mẫu này phủ gần hết nhu cầu. Đừng làm bullet hell với hai mươi mẫu ở bản đầu — một game bắn tốt thường có **ít mẫu nhưng sắp xếp khéo**.

## Cân bằng: ba con số, không hơn

Bắt đầu bằng đúng ba tham số, chỉnh tới khi vừa tay rồi mới thêm:

- **TTK** (time to kill) cho enemy thường: **0.3–0.6 giây**. Lâu hơn là cảm giác súng yếu.
- **Mật độ đạn địch trên màn**: giữ dưới **40 viên** ở độ khó thường. Nhiều hơn thì máy yếu bắt đầu tụt fps trước khi người chơi thấy khó.
- **Nhịp wave**: một wave **6–10 giây**, xen kẽ một quãng nghỉ 2 giây. Không có nhịp nghỉ thì người chơi không cảm nhận được cao trào — xem [[pacing]].

Cách kiểm cân bằng rẻ nhất: viết một hàm mô phỏng chạy bằng `node` trong `scripts/core/`, cho 1000 ván với các mức DPS khác nhau, xem tỉ lệ thắng. Nhờ `core/` không import `'cc'` nên việc này chạy trong vài giây ([[cocos-project-structure]]).

## Ngân sách hiệu năng của thể loại này

| Thứ | Ngân sách | Cách giữ |
|---|---|---|
| Đạn cùng lúc | 300 | Pool, một vòng lặp, không physics |
| Enemy cùng lúc | 40 | Pool, Spine `SHARED_CACHE` |
| Draw call | < 50 | Đạn + enemy + hiệu ứng gom về **một atlas** |
| Rác mỗi frame | ~0 | Vector tái sử dụng, `for` thường, không closure |

Va chạm: **không dùng engine vật lý**. 300 đạn × 40 enemy là 12.000 phép so bình phương khoảng cách mỗi frame — rẻ hơn nhiều so với 340 rigidbody. Lý do đầy đủ ở [[cocos-input-physics]].

## 🤖 Prompt cho AI

**Dùng AI thế nào khi dựng game bắn**

Game bắn là thể loại AI dựng khung rất nhanh — và cũng là thể loại nó **dựng sai kiến trúc theo mặc định**: một component cho mỗi viên đạn, `instantiate` mỗi phát bắn, bật `PhysicsSystem2D` cho va chạm. Chạy mượt trên máy bạn, chết ở wave thứ năm trên điện thoại thật.

Cách chia việc:

| Giao cho AI | Bạn giữ |
|---|---|
| Hệ thống: BulletSystem, EnemySystem, CollisionSystem theo đặc tả | **Mọi con số cân bằng** — TTK, tốc độ, mật độ |
| Mẫu đạn (aimed / spread / spiral) dạng hàm thuần | Nhịp wave và cảm giác khó |
| Parser + kiểu TS cho `waves.json`, kèm validator | Bảng `waves.json` — đó là thiết kế |
| Mô phỏng cân bằng chạy bằng `node` | Quyết định sau khi nhìn kết quả mô phỏng |

**Phải nêu rõ** (thiếu là AI dựng kiểu tutorial):

- **Không dùng engine vật lý**, va chạm bằng bình phương khoảng cách.
- **Pool bắt buộc**, số lượng tối đa từng loại.
- **Một hệ thống tick nhiều đối tượng**, không phải một component mỗi đối tượng.
- **Wave đọc từ JSON**, không hardcode trong code.
- **Cấm cấp phát trong vòng lặp tick.**

**Mẫu prompt**

```
Cocos Creator 3.8.x, TypeScript strict. Game bắn máy bay dọc, đích web-mobile + WeChat.
Máy yếu nhất: Android 4 nhân 3GB. Ngân sách: 300 đạn, 40 enemy, < 50 draw call.

Việc: viết BulletSystem + CollisionSystem.

RÀNG BUỘC KIẾN TRÚC:
- MỘT component tick toàn bộ đạn. CẤM một component cho mỗi viên đạn.
- CẤM PhysicsSystem2D. Va chạm = bình phương khoảng cách, KHÔNG Math.sqrt.
- Đạn lấy từ pool, trả về pool khi ra khỏi màn hoặc trúng — CẤM destroy.
- CẤM cấp phát (new Vec3 / closure / mảng mới) trong vòng lặp tick.
- Dùng dt từ GameClock.step(), KHÔNG dùng dt thô (để hitstop hoạt động).
- Mẫu đạn là hàm THUẦN trong scripts/core/ (không import 'cc') để test được bằng node.

API tôi cần:
  spawn(x, y, angleRad, speed, faction): void
  tick(dt): void
  forEachLive(cb): void   // cho CollisionSystem đọc, KHÔNG cấp phát mảng mới

Viết xong, nói rõ tôi phải đo con số nào để biết pool đang hoạt động.
```

**Bẫy thường gặp:** AI viết `Bullet.ts` gắn vào prefab đạn với `update` riêng — đúng mọi tutorial trên mạng, và là thứ đầu tiên phải viết lại khi lên 200 viên. Bẫy thứ hai: nó hardcode bảng wave thành mảng trong code "cho gọn", và mỗi lần cân bằng lại phải sửa code.

## 💻 Code

Lõi của game bắn: hệ thống đạn có pool, mẫu đạn thuần, va chạm không physics. Copy vào dự án Cocos 3.8 là chạy.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 290" role="img" aria-label="Hierarchy: Canvas chứa Player, BulletLayer, EnemyLayer; Inspector của BulletSystem với prefab, ngân sách và tốc độ">
  <g class="fig-box-g">
    <rect x="10"  y="16" width="280" height="258" rx="9" class="fig-box"/>
    <rect x="320" y="16" width="326" height="258" rx="9" class="fig-box"/>
  </g>
  <text x="26"  y="40"  class="fig-muted" font-size="11">HIERARCHY</text>
  <text x="26"  y="68"  class="fig-label" font-size="13">▾ GameRoot</text>
  <text x="42"  y="92"  class="fig-muted" font-size="12">GameClock · JuiceKit</text>
  <text x="26"  y="122" class="fig-label" font-size="13">▾ Canvas</text>
  <text x="42"  y="146" class="fig-muted" font-size="12">Systems  ← BulletSystem.ts</text>
  <text x="42"  y="170" class="fig-muted" font-size="12">Player</text>
  <text x="42"  y="194" class="fig-muted" font-size="12">EnemyLayer   ← cùng atlas</text>
  <text x="42"  y="218" class="fig-muted" font-size="12">BulletLayer  ← cùng atlas</text>
  <text x="42"  y="248" class="fig-muted" font-size="11">Hai layer cùng atlas → gộp được draw call</text>
  <text x="336" y="40"  class="fig-muted" font-size="11">INSPECTOR — BulletSystem</text>
  <text x="336" y="68"  class="fig-label" font-size="13">Bullet Prefab</text>
  <text x="580" y="68"  class="fig-muted" font-size="12">bullet.prefab</text>
  <text x="336" y="96"  class="fig-label" font-size="13">Layer</text>
  <text x="580" y="96"  class="fig-muted" font-size="12">BulletLayer</text>
  <text x="336" y="124" class="fig-label" font-size="13">Max Bullets</text>
  <text x="580" y="124" class="fig-muted" font-size="12">300</text>
  <text x="336" y="152" class="fig-label" font-size="13">Warm</text>
  <text x="580" y="152" class="fig-muted" font-size="12">120</text>
  <text x="336" y="180" class="fig-label" font-size="13">Cull Margin</text>
  <text x="580" y="180" class="fig-muted" font-size="12">60</text>
  <text x="336" y="216" class="fig-muted" font-size="11">Max Bullets là TRẦN CỨNG: đầy thì bỏ viên mới,</text>
  <text x="336" y="236" class="fig-muted" font-size="11">không cấp phát thêm — fps quan trọng hơn một viên đạn.</text>
</svg>
<figcaption>Ngân sách được ép ở mức hệ thống, không phải ở mức lời khuyên.</figcaption>
</figure>

**Script**

```ts
// patterns.ts — scripts/core/, KHÔNG import 'cc'. Test được bằng `node --test`.
export interface Shot { angle: number; speed: number }

/** Bắn thẳng về phía mục tiêu. */
export function aimed(fromX: number, fromY: number, toX: number, toY: number, speed: number): Shot[] {
    return [{ angle: Math.atan2(toY - fromY, toX - fromX), speed }];
}

/** N viên toả đều quanh hướng gốc, tổng góc spreadRad. */
export function spread(n: number, baseAngle: number, spreadRad: number, speed: number): Shot[] {
    const out: Shot[] = [];
    if (n <= 1) return [{ angle: baseAngle, speed }];
    const step = spreadRad / (n - 1);
    for (let i = 0; i < n; i++) out.push({ angle: baseAngle - spreadRad / 2 + step * i, speed });
    return out;
}

/** Xoắn ốc: góc tăng đều theo số lần bắn. */
export function spiral(shotIndex: number, stepRad: number, speed: number): Shot[] {
    return [{ angle: shotIndex * stepRad, speed }];
}
```

```ts
// BulletSystem.ts — MỘT component tick toàn bộ đạn. Không physics, không cấp phát.
import { _decorator, Component, Node, Prefab, Vec3, instantiate, view } from 'cc';
const { ccclass, property } = _decorator;

export const enum Faction { Player = 0, Enemy = 1 }

@ccclass('BulletSystem')
export class BulletSystem extends Component {
    @property(Prefab) bulletPrefab: Prefab = null!;
    @property(Node) layer: Node = null!;
    @property maxBullets = 300;
    @property warm = 120;
    @property cullMargin = 60;

    // Mảng song song: tránh object-per-bullet, giữ dữ liệu liền nhau trong bộ nhớ
    private nodes: Node[] = [];
    private x = new Float32Array(0);
    private y = new Float32Array(0);
    private vx = new Float32Array(0);
    private vy = new Float32Array(0);
    private faction = new Uint8Array(0);
    private live = 0;

    private halfW = 0;
    private halfH = 0;
    private pool: Node[] = [];
    private readonly tmp = new Vec3();

    onLoad() {
        const size = view.getVisibleSize();
        this.halfW = size.width / 2 + this.cullMargin;
        this.halfH = size.height / 2 + this.cullMargin;

        this.x = new Float32Array(this.maxBullets);
        this.y = new Float32Array(this.maxBullets);
        this.vx = new Float32Array(this.maxBullets);
        this.vy = new Float32Array(this.maxBullets);
        this.faction = new Uint8Array(this.maxBullets);
        this.nodes.length = this.maxBullets;

        for (let i = 0; i < this.warm; i++) this.pool.push(this.makeNode());
    }

    private makeNode(): Node {
        const n = instantiate(this.bulletPrefab);
        n.active = false;
        n.setParent(this.layer);
        return n;
    }

    /** Trần cứng: đầy thì BỎ viên mới. fps quan trọng hơn một viên đạn. */
    spawn(px: number, py: number, angle: number, speed: number, faction: Faction): boolean {
        if (this.live >= this.maxBullets) return false;
        const i = this.live++;
        this.x[i] = px; this.y[i] = py;
        this.vx[i] = Math.cos(angle) * speed;
        this.vy[i] = Math.sin(angle) * speed;
        this.faction[i] = faction;

        const n = this.pool.pop() ?? this.makeNode();
        n.active = true;
        this.tmp.set(px, py, 0);
        n.setPosition(this.tmp);
        n.angle = (angle * 180) / Math.PI - 90;
        this.nodes[i] = n;
        return true;
    }

    /** dt lấy từ GameClock.step() để hitstop có tác dụng. */
    tick(dt: number) {
        for (let i = this.live - 1; i >= 0; i--) {
            const nx = this.x[i] + this.vx[i] * dt;
            const ny = this.y[i] + this.vy[i] * dt;
            if (nx < -this.halfW || nx > this.halfW || ny < -this.halfH || ny > this.halfH) {
                this.kill(i);
                continue;
            }
            this.x[i] = nx; this.y[i] = ny;
            this.tmp.set(nx, ny, 0);
            this.nodes[i].setPosition(this.tmp);
        }
    }

    /** Xoá bằng swap-remove: O(1), không dịch mảng. */
    kill(i: number) {
        const n = this.nodes[i];
        n.active = false;
        this.pool.push(n);
        const last = --this.live;
        if (i !== last) {
            this.x[i] = this.x[last]; this.y[i] = this.y[last];
            this.vx[i] = this.vx[last]; this.vy[i] = this.vy[last];
            this.faction[i] = this.faction[last];
            this.nodes[i] = this.nodes[last];
        }
        this.nodes[last] = null!;
    }

    /** CollisionSystem đọc qua đây — không cấp phát mảng mới mỗi frame. */
    forEach(faction: Faction, cb: (i: number, x: number, y: number) => void) {
        for (let i = this.live - 1; i >= 0; i--) {
            if (this.faction[i] === faction) cb(i, this.x[i], this.y[i]);
        }
    }

    get liveCount() { return this.live; }
    get pooled() { return this.pool.length; }
}
```

```ts
// CollisionSystem.ts — đạn người chơi vs enemy. Bình phương khoảng cách, không sqrt.
import { _decorator, Component, Node, Vec3 } from 'cc';
import { BulletSystem, Faction } from './BulletSystem';
const { ccclass, property } = _decorator;

@ccclass('CollisionSystem')
export class CollisionSystem extends Component {
    @property(BulletSystem) bullets: BulletSystem = null!;
    @property(Node) enemyLayer: Node = null!;
    @property hitRadius = 26;
    @property damagePerBullet = 1;

    private readonly p = new Vec3();

    tick() {
        const r2 = this.hitRadius * this.hitRadius;
        const enemies = this.enemyLayer.children;

        this.bullets.forEach(Faction.Player, (bi, bx, by) => {
            for (let j = 0; j < enemies.length; j++) {
                const e = enemies[j];
                if (!e.active) continue;
                e.getPosition(this.p);
                const dx = bx - this.p.x, dy = by - this.p.y;
                if (dx * dx + dy * dy > r2) continue;

                this.bullets.kill(bi);
                e.emit('damage', this.damagePerBullet, bx, by);   // enemy tự xử lý máu
                break;                                            // một viên chỉ trúng một mục tiêu
            }
        });
    }
}
```

**Chạy thử**
- Bắn liên tục 60 giây: `bulletSystem.liveCount + bulletSystem.pooled` phải **đứng yên** ở một con số, không tăng. Tăng nghĩa là pool bị rò.
- Ép 400 viên khi trần là 300: `spawn` trả `false` ở viên thứ 301, fps **không tụt**.
- Bật panel thống kê: draw call của `BulletLayer` + `EnemyLayer` gộp lại phải là **1–2** nếu hai layer dùng chung atlas.
- Đặt `GameClock.hitstop(0.3)` lúc trúng đòn: đạn **đứng hình** rồi chạy tiếp — xác nhận cả hệ thống dùng dt đã điều chỉnh.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao không nên cho mỗi viên đạn một component có `update`?**
  → Vì 300 viên thành 300 lời gọi hàm mỗi frame, cộng chi phí cố định mà profiler chỉ vào "engine" chứ không chỉ vào code của bạn. Một vòng lặp phẳng trong một hệ thống làm đúng từng ấy việc nhưng rẻ hơn nhiều, và còn cho phép dùng mảng song song để dữ liệu nằm liền nhau trong bộ nhớ.
- `Mid` **Game bắn 300 đạn giật trên Android tầm trung. Anh khoanh vùng ra sao?**
  → Nhìn ba chỗ theo thứ tự: draw call (đạn và enemy có cùng atlas không), rác GC (allocation timeline có cưa răng không), rồi mới tới logic va chạm. Kinh nghiệm là thủ phạm thường nằm ở hai chỗ đầu, vì 300 × 40 phép so bình phương khoảng cách chỉ là 12.000 phép nhân — không đáng kể.
- `Senior` **Cân bằng một game bắn thì anh chỉnh những con số nào trước, và kiểm bằng cách nào?**
  → Ba con số: TTK của enemy thường quanh 0.3–0.6 giây, mật độ đạn địch dưới 40 viên trên màn, và nhịp wave 6–10 giây có quãng nghỉ. Kiểm bằng mô phỏng chạy `node` trong `scripts/core/` — cho 1000 ván ở vài mức DPS rồi nhìn tỉ lệ thắng, vì chỉnh bằng cảm giác trong Editor thì mỗi lần thử mất vài phút.

**Khung trả lời 60 giây** — "Dựng kiến trúc cho một game bắn trên mini game, anh làm thế nào?"

> Tôi chia thành vài hệ thống chạy theo thứ tự cố định trong một frame: input, spawn, đạn, enemy, va chạm, rồi juice. Mỗi hệ thống là một vòng lặp phẳng tick toàn bộ đối tượng cùng loại, chứ không phải mỗi viên đạn một component, vì ba trăm component là ba trăm lời gọi hàm mỗi frame. Đạn và enemy đều lấy từ pool có trần cứng — đầy thì bỏ viên mới, vì fps quan trọng hơn một viên đạn. Va chạm tôi tự so bình phương khoảng cách chứ không bật engine vật lý, vì mình chỉ cần biết đã chạm chứ không cần phản ứng vật lý. Và bảng wave nằm trong JSON để người thiết kế chỉnh mà không cần biên dịch lại.

**Họ sẽ đào tiếp**

- *"Mảng song song để làm gì?"* → Dữ liệu liền nhau trong bộ nhớ, không sinh object cho mỗi viên đạn, và xoá bằng swap-remove là O(1).
- *"Trần cứng có làm mất cảm giác không?"* → Ở 300 viên thì người chơi không nhận ra một viên bị bỏ, nhưng nhận ra ngay khi tụt xuống 30fps.
- *"Vì sao dt phải qua GameClock?"* → Để hitstop và pause có tác dụng lên mọi hệ thống cùng lúc; Cocos không có `Time.timeScale`.
- *"Mẫu đạn để ở đâu?"* → Hàm thuần trong `scripts/core/`, không import `'cc'`, nên test được bằng `node` và mô phỏng được ngoài Editor.

**Cờ đỏ**

- Một component cho mỗi viên đạn, `instantiate` mỗi phát bắn.
- Bật `PhysicsSystem2D` cho đạn mà không giải thích được vì sao cần phản ứng vật lý.
- Bảng wave hardcode trong code.
- Không có trần số lượng, và không biết chuyện gì xảy ra khi vượt.

**Số / ví dụ nên thuộc**

- Ngân sách: **300 đạn**, **40 enemy**, **< 50 draw call**.
- TTK enemy thường: **0.3–0.6 giây**.
- Mật độ đạn địch trên màn: **< 40 viên**.
- Nhịp wave: **6–10 giây** kèm quãng nghỉ ~2 giây.
- Va chạm 300 × 40 = **12.000** phép so bình phương mỗi frame — không đáng kể.
