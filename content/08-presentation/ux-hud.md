---
id: ux-hud
title: UX & HUD
icon: 🖥️
summary: HUD trong lúc chơi — hiện cái gì, khi nào, và cách đọc trạng thái sống còn bằng thị giác ngoại vi.
status: deep
read: 360
level: intermediate
order: 40
tags: [presentation, ux, ui, hud]
related: [ui-design, game-feel, combat-systems, accessibility, genre-conventions]
---

HUD không phải chỗ khoe số liệu. Nó tồn tại để trả lời **những câu hỏi người chơi đang có ngay lúc này** — và mỗi pixel nó chiếm là một pixel không nhìn thấy game.

## Bài test câu hỏi

Với **mỗi** phần tử trên HUD, viết ra hai thứ:

| Phần tử | Câu hỏi nó trả lời | Tần suất hỏi |
|---|---|---|
| Thanh máu | "Tôi sắp chết chưa?" | Liên tục |
| Cooldown skill | "Dùng được chưa?" | Vài giây một lần |
| Số vàng | "Tôi mua nổi không?" | Chỉ khi ở cửa hàng |
| Số lần chết | — | — |

Phần tử không trả lời câu hỏi nào → **bỏ**. Phần tử chỉ được hỏi lúc ở cửa hàng → **chỉ hiện ở cửa hàng**.

Bài test này một mình thường cắt được 30–40% HUD ban đầu.

## Ba tầng hiển thị

**Thường trực** — tối đa 4–5 phần tử. Chỉ những gì được hỏi liên tục: máu, tài nguyên chính, nguy hiểm sắp tới.

**Theo ngữ cảnh** — xuất hiện khi liên quan, biến mất khi không. Số đạn hiện khi cầm súng; nhắc phím tương tác hiện khi đứng gần vật thể.

**Theo yêu cầu** — bản đồ, túi đồ, chỉ số chi tiết. Người chơi chủ động mở. Xem [[ux-flow]].

Sai lầm phổ biến: nhét mọi thứ vào tầng một.

## Quy tắc thị giác ngoại vi

Người chơi nhìn vào **nhân vật của mình**, không nhìn vào góc màn hình. Nên trạng thái sống còn phải đọc được **mà không rời mắt**:

- **Máu thấp** → hiệu ứng toàn màn hình (viền đỏ, mạch đập, khử màu), không chỉ thanh ở góc.
- **Nguy hiểm sắp tới** → chỉ báo ở rìa màn hình theo hướng, hoặc hiệu ứng quanh nhân vật.
- **Buff/debuff quan trọng** → hiệu ứng gắn trên nhân vật, không chỉ icon ở thanh trạng thái.

Nguyên tắc: **thông tin càng khẩn cấp thì càng phải gần tâm nhìn.**

## Chẩn đoán bằng ba phép thử

- **Test tắt tiếng** — tắt loa, chơi được không? Nếu không, bạn đang dồn thông tin sống còn vào một kênh duy nhất.
- **Test tắt HUD** — ẩn toàn bộ HUD. Còn chơi được ở mức cơ bản không? Nếu hoàn toàn không, game đang phụ thuộc số liệu thay vì phản hồi trong thế giới.
- **Test ảnh chụp** — dừng game ở một khoảnh khắc bất kỳ, đưa cho người chưa chơi. Họ đoán được đang có chuyện gì không?

## Số liệu hay biểu diễn?

Con số chính xác nhưng chậm đọc. Hình ảnh nhanh nhưng mơ hồ.

- **Trong chiến đấu:** ưu tiên hình ảnh. Thanh máu thay vì "347/500".
- **Khi so sánh, lên kế hoạch:** ưu tiên số. Trong cửa hàng, bảng chỉ số.
- **Cho người chơi chọn** nếu có thể — nhiều người thích thấy số chính xác.

Ngoại lệ đáng chú ý: **số sát thương bay lên** là hình ảnh nhiều hơn là số. Người chơi không đọc "247", họ đọc "to hơn lần trước".

## Diegetic UI — cân nhắc

UI nằm trong thế giới game (đồng hồ đo trên vũ khí, đèn trên áo giáp) tăng độ nhập vai, nhưng:
- Đọc chậm hơn UI truyền thống
- Khó scale qua nhiều độ phân giải
- Thường không đọc được với người thị lực kém

Dùng cho game coi trọng nhập vai và nhịp chậm. Với game hành động nhanh, UI rõ ràng thắng UI nhập vai.

## 🤖 Prompt cho AI

AI mặc định **nhồi mọi chỉ số lên màn hình** vì "đầy đủ thông tin". HUD tốt thì ngược lại — phải ép nó biện minh từng phần tử.

