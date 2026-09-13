---
id: screen-presentbox
title: Màn hình Hộp quà
summary: Kênh một chiều từ vận hành tới người chơi — đền bù khi có sự cố, phần thưởng không nhét được vào túi, hạn nhận và luật không bao giờ mất, cùng lý do phải làm nó rất sớm.
status: deep
read: 1150
level: intermediate
order: 50
tags: [screens, mailbox, present, liveops, compensation]
related: [screens, liveops, game-database, screen-mission]
---

Hộp quà — mailbox, present box, tuỳ tên gọi — trông như tính năng phụ. Thực tế nó là **công cụ vận hành quan trọng nhất** trong game, và [[screens]] xếp nó vào đợt xây thứ hai vì một lý do rất thực dụng:

> Khi có sự cố, đây là cách duy nhất bạn trả lại đồ cho người chơi và nói lời xin lỗi.

Làm nó muộn nghĩa là sự cố đầu tiên — và sẽ có sự cố đầu tiên — bạn không có công cụ nào ngoài việc xin lỗi suông.

## Ô 1 — Mục tiêu

> Mọi thứ hệ thống muốn đưa cho người chơi đều đi qua đây, và **không bao giờ mất trên đường**.

Hộp quà là một hàng đợi một chiều: server gửi, người chơi nhận. Không có chiều ngược lại — người chơi không gửi gì vào đây cả. Chính vì một chiều nên nó đơn giản và đáng tin.

## Ô 2 — Năm nguồn gửi vào

| Nguồn | Ví dụ | Đặc điểm |
|---|---|---|
| **Đền bù sự cố** | "Xin lỗi vì server gián đoạn 2 giờ" | Gửi hàng loạt, thường gấp |
| **Phần thưởng không nhét được vào túi** | Gacha khi túi đầy — xem [[screen-gacha]] | Tự động, do hệ thống |
| **Phần thưởng chậm** | Kết quả mùa giải, xếp hạng, đền thua khi bị đánh | Do worker chạy định kỳ |
| **Quà vận hành** | Quà sự kiện, quà sinh nhật, quà quay lại | Có kế hoạch |
| **Hỗ trợ thủ công** | Trả đồ cho người khiếu nại | Từng người, cần ghi lý do |

Nguồn thứ hai giải quyết một câu hỏi thiết kế hay bị bỏ ngỏ: *túi đầy thì sao*. Câu trả lời đúng gần như luôn là "cho vào hộp quà", vì chặn người chơi đang muốn tiêu tiền là quyết định kỳ lạ.

Nguồn cuối là lý do hộp quà cần **ghi lý do gửi** ở mỗi món: khi đội hỗ trợ trả đồ cho một người, phải tra được ai gửi, vì sao, và khi nào.

## Ô 3 — Bố cục

Màn này đơn giản, và nên giữ nó đơn giản:

| Vùng | Nội dung |
|---|---|
| Danh sách | Mỗi dòng: hình vật phẩm, số lượng, **lý do gửi**, **hạn nhận** |
| Trên cùng | Số món chưa nhận, nút **Nhận tất cả** |
| Trạng thái rỗng | "Chưa có quà nào" — không phải màn trắng |

Hai cột bắt buộc trên mỗi dòng là **lý do** và **hạn nhận**. Thiếu lý do thì người chơi không biết mình đang nhận gì và vì sao — quà từ trên trời rơi xuống làm giảm giá trị của chính nó. Thiếu hạn thì bạn không bao giờ dọn được bảng.

## Ô 4 — Hạn nhận và luật không mất

Hạn nhận tồn tại vì lý do kỹ thuật: nếu quà không bao giờ hết hạn thì bảng chỉ lớn lên, và người chơi quay lại sau hai năm sẽ có ba trăm món chờ nhận.

Nhưng hạn nhận cũng là chỗ dễ làm người chơi tức giận nhất. Bốn luật:

1. **Hạn tính bằng tuần, không phải ngày.** 30 ngày là mức phổ biến và hợp lý.
2. **Đền bù sự cố nên có hạn dài hơn** — người chơi bị ảnh hưởng có thể chính là người đã bỏ game vì sự cố đó.
3. **Cảnh báo trước khi hết hạn**, ít nhất một lần, qua chấm đỏ và thông báo đẩy nếu có.
4. **Đừng đặt hạn cho thứ đã trả tiền.** Vật phẩm mua bằng tiền thật mà hết hạn trong hộp quà là chuyện không giải thích được với ai.

## Ô 5 — API và chống nhận hai lần

```
GET  /mailbox?cursor=...   → danh sách, phân trang
POST /mailbox/claim        → { mail_id, request_id }
POST /mailbox/claim-all    → { request_id }
```

