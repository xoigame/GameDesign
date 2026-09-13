---
id: ai-interview
title: Phỏng vấn — nói về việc dùng AI
summary: Ba thứ người phỏng vấn thật sự đang đo khi hỏi "anh dùng AI thế nào", bốn nhóm câu hỏi kèm node để ôn, ba bằng chứng nên mang theo, cách xử lý live-coding có AI, và bộ câu hỏi khi chính bạn ngồi ghế phỏng vấn.
status: deep
read: 139
level: intermediate
order: 90
tags: [ai-dev, interview, career, process]
related: [project-postmortem, coding-agents, knowledge-base-for-agents, ai-limits, ai-eval]
---

Câu *"anh dùng AI thế nào trong công việc?"* giờ xuất hiện ở gần như mọi buổi phỏng vấn lập trình. Nó nghe như câu hỏi về công cụ. Nó không phải.

Người hỏi đã biết bạn dùng AI — ai cũng dùng. Họ đang đo ba thứ khác, và câu trả lời chỉ liệt kê tên công cụ thì trượt cả ba.

| Thứ họ đo | Câu hỏi ngầm | Trả lời tốt chạm vào |
|---|---|---|
| **Trách nhiệm** | Code vào nhánh chính, ai chịu? | Bạn review gì, bằng cách nào, và bạn hiểu code tới đâu |
| **Phán đoán** | Anh có biết khi nào **không** dùng không? | Danh sách việc bạn dứt khoát tự làm, kèm lý do kỹ thuật |
| **Quy trình** | Đây là may mắn hay lặp lại được? | Cổng kiểm, file luật, cách đo — thứ người khác trong team dùng lại được |

Câu trả lời tệ điển hình: *"Tôi dùng Copilot và ChatGPT, nó giúp code nhanh hơn nhiều."* Không chạm trục nào. Câu trả lời tốt chạm ít nhất hai, và luôn có một chi tiết cụ thể mà người bịa không nghĩ ra được.

