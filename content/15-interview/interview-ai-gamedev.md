---
id: interview-ai-gamedev
title: Dùng AI để làm game — câu hỏi phỏng vấn
icon: 🤖
summary: Câu hỏi về việc dùng AI trong chính công việc làm game — agent viết code Unity, Unity MCP, hệ nhiều agent có vai kiểm tra, asset do AI tạo và rủi ro bản quyền với game IP, AI cho localization, test và tài liệu — cách kể kinh nghiệm thật mà không làm người phỏng vấn lo.
status: deep
read: 1150
level: intermediate
order: 50
tags: [interview, ai-dev, agent, asset, workflow]
related: [ai-interview, coding-agents, agent-guardrails, asset-generation, interview-cv]
---

Với hồ sơ có **hệ AI-agent tự dựng để làm game**, câu hỏi về AI gần như chắc chắn xuất hiện — và nó là con dao hai lưỡi. Kể đúng cách, nó là điểm khác biệt mà ít ứng viên có. Kể sai cách, người phỏng vấn nghe thành *"người này để AI viết code rồi đẩy thẳng vào dự án"*, hoặc tệ hơn với một công ty làm game hợp tác IP: *"người này sẽ đưa asset AI không rõ bản quyền vào game của chúng tôi"*.

Câu hỏi chung kiểu "anh dùng AI thế nào", "không có AI anh làm được không" đã có ở [[ai-interview]]. Node này đi vào phần **riêng của làm game**.

## Người phỏng vấn ở studio game lo điều gì

| Nỗi lo | Họ sẽ hỏi | Câu trả lời phải chạm |
|---|---|---|
| **Chất lượng code** | "Code AI viết có bug thì sao?" | Review và test như code người viết; mình chịu trách nhiệm |
| **Bảo mật** | "Anh có đưa code công ty lên AI không?" | Theo chính sách công ty, chỉ công cụ được duyệt |
| **Bản quyền asset** | "Anh có dùng hình/nhạc AI trong game không?" | Không đưa vào sản phẩm khi chưa có phê duyệt pháp lý, nhất là game IP |
| **Phụ thuộc** | "Không có AI anh còn làm được không?" | Có — AI tăng tốc phần lặp lại, phần thiết kế và debug vẫn là mình |
| **Hợp đội** | "Anh có ép cả đội dùng theo cách của anh không?" | Đề xuất thử nhỏ, đo, rồi mới mở rộng |

Với studio làm collab với IP anime, VTuber, Sanrio — **bản quyền là nỗi lo số một**. Bên giữ IP kiểm duyệt từng hình ảnh; một asset có nguồn gốc mơ hồ có thể làm hỏng cả hợp đồng collab. Nói được điều này trước khi bị hỏi là điểm cộng lớn.

## Những gì AI làm tốt và làm dở trong làm game

| Việc | AI làm | Ghi chú |
|---|---|---|
| Code lặp lại: màn hình UI theo mẫu, parse dữ liệu, editor tool | **Tốt** | Có mẫu sẵn trong dự án thì càng tốt |
| Viết test cho logic thuần | **Tốt** | Logic phải tách khỏi MonoBehaviour trước |
| Đọc và giải thích codebase lạ | **Tốt** | Kiểm lại bằng cách đọc code thật ở chỗ quan trọng |
| Dịch và hiểu spec tiếng Nhật | **Khá** | Thuật ngữ game và tên riêng phải có bảng thuật ngữ |
| Localization text trong game | **Khá** | Cần người bản ngữ duyệt, giọng nhân vật dễ lệch |
| Kiến trúc, hệ thống mới | **Trung bình** | Đưa ra phương án được, quyết định và đánh đổi là của mình |
| Debug hiệu năng | **Dở** | Không có số đo thật; phải đo bằng Profiler |
| Cảm giác chơi, cân bằng | **Dở** | Phải chơi thử và đo bằng người thật |
| API Unity mới / thay đổi theo phiên bản | **Dễ sai** | Hay trộn API cũ và mới; kiểm tài liệu phiên bản đang dùng |

Chi tiết về giới hạn ở [[ai-limits]].

## Hệ nhiều agent — cách kể cho người không dùng

Người phỏng vấn có thể chưa từng dùng agent. Kể theo **vấn đề → cách giải → bằng chứng**, không bắt đầu bằng tên công cụ:

1. **Vấn đề:** để một AI tự làm cả tính năng thì nó vừa viết vừa tự khen, lỗi lọt qua.
2. **Cách giải:** chia vai như một đội thật — một agent lập kế hoạch, agent khác viết, một agent **chỉ kiểm**, và luật cứng cấm agent sửa những thứ không được sửa (file `.meta`, GUID, bảng số dùng chung).
3. **Bằng chứng:** kể một lần agent kiểm bắt được lỗi mà agent viết bỏ qua, và một lần chính luật cứng chặn được việc phá dự án.

