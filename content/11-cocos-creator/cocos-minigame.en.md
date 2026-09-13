---
title: Mini games & platforms
summary: Shipping to WeChat, Douyin, Facebook Instant or Zalo: package limits, subpackages, domain allowlists, login and payments through the host SDK.
---

A mini game runs **inside a super app** — WeChat, Douyin, Zalo, Messenger — instead of being installed from a store. One tap and the player is in, no install, which is why the format thrives in markets where every install is a barrier.

The price of that convenience is three hard constraints, and all three surface late if you do not know about them up front.

## Three constraints worth knowing before you start

| Constraint | What it means | When it bites if you did not plan for it |
|---|---|---|
| **Package limit** | Main package of a few MB (WeChat around 4 MB, roughly 20 MB total with subpackages) | Packaging day — far too late to re-split assets |
| **No DOM** | No `document`, no `new Image()`, no dynamic script loading | The first platform build, after months of the web version working fine |
| **Controlled network** | Every domain must be declared in the platform console | Device testing: every request fails silently |

The size numbers **change over time** — check the official docs before planning, and do not trust the figure in any article, including this one.

## The platform map

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="One Cocos project builds to four platform paths: WeChat and Douyin as true mini games, Facebook Instant as packaged web, Zalo through the web-mobile build">
  <defs>
    <marker id="cmg-a-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="90"  width="150" height="70" rx="9" class="fig-box"/>
    <rect x="230" y="10"  width="200" height="52" rx="9" class="fig-box"/>
    <rect x="230" y="80"  width="200" height="52" rx="9" class="fig-box"/>
    <rect x="230" y="150" width="200" height="52" rx="9" class="fig-box"/>
    <rect x="470" y="10"  width="176" height="52" rx="9" class="fig-box"/>
    <rect x="470" y="80"  width="176" height="52" rx="9" class="fig-box"/>
    <rect x="470" y="150" width="176" height="52" rx="9" class="fig-box"/>
  </g>
  <text x="85"  y="118" text-anchor="middle" class="fig-label" font-size="13">Cocos project</text>
  <text x="85"  y="138" text-anchor="middle" class="fig-muted" font-size="11">one codebase</text>
  <text x="330" y="32"  text-anchor="middle" class="fig-label" font-size="13">Mini game target</text>
  <text x="330" y="50"  text-anchor="middle" class="fig-muted" font-size="11">WeChat · Douyin · Alipay</text>
  <text x="330" y="102" text-anchor="middle" class="fig-label" font-size="13">Instant Games target</text>
  <text x="330" y="120" text-anchor="middle" class="fig-muted" font-size="11">Facebook / Messenger</text>
  <text x="330" y="172" text-anchor="middle" class="fig-label" font-size="13">web-mobile target</text>
  <text x="330" y="190" text-anchor="middle" class="fig-muted" font-size="11">Zalo · plain link · webview</text>
  <text x="558" y="32"  text-anchor="middle" class="fig-label" font-size="13">Host SDK, capped package</text>
  <text x="558" y="50"  text-anchor="middle" class="fig-muted" font-size="11">login · pay · ads · ranks</text>
  <text x="558" y="102" text-anchor="middle" class="fig-label" font-size="13">Own SDK and review</text>
  <text x="558" y="120" text-anchor="middle" class="fig-muted" font-size="11">friends · sharing</text>
  <text x="558" y="172" text-anchor="middle" class="fig-label" font-size="13">Full browser</text>
  <text x="558" y="190" text-anchor="middle" class="fig-muted" font-size="11">you own accounts and payments</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cmg-a-en)" fill="none">
    <path d="M160 110 Q195 110 195 36 H226"/>
    <path d="M160 125 H226"/>
    <path d="M160 140 Q195 140 195 176 H226"/>
    <path d="M430 36 H466"/>
    <path d="M430 106 H466"/>
    <path d="M430 176 H466"/>
  </g>
</svg>
<figcaption>Zalo runs the <code>web-mobile</code> build inside a webview — so you get a full browser, and you also own accounts and payments yourself.</figcaption>
</figure>

## Splitting the package: subpackages and remote bundles

Two mechanisms, usable together:

- **Platform subpackages** — split according to the host's configuration and downloaded on demand. Counted against the total limit.
- **Asset Bundles on your own CDN** — outside the platform's quota, but the domain must be declared. This is the escape hatch for content-heavy games.

