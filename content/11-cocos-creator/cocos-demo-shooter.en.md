---
title: Demo — shooter game
summary: Building a vertical shooter in Cocos: a system-driven loop, waves loaded from JSON, bullet patterns, TTK balancing, and a 300-bullet budget on weak hardware.
---

This node builds a **vertical shooter** — the genre that fits H5 and mini games best: one-handed, understood in three seconds, a round in 60–90 seconds.

Combat design and difficulty live in [[combat-systems]] and [[difficulty-curve]]; here we cover **how to implement it in Cocos** so 300 bullets still hold 60fps on a cheap phone.

## Architecture: systems, not scattered components

The classic mistake: one `Bullet.ts` component with an `update` per bullet, one `Enemy.ts` per enemy. Three hundred objects become three hundred function calls per frame, plus fixed overhead the profiler attributes to "engine" ([[cocos-optimization]]).

What works: **a handful of systems, each with one loop**.

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="One frame: GameClock supplies dt, then Input, Spawn, Bullet, Enemy, Collision and Juice run in order; each system is a flat loop">
  <defs>
    <marker id="cds-a-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
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
  <text x="239" y="53"  text-anchor="middle" class="fig-muted" font-size="10">finger → intent</text>
  <text x="239" y="96"  text-anchor="middle" class="fig-label" font-size="12">SpawnSystem</text>
  <text x="239" y="113" text-anchor="middle" class="fig-muted" font-size="10">waves from JSON</text>
  <text x="239" y="156" text-anchor="middle" class="fig-label" font-size="12">BulletSystem</text>
  <text x="239" y="173" text-anchor="middle" class="fig-muted" font-size="10">one flat loop</text>
  <text x="239" y="216" text-anchor="middle" class="fig-label" font-size="12">EnemySystem</text>
  <text x="239" y="233" text-anchor="middle" class="fig-muted" font-size="10">paths + fire patterns</text>
  <text x="435" y="96"  text-anchor="middle" class="fig-label" font-size="12">CollisionSystem</text>
  <text x="435" y="113" text-anchor="middle" class="fig-muted" font-size="10">squared distance</text>
  <text x="435" y="156" text-anchor="middle" class="fig-label" font-size="12">JuiceKit</text>
  <text x="435" y="173" text-anchor="middle" class="fig-muted" font-size="10">hitstop · shake · numbers</text>
  <text x="598" y="126" text-anchor="middle" class="fig-label" font-size="12">Render</text>
  <text x="598" y="143" text-anchor="middle" class="fig-muted" font-size="10">engine's job</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cds-a-en)" fill="none">
    <path d="M130 110 Q147 110 147 40 H160"/>
    <path d="M130 120 Q147 120 147 100 H160"/>
    <path d="M130 130 Q147 130 147 160 H160"/>
    <path d="M130 140 Q147 140 147 220 H160"/>
    <path d="M314 100 H356"/>
    <path d="M435 124 V132"/>
    <path d="M510 100 Q529 100 529 130 H544"/>
  </g>
</svg>
<figcaption>A frame passes through six systems in a fixed order. That order is a design decision: collision must run <em>after</em> bullets have moved.</figcaption>
</figure>

## Waves come from data, not code

This is the single biggest time-saver in the node. Balancing a shooter means **tuning numbers hundreds of times**; if every tweak needs a code edit and a compile, you will tweak less.

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

The table lives in `assets/data/`, loads through `JsonAsset`, and has a TS `interface` describing its shape so `any` does not spread — see [[data-driven-design]]. Designers edit this file; programmers do not have to reopen anything.

## Three bullet patterns are enough for a game

| Pattern | How it is computed | How it feels |
|---|---|---|
| `aimed` | One bullet straight at the player | Forces movement |
| `spreadN` | N bullets fanned around a base angle | Forces you to pick a gap |
| `spiral` | Angle increments per shot | Steady pressure, good for bosses |

These three cover nearly everything. Do not build bullet hell with twenty patterns in version one — good shooters usually have **few patterns arranged well**.

## Balance: three numbers, no more

Start with exactly three parameters, tune until it feels right, then add:

- **TTK** (time to kill) for a regular enemy: **0.3–0.6 seconds**. Longer and the gun feels weak.
- **Enemy bullet density on screen**: keep under **40** at normal difficulty. Beyond that, weak devices lose frames before the player feels challenged.
- **Wave rhythm**: a wave of **6–10 seconds** with a 2-second breather between. Without the breather there is no felt crescendo — see [[pacing]].

