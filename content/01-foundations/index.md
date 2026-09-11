---
title: Nền tảng Game Design
icon: 🎯
summary: Những nguyên lý phải nắm trước khi viết dòng code đầu tiên — core loop, động lực người chơi, MDA, game feel.
status: deep
read: 20
level: basic
order: 10
tags: [foundations]
related: [systems, blueprints]
---

Nhánh này trả lời câu hỏi **"cái gì làm một trò chơi trở nên đáng chơi?"**. Nó đứng trước mọi quyết định kỹ thuật.

## Thứ tự nên đi

1. **[[design-pillars]]** — chốt 3 câu mô tả game của bạn. Mọi quyết định sau đều phải quy chiếu về đây.
2. **[[core-loop]]** — vòng lặp người chơi lặp lại hàng nghìn lần. Nếu vòng này chán, không gì cứu được.
3. **[[player-motivation]]** — vì sao người ta chơi tiếp. Quyết định bạn xây hệ thống gì ở [[systems]].
4. **[[game-feel]]** — độ "đã tay". Khác biệt giữa prototype và game thật thường nằm ở đây, không nằm ở tính năng.
5. **[[mda-framework]]** — ngôn ngữ chung để phân tích: luật chơi nào sinh ra trải nghiệm nào.
6. **[[prototyping]]** — cách kiểm chứng nhanh trước khi đầu tư lớn.

## Sai lầm phổ biến

**Bắt đầu từ tính năng thay vì từ trải nghiệm.** "Game của tôi có crafting, có pet, có PvP" không phải là thiết kế — đó là danh sách mua sắm. Thiết kế là: *"người chơi sẽ cảm thấy gì, vào phút thứ 3, phút thứ 30, và giờ thứ 30?"*

**Nhầm độ phức tạp với chiều sâu.** Thêm 40 chỉ số làm game *phức tạp*. Chiều sâu là khi ít luật sinh ra nhiều tình huống đáng suy nghĩ — cờ vây có 2 luật.

**Bỏ qua 30 giây đầu.** Phần lớn người chơi rời đi trước phút thứ 5. Vòng lặp cốt lõi phải cảm nhận được *ngay*, trước khi mọi hệ thống meta kịp mở khoá.

## 🤖 Prompt cho AI

AI viết code rất nhanh nhưng **không có trực giác về cảm giác chơi**. Nó không biết animation lag 80ms làm cú đấm mất lực. Vì vậy phần này bạn phải tự quyết định và **viết ra thành số cụ thể** trong [[gdd-for-ai]] — ví dụ "hitstop 90ms, screenshake biên độ 6px trong 120ms" — thay vì mô tả "cho nó đã tay".
