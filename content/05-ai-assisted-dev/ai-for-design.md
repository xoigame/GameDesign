---
title: AI ở khâu thiết kế
icon: 🎨
summary: Dùng AI để thiết kế game — nó là người phản biện và cái máy tính, không phải tác giả.
status: deep
read: 94
level: basic
order: 6
tags: [ai-dev, design, workflow]
related: [ai-tooling, ai-for-build, ai-for-publish, design-pillars, balancing-math]
---

Câu hỏi đúng không phải "AI thiết kế game được không" mà **"AI làm được phần nào của việc thiết kế"**.

## Nguyên tắc một câu

> **AI là người phản biện và cái máy tính. Bạn là tác giả.**

Mọi cách dùng hiệu quả đều nằm trong một trong hai vai đó. Mọi thất vọng đều đến từ việc nhờ nó làm tác giả.

Lý do cụ thể: AI tối ưu về phía **trung bình của dữ liệu huấn luyện**. Thiết kế tốt là thứ *lệch khỏi* trung bình một cách có chủ ý. Nhờ nó "thiết kế game roguelike" là yêu cầu nó cho bạn trung bình của mọi roguelike — tức là thứ bạn không muốn làm.

## Sáu việc AI làm tốt ở khâu thiết kế

**1. Phản biện — giá trị cao nhất**

Đóng vai người chơi cố tình phá game, hoặc publisher hoài nghi. Nó tìm ra chiến lược suy biến nhanh hơn bạn, vì nó không gắn bó cảm xúc với thiết kế của bạn.

**2. Mô phỏng số**

Đây là chỗ nó thắng tuyệt đối: viết harness mô phỏng 10.000 trận, vẽ phân bố, dò tổ hợp vượt trần. Xem [[balancing-math]]. Việc này trước đây tốn hàng tuần.

**3. Sinh biến thể từ khuôn bạn đã duyệt**

Bạn thiết kế 3 kẻ địch hay, mô tả rõ *vì sao* chúng hay, rồi nhờ nó sinh 12 biến thể theo cùng nguyên lý. Bạn sàng lọc. Thứ tự quan trọng: **khuôn của bạn trước, số lượng sau**.

**4. Kiểm tra tính nhất quán**

"Đọc GDD của tôi, tìm chỗ nào mâu thuẫn với Design Pillars." Nó đọc 3 trang nhanh hơn bạn và không bỏ sót vì quen mắt.

**5. Đặt tên và diễn đạt**

Tên skill, mô tả vật phẩm, tooltip. Việc lặp lại, cần nhiều lựa chọn để chọn một — đúng thế mạnh.

**6. Truy vấn ngược từ trải nghiệm về cơ chế**

"Người chơi chán ở phút 10. Liệt kê các mechanic có thể cho phép dynamic đó." Đây là chẩn đoán MDA ngược ở [[mda-framework]], và nó làm tốt vì đây là suy luận trên hệ thống đóng.

## Bốn việc đừng nhờ

| Việc | Vì sao AI không làm được |
|---|---|
| Chốt design pillars | Cần gu và quyết định, không phải tổng hợp |
| Đánh giá "có vui không" | Nó không chơi được game |
| Game feel, tinh chỉnh số cảm giác | Nó không cảm nhận được 90ms hitstop |
| Bố cục không gian màn chơi | Không có trực giác 3D, không thấy tầm nhìn |

Xem [[ai-limits]] về chi tiết và cách phát hiện khi mình đang nhờ sai việc.

## Vòng lặp thiết kế có AI

```
1. BẠN   viết pillar + core loop bằng tay (xem [[design-pillars]], [[core-loop]])
2. AI    phản biện: pillar nào không loại trừ gì? chiến lược suy biến là gì?
3. BẠN   sửa thiết kế
4. AI    mô phỏng số, trả về phân bố
5. BẠN   đọc phân bố, chỉnh ràng buộc → quay lại 4
6. BẠN   playtest — bước này không uỷ quyền được
7. AI    phân tích log playtest, chỉ ra bất thường (xem [[playtesting-metrics]])
8. BẠN   quyết định sửa gì
```

Chú ý: bước quyết định luôn là của bạn. AI xen vào giữa để **rút ngắn thời gian giữa hai quyết định**.

## Một sai lầm tốn thời gian

Nhờ AI sinh nội dung **trước khi** chốt khuôn. Kết quả là 50 kẻ địch đều đúng format mà không con nào thú vị, và bạn mất thời gian sàng lọc thứ lẽ ra không nên sinh ra.

