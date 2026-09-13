---
id: cocos-project-structure
title: Dự án & pipeline asset
icon: 📁
summary: Thư mục dự án Cocos, file .meta và uuid, cái gì commit cái gì bỏ, và vì sao scene/prefab là thứ khó merge nhất trong đời làm nhóm.
status: deep
read: 810
level: basic
order: 10
tags: [cocos, project, git, asset, pipeline]
related: [cocos-creator, unity-project-structure, cocos-assets-bundle]
---

Node này về thứ quyết định ba tháng sau: **tổ chức dự án và cách asset được tham chiếu**. Chọn sai ở tuần đầu thì tới lúc có 2000 asset và ba người cùng làm, mỗi lần pull là một lần mở scene ra thấy ô trống.

## Cây thư mục và cái gì được commit

```
MyGame/
├── assets/          ← NGUỒN CHÂN LÝ. Commit tất, kể cả .meta
├── settings/        ← cấu hình dự án (vật lý, layer, build). Commit
├── extensions/      ← extension Editor tự viết. Commit
├── package.json     ← tên + phiên bản Creator. Commit
├── library/         ← asset đã import sang dạng engine dùng. KHÔNG commit
├── temp/            ← rác biên dịch. KHÔNG commit
├── build/           ← kết quả build. KHÔNG commit
├── profiles/        ← cấu hình riêng từng máy. KHÔNG commit
└── local/           ← trạng thái Editor của từng người. KHÔNG commit
```

`.gitignore` tối thiểu: `library/`, `temp/`, `build/`, `profiles/`, `local/`, `native/`. Đừng ignore `.meta` — đó là lỗi kinh điển và nó phá dự án của cả đội, không chỉ của bạn.

## `.meta` và uuid — luật vàng

Mỗi asset trong `assets/` có một file `.meta` đi kèm, bên trong là **uuid** cùng cấu hình import. Scene và prefab **không tham chiếu asset bằng đường dẫn**; chúng tham chiếu bằng uuid.

Hệ quả kéo theo, cả ba đều không báo lỗi khi xảy ra:

| Việc bạn làm | Chuyện xảy ra |
|---|---|
| Đổi tên / di chuyển asset **trong Editor** | Editor sửa cả `.meta`, mọi tham chiếu còn nguyên ✅ |
| Đổi tên / di chuyển **bằng File Explorer hoặc `git mv`** | `.meta` lạc chỗ → uuid mới → mọi tham chiếu thành ô trống ❌ |
| Xoá `.meta` rồi để Editor sinh lại | uuid mới hoàn toàn → prefab mất sạch liên kết tới asset đó ❌ |

**Luật: mọi thao tác đổi tên, di chuyển, xoá asset đều làm trong Editor.** Nếu buộc phải làm ngoài (ví dụ script đổi tên hàng loạt), phải di chuyển **cả cặp** `tên.png` + `tên.png.meta` và giữ nguyên nội dung `.meta`.

Đây đúng là bài học `.meta` bên Unity ([[unity-project-structure]]), khác một điểm quan trọng: Cocos **không có** bảng ánh xạ dự phòng nào để dò lại, nên mất là mất.

## Tổ chức `assets/`

Cây thư mục không chỉ để cho gọn — ở Cocos nó **quyết định cách đóng gói**, vì Asset Bundle được cấu hình theo thư mục (xem [[cocos-assets-bundle]]).

```
assets/
├── scripts/         core/ (không import 'cc' nếu tránh được) · ui/ · game/ · net/
├── scenes/          boot.scene · main.scene
├── prefabs/         ui/ · game/
├── textures/        ui/ · game/  (mỗi thư mục con một auto atlas)
├── audio/           bgm/ (stream) · sfx/ (preload)
├── data/            *.json cấu hình — xem [[data-driven-design]]
└── bundles/         level-pack/ · event-tet/   ← thư mục cấu hình thành bundle
```

Một quy ước đáng giữ từ đầu, mượn thẳng của Unity: **`scripts/core/` không import gì từ `'cc'`**. Kinh tế, cân bằng, state machine, công thức sát thương nằm ở đó thì chạy được bằng `node` thuần — test trong mili giây, mô phỏng cân bằng 10.000 trận không cần mở Editor. Mọi thứ chạm engine để ở `scripts/game/`.

## Import settings là code

Cấu hình import nằm trong `.meta`, và nó ảnh hưởng hiệu năng nhiều hơn phần lớn tối ưu bạn viết tay:

- **Texture type**: `sprite-frame` cho ảnh 2D. `Trim` cắt viền trong suốt — giảm overdraw, nhưng làm lệch tâm nếu bạn dựa vào kích thước ảnh gốc để căn.
- **Auto Atlas** (`.pac`): tạo trong thư mục chứa sprite. Mọi sprite trong thư mục đó gộp thành một texture lớn → gộp được draw call (xem [[cocos-optimization]]). Atlas quá lớn (> 2048) thì máy yếu nuốt không nổi, chia theo màn chơi.
- **Compress Texture**: cấu hình riêng cho từng nền tảng trong `.meta`. Web thì WebP/PNG, native thì ASTC. Để mặc định PNG cho mọi nền tảng là lý do phổ biến nhất khiến gói phình.
- **Audio**: nhạc nền để chế độ stream, hiệu ứng ngắn mới nạp sẵn.

Đặt preset ngay tuần đầu và **kiểm bằng script** (xem mục 💻) — trông cậy vào việc nhớ chỉnh tay là hỏng.

## Làm nhóm: scene và prefab là chỗ đau

`.scene` và `.prefab` là JSON có uuid. Git merge được về mặt văn bản, nhưng kết quả merge gần như luôn hỏng: mất node, mất component, hoặc file không mở được.

Bốn cách sống chung, theo thứ tự hiệu quả:

1. **Chia nhỏ thành prefab.** Mỗi tính năng một prefab, scene chỉ là nơi ráp. Hai người làm hai prefab khác nhau thì không đụng nhau.
2. **Một scene một người tại một thời điểm.** Nói trong chat trước khi mở. Thô sơ nhưng hiệu quả hơn mọi công cụ merge.
3. **Khai trong `.gitattributes`** để Git không cố merge thông minh:
   ```
   *.scene   -merge
   *.prefab  -merge
   ```
   Xung đột sẽ thành "chọn bản của ai" — thà thế còn hơn một file lai hỏng.
4. **Dựng UI bằng code cho màn phức tạp.** Đánh đổi: mất khả năng chỉnh trực quan, nhưng diff đọc được và merge được.

## 🤖 Prompt cho AI

**Dùng AI thế nào ở khâu dựng dự án**

Đây là khâu AI giúp được nhiều mà rủi ro thấp, vì phần lớn việc là **script và quy ước**, không phải logic game. Nhưng có một ranh giới cứng: **agent không được sửa file Editor**.

| Giao được | Tuyệt đối không |
|---|---|
| Viết `.gitignore`, `.gitattributes`, script CI | Sửa `.scene`, `.prefab`, `.meta` bằng tay |
| Script kiểm tra asset (thiếu `.meta`, `.meta` mồ côi, atlas quá lớn) | Tự "dọn dẹp" thư mục `assets/` |
| Đề xuất cây thư mục, đặt tên, tách `scripts/core/` | Đổi tên hàng loạt asset đang được tham chiếu |
| Viết extension Editor đơn giản (menu, panel kiểm tra) | Sinh uuid mới cho bất cứ thứ gì |

Lý do của cột phải: sửa JSON có uuid thì lỗi **không lộ ra lúc sửa**, mà lộ ra ở một scene khác, vài commit sau, dưới dạng ô trống — lúc đó không ai nhớ nguyên nhân nữa.

**Phải nêu rõ** (thiếu là AI bịa theo dự án web thường):

- **Phiên bản Creator chính xác** (`3.8.x`) — cấu trúc thư mục 2.x khác hẳn (`assets/` + `library/` nhưng không có `settings/` như 3.x).
- **Nền tảng đích** — quyết định `.meta` nén texture kiểu gì, có cần thư mục `native/` không.
- **Đội mấy người, ai làm scene nào** — quyết định chia prefab tới mức nào.
- **Có dùng Asset Bundle không**, và bundle nào là remote.
- **Thư mục nào là code thuần** (không import `'cc'`) để nó không rải `import { Node } from 'cc'` vào đó.

**Mẫu prompt**

```
Dự án Cocos Creator 3.8.x, TypeScript strict, đội 3 người, game 2D dọc.
Đích: web-mobile + WeChat mini game. Asset Bundle: level-pack (remote), ui (local).

Việc: viết script Node.js kiểm tra dự án, chạy được bằng `node tools/check-assets.mjs`,
thoát mã 1 nếu có lỗi. Cần bắt:
1. File trong assets/ thiếu .meta, và .meta mồ côi (không có file gốc).
2. uuid trùng nhau giữa hai .meta.
3. PNG > 1024x1024 nằm ngoài thư mục bundles/.
4. File .ts trong assets/scripts/core/ có import từ 'cc'.

RÀNG BUỘC:
- CHỈ ĐỌC. Script KHÔNG được sửa hay xoá bất kỳ file nào trong assets/.
- Node 18+, không thêm dependency ngoài thư viện chuẩn.
- In ra đường dẫn tương đối + lý do, gom theo loại lỗi.
```

