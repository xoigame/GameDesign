---
title: Steering & Flocking
icon: 🐦
summary: Chuyển động mượt và hành vi bầy đàn — seek, flee, arrive, separation, và ba luật của Boids.
status: deep
read: 470
level: advanced
order: 90
tags: [ai, movement]
related: [pathfinding, ai-director]
---

Pathfinding cho biết **đi đâu**. Steering cho biết **đi như thế nào** — mượt, tự nhiên, biết né nhau.

Hai tầng này hay bị lẫn, và lẫn chúng gây ra hai lỗi đối xứng: dùng pathfinding cho việc né nhau trong tầm gần (tính lại đường mỗi khi có kẻ địch nhích một bước — rất đắt), hoặc dùng steering để đi đường dài (agent kẹt trong mọi ngõ cụt hình chữ U). Quy tắc phân vai: **pathfinding cho cấu trúc bản đồ, steering cho mọi thứ động.**

## Bộ hành vi cơ bản

Toàn bộ mảng này xây từ một ý tưởng duy nhất: mỗi hành vi trả về một **vector vận tốc mong muốn**, rồi lực lái là hiệu giữa nó và vận tốc hiện tại.

| Hành vi | Làm gì | Dùng khi |
|---|---|---|
| **Seek** | lao thẳng tới một điểm | nền của mọi thứ khác |
| **Flee** | ngược lại Seek | chạy trốn, né vùng nguy hiểm |
| **Arrive** | Seek có giảm tốc khi tới gần | **mặc định nên dùng thay Seek** |
| **Pursue** | Seek tới vị trí **dự đoán** của mục tiêu | đuổi mục tiêu đang di chuyển |
| **Evade** | ngược lại Pursue | trốn kẻ đang đuổi |
| **Wander** | đi lang thang có hướng, không giật cục | NPC nhàn rỗi, động vật |

Pursue chỉ khác Seek một dòng nhưng đổi hẳn cảm giác: thay vì nhắm vào chỗ mục tiêu **đang** ở, nhắm vào chỗ nó **sẽ** ở sau `khoảng_cách / tốc_độ` giây. Kẻ địch dùng Seek trông như đang chạy theo đuôi; dùng Pursue trông như đang chặn đầu.

Wander thì có một cái bẫy: random hướng mỗi frame cho ra chuyển động giật như bị điện. Cách đúng là giữ một điểm mục tiêu trên vòng tròn phía trước agent và **xê dịch nó từ từ** — hướng đổi mượt vì nó có quán tính.

## Arrive quan trọng hơn Seek

Seek thuần khiến agent chạy quá đích rồi quay lại, dao động mãi. Arrive giảm tốc trong bán kính hãm:

```
tốc_độ_mong_muốn = tốc_độ_tối_đa × min(1, khoảng_cách / bán_kính_hãm)
```

Chi tiết nhỏ này là khác biệt giữa chuyển động trông như robot và chuyển động trông tự nhiên.

Bán kính hãm hợp lý là **2–3 lần bán kính agent** cho NPC đi bộ, lớn hơn nhiều cho xe cộ hoặc tàu. Nếu thấy agent vẫn rung quanh đích, thủ phạm gần như luôn là một trong hai: bán kính hãm quá nhỏ so với tốc độ tối đa, hoặc thiếu một **bán kính dừng hẳn** — một vùng nhỏ quanh đích mà trong đó vận tốc mong muốn bằng 0.

## Ba luật của Boids

**Ba luật của Boids** (Craig Reynolds, 1986) tạo ra hành vi bầy đàn thuyết phục chỉ với vài dòng:

```
separation : tránh va vào đồng loại ở quá gần
alignment  : hướng theo vận tốc trung bình của nhóm
cohesion   : hướng về tâm của nhóm
```

Kết hợp có trọng số; trọng số chính là chỗ điều chỉnh cảm giác — đàn chim, đàn cá, bầy zombie đều là cùng thuật toán với bộ trọng số khác nhau.

Vài điểm thực chiến ít được nói tới:

- **Separation nên có trọng số cao nhất**, thường gấp mấy lần hai luật kia. Đàn tách rời trông vẫn ổn; đàn chồng lên nhau thì hỏng ngay lập tức.
- **Ba luật dùng ba bán kính khác nhau.** Separation bán kính nhỏ nhất, cohesion lớn nhất. Dùng chung một bán kính cho cả ba là lý do phổ biến khiến đàn "thở" phập phồng.
- **Giới hạn số láng giềng xét tới.** Lấy 6–8 con gần nhất là đủ để trông đúng, và nó biến chi phí từ bình phương thành tuyến tính. Đây là tối ưu hoá có tác động lớn nhất trong mảng này.
- **Bầy đàn thuần tuý không có mục tiêu.** Muốn đàn đi đâu đó, thêm một lực Seek yếu về phía mục tiêu — nhưng giữ nó yếu, nếu không cả đàn biến thành một mũi tên.

## Kết hợp: cộng trọng số hay ưu tiên có chặn

Có nhiều hành vi cùng lúc thì gộp thế nào? Ba cách, và cách phổ biến nhất lại là cách hỏng nhiều nhất.

<figure class="fig">
<svg viewBox="0 0 660 244" role="img" aria-label="So sánh cộng trọng số bị triệt tiêu lực và context steering chấm điểm từng hướng">
  <text x="160" y="26" text-anchor="middle" class="fig-label" font-size="12">Cộng trọng số — bài toán triệt tiêu</text>
  <circle cx="160" cy="122" r="14" class="fig-box"/>
  <text x="160" y="127" text-anchor="middle" class="fig-muted" font-size="10">AI</text>
  <path d="M176 122 L252 122" stroke="#51cf9b" stroke-width="2.5" fill="none"/>
  <path d="M246 117 L258 122 L246 127 Z" fill="#51cf9b"/>
  <text x="264" y="118" font-size="10" fill="#51cf9b">seek mục tiêu</text>
  <path d="M144 122 L68 122" stroke="#ff8787" stroke-width="2.5" fill="none"/>
  <path d="M74 117 L62 122 L74 127 Z" fill="#ff8787"/>
  <text x="58" y="112" text-anchor="end" font-size="10" fill="#ff8787">né tường</text>
  <rect x="284" y="74" width="14" height="96" rx="2" class="fig-box"/>
  <text x="160" y="170" text-anchor="middle" font-size="11" fill="#ff8787">tổng = 0 → agent ĐỨNG IM</text>
  <text x="160" y="192" text-anchor="middle" class="fig-muted" font-size="10">hai lực mạnh ngang nhau triệt tiêu,</text>
  <text x="160" y="208" text-anchor="middle" class="fig-muted" font-size="10">dù đi vòng lên trên là lối thoát rõ ràng</text>
  <line x1="330" y1="30" x2="330" y2="214" class="fig-line"/>
  <text x="496" y="26" text-anchor="middle" class="fig-label" font-size="12">Context steering — chấm điểm từng hướng</text>
  <circle cx="496" cy="122" r="14" class="fig-box"/>
  <text x="496" y="127" text-anchor="middle" class="fig-muted" font-size="10">AI</text>
  <circle cx="496" cy="122" r="58" stroke="#6b7488" stroke-width="1" stroke-dasharray="3 3" fill="none"/>
  <path d="M496 122 L554 122" stroke="#ff8787" stroke-width="2" fill="none"/>
  <path d="M496 122 L537 81" stroke="#ffd43b" stroke-width="2" fill="none"/>
  <path d="M496 122 L496 64" stroke="#51cf9b" stroke-width="3" fill="none"/>
  <path d="M491 70 L496 58 L501 70 Z" fill="#51cf9b"/>
  <path d="M496 122 L455 81" stroke="#ffd43b" stroke-width="2" fill="none"/>
  <path d="M496 122 L438 122" stroke="#6b7488" stroke-width="2" fill="none"/>
  <path d="M496 122 L455 163" stroke="#6b7488" stroke-width="2" fill="none"/>
  <path d="M496 122 L496 180" stroke="#6b7488" stroke-width="2" fill="none"/>
  <path d="M496 122 L537 163" stroke="#6b7488" stroke-width="2" fill="none"/>
  <rect x="570" y="74" width="14" height="96" rx="2" class="fig-box"/>
  <text x="496" y="204" text-anchor="middle" font-size="11" fill="#51cf9b">chọn hướng điểm cao nhất → đi vòng lên</text>
  <text x="496" y="222" text-anchor="middle" class="fig-muted" font-size="10">không vector nào bị triệt tiêu, vì không có phép cộng</text>
</svg>
<figcaption>Triệt tiêu lực là lý do phổ biến nhất khiến agent đứng rung trước chướng ngại. Context steering tránh hẳn vấn đề bằng cách không cộng vector.</figcaption>
</figure>

