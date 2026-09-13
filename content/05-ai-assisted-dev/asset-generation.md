---
title: Sinh Asset bằng AI
icon: 🎨
summary: Sprite, âm thanh, nhạc, 3D — công cụ, giới hạn, và vấn đề nhất quán phong cách.
status: deep
read: 590
level: advanced
order: 50
tags: [ai-dev, asset, art]
related: [ai-workflow, game-feel]
---

Sinh asset bằng AI là mảng có khoảng cách lớn nhất giữa **ấn tượng ban đầu** và **giá trị thực tế**. Một ảnh đẹp sinh trong mười giây tạo cảm giác vấn đề art đã được giải quyết. Nhưng game không cần một ảnh đẹp — nó cần năm mươi ảnh **trông như cùng một người vẽ**, và đó là bài toán hoàn toàn khác.

## Nhất quán là vấn đề chính, không phải chất lượng

**Một sprite đơn lẻ trông ổn. Hai mươi sprite cho cùng một game thì trông như hai mươi game khác nhau.** Kỹ thuật giảm thiểu: cố định seed, dùng ảnh tham chiếu, giới hạn bảng màu, và luôn có một bước xử lý hậu kỳ thống nhất.

Lý do sâu hơn đáng hiểu: mỗi lần sinh là một mẫu độc lập rút từ phân phối. Không có gì trong quá trình đó ràng buộc mẫu thứ hai phải khớp với mẫu thứ nhất — độ dày nét, độ bão hoà, hướng nguồn sáng, tỉ lệ đầu-thân đều trôi tự do. Người xem không chỉ ra được chi tiết nào sai, nhưng nhận ra ngay tổng thể không thuộc về nhau.

Hệ quả: **nhất quán không đến từ prompt, nó đến từ ràng buộc áp sau khi sinh.**

<figure class="fig">
<svg viewBox="0 0 660 232" role="img" aria-label="Hai quy trình: sinh asset rồi dùng thẳng cho ra phong cách lệch, so với sinh asset qua pipeline hậu kỳ cho ra phong cách thống nhất">
  <text x="16" y="28" class="fig-muted" font-size="11">Không có pipeline</text>
  <rect x="150" y="16" width="56" height="34" rx="5" fill="#ff8787" opacity="0.20"/>
  <rect x="214" y="16" width="56" height="34" rx="5" fill="#ffd43b" opacity="0.28"/>
  <rect x="278" y="16" width="56" height="34" rx="5" fill="#6ea8fe" opacity="0.20"/>
  <rect x="342" y="16" width="56" height="34" rx="5" fill="#b197fc" opacity="0.26"/>
  <path d="M404 33 L438 33" class="fig-line"/>
  <path d="M432 28 L444 33 L432 38 Z" class="fig-line" fill="currentColor"/>
  <text x="452" y="30" font-size="11" fill="#ff8787">20 sprite = 20 phong cách</text>
  <text x="452" y="46" class="fig-muted" font-size="10">sửa tay từng cái, không mở rộng được</text>
  <line x1="16" y1="74" x2="644" y2="74" class="fig-line"/>
  <text x="16" y="104" class="fig-muted" font-size="11">Có pipeline</text>
  <rect x="150" y="92" width="56" height="34" rx="5" fill="#ff8787" opacity="0.20"/>
  <rect x="214" y="92" width="56" height="34" rx="5" fill="#ffd43b" opacity="0.28"/>
  <rect x="278" y="92" width="56" height="34" rx="5" fill="#6ea8fe" opacity="0.20"/>
  <rect x="342" y="92" width="56" height="34" rx="5" fill="#b197fc" opacity="0.26"/>
  <path d="M404 109 L436 109" class="fig-line"/>
  <path d="M430 104 L442 109 L430 114 Z" class="fig-line" fill="currentColor"/>
  <rect x="448" y="88" width="112" height="42" rx="6" class="fig-box"/>
  <text x="504" y="105" text-anchor="middle" class="fig-label" font-size="11">Hậu kỳ tự động</text>
  <text x="504" y="120" text-anchor="middle" class="fig-muted" font-size="9">palette · viền · PPU · pivot</text>
  <path d="M566 109 L594 109" class="fig-line"/>
  <path d="M588 104 L600 109 L588 114 Z" class="fig-line" fill="currentColor"/>
  <rect x="606" y="92" width="16" height="34" rx="3" fill="#51cf9b" opacity="0.32"/>
  <rect x="624" y="92" width="16" height="34" rx="3" fill="#51cf9b" opacity="0.32"/>
  <text x="330" y="164" text-anchor="middle" class="fig-label" font-size="12">Dựng pipeline TRƯỚC, sinh asset SAU</text>
  <text x="330" y="186" text-anchor="middle" class="fig-muted" font-size="10">làm ngược lại nghĩa là bạn có 50 file phải xử lý bằng tay,</text>
  <text x="330" y="202" text-anchor="middle" class="fig-muted" font-size="10">và mỗi lần đổi ý về phong cách là làm lại từ đầu</text>
