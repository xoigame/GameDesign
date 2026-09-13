---
title: Randomness & RNG
icon: 🎲
summary: Input vs output randomness, pity system, shuffle bag — dùng ngẫu nhiên để tạo kịch tính chứ không tạo bất công.
status: deep
read: 210
level: intermediate
order: 60
tags: [systems, rng, math]
related: [balancing-math, procedural-generation, difficulty-curve]
---

Ngẫu nhiên trong game phục vụ hai việc: làm mỗi lần chơi khác nhau, và tạo khoảnh khắc bất ngờ. Nó **không** phục vụ việc làm người chơi thua vì lý do họ không kiểm soát được — nhưng đó lại là thứ random thuần làm giỏi nhất.

## Phân biệt quan trọng nhất

**Input randomness** — ngẫu nhiên xảy ra *trước* quyết định của người chơi. Bài trên tay, bản đồ được sinh ra, vật phẩm được chào bán. Người chơi **thích nghi** với nó → tạo ra kỹ năng.

**Output randomness** — ngẫu nhiên xảy ra *sau* quyết định. Tỉ lệ trúng, sát thương dao động, crit. Người chơi **chịu đựng** nó → tạo ra ức chế.

<figure class="fig">
<svg viewBox="0 0 660 216" role="img" aria-label="Trục thời gian một lượt chơi: ngẫu nhiên trước quyết định tạo kỹ năng, ngẫu nhiên sau quyết định tạo ức chế">
  <line x1="30" y1="108" x2="630" y2="108" class="fig-line"/>
  <path d="M624 103 L636 108 L624 113 Z" class="fig-line" fill="currentColor"/>
  <rect x="286" y="86" width="96" height="44" rx="8" class="fig-box"/>
  <text x="334" y="106" text-anchor="middle" class="fig-label" font-size="12">QUYẾT ĐỊNH</text>
  <text x="334" y="122" text-anchor="middle" class="fig-muted" font-size="10">của người chơi</text>
  <rect x="40" y="30" width="222" height="40" rx="6" fill="#51cf9b" opacity="0.18"/>
  <text x="151" y="46" text-anchor="middle" font-size="12" fill="#51cf9b">Input randomness</text>
  <text x="151" y="62" text-anchor="middle" class="fig-muted" font-size="10">bài trên tay · bố cục phòng · hàng trong shop</text>
  <line x1="151" y1="70" x2="151" y2="86" class="fig-line"/>
  <text x="151" y="160" text-anchor="middle" class="fig-muted" font-size="11">người chơi THÍCH NGHI</text>
  <text x="151" y="178" text-anchor="middle" font-size="11" fill="#51cf9b">→ sinh ra kỹ năng</text>
  <rect x="406" y="30" width="222" height="40" rx="6" fill="#ff8787" opacity="0.18"/>
  <text x="517" y="46" text-anchor="middle" font-size="12" fill="#ff8787">Output randomness</text>
  <text x="517" y="62" text-anchor="middle" class="fig-muted" font-size="10">tỉ lệ trúng · crit · dao động sát thương</text>
  <line x1="517" y1="70" x2="517" y2="86" class="fig-line"/>
  <text x="517" y="160" text-anchor="middle" class="fig-muted" font-size="11">người chơi CHỊU ĐỰNG</text>
  <text x="517" y="178" text-anchor="middle" font-size="11" fill="#ff8787">→ sinh ra ức chế</text>
  <text x="30" y="200" class="fig-muted" font-size="10">cùng một xác suất, đặt hai bên khác nhau cho ra hai trải nghiệm khác hẳn</text>
</svg>
<figcaption>Vị trí của viên xúc xắc so với quyết định quan trọng hơn bản thân xác suất.</figcaption>
</figure>

Nguyên tắc: **ưu tiên input randomness.** Nếu dùng output randomness, hãy để nó ảnh hưởng tới *mức độ tốt*, đừng để nó quyết định *thành hay bại*. "Đòn này gây 90–110 sát thương" là chấp nhận được; "đòn này có 10% trượt hoàn toàn" thì không, vì nó xoá luôn quyết định người chơi vừa đưa ra.

