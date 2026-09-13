---
title: Tối ưu GPU — băng thông, overdraw, draw call
icon: 🖼️
summary: GPU mobile là tile-based nên băng thông mới là vua; cách phân biệt ba nút thắt bằng thực nghiệm, và vì sao SRP Batcher không hề giảm số draw call.
status: deep
read: 743
level: advanced
order: 143
tags: [unity, performance, gpu, rendering, mobile]
related: [unity-optimization, unity-profiling, unity-shader, unity-lighting, unity-vfx]
---

Nút thắt GPU khó hơn CPU ở một điểm: **Unity Profiler gần như không đo được nó trên mobile**. Bạn thấy `Gfx.WaitForPresentOnGfxThread` lớn, biết là đang đợi GPU, rồi hết. Node này là cách đi tiếp từ đó — bằng hiểu biết về cách GPU di động thật sự vẽ, và bằng thực nghiệm có kiểm soát.

## GPU mobile là tile-based, và mọi thứ khác suy ra từ đó

GPU desktop vẽ thẳng vào framebuffer trong VRAM. GPU di động (Adreno, Mali, Apple) chia màn hình thành **tile** nhỏ, xử lý toàn bộ hình học trước để biết tile nào chứa gì (binning), rồi vẽ từng tile trong **bộ nhớ on-chip** cực nhanh, xong mới ghi kết quả ra bộ nhớ ngoài.

Ba hệ quả thực tế, và chúng giải thích gần hết những chuyện "lạ" trên mobile:

- **Băng thông là tài nguyên khan hiếm nhất**, không phải số phép tính. Một lần ghi toàn màn hình 1080p RGBA8 là khoảng **8 MB**; ở 60fps, mỗi pass toàn màn hình ăn ~500 MB/s, trong khi băng thông bộ nhớ của máy tầm trung chỉ vài chục GB/s và **dùng chung với CPU**. Đây là lý do post-processing đắt hơn cảm giác.
- **MSAA rẻ bất ngờ** vì việc resolve xảy ra ngay trong tile, không phải đọc/ghi bộ nhớ ngoài. 4× MSAA trên mobile thường rẻ hơn nhiều so với tăng độ phân giải để chống răng cưa.
- **Mỗi lần đọc lại màn hình là một lần phá vỡ mô hình tile**: `Blit`, RenderTexture trung gian, post-processing, đọc depth/color trong shader — tất cả buộc GPU ghi tile ra bộ nhớ rồi đọc lại. Một hiệu ứng "rẻ" về toán học vẫn có thể đắt về băng thông.

Kèm theo là hai chi tiết nhỏ mà hậu quả lớn: **đừng clear thừa** (Unity đã xử lý phần lớn, nhưng camera stacking cấu hình sai thì clear nhiều lần), và mọi RenderTexture bạn tự tạo nên khai đúng `depthBuffer`/format — một RT 32-bit thừa là một khoản băng thông trả đều mỗi frame.

## Ba nút thắt, và cách phân biệt bằng thực nghiệm

Không có công cụ hãng thì vẫn xác định được nút thắt, bằng cách đổi **một** biến và xem frame time phản ứng ra sao:

| Phép thử | Nếu frame time cải thiện mạnh | Nghĩa là |
|---|---|---|
| Hạ **Render Scale** xuống 0,5 | Có | Nút thắt ở **fragment / fill rate / băng thông** |
| Giữ nguyên độ phân giải, **thay mọi material bằng Unlit đơn giản** | Có | Nút thắt ở **shader fragment** (ALU hoặc texture fetch) |
| Giảm một nửa số object trong cảnh | Có | Nút thắt ở **vertex / số lệnh vẽ** |
| Tắt **shadow** hoàn toàn | Có | Nút thắt ở pass đổ bóng |
| Thu nhỏ cửa sổ game trên PC | Có | Fill rate (dùng khi không có thiết bị trong tay) |

Làm từng phép một, đo bằng quy trình ở [[unity-profiling]], và ghi lại. Mười phút làm việc này tiết kiệm nhiều ngày đoán mò — và nó cũng chính là câu trả lời được đánh giá cao khi phỏng vấn hỏi "không có công cụ GPU thì anh làm sao".

## Draw call, SetPass call, batch — ba con số khác nhau

Người ta hay nói "giảm draw call", nhưng con số đắt nhất thường là **SetPass call**: mỗi lần GPU phải đổi shader hoặc trạng thái render là một lần dựng lại pipeline state. Vẽ 500 object cùng material có thể rẻ hơn vẽ 50 object với 50 material khác nhau.

