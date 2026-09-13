---
title: Prototyping
icon: 🧪
summary: Kiểm chứng câu hỏi rủi ro nhất bằng công sức nhỏ nhất — và vì sao AI làm khâu này rẻ đi mười lần.
status: deep
read: 80
level: basic
order: 70
tags: [foundations, process]
related: [core-loop, ai-workflow, playtesting-metrics]
---

Prototype không phải là "phiên bản nhỏ của game". Nó là **một thí nghiệm trả lời một câu hỏi cụ thể**.

Khác biệt này nghe như chuyện chữ nghĩa nhưng quyết định gần hết mọi thứ sau đó. Bản thu nhỏ của game thì không bao giờ xong, vì "nhỏ" không có định nghĩa. Một thí nghiệm thì xong ngay khi câu hỏi được trả lời — kể cả khi câu trả lời là "không".

## Phiếu thí nghiệm: năm dòng viết trước khi code

Mỗi prototype cần viết ra trước khi làm:

```
Câu hỏi:    Cơ chế đẩy-lùi có tạo ra quyết định thú vị không?
Giả định:   Người chơi sẽ đánh đổi giữa vị trí và sát thương.
Thành công: 3/5 tester tự nhận ra cách kết hợp mà tôi không dạy.
Thất bại:   Ai cũng spam một nút.
Ngân sách:  1 ngày.
```

Dòng quan trọng nhất là **Thất bại**. Không có tiêu chí thất bại viết trước, mọi prototype đều "thành công" và bạn không học được gì — vì con người rất giỏi tìm lý do để thứ mình vừa làm trông có vẻ ổn.

Dòng **Ngân sách** là dòng hay bị bỏ qua thứ hai. Nó không phải ước lượng, nó là **giới hạn cứng**: hết ngân sách mà chưa trả lời được câu hỏi thì dừng lại và hỏi tại sao — thường là vì câu hỏi đặt sai, quá rộng, hoặc thật ra gồm ba câu hỏi lồng nhau.

## Tìm giả định rủi ro nhất

Dự án nào cũng đứng trên hàng chục giả định. Bạn không kiểm chứng hết được, nên phải xếp hạng. Hai trục quyết định thứ tự:

<figure class="fig">
<svg viewBox="0 0 660 268" role="img" aria-label="Ma trận hai trục: độ không chắc chắn và thiệt hại nếu sai, chia thành bốn ô ưu tiên prototype">
  <text x="16" y="26" class="fig-muted" font-size="11">mình KHÔNG chắc</text>
  <line x1="118" y1="34" x2="118" y2="222" class="fig-line"/>
  <line x1="118" y1="222" x2="640" y2="222" class="fig-line"/>
  <text x="16" y="218" class="fig-muted" font-size="11">mình chắc</text>
  <rect x="126" y="40" width="250" height="84" rx="6" class="fig-box"/>
  <text x="251" y="76" text-anchor="middle" class="fig-label" font-size="13">Prototype nếu còn thời gian</text>
  <text x="251" y="96" text-anchor="middle" class="fig-muted" font-size="10">sai cũng chỉ mất vài ngày</text>
  <rect x="384" y="40" width="250" height="84" rx="6" fill="#ff8787" opacity="0.16"/>
  <rect x="384" y="40" width="250" height="84" rx="6" class="fig-box" fill="none"/>
  <text x="509" y="72" text-anchor="middle" font-size="14" fill="#ff8787" font-weight="bold">PROTOTYPE NGAY</text>
  <text x="509" y="92" text-anchor="middle" class="fig-muted" font-size="10">sai ở tháng thứ 6 = làm lại dự án</text>
  <text x="509" y="110" text-anchor="middle" class="fig-muted" font-size="10">đây là chỗ duy nhất luôn đáng tiền</text>
  <rect x="126" y="132" width="250" height="82" rx="6" class="fig-box"/>
  <text x="251" y="170" text-anchor="middle" class="fig-label" font-size="13">Cứ làm</text>
  <text x="251" y="190" text-anchor="middle" class="fig-muted" font-size="10">prototype ở đây là trì hoãn có vỏ bọc</text>
  <rect x="384" y="132" width="250" height="82" rx="6" class="fig-box"/>
  <text x="509" y="164" text-anchor="middle" class="fig-label" font-size="13">Kiểm tra nhanh rồi đi tiếp</text>
  <text x="509" y="184" text-anchor="middle" class="fig-muted" font-size="10">một technical spike 1 ngày là đủ</text>
  <text x="330" y="244" text-anchor="middle" class="fig-muted" font-size="11">thiệt hại nếu giả định này sai →</text>
  <text x="150" y="244" class="fig-muted" font-size="10">nhỏ</text>
  <text x="596" y="244" class="fig-muted" font-size="10">làm lại từ đầu</text>
