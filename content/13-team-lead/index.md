---
id: team-lead
title: Làm Team Lead
icon: 🧭
summary: Lên lead một đội game 5–15 người mà vẫn phải code — ba vòng lặp phải quay đều, cái giá của việc tự ôm việc, và sáu tình huống mà lead mới luôn xử sai lần đầu.
status: deep
read: 1000
level: intermediate
order: 80
map: true
mapLabel: Team Lead
tags: [team, leadership, process, planning, career]
related: [project, project-milestones, project-teamwork, production]
---

Ngày bạn được đưa lên lead, không ai đưa cho bạn tài liệu nào. Người ta chỉ nói *"từ tuần sau em phụ trách đội"* — và giữ nguyên số task của bạn trong sprint.

Nhánh này viết cho đúng tình huống đó: **đội 5–15 người, bạn vẫn code, không có producer riêng, và bạn chịu trách nhiệm cho thứ mình không tự tay làm.** Giả định kỹ thuật giống phần còn lại của kho — client Unity, server Go, một dự án có ngày phát hành.

Đây không phải nhánh về "kỹ năng mềm". Mọi thứ ở đây đều có thao tác cụ thể, có số, và có cách nhận ra mình đang làm sai.

## Ba vòng lặp phải quay đều

Việc của lead không phải một danh sách task, mà là **ba vòng lặp chạy ở ba tần số khác nhau**. Hỏng một vòng thì hai vòng kia vẫn quay — và đó chính là lý do người ta không nhận ra mình đang hỏng cho tới khi muộn.

<figure class="fig">
<svg viewBox="0 0 680 316" role="img" aria-label="Ba vòng lặp của team lead: vòng ngày gỡ chặn và review, vòng tuần 1:1 và điều chỉnh lịch, vòng mốc chốt phạm vi và báo cáo lên; mỗi vòng kèm hậu quả khi bỏ và độ trễ trước khi hậu quả lộ ra">
  <defs>
    <marker id="tl-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="20"  y="60"  width="250" height="62" rx="9" class="fig-box"/>
    <rect x="20"  y="142" width="250" height="62" rx="9" class="fig-box"/>
    <rect x="20"  y="224" width="250" height="62" rx="9" class="fig-box"/>
    <rect x="398" y="60"  width="262" height="62" rx="9" class="fig-box"/>
    <rect x="398" y="142" width="262" height="62" rx="9" class="fig-box"/>
    <rect x="398" y="224" width="262" height="62" rx="9" class="fig-box"/>
  </g>
  <text x="145" y="36" text-anchor="middle" class="fig-label" font-size="13">Ba vòng lặp</text>
  <text x="529" y="36" text-anchor="middle" class="fig-label" font-size="13">Bỏ thì trả giá bằng</text>
  <text x="145" y="86"  text-anchor="middle" class="fig-label" font-size="12">Vòng NGÀY · 30–60 phút</text>
  <text x="145" y="106" text-anchor="middle" class="fig-muted" font-size="10">gỡ chặn · review · quyết định nhỏ</text>
  <text x="145" y="168" text-anchor="middle" class="fig-label" font-size="12">Vòng TUẦN · 2–3 giờ</text>
  <text x="145" y="188" text-anchor="middle" class="fig-muted" font-size="10">1:1 · rà rủi ro · chỉnh lịch</text>
  <text x="145" y="250" text-anchor="middle" class="fig-label" font-size="12">Vòng MỐC · 4–6 tuần</text>
  <text x="145" y="270" text-anchor="middle" class="fig-muted" font-size="10">phạm vi · báo cáo lên · postmortem</text>
  <text x="529" y="86"  text-anchor="middle" class="fig-label" font-size="12">người ngồi chờ bạn nửa ngày</text>
  <text x="529" y="106" text-anchor="middle" class="fig-muted" font-size="10">lộ ra trong 1 ngày</text>
  <text x="529" y="168" text-anchor="middle" class="fig-label" font-size="12">người giỏi nộp đơn nghỉ</text>
  <text x="529" y="188" text-anchor="middle" class="fig-muted" font-size="10">lộ ra sau 2–3 tháng</text>
  <text x="529" y="250" text-anchor="middle" class="fig-label" font-size="12">trượt mốc, không ai báo trước</text>
  <text x="529" y="270" text-anchor="middle" class="fig-muted" font-size="10">lộ ra khi đã không sửa kịp</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#tl-a)" fill="none">
    <path d="M270 91  H392"/>
    <path d="M270 173 H392"/>
    <path d="M270 255 H392"/>
  </g>
  <text x="340" y="304" text-anchor="middle" class="fig-muted" font-size="10">độ trễ phản hồi tăng dần từ trên xuống — đó là lý do vòng dưới luôn bị bỏ trước</text>
