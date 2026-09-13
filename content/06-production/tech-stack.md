---
title: Chọn Tech Stack
icon: 🔧
summary: Engine, ngôn ngữ, công cụ — chọn theo dự án và theo mức độ AI hỗ trợ được.
status: deep
read: 570
level: intermediate
order: 40
tags: [production, tooling]
related: [architecture-patterns, performance, ai-workflow]
---

Chọn engine là quyết định **khó đảo ngược nhất** trong cả dự án, và nó thường được đưa ra vào lúc bạn biết ít nhất về dự án — tuần đầu tiên.

Điều đó nghe đáng sợ hơn thực tế, vì có một lối thoát: phần lớn dự án indie thất bại không phải vì chọn sai engine mà vì **không hoàn thành**. Nên tiêu chí thực dụng nhất thường là "cái nào giúp tôi ra được bản chơi thử sớm nhất", chứ không phải "cái nào mạnh nhất".

## Bốn engine, bốn vùng hợp lý

| | Hợp nhất với | Điểm mạnh thật | Trả giá ở đâu |
|---|---|---|---|
| **Unity** | 2D và 3D tầm trung, mobile, XR | hệ sinh thái lớn nhất, asset store, tài liệu nhiều nhất | phình to theo thời gian; nhiều cách làm cùng một việc |
| **Godot** | 2D, dự án nhỏ và vừa, người thích gọn | nhẹ, mở nguồn, **scene là file text** | hệ sinh thái nhỏ hơn; 3D cao cấp còn non |
| **Unreal** | 3D chất lượng cao, đội có nghệ sĩ | dựng hình đứng đầu, công cụ cho nghệ sĩ tốt | nặng; C++ chậm biên dịch; blueprint là binary |
| **Web** (Phaser, three.js) | game nhỏ, prototype, chơi ngay trong trình duyệt | phân phối bằng một đường link, không cần cài | hiệu năng trần thấp, cửa hàng app khó vào |

Bảng này cố ý không có cột "tốt nhất". Câu hỏi đúng luôn là *tốt nhất cho dự án nào, đội nào, nền tảng nào*.

Về **giấy phép và phí bản quyền**: điều khoản của các engine thương mại đã thay đổi vài lần trong những năm gần đây, có lần thay đổi lớn và gây tranh cãi. Đây là thứ phải kiểm tra tại nguồn chính thức **vào thời điểm bạn quyết định**, và nên tính cả kịch bản điều khoản đổi giữa chừng — với dự án nhiều năm, đó không phải giả định xa vời.

## Tiêu chí chọn, theo thứ tự trọng lượng

Sắp theo mức ảnh hưởng thực tế tới khả năng hoàn thành dự án:

1. **Kinh nghiệm sẵn có của đội.** Tiêu chí nặng nhất, và hay bị coi nhẹ nhất. Một engine "kém hơn" mà đội đã thạo gần như luôn thắng một engine "tốt hơn" phải học từ đầu — vì thời gian học không chỉ là thời gian học, nó còn là thời gian mắc những lỗi mà cộng đồng đã biết cách tránh.
2. **Nền tảng đích.** Một số nền tảng loại hẳn một số lựa chọn. Quyết định này phải chốt **trước** khi chọn engine, không phải sau.
3. **Quy mô và thể loại.** 2D hay 3D, mấy trăm hay mấy chục nghìn thực thể, đơn hay nhiều người chơi. Xem [[performance]] về những ngưỡng làm đổi kiến trúc.
4. **Mức độ agent can thiệp được.** Tiêu chí mới, và với đội làm cùng AI thì nó đã nặng ngang tiêu chí 3.
5. **Giấy phép và chi phí.** Quan trọng, nhưng thường chỉ thành yếu tố quyết định ở quy mô lớn.

Hai tiêu chí hay được nêu mà thực tế ít có trọng lượng: *engine nào có nhiều tính năng hơn* (bạn sẽ dùng một phần nhỏ), và *engine nào hiện đại hơn* (dự án của bạn sống lâu hơn chu kỳ thời thượng).

