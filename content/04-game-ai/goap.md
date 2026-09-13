---
title: GOAP
icon: 🎯
summary: Goal-Oriented Action Planning — NPC tự tìm chuỗi hành động để đạt mục tiêu, thay vì làm theo kịch bản.
status: deep
read: 500
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

## 🎮 Unity

GOAP trong Unity chạy được, nhưng **phần planner phải là C# thuần** để test và giới hạn được chi phí.

**Component & nơi đặt**
- `AI/Core/Goap/` — Planner, WorldState, GoapAction (không `using UnityEngine`)
- `GoapAgent.cs` — MonoBehaviour, gọi planner và thực thi kế hoạch
- Mỗi hành động cấp thấp hiện thực bằng một subtree BT hoặc coroutine

**WorldState nên là bitmask, không phải Dictionary**

```csharp
// 64 điều kiện boolean trong một ulong — so sánh và merge bằng phép bit
public readonly struct WorldState {
    public readonly ulong values;   // giá trị
    public readonly ulong mask;     // bit nào có nghĩa

    public bool Satisfies(WorldState goal) =>
        (values & goal.mask) == (goal.values & goal.mask);

    public WorldState Apply(WorldState effect) =>
        new((values & ~effect.mask) | effect.values, mask | effect.mask);
}
```

`Dictionary<string, bool>` cấp phát và so sánh chậm — với A* mở rộng hàng chục node mỗi lần lập kế hoạch, khác biệt rất rõ trên Profiler.

**Planner có giới hạn cứng**

```csharp
public bool TryPlan(WorldState start, WorldState goal, List<GoapAction> outPlan) {
    open.Clear(); closed.Clear(); outPlan.Clear();
    int expanded = 0;
    GoapNode bestSoFar = null;

    while (open.Count > 0) {
        if (++expanded > MaxExpansions) break;        // trần cứng
        var node = open.Pop();
        if (node.depth > MaxDepth) continue;
        if (node.state.Satisfies(goal)) { Unwind(node, outPlan); return true; }
        if (bestSoFar == null || node.h < bestSoFar.h) bestSoFar = node;
        ExpandNeighbours(node);
    }

    // Vượt giới hạn: trả kế hoạch TỐT NHẤT tìm được, KHÔNG trả về false.
    // NPC không có kế hoạch sẽ đứng im — lỗi trông tệ hơn kế hoạch dưới tối ưu.
    if (bestSoFar != null) { Unwind(bestSoFar, outPlan); return outPlan.Count > 0; }
    return false;
}
```

**Chỉ lập kế hoạch lại khi cần**

```csharp
void OnWorldStateChanged() => needsReplan = true;    // event, KHÔNG poll

protected override void Think(float dt) {
    if (needsReplan || plan.Count == 0) {
        needsReplan = false;
        if (!planner.TryPlan(Sense(), goal, plan)) { Idle(); return; }
    }
    ExecuteCurrentStep(dt);
}
```

Lập kế hoạch mỗi frame là cách nhanh nhất để GOAP ăn hết ngân sách CPU.

**Bẫy Unity cụ thể**
- **Cấp phát trong vòng lặp A\*.** Dùng object pool cho `GoapNode`, `List` cấp phát sẵn và `Clear()` thay vì `new`.
- **Planner phụ thuộc `UnityEngine`** → không test EditMode được, mất đi lợi thế lớn nhất.
- **Không giới hạn độ sâu** → một hành động có tiền đề vòng tròn làm treo game.

**Kiểm tra nhanh**
- Unit test EditMode: 5 kịch bản, có 1 kịch bản không có kế hoạch khả thi.
- Profiler: `TryPlan` cấp phát 0 B?
- Cướp mất điều kiện giữa chừng (vứt súng đi): NPC có lập lại kế hoạch không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **GOAP là gì? Ba thành phần của nó?**
  → Goal-Oriented Action Planning (Jeff Orkin, F.E.A.R. 2005): thay vì mô tả NPC **phải làm gì**, mình mô tả NPC **muốn gì** và **có những hành động nào**, rồi nó tự tìm đường. Ba thành phần: **World State** (các cờ trạng thái), **Action** (tiền đề + hiệu quả + chi phí), và **Goal** (trạng thái mong muốn).
