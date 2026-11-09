---
id: interview-live-service
title: Client game live-service — câu hỏi phỏng vấn
icon: 📡
summary: Ngân hàng câu hỏi và kiến thức cô đọng về client game live-service — ranh giới client/server, boot và master data, mạng, gacha, IAP, event/collab, màn hình meta, save, co-op realtime, vận hành, kiến trúc client — cho vòng phỏng vấn hỏi theo CV.
status: deep
read: 1126
level: advanced
order: 24
tags: [interview, live-ops, client-server, gacha, iap]
related: [interview-cv, client-server-flow, project-contract, liveops, unity-network-client]
---

Game live-service sống bằng một thứ: **nội dung đổi liên tục mà không cần người chơi cập nhật app**. Vì vậy câu hỏi phỏng vấn client ở loại game này (RPG anime kiểu gacha, sống bằng event và collab, có co-op realtime) hiếm khi hỏi thuật toán. Chúng hỏi: *"server nói gì thì client tin, client tự quyết gì, và mạng rớt giữa chừng thì sao?"* Node này gom mười một mảng kiến thức, mỗi mảng kèm bảng "câu hỏi → ý bắt buộc"; phần câu hỏi đầy đủ nằm ở mục 🎤 cuối file.

Cách dùng: đọc thân bài một lượt, rồi sang 🎤 luyện nói. Mọi câu trả lời nên bám một khuôn: **client làm gì → server làm gì → hỏng ở đâu thì người chơi thấy gì**. Khuôn này lấy từ [[client-server-flow]] và [[project-contract]]; khi kể "tôi đã làm", hãy kể ở mức chung (hệ thống nào, ràng buộc nào, đánh đổi nào), không kể chi tiết nội bộ của công ty cũ.

## 1. Ranh giới client/server

Nguyên tắc nền: **server là nguồn chân lý (authoritative)**. Client là lớp hiển thị cộng bộ gom ý định: nó gửi "tôi muốn quay banner X mười lần" chứ không bao giờ gửi "tôi vừa trúng nhân vật Y". Mọi thứ liên quan ví, vật phẩm, tiến trình, pity, xếp hạng do server tính; client chỉ hiển thị kết quả server trả về.

| Việc | Ai quyết | Client được làm gì |
|---|---|---|
| Số dư, inventory, pity | Server | Hiển thị bản cache, cập nhật khi có phản hồi |
| Kết quả quay, phần thưởng | Server | Diễn hoạt kết quả đã nhận |
| Bảng cân bằng, tỉ lệ | Server phát hành (master data) | Đọc, không hardcode |
| Hiệu ứng, âm thanh, chuyển cảnh | Client | Toàn quyền |
| Tính trước để hiển thị (ví dụ "đủ tiền?") | Client dự đoán | Chỉ để bật/tắt nút; server vẫn kiểm lại |

**Idempotency** là chữ phải thuộc: mọi lệnh làm đổi ví tiền mang một id do client sinh, server ghi nhớ; gửi lại cùng id thì trả kết quả cũ, không thực hiện lần hai. Id phải **sống qua lần mở lại app** (ghi xuống đĩa trước khi gửi), vì app có thể bị kill giữa lúc mạng rớt. Chi tiết ở [[unity-network-client]].

| Câu hỏi | Ý bắt buộc |
|---|---|
| Vì sao client không được tự tính kết quả quay? | Sửa bộ nhớ là gian lận; server là nguồn chân lý; client chỉ gửi ý định |
| Idempotency key sinh ở đâu, sống bao lâu? | Client sinh theo hành động, ghi đĩa trước khi gửi, server lưu cùng transaction |
| Dự đoán phía client dùng ở đâu? | Chỉ bật/tắt nút, không ghi trạng thái; server kiểm lại |

## 2. Boot, đăng nhập, master data, version check

Luồng khởi động điển hình (mười ba mốc đầy đủ ở [[client-server-flow]]): hỏi **config** (không cần đăng nhập, sống cả khi mọi thứ khác chết) → so version app, kiểm bảo trì → đăng nhập lấy access token + refresh token → tải **master data** theo version (hoặc dùng cache nếu server trả `304`) → lấy trạng thái người chơi → vào sảnh.

- **Force update**: config trả `min_version`; app thấp hơn thì chặn và dẫn tới store. Đừng để người chơi bản cũ gọi API mới rồi nhận lỗi khó hiểu.
- **Maintenance**: endpoint config là chỗ duy nhất bật được màn hình bảo trì. Nếu nó nằm sau đăng nhập thì đúng lúc hệ thống đăng nhập chết, bạn mất luôn khả năng báo cho người chơi.
- **Master data** ([[master-data]]): bảng cân bằng dùng chung, có version, cache được; tách hẳn dữ liệu người chơi (riêng từng người, không cache lâu). Gộp hai thứ vào một endpoint là mất khả năng cache.
- **Tải asset**: catalog Addressables so hash, tải bundle đổi ([[unity-addressables]]). Catalog phải khớp bản app.
- Ngân sách thời gian trong node tuyến: tổng tới màn sảnh dưới 5 giây; cho vào sảnh khi có dữ liệu tối thiểu, nạp phần còn lại ở nền.

| Câu hỏi | Ý bắt buộc |
|---|---|
| Vì sao config tách khỏi đăng nhập? | Bật bảo trì và ép cập nhật khi auth chết |
| Master data đổi thì client biết bằng gì? | Version/hash trong config; khác thì tải, giống thì dùng cache |
| Mở app mất bao lâu là chấp nhận được? | Dưới 5 giây tới sảnh; nạp phụ ở nền, khoá nút chưa sẵn sàng |

## 3. Mạng: gRPC/REST, timeout, retry, mất mạng, giờ server

Lớp network là **một ApiClient duy nhất** ([[unity-network-client]]), không phải `UnityWebRequest` rải khắp màn hình. Nó lo: base URL theo môi trường, timeout (10 giây cho request thường, 30 giây cho tải file lớn), token refresh, map mã lỗi, huỷ khi đổi scene.

