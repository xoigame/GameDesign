---
title: Addressables và bộ nhớ asset
icon: 📦
summary: Ba cách tham chiếu asset và hậu quả bộ nhớ của từng cách, đếm tham chiếu của Addressables, asset bị nhân bản trong nhiều bundle, và quy trình cập nhật nội dung từ xa mà không phải nộp lại store.
status: deep
read: 755
level: advanced
order: 155
tags: [unity, addressables, memory, asset, build]
related: [unity-build-platform, unity-optimization, unity-project-structure, unity-csharp-memory]
---

Câu hỏi thật sự không phải "dùng Addressables thế nào" mà là **asset nào đang nằm trong RAM, vì ai, và bao giờ nó ra**. Unity có ba cách trả lời, và chọn sai cách là nguồn của hai lỗi kinh điển: app 300MB vì mọi thứ bị gói vào build, và app bị hệ điều hành kill vì texture không bao giờ được giải phóng.

## Ba cách tham chiếu asset

| Cách | Nạp lúc nào | Giải phóng lúc nào | Vấn đề |
|---|---|---|---|
| **Tham chiếu trực tiếp** (kéo prefab vào field) | Cùng lúc với scene/prefab chứa nó | Khi scene bị unload | Một prefab quái vật kéo theo toàn bộ texture, audio, VFX của nó — kể cả khi chưa spawn con nào |
| **`Resources/`** | Khi gọi `Resources.Load` | `Resources.UnloadUnusedAssets()` (đắt) | **Mọi thứ trong thư mục luôn vào build**, kể cả asset không ai dùng; index làm chậm khởi động; không cập nhật từ xa được |
| **Addressables** | Khi bạn gọi, bất đồng bộ | Khi **đếm tham chiếu về 0** | Phải tự quản lý handle; sai là rò rỉ hoặc destroy nhầm thứ đang dùng |

Luật đơn giản để trả lời phỏng vấn: `Resources/` là **di sản** — đừng thêm mới. Tham chiếu trực tiếp dùng cho thứ nhỏ, luôn cần, đi cùng scene. Addressables cho mọi thứ to, tuỳ chọn, hoặc cần tải về sau.

## Đếm tham chiếu — chỗ rò rỉ nằm ở đây

Addressables đếm tham chiếu cho **cả asset lẫn bundle chứa nó**. `LoadAssetAsync` tăng một, `Release` giảm một; bundle chỉ được gỡ khỏi RAM khi mọi asset trong nó về 0.

Ba lỗi đi kèm, theo thứ tự hay gặp:

1. **Load nhiều lần, release không lần nào.** Mở bảng inventory 30 lần là 30 handle tới cùng một icon; RAM lên đều và không bao giờ xuống. Chữa: giữ handle trong một field, release trong `OnDestroy`/khi đóng màn hình.
2. **Release trong khi vẫn dùng.** Đếm về 0, bundle bị gỡ, texture trong scene thành ô vuông trắng hoặc material hồng — và lỗi hiện ở **chỗ khác**, chỗ đang hiển thị, chứ không ở chỗ gọi `Release`.
3. **`InstantiateAsync` và `ReleaseInstance` bị trộn với `Instantiate` thường.** Nếu bạn `Addressables.InstantiateAsync` thì phải `Addressables.ReleaseInstance`; `Destroy` thường sẽ huỷ object mà **không** giảm đếm — rò rỉ im lặng.

Cách kiểm chứng duy nhất đáng tin: bật **Addressables Event Viewer** (`Window > Asset Management > Addressables > Event Viewer`) trong Play Mode và nhìn đường đếm tham chiếu có trở về đáy sau mỗi vòng mở–đóng màn hình không. Nếu nó bậc thang đi lên, bạn đang rò rỉ.

## Nhóm và bundle: asset nhân bản là lỗi tốn nhất

Mỗi group sinh ra một hoặc nhiều bundle. Nếu hai group cùng tham chiếu một texture mà texture đó **không** được đánh Addressable, Unity **chép nó vào cả hai bundle** — build phình lên và RAM giữ hai bản khi cả hai bundle cùng nạp. Đây là lỗi phổ biến nhất khi mới chuyển sang Addressables, và nó không báo gì.