</svg>
<figcaption>Xếp mọi giả định vào bốn ô này rồi chỉ prototype ô đỏ. Phần lớn thời gian prototype bị lãng phí ở ô trái dưới — làm thứ mình đã biết câu trả lời, vì nó dễ chịu hơn là đối mặt với ô đỏ.</figcaption>
</figure>

Cách dùng thực tế: viết ra 10–15 giả định của dự án ở dạng câu khẳng định ("người chơi sẽ chịu học hệ thống chế đồ", "60 kẻ địch cùng lúc chạy được 60fps trên máy tầm trung", "người chơi mobile chấp nhận phiên 10 phút"), rồi chấm mỗi cái hai điểm từ 1–5. Nhân hai điểm lại, sắp xếp giảm dần. Prototype ba cái đầu bảng, theo thứ tự.

Giả định rủi ro nhất thường **không phải giả định về gameplay**. Nó hay là giả định về người chơi ("họ sẽ thích kiểu này") hoặc về thị trường — và đó là loại đắt nhất khi sai.

## Bốn loại prototype

| Loại | Trả lời câu hỏi | Thời gian | Vứt đi sau khi xong? |
|---|---|---|---|
| **Paper** | Luật này có tạo ra quyết định khó không? | 2 giờ – 2 ngày | Có |
| **Technical spike** | Về mặt kỹ thuật có làm được không, với chi phí nào? | 1–3 ngày | Có |
| **Horizontal (greybox)** | Toàn bộ game ghép lại có mạch lạc không? | 1–2 tuần | Có |
| **Vertical slice** | 5 phút này có đủ hay để người lạ trả tiền không? | 4–8 tuần | **Không** — trở thành nền của production |

Hai loại đầu rẻ và nên làm nhiều. Hai loại sau đắt, và sai lầm phổ biến là nhảy thẳng vào vertical slice khi chưa trả lời xong các câu hỏi rẻ tiền — lúc đó bạn đang đánh cược 6 tuần vào một [[core-loop]] chưa ai kiểm chứng.

**Vertical slice khác về bản chất:** nó không phải thí nghiệm mà là **bằng chứng**. Bạn làm nó khi đã tin chắc thiết kế đúng và cần thuyết phục người khác — nhà đầu tư, publisher, hoặc chính đội mình. Vì nó sẽ thành production nên chất lượng code phải thật, và vì thế nó đắt.

## Paper prototype cho game hệ thống

Với game nặng hệ thống — kinh tế, thẻ bài, quản lý, 4X — giấy thường nhanh hơn code **mười lần** cho cùng một câu hỏi, và đây là loại prototype bị bỏ qua nhiều nhất trong đội làm game số.

Nó hợp khi câu hỏi thuộc loại: luật có tạo ra quyết định khó không, có nước đi trội tuyệt đối không, vòng kinh tế có tự cân bằng không. Nó **không** trả lời được câu hỏi về [[game-feel]], thời gian phản xạ, hay bất cứ thứ gì phụ thuộc vào cảm giác điều khiển.

Cách làm gọn nhất:

1. **Ghi mỗi luật lên một thẻ riêng.** Luật nào không viết gọn trong một thẻ thì luật đó quá phức tạp — đó đã là một phát hiện.
2. **Bạn đóng vai máy tính.** Tự tính toán, tự rút bài. Chậm là tốt: nó cho bạn thấy chỗ nào người chơi phải chờ.
3. **Chơi với hai người trong 30 phút.** Ghi lại mọi lần có người hỏi "giờ tôi làm gì được?" — mỗi lần hỏi là một chỗ luật chưa rõ.
4. **Tìm nước đi trội.** Nếu sau ba ván ai cũng chơi cùng một kiểu, hệ thống chưa có chiều sâu và không bản dựng đồ hoạ nào cứu được.

Chi phí: một buổi chiều và một tệp giấy nhớ. So với việc phát hiện ra cùng điều đó sau sáu tuần code.

## Giữ, xoay hướng, hay bỏ

Prototype xong phải ra quyết định, và quyết định phải viết vào phiếu thí nghiệm lúc nãy — nếu không bạn sẽ hợp lý hoá bất cứ kết quả nào thành "giữ".

| Kết quả | Quyết định | Dấu hiệu nhận ra |
|---|---|---|
| Đạt tiêu chí thành công | **Giữ** — đi tiếp câu hỏi rủi ro thứ hai | Tester tự làm được điều bạn không dạy |
| Không đạt, nhưng lộ ra thứ hay hơn | **Xoay hướng** — viết phiếu mới cho câu hỏi mới | Tester bỏ qua cơ chế chính, dành thời gian cho thứ phụ |
| Không đạt, không lộ ra gì | **Bỏ** — và ghi lại tại sao | Người chơi lịch sự nhưng không ai chơi lại lần hai |
| Hết ngân sách, chưa trả lời được | **Dừng** — câu hỏi đặt sai, chẻ nhỏ ra | Prototype cứ phình thêm tính năng mới trả lời được |

Dòng cuối cùng là dòng cứu dự án. Prototype chạy quá ngân sách gấp đôi gần như luôn có nghĩa là câu hỏi gốc thật ra là ba câu hỏi lồng nhau.

Và điều cần nói thẳng: **"bỏ" là kết quả thành công của một thí nghiệm.** Bạn vừa mua thông tin đắt giá bằng một ngày thay vì bằng sáu tháng. Đội nào coi prototype bị bỏ là thất bại thì đội đó sẽ sớm thôi không dám prototype nữa, và chuyển sang đoán.

## Điều AI thay đổi

Dựng 5 biến thể cơ chế trong một buổi chiều giờ là chuyện khả thi. Nút thắt chuyển từ **thời gian code** sang **thời gian playtest** — và đó là một thay đổi lớn hơn vẻ ngoài của nó.

Ba hệ quả thực tế:

- **Đầu tư vào vòng lặp đánh giá, không vào code.** Hotkey reset, chỉnh tham số trong lúc chạy, ghi log tự động. Xem [[data-driven-design]]. Thời gian tiết kiệm được khi code phải đổ vào đây, nếu không bạn chỉ có nhiều prototype chưa ai thử.
- **So sánh trực tiếp thắng thử lần lượt.** Ba biến thể đổi bằng phím 1-2-3 trong cùng một phiên cho câu trả lời rõ hơn hẳn ba prototype riêng làm ba tuần khác nhau — vì trí nhớ về cảm giác phai rất nhanh.
- **Phiếu thí nghiệm quan trọng hơn trước.** Khi dựng prototype rẻ đi mười lần, cái đắt còn lại là **sự chú ý của bạn**. Không có câu hỏi viết sẵn thì AI sẽ vui vẻ dựng cho bạn một game mini hoàn chỉnh có menu và hệ thống lưu, và bạn sẽ mất một ngày đánh giá thứ không kiểm chứng gì.

Xem [[ai-workflow]] về cách gắn khâu này vào quy trình, và [[playtesting-metrics]] về cách đo cho đúng khi đã có bản chạy được.

## Kiểm tra nhanh

