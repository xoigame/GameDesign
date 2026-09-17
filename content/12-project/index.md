---
id: project
title: Dựng một dự án game
icon: 🏗
summary: Tuyến xuyên suốt của một dự án game có client và server — từ lúc chốt phạm vi, chia ranh giới hai phía, ký hợp đồng message, tới lúc soft launch và kể lại nó trong phòng phỏng vấn.
status: deep
read: 900
level: intermediate
order: 70
map: true
mapLabel: Dự án
tags: [project, client-server, architecture, process, interview]
related: [backend-go, unity, production, blueprints]
---

Mười một nhánh kia cắt kiến thức **theo chủ đề**: kinh tế ở một chỗ, netcode ở một chỗ, database ở một chỗ. Cách cắt đó tốt để tra cứu, nhưng không ai làm game theo thứ tự đó.

Nhánh này cắt **theo thời gian của một dự án thật**. Cùng một kiến thức, xâu lại thành tuyến: tuần 1 chốt cái gì, tuần 6 phải chạy được cái gì, cái gì chốt sai thì tháng thứ tư trả giá.

**Giả định xuyên suốt:** một game mobile hoặc PC có **client Unity** và **server Go riêng** — tài khoản, ví, bảng xếp hạng, ghép trận nằm trên server, không phải game single-player lưu file local. Nếu dự án của bạn không có server, phần lớn nhánh này vẫn đúng nhưng ba node giữa ([[client-server-flow]], [[project-contract]], [[unity-network-client]]) sẽ thừa.

## Chín chặng, và cái giá của việc làm sai thứ tự

<figure class="fig">
<svg viewBox="0 0 680 320" role="img" aria-label="Chín chặng của dự án xếp theo trục thời gian: chốt phạm vi, chia ranh giới, tuyến xuyên suốt, hợp đồng message, mốc bàn giao, làm song song, lớp network client, phát hành, kể lại dự án">
  <defs>
    <marker id="prj-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <line x1="40" y1="60" x2="640" y2="60" stroke="#6ea8fe" stroke-width="2" marker-end="url(#prj-a)"/>
  <g class="fig-box-g">
    <rect x="24"  y="76"  width="128" height="58" rx="9" class="fig-box"/>
    <rect x="168" y="76"  width="128" height="58" rx="9" class="fig-box"/>
    <rect x="312" y="76"  width="128" height="58" rx="9" class="fig-box"/>
    <rect x="456" y="76"  width="128" height="58" rx="9" class="fig-box"/>
    <rect x="24"  y="158" width="128" height="58" rx="9" class="fig-box"/>
    <rect x="168" y="158" width="128" height="58" rx="9" class="fig-box"/>
    <rect x="312" y="158" width="128" height="58" rx="9" class="fig-box"/>
    <rect x="456" y="158" width="128" height="58" rx="9" class="fig-box"/>
    <rect x="240" y="242" width="200" height="58" rx="9" class="fig-box"/>
  </g>
  <text x="88"  y="52"  text-anchor="middle" class="fig-muted" font-size="10">tuần 0</text>
  <text x="360" y="52"  text-anchor="middle" class="fig-muted" font-size="10">tháng 1–6</text>
  <text x="612" y="52"  text-anchor="middle" class="fig-muted" font-size="10">phát hành</text>
  <text x="88"  y="100" text-anchor="middle" class="fig-label" font-size="12">1 · Chốt phạm vi</text>
  <text x="88"  y="118" text-anchor="middle" class="fig-muted" font-size="10">pillars · stack · cắt</text>
  <text x="232" y="100" text-anchor="middle" class="fig-label" font-size="12">2 · Chia ranh giới</text>
  <text x="232" y="118" text-anchor="middle" class="fig-muted" font-size="10">ai sở hữu state nào</text>
  <text x="376" y="100" text-anchor="middle" class="fig-label" font-size="12">3 · Tuyến xuyên suốt</text>
  <text x="376" y="118" text-anchor="middle" class="fig-muted" font-size="10">một phiên chơi đủ mốc</text>
  <text x="520" y="100" text-anchor="middle" class="fig-label" font-size="12">4 · Hợp đồng</text>
  <text x="520" y="118" text-anchor="middle" class="fig-muted" font-size="10">.proto · 3 version</text>
  <text x="88"  y="182" text-anchor="middle" class="fig-label" font-size="12">5 · Mốc bàn giao</text>
  <text x="88"  y="200" text-anchor="middle" class="fig-muted" font-size="10">slice → alpha → beta</text>
  <text x="232" y="182" text-anchor="middle" class="fig-label" font-size="12">6 · Làm song song</text>
  <text x="232" y="200" text-anchor="middle" class="fig-muted" font-size="10">mock server · CI</text>
  <text x="376" y="182" text-anchor="middle" class="fig-label" font-size="12">7 · Lớp network</text>
  <text x="376" y="200" text-anchor="middle" class="fig-muted" font-size="10">retry · token · offline</text>
  <text x="520" y="182" text-anchor="middle" class="fig-label" font-size="12">8 · Phát hành</text>
  <text x="520" y="200" text-anchor="middle" class="fig-muted" font-size="10">soft launch · runbook</text>
  <text x="340" y="266" text-anchor="middle" class="fig-label" font-size="12">9 · Kể lại dự án</text>
  <text x="340" y="284" text-anchor="middle" class="fig-muted" font-size="10">phòng phỏng vấn — thứ nhánh này tồn tại vì nó</text>
