---
title: Progression Systems
icon: 📈
summary: Người chơi mạnh lên bằng cách nào — tiến trình dọc, ngang, và tiến trình kỹ năng thật sự.
status: deep
read: 170
level: intermediate
order: 20
tags: [systems, progression]
related: [economy-design, core-loop, difficulty-curve, meta-systems]
---

Tiến trình là **lời hứa rằng ngày mai sẽ khác hôm nay**. Nó là lý do người chơi quay lại.

## Ba trục

**Tiến trình dọc (vertical)** — số to hơn. HP 100 → 500, sát thương 12 → 60.
Dễ làm, dễ hiểu, dễ điều tiết. Nhược điểm: làm mất giá nội dung cũ và dễ dẫn tới bùng nổ chỉ số.

**Tiến trình ngang (horizontal)** — nhiều lựa chọn hơn. Mở thêm vũ khí, kỹ năng, đường build.
Giữ nội dung cũ còn giá trị, tạo autonomy (xem [[player-motivation]]). Nhược điểm: khó cân bằng, dễ gây quá tải lựa chọn.

**Tiến trình kỹ năng (mastery)** — *người chơi* giỏi lên, nhân vật không đổi.
Dạng bền vững nhất: không lạm phát, không mất giá. Đây là trục chính của Souls, các game đối kháng, Celeste.

Game tốt trộn cả ba. Chỉ dọc → cày cuốc vô hồn. Chỉ ngang → cảm giác không mạnh lên. Chỉ mastery → nhiều người chơi không đủ kiên nhẫn.

## Nhịp độ

Quy tắc thực dụng cho tần suất phần thưởng:

- **Micro** (10 giây – 2 phút): phản hồi nhỏ. Vàng rơi, thanh XP nhích.
- **Mid** (5 – 20 phút): thay đổi cảm nhận được. Lên cấp, món đồ mới.
- **Macro** (2 – 10 giờ): thay đổi cách chơi. Mở cơ chế mới, vùng đất mới.

Khoảng cách giữa hai phần thưởng "cảm nhận được" **không nên vượt quá 20 phút** ở giai đoạn đầu. Sau khi người chơi đã gắn bó, khoảng cách có thể giãn ra.

## Hình dạng đường cong

Đường cong XP thường gặp:

```
xp_cần(n) = base × n^exponent          # exponent 1.5–2.2
xp_cần(n) = base × growth^n            # growth 1.1–1.25, dốc hơn nhiều
```

Đường cong luỹ thừa (dạng đầu) phù hợp hơn với đa số game — nó chậm dần mà không dựng tường đột ngột.

Mẹo thực tế: **thời gian lên cấp nên gần như hằng số hoặc tăng rất chậm.** Nếu cấp 1→2 mất 2 phút và cấp 40→41 mất 6 tiếng, người chơi cảm thấy bị phạt vì đã chơi lâu. Hãy để nguồn thu tăng cùng nhịp với chi phí (xem [[economy-design]]).

## Tiến trình vĩnh viễn trong game roguelike

Câu hỏi căng thẳng nhất của thể loại này: chết rồi giữ lại gì?

- **Giữ quá nhiều** → mỗi run mất ý nghĩa, game biến thành cày để vượt tường chỉ số.
- **Giữ quá ít** → thất bại thành hình phạt thuần tuý, người chơi mới nản.

Giải pháp thường thấy — **giữ lại lựa chọn chứ đừng giữ sức mạnh**:
- Hades: mở thêm vũ khí, boon, biến thể (ngang) hơn là cộng chỉ số thẳng.
- Slay the Spire: mở nhân vật và bài mới, không cộng HP vĩnh viễn.
- Dead Cells: mở blueprint, nhưng vẫn phải tìm được vật phẩm trong run.

Ngoại lệ có chủ đích: một lượng nhỏ tiến trình dọc vĩnh viễn giúp người chơi kém vẫn vượt qua được — đây là công cụ trợ năng, nên đặt trần rõ ràng.

## Cái bẫy: tường cày cuốc

Tường cày cuốc xuất hiện khi chi phí tăng nhanh hơn nguồn thu. Phát hiện bằng cách tính:

```
thời_gian_tới_mốc_kế(n) = chi_phí(n) / thu_nhập_mỗi_giờ(n)
```

