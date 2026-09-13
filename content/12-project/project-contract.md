---
id: project-contract
title: Hợp đồng giữa client và server
summary: Ba version độc lập phải theo dõi, luật đổi message mà không vỡ client cũ, bảng mã lỗi dùng chung, và vì sao hợp đồng phải là code chứ không phải tài liệu.
status: deep
read: 940
level: advanced
order: 40
tags: [project, contract, protocol, versioning, api]
related: [go-protobuf, client-server-flow, master-data, unity-network-client]
---

Client đã lên store thì **không cập nhật được**. Đó là câu duy nhất cần nhớ, và mọi luật trong node này là hệ quả của nó.

Trên web bạn sửa bug rồi deploy, mười phút sau không ai còn chạy bản cũ. Trên store, một tuần sau khi phát hành bản mới vẫn còn 30–50% người chơi ở bản cũ, và luôn có một nhóm ở bản từ sáu tháng trước. Server của bạn phải **đồng thời đúng** với tất cả.

## Hợp đồng là code, không phải tài liệu

Tài liệu mô tả API trên wiki có một tính chất chết người: nó lệch với thực tế mà **không ai biết**. Hợp đồng dạng code thì lệch là gãy build.

| Cách làm | Lệch schema lộ ra khi nào | Dùng khi |
|---|---|---|
| Tài liệu trên wiki | Lúc chạy, ở máy người chơi | Không bao giờ |
| JSON + class viết tay hai phía | Lúc chạy, thường ở QA | Dự án rất nhỏ, một người làm cả hai phía |
| **OpenAPI sinh client** | Lúc build | REST thuần, meta game |
| **`.proto` sinh cả `.go` và `.cs`** | Lúc build | Có realtime, hoặc cần chặt chẽ — xem [[go-protobuf]] |

Với dự án có server riêng, mặc định đúng là **`.proto` là nguồn chân lý duy nhất**, đặt trong repo dùng chung, sinh code cho cả hai phía trong CI. Không ai được sửa struct đã sinh bằng tay.

Điều này không có nghĩa phải dùng protobuf làm định dạng truyền. Hoàn toàn hợp lý khi dùng `.proto` chỉ để **định nghĩa và sinh code**, còn truyền bằng JSON cho dễ debug bằng `curl`, rồi chuyển sang nhị phân cho riêng kênh realtime khi cần.

## Ba version, độc lập nhau

Đây là chỗ hầu hết dự án nhầm: gộp ba thứ khác nhau vào một con số.

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Ba version độc lập trong một dự án game: app build trên store, API version, và master data version, mỗi cái có nhịp đổi và cách xử lý tương thích khác nhau">
  <g class="fig-box-g">
    <rect x="20"  y="40"  width="190" height="170" rx="9" class="fig-box"/>
    <rect x="234" y="40"  width="190" height="170" rx="9" class="fig-box"/>
    <rect x="448" y="40"  width="190" height="170" rx="9" class="fig-box"/>
  </g>
  <text x="115" y="24"  text-anchor="middle" class="fig-label" font-size="13">App build</text>
  <text x="329" y="24"  text-anchor="middle" class="fig-label" font-size="13">API</text>
  <text x="543" y="24"  text-anchor="middle" class="fig-label" font-size="13">Master data</text>
  <text x="115" y="70"  text-anchor="middle" class="fig-muted" font-size="11">1.4.2 (build 812)</text>
  <text x="115" y="96"  text-anchor="middle" class="fig-muted" font-size="10">Đổi: vài tuần một lần</text>
  <text x="115" y="118" text-anchor="middle" class="fig-muted" font-size="10">Ai quyết: store duyệt</text>
  <text x="115" y="140" text-anchor="middle" class="fig-muted" font-size="10">Rollback: KHÔNG được</text>
  <text x="115" y="168" text-anchor="middle" class="fig-muted" font-size="10">Sống song song 3–5 bản</text>
  <text x="115" y="192" text-anchor="middle" class="fig-muted" font-size="10">Server phải đỡ hết</text>
  <text x="329" y="70"  text-anchor="middle" class="fig-muted" font-size="11">v1 (thêm field, không phá)</text>
  <text x="329" y="96"  text-anchor="middle" class="fig-muted" font-size="10">Đổi: liên tục</text>
  <text x="329" y="118" text-anchor="middle" class="fig-muted" font-size="10">Ai quyết: đội backend</text>
  <text x="329" y="140" text-anchor="middle" class="fig-muted" font-size="10">Rollback: được, vài phút</text>
  <text x="329" y="168" text-anchor="middle" class="fig-muted" font-size="10">Chỉ lên v2 khi buộc phá</text>
  <text x="329" y="192" text-anchor="middle" class="fig-muted" font-size="10">v1 sống tới khi hết client cũ</text>
  <text x="543" y="70"  text-anchor="middle" class="fig-muted" font-size="11">1842 (bản bất biến)</text>
  <text x="543" y="96"  text-anchor="middle" class="fig-muted" font-size="10">Đổi: hằng ngày</text>
  <text x="543" y="118" text-anchor="middle" class="fig-muted" font-size="10">Ai quyết: designer</text>
  <text x="543" y="140" text-anchor="middle" class="fig-muted" font-size="10">Rollback: đổi con trỏ, tức thì</text>
  <text x="543" y="168" text-anchor="middle" class="fig-muted" font-size="10">Không bao giờ sửa tại chỗ</text>
  <text x="543" y="192" text-anchor="middle" class="fig-muted" font-size="10">Xem node master-data</text>
