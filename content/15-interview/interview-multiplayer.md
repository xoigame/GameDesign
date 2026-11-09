---
id: interview-multiplayer
title: Mạng và multiplayer realtime
icon: 🌐
summary: Ngân hàng câu hỏi và kiến thức cô đọng về mạng và multiplayer realtime cho phỏng vấn client — giao thức, topology, đồng bộ, che độ trễ, chống gian lận, deterministic, matchmaking, co-op raid, băng thông, test mạng, chat/guild.
status: deep
read: 1129
level: advanced
order: 27
tags: [interview, multiplayer, network, netcode, realtime]
related: [interview-live-service, unity-multiplayer, unity-network-client, go-matchmaking]
---

Node [[interview-live-service]] đã chạm co-op realtime ở mức "ai là chân lý, rớt mạng thì sao". Node này **đào sâu** đúng mảng đó: khi người phỏng vấn của một studio có game co-op realtime hỏi tiếp, bạn cần nói được *vì sao* một kiểu đồng bộ được chọn, độ trễ được che bằng kỹ thuật nào, và chỗ nào client không được tin. Các con số dưới đây (tick rate, buffer nội suy, kích thước gói) là **giá trị điển hình**, không phải chuẩn bắt buộc — trong buổi phỏng vấn hãy nói "thường khoảng", rồi nêu điều kiện làm nó đổi.

Phần cài đặt thật nằm ở [[unity-multiplayer]] và [[unity-network-client]]; phần server ở [[game-server-go]] và [[go-matchmaking]]; serialize ở [[go-protobuf]]; luồng client–server ở [[client-server-flow]].

## 1. TCP, UDP, WebSocket và kênh reliable

| Giao thức | Đặc tính | Hợp với |
|---|---|---|
| TCP | Tin cậy, đúng thứ tự, có nghẽn đầu hàng (head-of-line blocking): một gói mất thì mọi gói sau phải đợi | Đăng nhập, mua hàng, chat, kết quả trận |
| UDP | Không bảo đảm gói tới, không đảm bảo thứ tự | Vị trí, input, trạng thái đổi liên tục — gói cũ mất cũng chẳng sao vì gói mới đè lên |
| WebSocket | Chạy trên TCP, nhận khung (frame) thay vì luồng byte, đi qua được proxy và firewall HTTP | Chat, thông báo, game nhịp chậm; mặc định dễ nhất cho mobile |

Thư viện game (Photon, thư viện UDP tin cậy tự dựng) thường cho **hai kênh trên cùng một đường UDP**: *reliable* (có ack và gửi lại, đúng thứ tự) cho sự kiện không được mất như "dùng skill", "nhặt vật phẩm"; *unreliable* cho trạng thái lặp như vị trí. Lỗi hay gặp là đẩy mọi thứ vào reliable — một gói mất kéo cả hàng đợi đứng lại, vị trí hiện ra giật cục. Quy tắc: **dữ liệu mà gói mới thay thế được gói cũ thì đi unreliable; sự kiện xảy ra một lần thì đi reliable.**

## 2. Topology: ai là chân lý

- **Client–server authoritative**: server giữ trạng thái thật, client chỉ gửi input và hiển thị. An toàn nhất, tốn hạ tầng, cần prediction để nhân vật mình không bị trễ.
- **P2P**: mỗi máy nói chuyện với mọi máy khác. Không tốn server nhưng số kết nối tăng theo bình phương, lộ IP, NAT khó xuyên, không ai làm trọng tài.
- **Relay**: mọi gói đi qua một máy chủ trung chuyển chỉ chuyển tiếp, không chạy logic. Giải quyết NAT, vẫn không chống gian lận.
- **Host/master client** (kiểu Photon PUN): một client trong phòng giữ vai master, các client khác gửi RPC cho nó. Rẻ và mượt cho host, nhưng host có lợi thế 0ms, host thoát phải **chuyển master** (host migration) và host gian lận được.
- **Photon Fusion** có nhiều chế độ, trong đó *Host Mode* (một peer làm server) và *Dedicated Server Mode* (ngoài ra còn *Shared Mode*, quyền ghi chia cho từng client); phần tick-based, có prediction và rollback tích hợp sẵn.

Chọn topology theo hai câu hỏi: **thắng thua có ý nghĩa thi đấu/kinh tế không** (có → server), và **ngân sách hạ tầng** (hạn chế → host/relay, chấp nhận rủi ro gian lận).

## 3. Đồng bộ: state sync, lockstep, snapshot, delta

