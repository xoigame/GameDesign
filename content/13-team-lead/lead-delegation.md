---
id: lead-delegation
title: Giao việc và review
summary: Năm mức uỷ quyền và cách chọn mức, brief giao việc đủ sáu dòng, luật review phân biệt cái chặn merge với cái chỉ là gợi ý, và cách review đổi thế nào khi code do AI sinh ra.
status: deep
read: 1030
level: intermediate
order: 30
tags: [team, leadership, review, process, code]
related: [team-lead, lead-transition, agent-guardrails, unity-testing-ci]
---

Hai câu nói giết chết nhiều đội nhất, và chúng là hai mặt của cùng một lỗi:

- *"Anh cứ làm đi, tuỳ anh."* — rồi ba ngày sau bạn bảo làm lại, vì hoá ra không tuỳ.
- *"Làm giúp tôi hàm này, nhận vào X trả về Y."* — người ta gõ hộ bạn, không ai học được gì, và bạn vẫn là người phải nghĩ.

Cả hai đều là **không nói rõ ai quyết cái gì**. Sửa được bằng một thứ rất cơ học: mỗi lần giao việc, nói thẳng mức uỷ quyền.

## Năm mức uỷ quyền

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Thang năm mức uỷ quyền từ lead quyết hoàn toàn tới người làm tự quyết, kèm khi nào dùng mức nào">
  <defs>
    <marker id="ldel-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="30" y="46"  width="140" height="38" rx="8" class="fig-box"/>
    <rect x="30" y="92"  width="200" height="38" rx="8" class="fig-box"/>
    <rect x="30" y="138" width="260" height="38" rx="8" class="fig-box"/>
    <rect x="30" y="184" width="320" height="38" rx="8" class="fig-box"/>
    <rect x="30" y="230" width="380" height="38" rx="8" class="fig-box"/>
  </g>
  <text x="40" y="70"  class="fig-label" font-size="12">1 · Làm theo tôi nói</text>
  <text x="40" y="116" class="fig-label" font-size="12">2 · Đề xuất, tôi duyệt</text>
  <text x="40" y="162" class="fig-label" font-size="12">3 · Làm, hỏi tôi trước khi merge</text>
  <text x="40" y="208" class="fig-label" font-size="12">4 · Làm rồi báo lại</text>
  <text x="40" y="254" class="fig-label" font-size="12">5 · Tự quyết, không cần báo</text>
  <text x="436" y="70"  class="fig-muted" font-size="10">người mới · việc động tới tiền</text>
  <text x="436" y="116" class="fig-muted" font-size="10">quyết định khó đảo ngược</text>
  <text x="436" y="162" class="fig-muted" font-size="10">mặc định cho hầu hết việc</text>
  <text x="436" y="208" class="fig-muted" font-size="10">mảng họ đã sở hữu</text>
  <text x="436" y="254" class="fig-muted" font-size="10">việc lặp lại, rủi ro thấp</text>
  <line x1="614" y1="46" x2="614" y2="262" stroke="#6ea8fe" stroke-width="2" marker-end="url(#ldel-a)"/>
  <text x="636" y="60"  class="fig-muted" font-size="10" transform="rotate(90 636 60)">lead quyết</text>
  <text x="636" y="196" class="fig-muted" font-size="10" transform="rotate(90 636 196)">họ quyết</text>
  <text x="40" y="30" class="fig-label" font-size="12">Mức uỷ quyền — nói ra, đừng để đoán</text>
  <text x="330" y="290" text-anchor="middle" class="fig-muted" font-size="10">mức gắn với CẶP (người, mảng việc) — cùng một người có thể ở mức 5 mảng này và mức 2 mảng khác</text>
</svg>
<figcaption>Sáu tháng không nâng được mức cho ai là lỗi của lead, không phải của họ.</figcaption>
</figure>

Chọn mức bằng hai trục, không bằng cảm tính: **rủi ro nếu sai** × **kinh nghiệm của người đó ở đúng mảng này**.

