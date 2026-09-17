---
id: screen-inventory
title: Màn hình Túi đồ & Nâng cấp
summary: Xem và nâng cấp thứ mình có mà không lạc trong bốn trăm món — lọc và sắp xếp trước khi cần, khoá chống bán nhầm, nâng cấp là một transaction, và phân trang thay vì tải hết.
status: deep
read: 989
level: intermediate
order: 70
tags: [screens, inventory, upgrade, ui, progression]
related: [screens, progression, master-data, game-database]
---

Túi đồ là màn hình **phình nhanh nhất** trong game. Tuần đầu nó có mười hai món và mọi thiết kế đều ổn. Tháng thứ sáu nó có bốn trăm món, và mọi thứ bạn làm tuần đầu đều sai: không lọc được, không tìm được, tải ba giây, và người chơi bán nhầm đồ quý.

Nguyên tắc nền: **thiết kế túi đồ cho tháng thứ sáu, không cho tuần đầu.**

## Ô 1 — Mục tiêu

> Người chơi tìm được món cần trong vài giây, hiểu nó dùng để làm gì, và nâng cấp được mà không rời màn.

Vế cuối tiết kiệm rất nhiều bước: nếu phải quay về Home rồi vào màn khác mới nâng cấp được, tỉ lệ hoàn tất rơi mạnh.

## Ô 2 — Bố cục và ba công cụ bắt buộc

| Vùng | Nội dung |
|---|---|
| Trên | Tab theo loại + **bộ lọc** + **sắp xếp** |
| Giữa | Lưới món, mỗi ô: hình, độ hiếm, cấp, **badge trạng thái** |
| Dưới / bên | Chi tiết món đang chọn + nút hành động chính (nâng cấp / trang bị) |

Ba công cụ phải có **từ đầu**, kể cả khi tuần đầu chỉ có mười hai món:

1. **Lọc** theo loại, độ hiếm, và "đang trang bị".
2. **Sắp xếp** theo sức mạnh, độ hiếm, mới nhất.
3. **Badge trạng thái** trên ô: đang trang bị, nâng cấp được ngay, món mới.

Badge thứ hai — "nâng cấp được ngay" — là badge có giá trị nhất và hay bị bỏ. Nó trả lời câu hỏi người chơi thật sự có: *"tôi có đủ nguyên liệu cho cái gì?"*. Không có nó thì họ phải mở từng món để kiểm.

Thêm cả **"đánh dấu yêu thích"** ngay từ đầu. Nó rẻ và nó là lớp bảo vệ đầu tiên chống bán nhầm.

## Ô 3 — Dữ liệu và phân trang

| Dữ liệu | Nguồn | Ghi chú |
|---|---|---|
| Danh sách món của người chơi | **Server**, phân trang | Không tải hết 400 món một lần |
| Chỉ số, giá, công thức nâng cấp | **Master data**, cache theo version | Client đã có sẵn, không hỏi server từng món |
| Đang trang bị gì | Server | |
| Số lượng nguyên liệu | Server | Dùng để tính badge "nâng cấp được" |

Luật quan trọng nhất, nhắc lại từ [[master-data]]: **túi đồ lưu `item_id`, không lưu chỉ số.** Món trong túi chỉ có id, cấp, và số lượng. Chỉ số tra từ master data lúc hiển thị.

Nếu sao chép chỉ số vào túi đồ thì buff kiếm sắt hôm nay chỉ áp dụng cho người mua từ ngày mai — và không ai hiểu vì sao. Đây là lỗi thiết kế phổ biến nhất ở mảng này.

Về phân trang: tải theo trang hoặc theo tab, không tải hết. Nhưng **badge "nâng cấp được" cần biết toàn cục** — nên server trả kèm một tóm tắt nhỏ (ví dụ: danh sách id nâng cấp được), thay vì để client tự tính trên dữ liệu nó chưa tải hết.

## Ô 4 — Nâng cấp là một transaction

```
POST /items/upgrade  { item_id, request_id }
                     ← { item_after, materials_after, balance_after }
```

Trong một transaction: kiểm sở hữu, kiểm đủ nguyên liệu, kiểm đủ tiền, trừ nguyên liệu, trừ tiền, tăng cấp, ghi sổ cái. Nửa chừng là mất nguyên liệu mà không lên cấp — loại lỗi người chơi nhớ rất lâu.

Bốn luật:

1. **`request_id` bắt buộc** — nó tiêu tài nguyên.
2. **Server tra công thức từ master data**, không nhận chi phí do client gửi.
3. **Trả về trạng thái sau**, client hiển thị số đó chứ không tự trừ.
4. **Nâng cấp hàng loạt** (nếu có) là một transaction có trần, giống `claim-all` ở [[screen-presentbox]].

