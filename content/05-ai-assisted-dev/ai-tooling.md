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

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Tiêu chí quan trọng nhất khi chọn công cụ AI cho dự án là gì?**
  → **Nó đọc được repo hay mình phải dán vào.** Khác biệt này lớn hơn mọi so sánh chất lượng model: agent đọc repo thì ngữ cảnh luôn đúng hiện trạng, chỉ đọc file cần nên rẻ hơn, sửa được nhiều file, và tự chạy test kiểm chứng. Chat phải dán thì ngữ cảnh lệch ngay khi mình sửa code.
- `Junior` **Vì sao "agent chạy được lệnh" lại là tiêu chí riêng?**
  → Vì agent chạy được `npm run check`, `dotnet test`, `git diff` sẽ **tự kiểm chứng thay đổi của nó**. Không chạy được lệnh thì mọi thứ nó viết là niềm tin, và mình là người duy nhất phát hiện lỗi — tức là toàn bộ chi phí kiểm chứng rơi về phía con người.
- `Junior` **Bốn nhóm công cụ AI trong gamedev?**
  → **Coding agent** (phần lớn công việc). **Sinh asset** — vấn đề không phải chất lượng một asset mà là **nhất quán giữa nhiều asset**. **Phân tích** — đọc log playtest, tìm bất thường, mô phỏng cân bằng; nhóm bị đánh giá thấp nhất và **ROI cao nhất**. Và **viết** — store page, devlog, patch note, bản dịch.
- `Mid` **Kiểm soát phạm vi của agent cần những gì?**
  → Ba thứ tối thiểu: **xem diff trước khi ghi**, **giới hạn thư mục** được phép chạm, và **`git` để hoàn tác**. Agent tự ý sửa 30 file là vấn đề thật, không phải lo xa — và nó thường xảy ra với ý tốt, kiểu "tiện tay dọn luôn cho sạch".
- `Mid` **Ba dạng chi phí và cách chọn?**
  → **Trả theo token** — rẻ khi làm ít, đắt không lường được khi agent đọc cả repo mỗi lần; kiểm soát bằng cách chia nhiệm vụ nhỏ và chỉ định file cần đọc. **Trả theo tháng** — đoán được nhưng có giới hạn dùng. **Chạy cục bộ** — không tốn tiền, chất lượng thấp hơn rõ, hợp việc lặp lại nhiều (phân loại log, dịch nháp) hơn việc cần suy luận.
- `Mid` **Chi phí thật khi làm việc với AI nằm ở đâu?**
  → **Không phải tiền API mà là thời gian mất khi sửa code AI viết sai hướng.** Hệ quả thực tế: một buổi chiều viết tài liệu thiết kế cho AI đọc tiết kiệm nhiều hơn mọi tối ưu token cộng lại. Tối ưu token là tối ưu chi phí nhìn thấy được, còn chi phí lớn thì nằm ở chỗ không có hoá đơn.
- `Senior` **Vì sao không nên dùng ba coding agent trên cùng một repo?**
  → Vì đó là **ba nguồn sửa đổi không biết nhau**: cùng file bị ghi đè, cùng quy ước bị diễn giải ba kiểu, và không ai truy được thay đổi nào đến từ đâu. Chọn một cái làm chính, chỉ thêm cái thứ hai khi nó làm việc **khác hẳn** — ví dụ một cái viết code, một cái chỉ review.
- `Senior` **Nhóm công cụ nào bị đánh giá thấp nhất, và vì sao?**
  → **Phân tích**: đọc log playtest, tìm bất thường, chạy mô phỏng cân bằng. Nó bị bỏ qua vì không tạo ra thứ nhìn thấy được như code hay ảnh, nhưng nó trả lời đúng loại câu hỏi mà đội hay đoán — người chơi rơi ở đâu, build nào đang trội, seed nào cho ra màn không hoàn thành được. Đó cũng là loại việc máy làm tốt hơn người rõ rệt.
- `Senior` **Danh sách công cụ đổi vài tháng một lần. Anh giữ lựa chọn của mình không lỗi thời bằng cách nào?**
  → Bằng cách bám vào **tiêu chí thay vì tên công cụ**: đọc được repo không, chạy được lệnh không, kiểm soát được phạm vi không, và chi phí thuộc dạng nào. Và giữ dự án **không phụ thuộc vào một công cụ cụ thể**: luật nằm trong file text ở repo, dữ liệu nằm ở định dạng mở, quy trình kiểm chứng chạy bằng lệnh — đổi công cụ khi đó là đổi một mắt xích, không phải làm lại quy trình.

