---
title: Quy ước thể loại
icon: 📚
summary: Kỳ vọng mặc định người chơi mang theo khi bước vào một thể loại — biết để dùng, và để cố ý phá.
status: deep
read: 70
level: basic
order: 60
tags: [foundations, genre]
related: [design-pillars, ux-hud]
---

Mỗi thể loại đi kèm một bộ kỳ vọng ngầm. Tuân theo thì người chơi hiểu game ngay mà không cần tutorial; phá vỡ thì phải trả giá bằng công sức dạy lại — và phải đáng.

Quy ước không phải luật lệ do ai ban hành. Nó là **thói quen đã đóng băng**: vài chục game thành công làm giống nhau đủ lâu, người chơi học thuộc, và từ đó trở đi mọi game trong thể loại đều bị so với cái khuôn ấy — kể cả game cố tình không theo.

## Quy ước là ngân sách tutorial miễn phí

Người chơi deckbuilder đã biết thế nào là deck, draw, discard, energy. Dùng đúng từ vựng đó thì bạn tiết kiệm được cả một màn hướng dẫn — công sức ấy chuyển sang dạy phần **thật sự mới** trong game của bạn.

Đây là lý do quy ước đáng tiền chứ không phải chuyện thiếu sáng tạo. [[onboarding]] là khâu tốn kém nhất và dễ mất người chơi nhất; mỗi khái niệm không phải dạy là một cơ hội bỏ cuộc bị xoá đi.

Hệ quả ngược lại cũng đúng: **mỗi lần phá quy ước, bạn tự tạo thêm một việc phải dạy.** Nên câu hỏi trước khi phá luôn là *điều này mua được gì cho [[design-pillars]] của tôi?* Nếu câu trả lời là "cho khác biệt" thì chưa đủ — khác biệt không phải giá trị, nó chỉ là hệ quả của một giá trị nào đó.

## Ba lớp quy ước, ba mức giá

Không phải quy ước nào cũng đắt như nhau khi phá. Xếp chúng theo chi phí dạy lại thì ra ba lớp:

<figure class="fig">
<svg viewBox="0 0 660 252" role="img" aria-label="Ba lớp quy ước thể loại xếp theo chi phí phá vỡ: từ vựng rẻ nhất, cấu trúc trung bình, kỳ vọng lõi đắt nhất">
  <text x="14" y="22" class="fig-muted" font-size="11">lớp quy ước</text>
  <text x="474" y="22" class="fig-muted" font-size="11">chi phí dạy lại nếu phá →</text>
  <rect x="14" y="34" width="126" height="42" rx="6" class="fig-box"/>
  <text x="77" y="53" text-anchor="middle" class="fig-label" font-size="13">Từ vựng</text>
  <text x="77" y="68" text-anchor="middle" class="fig-muted" font-size="10">deck · run · wave</text>
  <rect x="150" y="41" width="92" height="28" rx="4" fill="#51cf9b" opacity="0.32"/>
  <text x="252" y="59" class="fig-muted" font-size="11">phá = mất ngân sách, hầu như không mua lại được gì</text>
  <rect x="14" y="92" width="126" height="42" rx="6" class="fig-box"/>
  <text x="77" y="111" text-anchor="middle" class="fig-label" font-size="13">Cấu trúc</text>
  <text x="77" y="126" text-anchor="middle" class="fig-muted" font-size="10">nhịp · số lượng · layout</text>
  <rect x="150" y="99" width="208" height="28" rx="4" fill="#ffd43b" opacity="0.32"/>
  <text x="368" y="117" class="fig-muted" font-size="11">phá được — nếu đổi lấy một pillar rõ ràng</text>
  <rect x="14" y="150" width="126" height="42" rx="6" class="fig-box"/>
  <text x="77" y="169" text-anchor="middle" class="fig-label" font-size="13">Kỳ vọng lõi</text>
  <text x="77" y="184" text-anchor="middle" class="fig-muted" font-size="10">run phải kết thúc</text>
  <rect x="150" y="157" width="400" height="28" rx="4" fill="#ff8787" opacity="0.32"/>
  <text x="162" y="175" font-size="11" fill="#ff8787">phá = bạn đang làm một thể loại khác, hãy gọi đúng tên nó</text>
  <line x1="150" y1="210" x2="640" y2="210" class="fig-line"/>
  <path d="M634 205 L646 210 L634 215 Z" class="fig-line" fill="currentColor"/>
  <text x="152" y="228" class="fig-muted" font-size="10">rẻ</text>
  <text x="612" y="228" class="fig-muted" font-size="10">rất đắt</text>
