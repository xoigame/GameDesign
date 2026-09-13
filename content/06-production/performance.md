---
title: Performance
icon: ⚡
summary: Ngân sách frame, profiling, và những nguyên nhân giật lag phổ biến nhất.
status: deep
read: 580
level: advanced
order: 50
tags: [production, optimization]
related: [architecture-patterns, pathfinding, data-driven-design]
---

Tối ưu hiệu năng là mảng dễ làm sai thứ tự nhất trong cả quy trình: gần như ai cũng bắt đầu bằng việc sửa thứ mình *nghĩ* là chậm. Hầu như lần nào nó cũng không phải thứ chậm nhất, và thời gian bỏ ra là thời gian mất trắng.

Toàn bộ chương này quy về hai câu: **đo trước khi sửa**, và **sửa cú khựng trước khi nâng số trung bình**.

## Ngân sách frame

| Mục tiêu | Ngân sách mỗi frame |
|---|---|
| 30 FPS | 33.3 ms |
| 60 FPS | 16.6 ms |
| 120 FPS | 8.3 ms |

Ở 60 FPS, ngân sách thực tế nên là **~12ms** — chừa biên độ cho biến động và cho máy yếu hơn máy bạn.

Ngân sách phải gắn với một **máy đích cụ thể**, không phải máy của bạn. "Chạy 60fps" là câu vô nghĩa nếu không nói trên thiết bị nào; máy phát triển thường mạnh gấp vài lần thiết bị mà phần lớn người chơi đang dùng. Chọn một máy tầm trung thật, đo trên đó, và coi con số ở đó là con số duy nhất có ý nghĩa.

## Giật lag tệ hơn FPS thấp đều

**60 FPS với một cú khựng 200ms mỗi 10 giây cảm thấy tệ hơn 40 FPS ổn định.** Ưu tiên loại bỏ spike trước khi nâng FPS trung bình.

<figure class="fig">
<svg viewBox="0 0 660 244" role="img" aria-label="So sánh hai đồ thị thời gian frame: một đường đều hơi cao và một đường thấp nhưng có các cú khựng lớn">
  <line x1="60" y1="30" x2="60" y2="150" class="fig-line"/>
  <line x1="60" y1="150" x2="636" y2="150" class="fig-line"/>
  <text x="14" y="34" class="fig-muted" font-size="10">ms</text>
  <line x1="60" y1="112" x2="636" y2="112" stroke="#51cf9b" stroke-width="1" stroke-dasharray="5 4"/>
  <text x="640" y="116" text-anchor="end" font-size="10" fill="#51cf9b">16,6 ms</text>
  <path d="M60 96 L110 99 L160 94 L210 98 L260 95 L310 97 L360 94 L410 98 L460 96 L510 95 L560 97 L610 95 L636 96" stroke="#ffd43b" stroke-width="2" fill="none"/>
  <text x="66" y="88" font-size="10" fill="#ffd43b">A · 25 ms đều — 40 FPS, KHÔNG khựng</text>
  <path d="M60 122 L100 120 L140 123 L180 121 L200 38 L212 121 L260 122 L300 120 L340 123 L380 121 L400 42 L412 122 L460 120 L500 123 L540 121 L560 36 L572 122 L610 121 L636 122" stroke="#ff8787" stroke-width="2" fill="none"/>
  <text x="66" y="138" font-size="10" fill="#ff8787">B · 14 ms — 70 FPS, nhưng khựng 200 ms mỗi vài giây</text>
  <circle cx="200" cy="38" r="4" fill="#ff8787"/>
  <circle cx="400" cy="42" r="4" fill="#ff8787"/>
  <circle cx="560" cy="36" r="4" fill="#ff8787"/>
  <text x="348" y="176" text-anchor="middle" class="fig-label" font-size="12">A cảm thấy mượt hơn B — dù FPS trung bình thấp hơn</text>
  <text x="348" y="198" text-anchor="middle" class="fig-muted" font-size="10">người chơi không cảm nhận trung bình, họ cảm nhận cú khựng tệ nhất</text>
  <text x="348" y="218" text-anchor="middle" class="fig-muted" font-size="10">vì vậy hãy theo dõi 1% thấp nhất và 0,1% thấp nhất, đừng theo dõi FPS trung bình</text>
</svg>
<figcaption>FPS trung bình là chỉ số che giấu vấn đề. Hai bản dựng có cùng số trung bình có thể cho hai trải nghiệm hoàn toàn khác nhau.</figcaption>
</figure>

