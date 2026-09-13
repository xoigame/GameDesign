---
title: Input & 2D physics
summary: Node-level versus global touch, converting screen coordinates into node space, 2D physics with groups and sensors, and when not to use a physics engine at all.
---

These two share a node because they meet at exactly one point: **coordinates**. Most "the button does nothing" and "the collision never fires" bugs are coordinate-space bugs, not logic bugs.

## Two ways to receive touches

| Mechanism | What it catches | Use for |
|---|---|---|
| `node.on(Node.EventType.TOUCH_START, cb, this)` | Only touches **that hit this node** | Buttons, cards, draggable characters |
| `input.on(Input.EventType.TOUCH_START, cb, this)` | **Every** touch on screen | Tap-anywhere-to-shoot, virtual joysticks, full-screen gestures |

For the first to fire, the node **must have a `UITransform` with a non-zero `contentSize`**. Without it nothing is logged; the touch simply does not land. That answers 90% of "why doesn't my button work".

Events **bubble from child to parent**. A card inside a scroll list means both receive the touch — to stop it:

```ts
onTouchStart(e: EventTouch) {
    e.propagationStopped = true;   // the parent no longer receives it
}
```

A popup has to block everything behind it: add the **`BlockInputEvents`** component to the popup's backdrop node. Without it players tap through the dim layer and hit buttons on the screen below — a bug that regularly ships, because on a dev machine you rarely tap in the wrong place.

## Coordinate conversion: the usual culprit

Touch event coordinates are **UI-space screen coordinates**, while a node lives in its parent's space. Convert through `UITransform`:

```ts
import { EventTouch, UITransform, Vec3 } from 'cc';

private readonly tmp = new Vec3();

onTouchMove(e: EventTouch) {
    const p = e.getUILocation();                       // Vec2, origin at screen centre
    this.tmp.set(p.x, p.y, 0);
    const local = this.node.parent!
        .getComponent(UITransform)!
        .convertToNodeSpaceAR(this.tmp);               // -> coordinates inside the parent
    this.node.setPosition(local);
}
```

Three easily-confused methods:

- `e.getLocation()` — raw **screen pixels**, origin bottom-left. Rarely what you want.
- `e.getUILocation()` — **UI space**, already accounting for the design resolution. Almost always the right one.
- `e.getDelta()` — movement since the last frame, handy for dragging without converting anything.

## 2D physics: three settings to get right

```ts
import { PhysicsSystem2D, Vec2 } from 'cc';

PhysicsSystem2D.instance.enable = true;
PhysicsSystem2D.instance.gravity = new Vec2(0, -640);   // px/s², NOT metres
PhysicsSystem2D.instance.fixedTimeStep = 1 / 60;
```

Three `RigidBody2D` types; the wrong one wastes work:

| Type | Who drives it | Use for |
|---|---|---|
| `Static` | Never moves | Walls, floors, kill zones |
| `Dynamic` | The physics engine | Falling, bouncing, being pushed |
| `Kinematic` | **Your code** | Moving platforms, a boss on a scripted path |

A platformer character usually should **not** be `Dynamic`: engine friction and restitution produce a slippery feel that is hard to tune. Use `Kinematic`, compute velocity yourself, and raycast for ground contact — the same lesson as [[unity-physics]].

The **collision matrix** (Project Settings → Physics) decides which group tests against which. Declare `player`, `enemy`, `bullet-player`, `bullet-enemy`, `pickup`, then switch off every pair you do not need: player bullets do not test against the player, bullets do not test against bullets. A shooter with 200 bullets that leaves every group colliding multiplies its own check count for nothing.

