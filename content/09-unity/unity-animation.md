---
title: Animation trong Unity
icon: 🏃
summary: Animator Controller là bảng điều khiển hiển thị, không phải bộ não — giữ nó dưới 30 state, tắt Has Exit Time, và biết lúc nào nên bỏ nó mà điều khiển bằng code.
status: deep
read: 650
level: intermediate
order: 60
tags: [unity, animation, feel]
related: [animation-game, game-feel, combat-systems, unity-physics]
---

Hai quyết định định hình toàn bộ phần animation của dự án. **Một:** Animator Controller chỉ *hiển thị* trạng thái do code quyết định, hay nó *là* state machine của nhân vật? Chọn cách hai thì tháng thứ ba bạn sẽ có một đồ thị 60 state không ai dám sửa và luật chơi nằm trong file binary. **Hai:** dùng Animator, hay điều khiển clip hoàn toàn bằng code (Playables/Animancer, hoặc tự đổi sprite)? Câu trả lời phụ thuộc vào số state và ai chỉnh chúng — designer cần nhìn đồ thị, lập trình viên cần code đọc được.

Lý thuyết frame 1, frame data, cancel đã ở [[animation-game]] và [[combat-systems]]. Node này chỉ nói cách làm những điều đó trong Unity mà không hỏng.

## Đồ thị Animator thành spaghetti sau 30 state

Đồ thị Animator không có công cụ refactor. Không diff được trên Git, không tìm-thay được, và mỗi transition là một đường vẽ tay. Ở 10 state nó dễ hiểu, ở 30 state nó là mạng nhện, ở 60 state chỉ người vẽ ra nó mới sửa được — và người đó đã nghỉ.

Ba kỹ thuật giữ đồ thị đọc được:

- **Sub-State Machine** theo nhóm hành vi: `Locomotion`, `Combat`, `Airborne`, `Hurt`. Mỗi sub-machine dưới 10 state, transition giữa các nhóm đi qua Entry/Exit. Quy tắc: nếu phải kéo một đường xuyên qua hai nhóm, hãy tự hỏi có nên chuyển bằng `CrossFade` từ code không.
- **Any State chỉ dành cho thứ thật sự đến từ bất kỳ đâu** — `Hurt`, `Death`, `Stun`. Mỗi transition từ Any State là *N* transition ẩn (N = số state). Có 8 đường từ Any State với 40 state là 320 transition được đánh giá mỗi frame, và quan trọng hơn là không ai lần ra được vì sao nhân vật nhảy sang `Idle`. Bỏ tick **Can Transition To Self** trên các transition này — không thì `Hurt` khởi động lại mỗi frame khi tham số còn true, và animation bị đánh "kẹt ở frame 0".
- **Layer + Avatar Mask cho thân trên.** Bắn súng khi chạy không phải một state `RunShoot` — nó là layer `UpperBody` (weight 1, blending Override, mask từ xương spine lên) phát `Shoot` trên nền `Run` của Base Layer. Thêm layer `Additive` weight 0.3 cho thở/lắc đầu là cách rẻ nhất để đám NPC không trông như tượng. Mỗi layer là một lần đánh giá skeleton thêm, nên 2–3 layer là đủ; 6 layer là dấu hiệu đang lấy layer thay cho code.

## Has Exit Time và Transition Duration — hai con số quyết định "chậm"

Transition mặc định của Unity: `Has Exit Time` bật, `Exit Time` 0.75, `Transition Duration` 0.25s. Dịch sang cảm giác: nhân vật chạy hết ¾ animation hiện tại rồi mới bắt đầu chuyển sang hành động bạn vừa bấm, và mất thêm 250ms để chuyển xong. Đó là 400–600ms trễ được cài sẵn vào mọi dự án mới.

Bảng dùng trong thực tế:

| Transition | Has Exit Time | Duration (Fixed) | Interruption Source |
|---|---|---|---|
| → Attack, Dodge, Jump (người chơi khởi xướng) | **Tắt** | 0.05–0.1s | Current State (cho phép cancel) |
| → Hurt, Death | **Tắt** | **0** | Current State |
| Idle ↔ Walk/Run | Tắt | 0.1–0.15s | None |
| Attack → Idle (thu về) | Bật, Exit Time 1.0 | 0.15–0.2s | Next State |
| Jump → Fall | Tắt, điều kiện `VelocityY < 0` | 0.1s | None |

