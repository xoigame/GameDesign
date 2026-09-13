---
title: Optimization & profiling
summary: Measure before you change anything, the draw-call batching rules, where JS garbage comes from, the hidden cost of update, and a budget for low-end Android.
---

The general principle — **measure first, fix second** — does not change with the engine; read [[performance]]. This node covers three Cocos-specific things: how draw calls batch, where JS garbage comes from, and the hidden cost of `update`.

One warning up front: on web and mini game, **your device lies to you**. A dev laptop holds 60fps on the worst configuration imaginable. The only number worth trusting comes from the cheap Android phone in your drawer.

## What to measure, and with what

| To learn | Tool | Look at |
|---|---|---|
| Draw calls, fps, node count | The Cocos stats panel | `draw call`, `frame time`, `game logic` |
| Which function burns CPU | Chrome DevTools → Performance | The tallest flame in a frame |
| GC garbage | DevTools → Memory → Allocation timeline | Regular sawtooth = garbage every frame |
| Texture memory | DevTools Memory, or logging `assetManager` | Total texture bytes |
| On a real device | Remote debugging via Chrome (Android), the platform IDE (mini game) | The same numbers, on the right hardware |

The working order, **never reversed**: measure → find the biggest culprit → fix **one** thing → measure again. Fix three things at once and notice it is faster, and you have learned nothing about which one mattered.

## Draw calls: the batching rule

Cocos batches two adjacent elements when they share **the same texture and the same material**. "Adjacent" means **draw order**, which is node order in the tree.

<figure class="fig">
<svg viewBox="0 0 660 230" role="img" aria-label="Two node orders compared: interleaving atlas A and B produces six draw calls, grouping by atlas produces two">
  <g class="fig-box-g">
    <rect x="10"  y="16" width="310" height="196" rx="9" class="fig-box"/>
    <rect x="340" y="16" width="306" height="196" rx="9" class="fig-box"/>
  </g>
  <text x="165" y="42"  text-anchor="middle" class="fig-label" font-size="13">Interleaved — 6 draw calls</text>
  <text x="30"  y="72"  class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="30"  y="96"  class="fig-muted" font-size="12">Label   (own texture)</text>
  <text x="30"  y="120" class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="30"  y="144" class="fig-muted" font-size="12">Sprite (atlas B)</text>
  <text x="30"  y="168" class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="30"  y="192" class="fig-muted" font-size="12">Label   (own texture)</text>
  <text x="493" y="42"  text-anchor="middle" class="fig-label" font-size="13">Grouped by atlas — 2 draw calls</text>
  <text x="360" y="72"  class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="360" y="96"  class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="360" y="120" class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="360" y="144" class="fig-muted" font-size="12">Sprite (atlas B)</text>
  <text x="360" y="168" class="fig-muted" font-size="12">Label BITMAP · Label BITMAP</text>
  <text x="360" y="196" class="fig-muted" font-size="11">both labels share the dynamic atlas → they batch</text>
</svg>
<figcaption>Same elements, different node order. That is why "grouping by meaning" costs money.</figcaption>
</figure>

What breaks batching, most common first:

1. **A sprite from another atlas in between** — group by atlas, not by logical meaning.
2. **`Label` left at `cacheMode = NONE`** — one texture per label. Static text → `BITMAP`, changing numbers → `CHAR`.
3. **`Mask`** — roughly **+2 draw calls** each, and it cuts the batch chain. Nested masks degrade fast.
4. **`Graphics`** — batches with nothing.
5. **`UIOpacity` on a parent** — the whole subtree is handled separately.

Practical budget: **under ~50 draw calls** for an H5 screen. The fastest way to find the culprit is to disable UI layers one at a time and watch how far the number drops.

## GC garbage: sources and fixes

JS garbage collection stops the world. On weak hardware, each collection is a visible hitch. Garbage comes from lines that look harmless:

| Line of code | Garbage per frame |
|---|---|
| `const v = new Vec3(...)` inside `update` | One object |
| `arr.forEach(x => ...)` inside `update` | One closure |
| `label.string = 'Score: ' + score` every frame | A new string |
| `const list = [...]` in a hot function | An array |
| `node.getComponent(Sprite)` every frame | No garbage, but wasted CPU — cache it |

Four fixes cover 95% of cases:

```ts
// 1. Reusable vectors at class level
private readonly tmp = new Vec3();

// 2. Plain for loops instead of forEach/map in hot paths
for (let i = 0; i < list.length; i++) { /* … */ }

// 3. Only touch the string when the value actually changed
if (score !== this.lastScore) { this.label.string = String(score); this.lastScore = score }

// 4. Cache components in onLoad
private sprite!: Sprite;
onLoad() { this.sprite = this.getComponent(Sprite)! }
```

How to verify: open Memory → Allocation timeline and play for 30 seconds. The line should be **nearly flat** when nothing is spawning. A regular sawtooth means per-frame garbage, and it will become stutter on weak hardware even though your laptop shows nothing.

## The hidden cost of `update`

