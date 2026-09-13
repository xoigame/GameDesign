---
id: project-launch
title: Soft launch và ngày đầu tiên
summary: Mở cho ai trước, bốn chỉ số phải nhìn trong 24 giờ đầu, runbook 15 phút đầu khi có sự cố, và thứ tự tắt tính năng khi hệ thống quá tải.
status: deep
read: 970
level: advanced
order: 70
tags: [project, launch, liveops, monitoring, incident]
related: [go-deploy-ops, liveops, playtesting-metrics, project-milestones]
---

Ngày phát hành không phải vạch đích. Nó là ngày hệ thống của bạn gặp **người dùng thật trên mạng thật** lần đầu — và mọi giả định sai sẽ lộ ra trong vài giờ.

Node này nói về khoảng thời gian hẹp đó: một tuần trước, và 48 giờ sau.

## Soft launch: mở hẹp, mở thật

Soft launch không phải bản beta cho bạn bè. Nó là **phát hành thật, ở thị trường nhỏ**, để đo số liệu thật với người không quen bạn.

| Tiêu chí chọn thị trường | Vì sao |
|---|---|
| Nhỏ, đủ người để có số liệu | Vài nghìn lượt cài là đủ thấy xu hướng giữ chân |
| Hành vi gần thị trường đích | Số liệu mới suy ra được |
| Rẻ để mua lượt cài | Bạn sẽ thử vài vòng |
| Không phải thị trường lớn nhất của bạn | Hỏng thì không đốt cháy thị trường quan trọng |

Điều quan trọng hơn việc chọn nước nào: **mở theo bậc thang**. 1% lưu lượng, xem một ngày; 10%, xem ba ngày; rồi mới mở rộng. Mở hết ngay ngày đầu là tự bỏ cơ hội sửa trước khi nhiều người gặp lỗi.

## Bốn chỉ số của 24 giờ đầu

Đừng nhìn hai mươi biểu đồ. Bốn con số, có ngưỡng, và biết trước sẽ làm gì khi vượt:

| Chỉ số | Ngưỡng đáng báo động | Thường là dấu hiệu của |
|---|---|---|
| **Tỉ lệ lỗi 5xx** | vượt 1% tổng request | Bug trong handler, hoặc database quá tải |
| **p99 latency của API** | gấp 3 lần bình thường | Query thiếu index, hoặc cạn pool kết nối |
| **Tỉ lệ hoàn tất onboarding** | dưới 70% người cài | Kẹt ở một bước cụ thể — thường là đăng nhập hoặc tải dữ liệu |
| **Tỉ lệ crash phiên** | vượt 1% | Xem [[unity-debug-crash]] |

Chỉ số thứ ba là chỉ số hay bị quên và nó đo thứ quan trọng nhất trong ngày đầu: **người chơi có vào được game không**. Kỹ thuật có thể xanh toàn bộ trong khi một nửa người cài không qua nổi màn đăng nhập, vì một nút bị che trên màn hình tỉ lệ lạ.

Chi tiết về chỉ số dài hạn — giữ chân ngày 1/7/30, doanh thu — ở [[liveops]] và [[playtesting-metrics]]. Ngày đầu thì bốn con số trên là đủ.

## Runbook: 15 phút đầu khi có sự cố

