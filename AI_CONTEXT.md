# AI_CONTEXT — đọc file này trước

Bạn đang ở trong **GameDesign Brain**, một kho kiến thức về game design và AI trong game.
File này là điểm vào. Đọc hết file này trước khi mở bất cứ file nào khác.

> **File này nói kho *chứa gì*. [`AGENTS.md`](AGENTS.md) nói *làm việc thế nào*** —
> được sửa gì, quy trình thêm/sửa/dịch node, cổng kiểm tra, bẫy đã từng làm hỏng kho.
> Cả hai đều cần đọc; `AGENTS.md` là luật chung cho mọi agent (Codex, Claude Code, Cursor…).

## Kho này là gì

Hai lớp, phục vụ hai mục đích khác nhau:

| Lớp | Thư mục | Vai trò của bạn |
|---|---|---|
| **Kiến thức** | `content/01-*` … `content/06-*`, `content/08-*` … `content/14-*` | Đọc để hiểu bối cảnh và chuẩn mực. Đây là nền tri thức chung giữa bạn và người dùng. |
| **Bản thiết kế** | `content/07-blueprints/` | **Đây mới là thứ bạn thực thi.** GDD của game cụ thể đang được làm. |

Nếu người dùng nhờ bạn *làm ra một game*, tài liệu quyết định nằm ở `content/07-blueprints/`.
Chín nhánh còn lại là để bạn hiểu *vì sao* thiết kế được viết như vậy — riêng `content/09-unity/` và `content/11-cocos-creator/` nói *làm thế nào* trong từng engine.

## Lộ trình đọc và mức độ

Mỗi node có hai trường định vị nó cho người học:

- **`read`** — khoá sắp xếp lộ trình đọc. Build quy về thứ hạng `readIndex` (1…N).
  `KNOWLEDGE_INDEX.md` có bảng **Lộ trình đọc** đầy đủ theo thứ tự này.
- **`level`** — `basic` (●) / `intermediate` (◐) / `advanced` (○).

Dùng chúng khi trả lời người dùng: nếu họ hỏi một chủ đề `advanced` mà chưa đọc phần
`basic` tương ứng, hãy nói rõ node nền nào nên đọc trước thay vì trả lời thẳng.

Khi thêm node mới: chọn `read` là **khe trống giữa hai node liền kề** (bội số 10, chèn số lẻ ở giữa) — đừng đánh số lại cả kho.

## Nạp sách vào kho

Sách nằm ở `sources/`. Quy trình đầy đủ ở `sources/README.md`. Ba luật quan trọng:

1. **Đề xuất trước, sửa sau.** Đưa bảng "bổ sung gì / mâu thuẫn gì / cần node mới nào", chờ duyệt.
2. **Mâu thuẫn thì giữ cả hai** và nêu điều kiện áp dụng — đừng trung bình hoá hai quan điểm.
3. **Ghi nguồn** vào `refs:` của node bị sửa. Không chép nguyên đoạn dài từ sách.

## Mục 🤖 Prompt cho AI — đọc trước khi nhận việc

Mỗi node đều kết thúc bằng mục **`## 🤖 Prompt cho AI`**. Mục này nói rõ, cho đúng chủ đề đó:

- **Phải nêu rõ** — những tham số/quyết định mà người dùng thường quên, và bạn sẽ phải tự bịa nếu thiếu.
- **Mẫu prompt** — dạng đầu bài đầy đủ cho chủ đề đó.
- **Bẫy thường gặp** — lỗi mà AI hay mắc ở đúng chủ đề đó.

Cách bạn nên dùng mục này:

> Khi nhận một yêu cầu về chủ đề X, hãy mở node X, đọc mục 🤖, rồi **đối chiếu yêu cầu
> của người dùng với danh sách "Phải nêu rõ"**. Thiếu mục nào thì **hỏi**, đừng tự điền.
> Và tự kiểm tra mình có đang mắc đúng cái "Bẫy thường gặp" đó không.

Trong `graph.json`, mục này nằm ở trường riêng `node.aiPrompt` (đã tách khỏi `node.body`).

## Mục 🎮 Unity — tuỳ chọn

Node nào hiện thực hoá được trong Unity thì có thêm mục `## 🎮 Unity`: component nào,
đặt ở đâu, code C# chạy được, bẫy riêng của Unity, và cách kiểm chứng.

Trong `graph.json` nó nằm ở trường `node.unity`. `KNOWLEDGE_INDEX.md` đánh dấu 🎮 cho node có mục này.