</svg>
<figcaption>Ba nhịp đổi khác nhau, ba người quyết khác nhau, ba cách rollback khác nhau. Gộp chúng vào một con số là tự trói mình.</figcaption>
</figure>

Hệ quả thực dụng: endpoint config ở mốc 1 của [[client-server-flow]] trả về cả ba con số, và client tự biết mình cần làm gì — chạy tiếp, tải master mới, hay hiện màn hình ép cập nhật.

## Bốn luật đổi message không vỡ client cũ

Áp dụng cho `.proto`, và đúng cả với JSON:

1. **Chỉ thêm, không bao giờ đổi nghĩa.** Field số 5 là `gold` thì vĩnh viễn là `gold`. Cần thứ khác thì thêm field số 12.
2. **Không tái sử dụng số field đã bỏ.** Đánh dấu `reserved` và quên nó đi. Dùng lại số cũ nghĩa là client cũ đọc dữ liệu mới bằng nghĩa cũ — sai lặng lẽ, không báo lỗi.
3. **Field mới phải có giá trị mặc định hợp lý.** Client cũ không gửi nó; server phải chạy đúng khi nhận giá trị rỗng.
4. **Bỏ field theo ba nhịp**: (a) server ngừng dùng nhưng vẫn nhận; (b) chờ tới khi số người dùng bản cũ đủ nhỏ — theo dõi bằng số liệu thật, không đoán; (c) mới bỏ khỏi `.proto`.

Luật thứ tư là luật hay bị bỏ qua nhất, và nó tốn **hàng tháng chờ đợi**, không phải hàng ngày. Hãy lên kế hoạch cho sự chờ đợi đó thay vì ngạc nhiên vì nó.

## Ép cập nhật: ba mức, không phải hai

Đừng chỉ có "cho chạy" và "chặn". Ba mức mới đủ dùng:

| Mức | Khi nào | Người chơi thấy |
|---|---|---|
| **Mềm** | Có bản mới, bản cũ vẫn chạy đúng | Thông báo có thể bỏ qua, một lần mỗi ngày |
| **Cứng** | Bản cũ có lỗi mất dữ liệu, hoặc API sắp bỏ | Chặn ở màn hình, nút duy nhất là mở store |
| **Bảo trì** | Server đang sửa | Thông báo kèm thời gian dự kiến, không đổ lỗi cho mạng người chơi |

Ba mức này phải có **từ bản phát hành đầu tiên**. Thêm sau thì đúng những người chơi bản lỗi lại là những người không nhận được thông báo — vì cơ chế thông báo nằm ở bản họ chưa cài.

## Mã lỗi: một bảng, dùng chung hai phía

