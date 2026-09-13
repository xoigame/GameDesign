---
id: client-server-flow
title: Tuyến xuyên suốt một phiên chơi
summary: Mười ba mốc từ lúc người chơi chạm icon tới lúc bảng xếp hạng đổi — ai gọi ai, đi đường nào, hỏng ở mốc nào thì người chơi thấy gì.
status: deep
read: 930
level: advanced
order: 30
tags: [project, client-server, flow, protocol, sequence]
related: [game-server-go, project-architecture, unity-network-client, go-matchmaking]
---

Node này là thứ [[project-architecture]] chưa trả lời: ranh giới đã rõ, nhưng **thứ tự** thì sao. Cái gì gọi trước, cái gì chờ cái gì, và người chơi nhìn thấy gì trong lúc chờ.

Đây cũng là câu trả lời cho câu phỏng vấn hay gặp nhất: *"kể xem một trận đấu đi qua hệ thống của anh thế nào."*

## Mười ba mốc

<figure class="fig">
<svg viewBox="0 0 680 560" role="img" aria-label="Sơ đồ trình tự một phiên chơi qua bốn tầng: client Unity, API Go, room server Go, và Postgres Redis — từ bootstrap, đăng nhập, tải master data, ghép trận, vào phòng, tick loop, tới chốt kết quả và cập nhật bảng xếp hạng">
  <defs>
    <marker id="csf-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
    <marker id="csf-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#9aa4b2"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="20"  y="14" width="120" height="34" rx="8" class="fig-box"/>
    <rect x="196" y="14" width="120" height="34" rx="8" class="fig-box"/>
    <rect x="372" y="14" width="120" height="34" rx="8" class="fig-box"/>
    <rect x="548" y="14" width="112" height="34" rx="8" class="fig-box"/>
  </g>
  <text x="80"  y="36" text-anchor="middle" class="fig-label" font-size="12">Client Unity</text>
  <text x="256" y="36" text-anchor="middle" class="fig-label" font-size="12">API Go</text>
  <text x="432" y="36" text-anchor="middle" class="fig-label" font-size="12">Room Go</text>
  <text x="604" y="36" text-anchor="middle" class="fig-label" font-size="12">PG · Redis</text>
  <g stroke="#9aa4b2" stroke-width="1" stroke-dasharray="3 4" opacity="0.5">
    <line x1="80"  y1="52" x2="80"  y2="544"/>
    <line x1="256" y1="52" x2="256" y2="544"/>
    <line x1="432" y1="52" x2="432" y2="544"/>
    <line x1="604" y1="52" x2="604" y2="544"/>
  </g>
  <g stroke="#6ea8fe" stroke-width="1.8" marker-end="url(#csf-a)" fill="none">
    <path d="M80 76 H250"/>
    <path d="M80 132 H250"/>
    <path d="M80 188 H250"/>
    <path d="M80 244 H250"/>
    <path d="M80 300 H250"/>
    <path d="M80 384 H426"/>
    <path d="M256 356 H426"/>
    <path d="M432 468 H250"/>
    <path d="M256 496 H598"/>
  </g>
  <g stroke="#9aa4b2" stroke-width="1.4" marker-end="url(#csf-b)" fill="none" opacity="0.85">
    <path d="M250 104 H84"/>
    <path d="M250 160 H84"/>
    <path d="M250 216 H84"/>
    <path d="M250 272 H84"/>
    <path d="M250 328 H84"/>
    <path d="M426 412 H84"/>
    <path d="M598 524 H262"/>
  </g>
  <text x="165" y="70"  text-anchor="middle" class="fig-muted" font-size="9">1 · GET /config</text>
  <text x="165" y="98"  text-anchor="middle" class="fig-muted" font-size="9">2 · min_version, master_version</text>
  <text x="165" y="126" text-anchor="middle" class="fig-muted" font-size="9">3 · POST /auth/login (device_id)</text>
  <text x="165" y="154" text-anchor="middle" class="fig-muted" font-size="9">4 · access token + refresh token</text>
  <text x="165" y="182" text-anchor="middle" class="fig-muted" font-size="9">5 · GET /master?v=1842</text>
  <text x="165" y="210" text-anchor="middle" class="fig-muted" font-size="9">6 · bảng cân bằng (hoặc 304)</text>
  <text x="165" y="238" text-anchor="middle" class="fig-muted" font-size="9">7 · GET /me</text>
  <text x="165" y="266" text-anchor="middle" class="fig-muted" font-size="9">8 · ví, inventory, tiến trình</text>
  <text x="165" y="294" text-anchor="middle" class="fig-muted" font-size="9">9 · POST /match/queue</text>
  <text x="165" y="322" text-anchor="middle" class="fig-muted" font-size="9">10 · room_token + địa chỉ WS</text>
  <text x="341" y="350" text-anchor="middle" class="fig-muted" font-size="9">cấp phòng</text>
  <text x="253" y="378" text-anchor="middle" class="fig-muted" font-size="9">11 · WS connect + join(room_token)</text>
  <text x="253" y="406" text-anchor="middle" class="fig-muted" font-size="9">12 · tick 20Hz: input ⇄ snapshot</text>
  <text x="341" y="462" text-anchor="middle" class="fig-muted" font-size="9">13 · kết quả trận (internal)</text>
  <text x="427" y="490" text-anchor="middle" class="fig-muted" font-size="9">transaction: ví + ZSET</text>
  <text x="430" y="518" text-anchor="middle" class="fig-muted" font-size="9">số dư mới, hạng mới</text>
  <rect x="70" y="336" width="20" height="92" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <rect x="422" y="336" width="20" height="132" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="80" y="444" text-anchor="middle" class="fig-muted" font-size="9">trong trận</text>