Into the Breach là ví dụ cực đoan đáng nhớ: bỏ sạch output randomness khỏi chiến đấu, mọi nước đi của địch hiện rõ trước. Kịch tính không mất đi, nó chuyển từ "cầu cho trúng" sang "tìm nước đi đúng".

## Vì sao người chơi cảm nhận ngẫu nhiên rất tệ

Con người không có trực giác về chuỗi ngẫu nhiên. Chúng ta mong đợi ngẫu nhiên trông *đều*, trong khi ngẫu nhiên thật thì vón cục.

Lấy tỉ lệ trúng 80% — con số nghe rất an toàn:

| Sự kiện | Xác suất mỗi lần |
|---|---|
| Trượt 1 đòn | 20% |
| Trượt 2 đòn liên tiếp | 4% |
| Trượt 3 đòn liên tiếp | 0,8% |
| Trượt 5 đòn liên tiếp | 0,032% |

0,8% nghe như không bao giờ xảy ra. Nhưng một phiên chơi có khoảng **300 đòn đánh**, nên trung bình mỗi phiên bạn sẽ gặp **hơn hai lần** chuỗi trượt ba đòn liên tiếp. Người chơi không tính xác suất — họ nhớ cái lần trượt ba đòn ngay trước khi chết, và kết luận game bị hỏng hoặc gian lận.

Hệ quả thiết kế: **random thuần hiếm khi là lựa chọn đúng.** Thứ bạn muốn không phải là xác suất đúng về mặt toán học, mà là phân phối *cảm thấy* công bằng. Bốn công cụ dưới đây làm đúng việc đó.

## Bốn cách sửa ngẫu nhiên

| Kỹ thuật | Ý tưởng | Hợp cho | Đánh đổi |
|---|---|---|---|
| **Pity / bad-luck protection** | trượt càng nhiều, xác suất càng tăng | drop hiếm, gacha, loot boss | cần lưu trạng thái đếm |
| **Shuffle bag** | bỏ N kết quả vào túi, rút không hoàn lại | khối Tetris, bài rút, loại kẻ địch | tỉ lệ chính xác nhưng **đoán được** cuối túi |
| **PRD (pseudo-random distribution)** | xác suất tăng tuyến tính sau mỗi lần trượt | crit, proc kỹ năng | phải tra hằng số C, xác suất thực khác danh nghĩa |
| **Trọng số + loại trừ** | bảng trọng số, cấm lặp lại kết quả vừa ra | bố cục phòng, nhạc nền, câu thoại | cần dữ liệu ngoài code |

Điểm chung: cả bốn đều **bóp đuôi phân phối** — giữ nguyên kỳ vọng nhưng cắt bỏ những chuỗi xui cực đoan. Đó chính là phần người chơi nhớ.

## Pity system: công thức và ngưỡng

Công thức đơn giản, dễ hiểu, dễ giao cho AI:

```
p_thực_tế(n) = min(1, p_gốc + tăng_dần × số_lần_thất_bại_liên_tiếp)
```

Với `p_gốc = 5%` và `tăng_dần = 3%`: lần thất bại thứ 32 là chắc chắn trúng. Người chơi cảm thấy công bằng mà vẫn giữ được yếu tố bất ngờ.

Chọn `tăng_dần` bằng cách đi ngược từ **trần chịu đựng** — số lần trượt tối đa bạn chấp nhận cho người chơi nếm:

| `p_gốc` | Trần mong muốn | `tăng_dần` cần thiết |
|---|---|---|
| 5% | 32 lần | 0,030 |
| 5% | 20 lần | 0,048 |
| 1% | 100 lần | 0,010 |
| 10% | 15 lần | 0,060 |

Công thức ngược: `tăng_dần = (1 − p_gốc) / trần`.

Hai điều cần biết trước khi dùng:

- **Xác suất trung bình thực tế cao hơn `p_gốc`.** Pity kéo kỳ vọng lên, nên nếu bạn cân bằng kinh tế dựa trên 5% thì số liệu sẽ lệch. Hãy mô phỏng 100.000 lần rút để lấy tỉ lệ thật rồi mới cân bằng — xem [[balancing-math]].
- **Trạng thái đếm phải lưu vào save.** Người chơi thoát game ở lần trượt thứ 30 mà quay lại bị reset về 0 sẽ giận hơn là không có pity ngay từ đầu.