Và đây là chỗ hay bị hiểu sai nhất, đáng nhớ kỹ vì nó là câu hỏi phân loại trong phỏng vấn:

> **SRP Batcher không gộp draw call.** Nó giữ hằng số per-material trong bộ nhớ GPU giữa các frame, nên phần CPU phải chuẩn bị cho mỗi lệnh vẽ rẻ đi rất nhiều — số draw call **không đổi**, nhưng chi phí CPU dựng lệnh giảm mạnh. Nó là tối ưu phía **CPU**.

Bốn cơ chế, và chúng loại trừ nhau theo thứ tự ưu tiên:

| Cơ chế | Giảm cái gì | Điều kiện | Cái giá |
|---|---|---|---|
| **SRP Batcher** | Chi phí **CPU** mỗi draw call | Cùng shader variant; shader tương thích | Bị phá bởi `renderer.material` và `MaterialPropertyBlock` |
| **Static Batching** | Số draw call | Object `Static`, cùng material | **Bộ nhớ ×2** — mỗi instance giữ bản copy vertex đã transform |
| **GPU Instancing** | Số draw call | Cùng mesh + cùng material | Cần dữ liệu per-instance; `Graphics.RenderMeshInstanced` là đường rẻ nhất |
| **Dynamic Batching** | Số draw call | Mesh < 300 đỉnh, cùng material | Tốn CPU transform mỗi frame; trên URP gần như vô dụng — tắt |

Nghịch lý đáng nhớ: `MaterialPropertyBlock` từng là **cách đúng** ở Built-in để tránh nhân bản material, nhưng ở URP nó **loại object khỏi SRP Batcher**. Muốn dữ liệu per-instance mà vẫn nhanh: nhét vào vertex color, UV thừa, hoặc dùng `RenderMeshInstanced` với mảng dữ liệu riêng.

Unity 6 còn có **GPU Resident Drawer** (URP Asset, cần Forward+): nó tự gom MeshRenderer tĩnh thành lệnh vẽ do GPU điều khiển. Bật rồi **đo**, đừng tin mặc định — với cảnh ít object nó không bù được chi phí thiết lập.

## Overdraw và trong suốt

Fill rate chết không phải vì nhiều object, mà vì **cùng một pixel bị tô nhiều lần**. Bốn nguồn, theo thứ tự hay gặp:

1. **Particle alpha chồng lớp**: 200 hạt full-screen là 200 lần tô toàn màn hình, trong khi Frame Debugger chỉ hiện **1 draw call** — xem [[unity-vfx]].
2. **UI full-screen** mờ chồng lên cảnh 3D: một lớp overdraw toàn màn hình không ai tính.
3. **Vật trong suốt xếp chồng**: kính, nước, khói — transparent không ghi depth nên không có cách nào loại sớm.
4. **Skybox vẽ trước** rồi bị che hết bởi địa hình (Unity vẽ opaque trước, nhưng vẫn nên chú ý ở cảnh trong nhà).

Một chi tiết phản trực giác: **alpha test (`clip`/`discard`) thường chậm hơn alpha blend trên GPU di động**, vì nó phá cơ chế loại bỏ pixel sớm (early-Z / hidden surface removal) — GPU không còn biết chắc pixel nào bị che trước khi chạy fragment shader. Với lá cây dày đặc, đo cả hai phương án thay vì tin thói quen từ PC.

Nhìn bằng **Rendering Debugger → Overdraw**: vùng đỏ đậm là chỗ phải cắt. Chữa theo thứ tự: hạt nhỏ hơn và ít lớp hơn, giới hạn `Max Particle Size` để hạt không phình khi camera lại gần, bỏ panel mờ toàn màn hình, và gộp nhiều lớp trong suốt thành một shader.

## Shader, bóng và độ phân giải

**Shader.** Trên GPU di động, **texture fetch thường đắt hơn phép toán**, và đắt nhất là *dependent texture read* — lấy kết quả một lần sample để tính toạ độ sample tiếp theo. Ba việc rẻ và hiệu quả: dùng `half` thay `float` ở màu và UV cục bộ (giữ `float` cho world position và thời gian tích luỹ), giảm số sampler, và tránh nhánh phụ thuộc từng pixel. Chi phí thật của một shader = **độ phức tạp × số pixel nó tô**, nên một shader nặng trên vật nhỏ vẫn rẻ hơn một shader nhẹ phủ toàn màn hình. Số lượng variant thì ảnh hưởng thời gian build và cú khựng lần đầu — xem [[unity-shader]].

