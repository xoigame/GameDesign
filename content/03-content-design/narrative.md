---
title: Narrative Design
icon: 📖
summary: Kể chuyện bằng phương tiện của game — không gian, cơ chế, hệ thống — chứ không chỉ bằng cắt cảnh.
status: deep
read: 290
level: intermediate
order: 40
tags: [content, narrative]
related: [level-design, llm-npc, pacing]
---

Narrative design khác writing. Writing tạo ra chữ; narrative design quyết định **câu chuyện được truyền đạt qua đâu**.

Sự phân biệt này quan trọng vì game là phương tiện duy nhất mà khán giả có thể **từ chối** phần nội dung bạn viết — họ bỏ qua cutscene, không đọc nhật ký, không nói chuyện với NPC. Thứ họ không thể từ chối là không gian họ đi qua và luật họ phải tuân theo. Đó là lý do hai kênh kể chuyện mạnh nhất trong game lại không dùng chữ.

## Ba kênh kể chuyện

- **Environmental storytelling** — hiện trường kể chuyện. Hai bộ xương cạnh một cánh cửa khoá kể nhiều hơn ba trang nhật ký.
- **Systemic / emergent** — câu chuyện nảy sinh từ luật chơi. Dwarf Fortress, RimWorld không viết sẵn gì cả.
- **Authored** — cắt cảnh, hội thoại, văn bản. Mạnh nhất về mặt kiểm soát, yếu nhất về mặt tham gia.

Ba kênh đánh đổi theo hai trục ngược nhau, và chọn kênh nghĩa là chọn mất cái gì:

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Ba kênh kể chuyện đặt trên hai trục: mức kiểm soát của tác giả và mức tham gia của người chơi">
  <line x1="96" y1="30" x2="96" y2="208" class="fig-line"/>
  <line x1="96" y1="208" x2="628" y2="208" class="fig-line"/>
  <text x="16" y="42" class="fig-muted" font-size="10">tác giả</text>
  <text x="16" y="56" class="fig-muted" font-size="10">kiểm soát</text>
  <text x="16" y="70" class="fig-muted" font-size="10">hoàn toàn</text>
  <text x="16" y="196" class="fig-muted" font-size="10">không</text>
  <text x="16" y="210" class="fig-muted" font-size="10">kiểm soát</text>
  <text x="362" y="236" text-anchor="middle" class="fig-muted" font-size="11">người chơi tham gia vào việc tạo nghĩa →</text>
  <circle cx="168" cy="62" r="9" fill="#ff8787"/>
  <text x="188" y="58" class="fig-label" font-size="12">Authored</text>
  <text x="188" y="74" class="fig-muted" font-size="10">cutscene · hội thoại · nhật ký</text>
  <text x="188" y="89" class="fig-muted" font-size="10">bỏ qua được — và người chơi sẽ bỏ qua</text>
  <circle cx="366" cy="128" r="9" fill="#ffd43b"/>
  <text x="386" y="124" class="fig-label" font-size="12">Environmental</text>
  <text x="386" y="140" class="fig-muted" font-size="10">bố cục · xác chết · vết đạn · đồ đạc</text>
  <text x="386" y="155" class="fig-muted" font-size="10">không bỏ qua được: họ phải đi qua</text>
  <circle cx="558" cy="186" r="9" fill="#51cf9b"/>
  <text x="548" y="176" text-anchor="end" class="fig-label" font-size="12">Systemic</text>
  <text x="548" y="192" text-anchor="end" class="fig-muted" font-size="10">luật chơi tự sinh chuyện</text>
  <text x="548" y="207" text-anchor="end" class="fig-muted" font-size="10">không đoán trước được</text>
  <path d="M177 71 L357 119" stroke="#6b7488" stroke-width="1.5" stroke-dasharray="5 4" fill="none"/>
  <path d="M375 137 L549 179" stroke="#6b7488" stroke-width="1.5" stroke-dasharray="5 4" fill="none"/>
</svg>
<figcaption>Càng sang phải, câu chuyện càng thuộc về người chơi và càng đáng nhớ — nhưng bạn càng ít nói được điều mình định nói. Phần lớn game dùng cả ba, và sai lầm là dùng kênh trái cho việc kênh phải làm tốt hơn.</figcaption>
</figure>

