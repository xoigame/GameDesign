---
title: Systems Design
icon: ⚙️
summary: Thiết kế các hệ thống chạy ngầm — kinh tế, tiến trình, chiến đấu, cân bằng số — sao cho chúng sinh ra hành vi thú vị.
status: deep
read: 160
level: basic
order: 20
tags: [systems]
related: [foundations, production]
---

Systems design là nghề **thiết kế luật để hành vi thú vị tự nảy sinh**, thay vì viết sẵn từng tình huống.

Khác biệt cốt lõi so với content design: content design viết ra *"phòng này có 3 con goblin"*; systems design viết ra *"quái spawn theo ngân sách độ khó, goblin giá 2 điểm, cung thủ giá 5"*. Cái sau sinh ra vô số phòng, và quan trọng hơn — **điều chỉnh được**.

## Các node

- **[[economy-design]]** — nguồn vào, nguồn ra, và vì sao lạm phát giết game của bạn.
- **[[progression]]** — người chơi mạnh lên theo cách nào, và với nhịp độ nào.
- **[[combat-systems]]** — giải phẫu một hệ thống chiến đấu: đọc được, đếm được, phản ứng được.
- **[[balancing-math]]** — công thức, bảng số, và mô phỏng để không phải đoán mò.
- **[[difficulty-curve]]** — điều tiết thử thách quanh vùng dòng chảy.
- **[[randomness]]** — RNG dùng đúng chỗ thì tạo kịch tính, sai chỗ thì tạo bất công.
- **[[meta-systems]]** — những gì giữ người chơi giữa các phiên chơi.

## Nguyên tắc

**Hệ thống phải đọc được.** Người chơi cần suy luận được hệ quả hành động trước khi thực hiện. Hệ thống "sâu" mà không ai hiểu thì chỉ là hệ thống ngẫu nhiên.

**Ít luật, nhiều tương tác.** Chiều sâu đến từ số cách các luật giao nhau, không từ số lượng luật. Ba cơ chế tương tác được với nhau thường thú vị hơn mười cơ chế độc lập.

**Mọi hằng số nằm trong file dữ liệu.** Xem [[data-driven-design]]. Đây là điều kiện tiên quyết để cân bằng — và cũng là điều kiện để AI agent chỉnh số mà không phá vỡ logic.

**Thiết kế cho trường hợp suy biến.** Người chơi sẽ tìm ra cấu hình cực đoan nhất. Hệ thống nhân tỉ lệ phần trăm với nhau luôn dẫn tới bùng nổ theo cấp số nhân — hãy cộng trước khi nhân, hoặc đặt trần.

## 🤖 Prompt cho AI

**Dùng AI thế nào ở nhánh này**

Đây là nhánh AI mạnh nhất trong toàn kho, vì systems design thuần toán và mô phỏng được.

Quy trình bốn bước, lặp:

```
1. BẠN  mô tả hệ thống + ràng buộc + trần cứng
2. AI   chuyển thành công thức và bảng số
3. AI   viết harness mô phỏng 10.000 lượt, in phân bố
4. BẠN  đọc phân bố, chỉnh ràng buộc → quay lại 3
```

**Luật một dòng cho cả nhánh:** bắt AI *chạy mô phỏng*, đừng nhận con số nó khẳng định. Nó đưa số nghe hợp lý rất thuyết phục, và đó là dạng sai khó phát hiện nhất — xem [[ai-limits]].

Đây là mảng AI hỗ trợ **hiệu quả nhất** trong toàn bộ quá trình làm game, vì nó thuần toán và mô phỏng:

1. Bạn mô tả hệ thống bằng lời + ràng buộc.
2. AI chuyển thành công thức và bảng số.
3. AI viết script mô phỏng 10.000 lượt chơi.
4. Bạn đọc phân bố kết quả, chỉnh ràng buộc, lặp lại.

Vòng lặp này trước đây tốn hàng tuần. Xem [[balancing-math]] để biết cách làm cụ thể.

## 🎮 Unity

Systems design trong Unity là câu chuyện về **nơi đặt con số**. Phần kiến trúc chung nằm ở [[unity-design-patterns]] và [[unity-project-structure]].

**Ranh giới quan trọng nhất của cả nhánh này**

```
Assets/Scripts/
├── Core/Systems/     ← C# thuần: DamageCalculator, LootRoller, PriceCurve
│                       KHÔNG using UnityEngine
├── Data/             ← ScriptableObject chứa số
└── Unity/Systems/    ← MonoBehaviour mỏng, gọi vào Core
```

