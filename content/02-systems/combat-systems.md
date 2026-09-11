---
title: Combat Systems
icon: ⚔️
summary: Giải phẫu một hệ thống chiến đấu — frame data, telegraph, tam giác khắc chế, và cách làm nó đọc được.
status: deep
read: 190
level: intermediate
order: 30
tags: [systems, combat]
related: [game-feel, balancing-math, behavior-tree, difficulty-curve]
---

Chiến đấu tốt là một **cuộc hội thoại**: kẻ địch nói (ra đòn), người chơi trả lời (né/đỡ/phản), và cả hai bên đều hiểu ngôn ngữ đó.

## Giải phẫu một đòn đánh

Mọi hành động chiến đấu chia làm ba giai đoạn:

<figure class="fig">
<svg viewBox="0 0 660 220" role="img" aria-label="Dòng thời gian một đòn đánh gồm ba giai đoạn startup, active, recovery, kèm cửa sổ phản ứng của người chơi">
  <text x="12" y="20" class="fig-muted" font-size="11">frame</text>
  <g class="fig-muted" font-size="10" text-anchor="middle">
    <text x="60" y="20">0</text><text x="230" y="20">8</text>
    <text x="315" y="20">12</text><text x="570" y="20">24</text>
  </g>
  <rect x="60"  y="30" width="170" height="42" rx="5" fill="#ffd43b" opacity="0.22" stroke="#ffd43b"/>
  <rect x="230" y="30" width="85"  height="42" rx="5" fill="#ff8787" opacity="0.30" stroke="#ff8787"/>
  <rect x="315" y="30" width="255" height="42" rx="5" fill="#6b7488" opacity="0.18" stroke="#6b7488"/>
  <text x="145" y="56" text-anchor="middle" class="fig-label" font-size="13">STARTUP</text>
  <text x="272" y="56" text-anchor="middle" class="fig-label" font-size="12">ACTIVE</text>
  <text x="442" y="56" text-anchor="middle" class="fig-label" font-size="13">RECOVERY</text>
  <text x="145" y="88" text-anchor="middle" class="fig-muted" font-size="11">vung lên — telegraph</text>
  <text x="272" y="88" text-anchor="middle" class="fig-muted" font-size="11">gây dmg</text>
  <text x="442" y="88" text-anchor="middle" class="fig-muted" font-size="11">thu về — cửa sổ bị trừng phạt</text>
  <line x1="60" y1="112" x2="230" y2="112" stroke="#51cf9b" stroke-width="2"/>
  <line x1="60" y1="106" x2="60" y2="118" stroke="#51cf9b" stroke-width="2"/>
  <line x1="230" y1="106" x2="230" y2="118" stroke="#51cf9b" stroke-width="2"/>
  <text x="145" y="132" text-anchor="middle" font-size="11" fill="#51cf9b">người chơi đọc và phản ứng ở đây</text>
  <line x1="315" y1="112" x2="570" y2="112" stroke="#ff8787" stroke-width="2"/>
  <line x1="315" y1="106" x2="315" y2="118" stroke="#ff8787" stroke-width="2"/>
  <line x1="570" y1="106" x2="570" y2="118" stroke="#ff8787" stroke-width="2"/>
  <text x="442" y="132" text-anchor="middle" font-size="11" fill="#ff8787">đối phương phản đòn ở đây</text>
  <line x1="60" y1="160" x2="646" y2="160" class="fig-line" stroke-dasharray="3 3"/>
  <text x="60" y="180" class="fig-muted" font-size="11">Ngưỡng người thật:</text>
  <rect x="175" y="168" width="120" height="16" rx="3" fill="#51cf9b" opacity="0.2" stroke="#51cf9b"/>
  <text x="235" y="180" text-anchor="middle" font-size="10" fill="#51cf9b">~250ms nhận biết</text>
  <rect x="299" y="168" width="90" height="16" rx="3" fill="#ffd43b" opacity="0.2" stroke="#ffd43b"/>
  <text x="344" y="180" text-anchor="middle" font-size="10" fill="#ffd43b">~150ms bấm</text>
  <text x="400" y="180" class="fig-muted" font-size="11">→ telegraph dưới 400ms là không phản ứng kịp</text>
  <text x="60" y="206" class="fig-muted" font-size="11">Ở 60 FPS: 1 frame ≈ 16.7ms · 8 frame ≈ 133ms · 24 frame ≈ 400ms</text>
