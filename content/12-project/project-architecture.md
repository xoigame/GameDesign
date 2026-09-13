---
id: project-architecture
title: Chia ranh giới client và server
summary: Một câu hỏi quyết định mọi thứ nằm ở đâu, bảng ranh giới state cho game thật, và vì sao đổi ranh giới ở tháng thứ tư là viết lại chứ không phải sửa.
status: deep
read: 920
level: intermediate
order: 20
tags: [project, architecture, client-server, authority, security]
related: [game-server-go, architecture-patterns, unity-multiplayer, game-database]
---

Đây là chặng đắt nhất nếu làm sai, và rẻ nhất nếu làm đúng — nó tốn khoảng hai ngày và một tờ giấy.

Câu hỏi trung tâm không phải *"đặt logic ở đâu cho nhanh"*. Nó là:

> **Mất thứ này thì người chơi có mất tiền, mất công, hoặc mất niềm tin không?**

Có → server sở hữu, database là nguồn chân lý.
Không → client giữ, vì client giữ thì mượt hơn và rẻ hơn.

Mọi thứ còn lại trong node này là hệ quả của một câu đó.

## Bảng ranh giới state

Lập bảng này trước khi viết tính năng nào. Dán nó vào GDD. Mỗi dòng mới trong game phải tìm được chỗ trên bảng.

| Loại state | Ai sở hữu | Client được giữ gì | Sai chỗ thì hậu quả |
|---|---|---|---|
| Ví tiền, đá quý | **Server** | Bản sao để hiển thị, luôn thua server khi lệch | Người chơi tự sinh tiền; kinh tế chết trong một tuần |
| Inventory, vật phẩm | **Server** | Bản sao + id tham chiếu master | Nhân bản vật phẩm, không đối soát nổi |
| Tiến trình, level, sao | **Server** | Bản sao | Mất tiến trình khi đổi máy; hoặc tự mở khoá mọi thứ |
| Kết quả trận | **Server** | Không được tự khai báo | Điểm ảo tràn bảng xếp hạng |
| Bảng cân bằng (giá, damage) | **Server** phát hành, client cache | Cache có version | Đổi số phải build lại app; xem [[master-data]] |
| Vị trí nhân vật trong trận | **Room server** nếu PvP; client nếu solo | Dự đoán cục bộ | PvP: bay xuyên tường, bất tử |
| Hiệu ứng, animation, âm thanh | **Client** | Toàn quyền | Không hậu quả — để server làm là phí băng thông |
| Cài đặt, âm lượng, ngôn ngữ | **Client** | Toàn quyền, `PlayerPrefs` | Không hậu quả |
| Trạng thái UI, tab đang mở | **Client** | Toàn quyền | Không hậu quả |

Hai dòng hay bị đặt nhầm nhất:

- **Bảng cân bằng ở client** vì "cho nhanh". Hậu quả không phải bảo mật, mà là **không sửa được sau khi phát hành**: mỗi lần chỉnh giá phải build, nộp store, chờ duyệt, và chờ người chơi cập nhật — thứ họ không làm.
- **Vị trí nhân vật ở server trong game solo**. Tốn băng thông, tốn tiền máy chủ, và chẳng bảo vệ gì cả vì game solo không có ai để gian lận với. Ngoại lệ: có bảng xếp hạng ăn thua thật thì kết quả vẫn phải server kiểm.

## Client gửi ý định, không gửi kết quả

