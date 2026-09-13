---
title: Level & Content Design
icon: 🗺️
summary: Đổ nội dung vào bộ khung hệ thống — màn chơi, nhịp độ, sinh thủ tục, kể chuyện, giao diện.
status: deep
read: 250
level: basic
order: 30
tags: [content]
related: [systems, foundations]
---

Nếu [[systems]] là bộ luật, thì content design là **những tình huống cụ thể** người chơi thực sự đi qua.

## Các node

- **[[level-design]]** — dẫn dắt, tầm nhìn, nhịp không gian, dạy mà không cần tutorial.
- **[[procedural-generation]]** — sinh nội dung bằng thuật toán, và vì sao "vô hạn" thường có nghĩa là "nhạt".
- **[[pacing]]** — nhịp căng–chùng qua toàn bộ hành trình.
- **[[narrative]]** — kể chuyện qua không gian, cơ chế và hệ thống.

> Phần trình bày — giao diện, âm thanh, art direction — đã tách thành nhánh riêng: [[presentation]].

## Nguyên tắc xuyên suốt

**Dạy bằng không gian, đừng dạy bằng chữ.** Căn phòng đầu tiên có một khoảng trống an toàn để thử cơ chế mới sẽ dạy tốt hơn mọi hộp thoại hướng dẫn. Xem cấu trúc răng cưa ở [[difficulty-curve]].

**Nội dung thủ công đặt tiêu chuẩn, thủ tục nhân bản quy mô.** Đừng bắt đầu bằng procedural. Hãy làm 10 màn tay trước, tìm ra điều gì khiến chúng hay, *rồi* mới mã hoá thành luật sinh. Làm ngược lại gần như luôn cho ra nội dung nhạt nhẽo.

**Mật độ quan trọng hơn kích thước.** Bản đồ nhỏ dày đặc quyết định thú vị luôn thắng bản đồ khổng lồ trống rỗng. Đây là sai lầm phổ biến nhất khi có AI hỗ trợ — sinh ra rất nhiều nội dung trở nên quá rẻ.

## 🤖 Prompt cho AI

**Dùng AI thế nào ở nhánh này**

Nội dung là chỗ AI sinh ra với chi phí gần bằng không — vừa là cơ hội vừa là bẫy.

**Trình tự bắt buộc:**

```
1. BẠN làm 3-10 mẫu BẰNG TAY
2. BẠN viết ra VÌ SAO chúng hay
3. AI  mã hoá thành ràng buộc + validator
4. AI  sinh số lượng theo khuôn đó
5. BẠN sàng lọc
```

Bỏ bước 1–2 là cách chắc chắn có 50 nhiệm vụ đúng format mà không cái nào thú vị.

Riêng với procgen, việc đáng nhờ nhất **không phải bộ sinh mà là validator** — nó tốn công hơn và AI viết nhanh hơn. Xem [[procedural-generation]].

AI sinh nội dung với chi phí gần như bằng không, và đó vừa là cơ hội vừa là cái bẫy.

Cơ hội: biến thể, sắp xếp, bản nháp đầu, mô tả vật phẩm, lore rời rạc — AI làm tốt và nhanh.

Cái bẫy: **khối lượng không phải chất lượng**. 500 nhiệm vụ sinh tự động tệ hơn 20 nhiệm vụ viết tay. Nếu người chơi nhận ra nội dung là khuôn mẫu lặp lại, toàn bộ thế giới mất độ tin cậy ngay lập tức.

Cách dùng hợp lý: để AI sinh **nguyên liệu thô và biến thể**, còn con người giữ vai trò **biên tập và sắp đặt**. Xem [[ai-workflow]].

## 🎮 Unity

Nội dung trong Unity là câu hỏi **prefab hay scene hay dữ liệu**. Trả lời sai thì mỗi lần sửa một chi tiết nhỏ phải mở 40 scene.

**Bảng quyết định**

| Thứ | Đặt ở đâu | Vì sao |
|---|---|---|
| Bố cục màn chơi | Scene | Cần sửa bằng mắt, trong không gian |
| Kẻ địch, vật phẩm | Prefab + ScriptableObject | Sửa một chỗ, áp cho mọi bản sao |
| Chỉ số, bảng số | ScriptableObject / CSV | Sửa không cần mở scene |
| Cấu hình procgen | ScriptableObject | Đổi luật sinh không đụng code |
| Hội thoại | Asset text riêng (JSON/CSV) | Dịch được, biên tập được ngoài Unity |

