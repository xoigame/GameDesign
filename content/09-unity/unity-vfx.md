---
title: VFX & Hiệu ứng
icon: ✨
summary: Shuriken cho gameplay và mobile, VFX Graph cho số lượng; kẻ giết frame là overdraw chứ không phải số hạt; và mọi hiệu ứng nổ đều phải đi qua pool.
status: deep
read: 700
level: intermediate
order: 110
tags: [unity, vfx, feel]
related: [game-feel, unity-shader, unity-camera, unity-optimization]
---

Quyết định đầu tiên: **hiệu ứng này có cần gameplay đọc được nó không, và máy yếu nhất có chạy compute shader không?** Hai câu đó chọn Particle System hay VFX Graph, và chọn sai là làm lại toàn bộ thư viện hiệu ứng. Quyết định thứ hai, đắt hơn về hiệu năng: **ngân sách overdraw** — một tấm khói 512×512 phủ nửa màn hình tốn hơn 2000 tia lửa 8×8.

Số liệu hitstop, biên độ rung, thứ tự ưu tiên juice đã ở [[game-feel]]. Node này nói cách nối chúng thành pipeline trong Unity mà không cấp phát, không rò và không nát trên mobile.

## Particle System (Shuriken) hay VFX Graph

| | Particle System | VFX Graph |
|---|---|---|
| Chạy trên | CPU (job hoá, Burst) | GPU compute shader |
| Số hạt thoải mái | 1–5 nghìn toàn cảnh | Hàng trăm nghìn – triệu |
| Gameplay đọc/ghi hạt | `GetParticles`/`SetParticles`, `OnParticleCollision`, trigger module | Gần như không — GPU không trả về CPU |
| Va chạm với thế giới | Collision module với collider thật | Chỉ depth buffer / SDF |
| Mobile | Mọi máy | Cần compute (GLES 3.1+/Vulkan/Metal) — Android tầm thấp và driver Mali cũ **hỏng hoặc rớt** |
| 2D sorting với sprite | `Sorting Layer` + `Order in Layer` trên renderer | Được qua Sorting Group nhưng lệch với sprite thường |
| Chỉnh trong Editor | Inspector module, designer quen | Node graph, cần người hiểu shader |
| Draw call | 1 mỗi system (1 material) | 1 mỗi output context |

Luật thực dụng: **Shuriken là mặc định**. VFX Graph chỉ khi cần số lượng (mưa, tuyết, đám đông hạt ma thuật, portal 3D) **và** nền tảng đích là PC/console hoặc mobile tầm trung trở lên có kiểm tra `SystemInfo.supportsComputeShaders` với fallback Shuriken. Game 2D pixel gần như không có lý do dùng VFX Graph.

## Ngân sách: overdraw, không phải số hạt

Fill rate là giới hạn thật trên mobile. Mỗi hạt là một quad bán trong suốt; GPU tô **mọi pixel** của quad kể cả pixel alpha 0, và tô lại pixel đó cho từng hạt chồng lên. Khói 30 hạt 256×256 chồng nhau ở giữa màn hình = một pixel bị tô 15–30 lần. Mali-G52 ở 1080p chịu được ~3–4 lần toàn màn hình mỗi frame ở 60 FPS — vụ nổ đó một mình đã ăn hết.

Đo: **Rendering Debugger** (Window > Analysis > Rendering Debugger) > Rendering > `Full Screen Debug Mode = Overdraw`. Vùng đỏ đậm là nơi cần cắt. Trong URP, chế độ Overdraw của Scene view cũ không dùng được — chỉ Rendering Debugger.

Cách cắt, theo hiệu quả:
1. **Ít hạt to hơn nhiều hạt nhỏ, nhưng texture sát mép** — sprite khói không nên có 40% viền trong suốt; cắt mesh hạt hoặc dùng `Render Mode = Mesh` với hình bát giác thay quad.
2. **Không quá 2 lớp alpha phủ cùng vùng**: một lớp khói + một lớp lửa. Lớp thứ ba (glow toàn màn) làm bằng Volume, không bằng hạt.
3. Texture hạt 64–128 px là đủ; 512 chỉ cho hạt duy nhất chiếm nửa màn.
4. `Soft Particles` tắt trên mobile (đọc depth mỗi pixel).

