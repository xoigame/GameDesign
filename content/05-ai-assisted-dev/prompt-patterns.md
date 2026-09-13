---
title: Prompt Patterns cho Gamedev
icon: 💡
summary: Các mẫu prompt đã kiểm chứng cho từng loại việc — hệ thống, cân bằng, thuật toán, debug, refactor.
status: deep
read: 120
level: basic
order: 30
tags: [ai-dev, prompt, practical]
related: [gdd-for-ai, agent-guardrails, ai-workflow]
---

## Bộ khung chung

Prompt gamedev hiệu quả gần như luôn có 5 phần:

```
[BỐI CẢNH]    Engine, phiên bản, ngôn ngữ, kiến trúc hiện tại
[MỤC TIÊU]    Cần đạt được gì, ở mức hành vi quan sát được
[RÀNG BUỘC]   Phải / không được. Bao gồm ràng buộc thiết kế lẫn kỹ thuật
[DỮ LIỆU]     Số cụ thể, bảng, công thức
[ĐẦU RA]      Định dạng, file nào, có test không
```

Thiếu phần RÀNG BUỘC là nguyên nhân số một khiến kết quả "đúng mà không dùng được".

## Mẫu: xây một hệ thống

```
[BỐI CẢNH] Unity 6, C#, 2D. Đã có PlayerController và HealthComponent.
           Dự án dùng ScriptableObject cho mọi dữ liệu cấu hình.

[MỤC TIÊU] Hệ thống stamina: chạy và né tiêu stamina, hết thì không né được.

[RÀNG BUỘC]
- Stamina hồi sau 1.2s không tiêu (không hồi ngay lập tức)
- Không né được khi stamina < 20 — nhưng vẫn di chuyển được
- KHÔNG dùng Update cho việc hồi; dùng thời gian trôi qua khi truy vấn
- KHÔNG gọi GetComponent ngoài Awake
- Mọi hằng số nằm trong StaminaConfig : ScriptableObject

[DỮ LIỆU]
  max: 100 | hồi: 25/giây | trễ hồi: 1.2s
  chi phí né: 25 | chi phí chạy: 12/giây

[ĐẦU RA]
- StaminaComponent.cs + StaminaConfig.cs
- Sự kiện OnStaminaChanged(float normalized) cho UI
- Unit test: tiêu, hồi, trễ hồi, chặn né khi thiếu
```

## Mẫu: cân bằng số

Điểm mấu chốt — **bắt AI chạy mô phỏng, đừng nhận số nó đưa ra trực tiếp.**

```
Viết script Python mô phỏng cân bằng, KHÔNG đưa ra con số dựa trên trực giác.

Mô hình:
- Người chơi: hp=100, dps=f(level), armor=g(level)
- 5 loại kẻ địch, chỉ số trong bảng dưới
- Mô phỏng 10.000 trận mỗi cặp (build × kẻ địch)

Xuất ra:
- Winrate và TTK trung vị cho mỗi cặp
- Cảnh báo cặp nào winrate < 40% hoặc > 75%
- Đồ thị phân bố TTK (phát hiện đuôi dài)

Sau khi có kết quả, đề xuất điều chỉnh và CHẠY LẠI để chứng minh.
```

Chi tiết quan trọng: yêu cầu chạy lại sau khi điều chỉnh. Không có bước đó, "đề xuất" chỉ là phỏng đoán có vẻ khoa học.

## Mẫu: thuật toán

```
Cài [thuật toán] cho [bối cảnh].

Đặc tả:
- Đầu vào / đầu ra chính xác
- Độ phức tạp mong muốn
- Ràng buộc bộ nhớ: KHÔNG cấp phát trong vòng lặp nóng

Trường hợp biên (phải xử lý rõ ràng, không được ném ngoại lệ):
- [liệt kê...]

Hành vi khi thất bại: [nêu rõ — đây là chỗ hay bị bỏ sót]

Kèm unit test cho: trường hợp thường, mỗi trường hợp biên, và giới hạn hiệu năng.
```

## Mẫu: debug

Đưa **bằng chứng**, đừng đưa kết luận của bạn:

```
Triệu chứng: nhân vật thỉnh thoảng xuyên qua nền khi rơi nhanh.
Tần suất: ~1/20 lần, chỉ khi tốc độ rơi > 25 đơn vị/giây.

Đã thử: tăng Fixed Timestep từ 0.02 xuống 0.01 — giảm nhưng không hết.

[dán code xử lý va chạm]

Đừng đoán. Hãy:
1. Liệt kê các giả thuyết theo thứ tự khả năng
2. Với mỗi giả thuyết, nói tôi cần kiểm tra gì để xác nhận/loại trừ
3. Chờ tôi báo kết quả rồi mới sửa
```

Bước 3 quan trọng: agent sửa ngay thường "sửa" triệu chứng chứ không sửa nguyên nhân.

## Mẫu: phản biện thiết kế

Dùng AI như một người phản biện, không phải người tán thành:

```
Đây là thiết kế hệ thống kinh tế của tôi: [mô tả]

Hãy đóng vai người chơi cố tình phá game:
1. Có vòng lặp nào tạo tài nguyên vô hạn không?
2. Chiến lược tối ưu (degenerate) là gì? Nó có nhàm chán không?
3. Chỗ nào gây lạm phát sau 20 giờ chơi?
4. Ba điểm yếu lớn nhất của thiết kế này?

Không cần khen. Chỉ liệt kê vấn đề.
```

Câu cuối có tác dụng thật — không có nó, phản hồi thường mở đầu bằng một đoạn khen ngợi vô ích.

## Mẫu: refactor an toàn

```
Refactor [file] để [mục tiêu].

BẮT BUỘC:
- Hành vi quan sát được KHÔNG đổi
- Giữ nguyên mọi API công khai
- Chạy test hiện có trước và sau, cả hai phải xanh
- Nếu phải đổi API công khai, DỪNG LẠI và hỏi tôi trước

Trình bày diff theo từng bước nhỏ, đừng viết lại cả file một lần.
```

## Điều nên tránh

**Đừng hỏi "cách nào tốt nhất?"** — sẽ nhận về câu trả lời trung bình hoá. Hỏi: *"So sánh A và B cho trường hợp cụ thể của tôi: [ràng buộc]. Khuyến nghị một cái và nói rõ đánh đổi."*

**Đừng chấp nhận code không đọc.** Nếu không hiểu, hỏi lại cho tới khi hiểu. Code bạn không hiểu là nợ kỹ thuật ngay từ ngày đầu.

**Đừng để agent tự ý mở rộng phạm vi.** Nếu nó thêm tính năng bạn không yêu cầu, hãy chỉ ra và yêu cầu gỡ. Xem [[agent-guardrails]].

## 🤖 Prompt cho AI

**Dùng AI thế nào để cải thiện prompt của chính bạn**

Việc ít người làm mà hiệu quả cao: **đưa prompt của bạn cho AI trước khi gửi nó đi làm.**

```
Đây là prompt tôi định gửi cho một coding agent:
<dán prompt>

Đừng thực hiện nó. Thay vào đó:
1. Mọi chỗ agent sẽ phải TỰ QUYẾT vì tôi không nói rõ
2. Với mỗi chỗ, đoán agent sẽ mặc định chọn gì
3. Ràng buộc PHỦ ĐỊNH nào tôi đang thiếu — thứ tôi KHÔNG muốn nhưng chưa cấm
4. Viết lại cho chặt, giữ nguyên ý định của tôi
```

Mất 20 giây, và nó bắt được đúng loại thiếu sót gây ra kết quả "đúng mà không dùng được". Xem [[ai-limits]] về hai prompt tự kiểm khác.

Node này *là* tập mẫu prompt. Phần dưới là cách dùng AI để **cải thiện chính prompt của bạn**.

**Mẫu prompt: nhờ AI vá lỗ hổng trong prompt**

```
Đây là prompt tôi định gửi cho một coding agent:

<dán prompt của bạn>

Đừng thực hiện nó. Thay vào đó:
1. Liệt kê mọi chỗ agent sẽ phải TỰ QUYẾT vì tôi không nói rõ.
2. Với mỗi chỗ, đoán xem agent sẽ mặc định chọn gì (giá trị phổ biến nhất).
3. Chỉ ra ràng buộc PHỦ ĐỊNH nào tôi đang thiếu — tức là thứ tôi KHÔNG muốn
   nhưng chưa cấm.
4. Viết lại prompt cho chặt, giữ nguyên ý định của tôi.
```

