---
title: Difficulty Curve
icon: 📉
summary: Điều tiết thử thách quanh vùng dòng chảy — răng cưa, trợ năng, và dynamic difficulty làm đúng cách.
status: deep
read: 200
level: intermediate
order: 50
tags: [systems, difficulty, pacing]
related: [ai-director, progression, player-motivation, pacing]
---

Lý thuyết Flow (Csíkszentmihályi): người ta chìm đắm khi **thử thách xấp xỉ kỹ năng**. Quá khó → lo âu, bỏ cuộc. Quá dễ → chán, bỏ cuộc.

Vấn đề với đường cong khó: kỹ năng người chơi tăng theo đường cong *riêng của từng người*, và bạn không biết trước.

## Hình dạng: răng cưa, không phải đường thẳng

Độ khó tăng đều tuyến tính gây mệt mỏi. Hình dạng hiệu quả là **răng cưa đi lên**:

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Đường cong độ khó hình răng cưa đi lên, so với đường tuyến tính">
  <line x1="52" y1="200" x2="646" y2="200" class="fig-line"/>
  <line x1="52" y1="24"  x2="52"  y2="200" class="fig-line"/>
  <text x="14" y="30"  class="fig-muted" font-size="11">khó</text>
  <text x="600" y="220" class="fig-muted" font-size="11">thời gian →</text>
  <path d="M52 190 L646 96" stroke="#6b7488" stroke-width="1.5" stroke-dasharray="5 4" fill="none"/>
  <text x="470" y="128" class="fig-muted" font-size="11">tuyến tính — gây mệt</text>
  <path d="M52 190 L112 150 L142 172 L202 118 L232 142 L292 88 L322 116 L382 62 L412 92 L472 44 L502 76 L562 32 L592 62 L646 30"
        stroke="#6ea8fe" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
  <g fill="#6ea8fe">
    <circle cx="112" cy="150" r="3.5"/><circle cx="202" cy="118" r="3.5"/>
    <circle cx="292" cy="88"  r="3.5"/><circle cx="382" cy="62" r="3.5"/>
    <circle cx="472" cy="44"  r="3.5"/><circle cx="562" cy="32" r="3.5"/>
  </g>
  <g class="fig-muted" font-size="10" text-anchor="middle">
    <text x="82"  y="212">học</text>
    <text x="127" y="212">nghỉ</text>
    <text x="172" y="212">luyện</text>
    <text x="217" y="212">nghỉ</text>
    <text x="262" y="212">đỉnh</text>
  </g>
  <rect x="118" y="158" width="28" height="26" rx="3" fill="#51cf9b" opacity="0.16"/>
  <rect x="208" y="126" width="28" height="26" rx="3" fill="#51cf9b" opacity="0.16"/>
  <rect x="298" y="96"  width="28" height="26" rx="3" fill="#51cf9b" opacity="0.16"/>
  <text x="330" y="240" text-anchor="middle" font-size="11" fill="#51cf9b">
    ô xanh = đoạn hạ xuống — nơi người chơi CẢM NHẬN được mình đã mạnh lên
  </text>
</svg>
<figcaption>Đoạn hạ xuống sau mỗi đỉnh không phải thời gian lãng phí. Nội dung từng khó nay thành dễ — đó chính là bằng chứng tiến bộ mà thanh XP không thay thế được.</figcaption>
</figure>

Mỗi răng cưa là một chu kỳ: **giới thiệu cơ chế (dễ) → luyện tập → thử thách đỉnh → hạ xuống**. Đoạn hạ xuống không phải thời gian lãng phí — nó là lúc người chơi *cảm nhận được mình đã mạnh lên*, vì nội dung từng khó nay đã dễ.

Đây cũng là cách dạy cơ chế mà không cần tutorial: giới thiệu riêng lẻ trong bối cảnh an toàn → kết hợp với cơ chế cũ → đưa vào thử thách đỉnh.

## Các trục điều chỉnh độ khó

Khi tăng độ khó, đừng chỉ nhân chỉ số. Thứ tự ưu tiên từ tốt đến tệ:

