---
id: interview-debug-cases
title: Tình huống debug và tối ưu — "game bị X, anh làm gì?"
icon: 🩺
summary: Hai mươi tình huống sự cố kỹ thuật hay được hỏi khi phỏng vấn Unity mobile — tụt fps, giật khi mở màn, crash vì bộ nhớ, máy nóng, lỗi chỉ có trên build, bug không tái hiện được — mỗi cái có giả thuyết, công cụ đo, nguyên nhân hay gặp và cách sửa.
status: deep
read: 1133
level: advanced
order: 32
tags: [interview, debugging, profiling, optimization, crash]
related: [interview-unity-tech, unity-profiling, unity-debug-crash, unity-memory-optimization, unity-cpu-optimization, unity-gpu-optimization]
---

Câu "game bị X, anh làm gì?" là dạng câu kỹ thuật **hay gặp nhất** ở vòng hỏi theo CV, vì nó vừa kiểm kiến thức vừa kiểm phương pháp. Người phỏng vấn không chờ đáp án đúng ngay — họ chờ xem bạn **có đo trước khi đoán không**, và có loại trừ giả thuyết theo thứ tự không.

## Phương pháp chung — sáu bước

| Bước | Làm gì | Câu nói ra miệng |
|---|---|---|
| **1. Tái hiện** | Máy nào, bản build nào, bước nào, bao lâu thì xảy ra | "Trước hết tôi tái hiện cho ổn định." |
| **2. Khoanh vùng** | CPU hay GPU, script hay render, client hay server, code hay asset | "Tôi xác định nghẽn ở đâu trước khi sửa." |
| **3. Đo** | Profiler, Memory Profiler, Frame Debugger, log, công cụ GPU | "Đo trên máy thật, bản build gần Release." |
| **4. Giả thuyết** | Một nguyên nhân cụ thể giải thích được số đo | "Số này khớp với giả thuyết X vì…" |
| **5. Sửa một thứ** | Thay đổi nhỏ nhất kiểm chứng giả thuyết | "Sửa một chỗ rồi đo lại." |
| **6. Chặn tái phát** | Test, ngưỡng cảnh báo, checklist, quy tắc import | "Để lần sau CI bắt được." |

Nguyên tắc xuyên suốt: **đo trên máy thật**, không đo trong Editor (Editor có overhead riêng và chạy trên PC mạnh), và **đo bản build có bật Development Build + Autoconnect Profiler** chứ không đo bản Debug nặng nề. Chi tiết ở [[unity-profiling]].

## CPU hay GPU — câu hỏi đầu tiên

| Dấu hiệu | Nghiêng về |
|---|---|
| Profiler: `PlayerLoop` dài, script/vật lý/animation chiếm phần lớn | **CPU** (main thread) |
| Main thread chờ ở `Gfx.WaitForPresent` / `Gfx.WaitForGPU` | **GPU** — CPU xong sớm, ngồi chờ GPU |
| Giảm Render Scale/độ phân giải mà fps tăng rõ | **GPU, giới hạn fill-rate** |
| Giảm số object mà fps tăng, đổi độ phân giải không ăn thua | **CPU** (draw call, script) hoặc GPU vertex |
| Render thread dài trong khi main thread ngắn | **Chuẩn bị draw call** — batching, số material |

Một thao tác đổi Render Scale trả lời được nửa câu hỏi CPU hay GPU trong 30 giây — nói được mẹo này là điểm cộng. Xem [[unity-cpu-optimization]] và [[unity-gpu-optimization]].

## Hai mươi tình huống

