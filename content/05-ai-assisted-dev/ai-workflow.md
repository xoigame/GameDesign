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
