---
title: Data-Driven Design
icon: 🗄️
summary: Tách dữ liệu khỏi code — quyết định kiến trúc quan trọng nhất cho việc cân bằng và cho làm việc với AI.
status: deep
read: 540
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

## 🎮 Unity

Unity có sẵn công cụ tốt nhất cho việc này: **ScriptableObject**. Nhưng nó có một điểm rất dễ dính bẫy.

**Component & nơi đặt**
- `Assets/Data/` — mọi ScriptableObject cấu hình
- `Assets/Data/Balance/*.csv` — bảng số lớn, import qua editor script

**Code**

```csharp
[CreateAssetMenu(menuName = "Game/Weapon Data")]
public class WeaponData : ScriptableObject {
    public float damage = 12f;
    public float cooldown = 0.4f;
    public AnimationCurve damageByLevel = AnimationCurve.Linear(1, 12, 50, 220);

    // Validate ngay trong Editor — dữ liệu hỏng lộ ra lúc sửa, không phải lúc chạy
    void OnValidate() {
        if (damage <= 0)      Debug.LogError($"{name}: damage phải > 0", this);
        if (cooldown < 0.05f) Debug.LogError($"{name}: cooldown < 0.05s là quá ngắn", this);
    }
}
```

**⚠️ Bẫy lớn nhất: ScriptableObject bị sửa vĩnh viễn trong Editor**

Nếu code làm `weaponData.damage += 5`, giá trị đó **ghi thẳng vào asset** và còn nguyên sau khi thoát Play Mode. Build thì không sao (asset chỉ đọc), nhưng trong Editor bạn sẽ âm thầm phá cân bằng game của chính mình.

```csharp
// ❌ SAI — sửa asset gốc
void ApplyBuff() => data.damage *= 1.5f;

// ✅ ĐÚNG — ScriptableObject chỉ đọc, trạng thái lúc chạy nằm ở instance
public class WeaponInstance {
    readonly WeaponData data;
    public float DamageMultiplier = 1f;
    public float Damage => data.damage * DamageMultiplier;
}
```

**Quy tắc: ScriptableObject = read-only lúc chạy.** Mọi thứ thay đổi được phải nằm trong class runtime riêng.

**Hot reload — chỉnh số khi game đang chạy**

Ưu điểm lớn của ScriptableObject: sửa giá trị trong Inspector **lúc Play Mode là có hiệu lực ngay**, và (khác với sửa field trên MonoBehaviour) giá trị **không bị revert** khi thoát Play.

Đây chính là vòng lặp cân bằng nhanh mà [[balancing-math]] cần. Tận dụng: mở Inspector khoá (lock) asset config, chơi, chỉnh, thấy ngay.

**Bảng số lớn thì dùng CSV**

Với 200 kẻ địch, Inspector không phải chỗ để sửa. Giữ CSV làm nguồn, viết editor script import thành ScriptableObject:

```csharp
[MenuItem("Tools/Import Balance CSV")]
static void Import() {
    foreach (var row in ReadCsv("Assets/Data/Balance/enemies.csv")) {
        var so = LoadOrCreate<EnemyData>($"Assets/Data/Enemies/{row["id"]}.asset");
        so.hp     = float.Parse(row["hp"]);
        so.damage = float.Parse(row["damage"]);
        EditorUtility.SetDirty(so);
    }
    AssetDatabase.SaveAssets();
}
```

Cân bằng trên Google Sheets, export CSV, bấm một nút. Xem [[agent-guardrails]] về việc phân quyền cho AI trên lớp dữ liệu này.

**Kiểm tra nhanh**
- Grep code tìm phép gán vào field của ScriptableObject — phải bằng 0.
- Sửa một giá trị lúc Play Mode: có hiệu lực ngay không?
- `OnValidate` có bắt được giá trị vô lý không? Thử nhập `damage = -5`.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Data-driven design nghĩa là gì? Nguyên tắc một câu?**
  → **Logic nằm trong code, con số nằm trong dữ liệu.** Nghe hiển nhiên nhưng nó là ranh giới quyết định mình có cân bằng được game hay không: sửa sát thương trong code là sửa → build → chạy lại, vài phút mỗi lần thử; để trong dữ liệu thì chỉnh được lúc game đang chạy, và người không biết code cũng chỉnh được.
