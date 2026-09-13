---
title: Animation, tween & audio
summary: Animation clips, Spine cache modes, tweening without leaks, a particle budget, and audio on the web — where the browser forbids sound until the player touches the screen.
---

This node is the **feel** layer: what makes a hit land with weight instead of falling flat. The theory in [[game-feel]] and [[animation-game]] does not change with the engine; this is how it is done in Cocos, plus one web-only trap that no tutorial states loudly enough: **browsers block audio until the player has interacted with the page**.

## Three ways to move things, and which to pick

| Approach | When | Cost |
|---|---|---|
| `tween()` | Motion the code decides: rise, scale, fade, count up | Cheapest, needs no asset |
| `Animation` + clip | Motion an artist authored frame by frame | Medium |
| Spine / DragonBones | Skeletal characters with many states, reused a lot | Highest — see cache modes below |

A common mistake: authoring an Animation clip for a "scale up then settle" bounce that three lines of tween would do, with numbers you can tune right in the code.

## Tween: powerful, and easy to leak

```ts
import { tween, Vec3 } from 'cc';

tween(node)
    .to(0.12, { scale: new Vec3(1.25, 0.8, 1) }, { easing: 'quadOut' })   // squash
    .to(0.18, { scale: Vec3.ONE }, { easing: 'backOut' })                 // settle
    .start();
```

Three rules whenever tweens meet pooling ([[cocos-scene-component]]):

1. **Call `Tween.stopAllByTarget(node)` before returning a node to the pool.** Otherwise the previous owner's tween is still running and drags the reused node around.
2. **Do not tween `node.position` by mutating the vector in place.** Tween calls `setPosition` for you; your code reaching in halfway breaks it.
3. **A tween on a destroyed node does not always stop itself** — stop it explicitly in `onDisable`.

Useful chain links: `.delay()`, `.call()`, `.union()` (group a stretch so `repeat` covers all of it), `.repeatForever()`. For two things at once, run two tweens on two targets rather than forcing one chain.

## Spine: cache mode is the biggest single lever

Spine in Cocos has three modes, and the gap between them is large:

| Mode | How it runs | Use for |
|---|---|---|
| `REALTIME` (default) | Skeleton solved on the CPU every frame | The hero: blending, attaching weapons to bones |
| `SHARED_CACHE` | Solved **once**, every instance shares it | **Small enemies that appear by the dozen** |
| `PRIVATE_CACHE` | Solved once per instance | Middle ground: each instance can be out of phase |

```ts
skeleton.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
skeleton.setAnimation(0, 'run', true);
```

Flipping 30 small enemies from `REALTIME` to `SHARED_CACHE` is often a one-line change worth several fps on weak hardware. The price: cached animation cannot blend, cannot be bone-manipulated at runtime, and the mode must be set **before** `setAnimation`.

## Particles: give them a budget and a pool

`ParticleSystem2D` looks great and costs real money. Two rules:

- **Budget first, effects second.** For example: at most 6 explosions on screen, at most 30 particles each. Over budget, drop the oldest rather than queueing.
- **Pool the effects too.** Instantiating a particle prefab per explosion is a reliable way to produce GC sawtooth.

Hit feedback often needs **no** particles at all: a frame freeze (hitstop), a white flash and a rising number read better and cost far less. See [[game-feel]].

## Hitstop and screen shake without `Time.timeScale`

Cocos has no switch that slows the whole world. You build it, and you touch three places:

```ts
// GameClock.ts — gameplay systems take dt from here, never straight from update
export class GameClock {
    private freeze = 0;
    scale = 1;
    hitstop(seconds: number) { this.freeze = Math.max(this.freeze, seconds); }
    /** Returns the adjusted dt. Call once per frame from the lowest executionOrder. */
    step(rawDt: number): number {
        if (this.freeze > 0) { this.freeze -= rawDt; return 0; }
        return rawDt * this.scale;
    }
}
```

Pausing or slowing down must reach: **gameplay dt** (above), **`PhysicsSystem2D.instance.enable`** if physics is on, and **tweens** (`Tween.pauseAllByTarget`). Forgetting the third is the most common version of this bug: the game "pauses" while the UI keeps gliding, which reads as broken.

