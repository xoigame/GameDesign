---
id: screen-ranking
title: Màn hình Bảng xếp hạng & Mùa giải
summary: So sánh xã hội có kiểm soát — ZSET và cái bẫy của nó, hiển thị quanh vị trí người chơi thay vì top 100, chốt mùa ở worker, và cách chia hạng để đa số vẫn thấy mình đang tiến.
status: deep
read: 1190
level: advanced
order: 90
tags: [screens, ranking, leaderboard, season, social]
related: [screens, game-database, go-matchmaking, screen-presentbox]
---

Bảng xếp hạng là cơ chế giữ chân mạnh, và cũng là cơ chế **làm nản lòng nhiều người chơi nhất** nếu làm sai. Lý do rất đơn giản về mặt số học: nếu bảng chỉ có một thứ hạng toàn cục, thì **99% người chơi nhìn vào thấy mình ở đâu đó rất xa đỉnh** — và không có gì để phấn đấu.

Node này nói cả phần kỹ thuật (ZSET, chốt mùa) và phần thiết kế (chia hạng để đa số vẫn thấy mình tiến).

## Ô 1 — Mục tiêu

> Người chơi thấy mình **đang ở đâu**, **cách mốc kế tiếp bao xa**, và mốc đó **với tới được**.

Ba vế, và vế thứ ba là vế quyết định. Bảng xếp hạng mà mốc kế tiếp không với tới được thì nó chỉ là một danh sách tên người lạ.

## Ô 2 — Chia hạng: luật quan trọng nhất

Đừng dùng một bảng toàn cục duy nhất. Bốn cách chia, có thể kết hợp:

| Cách chia | Hiệu quả | Lưu ý |
|---|---|---|
| **Bậc hạng** (đồng, bạc, vàng…) | Cao — ai cũng có mốc gần | Mốc lên hạng phải rõ và với tới được |
| **Nhóm nhỏ** (50–100 người cùng mức) | Rất cao — cạnh tranh có ý nghĩa | Phải gom nhóm công bằng, xem [[go-matchmaking]] |
| **Bạn bè** | Cao với người có bạn chơi cùng | Vô dụng nếu game chưa có tính năng xã hội |
| Toàn cục | Thấp với đa số | Vẫn nên có, nhưng đừng là bảng chính |

Kết hợp thường dùng và hiệu quả: **bậc hạng làm khung, nhóm nhỏ làm nơi cạnh tranh thật, toàn cục để tôn vinh top.**

Với bậc hạng, thêm một luật giảm nản: **sàn bảo vệ.** Lên hạng vàng rồi thì không tụt về bạc trong cùng mùa. Không có sàn thì người chơi trung bình dao động quanh một mốc suốt mùa và cảm giác là không đi tới đâu.

## Ô 3 — Dữ liệu: ZSET và cái bẫy

| Dữ liệu | Chỗ | Vì sao |
|---|---|---|
| Điểm hiện tại để xếp hạng | **Redis ZSET** | `ZREVRANK` là O(log N); `ORDER BY` trên triệu dòng mỗi request thì không |
| **Nguồn chân lý của điểm** | **Postgres** | Redis mất là mất bảng — xem [[game-database]] |
| Kết quả cuối mùa | Postgres | Lưu vĩnh viễn, dùng để phát thưởng và tra cứu |
| Thông tin hiển thị (tên, avatar) | Postgres, cache | Đừng nhét vào ZSET |

Cái bẫy của ZSET, nói thẳng: **nó nằm trong bộ nhớ và không bền.** Redis restart hoặc mất dữ liệu là bảng xếp hạng biến mất. Nếu điểm chỉ tồn tại ở ZSET thì bạn mất luôn cơ sở phát thưởng cuối mùa.

Cách làm đúng: **ghi điểm vào Postgres là nguồn chân lý, đồng thời cập nhật ZSET để đọc nhanh.** Mất Redis thì dựng lại ZSET từ Postgres — chậm vài phút nhưng không mất gì.

