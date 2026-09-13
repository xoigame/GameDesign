---
title: Cocos Creator
summary: The vault's second engine — picking Cocos or Unity by where you ship, a Unity → Cocos 3.x concept map, and the traps that only appear once you build for web or a mini game.
---

The [[unity]] branch answers *"how do I do this in Unity without breaking things"*. This branch answers the same question for **Cocos Creator 3.x** — the engine behind most H5 games, super-app mini games and 2D mobile titles in Vietnam and China.

The design knowledge in the other eight branches **does not change with the engine**: a core loop is still a core loop, an economy is still faucet/drain. What changes is the API, the package limits, and the set of traps. This branch records only what changes.

**Assumed throughout:** Cocos Creator **3.8+**, TypeScript, a 2D project. Wherever the 2.x and 3.x APIs differ it is called out — that difference is the single largest source of errors for newcomers and for AI alike.

## The nodes

**Project backbone**
- **[[cocos-project-structure]]** — the project tree, `.meta` files and uuids, what to commit, and why scenes and prefabs are the hardest things to merge on a team.
- **[[cocos-scene-component]]** — Node/Component, lifecycle order, boot scene, prefabs, events and pooling. The skeleton everything else hangs off.

**Gameplay**
- **[[cocos-ui]]** — design resolution and Fit Width/Height, anchoring to the real screen edge with Widget, Label traps, and why long lists must recycle cells.
- **[[cocos-input-physics]]** — node-level versus global touch, coordinate conversion, 2D physics with groups and sensors, and when **not** to use a physics engine.
- **[[cocos-animation-audio]]** — tweens, Spine cache modes, a particle budget, hitstop without `Time.timeScale`, and the browser autoplay policy.

**Operations**
- **[[cocos-assets-bundle]]** — three ways to load an asset, splitting bundles by "when it is needed", reference counting and its three leaks.
- **[[cocos-optimization]]** — measure before you change, draw-call batching rules, GC garbage sources, the hidden cost of `update`, and a low-end budget.
- **[[cocos-minigame]]** — WeChat/Douyin/Zalo: package limits, subpackages, domain allowlists, the three-step login and platform-SDK payments.
- **[[cocos-hot-update]]** — manifests, CDN, the fallback when a download fails, staged rollout and a sub-five-minute rollback.

**Genre demos**
- **[[cocos-demo-shooter]]** — a vertical shooter: system architecture, waves from JSON, bullet patterns, TTK balancing, a 300-bullet budget.
- **[[cocos-demo-casino]]** — slots and card games: the server decides, weight tables, an RTP pinned by tests, and the legal boundary.

One node is still missing, on **native builds and on-device debugging** (no IL2CPP here, but `jsb`, symbolication and remote debugging all apply) — said out loud so nobody assumes this branch is complete.

## Cocos or Unity

Do not choose by taste or by the engine you happen to know. Choose by **where the game opens**:

| If the output is… | Engine | Why |
|---|---|---|
| A link opened in Zalo / Messenger / a web page | **Cocos** | Small engine payload, opens and runs, no long "Loading 60%" |
| A mini game inside a super app (WeChat, Douyin, Facebook Instant) | **Cocos** | Ready-made targets per platform; this is not Unity's arena |
| A 2D game for low-end Android | **Cocos** | Faster startup, smaller memory footprint |
| A 3D game, or anything visually heavy | **Unity** | Pipeline, tooling and 3D ecosystem win outright |
| Console, VR/AR | **Unity** | Cocos is essentially absent |
| A project leaning on many third-party plugins | **Unity** | The Asset Store has no rival — see [[unity-third-party]] |

Two claims that get overstated and deserve precision:

- **"Cocos is lighter"** is true for web builds, and true by an order of magnitude: a module-trimmed 2D `web-mobile` build lands around **1 MB** of engine after compression, while a minimal Unity WebGL build is several times heavier. On native (APK/IPA) the gap narrows considerably — so do not pick Cocos "because it is lighter" for a store-only title. Measure your own build; do not take a number from an article.
- **"Cocos uses TypeScript so AI helps more"** is **backwards**. Models know C#/Unity far better, and most of the Cocos material in training data is the **dead 2.x API**. See the 🤖 section below — that is the biggest practical difference when building Cocos with AI.

