---
title: Chọn Tech Stack
icon: 🔧
summary: Engine, ngôn ngữ, công cụ — chọn theo dự án và theo mức độ AI hỗ trợ được.
status: stub
read: 570
level: intermediate
order: 40
tags: [production, tooling]
related: [architecture-patterns, performance, ai-workflow]
---

## Cần bồi đắp

- [ ] So sánh Unity / Godot / Unreal / web (Phaser, three.js) theo loại dự án
- [ ] Tiêu chí chọn: quy mô, nền tảng đích, kinh nghiệm sẵn có, giấy phép
- [ ] Chi phí chuyển engine giữa chừng
- [ ] Chuỗi công cụ: version control cho asset lớn, CI, build tự động

## Ghi chú tạm

**Một tiêu chí mới đáng cân nhắc: AI hỗ trợ engine này tốt tới đâu?**

Yếu tố ảnh hưởng trực tiếp tới năng suất khi làm việc với agent:
- Lượng tài liệu và code công khai của engine (engine phổ biến → AI viết chính xác hơn).
- Ngôn ngữ có kiểm tra kiểu tĩnh giúp phát hiện lỗi AI sinh ra sớm hơn.
- Engine có API ổn định thì ít gặp vấn đề model dùng API đã lỗi thời.
- Dự án dạng text (scene là file text) thì AI đọc/sửa được; dự án dạng binary thì không.

Điểm cuối đáng chú ý: Godot lưu scene dưới dạng text nên agent có thể đọc và sửa trực tiếp. Unity dùng YAML nên đọc được nhưng dễ hỏng nếu sửa tay. Với Unreal, blueprint là binary — agent gần như không can thiệp được, phải làm qua C++.

**Luôn nêu rõ phiên bản engine trong prompt.** Tri thức của model có thời điểm cắt; engine thì cập nhật liên tục. Không nêu phiên bản là nguồn lỗi "API không tồn tại" phổ biến nhất.

## 🤖 Prompt cho AI

Đây là quyết định khó đảo ngược nhất, nên hãy bắt AI phản biện thay vì gợi ý.

**Mẫu prompt**

```
Tôi đang chọn engine cho dự án này:
- Thể loại: <...>
- Quy mô: <số thực thể, 2D/3D, single/multi>
- Nền tảng đích: <...>
- Kinh nghiệm sẵn có của tôi: <...>
- Tôi sẽ làm phần lớn code CÙNG VỚI AI agent.

So sánh <Unity 6> và <Godot 4> cho trường hợp NÀY, gồm cả tiêu chí:
"agent đọc và sửa được project tới mức nào?" (file text hay binary,
độ ổn định API, lượng tài liệu công khai).

Khuyến nghị MỘT cái. Nói rõ cái gì tôi sẽ mất khi chọn nó.
Ước tính chi phí chuyển engine nếu 6 tháng nữa tôi đổi ý.
```

**Luôn nêu phiên bản chính xác trong mọi prompt sau đó.** `Unity 6` khác `Unity 2021` rất nhiều; model sẽ dùng API của phiên bản phổ biến nhất trong dữ liệu huấn luyện nếu bạn không nói.

**Bẫy thường gặp:** hỏi "engine nào tốt nhất" → nhận về bảng so sánh chung chung ai cũng viết được. Ràng buộc cụ thể mới cho ra khuyến nghị dùng được.

## 🎮 Unity

Bạn đã chọn Unity, nên mục này nói về **quyết định bên trong Unity** — những lựa chọn khó đảo ngược.

**Bảng quyết định khó đảo ngược**

| Quyết định | Lựa chọn | Chi phí đổi sau |
|---|---|---|
| Render pipeline | URP / Built-in / HDRP | Rất cao — mọi shader và lighting |
| Input | Input System mới / Manager cũ | Cao — mọi script đọc input |
| UI | UGUI / UI Toolkit | Cao — mọi màn hình |
| Chuyển động | Rigidbody / tự viết | Cao — mọi collision |
| Color space | Linear / Gamma | Rất cao — mọi màu và art |
| Assembly Definition | Có / không | Trung bình, nhưng càng để lâu càng đắt |
| Addressables | Có / không | Trung bình |
| Netcode | NGO / Fish-Net / Photon / không | Rất cao — xem [[unity-multiplayer]] |

**Khuyến nghị mặc định cho dự án indie 2026**

```
Render        URP            (Built-in đang bảo trì; HDRP quá nặng cho indie)
Input         Input System   (đổi phím, tay cầm, không phải tự viết)
UI            UGUI cho in-game HUD; UI Toolkit cho editor tool
Color space   Linear
Assembly      Game.Core (noEngineReferences) + Game.Unity + Game.Editor
Addressables  Không, trừ khi build > 500MB hoặc cần DLC
Netcode       Không, trừ khi multiplayer là pillar
```

Lý do URP thay vì Built-in: Built-in không còn nhận tính năng mới, và phần lớn asset/tutorial mới đều giả định URP. Chi tiết ở [[unity-lighting]].

**Tiêu chí "agent sửa được tới đâu"**

Đây là tiêu chí mới đáng cân nhắc khi làm cùng AI:

| Thứ | Agent sửa được? |
|---|---|
| C# script | ✅ hoàn toàn |
| UXML / USS (UI Toolkit) | ✅ text thuần |
| ScriptableObject `.asset` | ⚠️ là YAML, đọc được nhưng sửa dễ hỏng GUID |
| `.prefab` / `.unity` | ❌ đừng để agent sửa |
| Animator Controller | ❌ |
| Shader Graph | ❌ (HLSL viết tay thì ✅) |
| ProjectSettings | ❌ agent không thấy |

Hệ quả thực dụng: **đẩy càng nhiều quyết định vào C# và ScriptableObject càng tốt**, vì đó là phần agent làm được. Mọi thứ nằm trong Editor asset là phần bạn phải tự làm.

**Phiên bản Unity — LTS hay mới nhất?**

LTS cho dự án dự kiến kéo dài hơn một năm. Bản mới nhất nếu cần tính năng cụ thể. Đừng nhảy phiên bản giữa dự án trừ khi có bug chặn — nâng phiên bản Unity là việc cả tuần.

**Kiểm tra nhanh**
- Color space đang Linear chứ?
- Input Manager cũ đã tắt chưa?
- Assembly Definition đã có chưa? (`Game.Core` với `noEngineReferences`)
- Phiên bản Unity có ghi trong `CLAUDE.md` chưa?