**Bẫy thường gặp:** nhờ AI "dọn lại cấu trúc thư mục cho gọn" rồi để nó chạy lệnh `mv` — asset đi một đằng, `.meta` ở lại một nẻo, và cả kho prefab mất liên kết trong im lặng. Bẫy thứ hai: nó viết `.gitignore` kiểu dự án Node và ignore luôn `*.meta` vì tưởng là file tạm.

## 💻 Code

Script kiểm tra dự án chạy bằng `node`, không cần mở Editor. Cắm vào CI thì mỗi PR đều được soi.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Sơ đồ: thư mục assets đi qua script check-assets.mjs, ra hai nhánh: sạch thì CI xanh, có lỗi thì in danh sách và thoát mã 1">
  <defs>
    <marker id="cps-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
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
  <text x="321" y="140" text-anchor="middle" class="fig-muted" font-size="11">chỉ đọc, không sửa</text>
  <text x="558" y="46"  text-anchor="middle" class="fig-label" font-size="13">exit 0 — CI xanh</text>
  <text x="558" y="65"  text-anchor="middle" class="fig-muted" font-size="11">merge được</text>
  <text x="558" y="186" text-anchor="middle" class="fig-label" font-size="13">exit 1 — chặn PR</text>
  <text x="558" y="205" text-anchor="middle" class="fig-muted" font-size="11">in đường dẫn + lý do</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cps-a)" fill="none">
    <path d="M160 125 H222"/>
    <path d="M416 112 Q443 112 443 50 H466"/>
    <path d="M416 138 Q443 138 443 190 H466"/>
  </g>
</svg>
<figcaption>Đặt ở <code>tools/check-assets.mjs</code>, chạy trong CI trước mọi bước build.</figcaption>
</figure>

**Script**

```js
// tools/check-assets.mjs — kiểm tra dự án Cocos Creator 3.8. CHỈ ĐỌC.
// Chạy: node tools/check-assets.mjs
import fs from 'node:fs'
import path from 'node:path'

const ASSETS = path.resolve('assets')
const problems = []
const add = (kind, file, why) => problems.push({ kind, file, why })

/** Duyệt đệ quy, trả về mọi đường dẫn file. */
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
    // .meta mồ côi: không còn file gốc
    if (!fs.existsSync(f.slice(0, -5))) add('meta mồ côi', rel(f), 'không có file gốc đi kèm')
    try {
      const uuid = JSON.parse(fs.readFileSync(f, 'utf8')).uuid
      if (!uuid) add('meta hỏng', rel(f), 'không có trường uuid')
      else if (uuids.has(uuid)) add('uuid trùng', rel(f), 'trùng với ' + uuids.get(uuid))
      else uuids.set(uuid, rel(f))
    } catch { add('meta hỏng', rel(f), 'không phải JSON hợp lệ') }
    continue
  }

  // file thường: phải có .meta
  if (!metas.has(f + '.meta')) add('thiếu meta', rel(f), 'chưa được Editor import')

  // scripts/core/ phải chạy được ngoài engine
  if (f.includes(path.join('scripts', 'core')) && f.endsWith('.ts')) {
    const src = fs.readFileSync(f, 'utf8')
    if (/from\s+['"]cc['"]/.test(src)) {
      add('core dính engine', rel(f), "import từ 'cc' — core phải test được bằng node thuần")
    }
  }

  // ảnh lớn nằm ngoài bundle: dễ nằm trong gói chính
  if (/\.(png|jpg|webp)$/i.test(f) && !f.includes(path.sep + 'bundles' + path.sep)) {
    const kb = fs.statSync(f).size / 1024
    if (kb > 512) add('ảnh nặng', rel(f), Math.round(kb) + ' KB ngoài bundles/ — kiểm tra lại gói chính')
  }
}

if (!problems.length) {
  console.log('✓ assets/ sạch — ' + files.length + ' file, ' + uuids.size + ' uuid')
  process.exit(0)
}
const byKind = {}
for (const p of problems) (byKind[p.kind] ||= []).push(p)
for (const [kind, list] of Object.entries(byKind)) {
  console.error('\n✗ ' + kind + ' (' + list.length + ')')
  for (const p of list) console.error('  ' + p.file + ' — ' + p.why)
}
console.error('\nTổng: ' + problems.length + ' vấn đề')
process.exit(1)
```