</svg>
<figcaption>Startup là giai đoạn quan trọng nhất về mặt thiết kế — nó là toàn bộ thông tin người chơi có để quyết định. Recovery là phần thưởng cho việc né đúng.</figcaption>
</figure>

- **Startup** là *telegraph* — thứ người chơi đọc để phản ứng. Đây là giai đoạn quan trọng nhất về mặt thiết kế.
- **Active** là cửa sổ gây sát thương thực.
- **Recovery** là cửa sổ trừng phạt — nơi đối phương được thưởng vì đã né đúng.

Bảng tham chiếu thực tế (ở 60 FPS):

| Loại đòn | Startup | Active | Recovery | Ghi chú |
|---|---|---|---|---|
| Đòn nhẹ | 6–10f (100–166ms) | 3–5f | 10–14f | Phải cảm thấy tức thì |
| Đòn nặng | 18–30f (300–500ms) | 5–8f | 25–40f | Phạt nặng nếu hụt |
| Đòn boss chí mạng | 45–70f (750ms–1.2s) | 6–10f | 40–60f | Cần đủ dài để đọc được |

**Luật vàng:** telegraph của kẻ địch phải dài hơn **thời gian phản ứng của con người + thời gian thực hiện hành động né**. Thời gian phản ứng thị giác trung bình là 250ms; người chơi bình thường cần ~400ms để nhận biết + bấm. Telegraph dưới 300ms là không phản ứng được — chỉ ghi nhớ được. Đó là lựa chọn thiết kế hợp lệ, nhưng phải cố ý.

## Đọc được là ưu tiên số một

Người chơi cần trả lời 3 câu hỏi trong mọi khoảnh khắc:

1. **Tôi có đang bị nhắm không?** — dùng hướng nhìn, chỉ báo, âm thanh riêng.
2. **Đòn gì đang tới?** — mỗi đòn cần một hình bóng (silhouette) khác biệt, không chỉ khác animation.
3. **Tôi phải làm gì?** — telegraph phải ánh xạ nhất quán tới hành động đúng (ví dụ: ánh đỏ = không đỡ được, phải né).

Nếu phải chọn giữa đẹp và đọc được, luôn chọn đọc được.

## Tam giác khắc chế

Cấu trúc kéo-búa-bao ép người chơi phải đọc tình huống thay vì spam một nút:

```
Đòn thường  →  thắng  →  Đỡ chậm
Đòn phá đỡ  →  thắng  →  Đỡ
Đỡ          →  thắng  →  Đòn thường
```

Đây là bộ khung tối thiểu tạo ra chiều sâu mà không cần thêm cơ chế. Mở rộng bằng khoảng cách (gần/xa), độ cao, hoặc tài nguyên (stamina).

## Tài nguyên tạo quyết định

Chiến đấu không có tài nguyên sẽ thoái hoá thành spam đòn tối ưu. Các tài nguyên thường dùng:

- **Stamina** — giới hạn cả tấn công lẫn né. Tạo nhịp điệu tự nhiên.
- **Poise / Stagger** — thanh ẩn, đầy thì kẻ địch choáng. Thưởng cho áp lực liên tục.
- **Vị trí** — tài nguyên rẻ nhất và bị đánh giá thấp nhất. Bản đồ có chướng ngại tạo ra quyết định mà không cần thêm chỉ số nào.

## Kiểm tra chất lượng