</svg>
<figcaption>Prompt kiểm soát nội dung; pipeline kiểm soát phong cách. Đội nào cũng đầu tư vào vế đầu và bỏ qua vế sau, rồi kết luận rằng AI "chưa dùng được cho art".</figcaption>
</figure>

## Bốn loại asset, bốn mức khả thi

Mức dùng được khác nhau rất xa giữa các loại, và biết thứ tự này giúp bạn đặt công sức đúng chỗ:

| Loại | Dùng được ngay tới đâu | Nút thắt thật |
|---|---|---|
| **SFX** | cao — thường chỉ cần chỉnh nhẹ | gần như không có; tai người khoan dung với biến thể |
| **Nhạc nền** | khá — hợp cho nhạc nền không có chủ đề rõ | khó khớp với [[adaptive-music]] vì cần stem tách lớp |
| **Texture / tileset** | trung bình | tính liền mạch và khớp lưới |
| **Sprite 2D có nhân vật** | thấp | nhất quán nhân vật giữa các khung hình và các tư thế |
| **Mô hình 3D** | thấp nhất | topology, UV, rigging — phần khó nhất của 3D không nằm ở hình dáng |

**Âm thanh dễ hơn hình ảnh.** SFX sinh tự động thường dùng được ngay sau chút chỉnh sửa, vì tai người khoan dung với biến thể hơn mắt. Đây là chỗ đáng thử trước.

Về 3D, điểm hay bị hiểu nhầm: thứ tốn thời gian trong pipeline 3D không phải tạo ra hình dáng mà là làm cho nó **dùng được** — lưới sạch, UV hợp lý, số đa giác vừa ngân sách, xương gắn đúng. Một mô hình sinh tự động thường phải dựng lại phần lớn những thứ đó, nên thời gian tiết kiệm ít hơn vẻ ngoài nhiều.

## Pipeline hậu kỳ: nơi nhất quán thật sự đến từ

Đây là phần đáng đầu tư nhất, và cũng là phần duy nhất bạn **kiểm soát hoàn toàn**.

Một pipeline tối thiểu cho sprite 2D làm bốn việc, theo thứ tự:

1. **Ép về bảng màu cố định.** Đây là bước có tác dụng lớn nhất trên mỗi đơn vị công sức. Hai mươi ảnh dùng chung 16 màu lập tức trông như cùng một bộ, kể cả khi nét vẽ còn lệch.
2. **Chuẩn hoá kích thước và tỉ lệ.** Cùng PPU, cùng chiều cao nhân vật, cùng độ dày viền.
3. **Cắt và căn.** Bỏ viền trong suốt thừa, đặt pivot theo quy ước (chân nhân vật, tâm vật thể).
4. **Áp bộ lọc thống nhất.** Cùng mức tương phản, cùng cường độ viền ngoài. Chính bước cuối này gộp mọi thứ về một cảm giác chung.

Điểm quan trọng về quy trình: **pipeline phải chạy tự động mỗi khi có file mới**, không phải chạy tay một lần. Chạy tay nghĩa là asset thứ 51 sẽ khác 50 cái trước, và sáu tháng sau không ai nhớ các bước là gì.

