---
title: Đo chất lượng trợ lý AI
icon: 📐
summary: Golden task lấy từ lịch sử repo, bốn nhóm chỉ số, và cách so sánh hai cấu hình mà không tự lừa mình — thứ biến "hình như nó khá hơn" thành bằng chứng.
status: deep
read: 137
level: advanced
order: 70
tags: [ai, agent, eval, metrics, process]
related: [ai-assistant-architecture, agent-guardrails, ai-limits, playtesting-metrics]
---

Mọi đội dùng agent đều tới lúc này: đổi file luật, đổi model, đổi cách chia ngữ cảnh — rồi không biết mình vừa làm tốt lên hay tệ đi. Cảm giác là thước đo tệ, vì bạn nhớ ba lần nó làm bạn ngạc nhiên và quên mười lần nó làm bạn mất 20 phút.

Điều cần nói ngay ở phỏng vấn: **eval cho agent không giống eval cho model**. Bạn không đo "model biết gì", bạn đo **hệ thống của bạn làm xong việc của dự án bạn tới đâu**. Cùng một model, hai cấu hình ngữ cảnh khác nhau cho kết quả khác nhau rất xa.

## Golden task: lấy từ lịch sử, không nghĩ ra

Bộ nhiệm vụ chuẩn là nền của mọi thứ còn lại. Cách dựng rẻ nhất và trung thực nhất: **mở lịch sử git, lấy 20–40 thay đổi thật đã làm**, mỗi cái viết lại thành một đầu bài kèm tiêu chí đạt.

| Loại nhiệm vụ | Tỉ lệ nên có | Vì sao |
|---|---|---|
| Sửa bug nhỏ, một file | ~30% | Loại việc giao nhiều nhất, cũng dễ chấm nhất |
| Thêm tính năng vừa, 2–5 file | ~30% | Đo khả năng theo quy ước dự án |
| Viết test cho code có sẵn | ~15% | Kiểm chứng máy móc, ít tranh cãi |
| Refactor không đổi hành vi | ~15% | Test cũ phải vẫn xanh — tiêu chí đạt rõ ràng |
| Sửa dữ liệu / ScriptableObject | ~10% | Phần Unity-riêng mà agent hay làm hỏng |

Ba luật khi viết đầu bài:

1. **Tiêu chí đạt phải máy chấm được**: build xanh, test X xanh, chỉ chạm file trong thư mục Y. "Code sạch" không phải tiêu chí.
2. **Đầu bài viết như lúc giao việc thật**, không viết cho dễ. Nếu thực tế bạn hay quên nói rõ phiên bản Unity thì cứ để nguyên — bạn đang đo cả cách mình giao việc.
3. **Giữ trong repo**, có version. Bộ task sửa đổi tuỳ tiện là bộ task vô dụng cho việc so sánh.

## Bốn nhóm chỉ số

| Nhóm | Chỉ số | Đọc thế nào |
|---|---|---|
| **Kết quả** | Tỉ lệ hoàn thành (build + test xanh); tỉ lệ **xong trong một vòng** | Tỉ lệ một vòng tăng là dấu hiệu ngữ cảnh tốt lên |
| **Chất lượng** | % diff bị người sửa lại sau review; số lần vi phạm ranh giới; bug do agent gây ra trong 2 tuần sau | Hoàn thành cao mà sửa lại nhiều = đang đẩy việc sang người review |
| **Chi phí** | Token và tiền mỗi **nhiệm vụ hoàn thành**; thời gian từ giao việc tới PR xanh | Đừng đo giá mỗi nghìn token: model đắt mà xong một vòng thì rẻ hơn |
| **Người** | Thời gian review trung bình; tỉ lệ PR bạn phải đọc lại toàn bộ | Chỉ số này quyết định trợ lý có thật sự tiết kiệm thời gian không |

Một chỉ số **không** nên dùng: "bao nhiêu phần trăm code do AI viết". Nó không nói gì về giá trị và tạo động cơ xấu ngay lập tức — người ta sẽ để agent viết những thứ lẽ ra không nên viết.

## Chấm điểm: máy trước, người sau

**Tầng máy** chạy trước và loại bỏ phần lớn công sức của người:

- Biên dịch xanh? Test liên quan xanh? Test **cũ** có đỏ thêm cái nào không?
- Diff có nằm trong phạm vi khai báo không (ví dụ chỉ `Combat/`)?
- Có chạm file cấm (`*.unity`, `*.prefab`, `*.meta`) không?
- Số vòng tự sửa đã dùng, thời gian, chi phí.

**Tầng người** chỉ chấm những gì máy không thấy, bằng một rubric ngắn ba câu, mỗi câu 0/1/2 điểm:

1. Có theo quy ước dự án không (đặt file đúng chỗ, tái dùng thứ đã có)?
2. Thay đổi có **tối thiểu** không, hay kéo theo sửa linh tinh?
3. Có bằng chứng nó chạy (test mới, hoặc cách kiểm chứng nêu rõ)?

Rubric dài hơn ba câu sẽ không ai chấm tới lần thứ hai. Đây là kinh nghiệm chung của mọi quy trình review, không riêng AI.

