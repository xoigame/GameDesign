---
title: Project & asset pipeline
summary: The Cocos project tree, .meta files and uuids, what to commit and what to ignore, and why scenes and prefabs are the hardest things to merge on a team.
---

This node is about what bites you three months in: **how the project is organised and how assets are referenced**. Get it wrong in week one and, by the time you have 2,000 assets and three people working, every pull ends with a scene full of empty slots.

## The project tree, and what to commit

```
MyGame/
├── assets/          ← SOURCE OF TRUTH. Commit everything, .meta included
├── settings/        ← project config (physics, layers, build). Commit
├── extensions/      ← your own Editor extensions. Commit
├── package.json     ← project name + Creator version. Commit
├── library/         ← assets imported into engine format. DO NOT commit
├── temp/            ← build scratch. DO NOT commit
├── build/           ← build output. DO NOT commit
├── profiles/        ← per-machine config. DO NOT commit
└── local/           ← per-person Editor state. DO NOT commit
```

Minimum `.gitignore`: `library/`, `temp/`, `build/`, `profiles/`, `local/`, `native/`. Never ignore `.meta` — that classic mistake breaks the whole team's project, not just yours.

## `.meta` and uuid — the golden rule

Every asset under `assets/` has a companion `.meta` file holding a **uuid** plus its import settings. Scenes and prefabs **do not reference assets by path**; they reference them by uuid.

Three consequences, none of which reports an error when it happens:

| What you do | What happens |
|---|---|
| Rename / move an asset **inside the Editor** | The Editor updates the `.meta` too, references survive ✅ |
| Rename / move it **in File Explorer or with `git mv`** | The `.meta` is orphaned → new uuid → every reference becomes an empty slot ❌ |
| Delete a `.meta` and let the Editor regenerate it | Brand new uuid → prefabs lose every link to that asset ❌ |

**Rule: every rename, move or delete of an asset happens inside the Editor.** If you truly must do it outside (a bulk rename script, say), move **both** `name.png` and `name.png.meta` and leave the `.meta` contents untouched.

This is the same `.meta` lesson as Unity ([[unity-project-structure]]), with one important difference: Cocos has **no** fallback mapping to recover from, so a lost link is lost for good.

## Organising `assets/`

The folder tree is not only about tidiness — in Cocos it **decides how the game is packaged**, because Asset Bundles are configured per folder (see [[cocos-assets-bundle]]).

```
assets/
├── scripts/         core/ (avoid importing 'cc') · ui/ · game/ · net/
├── scenes/          boot.scene · main.scene
├── prefabs/         ui/ · game/
├── textures/        ui/ · game/  (one auto atlas per subfolder)
├── audio/           bgm/ (stream) · sfx/ (preload)
├── data/            *.json config — see [[data-driven-design]]
└── bundles/         level-pack/ · event-tet/   ← folders configured as bundles
```

One convention worth keeping from day one, borrowed straight from Unity: **`scripts/core/` imports nothing from `'cc'`**. Economy, balance, state machines, damage formulas live there, so they run under plain `node` — tests in milliseconds, a 10,000-battle balance simulation without opening the Editor. Anything touching the engine goes in `scripts/game/`.

## Import settings are code

Import settings live in the `.meta`, and they affect performance more than most hand-written optimisation:

- **Texture type**: `sprite-frame` for 2D art. `Trim` cuts transparent borders — less overdraw, but it shifts the pivot if you were relying on the raw image size to align things.
- **Auto Atlas** (`.pac`): create one in a folder of sprites. Everything in that folder packs into one large texture, which is what lets draw calls batch (see [[cocos-optimization]]). An atlas above 2048 chokes low-end devices — split per level instead.
- **Compress Texture**: configured per platform inside the `.meta`. WebP/PNG for web, ASTC for native. Leaving plain PNG for every platform is the single most common reason a package balloons.
- **Audio**: stream the music, preload only short effects.

Set presets in week one and **enforce them with a script** (see the 💻 section) — relying on people to remember is the same as not having a rule.

## Teamwork: scenes and prefabs are the sore spot

`.scene` and `.prefab` are JSON full of uuids. Git can merge them as text, but the result is almost always broken: missing nodes, missing components, or a file that will not open.

Four ways to live with it, most effective first:

1. **Break the scene into prefabs.** One feature per prefab; the scene is only the place where they are assembled. Two people on two prefabs never collide.
2. **One scene, one person at a time.** Say so in chat before opening it. Crude, and more effective than any merge tool.
3. **Declare it in `.gitattributes`** so Git stops trying to be clever:
   ```
   *.scene   -merge
   *.prefab  -merge
   ```
   Conflicts become "pick whose version wins" — far better than a broken hybrid.
4. **Build complex screens in code.** The trade-off is losing visual editing, but the diff is readable and mergeable.

## 🤖 Prompt for AI

**How to use AI when setting up the project**

This is a high-benefit, low-risk area for AI, because most of the work is **scripts and conventions** rather than game logic. But there is one hard boundary: **the agent must not edit Editor files**.

