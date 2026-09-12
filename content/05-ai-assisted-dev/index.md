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

**Bắt đầu ở đâu**
- **[[ai-tooling]]** — bản đồ công cụ: coding agent, sinh asset, phân tích. Tiêu chí chọn quan trọng hơn danh sách tính năng.

**Ba khâu của vòng đời — dùng AI ở đâu**
- **[[ai-for-design]]** — khâu **thiết kế**. AI là người phản biện và cái máy tính, không phải tác giả.
- **[[ai-for-build]]** — khâu **hiện thực hoá**. Chia nhiệm vụ, kế hoạch trước code, chỗ bạn vẫn phải tự vào Editor.
- **[[ai-for-publish]]** — khâu **phát hành**. Store page, trailer, bản dịch, phân tích review, patch note.

**Cách làm việc**
- **[[ai-workflow]]** — quy trình 7 giai đoạn từ ý tưởng tới build chạy được.
- **[[gdd-for-ai]]** — viết tài liệu thiết kế mà máy đọc được. Node quan trọng nhất nhánh này.
- **[[prompt-patterns]]** — các mẫu prompt cho từng loại việc trong gamedev.
- **[[agent-guardrails]]** — rào chắn để agent không phá vỡ thiết kế của bạn.
- **[[ai-limits]]** — chỗ AI thất bại đáng tin cậy, và cách phát hiện khi mình nhờ sai việc.
- **[[asset-generation]]** — sinh sprite, âm thanh, nhạc.

**Tự xây trợ lý cho team**
- **[[ai-assistant-architecture]]** — bốn lớp của một trợ lý dùng được: ngữ cảnh, công cụ, vòng lặp tự sửa, cổng người. Kèm cầu nối Editor chạy được.
- **[[knowledge-base-for-agents]]** — kho kiến thức máy đọc được làm ngữ cảnh dùng chung. Case study chính kho này, kèm hai lỗi im lặng đã xảy ra thật.
- **[[ai-eval]]** — đo xem trợ lý có thật sự tốt lên không: golden task lấy từ lịch sử repo, bốn nhóm chỉ số, cách so sánh không tự lừa mình.

## Ba khâu, ba cách dùng khác nhau

Điểm dễ nhầm nhất: **cùng một công cụ nhưng vai của nó đổi hoàn toàn giữa ba khâu.**

| Khâu | Vai của AI | Bạn giữ gì | Node |
|---|---|---|---|
| **Thiết kế** | Phản biện + máy tính | Mọi quyết định, gu, đánh giá "có vui không" | [[ai-for-design]] |
| **Làm** | Thợ viết code | Duyệt kế hoạch, chạy thử, tích hợp | [[ai-for-build]] |
| **Phát hành** | Người viết nháp + phân tích | Đọc và gửi — mọi đầu ra hướng ra ngoài | [[ai-for-publish]] |

Dùng sai vai là nguồn thất vọng phổ biến nhất: nhờ nó làm tác giả ở khâu thiết kế, hoặc để nó tự động gửi ở khâu phát hành.

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

## 🎮 Unity

Làm việc với AI agent trên một Unity project có vài đặc thù mà project web hay backend không có.

**Ba thứ khiến Unity khó cho AI agent**

1. **Scene và prefab là file YAML khổng lồ.** Agent đọc được nhưng sửa tay gần như luôn làm hỏng. Việc gì cần sửa scene/prefab thì bạn tự làm trong Editor.
2. **Nhiều thứ không nằm trong code** — ProjectSettings, Animator Controller, AudioMixer, Lighting. Agent không thấy chúng trừ khi bạn mô tả.
3. **Không chạy được game để kiểm chứng.** Agent viết xong không biết nó có hoạt động không. Bạn là vòng lặp kiểm chứng.

**Phân công thực tế trên Unity project**

| Việc | Agent làm | Bạn làm |
|---|---|---|
| Class C# thuần trong `Core/` | ✅ rất tốt | Review |
| MonoBehaviour, component | ✅ tốt | Gắn vào prefab |
| Sửa prefab / scene | ❌ dễ hỏng | ✅ trong Editor |
| Animator Controller | ❌ binary-ish | ✅ |
| ProjectSettings | ❌ không thấy | ✅, rồi kể cho agent |
| Editor tool, validator | ✅ rất tốt | Review |
| Shader Graph | ❌ | ✅ |
| Shader HLSL viết tay | ✅ tốt | Kiểm tra trên máy đích |

**Đưa thông tin agent không thấy được**

Viết vào `CLAUDE.md` những setting agent không đọc được:

```markdown
## Project settings (agent không thấy được, đây là sự thật)

- Unity 6000.0.32f1, URP 17
- Color Space: Linear
- Fixed Timestep: 0.01667 (60Hz)
- Input System mới (KHÔNG có Input Manager cũ)
- Collision matrix: layer Player không va chạm layer PlayerProjectile
- AudioMixer bus: Master > [Music, SFX > (Player, Enemy, World), UI, Ambience]
- Assembly: Game.Core (noEngineReferences), Game.Unity, Game.Editor
```

Thiếu khối này, agent sẽ viết `Input.GetKey` (Input Manager cũ) hoặc đặt layer sai — và code trông đúng nhưng không chạy.

**Vòng lặp làm việc trên Unity**

```
1. Bạn:   nhiệm vụ + tham chiếu node trong kho
2. Agent: kế hoạch (file nào, API nào)     ← DỪNG, đọc
3. Bạn:   duyệt
4. Agent: viết code C#
5. Bạn:   gắn component vào prefab trong Editor, bấm Play
6. Bạn:   commit, hoặc mô tả lỗi cụ thể → quay lại 4
```

Bước 5 không uỷ quyền được. Đó là lý do nhiệm vụ nên nhỏ: mỗi lần bạn phải tự vào Editor kiểm chứng.

**Kiểm tra nhanh**
- `CLAUDE.md` có khối project settings chưa?
- Agent có bao giờ sửa `.prefab`/`.unity` không? (nên không)
- Nhiệm vụ giao có kiểm chứng được trong một lần bấm Play không?
