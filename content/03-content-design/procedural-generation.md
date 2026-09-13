---
title: Procedural Generation
icon: 🌀
summary: Sinh nội dung bằng thuật toán — các kỹ thuật chính, và vì sao "vô hạn" thường đồng nghĩa với "nhạt".
status: deep
read: 300
level: advanced
order: 20
tags: [content, procgen, algorithm]
related: [level-design, randomness, ai-director]
---

Procedural generation (procgen) là dùng thuật toán để sinh nội dung thay vì làm tay. Nó giải quyết vấn đề *quy mô*, nhưng thường tạo ra vấn đề *ý nghĩa*.

## Bài học từ No Man's Sky

18 triệu tỉ hành tinh. Người chơi vẫn thấy chán sau vài giờ. Lý do: **đa dạng về mặt thống kê không phải đa dạng về mặt cảm nhận.** Khi mọi thứ đều ngẫu nhiên, không gì đặc biệt cả.

Ngược lại: Spelunky sinh màn từ một tập nhỏ các mẫu thủ công, và mỗi màn đều cảm thấy có chủ ý.

**Nguyên tắc rút ra:** procgen nên *sắp xếp lại nội dung thủ công*, không nên *sinh nội dung từ số không*.

## Bốn kỹ thuật nền

**Ghép phòng (room stitching)** — làm sẵn N phòng bằng tay, nối theo luật.
Dễ kiểm soát nhất, chất lượng cao nhất. Dùng bởi Spelunky, Binding of Isaac, Enter the Gungeon. **Nên bắt đầu từ đây.**

**Nhiễu (noise)** — Perlin/Simplex cho địa hình, độ cao, sinh quần xã.
Tốt cho thế giới tự nhiên liên tục. Kém cho không gian có cấu trúc — hang động sinh bằng noise trông đẹp nhưng thường không có ý nghĩa gameplay.

**Ngữ pháp / L-system** — luật viết lại sinh ra cấu trúc.
`Dungeon → Vào + Nhánh(2..4) + Boss`. Tốt để đảm bảo tính chất cấu trúc ở mức cao.

**Wave Function Collapse** — lan truyền ràng buộc từ một mẫu ví dụ.
Kết quả cục bộ nhất quán rất ấn tượng, nhưng khó điều khiển mục tiêu tổng thể và có thể thất bại (mâu thuẫn), cần cơ chế quay lui.

## Ràng buộc quan trọng hơn thuật toán

Phần khó của procgen không phải sinh ra thứ gì đó — mà là **đảm bảo thứ sinh ra chơi được**. Luôn kiểm tra sau khi sinh:

- [ ] Đích đến có tới được từ điểm xuất phát không? (flood fill)
- [ ] Có bao nhiêu ngõ cụt? Dài bao nhiêu?
- [ ] Tổng ngân sách kẻ địch có nằm trong khoảng cho phép không?
- [ ] Có ít nhất một vòng lặp không? (xem [[level-design]])
- [ ] Có phòng mồ côi không?
- [ ] Tài nguyên tối thiểu (máu, đạn) có đủ để hoàn thành không?

Kiến trúc thực dụng: **sinh → kiểm tra → nếu hỏng thì sinh lại (hoặc sửa)**. Sinh lại rẻ hơn nhiều so với viết thuật toán luôn đúng. Ba, bốn lần thử vẫn là micro giây.

## Giữ độ đặc biệt

Kỹ thuật chống lại sự nhạt nhoà:

- **Nội dung đặt tay trong khung thủ tục** — luôn có một phòng kho báu độc bản, một mini-boss viết tay ở mỗi tầng.
- **Mẫu hiếm** — một số phòng chỉ xuất hiện 2% số lần. Người chơi sẽ kể cho nhau nghe về chúng.
- **Seed cố định cho thử thách hằng ngày** — mọi người cùng chơi một màn → tạo cộng đồng và so sánh được kỹ năng.
- **Sinh có định hướng** — sinh theo mục tiêu nhịp độ chứ không đơn thuần ngẫu nhiên (xem [[ai-director]]).

## Luôn dùng seed

Mọi bộ sinh phải nhận vào một seed và **tất định** với seed đó.

```
generate(seed: 8471023) → luôn cho ra cùng một màn
```

Không có điều này, bạn không tái hiện được bug, không làm được daily challenge, không so sánh được hai phiên bản thuật toán. Đây là quyết định kiến trúc cần chốt từ ngày đầu — thêm vào sau rất đắt.

Dùng một bộ sinh số ngẫu nhiên **riêng cho procgen**, tách khỏi RNG gameplay. Nếu chúng dùng chung, hành động của người chơi sẽ làm thay đổi màn được sinh ra.

