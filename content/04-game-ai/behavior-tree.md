---
title: Behavior Tree
icon: 🌳
summary: Cây hành vi — chuẩn công nghiệp cho AI NPC: cấu trúc node, blackboard, và cách tránh cây phình to.
status: deep
read: 340
level: intermediate
order: 20
tags: [ai, pattern, industry-standard]
related: [fsm, goap, utility-ai, combat-systems]
---

Behavior Tree (BT) là kiến trúc AI phổ biến nhất trong game thương mại — Halo 2 phổ biến hoá nó, và nay Unreal, Unity (qua các asset) đều hỗ trợ sẵn.

Ý tưởng cốt lõi: thay vì một đồ thị trạng thái với chuyển tiếp chằng chịt như [[fsm]], hành vi được tổ chức thành **cây ưu tiên**. Mỗi lượt (tick), cây được duyệt từ gốc; node đầu tiên chạy được sẽ chạy.

## Bốn loại node

**Composite** — có nhiều con:
- `Selector` (HOẶC) — chạy con lần lượt tới khi **một con thành công**. Thất bại nếu tất cả đều thất bại.
- `Sequence` (VÀ) — chạy con lần lượt tới khi **một con thất bại**. Thành công nếu tất cả đều thành công.
- `Parallel` — chạy nhiều con cùng lúc.

**Decorator** — có một con, biến đổi kết quả: `Inverter`, `Repeat`, `Cooldown`, `Succeeder`.

**Condition (lá)** — kiểm tra, trả về Success/Failure. Không làm gì cả.

**Action (lá)** — thực hiện, trả về Success/Failure/**Running**.

Trạng thái `Running` là điểm mấu chốt khiến BT mạnh hơn cây quyết định thường: một hành động kéo dài nhiều frame (đi tới điểm A) trả về `Running`, và cây sẽ tiếp tục từ đó ở tick sau.

## Cấu trúc điển hình

```
Selector (làm việc quan trọng nhất có thể làm được)
├── Sequence  "Chạy trốn"
│   ├── Condition: HP < 25%
│   ├── Condition: Tìm được chỗ nấp
│   └── Action:    Chạy tới chỗ nấp          [Running nhiều frame]
├── Sequence  "Tấn công"
│   ├── Condition: Thấy người chơi
│   ├── Condition: Trong tầm đánh
│   ├── Action:    Quay mặt về người chơi
│   └── Action:    Ra đòn
├── Sequence  "Truy đuổi"
│   ├── Condition: Thấy người chơi
│   └── Action:    Di chuyển tới người chơi   [Running]
└── Action    "Tuần tra"                      ← dự phòng, luôn chạy được
```

**Ưu tiên nằm ở thứ tự từ trên xuống.** Muốn đổi độ ưu tiên thì chỉ cần kéo nhánh lên/xuống — không phải sửa chuyển tiếp ở nơi khác. Đây chính là thứ FSM không làm được.

Luôn để một nhánh **dự phòng không điều kiện** ở cuối cùng. AI không có hành động hợp lệ sẽ đứng đờ ra — lỗi trông rất tệ.

## Blackboard

BT không nên lưu trạng thái trong node. Dữ liệu chung nằm ở **blackboard** — một từ điển key-value dùng chung cho agent:

```
blackboard = {
  "target":        <Transform>,
  "lastKnownPos":  Vector3,
  "threatLevel":   0.7,
  "coverPoint":    <Transform>,
  "timeSinceSeen": 2.3
}
```

Điều này tách **cảm nhận** ([[perception]] ghi vào blackboard) khỏi **quyết định** (BT đọc từ blackboard). Kiến trúc sạch và dễ kiểm thử: bạn có thể nạp blackboard giả để test cây.

## Cạm bẫy

**Cây phình to.** BT cũng có giới hạn của nó — quá 40–50 node thì không ai đọc nổi. Cách chữa: tách thành **subtree** tái sử dụng được (`CombatSubtree`, `FleeSubtree`) và tham chiếu chúng.

**Điều kiện tính lại quá nhiều lần.** Mỗi tick duyệt lại từ gốc → `CanSeePlayer()` có thể bị gọi nhiều lần. Cách chữa: cache kết quả perception vào blackboard **một lần mỗi tick**, BT chỉ đọc.

**Dao động (thrashing).** AI liên tục đổi ý giữa hai nhánh có ưu tiên gần nhau, dẫn đến giật cục. Cách chữa: thêm decorator `Cooldown`, hoặc dùng ngưỡng trễ (hysteresis) — ví dụ vào chế độ chạy trốn ở HP < 25% nhưng chỉ thoát ra khi HP > 40%.

**Không tick mỗi frame.** AI tick 5–10 lần/giây là đủ cho hầu hết trường hợp, và tiết kiệm CPU đáng kể khi có nhiều NPC. Trải đều tick của các agent qua các frame khác nhau.

## Khi nào không dùng BT

BT thể hiện **cách làm**, không thể hiện **vì sao**. Khi NPC cần tự tìm ra chuỗi hành động cho một mục tiêu chưa lường trước, hãy dùng [[goap]]. Khi có nhiều lựa chọn cạnh tranh cần chấm điểm liên tục (game mô phỏng), hãy dùng [[utility-ai]].

## 🤖 Prompt cho AI

Agent viết BT tốt nếu bạn đưa **cây đã vẽ sẵn**. Đừng để nó tự thiết kế cấu trúc ưu tiên — đó là quyết định thiết kế, không phải việc code.

```
Cài đặt Behavior Tree cho kẻ địch "Vệ binh" trong Godot 4 (GDScript).

Cây (ưu tiên từ trên xuống):
  Selector
    Sequence "Flee":   [HP<25%] -> [FindCover] -> [MoveTo(cover)]
    Sequence "Attack": [CanSee] -> [InRange(2.0)] -> [FaceTarget] -> [Melee]
    Sequence "Chase":  [CanSee] -> [MoveTo(target)]
    Action   "Patrol"

Ràng buộc:
- Node trả về enum {SUCCESS, FAILURE, RUNNING}
- Blackboard là Dictionary trên agent, node KHÔNG giữ state riêng
- Tick 10Hz, không tick trong _process
- Hysteresis cho Flee: vào ở HP<25%, thoát ở HP>40%
- Mỗi node một file trong res://ai/nodes/
```

Ràng buộc *hysteresis* và *node không giữ state* là hai thứ AI hay bỏ sót nhất nếu không nêu rõ.
