---
title: Docker cho server game
icon: 🐳
summary: Một lệnh là cả team có Postgres, Redis, migration và server giống hệt nhau — compose cho môi trường dev, layer cache, và những chỗ Docker cắn trong dự án game.
status: deep
read: 592
level: intermediate
order: 45
tags: [backend, go, docker, devops, tooling]
related: [go-deploy-ops, game-database, go-gamedev-tools, game-server-go]
---

Với Go, Docker giải quyết **hai việc rất khác nhau**, và giá trị của chúng lệch nhau nhiều:

| Việc | Giá trị với dự án Go |
|---|---|
| **Môi trường dev giống nhau cho cả team** | **Cao.** Một lệnh là có Postgres 16, Redis 7, migration đã chạy, server đang nghe — không ai phải cài gì, không ai lệch phiên bản |
| **Đơn vị deploy lặp lại được** | Vừa phải. Binary Go vốn đã tĩnh và chạy được trên mọi máy Linux; container thêm giá trị khi bạn đã có sẵn hạ tầng chạy container |

Nói cách khác: **lý do chính để dùng Docker trong dự án game Go là `compose.yml` cho máy dev**, không phải image production. Người làm client Unity chạy đúng một lệnh là có backend đầy đủ để thử — đó mới là thứ tiết kiệm thời gian mỗi ngày.

## compose.yml cho môi trường dev

```yaml
# compose.yml — `docker compose up` là có đủ bộ. Người làm client không cần biết Go là gì.
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: game
    ports: ["5432:5432"]          # mở ra máy thật để Unity Editor và công cụ SQL nối được
    volumes:
      - dbdata:/var/lib/postgresql/data
    healthcheck:                  # depends_on chỉ chờ container CHẠY, không chờ database SẴN SÀNG
      test: ["CMD-SHELL", "pg_isready -U postgres -d game"]
      interval: 2s
      timeout: 3s
      retries: 15

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 2s
      retries: 15

  migrate:                        # chạy MỘT lần rồi thoát — migration không bao giờ nằm trong server
    build:
      context: .
      target: build               # dùng lại tầng build của Dockerfile, đã có sẵn Go
    command: ["go", "run", "./cmd/migrate", "up"]
    environment:
      DATABASE_URL: postgres://postgres:dev@db:5432/game?sslmode=disable
    depends_on:
      db: { condition: service_healthy }
    restart: "no"

  api:
    build: .
    ports: ["8080:8080"]
    environment:
      DATABASE_URL: postgres://postgres:dev@db:5432/game?sslmode=disable
      REDIS_ADDR: redis:6379      # TÊN SERVICE, không phải localhost — bên trong mạng của compose
      LOG_LEVEL: debug
    depends_on:
      db:      { condition: service_healthy }
      redis:   { condition: service_healthy }
      migrate: { condition: service_completed_successfully }

volumes:
  dbdata:
```

Ba chi tiết làm nên khác biệt giữa compose dùng được và compose "chạy lần đầu thì lỗi":

- **`depends_on` trần chỉ chờ container khởi động**, không chờ dịch vụ sẵn sàng. Không có `healthcheck` + `condition: service_healthy` thì server khởi động trước Postgres và chết ngay lần đầu — rồi ai cũng học thói quen "chạy lại lần nữa là được".
- **Migration là một service riêng chạy một lần** (`service_completed_successfully`). Đây là phiên bản compose của đúng luật ở [[game-database]]: không auto-migrate lúc server khởi động.
- **Tên host bên trong khác bên ngoài.** Server trong mạng compose gọi `db:5432`; Unity Editor trên máy bạn gọi `localhost:5432`. Nhầm hai cái này là câu hỏi phổ biến nhất của người mới dùng compose.

## Dockerfile và layer cache

