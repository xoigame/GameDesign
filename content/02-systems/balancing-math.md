---
title: Balancing & Math
icon: 🧮
summary: Công thức, bảng số và mô phỏng Monte Carlo — thay việc đoán mò bằng việc đo đạc.
status: deep
read: 240
level: advanced
order: 40
tags: [systems, math, simulation]
related: [economy-design, combat-systems, difficulty-curve, mda-framework]
---

Cân bằng không phải là làm mọi thứ bằng nhau. Cân bằng là làm cho **mọi lựa chọn đều đáng cân nhắc trong một bối cảnh nào đó**.

## Ba công thức nền

**Giảm sát thương theo giáp** — dùng đường cong bão hoà, không dùng phép trừ:

```
sát_thương_nhận = sát_thương_gốc × (K / (K + giáp))
```

Với `K = 100`: giáp 100 → giảm 50%; giáp 300 → giảm 75%. Không bao giờ chạm 0, không bao giờ âm. Phép trừ thẳng (`dmg - armor`) tạo ra trường hợp suy biến ở cả hai đầu: sát thương bằng 0, hoặc giáp thành vô dụng.

**Chi phí tăng theo cấp số nhân** — cho mọi thứ mua được nhiều lần:

```
chi_phí(n) = gốc × tăng_trưởng^n        # tăng_trưởng 1.15 – 1.35
```

**Lợi ích giảm dần** — cho mọi thứ cộng dồn:

```
hiệu_quả(n) = tối_đa × (1 - e^(-k·n))
```

Nếu không có dạng bão hoà này, người chơi sẽ dồn hết vào một chỉ số và phá vỡ game.

## Luật phòng chống bùng nổ

Trường hợp suy biến gần như luôn đến từ **nhân các phần trăm với nhau**:

```
❌  sát_thương × (1+0.5) × (1+0.5) × (1+0.5) = 3.4×
✅  sát_thương × (1 + 0.5 + 0.5 + 0.5)       = 2.5×
```

Nguyên tắc: **cộng trong cùng một loại, nhân giữa các loại khác nhau.** Tất cả bonus "% sát thương" cộng lại với nhau, rồi mới nhân với hệ số crit, rồi mới nhân với hệ số kháng.

Đặt trần cứng cho mọi chỉ số có thể tạo vòng lặp vô hạn: hút máu, giảm cooldown, tốc đánh.

## Mô phỏng Monte Carlo

Đây là chỗ AI tạo khác biệt lớn nhất. Thay vì tranh cãi build nào mạnh, hãy chạy thử:

```python
# Mô phỏng: 10.000 trận cho mỗi build, thống kê kết quả
import random, statistics

def sim_battle(build, enemy):
    hp, e_hp = build.hp, enemy.hp
    t = 0.0
    while hp > 0 and e_hp > 0 and t < 120:
        e_hp -= build.dps * 0.1
        hp   -= enemy.dps * 0.1 * (100 / (100 + build.armor))
        t    += 0.1
    return {"win": e_hp <= 0, "time": t, "hp_left": max(0, hp)}

for build in BUILDS:
    runs = [sim_battle(build, ENEMY) for _ in range(10_000)]
    wr   = sum(r["win"] for r in runs) / len(runs)
    ttk  = statistics.median(r["time"] for r in runs)
    print(f"{build.name:12} winrate={wr:.1%}  TTK={ttk:.1f}s")
```

Cái cần nhìn **không phải giá trị trung bình mà là phân bố**. Build có winrate 55% ổn định thì lành mạnh; build 55% nhưng là hỗn hợp của 90% và 10% tuỳ tình huống thì đang bị "hard counter" — nghĩa là kết quả quyết định trước khi trận đấu bắt đầu.

## Ngưỡng chẩn đoán

| Chỉ số | Khoảng lành mạnh | Ý nghĩa khi lệch |
|---|---|---|
| Winrate mỗi build (PvE) | 45–65% | <40% = bỏ đi; >75% = thống trị |
| Winrate mỗi nhân vật (PvP) | 48–52% | Lệch >5% là người chơi giỏi sẽ nhận ra |
| Tỉ lệ chọn (pick rate) | không quá 25% | Một lựa chọn hút hết = các lựa chọn khác vô nghĩa |
| TTK (thời gian hạ mục tiêu) | biến thiên <2× | Chênh lệch lớn nghĩa là một số kẻ địch bị bỏ qua |
| Độ lệch chuẩn thời gian clear | <30% trung vị | Cao = quá phụ thuộc RNG, xem [[randomness]] |

## Cân bằng "đủ tốt"

Toán học chỉ đưa bạn tới khoảng 80%. Hai mươi phần trăm còn lại là *cảm nhận*:

- Một lựa chọn hơi mạnh nhưng khó dùng thường **lành mạnh** — nó thưởng cho kỹ năng.
- Một lựa chọn cân bằng hoàn hảo nhưng nhàm chán thì **tệ hơn** một lựa chọn hơi lệch mà thú vị.
- Cân bằng nhận thức quan trọng ngang cân bằng thực tế. Nếu người chơi *tin* rằng thứ gì đó quá mạnh, nó gây hại thật — dù số liệu nói ngược lại.

Vì vậy: dùng mô phỏng để loại bỏ những thứ hỏng rõ ràng, dùng [[playtesting-metrics]] để tinh chỉnh phần còn lại.

## 🤖 Prompt cho AI

Rất hiệu quả:
- Viết harness mô phỏng từ mô tả bằng lời.
- Dò tìm trường hợp suy biến: *"tìm tổ hợp 3 vật phẩm cho sát thương >10× baseline"*.
- Suy ra bảng số từ ràng buộc: *"cho tôi 12 mức nâng cấp sao cho thời gian đạt mỗi mức nằm trong 8–14 phút"*.
- Phân tích log playtest thật, chỉ ra chỗ lệch.

Cần cảnh giác:
- AI đề xuất con số **nghe hợp lý mà không kiểm chứng**. Luôn bắt nó chạy mô phỏng rồi đưa ra số liệu, đừng nhận số trực tiếp.
- AI thiên về các giá trị "tròn trịa" quen thuộc trong dữ liệu huấn luyện (10%, 25%, 1.5×) chứ không phải giá trị đúng cho game của bạn.

## 🎮 Unity

Điểm mấu chốt trong Unity: **logic cân bằng phải chạy được ngoài Unity**. Đó là khác biệt giữa mô phỏng 10.000 trận trong 2 giây và trong 20 phút.

**Kiến trúc cho mô phỏng**

```
GameDesign.sln
├── Core/              ← class library, KHÔNG tham chiếu UnityEngine
│   └── Combat/DamageModel.cs
├── Unity/             ← Unity project, tham chiếu Core qua asmdef
└── SimRunner/         ← console app, tham chiếu Core
    └── Program.cs     ← dotnet run, in bảng winrate
```

Với Assembly Definition (`Core.asmdef`, không tick "Override References"), Unity dùng được `Core/`, và một console project cũng dùng được cùng file. Chi tiết ở [[unity-project-structure]].

**Mô hình sát thương thuần**

```csharp
// Core/Combat/DamageModel.cs — không using UnityEngine
public static class DamageModel {
    const float ArmorK = 100f;

    public static float Apply(float raw, float armor, float[] percentBonuses, float critMul) {
        // CỘNG trong cùng loại, NHÂN giữa các loại khác nhau
        float sumPct = 0f;
        foreach (var b in percentBonuses) sumPct += b;
        float afterBonus = raw * (1f + sumPct);
        float afterCrit  = afterBonus * critMul;
        return afterCrit * (ArmorK / (ArmorK + armor));
    }
}
```

Không dùng `Mathf` ở đây — `Mathf` nằm trong `UnityEngine`. Dùng `System.Math` hoặc `MathF`.

**Console runner**

```csharp
// SimRunner/Program.cs
foreach (var build in Builds.All) {
    var runs = Enumerable.Range(0, 10_000)
        .Select(i => Battle.Simulate(build, Enemies.Brute, seed: i))
        .ToArray();
    Console.WriteLine($"{build.Name,-14} winrate={runs.Count(r => r.Win) / 100f:F1}%  " +
                      $"TTK={Median(runs.Select(r => r.Seconds)):F1}s");
}
```

`dotnet run --project SimRunner` — vài giây, không mở Unity, chạy được trong CI.

**Unit test EditMode cho bất biến toán**

```csharp
[Test]
public void PercentBonuses_Cong_KhongNhan() {
    // ba bonus 50% phải cho 2.5x, KHÔNG phải 3.375x
    float d = DamageModel.Apply(100f, 0f, new[] { .5f, .5f, .5f }, 1f);
    Assert.AreEqual(250f, d, 0.01f);
}

[Test]
public void Armor_KhongBaoGioAm_KhongBaoGioBang0() {
    Assert.Greater(DamageModel.Apply(100f, 100000f, new float[0], 1f), 0f);
}
```

Hai test này chặn đúng hai trường hợp suy biến mô tả ở phần trên. Chạy trong mili giây, chạy được trong CI.

**Bẫy Unity cụ thể**
- **`Mathf` trong `Core/`** làm mất khả năng chạy ngoài Unity — dùng `MathF`.
- **`UnityEngine.Random` trong mô phỏng** → không tái hiện được. Dùng `System.Random(seed)`.
- **Chạy mô phỏng trong Play Mode** với `yield return null` mỗi trận → 10.000 trận mất hàng phút.

