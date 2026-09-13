---
title: Quy trình làm game với AI
icon: 🔀
summary: Từ ý tưởng tới build chạy được — chia giai đoạn, chia nhỏ nhiệm vụ, và giữ quyền kiểm soát.
status: deep
read: 100
level: basic
order: 10
tags: [ai-dev, workflow, process]
related: [gdd-for-ai, agent-guardrails, prototyping]
---

## Bảy giai đoạn

**1. Thiết kế — bạn làm, không uỷ quyền.**
Chốt [[design-pillars]] và [[core-loop]]. Viết ra giấy. AI có thể phản biện, nhưng quyết định là của bạn. Đây là phần định nghĩa game của bạn *là của bạn*.

**2. Viết GDD.** Xem [[gdd-for-ai]]. Đây là khoản đầu tư sinh lời cao nhất trong toàn bộ dự án — một buổi chiều viết tài liệu tiết kiệm hàng tuần sửa code sai hướng.

**3. Dựng khung.** Nhờ agent tạo cấu trúc project, hệ thống cốt lõi, lớp dữ liệu. Chưa cần gameplay. Mục tiêu là có một thứ **chạy được và build được**, dù chỉ hiện màn hình trống.

**4. Vertical slice.** Một màn chơi được, một kẻ địch, một vũ khí — nhưng **hoàn chỉnh, có juice**. Đây là lúc bạn kiểm chứng core loop có vui không. Nếu không vui, quay lại bước 1. Đừng đi tiếp.

**5. Nhân rộng theo chiều ngang.** Giờ mới thêm kẻ địch, vũ khí, màn chơi. Đây là lúc AI phát huy mạnh nhất — bạn đã có khuôn mẫu tốt, agent nhân bản theo.

**6. Cân bằng.** Mô phỏng + playtest. Xem [[balancing-math]] và [[playtesting-metrics]].

**7. Đánh bóng.** Game feel, UX, hiệu năng. Phần lớn là việc của bạn, không phải của AI.

Sai lầm phổ biến nhất là nhảy từ bước 2 sang bước 5 — thêm rất nhiều nội dung trước khi biết core loop có vui không.

## Chia nhỏ nhiệm vụ

Kích thước nhiệm vụ tốt: **một lần commit, kiểm chứng được, chạy được sau khi xong.**

Quá to:
> ❌ "Làm hệ thống chiến đấu."

Vừa:
> ✅ "Thêm `HealthComponent` với API `TakeDamage(amount, source)`, sự kiện `OnDamaged`/`OnDeath`, khoảng bất tử 0.5s sau khi trúng đòn. Kèm unit test. Chưa cần UI."

Sau mỗi nhiệm vụ: **chạy game, xem có đúng không, commit**. Đừng chồng 5 nhiệm vụ rồi mới kiểm tra — khi có lỗi bạn không biết nó đến từ đâu.

## Vòng lặp làm việc thực tế

```
1. Bạn:   mô tả nhiệm vụ + tham chiếu phần GDD liên quan
2. Agent: đề xuất cách làm            ← DỪNG, đọc kỹ ở đây
3. Bạn:   duyệt hoặc sửa hướng
4. Agent: viết code
5. Bạn:   chạy thử trong game thật
6. Bạn:   commit, hoặc mô tả lỗi cụ thể rồi quay lại 4
```

Bước 2 là bước tiết kiệm nhiều thời gian nhất và cũng hay bị bỏ qua nhất. Đọc kế hoạch mất 30 giây; đọc 300 dòng code sai hướng mất 20 phút.

Với nhiệm vụ lớn, yêu cầu rõ: *"trình bày kế hoạch trước, chưa viết code, chờ tôi duyệt."*

## Quản lý ngữ cảnh

Agent quên mọi thứ giữa các phiên. Hai chiến lược bù lại:

**Tài liệu là bộ nhớ dài hạn.** `CLAUDE.md` ở gốc repo + `design/` được đọc mỗi phiên. Mọi quyết định quan trọng phải nằm ở đó, không nằm trong lịch sử chat.

**Nhật ký quyết định.** Một file `design/decisions.md` ghi lại các lựa chọn và lý do:

```markdown
## 2026-09-11 — Không dùng ECS
Cân nhắc ECS cho hệ thống thực thể. Quyết định: KHÔNG.
Lý do: quy mô dự kiến < 200 thực thể đồng thời, OOP thường đủ,
ECS làm chậm việc thử nghiệm nhanh ở giai đoạn này.
Xem lại nếu: số thực thể vượt 500 hoặc FPS xuống dưới 50.
```

Không có file này, cứ vài phiên agent lại đề xuất ECS, và bạn lại phải giải thích lại.

## Điểm mù cần tự bù

Những chỗ AI thường sai mà không tự biết:

- **Tích hợp** — từng phần đúng, ghép lại hỏng. Luôn chạy thử thật.
- **Hiệu năng** — code sạch nhưng cấp phát trong vòng lặp, gây giật. Xem [[performance]].
- **Tương tác giữa các hệ thống** — thêm hệ thống mới làm hỏng cân bằng hệ thống cũ.
- **Đặc thù engine** — API cũ, mẫu lỗi thời. Model có tri thức cắt tại một thời điểm; engine thì cập nhật liên tục. Luôn nêu rõ phiên bản engine trong prompt.
- **"Có vui không"** — không bao giờ uỷ quyền được.

## Kiểm soát phiên bản

Commit **trước** mỗi nhiệm vụ lớn giao cho agent. Nếu kết quả tệ, `git reset` rẻ hơn nhiều so với gỡ rối thủ công.

Dùng branch riêng cho những thay đổi lớn mang tính thử nghiệm. Đặt tên commit cho biết phần nào do agent sinh ra — hữu ích khi truy vết bug về sau.

## 🤖 Prompt cho AI

**Dùng AI thế nào ở từng giai đoạn**

Bảy giai đoạn, và vai của AI đổi ở mỗi giai đoạn — đây là bảng tra nên dán lên tường:

| Giai đoạn | AI làm gì | Bạn làm gì |
|---|---|---|
| 1. Thiết kế | Phản biện ([[ai-for-design]]) | **Quyết định mọi thứ** |
| 2. Viết GDD | Phỏng vấn bạn ([[gdd-for-ai]]) | Trả lời bằng số cụ thể |
| 3. Dựng khung | Viết scaffolding, asmdef, test đầu tiên | Chốt ProjectSettings |
| 4. Vertical slice | Code hệ thống + juice có tham số | **Chỉnh số cho đã tay** |
| 5. Nhân rộng | Sinh biến thể theo khuôn đã duyệt | Duyệt khuôn trước |
| 6. Cân bằng | Mô phỏng ([[balancing-math]]) | Playtest, đọc phân bố |
| 7. Đánh bóng | Editor tool, validator | Cảm nhận, quyết định |

Điểm dễ sai: nhảy từ giai đoạn 2 sang 5. Nhân rộng nội dung trước khi biết core loop có vui không là cách tốn thời gian nhất, và AI làm việc đó rất nhanh — nên càng dễ rơi vào.

Vòng lặp làm việc tự nó là thứ cần viết thành prompt, đặc biệt bước "kế hoạch trước, code sau".

**Mẫu prompt cho một nhiệm vụ đơn lẻ**

```
NHIỆM VỤ: <một câu, phạm vi bằng một commit>

Tham chiếu: design/GDD.md mục <3.2 Stamina>

Bước 1 — KẾ HOẠCH (chưa viết code):
  - File nào tạo mới, file nào sửa
  - API công khai dự kiến
  - Rủi ro: cái gì có thể hỏng ở chỗ khác
  - Cách tôi kiểm chứng nhiệm vụ này đã xong
Dừng ở đây, chờ tôi duyệt.

Bước 2 — sau khi tôi duyệt: viết code, kèm test cho phần logic thuần.

Bước 3 — sau khi tôi chạy thử: chỉ sửa đúng lỗi tôi mô tả, không refactor kèm.
```

**Mẫu prompt cuối phiên — phát hiện trôi dạt**