</svg>
<figcaption>Vòng ngày bỏ là biết ngay nên không ai bỏ. Vòng mốc bỏ thì ba tháng sau mới biết, nên gần như lead mới nào cũng bỏ nó đầu tiên.</figcaption>
</figure>

Quy tắc phân bổ thời gian cho đội 5–15 người: **khoảng một nửa quỹ thời gian của bạn không còn là code.** Nếu tuần nào bạn cũng code được 80% thời gian, không phải bạn giỏi sắp xếp — mà là một trong ba vòng đang không quay.

## Các node

| # | Node | Trả lời câu gì |
|---|---|---|
| 1 | [[lead-transition]] | 30 ngày đầu làm gì, và vì sao "tôi tự làm cho nhanh" là bẫy chết người |
| 2 | [[lead-estimation]] | Ước lượng một tính năng game, và biết đội đang trượt trước khi trượt |
| 3 | [[lead-delegation]] | Giao việc mà không bỏ rơi, review mà không giành tay lái |
| 4 | [[lead-one-on-one]] | 1:1 thật sự có ích, và phát hiện người đang chìm trước khi họ nộp đơn |
| 5 | [[lead-upward]] | Báo cáo lên, đẩy lùi yêu cầu thêm tính năng, chắn nhiễu cho đội |
| 6 | [[lead-crisis]] | Trượt tiến độ, crunch, và 15 phút đầu của một sự cố production |

Ba node nền nên đọc trước nếu chưa đọc: [[project-milestones]] (mốc và cách nhận ra trượt), [[project-teamwork]] (chia việc xuyên hai phía), [[project-postmortem]] (kể lại dự án).

## Bốn thứ đổi hẳn trong ngày bạn lên lead

| Trước | Sau | Hệ quả thực tế |
|---|---|---|
| Đo bằng **việc mình làm xong** | Đo bằng **việc đội làm xong** | Tuần bạn không commit dòng nào có thể là tuần bạn tạo ra nhiều giá trị nhất — và cảm giác thì ngược lại |
| Thông tin tới **đủ** | Thông tin tới **đã lọc** | Không ai kể cho bạn tin xấu nếu lần trước bạn phản ứng mạnh |
| Sai là **sai code** | Sai là **sai người** | Code sai thì revert; giao nhầm việc cho người sai thì mất hai tuần và một phần lòng tin |
| Chặn người khác là **hiếm** | Bạn là **chỗ nghẽn mặc định** | Mọi quyết định đều chờ bạn, trừ khi bạn chủ động cho đi quyền quyết |

Điều thứ tư đau nhất và ít ai nói trước. Một lead ôm hết quyền quyết định sẽ tạo ra một đội **không ai dám quyết gì** — và đội đó đứng hình mỗi lần bạn nghỉ phép.

## Ba sai lầm kinh điển của lead mới

1. **Vẫn nhận task nằm trên đường găng.** Bạn bị kéo đi họp, đi gỡ chặn cho người khác, và task của bạn trượt — nhưng nó là task mà ba người đang chờ. Luật đơn giản: lead nhận việc **ngoài đường găng**, hoặc việc **không ai phải chờ**.
2. **Sửa code của người khác trong im lặng.** Thấy PR chưa ổn, tự sửa cho nhanh, merge. Người viết mất cơ hội học, mất luôn cảm giác sở hữu, và lần sau họ viết cẩu thả hơn vì "kiểu gì lead cũng sửa". Xem [[lead-delegation]].
3. **Báo tin xấu muộn vì "để tôi cứu thử đã".** Hai tuần sau, tin xấu vẫn là tin xấu — chỉ mất thêm hai tuần lựa chọn. Xem [[lead-upward]].

## Nguyên tắc