1. **Thêm cơ chế mới** — kẻ địch có hành vi mới đòi hỏi câu trả lời mới. Tốt nhất, vì thưởng cho việc học.
2. **Kết hợp cơ chế cũ** — cung thủ + khiên thủ cùng lúc tạo bài toán mới từ thành phần cũ. Hiệu quả, rẻ.
3. **Thu hẹp cửa sổ phản ứng** — telegraph 900ms → 650ms. Thưởng cho kỹ năng thật.
4. **Tăng mật độ** — nhiều kẻ địch hơn. Dùng được nhưng nhanh chán.
5. **Nhân chỉ số** — HP ×3, sát thương ×2. Tệ nhất: biến trận đấu thành dài hơn chứ không khó hơn, và làm mất giá kỹ năng.

Phần lớn game dở chỉ dùng cách 5.

## Dynamic Difficulty Adjustment

Điều chỉnh độ khó theo thời gian thực dựa trên hiệu suất người chơi. Mạnh nhưng dễ phản tác dụng.

**Nguyên tắc sống còn: người chơi không được phép nhận ra.** Nếu họ phát hiện game đang nương tay, mọi chiến thắng mất ý nghĩa — bạn vừa phá huỷ nhu cầu *competence* ở [[player-motivation]].

An toàn để điều chỉnh ngầm:
- Tần suất rơi máu / đạn dược
- Nhịp spawn và khoảng nghỉ giữa các đợt
- Tính hung hăng của AI (xem [[ai-director]])
- Độ chính xác của kẻ địch ở mức thấp hơn ngưỡng nhận biết

Nguy hiểm nếu điều chỉnh:
- HP / sát thương kẻ địch — người chơi **đếm được số đòn** và sẽ nhận ra ngay
- Bất cứ thứ gì làm kết quả một hành động cụ thể thay đổi giữa chừng

**Rubber-banding trong game đua** là ví dụ kinh điển về cách làm sai: ai cũng nhận ra, và nó khiến việc chơi giỏi trở nên vô nghĩa ở giai đoạn giữa.

## Trợ năng thay vì chọn độ khó

Xu hướng hiện đại (Celeste, Hades, The Last of Us Part II): thay vì Dễ/Thường/Khó, cung cấp **các công tắc riêng lẻ** — tốc độ game, bất tử, bỏ qua phòng, hỗ trợ ngắm.

Ưu điểm:
- Người chơi tự điều chỉnh đúng rào cản của mình thay vì chấp nhận một gói cố định.
- Không gắn nhãn giá trị ("dễ" nghe như thất bại).
- Đơn giản hoá cân bằng — bạn chỉ cân bằng một đường cong duy nhất.

Celeste đóng khung phần này là "Assist Mode" với lời nhắn rõ ràng rằng đây không phải gian lận. Cách trình bày quan trọng ngang bản thân tính năng.

## Đo bằng số liệu

Đừng đoán đường cong khó. Hãy log và đọc (xem [[playtesting-metrics]]):

| Chỉ số | Ý nghĩa |
|---|---|
| Số lần chết mỗi màn | Đỉnh đột biến = tường khó |
| Thời gian hoàn thành (trung vị + phân vị 90) | Đuôi dài = một nhóm đang vật lộn |
| Tỉ lệ bỏ cuộc theo màn | Chỉ báo trực tiếp nhất |
| Tỉ lệ thử lại sau khi chết | Giảm mạnh = đã vượt ngưỡng chịu đựng |

Mốc thực dụng: **trung vị 2–5 lần chết ở một trận boss là lành mạnh**. Trên 10 là tường. Dưới 1 nghĩa là boss không phải thử thách.

## 🤖 Prompt cho AI

Độ khó là chỗ AI mặc định nhân chỉ số — cách tệ nhất trong năm cách tăng độ khó.

**Phải nêu rõ:**
- Trục tăng độ khó nào được dùng, và **cấm** trục nào
- Hình dạng răng cưa: chu kỳ bao lâu, biên độ bao nhiêu
- Nếu dùng DDA: điều chỉnh được phép chạm vào gì, cấm chạm vào gì
- Số liệu mục tiêu: bao nhiêu lần chết ở boss là "đúng"

**Mẫu prompt**

```
Thiết kế đường cong khó cho 12 màn.

ĐƯỢC tăng khó bằng: cơ chế mới, kết hợp cơ chế cũ, thu hẹp cửa sổ phản ứng.
CẤM tăng khó bằng: nhân HP, nhân sát thương, tăng số lượng quái đơn thuần.
  → nếu đề xuất nào cần các cách bị cấm, hãy nói rõ và đề nghị phương án khác.

Cấu trúc răng cưa: mỗi 3 màn là 1 chu kỳ
  màn 1 = giới thiệu cơ chế mới trong bối cảnh an toàn
  màn 2 = áp dụng có phạt
  màn 3 = kết hợp với cơ chế đã học trước đó, rồi hạ xuống

Mục tiêu số liệu: trung vị 2-5 lần chết ở boss mỗi chu kỳ.
Viết bảng 12 màn: cơ chế mới, cơ chế kết hợp, ngân sách quái, TTK dự kiến.
```