Nếu game của bạn bán vật phẩm bằng tiền thật, nhiều thị trường **bắt buộc công bố tỉ lệ**. Pity làm tỉ lệ thực khác tỉ lệ danh nghĩa, nên phải công bố cả hai — xem [[economy-design]].

## Shuffle bag: khi tỉ lệ phải đúng, không chỉ đúng trung bình

Bỏ đúng N kết quả theo tỉ lệ mong muốn vào một túi, xáo lên, rút **không hoàn lại**. Hết túi thì đổ lại.

```
Túi 10 viên cho tỉ lệ rơi 30%:  [X X X _ _ _ _ _ _ _]
Rút hết 10 lần → đúng 3 lần trúng. Không hơn, không kém.
```

Tetris hiện đại dùng đúng cách này với túi 7 khối: mỗi túi chứa đủ bảy loại khối, nên bạn không bao giờ phải chờ quá **12 khối** để gặp lại khối I. Trước khi có 7-bag, chuỗi xui 20 khối không có I là chuyện có thật và nó giết ván chơi.

Cái giá: **cuối túi thì đoán được**. Người chơi giỏi sẽ đếm — và trong game đối kháng, đó có thể là tính năng chứ không phải lỗi. Nếu không muốn, hãy dùng túi lớn hơn hoặc trộn lại khi còn 2–3 viên cuối.

## Seed: một dòng hay nhiều dòng

Đây là quyết định kiến trúc, và sửa muộn rất đắt.

Dùng **một** bộ sinh toàn cục nghĩa là: người chơi bắn thêm một phát → bố cục phòng kế tiếp đổi. Hệ quả là bạn mất ba thứ cùng lúc: tái hiện bug từ báo cáo của người chơi, daily challenge giống nhau cho mọi người, và khả năng so sánh hai phiên bản thuật toán [[procedural-generation]] trên cùng bản đồ.

Tách tối thiểu thành hai dòng:

- **`rngContent`** — procgen, bố cục, chiến lợi phẩm được chào. Nhận seed cố định, **không** bị hành động người chơi ảnh hưởng.
- **`rngGameplay`** — mọi thứ xảy ra trong lúc chơi.

Thứ thuần trang trí (lệch pha particle, biến thể cao độ âm thanh) thì dùng bộ sinh toàn cục nào cũng được — nhưng đừng để nó rút từ hai dòng trên.

## Bảng trọng số nên nằm ngoài code

Mọi bảng tỉ lệ đều sẽ bị chỉnh hàng chục lần trong quá trình cân bằng. Bảng nằm trong code nghĩa là mỗi lần chỉnh là một lần build.

```
loot_table.csv
id,          weight, pity_base, pity_step, cấm_lặp
common_ore,  70,     -,         -,         không
rare_gem,    25,     -,         -,         có
legendary,   5,      0.05,      0.03,      có
```

Cột `cấm_lặp` là thứ hay bị quên: ngẫu nhiên có trọng số vẫn cho ra cùng kết quả hai lần liên tiếp, và với thứ người chơi nhìn thấy — câu thoại, loại phòng, bài nhạc — điều đó phá vỡ ảo giác đa dạng nhanh hơn bất cứ thứ gì. Cấm lặp kết quả vừa ra là một dòng code và đáng giá. Xem [[data-driven-design]].

## Kiểm tra nhanh

- Mỗi chỗ dùng ngẫu nhiên: nó nằm **trước** hay **sau** quyết định của người chơi?
- Có chỗ nào output randomness quyết định thành/bại thay vì mức độ không?
- Chuỗi xui dài nhất người chơi có thể gặp là bao nhiêu? Bạn có chấp nhận con số đó không?
- Trạng thái pity có được lưu vào save không?
- Cùng seed, chơi lại: bố cục màn có giống hệt không?
- Bắn thêm vài phát rồi sang phòng mới: bố cục có đổi không? (không được)
- Tỉ lệ thực sau khi áp pity đã đo bằng mô phỏng chưa, hay vẫn dùng con số danh nghĩa để cân bằng?