## Audio: the web-only trap

Browsers **block all audio until the player's first interaction**. An H5 game that starts its music in `start()` will be silent, log nothing, and still play fine on your dev machine (because you just clicked the window). That is the whole story behind "it has music locally but not on the host".

The correct fix: **prime audio inside the first touch handler**.

```ts
import { director, Node } from 'cc';

private primed = false;
onEnable() { director.getScene()!.on(Node.EventType.TOUCH_START, this.prime, this, true); }

private prime() {
    if (this.primed) return;
    this.primed = true;
    this.bgm.play();               // first touch: start the music
    director.getScene()!.off(Node.EventType.TOUCH_START, this.prime, this, true);
}
```

Four more audio facts:

- **`playOneShot(clip, volume)`** for short effects — it does not occupy an `AudioSource` and overlapping sounds work. `play()` is for music.
- **Never preload long music.** A three-minute track loaded up front is the most common cause of a slow first screen. Stream it.
- **One `AudioSource` for music, a small pool for effects** — calling `addComponent(AudioSource)` per sound is a leak.
- **On mini game platforms** audio goes through the host's API, and the limit on simultaneous sounds is tighter than on the web. Test on a real device early — see [[cocos-minigame]].

## 🤖 Prompt for AI

**How to use AI on the feel layer**

The paradox: AI writes a "squash then stretch" tween chain instantly, but it **has no way of knowing which numbers feel right** — 0.12 seconds versus 0.4 is the difference between punchy and sluggish. So:

| Delegate | Keep for yourself |
|---|---|
| Scaffolding: GameClock, effect pools, sound queues, a shake function | **Every duration and amplitude** — tuned by eye |
| Audio priming, autoplay policy handling, AudioSource management | Which effect belongs to which action |
| Porting Unity DOTween code to Cocos `tween()` | The particle budget |
| A script that flips many Spine instances to SHARED_CACHE | Which ones stay REALTIME |

**Spell out** (or it invents both numbers and APIs):

- **Whether Spine/DragonBones is in use**, and which characters need blending.
- **Whether pooling is in play** — if so, `Tween.stopAllByTarget` on return is mandatory.
- **How pause/slow-motion works** in your project (is there a `GameClock`).
- **Platform**: web or mini game — it changes audio handling.
- **Budgets**: how many simultaneous effects, how many particles each.

**Prompt template**

```
Cocos Creator 3.8.x, TypeScript strict, 2D shooter, targets web-mobile + WeChat.
GameClock.step(dt) already returns the adjusted dt; all gameplay uses it.
A Pool class already exists. Budget: max 6 simultaneous explosions, 30 particles each.

Task: write a `JuiceKit` exposing hitstop(ms), shake(strength, duration) and
popupDamage(position, amount), all built on tween and the pool.

CONSTRAINTS:
- 3.x API only. Ban cc.tween / cc.v2 / node.width.
- Nodes returning to the pool MUST call Tween.stopAllByTarget first.
- No Vec3 allocation in the per-hit path — reuse vectors.
- Audio: playOneShot for effects; NEVER addComponent(AudioSource) per sound.
- Every duration is an @property tunable in the Inspector, never hardcoded.

State the defaults you chose and why — I will retune them by eye.
```

**Common trap:** the model creates a fresh `AudioSource` for every sound effect — after a few minutes there are hundreds of live components, sounds start lagging, and memory climbs. Second trap: it starts the music in `start()` and declares the job done, while on a real host the game is silent because of the autoplay policy.

## 💻 Code

