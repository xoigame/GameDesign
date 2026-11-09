---
id: interview-situations
title: Vòng 3 — Xử lý công việc và tình huống
icon: 🧩
summary: Vòng hỏi "nếu… thì anh làm gì": deadline không kịp, bug nóng trên production, spec mơ hồ, bất đồng với đồng nghiệp, việc bị giao chồng. Khung trả lời bốn bước và mười tình huống hay gặp ở studio game làm với đối tác Nhật.
status: deep
read: 1130
level: intermediate
order: 30
tags: [interview, teamwork, process, communication, incident]
related: [interview, project-teamwork, lead-crisis, lead-upward, lead-estimation]
---

Vòng 3 không có đáp án đúng về kỹ thuật. Người hỏi — thường là PM hoặc lead — đang hình dung **ngồi cạnh bạn sáu tháng** sẽ thế nào: bạn có báo sớm khi trễ không, có tự ý sửa spec không, có đổ lỗi không, có biết lúc nào phải hỏi.

Với studio làm cùng đối tác Nhật, ba giá trị được chấm nặng nhất: **báo cáo sớm** (報連相 — hōrensō: báo cáo, liên lạc, bàn bạc), **không bất ngờ**, và **giữ chất lượng** dù gấp.

## Khung trả lời bốn bước

| Bước | Làm gì | Câu mẫu |
|---|---|---|
| **1. Làm rõ** | Hỏi lại một hai điều kiện then chốt | "Bug này ảnh hưởng bao nhiêu người chơi, có dính tới tiền không?" |
| **2. Ưu tiên** | Nói cái gì làm trước và **vì sao** | "Chặn thiệt hại trước, tìm nguyên nhân sau." |
| **3. Hành động + báo** | Việc cụ thể, và báo cho **ai, lúc nào** | "Tôi báo lead ngay khi xác nhận, kèm ước lượng." |
| **4. Phòng lặp lại** | Thứ để lại sau sự việc | "Thêm checklist / test / cảnh báo để lần sau bắt sớm." |

Thiếu bước 1 thì nghe như hấp tấp. Thiếu bước 3 phần "báo" thì nghe như làm một mình. Thiếu bước 4 thì nghe như junior. Nhiều tình huống không cần đủ bốn bước dài — nhưng phải chạm cả bốn.

## Mười tình huống hay gặp

| # | Tình huống | Ý chính phải nói |
|---|---|---|
| 1 | Task ước 3 ngày, ngày 2 thấy cần 6 ngày | Báo **ngay hôm đó**, kèm phương án cắt phạm vi hoặc lùi hạn — không im đến hạn |
| 2 | Bug crash trên production lúc event đang chạy | Đánh giá ảnh hưởng → chặn (tắt tính năng bằng cờ server, hotfix) → nguyên nhân gốc → postmortem |
| 3 | Spec mơ hồ, planner đang nghỉ | Ghi giả định ra chữ, làm phần không phụ thuộc trước, hỏi bằng tin nhắn có đánh số |
| 4 | Không đồng ý cách làm của lead | Nói riêng, đưa dữ liệu, đề xuất thử nhỏ; lead chốt thì làm theo và ghi lại lo ngại |
| 5 | Code review thấy đồng nghiệp viết có vấn đề lớn | Bình luận vào code, không vào người; việc lớn thì nói trực tiếp, đề xuất cùng sửa |
| 6 | Hai người cùng giao việc gấp | Không tự chọn — đưa cả hai lên người có quyền ưu tiên, kèm ước lượng mỗi việc |
| 7 | Phát hiện bug do chính mình gây ra đã lên store | Nhận ngay, báo, sửa, và nói cách ngăn — giấu là lỗi nặng hơn bug |
| 8 | Được giao công nghệ chưa biết (vd Cocos) | Ước lượng thời gian học, làm prototype nhỏ trước, báo rủi ro sớm |
| 9 | Artist/designer đưa asset sai chuẩn làm game nặng | Đưa số đo, đề xuất chuẩn (kích thước, nén), làm công cụ kiểm tự động |
| 10 | Deadline sát, chất lượng chưa đạt | Đưa lựa chọn rõ ràng (ra đúng hạn bớt tính năng / lùi hạn / ra có lỗi đã biết) cho người quyết định — không tự hạ chất lượng âm thầm |