```
Đọc lại design/GDD.md và so với code hiện tại.
Liệt kê những chỗ code đã LỆCH khỏi tài liệu, phân loại:
  (a) code đúng, tài liệu lỗi thời -> tôi sẽ sửa tài liệu
  (b) tài liệu đúng, code sai      -> cần sửa code
  (c) cả hai đều mơ hồ             -> cần tôi quyết định
Chưa sửa gì cả, chỉ liệt kê.
```

**Bẫy thường gặp:** bỏ qua bước kế hoạch. Đọc kế hoạch mất 30 giây; đọc 300 dòng code sai hướng mất 20 phút.

## 🎮 Unity

Trên Unity project, quy trình 7 giai đoạn có vài chỗ khác — chủ yếu vì **bạn phải vào Editor giữa mỗi bước**.

**Giai đoạn 3 (dựng khung) trong Unity**

Thứ tự có ý nghĩa:

```
1. Tạo project với template đúng (xem [[genre-conventions]])
2. Chốt ProjectSettings: Color Space, Fixed Timestep, Input System
3. Assembly Definition: Game.Core (noEngineReferences), Game.Unity, Game.Editor
4. Bootstrap scene + state máy cấp app (xem [[unity-game-loop]])
5. Một ScriptableObject config + một MonoBehaviour đọc nó
6. Một test EditMode chạy xanh
```

Bước 6 là mốc thật: khi có một test EditMode chạy, agent đã có cách **tự kiểm chứng** thay đổi của nó. Trước đó thì mọi thứ agent viết đều là niềm tin.

**Giai đoạn 4 (vertical slice) — điều Unity làm dễ hơn**

Một scene, một kẻ địch, một vũ khí, **có juice đầy đủ**. Unity mạnh ở đây: hitstop + screenshake + particle dựng trong một buổi. Xem [[game-feel]].

Đừng bỏ juice ở giai đoạn này vì "để sau" — vertical slice không có juice không trả lời được câu hỏi "core loop có vui không".

**Nhật ký quyết định — đặc biệt quan trọng với Unity**

```markdown
## 2026-09-11 — UGUI, không UI Toolkit
Cân nhắc: UI Toolkit (agent sửa được vì UXML/USS là text) vs UGUI.
Chọn: UGUI.
Lý do: cần world-space UI cho thanh máu trên đầu quái; UI Toolkit hạn chế
chỗ này. Chấp nhận việc agent không sửa được prefab UI.
Xem lại nếu: bỏ world-space UI, hoặc UI Toolkit hỗ trợ đủ.
```

Không có file này, cứ vài phiên agent lại đề xuất chuyển sang UI Toolkit.

**Commit trước khi giao việc lớn — với Unity thì bắt buộc**

Unity ghi vào rất nhiều file khi bạn bấm Play (Library/, .meta, scene). `git reset --hard` sau một nhiệm vụ tệ là cách duy nhất sạch. Nhớ `.gitignore` đúng cho Unity (Library/, Temp/, Logs/, obj/).

**Điểm mù riêng của Unity**

- **Agent không biết `[SerializeField]` đã gán chưa** → code đúng, chạy `NullReferenceException`. Luôn `[RequireComponent]` hoặc kiểm tra trong `Awake` và log rõ.
- **Agent viết API của phiên bản khác** → nêu phiên bản chính xác trong mọi prompt.
- **Agent không thấy collision matrix** → va chạm không xảy ra mà code trông đúng.

**Kiểm tra nhanh**
- Có ít nhất một test EditMode chạy xanh chưa?
- `design/decisions.md` có ghi các quyết định Unity chưa?
- `.gitignore` có Library/, Temp/, Logs/, obj/ chưa?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Bảy giai đoạn làm game với AI là gì?**
  → **Thiết kế** (mình làm, không uỷ quyền) → **viết GDD** → **dựng khung** (chạy được và build được, dù chỉ là màn hình trống) → **vertical slice** → **nhân rộng theo chiều ngang** → **cân bằng** → **đánh bóng**. Sai lầm phổ biến nhất là nhảy từ bước 2 sang bước 5: thêm rất nhiều nội dung **trước khi biết core loop có vui không**.