A minimum juice kit: hitstop, screen shake, rising damage numbers. These three carry about 80% of the feel.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 260" role="img" aria-label="Hierarchy: GameRoot with JuiceKit and audio; Canvas with a ShakeRoot and a PopupLayer outside it; Inspector for JuiceKit durations">
  <g class="fig-box-g">
    <rect x="10"  y="16" width="280" height="228" rx="9" class="fig-box"/>
    <rect x="320" y="16" width="326" height="228" rx="9" class="fig-box"/>
  </g>
  <text x="26"  y="40"  class="fig-muted" font-size="11">HIERARCHY</text>
  <text x="26"  y="68"  class="fig-label" font-size="13">▾ GameRoot</text>
  <text x="42"  y="92"  class="fig-muted" font-size="12">JuiceKit.ts · AudioSource (BGM)</text>
  <text x="26"  y="122" class="fig-label" font-size="13">▾ Canvas</text>
  <text x="42"  y="146" class="fig-muted" font-size="12">ShakeRoot   ← everything that shakes</text>
  <text x="58"  y="170" class="fig-muted" font-size="12">GameLayer · UILayer</text>
  <text x="42"  y="198" class="fig-muted" font-size="12">PopupLayer  ← damage numbers, NO shake</text>
  <text x="336" y="40"  class="fig-muted" font-size="11">INSPECTOR — JuiceKit</text>
  <text x="336" y="68"  class="fig-label" font-size="13">Shake Root</text>
  <text x="580" y="68"  class="fig-muted" font-size="12">ShakeRoot</text>
  <text x="336" y="96"  class="fig-label" font-size="13">Popup Layer</text>
  <text x="580" y="96"  class="fig-muted" font-size="12">PopupLayer</text>
  <text x="336" y="124" class="fig-label" font-size="13">Hitstop Seconds</text>
  <text x="580" y="124" class="fig-muted" font-size="12">0.06</text>
  <text x="336" y="152" class="fig-label" font-size="13">Shake Seconds</text>
  <text x="580" y="152" class="fig-muted" font-size="12">0.18</text>
  <text x="336" y="180" class="fig-label" font-size="13">Popup Rise</text>
  <text x="580" y="180" class="fig-muted" font-size="12">90</text>
</svg>
<figcaption>Damage numbers live outside <code>ShakeRoot</code> — text that shakes with the screen is unreadable.</figcaption>
</figure>

**Script**

```ts
// JuiceKit.ts — hitstop, screen shake, damage numbers. Every duration is Inspector-tunable.
import { _decorator, Component, Node, Prefab, Vec3, Label, tween, Tween,
         instantiate, AudioSource, AudioClip, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JuiceKit')
export class JuiceKit extends Component {
    @property(Node) shakeRoot: Node = null!;
    @property(Node) popupLayer: Node = null!;
    @property(Prefab) popupPrefab: Prefab = null!;
    @property(AudioSource) sfxSource: AudioSource = null!;
    @property hitstopSeconds = 0.06;
    @property shakeSeconds = 0.18;
    @property shakeAmount = 12;
    @property popupRise = 90;
    @property popupSeconds = 0.55;

    private freeze = 0;
    private pool: Node[] = [];
    private readonly home = new Vec3();
    private readonly tmp = new Vec3();

    onLoad() { this.shakeRoot.getPosition(this.home); }

    /** Call at the top of each frame. Returns 0 while frozen → gameplay stops, UI keeps running. */
    step(rawDt: number): number {
        if (this.freeze > 0) { this.freeze -= rawDt; return 0; }
        return rawDt;
    }

    hitstop(seconds = this.hitstopSeconds) {
        this.freeze = Math.max(this.freeze, seconds);
    }

    shake(scale = 1) {
        Tween.stopAllByTarget(this.shakeRoot);
        const amp = this.shakeAmount * scale;
        const step = this.shakeSeconds / 4;
        tween(this.shakeRoot)
            .to(step, { position: new Vec3(this.home.x + amp, this.home.y - amp * 0.6, 0) })
            .to(step, { position: new Vec3(this.home.x - amp * 0.7, this.home.y + amp * 0.4, 0) })
            .to(step, { position: new Vec3(this.home.x + amp * 0.35, this.home.y, 0) })
            .to(step, { position: this.home.clone() })
            .start();
    }

    popupDamage(worldPos: Vec3, amount: number, crit = false) {
        const n = this.pool.pop() ?? instantiate(this.popupPrefab);
        if (!n.parent) n.setParent(this.popupLayer);
        Tween.stopAllByTarget(n);                       // MANDATORY before reuse
        n.active = true;
        n.setPosition(worldPos);
        n.setScale(crit ? 1.4 : 1, crit ? 1.4 : 1, 1);

        n.getComponent(Label)!.string = String(amount);
        const op = n.getComponent(UIOpacity) ?? n.addComponent(UIOpacity);
        op.opacity = 255;

        this.tmp.set(worldPos.x, worldPos.y + this.popupRise, 0);
        tween(n).to(this.popupSeconds, { position: this.tmp }, { easing: 'quadOut' }).start();
        tween(op).delay(this.popupSeconds * 0.5)
                 .to(this.popupSeconds * 0.5, { opacity: 0 })
                 .call(() => { n.active = false; this.pool.push(n) })
                 .start();
    }

    playSfx(clip: AudioClip, volume = 1) {
        this.sfxSource.playOneShot(clip, volume);       // never create a new AudioSource
    }

    /** One call covers a hit. */
    onHit(worldPos: Vec3, damage: number, clip?: AudioClip) {
        this.hitstop();
        this.shake(damage > 50 ? 1.6 : 1);
        this.popupDamage(worldPos, damage, damage > 50);
        if (clip) this.playSfx(clip);
    }
}
```