- **Test dừng khung hình** — dừng game giữa trận. Có đoán được chuyện gì sắp xảy ra không? Nếu không, telegraph chưa đủ rõ.
- **Test một nút** — chỉ bấm nút tấn công. Nếu thắng được, hệ thống thiếu áp lực.
- **Test tắt tiếng** — tắt loa. Còn chơi được không? Nếu không, bạn đang dồn quá nhiều thông tin vào âm thanh (và đây cũng là vấn đề trợ năng).
- **Test lỗi có chủ ý** — cố ý đánh hụt. Hình phạt có tương xứng và dễ hiểu không?

## 🤖 Prompt cho AI

Frame data là thứ AI thực thi chính xác — hãy đưa đúng dạng bảng:

```yaml
attacks:
  light:
    startup_frames: 8
    active_frames: 4
    recovery_frames: 12
    damage: 12
    stamina_cost: 10
    cancelable_into: [light, dodge]
  heavy:
    startup_frames: 24
    active_frames: 6
    recovery_frames: 32
    damage: 34
    armor_frames: [10, 24]     # không bị gián đoạn trong khoảng này
    cancelable_into: []

enemy.brute:
  telegraph:
    slam:  { windup_ms: 900, tell: "phát sáng đỏ + tiếng gầm", counter: "dodge" }
    sweep: { windup_ms: 600, tell: "cúi thấp",                 counter: "jump" }
```

Trường `counter` là thứ biến bảng số thành một **hợp đồng thiết kế**: mỗi đòn kẻ địch phải có đúng một câu trả lời rõ ràng. Yêu cầu agent kiểm tra bất biến này khi thêm kẻ địch mới — xem [[agent-guardrails]].

## 🎮 Unity

Frame data trong Unity nên là **dữ liệu, không phải animation event**. Đây là quyết định kiến trúc quan trọng nhất của mục này.

**Component & nơi đặt**
- `AttackData` (ScriptableObject) — một asset mỗi đòn đánh, trong `Assets/Data/Attacks/`
- `AttackExecutor.cs` — trên nhân vật, đọc `AttackData` và bật/tắt hitbox
- Hitbox = `BoxCollider2D` với `isTrigger = true`, nằm trên GameObject con, **mặc định tắt**

**Code**

```csharp
[CreateAssetMenu(menuName = "Game/Attack Data")]
public class AttackData : ScriptableObject {
    [Header("Frame data @ 60 FPS")]
    public int startupFrames  = 8;
    public int activeFrames   = 4;
    public int recoveryFrames = 12;

    [Header("Hiệu quả")]
    public int   damage      = 12;
    public float knockback   = 320f;
    public float staminaCost = 10f;

    [Header("Hợp đồng thiết kế")]
    public CounterType counter = CounterType.Dodge;   // người chơi phải làm gì
    public AttackData[] cancelableInto;

    public int TotalFrames => startupFrames + activeFrames + recoveryFrames;
    public float StartupSeconds => startupFrames / 60f;
}
```

```csharp
public class AttackExecutor : MonoBehaviour {
    [SerializeField] Hitbox hitbox;
    [SerializeField] Animator animator;

    public bool IsAttacking { get; private set; }
    public int  CurrentFrame { get; private set; }

    public IEnumerator Execute(AttackData atk) {
        IsAttacking = true;
        animator.CrossFade(atk.name, 0f);     // blend 0: phản hồi tức thì

        // Đếm bằng FixedUpdate để tất định, KHÔNG dùng Time.deltaTime
        for (CurrentFrame = 0; CurrentFrame < atk.TotalFrames; CurrentFrame++) {
            bool active = CurrentFrame >= atk.startupFrames
                       && CurrentFrame <  atk.startupFrames + atk.activeFrames;
            hitbox.SetActive(active, atk);
            yield return new WaitForFixedUpdate();
        }

        hitbox.SetActive(false, null);
        IsAttacking = false;
    }
}
```

**Sơ đồ setup trong scene**

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Sơ đồ Hierarchy và Inspector cho setup hitbox trong Unity">
<text x="14" y="16" class="fig-muted" font-size="10.5">HIERARCHY</text>
<rect x="14" y="24" width="270" height="168" rx="8" class="fig-box"/>
<g class="fig-label" font-size="12">
  <text x="30" y="46">▾ Player</text>
  <text x="48" y="68">PlayerController</text>
  <text x="48" y="88">AttackExecutor</text>
  <text x="48" y="108">Animator</text>
  <text x="44" y="132">▾ Hitbox_Light</text>
  <text x="62" y="154">BoxCollider2D</text>
  <text x="62" y="174">Hitbox.cs</text>
