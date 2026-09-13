---
title: UI Design
icon: 🧩
summary: Hệ thống giao diện — thang đo, typography, biểu tượng, trạng thái, và cách scale qua nhiều độ phân giải.
status: deep
read: 350
level: intermediate
order: 30
tags: [presentation, ui, design-system]
related: [ux-hud, ux-flow, accessibility, art-direction]
---

UI game khác UI ứng dụng ở một điểm quyết định: **người chơi đang bận**. Họ không đọc kỹ, không rê chuột tìm tooltip, không suy nghĩ về cấu trúc menu. Mọi thứ phải nhận ra được, không phải đọc hiểu được.

## Dựng hệ thống trước, màn hình sau

Sai lầm phổ biến là thiết kế từng màn hình một. Kết quả: 20 màn hình với 14 kích thước nút khác nhau.

Hệ thống tối thiểu cần chốt trước:

**Thang đo (spacing scale)** — mọi khoảng cách là bội số của một đơn vị:
```
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
```
Không bao giờ dùng 13px hay 27px. Ràng buộc này một mình đã loại bỏ phần lớn cảm giác "lệch lệch".

**Thang chữ** — 4–5 cỡ, không hơn:
```
32  tiêu đề màn hình
20  tiêu đề mục
16  nội dung chính
13  phụ chú
11  nhãn nhỏ nhất được phép
```

**Bảng màu UI** — tách biệt khỏi bảng màu thế giới (xem [[art-direction]]). UI dùng màu riêng để không lẫn với vật thể trong game.

**Trạng thái** — mọi phần tử tương tác cần đủ 5 trạng thái:
`default · hover · pressed · disabled · focused`

Thiếu `focused` là lỗi phổ biến nhất, và nó khiến game không chơi được bằng bàn phím/tay cầm — xem [[accessibility]].

## Typography cho game

- **Cỡ nhỏ nhất 13–14px @1080p.** Console thì 20px+ vì người chơi ngồi xa 2–3 mét.
- **Tránh font trang trí cho nội dung.** Font "fantasy" dùng cho tiêu đề thì được; dùng cho mô tả vật phẩm là tra tấn người đọc.
- **Kiểm tra font có đủ chữ tiếng Việt.** Rất nhiều font game miễn phí thiếu dấu, và lỗi này chỉ lộ ra khi đã làm xong UI.
- **Chiều dài dòng 45–75 ký tự.** Dài hơn là mắt lạc dòng.
- **Nền phải đủ tương phản.** Chữ trắng trên ảnh nền cần một lớp tối mờ phía sau, không có ngoại lệ.

## Biểu tượng

Icon chỉ hiệu quả khi người chơi **đã biết nó là gì**. Quy tắc:

- Icon + chữ ở lần đầu gặp; chỉ icon sau khi đã quen.
- Icon quan trọng phải phân biệt được **bằng hình dạng ở 24px**, không chỉ bằng màu.
- Tối đa khoảng 12–15 icon người chơi phải nhớ. Vượt quá là quá tải.
- Một icon = một ý nghĩa, xuyên suốt game. Dùng lại icon cho hai nghĩa khác nhau là nguồn nhầm lẫn dai dẳng.

## Scale qua nhiều độ phân giải

Chọn **một trong hai**, đừng trộn:

**Scale theo chiều cao** (thường dùng cho game): UI giữ nguyên tỉ lệ với chiều cao màn hình. Màn rộng hơn thì có thêm khoảng trống hai bên. Dễ đoán.

**Scale theo khoảng cách vật lý** (console/mobile): UI giữ nguyên kích thước góc nhìn. Phức tạp hơn nhưng đúng hơn về mặt trải nghiệm.

Dù chọn cách nào, **kiểm tra ở 3 tỉ lệ**: 16:9, 16:10 (laptop), 21:9 (ultrawide). Và nếu có mobile, thêm khung tai thỏ (safe area).

## Vùng chạm và vùng nhắm

- **Chạm (mobile): tối thiểu 44×44px**, khoảng cách giữa hai mục ≥ 8px.
- **Vùng chạm có thể lớn hơn hình vẽ.** Nút nhìn 32px nhưng vùng bấm 48px — người chơi không thấy, chỉ thấy "dễ bấm".
- **Mobile: chừa 80px dưới cùng** cho ngón cái che, và tránh đặt nút quan trọng ở góc trên (không với tới bằng một tay).

## 🤖 Prompt cho AI

AI dựng UI **có hệ thống** rất tốt, nhưng gu thẩm mỹ mặc định của nó là dashboard quản trị. Hãy đưa hệ thống, đừng hỏi nó thiết kế.

