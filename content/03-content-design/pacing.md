---
title: Pacing & Flow
icon: 🌊
summary: Nhịp căng–chùng qua toàn bộ hành trình chơi, ở cả ba thang thời gian.
status: deep
read: 280
level: intermediate
order: 30
tags: [content, pacing]
related: [difficulty-curve, level-design, narrative]
---

Pacing là **đường cong cường độ theo thời gian**. Nó khác [[difficulty-curve]]: độ khó nói về *thử thách*, pacing nói về *cường độ cảm xúc* — bao gồm cả căng thẳng, yên tĩnh, bất ngờ, và thư giãn.

Phân biệt này có hệ quả thực tế: một đoạn **dễ** vẫn có thể **căng** (chạy trốn khỏi thứ không đánh lại được), và một đoạn **khó** vẫn có thể **chùng** (câu đố hóc búa trong phòng yên tĩnh). Bạn điều khiển hai thứ đó bằng hai bộ công cụ khác nhau.

## Ba thang thời gian

Pacing tồn tại đồng thời ở ba thang, và chúng không thay thế được nhau. Một màn có nhịp hoàn hảo vẫn chán nếu mười màn liền đều có cùng hình dạng đó.

<figure class="fig">
<svg viewBox="0 0 660 292" role="img" aria-label="Ba thang pacing lồng nhau: toàn game, một màn, một phòng — mỗi thang có đường cong cường độ riêng">
  <text x="14" y="40" class="fig-label" font-size="12">Toàn game</text>
  <text x="14" y="56" class="fig-muted" font-size="10">6–12 giờ</text>
  <line x1="118" y1="76" x2="644" y2="76" class="fig-line"/>
  <path d="M118 72 L168 52 L198 68 L258 42 L296 66 L368 34 L404 62 L478 26 L516 58 L580 20 L620 46 L644 30" stroke="#6ea8fe" stroke-width="2" fill="none" stroke-linejoin="round"/>
  <rect x="258" y="30" width="110" height="48" rx="4" fill="#ffd43b" opacity="0.14"/>
  <rect x="258" y="30" width="110" height="48" rx="4" stroke="#ffd43b" stroke-width="1" fill="none"/>
  <path d="M258 78 L118 102" stroke="#ffd43b" stroke-width="1" stroke-dasharray="4 3" fill="none"/>
  <path d="M368 78 L644 102" stroke="#ffd43b" stroke-width="1" stroke-dasharray="4 3" fill="none"/>
  <text x="14" y="130" class="fig-label" font-size="12">Một màn</text>
  <text x="14" y="146" class="fig-muted" font-size="10">8–15 phút</text>
  <line x1="118" y1="166" x2="644" y2="166" class="fig-line"/>
  <path d="M118 162 L180 128 L246 158 L310 116 L378 154 L452 100 L520 150 L590 92 L644 140" stroke="#6ea8fe" stroke-width="2" fill="none" stroke-linejoin="round"/>
  <rect x="246" y="112" width="132" height="56" rx="4" fill="#ffd43b" opacity="0.14"/>
  <rect x="246" y="112" width="132" height="56" rx="4" stroke="#ffd43b" stroke-width="1" fill="none"/>
  <path d="M246 168 L118 192" stroke="#ffd43b" stroke-width="1" stroke-dasharray="4 3" fill="none"/>
  <path d="M378 168 L644 192" stroke="#ffd43b" stroke-width="1" stroke-dasharray="4 3" fill="none"/>
  <text x="14" y="220" class="fig-label" font-size="12">Một phòng</text>
  <text x="14" y="236" class="fig-muted" font-size="10">60–120 giây</text>
  <line x1="118" y1="256" x2="644" y2="256" class="fig-line"/>
  <path d="M118 252 L190 244 L268 196 L340 188 L412 244 L520 250 L644 248" stroke="#6ea8fe" stroke-width="2" fill="none" stroke-linejoin="round"/>
  <rect x="412" y="238" width="108" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="466" y="276" text-anchor="middle" font-size="10" fill="#51cf9b">khoảng lặng — không phải thời gian chết</text>
  <text x="644" y="276" text-anchor="end" class="fig-muted" font-size="10">thời gian →</text>
