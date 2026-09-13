---
title: Ranh giới của AI
icon: 🚫
summary: Chỗ AI thất bại một cách đáng tin cậy, và cách phát hiện khi mình đang nhờ sai việc.
status: deep
read: 135
level: basic
order: 45
tags: [ai-dev, limits, process]
related: [ai-for-design, ai-for-build, ai-for-publish, agent-guardrails, asset-generation]
---

Biết ranh giới quan trọng ngang biết cách dùng. Phần lớn thời gian mất với AI không phải vì nó kém, mà vì **nhờ nó việc nó không làm được** rồi mất thêm thời gian sửa.

## Bốn thất bại mang tính hệ thống

**1. Nó trung bình hoá.**

Model tối ưu về phía phổ biến nhất trong dữ liệu huấn luyện. Thiết kế tốt là thứ *lệch khỏi* trung bình có chủ ý. Hệ quả: mọi thứ bạn muốn làm khác đi đều phải **nói ra tường minh**, nếu không nó tự động kéo về mặc định của ngành.

Dấu hiệu bạn đang gặp: kết quả "đúng yêu cầu nhưng nhạt". Xem [[design-pillars]] về cách chặn bằng ràng buộc phủ định.

**2. Nó không cảm nhận được.**

Không chơi được game, không nghe được âm thanh, không thấy animation. Nên mọi phán đoán về *cảm giác* là suy luận từ chữ, không phải trải nghiệm.

Hệ quả thực dụng: nó dựng được hệ thống có tham số hoá cho game feel, nhưng **con số cuối cùng phải do bạn chỉnh trong lúc game đang chạy**. Xem [[game-feel]].

**3. Nó không có trực giác không gian.**

Bố cục màn chơi, tầm nhìn, khoảng cách, cảm giác chật/rộng. Nó sinh được lưới theo ràng buộc bạn viết, nhưng không đánh giá được màn chơi có hay không. Xem [[level-design]].

**4. Nó tự tin khi sai.**

Đây là thất bại nguy hiểm nhất vì không có tín hiệu. Code trông đúng, API nghe hợp lý, con số nghe có cơ sở. Ba dạng hay gặp:

- **API không tồn tại** hoặc đã đổi tên — tri thức có thời điểm cắt
- **Con số bịa ra nghe hợp lý** — luôn bắt nó chạy mô phỏng, xem [[balancing-math]]
- **Trích dẫn sai** — tên sách, chương, tác giả có thể lệch. Tự xác minh — quy trình nạp sách ở `sources/README.md` có nói rõ việc này

## Cái bẫy "80% nhanh, 20% cuối chậm hơn"

Mẫu hình lặp lại:

```
Giờ đầu   ████████████████░░░░  80% xong. Cảm giác như tiết kiệm cả tuần.
Sau đó    ████████████████████  20% còn lại tốn thời gian hơn nếu tự viết.
```

Vì sao: 20% cuối là phần **tích hợp, trường hợp biên, và những thứ chỉ lộ ra khi chạy thật** — đúng ba điểm mù của AI. Và bạn đang sửa code mình không viết.

Cách giảm thiểu: chia nhiệm vụ nhỏ để 20% khó lộ ra sớm, không dồn về cuối. Xem [[ai-for-build]].

## Nợ kỹ thuật dạng riêng: code bạn không hiểu

Code AI viết mà bạn không đọc là nợ kỹ thuật **ngay từ ngày đầu**, không phải sau này. Biểu hiện:

- Không sửa được khi có bug, phải nhờ AI sửa tiếp
- Không đánh giá được khi AI đề xuất đổi
- Không biết nó có vi phạm bất biến nào không

Ngưỡng thực dụng: **nếu bạn không giải thích được đoạn code đó cho người khác, đừng commit nó.** Hỏi lại cho tới khi hiểu — thời gian đó rẻ hơn nhiều so với gỡ rối sau.

## Bản quyền và giấy phép — vùng chưa rõ ràng