- **State sync**: server gửi trạng thái (vị trí, HP, anim state) theo tick; client hiển thị. Chịu được người vào giữa chừng, chịu mất gói, băng thông tỉ lệ với số thực thể.
- **Lockstep (deterministic)**: chỉ gửi **input**; mọi máy chạy cùng một mô phỏng và ra cùng kết quả. Băng thông cực nhỏ, hợp RTS/số lượng đơn vị lớn, nhưng một máy chậm kéo cả nhóm, và chỉ cần một phép tính lệch là **desync**.
- **Snapshot**: ảnh chụp toàn bộ trạng thái liên quan tại một tick. Gửi định kỳ, và gửi khi vào phòng hoặc reconnect.
- **Delta compression**: chỉ gửi phần đổi so với snapshot client đã xác nhận. Client báo "tôi đã nhận tick N", server tính delta từ N; nếu client mất quá xa thì gửi lại snapshot đầy đủ.
- **Tick rate**: số lần server cập nhật mỗi giây. Game hành động thường chọn khoảng 20–60Hz; co-op nhịp vừa thường thấp hơn. Tick cao hơn thì phản hồi mịn hơn nhưng băng thông và CPU server tăng.
- **Interest management**: chỉ gửi cho mỗi người phần thế giới họ cần thấy — cắt băng thông nhiều nhất khi đông thực thể.

## 4. Che độ trễ

- **Client-side prediction**: nhân vật mình chạy ngay theo input, không chờ server. Mỗi input gắn số thứ tự.
- **Server reconciliation**: khi server trả trạng thái tại tick N, client so với kết quả mình đã dự đoán cho tick N; lệch thì đặt lại trạng thái server rồi **chạy lại các input chưa được xác nhận** (replay). Lệch nhỏ nên làm mượt dần chứ đừng giật.
- **Entity interpolation**: thực thể của người khác hiển thị ở quá khứ một khoảng nhỏ (một buffer nội suy, điển hình vào cỡ 100ms, tức hai ba tick) và nội suy giữa hai snapshot đã nhận. Đổi lại độ trễ nhỏ lấy chuyển động mượt.
- **Extrapolation (dead reckoning)**: đoán tiếp theo vận tốc cũ khi snapshot chưa tới. Không mất độ trễ hiển thị, nhưng đoán sai khi đối tượng đổi hướng gấp, nên chỉ dùng ngắn và có giới hạn.
- **Lag compensation (rewind)**: server giữ lịch sử vị trí vài tick gần nhất; khi nhận lệnh bắn có dấu thời gian, server **tua thế giới về đúng thời điểm client nhìn thấy** rồi mới kiểm trúng. Công bằng cho người bắn, đổi lại người bị bắn đôi khi thấy mình trúng đạn sau khi đã nấp.

## 5. RPC, state, ownership, authority

- **RPC**: sự kiện một lần ("cast skill X"). Dễ viết nhưng người vào sau không thấy được những gì đã xảy ra — phải kèm state.
- **State (property đồng bộ)**: giá trị bền ("HP hiện tại", "đang trong trạng thái stun"). Người vào sau nhận ngay giá trị hiện tại.
- Quy tắc: **trạng thái kéo dài thì dùng state, sự kiện tức thời dùng RPC**. Dùng RPC để bật một cờ như "đang cháy" là bug chắc chắn khi có người reconnect.
- **Ownership**: mỗi thực thể có một chủ quyền ghi (thường là client điều khiển nó, hoặc server). Chỉ chủ mới được đổi state; người khác gửi yêu cầu.
- **Authority transfer**: chuyển quyền (ví dụ boss đổi mục tiêu, người giữ vật bị rớt mạng). Phải có thời điểm chuyển rõ ràng, nếu không hai bên cùng ghi và "tranh" nhau trạng thái.

## 6. Chống gian lận

1. **Không tin client**: client gửi *ý định* ("tôi muốn tung skill 3 vào mục tiêu T"), không gửi *kết quả* ("tôi gây 9999 sát thương").
2. **Server kiểm**: cooldown, tầm, tài nguyên, tốc độ tối đa di chuyển, vị trí có hợp lệ không.
3. **Rate limit** trên số gói và số lệnh mỗi giây từ một kết nối; vượt ngưỡng thì bỏ gói, kéo dài thì ngắt.
4. **Token có hạn** vào phòng, gắn `player_id` và phòng; không đoán được, hết hạn nhanh.
5. **Ghi log bất thường** để phân tích sau thay vì ban tức thì — tránh ban nhầm người lag.

Co-op PvE không xếp hạng thì mức chống gian lận có thể thấp hơn PvP; nhưng **thưởng giá trị thật** (vật phẩm gacha, tiền) thì kết quả vẫn phải do server xác nhận.

## 7. Deterministic

Lockstep hay replay đòi mọi máy ra **đúng cùng kết quả**. Bốn nguồn lệch:

- **Float khác máy**: cùng phép toán có thể ra kết quả khác giữa CPU/ARM/x86 và trình biên dịch. Giải pháp: **fixed-point** (số nguyên có thập phân ngầm) hoặc thư viện toán deterministic.
- **RNG**: dùng bộ sinh số ngẫu nhiên **có seed** chung, và mọi máy gọi nó đúng số lần, đúng thứ tự. Một lần gọi thừa ở một máy (ví dụ vì hiệu ứng hình ảnh dùng chung RNG) là lệch vĩnh viễn — tách RNG của mô phỏng khỏi RNG của hình ảnh. Xem thêm [[randomness]].
- **Thứ tự xử lý**: duyệt `Dictionary`/`HashSet`, thứ tự Update giữa các object đều có thể khác. Sắp xếp theo id ổn định trước khi xử lý.
- **Thời gian**: dùng số tick nguyên, không dùng `Time.deltaTime`.

Cách phát hiện desync: mỗi N tick, mỗi máy tính **checksum** trạng thái và gửi cho server so sánh; lệch thì ghi lại tick đầu tiên lệch.

## 8. Phòng và matchmaking

- **Lobby/room**: lobby liệt kê phòng, room là nơi diễn ra trận; thông tin ghép trận ([[go-matchmaking]]) trả về địa chỉ phòng và token.
- **ELO/MMR**: điểm kỹ năng ẩn dùng để ghép người cùng trình; mở rộng dần khoảng chấp nhận theo thời gian chờ để tránh đợi vô tận.
- **Giữ chỗ**: ghế của người rớt mạng được giữ một khoảng ngắn (điển hình nửa phút đến một phút) với `player_id` ổn định.
- **Reconnect giữa trận**: mở lại bằng token cũ, nhận **snapshot đầy đủ**, rồi đồng bộ tiếp từ tick hiện tại. Với app mobile, xuống nền cũng là disconnect nên đây là đường thường chứ không phải ngoại lệ.
- **Quyết định đóng trận**: server xác định thắng/thua và gọi API ghi kết quả bằng match id idempotent.

## 9. Co-op raid kiểu RPG gacha

| Chế độ | Cách chạy | Đổi lại |
|---|---|---|
| Async | Người chơi đánh dữ liệu của người khác (bản ghi/AI), server chấm sau | Không cần realtime, không áp lực mạng; ít cảm giác "cùng chơi" |
| Realtime | Vài người trong một phòng cùng đánh một boss | Cảm giác cùng nhau; phải xử lý độ trễ, reconnect, chênh thiết bị |

Ba câu phải trả lời cho co-op realtime:

1. **Ai tính sát thương?** Server (hoặc host) chạy công thức từ master data và chỉ số nhân vật đã xác thực; client chỉ hiện con số. Xem [[combat-systems]].
2. **Đồng bộ skill/animation thế nào?** Đồng bộ *sự kiện cast + tick bắt đầu* và *trạng thái*, không đồng bộ từng khung animation. Mỗi client tự phát animation từ tick bắt đầu đó; hit thật do server quyết.
3. **Nhân vật mình có cảm giác trễ không?** Có: cast skill mình phản hồi tức thì (prediction của hiệu ứng), còn sát thương hiện khi server xác nhận.

Boss do server (hoặc host) giữ AI và mục tiêu; người chơi chỉ nhận trạng thái.

## 10. Băng thông và serialize

- **Protobuf** ([[go-protobuf]]): gọn hơn JSON, có schema, tương thích ngược khi thêm field. Hợp cho gói API và gói có cấu trúc.
- **Bit packing / quantize**: nén trạng thái hay lặp. Vị trí không cần float 32 bit; có thể chia thành số nguyên trong khoảng hữu hạn (ví dụ toạ độ sân đấu nhân với 100 rồi cắt về 16 bit). Góc xoay thường chỉ cần vài bit.
- **Delta + interest management** (mục 3) thường cắt nhiều hơn là tối ưu từng trường.
- **Gộp gói**: nhiều thông điệp nhỏ trong một datagram; mỗi gói UDP trên mobile nên giữ dưới MTU (điển hình khoảng 1200 byte an toàn) để tránh phân mảnh.
- **Đo trước khi nén**: ghi số byte mỗi giây gửi/nhận theo loại thông điệp; nén phần chiếm nhiều nhất.

## 11. Test mạng

- **Network Simulator**: giả độ trễ, jitter, mất gói. Bộ cấu hình thường dùng: trễ 100–200ms, jitter 20–50ms, mất gói vài phần trăm.
- **Nhiều client trên một máy**: mở bản build + Editor, hoặc dùng công cụ nhân bản editor, để thử vào phòng, reconnect, chuyển master.
- **Kịch bản bắt buộc**: tắt wifi giữa trận rồi bật lại; chuyển wifi sang 4G; app xuống nền 30 giây; mất gói liên tục 10% trong vài giây; người thứ tư vào khi trận đã chạy.
- **Log theo tick** và số thứ tự input ở cả hai phía để nối lại sự kiện khi gặp lỗi khó tái hiện.

