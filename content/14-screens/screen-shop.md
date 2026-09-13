---
id: screen-shop
title: Màn hình Shop & IAP
summary: Bán mà không phá cảm giác công bằng — ba loại hàng, luồng IAP sáu bước với verify phía server, đối soát biên nhận, và xử lý mua hụt khi mạng rớt giữa chừng.
status: deep
read: 1130
level: advanced
order: 30
tags: [screens, shop, iap, monetization, payment]
related: [screens, economy-design, game-database, screen-piggybank]
---

Shop là màn duy nhất trong game có **tiền thật đi qua**, nên nó có một ràng buộc không màn nào khác có: sai một lần là người chơi mất tiền thật, và bạn phải xử lý bằng quy trình hỗ trợ chứ không bằng một bản vá.

Nguyên lý kinh tế nằm ở [[economy-design]]. Node này nói về màn hình và **luồng thanh toán**.

## Ô 1 — Mục tiêu

> Người chơi tìm được thứ họ đang thiếu, hiểu mình trả gì để được gì, và giao dịch **không bao giờ** rơi vào trạng thái nửa vời.

Vế cuối là vế kỹ thuật, và nó chiếm phần lớn công sức của màn này.

## Ô 2 — Ba loại hàng, ba cách bày

| Loại | Ví dụ | Cách bày |
|---|---|---|
| **Tiền tệ cứng** (mua bằng tiền thật) | Gói đá quý | Bậc thang giá, mỗi bậc ghi rõ số lượng và phần thưởng thêm |
| **Vật phẩm** (mua bằng tiền trong game) | Nguyên liệu, vé | Nhóm theo mục đích sử dụng, không nhóm theo độ hiếm |
| **Gói ưu đãi** (giới hạn thời gian/số lượng) | Gói người mới, gói tuần | Có hạn rõ, có so sánh giá trị — xem [[screen-piggybank]] |

Ranh giới quan trọng: **cửa hàng bán tiền thật và cửa hàng tiêu tiền trong game nên tách nhau** về mặt hiển thị, kể cả khi cùng một màn có tab. Trộn lẫn làm người chơi mất khả năng nhẩm chi phí, và đó là kiểu mập mờ về lâu dài phá niềm tin.

Luật một câu cho toàn màn: **không bán thứ phá vỡ cảm giác công bằng.** Bán tốc độ thì được, bán trần sức mạnh thì mất người chơi không trả tiền — mà chính họ là đối thủ, khán giả và cộng đồng của người trả tiền.

## Ô 3 — Dữ liệu

| Dữ liệu | Nguồn | Ghi chú |
|---|---|---|
| Danh sách hàng, giá trong game | **Master data có version** | Đổi hằng tuần, không build lại |
| Giá tiền thật | **Store** (App Store / Google Play) | **Không** lấy từ master data |
| Đã mua gì, giới hạn còn lại | Server | Gói giới hạn phải đếm ở server |
| Số dư | Server | Client hiển thị, không tự trừ |

Dòng thứ hai hay bị làm sai và hậu quả rất khó chịu: **giá tiền thật phải lấy từ store**, không phải từ cấu hình của bạn. Store quyết giá theo quốc gia, theo tỉ giá, theo thuế. Hiển thị giá tự khai nghĩa là người chơi thấy một con số ở màn shop và một con số khác ở hộp thoại thanh toán.

## Ô 4 — Luồng IAP sáu bước

