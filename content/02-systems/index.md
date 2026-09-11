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
