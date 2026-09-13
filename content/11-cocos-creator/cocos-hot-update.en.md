---
title: Hot update & releasing
summary: Updating assets and scripts on native builds without waiting for store review: manifests, CDN, the fallback when a download fails, and a release process that does not strand old players.
---

On native builds, Cocos can **download the delta and overlay it** at startup. Change balance numbers, swap event art, patch a script bug — no store review, no reinstall.

For a live-ops game running weekly events ([[liveops]]), that alone justifies choosing Cocos. But it moves part of the store's responsibility onto you: **versioning, the CDN, and what happens when a download fails halfway**.

## The mechanism: two manifests

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="On launch the local version manifest is compared with the CDN copy; if different the delta downloads into a writable folder and the search path is updated, if identical the game starts immediately">
  <defs>
    <marker id="chu-a-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="96"  width="140" height="60" rx="9" class="fig-box"/>
    <rect x="188" y="96"  width="170" height="60" rx="9" class="fig-box"/>
    <rect x="400" y="16"  width="246" height="58" rx="9" class="fig-box"/>
    <rect x="400" y="96"  width="246" height="58" rx="9" class="fig-box"/>
    <rect x="400" y="178" width="246" height="58" rx="9" class="fig-box"/>
  </g>
  <text x="80"  y="122" text-anchor="middle" class="fig-label" font-size="13">Launch</text>
  <text x="80"  y="141" text-anchor="middle" class="fig-muted" font-size="11">read local manifest</text>
  <text x="273" y="122" text-anchor="middle" class="fig-label" font-size="13">Compare with CDN</text>
  <text x="273" y="141" text-anchor="middle" class="fig-muted" font-size="11">version.manifest</text>
  <text x="523" y="40"  text-anchor="middle" class="fig-label" font-size="13">Same → start the game</text>
  <text x="523" y="59"  text-anchor="middle" class="fig-muted" font-size="11">nothing downloaded</text>
  <text x="523" y="120" text-anchor="middle" class="fig-label" font-size="13">Different → download the delta</text>
  <text x="523" y="139" text-anchor="middle" class="fig-muted" font-size="11">writable folder · update search path</text>
  <text x="523" y="202" text-anchor="middle" class="fig-label" font-size="13">Failure → FALL BACK</text>
  <text x="523" y="221" text-anchor="middle" class="fig-muted" font-size="11">delete the partial download, start on the old build</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#chu-a-en)" fill="none">
    <path d="M150 126 H184"/>
    <path d="M358 112 Q379 112 379 45 H396"/>
    <path d="M358 126 H396"/>
    <path d="M358 140 Q379 140 379 207 H396"/>
  </g>
</svg>
<figcaption>The third branch is the most-forgotten one, and the one real players take most often.</figcaption>
</figure>

Two files, produced at build time:

- **`project.manifest`** — shipped inside the installed package, describing the base version.
- **`version.manifest`** — hosted on the CDN, carrying only the version number so the check is cheap.

The manifest lists every asset with its **md5 and size**, so `AssetsManager` knows exactly which files changed and downloads only those.

## Four rules that keep hot update from becoming a disaster

**1. Always have a fallback.** Losing the connection at 70% is an everyday event. The app must delete the partial download, run on the old build, and **still reach the game**. Hanging forever on "Updating 70%" is the fastest way to lose players.

**2. Never hot-update something that needs a new base build.** If the new version requires native code (a new SDK, a new permission), it **must** go through the store. Hot update covers assets and engine-side scripts only. Get this wrong and players download a script calling a native API that does not exist, and the app crashes at startup — beyond remote repair, because it crashes before the update check runs.

**3. Separate base version from content version.** Name them like `1.4.2 / content 87`. A player on `1.3` must not receive the `1.4` manifest, because new assets may reference things old code cannot handle. The manifest must declare which base-version range it targets.

**4. Roll out by percentage.** Give 5% of players the new content first, watch crash reports for an hour, then widen. This is the real advantage of hot update: not just faster than the store, but **reversible in minutes**.

## iOS: the limit to know

Apple allows downloaded content interpreted by an engine, but **not** changes to the app's core nature and features relative to what was reviewed. In practice: bug fixes, balance tuning, new events — fine. Turning a puzzle game into a shooter — not.