Đổi **Fixed Duration** thành bật (đơn vị giây) thay vì normalized — 0.1 normalized trên clip 2 giây là 200ms, trên clip 0.3 giây là 30ms, bạn không thể tinh chỉnh cảm giác bằng số nhảy múa theo độ dài clip.

Tham số kiểu **Trigger** là cái bẫy thứ hai: trigger được xếp hàng và chờ tới khi có transition nào tiêu thụ. Người chơi bấm đánh lúc đang `Hurt` (không có transition Hurt → Attack), 1 giây sau hết Hurt về Idle, trigger còn đó, nhân vật tự vung tay. Gọi `animator.ResetTrigger(AttackHash)` mỗi khi vào state không nhận đòn, hoặc bỏ trigger mà dùng `CrossFade` từ code.

## Blend Tree cho locomotion và bẫy chân trượt

Blend Tree 1D theo `Speed` cho Idle/Walk/Run, 2D Freeform Directional theo `(VelX, VelZ)` cho strafe — đây là chỗ Animator thật sự giỏi và code khó thay. Bẫy nằm ở **threshold**: clip Run được diễn hoạt ở 5 m/s (đo bằng "Compute Thresholds → Speed" từ root motion của clip), nhưng code cho nhân vật chạy 6.5 m/s → chân đạp chậm hơn mặt đất 30%, trượt như đi trên băng. Ba cách sửa theo thứ tự nên chọn: đổi tốc độ code cho khớp clip; đặt threshold đúng tốc độ thật của clip và để blend tree co giãn; hoặc nhân `animator.speed` theo tỉ lệ `velocity / clipSpeed` (chỉ với locomotion, không được ảnh hưởng đòn đánh — dùng tham số `Multiplier` trên motion trong blend tree thay vì `animator.speed` toàn cục).

Giá trị đưa vào tham số Blend Tree phải **làm mịn** (`SetFloat(hash, value, 0.1f, Time.deltaTime)` — bản có damp time), không thì Walk → Run nhảy phựt khi người chơi nghiêng stick.

## Điều khiển bằng code: hash, CrossFade, và đọc trạng thái đúng chỗ

```csharp
public class CharacterAnimator : MonoBehaviour {
    [SerializeField] Animator anim;
    static readonly int SpeedHash  = Animator.StringToHash("Speed");
    static readonly int AttackL    = Animator.StringToHash("Attack_Light");
    static readonly int Hurt       = Animator.StringToHash("Hurt");

    public void SetSpeed(float v) => anim.SetFloat(SpeedHash, v, 0.1f, Time.deltaTime);

    // Duration tính bằng GIÂY (InFixedTime), không phụ thuộc độ dài clip đích
    public void PlayAttackLight() => anim.CrossFadeInFixedTime(AttackL, 0.05f, 0);
    public void PlayHurt()        => anim.CrossFadeInFixedTime(Hurt, 0f, 0, 0f);   // cắt thẳng, từ frame 0

    // Đọc trạng thái CHỈ cho presentation (VFX, âm bước chân) — không cho luật chơi
    public bool AttackAnimNearEnd() {
        var s = anim.GetCurrentAnimatorStateInfo(0);
        return s.shortNameHash == AttackL && s.normalizedTime >= 0.9f && !anim.IsInTransition(0);
    }
}
```

`Animator.StringToHash` không chỉ để tiết kiệm vài µs — nó bắt lỗi chính tả ở một chỗ thay vì rải `"Atack_Light"` khắp 12 file. Khi state trên 20, `CrossFade` từ code thay cho transition vẽ tay: đồ thị chỉ còn các state và vài transition "thu về", còn *ai được sang đâu* nằm trong bảng cancel bằng dữ liệu, test được. `CrossFade` (không InFixedTime) nhận duration **normalized theo clip đích** — 0.1 trên clip 0.2s là 20ms, chính là nguồn của "blend lúc nhanh lúc chậm không hiểu vì sao".

## Animation Event không đáng tin — và thay bằng gì

Animation Event được kích khi thời gian clip **đi qua** mốc. Nếu một transition cắt ngang trước mốc, event không bao giờ chạy: âm rút kiếm không có, particle trail không tắt, cờ `isAttacking` không hạ. Nếu blend hai clip cùng có event thì cả hai đều chạy. Và event gọi hàm **bằng tên qua reflection** — đổi tên hàm không báo lỗi biên dịch, IL2CPP với stripping High có thể xoá hàm không ai gọi trực tiếp (đánh `[Preserve]` lên nó).

