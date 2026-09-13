---
id: screen-home
title: Màn hình Home
summary: Trung tâm điều hướng phải trả lời "giờ tôi nên làm gì" trong hai giây — ba vùng bố cục, một hành động chính, luật chấm đỏ, và vì sao Home là nơi mọi tính năng tranh chỗ.
status: deep
read: 1110
level: intermediate
order: 10
tags: [screens, home, navigation, ux, retention]
related: [screens, ux-flow, screen-mission, onboarding]
---

Home là màn hình người chơi nhìn nhiều nhất, và là màn duy nhất **mọi tính năng đều muốn có chỗ trên đó**. Đó là hai sự thật tạo ra mọi vấn đề của nó.

Không có ai bảo vệ Home thì sau sáu tháng nó trở thành một bảng điều khiển có mười bốn nút, chín chấm đỏ, ba banner xoay vòng — và người chơi mới mở ra không biết bấm gì.

## Ô 1 — Mục tiêu

> Trong **hai giây**, người chơi biết được việc đáng làm nhất lúc này, và chạm một lần là tới đó.

Không phải "hiển thị mọi thứ người chơi có". Đó là việc của [[screen-inventory]].

Kiểm tra rất nhanh: đưa máy cho người chưa chơi bao giờ, đếm tới hai, hỏi *"giờ bạn bấm gì?"*. Nếu họ lưỡng lự hoặc bấm sai chỗ thì Home đang hỏng, bất kể nó đẹp thế nào.

## Ô 2 — Bố cục ba vùng

| Vùng | Nội dung | Luật |
|---|---|---|
| **Trên** | Tài nguyên (vàng, đá quý, vé), avatar, cấp | Chỉ hiện thứ người chơi **cần biết để quyết định**. Bốn loại tiền trên HUD là quá nhiều |
| **Giữa** | Nhân vật/đội hình, bối cảnh game | Vùng lớn nhất, vùng ít chức năng nhất — nó bán cảm giác, không bán thông tin |
| **Dưới** | Nút **CHƠI** + thanh điều hướng | Nút chơi là phần tử to nhất màn hình. Không có ngoại lệ |
| Cạnh trái/phải | Sự kiện, gói ưu đãi, tính năng phụ | Vùng duy nhất được phép thay đổi theo vận hành |

Luật một câu cho vùng dưới: **một hành động chính, rõ ràng, không cạnh tranh.** Nếu có hai nút to bằng nhau thì không nút nào là hành động chính.

Vùng cạnh là nơi các tính năng tranh nhau. Giải pháp không phải là cãi nhau trong họp, mà là **giới hạn số ô cứng** — ví dụ tối đa bốn — và một thứ tự ưu tiên do server quyết. Tính năng thứ năm phải đẩy tính năng thứ tư ra.

## Ô 3 — Dữ liệu

| Dữ liệu | Nguồn | Cache |
|---|---|---|
| Số dư tài nguyên | Server | Hiện bản cache ngay, cập nhật khi có phản hồi |
| Đội hình / nhân vật đang dùng | Server | Cache được, ít đổi |
| Danh sách ô tính năng, thứ tự | **Server (cấu hình)** | Cache theo version |
| Sự kiện đang chạy, thời gian còn lại | Server | Không cache quá vài phút |
| Chấm đỏ | Tính từ dữ liệu, **không** là trường riêng | Tính lại sau mỗi hành động |

Dòng thứ ba là dòng quan trọng nhất và hay bị làm sai: **danh sách ô tính năng phải đến từ server**. Không thì bật một sự kiện phải chờ store duyệt.

Dòng cuối cũng đáng dừng lại: chấm đỏ **không nên là một trường server gửi xuống**. Nó là **kết quả suy ra** từ trạng thái — có nhiệm vụ nhận được, có quà chưa lấy, có nâng cấp đủ tiền. Làm thành trường riêng thì sớm muộn nó lệch với thực tế, và chấm đỏ lệch là thứ người chơi ghét nhất.

## Ô 4 — API

Vào Home gọi **đúng một** request tổng hợp, không phải bảy request cho bảy ô:

```
GET /home
→ {
    resources: {...},        // ví
    profile: {...},          // cấp, avatar, đội hình
    features: [...],         // ô nào hiện, thứ tự, chấm đỏ
    events: [...],           // sự kiện đang chạy + hạn
    notice: {...}            // thông báo, nếu có
  }
```

