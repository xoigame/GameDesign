---
title: Game Feel & Juice
icon: ✨
summary: Lớp phản hồi cảm giác biến một prototype đúng chức năng thành một game đã tay — kèm số liệu cụ thể để đưa cho AI.
status: deep
read: 60
level: basic
order: 40
tags: [foundations, feel, polish]
related: [core-loop, ux-hud, combat-systems]
---

**Game feel** là cảm giác vật lý khi điều khiển. Nó quyết định phần lớn ấn tượng của người chơi trong 30 giây đầu, và gần như hoàn toàn nằm ngoài phần "tính năng" của tài liệu thiết kế.

Một nhân vật nhảy đúng theo vật lý vẫn có thể cảm thấy tệ. Một nhân vật "sai vật lý" — rơi nhanh gấp đôi lúc lên, có 5 frame lơ lửng ở đỉnh nhảy — lại cảm thấy đúng. Game feel là **nói dối cho hợp trực giác**, không phải mô phỏng cho đúng.

## Bộ công cụ

**Input & khả năng tha thứ**
- `coyote time` 80–120ms — vẫn nhảy được sau khi rời mép nền.
- `input buffer` 100–150ms — nhấn nhảy sớm trước khi chạm đất vẫn được ghi nhận.
- Phản hồi trong ≤ 2 frame (33ms). Hơn 100ms là người chơi cảm thấy "lag" dù không lag.

**Va chạm**
- `hitstop` / freeze frame 50–120ms khi trúng đòn — công cụ mạnh nhất và rẻ nhất để tạo cảm giác lực.
- `screenshake` biên độ 4–10px, thời lượng 100–200ms, **phải giảm dần**. Rung mạnh + lâu = gây khó chịu và say.
- `knockback` + đổi màu trắng trên sprite trúng đòn trong 60–80ms.

**Chuyển động**
- Tăng/giảm tốc thay cho tốc độ tức thì — nhưng ngắn: 0.05–0.15s. Dài hơn là "trơn như đi trên băng".
- `squash & stretch` khi nhảy/tiếp đất, ±15–25%.
- Trọng lực bất đối xứng: rơi nhanh gấp 1.5–2.5 lần lúc bay lên.

**Âm thanh** — thường bị đánh giá thấp nhất, hiệu quả cao nhất
- Ngẫu nhiên cao độ ±8% mỗi lần phát để tránh cảm giác lặp máy móc.
- Âm thanh phải phát **cùng frame** với va chạm, không phải sau animation.
- Im lặng ngắn ngay trước một cú đánh lớn làm nó nghe nặng hơn.

**Hạt & số liệu**
- Số sát thương bay lên, cong nhẹ, mờ dần trong 0.6s.
- Tia lửa theo hướng va chạm, không phải toả đều mọi hướng.

## Thứ tự ưu tiên

Làm theo đúng thứ tự này, dừng khi đã đủ đã tay:

1. Hitstop
2. Âm thanh đúng frame
3. Chớp trắng khi trúng đòn
4. Screenshake (có giảm dần)
5. Hạt
6. Số sát thương

Ba cái đầu chiếm khoảng 70% cảm giác và tốn ít công nhất.

## Cái bẫy

Juice quá tay là một vấn đề có thật. Khi mọi thứ đều rung, chớp và nổ, người chơi **không đọc được trạng thái trận đấu** nữa. Nguyên tắc: cường độ hiệu ứng tỉ lệ với ý nghĩa của sự kiện. Đòn thường rung 4px; hạ boss rung 12px. Nếu mọi thứ đều 12px thì không gì đáng chú ý cả.

Luôn cung cấp tuỳ chọn giảm screenshake — đây là vấn đề trợ năng thực sự với người dễ say chuyển động.

## 🤖 Prompt cho AI

AI **không cảm nhận được** game của bạn. Nó chỉ làm đúng những con số bạn đưa. Đừng viết "làm cho combat đã tay hơn"; hãy viết:

```yaml
hit_feedback:
  hitstop_ms: 90              # 60 đòn thường / 90 đòn nặng / 150 khi kết liễu
  flash: { color: "#FFFFFF", duration_ms: 70 }
  screenshake: { amplitude_px: 6, duration_ms: 140, falloff: "ease_out_quad" }
  knockback: { force: 320, duration_ms: 180 }
  sfx: { pitch_variance: 0.08, delay_ms: 0 }
  damage_number: { rise_px: 42, duration_ms: 600, arc: true }
```

