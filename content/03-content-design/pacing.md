---
title: Pacing & Flow
icon: 🌊
summary: Nhịp căng–chùng qua toàn bộ hành trình chơi, ở cả ba thang thời gian.
status: stub
read: 280
level: intermediate
order: 30
tags: [content, pacing]
related: [difficulty-curve, level-design, narrative]
---

Pacing là **đường cong cường độ theo thời gian**. Nó khác [[difficulty-curve]]: độ khó nói về *thử thách*, pacing nói về *cường độ cảm xúc* — bao gồm cả căng thẳng, yên tĩnh, bất ngờ, và thư giãn.

## Cần bồi đắp

- [ ] Biểu đồ cường độ ở ba thang: phòng / màn / toàn game
- [ ] Vai trò của khoảng lặng — vì sao phần yên tĩnh làm phần căng hay hơn
- [ ] Nhịp mở đầu: 30 giây, 5 phút, 30 phút đầu tiên
- [ ] Khoảng nghỉ giữa các cao trào: bao lâu là đủ
- [ ] Pacing trong game vòng lặp không có kết thúc (roguelike, idle)

## Ghi chú tạm

Sai lầm phổ biến: **cường độ đơn điệu**. Game toàn cao trào làm người chơi mệt và mất nhạy cảm — cao trào thứ mười không còn là cao trào nữa. Tương phản là thứ tạo ra đỉnh, không phải độ cao tuyệt đối.

Quy tắc thô: sau mỗi cao trào, dành **20–30% thời lượng** cho đoạn cường độ thấp trước cao trào tiếp theo.

Hai thời điểm đáng đầu tư nhất:
- **30 giây đầu** — quyết định người chơi có ở lại hay không.
- **Ngay sau một thất bại** — quyết định họ có thử lại hay không.

## 🤖 Prompt cho AI

Nhịp độ là thứ trừu tượng nhất trong kho này, nên cũng là thứ AI dễ trả lời chung chung nhất. Cách chữa: bắt nó xuất ra **đường cong dạng số**.

**Phải nêu rõ:**
- Thang thời gian đang nói tới (phòng / màn / cả game)
- Cường độ đo bằng gì — phải là đại lượng đếm được
- Tỉ lệ thời gian dành cho đoạn cường độ thấp
- Khoảng nghỉ tối thiểu sau cao trào

**Mẫu prompt**

```
Lập bản đồ nhịp độ cho một màn 12 phút.

Cường độ đo bằng: (số kẻ địch đồng thời × 2) + (sát thương nhận/10s)
Xuất ra BẢNG SỐ theo từng 30 giây: cường độ mục tiêu 0-10.

Ràng buộc:
- Đúng 3 cao trào, cao trào cuối mạnh nhất
- Sau mỗi cao trào: >= 60s cường độ <= 2
- Tổng thời gian cường độ <= 2 phải chiếm 25-30% màn
- Không có đoạn nào cường độ >= 7 kéo dài quá 45s

Sau bảng, vẽ đồ thị ASCII để tôi nhìn được hình dạng.
```

**Bẫy thường gặp:** hỏi "làm sao cho nhịp độ hay hơn" sẽ nhận về lời khuyên sách giáo khoa. Định nghĩa công thức cường độ biến câu hỏi thẩm mỹ thành bài toán kiểm tra được.
