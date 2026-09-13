---
title: Nền tảng Game Design
icon: 🎯
summary: Những nguyên lý phải nắm trước khi viết dòng code đầu tiên — core loop, động lực người chơi, MDA, game feel.
status: deep
read: 20
level: basic
order: 10
tags: [foundations]
related: [systems, blueprints]
---

Nhánh này trả lời câu hỏi **"cái gì làm một trò chơi trở nên đáng chơi?"**. Nó đứng trước mọi quyết định kỹ thuật.

## Thứ tự nên đi

1. **[[design-pillars]]** — chốt 3 câu mô tả game của bạn. Mọi quyết định sau đều phải quy chiếu về đây.
2. **[[core-loop]]** — vòng lặp người chơi lặp lại hàng nghìn lần. Nếu vòng này chán, không gì cứu được.
3. **[[player-motivation]]** — vì sao người ta chơi tiếp. Quyết định bạn xây hệ thống gì ở [[systems]].
4. **[[game-feel]]** — độ "đã tay". Khác biệt giữa prototype và game thật thường nằm ở đây, không nằm ở tính năng.
5. **[[mda-framework]]** — ngôn ngữ chung để phân tích: luật chơi nào sinh ra trải nghiệm nào.
6. **[[prototyping]]** — cách kiểm chứng nhanh trước khi đầu tư lớn.

## Sai lầm phổ biến

**Bắt đầu từ tính năng thay vì từ trải nghiệm.** "Game của tôi có crafting, có pet, có PvP" không phải là thiết kế — đó là danh sách mua sắm. Thiết kế là: *"người chơi sẽ cảm thấy gì, vào phút thứ 3, phút thứ 30, và giờ thứ 30?"*

**Nhầm độ phức tạp với chiều sâu.** Thêm 40 chỉ số làm game *phức tạp*. Chiều sâu là khi ít luật sinh ra nhiều tình huống đáng suy nghĩ — cờ vây có 2 luật.

**Bỏ qua 30 giây đầu.** Phần lớn người chơi rời đi trước phút thứ 5. Vòng lặp cốt lõi phải cảm nhận được *ngay*, trước khi mọi hệ thống meta kịp mở khoá.

## 🤖 Prompt cho AI

**Dùng AI thế nào ở nhánh này**

Đây là nhánh AI ít hữu dụng nhất cho việc *quyết định* và hữu dụng nhất cho việc *phản biện*. Dùng nó như một publisher hoài nghi, không như người viết hộ.

Ba việc cụ thể: phản biện pillar (pillar nào không loại trừ được gì?), chỉ ra phiên bản generic của ý tưởng bạn, và truy vấn ngược từ trải nghiệm về cơ chế. Xem [[ai-for-design]].

**Không** nhờ: chốt pillar, đánh giá "có vui không", tinh chỉnh game feel. Xem [[ai-limits]].

AI viết code rất nhanh nhưng **không có trực giác về cảm giác chơi**. Nó không biết animation lag 80ms làm cú đấm mất lực. Vì vậy phần này bạn phải tự quyết định và **viết ra thành số cụ thể** trong [[gdd-for-ai]] — ví dụ "hitstop 90ms, screenshake biên độ 6px trong 120ms" — thay vì mô tả "cho nó đã tay".

## 🎮 Unity

Nhánh này đứng **trước** khi mở Unity. Nhưng ba quyết định ở đây có hệ quả trực tiếp lên project settings, nên biết trước thì đỡ phải làm lại.

**Quyết định thiết kế → project setting**

| Quyết định | Setting bị ảnh hưởng |
|---|---|
| Game có frame data (combat chính xác) | `Time > Fixed Timestep = 0.01667` |
| Game 2D pixel art | `Player > Color Space`, pixels-per-unit, Filter Mode Point |
| Game mobile | `Player > Target Frame Rate`, Graphics API, texture compression |
| Có tay cầm / đổi phím | Input System từ ngày đầu — xem [[unity-input]] |

