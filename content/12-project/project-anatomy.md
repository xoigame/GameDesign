---
id: project-anatomy
title: Mổ xẻ một dự án — mọi mảnh và chỗ của nó
summary: Cây thư mục thật của một dự án Unity + Go, tám mảnh ghép và ai sở hữu mảnh nào, ba đường sinh code tự động, và thứ tự dựng từ repo rỗng tới một vòng chơi thông suốt.
status: deep
read: 905
level: intermediate
order: 5
tags: [project, structure, repo, pipeline, overview]
related: [project, go-docker, go-protobuf, master-data]
---

[[project]] nói *thứ tự thời gian*. Node này nói *thứ tự không gian*: dự án gồm những mảnh nào, mảnh nào sinh ra mảnh nào, và file nằm ở đâu.

Đây là node để trả lời câu *"kể xem dự án của anh có những phần gì"* mà không bỏ sót — vì thứ hay bị bỏ sót không phải server hay client, mà là **ba đường sinh code tự động** ở giữa: protobuf, master data, và migration.

## Tám mảnh, và ai sở hữu

| # | Mảnh | Ai sở hữu | Sinh ra gì | Hỏng thì |
|---|---|---|---|---|
| 1 | **Client Unity** | Lập trình client | APK/IPA | Người chơi không mở được game |
| 2 | **Server Go** | Lập trình server | Binary tĩnh | Không ai chơi được |
| 3 | **Hợp đồng `.proto`** | **Cả hai cùng review** | `.go` + `.cs` sinh tự động | Hai phía hiểu khác nhau, sai lặng lẽ |
| 4 | **Master data** | Designer (Google Sheet) | Bản có version trong database | Đổi số phải build lại app |
| 5 | **Migration** | Lập trình server | Schema database theo thời gian | Deploy làm mất dữ liệu |
| 6 | **Master User** | Lập trình server | Bảng gốc của người chơi | Mất tài khoản, mất tiến trình |
| 7 | **Docker / môi trường** | Ai dựng cũng được | Postgres + Redis + server chạy bằng một lệnh | Mỗi máy một kiểu, "trên máy tôi chạy được" |
| 8 | **Tools** | Lập trình server | Validator, bot load test, build script | Dữ liệu sai lọt vào production |

Mảnh 3, 4, 5 là ba mảnh **ở giữa hai phía**, và chúng là chỗ dự án hay chảy máu nhất — vì không đội nào coi chúng là của mình.

## Cây thư mục

Monorepo là lựa chọn mặc định đúng cho đội dưới mười người: hợp đồng và code hai phía đổi cùng một commit, nên không bao giờ lệch phiên bản giữa hai repo.

```
game/
├── client/                     # dự án Unity
│   ├── Assets/
│   │   ├── Scripts/
│   │   │   ├── Net/            # ApiClient, WsClient — xem unity-network-client
│   │   │   ├── Gen/            # ← SINH TỰ ĐỘNG từ proto, không sửa tay
│   │   │   └── Game/
│   │   └── StreamingAssets/
│   └── ProjectSettings/
│
├── server/                     # module Go
│   ├── cmd/
│   │   ├── api/                # process stateless
│   │   ├── roomd/              # process giữ trận (bỏ nếu game async)
│   │   └── worker/             # cron, reset mùa, đối soát IAP
│   ├── internal/
│   │   ├── auth/               # Master User, token — xem project-identity
│   │   ├── econ/               # ví, sổ cái, idempotency
│   │   ├── master/             # nạp master data vào RAM
│   │   └── store/              # truy vấn database
│   ├── gen/gamepb/             # ← SINH TỰ ĐỘNG từ proto, không sửa tay
│   └── migrations/             # ← 0001_init.sql, 0002_add_wallet.sql …
│
├── proto/
│   └── game.proto              # HỢP ĐỒNG — nguồn chân lý của mọi message
│
├── tools/
│   ├── validate/               # kiểm master data, chạy trong CI
│   ├── masterpub/              # Google Sheet → database có version
│   └── loadbot/                # giả lập N client
│
├── deploy/
│   ├── compose.yml             # Postgres + Redis + migration + server
│   └── Dockerfile
│
└── docs/
    └── gdd.md                  # blueprint — xem nhánh blueprints
```

