---
title: Sinh Asset bằng AI
icon: 🎨
summary: Sprite, âm thanh, nhạc, 3D — công cụ, giới hạn, và vấn đề nhất quán phong cách.
status: stub
read: 590
level: advanced
order: 50
tags: [ai-dev, asset, art]
related: [ai-workflow, game-feel]
---

## Cần bồi đắp

- [ ] Sprite 2D và pixel art: công cụ nào dùng được, quy trình dọn dẹp hậu kỳ
- [ ] Nhất quán phong cách giữa nhiều asset — vấn đề khó nhất
- [ ] Tileset và texture liền mạch
- [ ] SFX và nhạc nền
- [ ] Mô hình 3D và giới hạn thực tế của chúng
- [ ] Giấy phép và bản quyền — cần kiểm tra kỹ trước khi phát hành thương mại
- [ ] Quy trình lai: AI dựng nháp → người chỉnh sửa

## Ghi chú tạm

**Nhất quán là vấn đề chính, không phải chất lượng.** Một sprite đơn lẻ trông ổn. Hai mươi sprite cho cùng một game thì trông như hai mươi game khác nhau. Kỹ thuật giảm thiểu: cố định seed, dùng ảnh tham chiếu, giới hạn bảng màu, và luôn có một bước xử lý hậu kỳ thống nhất.

**Asset tạm tốt hơn asset dở.** Ở giai đoạn prototype, hình khối màu đơn giản còn rõ ràng hơn art AI nửa vời — và không làm bạn bị gắn bó với thứ sẽ phải bỏ đi.

**Kiểm tra giấy phép nghiêm túc trước khi thương mại hoá.** Điều khoản của từng công cụ khác nhau và thay đổi theo thời gian; một số nền tảng phân phối có yêu cầu công bố riêng. Đây là việc phải tự xác minh với nguồn chính thức tại thời điểm phát hành, không nên dựa vào ghi nhớ.

**Âm thanh dễ hơn hình ảnh.** SFX sinh tự động thường dùng được ngay sau chút chỉnh sửa, vì tai người khoan dung với biến thể hơn mắt. Đây là chỗ đáng thử trước.

## 🤖 Prompt cho AI

Vấn đề của asset sinh tự động là **nhất quán**, không phải chất lượng từng cái.

**Phải nêu rõ:**
- Bảng màu cố định (mã hex), giới hạn số màu
- Kích thước, góc nhìn, độ dày nét
- Ảnh tham chiếu hoặc một asset "chuẩn" đã duyệt
- Quy trình hậu kỳ thống nhất

**Mẫu prompt (cho phần quy trình, chạy bằng code)**

```
Viết script xử lý hậu kỳ cho sprite sinh tự động, để ép về cùng phong cách:

- Giảm về đúng bảng màu trong palette.json (16 màu), dùng dithering Bayer
- Cắt viền trong suốt, căn giữa theo bounding box
- Ép về canvas 64x64, giữ tỉ lệ, chân nhân vật chạm đáy
- Thêm viền ngoài 1px màu #1a1423
- Xuất kèm file .meta: pivot ở (0.5, 0), pixels-per-unit 64

Đầu vào: thư mục PNG. Đầu ra: thư mục đã chuẩn hoá + bảng đối chiếu trước/sau.
```

**Bẫy thường gặp:** sinh 20 sprite riêng lẻ rồi ghép lại — trông như 20 game khác nhau. Bảng màu cố định + hậu kỳ tự động là cách rẻ nhất để ép về một phong cách.

**Lưu ý:** điều khoản giấy phép của từng công cụ khác nhau và thay đổi theo thời gian. Trước khi phát hành thương mại, tự xác minh với nguồn chính thức tại thời điểm đó — đừng dựa vào ghi nhớ của AI hay của tài liệu này.