**Mẫu prompt: bắt AI phản biện thiết kế**

```
Đây là thiết kế <hệ thống>: <mô tả>

Đóng vai người chơi cố tình phá game:
1. Vòng lặp nào tạo tài nguyên hoặc sức mạnh vô hạn?
2. Chiến lược tối ưu (degenerate) là gì? Nó có nhàm chán không?
3. Chỗ nào hỏng sau 20 giờ chơi?
4. Ba điểm yếu lớn nhất?

Không cần khen. Chỉ liệt kê vấn đề.
```

**Bẫy thường gặp:** hỏi "cách nào tốt nhất?" — nhận về câu trả lời trung bình hoá. Luôn hỏi dạng *"so sánh A và B cho ràng buộc cụ thể của tôi, khuyến nghị một cái, nói rõ đánh đổi."*

## 🎮 Unity

Prompt cho Unity cần thêm hai thứ mà prompt chung không có: **phiên bản** và **những gì agent không thấy**.

**Khung prompt cho Unity**

```
[BỐI CẢNH]
Unity 6000.0.32f1 + URP. Input System mới. Fixed Timestep 0.01667.
Đã có: PlayerController (Game.Unity), HealthComponent, InputReader.
Assembly: Game.Core không tham chiếu UnityEngine.
Layer: Player=6, Enemy=7, PlayerProj=8.

[MỤC TIÊU]
Hệ thống stamina: chạy và né tiêu stamina, hết thì không né được.

[RÀNG BUỘC]
- Logic thuần vào Game.Core/Stamina/StaminaModel.cs (KHÔNG using UnityEngine)
- MonoBehaviour adapter vào Game.Unity/StaminaComponent.cs
- Hằng số trong StaminaConfig : ScriptableObject
- KHÔNG GetComponent ngoài Awake
- KHÔNG cấp phát trong Update
- Hồi stamina tính bằng thời gian trôi qua khi truy vấn, KHÔNG dùng Update

[DỮ LIỆU]
max 100 | hồi 25/s | trễ hồi 1.2s | né 25 | chạy 12/s

[ĐẦU RA]
- Hai file như trên
- Test EditMode cho StaminaModel: tiêu, hồi, trễ hồi, chặn né
- Nói cho tôi biết cần gán gì trong Inspector
```

Dòng cuối quan trọng và hay thiếu: agent không gắn được component vào prefab, nên nó phải **nói bạn cần làm gì trong Editor**.

**Mẫu: nhờ agent viết editor tool**

Đây là loại việc agent làm rất tốt và ít rủi ro (không đụng gameplay):

```
Viết editor tool quét toàn bộ project, tìm:
1. [SerializeField] nào đang null trong prefab (dùng AssetDatabase + SerializedObject)
2. Component nào thiếu trên prefab mà script yêu cầu
3. AudioSource nào không gán output Mixer Group
4. Sprite nào có Pixels Per Unit khác 32

Xuất báo cáo dạng bảng trong một EditorWindow, bấm vào dòng thì select object đó.
Đặt ở Assets/Editor/ProjectValidator.cs, menu Tools/Validate Project.
```

Tool này bắt được đúng lớp lỗi "code đúng mà chạy sai" phổ biến nhất trong Unity.

**Mẫu: debug lỗi Unity**

```
Triệu chứng: nhân vật thỉnh thoảng xuyên nền khi rơi nhanh.
Tần suất: ~1/20 lần, chỉ khi velocity.y < -25.
Đã thử: Fixed Timestep 0.02 -> 0.01 (giảm nhưng không hết).
Collision Detection của Rigidbody2D: Discrete.
[dán code]

Đừng đoán. Liệt kê giả thuyết theo thứ tự khả năng, và với mỗi cái nói tôi
cần kiểm tra gì trong Editor để xác nhận. Chờ tôi báo kết quả.
```

Nêu `Collision Detection: Discrete` là chi tiết agent không thấy được — và ở ví dụ này nó chính là nguyên nhân.