- `Junior` **Cái gì luôn nên đưa ra dữ liệu?**
  → Mọi **số cân bằng** (sát thương, HP, tốc độ, chi phí, tỉ lệ); mọi **giá trị thời gian** (cooldown, thời lượng, độ trễ); **bảng nội dung** (kẻ địch, vật phẩm, kỹ năng, drop table); **đường cong** (XP, giá nâng cấp); và **tham số game feel** — hitstop, screenshake, độ giật camera.
- `Junior` **Cái gì thì đừng đưa ra dữ liệu?**
  → **Logic phức tạp.** Đừng tự viết một ngôn ngữ kịch bản trong JSON: tới lúc cần rẽ nhánh và vòng lặp trong dữ liệu thì dùng một ngôn ngữ nhúng thật (Lua, GDScript) thay vì phát minh lại. Dấu hiệu đã đi quá xa là file JSON bắt đầu có trường `condition` và `then`.
- `Mid` **Chọn định dạng dữ liệu theo tiêu chí nào?**
  → **CSV** cho bảng số lớn, vì cân bằng trên spreadsheet nhanh hơn mọi công cụ khác. **JSON** cho cấu hình có cấu trúc: dễ diff, công cụ sẵn có, và agent sửa tốt. **ScriptableObject** khi cần tích hợp editor và tham chiếu asset — đổi lại khó diff trong git. Thực tế hay kết hợp cả ba cộng một bước import.
- `Mid` **Thứ đáng đầu tư nhất trong nhánh này là gì?**
  → **Hot reload**: sửa file dữ liệu → game cập nhật ngay, không khởi động lại. Vòng lặp cân bằng rút từ "sửa → build 90 giây → chơi lại từ đầu" xuống "sửa → F5 → thấy ngay". Khác biệt không phải vài phút mỗi lần, mà là **số lần thử nghiệm** mình thực hiện được — chênh hàng chục lần.
- `Mid` **Dữ liệu ra ngoài code thì mất gì, và bù thế nào?**
  → Mất sự bảo vệ của **trình biên dịch**: không còn kiểm tra kiểu, không còn bắt lỗi chính tả tên trường. Bù bằng **validation lúc nạp và lúc build**: `damage > 0`, `critChance` trong [0,1], `cooldown ≥ 0,05`, và mọi id tham chiếu phải tồn tại. Chạy khi build và **fail build** nếu có lỗi — dữ liệu hỏng phát hiện lúc build rẻ hơn nhiều so với khi người chơi báo lỗi.
- `Senior` **Data-driven design liên quan gì tới việc làm việc an toàn với AI agent?**
  → Rất nhiều. Khi con số nằm trong file text, agent **sửa được và mình review được bằng diff**; khi chúng nằm trong prefab hoặc trong code rải rác thì agent hoặc không chạm tới được, hoặc chạm theo cách không kiểm soát nổi. Cộng với validation, nó biến "agent chỉnh cân bằng" từ việc rủi ro thành một PR có cổng kiểm.
- `Senior` **Đội bắt đầu từ code cứng, giờ muốn chuyển sang data-driven. Anh làm thế nào?**
  → Không chuyển hết một lúc. Bắt đầu từ **bảng số thay đổi nhiều nhất** — thường là cân bằng chiến đấu — vì đó là chỗ trả lãi ngay. Làm hot reload cùng lúc, vì không có nó thì lợi ích chưa thấy rõ và việc chuyển đổi dễ bị bỏ dở. Rồi mở rộng dần theo nhịp: mỗi lần sửa một bảng số lần thứ ba là đưa nó ra dữ liệu.
- `Senior` **Validation nên chạy ở những đâu?**
  → Ba chỗ, và mỗi chỗ bắt một lớp lỗi khác nhau: **lúc nạp trong Editor** để designer thấy ngay khi gõ sai; **lúc build** để fail build, đây là cổng quan trọng nhất; và **lúc chạy ở bản debug** để bắt dữ liệu tải từ xa. Bỏ cái giữa là chấp nhận rằng dữ liệu hỏng sẽ đi tới tay người chơi và im lặng.