- Viết được câu hỏi của prototype này thành **một câu** chưa?
- Có **tiêu chí thất bại** viết trước khi code không?
- Ngân sách là bao nhiêu ngày, và hôm nay là ngày thứ mấy?
- Giả định đang kiểm chứng có nằm ở ô đỏ của ma trận không, hay chỉ là thứ dễ làm?
- Reset và thử lại mất bao lâu? Trên 5 giây là đang ăn mòn số lần thử.
- Đã định sẵn prototype này sẽ bị **xoá** hay sẽ thành production chưa?

## 🤖 Prompt cho AI

Prototype là **thí nghiệm**, không phải bản thu nhỏ của game. Prompt phải nói rõ câu hỏi cần trả lời, nếu không AI sẽ dựng một game mini hoàn chỉnh mà chẳng kiểm chứng được gì.

**Dùng AI thế nào cho khâu prototype**

Đây là khâu AI thay đổi nhiều nhất trong cả quy trình làm game, vì prototype **được phép có code xấu** — thứ khiến việc giao cho agent rẻ hẳn đi. Không phải nợ kỹ thuật, vì mã sẽ bị xoá.

Nhưng vai của bạn thì đổi, không mất: bạn không còn là người gõ, bạn là người **đặt câu hỏi và đọc kết quả**. Hai việc đó AI không làm thay được, và chúng mới là phần khó.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Dựng biến thể | đã có câu hỏi rõ | "Dựng 3 biến thể của \<cơ chế\>, đổi bằng phím 1-2-3" |
| Dựng dụng cụ đo | trước khi playtest | "Thêm ghi log: mỗi lần người chơi \<hành động\>, ghi thời điểm và trạng thái" |
| Phản biện phiếu | trước khi code | "Đây là phiếu thí nghiệm. Câu hỏi này có kiểm chứng được bằng prototype không, hay nó là ba câu hỏi?" |

Việc **không** nên giao: quyết định giữ/xoay/bỏ. AI không xem người ta chơi, và mọi dữ liệu nó có là do bạn kể lại — nên nó sẽ đồng ý với thiên kiến của bạn.

**Phải nêu rõ:**
- Câu hỏi duy nhất prototype này trả lời
- Tiêu chí thành công **và tiêu chí thất bại** (viết trước, nếu không mọi prototype đều "thành công")
- Ngân sách: bao nhiêu file, bao nhiêu dòng, bao lâu
- Những gì **không cần** làm (art, âm thanh, menu, lưu game)
- Vòng lặp đánh giá: reset bằng phím gì, tham số nào chỉnh được lúc chạy

**Mẫu prompt**

```
Prototype kiểm chứng MỘT câu hỏi: "cơ chế đẩy-lùi có tạo quyết định thú vị không?"

Phạm vi tối thiểu:
- Hình khối màu, KHÔNG art, KHÔNG âm thanh, KHÔNG menu, KHÔNG lưu game
- 1 màn hình, 1 người chơi, 3 kẻ địch đứng yên
- Hotkey R để reset tức thì
- Mọi hằng số phơi ra một file config, sửa được trong lúc chạy

Dựng 3 BIẾN THỂ của cơ chế đẩy (đẩy theo hướng đánh / đẩy ra xa tâm /
đẩy đổi chỗ), chuyển đổi bằng phím 1-2-3 để tôi so sánh trực tiếp.

Ghi log ra CSV: mỗi lần người chơi đánh, ghi (biến thể, khoảng cách tới
địch gần nhất, có bị trúng đòn trong 2 giây sau đó không).
```

**Bẫy thường gặp:** AI "giúp" bằng cách thêm menu, hệ thống lưu, màn hình thua. Mỗi thứ đó là thời gian không dùng để trả lời câu hỏi. Câu `KHÔNG art, KHÔNG menu` phải viết ra. Bẫy thứ hai kín đáo hơn: AI dựng ba biến thể **quá giống nhau** vì nó nội suy giữa các mô tả — hãy yêu cầu ba biến thể cho ra ba kiểu chơi khác nhau, và tự kiểm tra bằng cách thử.