Ngân sách tham khảo cho game hành động mobile: ≤ 300 hạt sống cùng lúc toàn cảnh, ≤ 12 ParticleSystem đang phát, hiệu ứng lớn nhất ≤ 60 hạt. PC gấp 10 lần và vẫn không thấy trên Profiler.

## Pool ParticleSystem — bắt buộc

`Instantiate(hitPrefab)` mỗi cú đánh + `Destroy(go, 2f)`: 40 cú đánh/giây trong boss fight = 40 lần cấp phát + 40 lần huỷ, GC spike mỗi vài giây. Pool:

```csharp
public class VfxPool : MonoBehaviour {
    [SerializeField] ParticleSystem prefab;
    [SerializeField] int prewarm = 8;
    readonly Stack<ParticleSystem> free = new();

    void Awake() { for (int i = 0; i < prewarm; i++) free.Push(Create()); }

    ParticleSystem Create() {
        var ps = Instantiate(prefab, transform);
        var main = ps.main;
        main.playOnAwake = false;                            // prefab pool KHÔNG tự phát khi SetActive
        main.stopAction = ParticleSystemStopAction.Callback; // báo về khi mọi hạt chết
        ps.gameObject.AddComponent<VfxReturn>().pool = this;
        ps.gameObject.SetActive(false);
        return ps;
    }

    public ParticleSystem Play(Vector3 pos, Quaternion rot) {
        var ps = free.Count > 0 ? free.Pop() : Create();     // hết thì mở rộng, log warning để chỉnh prewarm
        ps.transform.SetPositionAndRotation(pos, rot);
        ps.gameObject.SetActive(true);
        ps.Play(withChildren: true);
        return ps;
    }

    public void Return(ParticleSystem ps) {
        ps.Stop(true, ParticleSystemStopBehavior.StopEmittingAndClear);  // xoá hạt còn sống ở cả con
        ps.gameObject.SetActive(false);
        free.Push(ps);
    }
}

public class VfxReturn : MonoBehaviour {
    public VfxPool pool;
    void OnParticleSystemStopped() => pool.Return(GetComponent<ParticleSystem>());
}
```

Ba bẫy cụ thể:
- **`OnParticleSystemStopped` chỉ được gọi khi hệ không loop** và mọi hạt đã chết. Một child để `Looping` bật (thường là glow nền) là cả hệ không bao giờ trả về pool. Kiểm tra mọi child.
- **Child không reset** nếu chỉ `Stop()` trên cha không có `withChildren` — hạt con còn treo ở vị trí cũ, lần phát sau thấy "tàn dư" ở chỗ đánh trước. Luôn `Stop(true, StopEmittingAndClear)`.
- **`Play On Awake` bật trên prefab pool**: `SetActive(true)` là phát ngay ở vị trí cũ, trước khi `SetPositionAndRotation` — một frame hạt xuất hiện sai chỗ. Tắt trong prefab, không chỉ trong code.

`Stop Action = Disable` là lựa chọn không cần script cho hiệu ứng không pool (một lần mỗi màn), nhưng nó không báo về nên không tái dùng được.

## Gắn vào bone và bẫy scale

Hiệu ứng theo tay (trail kiếm, lửa trên vũ khí) parent vào bone. Bone có scale không đồng nhất, hoặc nhân vật có `localScale = (-1, 1, 1)` để quay mặt (2D) → hạt bị bóp, lật, hoặc bay ngược. Sửa bằng **`Scaling Mode`** trong Main module:
- `Hierarchy` — hạt scale theo mọi scale cha: hợp cho hiệu ứng "thuộc về" vật (aura quanh enemy to nhỏ khác nhau).
- `Local` — chỉ scale của chính ParticleSystem: **mặc định nên chọn** cho hạt gắn bone.
- `Shape` — chỉ vùng phát scale, hạt giữ kích cỡ: cho hiệu ứng phủ bề mặt.

Khói, lửa từ vật đang di chuyển (xe, đạn) đặt **`Simulation Space = World`** — hạt đã phát ra ở lại đúng chỗ trong thế giới, không kéo theo vật. `Local` cho hạt phải bám (aura, shield). Trộn hai cái trong một hệ không được; dùng hai hệ con.

## Sorting trong 2D

