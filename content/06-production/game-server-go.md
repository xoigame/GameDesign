---
title: Server Go cho game
icon: 🐹
summary: Backend Go cho game Unity — tách API trạng thái khỏi phòng realtime, để Postgres giữ chân lý và Redis giữ thứ hỏng được, và không bao giờ tin con số client gửi lên.
status: deep
read: 585
level: advanced
order: 60
tags: [production, backend, server, database, go, live-ops]
related: [unity-multiplayer, architecture-patterns, unity-save-data, economy-design]
---

Game online có hai thứ cùng tên "server" và người ta hay gộp làm một: **server netcode** giữ trận đấu đồng bộ từng tick, và **backend** giữ tài khoản, đồ đạc, tiền, bảng xếp hạng. Node này nói về cái thứ hai, viết bằng Go, cho client Unity. Phần netcode nằm ở [[unity-multiplayer]].

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

## Một goroutine sở hữu một phòng

Cách viết room server sai nhất là một `map[string]*Room` dùng chung cộng với `sync.Mutex` rải khắp nơi: nó chạy đúng khi bạn test một mình và hỏng khi có hai mươi người. Cách đúng trong Go là **actor**: mỗi phòng một goroutine, goroutine đó là **chủ sở hữu duy nhất** của state, mọi thứ khác đi vào qua channel. Không mutex, nên không có deadlock và không có race để mà đi tìm.

```go
// Một phòng = một goroutine. Trường players CHỈ goroutine Run() được đụng tới.
type Room struct {
    id      string
    inbox   chan Msg          // có buffer: đầy thì ngắt client, không bao giờ block vòng lặp
    join    chan *Player
    leave   chan *Player
    players map[string]*Player
}

func (r *Room) Run(ctx context.Context) {
    const tickRate = 20
    ticker := time.NewTicker(time.Second / tickRate)
    defer ticker.Stop()
    emptySince := time.Now()

    for {
        select {
        case <-ctx.Done():                       // deploy: báo cho client rồi thoát sạch
            r.broadcast(Msg{Type: "server_shutdown"})
            return
        case p := <-r.join:
            r.players[p.ID] = p
        case p := <-r.leave:
            delete(r.players, p.ID)
            if len(r.players) == 0 {
                emptySince = time.Now()
            }
        case m := <-r.inbox:
            r.apply(m)                           // ý định của client, đã validate
        case now := <-ticker.C:
            r.step(1.0 / tickRate)
            r.broadcast(r.snapshot())
            if len(r.players) == 0 && now.Sub(emptySince) > 30*time.Second {
                return                           // phòng rỗng 30 giây thì tự dọn
            }
        }
    }
}

// Gọi từ goroutine đọc socket. KHÔNG được block vòng lặp phòng vì một client mạng chậm.
func (r *Room) Send(m Msg) bool {
    select {
    case r.inbox <- m:
        return true
    default:
        return false      // hàng đợi đầy: client spam hoặc đã treo → ngắt kết nối nó
    }
}
```

Ba lỗi đồng thời hay gặp, theo thứ tự mức độ phổ biến:

- **Goroutine rò.** Client ngắt kết nối nhưng goroutine ghi vẫn chờ trên channel mãi mãi. Mọi goroutine phải có đường thoát bằng `ctx.Done()`, và `close` channel ở đúng một phía. Triệu chứng: số goroutine trong `/debug/pprof/goroutine` chỉ đi lên, không bao giờ xuống.
- **Channel không buffer trong vòng lặp phòng.** `make(chan Msg)` bắt người gửi chờ người nhận; một client mạng 3G đủ để treo cả phòng. Có buffer thì phải có chính sách khi đầy — **drop hoặc kick**, không phải chờ.
- **Ticker trôi.** Nếu một tick xử lý lâu hơn 50ms, `time.Ticker` bỏ nhịp chứ không dồn lại. Muốn mô phỏng đúng thời gian thì cộng dồn delta thật và chạy bù, đừng giả định mỗi tick đúng 50ms.

`go build` không bắt được data race. Chạy `go test -race ./...` trong CI, và ít nhất một lần chạy server thật với `-race` dưới tải giả lập.

## Giao thức: chọn theo loại dữ liệu

