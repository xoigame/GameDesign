---
id: screen-piggybank
title: Màn hình Piggy Bank & gói ưu đãi
summary: Biến việc chơi nhiều thành lý do mua đúng một lần — luật tích luỹ, trần heo, giá trị hiển thị trung thực, và ranh giới giữa ưu đãi có sức thuyết phục và ưu đãi gây áp lực.
status: deep
read: 988
level: advanced
order: 60
tags: [screens, piggybank, offer, monetization, retention]
related: [screens, screen-shop, economy-design, liveops]
---

Piggy bank — con heo đất — là một trong những cơ chế bán hàng hiệu quả nhất trong game mobile, và cũng là cơ chế **dễ trượt sang mập mờ** nhất.

Ý tưởng rất đơn giản: người chơi chơi, heo tích tiền, tiền trong heo thấy được nhưng chưa lấy được. Muốn đập heo thì trả một khoản. Nó chuyển câu hỏi *"tôi có nên mua đá quý không"* thành *"tôi có nên **lấy** số đá quý mình đã kiếm được không"* — hai câu hỏi khác nhau về tâm lý, dù giống nhau về giao dịch.

Chính vì hiệu quả nên nó cần luật rõ ràng. Node này nói cả cách làm và ranh giới.

## Ô 1 — Mục tiêu

> Người chơi thấy phần thưởng mình **đã tích được**, hiểu chính xác phải trả gì để lấy, và quyết định trong một màn — không có gì bị giấu.

Vế cuối là vế quyết định. Piggy bank làm đúng là một lời mời hấp dẫn; làm sai là một cái bẫy, và người chơi nhận ra rất nhanh.

## Ô 2 — Ba cơ chế, đừng lẫn lộn

| Cơ chế | Cách hoạt động | Cảm giác |
|---|---|---|
| **Piggy bank** | Chơi → tích dần → trả tiền để lấy | "Tiền của tôi, tôi chỉ trả phí lấy ra" |
| **Gói giới hạn thời gian** | Giá tốt, còn 48 giờ | "Cơ hội sắp hết" |
| **Gói tiến trình** | Mở khoá khi đạt cấp/mốc | "Tôi vừa xứng đáng với cái này" |

Ba cái này thường nằm chung một khu vực trên [[screen-home]] và hay bị gộp làm một trong đầu người làm. Chúng khác nhau ở **nguồn động lực**: cái đầu dựa vào công sức đã bỏ ra, cái giữa dựa vào khan hiếm, cái cuối dựa vào cảm giác xứng đáng.

Dùng cả ba cùng lúc, liên tục, là cách chắc chắn khiến game trông như một cửa hàng. Chọn một cái làm chính.

## Ô 3 — Luật tích luỹ

Bốn quyết định phải chốt trước khi code:

1. **Tích từ đâu?** Nên bám vào **hành động có ý nghĩa** — thắng trận, hoàn thành nhiệm vụ — chứ không phải thời gian mở app. Tích theo thời gian biến game thành nơi để mở rồi bỏ đó.
2. **Trần heo là bao nhiêu?** Phải có trần, và nên **hiện rõ**. Heo đầy mà người chơi vẫn chơi tiếp thì phần tích thêm mất đi — đó là lúc cơ chế quay sang trừng phạt người chơi chăm chỉ.
3. **Heo đầy thì sao?** Ba lựa chọn: dừng tích (rõ ràng nhất), tiếp tục tích vào heo thứ hai, hoặc tự nhắc đập. Lựa chọn tệ nhất là im lặng bỏ mất.
4. **Đập rồi thì sao?** Heo mới bắt đầu từ 0, hay có bậc cao hơn? Bậc thang cho cảm giác tiến bộ nhưng phải minh bạch về giá mỗi bậc.

**Trần heo là chỗ dễ trượt nhất.** Nếu heo đầy sớm và người chơi không biết, họ tiếp tục chơi mà không tích thêm gì — và khi phát hiện ra, cảm giác là bị lừa. Hiện thanh tiến độ và cảnh báo khi gần đầy là bắt buộc, không phải tuỳ chọn.

