---
id: screen-gacha
title: Màn hình Gacha
summary: Quay số đổi tiền lấy kỳ vọng — pity và tỉ lệ công bố, server quay chứ không phải client, luật pháp lý theo thị trường, và vì sao animation bỏ qua được là bắt buộc.
status: deep
read: 1120
level: advanced
order: 20
tags: [screens, gacha, monetization, randomness, legal]
related: [screens, randomness, economy-design, game-database]
---

Gacha là màn hình **nhạy cảm nhất** trong game: nhạy cảm về pháp lý, về niềm tin, và về kỹ thuật. Một lỗi ở đây không chỉ là bug — nó là tiền thật của người chơi và có thể là vấn đề pháp lý ở một số thị trường.

Nguyên lý xác suất nằm ở [[randomness]]. Node này nói về **màn hình**: tổ chức thế nào, gọi gì, và đâu là chỗ không được phép sai.

## Ô 1 — Mục tiêu

> Người chơi hiểu **mình đang mua cơ hội gì**, quay, và nhận kết quả rõ ràng — kể cả khi kết quả không như ý.

Chữ "hiểu" là chữ quan trọng. Gacha mập mờ đem lại doanh thu ngắn hạn và mất niềm tin dài hạn, chưa kể rủi ro bị gỡ khỏi store.

## Ô 2 — Bố cục

| Vùng | Nội dung | Luật |
|---|---|---|
| Trên | Banner, tên đợt, **thời gian còn lại** | Hạn phải rõ; đếm ngược theo giờ server |
| Giữa | Vật phẩm nổi bật (rate-up), hình lớn | Thứ đang được quảng cáo phải là thứ dễ thấy nhất |
| Dưới | Nút quay **×1** và **×10**, giá rõ ràng | Giá hiện ngay trên nút, không giấu sau một lớp |
| Luôn thấy | **Tỉ lệ** và **bộ đếm pity** | Không giấu sau ba lớp menu |
| Phụ | Lịch sử quay | Bắt buộc ở một số thị trường; nên có ở mọi nơi |

Hai dòng cuối là hai dòng phân biệt gacha đàng hoàng với gacha mập mờ. Bộ đếm pity hiện thẳng trên màn — *"còn 23 lượt nữa chắc chắn ra 5 sao"* — vừa là minh bạch vừa là động lực mạnh.

## Ô 3 — Dữ liệu

| Dữ liệu | Nguồn | Ghi chú |
|---|---|---|
| Cấu hình banner: tỉ lệ, danh sách, hạn | **Master data có version** | Không bao giờ hardcode |
| Bộ đếm pity của người chơi | **Server** | Client chỉ hiển thị |
| Kết quả quay | **Server quay** | Xem dưới |
| Lịch sử quay | Server, phân trang | Không tải hết một lúc |
| Hình ảnh vật phẩm | CDN, cache | Có ảnh dự phòng khi tải lỗi |

**Server quay, không phải client.** Nếu client quay rồi báo kết quả, người chơi sẽ thử lại tới khi ra đồ tốt — chỉ cần tắt app trước khi kết quả kịp gửi lên. Đây là dạng khai thác cổ điển nhất của gacha và nó rất dễ làm.

Kèm theo: **seed và kết quả ghi lại ở server**, để khi có khiếu nại còn dựng lại được.

## Ô 4 — API

```
GET  /gacha/banners            → danh sách đợt + tỉ lệ + pity hiện tại
POST /gacha/pull               → { banner_id, count: 1|10, request_id }
                               ← { items: [...], pity_after, balance_after }
GET  /gacha/history?cursor=... → lịch sử, phân trang
```

Ba luật cho `POST /gacha/pull`:

1. **Bắt buộc có `request_id`.** Đây là lệnh tiêu tài nguyên. Mất mạng giữa chừng mà không có nó thì hoặc trừ hai lần, hoặc người chơi mất lượt quay đã trả tiền.
2. **Một transaction** cho cả chuỗi: trừ tiền, quay, cộng vật phẩm, cập nhật pity, ghi sổ cái. Nửa chừng là thảm hoạ — xem [[game-database]].
3. **Trả về `balance_after`**, client hiển thị số đó chứ không tự trừ.

Quay ×10 là **một** request, không phải mười. Mười request là mười cơ hội để một cái rớt.

## Ô 5 — Vòng đời và animation

```
Bấm quay → khoá nút NGAY
         → POST /gacha/pull (đã có kết quả từ server)
         → chạy animation (kết quả đã biết trước, animation chỉ là trình diễn)
         → hiện kết quả → mở khoá nút
```

Điểm mấu chốt: **kết quả có trước, animation sau**. Animation không quyết định gì cả, nó chỉ kể lại thứ server đã quyết.

Từ đó ra ba yêu cầu:

- **Bỏ qua animation phải được**, và người chơi hay quay trăm lượt sẽ dùng nó mỗi lần. Bắt xem 8 giây mỗi lượt là cách làm phiền đúng nhóm người trả tiền nhiều nhất.
- **Thoát app giữa animation không được mất kết quả.** Giao dịch đã xong ở server; mở lại app phải thấy vật phẩm trong túi.
- **Animation không được chặn việc lưu kết quả.** Nếu code chỉ cộng đồ vào túi ở cuối animation, thì thoát giữa chừng là mất — và người chơi sẽ tìm ra.

## Ô 6 — Trạng thái rỗng và lỗi

| Trạng thái | Hiện gì |
|---|---|
| Không đủ tiền | Nút chuyển sang "Mua thêm" dẫn tới [[screen-shop]], **không** báo lỗi cụt ngủn |
| Banner vừa hết hạn khi đang xem | Thông báo rõ, làm mới màn, **không** cho quay rồi mới báo lỗi |
| Mất mạng giữa lúc quay | "Đang kiểm tra kết quả", tự thử lại **cùng `request_id`** |
| Lỗi server | Không trừ tiền, báo rõ, giữ nguyên số dư |
| Túi đầy | Quyết trước: chặn quay, hay cho quay và gửi vào [[screen-presentbox]] |

Dòng thứ ba là dòng quan trọng nhất. Người chơi vừa trả tiền và không biết mình có nhận được gì không — đây là lúc niềm tin mong manh nhất. Cùng `request_id` nghĩa là thử lại an toàn, và người chơi thấy đúng kết quả của lần quay đã trả tiền.

## Ô 7 — Số liệu

- **Tỉ lệ chuyển đổi theo bước**: mở banner → bấm quay → hoàn tất.
- **Phân bố số lượt quay tới khi trúng** — đối chiếu với tỉ lệ công bố. Lệch là dấu hiệu code sai, và đây là cách phát hiện sớm nhất.
- **Tỉ lệ bỏ qua animation** — cao thì animation đang quá dài.
- **Tỉ lệ lỗi ở `/gacha/pull`** — ngưỡng phải chặt hơn endpoint thường, vì mỗi lỗi là một người chơi đang lo mất tiền.

## Ô 8 — Vận hành và pháp lý

Phải đổi được từ server: banner, tỉ lệ, danh sách vật phẩm, hạn. Đây là nội dung vận hành đổi hằng tuần — hardcode là tự trói.

Về pháp lý, ba điều tối thiểu, và **phải kiểm tra theo từng thị trường phát hành**:

1. **Công bố tỉ lệ.** Bắt buộc ở nhiều thị trường lớn và là chính sách của cả hai store.
2. **Tỉ lệ công bố phải đúng với code.** Đây là chỗ có rủi ro pháp lý thật, không chỉ là uy tín.
3. **Lịch sử quay** để người chơi tự kiểm chứng.

