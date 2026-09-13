---
id: project-postmortem
title: Kể lại dự án trong phòng phỏng vấn
summary: Bộ ba câu chuyện phải chuẩn bị sẵn, khung sáu ô để kể một dự án trong hai phút, cách nói về khó khăn và thất bại mà không tự hạ mình, và cách trả lời khi dự án bị huỷ.
status: deep
read: 980
level: intermediate
order: 80
tags: [project, interview, career, storytelling, postmortem]
related: [project-kickoff, project-launch, project-architecture, playtesting-metrics]
---

Câu mở màn của gần như mọi buổi phỏng vấn kỹ thuật là *"kể về một dự án anh đã làm"*. Nó nghe như câu xã giao. Nó không phải — nó là câu quyết định phần còn lại của buổi nói chuyện, vì mọi câu hỏi đào sâu sau đó đều lấy nguyên liệu từ câu trả lời này.

Người trượt ở câu này hiếm khi thiếu kiến thức. Họ **kể một đống mảnh rời**: làm tính năng này, sửa bug kia, dùng công nghệ nọ. Người nghe không dựng lại được hệ thống, không biết bạn sở hữu cái gì, và không có chỗ nào để hỏi tiếp.

Node này không dạy nói dối. Nó dạy **sắp xếp sự thật** theo thứ tự mà người nghe dựng được bức tranh.

## Khung sáu ô

Chuẩn bị sẵn sáu ô này cho mỗi dự án đáng kể. Viết ra giấy, đọc to, bấm giờ.

<figure class="fig">
<svg viewBox="0 0 660 260" role="img" aria-label="Khung sáu ô kể một dự án: bối cảnh, vai trò của tôi, bài toán khó nhất, cái tôi làm, kết quả đo được, và bài học rút ra">
  <g class="fig-box-g">
    <rect x="14"  y="40"  width="204" height="88" rx="9" class="fig-box"/>
    <rect x="228" y="40"  width="204" height="88" rx="9" class="fig-box"/>
    <rect x="442" y="40"  width="204" height="88" rx="9" class="fig-box"/>
    <rect x="14"  y="142" width="204" height="88" rx="9" class="fig-box"/>
    <rect x="228" y="142" width="204" height="88" rx="9" class="fig-box"/>
    <rect x="442" y="142" width="204" height="88" rx="9" class="fig-box"/>
  </g>
  <text x="330" y="26" text-anchor="middle" class="fig-muted" font-size="11">Hai phút. Mỗi ô khoảng hai mươi giây.</text>
  <text x="116" y="62"  text-anchor="middle" class="fig-label" font-size="12">1 · Bối cảnh</text>
  <text x="116" y="84"  text-anchor="middle" class="fig-muted" font-size="10">thể loại · nền tảng · đội mấy người</text>
  <text x="116" y="102" text-anchor="middle" class="fig-muted" font-size="10">bao lâu · quy mô người chơi</text>
  <text x="116" y="120" text-anchor="middle" class="fig-muted" font-size="9">một câu, có số</text>
  <text x="330" y="62"  text-anchor="middle" class="fig-label" font-size="12">2 · Vai trò của tôi</text>
  <text x="330" y="84"  text-anchor="middle" class="fig-muted" font-size="10">hệ thống nào tôi sở hữu</text>
  <text x="330" y="102" text-anchor="middle" class="fig-muted" font-size="10">từ đầu tới cuối</text>
  <text x="330" y="120" text-anchor="middle" class="fig-muted" font-size="9">ranh giới, không phải danh sách task</text>
  <text x="544" y="62"  text-anchor="middle" class="fig-label" font-size="12">3 · Bài toán khó nhất</text>
  <text x="544" y="84"  text-anchor="middle" class="fig-muted" font-size="10">một cái thôi, cụ thể</text>
  <text x="544" y="102" text-anchor="middle" class="fig-muted" font-size="10">vì sao nó khó</text>
  <text x="544" y="120" text-anchor="middle" class="fig-muted" font-size="9">kỹ thuật, có số đo</text>
  <text x="116" y="164" text-anchor="middle" class="fig-label" font-size="12">4 · Tôi đã làm gì</text>
  <text x="116" y="186" text-anchor="middle" class="fig-muted" font-size="10">phương án đã cân nhắc</text>
  <text x="116" y="204" text-anchor="middle" class="fig-muted" font-size="10">vì sao chọn cái này</text>
  <text x="116" y="222" text-anchor="middle" class="fig-muted" font-size="9">đánh đổi, không phải chiến thắng</text>
  <text x="330" y="164" text-anchor="middle" class="fig-label" font-size="12">5 · Kết quả</text>
  <text x="330" y="186" text-anchor="middle" class="fig-muted" font-size="10">số trước và sau</text>
  <text x="330" y="204" text-anchor="middle" class="fig-muted" font-size="10">hoặc nói thẳng là không đo được</text>
  <text x="330" y="222" text-anchor="middle" class="fig-muted" font-size="9">không bịa số</text>
  <text x="544" y="164" text-anchor="middle" class="fig-label" font-size="12">6 · Bài học</text>
  <text x="544" y="186" text-anchor="middle" class="fig-muted" font-size="10">làm lại thì đổi gì</text>
  <text x="544" y="204" text-anchor="middle" class="fig-muted" font-size="10">và vì sao</text>
  <text x="544" y="222" text-anchor="middle" class="fig-muted" font-size="9">cụ thể, không triết lý</text>
