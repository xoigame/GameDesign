---
title: Utility AI
icon: 📊
summary: Chấm điểm mọi lựa chọn rồi chọn cái cao nhất — kiến trúc linh hoạt nhất cho NPC có nhiều nhu cầu cạnh tranh.
status: deep
read: 480
level: advanced
order: 40
tags: [ai, decision-making]
related: [behavior-tree, goap, ai-director]
---

Utility AI bỏ hoàn toàn khái niệm ưu tiên cứng. Thay vào đó, mỗi tick nó **chấm điểm mọi hành động khả dĩ** rồi chọn hành động điểm cao nhất.

```
Ăn         → 0.82   ← chọn cái này
Ngủ        → 0.41
Đi làm     → 0.65
Nói chuyện → 0.30
```

Đây là kiến trúc đằng sau The Sims, và ngày càng phổ biến trong game mô phỏng và chiến thuật.

## Hàm chấm điểm

Mỗi hành động có một hoặc nhiều **considerations** — các yếu tố đầu vào được chuẩn hoá về [0, 1] rồi đưa qua một đường cong:

```
Điểm(Ăn) = curve_đói(mức_đói) × curve_khoảngcách(khoảng_cách_tới_bếp)
```

Các dạng đường cong thường dùng:

| Dạng | Công thức | Dùng cho |
|---|---|---|
| Tuyến tính | `x` | Quan hệ đơn giản |
| Bậc hai | `x²` | Khẩn cấp tăng dần — đói nhẹ gần như không quan trọng, đói nặng thì rất |
| Nghịch đảo | `1 - x` | "Càng xa càng tệ" |
| Logistic | `1 / (1 + e^(-k(x-c)))` | Ngưỡng mềm — gần như tắt/bật nhưng không giật |

Dùng **nhân** thay vì **cộng** khi kết hợp: nếu một yếu tố bằng 0 (bếp không tới được), toàn bộ hành động bị loại — đúng như mong muốn. Cộng sẽ cho ra điểm dương dù hành động bất khả thi.

Cảnh báo về nhân: với nhiều yếu tố, điểm bị kéo về 0 (0.8⁵ = 0.33). Cách bù thường dùng là *compensation factor*:

```
điểm_cuối = điểm_nhân ^ (1 / số_yếu_tố)
```

## So sánh với BT

| | Behavior Tree | Utility AI |
|---|---|---|
| Quyết định | Ưu tiên cứng theo thứ tự | Điểm mềm, so sánh tương đối |
| Thêm hành vi | Chèn nhánh, phải cân nhắc vị trí | Thêm một hành động độc lập |
| Kiểm soát | Rất chính xác | Gián tiếp, chỉnh qua đường cong |
| Gỡ lỗi | Dễ — xem nhánh nào chạy | Trung bình — phải xem bảng điểm |
| Phù hợp | Kẻ địch chiến đấu | NPC sinh hoạt, sim, chiến thuật |

Điểm mạnh lớn nhất của Utility AI là **khả năng mở rộng**: thêm hành động thứ 40 không đụng chạm gì tới 39 hành động cũ. Với BT thì phải quyết định chèn nhánh mới vào chỗ nào trong thứ tự ưu tiên — và thứ tự đó ngày càng khó lý giải.

## Tránh dao động

Vấn đề cố hữu: hai hành động điểm 0.51 và 0.49 sẽ khiến NPC đổi ý liên tục.

Ba cách chữa, thường dùng kết hợp:

1. **Bonus quán tính** — cộng thêm 10–15% cho hành động đang thực hiện.
2. **Cam kết tối thiểu** — hành động đã chọn phải chạy ít nhất N giây.
3. **Chọn ngẫu nhiên trong top-K** — lấy 3 hành động điểm cao nhất, chọn ngẫu nhiên có trọng số. Vừa chống dao động vừa tạo cảm giác NPC có cá tính.

Cách 3 có tác dụng phụ rất có giá trị: **NPC không còn đoán trước được** mà vẫn hợp lý.

## Cài đặt gọn

```csharp
Action ChooseBest(Agent agent) {
    Action best = null;
    float bestScore = 0f;

    foreach (var action in agent.actions) {
        float score = 1f;
        foreach (var c in action.considerations)
            score *= c.Evaluate(agent);          // mỗi cái trả về [0,1]

        // bù cho việc nhân nhiều yếu tố
        if (action.considerations.Count > 1)
            score = Mathf.Pow(score, 1f / action.considerations.Count);

        if (action == agent.current) score *= 1.15f;   // quán tính

        if (score > bestScore) { bestScore = score; best = action; }
    }
    return best;
}
```