Practical strategy: the main package carries only **a playable first level**, everything else is a remote bundle fetched while the player is on the menu ([[cocos-assets-bundle]]). Mini game players are impatient by nature — they arrive with one tap, and they leave with one too.

## Login: never trust the client

The correct flow, and **step 3 is not optional**:

1. The client calls the platform login API (e.g. `wx.login`) → receives a **temporary code**.
2. The client sends that code to **your server**.
3. **The server** exchanges it with the platform for a player identity and issues your own token.

Skip step 3 and let the client claim "I am player X", and anyone can claim anything. This is exactly the *client sends intent, server returns truth* rule from [[backend-go]] — only the API names differ.

For the same reason, **match results, rewards and currency are decided server-side**. Mini games are especially easy to tamper with, because the whole JS bundle runs on the player's device with no compilation step hiding it.

## Payments and ads

Both go through the host SDK, not your own gateway. Three things hold on every platform:

- **Reconcile on the server.** The platform calls a webhook, or you poll; never grant an item because the client said "purchase succeeded".
- **Pending rewards.** The player finishes the ad, the app is killed at the exact moment of granting — if the reward was not written down beforehand, they lose it, and they will remember. Same lesson as [[unity-monetization-sdk]].
- **Idempotency.** Every currency-granting call carries a client-generated `request_id`, UNIQUE in the database, so a double tap is not a double grant.

One WeChat speciality worth knowing: the **open data domain** — an isolated context purely for rendering friend leaderboards, with no network access and no shared variables with the main game. You draw the leaderboard there on its own canvas. It sounds bizarre until you see why: the platform will not let a game export the friend list.

## Traps that only appear on real devices

- **`document`, `window`, `new Image()`** — absent. Everything goes through engine APIs (`sys`, `assetManager`, `director`).
- **The system font differs from yours.** Layouts measured against text width drift. Use a BMFont with the full accent set, or leave slack — see [[cocos-ui]].
- **Simultaneous audio is capped** more tightly than on the web.
- **Local storage has its own quota** (commonly around 10 MB per player). Large saves belong on a server.
- **Returning from background** (the player switched apps and came back) must be handled: music stopped, timers drifted, sockets dropped.

One-line rule: **build to the real target platform in week one**, not in the final week. Each platform ships its own IDE for testing; install it the same day you install Cocos.

## 🤖 Prompt for AI

**How to use AI for mini game platforms**

This is AI's **weakest** area in the whole branch: platform documentation is largely in Chinese, changes constantly, and models happily mix WeChat APIs with Douyin ones. Treat every function name it produces as a **hypothesis to verify**, not a fact.

Where it genuinely helps: **the abstraction layer**. You define the interface, it writes per-platform implementations, and you verify only the SDK calls.

| Delegate | Verify yourself |
|---|---|
| A `PlatformAdapter` interface and the web (no-SDK) implementation | Function names and signatures in each platform SDK |
| Server-side logic: code exchange, reconciliation, idempotency | Current package limits |
| A CI script checking main-package size | Review process and content requirements |
| Background-resume handling, pending-reward queues | The list of domains you must declare |

**Spell out**:

- **Which platform**, and which SDK version.
- **The package limit** you have to live within.
- **Whether there is a server** — if not, do not ask it to "just do login client-side".
- **What is authoritative**: currency, items, match results.
- **No DOM** — say it explicitly, because web habits take over otherwise.

**Prompt template**

```
Cocos Creator 3.8.x, TypeScript strict. Targets: WeChat mini game + web-mobile (Zalo).
There is a Go backend. Main package < 4MB. All resources are server-authoritative.

Task: write a `PlatformAdapter` interface plus two implementations (web, wechat) for:
  login(): Promise<{ code: string }>        // web returns an empty code
  share(payload): Promise<void>
  rewardedAd(): Promise<'completed' | 'skipped' | 'unavailable'>
  vibrate(ms): void

CONSTRAINTS:
- NO document / window / new Image() anywhere in shared code.
- Unsupported features return 'unavailable' and NEVER throw — the game must continue.
- Wrap every SDK call in try/catch; a missing SDK must not crash the game.
- MARK every SDK function name you are unsure about with "// VERIFY:" so I can check.
- Ad rewards are granted only after the SERVER confirms; the client only sends intent.
```