</svg>
<figcaption>Room server không chạm database. Nó gửi kết quả qua API, API ghi một transaction. Một đường ghi duy nhất vào nguồn chân lý.</figcaption>
</figure>

Bốn khối, đọc theo thứ tự:

**Bootstrap (mốc 1–2).** Client hỏi server một câu trước mọi thứ khác: *bản này còn dùng được không, và dữ liệu cân bằng đang ở version nào.* Endpoint này phải **không cần đăng nhập** và phải sống kể cả khi mọi thứ khác chết — nó là chỗ duy nhất bạn bật được màn hình bảo trì.

**Danh tính (mốc 3–4).** Đăng nhập khách bằng device id ở lần đầu; về sau là refresh token. Trả về access token ngắn hạn (15–60 phút) và refresh token dài hạn. Chi tiết phía client ở [[unity-network-client]].

**Nạp dữ liệu (mốc 5–8).** Hai loại tách hẳn nhau: **master data** dùng chung mọi người, cache được, đổi theo version ([[master-data]]); **dữ liệu người chơi** riêng từng người, không cache lâu. Gộp hai cái vào một endpoint là sai lầm khiến bạn không cache được gì cả.

**Vào trận và chốt (mốc 9–13).** Ghép trận trả về `room_token` có hạn ngắn, client mở WebSocket tới đúng máy đó ([[go-matchmaking]]). Hết trận, **room gửi kết quả qua API** chứ không tự ghi.

## Bảng định tuyến: hành động nào đi đường nào

| Hành động | Đường | Idempotent | Retry | Hỏng thì người chơi thấy |
|---|---|---|---|---|
| Lấy config | HTTP GET | Có | Tự do, backoff | Màn hình "không kết nối được", có nút thử lại |
| Đăng nhập | HTTP POST | Có (cùng device id) | Tự do | Kẹt ở màn đăng nhập |
| Tải master | HTTP GET + cache | Có | Tự do | Dùng bản cache cũ nếu còn hợp lệ |
| Lấy trạng thái người chơi | HTTP GET | Có | Tự do | Sảnh hiện số liệu cũ, có nhãn "đang đồng bộ" |
| **Mua vật phẩm** | HTTP POST | **Chỉ khi có request id** | **Chỉ khi có request id** | Quay tròn rồi báo lỗi — tuyệt đối không tự thử lại mù |
| **Nhận thưởng** | HTTP POST | **Chỉ khi có request id** | Như trên | Như trên |
| Vào hàng đợi ghép trận | HTTP POST | Có (trạng thái, không phải hành động) | Tự do | Thoát hàng đợi, hiện nút tìm lại |
| Input trong trận | WebSocket | Không cần — có số thứ tự tick | Không retry, gói sau đè gói trước | Giật, rồi server kéo về vị trí đúng |
| Chat | WebSocket | Không | Không | Tin nhắn không gửi được, hiện dấu chấm than |
| Kết quả trận | Internal API | **Bắt buộc** (match id) | Có, tới khi thành công | Phần thưởng tới chậm vài giây |

Cột "Idempotent" là cột đáng dán lên tường. Luật: **mọi lệnh làm đổi ví tiền phải mang một id do client sinh ra**, và server ghi nhớ id đó. Gửi lại cùng id thì trả về **kết quả cũ**, không thực hiện lần hai. Chi tiết ở [[game-database]].