**Phải nêu rõ:**
- Giới hạn cứng số phần tử thường trực
- Yêu cầu mỗi phần tử phải kèm câu hỏi + tần suất
- Cái gì phải đọc được bằng thị giác ngoại vi
- Ràng buộc mã hoá kép và nền tảng đích

**Mẫu prompt**

```
Thiết kế HUD cho <thể loại>, <nền tảng>, độ phân giải tham chiếu 1920x1080.

Với MỖI phần tử bạn đề xuất, BẮT BUỘC điền đủ bảng:
  | phần tử | câu hỏi nó trả lời | tần suất người chơi hỏi | tầng |
Phần tử không trả lời câu hỏi nào -> KHÔNG đưa vào bảng.

Ràng buộc cứng:
- Tối đa 5 phần tử THƯỜNG TRỰC. Phần còn lại phải theo ngữ cảnh hoặc theo yêu cầu.
- Máu và nguy hiểm sắp tới phải đọc được bằng THỊ GIÁC NGOẠI VI:
  hiệu ứng toàn màn hình, không chỉ thanh ở góc.
- MÃ HOÁ KÉP: mọi phân biệt bạn/thù, an toàn/nguy hiểm dùng màu + hình dạng.
  KHÔNG được chỉ dùng đỏ/xanh lá.
- Mobile: không đặt gì trong 80px dưới cùng; vùng chạm >= 44x44px.
- Mọi giá trị lấy từ UiTheme, KHÔNG hardcode màu/cỡ.

Sau bảng, liệt kê những gì bạn đã LOẠI BỎ và vì sao.
```

Câu cuối quan trọng: nó buộc AI thể hiện phần "cắt bớt", vốn là phần khó nhất của thiết kế HUD và là phần nó tự nhiên né tránh.

**Bẫy thường gặp:** phân biệt trạng thái chỉ bằng màu. Khoảng 8% nam giới mù màu đỏ-lục sẽ không phân biệt được thanh máu đỏ với thanh năng lượng xanh lá. Ràng buộc mã hoá kép nên có mặt trong **mọi** prompt về UI — xem [[accessibility]].

## 🎮 Unity

HUD là nơi Canvas rebuild giết frame rate. Quyết định thiết kế "hiện cái gì" ảnh hưởng trực tiếp tới hiệu năng, và đó là điều ít ai nối lại với nhau.

**Nguyên tắc Unity quan trọng nhất: phân tầng Canvas theo tần suất đổi**

```
Canvas_Static     ← khung, nền, icon không đổi          (rebuild: gần như không bao giờ)
Canvas_Frequent   ← thanh máu, cooldown, số đạn          (rebuild: nhiều lần/giây)
Canvas_Rare       ← tên màn, mục tiêu, buff              (rebuild: vài giây một lần)
Canvas_Overlay    ← số sát thương bay lên                (pool, không Instantiate)
```

Một phần tử đổi làm **rebuild toàn bộ Canvas chứa nó**. Nhét thanh máu (đổi 60 lần/giây) cùng Canvas với khung tĩnh nghĩa là rebuild cả khung 60 lần/giây. Tách ra là xong — chi tiết ở [[unity-ui]].

Điều này nối thẳng với bài test câu hỏi ở phần trên: **phần tử nào được hỏi liên tục thì nằm Canvas riêng**, phần tử hỏi thỉnh thoảng thì Canvas khác. Thiết kế và hiệu năng cùng một câu trả lời.

**Máu thấp đọc bằng thị giác ngoại vi**

Không làm bằng cách phóng to thanh máu. Làm bằng post-processing toàn màn hình:

```csharp
// URP: Volume có Vignette + Color Adjustments, điều khiển weight theo HP
[SerializeField] Volume lowHpVolume;

void OnHealthChanged(float hp01) {
    // chỉ bắt đầu hiện dưới 30% máu
    lowHpVolume.weight = Mathf.InverseLerp(0.3f, 0.05f, hp01);
}
```

`Volume.weight` rẻ và không gây Canvas rebuild. Nhớ nhân với hệ số trợ năng nếu người chơi đã tắt hiệu ứng mạnh — xem [[accessibility]].

**Số sát thương bay lên — pool, đừng Instantiate**

```csharp
// 20 con quái trúng đòn cùng lúc = 20 Instantiate + 20 TMP_Text mới = giật
readonly ObjectPool<DamageNumber> pool = new(...);
```

Và dùng `TMP_Text.SetText("{0}", value)` chứ không `text = value.ToString()` — bản đầu không cấp phát.

**Chỉ báo hướng nguy hiểm ở rìa màn hình**

