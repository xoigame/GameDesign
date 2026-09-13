---
title: Accessibility
icon: ♿
summary: Trợ năng — không phải tính năng phụ. Phần lớn hạng mục rẻ nếu làm sớm, rất đắt nếu làm muộn.
status: deep
read: 380
level: basic
order: 55
tags: [presentation, ux, accessibility]
related: [ui-design, ux-hud, ux-flow, difficulty-curve, audio-design]
---

Trợ năng thường bị hiểu là "làm cho người khuyết tật". Thực tế phần lớn hạng mục phục vụ **mọi người chơi**: chơi trên điện thoại ngoài nắng, chơi lúc 1 giờ sáng phải tắt tiếng, chơi trên TV cách 3 mét, chơi khi mệt.

Điểm then chốt: **gần như mọi hạng mục dưới đây rẻ nếu làm từ đầu và rất đắt nếu làm sau.**

## Thị giác

**Mù màu** — khoảng 8% nam giới bị mù màu đỏ-lục. Đây là con số đủ lớn để không bỏ qua.

> **Luật mã hoá kép:** mọi phân biệt quan trọng dùng **màu + một kênh thứ hai** — hình dạng, biểu tượng, hoa văn, hoặc vị trí.

Thanh máu đỏ và thanh năng lượng xanh lá cạnh nhau là lỗi kinh điển. Thêm icon khác nhau là xong.

**Tương phản** — chữ/nền tối thiểu **4.5:1** cho nội dung, 3:1 cho chữ lớn. Kiểm tra bằng công cụ, đừng ước lượng bằng mắt (mắt bạn đã quen với thiết kế của mình).

**Cỡ chữ** — cho phép phóng to. Nhiều game để cỡ chữ cố định rất nhỏ; đây là rào cản phổ biến nhất và dễ sửa nhất.

**Rung màn hình và chớp sáng** — cần công tắc giảm/tắt. Với một số người đây là vấn đề say chuyển động thực sự; với người nhạy cảm ánh sáng, chớp nhanh có thể gây co giật. Tránh chớp trên 3 lần/giây.

## Thính giác

- **Phụ đề cho mọi lời thoại**, có tuỳ chọn cỡ chữ và nền mờ phía sau.
- **Chú thích âm thanh quan trọng** — không chỉ lời thoại. "[tiếng bước chân phía sau]" là thông tin gameplay.
- **Chỉ báo hình ảnh cho tín hiệu âm thanh** — nếu tiếng động là cách duy nhất biết boss sắp ra đòn, người chơi tắt tiếng không chơi được. Xem [[audio-design]].

**Bài test tắt tiếng** ở [[ux-hud]] chính là bài kiểm tra trợ năng thính giác.

## Vận động

- **Đổi phím được** — yêu cầu cơ bản nhất, và hay bị coi là tính năng cao cấp.
- **Giữ / bấm chuyển đổi được** — giữ nút để chạy trong nhiều giờ là vấn đề thật với người đau khớp.
- **Không bắt bấm liên tục (mashing)**, hoặc cho tuỳ chọn thay bằng giữ.
- **Điều hướng bằng bàn phím và tay cầm cho toàn bộ UI** — xem [[ui-design]] và [[ux-flow]].

## Nhận thức

- **Tốc độ văn bản chỉnh được**, và không tự chuyển trang.
- **Nhắc lại mục tiêu hiện tại** — người chơi quay lại sau một tuần không nhớ mình đang làm gì.
- **Tuỳ chọn giảm độ khó theo từng trục** thay vì một nút "Dễ". Xem [[difficulty-curve]] — Celeste đóng khung phần này là "Assist Mode" với lời nhắn rõ rằng đây không phải gian lận. Cách trình bày quan trọng ngang tính năng.

## Thứ tự ưu tiên thực dụng

Nếu chỉ làm được vài thứ, theo thứ tự tỉ lệ giá trị / công sức:

1. **Mã hoá kép màu + hình dạng** — gần như miễn phí nếu quyết định từ đầu
2. **Đổi phím được**
3. **Cỡ chữ chỉnh được**
4. **Công tắc giảm rung màn hình**
5. **Phụ đề**
6. **Điều hướng UI bằng bàn phím/tay cầm**
7. **Tốc độ văn bản**

Sáu mục đầu không cần chuyên môn đặc biệt, chỉ cần quyết định sớm.

## Vì sao "làm sau" không hiệu quả

| Hạng mục | Làm từ đầu | Làm sau khi xong game |
|---|---|---|
| Mã hoá kép | Chọn icon khi thiết kế | Vẽ lại toàn bộ asset |
| Điều hướng bàn phím | Hệ thống focus có sẵn | Làm lại mọi màn hình UI |
| Cỡ chữ chỉnh được | Layout co giãn | Sửa layout từng màn hình |
| Giảm rung | Một biến nhân | Tìm mọi chỗ gọi shake rải rác |