Công cụ: `Window > Asset Management > Addressables > Analyze` → **Check Duplicate Bundle Dependencies**. Chạy nó **trước mỗi lần build**, không phải khi đã thấy vấn đề. Cách chữa: đánh Addressable cho asset dùng chung và đưa vào một group "Shared".

Chọn cách đóng gói trong group settings:

| Bundle Mode | Khi nào | Đánh đổi |
|---|---|---|
| **Pack Together** | Nhóm luôn dùng cùng nhau (toàn bộ UI của một màn hình) | Một request, ít overhead; nhưng nạp là nạp hết |
| **Pack Separately** | Asset dùng riêng lẻ, tuỳ chọn (skin, ngôn ngữ) | Nạp đúng cái cần; nhiều file nhỏ, nhiều request, catalog to hơn |
| **Pack Together By Label** | Cắt theo nhãn: `level1`, `dlc`, `hd-texture` | Cân bằng thường dùng nhất |

Nguyên tắc thô: **cắt bundle theo lúc nội dung được cần**, không theo loại asset. "Tất cả texture một bundle" là cách chắc chắn để nạp 200MB cho một màn hình cần 3MB.

## Cập nhật nội dung từ xa

Đây là lý do thật sự nhiều studio mobile dùng Addressables: sửa số liệu cân bằng, thêm sự kiện, vá một prefab lỗi **mà không nộp lại store**.

Quy trình rút gọn:

1. Build player kèm `addressables_content_state.bin` — **giữ file này**, nó là mốc so sánh.
2. Nội dung mới → *Update a Previous Build* với file state đó → sinh catalog mới + bundle đã đổi.
3. Đẩy lên CDN. Client tải catalog, thấy hash khác, tải bundle mới.

Ba ràng buộc phải nói được:

- **Không cập nhật được code.** Bundle chứa asset và dữ liệu, không chứa C# đã biên dịch (trừ đường vòng như scripting runtime khác, không nên). Sửa logic vẫn phải ra bản mới.
- **Mất `addressables_content_state.bin` là mất khả năng cập nhật đúng cách** cho bản đó — phải ép người chơi tải lại toàn bộ. Commit nó, hoặc lưu cùng artifact của bản build.
- **Phiên bản catalog phải khớp bản app.** Người chơi ở bản cũ kéo catalog mới là công thức cho crash khó hiểu; tách theo thư mục remote theo version app.

Trên Android còn có **Play Asset Delivery** (install-time / fast-follow / on-demand) và iOS có On-Demand Resources; Addressables tích hợp được với PAD. Đây là thứ giữ base AAB dưới giới hạn 200MB của Google Play.

## Bẫy lộ ra khi build

- **Play Mode Script = Use Asset Database** chạy ngon trong Editor vì nó bỏ qua bundle hoàn toàn. Mọi lỗi đóng gói chỉ lộ ở chế độ *Use Existing Build* hoặc trên thiết bị. Test ở chế độ đó trước khi tin.
- Asset vừa nằm trong `Resources/` vừa được đánh Addressable: có hai bản trong build.
- Sprite Atlas và shader dùng chung không đánh Addressable → nhân bản khắp các bundle.
- Quên `Addressables.InitializeAsync` xong đã gọi load ở frame đầu — trên máy chậm thì hỏng, trên máy dev thì không.
- Không có xử lý **mất mạng giữa chừng**: `LoadAssetAsync` thất bại, `handle.Status` là `Failed`, và nếu không kiểm tra thì game đứng ở màn hình chờ vĩnh viễn.

## Kiểm tra nhanh

- [ ] Không thêm gì mới vào `Resources/`
- [ ] Analyze → **Check Duplicate Bundle Dependencies** sạch trước mỗi build
- [ ] Mỗi `LoadAssetAsync` có một `Release` đối ứng; mỗi `InstantiateAsync` có `ReleaseInstance`
- [ ] Event Viewer: đếm tham chiếu trở về đáy sau khi đóng màn hình
- [ ] Đã test ở Play Mode Script = *Use Existing Build*, không chỉ Asset Database
- [ ] `addressables_content_state.bin` được lưu cùng mỗi bản phát hành
- [ ] Có đường xử lý khi tải thất bại: retry, thông báo, và lối thoát cho người chơi