**Bóng.** Mỗi đèn đổ bóng là **một lần render lại cảnh** vào shadow map, nhân với số cascade. Thứ tự cắt, rẻ trước: giảm `Shadow Distance` (hiệu quả nhất và gần như luôn không ai nhận ra), giảm số cascade, hạ độ phân giải shadow map, tắt bóng cho đèn phụ, và trên mobile thì cân nhắc bóng giả — một quad tối dưới chân là đủ cho rất nhiều game. Chi tiết ở [[unity-lighting]].

**Độ phân giải** là nút điều chỉnh mạnh nhất và bị dùng ít nhất: `Render Scale` 0,75 trong URP Asset bỏ **44% số pixel** cho mọi pass 3D, trong khi UI vẫn vẽ ở độ phân giải gốc nên chữ vẫn nét. Unity 6 có **STP** upscale nét hơn bilinear ở cùng scale, tốn thêm khoảng 1 ms. Nối nó vào cài đặt chất lượng và vào Adaptive Performance để tự hạ khi máy nóng.

**Culling** là "không vẽ" — luôn rẻ hơn "vẽ nhanh": frustum culling có sẵn, `Camera.layerCullDistances` cắt vật trang trí nhỏ ở 30 m dù far plane 200 m, Occlusion Culling đáng bake cho cảnh trong nhà nhiều phòng nhưng vô ích ở đồng bằng mở, và LOD Group với mức Cull ở cuối.

## Bẫy lộ ra khi build

- Editor hiện texture chưa nén, thiết bị dùng ASTC: normal map và gradient trông khác hẳn — luôn xem lại trên máy.
- Bật post-processing "cho đẹp" rồi đo trên PC: trên mobile mỗi hiệu ứng toàn màn hình là một khoản băng thông cố định, không phụ thuộc cảnh phức tạp hay không.
- Camera stacking nhiều tầng: mỗi camera là một lần clear và một lần resolve tile.
- `renderer.material` trong `Update` vừa nhân bản material vừa loại object khỏi SRP Batcher — và Frame Debugger sẽ chỉ ra dòng "Objects have different materials".
- Shadow Distance mặc định (thường 50 m) giữ nguyên trên mobile ở game top-down chỉ nhìn thấy 20 m.

## Kiểm tra nhanh

- [ ] Đã chạy **phép thử Render Scale 0,5** để biết nút thắt có phải fill rate không
- [ ] Rendering Debugger → Overdraw: không có vùng đỏ đậm toàn màn hình
- [ ] Frame Debugger: số SetPass call ở cảnh đông nhất nằm trong ngân sách (mobile: vài chục tới ~100)
- [ ] Không có `renderer.material` hay `MaterialPropertyBlock` trên vật thể hàng loạt
- [ ] `Shadow Distance` khớp tầm nhìn thật, không phải giá trị mặc định
- [ ] UI toàn màn hình không phủ lên cảnh 3D khi không cần
- [ ] Đã thử bật/tắt GPU Resident Drawer và **đo**, không chỉ bật vì nó mới

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc tối ưu GPU**

Đây là vùng AI dễ nói sai nhất trong ba vùng tối ưu, vì phần lớn tài liệu trên mạng viết cho GPU desktop còn máy của bạn thì tile-based. Biểu hiện quen thuộc: nó khuyên "gộp draw call" cho một cảnh đang chết vì overdraw, hoặc khuyên tắt MSAA trên mobile — nơi MSAA lại rẻ.

Nó làm tốt ba việc: **viết công cụ đo** (overlay đếm draw call/SetPass, script bật tắt từng cơ chế để chạy phép thử nhị phân), **giải thích một dòng trong Frame Debugger** ("Objects have different materials" nghĩa là gì, sửa thế nào), và **viết lại shader theo ràng buộc bạn đưa** (giảm sampler, đổi sang `half`, bỏ nhánh).

Cách dùng đúng là đưa nó **kết quả phép thử**, không đưa cảm giác: *"hạ Render Scale xuống 0,5 thì frame time từ 28 ms còn 17 ms; tắt shadow thì còn 26 ms"* — từ hai câu đó nó suy luận được, và bạn kiểm chứng được suy luận đó.

**Phải nêu rõ** (thiếu là AI trả lời theo kiến thức desktop):
- **Nền tảng và GPU**: mobile tile-based hay PC; Adreno/Mali/Apple; URP hay HDRP.
- Kết quả các phép thử (Render Scale, tắt shadow, thay shader Unlit) — đây là dữ liệu quan trọng nhất.
- Số draw call, SetPass call, và số triangle ở cảnh đang đo.
- Ngân sách frame và độ phân giải thật đang render.
- Ràng buộc nghệ thuật: cái gì **không được** đụng (bảng màu, phong cách, hiệu ứng đặc trưng).

