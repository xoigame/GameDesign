---
title: Core Loop
summary: The chain of actions a player repeats constantly — if it is not fun within 30 seconds, no amount of meta systems will save it.
---

The **core loop** is the shortest chain of actions a player repeats over and over. It is the smallest unit of fun in your game.

The general shape:

<figure class="fig">
<svg viewBox="0 0 660 200" role="img" aria-label="A four-step loop: Action, Feedback, Reward, New ability, then back to Action">
<defs>
<marker id="cl-en-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
</marker>
</defs>
<g>
<rect x="14"  y="26" width="140" height="54" rx="9" class="fig-box"/>
<rect x="184" y="26" width="140" height="54" rx="9" class="fig-box"/>
<rect x="354" y="26" width="140" height="54" rx="9" class="fig-box"/>
<rect x="524" y="26" width="122" height="54" rx="9" class="fig-box"/>
</g>
<text x="84"  y="49" text-anchor="middle" class="fig-label" font-size="14">Action</text>
<text x="84"  y="68" text-anchor="middle" class="fig-muted" font-size="11">press a button</text>
<text x="254" y="49" text-anchor="middle" class="fig-label" font-size="14">Feedback</text>
<text x="254" y="68" text-anchor="middle" class="fig-muted" font-size="11">hitstop, sound</text>
<text x="424" y="49" text-anchor="middle" class="fig-label" font-size="14">Reward</text>
<text x="424" y="68" text-anchor="middle" class="fig-muted" font-size="11">loot, XP</text>
<text x="585" y="49" text-anchor="middle" class="fig-label" font-size="14">New ability</text>
<text x="585" y="68" text-anchor="middle" class="fig-muted" font-size="11">stronger</text>
<g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cl-en-a)" fill="none">
<path d="M156 53 H180"/>
<path d="M326 53 H350"/>
<path d="M496 53 H520"/>
<path d="M585 82 V132 Q585 150 567 150 H102 Q84 150 84 132 V86"/>
</g>
<text x="334" y="172" text-anchor="middle" class="fig-muted" font-size="11">
repeated thousands of times — each pass must leave the player slightly stronger
</text>
</svg>
<figcaption>The return arrow is the point. If the loop ends at &ldquo;reward&rdquo; with no change in capability, that is a score, not a core loop.</figcaption>
</figure>

## Real examples

| Game | Core loop |
|---|---|
| Vampire Survivors | Move to dodge → auto-damage → collect gems → level up, pick a skill → dodge better |
| Slay the Spire | Draw → read the board → play cards → clear the room → add a card to the deck |
| Hades | Enter a room → fight → take a boon → get stronger → harder room |
| Stardew Valley | Water crops in the morning → day passes → harvest → sell → buy better seeds |

Notice that all four **fit in one sentence**, and each loop ends with *capability going up*, not just a number going up.

## Three nested loops

Good games almost always run several loops at different timescales:

- **Micro (1–10 seconds)** — one swing, one jump, one card. This is where [[game-feel]] lives.
- **Mid (2–10 minutes)** — a fight, a dungeon, an in-game day. It has a beginning, a peak, and a resolution.
- **Macro (hours)** — unlocking characters, account levels, gear. This is [[progression]].

The micro loop keeps a player in *this session*. The macro loop brings them back *tomorrow*. No micro loop and the game is boring immediately. No macro loop and they play for a few days and drift off.

## Testing your core loop

1. **The 30-second test** — within the first 30 seconds, has the player completed the whole loop at least once?
2. **The no-reward test** — turn off score, XP, and loot. Is the core action still fun? If not, you are using rewards to mask a flat mechanic. Rewards amplify fun; they do not create it.
3. **The one-sentence test** — describe the loop in a sentence with no "and" in it. If you cannot, the loop is not defined yet.
4. **The hundredth-repetition test** — is repetition #100 different from #1? If not, you need more variables ([[randomness]]) or deeper decisions.

## 🤖 Prompt for AI

This is the section **AI invents most often**. Declare it explicitly in your [[gdd-for-ai]]:

```yaml
core_loop:
  micro:
    action: "Left click to slash, 0.4s cooldown"
    feedback: "90ms hitstop + 6px screenshake + floating damage number"
    reward: "drops 1-3 soul shards"
  mid:
    unit: "one room (~90 seconds), 3-6 enemies"
    resolution: "clear the room → pick 1 of 3 buffs"
  macro:
    unit: "one run (~25 minutes)"
    persistence: "shards left over after death buy permanent unlocks"
```

Concrete numbers like `0.4s`, `90ms`, `1-3 shards` are what turn a vague prompt into code that runs correctly the first time. See [[prompt-patterns]].
