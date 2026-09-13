---
title: Tối ưu bộ nhớ — ngân sách theo dòng máy
icon: 🧱
summary: Ba loại bộ nhớ và ai đếm cái gì, công thức tính texture, những thứ âm thầm giữ asset lại, và cách truy vết bằng Memory Profiler thay vì đoán.
status: deep
read: 744
level: advanced
order: 144
tags: [unity, performance, memory, mobile, optimization]
related: [unity-optimization, unity-csharp-memory, unity-addressables, unity-debug-crash, unity-profiling]
---

Bộ nhớ khác CPU và GPU ở một điểm quyết định: **vượt ngân sách không làm game chậm, nó làm game biến mất**. Hệ điều hành di động giết tiến trình không báo trước, không stack trace, và báo cáo crash của bạn sạch sẽ — xem chữ ký của nó ở [[unity-debug-crash]].

Node này là phần "chiếm bộ nhớ và giữ bộ nhớ". Phần rác managed và GC nằm ở [[unity-csharp-memory]]; phần vòng đời bundle nằm ở [[unity-addressables]].

## Ba loại bộ nhớ, ba cách chữa

| Loại | Chứa gì | Nhìn bằng | Chữa bằng |
|---|---|---|---|
| **Managed (GC heap)** | Object C# của bạn | Profiler → GC Reserved; `System.GC.GetTotalMemory` | Bớt cấp phát; nhớ heap **không trả lại** hệ điều hành |
| **Native** | Texture, mesh, audio clip, animation, font atlas, RenderTexture | **Memory Profiler**, `Profiler.GetRuntimeMemorySizeLong` | Import settings, giải phóng đúng lúc |
| **Đồ hoạ** | Bản trên GPU của texture/mesh/RT — trên mobile **dùng chung RAM** | Memory Profiler, công cụ hãng | Nén texture, bớt RenderTexture |

Điều quan trọng nhất trong bảng này: **native thường chiếm phần lớn**, và `GC.Collect()` không đụng tới nó. Rất nhiều buổi đi tìm "rò rỉ bộ nhớ" thực ra là đi tìm nhầm loại — người ta soi GC heap 40 MB trong khi 700 MB texture đang nằm im.

## Ngân sách: bao nhiêu là đủ

Không có con số chính thức, nhưng quy tắc ngón tay cái dùng được: app nên nhắm **một phần ba tới một nửa RAM máy**, và luôn phải tự đo trên thiết bị thật vì hệ điều hành cùng các app nền cũng ăn phần của chúng.

| Dòng máy | RAM | Ngân sách nhắm tới | Ghi chú |
|---|---|---|---|
| Android phổ thông cũ | 2 GB | **~0,7 GB** | Nhóm bị kill nhiều nhất; nếu thị trường của bạn có nhóm này thì nó là mốc thật |
| Android tầm trung | 3–4 GB | ~1,0–1,3 GB | Mốc thực dụng cho phần lớn game mobile |
| Android cao cấp | 8 GB+ | ~2 GB | Đừng dùng nhóm này làm chuẩn — nó giấu mọi vấn đề |
| iPhone đời cũ | 2–3 GB | ~0,8–1,2 GB | iOS giết tiến trình dứt khoát hơn; cache lớn còn bị App Store soi |

Cách dùng bảng: chọn **máy yếu nhất trong danh sách hỗ trợ**, đặt ngân sách, rồi gắn một overlay hiện `System Used Memory` (xem [[unity-profiling]]) để cả đội nhìn thấy con số mỗi ngày thay vì biết nó vào tuần cuối trước khi phát hành.

## Cái gì thật sự chiếm chỗ

**Texture — gần như luôn đứng đầu.** Công thức đủ dùng:

```
bộ nhớ ≈ rộng × cao × (bit mỗi pixel / 8) × 1,33     (1,33 là phần mipmap)
```

Ba công tắc đổi con số đó nhiều nhất, theo thứ tự:

| Công tắc | Sai thì | Đúng thì |
|---|---|---|
| **Định dạng nén** | 2048² RGBA32 = **21 MB** | ASTC 6×6 = **2,5 MB** (bảng đầy đủ ở [[unity-optimization]]) |
| **Max Size** | Texture 4096 cho vật thể chiếm 100 px trên màn hình | Hạ xuống đúng nhu cầu — mỗi lần giảm một nửa là **bớt 75%** |
| **Read/Write Enabled** | Giữ thêm một bản trên RAM cho CPU đọc → **gấp đôi** | Tắt (mặc định), trừ khi thật sự đọc pixel bằng code |