Vì sao đáng làm, cụ thể cho Unity:

- **Test chạy EditMode** (mili giây) thay vì PlayMode (vài giây mỗi lần bấm Play)
- **Mô phỏng 10.000 trận không cần mở Unity** — chạy bằng `dotnet run` trên project riêng tham chiếu cùng file. Đây là điều [[balancing-math]] cần.
- Assembly Definition cho `Core/` làm compile nhanh hơn rõ rệt — xem [[unity-project-structure]]

**Ba vai của ScriptableObject trong nhánh này**

| Vai | Ví dụ | Lưu ý |
|---|---|---|
| Dữ liệu cấu hình | `WeaponData`, `EnemyData` | **Read-only lúc chạy** |
| Kênh sự kiện | `GameEvent` (OnEnemyDied) | Tránh coupling giữa hệ thống |
| Biến dùng chung | `FloatVariable` (player HP) | Tiện nhưng dễ lạm dụng |

Chi tiết cả ba ở [[unity-design-patterns]]. Cái bẫy lớn nhất: **gán vào field của ScriptableObject sẽ ghi thẳng vào asset** và còn nguyên sau khi thoát Play Mode — xem [[data-driven-design]].

**Tool cân bằng: một cửa sổ Editor, không phải Inspector**

```csharp
public class BalanceWindow : EditorWindow {
    [MenuItem("Tools/Balance Dashboard")]
    static void Open() => GetWindow<BalanceWindow>("Balance");

    void OnGUI() {
        if (GUILayout.Button("Mô phỏng 10.000 trận")) RunSim();
        // bảng winrate/TTK theo cặp build × kẻ địch
    }
}
```

Với 5 hệ thống và 200 con số, Inspector từng asset không đủ. Một dashboard nhìn được toàn cảnh là khoản đầu tư một buổi chiều, dùng suốt dự án. Xem [[unity-editor-tools]].

**Kiểm tra nhanh**
- `grep -r "using UnityEngine" Assets/Scripts/Core/` → rỗng?
- Test EditMode cho toàn bộ `Core/` chạy dưới 1 giây?
- Grep phép gán vào field ScriptableObject → phải bằng 0?

## 🎤 Phỏng vấn

Node con trong nhánh này đều có mục 🎤 riêng. Mục này gom những câu **bắc ngang nhiều hệ thống** —
loại câu người phỏng vấn dùng để xem bạn có nhìn game như một hệ thống liên thông hay không.

**Systems design được hỏi ở ba dạng**

| Dạng | Họ đo cái gì | Node nên ôn |
|---|---|---|
| "Hệ thống này hỏng, sửa sao" | Bạn chẩn đoán theo nguyên nhân hay theo triệu chứng | [[economy-design]], [[difficulty-curve]] |
| "Thiết kế hệ thống X cho game Y" | Bạn có khung và có số, hay chỉ có ý tưởng | [[progression]], [[combat-systems]], [[meta-systems]] |
| "Vì sao con số này là con số này" | Bạn đo hay bạn đoán | [[balancing-math]], [[randomness]] |

**Câu hay gặp**

- `Junior` **Cân bằng game nghĩa là gì?**
  → Không phải làm mọi thứ bằng nhau, mà là làm cho **mọi lựa chọn đều đáng cân nhắc trong một bối cảnh nào đó**. Ba lựa chọn giống hệt nhau về sức mạnh thì cân bằng hoàn hảo và vô nghĩa hoàn hảo — không còn gì để quyết định, tức là mất autonomy, tức là mất một trong ba nhu cầu giữ người chơi.
- `Junior` **Kể tên một hệ thống anh sẽ bỏ khỏi một game và vì sao.**
  → Trả lời bằng phép thử: **bỏ nó đi thì game tệ hơn hay chỉ ngắn hơn?** Chỉ ngắn hơn thì đó là nội dung kéo dài thời gian, không phải thiết kế. Thêm một tầng nữa: hệ thống đó phục vụ nhu cầu nào trong ba nhu cầu competence, autonomy, relatedness — không trả lời được thì nó là mỡ thừa.