## 12. Chat và guild realtime

- **Pub/sub**: mỗi kênh (guild, thế giới, riêng tư) là một topic; client đăng ký khi vào màn hình, huỷ khi rời; server phát cho các thuê bao.
- **Lịch sử tin**: lưu server, client tải N tin gần nhất khi mở rồi phân trang ngược; nhận tin mới qua kênh realtime. Mất kết nối thì khi nối lại hỏi "tin sau id X" thay vì tải lại hết.
- **Thứ tự và trùng**: gắn `message_id` tăng dần phía server; client bỏ qua id đã thấy.
- **Kiểm duyệt**: lọc từ cấm ở server (không tin client), cho người chơi báo cáo/chặn, rate limit gửi tin, ghi log để xử lý khiếu nại.
- **Thông báo ngoài app** (guild kêu gọi, raid mở) đi qua push; chat chỉ là kênh khi đang mở app.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho mảng mạng và multiplayer realtime**

AI viết tốt phần giải thích khái niệm và đóng vai người phỏng vấn đào tiếp; AI **không** tự biết game của bạn chạy topology nào, tick rate bao nhiêu hay RPC nào bạn đã dùng. Giao cho nó: (1) hỏi xoáy theo từng tầng — giao thức, topology, đồng bộ, che độ trễ; (2) chấm câu trả lời nói miệng của bạn; (3) sinh kịch bản test mạng. Không giao: kết luận "game của tôi chọn đúng topology" — đó là quyết định của bạn, kèm lý do thật.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Hỏi xoáy | Luyện nói | "Hỏi tôi 5 câu liên tiếp về che độ trễ, mỗi câu đào sâu câu trước" |
| Chấm bài | Sau khi nói | "Chấm câu trả lời sau; chỉ ra chỗ thiếu lý do và chỗ khẳng định tuyệt đối" |
| Kịch bản lỗi | Chuẩn bị tình huống | "Cho 5 tình huống rớt mạng/lệch trạng thái, tôi sẽ trả lời" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- Dịch vụ mạng bạn thật sự dùng (Photon PUN/Fusion, SmartFoxServer, tự dựng gRPC/WebSocket) — mỗi cái có cơ chế master/authority khác nhau.
- Ai tính sát thương và ai giữ AI boss trong game bạn kể (server hay một client).
- Tick rate và kích thước phòng thật, hoặc ghi rõ "không rõ".
- Vai trò của bạn: phần nào bạn viết (client, đồng bộ, matchmaking), phần nào chỉ dùng.

**Mẫu prompt**

```
Đóng vai kỹ sư senior phỏng vấn tôi về netcode cho game co-op realtime 4 người (tôi làm client Unity với Photon, server do đội khác viết).
Hỏi từng câu một, đợi tôi trả lời rồi mới hỏi tiếp, tối đa 8 câu, bám thứ tự: giao thức -> topology -> đồng bộ -> che độ trễ -> chống gian lận -> reconnect.
Sau mỗi câu trả lời của tôi: (1) nói câu trả lời có lý do ("vì") chưa, (2) chỉ ra đúng một chỗ khẳng định tuyệt đối cần sửa thành "thường khoảng".
KHÔNG đưa số tick rate hay ngưỡng ms như chuẩn bắt buộc. KHÔNG khen chung chung. KHÔNG bịa chi tiết về game của tôi — nếu cần, hỏi lại.
```

**Bẫy thường gặp:** AI nói "tick rate chuẩn là 60Hz" hoặc "buffer nội suy phải là 100ms" như luật; nhầm lag compensation (server tua) với client prediction (client đoán); gợi ý lockstep cho game có đội hình đông và máy yếu mà không nhắc desync; và trả lời "dùng Photon là đủ" cho câu chống gian lận.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **TCP và UDP khác nhau thế nào, game realtime thường chọn cái nào?**
  → TCP đảm bảo tới nơi và đúng thứ tự, đổi lại một gói mất thì các gói sau phải đợi (head-of-line blocking). UDP không đảm bảo nên không bị chặn, hợp với dữ liệu mà gói mới thay gói cũ như vị trí. Game realtime thường dùng UDP kèm một kênh reliable tự làm cho sự kiện không được mất, còn đăng nhập và mua hàng vẫn đi TCP/HTTP.
