---
id: coding-agents
title: Làm dự án với coding agent
summary: Claude Code, Codex, Cursor khác nhau ở quyền hạn và độ dài vòng lặp chứ không phải ở model — thiết lập repo một lần, giao một nhiệm vụ, review diff agent viết, và chạy nhiều agent song song mà không giẫm chân nhau.
status: deep
read: 105
level: intermediate
order: 15
tags: [ai-dev, tooling, workflow, agent, practical]
related: [ai-tooling, ai-workflow, agent-guardrails, context-engineering, knowledge-base-for-agents]
---

Ba công cụ được nhắc nhiều nhất — **Cursor**, **Claude Code**, **Codex** — thường chạy trên cùng vài model. Khác biệt quyết định không nằm ở model, mà ở hai thứ:

- **Quyền hạn** — nó được chạy lệnh gì, sửa file nào, có tự commit không.
- **Độ dài vòng lặp** — bao lâu thì tới lượt bạn nhìn kết quả: vài giây, vài phút, hay nửa tiếng sau khi CI chạy xong.

Chọn sai hình thái là nguồn thất vọng phổ biến hơn chọn sai model. Giao một refactor 30 file cho ô chat trong editor thì mệt; giao một lần đổi tên biến cho agent chạy nền hai mươi phút thì phí.

## Ba hình thái, ba loại việc

| Hình thái | Ví dụ | Nó thấy gì | Vòng lặp | Hợp với |
|---|---|---|---|---|
| **Gợi ý trong editor** | Cursor tab / inline chat, Copilot | File đang mở + vài file gần | Giây | Viết trong một file, đổi tên, sinh test lặp lại, điền boilerplate |
| **Agent trong terminal** | Claude Code, Codex CLI | Cả repo, **chạy được lệnh**, đọc được lỗi compile | Phút | Nhiệm vụ chạm nhiều file, có cổng kiểm chạy được, refactor kiểm chứng được |
| **Agent chạy nền** | Agent tự mở PR, Codex trên cloud | Repo tại một commit, CI | Chục phút → giờ | Việc định nghĩa rõ và **CI kiểm được**: sửa lint, nâng version, port một mẫu qua 20 file |

Câu hỏi để chọn chỉ có một: **kết quả việc này kiểm chứng bằng gì?**

- Mắt bạn, ngay lúc gõ → gợi ý trong editor.
- Một lệnh chạy được (`dotnet build`, `go test`, `npm run check`) → agent terminal.
- CI xanh → agent chạy nền.

