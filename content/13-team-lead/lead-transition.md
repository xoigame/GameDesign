---
id: lead-transition
title: 30 ngày đầu làm lead
summary: Bốn tuần đầu làm gì theo thứ tự nào, toán học của câu "tôi tự làm cho nhanh", và cách xử lý việc hôm qua còn là đồng nghiệp ngang hàng hôm nay đã là người đánh giá.
status: deep
read: 1010
level: intermediate
order: 10
tags: [team, leadership, onboarding, process]
related: [team-lead, lead-delegation, project-anatomy, project-milestones]
---

Tuần đầu làm lead, ai cũng mắc cùng một lỗi: **bắt đầu bằng việc sửa.** Bạn đã ở trong đội đủ lâu để biết ba thứ đang sai, và giờ bạn có quyền sửa chúng — nên bạn sửa ngay tuần đầu.

Lỗi ở chỗ: ba thứ bạn thấy sai là ba thứ **nhìn từ ghế cũ**. Ghế mới nhìn thấy sáu thứ khác, và hai trong ba thứ cũ hoá ra có lý do.

Bốn tuần đầu vì thế nên đi theo thứ tự **nghe → vẽ bản đồ → chốt luật chung → đổi một thứ**. Không phải vì lịch sự, mà vì đổi sớm thì bạn tiêu vốn tín nhiệm vào thứ có thể không đáng.

## Toán học của "tôi tự làm cho nhanh"

Câu này đúng, và đó chính là vấn đề. Bạn làm nhanh hơn thật — trong **một lần**.

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Đồ thị so sánh tổng thời gian của lead khi tự làm so với khi kèm người khác: tự làm tăng đều mỗi lần lặp lại, kèm tốn gấp ba lần đầu rồi gần như phẳng, hai đường cắt nhau quanh lần thứ tư">
  <defs>
    <marker id="ltr-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <line x1="70" y1="250" x2="636" y2="250" stroke="#6ea8fe" stroke-width="1.5" marker-end="url(#ltr-a)"/>
  <line x1="70" y1="250" x2="70" y2="34" stroke="#6ea8fe" stroke-width="1.5" marker-end="url(#ltr-a)"/>
  <text x="352" y="284" text-anchor="middle" class="fig-muted" font-size="11">số lần việc đó lặp lại</text>
  <text x="26" y="140" text-anchor="middle" class="fig-muted" font-size="11" transform="rotate(-90 26 140)">tổng giờ của lead</text>
  <polyline points="70,250 160,220 250,190 340,160 430,130 520,100 610,70" fill="none" stroke="#ff8787" stroke-width="2.5"/>
  <polyline points="70,250 160,160 250,154 340,148 430,142 520,136 610,130" fill="none" stroke="#51cf9b" stroke-width="2.5"/>
  <circle cx="385" cy="145" r="5" fill="none" stroke="#ffd43b" stroke-width="2"/>
  <text x="385" y="128" text-anchor="middle" class="fig-muted" font-size="10">hoà vốn ≈ lần thứ 4</text>
  <text x="614" y="62" text-anchor="end" class="fig-label" font-size="12">tự làm</text>
  <text x="614" y="122" text-anchor="end" class="fig-label" font-size="12">kèm một lần</text>
  <text x="176" y="152" class="fig-muted" font-size="10">lần đầu tốn ~3×</text>
  <text x="86" y="242" class="fig-muted" font-size="10">0</text>
  <text x="160" y="266" text-anchor="middle" class="fig-muted" font-size="10">1</text>
  <text x="340" y="266" text-anchor="middle" class="fig-muted" font-size="10">3</text>
  <text x="520" y="266" text-anchor="middle" class="fig-muted" font-size="10">5</text>
</svg>
<figcaption>Kèm người khác làm một việc tốn khoảng gấp ba lần tự làm — nhưng chỉ tốn một lần. Việc lặp lại từ lần thứ tư trở đi, tự làm là lựa chọn đắt hơn.</figcaption>
</figure>

