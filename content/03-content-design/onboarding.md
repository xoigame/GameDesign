---
title: Onboarding & Tutorial
icon: 🚪
summary: Dạy người chơi mà không cần hộp thoại hướng dẫn — 5 phút đầu quyết định họ ở lại hay đi.
status: deep
read: 270
level: intermediate
order: 25
tags: [content, ux, onboarding]
related: [level-design, ux-hud, pacing, difficulty-curve]
---

Phần lớn người chơi rời đi trước phút thứ 5. Onboarding không phải màn hướng dẫn — nó là **cách bạn thiết kế 5 phút đầu tiên**.

Điều này nghe hiển nhiên nhưng ít đội làm đúng, vì onboarding thường được làm **cuối cùng**, khi game đã xong và người làm đã quên cảm giác không biết gì. Đó là lý do gần như mọi tutorial đều dạy sai thứ tự: nó dạy theo trình tự hệ thống được xây, không theo trình tự người lạ cần hiểu.

## Ba mốc: 30 giây, 5 phút, 30 phút

Mỗi mốc trả lời một câu hỏi khác nhau trong đầu người chơi, và hỏng ở mốc nào thì mất người ở mốc đó.

| Mốc | Câu hỏi trong đầu người chơi | Bạn phải chứng minh |
|---|---|---|
| **30 giây** | "Tôi làm gì ở đây?" | Họ đã thực hiện trọn vẹn [[core-loop]] ít nhất một lần |
| **5 phút** | "Game này có vui không?" | Đã có một khoảnh khắc đáng kể — thắng một trận nhỏ, mở một thứ, hiểu một mẹo |
| **30 phút** | "Còn gì phía trước không?" | Đã thấy được chiều sâu: một hệ thống mở ra, một mục tiêu dài hạn xuất hiện |

Mốc 30 giây là mốc bị vi phạm nhiều nhất — bởi logo, cutscene, màn hình chọn nhân vật, và tutorial dạy điều khiển. Tất cả đều là thứ chen vào giữa người chơi và câu trả lời cho câu hỏi *tôi làm gì ở đây*.

Cách kiểm tra thô mà hiệu quả: bấm giờ từ lúc nhấn Play tới lúc người chơi tự làm được vòng lặp chính. Trên 60 giây là đang tiêu tiền của mình.

## Ba nhịp dạy một cơ chế

Một cơ chế không được học xong trong một lần gặp. Nó cần ba lần, và ba lần đó phải khác nhau về bản chất:

<figure class="fig">
<svg viewBox="0 0 660 208" role="img" aria-label="Ba nhịp dạy một cơ chế: bối cảnh an toàn, áp dụng có phạt, kết hợp với cơ chế cũ">
  <rect x="20" y="40" width="180" height="72" rx="8" fill="#51cf9b" opacity="0.16"/>
  <rect x="20" y="40" width="180" height="72" rx="8" class="fig-box" fill="none"/>
  <text x="110" y="66" text-anchor="middle" class="fig-label" font-size="13">1 · Bối cảnh an toàn</text>
  <text x="110" y="86" text-anchor="middle" class="fig-muted" font-size="10">thử thoải mái, sai không mất gì</text>
  <text x="110" y="102" text-anchor="middle" class="fig-muted" font-size="10">hố nhỏ, không có địch</text>
  <path d="M204 76 L232 76" class="fig-line"/>
  <path d="M226 71 L238 76 L226 81 Z" class="fig-line" fill="currentColor"/>
  <rect x="240" y="40" width="180" height="72" rx="8" fill="#ffd43b" opacity="0.16"/>
  <rect x="240" y="40" width="180" height="72" rx="8" class="fig-box" fill="none"/>
  <text x="330" y="66" text-anchor="middle" class="fig-label" font-size="13">2 · Áp dụng có phạt</text>
  <text x="330" y="86" text-anchor="middle" class="fig-muted" font-size="10">sai thì mất máu, không mất run</text>
  <text x="330" y="102" text-anchor="middle" class="fig-muted" font-size="10">hố có gai dưới đáy</text>
  <path d="M424 76 L452 76" class="fig-line"/>
  <path d="M446 71 L458 76 L446 81 Z" class="fig-line" fill="currentColor"/>
  <rect x="460" y="40" width="180" height="72" rx="8" fill="#6ea8fe" opacity="0.16"/>
  <rect x="460" y="40" width="180" height="72" rx="8" class="fig-box" fill="none"/>
  <text x="550" y="66" text-anchor="middle" class="fig-label" font-size="13">3 · Kết hợp</text>
  <text x="550" y="86" text-anchor="middle" class="fig-muted" font-size="10">dùng chung với cơ chế đã học</text>
  <text x="550" y="102" text-anchor="middle" class="fig-muted" font-size="10">nhảy qua hố trong lúc bị bắn</text>
  <text x="330" y="146" text-anchor="middle" class="fig-muted" font-size="11">nhịp 3 mới là lúc cơ chế thật sự được HỌC — hai nhịp đầu chỉ là làm quen</text>
  <text x="330" y="170" text-anchor="middle" class="fig-muted" font-size="10">bỏ nhịp 1 → người chơi thấy bất công · bỏ nhịp 2 → họ không nhớ · bỏ nhịp 3 → họ không dùng lại</text>