**Bẫy thường gặp**
- **Không nêu phiên bản** → agent dùng API đã đổi tên (`rb.velocity` → `rb.linearVelocity` từ Unity 6).
- **Không nói agent phải báo việc cần làm trong Editor** → code đúng, chạy `NullReferenceException` vì field chưa gán.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Một prompt gamedev hiệu quả gồm mấy phần?**
  → Năm: **bối cảnh** (engine, phiên bản, quy mô), **mục tiêu** cụ thể, **ràng buộc**, **định dạng kết quả mong muốn**, và **tiêu chí nghiệm thu**. Thiếu phần **ràng buộc** là nguyên nhân số một khiến kết quả "đúng mà không dùng được" — vì không có ràng buộc thì model rơi về mặc định của ngành.
- `Junior` **Vì sao không nên hỏi "cách nào tốt nhất?"**
  → Vì sẽ nhận về **câu trả lời trung bình hoá** — thứ phổ biến nhất trong dữ liệu, không phải thứ đúng cho dự án của mình. Hỏi đúng là: "So sánh A và B cho trường hợp cụ thể của tôi với ràng buộc X, Y; khuyến nghị một cái và nói rõ đánh đổi." Câu đó buộc nó chọn và buộc nó nêu cái giá.
- `Junior` **Khi nhờ cân bằng số, điểm mấu chốt là gì?**
  → **Bắt AI chạy mô phỏng, đừng nhận số nó đưa ra trực tiếp.** Và chi tiết quan trọng không kém: yêu cầu **chạy lại sau khi điều chỉnh**. Không có bước chạy lại thì "đề xuất" chỉ là phỏng đoán có vẻ khoa học — nó nghe như kết quả thí nghiệm nhưng chưa có thí nghiệm nào diễn ra.
- `Mid` **Mẫu prompt để debug nên viết thế nào?**
  → Đưa **bằng chứng, đừng đưa kết luận của mình**: log, hành vi quan sát được, các bước tái hiện. Rồi yêu cầu **liệt kê giả thuyết kèm cách kiểm chứng từng cái** trước khi sửa. Bước đó quan trọng vì agent sửa ngay thường "sửa" **triệu chứng** chứ không sửa nguyên nhân — và cái sửa đó sẽ trôi vào code.
- `Mid` **Dùng AI làm người phản biện thiết kế thế nào cho có ích?**
  → Đặt nó vào vai phản biện tường minh và yêu cầu **tìm điểm yếu, không tìm điểm mạnh**; kèm câu "đừng mở đầu bằng lời khen". Câu đó có tác dụng thật — không có nó, phản hồi thường bắt đầu bằng một đoạn khen ngợi vô ích rồi mới tới phần dùng được, và phần dùng được bị làm nhẹ đi.
- `Mid` **Refactor an toàn thì yêu cầu gì trong prompt?**
  → Nêu rõ **hành vi không được đổi**, phạm vi file được phép chạm, và **tiêu chí xác minh** — test nào phải xanh sau khi xong. Refactor là loại việc AI làm nhanh và cũng là loại việc nó dễ âm thầm đổi hành vi nhất, nên ranh giới "không đổi gì ngoài cấu trúc" phải được viết ra chứ không ngầm hiểu.
- `Senior` **Ba điều nên tránh khi làm việc với agent?**
  → Hỏi "cách nào tốt nhất" và nhận câu trả lời trung bình hoá. **Chấp nhận code không đọc** — code mình không hiểu là nợ kỹ thuật ngay từ ngày đầu. Và **để agent tự ý mở rộng phạm vi** — nếu nó thêm tính năng không yêu cầu thì chỉ ra và yêu cầu gỡ, chứ đừng giữ lại vì "cũng tiện".
- `Senior` **Tiêu chí nghiệm thu trong prompt nên viết thế nào?**
  → Ở dạng **máy kiểm được**: lệnh test nào phải xanh, file nào không được chạm, con số nào phải nằm trong khoảng nào. "Code sạch, dễ bảo trì" không so sánh được giữa hai lần chạy nên nó không phải tiêu chí. Viết được tiêu chí máy kiểm được cũng là dấu hiệu mình đã đặc tả đủ rõ để giao việc.
- `Senior` **Anh đánh giá một mẫu prompt có tốt hơn mẫu cũ không bằng cách nào?**
  → Bằng eval chứ không bằng cảm giác: một bộ **golden task lấy từ lịch sử repo**, chạy mỗi task ít nhất **ba lần** vì agent không tất định, đổi **một** thứ mỗi lần, và so theo cặp trên cùng task. Chỉ số đáng nhìn nhất là **tỉ lệ xong trong một vòng** và **phần diff bị người sửa lại** — cái thứ hai hay bị bỏ quên nhất.