Việc **không** kiểm chứng được bằng ba thứ trên (cảm giác điều khiển, bố cục màn chơi, "có vui không") thì không giao cho hình thái nào cả — xem [[ai-limits]].

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Vòng đời một nhiệm vụ giao cho coding agent: đầu bài, kế hoạch, cổng người duyệt, agent viết code, cổng máy chạy lệnh kiểm, bạn đọc diff, commit; hai nhánh quay lui khi cổng máy đỏ hoặc khi diff lệch thiết kế">
  <defs>
    <marker id="ca-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#6ea8fe"/>
    </marker>
    <marker id="ca-ar-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#ff8787"/>
    </marker>
  </defs>
  <text x="330" y="18" text-anchor="middle" class="fig-muted" font-size="11">Hai cổng: cổng máy gác cú pháp, cổng người gác thiết kế</text>
  <rect x="14" y="40" width="112" height="52" rx="9" class="fig-box"/>
  <text x="70" y="62" text-anchor="middle" class="fig-label" font-size="12">Đầu bài</text>
  <text x="70" y="80" text-anchor="middle" class="fig-muted" font-size="10">file · lệnh kiểm · cấm</text>
  <rect x="154" y="40" width="112" height="52" rx="9" class="fig-box"/>
  <text x="210" y="62" text-anchor="middle" class="fig-label" font-size="12">Kế hoạch</text>
  <text x="210" y="80" text-anchor="middle" class="fig-muted" font-size="10">agent viết, chưa code</text>
  <rect x="294" y="40" width="112" height="52" rx="9" class="fig-box" stroke="#ffd43b"/>
  <text x="350" y="62" text-anchor="middle" class="fig-label" font-size="12">Cổng người</text>
  <text x="350" y="80" text-anchor="middle" class="fig-muted" font-size="10">bạn duyệt kế hoạch</text>
  <rect x="434" y="40" width="112" height="52" rx="9" class="fig-box"/>
  <text x="490" y="62" text-anchor="middle" class="fig-label" font-size="12">Agent viết</text>
  <text x="490" y="80" text-anchor="middle" class="fig-muted" font-size="10">code + test</text>
  <rect x="434" y="148" width="112" height="52" rx="9" class="fig-box" stroke="#51cf9b"/>
  <text x="490" y="170" text-anchor="middle" class="fig-label" font-size="12">Cổng máy</text>
  <text x="490" y="188" text-anchor="middle" class="fig-muted" font-size="10">build · test · lint</text>
  <rect x="294" y="148" width="112" height="52" rx="9" class="fig-box" stroke="#ffd43b"/>
  <text x="350" y="170" text-anchor="middle" class="fig-label" font-size="12">Bạn đọc diff</text>
  <text x="350" y="188" text-anchor="middle" class="fig-muted" font-size="10">theo đường biên</text>
  <rect x="154" y="148" width="112" height="52" rx="9" class="fig-box"/>
  <text x="210" y="170" text-anchor="middle" class="fig-label" font-size="12">Commit</text>
  <text x="210" y="188" text-anchor="middle" class="fig-muted" font-size="10">một nhiệm vụ = một commit</text>
  <line x1="126" y1="66" x2="150" y2="66" class="fig-line" marker-end="url(#ca-ar)"/>
  <line x1="266" y1="66" x2="290" y2="66" class="fig-line" marker-end="url(#ca-ar)"/>
  <line x1="406" y1="66" x2="430" y2="66" class="fig-line" marker-end="url(#ca-ar)"/>
  <line x1="490" y1="92" x2="490" y2="144" class="fig-line" marker-end="url(#ca-ar)"/>
  <line x1="430" y1="174" x2="410" y2="174" class="fig-line" marker-end="url(#ca-ar)"/>
  <line x1="290" y1="174" x2="270" y2="174" class="fig-line" marker-end="url(#ca-ar)"/>
  <path d="M546 174 C 600 174 600 66 550 66" class="fig-line" stroke="#ff8787" fill="none" stroke-dasharray="4 3" marker-end="url(#ca-ar-red)"/>
  <text x="612" y="112" text-anchor="middle" class="fig-muted" font-size="10">đỏ → agent</text>
  <text x="612" y="126" text-anchor="middle" class="fig-muted" font-size="10">tự sửa, có trần</text>
  <path d="M350 144 C 350 116 470 116 486 96" class="fig-line" stroke="#ff8787" fill="none" stroke-dasharray="4 3" marker-end="url(#ca-ar-red)"/>
  <text x="404" y="132" text-anchor="middle" class="fig-muted" font-size="10">lệch thiết kế → mô tả lại, đừng sửa vặt</text>
</svg>
<figcaption>Cổng máy (xanh) agent tự đi qua nhiều vòng cũng được, nhưng phải có trần. Cổng người (vàng) không uỷ quyền được: một ở kế hoạch, một ở diff.</figcaption>
</figure>

## Thiết lập repo — làm một lần, dùng mọi phiên

Năm thứ dưới đây quyết định chất lượng đầu ra nhiều hơn việc bạn chọn công cụ nào.