There is a third option people forget: **use both**. Cocos for a fast H5 release to test the market, Unity for the store build — provided the logic (economy, balance, data tables) lives where both can share it, meaning in data and on the server. See [[data-driven-design]] and [[backend-go]].

<figure class="fig">
<svg viewBox="0 0 660 270" role="img" aria-label="One Cocos project builds three ways: web-mobile opened in Zalo or Messenger, native Android and iOS on stores with hot update, and mini games inside super apps with package limits">
  <defs>
    <marker id="cc-a-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="8"   y="96"  width="150" height="78" rx="9" class="fig-box"/>
    <rect x="214" y="8"   width="190" height="60" rx="9" class="fig-box"/>
    <rect x="214" y="94"  width="190" height="60" rx="9" class="fig-box"/>
    <rect x="214" y="180" width="190" height="60" rx="9" class="fig-box"/>
    <rect x="452" y="8"   width="196" height="60" rx="9" class="fig-box"/>
    <rect x="452" y="94"  width="196" height="60" rx="9" class="fig-box"/>
    <rect x="452" y="180" width="196" height="60" rx="9" class="fig-box"/>
  </g>
  <text x="83"  y="128" text-anchor="middle" class="fig-label" font-size="13">One Cocos project</text>
  <text x="83"  y="148" text-anchor="middle" class="fig-muted" font-size="11">assets/ + TypeScript</text>
  <text x="309" y="34"  text-anchor="middle" class="fig-label" font-size="13">web-mobile build</text>
  <text x="309" y="54"  text-anchor="middle" class="fig-muted" font-size="11">one folder of HTML + JS</text>
  <text x="309" y="120" text-anchor="middle" class="fig-label" font-size="13">native build</text>
  <text x="309" y="140" text-anchor="middle" class="fig-muted" font-size="11">Android · iOS · C++ engine</text>
  <text x="309" y="206" text-anchor="middle" class="fig-label" font-size="13">mini game build</text>
  <text x="309" y="226" text-anchor="middle" class="fig-muted" font-size="11">WeChat · Douyin · Instant</text>
  <text x="550" y="34"  text-anchor="middle" class="fig-label" font-size="13">Opens in Zalo / Messenger</text>
  <text x="550" y="54"  text-anchor="middle" class="fig-muted" font-size="11">no install, tap and play</text>
  <text x="550" y="120" text-anchor="middle" class="fig-label" font-size="13">Store + hot update</text>
  <text x="550" y="140" text-anchor="middle" class="fig-muted" font-size="11">swap assets without review</text>
  <text x="550" y="206" text-anchor="middle" class="fig-label" font-size="13">Package capped at a few MB</text>
  <text x="550" y="226" text-anchor="middle" class="fig-muted" font-size="11">no DOM, its own SDK</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cc-a-en)" fill="none">
    <path d="M158 118 Q186 118 186 38 H210"/>
    <path d="M158 135 H210"/>
    <path d="M158 152 Q186 152 186 210 H210"/>
    <path d="M404 38 H448"/>
    <path d="M404 124 H448"/>
    <path d="M404 210 H448"/>
  </g>
</svg>
<figcaption>One codebase, three build paths — but the constraints in the right-hand column differ completely. Choose the shipping path before the first line of code, because that column dictates both the asset-loading architecture and the size budget.</figcaption>
</figure>

## The Unity → Cocos 3.x map

If you are arriving from Unity, this table saves the most days:

