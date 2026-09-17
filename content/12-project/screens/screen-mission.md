---
id: screen-mission
title: Màn hình Nhiệm vụ & Battle Pass
summary: Cho lý do quay lại hôm nay mà không biến game thành nghĩa vụ — ba tầng nhiệm vụ, tiến độ tính ở server theo sự kiện, mốc reset theo giờ server, và luật nhận thưởng không mất.
status: deep
read: 986
level: intermediate
order: 40
tags: [screens, mission, quest, battle-pass, retention]
related: [screens, meta-systems, screen-home, game-database]
---

Nhiệm vụ là hệ thống **rẻ nhất để tăng giữ chân** và cũng là hệ thống dễ làm hỏng trải nghiệm nhất. Ranh giới rất mỏng: cho người chơi một lý do quay lại là tốt; khiến họ cảm thấy **phải** đăng nhập kẻo mất thứ gì đó là bắt đầu bào mòn.

Nguyên lý ở [[meta-systems]] phần nhiệm vụ định kỳ. Node này nói về màn hình và phần kỹ thuật — mà phần kỹ thuật khó hơn vẻ ngoài rất nhiều, vì nó đụng vào tiến độ tính theo thời gian thực và phần thưởng chảy vào ví.

## Ô 1 — Mục tiêu

> Trong **một màn cuộn**, người chơi thấy: việc nào sắp xong, việc nào nhận được ngay, và phần thưởng lớn tiếp theo cách bao xa.

Ba thứ đó theo đúng thứ tự. "Sắp xong" trước "nhận được" vì nó tạo động lực chơi tiếp; nếu đảo lại thì người chơi nhận thưởng rồi thoát app.

## Ô 2 — Ba tầng, đừng nhiều hơn

| Tầng | Nhịp | Số lượng | Vai trò |
|---|---|---|---|
| **Hằng ngày** | Reset mỗi ngày | 3–5 việc | Lý do mở app hôm nay |
| **Hằng tuần** | Reset mỗi tuần | 3–5 việc | Giữ người chơi bận rộn không bị phạt vì bỏ một ngày |
| **Mùa / Battle Pass** | 4–8 tuần | Một thanh tiến độ dài | Mục tiêu xa, và là thứ bán được |

Ba tầng là đủ. Thêm tầng thứ tư — sự kiện, thành tựu, nhiệm vụ nhân vật — thì màn thành một danh sách việc phải làm, và cảm giác nghĩa vụ bắt đầu.

Luật giảm áp lực, đáng làm và ít tốn: **nhiệm vụ tuần không yêu cầu chơi đủ bảy ngày.** Đặt mục tiêu tuần ở mức chơi 4–5 ngày là đạt. Người bận vẫn về đích, người chơi nhiều vẫn có thứ để làm.

## Ô 3 — Dữ liệu

| Dữ liệu | Nguồn | Ghi chú |
|---|---|---|
| Định nghĩa nhiệm vụ, phần thưởng | **Master data có version** | Đổi theo đợt, không build lại |
| Tiến độ của người chơi | **Server** | Client chỉ hiển thị |
| Đã nhận thưởng chưa | **Server** | Cột riêng, không suy từ tiến độ |
| Mốc reset | **Giờ server** | Không bao giờ dùng đồng hồ máy |

Dòng thứ ba đáng dừng lại: **"đã hoàn thành" và "đã nhận thưởng" là hai trạng thái khác nhau**, phải lưu riêng. Gộp lại thì không phân biệt được người chơi xong nhiệm vụ mà chưa bấm nhận — và đó chính là trạng thái tạo ra chấm đỏ trên [[screen-home]].

## Ô 4 — Tiến độ tính thế nào

Đây là phần kỹ thuật thật của nhiệm vụ, và có hai cách. Chọn sai là hoặc sai số, hoặc chậm.