</svg>
<figcaption>Ô 2 và ô 6 là hai ô người ta nhớ nhất. Ô 2 cho biết bạn từng sở hữu cái gì; ô 6 cho biết bạn có học được từ việc mình làm hay không.</figcaption>
</figure>

Hai lỗi phổ biến trong sáu ô này:

- **Ô 2 biến thành danh sách task.** "Tôi làm UI shop, làm hệ thống nhiệm vụ, sửa bug hiệu năng" — nghe như ai cũng làm được. Thay bằng ranh giới: *"tôi sở hữu toàn bộ đường đi của một giao dịch, từ nút bấm trong Unity tới transaction trong Postgres."*
- **Ô 5 bịa số.** Câu hỏi tiếp theo sẽ là "đo bằng cách nào" và mọi thứ sụp. Không đo được thì nói không đo được — và nói luôn *vì sao* không đo được, đó cũng là một câu trả lời có giá trị.

## Ba câu chuyện phải có sẵn

Chuẩn bị đúng ba, luyện tới mức kể không cần nghĩ. Gần như mọi câu hỏi hành vi đều ánh xạ về một trong ba:

| Câu chuyện | Trả lời được những câu nào | Tiêu chí chọn |
|---|---|---|
| **Hệ thống tôi dựng** | "Kể về dự án", "đóng góp lớn nhất", "kiến trúc anh thiết kế" | Chọn cái bạn sở hữu **từ đầu tới cuối**, không phải cái to nhất |
| **Sự cố tôi gỡ** | "Bug khó nhất", "sự cố production", "áp lực" | Chọn cái có **dòng thời gian** và **cách ngăn tái diễn** |
| **Lần tôi sai** | "Thất bại", "bất đồng với đồng nghiệp", "quyết định hối tiếc" | Chọn cái bạn đã **thật sự sửa**, không phải cái đổ cho hoàn cảnh |

Câu chuyện thứ ba là câu chuyện người ta chuẩn bị kém nhất và hỏi thường xuyên nhất. Đừng dùng chiêu "điểm yếu của tôi là quá cầu toàn" — người phỏng vấn nghe câu đó vài trăm lần rồi, và nó báo hiệu bạn không định nói thật.

## Nói về khó khăn: bốn loại, ba loại nên tránh

