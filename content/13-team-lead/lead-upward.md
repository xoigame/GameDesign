---
id: lead-upward
title: Báo cáo lên và đỡ cho đội
summary: Trả lời đúng câu hỏi thật sau câu "bao giờ xong", báo cáo ba dòng thay vì kể task, công thức báo tin xấu có lựa chọn kèm theo, và cách nói "được, vậy đổi cái gì ra" thay vì nói không.
status: deep
read: 1050
level: advanced
order: 50
tags: [team, leadership, communication, planning, stakeholder]
related: [team-lead, lead-estimation, lead-crisis, project-milestones]
---

Khi sếp hỏi *"bao giờ xong?"*, gần như không bao giờ họ muốn biết một ngày tháng. Họ đang cần quyết một việc **khác**, và ngày tháng chỉ là đầu vào.

| Câu họ hỏi | Việc họ thật sự đang quyết | Thứ họ cần từ bạn |
|---|---|---|
| "Bao giờ xong?" | Có chốt lịch marketing / sự kiện được chưa | Một ngày **có độ tin cậy kèm theo**, không phải một ngày đẹp |
| "Sao chậm thế?" | Có phải đội đang có vấn đề không, có cần họ can thiệp không | Nguyên nhân cụ thể + việc bạn đang làm để xử lý |
| "Thêm tính năng này được không?" | Nó đáng giá bao nhiêu so với thứ đang làm | **Giá của nó**, tính bằng thứ phải cắt ra |
| "Đội có ổn không?" | Có sắp mất người không | Sự thật, kèm việc bạn đang làm |

Trả lời đúng câu hỏi thật thì một buổi họp mất năm phút. Trả lời câu hỏi bề mặt thì mất bốn mươi phút và không ai quyết được gì.

## Báo cáo ba dòng

Báo cáo dài không làm bạn trông chăm chỉ, nó làm người đọc bỏ qua. Mỗi tuần, bằng chữ, ba dòng:

```
1. TRẠNG THÁI: so với mốc <tên>, đang <đúng hẹn / chậm N ngày / sớm>.
   Căn cứ: <thứ chạy được, không phải phần trăm>.
2. RỦI RO LỚN NHẤT: <một cái>. Đang giảm nó bằng <việc cụ thể>.
   Nếu không xử lý được, hệ quả là <cái gì, khi nào>.
3. CẦN Ở ANH: <một quyết định hoặc một tài nguyên>. Hạn trả lời: <ngày>.
```

Ba điều làm nó hiệu quả:

- **Một rủi ro, không phải danh sách.** Liệt kê bảy rủi ro nghĩa là bạn chưa xếp hạng chúng, và người đọc sẽ không lo cái nào.
- **Căn cứ là thứ chạy được.** "Luồng mua hàng chạy từ client tới database trên staging" là căn cứ; "xong 80%" thì không — xem [[lead-estimation]].
- **Luôn có dòng 3.** Kể cả khi không cần gì: "tuần này không cần quyết định nào". Lead không bao giờ cần gì là lead không đẩy được việc gì lên.

Nhịp dùng được cho dự án có mốc 4–6 tuần: **một báo cáo chữ mỗi tuần**, gặp mặt ở đầu và cuối mỗi mốc. Đừng thay báo cáo bằng họp — chữ đọc lại được, và nó tự trở thành hồ sơ khi cần nhìn lại ở [[project-postmortem]].

## Báo tin xấu

Luật gốc: **không có bất ngờ.** Sếp phát hiện vấn đề từ người khác, hoặc phát hiện vào ngày mốc, là hai thứ phá lòng tin nhanh hơn chính vấn đề đó.

Cái khiến người ta trì hoãn báo tin xấu luôn là cùng một suy nghĩ: *"để tôi cứu thử một tuần đã"*. Hai tuần sau, tin xấu vẫn là tin xấu — chỉ mất thêm hai tuần lựa chọn, đúng phần quý nhất.

Năm dòng, theo thứ tự này:

```
1. SỰ VIỆC: tính năng ghép trận sẽ không kịp mốc 30/11. Tôi biết chắc từ hôm nay.
2. ẢNH HƯỞNG: bản build cho publisher sẽ không có chế độ PvP. Các phần khác không đổi.
3. LỰA CHỌN:
   a) Lùi mốc 2 tuần — giữ đủ tính năng, lệch lịch marketing.
   b) Nộp đúng hẹn, PvP tắt bằng cờ — đúng lịch, publisher thấy game thiếu phần chính.
   c) Cắt matchmaking theo trình độ, ghép ngẫu nhiên — kịp hẹn, trải nghiệm kém hơn.
4. ĐỀ XUẤT: (c), vì lịch marketing đã chốt và ghép ngẫu nhiên đủ dùng cho bản demo.
5. CẦN ANH QUYẾT: chọn a/b/c trước thứ Sáu để đội kịp đổi kế hoạch.
```

