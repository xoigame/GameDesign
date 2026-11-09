---
id: interview-game-sense
title: Cảm quan sản phẩm — nói về game như người làm game
icon: 🕹
summary: Từ vựng chỉ số (retention, ARPDAU, LTV, funnel), kinh tế gacha, live-ops, game feel và onboarding dưới góc nhìn developer — để trả lời "ấn tượng điểm nào, anh sẽ cải thiện gì" bằng cơ chế và số đo, không bằng cảm giác.
status: deep
read: 1145
level: intermediate
order: 45
tags: [interview, game-design, product, metrics, gacha]
related: [interview-personality, core-loop, economy-design, liveops, playtesting-metrics]
---

[[interview-personality]] đã cho bạn khung năm lớp để phân tích một game và cách ghi sổ khi chơi. Node này đi sâu vào **vốn từ và cách nghĩ** đứng sau khung đó: khi người phỏng vấn nói "retention", "pity", "collab", "FTUE", bạn phải hiểu và dùng đúng, và biết phần code của mình chạm vào chỉ số nào.

> **Giới hạn cố ý:** node này **không mô tả tính năng của game cụ thể** nào (kể cả ba game của Ateam). Thông tin game thay đổi theo bản cập nhật và rất dễ sai. Mọi chi tiết về game phải do **chính bạn thấy khi chơi** hoặc đọc trên trang chính thức, trước ngày phỏng vấn.

## 1. Vì sao dev cần cảm quan sản phẩm

Studio live-service không chấm developer chỉ bằng "code chạy đúng". Họ chấm bạn có hiểu **code của mình đổi hành vi người chơi và doanh thu thế nào** không. Ba lý do thực tế:

- Một game sống mười năm là **một cỗ máy vận hành**, nơi mỗi quyết định kỹ thuật (thời gian tải, kích thước patch, cách tải event) ảnh hưởng chỉ số.
- Dev ngồi gần nhất với dữ liệu: bạn gắn event analytics, bạn thấy crash log, bạn là người đầu tiên biết màn nào người chơi rời đi.
- Người có cảm quan sản phẩm đề xuất được thay đổi **có số đo**, và đó là khác biệt giữa "người thực thi" và "người cùng làm sản phẩm".

## 2. Từ vựng phải dùng đúng

| Thuật ngữ | Một dòng | Dev ảnh hưởng thế nào |
|---|---|---|
| **Core loop** | Chuỗi hành động người chơi lặp lại trong một phiên — xem [[core-loop]] | Độ mượt thao tác, thời gian chờ giữa các bước |
| **Meta loop** | Vòng lặp dài hơn bao quanh core loop: nâng cấp, sưu tầm, event theo tuần — xem [[meta-systems]] | Tốc độ mở màn, độ gọn UI quản lý |
| **Session** | Một lần mở app tới lúc thoát | Thời gian khởi động và tải màn quyết định bao nhiêu phút của phiên bị lãng phí |
| **Retention D1/D7/D30** | Tỉ lệ người cài hôm nay còn quay lại sau 1/7/30 ngày | Crash, tải lâu, onboarding rối làm D1 tụt |
| **DAU / MAU** | Số người hoạt động mỗi ngày / mỗi tháng; DAU÷MAU cho biết độ "dính" | Thông báo đẩy, nhắc nhiệm vụ ngày |
| **ARPU / ARPPU / ARPDAU** | Doanh thu trung bình trên mỗi người dùng / mỗi người trả tiền / mỗi người hoạt động mỗi ngày | Độ mượt luồng mua hàng, lỗi thanh toán |
| **Conversion** | Tỉ lệ người chơi trở thành người trả tiền | Hiển thị gói đúng lúc, giá đúng vùng, không lỗi |
| **LTV** | Tổng doanh thu kỳ vọng từ một người chơi suốt vòng đời | Mọi thứ giữ chân người chơi lâu hơn |
| **Churn** | Tỉ lệ người rời bỏ game trong một kỳ | Crash, lag, patch quá nặng bắt tải lại |
| **Funnel** | Chuỗi bước mà mỗi bước rớt một phần: cài → qua tutorial → quay gacha lần đầu → nạp lần đầu | Gắn event ở **từng bước** để thấy bước nào rớt nhiều nhất |