- `Junior` **Planner của GOAP chạy thuật toán gì?**
  → **A\* trong không gian trạng thái** — cùng thuật toán với tìm đường, khác không gian tìm kiếm: node là trạng thái thế giới, cạnh là hành động, chi phí là chi phí hành động. Nó tìm chuỗi hành động rẻ nhất biến trạng thái hiện tại thành trạng thái mục tiêu.
- `Junior` **Điều gì xảy ra khi điều kiện thay đổi giữa chừng?**
  → Planner **lập kế hoạch lại**: súng biến mất thì nó có thể chọn `Melee` thay thế mà không cần ai lường trước tình huống đó. Đây là sức mạnh thật của GOAP — hành vi cho các tình huống mình chưa nghĩ tới nảy sinh từ tiền đề và hiệu quả, không từ kịch bản.
- `Mid` **Vì sao kẻ địch F.E.A.R. trông như biết bọc sườn, dù hành vi đó không được lập trình?**
  → Nó nảy sinh: mục tiêu `killPlayer`, hành động `AttackFromPosition` có tiền đề `hasLineOfSight`, vị trí hiện tại không có tầm nhìn → planner **chèn `MoveTo(position)` vào trước**. Và phần quan trọng không kém là **sân khấu**: lời thoại "Bọc sườn nó!" phát khi chọn hành động di chuyển. Thiếu lời thoại, người chơi không nhận ra AI đang làm gì.
- `Mid` **Ba nhược điểm của GOAP mà anh phải tính trước?**
  → **Đắt CPU** — A* mỗi lần lập kế hoạch; hàng chục NPC thì phải giới hạn độ sâu, cache, hoặc trải kế hoạch qua nhiều frame. **Khó gỡ lỗi** — NPC làm điều kỳ quặc thì phải truy ngược cả cây tìm kiếm, một bước lùi lớn so với việc in tên trạng thái của FSM. **Khó kiểm soát** — muốn NPC luôn làm X trong tình huống Y thì phải bẻ chi phí, và bẻ ở một chỗ làm hỏng kế hoạch ở chỗ khác.
- `Mid` **Ba điều kiện để GOAP thật sự đáng dùng?**
  → Cả ba phải đúng: NPC có **nhiều cách khác nhau** để đạt cùng một mục tiêu; tình huống thay đổi khiến kịch bản cứng thất bại **thường xuyên**; và mình chấp nhận đánh đổi khả năng gỡ lỗi lấy tính linh hoạt. Chỉ đúng một hoặc hai thì behavior tree hoặc utility AI gần như luôn tốt hơn.
- `Senior` **Kiến trúc lai GOAP + BT hoạt động thế nào, và vì sao nó phổ biến hơn GOAP thuần?**
  → GOAP lập kế hoạch ở **tầng chiến lược** — chuỗi hành động nào đạt mục tiêu — còn **mỗi hành động trong kế hoạch được hiện thực bằng một subtree BT** ở tầng chiến thuật. Nó giữ được tính linh hoạt của GOAP và khả năng kiểm soát cùng khả năng gỡ lỗi của BT. GOAP thuần hiếm khi đứng một mình trong sản phẩm thật vì lý do đó.
- `Senior` **Designer muốn NPC luôn ném lựu đạn khi người chơi nấp sau vật cản. GOAP xử lý thế nào?**
  → Bằng chi phí và tiền đề, không bằng luật cứng: cho `ThrowGrenade` tiền đề `playerInCover` và chi phí thấp hơn hẳn các hành động khác trong tình huống đó. Nhưng phải nói thẳng cái giá — **bẻ chi phí là công cụ gián tiếp**, nên nó có thể làm hỏng kế hoạch ở tình huống khác, và mỗi lần bẻ đều cần test lại các kịch bản cũ. Nếu yêu cầu kiểu này nhiều thì đó là tín hiệu nên dùng BT.
- `Senior` **Giới hạn chi phí CPU của GOAP trong game có nhiều NPC — anh làm gì?**
  → Bốn thứ theo thứ tự: **giới hạn độ sâu tìm kiếm** (3–5 hành động là đủ cho hầu hết tình huống), **cache kế hoạch** và chỉ lập lại khi world state đổi ở những cờ liên quan, **trải việc lập kế hoạch qua nhiều frame** với hàng đợi, và chỉ cho **một số ít NPC** dùng GOAP — thường là chỉ huy hoặc boss, còn lính thường dùng BT.

**Khung trả lời 60 giây** — "GOAP là gì, và khi nào anh dùng nó?"

