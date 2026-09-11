---
title: Economy Design
icon: 💰
summary: Source, sink, faucet-drain — thiết kế dòng chảy tài nguyên để game không lạm phát và không bế tắc.
status: deep
read: 180
level: intermediate
order: 10
tags: [systems, economy, math]
related: [progression, balancing-math, meta-systems]
---

Mọi game có tài nguyên đều có một nền kinh tế, kể cả khi bạn không cố ý thiết kế nó. Không thiết kế nghĩa là để nó tự hỏng.

## Ba khái niệm

- **Source (faucet)** — nơi tài nguyên sinh ra: rơi đồ từ quái, phần thưởng nhiệm vụ, thu hoạch.
- **Sink (drain)** — nơi tài nguyên biến mất: mua bán, nâng cấp, sửa chữa, phí.
- **Converter** — biến tài nguyên này thành tài nguyên khác: chế tạo, luyện kim.

Sức khoẻ nền kinh tế = **tốc độ source so với tốc độ sink theo thời gian**.

| Tình trạng | Hậu quả |
|---|---|
| Source > Sink kéo dài | Lạm phát. Tiền vô nghĩa, mọi phần thưởng mất giá, người chơi hết mục tiêu. |
| Sink > Source kéo dài | Bế tắc. Người chơi cày mà không tiến, bỏ game. |
| Cân bằng nhưng tĩnh | Nhàm. Không có cảm giác giàu lên. |

Mục tiêu **không phải** là cân bằng hoàn hảo. Mục tiêu là *dư nhẹ ở giai đoạn đầu* (cảm giác tiến bộ), *thắt dần về sau* (tài nguyên trở nên có giá trị).

## Cái bẫy chết người: sink không co giãn

Sai lầm kinh điển — sink là hằng số còn source tăng theo cấp độ:

```
Nâng cấp vũ khí: luôn 500 vàng
Quái cấp 1 rơi:  10 vàng     → cần 50 con
Quái cấp 50 rơi: 800 vàng    → cần 0.6 con
```

Đến cấp 50, tiền hoàn toàn vô nghĩa. Cách sửa: **sink phải tăng theo cùng bậc với source.**

```
chi_phí_nâng_cấp(n) = chi_phí_gốc × tăng_trưởng^n
```

với `tăng_trưởng` khoảng 1.15–1.35 cho hầu hết game. Dưới 1.1 thì cuối game quá dễ; trên 1.5 thì tường cày cuốc dựng lên quá sớm.

## Sink cứng và sink mềm

- **Sink cứng** — tài nguyên biến mất vĩnh viễn: phí sửa chữa, thuế, tiêu hao vật phẩm. Chống lạm phát rất tốt nhưng dễ gây ức chế nếu lộ liễu.
- **Sink mềm** — tài nguyên đổi thành thứ có giá trị: nâng cấp, đồ trang trí, mở khoá. Người chơi thích, nhưng *bão hoà* — mua hết rồi thì hết sink.

Game sống lâu cần **sink mềm vô hạn**: cosmetic, hạng bậc, tài nguyên phục vụ nội dung endgame.

## Nhiều loại tiền tệ

Thêm loại tiền thứ hai khi — và chỉ khi — bạn cần **tách biệt hai trục tiến trình**. Ví dụ:

- `vàng` — dồi dào, cho nâng cấp ngang, tiêu thường xuyên.
- `lõi` — khan hiếm, cho nâng cấp dọc, quyết định quan trọng.

Mỗi loại tiền thêm vào là một chi phí nhận thức cho người chơi. Ba loại là giới hạn thực tế của phần lớn game; quá số đó người chơi ngừng theo dõi.

**Luật quan trọng:** không bao giờ cho phép đổi tiền khan hiếm ↔ tiền dồi dào theo cả hai chiều với tỉ giá cố định. Làm vậy là gộp chúng thành một loại tiền duy nhất, và người chơi sẽ tìm ra vòng lặp tạo tiền vô hạn.

## Mô phỏng trước khi phát hành

Đừng tin trực giác về đường cong kinh tế. Viết mô phỏng — đây là việc AI làm rất tốt:

> *"Viết script Python mô phỏng 1000 người chơi trong 30 ngày. Mỗi người chơi 45 phút/ngày, kiếm vàng theo `earn_rate(level)`, tiêu theo chính sách `mua nâng cấp rẻ nhất có thể`. Vẽ đồ thị vàng tồn kho trung vị, phân vị 10 và 90 theo ngày. Cảnh báo nếu trung vị tăng đơn điệu sau ngày 7."*

Trung vị tăng đơn điệu = lạm phát. Phân vị 10 chạm 0 và nằm đó = nhóm người chơi bị bế tắc.

## Đạo đức và monetization

Nếu game có mua bán thật, hai ranh giới nên tự đặt:

1. **Không bán sức mạnh trong môi trường cạnh tranh.** Pay-to-win giết cộng đồng nhanh hơn mọi lỗi kỹ thuật.
2. **Không thiết kế sự khó chịu rồi bán thuốc giải.** Timer chờ, túi đồ cố tình nhỏ — đây là bán lại thứ lẽ ra đã miễn phí.

Xem thêm phần cảnh báo ở [[player-motivation]].

## 🤖 Prompt cho AI