Không có nó, chuỗi sự kiện sau xảy ra và bạn không bao giờ tái hiện được trong phòng thí nghiệm: người chơi bấm mua, mạng 4G rớt đúng lúc server đã ghi xong nhưng phản hồi chưa về, client tự thử lại, trừ tiền hai lần.

## Ba chế độ hỏng phải thiết kế trước

Không phải xử lý lỗi chung chung — ba tình huống cụ thể này xảy ra hằng ngày trên mạng di động thật:

**Mất mạng giữa trận.** State của người chơi phải gắn với `player_id` ổn định, không phải id kết nối. Phòng giữ chỗ 30–60 giây. Client mở lại WebSocket bằng `room_token` cũ và nhận một snapshot đầy đủ, không phải chuỗi delta từ lúc rớt. Không làm thì mọi lần chuyển từ WiFi sang 4G là một trận bị bỏ.

**Server restart giữa chừng.** API restart vô hại. Room server thì phải **drain**: ngừng nhận phòng mới, chờ phòng đang chạy kết thúc, rồi mới thoát. Kill thẳng là mất trận của mọi người đang chơi — xem [[go-deploy-ops]].

**Client nói dối.** Không tin số nào client gửi. Ngoài ra thêm một lớp rẻ tiền mà hiệu quả: server kiểm **tính hợp lý theo thời gian** — một người không thể hoàn thành trận 3 phút trong 40 giây, không thể mua 200 lần trong một phút. Ghi log, đừng khoá tài khoản tự động; tỉ lệ dương tính giả luôn cao hơn bạn nghĩ.

## Mốc nào chậm thì người chơi bỏ đi

Thời gian từ chạm icon tới lúc bấm được nút "Chơi" là chỉ số ai cũng quên đo:

| Khúc | Ngân sách hợp lý | Cách cứu nếu vượt |
|---|---|---|
| Splash + khởi tạo engine | 1–3 giây | Xem [[unity-optimization]] |
| Bootstrap + đăng nhập | dưới 1 giây | Gộp mốc 1–4 thành một request khi đã có token |
| Tải master data | dưới 0,5 giây khi cache còn hợp lệ | Trả `304` theo version; chỉ tải phần đổi |
| Lấy trạng thái người chơi | dưới 0,5 giây | Một query, không N+1 |
| **Tổng tới màn sảnh** | **dưới 5 giây** | Cho vào sảnh trước, nạp phần phụ ở nền |

Mẹo đáng làm: cho người chơi vào sảnh ngay khi có đủ dữ liệu tối thiểu, nạp phần còn lại ở nền, khoá riêng nút nào chưa sẵn sàng. Chờ đủ mọi thứ rồi mới cho vào là cách dễ nhất để mất người ở phiên đầu.

## Bẫy thường gặp

- **Gộp master data và dữ liệu người chơi vào một endpoint.** Mất khả năng cache thứ đáng cache nhất.
- **Không có endpoint bảo trì.** Server chết là người chơi thấy màn hình treo thay vì thông báo.
- **Room server tự ghi database.** Mất đường đối soát, và giết database khi nhiều phòng.
- **Retry mù mọi request.** Với lệnh trừ tiền, retry không có request id là nhân đôi giao dịch.
- **Reconnect bằng chuỗi delta.** Phải gửi snapshot đầy đủ; ghép delta sau khi mất gói là nguồn bug không tái hiện nổi.
- **Đo latency trên WiFi văn phòng.** Mạng thật là 4G lúc 7 giờ tối, 150ms và mất gói.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc thiết kế tuyến**

AI vẽ sequence và liệt kê trường hợp biên rất tốt — đó là việc đọc nhiều mẫu rồi tổng hợp. Nó **không** tự biết cái gì xảy ra khi mạng rớt ở đúng mốc 11 trong game của bạn, vì cái đó phụ thuộc vào thiết kế bạn chưa nói.

Ba lượt đáng chạy:

1. **Vẽ tuyến** từ mô tả game, đánh số mốc.
2. **Đâm thủng tuyến**: với mỗi mốc, hỏi "mạng rớt ở đây thì sao, server chết ở đây thì sao".
3. **Soạn bảng định tuyến** — hành động, đường đi, idempotent, retry, người chơi thấy gì.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Có trận realtime không, tick bao nhiêu** — không nói thì AI mặc định vẽ cả WebSocket cho game turn-based.
- **Đăng nhập kiểu gì**: khách, Google/Apple, hay tài khoản riêng.
- **Master data tải lúc nào**: khi mở app hay khi vào trận.
- **Ngân sách thời gian vào sảnh** — không có thì AI không tối ưu gì cả.
- **Chơi offline được không**, và offline thì cái gì vẫn phải chạy.

