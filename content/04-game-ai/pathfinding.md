---
title: Pathfinding
icon: 🧭
summary: A*, NavMesh, flow field, hierarchical — chọn đúng thuật toán tìm đường cho quy mô của bạn.
status: deep
read: 460
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

## 🎮 Unity

Unity có NavMesh sẵn và nó tốt — **đừng tự viết A\* cho 3D** trừ khi có lý do đặc biệt.

**Component & nơi đặt**
- `NavMeshSurface` — trên một GameObject trong scene (cần package **AI Navigation**)
- `NavMeshAgent` — trên prefab NPC
- `PathRequestManager.cs` — singleton, giới hạn số lần tìm đường mỗi frame

**Setup NavMesh (Unity 2022+ / Unity 6)**

Từ Unity 2022, NavMesh tách thành package riêng: `Window > Package Manager > AI Navigation`. Component cũ `Navigation` trong menu Window đã bị bỏ.

1. Thêm `NavMeshSurface` vào một GameObject
2. Chọn `Collect Objects: All` hoặc theo layer
3. Bấm **Bake**
4. Với chỗ nhảy/thang: dùng `NavMeshLink`

**Thông số quan trọng trên NavMeshAgent**

```
Speed                4      m/s
Angular Speed        360    độ/giây — thấp quá thì NPC quay như xe tải
Acceleration         12     m/s²
Stopping Distance    1.5    ← đặt = tầm đánh, nếu không NPC dúi vào người chơi
Auto Braking         ✓      tắt nếu muốn đi mượt qua nhiều waypoint
Obstacle Avoidance   Quality: Good / Priority: 50 (random 30-70 mỗi NPC)
```

**`Priority` phải ngẫu nhiên hoá.** Nếu mọi agent cùng priority 50, chúng đùn nhau thành khối và kẹt. Random 30–70 lúc spawn là xong.

**Giới hạn số lần tìm đường mỗi frame**

Đây là nguyên nhân giật lag phổ biến nhất khi có nhiều NPC:

```csharp
public class PathRequestManager : MonoBehaviour {
    public static PathRequestManager I;
    readonly Queue<(NavMeshAgent agent, Vector3 dest)> queue = new();
    const int MaxPerFrame = 4;

    void Awake() => I = this;

    public void Request(NavMeshAgent a, Vector3 dest) => queue.Enqueue((a, dest));

    void Update() {
        for (int i = 0; i < MaxPerFrame && queue.Count > 0; i++) {
            var (agent, dest) = queue.Dequeue();
            if (agent != null && agent.isOnNavMesh) agent.SetDestination(dest);
        }
    }
}
```

**Hành vi khi thất bại — đừng để NPC đứng im**

```csharp
var path = new NavMeshPath();
agent.CalculatePath(dest, path);

if (path.status == NavMeshPathStatus.PathComplete) {
    agent.SetPath(path);
} else if (path.status == NavMeshPathStatus.PathPartial) {
    agent.SetPath(path);                      // đi được tới đâu hay tới đó
} else {
    // PathInvalid — tìm điểm hợp lệ gần nhất thay vì bỏ cuộc
    if (NavMesh.SamplePosition(dest, out var hit, 5f, NavMesh.AllAreas))
        agent.SetDestination(hit.position);
}
```

NPC đứng đờ ra vì không tìm được đường là lỗi trông tệ hơn nhiều so với đi tới chỗ gần đúng.

**Cho game 2D**

NavMesh của Unity là 3D. Với 2D có hai lựa chọn:
- Tự viết A* trên lưới (xem code mẫu ở tab Prompt cho AI) — thường đơn giản hơn cho 2D top-down
- Dùng NavMesh với collider xoay 90° — làm được nhưng gượng

**Kiểm tra nhanh**
- 30 NPC cùng đuổi người chơi: Profiler cho thấy Navigation < 1ms/frame?
- Chặn đường đích hoàn toàn: NPC đi tới điểm gần nhất chứ không đứng im?
- `agent.isOnNavMesh` được kiểm tra trước mọi `SetDestination` chứ?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **A* hoạt động thế nào? `f`, `g`, `h` là gì?**
  → A* duyệt đồ thị theo thứ tự `f = g + h`: `g` là chi phí **đã đi** từ điểm đầu, `h` là **ước lượng** chi phí còn lại tới đích. Node có `f` nhỏ nhất được mở trước. Toàn bộ chất lượng của A* nằm ở `h`: chọn đúng thì nhanh và tối ưu, chọn sai thì hoặc chậm, hoặc trả về đường không tối ưu.
