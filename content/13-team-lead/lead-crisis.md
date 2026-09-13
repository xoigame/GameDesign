---
id: lead-crisis
title: Trượt tiến độ, crunch và sự cố
summary: Năm đòn bẩy khi mốc sắp trượt và thứ tự phải thử chúng, vì sao thêm người làm dự án trễ thêm, cái giá đo được của crunch, và vai thật của lead trong 15 phút đầu một sự cố production.
status: deep
read: 1060
level: advanced
order: 60
tags: [team, leadership, incident, milestone, operations]
related: [team-lead, lead-estimation, lead-upward, project-launch]
---

Mọi lead rồi sẽ tới một buổi sáng nhìn bảng task và biết chắc mốc này không kịp. Thứ quyết định bạn là lead loại nào không phải việc đó có xảy ra không — mà là **bạn có bao nhiêu lựa chọn lúc nó xảy ra**, và số lựa chọn đó được quyết từ ba tuần trước.

## Năm đòn bẩy, và thứ tự phải thử

| # | Đòn bẩy | Dùng được khi | Chi phí thật |
|---|---|---|---|
| 1 | **Cắt phạm vi** | Luôn luôn — thử đầu tiên | Mất tính năng, giữ được mọi thứ khác |
| 2 | **Hạ chất lượng có kiểm soát** | Phần không đụng tiền và dữ liệu | Nợ kỹ thuật, phải ghi vào danh sách và đặt lịch trả |
| 3 | **Lùi ngày** | Ngày mềm, hoặc lùi sớm đủ để bên ngoài kịp đổi lịch | Lòng tin, lịch marketing — lùi một lần thì được |
| 4 | **Thêm người** | Gần như không bao giờ giữa mốc | Chậm thêm 2–4 tuần trước khi nhanh lên |
| 5 | **Crunch** | Đợt cuối, một lần, có ngày kết thúc | Năng suất âm sau tuần thứ hai, và người nghỉ việc sau khi ship |

Thứ tự này ở nhiều đội đang ngược: crunch là phản xạ đầu tiên vì nó không cần xin phép ai. Đó chính là lý do những đội đó crunch mỗi mốc.

**Cắt phạm vi phải cắt theo lát dọc.** Bỏ hẳn một tính năng, không phải làm tất cả tính năng ở mức sơ sài. Mười thứ nửa vời cho một sản phẩm không ai muốn chơi; bảy thứ hoàn chỉnh thì có. Xem [[design-pillars]] để biết thứ nào không được phép cắt — cắt vào pillar thì phần còn lại mất lý do tồn tại.

Ba thứ **không bao giờ** nằm trong danh sách cắt, kể cả ở đợt cuối: thứ động tới **tiền và vật phẩm** của người chơi, **tương thích ngược** của save và message, và **khả năng khôi phục dữ liệu**. Cắt vào đây không phải tiết kiệm thời gian, mà là vay một khoản không trả nổi.

## Vì sao thêm người làm dự án trễ thêm

Người mới cần 2–4 tuần mới đóng góp dương trong một codebase game thật — và trong lúc đó họ tiêu thời gian của người đang chạy nhanh nhất, tức là đúng người bạn cần nhất.

Cộng thêm chi phí giao tiếp: số cặp phải đồng bộ tăng theo bình phương. Đội 5 người có 10 cặp; đội 8 người có 28 cặp.

Có ba trường hợp thêm người vẫn đúng, và cả ba đều **không phải** thêm vào đường găng:

- Người làm **việc tách rời hoàn toàn**: dựng công cụ, sửa build, làm QA thủ công.
- Người **đã từng làm trong chính codebase này** và chỉ cần nửa ngày để quay lại.
- Thêm cho **mốc sau**, chấp nhận mốc này chậm thêm — quyết định đúng nếu dự án còn dài.

## Crunch: cái giá đo được