## So sánh hai cấu hình mà không tự lừa mình

Đây là phần dễ sai nhất, và cũng là phần người phỏng vấn hay đào:

- **Chạy mỗi task nhiều lần** (n = 3 là mức tối thiểu có ý nghĩa). Agent không xác định: cùng đầu bài, hai lần chạy ra hai kết quả khác nhau. Kết luận từ một lần chạy là kết luận về nhiễu.
- **Đổi một thứ mỗi lần.** Đổi cùng lúc model và cách chia ngữ cảnh thì thắng cũng không biết nhờ cái nào — giống hệt luật của A/B test ở [[liveops]].
- **So theo cặp trên cùng task**, không so hai trung bình rời rạc.
- **Đừng chỉ nhìn tỉ lệ hoàn thành.** Cấu hình mới hoàn thành cao hơn nhưng % diff bị sửa lại cũng cao hơn là một đánh đổi, không phải một chiến thắng.
- **Coi chừng overfit.** Chỉnh luật cho tới khi 40 task đều xanh thì bạn đã tối ưu cho bộ test, không phải cho dự án. Giữ 5–10 task **để riêng**, chỉ chạy mỗi tháng một lần.

## Eval canary trong CI

Bộ đầy đủ tốn thời gian và tiền, nên đừng chạy mỗi lần sửa. Cấu trúc thực dụng:

| Khi nào | Chạy gì | Mục đích |
|---|---|---|
| Mỗi lần sửa file luật / prompt hệ thống | **5 task nhanh** (canary) | Bắt lỗi thô: luật mới làm agent bỏ quên bước kiểm tra |
| Mỗi tuần, hoặc trước khi đổi model | Toàn bộ bộ task, n = 3 | So sánh cấu hình |
| Mỗi tháng | Bộ để riêng | Kiểm tra mình có đang overfit không |

Với đội nhỏ, đừng đợi có hạ tầng hoàn hảo: **10 task trong một bảng tính và chạy tay mỗi tháng** vẫn tốt hơn nhiều so với không đo. Điều quan trọng là số liệu tồn tại và so sánh được qua thời gian.

## Kiểm tra nhanh

- [ ] Bộ golden task nằm trong repo, có version, lấy từ thay đổi **thật**
- [ ] Mỗi task có tiêu chí đạt **máy chấm được**
- [ ] Có tầng chấm tự động trước khi người nhìn
- [ ] Mỗi thay đổi cấu hình chỉ đổi **một** thứ
- [ ] Mỗi task chạy ít nhất 3 lần
- [ ] Có bộ task để riêng, không dùng khi tinh chỉnh
- [ ] Theo dõi cả **% diff bị sửa lại**, không chỉ tỉ lệ hoàn thành

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc dựng eval**

Ba việc giao được ngay, và cả ba đều là việc AI làm nhanh hơn người rõ rệt: **biến commit thật thành đầu bài** (đưa nó diff + thông điệp commit, bảo nó viết lại thành nhiệm vụ kèm tiêu chí đạt); **viết script chấm tự động**; và **tóm tắt kết quả nhiều lần chạy** thành bảng so sánh.

Việc không giao: chọn task nào vào bộ, và diễn giải kết quả. AI sẽ chọn những task nó làm tốt (nó không cố ý, nhưng nó viết đầu bài theo cách nó hiểu), và sẽ diễn giải chênh lệch 2% trên 10 lần chạy thành "cải thiện rõ rệt". Kích thước mẫu và ý nghĩa thống kê là chỗ bạn phải giữ.

Một mẹo hiệu quả: đưa cho agent **task nó từng làm hỏng** và yêu cầu tự phân tích *thiếu thông tin gì trong ngữ cảnh thì mới hỏng như vậy*. Câu trả lời thường chỉ thẳng vào lỗ hổng trong file luật của bạn — đây là cách rẻ nhất để cải thiện lớp ngữ cảnh ở [[ai-assistant-architecture]].

**Phải nêu rõ** (thiếu là AI tự bịa):
- Tiêu chí đạt phải **máy chấm được**; nếu bạn không nói, nó sẽ viết "code phải sạch và dễ bảo trì".
- Bộ task dùng để so sánh cấu hình hay để phát hiện hồi quy — hai mục đích cần hai bộ khác nhau.
- Chạy mấy lần mỗi task, và chấp nhận chênh lệch bao nhiêu mới coi là khác biệt thật.
- Có được chạy Unity trong `-batchmode` trên máy chấm không (quyết định chấm được tới đâu).
- Dữ liệu nào **không** được đưa ra ngoài (mã nguồn nội bộ, tài sản chưa công bố).

**Mẫu prompt**

```
Đây là 12 commit thật từ repo Unity của tôi (diff + message): <dán>

Với mỗi commit, viết một golden task gồm:
- Đầu bài như lúc giao việc, KHÔNG tiết lộ lời giải trong diff
- Tiêu chí đạt máy chấm được: lệnh build/test cụ thể, danh sách file được phép chạm
- Một "cạm bẫy" mà agent dễ rơi vào ở task này
Đánh dấu commit nào KHÔNG hợp làm task (quá lớn, phụ thuộc thao tác trong Editor,
hoặc tiêu chí đạt không kiểm tự động được) và nói rõ vì sao.
```

