# AGENTS.md — luật làm việc cho AI coding agent

**File này là luật chung cho mọi agent** làm việc trong kho này: Codex, Claude Code,
Cursor, Copilot… Codex đọc thẳng file này; Claude Code đọc nó qua [`CLAUDE.md`](CLAUDE.md).

> **Sửa luật thì sửa ở đây.** Đừng chép nội dung sang `CLAUDE.md` hay file khác —
> hai bản luật khác nhau là cách chắc chắn nhất để hai agent làm hai kiểu.

## 0. Đọc theo thứ tự này

| # | File | Cho biết |
|---|---|---|
| 1 | [`AI_CONTEXT.md`](AI_CONTEXT.md) | Kho này là gì, 9 nhánh chứa gì, khi được nhờ làm game thì đọc đâu |
| 2 | [`KNOWLEDGE_INDEX.md`](KNOWLEDGE_INDEX.md) | Mục lục phẳng: mọi node + id + summary + đường dẫn (tự sinh) |
| 3 | [`content/_SCHEMA.md`](content/_SCHEMA.md) | Quy ước viết node: frontmatter, các mục bắt buộc, hình SVG |
| 4 | File node cụ thể | Nội dung |

Đừng đọc hết `content/` để "nắm bối cảnh" — dùng `KNOWLEDGE_INDEX.md` để biết có gì,
rồi chỉ mở đúng node cần.

## 1. Nguồn chân lý

```
content/**/*.md          ← CHỈ SỬA Ở ĐÂY
        ↓ node scripts/build-graph.mjs
public/data/graph.json   (tự sinh — web đọc)
KNOWLEDGE_INDEX.md       (tự sinh — AI đọc)
        ↓
src/**                   web React + React Flow
```

`public/data/graph.json` và `KNOWLEDGE_INDEX.md` **bị ghi đè mỗi lần build**.
Sửa tay hai file đó = mất trắng ở lần `npm run graph` kế tiếp.

## 2. Lệnh

```bash
npm run dev      # watcher graph + vite dev server (http://localhost:5180)
npm run graph    # sinh lại graph.json + KNOWLEDGE_INDEX.md
npm run check    # validate strict — thoát 1 nếu có bất kỳ cảnh báo nào
npm run build    # build production vào dist/
```

`npm run check` là **cổng duy nhất**. Nó bắt: trùng id, `parent`/`related`/`[[wiki-link]]`
trỏ sai, chu trình trong cây, code fence lẻ, thiếu mục 🤖, trùng `read`, thiếu `level`,
`see:` trong từ điển trỏ vào node không có thật, bản dịch mồ côi.

## 3. Luật cứng

Vi phạm những điều này là **sai**, không phải lựa chọn phong cách:

1. **Không sửa tay** `public/data/graph.json`, `KNOWLEDGE_INDEX.md`.
2. **Không đổi `id`** của node đã tồn tại — node khác đang trỏ tới nó bằng `[[id]]`.
3. **Không xoá node.** Nội dung lỗi thời thì sửa và ghi chú.
4. **Không đổi cấu trúc 9 nhánh** trừ khi được yêu cầu thẳng.
5. **Không thêm dependency** mà chưa hỏi. Không chuyển sang TypeScript.
6. **Không thay parser frontmatter** trong `build-graph.mjs` bằng thư viện YAML mà chưa hỏi — nó là bản tối giản cố ý.
7. **Viết tiếng Việt**, thuật ngữ chuyên ngành giữ tiếng Anh (core loop, behavior tree, faucet/drain…).
8. **Không dịch bằng cách sửa file gốc.** Bản tiếng Việt là nguồn chân lý; bản dịch nằm ở file song song `<tên>.en.md`.
9. **Chạy `npm run check` sau khi sửa content** và sửa hết cảnh báo trước khi báo xong.

## 4. Quy trình chuẩn

### 4.1 Thêm node mới

1. Tạo `content/<nhánh>/<ten-node>.md`. **Cây node suy ra từ cây thư mục** — không khai báo ở đâu khác.
2. Frontmatter tối thiểu: `title`, `summary`, `read`, `level`.
   - `read` là **khoá sắp xếp thưa** (bội số 10): chọn khe trống giữa hai node liền kề (330 → 335 → 340). **Đừng đánh số lại cả kho.**
   - `level`: `basic` | `intermediate` | `advanced`. Độc lập với `read`.
3. Viết thân bài. Liên kết node khác bằng `[[id-node]]`.
4. Thêm mục `## 🤖 Prompt cho AI` ở cuối — **bắt buộc**, đúng bốn phần theo thứ tự:
   `**Dùng AI thế nào…**` → `**Phải nêu rõ**` → `**Mẫu prompt**` → `**Bẫy thường gặp**`.
   Nội dung phải **cụ thể cho chủ đề**. "Hãy nêu rõ yêu cầu" là câu vô nghĩa — bị coi là chưa viết.
5. `npm run check` → sạch cảnh báo.

### 4.2 Sửa node có sẵn

Sửa thẳng file markdown. Giữ nguyên `id`. Nếu nội dung rút từ sách, ghi vào `refs:`.
Nếu sửa làm `summary` không còn đúng, sửa luôn `summary`.

### 4.3 Dịch sang tiếng Anh

Tạo `<tên>.en.md` **cùng thư mục**. Frontmatter chỉ có `title` + `summary` — mọi metadata
khác (`read`, `level`, `tags`, `related`) chỉ nằm ở file gốc. Trong bản dịch dùng
`## 🤖 Prompt for AI`. SVG trong bản dịch phải đổi id của `<marker>`/`<defs>` (thêm hậu tố
`-en`) vì cả hai bản cùng hiện trên một trang ở chế độ song ngữ. Đổi tên file gốc thì đổi
luôn file dịch — nếu không, build báo "bản dịch mồ côi".

