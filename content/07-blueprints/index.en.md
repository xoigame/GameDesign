---
title: Blueprints
summary: Where the GDD of the game you are actually building lives — the layer an AI agent executes directly.
---

The first eight branches are **general knowledge**. This one is **your specific project**.

An important distinction:

| | Branches 1–6, 8, 9 | Blueprints branch |
|---|---|---|
| Content | Principles, techniques | Decisions for *this* game |
| Changes | Rarely | Constantly |
| AI uses it to | Understand context, share standards | **Execute directly** |
| Example | "A core loop should have 3 tiers" | "My loop: slash → collect → upgrade" |

## How to use it

1. Copy [[gdd-template]] to `content/07-blueprints/<game-name>.md`
2. Fill it in. Prioritise **Design Pillars** and **Invariants** — those two decide the quality of AI output more than anything else.
3. Point the agent at it: *"read `content/07-blueprints/<game>.md`, that is the project GDD."*
4. Update it whenever the design changes — **before** asking the agent to code.

## Multiple projects

One file per game, or a subfolder if the GDD grows:

```
content/07-blueprints/
├── index.md
├── _gdd-template.md
├── xoi-survivors.md
└── tower-siege/
    ├── index.md
    ├── combat.md
    └── economy.md
```

A subfolder automatically becomes a sub-branch on the mindmap — handy once a GDD outgrows one file.

## Notes

**Do not copy principles from branches 1–6 into here.** Reference them with `[[core-loop]]`, `[[balancing-math]]`. Copying creates two sources of truth, and they will drift apart.

**Record decisions *and* their reasons.** Six months from now you will not remember why you picked 0.4s over 0.3s — and the agent certainly will not. One line of rationale saves a lot of re-litigation.

**Mark what is unsettled.** Use `TODO:` or `❓` for anything still open, so the agent knows to ask rather than decide.

## 🤖 Prompt for AI

This is the branch the agent **executes**. The prompt here is about pointing it at the right document and making it confirm the constraints before writing anything.

**Project kick-off prompt**

```
Knowledge base: E:/XoiGame/GameDesign
Project GDD: content/07-blueprints/<game>.md

Step 1: read AI_CONTEXT.md, then the GDD.
Step 2: list back to me:
   - The 3 Design Pillars and what each one excludes
   - Every INV-xx invariant
   - Every item still marked ❓ (unsettled)
Step 3: for the ❓ items, ASK me one question at a time. Do not decide.
Step 4: once I have answered, propose an implementation order following the
   7 phases in content/05-ai-assisted-dev/ai-workflow.md.

No code yet.
```

**The usual trap:** letting the agent read the GDD and start coding immediately. Steps 2 and 3 surface the parts you thought were clear but are not — far cheaper than discovering it after 500 lines.

## 🎮 Unity

For a Unity project the GDD needs one extra section the generic template does not have — see section 5b in [[gdd-for-ai]].

**Where should the GDD live?**

This knowledge base (`E:/XoiGame/GameDesign`) and the Unity project are **two separate repos**. So where does the GDD go?

| Option | Pro | Con |
|---|---|---|
| GDD in this vault (`content/07-blueprints/`) | Visible on the mindmap, has the 🤖 tab | An agent working in the Unity project must read another repo |
| GDD in the Unity project (`design/GDD.md`) | Agent reads it in the same repo, always current | Not on the mindmap |
| **Both, one a symlink** | Both benefits | You must remember not to edit two copies |

The most practical arrangement: **the GDD lives in the Unity project** (`design/GDD.md`), and the node in `content/07-blueprints/` is a **summary plus a pointer**:

```markdown
---
title: Xoi Survivors
summary: Survivor-like roguelike, PC, 25-minute sessions.
---

Full GDD: `E:/XoiGame/XoiSurvivors/design/GDD.md`

The three pillars (full text in the GDD):
1. No RNG in combat
2. A run lasts under 25 minutes
3. The player understands why they died within 2 seconds
```

That way an agent working in the Unity project has the GDD next to the code, and you still see the project on the mindmap.

**`CLAUDE.md` in the Unity project**

```markdown
# Xoi Survivors

Design knowledge base: E:/XoiGame/GameDesign — read AI_CONTEXT.md when you
need a principle (core loop, behaviour tree, audio buses...).

GDD: design/GDD.md — the Pillars, Invariants, and Out-of-scope sections are
HARD CONSTRAINTS.

## Unity project state (you cannot see this)
[project settings block — see section 5b in gdd-for-ai]

## Do not do on your own
[Unity guardrail block — see agent-guardrails]
```

**Quick checks**
- Does the Unity project have a `CLAUDE.md` pointing back to this vault?
- Does the GDD have the "Unity project state" section?
- Does the blueprint node here point at the real GDD path?
