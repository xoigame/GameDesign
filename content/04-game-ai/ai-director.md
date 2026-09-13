---
title: AI Director
icon: 🎬
summary: AI ở tầng hệ thống điều tiết nhịp độ cả trận — mô hình Left 4 Dead và cách tự dựng một cái.
status: deep
read: 490
level: advanced
order: 60
tags: [ai, pacing, systems]
related: [difficulty-curve, pacing, procedural-generation, utility-ai]
---

AI Director không điều khiển một NPC nào cả. Nó điều khiển **trải nghiệm**: quyết định khi nào spawn, spawn cái gì, khi nào cho người chơi nghỉ.

Left 4 Dead (Valve, 2008) phổ biến hoá khái niệm này, và nó vẫn là mô hình tham chiếu tốt nhất.

## Mô hình Left 4 Dead

Director theo dõi một chỉ số gọi là **intensity** cho mỗi người chơi:

```
intensity tăng khi:  bị sát thương, gặp quái, bắn nhiều, đồng đội gục
intensity giảm khi:  yên tĩnh, hồi máu, đi qua khu vực trống
```

Rồi chạy một máy trạng thái bốn pha:

```
BUILD UP  →  SUSTAIN PEAK  →  PEAK FADE  →  RELAX  →  (lặp)
 tăng dần    giữ đỉnh ~3-5s   giảm dần    30-45s yên
```

Điểm tinh tế nằm ở pha **RELAX**. Trong giai đoạn này Director *chủ động ngăn* việc spawn, ngay cả khi người chơi đang đi qua khu vực lẽ ra có quái. Khoảng lặng không phải chỗ trống — nó là công cụ thiết kế, và là thứ khiến đợt tấn công tiếp theo đáng sợ. Xem [[pacing]].

## Vì sao nó hiệu quả

**Nhịp độ thích ứng mà không phải điều chỉnh độ khó lộ liễu.** Director không làm zombie yếu đi — nó thay đổi *khi nào* chúng xuất hiện. Người chơi không phát hiện được, nên nhu cầu *competence* không bị tổn hại (xem [[difficulty-curve]] về rủi ro của DDA).

**Khả năng chơi lại.** Cùng một bản đồ cho ra trải nghiệm khác nhau mỗi lần, nhưng vẫn có cấu trúc nhịp độ đảm bảo — khác với ngẫu nhiên thuần.

**Kịch tính tự nhiên.** Boss zombie (Tank, Witch) được đặt vào đúng lúc gây kịch tính nhất, không phải ở vị trí cố định.

## Tự dựng một Director tối giản

```csharp
class Director {
    float intensity;              // 0..1
    Phase phase = Phase.BuildUp;
    float phaseTimer;

    void Update(float dt) {
        intensity = Mathf.Clamp01(intensity + IntensityDelta() * dt);
        phaseTimer += dt;

        switch (phase) {
            case Phase.BuildUp:
                SpawnBudget = Mathf.Lerp(2, 12, intensity);
                if (intensity > 0.85f) Go(Phase.SustainPeak);
                break;

            case Phase.SustainPeak:
                SpawnBudget = 12;
                if (phaseTimer > Random.Range(3f, 5f)) Go(Phase.PeakFade);
                break;

            case Phase.PeakFade:
                SpawnBudget = 0;
                if (intensity < 0.3f) Go(Phase.Relax);
                break;

            case Phase.Relax:
                SpawnBudget = 0;                          // im lặng có chủ ý
                if (phaseTimer > Random.Range(30f, 45f)) Go(Phase.BuildUp);
                break;
        }
    }

    float IntensityDelta() {
        float d = 0;
        d += damageTakenLastSecond * 0.25f;
        d += enemiesNearby * 0.03f;
        d -= 0.06f;                        // luôn giảm dần theo thời gian
        return d;
    }
}
```

Dưới 60 dòng và đã có được nhịp độ thích ứng. Đây là một trong những hệ thống có tỉ lệ giá trị/công sức cao nhất trong thiết kế game.