Câu hỏi kiểm tra: **"nếu bỏ hết chữ, còn lại câu chuyện gì?"** Nếu câu trả lời là "không có gì", bạn đang viết tiểu thuyết có nút bấm.

## Ludonarrative dissonance: khi cơ chế cãi lại câu chuyện

Đây là lỗi đặc thù của game và không có tương đương trong phim hay sách: **thứ người chơi làm mâu thuẫn với thứ câu chuyện nói về họ.**

Ví dụ kinh điển: nhân vật được mô tả là người tử tế miễn cưỡng, nhưng lối chơi là giết vài trăm người trên đường tới đó. Người chơi tin vào cái tay họ làm, không tin vào cái tai họ nghe. Cơ chế luôn thắng.

Nhận ra nó bằng một bài kiểm tra đơn giản: liệt kê **năm động từ** người chơi làm nhiều nhất trong game (bắn, nhảy, thu thập, chế tạo, thuyết phục) rồi hỏi chúng nói gì về nhân vật. Nếu danh sách đó mô tả một người khác hẳn nhân vật trong cốt truyện, bạn có vấn đề.

Ba cách xử lý, theo thứ tự rẻ dần:

1. **Đổi câu chuyện cho khớp cơ chế.** Rẻ nhất và thường đúng nhất — cơ chế đã tốn hàng tháng để làm, chữ thì sửa trong một tuần.
2. **Biến mâu thuẫn thành chủ đề.** Nếu game nói về bạo lực, hãy để nhân vật và thế giới *thừa nhận* số người đã chết thay vì lờ đi.
3. **Đổi cơ chế.** Đắt nhất, nhưng là lựa chọn duy nhất khi cơ chế mâu thuẫn với [[design-pillars]].

Điều **không** nên làm là thêm chữ để giải thích mâu thuẫn. Nó làm mâu thuẫn nổi bật hơn.

## Lore rải rác: liều lượng và vị trí

Lore đặt trong vật phẩm tuỳ chọn có một đặc điểm phải chấp nhận từ đầu: **phần lớn người chơi sẽ không đọc.** Đó không phải lỗi của họ — đó là bản chất của nội dung tuỳ chọn.

Hệ quả thiết kế rất cụ thể:

- **Không đặt thông tin bắt buộc trong lore tuỳ chọn.** Nếu không hiểu điều gì đó thì không chơi tiếp được, điều đó phải nằm trong đường đi chính.
- **Mỗi mẩu phải tự đứng được.** Người chơi đọc mẩu thứ 7 trước mẩu thứ 2 là chuyện bình thường. Mẩu lore cần một ý trọn vẹn, không phải một chương.
- **Ngắn.** Vài câu, đọc hết trong lúc còn đang đứng. Một trang chữ trong game hành động là một trang không ai đọc.
- **Đặt lore ở nơi người chơi đang dừng lại.** Cạnh bàn thờ, trong phòng an toàn, ở màn hình chờ hồi sinh. Đặt giữa đoạn chiến đấu là ném đi.

Thước đo tốt cho mỗi mẩu lore: nó **trả lời một câu hỏi người chơi đang có**, hay nó trả lời câu hỏi tác giả muốn họ có? Loại thứ hai không ai đọc.

## Hội thoại: cây hay trạng thái

Hai kiến trúc, và chọn sai thì chi phí tăng theo cấp số nhân ở giữa dự án.

| | Cây hội thoại | Hội thoại theo trạng thái |
|---|---|---|
| Cấu trúc | node nối node, nhánh rẽ | điều kiện → chọn câu phù hợp |
| Viết | dễ hình dung, dễ vẽ | trừu tượng hơn |
| Chi phí khi thêm biến | **nhân đôi số nhánh** | cộng thêm một điều kiện |
| Hợp cho | hội thoại quan trọng, có hậu quả | NPC phản ứng với trạng thái thế giới |
| Bẫy | bùng nổ tổ hợp | khó biết câu nào sẽ hiện ra |