## 🎮 Unity

Unity rất tốt cho prototype, nhưng chỉ khi bạn **cố tình làm bừa**. Dựng cấu trúc sạch ở giai đoạn này là phản tác dụng.

**Quy tắc prototype trong Unity**

```
Assets/_Proto/           ← gạch dưới để grep và xoá dễ
├── Proto.unity          ← MỘT scene
├── Proto.cs             ← MỘT file, mọi logic trong đó
└── Cube.mat             ← hình khối màu, KHÔNG art
```

Không ScriptableObject, không interface, không thư mục theo feature. Mục tiêu là trả lời **một câu hỏi**, và mọi thứ khác là chi phí.

**Ba phím phải có**

```csharp
void Update() {
    if (Input.GetKeyDown(KeyCode.R)) SceneManager.LoadScene(0);        // reset
    if (Input.GetKeyDown(KeyCode.F1)) variant = (variant + 1) % 3;     // đổi biến thể
    if (Input.GetKeyDown(KeyCode.F2)) slowMo = !slowMo;                // xem chậm
    Time.timeScale = slowMo ? 0.25f : 1f;
}
```

`R` để reset là phím quan trọng nhất. Nếu phải bấm Stop → Play mỗi lần thử (3–5 giây khởi tạo domain), bạn sẽ thử ít hơn mười lần so với khi reset tức thì.

**Tắt Domain Reload để Play nhanh hơn**

`Project Settings > Editor > Enter Play Mode Options` → bật, và **tắt Reload Domain**.

Play Mode vào gần như tức thì thay vì 3–5 giây. Đổi lại: `static` không tự reset, nên phải tự dọn:

```csharp
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
static void ResetStatics() { instance = null; cache.Clear(); }
```

Với prototype (ít static) thì gần như miễn phí. Với project lớn thì cân nhắc — chi tiết ở [[unity-game-loop]].

**Ba biến thể cùng lúc, không lần lượt**

```csharp
// Prototype giá trị nhất là cái SO SÁNH được ngay
switch (variant) {
    case 0: knockback = velocity.normalized * force; break;          // đẩy theo hướng đánh
    case 1: knockback = (target - center).normalized * force; break; // đẩy ra xa tâm
    case 2: knockback = -velocity.normalized * force; break;         // đẩy về phía mình
}
```

Bấm F1 đổi giữa ba cái trong một giây. So sánh trực tiếp cho câu trả lời rõ hơn nhiều so với thử lần lượt qua ba buổi.

**Khi nào dừng prototype**

Khi bạn trả lời được câu hỏi đã viết ra. Rồi **xoá `_Proto/`** và dựng lại theo [[unity-project-structure]] — đừng cố refactor prototype thành production. Code prototype mang theo mọi quyết định tạm bợ.

**Kiểm tra nhanh**
- Reset được dưới 1 giây chứ?
- Đã tắt Domain Reload chưa?
- Đã viết ra câu hỏi và tiêu chí thất bại TRƯỚC khi code chưa?
- Có art nào trong `_Proto/` không? (không nên có)

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Prototype và vertical slice khác nhau thế nào?**
  → Prototype trả lời **một câu hỏi** rồi vứt đi: greybox, xấu, 1–2 tuần. Vertical slice là một lát cắt **đủ chất lượng phát hành** của game — art, âm thanh, UI thật — mất 4–8 tuần và là loại duy nhất không vứt. Dùng nhầm tên là dùng nhầm ngân sách: người ta hay hứa vertical slice rồi giao greybox.
- `Junior` **Prototype xong thì làm gì với code đó?**
  → Vứt, trừ vertical slice. Code prototype mang theo mọi quyết định tạm bợ, refactor nó thành production hầu như luôn đắt hơn viết lại từ đầu. Tôi để nó trong thư mục riêng có tiền tố để sau này grep và xoá một lượt.