<figure class="fig">
<svg viewBox="0 0 660 240" role="img" aria-label="Thứ tự tầng trong Dockerfile quyết định cái gì được dùng lại từ cache khi đổi code so với khi đổi go.mod">
  <g class="fig-box-g">
    <rect x="16" y="44"  width="290" height="30" rx="7" class="fig-box"/>
    <rect x="16" y="82"  width="290" height="30" rx="7" class="fig-box"/>
    <rect x="16" y="120" width="290" height="30" rx="7" class="fig-box"/>
    <rect x="16" y="158" width="290" height="30" rx="7" class="fig-box"/>
    <rect x="16" y="196" width="290" height="30" rx="7" class="fig-box"/>
  </g>
  <text x="30" y="64"  class="fig-label" font-size="12">FROM golang:1.22 AS build</text>
  <text x="30" y="102" class="fig-label" font-size="12">COPY go.mod go.sum ./</text>
  <text x="30" y="140" class="fig-label" font-size="12">RUN go mod download</text>
  <text x="30" y="178" class="fig-label" font-size="12">COPY . .</text>
  <text x="30" y="216" class="fig-label" font-size="12">RUN go build -o /out/api</text>
  <text x="400" y="32" text-anchor="middle" class="fig-label" font-size="12">Đổi một dòng code</text>
  <text x="566" y="32" text-anchor="middle" class="fig-label" font-size="12">Đổi go.mod</text>
  <g font-size="11" text-anchor="middle">
    <text x="400" y="64"  fill="#51cf9b">dùng lại cache</text>
    <text x="400" y="102" fill="#51cf9b">dùng lại cache</text>
    <text x="400" y="140" fill="#51cf9b">dùng lại cache</text>
    <text x="400" y="178" fill="#ffd43b">chạy lại</text>
    <text x="400" y="216" fill="#ffd43b">chạy lại</text>
    <text x="566" y="64"  fill="#51cf9b">dùng lại cache</text>
    <text x="566" y="102" fill="#ffd43b">chạy lại</text>
    <text x="566" y="140" fill="#ffd43b">chạy lại — tải lại toàn bộ</text>
    <text x="566" y="178" fill="#ffd43b">chạy lại</text>
    <text x="566" y="216" fill="#ffd43b">chạy lại</text>
  </g>
</svg>
<figcaption>Vì sao phải <code>COPY go.mod</code> trước <code>COPY . .</code>: đổi code không làm tải lại phụ thuộc. Đảo hai dòng này là mỗi lần sửa một chữ lại tải lại cả cây thư viện.</figcaption>
</figure>

Dockerfile nhiều tầng đã có ở [[go-deploy-ops]]; phần cần nhớ thêm là **thứ tự lệnh quyết định tốc độ build**. Và `.dockerignore` quan trọng không kém — trong một repo game, thiếu nó nghĩa là mỗi lần build gửi cả `Library/` của Unity (hàng GB) vào build context:

```gitignore
# .dockerignore — mọi thứ Docker KHÔNG cần để build server
.git
unity/            # cả project Unity: Library/, Temp/, Logs/ nặng hàng GB
*.md
bin/
tmp/
.env
```

Chọn image nền theo đúng nhu cầu:

| Image nền | Kích thước | Dùng khi |
|---|---|---|
| `gcr.io/distroless/static` | ~2 MB + binary | Mặc định. `CGO_ENABLED=0`, không shell, chạy `nonroot` |
| `alpine` | ~8 MB + binary | Cần shell hoặc vài công cụ nhỏ để soi trong container |
| `debian:bookworm-slim` | ~30 MB + binary | Buộc phải bật CGO (thư viện C nào đó) |

## Ba thứ Docker hay cắn trong dự án game

**Build trên Mac M-series, chạy trên VPS Intel.** Image build mặc định theo kiến trúc máy bạn (`arm64`), VPS là `amd64`, và lỗi chỉ hiện ra lúc chạy dưới dạng `exec format error`. Luôn chỉ định rõ:

```bash
docker buildx build --platform linux/amd64 -t myreg/game-api:$(git rev-parse --short HEAD) --push .
```

**Không có shell trong distroless để soi.** Đó là điểm mạnh về bảo mật nhưng khó chịu lúc gỡ lỗi. Cách làm đúng: đừng cài shell vào image production — mở `pprof` và `/healthz` ở cổng nội bộ ([[go-deploy-ops]]), và khi thật sự cần thì build lại bằng tag `:debug` của distroless hoặc chạy tạm image `alpine` gắn cùng volume.