## 🤖 Prompt cho AI

AI mặc định dùng `Random.value < p` cho mọi thứ. Đó là output randomness thuần — dạng gây ức chế nhất.

**Dùng AI thế nào cho hệ thống ngẫu nhiên**

Chủ đề này có một đặc điểm hiếm: **kiểm chứng được bằng máy**. Bạn không cần tin AI viết đúng, bạn bắt nó chứng minh bằng mô phỏng. Đó là cách dùng đúng ở đây.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Dựng dịch vụ RNG | đầu dự án | "Viết RngService với hai dòng tách biệt, mọi bộ sinh nhận seed" |
| Mô phỏng phân phối | sau khi có công thức | "Chạy 100.000 lần rút, in histogram và chuỗi trượt dài nhất" |
| Kiểm tra tái hiện | trước khi khoá kiến trúc | "Viết test: cùng seed cho ra cùng chuỗi, kể cả khi số lần gọi rngGameplay khác nhau" |

Việc **không** nên giao: chọn trần chịu đựng. Con số "người chơi của tôi chịu được bao nhiêu lần trượt" là quyết định thiết kế, phụ thuộc vào thể loại và giá tiền của lần rút — AI không biết.

**Phải nêu rõ:**
- Chỗ nào dùng input randomness, chỗ nào (nếu có) dùng output randomness
- Có pity system không, công thức thế nào, trần bao nhiêu lần
- Seed: tất định hay không, dùng mấy bộ sinh riêng biệt
- Trạng thái pity có vào save không
- Bảng tỉ lệ nằm ở file dữ liệu nào, không hardcode

**Mẫu prompt**

```
Hệ thống ngẫu nhiên, ràng buộc cứng:

1. Chiến đấu TẤT ĐỊNH hoàn toàn. Không crit, không miss, không damage range.
   → mọi Random.* trong thư mục Combat/ là vi phạm.
2. Ngẫu nhiên chỉ ở INPUT: bài rút, vật phẩm được chào, bố cục phòng.
3. Drop table dùng pity: p_thực = min(1, p_gốc + 0.03 * số_lần_trượt_liên_tiếp)
   với p_gốc = 0.05 → chậm nhất lần thứ 32 chắc chắn trúng.
   Bộ đếm trượt PHẢI nằm trong save file.
4. HAI bộ sinh số riêng: rngContent (seed cố định, cho procgen)
   và rngGameplay. Hành động người chơi KHÔNG được ảnh hưởng rngContent.
5. Mọi bộ sinh nhận seed; cùng seed cho ra kết quả giống hệt.
6. Bảng tỉ lệ đọc từ loot_table.csv, KHÔNG hardcode trong C#.

Viết lớp RngService thoả 6 điều trên, kèm test: cùng seed -> cùng chuỗi,
pity đạt trần đúng lần thứ 32, rngGameplay không đụng rngContent.

Rồi chạy mô phỏng 100.000 lần rút và in ra:
- tỉ lệ trúng THỰC TẾ (sẽ cao hơn 5%, tôi cần con số đó để cân bằng)
- chuỗi trượt dài nhất gặp phải
- histogram số lần rút cho tới khi trúng
```

**Bẫy thường gặp:** dùng chung một `Random` toàn cục. Khi đó người chơi bắn thêm một phát là bố cục phòng kế tiếp đổi — không tái hiện được bug, không làm được daily challenge. Bẫy thứ hai: AI cài pity nhưng để bộ đếm trong biến tạm, nên thoát game là mất — hãy yêu cầu test cho đúng tình huống đó.

## 🎮 Unity

Unity có hai bộ sinh số và **dùng lẫn chúng là nguồn bug không tái hiện được**.

**`UnityEngine.Random` hay `System.Random`?**

| | `UnityEngine.Random` | `System.Random` |
|---|---|---|
| Phạm vi | Static toàn cục | Instance riêng |
| Nhiều dòng độc lập | **Không** | Có |
| Chạy ngoài Unity | Không | Có |
| Tiện | `Random.Range` gọn | Phải truyền instance |