| Cách | Làm sao | Ưu | Nhược |
|---|---|---|---|
| **Theo sự kiện** (khuyến nghị) | Mỗi hành động phát một sự kiện; server cộng dồn vào tiến độ | Chính xác, tức thì, một nguồn | Phải định nghĩa sự kiện cẩn thận từ đầu |
| Tính lại khi mở màn | Quét lịch sử để đếm | Không cần sự kiện | Chậm dần theo dữ liệu; khó đếm thứ không lưu lịch sử |

Với cách theo sự kiện, chỗ dễ sai là **sự kiện phải phát ở server**, không phải client. Client báo "tôi vừa thắng một trận" thì nhiệm vụ thắng 10 trận hoàn thành trong ba giây.

Nguyên tắc: nhiệm vụ bám vào **thứ server vốn đã biết** — trận kết thúc, giao dịch hoàn tất, cấp tăng. Nhiệm vụ kiểu "mở màn hình X ba lần" bắt buộc phải tin client, nên hoặc tránh, hoặc chấp nhận rằng nó không chống gian lận được và chỉ cho thưởng nhỏ.

## Ô 5 — API

```
GET  /missions                → [{ id, progress, target, claimed, reward }]
POST /missions/claim          → { mission_id, request_id } → { reward, balance_after }
POST /missions/claim-all      → { request_id } → { rewards[], balance_after }
```

Ba điểm:

1. **`claim` bắt buộc có `request_id`** — nó chảy vào ví.
2. **`claim-all` là một transaction**, không phải vòng lặp gọi `claim` N lần. Nửa chừng là người chơi nhận được ba trên năm phần thưởng và không biết vì sao.
3. **Trả về `balance_after`**, client hiển thị số đó.

Nút "Nhận tất cả" là nút đáng đầu tư: nó là nút được bấm nhiều nhất trong màn, và nó cũng là nút dễ gây lỗi nhân đôi nhất.

## Ô 6 — Reset: chỗ sai nhiều nhất

Ba luật:

1. **Mốc reset theo giờ server**, cố định, và **hiện cho người chơi biết** — đếm ngược "còn 3 giờ 20 phút".
2. **Nhiệm vụ đã hoàn thành nhưng chưa nhận thì không mất khi reset.** Người chơi hoàn thành lúc 23h50, reset lúc 0h, chưa kịp bấm nhận — mất phần thưởng là lỗi của hệ thống, không phải của họ. Cách xử lý: phần thưởng chưa nhận chuyển vào [[screen-presentbox]].
3. **Reset là lazy, không phải một job quét toàn bộ.** Khi người chơi mở màn, server so mốc reset gần nhất với lần reset cuối của họ rồi cập nhật. Job quét mọi tài khoản lúc 0h vừa tốn vừa tạo đỉnh tải.

Điểm 2 là điểm phân biệt hệ thống tôn trọng người chơi với hệ thống cẩu thả, và nó gần như không tốn gì để làm đúng.

Về đỉnh tải: reset cùng giờ nghĩa là mọi người mở app cùng lúc. Nếu tải là vấn đề, có thể chia mốc reset theo múi giờ đăng ký của tài khoản — nhưng phải quyết từ đầu, đổi sau là người chơi mất hoặc được thêm một chu kỳ.

## Ô 7 — Trạng thái rỗng và lỗi

| Trạng thái | Hiện gì |
|---|---|
| Người chơi mới, chưa có tiến độ | Hiện nhiệm vụ với tiến độ 0, **không** phải màn rỗng |
| Đã nhận hết hôm nay | Trạng thái tích cực kèm đếm ngược tới reset, gợi ý sang tầng tuần |
| Battle pass chưa mua | Hiện cả hai nhánh thưởng, nhánh trả phí xám và có nhãn rõ |
| Mất mạng | Hiện tiến độ cache, khoá nút nhận, nhãn "đang đồng bộ" |
| Nhận thất bại | Không trừ gì, thử lại cùng `request_id` |

## Ô 8 — Số liệu và vận hành

Đo bốn thứ:

- **Tỉ lệ hoàn tất từng nhiệm vụ.** Dưới 20% nghĩa là nhiệm vụ quá khó hoặc nói không rõ; trên 95% nghĩa là nó không phải mục tiêu mà chỉ là thủ tục.
- **Tỉ lệ bấm "nhận tất cả"** so với nhận lẻ.
- **Tỉ lệ mua battle pass** theo tuần trong mùa — mua muộn nhiều nghĩa là người chơi chờ xem có kịp cày không.
- **Tỉ lệ quay lại ngày hôm sau** của người hoàn thành hết nhiệm vụ so với người không.

Vận hành: định nghĩa nhiệm vụ và phần thưởng đổi từ master data; bật tắt cả tầng từ server để xử lý khi một nhiệm vụ có lỗi.

## Bẫy thường gặp

- **Tiến độ tính ở client.** Nhiệm vụ hoàn thành trong ba giây.
- **Reset theo đồng hồ máy.** Chỉnh giờ là nhận thưởng nhiều lần.
- **Mất phần thưởng đã hoàn thành khi reset.** Lỗi hệ thống mà người chơi chịu.
- **`claim-all` là vòng lặp N request.** Nửa chừng là trạng thái khó giải thích.
- **Gộp "hoàn thành" và "đã nhận" làm một trạng thái.** Mất luôn cơ sở tính chấm đỏ.
- **Job quét toàn bộ tài khoản lúc reset.** Đỉnh tải tự tạo, và nó rơi đúng giờ đông người.
- **Quá nhiều tầng nhiệm vụ.** Game thành danh sách việc phải làm.
- **Nhiệm vụ tuần đòi chơi đủ bảy ngày.** Bỏ một ngày là mất cả tuần, và người chơi bỏ luôn.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho hệ nhiệm vụ**

AI làm tốt phần **định nghĩa sự kiện và máy trạng thái**; nó làm sai phần **cân bằng độ khó** vì không biết nhịp chơi thật của game bạn.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Thiết kế sự kiện | Trước khi code | "Liệt kê tập sự kiện server cần phát để đỡ được các loại nhiệm vụ này" |
| Máy trạng thái | Khi làm UI | "Vẽ trạng thái một nhiệm vụ: chưa xong, xong chưa nhận, đã nhận, hết hạn" |
| Soi lỗ hổng | Sau khi có code | "Chỗ nào người chơi nhận thưởng được hai lần, hoặc đẩy tiến độ giả?" |
| Sinh handler claim | Khi hợp đồng xong | "Viết claim-all: một transaction, idempotent, trả balance_after" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Nhịp chơi thật**: một phiên bao nhiêu phút, ngày mấy phiên — quyết định mục tiêu nhiệm vụ.
- **Sự kiện nào server đã có sẵn** — nhiệm vụ nên bám vào chúng.
- **Reset mấy giờ, theo múi giờ nào.**
- **Phần thưởng chưa nhận khi reset thì đi đâu.**

**Mẫu prompt**

```
Game <thể loại>, phiên 5 phút, người chơi trung bình 3 phiên/ngày.
Server Go đã phát sẵn các sự kiện: match_finished, item_purchased, level_up.
Reset hằng ngày 04:00 giờ server. Phần thưởng chưa nhận khi reset → chuyển vào hộp quà.

Việc 1: thiết kế 5 nhiệm vụ hằng ngày bám vào sự kiện đã có, mục tiêu phù hợp
với 3 phiên/ngày — không nhiệm vụ nào đòi chơi gấp đôi bình thường.
Việc 2: vẽ máy trạng thái một nhiệm vụ và bảng chuyển trạng thái, gồm cả nhánh reset
khi đang ở trạng thái "xong chưa nhận".
Việc 3: viết handler claim-all — MỘT transaction cho mọi phần thưởng, idempotent.

Ràng buộc:
- Tiến độ CHỈ cập nhật từ sự kiện server, không nhận báo cáo từ client.
- "Hoàn thành" và "đã nhận" là hai trường riêng.
- Reset lazy khi người chơi mở màn, KHÔNG job quét toàn bộ tài khoản.
- Nhiệm vụ nào buộc phải tin client thì nói rõ và đề xuất thưởng nhỏ.
```