Ba câu hỏi chưa có câu trả lời thống nhất và đang thay đổi theo pháp lý từng nước:

- Asset sinh bằng AI thuộc về ai?
- Dùng thương mại được không, và có phải công bố không?
- Nếu output giống tác phẩm có bản quyền thì sao?

Với code, rủi ro thấp hơn nhưng vẫn có (đoạn code giống hệt nguồn có giấy phép copyleft).

**Cách xử lý thực dụng:** với bất cứ thứ gì vào build thương mại, **tự xác minh với nguồn chính thức tại thời điểm phát hành** — điều khoản công cụ, quy định store. Đừng dựa vào AI nhớ, và đừng dựa vào tài liệu này (kể cả mục này) vì nó viết ở một thời điểm cụ thể. Xem [[asset-generation]], [[ai-for-publish]].

## Câu hỏi tự kiểm trước khi giao việc

Bốn câu, trả lời "không" ở bất kỳ câu nào thì cân nhắc tự làm:

1. **Kiểm chứng được không?** Có cách nào biết kết quả đúng/sai trong vài phút?
2. **Đặc tả được bằng chữ không?** Nếu phải nói "bạn hiểu ý tôi mà" thì chưa đủ.
3. **Sai thì hoàn tác rẻ không?** Đã commit trước chưa?
4. **Tôi hiểu được kết quả không?** Nếu không, ai bảo trì nó?

## Điều đáng nói cuối

AI không làm bạn thành game designer giỏi hơn. Nó làm **vòng lặp giữa hai quyết định của bạn ngắn hơn**. Nếu quyết định của bạn dở, nó chỉ giúp bạn tới chỗ dở nhanh hơn.

Đó là lý do nhánh [[foundations]] đứng trước nhánh này trong lộ trình đọc.

## 🤖 Prompt cho AI

**Dùng AI thế nào để tự phát hiện nó đang sai**

Nghịch lý có ích: AI khá tốt trong việc **liệt kê những gì nó không biết**, nếu bạn hỏi đúng cách. Ba prompt nên dùng thường xuyên:

**1. Trước khi làm — ép nó nêu chỗ phải đoán**

```
Đây là nhiệm vụ: <mô tả>

Trước khi làm, LIỆT KÊ mọi chỗ bạn sẽ phải TỰ QUYẾT vì tôi không nói rõ.
Với mỗi chỗ: bạn sẽ mặc định chọn gì, và hậu quả nếu đoán sai.

Đừng bắt đầu làm. Tôi sẽ trả lời rồi bạn mới làm.
```

Đây là prompt có tỉ lệ tiết kiệm thời gian cao nhất trong toàn kho này.

**2. Sau khi làm — ép nó tự chấm độ tin cậy**

```
Với mỗi phần bạn vừa viết, chấm độ tin cậy:
  CHẮC   — API tôi dùng chắc chắn tồn tại ở phiên bản này
  ĐOÁN   — tôi nghĩ đúng nhưng chưa chắc, bạn nên kiểm tra
  KHÔNG  — tôi không có cách biết, cần bạn xác nhận

Riêng phần ĐOÁN và KHÔNG: nói rõ kiểm tra bằng cách nào.
```

Nó phân loại khá chính xác. Phần "ĐOÁN" thường đúng là chỗ có bug.

**3. Khi nghi nó bịa**

```
Bạn vừa nói <X>. Tôi không tìm thấy trong tài liệu.

Trả lời thẳng: bạn CHẮC CHẮN điều này, hay đang suy ra từ mẫu tương tự?
Nếu không chắc, nói "không chắc" — đừng diễn giải lại cho nghe thuyết phục.
```

**Phải nêu rõ khi làm việc ở vùng có rủi ro:** với bản quyền, quy định store, hoặc API phiên bản mới — luôn thêm *"nếu không chắc chắn, nói không chắc và chỉ tôi nguồn để tự kiểm tra"*.