**Kiểm tra nhanh**
- `dotnet run --project SimRunner` chạy được không?
- Test EditMode toàn bộ `Core/` dưới 1 giây?
- Cùng seed hai lần: kết quả giống hệt?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Cân bằng game nghĩa là gì? Có phải làm mọi thứ bằng nhau không?**
  → Không. Cân bằng là làm cho **mọi lựa chọn đều đáng cân nhắc trong một bối cảnh nào đó**. Ba lựa chọn giống hệt nhau về sức mạnh thì cân bằng hoàn hảo và cũng vô nghĩa hoàn hảo — không có gì để quyết định. Đích đến là mỗi lựa chọn có một tình huống mà nó là đáp án đúng.
- `Junior` **Vì sao giảm sát thương theo giáp không nên dùng phép trừ?**
  → Vì phép trừ tạo trường hợp suy biến ở **cả hai đầu**: giáp cao thì sát thương về 0 hoặc âm, giáp thấp thì giáp vô dụng. Dùng đường cong bão hoà kiểu `dmg × K / (K + armor)`: với `K = 100` thì giáp 100 giảm 50%, giáp 300 giảm 75% — không bao giờ chạm 0 và luôn còn giá trị khi cộng thêm.
- `Junior` **Luật "cộng trong cùng loại, nhân giữa các loại" nghĩa là gì?**
  → Mọi bonus **% sát thương** cộng lại với nhau trước, rồi mới nhân với hệ số crit, rồi mới nhân với hệ số kháng. Nhân các phần trăm cùng loại với nhau là nguồn của gần như mọi vụ bùng nổ chỉ số: bốn món mỗi món +50% thành ×5 thay vì ×3. Kèm theo là trần cứng cho hút máu, giảm cooldown và tốc đánh.
- `Mid` **Monte Carlo dùng để cân bằng thế nào, và nhìn vào đâu?**
  → Chạy hàng nghìn trận mô phỏng giữa các build rồi nhìn **phân bố, không nhìn trung bình**. Winrate 55% ổn định là lành mạnh; 55% nhưng là hỗn hợp của 90% và 10% tuỳ đối thủ thì đang bị **hard counter** — kết quả quyết định trước khi trận đấu bắt đầu, và người chơi cảm nhận được điều đó ngay cả khi bảng số trông đẹp.
- `Mid` **Những ngưỡng chẩn đoán nào anh kiểm tra trước khi phát hành?**
  → Winrate mỗi build PvE **45–65%**; winrate mỗi nhân vật PvP **48–52%**, lệch quá 5% là người chơi giỏi sẽ nhận ra. Pick rate **không quá 25%** cho một lựa chọn. TTK biến thiên **dưới 2 lần**. Và độ lệch chuẩn thời gian clear **dưới 30% trung vị** — cao hơn nghĩa là kết quả phụ thuộc RNG quá nhiều.
- `Mid` **Lợi ích giảm dần để làm gì?**
  → Để người chơi **không dồn hết vào một chỉ số**. Không có dạng bão hoà thì luôn tồn tại một chỉ số trội và mọi build hội tụ về đó — autonomy biến mất dù bảng trang bị vẫn dài. Cùng lý do, mọi thứ mua được nhiều lần nên có chi phí tăng theo cấp số nhân chứ không tuyến tính.
- `Senior` **Số liệu nói một build ổn nhưng cộng đồng gọi nó là bẫy. Anh làm gì?**
  → Coi đó là vấn đề thật, vì **cân bằng nhận thức quan trọng ngang cân bằng thực tế**: người chơi tin thứ gì đó yếu thì nó yếu trong thực tế, vì không ai luyện nó. Tôi tìm nguyên nhân nhận thức — thường là phản hồi kém rõ, hoặc sức mạnh dồn vào cuối đường cong — rồi sửa phần truyền đạt trước khi sửa con số.
- `Senior` **Khi nào một lựa chọn "hơi mạnh" là chấp nhận được?**
  → Khi nó **khó dùng**. Lựa chọn mạnh mà đòi kỹ năng thì thưởng cho người luyện tập và tạo skill ceiling — đó là cân bằng lành mạnh. Ngược lại, một lựa chọn cân bằng hoàn hảo nhưng nhàm chán còn tệ hơn một lựa chọn hơi lệch mà thú vị. Toán chỉ đưa tới khoảng 80%; 20% còn lại là cảm nhận và phải đo bằng playtest.
