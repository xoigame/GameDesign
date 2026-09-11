---
title: Design Pillars
summary: Three sentences that define your game — a decision tool, and the first thing an AI agent needs to read.
---

**Design pillars** are 2–4 short sentences defining what your game *is* and *is not*. They exist to answer exactly one kind of question: *"should I add feature X?"*

## What a good pillar looks like

Bad pillars — true but useless:

> ❌ "The game should be fun." · "Beautiful art." · "Engaging combat."

Useless because they rule nothing out. No feature is ever rejected by them.

Good pillars — **capable of saying NO**:

> ✅ "Every death must be the player's mistake, never bad luck."
> → rules out: random crits, enemies spawning behind you, damage rolls.

> ✅ "The player always understands why they lost within 2 seconds."
> → rules out: hidden buffs, unsignposted damage-over-time, overly busy enemy combos.

> ✅ "A match lasts under 3 minutes."
> → rules out: cutscenes, long traversal, slow healing.

The test: **if a pillar has never killed a feature you wanted, it is not a pillar yet.**

## How to write them

1. Play the 3 games closest to your idea. Write down the **one** thing you want to do differently.
2. Phrase it as a claim about *player experience*, not about features. "The player feels…", not "The game has…".
3. Cap it at 3. Four is a lot. Five means you have not decided anything.
4. For each pillar, write **the list of what it excludes**. That half matters as much as the claim.

## Using them as a filter

When a new idea shows up:

- Reinforces a pillar → build it.
- Neutral → cut it (complexity has a cost; neutrality does not).
- Contradicts a pillar → cut it, or change the pillar deliberately and write down why.

Changing a pillar is not wrong. Changing it *quietly* is — that is the moment a game starts drifting into a pile of unrelated features.

## 🤖 Prompt for AI

**How to use AI for pillars**

Two jobs, and neither is writing the pillars:

**1. Test whether they are really pillars.** Feed it your three sentences and ask: *"which of these excludes no feature at all?"* A pillar that rules nothing out is a slogan. This takes twenty seconds and is the single most useful check in this node.

**2. Turn them into rules a machine can enforce.** Give it a pillar in plain language and ask for a test that detects violations — a grep over a folder, an assertion over your data assets. See [[agent-guardrails]] and the 🎮 section below.

What it must not do: **write the pillars**. They are the part of the design that makes the game yours; a model optimises toward the average of its training data, which is the opposite of what a pillar is for. See [[ai-limits]].

This is the **highest-value context** you can hand Codex or Claude. Without pillars, the model falls back on the most generic option in its training data — meaning your game ends up looking like every YouTube tutorial.

Put this at the top of your [[gdd-for-ai]]:

```markdown
## Design Pillars (inviolable)

1. **No randomness in combat.**
   All damage is deterministic. NO crits, NO misses, NO damage ranges.
   If a proposal needs combat RNG → refuse it and say which pillar it breaks.

2. **A match ends under 3 minutes.**
   Every system must resolve inside that window.

3. **The player understands a loss within 2 seconds.**
   All damage must have a visual tell at least 0.3s beforehand.
```

The line *"if a proposal needs RNG → refuse it"* is the crucial one: it turns a pillar from a description into **a rule the agent can enforce**. See [[agent-guardrails]].