Dòng 3 là dòng phân biệt lead với người đưa tin. Mang vấn đề lên mà không mang lựa chọn thì bạn vừa đẩy cả việc suy nghĩ lên trên — và lần sau người ta sẽ đi hỏi thẳng đội thay vì hỏi bạn.

Dòng 1 nên có **"tôi biết chắc từ hôm nay"** hoặc "tôi đã nghi từ tuần trước, hôm nay đủ chắc". Nói thẳng thời điểm bạn biết là cách xây lại lòng tin nhanh nhất, kể cả khi thời điểm đó hơi muộn.

## "Được, vậy đổi cái gì ra"

Yêu cầu thêm tính năng giữa chừng là chuyện bình thường của game — thị trường đổi, publisher góp ý, playtest lộ ra vấn đề. Vấn đề không nằm ở việc thêm, mà ở việc thêm **mà không trừ**.

Đừng nói "không". Nói **giá**:

> *"Được. Thêm bảng xếp hạng tuần là khoảng 6 ngày-người, cộng phần server. Để kịp mốc 30/11, mình cần bỏ một trong ba: chế độ luyện tập, đợt polish UI, hoặc hai tuần buffer cuối. Anh muốn bỏ cái nào?"*

Câu đó làm được ba việc cùng lúc: bạn không bị mang tiếng cản trở, người quyết được quyết đúng thứ họ có quyền quyết, và **cái giá được ghi lại** — sau này không ai nhớ nhầm là "đội tự làm chậm".

Giữ sẵn một thứ, cập nhật mỗi mốc: **bảng giá**, tức là ước lượng thô cho mười tính năng hay được nhắc tới. Có bảng giá thì bạn trả lời được trong buổi họp thay vì "để em về tính rồi báo lại" — và câu trả lời tại chỗ là thứ giữ cho quyết định không bị chốt sau lưng bạn.

| Khi họ nói | Trả lời |
|---|---|
| "Cái này nhỏ mà" | "Phần code thì nhỏ. Phần khiến nó tốn là dữ liệu, test và chỗ nó đụng vào ví tiền" |
| "Cứ làm tạm, sau sửa" | "Được, với điều kiện ghi vào danh sách nợ và đặt lịch trả. Chỗ nào đụng dữ liệu người chơi thì không làm tạm được" |
| "Đội cố thêm chút" | "Cố được một đợt, không cố được ba đợt liền. Đợt gần nhất mình đã cố rồi" — xem [[lead-crisis]] |
| "Sao đội khác làm nhanh hơn?" | "Cho tôi biết cụ thể phần nào, tôi so lại. Nếu họ có cách hay hơn thì tôi muốn học" |

## Khi quyết định đi ngược ý bạn

Sẽ có lúc bạn nói rõ lựa chọn và người trên chọn cái bạn không đồng ý. Ba việc phải làm, theo thứ tự:

1. **Nói hết ý kiến của mình một lần, có lý do và có số** — trước khi quyết, không phải sau.
2. **Đã quyết thì thực hiện như thể đó là quyết định của mình.** Với đội, không nói "sếp bắt làm" — câu đó bào mòn cả quyền của bạn lẫn niềm tin của đội vào công ty. Nói được: *"Tôi đã nêu phương án khác, mình đi hướng này vì lý do X. Đây là kế hoạch."*
3. **Ghi lại rủi ro bạn đã nêu**, ngắn gọn, trong báo cáo tuần. Không phải để sau này nói "tôi đã bảo rồi" — mà để khi rủi ro thành hiện thực, cả hai bên rút được kinh nghiệm từ hồ sơ thật.

Ba thứ **không** thuộc diện "đã quyết thì thôi", phải nói lại kể cả khi phiền: nguy cơ **mất dữ liệu người chơi**, vấn đề **pháp lý hoặc điều khoản store**, và **rủi ro an toàn thông tin**. Với ba thứ này, im lặng là đồng ý, và hậu quả không nằm trong phạm vi ai đó chọn thay bạn được.