Nhánh `content/09-unity/` (id `unity`) là nhánh lấy Unity làm trục: mỗi node là một mảng (vật lý, animation, UI, shader, tối ưu…) với kinh nghiệm thực chiến, bẫy và checklist. Node trong nhánh đó **không có** mục 🎮 riêng vì toàn thân bài đã là Unity; thay vào đó mỗi node có mục `## 💻 Code` (trường `node.code`, tab **Code** trên web): một script demo hoàn chỉnh chạy được và sơ đồ thiết lập Inspector. Cần code khởi điểm cho một mảng Unity thì lấy từ đó.

Khi người dùng làm việc với Unity: **đọc node tương ứng trong `09-unity/` rồi đọc mục 🎮 của node kỹ thuật liên quan trước khi viết code**, và tôn trọng
phần "Bẫy Unity cụ thể" — đó là những lỗi chỉ lộ ra trong Unity mà không lộ ra khi
đọc code. Node thuần lý thuyết không có mục này, đừng bịa ra.

## Đa ngữ

Kho viết gốc bằng **tiếng Việt**. Bản dịch nằm ở file song song `<tên>.en.md` cùng thư mục.

Trong `graph.json`, bản dịch nằm ở `node.i18n.en` (gồm title, summary, body, aiPrompt, unity).
Các trường ở cấp cao nhất (`node.body`, `node.title`…) **luôn là bản gốc tiếng Việt**.
`KNOWLEDGE_INDEX.md` đánh dấu 🇬🇧 cho node đã có bản dịch.

Khi được nhờ dịch: chỉ tạo file `.en.md` với frontmatter `title` + `summary`;
mọi metadata khác chỉ tồn tại ở file gốc. Quy tắc đầy đủ ở `content/_SCHEMA.md`.

**Đừng dịch bằng cách sửa file gốc.** Bản gốc tiếng Việt là nguồn chân lý.

## Cách điều hướng

1. **`KNOWLEDGE_INDEX.md`** — mục lục phẳng, tự sinh. Liệt kê mọi node kèm id, summary, đường dẫn file. Đọc file này để biết có gì, rồi chỉ mở những file thật sự cần.
2. **`content/**/*.md`** — nội dung chi tiết. Mỗi file là một node.
3. **`public/data/graph.json`** — toàn bộ kho dưới dạng JSON có cấu trúc (nodes, quan hệ cha-con, liên kết ngang, tags). Dùng khi cần xử lý theo chương trình.

Cú pháp `[[node-id]]` trong nội dung là liên kết tới node khác. Ví dụ `[[behavior-tree]]` → `content/04-game-ai/behavior-tree.md`.

## Bản đồ nhanh các nhánh

| Id nhánh | Nội dung | Mở khi cần |
|---|---|---|
| `foundations` | Core loop, động lực người chơi, MDA, game feel, design pillars | Thiết kế ý tưởng, quyết định hướng đi |
| `systems` | Kinh tế, tiến trình, chiến đấu, cân bằng toán, độ khó | Xây hệ thống gameplay, cân bằng số |
| `content-design` | Level, procgen, nhịp độ, narrative, onboarding | Tạo nội dung, màn chơi |
| `presentation` | Art direction, animation, UI, HUD, UX flow, trợ năng, âm thanh | Làm giao diện, hiệu ứng, âm thanh |
| `game-ai` | FSM, Behavior Tree, GOAP, Utility AI, pathfinding, AI Director, LLM-NPC | Viết AI cho NPC/enemy |
| `ai-assisted-dev` | Quy trình làm game với AI, GDD cho AI, prompt pattern, guardrails | **Đọc khi làm việc trong kho này** |
| `production` | Kiến trúc, data-driven, playtest metrics, hiệu năng | Viết code, tổ chức dự án |
| `csharp` | Ngôn ngữ C#: value type/reference type, OOP và interface, collection, LINQ, delegate/event, generic và AOT, bộ nhớ, async/await, đa luồng, exception và null giả của Unity, C# 9, bộ đề phỏng vấn | **Viết code C# hoặc đi phỏng vấn** — phần ngôn ngữ nằm dưới engine, tách khỏi `unity` là phần engine |
| `unity` | Kinh nghiệm thực chiến Unity: vòng đời game, pattern, vật lý, animation, input, camera, UI, audio, VFX, shader, ánh sáng, tối ưu, build, multiplayer, editor tools | **Viết code Unity** — đọc node tương ứng trước khi sinh code |
| `backend-go` | Backend Go & database: API stateless, room server, Postgres/Redis, dữ liệu kinh tế, idempotency | **Làm phần chạy trên máy chủ** — tài khoản, IAP, bảng xếp hạng, phòng chơi chung |
| `cocos-creator` | Cocos Creator 3.x: chọn engine theo nơi phát hành, bản đồ khái niệm Unity → Cocos, UI đa tỉ lệ, draw call, hạn mức gói mini game, hot update | **Làm game H5 / mini game** — đọc trước khi sinh code Cocos, vì AI hay trả về API 2.x đã chết |
| `project` | Dựng một dự án client–server từ đầu tới phát hành: chốt phạm vi, chia ranh giới hai phía, tuyến xuyên suốt một phiên chơi, Master User, hợp đồng message, migration, mốc bàn giao, soft launch, kể lại dự án khi phỏng vấn. Có **cụm con `screens`**: Home, gacha, shop và IAP, nhiệm vụ, hộp quà, piggy bank, túi đồ, kết quả trận, bảng xếp hạng | **Ghép mọi thứ lại thành một dự án** — đọc khi cần thứ tự làm việc, không phải kiến thức theo chủ đề. Cần làm một màn hình cụ thể thì vào cụm `screens`, mỗi node theo khuôn mẫu tám ô |
| `team-lead` | Làm team lead một đội game 5–15 người: 30 ngày đầu, ước lượng và lịch, giao việc và review, 1:1 và kèm cặp, báo cáo lên, trượt tiến độ và crunch | **Phụ trách người chứ không chỉ phụ trách code** — đọc khi câu hỏi là "chia việc, ước lượng, báo cáo, xử lý trượt mốc thế nào" |
| `blueprints` | GDD dự án thật + template | **Thực thi yêu cầu của người dùng** |