</svg>
<figcaption>Bốn chặng đầu tốn khoảng hai tuần và quyết định phần lớn chi phí của mười tháng còn lại. Chặng 9 là chặng duy nhất diễn ra sau khi dự án kết thúc.</figcaption>
</figure>

## Các node

| # | Node | Trả lời câu gì |
|---|---|---|
| 0 | [[project-anatomy]] | **Dự án gồm những mảnh nào** — cây thư mục, ba đường sinh code, thứ tự dựng từ repo rỗng |
| 1 | [[project-kickoff]] | Chốt cái gì trước khi viết dòng code đầu tiên, và cắt cái gì ra khỏi phạm vi |
| 2 | [[project-architecture]] | State nào thuộc client, state nào thuộc server, và vì sao ranh giới đó không sửa được sau |
| 3 | [[client-server-flow]] | Một phiên chơi đi qua hệ thống thế nào, từ tap icon tới khi bảng xếp hạng đổi |
| 4 | [[project-identity]] | Master User: bảng gốc mọi thứ treo vào, và bảy nhánh của luồng tài khoản |
| 5 | [[project-contract]] | Hai phía nói chuyện bằng cái gì, và làm sao đổi message mà không vỡ client cũ |
| 6 | [[project-migration]] | Ba tầng migration — schema, master data, save — và expand–contract |
| 7 | [[project-milestones]] | Mốc nào phải xong cái gì, và cách nhận ra dự án đang trượt |
| 8 | [[project-teamwork]] | Hai người hai phía làm song song mà không chặn nhau |
| 9 | [[project-launch]] | Soft launch: mở cho ai, đo cái gì, hỏng thì làm gì trong 15 phút đầu |
| 10 | [[screens]] | **Cụm màn hình** — Home, gacha, shop, nhiệm vụ, hộp quà, piggy bank, túi đồ, kết quả, xếp hạng |
| 11 | [[project-postmortem]] | Kể lại dự án trong phòng phỏng vấn — vai trò, khó khăn, đánh đổi |

Node 10 là **một cụm con có mục lục riêng**: chín màn hình meta, mỗi màn theo cùng khuôn mẫu tám ô (mục tiêu · bố cục · dữ liệu · API · vòng đời · trạng thái rỗng · số liệu · vận hành). Chín chặng kia nói *dựng dự án thế nào*; cụm đó nói *dựng từng màn hình thế nào*.

**Tám mảnh của một dự án** — client Unity · server Go · hợp đồng protobuf · master data · migration · Master User · Docker · tools. [[project-anatomy]] là node ráp cả tám lại và chỉ ra mảnh nào sinh ra mảnh nào; các node còn lại đi sâu vào từng chặng.

Node phía client tương ứng nằm ở nhánh Unity: [[unity-network-client]] — lớp gọi API backend, khác hẳn netcode trận đấu ở [[unity-multiplayer]].

## Ba quyết định không sửa được sau

Phần lớn quyết định trong dự án đều đổi được, chỉ tốn thời gian. Ba cái này thì không — sửa nghĩa là viết lại:

