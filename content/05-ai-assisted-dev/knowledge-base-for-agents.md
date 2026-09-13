---
title: Kho kiến thức cho agent đọc
icon: 🧠
summary: Case study chính kho này — markdown là nguồn chân lý, build sinh index máy đọc được, validator chặn lỗi im lặng; và cách trình bày nó như một artifact khi đi phỏng vấn.
status: deep
read: 138
level: intermediate
order: 80
tags: [ai, agent, knowledge-base, process, documentation]
related: [ai-assistant-architecture, agent-guardrails, gdd-for-ai, ai-eval]
---

Agent biết Unity nói chung. Nó **không** biết dự án của bạn: vì sao đội chọn Kinematic Rigidbody, vì sao không dùng `Resources/`, ngân sách frame là bao nhiêu, ai được chạm thư mục nào. Dán lại những thứ đó vào mỗi cuộc hội thoại thì vừa đắt vừa không nhất quán — mỗi người dán một kiểu, và sau ba tháng không ai biết bản nào mới nhất.

Kho bạn đang đọc là một câu trả lời cho chuyện đó, và nó đủ cụ thể để mang đi kể trong phỏng vấn. Node này mô tả kiến trúc, hai lỗi thật đã xảy ra, và phần đáng lấy để áp vào dự án khác.

## Ba quyết định kiến trúc

**Một nguồn chân lý, mọi thứ khác suy ra.** Nội dung nằm ở `content/**/*.md` — markdown có frontmatter, người đọc và sửa được. Một script build sinh ra hai dạng phái sinh: `graph.json` cho web, `KNOWLEDGE_INDEX.md` là mục lục phẳng cho agent. **Không ai sửa tay hai file đó**; mọi thay đổi đi qua markdown. Nhờ vậy không bao giờ có chuyện hai bản tri thức lệch nhau.

**Cấu trúc suy ra từ cây thư mục, không khai báo ở đâu khác.** Thư mục là nhánh, file là node, `parent` tự suy. Không có file cấu hình nào phải cập nhật song song khi thêm nội dung — mỗi chỗ phải cập nhật song song là một chỗ sẽ quên.

**Mỗi node tách thành các mục có tên cố định**, và build tách chúng thành trường riêng trong JSON:

| Mục trong markdown | Trường JSON | Ai dùng |
|---|---|---|
| Thân bài | `body` | Người đọc để hiểu |
| `## 🤖 Prompt cho AI` | `aiPrompt` | Agent đọc trước khi nhận việc thuộc chủ đề đó |
| `## 🎮 Unity` | `unity` | Cách hiện thực hoá trong Unity |
| `## 💻 Code` | `code` | Script demo chạy được |
| `## 🎤 Phỏng vấn` | `interview` | Luyện nói |

Đây là điểm khác biệt so với một wiki thường: agent không phải đọc cả node để lấy phần nó cần, và web hiện mỗi mục thành một tab. Cùng một nội dung, hai cách tiêu thụ.

## Cổng kiểm: CI cho tri thức

`npm run check` chạy build ở chế độ strict và **thoát khác 0** nếu có bất kỳ cảnh báo nào. Nó bắt: trùng id, `related` và liên kết nội bộ trỏ vào node không tồn tại, chu trình trong cây, thiếu mục 🤖 bắt buộc, trùng khoá sắp xếp lộ trình đọc, thiếu `level`, thuật ngữ trỏ vào node không có thật, bản dịch mồ côi.

Ý tưởng nằm dưới: **tri thức cũng có thể gãy như code, và cũng nên có test**. Một liên kết nội bộ viết sai chính tả một ký tự là một liên kết chết mà mắt người không thấy trong 90 file.

## Hai lỗi im lặng đã xảy ra thật

Cả hai có chung một tính chất, và đó cũng là bài học chính của node này: **build vẫn xanh, không báo gì, nội dung âm thầm biến mất.**

**Code fence chưa đóng.** Một file có số lượng ``` lẻ. Markdown coi mọi heading phía sau là nằm trong code block, nên các mục 🤖/🎮 không được tách ra và **biến mất khỏi web** — trong khi file markdown nhìn vẫn bình thường. Cách chữa: validator đếm fence, số lẻ là **lỗi**, không phải cảnh báo.

**CRLF trên Windows.** Git với `core.autocrlf=true` checkout ra CRLF; mọi regex tách mục đều neo cuối dòng bằng `$`, nên ký tự CR còn sót làm `## 🤖 Prompt cho AI` không khớp nữa. Hậu quả: **toàn bộ** mục 🤖/🎮/💻 rỗng trong `graph.json` — trên đúng máy đó, và chỉ máy đó. Build vẫn chạy, `npm run check` vẫn xanh, không một cảnh báo nào. Phát hiện ra nhờ nhìn dòng thống kê: `0/81 có prompt` thay vì `81/81`. Cách chữa: `.gitattributes` ép LF **và** chuẩn hoá khi đọc file trong build script — thắt lưng lẫn dây đeo, vì cái này đã chứng minh nó lặp lại được.