Vẽ đồ thị hàm này theo `n`. Nó nên khá phẳng, hoặc dốc lên nhẹ. Nếu có đoạn nhảy vọt — đó là tường, và đó là nơi người chơi bỏ game. Xem [[balancing-math]] để biết cách mô phỏng.

## 🤖 Prompt cho AI

```yaml
progression:
  vertical:
    player_hp: { base: 100, per_level: 8, cap_level: 50 }
    xp_curve: "100 * level^1.8"
  horizontal:
    unlocks: [weapon, passive, companion]
    choice_per_level: 3          # chọn 1 trong 3
  permanent:            # roguelike meta
    type: "unlock_only"
    forbidden: "cộng thẳng chỉ số vĩnh viễn"   # ràng buộc cứng
```

Dòng `forbidden` quan trọng không kém các dòng còn lại — nó ngăn agent "giúp" bạn bằng cách thêm nâng cấp chỉ số vĩnh viễn vì đó là thứ phổ biến nhất trong dữ liệu huấn luyện của nó. Xem [[agent-guardrails]].

## 🎮 Unity

Unity có `AnimationCurve` — công cụ tuyệt vời cho đường cong tiến trình mà ít người dùng đúng chỗ.

**Component & nơi đặt**
- `ProgressionConfig` (ScriptableObject) — đường cong XP, HP, chi phí
- `PlayerStats.cs` — đọc curve, không chứa hằng số

**Code**

```csharp
[CreateAssetMenu(menuName = "Game/Progression Config")]
public class ProgressionConfig : ScriptableObject {
    [Header("Đường cong — chỉnh trực tiếp bằng chuột trong Inspector")]
    public AnimationCurve xpToNextLevel =
        AnimationCurve.EaseInOut(1f, 100f, 50f, 12000f);

    public AnimationCurve hpByLevel =
        AnimationCurve.Linear(1f, 100f, 50f, 500f);

    [Header("Kiểm tra nhịp độ")]
    public float targetMinutesPerLevel = 15f;

    public float XpFor(int level)  => xpToNextLevel.Evaluate(level);
    public float HpFor(int level)  => hpByLevel.Evaluate(level);
}
```

**Vì sao AnimationCurve hơn công thức**

Công thức `100 * level^1.8` khó hình dung. `AnimationCurve` cho bạn **kéo bằng chuột và nhìn thấy hình dạng ngay** — bao gồm cả chỗ dốc đột ngột (tường cày cuốc) mà công thức che giấu.

Nhược điểm: khó tái tạo ngoài Unity (ví dụ trong script mô phỏng Python). Cách dung hoà: dùng curve để *tìm* hình dạng, rồi fit một công thức xấp xỉ cho phần mô phỏng.

**Editor tool: kiểm tra tường cày cuốc**

```csharp
[CustomEditor(typeof(ProgressionConfig))]
public class ProgressionConfigEditor : Editor {
    public override void OnInspectorGUI() {
        DrawDefaultInspector();
        var cfg = (ProgressionConfig)target;

        if (GUILayout.Button("Kiểm tra nhịp độ")) {
            for (int lv = 1; lv < 50; lv++) {
                float minutes = cfg.XpFor(lv) / XpPerMinute(lv);
                if (minutes > cfg.targetMinutesPerLevel * 1.5f)
                    Debug.LogWarning($"Tường cày cuốc ở cấp {lv}: {minutes:F0} phút");
            }
        }
    }
}
```

Một nút trong Inspector, và nó bắt được đúng vấn đề mà [[balancing-math]] mô tả — trước khi người chơi gặp phải.

**Meta-progression: lưu ở đâu**

Không dùng `PlayerPrefs` cho tiến trình thật. Nó lưu trong registry (Windows), dễ mất, không sao lưu được, giới hạn kích thước.

```csharp
// Dùng JSON trong Application.persistentDataPath
var json = JsonUtility.ToJson(saveData, prettyPrint: true);
File.WriteAllText(Path.Combine(Application.persistentDataPath, "save.json"), json);
```

Và luôn giữ một bản backup trước khi ghi đè — xem [[ux-flow]].

**Kiểm tra nhanh**
- Bấm "Kiểm tra nhịp độ" — có cảnh báo tường nào không?
- Grep số cứng liên quan XP/HP trong code — phải bằng 0.
- `PlayerPrefs` chỉ dùng cho settings, không cho tiến trình?