Quy tắc rút ra, dùng được ngay:

| Việc đó | Lặp lại bao nhiêu | Nên |
|---|---|---|
| Sửa một bug lạ trong luồng thanh toán, trước giờ deadline | Một lần | **Tự làm.** Đừng đạo đức hoá chuyện này |
| Thêm một loại item vào shop | Sẽ lặp mỗi tháng | **Kèm** — và kèm bằng cách ngồi cạnh lần đầu, không phải bằng cách gửi link tài liệu |
| Dựng pipeline build lên store | Vài lần một năm, nhưng bạn sẽ nghỉ phép | **Kèm, kể cả khi chậm** — đây là chỗ đội chết nếu chỉ một người biết |

Ngoại lệ duy nhất của quy tắc: **việc mà chỉ mình bạn biết làm.** Với việc đó, tự làm không bao giờ là lựa chọn đúng, kể cả một lần — vì mỗi lần tự làm là một lần bạn xác nhận tình trạng chỉ-mình-bạn-biết.

## Tuần 1 — nghe, và chỉ nghe

Đặt lịch 30 phút với từng người trong đội. Không phải để giao việc, không phải để tuyên bố gì. Ba câu hỏi, đủ cho mọi cuộc:

1. *"Tuần vừa rồi, cái gì làm anh mất thời gian nhất mà lẽ ra không nên?"* — câu này tìm ra ma sát trong quy trình, thứ người ta đã quen chịu tới mức không còn kêu.
2. *"Phần nào trong hệ thống anh thấy sợ khi phải động vào?"* — câu này vẽ ra bản đồ nợ kỹ thuật chính xác hơn mọi công cụ phân tích code.
3. *"Nếu tôi đổi được đúng một thứ trong cách đội làm việc, anh muốn tôi đổi cái gì?"* — nghe từ 8 người, thứ được nhắc 3 lần trở lên chính là việc của tuần thứ tư.

Ghi lại. Đừng hứa gì trong tuần này ngoài *"tôi có nghe, tuần sau tôi trả lời"* — và phải trả lời thật, kể cả câu trả lời là "chưa đổi được, vì lý do này".

## Tuần 2 — vẽ hai bản đồ

**Bản đồ hệ thống — ai sở hữu cái gì.** Mỗi hệ thống lớn (kinh tế, ghép trận, UI shop, pipeline build, master data) ghi tên **một người** chịu trách nhiệm chính và **một người** biết đủ để đỡ khi người kia nghỉ. Xem [[project-anatomy]] để không bỏ sót mảnh nào.

Chỗ nào ô thứ hai trống, đó là **bus factor = 1** — rủi ro lớn nhất của đội nhỏ, và gần như luôn nằm ở ba chỗ: pipeline build, master data, và phần thanh toán.

| Hệ thống | Chính | Đỡ được | Rủi ro |
|---|---|---|---|
| Luồng kinh tế server | Nam | Hải | ổn |
| Pipeline build + ký store | Nam | — | **bus factor 1** |
| Master data từ Sheet | Linh | — | **bus factor 1** |
| UI shop | Hải | Linh | ổn |

Không sửa ngay trong tuần 2. Chỉ cần bản đồ này tồn tại là bạn đã hơn phần lớn lead — và nó cho bạn danh sách việc kèm cặp cho ba tháng tới.

**Bản đồ thời gian — quỹ thời gian thật của bạn.** Ghi lại một tuần thật, theo giờ. Gần như chắc chắn bạn sẽ thấy con số code thấp hơn bạn tưởng và số lần bị cắt ngang cao hơn bạn tưởng. Đây là dữ liệu để bạn từ chối nhận task trên đường găng ở tuần 3.

## Tuần 3 — chốt ba luật chung

Ba thứ này rẻ khi chốt sớm và rất đắt khi chốt muộn, vì càng muộn càng giống như bạn đang nhắm vào một người cụ thể:

**Định nghĩa "xong".** Viết ra, dán vào kênh chung. Với đội client–server, định nghĩa tối thiểu: chạy được từ client tới database ở môi trường dev, có người khác thử lại, không để lại cờ bật tay. Xem [[project-teamwork]] — "xong phần tôi" là định nghĩa làm hỏng mọi dự án hai phía.

**Luật review.** Cái gì chặn merge, cái gì chỉ là góp ý, và bao lâu thì một PR được trả lời. Con số dùng được cho đội nhỏ: **trả lời trong một ngày làm việc**, PR không quá 400 dòng thay đổi. Chi tiết ở [[lead-delegation]].

**Đường găng là của đội, không phải của bạn.** Tuyên bố thẳng: từ giờ bạn không nhận task mà người khác đang chờ. Nghe như bạn đang né việc khó — nên phải giải thích bằng dữ liệu tuần 2: *"tuần rồi tôi bị cắt ngang 14 lần, task của tôi không thể là task ba người chờ"*.

## Tuần 4 — đổi đúng một thứ

Lấy thứ được nhắc nhiều nhất ở tuần 1. Đổi **một** thứ, làm cho nó chạy hẳn, và nói rõ vì sao đổi.

Một thứ đổi xong hẳn tạo ra nhiều lòng tin hơn năm thứ đổi dở dang. Và nó dạy đội một điều quan trọng hơn chính thay đổi đó: **nói với lead thì có chuyện xảy ra.** Đó là thứ bạn cần nhất cho vòng tuần suốt phần còn lại của dự án.

## Hôm qua đồng nghiệp, hôm nay người đánh giá

Đây là phần khó nhất và không có mẹo nào làm nó dễ. Ba điều giúp được:

- **Nói thẳng ra một lần.** Với những người thân trong đội: *"có thứ từ giờ tôi sẽ không kể được nữa, và có lúc tôi phải quyết thứ anh không thích. Tôi vẫn muốn anh nói thật với tôi."* Nói một lần, rồi sống đúng như thế.
- **Đừng cố giữ nguyên sự thân mật bằng cách né trách nhiệm.** Lead né việc nói điều khó nghe sẽ mất cả hai: đội vẫn chạy sai, và người ta vẫn nhận ra bạn đang né.
- **Công bằng quan sát được quan trọng hơn công bằng trong đầu bạn.** Bạn biết mình không thiên vị bạn thân; đội thì không biết. Nên việc khó và việc thơm phải thấy rõ là chia theo lý do, và lý do phải nói ra.

Một chuyện nữa ít ai chuẩn bị: **sẽ có người trong đội từng ứng tuyển vị trí bạn đang ngồi.** Đừng vờ như không có. Nói chuyện sớm, hỏi thẳng họ muốn phát triển theo hướng nào, và giao cho họ một mảng thật sự có quyền quyết định.

## Ra khỏi 30 ngày với cái gì

- [ ] Đã 1:1 với từng người, ghi lại, và đã trả lời lại ít nhất một lần
- [ ] Bản đồ hệ thống có tên người chính + người đỡ, các ô trống đã được đánh dấu
- [ ] Biết quỹ thời gian thật của mình theo giờ, không theo cảm giác
- [ ] Định nghĩa "xong" và luật review đã viết ra, đã dán chỗ ai cũng thấy
- [ ] Đã đổi đúng một thứ, và nó chạy hẳn
- [ ] Không còn task nào của bạn nằm trên đường găng
- [ ] Có lịch 1:1 định kỳ cho ba tháng tới — xem [[lead-one-on-one]]

## Bẫy thường gặp

- **Sửa sáu thứ trong tháng đầu.** Không thứ nào xong, và đội học được rằng thay đổi của lead thì không cần theo.
- **Giữ nguyên tải code cũ.** Đây là bẫy phổ biến nhất: bạn nhận thêm việc lead mà không bỏ bớt việc cũ, và thứ bị hy sinh luôn là vòng tuần — thứ có hậu quả trễ nhất.
- **"Để tôi làm mẫu cho nhanh" ba lần liền.** Lần thứ ba thì đó không còn là làm mẫu, đó là bạn đã lấy lại việc.
- **Chờ tới khi "hết bận" mới bắt đầu 1:1.** Không bao giờ hết bận. Đặt lịch định kỳ ngay tuần 1, kể cả khi tháng đầu chưa biết nói gì.
- **Tuyên bố một quy trình mới mà không nói nó thay thế cái gì.** Đội sẽ làm cả hai, hoặc không làm cái nào.