Cột phải là lý do trợ năng thường bị bỏ: đến lúc nghĩ tới thì đã quá đắt.

## 🤖 Prompt cho AI

AI **biết rõ các chuẩn trợ năng** nhưng chỉ áp dụng khi được yêu cầu. Đây là mảng nên đưa vào ràng buộc mặc định của dự án, không phải nhiệm vụ riêng.

**Cách dùng hiệu quả nhất: đưa vào `CLAUDE.md` một lần, áp dụng mãi.**

```markdown
## Trợ năng — ràng buộc mặc định cho MỌI UI/UX

- MÃ HOÁ KÉP: mọi phân biệt quan trọng dùng màu + hình dạng/icon.
  KHÔNG được chỉ dùng màu. Đặc biệt: không phân biệt đỏ/xanh lá đơn thuần.
- Tương phản chữ/nền >= 4.5:1 (>= 3:1 cho chữ >= 24px).
- Mọi UI điều hướng được bằng bàn phím VÀ tay cầm. Mọi phần tử tương tác
  có trạng thái focused nhìn rõ.
- Mọi hiệu ứng rung màn hình đi qua một hệ số duy nhất ScreenShakeScale
  (0 = tắt hoàn toàn), đọc từ settings.
- Không có hiệu ứng chớp quá 3 lần/giây.
- Cỡ chữ nhân với UiFontScale từ settings; layout phải co giãn được,
  KHÔNG dùng chiều cao cố định cho vùng chứa chữ.
- Mọi tín hiệu âm thanh mang thông tin gameplay phải có chỉ báo hình ảnh tương ứng.

Nếu một yêu cầu của tôi vi phạm các mục trên, hãy NÊU RA trước khi làm.
```

**Mẫu prompt kiểm tra game đã có**

```
Rà toàn bộ UI trong dự án, đối chiếu danh sách trợ năng ở CLAUDE.md.

Xuất bảng: | hạng mục | đạt/không | file vi phạm | chi phí sửa (thấp/vừa/cao) |

Ưu tiên theo tỉ lệ giá trị/công sức, không theo thứ tự file.
Với mỗi mục "cao", nói rõ vì sao đắt — để tôi quyết định có làm hay không.

Chưa sửa gì. Chỉ báo cáo.
```

**Bẫy thường gặp:** coi trợ năng là một nhiệm vụ riêng làm sau. Kết quả là báo cáo toàn mục "chi phí cao" và không mục nào được làm. Đưa vào ràng buộc mặc định ngay từ prompt đầu tiên thì chi phí gần như bằng không.

## 🎮 Unity

Unity không cho sẵn trợ năng — nhưng phần lớn hạng mục chỉ cần **một biến toàn cục đặt đúng chỗ**, nếu làm từ đầu.

**Component & nơi đặt**
- `AccessibilitySettings` (ScriptableObject hoặc static class) — nguồn chân lý duy nhất
- Mọi hệ thống đọc từ đây, không ai tự quyết

**Code — một biến chặn mọi screenshake**

```csharp
public static class A11y {
    public static float ShakeScale = 1f;    // 0 = tắt hẳn
    public static float FontScale  = 1f;    // 1.0 - 1.5
    public static bool  ReduceFlashing;
    public static bool  HoldToToggle;       // giữ nút -> bấm chuyển
}
```

```csharp
public class CameraShake : MonoBehaviour {
    // ĐIỂM DUY NHẤT được phép rung camera trong toàn dự án
    public void Shake(float amplitude, float ms) {
        float a = amplitude * A11y.ShakeScale;
        if (a <= 0.01f) return;
        StartCoroutine(Run(a, ms / 1000f));
    }
}
```

Ràng buộc thật nằm ở chữ **duy nhất**. Nếu có 12 chỗ tự cộng vào `transform.position`, không công tắc nào tắt hết được. Viết test grep tìm vi phạm.

**Đổi phím — Input System làm sẵn**

Với package **Input System**, rebinding có sẵn API:

```csharp
action.PerformInteractiveRebinding(bindingIndex)
    .WithControlsExcluding("<Mouse>/position")
    .OnComplete(op => {
        op.Dispose();
        PlayerPrefs.SetString("binds", actions.SaveBindingOverridesAsJson());
    })
    .Start();
```

Đây là lý do đáng chuyển sang Input System: với Input Manager cũ, rebinding phải tự viết từ đầu.

**Cỡ chữ chỉnh được**

uGUI:
```csharp
// Layout PHẢI co giãn: dùng ContentSizeFitter, KHÔNG đặt height cố định
text.fontSize = Mathf.RoundToInt(baseSize * A11y.FontScale);
```