### 4.4 Các mục mở rộng (tab trên web)

Ngoài mục 🤖 bắt buộc, node có thể có thêm mục được build tách thành tab riêng —
`## 🎮 Unity` (cách hiện thực hoá), `## 💻 Code` (script demo chạy được, cho nhánh
`09-unity/`). **Danh sách thật luôn là hằng `SECTIONS` trong
[`scripts/build-graph.mjs`](scripts/build-graph.mjs)** — đọc nó thay vì tin danh sách
chép tay ở đây, vì mục mới được thêm theo thời gian. Cấu trúc từng mục ở `content/_SCHEMA.md`.

Code trong các mục này phải **chạy được**, không phải giả mã. Node lý thuyết thì bỏ qua —
đừng bịa một mục Unity cho node không hiện thực hoá được.

### 4.5 Nạp sách vào kho

Sách ở `sources/` (không commit). Quy trình đầy đủ ở [`sources/README.md`](sources/README.md).
Luật: **đề xuất trước, sửa sau** — đưa bảng "bổ sung gì / mâu thuẫn gì / cần node mới nào",
chờ duyệt. Hai nguồn mâu thuẫn thì **giữ cả hai và nêu điều kiện áp dụng**, đừng trung bình hoá.
Ghi nguồn vào `refs:`.

### 4.6 Khi được nhờ làm game

`content/07-blueprints/` là thứ được thực thi; 8 nhánh còn lại là để hiểu *vì sao*.
Ba mục trong GDD là ràng buộc cứng: **Design Pillars**, **Bất biến (INV-xx)**,
**Không thuộc phạm vi**. Chi tiết ở `AI_CONTEXT.md`.

### 4.7 Từ điển thuật ngữ

`content/_GLOSSARY.md` → `graph.glossary`. Web tự tô tím và cho bấm vào **mọi chỗ khớp**
— cả `inline code` lẫn văn xuôi — rồi hiện popover giải thích, kèm nút mở node nếu entry
có `see:`. **Không cần đánh dấu gì trong node**: chỉ cần thuật ngữ có trong từ điển và
viết đúng chính tả như trong từ điển. Chỉ tô lần xuất hiện đầu trong mỗi mục; bỏ qua code
block, link, tiêu đề, SVG. Logic ở `src/lib/rehypeGlossary.js`.

## 5. Bẫy đã từng làm hỏng kho

Bốn lỗi dưới đây có chung một tính chất: **build vẫn chạy, không báo gì, nội dung âm thầm biến mất.**

| Bẫy | Hậu quả | Phòng |
|---|---|---|
| **Code fence lẻ** (số fence là số lẻ) | Mọi heading phía sau bị coi là code → mục 🤖/🎮 biến mất khỏi web | `npm run check` báo lỗi. Đã xảy ra ở `meta-systems.md` |
| **Dòng trống trong `<figure class="fig">`** | Markdown coi là hết khối HTML thô → phần SVG sau đó render thành chữ lộn xộn | Tuyệt đối không để dòng trống bên trong figure |
| **CRLF trên Windows** | Regex tách mục neo `$` không khớp → **toàn bộ** mục 🤖/🎮/💻 rỗng trong `graph.json` | `.gitattributes` ép LF + `readMd()` chuẩn hoá khi đọc |
| **Đánh số lại `read`** | Diff khổng lồ, xung đột với mọi nhánh đang làm dở | Chỉ chèn vào khe trống |

Sau khi sửa content, **nhìn dòng thống kê** `npm run check` in ra
(`81 node · … · 81/81 có prompt · … · 134 thuật ngữ`). Con số tụt bất thường = một
trong các bẫy trên vừa xảy ra, kể cả khi không có cảnh báo nào.

## 6. Khi nhiều agent làm cùng lúc

Kho này được thiết kế để Codex và Claude Code cùng dùng. Hai luật để không giẫm chân nhau:

1. **`git status` trước khi bắt đầu.** Cây làm việc bẩn = có agent (hoặc người) đang làm dở.
   Đọc diff trước; **đừng sửa file đang có thay đổi chưa commit của người khác**, và đừng
   `git checkout`/`reset` đè lên nó. Việc của bạn không đụng file đó thì cứ làm tiếp.
2. **File tự sinh đừng merge tay.** `graph.json` và `KNOWLEDGE_INDEX.md` xung đột thì
   lấy bản nào cũng được rồi chạy lại `npm run graph` — kết quả mới là đúng.
   Commit file content và file tự sinh **cùng một commit** để CI không lệch.

## 7. Quy ước code (`src/`, `scripts/`)

- ES modules, **không TypeScript**.
- React 18 + `@xyflow/react` v12. Layout tính bằng `d3-hierarchy` trong `src/lib/layout.js`.
- **Node mindmap có kích thước cố định** — xem `widthFor()` và `HEIGHT` trong
  `src/components/MindMap.jsx`. Layout phụ thuộc vào điều này; đừng chuyển sang chiều cao
  tự động mà không sửa phần tính toạ độ.
- Parser frontmatter trong `scripts/build-graph.mjs` là bản tối giản tự viết (scalar,
  inline array, block array) — cố ý, đừng thay bằng thư viện YAML mà chưa hỏi.

## 8. Xong việc nghĩa là gì

- [ ] `npm run check` sạch — không cảnh báo, không lỗi
- [ ] Dòng thống kê không có con số nào tụt so với trước khi sửa
- [ ] Node mới có đủ `read`, `level`, và mục 🤖 bốn phần cụ thể cho chủ đề
- [ ] Không có file tự sinh nào bị sửa tay
- [ ] Báo cáo đúng sự thật: cảnh báo nào chưa sửa được thì nói rõ, đừng im lặng