## 🤖 Prompt cho AI

**Dùng AI thế nào cho Addressables**

AI viết đúng phần **cơ học**: `LoadAssetAsync`, `await handle.Task`, kiểm tra `Status`, gọi `Release`. Nó **không** biết ba thứ quyết định: asset nào dùng chung với ai (nên nhân bản hay không), màn hình nào sống bao lâu (nên release ở đâu), và bạn định cập nhật nội dung từ xa hay không (quyết định cách cắt group). Đây là những thứ nằm trong đầu bạn và trong cấu trúc dự án, không nằm trong file code nó đọc được.

Cách dùng hiệu quả: giao cho AI viết **một lớp bọc** (`AssetLoader`) có kỷ luật vòng đời — load theo khoá, giữ handle trong dictionary, release theo nhóm khi màn hình đóng — rồi bạn tự quyết cách chia group trong Editor. Và luôn bắt nó viết cả nhánh **thất bại**, vì đó là nhánh nó hay bỏ qua nhất.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Asset sống theo **vòng đời nào**: cả phiên chơi, một màn, một popup? Đây là thứ quyết định chỗ gọi `Release`.
- Nội dung ở local hay remote; có cập nhật từ xa không.
- Dùng `AssetReference` (kéo trong Inspector) hay khoá string. Trộn cả hai là nguồn bug.
- Có giới hạn số handle đồng thời / bộ nhớ mục tiêu không.
- Hành vi khi mất mạng hoặc tải lỗi: retry mấy lần, rồi làm gì.

**Mẫu prompt**

```
Unity 6, Addressables 2.x, Android. Viết lớp ScreenAssetScope:
- Load nhiều asset theo AssetReference, gom theo "scope" là một màn hình UI
- Dispose(scope) release TOÀN BỘ handle của scope đó, kể cả khi đang tải dở
- Nếu cùng một asset được yêu cầu hai lần trong một scope, chỉ load một lần
- Trả về lỗi rõ ràng khi handle.Status == Failed; retry tối đa 2 lần, có backoff
Ràng buộc: KHÔNG dùng Resources; KHÔNG dùng async void; mọi await có
destroyCancellationToken. Chỉ ra đúng chỗ đếm tham chiếu tăng và giảm.
```

**Bẫy thường gặp:** AI gọi `Addressables.InstantiateAsync` để tạo object rồi `Destroy(go)` khi xong — code chạy đúng, object biến mất đúng lúc, và **đếm tham chiếu không bao giờ giảm**. Bundle ở lại trong RAM vĩnh viễn, rò rỉ tăng theo số lần spawn, và Profiler chỉ cho thấy bộ nhớ native lớn dần mà không chỉ được ai giữ. Luật phải viết vào prompt: *cái gì tạo bằng Addressables thì huỷ bằng `Addressables.ReleaseInstance`.*

## 💻 Code

