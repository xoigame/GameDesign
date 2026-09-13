---
title: MDA Framework
icon: 🔬
summary: Mechanics → Dynamics → Aesthetics — ngôn ngữ chung để truy ngược từ cảm xúc mong muốn về luật chơi cụ thể.
status: deep
read: 230
level: intermediate
order: 50
tags: [foundations, theory, analysis]
related: [core-loop, player-motivation, balancing-math]
---

MDA (Hunicke, LeBlanc & Zubek, 2004) tách một trò chơi thành ba tầng:

- **Mechanics** — luật chơi và dữ liệu. *"Nhân vật có 100 HP, đòn chém gây 12 sát thương, cooldown 0.4s."*
- **Dynamics** — hành vi phát sinh khi người chơi vận hành các luật đó. *"Người chơi học được nhịp đánh-lùi-đánh."*
- **Aesthetics** — cảm xúc tạo ra. *"Căng thẳng, rồi thoả mãn khi làm chủ."*

## Điểm cốt lõi: hai chiều nhìn ngược nhau

**Người thiết kế** nhìn từ trái sang phải: chỉnh số → hy vọng dynamics thay đổi → hy vọng cảm xúc thay đổi.

**Người chơi** trải nghiệm từ phải sang trái: họ cảm nhận aesthetics trước, chỉ dần dần mới nhận ra mechanics.

Hệ quả thực tiễn: **thiết kế phải đi ngược** — bắt đầu từ cảm xúc bạn muốn, rồi mới truy ngược về luật chơi. Đó chính là nội dung của [[design-pillars]].

## Tám loại "vui" (thay cho từ "vui" mơ hồ)

LeBlanc liệt kê 8 dạng aesthetics — dùng chúng thay vì nói "game phải vui":

| Loại | Nghĩa | Game tiêu biểu |
|---|---|---|
| Sensation | Khoái cảm giác quan | Journey, Tetris Effect |
| Fantasy | Đóng vai, tin vào thế giới | Skyrim |
| Narrative | Kịch tính, diễn biến | Disco Elysium |
| Challenge | Vượt chướng ngại | Celeste, Souls |
| Fellowship | Cộng đồng, đồng đội | It Takes Two |
| Discovery | Khám phá | Outer Wilds |
| Expression | Thể hiện bản thân | Minecraft |
| Submission | Thư giãn, nhịp đều | Stardew Valley |

Chọn **2 loại chính** cho game của bạn. Chọn quá 3 là chưa quyết định gì.

## Dùng để chẩn đoán lỗi

Sức mạnh thật của MDA là khi game "sai sai" mà không rõ vì sao. Truy từ phải sang trái:

> **Aesthetic quan sát được:** người chơi thấy chán ở phút 10.
> **Dynamic nào gây ra?** Họ tìm được một chiến thuật an toàn và lặp lại mãi.
> **Mechanic nào cho phép?** Hồi máu không giới hạn + không có áp lực thời gian.
> **Sửa:** giới hạn số lần hồi máu mỗi phòng, hoặc thêm hao mòn theo thời gian.

Không có MDA, phản ứng thường thấy là "thêm nội dung mới" — trong khi vấn đề nằm ở một mechanic duy nhất.

## Ranh giới của mô hình

MDA bị phê bình vì coi dynamics như thứ suy ra được từ mechanics một cách khá cơ học. Thực tế dynamics phụ thuộc rất nhiều vào **văn hoá và kỳ vọng của người chơi** — cùng một bộ luật, cộng đồng speedrun và người chơi thường sinh ra dynamics hoàn toàn khác. Các mô hình sau này (DDE, Tension) bù lại phần này.

Dù vậy MDA vẫn là khung phổ biến nhất, và đủ dùng cho hầu hết dự án nhỏ.

## 🤖 Prompt cho AI

AI thao tác rất tốt ở tầng **Mechanics** (viết code theo số) và rất kém ở tầng **Aesthetics** (không cảm nhận được). Nó gần như mù ở tầng **Dynamics** — không dự đoán nổi người chơi sẽ lách luật thế nào.