UI Toolkit: đặt `--fs-body` trong USS rồi đổi biến — cả cây UI scale theo, không phải sửa từng phần tử.

**Mù màu — mã hoá kép**

Unity không giúp gì ở đây, đây là quyết định thiết kế. Thực hiện: mọi chỗ phân biệt bằng màu phải kèm **sprite icon khác nhau**. Kiểm tra bằng cách chụp màn hình rồi convert grayscale — còn phân biệt được không?

**Kiểm tra nhanh**
- Grep `transform.position +=` trong code camera — chỉ được có một chỗ.
- Đặt `A11y.ShakeScale = 0`: chơi hết một màn, không còn rung nào?
- Đặt `FontScale = 1.5`: có chữ nào bị cắt hoặc tràn khung không?
- Ảnh chụp chuyển grayscale: còn phân biệt được bạn/thù không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Luật mã hoá kép là gì? Cho một ví dụ lỗi kinh điển.**
  → Mọi phân biệt quan trọng phải dùng **màu cộng một kênh thứ hai** — hình dạng, biểu tượng, hoa văn, hoặc vị trí. Lỗi kinh điển: thanh máu đỏ và thanh năng lượng xanh lá đặt cạnh nhau. Khoảng **8% nam giới** mù màu đỏ-lục, đủ lớn để không bỏ qua, và cách sửa chỉ là thêm hai icon khác nhau.
- `Junior` **Tỉ lệ tương phản tối thiểu cho chữ là bao nhiêu?**
  → **4,5:1** cho nội dung thường, **3:1** cho chữ lớn. Và phải kiểm bằng công cụ chứ đừng ước lượng bằng mắt — mắt mình đã quen với thiết kế của chính mình, nên ngưỡng cảm nhận đã lệch từ lâu trước khi ai đó báo lỗi.
- `Junior` **Vì sao trợ năng không chỉ dành cho người khuyết tật?**
  → Vì phần lớn hạng mục phục vụ **mọi người chơi**: chơi trên điện thoại ngoài nắng cần tương phản cao, chơi lúc một giờ sáng phải tắt tiếng nên cần phụ đề, chơi trên TV cách ba mét cần cỡ chữ lớn, chơi khi mệt cần bớt thông tin. Đóng khung nó là "tính năng cho một nhóm nhỏ" là lý do nó luôn bị xếp cuối danh sách.
- `Mid` **Bảy hạng mục trợ năng theo thứ tự giá trị trên công sức?**
  → **Mã hoá kép màu + hình dạng** (gần như miễn phí nếu quyết sớm) → **đổi phím được** → **cỡ chữ chỉnh được** → **công tắc giảm rung màn hình** → **phụ đề** → **điều hướng UI bằng bàn phím/tay cầm** → **tốc độ văn bản**. Sáu mục đầu không cần chuyên môn đặc biệt, chỉ cần quyết định sớm.
- `Mid` **Vì sao "làm trợ năng sau" lại gần như không khả thi?**
  → Vì chi phí đổi bậc. Mã hoá kép làm từ đầu là chọn icon khi thiết kế, làm sau là **vẽ lại toàn bộ asset**. Điều hướng bàn phím làm từ đầu là hệ thống focus có sẵn, làm sau là **làm lại mọi màn hình UI**. Giảm rung làm từ đầu là một biến nhân, làm sau là đi tìm mọi chỗ gọi shake rải rác. Cột bên phải chính là lý do nó thường bị bỏ.
- `Mid` **Người chơi tắt tiếng có chơi được game của anh không? Kiểm thế nào?**
  → Bằng **test tắt tiếng**: tắt loa rồi chơi một đoạn có chiến đấu. Nếu tiếng động là cách duy nhất biết boss sắp ra đòn thì game không chơi được khi tắt tiếng — và đó vừa là lỗi trợ năng vừa là lỗi thiết kế, vì rất nhiều người chơi mobile luôn để im lặng. Chữa bằng **chỉ báo hình ảnh cho mọi tín hiệu âm thanh mang thông tin gameplay**.
- `Senior` **Trợ năng vận động gồm những gì mà đội hay bỏ qua?**
  → **Đổi phím được** — cơ bản nhất nhưng hay bị coi là tính năng cao cấp. **Giữ/bấm chuyển đổi được** — giữ nút để chạy suốt nhiều giờ là vấn đề thật với người đau khớp. **Không bắt bấm liên tục**, hoặc cho tuỳ chọn thay bằng giữ. Và **điều hướng toàn bộ UI bằng bàn phím và tay cầm**, thứ phải có từ kiến trúc chứ không vá được.
- `Senior` **Chớp sáng và rung màn hình — ràng buộc là gì?**
  → Phải có công tắc giảm hoặc tắt. Với một số người đây là **say chuyển động thật**; với người nhạy cảm ánh sáng, chớp nhanh có thể **gây co giật** — nên tránh chớp trên **3 lần/giây**. Đây là hạng mục duy nhất trong nhóm mà hậu quả là vấn đề sức khoẻ, nên nó không phải chỗ để cân nhắc theo thẩm mỹ.