Xem mục 🎮 phía dưới về cách hiện thực hoá bằng `AssetPostprocessor` trong Unity.

## Tileset và texture liền mạch

Tileset có một ràng buộc mà ảnh đơn không có: **các cạnh phải khớp nhau**. Mô hình sinh ảnh không biết gì về ràng buộc này, nên hầu như không bao giờ cho ra tile dùng được trực tiếp.

Ba cách xử lý, theo thứ tự thực dụng:

- **Sinh texture lớn rồi cắt.** Sinh một mảng nền 1024×1024 liền lạc, sau đó cắt thành tile. Các tile cạnh nhau khớp tự nhiên vì chúng vốn là một ảnh.
- **Sinh chất liệu, tự dựng cấu trúc.** Dùng AI cho phần bề mặt (đá, cỏ, gỗ) rồi tự dựng phần hình học của tile — góc, cạnh, chuyển tiếp. Phần khó của tileset là bộ chuyển tiếp, và phần đó nên làm bằng luật.
- **Làm liền mạch bằng hậu kỳ.** Kỹ thuật offset và vá vết nối, áp dụng tự động trong pipeline.

Với tileset dùng luật tự động, **bộ chuyển tiếp mới là thứ quyết định**, không phải từng ô riêng lẻ. Một bộ 47 ô chuyển tiếp nhất quán quan trọng hơn 200 ô đẹp mà không khớp nhau.

## Quy trình lai: AI dựng nháp, người chỉnh

Cách dùng cho kết quả tốt nhất hiện nay không phải "AI làm hết" mà là phân vai theo **chỗ mỗi bên mạnh**:

| Giai đoạn | Ai làm | Vì sao |
|---|---|---|
| Khám phá hướng nghệ thuật | AI | sinh 50 biến thể trong một buổi để chọn hướng — nhanh hơn mọi cách khác |
| Chốt một asset "chuẩn" | **Người** | đây là thứ mọi asset sau sẽ bị so vào |
| Sinh hàng loạt theo chuẩn đó | AI | có tham chiếu thì độ trôi giảm hẳn |
| Ép nhất quán | Pipeline | tự động, không phải việc của người |
| Sửa những cái pipeline không cứu được | Người | thường là 10–20% số asset |
| Asset quan trọng nhất (nhân vật chính, biểu tượng) | **Người** | người chơi nhìn chúng hàng nghìn lần |

Bước hai là bước hay bị bỏ qua và đắt nhất khi bỏ qua: không có một asset chuẩn đã duyệt thì không có gì để đối chiếu, và "nhất quán" trở thành cảm giác chứ không phải tiêu chí.

**Asset tạm tốt hơn asset dở.** Ở giai đoạn prototype, hình khối màu đơn giản còn rõ ràng hơn art AI nửa vời — và không làm bạn bị gắn bó với thứ sẽ phải bỏ đi. Xem [[prototyping]].

## Giấy phép: việc phải tự xác minh

**Kiểm tra giấy phép nghiêm túc trước khi thương mại hoá.** Điều khoản của từng công cụ khác nhau và thay đổi theo thời gian; một số nền tảng phân phối có yêu cầu công bố riêng. Đây là việc phải tự xác minh với nguồn chính thức tại thời điểm phát hành, không nên dựa vào ghi nhớ.

Những câu cần trả lời được, cho **từng công cụ** bạn dùng:

- Điều khoản hiện tại nói gì về quyền thương mại hoá đầu ra?
- Gói dịch vụ bạn đang dùng có ảnh hưởng tới quyền đó không?
- Nền tảng phát hành đích có yêu cầu khai báo nội dung sinh bằng AI không?
- Bạn có lưu lại bằng chứng về quy trình tạo asset không, phòng khi cần chứng minh?

Một thói quen nên có từ đầu, rẻ và cứu nguy về sau: **ghi lại nguồn gốc từng asset** — công cụ nào, phiên bản nào, ngày nào, prompt gì. Một cột trong bảng tính là đủ. Sáu tháng sau, khi cần rà lại trước ngày phát hành, đó là thứ duy nhất trả lời được câu "file này từ đâu ra".