## 🤖 Prompt cho AI

**Dùng AI thế nào trong 30 ngày đầu**

Việc của bạn trong tháng này chủ yếu là **thu thập và sắp xếp thông tin** — đúng phần AI giúp được nhiều nhất mà rủi ro thấp nhất. Ngược lại, mọi thứ liên quan tới đánh giá con người thì không, vì tháng đầu bạn còn chưa đủ dữ liệu để chính mình đánh giá.

| Việc trong 30 ngày | AI làm được | Giữ lại cho mình |
|---|---|---|
| Chuẩn bị 1:1 tuần 1 | Soạn bộ câu hỏi mở, gợi ý cách hỏi lại khi câu trả lời chung chung | Buổi nói chuyện, và ghi chép sau đó |
| Vẽ bản đồ hệ thống | Đọc lịch sử git, liệt kê ai commit nhiều nhất vào thư mục nào → bản nháp ai sở hữu cái gì | Xác nhận với chính người đó |
| Tìm bus factor 1 | Chỉ ra thư mục chỉ một người từng chạm trong 6 tháng | Quyết định kèm ai trước |
| Viết định nghĩa "xong" | Soạn bản nháp theo bối cảnh client–server của bạn | Cắt cho vừa thực tế đội |

Cách moi ra bản đồ sở hữu mà không phải hỏi vòng vo: cho agent chạy `git log` theo thư mục và đếm tác giả. Nó ra được bản nháp trong vài phút, và bản nháp sai chỗ nào thì chính chỗ sai đó là câu hỏi hay cho buổi 1:1.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Đội bao nhiêu người, ai làm mảng gì** — không nói thì nó soạn câu hỏi cho một đội 50 người có HR.
- **Bạn lên lead từ trong đội hay từ ngoài vào** — hai tình huống cần hai kiểu tuần đầu khác hẳn.
- **Dự án đang ở chặng nào** (tiền sản xuất, đang chạy nước rút tới mốc, hay đã phát hành và đang vận hành) — đang nước rút thì tuần "chỉ nghe" phải rút ngắn.
- **Bạn có được giảm tải code không**, và giảm bao nhiêu.

**Mẫu prompt**

```
Bối cảnh: tôi vừa lên team lead của đội <N> người, lên từ <trong đội / ngoài vào>.
Dự án đang ở chặng <tiền sản xuất / nước rút tới mốc <tên> ngày <dd/mm> / đã phát hành>.
Tải code của tôi <được giảm còn N% / giữ nguyên>.

Việc 1: chạy `git log --since="6 months ago" --name-only --pretty=format:"%an"` trong repo
này, gom theo thư mục cấp 1 và cấp 2, rồi lập bảng:
thư mục | người chạm nhiều nhất | số người từng chạm | CẢNH BÁO nếu chỉ 1 người.

Việc 2: từ bảng đó, liệt kê 5 chỗ rủi ro bus factor = 1, xếp theo mức thiệt hại
nếu người đó nghỉ một tháng.

Ràng buộc:
- KHÔNG suy ra năng lực của ai từ số commit. Bảng này chỉ để biết ai BIẾT chỗ nào.
- KHÔNG đề xuất quy trình mới ở bước này.
- Nêu rõ thư mục nào là code sinh tự động để tôi loại ra khỏi bảng.
```