Mô hình sự cố và báo lên trên chi tiết hơn ở [[lead-crisis]] và [[lead-upward]]; ước lượng và báo trễ ở [[lead-estimation]].

## Làm việc với đội Nhật — năm điều người hỏi ngầm chấm

| Khái niệm | Nghĩa trong công việc | Câu trả lời thể hiện nó |
|---|---|---|
| **報告 hōkoku** (báo cáo) | Báo kết quả và tiến độ **trước khi được hỏi** | "Cuối ngày tôi gửi tình trạng, kể cả khi không có gì mới" |
| **連絡 renraku** (liên lạc) | Báo sự thay đổi ngay khi biết | "Spec đổi thì tôi báo người liên quan trong ngày" |
| **相談 sōdan** (bàn bạc) | Hỏi ý **trước** khi quyết điều ngoài quyền của mình | "Tôi đề xuất hai phương án và xin lead chốt" |
| **根回し nemawashi** | Trao đổi riêng trước cuộc họp để không ai bất ngờ | "Tôi nói riêng với lead trước khi đưa vấn đề ra họp" |
| **報告は結論から** | Báo cáo **kết luận trước**, chi tiết sau | Mở đầu tin nhắn bằng "Trễ 2 ngày" chứ không phải bằng quá trình |

Không cần dùng thuật ngữ tiếng Nhật trong buổi phỏng vấn — nhưng câu trả lời phải **thể hiện** được những điều này.

## Mẫu tin nhắn báo cáo — kết luận trước

Rất nhiều câu vòng 3 thực chất là hỏi "anh sẽ báo thế nào". Có sẵn một mẫu thì trả lời trôi chảy:

```
[Kết luận]   Task X dự kiến trễ 2 ngày (hạn cũ thứ 4 → thứ 6).
[Lý do]      API phía server trả dữ liệu khác spec, cần chờ xác nhận.
[Ảnh hưởng]  Màn hình Y chưa test được; các task khác không bị ảnh hưởng.
[Phương án]  A) Làm trước với dữ liệu giả, ghép khi server sửa — giữ hạn thứ 5.
             B) Chờ server sửa xong — hạn thứ 6.
[Đề xuất]    Tôi chọn A. Xin anh/chị chốt trước 15h hôm nay.
```

Năm dòng, đọc trong 20 giây, người nhận quyết được ngay. So với một tin nhắn kể quá trình ba đoạn rồi mới tới "nên chắc sẽ trễ".

## Ước lượng — câu hỏi hay đi kèm vòng 3

| Câu họ hỏi | Ý phải có |
|---|---|
| "Anh ước lượng thế nào?" | Chia nhỏ task tới mức nửa ngày–một ngày, cộng phần tích hợp, test máy thật, review |
| "Có cộng dự phòng không?" | Có, và nói rõ cộng cho rủi ro nào, không phải nhân đôi cho chắc |
| "Ước sai thì sao?" | Báo sớm, ghi lại nguyên nhân để lần sau ước sát hơn |

Chi tiết ở [[lead-estimation]].

## Postmortem không đổ lỗi — khung năm mục

1. **Dòng thời gian**: lúc nào phát hiện, ai làm gì, lúc nào hết ảnh hưởng.
2. **Ảnh hưởng**: bao nhiêu người chơi, bao lâu, có dính tiền không.
3. **Nguyên nhân gốc**: hỏi "vì sao" tới khi chạm tới quy trình, không dừng ở một người.
4. **Vì sao không bắt được sớm**: review, test, giám sát thiếu ở đâu.
5. **Việc phòng lặp lại**: mỗi việc có người phụ trách và hạn.

## 🤖 Prompt cho AI

**Dùng AI thế nào để luyện vòng tình huống**

Cho AI đóng vai PM người Nhật hoặc lead, đưa từng tình huống **có chi tiết gây áp lực** (đang 11 giờ đêm, event còn 2 tiếng, khách hàng đang hỏi) rồi chấm theo khung bốn bước. Tình huống chung chung cho ra câu trả lời chung chung; chi tiết mới làm lộ phản xạ thật.

