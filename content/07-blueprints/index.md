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
