---
title: GOAP
icon: 🎯
summary: Goal-Oriented Action Planning — NPC tự tìm chuỗi hành động để đạt mục tiêu, thay vì làm theo kịch bản.
status: deep
read: 400
level: advanced
order: 30
tags: [ai, planning, advanced]
related: [behavior-tree, utility-ai, fsm]
---

GOAP (Jeff Orkin, F.E.A.R. 2005) đảo ngược cách viết AI: thay vì mô tả **NPC phải làm gì**, bạn mô tả **NPC muốn gì** và **có những hành động nào**. NPC tự tìm đường.

## Ba thành phần

**World State** — trạng thái thế giới dưới dạng các cờ:
```
{ hasWeapon: false, nearEnemy: true, enemyDead: false, inCover: false }
```

**Action** — mỗi hành động có tiền đề, hiệu quả, và chi phí:
```
PickUpWeapon:  precond { hasWeapon: false }
               effect  { hasWeapon: true }
               cost    2

AttackEnemy:   precond { hasWeapon: true, nearEnemy: true }
               effect  { enemyDead: true }
               cost    1

TakeCover:     precond { coverAvailable: true }
               effect  { inCover: true }
               cost    3
```

**Goal** — trạng thái mong muốn: `{ enemyDead: true }`

## Planner

Bộ lập kế hoạch chạy **A\* trong không gian trạng thái** (xem [[pathfinding]] — cùng một thuật toán, khác không gian tìm kiếm). Nó tìm chuỗi hành động rẻ nhất biến trạng thái hiện tại thành trạng thái mục tiêu:

```
Hiện tại: { hasWeapon: false, nearEnemy: true, enemyDead: false }
Mục tiêu: { enemyDead: true }

Kế hoạch: PickUpWeapon → AttackEnemy    (chi phí 3)
```

Nếu súng biến mất giữa chừng, planner **tự lập kế hoạch lại** và có thể chọn `Melee` thay thế. Đây là sức mạnh thật của GOAP: bạn không lường trước tình huống, hệ thống tự xử lý.

## Vì sao F.E.A.R. được nhắc mãi

Kẻ địch trong F.E.A.R. nổi tiếng thông minh, nhưng điều thú vị là **hành vi bọc sườn không hề được lập trình**. Nó nảy sinh từ:

- Mục tiêu `killPlayer`
- Hành động `AttackFromPosition` với tiền đề `hasLineOfSight`
- Vị trí hiện tại không có tầm nhìn → planner chèn `MoveTo(position)` vào trước

Kết quả trông như phối hợp chiến thuật. Cộng thêm lời thoại ("Bọc sườn nó!") do hệ thống phát khi chọn hành động di chuyển — đây là phần **sân khấu** đã nói ở [[game-ai]]. Thiếu lời thoại, người chơi không nhận ra AI đang làm gì.

## Đánh đổi

**Ưu điểm**
- Hành vi nảy sinh, xử lý được tình huống chưa lường trước.
- Thêm hành động mới không phải sửa hành động cũ — mở rộng rất sạch.
- Mô hình hoá tự nhiên cho NPC có nhiều mục tiêu cạnh tranh (The Sims dùng ý tưởng tương tự).

**Nhược điểm**
- **Đắt về CPU.** Tìm kiếm A* mỗi lần lập kế hoạch. Với hàng chục NPC phải giới hạn độ sâu, cache, hoặc trải kế hoạch qua nhiều frame.
- **Khó gỡ lỗi.** Khi NPC làm điều kỳ quặc, phải truy ngược cả cây tìm kiếm. So với FSM (in ra tên trạng thái) thì đây là bước lùi lớn về khả năng chẩn đoán.
- **Khó kiểm soát.** Nhà thiết kế muốn NPC *luôn* làm X trong tình huống Y sẽ phải bẻ chi phí — và bẻ chi phí ở một chỗ làm hỏng kế hoạch ở chỗ khác.
- **Dễ lố.** Phần lớn game không cần. Nếu hành vi mong muốn viết được bằng [[behavior-tree]] trong 30 node, hãy dùng BT.

## Khi nào thật sự nên dùng

Dùng GOAP khi **cả ba** điều sau đúng:
1. NPC có nhiều cách khác nhau để đạt cùng một mục tiêu.
2. Tình huống thay đổi khiến kịch bản cứng thất bại thường xuyên.
3. Bạn chấp nhận đánh đổi khả năng gỡ lỗi lấy tính linh hoạt.

Nếu chỉ đúng một hoặc hai, [[behavior-tree]] hoặc [[utility-ai]] gần như luôn là lựa chọn tốt hơn.

## Kiến trúc lai — cách dùng phổ biến nhất

Trong thực tế, GOAP hiếm khi đứng một mình:

```
GOAP    → chọn kế hoạch cấp cao  (chuỗi hành động)
   ↓
BT/FSM  → thực thi từng hành động (chi tiết chuyển động, animation)
```

Mỗi hành động trong kế hoạch được hiện thực bằng một subtree BT. Cách này giữ được tính linh hoạt của GOAP ở tầng chiến lược và khả năng kiểm soát của BT ở tầng chiến thuật.

## 🤖 Prompt cho AI

GOAP là thuật toán có định nghĩa rõ ràng nên AI viết khá tốt. Điều cần nêu rõ trong prompt là các **ràng buộc hiệu năng** — đây là chỗ AI hay bỏ qua:

```
Cài đặt GOAP planner (C#, không phụ thuộc Unity API trong phần planner).

- WorldState là bitmask (không phải Dictionary) để so sánh nhanh
- A* với heuristic = số điều kiện mục tiêu chưa thoả mãn
- Giới hạn cứng: tối đa 60 node mở rộng, tối đa độ sâu 8
  → vượt giới hạn thì trả về kế hoạch tốt nhất tìm được, KHÔNG null
- Object pooling cho node tìm kiếm, không cấp phát trong vòng lặp
- Chỉ lập kế hoạch lại khi world state thay đổi, không lập mỗi frame
- Kèm unit test: 5 kịch bản, trong đó có 1 kịch bản không có kế hoạch khả thi
```

Điều kiện "vượt giới hạn thì trả về kế hoạch tốt nhất, không null" quan trọng: NPC không có kế hoạch sẽ đứng im, và đó là lỗi trông tệ hơn nhiều so với một kế hoạch dưới tối ưu.
