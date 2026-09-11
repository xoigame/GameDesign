---
title: Performance
icon: ⚡
summary: Ngân sách frame, profiling, và những nguyên nhân giật lag phổ biến nhất.
status: stub
read: 480
level: advanced
order: 50
tags: [production, optimization]
related: [architecture-patterns, pathfinding, data-driven-design]
---

## Ngân sách frame

| Mục tiêu | Ngân sách mỗi frame |
|---|---|
| 30 FPS | 33.3 ms |
| 60 FPS | 16.6 ms |
| 120 FPS | 8.3 ms |

Ở 60 FPS, ngân sách thực tế nên là **~12ms** — chừa biên độ cho biến động và cho máy yếu hơn máy bạn.

## Cần bồi đắp

- [ ] Quy trình profiling: đo trước, đoán sau
- [ ] Phân bổ ngân sách: render / logic / physics / AI
- [ ] Áp lực GC và cách loại bỏ cấp phát
- [ ] Draw call, batching, atlas
- [ ] LOD và culling
- [ ] Tối ưu riêng cho mobile

## Ghi chú tạm

**Giật lag tệ hơn FPS thấp đều.** 60 FPS với một cú khựng 200ms mỗi 10 giây cảm thấy tệ hơn 40 FPS ổn định. Ưu tiên loại bỏ spike trước khi nâng FPS trung bình.

**Ba nguyên nhân giật lag phổ biến nhất trong game indie:**
1. **Cấp phát trong vòng lặp mỗi frame** → GC chạy → khựng. Xem object pooling ở [[architecture-patterns]].
2. **Instantiate/Destroy lúc chạy** → cùng vấn đề, nghiêm trọng hơn.
3. **Nhiều agent tìm đường trong cùng một frame** → xem [[pathfinding]] về việc trải đều theo thời gian.

**Đo trước, tối ưu sau.** Trực giác về hiệu năng gần như luôn sai. Nguyên nhân thật thường nằm ở chỗ bạn không ngờ tới.

**AI viết code đúng nhưng hay tốn.** Agent mặc định ưu tiên code sạch và dễ đọc — LINQ trong vòng lặp, nối chuỗi, cấp phát vô tư. Hãy đưa ràng buộc hiệu năng vào prompt ngay từ đầu, đừng để tối ưu sau. Xem [[agent-guardrails]].

## 🤖 Prompt cho AI

AI viết code sạch và **tốn**. Ràng buộc hiệu năng phải đưa từ đầu, không phải tối ưu sau.

**Phải nêu rõ:**
- Ngân sách ms/frame cho hệ thống đang làm
- Cấm cấp phát trong vòng lặp nóng, nói rõ cấm cái gì
- Số lượng đối tượng ở tình huống xấu nhất
- Nền tảng yếu nhất phải chạy được

**Mẫu prompt**

```
Ràng buộc hiệu năng cho MỌI code trong phiên này:

Ngân sách: hệ thống này <= 1.5ms/frame ở tình huống xấu nhất (200 thực thể).
Nền tảng yếu nhất: mobile tầm trung, 60 FPS.

TRONG vòng lặp mỗi frame, CẤM:
- new / Instantiate / Destroy
- LINQ (Where, Select, OrderBy, Any...)
- Nối chuỗi, string.Format, interpolation
- GetComponent, Find, FindObjectOfType
- foreach trên collection trả về struct enumerator bị boxing

BẮT BUỘC:
- Object pool cho mọi thứ spawn lúc chạy
- Cache mọi tham chiếu component trong Awake
- Mảng/List cấp phát sẵn, tái dùng qua các frame

Sau khi viết xong, tự rà lại code và chỉ ra mọi chỗ còn cấp phát.
```

**Bẫy thường gặp:** giật lag định kỳ do GC, không phải FPS thấp. 60 FPS có một cú khựng 200ms mỗi 10 giây cảm thấy tệ hơn 40 FPS ổn định.