**Khung trả lời 60 giây** — "Anh chọn công cụ AI cho một dự án thế nào?"

> Bằng **tiêu chí, không bằng danh sách tính năng**, vì danh sách công cụ đổi vài tháng một lần còn tiêu chí thì không. Câu hỏi thứ nhất và cũng quan trọng nhất: **nó đọc được repo của mình hay mình phải dán vào**. Khác biệt đó lớn hơn mọi so sánh chất lượng model — đọc được repo thì ngữ cảnh luôn đúng hiện trạng, rẻ hơn, sửa được nhiều file, và tự chạy test.
>
> Thứ hai: **nó chạy được lệnh không**. Agent chạy được test và `git diff` thì tự kiểm chứng được; không chạy được thì mọi thứ nó viết là niềm tin. Thứ ba: **mình kiểm soát được phạm vi không** — xem diff trước khi ghi, giới hạn thư mục, và git để hoàn tác.
>
> Về chi phí, điều tôi nhắc đội nhiều nhất là chi phí thật **không phải tiền API** mà là thời gian sửa code viết sai hướng — nên một buổi chiều viết tài liệu cho AI đọc tiết kiệm hơn mọi tối ưu token. Và một luật vận hành: **đừng dùng ba agent cho cùng một việc trên cùng một repo**.

**Họ sẽ đào tiếp**

- *"Với kho tài liệu lớn thì tại sao đọc-theo-nhu-cầu lại quan trọng?"* → Vì dán cả kho vào mỗi lần vừa đắt vừa làm agent lạc: ngữ cảnh lớn thì tín hiệu bị loãng. Cách đúng là một **mục lục phẳng** để agent tự chọn file cần mở, và chỉ mở đúng node liên quan — cùng cách một người mới vào dự án làm.
- *"Chạy model cục bộ đáng dùng ở đâu?"* → Ở việc **lặp lại nhiều và không cần suy luận sâu**: phân loại log, gắn nhãn, dịch nháp, tóm tắt hàng loạt. Ở đó chi phí biến đổi mới là thứ quyết định, và chất lượng thấp hơn không gây hại. Việc cần suy luận thì chênh lệch chất lượng vẫn quá lớn để đánh đổi.
- *"Làm sao kiểm soát chi phí token mà không phải đếm từng lần gọi?"* → Chia nhiệm vụ nhỏ và **chỉ định file cần đọc**; đó là hai đòn bẩy lớn nhất và cũng cải thiện chất lượng. Rồi mới tới cache phần luật lặp lại. Và đo **chi phí mỗi nhiệm vụ hoàn thành**, không đo giá mỗi nghìn token — model đắt gấp ba mà xong trong một vòng thì rẻ hơn.
- *"Công cụ sinh asset thì chọn theo gì?"* → Không theo chất lượng một ảnh mà theo **khả năng nhất quán**: có seed và tham số tái lập được không, có kiểm soát được phong cách qua nhiều lần sinh không. Và nhớ rằng phần cứu mình thật sự là **pipeline hậu kỳ** — ép bảng màu, chuẩn hoá tỉ lệ — chứ không phải công cụ sinh tốt hơn.

**Cờ đỏ**

- Chọn công cụ theo bảng so sánh tính năng, không theo ba tiêu chí vận hành.
- Dùng chat phải dán code cho một dự án nhiều file rồi than ngữ cảnh sai.
- Agent không chạy được lệnh nào, mọi kiểm chứng do người làm.
- Ba coding agent cùng sửa một repo.
- Tối ưu chi phí token trong khi bỏ trống tài liệu thiết kế.

**Số / ví dụ nên thuộc**

- Ba tiêu chí vận hành: **đọc được repo · chạy được lệnh · kiểm soát được phạm vi**.
- Bốn nhóm công cụ: **coding agent · sinh asset · phân tích · viết**; **phân tích** có ROI cao nhất.
- Ba dạng chi phí: **theo token · theo tháng · chạy cục bộ**.
- Chi phí thật = **thời gian sửa code sai hướng**, không phải tiền API.
- Luật vận hành: **một agent chính**; thêm cái thứ hai chỉ khi nó làm việc khác hẳn.