<figure class="fig">
<svg viewBox="0 0 680 250" role="img" aria-label="Luồng mua hàng trong ứng dụng sáu bước: client hỏi danh mục từ store, người chơi bấm mua, store xử lý thanh toán và trả biên nhận, client gửi biên nhận lên server, server xác minh với store rồi cộng vật phẩm trong một transaction, cuối cùng client xác nhận hoàn tất với store">
  <defs>
    <marker id="shp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="14"  y="40"  width="120" height="52" rx="9" class="fig-box"/>
    <rect x="164" y="40"  width="120" height="52" rx="9" class="fig-box"/>
    <rect x="314" y="40"  width="120" height="52" rx="9" class="fig-box"/>
    <rect x="464" y="40"  width="120" height="52" rx="9" class="fig-box"/>
    <rect x="164" y="150" width="120" height="52" rx="9" class="fig-box"/>
    <rect x="314" y="150" width="120" height="52" rx="9" class="fig-box"/>
    <rect x="464" y="150" width="120" height="52" rx="9" class="fig-box"/>
  </g>
  <text x="74"  y="62"  text-anchor="middle" class="fig-label" font-size="11">1 · Lấy danh mục</text>
  <text x="74"  y="80"  text-anchor="middle" class="fig-muted" font-size="9">giá từ store</text>
  <text x="224" y="62"  text-anchor="middle" class="fig-label" font-size="11">2 · Người chơi mua</text>
  <text x="224" y="80"  text-anchor="middle" class="fig-muted" font-size="9">khoá nút ngay</text>
  <text x="374" y="62"  text-anchor="middle" class="fig-label" font-size="11">3 · Store thu tiền</text>
  <text x="374" y="80"  text-anchor="middle" class="fig-muted" font-size="9">trả biên nhận</text>
  <text x="524" y="62"  text-anchor="middle" class="fig-label" font-size="11">4 · Gửi lên server</text>
  <text x="524" y="80"  text-anchor="middle" class="fig-muted" font-size="9">kèm request_id</text>
  <text x="524" y="172" text-anchor="middle" class="fig-label" font-size="11">5 · Server VERIFY</text>
  <text x="524" y="190" text-anchor="middle" class="fig-muted" font-size="9">hỏi thẳng store</text>
  <text x="374" y="172" text-anchor="middle" class="fig-label" font-size="11">6 · Cộng vật phẩm</text>
  <text x="374" y="190" text-anchor="middle" class="fig-muted" font-size="9">một transaction</text>
  <text x="224" y="172" text-anchor="middle" class="fig-label" font-size="11">7 · Xác nhận store</text>
  <text x="224" y="190" text-anchor="middle" class="fig-muted" font-size="9">finish / consume</text>
  <g stroke="#6ea8fe" stroke-width="1.8" marker-end="url(#shp-a)" fill="none">
    <path d="M134 66 H160"/>
    <path d="M284 66 H310"/>
    <path d="M434 66 H460"/>
    <path d="M524 92 V146"/>
    <path d="M464 176 H438"/>
    <path d="M314 176 H288"/>
  </g>
  <text x="340" y="228" text-anchor="middle" class="fig-muted" font-size="10">Bước 7 chỉ chạy SAU khi server đã cộng đồ xong. Xác nhận sớm là mất tiền của người chơi.</text>
</svg>
<figcaption>Biên nhận từ store là bằng chứng duy nhất đáng tin. Client nói "tôi đã mua" thì không có giá trị gì.</figcaption>
</figure>

Ba luật của luồng này:

1. **Verify ở server, hỏi thẳng store.** Không bao giờ tin biên nhận do client tự khai. Đây là lỗ hổng bị khai thác nhiều nhất trong game mobile.
2. **Transaction id lưu `UNIQUE`.** Cùng một biên nhận gửi lại lần hai không được cộng đồ lần hai — xem [[game-database]].
3. **Chỉ xác nhận với store sau khi đã cộng đồ xong.** Xác nhận trước là store coi giao dịch hoàn tất trong khi người chơi chưa nhận gì, và bạn mất luôn khả năng thử lại.

## Ô 5 — Giao dịch treo: phần ai cũng quên

Mạng rớt giữa bước 3 và 4 là chuyện xảy ra hằng ngày. Store đã thu tiền, server chưa biết gì. Nếu không xử lý, người chơi mất tiền thật.

Giải pháp là **khôi phục giao dịch treo lúc mở app**:

```
Mở app → hỏi store: có giao dịch nào chưa xác nhận không?
       → có → gửi biên nhận lên server (cùng request_id đã lưu)
       → server verify, cộng đồ nếu chưa cộng
       → xác nhận với store
```

Đây là lý do bước 7 phải đứng sau bước 6: giao dịch chưa xác nhận với store thì store còn giữ nó, và bạn còn cơ hội sửa. Xác nhận sớm là mất dấu vĩnh viễn.

Kèm theo: **lưu `request_id` xuống đĩa trước khi gọi store**, để lần mở app sau vẫn dùng đúng id đó — xem hàng đợi ở [[unity-network-client]].