| Loại khó khăn | Nên kể? | Vì sao |
|---|---|---|
| **Kỹ thuật, có số đo** | **Có** | Kiểm chứng được, dẫn tới câu hỏi sâu mà bạn trả lời được |
| Thiếu thời gian, thiếu người | Dè dặt | Ai cũng có; chỉ kể nếu bạn đã **làm gì đó** với nó |
| Đồng nghiệp khó tính, sếp tệ | Tránh | Người nghe không kiểm chứng được và sẽ tự hỏi bạn kể gì về họ sau này |
| "Không có khó khăn gì" | Tránh tuyệt đối | Nghĩa là dự án quá dễ, hoặc bạn không ở gần chỗ khó |

Mẫu một câu chuyện khó khăn tốt, đúng chủ đề nhánh này:

> *"Chúng tôi nhận báo cáo mất vật phẩm nhưng log không có lỗi nào. Mất ba ngày mới lần ra: client tự thử lại khi timeout, trong khi server đã ghi xong nhưng phản hồi chưa về. Trừ tiền hai lần, không bên nào thấy sai. Tôi thêm idempotency key do client sinh, ghi trong cùng transaction với việc trừ tiền. Sau đó tôi rà toàn bộ endpoint theo cùng tiêu chí và tìm thêm hai chỗ nữa cùng lỗi."*

Câu chuyện này mạnh vì bốn lý do: có **triệu chứng cụ thể**, có **quá trình lần ra**, có **giải pháp đúng tầng**, và có **bước rà soát mở rộng** — chi tiết cuối cho thấy bạn không chỉ vá chỗ báo lỗi.

## Khi dự án bị huỷ, hoặc chưa từng phát hành

Rất nhiều dự án game chết trước khi ra mắt. Đây không phải điểm trừ, trừ khi bạn kể sai.

**Đừng** giấu, đừng nói tránh. Nói thẳng ở ô 1, rồi chuyển trọng tâm sang thứ vẫn còn giá trị:

> *"Dự án bị dừng ở tháng thứ bảy khi công ty đổi hướng — chúng tôi đã xong vertical slice và bản alpha, chưa phát hành. Thứ tôi mang đi được là hệ thống kinh tế phía server: nó chạy thật, có đối soát, và tôi vẫn dùng lại cách thiết kế idempotency đó ở dự án sau."*

Ba điều làm câu trả lời này ổn: **trung thực về kết cục**, **cụ thể về thứ đã hoàn thành**, và **chuyển được kinh nghiệm sang chỗ khác**. Người phỏng vấn trong ngành game biết tỉ lệ dự án chết; họ đánh giá cách bạn nói về nó.

Tương tự với dự án cá nhân hoặc dự án học tập: đừng thổi lên thành sản phẩm thương mại, cũng đừng hạ thấp. Nói đúng quy mô rồi kể phần kỹ thuật thật.

## Khi bạn không phải người quyết định

Junior và mid thường vào dự án đã có sẵn kiến trúc. Hai cách kể đều tốt hơn việc giả vờ mình chốt mọi thứ:

- **Kể cái bạn phát hiện và thuyết phục.** *"Ranh giới có sẵn đặt bảng giá ở client; tôi chỉ ra là mỗi lần chỉnh giá phải chờ duyệt store, đưa ra con số ba ngày mỗi lần, và chúng tôi chuyển sang server."*
- **Kể cái bạn thêm vào quy trình.** Mock server, bước rà tương thích trong CI, danh sách kiểm tra trước mốc — đều là đóng góp đếm được và không cần chức danh.

Nói rõ ranh giới quyền hạn của mình là **điểm cộng**, không phải điểm trừ. Người phóng đại vai trò thường lộ ngay ở câu hỏi thứ hai.

## Ba câu bạn nên hỏi lại

Cuối buổi, câu hỏi của bạn cũng là một phần bài kiểm tra. Ba câu đúng chủ đề nhánh này, và câu trả lời sẽ cho bạn biết nhiều về nơi sắp vào:

1. *"Ranh giới client–server ở dự án hiện tại được chốt khi nào, và có phải sửa lại lần nào không?"*
2. *"Từ lúc designer đổi một con số cân bằng tới lúc người chơi thấy, mất bao lâu?"*
3. *"Lần sự cố production gần nhất là chuyện gì, và sau đó đội đổi gì?"*