- `Junior` **Phiếu thí nghiệm của một prototype gồm những gì?**
  → Năm dòng, viết **trước** khi code: câu hỏi · giả định · tiêu chí thành công · tiêu chí thất bại · ngân sách. Dòng thất bại là dòng quan trọng nhất — thiếu nó thì prototype nào cũng "thành công" và mình không học được gì. Ngân sách là giới hạn cứng, không phải ước lượng.
- `Mid` **Sếp muốn prototype "toàn bộ game" trong 2 tuần. Anh phản hồi sao?**
  → "Toàn bộ game" không phải một câu hỏi nên không kiểm chứng được gì. Tôi hỏi lại quyết định nào đang bị chặn. Nếu là "có đáng đầu tư tiếp không" thì đó là vertical slice, 4–8 tuần và sẽ đi vào production. Nếu là "cơ chế lõi có vui không" thì một greybox 1–2 tuần trả lời được, và rẻ hơn nhiều.
- `Mid` **Prototype của anh chạy sang tuần thứ tư. Chuyện gì đang xảy ra?**
  → Vượt ngân sách gấp đôi gần như luôn có nghĩa câu hỏi gốc thật ra là ba câu hỏi lồng nhau. Tôi dừng, chẻ câu hỏi ra. Dấu hiệu nhận biết: prototype cứ phải thêm tính năng mới trả lời được — lúc đó tôi đã chuyển từ làm thí nghiệm sang làm game mà không nhận ra.
- `Mid` **Paper prototype còn dùng được không?**
  → Với game hệ thống thì nhanh hơn code khoảng mười lần cho cùng một câu hỏi. Mỗi luật một thẻ; luật nào không viết gọn trong một thẻ thì bản thân điều đó đã là phát hiện. Nhưng nó không trả lời được gì về game feel hay thời gian phản xạ — mấy thứ đó bắt buộc phải dựng.
- `Senior` **Dự án mới, 15 giả định chưa kiểm chứng. Anh prototype cái nào trước?**
  → Chấm mỗi giả định hai điểm 1–5: mình không chắc tới đâu, và thiệt hại nếu nó sai. Nhân hai điểm, sắp giảm dần, làm ba cái đầu bảng. Giả định rủi ro nhất thường **không phải về gameplay** mà về người chơi hoặc thị trường — loại đó sai ở tháng thứ sáu và làm lại cả dự án.
- `Senior` **AI dựng prototype nhanh gấp mười. Điều đó đổi quy trình của anh thế nào?**
  → Nút thắt chuyển từ thời gian code sang **thời gian playtest**. Nên tôi đổ phần tiết kiệm được vào vòng lặp đánh giá: reset dưới một giây, tham số chỉnh được lúc chạy, log tự động. Và phiếu thí nghiệm quan trọng hơn trước — khi dựng rẻ đi thì thứ đắt còn lại là sự chú ý của chính mình.
- `Senior` **Prototype bị bỏ có phải là thất bại không?**
  → Ngược lại: vừa mua được thông tin đắt bằng một ngày thay vì sáu tháng. Thất bại thật là prototype không kết luận được gì. Đội nào coi kết quả xấu là thất bại thì sẽ sớm không dám prototype nữa và chuyển sang đoán — đó mới là rủi ro cần sợ.

**Khung trả lời 60 giây** — "Anh quyết định prototype cái gì trước?"

> Tôi viết ra 10–15 giả định của dự án ở dạng câu khẳng định, rồi chấm mỗi cái hai điểm từ 1 đến 5: **mình không chắc tới đâu**, và **thiệt hại nếu nó sai**. Nhân hai điểm, sắp giảm dần, prototype ba cái đầu bảng theo thứ tự.
>
> Điểm mấu chốt là giả định rủi ro nhất thường **không phải về gameplay** — nó hay là giả định về người chơi hoặc về thị trường, kiểu "họ sẽ chịu học hệ thống chế đồ". Đó là loại đắt nhất khi sai, vì nó sai ở tháng thứ sáu và làm lại cả dự án.
>
> Mỗi prototype tôi viết một phiếu năm dòng trước khi code: câu hỏi, giả định, tiêu chí thành công, **tiêu chí thất bại**, ngân sách. Dòng thất bại là dòng quan trọng nhất — không có nó thì mọi prototype đều thành công và mình chẳng học được gì. Ngân sách là giới hạn cứng, không phải ước lượng.

