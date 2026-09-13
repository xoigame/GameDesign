---
id: cocos-scene-component
title: Node, Component & vòng đời
icon: 🧩
summary: Mô hình Node/Component của Cocos 3.x, thứ tự vòng đời, boot scene, prefab, event, và pool — bộ xương mà mọi thứ khác móc vào.
status: deep
read: 820
level: basic
order: 20
tags: [cocos, component, lifecycle, prefab, pool]
related: [cocos-creator, cocos-project-structure, unity-game-loop, architecture-patterns]
---

Mọi thứ trong Cocos là **Node**. Node có transform, có cha con, và mang **Component**. Không có hệ cây riêng cho UI như `RectTransform` bên Unity — một nút bấm cũng chỉ là node mang `UITransform` + `Sprite` + `Button`.

Node này là bộ xương: vòng đời chạy theo thứ tự nào, scene nạp ra sao, prefab sinh ra và chết đi thế nào. Sai ở đây thì mọi node khác trong nhánh đều lung lay.

## Vòng đời, theo đúng thứ tự

| Hàm | Khi chạy | Dùng để |
|---|---|---|
| `onLoad()` | Node được nạp vào scene, **trước** khi có gì hiển thị | Lấy tham chiếu, khởi tạo dữ liệu nội bộ |
| `onEnable()` | Mỗi lần node/component bật lên | Đăng ký listener |
| `start()` | Ngay **trước frame `update` đầu tiên** sau khi bật | Việc cần mọi node khác đã `onLoad` xong |
| `update(dt)` | Mỗi frame | Logic theo thời gian. `dt` tính bằng **giây** |
| `lateUpdate(dt)` | Sau mọi `update` trong frame | Camera bám theo, thứ phải chạy sau cùng |
| `onDisable()` | Mỗi lần tắt | **Gỡ listener** — không ai gỡ hộ |
| `onDestroy()` | Khi node bị huỷ | Trả tài nguyên, giải phóng tham chiếu |

Hai điều làm người từ Unity sang vấp ngay:

1. **`dt` là tham số, không có `Time.deltaTime` toàn cục.** Hàm nào cần dt thì phải được truyền xuống. Đây là lý do các lớp logic thuần nên nhận `dt` như tham số ngay từ đầu.
2. **`node.destroy()` không xoá ngay** mà dồn tới cuối frame. Ngay sau khi gọi, node vẫn còn trong `parent.children`. Đếm số enemy còn sống ngay sau `destroy()` sẽ ra số sai.

Thứ tự giữa các component **không đảm bảo** trừ khi bạn khai. Cần cái này chạy trước cái kia thì dùng `@executionOrder(-1)` (số nhỏ chạy trước) — nhưng dùng tiết kiệm: một dự án mà thứ tự đúng nhờ ba chục `@executionOrder` là một dự án khó gỡ.

## Boot scene: một chỗ vào duy nhất

Đừng để scene gameplay tự khởi tạo mọi thứ. Dựng một `boot.scene` gần như rỗng, chỉ có một node `GameRoot`:

<figure class="fig">
<svg viewBox="0 0 660 240" role="img" aria-label="Boot scene nạp cấu hình và bundle, tạo node bền vững GameRoot, rồi chuyển sang scene menu và scene game; GameRoot sống xuyên suốt">
  <defs>
    <marker id="csc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="24"  width="150" height="62" rx="9" class="fig-box"/>
    <rect x="10"  y="140" width="636" height="62" rx="9" class="fig-box"/>
    <rect x="226" y="24"  width="180" height="62" rx="9" class="fig-box"/>
    <rect x="472" y="24"  width="174" height="62" rx="9" class="fig-box"/>
  </g>
  <text x="85"  y="50"  text-anchor="middle" class="fig-label" font-size="13">boot.scene</text>
  <text x="85"  y="70"  text-anchor="middle" class="fig-muted" font-size="11">rỗng, chỉ có GameRoot</text>
  <text x="316" y="50"  text-anchor="middle" class="fig-label" font-size="13">menu.scene</text>
  <text x="316" y="70"  text-anchor="middle" class="fig-muted" font-size="11">preload bundle game</text>
  <text x="559" y="50"  text-anchor="middle" class="fig-label" font-size="13">game.scene</text>
  <text x="559" y="70"  text-anchor="middle" class="fig-muted" font-size="11">nạp là chạy ngay</text>
  <text x="328" y="166" text-anchor="middle" class="fig-label" font-size="13">GameRoot — addPersistRootNode</text>
  <text x="328" y="186" text-anchor="middle" class="fig-muted" font-size="11">audio · save · event bus · hồ sơ người chơi — sống xuyên mọi scene</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#csc-a)" fill="none">
    <path d="M160 55 H222"/>
    <path d="M406 55 H468"/>
    <path d="M85 86 V136"/>
  </g>