| # | Triệu chứng | Đo bằng | Nguyên nhân hay gặp | Sửa |
|---|---|---|---|---|
| 1 | Tụt fps đều ở một màn | Profiler + đổi Render Scale | Overdraw hiệu ứng, quá nhiều draw call, script `Update` nặng | Theo kết quả CPU/GPU |
| 2 | Giật từng nhịp vài giây một lần | Profiler, cột GC Alloc, marker `GC.Collect` | Alloc mỗi frame tích lại rồi GC dọn | Đưa alloc về 0: pool, buffer dùng lại, bỏ LINQ/nối chuỗi |
| 3 | Khựng một lần khi mở màn hoặc skill lần đầu | Profiler frame khựng | Load asset đồng bộ, shader biên dịch lần đầu, `Instantiate` hàng loạt | Load async + preload, warmup shader variant, pool trước |
| 4 | Crash sau 20–30 phút chơi trên iOS | Memory Profiler, Xcode memory gauge, log jetsam | Bộ nhớ tăng dần: asset không release, texture event tích lại | So hai snapshot, tìm thứ chỉ tăng; release đúng chỗ |
| 5 | Máy nóng, fps tụt dần sau 10 phút | Đo ở phút 15 chứ không phút đầu | Chạy 60fps không cần thiết, GPU làm việc thừa, thermal throttling | 30fps ở màn tĩnh/menu, giảm hiệu ứng, Adaptive Performance |
| 6 | Bug chỉ có trên build, Editor bình thường | Log build, `Development Build`, logcat/Xcode | IL2CPP stripping, thứ tự khởi tạo khác, đường dẫn file, platform define | `link.xml`, `[Preserve]`, kiểm tra platform-specific code |
| 7 | Crash native không có stack C# | Crashlytics, tombstone, symbolicate dSYM | Plugin native, SDK xung đột, hết bộ nhớ, gọi API engine từ thread khác | Symbolicate, so phiên bản SDK, tắt dần SDK |
| 8 | UI giật khi cuộn danh sách dài | Profiler: `Canvas.SendWillRenderCanvases`, Layout | Rebuild cả canvas, Layout Group lồng, tạo ô mới mỗi lần cuộn | Tách canvas, ScrollView tái dùng ô, bỏ Layout ở danh sách dài |
| 9 | Text số (máu, vàng) làm alloc mỗi frame | GC Alloc theo hàm | `ToString()` + nối chuỗi mỗi frame | Chỉ cập nhật khi đổi, `SetText` với tham số số của TextMeshPro |
| 10 | Thời gian vào game lâu | Đo từng bước boot bằng log có mốc giờ | Tải tuần tự mọi thứ, master data lớn parse đồng bộ, scene đầu nặng | Song song hoá, tải lười, scene boot mỏng |
| 11 | APK/IPA quá lớn | Build Report, Editor log "Build Report" | Texture không nén, asset trong `Resources` không dùng, thư viện thừa | Nén đúng định dạng, chuyển sang Addressables/tải sau, strip |
| 12 | Nhân vật xuyên tường khi chạy nhanh | Debug vẽ collider, Physics Debugger | Va chạm rời rạc, bước vật lý quá lớn | Continuous collision detection, giới hạn tốc độ, raycast trước |
| 13 | Animation giật/trượt khi fps thấp | So ở 30 và 60fps | Logic phụ thuộc frame (cộng hằng số mỗi `Update`) | Nhân `deltaTime`, logic vật lý ở `FixedUpdate` |
| 14 | Sự kiện bị gọi hai lần, hoặc gọi vào object đã huỷ | Log trong handler, `MissingReferenceException` | `+=` ở `OnEnable` nhưng không `-=` ở `OnDisable` | Ghép cặp đăng ký/huỷ, kiểm `this != null` khi async |
| 15 | Nút mua bấm hai lần bị trừ tiền hai lần | Log request phía server | Không khoá nút, retry không có khoá idempotency | Khoá nút, `request_id`, server bỏ yêu cầu trùng — xem [[interview-live-service]] |
| 16 | Màu/ánh sáng khác giữa Android và iOS | Chụp hai máy, Frame Debugger | Gamma/Linear, độ chính xác `half`, định dạng HDR không hỗ trợ | Kiểm color space, dùng `float` ở chỗ nhạy, fallback định dạng |
| 17 | Texture bị mờ hoặc vỡ trên một số máy | Kiểm import setting theo platform | Max size theo platform thấp, máy cũ không hỗ trợ ASTC | Fallback ETC2, kiểm override theo platform |
| 18 | Âm thanh trễ hoặc tốn bộ nhớ | Memory Profiler mục Audio | Nhạc nền Decompress On Load, SFX ngắn Streaming | Nhạc: Streaming; SFX ngắn: Decompress On Load; mono cho 3D |
| 19 | Bug chỉ xảy ra với vài người chơi | Log từ máy người chơi, dữ liệu tài khoản | Dữ liệu save cũ, múi giờ/locale, máy hiếm | Tái hiện bằng dữ liệu của họ, migration save, kiểm parse theo `InvariantCulture` |
| 20 | Hết giờ event mà client vẫn hiện event | So giờ client với giờ server | Dùng giờ máy người chơi, cache master data cũ | Luôn dùng giờ server, làm mới dữ liệu khi quay lại app |