Câu 2 là câu lộ nhiều nhất về sức khoẻ kỹ thuật của đội. Trả lời "vài phút" nghĩa là họ có pipeline master data tử tế ([[master-data]]). Trả lời "phải build lại app" nghĩa là bạn sắp sống trong một dự án chỉnh số rất đau.

## Bẫy thường gặp

- **Kể theo thứ tự thời gian của dự án** thay vì theo sáu ô. Người nghe lạc ở phút thứ hai.
- **Dùng "chúng tôi" cho mọi thứ.** Không ai biết bạn làm gì. Dùng "tôi" cho phần của mình, "chúng tôi" cho phần của đội — và phân biệt rõ.
- **Bịa số.** Sụp ở câu hỏi kế tiếp.
- **Kể ba dự án cùng lúc.** Một dự án kể sâu hơn ba dự án kể lướt.
- **Chê đồng nghiệp hoặc công ty cũ.** Ngắn hạn nghe có vẻ thành thật, dài hạn là cờ đỏ.
- **Không chuẩn bị câu chuyện thất bại.** Bị hỏi bất ngờ thì hoặc bịa, hoặc kể một thất bại thật mà chưa kịp sắp xếp.

## 🤖 Prompt cho AI

**Dùng AI thế nào để luyện kể dự án**

AI là **người phỏng vấn giả lập không biết mệt**. Nó không đánh giá bạn, nên bạn nói vụng cũng không sao — đó chính là điều kiện để luyện.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Đào sâu | Sau khi viết xong sáu ô | "Đọc phần kể này, hỏi tôi 10 câu đào sâu như một senior khó tính" |
| Bắt lỗ hổng | Trước buổi phỏng vấn thật | "Chỗ nào trong câu trả lời của tôi nghe như đang phóng đại hoặc né tránh?" |
| Nén câu trả lời | Khi kể quá dài | "Rút xuống 90 giây, giữ số liệu và đánh đổi, bỏ chi tiết triển khai" |

Cách dùng hiệu quả nhất: **nói ra miệng, ghi âm, rồi đưa bản gỡ băng cho AI**. Văn viết của bạn luôn mạch lạc hơn lời nói; luyện văn viết không giúp gì cho phòng phỏng vấn.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Vị trí đang ứng tuyển** — client, server, hay full-stack game; câu hỏi khác hẳn nhau.
- **Cấp bậc** — junior thì hỏi định nghĩa, senior thì hỏi đánh đổi và quyết định.
- **Sự thật về dự án**, kể cả phần xấu. AI tô hồng giúp bạn thì buổi phỏng vấn thật sẽ bóc ra.
- **Bạn được phép nói gì** — có ràng buộc bảo mật thì nói trước để nó không gợi ý tiết lộ.

**Mẫu prompt**

```
Tôi ứng tuyển vị trí <server engineer / Unity client / full-stack> cấp <mid/senior> ở studio game.
Đây là phần kể dự án của tôi, gỡ từ bản ghi âm nên lời nói còn lộn xộn: <dán>.

Việc 1: đóng vai người phỏng vấn khó tính. Hỏi tôi 10 câu đào sâu, xếp từ dễ tới khó,
tập trung vào chỗ tôi nói mơ hồ hoặc có vẻ phóng đại.
Việc 2: chỉ ra những chỗ người nghe SẼ không dựng lại được hệ thống từ lời kể của tôi.
Việc 3: liệt kê con số nào tôi nên chuẩn bị sẵn mà chưa nhắc tới.

Ràng buộc:
- KHÔNG viết lại câu trả lời hộ tôi ở lượt này.
- KHÔNG khen. Chỉ nêu chỗ yếu.
- Nếu chỗ nào nghe như bịa, nói thẳng là nghe như bịa.
```

