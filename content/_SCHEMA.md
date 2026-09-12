# Quy ước viết node (file này bị build bỏ qua vì bắt đầu bằng `_`)

## Frontmatter

```markdown
---
id: behavior-tree          # tuỳ chọn — mặc định lấy từ tên file
title: Behavior Tree       # tiêu đề hiện trên mindmap
icon: 🌳                   # tuỳ chọn, 1 emoji
summary: Một câu mô tả node này nói về cái gì.
status: deep               # deep | stub  (mặc định suy ra từ độ dài nội dung)
read: 340                  # THỨ TỰ ĐỌC — khoá sắp xếp, xem bên dưới
level: intermediate        # basic | intermediate | advanced
order: 20                  # thứ tự giữa các node anh em trên mindmap
tags: [ai, npc, pattern]
related: [fsm, goap, utility-ai]   # liên kết ngang, vẽ bằng nét đứt
refs:                      # nguồn tham khảo, hiện ở panel
  - "Millington — AI for Games, ch.5"
parent: game-ai            # hiếm khi cần — mặc định suy ra từ thư mục
collapsed: false
---
```

`title` là bắt buộc trên thực tế. `read` và `level` nên luôn có — thiếu thì `npm run check` cảnh báo.

## `read` — thứ tự đọc

`read` là **khoá sắp xếp**, không phải số thứ tự hiển thị. Build sắp xếp mọi node theo
`read` tăng dần rồi gán thứ hạng liên tục `1..N` (`readIndex`) để hiện trên web.

Nhờ vậy, chèn node mới **không phải đánh số lại cả kho**:

```
read: 330   Finite State Machine      → hiện là #33
read: 335   ← node mới chèn vào đây   → tự thành #34
read: 340   Behavior Tree             → tự thành #35
```

Quy ước: dùng **bội số của 10** cho node chính, số lẻ ở giữa khi chèn thêm.
Node không khai `read` bị xếp xuống cuối lộ trình.

Trùng `read` giữa hai node sẽ bị cảnh báo — thứ tự khi đó phụ thuộc tie-break, khó đoán.

## `level` — mức độ kiến thức

| Giá trị | Ký hiệu | Nghĩa |
|---|---|---|
| `basic` | ● | Ai cũng nên đọc, không cần kiến thức nền |
| `intermediate` | ◐ | Cần đã nắm phần cơ bản |
| `advanced` | ○ | Chuyên sâu, chỉ đọc khi dự án thật sự cần |

Nhận cả tiếng Việt (`cơ bản`, `trung cấp`, `chuyên sâu`). Giá trị lạ sẽ bị cảnh báo.