Viết trước, in ra, dán chỗ nhìn thấy. Lúc sự cố không ai nghĩ ra quy trình.

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Runbook 15 phút đầu khi có sự cố: xác nhận phạm vi, bật thông báo cho người chơi, tìm thay đổi gần nhất, quyết định rollback hay tắt tính năng, rồi mới tìm nguyên nhân gốc">
  <defs>
    <marker id="plc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="14"  y="70" width="112" height="74" rx="9" class="fig-box"/>
    <rect x="146" y="70" width="112" height="74" rx="9" class="fig-box"/>
    <rect x="278" y="70" width="112" height="74" rx="9" class="fig-box"/>
    <rect x="410" y="70" width="112" height="74" rx="9" class="fig-box"/>
    <rect x="542" y="70" width="104" height="74" rx="9" class="fig-box"/>
  </g>
  <text x="330" y="34" text-anchor="middle" class="fig-label" font-size="13">Thứ tự cố định — không đảo, không bỏ bước</text>
  <text x="330" y="54" text-anchor="middle" class="fig-muted" font-size="10">Tìm nguyên nhân gốc là việc của bước 5, không phải bước 1</text>
  <text x="70"  y="94"  text-anchor="middle" class="fig-label" font-size="11">1 · Phạm vi</text>
  <text x="70"  y="114" text-anchor="middle" class="fig-muted" font-size="9">bao nhiêu % người</text>
  <text x="70"  y="130" text-anchor="middle" class="fig-muted" font-size="9">chịu ảnh hưởng</text>
  <text x="202" y="94"  text-anchor="middle" class="fig-label" font-size="11">2 · Báo</text>
  <text x="202" y="114" text-anchor="middle" class="fig-muted" font-size="9">bật thông báo</text>
  <text x="202" y="130" text-anchor="middle" class="fig-muted" font-size="9">trong game</text>
  <text x="334" y="94"  text-anchor="middle" class="fig-label" font-size="11">3 · Đổi gì</text>
  <text x="334" y="114" text-anchor="middle" class="fig-muted" font-size="9">deploy, master data</text>
  <text x="334" y="130" text-anchor="middle" class="fig-muted" font-size="9">hay cờ tính năng</text>
  <text x="466" y="94"  text-anchor="middle" class="fig-label" font-size="11">4 · Chặn máu</text>
  <text x="466" y="114" text-anchor="middle" class="fig-muted" font-size="9">rollback hoặc</text>
  <text x="466" y="130" text-anchor="middle" class="fig-muted" font-size="9">tắt tính năng</text>
  <text x="594" y="94"  text-anchor="middle" class="fig-label" font-size="11">5 · Nguyên nhân</text>
  <text x="594" y="114" text-anchor="middle" class="fig-muted" font-size="9">sau khi đã</text>
  <text x="594" y="130" text-anchor="middle" class="fig-muted" font-size="9">hết chảy máu</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#plc-a)" fill="none">
    <path d="M126 107 H142"/>
    <path d="M258 107 H274"/>
    <path d="M390 107 H406"/>
    <path d="M522 107 H538"/>
  </g>
  <text x="330" y="186" text-anchor="middle" class="fig-muted" font-size="10">Ghi giờ của từng bước ngay lúc làm — sau này không ai nhớ nổi trình tự</text>
  <text x="330" y="210" text-anchor="middle" class="fig-muted" font-size="10">Người chơi tha thứ cho lỗi được thông báo; không tha thứ cho màn hình treo im lặng</text>
</svg>
<figcaption>Bước 2 đứng trước bước 5 là có chủ ý. Một dòng thông báo trung thực mua cho bạn hàng giờ thiện chí.</figcaption>
</figure>

Bước 3 đáng nói thêm: **hầu hết sự cố đến từ một thay đổi gần đây**. Nên câu hỏi đầu tiên luôn là "nửa giờ qua có gì đổi" — deploy, bản master data mới, một cờ tính năng ai đó bật. Mở nhật ký thay đổi trước khi mở log.

## Cầu dao: thứ tự tắt khi quá tải

Chuẩn bị trước danh sách này, và cho phép tắt **bằng cấu hình chứ không phải bằng deploy**:

| Thứ tự tắt | Tính năng | Người chơi mất gì |
|---|---|---|
| 1 | Bảng xếp hạng toàn cầu | Không thấy hạng — ít ai để ý trong một giờ |
| 2 | Chat, mạng xã hội | Khó chịu, không mất mát |
| 3 | Sự kiện, nhiệm vụ phụ | Mất một phần nội dung tạm thời |
| 4 | Ghép trận | Không chơi PvP được — nhưng vẫn chơi được phần solo |
| **Không bao giờ tắt** | Đăng nhập, ví tiền, IAP | Tắt là mất niềm tin và mất tiền thật |