Trình tự đúng: **3 cái làm tay → hiểu vì sao hay → mã hoá thành ràng buộc → mới sinh số lượng.** Xem [[content-design]] về cùng nguyên lý ở cấp nội dung.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc thiết kế**

Ba chế độ, dùng đúng chế độ cho đúng việc:

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| **Phản biện** | Vừa có ý tưởng, chưa chốt | "Đóng vai người chơi cố tình phá game…" |
| **Máy tính** | Đã có công thức, cần biết hệ quả | "Viết script mô phỏng, KHÔNG đưa số từ trực giác…" |
| **Thợ sinh biến thể** | Đã duyệt khuôn | "Đây là 3 mẫu tôi đã duyệt và lý do chúng hay…" |

**Không bao giờ dùng chế độ "tác giả"** — "thiết kế cho tôi một…" là câu mở đầu dẫn tới kết quả generic.

**Phải nêu rõ** (thiếu là AI trung bình hoá):
- Pillars và những gì chúng loại trừ
- Game tham chiếu, và **một điều** bạn muốn làm khác
- Động lực người chơi bạn phục vụ, và cặp xung khắc bạn từ chối
- Câu "không cần khen, chỉ liệt kê vấn đề"

**Mẫu prompt — chế độ phản biện**

```
Thiết kế của tôi: <mô tả hệ thống>
Pillars: <3 câu + những gì mỗi câu loại trừ>

Đóng vai người chơi cố tình phá game, KHÔNG đóng vai người ủng hộ:
1. Vòng lặp nào tạo tài nguyên hoặc sức mạnh vô hạn?
2. Chiến lược tối ưu (degenerate) là gì? Nó có nhàm chán không?
3. Chỗ nào hỏng sau 20 giờ chơi?
4. Pillar nào của tôi KHÔNG loại trừ được tính năng nào? (nếu có, nó chưa
   phải pillar)
5. Ba điểm yếu lớn nhất?

Không cần khen. Chỉ liệt kê vấn đề. Với mỗi vấn đề, nói rõ nó vi phạm
pillar nào hoặc nó tạo ra trải nghiệm gì.
```

**Bẫy thường gặp:** mở đầu bằng "bạn thấy thiết kế này thế nào?" — nhận về một đoạn khen rồi vài gợi ý chung chung. Phải ép vào vai phản biện và cấm khen.

## 🎮 Unity

Ở khâu thiết kế, Unity là **công cụ kiểm chứng**, và AI giúp bạn dựng công cụ đó nhanh hơn nhiều.

**Ba editor tool đáng nhờ AI viết ngay khi bắt đầu thiết kế**

**1. Bảng cân bằng** — một `EditorWindow` chạy mô phỏng và in bảng winrate/TTK. Xem [[balancing-math]]. AI viết được trong một lượt vì nó thuần logic.

**2. Chỉnh số lúc đang chạy** — Inspector khoá vào ScriptableObject config, sửa trong Play Mode có hiệu lực ngay. Không cần code, nhưng cần kiến trúc đúng: xem [[data-driven-design]].

**3. Biến thể bật/tắt bằng phím** — để so sánh trực tiếp ba phương án cơ chế:

```csharp
// Prototype so sánh được là prototype trả lời được câu hỏi.
// Xem [[prototyping]] — AI viết phần scaffolding này rất nhanh.
void Update() {
    if (Input.GetKeyDown(KeyCode.F1)) variant = (variant + 1) % 3;
    if (Input.GetKeyDown(KeyCode.R))  SceneManager.LoadScene(0);
}
```

**Nhờ AI dựng harness mô phỏng — lưu ý riêng cho Unity**

Mô phỏng phải chạy **ngoài** Play Mode, nếu không 10.000 trận mất hàng phút:

```
Viết harness mô phỏng cân bằng.

RÀNG BUỘC UNITY:
- Logic đặt trong Game.Core (asmdef noEngineReferences) — KHÔNG using UnityEngine
- Dùng System.Random(seed), KHÔNG UnityEngine.Random (nó static toàn cục và
  không tồn tại ngoài Unity)
- Dùng MathF/System.Math, KHÔNG Mathf
- Gọi được từ CẢ HAI: một EditorWindow và một console project (dotnet run)

Nhờ vậy tôi chạy 10.000 trận trong vài giây, không cần mở Unity.
```

Ba ràng buộc đó là lý do một harness chạy được trong CI thay vì chỉ chạy trong Editor.

