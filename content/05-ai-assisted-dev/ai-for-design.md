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