</svg>
<figcaption>Mọi scene đều giả định GameRoot đã có sẵn. Nhờ vậy mở thẳng <code>game.scene</code> trong Editor để test cũng chạy — miễn là GameRoot tự dựng khi thiếu.</figcaption>
</figure>

```ts
import { _decorator, Component, director, game, instantiate, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Boot')
export class Boot extends Component {
    @property(Prefab) gameRootPrefab: Prefab = null!;

    async start() {
        // Node bền vững: sống xuyên mọi lần đổi scene. Phải là node ROOT.
        const root = instantiate(this.gameRootPrefab);
        director.getScene()!.addChild(root);
        game.addPersistRootNode(root);

        await this.loadSave();
        director.loadScene('menu');
    }

    private async loadSave() { /* … */ }
}
```

`game.addPersistRootNode(node)` là `DontDestroyOnLoad` của Cocos. Node truyền vào **phải là con trực tiếp của scene**, không được nằm sâu trong cây — sai điều này thì nó im lặng không có tác dụng.

## Prefab: sinh và huỷ

```ts
const bullet = instantiate(this.bulletPrefab);   // trả về Node
bullet.setParent(this.bulletLayer);              // KHÔNG dùng node.parent = x nếu cần đổi cả world pos
bullet.setPosition(this.muzzle.worldPosition);
```

Ba điều hay sai:

- **`instantiate` là đồng bộ và tốn.** Sinh 50 viên đạn trong một frame là một cú giật thấy được. Dùng pool (dưới đây).
- **Prefab lồng nhau** được hỗ trợ từ 3.x, nhưng sửa prefab con **không tự đẩy** sang mọi prefab cha đang nhúng nó trong mọi trường hợp — kiểm lại bằng mắt sau khi sửa prefab dùng chung.
- **`destroy()` dồn tới cuối frame.** Cần biết ngay là đã chết thì tự đánh dấu: `bullet.active = false` rồi mới `destroy()`, hoặc tốt hơn là trả về pool.

## Event: đừng để rò

Ba đường giao tiếp, dùng đúng chỗ:

| Cách | Khi nào | Cảnh báo |
|---|---|---|
| `@property` trỏ thẳng | Quan hệ cố định, biết trước trong Editor | Rõ nhất, nên là mặc định |
| `node.on(type, cb, this)` | Sự kiện của chính node đó (chạm, va chạm) | **Phải** `off` ở `onDisable` |
| `EventTarget` dùng chung | Hệ thống rời nhau: điểm số ↔ HUD ↔ âm thanh | Dễ thành mớ bòng bong nếu không có quy ước tên |

```ts
// scripts/core/bus.ts — không import 'cc', test được bằng node thuần
export type GameEvent = 'score' | 'player-died' | 'wave-cleared';
class Bus {
    private map = new Map<GameEvent, Set<Function>>();
    on(e: GameEvent, cb: Function) { (this.map.get(e) ?? this.map.set(e, new Set()).get(e)!).add(cb); }
    off(e: GameEvent, cb: Function) { this.map.get(e)?.delete(cb); }
    emit(e: GameEvent, ...args: unknown[]) { this.map.get(e)?.forEach((cb) => cb(...args)); }
}
export const bus = new Bus();
```

**Luật một câu: đăng ký ở `onEnable`, gỡ ở `onDisable`, khớp đủ ba tham số.** `node.off(type, cb)` thiếu `this` sẽ **không gỡ được** listener đã đăng ký kèm `this` — và đây là nguồn rò bộ nhớ số một: node bị huỷ nhưng closure còn giữ tham chiếu, cả cây con không được thu hồi.

Không có `find()` rải rác trong code. `find('Canvas/HUD/Score')` là chuỗi ký tự — đổi tên node là gãy, mà không có cảnh báo nào lúc biên dịch.

## Pool: thứ bắt buộc, không phải tối ưu sớm

Đạn, enemy, số damage bay lên, ô trong danh sách cuộn — bất cứ thứ gì sinh ra hơn vài lần mỗi giây đều phải qua pool. GC của JS engine trên máy yếu là nguồn giật định kỳ rõ nhất.

