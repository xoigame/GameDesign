---
title: Test và CI/CD cho Unity
icon: 🧪
summary: Cái gì trong game đáng viết test và cái gì không, cách tách logic khỏi MonoBehaviour để test được, và thang CI năm bậc — từ build đêm cho QA tới farm thiết bị.
status: deep
read: 775
level: intermediate
order: 175
tags: [unity, testing, ci, automation, production]
related: [unity-build-platform, unity-editor-tools, unity-save-data, architecture-patterns]
---

Game khác phần mềm thường ở một điểm quyết định: **thứ quan trọng nhất lại là thứ không test tự động được**. Không ai viết được test cho "cú nhảy có đã tay không". Nên câu hỏi đúng không phải "test bao phủ bao nhiêu phần trăm" mà là **chỗ nào mà một lỗi âm thầm sẽ đắt hơn công viết test**.

## Cái gì đáng test

| Đáng | Vì sao | Không đáng |
|---|---|---|
| Công thức sát thương, chỉ số, kinh tế | Sai một dấu là cả bảng cân bằng sai, và không ai nhìn ra bằng mắt | Cảm giác điều khiển |
| Migration save qua các phiên bản | Hỏng là **mất tiến trình người chơi** — lỗi không sửa được sau khi phát hành | Bố cục UI |
| Máy trạng thái (quest, combo, matchmaking) | Số nhánh vượt khả năng test tay rất nhanh | Hiệu ứng hình ảnh |
| Inventory, crafting, điều kiện mở khoá | Nhiều luật nhỏ đan nhau | "Màn chơi có vui không" |
| Parser dữ liệu, generator procedural (với seed cố định) | Đầu vào–đầu ra rõ ràng | Animation blend |

Nhận ra chưa? Cột bên trái đều là **C# thuần**. Đó không phải trùng hợp: thứ test được rẻ nhất là thứ không phụ thuộc `MonoBehaviour`. Nên "làm sao để test được" và "làm sao để kiến trúc sạch" là cùng một câu hỏi — xem [[architecture-patterns]].

## Tách logic ra khỏi MonoBehaviour

Ba bước, theo thứ tự dễ làm:

1. **Công thức thành hàm tĩnh thuần.** `DamageCalculator.Compute(attacker, defender, skill)` nhận struct, trả số. Không đụng `Time`, không đụng `Random`, không đụng scene.
2. **Phụ thuộc vào thời gian và ngẫu nhiên đi qua interface.** `IClock`, `IRandom` — test tiêm bản giả, game tiêm bản thật. Nếu thấy nặng tay thì tối thiểu: truyền `deltaTime` và `seed` vào làm tham số thay vì đọc trực tiếp.
3. **MonoBehaviour còn lại chỉ làm ba việc**: đọc input, gọi logic, đẩy kết quả lên hiển thị. Phần đó không cần unit test — nó cần người chơi thử.

Dấu hiệu bạn đang đi đúng: file test không `using UnityEngine` dòng nào.

## EditMode và PlayMode

| | EditMode | PlayMode |
|---|---|---|
| Chạy trong | Editor, không vào Play | Có vào Play, có vòng đời thật |
| Tốc độ | Mili giây | Giây — mỗi test tốn thời gian vào/ra Play |
| Test được | C# thuần, ScriptableObject, tool, validate asset | Coroutine, physics, prefab, scene, timing |
| Dùng cho | **Phần lớn test** | Thứ chỉ đúng khi engine chạy |

Test nằm trong asmdef riêng có *Test Assemblies* (tham chiếu `UnityEngine.TestRunner` và `UnityEditor.TestRunner`), đặt trong thư mục `Tests/` để không lọt vào build. PlayMode test viết bằng `[UnityTest]` trả `IEnumerator` và `yield return null` để nhường frame.

**Luật chống test lung lay:** đừng bao giờ `yield return new WaitForSeconds(2f)` để "đợi cho xong". Test phụ thuộc thời gian thực sẽ đỏ ngẫu nhiên trên máy CI chậm, và một bộ test đỏ ngẫu nhiên sẽ bị cả đội bỏ qua trong hai tuần — lúc đó nó tệ hơn là không có. Hãy đợi **điều kiện** (`while (!done && frames++ < 600) yield return null;`) hoặc tiêm `IClock` để tua thời gian.