Rút ra một luật đáng mang sang mọi dự án: **in ra vài con số tổng hợp sau mỗi lần build, và nhìn chúng**. Con số tụt bất thường bắt được cả một lớp lỗi mà không validator nào nghĩ trước được — bạn không cần đoán trước lỗi, bạn chỉ cần thấy nó.

## Agent dùng kho này thế nào

Thứ tự cố định, và chính nó là thứ giữ cho ngữ cảnh nhỏ:

1. Đọc file luật ở gốc repo — được sửa gì, quy trình, cổng kiểm.
2. Đọc `KNOWLEDGE_INDEX.md` — mục lục phẳng: mọi node, id, một câu tóm tắt, đường dẫn.
3. Mở **đúng** node cần, không quét cả `content/`.
4. Đọc mục 🤖 của node đó, đối chiếu yêu cầu của người dùng với danh sách **"Phải nêu rõ"**, thiếu gì thì **hỏi** thay vì tự điền.

Bước 4 là bước tạo khác biệt lớn nhất trong thực tế: nó biến "AI tự bịa một con số rồi bạn phát hiện sau ba ngày" thành "AI hỏi bạn con số đó ngay từ đầu".

## Lấy gì cho dự án của bạn

Chi phí thật **không** nằm ở script build — nó là vài trăm dòng. Nó nằm ở việc viết nội dung, và đó cũng là lý do đừng chép nguyên mô hình này. Ba thứ đáng lấy:

| Đáng đưa vào kho | Không đáng |
|---|---|
| Quyết định đã chốt và **vì sao** (chọn Kinematic Rigidbody, không dùng `Resources/`) | Tài liệu API — agent đã biết, và bạn sẽ không cập nhật kịp |
| Bẫy đã làm hỏng dự án một lần, kèm cách phát hiện | Kiến thức chung về game design |
| Quy ước: đặt tên, thư mục, chiều phụ thuộc, ngân sách hiệu năng | Ghi chú cuộc họp |
| Đường biên: cái gì agent không được chạm | Thứ chưa ai đồng ý |

Dấu hiệu nên dừng lại: nếu một mục không đổi được hành vi của agent hay của người mới vào dự án, nó là trang trí. Kho kiến thức phình ra mà không ai đọc thì tệ hơn không có, vì nó tạo cảm giác đã ghi lại rồi.

## Kiểm tra nhanh

- [ ] Có **một** nguồn chân lý; mọi dạng khác được sinh ra, không sửa tay
- [ ] Có mục lục phẳng cho agent, tự sinh
- [ ] Có validator chạy được bằng một lệnh và **thoát khác 0** khi có vấn đề
- [ ] Build in ra vài con số tổng hợp, và có người nhìn chúng
- [ ] Nội dung là quyết định, bẫy và quy ước — không phải tài liệu API chép lại

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc xây kho kiến thức**

Đây là loại việc AI làm được nhiều hơn người ta nghĩ, nhưng **theo một thứ tự nhất định**. Nó viết rất tốt: script build và validator, chuyển tài liệu rời rạc sang cấu trúc thống nhất, soát toàn kho để tìm mâu thuẫn giữa hai node, và dịch thuật ngữ. Nó viết rất tệ phần **nội dung đặc thù dự án**, vì đó chính là phần nó không có.

Thứ tự hiệu quả: bạn viết 3–5 node mẫu bằng tay để định hình giọng và mức độ cụ thể → giao cho AI dựng build script và validator → dùng AI để **phỏng vấn ngược chính bạn** (nó hỏi, bạn trả lời, nó viết thành node). Bước cuối là bước hiệu quả bất ngờ: phần lớn tri thức dự án nằm trong đầu người chứ không nằm trong file nào, và một loạt câu hỏi tốt sẽ moi ra nhanh hơn ngồi nhìn trang trắng.

Và một việc nên giao định kỳ: **soát node cũ tìm chỗ đã lỗi thời** — tự tìm phát biểu mâu thuẫn nhau giữa hai node, hoặc phát biểu nói về API đã đổi.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Ai là người đọc: agent, người mới vào dự án, hay cả hai. Quyết định độ dài và giọng văn.
- Nguồn chân lý nằm ở đâu và thứ gì được sinh ra — nếu không nói, nó sẽ sửa thẳng file tự sinh.
- Cấu trúc bắt buộc của một node (mục nào phải có) và cách validator kiểm.
- Ngôn ngữ và quy ước thuật ngữ (giữ tiếng Anh những từ nào).
- Phạm vi: node này viết cho **dự án cụ thể** hay kiến thức chung — hai thứ không nên trộn.