</svg>
<figcaption>Mỗi cơ chế mới đi qua đủ ba nhịp trước khi cơ chế tiếp theo được giới thiệu. Ba cơ chế mới trong một phòng nghĩa là không cơ chế nào được học.</figcaption>
</figure>

Chu trình răng cưa ở [[difficulty-curve]] áp dụng trực tiếp ở đây: mỗi cơ chế mới là một đỉnh nhỏ, và nhịp 1 chính là đoạn hạ xuống cho phép người chơi thở.

Khoảng cách giữa ba nhịp cũng quan trọng. Quá gần thì thành bài tập lặp; quá xa thì người chơi quên. Kinh nghiệm thực dụng: nhịp 2 cách nhịp 1 khoảng một tới hai phút, nhịp 3 đến trong vòng năm phút.

## Nếu phải giải thích, thiết kế đã thất bại

**Mỗi hộp thoại hướng dẫn là một chỗ mà bố cục, hình khối hoặc phản hồi chưa đủ rõ.** Xem kỹ thuật dạy bằng không gian ở [[level-design]].

Ba công cụ dạy mà không cần chữ, theo thứ tự nên ưu tiên:

1. **Bố cục ép hành động.** Một hố nhỏ không thể không nhảy qua dạy nút nhảy chắc chắn hơn mọi tooltip. Người chơi không đọc, nhưng họ luôn thử.
2. **Phản hồi tức thì.** Làm đúng thì có âm thanh, rung, hiệu ứng; làm sai thì có phản hồi khác hẳn. Đây là cách con người học nhanh nhất và nó không cần ngôn ngữ nào.
3. **Trình diễn bằng NPC hoặc kẻ địch.** Cho người chơi *thấy* cơ chế trước khi phải *dùng* nó. Kẻ địch đầu tiên né đòn của bạn là cách dạy "có thể né" mà không cần nói.

**Đừng khoá tay người chơi.** Tutorial ép làm đúng một thao tác duy nhất ("nhấn W để đi tới") biến người chơi thành khán giả. Hãy tạo tình huống mà hành động đúng là hành động tự nhiên nhất.

## Khi nào hộp thoại là chấp nhận được

Nguyên tắc trên không phải luật tuyệt đối. Có loại thông tin không dạy được bằng bố cục, và cố dạy bằng bố cục thì thành đánh đố.

| Loại thông tin | Dạy bằng | Vì sao |
|---|---|---|
| Thao tác vật lý (nhảy, né, bắn) | **bố cục** | người chơi luôn thử nút; bố cục ép đúng lúc |
| Quan hệ nhân quả trong game | **phản hồi** | thấy kết quả là hiểu ngay |
| Con số và ngưỡng ("giáp giảm 30%") | **chữ**, trong UI | không suy ra được bằng cách thử |
| Luật trừu tượng ("khắc chế theo vòng") | **chữ + biểu tượng** | mò ra bằng thử-sai quá đắt |
| Quy ước ngược với thể loại | **chữ, một lần** | người chơi đang mang kỳ vọng sai |

