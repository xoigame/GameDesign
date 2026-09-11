---
title: Động lực người chơi
icon: 🧭
summary: Vì sao người ta chơi tiếp — Self-Determination Theory, Bartle, Quantic Foundry và cách chuyển thành hệ thống cụ thể.
status: deep
read: 50
level: basic
order: 30
tags: [foundations, psychology]
related: [progression, core-loop, meta-systems]
---

Thiết kế mà không biết mình đang phục vụ động lực nào thì chỉ là bắt chước game khác.

## Self-Determination Theory — cái gốc

Ba nhu cầu tâm lý cơ bản. Game nào thoả cả ba đều gây nghiện, không ngoại lệ:

**Competence (cảm giác giỏi lên).** Người chơi cần thấy mình tiến bộ — không phải vì chỉ số tăng, mà vì *họ thật sự chơi giỏi hơn*. Dark Souls không cho bạn mạnh lên nhiều; nó làm bạn giỏi lên. Xem [[difficulty-curve]].

**Autonomy (cảm giác tự quyết).** Người chơi cần thấy lựa chọn của mình có ý nghĩa. Ba build đều khả thi thì có autonomy; ba build mà một cái trội hẳn thì chỉ là một lựa chọn giả. Đây là lý do [[balancing-math]] quan trọng về mặt *cảm xúc*, không chỉ về mặt toán.

**Relatedness (cảm giác kết nối).** Với người khác (co-op, guild, leaderboard) hoặc với thế giới trong game (NPC có ký ức, thú cưng, căn cứ của mình). Xem [[llm-npc]].

Kiểm tra nhanh: gỡ bỏ một hệ thống bất kỳ trong game bạn và hỏi *"cái này phục vụ nhu cầu nào trong ba nhu cầu trên?"*. Không trả lời được thì hệ thống đó là mỡ thừa.

## Bartle — bốn kiểu người chơi

Ra đời cho MUD, vẫn hữu dụng để kiểm tra độ phủ:

- **Achiever** — muốn hoàn thành, 100%, leaderboard, thành tựu.
- **Explorer** — muốn khám phá bản đồ, tìm bí mật, hiểu hệ thống ngầm.
- **Socialiser** — muốn chơi cùng và nói chuyện với người khác.
- **Killer** — muốn áp đảo người chơi khác.

Đừng cố phục vụ cả bốn như nhau — game nhỏ mà dàn trải sẽ nhạt ở mọi mặt. **Chọn một nhóm chính, một nhóm phụ**, ghi rõ vào [[design-pillars]].

## Quantic Foundry — chi tiết hơn, dùng được hơn

Nghiên cứu trên hàng trăm nghìn người chơi, rút ra 12 động lực gom thành 6 cặp: *Action, Social, Mastery, Achievement, Immersion, Creativity*. Điểm giá trị nhất của mô hình này là nó chỉ ra các động lực **xung khắc**:

- **Action/Excitement** kỵ **Immersion/Story** — người thích nổ tung màn hình thường bỏ qua cốt truyện.
- **Mastery/Challenge** kỵ **Achievement/Completion** — người thích thử thách khó chịu với checklist cày cuốc.

Nhồi cả hai vế của một cặp xung khắc vào cùng một game là cách nhanh nhất để không ai thấy vừa ý.

## Từ động lực → hệ thống

Bảng dịch trực tiếp, dùng khi thiết kế [[systems]]:

| Động lực | Hệ thống nên có | Đừng làm |
|---|---|---|
| Competence | Đường cong khó tăng dần, phản hồi tức thì, skill ceiling cao | Auto-play, thắng do chỉ số |
| Autonomy | Nhiều build khả thi, đường đi phân nhánh | Chỉ một meta tối ưu |
| Achievement | Thành tựu, bộ sưu tập, %hoàn thành | Checklist vô nghĩa để kéo dài giờ chơi |
| Exploration | Bí mật, lore rải rác, bản đồ mở dần | Đánh dấu sẵn mọi thứ trên minimap |
| Social | Co-op, chia sẻ build, guild | Ép social vào game single-player |
| Creativity | Xây dựng, tuỳ biến, chia sẻ tác phẩm | Tuỳ biến chỉ đổi màu |

## Cảnh báo về mặt đạo đức

Nhiều kỹ thuật "giữ chân" khai thác đúng các cơ chế tâm lý này theo hướng gây hại: variable-ratio reward (cơ chế của máy đánh bạc), loot box, timer ép quay lại, FOMO. Chúng *hiệu quả* về số liệu và cũng chính là thứ khiến người chơi ghét game của bạn về lâu dài — và ở nhiều nước giờ là vấn đề pháp lý.

Ranh giới thực dụng: **phần thưởng nên đến từ việc chơi giỏi hơn, không đến từ việc chờ lâu hơn hoặc trả nhiều hơn.** Xem thêm [[economy-design]].

## 🤖 Prompt cho AI

Động lực là thứ AI **không suy ra được từ mô tả tính năng**. Nếu không nói, nó sẽ nhồi mọi hệ thống giữ chân phổ biến vào game bạn.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Động lực chính và phụ — chọn 1 chính, 1 phụ, không hơn
- Cặp động lực **xung khắc** mà bạn từ chối (Action vs Immersion, Mastery vs Completion)
- Ranh giới đạo đức: có/không loot box, timer, chuỗi ngày đăng nhập

**Mẫu prompt**

```
Game của tôi phục vụ: Mastery/Challenge (chính) + Discovery (phụ).
KHÔNG phục vụ: Achievement/Completion — không checklist, không % hoàn thành.

Đề xuất 5 hệ thống giữ chân người chơi, mỗi hệ thống phải nói rõ
nó phục vụ nhu cầu nào trong 3 nhu cầu SDT (competence / autonomy / relatedness).
Loại bỏ ngay mọi cơ chế dựa trên: chờ đợi, FOMO, variable-ratio reward.
```

**Bẫy thường gặp:** AI đề xuất "nhiệm vụ hằng ngày + chuỗi đăng nhập + battle pass" cho mọi thể loại, vì đó là mẫu phổ biến nhất trong dữ liệu huấn luyện. Bắt nó biện minh từng cơ chế theo SDT là cách lọc nhanh nhất.