- `Senior` **Dùng AI trong việc cân bằng thế nào cho đúng?**
  → Giao cho nó viết và chạy **mô phỏng**, sinh bảng số biến thiên, và liệt kê các tổ hợp có thể tạo vòng lặp vô hạn — việc tính toán tổ hợp là chỗ nó hơn hẳn người. **Không** giao cho nó quyết định con số cuối, vì cân bằng còn là cảm nhận và là nhận thức cộng đồng. Ranh giới: AI loại bỏ thứ hỏng rõ ràng, playtest tinh chỉnh phần còn lại.

**Khung trả lời 60 giây** — "Anh cân bằng một hệ thống mới thế nào?"

> Ba bước. Trước hết là **dạng công thức**: giảm sát thương dùng đường cong bão hoà chứ không dùng phép trừ; chi phí mua nhiều lần dùng cấp số nhân; mọi thứ cộng dồn phải có lợi ích giảm dần. Chọn sai dạng thì không có con số nào cứu được, vì trường hợp suy biến nằm ngay trong công thức.
>
> Rồi tới **luật chống bùng nổ**: cộng trong cùng một loại, nhân giữa các loại khác nhau, và trần cứng cho hút máu, giảm cooldown, tốc đánh. Gần như mọi vụ vỡ cân bằng tôi từng gặp đều bắt đầu bằng việc nhân hai phần trăm cùng loại với nhau.
>
> Cuối cùng là **mô phỏng Monte Carlo** rồi nhìn **phân bố chứ không nhìn trung bình**: winrate 55% ổn định thì lành mạnh, còn 55% ghép từ 90% và 10% là đang có hard counter. Sau đó tôi soi vài ngưỡng chẩn đoán — pick rate không quá 25%, PvP lệch không quá 5%, TTK biến thiên dưới hai lần — rồi để playtest lo phần cảm nhận.

**Họ sẽ đào tiếp**

- *"Vì sao nhìn phân bố mà không nhìn trung bình?"* → Vì trung bình che mất hình dạng. Hai build cùng 55% winrate có thể là hai game hoàn toàn khác nhau: một cái luôn cân tài cân sức, một cái quyết định xong ngay ở màn chọn. Người chơi cảm nhận **hình dạng**, không cảm nhận trung bình — đúng như với frame time và fps.
- *"Trần cứng có làm mất chiều sâu không?"* → Ngược lại. Không có trần thì luôn tồn tại một hướng build duy nhất đúng — dồn hết vào chỉ số có vòng lặp — và mọi hướng khác thành bẫy. Trần cứng là thứ giữ cho nhiều hướng cùng khả thi; mất chiều sâu là khi trần đặt quá thấp và mọi build đều chạm trần.
- *"Cân bằng PvE và PvP khác nhau ở đâu?"* → Biên độ cho phép. PvE chấp nhận winrate 45–65% vì người chơi so với hệ thống; PvP phải trong 48–52% vì người chơi so với nhau và **chênh lệch nhỏ cũng bị khai thác có hệ thống**. PvP cũng cần quy trình cập nhật thường xuyên, nên nó là cam kết vận hành chứ không chỉ là bảng số.
- *"Không đủ người chơi để có dữ liệu thì sao?"* → Dùng mô phỏng để thay phần thống kê và dùng playtest có quan sát để thay phần cảm nhận. Điều không nên làm là đọc số từ một mẫu quá nhỏ rồi tin — kết luận từ nhiễu còn tệ hơn không có kết luận, vì nó khoá đội vào một hướng kèm cảm giác đã có bằng chứng.

**Cờ đỏ**

- Cân bằng bằng cách chỉnh từng con số đến khi "thấy ổn", không có mô phỏng nào.
- Dùng phép trừ cho giáp, hoặc nhân các phần trăm cùng loại với nhau.
- Báo cáo cân bằng bằng winrate trung bình, không nhìn phân bố.
- Bỏ qua phản hồi cộng đồng vì "số liệu nói khác".
- Không có trần cho hút máu, giảm cooldown, tốc đánh.

**Số / ví dụ nên thuộc**

- Giáp bão hoà `dmg × K/(K+armor)`, `K=100`: giáp 100 → **−50%**, giáp 300 → **−75%**.
- Luật: **cộng trong cùng loại, nhân giữa các loại**; trần cứng cho hút máu / cooldown / tốc đánh.
- Winrate PvE **45–65%** · PvP **48–52%** · pick rate ≤ **25%** · TTK biến thiên < **2×** · SD thời gian clear < **30%** trung vị.
- Monte Carlo: nhìn **phân bố**, không nhìn trung bình; 55% ổn định ≠ 55% ghép từ 90/10.
- Toán đưa tới **~80%**; phần còn lại là cảm nhận và nhận thức cộng đồng.