## 🤖 Prompt cho AI

Đây là một trong những chỗ AI agent có ích rõ ràng:

- **Viết bộ sinh từ mô tả ràng buộc** — mô tả luật bằng tiếng Việt, nhận về code chạy được.
- **Viết bộ kiểm tra (validator)** — thường tốn công hơn bộ sinh, và AI viết rất nhanh.
- **Dò seed hỏng** — *"chạy 100.000 seed, tìm những seed vi phạm ràng buộc, in ra"*. Đây là loại việc lặp lại mà con người làm rất tệ.
- **Sinh dữ liệu mẫu** — 50 mẫu phòng dạng JSON theo schema bạn định nghĩa, rồi bạn sàng lọc.

Điều AI **không** làm được: quyết định thế nào là một màn chơi *hay*. Phần đó vẫn phải tự chơi và cảm nhận.

## 🎮 Unity

Procgen trong Unity đứng hoặc chết ở một điểm: **tất định**. Và Unity có ba cái bẫy làm mất tính tất định mà không ai nghĩ tới.

**Ba thứ phá tính tất định**

1. **`UnityEngine.Random`** — static toàn cục, dùng chung với mọi hệ thống khác. Xem [[randomness]].
2. **`Object.FindObjectsByType` thứ tự không đảm bảo** — duyệt kết quả rồi sinh theo thứ tự đó là không tất định.
3. **`Dictionary` thứ tự duyệt** — trong .NET không đảm bảo. Dùng `SortedDictionary` hoặc `List` khi thứ tự ảnh hưởng kết quả sinh.

**Bộ sinh nằm ngoài Unity**

```csharp
// Core/Procgen/DungeonGenerator.cs — KHÔNG using UnityEngine
public static class DungeonGenerator {
    public static DungeonLayout Generate(GenParams p, int seed) {
        var rng = new System.Random(seed);
        var layout = StitchRooms(p, rng);
        return layout;      // dữ liệu thuần: toạ độ, loại phòng, kết nối
    }
}
```

Rồi một MonoBehaviour biến `DungeonLayout` thành GameObject. Tách như vậy cho bạn:
- Test EditMode: sinh 100.000 seed trong vài giây, không cần render
- Dò seed hỏng trong CI
- Cùng seed cho cùng layout, mọi nền tảng

**Dò seed hỏng — editor tool**

```csharp
[MenuItem("Tools/Procgen/Scan 100k Seeds")]
static void Scan() {
    var bad = new List<int>();
    for (int seed = 0; seed < 100_000; seed++) {
        var layout = DungeonGenerator.Generate(defaultParams, seed);
        if (!Validator.IsPlayable(layout, out string why)) bad.Add(seed);
    }
    Debug.Log($"{bad.Count} seed hỏng: {string.Join(", ", bad.Take(20))}");
}
```

Chạy được vì generator không phụ thuộc Unity. Nếu nó phải Instantiate GameObject thì 100.000 seed là hàng giờ.

**Tilemap cho 2D — nhanh hơn nghĩ**

```csharp
// Đặt cả mảng một lần, KHÔNG SetTile từng ô
tilemap.SetTilesBlock(bounds, tileArray);
```

`SetTile` từng ô cho một bản đồ 200×200 là 40.000 lệnh; `SetTilesBlock` là một lệnh. Khác biệt hàng giây.

**Sinh dần theo chunk — đừng sinh cả bản đồ một frame**

```csharp
// Sinh 200x200 trong một frame = khựng 2 giây.
// Chia chunk và trải qua nhiều frame:
foreach (var chunk in layout.Chunks) {
    BuildChunk(chunk);
    if (stopwatch.ElapsedMilliseconds > 8) { yield return null; stopwatch.Restart(); }
}
```

Ngân sách 8ms/frame giữ được 60 FPS trong lúc sinh.

**Bẫy Unity cụ thể**
- **`Instantiate` trong vòng lặp sinh** → GC spike lớn. Pool, hoặc dùng Tilemap/mesh gộp.
- **Quên bake NavMesh sau khi sinh** → NPC không đi được. Dùng `NavMeshSurface.BuildNavMeshAsync()` runtime.
- **Seed lấy từ `DateTime.Now`** → không log lại được seed của lần chơi bị bug. Luôn log seed.