Quy tắc gộp lại: **dạy bằng bố cục thứ người chơi sẽ thử; dạy bằng chữ thứ người chơi không thể suy ra.** Và khi buộc phải dùng chữ, hãy đặt nó ở nơi tra cứu lại được — bảng kỹ năng, tooltip vật phẩm — chứ đừng đặt trong hộp thoại hiện một lần rồi biến mất.

## Thứ tự giới thiệu cơ chế

Sắp thứ tự theo hai tiêu chí, theo đúng thứ tự ưu tiên này:

1. **Cơ chế nào cần để sống sót trong 30 giây đầu?** Dạy trước. Thường là di chuyển và một hành động chính.
2. **Cơ chế nào là điều kiện của cơ chế khác?** Né phải có trước "né rồi phản đòn".

Còn lại thì **hoãn tới lúc cần**. Cơ chế chỉ dùng ở giờ thứ hai thì dạy ở giờ thứ hai — dạy sớm là dạy vào khoảng không, vì người chơi chưa có bối cảnh để gắn nó vào.

Một sai lầm hay gặp là dạy hệ thống **quản lý** (kho đồ, chế tạo, cây kỹ năng) quá sớm. Những thứ đó chỉ có nghĩa khi người chơi đã có thứ để quản lý. Mở giao diện chế tạo khi túi đồ còn trống là dạy một khái niệm rỗng.

## Phễu onboarding: đo ở đâu

**Đo, đừng đoán.** Log từng bước onboarding và xem người chơi rơi ở đâu — đây là phễu có tỉ lệ cải thiện cao nhất trong toàn bộ game. Xem [[playtesting-metrics]].

Bộ sự kiện tối thiểu, mỗi cái kèm mốc thời gian tính từ lúc vào game:

```
game_start           → mẫu số của mọi tỉ lệ
first_input          → họ có hiểu là mình điều khiển được không
core_loop_complete   → mốc 30 giây: đã làm trọn vòng lặp lần đầu chưa
mechanic_taught_X    → mỗi cơ chế, ở cả ba nhịp
first_death          → chết lần đầu ở đâu, sau bao lâu
tutorial_complete    → mốc 5 phút
session_end          → thoát ở bước nào
```

Cách đọc: tìm **bước có tỉ lệ rơi cao nhất**, không phải tổng tỉ lệ rơi. Một bước làm mất 30% người chơi thì sửa nó đáng giá hơn mọi cải thiện khác cộng lại.

Hai con số hay bị bỏ qua nhưng nói rất nhiều:

- **Thời gian tới `core_loop_complete`.** Nếu trung vị trên 60 giây, có thứ gì đó đang chen vào giữa.
- **Thời gian tới `first_death`.** Chết quá sớm là nản; không bao giờ chết trong 30 phút đầu nghĩa là game chưa dạy được rằng nó có rủi ro.

## Kiểm tra nhanh

- Bấm giờ từ Play tới lúc người chơi tự làm trọn core loop: bao nhiêu giây?
- Đếm số hộp thoại hướng dẫn trong 5 phút đầu: bao nhiêu? Mỗi cái có thuộc loại "không suy ra được" không?
- Có chỗ nào khoá input của người chơi không?
- Mỗi cơ chế có đủ ba nhịp không, hay chỉ được dạy một lần?
- Có phòng nào dạy hơn một cơ chế mới cùng lúc không?
- Đã log đủ phễu chưa? Bước nào đang rơi nhiều nhất?
- Đưa cho một người chưa từng chơi thể loại này: họ kẹt ở đâu, và bạn có im lặng được trong lúc họ kẹt không?

## 🤖 Prompt cho AI