**Bẫy thường gặp:** hỏi "điều này đúng không?" — AI có xu hướng đồng ý với khung câu hỏi. Hỏi dạng *"bạn chắc chắn hay đang suy ra?"* cho câu trả lời hữu ích hơn nhiều.

## 🎮 Unity

Ranh giới AI trong Unity cụ thể hơn ở các engine khác, vì **phần lớn Unity project không phải code**.

**Bảng ranh giới**

| Thành phần | Agent | Vì sao |
|---|---|---|
| Script C# | ✅ | Text, test được |
| ScriptableObject class | ✅ | Text |
| `.asset` instance | ⚠️ | YAML; sửa dễ hỏng GUID reference |
| `.prefab` / `.unity` | ❌ | Lớn, nhiều GUID, hỏng im lặng |
| Animator Controller | ❌ | YAML phức tạp, không kiểm chứng được |
| Shader Graph | ❌ | Cấu trúc node, không phải text hữu ích |
| ProjectSettings | ❌ | Không tự biết đọc, và sửa sai thì hỏng cả project |
| Lighting bake | ❌ | Cần chạy Editor |

**Tại sao GUID là ranh giới thật**

Unity liên kết mọi thứ bằng GUID trong file `.meta`. Agent sửa prefab bằng text có thể:
- Ghi đúng cú pháp YAML mà trỏ sai GUID → component biến mất
- Lỗi không xuất hiện lúc build → xuất hiện khi mở scene, vài commit sau
- `git diff` trông vô hại

Đây là loại lỗi tốn nhiều thời gian nhất, và nó **im lặng hoàn toàn**. Ràng buộc trong `CLAUDE.md` là biện pháp duy nhất.

**Thứ AI không thể biết về Unity project của bạn**

```markdown
## Agent không thấy được (phải ghi vào CLAUDE.md)
- Color Space (Linear/Gamma)
- Fixed Timestep
- Input System mới hay cũ
- Layer number và collision matrix
- AudioMixer bus và exposed parameter
- Assembly Definition references
- Sprite Atlas nào chứa sprite nào
- Quality Settings theo nền tảng
```

Mỗi dòng là một lỗi "code đúng mà không chạy". Xem [[gdd-for-ai]] mục 5b.

**Kiểm tra định kỳ**

```bash
# Sau mỗi phiên: agent có đụng vào file nó không được đụng?
git diff --stat HEAD~1 | grep -E "\.(prefab|unity)$|ProjectSettings"
```

Ra kết quả là dấu hiệu phải xem lại `CLAUDE.md` và nhắc lại ràng buộc.

**Kiểm tra nhanh**
- `CLAUDE.md` có khối "agent không thấy được" chưa?
- Lệnh grep trên chạy sạch sau phiên gần nhất chứ?
- Bạn hiểu được toàn bộ code trong commit gần nhất chứ?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Bốn thất bại mang tính hệ thống của AI trong gamedev là gì?**
  → **Nó trung bình hoá** — tối ưu về phía phổ biến nhất trong dữ liệu huấn luyện. **Nó không cảm nhận được** — không chơi được game, không nghe được âm thanh. **Nó không có trực giác không gian** — không đánh giá được màn chơi hay hay dở. Và **nó tự tin khi sai**, thất bại nguy hiểm nhất vì không có tín hiệu nào báo.
- `Junior` **Dấu hiệu nào cho thấy AI đang trung bình hoá thiết kế của mình?**
  → Kết quả **"đúng yêu cầu nhưng nhạt"**. Nó làm đủ mọi thứ mình liệt kê và cho ra một game giống mọi game khác trong thể loại. Cách chặn là ràng buộc **phủ định**: nói rõ những gì game này **không** làm — đó chính là công dụng của danh sách loại trừ trong design pillars.