## Mở rộng

**Ngân sách spawn có trọng số.** Thay vì "spawn N con", dùng ngân sách điểm: goblin 2 điểm, cung thủ 5, brute 12. Director tiêu ngân sách theo intensity. Điều này tự động tạo ra đa dạng đội hình và dễ cân bằng — xem [[balancing-math]].

**Đặt vật phẩm thích ứng.** Máu thấp kéo dài → tăng tỉ lệ rơi máu ở khu vực tới. Đây là điều chỉnh *an toàn* vì người chơi không đo được tỉ lệ rơi đồ.

**Kiểm tra nhịp độ khi sinh màn.** Nếu dùng [[procedural-generation]], hãy để Director đánh giá bố cục sinh ra: có đủ khoảng nghỉ không, có đoạn nào quá dày không.

**Director theo nhiều chỉ số.** Ngoài intensity, có thể theo dõi *sự đa dạng* (người chơi có đang gặp đủ loại kẻ địch không) và *sự lặp lại* (đã spawn cùng một đội hình mấy lần rồi).

## Cạm bẫy

**Đừng để Director quá thông minh.** Nếu nó luôn spawn đúng thứ khắc chế build của người chơi, game trở nên khó chịu — người chơi cảm thấy bị nhắm. Chừa chỗ cho những khoảnh khắc người chơi *áp đảo*; đó là phần thưởng cho việc xây build tốt.

**Đừng ẩn hoàn toàn.** Người chơi nên *cảm nhận* được nhịp điệu, ngay cả khi không hiểu cơ chế. Âm nhạc thay đổi theo pha là cách rẻ và hiệu quả.

**Luôn có giới hạn cứng.** Bất kể intensity thế nào, phải có trần số kẻ địch đồng thời (hiệu năng) và sàn thời gian nghỉ (trải nghiệm).

## 🤖 Prompt cho AI

Đây là hệ thống thuần logic + số, không cần trực giác không gian — AI làm rất tốt. Hãy cung cấp máy trạng thái và bảng ngân sách, rồi yêu cầu **công cụ trực quan hoá**:

```
Xây AI Director theo mô hình 4 pha (BuildUp/SustainPeak/PeakFade/Relax).

[bảng công thức intensity và ngân sách spawn...]

Ngoài ra:
- Debug overlay: đồ thị intensity theo thời gian, pha hiện tại, ngân sách còn lại
- Chế độ replay: ghi lại chuỗi sự kiện của một trận, phát lại được
- Script mô phỏng: chạy 200 trận ảo, vẽ histogram độ dài mỗi pha
  → dùng để kiểm tra Relax không bao giờ ngắn hơn 25s
```

Phần mô phỏng là chỗ AI tiết kiệm nhiều thời gian nhất — nó cho bạn thấy Director hành xử thế nào *trước khi* bạn chơi thử hàng chục ván.

## 🎮 Unity

AI Director là hệ thống cấp scene, không gắn vào NPC. Trong Unity nó là một singleton nhẹ.

**Component & nơi đặt**
- `Director.cs` — một GameObject trong scene, `DontDestroyOnLoad` nếu cần xuyên màn
- `DirectorConfig` (ScriptableObject) — ngưỡng pha, ngân sách spawn
- `SpawnPoint.cs` — đánh dấu vị trí, Director chọn từ đây

**Code**