- `Junior` **Chọn heuristic theo dạng lưới thế nào?**
  → Ô vuông 4 hướng → **Manhattan** `|dx| + |dy|`. Ô vuông 8 hướng → **Octile** `max(dx,dy) + 0,414 × min(dx,dy)`. Không gian liên tục → **Euclid**. Lục giác → khoảng cách hex. Dùng Euclid trên lưới 4 hướng là lỗi phổ biến nhất, vì nó **ước lượng thấp hơn** thực tế nên A* mở thừa rất nhiều node.
- `Junior` **Vì sao heuristic không được ước lượng cao hơn chi phí thật?**
  → Vì nếu vượt thì A* **mất tính tối ưu** — nó có thể trả về đường dài hơn đường ngắn nhất. Tính chất đó gọi là "chấp nhận được" (admissible). Mẹo thực dụng đi kèm: nhân heuristic với **1,01–1,05** làm A* nhanh hơn đáng kể, đổi lại đường hơi dài hơn — với game thì gần như luôn là đánh đổi tốt.
- `Mid` **Khi nào dùng NavMesh thay vì lưới ô vuông?**
  → Với không gian 3D, gần như luôn. NavMesh chia bề mặt đi được thành đa giác lồi nên **ít node hơn rất nhiều** — một căn phòng lớn là một đa giác thay vì 400 ô — đường đi tự nhiên hơn, và xử lý được độ cao, dốc, liên kết nhảy/thang. Và **đừng tự viết NavMesh** trừ khi có lý do đặc biệt.
- `Mid` **Sau khi A* trả về chuỗi đa giác NavMesh thì còn thiếu bước gì?**
  → **String pulling** (funnel algorithm): chuyển chuỗi đa giác thành đường thẳng mượt thay vì đi qua tâm từng đa giác. Thiếu bước này thì agent đi zigzag giữa các tâm đa giác, trông như đang say — và rất nhiều người đổ cho NavMesh trong khi lỗi nằm ở phần hậu xử lý.
- `Mid` **500 zombie cùng đuổi người chơi. Dùng gì?**
  → **Flow field**: chạy BFS/Dijkstra **một lần** từ đích ra toàn bản đồ, mỗi ô lưu hướng đi tốt nhất, rồi mọi đơn vị chỉ đọc ô mình đang đứng — O(1) cho mỗi agent. Với 500 đơn vị, chênh lệch so với 500 lần A* là hai bậc độ lớn. Giới hạn: chỉ hiệu quả khi nhiều đơn vị **chung đích**.
- `Senior` **Bản đồ 1000×1000 và agent phải đi xa. Anh chọn gì?**
  → **HPA\*** — chia bản đồ thành cụm, tìm đường ở cấp cụm trước rồi mới chi tiết trong cụm hiện tại. Đường hơi dưới tối ưu nhưng nhanh hơn hàng chục lần. Cách nghĩ giống người thật: lên kế hoạch "quận 1 → quận 3" trước, từng con hẻm tính sau — và cũng có nghĩa là không phải tính chi tiết phần đường chưa đi tới.
- `Senior` **Nhiều agent tìm đường làm tụt frame. Thứ tự tối ưu của anh?**
  → **Trải đều theo thời gian** trước tiên: hàng đợi, giới hạn N lần tìm đường mỗi frame — đây là thứ rẻ nhất và ăn nhất. Rồi **cache và chia sẻ** đường cho agent cùng điểm đầu–cuối. Rồi đổi thuật toán theo quy mô (flow field, HPA\*). Và luôn có **đường đi một phần**: không tới được đích thì đi tới điểm gần nhất, đừng đứng im.