**Bẫy thường gặp:** AI thêm DDA chạm vào HP/sát thương kẻ địch. Người chơi **đếm được số đòn** nên sẽ phát hiện ngay và mất hết cảm giác thành tựu. Cấm rõ hai trường đó.

## 🎮 Unity

Đường cong khó trong Unity nên là **dữ liệu quét được**, không phải số rải trong prefab.

**Nơi các quyết định sống**

- `Assets/Data/Levels/*.asset` — mỗi màn một `LevelData` (ngân sách quái, cơ chế mới)
- `Core/Difficulty/` — logic tính ngân sách, C# thuần
- `Assets/Editor/DifficultyValidator.cs` — quét toàn bộ màn, cảnh báo tường khó

**LevelData — cơ chế, không phải nhân chỉ số**

```csharp
[CreateAssetMenu(menuName = "Game/Level Data")]
public class LevelData : ScriptableObject {
    [Header("Cơ chế — cách tăng khó ĐÚNG")]
    public EnemyData[] newMechanics;      // cơ chế lần đầu xuất hiện
    public EnemyData[] combinedWith;      // kết hợp với cơ chế đã học

    [Header("Ngân sách")]
    public int spawnBudget = 12;

    [Header("Cửa sổ phản ứng — thu hẹp dần")]
    [Range(0.3f, 1.5f)] public float telegraphScale = 1f;

    // KHÔNG có hpMultiplier / damageMultiplier ở đây — cố ý.
    // Nhân chỉ số làm trận đấu DÀI hơn, không KHÓ hơn.
}
```

Việc **không có** `hpMultiplier` là quyết định thiết kế được cưỡng chế bằng schema. Agent hay người mới sẽ không thêm được nó mà không sửa class — và lúc đó có review.

**Validator quét chu trình răng cưa**

```csharp
[MenuItem("Tools/Difficulty/Validate Curve")]
static void Validate() {
    var levels = LoadAllSorted();
    for (int i = 0; i < levels.Length; i++) {
        var l = levels[i];
        // Cơ chế mới phải xuất hiện trong bối cảnh an toàn TRƯỚC khi bị kiểm tra
        foreach (var m in l.combinedWith)
            if (!levels.Take(i).Any(prev => prev.newMechanics.Contains(m)))
                Debug.LogError($"Màn {i}: kết hợp {m.name} chưa từng được giới thiệu", l);

        // Đoạn hạ xuống sau cao trào
        if (i >= 2 && l.spawnBudget > levels[i-1].spawnBudget
                   && levels[i-1].spawnBudget > levels[i-2].spawnBudget)
            Debug.LogWarning($"Màn {i}: ba màn tăng liên tiếp, thiếu đoạn nghỉ", l);
    }
}
```

Đây là cách biến nguyên tắc "răng cưa" và "dạy trước khi kiểm tra" từ lời khuyên thành **luật máy kiểm tra được**.

**DDA an toàn trong Unity**

Chỉ điều chỉnh những thứ người chơi không đo được:

```csharp
// ✅ an toàn — người chơi không đếm được tỉ lệ rơi đồ
lootTable.healthDropWeight = Mathf.Lerp(1f, 3f, struggleScore);
director.relaxDuration = Mathf.Lerp(30f, 48f, struggleScore);

// ❌ người chơi ĐẾM ĐƯỢC số đòn để hạ một con quái
enemy.maxHealth *= difficultyMultiplier;
```

**Kiểm tra nhanh**
- Chạy Validate Curve: có màn nào kết hợp cơ chế chưa dạy không?
- Grep `hpMultiplier`/`damageMultiplier` trong code độ khó → nên bằng 0?
- Log số lần chết mỗi màn: trung vị 2–5 ở boss chứ?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Lý thuyết Flow nói gì về độ khó?**
  → Người ta chìm đắm khi **thử thách xấp xỉ kỹ năng** (Csíkszentmihályi). Quá khó thì lo âu và bỏ cuộc, quá dễ thì chán và cũng bỏ cuộc. Vấn đề thực tế: kỹ năng người chơi tăng theo đường cong **riêng của từng người** và mình không biết trước — nên thiết kế phải chịu được nhiều đường cong khác nhau, không chỉ một.
