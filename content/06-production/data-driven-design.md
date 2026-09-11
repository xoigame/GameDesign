---
title: Data-Driven Design
icon: 🗄️
summary: Tách dữ liệu khỏi code — quyết định kiến trúc quan trọng nhất cho việc cân bằng và cho làm việc với AI.
status: deep
read: 440
level: intermediate
order: 20
tags: [production, architecture, key]
related: [balancing-math, agent-guardrails, architecture-patterns]
---

Nguyên tắc: **logic nằm trong code, con số nằm trong dữ liệu.**

Nghe hiển nhiên, nhưng nó là ranh giới quyết định bạn có cân bằng được game hay không — và có làm việc được với AI agent một cách an toàn hay không.

## Trước và sau

```csharp
// ❌ Số nằm trong code
void Attack() {
    float damage = 12f;
    if (Random.value < 0.15f) damage *= 2f;
    target.TakeDamage(damage);
    StartCoroutine(Cooldown(0.4f));
}
```

Muốn đổi sát thương: sửa code → build lại → chạy lại → mất vài phút cho mỗi lần thử. Với hàng trăm lần chỉnh trong quá trình cân bằng, đây là hàng chục giờ bị đốt.

```csharp
// ✅ Số nằm trong dữ liệu
[CreateAssetMenu]
public class WeaponData : ScriptableObject {
    public float damage = 12f;
    public float critChance = 0.15f;
    public float critMultiplier = 2f;
    public float cooldown = 0.4f;
}

void Attack() {
    float dmg = data.damage;
    if (Random.value < data.critChance) dmg *= data.critMultiplier;
    target.TakeDamage(dmg);
    StartCoroutine(Cooldown(data.cooldown));
}
```

Giờ chỉnh được **trong lúc game đang chạy**, và người không biết code cũng chỉnh được.

## Cái gì nên đưa ra dữ liệu

**Luôn luôn:**
- Mọi số cân bằng: sát thương, HP, tốc độ, chi phí, tỉ lệ
- Mọi giá trị thời gian: cooldown, thời lượng, độ trễ
- Bảng nội dung: kẻ địch, vật phẩm, kỹ năng, drop table
- Đường cong: XP, giá nâng cấp, tỉ lệ độ khó
- Tham số game feel: hitstop, screenshake, độ giật camera

**Thường nên:**
- Cấu hình màn chơi (spawn, bố trí, ngân sách)
- Cây hội thoại
- Luật procgen (xem [[procedural-generation]])

**Đừng:**
- Logic phức tạp — đừng tự viết ngôn ngữ kịch bản trong JSON. Đến lúc cần rẽ nhánh và vòng lặp trong dữ liệu, hãy dùng một ngôn ngữ nhúng thật (Lua, GDScript) thay vì phát minh lại.

## Chọn định dạng

| Định dạng | Mạnh | Yếu |
|---|---|---|
| ScriptableObject (Unity) | Tích hợp editor, kiểm tra kiểu, tham chiếu asset | Khó diff trong git, khó sửa hàng loạt |
| JSON | Dễ đọc, dễ diff, công cụ sẵn có, AI sửa tốt | Không kiểm tra kiểu, không tự validate |
| CSV | Sửa hàng loạt trên Excel/Sheets, cân bằng rất nhanh | Chỉ dữ liệu phẳng |
| YAML/TOML | Dễ đọc, hỗ trợ chú thích | Cần thư viện, dễ lỗi thụt lề |

Kết hợp thường dùng trong thực tế: **CSV cho bảng số lớn** (để cân bằng trên spreadsheet), **JSON cho cấu hình có cấu trúc**, và một bước import chuyển chúng thành định dạng của engine.

## Hot reload — thứ đáng đầu tư nhất

Nếu chỉ làm được một việc trong nhánh này, hãy làm việc này: **sửa file dữ liệu → game cập nhật ngay, không cần khởi động lại.**

```csharp
void Update() {
    if (Input.GetKeyDown(KeyCode.F5)) {
        ConfigLoader.ReloadAll();
        Debug.Log("Đã nạp lại cấu hình");
    }
}
```

Vòng lặp cân bằng rút từ *"sửa → build 90s → chơi lại từ đầu"* xuống *"sửa → F5 → thấy ngay"*. Khác biệt về số lần thử nghiệm bạn thực hiện được là hàng chục lần.

## Validation là bắt buộc

Dữ liệu ngoài code nghĩa là trình biên dịch không bảo vệ bạn nữa. Phải tự kiểm tra khi nạp:

```csharp
public bool Validate(out List<string> errors) {
    errors = new List<string>();
    if (damage <= 0)                   errors.Add($"{name}: damage phải > 0");
    if (critChance is < 0 or > 1)      errors.Add($"{name}: critChance ngoài [0,1]");
    if (cooldown < 0.05f)              errors.Add($"{name}: cooldown < 0.05s là quá ngắn");
    if (rewardId != null && !Database.Exists(rewardId))
                                       errors.Add($"{name}: rewardId '{rewardId}' không tồn tại");
    return errors.Count == 0;
}
```

Chạy validation lúc build và fail build nếu có lỗi. Dữ liệu hỏng phát hiện lúc build rẻ hơn nhiều so với phát hiện khi người chơi báo lỗi.

## 🤖 Prompt cho AI

Ranh giới dữ liệu/code cho phép bạn **phân quyền rõ ràng** cho agent:

```markdown
## Quyền của agent trên dữ liệu

ĐƯỢC: thêm mục mới vào data/enemies.json theo đúng schema
ĐƯỢC: viết script kiểm tra tính toàn vẹn dữ liệu
ĐƯỢC: sinh biến thể từ mẫu có sẵn

KHÔNG: đổi số cân bằng của mục đã có — đó là quyết định thiết kế của tôi
KHÔNG: thêm trường mới vào schema mà chưa hỏi
KHÔNG: hardcode số trong code, kể cả "tạm thời"
```

Không có ranh giới này, agent sẽ rải hằng số khắp code trong lúc "sửa cho chạy", và vài phiên sau bạn mất khả năng cân bằng game. Xem [[agent-guardrails]].

Ngoài ra, dữ liệu dạng JSON/CSV là thứ **AI thao tác cực tốt**: sinh 30 biến thể kẻ địch theo schema, kiểm tra tham chiếu chéo, phát hiện giá trị bất thường — đều là việc nó làm nhanh và chính xác.