Lý do gộp: thời gian tới lúc Home dùng được là chỉ số người chơi cảm nhận rõ nhất. Bảy request song song trên mạng 4G chập chờn nghĩa là bảy cơ hội để một cái chậm làm hỏng cả màn.

Giới hạn của việc gộp: đừng nhét cả túi đồ 400 món vào đây. Quy tắc là **chỉ gộp thứ Home cần để vẽ chính nó**.

## Ô 5 — Vòng đời

```
Mở app → (bootstrap, auth, master data — xem client-server-flow)
      → GET /home
      → Hiện Home với dữ liệu cache, khoá các nút chưa sẵn sàng
      → Dữ liệu về: mở khoá nút, cập nhật số, tính chấm đỏ
      → Người chơi rời đi: HUỶ mọi request đang bay
      → Quay lại từ màn khác: refresh nhẹ, không tải lại toàn bộ
```

Hai điểm dễ sai:

- **Quay lại từ màn khác không được tải lại tất cả.** Người chơi vừa mua đồ trong shop thì chỉ cần cập nhật ví, không cần tải lại đội hình và sự kiện.
- **Vào game lại sau khi treo nền lâu** thì phải refresh — sự kiện có thể đã hết, nhiệm vụ ngày có thể đã reset. Mốc reset lấy theo giờ server, không theo đồng hồ máy.

## Ô 6 — Trạng thái rỗng và lỗi

| Trạng thái | Hiện gì |
|---|---|
| Người chơi hoàn toàn mới | Ẩn bớt ô, chỉ để nút CHƠI — xem [[onboarding]] |
| Chưa có dữ liệu (đang tải) | Khung xám giữ chỗ, **không** phải vòng xoay toàn màn |
| Mất mạng | Hiện dữ liệu cache kèm nhãn "đang đồng bộ" + nút thử lại; **không** chặn màn |
| Server bảo trì | Thông báo kèm thời gian dự kiến, chặn vào trận |
| Bản quá cũ | Màn ép cập nhật, nút duy nhất là mở store — xem [[project-contract]] |

Luật: **mất mạng không được biến Home thành màn trắng.** Người chơi vẫn xem được đội hình và số dư gần nhất; chỉ những hành động cần server mới bị khoá.

## Ô 7 — Số liệu

- **Thời gian từ mở app tới Home dùng được** — ngân sách dưới 5 giây, xem [[client-server-flow]].
- **Tỉ lệ chạm nút CHƠI trong 10 giây đầu** — chỉ số trực tiếp cho câu hỏi "Home có rõ không".
- **Phân bố lượt chạm theo ô** — ô nào không ai chạm trong một tháng thì nó đang chiếm chỗ vô ích.
- **Tỉ lệ quay lại Home rồi thoát app** ngay — dấu hiệu Home không đưa ra được lý do chơi tiếp.

## Ô 8 — Vận hành

Ba thứ phải đổi được từ server, không cần build lại:

1. **Ô nào hiện, thứ tự nào** — để bật sự kiện và tắt tính năng hỏng.
2. **Banner và ảnh sự kiện** — tải từ CDN, có kích thước dự phòng khi tải lỗi.
3. **Thông báo trong game** — kênh nói chuyện khi có sự cố, xem [[project-launch]].

## Bẫy thường gặp

- **Home phình theo thời gian.** Không ai sở hữu nó nên mọi tính năng đều thêm được một nút.
- **Chấm đỏ là trường server gửi xuống.** Sớm muộn lệch với thực tế; người chơi bấm vào không thấy gì.
- **Bảy request khi vào Home.** Một cái chậm là cả màn chậm.
- **Tải lại toàn bộ mỗi lần quay về.** Tốn băng thông và làm màn nhấp nháy.
- **Reset nhiệm vụ theo đồng hồ máy.** Người chơi chỉnh giờ là nhận thưởng nhiều lần.
- **Vòng xoay toàn màn khi tải.** Khung giữ chỗ cho cảm giác nhanh hơn dù cùng thời gian.
- **Hai nút to bằng nhau ở vùng dưới.** Người chơi mới phải đọc chữ mới biết bấm gì.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho màn Home**