Ba câu nối dev với chỉ số, nên nhớ nguyên văn ý:

1. **Thời gian tải và crash làm tụt D1** — người chơi chưa kịp thấy game hay đã bỏ.
2. **Hiệu năng trên máy yếu quyết định ai chơi được lâu** — máy nóng, tụt fps là lý do rời đi âm thầm, không để lại phản hồi.
3. **Analytics đúng chỗ biến ý kiến thành dữ liệu** — không có event ở bước nào thì không biết người chơi rớt ở bước đó.

Retention là thước đo nền của [[playtesting-metrics]]; hiểu cách đọc nó quan trọng hơn thuộc con số.

## 3. Kinh tế RPG gacha — tác động lên client

Nền tảng nằm ở [[economy-design]] (source/sink, faucet/drain). Áp vào RPG gacha:

- **Tiền tệ cứng (hard/premium) và mềm (soft):** tiền cứng thường mua bằng tiền thật hoặc kiếm chậm, dùng quay gacha; tiền mềm kiếm bằng chơi, dùng nâng cấp. Client **không bao giờ tự tính số dư** — server là nguồn chân lý, client chỉ hiển thị và gửi yêu cầu.
- **Faucet/drain:** nguồn sinh (nhiệm vụ, event, login bonus) và nơi tiêu (quay gacha, nâng cấp, mở rộng kho). Event mới là một faucet tạm thời; nếu không có drain tương ứng thì lạm phát, người chơi chán vì "không còn gì để mua".
- **Stamina (năng lượng):** giới hạn số lần chơi mỗi ngày, vừa làm nhịp chơi vừa là điểm bán gói hồi. Client phải hiển thị **thời điểm đầy** chính xác (đồng bộ giờ server, không tin đồng hồ máy).
- **Pity (bảo hiểm gacha):** sau N lần không ra mục tiêu thì được đảm bảo. Là cơ chế tạo niềm tin; client hiển thị bộ đếm theo dữ liệu server — xem [[randomness]] về vì sao ngẫu nhiên thuần gây cảm giác bị lừa.
- **Banner:** nhóm nhân vật có hạn, xoay theo lịch. Client cần tải ảnh banner, đếm ngược và chuyển banner **không build lại**.
- **Power creep:** nhân vật mới mạnh hơn nhân vật cũ để người chơi có lý do quay gacha. Phía client nó là chi phí: số nhân vật, skill effect, asset cộng dồn qua từng năm, trong khi máy người chơi không mạnh lên.

Lưu ý đạo đức nên có sẵn: gacha nuôi được game nhiều năm, nhưng cần minh bạch tỉ lệ và để người không nạp vẫn chơi được. Nói cân bằng, không chê, không bênh.

## 4. Live-ops

Chi tiết ở [[liveops]]. Góc nhìn dev:

| Khái niệm | Ý nghĩa | Việc của client |
|---|---|---|
| **Lịch event** | Chuỗi event/banner lên kế hoạch trước nhiều tuần | Tải nội dung theo lịch, ẩn/hiện theo giờ server |
| **Collab IP** | Hợp tác với IP ngoài (anime, game, thương hiệu) để kéo người chơi mới và cũ quay lại | Nhân vật, effect, UI riêng đưa vào qua tải nội dung, không phải bản cập nhật app |
| **Season** | Chu kỳ có điểm bắt đầu và kết thúc, thường kèm phần thưởng | Reset dữ liệu mùa không làm hỏng dữ liệu người chơi |
| **A/B test** | Chia người chơi hai nhóm, thử hai phiên bản, so chỉ số | Hai biến thể cùng tồn tại trong một bản build; gắn nhãn nhóm vào event analytics |
| **Remote config** | Đổi tham số (giá, tỉ lệ, bật/tắt tính năng) từ server không cần build | Mọi con số có thể đổi đều đọc từ config, có giá trị mặc định khi mất mạng |

Điểm dev nên nhấn: **mọi thứ sống theo lịch phải đổi được mà không qua duyệt store.** Đó là lý do hệ thống asset tải thêm và remote config tồn tại.

## 5. Game feel và juice — phần dev tạo ra trực tiếp

