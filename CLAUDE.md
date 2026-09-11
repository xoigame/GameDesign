# GameDesign Brain

Kho kiến thức mindmap về **Game Design** và **AI trong game**, đồng thời là nguồn thiết kế cho AI agent đọc trước khi sinh code game.

👉 **Đọc [`AI_CONTEXT.md`](AI_CONTEXT.md) trước khi làm bất cứ việc gì.** File đó giải thích cấu trúc kho và cách điều hướng.

## Kiến trúc

```
content/**/*.md          NGUỒN CHÂN LÝ DUY NHẤT — markdown + frontmatter
        ↓ scripts/build-graph.mjs
public/data/graph.json   dữ liệu cho web mindmap   (tự sinh)
KNOWLEDGE_INDEX.md       mục lục phẳng cho AI      (tự sinh)
        ↓
src/**                   web app React + React Flow
```

**Không bao giờ sửa tay** `public/data/graph.json` và `KNOWLEDGE_INDEX.md` — chúng bị ghi đè mỗi lần build.

## Lệnh

```bash
npm run dev      # watcher graph + vite dev server
npm run graph    # sinh lại graph.json + KNOWLEDGE_INDEX.md
npm run check    # validate: trùng id, link gãy, chu trình
npm run build    # build production vào dist/
```

## Thêm nội dung

Tạo file `.md` trong `content/<nhánh>/`, khai frontmatter tối thiểu:

```markdown
---
title: Tên node
summary: Một câu mô tả.
read: 335            # khoá sắp xếp lộ trình đọc (khe trống giữa 330 và 340)
level: intermediate  # basic | intermediate | advanced
tags: [tag1, tag2]
related: [id-node-khac]
refs: ["Tác giả — Tên sách, ch.X"]   # nếu nội dung rút từ sách
---

Nội dung. Liên kết tới node khác bằng [[id-node]].

## 🤖 Prompt cho AI

**Dùng AI thế nào cho <loại việc này>** …

**Phải nêu rõ:** …

**Mẫu prompt** …

**Bẫy thường gặp:** …
```

Mục `## 🤖 Prompt cho AI` gồm **bốn phần theo thứ tự**: `**Dùng AI thế nào…**` (vai của AI cho loại việc này, chia việc, quy trình) → `**Phải nêu rõ**` → `**Mẫu prompt**` → `**Bẫy thường gặp**`. Build đếm độ phủ phần đầu (`x có howto`). Mục này **bắt buộc có ở mọi node** — build tách nó thành trường riêng `node.aiPrompt`, và `npm run check` báo lỗi nếu thiếu.

Cây node **suy ra từ cây thư mục** — không khai báo ở đâu khác. Quy ước đầy đủ: `content/_SCHEMA.md`.

## Đa ngữ

Bản gốc tiếng Việt là nguồn chân lý. Bản dịch ở file song song `<tên>.en.md` cùng thư mục, chỉ chứa `title` + `summary` trong frontmatter — mọi metadata khác (`read`, `level`, `tags`, `related`) chỉ nằm ở file gốc.

Trong file dịch dùng `## 🤖 Prompt for AI` (build nhận cả hai ngôn ngữ). SVG trong bản dịch phải đổi id của `<marker>/<defs>` (thêm hậu tố `-en`) vì cả hai bản cùng hiện trên một trang ở chế độ song ngữ.

Đổi tên file gốc thì đổi luôn file dịch — build cảnh báo "bản dịch mồ côi".

## Mục Unity

Node hiện thực hoá được trong Unity thì có mục `## 🎮 Unity` ở cuối (sau mục 🤖). Build tách thành `node.unity`, web hiện thành tab thứ ba. **Không bắt buộc** — node lý thuyết thì bỏ qua. Code trong mục này phải chạy được, không phải giả mã. Cấu trúc đầy đủ ở `content/_SCHEMA.md`.

## Mục Code

Node nhánh `09-unity/` có mục `## 💻 Code` ở cuối (sau mục 🤖): **một script demo hoàn chỉnh chạy được** trên Unity 6 + **sơ đồ SVG mô phỏng Inspector/Hierarchy** cho đúng thiết lập của node. Build tách thành `node.code`, web hiện thành tab **💻 Code**. Node ngoài nhánh Unity thì không cần. Cấu trúc ở `content/_SCHEMA.md`.

