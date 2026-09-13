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

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Source, sink, converter là gì?**
  → **Source (faucet)** là nơi tài nguyên sinh ra: rơi đồ, thưởng nhiệm vụ, thu hoạch. **Sink (drain)** là nơi nó biến mất: mua bán, nâng cấp, sửa chữa, phí. **Converter** biến tài nguyên này thành tài nguyên khác: chế tạo, luyện kim. Sức khoẻ nền kinh tế là **tốc độ source so với tốc độ sink theo thời gian**, không phải tổng lượng tại một thời điểm.
- `Junior` **Source nhiều hơn sink kéo dài thì hỏng thế nào?**
  → Lạm phát: tiền mất nghĩa, mọi phần thưởng mất giá, và người chơi hết mục tiêu — cái cuối mới là thứ giết game. Ngược lại, sink nhiều hơn source kéo dài thì bế tắc: cày mà không tiến, người chơi bỏ. Cân bằng tuyệt đối lại nhàm, vì không có cảm giác giàu lên.
- `Junior` **Sink cứng và sink mềm khác nhau thế nào?**
  → **Sink cứng** làm tài nguyên biến mất vĩnh viễn — phí sửa chữa, thuế, tiêu hao. Chống lạm phát rất tốt nhưng dễ gây ức chế nếu lộ liễu. **Sink mềm** đổi tài nguyên lấy thứ có giá trị — nâng cấp, trang trí, mở khoá. Người chơi thích, nhưng nó **bão hoà**: mua hết rồi là hết sink.
- `Mid` **Cái bẫy "sink không co giãn" là gì? Sửa thế nào?**
  → Sink là hằng số trong khi source tăng theo cấp độ — tới cấp 50 thì tiền hoàn toàn vô nghĩa. Sửa bằng cách cho **sink tăng cùng bậc với source**: hệ số tăng trưởng khoảng **1,15–1,35** cho hầu hết game. Dưới 1,1 thì cuối game quá dễ; trên 1,5 thì tường cày cuốc dựng lên quá sớm.
- `Mid` **Mục tiêu của một nền kinh tế lành mạnh là gì, nếu không phải cân bằng hoàn hảo?**
  → **Dư nhẹ ở giai đoạn đầu** để có cảm giác tiến bộ, rồi **thắt dần về sau** để tài nguyên trở nên có giá trị. Đường cong đó tạo ra hai cảm xúc khác nhau ở hai giai đoạn, trong khi cân bằng phẳng chỉ tạo ra sự đều đều — đúng kỹ thuật mà không ai thấy thú vị.
- `Mid` **Game sống lâu cần loại sink nào?**
  → **Sink mềm vô hạn**: cosmetic, hạng bậc, tài nguyên phục vụ nội dung endgame. Vì mọi sink hữu hạn đều bão hoà, và khi người chơi lâu năm đã mua hết thì họ trở thành nguồn lạm phát: vẫn kiếm tài nguyên mà không còn chỗ tiêu. Đó là lúc giá trong shop mất nghĩa với cả người mới.
- `Senior` **Sự kiện hằng tuần ảnh hưởng gì tới kinh tế?**
  → Mỗi sự kiện **phát thêm tài nguyên**, nên phải có drain tương ứng, nếu không thì sau ba tháng kinh tế lạm phát và mọi giá đã cân bằng trước đó đều sai. Đây là chi phí ẩn của LiveOps mà đội hay quên tính: nội dung thì có lịch, còn cân bằng kinh tế thì phải theo lịch đó.
- `Senior` **Kinh tế đã lạm phát rồi. Anh sửa thế nào mà không làm người chơi nổi giận?**
  → Không rút tài nguyên đã phát — thu hồi là cách nhanh nhất mất lòng tin. Cách dùng được là **thêm sink mới hấp dẫn** (nội dung endgame, cosmetic bậc cao), điều chỉnh source cho người mới để đường cong của họ đúng, và để lạm phát cũ tự loãng theo thời gian. Chậm hơn, nhưng nó không phá vỡ hợp đồng ngầm với người chơi.
- `Senior` **Đo sức khoẻ kinh tế bằng chỉ số nào?**
  → Tồn kho trung vị theo nhóm thời gian chơi (không phải trung bình — vài người chơi cực đoan kéo lệch hết), tỉ lệ source/sink theo tuần, và **thời gian để mua được món tiếp theo** ở từng giai đoạn. Con số cuối là thứ gần với trải nghiệm nhất: nó dài ra bất thường nghĩa là tường cày cuốc vừa dựng lên ở đâu đó.