Một số thị trường còn có quy định riêng — giới hạn theo tuổi, cấm một số cơ chế, yêu cầu hiển thị chi phí kỳ vọng. **Đây là câu hỏi cho bộ phận pháp chế của dự án, không phải câu hỏi kỹ thuật.** Việc của bạn là làm hệ thống đủ linh hoạt để đáp ứng khi được yêu cầu: tỉ lệ trong master data, có bật/tắt theo quốc gia.

## Bẫy thường gặp

- **Client quay.** Người chơi tắt app để thử lại tới khi ra đồ tốt.
- **Kết quả cộng vào túi ở cuối animation.** Thoát giữa chừng là mất đồ đã trả tiền.
- **Quay ×10 gửi mười request.** Một cái rớt là trạng thái nửa vời.
- **Không có `request_id`.** Mất mạng là trừ hai lần hoặc mất lượt.
- **Không bỏ qua được animation.** Làm phiền đúng nhóm trả tiền nhiều nhất.
- **Tỉ lệ hardcode trong client.** Không đổi được banner, và số công bố có thể lệch với server.
- **Pity tính ở client.** Người chơi sửa bộ nhớ là có pity vô hạn.
- **Không đối chiếu phân bố thực tế với tỉ lệ công bố.** Code sai mà không ai biết cho tới khi cộng đồng tự thống kê.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho gacha**

Đây là màn **phải review kỹ nhất** trong mọi thứ AI sinh ra, vì sai ở đây là tiền và pháp lý. Giao phần khung, giữ lại phần xác suất và transaction để tự đọc từng dòng.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Sinh handler | Khi đã chốt luật pity | "Viết handler pull: một transaction, có request_id, cập nhật pity" |
| Viết test phân bố | Sau khi có code | "Viết test quay 1 triệu lượt, so phân bố thực tế với tỉ lệ công bố" |
| Soi khai thác | Trước khi phát hành | "Người chơi có thể khai thác luồng này thế nào nếu tắt app đúng lúc?" |
| Liệt kê trạng thái | Khi làm UI | "Liệt kê mọi trạng thái màn gacha, kể cả banner hết hạn giữa lúc đang quay" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Luật pity chính xác**: cứng hay mềm, đếm riêng từng banner hay chung, reset khi nào.
- **Tỉ lệ công bố** và nó nằm ở đâu (phải là master data).
- **Quay ×10 có đảm bảo gì không** (ví dụ ít nhất một món 4 sao).
- **Túi đầy thì làm gì** — chặn hay gửi hộp quà.

**Mẫu prompt**

```
Gacha: pity cứng 90 lượt cho 5 sao, đếm riêng từng banner, reset sau khi trúng.
×10 đảm bảo ít nhất một món 4 sao trở lên. Tỉ lệ nằm trong master data có version.
Server Go, Postgres. Đã có sổ cái wallet_tx với request_id UNIQUE.

Việc 1: viết handler POST /gacha/pull — MỘT transaction gồm: kiểm số dư, trừ tiền,
quay, cộng vật phẩm, cập nhật pity, ghi sổ cái. Có request_id idempotent.
Việc 2: viết test thống kê quay 1 triệu lượt, so phân bố thực tế với tỉ lệ công bố,
và kiểm pity không bao giờ vượt 90.
Việc 3: đóng vai người chơi muốn khai thác — liệt kê mọi cách lợi dụng luồng này,
kể cả tắt app đúng thời điểm, và cách chặn từng cái.

Ràng buộc:
- Server quay, KHÔNG nhận kết quả từ client.
- Pity lưu ở server, client chỉ hiển thị.
- Quay ×10 là MỘT request và MỘT transaction.
- Tỉ lệ đọc từ master data, KHÔNG hardcode.
- Random dùng nguồn ngẫu nhiên phù hợp, ghi lại seed để dựng lại khi có khiếu nại.
```