| Quyết định | Chốt ở chặng | Sửa muộn tốn gì |
|---|---|---|
| **Ai là nguồn chân lý của ví tiền** | 2 | Đổi từ client-authoritative sang server-authoritative là viết lại toàn bộ luồng kinh tế, và mọi save cũ đều không tin được nữa |
| **Có multiplayer realtime hay không** | 1 | Retrofit netcode gần như là viết lại gameplay — xem [[unity-multiplayer]] |
| **Message có version hay không** | 4 | Client đã lên store không cập nhật được; bạn phải đỡ mọi phiên bản cũ **vĩnh viễn** |

Ba cái còn lại thường bị tưởng là không sửa được nhưng thực ra sửa được: engine (tốn 2–4 tháng, xem [[tech-stack]]), database (tốn một đợt migration), nhà cung cấp hạ tầng (tốn một tuần nếu đã đóng Docker — xem [[go-docker]]).

## Vì sao nhánh này tồn tại riêng

Ba lý do, và lý do thứ ba mới là lý do thật:

1. **Kiến thức theo chủ đề không dạy được thứ tự.** Đọc hết [[game-database]] không cho bạn biết nó phải xong trước hay sau [[go-matchmaking]].
2. **Ranh giới client–server là chỗ mọi dự án chảy máu.** Không nhánh nào sở hữu nó: nhánh Unity coi server là hộp đen, nhánh Go coi client là hộp đen. Chỗ nối thì không ai viết.
3. **Phỏng vấn không hỏi theo chủ đề, hỏi theo dự án.** Câu mở màn hầu như luôn là *"kể về một dự án anh đã làm"* — và người trả lời trượt không phải vì thiếu kiến thức, mà vì kể một đống mảnh rời không thành hệ thống.

Mỗi node trong nhánh này vì thế có thêm phần **Kể trong dự án** ở mục 🎤: cùng một kiến thức, nhưng đóng gói dưới dạng *"ở dự án đó tôi làm gì, vướng gì, chọn gì"*.

## Nguyên tắc

- **Ranh giới trước, tính năng sau.** Một tuần vẽ ranh giới tiết kiệm ba tháng gỡ rối.
- **Hợp đồng là code, không phải tài liệu.** File `.proto` sinh ra cả hai phía thì lệch schema thành lỗi biên dịch; tài liệu trên wiki thì lệch thành lỗi production.
- **Chạy được từ đầu tới cuối trước khi làm đẹp bất cứ khúc nào.** Vertical slice mỏng mà thông suốt đáng giá hơn ba hệ thống hoàn chỉnh không nối được với nhau.
- **Cái gì mất tiền của người chơi thì nằm trong transaction.** Không có ngoại lệ, kể cả khi "chỉ là bản test".

## 🤖 Prompt cho AI

**Dùng AI thế nào khi dựng một dự án client–server**

AI mạnh ở việc sinh **khung** và **bản nháp hợp đồng**, yếu ở việc quyết định ranh giới. Chia việc theo chặng:

| Chặng | Giao được cho AI | Phải tự quyết |
|---|---|---|
| 1 Chốt phạm vi | Liệt kê rủi ro của từng lựa chọn, so sánh stack | Cắt tính năng nào — đây là quyết định sản phẩm |
| 2 Ranh giới | Soạn bảng "state nào ở đâu" từ mô tả game của bạn | Duyệt bảng đó; AI hay đặt ví tiền nhầm chỗ |
| 3 Tuyến xuyên suốt | Vẽ sequence, liệt kê mốc còn thiếu | Quyết cái gì xảy ra khi mất mạng giữa chừng |
| 4 Hợp đồng | Sinh `.proto` + code hai phía + bản nháp mã lỗi | Đánh số field, chính sách version |
| 5–7 Thi công | Sinh handler, client wrapper, test, mock server | Review transaction và mọi chỗ động tới tiền |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Thể loại và nhịp**: turn-based một request mỗi lượt hay realtime 20Hz — quyết định toàn bộ giao thức.
- **Quy mô thật**: 500 CCU hay 50.000. AI mặc định vẽ kiến trúc cho quy mô không tồn tại.
- **Có tiền thật không**: có IAP thì mọi lời khuyên về transaction và idempotency đổi hẳn.
- **Đội mấy người, ai làm phía nào** — quyết định mức độ cần mock server và CI.
- **Nền tảng đích**: WebGL cắt UDP và gRPC khỏi bàn ngay từ đầu.

**Mẫu prompt**

