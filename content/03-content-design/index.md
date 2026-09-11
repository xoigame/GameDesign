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