This is a policy boundary rather than a technical one: technically it works, which is exactly what makes it dangerous. Settle the boundary with whoever owns product decisions **before** building the system, not after a takedown.

## Writable folders and search paths

The base build lives in the read-only install package. Updates are written to the app's writable folder, and `AssetsManager` **inserts that folder at the front of the search path** so the engine finds the new files first.

Two details that break it:

- **The search path must be saved and restored on the next launch** — otherwise the app runs the base build again and the player "loses" the update they just downloaded.
- **Uninstalling wipes that folder.** Fine in itself, but make sure player saves do not live in the same place as downloaded content.

## Releasing a content build

1. Change content, run tests (including any RTP or balance lock tests — see [[cocos-demo-casino]]).
2. Build, generate the new manifest, push to the **staging** CDN.
3. Someone on the team installs the old store build, opens the app, and confirms both the update path **and** the fallback with the network cut halfway.
4. Push to the live CDN for 5% of players. Watch crash rate and successful-launch rate for an hour.
5. Widen gradually. If something breaks, re-push the previous manifest — that is your rollback, and it must take under five minutes.

## 🤖 Prompt for AI

**How to use AI for hot update**

Here the **failure path matters more than the happy path**, and AI writes only the happy path by default. Make it enumerate every failure mode before writing a line.

| Delegate | You decide |
|---|---|
| An `AssetsManager` wrapper: check, download, progress, retries | The boundary: what can be hot-updated and what needs a store build |
| Every error state and the fallback | The staged rollout policy |
| A CI script that generates manifests and pushes to CDN | Version structure (base / content) |
| The update screen: progress, retry, messaging | What the player is told |

**Spell out**:

- **Native only** — hot update does not apply to web or mini games.
- **The base-version range** this manifest targets.
- **Behaviour on failure**: reaching the game on the old build is mandatory.
- **Whether rollout is staged.**
- **Which CDN belongs to which environment.**

**Prompt template**

```
Cocos Creator 3.8.x, native Android + iOS. We host our own CDN.
Versions: base 1.4.x, content numbered separately. Target network: 3G, drops often.

Task: write a `HotUpdateService` wrapping jsb.AssetsManager.

FIRST enumerate every failure mode (connection lost mid-download, out of disk space,
corrupt manifest, md5 mismatch, app killed mid-download, base version mismatch),
then write the code.

CONSTRAINTS:
- Any failure DELETES the partial download and REACHES THE GAME on the old build. Never hang.
- Save and restore the search path across launches.
- Do nothing on web or mini game — check the platform and skip.
- The manifest declares a base-version range; on mismatch, skip the update and log clearly.
- Progress only moves forward, with a Retry button and a Skip after 3 failures.
```

**Common trap:** AI writes an update flow with only the success branch, and on failure it rejects a promise nobody catches — the player stares at 70% forever. Second trap: it forgets to persist the search path, so the update "disappears" on the second launch and players re-download every time they open the app.

## 💻 Code

A wrapper with all three branches: nothing to do, updated, and **failed but still playable**.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 200" role="img" aria-label="Inspector for HotUpdateService showing CDN URL, retry count, base version and the skip-on-failure flag">
  <g class="fig-box-g">
    <rect x="10" y="16" width="636" height="168" rx="9" class="fig-box"/>
  </g>
  <text x="30"  y="40"  class="fig-muted" font-size="11">INSPECTOR — HotUpdateService (on the first node of boot.scene)</text>
  <text x="30"  y="70"  class="fig-label" font-size="13">Manifest Url</text>
  <text x="250" y="70"  class="fig-muted" font-size="12">https://cdn.../version.manifest</text>
  <text x="30"  y="98"  class="fig-label" font-size="13">Max Retries</text>
  <text x="250" y="98"  class="fig-muted" font-size="12">3</text>
  <text x="30"  y="126" class="fig-label" font-size="13">Native Version</text>
  <text x="250" y="126" class="fig-muted" font-size="12">1.4</text>
  <text x="30"  y="154" class="fig-label" font-size="13">Skip On Failure</text>
  <text x="250" y="154" class="fig-muted" font-size="12">true  ← ALWAYS true in production</text>
  <text x="420" y="98"  class="fig-muted" font-size="11">Skip On Failure = false means</text>
  <text x="420" y="118" class="fig-muted" font-size="11">a player with a flaky connection cannot play at all.</text>
