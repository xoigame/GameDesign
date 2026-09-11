---
title: LLM-driven NPC
icon: 💬
summary: Dùng mô hình ngôn ngữ cho NPC — kiến trúc, chi phí, độ trễ, và những rào cản thật sự chưa ai giải xong.
status: deep
read: 510
level: advanced
order: 70
tags: [ai, llm, npc, experimental]
related: [narrative, behavior-tree, agent-guardrails]
---

Ý tưởng thì hấp dẫn: NPC nói chuyện tự nhiên, nhớ bạn, phản ứng theo tình huống. Thực tế có nhiều rào cản chưa được giải quyết tốt, và biết trước chúng sẽ giúp bạn tiết kiệm hàng tháng.

## Kiến trúc thực tế

Đừng để LLM điều khiển hành vi. Kiến trúc dùng được là **phân tầng**:

```
┌──────────────────────────────────────────┐
│ LLM  —  chỉ sinh lời thoại & sắc thái     │
├──────────────────────────────────────────┤
│ Tầng luật  —  lọc, kiểm duyệt, kiểm tra   │
├──────────────────────────────────────────┤
│ BT / FSM  —  hành vi thật, di chuyển,     │
│              chiến đấu, tương tác vật thể │
└──────────────────────────────────────────┘
```

LLM **không** được phép quyết định NPC tấn công hay không, mở cửa hay không, cho quest hay không. Nó chỉ diễn đạt quyết định mà tầng dưới đã đưa ra. Lý do: LLM không tất định, không kiểm chứng được, và không chịu ràng buộc luật game.

Cách làm phổ biến và ổn định: LLM trả về **hành động có cấu trúc** trong một tập đóng, rồi code kiểm tra hợp lệ:

```json
{
  "dialogue": "Ta đã bảo rồi, đừng có lảng vảng quanh kho thóc.",
  "emotion": "annoyed",
  "action": "warn",
  "relationship_delta": -5
}
```

`action` phải nằm trong enum `["greet","warn","trade","attack","give_quest","ignore"]`. Mọi giá trị ngoài danh sách → từ chối, dùng phản hồi dự phòng. Đây là ranh giới an toàn bắt buộc — xem [[agent-guardrails]].

## Bốn rào cản thật

**Độ trễ.** Gọi API mất 400ms–2s. Hội thoại chịu được; phản ứng thời gian thực thì không. Giải pháp: phát animation "đang suy nghĩ", phát trước một câu đệm chung, hoặc sinh sẵn phản hồi cho các tình huống thường gặp.

**Chi phí.** Mỗi NPC nói một câu tốn tiền thật. Với 50 NPC × 10.000 người chơi × 20 lượt hội thoại, hoá đơn vượt xa doanh thu game indie. Giải pháp thực tế: mô hình nhỏ chạy cục bộ, cache theo ngữ cảnh, hoặc **sinh sẵn khi build** thay vì sinh lúc chạy.

**Tính nhất quán.** LLM sẽ mâu thuẫn với chính nó. NPC nói rằng ông ta có ba người con, mười phút sau nói chưa vợ. Người chơi nhận ra ngay và mất hoàn toàn niềm tin vào thế giới. Giải pháp: **sự thật nằm trong dữ liệu game, không nằm trong LLM.** Bơm các sự kiện đã xác lập vào prompt mỗi lần gọi.

**Người chơi sẽ phá.** Ai đó sẽ thuyết phục NPC nói về chính trị, đọc system prompt, hoặc thoát vai. Cần lọc đầu ra, giới hạn chủ đề, và chấp nhận rằng không có biện pháp nào kín 100%.

## Trí nhớ

Đây là phần quyết định NPC có cảm giác "sống" hay không. Ba tầng:

```
Ngắn hạn   — 5-10 lượt gần nhất, đưa nguyên văn vào prompt
Trung hạn  — tóm tắt phiên chơi này, LLM tự tóm tắt định kỳ
Dài hạn    — dữ kiện có cấu trúc trong DB game (KHÔNG để LLM giữ)
```

Tầng dài hạn phải là dữ liệu game thật:

```json
{
  "npc_id": "blacksmith_gorn",
  "facts": {
    "player_name": "Kael",
    "player_saved_his_daughter": true,
    "relationship": 72,
    "items_sold_to_player": ["iron_sword"],
    "last_met_day": 14
  }
}
```

Những dữ kiện này được chèn vào prompt mỗi lần gọi. Chúng là sự thật; LLM chỉ diễn đạt chúng.

## Vấn đề thiết kế, không phải kỹ thuật

Một điều ít được nói tới: **hội thoại vô hạn thường làm game tệ đi**.

Cây hội thoại viết tay có trọng lượng vì mỗi dòng đều được chọn lọc. Khi NPC nói gì cũng được, không câu nào đáng nhớ. Người chơi chuyển từ *nghe một nhân vật* sang *nghịch một chatbot* — và họ ngừng quan tâm tới cốt truyện.

Vì vậy các ứng dụng hứa hẹn nhất hiện nay không phải là thay thế cây hội thoại, mà là:

- **Diễn đạt lại lời thoại viết tay** theo tâm trạng và mối quan hệ hiện tại.
- **Phản ứng vụn** với hành động người chơi (bạn đốt nhà → dân làng bình luận).
- **Lời thoại lấp khoảng** — NPC nói chuyện với nhau ở nền, tạo không khí.
- **Sinh nội dung lúc build**, con người biên tập lại — an toàn nhất về chi phí và chất lượng.

Xem thêm phần cuối [[narrative]].

## Danh sách kiểm tra trước khi đưa vào game

- [ ] LLM chỉ sinh lời thoại, không quyết định hành vi
- [ ] Đầu ra có schema, validate, có phản hồi dự phòng khi lỗi
- [ ] Sự thật lấy từ DB game, không lấy từ trí nhớ mô hình
- [ ] Lọc nội dung đầu ra
- [ ] Xử lý được khi API hỏng hoặc người chơi offline
- [ ] Ước tính chi phí ở quy mô thật — trước khi viết code
- [ ] Đã thử: NPC có thật sự hay hơn cây hội thoại viết tốt không?

## 🤖 Prompt cho AI

Đây là chủ đề AI dễ "giúp quá tay" nhất — nó sẽ cho LLM quyền quyết định hành vi nếu bạn không cấm rõ.

**Phải nêu rõ:**
- Ranh giới: LLM chỉ sinh lời thoại, tầng luật quyết định hành vi
- Schema đầu ra đóng, kèm hành vi dự phòng khi lỗi
- Nguồn sự thật: DB game, không phải trí nhớ mô hình
- Ngân sách chi phí và độ trễ tối đa

**Mẫu prompt**

```
Tích hợp LLM cho hội thoại NPC. Kiến trúc PHÂN TẦNG bắt buộc:

TẦNG 1 (BT/FSM) quyết định hành vi: tấn công, giao dịch, cho quest, bỏ qua.
TẦNG 2 (luật)   kiểm tra và lọc.
TẦNG 3 (LLM)    CHỈ diễn đạt thành lời quyết định đã có.

CẤM: LLM quyết định NPC làm gì. CẤM: LLM là nguồn sự thật về thế giới.

Đầu ra LLM bắt buộc theo schema:
{ "dialogue": string (<= 200 ký tự),
  "emotion": enum[neutral,happy,annoyed,afraid,angry],
  "action": enum[greet,warn,trade,give_quest,ignore] }
action PHẢI trùng quyết định tầng 1. Lệch -> loại bỏ, dùng câu dự phòng.

Sự thật bơm vào prompt mỗi lần gọi, lấy từ DB game:
  player_name, relationship (0-100), đã cứu con gái NPC?, ngày gặp gần nhất

Ràng buộc vận hành:
- Timeout 1.5s -> dùng câu viết sẵn, KHÔNG để người chơi chờ
- API lỗi hoặc offline -> fallback về cây hội thoại tĩnh
- Cache theo (npc_id, intent, relationship_bucket)
- Ước tính chi phí ở 10.000 người chơi × 20 lượt/người TRƯỚC khi viết code
```

**Bẫy thường gặp:** để LLM giữ trí nhớ. Nó sẽ mâu thuẫn với chính nó trong 10 phút và người chơi mất hết niềm tin vào thế giới. Sự thật phải nằm trong DB.
