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