## Tiêu chí mới: agent sửa được tới đâu

**Một tiêu chí mới đáng cân nhắc: AI hỗ trợ engine này tốt tới đâu?**

Yếu tố ảnh hưởng trực tiếp tới năng suất khi làm việc với agent:
- Lượng tài liệu và code công khai của engine (engine phổ biến → AI viết chính xác hơn).
- Ngôn ngữ có kiểm tra kiểu tĩnh giúp phát hiện lỗi AI sinh ra sớm hơn.
- Engine có API ổn định thì ít gặp vấn đề model dùng API đã lỗi thời.
- Dự án dạng text (scene là file text) thì AI đọc/sửa được; dự án dạng binary thì không.

Điểm cuối đáng chú ý: Godot lưu scene dưới dạng text nên agent có thể đọc và sửa trực tiếp. Unity dùng YAML nên đọc được nhưng dễ hỏng nếu sửa tay. Với Unreal, blueprint là binary — agent gần như không can thiệp được, phải làm qua C++.

Hệ quả kiến trúc quan trọng hơn bản thân việc chọn engine: **đẩy càng nhiều quyết định vào code và dữ liệu dạng text càng tốt.** Logic nằm trong file text là phần agent làm được; logic nằm trong asset của editor là phần bạn phải tự làm, bất kể engine nào. Đây cũng chính là lập luận của [[data-driven-design]], nhưng với một lý do mới.

**Luôn nêu rõ phiên bản engine trong prompt.** Tri thức của model có thời điểm cắt; engine thì cập nhật liên tục. Không nêu phiên bản là nguồn lỗi "API không tồn tại" phổ biến nhất.

## Chi phí chuyển engine giữa chừng

Chi phí này không tăng tuyến tính theo thời gian — nó tăng theo lượng **tri thức đã đông cứng vào công cụ**: prefab, animator, cảnh dựng sẵn, thiết lập dự án, quy trình build, và thói quen của đội.

<figure class="fig">
<svg viewBox="0 0 660 236" role="img" aria-label="Đồ thị chi phí chuyển engine tăng nhanh theo tháng dự án, chia ba vùng: còn đổi được, đắt, và không đổi nữa">
  <line x1="70" y1="26" x2="70" y2="176" class="fig-line"/>
  <line x1="70" y1="176" x2="632" y2="176" class="fig-line"/>
  <text x="14" y="34" class="fig-muted" font-size="10">chi phí</text>
  <text x="14" y="48" class="fig-muted" font-size="10">chuyển</text>
  <rect x="70" y="26" width="132" height="150" fill="#51cf9b" opacity="0.10"/>
  <rect x="202" y="26" width="168" height="150" fill="#ffd43b" opacity="0.10"/>
  <rect x="370" y="26" width="262" height="150" fill="#ff8787" opacity="0.10"/>
  <path d="M70 172 L118 166 L164 156 L202 142 L250 120 L300 94 L370 62 L440 42 L520 32 L632 28" stroke="#6ea8fe" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
  <text x="136" y="200" text-anchor="middle" font-size="11" fill="#51cf9b">Tháng 0–2</text>
  <text x="136" y="216" text-anchor="middle" class="fig-muted" font-size="10">còn đổi được — cứ đổi</text>
  <text x="286" y="200" text-anchor="middle" font-size="11" fill="#ffd43b">Tháng 2–6</text>
  <text x="286" y="216" text-anchor="middle" class="fig-muted" font-size="10">đắt — cần lý do rất mạnh</text>
  <text x="500" y="200" text-anchor="middle" font-size="11" fill="#ff8787">Tháng 6+</text>
  <text x="500" y="216" text-anchor="middle" class="fig-muted" font-size="10">thực tế là viết lại dự án</text>
  <text x="330" y="70" text-anchor="middle" class="fig-muted" font-size="10">code gameplay thuần chuyển được;</text>
  <text x="330" y="86" text-anchor="middle" class="fig-muted" font-size="10">prefab, animator, cảnh dựng sẵn, quy trình build thì không</text>