- `Junior` **Vì sao đường cong khó nên là răng cưa chứ không phải đường thẳng?**
  → Vì tăng đều tuyến tính gây mệt mỏi và không có chỗ để cảm nhận tiến bộ. Mỗi răng cưa là một chu kỳ: giới thiệu cơ chế (dễ) → luyện tập → thử thách đỉnh → hạ xuống. **Đoạn hạ xuống không lãng phí** — đó là lúc người chơi thấy nội dung từng khó nay đã dễ, tức là thấy mình đã mạnh lên.
- `Junior` **Tăng độ khó có mấy cách, và cách nào tệ nhất?**
  → Từ tốt tới tệ: thêm cơ chế mới → kết hợp cơ chế cũ → thu hẹp cửa sổ phản ứng (telegraph 900 ms → 650 ms) → tăng mật độ → **nhân chỉ số**. Nhân chỉ số tệ nhất vì nó làm trận đấu **dài hơn chứ không khó hơn**, và làm mất giá kỹ năng. Phần lớn game dở chỉ dùng đúng cách cuối.
- `Mid` **Dynamic Difficulty Adjustment: cái gì được điều chỉnh ngầm, cái gì không?**
  → An toàn: tần suất rơi máu và đạn, nhịp spawn, khoảng nghỉ giữa các đợt, độ hung hăng của AI, độ chính xác của địch dưới ngưỡng nhận biết. **Nguy hiểm**: HP và sát thương của địch — người chơi **đếm được số đòn** nên nhận ra ngay. Nguyên tắc sống còn là người chơi không được phép nhận ra.
- `Mid` **Vì sao rubber-banding trong game đua là ví dụ kinh điển về cách làm sai?**
  → Vì ai cũng nhận ra, và khi đã nhận ra thì chơi giỏi ở giai đoạn giữa trở nên vô nghĩa — dẫn trước bao nhiêu cũng bị kéo lại. Nó phá đúng nhu cầu **competence**: chiến thắng không còn là kết quả của kỹ năng. Bài học chung: DDA bị phát hiện thì tệ hơn không có DDA.
- `Mid` **Số lần chết bao nhiêu ở một trận boss là lành mạnh?**
  → Trung vị **2–5 lần**. Trên 10 là tường khó. Dưới 1 nghĩa là boss không phải thử thách. Kèm theo là ba chỉ số khác: thời gian hoàn thành (trung vị **và** phân vị 90 — đuôi dài nghĩa là một nhóm đang vật lộn), tỉ lệ bỏ cuộc theo màn, và tỉ lệ thử lại sau khi chết.
- `Senior` **Chọn độ khó hay công tắc trợ năng? Vì sao xu hướng đổi?**
  → Công tắc riêng lẻ — tốc độ game, bất tử, bỏ qua phòng, hỗ trợ ngắm — có ba lợi thế: người chơi tự gỡ **đúng rào cản của mình** thay vì nhận một gói cố định; không gắn nhãn giá trị ("dễ" nghe như thất bại); và mình chỉ phải cân bằng **một đường cong duy nhất**. Celeste đóng khung nó là "Assist Mode" với lời nhắn rõ đây không phải gian lận — cách trình bày quan trọng ngang tính năng.
- `Senior` **Tỉ lệ thử lại sau khi chết giảm mạnh ở màn 7. Anh kết luận gì?**
  → Đó là chỉ báo trực tiếp nhất rằng đã vượt ngưỡng chịu đựng — không phải "khó" mà là **khó theo cách không đáng thử lại**. Tôi xem tiếp hai thứ: thời gian từ lúc chết tới lúc chơi lại (trên 3 giây là tự phạt người chơi thêm một lần), và cái chết có đọc được nguyên nhân không. Rất thường là vấn đề truyền đạt chứ không phải vấn đề số.
- `Senior` **Làm đường cong khó cho game có nhiều nhóm kỹ năng rất khác nhau — anh làm thế nào?**
  → Thiết kế **một đường cong lõi** cho nhóm mục tiêu, rồi mở rộng hai đầu bằng thứ tách rời: công tắc trợ năng cho nhóm dưới, nội dung tuỳ chọn khó hơn cho nhóm trên. Cái không nên làm là kéo giãn cùng một đường cong cho vừa cả hai — nó cho ra một đường cong nhạt ở giữa và không nhóm nào thấy đúng tầm.

