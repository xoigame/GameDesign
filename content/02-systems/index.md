---
title: Systems Design
icon: ⚙️
summary: Thiết kế các hệ thống chạy ngầm — kinh tế, tiến trình, chiến đấu, cân bằng số — sao cho chúng sinh ra hành vi thú vị.
status: deep
read: 160
level: basic
order: 20
tags: [systems]
related: [foundations, production]
---

Systems design là nghề **thiết kế luật để hành vi thú vị tự nảy sinh**, thay vì viết sẵn từng tình huống.

Khác biệt cốt lõi so với content design: content design viết ra *"phòng này có 3 con goblin"*; systems design viết ra *"quái spawn theo ngân sách độ khó, goblin giá 2 điểm, cung thủ giá 5"*. Cái sau sinh ra vô số phòng, và quan trọng hơn — **điều chỉnh được**.

## Các node

- **[[economy-design]]** — nguồn vào, nguồn ra, và vì sao lạm phát giết game của bạn.
- **[[progression]]** — người chơi mạnh lên theo cách nào, và với nhịp độ nào.
- **[[combat-systems]]** — giải phẫu một hệ thống chiến đấu: đọc được, đếm được, phản ứng được.
- **[[balancing-math]]** — công thức, bảng số, và mô phỏng để không phải đoán mò.
- **[[difficulty-curve]]** — điều tiết thử thách quanh vùng dòng chảy.
- **[[randomness]]** — RNG dùng đúng chỗ thì tạo kịch tính, sai chỗ thì tạo bất công.
- **[[meta-systems]]** — những gì giữ người chơi giữa các phiên chơi.

## Nguyên tắc

**Hệ thống phải đọc được.** Người chơi cần suy luận được hệ quả hành động trước khi thực hiện. Hệ thống "sâu" mà không ai hiểu thì chỉ là hệ thống ngẫu nhiên.

**Ít luật, nhiều tương tác.** Chiều sâu đến từ số cách các luật giao nhau, không từ số lượng luật. Ba cơ chế tương tác được với nhau thường thú vị hơn mười cơ chế độc lập.

**Mọi hằng số nằm trong file dữ liệu.** Xem [[data-driven-design]]. Đây là điều kiện tiên quyết để cân bằng — và cũng là điều kiện để AI agent chỉnh số mà không phá vỡ logic.

**Thiết kế cho trường hợp suy biến.** Người chơi sẽ tìm ra cấu hình cực đoan nhất. Hệ thống nhân tỉ lệ phần trăm với nhau luôn dẫn tới bùng nổ theo cấp số nhân — hãy cộng trước khi nhân, hoặc đặt trần.

## 🤖 Prompt cho AI

Đây là mảng AI hỗ trợ **hiệu quả nhất** trong toàn bộ quá trình làm game, vì nó thuần toán và mô phỏng:

1. Bạn mô tả hệ thống bằng lời + ràng buộc.
2. AI chuyển thành công thức và bảng số.
3. AI viết script mô phỏng 10.000 lượt chơi.
4. Bạn đọc phân bố kết quả, chỉnh ràng buộc, lặp lại.

Vòng lặp này trước đây tốn hàng tuần. Xem [[balancing-math]] để biết cách làm cụ thể.