| Tình huống | Mức | Vì sao |
|---|---|---|
| Người mới, sửa logic trừ tiền trong ví | 1–2 | Sai là mất tiền thật của người chơi, không revert lại được bằng git |
| Người có kinh nghiệm, thêm loại item mới | 4 | Đã làm ba lần, rủi ro thấp, báo lại là đủ |
| Người giỏi, đổi cấu trúc thư mục toàn dự án | 2 | Không phải vì nghi ngờ họ, mà vì ảnh hưởng lan ra mọi người khác |
| Bất kỳ ai, đổi hợp đồng message đã lên store | 1–2 | Khó đảo ngược vĩnh viễn — xem [[project-contract]] |
| Người sở hữu mảng UI, chọn cách bố trí màn shop | 5 | Sở hữu nghĩa là có quyền quyết, nếu không thì chỉ là sở hữu trên giấy |

Hai luật đi kèm, thiếu cái nào cũng hỏng:

1. **Nói mức ra thành lời khi giao.** Không nói thì người ta đoán, và người cẩn thận sẽ đoán mức 2 — tức là chờ bạn, tức là bạn thành nút cổ chai.
2. **Đã giao mức 4 thì đừng hành xử như mức 2.** Giao xong rồi hỏi han từng bước là cách lịch sự để giật lại việc, và người ta đọc ra ngay.

## Brief giao việc: sáu dòng

Giao việc bằng miệng trong hành lang là cách sinh ra hiểu nhầm rẻ nhất. Sáu dòng này mất ba phút để viết và tiết kiệm vài ngày:

```
Kết quả: người chơi mua được item trong shop, tiền trừ đúng trong database.
Ràng buộc: giá lấy từ master data, không hardcode. Không đụng luồng ví hiện có.
Xong nghĩa là: chạy từ client tới database ở dev, Linh thử lại được.
Mức: 3 — làm xong hỏi tôi trước khi merge.
Hạn: thứ Năm. Trễ thì báo thứ Tư, đừng báo thứ Năm.
Vướng thì: hỏi tôi bất cứ lúc nào; quá 2 tiếng không tự gỡ được thì bắt buộc hỏi.
```

Dòng cuối quan trọng hơn vẻ ngoài của nó. Người mới thường ngồi một mình với một vướng mắc hai ngày vì sợ bị coi là kém. **Đặt ngưỡng thành luật** thì hỏi không còn là thừa nhận yếu kém nữa, mà là làm theo quy trình.

Dòng thứ nhất là dòng hay bị viết sai nhất: **giao kết quả, không giao thao tác.** "Viết hàm `BuyItem` gọi API `/shop/buy`" là giao thao tác — bạn đã nghĩ hộ phần khó, người kia chỉ gõ. "Người chơi mua được item và tiền trừ đúng" là giao kết quả — người ta phải tự nghĩ, và bạn nhận lại được cả những phương án bạn chưa nghĩ ra.

## Review: chia nhận xét thành bốn loại

Nguyên nhân số một khiến review trở thành chỗ khó chịu: **mọi nhận xét đều nghe như bắt buộc.** Người viết không biết cái nào phải sửa mới merge được, cái nào chỉ là ý kiến, nên hoặc sửa hết (chậm và ấm ức) hoặc bỏ qua hết (và bạn thấy bị phớt lờ).

Gắn nhãn, một chữ ở đầu mỗi nhận xét:

| Nhãn | Nghĩa | Ví dụ |
|---|---|---|
| **chặn** | Không sửa thì không merge | Trừ tiền ngoài transaction; API đổi mà không lên version |
| **nên** | Sửa trong PR này nếu không tốn nhiều | Thiếu test cho nhánh không đủ tiền |
| **gợi ý** | Tuỳ bạn, không cần trả lời | Tên biến, tách hàm cho dễ đọc |
| **hỏi** | Tôi chưa hiểu, giải thích giúp | "Chỗ này retry 3 lần, có lý do riêng không?" |

