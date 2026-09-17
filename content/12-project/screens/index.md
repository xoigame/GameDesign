---
id: screens
title: Màn hình & tính năng meta
icon: 📱
summary: Bản đồ mọi màn hình ngoài gameplay của một game mobile F2P, và khuôn mẫu tám ô để tổ chức một màn hình — bố cục, dữ liệu, API, vòng đời, trạng thái rỗng.
status: deep
read: 982
level: intermediate
order: 75
tags: [screens, meta, ui, f2p, monetization]
related: [meta-systems, ux-flow, project, unity-ui]
---

Gameplay chiếm phần lớn thời gian **nói về** game, nhưng chiếm phần nhỏ số màn hình **phải xây**. Một game mobile F2P điển hình có 3–5 màn gameplay và **hai mươi màn meta** — và nhóm thứ hai mới là nơi tiền đi qua, nơi người chơi quay lại mỗi ngày, và nơi phần lớn bug sống.

Cụm này liệt kê từng màn hình: nó tồn tại để làm gì, bố cục ra sao, dữ liệu lấy từ đâu, và bẫy riêng của nó.

[[ui-design]] và [[ux-flow]] nói **nguyên lý** giao diện. Cụm này nói **màn hình cụ thể** — thứ bạn thật sự phải làm, với API và trạng thái đi kèm.

## Bản đồ điều hướng

<figure class="fig">
<svg viewBox="0 0 680 340" role="img" aria-label="Sơ đồ điều hướng: từ màn hình Home toả ra gacha, shop, mission, hộp quà, túi đồ, bảng xếp hạng và vào trận; trận đấu dẫn tới màn kết quả rồi quay về Home; piggy bank và gói ưu đãi hiện chèn lên trên Home">
  <defs>
    <marker id="scr-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="268" y="140" width="140" height="62" rx="10" class="fig-box"/>
    <rect x="24"  y="18"  width="128" height="44" rx="8" class="fig-box"/>
    <rect x="24"  y="82"  width="128" height="44" rx="8" class="fig-box"/>
    <rect x="24"  y="216" width="128" height="44" rx="8" class="fig-box"/>
    <rect x="24"  y="280" width="128" height="44" rx="8" class="fig-box"/>
    <rect x="524" y="18"  width="132" height="44" rx="8" class="fig-box"/>
    <rect x="524" y="82"  width="132" height="44" rx="8" class="fig-box"/>
    <rect x="524" y="216" width="132" height="44" rx="8" class="fig-box"/>
    <rect x="524" y="280" width="132" height="44" rx="8" class="fig-box"/>
    <rect x="286" y="248" width="104" height="40" rx="8" class="fig-box"/>
    <rect x="286" y="58"  width="104" height="40" rx="8" class="fig-box"/>
  </g>
  <text x="338" y="166" text-anchor="middle" class="fig-label" font-size="14">🏠 Home</text>
  <text x="338" y="188" text-anchor="middle" class="fig-muted" font-size="10">trung tâm điều hướng</text>
  <text x="88"  y="45"  text-anchor="middle" class="fig-label" font-size="11">🎰 Gacha</text>
  <text x="88"  y="109" text-anchor="middle" class="fig-label" font-size="11">🛒 Shop &amp; IAP</text>
  <text x="88"  y="243" text-anchor="middle" class="fig-label" font-size="11">🎯 Nhiệm vụ</text>
  <text x="88"  y="307" text-anchor="middle" class="fig-label" font-size="11">🎒 Túi đồ</text>
  <text x="590" y="45"  text-anchor="middle" class="fig-label" font-size="11">🎁 Hộp quà</text>
  <text x="590" y="109" text-anchor="middle" class="fig-label" font-size="11">🐷 Piggy bank</text>
  <text x="590" y="243" text-anchor="middle" class="fig-label" font-size="11">🏆 Xếp hạng</text>
  <text x="590" y="307" text-anchor="middle" class="fig-label" font-size="11">⚙️ Cài đặt</text>
  <text x="338" y="273" text-anchor="middle" class="fig-label" font-size="11">⚔️ Vào trận</text>
  <text x="338" y="83"  text-anchor="middle" class="fig-label" font-size="11">🏁 Kết quả</text>
  <g stroke="#6ea8fe" stroke-width="1.8" marker-end="url(#scr-a)" fill="none">
    <path d="M268 158 Q200 158 190 110 Q186 60 156 44"/>
    <path d="M268 165 Q200 165 180 120 H156"/>
    <path d="M268 180 Q200 180 190 226 H156"/>
    <path d="M268 188 Q200 188 195 285 Q190 300 156 302"/>
    <path d="M408 158 Q476 158 486 110 Q490 60 520 44"/>
    <path d="M408 165 Q476 165 496 120 H520"/>
    <path d="M408 180 Q476 180 486 226 H520"/>
    <path d="M408 188 Q476 188 485 285 Q490 300 520 302"/>
    <path d="M338 202 V244"/>
    <path d="M338 254 Q250 250 244 170 Q240 100 282 82"/>
    <path d="M338 98 V136"/>
  </g>
  <text x="250" y="232" text-anchor="middle" class="fig-muted" font-size="9">vòng lặp chính</text>