Dùng Animation Event cho thứ **được phép mất**: bước chân, bụi, tia sáng. Thứ phải đảm bảo xảy ra dùng một trong hai:

```csharp
// Gắn lên state Attack trong Animator. OnStateExit LUÔN chạy dù bị cắt ngang.
public class AttackStateBehaviour : StateMachineBehaviour {
    public override void OnStateExit(Animator animator, AnimatorStateInfo info, int layer) {
        animator.GetComponentInParent<AttackExecutor>()?.OnAttackAnimEnded();   // chỉ chạy lúc thoát state, không phải mỗi frame
    }
}
```

hoặc kiểm `normalizedTime` trong `Update` như hàm `AttackAnimNearEnd` ở trên. `StateMachineBehaviour` không serialize tham chiếu scene, nên nó phải tìm component qua Animator — chấp nhận được vì chỉ chạy lúc vào/ra state.

## Hitbox: bật/tắt collider con, nguồn chân lý là frame data

Hitbox theo animation làm bằng nhiều `Collider` con tắt sẵn, mỗi đòn bật đúng collider của nó trong khoảng active — [[combat-systems]] đã có `AttackExecutor` đếm frame bằng `WaitForFixedUpdate`. Điều Unity thêm vào: **không scale collider theo animation**, engine dựng lại shape mỗi lần đổi kích cỡ (xem [[unity-physics]]); 3 collider cố định bật/tắt rẻ hơn 1 collider scale. Nếu team nhất định muốn animator đặt hitbox bằng Animation Event, viết một Editor test đọc mọi event trong clip và đối chiếu với `AttackData` — không thì tuần nào cũng có đòn "trúng mà không ăn".

Với 2D, hitbox theo frame chuẩn nhất là **mảng `Collider2D[] hitboxPerFrame`** trong ScriptableObject của đòn, bật theo chỉ số frame — không cần Animator biết gì cả.

## Root motion hay code-driven

[[animation-game]] đã nêu lý do game hành động nhanh nên code-driven. Phần Unity: root motion **bật** = `Animator` ghi `transform` mỗi frame trong `OnAnimatorMove`, đè lên mọi thứ Rigidbody tính, nên bạn phải chọn một. Kết hợp đúng cách khi muốn "đòn lao tới" có khoảng dịch chuyển từ animation nhưng va chạm vẫn đúng:

```csharp
void OnAnimatorMove() {
    // Lấy quãng dịch từ animation, đưa qua Rigidbody để va chạm vẫn hoạt động
    rb.MovePosition(rb.position + anim.deltaPosition);
    rb.MoveRotation(rb.rotation * anim.deltaRotation);
}
```

Nếu có `OnAnimatorMove` thì Unity không tự áp dụng root motion nữa — bạn kiểm soát hoàn toàn, kể cả nhân với hệ số để designer chỉnh tầm lao mà không đụng clip. Chọn root motion khi nhịp chậm, chân thực, và nhân vật không cần đổi hướng giữa đòn. Chọn code-driven cho mọi thứ khác — và tắt **Apply Root Motion** trên Animator, vì bật nó với clip có xương root dịch chuyển nhẹ là nhân vật "trôi" 2cm mỗi vòng idle.

## Khi Animator không xứng

**3D với nhiều clip từ dữ liệu** (mỗi vũ khí một bộ đòn, moveset nạp từ ScriptableObject): Animator Controller bắt bạn kéo mọi clip vào đồ thị trước. **Animancer** (trả phí, ~2 ngày học) hoặc **Playables API** (có sẵn, dài dòng) cho phép `Play(clip, fadeSeconds)` bất kỳ clip nào, layer và mask từ code, không có đồ thị. Ngưỡng chuyển: trên 40 state, hoặc clip được chọn bằng dữ liệu. Dưới đó Animator vẫn đúng vì designer nhìn được.

**2D sprite animation:** Animator cho một nhân vật 8 clip là dùng dao mổ trâu — mỗi Animator tốn ~0.02–0.05ms/frame kể cả đứng yên, 200 kẻ địch là 4–10ms. Tự đổi sprite theo chỉ số frame rẻ hơn 20 lần và điều khiển frame chính xác:

```csharp
public class SpriteFlipbook : MonoBehaviour {
    [SerializeField] SpriteRenderer sr;
    Sprite[] frames; float fps; bool loop; float t; int index;

    public bool Finished => !loop && frames != null && index >= frames.Length - 1;
    public int  Frame    => index;                    // dùng để bật hitbox theo frame

    public void Play(Sprite[] clip, float clipFps = 12f, bool clipLoop = true) {
        frames = clip; fps = clipFps; loop = clipLoop; t = 0f; index = 0;
        sr.sprite = frames[0];
    }

    void Update() {
        if (frames == null) return;
        t += Time.deltaTime * fps;
        int next = loop ? (int)t % frames.Length : Mathf.Min((int)t, frames.Length - 1);
        if (next != index) { index = next; sr.sprite = frames[index]; }
    }
}
```

Skin/trang bị cho 2D dùng **Sprite Library** (package 2D Animation): `SpriteResolver.SetCategoryAndLabel("Body", "Idle_03")` — một bộ animation, N bộ sprite, không nhân đôi clip cho mỗi skin.

## Timing: timeScale, updateMode, và pool

- `Animator.updateMode`: `Normal` cho nhân vật — hitstop bằng `timeScale = 0` phải làm animation đứng theo. `UnscaledTime` cho UI và menu pause. **`Fixed`** (Unity 6; bản 2022 gọi là `AnimatePhysics`) cho nhân vật di chuyển bằng Rigidbody có root motion — Animator cập nhật cùng nhịp physics, hết rung lệch 50/60Hz.
- **Pool:** GameObject tắt rồi bật lại, Animator mặc định **reset về state mặc định và xoá tham số** — kẻ địch từ pool ra ở `Idle` khi code nghĩ nó đang `Death`. Bật `animator.keepAnimatorStateOnDisable = true` nếu muốn giữ, hoặc gọi `animator.Rebind(); animator.Update(0f);` ngay khi lấy từ pool để về trạng thái sạch **rồi** đặt tham số. Không gọi `Update(0f)` thì frame đầu tiên hiện pose của lần dùng trước.
- **Culling:** `Cull Update Transforms` cho NPC — ngoài màn hình vẫn chạy state machine nhưng không ghi bone. `Cull Completely` làm root motion và Animation Event dừng hẳn, NPC "đóng băng" rồi teleport khi vào tầm.

## Tween cho UI và thứ procedural — không dùng Animator

Animator trên phần tử UGUI đánh dấu **Canvas dirty mỗi frame** kể cả khi giá trị không đổi → Canvas rebuild liên tục, đúng thứ [[unity-ui]] bảo tránh. Nút phóng to khi hover, panel trượt vào, số điểm đếm lên: dùng **DOTween** hoặc **PrimeTween** (không cấp phát), 0.15–0.25s, ease OutBack cho popup, OutQuad cho trượt. Tween cũng đúng cho thứ procedural trong gameplay: squash & stretch khi tiếp đất, đổi màu chớp trắng, lắc vật phẩm — mọi thứ ở [[game-feel]] chỉnh bằng số, không cần clip.

**Animation Rigging / IK** (`TwoBoneIKConstraint` cho chân bám dốc, `MultiAimConstraint` cho đầu nhìn theo) chỉ khi camera đủ gần để thấy chân lơ lửng. Mỗi constraint tốn ~0.05–0.1ms/nhân vật trên mobile; bật cho nhân vật chính, tắt hẳn cho đám đông.

## Bẫy lộ ra khi build

- **Humanoid vs Generic:** Humanoid retarget mọi frame, đắt gấp ~1.5–2 lần Generic. Chỉ dùng Humanoid khi thật sự chia sẻ clip giữa các rig khác nhau.
- **Optimize Game Objects** trên rig import xoá transform của xương → `transform.Find("Hand_R")` để gắn vũ khí trả về null. Khai xương cần giữ trong **Extra Transforms to Expose**.
- **Anim. Compression = Optimal** (mặc định) làm ngón tay, mắt rung nhẹ ở clip chậm. Đổi thành Keyframe Reduction với Rotation Error 0.1 cho nhân vật chính; giữ Optimal cho đám đông.
- Animation Event gọi hàm bị strip trong IL2CPP — chỉ lộ trên build, log `AnimationEvent has no receiver`. Đánh `[Preserve]`.
- `Animator` trên object có `Rigidbody` non-kinematic với **Apply Root Motion** bật: hai hệ cùng ghi transform, nhân vật rung. Chọn một.

