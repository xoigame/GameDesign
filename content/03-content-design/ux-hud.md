---
title: UX & HUD
icon: 🖥️
summary: Trình bày thông tin để người chơi ra quyết định đúng trong thời gian thực.
status: stub
read: 290
level: intermediate
order: 50
tags: [content, ux, ui]
related: [game-feel, combat-systems, genre-conventions]
---

HUD không phải chỗ để khoe số liệu. Nó tồn tại để trả lời **những câu hỏi người chơi đang có ngay lúc này**.

## Cần bồi đắp

- [ ] Phân cấp thông tin: cái gì luôn hiện, cái gì hiện theo ngữ cảnh, cái gì cất trong menu
- [ ] Diegetic vs non-diegetic UI
- [ ] Phản hồi trạng thái: máu, tài nguyên, cooldown, buff/debuff
- [ ] Trợ năng: mù màu, cỡ chữ, rung màn hình, phụ đề
- [ ] Onboarding: dạy UI mà không cần tour hướng dẫn
- [ ] HUD cho mobile: vùng ngón tay che, kích thước chạm tối thiểu

## Ghi chú tạm

**Bài test câu hỏi.** Với mỗi phần tử trên HUD, viết ra câu hỏi mà nó trả lời và *tần suất* người chơi hỏi câu đó. "Tôi còn bao nhiêu máu?" — hỏi liên tục, luôn hiện. "Tôi có bao nhiêu vàng?" — hỏi khi ở cửa hàng, không cần hiện trong chiến đấu. Phần tử không trả lời câu hỏi nào → bỏ.

**Quy tắc ba giây.** Người chơi phải đọc được trạng thái sống còn (máu, nguy hiểm sắp tới) bằng **thị giác ngoại vi**, không cần rời mắt khỏi nhân vật. Vì vậy máu thấp nên báo bằng hiệu ứng toàn màn hình, không chỉ bằng thanh ở góc.

**Trợ năng không phải tính năng phụ.** Khoảng 8% nam giới bị mù màu đỏ-lục — nếu bạn phân biệt bạn/thù bằng đỏ và xanh lá, một phần đáng kể người chơi không chơi được. Luôn mã hoá kép: màu + hình dạng.

## 🤖 Prompt cho AI

AI mặc định nhồi mọi chỉ số lên màn hình vì "đầy đủ thông tin". HUD tốt thì ngược lại.

**Phải nêu rõ:**
- Với mỗi phần tử: câu hỏi nó trả lời + tần suất người chơi hỏi câu đó
- Độ phân giải và nền tảng (vùng ngón tay che trên mobile)
- Yêu cầu trợ năng: mã hoá kép màu+hình, cỡ chữ tối thiểu
- Cái gì phải đọc được bằng **thị giác ngoại vi**

**Mẫu prompt**

```
Thiết kế HUD. Với MỖI phần tử bạn đề xuất, bắt buộc ghi 3 cột:
  | phần tử | câu hỏi nó trả lời | tần suất người chơi hỏi |
Phần tử nào không trả lời câu hỏi nào -> loại bỏ, đừng đưa vào bảng.

Ràng buộc:
- Máu và nguy hiểm sắp tới phải đọc được bằng THỊ GIÁC NGOẠI VI
  (hiệu ứng toàn màn hình), không chỉ bằng thanh ở góc.
- Mã hoá KÉP: mọi phân biệt bạn/thù, an toàn/nguy hiểm phải dùng
  màu + hình dạng. Không được chỉ dùng đỏ/xanh lá.
- Mobile: không đặt gì trong 80px dưới cùng (ngón cái che).
- Cỡ chữ nhỏ nhất 14px @1080p.

Tối đa 5 phần tử thường trực. Phần còn lại phải theo ngữ cảnh hoặc trong menu.
```

**Bẫy thường gặp:** phân biệt trạng thái chỉ bằng màu. Khoảng 8% nam giới mù màu đỏ-lục sẽ không chơi được. Ràng buộc "mã hoá kép" nên có trong mọi prompt về UI.
