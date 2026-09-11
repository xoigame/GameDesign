---
title: Procedural Generation
icon: 🌀
summary: Sinh nội dung bằng thuật toán — các kỹ thuật chính, và vì sao "vô hạn" thường đồng nghĩa với "nhạt".
status: deep
read: 300
level: advanced
order: 20
tags: [content, procgen, algorithm]
related: [level-design, randomness, ai-director]
---

Procedural generation (procgen) là dùng thuật toán để sinh nội dung thay vì làm tay. Nó giải quyết vấn đề *quy mô*, nhưng thường tạo ra vấn đề *ý nghĩa*.

## Bài học từ No Man's Sky

18 triệu tỉ hành tinh. Người chơi vẫn thấy chán sau vài giờ. Lý do: **đa dạng về mặt thống kê không phải đa dạng về mặt cảm nhận.** Khi mọi thứ đều ngẫu nhiên, không gì đặc biệt cả.

Ngược lại: Spelunky sinh màn từ một tập nhỏ các mẫu thủ công, và mỗi màn đều cảm thấy có chủ ý.

**Nguyên tắc rút ra:** procgen nên *sắp xếp lại nội dung thủ công*, không nên *sinh nội dung từ số không*.

## Bốn kỹ thuật nền

**Ghép phòng (room stitching)** — làm sẵn N phòng bằng tay, nối theo luật.
Dễ kiểm soát nhất, chất lượng cao nhất. Dùng bởi Spelunky, Binding of Isaac, Enter the Gungeon. **Nên bắt đầu từ đây.**

**Nhiễu (noise)** — Perlin/Simplex cho địa hình, độ cao, sinh quần xã.
Tốt cho thế giới tự nhiên liên tục. Kém cho không gian có cấu trúc — hang động sinh bằng noise trông đẹp nhưng thường không có ý nghĩa gameplay.

**Ngữ pháp / L-system** — luật viết lại sinh ra cấu trúc.
`Dungeon → Vào + Nhánh(2..4) + Boss`. Tốt để đảm bảo tính chất cấu trúc ở mức cao.

**Wave Function Collapse** — lan truyền ràng buộc từ một mẫu ví dụ.
Kết quả cục bộ nhất quán rất ấn tượng, nhưng khó điều khiển mục tiêu tổng thể và có thể thất bại (mâu thuẫn), cần cơ chế quay lui.

## Ràng buộc quan trọng hơn thuật toán

Phần khó của procgen không phải sinh ra thứ gì đó — mà là **đảm bảo thứ sinh ra chơi được**. Luôn kiểm tra sau khi sinh:

- [ ] Đích đến có tới được từ điểm xuất phát không? (flood fill)
- [ ] Có bao nhiêu ngõ cụt? Dài bao nhiêu?
- [ ] Tổng ngân sách kẻ địch có nằm trong khoảng cho phép không?
- [ ] Có ít nhất một vòng lặp không? (xem [[level-design]])
- [ ] Có phòng mồ côi không?
- [ ] Tài nguyên tối thiểu (máu, đạn) có đủ để hoàn thành không?

Kiến trúc thực dụng: **sinh → kiểm tra → nếu hỏng thì sinh lại (hoặc sửa)**. Sinh lại rẻ hơn nhiều so với viết thuật toán luôn đúng. Ba, bốn lần thử vẫn là micro giây.

## Giữ độ đặc biệt

Kỹ thuật chống lại sự nhạt nhoà:

- **Nội dung đặt tay trong khung thủ tục** — luôn có một phòng kho báu độc bản, một mini-boss viết tay ở mỗi tầng.
- **Mẫu hiếm** — một số phòng chỉ xuất hiện 2% số lần. Người chơi sẽ kể cho nhau nghe về chúng.
- **Seed cố định cho thử thách hằng ngày** — mọi người cùng chơi một màn → tạo cộng đồng và so sánh được kỹ năng.
- **Sinh có định hướng** — sinh theo mục tiêu nhịp độ chứ không đơn thuần ngẫu nhiên (xem [[ai-director]]).

## Luôn dùng seed

Mọi bộ sinh phải nhận vào một seed và **tất định** với seed đó.

```
generate(seed: 8471023) → luôn cho ra cùng một màn
```

Không có điều này, bạn không tái hiện được bug, không làm được daily challenge, không so sánh được hai phiên bản thuật toán. Đây là quyết định kiến trúc cần chốt từ ngày đầu — thêm vào sau rất đắt.

Dùng một bộ sinh số ngẫu nhiên **riêng cho procgen**, tách khỏi RNG gameplay. Nếu chúng dùng chung, hành động của người chơi sẽ làm thay đổi màn được sinh ra.

## 🤖 Prompt cho AI

Đây là một trong những chỗ AI agent có ích rõ ràng:

- **Viết bộ sinh từ mô tả ràng buộc** — mô tả luật bằng tiếng Việt, nhận về code chạy được.
- **Viết bộ kiểm tra (validator)** — thường tốn công hơn bộ sinh, và AI viết rất nhanh.
- **Dò seed hỏng** — *"chạy 100.000 seed, tìm những seed vi phạm ràng buộc, in ra"*. Đây là loại việc lặp lại mà con người làm rất tệ.
- **Sinh dữ liệu mẫu** — 50 mẫu phòng dạng JSON theo schema bạn định nghĩa, rồi bạn sàng lọc.

Điều AI **không** làm được: quyết định thế nào là một màn chơi *hay*. Phần đó vẫn phải tự chơi và cảm nhận.