## Ô 4 — Hiển thị giá trị: ranh giới trung thực

Đây là ranh giới giữa marketing và mập mờ. Ba luật:

| Được | Không nên |
|---|---|
| "Nhận 1.200 đá quý với giá 99.000đ" | So sánh với một mức giá chưa từng bán |
| "Tiết kiệm 40% so với gói lẻ cùng lượng" — và gói lẻ đó **có thật, đang bán** | "Trị giá 500.000đ" cho thứ không mua riêng được |
| Đếm ngược hạn thật | Đếm ngược lặp lại vô hạn, hết rồi lại hiện |
| Hiện rõ đây là giao dịch tiền thật | Làm nút đập heo trông như nút nhận thưởng miễn phí |

Dòng cuối bên phải là lỗi nghiêm trọng nhất và nó xảy ra thường xuyên: nút đập heo có hình giống nút nhận quà, và người chơi — đặc biệt là trẻ em — bấm nhầm vào hộp thoại thanh toán. Đây vừa là vấn đề đạo đức vừa là rủi ro với chính sách của store.

Nguyên tắc kiểm tra nhanh: **nếu người chơi biết rõ mọi thứ mà vẫn thấy đáng mua thì đó là ưu đãi tốt. Nếu nó chỉ hiệu quả khi họ không để ý, thì đó là bẫy.**

## Ô 5 — Dữ liệu và API

| Dữ liệu | Nguồn |
|---|---|
| Số đã tích, trần | **Server** — client chỉ hiển thị |
| Giá đập heo | **Store** (là IAP) — xem [[screen-shop]] |
| Cấu hình: tỉ lệ tích, trần, bậc | **Master data có version** |
| Đã mua gói giới hạn chưa | Server, đếm ở server |

```
GET  /piggybank          → { current, cap, tier, product_id }
POST /piggybank/break    → luồng IAP đầy đủ, xem screen-shop
```

Điểm mấu chốt: **đập heo là một giao dịch IAP bình thường**, nên nó đi qua đúng luồng sáu bước với verify phía server, `transaction_id` `UNIQUE`, và khôi phục giao dịch treo. Không có lối tắt nào ở đây.

Và: **số tích luỹ phải cộng ở server từ sự kiện**, giống tiến độ nhiệm vụ ở [[screen-mission]]. Client cộng thì heo đầy trong ba giây.

## Ô 6 — Trạng thái rỗng và lỗi

| Trạng thái | Hiện gì |
|---|---|
| Heo trống (người mới) | Giải thích cơ chế một lần, không nài nỉ |
| Đang tích | Thanh tiến độ + số hiện tại + trần |
| Gần đầy | Cảnh báo rõ, gợi ý đập |
| Đầy | Trạng thái nổi bật, nói rõ **đang không tích thêm** |
| Đã đập, đang chờ verify | "Đang xử lý", không cho bấm lại |
| Verify thất bại | Heo **giữ nguyên số**, không mất gì, chỉ tới hỗ trợ |

Dòng cuối là dòng bảo vệ bạn khỏi khủng hoảng niềm tin: nếu verify thất bại mà heo đã bị reset thì người chơi mất cả tiền lẫn phần tích luỹ. Heo chỉ được reset **sau khi** server xác nhận giao dịch thành công.

## Ô 7 — Số liệu

- **Tỉ lệ đập theo mức đầy** — nếu hầu hết chỉ đập khi 100% đầy thì trần đang quá cao hoặc giá quá cao.
- **Thời gian trung bình để đầy** — quá nhanh thì mất cảm giác tích luỹ, quá chậm thì người chơi quên.
- **Tỉ lệ người chơi có heo đầy mà không đập trong 7 ngày** — nhóm này đang bị cơ chế trừng phạt vì không tích thêm được.
- **Tỉ lệ mua lần đầu qua piggy bank** so với qua shop thường — piggy bank thường là cửa ngõ chuyển đổi tốt hơn.