## Kiểm tra nhanh
- Bấm đòn đánh lúc đang chạy, quay màn hình 60fps: hình đổi trong **≤ 2 frame**?
- Base Layer < 30 state, Any State ≤ 3 transition, mọi transition từ Any State đã bỏ Can Transition To Self?
- Nhân vật chạy tốc độ tối đa cạnh một hàng ô 1m: chân trượt hơn 10cm mỗi bước không?
- Profiler `Animators.Update` với 50 nhân vật trong tầm nhìn < 2ms; ra khỏi tầm nhìn còn < 0.5ms?
- Lấy kẻ địch từ pool 10 lần liên tiếp sau khi chết: lần nào cũng ra ở Idle frame 0?

## 🤖 Prompt cho AI

AI vẽ giải pháp bằng đồ thị Animator (mà nó không nhìn thấy), để Has Exit Time mặc định, dùng string cho tham số, và điều khiển hitbox bằng Animation Event.

**Phải nêu rõ:**
- Animator hiển thị theo lệnh code, hay code-driven hoàn toàn (Animancer/Playables/sprite flipbook) — và số state dự kiến
- 2D hay 3D; nếu 3D thì Humanoid hay Generic, có root motion không
- Bảng transition: cái nào duration 0, cái nào 0.05–0.1s, cái nào có Exit Time — theo giây, không normalized
- Layer nào, Avatar Mask tới xương nào, blending Override hay Additive
- `updateMode` cho từng loại Animator (nhân vật / UI / Rigidbody)
- Object có được pool không — cần Rebind hay keepAnimatorStateOnDisable

**Mẫu prompt**

```
Viết lớp CharacterAnimator cho nhân vật 3D, Unity 6 (6000.0), Animator Controller có sẵn.

Trạng thái: Idle, Locomotion (Blend Tree 1D theo Speed, threshold 0 / 1.6 / 5.0 m/s),
Attack_Light, Attack_Heavy, Dodge, Hurt, Death. Layer 1 "UpperBody" mask từ Spine lên, Override.

Ràng buộc:
- Mọi tham số qua Animator.StringToHash cache static readonly. CẤM SetFloat("Speed", …) bằng string.
- Chuyển state bằng CrossFadeInFixedTime từ code: Attack/Dodge 0.05s, Hurt/Death 0s từ frame 0.
  KHÔNG dùng SetTrigger. KHÔNG dựa vào transition vẽ trong đồ thị trừ Attack→Idle có Exit Time.
- SetFloat Speed có damp 0.1s.
- Hitbox KHÔNG do Animation Event điều khiển — AttackExecutor đã có, chỉ gọi Play*.
- Kết thúc đòn báo qua StateMachineBehaviour OnStateExit, KHÔNG dùng Animation Event.
- updateMode = Normal (hitstop timeScale=0 phải dừng animation). Apply Root Motion = false.
- Object được pool: cung cấp ResetForPool() gọi Rebind() + Update(0f).
- Không GetComponent trong Update.

Sau khi viết, liệt kê mọi transition trong đồ thị mà code còn phụ thuộc vào.
```

**Bẫy thường gặp:** AI dùng `CrossFade(hash, 0.1f)` và bảo là "blend 100ms". Đó là 0.1 **độ dài clip đích** — với clip Hurt 0.25s là 25ms, với clip Death 2s là 200ms. Kết quả chạy được, trông gần đúng, nhưng cảm giác lệch không đều và không ai tìm ra vì sao. Bắt AI dùng `CrossFadeInFixedTime` và ghi đơn vị giây vào tên tham số.

## 💻 Code