Đây là luật một câu, và nó là ranh giới giữa hệ thống an toàn và hệ thống không:

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="So sánh hai kiểu message: client gửi kết quả đã tính là sai, client gửi ý định và server tính là đúng">
  <defs>
    <marker id="pa-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <text x="165" y="24" text-anchor="middle" class="fig-label" font-size="13">Sai — client gửi kết quả</text>
  <text x="495" y="24" text-anchor="middle" class="fig-label" font-size="13">Đúng — client gửi ý định</text>
  <g class="fig-box-g">
    <rect x="20"  y="42"  width="110" height="50" rx="9" class="fig-box"/>
    <rect x="200" y="42"  width="110" height="50" rx="9" class="fig-box"/>
    <rect x="350" y="42"  width="110" height="50" rx="9" class="fig-box"/>
    <rect x="530" y="42"  width="110" height="50" rx="9" class="fig-box"/>
    <rect x="350" y="150" width="290" height="76" rx="9" class="fig-box"/>
  </g>
  <text x="75"  y="72"  text-anchor="middle" class="fig-label" font-size="12">Client</text>
  <text x="255" y="72"  text-anchor="middle" class="fig-label" font-size="12">Server</text>
  <text x="405" y="72"  text-anchor="middle" class="fig-label" font-size="12">Client</text>
  <text x="585" y="72"  text-anchor="middle" class="fig-label" font-size="12">Server</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#pa-a)" fill="none">
    <path d="M130 60 H196"/>
    <path d="M460 60 H526"/>
  </g>
  <text x="163" y="52"  text-anchor="middle" class="fig-muted" font-size="9">gold -= 100</text>
  <text x="163" y="110" text-anchor="middle" class="fig-muted" font-size="10">Server chỉ ghi lại điều</text>
  <text x="163" y="126" text-anchor="middle" class="fig-muted" font-size="10">client bảo. Sửa bộ nhớ</text>
  <text x="163" y="142" text-anchor="middle" class="fig-muted" font-size="10">là có tiền vô hạn.</text>
  <text x="493" y="52"  text-anchor="middle" class="fig-muted" font-size="9">buy(item=42)</text>
  <text x="495" y="174" text-anchor="middle" class="fig-label" font-size="11">Server tự làm bốn việc</text>
  <text x="495" y="194" text-anchor="middle" class="fig-muted" font-size="10">tra giá từ master · kiểm số dư</text>
  <text x="495" y="212" text-anchor="middle" class="fig-muted" font-size="10">ghi transaction · trả số dư mới</text>
</svg>
<figcaption>Mọi message từ client nên đọc được thành một câu bắt đầu bằng "tôi muốn". Message nào đọc thành "kết quả là" thì sai chỗ.</figcaption>
</figure>

Kiểm tra nhanh cả bộ message của bạn: message nào chứa **số tiền, số damage, số điểm** do client tính đều là lỗ hổng. Message đúng chỉ chứa **id và ý định**: mua gì, dùng kỹ năng nào, nhắm vào ai, vào lúc nào.

Ngoại lệ có ý thức: co-op PvE thuần, không bảng xếp hạng, không giao dịch giữa người chơi — ở đó nới lỏng để đổi lấy độ mượt là lựa chọn hợp lý. Nhưng phải là **lựa chọn**, ghi vào nhật ký quyết định, không phải mặc định vì lười.

## Ba loại process, và vì sao không gộp

Nhắc lại từ [[backend-go]] vì chặng này là lúc chốt:

| Process | Giữ gì trong RAM | Restart giữa chừng | Scale bằng cách |
|---|---|---|---|
| **API stateless** | Không gì | Vô hại | Thêm bản sao, đặt sau load balancer |
| **Room server** | Toàn bộ trận đang chạy | Mất trận — phải drain | Thêm máy, phòng dính vào một máy |
| **Worker / cron** | Không gì | Vô hại nếu job chạy lại được | Thêm bản sao, có khoá chống chạy trùng |

Hai kiểu gộp sai kinh điển: giữ inventory trong RAM của phòng cho nhanh, phòng crash là đồ bay; hoặc phòng ghi thẳng Postgres mỗi tick, database chết ở phòng thứ năm mươi.

Luật: **room server không được ghi vào nguồn chân lý.** Nó gửi kết quả trận qua API, API ghi trong transaction. Một đường ghi duy nhất, dễ đối soát, dễ tìm thủ phạm khi số liệu lệch.

## Ranh giới đổi được và không đổi được