## Test mà game thật sự cần

Ngoài unit test, ba loại này trả lãi cao hơn nhiều ở dự án game:

**Validate asset.** Một EditMode test duyệt toàn bộ `ScriptableObject` và prefab để bắt lỗi dữ liệu: enemy không có prefab, âm thanh trỏ vào clip đã xoá, `minDamage > maxDamage`, item trùng id, level thiếu điểm spawn. Đây là loại lỗi làm QA mất cả buổi mà máy tìm ra trong một giây. Gắn nó vào CI và nó chặn được cả một lớp bug trước khi ai kịp thấy.

**Golden test cho save.** Giữ một file save thật của **mỗi bản đã phát hành** trong `Tests/Fixtures/`, và một test nạp từng file rồi kiểm trạng thái sau migration. Đây là thứ phân biệt người đã ship game: bạn không thể "sửa lại" một save đã hỏng trên máy người chơi. Xem [[unity-save-data]].

**Smoke test tự động.** Một PlayMode test nạp scene Boot, đi qua menu, vào màn 1, chạy 30 giây rồi thoát — không kiểm gameplay, chỉ kiểm **không có exception nào**. Rẻ, và bắt được phần lớn sự cố "build không mở được" trước khi nó tới tay QA.

## Thang CI năm bậc

Không phải dự án nào cũng cần bậc trên cùng. Leo lên khi đau, đừng leo vì nghe nói nên có:

| Bậc | Việc | Chi phí | Khi nào cần |
|---|---|---|---|
| 0 | Script build một lệnh (`-batchmode -executeMethod`), version code tự tăng | Vài giờ | Ngay từ đầu, kể cả dự án một người |
| 1 | EditMode test chạy trên mỗi PR | Vài ngày | Từ người thứ hai |
| 2 | **Build đêm cho QA**, tự upload lên TestFlight / Play Internal | 1–2 tuần | Có tester không phải lập trình viên |
| 3 | Smoke test tự động trên bản build | Vài ngày | Khi "build hỏng" từng lọt tới QA vài lần |
| 4 | Farm thiết bị thật, test hiệu năng theo bản | Tốn liên tục | Game live có nhiều dòng máy phải đỡ |

Bậc 2 là bậc đổi đời nhiều đội nhất: QA không còn phải chờ ai đó rảnh để bấm Build, và bản build luôn tồn tại cho mỗi ngày.

## Chi phí thật của CI Unity

Ba thứ hay bị bỏ quên khi ước lượng:

- **Kích hoạt license.** Unity cần license trên máy CI; Personal cũng phải activate và có giới hạn máy. Đây là bước hỏng nhiều nhất khi dựng lần đầu, và hỏng theo kiểu khó đọc.
- **Cache `Library/`.** Không cache thì mỗi lần chạy là import lại toàn bộ asset: build 40 phút thay vì 6 phút. Cache đúng `Library/` là tối ưu CI lớn nhất, và nhớ xoá cache khi nâng phiên bản Unity.
- **iOS cần macOS.** Không có đường vòng: hoặc runner macOS (tự dựng hoặc thuê theo phút, đắt hơn Linux nhiều), hoặc dùng Unity Build Automation / dịch vụ tương đương.

Lệnh chạy test headless nên thuộc (đừng thêm -quit: -runTests tự thoát, thêm vào là Unity đóng trước khi test chạy xong):

```bash
Unity -batchmode -projectPath . -runTests -testPlatform EditMode \
      -testResults results.xml -logFile -
```

## Bẫy lộ ra khi build

