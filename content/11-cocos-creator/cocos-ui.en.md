---
title: UI & multi-resolution
summary: Canvas and design resolution, anchoring to the real screen edge with Widget, Layout, Label traps, long ScrollViews, and where UI burns draw calls.
---

UI eats most of the time on an H5 or mini game, and it is also where performance evaporates fastest. This node is about **three things that always travel together**: screen ratio, anchoring, and the draw calls your anchoring produces.

HUD design principles do not change with the engine — read [[ux-hud]] and [[ui-design]] first. This node only covers the Cocos half.

## Lock the ratio first, build screens second

`Canvas` has a **design resolution** plus two checkboxes, `Fit Width` and `Fit Height`. Four combinations, four behaviours:

| Fit Width | Fit Height | Result | Use when |
|---|---|---|---|
| ✓ | ✗ | Width fixed, height flexes | **Portrait games** — phones vary in height, from 16:9 to 21:9 |
| ✗ | ✓ | Height fixed, width flexes | **Landscape games** |
| ✓ | ✓ | Content always fits, empty bars possible | A board or card table that must be fully visible |
| ✗ | ✗ | Fills the screen, crops the overflow | Decorative backgrounds — never put anything important near the edge |

Convention: **720×1280** portrait, **1280×720** landscape, tick one axis.

The most important and most-ignored point: **design resolution is not the real screen**. Placing HUD elements at coordinates derived from the design resolution is a reliable way to push a button off-screen on a 20:9 device. Anything that touches an edge must be anchored with `Widget`.

## Widget: anchor to the real edge

`Widget` is a separate component you add:

```ts
const w = node.addComponent(Widget);
w.isAlignTop = true;  w.top = 24;
w.isAlignLeft = true; w.left = 16;
w.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
```

Three things to remember:

- **`alignMode`**: `ONCE` computes once (cheapest, for things that never move), `ON_WINDOW_RESIZE` recomputes on rotation, `ALWAYS` recomputes **every frame** — only worth it when the parent genuinely resizes continuously. `ALWAYS` on a few dozen nodes is an invisible tax.
- **Widget anchors to the parent node**, not to the screen. If the parent is smaller than the screen, "align right" means the parent's right edge.
- **Widget fights Layout**: a node that is both inside a `Layout` and carries a `Widget` will be tugged two ways. Pick one.

Notches and status bars: add the **`SafeArea`** component to the node holding your top HUD. Without it, on a notched iPhone the back button sits under the notch.

## UITransform: there is no `node.width`

This is the 2.x → 3.x difference that trips up returning developers most:

```ts
// WRONG (2.x): this.node.width = 200
const ui = this.node.getComponent(UITransform)!;
ui.setContentSize(200, 80);
ui.anchorPoint = new Vec2(0.5, 0.5);   // where the origin sits inside the box
```

`UITransform` is also what defines the **touch area**. A node without `UITransform`, or with a zero `contentSize`, will never fire `node.on(Node.EventType.TOUCH_START)` — and nothing is logged.

## Label traps, including accented text

`Label` has three cache modes; the wrong one costs frames or characters:

| cacheMode | How it works | Use for |
|---|---|---|
| `NONE` (default) | Each Label gets its own texture | Small amounts of rarely-changing text |
| `BITMAP` | Packed into the shared dynamic atlas | **Static text** — titles, button labels |
| `CHAR` | Per-character atlas, reused | **Fast-changing numbers** — score, timer, combo |

Setting `CHAR` on a countdown timer is one of the cheapest wins available: no more rebuilding a texture every second.

**The accent trap:** bitmap fonts (BMFont) are exported for a fixed character set — miss `ế`, `ượ` or `ỹ` and you get empty boxes. Two fixes: export the BMFont with the full Vietnamese set (uppercase accents included), or use a TTF and accept the texture-building cost. Test with one string kept in the project for exactly this:

```
ĂÂĐÊÔƠƯ ăâđêôơư ạảấầẩẫậắằẳẵặ ẹẻẽếềểễệ ịỉĩ ọỏốồổỗộớờởỡợ ụủứừửữự ỳỵỷỹ
```

On a mini game platform the system font may **differ** from the one on your machine — test on a real device before locking a layout to text width.