**Phải nêu rõ**
- Bối cảnh studio: làm với đối tác/NPH Nhật, game live-service, quy mô đội.
- Vai của bạn (developer, không phải lead) — câu trả lời đúng khác nhau theo quyền hạn.
- Tiêu chí chấm: làm rõ / ưu tiên / hành động + báo cho ai / phòng lặp lại.
- Yêu cầu AI **thêm một biến cố** sau câu trả lời đầu ("lead không trả lời tin nhắn thì sao?").

**Mẫu prompt**

```
Đóng vai PM của một studio game Việt Nam làm game RPG live-service cho đối tác Nhật.
Tôi ứng tuyển Unity developer. Đây là vòng "xử lý tình huống".
- Đưa TỪNG tình huống một, có chi tiết cụ thể (giờ, số người chơi bị ảnh hưởng,
  ai đang vắng). Dừng chờ tôi trả lời.
- Chấm theo 4 bước: làm rõ / ưu tiên có lý do / hành động + báo cho ai lúc nào /
  phòng lặp lại. Chỉ ra bước tôi bỏ sót.
- Sau đó thêm MỘT biến cố làm tình huống khó hơn và hỏi tiếp.
Làm 6 tình huống, cuối buổi nói phản xạ xấu nhất của tôi.
```

**Bẫy thường gặp:** AI chấp nhận câu trả lời "anh hùng" — "tôi thức xuyên đêm sửa xong" — trong khi người phỏng vấn Nhật nghe thành "không báo cáo, không biết giới hạn". Bẫy thứ hai: AI đưa tình huống không có xung đột thật nên câu nào trả lời cũng đúng. Bẫy thứ ba: luyện bằng chữ mà không nói ra — vòng này chấm giọng điệu, phải đọc to.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Task anh ước 3 ngày, sang ngày 2 anh thấy cần 6 ngày. Anh làm gì?**
  → Báo lead ngay trong ngày đó, không chờ đến hạn, vì báo sớm thì đội còn lựa chọn còn báo muộn thì chỉ còn trễ. Tôi báo kèm lý do cụ thể (chỗ nào khó hơn dự kiến) và hai phương án: cắt bớt phạm vi để kịp hạn, hoặc lùi hạn bao nhiêu. Sau đó ghi lại vì sao ước lượng sai để lần sau ước sát hơn.
- `Mid` **Game crash hàng loạt ngay khi event mở. Anh làm gì?**
  → Việc đầu tiên là đo ảnh hưởng: bao nhiêu người, máy nào, có dính giao dịch tiền không. Rồi chặn thiệt hại bằng cách nhanh nhất có sẵn — tắt tính năng bằng cờ server, rollback dữ liệu event, hoặc hotfix — và báo lead/PM liên tục theo mốc. Khi ổn mới tìm nguyên nhân gốc, viết postmortem không đổ lỗi, và thêm kiểm tra để lần sau bắt trước khi lên production.
- `Mid` **Spec ghi không rõ, planner đang nghỉ phép. Anh làm gì?**
  → Không đoán rồi làm ngầm. Tôi ghi giả định của mình ra chữ, gửi cho planner và lead dưới dạng câu hỏi đánh số, và làm trước những phần không phụ thuộc vào chỗ mơ hồ. Nếu buộc phải chọn để kịp tiến độ thì chọn phương án dễ đổi lại nhất và đánh dấu rõ trong code lẫn task.
- `Mid` **Anh không đồng ý với cách làm lead đã chọn. Anh xử lý thế nào?**
  → Nói riêng với lead, không nói trong họp đông người, và nói bằng dữ liệu: rủi ro cụ thể, số đo, hoặc một prototype nhỏ. Nếu lead vẫn chốt cách cũ thì tôi làm theo hết sức, vì lead chịu trách nhiệm quyết định, và ghi lại lo ngại của mình để sau này cả đội nhìn lại được. Không làm ngầm theo cách của mình.