- Code test lọt vào build vì không nằm trong asmdef Test Assemblies → build lỗi vì thiếu `nunit.framework`.
- Test đọc file bằng đường dẫn tuyệt đối của máy bạn: xanh ở nhà, đỏ trên CI.
- Test phụ thuộc thứ tự chạy (dùng chung `static`): xanh khi chạy cả bộ, đỏ khi chạy một mình, hoặc ngược lại. Nhớ rằng tắt Domain Reload thì `static` **không** reset giữa các lần Play.
- CI xanh nhưng build không chạy trên máy thật, vì CI chỉ chạy EditMode test — bậc 3 tồn tại chính vì chuyện này.
- `Library/` không cache: CI chậm tới mức không ai chờ, rồi cả đội tắt CI.

## Kiểm tra nhanh

- [ ] Có script build một lệnh, không cần mở Editor
- [ ] Test nằm trong asmdef riêng, không lọt vào build
- [ ] File test logic **không** `using UnityEngine`
- [ ] Không test nào phụ thuộc `WaitForSeconds` để đồng bộ
- [ ] Có golden test cho migration save, kèm file save của từng bản đã phát hành
- [ ] `Library/` được cache trên CI
- [ ] Bộ test chạy dưới 5 phút — quá đó là sẽ không ai chờ

## 🤖 Prompt cho AI

**Dùng AI thế nào cho test và CI**

Đây là mảng AI làm tốt bất thường, vì test là loại code **có dạng chuẩn** và **kiểm chứng được ngay** (chạy là biết đúng sai). Ba việc nên giao thẳng: viết bộ test cho một hàm thuần khi bạn đã liệt kê ca biên; viết test **validate asset** duyệt `ScriptableObject` theo luật bạn nêu; và viết YAML cho CI (GameCI hoặc tương đương) — thứ cú pháp lặt vặt mà tra tay rất tốn thời gian.

Một việc **không** nên giao: để AI tự quyết *test cái gì*. Nó sẽ viết test cho getter/setter và cho những gì nhìn thấy trong file, tạo cảm giác an toàn giả. Danh sách ca biên phải đến từ bạn — từ bug đã từng xảy ra, từ giá trị 0/âm/tràn, từ nhánh migration.

Mẹo dùng: đưa AI **một bug thật đã sửa** và yêu cầu viết test đỏ trước khi sửa (test đó phải đỏ trên code cũ, xanh trên code mới). Đấy là cách duy nhất chắc chắn test có nghĩa, và cũng là thói quen tốt cho chính bạn.

**Phải nêu rõ** (thiếu là AI tự bịa):
- EditMode hay PlayMode, và vì sao — AI mặc định viết PlayMode cho mọi thứ, chậm gấp nhiều lần.
- Ca biên cụ thể cần phủ: giá trị 0, âm, tràn, danh sách rỗng, save bản cũ nhất.
- Có được đổi code sản xuất để test được không (tách hàm, thêm interface), hay chỉ được viết test.
- Phiên bản Unity, và test chạy trên CI nào.
- Ràng buộc thời gian: bộ test phải chạy trong bao lâu.

**Mẫu prompt**

```
Unity 6. Viết EditMode test cho SaveMigrator (file: <dán>).
Ca bắt buộc phủ:
- save v1 (không có trường "skills") -> v3: skills rỗng, không exception
- save v2 có "gold": -50 -> kẹp về 0 và ghi cảnh báo
- save v3 hiện tại -> không đổi gì (idempotent)
- file JSON hỏng giữa chừng -> trả về null, KHÔNG ném exception ra ngoài
Ràng buộc: KHÔNG using UnityEngine trong file test; dùng fixture JSON đặt
trong Tests/Fixtures/; mỗi test một Assert chính; đặt tên test theo dạng
Method_Condition_Expected. Nói rõ test nào sẽ ĐỎ với code hiện tại.
```

**Bẫy thường gặp:** AI viết PlayMode test rồi đồng bộ bằng `yield return new WaitForSeconds(2f)` — xanh trên máy bạn, đỏ ngẫu nhiên trên CI chậm hơn. Test đỏ ngẫu nhiên còn tệ hơn không có test, vì trong hai tuần cả đội sẽ học được thói quen chạy lại cho tới khi xanh. Ràng buộc phải viết vào prompt: **đợi điều kiện kèm giới hạn số frame, không đợi thời gian**.

## 💻 Code

