---
title: Backend Go & Database
icon: 🐹
summary: Toàn bộ phần Go của một game — học Go từ nền C#, viết tool, dựng server và database, ghép trận, rồi đưa lên máy thật và giữ nó sống.
status: deep
read: 582
level: advanced
order: 67
map: true
mapLabel: Backend Go
tags: [backend, server, database, go]
related: [production, unity]
---

Nhánh này về **phần chạy trên máy chủ**: tài khoản, tiền, đồ đạc, bảng xếp hạng, phòng chơi chung — và cái ranh giới quyết định mọi thứ còn lại: cái gì client được phép tự quyết, cái gì chỉ server mới được quyết.

Game của bạn có cần nhánh này không? Một câu hỏi là đủ: **có thứ gì mà người chơi nói dối về nó thì bạn mất tiền hoặc mất công bằng không?** Không có (game offline, không IAP, không bảng xếp hạng) thì đừng dựng backend — [[unity-save-data]] là đủ và rẻ hơn nhiều. Có, dù chỉ một bảng xếp hạng, thì mọi thứ trong nhánh này bắt đầu áp dụng.

## Các node

- **[[go-for-unity-dev]]** — học Go khi đã biết C#: cái gì ánh xạ thẳng, bốn thói quen phải bỏ, bảy thứ vấp tuần đầu, bộ công cụ, lộ trình hai tuần có bài kiểm tra.
- **[[go-gamedev-tools]]** — Go ngoài phần server: validator dữ liệu, asset pipeline, tool build, bot load test. Cách rẻ nhất để đưa Go vào dự án.
- **[[game-server-go]]** — viết process Go: một goroutine sở hữu một phòng, chọn giao thức theo loại dữ liệu, server có thẩm quyền, vận hành. Kèm lớp client Unity gọi API có retry.
- **[[go-protobuf]]** — hợp đồng giữa hai phía: một file `.proto` sinh ra cả `.go` lẫn `.cs`, luật đánh số field để không bao giờ vỡ tương thích, Envelope cho realtime.
- **[[game-database]]** — dữ liệu: Postgres/Redis cho đúng loại, sáu luật cho dữ liệu kinh tế, transaction idempotent và sổ cái append-only.
- **[[master-data]]** — bảng cân bằng designer viết trên Google Sheet, nạp vào database có version; Master User và luật tham chiếu master thay vì sao chép nó.
- **[[go-matchmaking]]** — ghép trận: dải MMR nới theo thời gian chờ, chốt cặp nguyên tử bằng Lua, ready check, ticket TTL.
- **[[go-deploy-ops]]** — đưa lên máy thật và giữ nó sống: ba mức hạ tầng, deploy không rớt người chơi, bốn chỉ số vàng, runbook sự cố.
- **[[go-docker]]** — một lệnh là cả team có Postgres, Redis, migration và server: compose cho môi trường dev, layer cache, bẫy trong repo có cả Unity.
- **[[go-production-arch]]** — mổ xẻ một backend Go đã phát hành: một binary nhiều mode, config nhúng trong binary, HTTP + protobuf với ba tầng kiểm phiên bản, codegen từ schema ra tận DLL cho client.

## Học theo thứ tự nào

Mười node trên không phải để đọc tuần tự từ đầu tới cuối. Vào đúng chỗ bạn đang đứng:

| Bạn đang ở đâu | Đọc gì |
|---|---|
| Chưa viết Go bao giờ, chỉ biết C# | [[go-for-unity-dev]] — chặng 1 và 2 của lộ trình hai tuần |
| Muốn dùng Go nhưng chưa cần server | [[go-gamedev-tools]] — viết một validator, có ích ngay |
| Sắp viết API đầu tiên | [[game-database]] **trước** [[game-server-go]]: schema và ràng buộc trước handler |
| Đã có API, cần trận PvP | [[go-matchmaking]] |
| Designer muốn sửa số mà không cần build lại | [[master-data]] |
| Gói tin realtime quá nặng, hoặc client và server hiểu khác nhau về message | [[go-protobuf]] |
| Muốn cả team chạy được backend bằng một lệnh | [[go-docker]] |
| Muốn xem một hệ thống thật đã ráp mọi thứ trên lại ra sao | [[go-production-arch]] |
| Sắp mở cho người chơi thật | [[go-deploy-ops]] và mục "Vận hành" của [[game-server-go]] |
| Cần netcode trong trận | Không ở nhánh này — sang [[unity-multiplayer]] |