Bộ khung này đúng y như quy trình đội người: spec → làm → review → test. Nói ra điểm tương đồng đó giúp người nghe thấy bạn hiểu quy trình, không chỉ hiểu công cụ. Xem [[coding-agents]] và [[agent-guardrails]].

## Rào chắn khi để AI chạm vào dự án Unity

| Rủi ro | Rào chắn |
|---|---|
| AI tạo lại file `.meta` → GUID đổi → mọi tham chiếu vỡ | Luật cứng: không tự viết `.meta`; Unity tự sinh khi import |
| Sửa scene/prefab YAML bằng tay → hỏng tham chiếu | Sửa qua Editor (Unity MCP, script Editor) thay vì sửa text |
| Đổi bảng số cân bằng dùng chung | Bảng số chỉ người duyệt mới sửa; agent đề xuất, không ghi |
| Tự thêm package/thư viện | Cấm thêm dependency khi chưa hỏi |
| Code chạy trong Editor nhưng hỏng trên build | Agent kiểm phải build thử, không chỉ chạy Editor |
| Báo "xong" khi chưa chạy kiểm tra | Định nghĩa "xong" bằng lệnh kiểm tra cụ thể phải pass |

## Asset do AI tạo

| Loại | Dùng được ở đâu | Không nên |
|---|---|---|
| Hình placeholder, concept thử nghiệm | Prototype nội bộ, pitch | Đưa vào bản phát hành không qua artist và pháp lý |
| Icon, UI tạm | Bản test | Game IP collab — bên giữ IP duyệt từng hình |
| Giọng đọc, nhạc thử | Prototype | Nhân vật có seiyuu thật, nhạc có bản quyền |
| Video quảng bá | Kênh riêng, thử nghiệm | Quảng cáo chính thức khi chưa rõ điều khoản công cụ |

Kinh nghiệm thật nên kể: dùng AI để làm nội dung cho **kênh và game riêng** (nơi bạn tự chịu rủi ro), và hiểu vì sao studio có quy trình chặt hơn. Xem [[asset-generation]].

## 🤖 Prompt cho AI

**Dùng AI thế nào để luyện câu về AI làm game**

Dùng AI đóng vai **người hoài nghi**: một lead kỹ thuật lâu năm chưa tin AI, hoặc người phụ trách pháp lý của dự án collab IP. Hai vai này hỏi đúng những câu làm bạn lúng túng nhất. Đừng để AI đóng vai người hâm mộ AI — câu trả lời của bạn sẽ được khen mà không ai thử thách.

**Phải nêu rõ**
- Hệ thống AI bạn đã dựng thật: vai các agent, luật chặn, công cụ (Claude Code, Unity MCP…).
- Một lần AI làm sai và cách bạn bắt được — câu chuyện quan trọng nhất.
- Loại công ty: studio game làm collab IP thì nỗi lo bản quyền đứng đầu.
- Yêu cầu AI hỏi câu khó về bảo mật, bản quyền, trách nhiệm.

**Mẫu prompt**

```
Đóng vai lead kỹ thuật 15 năm kinh nghiệm ở một studio game mobile Nhật,
HOÀI NGHI về AI. Tôi ứng tuyển Unity developer và có kinh nghiệm dựng hệ
nhiều agent (planner/worker/tester) để làm game bằng Claude Code.
- Hỏi TỪNG câu, chờ tôi trả lời.
- Đào vào: chất lượng code, bảo mật code công ty, bản quyền asset AI trong
  game collab IP, trách nhiệm khi có bug, phụ thuộc vào công cụ.
- Sau mỗi câu, nói thẳng câu trả lời nào làm anh LO hơn thay vì yên tâm hơn.
Làm 8 câu.
```

**Bẫy thường gặp:** AI khuyến khích bạn khoe "AI làm được 80% công việc" — với người phỏng vấn hoài nghi, câu đó nghe thành "người này không tự làm". Bẫy thứ hai: AI bỏ qua chuyện bản quyền asset vì nó không biết công ty làm collab IP — tự nêu bối cảnh đó. Bẫy thứ ba: AI bịa số "nhanh hơn 3 lần" — chỉ nói số bạn tự đo, hoặc nói định tính kèm ví dụ cụ thể.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Anh dùng AI vào những việc gì khi làm game?**
  → Kể việc cụ thể: viết công cụ Editor, code màn hình UI theo mẫu có sẵn, viết test cho logic thuần, đọc nhanh codebase lạ, và hiểu spec tiếng Nhật. Nói thêm việc không giao cho AI: debug hiệu năng phải đo bằng Profiler, cảm giác chơi phải chơi thử. Danh sách có cả "không" làm câu trả lời đáng tin hơn.
