---
title: Triển khai & vận hành server Go
icon: 🚀
summary: Đưa binary Go lên máy thật và giữ nó sống — ba mức hạ tầng theo quy mô, deploy không rớt người chơi, bốn chỉ số phải theo dõi, và runbook năm sự cố hay gặp.
status: deep
read: 589
level: advanced
order: 40
tags: [backend, go, devops, live-ops, monitoring]
related: [game-server-go, game-database, liveops, performance]
---

Viết xong server mới là nửa việc. Nửa còn lại — deploy mà không ai mất trận, biết được lúc nào hệ thống sắp hỏng, và sửa được lúc 2 giờ sáng — mới là thứ quyết định game của bạn online được bao lâu.

Tin tốt cho người dùng Go: `go build` cho ra **một file**, nên phần "đưa lên máy" đơn giản hơn hẳn so với .NET hay Node. Phần khó nằm ở [[game-server-go]] đã nói một nửa (graceful shutdown, health check) và ở đây là nửa còn lại.

## Ba mức hạ tầng, chọn theo quy mô thật

| Mức | Khi nào | Chi phí (ước lượng) | Cái bạn mất |
|---|---|---|---|
| **1 VPS + systemd** | Tới vài nghìn CCU, một region | 20–60 USD/tháng | Máy chết là game chết. Deploy thủ công |
| **Docker Compose trên 1–3 VPS** | Nhiều service (api, roomd, worker), vẫn một region | 60–200 USD/tháng | Vẫn tự lo scale và failover, nhưng deploy đã lặp lại được |
| **k8s (+ Agones cho room server)** | Nhiều region, phòng cần cấp phát động, có người trực | 300 USD/tháng trở lên | Một hệ thống nữa phải học và phải vận hành |

Con số chỉ để so bậc, không phải báo giá — nó đổi theo nhà cung cấp và thời điểm. Điều đáng nhớ: **đa số game indie chết ở mức 1 mà chưa bao giờ chạm giới hạn của mức 1.** Một VPS 4 vCPU / 8 GB chạy được vài nghìn CCU cho game turn-based hoặc idle. Lên k8s "cho sẵn sàng" là cách phổ biến nhất để tiêu ba tuần không làm game.

Mốc để lên mức tiếp theo, cụ thể: **CPU trung bình vượt 60% ở giờ cao điểm**, hoặc **cần deploy mà không được dừng dịch vụ**, hoặc **cần region thứ hai vì ping**. Chưa chạm mốc nào thì ở nguyên.

## Build & ship

```bash
# Một binary tĩnh, nhúng version để log và /healthz nói được nó đang chạy commit nào.
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
  -trimpath \
  -ldflags "-s -w -X main.version=$(git rev-parse --short HEAD)" \
  -o bin/api ./cmd/api
```

```dockerfile
# Image nhiều tầng: tầng build có Go, tầng chạy không có gì cả (~15 MB).
FROM golang:1.22 AS build
WORKDIR /src
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o /out/api ./cmd/api

FROM gcr.io/distroless/static-debian12
COPY --from=build /out/api /api
USER nonroot:nonroot
ENTRYPOINT ["/api"]
```

Chi tiết về layer cache, `.dockerignore` trong repo có cả Unity, và `compose.yml` cho môi trường dev nằm ở [[go-docker]].

Bốn quy tắc đi kèm:

- **Cấu hình qua biến môi trường**, không qua file trong image. Cùng một image chạy được ở staging và production — khác nhau chỉ ở biến.
- **Secret không nằm trong repo và không nằm trong image.** Trên một VPS: file `EnvironmentFile` của systemd với quyền `600`. Trên k8s: Secret.
- **`CGO_ENABLED=0`** để binary thật sự tĩnh, chạy được trong image trống. Bật CGO là lại phải lo glibc.
- **Nhúng version** và in nó ra ở dòng log đầu tiên. Câu hỏi "production đang chạy code nào" phải trả lời được trong 5 giây.

## Deploy không rớt người chơi