</svg>
<figcaption>Cửa sổ đổi ý hẹp hơn người ta tưởng. Đó là lý do một technical spike hai ngày ở tuần đầu là khoản đầu tư có tỉ suất sinh lời cao nhất trong toàn dự án.</figcaption>
</figure>

Cách mua thêm dư địa mà gần như miễn phí: **giữ logic game tách khỏi engine từ đầu.** Một lớp lõi không tham chiếu gì tới API engine — luật chơi, cân bằng, máy trạng thái — là phần duy nhất chuyển được nguyên vẹn, và nó cũng là phần dễ kiểm thử nhất. Xem [[architecture-patterns]].

Và trước khi chốt: **dành 1–3 ngày làm technical spike** cho thứ rủi ro nhất về mặt kỹ thuật trong dự án — số lượng thực thể, kiểu dựng hình đặc biệt, netcode, hay build lên nền tảng đích. Xem [[prototyping]]. Phát hiện ở ngày thứ hai rằng engine không kham nổi thứ bạn cần rẻ hơn phát hiện ở tháng thứ tám hàng trăm lần.

## Chuỗi công cụ quanh engine

Engine chỉ là một phần. Ba thứ sau quyết định trải nghiệm hằng ngày của đội nhiều không kém, và bị bỏ qua thường xuyên hơn:

**Quản lý phiên bản cho asset lớn.** Git thuần xử lý kém file nhị phân lớn: nó không merge được, và lưu trọn vẹn từng phiên bản nên kho phình rất nhanh. Hai đường đi:

| Giải pháp | Hợp với | Lưu ý |
|---|---|---|
| **Git + LFS** | đội nhỏ, chủ yếu là code | đơn giản, nhưng vẫn không giải quyết xung đột file nhị phân |
| **Perforce** và tương tự | đội có nhiều nghệ sĩ | hỗ trợ khoá file độc quyền — thứ thật sự cần khi hai người cùng sửa một prefab |

Điểm mấu chốt không phải công cụ mà là **quy ước khoá file**: với file nhị phân không merge được, cách duy nhất tránh mất việc là không để hai người sửa cùng lúc.

**CI và build tự động.** Đáng dựng sớm hơn cảm giác của bạn. Giá trị lớn nhất không phải build nhanh mà là **phát hiện hỏng sớm** — nhất là những thứ chỉ hỏng trên bản dựng thật chứ không hỏng trong editor: thiếu tài nguyên, code bị cắt bởi trình tối ưu, thiết lập nền tảng sai. Xem [[unity-testing-ci]] nếu bạn dùng Unity.

**Quy trình build lên nền tảng đích.** Thứ luôn tốn nhiều hơn dự kiến: ký số, chứng chỉ, quy trình duyệt, quy định riêng của từng cửa hàng. Hãy **build thử lên thiết bị thật trong tháng đầu**, kể cả khi game mới chỉ là một hình vuông chạy qua chạy lại. Đó là bài kiểm tra rẻ nhất cho một loạt rủi ro không lộ ra ở chỗ nào khác.

## Kiểm tra nhanh

- Nền tảng đích đã chốt chưa? (phải chốt **trước** khi chọn engine)
- Đội đã thạo engine nào? Chi phí học cái mới là bao nhiêu tuần?
- Đã làm technical spike cho thứ rủi ro nhất chưa?
- Đã build thử lên thiết bị đích thật chưa, dù chỉ với một hình vuông?
- Logic game có tách khỏi API engine không?
- Dự án hiện ở tháng thứ mấy — còn trong cửa sổ đổi ý được không?
- Asset nhị phân đang quản lý thế nào? Có quy ước khoá file chưa?
- Phiên bản engine đã ghi vào tài liệu cho AI chưa?

## 🤖 Prompt cho AI

Đây là quyết định khó đảo ngược nhất, nên hãy bắt AI phản biện thay vì gợi ý.

**Dùng AI thế nào cho quyết định tech stack**

Hỏi "engine nào tốt nhất" là cách chắc chắn nhận về một bảng so sánh chung chung — thứ tồn tại đầy trên mạng và không nói gì về dự án của bạn. Nguyên nhân không phải AI kém mà là **câu hỏi thiếu ràng buộc**: không có ràng buộc thì mọi lựa chọn đều hợp lý như nhau.

