---
title: AI in Games
summary: AI that drives NPCs and gameplay — FSM, Behavior Tree, GOAP, Utility AI, pathfinding, AI Director, LLM-NPCs.
---

This is **AI *inside* the game**: the monster that dodges, the NPC that goes to market, the system that paces a whole run. Do not confuse it with [[ai-assisted-dev]] — that branch is about using AI *to build* the game.

## The most important fact

> **The goal of game AI is not intelligence. The goal is to *appear* intelligent and make the player enjoy themselves.**

Perfect-play AI is surprisingly easy to write, and reliably boring. An aimbot that never misses is not fun. The hard part is making AI **lose in an interesting way**: good enough to be a threat, readable enough that the player can learn to beat it.

A corollary: a lot of celebrated game AI is really **stagecraft**. F.E.A.R. enemies shout when they flank not because they are coordinating — they shout so *you know* they are flanking. Intelligence the player cannot perceive may as well not exist.

## Choosing an architecture

| Technique | Fits | Complexity | Scales |
|---|---|---|---|
| [[fsm]] | Simple behaviour, few states | Very low | Poorly — transition blow-up |
| [[behavior-tree]] | Most commercial NPCs | Medium | Well |
| [[utility-ai]] | Many competing options, sims | Medium | Well |
| [[goap]] | NPCs that must plan several steps | High | Medium |
| [[ml-rl]] | Research, fighting-game bots | Very high | Hard to control |
| [[llm-npc]] | Dialogue, personality | Medium | Costly, high latency |

**Practical advice:** start with [[fsm]]. Move to [[behavior-tree]] when the FSM passes roughly 6 states. Only reach for [[goap]] when you genuinely need the NPC to discover its own action sequence. Most games never do.

## Supporting nodes

- **[[pathfinding]]** — A*, NavMesh, flow fields. The foundation of anything that moves.
- **[[steering-flocking]]** — smooth movement and crowd behaviour.
- **[[perception]]** — sight, hearing, memory. What makes AI *feel* fair.
- **[[ai-director]]** — system-level AI that paces an entire session.

## Three design principles

**Readability beats optimality.** An enemy must *announce* its intent. See telegraphs in [[combat-systems]].

**Imperfection must be deliberate.** Add reaction time (200–400ms), aim error, hesitation. But do not make it purely random — make it consistent so the player can learn it.

**AI must play fair — and look like it.** If the AI knows the player's position through a wall, the player will feel cheated no matter how balanced the numbers are. See [[perception]].

## 🤖 Prompt for AI

Before asking an AI to **write** NPC behaviour, make it **choose an architecture** and defend the choice. This is the single biggest time-saver in this branch.

**What you must state:**
- Desired behaviour described at the **observable** level, not the technical one
- Concurrent NPC count and CPU budget
- How much designer control you need (will you be hand-tuning?)
- What the player must be able to **notice** — the stagecraft part

**Architecture-selection prompt**

```
Before writing any code, ADVISE ME ON ARCHITECTURE.

Desired behaviour (observable level):
- Enemies patrol, spot the player, chase, attack
- At low health they find cover and heal
- With several of them, they spread out instead of clumping

Constraints: max 30 concurrent NPCs, 2ms/frame budget for all AI.
I need to hand-tune behaviour priority WITHOUT editing code.

Compare FSM / Behavior Tree / Utility AI / GOAP for THIS case.
Recommend ONE, state the trade-off. No code yet.
```

**The usual trap:** AI defaults to proposing GOAP or machine learning because they sound smarter. For 90% of indie games the right answer is FSM or Behavior Tree. The constraint *"I need to hand-tune without editing code"* usually eliminates GOAP and RL on its own.

**Always ask for the stagecraft layer.** Intelligence the player cannot see is worth nothing. Add: *"whenever an NPC changes intent, emit a signal the player can perceive — a bark, an icon, a posture change."*
