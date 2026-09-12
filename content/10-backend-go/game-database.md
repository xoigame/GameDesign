---
title: Database cho game
icon: 🗄️
summary: Dữ liệu nào về chỗ nào, sáu luật cho dữ liệu kinh tế, và cách viết một lệnh ghi tiền chạy hai lần vẫn chỉ trừ một lần.
status: deep
read: 587
level: advanced
order: 20
tags: [backend, database, postgres, redis, economy]
related: [game-server-go, economy-design, unity-save-data, playtesting-metrics]
---

Phần lớn thiệt hại thật của một game online không đến từ hack netcode mà đến từ **dữ liệu**: nhân đôi vật phẩm vì một lần retry, lạm phát vì không ai đo được tài nguyên phát ra, mất save vì backup chưa bao giờ được restore thử. Node này về chỗ để dữ liệu và luật viết vào nó. Phần process phục vụ nó ở [[game-server-go]].

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

## Bẫy thường gặp

| Bẫy | Lộ ra lúc nào |
|---|---|
| Dùng `float` cho tài nguyên | Số dư lệch dần, không lần được từ giao dịch nào |
| `ZAdd` thay cho `ZAddGT` | Người chơi chơi tệ hơn tự hạ điểm cao nhất của chính mình |
| Coi Redis là nguồn chân lý | Một lần evict hoặc restart là mất bảng xếp hạng cả mùa |
| Không có sổ cái | Khiếu nại "tôi mất đồ" không điều tra được, và không hoàn đồ đúng người được |
| Auto-migrate lúc khởi động | Hai instance migrate cùng lúc, bảng nửa vời, không rollback được |
| Query không có `context` timeout | Một query kẹt làm cạn pool, toàn bộ API trả 503 |
| Pool đặt to "cho chắc" | 8 instance × 50 kết nối vượt `max_connections`, Postgres từ chối kết nối mới |
| Khoá nhiều dòng không theo thứ tự cố định | Deadlock, chỉ xuất hiện khi có trade giữa người chơi thật |
| Index thiếu | Máy dev 1.000 dòng nhanh như chớp; production chậm dần rồi sập ở giờ cao điểm |
| Event analytics đổ chung vào Postgres | Bảng phình vài chục triệu dòng, mọi query khác chậm theo |

## 🤖 Prompt cho AI

**Dùng AI thế nào cho tầng dữ liệu**

Đây là chỗ **đáng giao cho AI nhất** trong cả nhánh — schema, migration, query, index là việc máy làm tốt và kiểm chứng được — nhưng cũng là chỗ sai thì đắt nhất, vì dữ liệu hỏng không revert bằng `git`. Nguyên tắc: bắt nó viết **ràng buộc trước, code sau**.

| Giao được | Đừng giao |
|---|---|
| Schema, migration, index, query, `EXPLAIN` và đọc plan | Quyết định dữ liệu nào là nguồn chân lý, dữ liệu nào được phép mất |
| Test đồng thời: mua song song, retry cùng `request_id`, hết tiền | Quy tắc kinh tế: giá, trần, tốc độ phát tài nguyên — xem [[economy-design]] |
| Script backup/restore, seed dữ liệu giả để load test | Xoá hoặc sửa dữ liệu production |

Ba bước theo đúng thứ tự này:

1. **Bạn liệt kê bất biến bằng tiếng Việt**, mỗi dòng một câu: "vàng không bao giờ âm", "một `request_id` chỉ trừ tiền một lần", "mọi thay đổi tài nguyên có một dòng sổ cái".
2. **Bắt AI dịch từng bất biến thành một ràng buộc database** (`CHECK`, `UNIQUE`, khoá ngoại) *và* một test chứng minh ràng buộc đó chặn thật. Bất biến nào không dịch được thành ràng buộc thì nói rõ vì sao — đó là chỗ bạn phải tự canh trong code.
3. **Rồi mới tới query và index**, kèm `EXPLAIN (ANALYZE, BUFFERS)` trên dữ liệu giả đúng cỡ thật. Index do AI "đoán là cần" mà không có plan là index vô dụng chiếm chỗ ghi.

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Đơn vị và trần của từng tài nguyên:** vàng `bigint` không âm, gem trần bao nhiêu, có cho phép nợ không.
- **Ai sinh `request_id`** (client) và nó sống ở đâu (cột `UNIQUE` trong sổ cái).
- **Cỡ dữ liệu dự kiến:** 10.000 hay 10 triệu người chơi, mỗi người bao nhiêu dòng inventory, giữ analytics bao lâu. Không có số thì index và kiểu dữ liệu đều là đoán.
- **Phiên bản:** PostgreSQL 16, Redis 7 — cú pháp `ZADD GT`, `MERGE`, `SKIP LOCKED` khác nhau theo phiên bản.
- **Luật xử lý xung đột save** khi hai thiết bị cùng ghi: server thắng, client thắng, hay hỏi người chơi.