Đây là mảng bạn có thể nói với tư cách **người làm ra nó**. Chi tiết số ở [[game-feel]]:

- **Hitstop:** đóng băng ngắn khi trúng đòn, tạo cảm giác lực.
- **Screen shake:** rung camera có giảm dần; phải tắt được vì có người chơi khó chịu.
- **Feedback:** mọi hành động đều có phản hồi (âm, hình, rung) đúng khung hình xảy ra hành động.

Trong game gacha, juice còn nằm ở **màn quay gacha**: nhịp chờ, hiệu ứng khi ra nhân vật hiếm. Đây là khoảnh khắc đáng nhớ nhất của game và cũng là chỗ tốn asset, tốn bộ nhớ, dễ giật. Từ góc dev, câu đáng nói là: juice làm game hay hơn nhưng **phải nằm trong ngân sách hiệu năng của máy yếu**, và phải đọc được trận đấu khi có nhiều hiệu ứng cùng lúc.

## 6. Onboarding và FTUE

FTUE (first-time user experience) là những phút đầu tiên — nơi funnel rớt nhiều nhất. Nền tảng ở [[onboarding]]. Điều dev kiểm soát:

- **Thời gian từ mở app tới lúc được tự chơi**, gồm cả màn tải, tải dữ liệu lần đầu, đăng nhập.
- **Số bước bắt buộc** trước khi tới thao tác đầu tiên có vui.
- **Độ ổn định trên máy yếu** ở những phút đó: crash ở phút thứ ba là mất người chơi vĩnh viễn.
- **Tải nền trong lúc chơi tutorial**, để không bắt người chơi nhìn thanh tiến độ.

Khi đánh giá FTUE của một game, hãy đo bằng đồng hồ chứ đừng tả bằng cảm giác.

## 7. Đề xuất cải tiến có số đo

Câu "nếu được thêm một tính năng / sửa một màn thì anh làm gì" là câu để bạn nói như người làm sản phẩm. Khung bốn bước, mỗi bước một câu:

| Bước | Nội dung | Ví dụ hình dạng câu (không phải nhận xét về game cụ thể) |
|---|---|---|
| **Quan sát** | Điều tôi thấy khi chơi, kèm số tôi đo | "Từ lúc mở app tới lúc vào được màn đầu tôi đếm được X giây" |
| **Giả thuyết** | Vì sao nó ảnh hưởng chỉ số nào | "Tôi đoán phần chờ này làm rớt người chơi mới ở bước đầu của funnel" |
| **Đề xuất** | Thay đổi nhỏ, làm được trong vài sprint | "Tải nền các asset không cần ngay trong lúc tutorial chạy" |
| **Cách đo** | Chỉ số nào nhúc nhích thì coi là thành công, thử bằng A/B | "So D1 và tỉ lệ qua tutorial giữa hai nhóm" |

Nguyên tắc: đề xuất **nhỏ, đo được, có rủi ro nêu rõ**. Một tính năng lớn mới ("thêm chế độ PvP") nghe sáng tạo nhưng không ai tin bạn đo được nó; một điều chỉnh nhỏ có số đo cho thấy bạn hiểu cách đội làm việc.

## 8. Tự chơi một game để phỏng vấn

Sổ ghi chép từng ô đã có ở [[interview-personality]]; đừng chép lại. Phần thêm ở đây là **cách chơi có chủ đích**:

1. **Chơi hai lớp:** một buổi chơi như người chơi bình thường (để có cảm xúc thật), một buổi chơi như người đo (bấm giờ, đếm bước, để ý nhiệt máy).
2. **Chơi như người mới và như người lâu năm:** nếu được, mở một tài khoản mới để thấy FTUE hiện tại — tài khoản cũ che mất những phút đầu.
3. **Tới ít nhất một event và một lần quay gacha**, vì đó là hai nơi hội tụ gần như mọi hệ thống.
4. **Ghi chỉ số bạn đoán game đang theo đuổi** (giữ chân, doanh thu, kéo người mới) cho từng tính năng bạn gặp, rồi tự hỏi "vì sao họ làm vậy".
5. **Kiểm lại mọi dữ kiện** (tên game, năm, tính năng) với trang chính thức; không dùng AI để biết game có gì.