| Giao thức | Độ trễ thực tế | Phía Unity | Dùng cho |
|---|---|---|---|
| REST + JSON | 50–200ms | `UnityWebRequest` có sẵn | Mọi thứ meta: login, shop, inventory, quest |
| WebSocket + JSON | 30–80ms | cần thư viện (NativeWebSocket) | Chat, phòng chờ, turn-based, thông báo đẩy |
| WebSocket + nhị phân | 20–60ms | thêm codegen protobuf | Realtime 10–30Hz, nhiều người một phòng |
| UDP / KCP / QUIC | 10–40ms | thư viện riêng, WebGL không chạy | Action realtime, FPS |
| gRPC | thấp | khó với IL2CPP và WebGL | **Giữa các service backend**, không nói chuyện thẳng với client |

Mặc định đúng cho phần lớn game mobile và indie: **REST cho meta, WebSocket cho realtime nhẹ.** Đừng mở màn bằng gRPC tới client — bạn đánh đổi khả năng debug bằng `curl` và khả năng đọc log proxy để lấy vài mili giây không ai cảm nhận được.

## Database: mỗi loại dữ liệu về đúng chỗ

| Dữ liệu | Chỗ của nó | Vì sao |
|---|---|---|
| Tài khoản, inventory, tiền, tiến trình | PostgreSQL | Cần transaction, không được phép mất |
| Phiên đăng nhập, token thu hồi | Redis | Tự hết hạn; mất thì đăng nhập lại, không ai chết |
| Bảng xếp hạng | Redis ZSET, cuối mùa chốt xuống Postgres | `ZREVRANK` là O(log N); `ORDER BY` trên một triệu dòng mỗi request thì không |
| Hàng đợi matchmaking, presence | Redis | Sống vài giây, tốc độ quan trọng hơn độ bền |
| Save state đơn, client tự sở hữu | Cột `jsonb` trong Postgres | Không cần quan hệ, chỉ cần lưu và trả nguyên khối |
| Event analytics | ClickHouse / BigQuery / file | Postgres sẽ phình và chậm dần. Xem [[playtesting-metrics]] |
| Replay, ảnh người chơi tạo | Object storage (S3/R2) | Đừng nhét binary lớn vào database |

Chưa biết chọn gì thì: **Postgres một mình đủ cho vài nghìn CCU đầu tiên.** Nó làm được cả `jsonb`, cả hàng đợi (`SELECT … FOR UPDATE SKIP LOCKED`), cả khoá phân tán (advisory lock). Thêm Redis khi đo được điểm nghẽn thật, không phải vì sơ đồ kiến trúc trông chuyên nghiệp hơn.

### Sáu luật cho dữ liệu kinh tế

1. **Tiền là số nguyên.** `bigint`, không bao giờ `float`. Vàng, gem, EXP, điểm — tất cả số nguyên; muốn chia nhỏ thì đổi đơn vị (lưu 1 vàng = 100 đơn vị) chứ đừng dùng dấu phẩy động.
2. **Ràng buộc đặt ở database, không chỉ trong code.** `CHECK (gold >= 0)`, `UNIQUE (request_id)`, khoá ngoại. Code sẽ có bug; database là lưới an toàn cuối cùng và nó không bao giờ quên.
3. **Sổ cái append-only.** Mỗi thay đổi tài nguyên là một dòng, không sửa, không xoá. Nó cho bạn ba thứ: dựng lại số dư khi nghi ngờ, hoàn đồ cho người chơi có bằng chứng, và đo faucet/drain thật của [[economy-design]] mà không cần dựng thêm hệ thống đo nào.
4. **Mọi lệnh ghi đều idempotent.** Client sinh `request_id`, database `UNIQUE` nó. Mạng rớt giữa chừng là chuyện hàng ngày trên 4G; không có idempotency thì mỗi lần rớt là một lần nhân đôi hoặc mất trắng.
5. **Một transaction cho một quyết định.** Trừ tiền và cộng đồ không được là hai request khác nhau — hai request là hai cơ hội để chỉ một nửa xảy ra.
6. **Thời gian là của server.** Dùng `now()` của Postgres cho mọi mốc. Đọc timestamp client gửi lên nghĩa là mời người chơi chỉnh đồng hồ máy để tua idle game.