- `Mid` **Kinh tế trong game bị lạm phát sau ba tháng. Nguyên nhân thường gặp?**
  → **Sink không co giãn**: sink là hằng số trong khi source tăng theo cấp. Kèm theo là các sự kiện phát thêm tài nguyên mà không có drain tương ứng. Sửa là cho sink tăng cùng bậc với source, hệ số **1,15–1,35**, và thêm sink mềm vô hạn cho người chơi lâu năm — chứ không phải thu hồi tài nguyên đã phát.
- `Mid` **Người chơi kêu game ăn gian dù tỉ lệ đúng như công bố. Anh làm gì?**
  → Giả định code đúng và **cảm nhận mới là thứ hỏng**, vì con người không có trực giác về chuỗi ngẫu nhiên. Sửa không phải bằng cách đổi tỉ lệ mà bằng cách **bóp đuôi phân phối**: pity, shuffle bag, PRD, hoặc trọng số kèm cấm lặp — giữ nguyên kỳ vọng, cắt chuỗi xui cực đoan.
- `Senior` **Thiết kế hệ thống tiến trình cho game 30 giờ — anh bắt đầu từ đâu?**
  → Từ **tỉ lệ ba trục** dọc, ngang, mastery — và nói rõ vì sao tỉ lệ đó. Rồi nhịp thưởng: khoảng cách giữa hai phần thưởng cảm nhận được **không quá 20 phút** giai đoạn đầu. Rồi hình dạng đường cong với ràng buộc **thời gian lên cấp gần như hằng số**. Cuối cùng vẽ `chi_phí(n) / thu_nhập_mỗi_giờ(n)` để tìm tường cày cuốc trước khi người chơi tìm ra.
- `Senior` **Số liệu nói một build ổn nhưng cộng đồng gọi nó là bẫy. Anh theo bên nào?**
  → Theo cả hai, vì **cân bằng nhận thức quan trọng ngang cân bằng thực tế**: người chơi tin thứ gì đó yếu thì nó yếu thật, vì không ai luyện nó. Tôi tìm nguyên nhân nhận thức — phản hồi kém rõ, hoặc sức mạnh dồn về cuối đường cong — rồi sửa phần truyền đạt trước khi sửa con số.

**Khung trả lời 60 giây** — "Anh thiết kế và cân bằng một hệ thống mới thế nào?"

> Ba bước, và bước đầu quan trọng nhất. **Dạng công thức**: giảm sát thương dùng đường cong bão hoà chứ không dùng phép trừ, chi phí mua nhiều lần dùng cấp số nhân, mọi thứ cộng dồn phải có lợi ích giảm dần. Chọn sai dạng thì không con số nào cứu được, vì trường hợp suy biến nằm ngay trong công thức.
>
> Rồi **luật chống bùng nổ**: cộng trong cùng một loại, nhân giữa các loại khác nhau, và trần cứng cho hút máu, giảm cooldown, tốc đánh. Gần như mọi vụ vỡ cân bằng tôi gặp đều bắt đầu từ việc nhân hai phần trăm cùng loại.
>
> Cuối cùng là **mô phỏng**, và nhìn **phân bố chứ không nhìn trung bình**: winrate 55% ổn định thì lành mạnh, còn 55% ghép từ 90 và 10 là đang có hard counter. Tôi soi vài ngưỡng — pick rate không quá 25%, PvP lệch không quá 5%, TTK biến thiên dưới hai lần — rồi để playtest lo phần cảm nhận, vì toán chỉ đưa tới khoảng 80%.

**Cờ đỏ**

- Cân bằng bằng cách chỉnh số tới khi "thấy ổn", không có mô phỏng nào.
- Không phân biệt được ngẫu nhiên trước và sau quyết định của người chơi.
- Đề xuất daily, streak, battle pass mà chưa hỏi game thuộc loại nào, dài bao lâu.
- Tăng độ khó chỉ bằng nhân HP và sát thương.
- Bỏ qua phản hồi cộng đồng vì "số liệu nói khác".

**Số / ví dụ nên thuộc**

- Giáp bão hoà `dmg × K/(K+armor)`; luật **cộng trong cùng loại, nhân giữa các loại**.
- Winrate PvE **45–65%** · PvP **48–52%** · pick rate ≤ **25%**.
- Sink tăng cùng bậc source, hệ số **1,15–1,35**; game sống lâu cần **sink mềm vô hạn**.
- Nhịp thưởng: khoảng cách cảm nhận được ≤ **20 phút** giai đoạn đầu.
- Phép thử meta: **"bỏ nó đi thì tệ hơn hay chỉ ngắn hơn?"**