- `Junior` **Một nhiệm vụ giao cho agent nên to cỡ nào?**
  → **Một lần commit, kiểm chứng được, chạy được sau khi xong.** "Làm hệ thống chiến đấu" là quá to. Vừa là: "Thêm `HealthComponent` với API `TakeDamage(amount, source)`, sự kiện `OnDamaged`/`OnDeath`, khoảng bất tử 0,5 s sau khi trúng đòn, kèm unit test, chưa cần UI."
- `Junior` **Sau mỗi nhiệm vụ anh làm gì?**
  → **Chạy game, xem có đúng không, commit.** Đừng chồng năm nhiệm vụ rồi mới kiểm tra — khi có lỗi thì không biết nó đến từ đâu, và việc chia đôi để truy vết lúc đó tốn hơn nhiều so với kiểm từng bước. "Build được" không phải là "chạy đúng".
- `Mid` **Bước nào trong vòng lặp làm việc tiết kiệm nhiều thời gian nhất mà hay bị bỏ qua?**
  → **Đọc kế hoạch trước khi agent viết code.** Đọc kế hoạch mất 30 giây; đọc 300 dòng code sai hướng mất 20 phút. Với nhiệm vụ lớn tôi yêu cầu rõ: "trình bày kế hoạch trước, chưa viết code, chờ tôi duyệt" — và phần lớn sai hướng bị chặn ngay ở đó.
- `Mid` **Agent quên mọi thứ giữa các phiên. Bù bằng gì?**
  → Hai chiến lược. **Tài liệu là bộ nhớ dài hạn** — file luật ở gốc repo cộng thư mục `design/` được đọc mỗi phiên; mọi quyết định quan trọng phải nằm ở đó, không nằm trong lịch sử chat. Và **nhật ký quyết định** `design/decisions.md` ghi lại lựa chọn kèm lý do — không có nó thì cứ vài phiên agent lại đề xuất ECS và mình lại giải thích lại từ đầu.
- `Mid` **Vì sao vertical slice là chốt chặn, không phải cột mốc?**
  → Vì nó là lúc kiểm chứng **core loop có vui không**: một màn chơi được, một kẻ địch, một vũ khí, nhưng **hoàn chỉnh và có juice**. Không vui thì quay lại bước thiết kế, **đừng đi tiếp**. Nhân rộng nội dung trên một core loop nhạt chỉ tạo ra nhiều nội dung nhạt hơn, và lúc đó quay đầu rất đắt.
- `Senior` **Năm điểm mù của AI mà anh phải tự bù trong quy trình?**
  → **Tích hợp** — từng phần đúng, ghép lại hỏng, nên luôn chạy thử thật. **Hiệu năng** — code sạch nhưng cấp phát trong vòng lặp. **Tương tác giữa các hệ thống** — thêm hệ thống mới làm hỏng cân bằng hệ thống cũ. **Đặc thù engine** — API cũ, mẫu lỗi thời, nên luôn nêu rõ phiên bản engine. Và **"có vui không"** — không bao giờ uỷ quyền được.
- `Senior` **Anh dùng version control thế nào khi làm với agent?**
  → **Commit trước mỗi nhiệm vụ lớn.** Kết quả tệ thì `git reset` rẻ hơn nhiều so với gỡ rối thủ công. Thay đổi lớn mang tính thử nghiệm thì dùng nhánh riêng. Và đặt tên commit cho biết phần nào do agent sinh ra — chi tiết nhỏ nhưng rất hữu ích khi truy vết bug vài tháng sau.
- `Senior` **Giai đoạn nào AI phát huy mạnh nhất, và vì sao?**
  → **Bước 5, nhân rộng theo chiều ngang**: thêm kẻ địch, vũ khí, màn chơi sau khi đã có vertical slice. Lý do là lúc đó đã có **khuôn mẫu tốt** để nhân bản theo, tiêu chí đúng/sai rõ ràng, và mỗi việc kiểm chứng được nhanh. Ngược lại, bước 1 và bước 7 gần như hoàn toàn là việc của người — một bên là quyết định, một bên là cảm giác.

