---
title: Job System, Burst và DOTS
icon: ⚙️
summary: Ba tầng tách biệt — Job System, Burst, ECS — và lý do hầu hết dự án chỉ nên leo hai tầng đầu. Tư duy data-oriented, luật an toàn của job, và khi nào ECS đáng giá thật.
status: deep
read: 745
level: advanced
order: 145
tags: [unity, dots, jobs, burst, performance, ecs]
related: [unity-optimization, unity-csharp-memory, performance, unity-physics]
---

"DOTS" trong tin tuyển dụng thường gộp ba thứ rất khác nhau, và người phỏng vấn giỏi sẽ tách chúng ra để xem bạn có hiểu không:

| Tầng | Là gì | Chi phí đưa vào dự án | Ai nên dùng |
|---|---|---|---|
| **Job System** | Chạy code trên worker thread, có kiểm tra race ở Editor | Thấp — dùng ngay trong dự án MonoBehaviour | Gần như mọi dự án có vòng lặp nặng |
| **Burst** | Compiler dịch một tập con C# sang mã máy SIMD | Thấp — thêm `[BurstCompile]` | Đi kèm Job System, gần như luôn |
| **ECS (Entities)** | Kiến trúc khác hẳn: entity + component dữ liệu + system | **Rất cao** — viết lại cách nghĩ, tooling và ecosystem khác | Dự án có hàng nghìn–triệu thực thể cùng loại |

Luật thực dụng: **hai tầng đầu trả lãi ngay và không đòi hỏi đổi kiến trúc**; tầng ba là quyết định của cả dự án, không phải của một người. Câu trả lời "tôi dùng Job + Burst cho các vòng lặp nặng, còn ECS thì chưa đáng với quy mô dự án hiện tại" là câu trả lời trưởng thành, không phải câu trả lời né tránh.

## Vì sao data-oriented lại nhanh

CPU đọc bộ nhớ theo **cache line 64 byte**. Một `List<Enemy>` với `Enemy` là class nghĩa là 1000 tham chiếu trỏ tới 1000 chỗ rải rác trên heap: mỗi lần duyệt là một lần cache miss, và một cache miss tốn cỡ 100–300 chu kỳ — nhiều hơn cả phép tính bạn định làm.

Data-oriented đảo lại: **gom dữ liệu cùng loại nằm liền nhau**, và chỉ mang theo trường thật sự cần. Duyệt một `NativeArray<float3>` gồm 1000 vị trí là đọc tuần tự, phần cứng đoán trước được, và Burst có thể xử lý 4–8 phần tử mỗi lệnh bằng SIMD. Đó mới là nguồn của "nhanh gấp 10 lần", không phải chuyện chạy nhiều thread.

Hệ quả cần nhớ khi trả lời phỏng vấn: **nhanh không đến từ đa luồng, mà từ bố cục bộ nhớ**. Đa luồng chỉ nhân thêm lên.

## Job System: bốn luật an toàn

Job chạy trên worker thread, nên Unity chặn cứng mọi thứ không an toàn:

1. **Không đụng managed object** trong job — không `class`, không `string`, không `List<T>`, không `GameObject`. Chỉ struct và `NativeArray`/`NativeList`/`NativeHashMap`.
2. **Không gọi API Unity** trong job (trừ số học và `TransformAccess` qua `IJobParallelForTransform`).
3. **Mỗi native container chỉ được một job ghi tại một thời điểm.** Đánh dấu `[ReadOnly]` cho cái chỉ đọc — đây vừa là an toàn vừa là hiệu năng, vì nhiều job đọc song song được.
4. **Phải `Complete()` trước khi đọc kết quả trên main thread**, và mọi container phải `Dispose`.

Ba loại job hay dùng: `IJob` (một việc trên một thread), `IJobParallelFor` (chia N phần tử cho nhiều thread, `Execute(int index)`), `IJobParallelForTransform` (ghi thẳng vào Transform — cách duy nhất chạm Transform từ job).