- `Junior` **Anh dùng công cụ AI nào?**
  → Nêu tên công cụ thật đã dùng (Claude Code, Cursor, Unity MCP) và vì sao chọn: agent chạy được lệnh, đọc được cả dự án, điều khiển được Editor. Nói thêm là công cụ thay đổi rất nhanh, nên thứ giữ lại được là quy trình, không phải công cụ.
- `Junior` **AI có làm anh lười suy nghĩ không?**
  → Có nguy cơ, nên tôi giữ phần thiết kế và quyết định cho mình: tự viết spec và tiêu chí xong trước khi giao, và tự review mọi thay đổi. Việc đáng giao cho AI là việc tôi biết cách làm nhưng tốn thời gian, không phải việc tôi chưa hiểu.
- `Mid` **Hệ AI-agent của anh hoạt động thế nào?**
  → Chia vai như một đội: agent lập kế hoạch viết spec, agent làm việc sửa code, agent kiểm chỉ chạy kiểm tra và báo lỗi, và một bộ luật cứng mọi agent phải theo. Có bộ nhớ dài hạn để không lặp lại sai lầm cũ, và kho asset dùng chung giữ nguyên GUID. Điểm mấu chốt là agent viết không được tự chấm bài của mình.
- `Mid` **Vì sao cần agent kiểm riêng, một agent làm hết không được sao?**
  → Một agent vừa viết vừa kiểm thì có xu hướng xác nhận chính nó đúng, giống người tự review code của mình. Tách vai kiểm với tiêu chí rõ ràng bắt được lỗi mà agent viết bỏ qua. Đây chính là lý do đội người có code review và QA.
- `Mid` **Kể một lần AI làm sai và anh bắt được.**
  → Chọn một lỗi thật, có hậu quả nếu lọt: ví dụ AI tự sinh lại file `.meta` làm đổi GUID và vỡ tham chiếu, hoặc dùng API Unity của phiên bản cũ. Kể cách phát hiện (kiểm tra tự động, đọc diff, build thử) và luật đã thêm sau đó để chặn vĩnh viễn. Người hỏi muốn thấy bạn có hệ thống chặn lỗi, không phải may mắn.
- `Mid` **Để AI chạm vào dự án Unity thì có những rủi ro gì riêng?**
  → File `.meta` và GUID: AI sinh lại là mọi tham chiếu vỡ. Scene và prefab YAML: sửa text tay dễ hỏng, nên sửa qua Editor. Code chạy trong Editor nhưng hỏng khi build IL2CPP. Vì vậy tôi đặt luật cứng và bắt agent kiểm phải build thử, không chỉ chạy Editor.
- `Mid` **Unity MCP là gì, anh dùng nó làm gì?**
  → Là cầu nối cho agent AI điều khiển Unity Editor đang chạy: tạo GameObject, sửa component, chạy script Editor, đọc log, thay vì sửa file scene bằng tay. Tôi dùng nó để agent thao tác đúng cách Unity muốn, giữ tham chiếu an toàn. Nó vẫn cần giới hạn quyền, vì một lệnh sai trên scene là phá việc của người khác.
- `Mid` **Code AI viết có bug lên production thì ai chịu trách nhiệm?**
  → Người đưa code vào, tức là tôi. Code AI viết đi qua đúng quy trình như code người viết: review, test, QA. Nói "do AI viết" không phải lời giải thích chấp nhận được, nên tôi không merge thứ tôi chưa hiểu.
- `Mid` **Anh có đưa code của công ty lên công cụ AI không?**
  → Chỉ khi chính sách công ty cho phép và chỉ với công cụ được duyệt. Khi chưa rõ thì tôi hỏi trước. Với dự án riêng thì tôi tự quyết, nhưng ở công ty, code và tài liệu thuộc về công ty và đối tác — nhất là đối tác Nhật rất nghiêm về bảo mật thông tin.
- `Mid` **Anh dùng AI để đọc spec tiếng Nhật thế nào cho chính xác?**
  → Cho AI dịch kèm bảng thuật ngữ của dự án để tên riêng, tên hệ thống dịch nhất quán. Những chỗ ảnh hưởng tới logic — điều kiện, con số, ngoại lệ — tôi xác nhận lại với planner bằng chữ thay vì tin bản dịch. AI hiểu câu tốt nhưng dễ sai ở ngữ cảnh game và cách viết tắt nội bộ.