Chỉ số nên dùng thay cho FPS trung bình:

- **1% thấp nhất** — trung bình của 1% frame chậm nhất. Đây là con số phản ánh cảm giác thực tế.
- **0,1% thấp nhất** — bắt các cú khựng hiếm nhưng rất khó chịu.
- **Số frame vượt ngân sách** trong một phiên. Một con số duy nhất, dễ theo dõi qua các bản dựng.

## Quy trình: đo trước, đoán sau

Thứ tự đúng, và mỗi bước đều có lý do bị bỏ qua:

1. **Tái hiện được vấn đề.** Không tái hiện được thì không đo được cải thiện. Ghi lại kịch bản chính xác: màn nào, bao nhiêu địch, sau bao lâu.
2. **Đo, đừng đoán.** Profiler cho biết thời gian đi đâu. Trực giác của lập trình viên về chỗ chậm nổi tiếng là kém — kể cả người giàu kinh nghiệm.
3. **Xác định nút thắt là CPU hay GPU.** Hai hướng sửa hoàn toàn khác nhau, và sửa nhầm bên thì không có gì thay đổi. Cách thô: giảm mạnh độ phân giải — nếu nhanh hơn hẳn thì nghẽn ở GPU, nếu không đổi thì nghẽn ở CPU.
4. **Sửa cái đắt nhất, một cái một lần.** Sửa ba thứ cùng lúc thì không biết cái nào có tác dụng.
5. **Đo lại trên máy đích.** Cải thiện trên máy phát triển có thể không xuất hiện trên thiết bị thật.

Bước 3 là bước hay bị bỏ qua nhất và tốn kém nhất khi bỏ qua: tối ưu số lượng đa giác trong khi nghẽn ở CPU là nhiều ngày công không đổi lấy gì.

## Phân bổ ngân sách theo hệ thống

Ngân sách frame phải được chia trước, không phải chia sau khi đã hết. Khởi điểm hợp lý cho một game 3D 60 FPS trên ngân sách 12ms:

| Hệ thống | Tỉ lệ | Ở 12 ms |
|---|---|---|
| Render (CPU phía dựng hình) | 40–50% | ~5,5 ms |
| Logic game | 15–20% | ~2 ms |
| Vật lý | 10–15% | ~1,5 ms |
| AI | 10% | ~1,2 ms |
| Âm thanh, UI, khác | 10% | ~1,2 ms |
| **Dự phòng** | **10%** | **~1,2 ms** |

Giá trị của bảng này không nằm ở các con số — game của bạn sẽ khác. Nó nằm ở chỗ **có một con số để vượt**. Khi hệ thống AI tiêu 4ms, câu hỏi không còn là "có chậm không" mà là "nó đang dùng gấp ba ngân sách, ta lấy thời gian đó ở đâu?". Đó là câu hỏi trả lời được.

## Ba nguyên nhân giật lag phổ biến nhất

**Trong game indie, gần như luôn là ba thứ này:**

1. **Cấp phát trong vòng lặp mỗi frame** → GC chạy → khựng. Xem object pooling ở [[architecture-patterns]].
2. **Instantiate/Destroy lúc chạy** → cùng vấn đề, nghiêm trọng hơn.
3. **Nhiều agent tìm đường trong cùng một frame** → xem [[pathfinding]] về việc trải đều theo thời gian.

Điểm chung của cả ba: chúng không làm frame trung bình chậm đi mấy, nhưng tạo ra spike — đúng loại vấn đề mà FPS trung bình che giấu.

**Về áp lực GC**, nguyên lý chung áp dụng cho mọi môi trường có thu gom rác:

- Cấp phát mà **tồn tại ngắn** là loại tệ nhất, vì nó đẩy nhanh chu kỳ thu gom.
- Cấp phát ẩn nguy hiểm hơn cấp phát lộ. Nối chuỗi, đóng hộp kiểu giá trị, closure bắt biến, mảng tạm trả về từ hàm thư viện — không dòng nào trông giống `new`.
- Cách chữa không phải "cấp phát ít hơn" mà là **cấp phát trước và dùng lại**: pool cho đối tượng, buffer dùng chung cho kết quả tạm, cấu trúc dữ liệu đặt sẵn dung lượng.
- Đo bằng **byte cấp phát mỗi frame**, và đặt mục tiêu là 0 trong vòng lặp chính. Con số này dễ theo dõi hơn thời gian GC nhiều.