## Ba công cụ phải nói tên được

| Công cụ | Trả lời câu hỏi | Mở ở đâu |
|---|---|---|
| **Profiler** (CPU, GPU, Memory, Rendering) | Frame này tốn thời gian ở đâu, alloc bao nhiêu | Window → Analysis → Profiler, kết nối máy qua USB/IP |
| **Memory Profiler** (package) | Bộ nhớ đang bị chiếm bởi cái gì, cái gì tăng giữa hai thời điểm | Chụp snapshot, so sánh hai snapshot |
| **Frame Debugger** | Từng draw call của một frame, vì sao không batch | Window → Analysis → Frame Debugger |

Công cụ ngoài Unity khi cần sâu hơn: Xcode Instruments và GPU capture cho iOS; Android Studio Profiler, Android GPU Inspector, logcat cho Android; RenderDoc cho frame GPU.

## 🤖 Prompt cho AI

**Dùng AI thế nào để luyện câu tình huống debug**

Câu debug chấm **trình tự suy luận**, nên bảo AI đóng vai người phỏng vấn đưa triệu chứng và trả số đo **từng chút một** khi bạn hỏi — giống một buổi điều tra thật. Bạn phải hỏi "Profiler cho thấy gì ở main thread?" thì AI mới trả lời; nhảy thẳng tới đáp án là bị trừ điểm.

**Phải nêu rõ**
- Nền tảng và máy (Android tầm trung, iPhone đời cũ) — nguyên nhân khác hẳn theo máy.
- Yêu cầu AI **giấu nguyên nhân**, chỉ trả số đo khi bạn yêu cầu đúng công cụ.
- Tiêu chí chấm: có tái hiện, có khoanh vùng CPU/GPU, có đo trước khi sửa, có chặn tái phát.
- Phiên bản Unity, vì tên marker và công cụ thay đổi theo phiên bản.

**Mẫu prompt**

```
Đóng vai lead kỹ thuật phỏng vấn tôi (Unity mobile, Unity 6, URP).
Đưa cho tôi MỘT triệu chứng sự cố (vd: "game giật mỗi 3 giây trên Android tầm trung").
Luật:
- Bạn biết nguyên nhân thật nhưng GIẤU đi.
- Tôi sẽ hỏi công cụ/số đo; bạn chỉ trả đúng thứ tôi hỏi, như số đo thật.
- Khi tôi chốt nguyên nhân và cách sửa, chấm theo 6 bước:
  tái hiện / khoanh vùng CPU-GPU / đo / giả thuyết / sửa một thứ / chặn tái phát.
- Nói tôi đã bỏ qua bước nào và hỏi thừa câu nào.
Làm 5 tình huống khác nhau.
```

**Bẫy thường gặp:** AI tự đưa đáp án ngay khi bạn mới hỏi một câu, phá mất bài luyện — nhắc lại luật "giấu nguyên nhân". Bẫy thứ hai: AI bịa tên marker Profiler không có thật — tên marker phải kiểm trong Profiler thật của phiên bản bạn dùng. Bẫy thứ ba: AI chấp nhận câu trả lời "tôi sẽ tối ưu draw call" khi chưa đo — bắt nó chấm nặng lỗi sửa trước khi đo.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Game tụt fps, việc đầu tiên anh làm là gì?**
  → Không sửa gì cả, đo trước. Tôi tái hiện trên máy thật, mở Profiler qua bản Development Build, rồi xác định nghẽn ở CPU hay GPU trước khi đoán nguyên nhân. Sửa theo cảm giác thường tối ưu nhầm chỗ, vì chỗ tốn thật hiếm khi là chỗ mình nghĩ.
