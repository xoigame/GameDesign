---
title: Mổ xẻ một server Go đã phát hành
icon: 🔬
summary: Một backend Go đang vận hành thật — một binary nhiều mode, config nhúng theo môi trường và region, HTTP + protobuf với ba tầng kiểm phiên bản, và codegen chạy từ schema database ra tận DLL cho client Unity.
status: deep
read: 593
level: advanced
order: 50
tags: [backend, go, protobuf, architecture, case-study]
related: [game-server-go, go-protobuf, master-data, go-deploy-ops]
---

Các node khác trong nhánh này nói **nên làm thế nào**. Node này mô tả **một hệ thống đã làm rồi** và đang chạy: backend Go của một game mobile phát hành nhiều năm, nhiều region, client Unity. Đây không phải "cách đúng duy nhất" — nó là một bộ quyết định đã sống sót qua vận hành thật, và mỗi quyết định đều có cái giá đi kèm.

Đọc nó như đọc một bản đồ: chỗ nào đáng chép, chỗ nào chỉ hợp với hoàn cảnh của họ. Mục cuối nói thẳng về ranh giới đó.

## Một binary, nhiều mode

Toàn bộ hệ thống là **một file binary**, chọn vai trò bằng cờ dòng lệnh (`-m`) và cổng (`-p`):

| Mode | Vai trò | Vòng đời |
|---|---|---|
| `api` | API game cho client | Stateless, restart tự do |
| `tool` | Trang quản trị nội bộ (template server-side) | Stateless, ít truy cập |
| `mnt` | Server báo bảo trì | Bật khi cần chặn cửa |
| `realtime` | WebSocket: chat, kênh, quan hệ bạn bè | **Stateful** — phải drain |
| `multiplay` | Ghép trận và phiên chơi chung | **Stateful** |
| `notice` / `batch` | Thông báo, job định kỳ | Chạy rồi thoát |

Lợi ích thật: **một artifact duy nhất** đi qua CI, không có chuyện "api build từ commit A còn realtime từ commit B". Model, service, protobuf dùng chung một bản — thứ hay lệch nhất giữa các service thì ở đây không thể lệch.

Cái giá cũng thật: mọi mode buộc phải deploy cùng nhịp. Sửa một dòng trong tool cũng sinh ra binary mới cho realtime, và realtime là thứ đắt nhất để restart. Chấp nhận được vì họ deploy theo đợt, không phải theo giờ.

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Một binary chạy sáu mode khác nhau, dùng chung MySQL nhiều database, Redis và memcached">
  <defs>
    <marker id="gpa-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="8"   y="96" width="118" height="58" rx="9" class="fig-box"/>
    <rect x="196" y="14" width="150" height="42" rx="8" class="fig-box"/>
    <rect x="196" y="66" width="150" height="42" rx="8" class="fig-box"/>
    <rect x="196" y="118" width="150" height="42" rx="8" class="fig-box"/>
    <rect x="196" y="170" width="150" height="42" rx="8" class="fig-box"/>
    <rect x="430" y="14" width="220" height="94" rx="9" class="fig-box"/>
    <rect x="430" y="126" width="220" height="42" rx="9" class="fig-box"/>
    <rect x="430" y="182" width="220" height="42" rx="9" class="fig-box"/>
  </g>
  <text x="67"  y="120" text-anchor="middle" class="fig-label" font-size="13">một binary</text>
  <text x="67"  y="139" text-anchor="middle" class="fig-muted" font-size="10">chọn vai bằng -m</text>
  <text x="271" y="33"  text-anchor="middle" class="fig-label" font-size="12">api · cổng 1323</text>
  <text x="271" y="48"  text-anchor="middle" class="fig-muted" font-size="10">stateless, N bản</text>
  <text x="271" y="85"  text-anchor="middle" class="fig-label" font-size="12">tool · 1324</text>
  <text x="271" y="100" text-anchor="middle" class="fig-muted" font-size="10">trang quản trị</text>
  <text x="271" y="137" text-anchor="middle" class="fig-label" font-size="12">realtime · 10000</text>
  <text x="271" y="152" text-anchor="middle" class="fig-muted" font-size="10">WebSocket, stateful</text>
  <text x="271" y="189" text-anchor="middle" class="fig-label" font-size="12">multiplay · batch</text>
  <text x="271" y="204" text-anchor="middle" class="fig-muted" font-size="10">ghép trận, job</text>
  <text x="540" y="34"  text-anchor="middle" class="fig-label" font-size="12">MySQL — tách theo vòng đời</text>
  <text x="540" y="54"  text-anchor="middle" class="fig-muted" font-size="10">master · user · misc · realtime · billing</text>
  <text x="540" y="74"  text-anchor="middle" class="fig-muted" font-size="10">mỗi cái có host master và host slave riêng</text>
  <text x="540" y="94"  text-anchor="middle" class="fig-muted" font-size="10">pool: idle 10 · open 1000–2000 · life 20000s</text>
  <text x="540" y="145" text-anchor="middle" class="fig-label" font-size="12">Redis</text>
  <text x="540" y="160" text-anchor="middle" class="fig-muted" font-size="10">kênh realtime, xếp hạng, khoá</text>
  <text x="540" y="201" text-anchor="middle" class="fig-label" font-size="12">memcached</text>
  <text x="540" y="216" text-anchor="middle" class="fig-muted" font-size="10">cache master dùng chung, cờ bảo trì</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#gpa-a)" fill="none">
    <path d="M126 110 Q170 110 170 35 H192"/>
    <path d="M126 118 Q170 118 170 87 H192"/>
    <path d="M126 132 Q170 132 170 139 H192"/>
    <path d="M126 140 Q170 140 170 191 H192"/>
    <path d="M346 35 H426"/>
    <path d="M346 139 Q390 139 390 147 H426"/>
    <path d="M346 191 Q390 191 390 203 H426"/>
  </g>