```ts
import { Node, Prefab, instantiate } from 'cc';

export class NodePoolSimple {
    private free: Node[] = [];
    constructor(private prefab: Prefab, private parent: Node, warm = 0) {
        for (let i = 0; i < warm; i++) this.free.push(this.make());
    }
    private make(): Node {
        const n = instantiate(this.prefab);
        n.active = false;
        n.setParent(this.parent);
        return n;
    }
    get(): Node {
        const n = this.free.pop() ?? this.make();
        n.active = true;
        return n;
    }
    put(n: Node) {
        n.active = false;
        this.free.push(n);
    }
}
```

Hai luật khi dùng pool: **`put()` phải reset trạng thái** (vận tốc, máu, tween đang chạy, listener), và **không bao giờ `destroy()` thứ thuộc pool**. Quên reset thì viên đạn thứ hai bay theo hướng của viên thứ nhất — bug này rất khó nhìn ra vì code bắn trông vẫn đúng.

## 🤖 Prompt cho AI

**Dùng AI thế nào với lớp component**

Đây là chỗ AI viết nhanh và sai tinh vi. Nó thuộc *hình dạng* của một component (decorator, các hàm vòng đời) nhưng thường bỏ qua ba thứ chỉ người làm thật mới nhớ: gỡ listener, `destroy()` trễ một frame, và reset khi trả về pool.

Cách chia việc hiệu quả:

| Giao cho AI | Bạn quyết |
|---|---|
| Viết component từ đặc tả rõ, có ràng buộc phủ định | Cái gì là node bền vững, cái gì chết theo scene |
| Chuyển logic Unity (MonoBehaviour) sang Component | Ranh giới giữa `scripts/core/` và code chạm engine |
| Viết pool, event bus, state machine cấp game | Thứ tự khởi tạo hệ thống lúc boot |
| Viết test cho phần logic thuần | Cấu trúc scene và prefab (nó không nhìn thấy) |

**Phải nêu rõ** (thiếu là AI trả về code 2.x hoặc code rò bộ nhớ):

- **Cocos 3.8, ES module `import { … } from 'cc'`** — cấm `cc.Class`, `cc.v2`, `properties: {}`.
- **Component này gắn vào node nào**, và những `@property` nào được kéo trong Editor.
- **Ai sở hữu vòng đời của nó**: scene, prefab được pool, hay node bền vững.
- **Có đang dùng pool không** — nếu có thì phải có hàm `reset()`.
- **Ràng buộc cấp phát**: cấm `new` trong `update`.

**Mẫu prompt**

```
Cocos Creator 3.8.x, TypeScript strict.
Viết component `EnemySpawner` gắn ở node "GameRoot/Spawners".

Hành vi: mỗi wave sinh N enemy trong T giây tại các điểm spawn (@property Node[]).
Enemy lấy từ pool có sẵn (class NodePoolSimple tôi đưa bên dưới), KHÔNG instantiate
trực tiếp. Hết wave thì emit 'wave-cleared' lên bus dùng chung.

RÀNG BUỘC:
- CHỈ API 3.x. CẤM cc.Class / cc.v2 / node.width / require().
- Đăng ký listener ở onEnable, gỡ ở onDisable, đủ 3 tham số.
- CẤM new Vec3 / closure mới bên trong update().
- Đổi vị trí bằng setPosition, CẤM sửa node.position tại chỗ.
- Trả về pool phải reset: máu, vận tốc, tween (Tween.stopAllByTarget).
- KHÔNG dùng find() theo chuỗi đường dẫn; mọi tham chiếu qua @property.

Trước khi viết, liệt kê các @property tôi phải kéo trong Inspector.
```

**Bẫy thường gặp:** AI viết `onDestroy()` để gỡ listener thay vì `onDisable()` — node bị tắt đi bật lại (rất thường gặp với pool) sẽ đăng ký chồng lên, và hàm xử lý chạy hai, ba lần mỗi sự kiện. Triệu chứng quan sát được là "bắn một phát trừ hai máu", nhưng code bắn hoàn toàn đúng.

## 💻 Code