<figure class="fig">
<svg viewBox="0 0 660 230" role="img" aria-label="Trình tự deploy không gián đoạn: migration trước, bản mới khởi động và sẵn sàng, cân bằng tải chuyển sang bản mới, bản cũ drain rồi thoát">
  <defs>
    <marker id="gdo-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <text x="16" y="66"  class="fig-muted" font-size="11">Cân bằng tải</text>
  <text x="16" y="116" class="fig-muted" font-size="11">Bản cũ</text>
  <text x="16" y="166" class="fig-muted" font-size="11">Bản mới</text>
  <g class="fig-line" stroke-width="1" stroke-dasharray="4 5" fill="none">
    <path d="M212 34 V206"/>
    <path d="M330 34 V206"/>
    <path d="M448 34 V206"/>
    <path d="M566 34 V206"/>
  </g>
  <text x="154" y="28" text-anchor="middle" class="fig-muted" font-size="10">1. migration chạy trước</text>
  <text x="271" y="28" text-anchor="middle" class="fig-muted" font-size="10">2. bản mới khởi động</text>
  <text x="389" y="28" text-anchor="middle" class="fig-muted" font-size="10">3. readyz xanh</text>
  <text x="507" y="28" text-anchor="middle" class="fig-muted" font-size="10">4. rút bản cũ</text>
  <text x="620" y="28" text-anchor="middle" class="fig-muted" font-size="10">5. drain</text>
  <g class="fig-box-g">
    <rect x="96" y="48" width="470" height="28" rx="6" class="fig-box"/>
  </g>
  <text x="331" y="67" text-anchor="middle" class="fig-muted" font-size="11">không bao giờ ngừng nhận request của người chơi</text>
  <rect x="96" y="98" width="470" height="28" rx="6" fill="#51cf9b" opacity="0.28"/>
  <rect x="566" y="98" width="80" height="28" rx="6" fill="#ffd43b" opacity="0.30"/>
  <text x="331" y="117" text-anchor="middle" class="fig-label" font-size="11">đang phục vụ</text>
  <text x="606" y="117" text-anchor="middle" class="fig-muted" font-size="10">chờ trận xong</text>
  <rect x="212" y="148" width="118" height="28" rx="6" fill="#ffd43b" opacity="0.30"/>
  <rect x="330" y="148" width="316" height="28" rx="6" fill="#51cf9b" opacity="0.28"/>
  <text x="271" y="167" text-anchor="middle" class="fig-muted" font-size="10">khởi động, readyz đỏ</text>
  <text x="488" y="167" text-anchor="middle" class="fig-label" font-size="11">nhận người chơi mới</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#gdo-a)" fill="none">
    <path d="M448 132 V144"/>
  </g>
  <text x="334" y="204" text-anchor="middle" class="fig-muted" font-size="11">Không có bước nào mà cả hai bản cùng tắt — và không ai bị ngắt giữa trận</text>
</svg>
<figcaption>Thứ tự này áp dụng được cho cả systemd lẫn k8s. Bước hay bị bỏ nhất là bước 1: migration phải chạy <em>trước</em> và phải tương thích ngược với bản cũ.</figcaption>
</figure>

- **Migration chạy trước và phải tương thích ngược.** Trong lúc deploy, bản cũ và bản mới cùng đọc một database. Thêm cột thì được; đổi tên hoặc xoá cột thì phải chia làm hai lần deploy (thêm mới → chuyển dữ liệu → deploy code → xoá cũ ở lần sau).
- **Bản cũ bị rút khỏi cân bằng tải trước khi bị dừng.** Trên k8s là `preStop` sleep vài giây; trên VPS là gỡ khỏi upstream nginx rồi mới `systemctl stop`. Thiếu bước này thì vài request cuối rơi vào một process đang đóng.
- **Room server phải drain, không được kill.** Ngừng nhận phòng mới, chờ trận hiện tại xong (đặt trần, ví dụ 2 phút), rồi thoát — xem phần graceful shutdown ở [[game-server-go]].
- **Client phải chịu được việc này.** Xem mục 🎮 bên dưới: reconnect có backoff, và cổng chặn phiên bản để bản cũ không nói chuyện với API mới.

## Bốn chỉ số vàng, và ngưỡng cảnh báo

| Chỉ số | Đo bằng gì | Cảnh báo khi |
|---|---|---|
| **Độ trễ** | p99 theo endpoint (không phải trung bình) | p99 > 2× mức bình thường trong 5 phút |
| **Lưu lượng** | request/giây, kết nối WebSocket đang mở | Rơi đột ngột > 30% — thường là client không vào được, không phải hết người chơi |
| **Tỉ lệ lỗi** | % 5xx, tách khỏi 4xx | 5xx > 1% trong 5 phút |
| **Độ bão hoà** | CPU, RAM, **số kết nối database đang dùng / tối đa**, số goroutine | Pool > 80%, hoặc goroutine tăng đơn điệu 30 phút |

