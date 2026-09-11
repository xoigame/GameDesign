---
title: Bản đồ công cụ AI
icon: 🧰
summary: Công cụ nào cho việc nào — coding agent, sinh asset, phân tích — và tiêu chí chọn quan trọng hơn danh sách tính năng.
status: deep
read: 92
level: basic
order: 5
tags: [ai-dev, tooling, workflow]
related: [ai-for-design, ai-for-build, ai-for-publish, ai-limits, tech-stack]
---

Danh sách công cụ đổi vài tháng một lần, nên mục này tập trung vào **tiêu chí chọn** — thứ không đổi.

## Tiêu chí quyết định, xếp theo mức quan trọng

**1. Nó đọc được repo của bạn hay bạn phải dán vào?**

Đây là khác biệt lớn nhất, lớn hơn mọi so sánh chất lượng model.

| | Agent đọc được repo | Chat phải dán vào |
|---|---|---|
| Ngữ cảnh | Luôn đúng hiện trạng | Lệch ngay khi bạn sửa code |
| Chi phí token | Chỉ đọc file cần | Dán lại mỗi lần |
| Sửa nhiều file | Làm được | Bạn phải copy về từng file |
| Chạy test tự kiểm | Làm được | Không |

Với một kho kiến thức 94.000 từ như cái này, khác biệt đó là quyết định. Xem [[gdd-for-ai]] về việc để agent *đọc file theo nhu cầu* thay vì dán cả kho.

**2. Nó chạy được lệnh không?**

Agent chạy được `npm run check`, `dotnet test`, `git diff` sẽ **tự kiểm chứng** thay đổi của nó. Agent không chạy được lệnh thì mọi thứ nó viết là niềm tin — bạn là người duy nhất phát hiện lỗi.

**3. Bạn kiểm soát được phạm vi không?**

Agent tự ý sửa 30 file là vấn đề thật. Thứ cần có: xem diff trước khi ghi, giới hạn thư mục, và `git` để hoàn tác.

## Bốn nhóm công cụ

**Coding agent** — phần lớn công việc nằm ở đây. Tiêu chí: ba mục trên.

**Sinh asset** (ảnh, âm thanh, 3D) — vấn đề không phải chất lượng một asset mà là **nhất quán giữa nhiều asset**. Xem [[asset-generation]]. Với Unity, thứ cứu bạn là preset import và `AssetPostprocessor`, không phải công cụ sinh tốt hơn.

**Phân tích** — đọc log playtest, tìm bất thường, mô phỏng cân bằng. Đây là nhóm bị đánh giá thấp nhất và có ROI cao nhất. Xem [[balancing-math]], [[playtesting-metrics]].

**Viết** — store page, devlog, patch note, bản dịch. Xem [[ai-for-publish]].

## Chi phí — mô hình cần hiểu trước khi phụ thuộc

Ba dạng chi phí, chọn sai dạng là tốn gấp nhiều lần:

- **Trả theo token** — rẻ khi làm ít, đắt không lường được khi agent đọc cả repo mỗi lần. Kiểm soát bằng cách chia nhiệm vụ nhỏ và chỉ định file cần đọc.
- **Trả theo tháng** — đoán được, nhưng có giới hạn dùng.
- **Chạy cục bộ** — không tốn tiền, đổi lại chất lượng thấp hơn rõ và cần máy mạnh. Hợp cho việc lặp lại nhiều (phân loại log, dịch nháp) hơn là việc cần suy luận.

**Điều đáng nhớ:** chi phí thật không phải tiền API — là **thời gian bạn mất khi sửa code AI viết sai hướng**. Một buổi chiều viết [[gdd-for-ai]] tiết kiệm nhiều hơn mọi tối ưu token.

## Đừng dùng nhiều công cụ cho cùng một việc

Ba coding agent trên cùng một repo là ba nguồn sửa đổi không biết nhau. Chọn một cái làm chính, và chỉ thêm cái thứ hai khi nó làm việc **khác hẳn** (ví dụ: một cái viết code, một cái chỉ review).

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc chọn công cụ**