**Bẫy thường gặp:** AI thiết kế nhiệm vụ đòi hỏi gấp nhiều lần nhịp chơi bình thường — "thắng 20 trận mỗi ngày" cho game phiên 5 phút — vì nó không có số liệu nhịp chơi. Bẫy thứ hai: nó để client báo tiến độ vì như thế đơn giản hơn. Bẫy thứ ba: nó viết `claim-all` thành vòng lặp gọi `claim`, và mỗi lần lặp là một transaction riêng.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao tiến độ nhiệm vụ phải tính ở server?**
  → Vì client báo tiến độ thì người chơi sửa bộ nhớ là hoàn thành mọi nhiệm vụ trong vài giây, mà phần thưởng lại chảy thẳng vào ví. Server cộng dồn tiến độ từ sự kiện nó vốn đã biết — trận kết thúc, giao dịch xong, cấp tăng — nên không có gì để giả.
- `Junior` **"Hoàn thành" và "đã nhận thưởng" có phải một không?**
  → Không, và phải lưu thành hai trường riêng. Người chơi có thể xong nhiệm vụ mà chưa bấm nhận, và chính trạng thái ở giữa đó tạo ra chấm đỏ trên Home. Gộp lại thì mất luôn cơ sở để biết có gì đang chờ người chơi.
- `Mid` **Người chơi hoàn thành nhiệm vụ lúc 23h50, reset lúc 0h, chưa kịp nhận. Xử lý thế nào?**
  → Phần thưởng **không được mất** — đó là lỗi của hệ thống chứ không phải của họ. Cách tôi làm là chuyển phần thưởng chưa nhận vào hộp quà khi reset. Gần như không tốn gì để làm đúng, và nó là ranh giới giữa hệ thống tôn trọng người chơi với hệ thống cẩu thả.
- `Mid` **Reset nên chạy bằng job quét hay lazy?**
  → Lazy: khi người chơi mở màn, server so mốc reset gần nhất với lần reset cuối của họ rồi cập nhật. Job quét toàn bộ tài khoản lúc 0h vừa tốn vừa tạo đỉnh tải đúng lúc đông người — và nếu job đó chạy chung process với API thì nó ăn hết pool kết nối, gây lag cho cả người đang chơi.
- `Senior` **Đo gì để biết một nhiệm vụ được thiết kế tốt?**
  → Tỉ lệ hoàn tất của từng nhiệm vụ. Dưới 20% nghĩa là quá khó hoặc mô tả không rõ; trên 95% nghĩa là nó không phải mục tiêu mà chỉ là thủ tục người chơi làm cho xong. Cộng thêm so sánh tỉ lệ quay lại hôm sau giữa nhóm hoàn thành hết và nhóm không — đó mới là câu trả lời cho việc hệ nhiệm vụ có đáng tồn tại không.
- `Senior` **Ranh giới giữa động lực và nghĩa vụ nằm ở đâu?**
  → Ở chỗ người chơi cảm thấy **mất gì khi bỏ một ngày**. Ba tầng là đủ, thêm tầng thứ tư là màn thành danh sách việc phải làm. Và luật tôi luôn áp: **nhiệm vụ tuần không đòi chơi đủ bảy ngày** — đặt mục tiêu ở mức 4–5 ngày là đạt, để người bận vẫn về đích. Hệ thống trừng phạt việc vắng mặt sẽ đuổi đúng nhóm người chơi bận rộn.

**Khung trả lời 60 giây** — "Thiết kế hệ nhiệm vụ hằng ngày"

> Ba tầng, không hơn: hằng ngày 3–5 việc làm lý do mở app hôm nay, hằng tuần 3–5 việc để người bỏ một ngày không bị phạt, và một thanh tiến độ mùa dài 4–8 tuần làm mục tiêu xa.
>
> Về kỹ thuật, tiến độ **cộng dồn ở server từ sự kiện** — trận kết thúc, giao dịch xong, cấp tăng — chứ không nhận báo cáo từ client. Và tôi tách hai trường "hoàn thành" với "đã nhận", vì trạng thái ở giữa chính là thứ sinh ra chấm đỏ trên Home.
>
> Reset theo **giờ server**, chạy lazy khi người chơi mở màn chứ không quét toàn bộ tài khoản. Và phần thưởng đã hoàn thành mà chưa kịp nhận thì chuyển vào hộp quà — người chơi xong lúc 23h50 không đáng bị mất vì reset lúc 0h.