**1. Một file luật, không phải ba.** Ba công cụ đọc ba tên khác nhau: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`. Đừng chép ba bản — chúng sẽ lệch nhau sau hai tuần và hai agent làm hai kiểu. Viết **một** bản làm nguồn chân lý, các bản còn lại chỉ trỏ tới nó. Chính kho này làm vậy: `AGENTS.md` là luật, `CLAUDE.md` chỉ import.

**2. Một lệnh kiểm duy nhất.** Agent cần một lệnh **thoát khác 0 khi sai** để tự biết mình hỏng. Ba lệnh rời rạc ("nhớ chạy test rồi lint rồi build") sẽ bị bỏ sót đúng lúc quan trọng.

```bash
npm run check     # kho này
make verify       # hoặc: go vet ./... && go test ./... && golangci-lint run
```

**3. Danh sách "không được chạm", viết thành câu lệnh** chứ không phải lời dặn miệng:

```markdown
## Không được sửa
- `*.unity`, `*.prefab`, `*.meta` — cần đổi scene thì mô tả các bước cho người làm
- `Assets/Plugins/**` — SDK bên thứ ba, nâng version là quyết định của người
- `proto/*.proto` — hợp đồng client-server, chỉ đổi khi có yêu cầu thẳng
- file tự sinh: `public/data/graph.json`, `**/*.pb.go`
```

**4. Mục lục để agent khỏi quét cả repo.** Một file liệt kê "có gì, ở đâu" rẻ hơn nhiều so với việc agent mở 200 file để đoán — xem [[knowledge-base-for-agents]] và [[context-engineering]].

**5. Quyền hạn: mở sẵn lệnh đọc, chặn lệnh đi ra ngoài.** Cho phép không cần hỏi: `ls`, `grep`, `git status`, `git diff`, lệnh build và test. Luôn hỏi: `git push`, `rm -rf`, cài package, đụng thư mục ngoài repo. Agent phải hỏi mười lăm lần mỗi phiên thì sớm muộn bạn cũng bấm "cho phép tất cả" — và đó là lúc tai nạn xảy ra.

## Khối luật cho dự án Unity + Go

Đây là phần agent đoán sai nhiều nhất, vì nó **không đọc được** từ code:

```markdown
## Sự thật về dự án (agent không tự thấy được)

- Unity 6000.0.32f1 · URP 17 · Input System mới (KHÔNG có Input Manager cũ)
- Go 1.23 · Postgres 16 · Redis 7 · proto3, sinh code bằng buf
- Assembly: Game.Core (không tham chiếu UnityEngine) / Game.Unity / Game.Editor
- Server là nguồn chân lý cho tiền tệ và vật phẩm; client chỉ hiển thị
- Master data sinh từ Google Sheet, KHÔNG sửa tay file JSON trong Assets/Data

## Cách làm việc