**Khung trả lời 60 giây** — "Anh viết prompt cho việc kỹ thuật trong gamedev thế nào?"

> Tôi dùng một bộ khung năm phần: **bối cảnh, mục tiêu, ràng buộc, định dạng kết quả, tiêu chí nghiệm thu**. Phần hay thiếu nhất là **ràng buộc**, và đó cũng là nguyên nhân số một khiến kết quả "đúng mà không dùng được" — thiếu ràng buộc thì model rơi về mặc định của ngành, tức là về một game giống mọi game khác.
>
> Tuỳ loại việc thì có mẫu riêng. Cân bằng số: **bắt nó chạy mô phỏng và chạy lại sau khi chỉnh**, đừng nhận con số. Debug: đưa **bằng chứng chứ không đưa kết luận của mình**, và yêu cầu liệt kê giả thuyết kèm cách kiểm chứng **trước khi** sửa — vì sửa ngay thường là sửa triệu chứng. Phản biện thiết kế: đặt vai phản biện và nói rõ đừng mở đầu bằng lời khen.
>
> Và ba thứ tôi tránh: hỏi "cách nào tốt nhất", chấp nhận code mình không đọc, và để agent tự mở rộng phạm vi. Tiêu chí nghiệm thu thì luôn viết ở dạng **máy kiểm được** — lệnh test nào phải xanh, file nào không được chạm.

**Họ sẽ đào tiếp**

- *"Vì sao ràng buộc quan trọng hơn mô tả mục tiêu?"* → Vì mục tiêu thường là thứ AI đoán đúng, còn ràng buộc là thứ nó **không thể suy ra**: engine nào, phiên bản nào, không được dùng thư viện gì, không được đụng file nào, ngân sách hiệu năng bao nhiêu. Mọi thứ mình muốn khác với mặc định đều nằm ở phần ràng buộc.
- *"Đưa bằng chứng thay vì kết luận — vì sao?"* → Vì kết luận của mình **thu hẹp không gian tìm kiếm ngay từ đầu**, và nếu kết luận sai thì agent sẽ đi tìm bằng chứng ủng hộ nó. Đưa log và các bước tái hiện thì nó còn khả năng chỉ ra một nguyên nhân mình chưa nghĩ tới — đó là lý do chính để nhờ.
- *"Yêu cầu chạy lại sau khi chỉnh — chi tiết này đắt không?"* → Không đắt mà là khác biệt giữa có dữ liệu và không. Một đề xuất "giảm tỉ lệ crit xuống 15%" mà chưa chạy lại mô phỏng thì chỉ là phỏng đoán trình bày đẹp. Một dòng trong prompt biến nó thành kết quả kiểm chứng được, và nó cũng buộc agent phát hiện khi đề xuất của chính nó không đạt.
- *"Prompt dài có tốt hơn không?"* → Không tỉ lệ thuận. Cái quan trọng là **đủ ràng buộc và đủ tiêu chí**, còn phần giải thích dài dòng làm loãng. Tôi thà đưa một file luật ngắn cộng một mục lục để agent tự mở phần cần, hơn là dán một bức tường chữ vào mỗi lần hỏi.

**Cờ đỏ**

- Prompt chỉ có mục tiêu, không có ràng buộc.
- Nhận số cân bằng từ AI mà không có mô phỏng.
- Đưa kết luận của mình khi nhờ debug.
- Tiêu chí nghiệm thu viết là "code sạch, dễ bảo trì".
- Giữ lại tính năng agent tự thêm vì "cũng tiện".

**Số / ví dụ nên thuộc**

- Khung năm phần: **bối cảnh · mục tiêu · ràng buộc · định dạng · tiêu chí nghiệm thu**.
- Cân bằng: **bắt chạy mô phỏng**, và **chạy lại sau khi chỉnh**.
- Debug: **bằng chứng, không kết luận**; liệt kê giả thuyết **trước khi** sửa.
- Phản biện: yêu cầu tìm điểm yếu, **đừng mở đầu bằng lời khen**.
- Đánh giá prompt mới: golden task, **n = 3**, đổi một thứ mỗi lần, nhìn **% diff bị sửa lại**.