Quy tắc thực dụng: **cây cho các cuộc nói chuyện quan trọng, trạng thái cho phần còn lại.** Một game có 10 cuộc hội thoại then chốt dạng cây và vài trăm câu thoại phản ứng theo trạng thái là cấu hình lành mạnh.

Dấu hiệu bạn chọn sai: file hội thoại có những nhánh giống hệt nhau lặp lại chỉ khác một chi tiết. Đó là lúc phải chuyển phần đó sang trạng thái.

Về [[llm-npc]]: LLM hứa hẹn hội thoại vô hạn, nhưng hội thoại vô hạn **không có trọng lượng**. Nếu NPC nói gì cũng được, không câu nào đáng nhớ. Ràng buộc mới là thứ tạo ra ý nghĩa — vì vậy hãy dùng LLM cho *biến thể diễn đạt* và *phản ứng theo bối cảnh*, chứ không phải cho *nội dung cốt truyện*.

## Kể chuyện trong game không có cốt truyện

Roguelike, puzzle, game thể thao — không có cốt truyện tuyến tính, nhưng vẫn kể chuyện được, thậm chí kể rất tốt.

Bốn kỹ thuật dùng được ngay:

- **Câu chuyện của run này.** Người chơi tự kể lại: "tôi suýt chết ở tầng 3 rồi nhặt được thứ đó". Việc của bạn là tạo ra **biến cố đáng kể lại** — khoảnh khắc cực đoan, đảo chiều, thoát hiểm trong gang tấc.
- **Chết là đơn vị kể chuyện.** Hades làm điều này rõ nhất: mỗi lần chết mở ra một đoạn hội thoại mới, nên thất bại đẩy câu chuyện đi tới thay vì chặn nó lại. Giá phải trả là số lượng thoại có điều kiện rất lớn.
- **Thế giới đổi theo tiến trình toàn cục.** Người chơi chết nhiều lần, nhưng thế giới nhớ — NPC nhắc tới lần trước, khu vực thay đổi.
- **Lore trong cơ chế, không trong chữ.** Tên vật phẩm, cách chúng tương tác, thứ gì khắc chế thứ gì — tất cả đều nói về thế giới này.

## Nhân vật: từ archetype tới động cơ

Archetype là **điểm xuất phát**, không phải điểm đến. Nó cho người chơi hiểu nhân vật trong ba giây, và đó là giá trị thật của nó — nhưng nhân vật dừng lại ở archetype thì không ai nhớ.

Thứ biến archetype thành nhân vật là **một động cơ cụ thể mâu thuẫn với vai trò của họ**: người lính già muốn về nhà nhưng không còn nhà để về; thương nhân tham lam nhưng không bán một món nhất định.

Trong game, có hai ràng buộc mà tiểu thuyết không có:

- **Nhân vật phải lộ ra qua tương tác lặp lại.** Người chơi gặp NPC bán hàng ba mươi lần; tính cách phải nằm trong ba mươi lần đó, không nằm trong một đoạn giới thiệu.
- **Nhân vật cạnh tranh với gameplay để giành sự chú ý.** Một đoạn độc thoại hay trong lúc người chơi đang muốn đi tiếp là một đoạn độc thoại bị bỏ qua. Xem [[pacing]] — kể chuyện phải rơi vào đoạn chùng, không rơi vào đoạn căng.

## Kiểm tra nhanh

- Bỏ hết chữ đi, còn lại câu chuyện gì?
- Năm động từ người chơi làm nhiều nhất nói gì về nhân vật? Có khớp với cốt truyện không?
- Có thông tin bắt buộc nào chỉ nằm trong lore tuỳ chọn không?
- Mỗi mẩu lore đọc xong trong bao lâu? Đặt ở chỗ người chơi đang dừng hay đang chạy?
- Hội thoại có nhánh nào lặp lại gần giống nhau không? (dấu hiệu nên chuyển sang trạng thái)
- Nếu game không có cốt truyện: người chơi kể lại được gì sau một phiên?
- Đoạn kể chuyện dài nhất rơi vào lúc người chơi đang căng hay đang chùng?

## 🤖 Prompt cho AI