Hai cách dùng thật sự có giá trị:

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Ép chọn một | đã có ràng buộc cụ thể | "Với các ràng buộc NÀY, khuyến nghị MỘT cái. Nói rõ tôi mất gì khi chọn nó" |
| Đóng vai phản đối | đã nghiêng về một lựa chọn | "Tôi định chọn X. Hãy lập luận mạnh nhất có thể rằng đó là sai lầm" |

Chế độ thứ hai đáng giá hơn, vì lúc bạn hỏi thì thường bạn đã có thiên hướng rồi — và thứ bạn cần không phải xác nhận mà là danh sách những gì mình sẽ hối tiếc.

Việc **không** nên giao: quyết định cuối cùng. Nó phụ thuộc vào kinh nghiệm đội và khẩu vị rủi ro của bạn — hai thứ AI không quan sát được.

**Phải nêu rõ:**
- Thể loại, quy mô, nền tảng đích
- Kinh nghiệm sẵn có của đội, tính theo tuần phải học nếu đổi
- Bạn sẽ làm phần lớn code cùng agent hay không
- Thời gian dự kiến của dự án (quyết định trọng số của rủi ro giấy phép)
- Ràng buộc cứng nào loại hẳn một lựa chọn

**Mẫu prompt**

```
Tôi đang chọn engine cho dự án này:
- Thể loại: <...>
- Quy mô: <số thực thể, 2D/3D, single/multi>
- Nền tảng đích: <...>
- Kinh nghiệm sẵn có của tôi: <...>
- Thời gian dự kiến: <...> tháng
- Tôi sẽ làm phần lớn code CÙNG VỚI AI agent.

So sánh <Unity 6> và <Godot 4> cho trường hợp NÀY, gồm cả tiêu chí:
"agent đọc và sửa được project tới mức nào?" (file text hay binary,
độ ổn định API, lượng tài liệu công khai).

Khuyến nghị MỘT cái. Nói rõ cái gì tôi sẽ mất khi chọn nó.
Ước tính chi phí chuyển engine nếu 6 tháng nữa tôi đổi ý.

Rồi đề xuất một technical spike 2 NGÀY kiểm chứng giả định rủi ro nhất
của lựa chọn đó — nêu rõ tiêu chí đạt và tiêu chí trượt.
```

**Luôn nêu phiên bản chính xác trong mọi prompt sau đó.** `Unity 6` khác `Unity 2021` rất nhiều; model sẽ dùng API của phiên bản phổ biến nhất trong dữ liệu huấn luyện nếu bạn không nói.

**Bẫy thường gặp:** hỏi "engine nào tốt nhất" → nhận về bảng so sánh chung chung ai cũng viết được. Ràng buộc cụ thể mới cho ra khuyến nghị dùng được. Bẫy thứ hai: hỏi về giấy phép và phí bản quyền rồi tin câu trả lời — đây là loại thông tin thay đổi theo thời gian và nằm sau thời điểm cắt dữ liệu của model. Luôn kiểm tra tại nguồn chính thức.

## 🎮 Unity

Bạn đã chọn Unity, nên mục này nói về **quyết định bên trong Unity** — những lựa chọn khó đảo ngược.

**Bảng quyết định khó đảo ngược**

| Quyết định | Lựa chọn | Chi phí đổi sau |
|---|---|---|
| Render pipeline | URP / Built-in / HDRP | Rất cao — mọi shader và lighting |
| Input | Input System mới / Manager cũ | Cao — mọi script đọc input |
| UI | UGUI / UI Toolkit | Cao — mọi màn hình |
| Chuyển động | Rigidbody / tự viết | Cao — mọi collision |
| Color space | Linear / Gamma | Rất cao — mọi màu và art |
| Assembly Definition | Có / không | Trung bình, nhưng càng để lâu càng đắt |
| Addressables | Có / không | Trung bình |
| Netcode | NGO / Fish-Net / Photon / không | Rất cao — xem [[unity-multiplayer]] |