- `Mid` **Hai người cùng giao cho anh hai việc gấp. Anh chọn việc nào?**
  → Tôi không tự chọn, vì ưu tiên giữa hai việc là quyết định của người có quyền điều phối. Tôi báo cả hai người và lead: hai việc, ước lượng mỗi việc, làm song song thì cả hai trễ bao lâu, và xin người có quyền chốt thứ tự. Trong lúc chờ, tôi làm phần nhỏ chắc chắn cần của việc có ảnh hưởng lớn hơn.
- `Mid` **Anh phát hiện bug do chính anh gây ra đã lên store. Anh làm gì?**
  → Báo ngay và nói rõ đó là lỗi của tôi, vì người khác cần biết để đánh giá ảnh hưởng và giấu chỉ làm thiệt hại lớn thêm. Đưa kèm mức độ ảnh hưởng và phương án sửa, làm hotfix nếu được duyệt. Sau đó tìm vì sao review và test không bắt được, và thêm đúng kiểm tra còn thiếu.
- `Mid` **Đồng nghiệp gửi code có vấn đề lớn để anh review. Anh làm gì?**
  → Bình luận vào code chứ không vào người, mỗi bình luận nói rõ vấn đề, vì sao, và gợi ý sửa. Nếu vấn đề lớn tới mức phải viết lại thì tôi nói trực tiếp thay vì để hàng chục bình luận, và đề xuất ngồi cùng sửa. Mục tiêu là code tốt lên và người đó học được, không phải thắng cuộc tranh luận.
- `Senior` **Deadline còn 2 ngày, tính năng chưa đạt chất lượng. Anh làm gì?**
  → Đưa lựa chọn rõ ràng lên người quyết định: ra đúng hạn nhưng bớt phần chưa ổn, lùi hạn bao nhiêu để làm đủ, hoặc ra kèm danh sách lỗi đã biết và kế hoạch vá. Tôi không tự hạ chất lượng âm thầm, vì người chịu hậu quả với khách hàng là cả công ty. Với đối tác Nhật, báo trước một vấn đề luôn tốt hơn để họ tự phát hiện.
- `Senior` **Asset của artist làm game nặng, nhưng artist không muốn đổi. Anh làm gì?**
  → Đưa số đo thay vì ý kiến: texture này chiếm bao nhiêu MB, màn này tụt bao nhiêu fps trên máy tầm trung. Đề xuất một chuẩn chung (kích thước, định dạng nén, atlas) và cùng artist thử bản nhẹ hơn để so chất lượng hình. Lâu dài thì làm công cụ kiểm tự động lúc import để không ai phải cãi lại chuyện này.
- `Senior` **Anh được giao làm phần dùng công nghệ anh chưa từng dùng. Anh làm gì?**
  → Nói thật mức hiểu biết hiện tại, rồi đề xuất kế hoạch: một hai ngày làm prototype nhỏ để học và đo rủi ro, sau đó mới ước lượng chính thức. Báo sớm nếu prototype lộ ra vấn đề lớn. Đó là cách tôi sẽ làm nếu được giao Cocos Creator ở đây — xem [[interview-cocos]].
- `Junior` **Anh được giao task nhưng không hiểu yêu cầu. Anh hỏi lúc nào?**
  → Hỏi sớm, ngay sau khi đọc kỹ spec và tự tìm trong tài liệu, vì hỏi ngày đầu rẻ hơn làm sai ba ngày. Tôi gom câu hỏi thành danh sách đánh số, kèm cách mình đang hiểu, để người trả lời chỉ cần xác nhận đúng hay sai. Hỏi một câu mỗi lần rải rác cả ngày làm phiền người khác hơn.
- `Junior` **Anh làm xong task sớm hơn dự kiến. Anh làm gì tiếp?**
  → Báo ngay để lead điều phối lại, vì thời gian dư cũng là thông tin kế hoạch cần. Trong lúc chờ, tôi tự kiểm lại phần vừa làm trên máy thật, viết thêm test, hoặc nhận bug nhỏ trong backlog. Không âm thầm "đánh bóng" thêm tính năng ngoài spec.