Hai thứ hay bị hiểu nhầm: **mipmap cho UI là lãng phí** (sprite UI vẽ đúng tỉ lệ 1:1, tắt đi bớt 33%); và **Crunch chỉ nén trên ổ đĩa**, giải nén khi nạp — nó giảm kích cỡ tải về, **không** giảm RAM lúc chạy. ASTC/ETC2 thì ngược lại: GPU đọc thẳng dạng nén nên giảm cả hai.

**Những thứ còn lại**, xếp theo mức hay gây bất ngờ:

- **Font atlas TextMeshPro**: một atlas 4096² dạng alpha là **~16 MB**. Game có tiếng Trung/Nhật thường cần đúng loại atlas đó — xem [[unity-ui]].
- **RenderTexture**: một RT toàn màn hình 1080p RGBA + depth là ~12 MB, và nó **thường trực**, không chỉ lúc dùng.
- **Mesh**: số thuộc tính đỉnh nhân số đỉnh; `Read/Write Enabled` cũng nhân đôi; *Mesh Compression* chỉ ảnh hưởng ổ đĩa, không ảnh hưởng RAM.
- **Audio**: `Decompress On Load` giữ dạng PCM — một bài nhạc 3 phút có thể là **30 MB** trong RAM. Nhạc phải `Streaming`, bảng đầy đủ ở [[unity-audio]].
- **Animation clip**: nhiều curve, nhiều keyframe, nhân với số nhân vật.

## Ai đang giữ asset lại

Nạp thì dễ thấy, giữ lại thì không. Năm nguồn, theo thứ tự hay gặp:

1. **`Resources/`** — mọi thứ trong thư mục đó **luôn** nằm trong build, và asset đã `Resources.Load` chỉ rời RAM khi bạn gọi `Resources.UnloadUnusedAssets()`.
2. **Trường `static` và ScriptableObject** trỏ tới prefab/texture: sống qua mọi lần đổi scene. Đây là nguồn "đổi scene mà RAM không xuống" phổ biến nhất.
3. **Handle Addressables không `Release`** — bundle ở lại vĩnh viễn, xem [[unity-addressables]].
4. **`renderer.material` / `new Material(...)`** không `Destroy`: mỗi lần đọc `.material` là một bản sao mới. Memory Profiler hiện thành số lượng Material tăng đều.
5. **`DontDestroyOnLoad`** gom dần: pool, hệ thống, và cả những object chỉ cần cho một màn.

Và một chi tiết về ngữ nghĩa hay bị hiểu sai: **unload scene không tự giải phóng asset**. Asset chỉ rời RAM khi không còn tham chiếu **và** `Resources.UnloadUnusedAssets()` chạy (Unity gọi nó khi `LoadScene` ở chế độ Single, nhưng không gọi khi bạn unload scene additive). Nó **đắt** — quét toàn bộ tham chiếu — nên chỗ của nó là màn hình loading, không phải giữa gameplay. `Application.lowMemory` là chuông báo cuối cùng để xoá cache trước khi hệ điều hành ra tay.

## Truy vết bằng Memory Profiler

Quy trình bốn bước, làm trên **bản build** chứ không trong Editor (Editor giữ thêm asset của chính nó):

1. Chụp snapshot ngay sau khi vào màn chơi.
2. Chơi 10–15 phút, đi qua vài màn, mở đóng UI vài lượt.
3. Chụp snapshot thứ hai, mở tab **Compare**.
4. Nhìn cái gì **tăng mà không nên tăng**, rồi bấm vào object để xem chuỗi tham chiếu đang giữ nó.

Ba dấu hiệu đọc được ngay: số lượng **Material** tăng theo số lần spawn (lỗi `.material`); cùng một texture xuất hiện **nhiều bản** (nhân bản giữa bundle — xem [[unity-addressables]]); và tổng texture tăng đều sau mỗi lần đổi màn (thiếu release hoặc còn tham chiếu static).

## Bẫy lộ ra khi build