| Cách gộp | Ý tưởng | Ưu | Nhược |
|---|---|---|---|
| **Cộng trọng số** | tổng các vector nhân hệ số | đơn giản, một dòng | triệt tiêu lực; chỉnh trọng số là trò may rủi |
| **Ưu tiên có chặn** | xét theo thứ tự, dùng cái đầu tiên đủ mạnh | không triệt tiêu | hành vi giật khi đổi ưu tiên |
| **Context steering** | chấm điểm mọi hướng, chọn hướng tốt nhất | xử lý ngõ cụt tốt, dễ gỡ lỗi | tốn hơn, phải nghĩ theo kiểu khác |

Ưu tiên có chặn là lựa chọn thực dụng nhất cho phần lớn game: sắp hành vi theo thứ tự khẩn cấp (né va chạm → né vực → đuổi mục tiêu → bầy đàn), lấy hành vi đầu tiên tạo ra lực đủ lớn. Nó không tối ưu nhưng **gỡ lỗi được** — bạn luôn biết hành vi nào đang lái.

## Context steering

**Context steering** đáng tìm hiểu nếu bạn gặp vấn đề với việc kết hợp trọng số: thay vì cộng các vector, agent chấm điểm mọi hướng đi quanh mình rồi chọn hướng tốt nhất. Xử lý ngõ cụt tốt hơn hẳn và về bản chất là [[utility-ai]] áp dụng cho chuyển động.

Cách làm cụ thể:

1. Chia vòng quanh agent thành **8–16 hướng** (8 là đủ cho phần lớn game).
2. Mỗi hành vi ghi vào **hai mảng**: `interest` (hướng này tốt tới đâu) và `danger` (hướng này nguy hiểm tới đâu).
3. Ở mỗi hướng, xoá `interest` nếu `danger` vượt ngưỡng.
4. Chọn hướng còn lại có `interest` cao nhất, nội suy với hai hướng kề để ra vector mượt.

Ba lợi ích thực tế, ngoài chuyện không bị triệt tiêu:

- **Gỡ lỗi bằng mắt.** Vẽ hai mảng thành hình sao quanh agent là thấy ngay nó đang "nghĩ" gì. Với vector cộng trọng số, bạn chỉ thấy một mũi tên và không biết nó được tạo ra thế nào.
- **Thêm hành vi không phá hành vi cũ.** Hành vi mới chỉ ghi thêm vào hai mảng, không cần chỉnh lại toàn bộ bộ trọng số.
- **Quán tính miễn phí.** Cộng một lượng nhỏ `interest` cho hướng đang đi là hết hiện tượng rung qua rung lại giữa hai hướng điểm gần bằng nhau.

## Tránh va chạm cục bộ: khi nào cần RVO

Với vài agent, separation là đủ. Với đám đông đi ngược chiều nhau, nó không đủ: hai agent cùng né sang một bên rồi lại chặn nhau, lặp mãi — hiện tượng "điệu nhảy hành lang".

**RVO / ORCA** giải quyết bằng cách cho mỗi agent giả định đối phương **cũng đang né**, nên mỗi bên chỉ né một nửa và lời giải hội tụ. Đây là thuật toán đứng sau đám đông mượt mà trong nhiều game chiến thuật.

Khi nào đáng dùng:

| Tình huống | Đủ dùng |
|---|---|
| Dưới 10 agent, không gian rộng | separation |
| Agent đi cùng hướng (bầy đàn) | Boids đầy đủ |
| Đám đông đi ngược chiều, hành lang hẹp | **RVO / ORCA** |
| Hàng trăm agent, cần hiệu năng | flow field — xem [[pathfinding]] |

Đừng bắt đầu bằng RVO. Nó thêm một lớp phức tạp đáng kể, và phần lớn game không bao giờ gặp tình huống cần tới nó.

## Kiểm tra nhanh

- Agent có rung quanh đích không? (thiếu Arrive hoặc thiếu bán kính dừng)
- Đặt một bức tường giữa agent và mục tiêu: nó đứng im hay đi vòng? (đứng im = triệt tiêu lực)
- Cho hai nhóm agent đi ngược chiều nhau trong hành lang hẹp: có kẹt không?
- Wander có giật cục không? (random mỗi frame thay vì xê dịch điểm mục tiêu)
- Ba luật Boids có dùng ba bán kính khác nhau không?
- Số láng giềng mỗi agent xét tới là bao nhiêu? (nên giới hạn 6–8)
- Nhìn vào một agent bất kỳ: bạn nói được **hành vi nào đang lái** nó không?