</svg>
<figcaption>Phá lớp trên cùng gần như luôn là lỗ. Phá lớp dưới cùng thì không còn là "phá quy ước" nữa — đó là đổi thể loại, và marketing phải đổi theo.</figcaption>
</figure>

**Từ vựng** là tên gọi: run, deck, wave, prestige, biome. Đổi tên mà không đổi cơ chế là trò chơi chữ — người chơi vẫn phải học từ mới để chỉ đúng thứ họ đã biết. Gần như không bao giờ đáng.

**Cấu trúc** là nhịp và số lượng: một run dài bao lâu, bao nhiêu lựa chọn mỗi lần nâng cấp, đặt gì ở góc nào màn hình. Đây là lớp phá được, và là nơi phần lớn đổi mới thật sự xảy ra.

**Kỳ vọng lõi** là điều kiện để thể loại còn là thể loại đó. Roguelike mà chết không mất gì thì người chơi không còn cảm giác rủi ro — thứ khiến mọi quyết định trong run có trọng lượng. Phá lớp này không sai, nhưng đừng vừa phá vừa dùng tên thể loại cũ để quảng cáo.

## Bảng quy ước sáu thể loại

| Thể loại | Core loop chuẩn | Độ dài phiên | Mô hình tiến trình | Layout UI mặc định |
|---|---|---|---|---|
| **Roguelike** | chạy → chết → mở khoá → chạy lại | 20–45 phút mỗi run | meta-progression giữa các run; trong run reset sạch | minimap góc, thanh máu trái, túi đồ dạng lưới |
| **Metroidvania** | khám phá → gặp tường → tìm khả năng → quay lại mở đường cũ | 1–3 giờ mỗi phiên, 8–15 giờ tổng | ability gating, gần như không có cấp độ | **bản đồ toàn màn hình là màn hình quan trọng nhất** |
| **Deckbuilder** | rút bài → tiêu energy → kết thúc lượt → thêm bài vào deck | 45–90 phút mỗi run | deck mạnh lên trong run, reset sau đó | tay bài dưới cùng, energy góc trái, đống rút/bỏ hai góc dưới |
| **Survivor-like** | di chuyển → tự đánh → nhặt XP → chọn 1 trong 3–4 nâng cấp | 15–30 phút mỗi run | nâng cấp trong run + meta ngoài run | thanh XP suốt cạnh trên, đồng hồ đếm giữa, **không có nút tấn công** |
| **Tower defense** | đặt trụ → chịu wave → thu tiền → nâng cấp | 10–20 phút mỗi màn | mở khoá trụ mới qua từng màn | palette trụ cạnh dưới, tiền góc trên, số wave luôn hiện |
| **Idle / incremental** | mua → chờ → mua thứ đắt hơn → prestige reset | vài phút mỗi lần, nhiều lần mỗi ngày | prestige: reset để nhận hệ số nhân | danh sách nút mua xếp dọc, số rất to, luôn hiện tốc độ mỗi giây |

Bảng này không phải để chép. Nó là **danh sách thứ người chơi sẽ tự điền vào chỗ trống** nếu bạn không nói gì. Người chơi mở một game gắn nhãn survivor-like sẽ thử di chuyển và chờ nhân vật tự đánh; nếu game của bạn có nút tấn công thì 30 giây đầu họ sẽ tưởng game hỏng.