| Đổi sau này | Chi phí | Vì sao chịu được |
|---|---|---|
| Thêm một endpoint | Giờ | Không ảnh hưởng cái đang chạy |
| Đổi database engine | Một đợt migration | Dữ liệu vẫn là dữ liệu đó |
| Tách thêm một loại process | Vài ngày | Ranh giới đã rõ từ đầu |
| **Chuyển ví tiền từ client sang server** | **Viết lại** | Mọi save cũ đều không tin được; phải quyết định tha hay khoá tài khoản đã gian lận |
| **Thêm realtime vào game vốn async** | **Viết lại gameplay** | Tách simulation khỏi presentation là việc xuyên suốt, không phải một module |

Hai dòng cuối là lý do chặng này phải xong **trước** khi viết tính năng, không phải sau.

## Ra khỏi chặng này với cái gì

- [ ] Bảng ranh giới state, dán trong GDD, mọi thành viên đọc rồi
- [ ] Danh sách message phác thảo, mỗi cái đọc được thành câu "tôi muốn…"
- [ ] Sơ đồ ba loại process, ghi rõ cái nào được ghi vào database
- [ ] Quyết định về realtime: có hay không, ghi ngày, ghi lý do
- [ ] Ghi rõ ngoại lệ nếu có (ví dụ co-op nới lỏng authority) kèm điều kiện áp dụng

## Bẫy thường gặp

- **Tin client vì "đằng nào cũng mã hoá rồi".** Mã hoá bảo vệ đường truyền, không bảo vệ khỏi người sở hữu thiết bị. Xem [[unity-save-data]] phần mã hoá chống ai.
- **Server kiểm tra ở tầng UI.** Ẩn nút "mua" khi không đủ tiền là UX, không phải kiểm tra. Kiểm tra thật nằm ở handler, cạnh transaction.
- **Chia theo "cái gì nặng thì để server".** Chia theo hậu quả khi sai, không theo tải.
- **Đặt logic kinh tế trong room server** cho gần gameplay. Phòng là RAM; RAM mất là mất tiền thật.

## 🤖 Prompt cho AI

**Dùng AI thế nào khi chia ranh giới**

Giao cho AI việc **soạn bảng nháp và soi lỗ hổng**, giữ lại cho mình việc duyệt. AI đọc mô tả game rất nhanh và bảng nháp của nó thường đúng 80% — nhưng 20% sai luôn rơi vào chỗ đắt nhất: tiền và vật phẩm.

Ba lượt dùng có ích:

1. **Soạn bảng** từ mô tả game của bạn.
2. **Soi message**: đưa danh sách message, hỏi cái nào đang cho client quyết kết quả.
3. **Đóng vai kẻ gian lận**: đưa bảng ranh giới, hỏi "nếu tôi sửa được bộ nhớ client, tôi khai thác gì".

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Có giao dịch giữa người chơi không** — có thì mọi thứ chặt lên một bậc.
- **Có bảng xếp hạng ăn thua thật không** (giải thưởng, mùa giải).
- **PvP hay PvE thuần** — quyết định mức authority của vị trí và damage.
- **Game có chơi offline được không** — có thì phải thiết kế hàng đợi đồng bộ, xem [[unity-network-client]].

**Mẫu prompt**

```
Game: <mô tả 5 dòng>. PvP: <có/không>. Giao dịch giữa người chơi: <có/không>.
Bảng xếp hạng có thưởng: <có/không>. Chơi offline: <có/không>. IAP: <có/không>.

Việc 1: lập bảng RANH GIỚI STATE — loại state | ai sở hữu | client cache gì | hậu quả nếu đặt sai.
Việc 2: đóng vai người chơi có công cụ sửa bộ nhớ và bắt được gói tin. Với bảng trên,
liệt kê 5 cách khai thác khả dĩ nhất, xếp theo thiệt hại giảm dần, và nêu cách chặn từng cái.

Ràng buộc:
- KHÔNG đề xuất giải pháp chống gian lận bằng obfuscate hay mã hoá phía client như biện pháp chính.
- Mỗi cách chặn phải nói rõ nó nằm ở tầng nào: handler, database, hay luật thiết kế.
- Nếu thiếu thông tin để quyết một dòng, ghi "CẦN HỎI" thay vì đoán.
```

