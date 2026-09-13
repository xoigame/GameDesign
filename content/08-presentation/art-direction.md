---
title: Art Direction
icon: 🖌️
summary: Định hướng nghệ thuật — bảng màu, silhouette, độ đọc được, và cách giữ nhất quán khi nhiều nguồn asset.
status: deep
read: 330
level: intermediate
order: 10
tags: [presentation, art, visual]
related: [level-design, ux-hud, accessibility, asset-generation]
---

Art direction **không phải** là "vẽ đẹp". Nó là tập ràng buộc khiến mọi asset trông như thuộc cùng một thế giới, và khiến người chơi đọc được tình huống trong một phần giây.

## Bắt đầu từ chức năng, không từ phong cách

Trước khi chọn pixel art hay low-poly, trả lời ba câu:

1. **Người chơi cần phân biệt gì trong 0.2 giây?** Bạn/thù, sát thương được/không, đi được/không, tương tác được/không.
2. **Bao nhiêu vật thể trên màn hình cùng lúc?** 5 hay 200? Quyết định mức chi tiết cho phép.
3. **Xem ở kích thước nào?** Nhân vật cao 40px trên điện thoại khác hẳn 400px trên PC.

Phong cách được chọn *sau* để phục vụ ba câu trên. Vampire Survivors dùng pixel art thô không phải vì thẩm mỹ — vì 300 thực thể cùng lúc cần silhouette cực gọn.

## Silhouette — kiểm tra quan trọng nhất

**Tô toàn bộ màn hình thành đen trắng thuần.** Nếu vẫn phân biệt được nhân vật, kẻ địch, vật phẩm và lối đi, thiết kế hình khối của bạn tốt.

Quy tắc thực hành:
- Mỗi loại kẻ địch có **hình bóng khác nhau ở kích thước thu nhỏ 32px**, không chỉ khác màu.
- Nhân vật người chơi phải có yếu tố silhouette độc nhất (mũ, vũ khí, tỉ lệ) không lặp ở NPC nào.
- Vật thể tương tác được có hình dạng riêng nhất quán trong toàn game.

Đây là kiểm tra rẻ nhất và bị bỏ qua nhiều nhất.

## Bảng màu — quyết định sớm, khó đổi

Cấu trúc thường dùng:

```
Nền           4-6 màu  — trầm, độ bão hoà thấp, tương phản thấp với nhau
Vật thể chơi  3-4 màu  — bão hoà cao hơn hẳn nền
Cảnh báo      1-2 màu  — CHỈ dùng cho nguy hiểm, không dùng ở đâu khác
Giao diện     2-3 màu  — tách biệt khỏi cả hai nhóm trên
```

**Luật then chốt: giữ một màu chỉ dành riêng cho nguy hiểm.** Nếu màu đỏ vừa là máu, vừa là nút bấm, vừa là trang trí tường, nó mất hết giá trị cảnh báo. Hades dùng đỏ gần như *chỉ* cho vùng sát thương.

Bão hoà và độ sáng hiệu quả hơn sắc độ trong việc tách nền/tiền cảnh — và vẫn hoạt động với người mù màu. Xem [[accessibility]].

## Giữ nhất quán khi nhiều nguồn

Vấn đề thật của dự án nhỏ: asset đến từ nhiều nơi (mua, tự vẽ, AI sinh, asset store). Cách ép về một phong cách:

- **Bảng màu cưỡng bức** — mọi asset đi qua bước giảm về đúng palette.
- **Độ dày nét thống nhất** — 1px hay 2px, chọn một.
- **Một nguồn sáng** — quyết định hướng sáng (thường trên-trái) và ép mọi asset theo.
- **Cùng pixels-per-unit / cùng tỉ lệ** — sai tỉ lệ là thứ mắt phát hiện ngay dù không gọi tên được.
- **Một lớp hậu kỳ chung** — cùng bộ lọc màu, cùng vignette, cùng grain. Che được nhiều khác biệt.

## Quyết định không sửa được về sau

Chốt từ đầu, vì đổi nghĩa là làm lại toàn bộ asset:

| Quyết định | Ví dụ |
|---|---|
| Độ phân giải tham chiếu | 1920×1080 · 640×360 cho pixel art |
| Pixels-per-unit | 16 · 32 · 64 |
| Tỉ lệ nhân vật | Cao mấy đầu · chiều cao tính bằng px |
| Góc nhìn | Side-on · top-down · isometric 2:1 |
| Bảng màu | Danh sách hex cố định |
| Hướng nguồn sáng | Trên-trái |

## 🤖 Prompt cho AI

