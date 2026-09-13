---
title: Assets & Bundles
summary: Three ways to load an asset, splitting Asset Bundles to keep the main package small, reference counting and its three leaks, and preloading while the player is still on the menu.
---

In Unity, Addressables is something you add once the project is big enough. In Cocos, **Asset Bundles are the main mechanism** — mini game size limits and H5 load times force you to split from day one rather than optimise later.

## Three ways to get an asset

| Approach | Where the asset lives | Use when |
|---|---|---|
| `@property(SpriteFrame)` wired in the Editor | **Packed with** the scene or prefab that holds it | Always-needed things: core UI, the player character |
| `resources.load(path, Type, cb)` | The `assets/resources/` folder | Rarely — everything under `resources/` lands in the main package |
| `bundle.load(path, Type, cb)` | A folder configured as a bundle | **The default for large content**: levels, events, skins |

A practical rule: **keep `resources/` as small as possible**. Everything in it sits in the main package, and the main package is the one with a hard size limit.

## Configuring a bundle

Select a folder in the Editor → tick *Configure as Bundle*. Four options matter:

- **Bundle Name** — what you pass to `loadBundle('name')`. Renaming breaks every call site.
- **Priority** — higher-priority bundles load first when they compete.
- **Compression Type** — `Merge Dep` merges dependencies for fewer requests (good on the web), `Zip` is smaller but costs decompression time on weak devices.
- **Is Remote Bundle** — the bundle lives on a CDN instead of inside the installed package. This switch is what decides whether your main package is small or huge.

```ts
import { assetManager, SpriteFrame } from 'cc';

assetManager.loadBundle('level-pack', (err, bundle) => {
    if (err) { /* handle: retry, or tell the player */ return; }
    bundle.load('bg/level-3', SpriteFrame, (e, frame) => { /* … */ });
});
```

## Split by "when it is needed", not by "what type it is"

The common wrong split: `textures`, `audio`, `prefabs`. It looks tidy and helps nobody, because playing level 1 still requires all three.

The right split follows the **player's journey**:

<figure class="fig">
<svg viewBox="0 0 660 260" role="img" aria-label="Main package holds boot and core UI; the game bundle downloads in the background while the player is on the menu; the event bundle loads only when the event opens">
  <defs>
    <marker id="cab-a-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="20"  width="190" height="66" rx="9" class="fig-box"/>
    <rect x="244" y="20"  width="190" height="66" rx="9" class="fig-box"/>
    <rect x="478" y="20"  width="168" height="66" rx="9" class="fig-box"/>
    <rect x="10"  y="150" width="636" height="80" rx="9" class="fig-box"/>
  </g>
  <text x="105" y="46"  text-anchor="middle" class="fig-label" font-size="13">Main package</text>
  <text x="105" y="66"  text-anchor="middle" class="fig-muted" font-size="11">boot · UI · font · logo</text>
  <text x="339" y="46"  text-anchor="middle" class="fig-label" font-size="13">"game" bundle</text>
  <text x="339" y="66"  text-anchor="middle" class="fig-muted" font-size="11">downloads while on the menu</text>
  <text x="562" y="46"  text-anchor="middle" class="fig-label" font-size="13">"event" bundle</text>
  <text x="562" y="66"  text-anchor="middle" class="fig-muted" font-size="11">only when the event opens</text>
  <text x="328" y="176" text-anchor="middle" class="fig-label" font-size="13">Split rule: whatever the FIRST FRAME needs goes in the main package; the rest is remote</text>
  <text x="328" y="200" text-anchor="middle" class="fig-muted" font-size="11">A player spends 3 seconds reading the menu — those are 3 free seconds of download</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cab-a-en)" fill="none">
    <path d="M200 53 H240"/>
    <path d="M434 53 H474"/>
  </g>
</svg>
<figcaption>Time the player spends on the menu is a free resource. Spend it preloading.</figcaption>
</figure>