Onboarding là chỗ AI mặc định đẻ ra hộp thoại hướng dẫn. Phải cấm từ đầu.

**Dùng AI thế nào cho khâu onboarding**

Có một việc AI làm rất tốt ở đây mà người làm game khó tự làm: **giả vờ không biết gì**. Bạn đã mất khả năng nhìn game mình bằng mắt người lạ từ tháng thứ hai; AI thì có thể được yêu cầu mô tả đúng những gì suy ra được từ màn hình mà không dùng kiến thức nền.

Ba cách dùng, giá trị giảm dần:

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Đóng vai người lạ | đã có bố cục màn đầu | "Đây là mô tả 5 phút đầu. Kể lại bạn hiểu gì, ĐỪNG dùng kiến thức thể loại" |
| Rà cơ chế chưa được dạy | đã có danh sách cơ chế | "Cơ chế nào người chơi gặp trước khi được dạy?" |
| Đề xuất bố cục dạy học | đang thiết kế màn | "Thiết kế phòng dạy \<cơ chế\> qua 3 nhịp, không dùng chữ" |

Việc **không** nên giao: quyết định cơ chế nào dạy trước. Thứ tự đó phụ thuộc vào core loop và vào người chơi mục tiêu của bạn — AI sẽ mặc định theo thứ tự phổ biến của thể loại.

**Phải nêu rõ:**
- Người chơi phải làm được gì trong 30 giây đầu
- Thứ tự giới thiệu cơ chế, **mỗi lần một cơ chế**
- Cấm hộp thoại / cấm khoá input
- Điểm đo: log sự kiện nào để biết người chơi rơi ở đâu
- Người chơi mục tiêu đã quen thể loại chưa — quyết định lượng phải dạy

**Mẫu prompt**

```
Thiết kế 5 phút đầu, KHÔNG có hộp thoại hướng dẫn, KHÔNG khoá input.
Người chơi mục tiêu: chưa từng chơi thể loại này.

Ràng buộc:
- 0-30s: người chơi phải thực hiện trọn vẹn core loop ít nhất 1 lần
- Mỗi phòng dạy ĐÚNG MỘT cơ chế, theo 3 nhịp:
    bối cảnh an toàn -> áp dụng có phạt -> kết hợp với cơ chế cũ
- Cơ chế mới được dạy bằng BỐ TRÍ KHÔNG GIAN (xem [[level-design]]),
  không bằng chữ. Nếu một cơ chế không dạy được bằng bố trí, hãy NÓI RA
  thay vì bịa ra một bố cục gượng ép.

Thứ tự: di chuyển -> đánh -> né -> kết hợp né+đánh -> tài nguyên

Kèm:
1. Danh sách sự kiện cần log ở mỗi bước để dựng phễu rơi rụng.
2. Với mỗi phòng: người chơi sẽ thử SAI kiểu gì, và bố cục phản hồi ra sao.
```

**Bẫy thường gặp:** AI đề xuất "hiện tooltip: nhấn Space để nhảy". Câu `KHÔNG có hộp thoại` buộc nó phải nghĩ ra tình huống — ví dụ một hố nhỏ không thể không nhảy qua. Bẫy thứ hai: AI dồn cả ba nhịp của một cơ chế vào cùng một phòng, nên nhịp 2 và 3 mất tác dụng — hãy yêu cầu nêu rõ khoảng cách thời gian giữa ba nhịp.

## 🎮 Unity

Trong Unity, onboarding hỏng vì một lý do kỹ thuật rất cụ thể: **thứ tự khởi tạo**. Tutorial bật trước khi hệ thống nó dạy sẵn sàng.

**Nơi các quyết định sống**

- `Assets/Scenes/Level_00_Tutorial.unity` — màn đầu, dựng bằng bố cục
- `Core/Onboarding/TutorialFlow.cs` — chuỗi bước, C# thuần
- `Assets/Data/Onboarding/*.asset` — điều kiện hoàn thành từng bước

**Thứ tự khởi tạo — nguồn bug số một**