Một chi tiết nữa: ZSET chỉ nên chứa `user_id` và điểm. Tên và avatar tra riêng cho trang đang hiển thị — nhét vào ZSET là lãng phí bộ nhớ và mỗi lần đổi tên phải sửa ZSET.

## Ô 4 — Hiển thị: quanh vị trí, không phải top 100

Đây là khác biệt lớn nhất giữa bảng xếp hạng dùng được và bảng xếp hạng để trưng bày.

```
GET /leaderboard?scope=group&around=me&limit=21
→ trả về 10 người trên, bản thân, 10 người dưới
```

Người chơi hạng 4.312 không quan tâm ai đang hạng 1. Họ quan tâm **ai đang ở 4.311 và 4.310** — đó là mục tiêu với tới được.

Thiết kế màn nên có:

- **Vùng dính (sticky)** hiện dòng của chính người chơi, luôn thấy dù cuộn đi đâu.
- **Mặc định mở ở vị trí của mình**, không mở ở đầu bảng.
- **Top 3 riêng** ở đầu để tôn vinh, nhưng không chiếm chỗ của vùng quan trọng.
- **Khoảng cách tới mốc kế** hiện bằng số: "còn 40 điểm để lên hạng vàng".

Về hiệu năng: `ZREVRANK` cho thứ hạng của một người là O(log N), `ZREVRANGE` cho một dải là O(log N + M) với M là số phần tử lấy ra — nên lấy 21 dòng quanh vị trí rất rẻ. Điều **không** rẻ là lấy toàn bộ bảng, nên đừng làm.

## Ô 5 — Chốt mùa: chạy ở worker

Kết thúc mùa là thao tác nặng và nguy hiểm nhất của hệ thống này:

```
Mùa kết thúc → ĐÓNG BĂNG bảng (ngừng nhận điểm mới cho mùa cũ)
             → worker: chốt thứ hạng từ ZSET, ghi xuống Postgres
             → worker: tính phần thưởng theo hạng, gửi vào hộp quà
             → reset điểm cho mùa mới (một phần, không về 0)
             → mở bảng mùa mới
```

Năm luật:

1. **Chạy ở worker**, không trong request — nó quét toàn bộ người chơi. Xem [[go-deploy-ops]].
2. **Đóng băng trước khi chốt.** Không thì có người vừa kết thúc trận lúc giao mùa và điểm rơi vào khoảng trống giữa hai mùa.
3. **Idempotent theo `season_id`.** Job phát thưởng chạy lại không được phát hai lần — cùng nguyên tắc `campaign_id` ở [[screen-presentbox]].
4. **Phát thưởng qua hộp quà**, không cộng thẳng vào ví. Người chơi thấy được mình nhận gì và vì sao, và bạn có bản ghi.
5. **Reset một phần, không về 0.** Về 0 thì mọi người mất cảm giác tiến bộ; reset về giữa hạng hiện tại giữ được cả hai.

Thời điểm chốt mùa cũng là thời điểm tải cao: ai cũng vào xem kết quả. Chốt vào giờ thấp điểm, và chuẩn bị cho đợt người chơi quay lại ngay sau đó.

## Ô 6 — Trạng thái rỗng và lỗi

| Trạng thái | Hiện gì |
|---|---|
| Chưa xếp hạng (chưa đủ trận) | "Chơi thêm N trận để vào bảng" — mục tiêu rõ, không phải màn trắng |
| Nhóm quá ít người | Gộp nhóm hoặc hiện bảng bậc trên; **không** hiện bảng ba người |
| Đang chốt mùa | "Đang tổng kết mùa", hiện kết quả tạm, không cho hiểu nhầm là đã chốt |
| Mất Redis | Hiện dữ liệu Postgres (chậm hơn, vẫn đúng), không sập màn |
| Người chơi đã xoá tài khoản | Hiện "Người chơi đã rời", không để lỗi tra cứu làm sập trang |

Dòng cuối là dòng dễ quên và nó chắc chắn xảy ra sau khi có luồng xoá tài khoản ở [[project-identity]].

## Ô 7 — Số liệu