Quy tắc: **`System.Random` có seed cho mọi thứ cần tái hiện** (procgen, mô phỏng, daily challenge). `UnityEngine.Random` chỉ cho thứ thuần trang trí (lệch pha particle, biến thể cao độ âm thanh).

**Hai dòng RNG riêng biệt — bắt buộc**

```csharp
public class RngService : MonoBehaviour {
    public static RngService I { get; private set; }

    // Dùng cho procgen. Hành động người chơi KHÔNG được ảnh hưởng dòng này.
    public System.Random Content { get; private set; }
    // Dùng cho gameplay (drop, crit nếu có)
    public System.Random Gameplay { get; private set; }

    public void Init(int seed) {
        Content  = new System.Random(seed);
        Gameplay = new System.Random(seed ^ 0x5f3759df);
    }
}
```

Dùng chung một dòng nghĩa là: người chơi bắn thêm một phát → bố cục phòng kế tiếp đổi. Khi đó không tái hiện được bug, không làm được daily challenge, và không so sánh được hai phiên bản thuật toán procgen.

**Pity system**

```csharp
[CreateAssetMenu(menuName = "Game/Drop Table")]
public class DropTable : ScriptableObject {
    public float baseChance = 0.05f;
    public float pityIncrement = 0.03f;
    // Trạng thái runtime KHÔNG lưu ở đây — ScriptableObject là read-only.
}

// Trạng thái nằm ở class runtime riêng
public class DropTracker {
    int consecutiveMisses;
    public bool Roll(DropTable t, System.Random rng) {
        float p = Mathf.Min(1f, t.baseChance + t.pityIncrement * consecutiveMisses);
        bool hit = rng.NextDouble() < p;
        consecutiveMisses = hit ? 0 : consecutiveMisses + 1;
        return hit;
    }
}
```

Để `consecutiveMisses` trong ScriptableObject là bẫy kinh điển: nó ghi vào asset, và trong Editor bạn mang trạng thái từ phiên chơi trước sang phiên sau.

**Lưu và phục hồi trạng thái RNG**

`System.Random` không serialize được trực tiếp. Cách thực dụng: lưu **seed + số lần đã rút**, rồi quay lại bằng cách rút lại đúng số lần đó. Hoặc dùng một PRNG tự viết (xorshift) có state là một `ulong` — serialize được. Xem [[unity-save-data]].

**Kiểm tra nhanh**
- Cùng seed, chơi lại: bố cục màn giống hệt không?
- Bắn thêm vài phát rồi sang phòng mới: bố cục có đổi không? (không được)
- Grep `UnityEngine.Random` trong `Core/` → nên bằng 0.
- Thoát Play Mode rồi vào lại: `consecutiveMisses` có về 0 không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Input randomness và output randomness khác nhau ra sao?**
  → Input randomness rơi **trước** quyết định của người chơi: bố cục màn, bài trên tay, vật phẩm rơi ra — nó tạo ra tình huống để người chơi giải. Output randomness rơi **sau**: tung xúc xắc xem đòn có trúng không. Cùng một lượng ngẫu nhiên, nhưng input làm game thú vị còn output làm người chơi thấy công sức của mình bị vô hiệu.
- `Junior` **Vì sao Tetris hiện đại không rút khối hoàn toàn ngẫu nhiên?**
  → Vì rút độc lập cho phép chuỗi xui dài vô hạn — có thể mười khối liền không ra khối I, và người chơi thua vì xúc xắc chứ không vì chơi dở. Tetris dùng **7-bag**: xáo đủ bảy loại rồi phát hết mới xáo tiếp, nên không bao giờ chờ quá 12 khối để gặp lại khối I. Kỳ vọng không đổi, chỉ đuôi phân phối bị cắt.
- `Junior` **Pity system là gì? Viết công thức ra.**
  → Là cơ chế tăng dần tỉ lệ sau mỗi lần trượt để đảm bảo một trần cứng: `p = min(1, p_gốc + step × số_lần_trượt)`. Muốn đi ngược từ trần thì `step = (1 − p_gốc) / trần`. Cấu hình kinh điển `p_gốc = 5%`, `step = 0,03` cho trần **32 lần** — chậm nhất lần thứ 32 chắc chắn trúng.