Every component with an `update` is one function call per frame. Two hundred components each doing something small still add up to a fixed cost — and the profiler points at "engine", not at you.

Three ways to cut it:

- **Delete empty `update` methods.** An `update` that does nothing still gets called.
- **One manager ticking many objects** instead of each object ticking itself. 200 bullets should be one loop in one component, not 200 components.
- **`schedule` for anything that does not need every frame.** Regen once a second, quest checks every two seconds: `this.schedule(this.tick, 1)` instead of counting dt in `update`.

## Textures: where RAM disappears

An uncompressed 2048×2048 texture occupies roughly **16 MB** of RAM (2048 × 2048 × 4 bytes), even if the PNG on disk is 300 KB. That is the distinction beginners miss: **file size is not memory size**.

- Keep atlases at **1024 or 2048**, split per level rather than packing everything into one.
- Enable per-platform compression in the `.meta` (see [[cocos-project-structure]]).
- A large standalone background should **not** go into an atlas — it drags the whole atlas into RAM for one image.
- Release the previous level's bundle once you are sure it is unused ([[cocos-assets-bundle]]).

## A budget for low-end devices

Set the budget **up front**, measure **while building**, not two weeks before launch:

| Metric | Target for H5 / mini game on low-end Android |
|---|---|
| Draw calls per screen | < 50 |
| Nodes in the scene | < 1500 |
| Texture memory | < 120 MB |
| Garbage per frame | ~0 at idle |
| Time to a playable frame | < 5 seconds on 3G |

These numbers are a starting point for an argument, not a law. But a written budget lets you argue with data; without one, you argue with feelings.

## 🤖 Prompt for AI

**How to use AI for optimisation**

This is where AI does the most damage when used in the wrong order, because it **cannot measure**. Ask it to "optimise this" and it reflexively proposes pooling, atlases and object reuse — textbook-correct, and quite possibly unrelated to your actual culprit.

The right pattern: **you measure, it edits.**

| Delegate | Do this first |
|---|---|
| Rewriting a function to remove allocations | **Measure** and point at that exact function |
| Collapsing 200 objects into one manager tick | Confirm `update` really is the culprit |
| A CI budget check (draw calls, node count) | Agree the budget numbers |
| Bulk-switching Labels to CHAR/BITMAP | Know the current draw-call count and the target |

**Spell out** (or it optimises blind):

- **Baseline numbers**: how many draw calls, what fps, on which device.
- **The culprit you localised** — paste the profiler reading or name the hottest function.
- **The target budget**.
- **Constraints**: do not change architecture, do not change assets, only edit file X.

**Prompt template**

```
Cocos Creator 3.8.x. Measured on a 4-core, 3GB Android, battle scene:
- 32 fps, target 60
- 178 draw calls, target < 50
- DevTools Performance: 42% of frame time in EnemyController.update
  (one update component per enemy, 40 enemies live)
- Allocation timeline: ~2MB/second sawtooth

Task: collapse 40 EnemyControllers into ONE centrally ticked EnemySystem.

CONSTRAINTS:
- Do NOT change prefabs or assets; edit only scripts/game/enemy/.
- No allocation in the tick loop: reusable vectors, plain for loops.
- Preserve gameplay behaviour exactly: same speeds, same processing order.
- Afterwards, tell me which numbers to re-measure to prove it worked.
```

**Common trap:** asking AI to "optimise this file" with no measurements — it rewrites the code to be "cleaner", shifts behaviour in a couple of places, and performance does not move because the culprit was elsewhere. Second trap: proposing Web Workers or WASM for a 2D game that is spending its time on draw calls.

## 💻 Code

A budget watchdog: it complains during development instead of at launch.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 210" role="img" aria-label="Inspector for BudgetWatch showing draw call, node count and fps thresholds plus a check interval">
  <g class="fig-box-g">
    <rect x="10" y="16" width="636" height="178" rx="9" class="fig-box"/>
  </g>
  <text x="30"  y="40"  class="fig-muted" font-size="11">INSPECTOR — BudgetWatch (on GameRoot, dev builds only)</text>
  <text x="30"  y="72"  class="fig-label" font-size="13">Max Draw Calls</text>
  <text x="300" y="72"  class="fig-muted" font-size="12">50</text>
  <text x="30"  y="100" class="fig-label" font-size="13">Max Nodes</text>
  <text x="300" y="100" class="fig-muted" font-size="12">1500</text>
  <text x="30"  y="128" class="fig-label" font-size="13">Min FPS</text>
  <text x="300" y="128" class="fig-muted" font-size="12">50</text>
  <text x="30"  y="156" class="fig-label" font-size="13">Check Every (s)</text>
  <text x="300" y="156" class="fig-muted" font-size="12">2</text>
  <text x="380" y="72"  class="fig-muted" font-size="11">Over budget → one warning per kind per scene,</text>
  <text x="380" y="92"  class="fig-muted" font-size="11">with the scene name and the reading, so the console stays readable.</text>
  <text x="380" y="128" class="fig-muted" font-size="11">Disable this component in release builds.</text>
