---
title: GameDesign Brain
summary: A mindmap knowledge base on game design and AI in games — and a design brain for AI agents to read before they generate a single line of game code.
---

This is the **central brain**: a place for a person to learn and look things up, and for an AI agent (Codex, Claude Code, Cursor…) to read before building an actual game.

## The gap this fills

When you ask an AI to write a game, the hard part is not that the AI codes badly — it is that **the AI does not know what you want**. A prompt like "make me a shooter" produces something generic, because every design decision gets invented on your behalf.

This vault closes that gap in two layers:

1. **Knowledge layer** (branches 1–6, 8, 9) — principles of game design and game AI. This is shared vocabulary: the AI reads it so you both mean the same thing by the same words.
2. **Blueprint layer** ([[blueprints]]) — the GDD of the specific game you are building. This is the part the AI actually executes.

Without layer 1, the AI ships a game that is "technically what you asked for, and dull". Without layer 2, it has nothing to build.

## The nine branches

| Branch | Covers | Reach for it when |
|---|---|---|
| [[foundations]] | Core loop, player motivation, MDA, game feel, design pillars | Starting a new game idea |
| [[systems]] | Economy, progression, combat, balance math | Designing the systems that run the game |
| [[content-design]] | Levels, procedural generation, pacing, narrative | Filling the system skeleton with content |
| [[presentation]] | Art direction, animation, UI, HUD, audio, accessibility | Turning systems into something a player can feel |
| [[game-ai]] | FSM, Behavior Tree, GOAP, Utility AI, pathfinding | Making enemies and NPCs feel smart |
| [[ai-assisted-dev]] | Using AI (Codex/Claude) **to build** the game | You want the AI to write code you can actually ship |
| [[production]] | Architecture, data-driven design, metrics, performance | Turning a prototype into a product |
| [[unity]] | Unity in practice: physics, animation, patterns, UI, audio, VFX, shaders, lighting, optimization, builds, multiplayer | Implementing in Unity without the usual traps |
| [[blueprints]] | A real GDD plus a template | Starting a specific project |

An important distinction: **[[game-ai]] is AI *inside* the game** (a monster that dodges). **[[ai-assisted-dev]] is AI that *makes* the game** (Claude writing the script for that monster). They are different disciplines; do not conflate them.

## How to use it

**Read and browse:** `npm run dev`, then wander the mindmap. Click a node to read, press `/` to search.

**Extend:** drop a new `.md` file into `content/<branch>/` with frontmatter. The mindmap updates itself — nothing else to register. Conventions live in `content/_SCHEMA.md`.

**Feed it to an AI:** tell the agent *"read `AI_CONTEXT.md` first"*. That file points at `KNOWLEDGE_INDEX.md` (auto-generated table of contents) and the detail files. Or hit **Copy for AI** in the detail panel to grab one branch and paste it into a chat.

## The one rule

> **Markdown under `content/` is the single source of truth.**
> `public/data/graph.json` and `KNOWLEDGE_INDEX.md` are generated. Editing them by hand loses your work on the next build.

Node status: `deep` = written and usable · `stub` = skeleton only, needs filling in. Stub nodes show a dashed border on the mindmap — that is this vault's own to-do list.

## 🤖 Prompt for AI

**How to use AI with this vault**

Three ways, with real differences in cost and accuracy:

| Way | When | Note |
|---|---|---|
| Agent **reads the files** in the repo | Default, if it has filesystem access | Cheapest, always current |
| **Copy this section** / **Copy branch** | Delegating one specific task | ~1k / ~13k tokens |
| **Export prompt playbook** | AI cannot read your disk | ~15k tokens |

See [[ai-tooling]] for tool-selection criteria, and [[ai-limits]] for what not to delegate.

The root node is not the place for a topic-specific prompt. But every request you send an AI about the project should open with a **positioning block** like the one below — it stops the model from defaulting to "the average game in its training data".

**Session opener template**

```
Design knowledge base: E:/XoiGame/GameDesign
Read AI_CONTEXT.md first, then KNOWLEDGE_INDEX.md to see what nodes exist.

Project GDD: content/07-blueprints/<game>.md
These three sections are HARD CONSTRAINTS — violating one means stop and ask me:
  - Design Pillars
  - Invariants (INV-xx)
  - Out of scope

Before choosing a technique for <the task>, read the relevant node in the vault
and tell me which one you picked and why.
```

**The biggest trap:** pasting all 36,000 words into the chat. It burns tokens and drowns the signal. Let the agent **read files on demand** — only paste when it has no filesystem access.