**Cái bẫy số một** là `Schedule()` rồi `Complete()` ngay dòng sau: main thread đứng đợi, bạn mất toàn bộ lợi ích song song và chỉ còn lại chi phí lập lịch. Cách đúng: `Schedule()` trong `Update`, `Complete()` ở `LateUpdate` — job chạy song song với phần còn lại của frame. Cái bẫy số hai là job quá nhỏ: chia 50 phần tử cho 8 thread thì chi phí lập lịch lớn hơn công việc; ngưỡng thực tế thường là **vài nghìn phần tử** mới đáng.

## Burst: nhanh, nhưng chỉ trên một tập con C#

`[BurstCompile]` dịch job sang mã máy tối ưu với SIMD. Đổi lại, trong job chỉ được dùng:

- Struct, kiểu số nguyên thuỷ, `Unity.Mathematics` (`float3`, `math.length`, `quaternion`) — **không** `Vector3`/`Mathf` nếu muốn kết quả tốt nhất, vì `Unity.Mathematics` được thiết kế để vector hoá.
- Không exception (Burst bỏ qua `try/catch` ở bản build), không managed, không `foreach` trên interface.

Hai thứ hay bị hiểu nhầm:

- **Burst không tự làm code song song.** Nó tối ưu *một* luồng thực thi. Song song là việc của Job System — hai thứ độc lập, chỉ hay đi cùng nhau.
- **Editor mặc định chạy Burst đã bật**, nhưng lần đầu vào Play có độ trễ compile; và `Jobs > Burst > Enable Compilation` tắt đi để debug thì code chạy chậm hơn hàng chục lần — nhiều người đo nhầm ở trạng thái này.

Mức tăng tốc thực tế trải rộng: vòng lặp toán học thuần trên dữ liệu liền nhau thường nhanh **cỡ 5–20 lần** so với code C# thường; vòng lặp phụ thuộc nhiều vào truy cập bộ nhớ rải rác thì gần như không đổi. Luôn đo, đừng trích con số của người khác — demo cuối node cho bạn cái để đo.

## Khi nào ECS đáng, khi nào không

**Đáng** khi bài toán là *hàng nghìn tới hàng triệu thực thể cùng loại, cập nhật cùng một cách*: RTS quy mô lớn, bullet hell, mô phỏng đám đông, game sinh tồn thế giới mở. Cũng đáng khi cần determinism cho netcode kiểu ghost prediction (Netcode for Entities).

**Không đáng** khi: dự án dưới vài trăm thực thể; đội chưa ai từng viết ECS; game phụ thuộc nặng vào Animator, UI, physics character, Timeline — những mảng mà GameObject vẫn là con đường chính. Và **hybrid** (GameObject cho gameplay, ECS cho một mảng cụ thể) nghe hợp lý trên giấy nhưng phải trả giá bằng hai mô hình dữ liệu song song cùng một lúc.

Câu hỏi tự kiểm trước khi chọn ECS: *bài toán của tôi có đủ số lượng không, và tôi có sẵn sàng mất 2–4 tuần cho cả đội làm quen không?* Nếu câu trả lời là "không chắc", thì Job + Burst cho đúng vòng lặp nóng sẽ lấy được 80% lợi ích với 5% chi phí.

## Bẫy lộ ra khi build

- Quên `Dispose` native container: Editor chỉ hiện leak warning lúc thoát Play, bản build rò rỉ thật và im lặng.
- `Allocator.TempJob` dùng cho job kéo dài quá 4 frame → cảnh báo rồi rò rỉ. `Persistent` cho thứ sống lâu, và nó chậm hơn khi cấp phát.
- Safety check chỉ bật trong Editor: race condition có thể chỉ lộ trên build, dưới dạng số liệu sai chứ không phải crash.
- Burst compile lần đầu trên thiết bị làm cú khựng ở màn đầu tiên — bật *Burst AOT Settings* đúng target khi build.

## Kiểm tra nhanh

- [ ] `Schedule()` và `Complete()` **không** nằm cạnh nhau
- [ ] Mọi container chỉ đọc đều có `[ReadOnly]`
- [ ] Mọi `NativeArray` có `Allocator` đúng vòng đời và có `Dispose`
- [ ] Đo với Burst **bật** (kiểm tra `Jobs > Burst > Enable Compilation`)
- [ ] Số phần tử đủ lớn để bù chi phí lập lịch (thường vài nghìn trở lên)

