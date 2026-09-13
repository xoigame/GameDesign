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

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Game feel là gì? Vì sao nhân vật "đúng vật lý" lại cảm thấy tệ?**
  → Game feel là cảm giác vật lý khi điều khiển — nó quyết định phần lớn ấn tượng trong 30 giây đầu và gần như nằm ngoài phần "tính năng" của tài liệu. Nhân vật đúng vật lý cảm thấy tệ vì trực giác người chơi không phải vật lý: rơi nhanh gấp 1,5–2,5 lần lúc bay lên và có vài frame lơ lửng ở đỉnh thì mới cảm thấy đúng. Game feel là **nói dối cho hợp trực giác**.
- `Junior` **Coyote time và input buffer là gì? Đặt bao nhiêu?**
  → Coyote time **80–120 ms**: vẫn nhảy được sau khi đã rời mép nền. Input buffer **100–150 ms**: nhấn nhảy sớm trước khi chạm đất vẫn được ghi nhận. Cả hai đều là "tha thứ" cho sai số của người chơi, và cả hai đều vô hình — người chơi không biết chúng tồn tại, chỉ thấy game nhạy.
- `Junior` **Ba công cụ đầu tiên anh làm để game "đã tay" hơn?**
  → Theo đúng thứ tự: **hitstop** (50–120 ms khi trúng đòn), **âm thanh đúng frame va chạm** (không phải sau animation), và **chớp trắng** trên sprite trúng đòn 60–80 ms. Ba cái đó chiếm khoảng 70% cảm giác và tốn ít công nhất; screenshake, hạt và số sát thương đứng sau.
- `Mid` **Screenshake đặt thế nào cho đúng?**
  → Biên độ **4–10 px**, thời lượng **100–200 ms**, và **bắt buộc giảm dần**. Quan trọng hơn con số là quy tắc: cường độ tỉ lệ với **ý nghĩa của sự kiện** — đòn thường 4 px, hạ boss 12 px. Nếu mọi thứ đều 12 px thì không gì đáng chú ý cả. Và luôn có tuỳ chọn giảm rung, vì đây là vấn đề trợ năng thật với người dễ say chuyển động.
- `Mid` **Người chơi kêu "game bị lag" nhưng profiler cho 60 fps ổn định. Nghi gì?**
  → Nghi độ trễ phản hồi chứ không phải frame rate. Phản hồi phải trong **≤ 2 frame (33 ms)**; trên 100 ms là cảm thấy lag dù không lag. Nguồn hay gặp: input đọc trong `FixedUpdate`, hiệu ứng chờ animation event, âm thanh phát sau animation, hoặc một đoạn blend transition 0,2 s ở đúng chỗ cần phản hồi tức thì.
- `Mid` **Vì sao âm thanh hay bị đánh giá thấp trong game feel?**
  → Vì nó không nhìn thấy trong ảnh chụp màn hình, nên nó rơi khỏi danh sách review. Nhưng nó rẻ và hiệu quả cao: ngẫu nhiên cao độ **±8%** mỗi lần phát để tránh cảm giác lặp máy móc, phát **cùng frame** với va chạm, và một khoảng im lặng ngắn ngay trước cú đánh lớn làm nó nghe nặng hơn hẳn.
- `Senior` **Juice quá tay hỏng ở đâu, và anh phát hiện bằng cách nào?**
  → Khi mọi thứ đều rung, chớp và nổ thì người chơi **không đọc được trạng thái trận đấu** nữa — đó là lỗi về khả năng đọc, không phải về thẩm mỹ. Cách phát hiện: quay video một trận rồi xem lại có nói được lúc nào mình sắp chết không. Cách chữa là lập ngân sách theo mức sự kiện, và một nguồn duy nhất cộng dồn rung thay vì bốn hệ thống cùng rung.
- `Senior` **Game feel viết vào tài liệu thế nào để agent hoặc người mới làm đúng?**
  → Bằng **số và đơn vị**, không bằng tính từ: hitstop 70 ms, coyote 100 ms, chớp trắng 60 ms, rung 6 px giảm dần trong 150 ms, trọng lực rơi ×2. "Cảm giác nặng tay" không chuyển thành code được, còn bảng số thì chuyển được — và nó cũng biến tranh luận về cảm giác thành tranh luận về một con số cụ thể.