Demo dựng một nhân vật 3D chạy bằng Rigidbody mà Animator chỉ *hiển thị*: tham số qua hash, chuyển Attack/Hit bằng `CrossFadeInFixedTime` tính bằng giây, Animator cập nhật theo nhịp physics, và hitbox là collider con bật đúng 4 bước FixedUpdate — kết thúc đòn báo qua `OnStateExit`, không tin Animation Event.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 360" role="img" aria-label="Hierarchy có Player với Rigidbody và CharacterAnimator, child Model có Animator và AttackHitboxRelay, child Hitbox_Sword; Inspector hiện Rigidbody, Character Animator, Animator và Relay; panel transition Idle sang Run">
  <rect x="10" y="10" width="200" height="340" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <rect x="16" y="52" width="188" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="22" y="67" class="fig-label" font-size="12" font-weight="600">▾ Player  (Rigidbody, Capsule)</text>
  <text x="38" y="88" class="fig-muted" font-size="12">▾ Model  (Animator + Relay)</text>
  <text x="54" y="106" class="fig-muted" font-size="11">Armature, Mesh</text>
  <text x="38" y="124" class="fig-muted" font-size="12">Hitbox_Sword  (Trigger, tắt)</text>
  <text x="22" y="144" class="fig-muted" font-size="12">Ground  (Layer: Ground)</text>
  <line x1="10" y1="160" x2="210" y2="160" class="fig-line"/>
  <text x="22" y="180" class="fig-label" font-size="12" font-weight="600">Transition Idle → Run</text>
  <text x="22" y="198" class="fig-muted" font-size="11">Has Exit Time</text><text x="150" y="198" class="fig-label" font-size="11">☐</text>
  <text x="22" y="214" class="fig-muted" font-size="11">Fixed Duration ☑</text><text x="150" y="214" class="fig-label" font-size="11">0.1 s</text>
  <text x="22" y="230" class="fig-muted" font-size="11">Interruption Source</text><text x="150" y="230" class="fig-label" font-size="11">None</text>
  <text x="22" y="246" class="fig-muted" font-size="11">Conditions</text><text x="150" y="246" class="fig-label" font-size="11">Speed &gt; 0.1</text>
  <line x1="10" y1="262" x2="210" y2="262" class="fig-line"/>
  <text x="22" y="282" class="fig-label" font-size="12" font-weight="600">Clip Attack — Animation Event</text>
  <text x="22" y="300" class="fig-muted" font-size="11">frame 6: OnAttackHitFrame()</text>
  <text x="22" y="316" class="fig-muted" font-size="11">→ AttackHitboxRelay (Model)</text>
  <text x="22" y="332" class="fig-muted" font-size="11">→ CharacterAnimator (Player)</text>
  <rect x="226" y="10" width="424" height="340" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector — Player / Model</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Rigidbody  (Player)</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Interpolate</text><text x="440" y="82" class="fig-label" font-size="11">Interpolate</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Constraints ▸ Freeze Rotation</text><text x="440" y="98" class="fig-label" font-size="11">X ☑  Y ☑  Z ☑</text>
  <rect x="234" y="108" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="121" class="fig-label" font-size="12" font-weight="600">Character Animator (Script)  (Player)</text>
  <text x="250" y="140" class="fig-muted" font-size="11">Anim</text><text x="440" y="140" class="fig-label" font-size="11">Model (Animator)</text>
  <text x="250" y="156" class="fig-muted" font-size="11">Attack Fade / Hit Fade</text><text x="440" y="156" class="fig-label" font-size="11">0.05 s   /   0 s</text>
  <text x="250" y="172" class="fig-muted" font-size="11">Hitbox</text><text x="440" y="172" class="fig-label" font-size="11">Hitbox_Sword (BoxCollider)</text>
  <text x="250" y="188" class="fig-muted" font-size="11">Hitbox Active Frames</text><text x="440" y="188" class="fig-label" font-size="11">4</text>
  <text x="250" y="204" class="fig-muted" font-size="11">Ground Mask / Check Radius</text><text x="440" y="204" class="fig-label" font-size="11">Ground   /   0.2</text>
  <rect x="234" y="214" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="227" class="fig-label" font-size="12" font-weight="600">Animator  (Model)</text>
  <text x="250" y="246" class="fig-muted" font-size="11">Controller</text><text x="440" y="246" class="fig-label" font-size="11">PlayerAC</text>
  <text x="250" y="262" class="fig-muted" font-size="11">Apply Root Motion</text><text x="440" y="262" class="fig-label" font-size="11">☐</text>
  <text x="250" y="278" class="fig-muted" font-size="11">Update Mode</text><text x="440" y="278" class="fig-label" font-size="11">Fixed  (2022: Animate Physics)</text>
  <text x="250" y="294" class="fig-muted" font-size="11">Culling Mode</text><text x="440" y="294" class="fig-label" font-size="11">Cull Update Transforms</text>
  <rect x="234" y="304" width="408" height="18" rx="3" fill="#b197fc" opacity="0.22"/>
  <text x="242" y="317" class="fig-label" font-size="12" font-weight="600">Attack Hitbox Relay (Script)  (Model)</text>
  <text x="250" y="336" class="fig-muted" font-size="11">Target</text><text x="440" y="336" class="fig-label" font-size="11">Player (Character Animator)</text>
