---
title: Nghe nhìn & UX
icon: 🎨
summary: Lớp trình bày — âm thanh, art direction, animation, UI, UX, trợ năng. Thứ người chơi thực sự tiếp xúc.
status: deep
read: 320
level: basic
order: 35
tags: [presentation, audio, art, ui, ux]
related: [game-feel, content-design, foundations]
---

Người chơi không tiếp xúc với hệ thống của bạn. Họ tiếp xúc với **lớp trình bày của hệ thống đó**: tiếng kiếm chạm giáp, độ nặng của animation, cái nút ở đúng chỗ tay với tới.

Nhánh này là lớp giữa **cơ chế** ([[systems]]) và **cảm nhận**.

## Các node

**Hình ảnh**
- **[[art-direction]]** — định hướng nghệ thuật, bảng màu, silhouette, độ đọc được.
- **[[animation-game]]** — animation cho game khác animation phim: timing, cancel, responsiveness.

**Giao diện**
- **[[ui-design]]** — hệ thống UI: lưới, chữ, biểu tượng, trạng thái.
- **[[ux-hud]]** — HUD trong lúc chơi: hiện cái gì, khi nào.
- **[[ux-flow]]** — luồng ngoài lúc chơi: menu, settings, lưu game, lỗi.
- **[[accessibility]]** — trợ năng. Không phải tính năng phụ.

**Âm thanh**
- **[[audio-design]]** — thiết kế SFX: layering, biến thể, chia dải tần.
- **[[audio-implementation]]** — mixing, bus, ducking, âm thanh không gian.
- **[[adaptive-music]]** — nhạc thay đổi theo trạng thái game.

## Ba nguyên tắc xuyên suốt

**Đọc được trước, đẹp sau.** Người chơi cần phân biệt bạn/thù, an toàn/nguy hiểm, tương tác được/không, trong một phần giây. Mọi quyết định thẩm mỹ mâu thuẫn với điều này đều sai — dù nhìn đẹp hơn.

**Mã hoá kép mọi thông tin quan trọng.** Màu + hình dạng. Âm thanh + hình ảnh. Khoảng 8% nam giới mù màu đỏ-lục; một tỉ lệ đáng kể chơi game với âm lượng bằng 0. Thông tin chỉ truyền qua một kênh là thông tin một phần người chơi không nhận được. Xem [[accessibility]].

**Nhất quán quan trọng hơn chất lượng từng phần.** Hai mươi asset xuất sắc nhưng khác phong cách tệ hơn hai mươi asset trung bình mà đồng bộ. Đây cũng là lý do [[asset-generation]] bằng AI khó dùng ở quy mô lớn.

## Vì sao mảng này hay bị bỏ

Lớp trình bày thường bị coi là "đánh bóng, làm sau". Hai vấn đề với suy nghĩ đó:

1. **Nó quyết định ấn tượng 30 giây đầu** — thời điểm phần lớn người chơi quyết định ở lại hay đi. Cơ chế sâu sắc không cứu được một game nhìn và nghe như prototype.
2. **Một số quyết định không sửa được về sau.** Bảng màu, tỉ lệ nhân vật, độ phân giải UI, kiến trúc audio bus — đổi những thứ này ở giai đoạn cuối nghĩa là làm lại toàn bộ asset.

Ranh giới thực dụng: **quyết định hệ thống sớm, sản xuất nội dung muộn.** Chốt bảng màu và audio bus từ đầu; vẽ 200 sprite thì để sau.

## 🤖 Prompt cho AI

Nhánh này là chỗ AI **yếu nhất về thẩm mỹ nhưng mạnh nhất về hệ thống hoá**. Đừng nhờ nó "làm cho đẹp"; hãy nhờ nó dựng hệ thống và kiểm tra ràng buộc.

**Phải nêu rõ** (thiếu là AI dùng mặc định của engine):
- Độ phân giải tham chiếu và tỉ lệ scale
- Bảng màu (mã hex cụ thể) và giới hạn số màu
- Ngân sách: bao nhiêu âm thanh đồng thời, bao nhiêu draw call cho UI
- Ràng buộc trợ năng phải thoả

