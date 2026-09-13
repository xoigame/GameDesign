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

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Ba trục tiến trình là gì?**
  → **Dọc** — số to hơn (HP 100 → 500): dễ làm, dễ hiểu, nhưng làm mất giá nội dung cũ và dễ bùng nổ chỉ số. **Ngang** — nhiều lựa chọn hơn (vũ khí, kỹ năng, build): giữ nội dung cũ còn giá trị, tạo autonomy, nhưng khó cân bằng. **Kỹ năng (mastery)** — người chơi giỏi lên, nhân vật không đổi: bền vững nhất vì không lạm phát.
- `Junior` **Chỉ dùng một trục thì hỏng thế nào?**
  → Chỉ **dọc** thì thành cày cuốc vô hồn. Chỉ **ngang** thì không có cảm giác mạnh lên. Chỉ **mastery** thì nhiều người chơi không đủ kiên nhẫn. Game tốt trộn cả ba, và câu hỏi thực sự là tỉ lệ — tỉ lệ đó nên suy ra từ động lực mình đang bán chứ không từ thể loại.
- `Junior` **Khoảng cách giữa hai phần thưởng "cảm nhận được" nên là bao lâu?**
  → Không quá **20 phút** ở giai đoạn đầu; sau khi người chơi đã gắn bó thì giãn ra được. Ba nhịp: micro 10 giây–2 phút (vàng rơi, thanh XP nhích), mid 5–20 phút (lên cấp, món đồ mới), macro 2–10 giờ (mở cơ chế mới, vùng đất mới).
- `Mid` **Đường cong XP nên chọn dạng nào?**
  → Dạng luỹ thừa `base × n^exponent` với exponent **1,5–2,2** phù hợp hơn với đa số game: nó chậm dần mà không dựng tường đột ngột. Dạng `base × growth^n` (growth 1,1–1,25) dốc hơn nhiều và rất dễ tạo tường ở giữa game. Nguyên tắc đi kèm: **thời gian lên cấp nên gần như hằng số hoặc tăng rất chậm**.
- `Mid` **Vì sao thời gian lên cấp không được phình ra?**
  → Vì người chơi cảm thấy **bị phạt vì đã chơi lâu**: cấp 1→2 mất 2 phút còn cấp 40→41 mất 6 tiếng là một thông điệp rất rõ. Cách giữ nó phẳng là để nguồn thu tăng cùng nhịp với chi phí — cùng đúng một luật với sink phải tăng cùng bậc với source trong kinh tế.
- `Mid` **Phát hiện tường cày cuốc bằng cách nào?**
  → Tính `thời_gian_tới_mốc_kế(n) = chi_phí(n) / thu_nhập_mỗi_giờ(n)` rồi **vẽ đồ thị theo n**. Nó nên khá phẳng hoặc dốc lên nhẹ; chỗ nào nhảy vọt chính là tường, và đó là nơi người chơi bỏ game. Công thức này rẻ và nó biến một cảm giác mơ hồ thành một điểm cụ thể trên trục.
- `Senior` **Roguelike chết rồi giữ lại gì? Anh quyết định thế nào?**
  → Nguyên tắc: **giữ lại lựa chọn, đừng giữ sức mạnh**. Hades mở thêm vũ khí và boon; Slay the Spire mở nhân vật và bài mới, không cộng HP vĩnh viễn; Dead Cells mở blueprint nhưng vẫn phải tìm được vật phẩm trong run. Giữ quá nhiều thì mỗi run mất ý nghĩa; giữ quá ít thì thất bại thành hình phạt thuần tuý.
- `Senior` **Khi nào chấp nhận tiến trình dọc vĩnh viễn trong roguelite?**
  → Khi dùng nó như **công cụ trợ năng** — một lượng nhỏ để người chơi kém vẫn vượt qua được — và khi có **trần rõ ràng**. Không có trần thì độ khó thật phụ thuộc số giờ đã cày chứ không phụ thuộc kỹ năng, và mọi cân bằng đường cong khó bị trôi theo thời gian chơi của từng người.
- `Senior` **Tiến trình và core loop hay bị lẫn ở chỗ nào, và hậu quả là gì?**
  → Core loop là thứ vui **ngay bây giờ**; tiến trình là lời hứa **ngày mai sẽ khác hôm nay**. Lẫn nhau vì cả hai đều thưởng. Hậu quả rất cụ thể: giữ chân kém thì đội đi thêm hệ thống tiến trình, trong khi vấn đề nằm ở mười giây gameplay không vui — và cái đó không bao giờ được sửa, chỉ được phủ thêm một lớp.