- `Junior` **Ba dạng "tự tin khi sai" hay gặp nhất?**
  → **API không tồn tại** hoặc đã đổi tên, vì tri thức có thời điểm cắt. **Con số bịa ra nghe hợp lý** — nên luôn bắt nó chạy mô phỏng thay vì nhận số. Và **trích dẫn sai**: tên sách, chương, tác giả có thể lệch, phải tự xác minh. Cả ba đều không có tín hiệu cảnh báo nào trong câu trả lời.
- `Mid` **Cái bẫy "80% nhanh, 20% cuối chậm hơn" là gì?**
  → Giờ đầu xong 80% và cảm giác như tiết kiệm cả tuần; rồi 20% còn lại tốn thời gian hơn cả tự viết. Lý do: 20% cuối là phần **tích hợp, trường hợp biên, và những thứ chỉ lộ ra khi chạy thật** — đúng ba điểm mù của AI — và mình đang sửa code mình không viết. Cách giảm thiểu là chia nhiệm vụ nhỏ để phần khó lộ ra sớm, không dồn về cuối.
- `Mid` **Vì sao code AI viết mà mình không đọc lại là nợ kỹ thuật ngay từ ngày đầu?**
  → Vì ba hệ quả xuất hiện lập tức: **không sửa được** khi có bug nên phải nhờ AI sửa tiếp, **không đánh giá được** khi AI đề xuất đổi, và **không biết nó có vi phạm bất biến nào không**. Ngưỡng thực dụng: nếu không giải thích được đoạn code đó cho người khác thì đừng commit — hỏi lại cho tới khi hiểu, thời gian đó rẻ hơn gỡ rối sau.
- `Mid` **Bốn câu tự kiểm trước khi giao một việc cho AI?**
  → **Kiểm chứng được không** — có cách nào biết đúng sai trong vài phút? **Đặc tả được bằng chữ không** — phải nói "bạn hiểu ý tôi mà" là chưa đủ. **Sai thì hoàn tác rẻ không** — đã commit trước chưa? **Mình hiểu được kết quả không** — nếu không thì ai bảo trì nó? Trả lời "không" ở bất kỳ câu nào thì cân nhắc tự làm.
- `Senior` **Câu hỏi bản quyền và giấy phép của asset AI — anh trả lời thế nào?**
  → Nói thẳng đây là **vùng chưa rõ ràng và đang thay đổi theo pháp lý từng nước**: asset sinh bằng AI thuộc về ai, dùng thương mại được không và có phải công bố không, nếu output giống tác phẩm có bản quyền thì sao. Cách xử lý thực dụng: với bất cứ thứ gì vào build thương mại, **tự xác minh với nguồn chính thức tại thời điểm phát hành** — đừng dựa vào AI nhớ, và đừng dựa vào tài liệu viết từ trước.
- `Senior` **Việc nào anh không giao cho AI, kể cả khi nó làm được?**
  → Ba nhóm: quyết định về **cảm giác** (con số game feel cuối cùng phải chỉnh trong lúc game chạy), đánh giá **không gian** (màn chơi này có hay không), và việc mà **kiểm chứng đắt hơn tự làm**. Ngoài ra là những chỗ mà một sai lầm im lặng đi thẳng tới người chơi — số cân bằng và migration save.
- `Senior` **Câu tổng kết của anh về vai trò AI trong quy trình?**
  → **AI không làm mình thành designer giỏi hơn; nó làm vòng lặp giữa hai quyết định của mình ngắn hơn.** Nếu quyết định dở thì nó chỉ giúp tới chỗ dở nhanh hơn. Đó là lý do phần nền tảng thiết kế đứng trước phần công cụ — và cũng là lý do khoản đầu tư đáng giá nhất thường là rút ngắn vòng lặp đánh giá chứ không phải tăng tốc độ sinh code.

**Khung trả lời 60 giây** — "Anh biết khi nào không nên nhờ AI?"