## Kiểm tra nhanh

- Bạn có **một asset chuẩn đã duyệt** để mọi asset khác đối chiếu không?
- Pipeline hậu kỳ đã có chưa, và nó chạy **tự động** hay chạy tay?
- Bảng màu đã cố định chưa? Bao nhiêu màu?
- Đặt 20 asset cạnh nhau: có cái nào lệch hẳn không?
- Asset nào người chơi nhìn nhiều nhất? Cái đó do người làm hay do máy?
- Với tileset: bộ chuyển tiếp có khớp không, hay chỉ từng ô đẹp?
- Đã ghi lại nguồn gốc từng asset chưa (công cụ, phiên bản, ngày)?
- Đã kiểm tra điều khoản hiện hành của từng công cụ với nguồn chính thức chưa?

## 🤖 Prompt cho AI

**Dùng AI thế nào cho asset**

Chia làm hai việc rất khác nhau, và việc thứ hai quan trọng hơn:

| Việc | AI làm | Ghi chú |
|---|---|---|
| **Sinh asset** | Công cụ sinh ảnh/âm thanh | Chất lượng từng cái thường ổn |
| **Ép về một phong cách** | Coding agent viết pipeline | Đây là chỗ quyết định |

Vấn đề thật không phải chất lượng một sprite mà là **nhất quán giữa 50 sprite**. Nên thứ đáng nhờ coding agent là *pipeline hậu kỳ* — `AssetPostprocessor` ép palette, PPU, viền, filter mode. Xem mục 🎮 phía dưới.

Trình tự đúng: **dựng pipeline trước, sinh asset sau.** Làm ngược lại nghĩa là bạn có 50 file phải xử lý bằng tay.

Vấn đề của asset sinh tự động là **nhất quán**, không phải chất lượng từng cái.

**Phải nêu rõ:**
- Bảng màu cố định (mã hex), giới hạn số màu
- Kích thước, góc nhìn, độ dày nét
- Ảnh tham chiếu hoặc một asset "chuẩn" đã duyệt
- Quy trình hậu kỳ thống nhất

**Mẫu prompt (cho phần quy trình, chạy bằng code)**

```
Viết script xử lý hậu kỳ cho sprite sinh tự động, để ép về cùng phong cách:

- Giảm về đúng bảng màu trong palette.json (16 màu), dùng dithering Bayer
- Cắt viền trong suốt, căn giữa theo bounding box
- Ép về canvas 64x64, giữ tỉ lệ, chân nhân vật chạm đáy
- Thêm viền ngoài 1px màu #1a1423
- Xuất kèm file .meta: pivot ở (0.5, 0), pixels-per-unit 64

Đầu vào: thư mục PNG. Đầu ra: thư mục đã chuẩn hoá + bảng đối chiếu trước/sau.
```

**Bẫy thường gặp:** sinh 20 sprite riêng lẻ rồi ghép lại — trông như 20 game khác nhau. Bảng màu cố định + hậu kỳ tự động là cách rẻ nhất để ép về một phong cách.

**Lưu ý:** điều khoản giấy phép của từng công cụ khác nhau và thay đổi theo thời gian. Trước khi phát hành thương mại, tự xác minh với nguồn chính thức tại thời điểm đó — đừng dựa vào ghi nhớ của AI hay của tài liệu này.

## 🎮 Unity

Trong Unity, phần khó không phải sinh asset — là **import nó vào mà không phá nhất quán**.

**Preset import cưỡng chế phong cách**

Xem [[art-direction]]. Điểm cốt lõi: đặt `TextureImporter` preset làm mặc định cho thư mục, để mọi asset mới (kể cả AI sinh) tự vào đúng khuôn.

**Pipeline xử lý hậu kỳ — AssetPostprocessor**