Ba luật giống [[screen-mission]] vì cùng bản chất — phần thưởng chảy vào ví:

1. **`request_id` bắt buộc.**
2. **`claim-all` là một transaction**, không phải vòng lặp N lần gọi `claim`.
3. **Trạng thái "đã nhận" nằm ở server**, đánh dấu trong cùng transaction với việc cộng vật phẩm.

Thêm một luật riêng của hộp quà: **`claim-all` phải có trần**, ví dụ 50 món mỗi lần. Người quay lại sau một năm có thể có hàng trăm món, và một transaction cộng ba trăm loại vật phẩm sẽ giữ khoá lâu bất thường. Nhận theo lô, hiện tiến độ.

## Ô 6 — Gửi hàng loạt: phần khó nhất

Đền bù cho toàn bộ người chơi là thao tác vận hành nguy hiểm nhất trong game. Bốn luật:

- **Chạy ở worker**, không trong request. Xem [[go-deploy-ops]].
- **Theo lô, chạy lại được.** Worker chết giữa chừng là chuyện thường — điều kiện lô phải dựa trên trạng thái, không phải offset. Cùng nguyên tắc backfill ở [[project-migration]].
- **Idempotent theo chiến dịch.** Mỗi đợt gửi có một `campaign_id`, và cặp `(user_id, campaign_id)` đặt `UNIQUE`. Chạy lại job không gửi quà hai lần — đây là thứ cứu bạn khi phải chạy lại lúc 2 giờ sáng.
- **Thử trên một nhóm nhỏ trước.** Gửi cho 100 tài khoản nội bộ, kiểm, rồi mới mở rộng.

Sai ở đây thì hậu quả là **lạm phát kinh tế** — gửi nhầm một đợt đá quý cho toàn server thì không rút lại được, vì lấy đồ khỏi người chơi gây phẫn nộ lớn hơn nhiều so với việc để họ giữ.

## Ô 7 — Trạng thái rỗng và lỗi

| Trạng thái | Hiện gì |
|---|---|
| Không có quà | "Chưa có quà nào" kèm hình, **không** phải màn trắng |
| Quà sắp hết hạn | Nhãn nổi bật, sắp lên đầu danh sách |
| Túi đầy khi nhận | Nhận từng phần, giữ lại phần chưa nhận được, nói rõ |
| Mất mạng | Hiện danh sách cache, khoá nút nhận |
| Nhận thất bại | Món vẫn còn trong hộp, thử lại cùng `request_id` |

Dòng thứ ba quan trọng: nhận mà túi đầy thì **không được im lặng bỏ mất**. Nhận được bao nhiêu thì nhận, phần còn lại vẫn nằm trong hộp.

## Ô 8 — Số liệu và vận hành

- **Tỉ lệ nhận trong 24 giờ** sau khi gửi — thấp nghĩa là người chơi không biết mình có quà.
- **Số món hết hạn không ai nhận** — cao nghĩa là hạn quá ngắn hoặc cảnh báo không tới nơi.
- **Thời gian từ quyết định đền bù tới lúc quà tới tay** — chỉ số vận hành, nên tính bằng phút.

Công cụ vận hành cần có, và cần có sớm: gửi cho **một người** (hỗ trợ), gửi cho **một nhóm** (người bị ảnh hưởng bởi sự cố), gửi cho **tất cả** (đền bù toàn server). Ba mức, ba quyền khác nhau — mức thứ ba không nên nằm trong tay một người.

## Bẫy thường gặp

- **Làm hộp quà muộn.** Sự cố đầu tiên không có cách nào xin lỗi bằng hành động.
- **Không có `campaign_id` idempotent.** Chạy lại job là gửi quà hai lần cho một nửa server.
- **`claim-all` không có trần.** Người quay lại sau một năm làm treo một transaction.
- **Không ghi lý do gửi.** Không tra được nguồn gốc khi có tranh cãi.
- **Đặt hạn cho vật phẩm đã trả tiền thật.**
- **Gửi hàng loạt chạy trong request API.** Ăn hết pool kết nối, cả game lag.
- **Im lặng bỏ mất phần không nhận được khi túi đầy.**
- **Không có cảnh báo trước khi hết hạn.** Người chơi mất quà và đổ lỗi cho hệ thống — đúng.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho hộp quà**