| Unity | Cocos Creator 3.x | Where it differs |
|---|---|---|
| GameObject | `Node` | UI is made of nodes too; there is no separate hierarchy |
| MonoBehaviour | `Component` + `@ccclass('Name')` | The class must be exported, and the filename should match |
| `[SerializeField]` | `@property` | Complex types must be declared: `@property(Node)` |
| `Awake` / `Start` / `Update` / `LateUpdate` | `onLoad` / `start` / `update(dt)` / `lateUpdate(dt)` | `dt` is a **parameter**; there is no global `Time.deltaTime` |
| `OnEnable` / `OnDisable` / `OnDestroy` | `onEnable` / `onDisable` / `onDestroy` | Identical |
| `Instantiate` / `Destroy` | `instantiate()` / `node.destroy()` | `destroy()` takes effect at the **end of frame**, not immediately |
| `DontDestroyOnLoad` | `game.addPersistRootNode(node)` | The node must be a root node |
| `Resources.Load` | `resources.load(path, Type, cb)` | Asynchronous with a callback — there is no sync variant |
| AssetBundle / Addressables | Asset Bundle (`assetManager.loadBundle`) | The **primary** mechanism, not an advanced option — compare with [[unity-addressables]] |
| `SceneManager.LoadScene` | `director.loadScene` / `director.preloadScene` | |
| Coroutines, `yield return` | `async/await` or `this.scheduleOnce` | No coroutines; `async` is the main road |
| RectTransform + Canvas Scaler | `UITransform` + `Widget` + Canvas design resolution | Anchoring (`Widget`) is a separate component you add |
| Animator Controller | `Animation` (clips) or 3.8's animation graph | A much thinner state machine than Animator |
| DOTween | `tween()` built into the engine | Nothing to install |
| ScriptableObject | **No equivalent** | The biggest architectural difference — read on |

**That last row is where it hurts.** Many patterns in [[unity-design-patterns]] lean on ScriptableObject for data and event channels. Cocos has no such thing. Practical replacements:

- **Config data** → JSON files under `assets/`, loaded through `JsonAsset`, with a TS `interface` describing the shape so `any` does not spread. Add a validation script in CI — see [[data-driven-design]].
- **Event channels** → a shared `EventTarget` (the engine ships the class), or your own event bus. Remember to **remove listeners in `onDisable`**: nobody does it for you, and a destroyed node with a live listener is the classic leak.

## Writing a component the 3.x way

```ts
import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Mover')
export class Mover extends Component {
    @property speed = 240;                      // number inferred from the default
    @property(Node) target: Node = null!;       // complex types must be declared

    private _pos = new Vec3();                  // reused: no allocation per frame

    onEnable() {
        this.node.on(Node.EventType.TOUCH_END, this.onTap, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_END, this.onTap, this);
    }

    update(dt: number) {
        // WRONG: this.node.position.x += this.speed * dt
        // position returns the internal vector; mutating it does NOT mark the transform dirty.
        this.node.getPosition(this._pos);
        this._pos.x += this.speed * dt;
        this.node.setPosition(this._pos);
    }

    private onTap() {
        this.speed = -this.speed;
    }
}
```

Three things in that snippet are rules, not style:

1. **Use `setPosition`; never mutate `position` in place.** The same holds for `UITransform.contentSize` and `Node.scale`. Nothing is logged: the object holds the right value and the screen does not move.
2. **No `new Vec3()` inside `update`.** Web and mini games run on JS engines with stop-the-world GC; garbage in a hot loop becomes rhythmic stutter. Same principle as [[unity-csharp-memory]], minus the structs to escape into.
3. **Remove listeners in `onDisable`.** The `on`/`off` pair must match all three arguments (event, handler, `this`) to unregister correctly.

## UI: lock the ratio first, build screens second

The Canvas has a **design resolution** plus `Fit Width` / `Fit Height`. Four combinations, four behaviours:

| Fit Width | Fit Height | Result |
|---|---|---|
| ✓ | ✗ | Width fixed, height flexes — **the default for portrait games** |
| ✗ | ✓ | Height fixed, width flexes — **the default for landscape** |
| ✓ | ✓ | Content always fits, empty bars allowed |
| ✗ | ✗ | Fills the screen, crops the overflow |

The least painful process: pick a design resolution (720×1280 portrait, 1280×720 landscape), tick **one** axis, then **anchor every HUD element with `Widget`** to the real screen edge rather than to the design resolution. Add the `SafeArea` component for status bars and notches. Verify by switching the preview to 4:3 and then 20:9 — if the HUD only looks right at one ratio you anchored it wrong, and that never shows up on your own device.