Demo gồm hai file test chạy được ngay: một bộ test cho công thức sát thương thuần (EditMode, không `using UnityEngine`), và một test **validate asset** duyệt mọi `EnemyData` trong project để bắt lỗi dữ liệu trước khi QA gặp. Kèm sơ đồ thư mục và cửa sổ Test Runner cho đúng thiết lập asmdef.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Sơ đồ thư mục Tests với asmdef và cửa sổ Test Runner hiện hai nhóm test EditMode">
  <rect x="10" y="10" width="250" height="280" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Project</text>
  <line x1="10" y1="42" x2="260" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">▾ _Project/Combat/</text>
  <text x="38" y="82" class="fig-muted" font-size="11">DamageCalculator.cs</text>
  <text x="38" y="98" class="fig-muted" font-size="11">Game.Combat.asmdef</text>
  <rect x="16" y="108" width="238" height="20" rx="4" fill="#51cf9b" opacity="0.18"/>
  <text x="22" y="123" class="fig-label" font-size="12" font-weight="600">▾ Tests/EditMode/</text>
  <text x="38" y="142" class="fig-muted" font-size="11">DamageCalculatorTests.cs</text>
  <text x="38" y="158" class="fig-muted" font-size="11">EnemyDataValidationTests.cs</text>
  <text x="38" y="174" class="fig-label" font-size="11">Game.Tests.EditMode.asmdef</text>
  <line x1="10" y1="188" x2="260" y2="188" class="fig-line"/>
  <text x="22" y="208" class="fig-label" font-size="12" font-weight="600">asmdef của Tests</text>
  <text x="22" y="226" class="fig-muted" font-size="11">☑ Test Assemblies (Editor only)</text>
  <text x="22" y="242" class="fig-muted" font-size="11">Refs: Game.Combat, UnityEngine.</text>
  <text x="32" y="256" class="fig-muted" font-size="11">TestRunner, UnityEditor.TestRunner</text>
  <text x="22" y="276" class="fig-muted" font-size="10">Không tick thì code test lọt vào build.</text>
  <rect x="276" y="10" width="374" height="280" rx="8" class="fig-box"/>
  <text x="288" y="32" class="fig-label" font-size="13" font-weight="600">Test Runner  (Window ▸ General ▸ Test Runner)</text>
  <line x1="276" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="284" y="50" width="358" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="292" y="63" class="fig-label" font-size="12" font-weight="600">EditMode</text>
  <text x="300" y="84" class="fig-muted" font-size="11">▾ DamageCalculatorTests</text>
  <text x="316" y="102" class="fig-muted" font-size="11">✔ Compute_ArmorHigherThanDamage_ReturnsOne</text>
  <text x="316" y="118" class="fig-muted" font-size="11">✔ Compute_CritDoublesDamage</text>
  <text x="316" y="134" class="fig-muted" font-size="11">✔ Compute_NegativeArmor_ClampedToZero</text>
  <text x="300" y="156" class="fig-muted" font-size="11">▾ EnemyDataValidationTests</text>
  <text x="316" y="174" class="fig-muted" font-size="11">✔ AllEnemyData_HavePrefab</text>
  <text x="316" y="190" class="fig-muted" font-size="11">✔ AllEnemyData_HaveUniqueId</text>
  <rect x="284" y="204" width="358" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="292" y="217" class="fig-label" font-size="12" font-weight="600">Chạy không cần Editor</text>
  <text x="300" y="238" class="fig-muted" font-size="11">-batchmode -runTests -testPlatform EditMode</text>
  <text x="300" y="254" class="fig-muted" font-size="11">-testResults results.xml -logFile -</text>
  <text x="300" y="274" class="fig-muted" font-size="10">Mã thoát khác 0 = có test đỏ → CI đỏ theo.</text>
</svg>
<figcaption>Test nằm trong asmdef riêng có tick Test Assemblies. Test logic không tham chiếu UnityEngine; test validate asset thì có, vì nó phải đọc AssetDatabase.</figcaption>
</figure>

**Script**