**Mẫu prompt**

```
Tôi đang dựng kho kiến thức cho agent đọc trước khi sinh code Unity.
Nguồn chân lý: content/**/*.md (markdown + frontmatter). Mọi thứ khác tự sinh.

Việc 1: phỏng vấn tôi để rút ra tri thức cho node "Quy ước code của dự án".
Hỏi từng câu một, tối đa 12 câu, ưu tiên những thứ mà người mới KHÔNG đoán được
và agent sẽ làm sai nếu không biết. Sau mỗi câu trả lời của tôi, hỏi tiếp câu
đào sâu nếu câu trả lời còn mơ hồ.

Việc 2 (sau khi phỏng vấn xong): viết node theo đúng khung đã có ở content/_SCHEMA.md.
Chỉ viết những gì tôi đã nói; chỗ nào tôi chưa trả lời thì để "(chưa quyết)" — KHÔNG tự điền.
```

**Bẫy thường gặp:** AI viết node nghe rất trơn nhưng toàn phát biểu chung chung — "hãy giữ code sạch và tách biệt mối quan tâm" — vì nó đang lấp chỗ trống bằng kiến thức chung khi không có tri thức dự án. Node như vậy tệ hơn không có: nó chiếm chỗ, tạo cảm giác đã ghi lại, và không đổi được hành vi của ai. Phép thử một câu: *phát biểu này có làm agent hoặc người mới làm khác đi không?* Không thì xoá.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Nội dung gì nên đưa vào kho kiến thức cho agent, và gì thì không?**
  → Nên: quyết định đã chốt kèm **vì sao**, bẫy đã làm hỏng dự án một lần kèm cách phát hiện, quy ước đặt tên và chiều phụ thuộc, đường biên cái gì agent không được chạm. Không nên: tài liệu API — agent đã biết và mình không cập nhật kịp — kiến thức chung, và ghi chú cuộc họp.
- `Junior` **Phép thử một câu để biết một mục có đáng nằm trong kho không?**
  → *Phát biểu này có làm agent hoặc người mới vào dự án làm khác đi không?* Không thì nó là trang trí, xoá. "Hãy giữ code sạch và tách biệt mối quan tâm" trượt phép thử này; "không dùng thư mục `Resources/`, dùng Addressables" thì đạt.
- `Mid` **Làm sao để AI viết code theo quy ước dự án?**
  → Đặt quy ước ở **file luật trong repo** mà agent đọc trước, viết dưới dạng luật kiểm tra được chứ không phải lời khuyên, và có validator chạy trong CI. Quy ước sống trong đầu người hoặc trong Confluence thì agent không thấy; quy ước viết mơ hồ thì agent diễn giải theo cách nó quen.
- `Mid` **Sao không để tài liệu trong Confluence hay Notion?**
  → Ba lý do. Agent đọc repo dễ hơn đọc API của công cụ khác. Tri thức đi cùng code trong cùng một PR nên **review được** — sửa luật và sửa code nằm trong một diff. Và validator chạy được trong CI. Tài liệu ở nơi khác luôn trôi khỏi code sau vài tháng, không ai cố ý làm điều đó cả.
- `Mid` **Kho kiến thức làm sao để không mục đi?**
  → Cùng lý do code không mục: nó **được dùng hằng ngày** và có cổng kiểm chạy bằng một lệnh. Thêm một việc định kỳ: cho agent soát tìm mâu thuẫn giữa các node và những phát biểu nói về API đã đổi. Kho không ai đọc thì tệ hơn không có, vì nó tạo cảm giác đã ghi lại rồi.
- `Senior` **Kể về một công cụ hoặc quy trình anh tự dựng và tác động của nó.**
  → Kho kiến thức máy đọc được làm ngữ cảnh dùng chung: markdown là nguồn chân lý duy nhất, một script build sinh mục lục phẳng cho agent và dữ liệu cho web mindmap cho người, cấu trúc suy ra từ cây thư mục. Điểm đáng nói nhất là **coi tri thức như code** — validator thoát khác 0 khi có link gãy, trùng id, hay thiếu mục bắt buộc.
- `Senior` **Tri thức của dự án anh lưu ở đâu, và ai chịu trách nhiệm?**
  → Trong repo, cùng chỗ với code, một nguồn chân lý và mọi dạng khác được **sinh ra** chứ không sửa tay. Trách nhiệm gắn với PR: ai đổi một quyết định thì sửa luôn node nói về quyết định đó trong cùng PR. Không có "người viết tài liệu" riêng — vai đó luôn là vai đầu tiên bị cắt khi dự án gấp.