- **Tỉ lệ mở bảng xếp hạng** theo bậc hạng — nếu người hạng thấp gần như không mở thì bảng đang không phục vụ họ.
- **Phân bố người chơi theo bậc** — dồn hết vào một bậc nghĩa là mốc chia sai.
- **Tỉ lệ chơi thêm sau khi xem bảng** — đo xem bảng có tạo động lực không.
- **Tỉ lệ người chơi tụt hạng cuối mùa** — cao thì cân nhắc sàn bảo vệ.

## Ô 8 — Vận hành

- Mốc hạng, phần thưởng theo hạng, độ dài mùa đều từ master data.
- **Tắt được bảng xếp hạng từ server** — nó đứng đầu danh sách cầu dao ở [[project-launch]] vì ít ai để ý trong một giờ.
- Có công cụ **gỡ một tài khoản khỏi bảng** khi phát hiện gian lận, và nó phải không làm lệch thứ hạng của người khác một cách khó hiểu.

## Bẫy thường gặp

- **Chỉ có một bảng toàn cục.** 99% người chơi không có mốc nào với tới được.
- **Dùng ZSET làm nguồn chân lý.** Mất Redis là mất cơ sở phát thưởng.
- **`ORDER BY ... LIMIT` trên bảng triệu dòng mỗi request.** Chậm dần rồi sập.
- **Mở bảng ở top 1** thay vì ở vị trí người chơi.
- **Chốt mùa chạy trong API.** Ăn hết pool kết nối đúng lúc đông người.
- **Job phát thưởng không idempotent.** Chạy lại là phát hai lần.
- **Không đóng băng khi giao mùa.** Điểm rơi vào khoảng trống.
- **Reset về 0.** Mất cảm giác tiến bộ giữa các mùa.
- **Nhét tên và avatar vào ZSET.** Đổi tên phải sửa ZSET.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho bảng xếp hạng**

Phần truy vấn ZSET và job chốt mùa là việc AI làm tốt nếu bạn nêu rõ ràng buộc. Phần **chia hạng** thì cần dữ liệu phân bố người chơi của bạn, nó không đoán được.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Thiết kế truy vấn | Đầu | "Viết truy vấn lấy 10 trên 10 dưới quanh vị trí người chơi bằng ZSET" |
| Job chốt mùa | Trước khi mùa đầu kết thúc | "Viết worker chốt mùa: đóng băng, chốt hạng, phát thưởng, reset — idempotent" |
| Soi rủi ro dữ liệu | Trước phát hành | "Mất Redis giữa mùa thì chuyện gì xảy ra với hệ thống này?" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Bao nhiêu người chơi** — quyết định có cần chia nhóm không.
- **Chia hạng thế nào** hoặc yêu cầu nó đề xuất kèm giả định.
- **Điểm lưu ở đâu là nguồn chân lý** — nếu không nói, nó sẽ dùng Redis.
- **Phần thưởng phát qua đâu** — hộp quà hay cộng thẳng.

**Mẫu prompt**

```
500.000 người chơi. Mùa 4 tuần. Bậc hạng: đồng/bạc/vàng/kim cương,
trong mỗi bậc chia nhóm 100 người. Postgres là nguồn chân lý của điểm,
Redis ZSET để đọc nhanh. Thưởng cuối mùa phát qua hộp quà.

Việc 1: thiết kế cách lưu — khi nào ghi Postgres, khi nào cập nhật ZSET,
và cách dựng lại ZSET nếu mất Redis.
Việc 2: viết truy vấn lấy 10 trên / bản thân / 10 dưới, kèm thứ hạng tuyệt đối.
Việc 3: viết worker chốt mùa: đóng băng, chốt hạng xuống Postgres, phát thưởng vào hộp quà,
reset một phần. Idempotent theo season_id, chạy lại được từ đầu.

Ràng buộc:
- ZSET KHÔNG phải nguồn chân lý.
- ZSET chỉ chứa user_id + điểm; tên và avatar tra riêng cho trang đang hiển thị.
- Worker theo lô, điều kiện dựa trên TRẠNG THÁI, không dùng offset.
- Reset KHÔNG về 0 — đề xuất công thức reset một phần và giải thích.
```