AI **không có gu thẩm mỹ và không nhìn thấy game của bạn**. Nhưng nó rất giỏi ép ràng buộc và kiểm tra nhất quán — hãy dùng đúng chỗ đó.

**Phải nêu rõ:**
- Bảng màu bằng mã hex, không mô tả bằng lời ("tông lạnh" là vô nghĩa với máy)
- Độ phân giải tham chiếu + pixels-per-unit
- Hướng nguồn sáng, độ dày nét
- Màu nào dành riêng cho nguy hiểm (và bị cấm dùng ở chỗ khác)

**Mẫu prompt — công cụ kiểm tra, không phải vẽ**

```
Viết công cụ kiểm tra nhất quán art cho thư mục Assets/Art/.

Ràng buộc dự án:
- Palette: 16 màu trong palette.json. Mọi pixel PHẢI khớp một trong 16 màu.
- #E03131 là màu NGUY HIỂM, chỉ được xuất hiện trong Assets/Art/Hazards/
- Pixels-per-unit 32, canvas bội số của 16
- Nguồn sáng trên-trái: pixel sáng nhất phải nằm ở nửa trên-trái của sprite

Công cụ phải:
1. Quét mọi PNG, liệt kê file vi phạm từng ràng buộc
2. Với màu lệch palette, đề xuất màu gần nhất trong palette (khoảng cách CIEDE2000)
3. Xuất báo cáo HTML có preview trước/sau
4. Chế độ --fix tự quy màu về palette (ghi ra thư mục mới, KHÔNG ghi đè)

KHÔNG tự đổi palette. KHÔNG tự quyết ràng buộc nào "hợp lý hơn".
```

**Bẫy thường gặp:** nhờ AI "đề xuất bảng màu cho game fantasy" → nhận về 5 màu tím-vàng quen thuộc trong mọi tutorial. Bảng màu là quyết định nhận diện của game bạn; hãy tự chọn rồi bắt AI thi hành nó.

## 🎮 Unity

Art direction trong Unity là **ràng buộc được cưỡng chế bằng tool**, không phải bằng lời nhắc trong Notion.

**Nơi các quyết định sống**

- `Assets/Art/palette.json` hoặc một `PaletteAsset` (ScriptableObject) — nguồn chân lý cho màu
- `Assets/Settings/` — Sprite Atlas, import presets
- `Assets/Editor/ArtValidator.cs` — tool quét vi phạm

**Preset import — đặt một lần, khỏi sửa 200 lần**

`Project Settings > Editor > Asset Pipeline` rồi dùng **Preset** cho `TextureImporter`:

```
Sprite Mode        Single
Pixels Per Unit    32        ← phải khớp con số đã chốt, không đổi giữa dự án
Filter Mode        Point     (pixel art) / Bilinear (art mượt)
Compression        None      (pixel art) / High Quality
Generate Mip Maps  Tắt       cho sprite 2D
```

Đặt preset làm mặc định cho thư mục `Assets/Art/` bằng **Preset Manager**. Thiếu bước này thì mỗi sprite mới import với `Pixels Per Unit = 100` mặc định và tỉ lệ lệch — lỗi chỉ lộ ra khi ghép cảnh.

**Cưỡng chế palette bằng editor tool**

```csharp
[MenuItem("Tools/Art/Validate Palette")]
static void Validate() {
    var palette = AssetDatabase.LoadAssetAtPath<PaletteAsset>("Assets/Art/Palette.asset");
    foreach (var guid in AssetDatabase.FindAssets("t:Texture2D", new[] { "Assets/Art" })) {
        var path = AssetDatabase.GUIDToAssetPath(guid);
        var tex = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
        foreach (var c in tex.GetPixels32()) {
            if (c.a < 8) continue;
            if (!palette.Contains(c))
                Debug.LogWarning($"Màu ngoài palette trong {path}: #{ColorUtility.ToHtmlStringRGB(c)}", tex);
        }
    }
}
```

`GetPixels32` cần texture có `Read/Write Enabled` — bật trong preset cho thư mục Art, và nhớ là nó tăng RAM nên tắt trước khi ship.

**Test silhouette ngay trong Editor**

Cách nhanh nhất: tạo một `Volume` với **Color Adjustments → Saturation = -100** (URP), gán vào một Camera phụ, bật khi cần. Ba mươi giây setup và bạn có bài test silhouette bất cứ lúc nào. Xem [[unity-lighting]] về Volume và post-processing.

**Bẫy Unity cụ thể**
- **Color space Gamma** làm mọi màu blend sai. Đổi sang Linear từ ngày đầu — xem [[unity-lighting]].
- **Sprite Atlas thiếu** → mỗi sprite một draw call. Xem [[unity-ui]].
- **Pixels Per Unit khác nhau giữa các sprite** → cùng một nhân vật to nhỏ bất thường giữa các scene.