- **Kích cỡ build ≠ bộ nhớ lúc chạy**: Crunch làm gói tải nhẹ đi mà RAM không đổi; ngược lại một texture không nén có thể nhỏ trên đĩa nhưng khổng lồ trong RAM.
- Đo trong Editor: Editor giữ thêm asset, preview, và bản không nén — con số luôn sai lệch theo hướng khó đoán.
- Máy cao cấp không bao giờ bị kill, nên vấn đề chỉ xuất hiện ở nhóm người chơi bạn không có trong tay.
- Tổng RAM "ổn" nhưng vẫn bị kill: hệ điều hành nhìn mức **đỉnh**, và đỉnh thường rơi đúng lúc chuyển màn — khi màn cũ chưa giải phóng mà màn mới đã nạp.
- `Resources.UnloadUnusedAssets()` gọi giữa gameplay để "dọn cho nhẹ": nó quét toàn bộ tham chiếu và gây khựng, đúng loại ANR ở [[unity-debug-crash]].

## Kiểm tra nhanh

- [ ] Có **ngân sách bằng MB** cho máy yếu nhất trong danh sách hỗ trợ, và cả đội nhìn thấy nó hằng ngày
- [ ] Không texture nào còn `Read/Write Enabled` mà không có lý do
- [ ] Sprite UI **tắt mipmap**; texture lớn đã hạ `Max Size` đúng nhu cầu hiển thị
- [ ] Nhạc để `Streaming`, không `Decompress On Load`
- [ ] Không thêm gì mới vào `Resources/`
- [ ] Đỉnh RAM lúc **chuyển màn** nằm trong ngân sách, không chỉ mức ổn định
- [ ] Đã so hai snapshot Memory Profiler **trên bản build** sau 15 phút chơi

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc tối ưu bộ nhớ**

Điểm mù: AI không thấy snapshot của bạn và **không biết asset nào đang có trong project**. Hỏi "vì sao game tốn RAM" là mời nó liệt kê những lời khuyên chung ai cũng biết. Nhưng nó rất mạnh ở hai việc cụ thể: **viết công cụ audit** (quét asset, tính bộ nhớ thật, in bảng — demo bên dưới đúng là loại đó) và **đọc bảng số bạn dán vào** để xếp hạng thứ đáng cắt trước.

Một cách dùng hiệu quả nữa: đưa nó danh sách import settings hiện tại rồi hỏi *"với từng dòng, nói bộ nhớ hiện tại, bộ nhớ sau khi đổi, và cái mất về chất lượng"* — nó làm phép nhân không sai, và bạn có bảng đánh đổi để quyết định.

**Phải nêu rõ** (thiếu là AI đoán bừa):
- Thiết bị đích và **ngân sách MB**; hiện đang dùng bao nhiêu.
- Số đo tách theo loại: managed / native / đồ hoạ. Gộp một cục là không suy được gì.
- Bảng asset có thật: tên, kích thước, định dạng, Read/Write, mipmap.
- RAM tăng theo cái gì: theo thời gian chơi, theo số lần đổi màn, hay ngay từ lúc vào game.
- Ràng buộc chất lượng: cái gì **không được** giảm độ phân giải.

**Mẫu prompt**

```
Unity 6, Android 3 GB RAM, ngân sách 1,0 GB. Trên bản build, Memory Profiler:
native 780 MB (texture 610 MB), managed 90 MB. Sau 15 phút chơi tăng thêm 120 MB.
Top 20 texture (tên | kích thước | định dạng | Read/Write | mipmap): <dán>

1. Xếp hạng thứ đáng cắt trước theo MB tiết kiệm được, kèm cái mất về chất lượng.
2. Với phần "tăng thêm 120 MB sau 15 phút": liệt kê giả thuyết rò rỉ và nói
   tôi phải nhìn vào đâu trong Memory Profiler để xác nhận từng cái.
KHÔNG đề xuất giảm chất lượng nhân vật chính và UI. Nói rõ Crunch KHÔNG giảm RAM.
```