Đừng trả lỗi bằng chuỗi tiếng Anh rồi để client so sánh chuỗi. Một bảng mã, sinh ra từ cùng file hợp đồng:

| Nhóm | Ví dụ | Client làm gì |
|---|---|---|
| `AUTH_*` | token hết hạn, token sai | Refresh rồi thử lại một lần; sai nữa thì về màn đăng nhập |
| `VERSION_*` | client quá cũ, master lệch | Hiện ép cập nhật hoặc tải lại master |
| `ECON_*` | không đủ tiền, hết hàng | Hiện đúng lý do, **không** thử lại |
| `RATE_*` | gọi quá nhanh | Chờ theo `retry_after` rồi thử lại |
| `TEMP_*` | database bận, quá tải | Thử lại có backoff, tối đa ba lần |
| `BUG_*` | server tự biết mình sai | Báo lỗi chung, gửi log, **không** thử lại |

Ranh giới quan trọng nhất là giữa `TEMP_*` (thử lại có ích) và mọi nhóm còn lại (thử lại chỉ làm tệ hơn). Không có ranh giới này thì client hoặc không bao giờ thử lại, hoặc thử lại cả những lỗi không bao giờ tự khỏi.

## Ra khỏi chặng này với cái gì

- [ ] Repo hợp đồng dùng chung, `.proto` hoặc OpenAPI, sinh code trong CI
- [ ] Ba version tách bạch, endpoint config trả về cả ba
- [ ] Bảng mã lỗi, có nhóm, client biết nhóm nào thì retry
- [ ] Ba mức cập nhật có sẵn ngay từ bản đầu
- [ ] Luật đánh số field viết thành văn bản, ai cũng đọc rồi

## Bẫy thường gặp

- **Sinh code rồi sửa tay.** Lần sinh sau xoá sạch, và không ai nhớ đã sửa gì.
- **Một version cho cả ba thứ.** Đổi một dòng trong bảng giá cũng phải bump API.
- **`optional` với `required` dùng tuỳ hứng.** Field bắt buộc thêm sau là phá vỡ tương thích, dù trình sinh code không báo gì.
- **Mã lỗi dạng chuỗi tiếng Anh.** Đổi chữ hoa chữ thường là client cũ hết nhận ra.
- **Không đo tỉ lệ phiên bản đang chạy.** Không có số liệu này thì không bao giờ dám bỏ field cũ.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc thiết kế hợp đồng**

Đây là chỗ AI làm tốt nhất trong cả nhánh: sinh `.proto`, sinh code hai phía, sinh bảng mã lỗi, và **rà soát tương thích ngược** của một thay đổi. Việc cuối là việc đáng giá nhất vì con người hay bỏ sót.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Sinh khung | Bắt đầu một nhóm message mới | "Soạn `.proto` cho luồng mua vật phẩm, có idempotency key" |
| Rà tương thích | Trước mỗi lần merge hợp đồng | "So hai bản `.proto` này, liệt kê mọi thay đổi phá vỡ client cũ" |
| Sinh bảng lỗi | Khi thêm nhóm tính năng | "Với các message này, đề xuất mã lỗi theo nhóm và hành vi retry tương ứng" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Chính sách version của bạn** — không nói thì AI tự đánh số lại field vô tư.
- **Truyền bằng JSON hay nhị phân** — ảnh hưởng tới cách đặt tên và cách nhúng enum.
- **Client cũ nhất còn phải đỡ là bản nào** — quyết định được phép bỏ field hay chưa.
- **Có idempotency key chưa**, và nó nằm ở đâu trong message.

**Mẫu prompt**

```
Đây là file contract hiện tại (proto). Đây là thay đổi tôi muốn: <mô tả>.

Việc 1: viết bản .proto mới.
Việc 2: liệt kê MỌI thay đổi phá vỡ tương thích với client đang chạy trên store,
theo bảng: thay đổi | client cũ sẽ thấy gì | cách làm lại cho không phá.
Việc 3: đề xuất kế hoạch ba nhịp nếu có field cần bỏ.

Ràng buộc:
- KHÔNG đổi số field đã tồn tại, KHÔNG dùng lại số đã reserved.
- Field mới phải chạy đúng khi client cũ không gửi nó.
- Mọi message làm đổi ví tiền phải có idempotency key, nêu rõ field nào.
- Nếu thay đổi tôi muốn về bản chất là phá vỡ tương thích, nói thẳng thay vì lách.
```