**Dữ liệu dev biến mất.** `docker compose down` giữ volume; `docker compose down -v` **xoá sạch** — kể cả database dev có dữ liệu test bạn dựng cả buổi. Hãy có script `make seed` dựng lại dữ liệu test trong vài giây, để mất volume chỉ là phiền chứ không phải mất buổi.

## Bẫy thường gặp

| Bẫy | Hậu quả |
|---|---|
| Thiếu `.dockerignore` | Build context vài GB vì `Library/` của Unity; build chậm gấp hàng chục lần |
| `COPY . .` trước `COPY go.mod` | Mỗi lần sửa một dòng code là tải lại toàn bộ phụ thuộc |
| `depends_on` không kèm `condition` | Server khởi động trước database, chết ở lần chạy đầu mỗi ngày |
| Dùng tag `latest` | Không biết production đang chạy gì, không rollback được — gắn tag theo commit |
| Chạy container bằng `root` | Một lỗ hổng trong app thành quyền root trong container |
| Build trên arm64, deploy amd64 | `exec format error` lúc chạy, không phải lúc build |
| Không giới hạn log của container | Ổ đĩa đầy sau vài tuần — đặt `max-size` cho log driver |
| Không giới hạn RAM container | Một rò rỉ kéo sập cả máy thay vì chỉ một service |
| `docker compose down -v` theo thói quen | Xoá sạch database dev, kể cả dữ liệu test dựng cả buổi |
| Bind mount source vào container production | Image không còn là thứ bạn đã test; chỉ dùng bind mount ở dev |
| Đổi giờ hệ thống trong container | Giữ UTC ở mọi nơi; quy đổi múi giờ ở tầng hiển thị |

## 🤖 Prompt cho AI

**Dùng AI thế nào cho Docker**

Docker là việc khuôn mẫu, AI viết nhanh và thường đúng. Rủi ro không nằm ở cú pháp mà ở chỗ **nó không biết dự án của bạn có gì**: nó sẽ viết `.dockerignore` chuẩn cho một repo Go thuần, trong khi repo của bạn có một project Unity nặng vài GB nằm cạnh.

| Giao được | Kiểm lại bằng tay |
|---|---|
| `Dockerfile` nhiều tầng, `.dockerignore`, `compose.yml` dev | Danh sách thư mục cần loại khỏi build context (Unity, asset thô) |
| Healthcheck, thứ tự `depends_on`, service migration một lần | Cổng nào được mở ra ngoài — dev khác production |
| Lệnh buildx multi-arch, script build/push có gắn tag theo commit | Biến môi trường nào là secret (không bao giờ đưa vào image) |
| Makefile gói các lệnh dài lại cho cả team dùng | Volume nào chứa dữ liệu không được phép mất |

Cách kiểm nhanh một `compose.yml` do AI viết, làm đúng ba bước: `docker compose down -v` → `docker compose up` từ máy trắng → server phải **lành lặn ở lần chạy đầu tiên**, không cần chạy lại lần hai. Đa số compose sinh ra tự động trượt ở đúng bước này vì thiếu healthcheck.

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Repo có gì** — có project Unity trong cùng repo không, thư mục nào nặng.
- **Các service cần chạy** và phiên bản: Postgres 16, Redis 7, server, worker, migration.
- **Compose này cho dev hay cho production** — hai file khác nhau, đừng gộp.
- **Cổng nào mở ra máy thật** (Unity Editor cần nối vào Postgres không).
- **Kiến trúc máy đích** (amd64/arm64) và nơi đẩy image lên.
- **Công cụ migration** đang dùng (goose, golang-migrate, hay lệnh tự viết).

**Mẫu prompt**