**Mẫu prompt**

```
Unity 6 URP, Android Mali tầm trung, 1080p, ngân sách 16,6 ms, hiện 28 ms.
Frame Debugger: 320 draw call, 180 SetPass call, 1,2 triệu tri giác.
Phép thử:
- Render Scale 0,5  -> 17 ms
- Tắt shadow        -> 26 ms
- Thay hết bằng Unlit -> 19 ms

Từ ba số này, suy ra nút thắt và xếp hạng phương án theo ms tiết kiệm ước tính.
Với mỗi phương án nói rõ: đổi cái gì, ảnh hưởng hình ảnh ra sao, đo lại bằng gì.
Lưu ý: đây là GPU TILE-BASED — đừng áp dụng kinh nghiệm desktop về MSAA và
post-processing. KHÔNG được đụng bảng màu và phong cách cel-shading.
```

**Bẫy thường gặp:** AI đề xuất **gộp mesh và giảm draw call** như phản xạ đầu tiên, kể cả khi số liệu cho thấy nút thắt là fill rate — và tệ hơn, gộp mesh làm mất culling từng phần nên có khi vẽ **nhiều** pixel hơn trước. Bẫy anh em: nó nói SRP Batcher "giảm draw call". Không: nó giảm **chi phí CPU cho mỗi draw call**, số lệnh vẽ giữ nguyên. Hỏi lại "cơ chế này giảm thứ gì, CPU hay GPU" là cách nhanh nhất để phát hiện câu trả lời học thuộc — dùng được cho cả AI lẫn ứng viên.

## 💻 Code

Demo dựng `BatchLab`: 1000 khối lập phương, bốn chế độ vẽ, và một overlay đọc thẳng **Draw Calls / SetPass Calls / Batches / main thread ms**. Bấm phím để đổi chế độ và nhìn con số nhảy — đây là cách chứng minh bằng số rằng SRP Batcher là tối ưu **CPU**, còn instancing mới là thứ cắt số lệnh vẽ.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Inspector BatchLab với bốn chế độ và bảng kết quả mong đợi cho từng chế độ">
  <rect x="10" y="10" width="206" height="280" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="216" y2="42" class="fig-line"/>
  <rect x="16" y="52" width="184" height="20" rx="4" fill="#7fe3ef" opacity="0.20"/>
  <text x="24" y="67" class="fig-label" font-size="12" font-weight="600">BatchLab</text>
  <text x="24" y="88" class="fig-muted" font-size="11">▾ Canvas (Overlay)</text>
  <text x="38" y="104" class="fig-muted" font-size="11">Label</text>
  <text x="24" y="124" class="fig-muted" font-size="11">1000 cube sinh lúc chạy</text>
  <line x1="10" y1="140" x2="216" y2="140" class="fig-line"/>
  <text x="22" y="160" class="fig-label" font-size="12" font-weight="600">Phím</text>
  <text x="22" y="180" class="fig-muted" font-size="11">1 — Shared Material</text>
  <text x="22" y="196" class="fig-muted" font-size="11">2 — renderer.material</text>
  <text x="22" y="212" class="fig-muted" font-size="11">3 — MaterialPropertyBlock</text>
  <text x="22" y="228" class="fig-muted" font-size="11">4 — RenderMeshInstanced</text>
  <line x1="10" y1="244" x2="216" y2="244" class="fig-line"/>
  <text x="22" y="264" class="fig-muted" font-size="10">Material phải bật</text>
  <text x="22" y="278" class="fig-muted" font-size="10">Enable GPU Instancing.</text>
  <rect x="232" y="10" width="418" height="280" rx="8" class="fig-box"/>
  <text x="244" y="32" class="fig-label" font-size="13" font-weight="600">Kết quả mong đợi (1000 cube, URP)</text>
  <line x1="232" y1="42" x2="650" y2="42" class="fig-line"/>
  <text x="244" y="62" class="fig-muted" font-size="11">Chế độ</text>
  <text x="420" y="62" class="fig-muted" font-size="11">Draw call</text>
  <text x="510" y="62" class="fig-muted" font-size="11">SetPass</text>
  <text x="586" y="62" class="fig-muted" font-size="11">main ms</text>
  <line x1="240" y1="70" x2="642" y2="70" class="fig-line"/>
  <rect x="238" y="76" width="404" height="20" rx="4" fill="#51cf9b" opacity="0.18"/>
  <text x="244" y="91" class="fig-label" font-size="11" font-weight="600">1 · Shared Material (SRP Batcher chạy)</text>
  <text x="428" y="91" class="fig-label" font-size="11">~1000</text>
  <text x="516" y="91" class="fig-label" font-size="11">thấp</text>
  <text x="592" y="91" class="fig-label" font-size="11">thấp</text>
  <rect x="238" y="102" width="404" height="20" rx="4" fill="#ff8787" opacity="0.16"/>
  <text x="244" y="117" class="fig-label" font-size="11" font-weight="600">2 · renderer.material (phá batcher)</text>
  <text x="428" y="117" class="fig-label" font-size="11">~1000</text>
  <text x="516" y="117" class="fig-label" font-size="11">CAO</text>
  <text x="592" y="117" class="fig-label" font-size="11">CAO</text>
  <rect x="238" y="128" width="404" height="20" rx="4" fill="#ffd43b" opacity="0.16"/>
  <text x="244" y="143" class="fig-label" font-size="11" font-weight="600">3 · MaterialPropertyBlock (URP: cũng phá)</text>
  <text x="428" y="143" class="fig-label" font-size="11">~1000</text>
  <text x="516" y="143" class="fig-label" font-size="11">thấp</text>
  <text x="592" y="143" class="fig-label" font-size="11">cao hơn 1</text>
  <rect x="238" y="154" width="404" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="244" y="169" class="fig-label" font-size="11" font-weight="600">4 · RenderMeshInstanced</text>
  <text x="428" y="169" class="fig-label" font-size="11">vài lệnh</text>
  <text x="516" y="169" class="fig-label" font-size="11">rất thấp</text>
  <text x="592" y="169" class="fig-label" font-size="11">thấp nhất</text>
  <line x1="240" y1="184" x2="642" y2="184" class="fig-line"/>
  <text x="244" y="204" class="fig-label" font-size="12" font-weight="600">Điều cần rút ra</text>
  <text x="244" y="224" class="fig-muted" font-size="11">Chế độ 1 và 2 có CÙNG số draw call — khác nhau ở</text>
  <text x="244" y="240" class="fig-muted" font-size="11">thời gian CPU. Đó chính là bản chất của SRP Batcher.</text>
  <text x="244" y="262" class="fig-muted" font-size="11">Chỉ chế độ 4 mới cắt được SỐ lệnh vẽ.</text>
  <text x="244" y="282" class="fig-muted" font-size="10">Con số tuyệt đối tuỳ máy; điều đáng nhìn là tỉ lệ giữa bốn chế độ.</text>