`ParticleSystemRenderer` có `Sorting Layer` và `Order in Layer` như SpriteRenderer. Hiệu ứng trúng đòn để layer `FX`, order cao hơn nhân vật; khói bụi chân để layer nhân vật, order thấp hơn. Trong cùng layer và order, Unity sort theo khoảng cách camera — hạt và sprite ở cùng Z tranh nhau flicker. **`Sorting Fudge`** (số âm là vẽ sau, tức nằm trên) dịch hệ hạt trong hàng đợi sort mà không đổi Z. Hạt trong cùng một hệ sort theo `Sort Mode` (By Distance / Oldest / Youngest in Front) — hiệu ứng nổ dùng *Youngest in Front* để hạt mới nằm trên hạt đang tan.

Sprite Renderer với `Sorting Group` gom nhân vật + hiệu ứng thành một khối sort, tránh hạt của enemy A xuyên lên nhân vật B đứng trước.

## Pipeline hit effect — 0 đến 150 ms

Thứ tự thời gian cho một đòn trúng tầm trung, mọi số lấy từ `FeelConfig` ([[game-feel]]):

| Thời điểm | Việc | Trong Unity |
|---|---|---|
| 0 ms | SFX, flash trắng bắt đầu, hitstop bắt đầu, burst hạt, impulse camera | Cùng một hàm `OnHit`, cùng frame va chạm — không đợi animation |
| 0–70 ms | Hitstop: nhân vật và mục tiêu đứng hình, hạt **vẫn chạy** | Local clock = 0 cho hai thực thể; hạt dùng unscaled hoặc không chịu clock |
| 70 ms | Flash tắt, knockback bắt đầu, hitstop kết thúc | `MaterialPropertyBlock` `_FlashAmount = 0`; velocity đẩy |
| 70–150 ms | Knockback giảm dần, camera hồi | Impulse decay do Cinemachine lo |
| 150 ms | Hết; hạt tan tự do đến ~400 ms | `OnParticleSystemStopped` trả pool |

**Hitstop bằng `Time.timeScale` hay clock riêng?**

| | `Time.timeScale = 0` | Local time scale trên thực thể |
|---|---|---|
| Code | 5 dòng, xem [[game-feel]] | Mỗi thực thể có `Delta` riêng, mọi movement/animator nhân theo |
| Hạt, UI, audio | **Cũng đứng** — hạt hit spark đóng băng (chấp nhận được), số sát thương bay ngừng (khó chịu), audio không dừng | Chạy bình thường |
| Nhiều mục tiêu, multiplayer | Không dùng được — dừng cả thế giới | Đúng cách duy nhất |
| Physics | `FixedUpdate` ngừng theo | Phải tự nhân velocity |