- `Mid` **Cài pity system thế nào? Bộ đếm để ở đâu?**
  → Bộ đếm nằm trong **save file**. Người chơi thoát ở lần trượt thứ 30 rồi quay lại thấy đếm về 0 sẽ giận hơn là không có pity ngay từ đầu. Và tuyệt đối không để trong ScriptableObject — trong Editor nó ghi thẳng vào asset, mang trạng thái từ phiên này sang phiên khác và làm mọi lần test sau đó vô nghĩa.
- `Mid` **Khi nào dùng PRD thay vì pity?**
  → PRD hợp với thứ xảy ra liên tục và nhiều lần — crit, proc kỹ năng — vì nó làm mượt phân phối mà không cần một trần rõ ràng. Pity hợp với thứ hiếm và đắt — loot boss, gacha — vì ở đó người chơi cần một lời hứa cụ thể mà họ đếm được: "chậm nhất lần thứ N".
- `Mid` **Shuffle bag có nhược điểm gì?**
  → Cuối túi thì đoán được. 7-bag đảm bảo không chờ quá 12 khối, nhưng người chơi giỏi sẽ đếm và biết trước còn gì trong túi. Trong game đối kháng đó có thể là tính năng; chỗ khác thì phải dùng túi lớn hơn, hoặc trộn lại khi còn vài viên cuối để giữ lại chút bất ngờ.
- `Senior` **Vì sao phải tách rngContent và rngGameplay? Chuyện gì xảy ra nếu dùng chung?**
  → Để hành động người chơi không ảnh hưởng procgen. Dùng chung một dòng thì bắn thêm một phát là bố cục phòng kế tiếp đổi, và mình mất ba thứ: tái hiện bug từ báo cáo người chơi, daily challenge giống nhau cho mọi người, và khả năng so sánh hai phiên bản thuật toán trên cùng một bản đồ.
- `Senior` **Có pity rồi thì cân bằng kinh tế dựa trên tỉ lệ nào?**
  → Tỉ lệ **thực đo bằng mô phỏng**, không phải tỉ lệ danh nghĩa. Pity kéo kỳ vọng lên, nên cân bằng theo 5% trong khi thực tế là bảy tám phần trăm sẽ lệch dần và chỉ lộ ra sau vài tuần LiveOps. Tôi chạy 100.000 lần rút để lấy con số thật rồi mới đặt giá.
- `Senior` **Game bán vật phẩm bằng tiền thật thì ràng buộc thêm gì?**
  → Nhiều thị trường bắt buộc công bố tỉ lệ rơi, và vì pity làm tỉ lệ thực khác tỉ lệ danh nghĩa nên phải công bố **cả hai**. Đây là ràng buộc pháp lý chứ không phải lựa chọn thiết kế — biết trước thì nó là một dòng trong bảng số, biết muộn thì nó là một bản vá gấp.

**Khung trả lời 60 giây** — "Người chơi kêu tỉ lệ trúng bị sai, anh xử lý ra sao?"

> Trước tiên tôi giả định code đúng và **cảm nhận mới là thứ hỏng**, vì con người không có trực giác về chuỗi ngẫu nhiên. Với tỉ lệ trúng 80%, trượt ba đòn liên tiếp có xác suất 0,8% — nghe như không bao giờ xảy ra, nhưng một phiên có khoảng 300 đòn nên trung bình gặp hơn hai lần mỗi phiên. Người chơi chỉ nhớ cái lần trượt ngay trước khi chết.
>
> Cách sửa không phải đổi con số mà là **bóp đuôi phân phối**: giữ nguyên kỳ vọng, cắt các chuỗi xui cực đoan. Bốn công cụ tôi cân nhắc là pity, shuffle bag, PRD, và trọng số kèm cấm lặp — chọn cái nào tuỳ chỗ đó cần tỉ lệ đúng chính xác hay chỉ đúng trung bình.
>
> Nhưng câu hỏi tôi hỏi trước tất cả là: **viên xúc xắc này nằm trước hay sau quyết định của người chơi?** Nếu nó nằm sau và quyết định thành-bại thì vấn đề là thiết kế chứ không phải phân phối — tôi sẽ đề xuất chuyển nó thành ảnh hưởng mức độ, hoặc dời hẳn sang input.