HUD design principles do not change with the engine — see [[ux-hud]] and [[ui-design]].

## Performance: draw calls and package size

Two numbers decide whether an H5 game is playable on cheap hardware.

**Draw calls.** Cocos batches adjacent elements sharing a texture and a material. What breaks batching, most common first:

- A sprite from a different atlas placed in between → **node order decides the draw-call count**. Group by atlas, not by logical meaning.
- `Label` renders its own texture by default. Static text → `BITMAP` (joins the dynamic atlas); fast-changing numbers (score, timer) → `CHAR` (shared character atlas).
- `Mask` uses the stencil buffer: **+2 draw calls each**, plus a broken batch chain. Three nested masks in a scroll list is the surest way to lose frames on weak hardware.
- `Graphics` batches with nothing.

Practical target for one H5 screen: **under ~50 draw calls**. Turn on the stats panel and step through your screens — the measurement takes thirty seconds, so do not guess. General "measure before you fix" habits live in [[performance]] and [[unity-optimization]].

**Package size.** A constraint Unity developers barely think about:

- Mini games cap the **main package at a few MB** (WeChat around 4 MB, roughly 20 MB total with subpackages). These numbers change over time — check the official docs before planning, and do not trust the figure in any article, including this one.
- The way to live with it is Asset Bundles: the main package holds the first screen and whatever the **first frame** needs; the rest sits in a `remote` bundle pulled from a CDN while the player is on the menu.
- Textures take the space, not code. Auto Atlas (`.pac`) for sprites, per-platform compression, and **never let an uncompressed 2048 PNG** into the main package.
- Audio on the web: preloading background music is the most common cause of a long first load. Stream music, preload only short effects.

## The four most expensive traps

**1. Mixing 2.x and 3.x APIs.** The number one trap, arriving from every direction: old blogs, forums, and AI. Recognise it in three seconds:

| If you see this, it is 2.x (dead) | The 3.x form |
|---|---|
| `cc.Class({ extends: cc.Component, properties: {...} })` | `@ccclass` + `export class X extends Component` |
| `cc.v2(x, y)`, `cc.Vec2` | `v3(x, y, 0)`, `Vec3` |
| `this.node.width`, `this.node.height` | `this.node.getComponent(UITransform).contentSize` |
| `cc.find`, `cc.director`, `require(...)` | `find`, `director`, `import { ... } from 'cc'` |

Pasted into a 3.x project, 2.x code either fails to compile or — worse — compiles and fails silently.

**2. `.meta` and uuid.** Every asset has a `.meta` holding a uuid, and scenes and prefabs reference assets **by uuid, not by path**. Renaming, moving or deleting an asset **outside the Editor** silently breaks those references — you open the scene and find empty slots. The rule: do asset operations in the Editor, commit every `.meta`, and **never** commit `library/`, `temp/`, `build/`. The same `.meta` lesson as Unity — see [[unity-project-structure]].

**3. A mini game is not a browser.** No `document`, no `new Image()`, no dynamic script loading, and network requests must go to domains declared with the platform. DOM-based code runs happily on `web-mobile` and dies the moment you package for WeChat/Douyin. The rule: go through engine APIs (`sys`, `assetManager`, `director`), and **build to the real target platform in week one**, not in the final week.

**4. There is no shared `Time.timeScale`.** Cocos has no switch that slows the whole world. Pause and slow motion must be built in three places: scale your own gameplay `dt`, disable `PhysicsSystem2D.instance.enable` (or `PhysicsSystem2D`), and pause tweens with `Tween.pauseAllByTarget`. Miss the third and the game "pauses" while effects keep running — and [[game-feel]] breaks at the exact moment the player is watching.

A few smaller but near-certain traps: web audio will not play until the first touch (resume inside a touch handler); `sys.localStorage` is only about 5 MB on the web with its own quota on mini games, so large saves belong on a server ([[backend-go]]); and `node.on(TOUCH_START)` only fires if the node has a correctly sized `UITransform`.