**Phải nêu rõ:**
- Thang spacing và thang chữ (danh sách số cụ thể)
- Màu UI bằng hex, tách khỏi màu thế giới
- Độ phân giải tham chiếu và cách scale
- Yêu cầu 5 trạng thái, đặc biệt là `focused`

**Mẫu prompt**

```
Dựng design system UI cho <engine + phiên bản>. Tôi đưa thông số, bạn dựng hệ thống.

Thang spacing: 4 8 12 16 24 32 48 64  — KHÔNG dùng giá trị ngoài thang này
Thang chữ: 32 / 20 / 16 / 13 / 11 px @ tham chiếu 1920x1080
Scale: theo chiều cao màn hình
Màu UI: bg #12161F, panel #1A2030, text #E6E9F0, muted #7C8699,
        accent #6EA8FE, danger #E03131   (KHÔNG trùng palette thế giới)

Yêu cầu:
- Component cơ bản: Button, Panel, Slider, Toggle, Tab, Tooltip, ListItem
- MỌI component có đủ 5 trạng thái: default/hover/pressed/disabled/focused
- focused phải có viền nhìn rõ (>=2px, tương phản >=3:1) — điều hướng bàn phím
  và tay cầm phải dùng được toàn bộ UI, KHÔNG có phần tử nào chỉ bấm được bằng chuột
- Vùng chạm tối thiểu 44x44px, tách khỏi kích thước hình vẽ
- Mọi giá trị lấy từ một UiTheme asset duy nhất, KHÔNG hardcode

Kèm bộ kiểm tra tự động:
1. Tìm giá trị spacing ngoài thang
2. Tìm cỡ chữ ngoài thang
3. Tìm màu hardcode không có trong UiTheme
4. Tìm phần tử tương tác thiếu trạng thái focused
5. Tìm cặp chữ/nền có tương phản < 4.5:1
6. Tìm vùng chạm < 44x44
```

**Bẫy thường gặp:** bỏ qua trạng thái `focused`. Game chạy hoàn hảo bằng chuột, rồi đến khi thêm hỗ trợ tay cầm thì phát hiện toàn bộ UI phải làm lại. Nêu yêu cầu điều hướng bàn phím **ngay từ prompt đầu tiên** — sửa sau đắt gấp nhiều lần.

## 🎮 Unity

Unity có hai hệ UI. Chọn sai là làm lại từ đầu, nên quyết định trước khi vẽ màn hình đầu tiên.

**uGUI (Canvas) hay UI Toolkit?**

| | uGUI | UI Toolkit |
|---|---|---|
| Độ chín | Rất ổn định, tài liệu nhiều | Mới hơn, còn thay đổi |
| Trong world space | Có (Canvas World Space) | Hạn chế |
| Styling | Từng component | USS (giống CSS) — hợp design system |
| AI agent sửa được | Prefab là YAML, khó sửa tay | UXML/USS là text, **agent sửa tốt** |
| HUD game 2D/3D | Phù hợp | Phù hợp cho UI phẳng |

Với dự án làm cùng AI agent, **UI Toolkit có lợi thế rõ**: UXML và USS là text thuần, agent đọc và sửa trực tiếp được. uGUI thì mọi thứ nằm trong prefab YAML, sửa tay rất dễ hỏng.

**Setup bắt buộc: CanvasScaler**

Đây là thứ quyết định UI có scale đúng qua các độ phân giải hay không.

```
Canvas > Canvas Scaler
  UI Scale Mode : Scale With Screen Size
  Reference Resolution : 1920 x 1080
  Screen Match Mode : Match Width Or Height
  Match : 1   ← khớp theo CHIỀU CAO
```

`Match = 1` nghĩa là UI giữ tỉ lệ với chiều cao màn hình; màn rộng hơn chỉ có thêm khoảng trống hai bên. Đây là lựa chọn đúng cho hầu hết game — dễ đoán, và ultrawide không làm vỡ layout.

Để mặc định `Match = 0` (khớp theo chiều rộng) là lỗi phổ biến: trên màn hình cao, UI phình to vượt khung.

**Design system bằng USS (UI Toolkit)**

```css
:root {
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;
  --fs-title: 32px; --fs-h2: 20px; --fs-body: 16px; --fs-small: 13px;
  --c-bg: #12161F;  --c-text: #E6E9F0;  --c-accent: #6EA8FE;
}
.btn {
  min-height: 44px;            /* vùng chạm tối thiểu */
  padding: var(--space-2) var(--space-4);
  font-size: var(--fs-body);
  background-color: var(--c-bg);
}
.btn:focus {                   /* BẮT BUỘC — điều hướng bàn phím/tay cầm */
  border-color: var(--c-accent);
  border-width: 2px;
}
```

**Điều hướng bằng tay cầm (uGUI)**