**Đường ngắn nhất từ con số 0 tới một tính năng online chạy thật** (khoảng hai tuần với 2–3 giờ mỗi ngày): học cú pháp và đồng thời → viết một validator bằng Go → thiết kế bảng cho *một* tính năng (bảng xếp hạng hoặc điểm danh hàng ngày) → viết ba endpoint có test → deploy lên một VPS → cho Unity gọi. Làm trọn một vòng như vậy dạy nhiều hơn đọc hết cả mười node.

Phần netcode *trong trận* (tick, prediction, lag compensation) **không** nằm ở đây mà ở [[unity-multiplayer]]. Bảng ngay dưới nói vì sao hai thứ đó phải tách nhau.

## Hai cái "server", hai bài toán

| | Server netcode (trận đấu) | Backend (tài khoản, kinh tế) |
|---|---|---|
| Trạng thái | Trong RAM, sống theo trận | Trong database, sống mãi |
| Mất một process | Mất một trận | Mất tiền của người chơi |
| Nhịp | 20–60 tick mỗi giây | Vài request mỗi phút mỗi người |
| Giao thức | UDP hoặc WebSocket nhị phân | HTTPS + JSON |
| Scale | Theo số phòng, phòng dính vào một máy | Theo CCU, nhân bản vô tư |
| Deploy | Phải drain, không kill giữa trận | Rolling restart bất cứ lúc nào |
| Hỏng thì | Giật, rớt trận | Nhân đôi vật phẩm, lạm phát, mất save |

Khác nhau ở **mọi dòng**, nên đừng nhét chung một process. Hai lỗi kinh điển của việc gộp: giữ inventory trong RAM của phòng cho "nhanh" rồi phòng crash là đồ bay; hoặc phòng ghi thẳng vào Postgres mỗi tick — 30 write mỗi giây mỗi phòng, database chết ở phòng thứ năm mươi.

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Client Unity nối tới API Go stateless và Room server Go stateful; API dùng PostgreSQL và Redis; worker chạy job định kỳ">
  <defs>
    <marker id="gsg-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="8"   y="108" width="118" height="66" rx="9" class="fig-box"/>
    <rect x="196" y="28"  width="184" height="62" rx="9" class="fig-box"/>
    <rect x="196" y="122" width="184" height="62" rx="9" class="fig-box"/>
    <rect x="196" y="218" width="184" height="56" rx="9" class="fig-box"/>
    <rect x="450" y="28"  width="196" height="62" rx="9" class="fig-box"/>
    <rect x="450" y="122" width="196" height="62" rx="9" class="fig-box"/>
    <rect x="450" y="218" width="196" height="56" rx="9" class="fig-box"/>
  </g>
  <text x="67"  y="136" text-anchor="middle" class="fig-label" font-size="13">Unity client</text>
  <text x="67"  y="155" text-anchor="middle" class="fig-muted" font-size="11">chỉ gửi ý định</text>
  <text x="288" y="54"  text-anchor="middle" class="fig-label" font-size="13">API Go — stateless</text>
  <text x="288" y="74"  text-anchor="middle" class="fig-muted" font-size="11">REST/JSON · JWT · N bản</text>
  <text x="288" y="148" text-anchor="middle" class="fig-label" font-size="13">Room server Go — stateful</text>
  <text x="288" y="168" text-anchor="middle" class="fig-muted" font-size="11">WebSocket · tick 20Hz · RAM</text>
  <text x="288" y="242" text-anchor="middle" class="fig-label" font-size="13">Worker / cron</text>
  <text x="288" y="261" text-anchor="middle" class="fig-muted" font-size="11">reset mùa · đối soát IAP</text>
  <text x="548" y="54"  text-anchor="middle" class="fig-label" font-size="13">PostgreSQL</text>
  <text x="548" y="74"  text-anchor="middle" class="fig-muted" font-size="11">nguồn chân lý · transaction</text>
  <text x="548" y="148" text-anchor="middle" class="fig-label" font-size="13">Redis</text>
  <text x="548" y="168" text-anchor="middle" class="fig-muted" font-size="11">phiên · ZSET · matchmaking</text>
  <text x="548" y="242" text-anchor="middle" class="fig-label" font-size="13">ClickHouse / S3</text>
  <text x="548" y="261" text-anchor="middle" class="fig-muted" font-size="11">event, replay</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#gsg-a)" fill="none">
    <path d="M126 128 Q170 128 170 60 H192"/>
    <path d="M126 154 Q170 154 170 153 H192"/>
    <path d="M380 50 H446"/>
    <path d="M380 74 Q416 74 416 140 H446"/>
    <path d="M380 160 H446"/>
    <path d="M380 246 Q416 246 416 180 H446"/>
    <path d="M288 122 V96"/>
  </g>
  <text x="168" y="108" text-anchor="middle" class="fig-muted" font-size="10">HTTPS</text>
  <text x="163" y="176" text-anchor="middle" class="fig-muted" font-size="10">WebSocket</text>
  <text x="330" y="112" text-anchor="start" class="fig-muted" font-size="10">kết quả trận</text>