```csharp
// Chạy TỰ ĐỘNG mỗi lần có texture mới vào thư mục
public class ArtPostprocessor : AssetPostprocessor {
    void OnPreprocessTexture() {
        if (!assetPath.StartsWith("Assets/Art/Generated")) return;
        var ti = (TextureImporter)assetImporter;
        ti.spritePixelsPerUnit = 32;
        ti.filterMode = FilterMode.Point;
        ti.textureCompression = TextureImporterCompression.Uncompressed;
        ti.mipmapEnabled = false;
    }

    void OnPostprocessTexture(Texture2D tex) {
        if (!assetPath.StartsWith("Assets/Art/Generated")) return;
        QuantizeToPalette(tex);         // ép về palette dự án
    }
}
```

Đây là cách biến "nhất quán phong cách" từ kỷ luật con người thành cơ chế tự động. Thả 50 sprite AI sinh vào `Assets/Art/Generated/` là chúng tự về đúng palette và đúng PPU.

**SFX sinh tự động — import settings quan trọng hơn chất lượng clip**

Xem bảng ở [[unity-audio]]. Sai `Load Type` cho 200 SFX là cách nhanh nhất ăn hết RAM trên mobile.

**Asset tạm: hình khối màu tốt hơn art AI nửa vời**

Ở giai đoạn prototype, Unity có sẵn primitive và `Color`. Một `Cube` màu đỏ rõ ràng hơn một sprite AI sinh trông "gần giống quái vật" — và không làm bạn gắn bó với thứ sẽ phải bỏ.

**Giấy phép — kiểm tra trước khi ship**

Điều khoản từng công cụ khác nhau và thay đổi theo thời gian. Với Unity còn thêm một lớp: **Asset Store có điều khoản riêng** về việc redistribute. Đây là việc phải tự xác minh với nguồn chính thức tại thời điểm phát hành, không dựa vào ghi nhớ của AI hay của tài liệu này.

**Kiểm tra nhanh**
- Thả một PNG vào `Assets/Art/Generated/`: nó có tự về PPU 32 và palette không?
- Build mobile: dung lượng RAM cho texture và audio bao nhiêu?
- Có asset nào chưa rõ giấy phép trong build không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Loại asset nào dùng AI hiệu quả nhất? Loại nào kém nhất?**
  → Thứ tự khả thi: **SFX > nhạc nền > texture/tileset > sprite nhân vật > 3D**. SFX đứng đầu vì tai người khoan dung với biến thể hơn mắt, thường dùng được ngay sau chút chỉnh sửa. 3D đứng cuối. Nhạc nền khá cho nhạc chung nhưng khó cho nhạc thích ứng, vì cái đó cần stem tách lớp.
- `Junior` **Vì sao asset tạm (hình khối màu) tốt hơn art AI nửa vời cho prototype?**
  → Vì art nửa vời làm người xem đánh giá **thẩm mỹ** thay vì đánh giá cơ chế, và nó khoá cảm nhận về phong cách trước khi mình quyết định phong cách. Hình khối màu thì ai cũng hiểu là tạm, nên phản hồi rơi đúng vào thứ prototype đang hỏi.
- `Mid` **Loại lỗi nào của asset AI làm hỏng game nhiều nhất?**
  → **Nhất quán, không phải chất lượng.** Một sprite đơn lẻ trông ổn; hai mươi sprite cho cùng một game thì trông như hai mươi game khác nhau, vì mỗi lần sinh là một mẫu độc lập — độ dày nét, độ bão hoà, hướng nguồn sáng, tỉ lệ đầu-thân đều trôi tự do. Người xem không chỉ ra được chi tiết nào sai nhưng nhận ra ngay tổng thể không thuộc về nhau.
- `Mid` **Vì sao mô hình 3D sinh tự động ít tiết kiệm thời gian như kỳ vọng?**
  → Vì phần tốn thời gian trong pipeline 3D không phải tạo hình dáng mà là làm cho nó **dùng được**: lưới sạch, UV hợp lý, số đa giác vừa ngân sách, xương gắn đúng. Mô hình sinh tự động thường phải dựng lại phần lớn những thứ đó — nên cái tiết kiệm được là khâu rẻ nhất.