**Kiểm tra nhanh**
- Cùng seed hai lần: layout giống hệt từng ô không?
- Chạy Scan 100k Seeds: bao nhiêu seed hỏng? (nên 0, hoặc có cơ chế sinh lại)
- Sinh bản đồ lớn: FPS có tụt dưới 50 không?
- Seed có được log ra khi crash không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Procgen là gì, và nó giải quyết vấn đề gì — tạo ra vấn đề gì?**
  → Dùng thuật toán sinh nội dung thay vì làm tay. Nó giải quyết vấn đề **quy mô** và thường tạo ra vấn đề **ý nghĩa**: No Man's Sky có 18 triệu tỉ hành tinh mà người chơi vẫn chán sau vài giờ, vì **đa dạng về thống kê không phải đa dạng về cảm nhận** — khi mọi thứ đều ngẫu nhiên thì không gì đặc biệt.
- `Junior` **Bốn kỹ thuật procgen nền, và nên bắt đầu từ cái nào?**
  → **Ghép phòng** (làm sẵn N phòng bằng tay, nối theo luật) — nên bắt đầu từ đây vì dễ kiểm soát và chất lượng cao nhất; Spelunky, Binding of Isaac, Enter the Gungeon đều dùng. **Nhiễu** Perlin/Simplex cho địa hình tự nhiên. **Ngữ pháp / L-system** cho tính chất cấu trúc ở mức cao. **Wave Function Collapse** cho nhất quán cục bộ.
- `Junior` **Vì sao mọi bộ sinh phải nhận seed và tất định?**
  → Vì thiếu nó thì **không tái hiện được bug**, không làm được daily challenge cùng màn cho mọi người, và không so sánh được hai phiên bản thuật toán trên cùng bản đồ. Đây là quyết định kiến trúc phải chốt từ ngày đầu — thêm vào sau rất đắt vì mọi chỗ gọi random đều phải đi qua bộ sinh riêng.
- `Mid` **Nguyên tắc rút ra từ so sánh No Man's Sky và Spelunky là gì?**
  → **Procgen nên sắp xếp lại nội dung thủ công, không nên sinh nội dung từ số không.** Spelunky sinh màn từ một tập nhỏ các mẫu do người làm, nên mỗi màn đều cảm thấy có chủ ý; No Man's Sky sinh từ tham số nên mọi hành tinh đều "hợp lệ" và không hành tinh nào đáng nhớ.
- `Mid` **Phần khó nhất của procgen là gì?**
  → Không phải sinh ra thứ gì đó, mà là **đảm bảo thứ sinh ra chơi được**. Danh sách kiểm sau khi sinh: đích có tới được từ điểm xuất phát không (flood fill), bao nhiêu ngõ cụt và dài bao nhiêu, ngân sách kẻ địch có trong khoảng cho phép không, có ít nhất một vòng lặp không, có phòng mồ côi không, và tài nguyên tối thiểu có đủ để hoàn thành không.
- `Mid` **Kiến trúc thực dụng khi bản sinh ra không hợp lệ?**
  → **Sinh → kiểm tra → hỏng thì sinh lại.** Sinh lại rẻ hơn nhiều so với viết một thuật toán luôn đúng ngay lần đầu, và ba bốn lần thử vẫn chỉ là micro giây. Chỉ chuyển sang "sửa tại chỗ" khi tỉ lệ hỏng cao tới mức sinh lại thành tốn — và lúc đó con số tỉ lệ hỏng cũng nói cho mình biết ràng buộc nào đang quá chặt.
- `Senior` **Chống lại sự nhạt nhoà của nội dung sinh tự động bằng cách nào?**
  → Bốn kỹ thuật. **Nội dung đặt tay trong khung thủ tục** — luôn có một phòng kho báu độc bản hoặc mini-boss viết tay mỗi tầng. **Mẫu hiếm** xuất hiện 2% số lần — người chơi sẽ kể cho nhau nghe về chúng. **Seed cố định cho thử thách hằng ngày** để tạo cộng đồng và so sánh kỹ năng. Và **sinh có định hướng** theo mục tiêu nhịp độ chứ không ngẫu nhiên thuần.
- `Senior` **Vì sao phải tách RNG của procgen khỏi RNG gameplay?**
  → Vì dùng chung thì **hành động của người chơi làm đổi màn được sinh ra** — bắn thêm một phát là bố cục phòng sau khác đi. Hệ quả: mất khả năng tái hiện bug từ báo cáo, daily challenge không còn giống nhau giữa các người chơi, và không so sánh được hai thuật toán trên cùng một bản đồ.