> GOAP đảo ngược cách viết AI. Thay vì mô tả NPC phải làm gì, tôi mô tả nó **muốn gì** — một goal như `enemyDead: true` — và **có những hành động nào**, mỗi hành động kèm tiền đề, hiệu quả và chi phí. Planner chạy A* trong không gian trạng thái để tìm chuỗi rẻ nhất, và nếu điều kiện đổi giữa chừng thì nó lập kế hoạch lại.
>
> Đó cũng là lý do kẻ địch F.E.A.R. trông như biết bọc sườn dù không ai lập trình hành vi đó: mục tiêu cần tầm nhìn, vị trí hiện tại không có, nên planner chèn một bước di chuyển vào trước. Một nửa hiệu quả còn lại là **sân khấu** — câu thoại "Bọc sườn nó!" phát đúng lúc đó; thiếu nó thì người chơi không nhận ra gì cả.
>
> Nhưng tôi chỉ dùng khi cả ba điều đúng: NPC có nhiều cách đạt cùng mục tiêu, tình huống thay đổi làm kịch bản cứng hỏng thường xuyên, và tôi chấp nhận mất khả năng gỡ lỗi. Trong thực tế tôi hay dùng **kiến trúc lai**: GOAP lo chiến lược, mỗi hành động là một subtree BT lo chiến thuật.

**Họ sẽ đào tiếp**

- *"Vì sao phần sân khấu lại quan trọng ngang phần AI?"* → Vì AI thông minh mà người chơi không đọc ra thì không tồn tại về mặt trải nghiệm. Người chơi chỉ thấy kẻ địch biến mất rồi xuất hiện ở sườn — không có gì phân biệt với việc nó đi lung tung. Lời thoại, hướng nhìn, và nhịp di chuyển là thứ biến một kế hoạch thành một hành vi đọc được.
- *"Gỡ lỗi GOAP thế nào cho đỡ khổ?"* → Ghi lại **kế hoạch đã chọn và các kế hoạch bị loại kèm chi phí**, rồi hiện lên màn hình debug. Không có nó thì không thể trả lời câu "vì sao nó lại đi ăn trong lúc đánh nhau". Đây là chi phí công cụ bắt buộc, giống bảng điểm của utility AI.
- *"GOAP và utility AI khác nhau thế nào?"* → GOAP tìm **chuỗi** hành động cho một mục tiêu; utility chọn **một** hành động tốt nhất ngay lúc này. GOAP mạnh khi cần nhiều bước phối hợp mới đạt được mục tiêu; utility mạnh khi có nhiều nhu cầu cạnh tranh và mỗi lúc chỉ cần chọn cái cấp bách nhất. Nhiều game dùng utility để **chọn goal**, rồi GOAP để đạt goal đó.
- *"Dùng AI để làm GOAP thế nào?"* → Giao cho nó việc **soát tập hành động**: có goal nào không thể đạt được từ trạng thái khởi đầu không, có hành động nào không bao giờ được chọn vì chi phí quá cao không, có vòng lặp tiền đề–hiệu quả nào không. Đó là phân tích đồ thị, máy làm tốt, và là chỗ lỗi thật hay nằm.

**Cờ đỏ**

- Chọn GOAP vì nó nghe hiện đại, không nói được ba điều kiện để nó đáng dùng.
- Không có công cụ xem kế hoạch đã chọn và các kế hoạch bị loại.
- Không giới hạn độ sâu tìm kiếm, rồi ngạc nhiên khi CPU tăng vọt ở cảnh đông.
- Bẻ chi phí để ép một hành vi mà không test lại các kịch bản cũ.
- Có AI lập kế hoạch tốt nhưng không có phần sân khấu nào để người chơi đọc ra.

**Số / ví dụ nên thuộc**

- **Jeff Orkin, F.E.A.R., 2005**; planner là **A\* trong không gian trạng thái**.
- Ba thành phần: **World State · Action (tiền đề/hiệu quả/chi phí) · Goal**.
- Ba điều kiện để dùng: nhiều cách đạt mục tiêu · kịch bản cứng hỏng thường xuyên · chấp nhận khó gỡ lỗi.
- Giới hạn thực dụng: độ sâu **3–5 hành động**, cache kế hoạch, trải qua nhiều frame.
- Cấu hình phổ biến nhất trong sản phẩm thật: **GOAP chiến lược + BT chiến thuật**.