## Ba lần phá quy ước thành công, và giá của nó

Phá quy ước thành công không bao giờ là bỏ một thứ đi. Luôn là **bỏ một thứ và trả tiền ở chỗ khác**.

**Outer Wilds — bỏ hoàn toàn tiến trình vật phẩm.** Nhân vật kết thúc game mạnh đúng bằng lúc bắt đầu; thứ duy nhất tiến bộ là kiến thức trong đầu người chơi. *Giá:* không giữ chân được bằng "mở khoá gì tiếp theo", nên toàn bộ gánh nặng dồn lên chất lượng của bí ẩn — và người chơi bỏ ngang giữa chừng thì mất sạch, vì tiến trình không nằm trong file save.

**Vampire Survivors — bỏ nút tấn công trong một game hành động.** *Giá:* 30 giây đầu trông như game bị lỗi. Họ trả bằng cách đẩy nâng cấp đầu tiên tới rất sớm, để người chơi kịp hiểu "tôi điều khiển vị trí, không điều khiển đòn đánh" trước khi kịp thoát.

**Into the Breach — bỏ ngẫu nhiên khỏi chiến đấu tactics.** Mọi nước đi của địch hiện rõ trước khi bạn hành động, không có phần trăm trượt. *Giá:* mất loại kịch tính "cầu cho trúng" mà [[randomness]] tạo ra, đổi lấy kịch tính của một bài toán có lời giải. Đổi lại họ phải thiết kế mỗi màn chặt như một câu đố — sai một ô là thua, và không đổ được cho xúi quẩy.

Điểm chung: cả ba đều phá **một** quy ước và giữ nguyên phần còn lại. Phá ba bốn thứ cùng lúc thì người chơi không còn điểm tựa nào để hiểu game.

## Quy ước theo nền tảng

Cùng một thể loại, đổi nền tảng là đổi quy ước — và đây là chỗ hay bị bỏ sót nhất khi port.

| | Mobile | PC | Console |
|---|---|---|---|
| Phiên chơi kỳ vọng | 2–5 phút, ngắt giữa chừng bất cứ lúc nào | 30–90 phút liền | 45 phút–2 giờ liền |
| Điều khiển | một ngón cái, vùng với tới được ở nửa dưới | phím tắt + chuột, hover ra tooltip | tay cầm, **mọi thứ phải tới được bằng D-pad** |
| Khoảng cách nhìn | 30 cm — nhưng ngón tay che mất một phần màn hình | 60 cm | 2–3 m, chữ phải to hơn hẳn |
| Kỳ vọng riêng | có chế độ tự động hoặc idle; mất mạng không được mất tiến trình | đổi phím, nhiều độ phân giải, alt-tab an toàn | tạm dừng đúng chuẩn, đạt cert của nền tảng |

Hai cái bẫy cụ thể: **hover không tồn tại trên mobile và console** — mọi thông tin bạn định giấu trong tooltip phải có đường khác để hiện, xem [[ux-hud]]. Và **menu dựa vào chuột thả tự do sẽ không điều hướng được bằng tay cầm** nếu không có thứ tự focus rõ ràng; thêm phần này lúc sắp phát hành luôn đắt hơn làm từ đầu.

## Đọc quy ước của một thể loại ở đâu

Đừng đoán. Cách rẻ nhất, theo thứ tự:

1. **Chơi ba game đầu bảng của thể loại, 30 phút đầu mỗi game.** Ghi lại: cái gì được dạy, dạy theo thứ tự nào, cái gì game giả định bạn đã biết. Danh sách "giả định bạn đã biết" chính là quy ước.
2. **Đọc review tiêu cực 2–3 sao trên store.** Người chơi ít khi viết ra quy ước họ mong đợi, nhưng họ luôn viết ra lúc nó bị vi phạm — "sao không có auto?", "sao chết mất hết đồ?".
3. **Xem ảnh chụp màn hình trên trang store, đừng xem trailer.** Layout UI lặp lại giữa các game là quy ước; trailer đã qua dựng nên không phản ánh màn hình thật.