</svg>
<figcaption>Ba loại process, ba vòng đời khác nhau. Chỉ API và worker được phép ghi vào nguồn chân lý; room server gửi kết quả trận qua API thay vì tự ghi.</figcaption>
</figure>

## Vì sao Go — và cái giá của nó

- **Goroutine rẻ.** Mỗi kết nối hai goroutine (một đọc, một ghi), stack khởi điểm 8 KB và tự lớn. Mười nghìn kết nối WebSocket trên một VM 2 vCPU là chuyện bình thường, không cần kiến trúc sự kiện vòng vèo như Node.
- **GC dừng dưới 1ms.** Đủ cho backend và cho phòng tick 20–30Hz. **Không** đủ để thay C++/Rust ở simulation xác định 120Hz có rollback — ở đó mỗi allocation trong vòng lặp nóng mới là kẻ thù, và Go không cho bạn kiểm soát bố cục bộ nhớ.
- **Một file binary tĩnh.** `GOOS=linux go build` rồi scp một file, hoặc image `FROM gcr.io/distroless/static` khoảng 15 MB. Không runtime cài kèm, không lệch phiên bản .NET giữa máy dev và máy chủ.
- **Hệ sinh thái đúng nghề.** Agones (điều phối game server trên k8s), Open Match (matchmaking), Nakama (backend trọn gói), pgx, go-redis — đều viết bằng Go, nên khi bí thì đọc được mã nguồn của chính thứ mình đang dùng.

**Cái giá phải trả: không dùng chung code với Unity.** Backend C# (ASP.NET Core) cho phép share nguyên file `DamageCalculator.cs` giữa client và server — với Go bạn định nghĩa struct hai lần, và **hai bản sẽ lệch nhau** vào một ngày không ai nhớ. Hai cách sống chung:

1. Định nghĩa message **một lần** bằng protobuf hoặc FlatBuffers, sinh ra cả `.go` lẫn `.cs` trong CI. Lệch schema thành lỗi biên dịch thay vì lỗi runtime.
2. Chia ranh giới theo loại logic: Go làm tài khoản, kinh tế, matchmaking, bảng xếp hạng (chỗ không cần mô phỏng gameplay); còn nếu cần server mô phỏng chiến đấu authoritative thì để Unity headless chạy chính code đó — xem [[unity-multiplayer]].

Chọn Go vì **vận hành rẻ và chịu tải tốt**, đừng chọn vì "nhanh hơn C#". Ở tải của một game indie thì cả hai đều thừa sức; thứ giết bạn là một query thiếu index, không phải ngôn ngữ.

## Ba loại process, tách ngay từ đầu

| Process | Giữ gì trong RAM | Restart giữa chừng |
|---|---|---|
| **API stateless** | Không gì cả | Vô hại — cứ rolling restart |
| **Room server** | Toàn bộ trận đang chạy | Mất trận → phải drain trước khi thoát |
| **Worker / cron** | Không gì cả | Vô hại, nhưng job phải chạy lại được từ đầu |

Luật một câu: **state trong RAM chỉ được phép là thứ mất đi cũng không sao.** Không được phép mất thì nó phải nằm trong Postgres **trước khi** server trả về 200.