**Bẫy thường gặp:** AI khuyên bật **Crunch Compression** để "giảm bộ nhớ". Crunch chỉ nén trên **ổ đĩa** và được giải nén khi nạp — kích cỡ tải về giảm, RAM lúc chạy **không đổi**. Bẫy anh em: nó gợi ý `GC.Collect()` hoặc `Resources.UnloadUnusedAssets()` như cách "giải phóng bộ nhớ" mà không nói cái thứ nhất chỉ đụng managed heap (thường là phần nhỏ nhất) còn cái thứ hai đắt tới mức gây khựng nếu gọi giữa gameplay. Bắt AI nói rõ **loại bộ nhớ nào** được giải phóng cho từng đề xuất — câu hỏi đó lọc sạch lời khuyên học thuộc.

## 💻 Code

Demo dựng `TextureAudit`: một cửa sổ Editor quét toàn bộ texture trong project, xếp theo bộ nhớ giảm dần, và **gắn cờ đúng ba công tắc đắt nhất** — Read/Write bật, sprite còn mipmap, chưa override nén cho nền tảng. Đây là loại công cụ trả lãi ngay tuần đầu, vì lỗi bộ nhớ hầu hết là lỗi import settings chứ không phải lỗi code.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 280" role="img" aria-label="Cửa sổ Texture Audit với bảng xếp hạng texture theo bộ nhớ và cột cảnh báo">
  <rect x="10" y="10" width="640" height="260" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Tools ▸ Audit ▸ Texture Memory</text>
  <line x1="10" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="18" y="50" width="624" height="20" rx="4" fill="#ff8787" opacity="0.16"/>
  <text x="26" y="65" class="fig-label" font-size="12" font-weight="600">Tổng 412 texture · 738 MB (số Editor — dùng để XẾP HẠNG, không phải số trên máy)</text>
  <text x="26" y="90" class="fig-muted" font-size="11">Texture</text>
  <text x="330" y="90" class="fig-muted" font-size="11">Kích thước</text>
  <text x="420" y="90" class="fig-muted" font-size="11">RAM</text>
  <text x="490" y="90" class="fig-muted" font-size="11">Cảnh báo</text>
  <line x1="22" y1="98" x2="642" y2="98" class="fig-line"/>
  <text x="26" y="118" class="fig-label" font-size="11">Art/Env/Ground_Diffuse</text>
  <text x="330" y="118" class="fig-muted" font-size="11">4096×4096</text>
  <text x="420" y="118" class="fig-label" font-size="11">85 MB</text>
  <text x="490" y="118" class="fig-label" font-size="11">chưa override Android</text>
  <text x="26" y="138" class="fig-label" font-size="11">Art/Chars/Boss_Albedo</text>
  <text x="330" y="138" class="fig-muted" font-size="11">2048×2048</text>
  <text x="420" y="138" class="fig-label" font-size="11">42 MB</text>
  <text x="490" y="138" class="fig-label" font-size="11">Read/Write BẬT (×2 RAM)</text>
  <text x="26" y="158" class="fig-label" font-size="11">UI/Atlas/Shop</text>
  <text x="330" y="158" class="fig-muted" font-size="11">2048×2048</text>
  <text x="420" y="158" class="fig-label" font-size="11">21 MB</text>
  <text x="490" y="158" class="fig-label" font-size="11">sprite có mipmap (+33%)</text>
  <text x="26" y="178" class="fig-muted" font-size="11">Art/Env/Rock_Normal</text>
  <text x="330" y="178" class="fig-muted" font-size="11">2048×2048</text>
  <text x="420" y="178" class="fig-muted" font-size="11">11 MB</text>
  <text x="490" y="178" class="fig-muted" font-size="11">—</text>
  <line x1="22" y1="192" x2="642" y2="192" class="fig-line"/>
  <text x="26" y="212" class="fig-label" font-size="12" font-weight="600">Ba cảnh báo này là ba công tắc đắt nhất</text>
  <text x="26" y="232" class="fig-muted" font-size="11">Read/Write bật = nhân đôi · sprite có mipmap = +33% · chưa override nền tảng = có thể không nén</text>
  <text x="26" y="252" class="fig-muted" font-size="10">Bấm một dòng để chọn asset trong Project window và sửa import settings ngay.</text>
</svg>
<figcaption>Xếp hạng để biết cắt cái gì trước; con số tuyệt đối thì lấy từ snapshot Memory Profiler trên bản build.</figcaption>
</figure>

**Script**