```sql
-- Số dư: giá trị hiện tại, có ràng buộc không âm ngay ở tầng database.
CREATE TABLE wallet (
  user_id    uuid PRIMARY KEY,
  gold       bigint NOT NULL DEFAULT 0 CHECK (gold >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Sổ cái: mỗi thay đổi một dòng. request_id UNIQUE chính là cái chặn nhân đôi.
CREATE TABLE wallet_tx (
  id            bigserial PRIMARY KEY,
  request_id    text UNIQUE NOT NULL,
  user_id       uuid NOT NULL REFERENCES wallet(user_id),
  delta         bigint NOT NULL,
  balance_after bigint NOT NULL,
  reason        text NOT NULL,          -- 'quest:12', 'buy:sword', 'iap:gems_500'
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON wallet_tx (user_id, created_at DESC);

CREATE TABLE inventory (
  user_id uuid NOT NULL,
  item_id text NOT NULL,
  qty     int  NOT NULL CHECK (qty >= 0),
  PRIMARY KEY (user_id, item_id)
);
```

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Client gửi lệnh mua kèm requestId, server ghi vào database rồi mạng rớt; client gửi lại cùng requestId và server trả kết quả cũ mà không trừ tiền lần hai">
  <defs>
    <marker id="gsg-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
    <marker id="gsg-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#51cf9b"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="14"  y="8" width="120" height="30" rx="7" class="fig-box"/>
    <rect x="250" y="8" width="150" height="30" rx="7" class="fig-box"/>
    <rect x="510" y="8" width="136" height="30" rx="7" class="fig-box"/>
  </g>
  <text x="74"  y="28" text-anchor="middle" class="fig-label" font-size="12">Unity client</text>
  <text x="325" y="28" text-anchor="middle" class="fig-label" font-size="12">API Go</text>
  <text x="578" y="28" text-anchor="middle" class="fig-label" font-size="12">PostgreSQL</text>
  <g class="fig-line" stroke-dasharray="4 5" stroke-width="1" fill="none">
    <path d="M74 42 V240"/>
    <path d="M325 42 V240"/>
    <path d="M578 42 V240"/>
  </g>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#gsg-b)" fill="none">
    <path d="M74 72 H321"/>
    <path d="M325 104 H574"/>
    <path d="M578 134 H329"/>
    <path d="M325 164 H78"/>
  </g>
  <text x="197" y="66"  text-anchor="middle" class="fig-label" font-size="11">POST /buy · requestId = 7f3a</text>
  <text x="450" y="98"  text-anchor="middle" class="fig-muted" font-size="10">BEGIN · trừ vàng · ghi sổ cái 7f3a · COMMIT</text>
  <text x="452" y="128" text-anchor="middle" class="fig-muted" font-size="10">gold = 250</text>
  <text x="200" y="158" text-anchor="middle" class="fig-muted" font-size="10">200 gold=250</text>
  <text x="200" y="184" text-anchor="middle" font-size="11" fill="#ff8787">✕ mạng rớt — client không nhận được gì</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#gsg-b)" fill="none">
    <path d="M74 208 H321"/>
  </g>
  <text x="197" y="202" text-anchor="middle" class="fig-label" font-size="11">gửi lại — CÙNG requestId = 7f3a</text>
  <g stroke="#51cf9b" stroke-width="2" marker-end="url(#gsg-c)" fill="none">
    <path d="M325 234 H78"/>
  </g>
  <text x="332" y="228" text-anchor="start" font-size="11" fill="#51cf9b">đã có 7f3a → trả lại 250, KHÔNG trừ lần hai</text>
</svg>
<figcaption>Idempotency không phải tính năng cao cấp — nó là điều kiện tối thiểu để một lệnh ghi đi qua mạng di động mà không nhân đôi hoặc mất trắng.</figcaption>
</figure>