## Ô 5 — Chống thao tác nhầm

Túi đồ là màn duy nhất người chơi có thể **tự huỷ tài sản của mình**. Bốn lớp bảo vệ, xếp theo mức độ:

| Lớp | Áp dụng cho |
|---|---|
| Không có gì | Món phổ thông, số lượng lớn |
| Hộp thoại xác nhận | Món hiếm |
| Xác nhận + nêu rõ tên món | Món rất hiếm, món đang trang bị |
| **Khoá** — phải mở khoá trước | Người chơi tự đánh dấu |

Và một luật vận hành: **giữ log mọi thao tác huỷ hoặc bán** trong sổ cái, kèm lý do. Khi người chơi khiếu nại "tôi không hề bán cái đó", bạn cần dữ liệu để trả lời — và đôi khi dữ liệu cho thấy họ đúng.

Hai sai lầm ngược nhau đều gây hại: không xác nhận gì thì người chơi mất đồ; xác nhận mọi thứ thì thao tác dọn túi 200 món thành cực hình.

## Ô 6 — Trạng thái rỗng và lỗi

| Trạng thái | Hiện gì |
|---|---|
| Túi trống (người mới) | Gợi ý cách kiếm món đầu tiên, không phải màn trắng |
| Lọc ra 0 kết quả | "Không có món nào khớp" + nút xoá lọc |
| Đang tải trang tiếp | Khung giữ chỗ ở cuối lưới, không chặn màn |
| Không đủ nguyên liệu | Nút xám + **hiện thiếu bao nhiêu**, link tới chỗ kiếm |
| Túi đầy | Cảnh báo **trước khi** đầy, gợi ý dọn; quà mới vào [[screen-presentbox]] |
| Mất mạng | Hiện cache, khoá mọi nút đổi trạng thái |

Dòng "không đủ nguyên liệu" đáng làm kỹ: hiện **thiếu chính xác bao nhiêu và kiếm ở đâu** biến một ngõ cụt thành một mục tiêu.

## Ô 7 — Số liệu

- **Thời gian mở màn** — với 400 món, nếu vượt một giây thì phân trang đang sai.
- **Tỉ lệ dùng bộ lọc** — cao nghĩa là danh sách quá dài, cân nhắc nhóm lại.
- **Tỉ lệ nâng cấp hoàn tất** từ lúc mở chi tiết món.
- **Số khiếu nại bán nhầm** — chỉ số trực tiếp cho việc lớp bảo vệ có đủ không.

## Ô 8 — Vận hành

- Công thức nâng cấp, chi phí, giới hạn cấp đều từ master data — cân bằng đổi hằng tuần.
- Thêm loại món mới **không được** cần bản client mới: màn chỉ biết cách vẽ một món, không biết có những loại nào.
- Món bị gỡ khỏi master mà người chơi đang sở hữu thì **không được làm sập UI** — hiện ô thiếu dữ liệu, ghi log.

## Bẫy thường gặp

- **Tải hết 400 món một lần.** Màn mở ba giây và tốn băng thông mỗi lần vào.
- **Sao chép chỉ số vào túi đồ.** Cân bằng lại không áp dụng cho món đã có.
- **Không có lọc và sắp xếp** vì tuần đầu chỉ có mười hai món.
- **Không có khoá món.** Khiếu nại bán nhầm sẽ tới, và bạn không có gì để trả lời.
- **Xác nhận mọi thao tác.** Dọn túi thành cực hình, người chơi bấm bừa và mất đồ thật.
- **Nâng cấp không trong transaction.** Mất nguyên liệu mà không lên cấp.
- **Client tính chi phí nâng cấp.** Sửa bộ nhớ là nâng cấp miễn phí.
- **Không cảnh báo trước khi túi đầy.** Phần thưởng rơi vào hư không.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho túi đồ**

Phần UI lưới, lọc, sắp xếp là việc AI làm nhanh và đúng. Phần cần bạn là **quy mô thật** — không nói thì nó thiết kế cho hai mươi món.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Thiết kế dữ liệu | Đầu | "Thiết kế API túi đồ phân trang cho người chơi có 400+ món" |
| Sinh UI lưới | Khi có hợp đồng | "Viết màn lưới có lọc, sắp xếp, badge trạng thái, tải thêm khi cuộn" |
| Handler nâng cấp | Khi làm nâng cấp | "Viết handler upgrade: một transaction, tra công thức từ master, idempotent" |
| Soi thao tác nhầm | Trước phát hành | "Chỗ nào người chơi có thể mất đồ quý chỉ bằng một lần chạm?" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Bao nhiêu món ở cuối game** — con số này quyết định mọi thứ.
- **Có bán/huỷ món không**, và mức bảo vệ mong muốn.
- **Chỉ số tra từ master data**, không lưu trong túi.
- **Nâng cấp hàng loạt có không.**