<figure class="fig">
<svg viewBox="0 0 660 280" role="img" aria-label="Đồ thị theo tuần crunch: sản lượng hữu ích tăng ở tuần đầu rồi tụt xuống dưới mức bình thường từ tuần thứ ba, trong khi số lỗi mới sinh ra tăng đều">
  <defs>
    <marker id="lcri-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <line x1="70" y1="240" x2="640" y2="240" stroke="#6ea8fe" stroke-width="1.5" marker-end="url(#lcri-a)"/>
  <line x1="70" y1="240" x2="70" y2="30" stroke="#6ea8fe" stroke-width="1.5" marker-end="url(#lcri-a)"/>
  <line x1="70" y1="150" x2="626" y2="150" stroke="#6ea8fe" stroke-width="1.2" stroke-dasharray="5 5"/>
  <text x="80" y="144" class="fig-muted" font-size="10">mức bình thường</text>
  <polyline points="70,150 160,118 250,146 340,176 430,197 520,209 610,215" fill="none" stroke="#51cf9b" stroke-width="2.5"/>
  <polyline points="70,206 160,199 250,188 340,168 430,144 520,118 610,96" fill="none" stroke="#ff8787" stroke-width="2.5"/>
  <text x="614" y="230" text-anchor="end" class="fig-label" font-size="12">sản lượng hữu ích</text>
  <text x="614" y="88"  text-anchor="end" class="fig-label" font-size="12">lỗi mới sinh ra</text>
  <text x="170" y="108" class="fig-muted" font-size="10">tuần 1: thật sự nhanh hơn</text>
  <text x="272" y="126" class="fig-muted" font-size="10">tuần 2: hoà</text>
  <text x="356" y="196" class="fig-muted" font-size="10">từ tuần 3: làm nhiều hơn, xong ít hơn</text>
  <text x="160" y="262" text-anchor="middle" class="fig-muted" font-size="10">tuần 1</text>
  <text x="340" y="262" text-anchor="middle" class="fig-muted" font-size="10">tuần 3</text>
  <text x="520" y="262" text-anchor="middle" class="fig-muted" font-size="10">tuần 5</text>
  <text x="26" y="130" text-anchor="middle" class="fig-muted" font-size="11" transform="rotate(-90 26 130)">mỗi tuần</text>
</svg>
<figcaption>Crunch mua được khoảng một tuần công việc thật. Từ tuần thứ ba, đội làm nhiều giờ hơn và hoàn thành ít hơn — phần chênh biến thành lỗi mà ai đó sẽ phải sửa sau.</figcaption>
</figure>

Nói cách khác: crunch là **vay**, không phải làm thêm. Lãi trả bằng ba thứ — lỗi phải sửa sau, tốc độ tụt vài tuần sau khi ngừng, và người nghỉ việc ngay sau khi ship (chi phí cao nhất và luôn tới muộn nên luôn bị tính thiếu).

Nếu buộc phải crunch, năm điều kiện — thiếu cái nào thì bạn đang đốt đội chứ không phải cứu mốc:

1. **Có ngày kết thúc cụ thể**, nói ra từ đầu. "Tới hết ngày 28" chứ không phải "tới khi xong".
2. **Một đợt, không phải ba đợt liền.** Đợt thứ hai cách đợt đầu dưới hai tháng thì đội chưa hồi.
3. **Tự nguyện thật.** Lead ngồi lại tới nửa đêm là một mệnh lệnh ngầm, dù bạn không nói gì. Nếu bạn ở lại, hãy nói rõ ai được về và về lúc nào.
4. **Trả lại ngay sau khi xong** — nghỉ bù, và một đợt không có mốc nào để dọn nợ.
5. **Một postmortem về chính đợt crunch**: vì sao tới mức phải crunch, và đổi gì để lần sau không lặp lại. Không có bước này thì crunch thành quy trình mặc định.

Và một việc thuộc về bạn, không uỷ quyền được: **crunch là thất bại của kế hoạch, không phải thành tích của đội.** Nói câu đó ra trước đội. Nếu bạn để nó trôi qua như một chiến công, bạn vừa đảm bảo mốc sau cũng sẽ như thế.

## Mười lăm phút đầu của một sự cố

Server sập lúc 9 giờ tối, hoặc bản build mới trên store làm mất tiến trình người chơi. Phản xạ đầu tiên của một lead xuất thân lập trình viên là mở máy sửa. **Đó là phản xạ sai** — không phải vì bạn sửa kém, mà vì lúc đó chỗ trống nguy hiểm nhất là chỗ điều phối.