**Bẫy thường gặp:** AI viết hộ bạn một đoạn kể trau chuốt, bạn học thuộc, và trong phòng phỏng vấn nó nghe như đọc thuộc lòng — người phỏng vấn nhận ra ngay và sẽ đào cho tới lúc bạn rời khỏi kịch bản. Dùng AI để **hỏi**, không phải để **viết hộ**. Bẫy thứ hai: nó luôn khen, nên phải ép bằng câu "chỉ nêu chỗ yếu, không khen".

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Kể về một dự án anh đã làm.**
  → Theo sáu ô, hai phút: bối cảnh có số (thể loại, nền tảng, đội mấy người, bao lâu); vai trò của tôi nói bằng **ranh giới** chứ không phải danh sách task; bài toán khó nhất, đúng một cái; tôi đã làm gì và cân nhắc phương án nào; kết quả đo được; và làm lại thì đổi gì. Kể sâu một dự án hơn kể lướt ba dự án.
- `Junior` **Anh phụ trách phần nào trong đó?**
  → Trả lời bằng một ranh giới sở hữu: "tôi sở hữu đường đi của một giao dịch, từ nút bấm trong Unity tới transaction trong Postgres". Câu đó cho người nghe biết ngay nên đào tiếp ở đâu. "Tôi làm UI shop, làm nhiệm vụ, sửa vài bug hiệu năng" thì nghe như ai cũng làm được và không mở ra câu hỏi nào.
- `Mid` **Khó khăn lớn nhất của dự án đó là gì, anh xử lý thế nào?**
  → Chọn khó khăn **kỹ thuật có số đo**, đừng chọn khó khăn nhân sự — người nghe không kiểm chứng được và sẽ tự hỏi sau này bạn kể gì về họ. Một câu chuyện đạt cần bốn thứ: triệu chứng cụ thể, quá trình lần ra nguyên nhân, giải pháp đúng tầng, và bước rà soát mở rộng để thấy bạn không chỉ vá chỗ báo lỗi.
- `Mid` **Có quyết định kỹ thuật nào anh thấy hối tiếc không?**
  → Nên có một ví dụ thật mà bạn **đã sửa**, không phải cái đổ cho hoàn cảnh. Đừng dùng "điểm yếu của tôi là quá cầu toàn" — người phỏng vấn nghe câu đó vài trăm lần rồi và nó báo hiệu bạn không định nói thật. Một quyết định sai kèm cách bạn phát hiện và sửa nó mạnh hơn nhiều so với một hồ sơ không tì vết.
- `Senior` **Nếu làm lại dự án đó từ đầu, anh đổi gì?**
  → Nêu một hoặc hai thay đổi **cụ thể ở quy trình**, kèm lý do lấy từ chính cái giá đã trả: đưa luật idempotency vào hợp đồng từ đầu thay vì thêm sau khi có người mất đồ; thêm bước rà tương thích ngược vào CI trước lần vỡ đầu tiên chứ không phải sau. Tránh câu trả lời triết lý kiểu "giao tiếp tốt hơn".
- `Senior` **Kể một lần anh bất đồng với đồng nghiệp về kỹ thuật.**
  → Kể thành một quyết định, đừng kể thành một cuộc cãi vã hay một sự im lặng. Cấu trúc tốt: hai phương án là gì, tiêu chí nào để chọn, ai là người quyết, và bạn đã ủng hộ quyết định cuối cùng ra sao kể cả khi nó không phải phương án của mình. Kết thúc bằng điều bạn học được từ phương án kia.

**Khung trả lời 60 giây** — "Kể về một dự án anh đã làm"

> Game <thể loại>, mobile, đội bốn người, mười tháng, client Unity và server Go riêng. Tôi phụ trách **chỗ nối giữa hai phía**: lớp network trong Unity, hợp đồng `.proto`, và toàn bộ luồng kinh tế phía server.
>
> Bài toán khó nhất là **giao dịch trên mạng di động không ổn định**. Chúng tôi nhận báo cáo mất vật phẩm mà log không có lỗi — hoá ra client tự thử lại khi timeout trong lúc server đã ghi xong nhưng phản hồi chưa kịp về. Tôi thêm idempotency key do client sinh và ghi trong cùng transaction với việc trừ tiền, rồi rà toàn bộ endpoint theo cùng tiêu chí, tìm thêm hai chỗ nữa cùng lỗi.
>
> Sau đó báo cáo mất đồ về gần như bằng không. Làm lại thì tôi đưa luật "mọi lệnh đổi ví phải có idempotency key" vào hợp đồng **ngay từ đầu**, thay vì thêm sau khi đã có người mất đồ.

