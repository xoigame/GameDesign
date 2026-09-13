---
id: screen-result
title: Màn hình Kết quả trận
summary: Khoảnh khắc thoả mãn sau trận và cây cầu về vòng lặp tiếp theo — thứ tự tiết lộ phần thưởng, bỏ qua được, chốt kết quả ở server, và vì sao nút chơi tiếp quan trọng hơn nút về nhà.
status: deep
read: 1180
level: intermediate
order: 80
tags: [screens, result, reward, retention, loop]
related: [screens, client-server-flow, game-feel, screen-home]
---

Màn kết quả là màn **ngắn nhất** và bị đánh giá thấp nhất. Nó chỉ hiện vài giây, nhưng nó làm ba việc cùng lúc:

1. Trả cảm giác thoả mãn cho việc người chơi vừa làm.
2. Ghi phần thưởng vào ví — chỗ duy nhất trong vòng lặp chạm vào tiền.
3. Quyết định người chơi **chơi tiếp hay thoát app**.

Việc thứ ba là việc quan trọng nhất, và phần lớn game làm hỏng nó bằng cách đặt nút "Về trang chủ" ở vị trí dễ bấm nhất.

## Ô 1 — Mục tiêu

> Người chơi hiểu mình vừa được gì, cảm thấy xứng đáng, và **chạm một lần là vào trận tiếp theo**.

## Ô 2 — Thứ tự tiết lộ

Màn này là màn duy nhất trong nhánh mà **thứ tự thời gian quan trọng hơn bố cục không gian**. Thứ tự tốt:

| Bước | Hiện gì | Vì sao thứ tự này |
|---|---|---|
| 1 | Thắng/thua, điểm chính | Câu trả lời người chơi đang chờ |
| 2 | Phần thưởng cơ bản | Thứ họ biết chắc sẽ có |
| 3 | Thưởng thêm, bất ngờ | Đặt sau để tạo cao trào |
| 4 | Tiến độ: thanh cấp, thanh mùa, nhiệm vụ vừa xong | Cho thấy trận vừa rồi đẩy được thứ gì |
| 5 | **Nút chơi tiếp** (nổi bật) + nút về nhà (phụ) | Cây cầu sang vòng lặp tiếp theo |

Bước 4 là bước hay bị bỏ và nó có giá trị cao: người chơi thấy thanh nhiệm vụ nhích lên, thanh mùa nhích lên, và **thấy mình gần một mốc nào đó** — đó chính là lý do chơi thêm một trận.

Bước 5: nút chơi tiếp phải to hơn nút về nhà. Người chơi muốn về nhà luôn tìm được đường; người chơi đang lưỡng lự thì cần một lời mời.

## Ô 3 — Bỏ qua được, nhưng không mất

Ba luật, và cả ba đều xuất phát từ một điều: **người chơi sẽ xem màn này hàng trăm lần**.

1. **Chạm để bỏ qua từng bước**, chạm nữa để tới cuối. Không bắt xem hết.
2. **Bỏ qua không được mất gì.** Phần thưởng đã ghi ở server trước khi màn này hiện — animation chỉ là trình diễn, giống nguyên tắc ở [[screen-gacha]].
3. **Thoát app giữa chừng cũng không mất gì.** Mở lại app thấy phần thưởng trong ví.

Luật 2 và 3 dẫn tới một yêu cầu kiến trúc: **chốt kết quả trận không được nằm trong luồng hiển thị của client.**

## Ô 4 — Kết quả chốt ở đâu

Đây là phần kỹ thuật thật của màn này, và nó khác nhau theo loại game:

| Loại game | Ai chốt kết quả | Ghi chú |
|---|---|---|
| PvP realtime | **Room server** gửi qua API | Client không khai báo gì — xem [[client-server-flow]] |
| PvP async, mô phỏng ở server | **Server** tính từ seed | Client chỉ phát lại |
| PvE có bảng xếp hạng hoặc thưởng thật | **Server** kiểm tính hợp lý | Client gửi ý định và dữ liệu thô, server tính điểm |
| Solo thuần, không thưởng chảy vào ví | Client được | Nhưng hiếm khi thật sự là trường hợp này |

Với dòng thứ ba — game PvE mà client phải gửi kết quả lên — không có cách nào chống gian lận tuyệt đối. Việc làm được là **kiểm tính hợp lý**: thời gian trận có khớp với độ dài màn không, điểm có vượt trần lý thuyết không, số quái tiêu diệt có vượt số quái tồn tại không. Ghi log những trường hợp bất thường, **đừng khoá tài khoản tự động** — tỉ lệ dương tính giả luôn cao hơn bạn nghĩ.

```
POST /match/finish  { match_id, ..., request_id }
                    ← { rewards, balance_after, progress_after }
```