```csharp
// DamageCalculatorTests.cs — EditMode. Đặt trong Tests/EditMode/.
// Không using UnityEngine: logic thuần thì test cũng thuần, chạy trong mili giây.
using NUnit.Framework;

public class DamageCalculatorTests
{
    // Hàm đang test (thuộc Game.Combat) — ở đây để tiện đọc:
    // public static int Compute(int damage, int armor, bool crit) {
    //     armor = armor < 0 ? 0 : armor;
    //     int raw = crit ? damage * 2 : damage;
    //     int result = raw - armor;
    //     return result < 1 ? 1 : result;          // luôn ăn tối thiểu 1
    // }

    [Test]
    public void Compute_ArmorHigherThanDamage_ReturnsOne()
    {
        Assert.AreEqual(1, DamageCalculator.Compute(damage: 10, armor: 99, crit: false));
    }

    [Test]
    public void Compute_CritDoublesDamage()
    {
        Assert.AreEqual(20, DamageCalculator.Compute(damage: 10, armor: 0, crit: true));
    }

    [Test]
    public void Compute_NegativeArmor_ClampedToZero()
    {
        // Ca biên đến từ một bug thật: buff "giáp âm" làm sát thương nhân lên.
        Assert.AreEqual(10, DamageCalculator.Compute(damage: 10, armor: -50, crit: false));
    }

    [TestCase(0, 0, false, 1)]      // sát thương 0 vẫn ăn 1
    [TestCase(int.MaxValue, 10, false, int.MaxValue - 10)]
    public void Compute_EdgeCases(int damage, int armor, bool crit, int expected)
    {
        Assert.AreEqual(expected, DamageCalculator.Compute(damage, armor, crit));
    }
}
```

```csharp
// EnemyDataValidationTests.cs — EditMode. Duyệt asset thật trong project.
// Đây là loại test trả lãi cao nhất ở dự án game: bắt lỗi DỮ LIỆU, không bắt lỗi code.
using System.Collections.Generic;
using System.Linq;
using NUnit.Framework;
using UnityEditor;
using UnityEngine;

public class EnemyDataValidationTests
{
    static IEnumerable<EnemyData> AllEnemyData() =>
        AssetDatabase.FindAssets("t:EnemyData")
                     .Select(AssetDatabase.GUIDToAssetPath)
                     .Select(AssetDatabase.LoadAssetAtPath<EnemyData>)
                     .Where(a => a != null);

    [Test]
    public void AllEnemyData_HavePrefab()
    {
        var missing = AllEnemyData().Where(e => e.prefab == null)
                                    .Select(e => e.name).ToArray();
        Assert.IsEmpty(missing, "EnemyData thiếu prefab: " + string.Join(", ", missing));
    }

    [Test]
    public void AllEnemyData_HaveUniqueId()
    {
        var dup = AllEnemyData().GroupBy(e => e.id)
                                .Where(g => g.Count() > 1)
                                .Select(g => g.Key).ToArray();
        Assert.IsEmpty(dup, "Trùng id: " + string.Join(", ", dup));
    }

    [Test]
    public void AllEnemyData_DamageRangeIsValid()
    {
        foreach (var e in AllEnemyData())
            Assert.LessOrEqual(e.minDamage, e.maxDamage, $"{e.name}: minDamage > maxDamage");
    }
}
```

**Chạy thử**
- `Window > General > Test Runner` → tab **EditMode** → *Run All*: cả hai nhóm phải xanh trong dưới một giây.
- Cố tình xoá prefab khỏi một `EnemyData` rồi chạy lại: test đỏ và **nói đúng tên asset** — đó là điểm khác biệt giữa test hữu ích và test cho có.
- Chạy không cần Editor: `Unity -batchmode -projectPath . -runTests -testPlatform EditMode -testResults results.xml -logFile -`. Mã thoát khác 0 nghĩa là có test đỏ; cắm thẳng vào bước CI.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | EditMode test và PlayMode test khác nhau thế nào? |
| Junior | Test của anh để ở đâu trong project để nó không lọt vào build? |
| Mid | Trong một game, cái gì đáng viết unit test và cái gì không? |
| Mid | Làm sao test được code đang nằm trong MonoBehaviour? |
| Senior | Pipeline build/CI ở dự án gần nhất của anh tự động tới đâu? |
| Senior | Bộ test xanh nhưng bản build vẫn hỏng trên máy thật. Thiếu tầng nào? |