- Nhiệm vụ lớn: trình bày kế hoạch trước, chờ duyệt, rồi mới viết code
- Một nhiệm vụ = một commit, chạy được sau khi xong
- Chạy `make verify` trước khi báo xong; dán output thật, không tóm tắt
- Gặp việc ngoài phạm vi: GHI CHÚ, không tự sửa
- Cần vi phạm một bất biến: DỪNG và hỏi
```

Thiếu khối thứ nhất, agent sẽ viết `Input.GetKey` (API cũ) hoặc sinh code cộng tiền ở client — code trông hoàn toàn hợp lý và sai về kiến trúc. Xem thêm [[agent-guardrails]] và [[master-data]].

## Giao một nhiệm vụ

Đầu bài tốt có đúng năm phần, viết một lần rồi dùng cho mọi công cụ:

| Phần | Ví dụ |
|---|---|
| **Mục tiêu**, một câu kiểm chứng được | "Thêm cooldown cho skill, đọc từ ScriptableObject, không hardcode" |
| **File được phép sửa** | `Assets/Scripts/Combat/**`, `Assets/Data/Skills/**` |
| **Lệnh kiểm** | `make verify`, kèm mô tả cách tôi thử trong Editor |
| **Cấm** | "Không đụng prefab. Không thêm package. Không đổi interface `ISkill`" |
| **Định dạng trả về** | "Kế hoạch trước. Sau khi code: diff + output `make verify` dán nguyên" |

Phần cuối hay bị bỏ nhất và đáng giá nhất: nó biến câu *"tôi đã kiểm tra, mọi thứ hoạt động tốt"* — một câu vô nghĩa — thành output lệnh mà bạn đọc được.

## Review diff của agent

Đừng đọc diff theo dòng. Agent viết code đúng cú pháp gần như luôn luôn; chỗ nó sai là **đường biên**. Ba câu hỏi, theo thứ tự:

1. **Diff có lan ra ngoài phạm vi không?** File lạ xuất hiện, hàm không liên quan bị "dọn dẹp", `using`/`import` mới — cờ đỏ trước cả khi đọc nội dung.
2. **Chỗ nào nó quyết định thay tôi?** Tên file mới, dependency mới, đổi chữ ký hàm công khai, đổi schema, đổi cấu hình build. Mỗi chỗ như thế là một quyết định thiết kế bạn đang **im lặng phê duyệt**.
3. **Phần nào compile và test không chứng minh được?** Xử lý lỗi, nhánh hiếm, hằng số cân bằng, thứ tự thực thi. Đọc kỹ đúng phần đó, lướt phần còn lại.

Câu kiểm cuối cùng, khó chịu nhưng đáng: **bạn có sửa được đoạn này sáu tháng nữa mà không cần agent không?** Nếu không, đó là dạng nợ kỹ thuật nặng nhất — xem [[ai-limits]].

## Nhiều agent song song mà không giẫm chân

Hai agent cùng sửa một file là hai nguồn thay đổi không biết nhau. Chia theo **quyền sở hữu**, không chia theo "ai đang rảnh":

```bash
git worktree add ../game-shop     feature/shop        # agent A: client Unity
git worktree add ../game-ranking  feature/leaderboard # agent B: server Go
```

Ba luật:

- **Một worktree = một ranh giới sở hữu** (client / server / tool), không phải "một tính năng". Tính năng cắt ngang hai phía thì làm tuần tự.
- **File hợp đồng chỉ một bên được sửa** — `.proto`, schema DB, bảng mã lỗi. Xem [[project-contract]].
- **`git status` trước khi bắt đầu.** Cây bẩn nghĩa là có ai đó (người hoặc agent) đang làm dở: đọc diff trước, đừng đè lên.

Phía Go còn một phép thử rẻ mà phía Unity không có: cho agent chạy `docker compose up` rồi gọi thật endpoint vừa viết — xem [[go-docker]]. Vì server kiểm chứng được bằng lệnh, tỉ lệ giao khoán thành công ở đó cao hơn hẳn.

## Việc vẫn nên tự làm

| Việc | Vì sao không giao |
|---|---|
| Gán tham chiếu Inspector, dựng prefab, sắp scene | Không kiểm chứng được bằng compile; agent sửa YAML là hỏng |
| Tinh chỉnh game feel (cong nhảy, hitstop, rung màn hình) | Phải cảm, không phải tính |
| Chọn ranh giới client–server | Sai chỗ này thì tháng thứ tư là viết lại, không phải sửa |
| Đặt tên khái niệm miền | Tên agent đặt thường đúng ngữ pháp và sai ngữ nghĩa dự án |
| Tối ưu cuối dựa trên profiler máy thật | Agent không có thiết bị và không đọc được frame time |

## Năm bẫy đã gặp thật

- **Sửa test cho xanh thay vì sửa code.** Chống bằng một câu trong luật: *"Không sửa test để làm nó pass. Test sai thì báo, đừng chữa."*
- **Tự thêm dependency** để giải một bài toán hai mươi dòng. Chống bằng luật "không thêm package khi chưa hỏi", và đọc kỹ diff của `.csproj` / `go.mod` / `package.json`.
- **Dùng API không tồn tại** ở đúng phiên bản engine bạn đang chạy. Luôn ghi version chính xác trong file luật — đây là lỗi số một khi làm Unity và Cocos.
- **"Tôi đã kiểm tra kỹ"** mà chẳng chạy gì. Bắt dán output lệnh; không có output nghĩa là chưa chạy.
- **Phiên kéo dài cả buổi**, agent quên luật ban đầu và bắt đầu mâu thuẫn với chính nó. Đóng phiên theo nhiệm vụ, không theo ngày làm việc — [[context-engineering]].

## 🤖 Prompt cho AI

**Dùng AI thế nào khi chạy một nhiệm vụ qua coding agent**

Agent làm tốt nhất khi có **một mục tiêu, một bộ file, một lệnh kiểm**. Việc của bạn không phải viết prompt hoa mỹ hơn mà là **thu hẹp bài toán tới mức kiểm chứng được**. Bốn chế độ, đừng trộn trong một lượt:

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| **Khảo sát** | Chưa biết code nằm đâu | "Chỉ đọc, không sửa. Liệt kê file liên quan tới X và vai trò từng file." |
| **Kế hoạch** | Nhiệm vụ chạm hơn hai file | "Trình bày kế hoạch: file nào, hàm nào, API nào. CHƯA viết code." |
| **Thực thi** | Kế hoạch đã duyệt | "Làm đúng kế hoạch trên. Xong thì chạy `<lệnh kiểm>` và dán output." |
| **Review** | Diff đã có | "Đóng vai người review khó tính. Chỉ ra chỗ lệch phạm vi và quyết định thiết kế ngầm." |

Chế độ Review nên giao cho **phiên khác hoặc công cụ khác** với phiên vừa viết code: agent vừa viết xong có xu hướng bảo vệ lựa chọn của chính nó.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Phiên bản engine/ngôn ngữ **chính xác** (Unity 6000.0.32f1, Go 1.23) — nguồn lỗi "API không tồn tại" số một.
- Danh sách file được phép sửa, và danh sách cấm chạm.
- Lệnh kiểm chứng cụ thể, kèm yêu cầu dán output thật.
- Nhiệm vụ này được phép thêm dependency không (mặc định: không).
- Ai là nguồn chân lý cho dữ liệu bị chạm tới (server hay client, sheet hay code).

**Mẫu prompt**

```
Ngữ cảnh: Unity 6000.0.32f1, URP 17, Input System mới. Assembly Game.Core
không được tham chiếu UnityEngine.

Nhiệm vụ: thêm cooldown cho skill. Thời gian đọc từ SkillConfig
(ScriptableObject), KHÔNG hardcode. UI hiện vòng tròn đếm ngược.

Được sửa:  Assets/Scripts/Combat/**, Assets/Scripts/UI/Skill/**
Được tạo:  tối đa 2 file mới trong hai thư mục trên
CẤM:       sửa *.prefab, *.unity; thêm package; đổi interface ISkill

Trình tự:
1. Kế hoạch trước (file, hàm, API) — DỪNG, chờ tôi duyệt.
2. Sau khi duyệt: viết code + unit test cho phần tính cooldown trong Game.Core.
3. Chạy `make verify`, DÁN NGUYÊN output. Đỏ thì sửa, tối đa 3 vòng;
   quá 3 vòng thì dừng và mô tả chỗ kẹt.
4. Liệt kê việc tôi phải tự làm trong Editor (gán ref, kéo prefab).
```

**Bẫy thường gặp:** agent báo "đã kiểm tra, hoạt động tốt" trong khi nó không chạy được game — compile qua không có nghĩa là chạy đúng. Với Unity, phần kiểm chứng thật luôn nằm ở lần bạn bấm Play, nên nhiệm vụ phải nhỏ tới mức bạn sẵn sàng vào Editor thử sau **mỗi** lần. Bẫy thứ hai: nhận lời tóm tắt diff thay vì đọc diff — agent tóm tắt phần nó cho là quan trọng, không phải phần nó quyết định thay bạn.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Anh dùng AI thế nào trong công việc hằng ngày?**
  → Tôi chia theo cách kiểm chứng: gợi ý trong editor cho việc mắt tôi kiểm được ngay, agent trong terminal cho nhiệm vụ có lệnh build/test làm cổng, agent chạy nền cho việc CI kiểm được. Việc không kiểm chứng được bằng ba thứ đó — game feel, bố cục màn chơi — tôi tự làm. Ranh giới đó quan trọng hơn chuyện dùng công cụ nào.
- `Junior` **Cursor, Claude Code, Codex khác nhau ở đâu?**
  → Không khác nhiều ở model, khác ở quyền hạn và độ dài vòng lặp: một cái sửa file đang mở trong vài giây, một cái chạy được lệnh trong repo và đọc lỗi compile, một cái chạy nền rồi mở PR. Tôi chọn theo câu hỏi "kết quả việc này kiểm chứng bằng gì", chứ không theo công cụ nào đang được khen.
- `Mid` **Làm sao anh biết code AI viết là đúng?**
  → Hai cổng. Cổng máy là một lệnh duy nhất thoát khác 0 khi sai, và tôi bắt agent dán output thật chứ không nhận câu "đã kiểm tra". Cổng người là đọc diff theo đường biên: có lan ra ngoài phạm vi không, chỗ nào nó quyết định thay tôi, phần nào compile không chứng minh được. Phép thử cuối là tôi có sửa được đoạn đó sáu tháng sau mà không cần agent không.
- `Mid` **Agent sửa test cho pass thì xử lý sao?**
  → Đó là lỗi tôi gặp thật nên nó nằm thẳng trong file luật: không sửa test để làm nó xanh, test sai thì báo chứ không chữa. Khi review tôi nhìn diff của file test trước diff của code — một PR vừa sửa code vừa sửa kỳ vọng của test là chỗ đầu tiên phải đọc kỹ.
- `Mid` **Chạy nhiều agent cùng lúc thì quản lý ra sao?**
  → Chia theo quyền sở hữu chứ không theo ai rảnh: mỗi git worktree một ranh giới — client, server, tool — và file hợp đồng như `.proto` hay schema thì chỉ một bên được sửa. Tính năng cắt ngang hai phía thì tôi làm tuần tự, vì chi phí gỡ xung đột trên hợp đồng lớn hơn thời gian tiết kiệm được.
- `Senior` **Việc gì anh dứt khoát không giao cho agent, vì sao?**
  → Những việc mà compile và test không phải giác quan đủ: gán tham chiếu Inspector và dựng prefab, tinh chỉnh cảm giác điều khiển, chọn ranh giới client–server, đặt tên khái niệm miền. Ranh giới client–server là ví dụ đắt nhất — chọn sai thì tới tháng thứ tư không còn là sửa mà là viết lại.
- `Senior` **Anh thiết lập repo thế nào để agent làm việc được?**
  → Một file luật duy nhất ở gốc và các công cụ khác chỉ trỏ tới nó, vì ba bản chép tay sẽ lệch sau hai tuần. Thêm một lệnh kiểm duy nhất, danh sách "không được chạm" viết thành câu lệnh, một mục lục để agent khỏi quét cả repo, và quyền hạn mở sẵn cho lệnh đọc nhưng chặn lệnh đi ra ngoài. Nếu agent phải hỏi mười lăm lần một phiên thì người ta sẽ bấm "cho phép tất cả", và đó mới là lúc tai nạn xảy ra.
- `Senior` **Dùng agent có làm chất lượng code của team giảm không?**
  → Nó khuếch đại quy trình sẵn có. Team có cổng kiểm và review đường biên thì agent làm nhanh hơn mà chất lượng giữ nguyên; team review qua loa thì agent tạo nợ nhanh hơn người. Chỉ số tôi nhìn không phải số dòng sinh ra mà là tỉ lệ diff bị người sửa lại sau khi merge, và số lần agent chạm vùng cấm.
- `Senior` **Nếu công ty cấm gửi mã nguồn ra dịch vụ bên ngoài thì anh làm gì?**
  → Tôi tách hai loại việc. Việc cần ngữ cảnh mã nguồn thật thì chỉ dùng phương án đã được duyệt — model chạy trong hạ tầng công ty, hoặc không dùng AI. Việc không cần mã thật thì vẫn dùng được bằng cách mô tả bài toán ở dạng trừu tượng, không kèm tên nghiệp vụ, khoá hay dữ liệu người chơi. Điểm mấu chốt là hỏi chính sách trước khi dán, không phải xin lỗi sau.

**Khung trả lời 60 giây** — "Anh làm việc với coding agent như thế nào?"

> Tôi coi agent như một người mới vào việc rất nhanh tay nhưng không có trí nhớ dài hạn: nó cần luật viết sẵn, ranh giới rõ, và một cách tự biết mình sai. Nên tôi thiết lập repo một lần — một file luật ở gốc, một lệnh kiểm duy nhất thoát khác 0 khi hỏng, danh sách file nó không được chạm, và một mục lục để nó khỏi quét cả repo.
>
> Mỗi nhiệm vụ đi qua hai cổng. Cổng máy là lệnh kiểm; agent tự đi qua nhiều vòng cũng được nhưng có trần, tôi để ba vòng rồi bắt nó dừng và mô tả chỗ kẹt. Cổng người thì tôi giữ hai điểm không uỷ quyền: duyệt kế hoạch trước khi nó viết code, và đọc diff theo đường biên — lan phạm vi, quyết định thiết kế ngầm, phần mà compile không chứng minh được.
>
> Việc nào compile và test không kiểm được thì tôi không giao: prefab, game feel, ranh giới client–server. Kết quả là nhanh hơn hẳn ở phần cơ học mà vẫn giữ được thứ quan trọng nhất — tôi hiểu code của chính dự án mình.

**Họ sẽ đào tiếp**

- *"Agent nói đã kiểm tra rồi thì sao?"* → Không nhận lời khẳng định, chỉ nhận output lệnh dán nguyên. Không có output nghĩa là chưa chạy — và với Unity thì compile qua vẫn chưa chứng minh được gì, phần kiểm chứng thật nằm ở lần bấm Play.
- *"Vì sao không để agent tự commit và push?"* → Vì cổng người nằm ở diff. Agent làm trên nhánh hoặc worktree riêng thì được, nhưng thứ vào nhánh chính phải qua một lần đọc của người: chỗ nó sai là đường biên, mà đường biên thì không test nào bắt.
- *"Ba công cụ cùng lúc trên một repo?"* → Chọn một cái làm chính; cái thứ hai chỉ thêm khi vai của nó khác hẳn, ví dụ một cái viết và một cái chỉ review. Ba nguồn sửa đổi không biết nhau thì thời gian gỡ xung đột ăn hết phần tiết kiệm được.
- *"Làm sao đo được nó giúp thật không?"* → Chi phí và thời gian **mỗi nhiệm vụ hoàn thành**, tỉ lệ xong trong một vòng, phần diff bị người sửa lại. Chưa đo thì nói thẳng là chưa đo và nêu cách sẽ đo — xem [[ai-eval]].

**Cờ đỏ**

- Kể tên công cụ và model mà không nói được ranh giới việc nào không giao.
- "Tôi đọc hết code AI viết" — nghe tận tâm nhưng không khả thi; người review giỏi nói được họ đọc **gì trước**.
- Không có cổng kiểm chạy bằng một lệnh, nhưng vẫn khẳng định chất lượng ổn.
- Để agent commit thẳng vào nhánh chính vì "CI sẽ bắt".
- Dùng agent viết phần mình không hiểu, rồi sở hữu luôn phần đó trong dự án.

**Số / ví dụ nên thuộc**

- Ba hình thái và cách kiểm chứng tương ứng: **mắt bạn → một lệnh → CI xanh**.
- Hai cổng mỗi nhiệm vụ: **cổng máy (lệnh kiểm) + cổng người (kế hoạch, diff)**.
- Ba câu hỏi khi đọc diff: **lan phạm vi? quyết định thay tôi? compile không chứng minh được?**
- Trần vòng tự sửa: **3 vòng** rồi dừng và mô tả chỗ kẹt.
- Một worktree = một ranh giới sở hữu; file hợp đồng chỉ một bên được sửa.