- `Junior` **Reliable và unreliable channel khác nhau ở đâu? Cho ví dụ.**
  → Reliable có ack và gửi lại nên không mất, đúng thứ tự; unreliable gửi một lần rồi thôi. "Dùng skill" và "nhặt vật phẩm" phải reliable vì mất là sai logic, còn vị trí gửi liên tục thì unreliable, vì gói sau đã thay thế gói trước và gửi lại gói cũ chỉ làm đứng hàng đợi.
- `Junior` **Latency, jitter và packet loss là gì?**
  → Latency (ping) là thời gian đi–về của một gói; jitter là độ dao động của latency giữa các gói; packet loss là tỉ lệ gói mất. Jitter đáng ngại hơn latency ổn định vì nó làm khoảng cách giữa các snapshot không đều, nên phải có buffer nội suy để hấp thụ.
- `Junior` **Tick rate là gì? Tăng tick rate thì được và mất gì?**
  → Là số lần server cập nhật và gửi trạng thái mỗi giây. Tick cao thì phản hồi mịn hơn và lag compensation chính xác hơn, nhưng tốn băng thông, CPU server và pin của máy khách. Game hành động hay chọn vài chục Hz, co-op nhịp vừa thường thấp hơn.
- `Junior` **State sync và RPC khác nhau thế nào?**
  → State là giá trị bền được đồng bộ (HP, đang stun), người vào sau nhận được giá trị hiện tại. RPC là sự kiện một lần (cast skill), người vào sau không thấy được quá khứ. Dùng RPC để bật một cờ kéo dài sẽ sai khi có người reconnect, vì họ không nhận lại RPC cũ.
- `Mid` **Client–server authoritative khác host/master client thế nào?**
  → Authoritative thì server giữ trạng thái thật và kiểm mọi lệnh, nên công bằng và khó gian lận nhưng tốn hạ tầng. Host/master là một client giữ vai trọng tài: rẻ, mượt cho chính nó, nhưng host có lợi thế 0ms, thoát là phải chuyển master, và host sửa được trạng thái. Nên chọn host khi không có xếp hạng hay thưởng giá trị.
- `Mid` **Client-side prediction là gì? Vì sao không chờ server trả lời?**
  → Client chạy input ngay lên nhân vật của mình mà không chờ server, vì chờ một vòng đi–về 100–200ms sẽ làm điều khiển như dính bùn. Mỗi input mang số thứ tự để khi server trả trạng thái, client biết input nào đã được xử lý và input nào còn phải chạy lại.
- `Mid` **Server reconciliation làm gì khi dự đoán lệch với server?**
  → Khi nhận trạng thái server tại tick N, client so với trạng thái mình đã tự tính cho tick N. Nếu lệch, đặt nhân vật về trạng thái server rồi replay các input chưa được xác nhận. Lệch nhỏ thì nên làm mượt dần thay vì dịch chuyển tức thì, vì giật cục nhìn còn tệ hơn lệch vài centimet.
- `Mid` **Entity interpolation là gì? Tại sao người khác hiển thị "ở quá khứ"?**
  → Thực thể của người khác được hiển thị chậm hơn một khoảng nhỏ (một buffer nội suy, điển hình vào cỡ 100ms, hai ba tick) và được nội suy giữa hai snapshot đã nhận. Ta đổi một chút độ trễ lấy chuyển động mượt, vì nếu hiển thị ngay thì gói tới không đều sẽ làm nhân vật giật.
- `Mid` **Extrapolation khác interpolation thế nào, khi nào dùng?**
  → Interpolation làm mượt giữa hai điểm đã biết (ở quá khứ), extrapolation đoán điểm tiếp theo theo vận tốc cũ khi snapshot chưa tới. Extrapolation chỉ dùng ngắn và có giới hạn, vì khi đối tượng đổi hướng đột ngột thì đoán sai và phải kéo lại.
- `Mid` **Rớt mạng giữa trận co-op, hệ thống nên xử lý thế nào?**
  → Giữ chỗ người chơi bằng `player_id` ổn định thay vì id kết nối, trong một khoảng ngắn nửa phút đến một phút. Khi quay lại, mở bằng token cũ và nhận snapshot đầy đủ rồi đồng bộ tiếp từ tick hiện tại. Không replay lại toàn bộ delta, vì đã lệch quá xa và tốn băng thông hơn một snapshot.
- `Mid` **Vì sao dùng delta compression? Nếu client mất gói thì sao?**
  → Chỉ gửi phần đổi so với một snapshot đã được xác nhận nên giảm băng thông mạnh, vì phần lớn thực thể không đổi giữa hai tick. Client báo tick đã nhận gần nhất, server tính delta từ đó; nếu client tụt quá xa thì server gửi lại snapshot đầy đủ.