| Delegate | Never |
|---|---|
| Writing `.gitignore`, `.gitattributes`, CI scripts | Editing `.scene`, `.prefab`, `.meta` by hand |
| Asset check scripts (missing `.meta`, orphaned `.meta`, oversized atlases) | "Tidying up" the `assets/` folder on its own |
| Proposing a folder tree, naming, splitting out `scripts/core/` | Bulk-renaming assets that are already referenced |
| Small Editor extensions (a menu, a validation panel) | Generating a new uuid for anything |

The reason for the right-hand column: editing uuid-bearing JSON produces failures that **do not surface at edit time**. They surface in a different scene, several commits later, as an empty slot — by which point nobody remembers the cause.

**Spell out** (or the model will invent a generic web project):

- **The exact Creator version** (`3.8.x`) — the 2.x layout is quite different (no `settings/` the way 3.x has it).
- **Target platforms** — they decide texture compression in the `.meta` and whether you need a `native/` folder.
- **Team size and who owns which scene** — that decides how far to split prefabs.
- **Whether you use Asset Bundles**, and which ones are remote.
- **Which folders are engine-free code**, so it does not sprinkle `import { Node } from 'cc'` in there.

**Prompt template**

```
Cocos Creator 3.8.x, TypeScript strict, team of 3, portrait 2D game.
Targets: web-mobile + WeChat mini game. Bundles: level-pack (remote), ui (local).

Task: write a Node.js project checker, runnable as `node tools/check-assets.mjs`,
exit code 1 on any problem. It must catch:
1. Files under assets/ with no .meta, and orphaned .meta files.
2. Duplicate uuids across two .meta files.
3. PNGs larger than 1024x1024 outside bundles/.
4. .ts files in assets/scripts/core/ that import from 'cc'.

CONSTRAINTS:
- READ ONLY. The script must never modify or delete anything under assets/.
- Node 18+, no dependencies beyond the standard library.
- Print relative paths plus the reason, grouped by problem type.
```

**Common trap:** asking AI to "clean up the folder structure" and letting it run `mv` — the asset goes one way, the `.meta` stays behind, and every prefab silently loses its link. Second trap: it writes a Node-flavoured `.gitignore` and ignores `*.meta`, assuming those are temporary files.

## 💻 Code

A project checker that runs under `node`, no Editor required. Wire it into CI and every PR gets inspected.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Diagram: the assets folder feeds check-assets.mjs, which branches to either a green CI run or a printed problem list with exit code 1">
  <defs>
    <marker id="cps-a-en" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="92"  width="150" height="66" rx="9" class="fig-box"/>
    <rect x="226" y="92"  width="190" height="66" rx="9" class="fig-box"/>
    <rect x="470" y="20"  width="176" height="60" rx="9" class="fig-box"/>
    <rect x="470" y="160" width="176" height="60" rx="9" class="fig-box"/>
  </g>
  <text x="85"  y="120" text-anchor="middle" class="fig-label" font-size="13">assets/</text>
  <text x="85"  y="140" text-anchor="middle" class="fig-muted" font-size="11">png · ts · meta</text>
  <text x="321" y="120" text-anchor="middle" class="fig-label" font-size="13">check-assets.mjs</text>
  <text x="321" y="140" text-anchor="middle" class="fig-muted" font-size="11">read only, never writes</text>
  <text x="558" y="46"  text-anchor="middle" class="fig-label" font-size="13">exit 0 — CI green</text>
  <text x="558" y="65"  text-anchor="middle" class="fig-muted" font-size="11">safe to merge</text>
  <text x="558" y="186" text-anchor="middle" class="fig-label" font-size="13">exit 1 — PR blocked</text>
  <text x="558" y="205" text-anchor="middle" class="fig-muted" font-size="11">paths + reasons printed</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cps-a-en)" fill="none">
    <path d="M160 125 H222"/>
    <path d="M416 112 Q443 112 443 50 H466"/>
    <path d="M416 138 Q443 138 443 190 H466"/>
  </g>
</svg>
<figcaption>Lives at <code>tools/check-assets.mjs</code>, runs in CI before any build step.</figcaption>
</figure>

**Script**