```csharp
public enum DirectorPhase { BuildUp, SustainPeak, PeakFade, Relax }

public class Director : MonoBehaviour, IDirectorSignal {
    [SerializeField] DirectorConfig cfg;

    public float Intensity { get; private set; }      // 0..1 — adaptive music đọc cái này
    public DirectorPhase Phase { get; private set; }
    float phaseTimer, phaseTarget;
    int spawnBudget;

    void Update() {
        float dt = Time.deltaTime;
        Intensity = Mathf.Clamp01(Intensity + IntensityDelta() * dt);
        phaseTimer += dt;

        switch (Phase) {
            case DirectorPhase.BuildUp:
                spawnBudget = Mathf.RoundToInt(Mathf.Lerp(2, cfg.maxBudget, Intensity));
                if (Intensity > 0.85f) Go(DirectorPhase.SustainPeak, Random.Range(3f, 5f));
                break;
            case DirectorPhase.SustainPeak:
                spawnBudget = cfg.maxBudget;
                if (phaseTimer > phaseTarget) Go(DirectorPhase.PeakFade, 0f);
                break;
            case DirectorPhase.PeakFade:
                spawnBudget = 0;
                if (Intensity < 0.3f) Go(DirectorPhase.Relax, Random.Range(30f, 45f));
                break;
            case DirectorPhase.Relax:
                spawnBudget = 0;                       // im lặng CÓ CHỦ Ý
                if (phaseTimer > phaseTarget) Go(DirectorPhase.BuildUp, 0f);
                break;
        }
    }

    void Go(DirectorPhase p, float target) { Phase = p; phaseTimer = 0f; phaseTarget = target; }

    float IntensityDelta() =>
        damageTakenLastSecond * 0.25f + enemiesNearby * 0.03f - 0.06f;
}
```

**Spawn theo ngân sách, không theo số lượng**

```csharp
[System.Serializable] public struct EnemyCost { public GameObject prefab; public int cost; }

void SpawnWave() {
    int budget = spawnBudget;
    var pool = cfg.enemies.Where(e => e.cost <= budget).ToArray();
    while (budget > 0 && pool.Length > 0) {
        var pick = pool[Random.Range(0, pool.Length)];
        if (pick.cost > budget) break;
        EnemyPool.Get(pick.prefab, PickSpawnPoint());
        budget -= pick.cost;
        pool = cfg.enemies.Where(e => e.cost <= budget).ToArray();
    }
}
```

Ngân sách tự sinh đội hình đa dạng: 12 điểm có thể là 6 goblin, hoặc 1 brute, hoặc 2 cung thủ + 1 goblin.

**Bẫy Unity cụ thể**
- **LINQ trong `SpawnWave`** cấp phát mỗi lần gọi. Chấp nhận được vì spawn thưa, nhưng đừng đưa vào `Update`.
- **Spawn ngoài tầm nhìn camera** — kiểm tra bằng `GeometryUtility.TestPlanesAABB`, không dùng khoảng cách. Quái xuất hiện trước mắt người chơi phá vỡ ảo giác.
- **`Time.timeScale` bằng 0 khi hitstop** → Director cũng dừng. Đúng, nhưng nhớ là `phaseTimer` không nhích trong lúc đó.

**Debug overlay**

```csharp
void OnGUI() => GUI.Label(new Rect(10, 10, 400, 60),
    $"Phase {Phase}  ({phaseTimer:F1}/{phaseTarget:F1}s)\n" +
    $"Intensity {Intensity:F2}   Budget {spawnBudget}");
```

**Kiểm tra nhanh**
- Chơi 5 phút: pha Relax có bao giờ ngắn hơn 25 giây không? (không được)
- Đứng yên không làm gì: Intensity có tụt về 0 không?
- Nhạc có đổi lớp theo Intensity không? Xem [[adaptive-music]].

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **AI Director là gì? Nó khác AI của một NPC thế nào?**
  → Nó không điều khiển NPC nào cả — nó điều khiển **trải nghiệm**: khi nào spawn, spawn cái gì, khi nào cho người chơi nghỉ. Left 4 Dead (Valve, 2008) phổ biến hoá khái niệm này và vẫn là mô hình tham chiếu tốt nhất. Nói cách khác, nó là AI ở **tầng hệ thống**, cùng tầng với nhịp độ chứ không cùng tầng với hành vi.