Demo dựng một `ScreenAssetScope`: nạp nhiều asset theo nhóm màn hình, gộp yêu cầu trùng, và giải phóng **toàn bộ** khi đóng — kể cả handle đang tải dở. Kèm overlay đếm số handle đang mở để nhìn thấy rò rỉ thay vì đoán.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Hierarchy có AddressableLab với script và Canvas chứa Label, Inspector hiện Asset References, Label và bảng thao tác kiểm chứng">
  <rect x="10" y="10" width="200" height="280" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <rect x="16" y="52" width="188" height="20" rx="4" fill="#51cf9b" opacity="0.18"/>
  <text x="22" y="67" class="fig-label" font-size="12" font-weight="600">AddressableLab</text>
  <text x="22" y="88" class="fig-muted" font-size="12">▾ Canvas  (Screen Space Overlay)</text>
  <text x="38" y="106" class="fig-muted" font-size="11">Label  (TextMeshProUGUI)</text>
  <line x1="10" y1="122" x2="210" y2="122" class="fig-line"/>
  <text x="22" y="142" class="fig-label" font-size="12" font-weight="600">Phím</text>
  <text x="22" y="162" class="fig-muted" font-size="11">L — mở scope (load hết)</text>
  <text x="22" y="178" class="fig-muted" font-size="11">R — đóng scope (release hết)</text>
  <text x="22" y="194" class="fig-muted" font-size="11">Bấm L nhiều lần: handle KHÔNG</text>
  <text x="22" y="208" class="fig-muted" font-size="11">tăng, vì scope gộp yêu cầu trùng</text>
  <line x1="10" y1="224" x2="210" y2="224" class="fig-line"/>
  <text x="22" y="244" class="fig-muted" font-size="10">Window ▸ Asset Management ▸</text>
  <text x="22" y="258" class="fig-muted" font-size="10">Addressables ▸ Event Viewer để</text>
  <text x="22" y="272" class="fig-muted" font-size="10">nhìn đếm tham chiếu thật.</text>
  <rect x="226" y="10" width="424" height="280" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Addressable Lab (Script)</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Label</text><text x="440" y="82" class="fig-label" font-size="11">Label (TextMeshProUGUI)</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Assets  (AssetReferenceGameObject[])</text><text x="440" y="98" class="fig-label" font-size="11">3–5 prefab đã Addressable</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Spawn Point</text><text x="440" y="114" class="fig-label" font-size="11">Transform trong scene</text>
  <rect x="234" y="128" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="141" class="fig-label" font-size="12" font-weight="600">Addressables Group Settings</text>
  <text x="250" y="160" class="fig-muted" font-size="11">Bundle Mode</text><text x="440" y="160" class="fig-label" font-size="11">Pack Together By Label</text>
  <text x="250" y="176" class="fig-muted" font-size="11">Play Mode Script</text><text x="440" y="176" class="fig-label" font-size="11">Use Existing Build (để test thật)</text>
  <rect x="234" y="190" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="203" class="fig-label" font-size="12" font-weight="600">Overlay hiện gì</text>
  <text x="250" y="222" class="fig-muted" font-size="11">Handle đang mở</text><text x="440" y="222" class="fig-label" font-size="11">phải về 0 sau khi bấm R</text>
  <text x="250" y="238" class="fig-muted" font-size="11">Instance đang sống</text><text x="440" y="238" class="fig-label" font-size="11">huỷ bằng ReleaseInstance</text>
  <text x="250" y="254" class="fig-muted" font-size="11">Trạng thái tải</text><text x="440" y="254" class="fig-label" font-size="11">Loading / Done / Failed</text>
  <text x="250" y="270" class="fig-muted" font-size="11">Mono heap</text><text x="440" y="270" class="fig-label" font-size="11">đối chiếu với Memory Profiler</text>
</svg>
<figcaption>Bấm L rồi R vài vòng: số handle phải trở về 0 mỗi lần. Nếu nó bậc thang đi lên, đó chính là rò rỉ mà Event Viewer sẽ xác nhận.</figcaption>
</figure>

**Script**