</svg>
<figcaption>Cùng một hình dạng lặp lại ở ba thang. Mỗi đỉnh ở thang trên là cả một đường cong đầy đủ ở thang dưới — và đoạn chùng ở thang trên phải là cả một khu vực thật sự yên tĩnh, không phải một phút nghỉ.</figcaption>
</figure>

| Thang | Độ dài điển hình | Công cụ điều khiển chính |
|---|---|---|
| **Phòng / chạm trán** | 60–120 giây | số lượng địch, không gian, tầm nhìn, âm thanh |
| **Màn / khu vực** | 8–15 phút | thứ tự chạm trán, checkpoint, phòng an toàn, tài nguyên |
| **Toàn game** | 6–12 giờ | mở khoá cơ chế mới, đổi bối cảnh, boss, nhịp kể chuyện |

Sai lầm hay gặp là chỉ thiết kế thang giữa. Thang phòng bị bỏ mặc cho người dựng màn, còn thang toàn game thì không ai cầm — và đó là lý do nhiều game "hay từng đoạn nhưng mệt khi chơi liền".

## Khoảng lặng làm việc gì

Sai lầm phổ biến: **cường độ đơn điệu**. Game toàn cao trào làm người chơi mệt và mất nhạy cảm — cao trào thứ mười không còn là cao trào nữa. Tương phản là thứ tạo ra đỉnh, không phải độ cao tuyệt đối.

Khoảng lặng không phải chỗ trống giữa hai phần hay. Nó làm bốn việc cụ thể:

1. **Đặt lại ngưỡng cảm giác.** Sau 30 giây yên tĩnh, một tiếng động nhỏ đáng sợ hơn một vụ nổ sau 30 giây hỗn loạn.
2. **Cho chỗ để nhận ra mình đã tiến bộ.** Người chơi cần thời gian rảnh tay để nghĩ về thứ vừa xảy ra. Xem đoạn hạ xuống ở [[difficulty-curve]].
3. **Là nơi duy nhất kể chuyện được.** Mọi thứ [[narrative]] muốn nói phải rơi vào đây; nói trong lúc căng là nói vào khoảng không.
4. **Tạo lo lắng.** Trong game kinh dị, khoảng lặng là công cụ gây căng thẳng mạnh nhất — vì người chơi biết nó sẽ kết thúc.

Quy tắc thô: sau mỗi cao trào, dành **20–30% thời lượng** cho đoạn cường độ thấp trước cao trào tiếp theo.

Điều làm khoảng lặng thất bại: người chơi **không nhận ra** đó là khoảng lặng và cứ tiếp tục căng thẳng. Phải có tín hiệu rõ — nhạc đổi, ánh sáng đổi, không gian mở ra, địch biến mất khỏi tầm nhìn. Xem [[adaptive-music]].

## Biến cảm tính thành số

Nhịp độ là thứ dễ tranh cãi nhất trong phòng họp vì ai cũng có ý kiến và không ai có bằng chứng. Cách thoát ra là định nghĩa một **công thức cường độ** cho game của bạn — bất kỳ công thức nào, miễn là đếm được.

```
cường độ = (số địch còn sống × 2) + (sát thương nhận trong 10 giây / 10)
```

Công thức này gần như chắc chắn không đúng với game của bạn. Không sao — giá trị của nó không nằm ở độ chính xác mà ở chỗ **nó cho một con số để vẽ đồ thị**. Có đồ thị thì tranh cãi chuyển từ "tôi thấy đoạn này hơi lê thê" sang "đoạn này cường độ phẳng ở mức 2 trong 80 giây, chúng ta định vậy hay không?".

Tuỳ thể loại mà thành phần khác nhau:

| Thể loại | Thành phần cường độ hợp lý |
|---|---|
| Hành động | số địch đồng thời, sát thương nhận, máu còn lại (càng ít càng căng) |
| Kinh dị | khoảng cách tới mối đe doạ, tầm nhìn, tài nguyên còn lại |
| Chiến thuật theo lượt | số nước đi hợp lệ dẫn tới thua, chênh lệch quân |
| Đua xe | khoảng cách tới đối thủ gần nhất, tốc độ, độ hẹp đường |

Ghi lại cường độ theo thời gian trong mỗi phiên playtest, vẽ chồng lên đường cong **mục tiêu**, rồi nhìn chỗ hai đường lệch nhau. Đó là cách [[playtesting-metrics]] có ích ngay cả khi bạn chưa có nhiều người test.

## Khoảng nghỉ bao lâu là đủ

Vài con số khởi điểm cho một màn hành động 12 phút, đủ cụ thể để cãi lại được:

- **Sau mỗi cao trào: tối thiểu 60 giây** ở cường độ thấp. Dưới mức đó người chơi chưa kịp hạ nhịp tim.
- **Không đoạn nào cường độ cao kéo dài quá 45 giây** liên tục mà không có nhịp hở. Dài hơn thì chuyển từ căng thẳng sang kiệt sức.
- **Tổng thời gian cường độ thấp chiếm 25–30%** thời lượng màn.
- **Đúng ba cao trào**, cái cuối mạnh nhất. Nhiều hơn thì không cái nào nổi bật.

Hai thời điểm đáng đầu tư nhất, quan trọng hơn mọi con số trên:

- **30 giây đầu** — quyết định người chơi có ở lại hay không. Xem [[onboarding]].
- **Ngay sau một thất bại** — quyết định họ có thử lại hay không. Thời gian từ lúc chết tới lúc chơi lại được là con số ảnh hưởng tới tỉ lệ bỏ cuộc nhiều hơn gần như mọi thứ khác. Dưới 3 giây là mục tiêu hợp lý cho game có cái chết thường xuyên.

## Pacing trong game không có kết thúc

Roguelike, idle, game dịch vụ — không có đường cong tổng thể vì không có điểm cuối. Cấu trúc thay bằng ba thứ:

- **Nhịp của một run.** Run là đơn vị có mở đầu, cao trào và kết thúc; toàn bộ lý thuyết trên áp dụng vào đây. Run 20–45 phút của roguelike thật ra là một "game hoàn chỉnh" thu nhỏ.
- **Biến thiên giữa các run.** Nếu mọi run có cùng hình dạng thì người chơi chán ở run thứ mười. Đây là việc của [[procedural-generation]] và của [[ai-director]] — thay đổi *hình dạng* đường cong, không chỉ thay đổi nội dung.
- **Nhịp dài của meta.** Mở khoá, mốc tiến trình, độ khó tăng dần đóng vai trò đường cong toàn game. Xem [[meta-systems]].

Với game idle, nghịch lý là **khoảng lặng chính là sản phẩm** — thời gian chờ là cơ chế. Điều cần thiết kế ở đó không phải cường độ mà là **nhịp quay lại**: mỗi lần mở game phải có thứ đã thay đổi và một quyết định đáng đưa ra, nếu không việc mở game thành thói quen rỗng.

## Kiểm tra nhanh

- Vẽ được đường cong cường độ mục tiêu cho một màn chưa? Nó có hình gì?
- Có đoạn nào cường độ phẳng quá 60 giây không?
- Ba cao trào có tách nhau bằng đoạn thấp thật sự không, hay chỉ là hành lang ngắn?
- Người chơi có **nhận ra** khoảng lặng không? Tín hiệu là gì — nhạc, ánh sáng, không gian?
- Từ lúc chết tới lúc chơi lại được: bao nhiêu giây?
- Với game roguelike: mười run liên tiếp có mười hình dạng khác nhau không?
- Đã đo cường độ bằng số chưa, hay vẫn đang tranh luận bằng cảm giác?