- `Mid` **Pipeline hậu kỳ gồm những bước nào, và bước nào đáng làm trước?**
  → Bốn bước: ép về **bảng màu cố định** → chuẩn hoá PPU và tỉ lệ → cắt và căn pivot → áp một bộ lọc thống nhất. Bảng màu có tác dụng lớn nhất trên mỗi đơn vị công sức: hai mươi ảnh dùng chung mười sáu màu lập tức trông như cùng một bộ. Nhất quán không đến từ prompt, nó đến từ ràng buộc áp **sau khi sinh**.
- `Senior` **Đội muốn dùng AI cho toàn bộ art. Anh tổ chức quy trình thế nào?**
  → Phân vai theo chỗ mỗi bên mạnh. AI khám phá hướng nghệ thuật — năm mươi biến thể trong một buổi. **Người chốt một asset chuẩn**, vì đó là thứ mọi asset sau bị so vào; đây cũng là bước hay bị bỏ qua nhất. AI sinh hàng loạt theo chuẩn đó, pipeline ép nhất quán, người sửa 10–20% phần pipeline không cứu được. Và asset quan trọng nhất — nhân vật chính, biểu tượng — do người làm.
- `Senior` **Làm tileset bằng AI kiểu gì cho các cạnh khớp nhau?**
  → Mô hình sinh ảnh không biết gì về ràng buộc cạnh phải khớp, nên đừng yêu cầu nó làm việc đó. Cách thực dụng nhất là **sinh một texture lớn rồi cắt** — các tile cạnh nhau khớp tự nhiên vì vốn là một ảnh. Hoặc dùng AI cho chất liệu bề mặt rồi tự dựng hình học bằng luật: phần khó của tileset là **bộ chuyển tiếp**, không phải từng ô.
- `Senior` **Trước khi phát hành thương mại, anh kiểm tra những gì về asset AI?**
  → Điều khoản **hiện hành** của từng công cụ, tra ở nguồn chính thức tại thời điểm đó vì chúng thay đổi; gói dịch vụ đang dùng có ảnh hưởng quyền thương mại hoá không; nền tảng phát hành có yêu cầu khai báo nội dung AI không. Và tôi **ghi nguồn gốc từng asset** ngay từ đầu — công cụ, phiên bản, ngày, prompt.
- `Senior` **Vì sao "dựng pipeline trước, sinh asset sau" lại là thứ tự bắt buộc?**
  → Vì làm ngược lại thì có năm mươi file phải xử lý bằng tay, và mỗi lần đổi ý về phong cách là làm lại từ đầu. Pipeline là thứ biến "sinh thêm một asset" từ một buổi thành vài phút. Đội nào sinh trước thường phát hiện điều này ở đúng lúc không còn thời gian để sửa.

**Khung trả lời 60 giây** — "Vấn đề lớn nhất của asset sinh bằng AI là gì?"

> **Nhất quán, không phải chất lượng.** Một sprite đơn lẻ trông ổn; hai mươi sprite cho cùng một game thì trông như hai mươi game khác nhau. Lý do là mỗi lần sinh là một mẫu độc lập — không có gì ràng buộc mẫu thứ hai khớp mẫu thứ nhất, nên độ dày nét, độ bão hoà, hướng nguồn sáng, tỉ lệ đầu-thân đều trôi tự do. Người xem không chỉ ra được chi tiết nào sai nhưng nhận ra ngay tổng thể không thuộc về nhau.
>
> Hệ quả quan trọng: **nhất quán không đến từ prompt, nó đến từ ràng buộc áp sau khi sinh.** Nên thứ tôi đầu tư là pipeline hậu kỳ: ép về bảng màu cố định, chuẩn hoá PPU và tỉ lệ, cắt căn pivot, rồi áp một bộ lọc thống nhất. Bước bảng màu có tác dụng lớn nhất trên mỗi đơn vị công sức — hai mươi ảnh dùng chung mười sáu màu lập tức trông như cùng một bộ.
>
> Và trình tự phải đúng: **dựng pipeline trước, sinh asset sau.** Làm ngược lại thì có năm mươi file phải xử lý bằng tay, và mỗi lần đổi ý về phong cách là làm lại từ đầu.

