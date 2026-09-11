# 🧠 GameDesign Brain

Kho kiến thức **mindmap** về Game Design và AI trong game — đồng thời là **bộ não thiết kế** để AI agent (Codex, Claude Code, Cursor) đọc trước khi sinh code game.

<p align="center">
  <em>58 node · 8 nhánh · ~33.000 từ · lộ trình đọc 1→58 · 21 cơ bản / 25 trung cấp / 12 chuyên sâu</em>
</p>

---

## Chạy thử

```bash
npm install
npm run dev
```

Mở http://localhost:5180

## Ý tưởng cốt lõi

Markdown là nguồn chân lý duy nhất. Mọi thứ khác đều được sinh ra từ nó.

```
content/**/*.md
      │
      │  scripts/build-graph.mjs
      ▼
┌─────────────────────┬──────────────────────┐
│  public/data/       │  KNOWLEDGE_INDEX.md  │
│  graph.json         │  (cho AI đọc)        │
│  (cho web mindmap)  │                      │
└─────────────────────┴──────────────────────┘
```

Thêm một file `.md` → node tự xuất hiện trên mindmap, tự vào mục lục cho AI. Không phải khai báo ở đâu khác.

## Tính năng web

- **Ba chế độ ngôn ngữ** — VI · EN · VI·EN (song ngữ hai cột). Node chưa dịch tự lùi về bản gốc kèm thông báo
- **Lộ trình đọc 1→58** — mỗi node có số thứ tự; panel có nút ← → để đi tiếp đúng thứ tự
- **Chỉnh cỡ chữ** — nút A− / A+ (90%–150%), nhớ lựa chọn, vùng chạm 42px trên điện thoại
- **Sơ đồ minh hoạ** — SVG nội tuyến trong markdown, tự đổi màu theo theme, cuộn ngang trên màn hẹp
- **Mức độ kiến thức** — ● cơ bản / ◐ trung cấp / ○ chuyên sâu, lọc được ngay ở sidebar
- **3 kiểu layout** — Mindmap hai bên, Cây trái–phải, Toả tròn
- **Thu gọn / mở rộng** từng nhánh, hoặc toàn bộ
- **Tìm kiếm** toàn văn, không phân biệt dấu tiếng Việt (`/` để focus)
- **Lọc theo tag**
- **Liên kết ngang** giữa các node (nét đứt), làm nổi khi chọn node
- **Panel chi tiết** render markdown đầy đủ: bảng, code block, blockquote
- **3 tab mỗi node** — Nội dung · 🤖 Prompt cho AI · 🎮 Unity (tab Unity chỉ hiện khi node có phần hiện thực hoá)
- **Copy cho AI** — copy một node hoặc cả nhánh dưới dạng markdown có ngữ cảnh, dán thẳng vào chat
- **Xuất playbook prompt** — gộp riêng mục 🤖 của cả 58 node thành một file nhỏ gọn
- **Xuất toàn bộ** kho thành một file `.md` duy nhất
- Minimap, pan/zoom, theme tối

## Cây kiến thức

| Nhánh | Nội dung |
|---|---|
| 🎯 **Nền tảng** | Design pillars, core loop, động lực người chơi, game feel, MDA |
| ⚙️ **Systems** | Kinh tế, tiến trình, chiến đấu, cân bằng toán, đường cong khó, RNG |
| 🗺️ **Content** | Level design, procedural generation, nhịp độ, narrative, onboarding |
| 🎨 **Nghe nhìn & UX** | Art direction, animation, UI, HUD, UX flow, trợ năng, âm thanh, adaptive music |
| 🤖 **AI trong game** | FSM, Behavior Tree, GOAP, Utility AI, pathfinding, AI Director, LLM-NPC |
| 🛠️ **Làm game với AI** | Quy trình, GDD cho AI đọc, prompt pattern, agent guardrails |
| 🏭 **Production** | Kiến trúc, data-driven design, playtest metrics, hiệu năng |
| 📐 **Blueprints** | GDD template + bản thiết kế game thật của bạn |

Trạng thái node: `deep` = đã viết đủ dùng · `stub` = mới có khung (hiện viền đứt trên mindmap — đó là danh sách việc cần làm).

**Mỗi node đều có mục `## 🤖 Prompt cho AI`** — đây là cây cầu từ *học* sang *giao việc*: đọc phần kiến thức để hiểu vấn đề, rồi dùng mục 🤖 để viết đầu bài cho AI assistant sao cho nó hiểu đúng ý, không làm chung chung.

## Lộ trình đọc

Sidebar mở sẵn tab **Lộ trình** — danh sách 1→58 theo thứ tự nên đọc, chia 7 giai đoạn:

| Giai đoạn | # | Nội dung |
|---|---|---|
| A. Nhập môn | 1–8 | Pillars, core loop, động lực, game feel |
| B. Giao việc cho AI | 9–15 | Quy trình, GDD cho máy đọc, prompt, guardrails, template |
| C. Hệ thống | 16–24 | Tiến trình, kinh tế, combat, độ khó, cân bằng |
| D. Nội dung | 25–30 | Level, onboarding, nhịp độ, narrative, procgen |
| E. Nghe nhìn & UX | 31–40 | Art direction → animation → UI → HUD → UX flow → trợ năng → âm thanh |
| F. AI trong game | 41–51 | FSM → BT → perception → pathfinding → utility → GOAP → LLM |
| G. Production | 52–58 | Data-driven, kiến trúc, đo đạc, hiệu năng |

Giai đoạn A+B (15 node, tất cả đều ● cơ bản) là **phần tối thiểu để bắt đầu giao việc cho AI**. Các giai đoạn sau tra khi cần, không phải đọc tuần tự.