**Họ sẽ đào tiếp**

- *"Idempotency key sinh ở đâu, sống bao lâu?"* → Client sinh cho mỗi **hành động**, không phải mỗi lần gửi, và giữ qua lần khởi động lại app vì người chơi hay tắt app khi thấy treo. Server lưu cùng transaction; dọn sau vài ngày khi không còn khả năng retry.
- *"Anh phát hiện bằng cách nào?"* → Không phải từ log lỗi, vì không có lỗi nào. Từ việc đối chiếu số lượng giao dịch với số lượng vật phẩm phát ra — chúng lệch. Bài học là log đường thành công cũng quan trọng như log lỗi.
- *"Có cách nào khác không?"* → Có: khoá phía UI để không bấm lại được. Nhưng đó chỉ chặn một nguồn retry, còn retry tự động của lớp network và retry do người chơi mở lại app thì không chặn được. Phải giải ở tầng server mới kín.
- *"Nếu làm lại thì đổi gì?"* → Đưa luật idempotency vào hợp đồng từ đầu, và thêm bước rà tương thích vào CI. Cả hai đều là thứ tôi thêm sau khi đã trả giá.
- *"Anh bất đồng với đồng nghiệp bao giờ chưa?"* → Nên có một ví dụ thật, kết thúc bằng một quyết định chứ không phải bằng sự im lặng. Cách kể tốt: nêu hai phương án, nêu tiêu chí chọn, nói rõ ai quyết và bạn đã ủng hộ quyết định đó ra sao kể cả khi không phải phương án của mình.

**Cờ đỏ**

- Kể dự án mà không nêu được một con số nào.
- "Tôi làm mọi thứ" hoặc "chúng tôi làm mọi thứ" — không xác định được ranh giới.
- Không có câu chuyện thất bại nào, hoặc thất bại được kể thành lỗi của người khác.
- Bịa số liệu rồi không giải thích được cách đo.
- Chê công ty cũ, chê đồng nghiệp cũ.
- Kể lướt ba dự án thay vì kể sâu một dự án.

**Số / ví dụ nên thuộc**

- Sáu ô, hai phút, mỗi ô khoảng **20 giây**.
- Ba câu chuyện chuẩn bị sẵn: hệ thống tôi dựng · sự cố tôi gỡ · lần tôi sai.
- Quy mô dự án của bạn: mấy người, mấy tháng, bao nhiêu người chơi, CCU đỉnh.
- Một con số trước–sau của việc bạn làm, hoặc một câu giải thích vì sao không đo được.

**Kể trong dự án**

- *"Anh đã làm gì trong dự án?"* → Trả lời bằng **một ranh giới**, không bằng danh sách: "tôi sở hữu đường đi của một giao dịch từ nút bấm tới transaction." Rồi mới kể chi tiết khi được hỏi tiếp.
- *"Khó khăn gặp phải?"* → Chọn khó khăn **kỹ thuật, có triệu chứng cụ thể, có cách ngăn tái diễn**. Ba yếu tố đó biến một lời than thành một câu chuyện.
- *"Đóng góp nào anh tự hào nhất?"* → Chọn thứ **còn tồn tại sau khi bạn rời đi**: một luật trong hợp đồng, một bước trong CI, một công cụ đội vẫn dùng. Tính năng rồi sẽ bị thay; quy trình thì ở lại.
- *"Vì sao anh rời dự án đó?"* → Trả lời ngắn, trung tính, hướng về phía trước. Không kể chi tiết mâu thuẫn nội bộ, kể cả khi bạn đúng.