Nguyên nhân thứ tư đáng thêm vào danh sách: **nạp tài nguyên lúc đang chơi**. Đọc file, giải nén texture, biên dịch shader lần đầu — tất cả đều gây khựng dài. Cách chữa là nạp trước ở màn hình chờ hoặc nạp dần trong lúc chạy có kiểm soát, không bao giờ nạp đồng bộ giữa gameplay.

## Draw call, batching, LOD, culling

Bốn khái niệm này giải quyết cùng một bài toán: **gửi ít việc hơn cho GPU, và gửi theo lô lớn hơn**.

- **Draw call** là một lần CPU bảo GPU vẽ một thứ. Chi phí nằm ở phía CPU, nên hàng nghìn draw call làm nghẽn CPU chứ không nghẽn GPU. Đây là lý do một cảnh đầy vật thể đơn giản có thể chậm hơn một cảnh có vài mô hình phức tạp.
- **Batching** gộp nhiều vật thể dùng chung vật liệu vào một draw call. Điều kiện gần như luôn là **chung vật liệu** — nên số lượng vật liệu khác nhau trong cảnh là con số cần theo dõi.
- **Atlas** gộp nhiều texture nhỏ thành một, để nhiều vật thể dùng chung được một vật liệu. Đây là cách làm batching khả thi trong thực tế, đặc biệt với UI và game 2D.
- **Culling** bỏ qua thứ không nhìn thấy: ngoài khung hình, bị vật khác che, hoặc quá xa.
- **LOD** thay mô hình chi tiết bằng mô hình đơn giản khi ở xa.

Thứ tự đáng làm với phần lớn dự án nhỏ: giảm số vật liệu → atlas → culling theo khoảng cách → LOD. Hai cái đầu rẻ và có tác dụng ngay; LOD tốn công làm asset nhất và nên để sau cùng.

## Mobile khác ở đâu

Mobile không phải PC yếu hơn. Nó khác về chất ở ba điểm, và bỏ qua điểm nào cũng dẫn tới bất ngờ khó chịu lúc sắp phát hành.

- **Nhiệt và throttle.** Thiết bị chạy đầy tải sẽ **tự giảm xung** sau 10–15 phút. Nghĩa là bản dựng chạy 60fps trong hai phút đầu vẫn có thể tụt xuống 40 ở phút thứ hai mươi. **Luôn đo sau ít nhất 15 phút chơi liên tục** — con số đo trong hai phút đầu là con số không có thật.
- **Băng thông bộ nhớ là nút thắt chính.** Trên di động, thứ giết hiệu năng thường không phải số đa giác mà là overdraw, texture quá lớn và hiệu ứng toàn màn hình. Giảm độ phân giải texture thường cho cải thiện lớn hơn giảm số đa giác.
- **Pin cũng là một ngân sách.** Game làm nóng máy và tụt pin nhanh sẽ bị gỡ, kể cả khi nó mượt. Chạy ở 30fps ổn định đôi khi là quyết định đúng, không phải thoả hiệp.

Thêm một điều thuộc về quy trình hơn kỹ thuật: **chọn máy đích thấp nhất từ đầu dự án và test trên nó hằng tuần**. Phát hiện vấn đề hiệu năng ở tháng thứ mười thường có nghĩa là phải cắt nội dung, vì lúc đó sửa kiến trúc đã quá muộn.

## Kiểm tra nhanh

- Máy đích là máy nào? Đã đo trên chính nó chưa?
- Đang theo dõi FPS trung bình hay 1% thấp nhất?
- Nút thắt hiện ở CPU hay GPU? Đã kiểm chứng bằng cách giảm độ phân giải chưa?
- Byte cấp phát mỗi frame trong vòng lặp chính: bao nhiêu? (mục tiêu là 0)
- Có Instantiate/Destroy nào trong lúc chơi không?
- Số vật liệu khác nhau trong cảnh: bao nhiêu?
- Có nạp tài nguyên đồng bộ nào xảy ra giữa gameplay không?
- Với mobile: đã đo sau 15 phút chơi liên tục chưa?

## 🤖 Prompt cho AI

Tối ưu là mảng AI dễ giúp bạn sửa **nhầm chỗ** nhất, vì nó không đo được và sẽ tối ưu thứ trông có vẻ chậm trong code.