## 🤖 Prompt cho AI

**Dùng AI thế nào để luyện cảm quan sản phẩm**

AI rất hợp để làm **người phỏng vấn mô phỏng**: nó hỏi vặn về chỉ số, bắt bạn nối code của mình với retention hay funnel, và chỉ ra chỗ bạn nói cảm tính. Nó không hợp để **cung cấp thông tin game cụ thể** — nó hay bịa tính năng hoặc nhầm game giữa các studio — và không hợp để **bịa số benchmark**. Quy trình: bạn chơi và ghi quan sát thật; AI chỉ chấm cách bạn diễn đạt.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Quan sát thật từ buổi chơi của bạn (số giây tải, số bước, tên event) — AI không được tự thêm.
- Vị trí ứng tuyển (Unity client) để nó hỏi đúng mảng dev ảnh hưởng chỉ số.
- Chỉ số nào bạn đã thật sự làm việc cùng ở công việc cũ, để nó không ép bạn nhận kinh nghiệm không có.
- Mức bạn muốn: chỉ kiểm từ vựng, hay hỏi vặn kiểu vòng cuối.

**Mẫu prompt**

```
Tôi là Unity client developer 10 năm, phỏng vấn RPG gacha live-service.
Quan sát thật của tôi khi chơi: <dán ghi chú: số giây tải, số bước tutorial, ...>.
Hãy đóng vai người phỏng vấn, hỏi TỪNG CÂU MỘT, tổng 6 câu:
1) Hai câu về chỉ số (retention, funnel, ARPDAU) buộc tôi nối với việc dev làm.
2) Hai câu về kinh tế gacha (pity, faucet/drain) từ góc client.
3) Hai câu "đề xuất cải tiến" bắt tôi nêu quan sát -> giả thuyết -> đề xuất -> cách đo.
Sau mỗi câu trả lời của tôi: chấm 1-5, chỉ ra chỗ nói cảm tính, gợi ý viết lại.
KHÔNG tự kể tính năng của bất kỳ game cụ thể nào. KHÔNG đưa số benchmark
retention/doanh thu nếu không ghi rõ "chỉ để tham khảo, khác theo thể loại".
```

**Bẫy thường gặp:** AI đưa ra "retention chuẩn ngành" nghe chắc chắn nhưng số khác nhau theo thể loại, vùng, thời điểm — đừng học thuộc. Bẫy thứ hai: nó viết đề xuất cải tiến quá to và không đo được; bắt nó thu nhỏ về thay đổi làm được trong vài sprint. Bẫy thứ ba: nó dùng từ chỉ số lẫn lộn (ARPU với ARPPU, LTV với doanh thu) — tự kiểm lại bảng ở mục 2.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Core loop và meta loop khác nhau thế nào?**
  → Core loop là chuỗi hành động lặp lại trong một phiên, ví dụ vào màn, đánh, nhận nguyên liệu. Meta loop là vòng dài hơn bao quanh nó: dùng nguyên liệu nâng nhân vật, mở màn mới, theo đuổi event tuần. Phân biệt vì core loop quyết định phiên chơi có vui không, còn meta loop quyết định người chơi có quay lại ngày mai không.
- `Junior` **Retention D1, D7, D30 nghĩa là gì?**
  → Là tỉ lệ người cài vào một ngày còn quay lại sau 1, 7, 30 ngày. D1 phản ánh trải nghiệm đầu tiên, D7 phản ánh game có thói quen không, D30 phản ánh độ gắn bó lâu dài. Tôi nhắc từng mốc vì mỗi mốc bị tác động bởi những thứ khác nhau.
- `Junior` **DAU và MAU khác nhau thế nào, tỉ lệ DAU/MAU cho biết gì?**
  → DAU là số người hoạt động mỗi ngày, MAU là số người hoạt động trong tháng. DAU chia MAU càng cao thì người chơi vào game càng đều, nghĩa là game dính. Hai game cùng MAU mà DAU khác nhiều thì một game là thói quen hằng ngày, một game là ghé thăm thỉnh thoảng.