<figure class="fig">
<svg viewBox="0 0 660 170" role="img" aria-label="Thang bốn mức của câu trả lời về việc dùng AI: mức một kể tên công cụ, mức hai kể quy trình, mức ba kể ranh giới và lý do, mức bốn đưa bằng chứng và số đo">
  <defs>
    <marker id="aiq-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <line x1="24" y1="120" x2="636" y2="120" class="fig-line" marker-end="url(#aiq-ar)"/>
  <text x="330" y="152" text-anchor="middle" class="fig-muted" font-size="10">Người phỏng vấn nghe được bạn đứng ở mức nào trong khoảng ba mươi giây đầu</text>
  <rect x="24" y="52" width="136" height="52" rx="9" class="fig-box"/>
  <text x="92" y="74" text-anchor="middle" class="fig-label" font-size="12">1 · Tên công cụ</text>
  <text x="92" y="92" text-anchor="middle" class="fig-muted" font-size="10">"tôi dùng Copilot"</text>
  <rect x="176" y="52" width="136" height="52" rx="9" class="fig-box"/>
  <text x="244" y="74" text-anchor="middle" class="fig-label" font-size="12">2 · Quy trình</text>
  <text x="244" y="92" text-anchor="middle" class="fig-muted" font-size="10">kế hoạch → code → cổng kiểm</text>
  <rect x="328" y="52" width="136" height="52" rx="9" class="fig-box" stroke="#51cf9b"/>
  <text x="396" y="74" text-anchor="middle" class="fig-label" font-size="12">3 · Ranh giới</text>
  <text x="396" y="92" text-anchor="middle" class="fig-muted" font-size="10">việc không giao, kèm lý do</text>
  <rect x="480" y="52" width="136" height="52" rx="9" class="fig-box" stroke="#51cf9b"/>
  <text x="548" y="74" text-anchor="middle" class="fig-label" font-size="12">4 · Bằng chứng</text>
  <text x="548" y="92" text-anchor="middle" class="fig-muted" font-size="10">file luật · diff · số đo</text>
  <text x="24" y="36" class="fig-muted" font-size="10">ai cũng nói được</text>
  <text x="636" y="36" text-anchor="end" class="fig-muted" font-size="10">không bịa được</text>
</svg>
<figcaption>Mức 3 là chỗ phân loại: nói được việc nào bạn **không** giao và vì sao. Mức 4 cần chuẩn bị trước — không ai ứng khẩu ra một con số thật.</figcaption>
</figure>

## Nhận ra người đang hỏi mình

Cùng một câu hỏi, ba người hỏi vì ba lý do khác nhau. Nghe câu hỏi kế tiếp của họ là biết:

| Người hỏi | Câu họ hỏi tiếp | Đổi trọng tâm sang |
|---|---|---|
| **Tech lead** | "Anh review code AI viết thế nào?" | Cổng kiểm, đọc diff theo đường biên, chỗ bạn từng bắt được lỗi |
| **Quản lý / PM** | "Nó tiết kiệm được bao nhiêu?" | Chi phí mỗi nhiệm vụ, việc nào rút ngắn thật, việc nào không |
| **Đồng nghiệp cùng cấp** | "Anh dùng cái nào, cấu hình sao?" | Thiết lập cụ thể: file luật, worktree, lệnh kiểm |
| **Người hoài nghi AI** | "Không có AI thì anh làm được không?" | Nền kỹ thuật: bạn quyết định gì, AI chỉ gõ phần nào |

Với người hoài nghi, đừng tranh luận về AI. Kể một chỗ bạn **không** dùng và giải thích lý do kỹ thuật — đó là câu trả lời làm họ yên tâm nhanh nhất.

## Bốn nhóm câu hỏi và chỗ ôn

| Nhóm | Câu tiêu biểu | Ôn ở |
|---|---|---|
| **Quy trình làm việc** | "Giao việc cho agent thế nào? Nhiều agent cùng lúc?" | [[coding-agents]], [[ai-workflow]] |
| **Ngữ cảnh và chi phí** | "Sao cho AI hiểu dự án? Token đội lên thì làm gì?" | [[context-engineering]], [[knowledge-base-for-agents]] |
| **Chất lượng và ranh giới** | "Biết code AI đúng bằng cách nào? Việc gì không giao?" | [[ai-limits]], [[agent-guardrails]] |
| **Đo lường và sản phẩm** | "Có đo được không? Anh từng đưa AI vào sản phẩm chưa?" | [[ai-eval]], [[ai-assistant-architecture]], [[llm-npc]] |

Lưu ý phân biệt hay bị lẫn ngay trong phòng phỏng vấn: **AI *làm ra* game** (nhánh này) khác **AI *trong* game** (NPC, AI Director — [[llm-npc]]). Nghe nhầm là trả lời lạc đề cả phút. Không chắc thì hỏi lại một câu: *"Anh đang hỏi về quy trình phát triển hay về AI chạy trong game?"*

## Ba bằng chứng nên chuẩn bị trước

Mức 4 trên thang kia không ứng khẩu được. Chuẩn bị đúng ba thứ:

1. **Một file luật thật** bạn từng viết cho agent (`AGENTS.md` / `CLAUDE.md`), đã bỏ hết thông tin nội bộ. Kể được ba dòng trong đó và **vì sao mỗi dòng tồn tại** — mỗi dòng nên gắn với một lần đã hỏng.
2. **Một lần bạn bắt được lỗi của AI trong review.** Cụ thể: nó viết gì, trông đúng ở chỗ nào, bạn phát hiện nhờ đâu. Đây là câu chuyện ăn điểm nhất, vì nó chứng minh cả ba trục cùng lúc.
3. **Một con số hoặc một lời thú nhận trung thực.** "Tôi chưa đo, nhưng nếu đo tôi sẽ đo tỉ lệ nhiệm vụ xong trong một vòng và phần diff bị sửa lại" mạnh hơn một con số bịa — vì câu hỏi tiếp theo luôn là "đo bằng cách nào".

Cách gói ba thứ này vào một câu chuyện hai phút: [[project-postmortem]].

## Năm câu khó và cái bẫy trong đó

| Câu hỏi | Bẫy | Trục phải chạm |
|---|---|---|
| "Anh có phụ thuộc AI không?" | Chối hết (nghe giả) hoặc nhận hết (nghe đáng lo) | Nói phần nào AI làm, phần nào bạn quyết — kèm ví dụ bạn tự làm |
| "Không có AI anh làm được không?" | Trả lời "được chứ" rồi dừng | Nói *chậm hơn bao nhiêu và ở khâu nào* — cụ thể thì mới đáng tin |
| "Code AI viết, ai chịu trách nhiệm?" | Đổ cho công cụ | Người gửi PR chịu. Nói cách bạn đảm bảo điều đó |
| "Anh có dán code công ty vào AI không?" | Trả lời thật thà kiểu vô tư | Hỏi chính sách trước khi dán; nêu cách bạn làm việc khi bị cấm |
| "AI có lấy mất việc của anh không?" | Tranh luận triết học | Kéo về việc cụ thể: phần cơ học nhanh lên, phần phán đoán vẫn là người |

Một nguyên tắc xuyên suốt: **đừng nói dối về mức độ mình dùng AI.** Người phỏng vấn có kinh nghiệm sẽ đào bằng câu hỏi kỹ thuật về chính đoạn code bạn nói mình viết, và chỗ sụp không phải là "bạn dùng AI" mà là "bạn nói không rồi không giải thích được code của mình".

## Live coding và bài mang về nhà

**Hỏi trước, đừng đoán.** Một câu lịch sự trước khi bắt đầu: *"Bài này anh muốn tôi làm như lúc làm việc thật — tức có dùng gợi ý của IDE — hay muốn tôi viết tay hoàn toàn?"* Câu hỏi này bản thân nó đã ăn điểm, vì nó cho thấy bạn phân biệt được hai chế độ.

| Kịch bản | Cách cư xử |
|---|---|
| **Cấm dùng** | Chấp nhận gọn, đừng than. Viết chậm hơn nhưng nói to suy nghĩ: cấu trúc dữ liệu, độ phức tạp, ca biên |
| **Cho dùng** | Đừng dán đề bài rồi ngồi im. Nói rõ bạn đang nhờ nó việc gì, rồi **đọc to phần bạn kiểm chứng** — ca biên, kiểu dữ liệu, tên API có thật không |
| **Bài mang về nhà** | Ghi thẳng trong README phần nào AI sinh và bạn đã kiểm chứng thế nào. Giấu thì sẽ bị hỏi ở vòng sau và mất điểm gấp đôi |

Ở kịch bản "cho dùng", thứ được chấm không phải tốc độ gõ mà là **bạn kiểm chứng cái gì trước khi tin**. Người dùng AI kém thì dán và chạy; người dùng tốt thì dán, rồi lập tức hỏi "hàm này có tồn tại trong phiên bản đang dùng không" và thử một ca biên.

## Khi bạn là người phỏng vấn

Năm câu lọc nhanh người dùng AI có phán đoán, kèm tín hiệu cần nghe:

| Câu hỏi | Nghe được điều tốt | Cờ đỏ |
|---|---|---|
| "Việc nào anh dứt khoát không giao cho AI?" | Danh sách cụ thể + lý do kỹ thuật | "Không có việc gì cả" hoặc trả lời chung chung |
| "Lần gần nhất AI đưa câu trả lời sai mà trông rất đúng?" | Kể được cơ chế phát hiện | Không nhớ nổi lần nào |
| "Anh review code AI viết theo thứ tự nào?" | Đọc đường biên trước: phạm vi, quyết định ngầm | "Tôi đọc hết từ trên xuống" |
| "Prompt của anh cho một nhiệm vụ thật trông thế nào?" | Có ràng buộc phủ định, có lệnh kiểm | Một câu mô tả mơ hồ |
| "Làm sao anh biết nó thật sự giúp?" | Chỉ số hoặc thú nhận chưa đo + cách sẽ đo | Cảm tính, hoặc số không giải thích được |

Đừng hỏi "anh dùng công cụ nào" rồi chấm theo tên công cụ — nó chỉ đo được ứng viên đang ở công ty dùng cái gì.

## 🤖 Prompt cho AI

**Dùng AI thế nào để luyện phỏng vấn**

AI luyện phỏng vấn tốt ở hai việc và tệ ở một việc. Tốt: **sinh câu đào sâu** từ chính câu trả lời của bạn (thứ bạn không tự nghĩ ra được vì bạn đang ở trong đầu mình), và **chấm theo rubric** khi bạn đưa rubric. Tệ: khen. Model mặc định sẽ khen câu trả lời của bạn là "rất tốt" — đó là thứ vô dụng nhất trong cả quá trình, nên phải cấm thẳng.

Ba chế độ luyện, chạy theo thứ tự:

| Chế độ | Câu mở đầu | Dừng khi |
|---|---|---|
| **Đào sâu** | "Đọc câu trả lời này. Hỏi tôi 5 câu đào sâu, mỗi lần MỘT câu, chờ tôi đáp." | Bạn kẹt — chỗ kẹt là chỗ phải ôn |
| **Chấm điểm** | "Chấm theo rubric dưới. Chỉ nêu chỗ trừ điểm, không khen." | Không còn lỗi nhóm A |
| **Ép ngắn** | "Rút xuống 45 giây nói, giữ nguyên số liệu, bỏ mọi tính từ." | Đọc to hết trong một hơi thở |

**Phải nêu rõ** (thiếu là AI tự bịa):
- Vị trí và cấp bậc đang ứng tuyển (Unity client mid-level khác backend Go senior — câu hỏi lệch hẳn).
- Ngăn xếp công nghệ thật của bạn, để nó không hỏi về thứ bạn chưa từng chạm.
- **Sự thật về dự án của bạn** — số người, thời lượng, phần bạn sở hữu. Không đưa thì nó bịa số và bạn sẽ học thuộc một câu chuyện giả.
- Rubric chấm: cái gì tính là đạt. Không có rubric thì nó chấm theo cảm giác và luôn cho điểm cao.
- Cấm khen, cấm viết lại câu trả lời hộ bạn — bạn cần lỗi, không cần bản mẫu để học thuộc.

**Mẫu prompt**

```
Đóng vai tech lead phỏng vấn tôi cho vị trí Unity client mid-level tại một
studio game mobile. Phong cách: hoài nghi, hỏi ngắn, đào tới khi tôi kẹt.

Sự thật về tôi (đừng bịa thêm): 3 năm Unity, 1 năm Go; dự án gần nhất là
game arena async, team 6 người, tôi sở hữu client + phần combat.

Luật:
- Hỏi MỘT câu mỗi lượt, chờ tôi trả lời. KHÔNG khen. KHÔNG viết hộ câu trả lời.
- Sau mỗi câu của tôi: nêu 1 lỗ hổng lớn nhất trong câu đó (tối đa 2 dòng),
  rồi hỏi tiếp câu đào sâu từ chính chỗ đó.
- Nếu tôi trả lời chung chung, hỏi lại "cụ thể là gì" thay vì đi tiếp.

Chủ đề buổi này: tôi dùng AI trong quy trình làm việc thế nào.
Bắt đầu bằng câu mở màn thật, đừng giải thích luật.
```

**Bẫy thường gặp:** luyện tới khi câu trả lời trôi chảy rồi tưởng là xong — trôi chảy và **có thật** là hai chuyện. AI rất giỏi giúp bạn đánh bóng một câu chuyện rỗng cho tới lúc nghe như thật, và nó sụp ở câu hỏi kỹ thuật đầu tiên về chi tiết. Phép thử: với mỗi câu bạn định nói, tự hỏi *"nếu họ hỏi 'cụ thể là gì' ba lần liên tiếp, tới lần thứ ba tôi còn gì để nói không?"* Không còn thì đó là chỗ phải đi làm thật, không phải chỗ để luyện nói.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Anh dùng AI thế nào trong công việc?**
  → Tôi dùng nó cho phần cơ học — boilerplate, test lặp lại, refactor có cổng kiểm — và giữ lại phần quyết định: kiến trúc, ranh giới client–server, game feel. Mỗi nhiệm vụ đi qua một lệnh kiểm chạy được và một lần tôi đọc diff, nên thứ vào nhánh chính là thứ tôi hiểu và sửa được.
- `Junior` **Không có AI thì anh làm được không?**
  → Được, chậm hơn ở phần gõ code lặp lại và tra cứu API, khoảng vài chục phần trăm cho những việc đó. Phần không đổi là phần quyết định: chọn cấu trúc dữ liệu, chia ranh giới, tìm nguyên nhân một lỗi chỉ xảy ra trên thiết bị thật — AI không rút ngắn được những việc đó cho tôi.
- `Mid` **Code AI viết mà có bug lên production thì ai chịu?**
  → Người gửi PR, tức là tôi. Công cụ không phải một bên chịu trách nhiệm, nên tôi thiết kế quy trình theo đúng giả định đó: một lệnh kiểm thoát khác 0 khi sai, đọc diff theo đường biên, và không merge phần tôi không giải thích được. Nếu tôi không sửa nổi đoạn đó sáu tháng sau thì nó chưa đủ điều kiện vào nhánh chính.
- `Mid` **Anh từng bị AI đưa câu trả lời sai mà trông rất đúng chưa?**
  → Thường xuyên nhất là API không tồn tại ở đúng phiên bản engine đang chạy — code đọc rất hợp lý và compile mới lộ. Từ đó tôi ghi phiên bản chính xác vào file luật ở gốc repo. Loại thứ hai nguy hiểm hơn: nó viết code cộng tiền ở client, đúng cú pháp và sai kiến trúc, nên tôi thêm một dòng luật nói rõ server là nguồn chân lý cho tiền tệ.
- `Mid` **Anh có dán code của công ty vào dịch vụ AI không?**
  → Tôi hỏi chính sách trước khi dán, không phải xin lỗi sau. Khi bị cấm gửi mã ra ngoài thì tôi chỉ dùng phương án đã duyệt trong hạ tầng công ty; những việc không cần mã thật thì vẫn nhờ AI được bằng cách mô tả bài toán ở dạng trừu tượng, không kèm tên nghiệp vụ, khoá hay dữ liệu người chơi.
- `Senior` **Làm sao anh biết dùng AI thật sự giúp team, không chỉ tạo cảm giác nhanh?**
  → Tôi nhìn chi phí và thời gian cho mỗi nhiệm vụ hoàn thành, tỉ lệ xong trong một vòng, và phần diff bị người sửa lại sau merge — không nhìn số dòng sinh ra. Nếu chưa có số thì tôi nói thẳng là chưa đo và nêu cách sẽ đo, vì một con số bịa sẽ vỡ ngay ở câu hỏi "đo bằng cách nào".
- `Senior` **Anh làm gì để cả team dùng AI theo cùng một cách?**
  → Đưa luật vào repo thay vì vào đầu người: một file luật ở gốc mà mọi agent đọc trước, viết dưới dạng ràng buộc kiểm được, kèm validator chạy trong CI. Quy ước sống trong trí nhớ hoặc trong wiki thì agent không thấy; quy ước viết mơ hồ thì mỗi người diễn giải một kiểu.
- `Senior` **Ứng viên dùng AI tốt và dùng AI kém khác nhau ở đâu?**
  → Ở chỗ họ kiểm chứng cái gì trước khi tin. Người kém dán kết quả rồi chạy; người tốt hỏi ngay "hàm này có trong phiên bản đang dùng không" và thử một ca biên. Khi phỏng vấn tôi hỏi "việc nào anh dứt khoát không giao cho AI" — trả lời "không có việc gì" là cờ đỏ rõ hơn mọi câu hỏi thuật toán.
- `Senior` **Bài mang về nhà có nên dùng AI không?**
  → Có, nhưng ghi thẳng trong README phần nào AI sinh và tôi kiểm chứng thế nào. Giấu thì ở vòng sau sẽ bị hỏi vào chi tiết và mất điểm gấp đôi — vừa mất điểm kỹ thuật vừa mất điểm trung thực. Phần được chấm thật ra là quyết định thiết kế và test, chứ không phải ai gõ ra ký tự.

**Khung trả lời 60 giây** — "Anh dùng AI trong công việc như thế nào?"

> Tôi chia việc theo cách kiểm chứng. Việc nào một lệnh build hoặc test chứng minh được thì tôi giao cho agent: boilerplate, refactor, test lặp lại, port một mẫu qua nhiều file. Việc nào compile và test không chứng minh được thì tôi tự làm — dựng prefab, tinh chỉnh cảm giác điều khiển, chọn ranh giới client–server. Ranh giới đó là phần tôi nghĩ quan trọng hơn chuyện dùng công cụ nào.
>
> Về quy trình, mỗi nhiệm vụ đi qua hai cổng: một lệnh kiểm duy nhất thoát khác 0 khi sai, và một lần tôi đọc diff theo đường biên — có lan ra ngoài phạm vi không, chỗ nào nó quyết định thay tôi, phần nào compile không chứng minh được. Ràng buộc và phiên bản engine thì nằm trong file luật ở gốc repo, vì đó là thứ agent không tự thấy được và cũng là nguồn lỗi hay gặp nhất.
>
> Còn trách nhiệm thì không chia được: code vào nhánh chính là code tôi ký tên. Phép thử tôi tự đặt ra là tôi có sửa được đoạn đó sáu tháng sau mà không cần agent không — không thì nó chưa đủ điều kiện merge.

**Họ sẽ đào tiếp**

- *"Cho một ví dụ cụ thể anh bắt được lỗi của AI."* → Kể một trường hợp có cơ chế: nó viết gì, trông đúng ở chỗ nào, bạn phát hiện nhờ đâu — compile, test, hay đọc đường biên. Ví dụ có cơ chế phát hiện đáng tin hơn ví dụ chỉ có kết luận.
- *"Anh tin nó tới mức nào?"* → Tin ở mức "kiểm chứng được bằng lệnh". Với Unity thì compile qua vẫn chưa chứng minh được gì, nên phần kiểm chứng thật nằm ở lần bấm Play — và đó là lý do nhiệm vụ phải nhỏ.
- *"Team anh có ai không dùng AI không, xử lý thế nào?"* → Không ép. Điều cần thống nhất là cổng kiểm và chuẩn review, vì hai thứ đó áp dụng cho mọi PR bất kể ai gõ. Thống nhất công cụ là chuyện thứ yếu.
- *"Anh học được gì mới trong sáu tháng qua?"* → Chọn thứ đo được và có vết trong repo: dựng file luật cho agent, dựng bộ eval, hay một pipeline sinh master data. Trả lời "tôi học cách viết prompt tốt hơn" là mức 1 trên thang, gần như không có nội dung.

**Cờ đỏ**

- Kể tên công cụ mà không nói được việc nào **không** giao cho nó.
- "Tôi không dùng AI" trong khi code trong bài test mang đậm dấu vết AI — mất điểm trung thực nặng hơn mọi lỗi kỹ thuật.
- Khoe con số năng suất mà không giải thích được cách đo.
- Nói mình review kỹ nhưng không nói được đọc **gì trước**.
- Nhận là mình viết một đoạn rồi không giải thích nổi vì sao chọn cấu trúc đó.

**Số / ví dụ nên thuộc**

- Ba trục người phỏng vấn đo: **trách nhiệm · phán đoán · quy trình**.
- Thang bốn mức của câu trả lời: **tên công cụ → quy trình → ranh giới → bằng chứng**.
- Ba bằng chứng mang theo: **file luật · một lần bắt lỗi AI · một con số (hoặc lời thú nhận chưa đo)**.
- Phép thử "cụ thể là gì" **ba lần liên tiếp** — hết ý ở lần thứ ba nghĩa là chưa làm thật.
- Phân biệt hai chủ đề dễ lẫn: **AI làm ra game** khác **AI trong game** ([[llm-npc]]).
