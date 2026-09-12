---
title: Backend Go & Database
icon: 🐹
summary: Phần game chạy trên máy chủ — Go cho API và phòng realtime, Postgres/Redis cho dữ liệu, và ranh giới giữa thứ client được quyết và thứ chỉ server mới được quyết.
status: deep
read: 582
level: advanced
order: 67
tags: [backend, server, database, go]
related: [production, unity]
---

Nhánh này về **phần chạy trên máy chủ**: tài khoản, tiền, đồ đạc, bảng xếp hạng, phòng chơi chung — và cái ranh giới quyết định mọi thứ còn lại: cái gì client được phép tự quyết, cái gì chỉ server mới được quyết.

Game của bạn có cần nhánh này không? Một câu hỏi là đủ: **có thứ gì mà người chơi nói dối về nó thì bạn mất tiền hoặc mất công bằng không?** Không có (game offline, không IAP, không bảng xếp hạng) thì đừng dựng backend — [[unity-save-data]] là đủ và rẻ hơn nhiều. Có, dù chỉ một bảng xếp hạng, thì mọi thứ trong nhánh này bắt đầu áp dụng.

## Các node

- **[[game-server-go]]** — viết process Go: một goroutine sở hữu một phòng, chọn giao thức theo loại dữ liệu, server có thẩm quyền, vận hành. Kèm lớp client Unity gọi API có retry.
- **[[game-database]]** — dữ liệu: Postgres/Redis cho đúng loại, sáu luật cho dữ liệu kinh tế, transaction idempotent và sổ cái append-only.

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