**Kiểm tra nhanh**
- Chạy Validate Palette: có màu nào ngoài palette không?
- Bật Volume saturation -100: còn phân biệt được nhân vật với nền không?
- Frame Debugger: bao nhiêu draw call cho sprite? (nên gom hết vào 1–2 atlas)

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Art direction là gì, nếu không phải là "vẽ đẹp"?**
  → Là **tập ràng buộc** khiến mọi asset trông như thuộc cùng một thế giới, và khiến người chơi **đọc được tình huống trong một phần giây**. Nói cách khác nó là quyết định về chức năng trước, thẩm mỹ sau — và đó là lý do một art direction tốt có thể trông rất đơn giản.
- `Junior` **Ba câu hỏi phải trả lời trước khi chọn phong cách?**
  → **Người chơi cần phân biệt gì trong 0,2 giây?** (bạn/thù, sát thương được/không, đi được/không). **Bao nhiêu vật thể trên màn hình cùng lúc?** — 5 hay 200, quyết định mức chi tiết cho phép. **Xem ở kích thước nào?** — nhân vật cao 40px trên điện thoại khác hẳn 400px trên PC. Phong cách được chọn *sau* để phục vụ ba câu đó.
- `Junior` **Test silhouette làm thế nào và kiểm cái gì?**
  → Tô toàn bộ màn hình thành **đen trắng thuần** rồi xem còn phân biệt được nhân vật, kẻ địch, vật phẩm và lối đi không. Cụ thể hơn: mỗi loại kẻ địch phải khác hình bóng **ở 32px**, nhân vật người chơi phải có yếu tố silhouette độc nhất không lặp ở NPC nào. Đây là kiểm tra rẻ nhất và bị bỏ qua nhiều nhất.
- `Mid` **Luật then chốt về bảng màu là gì?**
  → **Giữ một màu chỉ dành riêng cho nguy hiểm.** Nếu đỏ vừa là máu, vừa là nút bấm, vừa là trang trí tường thì nó mất hết giá trị cảnh báo — Hades dùng đỏ gần như *chỉ* cho vùng sát thương. Và tách nền với tiền cảnh bằng **bão hoà và độ sáng** hiệu quả hơn bằng sắc độ, đồng thời vẫn hoạt động với người mù màu.
- `Mid` **Vampire Survivors chọn pixel art thô vì lý do gì?**
  → Không phải vì thẩm mỹ mà vì **300 thực thể cùng lúc cần silhouette cực gọn**. Đây là ví dụ mẫu cho nguyên tắc "chức năng trước, phong cách sau": số lượng vật thể trên màn hình là ràng buộc, và phong cách là câu trả lời cho ràng buộc đó.
- `Mid` **Asset đến từ nhiều nguồn — ép về một phong cách thế nào?**
  → Năm việc: **bảng màu cưỡng bức** (mọi asset đi qua bước giảm về đúng palette), **độ dày nét thống nhất**, **một hướng nguồn sáng** (thường trên-trái) ép cho mọi asset, **cùng pixels-per-unit và cùng tỉ lệ** — sai tỉ lệ là thứ mắt phát hiện ngay dù không gọi tên được — và **một lớp hậu kỳ chung** che được nhiều khác biệt còn lại.
- `Senior` **Quyết định nào về art phải chốt từ đầu vì đổi sau là làm lại toàn bộ asset?**
  → Sáu: **độ phân giải tham chiếu**, **pixels-per-unit**, **tỉ lệ nhân vật**, **góc nhìn** (side-on / top-down / isometric 2:1), **bảng màu** dưới dạng danh sách hex cố định, và **hướng nguồn sáng**. Đây cũng đúng là danh sách cần nằm trong tài liệu cho người ngoài và cho công cụ sinh asset.
- `Senior` **Art direction gặp trợ năng ở đâu?**
  → Ở chỗ **mã hoá kép**: phân biệt quan trọng phải dùng màu cộng hình dạng, và đó là quyết định của art chứ không phải của UI. Cũng ở chỗ tách nền/tiền cảnh bằng độ sáng và bão hoà thay vì sắc độ — cách đó vừa đọc được với người mù màu vừa đọc được trên màn hình ngoài nắng. Làm đúng từ đầu thì gần như miễn phí; sửa sau là vẽ lại asset.