Đừng nhét job nặng vào process API. Một job "quét toàn bộ tài khoản để reset mùa" chạy chung sẽ ăn hết pool kết nối database và request của người chơi bắt đầu timeout — hiện tượng quan sát được là "game lag mỗi đầu giờ", nguyên nhân lại nằm ở cron.

## Nguyên tắc

**Client gửi ý định, server trả sự thật.** Đây không phải lời khuyên bảo mật chung chung mà là một quy tắc kiểm được: mở danh sách endpoint ra, endpoint nào nhận *trạng thái* (vàng, inventory, điểm, thời gian) thay vì nhận *hành động* thì endpoint đó là lỗ hổng, kể cả khi game chưa có ai chơi.

**State trong RAM chỉ được là thứ mất đi cũng không sao.** Không được phép mất thì nó phải nằm trong database **trước khi** server trả về 200. Mọi kiến trúc rối rắm về sau đều bắt đầu từ việc vi phạm câu này để "cho nhanh".

**Thêm hạ tầng khi đo được, không phải khi vẽ sơ đồ.** Một Postgres và một binary Go chạy được vài nghìn CCU. Redis, message queue, k8s, microservice — mỗi thứ thêm vào là một thứ nữa có thể hỏng lúc 2 giờ sáng. Xem [[performance]] về thói quen đo trước khi sửa.

**Kho này chọn Go, nhưng mọi luật ở đây không phụ thuộc ngôn ngữ.** Sáu luật dữ liệu kinh tế, idempotency, server authoritative đúng y như vậy với C#, Node hay Elixir. Chỉ phần goroutine và thư viện là riêng của Go.

## 🤖 Prompt cho AI

**Dùng AI thế nào ở nhánh này**

Backend là mảng AI làm tốt nhất trong cả kho, vì gần như mọi thứ đều **kiểm chứng được bằng máy**: test chạy được hoặc không, race detector kêu hoặc im, load test ra số p99 cụ thể. Nhưng nó tốt ở phần *thực thi* và dở ở phần *ranh giới* — và ranh giới mới là chỗ mất tiền.

| Giao cho AI | Bạn phải tự quyết |
|---|---|
| Schema, migration, query, index, handler, middleware | Cái gì là nguồn chân lý, cái gì được phép mất |
| Test đường hỏng, load test, Dockerfile, CI, script vận hành | Client được phép tự quyết cái gì |
| Chuyển struct Go ↔ C#, sinh protobuf, viết lớp client Unity | Quy tắc kinh tế: giá, trần, tốc độ phát tài nguyên |

Thứ tự giao việc cho một phiên backend — **đừng đảo**, vì bước sau vô nghĩa nếu bước trước sai:

1. Bất biến (bạn viết, không hỏi AI) → 2. Schema + ràng buộc database ([[game-database]]) → 3. Handler và process ([[game-server-go]]) → 4. Test đường hỏng + `go test -race` → 5. Load test, rồi mới tới vận hành.

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Nhịp ghi của game:** turn-based/idle vài request mỗi phút, hay realtime 20Hz. AI mặc định coi mọi thứ là CRUD web và sẽ dựng sai kiến trúc từ dòng đầu.
- **CCU mục tiêu và p99 chấp nhận được.** Không có số thì nó đẻ ra microservice cho game 200 người.
- **Cái gì authoritative** — server quyết tiền, loot, thời gian; client chỉ gửi ý định.
- **Phiên bản và thư viện được phép:** Go 1.22+, PostgreSQL 16, Redis 7, Unity 6, `pgx`, thư viện websocket nào.
- **Triển khai ở đâu:** một VPS hay k8s. Khác nhau ở graceful shutdown, service discovery, cách scale phòng.

**Mẫu prompt**

```
Khối định vị cho phiên làm backend — dán vào đầu mọi phiên:

Kho kiến thức: đọc content/10-backend-go/index.md, game-server-go.md,
game-database.md trước khi viết dòng code đầu tiên.

Game: <thể loại>, client Unity 6, <CCU> CCU mục tiêu, p99 < <số> ms.
Stack: Go 1.22, PostgreSQL 16, Redis 7, một VPS.

BẤT BIẾN (không được vi phạm, vi phạm thì dừng và hỏi tôi):
- Server quyết mọi tài nguyên. KHÔNG endpoint nào nhận gold/inventory từ client.
- Tài nguyên là số nguyên, có CHECK không âm ở database.
- Mọi lệnh ghi có request_id do client sinh, UNIQUE ở database.
- Thời gian lấy từ now() của database, KHÔNG từ client.

Làm theo thứ tự, DỪNG chờ tôi duyệt sau mỗi bước:
1. Schema + migration + ràng buộc.  2. Handler + process.
3. Test đường hỏng + `go test -race ./...`, dán output THẬT.
```