**Bẫy thường gặp:** AI viết đầu bài **rò rỉ lời giải** vì nó đang nhìn diff — "sửa `EnemySpawner` để dùng object pool thay vì Instantiate" là đầu bài đã cho sẵn đáp án; đầu bài thật phải là "spawn 200 enemy gây khựng ở giây thứ 30, hãy sửa". Task rò rỉ lời giải cho điểm cao giả và làm mọi so sánh về sau vô nghĩa — bắt nó viết lại từ **triệu chứng**, và tự kiểm bằng câu hỏi: người mới vào dự án đọc đầu bài này có biết phải làm gì không, hay chỉ biết phải gõ gì.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Mid | Làm sao anh biết một prompt/luật mới tốt hơn cái cũ? |
| Mid | Anh đo gì khi đưa AI vào quy trình? |
| Senior | Dựng bộ eval cho coding agent thế nào? Lấy nhiệm vụ ở đâu? |
| Senior | Hai cấu hình: A hoàn thành 70%, B hoàn thành 80%. Chọn cái nào? |
| Senior | Vì sao "bao nhiêu % code do AI viết" là chỉ số tệ? |

**Khung trả lời 60 giây** — "Làm sao biết trợ lý tốt lên?"

> Bằng một **bộ golden task lấy từ lịch sử repo**, không phải task nghĩ ra: tôi mở git, chọn 20–40 thay đổi thật đã làm, viết lại thành đầu bài kèm tiêu chí đạt **máy chấm được** — build xanh, test nào phải xanh, được chạm những file nào.
>
> Rồi đo bốn nhóm: kết quả (tỉ lệ hoàn thành, và quan trọng hơn là **tỉ lệ xong trong một vòng**), chất lượng (**bao nhiêu phần diff bị người sửa lại** sau review, số lần vi phạm ranh giới), chi phí (tiền và thời gian **mỗi nhiệm vụ hoàn thành**, không phải giá mỗi nghìn token), và thời gian review của người.
>
> Kỷ luật khi so sánh thì giống hệt A/B test: đổi **một** thứ mỗi lần, chạy mỗi task ít nhất ba lần vì agent không xác định, và so theo cặp trên cùng task. Kết luận rút từ một lần chạy là kết luận về nhiễu.

**Họ sẽ đào tiếp**

- *"A 70% hay B 80%?"* → Chưa đủ dữ kiện. Nếu B hoàn thành cao hơn nhưng **% diff bị sửa lại** cũng cao hơn thì nó chỉ đang đẩy việc sang người review, và thời gian tiết kiệm là ảo. Tôi sẽ hỏi thêm ba số: tỉ lệ một vòng, thời gian review trung bình, và số lần chạm vùng cấm.
- *"Vì sao % code do AI viết là chỉ số tệ?"* → Nó không nói gì về giá trị và tạo động cơ xấu ngay: muốn số đẹp thì cứ để agent viết cả những chỗ không nên viết. Chỉ số phải gắn với **kết quả công việc**, không gắn với sản lượng.
- *"Overfit thì sao?"* → Chỉnh luật cho tới khi cả bộ task xanh là tối ưu cho bộ test chứ không cho dự án. Nên tôi giữ 5–10 task **để riêng**, chỉ chạy mỗi tháng một lần, và không dùng chúng khi đang tinh chỉnh.
- *"Chạy eval tốn tiền, chạy khi nào?"* → Ba nhịp: **5 task canary** mỗi lần sửa file luật hoặc prompt hệ thống; bộ đầy đủ với n = 3 mỗi tuần hoặc trước khi đổi model; bộ để riêng mỗi tháng.
- *"Đội nhỏ chưa có hạ tầng?"* → 10 task trong một bảng tính, chạy tay mỗi tháng. Số liệu thô mà tồn tại và so sánh được qua thời gian vẫn hơn hẳn một hạ tầng đẹp chưa bao giờ dựng xong.

**Cờ đỏ**

- "Tôi thấy nó viết code khá hơn" — cảm giác, không phải đo.
- Kết luận từ một lần chạy mỗi cấu hình.
- Đổi model **và** đổi ngữ cảnh cùng lúc rồi tuyên bố thắng.
- Tiêu chí đạt viết là "code sạch, dễ bảo trì".
- Golden task do AI tự viết từ diff — rò rỉ lời giải, điểm cao giả.

**Số / ví dụ nên thuộc**

- Bộ task: **20–40 nhiệm vụ thật**, phân bố bug nhỏ / tính năng vừa / test / refactor / dữ liệu.
- **n = 3** là số lần chạy tối thiểu cho mỗi task.
- Canary **5 task** cho mỗi lần sửa luật; bộ đầy đủ theo tuần; bộ để riêng theo tháng.
- Chỉ số hay bị bỏ quên nhất: **% diff bị người sửa lại**.