- **Retry theo nhóm mã lỗi**: mất mạng/timeout/5xx/`TEMP_*` thì retry 1s → 2s → 4s cộng jitter 0–500ms, tối đa 3 lần; `RATE_*` chờ đúng `retry_after`; lỗi nghiệp vụ (không đủ tiền, hết hàng, client quá cũ) không bao giờ retry. Lệnh đổi ví chỉ retry khi có idempotency key.
- **Hàng đợi**: lệnh không được phép mất ghi xuống đĩa kèm key trước khi gửi, gửi lại khi có mạng.
- **Token**: chỉ một lần refresh dùng chung khi nhiều request cùng gặp `AUTH_*`, rồi thử lại đúng một lần.
- **gRPC/protobuf** ([[go-protobuf]]): schema chung hai đầu, gọn hơn JSON, nhưng quy tắc retry/idempotency y hệt REST; thêm field mới được, không đổi số hiệu field cũ.
- **Giờ server**: reset, event bắt đầu/kết thúc, đếm ngược đều theo giờ server. Client lấy chênh lệch (offset) giữa đồng hồ máy và `server_time` trong phản hồi để hiển thị đếm ngược; không bao giờ tin đồng hồ máy cho quyết định.
- Thử với mạng giả 150ms và 5% mất gói, không phải WiFi văn phòng.

| Câu hỏi | Ý bắt buộc |
|---|---|
| Retry thế nào cho đúng? | Theo nhóm lỗi, backoff + jitter, tiền thì cần key |
| Người chơi đổi giờ máy thì sao? | Mọi mốc theo giờ server; client chỉ tính offset để hiển thị |
| Mất mạng giữa lúc mua? | Khoá nút, key ghi đĩa, hỏi lại trạng thái bằng cùng key |

## 4. Gacha phía client

Client không quay. Luồng ([[screen-gacha]]): người chơi chọn banner → client gửi `request_id` + banner + số lượt → server trong **một transaction** trừ tiền, quay, cộng vật phẩm, cập nhật pity, ghi sổ → trả kết quả → client **diễn hoạt kết quả đã có**. Animation chỉ là trình chiếu; bỏ qua được (skip) vì kết quả đã nằm trong tay từ trước.

- **Tỉ lệ công bố**: lấy từ master data, không hardcode; phải khớp code server (rủi ro pháp lý thật tuỳ thị trường). Pity làm tỉ lệ thực khác tỉ lệ danh nghĩa, nên công bố cả hai ([[randomness]], [[economy-design]]).
- **Bộ đếm pity** hiển thị thẳng trên màn nhưng server giữ; client chỉ vẽ.
- **Chống bấm hai lần**: bấm là khoá nút ngay, request mang `request_id`; bấm lại hoặc retry vẫn cùng id nên không trừ hai lần.
- **Mất mạng giữa chừng**: không biết server đã quay chưa. Hỏi lại bằng cùng `request_id` để nhận kết quả cũ, đừng cho quay mới.
- Kết quả quay nên được lưu phía server để màn lịch sử và hỗ trợ khách hàng đối soát.

| Câu hỏi | Ý bắt buộc |
|---|---|
| Client làm gì trong gacha? | Gửi ý định + request_id, diễn hoạt kết quả server trả |
| Skip animation có ảnh hưởng gì? | Không; kết quả có trước animation |
| Pity nằm đâu? | Server giữ, client hiển thị, lưu cả vào save phía server |

## 5. IAP

Luồng sáu bước ([[screen-shop]], [[unity-monetization-sdk]]): lấy danh mục và giá từ store → người chơi bấm mua, khoá nút → store thu tiền, trả **receipt** → client gửi receipt lên server kèm `request_id` → **server verify bằng cách hỏi thẳng store**, cộng vật phẩm trong một transaction → **chỉ sau đó** client mới `finish/consume` với store.

- Thứ tự hai bước cuối là thứ tự quan trọng nhất: nếu confirm với store trước khi server cộng đồ, rồi mạng rớt, người chơi mất tiền thật mà không có đồ.
- **Giao dịch treo (pending)**: store đã thu tiền nhưng chưa finish. Lúc mở app, client duyệt các giao dịch chưa finish và gửi lại cho server (server chặn trùng bằng `transaction_id UNIQUE`).
- **Deferred/Ask-to-Buy**: trạng thái thật; không trao đồ khi chưa hoàn tất.
- **Restore**: bắt buộc trên iOS cho hàng không tiêu hao; với hàng tiêu hao thì dựa vào giao dịch treo.
- Số cần theo dõi: tỉ lệ verify thất bại và số giao dịch treo mỗi ngày (gần 0).

| Câu hỏi | Ý bắt buộc |
|---|---|
| Vì sao verify ở server? | Client bị sửa được; receipt chỉ đáng tin khi server hỏi store |
| Mạng rớt sau khi store thu tiền? | Giao dịch treo, khôi phục lúc mở app, server idempotent |
| Khi nào finish? | Sau khi server đã cộng đồ xong |

## 6. Event và collab

Event là cách game live-service sống: bật/tắt bằng **dữ liệu**, không bằng bản build mới ([[liveops]]).

- **Bật theo thời gian server**: master data hoặc feature flag mô tả `start_at`/`end_at`; client hiển thị banner, đếm ngược, theo giờ server. Server vẫn kiểm lại khi nhận lệnh (client thấy event còn nhưng server đã đóng thì từ chối).
- **Asset event qua Addressables/CDN**: nhân vật collab, banner, nhạc nằm trong bundle remote; tải trước khi event mở (pre-download) để ngày mở không dội CDN cùng lúc. Cắt group theo lúc nội dung được cần: mỗi event một group, xoá/bỏ được khi hết.
- **Dọn khi hết event**: `Release` handle đúng đối ứng, bỏ tham chiếu từ UI, xoá cache bundle không còn cần, để đĩa không phình qua nhiều mùa.
- **Đổi số không cần bản mới, đổi logic thì cần**. Kill switch cho tính năng lỗi; bật dần 5% → 50% → 100% với ít nhất một giờ mỗi bậc.
- Collab thường kèm bản quyền hạn chế thời gian: hết hạn là phải gỡ đúng giờ, cho nên giờ server là bắt buộc.