**Khung trả lời 60 giây** — "Trong game thì test cái gì?"

> Tôi test thứ mà **một lỗi âm thầm sẽ đắt hơn công viết test**, và trong game thì đó gần như luôn là C# thuần: công thức sát thương và kinh tế, máy trạng thái quest, điều kiện mở khoá, và **migration save**. Cái cuối là bắt buộc với tôi — save hỏng là mất tiến trình người chơi, và không sửa được sau khi phát hành, nên tôi giữ file save thật của từng bản đã ship trong repo và có test nạp lại từng cái.
>
> Thứ tôi **không** test tự động: cảm giác điều khiển, bố cục UI, "màn chơi có vui không" — đó là việc của playtest.
>
> Kéo theo là một quan sát về kiến trúc: mọi thứ ở danh sách trên đều test được vì chúng không phụ thuộc `MonoBehaviour`. Nên "làm sao test được" và "làm sao kiến trúc sạch" là cùng một câu hỏi. Dấu hiệu tôi đang đi đúng là file test logic không có dòng `using UnityEngine` nào.

**Họ sẽ đào tiếp**

- *"Test code trong MonoBehaviour?"* → Không test trực tiếp, mà **kéo logic ra ngoài**: hàm tĩnh thuần cho công thức, interface cho thời gian và ngẫu nhiên (`IClock`, `IRandom`), còn MonoBehaviour chỉ đọc input, gọi logic, đẩy lên hiển thị. Phần vỏ đó không cần unit test — nó cần người chơi thử.
- *"Loại test nào trả lãi cao nhất ở game?"* → **Validate asset**: một EditMode test duyệt mọi ScriptableObject và prefab để bắt enemy thiếu prefab, id trùng, `minDamage > maxDamage`, clip âm thanh đã xoá. Loại lỗi này làm QA mất cả buổi mà máy tìm ra trong một giây, và nó là lỗi *dữ liệu* nên không compiler nào bắt được.
- *"Test xanh mà build vẫn hỏng?"* → Vì CI thường chỉ chạy EditMode test. Tầng thiếu là **smoke test trên bản build**: nạp Boot, qua menu, vào màn 1, chạy 30 giây, chỉ kiểm không có exception. Rẻ, và bắt được phần lớn sự cố "build không mở được".
- *"CI Unity tốn ở đâu?"* → Ba chỗ hay bị bỏ quên: kích hoạt license trên máy CI (hỏng nhiều nhất khi dựng lần đầu), **cache `Library/`** (không cache là 40 phút thay vì 6), và iOS bắt buộc runner macOS. Cache `Library` phải xoá khi nâng phiên bản Unity.
- *"Test lung lay thì sao?"* → Coi như bug ưu tiên cao, sửa hoặc xoá ngay. Một bộ test đỏ ngẫu nhiên sẽ dạy cả đội thói quen bấm chạy lại cho tới khi xanh, và lúc đó nó tệ hơn là không có test.

**Cờ đỏ**

- Nói về độ phủ (coverage) như mục tiêu: game có rất nhiều code chỉ để hiển thị, ép phủ nó là lãng phí.
- `yield return new WaitForSeconds(2f)` trong PlayMode test để "đợi cho chắc".
- Test dùng chung `static` nên phụ thuộc thứ tự chạy.
- Không biết code test lọt vào build được nếu asmdef không tick Test Assemblies.
- "Dự án game không test được" — nói vậy là chưa từng tách logic khỏi engine.

**Số / ví dụ nên thuộc**

- `Unity -batchmode -projectPath . -runTests -testPlatform EditMode -testResults results.xml -logFile -` (không kèm `-quit`).
- Cache `Library/`: khác biệt cỡ 40 phút so với 6 phút mỗi lần chạy.
- Bộ test nên chạy **dưới 5 phút**, nếu không sẽ không ai chờ.
- Thang CI: script build một lệnh → test trên PR → **build đêm cho QA** → smoke test → farm thiết bị.