Phân công hợp lý:

- **Bạn** quyết định Aesthetics và phán đoán Dynamics (cần playtest — xem [[playtesting-metrics]]).
- **AI** hiện thực hoá Mechanics và, nếu bạn mô tả rõ luật, có thể chạy mô phỏng để dò Dynamics: *"mô phỏng 10.000 trận với 3 build này, thống kê tỉ lệ thắng"*. Đây là cách dùng AI hiệu quả và ít bị đánh giá thấp — xem [[balancing-math]].

## 🎮 Unity

MDA trong Unity nói về **nơi mỗi tầng sống trong project** — và ranh giới đó quyết định bạn test được gì.

**Ba tầng → ba lớp code**

```
Mechanics   → Assets/Scripts/Core/        C# thuần, test EditMode, mô phỏng được
Dynamics    → (không có code)             phát sinh; đo bằng log + playtest
Aesthetics  → Assets/Scripts/Presentation/ animation, audio, VFX, UI
```

Điểm quan trọng: **Dynamics không có lớp code tương ứng.** Nó là thứ nảy sinh, và cách duy nhất quan sát là đo. Đây là lý do log sự kiện không phải việc phụ — xem [[playtesting-metrics]].

**Chẩn đoán ngược bằng công cụ Unity**

Khi game "sai sai", truy từ Aesthetics về Mechanics:

| Tầng | Công cụ Unity |
|---|---|
| Aesthetics quan sát được | Playtest, ghi màn hình, phỏng vấn |
| Dynamic nào gây ra | Log sự kiện + phân tích (tỉ lệ dùng cơ chế, pick rate) |
| Mechanic nào cho phép | Đọc `Core/`, chạy mô phỏng (xem [[balancing-math]]) |

Ví dụ thật: người chơi chán ở phút 10 → log cho thấy 80% thời gian họ dùng đúng một chiến thuật → mô phỏng cho thấy chiến thuật đó winrate 85% → mechanic cho phép: hồi máu không giới hạn. Sửa một dòng trong `Core/`.

Không có lớp `Core/` tách biệt, bước cuối (mô phỏng) không làm được và bạn phải đoán.

**Ranh giới cưỡng chế bằng Assembly Definition**

```json
// Assets/Scripts/Core/Core.asmdef
{
  "name": "Game.Core",
  "references": [],                    // KHÔNG tham chiếu gì
  "noEngineReferences": true           // ← cưỡng chế không dùng UnityEngine
}
```

`noEngineReferences: true` làm compiler **báo lỗi** nếu ai đó `using UnityEngine` trong `Core/`. Đây là cách biến nguyên tắc thành ràng buộc máy kiểm tra — mạnh hơn mọi lời nhắc trong tài liệu. Xem [[unity-project-structure]].

**Kiểm tra nhanh**
- `Core.asmdef` có `noEngineReferences: true` chứ?
- Thử thêm `using UnityEngine` vào `Core/`: có lỗi compile không?
- Có log đủ để trả lời "người chơi đang dùng cơ chế nào" không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **MDA là gì? Ba tầng khác nhau thế nào?**
  → **Mechanics** là luật chơi và dữ liệu ("100 HP, đòn chém 12 sát thương, cooldown 0,4 s"). **Dynamics** là hành vi phát sinh khi người chơi vận hành các luật đó ("họ học được nhịp đánh-lùi-đánh"). **Aesthetics** là cảm xúc tạo ra ("căng thẳng, rồi thoả mãn khi làm chủ"). Hunicke, LeBlanc & Zubek, 2004.
- `Junior` **Vì sao nói người thiết kế và người chơi nhìn MDA ngược chiều nhau?**
  → Người thiết kế đi **trái sang phải**: chỉnh số, hy vọng dynamics đổi, hy vọng cảm xúc đổi. Người chơi trải nghiệm **phải sang trái**: họ cảm nhận aesthetics trước, dần dần mới nhận ra mechanics. Hệ quả thực tiễn: thiết kế phải **đi ngược** — bắt đầu từ cảm xúc muốn có rồi truy về luật chơi, và đó đúng là nội dung của design pillars.