**Khung trả lời 60 giây** — "Anh thiết kế đường cong độ khó thế nào?"

> Hình dạng trước, con số sau. Hình dạng là **răng cưa đi lên**, mỗi răng là một chu kỳ giới thiệu → luyện tập → thử thách đỉnh → hạ xuống. Đoạn hạ xuống là chỗ người chơi cảm nhận mình đã mạnh lên, nên nó không phải thời gian lãng phí — bỏ nó đi thì game chỉ còn mệt.
>
> Khi cần tăng khó, tôi đi theo thứ tự: thêm cơ chế mới, kết hợp cơ chế cũ, thu hẹp cửa sổ phản ứng, tăng mật độ, và **cuối cùng** mới nhân chỉ số. Nhân chỉ số làm trận đấu dài hơn chứ không khó hơn, và phần lớn game dở chỉ dùng đúng cách đó.
>
> Rồi tôi đo thay vì đoán: số lần chết mỗi màn, thời gian hoàn thành ở trung vị và phân vị 90, tỉ lệ bỏ cuộc, tỉ lệ thử lại sau khi chết. Mốc thực dụng là **trung vị 2–5 lần chết ở boss** — trên 10 là tường, dưới 1 nghĩa là boss không phải thử thách.

**Họ sẽ đào tiếp**

- *"Vì sao phải nhìn cả phân vị 90, không chỉ trung vị?"* → Vì trung vị mô tả người chơi điển hình còn **đuôi dài mô tả người sắp bỏ**. Một màn có trung vị 4 phút và phân vị 90 là 22 phút nghĩa là có cả một nhóm đang vật lộn với thứ mà thiết kế không nhìn thấy — thường là một cơ chế chưa được dạy đủ, chứ không phải độ khó nói chung.
- *"DDA có bao giờ đúng không?"* → Có, khi nó điều chỉnh **tài nguyên và nhịp** chứ không điều chỉnh kết quả một hành động cụ thể. Cho rơi thêm băng cứu thương khi người chơi máu thấp thì không ai đếm được; giảm HP con boss giữa trận thì đếm được. Ranh giới là: người chơi có thể **quan sát trực tiếp** thứ mình đang đổi không.
- *"Dạy cơ chế bằng đường cong khó thế nào?"* → Chính là ba nhịp của một răng cưa: giới thiệu riêng lẻ trong bối cảnh an toàn → kết hợp với cơ chế cũ → đưa vào thử thách đỉnh. Làm được thế thì không cần hộp thoại tutorial nào, và người chơi nhớ lâu hơn vì họ học bằng cách chơi chứ không bằng cách đọc.
- *"Trợ năng có làm mất bản sắc game khó không?"* → Không, nếu đóng khung đúng và nếu **mặc định vẫn là đường cong lõi**. Điều làm mất bản sắc là thay đổi lặng lẽ độ khó mặc định để giảm tỉ lệ bỏ cuộc — lúc đó người chơi giỏi mất thứ họ tới vì nó, còn người chơi mới thì vẫn chưa được giúp đúng chỗ.

**Cờ đỏ**

- Tăng độ khó chỉ bằng nhân HP và sát thương.
- Đường cong tuyến tính, không có đoạn hạ xuống nào.
- DDA chỉnh HP hoặc sát thương của địch.
- Đặt độ khó bằng cảm giác, không log số lần chết và tỉ lệ bỏ cuộc.
- Gọi chế độ trợ năng là "dễ" và để nó nghe như thừa nhận thất bại.

**Số / ví dụ nên thuộc**

- Flow: **thử thách ≈ kỹ năng**; Csíkszentmihályi.
- Thứ tự tăng khó: cơ chế mới → kết hợp → **thu hẹp cửa sổ phản ứng** (900 ms → 650 ms) → mật độ → nhân chỉ số.
- Boss: trung vị **2–5 lần chết**; > 10 là tường; < 1 là không phải thử thách.
- Chỉ số theo dõi: chết mỗi màn · thời gian hoàn thành (**trung vị + P90**) · tỉ lệ bỏ cuộc · **tỉ lệ thử lại**.
- DDA an toàn: rơi máu/đạn, nhịp spawn, độ hung hăng AI. Cấm: **HP và sát thương của địch**.