## 🤖 Prompt cho AI

**Dùng AI thế nào cho code job/Burst**

Đây là mảng AI viết được phần **khung** rất nhanh (struct job, `IJobParallelFor`, khai báo container, `Schedule`/`Complete`) nhưng sai đúng những chỗ đắt: vòng đời `Allocator`, `[ReadOnly]`, và chỗ đặt `Complete()`. Giao cho nó phần cơ học, giữ lại cho mình ba quyết định: **dữ liệu nào chuyển sang struct**, **job chạy giữa hai điểm nào trong frame**, và **container sống bao lâu**.

Cách làm hiệu quả nhất là hai bước: bước một yêu cầu AI viết phiên bản **tuần tự, không job**, đã chuyển dữ liệu sang mảng struct phẳng và đo được; bước hai mới nhờ nó bọc thành job. Làm một bước thì bạn không biết phần tăng tốc đến từ bố cục dữ liệu hay từ đa luồng — và thường phần lớn đến từ bố cục.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Số phần tử thật (200 hay 200 nghìn — quyết định job có đáng không).
- Job chạy ở đâu trong frame và kết quả cần sẵn sàng lúc nào (`LateUpdate`? frame sau?).
- Container nào chỉ đọc, container nào ghi — AI không tự biết và sẽ bỏ `[ReadOnly]`.
- Có được dùng `Unity.Mathematics` và `Collections` package không.
- Có cần kết quả **xác định** (deterministic) không — ảnh hưởng tới `FloatMode` của Burst.

**Mẫu prompt**

```
Unity 6, dự án MonoBehaviour thường (KHÔNG dùng ECS). Có 8000 boid, mỗi frame
tính vận tốc theo 3 quy tắc (separation/alignment/cohesion) rồi ghi vào Transform.

Bước 1: viết phiên bản tuần tự dùng NativeArray<float3> + Unity.Mathematics,
KHÔNG job, KHÔNG Burst. Kèm cách đo thời gian bằng ProfilerMarker.
Bước 2 (chờ tôi xác nhận số đo): bọc thành IJobParallelFor + [BurstCompile],
Schedule ở Update và Complete ở LateUpdate.

Ràng buộc: chỉ đọc mảng vị trí (đánh [ReadOnly]); ghi vào mảng vận tốc riêng.
Nói rõ Allocator của từng container và nơi Dispose.
```

**Bẫy thường gặp:** AI viết `handle.Complete()` ngay dòng sau `Schedule()` vì như vậy "code đúng và dễ đọc" — nó đúng thật, nhưng main thread đứng đợi nên bạn mất toàn bộ lợi ích song song và chỉ còn chi phí lập lịch; kết quả là bản "tối ưu" chạy **chậm hơn** bản cũ, và không có cảnh báo nào. Bắt AI nói rõ `Schedule` ở đâu, `Complete` ở đâu, và giữa hai điểm đó main thread làm gì.

## 💻 Code