Đây là màn AI làm được gần hết phần code, vì logic đơn giản và rõ. Chỗ cần bạn là **chính sách**: hạn bao lâu, gửi cho ai, ai được phép gửi cho tất cả.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Sinh schema + handler | Đầu | "Thiết kế bảng mailbox và handler claim, claim-all idempotent" |
| Viết job gửi hàng loạt | Khi làm công cụ vận hành | "Viết worker gửi quà theo lô, idempotent theo campaign_id, chạy lại được" |
| Soi lỗ hổng | Sau khi có code | "Chỗ nào người chơi nhận quà được hai lần, hoặc job gửi trùng?" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Hạn nhận bao lâu**, và có loại nào không hết hạn không.
- **Túi đầy thì xử lý thế nào** khi nhận.
- **Ai được gửi hàng loạt** và quy trình duyệt.
- **Quy mô**: bao nhiêu tài khoản cho một đợt gửi.

**Mẫu prompt**

```
Server Go + Postgres. Hộp quà: hạn 30 ngày, đền bù sự cố 60 ngày,
vật phẩm mua bằng tiền thật KHÔNG hết hạn. 500.000 tài khoản.

Việc 1: thiết kế bảng mailbox — gồm lý do gửi, hạn, trạng thái đã nhận,
và campaign_id để chống gửi trùng. Nêu rõ index nào cần.
Việc 2: viết handler claim và claim-all. claim-all có trần 50 món mỗi lần,
một transaction, idempotent theo request_id.
Việc 3: viết worker gửi hàng loạt cho toàn bộ tài khoản: theo lô, chạy lại được từ đầu,
idempotent theo cặp (user_id, campaign_id).

Ràng buộc:
- Điều kiện lô dựa trên TRẠNG THÁI, không dùng LIMIT/OFFSET.
- Job gửi chạy ở worker, KHÔNG trong process API.
- Nhận mà túi đầy thì nhận từng phần, phần còn lại VẪN nằm trong hộp.
- Nêu rõ chỗ nào cần tôi quyết chính sách thay vì anh tự chọn.
```

**Bẫy thường gặp:** AI viết job gửi hàng loạt bằng một `INSERT ... SELECT` cho toàn bộ tài khoản — chạy một phát, khoá bảng, và không chạy lại được nếu đứt giữa chừng. Bẫy thứ hai: nó bỏ `campaign_id`, nên chạy lại job là gửi trùng. Bẫy thứ ba: `claim-all` không có trần, và nó chỉ lộ ra với tài khoản có hàng trăm món — tức là tài khoản của người quay lại sau thời gian dài, đúng nhóm bạn đang muốn giữ.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Hộp quà trong game để làm gì?**
  → Là kênh một chiều từ hệ thống tới người chơi: đền bù sự cố, phần thưởng chậm như kết quả mùa giải, quà sự kiện, vật phẩm không nhét được vào túi, và trả đồ thủ công qua hỗ trợ. Người chơi không gửi gì vào đây, và chính vì một chiều nên nó đơn giản và đáng tin.
- `Junior` **Vì sao mỗi món quà phải ghi lý do gửi?**
  → Để người chơi biết mình đang nhận gì và vì sao — quà từ trên trời rơi xuống làm giảm giá trị của chính nó. Và để đội hỗ trợ tra được nguồn gốc khi có tranh cãi: ai gửi, vì sao, khi nào.
- `Mid` **Vì sao hộp quà nên làm rất sớm, trước cả shop?**
  → Vì khi có sự cố, đó là cách duy nhất trả lại đồ cho người chơi bằng hành động thay vì xin lỗi suông. Nó cũng là cách phát quà cho người test và xử lý khiếu nại từ những ngày đầu. Làm muộn nghĩa là sự cố đầu tiên bạn không có công cụ nào.
- `Mid` **Gửi quà đền bù cho 500.000 tài khoản, anh làm thế nào?**
  → Ở worker, theo lô, và **idempotent theo `campaign_id`** — cặp `(user_id, campaign_id)` đặt `UNIQUE` để chạy lại job không gửi hai lần. Điều kiện lô dựa trên trạng thái chứ không dùng offset, vì worker chết giữa chừng là chuyện thường. Và luôn thử trên một trăm tài khoản nội bộ trước khi mở rộng.
- `Senior` **Gửi nhầm một đợt quà cho toàn server. Xử lý thế nào?**
  → Trước hết dừng job và xác định phạm vi. Nhưng phần quan trọng là: **lấy lại đồ gây phẫn nộ lớn hơn nhiều so với để họ giữ**, nên với số lượng nhỏ thì thường chấp nhận và ghi nhận thiệt hại kinh tế. Nếu quy mô đủ lớn để phá kinh tế thì phải thu hồi kèm thông báo công khai và một khoản đền bù khác. Phòng bệnh rẻ hơn nhiều: `campaign_id` idempotent, thử nhóm nhỏ, và quyền gửi toàn server không nằm trong tay một người.