| Câu hỏi | Ý bắt buộc |
|---|---|
| Event mới ra không cần build mới, làm thế nào? | Dữ liệu (master/flag) + asset remote qua catalog |
| Hết event thì client làm gì? | Ẩn UI theo giờ server, release asset, dọn cache |
| Bật event cho 100% ngay có sao không? | Nên bật dần; sai là hàng triệu người chịu |

## 7. Màn hình meta

Home, shop, mission, present box, ranking, guild, chat: nhóm màn hình dựa trên cùng bộ ba **cache – chấm đỏ – làm mới** ([[meta-systems]], [[screen-home]]).

- **Cache**: hiện bản cache ngay (số dư, danh sách), cập nhật khi có phản hồi; dữ liệu event cache không quá vài phút. Mất mạng thì khoá nút ghi, hiện nhãn "đang đồng bộ".
- **Chấm đỏ** ([[screen-home]]): sinh từ trạng thái server (quà chưa nhận, nhiệm vụ xong chưa nhận), không client tự suy. Vì thế "đã hoàn thành" và "đã nhận" phải là hai trạng thái riêng ([[screen-mission]]).
- **Mission**: reset theo giờ server, lazy khi mở màn; phần thưởng chưa nhận khi reset chuyển vào hộp quà.
- **Present box** ([[screen-presentbox]]): hộp quà là nơi mọi phần thưởng "không có chỗ để" đổ vào; nhận có `request_id`, có hạn dùng, nhận hàng loạt phải chịu được thất bại một phần.
- **Ranking** ([[screen-ranking]]): bảng xếp hạng có độ trễ chấp nhận được; phân trang, cache vài chục giây, hiển thị hạng của mình riêng.
- **Guild/chat**: chat đi kênh riêng (WebSocket), không retry mù, tin nhắn lỗi hiện dấu chấm than; lịch sử tải theo trang; lọc từ cấm thuộc server.

| Câu hỏi | Ý bắt buộc |
|---|---|
| Chấm đỏ tính ở đâu? | Từ trạng thái server, có hai trạng thái xong/đã nhận |
| Mở màn lúc mất mạng? | Cache + khoá nút ghi + nhãn đồng bộ |
| Làm mới khi nào? | Khi vào màn, sau hành động, và theo sự kiện; không poll dày |

## 8. Dữ liệu local và save

Với game server-authoritative, **save thật nằm ở server**; local chỉ là cache và những thứ thuộc về thiết bị ([[unity-save-data]]).

- Local giữ: token, cài đặt (âm lượng, ngôn ngữ), cache master data, cache asset, hàng đợi lệnh chờ gửi, idempotency key chưa xong, tiến trình tutorial nếu server chưa biết.
- Không giữ làm nguồn chân lý: ví, inventory, pity. Nếu cache thì ghi rõ phiên bản và coi là hết hạn khi có phản hồi mới.
- `PlayerPrefs` cho cài đặt nhỏ; token/khoá nên lưu chỗ an toàn hơn (Keychain/Keystore qua plugin). File JSON có version để migrate khi đổi schema.
- **Chuyển máy / đăng nhập lại**: danh tính gắn tài khoản (liên kết Apple/Google/mã chuyển dữ liệu), không gắn thiết bị; dữ liệu về lại từ server.
- Xoá cache không được làm mất tiến trình; nếu mất tiến trình khi xoá cache nghĩa là local đang giữ thứ không được giữ.

| Câu hỏi | Ý bắt buộc |
|---|---|
| Cái gì lưu local? | Cài đặt, token, cache, hàng đợi lệnh; không giữ ví làm chân lý |
| Cache hỏng thì sao? | Xoá và tải lại từ server, không mất tiến trình |
| Đổi schema save local? | Có version và hàm migrate |

## 9. Realtime và co-op

Kiểu co-op real-time (phòng nhỏ, vài người chơi cùng một trận) khác hẳn phần HTTP ở trên ([[unity-multiplayer]], [[go-matchmaking]]).

- **Phòng và matchmaking**: client xếp hàng qua API, nhận `room_token` có hạn ngắn và địa chỉ phòng, rồi mở kết nối tới đúng phòng. Với Photon thì khái niệm tương đương là room/lobby; phần ghép trận có thể do dịch vụ của bên thứ ba hoặc server riêng.
- **Đồng bộ trạng thái**: ai là nguồn chân lý? Server-authoritative (an toàn, cần prediction) hay một client làm host (rẻ, chấp nhận gian lận trong co-op). Gửi input có số thứ tự tick; người khác hiển thị trễ 2–3 tick để nội suy mượt.
- **Reconnect**: state gắn `player_id` ổn định (không phải id kết nối); phòng giữ chỗ 30–60 giây; mở lại bằng `room_token` cũ và nhận **snapshot đầy đủ**, không phải chuỗi delta. App xuống nền quá timeout cũng là disconnect, nên reconnect là đường về của một phần lớn phiên chơi.
- **Kết quả trận** đi qua API, không phải room ghi thẳng database, để mọi thay đổi ví/xếp hạng qua một đường ghi duy nhất.
- Test với Network Simulator (latency 150ms, jitter 20ms, mất gói 3%).

| Câu hỏi | Ý bắt buộc |
|---|---|
| Rớt mạng giữa trận? | player_id ổn định, giữ chỗ, snapshot đầy đủ khi quay lại |
| Ai là chân lý trong co-op? | Tuỳ: server cho công bằng, host cho rẻ; nêu đánh đổi |
| Kết quả trận ghi ở đâu? | Qua API trong một transaction, kèm match id idempotent |

## 10. Vận hành: log, crash, analytics, A/B, hotfix

Game live-service được đo từng ngày ([[liveops]]).