**Họ sẽ đào tiếp**

- *"Prototype sang tuần thứ tư thì sao?"* → Vượt ngân sách gấp đôi gần như luôn có nghĩa câu hỏi gốc thật ra là ba câu hỏi lồng nhau. Tôi dừng lại, chẻ câu hỏi ra, và thường phát hiện mình đã chuyển từ làm thí nghiệm sang làm game lúc nào không biết — dấu hiệu là prototype cứ phải thêm tính năng mới trả lời được.
- *"Sếp muốn prototype toàn bộ game trong 2 tuần"* → "Toàn bộ game" không phải câu hỏi nên không kiểm chứng được gì. Tôi sẽ hỏi lại quyết định nào đang bị chặn: nếu là "có đáng đầu tư tiếp không" thì đó là vertical slice, 4–8 tuần và sẽ thành production; nếu là "cơ chế lõi có vui không" thì một prototype greybox 1–2 tuần trả lời được, và rẻ hơn nhiều.
- *"Prototype xong thì code đi đâu?"* → Vứt, trừ vertical slice. Code prototype mang theo mọi quyết định tạm bợ, refactor nó thành production luôn đắt hơn viết lại. Tôi để nó trong thư mục riêng có tiền tố để grep và xoá một lần.
- *"Paper prototype còn dùng được không?"* → Với game hệ thống thì nhanh hơn code khoảng mười lần cho cùng câu hỏi. Mỗi luật một thẻ — luật nào không viết gọn trong một thẻ thì tự nó đã là phát hiện. Nhưng nó không trả lời được gì về game feel hay thời gian phản xạ.
- *"AI đổi gì?"* → Nút thắt chuyển từ thời gian code sang **thời gian playtest**. Nên tôi đổ phần tiết kiệm được vào vòng lặp đánh giá: reset dưới một giây, tham số chỉnh được lúc chạy, log tự động. Và phiếu thí nghiệm quan trọng hơn trước, vì khi dựng rẻ đi thì cái đắt còn lại là sự chú ý của mình.
- *"Prototype bị bỏ có phải thất bại không?"* → Ngược lại. Mình vừa mua thông tin đắt bằng một ngày thay vì sáu tháng. Đội nào coi đó là thất bại thì sẽ sớm thôi không dám prototype nữa và chuyển sang đoán.

**Cờ đỏ**

- Không viết được câu hỏi của prototype thành một câu.
- Chỉ có tiêu chí thành công, không có tiêu chí thất bại.
- Prototype cái dễ làm thay vì cái rủi ro nhất — trì hoãn có vỏ bọc kỹ thuật.
- Định refactor prototype thành production để "đỡ phí".
- Nhảy thẳng vào vertical slice khi core loop chưa ai kiểm chứng.
- Coi "kết quả xấu" là prototype thất bại.

**Số / ví dụ nên thuộc**

- Phiếu thí nghiệm **5 dòng**: câu hỏi · giả định · thành công · thất bại · ngân sách.
- Ma trận **2 trục**: độ không chắc chắn × thiệt hại nếu sai; chỉ prototype ô đỏ.
- Thời gian bốn loại: paper **2 giờ–2 ngày** · technical spike **1–3 ngày** · greybox **1–2 tuần** · vertical slice **4–8 tuần**.
- Vertical slice là loại duy nhất **không vứt đi**.
- Reset phải dưới **1 giây**; trên 5 giây là đang ăn mòn số lần thử.
- Tiêu chí kiểu mẫu: **3/5 tester** tự nhận ra cách kết hợp mà mình không dạy.
