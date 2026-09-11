---
title: Blueprints
icon: 📐
summary: Nơi chứa GDD của game thật bạn đang làm — lớp mà AI agent trực tiếp thực thi.
status: deep
read: 140
level: basic
order: 70
tags: [blueprint, project]
related: [gdd-for-ai, design-pillars, ai-workflow]
---

Sáu nhánh trước là **kiến thức chung**. Nhánh này là **dự án cụ thể của bạn**.

Phân biệt quan trọng:

| | Nhánh 1–6 | Nhánh Blueprints |
|---|---|---|
| Nội dung | Nguyên lý, kỹ thuật | Quyết định cho game này |
| Thay đổi | Hiếm | Liên tục |
| AI dùng để | Hiểu bối cảnh, có chung chuẩn mực | **Thực thi trực tiếp** |
| Ví dụ | "Core loop nên có 3 tầng" | "Core loop game tôi: chém → nhặt → nâng cấp" |

## Cách dùng

1. Sao chép [[gdd-template]] thành `content/07-blueprints/<tên-game>.md`
2. Điền vào. Ưu tiên mục **Design Pillars** và **Bất biến** — đó là hai mục quyết định chất lượng đầu ra của AI.
3. Chỉ agent tới đó: *"đọc `content/07-blueprints/<tên-game>.md`, đó là GDD của dự án."*
4. Cập nhật mỗi khi thiết kế thay đổi — **trước khi** nhờ agent code.

## Game nhiều dự án

Mỗi game một file, hoặc một thư mục con nếu GDD dài:

```
content/07-blueprints/
├── index.md
├── _gdd-template.md
├── xoi-survivors.md
└── tower-siege/
    ├── index.md
    ├── combat.md
    └── economy.md
```

Dùng thư mục con thì mindmap sẽ tự tạo nhánh phụ — tiện khi GDD vượt quá một file.

## Lưu ý

**Đừng chép nguyên lý từ nhánh 1–6 vào đây.** Hãy tham chiếu bằng `[[core-loop]]`, `[[balancing-math]]`. Chép lại sẽ tạo ra hai bản sự thật, và chúng sẽ lệch nhau.

**Ghi lại quyết định *và lý do*.** Sáu tháng sau bạn sẽ không nhớ vì sao chọn 0.4s thay vì 0.3s — và agent thì chắc chắn không biết. Một dòng lý do tiết kiệm nhiều tranh cãi về sau.

**Đánh dấu phần chưa chốt.** Dùng `TODO:` hoặc `❓` cho những gì còn đang cân nhắc, để agent biết chỗ nào cần hỏi thay vì tự quyết.

## 🤖 Prompt cho AI

Nhánh này là thứ agent **thực thi trực tiếp**. Prompt ở đây là cách trỏ agent vào đúng tài liệu.

**Mẫu prompt bắt đầu một dự án**

```
Kho kiến thức: E:/XoiGame/GameDesign
GDD của dự án: content/07-blueprints/<ten-game>.md

Bước 1: đọc AI_CONTEXT.md, rồi đọc GDD.
Bước 2: liệt kê cho tôi:
   - 3 Design Pillars và những gì chúng loại trừ
   - Mọi bất biến INV-xx
   - Mọi mục còn đánh dấu ❓ (chưa chốt)
Bước 3: với các mục ❓, HỎI tôi từng câu một. Đừng tự quyết.
Bước 4: sau khi tôi trả lời hết, đề xuất thứ tự triển khai
   theo 7 giai đoạn ở content/05-ai-assisted-dev/ai-workflow.md.

Chưa viết code.
```

**Bẫy thường gặp:** để agent đọc GDD rồi lao vào code ngay. Bước 2 và 3 phát hiện những chỗ bạn tưởng đã rõ mà thực ra chưa — rẻ hơn nhiều so với phát hiện sau 500 dòng code.

## 🎮 Unity

Với Unity project, GDD cần thêm một mục mà GDD chung không có — xem mục 5b ở [[gdd-for-ai]].

**Đặt GDD ở đâu**

Kho kiến thức này (`E:/XoiGame/GameDesign`) và Unity project là **hai repo riêng**. GDD nên nằm ở đâu?

| Cách | Ưu | Nhược |
|---|---|---|
| GDD trong kho này (`content/07-blueprints/`) | Xem được trên mindmap, có tab 🤖 | Agent làm việc trong Unity project phải đọc repo khác |
| GDD trong Unity project (`design/GDD.md`) | Agent đọc cùng repo, luôn cập nhật | Không lên mindmap |
| **Cả hai, một là symlink** | Cả hai lợi ích | Phải nhớ không sửa hai bản |

Cách thực dụng nhất: **GDD sống trong Unity project** (`design/GDD.md`), và node trong `content/07-blueprints/` là bản **tóm tắt + trỏ đường**:

```markdown
---
title: Xoi Survivors
summary: Roguelike survivor-like, PC, phiên 25 phút.
---

GDD đầy đủ: `E:/XoiGame/XoiSurvivors/design/GDD.md`

Ba pillar (bản đầy đủ trong GDD):
1. Không RNG trong combat
2. Một run dưới 25 phút
3. Người chơi hiểu nguyên nhân chết trong 2 giây
```

Nhờ vậy agent làm việc trong Unity project có GDD ngay bên cạnh code, và bạn vẫn thấy dự án trên mindmap.

**`CLAUDE.md` trong Unity project**

```markdown
# Xoi Survivors

Kho kiến thức thiết kế: E:/XoiGame/GameDesign — đọc AI_CONTEXT.md khi cần
tra nguyên lý (core loop, behavior tree, audio bus...).

GDD: design/GDD.md — mục Pillars, Bất biến, Ngoài phạm vi là RÀNG BUỘC CỨNG.

## Trạng thái Unity project (bạn không thấy được)
[khối project settings — xem mục 5b ở gdd-for-ai]

## Không được tự ý
[khối guardrail Unity — xem agent-guardrails]
```

**Kiểm tra nhanh**
- Unity project có `CLAUDE.md` trỏ về kho kiến thức chưa?
- GDD có mục "trạng thái Unity project" chưa?
- Node blueprint trong kho này có trỏ đúng đường dẫn GDD thật chưa?