## Ô 6 — Trạng thái rỗng và lỗi

| Trạng thái | Hiện gì |
|---|---|
| Không lấy được danh mục từ store | Ẩn tab tiền thật, **không** hiện giá tự khai |
| Người chơi huỷ ở hộp thoại thanh toán | Im lặng quay lại, không báo lỗi — huỷ là lựa chọn hợp lệ |
| Thanh toán thất bại | Thông báo đúng lý do store trả về, không phải "Lỗi không xác định" |
| Verify thất bại | **Không** cộng đồ, ghi log đầy đủ, hướng dẫn liên hệ hỗ trợ |
| Gói đã hết lượt mua | Xám đi kèm lý do, không ẩn đột ngột |
| Mua xong nhưng chưa nhận được | "Đang xử lý", tự thử lại; sau vài lần thì chỉ tới hỗ trợ |

Dòng thứ hai đáng nói: rất nhiều game báo lỗi khi người chơi bấm huỷ. Huỷ không phải lỗi.

## Ô 7 — Số liệu

- **Tỉ lệ chuyển đổi theo bước**: mở shop → chạm gói → mở hộp thoại → hoàn tất. Bước rơi nhiều nhất cho biết vấn đề nằm ở đâu.
- **Tỉ lệ verify thất bại** — cao bất thường nghĩa là hoặc có người thử gian lận, hoặc code verify sai.
- **Số giao dịch treo mỗi ngày** — phải gần 0. Không phải 0 tuyệt đối, vì mạng luôn rớt.
- **Doanh thu theo gói** — gói không ai mua thì nó đang chiếm chỗ.

## Ô 8 — Vận hành

- Danh sách gói, thứ tự, nhãn "phổ biến nhất" đổi được từ server.
- Bật/tắt một gói mà không cần build — cần khi phát hiện gói có giá sai.
- **Không bao giờ tắt cả shop** trừ khi buộc phải: đó là màn duy nhất tạo doanh thu, và nằm trong nhóm không kéo cầu dao ở [[project-launch]].

## Bẫy thường gặp

- **Verify ở client.** Lỗ hổng bị khai thác nhiều nhất; công cụ giả biên nhận có sẵn công khai.
- **Không lưu transaction id `UNIQUE`.** Cùng biên nhận cộng đồ nhiều lần.
- **Xác nhận với store trước khi cộng đồ.** Mất dấu giao dịch vĩnh viễn.
- **Không khôi phục giao dịch treo lúc mở app.** Người chơi mất tiền thật, và bạn chỉ biết qua khiếu nại.
- **Hiển thị giá tự khai.** Lệch với giá trong hộp thoại thanh toán.
- **Báo lỗi khi người chơi bấm huỷ.**
- **Cộng đồ trước rồi verify sau** cho "mượt". Đây là mời gọi gian lận.
- **Gói giới hạn đếm ở client.** Sửa bộ nhớ là mua vô hạn.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho shop và IAP**

Phần UI thì giao được. Phần **verify và transaction thì phải tự đọc từng dòng** — đây là chỗ sai thì mất tiền thật của người chơi hoặc của công ty.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Sinh UI danh mục | Khi đã có hợp đồng | "Viết màn shop đọc danh sách từ master data, giá từ store SDK" |
| Soạn luồng trạng thái | Trước khi code IAP | "Vẽ máy trạng thái đầy đủ của một giao dịch IAP, kể cả nhánh treo" |
| Soi lỗ hổng | Sau khi có code | "Người chơi giả được biên nhận thì luồng này chặn ở đâu?" |
| Viết test | Trước phát hành | "Viết test cho: mua hai lần cùng biên nhận, mạng rớt sau khi store thu tiền" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Store nào**: App Store, Google Play, hay cả hai — luồng verify khác nhau.
- **Loại sản phẩm**: tiêu hao, không tiêu hao, hay thuê bao — vòng đời khác hẳn.
- **Có server verify không** — nếu AI không biết là có, nó sẽ viết luồng client-only.
- **Gói giới hạn đếm ở đâu** — phải là server.

**Mẫu prompt**