**Bẫy thường gặp:** hỏi AI "thiết kế backend cho game của tôi" mà không nêu nhịp ghi và CCU — nó sẽ trả về sơ đồ microservice + Kafka + k8s trông rất chuyên nghiệp cho một game 500 người chơi, và bạn sẽ mất ba tuần dựng hạ tầng thay vì làm game. Bẫy thứ hai: để AI quyết luôn *cái gì authoritative* — nó chọn theo cái dễ code nhất, tức là tin client.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Game của anh có mấy loại process ở phía server?**
  → Ba, tách ngay từ đầu vì vòng đời khác nhau: API stateless không giữ gì trong RAM nên restart vô hại và nhân bản thoải mái; room server giữ cả trận trong RAM nên phải drain trước khi thoát; worker chạy job định kỳ và phải chạy lại được từ đầu. Luật một câu: state trong RAM chỉ được phép là thứ mất đi cũng không sao.
- `Junior` **Vì sao chọn Go cho backend game?**
  → Vì vận hành rẻ: goroutine nhẹ nên một VM 2 vCPU đỡ khoảng mười nghìn kết nối WebSocket, GC pause dưới 1ms đủ cho phòng tick 20–30Hz, và một binary tĩnh không kèm runtime nên không lệch phiên bản giữa máy dev và máy chủ. Không chọn vì "nhanh hơn C#" — ở tải game thường cả hai đều thừa sức.
- `Mid` **Server netcode và backend khác nhau ở đâu?**
  → Khác ở mọi dòng: state trong RAM so với trong database; mất một process là mất một trận so với mất tiền của người chơi; 20–60 tick mỗi giây so với vài request mỗi phút; phải drain so với rolling restart bất cứ lúc nào. Vì thế không nhét chung một process — hai lỗi kinh điển là giữ inventory trong RAM của phòng, và cho phòng ghi thẳng database mỗi tick.
- `Mid` **Cái giá của việc chọn Go thay vì C# cho server là gì?**
  → Không dùng chung được code với client Unity. Backend C# cho phép share nguyên file tính damage; với Go bạn định nghĩa struct hai lần và **hai bản sẽ lệch nhau** vào một ngày không ai nhớ. Hai cách sống chung: định nghĩa message một lần bằng protobuf rồi sinh cả `.go` lẫn `.cs` trong CI, hoặc chia ranh giới sao cho Go không phải mô phỏng gameplay.
- `Senior` **Vì sao room server không được ghi thẳng vào database?**
  → Hai lý do. Phòng là RAM nên thứ không được phép mất phải nằm trong Postgres trước khi trả về thành công; và phòng tick 20 lần mỗi giây, ghi thẳng thì database chết ở phòng thứ năm mươi. Phòng gửi kết quả qua API, API ghi một transaction — một đường ghi duy nhất nên đối soát được khi số liệu lệch.
- `Senior` **Job nặng chạy chung với API thì hỏng thế nào?**
  → Một job quét toàn bộ tài khoản để reset mùa sẽ ăn hết pool kết nối database, và request của người chơi bắt đầu timeout. Triệu chứng quan sát được là "game lag mỗi đầu giờ" trong khi nguyên nhân nằm ở cron — loại sự cố rất khó lần ra nếu không biết trước, vì chỗ có triệu chứng và chỗ có nguyên nhân không liên quan gì nhau trên sơ đồ.

**Khung trả lời 60 giây** — "Kể kiến trúc backend của game anh làm"

