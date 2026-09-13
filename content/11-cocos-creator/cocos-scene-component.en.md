---
title: Node, Component & lifecycle
summary: The Node/Component model in Cocos 3.x, lifecycle order, boot scene, prefabs, events and pooling — the skeleton everything else hangs off.
---

Everything in Cocos is a **Node**. A node has a transform, a parent and children, and it carries **Components**. There is no separate UI hierarchy the way `RectTransform` works in Unity — a button is just a node carrying `UITransform` + `Sprite` + `Button`.

This node is the skeleton: what order the lifecycle runs in, how scenes load, how prefabs are born and die. Get this wrong and every other node in this branch wobbles.

## The lifecycle, in order

| Method | When it runs | Use it for |
|---|---|---|
| `onLoad()` | The node is loaded into the scene, **before** anything renders | Grabbing references, setting up internal data |
| `onEnable()` | Every time the node/component is enabled | Registering listeners |
| `start()` | Just **before the first `update` frame** after being enabled | Work that needs every other node to have finished `onLoad` |
| `update(dt)` | Every frame | Time-based logic. `dt` is in **seconds** |
| `lateUpdate(dt)` | After every `update` in the frame | Camera follow, anything that must run last |
| `onDisable()` | Every time it is disabled | **Removing listeners** — nobody does it for you |
| `onDestroy()` | When the node is destroyed | Releasing resources and references |

Two things trip up anyone arriving from Unity:

1. **`dt` is a parameter; there is no global `Time.deltaTime`.** Anything that needs dt must be handed it. That is exactly why pure logic classes should take `dt` as an argument from the start.
2. **`node.destroy()` does not remove it immediately** — it is deferred to the end of the frame. Right after the call, the node is still in `parent.children`. Counting live enemies straight after `destroy()` gives the wrong number.

Order between components is **not guaranteed** unless you declare it. When one truly must run before another, use `@executionOrder(-1)` (lower runs first) — but use it sparingly: a project that only works because of thirty `@executionOrder` annotations is a project nobody can untangle.

## Boot scene: one way in

Do not let the gameplay scene bootstrap everything. Build an almost empty `boot.scene` holding a single `GameRoot` node:

<figure class="fig">
<svg viewBox="0 0 660 240" role="img" aria-label="A boot scene loads config and bundles, creates the persistent GameRoot node, then moves to the menu scene and the game scene; GameRoot lives across all of them">
  <defs>
    <marker id="csc-a-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
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
  <text x="85"  y="70"  text-anchor="middle" class="fig-muted" font-size="11">empty, GameRoot only</text>
  <text x="316" y="50"  text-anchor="middle" class="fig-label" font-size="13">menu.scene</text>
  <text x="316" y="70"  text-anchor="middle" class="fig-muted" font-size="11">preloads the game bundle</text>
  <text x="559" y="50"  text-anchor="middle" class="fig-label" font-size="13">game.scene</text>
  <text x="559" y="70"  text-anchor="middle" class="fig-muted" font-size="11">loads and plays instantly</text>
  <text x="328" y="166" text-anchor="middle" class="fig-label" font-size="13">GameRoot — addPersistRootNode</text>
  <text x="328" y="186" text-anchor="middle" class="fig-muted" font-size="11">audio · save · event bus · player profile — alive across every scene</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#csc-a-en)" fill="none">
    <path d="M160 55 H222"/>
    <path d="M406 55 H468"/>
    <path d="M85 86 V136"/>
  </g>
</svg>
<figcaption>Every scene assumes GameRoot already exists. That also lets you open <code>game.scene</code> directly in the Editor to test — as long as GameRoot self-creates when missing.</figcaption>
</figure>

```ts
import { _decorator, Component, director, game, instantiate, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Boot')
export class Boot extends Component {
    @property(Prefab) gameRootPrefab: Prefab = null!;

    async start() {
        // Persistent node: survives every scene change. Must be a ROOT node.
        const root = instantiate(this.gameRootPrefab);
        director.getScene()!.addChild(root);
        game.addPersistRootNode(root);

        await this.loadSave();
        director.loadScene('menu');
    }

    private async loadSave() { /* … */ }
}
```

`game.addPersistRootNode(node)` is Cocos's `DontDestroyOnLoad`. The node you pass **must be a direct child of the scene**, not buried in the hierarchy — get that wrong and it silently does nothing.

## Prefabs: birth and death

```ts
const bullet = instantiate(this.bulletPrefab);   // returns a Node
bullet.setParent(this.bulletLayer);              // prefer setParent when world position matters
bullet.setPosition(this.muzzle.worldPosition);
```

Three frequent mistakes:

- **`instantiate` is synchronous and expensive.** Spawning 50 bullets in one frame is a visible hitch. Use a pool (below).
- **Nested prefabs** are supported from 3.x, but editing a child prefab does not always propagate into every prefab embedding it — eyeball the result after editing a shared prefab.
- **`destroy()` is deferred to end of frame.** If you need to know immediately, mark it yourself: `bullet.active = false` before `destroy()`, or better, return it to the pool.

## Events: do not leak

Three ways to communicate, each with its place:

| Mechanism | When | Warning |
|---|---|---|
| A direct `@property` reference | Fixed relationship known in the Editor | Clearest option, make it the default |
| `node.on(type, cb, this)` | Events belonging to that node (touch, collision) | You **must** `off` in `onDisable` |
| A shared `EventTarget` | Decoupled systems: score ↔ HUD ↔ audio | Turns into spaghetti without a naming convention |

```ts
// scripts/core/bus.ts — no 'cc' import, testable under plain node
export type GameEvent = 'score' | 'player-died' | 'wave-cleared';
class Bus {
    private map = new Map<GameEvent, Set<Function>>();
    on(e: GameEvent, cb: Function) { (this.map.get(e) ?? this.map.set(e, new Set()).get(e)!).add(cb); }
    off(e: GameEvent, cb: Function) { this.map.get(e)?.delete(cb); }
    emit(e: GameEvent, ...args: unknown[]) { this.map.get(e)?.forEach((cb) => cb(...args)); }
}
export const bus = new Bus();
```

**One-line rule: register in `onEnable`, remove in `onDisable`, match all three arguments.** `node.off(type, cb)` without `this` will **not** remove a listener registered with `this` — and that is leak source number one: the node is destroyed but the closure still holds a reference, so the whole subtree is never collected.

No scattered `find()` calls either. `find('Canvas/HUD/Score')` is a string — rename the node and it breaks, with no compile-time warning.

## Pooling: mandatory, not premature optimisation

Bullets, enemies, floating damage numbers, cells in a long scroll list — anything created more than a few times a second goes through a pool. On low-end devices, JS garbage collection is the clearest source of rhythmic stutter.

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

Two rules when pooling: **`put()` must reset state** (velocity, health, running tweens, listeners), and **never `destroy()` something the pool owns**. Forget the reset and the second bullet flies along the first one's heading — a bug that is hard to spot, because the firing code still looks correct.

## 🤖 Prompt for AI

**How to use AI at the component layer**

This is where AI writes fast and fails subtly. It knows the *shape* of a component — decorators, lifecycle methods — but usually skips the three things only hands-on experience teaches: removing listeners, `destroy()` being one frame late, and resetting on pool return.

A workable split:

| Delegate | You decide |
|---|---|
| Writing a component from a precise spec with negative constraints | What is persistent and what dies with the scene |
| Porting Unity MonoBehaviour logic to a Component | The line between `scripts/core/` and engine-facing code |
| Pools, event buses, a game-level state machine | System initialisation order at boot |
| Tests for the pure-logic parts | Scene and prefab structure (it cannot see them) |

**Spell out** (or you get 2.x code, or leaky code):

- **Cocos 3.8, ES modules `import { … } from 'cc'`** — ban `cc.Class`, `cc.v2`, `properties: {}`.
- **Which node this component sits on**, and which `@property` slots you wire in the Editor.
- **Who owns its lifetime**: the scene, a pooled prefab, or a persistent node.
- **Whether pooling is in play** — if so, it needs a `reset()`.
- **Allocation constraints**: no `new` inside `update`.

**Prompt template**

```
Cocos Creator 3.8.x, TypeScript strict.
Write an `EnemySpawner` component that lives on "GameRoot/Spawners".

Behaviour: each wave spawns N enemies over T seconds at spawn points (@property Node[]).
Enemies come from the existing pool (class NodePoolSimple pasted below), NEVER from a
direct instantiate. When the wave is cleared, emit 'wave-cleared' on the shared bus.

CONSTRAINTS:
- 3.x API only. Ban cc.Class / cc.v2 / node.width / require().
- Register listeners in onEnable, remove them in onDisable, all three arguments.
- No new Vec3 and no new closures inside update().
- Move things with setPosition; never mutate node.position in place.
- Returning to the pool must reset: health, velocity, tweens (Tween.stopAllByTarget).
- No find() by path string; every reference comes through @property.

Before writing, list the @property slots I have to wire in the Inspector.
```

**Common trap:** the model removes listeners in `onDestroy()` instead of `onDisable()`. A node that is disabled and re-enabled — routine with pooling — then stacks registrations, and the handler fires two or three times per event. What you observe is "one shot takes two health", while the shooting code is perfectly correct.

## 💻 Code

A small scene that demonstrates all four things at once: a persistent node, the lifecycle, pooling, and an event bus.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Hierarchy on the left with GameRoot, Canvas, Spawner, BulletLayer; Inspector on the right showing the Spawner properties for prefab, layer, interval, speed and pool size">
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
  <text x="326" y="222" class="fig-muted" font-size="11">These values must match the script defaults.</text>
