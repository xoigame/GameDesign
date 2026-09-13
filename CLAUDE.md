# CLAUDE.md

Luật làm việc của kho này nằm ở **[`AGENTS.md`](AGENTS.md)** — một file chung cho mọi AI
agent: Codex đọc thẳng file đó, Claude Code đọc qua dòng import ngay bên dưới.

**Sửa luật thì sửa ở `AGENTS.md`, đừng chép sang đây** — hai bản luật lệch nhau là cách
chắc chắn nhất để hai agent làm hai kiểu.

@AGENTS.md

## Nhắc nhanh

Nếu vì lý do nào đó dòng import trên không nạp được, bảy điều dưới đây là tối thiểu:

1. `content/**/*.md` là **nguồn chân lý duy nhất**. Không sửa tay `public/data/graph.json`
   và `KNOWLEDGE_INDEX.md` — chúng bị ghi đè mỗi lần build.
2. Đọc [`AI_CONTEXT.md`](AI_CONTEXT.md) trước khi làm gì; dùng `KNOWLEDGE_INDEX.md` để
   biết kho có những node nào thay vì đọc hết `content/`.
3. Sau khi sửa content: `npm run check`, sửa hết cảnh báo rồi mới báo xong.
4. Không đổi `id` node đã có, không xoá node, không đổi cấu trúc 9 nhánh, không thêm
   dependency mà chưa hỏi.
5. Node mới bắt buộc có `read` (khe trống giữa hai node liền kề, đừng đánh số lại cả kho),
   `level`, và mục `## 🤖 Prompt cho AI` đủ bốn phần, cụ thể cho chủ đề.
6. Viết tiếng Việt, thuật ngữ chuyên ngành giữ tiếng Anh. Bản dịch nằm ở file song song
   `<tên>.en.md`, không dịch bằng cách sửa file gốc.
7. `git status` trước khi bắt đầu — có thể có agent khác đang làm dở trong cùng cây làm việc.

## Riêng cho Claude Code

- Xem web: dùng preview `gamedesign-brain` đã khai trong [`.claude/launch.json`](.claude/launch.json)
  (`npm run dev`, cổng 5180) thay vì tự chạy dev server bằng Bash.