`request_id` bắt buộc, và `match_id` nên là khoá idempotent tự nhiên: một trận chỉ chốt được một lần.

## Ô 5 — Vòng đời

```
Trận kết thúc → client gửi/nhận kết quả (hoặc room server đã gửi)
              → server ghi transaction: thưởng, tiến độ, xếp hạng
              → client NHẬN kết quả đầy đủ rồi mới bắt đầu trình diễn
              → animation, có thể bỏ qua bất cứ lúc nào
              → nút chơi tiếp / về nhà
```

Điểm mấu chốt giống gacha: **dữ liệu có trước, trình diễn sau**. Nếu code cộng thưởng vào ví ở callback cuối animation thì thoát giữa chừng là mất — và người chơi sẽ phát hiện ra.

Một chi tiết dễ bỏ: nếu mạng rớt ngay khi trận vừa xong, client phải **thử lại cùng `request_id`** và hiện "đang chốt kết quả", chứ không im lặng bỏ qua rồi về Home. Mất phần thưởng của một trận vừa chơi xong là trải nghiệm rất tệ.

## Ô 6 — Trạng thái rỗng và lỗi

| Trạng thái | Hiện gì |
|---|---|
| Đang chốt kết quả | "Đang lưu kết quả", không cho thoát màn |
| Mạng rớt khi chốt | Tự thử lại cùng `request_id`, hiện tiến trình |
| Chốt thất bại nhiều lần | Nói rõ trận sẽ được xử lý, chỉ tới hỗ trợ; **không** đổ lỗi cho người chơi |
| Thua | Vẫn phải có thứ để hiện: tiến độ nhiệm vụ, phần thưởng an ủi nhỏ |
| Túi đầy | Thưởng vào [[screen-presentbox]], nói rõ |
| Lên cấp / mốc mùa | Chèn hiệu ứng riêng, nhưng vẫn bỏ qua được |

Dòng "thua" đáng nói: màn kết quả khi thua là màn dễ khiến người chơi thoát app nhất. Cho họ thấy **thứ vẫn tiến lên** — nhiệm vụ, thanh mùa — là cách giữ họ ở lại mà không cần giả vờ rằng họ đã thắng.

## Ô 7 — Số liệu

- **Tỉ lệ chạm "chơi tiếp"** so với "về nhà" — chỉ số trực tiếp cho việc màn này có làm đúng việc thứ ba không.
- **Tỉ lệ thoát app ngay sau màn kết quả**, tách riêng thắng và thua.
- **Tỉ lệ bỏ qua animation** — cao thì trình diễn đang quá dài.
- **Tỉ lệ chốt kết quả thất bại** — phải rất thấp; mỗi lần là một trận người chơi có thể mất thưởng.

Chỉ số đầu tiên là chỉ số đáng theo dõi nhất trong cả nhánh, vì nó đo trực tiếp độ chặt của vòng lặp chính.

## Ô 8 — Vận hành

- Bảng phần thưởng theo kết quả nằm ở master data — sự kiện nhân đôi thưởng là đổi cấu hình, không phải đổi code.
- Hệ số sự kiện (x2 cuối tuần) bật tắt từ server, và **hiện rõ trên màn kết quả** để người chơi biết mình đang được nhân.

## Bẫy thường gặp

- **Cộng thưởng ở cuối animation phía client.** Thoát giữa chừng là mất.
- **Không bỏ qua được.** Người chơi xem màn này hàng trăm lần.
- **Nút về nhà to hơn nút chơi tiếp.** Tự làm đứt vòng lặp chính.
- **Thua thì hiện màn trống rỗng.** Bỏ lỡ đúng thời điểm cần giữ người chơi nhất.
- **Client khai báo điểm** trong game có bảng xếp hạng.
- **Không thử lại khi chốt kết quả thất bại.** Người chơi mất trận vừa chơi.
- **Không có `match_id` idempotent.** Chốt hai lần là thưởng hai lần.
- **Trình diễn quá dài ở trận thua.** Người chơi muốn thử lại ngay, không muốn xem.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho màn kết quả**

Việc hợp nhất là **máy trạng thái và trình tự trình diễn** — nó dễ sai theo cách mà đọc code không thấy, nhưng liệt kê ra thì rõ.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Trình tự tiết lộ | Khi thiết kế | "Đề xuất thứ tự hiện phần thưởng, giải thích vì sao thứ tự đó" |
| Máy trạng thái | Trước khi code | "Liệt kê trạng thái màn kết quả, gồm chốt thất bại và thoát giữa chừng" |
| Soi mất thưởng | Sau khi có code | "Người chơi thoát app ở mỗi bước thì mất gì?" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Ai chốt kết quả** — room server, server tính, hay client gửi lên.
- **Trận dài bao lâu** — quyết định độ dài trình diễn hợp lý.
- **Có bảng xếp hạng hoặc thưởng thật không** — quyết định mức kiểm tra.
- **Thua thì có thưởng không.**