Hai thứ riêng của Go nên đưa vào dashboard ngay từ đầu: **số goroutine** (chỉ tăng không giảm = đang rò) và **thời gian GC**. Cả hai lấy miễn phí từ `runtime/metrics` hoặc client Prometheus chính thức.

Một cảnh báo tốt phải nói được **ai bị ảnh hưởng** và **làm gì tiếp theo**. "CPU 85%" không phải cảnh báo; "p99 của /v1/buy = 3.2s trong 5 phút, pool DB 24/25" mới là.

## Runbook: năm sự cố hay gặp

| Triệu chứng | Nguyên nhân hay gặp nhất | Lệnh kiểm tra ngay |
|---|---|---|
| API trả 503 hàng loạt, CPU thấp | Pool database cạn vì một query chậm giữ kết nối | `SELECT count(*), state FROM pg_stat_activity GROUP BY state;` rồi xem `pg_stat_statements` |
| RAM tăng đều rồi OOM sau vài ngày | Goroutine rò (client ngắt mà goroutine đọc còn sống) | `curl localhost:6060/debug/pprof/goroutine?debug=1 \| head -50` |
| Một nhân CPU 100% dù không ai chơi | Vòng lặp không có nhịp: thiếu ticker, hoặc `select` không có nhánh chờ | `go tool pprof -seconds 30 http://localhost:6060/debug/pprof/profile` |
| Ổ đĩa đầy, service chết đột ngột | Log không xoay vòng | `du -sh /var/log/* \| sort -h \| tail`, đặt giới hạn cho journald hoặc logrotate |
| p99 nhảy vọt ngay sau deploy | Query mới thiếu index, chỉ lộ ở dữ liệu thật | `pg_stat_statements` sắp theo `mean_exec_time`, rồi `EXPLAIN (ANALYZE, BUFFERS)` |

Viết runbook **trước khi cần tới nó**, và để nó cạnh chỗ nhận cảnh báo. Lúc 2 giờ sáng không ai nhớ được tên bảng thống kê của Postgres.

## Sao lưu: thứ duy nhất không được phép sai

- **Backup tự động hàng ngày + point-in-time recovery** cho database. Đây là ranh giới giữa "một sự cố" và "hết game".
- **Diễn tập restore mỗi quý**, bấm giờ. Backup chưa restore thử lần nào là backup chưa tồn tại — và bạn chỉ phát hiện điều đó vào đúng ngày cần nó.
- **Giữ bản sao ở nơi khác nhà cung cấp.** Tài khoản bị khoá nhầm là chuyện có thật.
- **Save của người chơi cần thêm một lớp nữa**: giữ lịch sử thay đổi (sổ cái ở [[game-database]]) để hoàn trạng thái cho một người mà không phải restore cả database.

## Bẫy thường gặp

| Bẫy | Hậu quả |
|---|---|
| Deploy bằng `git pull` trên máy chủ | Không biết production đang chạy code nào, không rollback được |
| Không có `/readyz` riêng | Cân bằng tải đẩy người chơi vào instance chưa nối được database |
| Migration chạy lúc khởi động, nhiều instance | Bảng nửa vời, không rollback được — xem [[game-database]] |
| Đổi tên cột trong một lần deploy | Bản cũ và bản mới cùng chạy, một trong hai vỡ |
| Log mọi request ở mức info | Ổ đĩa đầy, và log thật chìm trong nhiễu |
| Không giới hạn RAM cho container | Một rò rỉ kéo sập cả máy thay vì chỉ một service |
| `pprof` mở ra internet | Ai cũng dump được heap của bạn — chỉ bind cổng nội bộ |
| Chỉ cảnh báo khi server *chết* | Sự cố thật thường là "chậm dần", không phải "tắt" |
| Không có cổng chặn phiên bản client | Bản cũ trên máy người chơi gọi API mới, lỗi lung tung không tái hiện được |

## 🤖 Prompt cho AI

**Dùng AI thế nào cho triển khai và vận hành**