Toàn bộ kiến trúc nằm gọn trong một hàm. Độ phức tạp dồn vào các đường cong — và đó là chỗ nhà thiết kế chỉnh, không phải lập trình viên.

## 🤖 Prompt cho AI

Utility AI **data-driven tự nhiên**: các đường cong và trọng số nằm trong file dữ liệu, không nằm trong code. Điều này khớp rất tốt với [[data-driven-design]] và với cách làm việc cùng AI:

```
Viết hệ thống Utility AI cho NPC dân làng.

Considerations (mỗi cái trả [0,1]):
  hunger      : quadratic,  input = 1 - (food / max_food)
  fatigue     : logistic,   input = hours_awake / 16,  k=8, c=0.7
  distance    : inverse_lin, input = dist / 50, clamp 0..1
  is_night    : boolean

Actions (action = danh sách considerations nhân với nhau):
  Eat     = [hunger, distance_to_kitchen]
  Sleep   = [fatigue, is_night, distance_to_bed]
  Work    = [1 - fatigue, not is_night, distance_to_job]
  Socialize = [social_need, distance_to_npc]

Ràng buộc:
- Toàn bộ đường cong + tham số nạp từ JSON, KHÔNG hardcode
- Quán tính 1.15x cho hành động hiện tại
- Cam kết tối thiểu 2 giây
- Debug overlay: in bảng điểm mọi action của NPC đang chọn
```

Yêu cầu **debug overlay** không phải phụ kiện — với Utility AI, không nhìn được bảng điểm thì không tinh chỉnh được gì cả.

## 🎮 Unity

Utility AI hợp với Unity một cách tự nhiên: `AnimationCurve` chính là công cụ vẽ đường cong chấm điểm.

**Component & nơi đặt**
- `Consideration` (ScriptableObject) — một asset mỗi yếu tố, chứa `AnimationCurve`
- `UtilityAction` (ScriptableObject) — danh sách consideration nhân với nhau
- `UtilityBrain.cs` — chấm điểm mỗi tick, chọn cao nhất

**Code**

```csharp
[CreateAssetMenu(menuName = "AI/Consideration")]
public class Consideration : ScriptableObject {
    public string inputKey;                 // đọc từ blackboard
    public AnimationCurve curve = AnimationCurve.Linear(0, 0, 1, 1);
    public float Evaluate(Blackboard bb) =>
        Mathf.Clamp01(curve.Evaluate(Mathf.Clamp01(bb.Get<float>(inputKey))));
}

[CreateAssetMenu(menuName = "AI/Utility Action")]
public class UtilityAction : ScriptableObject {
    public Consideration[] considerations;
    public float weight = 1f;

    public float Score(Blackboard bb) {
        float s = weight;
        foreach (var c in considerations) {
            s *= c.Evaluate(bb);
            if (s <= 0f) return 0f;          // thoát sớm: một yếu tố = 0 là loại
        }
        // bù cho việc nhân nhiều yếu tố, nếu không điểm luôn bị kéo về 0
        return considerations.Length > 1
            ? Mathf.Pow(s, 1f / considerations.Length)
            : s;
    }
}
```

```csharp
public class UtilityBrain : AiBrain {
    [SerializeField] UtilityAction[] actions;
    [SerializeField] float inertiaBonus = 1.15f;
    [SerializeField] float minCommitSeconds = 2f;

    UtilityAction current; float heldFor;
    public string DebugLabel => current ? current.name : "-";

    protected override void Think(float dt) {
        heldFor += dt;
        if (current != null && heldFor < minCommitSeconds) return;

        UtilityAction best = null; float bestScore = 0f;
        foreach (var a in actions) {
            float s = a.Score(bb);
            if (a == current) s *= inertiaBonus;      // chống dao động
            if (s > bestScore) { bestScore = s; best = a; }
        }
        if (best != current) { current = best; heldFor = 0f; }
    }
}
```

**Debug overlay — bắt buộc**

```csharp
void OnGUI() {
    if (!Application.isEditor) return;
    float y = 10;
    foreach (var a in actions)
        GUI.Label(new Rect(10, y += 18, 300, 18),
                  $"{a.name,-16} {a.Score(bb):F3}{(a == current ? "  ←" : "")}");
}
```

Với Utility AI, **không nhìn được bảng điểm thì không tinh chỉnh được gì**. Đây là phần quan trọng nhất của mục này, không phải phần thuật toán.