**Bẫy thường gặp:** AI đặt bảng cân bằng ở client vì "giảm request", bỏ qua chuyện không sửa được sau khi lên store. Bẫy thứ hai: nó đề xuất chống gian lận bằng mã hoá và obfuscate — biện pháp làm chậm kẻ tò mò, vô dụng với người biết việc, và tệ nhất là tạo cảm giác an toàn giả. Bẫy thứ ba: nó gộp room server và API vì "đơn giản hơn", đúng ở tuần đầu và sai ở mọi tuần còn lại.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao không lưu tiền của người chơi ở máy họ cho nhanh?**
  → Vì bộ nhớ của máy đó sửa được bằng công cụ tải về trong năm phút, và khi tiền sinh ra từ hư không thì kinh tế game chết trong một tuần. Tải server không phải lý do để lo: một API Go trên VM 2 vCPU đỡ vài nghìn request mỗi giây, và thứ giết bạn là một query thiếu index chứ không phải phép trừ tiền.
- `Junior` **Server-authoritative nghĩa là gì?**
  → Nghĩa là server quyết kết quả, client chỉ gửi ý định. Client vẫn được tính toán để hiển thị ngay cho mượt — trừ tiền trên UI, hiện hiệu ứng — nhưng khi server trả về khác thì client sửa theo server. Ranh giới nằm ở chỗ ai là nguồn chân lý, không phải ở chỗ ai được phép tính.
- `Mid` **Message nào từ client thì anh coi là đáng ngờ?**
  → Message nào chứa một con số do client tính ra: vàng còn lại, damage đã gây, điểm cuối trận. Cách kiểm nhanh cả hệ thống là đọc to từng message lên — cái nào đọc thành "tôi muốn dùng kỹ năng 7 lên mục tiêu 12" thì ổn, cái nào đọc thành "kết quả là tôi được 4.500 điểm" thì phải sửa.
- `Mid` **Vì sao tách API và room server thành hai process?**
  → Vì vòng đời khác nhau. API không giữ gì trong RAM nên rolling restart vô hại và nhân bản thoải mái; room server giữ cả trận trong RAM nên phải drain trước khi thoát và phòng dính vào một máy. Gộp lại thì hoặc bạn không dám restart API, hoặc bạn kill mất trận của người đang chơi.
- `Senior` **Game co-op PvE thuần, anh có nới lỏng authority không?**
  → Có, và đó là lựa chọn hợp lý: cho client quyết vị trí và damage lên quái để giữ độ mượt, vì không có người chơi nào bị thiệt. Nhưng phần thưởng cuối trận vẫn phải server chốt vì nó chảy vào ví. Ranh giới dịch chuyển chứ không biến mất — và nó phải là quyết định ghi vào nhật ký, không phải mặc định vì lười.
- `Senior` **Đang chạy production mới phát hiện client tự tính damage. Kế hoạch xử lý?**
  → Không sửa vội. Trước hết đo: log song song giá trị client gửi và giá trị server tự tính để biết quy mô thiệt hại thật. Sau đó server bắt đầu dùng số của mình và bỏ qua số client gửi, nhưng vẫn nhận field cũ để client cũ không vỡ. Bỏ hẳn field là bước cuối, sau khi phần lớn người chơi đã cập nhật.

**Khung trả lời 60 giây** — "Message nào từ client thì đáng ngờ?"

> Luật của tôi: **client gửi ý định, server quyết kết quả.** Nên message nào chứa một con số do client tính ra đều đáng ngờ — số vàng còn lại, damage đã gây, điểm cuối trận.
>
> Message đúng chỉ mang id và ý định: "dùng kỹ năng 7 nhắm mục tiêu 12 tại tick 340". Server tra chỉ số từ master data, tự tính damage, tự trừ tiền, ghi transaction rồi trả về trạng thái mới.
>
> Cách kiểm nhanh cả hệ thống: đọc to từng message lên. Cái nào đọc thành *"tôi muốn…"* thì ổn; cái nào đọc thành *"kết quả là…"* thì phải sửa. Ở dự án gần nhất tôi rà theo cách đó và tìm ra ba endpoint nhận thẳng điểm cuối trận từ client.