```csharp
// ❌ Awake của TutorialManager có thể chạy TRƯỚC PlayerController
void Awake() => player.EnableMovement(false);   // player có thể chưa tồn tại

// ✅ đợi hệ thống báo sẵn sàng
void OnEnable() => GameBootstrap.OnSystemsReady += StartTutorial;
```

Thứ tự `Awake` giữa các GameObject **không xác định** trừ khi bạn đặt Script Execution Order. Cách chắc chắn hơn là một bootstrap phát event khi mọi hệ thống đã sẵn sàng — xem [[unity-game-loop]].

**Dạy bằng bố cục, cưỡng chế bằng collider**

Nguyên tắc "không hộp thoại" ở phần trên hiện thực hoá thế nào: dùng **trigger collider** làm cửa một chiều.

```csharp
// Phòng đầu tiên: một hố nhỏ không thể không nhảy qua.
// Người chơi học nhảy vì không có cách nào khác, không vì có tooltip.
void OnTriggerEnter(Collider other) {
    if (other.CompareTag("Player")) TutorialFlow.Complete("learned_jump");
}
```

Không khoá input, không hiện chữ. Bố cục làm việc dạy.

**Log phễu — thứ quyết định bạn sửa đúng chỗ**

```csharp
// Mỗi bước một event. Không có log thì không biết người chơi rơi ở đâu.
Analytics.Log("tutorial_step", new { step = "learned_dodge", seconds = elapsed });
```

Xem [[playtesting-metrics]] về cách đọc phễu. Đây là phễu có tỉ lệ cải thiện cao nhất trong toàn game, nên đừng bỏ log.

**Bẫy Unity cụ thể**
- **`Awake` order không xác định** → tutorial chạm vào object chưa khởi tạo.
- **Khoá input bằng `Time.timeScale = 0`** rồi quên rằng coroutine dùng `WaitForSeconds` sẽ đứng. Dùng `WaitForSecondsRealtime` — xem [[ux-flow]].
- **Tutorial trong cùng scene với gameplay** → không test riêng được. Tách scene hoặc tách prefab bật/tắt.
- **`DontDestroyOnLoad` cho TutorialManager** → nó sống sang màn 2 và bật lại. Đừng.

**Kiểm tra nhanh**
- Load thẳng vào Level_00 từ Editor: tutorial chạy đúng không?
- Load vào Level_03: tutorial có bật nhầm không?
- Đếm số hộp thoại hướng dẫn: bao nhiêu? (càng gần 0 càng tốt)
- 30 giây đầu: người chơi đã làm trọn core loop chưa?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao "nhấn W để đi tới" là tutorial tệ?**
  → Nó khoá người chơi thành khán giả và dạy sai thứ. Người chơi luôn thử nút; cái họ thiếu không phải tên nút mà là **lý do** để bấm. Một cái hố nhỏ không thể không nhảy qua dạy nút nhảy chắc hơn mọi tooltip, vì nó tạo nhu cầu trước rồi mới tới thao tác.
- `Junior` **30 giây đầu người chơi phải làm được gì?**
  → Làm trọn **một vòng core loop** — hành động, thấy kết quả, hiểu vì sao. Ba mốc tôi bám: 30 giây làm trọn core loop, 5 phút có một khoảnh khắc đáng kể lại, 30 phút thấy được chiều sâu. Trung vị thời gian tới `core_loop_complete` nên dưới 60 giây; cao hơn là có thứ gì đó đang chen vào giữa.
- `Junior` **Ba nhịp khi dạy một cơ chế là gì?**
  → Bối cảnh an toàn → áp dụng có phạt → kết hợp với cơ chế cũ. Bỏ nhịp một thì người chơi thấy bất công, bỏ nhịp hai thì họ không nhớ, bỏ nhịp ba thì họ không bao giờ dùng lại cơ chế đó. Nhịp hai cách nhịp một 1–2 phút, nhịp ba trong vòng 5 phút.
