---
title: Level & Content Design
summary: Filling the system skeleton with content — levels, pacing, procedural generation, narrative.
---

If [[systems]] is the rulebook, content design is **the specific situations** the player actually walks through.

## Nodes

- **[[level-design]]** — guiding the player, sight lines, spatial rhythm, teaching without a tutorial.
- **[[procedural-generation]]** — generating content algorithmically, and why "infinite" usually means "bland".
- **[[onboarding]]** — teaching without dialogue boxes; the first five minutes.
- **[[pacing]]** — the tension/release rhythm across the whole journey.
- **[[narrative]]** — storytelling through space, mechanics, and systems.

> Presentation — UI, audio, art direction — has its own branch: [[presentation]].

## Principles that cut across

**Teach with space, not with text.** A first room with a safe patch of ground to try a new mechanic teaches better than any tutorial popup. See the sawtooth structure in [[difficulty-curve]].

**Handcrafted content sets the standard; procedural scales it.** Do not start with procgen. Build 10 levels by hand, work out what makes them good, *then* encode that as generation rules. Doing it the other way round almost always yields bland output.

**Density beats size.** A small map dense with interesting decisions beats a huge empty one. This is the most common mistake once AI is in the loop, because generating lots of content becomes almost free.

## A caution about AI here

AI generates content at near-zero cost, which is both the opportunity and the trap.

The opportunity: variants, arrangements, first drafts, item descriptions, scattered lore — AI does these well and fast.

The trap: **volume is not quality**. 500 auto-generated quests are worse than 20 written by hand. The moment a player recognises the template, the whole world loses credibility.

The sane split: let AI generate **raw material and variants**, and keep the human role as **editor and arranger**. See [[ai-workflow]].

## 🤖 Prompt for AI

**How to use AI in this branch**

Content is where AI generates at near-zero cost — both the opportunity and the trap.

**The mandatory order:**

```
1. YOU make 3-10 examples BY HAND
2. YOU write down WHY they are good
3. AI  encodes that as constraints + a validator
4. AI  generates volume against that template
5. YOU curate
```

Skipping steps 1–2 reliably produces 50 correctly-formatted quests, none of them interesting.

For procgen specifically, the most valuable thing to delegate is **not the generator but the validator** — it takes more work and AI writes it faster. See [[procedural-generation]].

AI is weak at spatial layout and strong at enforcing constraints. Point it at the second job.

**What you must state:**
- Exact output size and format (grid dimensions, room count)
- Hard constraints the output must satisfy
- What "unplayable" means, so it can validate
- Whether you want generation or validation — ask for the validator first

**Prompt template**

```
Write a level-layout generator AND its validator. Validator first.

Layout: 9x9 grid, exactly 1 entrance, 2 exits.
Hard constraints:
- Exit reachable from entrance (flood fill)
- No dead-end corridor longer than 3 cells
- At least 2 loops (not a pure tree)
- Total enemy budget within [8, 14] points
- No orphan rooms

Deliver:
1. Validator that takes a layout and returns (bool, reason)
2. Generator taking a seed, DETERMINISTIC for that seed
3. A "scan 100,000 seeds" harness reporting how many fail and why

Do NOT decide what makes a level fun — that is my call.
```

**The usual trap:** asking AI to "design a good level". It has no spatial intuition and cannot see the result. Ask for constraint enforcement instead.

## 🎮 Unity

Content in Unity is the question **prefab or scene or data**. Get it wrong and changing one small detail means opening 40 scenes.

**Decision table**

| Thing | Where it goes | Why |
|---|---|---|
| Level layout | Scene | Needs editing visually, in space |
| Enemies, items | Prefab + ScriptableObject | Fix once, applies to every copy |
| Stats, tables | ScriptableObject / CSV | Edit without opening a scene |
| Procgen config | ScriptableObject | Change rules without touching code |
| Dialogue | Separate text asset (JSON/CSV) | Translatable, editable outside Unity |

The principle: **anything you need to see in order to edit goes in a scene; everything else goes in data.**

**Prefab Variants instead of inheritance**

```
Enemy_Base.prefab
├── Enemy_Goblin.prefab       (variant)
├── Enemy_Archer.prefab       (variant)
└── Enemy_Brute.prefab        (variant)
```

Editing `Enemy_Base` applies to all three; each variant only overrides its differences. Unity does this well and few projects use it enough — details in [[unity-project-structure]].

**Do not put everything in one scene**

Additive scene loading lets you split:

```csharp
// Bootstrap always alive; content loads and unloads around it
SceneManager.LoadScene("Bootstrap");
SceneManager.LoadSceneAsync("Level_03", LoadSceneMode.Additive);
```

The real benefit: two people editing two different scenes do not conflict. Unity scenes are text files, but a merge conflict inside a scene is effectively unsolvable — splitting scenes is the prevention. See [[unity-game-loop]].

**Quick checks**
- Changing one enemy's stats: do you have to open any scene? (you should not)
- Two people editing two levels: any conflict?
- Prefab variants, or copy-pasted prefabs? (grep for near-identical prefabs)