- `Senior` **Trình bày tuỳ chọn trợ năng thế nào cho người chơi thật sự dùng?**
  → Tách theo **từng trục** thay vì một nút "Dễ", và **đóng khung không mang nhãn giá trị**. Celeste gọi nó là "Assist Mode" kèm lời nhắn rõ rằng đây không phải gian lận — cách trình bày quan trọng ngang bản thân tính năng. Chôn tuỳ chọn trong menu cấp ba với nhãn nghe như thừa nhận thất bại là cách chắc chắn để không ai bật.

**Khung trả lời 60 giây** — "Anh đưa trợ năng vào dự án thế nào?"

> Quan trọng nhất là **thời điểm**, không phải danh sách. Gần như mọi hạng mục rẻ nếu quyết từ đầu và rất đắt nếu làm sau: mã hoá kép làm sớm là chọn icon, làm muộn là vẽ lại toàn bộ asset; điều hướng bàn phím làm sớm là một hệ thống focus, làm muộn là làm lại mọi màn hình.
>
> Thứ tự tôi ưu tiên theo giá trị trên công sức: **mã hoá kép màu cộng hình dạng**, **đổi phím được**, **cỡ chữ chỉnh được**, **công tắc giảm rung**, **phụ đề**, **điều hướng UI bằng tay cầm**, rồi tốc độ văn bản. Sáu cái đầu không cần chuyên môn gì đặc biệt.
>
> Và tôi coi hai bài kiểm là bắt buộc trước khi nói xong: **test tắt tiếng** — không nghe gì thì còn chơi được không — và kiểm tương phản bằng công cụ, tối thiểu 4,5:1. Cuối cùng là cách trình bày: tách tuỳ chọn theo từng trục và đừng gắn nhãn giá trị, vì "Dễ" nghe như thừa nhận thất bại và người cần nhất sẽ là người không bật.

**Họ sẽ đào tiếp**

- *"Vì sao 8% lại là con số đáng nhớ?"* → Vì nó không phải nhóm thiểu số nhỏ mà là khoảng **một trong mười hai người chơi nam**. Với một game có mười nghìn người chơi thì đó là gần tám trăm người, và họ sẽ không viết review nói "tôi mù màu" — họ chỉ thấy game khó hiểu rồi bỏ.
- *"Phụ đề làm thế nào cho đúng?"* → Không chỉ lời thoại: **chú thích cả âm thanh mang thông tin gameplay**, kiểu "[tiếng bước chân phía sau]". Kèm tuỳ chọn cỡ chữ và nền mờ phía sau, vì phụ đề trên nền sáng là phụ đề không đọc được. Đây là chỗ hay bị làm nửa vời nhất: có phụ đề thoại nhưng không có chú thích âm thanh.
- *"Trợ năng nhận thức gồm gì?"* → Tốc độ văn bản chỉnh được và **không tự chuyển trang**; nhắc lại mục tiêu hiện tại, vì người chơi quay lại sau một tuần không nhớ mình đang làm gì; và giảm tải thông tin trên màn hình. Nhóm này ít được nói tới nhất nhưng lại phục vụ đúng nhóm người chơi đông nhất — người bận.
- *"Có tiêu chuẩn nào để bám không?"* → Có các hướng dẫn trợ năng cho game được dùng rộng rãi trong ngành và các tiêu chuẩn tương phản của web dùng lại được cho UI. Nhưng tôi không trả lời câu hỏi tuân thủ bằng trí nhớ — tôi kiểm tại nguồn ở thời điểm quyết định, vì yêu cầu của từng nền tảng phát hành cũng thay đổi.

**Cờ đỏ**

- Phân biệt trạng thái quan trọng chỉ bằng màu.
- Coi trợ năng là hạng mục cuối danh sách, làm sau khi game xong.
- Cỡ chữ cố định và rất nhỏ.
- Không có cách tắt rung màn hình.
- Đặt tuỳ chọn hỗ trợ dưới nhãn "Dễ" và chôn trong menu cấp ba.

**Số / ví dụ nên thuộc**

- Mù màu đỏ-lục ≈ **8% nam giới**.
- Tương phản tối thiểu **4,5:1** (chữ thường) · **3:1** (chữ lớn).
- Tránh chớp trên **3 lần/giây**.
- Bảy hạng mục theo thứ tự: **mã hoá kép → đổi phím → cỡ chữ → giảm rung → phụ đề → điều hướng tay cầm → tốc độ văn bản**.
- Hai bài kiểm bắt buộc: **test tắt tiếng** và **đo tương phản bằng công cụ**.