Chỉ số thứ ba là chỉ số đạo đức lẫn kinh doanh: nhóm đó đang chơi mà không nhận được gì thêm, và họ sẽ nhận ra.

## Ô 8 — Vận hành

- Tỉ lệ tích, trần, giá bậc đều từ master data.
- Bật/tắt toàn bộ cơ chế từ server — cần khi phát hiện cấu hình sai.
- **Đổi trần hoặc tỉ lệ tích giữa chừng phải rất cẩn thận**: người đang tích dở sẽ thấy con số nhảy. Cách an toàn là áp dụng cho chu kỳ heo tiếp theo, không áp lên heo đang có.

## Bẫy thường gặp

- **Tích ở client.** Heo đầy trong ba giây.
- **Reset heo trước khi verify xong.** Người chơi mất cả tiền lẫn phần tích.
- **Không hiện trần.** Người chơi chơi tiếp mà không tích thêm, và phát hiện ra thì mất niềm tin.
- **Nút đập trông như nút nhận quà miễn phí.** Bấm nhầm vào thanh toán.
- **So sánh với giá chưa từng bán.** Rủi ro với chính sách store và với người chơi.
- **Đếm ngược lặp vô hạn.** Hết rồi lại hiện — người chơi nhận ra và mất niềm tin vào mọi đếm ngược khác.
- **Ba cơ chế ưu đãi chạy cùng lúc, liên tục.** Game trông như cửa hàng.
- **Đổi tỉ lệ tích khi người chơi đang tích dở.**

## 🤖 Prompt cho AI

**Dùng AI thế nào cho gói ưu đãi**

Cẩn thận ở đây: AI được huấn luyện trên rất nhiều tài liệu marketing, nên nó sẽ đề xuất **các kỹ thuật gây áp lực** một cách tự nhiên — khan hiếm giả, so sánh giá ảo, đếm ngược lặp lại. Nó không có ý xấu, nó chỉ đang lặp lại thứ phổ biến.

Giao cho nó phần cơ chế và code; tự giữ phần ranh giới.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Thiết kế cơ chế tích | Đầu | "Thiết kế luật tích luỹ bám vào sự kiện server, có trần, có cảnh báo gần đầy" |
| Máy trạng thái | Khi làm UI | "Liệt kê trạng thái piggy bank, gồm cả đang chờ verify và verify thất bại" |
| Soi ranh giới | Trước phát hành | "Chỗ nào trong màn này chỉ hiệu quả nếu người chơi KHÔNG để ý?" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Tích từ hành động nào**, không phải từ thời gian.
- **Trần và điều gì xảy ra khi đầy.**
- **Đây là IAP** — phải đi qua luồng verify đầy đủ.
- **Ranh giới bạn không vượt**: không khan hiếm giả, không so sánh giá ảo.

**Mẫu prompt**

```
Piggy bank: tích khi thắng trận và hoàn thành nhiệm vụ (sự kiện server đã có).
Trần 1.200 đá quý. Đập heo là IAP, giá lấy từ store. Server Go + Postgres.

Việc 1: thiết kế luật tích luỹ và bảng lưu trạng thái heo, gồm trần và bậc.
Việc 2: liệt kê MỌI trạng thái màn, đặc biệt: gần đầy, đầy, đang chờ verify, verify thất bại.
Nêu rõ heo bị reset ở đúng thời điểm nào.
Việc 3: rà soát màn này và chỉ ra chỗ nào chỉ hiệu quả khi người chơi KHÔNG để ý.

Ràng buộc:
- Tích cộng ở SERVER từ sự kiện, client chỉ hiển thị.
- Heo CHỈ reset sau khi server xác nhận giao dịch IAP thành công.
- KHÔNG đề xuất khan hiếm giả, đếm ngược lặp lại, hay so sánh với giá chưa từng bán.
- Nút đập phải rõ ràng là giao dịch tiền thật, KHÔNG được giống nút nhận quà.
- Trần phải hiện rõ cho người chơi kèm cảnh báo khi gần đầy.
```