## Chắn nhiễu, nhưng đừng chắn sự thật

Không chắn thì đội bị cắt ngang cả ngày. Chắn quá tay thì đội mất bối cảnh và ngạc nhiên khi mốc siết lại.

Cách chia rõ ràng:

| Chắn lại | Truyền xuống nguyên vẹn |
|---|---|
| Yêu cầu vặt đến thẳng từng người qua chat | Ngày mốc và lý do ngày đó cứng |
| Thay đổi ưu tiên còn đang tranh cãi | Quyết định đã chốt, kèm lý do |
| Bực bội và giọng điệu của cuộc họp | Sự thật về tình hình dự án, kể cả khi xấu |
| Ba phiên bản khác nhau của cùng một yêu cầu | Phản hồi của người chơi và số liệu thật |

Một cơ chế đáng dựng sớm: **một cửa duy nhất cho yêu cầu.** Mọi yêu cầu đi qua bạn hoặc qua một hàng đợi công khai, không đi thẳng vào tai từng người. Không có nó thì bạn sẽ phát hiện đội đang làm ba việc bạn chưa từng nghe tới, và không việc nào nằm trong mốc.

<figure class="fig">
<svg viewBox="0 0 660 260" role="img" aria-label="Sơ đồ một cửa: yêu cầu từ sếp, publisher, marketing và người chơi đi qua lead rồi mới tới đội; đường đi thẳng vào từng người bị gạch bỏ">
  <defs>
    <marker id="lup-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="18"  y="24"  width="132" height="34" rx="8" class="fig-box"/>
    <rect x="18"  y="70"  width="132" height="34" rx="8" class="fig-box"/>
    <rect x="18"  y="116" width="132" height="34" rx="8" class="fig-box"/>
    <rect x="18"  y="162" width="132" height="34" rx="8" class="fig-box"/>
    <rect x="258" y="76"  width="146" height="72" rx="10" class="fig-box"/>
    <rect x="500" y="52"  width="142" height="46" rx="8" class="fig-box"/>
    <rect x="500" y="112" width="142" height="46" rx="8" class="fig-box"/>
  </g>
  <text x="84"  y="46"  text-anchor="middle" class="fig-muted" font-size="11">Sếp</text>
  <text x="84"  y="92"  text-anchor="middle" class="fig-muted" font-size="11">Publisher</text>
  <text x="84"  y="138" text-anchor="middle" class="fig-muted" font-size="11">Marketing</text>
  <text x="84"  y="184" text-anchor="middle" class="fig-muted" font-size="11">Người chơi · QA</text>
  <text x="331" y="104" text-anchor="middle" class="fig-label" font-size="13">Một cửa</text>
  <text x="331" y="126" text-anchor="middle" class="fig-muted" font-size="10">gom · xếp giá · xếp hạng</text>
  <text x="571" y="72"  text-anchor="middle" class="fig-label" font-size="12">Mốc đang chạy</text>
  <text x="571" y="90"  text-anchor="middle" class="fig-muted" font-size="10">không ai chen ngang</text>
  <text x="571" y="132" text-anchor="middle" class="fig-label" font-size="12">Hàng đợi mốc sau</text>
  <text x="571" y="150" text-anchor="middle" class="fig-muted" font-size="10">công khai, ai cũng xem được</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#lup-a)" fill="none">
    <path d="M150 41  Q210 41 252 88"/>
    <path d="M150 87  Q210 87 252 104"/>
    <path d="M150 133 Q210 133 252 122"/>
    <path d="M150 179 Q210 179 252 140"/>
    <path d="M404 100 H494"/>
    <path d="M404 124 H494"/>
  </g>
  <path d="M150 208 Q330 236 494 176" stroke="#ff8787" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
  <line x1="300" y1="204" x2="340" y2="234" stroke="#ff8787" stroke-width="2.5"/>
  <line x1="340" y1="204" x2="300" y2="234" stroke="#ff8787" stroke-width="2.5"/>
  <text x="330" y="252" text-anchor="middle" class="fig-muted" font-size="10">yêu cầu đi thẳng vào tai từng người — chặn đường này</text>
</svg>
<figcaption>Một cửa không phải để lead giữ quyền, mà để đội biết chắc thứ mình đang làm là thứ quan trọng nhất lúc này.</figcaption>
</figure>

## Bẫy thường gặp