**Bẫy thường gặp:** AI viết luồng quay tách thành nhiều bước không trong một transaction — trừ tiền một chỗ, cộng đồ một chỗ — và nó chạy đúng trong mọi test cho tới ngày một request rớt giữa chừng. Bẫy thứ hai: nó hardcode tỉ lệ vào code Go cho "rõ ràng". Bẫy thứ ba: nó tính pity ở client để "giảm tải server". Bẫy thứ tư: nó cộng vật phẩm vào túi trong callback cuối animation ở phía client.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao server phải quay chứ không phải client?**
  → Vì client quay thì người chơi tắt app trước khi kết quả kịp gửi lên, mở lại và quay tiếp tới khi ra đồ tốt. Đây là dạng khai thác cổ điển nhất của gacha và rất dễ làm. Server quay, ghi lại seed và kết quả, client chỉ nhận về để trình diễn.
- `Junior` **Pity là gì và nên lưu ở đâu?**
  → Là bộ đếm đảm bảo sau N lượt không trúng thì chắc chắn trúng, để người chơi không rơi vào chuỗi xui vô hạn. Nó phải lưu ở **server** — tính ở client thì sửa bộ nhớ là có pity vô hạn. Và nên hiện thẳng trên màn: "còn 23 lượt nữa chắc chắn ra 5 sao" vừa minh bạch vừa là động lực mạnh.
- `Mid` **Quay ×10 thì gửi mấy request?**
  → Một, và xử lý trong một transaction. Mười request là mười cơ hội để một cái rớt và để lại trạng thái nửa vời — trừ tiền chín lượt, nhận đồ tám lượt, pity lệch. Gộp lại thì hoặc cả mười thành công, hoặc không có gì xảy ra.
- `Mid` **Người chơi thoát app giữa lúc animation quay đang chạy. Chuyện gì xảy ra?**
  → Không mất gì cả, vì **giao dịch đã hoàn tất ở server trước khi animation bắt đầu**. Mở lại app là thấy vật phẩm trong túi. Lỗi hay gặp là code cộng đồ vào túi ở callback cuối animation phía client — khi đó thoát giữa chừng là mất đồ đã trả tiền, và người chơi sẽ tìm ra rất nhanh.
- `Senior` **Làm sao biết tỉ lệ thực tế đúng với tỉ lệ công bố?**
  → Hai lớp. Một, test thống kê quay hàng triệu lượt trong CI, so phân bố với tỉ lệ công bố và kiểm pity không bao giờ vượt trần. Hai, **đo trên production**: phân bố số lượt tới khi trúng của người chơi thật. Lệch là dấu hiệu code sai, và đây là cách phát hiện sớm hơn nhiều so với chờ cộng đồng tự thống kê — vì họ sẽ thống kê.
- `Senior` **Ràng buộc pháp lý của gacha là gì?**
  → Tối thiểu ba: công bố tỉ lệ, tỉ lệ công bố phải khớp với code, và có lịch sử quay để người chơi tự kiểm chứng. Nhiều thị trường yêu cầu công bố tỉ lệ và cả hai store đều có chính sách về việc này; một số nơi còn có quy định riêng theo tuổi hoặc theo cơ chế. Đây là câu hỏi cho pháp chế của dự án — việc của kỹ thuật là làm hệ thống **đủ linh hoạt để đáp ứng**: tỉ lệ nằm trong master data, bật tắt được theo quốc gia.

**Khung trả lời 60 giây** — "Thiết kế luồng gacha cho đúng"

> Ba nguyên tắc, và cả ba đều xoay quanh một chuyện: đây là tiền thật.
>
> **Server quay.** Client quay thì người chơi tắt app để thử lại tới khi ra đồ tốt. Server quay, ghi lại seed và kết quả để khi có khiếu nại còn dựng lại được. Pity cũng ở server, client chỉ hiển thị.
>
> **Một transaction cho cả chuỗi** — kiểm số dư, trừ tiền, quay, cộng vật phẩm, cập nhật pity, ghi sổ cái — và bắt buộc có `request_id` idempotent, vì mất mạng giữa lúc quay là chuyện xảy ra hằng ngày. Quay ×10 là một request, không phải mười.
>
> **Kết quả có trước, animation sau.** Animation chỉ kể lại thứ server đã quyết, nên thoát giữa chừng không mất gì, và bỏ qua animation phải được — người quay trăm lượt sẽ dùng nó mỗi lần.