```csharp
// Chuyển vị trí thế giới thành góc quanh tâm màn hình
Vector3 vp = cam.WorldToViewportPoint(threat.position);
bool offScreen = vp.z < 0 || vp.x is < 0 or > 1 || vp.y is < 0 or > 1;
if (offScreen) {
    Vector2 dir = ((Vector2)vp - Vector2.one * 0.5f).normalized;
    arrow.anchoredPosition = dir * edgeRadius;
    arrow.up = dir;
}
```

Kiểm tra `vp.z < 0` là bắt buộc — mục tiêu sau lưng camera cho viewport point đảo dấu, thiếu nó thì mũi tên chỉ ngược.

**Kiểm tra nhanh**
- Profiler mục `Canvas.BuildBatch` / `Canvas.SendWillRenderCanvases`: dưới 1ms?
- Đặt breakpoint: thanh máu đổi có làm rebuild Canvas chứa khung tĩnh không?
- Số sát thương: GC Alloc = 0 B khi 20 con trúng đòn cùng lúc?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **HUD tồn tại để làm gì? Bài test câu hỏi là gì?**
  → Để trả lời **những câu hỏi người chơi đang có ngay lúc này** — mỗi pixel HUD chiếm là một pixel không nhìn thấy game. Bài test: với mỗi phần tử, viết ra câu hỏi nó trả lời và tần suất được hỏi. Không trả lời câu hỏi nào thì **bỏ**; chỉ được hỏi ở cửa hàng thì chỉ hiện ở cửa hàng. Bài test này thường cắt được **30–40%** HUD ban đầu.
- `Junior` **Ba tầng hiển thị của HUD là gì?**
  → **Thường trực** — tối đa **4–5 phần tử**, chỉ những gì được hỏi liên tục: máu, tài nguyên chính, nguy hiểm sắp tới. **Theo ngữ cảnh** — hiện khi liên quan rồi biến mất: số đạn khi cầm súng, nhắc phím khi đứng gần vật thể. **Theo yêu cầu** — bản đồ, túi đồ, chỉ số chi tiết. Sai lầm phổ biến là nhét mọi thứ vào tầng một.
- `Junior` **Trong chiến đấu nên hiện số hay hiện hình?**
  → **Hình**: thanh máu thay vì "347/500", vì con số chính xác nhưng chậm đọc còn hình ảnh nhanh nhưng mơ hồ. Khi **so sánh và lên kế hoạch** — cửa hàng, bảng chỉ số — thì ngược lại, ưu tiên số. Ngoại lệ đáng nhớ: **số sát thương bay lên** thực ra là hình ảnh, người chơi không đọc "247" mà đọc "to hơn lần trước".
- `Mid` **Quy tắc thị giác ngoại vi trong HUD là gì?**
  → Người chơi nhìn vào **nhân vật của mình**, không nhìn góc màn hình — nên trạng thái sống còn phải đọc được **mà không rời mắt**. Máu thấp thì hiệu ứng toàn màn hình (viền đỏ, mạch đập, khử màu), không chỉ thanh ở góc. Nguy hiểm sắp tới thì chỉ báo ở rìa theo hướng. Nguyên tắc: **càng khẩn cấp thì càng phải gần tâm nhìn**.
- `Mid` **Ba phép thử chẩn đoán HUD?**
  → **Tắt tiếng** — tắt loa còn chơi được không; không thì đang dồn thông tin sống còn vào một kênh duy nhất. **Tắt HUD** — ẩn hết còn chơi được ở mức cơ bản không; hoàn toàn không thì game đang phụ thuộc số liệu thay vì phản hồi trong thế giới. **Ảnh chụp** — dừng game ở một khoảnh khắc bất kỳ, người chưa chơi có đoán được đang có chuyện gì không.
- `Mid` **Diegetic UI đáng dùng khi nào?**
  → Khi game coi trọng **nhập vai và nhịp chậm**. Cái giá phải nói rõ: đọc chậm hơn UI truyền thống, khó scale qua nhiều độ phân giải, và thường **không đọc được với người thị lực kém**. Với game hành động nhanh thì UI rõ ràng thắng UI nhập vai — đây là đánh đổi, không phải nâng cấp.
- `Senior` **HUD của anh có 12 phần tử thường trực. Anh cắt thế nào?**
  → Chạy bài test câu hỏi cho từng cái rồi phân về ba tầng: cái nào được hỏi liên tục thì giữ (tối đa 4–5), cái nào hỏi theo tình huống thì cho vào tầng ngữ cảnh, cái nào chỉ hỏi khi dừng lại thì đưa vào màn hình riêng. Với những cái buộc phải giữ mà vẫn chật, chuyển chúng từ HUD sang **phản hồi trong thế giới** — hiệu ứng trên nhân vật thay vì icon ở thanh trạng thái.