**Khung trả lời 60 giây** — "Quy trình làm game với AI của anh thế nào?"

> Bảy giai đoạn, và ranh giới quan trọng nhất nằm ở hai đầu. **Thiết kế thì tôi làm, không uỷ quyền** — pillar và core loop là thứ định nghĩa game này là của mình. **Đánh bóng** ở cuối cũng phần lớn là việc của người, vì nó là cảm giác.
>
> Ở giữa: viết GDD cho AI đọc — đây là khoản đầu tư sinh lời cao nhất, một buổi chiều viết tài liệu tiết kiệm hàng tuần sửa code sai hướng. Rồi dựng khung cho chạy được, rồi **vertical slice** như một chốt chặn: một màn, một địch, một vũ khí nhưng hoàn chỉnh và có juice. Không vui thì quay lại bước một, **đừng đi tiếp**. Sai lầm phổ biến nhất là nhảy thẳng sang nhân rộng nội dung khi chưa biết core loop có vui không.
>
> Về cách làm việc hằng ngày: nhiệm vụ cỡ **một commit, kiểm chứng được**; luôn **đọc kế hoạch trước khi agent viết code** — ba mươi giây đổi lấy hai mươi phút; và **commit trước mỗi nhiệm vụ lớn**, vì `git reset` rẻ hơn gỡ rối.

**Họ sẽ đào tiếp**

- *"Vì sao nhật ký quyết định lại cần thiết?"* → Vì agent **không có trí nhớ giữa các phiên**, còn quyết định thì có lý do mà chỉ mình biết. Không ghi lại thì mỗi vài phiên nó lại đề xuất đúng thứ mình đã cân nhắc và loại bỏ — mình mất thời gian giải thích lại, hoặc tệ hơn là đồng ý vì đã quên mất lý do ban đầu.
- *"Dựng khung trước gameplay có phải lãng phí không?"* → Không, vì mục tiêu của nó là có một thứ **chạy được và build được** càng sớm càng tốt. Nó kiểm tra rẻ một loạt rủi ro không lộ ra ở chỗ khác — thiết lập dự án, quy trình build, ký số — và nó cho mọi nhiệm vụ sau một chỗ để cắm vào.
- *"Chia nhiệm vụ theo kích thước hay theo ranh giới?"* → Theo **ranh giới kiểm chứng được**, và kích thước là hệ quả. Mỗi nhiệm vụ phải có một cách biết nó đúng trong vài phút — test, hoặc chạy thử quan sát được. Chia theo kích thước thuần thì vẫn có thể cho ra một mảnh không kiểm được, và nó sẽ dồn rủi ro về cuối.
- *"Đo quy trình này có hiệu quả không thì đo bằng gì?"* → Bằng **tỉ lệ nhiệm vụ xong trong một vòng**, **phần diff bị người sửa lại**, và thời gian review. Ba con số đó nói về giá trị thật, khác hẳn với "bao nhiêu phần trăm code do AI viết" — chỉ số đó không nói gì về giá trị và tạo động cơ xấu ngay lập tức.

**Cờ đỏ**

- Uỷ quyền phần thiết kế và pillar cho AI.
- Nhảy từ GDD sang nhân rộng nội dung, bỏ qua vertical slice.
- Giao nhiệm vụ cỡ "làm hệ thống chiến đấu".
- Chồng nhiều nhiệm vụ rồi mới chạy thử một lần.
- Mọi quyết định quan trọng chỉ tồn tại trong lịch sử chat.

**Số / ví dụ nên thuộc**

- Bảy giai đoạn: **thiết kế → GDD → dựng khung → vertical slice → nhân rộng → cân bằng → đánh bóng**.
- Kích thước nhiệm vụ: **một commit, kiểm chứng được, chạy được sau khi xong**.
- Đọc kế hoạch trước: **30 giây** đổi lấy **20 phút** không đọc code sai hướng.
- Năm điểm mù phải tự bù: **tích hợp · hiệu năng · tương tác hệ thống · đặc thù engine · "có vui không"**.
- **Commit trước** mỗi nhiệm vụ lớn; nhánh riêng cho thay đổi thử nghiệm.