```csharp
// TextureAudit.cs — Unity 6. ĐẶT TRONG THƯ MỤC Editor/ (nếu không, build sẽ lỗi
// vì UnityEditor không tồn tại lúc runtime — xem node Editor Tools).
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.Profiling;

public class TextureAudit : EditorWindow
{
    struct Row { public string Path; public long Bytes; public Vector2Int Size; public string Warn; }

    const int TopCount = 40;
    readonly List<Row> rows = new();
    long total;
    Vector2 scroll;

    [MenuItem("Tools/Audit/Texture Memory")]
    static void Open()
    {
        var w = GetWindow<TextureAudit>("Texture Audit");
        w.Scan();
    }

    void Scan()
    {
        rows.Clear();
        total = 0;
        var guids = AssetDatabase.FindAssets("t:Texture2D");

        try
        {
            for (int i = 0; i < guids.Length; i++)
            {
                string path = AssetDatabase.GUIDToAssetPath(guids[i]);
                if (path.StartsWith("Packages/")) continue;
                if (EditorUtility.DisplayCancelableProgressBar("Texture Audit", path, (float)i / guids.Length))
                    break;

                var tex = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
                if (tex == null) continue;

                // Số của Editor: dùng để XẾP HẠNG. Con số thật lấy từ Memory Profiler trên bản build.
                long bytes = Profiler.GetRuntimeMemorySizeLong(tex);
                total += bytes;

                rows.Add(new Row
                {
                    Path = path,
                    Bytes = bytes,
                    Size = new Vector2Int(tex.width, tex.height),
                    Warn = Warnings(path, tex),
                });
            }
        }
        finally { EditorUtility.ClearProgressBar(); }

        rows.Sort((a, b) => b.Bytes.CompareTo(a.Bytes));
    }

    static string Warnings(string path, Texture2D tex)
    {
        if (AssetImporter.GetAtPath(path) is not TextureImporter imp) return "";
        var w = new List<string>();

        if (imp.isReadable) w.Add("Read/Write BẬT (×2 RAM)");
        if (imp.textureType == TextureImporterType.Sprite && imp.mipmapEnabled) w.Add("sprite có mipmap (+33%)");
        if (!imp.GetPlatformTextureSettings("Android").overridden) w.Add("chưa override Android");
        if (tex.width > 2048 || tex.height > 2048) w.Add("kích thước > 2048");

        return string.Join(" · ", w);
    }

    void OnGUI()
    {
        using (new EditorGUILayout.HorizontalScope(EditorStyles.toolbar))
        {
            if (GUILayout.Button("Quét lại", EditorStyles.toolbarButton, GUILayout.Width(80))) Scan();
            GUILayout.Label($"{rows.Count} texture · {total / (1024f * 1024f):0.0} MB " +
                            "(số Editor — dùng để xếp hạng, không phải số trên máy)");
        }

        scroll = EditorGUILayout.BeginScrollView(scroll);
        int n = Mathf.Min(TopCount, rows.Count);
        for (int i = 0; i < n; i++)
        {
            var r = rows[i];
            using (new EditorGUILayout.HorizontalScope())
            {
                if (GUILayout.Button(r.Path, EditorStyles.linkLabel, GUILayout.Width(320)))
                    Selection.activeObject = AssetDatabase.LoadAssetAtPath<Texture2D>(r.Path);

                GUILayout.Label($"{r.Size.x}×{r.Size.y}", GUILayout.Width(90));
                GUILayout.Label($"{r.Bytes / (1024f * 1024f):0.0} MB", GUILayout.Width(70));

                var style = new GUIStyle(EditorStyles.label);
                if (!string.IsNullOrEmpty(r.Warn)) style.normal.textColor = new Color(1f, 0.55f, 0.55f);
                GUILayout.Label(string.IsNullOrEmpty(r.Warn) ? "—" : r.Warn, style);
            }
        }
        EditorGUILayout.EndScrollView();
    }
}
```