**Common trap:** AI invents plausible SDK names (`wx.getUserProfileAsync`, `tt.showRewardVideo`) and you find out on a real device. Asking for `// VERIFY:` markers is the cheapest way to turn that into a checklist instead of a debugging session. Second trap: it implements login entirely client-side because "no server appeared in the code you pasted".

## 💻 Code

A `PlatformAdapter` layer: the game calls an interface, each platform gets an implementation. Adding a third platform then touches no gameplay code.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 210" role="img" aria-label="Gameplay calls the PlatformAdapter interface, which has three implementations: web, wechat and douyin">
  <defs>
    <marker id="cmg-b-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="230" y="14"  width="200" height="52" rx="9" class="fig-box"/>
    <rect x="230" y="92"  width="200" height="52" rx="9" class="fig-box"/>
    <rect x="20"  y="158" width="180" height="42" rx="9" class="fig-box"/>
    <rect x="240" y="158" width="180" height="42" rx="9" class="fig-box"/>
    <rect x="460" y="158" width="180" height="42" rx="9" class="fig-box"/>
  </g>
  <text x="330" y="36"  text-anchor="middle" class="fig-label" font-size="13">Gameplay code</text>
  <text x="330" y="55"  text-anchor="middle" class="fig-muted" font-size="11">platform-agnostic</text>
  <text x="330" y="114" text-anchor="middle" class="fig-label" font-size="13">interface PlatformAdapter</text>
  <text x="330" y="133" text-anchor="middle" class="fig-muted" font-size="11">login · share · rewardedAd · vibrate</text>
  <text x="110" y="185" text-anchor="middle" class="fig-muted" font-size="12">WebAdapter</text>
  <text x="330" y="185" text-anchor="middle" class="fig-muted" font-size="12">WechatAdapter</text>
  <text x="550" y="185" text-anchor="middle" class="fig-muted" font-size="12">DouyinAdapter</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cmg-b-en)" fill="none">
    <path d="M330 66 V88"/>
    <path d="M290 144 Q290 154 200 154 V154"/>
    <path d="M330 144 V154"/>
    <path d="M370 144 Q370 154 460 154 V154"/>
  </g>
</svg>
<figcaption>A new platform means a new adapter file. Gameplay does not change a line.</figcaption>
</figure>

**Script**

```ts
// platform.ts — one interface, many platforms. Gameplay only knows this interface.
export type AdResult = 'completed' | 'skipped' | 'unavailable';

export interface PlatformAdapter {
    readonly name: string;
    /** A temporary code the SERVER exchanges for an identity. Web returns an empty string. */
    login(): Promise<{ code: string }>;
    share(title: string, imageUrl?: string): Promise<void>;
    rewardedAd(): Promise<AdResult>;
    vibrate(ms: number): void;
}

/** Web / Zalo webview: no host SDK, everything degrades safely. */
class WebAdapter implements PlatformAdapter {
    readonly name = 'web';
    async login() { return { code: '' }; }
    async share() { /* unsupported: silently skip, NEVER throw */ }
    async rewardedAd(): Promise<AdResult> { return 'unavailable'; }
    vibrate(ms: number) { (globalThis as any).navigator?.vibrate?.(ms); }
}

/** WeChat mini game. Every SDK call is wrapped: a missing SDK must not crash the game. */
class WechatAdapter implements PlatformAdapter {
    readonly name = 'wechat';
    private get wx(): any { return (globalThis as any).wx; }

    login(): Promise<{ code: string }> {
        return new Promise((res) => {
            try {
                // VERIFY: name and signature against the current WeChat documentation
                this.wx.login({
                    success: (r: any) => res({ code: r?.code ?? '' }),
                    fail: () => res({ code: '' }),
                });
            } catch { res({ code: '' }) }
        });
    }

    async share(title: string, imageUrl?: string) {
        try { this.wx.shareAppMessage({ title, imageUrl }) } catch { /* ignore */ }
    }

    rewardedAd(): Promise<AdResult> {
        return new Promise((res) => {
            try {
                // VERIFY: the platform's rewarded-video API
                const ad = this.wx.createRewardedVideoAd({ adUnitId: 'YOUR_AD_UNIT' });
                const done = (r: AdResult) => { ad.offClose?.(); res(r) };
                ad.onClose((r: any) => done(r?.isEnded ? 'completed' : 'skipped'));
                ad.onError(() => done('unavailable'));
                ad.show().catch(() => ad.load().then(() => ad.show()).catch(() => done('unavailable')));
            } catch { res('unavailable') }
        });
    }

    vibrate(ms: number) {
        try { ms > 20 ? this.wx.vibrateLong() : this.wx.vibrateShort() } catch { /* ignore */ }
    }
}

function detect(): PlatformAdapter {
    if ((globalThis as any).wx?.createRewardedVideoAd) return new WechatAdapter();
    // Add DouyinAdapter here when needed — gameplay stays untouched.
    return new WebAdapter();
}

export const platform: PlatformAdapter = detect();

/** Ad rewards: the client only SENDS INTENT; the server is what grants. */
export async function watchAdForReward(api: { claimAdReward(requestId: string): Promise<boolean> }) {
    const result = await platform.rewardedAd();
    if (result !== 'completed') return false;
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return api.claimAdReward(requestId);      // idempotent server-side
}
```