- `Mid` **AI có dùng được cho localization text trong game không?**
  → Làm bản nháp nhanh được, nhất là với số lượng text lớn, nhưng phải có người bản ngữ duyệt. Giọng nhân vật, cách xưng hô và chơi chữ rất dễ lệch, và với game IP thì bên giữ IP còn duyệt lời thoại. Phía kỹ thuật tôi lo chuỗi có tham số, độ dài text tràn khung và font đủ ký tự.
- `Mid` **Anh có dùng hình ảnh hay âm thanh do AI tạo trong game không?**
  → Trong game và kênh riêng của tôi thì có, cho placeholder, thử ý tưởng và video quảng bá, vì tôi tự chịu rủi ro. Ở studio, đặc biệt với game collab IP, tôi không đưa asset AI vào bản phát hành khi chưa có phê duyệt của artist và bộ phận pháp lý. Bên giữ IP duyệt từng hình ảnh, và asset có nguồn gốc mơ hồ có thể làm hỏng hợp đồng.
- `Mid` **AI giúp anh viết test thế nào?**
  → Tôi đưa logic đã tách khỏi MonoBehaviour và mô tả trường hợp biên, AI viết bản nháp test EditMode, tôi đọc lại và thêm các trường hợp nó bỏ sót. Test do AI viết hay chỉ kiểm đường đi đẹp, nên phần tôi thêm thường là trường hợp biên và dữ liệu sai. Test phải chạy và fail đúng khi tôi cố tình làm sai code.
- `Mid` **Anh viết prompt thế nào để AI làm đúng việc?**
  → Như giao việc cho một người mới giỏi nhưng chưa biết dự án: mục tiêu, file liên quan, ràng buộc không được vi phạm, và định nghĩa "xong" bằng lệnh kiểm tra cụ thể. Prompt mơ hồ cho ra code generic; ràng buộc rõ cho ra code khớp dự án. Xem [[context-engineering]].
- `Mid` **Làm sao để AI hiểu dự án game của anh?**
  → Viết tài liệu cho agent đọc trước: kiến trúc, quy ước, luật cứng, và mục lục để nó mở đúng file thay vì đọc hết. Kho kiến thức này cũng được dựng theo cách đó — có mục lục tự sinh cho AI. Tài liệu tốt cho AI cũng là tài liệu tốt cho người mới vào đội. Xem [[knowledge-base-for-agents]].
- `Senior` **Theo anh AI thay đổi công việc của Unity developer thế nào?**
  → Phần gõ code lặp lại nhanh hơn rõ rệt, nên giá trị dịch về phía hiểu hệ thống, thiết kế, review, debug và cảm quan sản phẩm. Developer giỏi là người giao việc rõ và kiểm kết quả tốt — đúng kỹ năng của senior. Tôi không nghĩ AI thay được người hiểu vì sao game giật trên một dòng máy cụ thể.
- `Senior` **Nếu đội muốn bắt đầu dùng AI, anh đề xuất thế nào?**
  → Bắt đầu nhỏ ở việc rủi ro thấp: công cụ Editor, test, script build. Thống nhất luật chung (không đưa dữ liệu nhạy cảm, mọi code qua review), đo trước và sau trên vài task cụ thể, rồi mới mở rộng. Không ép cả đội đổi cách làm trong một ngày.
- `Senior` **Làm sao đo được AI có thật sự giúp đội không?**
  → So những thứ đo được trên các task tương đương: thời gian hoàn thành, số lỗi bị review và QA bắt, số bug lọt ra sau phát hành. Nếu nhanh hơn mà bug lọt nhiều hơn thì không phải cải thiện. Cảm giác "nhanh hơn" của người dùng không phải số đo. Xem [[ai-eval]].
- `Senior` **AI agent có nên được quyền commit và push không?**
  → Commit lên nhánh riêng thì được, vì mọi thay đổi vẫn qua pull request và review. Push lên nhánh chính, sửa cấu hình build hay dữ liệu dùng chung thì không, phải qua người duyệt. Quyền của agent nên giống người mới vào đội, không giống lead.
- `Senior` **Anh nghĩ gì về NPC dùng LLM trong game?**
  → Hấp dẫn cho hội thoại mở nhưng nhiều rủi ro: chi phí mỗi lượt gọi, độ trễ, nội dung không kiểm soát được, và với game IP thì nhân vật nói sai tính cách là vấn đề với bên giữ IP. Tôi sẽ thử trong phạm vi hẹp có rào chắn chặt trước khi đưa vào sản phẩm. Xem [[llm-npc]].