**Chạy thử**
- `Tools > Audit > Texture Memory` → cửa sổ hiện tổng dung lượng và 40 texture nặng nhất. Bấm một dòng để chọn asset và sửa import settings ngay.
- Tìm dòng có cảnh báo **Read/Write BẬT**: tắt nó rồi quét lại — con số của texture đó giảm khoảng một nửa. Đây thường là khoản tiết kiệm lớn nhất mà không mất gì về hình ảnh.
- Tìm sprite UI còn mipmap: tắt và quét lại, giảm ~33%.
- So tổng trước và sau một buổi dọn import settings; rồi **đối chiếu với snapshot Memory Profiler trên bản build** — con số Editor và con số thiết bị khác nhau, nhưng **thứ tự xếp hạng** thì gần như luôn giống, và đó là thứ bạn cần để quyết định cắt gì.
- Mở rộng thêm nếu muốn: quét `AudioClip` (bắt `Decompress On Load` trên clip dài) và `Mesh` (bắt `Read/Write` bật) — cùng một khung, đổi `t:Texture2D` thành `t:AudioClip` hoặc `t:Mesh`.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Một texture 2048×2048 chiếm bao nhiêu RAM?**
  → Tính bằng `rộng × cao × bit mỗi pixel / 8 × 1,33` (1,33 là mipmap). RGBA32 không nén là **21 MB**; cùng texture đó ở **ASTC 6×6 chỉ 2,5 MB**. Đó là lý do định dạng nén là công tắc đầu tiên phải kiểm, trước mọi thứ khác.
- `Junior` **Crunch Compression có giảm RAM không?**
  → Không. Crunch chỉ nén trên **ổ đĩa** và được giải nén khi nạp, nên nó giảm kích cỡ tải về chứ RAM lúc chạy không đổi. ASTC/ETC2 thì ngược lại — GPU đọc thẳng dạng nén nên giảm **cả hai**. Nhầm hai thứ này là nhầm rất phổ biến.
- `Junior` **`Read/Write Enabled` làm gì?**
  → Nó giữ thêm một bản của texture hoặc mesh trên RAM để CPU đọc được, tức là **gấp đôi bộ nhớ**. Chỉ bật khi bạn thật sự đọc pixel hoặc đỉnh bằng code. Đây là một trong ba công tắc đắt nhất và cũng là thứ dễ bật nhầm nhất khi copy import settings.
- `Mid` **Game bị hệ điều hành kill nhưng không có crash log. Chẩn đoán?**
  → Đó là chữ ký của **hết bộ nhớ**: app biến mất sạch, không stack trace, tỉ lệ tăng theo **thời lượng phiên chơi** và tập trung ở máy RAM thấp. Tôi sẽ nhìn biểu đồ bộ nhớ theo thời gian chứ không đi tìm lỗi logic, và so hai snapshot Memory Profiler cách nhau 15 phút chơi.
- `Mid` **Đổi scene mà RAM không xuống. Vì sao?**
  → Vì còn tham chiếu giữ asset lại: trường `static`, ScriptableObject trỏ tới prefab, handle Addressables chưa `Release`, object `DontDestroyOnLoad`, hoặc material nhân bản bằng `renderer.material` chưa `Destroy`. Và nhớ **unload scene không tự giải phóng asset** — asset chỉ rời RAM khi hết tham chiếu *và* `Resources.UnloadUnusedAssets()` chạy.