- `Senior` **Dùng asset sinh bằng AI mà vẫn giữ nhất quán — anh làm thế nào?**
  → Chốt **một asset chuẩn do người làm** để mọi thứ sau bị so vào, rồi dựng **pipeline hậu kỳ trước khi sinh hàng loạt**: ép về bảng màu cố định, chuẩn hoá PPU và tỉ lệ, cắt và căn pivot, áp một bộ lọc thống nhất. Nhất quán **không đến từ prompt**, nó đến từ ràng buộc áp sau khi sinh — và bảng màu là bước có tác dụng lớn nhất trên mỗi đơn vị công sức.

**Khung trả lời 60 giây** — "Anh dựng art direction cho một game thế nào?"

> Bắt đầu từ **chức năng, không từ phong cách**. Ba câu hỏi trước tiên: người chơi cần phân biệt gì trong hai phần mười giây, có bao nhiêu vật thể trên màn hình cùng lúc, và nó được xem ở kích thước nào. Phong cách chọn sau để phục vụ ba câu đó — Vampire Survivors dùng pixel art thô không vì thẩm mỹ mà vì ba trăm thực thể cùng lúc cần silhouette cực gọn.
>
> Kiểm tra tôi chạy thường xuyên nhất là **silhouette**: tô màn hình thành đen trắng thuần, còn phân biệt được nhân vật, địch, vật phẩm và lối đi thì đạt. Mỗi loại địch phải khác hình bóng ở 32px, không chỉ khác màu.
>
> Về màu, luật then chốt là **giữ một màu chỉ dành cho nguy hiểm** — đỏ mà vừa là máu vừa là trang trí thì mất giá trị cảnh báo. Và tôi chốt sớm sáu thứ không sửa được về sau: độ phân giải tham chiếu, pixels-per-unit, tỉ lệ nhân vật, góc nhìn, danh sách màu hex, và hướng nguồn sáng.

**Họ sẽ đào tiếp**

- *"Vì sao độ sáng và bão hoà tách nền tốt hơn sắc độ?"* → Vì mắt người nhạy với độ sáng hơn nhiều so với sắc độ, và vì **8% nam giới mù màu đỏ-lục** nên sắc độ không đáng tin làm kênh duy nhất. Tách bằng độ sáng còn sống sót qua màn hình kém, ánh nắng, và ảnh chụp màn hình bị nén.
- *"Silhouette khác biệt ở 32px nghĩa là gì trong thực tế?"* → Nghĩa là khác ở **tỉ lệ và đường viền ngoài**: cao gầy với thấp bè, có sừng với tròn trịa, vũ khí chĩa ngang với tay không. Chi tiết bên trong biến mất hết ở kích thước đó, nên thứ duy nhất còn lại là đường bao — và đó chính là thứ người chơi nhận ra trong một phần giây.
- *"Đổi bảng màu giữa dự án thì tốn gì?"* → Tốn theo cấp số: mọi asset đã vẽ, mọi hiệu ứng, mọi UI đã cân, và mọi ảnh quảng bá đã duyệt. Đó là lý do bảng màu nằm trong nhóm quyết định chốt sớm. Nếu buộc phải đổi thì cách rẻ nhất là **một lớp hậu kỳ chung** thay vì sửa từng asset — chấp nhận kết quả gần đúng.
- *"Dùng AI ở khâu này thế nào?"* → Nó rất tốt ở **khám phá hướng** — sinh năm mươi biến thể trong một buổi để chọn — và ở **pipeline hậu kỳ** ép nhất quán. Việc không giao là chốt asset chuẩn, vì đó là thứ mọi asset sau bị so vào và nó quyết định bản sắc của game.

**Cờ đỏ**

- Chọn phong cách trước khi biết có bao nhiêu vật thể trên màn hình.
- Phân biệt kẻ địch chỉ bằng màu.
- Không có màu nào dành riêng cho nguy hiểm.
- Chưa từng chạy test silhouette.
- Trộn asset nhiều nguồn mà không có bảng màu cưỡng bức và không thống nhất hướng sáng.

**Số / ví dụ nên thuộc**

- Ba câu hỏi trước khi chọn phong cách: **phân biệt gì trong 0,2 s · bao nhiêu vật thể · xem ở kích thước nào**.
- Silhouette khác biệt **ở 32px**; test bằng **đen trắng thuần**.
- **Một màu dành riêng cho nguy hiểm** — Hades dùng đỏ gần như chỉ cho vùng sát thương.
- Sáu quyết định chốt sớm: **độ phân giải tham chiếu · PPU · tỉ lệ nhân vật · góc nhìn · bảng màu hex · hướng sáng**.
- Ép nhất quán nhiều nguồn: **palette cưỡng bức · độ dày nét · một nguồn sáng · cùng PPU · lớp hậu kỳ chung**.