**Dùng AI thế nào cho việc tối ưu**

Ranh giới ở đây rất rõ và đáng nhớ: **AI không có profiler, bạn có.** Mọi câu trả lời của nó về "chỗ nào chậm" đều là suy đoán từ hình dạng code, và suy đoán đó chính là thứ quy trình đúng bảo bạn đừng tin — kể cả khi nó đến từ máy.

Vì vậy hãy đảo vai: **bạn đo, AI sửa.** Đưa cho nó số liệu profiler thật rồi giao việc cụ thể; đừng đưa code và hỏi "tối ưu giúp tôi".

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Sửa theo số liệu | đã có kết quả profiler | "Hàm này chiếm 4,2 ms/frame theo profiler. Giảm nó, KHÔNG đổi hành vi" |
| Săn cấp phát ẩn | đang chữa spike GC | "Liệt kê mọi dòng trong file này gây cấp phát heap, kể cả cấp phát ẩn" |
| Dựng công cụ đo | trước khi tối ưu | "Viết bộ đếm hiển thị 1% thấp nhất và byte cấp phát mỗi frame" |
| Giải thích cơ chế | đang học | "Vì sao nhiều vật liệu khác nhau lại làm tăng draw call?" |

Chế độ thứ hai là chế độ giá trị nhất: tìm cấp phát ẩn là việc đọc kỹ, tẻ nhạt, và máy làm tốt hơn người.

Việc **không** nên giao: quyết định tối ưu cái gì. Đó là việc của profiler.

**Phải nêu rõ:**
- Số liệu profiler thật: hàm nào, bao nhiêu ms, bao nhiêu byte cấp phát
- Máy đích và ngân sách frame
- Nút thắt đã xác định là CPU hay GPU
- Ràng buộc: **không được đổi hành vi quan sát được**
- Cái gì được phép hy sinh (độ chính xác, tần suất cập nhật, chất lượng hình)

**Mẫu prompt**

```
Profiler nói: UpdateEnemies() chiếm 4.2ms/frame với 80 kẻ địch,
trong đó 2.8ms là cấp phát (1.4 MB mỗi giây → GC spike mỗi ~3 giây).
Máy đích: điện thoại Android tầm trung. Ngân sách cho AI: 1.2ms.
Nút thắt đã xác định: CPU.

Giảm hàm này về dưới 1.2ms. Ràng buộc:
- KHÔNG đổi hành vi quan sát được của kẻ địch
- Cấp phát trong vòng lặp chính phải về 0
- Được phép: giảm tần suất cập nhật AI (nêu rõ xuống bao nhiêu Hz),
  trải đều công việc qua nhiều frame, cache kết quả
- KHÔNG được: đổi thuật toán tìm đường (đã cân bằng quanh nó)

Trước khi sửa, liệt kê mọi dòng gây cấp phát heap trong file đính kèm,
kể cả cấp phát ẩn (nối chuỗi, đóng hộp, closure, LINQ, mảng tạm).
Rồi đề xuất thứ tự sửa theo tác động giảm dần, và nói rõ mỗi thay đổi
đánh đổi cái gì.
```

**Bẫy thường gặp:** đưa code và hỏi "tối ưu giúp tôi" — AI sẽ vi tối ưu vòng lặp trong khi vấn đề thật là bạn đang `Instantiate` mỗi frame. Bẫy thứ hai: nó đề xuất cache kết quả mà không nói rõ khi nào cache hết hiệu lực, và bạn đổi một lỗi hiệu năng lấy một lỗi đúng sai. Hãy hỏi thẳng "cache này sai khi nào?" cho mọi đề xuất cache.

## 🎮 Unity

Unity có sẵn công cụ đo rất tốt. Vấn đề là **đo sai chỗ** hoặc đo quá muộn.

**Đo trước, tối ưu sau**

`Window > Analysis > Profiler`. Ba cột cần nhìn đầu tiên:
- **GC Alloc** — cột quan trọng nhất. Bất kỳ giá trị nào > 0 B mỗi frame là nguồn giật lag tương lai.
- **Time ms** — so với ngân sách 16.6ms (60 FPS)
- **Calls** — số lần gọi bất thường thường lộ ra vòng lặp sai

**Bật Deep Profile chỉ khi cần** — nó làm chậm game 5–10 lần và bóp méo số liệu. Dùng để tìm hàm nào tốn, không dùng để đo con số tuyệt đối.

