---
title: Pacing & Flow
icon: 🌊
summary: Nhịp căng–chùng qua toàn bộ hành trình chơi, ở cả ba thang thời gian.
status: stub
read: 280
level: intermediate
order: 30
tags: [content, pacing]
related: [difficulty-curve, level-design, narrative]
---

Pacing là **đường cong cường độ theo thời gian**. Nó khác [[difficulty-curve]]: độ khó nói về *thử thách*, pacing nói về *cường độ cảm xúc* — bao gồm cả căng thẳng, yên tĩnh, bất ngờ, và thư giãn.

## Cần bồi đắp

- [ ] Biểu đồ cường độ ở ba thang: phòng / màn / toàn game
- [ ] Vai trò của khoảng lặng — vì sao phần yên tĩnh làm phần căng hay hơn
- [ ] Nhịp mở đầu: 30 giây, 5 phút, 30 phút đầu tiên
- [ ] Khoảng nghỉ giữa các cao trào: bao lâu là đủ
- [ ] Pacing trong game vòng lặp không có kết thúc (roguelike, idle)

## Ghi chú tạm

Sai lầm phổ biến: **cường độ đơn điệu**. Game toàn cao trào làm người chơi mệt và mất nhạy cảm — cao trào thứ mười không còn là cao trào nữa. Tương phản là thứ tạo ra đỉnh, không phải độ cao tuyệt đối.

Quy tắc thô: sau mỗi cao trào, dành **20–30% thời lượng** cho đoạn cường độ thấp trước cao trào tiếp theo.

Hai thời điểm đáng đầu tư nhất:
- **30 giây đầu** — quyết định người chơi có ở lại hay không.
- **Ngay sau một thất bại** — quyết định họ có thử lại hay không.

## 🤖 Prompt cho AI

Nhịp độ là thứ trừu tượng nhất trong kho này, nên cũng là thứ AI dễ trả lời chung chung nhất. Cách chữa: bắt nó xuất ra **đường cong dạng số**.

**Phải nêu rõ:**
- Thang thời gian đang nói tới (phòng / màn / cả game)
- Cường độ đo bằng gì — phải là đại lượng đếm được
- Tỉ lệ thời gian dành cho đoạn cường độ thấp
- Khoảng nghỉ tối thiểu sau cao trào

**Mẫu prompt**

```
Lập bản đồ nhịp độ cho một màn 12 phút.

Cường độ đo bằng: (số kẻ địch đồng thời × 2) + (sát thương nhận/10s)
Xuất ra BẢNG SỐ theo từng 30 giây: cường độ mục tiêu 0-10.

Ràng buộc:
- Đúng 3 cao trào, cao trào cuối mạnh nhất
- Sau mỗi cao trào: >= 60s cường độ <= 2
- Tổng thời gian cường độ <= 2 phải chiếm 25-30% màn
- Không có đoạn nào cường độ >= 7 kéo dài quá 45s

Sau bảng, vẽ đồ thị ASCII để tôi nhìn được hình dạng.
```

**Bẫy thường gặp:** hỏi "làm sao cho nhịp độ hay hơn" sẽ nhận về lời khuyên sách giáo khoa. Định nghĩa công thức cường độ biến câu hỏi thẩm mỹ thành bài toán kiểm tra được.

## 🎮 Unity

Nhịp độ trong Unity đo được, và đó là cách duy nhất để nó không còn là chuyện cảm tính.

**Nơi các quyết định sống**

- `Core/Pacing/IntensityMeter.cs` — công thức cường độ, C# thuần
- `Assets/Data/Levels/Level_XX.asset` — đường cong cường độ mục tiêu
- `Assets/Editor/PacingGraph.cs` — vẽ đồ thị đo được so với mục tiêu

**Đo cường độ bằng số**

```csharp
// Core/Pacing/IntensityMeter.cs
public class IntensityMeter {
    readonly Queue<(float t, float dmg)> window = new();

    public float Sample(float now, int enemiesAlive, float damageTaken) {
        window.Enqueue((now, damageTaken));
        while (window.Count > 0 && now - window.Peek().t > 10f) window.Dequeue();
        float dmgRate = window.Sum(w => w.dmg) / 10f;
        return Mathf.Clamp01((enemiesAlive * 2f + dmgRate) / 10f);
    }
}
```

Công thức cụ thể không quan trọng bằng việc **có một con số**. Có số thì vẽ được đồ thị, so được với mục tiêu, và biết đoạn nào phẳng lặng quá lâu.

**Ghi lại và vẽ — editor tool**

```csharp
// Ghi (thời điểm, cường độ) suốt một lần chơi, rồi vẽ bằng Handles
[MenuItem("Tools/Pacing/Show Last Session")]
static void Show() {
    var samples = PacingRecorder.LoadLast();   // JSON trong persistentDataPath
    // vẽ đường đo được (xanh) chồng lên đường mục tiêu (xám nét đứt)
}
```

Nhìn hai đường chồng nhau là thấy ngay: chỗ nào game căng hơn dự kiến, chỗ nào lặng quá lâu. Đây là việc [[ai-director]] dùng để tự điều tiết, nhưng bạn nên nhìn bằng mắt trước khi tự động hoá.

**Khoảng lặng phải là quyết định, không phải tình cờ**

```csharp
// Director đảm bảo tối thiểu 30s không spawn sau cao trào — xem [[ai-director]].
// Trong Unity, nhớ rằng khoảng lặng nghe rõ hơn nếu ducking nhả về (xem [[unity-audio]])
// và post-processing giảm cường độ.
```

**Bẫy Unity cụ thể**
- **Dùng `Time.time` để đo nhịp** — nó bị `timeScale` ảnh hưởng, nên hitstop làm số liệu lệch. Dùng `Time.unscaledTime` cho đo đạc.
- **`Queue` trong `Update`** cấp phát khi lớn lên. Cấp phát sẵn capacity.
- **Ghi log mỗi frame** → file vài chục MB một phiên. Lấy mẫu 2Hz là đủ.

**Kiểm tra nhanh**
- Chơi một màn, mở đồ thị: có đoạn nào cường độ phẳng quá 60 giây không?
- Ba cao trào có tách nhau bằng đoạn thấp không?
- Đo bằng `unscaledTime` chứ không `time`?