</svg>
<figcaption>Animator ở child Model nên Animation Event chỉ gọi được hàm trên Model — relay chuyển tiếp lên script ở root. Update Mode Fixed vì nhân vật đi bằng Rigidbody; state Attack gắn thêm AttackStateBehaviour.</figcaption>
</figure>

**Script**

```csharp
// CharacterAnimator.cs — Unity 6 (6000.x). Đặt trên root Player (có Rigidbody). Animator nằm ở child "Model".
// Animator Controller cần tham số: Speed (Float), Grounded (Bool), VerticalSpeed (Float) và các state
// Idle, Run (Blend Tree 1D theo Speed), Jump, Fall, Attack, Hit. Không có tham số Trigger nào.
using System.Collections;
using UnityEngine;
using UnityEngine.Scripting;

[RequireComponent(typeof(Rigidbody))]
public class CharacterAnimator : MonoBehaviour
{
    [Header("Tham chiếu")]
    [SerializeField] Animator anim;                 // Animator ở child Model
    [SerializeField] Collider hitbox;               // BoxCollider isTrigger, tắt sẵn, child Hitbox_Sword

    [Header("Blend — đơn vị GIÂY")]
    [SerializeField] float attackFade = 0.05f;
    [SerializeField] float hitFade = 0f;
    [SerializeField] float speedDamp = 0.1f;

    [Header("Hitbox")]
    [SerializeField] int hitboxActiveFrames = 4;    // số bước FixedUpdate hitbox mở

    [Header("Ground check")]
    [SerializeField] LayerMask groundMask;
    [SerializeField] float groundCheckRadius = 0.2f;

    // Hash một lần — lỗi chính tả nằm ở đúng một chỗ, không rải "Atack" khắp 12 file
    static readonly int SpeedHash         = Animator.StringToHash("Speed");
    static readonly int GroundedHash      = Animator.StringToHash("Grounded");
    static readonly int VerticalSpeedHash = Animator.StringToHash("VerticalSpeed");
    static readonly int AttackState       = Animator.StringToHash("Attack");
    static readonly int HitState          = Animator.StringToHash("Hit");

    Rigidbody rb;
    Coroutine hitboxRoutine;

    public bool IsAttacking { get; private set; }

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        rb.interpolation = RigidbodyInterpolation.Interpolate;

        // Animator cập nhật cùng nhịp physics khi nhân vật chạy bằng Rigidbody — hết rung lệch 50/60Hz.
        anim.updateMode = AnimatorUpdateMode.Fixed;                    // 2022 LTS: AnimatorUpdateMode.AnimatePhysics
        anim.cullingMode = AnimatorCullingMode.CullUpdateTransforms;   // ngoài màn hình vẫn chạy state machine, không ghi bone
        anim.applyRootMotion = false;                                  // code-driven: Rigidbody là chủ transform

        hitbox.enabled = false;
    }

    void Update()
    {
        // Presentation đọc từ physics, không phải ngược lại.
        Vector3 v = rb.linearVelocity;                                 // 2022 LTS: rb.velocity
        float planar = new Vector2(v.x, v.z).magnitude;
        anim.SetFloat(SpeedHash, planar, speedDamp, Time.deltaTime);   // bản có damp: Walk → Run không nhảy phựt
        anim.SetFloat(VerticalSpeedHash, v.y);
        anim.SetBool(GroundedHash, CheckGround());

        // --- demo input: thay bằng InputReader trong dự án thật (xem unity-input) ---
        var mouse = UnityEngine.InputSystem.Mouse.current;
        if (mouse != null && mouse.leftButton.wasPressedThisFrame) PlayAttack();
        var kb = UnityEngine.InputSystem.Keyboard.current;
        if (kb != null && kb.hKey.wasPressedThisFrame) PlayHit();
    }

    public void PlayAttack()
    {
        // InFixedTime: 0.05 GIÂY dù clip đích dài bao nhiêu. CrossFade thường = 0.05 × độ dài clip đích.
        anim.CrossFadeInFixedTime(AttackState, attackFade, 0);
        IsAttacking = true;
    }

    public void PlayHit()
    {
        anim.CrossFadeInFixedTime(HitState, hitFade, 0, 0f);   // cắt thẳng, từ frame 0
        CancelAttack();                                        // bị đánh thì hitbox phải tắt ngay lập tức
    }

    /// Gọi từ Animation Event trên clip Attack (qua AttackHitboxRelay ở child Model).
    /// [Preserve] để IL2CPP stripping không xoá hàm chỉ được gọi bằng tên qua reflection.
    [Preserve]
    public void OnAttackHitFrame()
    {
        if (hitboxRoutine != null) StopCoroutine(hitboxRoutine);
        hitboxRoutine = StartCoroutine(HitboxWindow());
    }

    /// Gọi từ AttackStateBehaviour.OnStateExit — LUÔN chạy dù transition cắt ngang (Animation Event thì không).
    public void OnAttackAnimEnded()
    {
        IsAttacking = false;
        CancelAttack();
    }

    void CancelAttack()
    {
        if (hitboxRoutine != null) { StopCoroutine(hitboxRoutine); hitboxRoutine = null; }
        hitbox.enabled = false;
    }

    IEnumerator HitboxWindow()
    {
        hitbox.enabled = true;
        for (int i = 0; i < hitboxActiveFrames; i++) yield return new WaitForFixedUpdate();  // đếm theo bước physics, không theo frame render
        hitbox.enabled = false;
        hitboxRoutine = null;
    }

    bool CheckGround()
    {
        Vector3 feet = transform.position + Vector3.up * (groundCheckRadius * 0.9f);
        return Physics.CheckSphere(feet, groundCheckRadius, groundMask, QueryTriggerInteraction.Ignore);
    }

    void OnDrawGizmosSelected()
    {
        if (hitbox == null) return;
        Gizmos.color = hitbox.enabled ? Color.red : Color.gray;
        Gizmos.DrawWireSphere(hitbox.transform.position, 0.3f);
    }
}
```