## Kiểm tra nhanh

- Gọi tên được thể loại và **ba game tham chiếu** cụ thể chưa?
- Liệt kê được năm thứ người chơi **mặc định kỳ vọng** mà game của bạn không có chưa?
- Mỗi quy ước bạn cố ý phá có gắn với một [[design-pillars]] cụ thể không?
- Đang phá nhiều hơn một quy ước cùng lúc? Nếu có, bỏ bớt.
- Nền tảng đích có quy ước nào mâu thuẫn với thiết kế hiện tại không (hover, phiên ngắn, D-pad)?

## 🤖 Prompt cho AI

Quy ước thể loại là **ngân sách tutorial miễn phí** — nhưng chỉ khi bạn nói rõ mình theo hay phá.

**Dùng AI thế nào cho việc rà quy ước thể loại**

AI mạnh ở đúng một việc tại chủ đề này: **liệt kê cái mặc định**. Nó đã đọc hàng nghìn mô tả game cùng thể loại, nên nó biết khá chính xác người chơi sẽ tự điền gì vào chỗ trống. Hãy dùng nó như một *người chơi trung bình của thể loại* để phát hiện khoảng cách giữa game của bạn và cái khuôn.

Ngược lại, đừng hỏi nó quy ước nào **nên** phá. Câu đó phụ thuộc vào [[design-pillars]] của bạn — thứ nằm ngoài dữ liệu huấn luyện.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Liệt kê kỳ vọng | trước khi chốt tính năng | "Liệt kê thứ người chơi &lt;thể loại&gt; MẶC ĐỊNH kỳ vọng có" |
| Đối chiếu khoảng cách | khi đã có bản mô tả game | "Cái nào trong danh sách đó game tôi KHÔNG có? Với mỗi cái, nói tôi phải dạy lại bằng gì" |
| Phản biện | sau khi quyết định phá | "Tôi bỏ &lt;X&gt;. Đóng vai người chơi bỏ game ở phút thứ 2 và viết review 2 sao" |

**Phải nêu rõ:**
- Thể loại tham chiếu + 2–3 game cụ thể ("giống Slay the Spire, không giống Hearthstone")
- Quy ước nào bạn **cố ý phá**, và phá để được gì
- Nền tảng đích — quy ước mobile khác PC rất nhiều
- Người chơi mục tiêu **đã chơi thể loại này chưa** — quyết định lượng phải dạy

**Mẫu prompt**

```
Thể loại: deckbuilder roguelike. Tham chiếu: Slay the Spire, Monster Train.
Nền tảng: mobile dọc. Người chơi mục tiêu: đã chơi deckbuilder trên PC.

Giữ nguyên quy ước: energy mỗi lượt, draw/discard/exhaust, bản đồ phân nhánh.
CỐ Ý PHÁ: không có relic. Sức mạnh chỉ đến từ cấu trúc deck.
  → mọi đề xuất dạng "vật phẩm cho buff thụ động" đều bị từ chối.

Làm 2 việc, đừng gộp:
1. Liệt kê những gì người chơi deckbuilder MẶC ĐỊNH kỳ vọng mà game tôi
   không có. Mỗi dòng: kỳ vọng | họ học nó từ game nào | tôi phải dạy lại bằng gì.
2. Chỉ ra quy ước nào của deckbuilder PC sẽ gãy trên màn hình dọc mobile
   (tay bài, hover xem chi tiết bài, kích thước vùng chạm).

KHÔNG đề xuất tính năng mới. Chỉ liệt kê khoảng cách.
```

