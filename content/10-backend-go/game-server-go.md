---
title: Server Go cho game
icon: 🖧
summary: Viết process Go phục vụ game Unity — một goroutine sở hữu một phòng, chọn giao thức theo loại dữ liệu, và không tin con số nào client gửi lên.
status: deep
read: 585
level: advanced
order: 10
tags: [backend, server, go, realtime, live-ops]
related: [game-database, unity-multiplayer, architecture-patterns, unity-save-data]
---

Node này về **process Go**: viết nó thế nào cho đúng, nói chuyện với client Unity bằng gì, và giữ quyền quyết định ở phía nào. Phần dữ liệu — bảng nào, transaction ra sao — nằm ở [[game-database]]; bức tranh chung của cả nhánh (netcode khác backend ra sao, vì sao chọn Go, ba loại process) ở [[backend-go]].

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

## Server có thẩm quyền, kể cả khi game không có multiplayer

Game một người mà có bảng xếp hạng hoặc có IAP thì vẫn cần đủ những điều này:

- **Client gửi ý định, không gửi kết quả.** `POST /craft {"recipe":"iron_sword"}` chứ không phải `POST /inventory {…}`. Endpoint nào nhận nguyên inventory từ client là endpoint nhân bản vật phẩm — và nó trông hoàn toàn bình thường lúc review.
- **Validate đủ năm thứ** cho mỗi hành động: có sở hữu không, đủ nguyên liệu không, đủ cấp không, hết cooldown chưa, trạng thái có hợp lệ không. Mỗi thứ một dòng `return`.
- **Random do server quay**, seed ghi lại. Loot và gacha mà client quay thì người ta sẽ reroll tới khi ra đồ tốt. Xem [[randomness]].
- **IAP verify phía server** với Apple/Google, lưu transaction id `UNIQUE`. Cùng một receipt gửi lại lần hai không được cộng gems lần hai.
- **JWT ngắn hạn** (15 phút) + refresh token lưu trong database để thu hồi được. Đừng nhét `gold` hay `level` vào claim: nó cũ ngay lập tức và nó mời người ta thử sửa.
- **Rate limit theo user và theo IP** (token bucket trong Redis). Kinh tế của bạn thường chết vì bot farm trước khi có đủ người chơi thật.
- **Log mọi thay đổi tài nguyên kèm `reason`.** Không có nó thì không điều tra được khiếu nại và không hoàn đồ đúng người được — chi tiết ở [[game-database]].

## Vận hành: bốn thứ làm ngay tuần đầu