**Họ sẽ đào tiếp**

- *"Nhiệm vụ nên bám vào cái gì?"* → Thứ server vốn đã biết. Nhiệm vụ kiểu "mở màn hình X ba lần" buộc phải tin client, nên hoặc tránh hẳn, hoặc chấp nhận nó không chống gian lận được và chỉ cho thưởng nhỏ.
- *"`claim-all` viết thế nào?"* → Một transaction cho toàn bộ phần thưởng, kèm `request_id`, trả về `balance_after`. Không phải vòng lặp gọi `claim` N lần — nửa chừng thì người chơi nhận ba trên năm và không hiểu vì sao. Đây cũng là nút được bấm nhiều nhất màn nên đáng làm kỹ nhất.
- *"Đỉnh tải lúc reset thì sao?"* → Reset cùng giờ nghĩa là mọi người mở app cùng lúc. Nếu tải thành vấn đề thì chia mốc reset theo múi giờ của tài khoản — nhưng phải quyết từ đầu, vì đổi sau là có người mất hoặc được thêm một chu kỳ.
- *"Battle pass khác nhiệm vụ thường chỗ nào?"* → Nó là tầng dài và là thứ bán được, nên màn phải hiện **cả hai nhánh thưởng** ngay từ đầu — nhánh miễn phí và nhánh trả phí xám đi — để người chơi thấy mình đang bỏ lỡ gì. Và cần đo tỉ lệ mua theo tuần: mua muộn nhiều nghĩa là người chơi đang chờ xem có cày kịp không, tức là ngưỡng đang quá cao.
- *"Nhiệm vụ đổi nội dung có cần build lại không?"* → Không. Định nghĩa và phần thưởng nằm trong master data có version, và phải tắt được cả một tầng từ server để xử lý khi một nhiệm vụ có lỗi.

**Cờ đỏ**

- Client báo tiến độ lên server.
- Reset theo đồng hồ máy.
- Mất phần thưởng đã hoàn thành khi reset.
- `claim-all` là vòng lặp N request.
- Job quét mọi tài khoản lúc reset, chạy chung process với API.
- Năm, sáu tầng nhiệm vụ cùng lúc.
- Nhiệm vụ tuần yêu cầu đăng nhập đủ bảy ngày.
- Không biết tỉ lệ hoàn tất của từng nhiệm vụ.

**Số / ví dụ nên thuộc**

- Ba tầng: ngày (**3–5 việc**) · tuần (**3–5 việc**) · mùa (**4–8 tuần**).
- Tỉ lệ hoàn tất lành mạnh: không dưới **20%**, không trên **95%**.
- Nhiệm vụ tuần nên đạt được khi chơi **4–5 trong 7 ngày**.
- Reset **lazy theo giờ server**, không job quét toàn bộ.

**Kể trong dự án**

- *"Anh làm hệ nhiệm vụ à?"* → Nêu **cách tính tiến độ** trước tiên, vì đó là phần kỹ thuật thật. Kể tập sự kiện bạn định nghĩa và vì sao chọn chúng.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: khiếu nại mất phần thưởng quanh mốc reset, số lượng nhỏ nên dễ bị bỏ qua. Kể cách bạn tái hiện bằng cách đặt giờ máy chủ test sát mốc, và giải pháp chuyển thưởng chưa nhận vào hộp quà.
- *"Anh có đổi thiết kế nhiệm vụ theo số liệu chưa?"* → Nếu có, đây là câu chuyện tốt: nêu nhiệm vụ có tỉ lệ hoàn tất bất thường, giả thuyết của bạn, thay đổi đã làm, và số sau đó. Vòng đo–sửa–đo là thứ người phỏng vấn muốn nghe hơn là thiết kế ban đầu.
