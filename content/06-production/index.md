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

**Dùng AI thế nào ở nhánh này**

Nhánh này AI làm được gần hết, vì nó thuần kỹ thuật và kiểm chứng được. Ba việc có ROI cao nhất — đều là việc lập trình viên hay làm sơ sài vì nhàm:

1. **Editor tool và validator** — không đụng gameplay nên rủi ro thấp, mà tiết kiệm thời gian thật mỗi ngày.
2. **Unit test cho logic thuần** — nó viết test tốt hơn nhiều người, và test là thứ cho phép nó tự kiểm chứng về sau.
3. **CI, build script** — thuần script, chạy được là biết đúng.

Việc **không** nhờ: quyết định kiến trúc mà chưa có số liệu. Hỏi "kiến trúc nào tốt hơn" mà không nêu số thực thể và ngân sách frame sẽ nhận về ECS cho một game 40 thực thể.

Kiến trúc tốt khiến AI agent hiệu quả hơn rõ rệt:

- **Ranh giới rõ ràng** → agent sửa một hệ thống mà không phá hệ thống khác.
- **Có test** → agent tự kiểm chứng được thay đổi của mình.
- **Dữ liệu ngoài code** → chỉnh cân bằng không cần đụng tới logic.
- **Quy ước nhất quán** → code sinh ra khớp với phần còn lại của dự án.

Ngược lại, một codebase rối sẽ khiến agent tạo ra nhiều lỗi hơn — nó không thấy được toàn cảnh và sẽ đoán.

## 🎮 Unity

Toàn bộ nhánh này có bản Unity chi tiết ở [[unity]]: [[unity-project-structure]], [[unity-design-patterns]], [[unity-optimization]], [[unity-build-platform]].

**Ba thứ dựng trong tuần đầu, không để sau**

1. **Assembly Definition** — `Game.Core` với `noEngineReferences: true`. Nó cho bạn test EditMode nhanh và mô phỏng ngoài Unity; thêm sau nghĩa là sửa hàng trăm `using`.
2. **`.gitignore` đúng cho Unity** — `Library/`, `Temp/`, `Logs/`, `obj/`, `*.csproj`, `*.sln`. Commit `Library/` một lần là repo phình lên hàng GB.
3. **Build ra máy đích** — không phải cuối dự án, mà tuần đầu. IL2CPP, stripping, và giới hạn bộ nhớ chỉ lộ ra ở build thật. Xem [[unity-build-platform]].

**Git cho Unity — ba thứ bắt buộc**

```
# .gitattributes — KHÔNG có dòng này thì scene/prefab merge sẽ hỏng im lặng
*.unity   binary
*.prefab  binary
*.asset   binary
```

Đánh dấu binary làm git **từ chối** merge thay vì merge sai. Bạn sẽ phải chọn một bên — mệt, nhưng tốt hơn một scene hỏng không ai biết.

Và bật **Force Text** cho serialization (`Project Settings > Editor > Asset Serialization > Force Text`) để diff đọc được, dù vẫn treat as binary khi merge.

**Meta file phải commit**

`.meta` giữ GUID. Không commit `.meta` nghĩa là mọi tham chiếu vỡ trên máy người khác. Đây là lỗi phổ biến nhất khi người mới setup Unity repo.

**Kiểm tra nhanh**
- `git check-attr merge Assets/Scenes/Main.unity` → binary?
- `.meta` có được commit không?
- `Library/` có trong `.gitignore` không?
- Đã build ra máy đích ít nhất một lần chưa?