1. **Graceful shutdown.** `signal.NotifyContext` → ngừng nhận phòng mới → chờ trận đang chạy kết thúc (tối đa 2 phút) → `srv.Shutdown(ctx)`. Không có nó thì mỗi lần deploy là một lần người chơi mất trận, và bạn sẽ sợ deploy.
2. **`/healthz` tách khỏi `/readyz`.** Cái đầu nói process còn sống, cái sau nói ping được database. Gộp làm một thì database chậm một giây là load balancer rút sạch instance.
3. **Log có cấu trúc + metrics.** `log/slog` với request id truyền qua `context`; Prometheus đo p50/p95/**p99** theo từng endpoint — số trung bình luôn đẹp và luôn vô dụng. Mở `pprof` ở cổng nội bộ.
4. **Backup và thử restore.** Backup chưa restore thử lần nào là backup chưa tồn tại. Mất save là thứ người chơi không tha thứ, khác hẳn một bug gameplay.

Trước khi mở cửa: load test bằng `k6` hoặc `vegeta` ở 3–5 lần CCU dự kiến, nhìn p99 và số kết nối database đang mở. "Chạy ổn trên máy tôi" không phải số liệu.

## Bẫy thường gặp

| Bẫy | Lộ ra lúc nào |
|---|---|
| Channel không buffer trong vòng lặp phòng | Một client mạng chậm treo cả phòng |
| WebSocket không đặt read deadline và pong | Kết nối zombie tích lại, RAM lên đều rồi OOM sau ba ngày |
| Goroutine không có đường thoát theo `ctx` | Số goroutine chỉ đi lên; process phình rồi chết sau vài ngày chạy |
| Ghi state phòng xuống database mỗi tick | Database chết ở phòng thứ năm mươi — chỉ ghi ở mốc quan trọng và khi kết thúc trận |
| Lấy thời gian từ client | Idle game bị tua bằng cách chỉnh đồng hồ máy |
| Gửi id `int64` qua JSON | Client JavaScript (dashboard, tool nội bộ) đọc thành float và sai ở id lớn — gửi id dạng **string** |
| Decode JSON vào `interface{}` | Số trong Go thành `float64`, tiền lệch một đơn vị mà không ai biết vì sao |
| Quên `targetFrameRate`/nhịp tick ở process phòng | Vòng lặp chạy hết tốc lực, một nhân CPU cho mỗi phòng, hoá đơn gấp ba |

## 🤖 Prompt cho AI

**Dùng AI thế nào cho code server**

AI viết Go rất tốt ở phần *khung* và rất dở ở phần *ranh giới*. Chia việc theo đúng ranh giới đó:

| Giao được | Đừng giao |
|---|---|
| Handler, middleware auth / rate limit / log, parse và validate | Mô hình đồng thời: ai sở hữu state của phòng |
| Test đường hỏng, load test k6, Dockerfile, CI, graceful shutdown | Quyết định client được phép tự tính cái gì |
| Lớp client Unity: retry, backoff, hàng đợi offline | Câu "đã an toàn rồi" — phải chứng minh bằng test, không phải bằng lời |

Bốn bước, dừng lại duyệt sau mỗi bước:

1. **Bạn viết bất biến trước.** Server quyết tài nguyên; client chỉ gửi ý định; thời gian của server. AI không suy ra được và nó sẽ không tự hỏi.
2. **Chốt mô hình đồng thời trước khi viết handler.** Nói thẳng "một goroutine sở hữu một phòng, giao tiếp qua channel, KHÔNG dùng mutex trên state phòng" — nếu không nó sẽ mặc định `map` + `sync.Mutex`.
3. **Handler kèm test cho đường hỏng**, không phải đường thành công: client gửi giá trị vô lý, gửi hai lần, ngắt kết nối giữa chừng, 50 client vào một phòng cùng lúc.
4. **Bắt nó chạy `go test -race ./...` và dán output thật.** Code đồng thời không có race detector thì "trông đúng" là vô nghĩa — và AI rất sẵn lòng khẳng định là đã chạy.

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Nhịp:** turn-based/idle (vài request mỗi phút) hay realtime (tick 20Hz). Quyết định toàn bộ hình dạng code.
- **Giao thức:** REST, WebSocket JSON, hay WebSocket nhị phân — và **có build WebGL không** (WebGL nghĩa là không UDP và server phải trả CORS header).
- **Phiên bản và thư viện:** Go 1.22+, `gorilla/websocket` hay `coder/websocket`, `pgx` hay `database/sql`.
- **CCU mục tiêu, p99 chấp nhận được, số người tối đa mỗi phòng.**
- **Cái gì authoritative** và client được phép dự đoán cái gì.
- **Triển khai ở đâu** — một VPS hay k8s + Agones, vì nó đổi cách viết graceful shutdown và cách tìm phòng.

**Mẫu prompt**

```
Viết room server Go 1.22 cho game <thể loại>, client Unity 6, WebSocket + JSON.
Tối đa 8 người một phòng, tick 20Hz, mục tiêu 200 phòng đồng thời trên 2 vCPU.

RÀNG BUỘC:
- MỘT goroutine sở hữu state của MỘT phòng. Giao tiếp bằng channel có buffer.
  KHÔNG sync.Mutex trên state phòng, KHÔNG map dùng chung giữa các phòng.
- Channel đầy thì NGẮT client đó, KHÔNG block vòng lặp phòng.
- Mọi goroutine thoát được bằng context. Phòng rỗng 30 giây thì tự dọn.
- Server validate mọi message: quyền, khoảng cách, cooldown. Client chỉ gửi Ý ĐỊNH.
- Kết thúc trận: gọi API ghi kết quả MỘT lần, có request_id. KHÔNG ghi DB mỗi tick.

Giao theo thứ tự, dừng chờ tôi duyệt:
1. Struct Room + vòng lặp Run(ctx) + cách client vào/ra.
2. Đọc/ghi WebSocket: read deadline, pong handler, một goroutine ghi duy nhất.
3. Test: 50 client vào cùng lúc, 1 client treo giữa chừng, shutdown giữa trận.
   Chạy `go test -race ./...` và dán output THẬT, không tóm tắt.

KHÔNG thêm thư viện ngoài stdlib + gorilla/websocket. KHÔNG biến toàn cục ghi được.
```

**Bẫy thường gặp:** AI sinh endpoint nhận nguyên trạng thái từ client (`POST /save {"gold": 99999}`) vì đó là cách viết CRUD phổ biến nhất trong dữ liệu huấn luyện — nó trông hoàn toàn bình thường lúc review, chỉ sai về *ai được quyền quyết*. Hai cái nữa hay gặp: room server viết bằng `map` dùng chung + `sync.Mutex` rải rác (chạy đúng khi test một mình, hỏng khi có hai mươi người), và goroutine đọc socket không có `ctx.Done()` nên rò mỗi lần có người thoát — cả hai chỉ lộ ra sau vài ngày chạy thật.

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