</svg>
<figcaption>That last field is the most important one on this screen.</figcaption>
</figure>

**Script**

```ts
// HotUpdateService.ts — native builds only. Any failure still reaches the game.
import { _decorator, Component, sys } from 'cc';
const { ccclass, property } = _decorator;

export type UpdateOutcome = 'up-to-date' | 'updated' | 'skipped';

@ccclass('HotUpdateService')
export class HotUpdateService extends Component {
    @property manifestUrl = '';
    @property maxRetries = 3;
    @property nativeVersion = '1.4';
    @property skipOnFailure = true;         // ALWAYS true in production

    private am: any = null;
    private storagePath = '';

    /** Returns an outcome and NEVER throws. The player always reaches the game. */
    async run(onProgress?: (p: number, label: string) => void): Promise<UpdateOutcome> {
        if (!sys.isNative) return 'skipped';           // web and mini games do not use this
        try {
            return await this.tryUpdate(onProgress);
        } catch (e) {
            console.warn('[hot-update] skipping after error:', e);
            this.cleanupPartial();
            return 'skipped';
        }
    }

    private tryUpdate(onProgress?: (p: number, label: string) => void): Promise<UpdateOutcome> {
        return new Promise((resolve, reject) => {
            const jsb = (globalThis as any).jsb;
            if (!jsb?.AssetsManager) { resolve('skipped'); return }

            this.storagePath = (jsb.fileUtils.getWritablePath() || '/') + 'hot-update';
            this.am = new jsb.AssetsManager('', this.storagePath, (a: string, b: string) => {
                // Compare content versions numerically, not as strings
                const na = Number(a.split('.').pop()) || 0;
                const nb = Number(b.split('.').pop()) || 0;
                return na - nb;
            });

            let retries = 0;
            this.am.setEventCallback((ev: any) => {
                const code = ev.getEventCode();
                const E = jsb.EventAssetsManager;

                switch (code) {
                    case E.ALREADY_UP_TO_DATE:
                        this.finish(); resolve('up-to-date'); break;

                    case E.NEW_VERSION_FOUND:
                        // The manifest must target this BASE version. Mismatch → skip.
                        if (!this.matchesNativeVersion()) { this.finish(); resolve('skipped'); break }
                        onProgress?.(0, 'Downloading new content');
                        this.am.update();
                        break;

                    case E.UPDATE_PROGRESSION:
                        onProgress?.(ev.getPercent(), 'Downloading new content');
                        break;

                    case E.UPDATE_FINISHED: {
                        // Put the downloaded folder FIRST in the search path, and PERSIST it
                        const paths: string[] = [this.storagePath, ...jsb.fileUtils.getSearchPaths()];
                        jsb.fileUtils.setSearchPaths(paths);
                        sys.localStorage.setItem('hot-update:paths', JSON.stringify(paths));
                        this.finish();
                        resolve('updated');
                        break;
                    }

                    case E.UPDATE_FAILED:
                    case E.ERROR_DOWNLOAD_MANIFEST:
                    case E.ERROR_PARSE_MANIFEST:
                    case E.ERROR_NO_LOCAL_MANIFEST:
                        if (retries < this.maxRetries && code === E.UPDATE_FAILED) {
                            retries++;
                            onProgress?.(0, `Retry ${retries}`);
                            this.am.downloadFailedAssets();
                        } else if (this.skipOnFailure) {
                            this.cleanupPartial();
                            this.finish();
                            resolve('skipped');                 // REACH THE GAME on the old build
                        } else {
                            this.finish();
                            reject(new Error('hot update failed, code ' + code));
                        }
                        break;
                }
            });

            this.am.loadLocalManifest(this.manifestUrl);
            if (!this.am.getLocalManifest()?.isLoaded()) { resolve('skipped'); return }
            this.am.checkUpdate();
        });
    }

    /** Restore the persisted search path — call this BEFORE anything else at launch. */
    static restoreSearchPaths() {
        if (!sys.isNative) return;
        const jsb = (globalThis as any).jsb;
        const saved = sys.localStorage.getItem('hot-update:paths');
        if (!saved || !jsb?.fileUtils) return;
        try { jsb.fileUtils.setSearchPaths(JSON.parse(saved)) } catch { /* corrupt: ignore */ }
    }

    private matchesNativeVersion(): boolean {
        const remote = this.am?.getRemoteManifest?.()?.getManifestRoot?.() ?? '';
        return String(remote).includes(this.nativeVersion) || this.nativeVersion === '';
    }

    private cleanupPartial() {
        const jsb = (globalThis as any).jsb;
        try { jsb?.fileUtils?.removeDirectory?.(this.storagePath + '_temp/') } catch { /* ignore */ }
    }

    private finish() { this.am?.setEventCallback(null); this.am = null; }
}
```