</svg>
<figcaption>Cùng một binary, khác vai trò. Thứ chia hệ thống không phải là "microservice" mà là <em>vòng đời của trạng thái</em>: cái nào stateless thì restart tự do, cái nào giữ phiên chơi thì phải drain.</figcaption>
</figure>

## Cấu hình: nhúng thẳng vào binary

Đây là quyết định gây bất ngờ nhất cho người mới vào dự án, nên nói rõ:

- Config là **YAML nhiều khối theo môi trường** (`production`, `develop`, `feature`, `review`, `local`…), dùng anchor của YAML để khối sau kế thừa khối trước.
- Mỗi **region** có một cây config riêng (`conf/<region>/config.yaml`), và region còn quyết định **múi giờ và locale** — `time.Local` được đặt ngay trong `init()` của `main`, trước khi bất cứ thứ gì chạy.
- Toàn bộ thư mục config **được `go:embed` vào binary**, rồi đọc qua viper.

Hệ quả trực tiếp, và là bẫy số một của người mới: **sửa file YAML rồi restart không có tác dụng gì.** Phải build lại. Nghe ngược đời nhưng đổi lại ba thứ:

1. Binary chạy được ở mọi môi trường mà không cần mang theo file — copy một file là xong.
2. Không có chuyện "config trên máy chủ khác config trong repo" — thứ gây sự cố kinh điển ở mọi hệ thống dùng file ngoài.
3. Rollback binary là rollback luôn config, không lệch pha.

Cái giá: đổi một tham số nhỏ cũng phải qua nguyên vòng build–deploy. Họ bù lại bằng cách đẩy những thứ *cần đổi nóng* (cờ bảo trì, phiên bản master) sang **memcached/redis** thay vì để trong config.

Biến môi trường chỉ còn ba cái, đúng như [[go-deploy-ops]] khuyến nghị — nhưng ở đây chúng chọn *khối config*, không phải chứa config:

| Biến | Chọn cái gì |
|---|---|
| `APPLICATION_ENV` | Khối nào trong YAML: `local` / `develop` / `docker` / `production`… |
| `APPLICATION_REGION` | Cây config nào, và múi giờ + locale |
| `APPLICATION_HOME` | Đường dẫn gốc — chỉ mode `tool` cần (nó đọc template từ đĩa) |

## Database tách theo vòng đời, không theo module

Không phải "mỗi service một database" mà **mỗi loại vòng đời một database**, đúng tinh thần [[master-data]]:

| Database | Chứa gì | Đặc tính ghi |
|---|---|---|
| `*_master` | Bảng cân bằng do designer nhập | Chỉ đọc lúc chạy; ghi theo đợt phát hành |
| `*_user` | Tài khoản, đồ, tiến trình | Ghi liên tục, cần transaction |
| `*_misc` | Nhật ký, dữ liệu phụ, hàng đợi | Ghi nhiều, mất một ít không chết ai |
| `*_realtime` | Chat, kênh, nhóm | Ghi vừa, đọc nhiều |
| `billing` | Thanh toán, do SDK dùng chung của công ty quản lý | Ghi ít, **không được sai** |