</svg>
<figcaption>Home là trung tâm: mọi màn khác đi ra từ đó và quay về đó. Vòng lặp in đậm — Home → trận → kết quả → Home — là đường người chơi đi nhiều nhất, nên nó phải ngắn nhất.</figcaption>
</figure>

## Các node

| Node | Màn hình tồn tại để làm gì |
|---|---|
| [[screen-home]] | Trả lời "giờ tôi nên làm gì" trong 2 giây, và dẫn tới đúng một hành động |
| [[screen-gacha]] | Đổi tiền lấy kỳ vọng — màn nhạy cảm nhất về pháp lý và niềm tin |
| [[screen-shop]] | Bán, và **không** phá vỡ cảm giác công bằng |
| [[screen-mission]] | Cho lý do quay lại hôm nay, không biến game thành nghĩa vụ |
| [[screen-presentbox]] | Kênh một chiều từ vận hành tới người chơi — đền bù, quà, sự kiện |
| [[screen-piggybank]] | Gói tích luỹ: biến chơi nhiều thành lý do mua, đúng một lần |
| [[screen-inventory]] | Xem và nâng cấp thứ mình có, không lạc trong danh sách 400 món |
| [[screen-result]] | Khoảnh khắc thoả mãn sau trận, và cây cầu về vòng lặp tiếp theo |
| [[screen-ranking]] | So sánh xã hội có kiểm soát, theo mùa |

## Khuôn mẫu tám ô — tổ chức một màn hình

Mỗi node trong cụm này đi theo cùng tám ô. Dùng nó cho **bất kỳ** màn hình nào bạn thêm sau này, kể cả màn không có trong danh sách trên.

| # | Ô | Câu phải trả lời | Sai thì |
|---|---|---|---|
| 1 | **Mục tiêu** | Màn này tồn tại để người chơi làm gì, trong bao nhiêu giây? | Màn phình ra vì ai cũng thêm được thứ vào |
| 2 | **Bố cục** | Ba vùng ưu tiên cao nhất là gì? Cái gì nằm trên nếp gấp? | Thứ quan trọng nhất nằm dưới, không ai cuộn xuống |
| 3 | **Dữ liệu** | Server sở hữu gì, client cache gì, cái gì được phép cũ? | Hoặc chậm vì tải mọi thứ, hoặc sai vì tin cache |
| 4 | **API** | Vào màn gọi gì, mỗi hành động gọi gì, cái nào cần idempotency? | Trừ tiền hai lần; hoặc N+1 request |
| 5 | **Vòng đời** | Mở → tải → sẵn sàng → hành động → đóng. Ai huỷ request đang bay? | Callback đụng object đã chết khi thoát nhanh |
| 6 | **Trạng thái rỗng & lỗi** | Chưa có gì thì hiện gì? Mất mạng thì hiện gì? | Màn trắng, hoặc chuỗi lỗi kỹ thuật đập vào mặt người chơi |
| 7 | **Số liệu** | Đo gì để biết màn này hoạt động? | Không biết màn nào đang hỏng |
| 8 | **Vận hành** | Bật/tắt được từ server không? Đổi nội dung có cần build lại? | Sự kiện phải chờ store duyệt |

Ô 3 và ô 8 là hai ô người mới hay bỏ qua, và chúng quyết định phần lớn chi phí về sau.

