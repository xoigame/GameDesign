---
title: Unity in Practice
summary: Hands-on Unity implementation experience — physics, animation, patterns, UI, audio, VFX, shaders, lighting, optimisation, builds, multiplayer.
---

The design branches say *what* to build. This branch says *how* in Unity — and more usefully, **which traps cost a week each**.

Nodes here have **no 🎮 tab**, because the whole body is already Unity.

Assumed target throughout: **Unity 6 (6000.x) + URP**, with 2022 LTS differences noted inline.

## Reading order

**Before writing anything**
- **[[unity-project-structure]]** — folders by feature, Assembly Definitions in the right dose, prefab variants instead of inheritance.
- **[[unity-game-loop]]** — bootstrap scene, app-level state machine, Awake/Start order, `Time.timeScale`.
- **[[unity-design-patterns]]** — the three roles of ScriptableObject, singletons in moderation, FSM as plain classes.

**While building gameplay**
- **[[unity-physics]]** — Rigidbody or hand-rolled, FixedUpdate and interpolation, the collision matrix, allocation-free raycasts.
- **[[unity-input]]** — the new Input System from day one, funnel every read through one `InputReader`.
- **[[unity-camera]]** — camera is a gameplay system, not decoration. Cinemachine 3 over hand-rolled follow.
- **[[unity-animation]]** — the Animator Controller is a display panel, not a brain.

**Presentation**
- **[[unity-ui]]** — UGUI is still the pick for in-game HUD; Canvas rebuilds kill frames, not element counts.
- **[[unity-audio]]** — import settings decide RAM and CPU more than code does.
- **[[unity-vfx]]** — Shuriken for gameplay and mobile, VFX Graph for volume; overdraw is the frame killer.
- **[[unity-shader]]** — Shader Graph covers 80%, hand-written HLSL for the rest.
- **[[unity-lighting]]** — Linear color space from day one, baked for anything static.

**Shipping**
- **[[unity-save-data]]** — one flat versioned `SaveData`, atomic writes, chained migrations, store ids not references.
- **[[unity-optimization]]** — measure on the target device with a real build; establish CPU-bound or GPU-bound before touching code.
- **[[unity-build-platform]]** — build to a real device in week one and nightly on CI.
- **[[unity-multiplayer]]** — do it from day one or not at all; retrofitting is close to a rewrite.
- **[[unity-editor-tools]]** — an hour writing a tool saves ten hours of the team's.

## Three decisions you cannot walk back

1. **Color Space = Linear** (`Project Settings > Player`) — see [[unity-lighting]]
2. **The new Input System**, not the legacy Input Manager — see [[unity-input]]
3. **Fixed Timestep = 1/60** if the game has frame data — see [[combat-systems]]

Plus one architectural decision: **`Assets/Scripts/Core/` must not `using UnityEngine`**. That single boundary gives you EditMode tests in milliseconds and balance simulation outside Unity — see [[unity-project-structure]].

## 🤖 Prompt for AI

Working with an agent on Unity has one dominant failure mode: **it writes code for a different Unity version**, and the code looks correct.

**What you must state in every Unity prompt:**
- Exact version (`6000.0.32f1`, not "Unity 6")
- Render pipeline (URP / Built-in / HDRP)
- Which input system
- Anything that lives in the Editor and not in code (layers, collision matrix, mixer)

**Prompt template**

```
Unity 6000.0.32f1 + URP 17. New Input System. Fixed Timestep 0.01667.
Layers: Player=6, Enemy=7, PlayerProj=8, EnemyProj=9.
Assemblies: Game.Core (noEngineReferences), Game.Unity, Game.Editor.

Task: <description>

Constraints:
- Pure logic into Game.Core (NO using UnityEngine)
- MonoBehaviour as a thin adapter in Game.Unity
- No GetComponent outside Awake; no allocation in Update
- Do NOT edit .prefab / .unity / ProjectSettings files — tell me what to
  change in the Editor instead

Deliver: the files, EditMode tests for the Core logic, and a list of what I
need to wire up in the Inspector.
```

That last line matters: the agent cannot attach components, so it must **tell you what to do in the Editor**. Without it you get correct code and a `NullReferenceException`.

**The usual trap:** the agent uses `rb.velocity`, renamed to `rb.linearVelocity` in Unity 6. Any API touched by the 6.0 migration is a candidate — state the version and ask it to flag anything it is unsure about.