`read` trong frontmatter là **khoá sắp xếp thưa** (bội số 10), không phải số hiển thị — chèn node mới vào khe trống mà không phải đánh số lại cả kho.

## Đa ngữ

Bản gốc viết bằng tiếng Việt. Bản dịch nằm ở file song song:

```
content/01-foundations/core-loop.md      ← bản gốc (vi)
content/01-foundations/core-loop.en.md   ← bản tiếng Anh
```

Chuyển chế độ bằng nút **VI / EN / VI·EN** ở góc trên sidebar. Chế độ song ngữ
mở panel rộng ra và xếp hai bản cạnh nhau — tiện để tra thuật ngữ.

File dịch **chỉ chứa phần chữ** (`title` + `summary` + nội dung). Cấu trúc cây, thứ tự
đọc, mức độ, tag đều chỉ lấy từ file gốc, nên thiếu bản dịch không làm hỏng gì —
UI tự lùi về bản gốc và gắn chip `EN ✕`.

Prompt nhờ AI dịch một node có sẵn trong [`content/_SCHEMA.md`](content/_SCHEMA.md).

## Nạp sách vào kho

Thả `.pdf` / `.epub` / `.txt` vào `sources/` rồi bảo AI đọc và đối chiếu với kho hiện có. Quy trình đầy đủ: [`sources/README.md`](sources/README.md).

Nguyên tắc: **đề xuất trước, sửa sau**; hai nguồn mâu thuẫn thì giữ cả hai và nêu điều kiện áp dụng; node bị sửa phải ghi `refs:` để biết nền tài liệu của nó tới đâu.

## Mở rộng kho

Tạo file mới trong `content/<nhánh>/`:

```markdown
---
title: Wave Function Collapse
summary: Sinh nội dung bằng lan truyền ràng buộc từ một mẫu ví dụ.
tags: [procgen, algorithm]
related: [procedural-generation, level-design]
---

Nội dung ở đây. Liên kết tới node khác bằng [[procedural-generation]].

## 🤖 Prompt cho AI

**Phải nêu rõ:** kích thước output, ràng buộc liền kề, hành vi khi mâu thuẫn.

**Mẫu prompt** … (xem `content/_SCHEMA.md`)

**Bẫy thường gặp:** WFC thất bại im lặng khi ràng buộc mâu thuẫn.
```

> Mục `## 🤖 Prompt cho AI` là **bắt buộc** — `npm run check` báo lỗi nếu thiếu.

Lưu lại — nếu đang chạy `npm run dev`, mindmap cập nhật ngay.

Quy ước frontmatter đầy đủ: [`content/_SCHEMA.md`](content/_SCHEMA.md)

## Từ *học* sang *giao việc*

Kho này phục vụ hai việc nối tiếp nhau:

1. **Học** — đọc phần kiến thức của node để hiểu vấn đề (vì sao telegraph phải dài hơn 300ms, vì sao sink phải tăng theo cấp).
2. **Giao việc** — dùng mục **🤖 Prompt cho AI** ở cuối node đó để viết đầu bài cho AI assistant, đủ cụ thể để nó làm đúng ý.

Mục 🤖 luôn gồm ba phần, và mỗi phần chống một kiểu hỏng khác nhau:

| Phần | Chống được gì |
|---|---|
| **Phải nêu rõ** | Bạn quên nói → AI tự bịa giá trị mặc định của ngành |
| **Mẫu prompt** | Bạn viết chung chung → AI hiểu sai ý định |
| **Bẫy thường gặp** | Kết quả trông đúng mà vẫn sai ở chỗ bạn chưa nghĩ tới |

### Bốn cách đưa kho này cho AI

**1. Chỉ agent đọc repo** *(tốt nhất — luôn cập nhật, không tốn context thừa)*

> "Đọc `AI_CONTEXT.md` trong `E:/XoiGame/GameDesign`, đó là kho kiến thức thiết kế. Sau đó đọc GDD ở `content/07-blueprints/` và bắt đầu dựng game."

**2. Copy khối 🤖 của một node** — nút **Copy mục này** trong khối tím. Dùng khi giao đúng một việc.

**3. Copy cả nhánh** — nút **Copy cả nhánh** trong panel. Kèm cả kiến thức lẫn prompt của mọi node con.

**4. Xuất file** — sidebar có hai nút:
- **🤖 Xuất playbook prompt** — chỉ 58 mục 🤖, nhỏ gọn, dán thẳng vào chat được.
- **⭳ Xuất toàn bộ kho** — mọi thứ. Dùng khi AI không đọc được ổ đĩa.

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | Watcher + dev server |
| `npm run graph` | Sinh lại `graph.json` + `KNOWLEDGE_INDEX.md` |
| `npm run check` | Validate: trùng id, link gãy, chu trình, parent sai |
| `npm run build` | Build production vào `dist/` |

## Cấu trúc thư mục

```
GameDesign/
├── AI_CONTEXT.md          ← điểm vào cho AI agent
├── CLAUDE.md              ← hướng dẫn cho Claude Code
├── KNOWLEDGE_INDEX.md     ← mục lục tự sinh (không sửa tay)
├── content/               ← NGUỒN CHÂN LÝ
│   ├── _SCHEMA.md
│   ├── index.md
│   └── 01-foundations/ … 08-presentation/
├── sources/               ← thả sách vào đây (không commit)
├── scripts/
│   ├── build-graph.mjs    ← parser + validator + generator
│   └── dev.mjs
├── src/                   ← web app
│   ├── components/        MindMap, MindNode, Sidebar, DetailPanel
│   └── lib/               layout.js (d3-hierarchy), aiContext.js
└── public/data/graph.json ← tự sinh (không sửa tay)
```

## Stack

React 18 · Vite 5 · [@xyflow/react](https://reactflow.dev) v12 · d3-hierarchy · react-markdown
