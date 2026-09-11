---
title: Production & Tech
icon: 🏭
summary: Biến prototype thành sản phẩm — kiến trúc, data-driven, đo đạc, hiệu năng.
status: deep
read: 530
level: basic
order: 60
tags: [production, tech]
related: [systems, ai-assisted-dev]
---

Nhánh này về **cách xây** chứ không về **xây cái gì**.

## Các node

- **[[architecture-patterns]]** — ECS, component, event bus, state machine ở tầng ứng dụng.
- **[[data-driven-design]]** — tách dữ liệu khỏi code. Điều kiện tiên quyết để cân bằng và để AI hỗ trợ hiệu quả.
- **[[playtesting-metrics]]** — đo cái gì, đo thế nào, và cách đọc kết quả.
- **[[tech-stack]]** — chọn engine và công cụ.
- **[[performance]]** — ngân sách và tối ưu.

## Nguyên tắc

**Kiến trúc phục vụ tốc độ lặp.** Ở giai đoạn tìm tòi, thứ quan trọng nhất là *sửa và thử nhanh*. Kiến trúc đẹp mà mỗi lần đổi số phải build lại 3 phút là kiến trúc sai cho giai đoạn đó.

**Đừng tối ưu sớm, nhưng hãy đo sớm.** Đặt profiler vào từ đầu. Bạn không cần tối ưu ngay, nhưng cần biết khi nào mọi thứ bắt đầu xấu đi — và phát hiện sớm thì rẻ hơn nhiều.

**Dữ liệu tách khỏi code là quyết định kiến trúc quan trọng nhất.** Nó quyết định bạn cân bằng game được nhanh tới đâu, và quyết định AI agent sửa số được an toàn tới đâu. Xem [[data-driven-design]].

## 🤖 Prompt cho AI

Kiến trúc tốt khiến AI agent hiệu quả hơn rõ rệt:

- **Ranh giới rõ ràng** → agent sửa một hệ thống mà không phá hệ thống khác.
- **Có test** → agent tự kiểm chứng được thay đổi của mình.
- **Dữ liệu ngoài code** → chỉnh cân bằng không cần đụng tới logic.
- **Quy ước nhất quán** → code sinh ra khớp với phần còn lại của dự án.

Ngược lại, một codebase rối sẽ khiến agent tạo ra nhiều lỗi hơn — nó không thấy được toàn cảnh và sẽ đoán.