```csharp
// Mỗi màn hình phải set focus mặc định khi mở, nếu không tay cầm bấm vào hư không
void OnEnable() => EventSystem.current.SetSelectedGameObject(firstButton);
```

Và kiểm tra `Navigation` của mỗi `Selectable` — chế độ `Automatic` thường đoán sai ở layout phức tạp; khi đó set `Explicit` và nối tay.

**Kiểm tra nhanh**
- Chạy ở 1920×1080, 1280×800, 2560×1080 — UI có vỡ không?
- Rút chuột ra, chỉ dùng bàn phím: tới được mọi nút chứ?
- Mọi nút có `:focus` / `Selected` state nhìn thấy rõ không? Xem [[accessibility]].

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **UI game khác UI ứng dụng ở điểm nào?**
  → Ở chỗ **người chơi đang bận**. Họ không đọc kỹ, không rê chuột tìm tooltip, không suy nghĩ về cấu trúc menu. Nên mọi thứ phải **nhận ra được**, không phải đọc hiểu được — đó là lý do biểu tượng, hình dạng và vị trí quan trọng hơn nhãn chữ trong game, ngược hẳn với ứng dụng năng suất.
- `Junior` **Vì sao nên dựng hệ thống trước, màn hình sau?**
  → Vì thiết kế từng màn một cho ra hai mươi màn hình với mười bốn kích thước nút khác nhau. Hệ thống tối thiểu phải chốt trước: **thang khoảng cách** (mọi khoảng là bội số của một đơn vị — không bao giờ 13px hay 27px), **thang chữ** 4–5 cỡ, **bảng màu UI tách khỏi bảng màu thế giới**, và bộ **trạng thái** cho phần tử tương tác.
- `Junior` **Một phần tử tương tác cần mấy trạng thái? Cái nào hay thiếu nhất?**
  → Năm: `default · hover · pressed · disabled · **focused**`. Thiếu `focused` là lỗi phổ biến nhất, và hậu quả rất cụ thể — game **không chơi được bằng bàn phím hoặc tay cầm**, tức là mất cả một nhóm người chơi lẫn một hạng mục trợ năng cơ bản.
- `Mid` **Quy tắc typography cho UI game?**
  → Cỡ nhỏ nhất **13–14px @1080p**, console thì **20px+** vì người chơi ngồi xa 2–3 mét. Chiều dài dòng **45–75 ký tự**. Không dùng font trang trí cho nội dung — để dành cho tiêu đề. Chữ trên ảnh nền **luôn** cần một lớp tối mờ phía sau. Và kiểm **font có đủ chữ tiếng Việt** ngay tuần đầu, vì rất nhiều font game miễn phí thiếu dấu.
- `Mid` **Icon dùng thế nào cho đúng?**
  → Icon chỉ hiệu quả khi người chơi **đã biết nó là gì**, nên: icon **cộng chữ** ở lần đầu gặp, chỉ icon sau khi đã quen. Icon quan trọng phải phân biệt được **bằng hình dạng ở 24px**, không chỉ bằng màu. Tối đa khoảng **12–15 icon** người chơi phải nhớ. Và một icon là một ý nghĩa, xuyên suốt game.
- `Mid` **Scale UI qua nhiều độ phân giải thế nào?**
  → Chọn **một trong hai và đừng trộn**: scale theo **chiều cao màn hình** (dễ đoán, hay dùng cho game), hoặc scale theo **khoảng cách vật lý** (đúng hơn về trải nghiệm, hợp console/mobile). Dù chọn gì cũng kiểm ở ba tỉ lệ **16:9, 16:10, 21:9**, và thêm **safe area** nếu có mobile.
- `Senior` **Vùng chạm trên mobile — những con số nào là bắt buộc?**
  → Tối thiểu **44×44px**, khoảng cách giữa hai mục **≥ 8px**. Hai mẹo quan trọng hơn con số: **vùng chạm được phép lớn hơn hình vẽ** — nút nhìn 32px nhưng vùng bấm 48px, người chơi không thấy mà chỉ thấy "dễ bấm"; và **chừa khoảng 80px dưới cùng** cho ngón cái che, tránh đặt nút quan trọng ở góc trên vì không với tới bằng một tay.
- `Senior` **Vì sao bảng màu UI nên tách khỏi bảng màu thế giới?**
  → Để UI **không lẫn với vật thể trong game**. Dùng chung bảng màu thì có cảnh nào đó UI biến mất vào nền, và lỗi này xuất hiện ngẫu nhiên theo màn chứ không tái hiện được ở một chỗ cố định. Tách ra còn cho phép art direction đổi tông cảnh mà không phải kiểm lại toàn bộ UI.