- `Junior` **ARPU, ARPPU, ARPDAU khác nhau thế nào?**
  → ARPU là doanh thu trung bình trên mỗi người dùng, ARPPU chỉ tính trên người đã trả tiền, ARPDAU là trên mỗi người hoạt động mỗi ngày. Khác nhau ở mẫu số, nên ARPPU luôn cao hơn ARPU vì phần lớn người chơi không nạp. Tôi phân biệt kỹ vì nhầm mẫu số là cách nhanh nhất để đọc sai báo cáo.
- `Junior` **Tiền tệ cứng và mềm khác nhau thế nào?**
  → Tiền cứng thường mua bằng tiền thật hoặc kiếm rất chậm, dùng cho thứ hiếm như quay gacha. Tiền mềm kiếm đều bằng chơi, dùng nâng cấp hằng ngày. Tách hai loại vì nếu gộp, game không điều chỉnh riêng được giá trị của thứ hiếm và thứ phổ thông.
- `Junior` **Stamina trong game mobile để làm gì?**
  → Giới hạn số lần chơi trong một khoảng thời gian, tạo nhịp chơi đều đặn và là điểm bán gói hồi phục. Với client, tôi phải hiển thị thời điểm đầy theo giờ server chứ không theo đồng hồ máy, vì người chơi chỉnh giờ máy sẽ phá cơ chế.
- `Junior` **Pity trong gacha là gì?**
  → Là cơ chế đảm bảo sau một số lần quay không ra mục tiêu thì lần kế tiếp chắc chắn ra. Nó giữ niềm tin của người chơi vì ngẫu nhiên thuần dễ tạo chuỗi xui rất dài, xem [[randomness]]. Client chỉ hiển thị bộ đếm do server gửi, không tự tính.
- `Mid` **Crash và thời gian tải ảnh hưởng chỉ số nào?**
  → Cả hai kéo tụt D1 và đẩy churn lên, vì người chơi mới chưa kịp thấy phần hay đã gặp trải nghiệm xấu. Crash ở những phút đầu còn tệ hơn crash muộn, vì người đó chưa có gì để mất. Tôi đo bằng crash-free rate và thời gian tới lúc tự chơi được, rồi so theo từng bản build.
- `Mid` **Funnel là gì và dev giúp gì cho nó?**
  → Funnel là chuỗi bước mà mỗi bước rớt một phần người chơi, ví dụ cài, qua tutorial, quay gacha đầu, nạp đầu. Dev đặt event analytics ở từng bước để thấy bước nào rớt nhiều nhất. Không có event thì mọi bàn luận chỉ là phỏng đoán, vì vậy tôi coi đặt event là một phần của tính năng, không phải việc thêm sau.
- `Mid` **Faucet và drain trong game gacha là gì, event ảnh hưởng thế nào?**
  → Faucet là nơi tiền tệ sinh ra (nhiệm vụ, event, login bonus), drain là nơi nó mất đi (quay gacha, nâng cấp). Mỗi event mới là một faucet tạm thời, nếu không có drain đi kèm thì lượng tiền dư ra và người chơi hết lý do mua. Xem [[economy-design]]; client thấy điều này ở số dư và ở việc người chơi chờ gì.
- `Mid` **Power creep là gì và nó gây chi phí gì cho client?**
  → Là hiện tượng nhân vật mới mạnh hơn nhân vật cũ để người chơi có lý do quay gacha. Phía client, chi phí là số nhân vật, skill effect và asset cộng dồn qua nhiều năm trong khi máy người chơi không mạnh lên. Vì vậy tôi quan tâm tới ngân sách bộ nhớ, tải theo nhu cầu và quản lý vòng đời asset ngay từ đầu.
- `Mid` **Remote config dùng để làm gì trong live-service?**
  → Đổi tham số như giá, tỉ lệ, bật tắt tính năng từ server mà không build lại hay qua duyệt store. Nhờ nó đội live-ops chỉnh nhanh khi event lệch kỳ vọng. Tôi luôn đặt giá trị mặc định trong client để khi mất mạng hoặc config lỗi game vẫn chạy được.