Nguyên tắc: **thứ gì cần nhìn thấy để sửa thì vào scene; còn lại vào dữ liệu.**

**Prefab Variant thay vì kế thừa**

```
Enemy_Base.prefab
├── Enemy_Goblin.prefab       (variant)
├── Enemy_Archer.prefab       (variant)
└── Enemy_Brute.prefab        (variant)
```

Sửa `Enemy_Base` áp cho cả ba; mỗi variant chỉ ghi đè phần khác biệt. Đây là cơ chế Unity làm tốt và ít người dùng đủ — chi tiết ở [[unity-project-structure]].

**Đừng nhồi mọi thứ vào một scene**

Additive scene loading cho phép tách:

```csharp
// Bootstrap luôn tồn tại; nội dung load/unload quanh nó
SceneManager.LoadScene("Bootstrap");
SceneManager.LoadSceneAsync("Level_03", LoadSceneMode.Additive);
```

Lợi ích thật: hai người sửa hai scene khác nhau không conflict. Scene Unity là file text nhưng merge conflict trên scene gần như không giải được — tách scene là cách phòng tránh. Xem [[unity-game-loop]].

**Kiểm tra nhanh**
- Sửa chỉ số một loại quái: có phải mở scene nào không? (không nên)
- Hai người sửa hai màn khác nhau: có conflict không?
- Prefab variant hay copy-paste prefab? (grep số lượng prefab gần giống nhau)

## 🎤 Phỏng vấn

Node con trong nhánh này đều có mục 🎤 riêng. Mục này gom những câu về **nội dung và cách dẫn
người chơi qua nó** — phần việc người phỏng vấn hay kiểm bằng một bài tập nhỏ tại chỗ.

**Content design được hỏi ở ba dạng**

| Dạng | Họ đo cái gì | Node nên ôn |
|---|---|---|
| "Dạy cơ chế này mà không dùng tutorial" | Bạn nghĩ bằng không gian hay bằng hộp thoại | [[level-design]], [[onboarding]] |
| "Màn này lê thê, sửa sao" | Bạn đo được nhịp hay chỉ cảm thấy | [[pacing]] |
| "Sinh nội dung tự động cho game này" | Bạn biết chỗ procgen thường hỏng chưa | [[procedural-generation]], [[narrative]] |

**Câu hay gặp**

- `Junior` **Dạy một cơ chế mới mà không dùng hộp thoại — anh làm thế nào?**
  → **Ba nhịp**: bối cảnh an toàn (thất bại không bị phạt) → áp dụng có phạt → kết hợp với cơ chế cũ. Nấm đầu tiên trong Mario đi *về phía* người chơi trong hành lang kín, nên không thể tránh được việc học. Bỏ nhịp một thì người chơi thấy bất công, bỏ nhịp ba thì họ không bao giờ dùng lại cơ chế đó.
- `Junior` **Người chơi đi lạc trong màn của anh. Sửa từ đâu?**
  → Từ **ánh sáng**, vì nó là tín hiệu mạnh nhất và rẻ nhất để sửa — mắt luôn đi về phía sáng nhất. Rồi thêm landmark thấy được từ nhiều vị trí, rồi kiểm đường dẫn hình học có chỉ sai hướng không. Chỉ tiêu: biết hướng đi **trong 3 giây** sau khi vào phòng mới. Biển chỉ đường là phương án cuối vì nó vá triệu chứng.
- `Mid` **Tester nói "màn này lê thê" nhưng không chỉ được chỗ nào. Anh làm gì?**
  → Định nghĩa một **công thức cường độ đếm được** rồi ghi lại theo thời gian trong lúc họ chơi. Công thức gần như chắc chắn không "đúng" — giá trị của nó là cho một con số để vẽ đồ thị và so với đường cong mục tiêu. Tranh luận đổi từ "tôi thấy hơi lê thê" sang "đoạn này phẳng ở mức 2 suốt 80 giây, ta định vậy không".