Sau đó bạn tự tinh chỉnh bằng tay — đây là phần **bắt buộc phải có con người trong vòng lặp**. Kinh nghiệm thực tế: nhờ AI dựng hệ thống có tham số hoá và phơi mọi hằng số ra một file config ([[data-driven-design]]), rồi bạn ngồi chỉnh số trong lúc game đang chạy.

## 🎮 Unity

Game feel trong Unity gần như hoàn toàn là **ba thứ rẻ tiền**: hitstop, flash, screenshake. Làm đúng ba cái này đã được ~70% cảm giác.

**Component & nơi đặt**
- `HitFeedback.cs` — đặt trên prefab kẻ địch và người chơi
- `FeelConfig` (ScriptableObject) — một asset duy nhất, mọi thứ đọc từ đây
- `TimeManager.cs` — singleton, chỉ nó được phép đụng `Time.timeScale`

**Code**

```csharp
[CreateAssetMenu(menuName = "Game/Feel Config")]
public class FeelConfig : ScriptableObject {
    [Header("Hitstop")]
    public float lightHitstopMs = 60f;
    public float heavyHitstopMs = 90f;
    public float killHitstopMs  = 150f;

    [Header("Flash")]
    public Color flashColor = Color.white;
    public float flashMs = 70f;

    [Header("Screenshake")]
    public float amplitude = 6f;      // pixel ở độ phân giải tham chiếu
    public float shakeMs = 140f;
}
```

```csharp
public class TimeManager : MonoBehaviour {
    public static TimeManager I { get; private set; }
    Coroutine running;

    void Awake() => I = this;

    /// Dừng hình khi trúng đòn. Dùng Realtime vì timeScale đang bằng 0.
    public void Hitstop(float ms) {
        if (running != null) StopCoroutine(running);
        running = StartCoroutine(Freeze(ms / 1000f));
    }

    IEnumerator Freeze(float seconds) {
        Time.timeScale = 0f;
        yield return new WaitForSecondsRealtime(seconds);
        Time.timeScale = 1f;
        running = null;
    }
}
```

```csharp
public class HitFeedback : MonoBehaviour {
    [SerializeField] FeelConfig cfg;
    [SerializeField] SpriteRenderer sr;      // cache trong Awake, không GetComponent lúc chạy

    static readonly int FlashAmount = Shader.PropertyToID("_FlashAmount");
    MaterialPropertyBlock mpb;               // tránh tạo material instance mỗi lần

    void Awake() {
        sr  = GetComponent<SpriteRenderer>();
        mpb = new MaterialPropertyBlock();
    }

    public void OnHit(bool heavy) {
        TimeManager.I.Hitstop(heavy ? cfg.heavyHitstopMs : cfg.lightHitstopMs);
        StartCoroutine(Flash());
        CameraShake.I.Shake(cfg.amplitude, cfg.shakeMs);
    }

    IEnumerator Flash() {
        sr.GetPropertyBlock(mpb);
        mpb.SetFloat(FlashAmount, 1f);
        sr.SetPropertyBlock(mpb);

        yield return new WaitForSecondsRealtime(cfg.flashMs / 1000f);

        sr.GetPropertyBlock(mpb);
        mpb.SetFloat(FlashAmount, 0f);
        sr.SetPropertyBlock(mpb);
    }
}
```

**Ba cái bẫy Unity cụ thể**

1. **`WaitForSeconds` vô dụng khi `timeScale = 0`.** Hitstop dùng `WaitForSecondsRealtime`, nếu không coroutine đứng mãi mãi.
2. **Đổi `sr.material` tạo material instance mới mỗi object** → tăng draw call, rò bộ nhớ. Dùng `MaterialPropertyBlock`.
3. **Screenshake phải nhân với hệ số trợ năng.** Xem [[accessibility]] — để `ShakeScale = 0` là tắt hẳn, và nó phải là *một* biến duy nhất, không rải `transform.position +=` khắp nơi.

**Screenshake: tự viết hay Cinemachine?**
- Tự viết: đủ cho 2D, kiểm soát hoàn toàn, không thêm package.
- Cinemachine Impulse: đúng hơn cho 3D và nhiều camera, nhưng phải học hệ thống Impulse Source/Listener.

Với dự án nhỏ, tự viết một `CameraShake` 30 dòng có `amplitude`, `duration`, `falloff` là đủ và dễ chỉnh hơn.

**Kiểm tra nhanh**
- Tắt hết particle và âm thanh, chỉ để hitstop + flash. Vẫn thấy "đã tay" không? Nếu có, nền tảng đúng.
- Đặt `ShakeScale = 0` trong settings — game vẫn chơi được bình thường chứ?
- Profiler: `OnHit` không được cấp phát (GC Alloc = 0 B).