Nguyên tắc: tắt từ ngoài vào trong, giữ cái lõi sống. Một game chỉ còn chế độ solo vẫn là game; một game không đăng nhập được thì không còn gì.

Cờ tính năng phải đọc từ server và có hiệu lực **không cần cập nhật app**. Xây nó ở chặng hợp đồng ([[project-contract]]), không phải lúc sự cố.

## Chuẩn bị một tuần trước

- [ ] Chạy thử **rollback** ở staging — không phải đọc tài liệu, mà làm thật một lần
- [ ] Kiểm tra sao lưu database: **phục hồi thử** vào một instance trống ([[game-database]])
- [ ] Bốn cảnh báo có ngưỡng, gửi tới nơi người trực thật sự nhìn thấy
- [ ] Màn hình bảo trì thử được bằng một công tắc
- [ ] Danh sách cầu dao, đã thử tắt từng cái ở staging
- [ ] Biết ai trực giờ nào trong 48 giờ đầu, và người đó có quyền rollback
- [ ] Bot tải chạy thử ở mức gấp 3 lần lưu lượng dự kiến ([[go-gamedev-tools]])

Dòng thứ hai là dòng hay được đánh dấu mà chưa từng làm. Bản sao lưu chưa phục hồi thử lần nào **không phải là bản sao lưu**, nó là một file bạn hy vọng dùng được.

## Bẫy thường gặp

- **Mở hết lưu lượng ngay ngày đầu.** Mất cơ hội sửa trước khi nhiều người gặp lỗi.
- **Không có cách thông báo trong game.** Người chơi thấy treo và tự kết luận game hỏng.
- **Cờ tính năng cần deploy mới đổi được.** Đúng lúc cần nhất thì chậm nhất.
- **Tìm nguyên nhân gốc trước khi chặn máu.** Trong lúc đó người chơi vẫn đang mất dữ liệu.
- **Cảnh báo gửi vào kênh không ai đọc.** Hệ thống giám sát tồn tại trên giấy.
- **Đo tải bằng cảm giác.** Bot tải rẻ hơn nhiều so với một buổi tối sập server.

## 🤖 Prompt cho AI

**Dùng AI thế nào quanh ngày phát hành**

Trước ngày phát hành, AI hữu ích ở việc **soạn runbook và nghĩ ra trường hợp hỏng** — con người dưới áp lực nghĩ không hết. Trong lúc sự cố thì đừng hỏi AI trước; theo runbook đã viết, xong rồi mới dùng AI để phân tích log.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Soạn runbook | Một tuần trước | "Với kiến trúc này, liệt kê 8 sự cố dễ xảy ra nhất trong 48 giờ đầu và cách xử lý từng cái" |
| Đọc log sau sự cố | Sau khi đã chặn máu | "Đây là log quanh thời điểm lỗi, tìm sự kiện bất thường sớm nhất" |
| Viết báo cáo sự cố | Trong ngày | "Từ dòng thời gian này, viết báo cáo: ảnh hưởng, nguyên nhân, cách chặn tái diễn" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Kiến trúc thật**: mấy process, database gì, có room server không.
- **Quy mô dự kiến** và mức đã test tới đâu.
- **Cái gì tắt được bằng cấu hình**, cái gì phải deploy.
- **Ai trực và có quyền gì** — runbook mà người trực không có quyền rollback thì vô dụng.

**Mẫu prompt**

```
Kiến trúc: API Go stateless (3 bản) + room server (2 máy) + Postgres + Redis.
Client Unity, Android. Dự kiến 5.000 CCU đỉnh. Đã test tải tới 8.000 CCU.
Tắt được bằng cấu hình: bảng xếp hạng, chat, sự kiện, ghép trận.

Việc: soạn runbook cho 48 giờ đầu. Với TỪNG sự cố:
tên | dấu hiệu quan sát được | bước xử lý theo thứ tự | ai làm được | mất bao lâu.

Ràng buộc:
- Bước đầu tiên luôn là xác định phạm vi ảnh hưởng, KHÔNG phải tìm nguyên nhân.
- Mỗi sự cố phải có phương án chặn máu dùng được trong 5 phút.
- KHÔNG đề xuất giải pháp cần deploy code mới như bước đầu tiên.
- Xếp theo xác suất xảy ra, không theo mức nghiêm trọng.
```