**Try it**
- Latest build, nothing to update: `run()` returns `'up-to-date'` in under a second.
- Push a new manifest to staging: `run()` returns `'updated'`, and after a restart the new content is **still there** (proving the search path persisted).
- **Cut the network at 50%**: after 3 retries it returns `'skipped'` and the **game still opens** on the old content.
- Set `nativeVersion` to `'9.9'`: `run()` returns `'skipped'` and downloads nothing — the base-version lock works.
- Run it on web: `run()` returns `'skipped'` immediately and never touches `jsb`.

## 🎤 Interview

**Questions you will get**

- `Junior` **What can Cocos hot update change, and what can it not?**
  → It updates assets and engine-side scripts — art, audio, data tables, JS/TS logic. It cannot update native code: a new SDK or a new permission has to go through the store. Get that wrong and players receive a script calling a native API that does not exist, and the app crashes at startup, beyond remote repair.
- `Mid` **A player loses connection at 70% of the download. What does your system do?**
  → Retry a few times with `downloadFailedAssets`, and when retries run out, delete the partial download and **enter the game on the old build**. The principle is never to block a player over a content update: missing an event still leaves them playing, whereas a frozen 70% screen gets the app deleted.
- `Senior` **How do you release a content build safely?**
  → Push to staging first and install the old store build to test both the success path and the network-cut path. Then open it to 5% of players and watch crash rate and successful launches for an hour before widening. The key is that rollback takes under five minutes — just re-push the previous manifest — because that reversibility is the real value over waiting on the store.

**60-second answer** — "Design a hot update system for a live-ops game."

> At launch the first thing the app does is restore the persisted search path, then compare its local `version.manifest` against the CDN copy. Identical means straight into the game. Different means downloading the md5-based delta into the writable folder, and on success putting that folder first in the search path and persisting it — skip the persisting step and the update vanishes on the next launch. The most important part is the third branch: any failure deletes the partial download and still enters the game on the old build, because losing 3G halfway is an everyday event. The manifest declares a base-version range so players on older builds never receive newer content. And rollout is staged, starting at 5%.

**Where they dig**

- *"Why lock to a base version?"* → New assets can reference features the old native code lacks; without the lock you get mass crashes on older builds.
- *"Does iOS permit hot update?"* → Engine-interpreted content is allowed, but not changing the app's nature relative to what was reviewed. That is policy, not technology.
- *"How does rollback work?"* → Re-push the previous manifest. Which means old manifests must be retained and versioned in their filenames.
- *"Where do saves live?"* → Not in the same folder as downloaded content, because that folder can be cleared on uninstall or during partial-download cleanup.

**Red flags**

- No failure branch, or players stuck on the update screen.
- Believing hot update replaces store releases for every kind of change.
- Not persisting the search path, so the content re-downloads on every launch.
- Shipping to 100% immediately because "we tested it thoroughly on our own devices".

**Numbers and examples to know cold**

- Two manifests: **`project.manifest`** in the package, **`version.manifest`** on the CDN.
- The manifest lists **md5 + size** per file so only the delta downloads.
- Staged rollout starting at **5%**, observed for **1 hour**.
- Rollback completes in **under 5 minutes** by re-pushing the old manifest.
- The unbreakable rule: **a failed update still reaches the game**.