- `Senior` **Lỗi im lặng trong pipeline tri thức — anh gặp loại nào và chữa ra sao?**
  → Hai lỗi thật, chung một tính chất: build vẫn xanh, nội dung âm thầm biến mất. **Code fence lẻ** làm mọi heading sau đó bị coi là code nên các mục bị tách mất. **CRLF trên Windows** làm regex neo `$` không khớp, toàn bộ mục bị rỗng trên đúng máy đó. Cách chữa chung không phải đoán trước từng lỗi mà là **in vài con số tổng hợp sau mỗi build và nhìn chúng**.
- `Senior` **Tác động của kho kiến thức đo được không?**
  → Chỗ trung thực để đo là eval: tỉ lệ nhiệm vụ xong trong một vòng, phần diff bị người sửa lại, số lần agent chạm vùng cấm — so trước và sau khi có file luật. Nếu chưa đo thì tôi nói thẳng là chưa đo và nêu cách sẽ đo; điều đó ăn điểm hơn một con số bịa ra.

**Khung trả lời 60 giây** — "Anh dùng AI trong quy trình thế nào?"

> Thay vì dán lại bối cảnh vào mỗi cuộc hội thoại, tôi dựng một **kho kiến thức máy đọc được** làm ngữ cảnh dùng chung. Markdown là nguồn chân lý duy nhất; một script build sinh ra mục lục phẳng cho agent và dữ liệu cho một web mindmap cho người. Cấu trúc suy ra từ cây thư mục, nên thêm nội dung không phải cập nhật song song ở chỗ nào khác.
>
> Điểm tôi thấy đáng nói nhất là **coi tri thức như code**: có validator chạy bằng một lệnh, thoát khác 0 khi có link gãy, trùng id, hay thiếu mục bắt buộc. Nó bắt được thứ mắt người không thấy trong chín mươi file.
>
> Và một bài học đắt: hai lần kho hỏng theo kiểu **build vẫn xanh mà nội dung âm thầm biến mất** — một lần do code fence chưa đóng, một lần do CRLF trên Windows làm regex tách mục không khớp. Không validator nào đoán trước được cả hai, nên cách chữa chung là in ra vài con số tổng hợp sau mỗi lần build và nhìn chúng: thấy `0/81 có prompt` thay vì `81/81` là biết ngay có chuyện.

**Họ sẽ đào tiếp**

- *"Sao không để tài liệu trong Confluence/Notion?"* → Vì ba lý do: agent đọc repo dễ hơn đọc API của công cụ khác; tri thức đi cùng code trong cùng một PR nên **review được**; và validator chạy được trong CI. Tài liệu ở nơi khác luôn trôi khỏi code sau vài tháng.
- *"Nội dung gì đưa vào?"* → Quyết định đã chốt kèm **vì sao**, bẫy đã làm hỏng dự án một lần, quy ước, và đường biên cái gì agent không được chạm. Không đưa tài liệu API vào — agent đã biết và bạn không cập nhật kịp. Phép thử: phát biểu này có làm ai đó làm khác đi không? Không thì là trang trí.
- *"Làm sao nó không mục đi?"* → Cùng lý do code không mục: nó **được dùng hằng ngày** và có cổng kiểm. Thêm một việc định kỳ: cho agent soát tìm mâu thuẫn giữa các node và phát biểu về API đã đổi.
- *"Tác động đo được không?"* → Chỗ trung thực để nói là [[ai-eval]]: tỉ lệ nhiệm vụ xong trong một vòng, phần diff bị sửa lại. Nếu chưa đo thì nói thẳng là chưa đo, và nêu cách sẽ đo — điều đó ăn điểm hơn một con số bịa.

**Cờ đỏ**

- Kể về công cụ mà không nói được nó **đổi hành vi** của ai, thế nào.
- Sửa tay file tự sinh (và không thấy vấn đề ở đó).
- Kho kiến thức không ai đọc: có mà không dùng thì tệ hơn không có.
- Nói "tôi viết tài liệu cho AI" mà nội dung là những câu chung chung có thể dán vào bất kỳ dự án nào.

**Số / ví dụ nên thuộc**

- Kiến trúc ba lớp: **nguồn chân lý (markdown) → dạng suy ra (index + JSON) → giao diện (web/agent)**.
- Validator bắt: trùng id, link gãy, chu trình, thiếu mục bắt buộc, fence lẻ, bản dịch mồ côi.
- Hai lỗi im lặng thật: **code fence lẻ** và **CRLF trên Windows**.
- Chữa lỗi im lặng bằng **thống kê sau mỗi build**, không chỉ bằng cảnh báo.