**Bẫy thường gặp:** AI dùng Redis làm nơi lưu duy nhất vì ví dụ trên mạng đều thế, và bạn chỉ phát hiện vấn đề vào ngày Redis restart. Bẫy thứ hai: nó viết job chốt mùa thành một truy vấn lớn chạy một phát, không chạy lại được nếu đứt. Bẫy thứ ba: nó trả về top 100 thay vì dải quanh vị trí người chơi, vì "bảng xếp hạng" trong dữ liệu huấn luyện thường là top N.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao dùng Redis ZSET cho bảng xếp hạng?**
  → Vì `ZREVRANK` lấy thứ hạng của một người là O(log N), còn `ORDER BY` trên bảng triệu dòng mỗi request thì không trụ nổi. Lấy một dải quanh vị trí cũng rẻ. Nhưng ZSET **không phải nguồn chân lý** — điểm vẫn phải nằm ở Postgres.
- `Junior` **Cái bẫy của ZSET là gì?**
  → Nó nằm trong bộ nhớ và không bền. Redis restart hoặc mất dữ liệu là bảng biến mất, và nếu điểm chỉ tồn tại ở đó thì mất luôn cơ sở phát thưởng cuối mùa. Cách đúng là ghi Postgres làm nguồn chân lý, đồng thời cập nhật ZSET để đọc nhanh, và dựng lại ZSET từ Postgres khi cần.
- `Mid` **Người chơi hạng 4.312 mở bảng xếp hạng. Anh hiện gì?**
  → Mười người trên, bản thân, mười người dưới — mở mặc định ở **vị trí của họ**, không phải ở top 1. Họ không quan tâm ai đang hạng nhất; họ quan tâm ai đang ở 4.311. Kèm dòng dính luôn hiện vị trí của chính họ và con số "còn bao nhiêu điểm để lên mốc kế".
- `Mid` **Một bảng toàn cục duy nhất có vấn đề gì?**
  → Về số học thì 99% người chơi nhìn vào thấy mình rất xa đỉnh và không có mốc nào với tới được — bảng trở thành danh sách tên người lạ. Cách xử lý là chia: bậc hạng làm khung, nhóm nhỏ khoảng 100 người làm nơi cạnh tranh thật, toàn cục chỉ để tôn vinh top.
- `Senior` **Mô tả quy trình chốt mùa.**
  → Đóng băng bảng trước để không có điểm rơi vào khoảng trống giữa hai mùa; worker chốt thứ hạng từ ZSET xuống Postgres; worker tính thưởng theo hạng và **gửi qua hộp quà** chứ không cộng thẳng vào ví; reset điểm một phần cho mùa mới; mở bảng mới. Toàn bộ **idempotent theo `season_id`** và chạy lại được, vì job này chắc chắn có lúc đứt giữa chừng.
- `Senior` **Vì sao reset điểm không về 0, và vì sao cần sàn bảo vệ hạng?**
  → Cả hai đều để giữ cảm giác tiến bộ. Reset về 0 thì mỗi mùa người chơi bắt đầu lại từ con số không và công sức mùa trước biến mất; reset về giữa hạng hiện tại giữ được vị thế mà vẫn tạo không gian leo. Sàn bảo vệ — lên vàng rồi không tụt về bạc trong cùng mùa — chặn tình trạng người chơi trung bình dao động quanh một mốc suốt mùa và thấy mình không đi tới đâu.

**Khung trả lời 60 giây** — "Thiết kế bảng xếp hạng cho 500.000 người chơi"