**Bẫy thường gặp:** nói "làm game roguelike" rồi ngạc nhiên khi AI thêm meta-progression cộng chỉ số. Quy ước ngầm của thể loại chính là thứ AI điền vào chỗ trống — im lặng không phải là để ngỏ, im lặng là đồng ý với cái mặc định.

## 🎮 Unity

Trong Unity, quy ước thể loại quy về **chọn đúng package và template** ngay từ `New Project`. Chọn sai thì mất vài ngày làm lại.

**Template và package theo thể loại**

| Thể loại | Template | Package cần thêm |
|---|---|---|
| 2D platformer / roguelike | 2D (URP) | Input System, Cinemachine, TextMeshPro |
| 3D hành động | 3D (URP) | + AI Navigation, Cinemachine |
| Top-down 2D | 2D (URP) | + Tilemap Extras (Rule Tile) |
| Mobile casual | 2D/3D Mobile | + Addressables (giảm dung lượng build) |
| Multiplayer | bất kỳ | Netcode for GameObjects — xem [[unity-multiplayer]] |

**URP hay Built-in?** URP cho dự án mới, gần như không ngoại lệ — Built-in đang ở chế độ bảo trì. Chi tiết ở [[unity-lighting]].

**Package nên thêm ngay, đừng chờ**

```
com.unity.inputsystem        ← đổi phím, tay cầm. Thêm sau rất mệt.
com.unity.cinemachine        ← camera. Tự viết follow là lãng phí.
com.unity.textmeshpro        ← chữ. Text cũ không dùng cho dự án mới.
com.unity.ai.navigation      ← NavMesh (từ 2022 đã tách package)
```

Input System là cái đáng nhấn: nó đổi cách đọc input trên toàn bộ code. Thêm ở tháng thứ ba nghĩa là sửa mọi script có `Input.GetKey`. Xem [[unity-input]].

**Phá vỡ quy ước — chi phí trong Unity**

Quy ước thể loại thường trùng với **cái Unity làm sẵn**. Ví dụ:
- Muốn camera không theo nhân vật → không dùng được preset Cinemachine, phải tự viết
- Muốn UI không dùng Canvas → phải render bằng mesh, mất hết layout system

Không phải lý do để không phá vỡ, nhưng nên biết giá trước.

**Kiểm tra nhanh**
- Đã thêm Input System chứ? (không dùng `Input.GetKey` ở đâu)
- URP hay Built-in? Dự án mới nên URP.
- `Window > Package Manager`: có package nào cài mà không dùng không? (tăng thời gian build)

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Roguelike và roguelite khác nhau ở đâu?**
  → Roguelite có meta-progression: chết xong vẫn giữ lại một phần tiến trình, run sau khoẻ hơn run trước. Roguelike thuần thì mỗi run bắt đầu lại từ số 0, thứ duy nhất tích luỹ là kỹ năng người chơi. Đây không phải chuyện đặt tên: nó quyết định cái gì giữ chân người chơi sau run thứ năm, lúc tò mò đã hết.
- `Junior` **Người chơi mở một game survivor-like lần đầu, họ mặc định kỳ vọng gì?**
  → Không có nút tấn công — nhân vật tự đánh, mình chỉ lo di chuyển; lên cấp thì chọn nâng cấp; một run 15–30 phút, kết bằng cái chết hoặc hết giờ. Ba thứ đó người chơi mang sẵn vào từ phút đầu, nên dạy lại chúng là tiêu ngân sách tutorial vào thứ họ đã biết.
- `Junior` **Quy ước thể loại khác luật chơi chỗ nào?**
  → Luật chơi là thứ game bắt buộc và game phải nói ra. Quy ước là thứ người chơi **giả định sẵn** trước khi game nói gì. Quy ước không nằm trong code, nó nằm trong đầu người chơi — nên giá của việc phá nó tính bằng ngân sách dạy lại, không phải bằng ngày công.
