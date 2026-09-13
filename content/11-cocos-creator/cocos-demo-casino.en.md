---
title: Demo — casino game
summary: Building slots and card games in Cocos: the server decides, the client only animates, weight tables with a computable RTP, and the legal line to settle first.
---

Casino is the largest genre in Asian H5 and mini game catalogues, and also the one **most often built wrong technically** — because most tutorials let the client roll the result and display it.

This node uses a **slot machine** as the main example, with a separate section on card games. Randomness theory lives in [[randomness]] and economy in [[economy-design]]; this is the Cocos implementation.

## Settle the boundary before the first line of code

| Category | What it means | Consequence |
|---|---|---|
| **Social casino** | Play with virtual currency, **no cash-out** | This node's scope |
| **Real-money gambling** | Real stakes and real withdrawals | Requires licensing, independent RNG certification and per-country compliance — **out of scope here** |

Three things hold even for social casino; do not skip them because "it is only virtual currency":

- **App stores and super apps have specific policies** for this genre, with age gates and regional restrictions. Read them before you build, not before you ship.
- **Never display odds that are not true.** If the game advertises "95% win rate", that number must come from the actual weight table.
- **Do not engineer false probability cues**: fake near-misses (deliberately stopping just past the jackpot when the result was already a loss) are scrutinised in many markets. Build tension through spin rhythm and sound, not by lying about probability.

## Rule number one: the server decides, the client performs

This is the difference between a demo and a product.

<figure class="fig">
<svg viewBox="0 0 660 240" role="img" aria-label="The client requests a spin, the server draws the result from a weight table and writes the ledger, then returns the settled outcome; the client only animates the reels to land on it">
  <defs>
    <marker id="cdc-a-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="90"  width="160" height="66" rx="9" class="fig-box"/>
    <rect x="250" y="20"  width="180" height="60" rx="9" class="fig-box"/>
    <rect x="250" y="160" width="180" height="60" rx="9" class="fig-box"/>
    <rect x="500" y="90"  width="146" height="66" rx="9" class="fig-box"/>
  </g>
  <text x="90"  y="116" text-anchor="middle" class="fig-label" font-size="13">Client</text>
  <text x="90"  y="136" text-anchor="middle" class="fig-muted" font-size="11">sends "I want to spin"</text>
  <text x="340" y="46"  text-anchor="middle" class="fig-label" font-size="13">Server: draw result</text>
  <text x="340" y="65"  text-anchor="middle" class="fig-muted" font-size="11">weight table · seed · RNG</text>
  <text x="340" y="186" text-anchor="middle" class="fig-label" font-size="13">Server: write ledger</text>
  <text x="340" y="205" text-anchor="middle" class="fig-muted" font-size="11">debit bet · credit win · idempotent</text>
  <text x="573" y="116" text-anchor="middle" class="fig-label" font-size="13">Client animates</text>
  <text x="573" y="136" text-anchor="middle" class="fig-muted" font-size="11">spins, LANDS on the result</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cdc-a-en)" fill="none">
    <path d="M170 110 Q210 110 210 50 H246"/>
    <path d="M340 80 V156"/>
    <path d="M430 190 Q466 190 466 123 H496"/>
  </g>
</svg>
<figcaption>The client never learns the outcome before the server settles it, and never decides it. The animation is just how a finished story gets told.</figcaption>
</figure>

Three practical consequences, all mandatory:

1. **The client sends intent** (`spin` with a stake), **the server returns the outcome** (stop positions, win amount, new balance).
2. **Every call carries a UNIQUE `request_id`** — a lost connection and a retap must not debit twice. See idempotency in [[backend-go]].
3. **Append-only ledger**: each spin is an immutable row, so disputes can be reconciled.

Why so strict: a mini game's JS bundle sits on the player's device, readable and editable. Anything the client decides is something the client can change.

## Reel strips and weight tables

A slot does not randomise symbols — it randomises a **stop position on a reel strip**. The data:

```json
// assets/data/slot.json — CLIENT-side only, for rendering; the real table lives on the server
{
  "reels": [
    ["cherry","bell","seven","cherry","bar","cherry","bell","seven","bar","cherry"],
    ["bell","cherry","bar","seven","cherry","bell","bar","cherry","seven","bell"],
    ["seven","cherry","bell","bar","cherry","seven","bell","cherry","bar","bell"]
  ],
  "paylines": [[1,1,1],[0,0,0],[2,2,2],[0,1,2],[2,1,0]],
  "payouts": { "seven3": 200, "bar3": 50, "bell3": 20, "cherry3": 10, "cherry2": 2 }
}
```

How often a symbol appears on the strip **is** its probability. If you want `seven` to be rare, give it one slot in twenty — do not write `if (random < 0.05)` somewhere, because that makes the paytable impossible to compute.

## RTP: a computed number, not a feeling

**RTP** (return to player) is the share of wagered money returned over an infinite number of spins. It is a **consequence** of the reel strips and the paytable, not a parameter you tune on its own.

Two ways to get it — do both:

- **Compute it exactly** when the combination count is small: 3 reels × 20 slots = 8,000 combinations, milliseconds to enumerate.
- **Simulate** 10 million spins under `node` to confirm the exact figure and to see **variance**: two tables with the same 92% RTP can feel completely different, one paying small wins constantly, the other silent for a long time then exploding.

Both run in `scripts/core/` with no `'cc'` import ([[cocos-project-structure]]), which makes them **tests**, not manual work.

Changing one slot on a strip changes the RTP. So the reel table belongs in CI: a test pinning RTP to a range, and anyone who shifts it turns the build red.

## Client: spinning so it lands exactly right

The problem: the server says "reel 0 stops at 7, reel 1 at 2, reel 2 at 5", and the client has to spin attractively and stop **precisely** there.

The cleanest approach is to animate by **distance**, not by time:

1. Final position = `(whole spins) × strip length + target slot`.
2. Tween from the current position to that one with `quintOut`, or a gentle `backOut`.
3. Stagger the reels by 0.2–0.3 seconds each to create rhythm.

Three details produce the "real machine" feel:

- **The last reel spins slightly longer** — that is where the tension lives.
- **A small bounce on stop** (`backOut` with a low amplitude) reads as mechanical.
- **A tick sound per slot passing**, thinning out as it slows. That detail does more work than any particle effect.

## Card games: three things that differ from slots

For rummy, poker or regional card games, three differences matter:

- **Shuffle and deal on the server.** The client only knows its own hand. Sending the whole deck and "hiding it in the UI" is a security bug, not a UI decision.
- **Shuffle correctly**: Fisher–Yates with a secure random source on the server. The client's `Math.random()` must never decide cards.
- **Round state must be recoverable.** Players drop connection mid-round constantly; the server holds the state and the client resyncs on rejoin — the hardest part of multiplayer card games.

Game rules belong in `scripts/core/` so they run both on the client (previewing legal moves) and on the server (adjudicating) — but **the server is always the final arbiter**.

## 🤖 Prompt for AI

**How to use AI for casino games**

AI writes slot maths well because it is **verifiable by simulation**, but it has exactly one dangerous habit: **letting the client roll the result**, because every tutorial does. Forbid it explicitly in the prompt.

| Delegate | You decide |
|---|---|
| Exact RTP computation plus a 10-million-spin simulation | The reel strips and paytable (that is design) |
| Fisher–Yates, weighted selection, statistical tests | Stake levels, caps, reward cadence |
| Client code: spinning reels, landing exactly, win effects | Legal boundaries and platform policy |
| Idempotency flow, ledger, round recovery | Target RTP and variance level |

**Spell out** (or it rolls client-side):

- **Whether there is a server**, and what it decides — say plainly "the client must NOT roll".
- **Target RTP** and the acceptable range.
- **The real reel table**, or at least its dimensions.
- **Stake levels and caps**.
- **This is social casino with virtual currency** — so it does not generate real payment code.

**Prompt template**