Đây là mảng AI viết nhanh và đúng khuôn mẫu — Dockerfile, systemd unit, GitHub Actions, cấu hình nginx, alert rule — nhưng cũng là mảng **một lệnh sai làm mất dữ liệu thật**. Ranh giới rõ ràng:

| Giao được | Không giao, kể cả khi nó đề nghị |
|---|---|
| Dockerfile, systemd unit, CI pipeline, script build | Chạy lệnh trực tiếp lên production |
| Alert rule, dashboard, cấu hình log/metrics | Sửa hoặc xoá dữ liệu để "khắc phục sự cố" |
| Runbook nháp, checklist deploy, script diễn tập restore | Quyết định hạ tầng mà chưa có số liệu tải thật |
| Đọc log/pprof rồi đưa **giả thuyết** kèm cách kiểm chứng | Kết luận nguyên nhân mà chưa chạy lệnh kiểm tra |

Cách dùng hiệu quả nhất khi đang có sự cố: **dán số liệu, xin giả thuyết xếp hạng, tự chạy lệnh kiểm tra.** Yêu cầu nó đưa 3 giả thuyết kèm *lệnh phân biệt* cho từng cái, thay vì một câu trả lời chắc nịch — lúc 2 giờ sáng, một kết luận sai đắt hơn ba giả thuyết.

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Mức hạ tầng thật:** một VPS, Compose, hay k8s. Không nói thì mặc định nó viết cho k8s.
- **Có room server stateful không** — nó đổi hoàn toàn cách deploy (drain vs rolling restart).
- **CCU, số instance, cấu hình máy** (vCPU/RAM), và **nhà cung cấp**.
- **Cửa sổ bảo trì có được phép không**, hay bắt buộc zero-downtime.
- **Ai trực**: có người nhận cảnh báo lúc 3 giờ sáng hay không — nó quyết định ngưỡng cảnh báo và mức tự động hoá.
- **Ràng buộc:** "KHÔNG chạy lệnh nào lên production, chỉ đưa lệnh để tôi tự chạy".

**Mẫu prompt**

```
Triển khai server Go 1.22 cho game mobile: 1 VPS Ubuntu 4 vCPU/8GB, systemd,
nginx làm cân bằng tải, PostgreSQL 16 trên cùng máy, ~2.000 CCU giờ cao điểm.
Có room server stateful (trận 5 phút). KHÔNG có người trực đêm.

Cần, theo thứ tự:
1. systemd unit cho api và roomd: EnvironmentFile cho secret, Restart=always,
   giới hạn RAM, log vào journald có giới hạn dung lượng.
2. Script deploy zero-downtime: migration TRƯỚC, rút khỏi nginx upstream,
   chờ drain tối đa 120s, đổi binary, khởi động, chờ /readyz xanh rồi mới thêm lại.
   Rollback được về binary trước bằng một lệnh.
3. Năm alert rule Prometheus KÈM ngưỡng và lý do chọn ngưỡng đó, cho hoàn cảnh
   KHÔNG có người trực đêm (chỉ cảnh báo thứ thật sự cần dậy).
4. Runbook một trang cho 5 sự cố hay gặp: triệu chứng → lệnh kiểm tra → cách xử lý.

RÀNG BUỘC: KHÔNG chạy bất cứ lệnh nào lên máy chủ — chỉ đưa script để tôi tự chạy.
KHÔNG dùng k8s, Helm, hay công cụ cần cụm máy. Mỗi script phải chạy lại được nhiều lần.
```

**Bẫy thường gặp:** AI mặc định đề xuất k8s cho mọi quy mô vì phần lớn tài liệu vận hành công khai viết cho k8s — bạn nhận về một kiến trúc cần người vận hành toàn thời gian cho một game 2.000 CCU. Ba cái nữa: script deploy của nó thường **kill rồi mới start** (rớt toàn bộ trận đang chạy) vì mẫu phổ biến là service stateless; nó đặt ngưỡng cảnh báo theo con số tròn đẹp thay vì theo mức bình thường đo được của hệ thống bạn; và khi debug nó rất dễ khẳng định nguyên nhân sau khi chỉ nhìn một dòng log — hãy luôn hỏi "lệnh nào phân biệt được giả thuyết này với giả thuyết kia".

## 🎮 Unity