**Mẫu prompt**

```
Unity + server Go. Người chơi cuối game có khoảng 400 món, 6 loại.
Chỉ số và công thức nâng cấp nằm ở master data (client đã cache theo version).
Có bán món. Có nâng cấp hàng loạt.

Việc 1: thiết kế API túi đồ — phân trang, kèm tóm tắt toàn cục để tính badge
"nâng cấp được ngay" mà không cần tải hết.
Việc 2: viết handler upgrade — MỘT transaction: kiểm sở hữu, kiểm nguyên liệu, trừ, tăng cấp,
ghi sổ cái. Idempotent theo request_id.
Việc 3: đề xuất các lớp bảo vệ chống bán nhầm, phân theo độ hiếm — nêu rõ lớp nào cho loại nào.

Ràng buộc:
- Túi đồ lưu item_id + cấp + số lượng, KHÔNG lưu chỉ số.
- Server tra chi phí từ master data, KHÔNG nhận chi phí client gửi.
- KHÔNG tải toàn bộ danh sách món trong một request.
- Không xác nhận tràn lan: nêu rõ thao tác nào cần xác nhận, thao tác nào không.
```

**Bẫy thường gặp:** AI thiết kế túi đồ tải hết trong một request vì với hai mươi món thì cách đó gọn hơn — và nó chỉ hỏng ở tháng thứ sáu, khi sửa đã đắt. Bẫy thứ hai: nó lưu chỉ số vào từng món trong túi vì như thế "đọc nhanh hơn", phá luôn khả năng cân bằng lại. Bẫy thứ ba: nó thêm hộp thoại xác nhận cho mọi thao tác, biến việc dọn túi thành cực hình và khiến người chơi bấm bừa.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Túi đồ nên lưu những gì cho mỗi món?**
  → `item_id`, cấp, số lượng — và **không lưu chỉ số**. Chỉ số tra từ master data lúc hiển thị. Sao chép chỉ số vào túi thì buff kiếm sắt hôm nay chỉ áp dụng cho người mua từ ngày mai, và không ai hiểu vì sao số của hai người khác nhau.
- `Junior` **Vì sao phải có lọc và sắp xếp từ đầu?**
  → Vì túi đồ là màn phình nhanh nhất trong game: tuần đầu mười hai món, tháng thứ sáu bốn trăm. Thêm lọc sau khi đã có bốn trăm món thì vừa phải sửa UI vừa phải sửa API. Nguyên tắc là thiết kế cho tháng thứ sáu, không cho tuần đầu.
- `Mid` **Người chơi có 400 món, anh tải thế nào?**
  → Phân trang hoặc theo tab, không tải hết. Nhưng badge "nâng cấp được ngay" cần biết toàn cục, nên server trả kèm một **tóm tắt nhỏ** — chẳng hạn danh sách id nâng cấp được — thay vì để client tự tính trên dữ liệu nó chưa tải xong. Đó là cách giữ màn mở dưới một giây mà vẫn có thông tin người chơi cần.
- `Mid` **Nâng cấp một món gồm những bước gì phía server?**
  → Một transaction duy nhất: kiểm sở hữu, kiểm đủ nguyên liệu, kiểm đủ tiền, trừ nguyên liệu, trừ tiền, tăng cấp, ghi sổ cái. Kèm `request_id` idempotent. Tách ra nhiều bước thì có lúc người chơi mất nguyên liệu mà món không lên cấp — loại lỗi họ nhớ rất lâu và kể lại cho người khác.
- `Senior` **Chống bán nhầm đồ quý thế nào mà không làm phiền người chơi?**
  → Phân lớp theo giá trị: món phổ thông không cần gì, món hiếm cần xác nhận, món rất hiếm hoặc đang trang bị thì xác nhận có nêu tên, và cho người chơi **tự khoá** món họ muốn giữ. Xác nhận mọi thứ là sai lầm ngược lại — dọn túi hai trăm món thành cực hình, người chơi bấm bừa và mất đồ thật. Kèm theo là ghi log mọi thao tác bán vào sổ cái, vì khiếu nại sẽ tới và đôi khi người chơi đúng.