```js
// tools/check-assets.mjs — Cocos Creator 3.8 project checker. READ ONLY.
// Run: node tools/check-assets.mjs
import fs from 'node:fs'
import path from 'node:path'

const ASSETS = path.resolve('assets')
const problems = []
const add = (kind, file, why) => problems.push({ kind, file, why })

/** Recursive walk, returns every file path. */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const rel = (p) => path.relative(process.cwd(), p).split(path.sep).join('/')
const files = walk(ASSETS)
const metas = new Set(files.filter((f) => f.endsWith('.meta')))
const uuids = new Map()

for (const f of files) {
  if (f.endsWith('.meta')) {
    // orphaned .meta: the source file is gone
    if (!fs.existsSync(f.slice(0, -5))) add('orphaned meta', rel(f), 'no source file next to it')
    try {
      const uuid = JSON.parse(fs.readFileSync(f, 'utf8')).uuid
      if (!uuid) add('broken meta', rel(f), 'no uuid field')
      else if (uuids.has(uuid)) add('duplicate uuid', rel(f), 'collides with ' + uuids.get(uuid))
      else uuids.set(uuid, rel(f))
    } catch { add('broken meta', rel(f), 'not valid JSON') }
    continue
  }

  // regular file: must have a .meta
  if (!metas.has(f + '.meta')) add('missing meta', rel(f), 'never imported by the Editor')

  // scripts/core/ must run outside the engine
  if (f.includes(path.join('scripts', 'core')) && f.endsWith('.ts')) {
    const src = fs.readFileSync(f, 'utf8')
    if (/from\s+['"]cc['"]/.test(src)) {
      add('core touches engine', rel(f), "imports from 'cc' — core must be testable under plain node")
    }
  }

  // large images outside a bundle tend to end up in the main package
  if (/\.(png|jpg|webp)$/i.test(f) && !f.includes(path.sep + 'bundles' + path.sep)) {
    const kb = fs.statSync(f).size / 1024
    if (kb > 512) add('heavy image', rel(f), Math.round(kb) + ' KB outside bundles/ — check the main package')
  }
}

if (!problems.length) {
  console.log('✓ assets/ is clean — ' + files.length + ' files, ' + uuids.size + ' uuids')
  process.exit(0)
}
const byKind = {}
for (const p of problems) (byKind[p.kind] ||= []).push(p)
for (const [kind, list] of Object.entries(byKind)) {
  console.error('\n✗ ' + kind + ' (' + list.length + ')')
  for (const p of list) console.error('  ' + p.file + ' — ' + p.why)
}
console.error('\nTotal: ' + problems.length + ' problems')
process.exit(1)
```

**Try it**
- Clean project: prints `✓ assets/ is clean — 412 files, 206 uuids`, exits 0.
- Delete a `.png` but keep its `.png.meta`: rerunning must report `✗ orphaned meta (1)` and exit 1.
- Add `import { Node } from 'cc'` to a file in `scripts/core/`: must report `✗ core touches engine (1)`.

## 🎤 Interview

**Questions you will get**

- `Junior` **What is a `.meta` file for? What breaks if you do not commit it?**
  → It holds the asset's uuid and import settings, and scenes and prefabs reference assets **by uuid, not by path**. Without it committed, every machine generates its own uuids, so a teammate pulls and finds empty slots in a prefab with no Git conflict to warn them — it fails silently, which is what makes it dangerous.
- `Mid` **Three people edit one scene and every merge breaks it. How do you handle that?**
  → A `.scene` is uuid-bearing JSON, so a text merge almost always produces a file with missing nodes or one that will not open. I split the scene into per-feature prefabs so two people touch two files, declare `*.scene -merge` in `.gitattributes` so conflicts become "pick a side", and keep one scene to one person at a time.
- `Senior` **How do you organise `assets/` so it is team-friendly, bundle-friendly and checkable in CI?**
  → Split by **when it is needed**, not by file type, because bundles are configured per folder: `bundles/level-pack/` stays out of the main package. Keep `scripts/core/` free of `'cc'` imports so tests run under `node` in milliseconds. And add a read-only CI script for orphaned `.meta` files, missing `.meta` and duplicate uuids — a convention nobody checks stops being a convention within three months.

**60-second answer** — "What is a `.meta` file for?"

> Every asset has a `.meta` holding a uuid and its import settings. Scenes and prefabs reference assets by uuid, not by path, so the `.meta` is what holds the link together. If you do not commit it, every machine generates its own uuids — a teammate pulls, opens a prefab, and finds empty slots, with no Git conflict to warn them. That is also why every rename, move or delete happens inside the Editor: done through File Explorer, the `.meta` is orphaned from its file and the link dies the same way. On my last project we had a read-only CI script that caught orphaned `.meta` files and assets with none, running before every PR.

**Where they dig**

- *"So do you commit `library/`?"* → No. It is imported output, regenerated from `assets/` plus the `.meta` files. Committing it bloats the repo and produces constant conflicts.
- *"What do you lose by deleting `library/`?"* → Nothing but time: reopen the Editor and it re-imports. It is also the fix for most "the Editor is behaving strangely" problems.
- *"Smaller prefabs mean more files — isn't that a trade-off?"* → It is, but the right way round: many small files mean two people edit two different files; one big scene means two people edit the same JSON.
- *"Why keep `'cc'` out of `scripts/core/`?"* → So tests and balance simulations run under `node` in milliseconds, with no Editor involved.

**Red flags**

- Not knowing what `.meta` is, or assuming it is temporary and ignoring it.
- "When a scene conflicts I open the JSON and fix it by hand" — that works once; the next time you lose a node without noticing.
- Reciting folder conventions in the abstract, with no link to Asset Bundles or to teamwork.
- Not distinguishing `assets/` (source) from `library/` (derived).

**Numbers and examples to know cold**

- Commit: `assets/` (every `.meta` included), `settings/`, `extensions/`, `package.json`.
- Ignore: `library/`, `temp/`, `build/`, `profiles/`, `local/`.
- `.gitattributes`: `*.scene -merge`, `*.prefab -merge`.
- Keep an Auto Atlas at or below 2048×2048.
- The one-line rule: **every asset operation happens inside the Editor**.
