---
title: Design Foundations
summary: What you need to settle before writing a line of code — core loop, player motivation, MDA, game feel.
---

This branch answers **"what makes a game worth playing?"**. It comes before every technical decision.

## Suggested order

1. **[[design-pillars]]** — write the 3 sentences that define your game. Every later decision refers back to them.
2. **[[core-loop]]** — the loop the player repeats thousands of times. If it is dull, nothing rescues it.
3. **[[player-motivation]]** — why people keep playing. Decides which systems you build in [[systems]].
4. **[[game-feel]]** — the "crunch". The gap between a prototype and a real game usually lives here, not in the feature list.
5. **[[mda-framework]]** — shared language for analysis: which rules produce which experience.
6. **[[prototyping]]** — how to verify cheaply before investing.

## Common mistakes

**Starting from features instead of experience.** "My game has crafting, pets, and PvP" is not a design — it is a shopping list. Design is: *"what does the player feel at minute 3, minute 30, and hour 30?"*

**Confusing complexity with depth.** Adding 40 stats makes a game *complicated*. Depth is when few rules produce many decisions worth thinking about — Go has two rules.

**Ignoring the first 30 seconds.** Most players leave before minute 5. The core loop has to be felt *immediately*, before any meta system unlocks.

## Working with AI here

AI writes code fast but **has no intuition for feel**. It does not know that 80ms of animation lag drains the punch out of a hit. So this part is yours to decide, and you must **write it down as concrete numbers** in your [[gdd-for-ai]] — "90ms hitstop, 6px screenshake over 120ms" — rather than "make it feel crunchy".

## 🤖 Prompt for AI

The foundations branch is where AI is least useful for *deciding* and most useful for *pressure-testing*. Use it as a critic, not an author.

**What you must state:**
- Your reference games, and the one thing you want to do differently
- Which player motivations you are serving, and which you refuse
- Session length and platform

**Prompt template — critique, not authorship**

```
Here is my game concept: <2-3 sentences>
Reference games: <A, B>. The one thing I want different: <X>.

Play the role of a skeptical publisher, not a supporter:
1. Which of my three pillars fails to exclude any feature? (a pillar that
   excludes nothing is not a pillar)
2. What is the generic version of this concept, and how far am I from it?
3. What will a player be doing at minute 3? At hour 3? If I cannot answer,
   say which part of the design is missing.
4. Which two motivations am I trying to serve that conflict with each other?

No praise. Problems only.
```

**The usual trap:** asking AI to "design a game concept". It returns the statistical average of its training data. Ask it to attack your concept instead — that it does well.

## 🎮 Unity

This branch sits **before** you open Unity. But three decisions here land directly in Project Settings, so knowing them early saves redoing work.

**Design decision → project setting**

| Decision | Setting it affects |
|---|---|
| Game has frame data (precise combat) | `Time > Fixed Timestep = 0.01667` |
| 2D pixel art | `Player > Color Space`, pixels-per-unit, Filter Mode Point |
| Mobile | `Player > Target Frame Rate`, Graphics API, texture compression |
| Gamepad / rebinding | Input System from day one — see [[unity-input]] |

**Prototyping in Unity — deliberately do it wrong**

At the [[prototyping]] stage a clean project is counterproductive. The fastest setup:

```
Assets/
├── _Proto/          ← everything here, no subfolders
│   ├── Proto.unity
│   └── Proto.cs     ← one file, all the logic
```

One scene, one script, coloured primitives. The goal is answering **one question** (see [[prototyping]]), not laying foundations. Once the answer is "yes, this mechanic is fun", *then* build the real structure per [[unity-project-structure]].

Name the folder `_Proto` with a leading underscore so it is easy to grep and delete later.

**Fast reset — the single most important thing**

```csharp
void Update() {
    if (Input.GetKeyDown(KeyCode.R)) SceneManager.LoadScene(0);   // instant reset
    if (Input.GetKeyDown(KeyCode.Alpha1)) variant = 0;            // switch variant
    if (Input.GetKeyDown(KeyCode.Alpha2)) variant = 1;
}
```

A short evaluation loop matters more than clean code. See [[prototyping]].

**Quick checks**
- Does the prototype reset in under a second?
- Can you switch between mechanic variants with one key?
- Did you settle Fixed Timestep before building combat?