- `Mid` **Có cơ chế không dạy được bằng bố cục. Anh làm sao?**
  → Thì dùng chữ, và đó không phải thất bại. Quy tắc: bố cục dạy thứ người chơi sẽ **thử**, chữ dạy thứ người chơi **không thể suy ra** — con số, ngưỡng, luật trừu tượng kiểu khắc chế theo vòng. Nhưng chữ phải đặt ở nơi tra cứu lại được, không phải hộp thoại hiện một lần rồi biến mất.
- `Mid` **Phễu onboarding tối thiểu gồm những sự kiện nào?**
  → Bảy sự kiện kèm mốc thời gian: `game_start`, `first_input`, `core_loop_complete`, mỗi `mechanic_taught`, `first_death`, `tutorial_complete`, `session_end`. Có phễu rồi thì sửa theo **bước rơi cao nhất**, không nhìn tổng tỉ lệ rơi — một bước mất 30% đáng sửa hơn mọi cải thiện khác cộng lại.
- `Mid` **Thời gian tới cái chết đầu tiên nói lên điều gì?**
  → Chết quá sớm thì người chơi nản vì chưa kịp hiểu luật. Nhưng không bao giờ chết trong 30 phút cũng là vấn đề: game chưa dạy được rằng nó có rủi ro, nên mọi lựa chọn sau đó đều không có trọng lượng. Tôi xem nó cùng lúc với thời gian tới `core_loop_complete`, hai con số này bù nghĩa cho nhau.
- `Senior` **Sắp thứ tự giới thiệu cơ chế theo tiêu chí gì?**
  → Hai tiêu chí: cái nào cần để sống sót trong 30 giây đầu, và cái nào là **điều kiện** của cái khác. Còn lại hoãn tới lúc thật sự cần. Sai lầm hay gặp là dạy hệ thống quản lý — kho đồ, chế tạo, cây kỹ năng — quá sớm; mở giao diện chế tạo khi túi đồ còn trống là dạy một khái niệm rỗng.
- `Senior` **Vì sao tutorial nên làm sớm chứ không làm cuối?**
  → Vì làm cuối thì người làm đã quên cảm giác không biết gì, và tutorial sẽ được sắp theo trình tự **hệ thống được xây** chứ không theo trình tự người lạ cần hiểu. Làm sớm còn mua thêm được nhiều lượt playtest với người mới — thứ tài nguyên khan hiếm nhất, vì mỗi người chỉ mới một lần.
- `Senior` **Dùng AI thế nào ở khâu onboarding?**
  → Bắt nó đóng vai người lạ: đưa mô tả năm phút đầu rồi yêu cầu kể lại nó hiểu gì, **không được dùng kiến thức thể loại**. Từ tháng thứ hai của dự án mình mất hẳn khả năng nhìn game bằng mắt người mới; AI thì giả vờ được, và chỗ nó hiểu sai thường trùng chỗ người lạ sẽ kẹt.

**Khung trả lời 60 giây** — "Onboarding mất 40% người chơi, anh tìm chỗ hỏng thế nào?"

> Tôi dựng phễu trước khi đoán. Log tối thiểu bảy sự kiện kèm mốc thời gian: `game_start`, `first_input`, `core_loop_complete`, mỗi `mechanic_taught`, `first_death`, `tutorial_complete`, `session_end`. Rồi tìm **bước có tỉ lệ rơi cao nhất**, không nhìn tổng tỉ lệ rơi — một bước làm mất 30% thì sửa nó đáng hơn mọi cải thiện khác cộng lại.
>
> Hai con số tôi xem đầu tiên: **thời gian tới `core_loop_complete`** — nếu trung vị trên 60 giây thì có cái gì đó đang chen vào giữa người chơi và câu trả lời cho "tôi làm gì ở đây", thường là logo, cutscene hoặc màn chọn nhân vật. Và **thời gian tới `first_death`** — chết quá sớm thì nản, không bao giờ chết trong 30 phút thì game chưa dạy được rằng nó có rủi ro.
>
> Song song đó tôi ngồi xem một người chưa từng chơi thể loại này, và **im lặng**. Chỗ họ kẹt mà tôi buộc phải lên tiếng chính là chỗ thiết kế đang thiếu.