```
Cocos Creator 3.8.x + a Go backend. Social casino, VIRTUAL currency, no cash-out.
Slot with 3 reels × 20 slots, 5 paylines. Target RTP 92% (acceptable 91.5–92.5%).

Task: write scripts/core/slot.ts (NO 'cc' import) with:
  evaluate(stops, reels, paylines, payouts, bet): number    // win amount
  exactRTP(reels, paylines, payouts, bet): number           // enumerate all combinations
  simulate(n, seed, ...): { rtp, hitRate, maxWin, variance }

CONSTRAINTS:
- PURE functions, no side effects, testable with `node --test`.
- Seeded RNG so simulations are reproducible (xorshift or mulberry32), NOT Math.random.
- NO code that decides an outcome on the client — the client only receives stops.
- Include tests: exactRTP within 91.5–92.5%, and simulate(10_000_000) within 0.3% of it.
- Generate no payment code; currency is server-managed.

Write the tests FIRST, then the functions.
```

**Common trap:** AI emits `Math.random()` on the client and shows the result — correct in a demo, and a serious hole the moment virtual currency can be bought with real money. Second trap: it "tunes RTP" by multiplying the final win by a factor, which makes the paytable impossible to compute and every advertised number wrong.

## 💻 Code

The maths of a slot: pure, testable, runnable under `node`. This has to be right before you think about effects.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Diagram: slot.ts in scripts/core is shared by the Go server and the Cocos client; node tests pin the RTP">
  <defs>
    <marker id="cdc-b-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="240" y="96" width="180" height="62" rx="9" class="fig-box"/>
    <rect x="20"  y="16" width="180" height="52" rx="9" class="fig-box"/>
    <rect x="20"  y="186" width="180" height="52" rx="9" class="fig-box"/>
    <rect x="460" y="16" width="180" height="52" rx="9" class="fig-box"/>
    <rect x="460" y="186" width="180" height="52" rx="9" class="fig-box"/>
  </g>
  <text x="330" y="122" text-anchor="middle" class="fig-label" font-size="13">core/slot.ts</text>
  <text x="330" y="142" text-anchor="middle" class="fig-muted" font-size="11">pure functions, no 'cc' import</text>
  <text x="110" y="38"  text-anchor="middle" class="fig-label" font-size="12">Server (decides)</text>
  <text x="110" y="56"  text-anchor="middle" class="fig-muted" font-size="10">draws stops · writes ledger</text>
  <text x="110" y="208" text-anchor="middle" class="fig-label" font-size="12">node --test</text>
  <text x="110" y="226" text-anchor="middle" class="fig-muted" font-size="10">pins RTP in CI</text>
  <text x="550" y="38"  text-anchor="middle" class="fig-label" font-size="12">Cocos client</text>
  <text x="550" y="56"  text-anchor="middle" class="fig-muted" font-size="10">animates and highlights lines</text>
  <text x="550" y="208" text-anchor="middle" class="fig-label" font-size="12">10M-spin simulation</text>
  <text x="550" y="226" text-anchor="middle" class="fig-muted" font-size="10">reads RTP and variance</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cdc-b-en)" fill="none">
    <path d="M200 42 Q270 42 290 92"/>
    <path d="M200 212 Q270 212 290 162"/>
    <path d="M420 110 Q480 110 490 72"/>
    <path d="M420 144 Q480 144 490 182"/>
  </g>
</svg>
<figcaption>One maths file shared three ways. Only the server is allowed to call the draw.</figcaption>
</figure>

**Script**