- **Không có bất ngờ.** Sếp và đội đều được biết tin xấu sớm nhất có thể, kể cả khi bạn chưa có giải pháp. Bất ngờ là thứ duy nhất phá lòng tin nhanh hơn thất bại.
- **Giao kết quả, không giao thao tác.** Nói *"tuần sau shop mua được đồ và trừ tiền đúng"*, đừng nói *"viết hàm BuyItem rồi gọi API"*.
- **Đo bằng thứ chạy được.** "Xong 80%" không có nghĩa gì. Một luồng chạy từ client tới database thì có.
- **Cắt phạm vi là công cụ đầu tiên, làm thêm giờ là công cụ cuối cùng.** Ở hầu hết các đội thứ tự này đang ngược — và đó là lý do họ crunch.
- **Người là tài nguyên duy nhất không hồi phục theo lịch.** Server sập thì dựng lại trong một giờ; người nghỉ việc sau khi ship thì sáu tháng sau đội vẫn chưa lấy lại tốc độ.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc của một lead**

Ranh giới rất rõ và rất dễ vượt: AI giúp bạn **soạn và rà**, không giúp bạn **quyết và nói**. Mọi thứ chạm tới một con người cụ thể — đánh giá, phản hồi, quyết định ai làm gì — phải là chữ của bạn, vì bạn là người chịu trách nhiệm và là người duy nhất biết bối cảnh.

| Việc | Giao được cho AI | Tuyệt đối không |
|---|---|---|
| Lập kế hoạch mốc | Chia tính năng thành task ≤2 ngày, liệt kê phụ thuộc, tìm việc bị quên (build, chứng chỉ store, QA) | Chốt ngày thay bạn |
| Ước lượng | Hỏi lại "còn thiếu thông tin gì", nêu rủi ro từng task | Tin con số nó đưa ra khi nó không biết đội bạn |
| Chuẩn bị 1:1 | Gợi ý câu hỏi mở cho một chủ đề bạn thấy khó mở lời | Viết nhận xét về một người cụ thể |
| Báo cáo lên | Nén nhật ký công việc thành 3 dòng trạng thái | Diễn giải tin xấu thành lời nhẹ hơn sự thật |
| Postmortem | Gom log, PR, ticket thành một dòng thời gian | Kết luận nguyên nhân — đó là việc của cả đội |

Một cách dùng mạnh mà ít người nghĩ tới: **bắt AI đóng vai người phản biện kế hoạch của bạn.** Đưa kế hoạch mốc và hỏi *"ba lý do khiến kế hoạch này trượt là gì"* — nó rất giỏi tìm ra việc bạn quên đặt vào lịch: chứng chỉ store, đợt QA cuối, nghỉ lễ, người sắp nghỉ phép.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Quy mô và thành phần đội**: mấy người, ai làm client, ai làm server, ai kiêm QA. AI mặc định cho một đội có đủ mọi vai — kể cả producer và QA riêng mà bạn không có.
- **Bạn còn bao nhiêu phần trăm thời gian để code**. Không nói thì nó xếp lịch cho bạn như một lập trình viên toàn thời gian.
- **Ngày mốc cứng hay mềm**, và cứng vì lý do gì (sự kiện, hợp đồng publisher, mùa vụ).
- **Đội đã trượt bao nhiêu ở mốc trước** — hệ số quan trọng nhất, và AI không có cách nào tự biết.
- **Quyền của bạn tới đâu**: được cắt tính năng không, đổi ngày không, thêm người không. Ba câu trả lời này quyết định toàn bộ lời khuyên còn lại.

**Mẫu prompt**

```
Bối cảnh: tôi là team lead, đội <N> người (<x> client Unity, <y> server Go, <z> kiêm QA).
Tôi còn khoảng <N>% thời gian để code. Mốc tới: <tên mốc>, ngày <dd/mm>, cứng vì <lý do>.
Ba mốc gần nhất: đội ước lượng <N> ngày, làm thật hết <M> ngày.
Quyền của tôi: cắt tính năng <có/không>, đổi ngày <có/không>, thêm người <có/không>.

Việc: đọc danh sách tính năng dưới đây và trả về BA thứ, theo thứ tự:
1. Việc BỊ QUÊN mà mốc này chắc chắn cần (build, chứng chỉ store, QA, migration, lễ tết).
2. Ba rủi ro có khả năng làm trượt mốc, mỗi rủi ro kèm dấu hiệu nhận ra SỚM.
3. Nếu phải cắt 30% khối lượng thì cắt gì — xếp theo thứ tự cắt, kèm cái mất đi.

Ràng buộc:
- KHÔNG đưa ra ngày hoàn thành. Tôi chốt ngày, không phải bạn.
- KHÔNG giả định có producer, QA riêng hay designer chuyên trách.
- Chỗ nào đang đoán vì tôi chưa nói, ghi rõ "đang đoán" thay vì tự điền.

<dán danh sách tính năng>
```