- **Báo cáo kể task.** Người trên không cần biết ai làm gì; họ cần biết đang đúng hẹn không và cần quyết gì.
- **Trì hoãn tin xấu để "cứu thử".** Bạn tiêu mất phần quý nhất của tin xấu: thời gian còn lựa chọn.
- **Nói "không" thay vì nói giá.** Người ta sẽ đi đường vòng, và lần sau bạn không được hỏi nữa.
- **Cam kết thay đội trong phòng họp.** "Chắc kịp anh ạ" nói ra trong hai giây và trả giá bằng ba tuần.
- **Nói "sếp bắt làm" với đội.** Bạn tự tuyên bố mình không có tiếng nói, và đội sẽ hành xử đúng như vậy.
- **Chắn quá kín.** Đội không biết ngày mốc cứng vì lý do gì thì họ không tự ưu tiên được, và mọi ưu tiên đều phải chờ bạn.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc báo cáo và đàm phán phạm vi**

Việc hợp nhất là **nén**: bạn có nhật ký công việc, commit, ticket của cả tuần và cần ba dòng. Việc thứ hai là **diễn tập**: cho nó đóng vai người sẽ phản đối, để bạn thử trước phần khó. Việc nó không được làm là **làm mềm sự thật** — đó là lúc báo cáo bắt đầu nói dối một cách lịch sự.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Nén báo cáo | Cuối tuần | "Từ nhật ký này, viết 3 dòng: trạng thái so với mốc, một rủi ro lớn nhất, một thứ cần quyết" |
| Bảng giá | Trước buổi bàn phạm vi | "Xé tính năng này thành task ≤2 ngày để tôi có con số thô trả lời tại chỗ" |
| Diễn tập | Trước buổi báo tin xấu | "Đóng vai giám đốc sản phẩm đang bực, phản bác kế hoạch của tôi. Hỏi tôi những câu khó nhất" |
| Rà độ thật | Sau khi viết nháp | "Chỉ ra chỗ nào trong báo cáo này đang nói giảm so với dữ liệu tôi đưa" |

Chế độ cuối đáng dùng nhất và ít ai dùng. Ai cũng có xu hướng viết "gặp một chút vướng mắc" cho thứ thật ra là "chắc chắn trễ hai tuần" — và chính bạn khó tự thấy điều đó trong bản nháp của mình.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Người đọc là ai**: giám đốc kỹ thuật hiểu code, hay publisher chỉ quan tâm ngày và doanh thu. Hai bản báo cáo khác nhau hoàn toàn.
- **Mốc và ngày cứng**, cùng lý do cứng.
- **Quyền của bạn**: được đề xuất lùi ngày không, được cắt tính năng không.
- **Sự thật trần trụi về tiến độ** — nếu bạn đưa vào dữ liệu đã làm đẹp thì bản báo cáo sẽ đẹp gấp đôi.
- **Văn hoá báo cáo của công ty**: nơi quen nghe thẳng, nơi cần vòng hơn. Cái này AI không đoán được.

**Mẫu prompt**

```
Bối cảnh: tôi là team lead, báo cáo cho <giám đốc kỹ thuật / producer / publisher>.
Người đọc quan tâm nhất tới <ngày phát hành / chất lượng / chi phí>.
Mốc: <tên>, ngày <dd/mm>, cứng vì <lý do>. Tôi được phép <cắt tính năng / lùi ngày / không>.

Việc 1: từ nhật ký dưới đây, viết báo cáo ĐÚNG 3 dòng:
  1 trạng thái so với mốc, căn cứ là thứ CHẠY ĐƯỢC (không dùng phần trăm);
  2 một rủi ro lớn nhất + việc đang làm để giảm + hệ quả nếu không xử lý được;
  3 một thứ cần người đọc quyết, kèm hạn trả lời.

Việc 2: chỉ ra mọi chỗ trong bản nháp của tôi đang NÓI GIẢM so với dữ liệu trong nhật ký.

Ràng buộc:
- KHÔNG liệt kê task, KHÔNG nêu tên từng người.
- KHÔNG dùng "sắp xong", "khoảng chừng", "cơ bản là ổn" — mọi mệnh đề phải có căn cứ.
- Nếu dữ liệu không đủ để kết luận đúng hẹn hay trễ, ghi thẳng "chưa đủ căn cứ".

<dán nhật ký công việc / commit / ticket>
```