**Khuyến nghị mặc định cho dự án indie 2026**

```
Render        URP            (Built-in đang bảo trì; HDRP quá nặng cho indie)
Input         Input System   (đổi phím, tay cầm, không phải tự viết)
UI            UGUI cho in-game HUD; UI Toolkit cho editor tool
Color space   Linear
Assembly      Game.Core (noEngineReferences) + Game.Unity + Game.Editor
Addressables  Không, trừ khi build > 500MB hoặc cần DLC
Netcode       Không, trừ khi multiplayer là pillar
```

Lý do URP thay vì Built-in: Built-in không còn nhận tính năng mới, và phần lớn asset/tutorial mới đều giả định URP. Chi tiết ở [[unity-lighting]].

**Tiêu chí "agent sửa được tới đâu"**

Đây là tiêu chí mới đáng cân nhắc khi làm cùng AI:

| Thứ | Agent sửa được? |
|---|---|
| C# script | ✅ hoàn toàn |
| UXML / USS (UI Toolkit) | ✅ text thuần |
| ScriptableObject `.asset` | ⚠️ là YAML, đọc được nhưng sửa dễ hỏng GUID |
| `.prefab` / `.unity` | ❌ đừng để agent sửa |
| Animator Controller | ❌ |
| Shader Graph | ❌ (HLSL viết tay thì ✅) |
| ProjectSettings | ❌ agent không thấy |

Hệ quả thực dụng: **đẩy càng nhiều quyết định vào C# và ScriptableObject càng tốt**, vì đó là phần agent làm được. Mọi thứ nằm trong Editor asset là phần bạn phải tự làm.

**Phiên bản Unity — LTS hay mới nhất?**

LTS cho dự án dự kiến kéo dài hơn một năm. Bản mới nhất nếu cần tính năng cụ thể. Đừng nhảy phiên bản giữa dự án trừ khi có bug chặn — nâng phiên bản Unity là việc cả tuần.

**Kiểm tra nhanh**
- Color space đang Linear chứ?
- Input Manager cũ đã tắt chưa?
- Assembly Definition đã có chưa? (`Game.Core` với `noEngineReferences`)
- Phiên bản Unity có ghi trong `CLAUDE.md` chưa?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Unity hay Godot cho một game 2D nhỏ? Vì sao?**
  → Câu trả lời đúng bắt đầu bằng "đội đã biết cái nào". Nếu cả hai đều mới thì Godot nhẹ hơn cho 2D nhỏ: scene là **file text** nên merge được, dự án khởi động nhanh, không có bước cấu hình nặng. Unity thắng khi cần nhiều asset store, nhiều SDK quảng cáo, hoặc khi đội đã có sẵn thư viện nội bộ.
- `Junior` **Vì sao Git thuần không hợp với asset game?**
  → File nhị phân không merge được, và Git lưu trọn vẹn từng phiên bản nên kho phình rất nhanh. Git LFS đỡ phần dung lượng nhưng không giải quyết xung đột. Đội nhiều nghệ sĩ thật ra cần **khoá file độc quyền** — Perforce hoặc tương đương. Nhưng mấu chốt là **quy ước khoá file**, không phải công cụ.
- `Junior` **Cửa sổ nào còn đổi engine được?**
  → Tháng **0–2** còn đổi được, **2–6** đắt, **từ tháng 6** trở đi là viết lại dự án. Lý do là code gameplay thuần chuyển được, nhưng prefab, animator, cảnh dựng sẵn, thiết lập dự án và quy trình build thì không — mà đó mới là phần chiếm khối lượng.
- `Mid` **Dự án ở tháng thứ tám, có người đề xuất đổi engine. Anh nói gì?**
  → Ở mốc đó, đổi engine thực tế là viết lại dự án, nên tôi không tranh luận về engine mà hỏi **vấn đề gốc là gì**. Gần như luôn có cách giải trong engine hiện tại rẻ hơn nhiều. Nếu vấn đề gốc thật sự là giới hạn của engine thì đó là quyết định cấp dự án, cần con số về phạm vi viết lại chứ không phải cảm giác.