**Bẫy thường gặp:** AI đánh số lại field cho "gọn" khi viết lại file — đây là lỗi phá hoại và nó không tự nhận ra. Bẫy thứ hai: nó thêm field bắt buộc rồi bảo là tương thích ngược. Bẫy thứ ba: nó sinh mã lỗi dạng chuỗi mô tả thay vì mã ổn định, vì đọc dễ hơn.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao không đổi được API khi client đã lên store?**
  → Vì người chơi không cập nhật app. Một tuần sau khi ra bản mới vẫn còn phần lớn ở bản cũ, và luôn có một nhóm ở bản từ nhiều tháng trước. Server phải đồng thời đúng với tất cả các bản đó, nên mọi thay đổi phải là thêm chứ không phải đổi nghĩa.
- `Junior` **Idempotency key nằm ở đâu, ai sinh ra nó?**
  → Client sinh, một key cho một **hành động** chứ không phải một key cho mỗi lần gửi — bấm lại thì vẫn key cũ. Nó đi trong header hoặc trong message, và server lưu nó cùng transaction đổi ví. Key phải được ghi xuống đĩa trước khi gửi, để sống qua lần người chơi tắt app rồi mở lại.
- `Mid` **Anh cần thêm một field vào message đang chạy. Làm thế nào?**
  → Lấy một số field chưa dùng bao giờ, không đụng số cũ, và đảm bảo field đó chạy đúng khi client cũ không gửi nó — tức là giá trị rỗng phải có nghĩa hợp lý ở phía server. Không bao giờ đổi nghĩa của field đã tồn tại: field số 5 là `gold` thì vĩnh viễn là `gold`.
- `Mid` **Cần bỏ hẳn một field cũ thì làm sao?**
  → Ba nhịp. Một, server ngừng dùng nhưng vẫn nhận, client mới ngừng gửi. Hai, chờ — chờ thật, tính bằng tháng, theo dõi tỉ lệ phiên bản đang chạy chứ không đoán. Ba, khi bản cũ đã dưới ngưỡng chấp nhận được thì bỏ khỏi contract và đánh dấu số field là `reserved` để không ai dùng lại.
- `Senior` **Ba version nào trong dự án của anh, và vì sao không gộp làm một?**
  → App build, API, và master data. Ba nhịp đổi khác nhau — master data đổi hằng ngày do designer, API đổi liên tục do backend, app build đổi vài tuần một lần và phải qua store. Ba cách rollback cũng khác: master data đổi con trỏ là xong, API deploy lại, còn app build thì **không rollback được**. Gộp lại nghĩa là mỗi lần chỉnh giá cũng phải bump API.
- `Senior` **Tới bao giờ thì được phép ngừng đỡ client cũ?**
  → Khi số liệu thật cho thấy tỉ lệ người chơi ở bản đó đã dưới ngưỡng bạn chấp nhận mất — và phải là số liệu, không phải cảm giác. Trước đó thì công cụ duy nhất là ép cập nhật cứng, và nó chỉ dùng được khi bản cũ thật sự có lỗi mất dữ liệu, vì mỗi lần ép là một lần mất một phần người chơi.

**Khung trả lời 60 giây** — "Thêm field vào message đang chạy production?"

> Thêm thì dễ, **bỏ** mới khó. Thêm field là lấy một số chưa dùng bao giờ, không đụng số cũ, và field đó phải chạy đúng khi client cũ không gửi nó — tức là giá trị rỗng phải có nghĩa hợp lý ở phía server.
>
> Bỏ field thì tôi làm ba nhịp. Nhịp một, server ngừng dùng nhưng vẫn nhận, client mới ngừng gửi. Nhịp hai, chờ — và đây là chờ thật, tính bằng tháng, theo dõi tỉ lệ phiên bản đang chạy chứ không đoán. Nhịp ba, khi bản cũ còn dưới ngưỡng chấp nhận được thì mới bỏ khỏi contract và đánh dấu số field là `reserved`.
>
> Cái tôi không bao giờ làm là dùng lại số field đã bỏ. Client cũ sẽ đọc dữ liệu mới bằng nghĩa cũ, không báo lỗi gì cả — sai lặng lẽ là loại lỗi đắt nhất.