Một scene nhỏ chứng minh cả bốn thứ: node bền vững, vòng đời, pool, và event bus.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Hierarchy bên trái với GameRoot, Canvas, Spawner, BulletLayer; Inspector bên phải của Spawner với các property prefab, điểm spawn, số lượng">
  <g class="fig-box-g">
    <rect x="10"  y="16" width="270" height="268" rx="9" class="fig-box"/>
    <rect x="310" y="16" width="336" height="268" rx="9" class="fig-box"/>
  </g>
  <text x="26"  y="40"  class="fig-muted" font-size="11">HIERARCHY</text>
  <text x="26"  y="68"  class="fig-label" font-size="13">▾ boot (scene)</text>
  <text x="42"  y="92"  class="fig-label" font-size="13">▾ GameRoot  ← persist</text>
  <text x="58"  y="116" class="fig-muted" font-size="12">Bootstrap.ts</text>
  <text x="42"  y="146" class="fig-label" font-size="13">▾ Canvas</text>
  <text x="58"  y="170" class="fig-muted" font-size="12">Spawner   ← Spawner.ts</text>
  <text x="58"  y="194" class="fig-muted" font-size="12">BulletLayer</text>
  <text x="58"  y="218" class="fig-muted" font-size="12">HUD       ← ScoreView.ts</text>
  <text x="326" y="40"  class="fig-muted" font-size="11">INSPECTOR — Spawner</text>
  <text x="326" y="68"  class="fig-label" font-size="13">Bullet Prefab</text>
  <text x="560" y="68"  class="fig-muted" font-size="12">bullet.prefab</text>
  <text x="326" y="96"  class="fig-label" font-size="13">Bullet Layer</text>
  <text x="560" y="96"  class="fig-muted" font-size="12">BulletLayer</text>
  <text x="326" y="124" class="fig-label" font-size="13">Fire Interval</text>
  <text x="560" y="124" class="fig-muted" font-size="12">0.15</text>
  <text x="326" y="152" class="fig-label" font-size="13">Bullet Speed</text>
  <text x="560" y="152" class="fig-muted" font-size="12">900</text>
  <text x="326" y="180" class="fig-label" font-size="13">Warm Pool</text>
  <text x="560" y="180" class="fig-muted" font-size="12">32</text>
  <text x="326" y="222" class="fig-muted" font-size="11">Giá trị phải khớp giá trị mặc định trong script.</text>
</svg>
<figcaption>Ba script, một prefab đạn. Không script nào gọi <code>find()</code>.</figcaption>
</figure>

**Script**

```ts
// Spawner.ts — bắn đạn theo nhịp, lấy từ pool, tự thu hồi khi ra khỏi màn.
import { _decorator, Component, Node, Prefab, Vec3, instantiate, UITransform, view } from 'cc';
const { ccclass, property } = _decorator;

class Pool {
    private free: Node[] = [];
    constructor(private prefab: Prefab, private parent: Node, warm: number) {
        for (let i = 0; i < warm; i++) this.free.push(this.make());
    }
    private make(): Node {
        const n = instantiate(this.prefab);
        n.active = false;
        n.setParent(this.parent);
        return n;
    }
    get(): Node { const n = this.free.pop() ?? this.make(); n.active = true; return n; }
    put(n: Node) { n.active = false; this.free.push(n); }
    get size() { return this.free.length; }
}

@ccclass('Spawner')
export class Spawner extends Component {
    @property(Prefab) bulletPrefab: Prefab = null!;
    @property(Node) bulletLayer: Node = null!;
    @property fireInterval = 0.15;
    @property bulletSpeed = 900;
    @property warmPool = 32;

    private pool!: Pool;
    private live: Node[] = [];
    private timer = 0;
    private topY = 0;
    private readonly tmp = new Vec3();      // tái dùng: không cấp phát trong update

    onLoad() {
        this.pool = new Pool(this.bulletPrefab, this.bulletLayer, this.warmPool);
        this.topY = view.getVisibleSize().height / 2 + 60;
    }

    update(dt: number) {
        this.timer += dt;
        if (this.timer >= this.fireInterval) {
            this.timer -= this.fireInterval;
            this.fire();
        }
        // duyệt ngược để xoá tại chỗ không lệch chỉ số
        for (let i = this.live.length - 1; i >= 0; i--) {
            const b = this.live[i];
            b.getPosition(this.tmp);
            this.tmp.y += this.bulletSpeed * dt;
            b.setPosition(this.tmp);
            if (this.tmp.y > this.topY) {
                this.live.splice(i, 1);
                this.pool.put(b);               // TRẢ POOL, không destroy
            }
        }
    }

    private fire() {
        const b = this.pool.get();
        this.node.getPosition(this.tmp);
        b.setPosition(this.tmp);                 // reset vị trí — phần "reset" của pool
        this.live.push(b);
    }

    onDestroy() {
        for (const b of this.live) this.pool.put(b);
        this.live.length = 0;
    }
}
```