`preload` downloads without **building** the assets — cheap and jank-free:

```ts
// On the menu: pull the game bundle down without blocking the UI
bundle.preload('scenes/level-1', SceneAsset, (finished, total) => {
    this.progress.progress = finished / total;
});
```

## Reference counting and its three leaks

Cocos assets are **reference counted**. Misunderstanding this produces two opposite symptoms: running out of memory, or **images turning into white boxes mid-game**.

| Leak type | Symptom | Cause |
|---|---|---|
| Holding references | RAM climbs, long sessions crash | A static or cached array still points at the old level's assets |
| Releasing too early | Sprites go white, text disappears | `release` on an asset that live nodes still use |
| Releasing the wrong tree | Random missing art in later levels | `bundle.releaseAll()` while another bundle shares those assets |

The safe order of preference:

1. **Let the engine handle it** in most cases: scenes can auto-release their assets on exit.
2. **Use `addRef()` / `decRef()`** when you deliberately keep an asset across scenes.
3. **Only call `bundle.releaseAll()`** for a clearly independent bundle, such as an event that just closed.

```ts
// Keeping an asset across scenes: raise the count, and remember to lower it
this.icon = frame;
this.icon.addRef();
// …
this.icon.decRef();
this.icon = null!;
```

The leak test is simple: play menu → level → menu **five times**, then look at memory. The graph should return close to its starting level each round. A staircase means a leak.

## Remote bundles and versioning

Remote bundles live on a CDN. Two things to settle before shipping:

- **A CDN address per environment** (dev / staging / live), never hardcoded in game code.
- **Version hashes**: the build emits hashed filenames, so updating content changes the URL and players never get a stale cache. Do not disable hashing "to make debugging easier" and then forget to re-enable it — that is how you create a "players see old content" bug that you cannot reproduce locally.

Remote downloads **must have a fallback path**: losing 3G at 70% is an everyday event. Retry with backoff, and if it still fails, tell the player in plain language instead of hanging on a loading screen forever.

## 🤖 Prompt for AI

**How to use AI for asset loading**

Here AI writes code that **works on a fast machine** and then breaks in the hardest place to reproduce: slow networks, dropped connections, players quitting halfway. So make it write the **failure paths first** and the happy path second.

| Delegate | You decide |
|---|---|
| An `AssetService`: loadBundle with retry, preload with progress, queues | Which bundles exist and which are remote |
| Porting Unity Addressables code to Cocos bundles | What the first frame genuinely needs |
| A CI script that checks main-package size | The size budget |
| Tests simulating slow or dropped networks | CDN addresses and the release process |

**Spell out** (or it writes for a perfect network):

- **The bundle list and which ones are remote.**
- **The main-package limit** (say 4 MB) — it cannot know this.
- **Behaviour on failure**: how many retries, then what.
- **Whether progress is shown**, and what progress is measured against.
- **Whether the player can quit mid-load** — if so, requests must be cancellable.

**Prompt template**

```
Cocos Creator 3.8.x, TypeScript strict. Targets: web-mobile + WeChat mini game.
Bundles: "ui" (local), "game" (remote), "event-tet" (remote).
Main package must stay under 4MB. Target network: Vietnamese 3G, drops happen.

Task: write an `AssetService` (singleton on GameRoot) exposing:
  loadBundle(name): Promise<AssetManager.Bundle>
  preload(bundle, paths, onProgress): Promise<void>
  releaseBundle(name): void

CONSTRAINTS:
- Retry 3 times with 0.5s / 1s / 2s backoff. Final failure rejects with a clear code.
- Cancellable: if the player leaves the loading screen, in-flight work must stop.
- NEVER release a bundle a live scene is using — check first, otherwise just warn.
- Progress is finished/total, monotonic, NEVER goes backwards.
- Write the FAILURE PATHS FIRST: list every way this can fail before writing code.
```