```
Bối cảnh: game <thể loại>, client Unity 2022 LTS, server Go. Đội <N> người.
Quy mô mục tiêu: <N> CCU tháng đầu. Có IAP: <có/không>. Nền tảng: <Android/iOS/WebGL>.
Nhịp gameplay: <turn-based, 1 request mỗi lượt / realtime 20Hz / idle>.

Việc: lập bảng RANH GIỚI STATE cho dự án này. Mỗi dòng gồm:
loại state | ai sở hữu | client được cache gì | hỏng thì hậu quả gì | đi HTTP hay WS.

Ràng buộc:
- KHÔNG đề xuất microservice, Kubernetes, Kafka ở quy mô này.
- KHÔNG đặt bất cứ thứ gì liên quan tới tiền hoặc vật phẩm ở phía client.
- Nêu rõ chỗ nào anh đang đoán vì tôi chưa cung cấp đủ thông tin, thay vì tự điền.
```

**Bẫy thường gặp:** AI vẽ kiến trúc cho quy mô studio lớn khi bạn có 500 người chơi — microservice, service mesh, event sourcing. Thứ hai: nó đặt logic kinh tế ở client vì "giảm tải server". Thứ ba: nó sinh `.proto` không đánh số field ổn định, và bản sau đánh lại số, vỡ mọi client đang chạy.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Game của anh có server để làm gì, sao không lưu ở máy người chơi?**
  → Vì máy người chơi sửa được. Mọi thứ có giá trị — ví, inventory, tiến trình, kết quả trận — phải nằm trong database của server để không ai tự sinh ra được. Ngoài ra server còn giữ hai thứ file local không làm nổi: đổi số cân bằng mà không cần cập nhật app, và cho người chơi chuyển sang thiết bị mới mà không mất tiến trình.
- `Junior` **Server trận đấu và backend khác nhau thế nào?**
  → Khác nhau ở mọi dòng. Server trận giữ state trong RAM, tick 20–60 lần mỗi giây, mất một process là mất một trận. Backend giữ state trong database, vài request mỗi phút mỗi người, mất là mất tiền của người chơi. Vì vòng đời khác nhau nên tách thành hai process ngay từ đầu, và chỉ backend được ghi vào nguồn chân lý.
- `Mid` **Anh chia ranh giới client–server thế nào trong dự án gần nhất?**
  → Theo một câu hỏi: mất thứ này thì người chơi có mất tiền không. Có thì server sở hữu và ghi trong transaction; không thì để client giữ cho mượt. Cụ thể là client gửi ý định — "tôi mua item 42" — chứ không gửi kết quả — "trừ tôi 100 vàng"; server tra giá từ master data rồi tự tính.
- `Mid` **Hai người làm hai phía, làm sao để không chặn nhau?**
  → Contract-first. Hai bên ngồi 30 phút viết `.proto` cho nhóm message sắp làm, merge, rồi CI sinh code cả hai phía và sinh luôn mock server. Client cắm vào mock làm thật trong lúc server viết thật, và mỗi ngày nối thử một lượt ở môi trường dev để lệch gì lộ ra trong ngày.
- `Senior` **Quyết định kiến trúc nào anh chốt sớm mà sau này không sửa được?**
  → Ba cái: ai sở hữu ví tiền, có realtime hay không, và message có version hay không. Chuyển ví từ client sang server là viết lại toàn bộ luồng kinh tế và không tin được save cũ nữa; thêm realtime vào game vốn async gần như là viết lại gameplay. Vì thế tôi chốt cả ba trong hai tuần đầu, trước khi viết tính năng nào.
- `Senior` **Nếu làm lại dự án đó, anh đổi gì ở hai tuần đầu?**
  → Đưa hai luật vào hợp đồng ngay từ đầu thay vì thêm sau khi trả giá: mọi lệnh đổi ví phải có idempotency key, và CI phải có bước rà tương thích ngược. Cả hai đều rẻ lúc chưa có gì và đắt khi đã có người chơi mất đồ.

**Khung trả lời 60 giây** — "Anh chia ranh giới client–server thế nào?"