- `Mid` **Sếp muốn bỏ meta-progression khỏi roguelite của ta. Anh phản hồi thế nào?**
  → Đó là phá lớp kỳ vọng lõi, vì meta-progression chính là thứ phân biệt roguelite với roguelike. Tôi không nói không ngay, tôi hỏi hai câu: bỏ để đổi lấy pillar nào, và cái gì giữ chân người chơi sau run thứ năm. Không trả lời được câu thứ hai thì đây là cắt tính năng, không phải quyết định thiết kế.
- `Mid` **Port một deckbuilder từ PC sang mobile dọc — quy ước nào gãy đầu tiên?**
  → Hover. Mọi chi tiết lá bài trên PC nằm trong tooltip, mobile không có trạng thái hover nên phải đổi sang chạm-giữ hoặc panel riêng. Kế đó là tay bài: 10 lá xoè ngang không vừa màn dọc. Rồi tới độ dài phiên — PC thiết kế cho 45–90 phút liền, mobile phải ngắt được giữa run.
- `Mid` **Làm sao anh biết quy ước của một thể loại mình chưa làm bao giờ?**
  → Ba nguồn, rẻ dần. Chơi 30 phút đầu của ba game đầu bảng, ghi lại cái gì game **giả định** mình đã biết. Đọc review 2–3 sao, vì người chơi chỉ viết kỳ vọng ra khi nó bị vi phạm. Xem ảnh chụp màn hình store chứ không xem trailer — layout lặp lại giữa các game chính là quy ước.
- `Senior` **Game của anh muốn phá một quy ước thể loại. Quyết định đó dựa trên cái gì?**
  → Ba câu hỏi theo thứ tự. Nó thuộc lớp nào — từ vựng, cấu trúc, hay kỳ vọng lõi? Nó gắn với design pillar nào? Và tôi **trả tiền ở đâu**, tức bù bằng gì cho thứ vừa lấy đi? Vampire Survivors bỏ nút tấn công nên trả bằng cách đẩy nâng cấp đầu tiên tới rất sớm. Và mỗi lần chỉ phá một thứ.
- `Senior` **Vì sao "làm khác đi cho nổi bật" là lý do tồi để phá quy ước?**
  → Vì khác biệt là hệ quả của một giá trị, không phải là giá trị. Lý do đó không nói được mình đổi lấy cái gì, nên không kiểm chứng được và cũng không biết dừng ở đâu. Trong **30 giây đầu**, quy ước bị phá mà không có gì bù vào ngay sẽ bị đọc là game hỏng, chứ không phải là sáng tạo.
- `Senior` **Phá quy ước ảnh hưởng gì tới marketing?**
  → Trang store bán bằng cái người mua đã hiểu: nhãn thể loại, ảnh chụp màn hình, từ khoá. Phá lớp kỳ vọng lõi thì nhãn cũ không còn nói đúng nữa và ảnh chụp phải làm việc gấp đôi. Đó là chi phí thật, nên đây là quyết định chung với marketing chứ không phải quyết định riêng của design.

**Khung trả lời 60 giây** — "Khi nào thì nên phá quy ước thể loại?"

> Tôi xếp quy ước thành ba lớp theo chi phí dạy lại. Lớp **từ vựng** — run, deck, wave — phá gần như luôn lỗ: người chơi phải học từ mới để chỉ đúng thứ họ đã biết, mình mất ngân sách tutorial mà không mua lại được gì. Lớp **cấu trúc** — nhịp, số lượng lựa chọn, layout — là chỗ đổi mới thật sự xảy ra. Lớp **kỳ vọng lõi** thì phá xong là sang thể loại khác, và lúc đó marketing phải đổi tên theo chứ không được mượn nhãn cũ.
>
> Điều kiện để tôi đồng ý phá là nó **gắn được với một design pillar cụ thể**, và tôi trả lời được câu "tôi trả tiền ở đâu". Vampire Survivors bỏ nút tấn công — 30 giây đầu trông như game hỏng — nên họ trả bằng cách đẩy nâng cấp đầu tiên tới rất sớm. Into the Breach bỏ ngẫu nhiên khỏi chiến đấu, mất kịch tính "cầu cho trúng", nên phải thiết kế từng màn chặt như câu đố.
>
> Và chỉ phá **một** thứ. Phá ba bốn quy ước cùng lúc thì người chơi không còn điểm tựa nào để hiểu game.