- `Mid` **A/B test cần dev làm gì?**
  → Dev bảo đảm hai biến thể cùng tồn tại trong một bản build, người chơi được gán nhóm ổn định, và mọi event analytics gắn nhãn nhóm đó. Nếu nhãn thiếu thì kết quả không phân tích được. Tôi cũng tránh để hai biến thể có hiệu năng khác nhau, vì như vậy chỉ số khác nhau có thể do lag chứ không do thiết kế.
- `Mid` **Một event collab mới cần client chuẩn bị gì?**
  → Nhân vật, effect, UI và âm thanh mới phải vào game qua tải nội dung chứ không bắt cập nhật app, và phải ẩn hiện đúng theo lịch server. Rủi ro lớn là dung lượng tải và hiệu năng khi nhiều asset mới cùng xuất hiện, nên tôi kiểm trên máy yếu trước ngày mở event. Xem [[liveops]].
- `Mid` **Hitstop và screen shake khác nhau thế nào, vì sao cần cả hai?**
  → Hitstop đóng băng ngắn khi trúng đòn để tạo cảm giác lực, screen shake rung camera để tạo cảm giác va chạm. Hitstop rẻ và hiệu quả nhất, screenshake nên có giảm dần và tắt được trong cài đặt. Xem [[game-feel]]; dùng cả hai tạo phản hồi, nhưng quá tay thì khó đọc trận đấu.
- `Mid` **FTUE tốt trông thế nào về mặt kỹ thuật?**
  → Thời gian từ mở app tới lúc tự chơi ngắn, ít bước bắt buộc, không crash, và tải nền các thứ không cần ngay trong lúc tutorial chạy. Tôi đo bằng đồng hồ và funnel chứ không bằng cảm giác. Vì phần lớn người rời đi ở những phút này, nên cải thiện một giây ở đây có giá trị hơn một giây ở nội dung muộn.
- `Mid` **Anh đánh giá thời gian tải của một game thế nào?**
  → Tôi bấm giờ ở ba điểm: mở app tới màn hình đầu, đăng nhập tới màn chính, và vào một màn chơi. Ghi cả lần đầu cài (tải dữ liệu) và lần chạy tiếp theo (cache). Hai con số khác nhau cho biết lỗi nằm ở dung lượng tải hay ở khởi tạo.
- `Mid` **Một game gacha giữ người chơi qua nhiều năm bằng những đòn bẩy nào?**
  → Vòng lặp hằng ngày (nhiệm vụ, stamina), sưu tầm và nâng nhân vật, nội dung theo mùa và collab để có lý do quay lại, và cộng đồng. Tôi nhìn chúng như các lớp: core loop giữ phiên chơi, meta loop giữ ngày mai, live-ops giữ năm sau. Xem [[player-motivation]] về động lực đằng sau.
- `Mid` **Anh nhìn gacha dưới góc đạo đức thế nào?**
  → Gacha là mô hình nuôi được game nhiều năm, nhưng cần minh bạch tỉ lệ, có pity để người chơi tin hệ thống, và người không nạp vẫn có thứ để chơi. Tôi không bênh vực vô điều kiện cũng không chê, vì ở studio sống bằng gacha thì người hỏi muốn thấy bạn hiểu cả hai mặt. Phía client, trách nhiệm của tôi là hiển thị đúng những gì server quyết.
- `Mid` **Muốn biết một tính năng có hiệu quả không, anh làm gì?**
  → Đặt trước chỉ số thành công, gắn event, rồi so nhóm có và không có tính năng bằng A/B nếu được. Tôi hỏi trước: chỉ số nào nhúc nhích thì coi là thành công, và cần theo dõi bao lâu. Làm sau khi ra mắt thì chỉ có tương quan, không có nhân quả.
- `Mid` **Dữ liệu thấy D1 tụt sau một bản cập nhật, anh làm gì đầu tiên?**
  → Tách nguyên nhân kỹ thuật khỏi nguyên nhân thiết kế: crash-free rate, thời gian tải, lỗi theo model máy mới sau bản đó. Cách này nhanh và rẻ, nên làm trước khi nghi ngờ thiết kế. Nếu số kỹ thuật sạch thì mới xem funnel của người chơi mới xem bước nào rớt.