```csharp
// AttackHitboxRelay.cs — đặt trên child Model (cùng GameObject với Animator).
// Animation Event chỉ gọi được hàm trên GameObject có Animator, nên relay chuyển tiếp lên CharacterAnimator ở root.
using UnityEngine;
using UnityEngine.Scripting;

public class AttackHitboxRelay : MonoBehaviour
{
    [SerializeField] CharacterAnimator target;   // để trống thì tự tìm ở parent

    void Awake()
    {
        if (target == null) target = GetComponentInParent<CharacterAnimator>();
    }

    [Preserve]
    public void OnAttackHitFrame() => target.OnAttackHitFrame();   // tên hàm = tên trong Animation Event; đổi một bên là gãy, không có lỗi biên dịch
}
```

```csharp
// AttackStateBehaviour.cs — gắn lên state Attack trong Animator (Add Behaviour).
// OnStateExit LUÔN chạy dù state bị Hit cắt ngang giữa chừng — thứ Animation Event không đảm bảo.
using UnityEngine;

public class AttackStateBehaviour : StateMachineBehaviour
{
    public override void OnStateExit(Animator animator, AnimatorStateInfo stateInfo, int layerIndex)
    {
        animator.GetComponentInParent<CharacterAnimator>()?.OnAttackAnimEnded();   // chỉ chạy lúc thoát state, GetComponent ở đây chấp nhận được
    }
}
```

**Chạy thử**
- Kéo Player chạy (đặt `Linear Velocity` trong Inspector chế độ Debug, hoặc thêm script di chuyển): tham số `Speed` trong cửa sổ Animator tăng mượt trong ~0.1s rồi đứng đúng bằng tốc độ ngang — không nhảy phựt từ 0 lên 5.
- Click chuột trái: state Attack sáng trong cửa sổ Animator sau ≤ 1 frame; từ lúc Animation Event chạy, gizmo hitbox đỏ đúng 4 bước FixedUpdate (= 80ms với Fixed Timestep 0.02) rồi xám lại. Đổi `Hitbox Active Frames` thành 8 khi đang Play: cửa sổ dài gấp đôi.
- Nhấn H giữa lúc Attack: state Hit cắt thẳng từ frame 0, hitbox tắt ngay trong cùng frame — không có frame nào gizmo đỏ khi đang Hit, và `IsAttacking` về false nhờ `OnStateExit`.
- Đổi Update Mode `Fixed` → `Normal` và chạy ở màn 144Hz: nhân vật đi bằng Rigidbody thấy rung bậc 50/144; trả lại `Fixed` là hết.
- Đổi tên hàm trong `AttackHitboxRelay` thành `OnAttackHitFrame2`: code vẫn biên dịch, Console báo `'Model' AnimationEvent 'OnAttackHitFrame' has no receiver!` khi đánh — đó là toàn bộ cảnh báo bạn nhận được từ Animation Event; kết thúc đòn vẫn báo đúng qua `OnStateExit`.
