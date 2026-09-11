---
title: GDD cho AI đọc
icon: 📋
summary: Viết tài liệu thiết kế mà máy thực thi được — cấu trúc, mức độ cụ thể, và những gì AI luôn bịa nếu bạn không nói.
status: deep
read: 110
level: basic
order: 20
tags: [ai-dev, documentation, spec, key]
related: [design-pillars, agent-guardrails, prompt-patterns, gdd-template]
---

GDD truyền thống viết cho người: dài, nhiều văn vẻ, nhiều hình. GDD cho AI thì ngược lại — **ngắn, đặc, có số, có ràng buộc phủ định**.

## Khác biệt cốt lõi

| GDD cho người | GDD cho AI |
|---|---|
| "Chiến đấu phải nhanh và đã tay" | `attack.startup = 8 frames, hitstop = 90ms` |
| "Kẻ địch đa dạng" | Bảng 6 loại kẻ địch với đầy đủ chỉ số và telegraph |
| "Tiến trình có cảm giác thoả mãn" | `xp_curve = 100 × level^1.8`, mốc mỗi 12–18 phút |
| Mô tả không khí bằng văn xuôi | Từ khoá + tham chiếu + mã màu |
| Ngầm hiểu | **Nêu rõ điều KHÔNG được làm** |

Dòng cuối là dòng bị bỏ sót nhiều nhất và gây thiệt hại nhiều nhất.

## Cấu trúc khuyến nghị

```markdown
# <Tên game> — GDD

## 0. TL;DR
Một đoạn: thể loại, nền tảng, độ dài phiên chơi, điểm khác biệt.

## 1. Design Pillars          ← quan trọng nhất, xem [[design-pillars]]
3 câu + danh sách những gì mỗi câu LOẠI TRỪ.

## 2. Core Loop
Micro / mid / macro, kèm số cụ thể. Xem [[core-loop]].

## 3. Hệ thống
Mỗi hệ thống: mục đích, đầu vào, đầu ra, công thức, bảng số.

## 4. Nội dung
Bảng kẻ địch, bảng vật phẩm, cấu trúc màn chơi.

## 5. Ràng buộc kỹ thuật
Engine, phiên bản, ngôn ngữ, nền tảng đích, ngân sách hiệu năng.

## 6. Bất biến (KHÔNG ĐƯỢC VI PHẠM)
Danh sách luật agent phải tuân thủ. Xem [[agent-guardrails]].

## 7. Không thuộc phạm vi
Những gì game này KHÔNG có. Ngăn AI "giúp" quá đà.
```

Mục 6 và 7 là hai mục phân biệt GDD cho AI với GDD thường. Không có chúng, agent sẽ liên tục thêm tính năng bạn không muốn — vì đó là điều phổ biến nhất trong các dự án tương tự mà nó đã học.

## Mức độ cụ thể cần thiết

Quy tắc: **nếu một con số ảnh hưởng tới cảm giác chơi, hãy viết nó ra.**

Quá mơ hồ:
> ❌ "Nhân vật nhảy cao và điều khiển linh hoạt."

AI sẽ chọn giá trị mặc định của engine, và bạn sẽ mất một buổi chiều để chỉnh.

Vừa đủ:
```yaml
jump:
  height_units: 3.2          # đơn vị = chiều cao nhân vật
  rise_time_ms: 380
  fall_gravity_multiplier: 2.1
  coyote_time_ms: 100
  input_buffer_ms: 120
  variable_height: true      # thả nút sớm = nhảy thấp
  air_control: 0.75          # 1.0 = điều khiển như trên mặt đất
  max_air_jumps: 1
```

Quá chi tiết cũng có hại — đừng viết ra từng dòng code trong tài liệu. Ranh giới: **viết *cái gì* và *bao nhiêu*, để AI quyết định *bằng cách nào*.**

## Những gì AI luôn bịa nếu bạn không nói

Danh sách này rút ra từ thực tế, đáng dán lên tường:

- **Số frame và thời lượng** — mặc định thành giá trị "mượt" chung chung.
- **Đường cong tiến trình** — mặc định tuyến tính hoặc `level × 100`.
- **Xử lý biên** — chuyện gì xảy ra khi HP về 0 giữa lúc đang bị choáng?
- **Thứ tự thực thi** — buff áp trước hay sau khi tính giáp? Ảnh hưởng lớn tới cân bằng.
- **Trạng thái lưu** — cái gì được lưu, lưu lúc nào.
- **Hành vi khi thất bại** — pathfinding không tìm được đường thì sao? (xem [[pathfinding]])
- **Ngân sách hiệu năng** — bao nhiêu thực thể là quá nhiều?

## Nơi đặt tài liệu

Cho agent đọc file trực tiếp thay vì dán vào chat — vừa rẻ hơn vừa luôn cập nhật:

```
project/
├── CLAUDE.md              # điểm vào, chỉ đường tới phần còn lại
├── design/
│   ├── GDD.md             # tài liệu chính
│   ├── invariants.md      # luật cứng
│   └── systems/
│       ├── combat.md
│       └── economy.md
└── data/                  # bảng số agent được phép sửa
    ├── enemies.json
    └── balance.json
```

`CLAUDE.md` ở gốc repo được Claude Code đọc tự động mỗi phiên. Đặt ở đó: chỉ đường, các bất biến quan trọng nhất, và quy ước code. Xem [[data-driven-design]] về việc tách dữ liệu khỏi code.

## Giữ tài liệu sống

GDD lỗi thời tệ hơn không có GDD — agent sẽ thực thi quyết định đã bị bãi bỏ.

Quy tắc thực dụng: **khi thay đổi thiết kế, sửa tài liệu trước, sau đó mới nhờ agent code.** Nếu bạn sửa code trước, tài liệu sẽ không bao giờ đuổi kịp.

Một mẹo hữu ích: cuối mỗi phiên làm việc, nhờ agent *"đọc lại GDD và liệt kê những chỗ code hiện tại đã lệch khỏi tài liệu"*. Nó phát hiện trôi dạt rất tốt.

## 🤖 Prompt cho AI

**Dùng AI thế nào để viết GDD**

Không nhờ nó *viết* GDD — nhờ nó **phỏng vấn** bạn rồi ghi lại. Khác biệt là một bên cho ra tài liệu trung bình của ngành, một bên cho ra tài liệu của game bạn.

Ba chế độ theo thứ tự dùng:

1. **Phỏng vấn** — nó hỏi từng câu, bạn trả lời; nó truy vấn khi câu trả lời thiếu số.
2. **Rà lỗ hổng** — đóng vai agent sắp code, liệt kê mọi chỗ phải tự đoán.
3. **Phát hiện trôi dạt** — cuối mỗi phiên: đọc lại GDD, liệt kê chỗ code đã lệch khỏi tài liệu.

Chế độ 3 là chế độ ít ai dùng và có giá trị cao nhất về lâu dài. GDD lỗi thời tệ hơn không có GDD, vì agent sẽ thực thi quyết định đã bị bãi bỏ.

Bản thân việc **viết GDD** cũng nên nhờ AI — nhưng theo hướng nó phỏng vấn bạn, không phải nó bịa.

**Mẫu prompt phỏng vấn để dựng GDD**

```
Tôi muốn viết GDD cho AI đọc. Hãy PHỎNG VẤN tôi, đừng tự viết.

Quy tắc:
- Hỏi MỖI LẦN MỘT CÂU, chờ tôi trả lời.
- Nếu câu trả lời của tôi mơ hồ hoặc thiếu SỐ CỤ THỂ, hỏi lại cho tới khi có số.
- Đặc biệt truy vấn những thứ AI hay phải tự bịa:
    số frame và thời lượng, đường cong tiến trình, xử lý trường hợp biên,
    thứ tự áp dụng buff/giáp, cái gì được lưu, hành vi khi hệ thống thất bại.
- Sau mỗi 5 câu, tóm tắt lại phần GDD đã dựng được để tôi xác nhận.

Bắt đầu bằng Design Pillars. Với mỗi pillar, hỏi thêm:
"pillar này LOẠI TRỪ tính năng nào?" — nếu tôi không loại trừ được gì,
hãy nói với tôi rằng đó chưa phải pillar.
```