</g>
<g class="fig-muted" font-size="10">
  <text x="160" y="68">logic di chuyển</text>
  <text x="160" y="88">đọc AttackData</text>
  <text x="160" y="108">chỉ hiển thị</text>
  <text x="175" y="154">isTrigger ✓</text>
  <text x="175" y="174">bật/tắt theo frame</text>
</g>
<rect x="38" y="120" width="238" height="66" rx="6" fill="#ff8787" opacity="0.08" stroke="#ff8787" stroke-dasharray="4 3"/>
<text x="157" y="206" text-anchor="middle" font-size="10" fill="#ff8787">GameObject con — MẶC ĐỊNH TẮT</text>
<text x="330" y="16" class="fig-muted" font-size="10.5">ASSET</text>
<rect x="330" y="24" width="316" height="168" rx="8" class="fig-box"/>
<text x="346" y="46" class="fig-label" font-size="12">Assets/Data/Attacks/Light.asset</text>
<line x1="346" y1="56" x2="630" y2="56" class="fig-line"/>
<g font-size="11">
  <text x="346" y="78" class="fig-muted">startupFrames</text><text x="560" y="78" class="fig-label">8</text>
  <text x="346" y="98" class="fig-muted">activeFrames</text><text x="560" y="98" class="fig-label">4</text>
  <text x="346" y="118" class="fig-muted">recoveryFrames</text><text x="560" y="118" class="fig-label">12</text>
  <text x="346" y="138" class="fig-muted">damage</text><text x="560" y="138" class="fig-label">12</text>
  <text x="346" y="158" class="fig-muted">counter</text><text x="560" y="158" fill="#51cf9b">Dodge</text>
  <text x="346" y="178" class="fig-muted">knockback</text><text x="560" y="178" class="fig-label">320</text>
</g>
<path d="M284 90 H330" class="fig-line" stroke="#4dd4e0" stroke-width="1.5"/>
<text x="307" y="84" text-anchor="middle" font-size="9.5" fill="#4dd4e0">đọc</text>
<text x="330" y="218" class="fig-muted" font-size="10.5">ScriptableObject là nguồn chân lý — animation chỉ minh hoạ nó</text>
<text x="330" y="236" font-size="10.5" fill="#51cf9b">counter ≠ None ⇒ mỗi đòn có đúng một câu trả lời cho người chơi</text>
</svg>
<figcaption>Hitbox là GameObject con tắt sẵn; <code>AttackExecutor</code> bật nó đúng khoảng active frame đọc từ asset. Animation không đụng vào hitbox.</figcaption>
</figure>

**Setup bắt buộc trong Project Settings**

`Edit > Project Settings > Time > Fixed Timestep = 0.01667` (1/60).

Nếu để mặc định 0.02 (50 Hz), frame data của bạn chạy ở 50 FPS trong khi animation chạy 60 — lệch 20% và không ai hiểu vì sao đòn đánh "cảm giác sai".

**Vì sao KHÔNG dùng Animation Event cho hitbox**

Animation Event trông tiện nhưng tạo ra một lỗi âm thầm: animator kéo dài animation cho đẹp → hitbox đổi theo → cân bằng game đổi mà không ai biết. Frame data phải là **một nguồn chân lý duy nhất**; animation chỉ minh hoạ nó.

Nếu đã lỡ dùng Animation Event, ít nhất hãy viết test đối chiếu event time với `AttackData`.

**Kiểm tra nhanh**
- Mỗi `AttackData` có `counter` khác `None` — mỗi đòn phải có đúng một câu trả lời.
- Đòn của kẻ địch: `startupFrames >= 18` (0.3s) để người chơi phản ứng kịp.
- Bật Gizmos, pause ở frame active — hitbox có khớp với animation không?