**Mẫu prompt**

```
Game: <mô tả>. Realtime: <có, tick 20Hz / không>. Đăng nhập: <khách + Google>.
Nền tảng: <Android/iOS>. Ngân sách: từ chạm icon tới sảnh dưới 5 giây.

Việc 1: vẽ tuyến một phiên chơi, đánh số mốc, mỗi mốc ghi rõ:
ai gọi ai | HTTP hay WS | payload chính | chờ đồng bộ hay chạy nền.

Việc 2: với TỪNG mốc, trả lời hai câu:
(a) mạng rớt đúng lúc này thì client làm gì, người chơi thấy gì;
(b) lệnh này chạy hai lần thì hậu quả gì, và cần request id không.

Ràng buộc:
- Room server KHÔNG được ghi thẳng database — kết quả trận đi qua API.
- KHÔNG gộp master data chung endpoint với dữ liệu người chơi.
- Mốc nào anh phải đoán vì tôi chưa nói rõ thì ghi "GIẢ ĐỊNH: ..." ở đầu dòng.
```

**Bẫy thường gặp:** AI vẽ tuyến đẹp cho đường thành công rồi bỏ trắng mọi nhánh hỏng — phải hỏi riêng từng mốc mới ra. Bẫy thứ hai: nó cho client giữ token vĩnh viễn, không có refresh, vì như thế "đơn giản hơn". Bẫy thứ ba: nó đặt việc ghi bảng xếp hạng ngay trong room server cho gần chỗ tính điểm.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Từ lúc mở app tới lúc vào được sảnh, client gọi những gì?**
  → Bốn khối theo thứ tự: lấy config để biết bản này còn dùng được không và master data đang ở version nào; đăng nhập lấy access token; tải master data nếu version đổi, không thì dùng cache; rồi lấy trạng thái người chơi — ví, inventory, tiến trình. Ngân sách hợp lý cho cả chuỗi là dưới 5 giây tính từ lúc chạm icon.
- `Junior` **Vì sao cần endpoint config trước cả đăng nhập?**
  → Vì đó là chỗ duy nhất bật được màn hình bảo trì và ép cập nhật. Nếu nó nằm sau đăng nhập thì đúng lúc hệ thống đăng nhập chết, bạn mất luôn khả năng nói với người chơi rằng đang bảo trì — và người chơi chỉ thấy một màn hình treo im lặng.
- `Mid` **Người chơi bấm mua, mạng rớt, họ bấm lại. Làm sao không trừ hai lần?**
  → Idempotency key: client sinh một id cho mỗi hành động mua, bấm lại vẫn là id cũ. Server ghi id đó trong **cùng transaction** với việc trừ tiền; request thứ hai mang id đã tồn tại thì trả về kết quả đã lưu chứ không thực hiện lại. Key phải sống qua lần khởi động lại app, vì người chơi hay tắt app khi thấy treo.
- `Mid` **Mất mạng giữa trận thì hệ thống xử lý thế nào?**
  → State gắn với `player_id` ổn định chứ không phải id kết nối, phòng giữ chỗ 30–60 giây, và client nối lại nhận một **snapshot đầy đủ** chứ không phải chuỗi delta từ lúc rớt. Ghép delta sau khi mất gói là nguồn bug không tái hiện nổi, còn snapshot thì luôn đúng dù rớt bao lâu.
- `Senior` **Kết quả trận đi đường nào vào database, và vì sao không cho phòng tự ghi?**
  → Phòng gửi kết quả qua API, API ghi một transaction. Hai lý do: phòng là RAM nên thứ không được phép mất phải vào Postgres trước khi trả về thành công; và phòng tick 20 lần mỗi giây, ghi thẳng thì 20–30 write mỗi giây mỗi phòng sẽ giết database ở vài chục phòng. Đổi lại phần thưởng tới chậm vài trăm mili giây, người chơi không nhận ra.
- `Senior` **Thời gian vào sảnh đang 9 giây. Anh cắt ở đâu?**
  → Đo bốn khúc trước đã: khởi tạo engine, bootstrap, master data, dữ liệu người chơi. Thủ phạm thường là master data không cache — sửa bằng trả 304 theo version — và một query N+1 ở endpoint lấy trạng thái người chơi. Sau đó cho vào sảnh ngay khi có dữ liệu tối thiểu, nạp phần còn lại ở nền và khoá riêng nút nào chưa sẵn sàng.