- `Mid` **Làm sao giữ dư địa đổi ý về engine?**
  → Tách logic game khỏi engine từ đầu: một lớp lõi không tham chiếu API engine nào — luật chơi, cân bằng, máy trạng thái. Đó là phần duy nhất chuyển được nguyên vẹn, và tiện thể cũng là phần dễ kiểm thử nhất. Gần như miễn phí nếu làm từ đầu, rất đắt nếu làm sau.
- `Mid` **Tiêu chí nào nặng nhất khi chọn engine?**
  → **Kinh nghiệm sẵn có của đội**, và nó hay bị coi nhẹ nhất. Một engine "kém hơn" mà đội đã thạo gần như luôn thắng engine "tốt hơn" phải học từ đầu — thời gian học không chỉ là thời gian học, nó còn là thời gian mắc những lỗi mà cộng đồng đã biết cách tránh. Sau đó mới tới nền tảng đích, quy mô và thể loại.
- `Senior` **Đội làm phần lớn code cùng AI agent — điều đó đổi cách chọn stack thế nào?**
  → Hệ quả lớn nhất không phải chọn engine nào mà là **đẩy càng nhiều quyết định vào code và dữ liệu dạng text càng tốt**. Logic trong file text là phần agent làm được; logic nằm trong asset của editor là phần mình phải tự làm, bất kể engine. Và luôn ghi phiên bản engine vào tài liệu cho AI — thiếu nó là nguồn lỗi "API không tồn tại" phổ biến nhất.
- `Senior` **Anh làm gì trong tuần đầu tiên để giảm rủi ro của lựa chọn này?**
  → Một **technical spike 1–3 ngày** cho thứ rủi ro nhất về kỹ thuật: số lượng thực thể, kiểu dựng hình đặc biệt, netcode, hoặc build lên nền tảng đích. Và build thử lên **thiết bị thật ngay trong tháng đầu**, kể cả khi game mới là một hình vuông chạy qua chạy lại — nó kiểm tra rẻ một loạt rủi ro không lộ ra ở đâu khác: ký số, chứng chỉ, thiết lập nền tảng.
- `Senior` **Câu hỏi về giấy phép engine thì anh trả lời thế nào?**
  → Kiểm tra tại **nguồn chính thức vào đúng thời điểm quyết định**, không trả lời bằng trí nhớ. Điều khoản engine thương mại đã đổi vài lần những năm gần đây, có lần đổi lớn. Với dự án nhiều năm thì tính cả kịch bản điều khoản đổi giữa chừng. Đây cũng là loại thông tin tôi không hỏi AI, vì nó nằm sau thời điểm cắt dữ liệu.

**Khung trả lời 60 giây** — "Tiêu chí nào nặng nhất khi chọn engine?"

> **Kinh nghiệm sẵn có của đội** — và nó hay bị coi nhẹ nhất. Một engine "kém hơn" mà đội đã thạo gần như luôn thắng một engine "tốt hơn" phải học từ đầu, vì thời gian học không chỉ là thời gian học: nó còn là thời gian mắc những lỗi mà cộng đồng đã biết cách tránh.
>
> Sau đó là nền tảng đích — phải chốt **trước** khi chọn engine chứ không phải sau, vì nó loại hẳn một số lựa chọn. Rồi quy mô và thể loại. Và với đội làm cùng agent, tôi thêm một tiêu chí đã nặng ngang: **agent can thiệp được tới đâu** — scene là file text hay binary, API có ổn định không, tài liệu công khai nhiều không.
>
> Hai tiêu chí hay được nêu mà thực tế ít trọng lượng: engine nào nhiều tính năng hơn, vì mình chỉ dùng một phần nhỏ; và engine nào hiện đại hơn, vì dự án sống lâu hơn chu kỳ thời thượng.

**Họ sẽ đào tiếp**