- `Senior` **Món bị gỡ khỏi master data mà người chơi đang sở hữu thì sao?**
  → UI **không được sập**. Hiện một ô thiếu dữ liệu với thông tin tối thiểu và ghi log. Đây là trường hợp chắc chắn xảy ra khi vận hành lâu — sự kiện kết thúc, món bị thu hồi — và nó là bài kiểm tra xem client có phòng thủ trước dữ liệu thiếu hay không.

**Khung trả lời 60 giây** — "Thiết kế túi đồ cho game có 400 món"

> Nguyên tắc đầu tiên: **thiết kế cho tháng thứ sáu, không cho tuần đầu.** Tuần đầu mười hai món thì cách nào cũng chạy; bốn trăm món thì mọi lựa chọn dễ dãi đều trả giá.
>
> Về dữ liệu, túi chỉ lưu `item_id`, cấp và số lượng; **chỉ số tra từ master data** lúc hiển thị, nên cân bằng lại áp dụng ngay cho mọi người. Danh sách **phân trang**, kèm một tóm tắt toàn cục để tính badge "nâng cấp được ngay" mà không phải tải hết.
>
> Về UI, ba thứ có từ đầu kể cả khi chưa cần: lọc, sắp xếp, và badge trạng thái. Cộng khoá món để chống bán nhầm. Còn nâng cấp là **một transaction** — kiểm, trừ nguyên liệu, trừ tiền, tăng cấp, ghi sổ cái — với `request_id` idempotent.

**Họ sẽ đào tiếp**

- *"Badge nào đáng làm nhất?"* → "Nâng cấp được ngay", vì nó trả lời đúng câu hỏi người chơi có trong đầu: tôi đủ nguyên liệu cho cái gì. Không có nó thì họ phải mở từng món để kiểm, và phần lớn sẽ không làm.
- *"Không đủ nguyên liệu thì hiện gì?"* → Nút xám kèm **thiếu chính xác bao nhiêu và kiếm ở đâu**. Điều đó biến một ngõ cụt thành một mục tiêu, và nó là chỗ chuyển đổi tự nhiên sang màn nhiệm vụ hoặc shop.
- *"Túi đầy thì sao?"* → Cảnh báo **trước khi** đầy, và phần thưởng mới vào hộp quà thay vì rơi vào hư không. Chặn người chơi nhận thưởng vì túi đầy là cách nhanh nhất làm hỏng một khoảnh khắc lẽ ra vui.
- *"Đo gì ở màn này?"* → Thời gian mở màn với tài khoản nhiều món nhất — vượt một giây là phân trang đang sai; tỉ lệ dùng bộ lọc, cao nghĩa là danh sách quá dài; và số khiếu nại bán nhầm, chỉ số trực tiếp cho việc lớp bảo vệ có đủ không.
- *"Thêm loại món mới có cần bản client mới không?"* → Không được cần. Màn chỉ biết **cách vẽ một món**, không biết có những loại nào — danh sách và thuộc tính đến từ master data. Nếu thêm loại món phải build lại app thì mọi sự kiện đều bị chặn bởi chu kỳ duyệt store.

**Cờ đỏ**

- Tải toàn bộ danh sách món trong một request.
- Lưu chỉ số vào từng món trong túi đồ.
- Không có lọc, sắp xếp vì "hiện chưa nhiều món".
- Không có cách khoá món, và không log thao tác bán.
- Hộp thoại xác nhận cho mọi thao tác.
- Client tính chi phí nâng cấp.
- UI sập khi gặp `item_id` không có trong master data.

**Số / ví dụ nên thuộc**

- Thiết kế cho quy mô cuối game (vài trăm món), không cho tuần đầu.
- Túi lưu **`item_id` + cấp + số lượng**; chỉ số tra master data.
- Thời gian mở màn với tài khoản nhiều món nhất: dưới **1 giây**.
- Bốn lớp chống nhầm: không gì · xác nhận · xác nhận có tên · khoá.

**Kể trong dự án**

- *"Anh làm túi đồ à?"* → Nêu **quy mô**: bao nhiêu món ở cuối game, thời gian mở màn. Túi đồ không có số nghe như một màn danh sách tầm thường; có số thì nó là bài toán thật.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: màn mở nhanh khi test với tài khoản mới, chậm ba giây với tài khoản người chơi lâu năm. Kể cách bạn phát hiện — test bằng tài khoản có dữ liệu thật chứ không phải tài khoản trắng — và cách phân trang cộng tóm tắt toàn cục giải quyết nó.
- *"Anh xử lý khiếu nại bán nhầm thế nào?"* → Nếu có, kể cách bạn dùng sổ cái để tra và quyết định có trả lại hay không. Câu này cho thấy bạn thiết kế cho cả khâu hỗ trợ, không chỉ cho đường thành công.