**Họ sẽ đào tiếp**

- *"Sếp muốn bỏ meta-progression khỏi roguelite"* → Đó là phá lớp kỳ vọng lõi, vì meta-progression chính là thứ phân biệt roguelite với roguelike. Tôi không nói không ngay, tôi hỏi hai câu: bỏ để đổi lấy pillar nào, và cái gì sẽ giữ chân người chơi sau run thứ năm khi họ đã hết tò mò. Nếu không có câu trả lời cho câu thứ hai thì đây là cắt tính năng chứ không phải quyết định thiết kế.
- *"Làm sao anh biết quy ước của một thể loại?"* → Ba nguồn, rẻ dần: chơi 30 phút đầu của ba game đầu bảng và ghi lại cái gì game **giả định** mình đã biết; đọc review 2–3 sao vì người chơi chỉ viết ra kỳ vọng lúc nó bị vi phạm; xem ảnh chụp màn hình store chứ không xem trailer, vì layout lặp lại giữa các game chính là quy ước.
- *"Deckbuilder PC sang mobile dọc"* → Hover gãy đầu tiên — toàn bộ thông tin chi tiết lá bài trên PC nằm trong tooltip, mobile không có trạng thái hover nên phải đổi sang chạm-giữ hoặc panel riêng. Sau đó là tay bài: 10 lá xoè ngang không vừa màn dọc. Và phiên chơi: deckbuilder PC thiết kế cho 45–90 phút liền, mobile phải ngắt được giữa run.
- *"Phá quy ước có làm khó marketing không?"* → Có, và đó là chi phí thật. Trang store bán bằng cái người mua đã hiểu. Nếu game phá lớp kỳ vọng lõi thì ảnh chụp màn hình phải làm việc gấp đôi, vì nhãn thể loại không còn nói đúng nữa.
- *"Quy ước theo nền tảng thì sao?"* → Mobile là 2–5 phút mỗi phiên và phải ngắt được bất cứ lúc nào; console là khoảng cách nhìn 2–3 m nên chữ phải to hơn hẳn, và mọi thứ phải tới được bằng D-pad. Thứ tự focus cho tay cầm mà thêm lúc sắp phát hành thì luôn đắt hơn làm từ đầu.

**Cờ đỏ**

- "Tôi muốn phá quy ước để game nổi bật" — khác biệt là hệ quả của một giá trị, không phải giá trị.
- Kể tên thể loại nhưng không kể được **game tham chiếu** cụ thể.
- Nói về quy ước như luật bất di bất dịch, không phân biệt được lớp nào phá được lớp nào không.
- Phá quy ước mà không nói được mình **trả tiền ở đâu**.
- Giả định quy ước PC áp thẳng sang mobile, đặc biệt là hover.

**Số / ví dụ nên thuộc**

- Độ dài phiên chuẩn: roguelike **20–45 phút** mỗi run · survivor-like **15–30** · deckbuilder **45–90** · tower defense **10–20 phút** mỗi màn · mobile **2–5 phút** mỗi lần mở.
- **Ba lớp quy ước**: từ vựng → cấu trúc → kỳ vọng lõi, theo chi phí dạy lại tăng dần.
- **30 giây đầu** là cửa sổ mà một quy ước bị phá sẽ bị hiểu nhầm thành lỗi.
- Ví dụ phải thuộc: Vampire Survivors bỏ nút tấn công · Into the Breach bỏ ngẫu nhiên khỏi chiến đấu · Outer Wilds bỏ tiến trình vật phẩm.
- Nguyên tắc: phá **một** quy ước mỗi lần, không phá chùm.
