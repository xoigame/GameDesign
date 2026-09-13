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
- **[[coding-agents]]** — Claude Code, Codex, Cursor: chọn hình thái nào cho việc nào, thiết lập repo một lần, đọc diff agent viết, chạy nhiều agent song song.
- **[[gdd-for-ai]]** — viết tài liệu thiết kế mà máy đọc được. Node quan trọng nhất nhánh này.
- **[[prompt-patterns]]** — các mẫu prompt cho từng loại việc trong gamedev.
- **[[context-engineering]]** — vì sao phiên dài tốn tiền theo bình phương, bảy đòn bẩy tiết kiệm token, và ba tầng ngữ cảnh.
- **[[agent-guardrails]]** — rào chắn để agent không phá vỡ thiết kế của bạn.
- **[[ai-limits]]** — chỗ AI thất bại đáng tin cậy, và cách phát hiện khi mình nhờ sai việc.
- **[[asset-generation]]** — sinh sprite, âm thanh, nhạc.

**Tự xây trợ lý cho team**
- **[[ai-assistant-architecture]]** — bốn lớp của một trợ lý dùng được: ngữ cảnh, công cụ, vòng lặp tự sửa, cổng người. Kèm cầu nối Editor chạy được.
- **[[knowledge-base-for-agents]]** — kho kiến thức máy đọc được làm ngữ cảnh dùng chung. Case study chính kho này, kèm hai lỗi im lặng đã xảy ra thật.
- **[[ai-eval]]** — đo xem trợ lý có thật sự tốt lên không: golden task lấy từ lịch sử repo, bốn nhóm chỉ số, cách so sánh không tự lừa mình.

**Nói về nó trong phòng phỏng vấn**
- **[[ai-interview]]** — ba thứ người phỏng vấn thật sự đang đo khi hỏi "anh dùng AI thế nào", bằng chứng nên mang theo, và bộ câu hỏi khi chính bạn ngồi ghế phỏng vấn.

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

## 🎤 Phỏng vấn

Node con trong nhánh này đều có mục 🎤 riêng. Mục này gom câu hỏi về **cách làm việc với AI** —
loại câu ngày càng xuất hiện ở mọi vị trí, và là chỗ dễ trả lời hời hợt nhất.

**Câu hỏi về AI xuất hiện ở ba dạng**

| Dạng | Họ đo cái gì | Node nên ôn |
|---|---|---|
| "Anh dùng AI thế nào?" | Bạn kể quy trình hay kể tên công cụ | [[ai-workflow]], [[ai-tooling]] |
| "Làm sao nó viết đúng quy ước dự án?" | Bạn có hạ tầng hay chỉ có prompt | [[gdd-for-ai]], [[agent-guardrails]] |
| "Có đo được nó giúp gì không?" | Bạn đo hay bạn cảm thấy | [[ai-eval]], [[ai-limits]] |

**Câu hay gặp**

- `Junior` **Anh dùng AI vào việc gì trong công việc hằng ngày?**
  → Trả lời bằng **quy trình**, không bằng danh sách công cụ. Cụ thể: việc đọc kỹ và tẻ nhạt (soát cấp phát ẩn, dò mâu thuẫn giữa các file), việc chuyển dạng (bảng số sang struct), bản nháp test, và editor tool. Việc không giao là những gì **compile và test không kiểm chứng được** — gán Inspector, dựng scene, và mọi quyết định cảm giác.
- `Junior` **Bốn câu tự kiểm trước khi giao việc cho AI?**
  → **Kiểm chứng được không** — có cách biết đúng sai trong vài phút? **Đặc tả được bằng chữ không** — phải nói "bạn hiểu ý tôi mà" là chưa đủ. **Sai thì hoàn tác rẻ không** — đã commit trước chưa? **Mình hiểu được kết quả không** — nếu không thì ai bảo trì? "Không" ở bất kỳ câu nào thì cân nhắc tự làm.
- `Mid` **Làm sao để AI viết code đúng quy ước dự án?**
  → Một **file luật ở gốc repo** mà agent đọc mỗi phiên, viết ở dạng **luật kiểm tra được** chứ không phải lời khuyên, cộng một mục lục để nó tự mở đúng file cần. Rồi chuyển các bất biến quan trọng thành **test chạy trong CI** — để chúng được thi hành kể cả khi mình quên nhắc.