- `Senior` **Hệ thống UI ảnh hưởng thế nào tới tốc độ làm việc của cả đội?**
  → Rất lớn, và đó là lý do thật để đầu tư: có thang khoảng cách, thang chữ và bộ trạng thái thì **thêm một màn hình mới là ghép sẵn có**, không phải thiết kế lại. Không có hệ thống thì mỗi màn hình là một cuộc thương lượng, và mỗi lần sửa là sửa hai mươi chỗ. Đây cũng là điều kiện để agent sinh UI mới mà vẫn nhất quán.

**Khung trả lời 60 giây** — "Anh xây UI cho một game thế nào?"

> **Hệ thống trước, màn hình sau.** Sai lầm phổ biến là thiết kế từng màn một, và kết quả là hai mươi màn hình với mười bốn kích thước nút khác nhau. Thứ tôi chốt trước gồm bốn thứ: thang khoảng cách theo bội số một đơn vị, thang chữ bốn năm cỡ, bảng màu UI tách khỏi bảng màu thế giới, và đủ năm trạng thái cho mọi phần tử tương tác — `default`, `hover`, `pressed`, `disabled`, và `focused`.
>
> `focused` là cái hay thiếu nhất, và thiếu nó thì game không chơi được bằng tay cầm. Đó vừa là lỗi nền tảng vừa là lỗi trợ năng.
>
> Về chữ và icon, tôi giữ vài con số cứng: cỡ nhỏ nhất 13–14px ở 1080p và 20px trở lên cho console; dòng dài 45–75 ký tự; icon quan trọng phải phân biệt **bằng hình dạng ở 24px**; và tối đa mười hai tới mười lăm icon người chơi phải nhớ. Cuối cùng là kiểm ở ba tỉ lệ màn hình và, nếu có mobile, kiểm safe area cùng vùng chạm tối thiểu 44×44.

**Họ sẽ đào tiếp**

- *"Vì sao thang khoảng cách lại có tác dụng lớn đến thế?"* → Vì phần lớn cảm giác "lệch lệch" đến từ các giá trị tuỳ hứng — 13px ở đây, 27px ở kia. Ràng buộc bội số loại bỏ chuyện đó mà không cần ai có mắt thẩm mỹ tốt, và nó cũng làm việc review nhanh hơn: sai thang là thấy ngay, không phải tranh luận.
- *"Font thiếu dấu tiếng Việt phát hiện lúc nào?"* → Phải phát hiện **tuần đầu**, bằng cách dán một chuỗi đủ dấu vào một nhãn thật. Phát hiện muộn thì hoặc đổi font và làm lại toàn bộ layout, hoặc sống chung với chữ bị rơi dấu — cả hai đều đắt. Đây là loại lỗi vừa im lặng vừa chỉ lộ ra ở đúng ngôn ngữ của mình.
- *"Vùng chạm lớn hơn hình vẽ có gây bấm nhầm không?"* → Có, nếu các nút đặt sát nhau — nên đi kèm khoảng cách tối thiểu 8px và không cho hai vùng chạm chồng lên nhau. Đúng cách thì nó là một trong những thay đổi rẻ nhất làm mobile "cảm thấy chính xác hơn" mà không ai chỉ ra được vì sao.
- *"Dùng AI ở khâu này thế nào?"* → Giao cho nó việc **soát tính nhất quán**: liệt kê mọi giá trị khoảng cách và cỡ chữ đang dùng thật trong dự án rồi chỉ ra cái nào lệch thang, tìm phần tử thiếu trạng thái `focused`, tìm icon dùng cho hai nghĩa. Đó là việc duyệt và đối chiếu, máy làm nhanh và không bỏ sót.

**Cờ đỏ**

- Thiết kế từng màn hình một, không có hệ thống chung.
- Thiếu trạng thái `focused`, nên UI không dùng được bằng tay cầm.
- Icon phân biệt chỉ bằng màu, hoặc quá nhiều icon phải nhớ.
- Không kiểm ở tỉ lệ 21:9 và không kiểm safe area trên mobile.
- Chữ đặt thẳng trên ảnh nền, không có lớp tối phía sau.

**Số / ví dụ nên thuộc**

- Cỡ chữ nhỏ nhất **13–14px @1080p** · console **20px+**; dòng dài **45–75 ký tự**.
- Năm trạng thái: `default · hover · pressed · disabled · **focused**`.
- Icon: phân biệt bằng **hình dạng ở 24px**; tối đa **12–15** icon phải nhớ.
- Vùng chạm mobile **≥ 44×44px**, cách nhau **≥ 8px**, chừa **~80px** dưới cùng.
- Kiểm ở **16:9 · 16:10 · 21:9**, cộng safe area nếu có mobile.
