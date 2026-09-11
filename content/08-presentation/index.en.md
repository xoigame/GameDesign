---
title: Presentation & UX
summary: The presentation layer — audio, art direction, animation, UI, UX, accessibility. What the player actually touches.
---

Players do not touch your systems. They touch **the presentation of those systems**: the sound of steel on shield, the weight of an animation, the button that sits where your thumb already is.

This branch is the layer between **mechanics** ([[systems]]) and **perception**.

## Nodes

**Visual**
- **[[art-direction]]** — art direction, palette, silhouette, readability.
- **[[animation-game]]** — game animation is not film animation: timing, cancels, responsiveness.

**Interface**
- **[[ui-design]]** — the UI system: grid, type, icons, states.
- **[[ux-hud]]** — the in-play HUD: what to show, and when.
- **[[ux-flow]]** — everything outside play: menus, settings, saving, errors.
- **[[accessibility]]** — accessibility. Not an optional extra.

**Audio**
- **[[audio-design]]** — SFX design: layering, variation, frequency slotting.
- **[[audio-implementation]]** — mixing, buses, ducking, spatial audio.
- **[[adaptive-music]]** — music that reacts to game state.

## Three principles throughout

**Readable first, beautiful second.** The player must distinguish friend from foe, safe from lethal, interactive from scenery, in a fraction of a second. Any aesthetic decision that fights this is wrong — even if it looks better.

**Double-encode anything important.** Colour plus shape. Sound plus visual. Roughly 8% of men have red-green colour blindness; a meaningful share of players play with the volume at zero. Information carried on one channel only is information some players never receive. See [[accessibility]].

**Consistency beats per-asset quality.** Twenty excellent assets in mismatched styles are worse than twenty average ones that agree. This is also why [[asset-generation]] with AI is hard to use at scale.

## Why this area gets skipped

The presentation layer is often treated as "polish, do it later". Two problems with that:

1. **It decides the first-30-seconds impression** — the moment most players decide whether to stay. A deep mechanic does not rescue a game that looks and sounds like a prototype.
2. **Some decisions cannot be changed later.** Palette, character proportions, UI reference resolution, audio bus architecture — changing those late means remaking every asset.

The pragmatic line: **decide the systems early, produce the content late.** Lock the palette and the audio buses on day one; drawing 200 sprites can wait.

## 🤖 Prompt for AI

**How to use AI in this branch**

Here AI is **weakest on taste and strongest on systematising**. Split the work along exactly that line:

| Delegate | Keep |
|---|---|
| Build a design system from the numbers you supply | Choosing palette, type, style |
| Write validators (contrast, touch targets, palette) | Judging "does this look right" |
| Audio bus architecture, ducking table | Listening and mixing |
| A pipeline that forces assets into one style | Approving assets |
| Frame data → animation state machine | Tuning timing until it feels right |

The effective opener: *"I decide the aesthetics; you build the system so I can tune fast."* The one that leads to disappointment: *"design a nice UI for me."*

This is where AI is **weakest on taste and strongest on systematising**. Do not ask it to "make it look good"; ask it to build the system and enforce the constraints.

**What you must state** (otherwise it takes engine defaults):
- Reference resolution and scaling rule
- Palette as hex values, and the colour count limit
- Budgets: concurrent sounds, UI draw calls
- Accessibility constraints that must hold

**Prompt template — build the system, not the aesthetics**

```
Build the presentation layer for a <genre> game, <engine + exact version>.

I decide the aesthetics; you build the SYSTEM so I can tune fast:
- Every colour comes from a single palette asset, NO hardcoded colours in code
- Every UI dimension on a 4px scale, declared in one style config
- Every sound goes through a bus (Master > SFX > UI / Ambience / Music),
  never played directly
- Every timing constant (animation, transition, ducking) lives in a data file

Include automated checks:
- Find hardcoded colours outside the palette
- Find text/background contrast below 4.5:1
- Find audio played outside the bus graph
- Find interactive elements with a touch target under 44x44px
```

**The usual trap:** asking AI to "design a nice UI" returns a generic admin-dashboard layout with colours hardcoded everywhere. Ask it for **the system and the constraints**; you decide the look and hand it numbers.

## 🎮 Unity

This branch says *what to design*. The *how in Unity* lives in the [[unity]] branch — specifically [[unity-ui]], [[unity-audio]], [[unity-vfx]], [[unity-shader]], [[unity-lighting]], [[unity-animation]].

The 🎮 section here does one job: **connect a design decision to where it lives in the Unity project.**

**Lookup: design decision → where it lives in Unity**

| Decision from this branch | Where it lives in Unity | Node with the depth |
|---|---|---|
| Palette, readability | Palette asset + Sprite Atlas | [[unity-shader]], [[unity-lighting]] |
| Spacing scale, type scale | `UiTheme` ScriptableObject or USS | [[unity-ui]] |
| HUD structure | Canvases split by change frequency | [[unity-ui]] |
| Menu flow, settings | Bootstrap scene + app-level state machine | [[unity-game-loop]] |
| Audio bus tree, ducking | AudioMixer + Snapshots | [[unity-audio]] |
| Accessibility | One static class read from settings | [[accessibility]] |
| Animation frame data | ScriptableObject, **not** Animation Events | [[unity-animation]] |

**Three things to lock before producing assets**

Changing these later means remaking every asset, so decide in week one:

1. **Reference resolution + pixels-per-unit** — determines every sprite dimension.
2. **Color space = Linear** (`Project Settings > Player`). Changing it later shifts every colour. See [[unity-lighting]].
3. **The AudioMixer tree** — adding buses after 200 sounds already play directly is painful work.

**One architectural boundary worth keeping**

```
Assets/Scripts/
├── Core/          ← game rules, NO using UnityEngine
└── Presentation/  ← sight and sound, reads Core state via events
```

The presentation layer **only reads**; it never decides rules. That way changing an effect never touches balance, and simulating 10,000 battles needs no rendering — see [[balancing-math]].

**Quick checks**
- `grep -r "using UnityEngine" Assets/Scripts/Core/` → empty?
- Is Color Space set to Linear rather than Gamma?
- Does every UI colour come from one asset, with nothing hardcoded?