```ts
// scripts/core/slot.ts — slot maths. NO 'cc' import. Runs under node.
export type Reels = string[][];
export type Paylines = number[][];          // per line: which row is picked on each reel (0..2)
export type Payouts = Record<string, number>;

/** Seeded RNG so simulations are reproducible. NEVER Math.random for anything money-related. */
export function mulberry32(seed: number) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** The three visible slots of a reel stopped at `stop`. */
export function windowAt(reel: string[], stop: number): [string, string, string] {
    const n = reel.length;
    return [reel[stop % n], reel[(stop + 1) % n], reel[(stop + 2) % n]];
}

/** Win for one spin. `stops` is drawn by the SERVER. */
export function evaluate(stops: number[], reels: Reels, lines: Paylines, pay: Payouts, bet: number): number {
    const grid = stops.map((s, i) => windowAt(reels[i], s));
    let win = 0;
    for (const line of lines) {
        const a = grid[0][line[0]], b = grid[1][line[1]], c = grid[2][line[2]];
        if (a === b && b === c) win += (pay[a + '3'] ?? 0) * bet;
        else if (a === b && a === 'cherry') win += (pay['cherry2'] ?? 0) * bet;
    }
    return win;
}

/** Exact RTP: enumerate EVERY combination. 3 × 20 = 8,000 — milliseconds. */
export function exactRTP(reels: Reels, lines: Paylines, pay: Payouts, bet = 1): number {
    const [r0, r1, r2] = reels.map((r) => r.length);
    let total = 0;
    for (let a = 0; a < r0; a++)
        for (let b = 0; b < r1; b++)
            for (let c = 0; c < r2; c++) total += evaluate([a, b, c], reels, lines, pay, bet);
    return total / (r0 * r1 * r2 * bet);
}

/** Simulation: confirms the exact RTP and exposes variance — what actually shapes the feel. */
export function simulate(spins: number, seed: number, reels: Reels, lines: Paylines, pay: Payouts, bet = 1) {
    const rnd = mulberry32(seed);
    const stops = [0, 0, 0];
    let paid = 0, hits = 0, maxWin = 0, sumSq = 0;
    for (let i = 0; i < spins; i++) {
        for (let r = 0; r < 3; r++) stops[r] = Math.floor(rnd() * reels[r].length);
        const w = evaluate(stops, reels, lines, pay, bet);
        paid += w; sumSq += w * w;
        if (w > 0) hits++;
        if (w > maxWin) maxWin = w;
    }
    const mean = paid / spins;
    return {
        rtp: paid / (spins * bet),
        hitRate: hits / spins,
        maxWin,
        variance: sumSq / spins - mean * mean,
    };
}
```

```ts
// scripts/core/slot.test.ts — run: node --test
import { test } from 'node:test';
import assert from 'node:assert';
import { exactRTP, simulate } from './slot';

const reels = [
    ['cherry','bell','seven','cherry','bar','cherry','bell','seven','bar','cherry'],
    ['bell','cherry','bar','seven','cherry','bell','bar','cherry','seven','bell'],
    ['seven','cherry','bell','bar','cherry','seven','bell','cherry','bar','bell'],
];
const lines = [[1,1,1],[0,0,0],[2,2,2],[0,1,2],[2,1,0]];
const pay = { seven3: 200, bar3: 50, bell3: 20, cherry3: 10, cherry2: 2 };

test('RTP stays inside the range agreed with design', () => {
    const rtp = exactRTP(reels, lines, pay);
    assert.ok(rtp > 0.60 && rtp < 1.20, `RTP out of range: ${(rtp * 100).toFixed(2)}%`);
});

test('simulation matches the exact figure', () => {
    const exact = exactRTP(reels, lines, pay);
    const sim = simulate(2_000_000, 12345, reels, lines, pay);
    assert.ok(Math.abs(sim.rtp - exact) < 0.01, `off by ${(Math.abs(sim.rtp - exact) * 100).toFixed(2)}%`);
});

test('same seed reproduces the same run', () => {
    const a = simulate(100_000, 7, reels, lines, pay);
    const b = simulate(100_000, 7, reels, lines, pay);
    assert.deepStrictEqual(a, b);
});
```

```ts
// ReelView.ts — the client ONLY animates. Not a single random call here.
import { _decorator, Component, Node, Vec3, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ReelView')
export class ReelView extends Component {
    @property(Node) strip: Node = null!;      // node holding the slot cells, stacked vertically
    @property cellHeight = 120;
    @property stripLength = 10;
    @property spins = 4;                      // whole revolutions before stopping
    @property duration = 1.4;

    private readonly tmp = new Vec3();

    /** `stop` comes from the SERVER. This method's only job is to land on it. */
    spinTo(stop: number, extraDelay = 0): Promise<void> {
        return new Promise((resolve) => {
            Tween.stopAllByTarget(this.strip);
            const loop = this.stripLength * this.cellHeight;
            const startY = this.strip.position.y;
            const targetY = startY - (this.spins * loop + stop * this.cellHeight);

            this.tmp.set(this.strip.position.x, targetY, 0);
            tween(this.strip)
                .delay(extraDelay)
                .to(this.duration + extraDelay * 0.5, { position: this.tmp }, { easing: 'quintOut' })
                .call(() => {
                    // wrap the position back into one loop so repeated spins do not drift forever
                    this.strip.getPosition(this.tmp);
                    this.tmp.y = ((this.tmp.y % loop) + loop) % loop - loop;
                    this.strip.setPosition(this.tmp);
                    resolve();
                })
                .start();
        });
    }
}
```

