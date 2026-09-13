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

**Dùng AI thế nào ở nhánh này**

Nhánh này AI **yếu nhất về thẩm mỹ, mạnh nhất về hệ thống hoá**. Chia việc theo đúng ranh giới đó:

| Nhờ AI | Tự làm |
|---|---|
| Dựng design system từ thông số bạn đưa | Chọn bảng màu, font, phong cách |
| Viết validator (tương phản, vùng chạm, palette) | Đánh giá "trông có ổn không" |
| Kiến trúc audio bus, ducking table | Nghe và chỉnh mix |
| Pipeline ép asset về một phong cách | Duyệt asset |
| Frame data → animation state machine | Chỉnh timing cho đã tay |

Câu mở đầu hiệu quả: *"tôi quyết định thẩm mỹ, bạn dựng hệ thống để tôi chỉnh nhanh"*. Câu dẫn tới thất vọng: *"thiết kế UI đẹp cho tôi"*.

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

## 🎤 Phỏng vấn

Node con trong nhánh này đều có mục 🎤 riêng. Mục này gom câu hỏi bắc ngang **nghe, nhìn và UX** —
phần mà người phỏng vấn hay kiểm bằng cách đưa một ảnh chụp màn hình và hỏi bạn thấy gì.

**Nhánh này được hỏi ở ba dạng**

| Dạng | Họ đo cái gì | Node nên ôn |
|---|---|---|
| "Nhìn ảnh này, anh sửa gì" | Bạn đọc được khả năng đọc hay chỉ thấy đẹp/xấu | [[ux-hud]], [[art-direction]], [[ui-design]] |
| "Làm game này cảm thấy đã tay hơn" | Bạn có số hay chỉ có tính từ | [[animation-game]], [[audio-design]] |
| "Trợ năng thì làm gì" | Bạn coi nó là kiến trúc hay là hạng mục cuối | [[accessibility]], [[ux-flow]] |

**Câu hay gặp**

- `Junior` **Ba phép thử nào áp được cho gần như mọi thứ trong nhánh này?**
  → **Hình bóng đen** — tô màn hình thành đen trắng thuần, còn phân biệt được nhân vật, địch, vật phẩm, lối đi không. **Tắt tiếng** — không nghe gì thì còn chơi được không. **Tắt HUD** — ẩn hết thì còn chơi được ở mức cơ bản không. Ba cái đều rẻ, đều chạy trong vài phút, và đều bị bỏ qua nhiều nhất.
- `Junior` **HUD của game có mười phần tử thường trực. Anh làm gì?**
  → Chạy **bài test câu hỏi**: mỗi phần tử trả lời câu hỏi gì, người chơi hỏi câu đó bao lâu một lần. Không trả lời câu hỏi nào thì bỏ; chỉ hỏi ở cửa hàng thì chỉ hiện ở cửa hàng. Bài test này thường cắt **30–40%** HUD, và phần còn lại chia ba tầng với tối đa **4–5 phần tử** ở tầng thường trực.
- `Mid` **Làm một game cảm thấy "đã tay" hơn — anh làm gì trước?**
  → Theo thứ tự cố định: **hitstop 50–120 ms**, **âm thanh đúng frame va chạm**, **chớp trắng 60–80 ms**, rồi mới tới screenshake có giảm dần, hạt, và số sát thương. Ba cái đầu chiếm khoảng **70% cảm giác** và tốn ít công nhất — đảo thứ tự này là lý do nhiều người đổ cả tuần vào hạt mà game vẫn nhạt.
- `Mid` **Người chơi kêu game "bị lag" nhưng profiler cho 60 fps ổn định. Nghi gì?**
  → Nghi **độ trễ phản hồi**, không nghi frame rate. Phản hồi hình ảnh phải trong **≤ 2 frame (33 ms)**; trên 100 ms là cảm thấy lag dù không lag. Nguồn hay gặp: input đọc trong `FixedUpdate`, hiệu ứng chờ animation event, âm thanh phát sau animation, hoặc một transition blend 0,2 giây đặt đúng chỗ cần phản hồi tức thì.
- `Senior` **Trợ năng nên làm lúc nào, và vì sao?**
  → **Từ đầu**, vì chi phí đổi bậc: mã hoá kép làm sớm là chọn icon, làm muộn là **vẽ lại toàn bộ asset**; điều hướng bàn phím làm sớm là một hệ thống focus, làm muộn là **làm lại mọi màn hình UI**. Sáu hạng mục đầu — mã hoá kép, đổi phím, cỡ chữ, giảm rung, phụ đề, điều hướng tay cầm — không cần chuyên môn gì đặc biệt, chỉ cần quyết định sớm.
- `Senior` **Ảnh chụp màn hình trông đẹp nhưng chơi thì rối. Anh chẩn đoán từ đâu?**
  → Từ **khả năng đọc**, không từ thẩm mỹ. Ba chỗ theo thứ tự: silhouette có phân biệt được ở 32px không hay đang phân biệt bằng màu; có **một màu dành riêng cho nguy hiểm** không, hay đỏ vừa là máu vừa là trang trí; và juice có quá tay không — mọi thứ đều rung và chớp thì không gì đáng chú ý. Cường độ hiệu ứng phải **tỉ lệ với ý nghĩa sự kiện**.

**Khung trả lời 60 giây** — "Anh đánh giá phần nghe nhìn của một game thế nào?"

> Bằng **khả năng đọc trước, thẩm mỹ sau**. Câu hỏi đầu tiên không phải "đẹp không" mà "người chơi phân biệt được gì trong hai phần mười giây" — bạn hay thù, sát thương được hay không, đi được hay không.
>
> Tôi có ba phép thử rẻ và chạy hết: **hình bóng đen** cho phần nhìn, **tắt tiếng** và **tắt HUD** cho phần thông tin. Qua cả ba thì nghĩa là thông tin sống còn đang đi qua nhiều kênh, và đó cũng chính là điều kiện trợ năng.
>
> Về cảm giác, tôi làm theo thứ tự cố định: **hitstop, âm thanh đúng frame, chớp trắng**, rồi mới rung, hạt, số — ba cái đầu là khoảng bảy mươi phần trăm cảm giác. Và nguyên tắc bao trùm cho mọi hiệu ứng: **cường độ tỉ lệ với ý nghĩa sự kiện**. Đòn thường rung bốn pixel, hạ boss rung mười hai; nếu mọi thứ đều mười hai thì không gì đáng chú ý cả.

**Cờ đỏ**

- Phân biệt trạng thái quan trọng chỉ bằng màu.
- HUD là nơi khoe mọi số liệu đang có.
- Mô tả game feel bằng tính từ, không có con số nào.
- Coi trợ năng là hạng mục cuối danh sách.
- Chưa từng chạy test hình bóng đen, tắt tiếng, hay tắt HUD.

**Số / ví dụ nên thuộc**

- Ba phép thử: **hình bóng đen · tắt tiếng · tắt HUD**.
- Game feel: hitstop **50–120 ms** · chớp trắng **60–80 ms** · rung **4–10 px** giảm dần · phản hồi **≤ 33 ms**.
- HUD: bài test câu hỏi cắt **30–40%**; tầng thường trực tối đa **4–5 phần tử**.
- Trợ năng: mù màu đỏ-lục **~8% nam giới**; tương phản **4,5:1**; tránh chớp **> 3 lần/giây**.
- Art: silhouette khác biệt **ở 32px**; **một màu dành riêng cho nguy hiểm**.