- `Senior` **Wave Function Collapse mạnh ở đâu và rủi ro ở đâu?**
  → Mạnh ở **nhất quán cục bộ**: lan truyền ràng buộc từ một mẫu ví dụ, cho ra kết quả trông như do người làm ở từng vùng nhỏ. Rủi ro là **khó điều khiển mục tiêu tổng thể** — nó không biết "màn này cần ba cao trào" — và nó **có thể thất bại** khi ràng buộc mâu thuẫn, nên cần cơ chế quay lui và một đường lui khi quay lui cũng không xong.

**Khung trả lời 60 giây** — "Anh dựng một bộ sinh màn thế nào?"

> Bắt đầu bằng **ghép phòng**: làm sẵn một tập phòng bằng tay rồi nối theo luật. Đó là cách dễ kiểm soát nhất và cho chất lượng cao nhất — Spelunky, Isaac, Gungeon đều làm vậy. Nguyên tắc bao trùm là **procgen sắp xếp lại nội dung thủ công, không sinh từ số không**; bài học No Man's Sky là đa dạng thống kê không phải đa dạng cảm nhận.
>
> Phần khó không phải sinh mà là **đảm bảo chơi được**. Sau mỗi lần sinh tôi chạy một danh sách kiểm: flood fill xem đích có tới được không, đếm ngõ cụt, kiểm ngân sách kẻ địch, kiểm có ít nhất một vòng lặp, kiểm phòng mồ côi, kiểm tài nguyên tối thiểu. Hỏng thì **sinh lại** — rẻ hơn nhiều so với viết thuật toán luôn đúng.
>
> Và hai quyết định kiến trúc chốt từ ngày đầu: mọi thứ đi qua **một seed** và tất định với seed đó, và **RNG của procgen tách khỏi RNG gameplay** — nếu không, hành động của người chơi sẽ làm đổi màn được sinh, và mình mất khả năng tái hiện bug lẫn làm daily challenge.

**Họ sẽ đào tiếp**

- *"Vì sao mẫu hiếm 2% lại đáng làm?"* → Vì nó tạo **chuyện để kể**. Người chơi gặp một lần trong năm mươi run sẽ nhớ và kể lại, và chính những mẩu chuyện đó là thứ giữ cộng đồng sống. Nội dung xuất hiện mọi lần thì không ai nhắc tới — đó là nghịch lý của procgen: thứ hiếm mới tạo giá trị cho thứ thường.
- *"Noise hỏng ở đâu?"* → Ở không gian **có cấu trúc**. Hang động sinh bằng Perlin trông đẹp trong ảnh chụp nhưng thường không có ý nghĩa gameplay: không có nhịp, không có điểm mốc, không có lý do để đi hướng này thay vì hướng kia. Noise hợp với địa hình và quần xã, còn bố cục thì cần luật.
- *"Đo chất lượng của bộ sinh thế nào?"* → Chạy hàng nghìn seed rồi thống kê: phân bố độ dài đường đi, số ngõ cụt, ngân sách địch, tỉ lệ sinh lại. Nhìn **đuôi phân bố** chứ không nhìn trung bình — bộ sinh tốt trung bình mà có 1% seed cho ra màn không hoàn thành được vẫn là bộ sinh hỏng, vì 1% người chơi sẽ gặp nó.
- *"Dùng AI ở khâu này thế nào?"* → Giao cho nó viết **bộ kiểm tra và bộ chạy hàng loạt seed** — đó là việc tẻ nhạt và là chỗ giá trị thật nằm. Cũng đáng giao việc soi 1000 seed để tìm seed vi phạm ràng buộc. Còn phần tạo *mẫu phòng* thì vẫn nên do người làm, vì đó chính là phần "nội dung thủ công" mà cả kiến trúc này dựa vào.

**Cờ đỏ**

- Không có seed, hoặc seed không tất định.
- Dùng chung RNG với gameplay.
- Không có bước kiểm tra sau khi sinh, chỉ tin vào thuật toán.
- Đo bộ sinh bằng trung bình, không nhìn đuôi phân bố.
- Bắt đầu bằng WFC hoặc noise cho một game cần bố cục có nhịp.

**Số / ví dụ nên thuộc**

- Bốn kỹ thuật: **ghép phòng · noise · ngữ pháp/L-system · WFC**; bắt đầu từ ghép phòng.
- Nguyên tắc: **sắp xếp lại nội dung thủ công**, không sinh từ số không.
- Vòng đời: **sinh → kiểm tra → sinh lại**; vài lần thử vẫn là micro giây.
- Danh sách kiểm: tới được đích (flood fill) · ngõ cụt · ngân sách địch · **có vòng lặp** · phòng mồ côi · tài nguyên tối thiểu.
- Mẫu hiếm ≈ **2%**; seed cố định cho **daily challenge**; RNG procgen **tách** khỏi RNG gameplay.