> Phần lớn thời gian mất với AI không phải vì nó kém, mà vì **nhờ nó việc nó không làm được** rồi mất thêm thời gian sửa. Nên tôi có bốn câu tự kiểm trước khi giao: kiểm chứng được không, đặc tả bằng chữ được không, sai thì hoàn tác rẻ không, và tôi có hiểu được kết quả không. "Không" ở bất kỳ câu nào thì cân nhắc tự làm.
>
> Bốn điểm mù mang tính hệ thống thì tôi coi là cố định, không phải khuyết điểm tạm thời: nó **trung bình hoá** nên mọi thứ tôi muốn làm khác đi phải nói tường minh; nó **không cảm nhận được** nên con số game feel cuối phải do tôi chỉnh lúc game chạy; nó **không có trực giác không gian**; và nó **tự tin khi sai** — API không tồn tại, con số bịa, trích dẫn lệch.
>
> Cuối cùng là một cái bẫy về nhịp: **80% xong rất nhanh, 20% cuối chậm hơn cả tự viết**, vì đó là phần tích hợp và trường hợp biên. Tôi chia nhiệm vụ nhỏ để phần khó lộ ra sớm. Và ngưỡng cứng của tôi: **không giải thích được đoạn code cho người khác thì không commit.**

**Họ sẽ đào tiếp**

- *"Vì sao 'tự tin khi sai' nguy hiểm hơn 'trả lời sai'?"* → Vì không có **tín hiệu** nào để mình dừng lại kiểm tra: code trông đúng, tên API nghe hợp lý, con số nghe có cơ sở. Sai mà nhìn ra được thì mất mười phút; sai mà trôi vào build thì lộ ra ở tay người chơi. Nên cách chữa không phải là tin ít hơn, mà là **dựng chỗ kiểm chứng rẻ** — compile, test, mô phỏng.
- *"Chia nhiệm vụ nhỏ cụ thể là chia thế nào?"* → Theo **ranh giới kiểm chứng được**, không theo kích thước: mỗi phần phải có một cách biết nó đúng trong vài phút. Ví dụ thay vì "làm hệ thống inventory", chia thành model dữ liệu có test, logic thêm/bớt có test, rồi mới tới lớp UI. Phần tích hợp lộ ra ở bước hai thay vì ở ngày cuối.
- *"AI trung bình hoá thì chặn bằng gì ngoài pillar?"* → Bằng **ví dụ phản chiếu**: đưa ba thứ mình thích và nói rõ vì sao, kèm ba thứ mình không muốn giống. Ràng buộc phủ định mạnh hơn ràng buộc khẳng định ở đây, vì "hãy sáng tạo" không loại được gì còn "không dùng cơ chế X" thì loại được ngay.
- *"Điều này đổi theo thời gian không?"* → Khả năng đổi, nhưng **ba điểm mù đầu thì có tính cấu trúc**: cảm nhận, không gian, và xu hướng về trung bình đến từ bản chất của việc học từ dữ liệu. Nên tôi thiết kế quy trình sao cho chúng không quan trọng — giữ quyết định cảm giác cho người, và dựng chỗ kiểm chứng cho phần còn lại.

**Cờ đỏ**

- Nhận con số từ AI mà không bắt nó chạy mô phỏng.
- Commit code không giải thích được cho người khác.
- Trả lời câu hỏi giấy phép bằng trí nhớ của AI.
- Giao một nhiệm vụ lớn rồi ngạc nhiên vì 20% cuối tốn hơn tự viết.
- Coi bốn điểm mù là khuyết điểm tạm thời và thiết kế quy trình như thể chúng không tồn tại.

**Số / ví dụ nên thuộc**

- Bốn thất bại hệ thống: **trung bình hoá · không cảm nhận · không trực giác không gian · tự tin khi sai**.
- Ba dạng tự tin khi sai: **API không tồn tại · con số bịa · trích dẫn lệch**.
- Bẫy nhịp: **80% nhanh, 20% cuối chậm hơn tự viết**.
- Bốn câu tự kiểm: **kiểm chứng được · đặc tả được · hoàn tác rẻ · hiểu được kết quả**.
- Ngưỡng commit: **giải thích được cho người khác thì mới commit**.
