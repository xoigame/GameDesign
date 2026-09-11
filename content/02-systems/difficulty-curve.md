---
title: Difficulty Curve
icon: 📉
summary: Điều tiết thử thách quanh vùng dòng chảy — răng cưa, trợ năng, và dynamic difficulty làm đúng cách.
status: deep
read: 200
level: intermediate
order: 50
tags: [systems, difficulty, pacing]
related: [ai-director, progression, player-motivation, pacing]
---

Lý thuyết Flow (Csíkszentmihályi): người ta chìm đắm khi **thử thách xấp xỉ kỹ năng**. Quá khó → lo âu, bỏ cuộc. Quá dễ → chán, bỏ cuộc.

Vấn đề với đường cong khó: kỹ năng người chơi tăng theo đường cong *riêng của từng người*, và bạn không biết trước.

## Hình dạng: răng cưa, không phải đường thẳng

Độ khó tăng đều tuyến tính gây mệt mỏi. Hình dạng hiệu quả là **răng cưa đi lên**:

```
khó
 │      ╱│    ╱│      ╱│
 │    ╱  │  ╱  │    ╱  │
 │  ╱    │╱    │  ╱    │
 │╱      ╵     ╵╱      ╵
 └──────────────────────── thời gian
   học   thử   nghỉ   đỉnh
```

Mỗi răng cưa là một chu kỳ: **giới thiệu cơ chế (dễ) → luyện tập → thử thách đỉnh → hạ xuống**. Đoạn hạ xuống không phải thời gian lãng phí — nó là lúc người chơi *cảm nhận được mình đã mạnh lên*, vì nội dung từng khó nay đã dễ.

Đây cũng là cách dạy cơ chế mà không cần tutorial: giới thiệu riêng lẻ trong bối cảnh an toàn → kết hợp với cơ chế cũ → đưa vào thử thách đỉnh.

## Các trục điều chỉnh độ khó

Khi tăng độ khó, đừng chỉ nhân chỉ số. Thứ tự ưu tiên từ tốt đến tệ:

1. **Thêm cơ chế mới** — kẻ địch có hành vi mới đòi hỏi câu trả lời mới. Tốt nhất, vì thưởng cho việc học.
2. **Kết hợp cơ chế cũ** — cung thủ + khiên thủ cùng lúc tạo bài toán mới từ thành phần cũ. Hiệu quả, rẻ.
3. **Thu hẹp cửa sổ phản ứng** — telegraph 900ms → 650ms. Thưởng cho kỹ năng thật.
4. **Tăng mật độ** — nhiều kẻ địch hơn. Dùng được nhưng nhanh chán.
5. **Nhân chỉ số** — HP ×3, sát thương ×2. Tệ nhất: biến trận đấu thành dài hơn chứ không khó hơn, và làm mất giá kỹ năng.

Phần lớn game dở chỉ dùng cách 5.

## Dynamic Difficulty Adjustment

Điều chỉnh độ khó theo thời gian thực dựa trên hiệu suất người chơi. Mạnh nhưng dễ phản tác dụng.

**Nguyên tắc sống còn: người chơi không được phép nhận ra.** Nếu họ phát hiện game đang nương tay, mọi chiến thắng mất ý nghĩa — bạn vừa phá huỷ nhu cầu *competence* ở [[player-motivation]].

An toàn để điều chỉnh ngầm:
- Tần suất rơi máu / đạn dược
- Nhịp spawn và khoảng nghỉ giữa các đợt
- Tính hung hăng của AI (xem [[ai-director]])
- Độ chính xác của kẻ địch ở mức thấp hơn ngưỡng nhận biết

Nguy hiểm nếu điều chỉnh:
- HP / sát thương kẻ địch — người chơi **đếm được số đòn** và sẽ nhận ra ngay
- Bất cứ thứ gì làm kết quả một hành động cụ thể thay đổi giữa chừng

**Rubber-banding trong game đua** là ví dụ kinh điển về cách làm sai: ai cũng nhận ra, và nó khiến việc chơi giỏi trở nên vô nghĩa ở giai đoạn giữa.

## Trợ năng thay vì chọn độ khó

Xu hướng hiện đại (Celeste, Hades, The Last of Us Part II): thay vì Dễ/Thường/Khó, cung cấp **các công tắc riêng lẻ** — tốc độ game, bất tử, bỏ qua phòng, hỗ trợ ngắm.

Ưu điểm:
- Người chơi tự điều chỉnh đúng rào cản của mình thay vì chấp nhận một gói cố định.
- Không gắn nhãn giá trị ("dễ" nghe như thất bại).
- Đơn giản hoá cân bằng — bạn chỉ cân bằng một đường cong duy nhất.

Celeste đóng khung phần này là "Assist Mode" với lời nhắn rõ ràng rằng đây không phải gian lận. Cách trình bày quan trọng ngang bản thân tính năng.

## Đo bằng số liệu

Đừng đoán đường cong khó. Hãy log và đọc (xem [[playtesting-metrics]]):

| Chỉ số | Ý nghĩa |
|---|---|
| Số lần chết mỗi màn | Đỉnh đột biến = tường khó |
| Thời gian hoàn thành (trung vị + phân vị 90) | Đuôi dài = một nhóm đang vật lộn |
| Tỉ lệ bỏ cuộc theo màn | Chỉ báo trực tiếp nhất |
| Tỉ lệ thử lại sau khi chết | Giảm mạnh = đã vượt ngưỡng chịu đựng |

Mốc thực dụng: **trung vị 2–5 lần chết ở một trận boss là lành mạnh**. Trên 10 là tường. Dưới 1 nghĩa là boss không phải thử thách.

## 🤖 Prompt cho AI

Độ khó là chỗ AI mặc định nhân chỉ số — cách tệ nhất trong năm cách tăng độ khó.

**Phải nêu rõ:**
- Trục tăng độ khó nào được dùng, và **cấm** trục nào
- Hình dạng răng cưa: chu kỳ bao lâu, biên độ bao nhiêu
- Nếu dùng DDA: điều chỉnh được phép chạm vào gì, cấm chạm vào gì
- Số liệu mục tiêu: bao nhiêu lần chết ở boss là "đúng"

**Mẫu prompt**

```
Thiết kế đường cong khó cho 12 màn.

ĐƯỢC tăng khó bằng: cơ chế mới, kết hợp cơ chế cũ, thu hẹp cửa sổ phản ứng.
CẤM tăng khó bằng: nhân HP, nhân sát thương, tăng số lượng quái đơn thuần.
  → nếu đề xuất nào cần các cách bị cấm, hãy nói rõ và đề nghị phương án khác.

Cấu trúc răng cưa: mỗi 3 màn là 1 chu kỳ
  màn 1 = giới thiệu cơ chế mới trong bối cảnh an toàn
  màn 2 = áp dụng có phạt
  màn 3 = kết hợp với cơ chế đã học trước đó, rồi hạ xuống

Mục tiêu số liệu: trung vị 2-5 lần chết ở boss mỗi chu kỳ.
Viết bảng 12 màn: cơ chế mới, cơ chế kết hợp, ngân sách quái, TTK dự kiến.
```

**Bẫy thường gặp:** AI thêm DDA chạm vào HP/sát thương kẻ địch. Người chơi **đếm được số đòn** nên sẽ phát hiện ngay và mất hết cảm giác thành tựu. Cấm rõ hai trường đó.