**Try it**
- `node --test scripts/core/`: all three tests green. Change one slot on a strip and rerun — the RTP shifts, and you see by how much.
- `simulate(10_000_000, seed)`: `rtp` within 0.3% of `exactRTP`; `hitRate` tells you how often a player wins anything.
- On the client: force the server to return the same `stops` ten times — the reels must land on **exactly the same slot** every time.
- Spin 200 times in a row: `strip.position.y` must not drift to a huge number (confirming the wrap works).

## 🎤 Interview

**Questions you will get**

- `Junior` **Why must the spin result not be rolled on the client?**
  → Because a mini game's JS bundle lives on the player's device and can be edited, so anything the client decides is something the client can cheat. The client sends intent — "spin at this stake" — the server draws, writes the ledger and returns the stop positions; the animation is just how a finished story gets told.
- `Mid` **What does 92% RTP mean, and how do you tune it?**
  → It is the share of wagered money returned to players over an infinite number of spins, and it is a **consequence** of the reel strips plus the paytable, not a standalone dial. To change it you change symbol frequency on a strip or the payouts, then recompute exactly by enumerating all 8,000 combinations. Multiplying the final win by a factor instead makes the paytable impossible to compute.
- `Senior` **Two tables with the same 92% RTP feel completely different. Why, and how do you measure it?**
  → Variance: one pays small wins constantly, the other stays quiet then explodes. RTP says nothing about that. I measure with a 10-million-spin simulation and read hit rate, variance and max win, because those are the numbers that shape a session.

**60-second answer** — "Walk me through one slot spin, from tap to result."

> The client sends a spin command with the stake and a client-generated `request_id`. The server checks the balance, draws the stop positions with its own seeded RNG, computes the win from the reel strips and paylines, writes one row to an append-only ledger, and returns the stops plus the new balance. The `request_id` is UNIQUE in the database, so a player who loses connection and taps again is still only debited once. The client receives the outcome and only then starts the animation, spinning a few revolutions and landing exactly on the slot the server settled, with the last reel running slightly longer for tension. So the client never learns the result before the server, and never decides it.

**Where they dig**

- *"What if the connection drops mid-spin?"* → Resend the same `request_id`; the server sees the duplicate and returns the original result instead of spinning again.
- *"Should you build near-misses?"* → Tension through spin rhythm and sound is fine; deliberately stopping next to the jackpot when the result was already a loss is lying about probability and is scrutinised in many markets.
- *"How do card games differ?"* → Shuffle and deal on the server with Fisher–Yates and a secure random source; the client only knows its own hand, and round state must survive a dropped connection.
- *"How do you keep the reel table from being edited by accident?"* → A CI test pinning RTP to the agreed range: shift it and the build goes red.

**Red flags**

- `Math.random()` on the client deciding the outcome.
- Sending the full deck to the client and "hiding it in the UI".
- Not distinguishing social casino from real-money gambling, or not knowing the latter needs licensing.
- Describing RTP as a directly tunable parameter.

**Numbers and examples to know cold**

- 3 reels × 20 slots = **8,000 combinations** — small enough to compute RTP exactly by enumeration.
- A **10-million-spin** simulation should match the exact RTP within **0.3%**.
- Every wager carries a **UNIQUE `request_id`**; the ledger is **append-only**.
- The last reel lands **0.2–0.3 seconds** after the previous one.
- Use a **seeded** RNG so runs are reproducible — never `Math.random` for anything touching currency.