```
Viết môi trường Docker cho dev của backend game Go 1.22.
Repo có cả project Unity ở thư mục unity/ (Library/ nặng ~4 GB — PHẢI loại khỏi build context).

Cần chạy: PostgreSQL 16, Redis 7, migration (goose, chạy MỘT lần), api (cổng 8080).
Người làm client dùng Unity Editor trên Windows, cần nối thẳng vào Postgres từ máy thật.
Máy dev có cả Mac M2 và Windows; VPS đích là linux/amd64.

Yêu cầu:
1. Dockerfile nhiều tầng, tầng chạy dùng distroless static, user nonroot,
   thứ tự lệnh tối ưu cache (đổi code KHÔNG tải lại phụ thuộc).
2. .dockerignore đúng cho repo có Unity.
3. compose.yml: healthcheck cho db và redis, api chờ migration chạy xong mới khởi động.
   `docker compose up` từ máy trắng phải chạy đúng NGAY LẦN ĐẦU.
4. Makefile: up, down, logs, seed (đổ dữ liệu test), build-amd64 (buildx, tag theo commit).

KHÔNG dùng tag latest. KHÔNG bind mount source code vào container.
KHÔNG để secret trong image hay trong compose.yml.
```

**Bẫy thường gặp:** AI viết `depends_on: [db]` trần rồi khẳng định server sẽ đợi database — nó chỉ đợi container *khởi động*, nên lần chạy đầu tiên luôn hỏng và cả đội học thói quen "cứ `up` lại lần nữa". Ba cái nữa: `.dockerignore` của nó bỏ sót thư mục Unity (build context nhảy lên vài GB mà không ai hiểu vì sao build lâu); nó đặt `COPY . .` trước `go mod download` làm mất sạch layer cache; và nó rất hay nhét `DATABASE_URL` có mật khẩu thật vào thẳng `compose.yml` rồi bảo bạn commit file đó.

## 🎮 Unity

Với người làm client, cả nhánh backend này nên thu về **một lệnh**. Đó là mục tiêu thực tế của Docker trong dự án game: người viết Unity không cần cài Go, không cần cài Postgres, không cần biết migration là gì.

**Thiết lập cho người làm client**

- Cài Docker Desktop, `git clone`, chạy `docker compose up` (hoặc `make up`). Xong.
- Client trỏ `baseUrl` về `http://localhost:8080` — xem lớp `GameApi` ở [[game-server-go]].
- `make seed` đổ dữ liệu test: vài tài khoản có sẵn vàng, master data bản mới nhất ([[master-data]]).
- Ghi đúng bốn lệnh đó vào `README.md` của repo. Tài liệu dài hơn thì sẽ không ai đọc.

**Bẫy Unity cụ thể**

- **`localhost` trong Unity Editor không phải `localhost` trong container.** Client gọi `localhost:8080` là đúng (cổng đã publish ra máy thật); còn server trong compose gọi Redis bằng `redis:6379`, không phải `localhost`.
- **Bản build trên thiết bị thật không thấy `localhost` của máy tính.** Test trên điện thoại thì trỏ về IP LAN của máy (`http://192.168.1.x:8080`) và nhớ mở tường lửa — đây là chỗ mất thời gian phổ biến nhất khi lần đầu test trên máy thật.
- **Android chặn HTTP thường** từ Android 9: bản build gọi `http://` sẽ thất bại im lặng. Bật `usesCleartextTraffic` cho bản dev, hoặc dựng TLS cục bộ.
- **Máy dev Apple Silicon** chạy image amd64 qua giả lập chậm hơn nhiều — dùng image nền hỗ trợ đa kiến trúc cho dev, và chỉ ép `linux/amd64` khi build để deploy.
- **Quên rằng dữ liệu dev là dữ liệu giả.** Ai đó thử tính năng xoá tài khoản trên bản compose rồi tưởng đã test xong phần production — hai môi trường khác nhau, và dữ liệu thật không bao giờ nằm trên máy dev.

**Kiểm tra nhanh**

- Trên một máy chưa có gì: `git clone` → `docker compose up` → client Unity đăng nhập được, trong dưới 5 phút và không sửa file nào.
- `docker compose down && docker compose up`: chạy đúng **ngay lần đầu**, không cần chạy lại lần hai (healthcheck có tác dụng).
- `docker compose logs -f api` khi bấm nút trong game: thấy đúng request vừa gửi.
- Đổi một dòng code Go rồi `docker compose build api`: build xong dưới 30 giây (layer cache còn nguyên). Lâu hơn nhiều nghĩa là thứ tự tầng hoặc `.dockerignore` sai.