Mỗi database khai **host master và host slave riêng** trong config, cùng bộ tham số pool. Con số thật đang chạy: `max_idle 10`, `max_open 1000–2000` tuỳ database, `max_lifetime 20000s`.

Đáng chú ý: con số `max_open` này **cao hơn nhiều** so với khuyến nghị 10–25 ở [[game-database]]. Lý do là hoàn cảnh khác: họ chạy MySQL sau một lớp cân bằng tải của nhà cung cấp đám mây với hàng chục nghìn kết nối, và số instance API cố định. Đừng chép con số — chép cách nghĩ: *pool phải khớp với thứ đứng sau nó chịu được bao nhiêu*, và bạn phải biết con số đó.

Tổ chức code theo hướng clean architecture, DI sinh lúc biên dịch bằng **Wire**: `interfaces/` (controller) → `usecases/` (interactor) → `models/` (một type một bảng, phần lớn **do máy sinh** từ schema) → `infrastructures/` (database, cache, logger, realtime). Với gần trăm controller, DI sinh lúc biên dịch giữ được lỗi ở khâu build thay vì lúc chạy.

## Giao tiếp với client: HTTP + protobuf

Không có gRPC ở tuyến client (gRPC chỉ dùng giữa các service nội bộ, ví dụ server thông báo đẩy). Client gọi **HTTP thường**, nhưng thân tin là **protobuf nhị phân**:

- Trả về `Content-Type: application/x-protobuf`.
- Kèm header **`Proto-Type`** mang **tên kiểu message** — client biết phải giải mã sang message nào mà không cần một envelope trong payload. Đây là cách tránh `oneof` mà [[go-protobuf]] mô tả: gói tin sạch, kiểu nằm ở tầng HTTP.
- Header `X-App-Format: json` **bật chế độ JSON** cho đúng request đó. Đây là thứ giữ lại khả năng debug bằng `curl` mà vẫn chạy nhị phân ở production — và là chi tiết đáng chép nhất trong cả node này.
- Marshal ở chế độ **deterministic**: protobuf không bảo đảm thứ tự khi serialize `map`, nên cùng một dữ liệu có thể ra hai chuỗi byte khác nhau. Bật deterministic để byte ổn định — cần cho cache, cho so sánh, cho chữ ký.

### Bộ header giữa client và server

Giao thức thật nằm ở đây nhiều hơn ở file `.proto`. Tên header dưới đây đã trung hoà (dự án thật dùng tiền tố riêng của công ty):

| Header | Chiều | Vai trò |
|---|---|---|
| `X-App-Session` | client → | Token phiên (JWT). Middleware xác thực đọc đúng header này |
| `X-App-Platform` | client → | ios / android / steam — quyết định bảng phiên bản nào được áp |
| `X-App-Version` | client → | Phiên bản app; lệch quá thì buộc cập nhật |
| `X-App-Version-Master` | cả hai chiều | Phiên bản bảng cân bằng client đang giữ |
| `X-App-Version-Resource` | cả hai chiều | Phiên bản gói tài nguyên (asset) client đang giữ |
| `X-App-Language` | client → | Chọn bảng nội địa hoá cho chính response đó |
| `X-App-Country-Code` | client → | Vùng — chi phối một số nội dung theo luật từng nước |
| `X-App-PlayerId` | client → | Chỉ để log và lần vết; **không dùng để xác thực** |
| `X-App-Stored-Generation` | cả hai chiều | "Thế hệ" state client đang giữ, để server trả về phần đã đổi |
| `X-App-Format` | client → | `json` để debug; mặc định là protobuf |
| `X-App-User-Agent` | client → | `DeviceOs;DeviceModel;DeviceVersion` — tự tách, không dùng UA chuẩn |
| `X-Date` | ← server | Thời gian **của server**, mọi thứ tính theo nó |
| `X-Maintenance` | ← server | Cờ bảo trì |

Hai điều rút ra: **thời gian luôn do server phát** (đúng luật ở [[game-database]]), và **client tự khai nó đang giữ phiên bản gì** ở mọi request — đó là nền cho cơ chế dưới đây.

### Ba tầng phiên bản, kiểm ở middleware