```
Unity, IAP qua Google Play + App Store. Sản phẩm tiêu hao (gói đá quý).
Server Go có endpoint verify, Postgres có bảng iap_tx với transaction_id UNIQUE.

Việc 1: vẽ máy trạng thái đầy đủ của một giao dịch, gồm cả nhánh: người chơi huỷ,
mạng rớt sau khi store thu tiền, verify thất bại, app bị tắt giữa chừng.
Việc 2: viết handler verify phía Go: hỏi store, kiểm transaction_id đã tồn tại chưa,
cộng vật phẩm và ghi sổ cái trong MỘT transaction.
Việc 3: viết luồng khôi phục giao dịch treo lúc mở app phía Unity.

Ràng buộc:
- KHÔNG bao giờ tin biên nhận client tự khai — luôn hỏi thẳng store.
- Xác nhận (consume/finish) với store CHỈ SAU KHI server đã cộng đồ xong.
- request_id lưu xuống đĩa TRƯỚC khi gọi store, để mở app sau còn dùng đúng id.
- Giá hiển thị lấy từ store SDK, KHÔNG từ master data.
```

**Bẫy thường gặp:** AI viết luồng IAP theo mẫu phổ biến nhất trên mạng — client mua, client cộng đồ, xong — vì đó là mẫu ngắn nhất và nó chạy được trong demo. Bẫy thứ hai: nó gọi `ConfirmPendingPurchase` ngay sau khi store trả về thành công, trước khi server kịp cộng đồ. Bẫy thứ ba: nó bỏ hẳn nhánh khôi phục giao dịch treo vì đó là nhánh không xuất hiện trong đường thành công.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao giá tiền thật phải lấy từ store chứ không từ cấu hình của mình?**
  → Vì store quyết giá theo quốc gia, tỉ giá và thuế. Hiển thị giá tự khai nghĩa là người chơi thấy một con số ở màn shop và một con số khác trong hộp thoại thanh toán — vừa mất niềm tin vừa là vấn đề với chính sách của store.
- `Junior` **Người chơi bấm huỷ ở hộp thoại thanh toán thì hiện gì?**
  → Không hiện gì cả, im lặng quay lại màn shop. Huỷ là một lựa chọn hợp lệ, không phải lỗi. Rất nhiều game báo "giao dịch thất bại" ở đây và nó làm người chơi tưởng có chuyện gì sai với tài khoản của họ.
- `Mid` **Luồng IAP đi qua những bước nào?**
  → Lấy danh mục và giá từ store; người chơi bấm mua, khoá nút ngay; store thu tiền và trả **biên nhận**; client gửi biên nhận lên server kèm `request_id`; **server verify bằng cách hỏi thẳng store** rồi cộng vật phẩm trong một transaction; cuối cùng client mới xác nhận với store. Thứ tự hai bước cuối là thứ tự quan trọng nhất trong cả luồng.
- `Mid` **Vì sao xác nhận với store phải là bước cuối?**
  → Vì chừng nào chưa xác nhận thì store còn giữ giao dịch đó, và lần mở app sau bạn còn hỏi lại được để xử lý. Xác nhận sớm là store coi như xong trong khi người chơi chưa nhận gì — mất dấu vĩnh viễn, và cách duy nhất còn lại là xử lý thủ công qua hỗ trợ.
- `Senior` **Mạng rớt ngay sau khi store thu tiền, trước khi server biết. Xử lý thế nào?**
  → Bằng **khôi phục giao dịch treo lúc mở app**: hỏi store còn giao dịch nào chưa xác nhận không, gửi biên nhận lên server với đúng `request_id` đã lưu xuống đĩa từ trước, server verify và cộng đồ nếu chưa cộng, rồi mới xác nhận với store. Không có luồng này thì người chơi mất tiền thật và bạn chỉ biết qua khiếu nại.
- `Senior` **Bán gì thì phá vỡ game?**
  → Bán **trần sức mạnh**. Bán tốc độ — rút ngắn thời gian chờ, thêm lượt chơi, đồ trang trí — thì người không trả tiền vẫn tới được đích, chỉ chậm hơn. Bán trần thì họ không bao giờ tới, và mất họ là mất luôn đối thủ, khán giả và cộng đồng của chính người trả tiền.

**Khung trả lời 60 giây** — "Kể luồng IAP anh đã làm"