Danh sách "chặn" nên ngắn và cố định, dán ở chỗ ai cũng thấy. Với dự án client–server, năm thứ này đủ:

1. Thứ gì động tới **tiền hoặc vật phẩm** của người chơi mà không nằm trong transaction.
2. Thứ gì phá **tương thích ngược** của hợp đồng message hoặc của save.
3. Thứ gì làm mất hoặc ghi đè **dữ liệu người chơi** không khôi phục được.
4. Lỗ hổng cho phép client **tự khai kết quả** đáng lẽ server phải tính.
5. Code không có cách nào **kiểm chứng được** — không test, không mô tả cách thử tay.

Mọi thứ còn lại — cách đặt tên, chia file, tối ưu chưa đo — là "nên" hoặc "gợi ý". Tối ưu chưa đo thì luôn là gợi ý; xem [[performance]].

**Hai con số cho đội nhỏ:** PR trả lời trong **một ngày làm việc**, và không quá **400 dòng thay đổi**. PR to hơn thì review biến thành đọc lướt rồi bấm duyệt — tệ hơn không review, vì nó tạo cảm giác đã được kiểm tra.

## Ba thứ không được làm khi review

- **Tự sửa code trong PR của người khác rồi merge.** Nhanh hơn thật, và trả giá ba lần: họ không học được, họ không còn thấy đó là code của mình, và lần sau họ viết cẩu thả hơn. Cần sửa gấp thì ngồi cùng họ sửa — mất mười lăm phút và được cả hai thứ.
- **Review tính cách thay vì review code.** "Code cẩu thả quá" là nhận xét về người. "Chỗ này nếu API trả 500 thì người chơi mất item, cần xử lý" là nhận xét về code.
- **Để PR nằm im không lý do.** Chưa review được thì nói "mai tôi xem, đang bận mốc" — im lặng thì người ta tự diễn giải, và luôn diễn giải theo hướng xấu.

## Khi nào lead nên tự viết code

Không phải không bao giờ. Ba chỗ viết là đúng:

| Chỗ | Vì sao hợp lý |
|---|---|
| **Prototype thăm dò** cho một hướng chưa rõ | Nhanh, vứt đi được, và không ai phải chờ kết quả |
| **Việc ngoài đường găng**: công cụ, script build, dọn nợ | Chậm cũng không chặn ai |
| **Sự cố production** đang chảy máu | Lúc đó tốc độ quan trọng hơn việc kèm cặp — xem [[lead-crisis]] |

Và một chỗ tuyệt đối không: **việc mà chỉ mình bạn biết làm.** Đó chính là việc phải kèm người khác, kể cả khi đang gấp — vì mỗi lần bạn tự làm là một lần đội xác nhận nó phụ thuộc vào bạn.

## Review code do AI sinh ra

Đội nào cũng đang dùng AI sinh code, và nó đổi trọng tâm review chứ không bỏ review. Code AI viết **hiếm khi sai cú pháp, hay sai giả định** — đúng loại lỗi mà đọc lướt không thấy.

Ba thứ cần soi kỹ hơn trước đây:

- **Giả định bị bịa.** AI điền giá trị mặc định, tên trường, mã lỗi mà nó tưởng tượng ra. Đối chiếu với master data và hợp đồng thật, đừng tin tên trường trong code.
- **Đường lỗi.** AI viết đường thành công rất trơn và bỏ nhánh hỏng — mất mạng giữa chừng, server trả 500, người chơi bấm hai lần.
- **Code thừa nhưng vô hại.** Lớp trừu tượng không ai cần, cấu hình cho tình huống không tồn tại. Nó không gây lỗi hôm nay, nhưng người sau phải đọc mãi mãi.

Luật đội nên có, ngắn gọn: **người gửi PR chịu trách nhiệm cho mọi dòng trong đó, bất kể ai gõ.** "AI viết đoạn đó" không phải lời giải thích được chấp nhận trong review. Chi tiết ở [[agent-guardrails]] và [[ai-limits]].

## Bẫy thường gặp