<figure class="fig">
<svg viewBox="0 0 660 210" role="img" aria-label="Chuỗi middleware của một request: ngữ cảnh, bảo trì, kiểm phiên bản, kiểm master, xác thực, xử lý, trả protobuf">
  <defs>
    <marker id="gpa-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
    <marker id="gpa-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#ff8787"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="6"   y="58" width="96"  height="46" rx="8" class="fig-box"/>
    <rect x="118" y="58" width="96"  height="46" rx="8" class="fig-box"/>
    <rect x="230" y="58" width="110" height="46" rx="8" class="fig-box"/>
    <rect x="356" y="58" width="96"  height="46" rx="8" class="fig-box"/>
    <rect x="468" y="58" width="90"  height="46" rx="8" class="fig-box"/>
    <rect x="574" y="58" width="80"  height="46" rx="8" class="fig-box"/>
  </g>
  <text x="54"  y="78"  text-anchor="middle" class="fig-label" font-size="11">ngữ cảnh</text>
  <text x="54"  y="94"  text-anchor="middle" class="fig-muted" font-size="10">cache, ngôn ngữ</text>
  <text x="166" y="78"  text-anchor="middle" class="fig-label" font-size="11">bảo trì</text>
  <text x="166" y="94"  text-anchor="middle" class="fig-muted" font-size="10">cờ ở memcached</text>
  <text x="285" y="78"  text-anchor="middle" class="fig-label" font-size="11">kiểm phiên bản</text>
  <text x="285" y="94"  text-anchor="middle" class="fig-muted" font-size="10">app · master · asset</text>
  <text x="404" y="78"  text-anchor="middle" class="fig-label" font-size="11">kiểm master</text>
  <text x="404" y="94"  text-anchor="middle" class="fig-muted" font-size="10">cache còn mới?</text>
  <text x="513" y="78"  text-anchor="middle" class="fig-label" font-size="11">xác thực</text>
  <text x="513" y="94"  text-anchor="middle" class="fig-muted" font-size="10">JWT phiên</text>
  <text x="614" y="78"  text-anchor="middle" class="fig-label" font-size="11">xử lý</text>
  <text x="614" y="94"  text-anchor="middle" class="fig-muted" font-size="10">→ protobuf</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#gpa-b)" fill="none">
    <path d="M102 81 H114"/>
    <path d="M214 81 H226"/>
    <path d="M340 81 H352"/>
    <path d="M452 81 H464"/>
    <path d="M558 81 H570"/>
  </g>
  <g stroke="#ff8787" stroke-width="2" marker-end="url(#gpa-c)" fill="none">
    <path d="M166 104 V150"/>
    <path d="M285 104 V150"/>
    <path d="M513 104 V150"/>
  </g>
  <text x="166" y="166" text-anchor="middle" font-size="10" fill="#ff8787">đang bảo trì</text>
  <text x="285" y="166" text-anchor="middle" font-size="10" fill="#ff8787">lệch master → tải lại</text>
  <text x="285" y="180" text-anchor="middle" font-size="10" fill="#ff8787">lệch app → mở store</text>
  <text x="513" y="166" text-anchor="middle" font-size="10" fill="#ff8787">token hỏng → đăng nhập lại</text>
  <text x="334" y="34"  text-anchor="middle" class="fig-muted" font-size="11">Ba cổng chặn đứng TRƯỚC mọi logic nghiệp vụ — handler không bao giờ phải nghĩ về chúng</text>
</svg>
<figcaption>Thứ tự không tuỳ tiện: bảo trì chặn trước phiên bản, phiên bản chặn trước master, master trước xác thực. Cái rẻ nhất và chặn nhiều nhất đứng trước.</figcaption>
</figure>

Cơ chế: client khai ba phiên bản (app / master / resource) trong header. Server tra bảng phiên bản hiện hành **theo platform**, rồi:

- **Luôn** trả phiên bản hiện hành về trong response header — client biết mình lệch mà không cần một endpoint hỏi riêng.
- Lệch master hoặc resource → trả lỗi phân loại riêng, client tải lại phần đó rồi gọi lại.
- Lệch app quá mức cho phép → lỗi kèm **`store_url`** trong thân lỗi để client mở thẳng cửa hàng.
- Có **danh sách đường dẫn miễn kiểm**: đăng nhập, tải master, tải tài nguyên, thông báo, webhook thanh toán. Không miễn thì client bị lệch master sẽ không tải nổi master mới — một vòng chết kinh điển.
- Có header debug bỏ qua kiểm phiên bản, và nó **chỉ có tác dụng ngoài production** — điều kiện đó nằm ngay trong code, không nằm ở niềm tin.

### Lỗi có "mức độ", không chỉ có mã

Message lỗi dùng chung cho mọi endpoint gồm: `code`, **`level`**, `msg`, `payload`, `detail`, `ts`, `store_url`. Trường `level` là thứ ít gặp mà rất đáng chép — client phân nhánh xử lý theo nó thay vì theo mã HTTP:

| Mức | Client làm gì |
|---|---|
| Không tới được mạng | Hiện "mất kết nối", tự thử lại, **không** coi là lỗi game |
| Lỗi kết nối sau khi đã nối | Thử lại có backoff |
| Panic | Dừng, báo lỗi, gửi log — gồm cả trường hợp **Content-Type trả về không phải protobuf** |

Trường hợp cuối đáng nói riêng: wifi công cộng có cổng đăng nhập sẽ trả về **HTML** cho mọi request. Client kiểm `Content-Type` **trước khi** giải mã, nên thay vì một `ProtoException` khó hiểu, người chơi thấy đúng thông báo "mạng này cần đăng nhập". Đây là loại lỗi chỉ lộ ra ở người dùng thật, không bao giờ lộ ở máy dev.

## Codegen là trục xuyên suốt

Đây là đặc điểm định hình cả hệ thống, và là câu trả lời cho "server nói chuyện với client bằng cái gì":

```
schema database (bảng master, bảng user)
        │  bin/gen_proto
        ▼
   *.proto  ──► protoc --go_out     ──►  package Go cho server
        │
        └────► protogen --csharp_out ──► *.cs ──► mcs ──► proto.dll
                                                   │
                                                   └──► precompile ──► proto_serializer.dll
                                                                    + AOTHelper.cs
        │
        ▼
  đẩy thẳng vào repo client Unity (nhánh feature, có kiểm hash trước khi commit)
```

Nghĩa là:

- **Server là nguồn chân lý của giao thức.** Client không định nghĩa message, không viết tay lớp DTO — nó nhận DLL.
- **Đổi một cột trong bảng master là đổi giao thức.** Sinh lại proto, sinh lại DLL, đẩy sang client. Nhanh và không lệch — nhưng nó nối chặt schema database với giao thức, tức là khó đổi schema mà không đụng client.
- Bước đẩy DLL có **so hash trước và sau**: nội dung không đổi thì hoàn tác, không tạo commit rác trong repo client.
- Phía C# dùng **protobuf-net với serializer biên dịch sẵn** (`proto_serializer.dll`) thay vì phản chiếu lúc chạy, kèm file `AOTHelper.cs` **sinh tự động** liệt kê mọi cặp `Dictionary<K,V>` cần AOT — vì IL2CPP không sinh generic lúc chạy. Thiếu file đó thì Editor chạy ngon còn bản iOS crash ở đúng màn hình có cái map ấy.

Bảng `master.proto` ở dự án này dài khoảng **6.600 dòng**, sinh hoàn toàn từ schema, mỗi bảng một message, mỗi cột một field kèm chú thích lấy từ comment của cột. Không ai viết tay file đó, và cũng không ai được sửa tay.

## Realtime: WebSocket + khung nhị phân tự đặt

Server realtime chạy ở mode riêng, cổng riêng, dùng `gobwas/ws`. Khung tin **tự định nghĩa**, không dùng `oneof`:

<figure class="fig">
<svg viewBox="0 0 660 190" role="img" aria-label="Bố cục byte của khung tin realtime hai chiều: client gửi gồm message id, mã lệnh và dữ liệu; server gửi có thêm một byte loại ở đầu">
  <g class="fig-box-g">
    <rect x="60"  y="44" width="150" height="34" rx="6" class="fig-box"/>
    <rect x="214" y="44" width="80"  height="34" rx="6" class="fig-box"/>
    <rect x="298" y="44" width="330" height="34" rx="6" class="fig-box"/>
    <rect x="60"  y="118" width="54" height="34" rx="6" class="fig-box"/>
    <rect x="118" y="118" width="150" height="34" rx="6" class="fig-box"/>
    <rect x="272" y="118" width="80"  height="34" rx="6" class="fig-box"/>
    <rect x="356" y="118" width="272" height="34" rx="6" class="fig-box"/>
  </g>
  <text x="14"  y="66"  class="fig-muted" font-size="11">client →</text>
  <text x="14"  y="140" class="fig-muted" font-size="11">→ client</text>
  <text x="135" y="66"  text-anchor="middle" class="fig-label" font-size="11">message id · 4 byte LE</text>
  <text x="254" y="66"  text-anchor="middle" class="fig-label" font-size="11">opcode · 1</text>
  <text x="463" y="66"  text-anchor="middle" class="fig-label" font-size="11">payload — protobuf</text>
  <text x="87"  y="140" text-anchor="middle" class="fig-label" font-size="11">type</text>
  <text x="193" y="140" text-anchor="middle" class="fig-label" font-size="11">message id · 4 byte LE</text>
  <text x="312" y="140" text-anchor="middle" class="fig-label" font-size="11">opcode · 1</text>
  <text x="492" y="140" text-anchor="middle" class="fig-label" font-size="11">payload — protobuf</text>
  <text x="87"  y="168" text-anchor="middle" class="fig-muted" font-size="10">0 = đẩy · 1 = trả lời</text>
  <text x="334" y="26"  text-anchor="middle" class="fig-muted" font-size="11">message id cho phép ghép trả lời với yêu cầu trên cùng một kết nối</text>
  <text x="463" y="182" text-anchor="middle" class="fig-muted" font-size="10">message đẩy (chat của người khác) mang type = 0 và message id = 0</text>
