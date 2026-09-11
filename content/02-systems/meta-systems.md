---
title: Meta Systems
icon: 🏰
summary: Những gì giữ người chơi giữa các phiên — căn cứ, bộ sưu tập, nhiệm vụ hằng ngày, mùa giải.
status: stub
read: 220
level: intermediate
order: 70
tags: [systems, retention, meta]
related: [progression, economy-design, player-motivation]
---

Meta system là mọi thứ tồn tại **bên ngoài** [[core-loop]]: căn cứ để nâng cấp, bộ sưu tập để hoàn thiện, nhiệm vụ hằng ngày để quay lại.

## Cần bồi đắp

- [ ] Căn cứ / nhà chính: cấu trúc nâng cấp và nhịp độ
- [ ] Bộ sưu tập: vì sao nó hiệu quả với nhóm Achiever
- [ ] Nhiệm vụ hằng ngày/tuần — ranh giới giữa "động lực" và "nghĩa vụ"
- [ ] Battle pass và mùa giải: cấu trúc, độ dài, cái bẫy FOMO
- [ ] Tính năng xã hội trong game single-player (bảng xếp hạng, chia sẻ build)

## Ghi chú tạm

Câu hỏi kiểm tra cho mọi meta system: **"nếu bỏ nó đi, game có tệ hơn hay chỉ ngắn hơn?"** Nếu chỉ ngắn hơn, nó là nội dung kéo dài thời gian chứ không phải thiết kế.

Cạm bẫy lớn nhất là **nhiệm vụ hằng ngày biến thành nghĩa vụ**. Khi người chơi đăng nhập vì sợ mất chuỗi ngày chứ không vì muốn chơi, bạn đã chuyển từ động lực nội tại sang ngoại tại — và nghiên cứu tâm lý cho thấy điều này *làm giảm* hứng thú lâu dài. Xem [[player-motivation]].

Biến thể lành mạnh hơn: nhiệm vụ hằng ngày không mất đi (tích luỹ, có trần), phần thưởng cho *đa dạng* thay vì cho *tần suất*, và không bao giờ phạt vì nghỉ.

## 🤖 Prompt cho AI

Meta system là nơi AI nhồi mọi cơ chế giữ chân của ngành nếu bạn không chặn.

**Phải nêu rõ:**
- Meta system phục vụ động lực nào (xem [[player-motivation]])
- Cơ chế giữ chân nào bị **cấm tuyệt đối**
- Người chơi nghỉ 2 tuần rồi quay lại thì mất gì (câu trả lời đúng thường là: không mất gì)

**Mẫu prompt**

```
Thiết kế meta-progression cho roguelike.

Ràng buộc cứng:
- CHỈ mở khoá LỰA CHỌN (vũ khí, nhân vật, biến thể). KHÔNG cộng chỉ số vĩnh viễn.
- KHÔNG chuỗi ngày đăng nhập, KHÔNG timer chờ, KHÔNG nội dung giới hạn thời gian.
- Nhiệm vụ hằng ngày (nếu có) phải TÍCH LUỸ được, có trần 7 ngày,
  và thưởng cho ĐA DẠNG lối chơi chứ không cho tần suất đăng nhập.
- Nghỉ 2 tuần quay lại: không mất gì, không bị tụt hạng.

Với mỗi hệ thống bạn đề xuất, trả lời: "nếu bỏ nó đi, game TỆ HƠN hay chỉ NGẮN HƠN?"
Cái nào chỉ ngắn hơn thì loại.