- `Junior` **Vì sao không nên đo hiệu năng trong Editor?**
  → Editor chạy trên PC mạnh hơn điện thoại rất nhiều và tự nó có overhead (cửa sổ Scene, Inspector, kiểm tra an toàn), nên số đo vừa lạc quan vừa lẫn chi phí không có ở bản build. Tôi đo trên máy thật yếu nhất trong danh sách hỗ trợ, bản build gần Release.
- `Junior` **Game giật từng nhịp vài giây một lần. Anh nghi gì?**
  → Nghi đầu tiên là GC: code alloc mỗi frame, rác tích lại rồi bộ thu gom chạy gây khựng theo chu kỳ. Tôi kiểm bằng cột GC Alloc trong Profiler và tìm marker thu gom rác trùng với frame khựng. Sửa bằng cách đưa alloc mỗi frame về 0: pool, buffer dùng lại, bỏ LINQ và nối chuỗi trong `Update`.
- `Junior` **Animation hoặc di chuyển nhanh chậm khác nhau giữa các máy. Vì sao?**
  → Vì logic đang phụ thuộc frame: cộng một lượng cố định mỗi `Update`, máy 60fps chạy nhanh gấp đôi máy 30fps. Sửa bằng cách nhân với `Time.deltaTime`, còn logic vật lý đặt ở `FixedUpdate` với bước cố định.
- `Junior` **Sự kiện bị gọi hai lần sau khi đóng mở màn hình. Nguyên nhân là gì?**
  → Gần như chắc chắn là đăng ký `+=` mà không huỷ `-=`: mỗi lần mở màn thêm một handler. Tôi ghép cặp `OnEnable` đăng ký và `OnDisable` huỷ. Nếu handler gọi vào object đã huỷ thì còn thấy `MissingReferenceException` — cùng một nguồn gốc.
- `Mid` **Làm sao biết game nghẽn ở CPU hay GPU?**
  → Nhìn Profiler: nếu main thread ngồi chờ ở marker chờ GPU thì GPU là nút thắt; nếu `PlayerLoop` dài vì script, vật lý, animation thì là CPU. Một mẹo nhanh là giảm Render Scale: fps tăng rõ thì đang giới hạn fill-rate ở GPU. Biết đúng phía mới chọn đúng cách sửa, vì gộp draw call không cứu được game nghẽn fill-rate.
- `Mid` **Game khựng một lần khi dùng skill lần đầu, các lần sau mượt. Vì sao?**
  → Thứ gì đó chỉ làm ở lần đầu: load asset hiệu ứng đồng bộ, biên dịch shader variant lần đầu dùng, hoặc `Instantiate` hàng loạt object. Tôi xem frame khựng trong Profiler để biết là cái nào. Sửa bằng preload trong màn tải, warmup shader variant, và pool object hiệu ứng từ trước.
- `Mid` **Game crash sau 20–30 phút chơi trên iPhone. Anh điều tra thế nào?**
  → Crash sau thời gian dài gần như luôn là bộ nhớ tăng dần cho tới khi hệ điều hành giết app. Tôi chụp hai snapshot Memory Profiler cách nhau vài lần chuyển màn và so sánh, tìm thứ chỉ tăng mà không giảm — thường là asset load không release hoặc texture event tích lại. Sau khi sửa thì chơi lại đúng kịch bản đó lâu hơn thời điểm crash cũ để xác nhận.
- `Mid` **Máy nóng và fps giảm dần sau 10 phút. Anh làm gì?**
  → Đó là thermal throttling: máy nóng thì hệ điều hành hạ xung CPU/GPU. Tôi đo ở phút thứ 15 chứ không ở phút đầu, rồi giảm việc thừa: chạy 30fps ở menu và màn tĩnh, giảm hiệu ứng và post-processing, giới hạn độ phân giải render. Mục tiêu là game chạy ổn định lâu chứ không phải đỉnh cao trong hai phút đầu.