Home là màn **ít nên giao cho AI nhất về mặt thiết kế** vì nó là kết quả của ưu tiên sản phẩm. Nhưng có ba việc nó làm tốt:

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Soi ưu tiên | Khi Home đã phình | "Đây là danh sách 14 thứ trên Home. Sắp theo mức đóng góp vào việc người chơi bấm CHƠI" |
| Sinh logic chấm đỏ | Khi làm điều hướng | "Viết hàm tính chấm đỏ từ trạng thái này, thuần tuý suy ra, không lưu trạng thái riêng" |
| Liệt kê trạng thái | Trước khi code UI | "Liệt kê mọi trạng thái Home: mới tinh, mất mạng, bảo trì, bản cũ, sự kiện vừa hết" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Hành động chính của game là gì** — không nói thì nó làm mọi nút bằng nhau.
- **Có bao nhiêu loại tài nguyên** và loại nào cần trên HUD.
- **Ô tính năng đến từ server hay cố định**.
- **Người chơi mới thấy gì** — mở dần hay hiện hết.

**Mẫu prompt**

```
Game <thể loại>, Unity. Hành động chính: <vào trận>. Tài nguyên hiện trên HUD: vàng, đá quý.
Ô tính năng đến từ cấu hình server, tối đa 4 ô ở vùng cạnh.

Việc 1: thiết kế bố cục Home theo ba vùng (trên / giữa / dưới + cạnh),
ghi rõ cái gì ở đâu và vì sao.
Việc 2: viết hàm tính chấm đỏ — SUY RA từ trạng thái, không phải trường server gửi xuống.
Liệt kê mọi nguồn có thể sinh chấm đỏ.
Việc 3: liệt kê mọi trạng thái Home có thể rơi vào và hiện gì ở mỗi trạng thái.

Ràng buộc:
- Nút hành động chính phải là phần tử to nhất, không có nút nào cạnh tranh.
- Vào Home chỉ gọi MỘT request tổng hợp.
- Mất mạng KHÔNG được làm màn trắng — hiện cache kèm nhãn đang đồng bộ.
- Reset theo giờ SERVER, không theo đồng hồ máy.
```

**Bẫy thường gặp:** AI thiết kế Home như một bảng điều khiển — hiện mọi thứ, mọi nút bằng nhau — vì nó không biết cái gì quan trọng trong game của bạn. Bẫy thứ hai: nó lưu chấm đỏ thành trường riêng cho "hiệu quả", rồi trường đó lệch. Bẫy thứ ba: nó gọi một request cho mỗi ô vì như thế code sạch hơn.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Màn Home của một game mobile cần có gì?**
  → Ba vùng: trên là tài nguyên và thông tin người chơi, giữa là nhân vật hoặc bối cảnh, dưới là nút hành động chính cùng thanh điều hướng. Cộng một vùng cạnh cho sự kiện và tính năng phụ. Luật quan trọng nhất là **một hành động chính không bị cạnh tranh** — nếu có hai nút to bằng nhau thì không nút nào là chính.
- `Junior` **Vì sao vào Home chỉ nên gọi một request?**
  → Vì bảy request song song trên mạng 4G là bảy cơ hội để một cái chậm làm hỏng cả màn, và thời gian tới lúc Home dùng được là thứ người chơi cảm nhận rõ nhất. Gộp thành một endpoint trả về ví, hồ sơ, danh sách ô và sự kiện — nhưng chỉ gộp thứ Home cần để vẽ chính nó, đừng nhét cả túi đồ vào.
- `Mid` **Chấm đỏ nên lưu ở đâu?**
  → Không lưu. Nó là kết quả **suy ra** từ trạng thái: có nhiệm vụ nhận được, có quà chưa lấy, có nâng cấp đủ tiền. Làm thành trường server gửi xuống thì sớm muộn nó lệch với thực tế, và chấm đỏ bấm vào không thấy gì là thứ người chơi ghét nhất — nó phá niềm tin vào mọi chấm đỏ khác.
- `Mid` **Mất mạng thì Home hiện gì?**
  → Hiện dữ liệu cache gần nhất kèm nhãn "đang đồng bộ" và nút thử lại, chỉ khoá những hành động cần server. Tuyệt đối không để màn trắng hay chặn toàn màn — người chơi vẫn xem được đội hình và số dư gần nhất, và cảm giác app còn sống quan trọng hơn việc mọi con số đều mới nhất.
- `Senior` **Home phình ra mười bốn nút sau sáu tháng. Anh xử lý thế nào?**
  → Trước hết là **đo**: phân bố lượt chạm theo ô, ô nào không ai chạm trong một tháng thì nó đang chiếm chỗ vô ích. Sau đó đặt luật cấu trúc — giới hạn số ô cứng, ví dụ bốn, và thứ tự do server quyết; tính năng thứ năm phải đẩy cái thứ tư ra. Có luật thì cuộc thảo luận chuyển từ "ai to tiếng hơn" sang "cái nào đáng hơn theo số".