## Long ScrollViews: cells must be recycled

The built-in `ScrollView` uses a `Mask` to clip. Every `Mask` costs about **2 extra draw calls** and breaks the batch chain — so a 300-row list of multi-node rows is the fastest route to a frame-rate collapse.

Rule: **past roughly 30 cells, recycle** (virtual list). Create only enough cells to cover the viewport plus two spares; as you scroll, rebind the data of cells that left the frame. Full code in the 💻 section.

Other ScrollView details worth knowing: turn off `Inertia` for short lists so they feel decisive; a `Brake` around 0.75 feels natural to most players; and if cells contain buttons, leave a drag threshold, or scrolling turns into accidental taps.

## Where UI burns draw calls

In rough order, heaviest first:

1. **Nested masks** — +2 draw calls each, and they break batching.
2. **Sprites from different atlases interleaved** — node order decides the draw-call count. Group by atlas, not by meaning.
3. **A `NONE` Label between two sprites from the same atlas** — it splits the batch chain.
4. **`Graphics`** — batches with nothing.
5. **`UIOpacity` on a parent** — forces the subtree to be handled separately; fine for fading a whole panel, wrong as a default on every node.

Practical budget: **under ~50 draw calls** for an H5 screen. Measure with the stats panel and toggle UI layers to find the expensive one — see [[cocos-optimization]].

## 🤖 Prompt for AI

**How to use AI for UI**

AI builds UI **structure and logic** quickly, but it **cannot see your scene**, so anything about visual layout is guesswork. Split the work along exactly that line:

| Delegate | Do it yourself |
|---|---|
| UI controllers: data binding, popup open/close, notification queues | Dragging the layout together in the Editor |
| Virtual lists, cell pools, data adapters | Choosing the design resolution and Fit checkboxes |
| Adding `Widget`/`SafeArea` from script when building dynamically | Node ordering (it cannot see it, so it cannot optimise draw calls) |
| Checking translation strings, generating a BMFont character set | Confirming on a real device |

**Spell out** (or you get web-style UI):

- **Design resolution and orientation**, `Fit Width` or `Fit Height`.
- **What `Widget` anchors to** — top, bottom, centre; whether `SafeArea` is involved.
- **How many rows the list has** — past 30, say explicitly that it must be virtualised.
- **The draw-call budget** for that screen.
- **Fonts**: TTF or BMFont, and whether full Vietnamese accents are needed.

**Prompt template**

```
Cocos Creator 3.8.x, TypeScript strict. Portrait game, design resolution 720x1280,
Canvas has Fit Width ticked. The top HUD lives inside a node with SafeArea.

Task: write a `RankingList` component for a 500-row leaderboard in a ScrollView.

CONSTRAINTS:
- MUST recycle cells (virtual list): at most 12 cell nodes exist, whether 500 or 5000 rows.
- Cell sizing through UITransform.setContentSize; never node.width/height (2.x API).
- No allocation inside update() or inside the scroll callback.
- Score labels use cacheMode = CHAR; name labels use BITMAP.
- Cells come from a pool and return to it when they leave the frame — never destroy.
- No find() by path string; every reference through @property.

First tell me which @property slots you need and how one cell's node tree is shaped.
```

**Common trap:** AI produces 2.x code for UI more than for any other area, because most UI examples online are 2.x — the tells are `node.width`, `cc.Sprite`, `cc.Label`. Second trap: it builds the list by instantiating all 500 rows in a loop, which runs fine on your machine and dies on a 3GB phone.

## 💻 Code

