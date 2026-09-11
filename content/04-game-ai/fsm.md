---
title: Finite State Machine
icon: 🔄
summary: Máy trạng thái hữu hạn — kiến trúc AI đơn giản nhất, đủ dùng cho phần lớn kẻ địch nhỏ, và giới hạn của nó.
status: deep
read: 330
level: intermediate
order: 10
tags: [ai, pattern, fundamentals]
related: [behavior-tree, combat-systems, perception]
---

FSM là kiến trúc AI đơn giản nhất: NPC luôn ở **đúng một trạng thái**, và chuyển sang trạng thái khác khi điều kiện thoả mãn.

```
      thấy người chơi          trong tầm đánh
IDLE ──────────────────> CHASE ──────────────> ATTACK
  ^                        │                      │
  │   mất dấu 3s           │      ra khỏi tầm     │
  └────────────────────────┴──────────────────────┘
```

## Cài đặt tối thiểu

```csharp
public abstract class State {
    public virtual void Enter(Agent a) { }
    public abstract State Update(Agent a, float dt);   // trả về state kế tiếp, hoặc this
    public virtual void Exit(Agent a) { }
}

public class ChaseState : State {
    public override void Enter(Agent a) => a.anim.Play("run");

    public override State Update(Agent a, float dt) {
        if (!a.CanSeePlayer() && a.timeSinceSeen > 3f) return new IdleState();
        if (a.DistanceToPlayer() < a.attackRange)      return new AttackState();
        a.MoveTowards(a.player.position, dt);
        return this;
    }
}
```

Ba phương thức `Enter`/`Update`/`Exit` là toàn bộ cấu trúc. `Enter` để bật animation và khởi tạo; `Exit` để dọn dẹp (quan trọng — quên dọn là nguồn bug phổ biến nhất của FSM).

## Vì sao FSM vẫn đáng dùng

- **Dễ gỡ lỗi** — in ra tên trạng thái hiện tại là biết ngay AI đang nghĩ gì. Không kiến trúc nào khác dễ chẩn đoán bằng.
- **Tất định** — cùng đầu vào cho cùng hành vi. Tái hiện bug dễ.
- **Rẻ** — vài chục dòng, không phụ thuộc thư viện.
- **Đủ dùng** — phần lớn kẻ địch nhỏ trong game 2D/indie chỉ cần 3–5 trạng thái.

Đừng bỏ qua FSM vì nó "đơn giản". Rất nhiều game thương mại dùng FSM cho kẻ địch thường và chỉ dùng [[behavior-tree]] cho boss.

## Giới hạn: bùng nổ chuyển tiếp

Vấn đề chí mạng là số cạnh tăng theo **bình phương** số trạng thái. 5 trạng thái → tối đa 20 chuyển tiếp, còn quản được. 12 trạng thái → 132 chuyển tiếp, không ai bảo trì nổi.

Triệu chứng cho thấy bạn đã vượt giới hạn của FSM:
- Thêm một trạng thái mới phải sửa 6 trạng thái cũ.
- Xuất hiện cờ kiểu `wasAttackingBeforeStun` để nhớ nên quay về đâu.
- Cùng một logic (ví dụ "kiểm tra máu thấp") lặp lại ở nhiều trạng thái.

Khi thấy các dấu hiệu trên → chuyển sang [[behavior-tree]].

## Hierarchical FSM — bước đệm

Trước khi bỏ hẳn FSM, có thể nhóm trạng thái thành cụm:

```
COMBAT (siêu trạng thái)
  ├── Approach
  ├── Strafe
  └── Attack
FLEE (siêu trạng thái)
  ├── FindCover
  └── Heal
```

Chuyển tiếp "máu < 20% → FLEE" chỉ cần khai báo **một lần ở cấp cha** thay vì ở từng trạng thái con. Cách này kéo dài tuổi thọ của FSM thêm đáng kể và là bước chuyển tự nhiên sang Behavior Tree.

## 🤖 Prompt cho AI

Đây là việc agent làm rất tốt, vì cấu trúc rõ ràng và kiểm tra được. Prompt hiệu quả cần **bảng chuyển tiếp đầy đủ**, không chỉ mô tả bằng lời:

```
Viết FSM cho kẻ địch "Cung thủ" trong Unity C#.

Trạng thái: Patrol, Alert, Aim, Shoot, Reposition, Flee

Bảng chuyển tiếp:
  Patrol     -> Alert       khi CanSeePlayer()
  Alert      -> Aim         sau 0.4s (thời gian phản ứng)
  Aim        -> Shoot       sau 0.8s (telegraph)
  Shoot      -> Reposition  luôn luôn, sau khi bắn
  Reposition -> Aim         khi đã tới vị trí mới và còn thấy player
  Reposition -> Patrol      khi mất dấu > 4s
  BẤT KỲ    -> Flee        khi hp < 25%

Ràng buộc:
- Mỗi state là một class riêng, kế thừa State
- Enter/Update/Exit; Exit phải huỷ mọi coroutine đã bật
- Không gọi GetComponent trong Update
- Mọi hằng số thời gian đưa vào một ScriptableObject config
```

Dòng `BẤT KỲ -> Flee` là chỗ nên cân nhắc chuyển thẳng sang Hierarchical FSM — nếu bạn có hơn hai luật kiểu "từ bất kỳ đâu", FSM phẳng đã hết đất dùng.