- `Junior` **QA báo một bug mà anh không tái hiện được. Anh làm gì?**
  → Hỏi QA đủ điều kiện: máy, phiên bản build, tài khoản, các bước, có video không. Thử đúng môi trường đó, thêm log quanh chỗ nghi ngờ để lần sau xảy ra thì có dữ liệu. Không đóng bug với lý do "không tái hiện được" khi chưa thử hết, vì người chơi thật sẽ gặp lại nó.
- `Mid` **Lead giao một cách làm mà anh thấy sẽ gây vấn đề hiệu năng. Anh làm gì?**
  → Đo trước khi cãi: làm nhanh một bản thử, chạy Profiler trên máy tầm trung, đưa số cho lead. Đề xuất cách khác kèm cái giá của nó. Nếu lead vẫn chọn cách cũ vì lý do tiến độ, tôi làm theo và ghi rõ rủi ro trong task để sau này có cơ sở quay lại.
- `Mid` **Server đổi API mà không báo, client hỏng ngay trước bản build. Anh làm gì?**
  → Báo ngay cho lead và đội server, kèm request/response cụ thể đang lỗi, vì cần người có quyền quyết định giữ build hay lùi lại. Trong lúc chờ, tìm cách tạm an toàn: giữ phiên bản API cũ nếu server còn hỗ trợ, hoặc chặn tính năng đó. Sau sự việc đề xuất thống nhất contract chung (ví dụ file `.proto`) và báo trước khi đổi.
- `Mid` **Planner yêu cầu thêm tính năng giữa sprint. Anh xử lý thế nào?**
  → Không từ chối, cũng không nhận ngay. Tôi ước lượng tính năng mới, nói rõ sẽ đẩy lùi việc gì, và đưa cho lead hoặc PM quyết thứ tự ưu tiên. Nếu nhỏ và không ảnh hưởng gì thì vẫn báo để mọi người biết phạm vi đã đổi.
- `Mid` **Một đồng nghiệp liên tục trễ phần việc mà anh đang chờ. Anh làm gì?**
  → Nói chuyện riêng trước, hỏi họ đang vướng gì và mình giúp được không — nhiều khi họ bị chặn bởi thứ khác. Thống nhất mốc cụ thể và phần mình có thể làm trước với dữ liệu giả. Nếu vẫn ảnh hưởng tiến độ chung thì báo lead dưới dạng rủi ro của dự án, không dưới dạng phàn nàn về người.
- `Mid` **Anh nhận ra bug ở code của người khác đã nghỉ việc. Anh làm gì?**
  → Sửa như code của mình, không đổ lỗi người cũ. Trước khi sửa, đọc lịch sử commit và task để hiểu vì sao họ viết như vậy, vì có thể có ràng buộc mình chưa biết. Thêm test hoặc ghi chú để người sau không gặp lại.
- `Mid` **Anh phát hiện một lỗ hổng cho phép người chơi gian lận tiền trong game. Anh làm gì?**
  → Báo ngay cho lead và đội server qua kênh riêng, không công khai trong nhóm chat lớn, vì lỗ hổng lộ ra trước khi vá sẽ bị khai thác. Đánh giá đã có ai khai thác chưa qua log. Bản vá chuẩn là chặn ở server, vì client luôn bị coi là không đáng tin.
- `Mid` **Bản build sắp nộp store thì phát hiện một bug nhỏ về hiển thị. Anh làm gì?**
  → Báo cho người quyết định cùng đánh giá: ảnh hưởng tới bao nhiêu người, có làm hỏng trải nghiệm hay chỉ khó chịu, sửa mất bao lâu và có rủi ro gây lỗi khác không. Bug nhỏ có thể ra kèm và vá ở bản sau, còn bug chạm tới tiền hoặc dữ liệu thì không. Tôi không tự sửa lén sát giờ nộp mà không có test.
- `Senior` **Khách hàng Nhật phản hồi gắt về chất lượng một bản build. Anh xử lý thế nào?**
  → Nhận phản hồi trước, không giải thích ngay. Phân loại từng điểm: lỗi thật, hiểu khác spec, hay mong đợi chưa được viết ra. Trả lời bằng kế hoạch cụ thể: sửa gì, khi nào, và thay đổi quy trình gì để không lặp lại — với đối tác Nhật, cam kết phòng lặp lại quan trọng ngang bản sửa.