- **Crash report** (ví dụ Crashlytics hoặc tương đương) gắn thêm: version app, master version, user id đã ẩn, vài breadcrumb (màn hình, API cuối). Crash-free sessions dưới 99% là có vấn đề.
- **Log mạng** ở client: endpoint, mã lỗi, độ trễ, số lần retry; không log token hay dữ liệu cá nhân.
- **Analytics**: funnel onboarding, D1/D7, ARPDAU, thời lượng phiên, chia theo dòng máy. Sự kiện đặt tên thống nhất và có version schema.
- **A/B và remote config**: biến thể do server gán, client chỉ đọc; schema validate phía client (giá trị ngoài khoảng thì dùng mặc định).
- **Hotfix**: đổi số thì remote config/master data (khoảng 15 phút); asset sai thì đẩy bundle mới qua catalog; đổi **logic code** thì phải bản build mới và chờ store duyệt (2–3 ngày). Kill switch là lớp cứu cuối.

| Câu hỏi | Ý bắt buộc |
|---|---|
| Bug lúc 9 giờ sáng, sửa thế nào? | Phân loại: số/asset/code, chọn đường nhanh nhất |
| Crash chỉ ở vài máy? | Chia theo thiết bị/OS, tái hiện bằng đúng dòng máy |
| Vì sao validate remote config? | Không qua vòng duyệt nào, tới tay mọi người |

## 11. Kiến trúc client

Mục tiêu: sáu tháng sau đổi một API không phải sửa bốn mươi màn hình ([[project-architecture]]).

- **Tách tầng**: Network (ApiClient, DTO, protobuf) → Model/Repository (cache, logic dữ liệu, không biết UI) → View (prefab, animation). Giữa Model và View là Presenter/ViewModel (MVP/MVVM). View không gọi mạng; Presenter không biết `GameObject`.
- **DI** (VContainer, Zenject hoặc tay): để thay ApiClient thật bằng bản giả khi test; vòng đời Singleton/Scoped rõ ràng.
- **Server giả (mock/fake)**: interface `IApi` có bản thật và bản giả trả JSON mẫu; chạy được cả tình huống lỗi (timeout, 500, `ECON_*`). Test logic Model bằng EditMode test, không cần Unity chạy cảnh.
- **Quản lý màn hình**: stack màn hình/popup, mỗi màn tự `Release` asset của mình; luồng mở/đóng đi qua một chỗ.
- **Hợp đồng**: schema/proto là hợp đồng giữa hai đội; đổi theo hướng tương thích ngược ([[project-contract]]).

| Câu hỏi | Ý bắt buộc |
|---|---|
| Vì sao tách network khỏi view? | Test được, đổi API không sửa UI, tái dùng retry/lỗi |
| Test thế nào khi chưa có server? | Interface + bản giả, kịch bản lỗi chủ động |
| MVP khác MVC thế nào ở Unity? | View thụ động, Presenter giữ logic, Model không biết UI |

## 🤖 Prompt cho AI

**Dùng AI thế nào cho ôn phỏng vấn client live-service**

Giao được: sinh câu hỏi đào sâu theo từng mảng, đóng vai người phỏng vấn kỹ thuật phía studio Nhật, chấm câu trả lời nói bằng văn bản theo khuôn "client làm gì → server làm gì → hỏng thì người chơi thấy gì", vẽ lại luồng IAP/gacha để bạn tự kể. **Không giao**: kể "kinh nghiệm" thay bạn, vì AI sẽ chế ra dự án và con số nghe hợp lý; cũng không giao quyết định "lệnh nào cần idempotency" cho nó, vì nó có xu hướng retry mọi thứ.

Quy trình ba lượt: (1) bạn tự trả lời câu hỏi trước, không nhìn đáp án; (2) AI chấm theo bảng ý bắt buộc của mảng đó, chỉ ra ý thiếu và chỗ nói chung chung; (3) AI hỏi tiếp một câu đào sâu mà bạn buộc phải trả lời có "vì".

**Phải nêu rõ** (thiếu là AI tự bịa):
- Vai trò thật của bạn trong các mảng (client gacha? IAP? chat?) — mảng nào chưa từng làm thì nói rõ để AI không đẩy bạn nhận mình đã làm.
- Công ty mục tiêu và tựa game (RPG gacha có event/collab, hay co-op realtime), để câu hỏi đúng bối cảnh.
- Công nghệ bạn thật sự dùng: gRPC hay REST, Photon hay tự host, Addressables, Unity IAP.
- Mức đáp án mong muốn: Junior, Mid hay Senior; thời lượng mỗi câu (60 giây nói miệng).
- Điều cấm kể: thông tin nội bộ công ty cũ (tên bảng, endpoint thật, số liệu doanh thu).

**Mẫu prompt**

```
Đóng vai người phỏng vấn Senior Unity cho studio game RPG live-service (gacha, event/collab,
co-op realtime). Mảng hôm nay: <ví dụ: IAP và giao dịch treo>.
Tôi trả lời bằng chữ như đang nói miệng, tối đa 6 câu.

Với mỗi câu tôi trả lời:
1. Chấm theo ba ý: client làm gì / server làm gì / hỏng thì người chơi thấy gì.
2. Liệt kê ý bắt buộc tôi thiếu (ví dụ: finish sau khi server cộng đồ, request_id).
3. Chỉ ra câu nào chung chung hoặc không có chữ "vì".
4. Hỏi tiếp một câu đào sâu duy nhất.

Ràng buộc:
- KHÔNG bịa dự án, số liệu hay kinh nghiệm thay tôi; chỗ nào cần ví dụ thì hỏi lại tôi.
- KHÔNG khen chung chung; chỉ ra lỗi cụ thể.
- KHÔNG gợi ý tôi nói tên endpoint/bảng/số liệu nội bộ công ty cũ.
- Mức câu hỏi: <Mid/Senior>.
```

