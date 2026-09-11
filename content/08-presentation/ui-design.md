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