- `Senior` **Người chơi quay lại sau một năm có 300 món trong hộp. Chuyện gì xảy ra?**
  → Nếu `claim-all` không có trần thì một transaction cộng ba trăm loại vật phẩm sẽ giữ khoá lâu bất thường và có thể timeout. Nên đặt trần, ví dụ 50 món mỗi lần, nhận theo lô và hiện tiến độ. Điều đáng nói là lỗi này chỉ lộ với đúng nhóm người chơi quay lại — nhóm bạn đang muốn giữ nhất.

**Khung trả lời 60 giây** — "Thiết kế hộp quà"

> Một hàng đợi một chiều: server gửi, người chơi nhận, không có chiều ngược lại. Mỗi món mang **lý do gửi** và **hạn nhận** — thiếu lý do thì người chơi không hiểu mình nhận gì, thiếu hạn thì bảng chỉ lớn lên mãi.
>
> Về kỹ thuật, `claim` và `claim-all` đều cần `request_id` vì phần thưởng chảy vào ví, `claim-all` là **một transaction có trần** — khoảng 50 món mỗi lần — và trạng thái đã nhận nằm ở server.
>
> Phần khó nhất là **gửi hàng loạt**: chạy ở worker, theo lô với điều kiện dựa trên trạng thái để chạy lại được, và idempotent theo `campaign_id` với cặp `(user_id, campaign_id)` đặt `UNIQUE`. Đó là thứ cứu bạn khi phải chạy lại job lúc hai giờ sáng.

**Họ sẽ đào tiếp**

- *"Hạn nhận bao lâu là hợp lý?"* → Khoảng 30 ngày cho quà thường, dài hơn cho đền bù sự cố — vì người bị ảnh hưởng có thể chính là người đã tạm bỏ game vì sự cố đó. Và **không đặt hạn cho vật phẩm đã trả tiền thật**, đó là thứ không giải thích được với ai.
- *"Túi đầy khi nhận thì sao?"* → Nhận được bao nhiêu thì nhận, phần còn lại **vẫn nằm trong hộp** và nói rõ cho người chơi. Im lặng bỏ mất là lỗi khó phát hiện và rất khó lấy lại niềm tin.
- *"Vì sao gửi hàng loạt không chạy trong API?"* → Vì nó quét toàn bộ tài khoản và sẽ ăn hết pool kết nối database, làm request của người đang chơi timeout. Triệu chứng là "game lag" trong khi nguyên nhân nằm ở một job vận hành.
- *"Ai được phép gửi cho tất cả?"* → Ba mức quyền khác nhau: gửi một người cho hỗ trợ, gửi một nhóm cho sự cố, gửi toàn server thì cần duyệt và không nên nằm trong tay một người. Đây là thao tác không hoàn tác được.
- *"Đo gì ở hộp quà?"* → Tỉ lệ nhận trong 24 giờ — thấp nghĩa là người chơi không biết mình có quà, tức là chấm đỏ hoặc thông báo đang hỏng. Và số món hết hạn không ai nhận, cao nghĩa là hạn quá ngắn hoặc cảnh báo không tới nơi.

**Cờ đỏ**

- Không có hộp quà cho tới khi gặp sự cố đầu tiên.
- Job gửi hàng loạt không idempotent.
- `claim-all` không có trần.
- Không ghi lý do gửi.
- Đặt hạn cho vật phẩm mua bằng tiền thật.
- Gửi hàng loạt chạy trong process API.
- Quyền gửi toàn server không có quy trình duyệt.

**Số / ví dụ nên thuộc**

- Hạn nhận thường **30 ngày**; đền bù sự cố dài hơn; đồ trả tiền thật **không hết hạn**.
- `claim-all` có trần, ví dụ **50 món** mỗi lần.
- Chống gửi trùng: cặp **`(user_id, campaign_id)` `UNIQUE`**.
- Thử trên **~100 tài khoản nội bộ** trước khi gửi toàn server.

**Kể trong dự án**

- *"Anh làm hộp quà à?"* → Nêu **công cụ vận hành** bạn làm kèm theo, không chỉ màn hình. Ba mức gửi và quy trình duyệt là phần cho thấy bạn nghĩ tới người vận hành, không chỉ người chơi.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: job đền bù chạy dở rồi đứt, chạy lại và một nửa server nhận quà hai lần. Kể cách bạn thêm `campaign_id` idempotent và vì sao việc chạy lại được quan trọng hơn việc chạy đúng ngay lần đầu.
- *"Anh có từng đền bù sự cố chưa?"* → Nếu có, kể dòng thời gian: từ lúc quyết định đền bù tới lúc quà tới tay mất bao lâu. Con số tính bằng phút hay bằng ngày nói rất nhiều về mức trưởng thành của hệ thống vận hành.