- `Senior` **Đội đang áp lực, mọi người làm thêm giờ liên tục. Anh làm gì?**
  → Làm phần của mình cho xong và chắc, rồi đưa dữ liệu lên lead: khối lượng còn lại, tốc độ thực tế, ngày về đích thật. Đề xuất cắt phạm vi thay vì kéo dài làm thêm giờ, vì làm mệt kéo dài sinh bug và bug lại tạo thêm việc. Quyết định cắt gì là của người phụ trách sản phẩm.
- `Senior` **Anh và một đồng nghiệp senior khác bất đồng về kiến trúc, cả hai đều có lý. Giải quyết thế nào?**
  → Viết ra hai phương án với tiêu chí chung: hiệu năng, độ khó bảo trì, thời gian làm, rủi ro. Nếu được thì làm một thử nghiệm nhỏ đo cả hai. Nếu vẫn hoà thì để lead quyết, và người thua làm theo hết sức — tranh luận về ý tưởng, không về cái tôi.
- `Senior` **Người mới trong đội liên tục hỏi anh khiến anh chậm việc. Anh làm gì?**
  → Gom câu hỏi vào khung giờ cố định trong ngày thay vì trả lời từng câu ngay. Chỉ cách tự tìm (tài liệu, code mẫu, ai phụ trách gì) thay vì đưa đáp án, và ghi lại câu hỏi hay gặp thành tài liệu cho người sau. Kèm người mới là việc của senior, nhưng phải có cách làm để không chặn việc của cả hai.

**Khung trả lời 60 giây** — "Anh xử lý thế nào khi việc không kịp tiến độ?"

> Nguyên tắc của tôi là không để ai bất ngờ. Ngay khi thấy ước lượng lệch, tôi báo lead trong ngày, kèm lý do cụ thể chỗ nào khó hơn dự kiến.
>
> Tôi không chỉ báo vấn đề mà báo kèm lựa chọn: cắt bớt phạm vi để kịp hạn, hoặc lùi hạn bao nhiêu để làm đủ, và tôi nghiêng về phương án nào. Người quyết định là lead hoặc PM, vì họ nhìn được toàn bộ kế hoạch.
>
> Sau đó tôi ghi lại vì sao mình ước sai — thường là chưa tính phần tích hợp hoặc test trên máy thật — để lần sau cộng sẵn phần đó vào.

**Họ sẽ đào tiếp**

- *"Nếu lead không trả lời tin nhắn?"* → Báo qua kênh thứ hai (gọi, nhắn PM) theo mức độ khẩn, và vẫn làm phần chắc chắn trong lúc chờ.
- *"Anh có bao giờ làm thêm giờ để kịp không?"* → Có khi thật sự cần, nhưng làm thêm giờ là phương án cuối, không phải cách che việc báo trễ.
- *"Nếu khách hàng Nhật đổi spec sát ngày ra?"* → Ước lượng lại ngay, đưa ảnh hưởng tới lịch cho PM, không âm thầm nhận rồi làm ẩu.
- *"Postmortem của anh viết gì?"* → Dòng thời gian, nguyên nhân gốc, vì sao không bắt được sớm, việc phòng lặp lại kèm người chịu trách nhiệm — không có tên người bị trách.

**Cờ đỏ**

- "Tôi sẽ thức xuyên đêm sửa cho xong" — nghe thành không báo cáo, không biết giới hạn.
- Tự chọn ưu tiên giữa hai việc của hai người mà không hỏi ai.
- Đổ lỗi cho planner, artist hoặc khách hàng khi kể tình huống.
- Làm ngầm theo ý mình khi không đồng ý với lead.
- Câu trả lời không có chữ "báo" ở đâu cả.

**Số / ví dụ nên thuộc**

- Khung: **làm rõ → ưu tiên → hành động + báo → phòng lặp lại**.
- **報連相 (hōrensō)**: báo cáo · liên lạc · bàn bạc — giá trị cốt lõi khi làm với Nhật.
- Báo trễ tiến độ: **trong ngày phát hiện**, kèm **hai phương án**.
- Sự cố production: **ảnh hưởng → chặn → nguyên nhân gốc → postmortem**.