Hai thư mục `Gen/` và `gen/` **không commit** và **không sửa tay**. Sinh lại trong CI từ `proto/game.proto`. Có bản sinh trong repo là sớm muộn có người sửa nó rồi quên sửa hợp đồng.

## Ba đường sinh code — chỗ dự án hay chảy máu

<figure class="fig">
<svg viewBox="0 0 680 330" role="img" aria-label="Ba đường sinh tự động trong dự án: file proto sinh code Go và C-thăng, Google Sheet qua validator thành master data có version trong database, và thư mục migrations dựng schema database">
  <defs>
    <marker id="pan-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <text x="340" y="20" text-anchor="middle" class="fig-muted" font-size="11">Nguồn do người viết → công cụ → thứ máy dùng</text>
  <g class="fig-box-g">
    <rect x="14"  y="40"  width="150" height="54" rx="9" class="fig-box"/>
    <rect x="248" y="40"  width="164" height="54" rx="9" class="fig-box"/>
    <rect x="490" y="30"  width="176" height="32" rx="8" class="fig-box"/>
    <rect x="490" y="74"  width="176" height="32" rx="8" class="fig-box"/>
    <rect x="14"  y="136" width="150" height="54" rx="9" class="fig-box"/>
    <rect x="248" y="136" width="164" height="54" rx="9" class="fig-box"/>
    <rect x="490" y="136" width="176" height="54" rx="9" class="fig-box"/>
    <rect x="14"  y="232" width="150" height="54" rx="9" class="fig-box"/>
    <rect x="248" y="232" width="164" height="54" rx="9" class="fig-box"/>
    <rect x="490" y="232" width="176" height="54" rx="9" class="fig-box"/>
  </g>
  <text x="89"  y="62"  text-anchor="middle" class="fig-label" font-size="12">proto/game.proto</text>
  <text x="89"  y="80"  text-anchor="middle" class="fig-muted" font-size="10">hai phía cùng review</text>
  <text x="330" y="62"  text-anchor="middle" class="fig-label" font-size="12">protoc + buf breaking</text>
  <text x="330" y="80"  text-anchor="middle" class="fig-muted" font-size="10">chạy trong CI</text>
  <text x="578" y="50"  text-anchor="middle" class="fig-muted" font-size="11">server/gen/gamepb/*.go</text>
  <text x="578" y="94"  text-anchor="middle" class="fig-muted" font-size="11">client/Assets/Scripts/Gen/*.cs</text>
  <text x="89"  y="158" text-anchor="middle" class="fig-label" font-size="12">Google Sheet</text>
  <text x="89"  y="176" text-anchor="middle" class="fig-muted" font-size="10">designer sửa</text>
  <text x="330" y="158" text-anchor="middle" class="fig-label" font-size="12">tools/validate + masterpub</text>
  <text x="330" y="176" text-anchor="middle" class="fig-muted" font-size="10">sai một ô là dừng, không publish</text>
  <text x="578" y="158" text-anchor="middle" class="fig-label" font-size="12">master_* có version</text>
  <text x="578" y="176" text-anchor="middle" class="fig-muted" font-size="10">server nạp vào RAM</text>
  <text x="89"  y="254" text-anchor="middle" class="fig-label" font-size="12">server/migrations/</text>
  <text x="89"  y="272" text-anchor="middle" class="fig-muted" font-size="10">file .sql đánh số</text>
  <text x="330" y="254" text-anchor="middle" class="fig-label" font-size="12">migrate — bước riêng</text>
  <text x="330" y="272" text-anchor="middle" class="fig-muted" font-size="10">KHÔNG chạy lúc server khởi động</text>
  <text x="578" y="254" text-anchor="middle" class="fig-label" font-size="12">schema PostgreSQL</text>
  <text x="578" y="272" text-anchor="middle" class="fig-muted" font-size="10">tiến một chiều, có bản ghi</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#pan-a)" fill="none">
    <path d="M164 67 H244"/>
    <path d="M412 57 Q450 57 450 46 H486"/>
    <path d="M412 77 Q450 77 450 90 H486"/>
    <path d="M164 163 H244"/>
    <path d="M412 163 H486"/>
    <path d="M164 259 H244"/>
    <path d="M412 259 H486"/>
  </g>
</svg>
<figcaption>Ba đường này có chung một tính chất: nguồn do người viết, đích do máy sinh, và không ai được sửa đích bằng tay.</figcaption>
</figure>

Ba đường, ba node chi tiết: [[go-protobuf]], [[master-data]], [[project-migration]].

## Dựng từ repo rỗng: mười bước

Thứ tự này có chủ ý — mỗi bước đều **chạy được và kiểm được** trước khi sang bước sau.

| # | Bước | Xong thì kiểm bằng |
|---|---|---|
| 1 | `compose.yml`: Postgres + Redis, có `healthcheck` | `docker compose up` rồi `psql` kết nối được |
| 2 | Migration `0001_init.sql`: bảng `users`, `wallet`, `wallet_tx` | Chạy migration hai lần, lần hai không đổi gì |
| 3 | `cmd/api` trả `/healthz` và `/readyz` | `curl localhost:8080/healthz` ra 200 |
| 4 | Master User: đăng nhập khách bằng device id | Gọi hai lần cùng device id ra cùng `user_id` |
| 5 | `proto/game.proto` + sinh code hai phía trong CI | Sửa proto, build lại, cả hai phía có kiểu mới |
| 6 | Master data: sheet → validator → bảng có version | Sửa một ô trên sheet, publish, server nạp số mới |
| 7 | Một endpoint tiền, có `request_id` `UNIQUE` | Gửi hai lần cùng id: trừ đúng một lần |
| 8 | Client Unity: `ApiClient` gọi được bước 4 và 7 | Bấm nút trong Editor thấy số dư đổi |
| 9 | Một vòng chơi: vào trận → kết quả → thưởng vào ví | Người khác cầm máy chơi được một vòng |
| 10 | `tools/loadbot` ở 3× CCU dự kiến | p99 và số kết nối database trong ngưỡng |

Bước 9 chính là **vertical slice** ở [[project-milestones]]. Mọi thứ trước nó là hạ tầng; nó là lần đầu dự án trở thành một game.

Chú ý thứ tự: **migration đứng trước server**, và **Master User đứng trước mọi tính năng**. Không có hai thứ đó thì mọi thứ xây lên đều phải làm lại.

## Một ngày làm việc điển hình

```bash
docker compose up -d          # Postgres + Redis + migration đã chạy
make gen                      # sinh lại .go và .cs từ proto (nếu proto đổi)
make run-api                  # server nghe ở 8080
```

Rồi mở Unity, trỏ `ApiClient.baseUrl` vào `http://localhost:8080`.

Đổi hợp đồng thì `make gen` lại — và nếu `buf breaking` đỏ thì đó là **build đang cứu bạn**, không phải build phiền phức.

## Cái gì commit, cái gì không

| Commit | Không commit |
|---|---|
| `proto/*.proto` | `server/gen/`, `client/Assets/Scripts/Gen/` |
| `server/migrations/*.sql` | File dump database |
| `deploy/compose.yml`, `Dockerfile` | `.env` có secret thật |
| `tools/` (mã nguồn) | Binary tool đã build |
| Bản xuất master data để tra cứu | Thông tin đăng nhập Google Sheet |

Luật một câu: **commit nguồn, không commit đích.** Thứ nào sinh ra được thì sinh lại.

## Bẫy thường gặp

- **Commit code sinh ra**, rồi có người sửa nó và quên sửa `.proto`. Hợp đồng hết là nguồn chân lý.
- **Hai repo riêng cho client và server.** Hợp đồng đổi thành hai pull request ở hai nơi, và chúng sẽ merge lệch nhau.
- **Không ai sở hữu ba mảnh ở giữa.** Protobuf, master data và migration rơi vào vùng xám giữa hai đội cho tới khi có sự cố.
- **Auto-migrate lúc server khởi động.** Scale lên N bản là N lần migration chạy cùng lúc.
- **Bỏ qua tools tới khi cần.** Validator viết muộn nghĩa là dữ liệu sai đã nằm trong database rồi.
- **Dựng client trước server.** Client sẽ được viết quanh dữ liệu giả, và mọi trạng thái chờ với xử lý lỗi phải thêm lại sau.

## 🤖 Prompt cho AI

**Dùng AI thế nào khi dựng bộ khung dự án**

Đây là việc AI làm tốt nhất trong cả nhánh: sinh **bộ khung có cấu trúc rõ ràng**. Nhưng phải ép nó theo cây thư mục và thứ tự của bạn, nếu không mỗi lần hỏi nó lại đề xuất một bố cục khác.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Sinh khung | Ngày đầu | "Sinh cây thư mục và Makefile cho monorepo Unity + Go theo mô tả này" |
| Soi mảnh thiếu | Sau khi có khung | "Đối chiếu dự án này với danh sách tám mảnh, cái nào tôi chưa có?" |
| Viết bước dựng | Khi nhận người mới | "Viết README dựng từ repo rỗng tới chạy được, mỗi bước có lệnh kiểm chứng" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Monorepo hay hai repo** — không nói thì nó chọn ngẫu nhiên và bố cục khác hẳn.
- **Có room server không** — quyết định có `cmd/roomd` hay không.
- **Truyền JSON hay protobuf**, và có sinh code cho client không.
- **Ai chạy migration**: CI, bước thủ công, hay compose.

**Mẫu prompt**

```
Monorepo: client Unity 2022 + server Go. Ba process: api, worker (không có roomd — game async).
Postgres + Redis. Hợp đồng bằng .proto, sinh code cho cả hai phía.
Master data từ Google Sheet. Migration là bước riêng, KHÔNG chạy lúc server khởi động.

Việc 1: sinh cây thư mục đầy đủ, ghi rõ thư mục nào là code sinh tự động và không commit.
Việc 2: viết Makefile với các target: up, gen, migrate, run-api, validate, loadtest.
Việc 3: viết README "từ repo rỗng tới một vòng chơi", mỗi bước kèm LỆNH KIỂM CHỨNG
để biết bước đó đã xong.

Ràng buộc:
- KHÔNG auto-migrate lúc server khởi động.
- KHÔNG commit thư mục code sinh ra — ghi vào .gitignore.
- KHÔNG đề xuất microservice hay k8s.
- Mỗi bước trong README phải kiểm được trong dưới 2 phút.
```

**Bẫy thường gặp:** AI sinh cây thư mục theo kiểu web service chuẩn — `pkg/`, `api/`, `handlers/` — và bỏ quên ba mảnh đặc thù game: master data, migration, và thư mục code sinh cho client. Bẫy thứ hai: nó đặt lệnh migration vào hàm `main()` của server vì như thế "tiện hơn". Bẫy thứ ba: nó đề xuất commit code sinh ra để "khỏi cần cài protoc".

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Dự án của anh gồm những phần nào?**
  → Tám mảnh: client Unity, server Go, hợp đồng `.proto`, master data, migration, Master User, môi trường Docker, và tools. Phần hay bị bỏ sót khi kể không phải client hay server mà là **ba mảnh ở giữa** — protobuf, master data, migration — vì chúng không thuộc hẳn về đội nào.
- `Junior` **Vì sao không commit code sinh ra từ `.proto`?**
  → Vì có bản sinh trong repo là sớm muộn có người sửa nó rồi quên sửa hợp đồng, và từ đó hợp đồng không còn là nguồn chân lý. Sinh lại trong CI thì lệch schema thành build đỏ. Luật chung là commit nguồn, không commit đích.
- `Mid` **Monorepo hay hai repo cho client và server?**
  → Monorepo cho đội dưới mười người, vì hợp đồng và code hai phía đổi **cùng một commit** nên không bao giờ lệch phiên bản. Hai repo nghĩa là mỗi thay đổi hợp đồng thành hai pull request ở hai nơi, và chúng sẽ merge lệch nhau — lỗi đó âm thầm và tốn nhiều giờ để lần ra.
- `Mid` **Dựng dự án từ số 0 thì làm theo thứ tự nào?**
  → Hạ tầng trước, tính năng sau, và mỗi bước phải kiểm được: compose có Postgres và Redis; migration; server trả `/healthz`; **Master User**; hợp đồng và sinh code; master data; một endpoint tiền có idempotency; client gọi được; một vòng chơi đầy đủ; rồi load test. Master User đứng trước mọi tính năng vì mọi thứ đều treo vào `user_id`.
- `Senior` **Ba mảnh ở giữa là gì và vì sao chúng nguy hiểm?**
  → Protobuf, master data, migration. Nguy hiểm vì không đội nào coi chúng là của mình: client nghĩ đó là việc server, server nghĩ đó là việc client hoặc designer. Kết quả là chúng không có người review, không có test, và hỏng theo kiểu **im lặng** — không phải crash, mà là hai phía hiểu khác nhau về cùng một field.
- `Senior` **Vì sao dựng server trước client?**
  → Vì client dựng trước sẽ được viết quanh dữ liệu giả: không trạng thái chờ, không xử lý lỗi, không nghĩ tới độ trễ — và toàn bộ phần đó phải viết lại khi gặp server thật. Nếu buộc phải làm song song thì client cắm vào **mock sinh từ hợp đồng**, có độ trễ giả 150ms, chứ không phải dữ liệu cứng trong code.

**Khung trả lời 60 giây** — "Kể tổng quan dự án của anh"

> Monorepo, tám mảnh. Hai mảnh ai cũng nghĩ tới là **client Unity** và **server Go** — server tách thành `api` stateless và `worker`, không có room server vì game async.
>
> Ba mảnh ở giữa mới là phần quyết định: **`proto/game.proto`** là hợp đồng, hai phía cùng review, CI sinh ra `.go` và `.cs` và không ai commit bản sinh. **Master data** đi từ Google Sheet qua validator thành bảng có version, nên designer đổi số không cần build lại app. **Migration** là các file SQL đánh số, chạy như một bước riêng chứ không phải lúc server khởi động.
>
> Ba mảnh còn lại là **Master User** — bảng gốc mọi thứ treo vào, **Docker compose** để cả đội chạy được bằng một lệnh, và **tools** gồm validator chạy trong CI với bot load test.

**Họ sẽ đào tiếp**

- *"Thư mục nào không commit?"* → Hai thư mục code sinh từ proto, file dump database, `.env` có secret thật, và binary tool đã build. Commit nguồn, không commit đích — thứ nào sinh lại được thì sinh lại.
- *"Ai sở hữu file `.proto`?"* → Cả hai phía, và nó cần review từ cả hai trước khi merge. Đây là nơi duy nhất hai đội gặp nhau về mặt kỹ thuật, nên nó xứng đáng có quy trình riêng thay vì trôi qua như một commit bình thường.
- *"Vì sao migration đứng trước server trong thứ tự dựng?"* → Vì server không chạy được nếu bảng chưa tồn tại, và quan trọng hơn: nếu bạn để migration tới sau thì sẽ có người tạo bảng bằng tay trên máy mình, và schema của mỗi máy một khác.
- *"Tools có đáng viết sớm không?"* → Validator thì có. Viết muộn nghĩa là dữ liệu sai đã nằm trong database rồi, và lúc đó bạn không chỉ phải viết validator mà còn phải dọn hậu quả.
- *"Nếu game có realtime thì cây thư mục đổi gì?"* → Thêm `cmd/roomd` và kéo theo cả một chuỗi: WebSocket, protobuf cho gói tin trận, drain khi deploy, và test với mạng giả. Đó là lý do quyết định có realtime hay không phải chốt từ tuần đầu.

**Cờ đỏ**

- Kể dự án chỉ có "client và server", không nhắc gì tới hợp đồng, master data hay migration.
- Commit code sinh ra rồi sửa tay.
- Tạo bảng database bằng tay thay vì bằng file migration.
- Hai repo riêng cho một đội bốn người.
- Không biết thư mục nào trong dự án là code sinh tự động.

**Số / ví dụ nên thuộc**

- Tám mảnh: client · server · proto · master data · migration · Master User · Docker · tools.
- Ba mảnh ở giữa hay chảy máu: **proto, master data, migration**.
- Thứ tự dựng: hạ tầng → Master User → hợp đồng → master data → tiền → client → vòng chơi → load test.
- Load test ở **3×** CCU dự kiến.

**Kể trong dự án**

- *"Anh dựng repo đó à?"* → Nếu không, kể **cái bạn sửa trong cấu trúc**: chuyển từ hai repo về monorepo, bỏ code sinh khỏi git, hay tách migration khỏi lúc khởi động. Mỗi cái đều có triệu chứng trước và kết quả sau.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: một người sửa file code sinh ra để vá nhanh, lần `make gen` kế tiếp xoá mất, và bug quay lại sau hai tuần không ai hiểu vì sao. Kể cách bạn xử lý bằng cách bỏ thư mục đó khỏi git và thêm bước sinh trong CI.
- *"Người mới vào mất bao lâu để chạy được?"* → Đây là con số đáng nhớ và rất dễ kiểm chứng. Nếu bạn rút nó từ một ngày xuống nửa tiếng bằng compose và một README có lệnh kiểm chứng từng bước, đó là đóng góp cụ thể mà ai cũng hiểu giá trị.