**Bẫy thường gặp:** AI chấm "đúng" mọi câu trả lời trôi chảy dù thiếu cơ chế, vì văn phong tốt đánh lừa nó; hãy ép nó đối chiếu với danh sách ý bắt buộc. Bẫy thứ hai: nó mặc định luồng IAP kiểu "client mua rồi client cộng đồ" vì đó là mẫu phổ biến, trái hẳn mô hình server-authoritative. Bẫy thứ ba: nó bịa số (tỉ lệ pity, thời gian retry) nghe thật; con số chỉ lấy từ các node trong kho. Bẫy thứ tư: nó khuyến khích bạn khoe nhiều hơn những gì đã làm, và người phỏng vấn đào ba câu là lộ.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Server authoritative nghĩa là gì, client còn làm gì?**
  → Mọi thứ liên quan ví, vật phẩm, pity, xếp hạng do server tính và giữ; client chỉ gửi ý định ("quay banner X mười lượt") rồi hiển thị kết quả server trả về. Client vẫn lo toàn bộ phần hiển thị: UI, animation, âm thanh, dự đoán để bật/tắt nút. Làm vậy vì client chạy trên máy người chơi, sửa bộ nhớ là gian lận được.
- `Junior` **Idempotency key là gì, vì sao cần?**
  → Là một id do client sinh cho mỗi hành động đổi ví; server lưu id đó và nếu nhận lại cùng id thì trả kết quả cũ chứ không làm lần hai. Ví dụ người chơi bấm mua, 4G rớt đúng lúc server đã trừ tiền nhưng phản hồi chưa về, client retry: không có key thì trừ hai lần. Cần vì mạng di động chắc chắn rớt ở những lúc tệ nhất.
- `Junior` **Vì sao cần endpoint config gọi trước cả đăng nhập?**
  → Đó là chỗ duy nhất bật được màn hình bảo trì và ép cập nhật bản cũ, nên nó phải không cần đăng nhập. Nếu nằm sau auth thì đúng lúc hệ thống đăng nhập chết, người chơi chỉ thấy app treo. Trả về `min_version` và version master data để client biết có phải cập nhật hay tải lại dữ liệu không.
- `Junior` **Master data là gì, khác dữ liệu người chơi thế nào?**
  → Master data là bảng cân bằng dùng chung cho mọi người (vật phẩm, giá, tỉ lệ rơi), có version và cache được; dữ liệu người chơi là ví, inventory, tiến trình, riêng từng người và không cache lâu. Tách hai loại để cache được thứ đáng cache nhất: gộp chung một endpoint thì mỗi lần mở app đều tải lại cả bảng. Master đổi version thì client tải bản mới, không đổi thì dùng cache (`304`).
- `Mid` **Request nào được retry, request nào không?**
  → Theo nhóm mã lỗi: mất mạng, timeout, 5xx thì retry 1s, 2s, 4s cộng jitter 0–500ms, tối đa ba lần; bị giới hạn tần suất thì chờ đúng `retry_after`. Lỗi nghiệp vụ như không đủ tiền hay client quá cũ thì không bao giờ retry vì nó không tự khỏi. Lệnh đổi ví chỉ retry khi mang idempotency key.
- `Mid` **Người chơi đổi giờ đồng hồ máy để gian lận event, anh chặn thế nào?**
  → Mọi mốc quan trọng (bắt đầu/kết thúc event, reset nhiệm vụ) theo giờ server, và server kiểm lại khi nhận lệnh. Client chỉ lấy offset giữa đồng hồ máy và `server_time` trong phản hồi để vẽ đếm ngược. Làm vậy vì đồng hồ máy là thứ người chơi sửa được còn server thì không.
- `Mid` **Mất mạng đúng lúc bấm quay gacha. Làm gì cho người chơi không mất lượt và không bị trừ hai lần?**
  → Client khoá nút và gửi kèm `request_id` ghi xuống đĩa trước khi gửi. Khi có mạng lại, client hỏi lại bằng cùng `request_id`: server hoặc trả kết quả đã quay, hoặc báo chưa xử lý thì mới thực hiện. Không bao giờ cho quay mới vì không biết lần trước đã xảy ra chưa.
- `Mid` **Animation gacha dài, người chơi bấm skip. Kết quả có bị ảnh hưởng không?**
  → Không, vì kết quả đã được server tính và trả về trước khi animation bắt đầu; animation chỉ là trình chiếu. Skip chỉ nhảy tới màn kết quả, nhưng vẫn phải đảm bảo vật phẩm hiện đúng danh sách server trả. Thiết kế ngược lại (animation quyết kết quả) vừa mở đường gian lận vừa không skip được.
- `Mid` **Tỉ lệ gacha hiển thị cho người chơi lấy từ đâu?**
  → Từ master data do server phát hành, cùng nguồn với tỉ lệ server dùng để quay, không hardcode trong client. Vì tỉ lệ công bố phải khớp code tuỳ thị trường có quy định pháp lý, và hardcode thì đổi banner phải ra bản mới. Nếu có pity, công bố cả tỉ lệ danh nghĩa lẫn cách tính pity.
- `Mid` **Bộ đếm pity nên lưu ở đâu, client hiển thị thế nào?**
  → Server giữ và cập nhật trong cùng transaction với lần quay; client nhận `pity_after` trong phản hồi và chỉ vẽ lên màn. Lưu ở client thì người chơi sửa bộ nhớ là có pity vô hạn, và thoát game giữa chừng có thể mất đếm. Hiển thị thẳng dạng "còn 23 lượt" vừa minh bạch vừa là động lực chơi.
- `Mid` **Luồng IAP anh làm từ lúc bấm mua tới lúc nhận đồ?**
  → Lấy giá từ store, khoá nút, store thu tiền trả receipt, client gửi receipt kèm `request_id` lên server, server hỏi thẳng store để verify rồi cộng đồ trong một transaction, cuối cùng client mới finish với store. Thứ tự hai bước cuối quan trọng nhất vì finish trước khi server cộng mà mạng rớt thì người chơi mất tiền thật mà không có đồ.
- `Mid` **Giao dịch treo là gì, xử lý thế nào?**
  → Là giao dịch store đã thu tiền nhưng client chưa finish, thường vì app bị tắt hoặc mạng rớt giữa chừng. Lúc mở app, client duyệt các giao dịch chưa finish và gửi lại cho server; server chặn trùng bằng `transaction_id` duy nhất nên cộng một lần thôi. Bỏ nhánh này là người chơi mất tiền và bạn chỉ biết qua khiếu nại.