- **Giao việc rồi hỏi han từng giờ.** Đó là mức 1 khoác áo mức 4.
- **Giao trách nhiệm mà không giao quyền.** "Anh phụ trách mảng UI" nhưng mọi thay đổi UI vẫn phải bạn duyệt — sở hữu trên giấy.
- **Chỉ giao việc chán.** Người ta học từ việc khó; giao mãi việc lặp lại là cách nuôi một đội không lớn lên và rồi ngạc nhiên khi họ nghỉ.
- **Không ai được sai.** Đội không được phép sai là đội không được phép quyết, và đội đó luôn chờ bạn.
- **Review chỉ có "chặn" và im lặng.** Người viết không biết cái gì tốt, chỉ biết cái gì sai.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc giao việc và review**

Hai chỗ AI giúp thật: **rà PR trước khi người review đọc**, và **soạn bản nháp brief** cho một tính năng. Chỗ nó không được thay bạn: quyết mức uỷ quyền, và nói chuyện với người.

| Chế độ | Khi nào | Lưu ý |
|---|---|---|
| Rà PR vòng một | Ngay khi PR mở | Để nó bắt lỗi máy bắt được, người dành thời gian cho thiết kế và rủi ro |
| Soạn brief | Trước khi giao một tính năng | Bạn sửa lại dòng "kết quả" và dòng "mức" — hai dòng đó là của bạn |
| Đối chiếu hợp đồng | PR đụng message hoặc master data | Bắt nó so tên trường trong code với file `.proto` thật |
| Tìm nhánh lỗi bị bỏ | PR nào cũng dùng được | "Liệt kê đường lỗi chưa được xử lý trong PR này" |

Cách dùng đáng giá nhất là biến danh sách **năm thứ chặn merge** của đội thành một checklist cố định cho AI chạy mỗi PR. Nó không thay người review, nhưng nó không bao giờ quên mục nào — còn người thì có.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Danh sách "chặn merge" của đội bạn** — không đưa thì nó soi phong cách code và bỏ qua chỗ mất tiền.
- **Hợp đồng thật** (`.proto`, schema master data) để nó đối chiếu thay vì tin tên trường trong PR.
- **Định nghĩa "xong"** của đội, nếu bạn muốn nó kiểm cả phần test và phần nối hai phía.
- **Ai viết PR này và mức uỷ quyền của họ ở mảng đó** — không phải để đánh giá người, mà để biết nên soi kỹ chỗ nào.

**Mẫu prompt**

```
Việc: rà PR này trước khi tôi đọc. Phân loại MỌI nhận xét thành đúng bốn nhãn:
[chặn] [nên] [gợi ý] [hỏi].

Danh sách CHẶN MERGE của đội tôi — chỉ những thứ này mới được gắn nhãn [chặn]:
1. Động tới tiền/vật phẩm mà không nằm trong transaction.
2. Phá tương thích ngược của hợp đồng message hoặc của save.
3. Ghi đè hoặc làm mất dữ liệu người chơi không khôi phục được.
4. Cho phép client tự khai kết quả mà đáng lẽ server phải tính.
5. Không có cách nào kiểm chứng: không test, không mô tả cách thử tay.

Đối chiếu tên trường và mã lỗi trong PR với file hợp đồng đính kèm, KHÔNG tin
tên trường viết trong code.

Ràng buộc:
- KHÔNG gắn [chặn] cho phong cách, tên biến, hay tối ưu chưa đo.
- KHÔNG đề xuất refactor kiến trúc trong một PR sửa lỗi.
- Liệt kê riêng: đường lỗi chưa xử lý (mất mạng, server 500, bấm hai lần).
- Cuối cùng nêu 3 câu hỏi đáng hỏi nhất mà chỉ người hiểu bối cảnh mới trả lời được.
```