> Hai quyết định tách nhau: **lưu ở đâu** và **hiện thế nào**.
>
> Lưu: Postgres là **nguồn chân lý** của điểm, Redis ZSET để đọc nhanh vì `ZREVRANK` là O(log N). ZSET chỉ chứa `user_id` và điểm, tên với avatar tra riêng cho trang đang hiển thị. Mất Redis thì dựng lại từ Postgres — chậm vài phút, không mất gì.
>
> Hiện: **không dùng một bảng toàn cục duy nhất**, vì khi đó 99% người chơi không có mốc nào với tới được. Tôi chia bậc hạng làm khung, nhóm khoảng 100 người làm nơi cạnh tranh thật, và mở bảng ở **vị trí của người chơi** với mười trên mười dưới, kèm con số còn bao nhiêu điểm tới mốc kế.
>
> Chốt mùa chạy ở **worker**: đóng băng, chốt hạng xuống Postgres, phát thưởng qua hộp quà, reset một phần — idempotent theo `season_id`.

**Họ sẽ đào tiếp**

- *"Vì sao thưởng cuối mùa phát qua hộp quà?"* → Vì người chơi thấy được mình nhận gì và vì sao, và bạn có bản ghi để tra khi có khiếu nại. Cộng thẳng vào ví thì số dư nhảy mà không có lời giải thích nào đi kèm.
- *"Nhóm quá ít người thì sao?"* → Gộp nhóm hoặc hiện bảng ở bậc trên. Bảng ba người không tạo cảm giác cạnh tranh mà còn cho thấy game vắng — tệ hơn là không có bảng nhóm.
- *"Chưa đủ trận để xếp hạng thì hiện gì?"* → "Chơi thêm N trận để vào bảng" — một mục tiêu rõ ràng, không phải màn trắng. Đây cũng là cơ hội đưa người chơi mới vào vòng lặp.
- *"Phát hiện gian lận thì gỡ khỏi bảng thế nào?"* → Cần công cụ gỡ một tài khoản, và việc gỡ không được làm thứ hạng người khác nhảy theo cách khó hiểu. Thực tế là gỡ rồi thì mọi người dưới đó tiến một bậc, nên nên làm ở thời điểm chốt hoặc kèm thông báo.
- *"Thời điểm chốt mùa có gì đặc biệt?"* → Đó là đỉnh tải: ai cũng vào xem kết quả cùng lúc. Nên chốt vào giờ thấp điểm và chuẩn bị cho đợt quay lại ngay sau đó — nó vừa là rủi ro vận hành vừa là cơ hội giữ chân.

**Cờ đỏ**

- Dùng Redis ZSET làm nơi lưu điểm duy nhất.
- Một bảng toàn cục duy nhất, mở ở top 1.
- `ORDER BY ... LIMIT` trên bảng lớn mỗi lần mở màn.
- Chốt mùa chạy trong process API.
- Job phát thưởng cuối mùa không idempotent.
- Reset điểm về 0 mỗi mùa.
- Không đóng băng bảng khi giao mùa.
- Nhét tên và avatar vào ZSET.

**Số / ví dụ nên thuộc**

- `ZREVRANK` **O(log N)**; lấy dải quanh vị trí O(log N + M).
- Hiển thị mặc định: **10 trên / bản thân / 10 dưới**, mở ở vị trí người chơi.
- Nhóm cạnh tranh: khoảng **50–100 người** cùng mức.
- Chốt mùa: **idempotent theo `season_id`**, thưởng qua hộp quà, reset một phần.

**Kể trong dự án**

- *"Anh làm bảng xếp hạng à?"* → Nêu **quy mô và cách chia hạng**, vì đó là phần cho thấy bạn hiểu vấn đề thật. Bảng xếp hạng không có chia hạng thì chỉ là một truy vấn `ORDER BY`.
- *"Khó khăn gặp phải?"* → Hai mẫu rất thật: Redis restart giữa mùa và bảng biến mất — kể cách bạn dựng lại từ Postgres và cách bạn đổi kiến trúc sau đó; hoặc job chốt mùa đứt giữa chừng, chạy lại và một phần người chơi nhận thưởng hai lần.
- *"Anh có đổi cách chia hạng theo số liệu không?"* → Nếu có, đây là câu chuyện tốt: nêu phân bố người chơi theo bậc trước và sau, và vì sao dồn hết vào một bậc là dấu hiệu mốc chia sai. Vòng đo–sửa–đo luôn thuyết phục hơn thiết kế ban đầu.