- `Mid` **Onboarding mất 40% người chơi. Tìm chỗ hỏng thế nào?**
  → Dựng **phễu bảy sự kiện** trước khi đoán, rồi sửa theo **bước rơi cao nhất** chứ không nhìn tổng tỉ lệ rơi. Hai con số xem đầu tiên: thời gian tới `core_loop_complete` (trung vị nên dưới 60 giây) và thời gian tới `first_death`. Song song đó ngồi xem một người lạ chơi và **im lặng** — chỗ mình buộc phải lên tiếng là chỗ thiết kế đang thiếu.
- `Senior` **Sinh màn tự động cho game của chúng tôi — anh bắt đầu từ đâu?**
  → Từ **ghép phòng**: làm sẵn một tập phòng bằng tay rồi nối theo luật. Nguyên tắc bao trùm là **procgen sắp xếp lại nội dung thủ công, không sinh từ số không** — bài học No Man's Sky là đa dạng thống kê không phải đa dạng cảm nhận. Và phần khó không phải sinh mà là **đảm bảo chơi được**: sinh → kiểm tra → hỏng thì sinh lại.
- `Senior` **Cơ chế và cốt truyện của game mâu thuẫn nhau. Anh xử lý thế nào?**
  → Phát hiện bằng **năm động từ** người chơi làm nhiều nhất — danh sách đó mô tả người như thế nào, có khớp nhân vật trong cốt truyện không. Xử lý theo giá: rẻ nhất là **đổi câu chuyện cho khớp cơ chế**, rồi biến mâu thuẫn thành chủ đề, đắt nhất là đổi cơ chế. Thứ không làm là thêm chữ để giải thích — nó luôn làm mâu thuẫn nổi bật hơn.

**Khung trả lời 60 giây** — "Anh dẫn người chơi qua nội dung thế nào?"

> Bằng **không gian trước, chữ sau**. Thứ tự người chơi đi theo là ánh sáng, chuyển động, tương phản màu, đường dẫn hình học, rồi landmark — và nếu tôi phải đặt biển chỉ đường thì bố cục đã thất bại ở đâu đó. Chữ để dành cho thứ **không suy ra được**: con số, ngưỡng, luật trừu tượng.
>
> Cơ chế mới thì dạy bằng **ba nhịp** — an toàn, có phạt, kết hợp — và một cơ chế mới mỗi phòng, không hơn. Cách đó không cần hộp thoại nào, và người chơi nhớ lâu hơn vì họ học bằng cách chơi.
>
> Về nhịp, tôi không tranh luận bằng tính từ: định nghĩa một **công thức cường độ đếm được**, ghi lại theo thời gian, rồi so với đường cong mục tiêu. Ràng buộc khởi điểm cho màn 12 phút: đúng ba cao trào với cái cuối mạnh nhất, tối thiểu 60 giây cường độ thấp sau mỗi cao trào, tổng đoạn thấp chiếm 25–30%, và không đoạn cao nào kéo quá 45 giây.

**Cờ đỏ**

- Vá chuyện đi lạc bằng mũi tên trên HUD.
- Dạy ba cơ chế trong một phòng rồi tưởng đã dạy xong ba cơ chế.
- Tranh luận nhịp độ hoàn toàn bằng tính từ.
- Coi khoảng lặng là thời gian chết cần cắt.
- Procgen sinh từ số không rồi ngạc nhiên vì mọi màn đều nhạt.

**Số / ví dụ nên thuộc**

- Dẫn dắt: **ánh sáng > chuyển động > tương phản màu > đường dẫn hình học > landmark**; biết hướng trong **3 giây**.
- Ba nhịp dạy cơ chế: **an toàn → có phạt → kết hợp**, giãn **1–2 phút** rồi **trong 5 phút**.
- Ba mốc onboarding: **30 giây · 5 phút · 30 phút**; phễu **7 sự kiện**, sửa theo **bước rơi cao nhất**.
- Nhịp màn 12 phút: **3 cao trào**, **≥ 60 giây** thấp sau mỗi cao trào, đoạn thấp **25–30%**, cao liên tục **≤ 45 giây**.
- Procgen: **ghép phòng trước**, vòng đời **sinh → kiểm tra → sinh lại**.
