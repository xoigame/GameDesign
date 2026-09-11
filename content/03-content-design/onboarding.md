---
title: Onboarding & Tutorial
icon: 🚪
summary: Dạy người chơi mà không cần hộp thoại hướng dẫn — 5 phút đầu quyết định họ ở lại hay đi.
status: stub
read: 270
level: intermediate
order: 25
tags: [content, ux, onboarding]
related: [level-design, ux-hud, pacing, difficulty-curve]
---

Phần lớn người chơi rời đi trước phút thứ 5. Onboarding không phải màn hướng dẫn — nó là **cách bạn thiết kế 5 phút đầu tiên**.

## Cần bồi đắp

- [ ] Ba nhịp dạy học: bối cảnh an toàn → áp dụng có phạt → kết hợp
- [ ] Tutorial ẩn vs tutorial hiện: khi nào chấp nhận được hộp thoại
- [ ] Giới thiệu cơ chế theo thứ tự nào
- [ ] Phút đầu tiên: người chơi phải làm được gì trong 30 giây
- [ ] Đo đạc: tỉ lệ rơi rụng theo từng bước onboarding

## Ghi chú tạm

**Nguyên tắc: nếu phải giải thích, thiết kế đã thất bại.** Mỗi hộp thoại hướng dẫn là một chỗ mà bố cục, hình khối hoặc phản hồi chưa đủ rõ. Xem kỹ thuật dạy bằng không gian ở [[level-design]].

**Đừng khoá tay người chơi.** Tutorial ép làm đúng một thao tác duy nhất ("nhấn W để đi tới") biến người chơi thành khán giả. Hãy tạo tình huống mà hành động đúng là hành động tự nhiên nhất.

**Dạy một thứ mỗi lần.** Ba cơ chế mới trong một phòng nghĩa là không cơ chế nào được học. Chu trình răng cưa ở [[difficulty-curve]] áp dụng trực tiếp ở đây.

**Đo, đừng đoán.** Log từng bước onboarding và xem người chơi rơi ở đâu — đây là phễu có tỉ lệ cải thiện cao nhất trong toàn bộ game. Xem [[playtesting-metrics]].

## 🤖 Prompt cho AI

Onboarding là chỗ AI mặc định đẻ ra hộp thoại hướng dẫn. Phải cấm từ đầu.

**Phải nêu rõ:**
- Người chơi phải làm được gì trong 30 giây đầu
- Thứ tự giới thiệu cơ chế, **mỗi lần một cơ chế**
- Cấm hộp thoại / cấm khoá input
- Điểm đo: log sự kiện nào để biết người chơi rơi ở đâu

**Mẫu prompt**

```
Thiết kế 5 phút đầu, KHÔNG có hộp thoại hướng dẫn, KHÔNG khoá input.

Ràng buộc:
- 0-30s: người chơi phải thực hiện trọn vẹn core loop ít nhất 1 lần
- Mỗi phòng dạy ĐÚNG MỘT cơ chế, theo 3 nhịp:
    bối cảnh an toàn -> áp dụng có phạt -> kết hợp với cơ chế cũ
- Cơ chế mới được dạy bằng BỐ TRÍ KHÔNG GIAN (xem [[level-design]]),
  không bằng chữ. Nếu một cơ chế không dạy được bằng bố trí, hãy nói ra.

Thứ tự: di chuyển -> đánh -> né -> kết hợp né+đánh -> tài nguyên

Kèm: danh sách sự kiện cần log ở mỗi bước để dựng phễu rơi rụng.
```

**Bẫy thường gặp:** AI đề xuất "hiện tooltip: nhấn Space để nhảy". Câu `KHÔNG có hộp thoại` buộc nó phải nghĩ ra tình huống — ví dụ một hố nhỏ không thể không nhảy qua.