Ba vai, phải tách ra, kể cả với đội ba người:

| Vai | Làm gì | Không làm gì |
|---|---|---|
| **Người sửa** | Chỉ sửa. Một người, tối đa hai | Không trả lời chat, không cập nhật tình hình |
| **Người điều phối** (bạn) | Quyết định, ghi dòng thời gian, gọi thêm người khi cần | Không tự chui vào debug |
| **Người nói ra ngoài** | Cập nhật cho sếp, CSKH, người chơi theo nhịp cố định | Không suy đoán nguyên nhân khi chưa chắc |

Thứ tự việc trong 15 phút đầu:

1. **Chặn máu trước khi tìm nguyên nhân.** Rollback, tắt tính năng bằng cờ, chặn đăng nhập nếu đang mất dữ liệu. Hiểu vì sao là việc của ngày mai — xem [[go-deploy-ops]] và [[project-launch]].
2. **Xác định phạm vi**: bao nhiêu người chơi, có mất tiền hay vật phẩm không. Câu hỏi này quyết định mọi thứ còn lại.
3. **Ghi dòng thời gian ngay từ phút đầu.** Không ai nhớ nổi sau bốn tiếng, mà postmortem thì cần nó.
4. **Cập nhật theo nhịp cố định**, ví dụ 30 phút một lần, kể cả khi chưa có gì mới. Im lặng khiến người khác gọi liên tục vào đúng người đang sửa.
5. **Nếu có mất tiền hoặc vật phẩm**: khoá lại đường gây thiệt hại, ghi lại đủ dữ liệu để đền bù sau. Đền bù sai còn đắt hơn sự cố gốc.

Việc của bạn trong đêm đó còn một điều nữa, dễ quên: **cho người sửa được dừng.** Sau bốn tiếng thì người đang sửa là người ra quyết định tệ nhất trong phòng. Đổi ca, hoặc chấp nhận để nguyên tình trạng đã chặn máu tới sáng.

## Postmortem: sự thật, không phải lỗi của ai

Một quy tắc duy nhất làm nên khác biệt: **postmortem không có tên người trong phần nguyên nhân.** Không phải để nhẹ nhàng với nhau — mà vì đội nào đi tìm người có lỗi thì lần sau sẽ có người giấu sự cố, và sự cố bị giấu luôn đắt hơn.

"Nam đẩy nhầm cấu hình lên production" không phải nguyên nhân. Nguyên nhân là **hệ thống cho phép một người đẩy cấu hình lên production mà không ai duyệt và không có bước khôi phục nhanh.**

Ba câu hỏi đủ cho một postmortem một tiếng:

1. Dòng thời gian: chuyện gì xảy ra, lúc mấy giờ, ai biết lúc nào.
2. Vì sao mất ngần ấy thời gian để **phát hiện**, và ngần ấy để **khôi phục**? Hai con số này thường lộ ra nhiều hơn cả nguyên nhân gốc.
3. Hai hành động cụ thể, mỗi hành động **có tên người và có hạn**. Hai thôi — danh sách mười hai hành động thì không cái nào được làm.

Cách viết một postmortem đầy đủ, kể cả để kể lại trong phỏng vấn, ở [[project-postmortem]].

## Bẫy thường gặp

- **Crunch làm đòn bẩy đầu tiên** vì nó không cần xin phép ai.
- **Cắt theo lát ngang**: giữ đủ mười tính năng ở mức sơ sài thay vì bỏ hẳn ba cái.
- **Thêm người vào đường găng ở tuần cuối** — chắc chắn chậm hơn.
- **Lead chui vào debug** trong sự cố, không còn ai điều phối, và sau hai tiếng không ai biết tình hình ra sao.
- **Im lặng trong lúc sự cố.** Mỗi phút im lặng là một cuộc gọi vào đúng người đang sửa.
- **Postmortem chỉ tên người.** Lần sau sự cố sẽ được giấu, và bạn mất luôn dữ liệu để cải thiện.

## 🤖 Prompt cho AI

**Dùng AI thế nào khi đang khủng hoảng**

Chia theo thời điểm, vì cùng một công cụ giúp được ở lúc này và gây hại ở lúc khác:

| Lúc | Giao được cho AI | Tuyệt đối không |
|---|---|---|
| **Trước** (thấy dấu hiệu trượt) | Dựng các kịch bản cắt phạm vi, mỗi kịch bản kèm cái mất đi | Quyết cắt gì |
| **Trong 15 phút đầu** | Đọc log, gom lỗi theo tần suất, dựng dòng thời gian từ log và commit | Đề xuất sửa thẳng lên production khi chưa ai đọc lại |
| **Trong, sau khi chặn máu** | Sinh giả thuyết nguyên nhân kèm cách kiểm chứng từng cái | Kết luận nguyên nhân |
| **Sau** | Dựng dòng thời gian đầy đủ từ log, PR, tin nhắn; soạn bản nháp postmortem | Viết phần bài học — đó là việc của cả đội |

Điểm mạnh thật sự của AI trong sự cố là **đọc nhiều log nhanh và không hoảng**. Điểm yếu là nó sẽ đưa ra một nguyên nhân nghe rất hợp lý cho bất kỳ tập log nào bạn đưa, kể cả khi nguyên nhân thật không nằm trong đó — nên mọi giả thuyết phải kèm cách kiểm chứng, và không có gì lên production khi chưa có người đọc lại.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Đã chặn máu chưa** — chưa chặn thì mọi câu trả lời phải hướng về chặn, không về nguyên nhân.
- **Phạm vi ảnh hưởng**: bao nhiêu người chơi, có mất tiền hoặc vật phẩm không.
- **Thay đổi gần nhất lên production** và lúc nào — nguyên nhân nằm ở đó trong phần lớn trường hợp.
- **Khôi phục được tới mốc nào**: có backup lúc nào, rollback được không.
- Với việc cắt phạm vi: **pillar của game** và ba thứ không được cắt (tiền, tương thích, khả năng khôi phục).

**Mẫu prompt**

```
Tình huống: sự cố production đang diễn ra. Đã chặn máu: <rồi/chưa — bằng cách nào>.
Ảnh hưởng: <N> người chơi, có mất tiền/vật phẩm: <có/không>.
Thay đổi gần nhất lên production: <mô tả> lúc <hh:mm>.
Khôi phục: backup gần nhất <hh:mm>, rollback <được/không>.

Việc, theo đúng thứ tự:
1. Nếu CHƯA chặn máu: liệt kê cách chặn nhanh nhất, xếp theo rủi ro gây thêm thiệt hại.
2. Từ log dưới đây, gom lỗi theo tần suất và theo thời điểm bắt đầu xuất hiện.
3. Nêu tối đa 3 giả thuyết nguyên nhân. MỖI giả thuyết phải kèm một cách kiểm chứng
   thực hiện được trong 5 phút và KHÔNG cần đẩy code mới lên production.
4. Dựng dòng thời gian từ log: mốc nào lúc mấy giờ.

Ràng buộc:
- KHÔNG đề xuất sửa thẳng trên production.
- KHÔNG kết luận nguyên nhân. Chỉ giả thuyết kèm cách kiểm chứng.
- Nếu log không đủ để phân biệt các giả thuyết, nói thẳng cần thêm log gì.

<dán log>
```