**Mẫu prompt — dựng hệ thống, không dựng thẩm mỹ**

```
Dựng lớp trình bày cho game <thể loại>, <engine + phiên bản>.

Tôi quyết định thẩm mỹ, bạn dựng HỆ THỐNG để tôi chỉnh nhanh:
- Mọi màu lấy từ một palette asset duy nhất, KHÔNG hardcode màu trong code
- Mọi kích thước UI theo thang 4px, khai báo trong một style config
- Mọi âm thanh đi qua bus (Master > SFX > UI / Ambience / Music), không phát trực tiếp
- Mọi hằng số timing (animation, transition, ducking) nằm trong file dữ liệu

Kèm bộ kiểm tra tự động:
- Phát hiện màu hardcode ngoài palette
- Phát hiện tương phản chữ/nền < 4.5:1
- Phát hiện âm thanh phát không qua bus
- Phát hiện phần tử tương tác có vùng chạm < 44x44px
```

**Bẫy thường gặp:** nhờ AI "thiết kế UI đẹp" → nhận về layout generic kiểu dashboard admin, hardcode màu khắp nơi. Hỏi nó **hệ thống và ràng buộc**, còn thẩm mỹ thì bạn quyết rồi đưa số.

## 🎮 Unity

Nhánh này nói *thiết kế cái gì*. Phần *làm thế nào trong Unity* nằm ở nhánh [[unity]] — cụ thể [[unity-ui]], [[unity-audio]], [[unity-vfx]], [[unity-shader]], [[unity-lighting]], [[unity-animation]].

Mục 🎮 ở đây chỉ làm một việc: **nối quyết định thiết kế vào chỗ nó sống trong Unity project.**

**Bảng tra: quyết định thiết kế → nơi nó nằm trong Unity**

| Quyết định ở nhánh này | Sống ở đâu trong Unity | Node đào sâu |
|---|---|---|
| Bảng màu, độ đọc được | Palette asset + Sprite Atlas | [[unity-shader]], [[unity-lighting]] |
| Thang spacing, thang chữ | `UiTheme` ScriptableObject hoặc USS | [[unity-ui]] |
| Cấu trúc HUD | Canvas phân tầng theo tần suất đổi | [[unity-ui]] |
| Luồng menu, settings | Scene bootstrap + state máy cấp app | [[unity-game-loop]] |
| Cây audio bus, ducking | AudioMixer + Snapshot | [[unity-audio]] |
| Trợ năng | Một static class đọc từ settings | [[accessibility]] |
| Frame data animation | ScriptableObject, **không** Animation Event | [[unity-animation]] |

**Ba thứ chốt trước khi sản xuất asset**

Đổi sau nghĩa là làm lại toàn bộ asset, nên quyết định ngay tuần đầu:

1. **Độ phân giải tham chiếu + pixels-per-unit** — quyết định mọi kích thước sprite.
2. **Color space = Linear** (`Project Settings > Player`). Đổi sau làm mọi màu lệch. Xem [[unity-lighting]].
3. **Cây AudioMixer** — thêm bus sau khi đã có 200 âm thanh phát trực tiếp là việc rất mệt.

**Một ranh giới kiến trúc đáng giữ**

```
Assets/Scripts/
├── Core/          ← luật chơi, KHÔNG using UnityEngine
└── Presentation/  ← nghe/nhìn, đọc trạng thái từ Core qua event
```

Lớp trình bày **chỉ đọc**, không bao giờ quyết định luật chơi. Nhờ vậy đổi hiệu ứng không chạm vào cân bằng, và mô phỏng 10.000 trận không cần render — xem [[balancing-math]].

**Kiểm tra nhanh**
- `grep -r "using UnityEngine" Assets/Scripts/Core/` → rỗng?
- Color space đang là Linear chứ không phải Gamma?
- Mọi màu UI lấy từ một asset duy nhất, không hardcode?