**Common trap:** AI sprinkles `assetManager.releaseAsset()` around "to keep memory tidy", producing random white boxes that are painful to reproduce because another node still uses that asset. Second trap: it dumps everything into `resources/` for the convenience of `resources.load`, and the main package silently blows past the mini game limit until build day.

## 💻 Code

An `AssetService` with retry and cancellation — the thing every H5 project needs and typically rewrites three times.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 220" role="img" aria-label="Flow: loadBundle is called, retried three times with backoff, success returns the bundle, final failure surfaces an error to the UI">
  <defs>
    <marker id="cab-b-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="82" width="140" height="60" rx="9" class="fig-box"/>
    <rect x="196" y="82" width="180" height="60" rx="9" class="fig-box"/>
    <rect x="430" y="14" width="216" height="58" rx="9" class="fig-box"/>
    <rect x="430" y="150" width="216" height="58" rx="9" class="fig-box"/>
  </g>
  <text x="80"  y="108" text-anchor="middle" class="fig-label" font-size="13">loadBundle()</text>
  <text x="80"  y="128" text-anchor="middle" class="fig-muted" font-size="11">cancellable</text>
  <text x="286" y="108" text-anchor="middle" class="fig-label" font-size="13">retry ×3</text>
  <text x="286" y="128" text-anchor="middle" class="fig-muted" font-size="11">backoff 0.5 · 1 · 2 seconds</text>
  <text x="538" y="40"  text-anchor="middle" class="fig-label" font-size="13">Bundle ready</text>
  <text x="538" y="59"  text-anchor="middle" class="fig-muted" font-size="11">cached, instant next time</text>
  <text x="538" y="176" text-anchor="middle" class="fig-label" font-size="13">Surface the error</text>
  <text x="538" y="195" text-anchor="middle" class="fig-muted" font-size="11">offer Retry, never hang</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cab-b-en)" fill="none">
    <path d="M150 112 H192"/>
    <path d="M376 100 Q403 100 403 43 H426"/>
    <path d="M376 124 Q403 124 403 179 H426"/>
  </g>
</svg>
<figcaption>The failure path gets drawn first — because it is the path real players take most often.</figcaption>
</figure>

**Script**

```ts
// AssetService.ts — bundle loading with retry, cancellation and progress. Lives on GameRoot.
import { _decorator, Component, AssetManager, assetManager, Asset } from 'cc';
const { ccclass } = _decorator;

export class LoadCancelled extends Error { constructor() { super('cancelled') } }

@ccclass('AssetService')
export class AssetService extends Component {
    static inst: AssetService;
    private cache = new Map<string, AssetManager.Bundle>();
    private cancelled = new Set<string>();

    onLoad() { AssetService.inst = this; }

    /** Cancel any in-flight load of this bundle (the player left the loading screen). */
    cancel(name: string) { this.cancelled.add(name); }

    async loadBundle(name: string, retries = 3): Promise<AssetManager.Bundle> {
        const hit = this.cache.get(name);
        if (hit) return hit;
        this.cancelled.delete(name);

        const delays = [500, 1000, 2000];
        let lastErr: unknown = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
            if (this.cancelled.has(name)) throw new LoadCancelled();
            try {
                const bundle = await new Promise<AssetManager.Bundle>((res, rej) => {
                    assetManager.loadBundle(name, (err, b) => (err ? rej(err) : res(b)));
                });
                this.cache.set(name, bundle);
                return bundle;
            } catch (e) {
                lastErr = e;
                if (attempt === retries) break;
                await this.wait(delays[Math.min(attempt, delays.length - 1)]);
            }
        }
        throw new Error(`Bundle "${name}" failed after ${retries + 1} attempts: ${lastErr}`);
    }

    /** Preload with progress. Progress only ever moves forward. */
    async preload(name: string, paths: string[], onProgress?: (p: number) => void): Promise<void> {
        const bundle = await this.loadBundle(name);
        let best = 0;
        await new Promise<void>((res, rej) => {
            bundle.preload(paths, Asset,
                (finished, total) => {
                    const p = total > 0 ? finished / total : 1;
                    if (p > best) { best = p; onProgress?.(best) }
                },
                (err) => (err ? rej(err) : res()));
        });
        onProgress?.(1);
    }

    /** Only call this when no live scene uses the bundle. */
    releaseBundle(name: string) {
        const b = this.cache.get(name);
        if (!b) return;
        b.releaseAll();
        assetManager.removeBundle(b);
        this.cache.delete(name);
    }

    private wait(ms: number) { return new Promise((r) => this.scheduleOnce(() => r(null), ms / 1000)); }
}
```