Demo chạy cùng một bài toán — 8000 hạt chuyển động theo trường nhiễu — theo hai đường: vòng lặp `Transform` thường trên main thread, và `IJobParallelForTransform` + `[BurstCompile]`. Overlay hiện mili giây của từng đường, bấm Space để đổi. Đây là cái để **tự đo** thay vì tin con số của người khác.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Hierarchy có JobLab với script Job Lab và Canvas chứa Label, Inspector hiện Count, Mode, Prefab và bảng kết quả tham khảo">
  <rect x="10" y="10" width="200" height="280" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <rect x="16" y="52" width="188" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="22" y="67" class="fig-label" font-size="12" font-weight="600">JobLab  (JobLab.cs)</text>
  <text x="22" y="88" class="fig-muted" font-size="12">▾ Canvas  (Screen Space Overlay)</text>
  <text x="38" y="106" class="fig-muted" font-size="11">Label  (TextMeshProUGUI)</text>
  <text x="22" y="126" class="fig-muted" font-size="12">(8000 hạt sinh lúc chạy)</text>
  <line x1="10" y1="142" x2="210" y2="142" class="fig-line"/>
  <text x="22" y="162" class="fig-label" font-size="12" font-weight="600">Package cần có</text>
  <text x="22" y="182" class="fig-muted" font-size="11">com.unity.burst</text>
  <text x="22" y="198" class="fig-muted" font-size="11">com.unity.collections</text>
  <text x="22" y="214" class="fig-muted" font-size="11">com.unity.mathematics</text>
  <line x1="10" y1="230" x2="210" y2="230" class="fig-line"/>
  <text x="22" y="250" class="fig-muted" font-size="10">Đo với Burst BẬT. Kiểm tra ở</text>
  <text x="22" y="264" class="fig-muted" font-size="10">Jobs ▸ Burst ▸ Enable Compilation</text>
  <text x="22" y="278" class="fig-muted" font-size="10">— tắt thì số đo vô nghĩa.</text>
  <rect x="226" y="10" width="424" height="280" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Job Lab (Script)  (JobLab)</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Label</text><text x="440" y="82" class="fig-label" font-size="11">Label (TextMeshProUGUI)</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Prefab</text><text x="440" y="98" class="fig-label" font-size="11">Quad hoặc Sprite nhỏ</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Count</text><text x="440" y="114" class="fig-label" font-size="11">8000</text>
  <text x="250" y="130" class="fig-muted" font-size="11">Mode</text><text x="440" y="130" class="fig-label" font-size="11">MainThread ▾ / Jobified</text>
  <rect x="234" y="144" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="157" class="fig-label" font-size="12" font-weight="600">Kết quả tham khảo (máy mỗi người mỗi khác)</text>
  <text x="250" y="176" class="fig-muted" font-size="11">MainThread</text><text x="440" y="176" class="fig-label" font-size="11">ms lớn, nằm trên main thread</text>
  <text x="250" y="192" class="fig-muted" font-size="11">Jobified + Burst</text><text x="440" y="192" class="fig-label" font-size="11">ms nhỏ hơn nhiều lần</text>
  <text x="250" y="208" class="fig-muted" font-size="11">Cách đọc</text><text x="440" y="208" class="fig-label" font-size="11">so TỈ LỆ, đừng so số tuyệt đối</text>
  <rect x="234" y="222" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="235" class="fig-label" font-size="12" font-weight="600">Điểm cần nhìn trong Profiler</text>
  <text x="250" y="254" class="fig-muted" font-size="11">Timeline ▸ Worker thread</text><text x="440" y="254" class="fig-label" font-size="11">job chạy song song với main</text>
  <text x="250" y="270" class="fig-muted" font-size="11">Nếu main thread đứng đợi</text><text x="440" y="270" class="fig-label" font-size="11">Complete() bị gọi quá sớm</text>
</svg>
<figcaption>Schedule trong Update, Complete trong LateUpdate — khoảng giữa là lúc job chạy song song. Đặt hai lời gọi cạnh nhau là mất sạch lợi ích.</figcaption>
</figure>

**Script**

