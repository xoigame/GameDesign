---
id: root
title: GameDesign Brain
icon: 🧠
summary: Kho kiến thức mindmap về Game Design và AI trong game — đồng thời là bộ não thiết kế cho AI agent đọc trước khi sinh code.
status: deep
read: 10
level: basic
order: 0
tags: [meta]
---

Đây là **bộ não trung tâm**: một nơi vừa để con người học và tra cứu, vừa để AI agent (Codex, Claude Code, Cursor…) đọc rồi dựng game thật.

## Kho này giải quyết chuyện gì

Khi nhờ AI viết game, vấn đề lớn nhất không phải là AI code kém — mà là **AI không biết bạn muốn gì**. Prompt kiểu "làm cho tôi game bắn súng" cho ra thứ generic, vì mọi quyết định thiết kế đều bị AI bịa ra.

Kho này lấp đúng khoảng trống đó theo hai lớp:

1. **Lớp kiến thức** (nhánh 1–6, 8, 9) — nguyên lý game design và AI in game. Đây là vốn hiểu biết chung: AI đọc để có chung ngôn ngữ và chuẩn mực với bạn.
2. **Lớp bản thiết kế** ([[blueprints]]) — GDD của game cụ thể bạn đang làm. Đây mới là thứ AI thực thi.

Thiếu lớp 1, AI làm ra game "đúng yêu cầu nhưng chán". Thiếu lớp 2, AI không có gì để làm.

## Chín nhánh

| Nhánh | Nội dung | Dùng khi |
|---|---|---|
| [[foundations]] | Nền tảng thiết kế: core loop, động lực người chơi, MDA, game feel | Bắt đầu một ý tưởng game mới |
| [[systems]] | Systems design: kinh tế, tiến trình, combat, cân bằng số | Thiết kế các hệ thống chạy trong game |
| [[content-design]] | Level, màn chơi, procedural, narrative | Đổ nội dung vào bộ khung hệ thống |
| [[presentation]] | Nghe nhìn & UX: art direction, animation, UI, HUD, âm thanh, trợ năng | Biến hệ thống thành thứ người chơi cảm nhận được |
| [[game-ai]] | AI điều khiển NPC/gameplay: FSM, Behavior Tree, GOAP, Utility AI, pathfinding | Làm cho enemy/NPC thông minh |
| [[ai-assisted-dev]] | Dùng AI (Codex/Claude) để **làm** game | Muốn AI code hộ mà kết quả dùng được |
| [[production]] | Kiến trúc, data-driven, đo đạc, hiệu năng | Biến prototype thành sản phẩm |
| [[unity]] | Unity thực chiến: vật lý, animation, pattern, UI, audio, VFX, shader, ánh sáng, tối ưu, build, multiplayer | Hiện thực hoá trong Unity mà không dính bẫy |
| [[blueprints]] | GDD của game thật + template | Bắt tay vào một dự án cụ thể |

Phân biệt quan trọng: **[[game-ai]] là AI *trong* game** (con quái biết né đạn). **[[ai-assisted-dev]] là AI *làm ra* game** (Claude viết script cho con quái đó). Hai thứ hoàn toàn khác nhau, đừng lẫn.

## Cách dùng

**Đọc/duyệt:** `npm run dev` rồi lang thang trên mindmap. Click node để đọc, `/` để tìm kiếm.

**Mở rộng:** tạo file `.md` mới trong `content/<nhánh>/`, khai frontmatter, lưu lại. Mindmap tự cập nhật — không cần khai báo node ở đâu khác. Xem quy ước ở `content/_SCHEMA.md`.

**Cho AI đọc:** nói với agent *"đọc `AI_CONTEXT.md` trước"*. File đó chỉ đường tới `KNOWLEDGE_INDEX.md` (mục lục tự sinh) và các file chi tiết. Hoặc bấm **Copy cho AI** ở panel bên phải để lấy đúng một nhánh mà dán vào chat.

## Nguyên tắc bất di bất dịch

> **Markdown trong `content/` là nguồn chân lý duy nhất.**
> `public/data/graph.json` và `KNOWLEDGE_INDEX.md` đều do máy sinh ra. Sửa tay vào chúng sẽ mất sạch ở lần build kế tiếp.