A virtual list: 500 rows, only about 12 live nodes. This is the most useful snippet in the node.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Hierarchy: a ScrollView containing view and content; Inspector for RankingList showing cell prefab, cell height, spacing and buffer">
  <g class="fig-box-g">
    <rect x="10"  y="16" width="280" height="268" rx="9" class="fig-box"/>
    <rect x="320" y="16" width="326" height="268" rx="9" class="fig-box"/>
  </g>
  <text x="26"  y="40"  class="fig-muted" font-size="11">HIERARCHY</text>
  <text x="26"  y="68"  class="fig-label" font-size="13">▾ Canvas</text>
  <text x="42"  y="92"  class="fig-label" font-size="13">▾ ScrollView   ← RankingList.ts</text>
  <text x="58"  y="116" class="fig-muted" font-size="12">▾ view  (Mask)</text>
  <text x="74"  y="140" class="fig-muted" font-size="12">content  (UITransform)</text>
  <text x="42"  y="170" class="fig-label" font-size="13">cell.prefab</text>
  <text x="58"  y="194" class="fig-muted" font-size="12">Label Rank (CHAR)</text>
  <text x="58"  y="218" class="fig-muted" font-size="12">Label Name (BITMAP)</text>
  <text x="58"  y="242" class="fig-muted" font-size="12">Label Score (CHAR)</text>
  <text x="336" y="40"  class="fig-muted" font-size="11">INSPECTOR — RankingList</text>
  <text x="336" y="68"  class="fig-label" font-size="13">Scroll</text>
  <text x="580" y="68"  class="fig-muted" font-size="12">ScrollView</text>
  <text x="336" y="96"  class="fig-label" font-size="13">Cell Prefab</text>
  <text x="580" y="96"  class="fig-muted" font-size="12">cell.prefab</text>
  <text x="336" y="124" class="fig-label" font-size="13">Cell Height</text>
  <text x="580" y="124" class="fig-muted" font-size="12">96</text>
  <text x="336" y="152" class="fig-label" font-size="13">Spacing</text>
  <text x="580" y="152" class="fig-muted" font-size="12">8</text>
  <text x="336" y="180" class="fig-label" font-size="13">Buffer</text>
  <text x="580" y="180" class="fig-muted" font-size="12">2</text>
  <text x="336" y="222" class="fig-muted" font-size="11">content has NO Layout — the script positions cells itself.</text>
</svg>
<figcaption>The <code>content</code> height is computed in code from the row count; <code>Layout</code> must stay off or it will fight the script for control.</figcaption>
</figure>

**Script**

```ts
// RankingList.ts — virtual list: 500 rows, at most ~12 live nodes.
import { _decorator, Component, Node, Prefab, ScrollView, UITransform, Vec3, Label, instantiate } from 'cc';
const { ccclass, property } = _decorator;

export interface RankRow { rank: number; name: string; score: number }

@ccclass('RankingList')
export class RankingList extends Component {
    @property(ScrollView) scroll: ScrollView = null!;
    @property(Prefab) cellPrefab: Prefab = null!;
    @property cellHeight = 96;
    @property spacing = 8;
    @property buffer = 2;

    private rows: RankRow[] = [];
    private pool: Node[] = [];
    private inUse = new Map<number, Node>();   // row index -> visible node
    private step = 0;
    private viewH = 0;
    private readonly tmp = new Vec3();

    onLoad() {
        this.step = this.cellHeight + this.spacing;
        this.viewH = this.scroll.node.getComponent(UITransform)!.height;
    }

    onEnable() { this.scroll.node.on('scrolling', this.refresh, this); }
    onDisable() { this.scroll.node.off('scrolling', this.refresh, this); }

    /** Feed data. Call it as often as you like; it never creates extra nodes. */
    setData(rows: RankRow[]) {
        this.rows = rows;
        const content = this.scroll.content!.getComponent(UITransform)!;
        content.setContentSize(content.width, Math.max(this.viewH, rows.length * this.step));
        for (const [i, n] of this.inUse) { this.pool.push(n); n.active = false; this.inUse.delete(i) }
        this.refresh();
    }

    private refresh() {
        if (!this.rows.length) return;
        const top = this.scroll.content!.position.y;            // >= 0, grows as you scroll down
        const first = Math.max(0, Math.floor(top / this.step) - this.buffer);
        const last = Math.min(this.rows.length - 1,
            Math.floor((top + this.viewH) / this.step) + this.buffer);

        // return rows that left the viewport
        for (const [i, n] of this.inUse) {
            if (i < first || i > last) { n.active = false; this.pool.push(n); this.inUse.delete(i) }
        }
        // check out cells for rows that just entered
        for (let i = first; i <= last; i++) {
            if (this.inUse.has(i)) continue;
            const n = this.pool.pop() ?? this.makeCell();
            n.active = true;
            this.tmp.set(0, -i * this.step, 0);
            n.setPosition(this.tmp);
            this.bind(n, this.rows[i]);
            this.inUse.set(i, n);
        }
    }

    private makeCell(): Node {
        const n = instantiate(this.cellPrefab);
        n.setParent(this.scroll.content!);
        return n;
    }

    private bind(cell: Node, row: RankRow) {
        cell.getChildByName('Rank')!.getComponent(Label)!.string = String(row.rank);
        cell.getChildByName('Name')!.getComponent(Label)!.string = row.name;
        cell.getChildByName('Score')!.getComponent(Label)!.string = row.score.toLocaleString('en-US');
    }
}
```