</svg>
<figcaption>A budget only works when it complains on its own. A budget in a document is a budget nobody reads.</figcaption>
</figure>

**Script**

```ts
// BudgetWatch.ts — watches the performance budget during development. Dev builds only.
import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BudgetWatch')
export class BudgetWatch extends Component {
    @property maxDrawCalls = 50;
    @property maxNodes = 1500;
    @property minFps = 50;
    @property checkEvery = 2;

    private frames = 0;
    private elapsed = 0;
    private warned = new Set<string>();

    onEnable() { this.frames = 0; this.elapsed = 0; this.warned.clear(); }

    update(dt: number) {
        this.frames++;
        this.elapsed += dt;
        if (this.elapsed < this.checkEvery) return;

        const fps = this.frames / this.elapsed;
        const scene = director.getScene()?.name ?? '?';
        const nodes = this.countNodes(director.getScene() as unknown as Node);
        const draws = (director.root as any)?.device?.numDrawCalls ?? -1;

        if (fps < this.minFps) this.warn('fps', `${scene}: ${fps.toFixed(1)} fps (limit ${this.minFps})`);
        if (nodes > this.maxNodes) this.warn('nodes', `${scene}: ${nodes} nodes (limit ${this.maxNodes})`);
        if (draws > this.maxDrawCalls) this.warn('draw', `${scene}: ${draws} draw calls (limit ${this.maxDrawCalls})`);

        this.frames = 0;
        this.elapsed = 0;
    }

    /** One warning per kind per scene — a clean console is a console people read. */
    private warn(kind: string, msg: string) {
        const key = kind + '|' + (director.getScene()?.name ?? '');
        if (this.warned.has(key)) return;
        this.warned.add(key);
        console.warn('[BUDGET] ' + msg);
    }

    private countNodes(root: Node | null): number {
        if (!root) return 0;
        let n = 1;
        for (const c of root.children) n += this.countNodes(c);
        return n;
    }
}
```

**Try it**
- Set `maxDrawCalls = 1`: you must see exactly **one** warning for the current scene, not one every two seconds.
- Change scene and come back: the warning appears once more, for the new scene.
- Turn on the Cocos stats panel and compare: the two draw-call numbers must agree.

## 🎤 Interview

**Questions you will get**

- `Junior` **What is a draw call, and what raises it in Cocos UI?**
  → A draw call is one command submitted to the GPU; Cocos batches adjacent elements that share a texture and a material. It goes up with sprites from another atlas in between, `Label` left at `cacheMode = NONE`, `Mask` (about +2 each) and `Graphics` — all of which cut the batch chain.
- `Mid` **The game drops frames on a mid-range Android. What is your first step?**
  → Change nothing until there are numbers: stats panel on that exact weak device, record fps, draw calls and frame time, then DevTools Performance for the tallest flame. The reason is simple — a dev laptop holds 60fps on the worst configuration there is, so conclusions drawn there are worthless.
- `Senior` **Regular stutter every few seconds while average fps stays high. What is happening?**
  → Almost certainly GC: garbage accumulating every frame until the engine collects and stops the world. A sawtooth in the Memory allocation timeline confirms it. The usual culprits are `new Vec3` inside `update`, closures from `forEach`, or assigning `label.string` every frame even when the value has not changed.

**60-second answer** — "The game drops frames. What do you do first?"

> I change nothing until I have numbers. Turn on the stats panel on the weakest device we support and record three values: fps, draw calls, frame time. Then DevTools Performance to see the tallest flame in a frame, and the Memory allocation timeline to check for sawtooth. That usually points at one of three groups: too many draw calls from interleaved atlases and masks, per-frame garbage from allocating inside update, or a fixed cost from hundreds of components each having an update. I fix **one** thing and re-measure, because fixing three at once teaches me nothing about which mattered. And I only trust numbers from real hardware — a dev laptop runs smoothly on the worst configuration there is.

**Where they dig**

- *"Regular stutter with a high average — what is that?"* → GC. Check the allocation timeline and hunt allocations in hot loops.
- *"180 draw calls in UI — where do you cut?"* → Masks first (+2 each and they break batching), then Labels from `NONE` to `BITMAP`/`CHAR`, then reorder nodes by atlas.
- *"How much RAM does an uncompressed 2048 texture use?"* → About 16 MB, no matter that the PNG is a few hundred KB.
- *"What about 200 components with `update`?"* → A fixed per-frame cost. Collapse them into one manager tick, and delete every empty `update`.

**Red flags**

- Proposing fixes before measuring.
- "I turned on pooling and atlases and it felt smoother" with no before/after numbers.
- Drawing performance conclusions from the dev machine.
- Not distinguishing file size from texture memory.

**Numbers and examples to know cold**

- Low-end H5 budget: **< 50 draw calls**, **< 1500 nodes**, **< 120 MB** textures.
- Each `Mask` ≈ **+2 draw calls**.
- An uncompressed 2048×2048 texture ≈ **16 MB** of RAM.
- `Label`: static → `BITMAP`, changing numbers → `CHAR`.
- The loop: **measure → fix one thing → measure again**.