**Đo trong game, không chỉ trong Profiler**

```csharp
using Unity.Profiling;

public class PerfHud : MonoBehaviour {
    ProfilerRecorder mainThread, gcAlloc, drawCalls;

    void OnEnable() {
        mainThread = ProfilerRecorder.StartNew(ProfilerCategory.Internal, "Main Thread", 15);
        gcAlloc    = ProfilerRecorder.StartNew(ProfilerCategory.Memory, "GC Allocated In Frame");
        drawCalls  = ProfilerRecorder.StartNew(ProfilerCategory.Render, "Draw Calls Count");
    }
    void OnDisable() { mainThread.Dispose(); gcAlloc.Dispose(); drawCalls.Dispose(); }

    void OnGUI() {
        GUI.Label(new Rect(10, 10, 300, 60),
            $"CPU {mainThread.LastValue / 1e6f:F1} ms\n" +
            $"GC  {gcAlloc.LastValue} B\n" +
            $"Draw {drawCalls.LastValue}");
    }
}
```

Overlay này chạy được **trong build thật trên máy thật** — nơi số liệu mới đúng. Profiler trong Editor luôn lạc quan hơn thực tế.

**Ba nguồn cấp phát hay gặp trong Unity**

```csharp
// ❌ tạo mảng mới mỗi frame
void Update() { var hits = Physics2D.OverlapCircleAll(pos, r); }
// ✅ dùng NonAlloc + buffer dùng lại
readonly Collider2D[] buf = new Collider2D[16];
void Update() { int n = Physics2D.OverlapCircleNonAlloc(pos, r, buf); }

// ❌ nối chuỗi mỗi frame
scoreText.text = "Score: " + score;
// ✅ chỉ cập nhật khi đổi
if (score != lastScore) { scoreText.SetText("Score: {0}", score); lastScore = score; }

// ❌ LINQ trong vòng lặp nóng
var closest = enemies.OrderBy(e => Vector3.Distance(e.pos, p)).First();
// ✅ vòng for thường
```

`TMP_Text.SetText` với format không cấp phát, khác `text = string.Format(...)`.

**Giật lag quan trọng hơn FPS trung bình**

60 FPS với một cú khựng 200ms mỗi 10 giây cảm thấy tệ hơn 40 FPS ổn định. Trong Profiler, tìm các cột cao đột biến chứ không nhìn đường trung bình.

Hai nguồn khựng phổ biến: GC chạy (xem trên) và `Instantiate` lúc chạy (xem object pooling ở [[architecture-patterns]]).

**Kiểm tra nhanh**
- Profiler ở trạng thái chơi bình thường: GC Alloc = 0 B/frame?
- Build ra máy yếu nhất bạn nhắm tới — không phải máy dev.
- Khi có 100 kẻ địch: frame time có vượt ngân sách không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Ngân sách frame cho 60 FPS là bao nhiêu?**
  → **16,6 ms** mỗi frame cho 60 FPS; 33,3 ms cho 30 và 8,3 ms cho 120. Thực tế tôi nhắm **~12 ms** để chừa chỗ cho spike, vì ngân sách dùng hết 16,6 ms nghĩa là bất kỳ dao động nào cũng thành frame rớt. Phân bổ khởi điểm: render 40–50%, logic 15–20%, vật lý 10–15%, AI 10%, dự phòng 10%.
- `Junior` **Vì sao giật lag khó chịu hơn FPS thấp đều?**
  → Vì người chơi không cảm nhận trung bình, họ cảm nhận cú khựng tệ nhất. 60 FPS với một cú khựng 200 ms mỗi mười giây cảm thấy tệ hơn 40 FPS ổn định. Nên chỉ số tôi theo dõi là **1% thấp nhất** và **0,1% thấp nhất**, cộng số frame vượt ngân sách trong một phiên — không phải FPS trung bình.
- `Junior` **Báo cáo hiệu năng nên dùng chỉ số nào?**
  → 1% thấp nhất và 0,1% thấp nhất, kèm tên **máy đích** cụ thể và kịch bản tái hiện. "Trung bình 60 FPS" là câu nói không kiểm chứng được: không biết máy nào, không biết cảnh nào, và nó che mất đúng thứ người chơi khó chịu. Một báo cáo thiếu máy đích thì không hành động được.
