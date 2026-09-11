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