**Bẫy Unity cụ thể**
- **Quên bù luỹ thừa** → 5 yếu tố mỗi cái 0.8 cho điểm 0.33, mọi action đều gần 0 và lựa chọn thành ngẫu nhiên.
- **`AnimationCurve.Evaluate` ngoài khoảng [0,1]** trả giá trị ngoại suy kỳ lạ. Luôn `Clamp01` đầu vào.
- **ScriptableObject dùng chung giữa các NPC** — đúng như vậy, nhưng nghĩa là không được lưu trạng thái runtime vào đó. Xem [[data-driven-design]].

**Kiểm tra nhanh**
- Bật overlay: điểm có thay đổi hợp lý khi tình huống đổi không?
- Hai action điểm sát nhau: NPC có rung không? (quán tính + cam kết tối thiểu phải chặn được)
- Thêm action thứ 10: có phải sửa action nào cũ không? (không được)

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Utility AI quyết định thế nào? Khác BT ở đâu?**
  → Mỗi tick nó **chấm điểm mọi hành động khả dĩ** rồi chọn cái cao nhất — không có ưu tiên cứng nào. BT quyết định bằng **thứ tự nhánh**, utility quyết định bằng **điểm số tương đối**. Đây là kiến trúc đằng sau The Sims, và nó hợp với NPC có nhiều nhu cầu cạnh tranh cùng lúc.
- `Junior` **Consideration là gì?**
  → Là một yếu tố đầu vào của hàm chấm điểm, được **chuẩn hoá về [0, 1]** rồi đưa qua một đường cong. Ví dụ điểm của hành động "Ăn" ghép từ mức đói và khoảng cách tới bếp. Chuẩn hoá là bắt buộc — không có nó thì các yếu tố ở thang khác nhau không so sánh được với nhau.
- `Junior` **Bốn dạng đường cong hay dùng và dùng cho gì?**
  → **Tuyến tính** `x` cho quan hệ đơn giản. **Bậc hai** `x²` cho khẩn cấp tăng dần — đói nhẹ gần như không quan trọng, đói nặng thì rất. **Nghịch đảo** `1 − x` cho "càng xa càng tệ". **Logistic** cho ngưỡng mềm: gần như tắt/bật nhưng không giật.
- `Mid` **Kết hợp các consideration bằng nhân hay cộng? Vì sao?**
  → **Nhân.** Nếu một yếu tố bằng 0 — bếp không tới được — thì toàn bộ hành động bị loại, đúng như mong muốn. Cộng sẽ cho ra điểm dương cho một hành động bất khả thi, và NPC sẽ chọn nó rồi đứng đó. Nhân thể hiện đúng quan hệ "mọi điều kiện đều phải thoả".
- `Mid` **Nhân nhiều yếu tố thì điểm bị kéo về 0. Xử lý thế nào?**
  → Đúng: `0,8⁵ = 0,33`, nên hành động nhiều consideration luôn thua hành động ít consideration dù mọi mặt đều tốt. Cách bù chuẩn là **compensation factor**: `điểm_cuối = điểm_nhân ^ (1 / số_yếu_tố)`. Nó đưa các hành động về cùng thang so sánh mà vẫn giữ tính chất "một yếu tố bằng 0 thì loại".
- `Mid` **NPC đổi ý liên tục giữa hai hành động 0,51 và 0,49. Ba cách chữa?**
  → **Bonus quán tính** — cộng 10–15% cho hành động đang thực hiện. **Cam kết tối thiểu** — hành động đã chọn phải chạy ít nhất N giây. **Chọn ngẫu nhiên trong top-K** — lấy 3 hành động điểm cao nhất rồi chọn ngẫu nhiên có trọng số. Thường dùng kết hợp cả ba.
- `Senior` **Vì sao chọn ngẫu nhiên trong top-K lại có giá trị ngoài việc chống dao động?**
  → Vì nó làm NPC **không đoán trước được mà vẫn hợp lý**. Utility AI chọn tuyệt đối theo điểm cao nhất sẽ cho ra hành vi tối ưu và lặp lại — người chơi học thuộc sau vài lần. Top-K giữ mọi lựa chọn trong vùng hợp lý nhưng thêm biến thiên, và đó là thứ tạo cảm giác NPC có cá tính.
- `Senior` **Điểm mạnh lớn nhất của Utility AI so với BT là gì, và cái giá?**
  → **Khả năng mở rộng**: thêm hành động thứ 40 không đụng chạm gì tới 39 cái cũ, trong khi BT phải quyết định chèn nhánh mới vào đâu trong thứ tự ưu tiên — và thứ tự đó ngày càng khó lý giải. Cái giá là **kiểm soát gián tiếp**: muốn NPC làm X trong tình huống Y thì phải chỉnh đường cong chứ không viết thẳng được, và gỡ lỗi phải đọc bảng điểm thay vì nhìn nhánh nào chạy.