## Ba luật chung cho mọi màn hình meta

**Luật 1 — Màn hình không được sở hữu sự thật.** Nó hiển thị thứ server nói. Số vàng trên HUD là bản sao; khi server trả về số khác, màn hình sửa theo server. Xem [[project-architecture]].

**Luật 2 — Mọi nút tiêu tài nguyên đều phải chống bấm hai lần**, ở cả hai tầng: khoá nút ngay khi bấm, **và** gửi kèm idempotency key. Khoá nút một mình không đủ vì còn retry của lớp network — xem [[unity-network-client]].

**Luật 3 — Nội dung đổi được mà không cần build lại.** Vật phẩm trong shop, phần thưởng nhiệm vụ, banner gacha đều đến từ master data có version ([[master-data]]). Màn hình chỉ biết *cách vẽ một món*, không biết *có những món nào*.

## Thứ tự xây

Không xây theo thứ tự trong menu. Xây theo thứ tự **rủi ro và phụ thuộc**:

| Đợt | Màn | Vì sao trước |
|---|---|---|
| 1 | Home (rút gọn) + Kết quả | Không có hai màn này thì không có vòng lặp nào để thử |
| 2 | Hộp quà | Cần từ rất sớm: đền bù khi có sự cố, và phát quà cho người test |
| 3 | Nhiệm vụ + Túi đồ | Cho lý do chơi tiếp; chạm vào ví nên lộ lỗi kinh tế sớm |
| 4 | Shop + IAP | Luồng thanh toán cần thời gian để duyệt và đối soát |
| 5 | Gacha | Nhạy cảm nhất, cần luật pháp lý rõ và số liệu đầy đủ |
| 6 | Xếp hạng, Piggy bank | Tăng giữ chân và doanh thu, không chặn thứ khác |

**Hộp quà ở đợt 2** hay gây ngạc nhiên. Lý do rất thực dụng: khi có sự cố, đó là cách duy nhất trả lại đồ cho người chơi. Làm nó muộn nghĩa là sự cố đầu tiên bạn không có công cụ nào để xin lỗi.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho màn hình meta**

Đây là mảng AI làm tốt **phần khung** và sai **phần quyết định sản phẩm**. Nó dựng được cấu trúc UI và code gọi API rất nhanh, nhưng nó không biết game của bạn bán gì và cho gì.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Soạn tám ô | Trước khi làm một màn | "Điền khuôn mẫu tám ô cho màn nhiệm vụ của game này" |
| Liệt kê trạng thái | Khi đã có bố cục | "Liệt kê mọi trạng thái màn này có thể ở: rỗng, đang tải, lỗi, hết hạn, đã nhận" |
| Sinh khung UI + gọi API | Khi hợp đồng đã chốt | "Viết controller cho màn này, dùng ApiClient có sẵn, xử lý đủ các trạng thái trên" |
| Soi lỗ hổng kinh tế | Sau khi có code | "Chỗ nào trong luồng này người chơi có thể nhận thưởng hai lần?" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Màn này bán gì hay cho gì** — quyết định toàn bộ bố cục và cảnh báo pháp lý.
- **Dữ liệu đến từ master data hay hardcode** — nếu không nói, nó sẽ hardcode danh sách vật phẩm.
- **Có IAP không**, và cửa hàng nào (App Store, Google Play).
- **Trạng thái rỗng trông thế nào** — không nói thì nó bỏ qua và bạn có màn trắng.

**Mẫu prompt**

```
Game <thể loại>, Unity, có ApiClient sẵn (retry + idempotency key).
Màn cần làm: <tên màn>. Dữ liệu đến từ master data có version + trạng thái người chơi từ server.

Việc 1: điền khuôn mẫu tám ô — mục tiêu, bố cục, dữ liệu, API, vòng đời,
trạng thái rỗng và lỗi, số liệu cần đo, cái gì bật/tắt được từ server.
Việc 2: liệt kê MỌI trạng thái màn này có thể rơi vào, kể cả trạng thái hiếm.
Việc 3: chỉ ra nút nào tiêu tài nguyên và cần idempotency key.

Ràng buộc:
- KHÔNG hardcode danh sách vật phẩm hay phần thưởng — mọi thứ từ master data.
- KHÔNG để client tự tính số dư sau giao dịch; hiển thị số server trả về.
- Mỗi trạng thái phải có thứ hiện ra cho người chơi, không được để màn trắng.
- Chỗ nào cần tôi quyết chính sách sản phẩm thì ghi "CẦN QUYẾT".
```