**Họ sẽ đào tiếp**

- *"Loại nào hiệu quả nhất?"* → SFX, vì tai người khoan dung với biến thể hơn mắt — thường dùng được ngay sau chút chỉnh sửa. Kém nhất là mô hình 3D. Nhạc nền thì khá cho nhạc nền chung, nhưng khó dùng cho nhạc thích ứng vì cái đó cần stem tách lớp.
- *"Vì sao 3D ít tiết kiệm?"* → Vì phần tốn thời gian trong pipeline 3D không phải tạo hình dáng mà là làm cho nó **dùng được**: lưới sạch, UV hợp lý, số đa giác vừa ngân sách, xương gắn đúng. Mô hình sinh tự động thường phải dựng lại phần lớn những thứ đó.
- *"Tổ chức quy trình cho cả đội thế nào?"* → Phân vai theo chỗ mỗi bên mạnh. AI khám phá hướng nghệ thuật — sinh năm mươi biến thể trong một buổi. **Người** chốt một asset chuẩn, vì đó là thứ mọi asset sau bị so vào. AI sinh hàng loạt theo chuẩn đó. Pipeline ép nhất quán. Người sửa phần pipeline không cứu được, thường mười tới hai mươi phần trăm. Và asset quan trọng nhất — nhân vật chính, biểu tượng — do người làm, vì người chơi nhìn chúng hàng nghìn lần.
- *"Bước nào hay bị bỏ qua nhất?"* → Chốt asset chuẩn. Không có nó thì không có gì để đối chiếu, và "nhất quán" trở thành cảm giác chứ không phải tiêu chí kiểm tra được.
- *"Tileset thì sao?"* → Mô hình sinh ảnh không biết gì về ràng buộc cạnh phải khớp. Cách thực dụng nhất là **sinh một texture lớn rồi cắt** — các tile cạnh nhau khớp tự nhiên vì vốn là một ảnh. Hoặc dùng AI cho chất liệu bề mặt rồi tự dựng phần hình học bằng luật, vì phần khó của tileset là **bộ chuyển tiếp** chứ không phải từng ô.
- *"Trước khi phát hành kiểm tra gì?"* → Điều khoản hiện hành của **từng công cụ** với nguồn chính thức tại thời điểm đó, vì chúng thay đổi; gói dịch vụ đang dùng có ảnh hưởng quyền thương mại hoá không; nền tảng phát hành có yêu cầu khai báo nội dung AI không. Và tôi giữ thói quen **ghi nguồn gốc từng asset** ngay từ đầu — công cụ, phiên bản, ngày, prompt. Một cột trong bảng tính, nhưng sáu tháng sau nó là thứ duy nhất trả lời được câu "file này từ đâu ra".

**Cờ đỏ**

- Đánh giá công cụ bằng một ảnh đẹp thay vì bằng hai mươi ảnh đặt cạnh nhau.
- Sinh hàng loạt asset trước khi có pipeline hậu kỳ.
- Không có asset chuẩn đã duyệt để đối chiếu.
- Dùng art AI nửa vời cho prototype thay vì hình khối màu.
- Giao asset quan trọng nhất của game cho máy.
- Trả lời câu hỏi giấy phép bằng trí nhớ thay vì bằng kiểm tra nguồn chính thức.

**Số / ví dụ nên thuộc**

- Thứ tự khả thi: **SFX > nhạc nền > texture/tileset > sprite nhân vật > 3D**.
- Pipeline **4 bước**: bảng màu → chuẩn hoá PPU/tỉ lệ → cắt & pivot → bộ lọc thống nhất.
- Bảng màu cố định (ví dụ **16 màu**) là bước hiệu quả nhất trên mỗi đơn vị công sức.
- Quy trình lai: người chốt **1 asset chuẩn**, AI sinh hàng loạt, người sửa **10–20%**.
- Tileset: **sinh lớn rồi cắt**; bộ chuyển tiếp quan trọng hơn từng ô.
- Nguyên tắc: **dựng pipeline trước, sinh asset sau**; và asset tạm tốt hơn asset dở.