```csharp
// JobLab.cs — Unity 6 (6000.x). Packages: com.unity.burst, com.unity.collections, com.unity.mathematics.
// Gắn lên GameObject "JobLab", kéo một prefab nhỏ (Quad/Sprite) vào Prefab và một TextMeshProUGUI vào Label.
// Space đổi giữa hai đường. Con số là THỜI GIAN MAIN THREAD phải bỏ ra, không phải tổng công việc.
using TMPro;
using Unity.Burst;
using Unity.Collections;
using Unity.Collections.LowLevel.Unsafe;
using Unity.Jobs;
using Unity.Mathematics;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.Jobs;

public class JobLab : MonoBehaviour
{
    public enum Mode { MainThread, Jobified }

    [SerializeField] TextMeshProUGUI label;
    [SerializeField] Transform prefab;
    [SerializeField] int count = 8000;
    [SerializeField] Mode mode = Mode.Jobified;

    Transform[] transforms;
    TransformAccessArray access;
    NativeArray<float3> velocity;
    JobHandle handle;

    readonly System.Diagnostics.Stopwatch sw = new();
    double msThisFrame;

    // Lực chung cho cả hai đường: cùng phép toán, chỉ khác nơi chạy.
    static float3 Force(float3 p, float t) => new float3(
        math.sin(p.y * 0.3f + t),
        math.cos(p.z * 0.3f + t),
        math.sin(p.x * 0.3f - t));

    void Start()
    {
        transforms = new Transform[count];
        for (int i = 0; i < count; i++)
            transforms[i] = Instantiate(prefab, Random.insideUnitSphere * 20f, Quaternion.identity, transform);

        access = new TransformAccessArray(transforms);
        velocity = new NativeArray<float3>(count, Allocator.Persistent);   // sống cả phiên -> Persistent
        for (int i = 0; i < count; i++) velocity[i] = Random.insideUnitSphere;
    }

    void OnDestroy()
    {
        handle.Complete();                                   // không Dispose khi job còn chạy
        if (access.isCreated) access.Dispose();
        if (velocity.IsCreated) velocity.Dispose();
    }

    void Update()
    {
        var kb = Keyboard.current;
        if (kb != null && kb.spaceKey.wasPressedThisFrame)
            mode = mode == Mode.Jobified ? Mode.MainThread : Mode.Jobified;

        float dt = Time.deltaTime, t = Time.time;
        sw.Restart();

        if (mode == Mode.MainThread)
        {
            // Truy cập Transform từng cái một: mỗi lần đọc/ghi position là một lần gọi native.
            for (int i = 0; i < transforms.Length; i++)
            {
                float3 p = transforms[i].position;
                float3 v = (velocity[i] + Force(p, t) * dt) * 0.99f;
                velocity[i] = v;
                transforms[i].position = p + v * dt;
            }
        }
        else
        {
            handle = new MoveJob { dt = dt, time = t, velocity = velocity }.Schedule(access);
            // KHÔNG Complete() ở đây — để job chạy song song với phần còn lại của frame.
        }

        sw.Stop();
        msThisFrame = sw.Elapsed.TotalMilliseconds;
    }

    void LateUpdate()
    {
        if (mode != Mode.Jobified) { Show(); return; }

        sw.Restart();
        handle.Complete();          // phần main thread thật sự phải đợi
        sw.Stop();
        msThisFrame += sw.Elapsed.TotalMilliseconds;
        Show();
    }

    void Show()
    {
        if (label != null)
            label.SetText("{0} | {1} hat | main thread: {2:0.00} ms/frame",
                          mode == Mode.Jobified ? 1 : 0, count, msThisFrame);
    }

    [BurstCompile]
    struct MoveJob : IJobParallelForTransform
    {
        public float dt;
        public float time;

        // Mỗi index chỉ do đúng một phần tử chạm, nên ghi song song là an toàn.
        // Bỏ attribute này ra thì safety system của Editor sẽ chặn, vì nó không suy được điều đó.
        [NativeDisableParallelForRestriction] public NativeArray<float3> velocity;

        public void Execute(int i, TransformAccess t)
        {
            float3 p = t.position;
            float3 v = (velocity[i] + Force(p, time) * dt) * 0.99f;
            velocity[i] = v;
            t.position = p + v * dt;
        }
    }
}
```

**Chạy thử**
- Play ở `Mode = MainThread`, đọc `main thread: … ms/frame`. Nhấn Space sang `Jobified` và đọc lại: con số phải **nhỏ hơn hẳn** vì main thread chỉ còn lập lịch và đợi phần đuôi.
- Mở Profiler → Timeline: ở chế độ Jobified thấy job nằm trên các **Worker Thread** chạy song song với main thread. Nếu main thread có một khối đợi dài ngay sau `Schedule`, nghĩa là `Complete()` đang bị gọi quá sớm.
- Thử `Jobs > Burst > Enable Compilation` → tắt, chạy lại: con số ở chế độ Jobified xấu đi nhiều lần. Đó là phần **Burst** đóng góp, tách khỏi phần đa luồng.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | Job System dùng để làm gì? Trong job được đụng những kiểu dữ liệu nào? |
| Mid | Burst làm code nhanh lên bằng cách nào? Nó có tự đa luồng không? |
| Mid | Vì sao gom dữ liệu vào mảng struct lại nhanh hơn duyệt danh sách class? |
| Senior | Anh đã dùng ECS chưa? Nếu chưa thì vì sao? |
| Senior | Code "đã jobify" mà chạy chậm hơn bản cũ. Nguyên nhân? |