</svg>
<figcaption>Three scripts and one bullet prefab. Not a single <code>find()</code> call.</figcaption>
</figure>

**Script**

```ts
// Spawner.ts — fires on a timer, pulls from a pool, recycles off-screen bullets.
import { _decorator, Component, Node, Prefab, Vec3, instantiate, view } from 'cc';
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
    private readonly tmp = new Vec3();      // reused: no allocation inside update

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
        // iterate backwards so in-place removal does not shift the index
        for (let i = this.live.length - 1; i >= 0; i--) {
            const b = this.live[i];
            b.getPosition(this.tmp);
            this.tmp.y += this.bulletSpeed * dt;
            b.setPosition(this.tmp);
            if (this.tmp.y > this.topY) {
                this.live.splice(i, 1);
                this.pool.put(b);               // RETURN to the pool, never destroy
            }
        }
    }

    private fire() {
        const b = this.pool.get();
        this.node.getPosition(this.tmp);
        b.setPosition(this.tmp);                 // resetting position is the pool's "reset"
        this.live.push(b);
    }

    onDestroy() {
        for (const b of this.live) this.pool.put(b);
        this.live.length = 0;
    }
}
```

**Try it**
- Run for 60 seconds: the child count of `BulletLayer` must **settle on a number** (roughly 32–40), not climb forever. Climbing means the pool is never getting them back.
- Turn on the stats panel: after the first 10 seconds the GC line should be flat, with no sawtooth.
- Disable and re-enable the `Spawner` node: the fire rate must not double — doubling means stacked registrations.

## 🎤 Interview

**Questions you will get**

- `Junior` **How do `onLoad`, `start` and `onEnable` differ? Where do you register events?**
  → `onLoad` runs when the node loads, `onEnable` every time it is enabled, and `start` just before the first `update` frame. Events are registered in `onEnable` and removed in `onDisable`, because pooled nodes are disabled and re-enabled constantly — registering in `onLoad` stacks a listener on every reuse.
- `Mid` **After calling `node.destroy()`, `children.length` still counts it. Why?**
  → Destruction is deferred to the **end of the frame**, so immediately after the call the node is still in `parent.children`. Counting live enemies right after `destroy()` gives the wrong number; set `active = false` yourself if you need it now, or better, return it to a pool instead of destroying.
- `Senior` **The game stutters rhythmically after five minutes and worsens over time. How do you narrow it down?**
  → Two suspects: per-frame GC garbage and leaked listeners. I check the allocation timeline for a regular sawtooth, then count child nodes per layer — linear growth with play time means the pool never gets them back. Leaked listeners show up as a handler firing two or three times per event, usually because removal sits in `onDestroy` instead of `onDisable`.

**60-second answer** — "Where do you register and remove events, and why?"

> Register in `onEnable`, remove in `onDisable`, and the `on`/`off` pair has to match all three arguments including `this`. The reason is that nodes get disabled and re-enabled constantly, especially with pooling: registering in `onLoad` but removing in `onDestroy` stacks another listener on every reuse, so the handler runs two or three times per event. What you see is "one shot takes two health" while the shooting code is perfectly correct. The other half is the leak: a live listener means the closure holds the node, so the whole subtree is never collected and the game gets heavier the longer you play.

**Where they dig**

- *"How is `start` different from `onLoad`?"* → `onLoad` runs when the node loads; `start` runs right before the first `update` frame. Anything that needs other nodes ready belongs in `start`.
- *"Why is the node still there after `destroy()`?"* → Destruction is deferred to end of frame. If you need to know immediately, mark it yourself, or return it to a pool instead of destroying.
- *"What about ordering between components?"* → Not guaranteed unless you declare `@executionOrder`. But depending on order is a design smell — better to let systems initialise on demand.
- *"What does a pool have to reset?"* → Position, velocity, health, running tweens (`Tween.stopAllByTarget`), and any listener added after checkout.

**Red flags**

- Registering in `onLoad` and removing in `onDestroy` — precisely the trap above.
- `find('Canvas/HUD/Score')` scattered through the code instead of `@property`.
- "Pooling is premature optimisation, just instantiate" — on web and mini game, the garbage collector answers that for you.
- Not distinguishing persistent nodes from scene-scoped ones, so everything ends up inside one immortal `GameManager`.

**Numbers and examples to know cold**

- Order: `onLoad` → `onEnable` → `start` → `update` → `lateUpdate` → `onDisable` → `onDestroy`.
- `dt` is in **seconds** and arrives as a parameter; there is no global `Time.deltaTime`.
- `game.addPersistRootNode` only works on a **root** node of the scene.
- `destroy()` takes effect at the **end of the frame**.
- Leak check: the child count must **plateau**, not grow linearly with play time.