- `Mid` **Bit packing và quantize là gì? Cho ví dụ vị trí.**
  → Quantize là cắt độ chính xác không cần thiết rồi nén vào ít bit hơn. Ví dụ toạ độ sân đấu hữu hạn có thể nhân với 100 rồi lưu bằng số nguyên 16 bit thay vì ba float 32 bit, vì mắt người không phân biệt được độ lệch dưới một centimet. Đo trước bằng số byte mỗi giây theo loại gói để nén đúng chỗ.
- `Mid` **Protobuf có lợi gì so với JSON cho gói mạng?**
  → Protobuf nhị phân, gọn hơn, parse nhanh hơn, và có schema nên thêm field mới vẫn tương thích ngược. JSON dễ đọc nhưng tốn byte và tốn CPU parse trên mobile. Với gói đồng bộ tần suất cao còn nên dùng bit packing thủ công ở trên protobuf.
- `Mid` **Có nên tin client gửi lên "tôi gây 500 sát thương"?**
  → Không: client chỉ gửi ý định (tung skill nào, vào ai), server tính sát thương từ master data và chỉ số đã xác thực. Nếu tin kết quả từ client thì chỉ cần sửa một con số trong bộ nhớ là gian lận xong. Server cũng kiểm cooldown, tầm và tài nguyên.
- `Mid` **Rate limit trong game mạng dùng để làm gì?**
  → Giới hạn số gói/lệnh từ một kết nối trong một khoảng thời gian, để chặn spam gói làm treo server hoặc dùng bot đánh lệnh với tốc độ phi nhân. Vượt ngưỡng thì bỏ gói, vượt kéo dài thì ngắt kết nối. Ngưỡng đặt theo hành vi người chơi hợp lệ cộng biên an toàn, vì đặt sát quá sẽ đá nhầm người đang lag dồn gói.
- `Mid` **Matchmaking ELO/MMR hoạt động thế nào, thời gian chờ lâu thì sao?**
  → Ghép người có điểm kỹ năng gần nhau để trận cân bằng; khoảng chấp nhận bắt đầu hẹp rồi nới dần theo thời gian chờ để không phải đợi vô tận. Đánh đổi giữa chất lượng ghép và thời gian chờ, nên cần chỉnh theo dữ liệu người chơi thật, không đoán.
- `Mid` **Làm sao kiểm tra game của bạn chịu được mạng xấu?**
  → Dùng Network Simulator giả độ trễ, jitter và mất gói (ví dụ 150ms, jitter vài chục ms, mất vài phần trăm), cộng các kịch bản thật: tắt wifi giữa trận, đổi wifi sang 4G, app xuống nền 30 giây. Chạy nhiều client trên một máy để thử vào phòng và reconnect. Kịch bản thật quan trọng hơn con số, vì lỗi thường nằm ở đường thoát chứ không ở đường chạy tốt.
- `Mid` **Chat guild realtime thiết kế thế nào ở phía client?**
  → Mỗi kênh là một topic: đăng ký khi mở màn hình, huỷ khi rời; tải N tin gần nhất rồi phân trang ngược, tin mới đến qua kênh realtime. Mỗi tin có `message_id` tăng dần do server cấp để bỏ trùng, và khi nối lại thì hỏi "tin sau id X" thay vì tải lại hết, vì tải lại toàn bộ phí băng thông và làm tin nhảy lên xuống.
- `Mid` **Kiểm duyệt chat làm ở đâu?**
  → Ở server, vì filter trên client bị bỏ qua dễ dàng. Thêm báo cáo, chặn người dùng, rate limit gửi tin và log để xử lý khiếu nại. Client chỉ che từ cấm để trải nghiệm tốt hơn, không phải lớp bảo vệ.
- `Senior` **Chọn lockstep hay state sync cho game co-op 4 người chạy trên mobile?**
  → Với 4 người và số thực thể vừa phải, state sync hợp hơn: chịu được người vào giữa chừng, mất gói, và máy yếu nhất không kéo cả nhóm. Lockstep tiết kiệm băng thông nhưng đòi mô phỏng deterministic (float, RNG, thứ tự xử lý) và chỉ một máy lệch là desync. Tôi chỉ chọn lockstep khi số đơn vị lớn đến mức không gửi nổi trạng thái.
- `Senior` **Lag compensation (rewind) hoạt động thế nào và có trả giá gì?**
  → Server giữ lịch sử vị trí vài tick gần nhất; khi nhận lệnh bắn có dấu thời gian, nó tua thế giới về thời điểm client nhìn thấy rồi mới kiểm trúng, nên người bắn không phải đón đầu mục tiêu theo ping. Đổi lại người bị bắn đôi khi trúng đạn sau khi đã nấp. Giới hạn độ tua tối đa để người ping cao không ép cả phòng chịu thiệt.