**Bẫy thường gặp:** AI viết runbook đọc như tài liệu kiến trúc — dài, đúng, và vô dụng lúc 2 giờ sáng. Ép nó viết mỗi bước thành một hành động làm được ngay. Bẫy thứ hai: nó đề xuất "sửa bug rồi deploy" làm bước một, trong khi bước một phải là chặn máu bằng thứ đã có sẵn.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Soft launch để làm gì, sao không phát hành luôn?**
  → Để đo số liệu thật với người không quen bạn, ở một thị trường nhỏ, trước khi đốt thị trường quan trọng. Và để mở theo bậc thang — 1% lưu lượng xem một ngày, 10% xem ba ngày, rồi mới rộng — vì mở hết ngay ngày đầu là tự bỏ cơ hội sửa trước khi nhiều người gặp lỗi.
- `Junior` **Ngày đầu anh nhìn những chỉ số nào?**
  → Bốn con số có ngưỡng sẵn: tỉ lệ lỗi 5xx vượt 1%, p99 latency gấp ba lần bình thường, tỉ lệ hoàn tất onboarding dưới 70%, và tỉ lệ crash vượt 1%. Cái thứ ba hay bị quên nhưng nó đo thứ quan trọng nhất ngày đầu — người chơi có vào được game không; kỹ thuật xanh hết mà một nửa người cài kẹt ở màn đăng nhập là chuyện có thật.
- `Mid` **Server quá tải lúc 8 giờ tối. Mười lăm phút đầu anh làm gì?**
  → Theo runbook, thứ tự cố định: xác định phạm vi ảnh hưởng; bật thông báo trong game; xem nửa giờ qua có gì đổi — deploy, master data mới, hay ai vừa bật một cờ; rồi chặn máu bằng rollback hoặc kéo cầu dao. Tìm nguyên nhân gốc là bước năm, sau khi đã hết chảy máu.
- `Mid` **Vì sao báo cho người chơi trước cả khi biết nguyên nhân?**
  → Vì thông tin rẻ mà thiện chí đắt. Một dòng "chúng tôi đang xử lý, dự kiến 30 phút" mua cho bạn hàng giờ kiên nhẫn; im lặng thì người chơi tự kết luận game hỏng và đi đánh giá một sao. Người chơi tha thứ cho lỗi được thông báo, không tha thứ cho màn hình treo im lặng.
- `Senior` **Tắt tính năng theo thứ tự nào, và cái gì không bao giờ tắt?**
  → Từ ngoài vào trong: bảng xếp hạng, chat, sự kiện, rồi ghép trận. Không bao giờ tắt đăng nhập, ví tiền và IAP — game còn mỗi chế độ solo vẫn là game, game không đăng nhập được thì không còn gì. Và cầu dao phải tắt được bằng cấu hình đọc từ server, dùng được trong năm phút mà không cần deploy.
- `Senior` **Kể một sự cố production anh đã xử lý.**
  → Câu trả lời tốt có bốn phần: dòng thời gian có giờ giấc, cách phát hiện (từ cảnh báo hay từ người chơi báo), cách chặn máu trong vài phút đầu, và **thay đổi cụ thể để không lặp lại** — thêm một cảnh báo, một cầu dao, một bước trong quy trình deploy. Phần cuối mới là phần người phỏng vấn chờ nghe.

**Khung trả lời 60 giây** — "Server quá tải lúc 8 giờ tối, 15 phút đầu làm gì?"