The cheapest way to verify balance: a simulation function in `scripts/core/` runnable under `node`, playing 1000 rounds at several DPS levels and reporting win rate. Because `core/` never imports `'cc'`, this finishes in seconds ([[cocos-project-structure]]).

## The genre's performance budget

| Thing | Budget | How to hold it |
|---|---|---|
| Bullets live | 300 | Pool, one loop, no physics |
| Enemies live | 40 | Pool, Spine `SHARED_CACHE` |
| Draw calls | < 50 | Bullets + enemies + effects on **one atlas** |
| Garbage per frame | ~0 | Reused vectors, plain `for`, no closures |

Collision: **no physics engine**. 300 bullets × 40 enemies is 12,000 squared-distance comparisons per frame — far cheaper than 340 rigid bodies. Full reasoning in [[cocos-input-physics]].

## 🤖 Prompt for AI

**How to use AI when building a shooter**

Shooters are a genre AI scaffolds very quickly — and also one where it **defaults to the wrong architecture**: a component per bullet, an `instantiate` per shot, `PhysicsSystem2D` for collision. Smooth on your machine, dead by wave five on a real phone.

| Delegate | Keep |
|---|---|
| Systems: BulletSystem, EnemySystem, CollisionSystem from a spec | **Every balance number** — TTK, speeds, density |
| Bullet patterns (aimed / spread / spiral) as pure functions | Wave rhythm and the feel of difficulty |
| Parser and TS types for `waves.json`, plus a validator | The `waves.json` table itself — that is design |
| A balance simulation runnable under `node` | The decision you make after reading the simulation |

**Spell out** (or you get tutorial architecture):

- **No physics engine**; collision is squared distance.
- **Pooling is mandatory**, with per-type caps.
- **One system ticking many objects**, never one component per object.
- **Waves come from JSON**, never hardcoded.
- **No allocation inside the tick loop.**

**Prompt template**

```
Cocos Creator 3.8.x, TypeScript strict. Vertical shooter, targets web-mobile + WeChat.
Weakest device: 4-core, 3GB Android. Budget: 300 bullets, 40 enemies, < 50 draw calls.

Task: write BulletSystem + CollisionSystem.

ARCHITECTURE CONSTRAINTS:
- ONE component ticks all bullets. NEVER one component per bullet.
- NO PhysicsSystem2D. Collision = squared distance, no Math.sqrt.
- Bullets come from a pool and return to it off-screen or on hit — never destroy.
- No allocation (new Vec3 / closures / new arrays) inside the tick loop.
- Use dt from GameClock.step(), not the raw dt (so hitstop works).
- Bullet patterns are PURE functions in scripts/core/ (no 'cc' import), testable under node.

The API I need:
  spawn(x, y, angleRad, speed, faction): void
  tick(dt): void
  forEach(faction, cb): void   // for CollisionSystem, allocating no new arrays

When done, tell me which number to measure to confirm the pool is working.
```

**Common trap:** AI writes a `Bullet.ts` attached to the bullet prefab with its own `update` — exactly what every tutorial does, and the first thing you rewrite at 200 bullets. Second trap: it hardcodes the wave table as an array "for simplicity", so every balance pass becomes a code edit.

## 💻 Code

The core of the shooter: a pooled bullet system, pure patterns, physics-free collision. Copy it into a Cocos 3.8 project and it runs.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 290" role="img" aria-label="Hierarchy with Canvas containing Player, BulletLayer and EnemyLayer; Inspector for BulletSystem with prefab, budget and speeds">
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
  <text x="42"  y="194" class="fig-muted" font-size="12">EnemyLayer   ← same atlas</text>
  <text x="42"  y="218" class="fig-muted" font-size="12">BulletLayer  ← same atlas</text>
  <text x="42"  y="248" class="fig-muted" font-size="11">Both layers on one atlas → draw calls batch</text>
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
  <text x="336" y="216" class="fig-muted" font-size="11">Max Bullets is a HARD CAP: when full, drop the new bullet</text>
  <text x="336" y="236" class="fig-muted" font-size="11">rather than allocating — fps matters more than one bullet.</text>
</svg>
<figcaption>The budget is enforced by the system, not by good intentions.</figcaption>
</figure>

**Script**

