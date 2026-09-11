---
title: AI trong Game
icon: 🤖
summary: AI điều khiển NPC và gameplay — FSM, Behavior Tree, GOAP, Utility AI, pathfinding, AI Director, LLM-NPC.
status: deep
read: 320
level: basic
order: 40
tags: [ai, npc]
related: [combat-systems, ai-assisted-dev, difficulty-curve]
---

Đây là **AI *trong* game**: con quái biết né đạn, NPC biết đi chợ, hệ thống biết điều tiết nhịp độ. Đừng nhầm với [[ai-assisted-dev]] — đó là dùng AI để *làm ra* game.

## Sự thật quan trọng nhất

> **Mục tiêu của game AI không phải là thông minh. Mục tiêu là *tỏ ra* thông minh và làm cho người chơi vui.**

AI chơi hoàn hảo thì dễ viết một cách đáng ngạc nhiên — và gây chán một cách đáng tin cậy. Bot aimbot bắn trăm phát trăm trúng không vui. Việc khó là làm AI **thua một cách thú vị**: đủ giỏi để đáng gờm, đủ đọc được để người chơi học được cách thắng.

Hệ quả: rất nhiều "AI" trong game xuất sắc thực ra là **sân khấu**. Kẻ địch trong F.E.A.R. hô báo động khi bọc sườn không phải vì chúng phối hợp — chúng hô để *bạn biết* chúng đang bọc sườn. Nếu AI thông minh mà người chơi không nhận ra, coi như không có.

## Chọn kiến trúc nào

| Kỹ thuật | Phù hợp | Độ phức tạp | Khả năng mở rộng |
|---|---|---|---|
| [[fsm]] | Hành vi đơn giản, ít trạng thái | Rất thấp | Kém — bùng nổ chuyển tiếp |
| [[behavior-tree]] | Hầu hết NPC trong game thương mại | Trung bình | Tốt |
| [[utility-ai]] | Quyết định nhiều lựa chọn cạnh tranh, sim | Trung bình | Tốt |
| [[goap]] | NPC cần lập kế hoạch nhiều bước | Cao | Trung bình |
| [[ml-rl]] | Nghiên cứu, bot đối kháng | Rất cao | Khó kiểm soát |
| [[llm-npc]] | Hội thoại, tính cách | Trung bình | Tốn tiền, độ trễ cao |

**Lời khuyên thực dụng:** bắt đầu bằng [[fsm]]. Chuyển sang [[behavior-tree]] khi FSM vượt quá ~6 trạng thái. Chỉ dùng [[goap]] khi thật sự cần NPC tự tìm ra chuỗi hành động. Phần lớn game không cần.

## Các node hỗ trợ

- **[[pathfinding]]** — A*, NavMesh, flow field. Nền tảng của mọi thứ biết di chuyển.
- **[[steering-flocking]]** — chuyển động mượt và hành vi bầy đàn.
- **[[perception]]** — tầm nhìn, thính giác, trí nhớ. Cái làm AI *có vẻ* công bằng.
- **[[ai-director]]** — AI ở tầng hệ thống, điều tiết nhịp độ cả trận.

## Ba nguyên tắc thiết kế AI

**Đọc được quan trọng hơn tối ưu.** Kẻ địch phải *thông báo* ý định. Xem telegraph ở [[combat-systems]].

**Sự bất hoàn hảo phải có chủ ý.** Thêm thời gian phản ứng (200–400ms), độ lệch khi ngắm, khoảng do dự. Nhưng đừng làm ngẫu nhiên thuần — hãy làm nhất quán để người chơi học được.

**AI phải chơi công bằng — và trông có vẻ công bằng.** Nếu AI biết vị trí người chơi xuyên tường, người chơi sẽ cảm thấy bị lừa dù số liệu cân bằng. Xem [[perception]].

## 🤖 Prompt cho AI

Trước khi nhờ AI **viết** AI cho NPC, hãy bắt nó **chọn kiến trúc** và biện minh. Đây là bước tiết kiệm nhiều thời gian nhất.

**Phải nêu rõ:**
- Hành vi mong muốn mô tả ở mức **quan sát được**, không ở mức kỹ thuật
- Số lượng NPC đồng thời và ngân sách CPU
- Mức độ kiểm soát bạn cần (nhà thiết kế có phải chỉnh tay không)
- Người chơi phải **nhận ra** được điều gì — phần "sân khấu"

**Mẫu prompt chọn kiến trúc**

```
Trước khi viết code, hãy TƯ VẤN CHỌN KIẾN TRÚC.

Hành vi mong muốn (mức quan sát được):
- Kẻ địch tuần tra, phát hiện người chơi, truy đuổi, tấn công
- Máu thấp thì tìm chỗ nấp và hồi máu
- Nhiều con cùng lúc thì biết tản ra, không chen nhau

Ràng buộc: tối đa 30 NPC đồng thời, ngân sách 2ms/frame cho toàn bộ AI.
Tôi cần chỉnh tay được độ ưu tiên hành vi mà không phải sửa code.

So sánh FSM / Behavior Tree / Utility AI / GOAP cho trường hợp NÀY.
Khuyến nghị MỘT cái, nêu rõ đánh đổi. Chưa viết code.
```

**Bẫy thường gặp:** AI mặc định đề xuất GOAP hoặc machine learning vì nghe "thông minh hơn". Với 90% game indie, câu trả lời đúng là FSM hoặc Behavior Tree. Ràng buộc *"tôi cần chỉnh tay được"* thường tự loại GOAP và RL ra.

**Nhớ yêu cầu phần sân khấu:** AI thông minh mà người chơi không nhận ra thì bằng không. Luôn thêm: *"mỗi khi NPC đổi ý định, phát tín hiệu người chơi thấy được — lời thoại, biểu tượng, đổi tư thế."*