## 🤖 Prompt cho AI

Steering là mảng AI viết code khá đúng về công thức nhưng hay sai về **cách gộp** — và cách gộp mới là chỗ quyết định cảm giác.

**Dùng AI thế nào cho steering**

Công thức steering là kiến thức chuẩn hoá, có từ 1986, nên AI viết chính xác. Chỗ nó sai có hệ thống là ba điều: gộp bằng cộng trọng số vì đó là cách ngắn nhất, bỏ Arrive dùng Seek thuần, và không giới hạn số láng giềng trong Boids.

Vì vậy cách dùng hiệu quả là **giao kiến trúc gộp trước, giao hành vi sau** — ngược với thứ tự tự nhiên.

| Bước | Giao gì | Vì sao |
|---|---|---|
| 1 | Cơ chế gộp (ưu tiên hoặc context) | quyết định mọi thứ sau đó; sửa muộn là viết lại |
| 2 | Từng hành vi, mỗi cái một hàm thuần | dễ test riêng, dễ vẽ ra để gỡ lỗi |
| 3 | Công cụ vẽ vector | không nhìn được thì không chỉnh được |
| 4 | Tham số ra dữ liệu ngoài | trọng số phải chỉnh lúc đang chạy |

Việc **không** nên giao: chỉnh trọng số. Không có cách nào chỉnh chúng đúng ngoài việc nhìn và cảm nhận — đó là lý do bước 3 quan trọng hơn vẻ ngoài của nó.

**Phải nêu rõ:**
- Cơ chế gộp: **cộng trọng số / ưu tiên có chặn / context steering** — chọn một và nói rõ
- Dùng Arrive hay Seek (mặc định nên là Arrive), bán kính hãm và bán kính dừng
- Boids: ba bán kính riêng, giới hạn số láng giềng
- Ranh giới với [[pathfinding]]: steering **không** được dùng để đi đường dài
- Cần công cụ vẽ vector để gỡ lỗi

**Mẫu prompt**

```
Viết hệ thống steering cho kẻ địch bay theo đàn. Ràng buộc:

1. Cơ chế gộp: CONTEXT STEERING, 16 hướng, hai mảng interest/danger.
   KHÔNG cộng vector có trọng số — tôi đã gặp bài toán triệt tiêu lực.
2. Hành vi cần có, mỗi cái là một hàm thuần ghi vào hai mảng đó:
   - Arrive tới mục tiêu (bán kính hãm 3m, bán kính dừng 0.5m)
   - Separation (bán kính 2m, trọng số cao nhất)
   - Alignment (bán kính 6m)
   - Cohesion (bán kính 10m)
   - Né chướng ngại (ghi vào danger, raycast 5 hướng phía trước)
3. Mỗi agent chỉ xét 8 láng giềng gần nhất. Dùng lưới không gian, KHÔNG
   duyệt toàn bộ đàn.
4. Cộng interest nhẹ cho hướng đang đi (quán tính, chống rung).
5. Đường đi dài do NavMesh lo — steering CHỈ xử lý tầm gần và vật thể động.

Kèm một component Gizmos vẽ hai mảng interest/danger thành hình sao
quanh agent được chọn, để tôi nhìn thấy nó đang "nghĩ" gì.

Mọi bán kính và trọng số phơi ra ScriptableObject.
```

**Bẫy thường gặp:** AI gộp bằng cộng trọng số dù bạn không yêu cầu, vì đó là cách ngắn nhất và xuất hiện nhiều nhất trong tài liệu. Kết quả trông ổn cho tới khi agent gặp tường vuông góc với mục tiêu và đứng rung tại chỗ. Bẫy thứ hai: Boids duyệt toàn bộ đàn để tìm láng giềng — chạy được với 20 con, sập với 200. Hãy nêu rõ cấu trúc không gian ngay trong đầu bài.

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

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Steering khác pathfinding thế nào?**
  → Pathfinding cho biết **đi đâu**, steering cho biết **đi như thế nào**. Phân vai: pathfinding lo cấu trúc tĩnh của bản đồ, steering lo mọi thứ động. Lẫn hai tầng gây hai lỗi đối xứng — tính lại đường mỗi khi địch nhích một bước thì rất đắt, còn dùng steering đi đường dài thì kẹt trong mọi ngõ cụt hình chữ U.