Game một người chơi, nhịp chặt (platformer, beat 'em up): `timeScale` đủ, chỉ cần bật `Use Unscaled Time` trên hạt số sát thương và Animator UI. Game nhiều thực thể hoặc online: clock riêng —

```csharp
public class LocalClock : MonoBehaviour {
    public float Scale { get; private set; } = 1f;
    float resumeAt;
    public float Delta => Time.deltaTime * Scale;          // mọi chuyển động của thực thể đọc cái này
    public void Hitstop(float seconds) { Scale = 0f; resumeAt = Time.unscaledTime + seconds; }
    void Update() { if (Scale == 0f && Time.unscaledTime >= resumeAt) Scale = 1f; }
}
```

Animator của thực thể nhận `animator.speed = clock.Scale`. Rigidbody thì lưu velocity, đặt 0, trả lại — đừng đổi `timeScale` vì thế giới khác vẫn chạy.

Flash trắng qua `MaterialPropertyBlock` (không `renderer.material` — tạo instance rò) ở [[unity-shader]]; rung camera qua `CinemachineImpulseSource.GenerateImpulse(direction * strength)` với **hướng đòn**, không rung vô hướng — [[unity-camera]]. Hạ boss: cùng pipeline, số gấp đôi và thêm Volume pulse bên dưới.

## Trail, Line, Decal

**`TrailRenderer`** cho vệt kiếm/đạn: `time` 0.1–0.2 s, `minVertexDistance` 0.1 để không sinh vertex mỗi frame. Bẫy: **teleport** (respawn, dash xa, pool tái dùng) kéo một vệt dài xuyên màn hình từ vị trí cũ tới mới. Gọi `trail.Clear()` ngay sau khi đặt vị trí, hoặc `emitting = false` một frame. Trail cũng không hiểu pool: bật lại object ở chỗ khác là vệt nối.

**`LineRenderer`** cho laser: `positionCount = 2`, `useWorldSpace = true`, texture scroll bằng `material.mainTextureOffset` qua MaterialPropertyBlock. Độ rộng theo `widthCurve`, đầu laser là một ParticleSystem riêng.

**URP Decal Projector** (vết đạn, máu trên sàn): cần thêm `Decal Renderer Feature` vào URP Renderer. Chi phí mỗi decal ≈ một draw call và một lần đọc depth trong box chiếu; 30–50 decal đồng thời ổn trên mobile với kỹ thuật `Screen Space`, `DBuffer` tốn hơn nhưng đúng ánh sáng. Giới hạn số decal bằng ring buffer, xoá cái cũ nhất.

## Screen-space qua Volume weight

Chromatic aberration, vignette đập khi trúng đòn: **không** chỉnh trực tiếp `profile` của Volume toàn cục — trong Editor đó là ScriptableObject, chỉnh là sửa asset vĩnh viễn (cùng bẫy ở [[data-driven-design]]). Tạo một `Volume` riêng, `Is Global`, `Weight = 0`, profile chỉ chứa Vignette intensity 0.45 + Chromatic 0.6, rồi tween **weight**:

```csharp
[SerializeField] Volume hitVolume;                        // weight 0 khi nghỉ
Coroutine pulse;

public void Pulse(float peak = 1f, float duration = 0.18f) {
    if (pulse != null) StopCoroutine(pulse);
    pulse = StartCoroutine(Run(peak, duration));
}
IEnumerator Run(float peak, float dur) {
    for (float t = 0; t < dur; t += Time.unscaledDeltaTime) {   // unscaled: đang hitstop
        hitVolume.weight = peak * (1f - t / dur);
        yield return null;
    }
    hitVolume.weight = 0f; pulse = null;
}
```

Máu thấp thì một Volume khác weight theo `1 - hp/max`. Volume weight blend rẻ; số Volume có `override` chồng nhau mới tốn.

## Kỹ thuật nhỏ quyết định "punch"

- **Burst thay rate.** Nổ = `Emission > Bursts` 1 lần 24 hạt tại t=0, rate 0. Rate over time 200 trong 0.1 s cho hình rải, mềm — không có cú đấm.
- **Sub Emitter** `On Birth`/`On Death` cho tia lửa sinh khói nhỏ khi tắt — một prefab, một lần gọi, thay vì ba hệ tự phối thời gian.
- **Texture Sheet Animation** module cho flipbook nổ 4×4 (CPU đổi UV) đủ cho Shuriken; flipbook trong shader (Shader Graph `Flipbook` node) khi cần blend giữa hai frame — mượt hơn ở tốc độ thấp, chi phí shader cao hơn.
- **Lights module: mỗi hạt là một Point Light thật.** URP giới hạn 8 đèn phụ mỗi object (Forward) — 10 tia lửa có light là đèn bị cắt ngẫu nhiên và frame rụng. Chỉ cho 1–2 hạt/hệ, `Ratio` 0.1, và tắt trên mobile. Ánh sáng "giả" bằng hạt additive to mờ rẻ hơn 50 lần.
- **Timeline** cho sequence lớn (ultimate, cắt cảnh boss chết): Control Track điều khiển nhiều ParticleSystem theo thời gian, designer scrub được. Không code chuỗi `WaitForSeconds` cho hiệu ứng dài hơn 0.5 s.

## Bẫy lộ ra khi build

- Prefab hạt dùng material `Particles/Standard Unlit` của Built-in — Editor hiện đúng nhờ fallback, build URP ra **hồng**. Mọi hạt dùng `Universal Render Pipeline/Particles/Unlit`.
- Shader variant của particle (soft particles, flipbook blending, distortion) làm build lâu thêm phút và **lần đầu phát hiệu ứng khựng** vì compile shader lúc chạy. Warm-up bằng `ShaderVariantCollection` ở màn load — [[unity-shader]].
- VFX Graph trên máy không có compute: không lỗi, hiệu ứng chỉ **không hiện**. Kiểm tra `SystemInfo.supportsComputeShaders` lúc boot và đổi prefab.
- `Max Particles` mặc định 1000 mỗi hệ — pool 16 hệ nổ là 16000 hạt tiềm năng, mỗi hạt ~100 B trạng thái. Hạ về đúng burst + margin (32–64).
- Sprite 2D game có `Order in Layer` trên hạt nhưng camera Perspective: hạt ở Z khác sprite bị sort theo khoảng cách, không theo order. Camera Orthographic hoặc `Transparency Sort Mode = Custom Axis (0,1,0)` trong Graphics settings.

## Kiểm tra nhanh

- Rendering Debugger > Overdraw khi nổ to nhất: không vùng nào đỏ đậm quá 10% màn hình.
- Frame Debugger: số draw call tăng khi phát hiệu ứng lớn nhất ≤ 6 (mỗi hệ con là 1; cùng material vẫn không batch giữa hệ).
- Profiler > `ParticleSystem.Update` ở cảnh đông nhất < 1 ms; GC Alloc khi phát 100 hit liên tiếp = 0 B.
- Phát cùng một hiệu ứng ở hai chỗ cách 50 m liên tiếp: chỗ thứ hai không có tàn dư hay vệt trail nối.
- Đặt `timeScale = 0.1` (slow-mo debug): hạt hit vẫn phát đúng vị trí và số sát thương vẫn bay — tức unscaled đã đặt đúng chỗ.

## 🤖 Prompt cho AI

AI viết hit effect bằng `Instantiate` + `Destroy(go, 2f)`, để `Play On Awake`, chỉnh `volume.profile` trực tiếp, và không biết `OnParticleSystemStopped` cần `Stop Action = Callback`.

**Phải nêu rõ:**
- Shuriken hay VFX Graph, và máy yếu nhất có compute shader không
- Ngân sách: hạt sống tối đa, số hệ đang phát, kích cỡ texture, số lớp alpha
- Hitstop bằng `timeScale` hay clock riêng — và thứ nào phải chạy trong lúc đó
- Bảng thời gian 0–150 ms với số từ FeelConfig
- 2D hay 3D, sorting layer của hạt so với nhân vật
- Cơ chế pool: prewarm bao nhiêu, xử lý khi hết

**Mẫu prompt**

```
Viết pipeline hit effect cho Unity 6000.0 LTS, URP, 2D sprite, Cinemachine 3, mobile Android.
Chỉ dùng Particle System (Shuriken). KHÔNG VFX Graph (Mali-G52 không đảm bảo compute).

Pool: VfxPool prewarm 8 mỗi loại, Stop Action = Callback, Play On Awake TẮT trong prefab,
Return gọi Stop(true, StopEmittingAndClear). Hết pool thì Create thêm + Debug.LogWarning.
CẤM Instantiate/Destroy lúc chạy ngoài Create() của pool.

Ngân sách: hiệu ứng lớn nhất ≤ 48 hạt (burst, rate 0), texture ≤ 128 px, ≤ 2 lớp alpha chồng,
Soft Particles tắt, Lights module KHÔNG dùng, Max Particles mỗi hệ = 64.

OnHit(HitInfo): cùng frame gọi SfxPool.Play, flash _FlashAmount=1 qua MaterialPropertyBlock,
LocalClock.Hitstop(0.07) cho attacker + target (KHÔNG đụng Time.timeScale),
CinemachineImpulseSource.GenerateImpulse(hitDir * 0.6), VfxPool.Play tại điểm chạm.
70 ms sau: flash 0, knockback 6 u/s giảm về 0 trong 80 ms. Mọi số đọc từ FeelConfig.
Hạt số sát thương: Use Unscaled Time bật. Sorting Layer "FX", Order 10; bụi chân Order -1.

Volume pulse: Volume riêng weight 0, profile Vignette 0.45 + Chromatic 0.6; tween weight
1→0 trong 0.18 s bằng unscaledDeltaTime. CẤM sửa profile của Volume global.

Sau khi viết, liệt kê mọi child ParticleSystem có Looping bật và mọi TrailRenderer thiếu Clear() khi tái dùng.
```

**Bẫy thường gặp:** AI viết pool đúng, `Stop Action = Callback` đúng, nhưng prefab có một child "glow" để `Looping = true` — hệ **không bao giờ** gọi `OnParticleSystemStopped`, pool cạn sau 8 cú đánh rồi `Create()` mãi, và trên Profiler nó trông như rò bộ nhớ ở chỗ hoàn toàn khác. Bắt AI liệt kê `main.loop` của **mọi** hệ con trong prefab, hoặc thêm assert trong `Create()`.