Set `sensor = true` on colliders that only need to **know contact happened** without being pushed: pickup zones, trigger volumes, bullet hitboxes.

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
    // Do NOT destroy here: the engine is mid-way through resolving contacts.
    // Flag it and handle it on the next update.
    this.pendingHit = other.node;
}
```

**Never destroy a node inside a contact callback.** You are in the middle of a physics solve, and destroying there produces unpredictable behaviour. Flag it, handle it next `update` — which is also why the deferred `destroy()` is a blessing.

## When **not** to use the physics engine

For casual 2D games a physics engine is often expensive and hard to tune. A decision table:

| Situation | What to use |
|---|---|
| Straight bullets vs round enemies | **Distance check**. Cheaper by a wide margin |
| Picking up items by proximity | Distance check |
| Aiming, hitscan lines | `raycast` |
| Objects that fall, topple, stack, bounce | Physics engine — rolling your own costs more |
| Platformer with slopes and moving platforms | Kinematic + raycast, not Dynamic |

Squared-distance checks for 200 bullets × 30 enemies is 6,000 multiplications per frame — nothing. Running `PhysicsSystem2D` over that many bodies is a different story, especially on low-end hardware.

```ts
// Cheap and sufficient: compare squared distance, never call Math.sqrt
const dx = a.x - b.x, dy = a.y - b.y;
if (dx * dx + dy * dy <= r * r) { /* hit */ }
```

## 🤖 Prompt for AI

**How to use AI for input and collision**

This is the area where AI produces code that **runs but feels wrong**: it handles touches globally when they belong on a node, forgets `UITransform`, and defaults to enabling the physics engine because every tutorial does.

| Delegate | You decide |
|---|---|
| Coordinate conversion, virtual joysticks, multi-touch handling | Physics engine versus hand-rolled distance checks |
| Custom collision algorithms (AABB, circle, spatial hash) | The collision matrix: which group tests which |
| Porting Unity `Input`/`Physics2D` code to Cocos | How the controls should feel (that is [[game-feel]]) |
| Tests for the pure maths (no engine needed) | Kinematic versus Dynamic for the character |

**Spell out** (or it turns physics on for everything):

- **Whether `PhysicsSystem2D` is enabled at all**, or you hand-roll collision.
- **The list of collision groups** and the matrix you want.
- **Node-level or global touch**, and whether that node already has a `UITransform`.
- **How many objects are live at once** — 30 versus 300 changes the algorithm.
- **Kinematic or Dynamic character**, and who owns velocity.

**Prompt template**

```
Cocos Creator 3.8.x, TypeScript strict, vertical 2D shooter.
PhysicsSystem2D is OFF — collisions are squared-distance checks.
Live at peak: 200 bullets, 40 enemies.

Task: write `CollisionWorld` (in scripts/core/, NO 'cc' import) holding
{x, y, r, alive} for two sides and returning the colliding pairs each frame.

CONSTRAINTS:
- No 'cc' import. Pure maths, testable under node.
- No allocation inside step(): reuse a result array.
- No Math.sqrt in the hot loop.
- API: step(dt) -> void, hits(): Int32Array of index pairs.
- Include a `node --test` file checking: a real hit registers, a miss by exactly
  1 pixel does not, and no extra allocation after 1000 steps.
