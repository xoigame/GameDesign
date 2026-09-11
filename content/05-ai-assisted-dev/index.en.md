---
title: Building Games with AI
summary: Using Codex/Claude to actually ship a game — workflow, writing a machine-readable GDD, prompt patterns, guardrails.
---

This branch is about **AI that builds the game**, not AI inside the game (that is [[game-ai]]).

## What decides success

After enough experiments the conclusion is consistent: **output quality tracks specification quality, not model intelligence.**

Same model:
- *"Make a platformer"* → something generic and unusable.
- A 3-page GDD with numbers, constraints, and invariants → code that works on the first try with minor fixes.

This entire knowledge base exists so you can write the second kind of specification.

## Nodes

- **[[ai-workflow]]** — idea to running build, in phases.
- **[[gdd-for-ai]]** — writing a design doc a machine can execute. The most important node here.
- **[[prompt-patterns]]** — prompt templates per kind of gamedev task.
- **[[agent-guardrails]]** — rails that stop an agent from breaking your design.
- **[[asset-generation]]** — generating sprites, sound, music.

## A sane division of labour

| Task | Who | Why |
|---|---|---|
| Design pillars, core loop | **You** | Needs taste and decisions; AI averages |
| Game feel, number tuning | **You** | AI cannot perceive it |
| Level layout | **You** | AI has no spatial intuition |
| Systems, code architecture | **AI**, you review | Its clearest strength |
| Balance math, simulation | **AI** | Tens of times faster than a human |
| Algorithms (pathfinding, procgen) | **AI** | Well-defined, verifiable |
| Boilerplate, refactors, tests | **AI** | No argument |
| Judging "is this fun" | **You** | Cannot be delegated |

That last row is the important one. AI speeds up everything *except* knowing whether the game is good — so the bottleneck moves from **coding time** to **playtesting time**. Invest in shortening your evaluation loop.

## Common mistakes

**Handing over too much at once.** "Write me the whole game" produces 2000 lines that do not run. Split into steps that each run and can be verified.

**Providing no constraints.** AI picks the most common option in its training data — meaning your game looks like every tutorial. Constraints are what create difference.

**Accepting code you have not read.** AI-written code looks convincing even when wrong. You have to understand it, or you cannot maintain your own project.

**Forgetting AI has no memory.** Each new session, the agent knows nothing about yesterday's decisions. That is exactly why this knowledge base exists — see [[gdd-for-ai]].

## 🤖 Prompt for AI

**How to use AI — the branch about using AI**

The mistake that matters most: **the same tool plays a completely different role in each phase.**

| Phase | AI's role | What you keep | Node |
|---|---|---|---|
| **Design** | Critic + calculator | Every decision, taste, judging "is this fun" | [[ai-for-design]] |
| **Build** | Code labourer | Approving the plan, running it, integration | [[ai-for-build]] |
| **Publish** | Drafter + analyst | Reading and sending — all output faces outward | [[ai-for-publish]] |

Using the wrong role is the most common source of disappointment: asking it to author during design, or letting it auto-send during publish.

Start with [[ai-tooling]] for tool criteria; read [[ai-limits]] before delegating anything you cannot verify.

This branch is about *how to work*, so the "prompt" here is the **session setup** you send at the start of each working block.

**Session setup template**

```
Project: <name>. Engine: <name + exact version>.

Read before doing anything:
  1. CLAUDE.md
  2. design/GDD.md — the Pillars, Invariants, and Out-of-scope sections are
     HARD CONSTRAINTS
  3. design/decisions.md — settled decisions, do not re-propose them

How I want you to work:
- Large task: PRESENT A PLAN FIRST, wait for my approval, then write code.
- Each task = one commit, running and verifiable when done.
- Spot a problem outside scope → NOTE IT, do not fix it.
- Ambiguous request → ASK, do not decide for me.
- Need to violate an invariant → STOP, explain, wait for my decision.

Today's task: <description>
```

**Always state the exact engine version.** Model knowledge has a cutoff; engines keep moving. This is the single most common source of "that API does not exist" errors.

**The usual trap:** handing over a whole feature ("build the combat system") and getting back 2000 lines that do not run. Split down to *one commit, runs, verifiable*.

## 🎮 Unity

Working with an AI agent on a Unity project has a few quirks that web or backend projects do not.

**Three things that make Unity hard for an agent**

1. **Scenes and prefabs are enormous YAML files.** An agent can read them but almost always breaks them when editing by hand. Anything requiring a scene/prefab edit, you do in the Editor.
2. **A lot lives outside code** — ProjectSettings, Animator Controllers, AudioMixer, Lighting. The agent cannot see any of it unless you describe it.
3. **It cannot run the game to verify.** When it finishes writing, it does not know whether the code works. You are the verification loop.

**Realistic division on a Unity project**

| Task | Agent | You |
|---|---|---|
| Plain C# classes in `Core/` | ✅ very good | Review |
| MonoBehaviours, components | ✅ good | Attach to prefabs |
| Editing prefabs / scenes | ❌ breaks things | ✅ in the Editor |
| Animator Controllers | ❌ effectively binary | ✅ |
| ProjectSettings | ❌ cannot see them | ✅, then tell the agent |
| Editor tools, validators | ✅ very good | Review |
| Shader Graph | ❌ | ✅ |
| Hand-written HLSL | ✅ good | Verify on target hardware |

**Give it the information it cannot see**

Put the settings an agent cannot read into `CLAUDE.md`:

```markdown
## Project settings (agent cannot see these — this is the truth)

- Unity 6000.0.32f1, URP 17
- Color Space: Linear
- Fixed Timestep: 0.01667 (60Hz)
- Input System package (old Input Manager disabled)
- Collision matrix: layer Player does NOT collide with PlayerProjectile
- AudioMixer: Master > [Music, SFX > (Player, Enemy, World), UI, Ambience]
- Assemblies: Game.Core (noEngineReferences), Game.Unity, Game.Editor
```

Without this block the agent writes `Input.GetKey` (old Input Manager) or picks the wrong layer — and the code looks right while doing nothing.

**The Unity working loop**

```
1. You:   task + reference to a node in this vault
2. Agent: plan (which files, which APIs)     ← STOP and read
3. You:   approve
4. Agent: write the C#
5. You:   attach components in the Editor, press Play
6. You:   commit, or describe the exact failure → back to 4
```

Step 5 cannot be delegated. That is why tasks should be small: you personally enter the Editor to verify each one.

**Quick checks**
- Does `CLAUDE.md` have the project-settings block?
- Has the agent ever edited a `.prefab`/`.unity`? (it should not)
- Is each task verifiable in a single Play press?