> Ba loại process, tách theo vòng đời chứ không theo tính năng. **API stateless** chạy nhiều bản sau cân bằng tải, nói HTTPS và JSON với client, và là nơi **duy nhất** được ghi vào nguồn chân lý. **Room server** giữ trận trong RAM, mỗi phòng một goroutine, WebSocket, tick 20Hz. **Worker** làm việc định kỳ như reset mùa và đối soát IAP.
>
> Dữ liệu thì Postgres là nguồn chân lý cho tài khoản, ví và inventory; Redis giữ phiên, hàng đợi ghép trận và bảng xếp hạng bằng ZSET; event analytics đẩy sang chỗ khác để Postgres không phình.
>
> Luật xuyên suốt: **room server gửi kết quả trận qua API thay vì tự ghi.** Một đường ghi duy nhất nên đối soát được, và database không phải chịu 20 write mỗi giây mỗi phòng.

**Họ sẽ đào tiếp**

- *"Quy mô nào thì cần tách ba process?"* → Tách ngay từ đầu, vì chi phí lúc đầu gần bằng không còn chi phí tách sau là viết lại phần vòng đời. Nhưng **triển khai** thì có thể gộp: ba process chạy trên cùng một VPS lúc mới phát hành hoàn toàn hợp lý, miễn là chúng là ba process thật.
- *"Bắt đầu bằng Postgres hay thêm Redis luôn?"* → Postgres một mình đủ cho vài nghìn CCU đầu tiên: nó làm được `jsonb`, hàng đợi bằng `SELECT … FOR UPDATE SKIP LOCKED`, và khoá phân tán bằng advisory lock. Thêm Redis khi đo được điểm nghẽn thật, không phải vì sơ đồ trông chuyên nghiệp hơn.
- *"Khi nào Go không phải lựa chọn đúng?"* → Khi cần server mô phỏng gameplay authoritative — lúc đó chạy Unity headless bằng chính code gameplay hợp lý hơn nhiều so với viết lại logic bằng Go rồi giữ hai bản đồng bộ. Và khi cần simulation xác định 120Hz có rollback thì cả Go lẫn C# đều không phải công cụ đúng.
- *"Học Go mất bao lâu với người biết C#?"* → Khoảng hai tuần để viết được service nhỏ, nhưng phần khó không phải cú pháp mà là mô hình đồng thời: bỏ thói quen chia sẻ state rồi khoá, chuyển sang một chủ sở hữu và channel.
- *"Bắt đầu từ đâu nếu chưa cần server?"* → Viết một tool bằng Go — validator dữ liệu chẳng hạn. Nó có ích ngay, chạy trong CI, và cho cả đội làm quen với Go mà không đặt cược gì vào nó.

**Cờ đỏ**

- Gộp room server và API vào một process cho "đơn giản".
- Giữ inventory trong RAM của phòng cho nhanh.
- Vẽ microservice, Kafka, k8s cho một game 500 CCU.
- Chọn Go vì "nhanh hơn C#" mà không nêu được cái giá của việc không share code.
- Chạy job nặng chung với process phục vụ người chơi.
- Không phân biệt được thứ mất đi cũng không sao với thứ không được phép mất.

**Số / ví dụ nên thuộc**

- Ba loại process: API stateless · room server stateful · worker.
- Một VM 2 vCPU: cỡ **10.000** kết nối WebSocket; goroutine stack khởi điểm **8 KB**.
- GC pause **dưới 1ms** — đủ cho tick 20–30Hz, không đủ cho rollback 120Hz.
- Postgres một mình đủ cho **vài nghìn CCU** đầu tiên.
- Nhịp: backend vài request/phút/người · room **20–60 tick/giây**.

**Kể trong dự án**

- *"Anh phụ trách phần nào của backend?"* → Nêu ranh giới theo **process hoặc theo luồng**, không theo danh sách endpoint: "tôi sở hữu luồng kinh tế — từ endpoint mua tới transaction và sổ cái" là câu mở ra đúng chỗ bạn muốn được hỏi.
- *"Khó khăn gặp phải?"* → Mẫu tốt cho node này: game lag đều đặn mỗi đầu giờ, mà mọi chỉ số của API đều bình thường. Kể cách bạn lần ra là một cron job ăn hết pool kết nối, và biện pháp tách nó ra process riêng có pool riêng.
- *"Anh có tự chọn stack không?"* → Nếu stack có sẵn, kể lý do bạn **hiểu** vì sao nó được chọn và cái giá của nó. Nói được nhược điểm của công cụ mình đang dùng là dấu hiệu rõ nhất của người đã dùng nó thật.