**Họ sẽ đào tiếp**

- *"Vậy client không được tính gì cả à?"* → Được, và nên. Client tính để **hiển thị ngay** cho mượt — dự đoán lạc quan, hiện hiệu ứng, trừ tiền trên UI. Nó chỉ không được là **nguồn chân lý**. Khi server trả về khác, client sửa theo server, kèm hiệu ứng để người chơi không thấy giật.
- *"Chống gian lận bằng mã hoá client được không?"* → Không, đó là làm chậm chứ không phải chặn. Người sở hữu thiết bị luôn thắng cuộc đua đó. Tiền phải nằm ở server; mã hoá chỉ để nâng chi phí cho kẻ tò mò, không bao giờ là biện pháp chính.
- *"Vì sao room server không ghi thẳng database?"* → Hai lý do. Một, phòng là RAM, mà thứ không được phép mất thì phải vào Postgres **trước khi** trả về thành công. Hai, ghi 20–30 lần mỗi giây mỗi phòng sẽ giết database ở vài chục phòng. Phòng gửi kết quả qua API, API ghi một transaction — một đường ghi duy nhất, đối soát được.
- *"Co-op PvE thì sao?"* → Nới lỏng được, và tôi sẽ nới: cho client quyết vị trí và damage lên quái để giữ độ mượt, vì không có ai bị thiệt. Nhưng phần thưởng cuối trận vẫn phải server chốt, vì nó chảy vào ví. Ranh giới dịch chuyển, không biến mất.
- *"Phát hiện ở production thì làm gì?"* → Không sửa vội. Trước hết **đo**: log lại giá trị client gửi và giá trị server tự tính, chạy song song để biết quy mô thiệt hại. Sau đó server bắt đầu tự tính và bỏ qua số client gửi, nhưng vẫn nhận field cũ để client cũ không vỡ. Cuối cùng mới bỏ field, sau khi phần lớn người chơi đã cập nhật — xem [[project-contract]].

**Cờ đỏ**

- "Chúng tôi mã hoá gói tin nên client gửi gì cũng an toàn."
- Không phân biệt được **dự đoán ở client để hiển thị** và **client là nguồn chân lý**.
- Đặt bảng cân bằng trong build client rồi ngạc nhiên vì không chỉnh được số sau khi phát hành.
- Trả lời "để server làm hết cho an toàn" mà không nhận ra mình vừa đề xuất gửi 30 gói tin mỗi giây cho một game solo.
- Coi việc gộp API với room server là "tối giản" thay vì nhận ra hai vòng đời khác nhau.

**Số / ví dụ nên thuộc**

- Room server ghi thẳng database mỗi tick: **20–30 write/giây/phòng** — chết ở vài chục phòng.
- Một đường ghi duy nhất vào nguồn chân lý: **API**, không phải room server.
- Ba loại process, ba vòng đời: stateless · stateful · worker.
- Kiểm nhanh message: đọc thành "tôi muốn…" thì đúng, "kết quả là…" thì sai.

**Kể trong dự án**

- *"Anh quyết ranh giới đó hay ai quyết?"* → Nếu bạn không phải người quyết, hãy kể **cách bạn phát hiện ranh giới sai và thuyết phục đội đổi**. Câu chuyện thuyết phục thường mạnh hơn câu chuyện quyết định.
- *"Khó khăn gặp phải ở chặng này?"* → Mẫu tốt: đội đã có sẵn code cũ đặt inventory ở client, và bạn phải chuyển sang server **mà không làm mất đồ của người chơi đang có**. Kể cách chạy song song hai nguồn, đối soát, rồi mới chuyển hẳn — đây là loại chi tiết không bịa được.
- *"Anh học được gì?"* → Một câu đáng nói: ranh giới không phải quyết định kỹ thuật thuần, nó là quyết định về **ai chịu trách nhiệm khi số liệu sai**. Đặt sai chỗ thì đến lúc lệch số không ai tìm ra thủ phạm.