**Khung trả lời 60 giây** — "Vì sao tách dữ liệu khỏi code lại quan trọng đến vậy?"

> Vì nó quyết định **số lần mình thử được**. Cân bằng một game là hàng trăm lần chỉnh; nếu mỗi lần là sửa code, build chín mươi giây rồi chơi lại từ đầu thì phần lớn ý tưởng sẽ không bao giờ được thử. Nguyên tắc tôi dùng là **logic trong code, con số trong dữ liệu**, và thứ tôi làm sớm nhất là **hot reload** — sửa file, bấm F5, thấy ngay.
>
> Cái gì ra dữ liệu thì khá rõ: mọi số cân bằng, mọi giá trị thời gian, bảng nội dung, đường cong, và cả tham số game feel. Cái gì **không** ra dữ liệu cũng rõ không kém: logic có rẽ nhánh và vòng lặp — tới đó thì dùng một ngôn ngữ nhúng thật chứ đừng phát minh một ngôn ngữ kịch bản trong JSON.
>
> Và vì trình biên dịch không bảo vệ mình nữa, **validation là bắt buộc**: kiểm khoảng giá trị, kiểm mọi id tham chiếu có tồn tại, chạy lúc build và fail build nếu hỏng. Lợi ích kèm theo là agent sửa được bảng số qua diff review được — đó là điều kiện để giao phần cân bằng cho công cụ.

**Họ sẽ đào tiếp**

- *"Vì sao CSV vẫn còn dùng được trong 2020s?"* → Vì spreadsheet là công cụ cân bằng tốt nhất từng có: sắp xếp, lọc, công thức, biểu đồ, và nhiều người sửa cùng lúc. Với một bảng 200 kẻ địch × 15 cột thì không giao diện editor tự viết nào đuổi kịp. Yếu điểm duy nhất là dữ liệu phẳng — nên nó ghép với JSON cho phần có cấu trúc.
- *"ScriptableObject có phải là data-driven không?"* → Có, nhưng kèm một đánh đổi cụ thể: nó tích hợp editor và tham chiếu asset rất tốt, đổi lại **khó diff trong git** và khó sửa hàng loạt. Nó cũng có bẫy riêng — trong Editor, SO giữ trạng thái xuyên các lần Play, nên field runtime phải `[NonSerialized]`.
- *"Hot reload có rủi ro gì?"* → Trạng thái đang chạy có thể không khớp dữ liệu mới: một kẻ địch đã spawn với cooldown cũ, một hệ thống đã cache giá trị. Cách gọn là mọi thứ **đọc từ config tại điểm dùng** thay vì cache lúc khởi tạo, và phát một sự kiện "config đã đổi" cho những nơi buộc phải cache.
- *"Validation nên fail build hay chỉ cảnh báo?"* → **Fail build.** Cảnh báo trong log sẽ bị bỏ qua sau tuần thứ hai, và khi đó cổng kiểm chỉ còn là trang trí. Nếu có loại lỗi thật sự chấp nhận được thì đưa nó ra khỏi danh sách kiểm chứ đừng hạ mọi thứ xuống mức cảnh báo.

**Cờ đỏ**

- Số cân bằng nằm rải trong code, và không thấy vấn đề ở đó.
- Tự phát minh ngôn ngữ kịch bản trong JSON.
- Dữ liệu ngoài code mà không có validation nào.
- Validation chỉ cảnh báo, không fail build.
- Không có hot reload, rồi than rằng cân bằng mất quá nhiều thời gian.

**Số / ví dụ nên thuộc**

- Nguyên tắc: **logic trong code, con số trong dữ liệu**.
- Vòng lặp: "sửa → build **90 s** → chơi lại" so với "sửa → **F5** → thấy ngay".
- Định dạng: **CSV** cho bảng số lớn · **JSON** cho cấu hình có cấu trúc · **ScriptableObject** khi cần tham chiếu asset.
- Validation mẫu: `damage > 0` · `critChance ∈ [0,1]` · `cooldown ≥ 0,05` · mọi id tham chiếu **phải tồn tại**.
- Validation chạy **lúc build** và **fail build**; đừng để ở mức cảnh báo.