## 🤖 Prompt cho AI

Nhịp độ là thứ trừu tượng nhất trong kho này, nên cũng là thứ AI dễ trả lời chung chung nhất. Cách chữa: bắt nó xuất ra **đường cong dạng số**.

**Dùng AI thế nào cho pacing**

Quy tắc gọn: **đừng hỏi ý kiến, hãy giao ràng buộc và bắt nó giải.** Câu "làm sao cho nhịp độ hay hơn" sẽ nhận về lời khuyên sách giáo khoa đúng mà vô dụng. Câu "xuất bảng cường độ theo từng 30 giây, thoả bốn ràng buộc sau" thì nhận về thứ kiểm tra được.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Giải ràng buộc | đã có công thức cường độ | "Xuất bảng cường độ mục tiêu theo từng 30 giây, thoả các ràng buộc sau" |
| Kiểm tra bản dựng | đã có màn thật | "Đây là danh sách chạm trán kèm thời lượng. Tính cường độ và chỉ ra chỗ vi phạm ràng buộc" |
| Sinh biến thể | game roguelike | "Cho tôi 5 hình dạng đường cong KHÁC NHAU cho cùng ngân sách 20 phút" |

Việc **không** nên giao: chọn công thức cường độ. Nó phụ thuộc vào việc game của bạn làm người chơi căng thẳng *bằng cách nào* — và đó là câu hỏi thiết kế, không phải câu hỏi kỹ thuật.

**Phải nêu rõ:**
- Thang thời gian đang nói tới (phòng / màn / cả game)
- Cường độ đo bằng gì — phải là đại lượng đếm được
- Tỉ lệ thời gian dành cho đoạn cường độ thấp
- Khoảng nghỉ tối thiểu sau cao trào
- Trần: cường độ cao được kéo dài liên tục bao lâu

**Mẫu prompt**

```
Lập bản đồ nhịp độ cho một màn 12 phút.

Cường độ đo bằng: (số kẻ địch đồng thời × 2) + (sát thương nhận/10s)
Xuất ra BẢNG SỐ theo từng 30 giây: cường độ mục tiêu 0-10.

Ràng buộc:
- Đúng 3 cao trào, cao trào cuối mạnh nhất
- Sau mỗi cao trào: >= 60s cường độ <= 2
- Tổng thời gian cường độ <= 2 phải chiếm 25-30% màn
- Không có đoạn nào cường độ >= 7 kéo dài quá 45s

Sau bảng, vẽ đồ thị ASCII để tôi nhìn được hình dạng.
Rồi liệt kê: mỗi đoạn cường độ thấp được báo hiệu cho người chơi BẰNG GÌ
(nhạc / ánh sáng / không gian) — nếu không báo hiệu được thì nói ra.
```

**Bẫy thường gặp:** hỏi "làm sao cho nhịp độ hay hơn" sẽ nhận về lời khuyên sách giáo khoa. Định nghĩa công thức cường độ biến câu hỏi thẩm mỹ thành bài toán kiểm tra được. Bẫy thứ hai: AI cho ra đường cong thoả mọi ràng buộc nhưng **đơn điệu** — ba cao trào cao bằng nhau, ba đoạn nghỉ dài bằng nhau. Hãy yêu cầu thêm ràng buộc về sự khác biệt giữa các đỉnh, hoặc xin nhiều biến thể rồi tự chọn.

## 🎮 Unity

Nhịp độ trong Unity đo được, và đó là cách duy nhất để nó không còn là chuyện cảm tính.

**Nơi các quyết định sống**

- `Core/Pacing/IntensityMeter.cs` — công thức cường độ, C# thuần
- `Assets/Data/Levels/Level_XX.asset` — đường cong cường độ mục tiêu
- `Assets/Editor/PacingGraph.cs` — vẽ đồ thị đo được so với mục tiêu

**Đo cường độ bằng số**