- `Mid` **Làm sao biết nghẽn ở CPU hay GPU?**
  → Cách thô mà nhanh: **giảm mạnh độ phân giải**. Nhanh hơn hẳn thì nghẽn GPU, không đổi gì thì nghẽn CPU. Bước này hay bị bỏ qua nhất, và bỏ qua nó thì dễ mất nhiều ngày giảm số đa giác trong khi vấn đề nằm ở phía CPU — hai hướng sửa khác hẳn nhau.
- `Mid` **Chữa áp lực GC thế nào?**
  → Không phải "cấp phát ít hơn" mà là **cấp phát trước và dùng lại**: pool đối tượng, buffer dùng chung, đặt sẵn dung lượng. Thứ khó là cấp phát **ẩn** — nối chuỗi, đóng hộp kiểu giá trị, closure bắt biến, mảng tạm từ hàm thư viện; không dòng nào trông giống `new`. Tôi đo bằng byte cấp phát mỗi frame, mục tiêu **0 trong vòng lặp chính**.
- `Mid` **Đo hiệu năng trên mobile khác PC chỗ nào?**
  → Ba điểm. Thiết bị **throttle vì nhiệt sau 10–15 phút**, nên tôi luôn đo sau ít nhất mười lăm phút chơi liên tục. **Băng thông bộ nhớ** là nút thắt chính chứ không phải số đa giác — giảm độ phân giải texture thường ăn hơn giảm poly. Và pin cũng là ngân sách: game làm nóng máy sẽ bị gỡ dù nó mượt.
- `Senior` **Vì sao cảnh nhiều vật thể đơn giản có thể chậm hơn cảnh vài mô hình phức tạp?**
  → Vì chi phí draw call nằm ở **phía CPU**, không phải GPU. Hàng nghìn draw call làm nghẽn CPU trong khi GPU rảnh rỗi. Muốn gộp thì các vật thể phải dùng chung vật liệu, nên **số vật liệu khác nhau trong cảnh** là con số tôi theo dõi — và atlas là cách làm batching khả thi trong thực tế.
- `Senior` **Bản dựng chạy 60 FPS lúc test nhưng người chơi kêu giật. Chuyện gì?**
  → Ba khả năng, theo thứ tự tôi kiểm tra: đo trên máy phát triển mạnh hơn máy người chơi; đo trong hai phút đầu, trước khi thiết bị throttle vì nhiệt; hoặc đo bằng FPS trung bình nên spike bị che. Cả ba đều là **lỗi phương pháp đo**, không phải lỗi code — nên sửa code trước khi sửa cách đo là phí công.
- `Senior` **Dùng AI để tối ưu hiệu năng thế nào cho đúng?**
  → Ranh giới rõ: **AI không có profiler, tôi có**. Tôi đo trước rồi giao việc cụ thể kèm số liệu, không đưa code và hỏi "tối ưu giúp tôi". Việc tôi giao nhiều nhất là liệt kê mọi dòng gây **cấp phát ẩn** trong một file — đọc kỹ, tẻ nhạt, máy làm tốt hơn người. Còn quyết định tối ưu cái gì thì dựa vào số đo, không dựa vào gợi ý.

**Khung trả lời 60 giây** — "Game tụt 25 FPS trên Android tầm trung, anh làm gì đầu tiên?"

> Không sửa gì cả — **đo trước**. Đầu tiên là tái hiện được: màn nào, bao nhiêu địch, sau bao lâu. Không tái hiện được thì không đo được cải thiện.
>
> Rồi tôi xác định nút thắt ở **CPU hay GPU**, vì hai hướng sửa khác hẳn nhau và sửa nhầm bên thì không có gì thay đổi. Cách thô mà nhanh: giảm mạnh độ phân giải — nhanh hơn hẳn thì nghẽn GPU, không đổi thì nghẽn CPU. Bước này hay bị bỏ qua nhất, và bỏ qua nó thì dễ mất nhiều ngày giảm số đa giác trong khi vấn đề nằm ở CPU.
>
> Với game indie, nghi phạm quen mặt là ba thứ: cấp phát trong vòng lặp mỗi frame kéo theo GC, `Instantiate`/`Destroy` lúc chạy, và nhiều agent tìm đường trong cùng một frame. Cả ba đều tạo **spike** chứ không kéo trung bình xuống — nên tôi nhìn 1% thấp nhất chứ không nhìn FPS trung bình. Và trên mobile tôi đo sau ít nhất mười lăm phút chơi liên tục, vì máy tự giảm xung khi nóng.