- `Mid` **Cái bẫy "80% nhanh, 20% cuối chậm hơn" là gì và tránh thế nào?**
  → 20% cuối là **tích hợp, trường hợp biên, và những thứ chỉ lộ ra khi chạy thật** — đúng ba điểm mù của AI — và mình đang sửa code mình không viết. Tránh bằng cách chia nhiệm vụ theo **lát cắt dọc chạy được**, để phần khó lộ ra ở nhiệm vụ thứ hai chứ không dồn về tuần cuối.
- `Senior` **Đo xem AI có thật sự giúp được không thì đo bằng gì?**
  → Bằng **golden task lấy từ lịch sử repo** — 20–40 thay đổi thật, tiêu chí đạt máy chấm được — chạy mỗi task **n = 3** vì agent không tất định, đổi **một** thứ mỗi lần. Bốn nhóm chỉ số: tỉ lệ **xong trong một vòng**, **% diff bị người sửa lại**, chi phí **mỗi nhiệm vụ hoàn thành**, và thời gian review. "Bao nhiêu % code do AI viết" là chỉ số tệ vì nó tạo động cơ xấu ngay lập tức.
- `Senior` **Ranh giới nào anh không bước qua khi làm việc với AI?**
  → Không để nó quyết định **thiết kế** (pillar, core loop) vì nó kéo mọi thứ về trung bình của ngành; không để nó **quyết định hành vi gameplay** trong các hệ thống chạy thời gian thực; không commit code mình **không giải thích được cho người khác**; và không trả lời câu hỏi **giấy phép hay quy định store** bằng trí nhớ của nó — cái đó tra nguồn chính thức tại thời điểm phát hành.

**Khung trả lời 60 giây** — "Anh làm việc với AI trong dự án game thế nào?"

> Tôi chia theo giai đoạn, và ranh giới ở hai đầu là cứng: **thiết kế tôi làm, không uỷ quyền**, và **đánh bóng** ở cuối cũng phần lớn là việc của người vì nó là cảm giác. Ở giữa, khoản đầu tư sinh lời cao nhất là **tài liệu cho AI đọc** — một buổi chiều viết tiết kiệm hàng tuần sửa code sai hướng.
>
> Cách làm hằng ngày có ba chốt: nhiệm vụ cỡ **một commit, kiểm chứng được**; **đọc kế hoạch trước khi agent viết code** — ba mươi giây đổi lấy hai mươi phút; và **commit trước mỗi nhiệm vụ lớn**, vì `git reset` rẻ hơn gỡ rối.
>
> Còn phần tôi cho là quan trọng nhất mà ít người làm: **rào chắn kiểm tra được và đo được**. Bất biến viết kèm cách phát hiện vi phạm, chuyển thành test chạy trong CI; và đánh giá bằng golden task lấy từ lịch sử repo với **n = 3**, nhìn tỉ lệ xong trong một vòng và **phần diff bị người sửa lại** — chứ không nhìn bao nhiêu phần trăm code do AI viết.

**Cờ đỏ**

- Trả lời bằng danh sách công cụ, không có quy trình nào.
- Không có file luật trong repo; mọi quyết định chỉ tồn tại trong lịch sử chat.
- Đánh giá bằng cảm giác "tôi thấy nó viết khá hơn".
- Nhận con số cân bằng từ AI mà không có mô phỏng.
- Merge code không giải thích được vì "nó chạy được".

**Số / ví dụ nên thuộc**

- Bảy giai đoạn: **thiết kế → GDD → dựng khung → vertical slice → nhân rộng → cân bằng → đánh bóng**.
- Bốn thất bại hệ thống: **trung bình hoá · không cảm nhận · không trực giác không gian · tự tin khi sai**.
- Eval: **20–40 golden task**, **n = 3**, canary **5 task** mỗi lần sửa luật, bộ để riêng theo tháng.
- Chỉ số hay bị bỏ quên nhất: **% diff bị người sửa lại**.
- Trần vòng tự sửa **3–5**; đọc kế hoạch **30 giây** đổi lấy **20 phút**.