## Từ điển thuật ngữ

`content/_GLOSSARY.md` → `graph.glossary`. Web tự tô màu tím và cho bấm vào mọi chỗ khớp — cả `inline code` lẫn văn xuôi — rồi hiện popover giải thích, kèm nút mở node nếu entry có `see:`. **Không cần đánh dấu gì trong node**, chỉ cần thuật ngữ có trong từ điển và viết đúng chính tả như trong từ điển.

Chỉ tô lần xuất hiện đầu tiên trong mỗi mục; bỏ qua code block, link, tiêu đề và SVG. Logic ở `src/lib/rehypeGlossary.js`. `npm run check` kiểm tra mọi `see:` trỏ tới node có thật.

## Code fence phải cân

`npm run check` báo **lỗi** nếu một file có số code fence lẻ. Lý do: fence chưa đóng làm mọi heading phía sau bị coi là code, nên các mục 🤖/🎮 không được tách ra và **biến mất khỏi web mà build không báo gì**. Đã xảy ra một lần ở `meta-systems.md`.

## Hình minh hoạ

Node có thể chứa SVG nội tuyến trong `<figure class="fig">`. **Tuyệt đối không để dòng trống bên trong figure** — markdown coi dòng trống là kết thúc khối HTML thô, phần SVG sau đó bị đẩy ra ngoài `<svg>` và render thành chữ lộn xộn. Lỗi này không trông giống lỗi cú pháp nên rất dễ bỏ sót. Class dùng chung và quy ước đầy đủ ở `content/_SCHEMA.md`.

## Quy ước code

- ES modules, không TypeScript.
- React 18 + `@xyflow/react` v12. Layout tính bằng `d3-hierarchy` trong `src/lib/layout.js`.
- Không thêm dependency mới mà chưa hỏi.
- Node mindmap có kích thước cố định (xem `widthFor()` và `HEIGHT` trong `src/components/MindMap.jsx`) — layout phụ thuộc vào điều này, đừng chuyển sang chiều cao tự động mà không sửa phần tính toạ độ.
- Frontmatter parser trong `scripts/build-graph.mjs` là bản tối giản tự viết (scalar, inline array, block array). Đừng thay bằng thư viện YAML mà chưa hỏi.

## Lộ trình đọc

`read` là **khoá sắp xếp thưa** (bội số 10), không phải số hiển thị — build quy nó về thứ hạng `readIndex` 1…N. Thêm node mới thì chọn khe trống giữa hai node liền kề, **đừng đánh số lại cả kho**.

`level` độc lập với `read`: lộ trình đi theo chủ đề, nên node `advanced` có thể nằm trước node `intermediate` thuộc mảng khác. Đó là cố ý.

## Nạp sách

Sách/tài liệu nguồn nằm ở `sources/` (không commit — xem `.gitignore`). Quy trình đầy đủ ở `sources/README.md`.

Luật: **đề xuất trước, sửa sau**. Khi hai nguồn mâu thuẫn thì giữ cả hai và nêu điều kiện áp dụng, đừng trung bình hoá. Ghi nguồn vào `refs:` của node bị sửa.

## Ràng buộc

- Giữ nguyên cấu trúc 9 nhánh trừ khi được yêu cầu đổi.
- Đừng đổi `id` của node đã tồn tại — các node khác đang tham chiếu tới nó.
- Đừng xoá node; nếu nội dung lỗi thời, hãy sửa và ghi chú.
- Nội dung viết bằng **tiếng Việt, thuật ngữ chuyên ngành giữ tiếng Anh** (core loop, behavior tree, faucet/drain…).
- Sau khi sửa content, chạy `npm run check` và sửa hết cảnh báo.
- Node mới bắt buộc có `read` và `level`, và mục `## 🤖 Prompt cho AI` ở cuối theo cấu trúc 4 phần trong `content/_SCHEMA.md`. Nội dung mục đó phải **cụ thể cho chủ đề** — không viết lời khuyên chung chung.