Trạng thái node: `deep` = đã viết đủ dùng · `stub` = mới có khung, cần bồi đắp. Node stub hiện viền đứt trên mindmap — đó là danh sách việc cần làm của chính kho này.

## 🤖 Prompt cho AI

**Dùng AI thế nào với kho này**

Ba cách, chi phí và độ chính xác khác nhau rõ:

| Cách | Khi nào | Lưu ý |
|---|---|---|
| Agent **đọc file** trong repo | Mặc định. Agent có filesystem. | Rẻ nhất, luôn đúng hiện trạng |
| **Copy mục này** / **Copy cả nhánh** | Giao đúng một việc | ~1k / ~13k token |
| **Xuất playbook prompt** | AI không đọc được ổ đĩa | ~15k token |

Xem [[ai-tooling]] về tiêu chí chọn công cụ, và [[ai-limits]] về chỗ không nên nhờ.

Node gốc không phải chỗ để viết prompt cụ thể. Nhưng mọi prompt gửi AI về dự án game đều nên mở đầu bằng **một khối định vị** như dưới đây — nó ngăn AI mặc định về "game trung bình của ngành".

**Mẫu mở đầu cho mọi phiên làm việc**

```
Kho kiến thức thiết kế: E:/XoiGame/GameDesign
Đọc AI_CONTEXT.md trước, rồi KNOWLEDGE_INDEX.md để biết có những node nào.

GDD của dự án: content/07-blueprints/<ten-game>.md
Ba mục sau là RÀNG BUỘC CỨNG, vi phạm thì phải dừng và hỏi tôi:
  - Design Pillars
  - Bất biến (INV-xx)
  - Không thuộc phạm vi

Trước khi chọn kỹ thuật cho <việc cần làm>, đọc node liên quan trong kho
và nói cho tôi biết bạn chọn cái nào, vì sao.
```

**Bẫy lớn nhất:** dán cả 22.000 từ kiến thức vào chat. Vừa tốn token vừa làm loãng tín hiệu. Hãy để agent **đọc file theo nhu cầu** — chỉ dán khi agent không truy cập được ổ đĩa.

## 🎮 Unity

Toàn bộ kinh nghiệm Unity nằm ở nhánh [[unity]] — 17 node về vật lý, animation, pattern, UI, audio, VFX, shader, lighting, tối ưu, build, multiplayer.

Mục 🎮 ở các nhánh thiết kế **không lặp lại** nội dung đó. Nó chỉ trả lời: *quyết định thiết kế này sống ở đâu trong Unity project?*

**Đọc theo thứ tự nào nếu bạn đang làm Unity**

| Bạn đang ở đâu | Đọc gì |
|---|---|
| Chưa mở Unity, còn đang nghĩ ý tưởng | Nhánh [[foundations]] (#2–8) |
| Đã có ý tưởng, muốn giao việc cho AI | Nhánh [[ai-assisted-dev]] (#9–15) |
| Vừa `New Project`, chưa viết gì | [[unity-project-structure]], [[unity-game-loop]] |
| Đang dựng gameplay | [[unity-physics]], [[unity-input]], [[unity-camera]] |
| Game chạy được, cần "đã tay" | [[game-feel]] rồi [[unity-vfx]], [[unity-audio]] |
| Chuẩn bị phát hành | [[unity-optimization]], [[unity-build-platform]] |

**Ba quyết định Unity không sửa được về sau**

Chốt trong tuần đầu, vì đổi nghĩa là làm lại asset hoặc code diện rộng:

1. **Color space = Linear** (`Project Settings > Player`) — xem [[unity-lighting]]
2. **Input System mới**, không Input Manager cũ — xem [[unity-input]]
3. **Fixed Timestep = 1/60** nếu game có frame data — xem [[combat-systems]]

Và một quyết định kiến trúc: **`Assets/Scripts/Core/` không `using UnityEngine`**. Nó cho bạn test EditMode chạy trong mili giây và mô phỏng cân bằng ngoài Unity — xem [[unity-project-structure]].

**Kiểm tra nhanh**
- `Project Settings > Player > Color Space` = Linear?
- `Time > Fixed Timestep` = 0.01667?
- `grep -r "using UnityEngine" Assets/Scripts/Core/` → rỗng?