**Lưu ý:** `level` và `read` độc lập nhau. Lộ trình đọc đi theo chủ đề, nên một node
`advanced` (ví dụ `balancing-math`, #24) có thể nằm trước một node `intermediate`
(ví dụ `fsm`, #33). Đó là cố ý — bạn đọc hết mảng Systems rồi mới sang mảng AI.

## Cây node suy ra từ cây thư mục

```
content/index.md                     -> node gốc
content/04-game-ai/index.md          -> nhánh "game-ai", cha là gốc
content/04-game-ai/fsm.md            -> node "fsm", cha là "game-ai"
content/04-game-ai/rl/q-learning.md  -> node "q-learning", cha là "rl"
```

Tiền tố số (`04-`) chỉ để sắp xếp thư mục trên ổ đĩa, build sẽ cắt bỏ khỏi id.
Thư mục/file bắt đầu bằng `_` hoặc `.` bị bỏ qua.

## Mục bắt buộc: `## 🤖 Prompt cho AI`

**Mọi node phải có mục này, đặt ở cuối file.** `npm run check` sẽ báo lỗi nếu thiếu.

Build script tách mục này ra khỏi thân bài thành trường riêng (`node.aiPrompt`), nên
trên web nó hiện thành một khối riêng có nút copy, và có thể xuất gộp thành playbook.

Cấu trúc chuẩn **bốn phần, theo thứ tự** — mục đích là chống viết chung chung:

```markdown
## 🤖 Prompt cho AI

**Dùng AI thế nào cho <loại việc này>**

<Vai của AI ở chủ đề này. Việc nào giao được, việc nào không. Quy trình mấy
bước. Nếu có nhiều chế độ dùng thì lập bảng: chế độ | khi nào | câu mở đầu.>

**Phải nêu rõ** (thiếu là AI tự bịa):
- <tham số / quyết định cụ thể AI sẽ điền đại nếu bạn không nói>

**Mẫu prompt**

​```
<prompt copy-paste được, có SỐ, có ràng buộc PHỦ ĐỊNH (KHÔNG / CẤM)>
​```

**Bẫy thường gặp:** <AI hay làm sai gì ở đúng chủ đề này>
```

Bốn phần trả lời bốn câu khác nhau, đừng gộp:

| Phần | Trả lời câu |
|---|---|
| *Dùng AI thế nào* | **Có nên giao việc này cho AI không, và giao phần nào?** |
| *Phải nêu rõ* | Tôi thiếu thông tin gì trong đầu bài? |
| *Mẫu prompt* | Diễn đạt ra sao cho máy hiểu? |
| *Bẫy* | Vì sao kết quả trông đúng mà vẫn sai? |

Phần đầu là phần **quan trọng nhất và mới nhất**: nó ngăn việc giao cho AI đúng
loại việc nó không làm được. Build đếm độ phủ phần này và in ra (`x có howto`),
nên biết được còn node nào chưa có.

Nội dung phần đầu phải **cụ thể cho chủ đề**. "Hãy nêu rõ yêu cầu" là câu vô
nghĩa; "ở khâu cân bằng, bắt nó chạy mô phỏng chứ đừng nhận con số nó khẳng
định" thì có nghĩa. Xem [[ai-for-design]], [[ai-for-build]], [[ai-for-publish]]
về vai của AI ở ba khâu, và [[ai-limits]] về chỗ không nên giao.

Tiêu đề chấp nhận cả `## Prompt cho AI` (không emoji), nhưng nên giữ emoji cho đồng bộ.

## Hình minh hoạ (SVG nội tuyến)

Node có thể chứa sơ đồ SVG viết thẳng trong markdown:

```html
<figure class="fig">
<svg viewBox="0 0 660 200" role="img" aria-label="Mô tả cho người dùng screen reader">
  <rect x="14" y="26" width="140" height="54" rx="9" class="fig-box"/>
  <text x="84" y="49" text-anchor="middle" class="fig-label" font-size="14">Nhãn</text>
</svg>
<figcaption>Chú thích dưới hình.</figcaption>
</figure>
```

> ⚠️ **TUYỆT ĐỐI KHÔNG để dòng trống bên trong `<figure>`.**
> Trong markdown, một dòng trống **kết thúc khối HTML thô** — phần SVG sau dòng
> trống sẽ bị đẩy ra ngoài `<svg>` và render thành chữ lộn xộn. Đây là lỗi rất
> dễ vấp và trông không giống lỗi cú pháp.

**Class dùng chung** (tự đổi màu theo theme, đừng hardcode màu cho những thứ này):

| Class | Dùng cho |
|---|---|
| `fig-box` | Khung hộp nền |
| `fig-line` | Đường nối, trục |
| `fig-label` | Chữ chính |
| `fig-muted` | Chữ phụ, ghi chú |

Màu nhấn thì hardcode được, nên dùng đúng bảng màu của app:
`#6ea8fe` xanh dương · `#51cf9b` xanh lá · `#ffd43b` vàng · `#ff8787` đỏ · `#b197fc` tím

**Quy tắc khác**
- `viewBox` rộng khoảng 660 là vừa khung panel.
- Luôn có `role="img"` và `aria-label` mô tả nội dung sơ đồ.
- `id` của `<marker>`/`<defs>` phải **duy nhất trong toàn kho** (đặt tiền tố theo node, ví dụ `cl-a` cho core-loop) — nhiều node có thể cùng hiện trên một trang.
- Trên màn hình hẹp sơ đồ tự cuộn ngang trong khung, không co nhỏ.

## Mục tuỳ chọn: `## 🎮 Unity`

Node nào hiện thực hoá được trong Unity thì thêm mục này ở **cuối file, sau mục 🤖**.
Build tách nó thành trường `node.unity`, web hiện thành **tab thứ ba** trong panel.

Khác mục 🤖, mục này **không bắt buộc** — node thuần lý thuyết (`mda-framework`,
`player-motivation`, các node `index`) thì bỏ qua, tab sẽ không hiện.

Cấu trúc chuẩn:

```markdown
## 🎮 Unity

Một câu: trong Unity, điểm mấu chốt của bước này là gì.

**Component & nơi đặt**
- `TênScript.cs` — đặt ở đâu
- `TênConfig` (ScriptableObject) — trong `Assets/Data/...`

**Code**

​```csharp
// code chạy được, không phải giả mã
​```

**Bẫy Unity cụ thể**
- Thứ chỉ sai trong Unity (timeScale, GetComponent, Has Exit Time…)

**Kiểm tra nhanh**
- Việc kiểm chứng được, làm trong vài giây
```

**Nguyên tắc viết mục này**
- Code phải **chạy được**, không phải giả mã. Nêu rõ phiên bản nếu API đã đổi
  (ví dụ `rb.velocity` → `rb.linearVelocity` từ Unity 6).
- Ưu tiên nói **cái bẫy riêng của Unity** hơn là lặp lại kiến thức đã có ở thân bài.
- "Kiểm tra nhanh" phải kiểm chứng được, không phải lời khuyên chung.
- Sơ đồ setup (Hierarchy / Inspector) dùng `<figure class="fig">` như mọi hình khác —
  xem mục Hình minh hoạ ở trên.

## Mục tuỳ chọn: `## 💻 Code`

Dành cho nhánh **Unity thực chiến** (`09-unity/`), đặt ở **cuối file, sau mục 🤖**.
Build tách thành trường `node.code`, web hiện thành tab **💻 Code**. Node ở nhánh khác
không cần mục này (chúng đã có tab 🎮 Unity).

Khác với code rải trong thân bài (từng đoạn minh hoạ một ý), mục này là **một demo trọn vẹn**:
copy vào dự án Unity 6 là chạy, kèm hình mô phỏng Inspector để biết đặt gì ở đâu.

Cấu trúc chuẩn:

```markdown
## 💻 Code

Một câu: demo này dựng cái gì, kiểm chứng được điều gì.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 320" role="img" aria-label="Mô tả Inspector">
  <!-- Hierarchy bên trái, Inspector bên phải — dùng class fig-box / fig-label / fig-muted -->
</svg>
<figcaption>Hierarchy và Inspector của demo.</figcaption>
</figure>

**Script**

​```csharp
// MỘT file .cs hoàn chỉnh, có using, biên dịch được trên Unity 6 (6000.x) + URP
​```

**Chạy thử**
- Bước để thấy kết quả và con số mong đợi
```

**Nguyên tắc**
- Script là **một file hoàn chỉnh** (có `using`, class, mọi field), không phải đoạn cắt.
  Nếu demo cần hai script thì đặt hai fence, mỗi fence một file, ghi tên file trong comment dòng đầu.
- Hình Inspector dùng SVG như mọi hình khác: khung `fig-box`, nhãn `fig-label`, giá trị `fig-muted`,
  màu nhấn theo bảng màu app. **Không dòng trống trong `<figure>`.** Id `<marker>/<defs>` có tiền tố node.
- Giá trị trong Inspector phải khớp với giá trị mặc định trong script.
- "Chạy thử" nêu con số hoặc hiện tượng cụ thể để biết demo chạy đúng.

## Mục tuỳ chọn: `## 🎤 Phỏng vấn`

Đặt ở **cuối file**, sau mục 🤖 (và sau 🎮/💻 nếu có). Build tách thành trường
`node.interview`, web hiện thành tab **🎤 Phỏng vấn**; `KNOWLEDGE_INDEX.md` đánh dấu 🎤.

Mục này phục vụ một mục đích khác hẳn thân bài: thân bài dạy **hiểu**, mục này luyện
**nói ra miệng trong 60 giây**. Kiến thức đã có sẵn phía trên — đừng chép lại, hãy đổi
nó sang dạng hỏi–đáp.

Cấu trúc chuẩn **năm phần, theo thứ tự**:

```markdown
## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | <câu hỏi định nghĩa / phân biệt hai khái niệm> |
| Mid | <câu hỏi tình huống: "X hỏng, anh làm gì"> |
| Senior | <câu hỏi đánh đổi: "chọn A hay B, vì sao"> |

**Khung trả lời 60 giây** — "<câu hỏi lõi của node này>"

> <Lời nói ra miệng, 3–6 câu, có SỐ và có lý do. Viết như đang trả lời thật,
> không phải như gạch đầu dòng.>

**Họ sẽ đào tiếp**

- *"<câu hỏi tiếp>"* → <ý bắt buộc phải chạm tới khi trả lời>

**Cờ đỏ**

- <câu trả lời nghe có vẻ ổn nhưng làm người phỏng vấn đánh trượt>

**Số / ví dụ nên thuộc**

- <con số, tên hàm trong Profiler, ngưỡng — thứ phải bật ra ngay, không cần nghĩ>
```

**Nguyên tắc**
- **Cụ thể cho node, không chung chung.** "Hãy nói về kinh nghiệm của bạn" là câu vô nghĩa;
  "Game tụt 25fps trên Android tầm trung, anh làm gì đầu tiên?" mới là câu hỏi thật.
- Khung trả lời viết ở **giọng nói**, để trong blockquote. Đọc to lên thấy trúc trắc
  nghĩa là chưa đạt.
- Mỗi phần "đào tiếp" phải trả lời được **vì sao**, không chỉ **là gì**.
- Con số lấy từ chính thân bài node, không bịa. Nếu thân bài không có số nào đáng nhớ
  thì đó là dấu hiệu thân bài cần bổ sung, không phải chỗ để chế ra số.
- Cờ đỏ là **câu trả lời sai mà nghe hay**, không phải lỗi ngớ ngẩn hiển nhiên.

**Mục này được máy đọc lại.** Chế độ **🎤 Luyện phỏng vấn** trên web tách mục này thành
thẻ hỏi–đáp: mỗi dòng trong bảng "Câu hay gặp" là một thẻ, và mặt sau ghép từ khung trả
lời + đào tiếp + cờ đỏ + số nên thuộc. Parser ở `src/lib/practice.js` bám đúng năm nhãn
in đậm ở trên — đổi tên nhãn thì thẻ của node đó biến mất khỏi bộ luyện tập mà build
không báo gì. Nút **🎤 Xuất bộ ôn phỏng vấn** gom toàn bộ mục này thành một file markdown.

## Bản dịch — file song song

Kho viết gốc bằng tiếng Việt. Bản dịch nằm ở **file song song** cùng thư mục:

```
content/01-foundations/core-loop.md       ← bản gốc (tiếng Việt)
content/01-foundations/core-loop.en.md    ← bản tiếng Anh
```

Web có 3 chế độ: **VI** · **EN** · **VI·EN** (song ngữ hai cột).

**File dịch chỉ chứa phần chữ.** Frontmatter chỉ cần `title` và `summary`:

```markdown
---
title: Core Loop
summary: The chain of actions a player repeats constantly — …
---

Nội dung dịch…

## 🤖 Prompt for AI

…
```

Mọi thứ khác (`id`, `read`, `level`, `tags`, `related`, `order`, vị trí trên
mindmap) **chỉ lấy từ file gốc**. Nhờ vậy thiếu bản dịch không bao giờ làm hỏng
graph — UI tự lùi về bản gốc kèm thông báo, và node hiện chip `EN ✕`.

**Tiêu đề mục trong file dịch:** dùng `## 🤖 Prompt for AI` (build nhận cả hai
ngôn ngữ). Mục `## 🎮 Unity` giữ nguyên tên.

**Đổi tên file gốc thì nhớ đổi cả file dịch** — build cảnh báo "bản dịch mồ côi"
nếu `.en.md` không có file `.md` tương ứng.

### Nhờ AI dịch

```
Dịch content/<đường-dẫn>.md sang tiếng Anh, ghi ra <đường-dẫn>.en.md

Quy tắc:
- Frontmatter CHỈ giữ title và summary. Bỏ read/level/tags/related/order/refs.
- Giữ NGUYÊN cấu trúc heading, bảng, code block, và mọi [[wiki-link]].
- Giữ nguyên thuật ngữ chuyên ngành tiếng Anh đã có (core loop, hitstop…).
- Đổi `## 🤖 Prompt cho AI` thành `## 🤖 Prompt for AI`. Giữ `## 🎮 Unity`.
- SVG trong <figure>: dịch phần <text>, GIỮ NGUYÊN toạ độ và class.
  Đổi id của <marker>/<defs> thêm hậu tố -en để không trùng với bản gốc.
- KHÔNG để dòng trống bên trong <figure>.
- Dịch cho người đọc là lập trình viên game, không dịch word-by-word.

Xong thì chạy `npm run check`.
```

Dòng về `id` của `<marker>` quan trọng: hai bản cùng hiện trên một trang ở chế
độ song ngữ, id trùng sẽ làm mũi tên biến mất ở một trong hai cột.

## Liên kết trong nội dung

Viết `[[id-cua-node]]` ở bất kỳ đâu trong thân bài. Build sẽ:
- biến nó thành link bấm được trong panel,
- tự tạo một cạnh nét đứt trên mindmap.

Ví dụ: `Xem thêm [[goap]] nếu cần lập kế hoạch động.`

## Từ điển thuật ngữ

`content/_GLOSSARY.md` là từ điển dùng chung. Build nạp nó vào `graph.glossary`,
web tự tô màu và cho bấm mọi chỗ khớp — **không cần đánh dấu gì trong node**.

Hai đường khớp:

| Viết trong node | Kết quả |
|---|---|
| `` `hitstop` `` (inline code) | hộp code màu tím, bấm được |
| `hitstop` (văn xuôi, kể cả trong `**đậm**`) | chữ màu tím gạch chân đứt, bấm được |

Quy tắc để không rối mắt:

- Chỉ tô **lần xuất hiện đầu tiên** của mỗi thuật ngữ trong một mục
  (mục 📄 / 🤖 / 🎮 / 💻 đếm riêng).
- Bỏ qua chữ bên trong code block, link, tiêu đề và SVG.
  Link `[[core-loop]]` đã mở được node rồi — không cần popover chồng lên.

Muốn một thuật ngữ mới được tô: thêm nó vào `_GLOSSARY.md`, viết tên **đúng như
cách nó xuất hiện trong nội dung**, thêm alias cho các cách viết khác. `see:`
trỏ tới node đọc sâu thì popover có thêm nút mở node đó, và `npm run check`
kiểm tra id đó có thật.

## Thêm một node mới — 4 bước

1. Tạo `content/<nhánh>/<ten-node>.md`
2. Frontmatter: `title`, `summary`, `read`, `level`
   — chọn `read` là khe trống giữa hai node liền kề trong lộ trình
3. Viết nội dung + mục `## 🤖 Prompt cho AI` ở cuối
4. Lưu. Nếu đang chạy `npm run dev`, mindmap tự cập nhật.

## Nạp kiến thức từ sách

Thả sách vào `sources/`, xem quy trình ở `sources/README.md`.
Node có nội dung rút từ sách thì khai `refs:` để biết nền tài liệu của nó tới đâu.

## Kiểm tra

```bash
npm run check
```

Báo lỗi trùng `id`, `parent`/`related` trỏ vào node không tồn tại, `[[wiki-link]]` gãy, và chu trình trong cây.