LLM viết chữ rất nhanh, nên nguy cơ ở đây là **quá nhiều chữ chất lượng trung bình**.

**Dùng AI thế nào cho narrative**

Đây là chủ đề mà năng lực mạnh nhất của AI lại trùng với sai lầm phổ biến nhất của khâu này. Nó viết được hàng nghìn từ mỗi phút, trong khi thứ narrative design cần là **ít chữ hơn, đặt đúng chỗ hơn**. Nếu giao việc theo kiểu "viết lore cho thế giới này", bạn sẽ nhận về một tập tài liệu không ai đọc.

Ba vai dùng được, xếp theo giá trị:

| Vai | Khi nào | Câu mở đầu |
|---|---|---|
| Kiểm tra mâu thuẫn | có canon + có cốt truyện | "Đây là canon. Liệt kê chỗ bản thảo mâu thuẫn với nó, trích dòng cụ thể" |
| Sinh biến thể | đã có câu gốc đúng giọng | "Viết 8 biến thể của câu này, giữ nguyên thông tin, đổi cách nói" |
| Dựng hiện trường | đang thiết kế khu vực | "Kể chuyện này bằng ĐỒ VẬT trong phòng, KHÔNG dùng chữ viết trong game" |

Vai đầu là vai bị bỏ phí nhiều nhất: kiểm tra nhất quán canon trên hàng trăm dòng thoại là việc tẻ nhạt với người và dễ với máy.

Việc **không** nên giao: quyết định câu chuyện nói về cái gì, và viết các cảnh then chốt. Không phải vì AI viết dở, mà vì những cảnh đó cần một giọng riêng — thứ AI kéo về mức trung bình theo mặc định.

**Phải nêu rõ:**
- Kênh kể chuyện chính: môi trường / hệ thống / viết sẵn
- Giọng và độ dài: bao nhiêu từ mỗi dòng thoại, mỗi mẩu lore
- Sự thật cố định (canon) mà AI không được mâu thuẫn
- Cấm: giải thích lộ liễu, nhân vật nói ra chủ đề của game
- Bối cảnh người chơi đang ở đâu khi đọc câu này — đang chạy hay đang dừng

**Mẫu prompt**

```
Kênh chính: environmental storytelling. Hội thoại chỉ chiếm ~20%.

Canon (KHÔNG được mâu thuẫn):
- Thành phố bị bỏ hoang 40 năm trước, không ai biết lý do chính xác.
- Nhân vật chính KHÔNG biết mình là ai. Điều này không bao giờ được giải thích.
- Không có phép thuật. Mọi thứ kỳ lạ đều có nguyên nhân vật lý.

Nhiệm vụ: thiết kế 3 căn phòng kể chuyện về ngày cuối cùng của thành phố,
CHỈ bằng đồ vật, bố cục và dấu vết. KHÔNG nhật ký, KHÔNG bảng chữ, KHÔNG ghi âm.

Với mỗi phòng, cho tôi:
- Danh sách đồ vật và vị trí
- Điều người chơi sẽ suy ra ở lần nhìn đầu
- Điều họ suy ra thêm nếu quay lại sau khi biết thêm chuyện
- Chỗ dễ bị hiểu sai nhất

Ràng buộc: mỗi phòng phải hiểu được mà KHÔNG cần hai phòng kia.
```

**Bẫy thường gặp:** AI viết đẹp nhưng **nói toạc chủ đề ra**. Nhân vật giải thích ý nghĩa của chính cảnh vừa xảy ra, hoặc lore giải thích điều bố cục đã nói. Hãy cấm thẳng: "không nhân vật nào được nói ra chủ đề của game". Bẫy thứ hai: nó trả về nhiều hơn bạn xin — xin 3 phòng thì nhận 8 phòng kèm tiểu sử ba đời nhân vật. Đặt giới hạn số lượng và số từ ngay trong đầu bài.

## 🎮 Unity

Trong Unity, câu chuyện sống ở **asset text ngoài code**, không phải chuỗi trong script. Đây là quyết định làm hay phá khả năng dịch thuật về sau.

**Nơi các quyết định sống**

