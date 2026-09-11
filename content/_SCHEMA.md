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

Cấu trúc chuẩn — mục đích là **chống viết chung chung**:

```markdown
## 🤖 Prompt cho AI

**Phải nêu rõ** (thiếu là AI tự bịa):
- <tham số / quyết định cụ thể AI sẽ điền đại nếu bạn không nói>

**Mẫu prompt**

​```
<prompt copy-paste được, có SỐ, có ràng buộc PHỦ ĐỊNH (KHÔNG / CẤM)>
​```

**Bẫy thường gặp:** <AI hay làm sai gì ở đúng chủ đề này>
```

Ba phần này trả lời ba câu khác nhau, đừng gộp:
- *Phải nêu rõ* — bạn thiếu thông tin gì trong đầu bài
- *Mẫu prompt* — diễn đạt ra sao cho máy hiểu
- *Bẫy* — vì sao kết quả trông đúng mà vẫn sai

Tiêu đề chấp nhận cả `## Prompt cho AI` (không emoji), nhưng nên giữ emoji cho đồng bộ.

## Liên kết trong nội dung

Viết `[[id-cua-node]]` ở bất kỳ đâu trong thân bài. Build sẽ:
- biến nó thành link bấm được trong panel,
- tự tạo một cạnh nét đứt trên mindmap.

Ví dụ: `Xem thêm [[goap]] nếu cần lập kế hoạch động.`

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