- `Mid` **Bug chỉ có trên bản build, trong Editor không có. Anh tìm thế nào?**
  → Nghĩ ngay tới những thứ khác giữa hai môi trường: IL2CPP strip mất code dùng qua reflection, thứ tự khởi tạo khác, đường dẫn file, và code chỉ chạy trên platform. Tôi bật Development Build để có log và stack trace, đọc logcat hoặc Xcode console. Với stripping thì giữ lại bằng `link.xml` hoặc `[Preserve]`.
- `Mid` **Crash không có stack trace C#. Anh làm gì?**
  → Đó là crash native, nên cần symbolicate: dSYM cho iOS, symbol file cho Android, qua Crashlytics hoặc công cụ của store. Stack native thường chỉ ra một plugin hoặc SDK, hoặc việc gọi API engine từ thread khác. Tôi so phiên bản SDK với bản build còn ổn và tắt dần từng SDK để khoanh vùng.
- `Mid` **Danh sách cuộn dài bị giật. Anh xem gì?**
  → Trong Profiler tôi tìm chi phí rebuild canvas và tính layout: mỗi ô đổi dữ liệu làm cả canvas dựng lại, Layout Group lồng nhau làm tính toán bùng nổ. Sửa bằng cách tách canvas tĩnh và động, dùng ScrollView tái dùng ô thay vì tạo mới, bỏ Layout Group ở danh sách dài và tự đặt vị trí.
- `Mid` **HUD hiện số máu, vàng làm alloc mỗi frame. Sửa thế nào?**
  → Nguồn alloc là `ToString()` và nối chuỗi mỗi frame. Tôi chỉ cập nhật text khi giá trị thực sự đổi, và dùng `SetText` có tham số số của TextMeshPro để không tạo chuỗi mới. Một HUD tưởng nhỏ có thể là nguồn rác lớn nhất trong frame.
- `Mid` **Thời gian từ lúc mở app tới màn chính quá lâu. Anh tối ưu thế nào?**
  → Đo trước từng bước boot bằng log có mốc thời gian: khởi tạo SDK, đăng nhập, tải master data, tải asset, scene đầu. Rồi xử lý bước dài nhất: song song hoá những bước không phụ thuộc nhau, tải lười thứ chưa cần, parse master data ngoài main thread, giữ scene boot thật mỏng. Thời gian vào game ảnh hưởng thẳng tới retention ngày đầu.
- `Mid` **Kích thước app quá lớn. Anh tìm thủ phạm ở đâu?**
  → Đọc Build Report trong Editor log, sắp asset theo dung lượng: thường là texture không nén hoặc nén sai định dạng, asset nằm trong `Resources` dù không dùng, và thư viện thừa. Sửa bằng nén đúng theo platform, chuyển nội dung không cần ngay sang tải sau qua Addressables, và bật stripping.
- `Mid` **Nhân vật đi xuyên tường khi chạy nhanh. Vì sao?**
  → Va chạm rời rạc chỉ kiểm vị trí ở mỗi bước vật lý; vật đi nhanh có thể nhảy qua tường mỏng giữa hai bước. Sửa bằng Continuous Collision Detection cho vật nhanh, giới hạn tốc độ, hoặc raycast/spherecast theo hướng di chuyển trước khi dịch chuyển.
- `Mid` **Bug chỉ xảy ra với vài người chơi, đội không tái hiện được. Làm sao?**
  → Thu thập điều kiện riêng của họ: máy, phiên bản hệ điều hành, ngôn ngữ và múi giờ, dữ liệu tài khoản. Hay gặp là save cũ chưa được migration, hoặc parse số theo locale (dấu phẩy thập phân) nên phải dùng `InvariantCulture`. Nếu được, tái hiện bằng bản sao dữ liệu tài khoản của họ trên môi trường test.