```csharp
// Core/Pacing/IntensityMeter.cs
public class IntensityMeter {
    readonly Queue<(float t, float dmg)> window = new();

    public float Sample(float now, int enemiesAlive, float damageTaken) {
        window.Enqueue((now, damageTaken));
        while (window.Count > 0 && now - window.Peek().t > 10f) window.Dequeue();
        float dmgRate = window.Sum(w => w.dmg) / 10f;
        return Mathf.Clamp01((enemiesAlive * 2f + dmgRate) / 10f);
    }
}
```

Công thức cụ thể không quan trọng bằng việc **có một con số**. Có số thì vẽ được đồ thị, so được với mục tiêu, và biết đoạn nào phẳng lặng quá lâu.

**Ghi lại và vẽ — editor tool**

```csharp
// Ghi (thời điểm, cường độ) suốt một lần chơi, rồi vẽ bằng Handles
[MenuItem("Tools/Pacing/Show Last Session")]
static void Show() {
    var samples = PacingRecorder.LoadLast();   // JSON trong persistentDataPath
    // vẽ đường đo được (xanh) chồng lên đường mục tiêu (xám nét đứt)
}
```

Nhìn hai đường chồng nhau là thấy ngay: chỗ nào game căng hơn dự kiến, chỗ nào lặng quá lâu. Đây là việc [[ai-director]] dùng để tự điều tiết, nhưng bạn nên nhìn bằng mắt trước khi tự động hoá.

**Khoảng lặng phải là quyết định, không phải tình cờ**

```csharp
// Director đảm bảo tối thiểu 30s không spawn sau cao trào — xem [[ai-director]].
// Trong Unity, nhớ rằng khoảng lặng nghe rõ hơn nếu ducking nhả về (xem [[unity-audio]])
// và post-processing giảm cường độ.
```

**Bẫy Unity cụ thể**
- **Dùng `Time.time` để đo nhịp** — nó bị `timeScale` ảnh hưởng, nên hitstop làm số liệu lệch. Dùng `Time.unscaledTime` cho đo đạc.
- **`Queue` trong `Update`** cấp phát khi lớn lên. Cấp phát sẵn capacity.
- **Ghi log mỗi frame** → file vài chục MB một phiên. Lấy mẫu 2Hz là đủ.

**Kiểm tra nhanh**
- Chơi một màn, mở đồ thị: có đoạn nào cường độ phẳng quá 60 giây không?
- Ba cao trào có tách nhau bằng đoạn thấp không?
- Đo bằng `unscaledTime` chứ không `time`?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Pacing và difficulty curve khác nhau thế nào?**
  → Độ khó nói về thử thách, pacing nói về cường độ cảm xúc. Hệ quả thực tế: một đoạn **dễ** vẫn có thể **căng** — chạy trốn khỏi thứ không đánh lại được — và một đoạn khó vẫn có thể chùng, như câu đố hóc búa trong phòng yên tĩnh. Hai thứ đó điều khiển bằng hai bộ công cụ khác nhau.
- `Junior` **Vì sao game toàn cao trào lại chán?**
  → Vì tương phản tạo ra đỉnh, không phải độ cao tuyệt đối — cao trào thứ mười không còn là cao trào. Khoảng lặng làm bốn việc: đặt lại ngưỡng cảm giác, cho người chơi chỗ nhận ra mình đã tiến bộ, làm nơi duy nhất kể chuyện được, và trong game kinh dị thì chính nó gây căng thẳng.
- `Junior` **Ba thang thời gian của nhịp độ là gì?**
  → Phòng 60–120 giây, màn 8–15 phút, toàn game 6–12 giờ. Mỗi đỉnh ở thang trên là cả một đường cong đầy đủ ở thang dưới. Sai lầm hay gặp là chỉ thiết kế thang giữa: thang phòng bỏ mặc người dựng màn, thang toàn game không ai cầm, và game thành "hay từng đoạn nhưng mệt khi chơi liền".