## Hot update — what Unity does not hand you easily

On native builds, Cocos ships `AssetsManager` with two manifests (`project` and `version`): the app starts, compares manifests, downloads the delta and overlays it. That means **changing balance numbers, swapping assets and patching script bugs without waiting for store review** — for a live-ops game running weekly events, that alone justifies the choice. See [[liveops]] for the operational cadence it serves.

Three prices to accept: you own the CDN and version management; you need a fallback when a download fails halfway (losing connectivity at 70% is an everyday event); and on iOS updates must stay within Apple's rules — fixing bugs and changing content is fine, **turning it into a different game is not**.

## 🤖 Prompt for AI

**How to use AI when building with Cocos Creator**

The most important thing to know before your first prompt: **AI knows Cocos far less well than Unity, and most of what it knows is 2.x**. Cocos 2.x lived a long time with plenty of documentation; 3.x changed nearly the entire API surface. In practice the model answers confidently with a dead API, and because this stage has no compiler as strict as C#, the mistakes survive until runtime.

So split the work by **how much it touches the engine**, not by difficulty:

| Delegate | Do yourself, or review closely |
|---|---|
| Pure TS logic: economy, state machines, algorithms, data parsing, tests | Any code calling a `cc` API — check it line by line against the 2.x/3.x table |
| Translating Unity concepts to Cocos (using the map above) | Scene structure and node order — what decides draw calls |
| Tooling scripts: config JSON validation, atlas generation, CI scripts | Build configuration per mini game platform |
| Rewriting 2.x into 3.x **when you supply a 3.x sample from your own project** | Package limits and bundle splits — those need measurement |

**Hard boundary:** the agent **does not edit** `.scene`, `.prefab` or `.meta`. They are uuid-bearing JSON; editing them by hand silently breaks references exactly the way editing a Unity `.prefab` does. See [[ai-limits]].

A trick more effective than any instruction: **paste an existing 3.x component from your project** at the start of the session and say *"write in this style, using exactly this API set"*. One real example anchors the model to 3.x better than ten sentences of "please use Cocos 3.8".

**Spell out** (or the model defaults to Cocos 2.x on desktop web):

- **The exact version** (`3.8.x`), and say outright *"do NOT use 2.x APIs"* with examples of what is banned (`cc.Class`, `cc.v2`, `node.width`).
- **Target platform**: `web-mobile`, which mini game, or native — it drives both the asset-loading architecture and which APIs are legal.
- **Design resolution and orientation** (720×1280 portrait? Fit Width?) — without it, every piece of UI code it writes anchors wrongly.
- **2D or 3D**, and which physics backend is enabled (builtin / Box2D / PhysX).
- **Budgets**: draw calls, main package MB, the weakest device that must run it.
- **TypeScript strict or not**, and which external libraries are allowed.

**Prompt template**

```
Cocos Creator 3.8.x project, TypeScript strict, portrait 2D game.
Design resolution 720x1280, Canvas has Fit Width ticked. Physics: Box2D.
Shipping to: web-mobile (opened in Zalo) + WeChat mini game.
Weakest device: 4-core Android, 3GB RAM. Budget: < 50 draw calls per screen,
main package < 4MB.

CONSTRAINTS FOR ALL CODE:
- Cocos Creator 3.x APIs only, ES modules `import { ... } from 'cc'`.
  Strictly banned: cc.Class, cc.v2, cc.Vec2, node.width/height, require().
- Move things with setPosition. NEVER mutate node.position in place.
- NO allocation (new Vec3, new Array, closures) inside update().
- Listeners registered in onEnable must be removed in onDisable, all 3 arguments.
- NO document / window / new Image() — it must run as a mini game.
- DO NOT edit .scene, .prefab or .meta files. If something needs changing there,
  DESCRIBE it and I will do it by hand.

Here is a real component from the project; match this style and API surface:
<paste one of your .ts files>

Task: <describe>. Before writing, tell me which node this component belongs on and why.
```