**Prototype nhanh trong Unity — đừng dựng project "đúng chuẩn"**

Ở giai đoạn [[prototyping]], project sạch sẽ là phản tác dụng. Cách nhanh nhất:

```
Assets/
├── _Proto/          ← tất cả ở đây, không chia thư mục
│   ├── Proto.unity
│   └── Proto.cs     ← một file, mọi thứ trong đó
```

Một scene, một script, hình khối màu. Mục tiêu là trả lời **một câu hỏi** (xem [[prototyping]]), không phải dựng nền móng. Khi câu trả lời là "có, cơ chế này vui", lúc đó mới dựng cấu trúc thật theo [[unity-project-structure]].

Thư mục tên `_Proto` (gạch dưới) để sau này grep và xoá dễ.

**Reset nhanh — thứ quan trọng nhất của prototype**

```csharp
void Update() {
    if (Input.GetKeyDown(KeyCode.R)) SceneManager.LoadScene(0);   // reset tức thì
    if (Input.GetKeyDown(KeyCode.Alpha1)) variant = 0;            // đổi biến thể
    if (Input.GetKeyDown(KeyCode.Alpha2)) variant = 1;
}
```

Vòng lặp đánh giá ngắn quan trọng hơn code đẹp. Xem [[prototyping]].

**Kiểm tra nhanh**
- Prototype reset được trong dưới 1 giây chứ?
- Đổi được giữa các biến thể cơ chế bằng một phím chứ?
- Đã chốt Fixed Timestep trước khi làm combat chưa?

## 🎤 Phỏng vấn

Node con trong nhánh này đều có mục 🎤 riêng. Mục này nói về **hình dạng của vòng phỏng vấn
game design** và những câu bắc ngang nhiều node mà không node nào một mình trả lời được.

**Vòng phỏng vấn design thường có ba chặng**

| Chặng | Họ đo cái gì | Node nên ôn |
|---|---|---|
| Nói chuyện về game bạn thích | Bạn phân tích được hay chỉ kể lại | [[mda-framework]], [[core-loop]], [[player-motivation]] |
| Bài tập thiết kế | Bạn ra quyết định được và nói được vì sao | [[design-pillars]], [[genre-conventions]], [[prototyping]] |
| Đào sâu theo hồ sơ | Bạn từng chịu hậu quả của một quyết định chưa | [[prototyping]], [[game-feel]] |

**Câu hay gặp**

- `Junior` **Kể về một game anh thích và vì sao nó hay.**
  → Đừng kể cốt truyện. Trả lời theo ba tầng MDA: **mechanic** cụ thể nào, nó tạo ra **dynamic** gì, và dynamic đó cho **cảm xúc** nào. Rồi thêm một câu về cái giá: game đó đánh đổi gì để có được điều đó. Kể lại nội dung là câu trả lời của người chơi; tách được ba tầng là câu trả lời của người thiết kế.
- `Junior` **Game của chúng tôi chán ở phút thứ mười. Anh nhìn vào đâu đầu tiên?**
  → Vào **core loop**, không vào nội dung. Chạy test không phần thưởng: tắt hết điểm, XP, loot — hành động cốt lõi còn vui không. Rồi hỏi lần lặp thứ 100 có khác lần đầu không. Chán ở phút mười gần như luôn là thiếu biến số hoặc thiếu chiều sâu quyết định, chứ không phải thiếu nội dung.
- `Mid` **Sếp muốn thêm một tính năng anh cho là sai. Anh phản hồi thế nào?**
  → Không tranh luận về tính năng mà đưa **design pillar và danh sách loại trừ** ra, rồi hỏi: ta đổi pillar hay đổi tính năng? Câu đó biến một cuộc cãi nhau về sở thích thành một quyết định có phạm vi. Nếu vẫn làm thì ghi lại lý do — pillar bị bào mòn lặng lẽ là cách game trôi dạt thành mớ tính năng chắp vá.