- `Junior` **Tám loại aesthetics dùng để làm gì?**
  → Để thay cho từ "vui" mơ hồ: Sensation, Fantasy, Narrative, Challenge, Fellowship, Discovery, Expression, Submission. Chọn **2 loại chính** cho game; quá 3 là chưa quyết định gì. Nó biến câu "game phải vui" thành câu kiểm tra được: "game này bán Challenge và Discovery, nên tính năng X phục vụ cái nào?".
- `Mid` **Người chơi thấy chán ở phút 10. Dùng MDA để chẩn đoán thế nào?**
  → Truy từ phải sang trái. **Aesthetic**: chán ở phút 10. **Dynamic nào gây ra?** Họ tìm được một chiến thuật an toàn và lặp lại mãi. **Mechanic nào cho phép?** Hồi máu không giới hạn cộng không có áp lực thời gian. **Sửa**: giới hạn số lần hồi mỗi phòng, hoặc thêm hao mòn theo thời gian. Không có MDA thì phản ứng mặc định là "thêm nội dung mới".
- `Mid` **Vì sao "thêm nội dung" thường là câu trả lời sai cho chuyện chán?**
  → Vì chán thường là **dynamic hội tụ** — người chơi đã tìm ra một lối chơi trội và không còn quyết định nào đáng cân nhắc. Thêm nội dung chỉ đưa thêm nguyên liệu cho đúng lối chơi đó; nó dời điểm chán ra xa chứ không xoá nó. Cái cần sửa là mechanic cho phép lối chơi trội tồn tại.
- `Mid` **Chọn 2 aesthetics chính ảnh hưởng gì tới quyết định hằng ngày?**
  → Nó cho một bộ lọc: tính năng phục vụ một trong hai thì làm, không phục vụ thì cân nhắc cắt. Ví dụ game bán **Discovery** thì minimap đánh dấu sẵn mọi thứ là phản tác dụng, dù ai cũng thấy tiện. Không chốt aesthetics thì mỗi người trong đội tối ưu cho một cảm xúc khác nhau và không ai sai cả.
- `Senior` **Hạn chế của MDA là gì?**
  → Nó coi dynamics như thứ **suy ra được từ mechanics một cách khá cơ học**. Thực tế dynamics phụ thuộc nhiều vào văn hoá và kỳ vọng người chơi: cùng một bộ luật, cộng đồng speedrun và người chơi thường sinh ra dynamics hoàn toàn khác. Các mô hình sau (DDE, Tension) bù phần này. MDA vẫn đủ dùng cho hầu hết dự án nhỏ, miễn là biết chỗ nó mỏng.
- `Senior` **Playtest cho kết quả trái ngược nhau giữa hai nhóm tester. MDA giúp gì?**
  → Nó nói cho mình biết cần hỏi ở tầng nào. Hai nhóm cùng mechanics mà khác aesthetics nghĩa là **dynamics của họ khác nhau** — thường vì kỹ năng, kỳ vọng thể loại, hoặc vì họ tự đặt mục tiêu khác. Lúc đó câu hỏi đúng không phải "sửa số nào" mà "nhóm nào là người chơi mục tiêu", và đó là câu hỏi về pillar chứ không phải về cân bằng.
- `Senior` **Anh dùng MDA để nói chuyện với người không làm design thế nào?**
  → Bằng cách luôn nối một thay đổi số với một cảm xúc qua đúng một bước dynamic. "Giảm hồi máu từ 3 xuống 1 lần mỗi phòng" → "người chơi phải quyết định khi nào tiêu" → "căng thẳng quay lại ở nửa sau màn". Ba câu đó biến một tranh luận về sở thích thành một giả thuyết kiểm chứng được bằng playtest.

**Khung trả lời 60 giây** — "MDA dùng để làm gì trong công việc thật?"