- `Mid` **Event đã hết giờ mà một số người vẫn thấy. Vì sao?**
  → Client đang dùng giờ máy người chơi hoặc giữ master data cũ trong cache. Giờ máy có thể bị chỉnh tay, nên mọi mốc thời gian phải so với giờ server, và dữ liệu event phải được làm mới khi app quay lại từ nền. Server cũng phải tự chặn nhận thưởng khi event đã hết, không tin client.
- `Mid` **Màu sắc trên Android khác iOS. Anh kiểm gì?**
  → Kiểm color space (Gamma hay Linear) và định dạng render target có được hỗ trợ trên máy đó không, rồi độ chính xác `half` trong shader ở những phép tính nhạy. Chụp cùng một cảnh trên hai máy và soi bằng Frame Debugger. Máy cũ không hỗ trợ một định dạng HDR thì Unity có thể rơi về định dạng khác làm màu lệch.
- `Mid` **Nhạc nền chiếm nhiều bộ nhớ. Cấu hình lại thế nào?**
  → Nhạc nền dài nên dùng Streaming để không giải nén cả bài vào bộ nhớ; hiệu ứng âm thanh ngắn dùng nhiều lần thì Decompress On Load để phát không trễ. Âm thanh 3D chuyển sang mono vì định vị không gian không cần stereo. Kiểm kết quả bằng mục Audio trong Memory Profiler.
- `Senior` **Anh đã tối ưu xong, làm sao chắc không ai làm hỏng lại?**
  → Đưa số đo vào quy trình: kịch bản đo chuẩn trên máy tham chiếu, ngưỡng frame time và alloc, CI cảnh báo khi vượt. Thêm quy tắc import tự động cho texture và audio để asset sai chuẩn bị chặn từ lúc đưa vào. Tối ưu mà không có hàng rào thì vài sprint sau sẽ quay về như cũ.
- `Senior` **Không có máy để tái hiện lỗi chỉ xảy ra trên một dòng máy hiếm. Anh làm gì?**
  → Thu thập tối đa từ xa: crash report có symbol, log có ngữ cảnh, thông tin GPU và bộ nhớ của máy. Dùng dịch vụ device farm nếu có, hoặc nhờ người chơi/QA có máy đó chạy bản build có log thêm. Trong lúc chờ, có thể chặn tính năng gây lỗi trên dòng máy đó bằng cấu hình server.
- `Senior` **Hai giả thuyết đều có vẻ đúng. Anh chọn sửa cái nào trước?**
  → Chọn cái kiểm chứng rẻ nhất và tác động lớn nhất, và quan trọng hơn là chỉ sửa một thứ mỗi lần rồi đo lại, để biết chắc thay đổi nào có tác dụng. Sửa hai thứ cùng lúc thì dù hết lỗi cũng không biết vì sao, và có thể giữ lại một thay đổi vô ích hoặc có hại.
- `Senior` **Fps ổn nhưng người chơi vẫn kêu game "lag". Anh nghĩ gì?**
  → Fps trung bình ổn không có nghĩa là frame đều: vài frame dài lẻ tẻ (spike) gây cảm giác giật dù trung bình cao. Tôi xem phân bố frame time, không chỉ trung bình. Ngoài ra "lag" có thể là độ trễ mạng hoặc độ trễ input, không phải render — phải hỏi lại người chơi lag lúc nào.
- `Senior` **Có lỗi nghiêm trọng ngay sau khi phát hành. Anh ưu tiên thế nào?**
  → Chặn thiệt hại trước: dừng phát hành dần nếu đang rollout, tắt tính năng lỗi bằng cờ server, hoặc vá bằng tải dữ liệu nếu được. Sau khi ổn mới tìm nguyên nhân gốc và làm bản vá chính thức. Báo trạng thái cho đội và người phụ trách theo mốc thời gian suốt quá trình.
- `Senior` **Anh dạy người mới cách debug hiệu năng thế nào?**
  → Dạy quy trình chứ không dạy mẹo: tái hiện, khoanh vùng CPU/GPU, đo, sửa một thứ, đo lại. Ngồi cùng họ một lần với một vấn đề thật trên máy thật, rồi để họ tự làm vấn đề tiếp theo và review ghi chép số đo của họ. Mẹo thì lỗi thời theo phiên bản Unity, quy trình thì không.