**Bẫy thường gặp:** AI dựng màn hình chỉ có đường thành công và dữ liệu đẹp — không trạng thái rỗng, không trạng thái lỗi, không trạng thái "phần thưởng đã hết hạn". Bẫy thứ hai: nó hardcode danh sách vật phẩm vào code UI, và bạn mất khả năng đổi shop mà không build lại. Bẫy thứ ba: nó tin số client tính sau giao dịch thay vì lấy số server trả về.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Một game mobile F2P có những màn hình nào ngoài gameplay?**
  → Khoảng hai mươi, và chúng chiếm phần lớn công sức: Home làm trung tâm điều hướng, gacha, shop và IAP, nhiệm vụ hằng ngày, hộp quà, túi đồ và nâng cấp, bảng xếp hạng, kết quả trận, cài đặt, cộng các gói ưu đãi như piggy bank. Gameplay chỉ có vài màn nhưng được nói tới nhiều nhất.
- `Junior` **Vì sao Home là màn quan trọng nhất?**
  → Vì nó phải trả lời "giờ tôi nên làm gì" trong khoảng hai giây, và người chơi đi qua nó nhiều lần hơn bất kỳ màn nào khác. Vòng lặp Home → trận → kết quả → Home là đường đi nhiều nhất trong game, nên mỗi giây thừa ở đó nhân lên theo số lần chơi.
- `Mid` **Anh tổ chức một màn hình mới theo trình tự nào?**
  → Theo tám ô: mục tiêu của màn, ba vùng bố cục ưu tiên, dữ liệu ai sở hữu và cái gì được phép cũ, API vào màn và mỗi hành động, vòng đời kèm việc huỷ request khi thoát, trạng thái rỗng và lỗi, số liệu cần đo, và cuối cùng cái gì bật tắt được từ server. Hai ô hay bị bỏ là ô dữ liệu và ô vận hành, và chúng quyết định phần lớn chi phí về sau.
- `Mid` **Vì sao danh sách vật phẩm trong shop không nằm trong code?**
  → Vì mỗi lần đổi giá hay đổi danh sách sẽ phải build lại app, nộp store, chờ duyệt, rồi chờ người chơi cập nhật — thứ họ không làm. Màn hình chỉ biết cách vẽ một món; danh sách đến từ master data có version, nên vận hành đổi trong vài phút.
- `Senior` **Thứ tự xây các màn meta, và vì sao hộp quà lại sớm?**
  → Home rút gọn và màn kết quả trước vì không có chúng thì không có vòng lặp để thử. Rồi tới **hộp quà** — sớm hơn cả shop — vì khi có sự cố, đó là cách duy nhất trả lại đồ cho người chơi và phát quà cho người test. Làm muộn nghĩa là sự cố đầu tiên bạn không có công cụ nào để xin lỗi. Sau đó mới tới nhiệm vụ, shop, gacha, rồi xếp hạng.
- `Senior` **Chống bấm hai lần ở nút nhận thưởng, anh làm ở đâu?**
  → Cả hai tầng. Khoá nút ngay khi bấm để chặn thao tác người, **và** gửi kèm idempotency key để chặn phần còn lại. Khoá nút một mình không đủ vì lớp network vẫn retry khi timeout, và người chơi vẫn tắt app rồi mở lại. Chỉ khoá nút là loại lỗi nhìn thì đã sửa mà thực tế vẫn còn.

**Khung trả lời 60 giây** — "Anh tổ chức một màn hình meta thế nào?"