- `Senior` **Thông tin nào nên rời HUD để vào chính thế giới game?**
  → Thứ **khẩn cấp và liên tục**: máu thấp, debuff quan trọng, hướng nguy hiểm. Lý do là thị giác ngoại vi đọc được hiệu ứng toàn màn hình và hiệu ứng gắn trên nhân vật, nhưng không đọc được icon nhỏ ở góc. Chuyển được thì vừa giảm HUD vừa tăng tốc độ đọc — hiếm khi có đánh đổi nào lợi cả hai chiều như vậy.
- `Senior` **HUD và trợ năng gặp nhau ở đâu?**
  → Ở gần như mọi quyết định. **Test tắt tiếng** chính là bài kiểm trợ năng thính giác. Mã hoá kép (màu cộng hình dạng) là điều kiện để thanh trạng thái đọc được với người mù màu. Cỡ chữ chỉnh được và tương phản 4,5:1 áp thẳng cho HUD. Nên làm HUD đúng ngay từ đầu là đã trả trước phần lớn hoá đơn trợ năng.

**Khung trả lời 60 giây** — "Anh thiết kế HUD cho một game hành động thế nào?"

> Bắt đầu bằng việc **cắt**. Với mỗi phần tử tôi viết ra hai thứ: nó trả lời câu hỏi gì, và người chơi hỏi câu đó bao lâu một lần. Cái không trả lời câu hỏi nào thì bỏ; cái chỉ được hỏi trong cửa hàng thì chỉ hiện trong cửa hàng. Bài test này một mình thường cắt ba mươi tới bốn mươi phần trăm HUD ban đầu.
>
> Phần còn lại chia **ba tầng**: thường trực tối đa bốn năm phần tử, theo ngữ cảnh, và theo yêu cầu. Sai lầm phổ biến nhất là nhét mọi thứ vào tầng một.
>
> Rồi tới quy tắc tôi coi là quan trọng nhất: người chơi **nhìn vào nhân vật**, không nhìn góc màn hình. Nên máu thấp phải là hiệu ứng toàn màn hình chứ không chỉ là thanh ở góc, và nguy hiểm sắp tới phải có chỉ báo ở rìa theo hướng. Càng khẩn cấp thì càng phải gần tâm nhìn. Cuối cùng tôi chạy ba phép thử: tắt tiếng, tắt HUD, và đưa một ảnh chụp cho người chưa chơi.

**Họ sẽ đào tiếp**

- *"Test tắt HUD thất bại hoàn toàn thì sao?"* → Nghĩa là game đang phụ thuộc **số liệu** thay vì phản hồi trong thế giới. Không phải lúc nào cũng sai — game chiến thuật thì đúng là vậy — nhưng với game hành động thì nó báo rằng hitstop, âm thanh và hiệu ứng trên nhân vật chưa gánh đủ phần việc của chúng.
- *"4–5 phần tử thường trực có cứng nhắc quá không?"* → Đó là ngân sách khởi điểm, không phải luật. Điểm của con số là buộc phải **đổi cái này lấy cái kia** thay vì cộng dồn — mỗi lần muốn thêm một phần tử thường trực thì phải nói được nó thay cho cái nào. Không có ngân sách thì HUD chỉ có một chiều phát triển.
- *"Số sát thương bay lên có phải là số không?"* → Về mặt chức năng thì không: người chơi đọc **kích thước, màu và số lượng**, không đọc giá trị. Nên thiết kế nó như một hiệu ứng — to hơn khi mạnh hơn, màu khác khi crit — và đừng lo con số có chính xác tới đơn vị hay không.
- *"Dùng AI ở khâu này thế nào?"* → Giao cho nó làm **bảng test câu hỏi**: liệt kê mọi phần tử HUD hiện có, hỏi lại từng cái trả lời câu hỏi gì và ai hỏi khi nào. Nó cũng tốt ở việc soát tính nhất quán — cùng loại thông tin có đang hiện ở hai chỗ khác nhau không. Còn cảm giác "HUD này chật" thì vẫn phải tự nhìn.

**Cờ đỏ**

- HUD là nơi khoe mọi số liệu đang có.
- Mười phần tử ở tầng thường trực.
- Máu thấp chỉ báo bằng một thanh ở góc màn hình.
- Chưa từng chạy test tắt tiếng hay tắt HUD.
- Chọn diegetic UI cho game hành động nhanh vì nó "nhập vai hơn".

**Số / ví dụ nên thuộc**

- Bài test câu hỏi thường cắt **30–40%** HUD ban đầu.
- Tầng thường trực: tối đa **4–5 phần tử**.
- Ba tầng: **thường trực · theo ngữ cảnh · theo yêu cầu**.
- Nguyên tắc: **càng khẩn cấp càng gần tâm nhìn**; máu thấp → hiệu ứng toàn màn hình.
- Ba phép thử: **tắt tiếng · tắt HUD · ảnh chụp cho người chưa chơi**.
