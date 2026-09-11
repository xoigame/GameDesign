---
title: Playtesting & Metrics
icon: 📊
summary: Đo cái gì, hỏi thế nào, và vì sao người chơi nói sai về chính trải nghiệm của họ.
status: deep
read: 460
level: intermediate
order: 30
tags: [production, testing, data]
related: [difficulty-curve, balancing-math, prototyping]
---

## Luật nền

> **Người chơi rất giỏi phát hiện vấn đề, và rất dở đề xuất giải pháp.**

Khi ai đó nói *"nên cho nhân vật thêm cú nhảy đúp"*, thứ họ thực sự đang nói là *"tôi thấy bực khi di chuyển"*. Hãy nghe phần vấn đề, tự tìm giải pháp.

Hệ quả thứ hai, quan trọng hơn: **hãy quan sát, đừng chỉ hỏi.** Người chơi nói "vui lắm" trong khi số liệu cho thấy họ bỏ giữa chừng ở màn 3. Lời nói bị chi phối bởi phép lịch sự; hành vi thì không.

## Cách chạy một buổi playtest

**Trước:** viết ra câu hỏi cần trả lời. *"Người chơi có hiểu cơ chế đẩy lùi không?"* chứ không phải "game có hay không".

**Trong:**
- Đừng giải thích gì cả. Ngay khi bạn phải giải thích, bạn đã tìm ra một lỗi thiết kế.
- Ghi lại **khoảnh khắc họ do dự** — đó là chỗ giao diện hoặc tín hiệu chưa rõ.
- Ghi lại **chỗ họ chết** và phản ứng ngay sau đó.
- Yêu cầu nói thành tiếng suy nghĩ ("think aloud").
- Ngồi im. Chống lại mọi thôi thúc muốn hướng dẫn.

**Sau:** hỏi mở, tránh câu hỏi dẫn dắt.
- ✅ "Kể lại cho tôi chuyện gì vừa xảy ra."
- ✅ "Lúc nào bạn thấy khó chịu nhất?"
- ✅ "Bạn nghĩ mình nên làm gì tiếp theo?"
- ❌ "Bạn có thấy phần chiến đấu vui không?"

## Cỡ mẫu

- **1 người** đã phát hiện được lỗi khả dụng nghiêm trọng nhất.
- **5 người** phát hiện khoảng 80% vấn đề khả dụng.
- **20+ người** mới đủ để nói chuyện cân bằng.
- **Hàng trăm** mới đủ để phân tích số liệu định lượng đáng tin.

Đừng chờ có nhiều người mới test. Năm người bạn ngồi xem trực tiếp có giá trị hơn nhiều so với một khảo sát 200 người.

## Đo gì

**Chỉ số cốt lõi — luôn log:**

| Chỉ số | Cho biết |
|---|---|
| Tỉ lệ bỏ cuộc theo màn/phút | Chính xác nơi bạn mất người chơi |
| Số lần chết mỗi màn | Đỉnh đột biến = tường khó |
| Thời gian hoàn thành (trung vị + p90) | Đuôi dài = một nhóm đang vật lộn |
| Tỉ lệ thử lại sau khi chết | Giảm mạnh = vượt ngưỡng chịu đựng |
| Tỉ lệ sử dụng từng cơ chế/vũ khí | Gần 0 = người chơi không hiểu hoặc nó vô dụng |
| Độ dài phiên chơi | So với thiết kế của bạn |

**Chỉ số theo hệ thống:**
- Tồn kho tài nguyên theo thời gian → lạm phát ([[economy-design]])
- Winrate và pick rate mỗi build → cân bằng ([[balancing-math]])
- Thời gian tới mốc tiến trình kế tiếp → tường cày cuốc ([[progression]])

## Đọc số liệu cho đúng

**Dùng trung vị, không dùng trung bình.** Một người chơi để game chạy 8 tiếng sẽ kéo lệch mọi giá trị trung bình.

**Luôn xem phân bố, không chỉ xem một con số.** Thời gian hoàn thành trung vị 4 phút nghe ổn — nhưng nếu p90 là 22 phút thì 10% người chơi đang có trải nghiệm hoàn toàn khác.

**Tương quan không phải nhân quả.** "Người chơi dùng vũ khí A có tỉ lệ thắng cao hơn" có thể chỉ có nghĩa là người chơi giỏi thích vũ khí A.

**Phễu quan trọng hơn tổng số.** Không phải "1000 người chơi màn 1" mà là "1000 → 780 → 310 → 295". Cú rơi từ 780 xuống 310 là chỗ cần sửa, và nó rất cụ thể.

## Log thế nào

Ghi **sự kiện**, đừng ghi trạng thái tổng hợp. Sự kiện thô cho phép bạn đặt câu hỏi mới sau này mà không cần thu thập lại.

```json
{"t": 142.3, "event": "player_death", "level": 3, "cause": "brute_slam", "hp_before": 12, "attempt": 4}
{"t": 145.1, "event": "retry",        "level": 3, "attempt": 5}
{"t": 203.8, "event": "level_complete","level": 3, "time": 58.7, "deaths": 4}
```

Nguyên tắc riêng tư: chỉ log dữ liệu gameplay, không log thông tin định danh cá nhân. Nếu phát hành thương mại, cần thông báo rõ và cho phép từ chối.

## 🤖 Prompt cho AI

**Phân tích log** — dán file log vào, yêu cầu tìm điểm bất thường. Việc này AI làm nhanh và tốt:

> *"Đây là log của 50 phiên chơi. Tìm các màn có tỉ lệ bỏ cuộc bất thường, các nguyên nhân chết chiếm ưu thế, và các cơ chế gần như không được dùng. Đưa ra 3 giả thuyết cho mỗi bất thường."*

**Viết công cụ phân tích** — dashboard, biểu đồ, phễu. Công việc lặp lại mà AI dựng trong vài phút.

**Mô phỏng bổ sung cho playtest** — mô phỏng cho biết *có cân bằng không*, playtest cho biết *có vui không*. Cần cả hai; không cái nào thay được cái nào.

Điều AI **không** làm được: quan sát nét mặt người chơi lúc họ bực. Phần đó vẫn phải ngồi xem.
