---
title: Prototyping
icon: 🧪
summary: Kiểm chứng câu hỏi rủi ro nhất bằng công sức nhỏ nhất — và vì sao AI làm khâu này rẻ đi mười lần.
status: stub
read: 80
level: basic
order: 70
tags: [foundations, process]
related: [core-loop, ai-workflow, playtesting-metrics]
---

Prototype không phải là "phiên bản nhỏ của game". Nó là **một thí nghiệm trả lời một câu hỏi cụ thể**.

## Cần bồi đắp

- [ ] Cách xác định giả định rủi ro nhất trong dự án
- [ ] Paper prototype cho game hệ thống
- [ ] Vertical slice vs horizontal prototype — khi nào dùng cái nào
- [ ] Tiêu chí quyết định: giữ / xoay hướng / bỏ
- [ ] Prototype AI-first: nhờ agent dựng 3 biến thể cơ chế rồi so sánh

## Ghi chú tạm

Mỗi prototype cần viết ra trước khi làm:

```
Câu hỏi:    Cơ chế đẩy-lùi có tạo ra quyết định thú vị không?
Giả định:   Người chơi sẽ đánh đổi giữa vị trí và sát thương.
Thành công: 3/5 tester tự nhận ra cách kết hợp mà tôi không dạy.
Thất bại:   Ai cũng spam một nút.
Ngân sách:  1 ngày.
```

Không có tiêu chí thất bại viết trước, mọi prototype đều "thành công" và bạn không học được gì.

**Điều AI thay đổi:** dựng 5 biến thể cơ chế trong một buổi chiều giờ là chuyện khả thi. Nút thắt chuyển từ *thời gian code* sang *thời gian playtest*. Vì vậy hãy đầu tư vào việc rút ngắn vòng lặp đánh giá — hotkey reset, chỉnh tham số trong lúc chạy, ghi log tự động. Xem [[data-driven-design]].

## 🤖 Prompt cho AI

Prototype là **thí nghiệm**, không phải bản thu nhỏ của game. Prompt phải nói rõ câu hỏi cần trả lời, nếu không AI sẽ dựng một game mini hoàn chỉnh mà chẳng kiểm chứng được gì.

**Phải nêu rõ:**
- Câu hỏi duy nhất prototype này trả lời
- Tiêu chí thành công **và tiêu chí thất bại** (viết trước, nếu không mọi prototype đều "thành công")
- Ngân sách: bao nhiêu file, bao nhiêu dòng, bao lâu
- Những gì **không cần** làm (art, âm thanh, menu, lưu game)

**Mẫu prompt**

```
Prototype kiểm chứng MỘT câu hỏi: "cơ chế đẩy-lùi có tạo quyết định thú vị không?"

Phạm vi tối thiểu:
- Hình khối màu, KHÔNG art, KHÔNG âm thanh, KHÔNG menu, KHÔNG lưu game
- 1 màn hình, 1 người chơi, 3 kẻ địch đứng yên
- Hotkey R để reset tức thì
- Mọi hằng số phơi ra một file config, sửa được trong lúc chạy

Dựng 3 BIẾN THỂ của cơ chế đẩy (đẩy theo hướng đánh / đẩy ra xa tâm /
đẩy đổi chỗ), chuyển đổi bằng phím 1-2-3 để tôi so sánh trực tiếp.
```

**Bẫy thường gặp:** AI "giúp" bằng cách thêm menu, hệ thống lưu, màn hình thua. Mỗi thứ đó là thời gian không dùng để trả lời câu hỏi. Câu `KHÔNG art, KHÔNG menu` phải viết ra.
