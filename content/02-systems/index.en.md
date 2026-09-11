---
title: Systems Design
summary: Designing the systems that run underneath — economy, progression, combat, balance math — so interesting behaviour emerges from them.
---

Systems design is the craft of **writing rules so that interesting behaviour emerges**, instead of scripting every situation by hand.

The core difference from content design: content design writes *"this room has 3 goblins"*; systems design writes *"enemies spawn against a difficulty budget, a goblin costs 2 points, an archer costs 5"*. The second produces endless rooms and — more importantly — is **tunable**.

## Nodes

- **[[economy-design]]** — sources, sinks, and why inflation kills your game.
- **[[progression]]** — how the player gets stronger, and at what pace.
- **[[combat-systems]]** — anatomy of a combat system: readable, countable, reactable.
- **[[balancing-math]]** — formulas, tables, and simulation so you stop guessing.
- **[[difficulty-curve]]** — modulating challenge around the flow channel.
- **[[randomness]]** — RNG in the right place creates drama; in the wrong place it creates unfairness.
- **[[meta-systems]]** — what keeps players coming back between sessions.

## Principles

**A system must be readable.** The player needs to reason about consequences before acting. A "deep" system nobody understands is just a random one.

**Few rules, many interactions.** Depth comes from how many ways the rules intersect, not from how many rules there are. Three mechanics that interact usually beat ten that do not.

**Every constant lives in a data file.** See [[data-driven-design]]. This is the precondition for balancing at all — and the precondition for an AI agent tuning numbers without breaking logic.

**Design for the degenerate case.** Players will find the most extreme configuration. Multiplying percentages together always leads to exponential blow-up — add before you multiply, or set a ceiling.

## Working with AI in this branch

This is where AI helps **most**, because it is pure math and simulation:

1. You describe the system in words plus constraints.
2. AI turns it into formulas and tables.
3. AI writes a script simulating 10,000 playthroughs.
4. You read the distribution, adjust constraints, repeat.

That loop used to take weeks. See [[balancing-math]] for the concrete method.

## 🤖 Prompt for AI

The rule for this whole branch: **make the AI run a simulation, never accept a number it merely asserts.**

**What you must state:**
- Formula shape and growth rate, not just "make it balanced"
- Hard caps for anything that could compound infinitely
- Target metrics (winrate band, time-to-kill spread)
- Which degenerate strategies you refuse to allow

**Prompt template**

```
Write a Python simulation for this system. Do NOT propose numbers from intuition.

Model:
- Player: hp=100, dps=f(level), armor=g(level)
- 5 enemy types, stats in the table below
- 10,000 battles per (build × enemy) pair

Output:
- Winrate and median TTK per pair
- Flag any pair with winrate < 40% or > 75%
- Histogram of TTK (to reveal long tails)

After the results, propose adjustments and RE-RUN to prove them.
```

**The usual trap:** AI proposes round, familiar numbers (10%, 25%, 1.5×) because they are common in its training data — not because they are right for your game. Demand the simulation output, not the assertion.

## 🎮 Unity

Systems design in Unity is a story about **where the numbers live**. The general architecture is in [[unity-design-patterns]] and [[unity-project-structure]].

**The boundary that matters most in this branch**

```
Assets/Scripts/
├── Core/Systems/     ← plain C#: DamageCalculator, LootRoller, PriceCurve
│                       NO using UnityEngine
├── Data/             ← ScriptableObjects holding numbers
└── Unity/Systems/    ← thin MonoBehaviours calling into Core
```

Why it pays off, specifically in Unity:

- **Tests run in EditMode** (milliseconds) instead of PlayMode (seconds per Play press)
- **Simulate 10,000 battles without opening Unity** — run via `dotnet run` from a separate console project referencing the same files. This is what [[balancing-math]] needs.
- An Assembly Definition for `Core/` makes compiles noticeably faster — see [[unity-project-structure]]

**Three roles of ScriptableObject here**

| Role | Example | Caveat |
|---|---|---|
| Config data | `WeaponData`, `EnemyData` | **Read-only at runtime** |
| Event channel | `GameEvent` (OnEnemyDied) | Avoids coupling between systems |
| Shared variable | `FloatVariable` (player HP) | Convenient, easy to overuse |

All three are covered in [[unity-design-patterns]]. The big trap: **assigning to a ScriptableObject field writes straight into the asset** and survives leaving Play Mode — see [[data-driven-design]].

**Balancing tool: an Editor window, not an Inspector**

```csharp
public class BalanceWindow : EditorWindow {
    [MenuItem("Tools/Balance Dashboard")]
    static void Open() => GetWindow<BalanceWindow>("Balance");

    void OnGUI() {
        if (GUILayout.Button("Simulate 10,000 battles")) RunSim();
        // table of winrate/TTK per build × enemy
    }
}
```

With 5 systems and 200 numbers, per-asset Inspectors are not enough. A dashboard that shows the whole picture is an afternoon of work and pays off all project long. See [[unity-editor-tools]].

**Quick checks**
- `grep -r "using UnityEngine" Assets/Scripts/Core/` → empty?
- EditMode tests for all of `Core/` run in under a second?
- Grep for assignments into ScriptableObject fields → zero?
