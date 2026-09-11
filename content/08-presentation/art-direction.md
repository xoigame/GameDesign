---
title: Art Direction
icon: 🖌️
summary: Định hướng nghệ thuật — bảng màu, silhouette, độ đọc được, và cách giữ nhất quán khi nhiều nguồn asset.
status: deep
read: 330
level: intermediate
order: 10
tags: [presentation, art, visual]
related: [level-design, ux-hud, accessibility, asset-generation]
---

Art direction **không phải** là "vẽ đẹp". Nó là tập ràng buộc khiến mọi asset trông như thuộc cùng một thế giới, và khiến người chơi đọc được tình huống trong một phần giây.

## Bắt đầu từ chức năng, không từ phong cách

Trước khi chọn pixel art hay low-poly, trả lời ba câu:

1. **Người chơi cần phân biệt gì trong 0.2 giây?** Bạn/thù, sát thương được/không, đi được/không, tương tác được/không.
2. **Bao nhiêu vật thể trên màn hình cùng lúc?** 5 hay 200? Quyết định mức chi tiết cho phép.
3. **Xem ở kích thước nào?** Nhân vật cao 40px trên điện thoại khác hẳn 400px trên PC.

Phong cách được chọn *sau* để phục vụ ba câu trên. Vampire Survivors dùng pixel art thô không phải vì thẩm mỹ — vì 300 thực thể cùng lúc cần silhouette cực gọn.

## Silhouette — kiểm tra quan trọng nhất

**Tô toàn bộ màn hình thành đen trắng thuần.** Nếu vẫn phân biệt được nhân vật, kẻ địch, vật phẩm và lối đi, thiết kế hình khối của bạn tốt.

Quy tắc thực hành:
- Mỗi loại kẻ địch có **hình bóng khác nhau ở kích thước thu nhỏ 32px**, không chỉ khác màu.
- Nhân vật người chơi phải có yếu tố silhouette độc nhất (mũ, vũ khí, tỉ lệ) không lặp ở NPC nào.
- Vật thể tương tác được có hình dạng riêng nhất quán trong toàn game.

Đây là kiểm tra rẻ nhất và bị bỏ qua nhiều nhất.

## Bảng màu — quyết định sớm, khó đổi

Cấu trúc thường dùng:

```
Nền           4-6 màu  — trầm, độ bão hoà thấp, tương phản thấp với nhau
Vật thể chơi  3-4 màu  — bão hoà cao hơn hẳn nền
Cảnh báo      1-2 màu  — CHỈ dùng cho nguy hiểm, không dùng ở đâu khác
Giao diện     2-3 màu  — tách biệt khỏi cả hai nhóm trên
```

**Luật then chốt: giữ một màu chỉ dành riêng cho nguy hiểm.** Nếu màu đỏ vừa là máu, vừa là nút bấm, vừa là trang trí tường, nó mất hết giá trị cảnh báo. Hades dùng đỏ gần như *chỉ* cho vùng sát thương.

Bão hoà và độ sáng hiệu quả hơn sắc độ trong việc tách nền/tiền cảnh — và vẫn hoạt động với người mù màu. Xem [[accessibility]].

## Giữ nhất quán khi nhiều nguồn

Vấn đề thật của dự án nhỏ: asset đến từ nhiều nơi (mua, tự vẽ, AI sinh, asset store). Cách ép về một phong cách:

- **Bảng màu cưỡng bức** — mọi asset đi qua bước giảm về đúng palette.
- **Độ dày nét thống nhất** — 1px hay 2px, chọn một.
- **Một nguồn sáng** — quyết định hướng sáng (thường trên-trái) và ép mọi asset theo.
- **Cùng pixels-per-unit / cùng tỉ lệ** — sai tỉ lệ là thứ mắt phát hiện ngay dù không gọi tên được.
- **Một lớp hậu kỳ chung** — cùng bộ lọc màu, cùng vignette, cùng grain. Che được nhiều khác biệt.

## Quyết định không sửa được về sau

Chốt từ đầu, vì đổi nghĩa là làm lại toàn bộ asset:

| Quyết định | Ví dụ |
|---|---|
| Độ phân giải tham chiếu | 1920×1080 · 640×360 cho pixel art |
| Pixels-per-unit | 16 · 32 · 64 |
| Tỉ lệ nhân vật | Cao mấy đầu · chiều cao tính bằng px |
| Góc nhìn | Side-on · top-down · isometric 2:1 |
| Bảng màu | Danh sách hex cố định |
| Hướng nguồn sáng | Trên-trái |

## 🤖 Prompt cho AI

AI **không có gu thẩm mỹ và không nhìn thấy game của bạn**. Nhưng nó rất giỏi ép ràng buộc và kiểm tra nhất quán — hãy dùng đúng chỗ đó.

**Phải nêu rõ:**
- Bảng màu bằng mã hex, không mô tả bằng lời ("tông lạnh" là vô nghĩa với máy)
- Độ phân giải tham chiếu + pixels-per-unit
- Hướng nguồn sáng, độ dày nét
- Màu nào dành riêng cho nguy hiểm (và bị cấm dùng ở chỗ khác)

**Mẫu prompt — công cụ kiểm tra, không phải vẽ**

```
Viết công cụ kiểm tra nhất quán art cho thư mục Assets/Art/.

Ràng buộc dự án:
- Palette: 16 màu trong palette.json. Mọi pixel PHẢI khớp một trong 16 màu.
- #E03131 là màu NGUY HIỂM, chỉ được xuất hiện trong Assets/Art/Hazards/
- Pixels-per-unit 32, canvas bội số của 16
- Nguồn sáng trên-trái: pixel sáng nhất phải nằm ở nửa trên-trái của sprite

Công cụ phải:
1. Quét mọi PNG, liệt kê file vi phạm từng ràng buộc
2. Với màu lệch palette, đề xuất màu gần nhất trong palette (khoảng cách CIEDE2000)
3. Xuất báo cáo HTML có preview trước/sau
4. Chế độ --fix tự quy màu về palette (ghi ra thư mục mới, KHÔNG ghi đè)

KHÔNG tự đổi palette. KHÔNG tự quyết ràng buộc nào "hợp lý hơn".
```

**Bẫy thường gặp:** nhờ AI "đề xuất bảng màu cho game fantasy" → nhận về 5 màu tím-vàng quen thuộc trong mọi tutorial. Bảng màu là quyết định nhận diện của game bạn; hãy tự chọn rồi bắt AI thi hành nó.