- `Junior` **Intensity trong mô hình Left 4 Dead tăng giảm theo gì?**
  → **Tăng** khi bị sát thương, gặp quái, bắn nhiều, đồng đội gục. **Giảm** khi yên tĩnh, hồi máu, đi qua khu vực trống — và luôn có một thành phần giảm dần đều theo thời gian. Nó là một con số 0–1 cho mỗi người chơi, và mọi quyết định spawn đều đọc từ đó.
- `Junior` **Bốn pha của Director là gì?**
  → **BUILD UP** (tăng dần) → **SUSTAIN PEAK** (giữ đỉnh khoảng 3–5 giây) → **PEAK FADE** (giảm dần) → **RELAX** (30–45 giây yên tĩnh) → lặp lại. Điểm tinh tế nằm ở RELAX: Director **chủ động ngăn spawn** ngay cả khi người chơi đang đi qua khu vực lẽ ra có quái.
- `Mid` **Vì sao pha RELAX lại là phần quan trọng nhất?**
  → Vì khoảng lặng không phải chỗ trống mà là **công cụ thiết kế** — nó là thứ khiến đợt tấn công tiếp theo đáng sợ. Không có RELAX thì cường độ phẳng và đỉnh không còn là đỉnh, đúng như với đường cong nhịp độ. Đây cũng là phần hay bị cắt đầu tiên khi ai đó thấy "màn này ít quái quá".
- `Mid` **Vì sao Director không bị coi là điều chỉnh độ khó lộ liễu?**
  → Vì nó không làm zombie yếu đi — nó thay đổi **khi nào** chúng xuất hiện. Người chơi không quan sát trực tiếp được nhịp spawn nên không phát hiện ra, và nhu cầu **competence** không bị tổn hại. Đây chính là ranh giới an toàn của DDA: điều chỉnh tài nguyên và nhịp thì được, điều chỉnh HP và sát thương thì không.
- `Mid` **Director cho khả năng chơi lại khác gì so với ngẫu nhiên thuần?**
  → Ngẫu nhiên thuần cho mỗi lần chơi một kết quả khác nhưng **không đảm bảo cấu trúc**: có lần dồn dập suốt, có lần trống trải suốt. Director cho mỗi lần một trải nghiệm khác **mà vẫn giữ đường cong nhịp độ** — build up, đỉnh, nghỉ. Đó là khác biệt giữa biến thiên có kiểm soát và hỗn loạn.
- `Senior` **Anh dựng một Director tối giản cho game của mình thế nào?**
  → Một biến `intensity` 0–1, một máy trạng thái bốn pha, và một **ngân sách spawn** suy ra từ pha cộng intensity. `IntensityDelta` cộng theo sát thương nhận trong giây gần nhất và số địch quanh đó, trừ đi một hằng số để nó luôn nguội dần. Chốt chặn quan trọng: ở PEAK FADE và RELAX thì ngân sách spawn bằng **0**, không phải "ít".
- `Senior` **Đặt boss (Tank, Witch) vào đâu — vị trí cố định hay do Director?**
  → Do Director, ở **thời điểm kịch tính nhất** chứ không phải vị trí cố định. Cái được là kịch tính tự nhiên và không học thuộc được. Cái phải kiểm soát là công bằng: cần ràng buộc cứng — không spawn boss khi người chơi máu thấp vừa hết đạn, khoảng cách tối thiểu giữa hai lần, và một nơi đủ rộng để đánh.
- `Senior` **Director làm cho co-op nhiều người thì intensity tính thế nào?**
  → Theo **từng người chơi**, rồi tổng hợp lại — nhưng tổng hợp bằng trung bình là sai: một người đang bị dồn mà ba người khác yên ổn sẽ ra intensity thấp. Thực tế thường dùng **max** hoặc phân vị cao cho quyết định "có nên nghỉ không", và dùng intensity riêng cho quyết định spawn quanh từng người. Đây là chỗ mô hình một người chơi không mở rộng thẳng ra được.

**Khung trả lời 60 giây** — "AI Director hoạt động thế nào, và vì sao nó không bị coi là gian lận?"