</svg>
<figcaption>Bốn chế độ, một overlay. Số liệu tự nói ra điều mà tài liệu hay bị chép sai.</figcaption>
</figure>

**Script**

```csharp
// BatchLab.cs — Unity 6 (6000.x) + URP. Gắn lên "BatchLab"; kéo Mesh (Cube),
// một Material (URP/Lit, BẬT Enable GPU Instancing) và một TextMeshProUGUI vào Inspector.
using System.Collections.Generic;
using System.Text;
using TMPro;
using Unity.Profiling;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.Rendering;

public class BatchLab : MonoBehaviour
{
    public enum Mode { SharedMaterial, PerRendererMaterial, PropertyBlock, Instanced }

    [SerializeField] TextMeshProUGUI label;
    [SerializeField] Mesh mesh;
    [SerializeField] Material material;
    [SerializeField] int count = 1000;
    [SerializeField] Mode mode = Mode.SharedMaterial;

    readonly List<Renderer> renderers = new();
    readonly List<Material> spawned = new();      // material nhân bản — phải Destroy
    readonly StringBuilder sb = new(128);
    Matrix4x4[] matrices;
    MaterialPropertyBlock mpb;
    RenderParams renderParams;

    ProfilerRecorder drawCalls, setPass, batches, mainThread;

    void Start()
    {
        matrices = new Matrix4x4[count];
        mpb = new MaterialPropertyBlock();

        int side = Mathf.CeilToInt(Mathf.Sqrt(count));
        for (int i = 0; i < count; i++)
        {
            var pos = new Vector3(i % side * 1.5f, 0f, i / side * 1.5f);
            matrices[i] = Matrix4x4.TRS(pos, Quaternion.identity, Vector3.one);

            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.transform.SetParent(transform, false);
            go.transform.position = pos;
            Destroy(go.GetComponent<BoxCollider>());          // không cần physics ở demo này
            var r = go.GetComponent<Renderer>();
            r.sharedMaterial = material;
            renderers.Add(r);
        }

        renderParams = new RenderParams(material)
        {
            worldBounds = new Bounds(Vector3.zero, Vector3.one * 10000f),
            shadowCastingMode = ShadowCastingMode.Off,
            receiveShadows = false,
        };
        ApplyMode();
    }

    void OnEnable()
    {
        drawCalls  = ProfilerRecorder.StartNew(ProfilerCategory.Render, "Draw Calls Count");
        setPass    = ProfilerRecorder.StartNew(ProfilerCategory.Render, "SetPass Calls Count");
        batches    = ProfilerRecorder.StartNew(ProfilerCategory.Render, "Batches Count");
        mainThread = ProfilerRecorder.StartNew(ProfilerCategory.Internal, "Main Thread", 15);
    }

    void OnDisable()
    {
        drawCalls.Dispose(); setPass.Dispose(); batches.Dispose(); mainThread.Dispose();
    }

    void Update()
    {
        var kb = Keyboard.current;
        if (kb != null)
        {
            if (kb.digit1Key.wasPressedThisFrame) SetMode(Mode.SharedMaterial);
            if (kb.digit2Key.wasPressedThisFrame) SetMode(Mode.PerRendererMaterial);
            if (kb.digit3Key.wasPressedThisFrame) SetMode(Mode.PropertyBlock);
            if (kb.digit4Key.wasPressedThisFrame) SetMode(Mode.Instanced);
        }

        if (mode == Mode.Instanced)
        {
            // Mỗi lời gọi tối đa 1023 instance — chia mẻ. Không có GameObject nào tham gia.
            const int Max = 1023;
            for (int start = 0; start < matrices.Length; start += Max)
                Graphics.RenderMeshInstanced(renderParams, mesh, 0, matrices,
                                             Mathf.Min(Max, matrices.Length - start), start);
        }

        if (label == null) return;
        sb.Clear();
        sb.Append(mode.ToString()).Append("  (1-4 để đổi)\n");
        sb.Append("draw ").Append(V(drawCalls)).Append("   setpass ").Append(V(setPass))
          .Append("   batch ").Append(V(batches)).Append('\n');
        sb.Append("main thread ").Append(Ms(mainThread).ToString("0.00")).Append(" ms");
        label.SetText(sb);
    }

    void SetMode(Mode m) { mode = m; ApplyMode(); }

    void ApplyMode()
    {
        // Dọn material đã nhân bản ở chế độ trước: renderer.material tạo BẢN SAO mỗi lần đọc,
        // không Destroy là rò rỉ thật — nhìn thấy trong Memory Profiler ở dòng Material.
        foreach (var m in spawned) Destroy(m);
        spawned.Clear();

        bool useRenderers = mode != Mode.Instanced;
        foreach (var r in renderers)
        {
            r.enabled = useRenderers;
            r.SetPropertyBlock(null);
            r.sharedMaterial = material;
        }
        if (!useRenderers) return;

        if (mode == Mode.PerRendererMaterial)
            foreach (var r in renderers)
            {
                var copy = new Material(material) { color = Random.ColorHSV() };
                spawned.Add(copy);
                r.sharedMaterial = copy;           // mỗi object một material -> SetPass tăng vọt
            }
        else if (mode == Mode.PropertyBlock)
            foreach (var r in renderers)
            {
                mpb.SetColor("_BaseColor", Random.ColorHSV());
                r.SetPropertyBlock(mpb);           // URP: object bị LOẠI khỏi SRP Batcher
            }
    }

    static long V(ProfilerRecorder r) => r.Valid ? r.LastValue : 0;

    static double Ms(ProfilerRecorder r)
    {
        if (!r.Valid || r.Count == 0) return 0;
        double sum = 0;
        for (int i = 0; i < r.Count; i++) sum += r.GetSample(i).Value;
        return sum / r.Count * 1e-6;
    }
}
```