- `Senior` **Thiết kế đồng bộ skill và animation trong co-op raid thế nào, ai tính sát thương?**
  → Đồng bộ sự kiện cast cùng tick bắt đầu và các state, không đồng bộ từng khung animation: mỗi client tự phát animation từ tick đó. Hit thật và sát thương do server (hoặc host) tính bằng công thức từ master data, client chỉ hiện con số. Tôi cho phản hồi tức thì ở hiệu ứng của chính mình, vì chờ xác nhận sát thương sẽ khiến skill có cảm giác trễ.
- `Senior` **Float có gây desync trong lockstep không? Giải quyết thế nào?**
  → Có: cùng phép toán có thể ra kết quả khác nhau giữa kiến trúc CPU, trình biên dịch và chế độ tối ưu. Dùng fixed-point hoặc thư viện toán deterministic, RNG có seed chung và gọi đúng thứ tự, tick nguyên thay `deltaTime`. Thêm checksum trạng thái định kỳ để phát hiện tick đầu tiên lệch, vì không có checksum thì desync chỉ lộ ra sau vài phút khi đã quá khó truy.
- `Senior` **Host rớt mạng giữa trận kiểu Photon master client, xử lý thế nào?**
  → Cần cơ chế host migration: chọn client mới làm master theo quy tắc xác định, nó nhận quyền và state lên từ bản sao mà các client giữ. Thiết kế state sao cho nằm trong property đồng bộ chứ không chỉ ở biến cục bộ của host, vì cái gì chỉ nằm trong bộ nhớ host sẽ mất khi host đi. Nếu trận có thưởng giá trị thì cân nhắc server riêng để tránh vấn đề này.
- `Senior` **Authority transfer là gì, rủi ro khi chuyển quyền?**
  → Là chuyển quyền ghi một thực thể từ chủ này sang chủ khác (ví dụ vật bị bỏ lại khi người giữ rớt mạng). Rủi ro là hai bên cùng ghi trong khoảng chuyển nên "tranh" trạng thái; giải bằng thời điểm chuyển rõ ràng (tick) và yêu cầu chủ mới nhận snapshot hiện tại trước khi ghi.
- `Senior` **Bạn đo và giảm băng thông của một phòng co-op đông thực thể thế nào?**
  → Đo số byte mỗi giây gửi/nhận theo loại thông điệp, tìm loại chiếm nhiều nhất. Giảm bằng interest management (chỉ gửi phần thấy được), delta so với snapshot đã xác nhận, quantize và gộp gói trong ngưỡng MTU. Cắt phạm vi thường hiệu quả hơn tối ưu từng trường, vì số thực thể mới là hệ số nhân lớn nhất.
- `Senior` **Kết quả trận co-op đến ví người chơi bằng đường nào, vì sao không để phòng ghi thẳng?**
  → Server phòng gọi API ghi kết quả với match id idempotent để thưởng chỉ ghi một lần dù có gửi lại. Mọi thay đổi ví và xếp hạng cần đi qua một đường ghi duy nhất có transaction, vì hai nguồn ghi sẽ dẫn đến lệch số liệu khi có sự cố mạng giữa chừng.
- `Senior` **Bạn thiết kế reconnect cho app mobile bị đưa xuống nền thế nào?**
  → Coi xuống nền quá timeout là disconnect: khi app quay lại, kiểm tra phòng còn không, nếu còn thì mở lại bằng token cũ và nhận snapshot đầy đủ; nếu phòng đã đóng thì chuyển về màn hình kết quả hoặc sảnh với thông báo rõ. UI cần trạng thái "đang kết nối lại" thay vì đóng sầm, vì mạng mobile mất rồi có lại thường xuyên.
- `Senior` **Hai người cùng đánh một boss trong realtime, bạn xử lý xung đột sát thương cùng tick thế nào?**
  → Đưa mọi lệnh vào hàng đợi theo tick ở nơi giữ quyền (server hoặc host) và xử lý theo thứ tự xác định, ví dụ sắp theo id người chơi khi cùng tick. Không để hai client cùng trừ HP rồi hợp nhất, vì kết quả sẽ khác nhau theo thứ tự gói đến.
- `Senior` **Nếu được chọn lại, ở game co-op không xếp hạng bạn vẫn đòi server-authoritative chứ?**
  → Không nhất thiết: nếu không có xếp hạng và thưởng nằm ngoài trận (do API cấp), host làm trọng tài là chấp nhận được và rẻ hơn rất nhiều. Tôi vẫn đòi server xác nhận kết quả để cấp thưởng, và chỉ chuyển sang server-authoritative khi có xếp hạng hoặc thưởng giá trị theo trận.

**Khung trả lời 60 giây** — "Anh xử lý độ trễ mạng trong trận co-op realtime thế nào?"

