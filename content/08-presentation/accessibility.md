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