- `Senior` **Vì sao mốc reset phải theo giờ server?**
  → Vì theo đồng hồ máy thì người chơi chỉnh giờ là nhận thưởng ngày nhiều lần. Và còn một lý do vận hành: theo giờ server thì bạn biết chính xác lúc nào tải dồn lên — thường là ngay sau mốc reset — nên chuẩn bị được, thay vì bị tải rải rác theo múi giờ từng máy.

**Khung trả lời 60 giây** — "Thiết kế màn Home cho game mobile"

> Mục tiêu của Home tôi viết thành một câu: trong **hai giây**, người chơi biết việc đáng làm nhất lúc này và chạm một lần là tới đó. Cách kiểm là đưa máy cho người chưa chơi bao giờ, đếm tới hai, hỏi họ bấm gì.
>
> Bố cục ba vùng: trên là tài nguyên — chỉ những loại cần để ra quyết định, không phải tất cả; giữa là nhân vật, vùng to nhất nhưng ít chức năng nhất vì nó bán cảm giác; dưới là **nút chơi, phần tử to nhất màn hình**, không có nút nào cạnh tranh.
>
> Về dữ liệu, tôi gọi một request tổng hợp thay vì bảy, và **danh sách ô tính năng đến từ cấu hình server** — nếu không thì bật một sự kiện phải chờ store duyệt. Chấm đỏ thì suy ra từ trạng thái chứ không lưu, để nó không bao giờ lệch.

**Họ sẽ đào tiếp**

- *"Quay lại Home từ shop thì tải lại gì?"* → Chỉ ví và chấm đỏ, không tải lại đội hình và sự kiện. Tải lại toàn bộ vừa tốn băng thông vừa làm màn nhấp nháy, và người chơi đi qua Home hàng chục lần mỗi phiên.
- *"Người chơi mới thấy Home thế nào?"* → Ẩn bớt, chỉ để nút chơi, rồi mở dần theo tiến trình. Người mới phải học quá ba lối đi trong phiên đầu là quá nhiều — và cách xử lý là mở dần, không phải bớt tính năng.
- *"Đang tải thì hiện gì?"* → Khung xám giữ chỗ, không phải vòng xoay toàn màn. Cùng thời gian nhưng cảm giác nhanh hơn, và người chơi thấy trước cấu trúc màn sắp hiện ra.
- *"Đo gì để biết Home tốt?"* → Thời gian tới lúc Home dùng được, tỉ lệ chạm nút chơi trong mười giây đầu, phân bố chạm theo ô, và tỉ lệ vào Home rồi thoát app ngay — cái cuối là dấu hiệu Home không đưa ra được lý do chơi tiếp.
- *"Ai sở hữu Home?"* → Phải có **một người** quyết cái gì được lên. Không có thì mọi tính năng đều thêm được một nút, và không ai chịu trách nhiệm khi nó rối.

**Cờ đỏ**

- Hai nút to bằng nhau ở vùng hành động chính.
- Chấm đỏ lưu thành trường riêng do server gửi xuống.
- Bảy request khi vào Home.
- Màn trắng khi mất mạng.
- Reset nhiệm vụ theo đồng hồ máy.
- Danh sách ô tính năng cố định trong build.
- "Chúng tôi hiện hết mọi thứ để người chơi tự chọn."

**Số / ví dụ nên thuộc**

- Home phải trả lời "làm gì tiếp" trong khoảng **2 giây**.
- Thời gian từ mở app tới Home dùng được: ngân sách **dưới 5 giây**.
- Vùng cạnh: giới hạn cứng, ví dụ **tối đa 4 ô**, thứ tự do server quyết.
- Vào Home: **một** request tổng hợp.

**Kể trong dự án**

- *"Anh có làm Home không?"* → Nếu có, kể **con số bạn cải thiện**: thời gian vào Home, hoặc tỉ lệ chạm nút chơi. Home là màn dễ có số nhất vì nó được đi qua nhiều nhất.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: chấm đỏ hiện mà bấm vào không có gì, khiếu nại nhiều mà không tái hiện được. Kể cách bạn chuyển chấm đỏ từ trường lưu sẵn sang suy ra từ trạng thái, và vì sao cách cũ luôn lệch.
- *"Anh xử lý tranh chỗ trên Home thế nào?"* → Câu trả lời tốt nói về **luật và số liệu**, không về đàm phán: giới hạn số ô, thứ tự do server, và dữ liệu chạm theo ô để quyết định cái nào ra đi.