**Khung trả lời 60 giây** — "Anh thiết kế nền kinh tế của một game thế nào?"

> Bắt đầu bằng việc vẽ ra **mọi source và mọi sink** — kể cả những cái không ai gọi là kinh tế, như tiêu hao đạn hay phí hồi sinh. Mọi game có tài nguyên đều có nền kinh tế, kể cả khi không ai cố ý thiết kế nó; không thiết kế nghĩa là để nó tự hỏng.
>
> Luật quan trọng nhất là **sink phải tăng cùng bậc với source**, hệ số khoảng 1,15–1,35. Cái bẫy kinh điển là sink hằng số trong khi source tăng theo cấp: tới cấp 50 thì tiền vô nghĩa, và lúc đó mọi phần thưởng trong game cũng vô nghĩa theo.
>
> Đích không phải cân bằng hoàn hảo mà là **dư nhẹ lúc đầu, thắt dần về sau**. Và với game sống lâu thì phải có **sink mềm vô hạn** — cosmetic, hạng bậc, tài nguyên endgame — vì mọi sink hữu hạn đều bão hoà, rồi người chơi lâu năm trở thành nguồn lạm phát.

**Họ sẽ đào tiếp**

- *"Vì sao sink cứng dễ gây ức chế?"* → Vì nó lấy đi thứ người chơi đã có mà không trả lại gì nhìn thấy được. Cách làm mềm nó là gắn vào một lựa chọn: phí sửa chữa thì cho phép tránh bằng cách chơi cẩn thận hơn, thuế thì đổi lấy dịch vụ. Sink cứng bị ghét nhất khi nó **không tránh được và không giải thích được**.
- *"Nhiều loại tiền tệ thì sao?"* → Mỗi loại tiền là một nền kinh tế riêng cần source và sink riêng, nên số loại tiền là chi phí thiết kế chứ không phải tính năng. Quy tắc tôi dùng: chỉ thêm loại tiền mới khi cần **ngăn chuyển đổi** giữa hai vòng tiến trình; nếu người chơi đổi qua đổi lại tự do thì thực chất vẫn là một loại tiền với thêm bước phiền phức.
- *"Kinh tế có giao dịch giữa người chơi khác gì?"* → Khác về bậc: người chơi trở thành cả source lẫn sink, và bot cày tự động trở thành source không giới hạn. Lúc đó cần sink cứng mạnh (phí giao dịch, tiêu hao) và cần giám sát, vì một lỗ hổng nhỏ bị nhân lên bởi cả cộng đồng trong vài giờ.
- *"Dùng AI ở khâu này thế nào?"* → Giao cho nó **mô phỏng dòng chảy**: cho tốc độ source và sink theo cấp, chạy 1000 người chơi ảo với vài kiểu chơi khác nhau, in ra tồn kho theo thời gian. Nó cũng tốt ở việc liệt kê các đường chuyển đổi tài nguyên mà mình không nghĩ tới — đó chính là chỗ lỗ hổng kinh tế hay nằm.

**Cờ đỏ**

- Không kể được sink nào ngoài "mua đồ trong shop".
- Sink hằng số trong khi source tăng theo cấp.
- Thêm sự kiện phát thưởng mà không thêm drain.
- Chữa lạm phát bằng cách thu hồi tài nguyên đã phát.
- Đọc tồn kho trung bình thay vì trung vị theo nhóm thời gian chơi.

**Số / ví dụ nên thuộc**

- Ba khái niệm: **source (faucet) · sink (drain) · converter**.
- Hệ số tăng trưởng sink theo source: **1,15–1,35**; dưới 1,1 quá dễ, trên 1,5 dựng tường cày cuốc.
- Đích: **dư nhẹ giai đoạn đầu → thắt dần về sau**, không phải cân bằng phẳng.
- Game sống lâu cần **sink mềm vô hạn**; mọi sink hữu hạn đều bão hoà.
- Chỉ số theo dõi: tồn kho **trung vị** theo nhóm thời gian chơi, tỉ lệ source/sink theo tuần, **thời gian để mua món tiếp theo**.