**Bẫy thường gặp:** AI đề xuất đếm ngược "ưu đãi sắp hết" rồi làm mới liên tục, vì đó là mẫu phổ biến trong tài liệu nó học — nhưng người chơi nhận ra sau hai lần và từ đó không tin bất kỳ đếm ngược nào trong game của bạn nữa. Bẫy thứ hai: nó reset heo ngay khi client báo mua thành công, trước khi server verify. Bẫy thứ ba: nó bỏ qua trần hoặc không hiện trần, vì trần làm giảm doanh thu trên giấy — trong khi thực tế nó bảo vệ nhóm người chơi chăm chỉ nhất của bạn.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Piggy bank hoạt động thế nào?**
  → Người chơi chơi, heo tích tiền, số tích thấy được nhưng chưa lấy được; muốn lấy thì trả một khoản qua IAP. Nó chuyển câu hỏi "tôi có nên mua đá quý không" thành "tôi có nên lấy số đá quý mình đã kiếm được không" — cùng một giao dịch nhưng khác hẳn về tâm lý.
- `Junior` **Số tích luỹ nên tính ở đâu?**
  → Server, cộng dồn từ sự kiện server vốn đã biết như thắng trận hay hoàn thành nhiệm vụ. Client cộng thì sửa bộ nhớ là heo đầy trong ba giây, mà đập heo lại là giao dịch tiền thật nên hậu quả không chỉ là mất cân bằng.
- `Mid` **Vì sao heo phải có trần, và vì sao trần phải hiện rõ?**
  → Có trần để cơ chế không tích vô hạn và để tạo thời điểm quyết định. Hiện rõ vì nếu heo đầy mà người chơi không biết, họ tiếp tục chơi mà **không tích thêm gì** — và khi phát hiện ra thì cảm giác là bị lừa. Đó là lúc cơ chế quay sang trừng phạt đúng nhóm người chơi chăm chỉ nhất.
- `Mid` **Verify IAP thất bại sau khi người chơi bấm đập heo. Trạng thái heo thế nào?**
  → **Giữ nguyên, không mất gì.** Heo chỉ được reset sau khi server xác nhận giao dịch thành công. Reset trước là người chơi mất cả tiền lẫn phần tích luỹ — khủng hoảng niềm tin lớn nhất mà cơ chế này có thể gây ra, và nó không sửa được bằng một bản vá.
- `Senior` **Ranh giới giữa ưu đãi thuyết phục và ưu đãi gây áp lực nằm ở đâu?**
  → Ở một câu kiểm tra: **nếu người chơi biết rõ mọi thứ mà vẫn thấy đáng mua thì đó là ưu đãi tốt; nếu nó chỉ hiệu quả khi họ không để ý thì đó là bẫy.** Cụ thể: so sánh giá phải với gói có thật đang bán, đếm ngược phải là hạn thật không lặp lại, và nút đập heo không bao giờ được trông giống nút nhận quà miễn phí.
- `Senior` **Đo gì để biết piggy bank đang lành mạnh?**
  → Ngoài doanh thu, tôi đo **tỉ lệ người có heo đầy mà không đập trong bảy ngày**. Nhóm đó đang chơi mà không nhận thêm được gì, tức là cơ chế đang trừng phạt họ — vừa là vấn đề đạo đức vừa là rủi ro giữ chân. Cộng thêm tỉ lệ đập theo mức đầy: nếu hầu hết chỉ đập khi 100% thì trần hoặc giá đang quá cao.

**Khung trả lời 60 giây** — "Thiết kế piggy bank cho đúng"

> Cơ chế thì đơn giản: tích từ **hành động có ý nghĩa** — thắng trận, xong nhiệm vụ — chứ không tích theo thời gian mở app, vì tích theo thời gian biến game thành nơi để mở rồi bỏ đó. Số tích cộng ở server từ sự kiện, client chỉ hiển thị.
>
> Phần quyết định là **trần và sự minh bạch**. Phải có trần, và phải hiện rõ kèm cảnh báo khi gần đầy — heo đầy mà người chơi không biết thì họ chơi tiếp mà không tích thêm gì, và đó là lúc cơ chế quay sang trừng phạt người chăm chỉ nhất.
>
> Về kỹ thuật, đập heo là **IAP bình thường**: luồng sáu bước, verify ở server, `transaction_id` `UNIQUE`. Và heo chỉ reset **sau khi** server xác nhận thành công — reset trước là người chơi mất cả tiền lẫn phần tích.