**Họ sẽ đào tiếp**

- *"Vì sao 'nhấn W để đi tới' tệ?"* → Nó khoá người chơi thành khán giả và dạy sai thứ: người chơi luôn thử nút, cái họ cần là một lý do để thử. Một hố nhỏ không thể không nhảy qua dạy nút nhảy chắc hơn mọi tooltip, vì nó tạo nhu cầu trước rồi mới tới thao tác.
- *"Cơ chế không dạy được bằng bố cục thì sao?"* → Thì dùng chữ, và đó không phải thất bại. Quy tắc của tôi là: dạy bằng bố cục thứ người chơi sẽ **thử**; dạy bằng chữ thứ người chơi **không thể suy ra** — con số, ngưỡng, luật trừu tượng kiểu khắc chế theo vòng. Nhưng chữ phải đặt ở nơi tra cứu lại được, không phải hộp thoại hiện một lần rồi biến mất.
- *"Ba nhịp là gì?"* → Bối cảnh an toàn, áp dụng có phạt, rồi kết hợp với cơ chế cũ. Bỏ nhịp một thì người chơi thấy bất công, bỏ nhịp hai thì họ không nhớ, bỏ nhịp ba thì họ không bao giờ dùng lại cơ chế đó. Nhịp hai cách nhịp một một tới hai phút, nhịp ba trong vòng năm phút — quá gần thì thành bài tập lặp, quá xa thì quên.
- *"Sắp thứ tự cơ chế theo gì?"* → Hai tiêu chí: cái nào cần để sống sót trong 30 giây đầu, và cái nào là điều kiện của cái khác. Còn lại hoãn tới lúc cần. Sai lầm hay gặp là dạy hệ thống quản lý — kho đồ, chế tạo, cây kỹ năng — quá sớm; mở giao diện chế tạo khi túi đồ còn trống là dạy một khái niệm rỗng.
- *"Vì sao làm tutorial sớm?"* → Vì làm cuối thì người làm đã quên cảm giác không biết gì, và tutorial sẽ được sắp theo trình tự hệ thống được xây chứ không theo trình tự người lạ cần hiểu. Làm sớm còn cho mình nhiều lượt playtest với người mới hơn.
- *"Dùng AI thế nào ở khâu này?"* → Bắt nó đóng vai người lạ: đưa mô tả năm phút đầu và yêu cầu kể lại nó hiểu gì **mà không dùng kiến thức thể loại**. Mình mất khả năng nhìn game bằng mắt người lạ từ tháng thứ hai, AI thì giả vờ được.

**Cờ đỏ**

- Coi onboarding là "màn tutorial" — một khu vực tách rời, làm sau cùng.
- Dạy ba cơ chế trong một phòng rồi tưởng đã dạy xong ba cơ chế.
- Khoá input để "đảm bảo người chơi làm đúng".
- Không có log phễu, chỉ có ý kiến về chỗ người chơi bỏ cuộc.
- Nói "người chơi sẽ tự hiểu thôi" mà chưa từng ngồi xem một người lạ chơi.
- Cấm tuyệt đối mọi chữ, kể cả cho con số và ngưỡng — cực đoan ngược lại cũng sai.

**Số / ví dụ nên thuộc**

- Ba mốc: **30 giây** (làm trọn core loop) · **5 phút** (có một khoảnh khắc đáng kể) · **30 phút** (thấy chiều sâu).
- Trung vị tới `core_loop_complete` nên **dưới 60 giây**.
- **Ba nhịp** mỗi cơ chế: an toàn → có phạt → kết hợp; giãn cách **1–2 phút** rồi **trong 5 phút**.
- **Một cơ chế mới mỗi phòng**, không hơn.
- Phễu tối thiểu **7 sự kiện**; sửa theo **bước rơi cao nhất**, không theo tổng.
- Quy tắc chữ hay bố cục: bố cục cho thứ người chơi sẽ thử, chữ cho thứ không suy ra được.
