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

**Dùng AI thế nào ở nhánh này**

Đây là nhánh agent **thực thi**, nên quy trình khác các nhánh kiến thức: bắt nó **xác nhận ràng buộc trước khi viết dòng code nào**.

```
Bước 1: đọc AI_CONTEXT.md rồi GDD
Bước 2: nhắc lại cho tôi — 3 pillar (kèm những gì mỗi cái loại trừ),
        mọi bất biến INV-xx, mọi mục còn đánh ❓
Bước 3: với các mục ❓, HỎI tôi từng câu một. Đừng tự quyết.
Bước 4: đề xuất thứ tự triển khai theo 7 giai đoạn ở [[ai-workflow]]
Chưa viết code.
```

Bước 2 và 3 lộ ra những chỗ bạn tưởng đã rõ mà chưa — rẻ hơn nhiều so với phát hiện sau 500 dòng code.

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

## 🎤 Phỏng vấn

Nhánh này là phần **được thực thi** — tài liệu mà agent đọc rồi sinh code theo. Mục 🎤 ở đây
vì thế không hỏi về game design nói chung, mà hỏi về **cách viết một đặc tả người khác làm theo được**.

**Câu hay gặp**

- `Junior` **Ba mục quan trọng nhất trong một GDD cho AI đọc?**
  → **Design Pillars** kèm danh sách loại trừ, **Bất biến** kèm cột cách phát hiện vi phạm, và **Không thuộc phạm vi**. Cả ba đều là mục **loại trừ** — đó là điểm chung và cũng là lý do chúng đứng đầu: phần khẳng định thì AI đoán khá đúng, phần "đừng làm gì" thì nó không suy ra được.
- `Junior` **Viết đặc tả cụ thể tới mức nào là vừa?**
  → **Viết *cái gì* và *bao nhiêu*, để AI quyết định *bằng cách nào*.** Quy tắc kèm theo: con số nào ảnh hưởng cảm giác chơi thì phải viết ra — không viết thì nó dùng mặc định của engine và mình mất một buổi chiều chỉnh lại. Quá chi tiết tới mức mô tả tên hàm thì vừa đóng băng thiết kế vừa lỗi thời ngay khi code đổi.
- `Mid` **Bảy thứ AI luôn bịa nếu không được nói là gì?**
  → **Số frame và thời lượng · đường cong tiến trình · xử lý biên · thứ tự thực thi · trạng thái lưu · hành vi khi thất bại · ngân sách hiệu năng.** Dùng nó như một checklist trước khi giao việc: mục nào chưa có thì hoặc viết vào, hoặc ghi rõ "chưa quyết, hỏi tôi" — ô trắng luôn bị hiểu là tự quyết.
- `Mid` **Bất biến viết thế nào để nó không thành trang trí?**
  → Ở dạng **có thể vi phạm được**, mỗi dòng kèm một cột **cách phát hiện**. Số lượng ít và đắt — khoảng năm tới tám dòng, chỉ cho thứ sai thì đắt: kinh tế, tiến trình, save, ranh giới kiến trúc. Đặt bất biến cho mọi thứ thì không ai đọc, và lúc đó bảng bất biến cũng vô dụng như không có.
- `Senior` **Giữ tài liệu và code không lệch nhau bằng cách nào?**
  → Ba việc: tài liệu **nằm trong repo** và sửa trong **cùng PR** với code; bảng số **chỉ có một bản** ở file dữ liệu, còn tài liệu giữ ý định và khoảng chấp nhận được rồi trỏ tới; và một việc định kỳ cho agent **soát mâu thuẫn giữa tài liệu và code thật**. Hai bản số ở hai nơi thì bản trong tài liệu luôn là bản cũ.
- `Senior` **Đặc tả tốt cho AI và đặc tả tốt cho người mới — có khác nhau không?**
  → Gần như không, và đó là lý lẽ thuyết phục nhất khi đội ngại đầu tư. Người mới vào dự án được lợi từ đúng những thứ làm agent làm việc tốt hơn: **số cụ thể, bất biến rõ, danh sách không thuộc phạm vi, và lý do đằng sau mỗi quyết định**. Nó không phải tài liệu cho máy — nó là tài liệu tốt, tình cờ máy đọc được.

**Khung trả lời 60 giây** — "Anh viết một đặc tả mà người khác làm theo được thế nào?"

> Nguyên tắc bao trùm: **viết *cái gì* và *bao nhiêu*, để người làm quyết định *bằng cách nào*.** Mọi con số ảnh hưởng tới cảm giác chơi đều phải nằm trong tài liệu ở dạng giá trị, không phải tính từ — "chiến đấu phải đã tay" không thực thi được, còn `startup 8 frame, hitstop 90 ms` thì được.
>
> Ba mục tôi luôn có và luôn viết trước: **pillar kèm danh sách loại trừ**, **bất biến kèm cách phát hiện vi phạm**, và **không thuộc phạm vi**. Điểm chung của cả ba là chúng **loại trừ** — và đó là phần mà người đọc, dù là người hay máy, không tự suy ra được.
>
> Cuối cùng là chuyện giữ nó sống: tài liệu **nằm trong repo** và sửa cùng PR với code; bảng số chỉ tồn tại **một bản** ở file dữ liệu còn tài liệu trỏ tới đó; và chỗ nào chưa quyết thì ghi rõ **"chưa quyết — hỏi trước khi làm"**, vì một ô trắng luôn bị hiểu là được tự quyết.

**Cờ đỏ**

- Đặc tả toàn tính từ, không có con số nào.
- Không có mục bất biến và mục không thuộc phạm vi.
- Bất biến viết ở dạng nguyện vọng, không có cách phát hiện vi phạm.
- Bảng số chép hai bản, một trong tài liệu một trong dữ liệu.
- Ô chưa quyết để trắng thay vì ghi rõ là chưa quyết.

**Số / ví dụ nên thuộc**

- Ba mục ưu tiên: **pillar (có loại trừ) · bất biến (có cách phát hiện) · không thuộc phạm vi**.
- Bất biến: **5–8 dòng**, đánh mã **INV-01…**, chỉ cho thứ sai thì đắt.
- Bảy thứ AI luôn bịa: **frame · đường cong tiến trình · xử lý biên · thứ tự thực thi · trạng thái lưu · hành vi khi thất bại · ngân sách hiệu năng**.
- Quy tắc độ cụ thể: **cái gì / bao nhiêu** là của mình, **bằng cách nào** là của người làm.
- Tài liệu **trong repo**, sửa **cùng PR** với code; bảng số chỉ có **một bản**.