> Tôi đi theo tám ô cố định. **Mục tiêu**: màn này để người chơi làm gì, trong bao nhiêu giây — nếu không viết ra thì màn sẽ phình vì ai cũng thêm được thứ vào. **Bố cục**: ba vùng ưu tiên cao nhất, cái gì nằm trên nếp gấp. **Dữ liệu**: server sở hữu gì, client cache gì, cái gì được phép cũ. **API**: vào màn gọi gì, hành động nào cần idempotency key.
>
> Bốn ô sau hay bị bỏ nhưng quyết định chất lượng: **vòng đời** và ai huỷ request khi thoát nhanh; **trạng thái rỗng và lỗi** — chưa có gì thì hiện gì, mất mạng thì hiện gì; **số liệu** để biết màn này có hoạt động không; và **vận hành** — cái gì bật tắt được từ server mà không cần build lại.
>
> Luật xuyên suốt: màn hình **không sở hữu sự thật**, nó hiển thị thứ server nói; và mọi nội dung đến từ master data, nên màn chỉ biết cách vẽ một món chứ không biết có những món nào.

**Họ sẽ đào tiếp**

- *"Ô nào hay bị bỏ nhất?"* → Trạng thái rỗng và trạng thái lỗi. Người ta dựng màn với dữ liệu mẫu đẹp rồi quên mất người chơi mới chưa có gì, hộp quà rỗng, mạng rớt giữa chừng. Kết quả là màn trắng hoặc một chuỗi lỗi kỹ thuật đập vào mặt người chơi.
- *"Cache cái gì, không cache cái gì?"* → Cache thứ dùng chung và đổi theo đợt: master data, hình ảnh, cấu hình. Không cache lâu thứ riêng của người chơi như ví và túi đồ, vì nó đổi mỗi hành động. Ranh giới đó cũng là ranh giới giữa hai endpoint khác nhau, đừng gộp chung.
- *"Đo gì ở một màn meta?"* → Tỉ lệ mở màn, tỉ lệ hoàn tất hành động chính, và thời gian ở lại. Với màn có tiền thì thêm tỉ lệ chuyển đổi theo bước. Không có số thì bạn không biết màn nào đang hỏng cho tới khi doanh thu rơi.
- *"Màn nào nên tắt được từ server?"* → Mọi màn không thuộc lõi: xếp hạng, sự kiện, gói ưu đãi. Đó chính là danh sách cầu dao khi quá tải — xem [[project-launch]]. Đăng nhập, ví và IAP thì không bao giờ tắt.
- *"Bao nhiêu màn là quá nhiều?"* → Không có con số, nhưng có dấu hiệu: nếu người chơi mới phải học quá ba lối đi trong phiên đầu thì bạn đang mở quá sớm. Cách xử lý là **mở dần theo tiến trình**, không phải bớt màn.

**Cờ đỏ**

- Hardcode danh sách vật phẩm, phần thưởng hoặc banner vào code UI.
- Màn hình tự tính số dư sau giao dịch thay vì dùng số server trả về.
- Chỉ khoá nút để chống bấm hai lần, không có idempotency key.
- Không có trạng thái rỗng — người chơi mới thấy màn trắng.
- Gọi một request cho mỗi món trong danh sách.
- Xây shop và gacha trước khi có hộp quà.

**Số / ví dụ nên thuộc**

- Game F2P điển hình: **3–5 màn gameplay**, khoảng **20 màn meta**.
- Home phải trả lời "làm gì tiếp" trong khoảng **2 giây**.
- Khuôn mẫu **tám ô**: mục tiêu · bố cục · dữ liệu · API · vòng đời · rỗng và lỗi · số liệu · vận hành.
- Thứ tự xây: Home + kết quả → **hộp quà** → nhiệm vụ + túi đồ → shop → gacha → xếp hạng.

**Kể trong dự án**

- *"Anh làm màn nào?"* → Chọn màn **có tiền đi qua** nếu bạn từng làm: shop, gacha, hộp quà. Chúng cho câu chuyện sâu hơn vì có transaction, idempotency và đối soát.
- *"Khó khăn gặp phải?"* → Mẫu tốt: một màn hoạt động hoàn hảo với tài khoản test đã có sẵn đồ, nhưng vỡ với tài khoản mới tinh vì không ai nghĩ tới trạng thái rỗng. Kể cách bạn đưa "tạo tài khoản mới và đi hết mọi màn" thành bước kiểm bắt buộc trước mỗi bản phát hành.
- *"Anh cải thiện gì?"* → Nếu bạn chuẩn hoá cách tổ chức màn hình cho cả đội — một khuôn mẫu, một base class, một quy ước trạng thái — đó là đóng góp sống lâu hơn bất kỳ màn nào.