**Họ sẽ đào tiếp**

- *"Vì sao spike tệ hơn?"* → 60 FPS với một cú khựng 200ms mỗi mười giây cảm thấy tệ hơn 40 FPS ổn định. Người chơi không cảm nhận trung bình, họ cảm nhận cú khựng tệ nhất. Nên tôi theo dõi **1% thấp nhất**, **0,1% thấp nhất**, và số frame vượt ngân sách trong một phiên.
- *"Test 60 FPS mà người chơi kêu giật?"* → Ba khả năng, theo thứ tự tôi kiểm tra. Đo trên máy phát triển mạnh hơn máy người chơi. Đo trong hai phút đầu, trước khi thiết bị throttle vì nhiệt. Hoặc đo bằng FPS trung bình nên spike bị che. Cả ba đều là lỗi phương pháp đo, không phải lỗi code.
- *"Nhiều vật thể đơn giản sao lại chậm?"* → Vì chi phí draw call nằm ở **phía CPU**, không phải GPU. Hàng nghìn draw call làm nghẽn CPU trong khi GPU rảnh. Muốn gộp thì các vật thể phải dùng chung vật liệu, nên số vật liệu khác nhau trong cảnh là con số tôi theo dõi — và atlas là cách làm batching khả thi trong thực tế.
- *"Chữa áp lực GC thế nào?"* → Không phải "cấp phát ít hơn" mà là **cấp phát trước và dùng lại**: pool đối tượng, buffer dùng chung, đặt sẵn dung lượng. Thứ khó là cấp phát **ẩn** — nối chuỗi, đóng hộp kiểu giá trị, closure bắt biến, mảng tạm từ hàm thư viện; không dòng nào trông giống `new`. Tôi đo bằng byte cấp phát mỗi frame và nhắm mục tiêu 0 trong vòng lặp chính.
- *"Mobile khác PC chỗ nào?"* → Ba điểm. Throttle nhiệt sau mười tới mười lăm phút. **Băng thông bộ nhớ** là nút thắt chính chứ không phải số đa giác — giảm độ phân giải texture thường ăn hơn giảm poly. Và pin cũng là ngân sách; game làm nóng máy sẽ bị gỡ dù nó mượt, nên 30 FPS ổn định đôi khi là quyết định đúng chứ không phải thoả hiệp.
- *"Dùng AI để tối ưu thế nào?"* → Ranh giới rõ: **AI không có profiler, tôi có**. Tôi đo rồi giao việc cụ thể kèm số liệu, không đưa code hỏi "tối ưu giúp tôi". Việc tôi giao nhiều nhất là liệt kê mọi dòng gây cấp phát ẩn — đọc kỹ, tẻ nhạt, máy làm tốt hơn người.

**Cờ đỏ**

- Bắt đầu tối ưu bằng việc sửa thứ mình nghĩ là chậm.
- Báo cáo hiệu năng bằng FPS trung bình.
- Không nói được máy đích là máy nào.
- Tối ưu số đa giác mà chưa xác định nghẽn ở CPU hay GPU.
- Đo mobile trong hai phút đầu.
- Đề xuất cache mà không nói được khi nào cache hết hiệu lực.
- Sửa ba thứ cùng lúc rồi tuyên bố đã tối ưu xong.

**Số / ví dụ nên thuộc**

- Ngân sách: **33,3 ms** (30 FPS) · **16,6 ms** (60) · **8,3 ms** (120); thực tế nhắm **~12 ms** cho 60 FPS.
- Chỉ số dùng: **1% thấp nhất** và **0,1% thấp nhất**, không phải trung bình.
- Phân bổ khởi điểm: render **40–50%** · logic **15–20%** · vật lý **10–15%** · AI **10%** · dự phòng **10%**.
- Ba nguyên nhân spike: **cấp phát mỗi frame · Instantiate/Destroy lúc chạy · nhiều agent tìm đường cùng frame**; thứ tư là **nạp tài nguyên giữa gameplay**.
- Mục tiêu cấp phát trong vòng lặp chính: **0 byte/frame**.
- Mobile: throttle sau **10–15 phút** → luôn đo sau **15 phút** chơi liên tục.
- Phân biệt CPU/GPU: **giảm độ phân giải**, nhanh hơn thì nghẽn GPU.