> Tôi chia làm hai nhóm: nhân vật của mình và nhân vật của người khác. Với nhân vật của mình, tôi dùng client-side prediction: chạy input ngay, gắn số thứ tự, rồi khi server trả trạng thái thì so sánh và replay các input chưa xác nhận, lệch nhỏ thì làm mượt dần. Với người khác, tôi nội suy giữa hai snapshot và chấp nhận hiển thị trễ khoảng hai ba tick, điển hình vào cỡ 100ms, để chuyển động mượt dù gói tới không đều. Sát thương và kết quả do bên giữ quyền quyết, client chỉ hiện con số, còn hiệu ứng skill của mình phát ngay để cảm giác không trễ. Tôi kiểm bằng Network Simulator với trễ, jitter, mất gói, cộng các kịch bản thật như tắt wifi hay app xuống nền, vì lỗi thường nằm ở đường thoát. Con số cụ thể như tick rate hay kích thước buffer tôi chỉnh theo game, không coi là chuẩn.

**Họ sẽ đào tiếp**

- *"Prediction sai thì hiển thị thế nào, làm sao không bị giật?"* → reconciliation bằng replay input chưa xác nhận, làm mượt lệch nhỏ, chỉ đặt lại tức thì khi lệch quá ngưỡng.
- *"Tăng buffer nội suy thì được gì, mất gì?"* → mượt hơn khi jitter cao, nhưng người khác hiển thị trễ hơn; chọn theo độ biến động mạng.
- *"Làm sao để người ping cao không phá trải nghiệm cả phòng?"* → giới hạn độ tua lag compensation, ngưỡng ping tối đa vào phòng, báo trạng thái kết nối.
- *"Mất gói reliable thì chuyện gì xảy ra?"* → ack và gửi lại, nghẽn đầu hàng; vì vậy chỉ đẩy sự kiện thật sự cần vào reliable.
- *"Host thoát thì sao?"* → host migration theo quy tắc xác định, state phải nằm trong thứ đồng bộ chứ không chỉ ở bộ nhớ host.
- *"Phát hiện desync thế nào?"* → checksum trạng thái định kỳ, ghi tick đầu tiên lệch, log theo tick ở mọi máy.
- *"Làm sao ngăn client sửa sát thương?"* → client chỉ gửi ý định, server tính từ master data và kiểm cooldown, tầm, tài nguyên.
- *"Gói đồng bộ quá lớn thì làm gì?"* → đo theo loại gói, interest management, delta, quantize, gộp gói trong MTU.
- *"Người vào giữa trận nhận gì?"* → snapshot đầy đủ rồi delta tiếp; state đồng bộ chứ không dựa vào RPC cũ.

**Cờ đỏ**

- Nói "đẩy mọi thứ vào reliable cho chắc": gây nghẽn đầu hàng, vị trí giật dù mạng không tệ.
- Nói "dùng Photon thì khỏi lo gian lận": thư viện không thay thế được việc server kiểm lệnh.
- Để client gửi kết quả (sát thương, vật phẩm nhận) thay vì ý định.
- Nhầm lag compensation với prediction, hoặc không phân biệt được interpolation với extrapolation.
- Khẳng định "tick rate chuẩn là 60Hz", "ping 50ms là đủ" như luật, không nêu điều kiện.
- Dùng RPC để đặt trạng thái kéo dài, bỏ quên người reconnect.
- Chọn lockstep mà không nhắc float, RNG, thứ tự xử lý hay cách phát hiện desync.
- Không có kịch bản test mạng nào ngoài "chạy thử trên wifi công ty".
- Kể mọi thứ là "tôi làm" mà không phân biệt phần client mình viết và phần server của đội khác.

**Số / ví dụ nên thuộc**

- Tick rate game hành động thường khoảng 20–60Hz; co-op nhịp vừa thường thấp hơn (đây là giá trị điển hình, không phải chuẩn).
- Buffer nội suy điển hình khoảng 100ms, tức hai ba tick; tăng khi jitter cao.
- Cấu hình Network Simulator thường dùng: trễ 100–200ms, jitter 20–50ms, mất gói vài phần trăm.
- Gói UDP nên giữ dưới khoảng 1200 byte để tránh phân mảnh (giá trị an toàn điển hình trên mobile).
- Giữ chỗ khi rớt mạng điển hình nửa phút đến một phút; reconnect bằng token cũ và snapshot đầy đủ.
- Quy tắc kênh: dữ liệu bị gói mới thay thế thì unreliable, sự kiện một lần thì reliable.
- Ví dụ quantize: toạ độ sân nhân 100 rồi lưu số nguyên 16 bit thay vì ba float 32 bit.
- Lockstep chỉ gửi input; state sync gửi trạng thái; delta tính từ snapshot đã xác nhận.
- Số lệnh sát thương đi theo thứ tự tick và id người chơi để kết quả xác định.