</svg>
<figcaption>Năm byte đầu làm hết việc của một envelope: định tuyến theo <code>opcode</code>, ghép cặp theo <code>message id</code>, phân biệt "trả lời" với "đẩy" theo <code>type</code>.</figcaption>
</figure>

Bảng `opcode` là một hằng số nhỏ, dễ đọc: `2` xác thực, `6/7` đăng ký / huỷ đăng ký kênh, `11/12` gửi / nhận chat, `21/22` gửi / nhận message chuyển tiếp, `1` lỗi. Mỗi opcode ánh xạ sang một message protobuf cố định.

Bốn chi tiết vận hành đáng chép:

- **Kênh (channel) thay cho phòng cứng.** Client đăng ký kênh theo chuỗi (`guild:123`, `world:5`); server không cần biết ngữ nghĩa. Chuyển tiếp giữa nhiều instance qua Redis pub/sub, và có shard theo kênh.
- **Hàng đợi ghi mỗi kết nối là 10 message, đầy thì bỏ tin và ghi cảnh báo** — không block vòng lặp. Đúng luật "đầy thì drop hoặc kick" ở [[game-server-go]], và họ chọn drop vì mất một dòng chat rẻ hơn mất kết nối.
- **Một goroutine ghi duy nhất cho mỗi kết nối**, vì ghi WebSocket từ hai goroutine là hỏng khung tin — thứ chỉ lộ ra dưới tải.
- **Xác thực là một opcode**, không phải một header — kết nối mở ra ở trạng thái chưa xác thực rồi mới nâng quyền.

## Master data: nhập bản nháp, kiểm, rồi mới phát hành

Đúng khung đã mô tả ở [[master-data]], với hai thứ đi xa hơn:

**Kiểm dữ liệu thành một tầng riêng.** Có hẳn một package chỉ để kiểm bản nháp TSV trước khi nó vào database: kiểm tham chiếu (id trỏ tới bảng khác có tồn tại không), kiểm ràng buộc giá trị, và hàng chục **luật riêng theo nghiệp vụ** — ví dụ bậc thưởng theo chuỗi thắng không được thủng giữa (định nghĩa bậc 1, 2, 4 mà thiếu 3).

**Mức độ ba tầng, và lý do rất cụ thể.** Ban đầu chỉ có một mức: tìm thấy bất kỳ vấn đề nào là chặn nguyên đợt nhập. Một hôm, một cảnh báo về nội dung của **26 ngày sau** đã chặn đợt nhập mất **7 giờ 38 phút**. Sau đó họ chia ba:

| Mức | Là gì | Có chặn nhập không |
|---|---|---|
| Critical | Sai tham chiếu, sai ràng buộc giá trị | **Chặn** |
| Warning | Lệch thời gian, nhưng sự kiện bắt đầu trong 4 ngày tới | **Chặn** |
| Info | Lệch thời gian của sự kiện còn xa hơn 4 ngày | Chỉ báo, cho qua |

Luật chưa gắn mức thì mặc định là Critical — thêm luật mới không vô tình nới lỏng cổng. Bài học chung: **cổng chất lượng cần có nấc**, nếu không người ta sẽ tìm cách tắt cả cổng.

Phần phục vụ: master nạp vào **cache trong tiến trình**, và mọi instance cùng theo một khoá thời gian trong memcached — khoá đổi thì cache bị xoá và nạp lại. Đây là bản đơn giản hơn `atomic.Pointer` ở [[master-data]]: rẻ, dễ hiểu, và đủ vì master chỉ đổi vài lần một tuần.

## Chép gì, đừng chép gì