> Theo runbook, và thứ tự cố định. Bước một: **xác định phạm vi** — bao nhiêu phần trăm người chơi bị, ở khu vực nào, tính năng nào. Bước hai: **bật thông báo trong game**, vì người chơi tha thứ cho lỗi được báo trước, nhưng không tha thứ cho màn hình treo im lặng.
>
> Bước ba: **nửa giờ qua có gì đổi** — deploy, bản master data mới, hay ai đó vừa bật một cờ tính năng. Phần lớn sự cố đến từ một thay đổi gần đây, nên tôi mở nhật ký thay đổi trước khi mở log.
>
> Bước bốn: **chặn máu** — rollback nếu do deploy, hoặc kéo cầu dao: tắt bảng xếp hạng, tắt chat, tắt sự kiện, tắt ghép trận, theo đúng thứ tự đó. Không bao giờ tắt đăng nhập và ví tiền. Tìm nguyên nhân gốc là bước năm, sau khi đã hết chảy máu.

**Họ sẽ đào tiếp**

- *"Vì sao báo cho người chơi trước cả khi biết nguyên nhân?"* → Vì thông tin rẻ và thiện chí đắt. Một dòng "chúng tôi đang xử lý, dự kiến 30 phút" mua cho bạn hàng giờ kiên nhẫn. Im lặng thì người chơi tự kết luận và đi đánh giá một sao.
- *"Tắt theo thứ tự nào?"* → Từ ngoài vào trong: bảng xếp hạng, chat, sự kiện, rồi ghép trận. Giữ lõi sống — đăng nhập, ví, IAP không bao giờ tắt. Game còn mỗi chế độ solo vẫn là game; game không đăng nhập được thì không còn gì.
- *"Cờ tính năng đặt ở đâu?"* → Server, đọc qua endpoint config, có hiệu lực không cần cập nhật app. Nếu phải deploy mới tắt được thì đúng lúc cần nhất nó lại chậm nhất.
- *"Bốn chỉ số?"* → Tỉ lệ 5xx, p99 latency, tỉ lệ hoàn tất onboarding, tỉ lệ crash. Cái thứ ba hay bị quên nhưng nó đo thứ quan trọng nhất ngày đầu: người chơi có vào được game không. Kỹ thuật xanh hết mà một nửa người cài kẹt ở màn đăng nhập là chuyện có thật.
- *"Rollback đã thử bao giờ chưa?"* → Phải thử ở staging trước ngày phát hành. Và sao lưu chưa phục hồi thử lần nào thì không phải sao lưu — nó là một file mình hy vọng dùng được.

**Cờ đỏ**

- Tìm nguyên nhân gốc trước khi chặn máu.
- Không có cách nào nói chuyện với người chơi khi hệ thống hỏng.
- Cờ tính năng nằm trong build client.
- "Chúng tôi có sao lưu" mà chưa từng phục hồi thử.
- Mở 100% lưu lượng ngày đầu tiên.
- Kể sự cố mà không nói được đã thay đổi gì để không lặp lại.

**Số / ví dụ nên thuộc**

- Ngưỡng báo động: 5xx vượt **1%**, p99 gấp **3 lần**, crash vượt **1%**, onboarding dưới **70%**.
- Mở theo bậc: **1% → 10% → rộng**, mỗi bậc xem 1–3 ngày.
- Chặn máu phải dùng được trong **5 phút**, không cần deploy.
- Bot tải thử ở mức **gấp 3** lưu lượng dự kiến.

**Kể trong dự án**

- *"Anh có trực phát hành không?"* → Nếu có, kể **một ca trực cụ thể** với dòng thời gian: mấy giờ phát hiện, làm gì, bao lâu thì ổn. Dòng thời gian có giờ giấc nghe khác hẳn lời kể chung chung.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: mọi chỉ số kỹ thuật đều xanh nhưng người chơi không vào được, vì lỗi chỉ xảy ra trên một dòng máy hoặc một nhà mạng. Kể cách bạn thu hẹp phạm vi từ dữ liệu chứ không từ phỏng đoán.
- *"Anh thay đổi gì sau sự cố?"* → Đây là phần quan trọng nhất của câu chuyện. Một biện pháp cụ thể — thêm cảnh báo, thêm cầu dao, thêm một bước trong quy trình deploy — đáng giá hơn cả đoạn kể về đêm thức trắng.