**Khung trả lời 60 giây** — "Anh thiết kế hệ thống tiến trình thế nào?"

> Tiến trình là **lời hứa rằng ngày mai sẽ khác hôm nay**, nên câu hỏi đầu tiên là khác ở chỗ nào: số to hơn (dọc), nhiều lựa chọn hơn (ngang), hay chính người chơi giỏi lên (mastery). Tôi trộn cả ba và nói rõ tỉ lệ, vì chỉ dọc là cày cuốc vô hồn, chỉ ngang là không thấy mạnh lên, chỉ mastery thì nhiều người không đủ kiên nhẫn.
>
> Về nhịp: micro vài chục giây, mid năm tới hai mươi phút, macro vài giờ — và khoảng cách giữa hai phần thưởng **cảm nhận được** không quá 20 phút ở giai đoạn đầu.
>
> Về hình dạng, tôi dùng đường cong luỹ thừa với exponent 1,5–2,2 và giữ một ràng buộc cứng: **thời gian lên cấp gần như hằng số**. Rồi vẽ `chi_phí(n) / thu_nhập_mỗi_giờ(n)` theo n — chỗ nào nhảy vọt là tường cày cuốc, và đó chính là chỗ người chơi bỏ game.

**Họ sẽ đào tiếp**

- *"Vì sao tiến trình dọc làm mất giá nội dung cũ?"* → Vì khi chỉ số tăng gấp năm thì mọi khu vực cũ trở nên vô hại, và toàn bộ công sức làm chúng chỉ còn dùng được một lần. Cách giảm thiệt hại là **level scaling có giới hạn** hoặc thiết kế nội dung cũ có giá trị khác ngoài thử thách — tài nguyên, cốt truyện, đường tắt.
- *"Quá tải lựa chọn ở tiến trình ngang xử lý thế nào?"* → Mở dần thay vì mở hết, và mỗi lần mở thì giới thiệu **một** thứ trong bối cảnh nó hữu ích. Dấu hiệu quá tải: người chơi luôn chọn cái đầu tiên trong danh sách, hoặc pick rate tập trung vào ba lựa chọn trong số hai mươi.
- *"Đo sức khoẻ của tiến trình bằng gì?"* → Thời gian giữa hai phần thưởng cảm nhận được, đường `chi_phí/thu_nhập` theo cấp, và phân bố cấp độ của người chơi đang hoạt động. Cụm dồn lại ở một cấp cụ thể là tường; đuôi dài rải đều là đường cong đang chạy đúng.
- *"Dùng AI ở khâu này thế nào?"* → Cho nó mô phỏng **nhiều kiểu người chơi** — cày nhiều, chơi ít, chơi tối ưu — rồi in ra thời gian tới từng mốc cho từng kiểu. Chỗ ba đường lệch nhau quá xa là chỗ hệ thống đang thưởng cho thời gian thay vì thưởng cho kỹ năng, và đó là thứ khó thấy khi chỉ nhìn một bảng số.

**Cờ đỏ**

- Chỉ có tiến trình dọc, và gọi đó là "hệ thống tiến trình".
- Thời gian lên cấp phình ra theo cấp mà không có nguồn thu tăng tương ứng.
- Roguelite cộng chỉ số vĩnh viễn không trần.
- Không tính được thời gian tới mốc kế tiếp ở từng cấp.
- Chữa "game chán ở giờ thứ hai" bằng cách thêm một hệ thống tiến trình nữa.

**Số / ví dụ nên thuộc**

- Ba trục: **dọc · ngang · mastery**; game tốt trộn cả ba.
- Nhịp thưởng: micro **10 s–2 phút** · mid **5–20 phút** · macro **2–10 giờ**; khoảng cách cảm nhận được ≤ **20 phút** giai đoạn đầu.
- Đường cong XP: `base × n^exponent`, exponent **1,5–2,2**; dạng `growth^n` với **1,1–1,25** dốc hơn nhiều.
- Công thức phát hiện tường: **`chi_phí(n) / thu_nhập_mỗi_giờ(n)`**, vẽ theo n, tìm đoạn nhảy vọt.
- Roguelite: **giữ lựa chọn, không giữ sức mạnh** — Hades, Slay the Spire, Dead Cells.