- `Junior` **Ba luật của Boids là gì?**
  → Separation (tránh chồng lên hàng xóm), alignment (quay cùng hướng với hàng xóm), cohesion (hướng về trọng tâm hàng xóm) — Craig Reynolds, 1986. Điểm hay bị bỏ qua: mỗi luật cần **bán kính riêng** — separation nhỏ nhất, cohesion lớn nhất — và separation phải có trọng số cao hơn hẳn.
- `Junior` **Vì sao Arrive quan trọng hơn Seek?**
  → Seek thuần làm agent chạy quá đích rồi quay lại, dao động mãi không dừng. Arrive giảm tốc tuyến tính trong bán kính hãm, thường 2–3 lần bán kính agent. Nếu vẫn rung thì thiếu **bán kính dừng hẳn** — một vùng nhỏ quanh đích mà trong đó vận tốc mong muốn bằng không.
- `Mid` **Agent đứng rung trước một bức tường. Nguyên nhân?**
  → Gần như chắc chắn là **triệt tiêu lực** do gộp bằng cộng trọng số: seek đẩy tới, né tường đẩy ngược, hai vector mạnh ngang nhau nên tổng bằng không — dù đi vòng lên trên là lối thoát hiển nhiên. Phép cộng vector không biết điều đó, vì thông tin về các hướng khác đã mất ngay khi cộng.
- `Mid` **Ba luật Boids dùng chung một bán kính được không?**
  → Không nên — đó là lý do phổ biến khiến đàn "thở" phập phồng: cohesion kéo vào rồi separation đẩy ra ở cùng một khoảng cách. Separation bán kính nhỏ nhất, cohesion lớn nhất. Và cho separation trọng số cao hơn: đàn hơi tách rời trông vẫn ổn, đàn chồng lên nhau thì hỏng ngay.
- `Mid` **Wander giật cục thì sửa thế nào?**
  → Giật cục nghĩa là đang random hướng mỗi frame. Cách đúng là giữ một điểm mục tiêu trên vòng tròn phía trước agent rồi **xê dịch điểm đó từ từ**: hướng đổi mượt vì có quán tính. Cùng một lượng ngẫu nhiên, nhưng đặt vào vị trí mục tiêu thay vì đặt thẳng vào hướng đi.
- `Senior` **Cộng trọng số hay context steering? Anh chọn thế nào?**
  → Cộng trọng số cho trường hợp đơn giản, ưu tiên có chặn khi cần gỡ lỗi được, **context steering** khi có triệt tiêu lực. Context chia vòng quanh agent thành 8–16 hướng, mỗi hành vi ghi vào hai mảng `interest` và `danger`, xoá interest ở hướng danger vượt ngưỡng rồi chọn hướng còn lại điểm cao nhất — không cộng nên không triệt tiêu, và vẽ hai mảng ra là thấy agent đang nghĩ gì.
- `Senior` **200 agent bầy đàn tụt frame. Anh tối ưu chỗ nào trước?**
  → Giới hạn số láng giềng: lấy **6–8 con gần nhất** là đủ để trông đúng, và nó biến chi phí từ bình phương thành tuyến tính. Thêm một lưới không gian để tìm láng giềng nữa thì gần như xong. Tôi làm hai thứ đó trước mọi tối ưu vi mô, vì chúng đổi độ phức tạp chứ không chỉ đổi hằng số.
- `Senior` **Khi nào cần RVO thay vì separation?**
  → Khi có đám đông đi **ngược chiều** trong không gian hẹp — chỗ separation sinh ra điệu nhảy hành lang: hai agent cùng né một bên rồi lại chặn nhau. RVO cho mỗi bên giả định đối phương cũng đang né, nên mỗi bên chỉ né một nửa và lời giải hội tụ. Dưới mười agent trong không gian rộng thì đừng bắt đầu bằng RVO.

**Khung trả lời 60 giây** — "Agent đứng rung trước tường, chuyện gì xảy ra?"