> Dùng để **chẩn đoán**, không phải để phân loại. Khi game "sai sai" mà không ai chỉ được chỗ, tôi truy từ phải sang trái: cảm xúc quan sát được là gì, **dynamic** nào tạo ra nó, và **mechanic** nào cho phép dynamic đó tồn tại.
>
> Ví dụ thật: tester chán ở phút mười. Dynamic là họ tìm được một chiến thuật an toàn và lặp lại mãi. Mechanic cho phép điều đó là hồi máu không giới hạn cộng với việc không có áp lực thời gian. Sửa là giới hạn số lần hồi mỗi phòng. Không có khung này thì phản ứng mặc định của cả đội sẽ là "thêm nội dung", và nội dung mới sẽ bị chơi bằng đúng chiến thuật cũ.
>
> Phần thứ hai tôi dùng là **tám loại aesthetics** thay cho từ "vui": chốt hai loại chính rồi lấy đó làm bộ lọc. Game bán Discovery thì minimap đánh dấu sẵn mọi thứ là phản tác dụng, dù nó tiện — và câu đó chỉ nói được khi đã chốt aesthetics từ trước.

**Họ sẽ đào tiếp**

- *"Vì sao phải chốt đúng hai aesthetics?"* → Vì công dụng của danh sách là **loại trừ**. Chọn ba là đã rộng; chọn năm thì mọi tính năng đều phục vụ một cái nào đó và bộ lọc hết tác dụng. Hai loại còn buộc đội trả lời được "game này không bán cái gì" — câu khó hơn nhiều so với "game này có gì".
- *"MDA và design pillars là hai thứ hay một thứ?"* → Cùng một ý, khác độ phân giải. Aesthetics là cảm xúc đích; pillar là câu phát biểu **có khả năng nói không** về cách đạt cảm xúc đó. MDA cho từ vựng, pillar cho quyết định.
- *"Làm sao biết mình đang đo dynamics chứ không phải đoán?"* → Nhìn hành vi đo được: tỉ lệ sử dụng từng lựa chọn, độ dài phiên, chỗ người chơi dừng lại, chiến thuật lặp lại. Dynamic là **hành vi**, nên nó luôn có dấu vết trong dữ liệu hoặc trong video playtest; nếu không thấy dấu vết nào thì mình đang nói về giả thuyết, và nên gọi đúng tên như vậy.
- *"Dùng AI ở khâu này thế nào?"* → Việc nó làm tốt là **liệt kê dynamics có thể phát sinh** từ một bộ luật — nó nghĩ ra nhiều cách khai thác luật hơn mình, và đó là việc mệt. Việc nó làm dở là nói người chơi sẽ **cảm thấy** gì; cái đó cần người thật chơi, và một đoạn văn tự tin của AI ở đây rất dễ bị nhầm là bằng chứng.

**Cờ đỏ**

- Dùng MDA như bảng phân loại để dán nhãn game, không dùng để chẩn đoán.
- Trả lời "game phải vui" sau khi đã biết tám loại aesthetics.
- Nhảy thẳng từ cảm xúc sang mechanic, bỏ qua bước dynamic — nên không kiểm chứng được.
- Chữa vấn đề dynamic bằng cách thêm nội dung.
- Coi dynamics là thứ suy ra chắc chắn từ mechanics, bỏ qua văn hoá người chơi.

**Số / ví dụ nên thuộc**

- MDA: **Hunicke, LeBlanc & Zubek, 2004**.
- Tám aesthetics: Sensation · Fantasy · Narrative · Challenge · Fellowship · Discovery · Expression · Submission. Chọn **2**, quá 3 là chưa quyết định.
- Chiều thiết kế: **phải → trái** (cảm xúc → dynamic → mechanic); chiều người chơi: trái ← phải.
- Mẫu chẩn đoán ba dòng: aesthetic quan sát được → dynamic gây ra → mechanic cho phép.
- Giới hạn đã biết: dynamics phụ thuộc **văn hoá người chơi**; DDE và Tension bù phần này.