- `Senior` **Vì sao không cộng đồ ở client rồi verify sau cho mượt?**
  → Vì mở đường cho gian lận: kẻ gian giả receipt hoặc chặn mạng, client đã cộng đồ rồi và server không còn cách thu hồi sạch. Chấp nhận chờ thêm một nhịp (hiện trạng thái "đang xác nhận") còn hơn cho không hàng thật. Phần mượt có thể bù bằng UI lạc quan nhưng không được ghi trạng thái.
- `Mid` **Event mới ra mà không cần build mới, hệ thống làm thế nào?**
  → Hai thứ đi bằng dữ liệu: master data/feature flag mô tả event với `start_at` và `end_at` theo giờ server, và asset event nằm trong bundle remote qua catalog Addressables. Client thấy event trong dữ liệu thì hiện banner và tải bundle. Chỉ đổi số và nội dung được; đổi logic thì vẫn phải ra bản build mới.
- `Mid` **Asset event lớn, ngày mở mà cả triệu người cùng tải thì sao?**
  → Tải trước (pre-download) bundle của event sắp mở lúc ở nền hoặc qua Wi-Fi, để ngày mở chỉ cần bật cờ. Mỗi event một group riêng để tải đúng cái cần, không kéo cả game. Làm vậy vì dồn tải CDN vào một giờ vừa chậm vừa dễ sập, trong khi người chơi đang háo hức nhất.
- `Mid` **Hết event, client dọn gì?**
  → Ẩn UI theo giờ server, `Release` mọi handle Addressables của event (mỗi load đối ứng một release), và xoá cache bundle không còn cần. Quên release thì bundle nằm trong RAM mãi, quên xoá cache thì đĩa phình qua nhiều mùa, cả hai đều khó thấy vì chỉ lộ sau nhiều event.
- `Senior` **Bật một event lớn cho 100% người chơi cùng lúc có sao không?**
  → Nên bật dần 5% → 50% → 100%, mỗi bậc ít nhất một giờ, theo dõi crash-free và chỉ số kinh tế của event đó. Vì config tới tay mọi người trong vài phút và không qua vòng duyệt nào, nên một giá trị sai ảnh hưởng toàn bộ. Kèm kill switch để tắt tính năng lỗi trong vài phút thay vì chờ store duyệt 2–3 ngày.
- `Junior` **Chấm đỏ trên Home được tính ở đâu?**
  → Từ trạng thái server (có quà chưa nhận, nhiệm vụ xong chưa nhận), client chỉ hiển thị. Muốn vậy phải có hai trạng thái riêng "đã hoàn thành" và "đã nhận thưởng"; gộp làm một thì không còn cơ sở tính chấm đỏ. Client tự suy chấm đỏ sẽ lệch với server sau mỗi lần đổi giờ hay mất mạng.
- `Mid` **Mở màn nhiệm vụ lúc mất mạng thì hiển thị gì?**
  → Hiện tiến độ cache lần trước, khoá nút nhận thưởng, và gắn nhãn "đang đồng bộ" để người chơi biết số liệu có thể cũ. Không cho nhận khi offline vì nhận là lệnh đổi ví cần server. Khi có mạng lại thì làm mới và mở khoá nút.
- `Mid` **Người chơi xong nhiệm vụ lúc 23h50, reset lúc 0h chưa kịp nhận. Xử lý sao?**
  → Phần thưởng không được mất vì đó là lỗi hệ thống chứ không phải của họ; khi reset, server chuyển phần thưởng chưa nhận vào hộp quà. Client hiển thị hộp quà như thường, kèm hạn dùng. Reset chạy lazy khi người chơi mở màn thay vì quét toàn bộ tài khoản, vì job quét lúc 0h tự tạo đỉnh tải.
- `Mid` **Hộp quà (present box) client cần để ý gì?**
  → Nhận có `request_id` như mọi lệnh đổi ví, có hạn dùng hiển thị rõ, và nhận hàng loạt phải chịu được thất bại một phần (một món hết hạn, món khác thành công). Hộp quà là nơi mọi thứ "không có chỗ để" đổ vào, ví dụ kho đầy, nên nó là nguồn khiếu nại nếu mất đồ. Hiển thị kết quả nhận từng món để người chơi thấy rõ.
- `Mid` **Bảng xếp hạng client hiển thị, cần lưu ý gì?**
  → Phân trang, cache vài chục giây thay vì tải lại mỗi lần mở, và hiển thị hạng của chính mình riêng ngay cả khi nằm ngoài trang đầu. Xếp hạng chấp nhận trễ, vì tính lại realtime cho hàng triệu người rất đắt. Hạng do server tính; client không tự sắp xếp thứ gì có ý nghĩa thi đấu.
- `Mid` **Chat trong guild anh thiết kế phía client thế nào?**
  → Đi kênh riêng (WebSocket) tách khỏi API thường, không retry mù: tin gửi lỗi hiện dấu chấm than cho người chơi bấm gửi lại. Lịch sử tải theo trang, cuộn lên mới tải thêm. Việc lọc từ cấm và chống spam để server làm vì client lọc được thì cũng bị bypass được.
- `Junior` **Dữ liệu nào nên lưu local, dữ liệu nào không?**
  → Local giữ token, cài đặt (âm lượng, ngôn ngữ), cache master data và asset, hàng đợi lệnh chờ gửi cùng idempotency key chưa xong. Không giữ ví, inventory, pity làm nguồn chân lý vì save thật nằm ở server. Xoá cache mà mất tiến trình nghĩa là local đang giữ thứ không được giữ.
- `Mid` **Đổi schema file save/cache local giữa hai bản app thì xử lý thế nào?**
  → File lưu kèm số version, và có hàm migrate từng bước từ version cũ lên mới khi đọc. Với cache thì đơn giản hơn: version lệch thì bỏ và tải lại từ server. Làm vậy vì người chơi cập nhật app mà không xoá dữ liệu cũ, và crash vì parse sai là lỗi dễ tránh nhất.
