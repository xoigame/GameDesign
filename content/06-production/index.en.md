---
title: Production & Tech
summary: Turning a prototype into a product — architecture, data-driven design, metrics, performance.
---

This branch is about **how you build**, not **what you build**.

## Nodes

- **[[architecture-patterns]]** — ECS, components, event bus, application-level state machines.
- **[[data-driven-design]]** — separating data from code. The precondition for balancing and for effective AI help.
- **[[playtesting-metrics]]** — what to measure, how, and how to read it.
- **[[tech-stack]]** — choosing an engine and tools.
- **[[performance]]** — budgets and optimisation.

## Principles

**Architecture serves iteration speed.** While you are still exploring, the thing that matters is *change and retry fast*. Beautiful architecture that needs a 3-minute rebuild for every number change is the wrong architecture for that phase.

**Do not optimise early, but do measure early.** Put a profiler in from the start. You do not need to optimise yet, but you need to know when things start degrading — and catching it early is far cheaper.

**Separating data from code is the most important architectural decision.** It determines how fast you can balance the game, and how safely an AI agent can change numbers. See [[data-driven-design]].

## Where AI fits

Good architecture makes an AI agent markedly more effective:

- **Clear boundaries** → the agent fixes one system without breaking another.
- **Tests exist** → the agent can verify its own changes.
- **Data outside code** → tuning balance never touches logic.
- **Consistent conventions** → generated code matches the rest of the project.

The inverse also holds: a messy codebase makes an agent produce more bugs — it cannot see the whole picture, so it guesses.

## 🤖 Prompt for AI

**How to use AI in this branch**

AI handles almost all of this branch, because it is purely technical and verifiable. The three highest-ROI jobs are all work programmers tend to skimp on because it is dull:

1. **Editor tools and validators** — no gameplay risk, and they save real time every day.
2. **Unit tests for pure logic** — it writes better tests than many people, and tests are what let it verify itself later.
3. **CI and build scripts** — pure scripting; if it runs, it is right.

What **not** to delegate: architecture decisions with no measurements yet. Asking "which architecture is better" without stating entity count and frame budget returns ECS for a game with 40 entities.

Production is where AI is most useful for the work nobody enjoys: validators, test harnesses, CI config, editor tooling.

**What you must state:**
- Target scale (entity counts, frame budget) — architecture follows from it
- Which conventions are non-negotiable
- Whether you want a refactor or new code (they need different prompts)

**Prompt template — safe refactor**

```
Refactor <file> to <goal>.

MANDATORY:
- Observable behaviour does NOT change
- All public APIs stay identical
- Run existing tests before and after; both must be green
- If a public API must change, STOP and ask me first

Present the diff in small steps, do not rewrite the whole file at once.
```

**The usual trap:** asking for "better architecture" with no scale figure. You get ECS for a game with 40 entities. State the entity count and the frame budget, and the right answer usually becomes obvious.

## 🎮 Unity

This whole branch has a detailed Unity counterpart in [[unity]]: [[unity-project-structure]], [[unity-design-patterns]], [[unity-optimization]], [[unity-build-platform]].

**Three things to set up in week one, not later**

1. **Assembly Definitions** — `Game.Core` with `noEngineReferences: true`. It gives you fast EditMode tests and out-of-Unity simulation; adding it later means fixing hundreds of `using` statements.
2. **A correct Unity `.gitignore`** — `Library/`, `Temp/`, `Logs/`, `obj/`, `*.csproj`, `*.sln`. Committing `Library/` once inflates the repo to gigabytes.
3. **Build to the target device** — not at the end of the project, but in week one. IL2CPP, stripping, and memory limits only surface in a real build. See [[unity-build-platform]].

**Git for Unity — three requirements**

```
# .gitattributes — without this, scene/prefab merges fail silently
*.unity   binary
*.prefab  binary
*.asset   binary
```

Marking them binary makes git **refuse** to merge rather than merging wrongly. You then have to pick a side — annoying, but better than a corrupted scene nobody notices.

Also enable **Force Text** serialization (`Project Settings > Editor > Asset Serialization > Force Text`) so diffs are readable, even though merges stay binary.

**Meta files must be committed**

`.meta` files hold GUIDs. Not committing them means every reference breaks on someone else's machine. This is the most common mistake when setting up a Unity repo for the first time.

**Quick checks**
- `git check-attr merge Assets/Scenes/Main.unity` → binary?
- Are `.meta` files committed?
- Is `Library/` in `.gitignore`?
- Have you built to the target device at least once?