**Họ sẽ đào tiếp**

- *"Bộ đếm pity để ở đâu?"* → Trong save file. Người chơi thoát ở lần trượt thứ 30 rồi quay lại bị reset về 0 sẽ giận hơn là không có pity ngay từ đầu. Và không để trong ScriptableObject — trong Editor nó ghi thẳng vào asset, mang trạng thái từ phiên trước sang phiên sau.
- *"Có pity thì cân bằng theo tỉ lệ nào?"* → Theo tỉ lệ **thực đo bằng mô phỏng**, không theo tỉ lệ danh nghĩa. Pity kéo kỳ vọng lên, nên cân bằng kinh tế dựa trên 5% khi thực tế là bảy tám phần trăm sẽ lệch dần và chỉ lộ ra sau vài tuần LiveOps. Tôi chạy 100.000 lần rút để lấy con số thật.
- *"Tách hai dòng RNG để làm gì?"* → Để hành động người chơi không ảnh hưởng procgen. Dùng chung một dòng thì bắn thêm một phát là bố cục phòng kế tiếp đổi, và mình mất ba thứ: tái hiện bug từ báo cáo người chơi, daily challenge giống nhau cho mọi người, và khả năng so sánh hai phiên bản thuật toán trên cùng bản đồ.
- *"Shuffle bag có nhược điểm gì?"* → Cuối túi thì đoán được. Tetris 7-bag đảm bảo không chờ quá 12 khối để gặp lại khối I, nhưng người chơi giỏi sẽ đếm — trong game đối kháng đó có thể là tính năng, chỗ khác thì phải dùng túi lớn hơn hoặc trộn lại khi còn vài viên cuối.
- *"Khi nào dùng PRD thay vì pity?"* → PRD hợp với thứ xảy ra liên tục và nhiều lần như crit hay proc kỹ năng, vì nó làm mượt mà không cần trần rõ ràng. Pity hợp với thứ hiếm và đắt như loot boss hay gacha, vì ở đó người chơi cần một lời hứa cụ thể: "chậm nhất lần thứ N".
- *"Game có bán vật phẩm bằng tiền thật thì sao?"* → Nhiều thị trường bắt buộc công bố tỉ lệ, và pity làm tỉ lệ thực khác tỉ lệ danh nghĩa nên phải công bố cả hai. Đây là ràng buộc pháp lý chứ không phải lựa chọn thiết kế.

**Cờ đỏ**

- Trả lời "chỉ cần tăng tỉ lệ lên" — đổi kỳ vọng thay vì sửa hình dạng phân phối.
- Không phân biệt được ngẫu nhiên trước và sau quyết định.
- Dùng một `Random` toàn cục cho cả procgen lẫn gameplay.
- Cài pity nhưng để bộ đếm trong biến tạm, thoát game là mất.
- Cân bằng kinh tế bằng tỉ lệ danh nghĩa sau khi đã thêm pity.
- Nói "người chơi hiểu sai xác suất thôi" rồi dừng ở đó — đúng về toán, vô dụng về thiết kế.

**Số / ví dụ nên thuộc**

- Tỉ lệ trúng 80%: trượt 2 đòn **4%** · 3 đòn **0,8%** · 5 đòn **0,032%**; với ~300 đòn mỗi phiên thì chuỗi 3-trượt gặp **hơn 2 lần/phiên**.
- Pity: `p = min(1, p_gốc + step × số_lần_trượt)`; ngược lại `step = (1 − p_gốc) / trần`.
- Cấu hình kinh điển: `p_gốc = 5%`, `step = 0,03` → trần **32 lần**.
- Tetris **7-bag**: không bao giờ chờ quá **12 khối** để gặp lại khối I.
- Tối thiểu **2 dòng RNG**: `rngContent` (seed cố định) và `rngGameplay`.
- Mô phỏng **100.000 lần rút** để lấy tỉ lệ thực trước khi cân bằng.