> Sáu bước, và điểm quyết định nằm ở hai bước cuối. Client lấy danh mục **và giá từ store SDK** chứ không từ cấu hình của mình. Người chơi bấm mua, tôi khoá nút ngay. Store thu tiền và trả về biên nhận.
>
> Client gửi biên nhận lên server kèm `request_id` đã lưu xuống đĩa **trước khi** gọi store. **Server verify bằng cách hỏi thẳng store** — không bao giờ tin biên nhận client tự khai — rồi cộng vật phẩm và ghi sổ cái trong một transaction, với `transaction_id` đặt `UNIQUE` để cùng biên nhận không cộng hai lần.
>
> Chỉ **sau khi** server cộng xong, client mới xác nhận với store. Nhờ thứ tự đó, mạng rớt giữa chừng thì giao dịch vẫn treo ở store, và lần mở app sau tôi hỏi lại rồi xử lý nốt — người chơi không mất tiền.

**Họ sẽ đào tiếp**

- *"Vì sao không verify ở client?"* → Vì công cụ giả biên nhận có sẵn công khai, và đây là lỗ hổng bị khai thác nhiều nhất trong game mobile. Biên nhận chỉ có giá trị khi chính store xác nhận nó với server của bạn.
- *"Cùng một biên nhận gửi hai lần?"* → `transaction_id` đặt `UNIQUE` trong database, và việc ghi nó nằm trong cùng transaction với việc cộng đồ. Lần thứ hai đụng ràng buộc nên không cộng lại, server trả về kết quả của lần đầu.
- *"Gói giới hạn mua đếm ở đâu?"* → Server. Đếm ở client thì sửa bộ nhớ là mua vô hạn. Và phần đếm phải nằm trong cùng transaction với giao dịch, nếu không hai request song song cùng lọt qua.
- *"Đo gì ở màn shop?"* → Tỉ lệ chuyển đổi theo từng bước để biết người chơi rơi ở đâu, tỉ lệ verify thất bại — cao bất thường là có người thử gian lận hoặc code verify sai, và **số giao dịch treo mỗi ngày**, phải gần 0 nhưng không bao giờ đúng 0 vì mạng luôn rớt.
- *"Có bao giờ tắt shop không?"* → Gần như không, vì đó là màn duy nhất tạo doanh thu và nó nằm ngoài danh sách cầu dao. Cái tôi cần là tắt được **từng gói** khi phát hiện giá sai hoặc nội dung sai, chứ không phải tắt cả màn.

**Cờ đỏ**

- Verify biên nhận ở client, hoặc tin biên nhận client gửi lên.
- Cộng vật phẩm trước, verify sau.
- `ConfirmPendingPurchase` ngay khi store trả về thành công.
- Không có luồng khôi phục giao dịch treo.
- Hiển thị giá tiền thật lấy từ cấu hình game.
- Gói giới hạn đếm ở client.
- Báo lỗi khi người chơi bấm huỷ.
- "Chúng tôi bán vật phẩm mạnh nhất game, vì đó là thứ người ta muốn mua."

**Số / ví dụ nên thuộc**

- Sáu bước IAP, và **xác nhận với store là bước cuối cùng**.
- `transaction_id` `UNIQUE` + `request_id` lưu xuống đĩa trước khi gọi store.
- Số giao dịch treo mỗi ngày: gần **0**, không bao giờ đúng 0.
- Bán **tốc độ**, không bán **trần sức mạnh**.

**Kể trong dự án**

- *"Anh làm phần thanh toán à?"* → Đây là phần kể nặng ký nhất vì nó chạm tiền thật. Nêu rõ bạn làm phía nào — client SDK, server verify, hay cả hai — và bạn xử lý nhánh treo thế nào.
- *"Khó khăn gặp phải?"* → Mẫu rất thật và rất hay gặp: khiếu nại "đã trừ tiền mà không nhận được đá quý". Kể quá trình lần ra là thiếu luồng khôi phục giao dịch treo, cách bạn đối soát biên nhận với store để trả đồ cho đúng người, và luồng bạn thêm vào để không lặp lại.
- *"Anh có phải đối soát doanh thu không?"* → Nếu có, kể cách bạn so số của store với sổ cái trong database, và bạn làm gì khi hai bên lệch. Câu này lộ ngay ai đã vận hành hệ thống có tiền thật và ai mới chỉ viết code cho nó.