Client phải coi **server restart là chuyện bình thường**, không phải sự cố. Mỗi tuần bạn deploy vài lần; nếu mỗi lần deploy là một lần người chơi thấy "Lỗi kết nối", họ sẽ nghĩ game hỏng.

**Component & nơi đặt**

- `ConnectionGuard.cs` — một service sống suốt game (`DontDestroyOnLoad`), giữ trạng thái kết nối và lịch retry.
- Kiểm tra phiên bản tối thiểu **trước màn hình đăng nhập**: server trả `minClientVersion`, client thấp hơn thì chặn và mở store.
- Cờ bảo trì lấy từ remote config — xem [[liveops]].

**Code**

```csharp
using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

// Kết nối lại sau khi server deploy hoặc mạng rớt: backoff tăng dần + jitter, có trần.
public class ConnectionGuard : MonoBehaviour
{
    [SerializeField] string healthUrl = "https://api.example.com/readyz";
    [SerializeField] float baseDelay = 1f;
    [SerializeField] float maxDelay = 30f;

    public event Action<bool> OnOnlineChanged;
    bool online = true;

    public void ReportFailure()                       // gọi khi một request bị 5xx hoặc lỗi mạng
    {
        if (!online) return;
        online = false;
        OnOnlineChanged?.Invoke(false);               // UI hiện "đang kết nối lại…", KHÔNG phải popup lỗi
        StartCoroutine(Reconnect());
    }

    IEnumerator Reconnect()
    {
        float delay = baseDelay;
        while (!online)
        {
            // Jitter bắt buộc: không có nó thì hàng nghìn client cùng gõ cửa đúng một giây
            // sau khi server sống lại, và server chết lần hai.
            yield return new WaitForSecondsRealtime(delay + UnityEngine.Random.Range(0f, delay * 0.3f));

            using (var req = UnityWebRequest.Get(healthUrl))
            {
                req.timeout = 5;
                yield return req.SendWebRequest();
                if (req.result == UnityWebRequest.Result.Success && req.responseCode == 200)
                {
                    online = true;
                    OnOnlineChanged?.Invoke(true);    // đồng bộ lại state từ server, đừng tin RAM
                    yield break;
                }
            }
            delay = Mathf.Min(delay * 2f, maxDelay);
        }
    }
}
```

**Bẫy Unity cụ thể**

- **Retry không có jitter = tự DDoS.** Server vừa sống lại thì toàn bộ client cùng gọi trong một giây và nó chết lần nữa. Đây là kiểu sự cố tự gây ra phổ biến nhất sau deploy.
- **Popup "Lỗi kết nối" ngay lần thất bại đầu.** 10 giây gián đoạn khi deploy là bình thường; hiện trạng thái nhẹ ở góc màn hình, chỉ popup khi đã thử vài lần.
- **Tin state trong RAM sau khi kết nối lại.** Trong lúc mất kết nối, server có thể đã đổi mọi thứ (sự kiện kết thúc, phần thưởng phát). Kết nối lại thì **đồng bộ lại**, đừng gửi tiếp hành động dựa trên state cũ.
- **Không có cổng chặn phiên bản.** Bản cũ trên máy người chơi gọi API đã đổi và sinh ra lỗi không tái hiện được trên máy bạn. Trả `minClientVersion` từ server và chặn ngay ở màn hình đầu.
- **`Time.timeScale = 0` khi hiện popup mất kết nối** làm vòng retry đứng im nếu dùng `WaitForSeconds` — luôn dùng `WaitForSecondsRealtime`.
- **Mobile: app vào nền lâu** thì token hết hạn và WebSocket đứt. Coi `OnApplicationPause(false)` là một lần "kết nối lại": refresh token rồi đồng bộ, đừng giả định phiên còn sống.

**Kiểm tra nhanh**

- Restart server trong lúc đang chơi: client hiện "đang kết nối lại", tự vào lại trong dưới 30 giây, **không** mất dữ liệu và không cần bấm gì.
- Bật 20 bản build rồi restart server: nhìn log — request không dồn vào cùng một giây (jitter có tác dụng).
- Hạ `minClientVersion` giả trên staging: client cũ bị chặn ở màn hình đầu với nút mở store, không lọt vào gameplay rồi mới lỗi.
- Bật cờ bảo trì: mọi client hiện thông báo bảo trì kèm thời gian dự kiến, không phải lỗi 503 trần trụi.