```go
// Mua vật phẩm: trừ tiền và cộng đồ trong CÙNG một transaction,
// gọi hai lần với cùng requestID vẫn ra đúng một kết quả.
func (s *Store) BuyItem(ctx context.Context, userID, itemID, requestID string, price int64) (int64, error) {
    tx, err := s.pool.Begin(ctx)
    if err != nil {
        return 0, err
    }
    defer tx.Rollback(ctx)       // không làm gì nếu đã Commit

    // 1. Chốt chặn idempotency: request này xử lý rồi thì trả lại kết quả cũ.
    var balance int64
    err = tx.QueryRow(ctx,
        "SELECT balance_after FROM wallet_tx WHERE request_id = $1", requestID).Scan(&balance)
    if err == nil {
        return balance, nil
    }
    if !errors.Is(err, pgx.ErrNoRows) {
        return 0, err
    }

    // 2. FOR UPDATE: hai request song song xếp hàng, thay vì cùng đọc 300 rồi cùng ghi 200.
    if err = tx.QueryRow(ctx,
        "SELECT gold FROM wallet WHERE user_id = $1 FOR UPDATE", userID).Scan(&balance); err != nil {
        return 0, err
    }
    if balance < price {
        return balance, ErrNotEnoughGold
    }
    balance -= price

    if _, err = tx.Exec(ctx,
        "UPDATE wallet SET gold = $1, updated_at = now() WHERE user_id = $2",
        balance, userID); err != nil {
        return 0, err
    }
    if _, err = tx.Exec(ctx,
        `INSERT INTO inventory (user_id, item_id, qty) VALUES ($1, $2, 1)
         ON CONFLICT (user_id, item_id) DO UPDATE SET qty = inventory.qty + 1`,
        userID, itemID); err != nil {
        return 0, err
    }
    // 3. Ghi sổ cái. UNIQUE(request_id) là thứ làm cho bước 1 có tác dụng.
    if _, err = tx.Exec(ctx,
        `INSERT INTO wallet_tx (request_id, user_id, delta, balance_after, reason)
         VALUES ($1, $2, $3, $4, 'buy:' || $5)`,
        requestID, userID, -price, balance, itemID); err != nil {
        return 0, err
    }
    return balance, tx.Commit(ctx)
}
```

Kiểm chứng đoạn trên bằng đúng một test: 50 goroutine cùng mua một lúc, 50 `requestID` khác nhau, ví có đúng 10 lần giá tiền. Kết quả phải là 10 giao dịch thành công, 40 lỗi `ErrNotEnoughGold`, `gold = 0`, và `wallet_tx` có đúng 10 dòng. Test đó bắt được cả race lẫn transaction viết sai; thiếu nó thì code trên "trông đúng" mà vẫn sai.

### Kết nối, khoá và migration

- **Pool nhỏ hơn bạn tưởng.** `pgxpool` 10–25 kết nối mỗi instance là đủ; Postgres mặc định chỉ nhận 100 kết nối, mà mỗi kết nối là một process thật. Tám instance × 25 đã vượt — nhiều instance thì đặt PgBouncer ở giữa (transaction pooling), đừng nâng `max_connections`.
- **Mọi query có `context` timeout** 2–3 giây. Không có nó, một query kẹt giữ kết nối, pool cạn dần, và toàn bộ API trả 503 vì một bảng thiếu index.
- **Khoá theo thứ tự cố định.** Giao dịch chạm nhiều dòng (trade giữa hai người chơi) phải khoá theo `user_id` tăng dần. Hai transaction khoá ngược chiều nhau là deadlock, và nó chỉ xuất hiện khi có người chơi thật.
- **Migration là một bước deploy riêng** (`goose`, `golang-migrate`), không phải auto-migrate lúc khởi động — ba instance khởi động cùng lúc cùng migrate là bảng nửa vời. Buộc phải chạy lúc start thì bọc bằng `pg_advisory_lock`.
- **Đo bằng `pg_stat_statements`**, thêm index theo query thật. Trên máy dev với 1.000 dòng thì mọi query đều nhanh; index thiếu chỉ lộ ra ở dữ liệu thật.

### Bảng xếp hạng: ZSET và cái bẫy của nó

```go
// ZADD GT: chỉ ghi khi điểm mới CAO HƠN. Dùng ZAdd thường thì một ván chơi tệ
// sẽ ghi đè điểm cao nhất của chính người chơi đó — bug kinh điển của leaderboard.
rdb.ZAddGT(ctx, "lb:season12", redis.Z{Score: float64(score), Member: userID})

top, _ := rdb.ZRevRangeWithScores(ctx, "lb:season12", 0, 99).Result()   // top 100
rank, _ := rdb.ZRevRank(ctx, "lb:season12", userID).Result()            // hạng của riêng mình
```