- `Senior` **Người chơi đổi điện thoại, dữ liệu về lại bằng cách nào?**
  → Danh tính gắn tài khoản chứ không gắn thiết bị: liên kết Apple/Google hoặc mã chuyển dữ liệu, rồi đăng nhập lại và kéo toàn bộ trạng thái từ server. Nếu chỉ dựa vào device id thì mất máy là mất acc, đặc biệt với người đã nạp tiền thật. Local chỉ có cache nên không có gì phải "chuyển".
- `Mid` **Rớt mạng giữa trận co-op, hệ thống xử lý thế nào?**
  → State gắn `player_id` ổn định chứ không phải id kết nối; phòng giữ chỗ 30–60 giây. Client mở lại kết nối bằng `room_token` cũ và nhận một snapshot đầy đủ, không phải chuỗi delta từ lúc rớt. Cần thiết kế sẵn vì mobile xuống nền quá timeout là bị coi như rớt mạng.
- `Mid` **Vì sao reconnect gửi snapshot đầy đủ thay vì các gói delta bị lỡ?**
  → Vì ghép delta sau khi mất gói là nguồn bug không tái hiện được: lỡ một gói là mọi gói sau sai. Snapshot đầy đủ đặt lại trạng thái về đúng, rồi delta mới tiếp tục từ đó. Giá là một gói lớn hơn một lần, rẻ hơn nhiều so với state lệch.
- `Senior` **Co-op nên server-authoritative hay một client làm host?**
  → Tuỳ ràng buộc: host rẻ (không tốn server game) và mượt cho chính nó, nhưng host có lợi thế 0ms, host thoát là hết trận, và gian lận được. Server-authoritative tốn hạ tầng và cần prediction cho nhân vật mình, nhưng công bằng và đối soát được. Với co-op nhịp chậm không có xếp hạng thì host chấp nhận được; có xếp hạng hoặc thưởng giá trị thì chọn server.
- `Mid` **Người chơi khác trên màn hình bị giật hoặc "dịch chuyển tức thời", anh sửa thế nào?**
  → Hiển thị người khác ở quá khứ 2–3 tick và nội suy giữa hai snapshot, thay vì vẽ ngay vị trí mới nhất. Đổi lại họ chậm khoảng 67–100ms ở tick 30, nhưng mượt. Còn nhân vật của mình cần client-side prediction để không bị trễ khi bấm.
- `Mid` **Kết quả trận co-op tới ví người chơi bằng đường nào?**
  → Phòng gửi kết quả sang API (kèm match id làm khoá idempotent), API ghi một transaction cập nhật ví và xếp hạng; phòng không chạm database. Một đường ghi duy nhất thì mới đối soát được, và phòng chết giữa chừng không để lại ví nửa vời. Phần thưởng tới chậm vài giây là cái giá chấp nhận được.
- `Mid` **Có bug chỉ xảy ra với một số người chơi, anh tìm thế nào?**
  → Xem crash report và log có gắn version app, master version, dòng máy, vài breadcrumb (màn hình cuối, API cuối), rồi chia theo thiết bị/OS để khoanh vùng. Sau đó tái hiện đúng dòng máy hoặc đúng dữ liệu tài khoản. Cần breadcrumb vì stack trace một mình hiếm khi nói được người chơi đã làm gì trước đó.
- `Mid` **Bug lúc 9 giờ sáng ảnh hưởng nhiều người. Sửa nhanh nhất bằng đường nào?**
  → Phân loại: sai số (giá, tỉ lệ, HP) thì sửa master data/remote config, khoảng 15 phút; sai asset thì đẩy bundle mới qua catalog; sai logic code thì phải ra bản build mới và chờ store duyệt 2–3 ngày. Trong lúc chờ, dùng kill switch tắt tính năng lỗi. Phân loại đúng trước vì chọn nhầm đường là mất hàng ngày.
- `Senior` **Vì sao config từ xa nguy hiểm, dù tiện?**
  → Vì nó tới tay mọi người trong vài phút và không qua vòng duyệt nào, một giá trị sai là sự cố toàn hệ thống. Ba lớp bảo vệ tối thiểu: validate schema phía client (ngoài khoảng thì dùng mặc định), bật dần 5% → 50% → 100%, và nhật ký ai đổi gì lúc nào. Thiếu lớp nào thì chỉ cần một lần gõ nhầm.
- `Mid` **Đo hiệu quả một thay đổi bằng A/B ở client cần chú ý gì?**
  → Biến thể do server gán cố định theo người chơi, client chỉ đọc và gửi analytics kèm tên biến thể. Đổi biến thể giữa chừng cho cùng một người làm hỏng số liệu. Đo đúng chỉ số của tính năng đó (funnel, D1/D7, ARPDAU) và chia theo dòng máy để không nhầm lỗi hiệu năng với thiết kế.
- `Junior` **Vì sao không gọi `UnityWebRequest` trực tiếp trong từng màn hình?**
  → Vì các việc chung như base URL theo môi trường, timeout, retry, refresh token, map lỗi cần nhất quán toàn app. Gọi tại chỗ thì sáu tháng sau có bốn mươi chỗ, mỗi chỗ xử lý lỗi một kiểu, đổi sang staging phải sửa cả bốn mươi. Một lớp ApiClient duy nhất sửa một chỗ là xong.
- `Mid` **Tách tầng network – model – view cụ thể ra sao ở một màn shop?**
  → Network có ApiClient và DTO; Model/Repository giữ danh mục, giá, cache và logic dữ liệu, không biết UI; Presenter nhận sự kiện từ View, gọi Model, cập nhật View; View chỉ là prefab thụ động. Làm vậy vì Model và Presenter test được trong EditMode không cần cảnh, và đổi giao diện không đụng logic mua.
- `Senior` **Test client khi server chưa xong hoặc muốn tái hiện lỗi hiếm, anh làm thế nào?**
  → Đặt `IApi` làm interface, có bản thật và bản giả (fake) trả JSON mẫu, kèm kịch bản lỗi chủ động: timeout, 500, `ECON_*`, trả trùng. Inject qua DI để test Model/Presenter bằng EditMode test. Cách này còn tái hiện được tình huống mạng rớt giữa chừng mà ngoài đời gần như không dựng lại được.