**Chạy thử**
- Dự án sạch: in `✓ assets/ sạch — 412 file, 206 uuid`, thoát 0.
- Xoá thử một file `.png` nhưng giữ `.png.meta`: chạy lại phải thấy `✗ meta mồ côi (1)`, thoát 1.
- Thêm `import { Node } from 'cc'` vào một file trong `scripts/core/`: phải thấy `✗ core dính engine (1)`.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **File `.meta` để làm gì? Không commit nó thì chuyện gì xảy ra?**
  → `.meta` giữ uuid và cấu hình import của asset, mà scene với prefab tham chiếu asset **bằng uuid chứ không bằng đường dẫn**. Không commit thì mỗi máy sinh uuid khác nhau, người khác pull về mở prefab ra thấy ô trống mà Git không báo xung đột gì cả — hỏng im lặng, nên mới nguy hiểm.
- `Mid` **Ba người cùng sửa một scene, mỗi lần merge là hỏng. Anh xử lý thế nào?**
  → `.scene` là JSON chứa uuid nên merge văn bản gần như luôn cho ra file mất node hoặc không mở được. Tôi chia scene thành prefab theo tính năng để hai người sửa hai file khác nhau, khai `*.scene -merge` trong `.gitattributes` để xung đột thành "chọn bản của ai", và giữ luật một scene một người tại một thời điểm.
- `Senior` **Tổ chức `assets/` ra sao để vừa dễ làm nhóm, vừa chia được Asset Bundle, vừa kiểm được bằng CI?**
  → Chia theo **khi nào cần** chứ không theo loại file, vì bundle cấu hình theo thư mục: `bundles/level-pack/` tách khỏi phần vào gói chính. Tách `scripts/core/` không import `'cc'` để test chạy bằng `node` trong mili giây. Và có script CI chỉ đọc bắt `.meta` mồ côi, file thiếu `.meta`, uuid trùng — vì quy ước không ai kiểm thì ba tháng sau không còn là quy ước.

**Khung trả lời 60 giây** — "File `.meta` để làm gì?"

> Mỗi asset có một `.meta` chứa uuid và cấu hình import. Scene với prefab tham chiếu asset bằng uuid chứ không bằng đường dẫn, nên `.meta` chính là chỗ giữ mối liên kết. Không commit nó thì mỗi máy tự sinh uuid khác nhau, người này pull về mở prefab ra là thấy ô trống, mà Git không báo xung đột gì cả. Cũng vì vậy nên mọi thao tác đổi tên, di chuyển, xoá asset đều phải làm trong Editor — làm bằng File Explorer thì `.meta` lạc khỏi file gốc và mất liên kết y như vậy. Ở dự án cũ tôi có một script CI chỉ đọc, bắt `.meta` mồ côi và file thiếu `.meta`, chạy trước mỗi PR.

**Họ sẽ đào tiếp**

- *"Vậy `library/` có commit không?"* → Không. Đó là bản asset đã import, sinh lại được từ `assets/` + `.meta`. Commit nó là làm repo phình và xung đột liên tục.
- *"Xoá `library/` thì mất gì?"* → Không mất gì ngoài thời gian: mở Editor lên nó import lại. Đây cũng là cách chữa phần lớn lỗi "Editor cư xử lạ".
- *"Prefab nhỏ thì nhiều file hơn, có phải đánh đổi không?"* → Có, nhưng đổi đúng chiều: nhiều file nhỏ thì hai người sửa hai file khác nhau; một scene to thì hai người sửa cùng một file JSON.
- *"`scripts/core/` không import `'cc'` để làm gì?"* → Để test và mô phỏng cân bằng chạy bằng `node` trong mili giây, không cần mở Editor.

**Cờ đỏ**

- Không biết `.meta` là gì, hoặc tưởng nó là file tạm nên ignore.
- "Merge scene thì tôi mở ra sửa tay JSON" — sửa được một lần, lần sau mất node mà không biết.
- Trả lời quy ước thư mục thuần lý thuyết, không nối được với Asset Bundle hay với việc làm nhóm.
- Không phân biệt `assets/` (nguồn) với `library/` (dẫn xuất).

**Số / ví dụ nên thuộc**

- Commit: `assets/` (kèm mọi `.meta`), `settings/`, `extensions/`, `package.json`.
- Bỏ: `library/`, `temp/`, `build/`, `profiles/`, `local/`.
- `.gitattributes`: `*.scene -merge`, `*.prefab -merge`.
- Auto Atlas nên giữ dưới 2048×2048.
- Quy ước một câu: **mọi thao tác asset làm trong Editor**.