- `Mid` **Khoảng lặng nên dài bao lâu, và làm sao người chơi biết đó là khoảng lặng?**
  → Tối thiểu **60 giây** sau mỗi cao trào, tổng các đoạn thấp chiếm 25–30% thời lượng màn. Quan trọng hơn độ dài là **tín hiệu**: nhạc đổi, ánh sáng đổi, không gian mở ra, địch biến khỏi tầm nhìn. Khoảng lặng không được báo hiệu thì người chơi vẫn căng và nó chỉ còn là một hành lang dài.
- `Mid` **Ràng buộc khởi điểm cho nhịp của một màn 12 phút?**
  → Đúng ba cao trào, cái cuối mạnh nhất. Sau mỗi cao trào ít nhất 60 giây cường độ thấp. Tổng đoạn thấp 25–30% màn. Không đoạn cường độ cao nào kéo quá 45 giây liên tục. Đây là điểm khởi đầu để đo và cãi nhau, không phải luật — nhưng có nó thì bản nháp đầu đã không đơn điệu.
- `Mid` **Con số nào ảnh hưởng tỉ lệ bỏ cuộc nhiều nhất mà hay bị bỏ qua?**
  → Thời gian từ lúc chết tới lúc chơi lại được. Với game chết thường xuyên tôi nhắm **dưới 3 giây**. Nó bị bỏ qua vì "chỉ là vài giây", nhưng nhân với số lần chết trong một phiên thì nó là phần lớn thời gian người chơi ngồi không — và ngồi không là lúc người ta quyết định thoát.
- `Senior` **Roguelike không có đường cong tổng thể thì thiết kế nhịp kiểu gì?**
  → Ba lớp thay cho một đường cong. Nhịp trong một run, vì run 20–45 phút thật ra là một game hoàn chỉnh thu nhỏ. **Biến thiên giữa các run** — đổi hình dạng đường cong chứ không chỉ đổi nội dung, nếu không run thứ hai mươi cảm giác y hệt run đầu. Và nhịp dài của meta-progression.
- `Senior` **Làm sao biến tranh cãi về nhịp độ thành quyết định có bằng chứng?**
  → Định nghĩa một **công thức cường độ đếm được** rồi ghi lại theo thời gian trong lúc tester chơi, ví dụ `(số địch sống × 2) + (sát thương nhận trong 10s / 10)`. Công thức gần như chắc chắn không "đúng"; giá trị của nó là cho một con số để vẽ đồ thị và so với đường cong mục tiêu.
- `Senior` **Đường cong thoả hết ràng buộc mà chơi vẫn đơn điệu — anh nhìn vào đâu?**
  → Thường là ba cao trào cao bằng nhau: đúng luật nhưng không có leo thang, nên đỉnh cuối không còn là đỉnh. Kế đó là khoảng lặng giống hệt nhau về loại — ba lần đều là hành lang đi bộ. Tương phản phải có trong cả **độ cao** lẫn **kiểu**, chỉ thoả số lượng thì chưa đủ.

**Khung trả lời 60 giây** — "Tester nói màn này lê thê nhưng không chỉ được chỗ nào, anh làm gì?"

> Tôi định nghĩa một **công thức cường độ** đếm được cho game, rồi ghi lại nó theo thời gian trong lúc họ chơi. Với game hành động thì thường là số địch còn sống nhân hệ số, cộng sát thương nhận trong mười giây gần nhất. Công thức gần như chắc chắn không "đúng" — giá trị của nó là cho một con số để vẽ đồ thị.
>
> Có đồ thị rồi thì tranh cãi đổi hẳn tính chất: từ "tôi thấy hơi lê thê" sang "đoạn này cường độ phẳng ở mức 2 suốt 80 giây, ta định vậy hay không?". Tôi vẽ chồng đường đo được lên đường cong **mục tiêu** và nhìn chỗ hai đường lệch nhau.
>
> Ràng buộc khởi điểm tôi hay dùng cho màn 12 phút: đúng ba cao trào với cái cuối mạnh nhất, sau mỗi cao trào tối thiểu 60 giây cường độ thấp, tổng đoạn thấp chiếm 25–30% màn, và không đoạn cường độ cao nào kéo dài quá 45 giây liên tục.