**Mẫu prompt**

```
Game <thể loại>, trận 90 giây, người chơi 10–20 trận mỗi ngày.
Kết quả do server tính. Có bảng xếp hạng có thưởng. Thua vẫn có thưởng an ủi nhỏ.

Việc 1: đề xuất trình tự tiết lộ trên màn kết quả và giải thích lý do từng bước.
Việc 2: liệt kê MỌI trạng thái, gồm: đang chốt, chốt thất bại, mạng rớt, túi đầy,
lên cấp, và người chơi thoát app giữa animation.
Việc 3: với mỗi bước trong trình tự, trả lời: thoát app ở đây thì người chơi mất gì?

Ràng buộc:
- Phần thưởng ghi ở SERVER trước khi màn này hiện — animation chỉ trình diễn.
- Bỏ qua được ở mọi bước, và bỏ qua KHÔNG mất gì.
- Nút chơi tiếp phải nổi bật hơn nút về nhà.
- Với 10–20 trận mỗi ngày, đề xuất độ dài trình diễn tối đa hợp lý.
```

**Bẫy thường gặp:** AI viết chuỗi animation rồi cộng phần thưởng ở callback cuối vì đó là chỗ tự nhiên nhất trong code UI — và nó chạy đúng trong mọi lần test vì không ai thoát app giữa chừng khi đang test. Bẫy thứ hai: nó thiết kế trình diễn dài và hoành tráng mà không tính tới việc người chơi xem nó hai mươi lần mỗi ngày. Bẫy thứ ba: nó đặt hai nút cân bằng nhau ở cuối màn.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Màn kết quả trận làm những việc gì?**
  → Ba việc: trả cảm giác thoả mãn cho trận vừa chơi, ghi phần thưởng vào ví, và quyết định người chơi chơi tiếp hay thoát app. Việc thứ ba quan trọng nhất mà hay bị coi nhẹ — nhiều game đặt nút "Về trang chủ" ở chỗ dễ bấm nhất và tự làm đứt vòng lặp chính.
- `Junior` **Vì sao phải bỏ qua được animation?**
  → Vì người chơi xem màn này hàng trăm lần. Với game trận 90 giây và hai mươi trận mỗi ngày, mỗi giây trình diễn nhân lên thành phút. Chạm để bỏ qua từng bước, chạm nữa để tới cuối — và bỏ qua không được mất gì.
- `Mid` **Người chơi thoát app giữa lúc màn kết quả đang chạy. Họ mất gì?**
  → Không mất gì, vì phần thưởng đã ghi ở server **trước khi** màn này hiện. Animation chỉ là trình diễn lại thứ đã chốt. Lỗi hay gặp là cộng thưởng ở callback cuối animation phía client — nó chạy đúng trong mọi lần test vì không ai thoát app khi đang test, rồi hỏng với người chơi thật.
- `Mid` **Mạng rớt ngay khi trận vừa kết thúc thì sao?**
  → Client hiện "đang chốt kết quả" và tự thử lại **cùng `request_id`**, với `match_id` làm khoá idempotent tự nhiên — một trận chỉ chốt được một lần. Tuyệt đối không im lặng bỏ qua rồi về Home: mất phần thưởng của trận vừa chơi xong là một trong những trải nghiệm tệ nhất trong game.
- `Senior` **Game PvE mà client phải gửi điểm lên. Anh chống gian lận thế nào?**
  → Không có cách tuyệt đối, nên tôi làm hai việc. Một, **kiểm tính hợp lý**: thời gian trận có khớp độ dài màn không, điểm có vượt trần lý thuyết không, số quái tiêu diệt có vượt số quái tồn tại không. Hai, ghi log bất thường và **không khoá tài khoản tự động**, vì tỉ lệ dương tính giả luôn cao hơn dự đoán và khoá nhầm một người chơi thật đắt hơn nhiều so với để lọt một người gian lận.
- `Senior` **Đo gì để biết màn kết quả đang làm đúng việc?**
  → Chỉ số quan trọng nhất là **tỉ lệ chạm "chơi tiếp" so với "về nhà"**, vì nó đo trực tiếp độ chặt của vòng lặp chính. Cộng thêm tỉ lệ thoát app ngay sau màn kết quả, tách riêng thắng và thua — nếu tỉ lệ thoát sau khi thua cao bất thường thì màn thua đang không cho người chơi lý do nào ở lại.

**Khung trả lời 60 giây** — "Thiết kế màn kết quả trận"