**Bẫy thường gặp:** AI đưa ra một nguyên nhân duy nhất, nghe rất thuyết phục, dựa trên dòng log ồn ào nhất — trong khi dòng ồn ào nhất thường là **hậu quả**, không phải nguyên nhân. Bẫy thứ hai, nguy hiểm nhất trong đêm sự cố: nó đề xuất một bản vá "nhỏ thôi" để đẩy thẳng lên production, và lúc 2 giờ sáng thì không ai đủ tỉnh để review — sự cố thứ hai sinh ra từ chính bản vá của sự cố thứ nhất. Bẫy thứ ba: nhờ nó viết postmortem hoàn chỉnh, và nhận về một văn bản trơn tru có cả phần "bài học rút ra" mà không ai trong đội thật sự học được gì.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Mid` **Còn ba tuần tới mốc mà anh biết chắc không kịp. Anh làm gì?**
  → Tôi xét năm đòn bẩy theo thứ tự: cắt phạm vi, hạ chất lượng có kiểm soát ở phần không đụng tiền và dữ liệu, lùi ngày, thêm người, cuối cùng mới là crunch. Cắt phạm vi luôn là thứ thử đầu tiên vì nó là đòn bẩy duy nhất không vay của tương lai. Và tôi báo lên ngay hôm biết chắc, kèm hai ba lựa chọn có đánh đổi, chứ không cứu thử một tuần rồi mới báo.
- `Mid` **Sếp bảo thêm hai người vào cho kịp. Anh nói gì?**
  → Tôi nói người mới cần hai tới bốn tuần mới đóng góp dương trong codebase này, và trong lúc đó họ tiêu thời gian của chính người đang chạy nhanh nhất. Thêm vào đường găng ở tuần cuối là chắc chắn chậm hơn. Nhưng tôi không từ chối thẳng: tôi đề nghị hướng thêm người vào việc tách rời — QA thủ công, sửa build, dựng công cụ — hoặc thêm cho mốc sau và chấp nhận mốc này chậm.
- `Senior` **Đội anh vừa crunch xong một đợt. Anh làm gì tiếp?**
  → Trả lại ngay: nghỉ bù, và một đợt không có mốc nào để dọn nợ đã vay trong lúc chạy. Sau đó là postmortem về chính đợt crunch — vì sao tới mức phải crunch, và đổi gì để lần sau không lặp lại. Và tôi nói thẳng trước đội rằng crunch là thất bại của kế hoạch chứ không phải thành tích của đội; để nó trôi qua như một chiến công là cách chắc chắn nhất để mốc sau lặp lại y hệt.
- `Senior` **9 giờ tối server sập. Mười lăm phút đầu anh làm gì?**
  → Việc đầu tiên là không chui vào debug. Tôi tách ba vai kể cả khi đội chỉ có ba người: một người sửa và chỉ sửa, tôi điều phối và ghi dòng thời gian, một người cập nhật ra ngoài theo nhịp 30 phút. Thứ tự việc là chặn máu trước — rollback hoặc tắt tính năng bằng cờ — rồi mới xác định phạm vi: bao nhiêu người chơi, có mất tiền hay vật phẩm không, vì câu đó quyết định mọi thứ còn lại. Hiểu nguyên nhân là việc của ngày mai.
- `Senior` **Sự cố do một người trong đội đẩy nhầm cấu hình. Postmortem viết thế nào?**
  → Không có tên người trong phần nguyên nhân. Nguyên nhân là hệ thống cho phép một người đẩy cấu hình lên production mà không ai duyệt và không có đường khôi phục nhanh — người đẩy chỉ là người chạm vào cái nút mà lẽ ra phải có khoá. Không phải vì tôi muốn nhẹ nhàng, mà vì đội nào đi tìm người có lỗi thì lần sau sẽ có người giấu sự cố, và sự cố bị giấu luôn đắt hơn.

**Khung trả lời 60 giây** — "Mốc sắp trượt, anh xử lý theo thứ tự nào?"

> Tôi có **năm đòn bẩy** và một thứ tự cố định. Một: **cắt phạm vi** — luôn thử đầu tiên, vì nó là đòn bẩy duy nhất không vay của tương lai. Hai: hạ chất lượng **có kiểm soát**, chỉ ở phần không đụng tiền và dữ liệu, và phải ghi vào danh sách nợ kèm lịch trả. Ba: lùi ngày, nếu ngày mềm hoặc lùi đủ sớm để bên ngoài kịp đổi lịch. Bốn: thêm người — gần như không bao giờ giữa mốc, vì người mới cần hai tới bốn tuần mới đóng góp dương và trong lúc đó họ tiêu thời gian của người chạy nhanh nhất. Năm, cuối cùng, mới là crunch.
>
> Cắt phạm vi thì **cắt theo lát dọc**: bỏ hẳn tính năng, không phải làm tất cả ở mức sơ sài. Và ba thứ không bao giờ nằm trong danh sách cắt: tiền và vật phẩm của người chơi, tương thích ngược của save và message, khả năng khôi phục dữ liệu.
>
> Ở nhiều đội thứ tự này đang ngược — crunch là phản xạ đầu vì nó không phải xin phép ai. Đó đúng là lý do họ crunch mốc nào cũng có.

**Họ sẽ đào tiếp**

- *"Crunch tốn gì mà anh xếp nó cuối?"* → Nó mua được khoảng một tuần công việc thật. Tuần đầu đội nhanh hơn thật, tuần hai hoà, từ tuần ba là làm nhiều giờ hơn mà xong ít hơn, phần chênh biến thành lỗi ai đó phải sửa sau. Chi phí đắt nhất tới muộn nhất nên luôn bị tính thiếu: người nghỉ việc ngay sau khi ship.
- *"Có khi nào crunch là đúng không?"* → Có, một đợt cuối có ngày kết thúc nói ra từ đầu, tự nguyện thật, trả lại bằng nghỉ bù và một đợt dọn nợ, kèm postmortem về chính đợt crunch đó. Thiếu một trong năm điều kiện thì là đốt đội chứ không phải cứu mốc — và chi tiết dễ quên nhất là lead ngồi lại tới nửa đêm chính là một mệnh lệnh ngầm dù không nói gì.
- *"Vì sao thêm người lại chậm hơn?"* → Hai lý do cộng lại: người mới cần hai tới bốn tuần mới đóng góp dương và trong lúc đó họ hỏi đúng người đang bận nhất, cộng với chi phí đồng bộ tăng theo bình phương — năm người là mười cặp, tám người là hai mươi tám cặp.
- *"Trong sự cố, sao lead không sửa?"* → Vì chỗ trống nguy hiểm nhất lúc đó là chỗ điều phối, không phải chỗ gõ phím. Ai cũng sửa thì không ai quyết rollback, không ai ghi dòng thời gian, và không ai cập nhật ra ngoài — nên mọi người gọi liên tục vào đúng người đang sửa.
- *"Đo một sự cố bằng gì?"* → Hai con số: bao lâu để **phát hiện** và bao lâu để **khôi phục**. Chúng thường nói lên nhiều hơn cả nguyên nhân gốc, vì nguyên nhân thì mỗi lần một khác còn hai con số kia đo đúng cái hệ thống của bạn sẵn sàng tới đâu.

**Cờ đỏ**

- Coi crunch là công cụ bình thường, hoặc kể chuyện crunch bằng giọng tự hào.
- "Chúng tôi thêm người vào tuần cuối cho kịp."
- Cắt phạm vi theo lát ngang: mọi tính năng đều có, đều sơ sài.
- Lead chui vào debug trong sự cố và không còn ai điều phối.
- Postmortem chỉ đích danh người gây ra sự cố.
- Không phân biệt được thời gian phát hiện và thời gian khôi phục.

**Số / ví dụ nên thuộc**

- Năm đòn bẩy theo thứ tự: **cắt phạm vi · hạ chất lượng có kiểm soát · lùi ngày · thêm người · crunch**.
- Người mới cần **2–4 tuần** mới đóng góp dương; số cặp giao tiếp tăng theo bình phương (**5 người = 10 cặp, 8 người = 28 cặp**).
- Crunch: nhanh hơn ở **tuần 1**, hoà ở **tuần 2**, âm từ **tuần 3**.
- Sự cố: cập nhật ra ngoài mỗi **30 phút**; ba vai **sửa · điều phối · nói ra ngoài**.
- Postmortem: **2** hành động, mỗi hành động có tên người và hạn.

**Kể trong dự án**

- *"Dự án của anh có lần nào suýt vỡ không?"* → Kể một lần thật, nêu **thời điểm bạn biết**, đòn bẩy bạn chọn, và cái giá bạn trả. Người phỏng vấn quan tâm quá trình quyết định hơn là kết cục.
- *"Anh xử lý sự cố production thế nào?"* → Kể ba vai và thứ tự chặn máu trước khi tìm nguyên nhân, kèm hai con số phát hiện và khôi phục. Đó là dấu hiệu rõ nhất phân biệt người đã trực sự cố thật với người đọc lý thuyết.
- *"Đội anh có crunch không?"* → Đừng nói không có và cũng đừng kể như chiến công. Câu trả lời tốt: có một đợt, vì kế hoạch sai ở chỗ này, sau đó chúng tôi đổi cái này, và mốc sau không lặp lại.
