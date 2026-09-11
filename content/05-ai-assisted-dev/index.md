---
title: Làm game với AI
icon: 🛠️
summary: Dùng Codex/Claude để thực sự làm ra game — quy trình, cách viết GDD cho AI đọc, prompt pattern, và rào chắn an toàn.
status: deep
read: 90
level: basic
order: 50
tags: [ai-dev, workflow, process]
related: [game-ai, blueprints, production]
---

Nhánh này nói về **AI làm ra game**, không phải AI trong game (đó là [[game-ai]]).

## Điều quyết định thành bại

Sau khi thử đủ kiểu, kết luận khá nhất quán: **chất lượng đầu ra tỉ lệ thuận với chất lượng đặc tả, không phải với độ thông minh của model.**

Cùng một model:
- *"Làm game platformer"* → cho ra thứ generic, không dùng được.
- Một GDD 3 trang có số liệu, ràng buộc và bất biến → cho ra code dùng được ngay, sửa vài chỗ.

Toàn bộ kho kiến thức này tồn tại để bạn viết được đặc tả thứ hai.

## Các node

- **[[ai-workflow]]** — quy trình từ ý tưởng tới build chạy được, chia giai đoạn.
- **[[gdd-for-ai]]** — viết tài liệu thiết kế mà máy đọc được. Node quan trọng nhất nhánh này.
- **[[prompt-patterns]]** — các mẫu prompt cho từng loại việc trong gamedev.
- **[[agent-guardrails]]** — rào chắn để agent không phá vỡ thiết kế của bạn.
- **[[asset-generation]]** — sinh sprite, âm thanh, nhạc.

## Phân công hợp lý

| Việc | Ai làm | Vì sao |
|---|---|---|
| Design pillars, core loop | **Bạn** | Cần gu và quyết định, AI chỉ biết trung bình hoá |
| Game feel, tinh chỉnh số | **Bạn** | AI không cảm nhận được |
| Bố cục màn chơi | **Bạn** | AI không có trực giác không gian |
| Hệ thống, kiến trúc code | **AI**, bạn duyệt | Đây là thế mạnh rõ nhất |
| Toán cân bằng, mô phỏng | **AI** | Nhanh hơn người hàng chục lần |
| Thuật toán (pathfinding, procgen) | **AI** | Có định nghĩa rõ, kiểm chứng được |
| Boilerplate, refactor, test | **AI** | Không cần bàn |
| Đánh giá "có vui không" | **Bạn** | Không uỷ quyền được |

Dòng cuối là dòng quan trọng nhất. AI đẩy nhanh mọi thứ *trừ* việc biết game có hay không — nên nút thắt cổ chai chuyển từ **thời gian code** sang **thời gian playtest**. Hãy đầu tư vào việc rút ngắn vòng lặp đánh giá.

## Sai lầm phổ biến

**Giao quá to một lần.** "Viết cho tôi cả game" cho ra 2000 dòng không chạy. Chia thành các bước có thể chạy và kiểm chứng được sau mỗi bước.

**Không đưa ràng buộc.** AI sẽ chọn phương án phổ biến nhất trong dữ liệu huấn luyện — nghĩa là game của bạn giống mọi tutorial. Ràng buộc là thứ tạo ra khác biệt.

**Chấp nhận code không đọc.** Code AI viết trông rất thuyết phục kể cả khi sai. Bạn phải hiểu được nó, nếu không bạn không bảo trì được dự án của chính mình.

**Quên rằng AI không nhớ.** Mỗi phiên làm việc mới, agent không biết gì về quyết định hôm qua. Đó chính là lý do kho tài liệu này tồn tại — xem [[gdd-for-ai]].

## 🤖 Prompt cho AI

Nhánh này là *cách làm việc*, nên "prompt" ở đây là **thiết lập phiên làm việc** — thứ bạn gửi ở đầu mỗi buổi.

**Mẫu thiết lập phiên**

```
Dự án: <tên>. Engine: <tên + phiên bản chính xác>.

Đọc trước khi làm bất cứ việc gì:
  1. CLAUDE.md
  2. design/GDD.md — mục Pillars, Bất biến, Ngoài phạm vi là RÀNG BUỘC CỨNG
  3. design/decisions.md — các quyết định đã chốt, đừng đề xuất lại

Cách làm việc tôi muốn:
- Nhiệm vụ lớn: TRÌNH BÀY KẾ HOẠCH TRƯỚC, chờ tôi duyệt, rồi mới viết code.
- Mỗi nhiệm vụ = một commit, chạy được và kiểm chứng được sau khi xong.
- Phát hiện vấn đề ngoài phạm vi -> GHI CHÚ, không tự sửa.
- Yêu cầu mơ hồ -> HỎI, đừng chọn giùm tôi.
- Cần vi phạm một bất biến -> DỪNG, giải thích, chờ tôi quyết.

Nhiệm vụ hôm nay: <mô tả>
```

**Phải luôn nêu:** phiên bản engine chính xác. Tri thức của model có thời điểm cắt; engine thì cập nhật liên tục. Đây là nguồn lỗi "API không tồn tại" phổ biến nhất.

**Bẫy thường gặp:** giao nguyên một tính năng lớn ("làm hệ thống chiến đấu") và nhận về 2000 dòng không chạy. Chia tới mức *một lần commit, chạy được, kiểm chứng được*.