**Lưu ý phân biệt:** `game-ai` là AI *trong* game (NPC thông minh). `ai-assisted-dev` là dùng AI để *làm ra* game. Đừng lẫn hai nhánh này.

**Nhánh có mindmap riêng:** trong bảng trên là `csharp`, `unity`, `cocos-creator`, `backend-go`, `project`, `team-lead` — chúng khai `map: true` nên trên web chúng được vẽ thành bản đồ tách rời, không nằm chung bản đồ kiến thức thiết kế (thanh chọn bản đồ ở góc trên). Trong dữ liệu thì **không có gì đổi** — chúng vẫn là con của gốc trong `graph.json` và `KNOWLEDGE_INDEX.md` (đánh dấu 🗺), lộ trình đọc vẫn chạy xuyên suốt cả kho.

## Quy tắc khi làm việc trong kho này

**Markdown trong `content/` là nguồn chân lý duy nhất.**
`public/data/graph.json` và `KNOWLEDGE_INDEX.md` do `scripts/build-graph.mjs` sinh ra. **Không sửa tay hai file đó** — mọi thay đổi sẽ mất ở lần build kế tiếp.

**Thêm node mới:** tạo file `.md` trong thư mục nhánh phù hợp, khai frontmatter tối thiểu (`title`, `summary`), rồi chạy `npm run graph`. Cây node suy ra từ cây thư mục — không cần khai báo ở đâu khác. Quy ước đầy đủ ở `content/_SCHEMA.md`.

**Sửa node:** sửa trực tiếp file markdown. Giữ nguyên `id` trong frontmatter nếu có node khác đang tham chiếu tới nó.

**Kiểm tra sau khi sửa:**
```bash
npm run check
```
Báo lỗi trùng id, `parent`/`related` trỏ sai, `[[wiki-link]]` gãy, chu trình trong cây.

**Không tự ý:** đổi cấu trúc nhánh, đổi `id` của node đã tồn tại, xoá node — hãy hỏi người dùng trước.

## Khi được nhờ làm game

Thứ tự làm việc:

1. Đọc `content/07-blueprints/` — tìm GDD của dự án. Nếu chưa có, đề nghị người dùng điền `content/07-blueprints/gdd-template.md`.
2. Trong GDD, ba mục là **ràng buộc cứng**:
   - **Design Pillars** — mâu thuẫn thì từ chối và nói rõ pillar nào bị vi phạm.
   - **Bất biến (INV-xx)** — không vi phạm nếu chưa hỏi.
   - **Không thuộc phạm vi** — đừng thêm, kể cả khi thể loại đó "thường có".
3. Tra nhánh kiến thức liên quan để chọn kỹ thuật phù hợp (ví dụ: cần AI cho enemy → đọc `content/04-game-ai/index.md` để chọn giữa FSM / BT / GOAP / Utility AI).
4. Tuân thủ nguyên tắc ở `content/05-ai-assisted-dev/agent-guardrails.md`.

## Nếu kho chưa có câu trả lời

Nhiều node đang ở trạng thái `stub` — mới có khung, chưa viết sâu. `KNOWLEDGE_INDEX.md` đánh dấu rõ chúng.

Gặp stub liên quan tới việc đang làm: nói cho người dùng biết node đó chưa đầy đủ, và đề nghị bổ sung. Đừng im lặng bịa ra nội dung rồi trình bày như thể nó đã có trong kho.