**Bẫy thường gặp:** AI gắn nhãn "chặn" cho mọi thứ nó thấy chưa tối ưu, và nếu bạn dán nguyên kết quả đó vào PR thì người viết nhận về ba mươi nhận xét bắt buộc cho một thay đổi năm mươi dòng — lần sau họ sẽ ngại gửi PR nhỏ. Bẫy thứ hai: nó đề xuất refactor kiến trúc trong một PR sửa lỗi gấp, đúng lúc không nên. Bẫy thứ ba, tinh vi nhất: nó tin tên trường và mã lỗi viết trong chính PR đó, nên hai phía lệch nhau vẫn qua được vòng rà — phải bắt nó đối chiếu với file hợp đồng.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Mid` **Anh giao việc cho một người mới vào đội thế nào?**
  → Tôi viết brief sáu dòng thay vì nói miệng: kết quả cần đạt, ràng buộc, định nghĩa xong, mức uỷ quyền, hạn kèm luật báo trễ trước một ngày, và ngưỡng bắt buộc phải hỏi — quá hai tiếng không tự gỡ được thì phải hỏi. Dòng cuối quan trọng nhất với người mới, vì nó biến việc hỏi từ chỗ thừa nhận yếu kém thành làm theo quy trình.
- `Mid` **Anh thấy PR của một bạn chưa ổn nhưng deadline sát. Anh tự sửa hay trả về?**
  → Tôi không tự sửa rồi merge, vì cái giá là họ không học được, không còn thấy đó là code của mình, và lần sau viết cẩu thả hơn. Sát deadline thì tôi ngồi cùng họ sửa trong mười lăm phút — vừa kịp vừa giữ được quyền sở hữu. Trừ khi đó là sự cố production đang chảy máu, lúc đó tốc độ thắng, và tôi nói rõ với họ vì sao lần này tôi tự làm.
- `Senior` **Làm sao để nhận xét review không biến thành chuyện cá nhân?**
  → Hai việc. Một là gắn nhãn cho mọi nhận xét — chặn, nên, gợi ý, hỏi — để người viết biết cái nào bắt buộc, cái nào chỉ là ý kiến; không gắn nhãn thì mọi nhận xét đều nghe như mệnh lệnh. Hai là danh sách được phép "chặn" phải ngắn, cố định và dán công khai, ở đội tôi là năm thứ xoay quanh tiền, tương thích ngược, dữ liệu người chơi, quyền của client và khả năng kiểm chứng. Còn lại là góp ý, và góp ý thì được phép từ chối.
- `Senior` **Đội anh dùng AI sinh code. Review đổi thế nào?**
  → Trọng tâm chuyển từ cú pháp sang giả định. Code AI viết hiếm khi sai cú pháp nhưng hay bịa tên trường, mã lỗi và giá trị mặc định, nên tôi bắt đối chiếu với file hợp đồng thật thay vì tin tên viết trong PR. Thứ hai là đường lỗi — nó viết đường thành công rất trơn và bỏ nhánh mất mạng, server 500, bấm hai lần. Và luật của đội là người gửi PR chịu trách nhiệm mọi dòng trong đó; "AI viết đoạn đó" không phải lời giải thích.

**Khung trả lời 60 giây** — "Anh giao việc và giữ chất lượng bằng cách nào?"

> Tôi nói rõ **mức uỷ quyền** mỗi lần giao. Năm mức, từ làm theo tôi nói, đề xuất để tôi duyệt, làm rồi hỏi trước khi merge, làm rồi báo lại, tới tự quyết không cần báo. Chọn mức theo hai trục: rủi ro nếu sai, và kinh nghiệm của người đó ở **đúng mảng này** — nên cùng một người có thể ở mức 5 mảng UI và mức 2 khi đụng vào ví tiền. Không nói mức ra thì người cẩn thận sẽ tự đoán mức thấp, và tôi thành nút cổ chai.
>
> Giao thì giao **kết quả**, không giao thao tác: "người chơi mua được item và tiền trừ đúng trong database", chứ không phải "viết hàm BuyItem gọi API này".
>
> Còn chất lượng thì giữ ở review, với một luật: nhận xét phải gắn nhãn — **chặn, nên, gợi ý, hỏi** — và danh sách được phép chặn merge chỉ có năm thứ, đều xoay quanh tiền, tương thích ngược và dữ liệu người chơi. Hai con số đi kèm: PR trả lời trong một ngày làm việc, không quá 400 dòng.

**Họ sẽ đào tiếp**

- *"Sao phải nói mức uỷ quyền ra thành lời?"* → Vì không nói thì người ta đoán, và đoán sai theo cả hai hướng đều tốn: người cẩn thận chờ bạn duyệt từng bước nên bạn thành nút cổ chai; người tự tin quyết luôn một thứ khó đảo ngược. Nói ra mất năm giây và xoá hẳn cả hai rủi ro.
- *"Vì sao PR không quá 400 dòng?"* → Vì PR to hơn thì review thành đọc lướt rồi bấm duyệt, mà như thế tệ hơn không review — nó tạo cảm giác đã có người kiểm tra. PR nhỏ còn cho phép trả lời trong ngày, và trả lời trong ngày là thứ giữ cho luồng không tắc.
- *"Năm thứ chặn merge của anh là gì?"* → Động tới tiền hoặc vật phẩm mà không trong transaction; phá tương thích ngược của message hoặc save; ghi đè dữ liệu người chơi không khôi phục được; cho client tự khai kết quả đáng lẽ server tính; và code không có cách nào kiểm chứng. Ngoài năm cái đó là góp ý.
- *"Khi nào lead nên tự viết code?"* → Prototype thăm dò, việc ngoài đường găng như công cụ và script build, và sự cố production. Tuyệt đối không phải việc mà chỉ mình mình biết làm — đó đúng là việc phải kèm người khác, kể cả khi đang gấp.
- *"Uỷ quyền nhiều thì chất lượng có tụt không?"* → Có, trong ngắn hạn, và đó là chi phí phải trả. Cách giữ cho nó không tụt quá là chọn mức theo rủi ro chứ không theo cảm tính: chỗ sai mà revert được thì để họ sai, chỗ sai là mất tiền người chơi thì mức 1–2.

**Cờ đỏ**

- "Tôi tự sửa trong PR của họ cho nhanh rồi merge."
- Giao trách nhiệm một mảng nhưng mọi thay đổi vẫn phải lead duyệt.
- Mọi nhận xét review đều mang nghĩa bắt buộc, không phân loại.
- "Đội tôi ai cũng làm được mọi thứ nên tôi không cần phân mức" — thường là dấu hiệu chưa ai được quyết gì.
- Coi code AI sinh ra là trách nhiệm của AI chứ không của người gửi PR.

**Số / ví dụ nên thuộc**

- **Năm** mức uỷ quyền, gắn với cặp (người, mảng việc).
- Brief giao việc: **sáu dòng** — kết quả · ràng buộc · xong nghĩa là · mức · hạn · ngưỡng phải hỏi.
- Ngưỡng bắt buộc hỏi cho người mới: **2 tiếng** tự gỡ không xong.
- Review: trả lời trong **1 ngày làm việc**, PR không quá **400 dòng**.
- **Bốn** nhãn nhận xét · **năm** thứ được phép chặn merge.

**Kể trong dự án**

- *"Anh phân việc trong đội thế nào?"* → Kể cơ chế, không kể cảm tính: mức uỷ quyền theo cặp người–mảng, brief viết ra thay vì nói miệng, và một ví dụ thật về việc bạn nâng mức cho ai đó sau khi họ làm xong mảng nào.
- *"Có lần nào anh giao sai người không?"* → Câu trả lời tốt thừa nhận một lần cụ thể, nêu bạn nhận ra bằng dấu hiệu gì, và bạn sửa bằng cách đổi mức hay đổi người — quan trọng là bạn nói được mình học ra tiêu chí gì cho lần sau.
- *"Đội anh review kiểu gì?"* → Nêu hai con số (một ngày, 400 dòng) và danh sách chặn merge. Người phỏng vấn nghe ra ngay bạn đã ở trong một đội có luật review thật hay chỉ có thói quen bấm duyệt.