**Chạy thử**
- Bấm `1` rồi `2`: **số draw call gần như không đổi**, nhưng SetPass và main thread ms tăng rõ. Đây là bằng chứng SRP Batcher là tối ưu **CPU**, không phải cơ chế gộp lệnh vẽ — và là câu trả lời cho một câu hỏi phỏng vấn rất hay gặp.
- Bấm `3`: `MaterialPropertyBlock` giữ được một material duy nhất nên SetPass thấp, nhưng main thread vẫn cao hơn chế độ 1 vì object đã bị loại khỏi SRP Batcher.
- Bấm `4`: draw call tụt từ ~1000 xuống vài lệnh. Đây mới là thứ cắt **số** lệnh vẽ — đổi lại là không còn GameObject, không còn culling từng vật, và bạn phải tự quản lý ma trận.
- Mở **Frame Debugger** ở chế độ 2: đọc dòng giải thích "Objects have different materials". Học đọc dòng này một lần là dùng được mãi.
- Đổi `count` lên 5000 rồi lặp lại: khoảng cách giữa các chế độ giãn ra, và bạn thấy rõ ngưỡng mà instancing bắt đầu đáng công.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Draw call là gì, và vì sao người ta muốn giảm nó?**
  → Mỗi draw call là một lần CPU bảo GPU "vẽ nhóm hình học này với trạng thái này". Chi phí nằm ở phía **CPU chuẩn bị lệnh** và ở mỗi lần đổi trạng thái. Nhưng con số đắt hơn thường là **SetPass call** — số lần đổi shader/trạng thái — nên vẽ 500 vật cùng material có thể rẻ hơn 50 vật với 50 material khác nhau.