**Kiểm tra nhanh**
- Chạy được mô phỏng bằng `dotnet run` không cần mở Unity chứ?
- Sửa số trong Play Mode có hiệu lực ngay chứ?
- Đổi được giữa các biến thể cơ chế bằng một phím chứ?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Nguyên tắc một câu về vai trò của AI ở khâu thiết kế?**
  → **AI là người phản biện và cái máy tính. Mình là tác giả.** Mọi cách dùng hiệu quả đều nằm trong một trong hai vai đó, và mọi thất vọng đều đến từ việc nhờ nó làm tác giả. Lý do cụ thể: nó tối ưu về **trung bình của dữ liệu huấn luyện**, còn thiết kế tốt là thứ lệch khỏi trung bình một cách có chủ ý.
- `Junior` **Nhờ AI "thiết kế một game roguelike" thì nhận được gì?**
  → **Trung bình của mọi roguelike** — tức là đúng thứ mình không muốn làm. Nó sẽ cho ra danh sách tính năng phổ biến nhất trong thể loại, hợp lý từng mục và nhạt về tổng thể. Muốn dùng được thì phải đưa ràng buộc, nhất là **ràng buộc phủ định**: game này cố ý không làm gì.
- `Junior` **Việc nào ở khâu thiết kế AI làm tốt nhất?**
  → **Phản biện** — đóng vai người chơi cố tình phá game hoặc publisher hoài nghi. Nó tìm ra chiến lược suy biến nhanh hơn mình vì **không gắn bó cảm xúc** với thiết kế của mình. Kế đó là **mô phỏng số**: viết harness chạy 10.000 trận, vẽ phân bố, dò tổ hợp vượt trần — việc trước đây tốn hàng tuần.
- `Mid` **Bốn việc không nên nhờ AI ở khâu thiết kế?**
  → **Chốt design pillars** (cần gu và quyết định, không phải tổng hợp). **Đánh giá "có vui không"** (nó không chơi được game). **Game feel và tinh chỉnh số cảm giác** (nó không cảm nhận được 90 ms hitstop). **Bố cục không gian màn chơi** (không có trực giác 3D, không thấy tầm nhìn).
- `Mid` **Sinh biến thể nội dung bằng AI làm theo thứ tự nào?**
  → **Khuôn của mình trước, số lượng sau**: thiết kế 3 kẻ địch hay, mô tả rõ **vì sao** chúng hay, mã hoá thành ràng buộc, rồi mới nhờ sinh 12 biến thể theo cùng nguyên lý và tự sàng lọc. Làm ngược lại thì có 50 kẻ địch đúng format mà không con nào thú vị, và mất thêm thời gian sàng lọc thứ lẽ ra không nên sinh ra.
- `Mid` **Dùng AI để chẩn đoán một vấn đề thiết kế thế nào?**
  → Truy ngược theo MDA: "Người chơi chán ở phút 10 — liệt kê các mechanic có thể cho phép dynamic đó." Nó làm tốt việc này vì đây là **suy luận trên một hệ thống đóng**: các luật đã biết, và câu hỏi là tổ hợp nào dẫn tới hành vi đó. Việc nó không làm được là nói người chơi *sẽ cảm thấy* gì.
- `Senior` **Vì sao "kiểm tra tính nhất quán" lại là việc đáng giao?**
  → Vì mình **quen mắt** với tài liệu của chính mình nên đọc lướt qua mâu thuẫn, còn nó thì không. "Đọc GDD, tìm chỗ mâu thuẫn với design pillars" là loại việc đọc kỹ và đối chiếu đều tay — máy làm tốt hơn người, và kết quả kiểm chứng được ngay vì mỗi mâu thuẫn đều chỉ ra hai chỗ cụ thể.
- `Senior` **Vòng lặp thiết kế có AI thì bước nào vẫn là của người?**
  → **Bước quyết định**, luôn luôn. AI xen vào giữa để **rút ngắn thời gian giữa hai quyết định** — phản biện nhanh hơn, mô phỏng nhanh hơn, sinh biến thể nhanh hơn. Nếu nó bắt đầu quyết định thay thì thứ nhận được sẽ hội tụ về trung bình của ngành, và bản sắc của game là thứ mất đầu tiên.
- `Senior` **Anh nhờ AI phản biện thiết kế thế nào cho có ích thật?**
  → Đặt vai tường minh — người chơi cố phá game, hoặc publisher hoài nghi — nêu **ràng buộc và mục tiêu thật** của dự án, và yêu cầu **tìm điểm yếu chứ không tìm điểm mạnh**, kèm câu "đừng mở đầu bằng lời khen". Rồi tự lọc: phản biện đúng thì sửa, phản biện sai thì ghi lại vì sao — cái ghi lại đó chính là tài liệu bất biến của dự án.