**Mẫu prompt**

```
Thiết kế tầng dữ liệu PostgreSQL 16 + Redis 7 cho game <thể loại>, 200.000 tài khoản,
mỗi tài khoản ~80 dòng inventory, giữ log tài nguyên 180 ngày.

BẤT BIẾN — dịch TỪNG dòng thành ràng buộc ở database, không phải if trong code:
1. gold là bigint, không bao giờ âm.
2. Một request_id chỉ được ghi một lần (retry mạng phải vô hại).
3. Mỗi thay đổi tài nguyên có đúng một dòng sổ cái, có reason, không sửa không xoá.
4. qty trong inventory không âm; không có dòng qty = 0 tồn đọng.
5. Thời gian ghi lấy từ now() của database.

Giao theo thứ tự, DỪNG chờ tôi duyệt sau mỗi bước:
1. Migration goose: bảng + CHECK + UNIQUE + khoá ngoại + index, kèm một dòng
   nói bất biến nào ứng với ràng buộc nào. Bất biến nào KHÔNG ràng buộc được thì nói rõ.
2. Hàm mua vật phẩm bằng pgx: một transaction, idempotent theo request_id,
   khoá ví bằng FOR UPDATE, ghi sổ cái.
3. Test: 50 goroutine mua song song trên ví chỉ đủ 10 lần → đúng 10 thành công,
   gold = 0, sổ cái đúng 10 dòng. Gọi lại cùng request_id → không ghi thêm.
   Chạy `go test -race ./...`, dán output THẬT.

KHÔNG dùng ORM. KHÔNG auto-migrate lúc khởi động. KHÔNG float cho bất kỳ tài nguyên nào.
```

**Bẫy thường gặp:** AI mặc định dùng ORM có `AutoMigrate` (GORM) vì đó là cách phổ biến nhất trong dữ liệu huấn luyện — và `AutoMigrate` **âm thầm bỏ qua** mọi `CHECK` và `UNIQUE` bạn vừa yêu cầu, nên schema chạy được mà không còn một ràng buộc nào. Ba cái nữa: đọc số dư rồi `UPDATE` ở hai câu lệnh riêng không khoá (hai người mua cùng lúc, một người mua không mất tiền); `float8` cho tiền vì JSON mặc định thế; và bịa index cho mọi cột "cho chắc" thay vì đọc `EXPLAIN`.

## 🎮 Unity

Phía client, tầng dữ liệu lộ ra thành đúng một câu hỏi: **khi hai thiết bị cùng ghi save thì ai thắng, và người chơi có được biết không.**

**Component & nơi đặt**

- `SaveSync.cs` — đặt ở `Assets/Scripts/Net/`, trên GameObject `DontDestroyOnLoad`.
- Save local vẫn giữ nguyên như [[unity-save-data]] mô tả; server là **bản sao có thẩm quyền**, không phải chỗ thay thế file local.
- Mỗi bản save mang một `version` do server cấp. Client ghi lên kèm version đang giữ; server thấy version cũ hơn thì từ chối bằng `409` và trả kèm bản mới.

**Code**