Đây là mục **đừng hỏi AI**. Model không biết công cụ nào tốt hơn ở thời điểm hiện tại — tri thức của nó có thời điểm cắt, và nó thường mô tả phiên bản cũ hoặc tính năng đã đổi.

Việc AI làm được ở đây:
- **Mô tả cơ chế** — "giải thích cách agent quyết định file nào cần đọc", "prompt cache hoạt động thế nào" → nó giải thích nguyên lý tốt.
- **Đọc tài liệu bạn dán vào** — dán trang pricing hoặc changelog thật, nhờ nó so sánh. Nó tính toán và đối chiếu tốt; nó chỉ không biết *hiện trạng*.
- **Viết script đo** — ví dụ đếm token của một thư mục để ước lượng chi phí.

**Phải nêu rõ:** nếu vẫn hỏi, luôn dán tài liệu nguồn và yêu cầu nó chỉ dựa vào đó.

**Mẫu prompt**

```
Đây là trang giá và giới hạn của <công cụ>, chụp hôm nay:
<dán nội dung>

Dự án tôi: Unity, ~400 file C#, tôi giao khoảng 15 nhiệm vụ/tuần,
mỗi nhiệm vụ agent cần đọc 5-10 file.

CHỈ dựa vào tài liệu tôi dán, đừng dùng kiến thức sẵn có của bạn:
1. Ước lượng chi phí/tháng, nói rõ giả định
2. Cơ chế nào trong tài liệu này làm chi phí tăng vọt nếu tôi dùng sai?
3. Nếu có chỗ nào tài liệu không nói rõ, LIỆT KÊ RA thay vì đoán
```

**Bẫy thường gặp:** hỏi "công cụ nào tốt nhất 2026" và nhận về câu trả lời tự tin về sản phẩm đã đổi tên hoặc đổi giá. Luôn dán nguồn.

## 🎮 Unity

Với Unity, tiêu chí chọn công cụ có thêm một mục đặc thù: **nó hiểu được bao nhiêu phần của project?**

**Phần nào của Unity project agent tiếp cận được**

| Thành phần | Dạng file | Agent làm được |
|---|---|---|
| Script C# | text | ✅ đọc, sửa, viết mới |
| UXML / USS | text | ✅ |
| `.asset` (ScriptableObject) | YAML | ⚠️ đọc được, sửa dễ hỏng GUID |
| `.prefab` / `.unity` | YAML lớn | ❌ đừng để nó sửa |
| Animator Controller | YAML khó | ❌ |
| Shader Graph | binary-ish | ❌ (HLSL viết tay thì ✅) |
| ProjectSettings | YAML | ❌ nó không tự biết đọc |
| `Library/` | binary | không liên quan, phải gitignore |

Hệ quả thực dụng: **đẩy càng nhiều quyết định vào C# và ScriptableObject càng tốt**, vì đó là phần agent làm được. Đây cũng là lý do ranh giới `Core/` ở [[unity-project-structure]] có giá trị kép — nó vừa cho test nhanh vừa cho agent chỗ làm việc an toàn.

**Thứ nên đo trước khi chọn**

```bash
# Repo Unity có bao nhiêu text mà agent thực sự cần đọc?
find Assets/Scripts -name "*.cs" | xargs wc -l | tail -1

# So với tổng dung lượng project (phần lớn là asset agent không đọc)
du -sh Assets/
```

Con số đầu quyết định chi phí; con số thứ hai gần như không liên quan. Nhiều người ước lượng sai vì nhìn vào con số thứ hai.

**Một thứ đáng thiết lập ngay: lệnh agent chạy được để tự kiểm**

```bash
# Unity chạy test từ dòng lệnh — agent gọi được cái này là nó tự kiểm chứng được
Unity -batchmode -runTests -testPlatform EditMode \
      -projectPath . -testResults results.xml -quit
```

Không có lệnh này, agent viết code xong không biết đúng sai. Có nó, vòng lặp ngắn đi rất nhiều. Xem [[unity-build-platform]] về CI.

**Kiểm tra nhanh**
- Agent có chạy được test EditMode từ dòng lệnh chưa?
- `.gitignore` có loại `Library/` để agent không đọc rác chưa?
- Đã đo số dòng C# thật (không phải dung lượng Assets/) chưa?