**Try it**
- Call `setData` with 500 rows: `scroll.content.children.length` must read roughly **10–14**, not 500.
- Scroll from top to bottom and count again: the number must not grow.
- Turn on the stats panel: draw calls must **stay flat** while scrolling. Stepping up per row means your cells are pulling from different atlases.

## 🎤 Interview

**Questions you will get**

- `Junior` **What is a design resolution? For a portrait game, do you tick `Fit Width` or `Fit Height`, and why?**
  → It is the reference frame you lay UI out in, say 720×1280 — not the real screen size. Portrait games tick `Fit Width` because width is the dimension you want fixed, while height is what varies across phones from 16:9 to 21:9.
- `Mid` **A 500-row leaderboard stutters while scrolling on a mid-range phone. How do you fix it?**
  → Building all 500 rows is thousands of nodes plus the ScrollView's `Mask`, so cells have to be recycled: keep about 12 nodes covering the viewport plus two spares and rebind data as you scroll. Verify by reading `content.children.length` — it must be 10–14, not 500.
- `Senior` **A UI screen sits at 180 draw calls. How do you get it under 50, and in what order?**
  → Masks first, since each costs about 2 draw calls and breaks the batch chain, nested ones worst of all. Then switch `Label` from `NONE` to `BITMAP` for static text and `CHAR` for changing numbers. Finally reorder nodes by atlas, because one sprite from another atlas in between breaks batching — and re-measure after each step instead of changing all three and guessing.

**60-second answer** — "How do you make UI work on every screen ratio?"

> I lock the design resolution before building any screen: 720×1280 for portrait, with `Fit Width` ticked, because the dimension that varies across phones is height, from 16:9 out to 21:9. From there the rule is that anything touching a screen edge is anchored with `Widget` to the real edge, never placed at coordinates derived from the design resolution, and the top HUD sits inside a node with `SafeArea` so it clears the notch. I leave `alignMode` at `ON_WINDOW_RESIZE`, never `ALWAYS` unless the parent genuinely resizes every frame. Then I verify: switch the preview to 4:3 and to 20:9 — if it only looks right at one ratio I anchored it wrong, and that never shows up on my own device.

**Where they dig**

- *"What does `ALWAYS` cost?"* → Recomputing every widget's position every frame. A few dozen nodes is a fixed tax the profiler will not point at directly.
- *"Why does a 500-row list stutter?"* → Thousands of nodes and several masks. Fix it with a virtual list holding a dozen or so cells.
- *"What does each `Mask` cost?"* → Around 2 draw calls, plus a broken batch chain — so nesting masks degrades quickly.
- *"Why do Vietnamese characters render as boxes?"* → The BMFont is missing accented glyphs. Export the full set, or use a TTF; and keep a full-accent test string in the project.

**Red flags**

- Placing UI at absolute coordinates and then "nudging it until it looks right on my phone".
- Not knowing masks cost draw calls, or using a `Mask` just to round corners.
- Answering "I raised the cell count to make it smoother" instead of recycling cells.
- Using `node.width` — 2.x API, an instant tell that the knowledge came from old docs.

**Numbers and examples to know cold**

- 720×1280 portrait / 1280×720 landscape; portrait ticks `Fit Width`.
- Each `Mask` ≈ **+2 draw calls**.
- Virtualisation threshold: about **30 cells**.
- Fast-changing numeric `Label` → `cacheMode = CHAR`; static text → `BITMAP`.
- Draw-call budget for an H5 screen: **under ~50**.