- `Senior` **Anh sẽ đề xuất cải thiện gì cho game này, và đo thế nào?**
  → Tôi chọn một điểm tôi tự đo được khi chơi, ví dụ thời gian chờ ở một bước cụ thể, nêu giả thuyết về chỉ số nó ảnh hưởng, đề xuất thay đổi nhỏ và cách A/B. Tôi chọn đề xuất nhỏ vì làm được trong vài sprint và đo được. Tôi nói rõ rủi ro, ví dụ thay đổi có thể làm tăng dung lượng tải.
- `Senior` **Hai chỉ số kéo ngược nhau (ví dụ doanh thu và retention), anh chọn gì?**
  → Tôi hỏi game đang ở giai đoạn nào: game già thường ưu tiên giữ chân người hiện có vì LTV tích luỹ theo thời gian. Rồi tôi đề xuất thử nhỏ để lấy dữ liệu thay vì chọn bằng lý luận. Vì đẩy doanh thu ngắn hạn mà làm người chơi chán thì thiệt về LTV.
- `Senior` **Anh đánh đổi thế nào giữa juice đẹp và hiệu năng trên máy yếu?**
  → Tôi đặt ngân sách trước (fps mục tiêu, bộ nhớ trên máy yếu), rồi cho juice quan trọng nhất vào, ví dụ hitstop và flash rẻ, hiệu ứng nặng chỉ ở khoảnh khắc đáng nhớ như quay gacha. Có tuỳ chọn giảm hiệu ứng cho máy yếu. Vì game sống nhiều năm cần máy yếu vẫn chơi được, nếu không mất cả nhóm người chơi.
- `Senior` **Làm sao đưa nội dung collab mới vào mà không làm tăng chi phí bảo trì?**
  → Dữ liệu hoá nhân vật, skill, event (ScriptableObject hoặc bảng), dùng prefab và hiệu ứng tái dùng từ thư viện chung, và tải bằng bundle tách riêng. Mỗi collab mới là thêm dữ liệu chứ ít khi thêm code. Nếu mỗi collab cần code riêng thì sau mười năm kho code sẽ không ai dám sửa.
- `Senior` **Anh chuẩn bị gì để mô tả một game của chúng tôi mà không nói sai?**
  → Tôi chơi thật vài ngày, ghi chú quan sát của mình, và kiểm mọi dữ kiện với trang chính thức trước ngày phỏng vấn. Chỉ nói những gì tôi đã thấy, và nói rõ đây là quan sát của một người chơi mới chứ không phải người nắm số liệu nội bộ. Vì nói sai tính năng của game họ làm ra là mất tin tưởng ngay.
- `Senior` **Nếu là người quyết định, anh có thêm một tính năng mới hay cải thiện cái có sẵn?**
  → Nếu chỉ số nền chưa tốt (D1, crash, tải) thì sửa cái có sẵn trước, vì thêm tính năng lên nền yếu thì tính năng đó không phát huy. Nếu chỉ số nền khoẻ mà tăng trưởng chững thì tính năng mới có lý do. Quyết định bằng funnel: chỗ nào rớt nhiều nhất thì chỗ đó đáng đầu tư.
- `Senior` **Anh sẽ dạy một junior nhìn game bằng mắt chỉ số thế nào?**
  → Cho bạn ấy chơi một game bằng đồng hồ và sổ ghi: bấm giờ tải, đếm bước, ghi mỗi tính năng gặp được đang cố cải thiện chỉ số nào. Rồi cùng nhìn funnel thật của game mình. Vì người trẻ thường nhìn game như người chơi, và bước chuyển sang nhìn như người làm cần luyện bằng ví dụ thật.

**Khung trả lời 60 giây** — "Theo anh vì sao một game gacha giữ được người chơi mười năm?"

> Tôi nghĩ có ba lớp chồng lên nhau. Lớp thứ nhất là core loop vui và đủ nhẹ để chơi mỗi ngày, cộng với nhiệm vụ hằng ngày tạo thói quen. Lớp thứ hai là sưu tầm và nâng nhân vật, cho người chơi mục tiêu dài hơn một phiên. Lớp thứ ba là live-ops: event và collab liên tục cho người chơi cũ lý do quay lại và người mới lý do vào. Từ góc người làm client, lớp thứ ba là lớp khó nhất, vì nội dung mới phải vào game mà không bắt cập nhật app, và game phải chạy được trên máy của người chơi cũ mà số nhân vật cứ tăng qua từng năm. Tôi chưa biết nội bộ đội đo thế nào, nhưng tôi đoán họ nhìn retention và funnel theo từng event để biết collab nào thật sự kéo người chơi.