**Bẫy thường gặp:** AI rất thích biến số commit thành đánh giá năng lực — "người này đóng góp nhiều nhất". Số commit đo *ai từng ở đâu*, không đo *ai làm tốt*; người sửa ba dòng quan trọng nhất dự án vẫn chỉ có ba dòng. Bẫy thứ hai: hỏi nó "tôi nên đổi gì trong đội" ở tuần đầu và nhận về một danh sách quy trình chuẩn ngành — daily standup, retro, story point — áp vào một đội tám người đang chạy tốt theo cách khác. Thay đổi phải đến từ thứ bạn nghe được ở tuần 1, không đến từ danh sách best practice.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Mid` **Ba mươi ngày đầu làm lead anh sẽ làm gì?**
  → Theo thứ tự nghe, vẽ bản đồ, chốt luật chung, rồi mới đổi một thứ. Tuần 1 tôi 1:1 với từng người và hỏi ba câu; tuần 2 vẽ bản đồ ai sở hữu hệ thống nào và ai đỡ được cho ai; tuần 3 chốt định nghĩa "xong" và luật review; tuần 4 đổi đúng một thứ được nhắc nhiều nhất ở tuần 1. Đổi sớm hơn thì tôi đang sửa thứ nhìn từ ghế cũ, mà ghế cũ không thấy hết.
- `Mid` **Anh thấy một task đội làm chậm, tự làm thì nửa ngày là xong. Làm hay không?**
  → Tuỳ việc đó có lặp lại không. Kèm người khác tốn khoảng gấp ba tự làm, nhưng chỉ tốn một lần, nên việc lặp lại thì từ lần thứ tư trở đi tự làm là lựa chọn đắt hơn. Việc một lần và đang gấp thì tôi tự làm, không cần đạo đức hoá. Nhưng nếu đó là việc chỉ mình tôi biết làm thì tôi không bao giờ tự làm, vì mỗi lần tự làm là một lần xác nhận đội có bus factor bằng một.
- `Senior` **Anh lên lead từ chính đội cũ. Quan hệ với người từng ngang hàng thì xử lý ra sao?**
  → Tôi nói thẳng một lần, sớm: có thứ tôi không kể được nữa, và sẽ có lúc tôi quyết thứ anh không thích, nhưng tôi vẫn cần anh nói thật. Sau đó quan trọng là công bằng phải **quan sát được**, không chỉ tồn tại trong đầu tôi — việc khó và việc thơm chia theo lý do, và lý do nói ra trước cả đội. Riêng người từng ứng tuyển đúng vị trí của tôi thì tôi nói chuyện sớm và giao hẳn một mảng có quyền quyết định thật.
- `Senior` **Anh vừa vào lead một đội đang chạy nước rút tới mốc sau ba tuần. Tuần "chỉ nghe" còn hợp lý không?**
  → Không, phải nén lại. Tôi vẫn 1:1 nhưng rút còn 15 phút và chỉ hỏi một câu: cái gì đang chặn anh. Bản đồ hệ thống thì vẫn vẽ ngay, vì đang nước rút mới càng cần biết ai đỡ được cho ai nếu có người ốm. Ba luật chung thì hoãn tới sau mốc, trừ định nghĩa "xong" — cái đó chốt ngay, vì nước rút mà mỗi người hiểu "xong" một kiểu là cách chắc chắn nhất để trượt mốc.

**Khung trả lời 60 giây** — "Ba mươi ngày đầu làm lead anh làm gì?"

> Tôi đi theo thứ tự **nghe → vẽ bản đồ → chốt luật chung → đổi một thứ**, mỗi tuần một việc.
>
> Tuần 1 chỉ nghe: 30 phút với từng người, ba câu — tuần rồi cái gì làm anh mất thời gian oan nhất, phần nào trong hệ thống anh sợ động vào, và nếu tôi đổi được đúng một thứ thì anh muốn đổi cái gì. Tuần 2 tôi vẽ hai bản đồ: ai sở hữu hệ thống nào và ai đỡ được cho ai — chỗ nào chỉ một người biết là **bus factor một**, thường nằm ở pipeline build và master data; cộng thêm bản đồ quỹ thời gian thật của chính tôi theo giờ.
>
> Tuần 3 chốt ba luật: định nghĩa "xong" chung cho cả hai phía, luật review — PR trả lời trong một ngày làm việc — và luật tôi không nhận task nằm trên đường găng. Tuần 4 mới đổi, và chỉ đổi **một** thứ: cái được nhắc nhiều nhất ở tuần 1.
>
> Lý do không đổi sớm hơn: ba thứ tôi thấy sai lúc còn ngồi ghế cũ thì hai cái thường có lý do mà từ ghế đó không nhìn ra.

**Họ sẽ đào tiếp**

- *"Sao phải chờ tới tuần 4 mới đổi?"* → Vì vốn tín nhiệm của lead mới có hạn và tiêu một lần là hết. Đổi thứ hoá ra có lý do sẵn thì bạn vừa mất vốn vừa phải quay xe, và lần sau đội sẽ chờ xem bạn có quay xe nữa không thay vì làm theo.
- *"Ba câu hỏi tuần 1 để làm gì?"* → Câu một tìm ma sát quy trình người ta đã quen chịu tới mức không kêu nữa; câu hai vẽ bản đồ nợ kỹ thuật chính xác hơn mọi công cụ phân tích code, vì nó đo nỗi sợ chứ không đo độ phức tạp; câu ba cho bạn danh sách ưu tiên — thứ nào ba người trở lên nhắc thì đó là việc của tuần 4.
- *"Bus factor 1 thường nằm ở đâu?"* → Ba chỗ gần như luôn đúng với đội nhỏ: pipeline build và ký store, master data, và phần thanh toán. Chúng là việc ít lặp lại nên không ai học lây, mà hỏng thì chặn cả đội.
- *"Anh biết mình đã qua được giai đoạn chuyển giao khi nào?"* → Khi có người báo tin xấu cho tôi trước lúc tôi hỏi, và khi đội quyết được một thứ trong lúc tôi nghỉ phép mà không cần đợi.

**Cờ đỏ**

- "Tuần đầu tôi họp cả đội và công bố quy trình mới" — thay quy trình trước khi biết quy trình cũ tồn tại vì lý do gì.
- Nhận thêm việc lead mà không bỏ bớt việc code, rồi coi đó là chăm chỉ.
- "Tôi vẫn ôm phần khó nhất để đảm bảo chất lượng."
- Không phân biệt được việc **một lần** và việc **lặp lại** khi quyết định tự làm hay kèm.
- Kể 30 ngày đầu toàn bằng cảm xúc — "tôi xây dựng lòng tin" — mà không có một thao tác nào cụ thể.

**Số / ví dụ nên thuộc**

- Kèm người khác làm một việc tốn khoảng **gấp ba** tự làm, và hoà vốn quanh **lần thứ tư**.
- 1:1 tuần đầu: **30 phút** mỗi người, **ba** câu hỏi.
- Ngưỡng PR dùng được cho đội nhỏ: trả lời trong **một ngày làm việc**, không quá **400 dòng** thay đổi.
- Ba chỗ bus factor 1 quen thuộc: **pipeline build · master data · thanh toán**.

**Kể trong dự án**

- *"Anh tiếp quản đội trong hoàn cảnh nào?"* → Nêu bối cảnh có sức nặng: đội đang ở đâu, mốc nào sắp tới, có ai vừa nghỉ không. Bối cảnh quyết định người nghe đánh giá quyết định của bạn là dũng cảm hay liều.
- *"Thay đổi đầu tiên của anh là gì, kết quả ra sao?"* → Kể **một** thay đổi, có trước và có sau, có số. "Tôi đưa lịch nối thử hằng ngày vào đội, mốc sau không còn tuần tích hợp cuối tháng" mạnh hơn một danh sách năm cải tiến.
- *"Có ai phản đối không?"* → Đừng nói không. Kể một phản đối thật, lý do của họ, và bạn đã đổi ý hay giữ nguyên — cả hai đều là câu trả lời tốt, miễn là có lý do.