**Try it**
- Block the network in DevTools and call `loadBundle('game')`: you must see **three attempts** at 0.5s / 1s / 2s before it rejects, with no hang.
- Re-enable the network during the second attempt: it must succeed without reloading the page.
- Call `cancel('game')` mid-retry: it rejects with `LoadCancelled` and issues no further requests.
- Call `loadBundle('game')` again after a success: it returns **immediately** from cache.

## 🎤 Interview

**Questions you will get**

- `Junior` **How does `resources.load` differ from `bundle.load`? Why keep `resources/` small?**
  → Both load asynchronously, but everything under `assets/resources/` is packed into the **main package**, while bundles can be split out and hosted remotely on a CDN. Mini games cap the main package at a few MB, so a growing `resources/` hits that ceiling fast.
- `Mid` **Mid-session, some images turn into white boxes. What is the usual cause?**
  → An asset was released while live nodes still used it, usually from sprinkling `releaseAsset` "to save RAM". The reference count hits zero too early, the texture is reclaimed, and the node keeps drawing — hence the white box. Safer options are letting the scene auto-release, or `addRef`/`decRef` when you deliberately hold an asset across scenes.
- `Senior` **The main package exceeds the 4MB mini game limit. In what order do you cut?**
  → Textures first, because that is where the bytes are: move level art to remote bundles, enable per-platform compression, pull large backgrounds out of atlases. Then shrink `resources/` to a minimum. The keep-rule is short: only what the **first frame** needs stays in the main package; the rest downloads while the player is on the menu.

**60-second answer** — "How do you decide what goes in which bundle?"

> I split by **when it is needed**, not by asset type. Splitting into textures, audio and prefabs looks tidy but you still need all three to play level one. So the main package only carries what the first frame needs — boot, core UI, font, logo — and everything else becomes a remote bundle. Then I use the time the player spends on the menu to preload the game bundle in the background, because the three seconds they spend reading the title are three free seconds. Every remote download needs a fallback: retry with backoff, and on final failure show a Retry button instead of hanging the loading screen. And I verify it honestly — throttle to 3G and kill the connection midway, not test it on office wifi.

**Where they dig**

- *"Why do images turn white?"* → An asset was released while nodes still used it; the reference count hit zero too early.
- *"So when is `releaseAll` right?"* → When the bundle is genuinely independent and no scene uses it — an event that just closed, for example.
- *"How do you test for leaks?"* → Enter and leave the level five times and check whether memory returns close to baseline.
- *"What are version hashes for?"* → So the URL changes when the content changes and players never hold a stale cache.

**Red flags**

- Dumping everything into `resources/` for convenience.
- Scattering `releaseAsset` around "to save RAM".
- Having only a happy path, with no handling for failed downloads.
- Testing downloads on office wifi and calling it done.

**Numbers and examples to know cold**

- Mini game main package: around a **4 MB** limit (WeChat), roughly 20 MB total with subpackages — check the platform docs.
- Main-package rule: **whatever the first frame needs**.
- Retry: **3 attempts**, 0.5 / 1 / 2 second backoff.
- Leak test: enter and leave a level **5 times**; memory must return near baseline.
- `preload` downloads without **building** assets — so it does not cause hitches.