- `Senior` **Game feel có đánh đổi gì không, hay cứ thêm là tốt?**
  → Có ba đánh đổi thật. Khả năng đọc trận đấu (juice quá tay). **Trợ năng**: rung và chớp là vấn đề sức khoẻ với một phần người chơi, nên phải tắt được. Và **độ trễ cảm nhận**: hitstop làm đòn nặng hơn nhưng cũng làm game phản hồi chậm hơn đúng bằng thời lượng đó — với game đối kháng cạnh tranh thì đó là chi phí phải cân nhắc, không phải quà tặng miễn phí.

**Khung trả lời 60 giây** — "Làm sao để một prototype cảm thấy đã tay?"

> Tôi làm theo thứ tự cố định và dừng khi đã đủ: **hitstop**, **âm thanh đúng frame**, **chớp trắng**, rồi mới tới screenshake có giảm dần, hạt, và số sát thương. Ba cái đầu chiếm khoảng 70% cảm giác và tốn ít công nhất — đảo thứ tự này là lý do nhiều người đổ cả tuần vào hạt mà game vẫn nhạt.
>
> Con số tôi mang theo: hitstop 50–120 ms, chớp trắng 60–80 ms, rung 4–10 px giảm dần trong 100–200 ms, coyote time và input buffer khoảng 100 ms, tăng giảm tốc 0,05–0,15 giây — dài hơn là trơn như đi trên băng. Và trọng lực bất đối xứng, rơi nhanh gấp 1,5–2,5 lần lúc bay lên.
>
> Nguyên tắc bao trùm là **cường độ tỉ lệ với ý nghĩa sự kiện**. Đòn thường rung 4 px, hạ boss rung 12 px. Nếu mọi thứ đều 12 px thì người chơi không đọc được trận đấu nữa, và lúc đó juice đã quay sang chống lại game.

**Họ sẽ đào tiếp**

- *"Vì sao hitstop lại mạnh đến vậy?"* → Vì nó dừng đúng khoảnh khắc va chạm, nên não đọc thành "hai vật thể thật sự chạm nhau". Nó cũng rẻ nhất trong mọi công cụ: vài dòng code, không cần asset, không cần artist. Cái giá là độ trễ — game phản hồi chậm hơn đúng bằng thời lượng hitstop.
- *"Hitstop cài bằng `timeScale` được không?"* → Được cho game một mục tiêu, nhưng nó dừng cả thế giới: số sát thương bay ngừng, hạt đóng băng. Game hành động nhiều mục tiêu hoặc có multiplayer thì cần **local time scale** — mỗi thực thể một hệ số delta riêng.
- *"Làm game feel cho game mobile thì khác gì?"* → Không có phản hồi xúc giác từ nút bấm nên phần nhìn và rung máy phải gánh nhiều hơn. Thêm nữa, ngón tay che một phần màn hình, nên hiệu ứng đặt dưới chỗ chạm là lãng phí. Và rung máy tốn pin, nên nó cũng phải có ngân sách.
- *"Đo game feel thế nào cho khách quan?"* → Đo **độ trễ đầu vào** bằng quay video tốc độ cao đếm frame từ lúc bấm tới lúc có phản hồi trên màn hình; đó là con số duy nhất trong nhóm này khách quan hoàn toàn. Phần còn lại thì so sánh cặp: cùng một tester chơi hai bản khác nhau một tham số.
- *"Dùng AI ở khâu này thế nào?"* → Giao cho nó việc chuyển bảng số thành code và sinh biến thể để mình so sánh — nó dựng nhanh hơn mình gõ. Việc **không** giao là quyết định con số nào đúng: đó là thứ chỉ tay mình và mắt người chơi trả lời được, và một câu "cảm giác đã hơn" do AI viết ra không phải bằng chứng.

**Cờ đỏ**

- Mô tả game feel bằng tính từ, không có con số nào.
- Làm hạt và số sát thương trước khi có hitstop và âm thanh.
- Screenshake không giảm dần, hoặc cùng biên độ cho mọi sự kiện.
- Không có tuỳ chọn tắt rung.
- Phát âm thanh theo animation event thay vì cùng frame va chạm.

**Số / ví dụ nên thuộc**

- Coyote time **80–120 ms** · input buffer **100–150 ms** · phản hồi **≤ 2 frame (33 ms)**.
- Hitstop **50–120 ms** · chớp trắng **60–80 ms** · rung **4–10 px** trong **100–200 ms**, giảm dần.
- Tăng/giảm tốc **0,05–0,15 s**; squash & stretch **±15–25%**; trọng lực rơi **×1,5–2,5**.
- Ngẫu nhiên cao độ âm thanh **±8%**; số sát thương mờ dần trong **0,6 s**.
- Thứ tự làm: **hitstop → âm thanh → chớp trắng → rung → hạt → số**; ba cái đầu ≈ **70%** cảm giác.