- `Senior` **Anh chọn BT hay Utility AI cho một NPC cụ thể thế nào?**
  → Theo hình dạng quyết định. **Kẻ địch chiến đấu**: BT, vì ở đó ưu tiên là cứng và mình cần kiểm soát chính xác ("máu thấp thì phải rút lui"). **NPC sinh hoạt, sim, chiến thuật**: utility, vì các nhu cầu cạnh tranh liên tục và không có thứ tự đúng tuyệt đối. Và trộn được: BT ở tầng trên chọn chế độ, utility chọn hành động trong chế độ đó.

**Khung trả lời 60 giây** — "Utility AI hoạt động thế nào, và bẫy của nó là gì?"

> Mỗi tick, mỗi hành động được chấm điểm từ vài **consideration** đã chuẩn hoá về không tới một, mỗi cái qua một đường cong — tuyến tính, bậc hai cho khẩn cấp tăng dần, nghịch đảo cho khoảng cách, logistic cho ngưỡng mềm. Rồi **nhân** chúng lại, không cộng: một yếu tố bằng 0 phải loại hẳn hành động, còn cộng thì cho điểm dương cho việc bất khả thi.
>
> Nhân có hệ quả phụ: nhiều yếu tố thì điểm bị kéo về 0 — `0,8⁵` chỉ còn `0,33` — nên hành động phức tạp luôn thua hành động đơn giản. Bù bằng **compensation factor**, lấy căn bậc n của tích.
>
> Bẫy lớn nhất là **dao động**: hai hành động 0,51 và 0,49 làm NPC đổi ý liên tục. Ba cách chữa dùng kết hợp: bonus quán tính 10–15% cho hành động đang chạy, cam kết tối thiểu N giây, và chọn ngẫu nhiên trong top-3. Cách cuối còn có tác dụng phụ rất đáng giá — NPC không đoán trước được mà vẫn hợp lý.

**Họ sẽ đào tiếp**

- *"Chuẩn hoá về [0,1] khó ở chỗ nào?"* → Ở chỗ chọn **điểm chặn**: đói bao nhiêu là 1? Khoảng cách bao xa là 0? Các con số đó là thiết kế chứ không phải kỹ thuật, và chúng quyết định toàn bộ hành vi. Kinh nghiệm là đặt chặn theo **giá trị quan sát được trong game**, không theo giá trị lý thuyết tối đa.
- *"Debug utility AI thế nào?"* → Bảng điểm trực tiếp trên màn hình: mỗi hành động một dòng, điểm từng consideration và điểm tổng, cập nhật mỗi tick. Không có bảng đó thì mọi thứ đều là đoán, vì kết quả là số chứ không phải nhánh. Đây là chi phí công cụ bắt buộc của kiến trúc này.
- *"Utility AI có tất định không?"* → Có, cho tới khi thêm top-K ngẫu nhiên. Nếu cần tái hiện bug thì dùng seed riêng cho phần chọn đó, tách khỏi dòng ngẫu nhiên của gameplay — cùng luật với việc tách `rngContent` và `rngGameplay`.
- *"Dùng AI để làm phần này thế nào?"* → Giao cho nó **quét không gian tham số**: chạy mô phỏng với nhiều bộ đường cong rồi in ra phân bố hành động được chọn. Cái mình cần biết là "NPC có bao giờ ăn không, hay đói mãi vì khoảng cách luôn thắng" — đó là câu hỏi thống kê, không phải câu hỏi đọc code.

**Cờ đỏ**

- Cộng thay vì nhân các consideration.
- Nhân nhiều yếu tố mà không có compensation factor.
- Không có cơ chế chống dao động nào.
- Không có bảng điểm để gỡ lỗi.
- Dùng utility AI cho kẻ địch chiến đấu cần kiểm soát chính xác, rồi vật lộn để ép nó làm đúng một việc.

**Số / ví dụ nên thuộc**

- Consideration chuẩn hoá về **[0, 1]**, qua đường cong: tuyến tính · **bậc hai** · nghịch đảo · logistic.
- **Nhân, không cộng**; compensation factor `điểm ^ (1 / số_yếu_tố)`.
- `0,8⁵ = 0,33` — lý do phải bù.
- Chống dao động: quán tính **10–15%** · cam kết tối thiểu N giây · **top-K ngẫu nhiên có trọng số**.
- Kiến trúc đằng sau **The Sims**; hợp NPC sinh hoạt và chiến thuật hơn là kẻ địch chiến đấu.
