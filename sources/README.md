# sources/ — nạp sách và tài liệu vào kho

Thư mục này là **cửa vào**. Bạn thả sách/tài liệu ở đây, rồi bảo AI đọc và cập nhật `content/`.

## Cách làm

**1. Thả file vào đây**

```
sources/
├── README.md
├── _catalog.md                     ← sổ theo dõi, cập nhật tay hoặc nhờ AI
├── schell-art-of-game-design.pdf
├── game-programming-patterns.epub
└── ai-for-games-millington.pdf
```

Định dạng dùng được: `.pdf`, `.epub`, `.txt`, `.md`, `.docx`.
File sách **không được commit** (xem `.gitignore`) — chúng nặng và thường có bản quyền. Chỉ `README.md` và `_catalog.md` được theo dõi trong git.

**2. Bảo AI đọc**

```
Đọc sources/<tên-file>, chương <X-Y>.

Đối chiếu với kho hiện có (KNOWLEDGE_INDEX.md):
1. Nội dung nào BỔ SUNG cho node đã có? → liệt kê node nào, bổ sung gì.
2. Nội dung nào MÂU THUẪN với những gì đã viết? → nêu rõ cả hai phía.
3. Nội dung nào cần node MỚI? → đề xuất id, nhánh, level, vị trí trong lộ trình đọc.

Chưa sửa file nào. Đưa tôi bảng đề xuất trước.
```

**3. Duyệt rồi mới cho sửa**

```
Đồng ý mục 1, 3, 5. Bỏ mục 2 và 4.
Tiến hành cập nhật, và với mỗi node bị sửa:
- thêm dòng vào `refs:` trong frontmatter, dạng "Tác giả — Tên sách, ch.X"
- giữ nguyên `id`, `read`, `level` trừ khi tôi nói khác
- nếu thêm node mới: gán `read` vào khe trống (bội số 10 giữa hai node liền kề)
Chạy `npm run check` sau khi xong.
```

## Vì sao phải duyệt trước khi sửa

Sách hay thường **mâu thuẫn nhau** — đó là chuyện bình thường trong game design, không phải lỗi. Nếu để AI tự merge, nó sẽ trung bình hoá hai quan điểm thành một câu vô nghĩa.

Khi gặp mâu thuẫn, cách xử lý đúng là **giữ cả hai và nêu điều kiện áp dụng**:

> Schell khuyên bắt đầu từ trải nghiệm mong muốn. Sylvester khuyên bắt đầu từ cơ chế
> rồi quan sát cảm xúc nảy sinh. Chọn hướng nào tuỳ bạn đã có sẵn cái gì —
> có ý tưởng cảm xúc rõ thì đi lối Schell, có cơ chế thú vị sẵn thì đi lối Sylvester.

## Trường `refs:` trong frontmatter

Node nào có nội dung rút từ sách thì ghi nguồn — panel sẽ hiện mục **Nguồn tham khảo**:

```yaml
---
title: Core Loop
read: 40
level: basic
refs:
  - "Schell — The Art of Game Design, ch.14 (Lens of the Loop)"
  - "Sylvester — Designing Games, ch.3"
---
```

Ghi nguồn không chỉ để trích dẫn cho đúng. Nó còn cho bạn biết **node nào đã có nền tài liệu vững, node nào mới chỉ là ghi chép của bạn** — thông tin đó quyết định bạn tin node đó tới mức nào khi giao việc cho AI.

## Giới hạn cần biết

- **Đừng nạp cả quyển một lần.** Ngữ cảnh có hạn; đọc theo chương cho kết quả tốt hơn nhiều.
- **AI tóm tắt sách thì ổn, diễn giải sâu thì kém.** Phần "vì sao điều này quan trọng với dự án của tôi" vẫn phải do bạn viết.
- **Bản quyền.** Kho này là ghi chép và diễn giải của bạn, không phải bản sao của sách. Đừng chép nguyên đoạn dài vào `content/` — tóm tắt bằng lời của mình và ghi nguồn.
