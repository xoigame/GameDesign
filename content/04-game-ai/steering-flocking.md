---
title: Steering & Flocking
icon: 🐦
summary: Chuyển động mượt và hành vi bầy đàn — seek, flee, arrive, separation, và ba luật của Boids.
status: stub
read: 470
level: advanced
order: 90
tags: [ai, movement]
related: [pathfinding, ai-director]
---

Pathfinding cho biết **đi đâu**. Steering cho biết **đi như thế nào** — mượt, tự nhiên, biết né nhau.

## Cần bồi đắp

- [ ] Các hành vi cơ bản: Seek, Flee, Arrive, Pursue, Evade, Wander
- [ ] Kết hợp có trọng số vs ưu tiên có chặn
- [ ] Boids: separation, alignment, cohesion
- [ ] Tránh va chạm cục bộ: RVO / ORCA
- [ ] Context steering (bản đồ ngữ cảnh) — cách tiếp cận hiện đại hơn

## Ghi chú tạm

**Ba luật của Boids** (Craig Reynolds, 1986) tạo ra hành vi bầy đàn thuyết phục chỉ với vài dòng:

```
separation : tránh va vào đồng loại ở quá gần
alignment  : hướng theo vận tốc trung bình của nhóm
cohesion   : hướng về tâm của nhóm
```

Kết hợp có trọng số; trọng số chính là chỗ điều chỉnh cảm giác — đàn chim, đàn cá, bầy zombie đều là cùng thuật toán với bộ trọng số khác nhau.

**Arrive quan trọng hơn Seek.** Seek thuần khiến agent chạy quá đích rồi quay lại, dao động mãi. Arrive giảm tốc trong bán kính hãm:

```
tốc_độ_mong_muốn = tốc_độ_tối_đa × min(1, khoảng_cách / bán_kính_hãm)
```

Chi tiết nhỏ này là khác biệt giữa chuyển động trông như robot và chuyển động trông tự nhiên.

**Context steering** đáng tìm hiểu nếu bạn gặp vấn đề với việc kết hợp trọng số: thay vì cộng các vector, agent chấm điểm mọi hướng đi quanh mình rồi chọn hướng tốt nhất. Xử lý ngõ cụt tốt hơn hẳn và về bản chất là [[utility-ai]] áp dụng cho chuyển động.

## 🤖 Prompt cho AI

Steering là toán vector thuần — AI viết chính xác. Vấn đề nằm ở **cảm giác chuyển động**, và đó là thứ phải đưa bằng số.

**Phải nêu rõ:**
- Danh sách hành vi cần và trọng số khởi điểm
- Bán kính hãm (Arrive) — thiếu cái này agent sẽ dao động quanh đích
- Cách kết hợp: trọng số hay ưu tiên có chặn
- Giới hạn vật lý: tốc độ tối đa, gia tốc tối đa, tốc độ quay tối đa

**Mẫu prompt**

```
Hệ thống steering cho bầy 60 con.

Hành vi + trọng số khởi điểm (đưa hết vào file config, KHÔNG hardcode):
  seek        1.0
  separation  1.8   (bán kính 1.2m)
  alignment   0.6
  cohesion    0.4
  avoidObstacle 2.5 (ưu tiên có chặn: nếu kích hoạt thì bỏ qua phần còn lại)

Bắt buộc dùng ARRIVE, không dùng Seek thuần:
  tốc_độ_mong_muốn = tốc_độ_tối_đa * min(1, khoảng_cách / bán_kính_hãm)
  bán_kính_hãm = 2.5m

Giới hạn: tốc độ tối đa 6 m/s, gia tốc 12 m/s², quay tối đa 240 độ/s.

Hiệu năng: 60 agent trong 1ms. Dùng spatial hash cho truy vấn lân cận,
KHÔNG lặp O(n²).
```

**Bẫy thường gặp:** dùng Seek thuần → agent chạy quá đích rồi quay lại, rung mãi. Luôn nêu Arrive và bán kính hãm.

## 🎮 Unity

Steering trong Unity thường nằm **giữa** pathfinding và Rigidbody. Điểm khó là đừng để nó đánh nhau với `NavMeshAgent`.

**Component & nơi đặt**
- `Steering.cs` — tính vector, C# thuần được
- `Boid.cs` — MonoBehaviour, áp lực lên `Rigidbody`/`CharacterController`
- `SteeringConfig` (ScriptableObject) — trọng số từng hành vi

**Code**

```csharp
public static class Steering {
    // Arrive: giảm tốc trong bán kính hãm. KHÔNG dùng Seek thuần —
    // agent sẽ chạy quá đích rồi rung quanh nó mãi.
    public static Vector3 Arrive(Vector3 pos, Vector3 target, Vector3 vel,
                                 float maxSpeed, float slowRadius) {
        Vector3 toTarget = target - pos;
        float dist = toTarget.magnitude;
        if (dist < 0.01f) return -vel;
        float desiredSpeed = maxSpeed * Mathf.Min(1f, dist / slowRadius);
        return toTarget / dist * desiredSpeed - vel;
    }

    public static Vector3 Separation(Vector3 pos, IReadOnlyList<Vector3> neighbours, float radius) {
        Vector3 force = Vector3.zero;
        foreach (var n in neighbours) {
            Vector3 away = pos - n;
            float d = away.magnitude;
            if (d > 0.001f && d < radius) force += away / (d * d);   // càng gần càng mạnh
        }
        return force;
    }
}
```

**Truy vấn lân cận — đừng lặp O(n²)**

```csharp
// 60 boid × 60 = 3600 phép so sánh mỗi tick. Dùng spatial hash hoặc:
readonly Collider[] buf = new Collider[16];
int n = Physics.OverlapSphereNonAlloc(transform.position, cfg.neighbourRadius,
                                      buf, cfg.boidMask);
```

`OverlapSphereNonAlloc` dùng buffer có sẵn, không cấp phát. Bản `OverlapSphere` (không `NonAlloc`) tạo mảng mới mỗi lần gọi.

**Đừng trộn với NavMeshAgent một cách ngây thơ**

`NavMeshAgent` đã tự điều khiển vị trí. Muốn thêm steering thì:

```csharp
agent.updatePosition = false;        // tắt điều khiển vị trí của agent
agent.updateRotation = false;
// lấy hướng gợi ý từ agent, cộng thêm lực steering, tự di chuyển
Vector3 desired = agent.desiredVelocity + separationForce;
controller.Move(desired * Time.deltaTime);
agent.nextPosition = transform.position;   // đồng bộ lại cho agent
```

Quên `agent.nextPosition` là nguồn bug "NPC giật về chỗ cũ".

**Bẫy Unity cụ thể**
- **Seek thuần thay vì Arrive** — agent rung quanh đích. Lỗi phổ biến nhất.
- **`OverlapSphere` không NonAlloc** trong `Update` — cấp phát mỗi frame mỗi boid.
- **Trọng số cộng thẳng** khi có chướng ngại: lực tránh phải **ưu tiên có chặn**, không cộng, nếu không boid đi xuyên tường.

**Kiểm tra nhanh**
- 60 boid: Profiler dưới 1ms, GC Alloc 0 B?
- Cho đàn đi tới một điểm: chúng dừng gọn hay rung quanh đích?
- Thả một bức tường vào giữa: có con nào đi xuyên không?