```csharp
using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

// Đồng bộ save có chống ghi đè: gửi kèm version đang giữ, server trả 409 nếu đã cũ.
public class SaveSync : MonoBehaviour
{
    [SerializeField] string url = "https://api.example.com/v1/save";
    [SerializeField] float minIntervalSeconds = 30f;   // không ghi mỗi hành động, cũng không ghi mỗi frame

    [Serializable] public class SaveDto { public long version; public int gold; public string data; }

    SaveDto local = new SaveDto();
    float lastPush = -999f;
    bool dirty, pushing;

    public void MarkDirty() => dirty = true;

    void Update()
    {
        if (dirty && !pushing && Time.unscaledTime - lastPush >= minIntervalSeconds)
            StartCoroutine(Push());
    }

    // Trên mobile đây là chỗ chắc chắn chạy trước khi app bị hệ điều hành kill.
    void OnApplicationPause(bool paused)
    {
        if (paused && dirty && !pushing) StartCoroutine(Push());
    }

    IEnumerator Push()
    {
        pushing = true;
        dirty = false;
        lastPush = Time.unscaledTime;

        using (var www = new UnityWebRequest(url, UnityWebRequest.kHttpVerbPUT))
        {
            www.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(JsonUtility.ToJson(local)));
            www.downloadHandler = new DownloadHandlerBuffer();
            www.SetRequestHeader("Content-Type", "application/json");
            www.timeout = 10;

            yield return www.SendWebRequest();

            if (www.responseCode == 409)                 // thiết bị khác đã ghi trước mình
            {
                Resolve(JsonUtility.FromJson<SaveDto>(www.downloadHandler.text));
            }
            else if (www.result == UnityWebRequest.Result.Success)
            {
                local.version = JsonUtility.FromJson<SaveDto>(www.downloadHandler.text).version;
            }
            else
            {
                dirty = true;                            // hỏng thì giữ cờ, lần sau ghi lại
            }
        }
        pushing = false;
    }

    // Luật phải giải thích được cho người chơi. Ở đây: giữ bản tiến xa hơn, và NÓI ra.
    void Resolve(SaveDto server)
    {
        bool serverWins = server.gold >= local.gold;
        Debug.Log($"Xung đột save — local {local.gold} vàng, server {server.gold} vàng → giữ bản {(serverWins ? "server" : "local")}");
        if (serverWins) local = server;                  // nhận bản server, bỏ thay đổi local
        else { local.version = server.version; dirty = true; }   // giữ bản local, ghi lại với version mới
    }
}
```

**Bẫy Unity cụ thể**

- **Ghi mỗi lần người chơi làm gì đó.** Một request mỗi lần nhặt đồ là cách nhanh nhất để tự DDoS chính mình. Gom theo mốc (đổi màn, mở shop, `OnApplicationPause`) cộng một khoảng tối thiểu.
- **`OnApplicationQuit` không chạy trên mobile** khi hệ điều hành kill app. `OnApplicationPause(true)` mới là chỗ đáng tin — và coroutine ở đó có thể không kịp xong, nên save local phải đã ghi xuống đĩa trước đó.
- **Im lặng ghi đè khi xung đột.** Người chơi chơi trên điện thoại rồi mở máy tính bảng, bản cũ đè bản mới, và họ mất một buổi tối tiến trình. Luật nào cũng được, nhưng phải **nói ra** bằng UI, đừng quyết thầm.
- **Tin `version` do client tự tăng.** Version phải do server cấp; client tự tăng thì hai thiết bị sẽ cùng nghĩ mình mới nhất.
- **Nhét cả save vào `PlayerPrefs`.** Nó không mã hoá, có giới hạn kích thước trên WebGL, và sửa bằng tay được — xem [[unity-save-data]].

**Kiểm tra nhanh**

- Đăng nhập cùng tài khoản trên hai thiết bị (hoặc hai bản build), tiêu tiền ở cả hai: thiết bị ghi sau **không** im lặng đè, và người chơi thấy thông báo.
- Sửa `local.gold` bằng debugger rồi đẩy lên: lần đồng bộ kế tiếp server trả về con số của nó, không phải của bạn.
- Bấm Home ngay sau khi mua đồ rồi mở lại app: vật phẩm còn đó, vàng bị trừ đúng một lần.
- Ngắt mạng 5 phút rồi bật lại: đúng **một** request save được gửi, không phải 10 request dồn.