**Họ sẽ đào tiếp**

- *"Anh nối việc dev làm với retention thế nào?"* → Nêu ít nhất hai đường cụ thể: crash và thời gian tải ảnh hưởng D1, hiệu năng trên máy yếu ảnh hưởng người ở lại lâu.
- *"Một collab thất bại thì nhìn chỉ số nào để biết?"* → Funnel của event (số người vào, số người hoàn thành), doanh thu event, và liệu người chơi cũ có quay lại; nói rõ cần so với event trước.
- *"Vì sao pity lại quan trọng?"* → Niềm tin vào hệ thống, giảm cảm giác bị lừa, đổi lại cân bằng kinh tế của đội thiết kế; client chỉ hiển thị dữ liệu server.
- *"Nếu giảm thời gian tải 2 giây, anh kỳ vọng gì?"* → Kỳ vọng ở phút đầu của funnel và D1, nhưng nói rõ phải đo bằng A/B chứ không khẳng định trước độ lớn.
- *"Làm sao anh biết thay đổi này không làm hỏng chỉ số khác?"* → Chỉ số bảo vệ (crash-free rate, thời gian tải, doanh thu) theo dõi song song với chỉ số mục tiêu.
- *"Anh gắn analytics thế nào để không rối?"* → Đặt tên event có quy ước, ít thuộc tính nhưng đủ để cắt theo nhóm, có phiên bản schema.
- *"Anh sẽ làm gì trong tuần đầu để hiểu sản phẩm?"* → Chơi tài khoản mới và tài khoản cũ, đọc tài liệu pipeline nội dung, hỏi đội về chỉ số họ theo dõi.
- *"Game này khác game nào cùng thể loại?"* → So bằng cơ chế (vòng lặp, kinh tế, nhịp live-ops) chứ không bằng đồ hoạ; nói rõ phần nào là quan sát, phần nào là suy đoán.

**Cờ đỏ**

- Nói "game hay, đồ hoạ đẹp" rồi không chỉ ra cơ chế hay chỉ số nào.
- Nhầm ARPU, ARPPU, ARPDAU hoặc nói retention như một con số duy nhất.
- Đưa con số retention hoặc doanh thu "chuẩn ngành" như thể chắc chắn, không nói đó là tham khảo.
- Mô tả tính năng của game họ mà không chắc, hoặc nhầm game của studio khác.
- Chê gacha hoặc monetization ở công ty sống bằng nó, hoặc ngược lại bênh vực như không có vấn đề đạo đức.
- Đề xuất cải tiến to, không có cách đo ("thêm chế độ PvP").
- Cho rằng chỉ số là việc của designer, dev chỉ lo code.
- Nói "game này nên..." mà chưa tự chơi đủ để có quan sát riêng.

**Số / ví dụ nên thuộc**

- Mốc retention: **D1 · D7 · D30** — mỗi mốc phản ánh thứ khác nhau (trải nghiệm đầu / thói quen / gắn bó dài).
- Công thức nhớ: **DAU ÷ MAU** đo độ dính; ARPU, ARPPU, ARPDAU khác nhau ở **mẫu số**.
- Retention và doanh thu điển hình chỉ là **tham khảo**, khác theo thể loại, vùng và thời điểm — không học thuộc con số, hãy học cách đọc.
- Funnel mẫu: **cài → qua tutorial → quay gacha đầu → nạp đầu** — mỗi bước một event.
- Game feel: **hitstop 50–120 ms** khi trúng đòn (xem [[game-feel]]).
- Ba đòn bẩy giữ chân nhiều năm: **vòng lặp hằng ngày · sưu tầm nhân vật · live-ops/collab**.
- Khung đề xuất: **quan sát → giả thuyết → đề xuất → cách đo**.
- Điều kiện hạ tầng live-ops: **tải nội dung không build lại · remote config có giá trị mặc định · event analytics có nhãn nhóm A/B**.
