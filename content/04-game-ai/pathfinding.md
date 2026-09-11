---
title: Pathfinding
icon: 🧭
summary: A*, NavMesh, flow field, hierarchical — chọn đúng thuật toán tìm đường cho quy mô của bạn.
status: deep
read: 360
level: intermediate
order: 50
tags: [ai, algorithm, navigation]
related: [steering-flocking, level-design, goap]
---

Tìm đường là nền móng của mọi thứ biết di chuyển. Chọn sai thuật toán ở quy mô lớn là một trong những nguyên nhân tụt FPS phổ biến nhất.

## A* — mặc định

A* tìm đường ngắn nhất trên đồ thị bằng cách ưu tiên node có `f = g + h` nhỏ nhất, trong đó `g` là chi phí đã đi và `h` là ước lượng chi phí còn lại.

**Chọn heuristic đúng với dạng lưới** — đây là lỗi phổ biến nhất:

| Lưới | Heuristic đúng |
|---|---|
| Ô vuông, 4 hướng | Manhattan: `|dx| + |dy|` |
| Ô vuông, 8 hướng | Octile: `max(dx,dy) + 0.414 × min(dx,dy)` |
| Không gian liên tục | Euclid: `√(dx² + dy²)` |
| Lục giác | Khoảng cách hex |

Heuristic phải **không bao giờ ước lượng cao hơn** chi phí thật (tính chấp nhận được), nếu không A* trả về đường không tối ưu. Dùng Euclid trên lưới 4 hướng là lỗi này.

Mẹo thực dụng: nhân heuristic với 1.01–1.05 làm A* nhanh hơn đáng kể, đổi lại đường đi hơi dài hơn. Với game, gần như luôn là đánh đổi tốt.

## NavMesh — cho không gian 3D

Chia bề mặt đi được thành các đa giác lồi. Ưu điểm so với lưới ô vuông:

- Ít node hơn rất nhiều (một căn phòng lớn = 1 đa giác, thay vì 400 ô).
- Đường đi tự nhiên hơn, không bị "bậc thang".
- Xử lý được độ cao, dốc, và các liên kết đặc biệt (nhảy, thang, cửa).

Unity (`NavMeshAgent`), Unreal, Godot đều có sẵn. **Đừng tự viết NavMesh trừ khi có lý do đặc biệt** — đây là một trong số ít trường hợp dùng thư viện có sẵn gần như luôn đúng.

Sau khi A* trả về chuỗi đa giác, cần thêm bước **string pulling** (funnel algorithm) để chuyển thành đường thẳng mượt, thay vì đi qua tâm từng đa giác.

## Flow Field — cho số lượng lớn

Khi có hàng trăm đơn vị cùng đi về **một đích** (RTS, tower defense, game zombie):

1. Chạy BFS/Dijkstra **một lần** từ đích ra toàn bản đồ.
2. Mỗi ô lưu hướng đi tới ô tốt nhất kế tiếp.
3. Mọi đơn vị chỉ cần đọc ô mình đang đứng — độ phức tạp O(1).

Chi phí: một lần tính cho **toàn bộ** đơn vị, thay vì N lần A*. Với 500 đơn vị, chênh lệch là hai bậc độ lớn.

Giới hạn: chỉ hiệu quả khi nhiều đơn vị chung đích. Cần tính lại khi bản đồ thay đổi (nhưng vẫn rẻ hơn 500 lần A*).

## Hierarchical Pathfinding (HPA*)

Cho bản đồ rất lớn. Chia bản đồ thành cụm, tìm đường ở cấp cụm trước rồi mới tìm chi tiết trong cụm hiện tại.

Đường kết quả hơi dưới tối ưu, nhưng nhanh hơn hàng chục lần trên bản đồ lớn. Cách nghĩ: giống như người thật đi đường — bạn lên kế hoạch "đi quận 1 → quận 3" trước, chi tiết từng con hẻm tính sau.

## Bảng chọn nhanh

| Tình huống | Dùng |
|---|---|
| Vài NPC, lưới 2D | A* trên lưới |
| NPC trong không gian 3D | NavMesh có sẵn của engine |
| Hàng trăm đơn vị, chung đích | Flow field |
| Bản đồ rất lớn (>500×500) | HPA* |
| Bản đồ thay đổi liên tục | D* Lite hoặc tính lại flow field |
| Chỉ cần né chướng ngại gần | [[steering-flocking]], không cần pathfinding |

## Tối ưu bắt buộc khi có nhiều agent

- **Trải đều theo thời gian** — không cho phép nhiều agent tìm đường trong cùng một frame. Dùng hàng đợi, giới hạn N lần/frame.
- **Cache và chia sẻ** — nhiều agent cùng điểm đầu-cuối thì dùng lại đường.
- **Path following mượt** — A* cho ra đường gấp khúc; cần [[steering-flocking]] để đi theo nó một cách tự nhiên.
- **Tránh nhau cục bộ** — pathfinding không xử lý va chạm giữa các agent. Cần thêm RVO/ORCA hoặc lực đẩy đơn giản.
- **Đường đi một phần** — nếu không tới được đích, đi tới điểm gần nhất thay vì đứng im.

## 🤖 Prompt cho AI

Pathfinding có định nghĩa toán học rõ ràng nên AI viết chính xác. Điều cần nêu rõ là **ràng buộc hiệu năng và hành vi khi thất bại**:

```
Cài A* cho lưới 2D (C#, không phụ thuộc Unity).

- Lưới 200x200, 8 hướng, có chi phí địa hình (1.0 = thường, 2.5 = bùn, ∞ = tường)
- Heuristic octile, nhân 1.02
- Binary heap cho open set, HashSet cho closed set
- Object pool cho node — KHÔNG cấp phát trong vòng lặp tìm kiếm
- Giới hạn 2000 node mở rộng; vượt thì trả về đường tới node gần đích nhất
- API bất đồng bộ: FindPathAsync trả về qua callback, tối đa 4 lần tìm/frame
- Kèm unit test: đường thẳng, có tường, không có đường đi, vượt giới hạn node
```

Yêu cầu *"không cấp phát trong vòng lặp"* và *"trả về đường gần nhất khi thất bại"* là hai điều AI thường bỏ qua và là hai nguồn bug/giật lag phổ biến nhất trong thực tế.