**Bẫy thường gặp:** AI lập kế hoạch cho một đội lý tưởng — ai cũng toàn thời gian, không ai nghỉ, không ai kiêm việc, và lead thì không phải họp. Bẫy thứ hai nguy hiểm hơn: nhờ nó viết lời phản hồi cho một người cụ thể. Văn nó trơn tru, đúng khuôn, và rỗng — người nhận đọc ra ngay đó không phải chữ của bạn, và thứ họ học được là bạn không đủ quan tâm để tự viết ba câu.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Mid` **Anh đang là lập trình viên, vì sao muốn lên lead?**
  → Câu trả lời trượt là "vì muốn thăng tiến". Câu được là một ví dụ cụ thể: tôi thấy đội mất hai tuần vì hai phía hiểu khác nhau về một hợp đồng message, tôi đứng ra dựng quy trình chốt hợp đồng trước khi code, và mốc sau không còn lỗi loại đó nữa. Tôi muốn lên lead vì thứ tôi sửa được ở tầm đó lớn hơn thứ tôi sửa được trong file của mình.
- `Mid` **Lead thì còn code nữa không?**
  → Có, nhưng không nhận việc nằm trên đường găng. Với đội 5–15 người, khoảng một nửa thời gian của tôi đi vào gỡ chặn, review, lịch và 1:1. Nếu tôi nhận một task mà ba người đang chờ thì mỗi buổi họp đột xuất của tôi biến thành nửa ngày đứng hình của cả ba — nên tôi chọn việc ngoài đường găng: công cụ, hạ tầng build, những phần chậm cũng không ai phải chờ.
- `Senior` **Anh đo hiệu quả của mình bằng gì khi không còn tự tay làm?**
  → Bằng ba con số của đội chứ không phải của tôi: khối lượng thật đội hoàn thành mỗi mốc so với ước lượng, thời gian trung bình một PR nằm chờ review, và số lần tin xấu tới tai tôi muộn hơn ba ngày. Con số thứ ba tôi quan tâm nhất, vì nó đo thứ duy nhất không mua lại được bằng thời gian — việc người ta có dám nói với tôi hay không.
- `Senior` **Đội có một người rất giỏi nhưng ai cũng ngại làm việc cùng. Anh xử lý thế nào?**
  → Tôi tách hai chuyện: kết quả kỹ thuật, và chi phí họ gây ra cho người khác. Tôi nói riêng bằng sự việc cụ thể chứ không bằng tính cách — "trong ba PR gần đây, nhận xét của anh khiến hai người viết lại từ đầu mà không hiểu vì sao" — rồi thống nhất một thay đổi đo được, hẹn nhìn lại sau hai tháng. Nếu không đổi thì tôi chấp nhận đội chạy chậm hơn khi thiếu họ, vì giữ một người giỏi bằng giá ba người khác nghỉ việc là phép tính lỗ.

**Khung trả lời 60 giây** — "Việc của một team lead thật ra là gì?"

> Tôi nghĩ về nó như **ba vòng lặp ở ba tần số**. Vòng ngày: gỡ chặn, review, quyết định nhỏ — khoảng 30 tới 60 phút, bỏ là biết ngay vì có người ngồi chờ. Vòng tuần: 1:1, rà rủi ro, chỉnh lịch — vài giờ, bỏ thì hai ba tháng sau mới thấy hậu quả, thường dưới dạng một người giỏi nộp đơn. Vòng mốc: chốt phạm vi, báo cáo lên, postmortem — bỏ thì tới lúc biết là đã không sửa kịp.
>
> Độ trễ phản hồi tăng dần từ trên xuống, nên lead mới nào cũng bỏ vòng dưới trước. Tôi đảo lại: **vòng mốc đặt lịch cố định**, vòng ngày mới là thứ linh hoạt.
>
> Và tôi giữ một luật: vẫn code, nhưng không nhận việc nằm trên đường găng. Với đội mười người, khoảng một nửa thời gian của tôi không còn là code — tuần nào tôi cũng code được 80% thì đó là dấu hiệu một vòng đang không quay.

**Họ sẽ đào tiếp**

- *"Một nửa thời gian không code thì anh làm gì?"* → Gỡ chặn và review chiếm phần lớn vòng ngày; 1:1 hai tuần một lần với mỗi người; rà rủi ro và chỉnh lịch hằng tuần; báo cáo và chốt phạm vi theo mốc. Việc quan trọng nhất trong số đó lại là thứ ít giống việc nhất: ngồi nghe đủ lâu để biết chỗ nào sắp cháy.
- *"Bỏ vòng tuần thì hậu quả cụ thể ra sao?"* → Người ta chỉ nói ra vấn đề khi có chỗ để nói. Không có 1:1 thì thứ bạn nghe được chỉ là tình trạng task; cái bạn không nghe được là người đang chán, đang quá tải, hoặc đang giấu một vướng mắc kỹ thuật vì sợ bị coi là không làm nổi.
- *"Sao lại cấm lead nhận việc trên đường găng?"* → Vì lead là người bị cắt ngang nhiều nhất, nên task của lead có phương sai lớn nhất đội. Đặt thứ phương sai lớn vào chỗ ba người đang chờ là tự tạo ra điểm nghẽn.
- *"Đội bao nhiêu người thì công thức này đổi?"* → Trên khoảng 15 người thì bạn không giữ nổi vòng ngày cho tất cả, phải có lead nhóm nhỏ bên dưới và việc của bạn chuyển từ gỡ chặn sang chọn người gỡ chặn. Dưới 5 người thì vòng tuần gộp vào vòng ngày — nhưng đừng bỏ 1:1.

**Cờ đỏ**

- "Tôi lead nhưng vẫn ôm phần khó nhất vì không tin ai làm được" — nghe như tinh thần trách nhiệm, thực ra là mô tả một đội không được phép lớn lên.
- Đo bản thân bằng số commit hoặc số task cá nhân sau khi đã lên lead.
- "Đội tôi không cần 1:1, có gì cứ nói thẳng trong họp" — không ai nói tin xấu về chính mình trước mặt tám người.
- Không phân biệt được **trượt vì ước lượng sai** và **trượt vì phạm vi phình ra**; hai cái này chữa bằng hai cách hoàn toàn khác nhau.
- Kể chuyện lead mà không có con số nào: mấy người, mấy mốc, trượt bao nhiêu, sửa xong còn bao nhiêu.

**Số / ví dụ nên thuộc**

- Đội 5–15 người: khoảng **một nửa** quỹ thời gian của lead không còn là code.
- Vòng ngày **30–60 phút** · vòng tuần **2–3 giờ** · vòng mốc **4–6 tuần** một lần.
- 1:1: **30 phút, hai tuần một lần**, với từng người.
- Ngưỡng đội cần thêm một tầng lead: khoảng **15 người**.

**Kể trong dự án**

- *"Anh lead bao nhiêu người, làm gì?"* → Nêu **quy mô, thời gian, và một thứ bạn thay đổi được**: "tám người, mười tháng, tôi đưa quy trình chốt hợp đồng message trước khi code vào đội và lỗi tích hợp ở mốc sau giảm hẳn". Đừng liệt kê trách nhiệm — ai làm lead cũng có cùng một danh sách trách nhiệm.
- *"Quyết định khó nhất khi làm lead?"* → Chọn quyết định có **đánh đổi thật và hậu quả bạn phải sống chung**: cắt một tính năng đội đã làm nửa chừng, hoặc đổi người phụ trách một hệ thống. Kể cả cách bạn nói chuyện với người bị ảnh hưởng.
- *"Anh thất bại ở đâu?"* → Câu trả lời tốt nhất thường là một lần bạn biết tin xấu sớm mà báo lên muộn. Nó thật, ai làm lead cũng từng mắc, và nó dẫn thẳng tới luật "không có bất ngờ" mà bạn rút ra sau đó.