**Bẫy thường gặp:** AI viết báo cáo nghe rất chuyên nghiệp bằng cách làm tròn mọi thứ về phía tích cực — "tiến độ nhìn chung khả quan, một vài hạng mục cần theo dõi thêm" — và bạn gửi đi mà không nhận ra mình vừa giấu một tin xấu. Bẫy thứ hai: nó tự sinh ra ngày hoàn thành để lấp vào dòng trạng thái, và ngày đó thành cam kết. Bẫy thứ ba: nhờ nó soạn lời từ chối một yêu cầu — ra một đoạn văn lịch sự mà không có con số nào, tức là mất đúng thứ duy nhất khiến lời từ chối được chấp nhận.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Mid` **Sếp hỏi "bao giờ xong", anh trả lời thế nào?**
  → Tôi trả lời câu hỏi thật đằng sau nó, thường là họ đang cần chốt một thứ khác — lịch marketing, ngân sách, hay hẹn với publisher. Nên tôi đưa ngày kèm độ tin cậy và kèm căn cứ là thứ chạy được, ví dụ "luồng mua hàng đã chạy từ client tới database trên staging, phần còn lại là ghép trận, tôi tin 80% là kịp 30/11". Ngày trần trụi không kèm căn cứ thì lần sau không ai tin nữa.
- `Mid` **Publisher muốn thêm một tính năng giữa chừng. Anh nói gì?**
  → Tôi không nói không, tôi nói giá: tính năng đó khoảng sáu ngày-người cộng phần server, nên để giữ mốc thì cần bỏ một trong ba thứ — chế độ luyện tập, đợt polish UI, hoặc buffer cuối — và tôi hỏi họ chọn bỏ cái nào. Cách này giữ được ba thứ: tôi không mang tiếng cản trở, người có quyền quyết được quyết, và cái giá được ghi lại để sau này không ai nhớ nhầm là đội tự chậm.
- `Senior` **Anh biết chắc mốc sẽ trượt. Bao giờ và báo thế nào?**
  → Báo ngay hôm biết chắc, vì thứ quý nhất của tin xấu là thời gian còn lựa chọn, mà trì hoãn một tuần là tiêu mất đúng phần đó. Tôi báo theo năm dòng: sự việc và thời điểm tôi biết, ảnh hưởng cụ thể tới cái gì, hai ba lựa chọn kèm đánh đổi của từng cái, đề xuất của tôi, và thứ tôi cần họ quyết kèm hạn. Mang vấn đề lên mà không mang lựa chọn thì lần sau họ đi hỏi thẳng đội thay vì hỏi tôi.
- `Senior` **Cấp trên quyết ngược với đề xuất của anh. Anh nói gì với đội?**
  → Tôi nêu hết ý kiến và số liệu **trước** khi quyết, một lần, đủ mạnh. Quyết rồi thì tôi thực hiện như quyết định của chính mình: với đội tôi nói "tôi đã nêu phương án khác, mình đi hướng này vì lý do X, đây là kế hoạch" — không nói "sếp bắt làm", vì câu đó vừa bỏ quyền của tôi vừa làm đội mất niềm tin vào công ty. Tôi ghi rủi ro đã nêu vào báo cáo tuần, không phải để nói "tôi đã bảo rồi" mà để lần sau cả hai bên có hồ sơ thật mà rút kinh nghiệm. Ngoại lệ duy nhất là ba thứ tôi sẽ nói lại kể cả khi phiền: mất dữ liệu người chơi, vấn đề pháp lý hoặc điều khoản store, và rủi ro an toàn thông tin.

**Khung trả lời 60 giây** — "Anh báo cáo lên cấp trên thế nào?"

> Mỗi tuần một báo cáo **bằng chữ, ba dòng**. Dòng một: trạng thái so với mốc, và căn cứ phải là **thứ chạy được**, không phải phần trăm. Dòng hai: **một** rủi ro lớn nhất, việc tôi đang làm để giảm nó, và hệ quả nếu không xử lý được — liệt kê bảy rủi ro nghĩa là tôi chưa xếp hạng chúng. Dòng ba: một thứ tôi cần họ quyết, kèm hạn trả lời.
>
> Tin xấu thì luật là **không có bất ngờ**: báo ngay hôm tôi biết chắc, kèm hai ba lựa chọn có đánh đổi và đề xuất của tôi. Lead mang vấn đề lên mà không mang lựa chọn thì lần sau người ta đi hỏi thẳng đội.
>
> Còn khi có yêu cầu thêm tính năng giữa chừng, tôi không nói "không" — tôi nói **giá**: cái này sáu ngày-người, để giữ mốc thì cần bỏ một trong ba thứ này, anh chọn bỏ cái nào. Vừa không mang tiếng cản trở, vừa để cái giá được ghi lại.

**Họ sẽ đào tiếp**

- *"Sao báo cáo chỉ một rủi ro?"* → Vì danh sách bảy rủi ro là cách nói rằng tôi chưa xếp hạng được cái nào, và người đọc sẽ không lo cái nào cả. Một rủi ro kèm việc đang làm để giảm nó thì buộc chính tôi phải chọn, và cho người trên một chỗ cụ thể để giúp.
- *"Vì sao dòng 'cần ở anh' luôn phải có?"* → Vì lead không bao giờ cần gì là lead không đẩy được việc gì lên, và thường là đang tự ôm những thứ lẽ ra cấp trên phải quyết. Kể cả khi không cần gì thì viết thẳng "tuần này không cần quyết định nào" — nó giữ thói quen cho cả hai bên.
- *"Bảng giá là gì?"* → Ước lượng thô cho khoảng mười tính năng hay được nhắc tới, cập nhật mỗi mốc. Có nó thì tôi trả lời được ngay trong buổi họp thay vì "để em về tính rồi báo lại" — mà câu về-tính-rồi-báo-lại chính là lúc quyết định bị chốt sau lưng mình.
- *"Có khi nào anh không truyền tin xấu xuống đội không?"* → Tôi chắn tiếng ồn chứ không chắn sự thật. Bực bội trong phòng họp, ba phiên bản của cùng một yêu cầu, thay đổi còn đang tranh cãi thì giữ lại. Nhưng ngày mốc, lý do nó cứng, và tình hình thật của dự án thì truyền xuống nguyên vẹn — đội không biết vì sao ngày đó cứng thì họ không tự ưu tiên được.
- *"Nếu sếp ép cam kết ngay trong phòng họp?"* → Tôi không cam kết thay đội. Tôi nói được phạm vi nào chắc chắn làm được, và hẹn trả lời phần còn lại sau khi hỏi người sẽ làm — thường trong ngày. Một câu "chắc kịp anh ạ" nói ra trong hai giây và trả giá bằng ba tuần.

**Cờ đỏ**

- Báo cáo liệt kê task và tên người thay vì trạng thái và quyết định cần.
- Giấu tin xấu cho tới ngày mốc, hoặc để sếp nghe từ người khác trước.
- Nói "không" với yêu cầu mới mà không đưa ra được cái giá bằng con số.
- "Sếp bắt làm" — nói với đội câu này.
- Im lặng trước rủi ro mất dữ liệu người chơi hoặc vi phạm điều khoản store vì "đã quyết rồi".

**Số / ví dụ nên thuộc**

- Báo cáo **3 dòng**: trạng thái · một rủi ro · một thứ cần quyết.
- Báo tin xấu **5 dòng**: sự việc + thời điểm biết · ảnh hưởng · 2–3 lựa chọn · đề xuất · cần quyết gì, hạn nào.
- Nhịp: **một báo cáo chữ mỗi tuần**, gặp mặt đầu và cuối mỗi mốc.
- Bảng giá: ước lượng thô cho khoảng **10** tính năng hay được nhắc, cập nhật mỗi mốc.
- Ba thứ không im lặng: **dữ liệu người chơi · pháp lý và điều khoản store · an toàn thông tin**.

**Kể trong dự án**

- *"Anh làm việc với cấp trên thế nào?"* → Kể cơ chế: báo cáo ba dòng hằng tuần, một cửa cho yêu cầu, bảng giá tính năng. Cơ chế nghe ra ngay là người đã làm thật, khác hẳn với "em báo cáo đầy đủ và thường xuyên".
- *"Có lần nào anh phải báo tin rất xấu?"* → Chọn một lần thật, nêu **thời điểm bạn biết** và **thời điểm bạn báo** — nếu hai mốc đó cách nhau thì nói thẳng và nói bạn rút ra gì. Câu chuyện có sai lầm được kể trung thực đáng tin hơn câu chuyện hoàn hảo.
- *"Anh từng đẩy lùi một yêu cầu từ trên chưa?"* → Kể theo công thức giá: yêu cầu là gì, bạn quy ra bao nhiêu, đề nghị bỏ gì, và cuối cùng họ chọn gì. Kể cả khi kết cục là bạn phải làm cả hai, việc bạn đưa được cái giá lên bàn vẫn là phần đáng kể.