```csharp
// AddressableLab.cs — Unity 6 (6000.x), package com.unity.addressables 2.x.
// Gắn lên "AddressableLab". Kéo vài prefab ĐÃ đánh Addressable vào mảng Assets.
// L = mở scope (load), R = đóng scope (release). Overlay đếm handle đang mở.
using System.Collections.Generic;
using System.Threading.Tasks;
using TMPro;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.InputSystem;
using UnityEngine.ResourceManagement.AsyncOperations;

/// Gom mọi handle của MỘT màn hình vào một chỗ, để đóng màn hình là trả hết.
public sealed class ScreenAssetScope
{
    readonly Dictionary<object, AsyncOperationHandle<GameObject>> handles = new();
    public int Count => handles.Count;

    public async Task<GameObject> LoadAsync(AssetReferenceGameObject reference)
    {
        object key = reference.RuntimeKey;

        // Yêu cầu trùng trong cùng scope: dùng lại handle cũ, KHÔNG tăng đếm lần hai.
        if (handles.TryGetValue(key, out var existing))
        {
            await existing.Task;
            return existing.Status == AsyncOperationStatus.Succeeded ? existing.Result : null;
        }

        var handle = Addressables.LoadAssetAsync<GameObject>(key);
        handles[key] = handle;              // ghi vào dictionary NGAY, trước await:
                                            // nếu không, hai lời gọi sát nhau sẽ load hai lần
        await handle.Task;

        if (handle.Status != AsyncOperationStatus.Succeeded)
        {
            Debug.LogError($"Addressables: tải hỏng {key} — {handle.OperationException?.Message}");
            return null;                    // giữ handle lại để Dispose() trả về đúng một lần
        }
        return handle.Result;
    }

    /// Trả TẤT CẢ, kể cả handle đang tải dở — release lúc đang load là hợp lệ.
    public void Dispose()
    {
        foreach (var h in handles.Values)
            if (h.IsValid()) Addressables.Release(h);
        handles.Clear();
    }
}

public class AddressableLab : MonoBehaviour
{
    [SerializeField] TextMeshProUGUI label;
    [SerializeField] AssetReferenceGameObject[] assets;
    [SerializeField] Transform spawnPoint;

    ScreenAssetScope scope;
    readonly List<GameObject> spawned = new();
    string status = "idle";

    void Awake() => scope = new ScreenAssetScope();

    void OnDestroy() => Close();            // đóng app cũng phải trả, không chỉ khi bấm phím

    void Update()
    {
        var kb = Keyboard.current;
        if (kb != null && kb.lKey.wasPressedThisFrame) _ = OpenAsync();
        if (kb != null && kb.rKey.wasPressedThisFrame) Close();

        if (label != null)                  // overlay debug: alloc ở đây không quan trọng
            label.text = $"handle: {scope.Count} | instance: {spawned.Count} | {status}";
    }

    async Task OpenAsync()
    {
        status = "loading";
        foreach (var reference in assets)
        {
            if (destroyCancellationToken.IsCancellationRequested) return;

            var prefab = await scope.LoadAsync(reference);
            if (prefab == null) { status = "failed"; return; }

            // Scope đang giữ handle cho prefab, nên Instantiate/Destroy THƯỜNG là đúng ở đây.
            // Nếu dùng Addressables.InstantiateAsync thì BẮT BUỘC Addressables.ReleaseInstance,
            // vì Destroy thường sẽ huỷ object mà không giảm đếm tham chiếu.
            spawned.Add(Instantiate(prefab, spawnPoint.position + Random.insideUnitSphere, Quaternion.identity));
        }
        status = "done";
    }

    void Close()
    {
        foreach (var go in spawned) if (go != null) Destroy(go);
        spawned.Clear();
        scope.Dispose();                    // đếm tham chiếu về 0 -> bundle được gỡ khỏi RAM
        status = "released";
    }
}
```

**Chạy thử**
- Đặt **Play Mode Script = Use Existing Build** (sau khi Build Addressables một lần). Chế độ *Use Asset Database* bỏ qua bundle nên không kiểm chứng được gì.
- Bấm L: `handle` tăng lên đúng bằng số asset. Bấm L **lần nữa**: `handle` **không** tăng — scope gộp yêu cầu trùng.
- Bấm R: `handle` về 0. Mở Event Viewer và làm lại vài vòng L–R: đường đếm tham chiếu phải xuống đáy mỗi lần, không được bậc thang đi lên.
- Thử đổi `Instantiate` thành `Addressables.InstantiateAsync` mà vẫn `Destroy` thường: `handle` trong overlay vẫn về 0, nhưng Event Viewer cho thấy bundle **không** được gỡ — đúng cái rò rỉ mà overlay tự viết không bắt được.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | Vì sao không nên dùng thư mục `Resources/`? |
| Junior | Kéo prefab vào field trong Inspector thì asset của nó được nạp lúc nào? |
| Mid | Addressables giải phóng bộ nhớ khi nào? |
| Mid | Build phình lên sau khi chuyển sang Addressables. Nguyên nhân hay gặp nhất? |
| Senior | Cập nhật nội dung từ xa: quy trình và giới hạn? |
| Senior | RAM tăng dần mỗi lần mở/đóng một màn hình UI. Anh tìm ở đâu? |