- `Senior` **AI có thể giúp gì cho live-ops của game RPG gacha?**
  → Tạo và kiểm master data cho event theo mẫu, phát hiện cấu hình sai (ngày giờ, tỉ lệ, phần thưởng) trước khi phát hành, tóm tắt phản hồi người chơi, nháp văn bản thông báo. Mọi thứ chạm tới tỉ lệ gacha và tiền vẫn phải người kiểm, vì sai ở đó là vấn đề pháp lý và niềm tin người chơi.
- `Senior` **Nếu công ty cấm dùng AI, anh có làm được không?**
  → Được — tôi làm Unity mười năm, phần lớn thời gian đó chưa có công cụ AI như bây giờ. AI tăng tốc phần lặp lại, còn phần hiểu hệ thống, thiết kế và debug là kỹ năng của tôi. Tôi tôn trọng chính sách của công ty và có thể đề xuất thử nghiệm có kiểm soát nếu thấy phù hợp.

**Khung trả lời 60 giây** — "Anh dùng AI để làm game thế nào?"

> Tôi dùng AI như một thành viên đội cần được giao việc rõ và được kiểm. Ở dự án riêng, tôi dựng một hệ nhiều agent bằng Claude Code: một agent lập kế hoạch, agent khác viết code, một agent chỉ làm kiểm tra, và một bộ luật cứng — ví dụ không bao giờ được tự sinh file `.meta`, vì đổi GUID là vỡ cả dự án Unity.
>
> AI giúp tôi nhanh ở phần lặp lại: công cụ Editor, màn hình UI theo mẫu, test cho logic thuần. Phần đo hiệu năng, thiết kế hệ thống và cảm giác chơi thì tôi tự làm, vì AI không có số đo thật và không cầm máy chơi thử.
>
> Ở công ty, tôi theo chính sách bảo mật, không đưa code lên công cụ chưa được duyệt, và không đưa asset AI vào game khi chưa có phê duyệt pháp lý — nhất là với game hợp tác IP.

**Họ sẽ đào tiếp**

- *"Agent kiểm của anh kiểm cái gì cụ thể?"* → Chạy lệnh kiểm tra định nghĩa sẵn (build, test, validate dữ liệu), đọc diff so với spec, và báo lỗi chứ không tự sửa.
- *"Một lần agent làm hỏng dự án là thế nào?"* → Kể sự cố thật, hậu quả, cách phát hiện, và luật đã thêm sau đó.
- *"Bao nhiêu phần trăm code của anh do AI viết?"* → Không nói con số ước lượng; nói loại việc giao cho AI và loại việc không giao.
- *"Anh xử lý bản quyền asset AI thế nào trong game riêng?"* → Đọc điều khoản của công cụ, dùng cho phần mình chịu rủi ro được, và biết ở studio thì quy trình chặt hơn nhiều.
- *"AI có hiểu sai spec tiếng Nhật không?"* → Có, nhất là viết tắt nội bộ và ngữ cảnh game; chỗ chạm logic phải xác nhận bằng chữ với planner.
- *"Anh có dạy đồng nghiệp dùng AI không?"* → Chia sẻ mẫu prompt và luật chặn, cho thử ở việc rủi ro thấp, không ép.
- *"Chi phí công cụ AI ai trả?"* → Ở công ty là quyết định của công ty; tôi có thể đưa số đo lợi ích để họ cân nhắc.

**Cờ đỏ**

- "AI làm 80% công việc của tôi."
- Không kể được lần nào AI làm sai — nghe như chưa kiểm bao giờ.
- Đã dán code hoặc tài liệu của công ty cũ lên công cụ AI mà không có phép.
- Coi asset AI dùng thoải mái trong sản phẩm thương mại, kể cả game IP.
- "Do AI viết" khi nói về bug của mình.
- Chỉ nói tên công cụ, không nói quy trình và rào chắn.
- Chê người không dùng AI là lạc hậu.

**Số / ví dụ nên thuộc**

- Bốn vai agent: **lập kế hoạch · làm · kiểm · audit** — agent viết **không** tự chấm.
- Luật cứng Unity: **không tự sinh `.meta`**, sửa scene/prefab **qua Editor**, kiểm phải **build thử**.
- AI tốt ở: **công cụ Editor · UI theo mẫu · test logic thuần · đọc codebase**.
- AI dở ở: **đo hiệu năng · cảm giác chơi · API theo phiên bản**.
- Asset AI: **prototype/kênh riêng — được**; **bản phát hành game IP — chỉ khi pháp lý duyệt**.
- Trách nhiệm: code AI viết **qua review + test như code người**, người merge chịu trách nhiệm.