**Họ sẽ đào tiếp**

- *"Vì sao ba version chứ không một?"* → Vì ba nhịp đổi và ba người quyết khác nhau. Master data đổi hằng ngày do designer, rollback bằng cách trỏ lại con trỏ. API đổi liên tục do backend, rollback bằng deploy. App build đổi vài tuần một lần, do store duyệt, và **không rollback được**. Gộp lại nghĩa là mỗi lần designer chỉnh giá cũng phải bump API.
- *"Sao không để client tự cập nhật là xong?"* → Vì người chơi không cập nhật. Một tuần sau khi ra bản mới vẫn còn phần lớn ở bản cũ, và luôn có nhóm ở bản rất cũ. Đó là lý do phải có ba mức: nhắc mềm, ép cứng, và bảo trì — và cả ba phải có từ bản đầu tiên, vì thêm sau thì người cần nhất lại không nhận được.
- *"Hợp đồng để ở đâu?"* → Repo dùng chung, `.proto` là nguồn chân lý, CI sinh `.go` và `.cs`. Không ai sửa file sinh ra bằng tay. Lệch schema thành lỗi biên dịch thay vì lỗi ở máy người chơi.
- *"Mã lỗi thiết kế thế nào?"* → Theo nhóm, và nhóm quyết định hành vi client. Phân biệt quan trọng nhất là lỗi tạm thời — đáng thử lại có backoff — với lỗi nghiệp vụ như không đủ tiền, thử lại bao nhiêu cũng vô nghĩa.
- *"Bao giờ thì lên v2?"* → Chỉ khi buộc phải phá vỡ tương thích và không có cách thêm field nào thay được. v2 nghĩa là chạy song song hai bản cho tới khi client cũ hết — tốn kém, nên tránh tới lúc thật cần.

**Cờ đỏ**

- "Chúng tôi đổi API rồi bảo mọi người cập nhật app."
- Đánh số lại field khi refactor file contract.
- Thêm field bắt buộc rồi gọi đó là tương thích ngược.
- Không biết tỉ lệ người chơi đang ở phiên bản nào — nghĩa là chưa bao giờ dám bỏ gì.
- Sinh code từ contract rồi sửa tay file sinh ra.

**Số / ví dụ nên thuộc**

- Một tuần sau bản mới: vẫn còn phần lớn người chơi ở bản cũ; luôn có nhóm ở bản rất cũ.
- Ba version: app build · API · master data.
- Ba nhịp bỏ field: ngừng dùng → chờ (tính bằng tháng) → bỏ khỏi contract, đánh `reserved`.
- Ba mức cập nhật: mềm · cứng · bảo trì, có từ bản đầu tiên.

**Kể trong dự án**

- *"Anh thiết kế hợp đồng đó à?"* → Nếu contract có sẵn trước khi bạn vào, hãy kể **luật bạn thêm vào**: quy trình review contract, bước rà tương thích trong CI, hay bảng mã lỗi. Cải tiến quy trình là đóng góp đếm được.
- *"Khó khăn gặp phải?"* → Câu chuyện mạnh nhất ở chủ đề này: một thay đổi tưởng vô hại làm client cũ hỏng, và cách bạn phát hiện. Kể cả phần xử lý sự cố — bật lại field cũ, ra bản vá, rồi thêm bước kiểm tra tự động để không lặp lại.
- *"Nếu làm lại?"* → Câu trả lời thật và hay gặp: đưa bước rà tương thích vào CI **từ đầu** thay vì thêm sau lần vỡ đầu tiên. Người phỏng vấn nghe ra ngay là bạn đã sống qua chuyện đó.