Score trong ZSET là `float64`, nên số nguyên vượt 2^53 mất chính xác — cẩn thận nếu bạn gói tie-break (thời điểm đạt điểm) vào phần thập phân. Và **Redis không phải nguồn chân lý**: một lần evict hoặc restart không bật persistence là mất bảng xếp hạng cả mùa. Ghi điểm xuống Postgres trong cùng luồng, coi ZSET là chỉ mục đọc nhanh dựng lại được.

## Server có thẩm quyền, kể cả khi game không có multiplayer

Game một người mà có bảng xếp hạng hoặc có IAP thì vẫn cần đủ những điều này:

- **Client gửi ý định, không gửi kết quả.** `POST /craft {"recipe":"iron_sword"}` chứ không phải `POST /inventory {…}`. Endpoint nào nhận nguyên inventory từ client là endpoint nhân bản vật phẩm — và nó trông hoàn toàn bình thường lúc review.
- **Validate đủ năm thứ** cho mỗi hành động: có sở hữu không, đủ nguyên liệu không, đủ cấp không, hết cooldown chưa, trạng thái có hợp lệ không. Mỗi thứ một dòng `return`.
- **Random do server quay**, seed ghi lại. Loot và gacha mà client quay thì người ta sẽ reroll tới khi ra đồ tốt. Xem [[randomness]].
- **IAP verify phía server** với Apple/Google, lưu transaction id `UNIQUE`. Cùng một receipt gửi lại lần hai không được cộng gems lần hai.
- **JWT ngắn hạn** (15 phút) + refresh token lưu trong database để thu hồi được. Đừng nhét `gold` hay `level` vào claim: nó cũ ngay lập tức và nó mời người ta thử sửa.
- **Rate limit theo user và theo IP** (token bucket trong Redis). Kinh tế của bạn thường chết vì bot farm trước khi có đủ người chơi thật.
- **Log mọi thay đổi tài nguyên kèm `reason`.** Không có nó thì không điều tra được khiếu nại và không hoàn đồ đúng người được.

## Vận hành: bốn thứ làm ngay tuần đầu