**Khung trả lời 60 giây** — "Game tụt fps trên Android tầm trung, anh làm gì?"

> Việc đầu tiên tôi làm là không sửa gì cả. Tôi tái hiện trên đúng dòng máy đó, bản Development Build kết nối Profiler, và đo ở phút thứ mười lăm chứ không phải phút đầu vì nhiệt và rác bộ nhớ cần thời gian để lộ ra.
>
> Tôi xác định CPU hay GPU trước: main thread ngồi chờ GPU, hoặc giảm Render Scale mà fps tăng, thì là GPU — thường do overdraw hiệu ứng hoặc post-processing. Nếu là CPU thì tôi sắp Hierarchy theo thời gian và GC Alloc để tìm hàm tốn nhất.
>
> Tôi sửa một thứ mỗi lần, đo lại và ghi số trước sau. Xong thì thêm ngưỡng đo vào quy trình để không ai vô tình làm tụt lại.

**Họ sẽ đào tiếp**

- *"Profiler cho thấy `Gfx.WaitForPresent` dài — nghĩa là gì?"* → CPU xong việc sớm và đang chờ GPU; nút thắt ở phía GPU, tối ưu script sẽ không giúp gì.
- *"Giảm Render Scale mà fps không đổi thì sao?"* → Không phải giới hạn fill-rate; xem số draw call, vertex, hoặc quay lại phía CPU.
- *"GC Alloc bao nhiêu mỗi frame thì chấp nhận được?"* → Mục tiêu là 0 byte ở vòng lặp gameplay; alloc ở lúc chuyển màn, tải dữ liệu thì chấp nhận.
- *"Memory Profiler so hai snapshot để làm gì?"* → Tìm thứ chỉ tăng không giảm giữa hai thời điểm tương đương — đó là rò.
- *"Sao không bật Incremental GC là xong?"* → Nó chia nhỏ thời gian dọn để giảm khựng nhưng không giảm lượng rác; bỏ nguồn alloc vẫn là gốc.
- *"Đo ở bản Release hay Development?"* → Development để có Profiler, nhưng nhớ nó chậm hơn Release một chút; số cuối cùng xác nhận ở bản gần Release.
- *"Làm sao biết shader biên dịch lần đầu gây khựng?"* → Frame khựng có marker biên dịch shader; warmup variant trong màn tải thì khựng biến mất.
- *"Sau khi sửa, anh báo kết quả thế nào?"* → Số trước/sau, máy đo, kịch bản đo, và ghi vào PR để người review kiểm được.

**Cờ đỏ**

- Đề xuất cách sửa ngay khi nghe triệu chứng, chưa nhắc tới đo.
- Đo trong Editor rồi kết luận cho điện thoại.
- "Tôi giảm draw call" cho mọi vấn đề fps, không phân biệt CPU hay GPU.
- Sửa nhiều thứ cùng lúc rồi không biết cái nào có tác dụng.
- Coi Incremental GC là cách chữa rác bộ nhớ.
- Đóng bug "không tái hiện được" mà chưa thu thập điều kiện của người gặp lỗi.
- Tin giờ máy người chơi cho mọi thứ dính tới thời gian event.

**Số / ví dụ nên thuộc**

- Ngân sách frame: **16,6 ms** ở 60fps, **33,3 ms** ở 30fps.
- Mục tiêu alloc trong vòng lặp gameplay: **0 B/frame**.
- Đo ở **phút thứ 15** trên **máy yếu nhất** được hỗ trợ.
- Sáu bước: **tái hiện → khoanh vùng → đo → giả thuyết → sửa một thứ → chặn tái phát**.
- Ba công cụ: **Profiler · Memory Profiler · Frame Debugger**.
- Mẹo CPU/GPU: **giảm Render Scale** — fps tăng rõ là giới hạn fill-rate.
- Âm thanh: nhạc **Streaming**, SFX ngắn **Decompress On Load**, 3D **mono**.