- `Assets/Localization/strings.csv` — mọi chuỗi, có key
- `Core/Narrative/DialogueGraph.cs` — cấu trúc hội thoại (C# thuần)
- `Assets/Data/Narrative/*.asset` — cây hội thoại, biên tập trong Editor

**Không bao giờ hardcode chuỗi**

```csharp
// ❌ không dịch được, không biên tập được ngoài Unity
dialogueText.text = "Ta đã bảo rồi, đừng lảng vảng quanh kho thóc.";

// ✅ key + bảng chuỗi
dialogueText.text = Loc.Get("gorn.warn.barn");
```

Unity có package **Localization** chính thức (`com.unity.localization`) với String Table và Smart String. Đáng dùng nếu có kế hoạch dịch; nếu không, một `Dictionary<string,string>` nạp từ CSV là đủ.

**Chuỗi dài làm vỡ layout — vấn đề thật**

Tiếng Đức dài hơn tiếng Anh khoảng 30%, tiếng Việt có dấu làm chiều cao dòng tăng. Layout phải co giãn:

```
Text (TMP) + Content Size Fitter (Vertical: Preferred)
Parent      + Vertical Layout Group
```

Đặt chiều cao cố định cho hộp hội thoại là cách chắc chắn nhất để chữ bị cắt ở ngôn ngữ khác. Chi tiết ở [[unity-ui]].

**Environmental storytelling — prefab, không phải scene**

```
Assets/Prefabs/Story/
├── Scene_SkeletonAtDoor.prefab      ← 2 bộ xương + cánh cửa khoá
└── Scene_AbandonedCamp.prefab
```

Gom mỗi "hiện trường kể chuyện" thành một prefab. Nhờ vậy đặt lại được ở nhiều màn, sửa một chỗ, và không lẫn vào bố cục màn chơi.

**Timeline cho cutscene — nếu có**

Unity Timeline tốt cho cutscene ngắn. Nhưng: **Timeline không skip được sẵn** — phải tự viết. Và nhớ `Director.time = Director.duration` để nhảy tới cuối thay vì `Stop()`, nếu không các signal cuối không bắn.

**Bẫy Unity cụ thể**
- **`TMP_Text` thiếu glyph tiếng Việt** — font atlas phải có dấu. Kiểm tra bằng cách hiện một chuỗi đủ dấu; thiếu thì hiện ô vuông.
- **`text +=` trong hiệu ứng gõ chữ** cấp phát mỗi frame. Dùng `TMP_Text.maxVisibleCharacters` — không cấp phát gì cả.
- **Cutscene không skip được** → playtester phải xem lại 40 lần.

**Kiểm tra nhanh**
- Grep chuỗi tiếng Việt hardcode trong `.cs` → nên bằng 0.
- Thay mọi chuỗi bằng bản dài gấp 1.5: layout có vỡ không?
- Hiệu ứng gõ chữ: GC Alloc = 0 B?
- Mọi cutscene skip được bằng bất kỳ phím nào chứ?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Narrative design khác writing ở chỗ nào?**
  → Writing tạo ra chữ; narrative design quyết định câu chuyện đi qua **kênh nào**. Game là phương tiện duy nhất mà khán giả từ chối được nội dung mình viết — họ bỏ qua cutscene, không đọc nhật ký. Thứ họ không từ chối được là không gian phải đi qua và luật phải tuân theo, nên hai kênh mạnh nhất lại không dùng chữ.
- `Junior` **Environmental storytelling là gì? Cho một ví dụ.**
  → Là kể chuyện bằng thứ người chơi **đi qua**: bố cục, dấu vết, xác chết, đồ đạc còn dở. Ví dụ một căn phòng chắn cửa từ bên trong, bên trong có hai bộ xương và một khẩu súng hết đạn — không câu chữ nào, người chơi vẫn dựng lại được chuyện. Mạnh vì nó không thể bị bỏ qua và vì người chơi tự ráp nên tự tin vào kết luận của mình.
- `Junior` **Câu hỏi lọc "bỏ hết chữ đi, còn lại câu chuyện gì?" dùng để làm gì?**
  → Để đo xem câu chuyện có thật sự nằm trong game hay chỉ dán lên trên. Nếu bỏ hết thoại và nhật ký mà còn lại không gian, luật chơi và hậu quả kể được một điều gì đó, thì narrative đã ăn vào thiết kế. Nếu không còn gì, phần chữ đang gánh toàn bộ và người chơi bỏ qua chữ là bỏ qua câu chuyện.
- `Mid` **Cây hội thoại hay hội thoại theo trạng thái? Chọn thế nào?**
  → Cây cho vài cuộc nói chuyện quan trọng có hậu quả, trạng thái cho phần còn lại. Điểm khác biệt là chi phí khi thêm một biến: cây thì nhân đôi số nhánh, trạng thái thì cộng thêm một điều kiện. Cấu hình lành mạnh cỡ **10 cuộc dạng cây** cộng vài trăm câu theo trạng thái.
- `Mid` **Lore rải rác nên viết thế nào?**
  → Chấp nhận từ đầu rằng phần lớn người chơi không đọc. Không đặt thông tin **bắt buộc** trong lore tuỳ chọn; mỗi mẩu phải tự đứng được vì họ đọc mẩu 7 trước mẩu 2; giữ ngắn vài câu; và đặt ở nơi người chơi **đang dừng lại**, không phải giữa đoạn chiến đấu.
- `Mid` **Dấu hiệu nào cho thấy anh chọn sai cấu trúc hội thoại?**
  → File hội thoại có những nhánh gần giống hệt nhau lặp đi lặp lại, chỉ khác một chi tiết. Đó là cây đang làm việc của trạng thái: mỗi biến mới nhân đôi số nhánh nên nội dung bị chép lại thay vì được điều kiện hoá. Chi phí lộ ra ở khâu sửa — sửa một câu phải sửa ở tám chỗ.
- `Senior` **Game roguelike không có cốt truyện thì kể chuyện kiểu gì?**
  → Bốn cách. Tạo biến cố đáng kể lại để người chơi tự kể câu chuyện của run. Biến cái chết thành đơn vị kể chuyện như Hades — nhưng phải trả bằng khối lượng thoại có điều kiện rất lớn. Cho thế giới nhớ tiến trình toàn cục. Và đặt lore vào tên vật phẩm cùng cách chúng tương tác với nhau.
- `Senior` **Dùng LLM cho hội thoại NPC — anh cho nó làm gì và cấm nó làm gì?**
  → Cho: biến thể diễn đạt, phản ứng theo bối cảnh, câu chào lặt vặt. Cấm: nội dung cốt truyện. Lý do không phải chất lượng mà là trọng lượng — hội thoại vô hạn thì không câu nào đáng nhớ; nếu NPC nói gì cũng được thì lời nói mất giá. Ràng buộc mới là thứ tạo ra ý nghĩa.
- `Senior` **Việc gì trong narrative nên giao cho AI mà đội hay bỏ phí?**
  → Kiểm tra nhất quán canon trên hàng trăm dòng thoại: tên, mốc thời gian, ai biết chuyện gì ở thời điểm nào. Việc đó tẻ nhạt với người và dễ với máy. Còn các cảnh then chốt thì tôi giữ — không phải vì AI viết dở, mà vì nó kéo giọng văn về mức trung bình, đúng chỗ cần giọng riêng nhất.

**Khung trả lời 60 giây** — "Anh phát hiện ludonarrative dissonance bằng cách nào?"

> Bài kiểm tra tôi dùng rất thô: liệt kê **năm động từ** người chơi làm nhiều nhất — bắn, nhảy, thu thập, chế tạo, thuyết phục — rồi hỏi danh sách đó mô tả người như thế nào. Nếu nó mô tả một người khác hẳn nhân vật trong cốt truyện thì có vấn đề. Người chơi tin vào cái tay họ làm, không tin vào cái tai họ nghe; **cơ chế luôn thắng**.
>
> Cách xử lý tôi xếp theo giá: rẻ nhất là **đổi câu chuyện cho khớp cơ chế**, vì cơ chế đã tốn hàng tháng còn chữ thì sửa trong một tuần. Tiếp theo là biến mâu thuẫn thành chủ đề — để nhân vật và thế giới thừa nhận cái giá thay vì lờ đi. Đắt nhất là đổi cơ chế, và tôi chỉ đề xuất khi cơ chế đó mâu thuẫn với design pillar.
>
> Thứ tôi không làm là thêm chữ để giải thích mâu thuẫn. Nó luôn làm mâu thuẫn nổi bật hơn.

**Họ sẽ đào tiếp**

- *"Narrative design khác writing chỗ nào?"* → Writing tạo ra chữ; narrative design quyết định câu chuyện đi qua kênh nào. Game là phương tiện duy nhất mà khán giả **từ chối được** phần nội dung mình viết — họ bỏ qua cutscene, không đọc nhật ký. Thứ họ không từ chối được là không gian phải đi qua và luật phải tuân theo, nên hai kênh mạnh nhất lại không dùng chữ.
- *"Cây hay trạng thái?"* → Cây cho các cuộc nói chuyện quan trọng có hậu quả, trạng thái cho phần còn lại. Chi phí khi thêm một biến là điểm khác biệt: cây thì nhân đôi số nhánh, trạng thái thì cộng thêm một điều kiện. Dấu hiệu chọn sai là file hội thoại có những nhánh gần giống hệt nhau lặp lại, chỉ khác một chi tiết.
- *"Lore rải rác nên viết thế nào?"* → Chấp nhận từ đầu rằng phần lớn người chơi không đọc. Nên: không đặt thông tin bắt buộc trong lore tuỳ chọn, mỗi mẩu phải tự đứng được vì họ đọc mẩu 7 trước mẩu 2, giữ ngắn vài câu, và đặt ở nơi người chơi **đang dừng lại** chứ không phải giữa đoạn chiến đấu.
- *"Roguelike kể chuyện kiểu gì?"* → Bốn cách: tạo biến cố đáng kể lại để người chơi tự kể câu chuyện của run; biến cái chết thành đơn vị kể chuyện như Hades, nhưng phải trả bằng số lượng thoại có điều kiện rất lớn; cho thế giới nhớ tiến trình toàn cục; và đặt lore vào tên vật phẩm với cách chúng tương tác.
- *"LLM cho NPC thì cho làm gì?"* → Biến thể diễn đạt và phản ứng theo bối cảnh. Không giao nội dung cốt truyện, vì hội thoại vô hạn thì **không có trọng lượng** — nếu NPC nói gì cũng được thì không câu nào đáng nhớ. Ràng buộc mới là thứ tạo ra ý nghĩa.
- *"Dùng AI ở khâu này thế nào cho đúng?"* → Việc bị bỏ phí nhiều nhất là **kiểm tra nhất quán canon** trên hàng trăm dòng thoại — tẻ nhạt với người, dễ với máy. Còn viết các cảnh then chốt thì tôi giữ, không phải vì AI viết dở mà vì nó kéo giọng về mức trung bình.

**Cờ đỏ**

- Coi narrative là "phần chữ", tách khỏi thiết kế cơ chế.
- Giải quyết mâu thuẫn cơ chế–cốt truyện bằng cách viết thêm lời giải thích.
- Đặt thông tin bắt buộc vào nhật ký tuỳ chọn rồi ngạc nhiên vì người chơi không hiểu.
- Nhân vật nói ra chủ đề của game.
- Kỳ vọng LLM tạo được cốt truyện có trọng lượng.
- Đặt đoạn kể chuyện dài vào giữa đoạn cao trào.

**Số / ví dụ nên thuộc**

- Ba kênh: **environmental · systemic · authored**, đánh đổi giữa kiểm soát của tác giả và mức tham gia của người chơi.
- Câu hỏi lọc: **"bỏ hết chữ đi, còn lại câu chuyện gì?"**
- Bài kiểm tra dissonance: **5 động từ** người chơi làm nhiều nhất.
- Ba cách xử lý dissonance theo giá: đổi chuyện → biến thành chủ đề → đổi cơ chế.
- Cấu hình hội thoại lành mạnh: **~10 cuộc dạng cây** + vài trăm câu theo trạng thái.
- Hades: **cái chết là đơn vị kể chuyện**; giá phải trả là khối lượng thoại có điều kiện.