**Họ sẽ đào tiếp**

- *"Vì sao không tích theo thời gian chơi?"* → Vì nó thưởng cho việc để app mở chứ không thưởng cho việc chơi, và người chơi sẽ tối ưu đúng theo thứ bạn đo. Bám vào sự kiện có ý nghĩa thì cơ chế vừa chống gian lận được vừa đẩy đúng hành vi bạn muốn.
- *"Heo đầy thì nên làm gì?"* → Ba lựa chọn hợp lý: dừng tích và nói rõ, mở heo bậc hai, hoặc chủ động nhắc đập. Lựa chọn tệ nhất là **im lặng bỏ mất phần tích thêm** — nó tiết kiệm được vài dòng code và đánh đổi bằng niềm tin.
- *"Ba cơ chế ưu đãi khác nhau thế nào?"* → Piggy bank dựa vào công sức đã bỏ ra, gói giới hạn thời gian dựa vào khan hiếm, gói tiến trình dựa vào cảm giác xứng đáng. Chúng hay bị gộp làm một trong đầu người làm. Chạy cả ba cùng lúc liên tục là cách chắc chắn khiến game trông như một cửa hàng.
- *"Đổi tỉ lệ tích giữa chừng được không?"* → Được nhưng phải áp cho **chu kỳ heo tiếp theo**, không áp lên heo đang tích dở. Người chơi thấy con số của mình nhảy mà không hiểu vì sao là mất niềm tin, kể cả khi thay đổi có lợi cho họ.
- *"Có rủi ro gì với store không?"* → Có, nếu nút giao dịch tiền thật bị làm cho giống nút nhận quà miễn phí, hoặc nếu so sánh giá với mức chưa từng bán. Cả hai đều nằm trong phạm vi chính sách của các store và cả hai đều xảy ra thường xuyên trong thực tế.

**Cờ đỏ**

- Tích luỹ tính ở client.
- Reset heo trước khi verify IAP xong.
- Không hiện trần, hoặc im lặng bỏ phần tích khi đầy.
- Nút đập heo trông như nút nhận thưởng miễn phí.
- Đếm ngược "sắp hết hạn" lặp lại vô hạn.
- So sánh với "giá gốc" chưa từng bán.
- Không biết bao nhiêu người đang có heo đầy mà không đập.

**Số / ví dụ nên thuộc**

- Tích từ **sự kiện server**, không từ thời gian mở app.
- Trần phải có, phải **hiện rõ**, và có cảnh báo khi gần đầy.
- Heo reset **chỉ sau khi** server xác nhận IAP thành công.
- Câu kiểm tra ranh giới: *biết rõ mọi thứ mà vẫn thấy đáng mua* = tốt.

**Kể trong dự án**

- *"Anh làm phần kiếm tiền à?"* → Kể cả phần **ranh giới bạn giữ**, không chỉ phần tăng doanh thu. Người phỏng vấn ở studio tử tế rất chú ý câu này, và người ở studio không tử tế thì bạn cũng muốn biết sớm.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: người chơi khiếu nại mất đá quý sau khi đập heo, vì heo bị reset trước khi verify xong và verify thì thất bại. Kể cách bạn đổi thứ tự và cách bạn trả lại cho những người đã bị ảnh hưởng.
- *"Anh có từng phản đối một yêu cầu kiếm tiền không?"* → Nếu có, đây là câu chuyện đáng kể: nêu yêu cầu, lý do bạn phản đối, dữ liệu bạn đưa ra, và kết cục — kể cả khi bạn không thắng. Cách bạn tranh luận quan trọng hơn kết quả.