> Nó theo dõi một chỉ số **intensity** cho mỗi người chơi — tăng khi bị sát thương, gặp quái, bắn nhiều, đồng đội gục; giảm khi yên tĩnh và luôn nguội dần theo thời gian. Rồi chạy một máy trạng thái bốn pha: build up, giữ đỉnh ba tới năm giây, giảm dần, và **relax ba mươi tới bốn mươi lăm giây**.
>
> Phần quan trọng nhất là relax, vì ở đó Director **chủ động ngăn spawn** kể cả khi người chơi đi qua khu vực lẽ ra có quái. Khoảng lặng là công cụ, không phải chỗ trống — nó là thứ làm đợt tấn công sau đáng sợ.
>
> Và lý do nó không bị đọc là gian lận: Director **không làm zombie yếu đi**, nó chỉ đổi thời điểm chúng xuất hiện. Người chơi không quan sát trực tiếp được nhịp spawn nên không phát hiện ra — khác hẳn với việc giảm HP con boss giữa trận, thứ người chơi đếm được. Đó chính là ranh giới an toàn của mọi điều chỉnh động.

**Họ sẽ đào tiếp**

- *"Ngân sách spawn nên là 0 hay chỉ là ít trong pha nghỉ?"* → **0**. "Ít" vẫn tạo tiếng động và vẫn buộc người chơi giữ trạng thái cảnh giác, nên nó xoá mất chính thứ pha nghỉ tồn tại để tạo ra. Muốn lấp khoảng trống thì lấp bằng thứ khác — âm thanh môi trường, thoại, vật phẩm để nhặt — chứ đừng lấp bằng quái.
- *"Làm sao biết Director đang chạy đúng?"* → Vẽ đồ thị intensity và pha theo thời gian của một trận, rồi so với đường cong mục tiêu — cùng cách làm với nhịp độ. Nhìn hai thứ: có đủ ba tới bốn chu kỳ trong một màn không, và các đỉnh có leo thang không. Đỉnh cao bằng nhau là đúng luật mà vẫn đơn điệu.
- *"Director có dùng được cho thể loại khác không?"* → Được, miễn là game có **nguồn áp lực điều tiết được**: roguelike điều tiết phòng và vật phẩm, game sinh tồn điều tiết thời tiết và tài nguyên, game đua điều tiết mật độ xe. Cái không chuyển được là mô hình intensity — mỗi thể loại phải tự định nghĩa cái gì làm người chơi căng.
- *"Dùng AI để làm phần này thế nào?"* → Giao cho nó **chạy mô phỏng nhiều kiểu người chơi** qua Director rồi in ra đường intensity: người chơi giỏi, người chơi kém, người chơi rất thận trọng. Chỗ đường đi phẳng suốt hoặc đỉnh suốt là chỗ mô hình hỏng với kiểu chơi đó — và đó là thứ playtest tốn cả buổi mới thấy.

**Cờ đỏ**

- Gọi mọi hệ thống spawn theo thời gian là AI Director.
- Bỏ pha nghỉ, hoặc cho nó "ít quái" thay vì không có quái.
- Director điều chỉnh HP hoặc sát thương thay vì điều chỉnh nhịp.
- Không có ràng buộc công bằng khi thả boss.
- Tổng hợp intensity nhiều người chơi bằng trung bình.

**Số / ví dụ nên thuộc**

- **Left 4 Dead, Valve, 2008** — mô hình tham chiếu.
- Bốn pha: **BUILD UP → SUSTAIN PEAK (3–5 s) → PEAK FADE → RELAX (30–45 s)**.
- Ngân sách spawn ở PEAK FADE và RELAX: **0**.
- Director đổi **thời điểm**, không đổi **sức mạnh** — đó là lý do nó không bị đọc là gian lận.
- `IntensityDelta` mẫu: `+0,25 × sát thương giây vừa rồi` `+0,03 × số địch quanh đó` `−0,06` nguội dần.