- `Mid` **Anh quyết định prototype cái gì trước?**
  → Chấm mọi giả định hai điểm 1–5: **mình không chắc tới đâu**, và **thiệt hại nếu sai**. Nhân hai điểm, làm ba cái đầu bảng. Giả định rủi ro nhất thường không phải về gameplay mà về người chơi hoặc thị trường — loại đó sai ở tháng thứ sáu và làm lại cả dự án.
- `Senior` **Làm sao anh biết một thiết kế đã đủ tốt để đi tiếp?**
  → Bằng **vertical slice** chứ không bằng tài liệu: một lát cắt hoàn chỉnh có juice, rồi xem người lạ chơi mà mình im lặng. Tiêu chí kiểu mẫu là 3/5 tester tự nhận ra điều mình không dạy. Không đạt thì quay lại thiết kế — nhân rộng nội dung trên một core loop nhạt chỉ tạo ra nhiều nội dung nhạt hơn.
- `Senior` **Anh cân bằng giữa làm theo quy ước thể loại và làm khác đi thế nào?**
  → Xếp quy ước thành ba lớp theo chi phí dạy lại: **từ vựng · cấu trúc · kỳ vọng lõi**. Phá lớp từ vựng gần như luôn lỗ; lớp cấu trúc là chỗ đổi mới thật xảy ra. Và mỗi lần chỉ phá một thứ, kèm câu trả lời cho "tôi trả tiền ở đâu" — bù bằng gì cho thứ vừa lấy đi.

**Khung trả lời 60 giây** — "Anh tiếp cận một bài toán thiết kế mới thế nào?"

> Tôi bắt đầu từ **cảm xúc đích**, không từ tính năng: game này bán hai loại trải nghiệm nào trong tám loại aesthetics. Rồi mới truy ngược về dynamic và mechanic — đó là chiều thiết kế, ngược với chiều người chơi trải nghiệm.
>
> Từ cảm xúc đích tôi viết **hai tới ba pillar**, mỗi cái kèm **danh sách loại trừ**. Pillar mà không giết được tính năng nào thì chưa phải pillar, và phần loại trừ mới là phần được dùng tới trong các cuộc họp.
>
> Sau đó tôi không viết tiếp tài liệu mà đi **kiểm chứng giả định rủi ro nhất**: chấm điểm độ không chắc chắn nhân thiệt hại nếu sai, prototype ba cái đầu bảng, mỗi cái một phiếu năm dòng có **tiêu chí thất bại**. Và chốt chặn là core loop — bốn phép thử một câu, ba mươi giây, không phần thưởng, lần thứ một trăm. Qua được thì mới nói tới nội dung.

**Cờ đỏ**

- Kể lại nội dung game thay vì tách mechanic, dynamic, aesthetic.
- Pillar là tính từ, không có danh sách loại trừ.
- Chữa "game chán" bằng cách thêm hệ thống, chưa từng chạy test không phần thưởng.
- Prototype cái dễ làm thay vì cái rủi ro nhất.
- Muốn phá quy ước thể loại mà không nói được trả tiền ở đâu.

**Số / ví dụ nên thuộc**

- MDA: **mechanic → dynamic → aesthetic**; thiết kế đi **ngược chiều** người chơi trải nghiệm.
- Tám aesthetics, **chọn 2**; ba lớp quy ước: **từ vựng · cấu trúc · kỳ vọng lõi**.
- Bốn phép thử core loop: **một câu · 30 giây · không phần thưởng · lần thứ 100**.
- Ba tầng lặp: micro **1–10 s** · mid **2–10 phút** · macro **nhiều giờ**.
- Ma trận prototype: **độ không chắc chắn × thiệt hại nếu sai**; phiếu **5 dòng** có tiêu chí thất bại.