| Đáng chép | Vì sao |
|---|---|
| Header `X-App-Format: json` để bật JSON cho một request | Giữ được `curl` và log đọc được mà vẫn chạy nhị phân ở production |
| Ba tầng phiên bản kiểm ở middleware + danh sách đường dẫn miễn kiểm | Tránh vòng chết "lệch master nên không tải được master" |
| `level` trong message lỗi | Client phân nhánh đúng giữa "mất mạng" và "lỗi thật" |
| Kiểm `Content-Type` trước khi giải mã | Bắt đúng lỗi wifi có cổng đăng nhập |
| Kiểm master data thành tầng riêng, có **nấc** mức độ | Cổng không có nấc sẽ bị tắt hẳn |
| Một binary nhiều mode | Không bao giờ lệch phiên bản giữa các thành phần |
| Marshal deterministic khi payload có `map` | Byte ổn định cho cache và so sánh |

| Cân nhắc kỹ | Vì sao |
|---|---|
| Sinh `.proto` từ schema database | Nhanh, không lệch — nhưng nối chặt bảng với giao thức, đổi schema là đụng client |
| Đẩy DLL sang repo client | Tiện cho đội cùng công ty; đội ngoài hoặc client đa nền tảng thì nên đẩy `.proto` rồi để client tự sinh |
| Nhúng config vào binary | Được tính bất biến, mất khả năng đổi nóng — chỉ hợp khi đã có chỗ khác cho cờ cần đổi nóng |
| `max_open` pool hàng nghìn | Chỉ đúng khi thứ đứng sau chịu được; chép con số mà không chép hoàn cảnh là cách giết database |
| Một binary nhiều mode | Mọi mode phải deploy cùng nhịp — đội deploy nhiều lần mỗi ngày sẽ thấy vướng |

## 🤖 Prompt cho AI

**Dùng AI thế nào khi vào một codebase server đã chạy nhiều năm**

Đây là tình huống khác hẳn viết mới: code đã có, quy ước đã có, và **thứ nguy hiểm nhất là AI viết đúng kiểu chung chung của ngành thay vì đúng kiểu của repo này**. Thứ tự dùng hiệu quả:

1. **Bắt nó lập bản đồ trước khi sửa.** "Đọc `main.go`, danh sách mode, chuỗi middleware, và một controller tiêu biểu; tóm tắt luồng một request từ lúc vào tới lúc trả byte." Không có bước này, mọi thay đổi nó đề xuất đều lơ lửng.
2. **Chỉ cho nó file mẫu, đừng mô tả quy ước bằng lời.** "Viết endpoint mới **theo đúng khuôn** của `<file controller có sẵn>`" cho kết quả tốt hơn nhiều so với mười dòng mô tả.
3. **Nói rõ cái gì do máy sinh.** Model, `.proto`, DLL client đều là sản phẩm sinh ra. AI rất hay "sửa giúp" file `_gen.go` — sửa xong lần sinh sau mất sạch, và không ai nhận ra ngay.
4. **Ràng buộc phạm vi bằng tầng.** "Chỉ sửa trong `usecases/`; nếu phải đụng `models/` thì dừng lại nói tôi biết vì sao" — vì đụng model thường có nghĩa là đụng schema, tức là đụng giao thức, tức là đụng client.

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Tầng nào được sửa** và tầng nào chỉ đọc; file nào do máy sinh.
- **Giao thức có phải hợp đồng đã phát hành không** — client đang chạy ngoài kia có bản cũ hay không.
- **Config nằm trong binary** (nếu dự án bạn cũng vậy) — nếu không nó sẽ bảo bạn "sửa YAML rồi restart".
- **Endpoint mới có phải khai vào danh sách miễn kiểm phiên bản không** — AI không đoán được luật này.
- **Chạy test cần hạ tầng gì** (database đã migrate, redis, memcached) — nếu không nó khẳng định "đã chạy test" sau khi chạy một lệnh thất bại vì thiếu kết nối.

**Mẫu prompt**

```
Codebase: server game Go đã phát hành. Kiến trúc: một binary nhiều mode,
clean architecture (interfaces → usecases → models → infrastructures), DI sinh
bằng Wire, client nhận protobuf qua HTTP.

Việc: thêm endpoint GET /<đường dẫn> trả về <dữ liệu>.

TRƯỚC KHI VIẾT, làm hai bước và dừng lại chờ tôi duyệt:
1. Đọc <file controller mẫu>, <file routes>, <file middleware phiên bản> rồi tóm tắt:
   khuôn của một controller, chỗ đăng ký route, và endpoint này có cần vào
   danh sách miễn kiểm phiên bản không (giải thích vì sao).
2. Liệt kê file nào sẽ đụng, và file nào trong số đó là file DO MÁY SINH.

RÀNG BUỘC:
- KHÔNG sửa file *_gen.go, không sửa *.proto bằng tay, không sửa DLL client.
- Nếu cần cột mới trong database: DỪNG lại, nói tôi biết — đó là đổi giao thức.
- Theo đúng khuôn của controller mẫu: cùng thứ tự parse input → transaction →
  interactor → render. KHÔNG đưa framework hay thư viện mới vào.
- Test cần database đã migrate; nếu không chạy được thì NÓI RÕ là chưa chạy,
  đừng khẳng định đã chạy.
```