**Khung trả lời 60 giây** — "Anh quản lý bộ nhớ asset thế nào?"

> Tôi phân theo **vòng đời**. Thứ nhỏ và luôn cần thì tham chiếu trực tiếp, đi cùng scene. Thứ to, tuỳ chọn, hoặc cần tải về sau thì Addressables. `Resources/` là di sản — mọi thứ trong đó **luôn** vào build kể cả không ai dùng, và không cập nhật từ xa được, nên tôi không thêm mới.
>
> Với Addressables, điều phải nắm là **đếm tham chiếu**: `LoadAssetAsync` tăng một, `Release` giảm một, và bundle chỉ rời RAM khi mọi asset trong nó về 0. Nên tôi không rải `Release` khắp nơi mà gom handle theo **scope của một màn hình**: mở màn hình thì load vào scope, đóng màn hình thì trả cả cụm — kể cả handle đang tải dở.
>
> Cách kiểm chứng là Event Viewer trong Play Mode: mở rồi đóng màn hình vài vòng, đường đếm tham chiếu phải trở về đáy mỗi lần. Bậc thang đi lên là rò rỉ, và nhìn thấy nó rẻ hơn nhiều so với đi tìm sau khi QA báo máy 3GB bị kill.

**Họ sẽ đào tiếp**

- *"Build phình vì sao?"* → **Asset bị nhân bản**: hai group cùng tham chiếu một texture chưa đánh Addressable thì Unity chép nó vào cả hai bundle, và khi cả hai cùng nạp thì RAM giữ hai bản. Công cụ là Analyze → *Check Duplicate Bundle Dependencies*, và phải chạy trước mỗi build chứ không phải khi đã thấy vấn đề.
- *"Cắt group theo gì?"* → Theo **lúc nội dung được cần**, không theo loại asset. "Tất cả texture một bundle" là cách chắc chắn để nạp 200MB cho một màn hình cần 3MB. Pack Together cho nhóm luôn dùng cùng nhau; Pack Separately cho thứ tuỳ chọn như skin, ngôn ngữ.
- *"Cập nhật từ xa?"* → Build player kèm `addressables_content_state.bin`, giữ file đó, rồi *Update a Previous Build* để sinh catalog và bundle đã đổi, đẩy lên CDN. Ba giới hạn: **không cập nhật được code C#**; mất file state là mất khả năng cập nhật đúng cách cho bản đó; và catalog phải khớp phiên bản app, nếu không người chơi bản cũ kéo catalog mới sẽ crash khó hiểu.
- *"Vì sao Editor chạy ngon mà build hỏng?"* → Play Mode Script mặc định là *Use Asset Database*, bỏ qua bundle hoàn toàn. Mọi lỗi đóng gói chỉ lộ ở *Use Existing Build* hoặc trên thiết bị.
- *"`InstantiateAsync` khác gì?"* → Nó tăng đếm và trả về instance; huỷ phải bằng `ReleaseInstance`. `Destroy` thường sẽ xoá object mà **không** giảm đếm — rò rỉ im lặng. Nếu đã giữ handle cho prefab ở một scope thì `Instantiate`/`Destroy` thường lại là đúng.

**Cờ đỏ**

- Không biết Addressables đếm tham chiếu; nghĩ `Release` là "xoá khỏi RAM ngay".
- `Resources.Load` cho mọi thứ, và không biết vì sao đó là vấn đề.
- Gọi `Resources.UnloadUnusedAssets()` giữa gameplay để "dọn RAM" — nó quét toàn bộ tham chiếu và rất đắt; chỗ của nó là màn hình loading.
- Không có nhánh xử lý khi tải thất bại hoặc mất mạng giữa chừng.
- Test bộ nhớ trong Editor rồi kết luận cho thiết bị.

**Số / ví dụ nên thuộc**

- Google Play: base AAB **200MB**; vượt thì cần Play Asset Delivery.
- Analyze → *Check Duplicate Bundle Dependencies* — tên đúng của công cụ.
- `addressables_content_state.bin` — mất là mất đường cập nhật nội dung.
- Bundle rời RAM khi đếm tham chiếu **của mọi asset trong nó** về 0.