**Họ sẽ đào tiếp**

- *"Vì sao phải bỏ qua được animation?"* → Vì nhóm quay nhiều nhất chính là nhóm trả tiền nhiều nhất, và bắt họ xem tám giây mỗi lượt là làm phiền đúng người bạn không muốn làm phiền. Đo tỉ lệ bỏ qua: cao nghĩa là animation đang quá dài ngay cả với người chơi bình thường.
- *"Không đủ tiền thì hiện gì?"* → Nút chuyển thành "Mua thêm" dẫn thẳng tới shop, không phải một hộp thoại báo lỗi cụt ngủn. Đây là chỗ chuyển đổi tự nhiên nhất trong game, và làm cụt là vừa mất doanh thu vừa gây bực.
- *"Túi đầy khi quay thì sao?"* → Phải quyết trước: chặn quay, hay cho quay rồi gửi vật phẩm vào hộp quà. Tôi nghiêng về gửi hộp quà vì chặn người chơi đang muốn tiêu tiền là quyết định kỳ lạ — nhưng nó phải là quyết định có ý thức, ghi vào tài liệu.
- *"Mất mạng ngay lúc bấm quay?"* → Hiện "đang kiểm tra kết quả" và tự thử lại **cùng `request_id`**. Nhờ idempotency, hoặc người chơi thấy đúng kết quả của lượt đã trả tiền, hoặc chưa trừ gì cả. Đây là lúc niềm tin mong manh nhất nên đáng làm kỹ nhất.
- *"Tỉ lệ để ở đâu?"* → Master data có version, không bao giờ hardcode. Banner đổi hằng tuần, và quan trọng hơn: số công bố cho người chơi và số code dùng phải đến từ **cùng một nguồn**, nếu không chúng sẽ lệch.

**Cờ đỏ**

- Client quay rồi gửi kết quả lên server.
- Pity tính hoặc lưu ở client.
- Quay ×10 gửi mười request.
- Cộng vật phẩm vào túi ở cuối animation phía client.
- Không có `request_id` cho lệnh quay.
- Tỉ lệ hardcode trong client, khác nguồn với số server dùng.
- "Chúng tôi không công bố tỉ lệ để giữ bí mật thiết kế."
- Chưa từng đối chiếu phân bố thực tế với tỉ lệ công bố.

**Số / ví dụ nên thuộc**

- Pity ví dụ: **90 lượt** cho bậc cao nhất, đếm riêng từng banner.
- Quay ×10 = **một** request, **một** transaction.
- Test thống kê: **hàng triệu lượt** trong CI, so với tỉ lệ công bố.
- Ba yêu cầu tối thiểu: công bố tỉ lệ · tỉ lệ khớp code · có lịch sử quay.

**Kể trong dự án**

- *"Anh làm gacha à?"* → Đây là màn gây ấn tượng nhất nếu kể đúng, vì nó chạm transaction, xác suất, và pháp lý cùng lúc. Nêu luật pity cụ thể và cách bạn kiểm chứng tỉ lệ.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: khiếu nại "quay rồi mà không nhận được đồ", không tái hiện được ở văn phòng. Nguyên nhân là mất mạng giữa lúc quay cộng với thiếu idempotency. Kể cách bạn dựng lại từ log seed và kết quả để trả đồ cho đúng người.
- *"Anh có phải trả lời cộng đồng về tỉ lệ chưa?"* → Nếu có, đây là câu chuyện mạnh: cộng đồng tự thống kê và nghi tỉ lệ sai. Kể cách bạn đối chiếu bằng dữ liệu production và trả lời công khai — dù kết quả là code đúng hay code sai.