- *"Tháng thứ tám đòi đổi engine?"* → Ở mốc đó thì đổi engine thực tế là viết lại dự án. Code gameplay thuần chuyển được, nhưng prefab, animator, cảnh dựng sẵn, thiết lập dự án và quy trình build thì không — mà đó mới là phần chiếm khối lượng. Tôi sẽ hỏi vấn đề gốc là gì; gần như luôn có cách giải trong engine hiện tại rẻ hơn nhiều.
- *"Giữ dư địa đổi ý bằng cách nào?"* → Tách logic game khỏi engine từ đầu: một lớp lõi không tham chiếu API engine nào — luật chơi, cân bằng, máy trạng thái. Đó là phần duy nhất chuyển được nguyên vẹn, và tiện thể cũng là phần dễ kiểm thử nhất. Gần như miễn phí nếu làm từ đầu, rất đắt nếu làm sau.
- *"Tuần đầu tiên anh làm gì?"* → Một **technical spike một tới ba ngày** cho thứ rủi ro nhất về kỹ thuật: số lượng thực thể, kiểu dựng hình đặc biệt, netcode, hoặc build lên nền tảng đích. Và build thử lên thiết bị thật ngay trong tháng đầu, kể cả khi game mới là một hình vuông chạy qua chạy lại — nó kiểm tra rẻ một loạt rủi ro không lộ ra ở chỗ nào khác: ký số, chứng chỉ, thiết lập nền tảng.
- *"Vì sao Git thuần không hợp?"* → File nhị phân không merge được, và Git lưu trọn vẹn từng phiên bản nên kho phình rất nhanh. Git LFS đỡ phần dung lượng nhưng không giải quyết xung đột. Với đội có nhiều nghệ sĩ thì thứ thật sự cần là **khoá file độc quyền**, nên Perforce hoặc tương đương. Nhưng điểm mấu chốt là **quy ước khoá file**, không phải công cụ.
- *"Làm cùng agent thì đổi gì?"* → Hệ quả lớn nhất không phải chọn engine nào mà là **đẩy càng nhiều quyết định vào code và dữ liệu dạng text càng tốt**. Logic trong file text là phần agent làm được; logic nằm trong asset của editor là phần mình phải tự làm, bất kể engine. Và luôn ghi phiên bản engine vào tài liệu cho AI — không nêu phiên bản là nguồn lỗi "API không tồn tại" phổ biến nhất.
- *"Giấy phép thì sao?"* → Điều khoản engine thương mại đã đổi vài lần những năm gần đây, có lần đổi lớn. Tôi kiểm tra tại nguồn chính thức vào đúng thời điểm quyết định, và với dự án nhiều năm thì tính cả kịch bản điều khoản đổi giữa chừng. Đây cũng là loại thông tin tôi không hỏi AI, vì nó nằm sau thời điểm cắt dữ liệu.

**Cờ đỏ**

- Chọn engine theo độ phổ biến hoặc theo bảng tính năng.
- Chọn engine trước khi chốt nền tảng đích.
- Không làm technical spike, đi thẳng vào sản xuất.
- Chưa từng build lên thiết bị thật sau nhiều tháng phát triển.
- Logic game bám chặt vào API engine ở mọi lớp.
- Trả lời câu hỏi giấy phép bằng trí nhớ hoặc bằng câu trả lời của AI.
- Đội nhiều nghệ sĩ dùng Git thuần cho file nhị phân, không có quy ước khoá.

**Số / ví dụ nên thuộc**

- Cửa sổ đổi engine: **tháng 0–2** còn đổi được · **2–6** đắt · **6+** là viết lại.
- Thứ tự tiêu chí: **kinh nghiệm đội > nền tảng đích > quy mô/thể loại > agent can thiệp được > giấy phép**.
- Technical spike **1–3 ngày** cho giả định rủi ro nhất, ngay tuần đầu.
- Build lên thiết bị thật **trong tháng đầu**, dù game chưa có gì.
- Dạng dữ liệu: Godot scene **text** · Unity **YAML** (đọc được, sửa tay dễ hỏng) · Unreal blueprint **binary**.
- VCS: **Git + LFS** cho đội nhỏ nhiều code · **Perforce** khi cần khoá file độc quyền.