1. **Graceful shutdown.** `signal.NotifyContext` → ngừng nhận phòng mới → chờ trận đang chạy kết thúc (tối đa 2 phút) → `srv.Shutdown(ctx)`. Không có nó thì mỗi lần deploy là một lần người chơi mất trận, và bạn sẽ sợ deploy.
2. **`/healthz` tách khỏi `/readyz`.** Cái đầu nói process còn sống, cái sau nói ping được database. Gộp làm một thì database chậm một giây là load balancer rút sạch instance.
3. **Log có cấu trúc + metrics.** `log/slog` với request id truyền qua `context`; Prometheus đo p50/p95/**p99** theo từng endpoint — số trung bình luôn đẹp và luôn vô dụng. Mở `pprof` ở cổng nội bộ.
4. **Backup và thử restore.** Backup chưa restore thử lần nào là backup chưa tồn tại. Mất save là thứ người chơi không tha thứ, khác hẳn một bug gameplay.

Trước khi mở cửa: load test bằng `k6` hoặc `vegeta` ở 3–5 lần CCU dự kiến, nhìn p99 và số kết nối database đang mở. "Chạy ổn trên máy tôi" không phải số liệu.

## Bẫy thường gặp

| Bẫy | Lộ ra lúc nào |
|---|---|
| Gửi id `int64` qua JSON | Client JavaScript (web, dashboard, tool nội bộ) đọc thành float và sai ở id lớn — gửi id dạng **string** |
| Decode JSON vào `interface{}` | Số trong Go thành `float64`, tiền lệch một đơn vị mà không ai biết vì sao |
| `ZAdd` thay cho `ZAddGT` | Người chơi chơi tệ hơn tự hạ điểm cao nhất của chính mình |
| Coi Redis là nguồn chân lý | Một lần evict là mất bảng xếp hạng cả mùa |
| WebSocket không đặt read deadline và pong | Kết nối zombie tích lại, RAM lên đều rồi OOM sau ba ngày |
| Channel không buffer trong vòng lặp phòng | Một client mạng chậm treo cả phòng |
| Auto-migrate lúc khởi động | Hai instance migrate cùng lúc, bảng nửa vời, không rollback được |
| Query không timeout | Một query kẹt làm cạn pool, toàn bộ API trả 503 |
| Lấy thời gian từ client | Idle game bị tua bằng cách chỉnh đồng hồ máy |
| Ghi state phòng xuống database mỗi tick | Database chết ở phòng thứ năm mươi — chỉ ghi ở mốc quan trọng và khi kết thúc trận |

## 🤖 Prompt cho AI

**Dùng AI thế nào cho backend game**

AI viết backend Go rất tốt ở phần *khung* và rất dở ở phần *ranh giới*. Chia việc theo đúng ranh giới đó:

| Giao được | Đừng giao |
|---|---|
| Schema SQL, migration, query, index từ mô tả bảng | Quyết định cái gì là nguồn chân lý, cái gì được phép mất |
| Handler CRUD, middleware auth / rate limit / log | Mô hình đồng thời của room server — ai sở hữu state |
| Test đồng thời, load test k6, Dockerfile, CI | Quy tắc kinh tế: giá, trần, faucet/drain |
| Sinh struct Go ↔ C# từ protobuf, viết client Unity | Câu "đã an toàn rồi" — phải chứng minh bằng test, không phải bằng lời |

Quy trình bốn bước, dừng lại duyệt sau mỗi bước:

1. **Bạn viết bất biến trước.** Vàng không âm, một `request_id` chỉ trừ tiền một lần, server quyết random, thời gian lấy từ server. AI không suy ra được những điều này từ đầu bài, và nó sẽ không tự hỏi.
2. **Bắt nó sinh schema + migration + ràng buộc database trước**, trước khi viết một dòng handler. Ràng buộc sai thì mọi thứ phía trên vô nghĩa; và `CHECK (gold >= 0)` là thứ nó hay bỏ quên nhất vì code "đã kiểm tra rồi".
3. **Handler kèm test cho đường hỏng**, không phải đường thành công: hết tiền, gọi hai lần cùng `request_id`, 50 goroutine mua cùng lúc, database timeout giữa transaction.
4. **Bắt nó chạy `go test -race ./...` và dán output thật.** Code đồng thời không có race detector thì "trông đúng" là vô nghĩa — và AI rất sẵn lòng khẳng định là đã chạy.

Với client Unity thì giao ngược lại: AI viết lớp gọi API, retry, parse JSON rất nhanh và ít sai; cái bạn phải tự quyết là **cái gì client được phép tự tính** (hiển thị, dự đoán) và cái gì phải chờ server xác nhận.

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Nhịp ghi của game:** turn-based/idle (vài request mỗi phút) hay action realtime (20Hz). Quyết định toàn bộ kiến trúc, và AI mặc định coi mọi thứ là CRUD web.
- **CCU mục tiêu và p99 chấp nhận được** — ví dụ 5.000 CCU, p99 dưới 200ms. Không có số thì nó sẽ đẻ ra kiến trúc microservice cho game 200 người chơi.
- **Phiên bản và thư viện được phép:** Go 1.22+, PostgreSQL 16, Redis 7, Unity 6; `pgx` hay `database/sql`; `gorilla/websocket` hay `coder/websocket`.
- **Cái gì authoritative:** server quyết tiền, loot, thời gian; client chỉ gửi ý định.
- **Đơn vị tiền tệ là số nguyên, có trần, không âm** — nói thẳng, vì mặc định của JSON là số thực.
- **Idempotency key do ai sinh** (client) và sống ở đâu (cột `UNIQUE` trong sổ cái).
- **Triển khai ở đâu:** một VPS hay k8s + Agones. Khác nhau ở graceful shutdown, service discovery và cách scale phòng.
- **Có build WebGL không** — WebGL nghĩa là không UDP và server phải trả CORS header.

**Mẫu prompt**

```
Viết service Go 1.22 làm backend cho game mobile idle RPG, client Unity 6.
PostgreSQL 16 + Redis 7, một VPS, mục tiêu 5.000 CCU, p99 < 200ms.

BẤT BIẾN — không được vi phạm dòng nào:
- gold là bigint, CHECK (gold >= 0). KHÔNG dùng float cho bất kỳ tài nguyên nào.
- Mọi endpoint ghi nhận request_id do client sinh. Gọi lại cùng request_id phải
  trả đúng kết quả cũ và KHÔNG ghi lần hai — chặn bằng UNIQUE ở database,
  không chỉ bằng if trong code.
- Mọi thay đổi tài nguyên ghi một dòng vào bảng wallet_tx (append-only, có reason).
- Thời gian lấy từ now() của Postgres. KHÔNG đọc timestamp client gửi lên.
- Client chỉ gửi Ý ĐỊNH. KHÔNG có endpoint nào nhận gold/inventory từ client.

Endpoint: POST /v1/claim-idle, POST /v1/buy, GET /v1/profile.

Giao theo thứ tự, DỪNG LẠI chờ tôi duyệt sau mỗi bước:
1. Migration SQL (goose) + toàn bộ ràng buộc database.
2. Tầng store dùng pgx: mỗi quyết định một transaction, mọi query có context timeout 3s.
3. Test: hết tiền; gọi 2 lần cùng request_id; 50 goroutine mua cùng lúc trên ví
   chỉ đủ 10 lần. Chạy `go test -race ./...` và dán output THẬT, không tóm tắt.

KHÔNG dùng ORM. KHÔNG auto-migrate lúc khởi động. KHÔNG biến toàn cục có thể ghi.
```

**Bẫy thường gặp:** AI sinh endpoint nhận nguyên trạng thái từ client (`POST /save {"gold": 99999}`) vì đó là cách viết CRUD phổ biến nhất trong dữ liệu huấn luyện — và nó trông hoàn toàn bình thường lúc review, chỉ sai về mặt *ai được quyền quyết*. Ba cái hay gặp nữa: dùng `float64` cho tiền vì JSON mặc định thế; dùng ORM với auto-migrate làm biến mất mọi `CHECK` và `UNIQUE` bạn đã yêu cầu; và viết room server bằng một `map` dùng chung với `sync.Mutex` rải rác thay vì một goroutine sở hữu state — bản mutex chạy đúng trong test một người và hỏng khi có hai mươi người vào cùng lúc.

## 🎮 Unity

Phía client chỉ có ba việc, nhưng làm sai cả ba thì backend viết tốt tới đâu cũng vô ích: gọi API đúng cách, **không tin dữ liệu local**, và sống sót khi mạng rớt giữa một lệnh ghi.

**Component & nơi đặt**

- `GameApi.cs` — đặt ở `Assets/Scripts/Net/`, trên một GameObject `DontDestroyOnLoad`.
- `PendingRequest` — `requestId` của lệnh ghi **chưa được xác nhận**, ghi xuống đĩa *trước khi* gửi. Mở app lại thì gửi lại đúng id đó.
- `JsonUtility` đủ cho DTO phẳng như dưới đây. Cần `Dictionary`, mảng ở cấp cao nhất, hay phân biệt "field vắng mặt" với "field bằng 0" thì thêm `com.unity.nuget.newtonsoft-json` qua Package Manager — và nhớ `link.xml` để IL2CPP không strip mất kiểu dùng qua reflection.

**Code**

```csharp
using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

// Gọi backend Go: JWT ở header, requestId cho mọi lệnh GHI, retry có backoff + jitter.
public class GameApi : MonoBehaviour
{
    [SerializeField] string baseUrl = "https://api.example.com";
    [SerializeField] int timeoutSeconds = 10;    // UnityWebRequest KHÔNG có timeout mặc định
    [SerializeField] int maxRetry = 3;

    string accessToken;
    bool buyInFlight;                            // bấm 5 lần vẫn chỉ gửi 1 request

    [Serializable] class BuyReq { public string requestId; public string itemId; }
    [Serializable] public class BuyResp { public long gold; public string itemId; }

    public IEnumerator Buy(string itemId, Action<BuyResp> onDone, Action<string> onFail)
    {
        if (buyInFlight) { onFail?.Invoke("đang xử lý"); yield break; }
        buyInFlight = true;

        // requestId sinh MỘT LẦN và giữ nguyên qua mọi lần retry — đó là toàn bộ điểm của idempotency.
        var body = JsonUtility.ToJson(new BuyReq {
            requestId = Guid.NewGuid().ToString("N"),
            itemId = itemId,
        });
        yield return Post(baseUrl + "/v1/buy", body, onDone, onFail);
        buyInFlight = false;
    }

    IEnumerator Post<T>(string url, string json, Action<T> onDone, Action<string> onFail)
    {
        float delay = 0.5f;
        for (int attempt = 1; attempt <= maxRetry; attempt++)
        {
            using (var www = new UnityWebRequest(url, UnityWebRequest.kHttpVerbPOST))
            {
                www.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
                www.downloadHandler = new DownloadHandlerBuffer();
                www.SetRequestHeader("Content-Type", "application/json");
                if (!string.IsNullOrEmpty(accessToken))
                    www.SetRequestHeader("Authorization", "Bearer " + accessToken);
                www.timeout = timeoutSeconds;

                yield return www.SendWebRequest();

                if (www.result == UnityWebRequest.Result.Success)
                {
                    onDone?.Invoke(JsonUtility.FromJson<T>(www.downloadHandler.text));
                    yield break;
                }

                // 4xx là lỗi của chính mình: gửi lại vẫn sai. Chỉ thử lại lỗi mạng và 5xx.
                bool retryable = www.result == UnityWebRequest.Result.ConnectionError
                              || www.responseCode >= 500;
                if (!retryable || attempt == maxRetry)
                {
                    onFail?.Invoke(www.responseCode + " " + www.error);
                    yield break;
                }
            }
            // Realtime, không phải WaitForSeconds: mở popup rồi đặt timeScale = 0
            // thì retry sẽ đứng im vĩnh viễn.
            yield return new WaitForSecondsRealtime(delay + UnityEngine.Random.Range(0f, 0.3f));
            delay *= 2f;
        }
    }
}
```

**Bẫy Unity cụ thể**

- **`UnityWebRequest` không có timeout mặc định.** Mạng kiểu "có sóng nhưng không đi đâu" (wifi cổng captive, 4G chập chờn) làm coroutine chờ vô hạn, người chơi nhìn vòng xoay mãi. Luôn đặt `www.timeout`.
- **`WaitForSeconds` chạy theo `timeScale`.** Popup nào đặt `timeScale = 0` là backoff của bạn chết. Dùng `WaitForSecondsRealtime` cho mọi thứ liên quan tới mạng.
- **`JsonUtility` nuốt lỗi.** Server đổi tên field thì nó trả `0`/`null` chứ không báo gì — client hiện 0 vàng, không log, không ai biết vì sao. Có phiên bản hoá API (`/v1/`) và test hợp đồng giữa hai bên.
- **Id `int64`:** Unity đọc `long` bình thường, nhưng nếu bạn còn có dashboard web hoặc đi qua một dịch vụ trung gian chạy JavaScript thì id vượt 2^53 sẽ sai **lặng lẽ**. Gửi id dạng string là an toàn nhất.
- **`PlayerPrefs` không mã hoá** (registry trên Windows, XML trong `shared_prefs` trên Android). Refresh token nằm đó là đọc được trên máy đã root — chấp nhận được **nếu** server thu hồi được token, không chấp nhận được nếu token sống một năm.
- **Tắt app giữa một lệnh ghi.** Request đã tới server, client chưa nhận phản hồi. Không lưu `requestId` xuống đĩa trước khi gửi thì người chơi "mua rồi mà không có đồ" — và họ đúng, tiền đã bị trừ thật.
- **`Application.internetReachability` chỉ nói có mạng hay không**, không nói server còn sống. Đừng dùng nó thay cho retry thật.
- **WebGL:** không UDP, và server Go phải trả `Access-Control-Allow-Origin`. Thiếu CORS thì trong Editor chạy ngon, bản WebGL im lặng hỏng — lỗi chỉ hiện trong console của trình duyệt.
- **`OnApplicationPause(false)`** sau khi máy ngủ: token có thể đã hết hạn và state trong RAM đã cũ. Refresh token rồi đồng bộ lại từ server, đừng tin cái đang có.

**Kiểm tra nhanh**

- Bấm nút mua 5 lần thật nhanh: log server có **đúng một** dòng `buy:`, và `wallet_tx` thêm đúng một dòng.
- Bật Airplane Mode ngay sau khi bấm mua rồi tắt app, mở lại: vật phẩm về **một** cái, vàng bị trừ **một** lần.
- Chỉnh đồng hồ máy tiến một ngày: phần thưởng offline không đổi (server tính bằng `now()` của nó).
- Dùng proxy (Charles/Proxyman) sửa response `gold` thành 999999: lần đồng bộ kế tiếp giá trị về đúng con số của server.
- Tắt wifi trong Editor: sau `maxRetry` lần, UI hiện lỗi tử tế trong khoảng 10 giây, không treo vô hạn.