**Chạy thử**
- Chạy 60 giây: số node con của `BulletLayer` phải **dừng lại ở một con số** (khoảng 32–40), không tăng mãi. Tăng mãi nghĩa là pool không được trả về.
- Bật panel thống kê: sau 10 giây đầu, đường GC phải phẳng — không có cưa răng.
- Tắt rồi bật lại node `Spawner`: nhịp bắn không được nhanh gấp đôi (dấu hiệu đăng ký chồng).

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`onLoad`, `start`, `onEnable` khác nhau ở đâu? Đăng ký sự kiện đặt vào hàm nào?**
  → `onLoad` chạy khi node được nạp, `onEnable` chạy mỗi lần bật, `start` chạy ngay trước frame `update` đầu tiên. Đăng ký sự kiện phải ở `onEnable` và gỡ ở `onDisable`, vì node bị tắt bật liên tục khi dùng pool — đăng ký ở `onLoad` là chồng listener mỗi lần tái sử dụng.
- `Mid` **Gọi `node.destroy()` xong đếm `children.length` vẫn thấy node đó. Vì sao?**
  → Huỷ node ở Cocos bị dồn tới **cuối frame**, nên ngay sau lời gọi nó vẫn nằm trong `parent.children`. Đếm enemy còn sống ngay sau `destroy()` sẽ ra số sai; muốn biết ngay thì tự đánh dấu `active = false`, hoặc tốt hơn là trả về pool thay vì huỷ.
- `Senior` **Game chơi 5 phút là giật từng nhịp, càng chơi càng nặng. Anh khoanh vùng thế nào?**
  → Hai nghi phạm: rác GC mỗi frame và rò listener. Tôi mở allocation timeline xem có cưa răng đều không, rồi đếm số node con của các layer — nếu tăng tuyến tính theo thời gian chơi thì pool không được trả về. Rò listener lộ ra ở chỗ một sự kiện làm hàm xử lý chạy hai ba lần, thường vì gỡ ở `onDestroy` thay vì `onDisable`.

**Khung trả lời 60 giây** — "Đăng ký và gỡ sự kiện ở đâu, vì sao?"

> Đăng ký ở `onEnable`, gỡ ở `onDisable`, và cặp `on`/`off` phải khớp đủ ba tham số gồm cả `this`. Lý do là node bị tắt đi bật lại rất thường xuyên, nhất là khi dùng pool: nếu đăng ký ở `onLoad` mà gỡ ở `onDestroy` thì mỗi lần tái sử dụng lại chồng thêm một listener, và hàm xử lý chạy hai ba lần cho một sự kiện. Triệu chứng nhìn thấy là "bắn một phát trừ hai máu" trong khi code bắn hoàn toàn đúng. Mặt còn lại là rò bộ nhớ: listener còn sống thì closure giữ tham chiếu tới node, cả cây con không được thu hồi, chơi càng lâu càng nặng.

**Họ sẽ đào tiếp**

- *"`start` khác `onLoad` chỗ nào?"* → `onLoad` chạy khi node được nạp, `start` chạy ngay trước frame `update` đầu tiên. Việc cần node khác đã sẵn sàng thì để ở `start`.
- *"Vì sao `destroy()` rồi mà node còn đó?"* → Huỷ dồn tới cuối frame. Muốn biết ngay thì tự đánh dấu, hoặc trả về pool thay vì huỷ.
- *"Thứ tự chạy giữa các component?"* → Không đảm bảo, trừ khi khai `@executionOrder`. Nhưng phụ thuộc thứ tự là mùi thiết kế — tốt hơn là cho hệ thống tự khởi tạo theo yêu cầu.
- *"Pool thì phải reset gì?"* → Vị trí, vận tốc, máu, tween đang chạy (`Tween.stopAllByTarget`), và mọi listener đã gắn thêm.

**Cờ đỏ**

- Đăng ký ở `onLoad`, gỡ ở `onDestroy` — sai đúng cái bẫy vừa nói.
- `find('Canvas/HUD/Score')` rải khắp code thay vì `@property`.
- "Pool là tối ưu sớm, cứ `instantiate` cho nhanh" — trên web và mini game thì GC trả lời thay.
- Không phân biệt được node bền vững với node chết theo scene, nên nhét mọi thứ vào một `GameManager` bất tử.

**Số / ví dụ nên thuộc**

- Thứ tự: `onLoad` → `onEnable` → `start` → `update` → `lateUpdate` → `onDisable` → `onDestroy`.
- `dt` tính bằng **giây** và là tham số, không có `Time.deltaTime` toàn cục.
- `game.addPersistRootNode` chỉ ăn với node **root** của scene.
- `destroy()` thực thi ở **cuối frame**.
- Kiểm rò pool: số node con phải **chững lại**, không tăng tuyến tính theo thời gian chơi.