```ts
// patterns.ts — scripts/core/, NO 'cc' import. Testable with `node --test`.
export interface Shot { angle: number; speed: number }

/** Straight at the target. */
export function aimed(fromX: number, fromY: number, toX: number, toY: number, speed: number): Shot[] {
    return [{ angle: Math.atan2(toY - fromY, toX - fromX), speed }];
}

/** N bullets fanned evenly around a base angle, total arc spreadRad. */
export function spread(n: number, baseAngle: number, spreadRad: number, speed: number): Shot[] {
    const out: Shot[] = [];
    if (n <= 1) return [{ angle: baseAngle, speed }];
    const step = spreadRad / (n - 1);
    for (let i = 0; i < n; i++) out.push({ angle: baseAngle - spreadRad / 2 + step * i, speed });
    return out;
}

/** Spiral: the angle advances with each shot. */
export function spiral(shotIndex: number, stepRad: number, speed: number): Shot[] {
    return [{ angle: shotIndex * stepRad, speed }];
}
```

```ts
// BulletSystem.ts — ONE component ticks every bullet. No physics, no allocation.
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

    // Parallel arrays: no object per bullet, data stays contiguous in memory
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

    /** Hard cap: when full, DROP the new bullet. fps matters more than one bullet. */
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

    /** dt comes from GameClock.step() so hitstop applies. */
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

    /** Swap-remove: O(1), no array shifting. */
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

    /** CollisionSystem reads through this — no new array per frame. */
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
// CollisionSystem.ts — player bullets vs enemies. Squared distance, no sqrt.
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
                e.emit('damage', this.damagePerBullet, bx, by);   // the enemy owns its health
                break;                                            // one bullet hits one target
            }
        });
    }
}
```

**Try it**
- Fire continuously for 60 seconds: `liveCount + pooled` must **stay constant**. Growth means the pool is leaking.
- Force 400 spawns against a cap of 300: `spawn` returns `false` on the 301st and fps **does not drop**.
- Stats panel on: `BulletLayer` + `EnemyLayer` together should be **1–2** draw calls if they share an atlas.
- Call `GameClock.hitstop(0.3)` on a hit: bullets **freeze** and resume — proof the whole system uses the adjusted dt.

## 🎤 Interview

**Questions you will get**

- `Junior` **Why not give each bullet its own component with an `update`?**
  → Because 300 bullets become 300 function calls per frame plus fixed overhead the profiler blames on "engine" rather than your code. One flat loop in one system does the same work far more cheaply, and it also lets you use parallel arrays so the data stays contiguous in memory.
- `Mid` **A 300-bullet shooter stutters on a mid-range Android. How do you narrow it down?**
  → Check three things in order: draw calls (are bullets and enemies on one atlas), GC garbage (is the allocation timeline a sawtooth), then collision logic. Experience says the first two are usually the culprit, because 300 × 40 squared-distance checks is only 12,000 multiplications — negligible.
- `Senior` **Which numbers do you tune first when balancing a shooter, and how do you verify?**
  → Three: TTK on a regular enemy around 0.3–0.6 seconds, enemy bullet density under 40 on screen, and a wave rhythm of 6–10 seconds with a breather. I verify with a simulation under `node` in `scripts/core/` — 1000 rounds at several DPS levels, then look at win rate, because tuning by feel in the Editor costs minutes per attempt.

**60-second answer** — "How would you architect a shooter for a mini game?"

> I split it into a few systems that run in a fixed order each frame: input, spawn, bullets, enemies, collision, then juice. Each system is a flat loop ticking every object of its kind, rather than a component per bullet, because three hundred components are three hundred function calls a frame. Bullets and enemies come from pools with a hard cap — when it is full I drop the new bullet, because frame rate matters more than one projectile. Collision is squared distance rather than the physics engine, since I only need to know contact happened, not to simulate a reaction. And the wave table lives in JSON so designers tune it without a recompile.

**Where they dig**

- *"Why parallel arrays?"* → Contiguous data, no object per bullet, and swap-remove deletion in O(1).
- *"Does a hard cap hurt the feel?"* → At 300 bullets nobody notices one dropped; everybody notices 30fps.
- *"Why route dt through GameClock?"* → So hitstop and pause affect every system at once; Cocos has no `Time.timeScale`.
- *"Where do bullet patterns live?"* → Pure functions in `scripts/core/`, no `'cc'` import, so they are testable under `node` and usable in simulations.

**Red flags**

- A component per bullet and an `instantiate` per shot.
- Turning on `PhysicsSystem2D` for bullets without being able to say why a physical reaction is needed.
- Wave tables hardcoded in code.
- No cap on live objects, and no idea what happens when it is exceeded.

**Numbers and examples to know cold**

- Budget: **300 bullets**, **40 enemies**, **< 50 draw calls**.
- TTK on a regular enemy: **0.3–0.6 seconds**.
- Enemy bullet density on screen: **< 40**.
- Wave rhythm: **6–10 seconds** plus a ~2-second breather.
- Collision at 300 × 40 = **12,000** squared comparisons per frame — negligible.