**Khung trả lời 60 giây** — "AI làm được phần nào của việc thiết kế game?"

> Câu hỏi đúng không phải "AI thiết kế game được không" mà **AI làm được phần nào**. Nguyên tắc tôi dùng gọn trong một câu: **AI là người phản biện và cái máy tính, mình là tác giả**. Mọi cách dùng hiệu quả đều nằm trong hai vai đó.
>
> Cụ thể thì nó mạnh ở sáu việc: **phản biện** — tìm chiến lược suy biến nhanh hơn tôi vì không gắn bó cảm xúc với thiết kế; **mô phỏng số** — chạy mười nghìn trận và vẽ phân bố, chỗ nó thắng tuyệt đối; **sinh biến thể từ khuôn tôi đã duyệt**; **kiểm tra tính nhất quán** giữa GDD và pillar; đặt tên và diễn đạt; và **truy ngược từ trải nghiệm về cơ chế**.
>
> Bốn việc tôi không nhờ: chốt pillar, đánh giá "có vui không", tinh chỉnh game feel, và bố cục không gian màn chơi. Lý do chung là nó **không cảm nhận được** và nó **kéo mọi thứ về trung bình của ngành** — trong khi thiết kế tốt là thứ lệch khỏi trung bình một cách có chủ ý.

**Họ sẽ đào tiếp**

- *"Vì sao 'không gắn bó cảm xúc' lại là ưu thế khi phản biện?"* → Vì phần khó nhất của tự phản biện là chấp nhận rằng thứ mình vừa nghĩ ra có lỗ hổng. Một người phản biện không có gì để mất sẽ chỉ ra ngay, và chỉ ra **nhiều phương án phá** thay vì một. Cái giá là nó cũng chỉ ra nhiều thứ không quan trọng — nên bước lọc vẫn là của mình.
- *"Sinh nội dung trước khi chốt khuôn sai ở đâu?"* → Ở chỗ mình chưa biết **vì sao ba cái đầu hay**, nên không có tiêu chí để sàng lọc năm mươi cái sau. Kết quả là tốn thời gian đọc nội dung mà không có thước đo, và thường kết thúc bằng việc giữ lại thứ "nghe cũng được" — tức là đúng cái trung bình mình muốn tránh.
- *"Làm sao biết mình đang nhờ AI làm tác giả mà không nhận ra?"* → Dấu hiệu là mình **hỏi nó nên làm gì** thay vì đưa nó một phương án để phá. Câu hỏi "cách nào tốt nhất" gần như luôn là dấu hiệu đó. Chuyển thành "so sánh A và B cho ràng buộc của tôi, khuyến nghị một cái và nói rõ đánh đổi" là quay lại đúng vai.
- *"Mô phỏng số cụ thể giao thế nào?"* → Đưa luật, đưa khoảng giá trị, yêu cầu **viết harness và chạy**, in ra **phân bố chứ không phải trung bình**, rồi **chạy lại sau khi chỉnh**. Ba chi tiết đó biến một đề xuất nghe khoa học thành một kết quả kiểm chứng được.

**Cờ đỏ**

- Nhờ AI "thiết kế game" rồi thất vọng vì kết quả nhạt.
- Sinh nội dung hàng loạt trước khi chốt khuôn và biết vì sao khuôn đó hay.
- Nhận đánh giá "cơ chế này vui" từ AI như một bằng chứng.
- Hỏi "cách nào tốt nhất" thay vì đưa hai phương án và ràng buộc.
- Để AI chỉnh số game feel thay vì tự chỉnh trong lúc game chạy.

**Số / ví dụ nên thuộc**

- Nguyên tắc một câu: **AI là người phản biện và cái máy tính; mình là tác giả**.
- Sáu việc nó làm tốt: **phản biện · mô phỏng số · sinh biến thể từ khuôn · kiểm tra nhất quán · đặt tên/diễn đạt · truy ngược trải nghiệm → cơ chế**.
- Bốn việc không nhờ: **chốt pillar · đánh giá có vui không · game feel · bố cục không gian**.
- Trình tự sinh nội dung: **3 cái làm tay → hiểu vì sao hay → mã hoá thành ràng buộc → mới sinh số lượng**.
- Mô phỏng: chạy **10.000 trận**, nhìn **phân bố**, và **chạy lại sau khi chỉnh**.