- `Mid` **Ba loại bộ nhớ trong Unity là gì?**
  → **Managed** (GC heap cho object C#), **native** (texture, mesh, audio, animation, RenderTexture — do engine giữ), và **đồ hoạ** (bản trên GPU, trên mobile dùng chung RAM). Native thường chiếm phần lớn, và `GC.Collect()` **không** đụng tới nó — nhiều buổi đi tìm rò rỉ thực ra là tìm nhầm loại.
- `Senior` **Ngân sách bộ nhớ của anh là bao nhiêu, và dựa vào đâu?**
  → Quy tắc ngón tay cái: nhắm **một phần ba tới một nửa RAM máy**, lấy máy yếu nhất trong danh sách hỗ trợ làm mốc — máy 3 GB thì khoảng 1 GB. Nhưng con số phải **đo trên thiết bị thật** vì hệ điều hành và app nền cũng ăn phần. Tôi gắn overlay hiện `System Used Memory` để cả đội thấy nó hằng ngày, thay vì biết vào tuần cuối trước phát hành.
- `Senior` **RAM ổn định vẫn trong ngân sách mà máy vẫn kill app. Vì sao?**
  → Vì hệ điều hành nhìn mức **đỉnh**, và đỉnh thường rơi vào lúc **chuyển màn** — màn cũ chưa giải phóng mà màn mới đã nạp. Cách chữa là dựng thứ tự: unload màn cũ, `UnloadUnusedAssets` ở màn hình loading, rồi mới nạp màn mới; hoặc dùng một scene trung gian nhẹ để cắt đỉnh.
- `Senior` **`Resources.UnloadUnusedAssets()` gọi lúc nào?**
  → Ở **màn hình loading**, không phải giữa gameplay: nó quét toàn bộ tham chiếu nên gây khựng cả trăm mili giây, đủ để thành ANR trên máy yếu. Nó cũng chỉ giải phóng thứ **không còn tham chiếu**, nên nếu một trường `static` còn giữ thì gọi bao nhiêu lần cũng vô ích.

**Khung trả lời 60 giây** — "App bị kill vì hết RAM, anh cắt ở đâu trước?"

> Trước hết tách số ra ba loại — managed, native, đồ hoạ — vì ba loại này chữa bằng ba cách khác nhau, và người ta hay soi GC heap 40 MB trong khi 700 MB texture đang nằm im. Native gần như luôn là phần lớn.
>
> Trong native thì **texture đứng đầu**, nên tôi kiểm ba công tắc theo thứ tự: định dạng nén (2048² RGBA32 là 21 MB, ASTC 6×6 chỉ 2,5 MB), `Max Size` đúng nhu cầu hiển thị — giảm một nửa là bớt 75% — và `Read/Write Enabled` bật thừa thì nhân đôi. Sau đó tới audio: nhạc phải `Streaming`, không `Decompress On Load`.
>
> Phần thứ hai của câu hỏi là **ai đang giữ**: nếu RAM tăng dần theo thời gian chơi thì đó là giữ chứ không phải nạp — tôi so hai snapshot Memory Profiler trên bản build, tìm cái tăng mà không nên tăng, rồi lần theo chuỗi tham chiếu. Nghi phạm quen mặt là `static`, ScriptableObject, handle Addressables chưa release, và material nhân bản.

**Họ sẽ đào tiếp**

- *"Vì sao đo trong Editor không đủ?"* → Editor giữ thêm asset của chính nó và thường dùng bản chưa nén, nên con số lệch theo hướng khó đoán. Editor dùng để **xếp hạng** cái nào nặng hơn cái nào; số tuyệt đối phải lấy từ snapshot trên bản build.
- *"Font tiếng Trung tốn bao nhiêu?"* → Một atlas TextMeshPro 4096² dạng alpha là khoảng **16 MB**, và CJK gần như luôn cần cỡ đó. Đây là khoản hay bị quên hoàn toàn cho tới lúc bản địa hoá.
- *"Mesh thì sao?"* → Số thuộc tính đỉnh nhân số đỉnh; `Read/Write` cũng nhân đôi; còn *Mesh Compression* chỉ ảnh hưởng **ổ đĩa**, không ảnh hưởng RAM — cùng một hiểu nhầm với Crunch.
- *"Làm sao phát hiện texture bị nhân bản?"* → Memory Profiler cho thấy cùng một texture xuất hiện nhiều bản; nguyên nhân thường là hai bundle Addressables cùng tham chiếu một asset chưa được đánh Addressable.

**Cờ đỏ**

- Gọi `GC.Collect()` như cách "giải phóng bộ nhớ" — nó không đụng native, và đẩy một spike vào đúng frame đó.
- Nhầm kích cỡ build với bộ nhớ lúc chạy.
- Đo RAM trên máy cao cấp rồi kết luận.
- `Resources.UnloadUnusedAssets()` giữa gameplay.
- Không biết ba loại bộ nhớ, gộp tất cả thành "RAM".

**Số / ví dụ nên thuộc**

- 2048² RGBA32 + mipmap = **21 MB**; ASTC 6×6 = **2,5 MB**.
- Công thức: `rộng × cao × bpp / 8 × 1,33`.
- Ngân sách: **~1/3 tới 1/2 RAM máy**; máy 3 GB ≈ 1 GB.
- Atlas TMP 4096² alpha ≈ **16 MB**; RenderTexture 1080p RGBA + depth ≈ 12 MB.
- Crunch = chỉ ổ đĩa. ASTC/ETC2 = cả ổ đĩa lẫn RAM.