> Nguyên tắc kiến trúc trước: **dữ liệu có trước, trình diễn sau.** Server chốt kết quả và ghi phần thưởng trong một transaction; client nhận đầy đủ rồi mới bắt đầu animation. Nhờ vậy bỏ qua không mất gì, và thoát app giữa chừng cũng không mất gì.
>
> Về trình tự thì thứ tự thời gian quan trọng hơn bố cục: kết quả thắng thua trước, phần thưởng cơ bản, rồi thưởng thêm để tạo cao trào, rồi **tiến độ** — thanh nhiệm vụ và thanh mùa nhích lên. Bước tiến độ hay bị bỏ nhưng nó chính là lý do người chơi chơi thêm một trận.
>
> Cuối cùng là cây cầu: **nút chơi tiếp nổi bật hơn nút về nhà.** Người muốn về nhà luôn tìm được đường; người đang lưỡng lự thì cần một lời mời. Tôi đo tỉ lệ chạm hai nút đó như chỉ số chính của màn.

**Họ sẽ đào tiếp**

- *"Màn kết quả khi thua nên hiện gì?"* → Vẫn phải có thứ tiến lên: tiến độ nhiệm vụ, thanh mùa, một phần thưởng an ủi nhỏ. Đây là thời điểm dễ mất người chơi nhất, và cho họ thấy trận thua vẫn đẩy được thứ gì đó là cách giữ họ mà không cần giả vờ rằng họ đã thắng. Và trình diễn khi thua nên **ngắn hơn** — họ muốn thử lại ngay.
- *"Ai chốt kết quả trong game của anh?"* → Tuỳ loại: PvP realtime thì room server gửi qua API, PvP async thì server tính từ seed và client chỉ phát lại, PvE có thưởng thật thì client gửi dữ liệu thô còn server tính điểm và kiểm tính hợp lý.
- *"Vì sao `match_id` là khoá idempotent tốt?"* → Vì nó là khoá tự nhiên: một trận chỉ tồn tại một lần và chỉ chốt được một lần. Không cần sinh thêm id riêng, và nó cũng cho phép truy ngược dễ dàng khi điều tra khiếu nại.
- *"Túi đầy khi nhận thưởng cuối trận?"* → Thưởng vào hộp quà và nói rõ, không im lặng bỏ mất. Chặn người chơi nhận thưởng vì túi đầy là cách nhanh nhất làm hỏng đúng khoảnh khắc lẽ ra vui nhất trong vòng lặp.
- *"Sự kiện nhân đôi thưởng thì làm sao?"* → Hệ số nằm ở cấu hình server, bật tắt không cần build, và phải **hiện rõ trên màn kết quả** để người chơi biết mình đang được nhân — nếu không thì bạn trả tiền cho một sự kiện mà không ai nhận ra nó đang diễn ra.

**Cờ đỏ**

- Cộng phần thưởng vào ví ở callback cuối animation phía client.
- Không bỏ qua được trình diễn.
- Nút về nhà nổi bật hơn hoặc bằng nút chơi tiếp.
- Không thử lại khi chốt kết quả thất bại.
- Client khai báo điểm trong game có bảng xếp hạng có thưởng.
- Khoá tài khoản tự động khi phát hiện điểm bất thường.
- Màn thua không có gì để hiện.

**Số / ví dụ nên thuộc**

- Trình diễn phải tính theo **số lần xem mỗi ngày**, không theo mức hoành tráng mong muốn.
- `match_id` là khoá idempotent tự nhiên — một trận chốt một lần.
- Chỉ số chính: **tỉ lệ chạm "chơi tiếp" so với "về nhà"**.
- Kiểm tính hợp lý: thời gian trận, trần điểm lý thuyết, số quái tồn tại.

**Kể trong dự án**

- *"Anh làm màn kết quả à?"* → Nêu **con số bạn cải thiện** nếu có: tỉ lệ chơi tiếp, hoặc số trận trung bình mỗi phiên. Đây là màn nhỏ nhưng ảnh hưởng trực tiếp tới chỉ số vòng lặp.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: khiếu nại mất phần thưởng sau trận, số lượng ít nên khó tái hiện. Kể cách bạn lần ra là thưởng được cộng ở cuối animation và người chơi thoát app giữa chừng, rồi chuyển sang chốt ở server trước khi trình diễn.
- *"Anh có rút ngắn animation bao giờ chưa?"* → Nếu có, kể dữ liệu bạn dựa vào — tỉ lệ bỏ qua — và kết quả sau khi rút. Quyết định dựa trên tỉ lệ bỏ qua là loại lập luận rất dễ thuyết phục vì nó là hành vi thật chứ không phải ý kiến.
