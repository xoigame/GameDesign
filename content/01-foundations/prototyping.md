---
title: Prototyping
icon: 🧪
summary: Kiểm chứng câu hỏi rủi ro nhất bằng công sức nhỏ nhất — và vì sao AI làm khâu này rẻ đi mười lần.
status: stub
read: 80
level: basic
order: 70
tags: [foundations, process]
related: [core-loop, ai-workflow, playtesting-metrics]
---

Prototype không phải là "phiên bản nhỏ của game". Nó là **một thí nghiệm trả lời một câu hỏi cụ thể**.

## Cần bồi đắp

- [ ] Cách xác định giả định rủi ro nhất trong dự án
- [ ] Paper prototype cho game hệ thống
- [ ] Vertical slice vs horizontal prototype — khi nào dùng cái nào
- [ ] Tiêu chí quyết định: giữ / xoay hướng / bỏ
- [ ] Prototype AI-first: nhờ agent dựng 3 biến thể cơ chế rồi so sánh

## Ghi chú tạm

Mỗi prototype cần viết ra trước khi làm:

```
Câu hỏi:    Cơ chế đẩy-lùi có tạo ra quyết định thú vị không?
Giả định:   Người chơi sẽ đánh đổi giữa vị trí và sát thương.
Thành công: 3/5 tester tự nhận ra cách kết hợp mà tôi không dạy.
Thất bại:   Ai cũng spam một nút.
Ngân sách:  1 ngày.
```

Không có tiêu chí thất bại viết trước, mọi prototype đều "thành công" và bạn không học được gì.

**Điều AI thay đổi:** dựng 5 biến thể cơ chế trong một buổi chiều giờ là chuyện khả thi. Nút thắt chuyển từ *thời gian code* sang *thời gian playtest*. Vì vậy hãy đầu tư vào việc rút ngắn vòng lặp đánh giá — hotkey reset, chỉnh tham số trong lúc chạy, ghi log tự động. Xem [[data-driven-design]].

## 🤖 Prompt cho AI

Prototype là **thí nghiệm**, không phải bản thu nhỏ của game. Prompt phải nói rõ câu hỏi cần trả lời, nếu không AI sẽ dựng một game mini hoàn chỉnh mà chẳng kiểm chứng được gì.

**Phải nêu rõ:**
- Câu hỏi duy nhất prototype này trả lời
- Tiêu chí thành công **và tiêu chí thất bại** (viết trước, nếu không mọi prototype đều "thành công")
- Ngân sách: bao nhiêu file, bao nhiêu dòng, bao lâu
- Những gì **không cần** làm (art, âm thanh, menu, lưu game)

**Mẫu prompt**

```
Prototype kiểm chứng MỘT câu hỏi: "cơ chế đẩy-lùi có tạo quyết định thú vị không?"

Phạm vi tối thiểu:
- Hình khối màu, KHÔNG art, KHÔNG âm thanh, KHÔNG menu, KHÔNG lưu game
- 1 màn hình, 1 người chơi, 3 kẻ địch đứng yên
- Hotkey R để reset tức thì
- Mọi hằng số phơi ra một file config, sửa được trong lúc chạy

Dựng 3 BIẾN THỂ của cơ chế đẩy (đẩy theo hướng đánh / đẩy ra xa tâm /
đẩy đổi chỗ), chuyển đổi bằng phím 1-2-3 để tôi so sánh trực tiếp.
```

**Bẫy thường gặp:** AI "giúp" bằng cách thêm menu, hệ thống lưu, màn hình thua. Mỗi thứ đó là thời gian không dùng để trả lời câu hỏi. Câu `KHÔNG art, KHÔNG menu` phải viết ra.

## 🎮 Unity

Unity rất tốt cho prototype, nhưng chỉ khi bạn **cố tình làm bừa**. Dựng cấu trúc sạch ở giai đoạn này là phản tác dụng.

**Quy tắc prototype trong Unity**

```
Assets/_Proto/           ← gạch dưới để grep và xoá dễ
├── Proto.unity          ← MỘT scene
├── Proto.cs             ← MỘT file, mọi logic trong đó
└── Cube.mat             ← hình khối màu, KHÔNG art
```

Không ScriptableObject, không interface, không thư mục theo feature. Mục tiêu là trả lời **một câu hỏi**, và mọi thứ khác là chi phí.

**Ba phím phải có**

```csharp
void Update() {
    if (Input.GetKeyDown(KeyCode.R)) SceneManager.LoadScene(0);        // reset
    if (Input.GetKeyDown(KeyCode.F1)) variant = (variant + 1) % 3;     // đổi biến thể
    if (Input.GetKeyDown(KeyCode.F2)) slowMo = !slowMo;                // xem chậm
    Time.timeScale = slowMo ? 0.25f : 1f;
}
```

`R` để reset là phím quan trọng nhất. Nếu phải bấm Stop → Play mỗi lần thử (3–5 giây khởi tạo domain), bạn sẽ thử ít hơn mười lần so với khi reset tức thì.

**Tắt Domain Reload để Play nhanh hơn**

`Project Settings > Editor > Enter Play Mode Options` → bật, và **tắt Reload Domain**.

Play Mode vào gần như tức thì thay vì 3–5 giây. Đổi lại: `static` không tự reset, nên phải tự dọn:

```csharp
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
static void ResetStatics() { instance = null; cache.Clear(); }
```

Với prototype (ít static) thì gần như miễn phí. Với project lớn thì cân nhắc — chi tiết ở [[unity-game-loop]].

**Ba biến thể cùng lúc, không lần lượt**

```csharp
// Prototype giá trị nhất là cái SO SÁNH được ngay
switch (variant) {
    case 0: knockback = velocity.normalized * force; break;          // đẩy theo hướng đánh
    case 1: knockback = (target - center).normalized * force; break; // đẩy ra xa tâm
    case 2: knockback = -velocity.normalized * force; break;         // đẩy về phía mình
}
```

Bấm F1 đổi giữa ba cái trong một giây. So sánh trực tiếp cho câu trả lời rõ hơn nhiều so với thử lần lượt qua ba buổi.

**Khi nào dừng prototype**

Khi bạn trả lời được câu hỏi đã viết ra. Rồi **xoá `_Proto/`** và dựng lại theo [[unity-project-structure]] — đừng cố refactor prototype thành production. Code prototype mang theo mọi quyết định tạm bợ.

**Kiểm tra nhanh**
- Reset được dưới 1 giây chứ?
- Đã tắt Domain Reload chưa?
- Đã viết ra câu hỏi và tiêu chí thất bại TRƯỚC khi code chưa?
- Có art nào trong `_Proto/` không? (không nên có)