**Mẫu prompt kiểm tra GDD đã viết**

```
Đọc design/GDD.md. Đóng vai agent sắp code từ tài liệu này.

Liệt kê mọi chỗ bạn sẽ phải TỰ QUYẾT ĐỊNH vì tài liệu không nói rõ.
Với mỗi chỗ, ghi: bạn sẽ mặc định chọn gì, và vì sao.

Đừng sửa tài liệu. Đây là danh sách để tôi biết mình còn thiếu gì.
```

**Bẫy thường gặp:** nhờ AI "viết GDD cho game roguelike" → nhận về tài liệu tổng hợp trung bình của ngành, không phải game của bạn. Phỏng vấn thì khác hẳn.

## 🎮 Unity

GDD cho một Unity project cần thêm một mục mà GDD chung không có: **những gì agent không đọc được**.

**Mục bắt buộc thêm cho Unity**

```markdown
## 5b. Trạng thái Unity project (agent KHÔNG thấy được)

Engine       Unity 6000.0.32f1 + URP 17
Color Space  Linear
Timestep     Fixed 0.01667 · Maximum Allowed 0.1
Input        Input System 1.8 (Input Manager cũ đã tắt)
Assemblies   Game.Core (noEngineReferences: true)
             Game.Unity (refs: Game.Core, Unity.InputSystem, Cinemachine)
             Game.Editor (refs: Game.Unity)
Layers       0 Default · 6 Player · 7 Enemy · 8 PlayerProj · 9 EnemyProj · 10 Hazard
Collision    Player ↔ PlayerProj: TẮT
             Enemy  ↔ EnemyProj:  TẮT
Tags         PlayerSpawn, LevelExit, Landmark
AudioMixer   Master > [Music, SFX > (Player,Enemy,World), UI, Ambience]
             Exposed: MusicVol, SfxVol, UiVol, AmbienceVol
Addressables Không dùng (build nhỏ, load trực tiếp)
```

Mỗi dòng ở đây là một lỗi agent sẽ mắc nếu thiếu. Layer number sai làm va chạm không xảy ra; thiếu exposed parameter làm `SetFloat` im lặng không làm gì.

**Số liệu phải có đơn vị Unity**

```yaml
# ❌ mơ hồ
jump: "nhảy cao và linh hoạt"

# ✅ đơn vị Unity cụ thể
jump:
  apex_height_units: 3.2        # Unity unit, PPU 32 -> 102 pixel
  rise_time_s: 0.38
  gravity_scale_rise: 3.0       # Rigidbody2D.gravityScale
  gravity_scale_fall: 6.5
  coyote_frames: 6              # @ Fixed 60Hz
  buffer_frames: 7
  air_control: 0.75
```

`gravityScale` là thuộc tính Unity thật, `units` là đơn vị Unity thật. Agent điền đúng ngay lần đầu.

**Nhờ AI phỏng vấn — thêm câu hỏi Unity**

```
Tôi muốn viết GDD cho Unity project. Hãy PHỎNG VẤN tôi, đừng tự viết.

Ngoài các mục thiết kế thường lệ, truy vấn thêm những thứ chỉ Unity mới có:
- Color space, Fixed Timestep, target frame rate
- Input System mới hay cũ
- Layer và collision matrix
- URP hay Built-in; 2D hay 3D pipeline
- Rigidbody hay tự viết chuyển động (xem [[unity-physics]])
- UGUI hay UI Toolkit
- Có Addressables không
- Assembly Definition thế nào

Hỏi MỖI LẦN MỘT CÂU. Câu trả lời thiếu số cụ thể thì hỏi lại.
```

**Kiểm tra nhanh**
- GDD có mục "trạng thái Unity project" chưa?
- Mọi số liệu chuyển động có đơn vị Unity (unit, gravityScale) chưa?
- Layer number có ghi đúng số, không chỉ ghi tên chưa?