**Khung trả lời 60 giây** — "Bấm mua, mạng rớt, bấm lại — làm sao không trừ hai lần?"

> Bằng **idempotency key**. Client sinh một id cho mỗi hành động mua — không phải mỗi lần gửi, mà mỗi **hành động**. Bấm lại thì vẫn là id cũ.
>
> Server ghi id đó vào một bảng cùng **trong transaction** trừ tiền. Request thứ hai mang id đã tồn tại thì server không thực hiện lại, nó trả về **kết quả đã lưu của lần đầu**. Người chơi thấy đúng một lần trừ tiền và đúng một món đồ.
>
> Chỗ tinh tế là id phải nằm trong **cùng transaction** với việc trừ tiền. Nếu ghi id ở bảng riêng, ngoài transaction, thì vẫn có khe hở: crash giữa hai lệnh ghi là mất dấu. Và client phải giữ id qua lần khởi động lại app, vì người chơi hay tắt app khi thấy treo.

**Họ sẽ đào tiếp**

- *"Request nào cần idempotency, request nào không?"* → Cái nào đổi trạng thái có giá trị thì cần: mua, nhận thưởng, chốt kết quả trận, đổi tiền. Đọc thuần thì không. Quy tắc thực dụng: nếu chạy hai lần mà người chơi được lợi hoặc thiệt thì phải có.
- *"Vì sao config phải gọi trước đăng nhập?"* → Vì nó là chỗ duy nhất bật được bảo trì và ép cập nhật. Nếu nó nằm sau đăng nhập, thì khi hệ thống đăng nhập chết bạn mất luôn khả năng nói với người chơi là đang bảo trì.
- *"Reconnect giữa trận?"* → State gắn với `player_id` ổn định chứ không phải id kết nối; phòng giữ chỗ 30–60 giây; client nối lại và nhận **snapshot đầy đủ**, không phải delta. Ghép delta sau khi mất gói là nguồn bug không tái hiện được.
- *"Sao không cho phòng ghi thẳng database?"* → Vì phòng là RAM và nó tick 20 lần mỗi giây. Một đường ghi duy nhất qua API cho bạn transaction, đối soát, và một chỗ duy nhất để tìm khi số liệu lệch. Đổi lại, phần thưởng tới chậm vài trăm mili giây — người chơi không nhận ra.
- *"Vào sảnh 9 giây thì cắt ở đâu?"* → Đo trước bốn khúc: khởi tạo engine, bootstrap, master data, dữ liệu người chơi. Thường thủ phạm là tải master data không cache và một query N+1 ở `/me`. Sau đó cho vào sảnh sớm, nạp phần phụ ở nền, khoá riêng nút chưa sẵn sàng.

**Cờ đỏ**

- "Client tự thử lại khi timeout" — không kèm idempotency key.
- Không có khái niệm màn hình bảo trì hay ép cập nhật.
- Reconnect bằng cách gửi lại chuỗi sự kiện từ lúc rớt.
- Đo thời gian vào game trên WiFi văn phòng rồi kết luận là nhanh.
- Trả lời tuyến chỉ có đường thành công, không nói được nhánh hỏng nào.

**Số / ví dụ nên thuộc**

- Access token 15–60 phút, refresh token dài hạn.
- Giữ chỗ khi rớt giữa trận: **30–60 giây**.
- Ngân sách chạm icon tới sảnh: **dưới 5 giây**; riêng master data khi cache còn hợp lệ dưới 0,5 giây.
- Room tick 20Hz; kết quả trận đi qua API, không ghi thẳng.

**Kể trong dự án**

- *"Anh làm khúc nào của tuyến này?"* → Chọn một khúc và kể sâu thay vì kể lướt cả mười ba mốc. Khúc idempotency và khúc reconnect là hai khúc dễ gây ấn tượng nhất vì chúng có tình huống thật.
- *"Khó khăn gặp phải?"* → Mẫu tốt và rất thật: báo cáo "mất đồ" từ người chơi mà log không thấy lỗi nào. Kể quá trình lần ra là client retry khi timeout trong lúc server đã ghi xong, và cách thêm request id để chặn. Câu chuyện này chứng minh bạn đã gỡ lỗi trên hệ thống thật, không chỉ đọc lý thuyết.
- *"Anh đo được cải thiện gì?"* → Nếu có số thì nói số: thời gian vào sảnh từ 9 giây xuống 4, tỉ lệ bỏ ở màn loading giảm bao nhiêu. Không có số thì nói thẳng là không đo được và vì sao — tốt hơn nhiều so với bịa một con số không chống đỡ nổi câu hỏi tiếp theo.