- `Junior` **Overdraw là gì?**
  → Là cùng một pixel bị tô nhiều lần trong một frame. Nó giết GPU di động nhanh hơn số lượng object, vì nút thắt là fill rate và băng thông. Nguồn quen thuộc: particle alpha chồng lớp, panel UI mờ toàn màn hình, và vật trong suốt xếp chồng. Nhìn bằng Rendering Debugger → Overdraw, vùng đỏ đậm là chỗ phải cắt.
- `Junior` **Vì sao phải đo GPU trên thiết bị chứ không trên máy dev?**
  → Vì GPU máy dev mạnh gấp hàng chục lần và **kiến trúc khác hẳn**: desktop vẽ thẳng vào framebuffer, còn mobile là tile-based. Nhiều kết luận từ PC sai ngược trên mobile — ví dụ MSAA trên mobile rẻ, còn post-processing lại đắt hơn nhiều vì phải ghi và đọc lại toàn màn hình.
- `Mid` **SRP Batcher giảm cái gì?**
  → Giảm **chi phí CPU cho mỗi draw call**, không giảm số draw call. Nó giữ hằng số per-material trong bộ nhớ GPU giữa các frame nên CPU không phải nạp lại buffer mỗi lệnh vẽ. Hai thứ phá nó: `renderer.material` (nhân bản material) và `MaterialPropertyBlock` trong URP. Muốn dữ liệu per-instance mà vẫn nhanh thì nhét vào vertex color, UV thừa, hoặc dùng `RenderMeshInstanced`.
- `Mid` **Không có công cụ GPU của hãng, làm sao biết nút thắt ở đâu?**
  → Làm phép thử nhị phân, mỗi lần đổi một biến: hạ **Render Scale** còn 0,5 — cải thiện mạnh nghĩa là fill rate hoặc băng thông; thay hết material bằng **Unlit** — cải thiện nghĩa là fragment shader; giảm một nửa số object — cải thiện nghĩa là vertex hoặc số lệnh vẽ; **tắt shadow** — cải thiện nghĩa là pass đổ bóng. Mười phút đo như vậy thay được nhiều ngày đoán.
- `Mid` **Vì sao post-processing đắt trên mobile hơn bạn nghĩ?**
  → Vì GPU tile-based vẽ trong bộ nhớ on-chip rồi mới ghi ra ngoài. Mỗi hiệu ứng đọc lại màn hình buộc GPU **resolve tile ra bộ nhớ rồi đọc lại** — một lần ghi toàn màn hình 1080p là khoảng 8 MB, ở 60fps là ~500 MB/s cho mỗi pass, trên băng thông dùng chung với CPU. Chi phí này gần như **không phụ thuộc** cảnh phức tạp hay không.
- `Senior` **Alpha test (`clip`) hay alpha blend cho tán lá dày?**
  → Trực giác từ PC nói alpha test rẻ hơn, nhưng trên GPU di động nó thường **chậm hơn**, vì `discard` phá cơ chế loại pixel sớm (early-Z / hidden surface removal) — GPU không còn biết chắc pixel nào bị che trước khi chạy fragment shader. Câu trả lời đúng là đo cả hai trên đúng dòng máy đích, và đó cũng là ví dụ điển hình của kinh nghiệm desktop áp nhầm sang mobile.