```

**Common trap:** AI calls `node.destroy()` straight inside the `BEGIN_CONTACT` callback — it works ten times and produces a strange state on the eleventh. Second trap: it uses `e.getLocation()` (screen pixels) instead of `e.getUILocation()` (UI space), so dragging is off by exactly the design-resolution scale factor — close enough on your machine, visibly wrong on someone else's.

## 💻 Code

Drag to steer, auto-fire, hand-rolled collision — with the physics engine switched off.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 280" role="img" aria-label="Hierarchy with Canvas containing Player, BulletLayer, EnemyLayer and a full-screen TouchArea; Inspector for TouchShooter showing speed and hit radius">
  <g class="fig-box-g">
    <rect x="10"  y="16" width="280" height="248" rx="9" class="fig-box"/>
    <rect x="320" y="16" width="326" height="248" rx="9" class="fig-box"/>
  </g>
  <text x="26"  y="40"  class="fig-muted" font-size="11">HIERARCHY</text>
  <text x="26"  y="68"  class="fig-label" font-size="13">▾ Canvas</text>
  <text x="42"  y="92"  class="fig-label" font-size="13">TouchArea  ← TouchShooter.ts</text>
  <text x="58"  y="112" class="fig-muted" font-size="11">UITransform covering the screen</text>
  <text x="42"  y="140" class="fig-label" font-size="13">Player</text>
  <text x="42"  y="168" class="fig-label" font-size="13">BulletLayer</text>
  <text x="42"  y="196" class="fig-label" font-size="13">EnemyLayer</text>
  <text x="42"  y="228" class="fig-muted" font-size="11">Node order is draw order; keep a layer on one atlas to batch</text>
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
  <text x="336" y="216" class="fig-muted" font-size="11">TouchArea needs a UITransform or no touch lands.</text>
</svg>
<figcaption>There is not a single <code>RigidBody2D</code> in this demo — that is the point.</figcaption>
</figure>

**Script**

```ts
// TouchShooter.ts — drag to steer, auto-fire, squared-distance collision.
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
        const p = e.getUILocation();                    // UI space, NOT getLocation()
        this.a.set(p.x, p.y, 0);
        const local = this.player.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(this.a);
        this.target.set(local.x, local.y, 0);
    }

    update(dt: number) {
        // 1. the player eases toward the finger, a little lag keeps it smooth
        this.player.getPosition(this.a);
        this.a.lerp(this.target, this.followLerp);
        this.player.setPosition(this.a);

        // 2. fire on a timer
        this.timer += dt;
        if (this.timer >= this.fireInterval) { this.timer -= this.fireInterval; this.fire(); }

        // 3. move bullets and test hits
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
                if (dx * dx + dy * dy <= r2) { hit = e; break; }   // no sqrt
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

**Try it**
- Drag a finger: the player follows and stays aligned when you switch the preview to 4:3 and then 20:9. Drift means you used the wrong coordinate method.
- Fire continuously for 60 seconds: `BulletLayer.children.length` settles around 20–30.
- Set `hitRadius = 0`: nothing registers — proof that hits really come from the radius test and not from coincidence.

## 🎤 Interview

**Questions you will get**

- `Junior` **A button receives no touches and nothing is logged. What do you check first?**
  → Whether the node has a `UITransform` with a non-zero `contentSize`, because that defines the touch area and its absence logs nothing at all. Then whether something above it is swallowing the event, and whether you are listening globally on `input` instead of on the node.
- `Mid` **When do you use `PhysicsSystem2D` and when do you hand-roll collision?**
  → Ask whether you need a physical *reaction* or only need to *know* contact happened. Straight bullets against round enemies only need to know, so squared distances suffice: 200 bullets × 30 enemies is 6,000 multiplications a frame, effectively free. Things that fall, topple and stack go to the engine, because hand-rolling that costs far more.
- `Senior` **A shooter with 300 bullets and 50 enemies drops to 30fps on a mid-range Android. What now?**
  → Measure first: is the time in draw calls or in logic. If it is logic, drop the physics engine for distance checks and trim the collision matrix so bullets never test against bullets. If it is draw calls, move bullets and enemies onto one atlas. And collapse 300 `update` components into one manager tick, because the call overhead alone is a fixed cost.

**60-second answer** — "Physics engine or hand-rolled collision?"

> I ask one question: do I need a physical *reaction*, or do I just need to *know* contact happened. Straight bullets against round enemies, proximity pickups — I only need to know, so I compare squared distances with no square root, and the cost is close to nothing: two hundred bullets times thirty enemies is six thousand multiplications a frame. Things that fall, topple, stack and bounce go to the engine, because hand-rolling that costs far more. For a platformer character I use Kinematic and compute velocity myself, raycasting for ground contact, because Dynamic gives a slippery feel that is painful to tune. Turning physics on for everything is the tutorial default, not the shipping default.

**Where they dig**

- *"Touch does nothing — what do you check?"* → Does the node have a `UITransform`, is `contentSize` non-zero, is something above it swallowing the touch, and are you listening globally by mistake.
- *"What is the collision matrix for?"* → Switching off pairs you never need. Bullets against bullets, bullets against their own owner — removing those cuts checks directly.
- *"Why not destroy inside a contact callback?"* → You are mid physics solve. Flag it, handle it next `update`.
- *"`getLocation` versus `getUILocation`?"* → Screen pixels versus UI space with the design resolution applied. Mixing them up puts you off by exactly the scale factor.

**Red flags**

- "Just turn physics on to be safe" — no distinction between needing reaction and needing detection.
- Not knowing `UITransform` defines the touch area.
- `Math.sqrt` inside the collision loop.
- Popups that do not block input behind them, and no awareness of `BlockInputEvents`.

**Numbers and examples to know cold**

- `PhysicsSystem2D.instance.fixedTimeStep = 1/60`; gravity is in **pixels/s²**, not metres.
- Three body types: `Static` / `Dynamic` / `Kinematic` — platformer characters take Kinematic.
- `sensor = true` for hitboxes and trigger zones.
- Compare squared distance, **never** `sqrt`.
- Popup → `BlockInputEvents`; stop bubbling → `e.propagationStopped = true`.