**Common trap:** the model returns 2.x code and **insists it is 3.x** — the quickest tell is `cc.` in front of everything plus a `properties: {}` object. The second trap is more dangerous because it is invisible: it writes `this.node.position.x += v * dt`, the code reads perfectly, and the node does not move. Third trap: asking it to "optimise this" without measurements — it will reflexively suggest pooling and atlases while the real culprit is three nested `Mask` components it cannot see in your scene.

## 🎤 Interview

**Questions you will get**

- `Junior` **How do Cocos Creator 2.x and 3.x differ? Name three tells you can spot instantly.**
  → 3.x changed nearly the whole API surface: ES modules `import { Component } from 'cc'` instead of `cc.Class({...})`, `Vec3` instead of `cc.v2`, and sizing through `UITransform.setContentSize` instead of `node.width`. Those three tells identify code lifted from old blogs, and they matter because 2.x code in a 3.x project either fails to compile or fails silently.
- `Mid` **An H5 game stutters while scrolling a list on a mid-range phone. How do you find the cause?**
  → Check draw calls first with the stats panel, because long lists usually mean several `Mask` components, each costing about 2 draw calls and breaking the batch chain. If draw calls look fine, check the allocation timeline: garbage generated while scrolling comes from allocating inside the scroll callback. The real fix past ~30 rows is recycling cells, because thousands of nodes cannot be optimised away.
- `Senior` **The game must ship both as a mini game and on stores. How do you split the package and the code, and why Cocos over Unity?**
  → The main package carries only what the first frame needs, because mini games cap it at a few MB, and the rest becomes remote Asset Bundles downloaded while the player is on the menu. Economy and balance logic live in `scripts/core/` with no `'cc'` import so they are shared and testable outside the engine. Cocos wins because the output is a link opened inside a chat app: a module-trimmed 2D web build is around 1 MB of engine, where Unity WebGL is several times that.

**60-second answer** — "Why Cocos Creator for this project?"

> I choose by where the game opens, not by the engine I know. The output here is a link inside a chat app plus a mini game build, so what matters is size and time to the first frame: a module-trimmed 2D web build of Cocos is about one megabyte of engine, and the mini game main package is capped at a few megabytes, which forces me to split Asset Bundles from day one rather than optimising later. In exchange I accept three costs: a much thinner plugin ecosystem than Unity, effectively no 3D, and weaker AI assistance because most material out there is still 2.x. If the output were a 3D store title, I would have picked Unity.

**Where they dig**

- *"How exactly do you split bundles?"* → The main package holds only what the first frame needs, the rest downloads in the background while the player is on the menu, and there is a fallback when a download fails.
- *"How many draw calls is too many?"* → Explain the **measurement** first (stats panel, toggling UI layers), then quote under ~50 for an H5 screen and say plainly that it is a practical target rather than a law.
- *"Why does `node.position.x += 1` do nothing?"* → Because that is the internal vector; mutating it does not mark the transform dirty, so you must call `setPosition`. This question separates people who have shipped from people who have read.
- *"What are the risks of hot update?"* → You own the CDN and versioning, a mid-download failure must be recoverable, and store policy sets the boundary.

**Red flags**

- Saying "Cocos is lighter than Unity" without distinguishing web from native — the order-of-magnitude claim only holds on web.
- Answering with 2.x APIs for a 3.x project. An interviewer who hears `cc.v2` knows where the knowledge came from.
- "For optimisation you use object pooling" — true but empty, and proposing anything before measuring is a red flag in any engine.
- Not knowing what `.meta` is for. It is where every reference lives, and the most frequent source of Git conflicts on a team.

**Numbers and examples to know cold**

- Mini game main package: a few MB (WeChat around 4 MB, roughly 20 MB total with subpackages) — plus the words "these change, check the docs".
- Draw-call target for an H5 screen: under ~50.
- Each `Mask` costs about 2 extra draw calls.
- Common design resolutions: 720×1280 portrait, 1280×720 landscape; portrait ticks Fit Width.
- `localStorage` on the web is about 5 MB — the threshold for moving saves to a server.