> Tôi chia theo một câu hỏi duy nhất: **mất thứ này thì người chơi có mất tiền không.** Có thì nó nằm ở server, trong Postgres, trong transaction — ví, inventory, tiến trình, kết quả trận. Không thì để client giữ cho mượt: vị trí nhân vật, hiệu ứng, âm lượng, trạng thái UI.
>
> Cụ thể ở dự án gần nhất: client gửi **ý định** chứ không gửi kết quả. Nó nói "tôi mua item 42", không nói "trừ tôi 100 vàng". Server tra giá từ master data, kiểm số dư, ghi một transaction, trả về số dư mới. Client hiển thị lạc quan nhưng luôn lấy server làm chuẩn khi lệch.
>
> Ranh giới này chốt ở **tuần thứ hai**, trước khi viết tính năng nào. Vì đổi nó sau nghĩa là viết lại toàn bộ luồng kinh tế và không tin được save cũ nữa.

**Họ sẽ đào tiếp**

- *"Vì sao không để client tính cho nhẹ server?"* → Vì client chạy trên máy người chơi, và bộ nhớ của máy đó sửa được bằng công cụ tải về trong năm phút. Tải server không phải là vấn đề ở quy mô game thường: một API Go trên VM 2 vCPU đỡ vài nghìn request mỗi giây. Thứ giết bạn là một query thiếu index, không phải phép nhân damage.
- *"Ba loại process là những gì?"* → API stateless (restart vô hại), room server stateful (giữ trận trong RAM, phải drain trước khi thoát), worker/cron (job chạy lại được từ đầu). Tách ngay từ đầu vì vòng đời khác nhau ở mọi dòng — xem [[backend-go]].
- *"Hai phía làm song song kiểu gì?"* → Contract-first: `.proto` merge trước, sinh code cho cả hai phía trong CI, client chạy với mock server dựng từ chính hợp đồng đó. Không ai phải chờ ai.
- *"Quyết định nào không sửa được?"* → Ai sở hữu ví tiền; có realtime hay không; message có version hay không. Ba cái đó sửa muộn là viết lại chứ không phải sửa.
- *"Anh đo gì để biết hệ thống khoẻ?"* → p99 latency, tỉ lệ lỗi 5xx, số kết nối WS đang mở, và độ trễ của job chốt kết quả trận. Bốn cái, có ngưỡng cảnh báo — xem [[go-deploy-ops]].

**Cờ đỏ**

- "Để client tự trừ tiền rồi báo server" — câu này một mình đủ trượt vòng kỹ thuật.
- Vẽ microservice, Kafka, Kubernetes cho một game chưa có người chơi nào.
- Không phân biệt được **server trận đấu** (RAM, tick 20Hz, mất là mất một trận) và **backend** (database, mất là mất tiền).
- Kể dự án mà không nêu được một con số nào: bao nhiêu người, bao nhiêu CCU, latency bao nhiêu.
- "Chúng tôi không có tài liệu hợp đồng, cứ hỏi nhau qua chat" — nghe thì đời thường, nhưng người phỏng vấn nghe ra là dự án không có contract-first và chắc chắn đã vỡ schema ít nhất một lần.

**Số / ví dụ nên thuộc**

- REST/JSON 50–200ms · WS/JSON 30–80ms · WS/nhị phân 20–60ms · UDP 10–40ms.
- Ba loại process: API stateless · room server stateful · worker.
- Ba version độc lập phải theo dõi: app build, API, master data.
- Một VM 2 vCPU đỡ được cỡ 10.000 kết nối WebSocket bằng Go.

**Kể trong dự án**

- *"Anh làm gì trong dự án đó?"* → Nêu **ranh giới trách nhiệm** trước, rồi mới nêu việc: "tôi phụ trách phần nối client với backend — lớp network phía Unity, hợp đồng `.proto`, và luồng kinh tế phía server." Đừng liệt kê task, hãy nêu **một hệ thống bạn sở hữu từ đầu tới cuối**.
- *"Khó khăn lớn nhất?"* → Chọn khó khăn **kỹ thuật có số đo**, không phải khó khăn nhân sự. Ví dụ tốt: "client cũ trên store gọi API bằng schema cũ, mà chúng tôi cần đổi cấu trúc phần thưởng" — vì nó dẫn thẳng tới câu chuyện versioning.
- *"Anh đóng góp gì mà không ai khác làm được?"* → Chỗ mạnh nhất để đứng là **chỗ nối**: người phía client không hiểu transaction, người phía server không hiểu vòng đời Unity. Ai đứng được ở giữa và nói được cả hai thứ tiếng thì hiếm.