- `Senior` **Server thêm field mới vào response, client bản cũ đang chạy ngoài kia. Làm sao không vỡ?**
  → Hợp đồng đổi theo hướng tương thích ngược: thêm field mới thì client cũ bỏ qua, không đổi nghĩa hay số hiệu field cũ (với protobuf), và việc bắt buộc client mới thì dùng `min_version` ở config. Vì ở live-service luôn có nhiều bản app cùng tồn tại, không thể bắt tất cả cập nhật cùng lúc. Test hợp đồng bằng cách chạy bản client cũ với server mới.

**Khung trả lời 60 giây** — "Anh thiết kế luồng mua gacha phía client thế nào cho an toàn?"

> Nguyên tắc của tôi là client chỉ gửi ý định, còn server mới quay. Người chơi bấm quay, tôi khoá nút ngay và sinh một `request_id`, ghi xuống đĩa rồi mới gửi lên kèm banner và số lượt. Server trong một transaction trừ tiền, quay theo tỉ lệ lấy từ master data, cộng vật phẩm, cập nhật pity và ghi sổ; client nhận kết quả rồi mới diễn hoạt, nên bấm skip không ảnh hưởng gì vì kết quả có trước animation.
>
> Phần tôi coi là quan trọng nhất là mạng rớt giữa chừng: tôi không biết server đã quay chưa, nên khi có mạng lại tôi hỏi bằng đúng `request_id` cũ để nhận kết quả đã có, chứ không bao giờ cho quay mới. Retry cũng chỉ làm khi có key này. Tỉ lệ và bộ đếm pity hiển thị từ dữ liệu server, không hardcode, vì tỉ lệ công bố phải khớp code thật. Ở phía vận hành, tôi bật dần banner mới theo phần trăm và theo dõi phân bố thực tế so với tỉ lệ công bố.

**Họ sẽ đào tiếp**

- *"Nếu server trả lỗi timeout chứ không phải kết quả, client biết gì?"* → Không biết lần quay đã xảy ra chưa; vì thế hỏi lại bằng cùng `request_id`, tuyệt đối không tạo id mới.
- *"request_id sinh khi nào, lưu ở đâu?"* → Sinh khi người chơi xác nhận hành động, ghi đĩa trước khi gửi để sống qua việc app bị kill; xoá sau khi nhận phản hồi cuối.
- *"Pity tính ở client không được sao?"* → Không: sửa bộ nhớ là có pity vô hạn và dễ lệch tỉ lệ công bố; server giữ, client chỉ vẽ.
- *"Chỉ cần verify receipt phía client thôi được không?"* → Không, vì client giả được; server phải hỏi thẳng store và dùng `transaction_id` duy nhất để chặn cộng trùng.
- *"Làm sao biết tỉ lệ công bố đúng với code?"* → Cùng nguồn master data, và test quay số lượng lớn rồi so phân bố thực tế với tỉ lệ công bố.
- *"Hai thiết bị cùng bấm quay một lúc thì sao?"* → Server khoá theo tài khoản trong transaction; client thua thấy lỗi nghiệp vụ và làm mới số dư.
- *"Đang quay mà server bảo trì thì sao?"* → Config báo bảo trì ở lần gọi kế tiếp; lệnh đang bay hỏi lại bằng key sau khi hết bảo trì, người chơi thấy thông báo thay vì treo.
- *"Muốn đổi tỉ lệ banner giữa mùa thì làm thế nào?"* → Phát hành master data version mới, bật dần, client tải theo version; có rollback bằng cách trỏ lại version cũ.

**Cờ đỏ**

- "Client quay rồi gửi kết quả lên server lưu cho nhanh." Sai mô hình authoritative, mở đường gian lận.
- "Mất mạng thì cứ retry cho tới khi được" mà không nhắc idempotency key. Có thể trừ tiền hai lần.
- Confirm/finish giao dịch với store ngay khi store trả về thành công, trước khi server cộng đồ.
- Nói "tôi tối ưu bằng cách gộp request" mà không biết request nào đổi ví, request nào chỉ đọc.
- Lấy giờ máy làm mốc reset hay kết thúc event.
- Hardcode tỉ lệ hoặc ID banner trong client, mỗi lần đổi lại ra bản build.
- Khoe làm "tất cả" các mảng (gacha, IAP, chat, ranking, realtime) nhưng không kể được một lần mạng rớt hay một bug thật.
- Kể chi tiết nội bộ công ty cũ (tên bảng, endpoint thật, số doanh thu) để gây ấn tượng.
- Không phân biệt được lỗi nghiệp vụ và lỗi mạng, cùng một cách retry cho cả hai.

**Số / ví dụ nên thuộc**

- Timeout 10 giây cho request thường, 30 giây cho tải file lớn.
- Backoff 1s → 2s → 4s, tối đa 3 lần, jitter ngẫu nhiên 0–500ms; `RATE_*` chờ đúng `retry_after`.
- Tổng thời gian từ chạm icon tới sảnh: dưới 5 giây; tải master data dưới 0,5 giây khi cache còn hợp lệ.
- Access token sống 15–60 phút; refresh token dài hạn; chỉ refresh một lần dùng chung.
- Luồng IAP sáu bước, thứ tự quan trọng nhất: server cộng đồ rồi mới finish với store.
- Pity ví dụ: gốc 5%, mỗi lần trượt tăng 3% (`p = 5% + 3% × số lần trượt`) → sau 31 lần trượt còn 98%, sau 32 lần trượt vượt 100%: lượt thứ **33** chắc chắn trúng.
- Bật dần 5% → 50% → 100%, ít nhất một giờ mỗi bậc; vòng sửa lỗi có remote config khoảng 15 phút so với 2–3 ngày chờ store.
- Crash-free sessions: dưới 99% là có vấn đề, từ 99.5% là ổn định.
- Reconnect: phòng giữ chỗ 30–60 giây, mở lại bằng `room_token` và nhận snapshot đầy đủ; tick co-op khoảng 20–30Hz, hiển thị người khác trễ 2–3 tick.
- Test mạng giả: latency 150ms, jitter 20ms, mất gói 3–5%.
- Google Play: base AAB 200MB, vượt thì cần Play Asset Delivery.