> Gần như chắc chắn là **triệt tiêu lực** do gộp bằng cộng trọng số: lực seek đẩy tới mục tiêu, lực né tường đẩy ngược lại, hai vector mạnh ngang nhau nên tổng bằng không — dù đi vòng lên trên là lối thoát hiển nhiên. Phép cộng vector không biết điều đó, vì thông tin về các hướng khác đã bị mất ngay khi cộng.
>
> Chữa tạm thì chuyển sang **ưu tiên có chặn**: sắp hành vi theo thứ tự khẩn cấp, lấy cái đầu tiên tạo ra lực đủ lớn. Không tối ưu nhưng gỡ lỗi được, vì lúc nào cũng biết hành vi nào đang lái.
>
> Chữa gốc thì dùng **context steering**: chia vòng quanh agent thành 8 đến 16 hướng, mỗi hành vi ghi vào hai mảng interest và danger, xoá interest ở hướng nào danger vượt ngưỡng, rồi chọn hướng còn lại điểm cao nhất. Không có phép cộng nên không có triệt tiêu, và vẽ hai mảng đó ra là thấy ngay agent đang nghĩ gì.

**Họ sẽ đào tiếp**

- *"Steering khác pathfinding chỗ nào?"* → Pathfinding cho biết đi đâu, steering cho biết đi như thế nào. Phân vai của tôi: pathfinding lo cấu trúc tĩnh của bản đồ, steering lo mọi thứ động. Lẫn hai tầng gây hai lỗi đối xứng — tính lại đường mỗi khi kẻ địch nhích một bước thì rất đắt, còn dùng steering đi đường dài thì kẹt trong mọi ngõ cụt hình chữ U.
- *"Vì sao Arrive hơn Seek?"* → Seek thuần làm agent chạy quá đích rồi quay lại, dao động mãi. Arrive giảm tốc tuyến tính trong bán kính hãm, thường hai tới ba lần bán kính agent. Nếu vẫn rung thì thiếu **bán kính dừng hẳn** — một vùng nhỏ quanh đích mà trong đó vận tốc mong muốn bằng không.
- *"200 agent tụt frame, tối ưu đâu trước?"* → Giới hạn số láng giềng. Lấy sáu tới tám con gần nhất là đủ để trông đúng, và nó biến chi phí từ bình phương thành tuyến tính — thêm một lưới không gian nữa thì gần như xong. Tôi làm cái đó trước mọi tối ưu vi mô khác.
- *"Ba luật Boids dùng chung bán kính được không?"* → Không nên. Separation bán kính nhỏ nhất, cohesion lớn nhất; dùng chung một bán kính là lý do phổ biến khiến đàn "thở" phập phồng. Và separation nên có trọng số cao hơn hẳn — đàn tách rời trông vẫn ổn, đàn chồng lên nhau thì hỏng ngay.
- *"Khi nào cần RVO?"* → Khi có đám đông đi **ngược chiều** trong không gian hẹp, chỗ separation gây ra điệu nhảy hành lang: hai agent cùng né một bên rồi lại chặn nhau. RVO cho mỗi bên giả định đối phương cũng đang né nên mỗi bên chỉ né một nửa và lời giải hội tụ. Dưới mười agent trong không gian rộng thì separation là đủ, đừng bắt đầu bằng RVO.
- *"Wander giật cục thì sao?"* → Đó là random hướng mỗi frame. Cách đúng là giữ một điểm mục tiêu trên vòng tròn phía trước agent rồi xê dịch nó từ từ — hướng đổi mượt vì có quán tính.

**Cờ đỏ**

- Gộp mọi hành vi bằng cộng trọng số rồi chỉnh hệ số theo kiểu thử-sai vô hạn.
- Không phân biệt được vai của pathfinding và steering.
- Boids duyệt toàn bộ đàn để tìm láng giềng.
- Dùng Seek thuần rồi đổ lỗi cho vật lý khi agent rung quanh đích.
- Không có công cụ vẽ vector, chỉnh trọng số bằng cách đọc code.
- Dùng RVO ngay từ đầu cho một game có mười hai con quái.

**Số / ví dụ nên thuộc**

- Boids: **separation / alignment / cohesion**, Craig Reynolds **1986**; ba **bán kính riêng**, separation trọng số cao nhất.
- Giới hạn **6–8 láng giềng** mỗi agent → chi phí từ bình phương xuống tuyến tính.
- Arrive: bán kính hãm **2–3×** bán kính agent, cộng thêm **bán kính dừng hẳn**.
- Context steering: **8–16 hướng**, hai mảng `interest` / `danger`.
- Ba cách gộp: cộng trọng số · **ưu tiên có chặn** · context steering.
- RVO chỉ cần khi có đám đông **đi ngược chiều** trong không gian hẹp.