- `Senior` **Cảnh 300 draw call, 28 ms, hạ Render Scale xuống 0,5 thì còn 17 ms. Anh làm gì tiếp?**
  → Số đó nói nút thắt là **fragment/băng thông**, không phải số lệnh vẽ — nên đi gộp mesh là phí công. Tôi sẽ đi theo hướng giảm pixel phải tô: nhìn Overdraw để cắt particle và panel mờ toàn màn hình, rà lại post-processing (mỗi hiệu ứng là một khoản băng thông cố định), đơn giản hoá shader ở vật phủ diện tích lớn, và cân nhắc để Render Scale 0,8 kèm STP như một lựa chọn chất lượng.
- `Senior` **Khi nào gộp mesh lại phản tác dụng?**
  → Khi nó phá **culling từng vật**: gộp cả khu rừng thành một mesh thì frustum culling không loại được cây nào, và bạn vẽ nhiều pixel hơn trước dù ít draw call hơn. Static Batching còn trả giá bằng **bộ nhớ ×2** vì mỗi instance giữ bản copy vertex đã transform. Gộp chỉ đáng cho nhóm vật nhỏ, gần nhau, gần như luôn cùng nằm trong khung hình.

**Khung trả lời 60 giây** — "Cảnh GPU-bound, anh xử lý thế nào?"

> Trước hết xác nhận bằng `Gfx.WaitForPresentOnGfxThread` trên main thread — CPU đang đợi GPU thì mọi tối ưu C# đều vô ích. Vì Unity Profiler gần như không đo được GPU trên mobile, tôi làm **phép thử nhị phân**: hạ Render Scale xuống 0,5, thay material bằng Unlit, giảm một nửa số object, tắt shadow — mỗi lần một biến. Bốn con số đó đủ để biết nút thắt là fill rate, fragment shader, vertex hay bóng.
>
> Điều quan trọng phải nhớ khi làm mobile là GPU **tile-based**: nó vẽ trong bộ nhớ on-chip rồi mới ghi ra ngoài, nên **băng thông là tài nguyên khan hiếm nhất**. MSAA lại rẻ, còn mỗi hiệu ứng post-processing là một lần ghi và đọc lại toàn màn hình — khoảng 8 MB mỗi lần ở 1080p.
>
> Và tôi cẩn thận với phản xạ "giảm draw call": SRP Batcher không hề giảm số draw call, nó giảm chi phí CPU cho mỗi lệnh; còn gộp mesh có khi phản tác dụng vì mất culling từng vật.

**Họ sẽ đào tiếp**

- *"Vì sao MSAA rẻ trên mobile?"* → Vì việc resolve xảy ra ngay trong tile, không phải đọc/ghi bộ nhớ ngoài. Đổi lại, mọi thứ buộc GPU resolve sớm — RenderTexture trung gian, đọc lại màn hình — đều đắt.
- *"`MaterialPropertyBlock` tốt hay xấu?"* → Tuỳ pipeline: ở Built-in nó là cách đúng để tránh nhân bản material; ở URP nó **loại object khỏi SRP Batcher**. Đây là một trong những chỗ lời khuyên cũ trên mạng còn sót lại nhiều nhất.
- *"Shadow cắt thế nào cho rẻ nhất?"* → Giảm `Shadow Distance` trước — gần như luôn không ai nhận ra, mà nó cắt cả diện tích shadow map lẫn số vật phải render vào đó. Rồi mới tới số cascade, độ phân giải, và tắt bóng cho đèn phụ.
- *"GPU Resident Drawer thì sao?"* → Unity 6, cần Forward+; tự gom MeshRenderer tĩnh thành lệnh vẽ do GPU điều khiển. Bật rồi **đo** — với cảnh ít object, chi phí thiết lập không được bù lại.

**Cờ đỏ**

- "Giảm draw call" là phản xạ đầu tiên cho mọi vấn đề GPU.
- Nói SRP Batcher gộp draw call.
- Áp kinh nghiệm desktop lên mobile (MSAA đắt, alpha test rẻ).
- Đo GPU trong Editor trên máy dev rồi kết luận cho điện thoại.
- Bật hết post-processing rồi mới nghĩ tới ngân sách.

**Số / ví dụ nên thuộc**

- Một lần ghi toàn màn hình **1080p RGBA8 ≈ 8 MB**; ở 60fps mỗi pass ≈ 500 MB/s băng thông.
- `Render Scale 0,75` bỏ **44%** số pixel; 0,5 bỏ 75%.
- Ba con số trong Frame Debugger: **Draw call ≠ SetPass call ≠ Batch**.
- Static Batching trả giá **bộ nhớ ×2**; `RenderMeshInstanced` tối đa **1023 instance** mỗi lời gọi.
- Ngân sách SetPass thực dụng trên mobile: vài chục tới khoảng 100 ở cảnh đông nhất.