**Try it**
- In a browser: `platform.name` reads `web`, `rewardedAd()` returns `'unavailable'`, and the game **still plays**.
- In the platform IDE: `platform.name` reads `wechat` and the watch-ad button works.
- Delete `wx` from the global scope at runtime: no exception escapes the adapter.
- Tap the claim button twice quickly: the server grants **once**, thanks to `requestId`.

## 🎤 Interview

**Questions you will get**

- `Junior` **How does a mini game differ from an H5 game in a browser?**
  → A mini game runs in the super app's environment: no DOM, a main package capped at a few MB, network calls restricted to pre-declared domains, and login and payments going through the host SDK. A plain H5 game gets a full browser but owns accounts and payments itself.
- `Mid` **A player finishes a rewarded ad and gets nothing. How do you redesign the flow?**
  → The reward has to be written down **before** it is granted, as a pending reward, then granted and the flag cleared. Because an app really does get killed in the gap between "ad finished" and "item added", and players remember that for a long time. Every grant also carries a UNIQUE `request_id` so a double tap is not a double grant.
- `Senior` **Mini game login: what are the steps, and which one is not optional?**
  → The client gets a temporary code from the platform, sends it to your server, and the **server** exchanges it for the player identity and issues your own token. The server step is the non-negotiable one: without it the client can claim any identity, and a mini game's JS bundle is readable and editable by anyone.

**60-second answer** — "You are porting a live H5 game to a mini game platform. What comes first?"

> First I measure size, because it is the hardest constraint: the main package is capped at a few MB while nobody watched that on the web build. I re-split the assets so the main package only carries a playable first level, and everything else becomes a remote bundle fetched while the player is on the menu. In parallel I sweep for DOM usage, because `document` and `new Image()` do not exist on the platform and that code has been happily running on the web for months. Then I declare the domain list and put a `PlatformAdapter` in front of login, share and ads so SDK calls do not spread through gameplay. And most importantly, I build into the platform's own IDE in week one instead of the final week.

**Where they dig**

- *"Why bother with an adapter layer?"* → Because a second platform always arrives, and without one every SDK call is scattered through gameplay.
- *"What is the open data domain?"* → WeChat's isolated context for friend leaderboards, with no network and no shared variables — because the platform will not let a game export the friend list.
- *"Main package over the limit — what do you cut?"* → Textures first: move them to remote bundles, enable per-platform compression, pull large backgrounds out of atlases.
- *"What does resuming from background require?"* → Music stopped, timers drifted, sockets dropped — resync time with the server rather than trusting the device clock.

**Red flags**

- Trusting the client for match results or currency "because the code is minified".
- Not knowing the main package has a cap, or quoting a number without "check the current docs".
- Scattering `wx.*` calls through gameplay code.
- Testing entirely in a browser and assuming the mini game will behave the same.

**Numbers and examples to know cold**

- WeChat main package: around **4 MB**, roughly **20 MB** total with subpackages — always with "check the current docs".
- Mini game local storage: around **10 MB** per player.
- Login is **three steps**, and the server step is mandatory.
- Every currency grant carries a **UNIQUE** `request_id`.
- Unsupported features return `'unavailable'`, they **never throw**.