**Bẫy thường gặp:** AI đọc một repo lớn rồi **tự tin đề xuất tái cấu trúc** — tách microservice, thay Wire bằng DI lúc chạy, đổi protobuf sang JSON "cho dễ" — vì đó là lời khuyên phổ biến nhất trong dữ liệu huấn luyện, và vì nó không thấy được cái giá đã trả để hệ thống hiện tại chạy ổn. Hai cái nữa rất hay xảy ra ở đúng loại codebase này: nó **sửa file do máy sinh** (đẹp trong PR, biến mất ở lần sinh sau), và nó **bỏ qua cổng phiên bản** khi thêm endpoint mới — endpoint chạy ngon trên máy dev rồi trả lỗi lệch master cho mọi người chơi thật.

## 🎮 Unity

Phía client, lớp mạng là một `ApiClient` mỏng bọc `UnityWebRequest`, cộng với một **parser riêng cho protobuf**. Ba điểm thiết kế đáng học:

**Component & nơi đặt**

- Lớp mạng nằm trong một assembly lõi dùng chung, tách khỏi code tính năng — tính năng chỉ gọi `Api.Get<T>()`.
- `proto.dll` + `proto_serializer.dll` đặt ở `Assets/Plugins/`, **do server đẩy sang**, không sửa tay.
- `AOTHelper.cs` sinh tự động, đặt trong assembly client, có `[Preserve]` để stripping không xoá.

**Ba điểm thiết kế**

1. **Kiểm `Content-Type` trước khi giải mã.** Không khớp `application/x-protobuf` thì dựng một lỗi mức Panic kèm nguyên văn body — đây là cách duy nhất bắt được wifi có cổng đăng nhập trả HTML, và proxy công ty trả trang lỗi.
2. **Giải mã ngoài luồng chính.** `downloadHandler.data` được ném sang một tác vụ nền, coroutine chỉ `yield` chờ. Response master data vài MB mà parse trên main thread là một khựng hình thấy rõ — xem [[unity-optimization]].
3. **Serializer biên dịch sẵn thay vì phản chiếu.** Bản protobuf-net thường sinh mã lúc chạy; IL2CPP không cho phép. Họ dùng bản precompile, và bù phần generic bằng file AOT hints sinh tự động — cặp `Dictionary<K,V>` nào xuất hiện trong message thì được đăng ký trước.

**Bẫy Unity cụ thể**

- **Thiếu AOT hints cho một `Dictionary<K,V>` mới.** Editor và bản Android Mono chạy bình thường; bản iOS/IL2CPP ném `ExecutionEngineException` đúng màn hình dùng map đó. Sinh lại AOTHelper là bước bắt buộc sau mỗi lần đổi message.
- **Quên lấy DLL mới sau khi server đổi proto.** Client giải mã ra giá trị mặc định, không lỗi gì cả — biểu hiện là "số liệu bằng 0" chứ không phải crash.
- **Giữ phiên bản master trong RAM rồi tin nó.** Server trả phiên bản hiện hành ở **mọi** response; client phải đọc và cập nhật, nếu không sẽ đi vào vòng lặp lệch version.
- **Coi mã HTTP là nguồn phân loại lỗi.** Ở hệ này, phân loại thật nằm ở `level` trong thân lỗi protobuf; 200 vẫn có thể kèm lỗi nghiệp vụ.
- **Dùng `X-App-PlayerId` như một thứ để tin.** Nó chỉ để lần vết trong log; danh tính nằm ở token phiên.

**Kiểm tra nhanh**

- Gọi một endpoint với header format `json` bằng `curl`: đọc được nguyên response — nếu không, chế độ debug đã hỏng và bạn sẽ mù khi có sự cố.
- Sửa cache master của client cho lệch một phiên bản: request kế tiếp phải trả lỗi buộc tải master, **không** phải lỗi chung chung.
- Bật một proxy trả HTML cho mọi request: client hiện thông báo mạng, không phải `ProtoException`.
- Build IL2CPP sau khi thêm một message có `Dictionary<uint, X>` mới mà **không** sinh lại AOT hints: phải tái hiện được crash — đó là cách bạn tin rằng bước sinh lại là bắt buộc.