Kinh tế là mảng AI đề xuất số **nghe rất hợp lý mà sai**. Đừng bao giờ nhận con số trực tiếp — bắt nó mô phỏng.

**Phải nêu rõ:**
- Danh sách source và sink, kèm tốc độ dự kiến
- Bậc tăng trưởng của sink (hằng số hay theo cấp — đây là chỗ hỏng phổ biến nhất)
- Số loại tiền tệ và **cấm đổi qua lại** giữa tiền khan hiếm và tiền dồi dào
- Mốc thời gian cần kiểm tra lạm phát (ngày 7, ngày 30)

**Mẫu prompt**

```
Viết script Python mô phỏng nền kinh tế. KHÔNG đưa con số dựa trên trực giác.

Source: quái rơi vàng = 8 * (1.12 ^ level)
Sink:   nâng cấp thứ n = 200 * (1.25 ^ n)
Tiền:   vàng (dồi dào) + lõi (khan hiếm). CẤM đổi lõi -> vàng.

Mô phỏng 1000 người chơi × 30 ngày, 45 phút/ngày,
chính sách mua: luôn mua nâng cấp rẻ nhất có thể.

Xuất ra:
- Đồ thị vàng tồn kho: trung vị, phân vị 10 và 90 theo ngày
- CẢNH BÁO nếu trung vị tăng đơn điệu sau ngày 7 (lạm phát)
- CẢNH BÁO nếu phân vị 10 chạm 0 và nằm đó > 3 ngày (bế tắc)

Sau khi có kết quả, đề xuất điều chỉnh rồi CHẠY LẠI để chứng minh.
```

**Bẫy thường gặp:** AI chọn sink là hằng số vì dễ. Đến cấp 50 tiền thành vô nghĩa. Luôn khai báo sink theo công thức có `level` hoặc `n` trong đó.

## 🎮 Unity

Kinh tế là mảng cần **mô phỏng ngoài Unity**. Chạy 30 ngày ảo × 1000 người chơi trong Play Mode là vô nghĩa; chạy bằng C# thuần thì mất vài giây.

**Nơi các quyết định sống**

- `Core/Economy/` — `EarnCurve`, `CostCurve`, `EconomySimulator` (C# thuần)
- `Assets/Data/Balance/economy.csv` — bảng số, sửa trên Google Sheets
- `Assets/Editor/EconomyImporter.cs` — CSV → ScriptableObject

**Công thức trong AnimationCurve hay trong code?**

| | AnimationCurve | Công thức trong code |
|---|---|---|
| Nhìn thấy hình dạng | Kéo bằng chuột, thấy ngay | Phải vẽ đồ thị riêng |
| Mô phỏng ngoài Unity | **Không dùng lại được** | Chạy được ở mọi nơi |
| Chỉnh nhanh | Rất nhanh | Phải build lại |

Cách dung hoà thực dụng: **dùng AnimationCurve để *tìm* hình dạng, rồi fit một công thức xấp xỉ** cho phần mô phỏng. Hoặc xuất curve thành bảng 50 điểm ra JSON để code ngoài Unity đọc được.

**Mô phỏng không cần Unity**

```csharp
// Core/Economy/EconomySimulator.cs — KHÔNG using UnityEngine
public static class EconomySimulator {
    public static SimResult Run(EconomyParams p, int players, int days, int seed) {
        var rng = new System.Random(seed);          // KHÔNG UnityEngine.Random
        var gold = new List<double>(players);
        // ... 45 phút/ngày, mua nâng cấp rẻ nhất có thể
        return new SimResult {
            MedianGoldByDay = ..., P10 = ..., P90 = ...
        };
    }
}
```

Dùng `System.Random` có seed, không `UnityEngine.Random` — nó là static toàn cục, không tất định giữa các lần chạy, và không tồn tại ngoài Unity.

Rồi gọi từ một EditorWindow **và** từ một console project riêng. Cùng một file logic, hai cách chạy.

**Cảnh báo lạm phát ngay trong Editor**

```csharp
if (GUILayout.Button("Kiểm tra lạm phát")) {
    var r = EconomySimulator.Run(p, 1000, 30, seed: 42);
    for (int d = 8; d < 30; d++)
        if (r.MedianGoldByDay[d] > r.MedianGoldByDay[d - 1] * 1.05)
            Debug.LogWarning($"Vàng trung vị tăng đơn điệu từ ngày {d} — lạm phát");
    if (r.P10.Skip(10).Take(3).All(g => g < 1))
        Debug.LogWarning("Phân vị 10 kẹt ở 0 — nhóm người chơi bị bế tắc");
}
```

**Bẫy Unity cụ thể**
- **`UnityEngine.Random` trong logic kinh tế** → không tái hiện được kết quả mô phỏng.
- **`float` cho tiền tệ** → sai số tích luỹ sau hàng nghìn giao dịch. Dùng `long` (đơn vị nhỏ nhất) hoặc `decimal`.
- **Sửa số trong Play Mode rồi quên** — ScriptableObject giữ lại thay đổi. Tiện lợi, nhưng cũng là cách vô tình phá cân bằng.

**Kiểm tra nhanh**
- Mô phỏng cùng seed hai lần: kết quả giống hệt không?
- Chạy được logic kinh tế ngoài Unity (`dotnet run`) không?
- Tiền tệ đang lưu bằng `long` chứ không `float`?
