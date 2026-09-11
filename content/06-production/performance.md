---
title: Performance
icon: ⚡
summary: Ngân sách frame, profiling, và những nguyên nhân giật lag phổ biến nhất.
status: stub
read: 580
level: advanced
order: 50
tags: [production, optimization]
related: [architecture-patterns, pathfinding, data-driven-design]
---

## Ngân sách frame

| Mục tiêu | Ngân sách mỗi frame |
|---|---|
| 30 FPS | 33.3 ms |
| 60 FPS | 16.6 ms |
| 120 FPS | 8.3 ms |

Ở 60 FPS, ngân sách thực tế nên là **~12ms** — chừa biên độ cho biến động và cho máy yếu hơn máy bạn.

## Cần bồi đắp

- [ ] Quy trình profiling: đo trước, đoán sau
- [ ] Phân bổ ngân sách: render / logic / physics / AI
- [ ] Áp lực GC và cách loại bỏ cấp phát
- [ ] Draw call, batching, atlas
- [ ] LOD và culling
- [ ] Tối ưu riêng cho mobile

## Ghi chú tạm

**Giật lag tệ hơn FPS thấp đều.** 60 FPS với một cú khựng 200ms mỗi 10 giây cảm thấy tệ hơn 40 FPS ổn định. Ưu tiên loại bỏ spike trước khi nâng FPS trung bình.

**Ba nguyên nhân giật lag phổ biến nhất trong game indie:**
1. **Cấp phát trong vòng lặp mỗi frame** → GC chạy → khựng. Xem object pooling ở [[architecture-patterns]].
2. **Instantiate/Destroy lúc chạy** → cùng vấn đề, nghiêm trọng hơn.
3. **Nhiều agent tìm đường trong cùng một frame** → xem [[pathfinding]] về việc trải đều theo thời gian.

**Đo trước, tối ưu sau.** Trực giác về hiệu năng gần như luôn sai. Nguyên nhân thật thường nằm ở chỗ bạn không ngờ tới.

**AI viết code đúng nhưng hay tốn.** Agent mặc định ưu tiên code sạch và dễ đọc — LINQ trong vòng lặp, nối chuỗi, cấp phát vô tư. Hãy đưa ràng buộc hiệu năng vào prompt ngay từ đầu, đừng để tối ưu sau. Xem [[agent-guardrails]].

## 🤖 Prompt cho AI

AI viết code sạch và **tốn**. Ràng buộc hiệu năng phải đưa từ đầu, không phải tối ưu sau.

**Phải nêu rõ:**
- Ngân sách ms/frame cho hệ thống đang làm
- Cấm cấp phát trong vòng lặp nóng, nói rõ cấm cái gì
- Số lượng đối tượng ở tình huống xấu nhất
- Nền tảng yếu nhất phải chạy được

**Mẫu prompt**

```
Ràng buộc hiệu năng cho MỌI code trong phiên này:

Ngân sách: hệ thống này <= 1.5ms/frame ở tình huống xấu nhất (200 thực thể).
Nền tảng yếu nhất: mobile tầm trung, 60 FPS.

TRONG vòng lặp mỗi frame, CẤM:
- new / Instantiate / Destroy
- LINQ (Where, Select, OrderBy, Any...)
- Nối chuỗi, string.Format, interpolation
- GetComponent, Find, FindObjectOfType
- foreach trên collection trả về struct enumerator bị boxing

BẮT BUỘC:
- Object pool cho mọi thứ spawn lúc chạy
- Cache mọi tham chiếu component trong Awake
- Mảng/List cấp phát sẵn, tái dùng qua các frame

Sau khi viết xong, tự rà lại code và chỉ ra mọi chỗ còn cấp phát.
```

**Bẫy thường gặp:** giật lag định kỳ do GC, không phải FPS thấp. 60 FPS có một cú khựng 200ms mỗi 10 giây cảm thấy tệ hơn 40 FPS ổn định.

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