**Họ sẽ đào tiếp**

- *"Pacing khác difficulty curve chỗ nào?"* → Độ khó nói về thử thách, pacing nói về cường độ cảm xúc. Hệ quả thực tế là một đoạn **dễ** vẫn có thể **căng** — chạy trốn khỏi thứ không đánh lại được — và một đoạn khó vẫn có thể chùng, như câu đố hóc búa trong phòng yên tĩnh. Hai thứ đó điều khiển bằng hai bộ công cụ khác nhau.
- *"Vì sao toàn cao trào lại chán?"* → Vì tương phản tạo ra đỉnh, không phải độ cao tuyệt đối. Cao trào thứ mười không còn là cao trào. Khoảng lặng làm bốn việc: đặt lại ngưỡng cảm giác, cho người chơi chỗ nhận ra mình đã tiến bộ, làm nơi duy nhất kể chuyện được, và trong game kinh dị thì chính nó gây căng thẳng.
- *"Khoảng lặng hỏng khi nào?"* → Khi người chơi **không nhận ra** đó là khoảng lặng và cứ tiếp tục căng thẳng. Phải có tín hiệu rõ: nhạc đổi, ánh sáng đổi, không gian mở ra, địch biến mất khỏi tầm nhìn. Khoảng lặng không được báo hiệu thì chỉ là một hành lang dài.
- *"Ba thang thời gian là gì?"* → Phòng 60–120 giây, màn 8–15 phút, toàn game 6–12 giờ. Mỗi đỉnh ở thang trên là cả một đường cong đầy đủ ở thang dưới. Sai lầm hay gặp là chỉ thiết kế thang giữa — thang phòng bỏ mặc người dựng màn, thang toàn game không ai cầm, và game thành "hay từng đoạn nhưng mệt khi chơi liền".
- *"Roguelike thì sao?"* → Ba lớp thay cho đường cong tổng thể: nhịp trong một run, vì run 20–45 phút thật ra là một game hoàn chỉnh thu nhỏ; **biến thiên giữa các run**, tức thay đổi hình dạng đường cong chứ không chỉ thay nội dung; và nhịp dài của meta-progression.
- *"Con số nào ảnh hưởng tỉ lệ bỏ cuộc nhiều nhất?"* → Thời gian từ lúc chết tới lúc chơi lại được. Với game có cái chết thường xuyên, tôi nhắm dưới ba giây. Đó và 30 giây đầu tiên là hai chỗ đáng đầu tư hơn mọi tinh chỉnh khác.

**Cờ đỏ**

- Tranh luận nhịp độ hoàn toàn bằng tính từ, không có đại lượng nào đếm được.
- Nghĩ khoảng lặng là thời gian chết cần cắt bớt.
- Chỉ thiết kế nhịp ở thang màn, bỏ trống thang phòng và thang toàn game.
- Đặt đoạn kể chuyện dài vào giữa cao trào.
- Đường cong thoả mọi ràng buộc nhưng ba cao trào cao bằng nhau — đúng luật mà vẫn đơn điệu.
- Bỏ qua thời gian hồi sinh vì "chỉ là vài giây".

**Số / ví dụ nên thuộc**

- Ba thang: phòng **60–120 giây** · màn **8–15 phút** · game **6–12 giờ**.
- Sau cao trào: **≥ 60 giây** cường độ thấp; tổng đoạn thấp **25–30%** thời lượng.
- Cường độ cao liên tục: **không quá 45 giây**.
- **Đúng 3 cao trào** mỗi màn, cái cuối mạnh nhất.
- Hồi sinh sau khi chết: nhắm **dưới 3 giây**.
- Công thức mẫu: `(số địch sống × 2) + (sát thương nhận trong 10s / 10)`.