**Khung trả lời 60 giây** — "Anh có kinh nghiệm DOTS không?"

> Tôi tách ba tầng, vì chúng có chi phí rất khác nhau. **Job System** và **Burst** dùng được ngay trong dự án MonoBehaviour bình thường, chi phí thấp, và tôi dùng cho các vòng lặp nặng — mô phỏng, tìm đường hàng loạt, cập nhật hàng nghìn thực thể. **ECS** là đổi cả kiến trúc và cách nghĩ của đội, nên nó là quyết định của dự án chứ không phải của một người.
>
> Điểm tôi thấy nhiều người hiểu nhầm: phần tăng tốc lớn nhất **không đến từ đa luồng mà từ bố cục bộ nhớ**. CPU đọc theo cache line 64 byte; duyệt `List<EnemyClass>` là nhảy 1000 chỗ rải rác trên heap, mỗi cache miss cỡ 100–300 chu kỳ. Đổi sang `NativeArray<float3>` liền nhau là đọc tuần tự và Burst xử lý được nhiều phần tử một lệnh bằng SIMD. Đa luồng chỉ nhân thêm lên phần đó.
>
> Nên trong dự án hiện tại, tôi lấy 80% lợi ích bằng 5% chi phí: chuyển đúng vòng lặp nóng sang mảng struct + job + Burst, và giữ nguyên phần còn lại là GameObject.

**Họ sẽ đào tiếp**

- *"Trong job được dùng gì?"* → Chỉ struct và native container. Không class, không `string`, không `List<T>`, không API Unity — trừ `TransformAccess` qua `IJobParallelForTransform`. Container chỉ đọc phải đánh `[ReadOnly]`, vừa để an toàn vừa để nhiều job đọc song song được.
- *"Jobify rồi mà chậm hơn?"* → Hai lý do quen thuộc. Một: `Complete()` gọi ngay sau `Schedule()` — main thread đứng đợi, mất hết song song, chỉ còn chi phí lập lịch. Hai: khối lượng quá nhỏ — vài trăm phần tử thì chi phí chia việc lớn hơn công việc; ngưỡng thực tế thường là vài nghìn.
- *"Burst có tự song song không?"* → **Không.** Burst tối ưu một luồng thực thi (SIMD, bỏ bound check, inline). Song song là việc của Job System. Hai thứ độc lập, hay đi cùng nhau nên bị gộp làm một.
- *"Đo thế nào cho đúng?"* → Kiểm tra Burst đang **bật** trước khi đo (tắt để debug rồi quên bật lại là chuyện thường), so **tỉ lệ** chứ đừng so số tuyệt đối giữa hai máy, và nhìn Profiler Timeline để xác nhận job thật sự nằm trên worker thread.
- *"Khi nào ECS mới đáng?"* → Hàng nghìn tới hàng triệu thực thể cùng loại cập nhật cùng cách: RTS lớn, bullet hell, mô phỏng đám đông; hoặc cần determinism cho netcode ghost prediction. Không đáng khi game dựa nặng vào Animator, UI, physics nhân vật — những mảng GameObject vẫn là đường chính.

**Cờ đỏ**

- Nói "DOTS nhanh hơn" mà không tách được Job / Burst / ECS.
- Quên `Dispose` native container, hoặc không biết `Allocator` khác nhau ở chỗ nào.
- Cho rằng Burst = đa luồng.
- Đề xuất viết lại cả dự án sang ECS để "tối ưu", khi chưa có số đo nào.
- Đo hiệu năng trong Editor với Burst đang tắt.

**Số / ví dụ nên thuộc**

- Cache line **64 byte**; một cache miss cỡ **100–300 chu kỳ**.
- Vòng lặp toán học trên dữ liệu liền nhau: thường nhanh **5–20 lần** với Burst — nhưng phải tự đo.
- `Allocator.Temp` (một frame) · `TempJob` (≤ 4 frame) · `Persistent` (lâu dài).
- `Schedule()` ở `Update`, `Complete()` ở `LateUpdate`.