- `Senior` **Pathfinding không giải quyết được chuyện gì?**
  → **Va chạm giữa các agent**. Nó cho biết đi đâu, không cho biết tránh nhau thế nào — cần thêm RVO/ORCA hoặc lực đẩy cục bộ. Nó cũng không lo phần đi theo đường cho mượt: A* cho ra đường gấp khúc, cần steering để bám theo tự nhiên. Lẫn hai tầng này là nguồn của cả hai lỗi kinh điển: tính lại đường mỗi frame, và agent kẹt trong ngõ cụt chữ U.

**Khung trả lời 60 giây** — "Anh chọn thuật toán tìm đường thế nào?"

> Theo **quy mô và hình dạng bài toán**, không theo độ nổi tiếng của thuật toán. Vài NPC trên lưới 2D thì A* là đủ. Không gian 3D thì dùng NavMesh có sẵn của engine — đây là một trong số ít trường hợp dùng thư viện gần như luôn đúng. Hàng trăm đơn vị cùng đích thì **flow field**: một lần Dijkstra cho toàn bản đồ, mỗi agent đọc O(1). Bản đồ rất lớn thì HPA\*.
>
> Với A*, chi tiết quyết định chất lượng là **heuristic khớp dạng lưới**: Manhattan cho 4 hướng, Octile cho 8 hướng, Euclid cho không gian liên tục. Và nó không được ước lượng cao hơn chi phí thật, nếu không đường trả về không còn tối ưu.
>
> Cuối cùng, dù chọn gì thì khi có nhiều agent cũng phải **trải đều theo thời gian** — hàng đợi, giới hạn số lần tìm đường mỗi frame. Đó là tối ưu rẻ nhất và cũng là thứ hay bị bỏ qua nhất.

**Họ sẽ đào tiếp**

- *"Vì sao Euclid trên lưới 4 hướng lại sai?"* → Vì trên lưới 4 hướng, khoảng cách thật luôn **lớn hơn hoặc bằng** Manhattan, còn Euclid thì nhỏ hơn — heuristic quá thấp nên A* vẫn đúng nhưng mở thừa rất nhiều node, mất phần lớn lợi thế so với Dijkstra. Sai theo chiều ngược lại (ước lượng cao) thì nhanh hơn nhưng mất tính tối ưu.
- *"Bản đồ thay đổi liên tục thì sao?"* → **D\* Lite** nếu là thay đổi cục bộ và cần đường tối ưu, hoặc **tính lại flow field** nếu nhiều đơn vị chung đích — tính lại toàn bản đồ vẫn rẻ hơn N lần A*. Điều cần tránh là tính lại đường cho mọi agent mỗi khi có một cánh cửa đóng lại.
- *"Agent kẹt ở ngõ cụt chữ U — lỗi ở tầng nào?"* → Ở tầng steering đang làm việc của pathfinding. Steering chỉ nhìn cục bộ nên không thoát được hình chữ U; pathfinding nhìn toàn cục thì có. Phân vai đúng là **pathfinding lo cấu trúc tĩnh, steering lo mọi thứ động**.
- *"Dùng AI để làm phần này thế nào?"* → Nó viết A*, funnel và flow field rất chuẩn vì đó là thuật toán sách giáo khoa. Việc đáng giao hơn là **sinh bộ test bản đồ khó**: ngõ cụt, hành lang một chiều, cầu hẹp, khu vực không tới được — rồi khẳng định agent không kẹt. Phần đó tẻ nhạt và là chỗ lỗi thật hay nằm.

**Cờ đỏ**

- Dùng một heuristic cho mọi dạng lưới.
- Tự viết NavMesh mà không có lý do đặc biệt.
- Tính lại đường mỗi frame, hoặc cho mọi agent tìm đường trong cùng một frame.
- Dùng A* cho 500 đơn vị cùng đích thay vì flow field.
- Không có phương án khi đích không tới được — agent đứng im.

**Số / ví dụ nên thuộc**

- `f = g + h`; heuristic phải **không ước lượng cao hơn** chi phí thật.
- Manhattan (4 hướng) · **Octile** `max + 0,414 × min` (8 hướng) · Euclid (liên tục).
- Nhân heuristic **1,01–1,05** để nhanh hơn, đổi lấy đường hơi dài.
- Flow field: **một** lần Dijkstra cho **mọi** agent; 500 đơn vị ≈ chênh hai bậc độ lớn.
- Sau A* trên NavMesh phải có **string pulling (funnel)**.