**Try it**
- Call `onHit` repeatedly for 30 seconds: `popupLayer.children.length` settles around 8–12 instead of climbing.
- Set `hitstopSeconds = 0.3`: the game must **visibly freeze** and resume — proof that `step()` is feeding gameplay instead of the raw dt.
- In a browser: load the page, **touch nothing**, call `playSfx` → silence (as expected). Tap once, call again → sound.

## 🎤 Interview

**Questions you will get**

- `Junior` **When do you use a tween versus an Animation clip?**
  → Tweens for motion the code owns and you want to retune quickly: scale bounces, rises, fades — three lines, no asset. Clips for motion an artist authored frame by frame. Authoring a clip for a 0.12-second squash makes life harder, because every tweak means opening the Editor.
- `Mid` **The H5 build has no music on the host but does on your machine. Why?**
  → The autoplay policy: browsers block audio until the player's first interaction, and block it silently with no error. On a dev machine you already clicked the window, so it plays. The fix is to prime audio inside the first touch handler and then remove that listener.
- `Senior` **Forty Spine enemies tank the frame rate. In what order do you attack it?**
  → Switch everything that does not need blending to `SHARED_CACHE` first, because it is a one-line change and must be set **before** `setAnimation`. The cost is no blending and no bone attachments, so the hero stays `REALTIME`. If that is still not enough, reduce how many are on screen rather than degrading the hero's animation.

**60-second answer** — "No audio on the web build. What happened?"

> Almost certainly the autoplay policy: browsers block audio until the player's first interaction. On a dev machine you just clicked the window so it plays, but a player opens the link, touches nothing, and the `play()` in `start()` is silently blocked with no error at all. The fix is to prime audio inside the first touch handler and then remove the listener. I also keep one `AudioSource` for music and use `playOneShot` for effects, because creating a new `AudioSource` per sound both leaks and makes playback drift late. On mini game platforms audio goes through the host API with tighter limits, so I test on a real device early.

**Where they dig**

- *"Spine is killing the frame rate — first move?"* → Switch everything that does not need blending to `SHARED_CACHE`, and set it **before** `setAnimation`. A one-line win.
- *"What do you give up with cache mode?"* → No blending, no runtime bone manipulation, no attaching objects to moving bones.
- *"How do you pause in Cocos?"* → There is no `Time.timeScale`. Three places: gameplay dt, `PhysicsSystem2D.enable`, and tweens.
- *"What does returning to a pool require?"* → `Tween.stopAllByTarget` first, then a state reset. Skip it and the old tween drags the new object.

**Red flags**

- Authoring Animation clips for things a three-line tween handles.
- Not knowing the autoplay policy and blaming "the host".
- Creating a new `AudioSource` for every sound.
- Effects with no budget: every explosion plays, then surprise at the frame rate three minutes in.

**Numbers and examples to know cold**

- Hitstop for a normal hit: **0.05–0.08 s**. Past 0.15 it reads as a stall.
- Squash/stretch: **0.10–0.15 s** per leg.
- Spine: `SHARED_CACHE` for small enemies, `REALTIME` for the hero.
- Pausing touches **three** places: gameplay dt · physics · tweens.
- Web audio only plays **after the player's first interaction**.
