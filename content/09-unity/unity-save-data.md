---
title: Lưu game & dữ liệu
icon: 💾
summary: Một class SaveData phẳng có version, ghi atomic, migration theo chuỗi, lưu id thay tham chiếu — và vì sao PlayerPrefs chỉ dành cho âm lượng.
status: deep
read: 730
level: intermediate
order: 40
tags: [unity, save, data, persistence]
related: [data-driven-design, progression, unity-design-patterns, unity-build-platform]
---

Save là hệ thống duy nhất mà **bug phát hiện sau khi phát hành không sửa được bằng patch**: file hỏng đã nằm trên máy người chơi. Mọi quyết định dưới đây xoay quanh một câu: *file save từ bản 1.0 phải nạp được ở bản 1.8, kể cả khi app bị giết đúng lúc đang ghi.*

Quyết định nền: **một class `SaveData` phẳng có field `version`, serialize ra JSON, ghi atomic vào `persistentDataPath`, và lưu id string thay cho mọi tham chiếu asset.**

## PlayerPrefs chỉ cho settings

Âm lượng, ngôn ngữ, chất lượng đồ hoạ: `PlayerPrefs`. Tiến trình: **không bao giờ**. Trên Windows nó nằm trong Registry (giới hạn ~1MB, không sao lưu được, không đọc bằng tay); trên Android là file XML mất khi xoá app; không có version, không atomic, không cùng file với tiến trình để đồng bộ cloud. [[progression]] đã cảnh báo; node này nói phần thay thế.

## Mô hình `SaveData`

```csharp
using System; using System.Collections.Generic;

[Serializable]
public sealed class SaveData {
    public int version = SaveMigrator.Current;
    public long savedAtUnixMs;                 // KHÔNG dùng DateTime — JsonUtility không serialize
    public double playtimeSec;                 // đơn điệu tăng, dùng giải quyết conflict cloud
    public int level;
    public int gold;
    public List<string> unlockedItemIds = new();
    public List<InventoryEntry> inventory = new();     // KHÔNG Dictionary — JsonUtility không hỗ trợ
    public List<string> openedChestIds = new();

    // Field cũ giữ lại để migration đọc được. Không dùng ở nơi khác.
    public float legacy_coins;
    public List<int> legacy_unlockIndices;
}

[Serializable] public struct InventoryEntry { public string itemId; public int count; }
```

Phẳng, không kế thừa, không property, không nullable. Field mới thêm vào **không cần migration**: JsonUtility để nguyên giá trị khởi tạo nếu JSON thiếu key. Chỉ đổi tên hay đổi nghĩa mới cần.

| | `JsonUtility` | Newtonsoft (`com.unity.nuget.newtonsoft-json`) |
|---|---|---|
| Dictionary, polymorphism, nullable, property | Không | Có |
| Cần `[Serializable]`, field public hoặc `[SerializeField]` | Có | Không |
| Tốc độ, cấp phát | Nhanh, ít GC | Chậm hơn 3–10x, nhiều GC |
| IL2CPP stripping | An toàn (dùng serializer của engine) | Reflection → cần `link.xml`/`[Preserve]` |
| Đọc JSON tuỳ ý (`JObject`) để migrate | Không | Có |

Bắt đầu bằng `JsonUtility`. Chuyển sang Newtonsoft khi cần Dictionary thật hoặc migration phải đọc JSON cũ theo cây. Không dùng `BinaryFormatter`: bị đánh dấu lỗi bảo mật, .NET đã bỏ, và không migrate được.

## Ghi atomic

App bị giết giữa `File.WriteAllText` để lại file cụt. `JsonUtility.FromJson` trên file cụt trả `null` hoặc ném lỗi, và người chơi mất 40 giờ. Ghi ra file tạm rồi hoán đổi:

```csharp
using System.IO; using UnityEngine;

public static class SaveIO {
    public static void WriteAtomic(string path, string json) {
        var tmp = path + ".tmp";
        File.WriteAllText(tmp, json);
        if (File.Exists(path)) File.Replace(tmp, path, path + ".bak");  // rename trên Unix: nguyên tử; giữ bản cũ làm .bak
        else File.Move(tmp, path);
    }

    public static SaveData ReadWithFallback(string path) {
        foreach (var p in new[] { path, path + ".bak" }) {
            if (!File.Exists(p)) continue;
            try {
                var data = JsonUtility.FromJson<SaveData>(File.ReadAllText(p));
                if (data != null) return SaveMigrator.Migrate(data);
            } catch (System.Exception e) { Debug.LogWarning($"Save hỏng: {p} — {e.Message}"); }
        }
        return null;
    }
}
```

Save 50KB ghi mất 1–20ms trên mobile: chấp nhận trên main thread ở checkpoint. Save vượt 500KB thì serialize trên main thread, ghi ở `Task.Run` (không WebGL). Trên WebGL, `System.IO` ghi vào bộ nhớ; phải gọi `FS.syncfs` từ jslib để đẩy xuống IndexedDB, không thì reload trang là mất.

## `persistentDataPath` không giống nhau

| Nền tảng | Đường dẫn | Bẫy |
|---|---|---|
| Windows | `%USERPROFILE%\AppData\LocalLow\<Company>\<Product>` | Đổi Company/Product Name sau phát hành = người chơi "mất save" |
| macOS | `~/Library/Application Support/<Company>/<Product>` | Sandbox App Store đổi đường dẫn |
| Android | `/storage/emulated/0/Android/data/<package>/files` | Xoá app là mất; `allowBackup` mặc định sao lưu lên Google |
| iOS | `<App>/Documents` | **Mặc định lên iCloud backup**; cache lớn ở đây bị Apple từ chối — đánh `Device.SetNoBackupFlag` cho cache, giữ save được backup |
| WebGL | `/idbfs/<hash>` trong IndexedDB | Cần `syncfs`; người dùng xoá site data là mất |

Editor dùng đường dẫn của Windows/macOS với Company/Product của project — khác build. "Save mất khi test trên máy" đa phần là hai đường dẫn khác nhau.

## Migration theo chuỗi

```csharp
using System.IO; using System.Linq; using UnityEngine;

public static class SaveMigrator {
    public const int Current = 3;

    public static SaveData Migrate(SaveData d) {
        if (d.version > Current)
            throw new InvalidDataException($"Save từ bản mới hơn (v{d.version} > v{Current})");   // KHÔNG ghi đè
        while (d.version < Current) {
            switch (d.version) {
                case 1: From1To2(d); break;
                case 2: From2To3(d); break;
                default: throw new InvalidDataException($"Thiếu migration từ v{d.version}");
            }
            d.version++;
        }
        return d;
    }

    // v1 lưu vàng là float 'coins'
    static void From1To2(SaveData d) { d.gold = Mathf.RoundToInt(d.legacy_coins); d.legacy_coins = 0; }

    // v2 lưu unlock bằng chỉ số trong bảng; v3 bằng id
    static void From2To3(SaveData d) {
        if (d.legacy_unlockIndices != null)
            d.unlockedItemIds = d.legacy_unlockIndices.Select(LegacyItemTable.IdAt).Where(id => id != null).ToList();
        d.legacy_unlockIndices = null;
    }
}
```

Ba luật: mỗi bước chỉ biết v(n) và v(n+1); **không bao giờ sửa bước cũ** (save v1 ngoài kia vẫn phải đi qua đúng con đường đó); field `legacy_` ở lại trong class vĩnh viễn. Khi class có 15 field legacy, đó là lúc chuyển migration sang Newtonsoft `JObject` và xoá chúng. Save có `version` lớn hơn `Current` (người chơi hạ cấp app) thì từ chối nạp và **không ghi đè**.

## Slot, autosave, backup xoay vòng

```
<persistentDataPath>/saves/
  slot0/manual.json  manual.json.bak  auto_0.json  auto_1.json  auto_2.json
```

Autosave ghi xoay vòng `auto_{n % 3}`, giữ ba bản gần nhất. Kích hoạt ở checkpoint, hết màn, `OnApplicationPause(true)` (xem [[unity-game-loop]]), và tối đa mỗi 2–3 phút. **Không** ghi mỗi khi vàng đổi: 500 lần ghi một giờ vừa tốn vừa tăng cửa sổ bị giết giữa chừng. Nạp: `manual` → `manual.bak` → `auto` mới nhất còn parse được, và **báo cho người chơi** khi phải lùi bản.

## Lưu id, không lưu tham chiếu

`JsonUtility.ToJson` gặp field kiểu `ItemData` (SO) hay prefab sẽ ghi `{"instanceID": 21744}` — vô nghĩa ở lần mở sau. Mọi thứ tham chiếu asset lưu bằng **id string ổn định** khai trong SO, **không dùng `name`** (đổi tên asset là mất save):

```csharp
[CreateAssetMenu(menuName = "Game/Item Database")]
public sealed class ItemDatabase : ScriptableObject {
    [SerializeField] ItemData[] items;
    Dictionary<string, ItemData> byId;

    public ItemData Get(string id) {
        byId ??= items.ToDictionary(i => i.Id);
        if (byId.TryGetValue(id, out var d)) return d;
        Debug.LogWarning($"Item '{id}' không còn trong game — save cũ");   // KHÔNG crash
        return null;
    }
}
```

Validator trong Editor kiểm tra: mọi `ItemData` trong project có trong database, id không trùng, id không rỗng (xem [[unity-editor-tools]]). Với Addressables, id chính là address và `LoadAssetAsync<ItemData>(id)` thay database; xem [[unity-build-platform]]. Item bị xoá khỏi game giữa hai bản: giữ id trong bảng "tombstone" đổi thành vật phẩm bù, đừng để `null` rơi vào inventory.

## Đừng lưu vị trí object trong scene

Cám dỗ lớn là lưu transform của mọi object "để nạp lại y như cũ". Kết quả: save 5MB, phụ thuộc vào scene không đổi, và bug mỗi khi designer dời một cái thùng. Lưu **trạng thái có ý nghĩa thiết kế**: `openedChestIds`, `killedBossIds`, `currentCheckpointId`. Scene nạp lại từ prefab rồi áp trạng thái.

Object thật sự cần lưu (game sandbox, immersive sim) mang component `SaveId` với GUID sinh trong Editor và serialize vào scene. Bẫy: duplicate object là duplicate GUID; prefab instance chia GUID của prefab. Validator kiểm tra trùng, và GUID sinh lại khi `OnValidate` phát hiện trùng trong scene.

## Mã hoá: chống ai?

Mọi thứ trên client đều đọc được nếu người chơi đủ quyết tâm. Hai mục tiêu thật:
- **Chống sửa casual** (mở Notepad đổi `gold: 999999`): AES với key trong code + HMAC-SHA256 của nội dung. Ngăn 95% người thử, không ngăn Cheat Engine. Giá: không debug được bằng mắt; giữ cờ ghi JSON thô trong Development Build.
- **Kinh tế cạnh tranh, leaderboard, mua bán**: client chỉ là cache; server giữ sự thật. Không mã hoá nào thay được.

XOR với chuỗi cố định không phải mã hoá; đó là tự trấn an. Nếu chỉ chống casual, checksum đủ và rẻ.

## Cloud save và conflict

Steam Cloud, Google Play Games, iCloud KVS, Unity Cloud Save: cơ chế khác, bài toán giống nhau — máy A và máy B cùng có save đã đổi. Timestamp thua khi đồng hồ hai máy lệch (và người chơi đổi giờ máy để hack quà ngày). Dùng `playtimeSec` (đơn điệu, không phụ thuộc đồng hồ) làm tiêu chí chính, timestamp làm tie-break. Khi cả hai bản đều "tiến xa hơn" ở mặt khác nhau: **hỏi người chơi** với hai dòng tóm tắt ("Cấp 12, 4g20p" vs "Cấp 9, 2g05p"), không tự merge từng field.

## Test bằng save cũ

Giữ `Tests/SaveFixtures/v1.json`, `v2.json`… **từ mỗi bản đã phát hành**, và một EditMode test nạp từng file → `Migrate` → kiểm tra bất biến (`gold >= 0`, mọi `itemId` resolve được, `version == Current`). Thêm ba fixture ác: file rỗng, file cụt nửa, file có `version: 99`. Chạy trong CI. Không có test này, migration đúng hôm viết và sai ba bản sau khi ai đó đổi tên field.

## IL2CPP stripping xoá thứ bạn cần

Managed Stripping Level `Medium`/`High` bỏ code không được tham chiếu tĩnh. `JsonUtility` an toàn. Newtonsoft dùng reflection: constructor không tham số, setter private, class chỉ xuất hiện trong generic bị strip → field im lặng về `null`/`0`, **không lỗi**. Chữa:

```xml
<!-- Assets/link.xml -->
<linker>
  <assembly fullname="Game.Core">
    <namespace fullname="Game.Save" preserve="all"/>
  </assembly>
</linker>
```

hoặc `[UnityEngine.Scripting.Preserve]` trên class. Test save/load **trên máy thật với đúng stripping level của bản release**; Editor dùng Mono, không strip gì. Chi tiết ở [[unity-build-platform]].

## Bẫy lộ ra khi build

- `float.ToString()`/`Parse` không chỉ định culture trên máy `vi-VN`, `de-DE` đổi `1.5` thành `1,5`. `JsonUtility` không ảnh hưởng; mọi CSV, key tự ghép, hay `Newtonsoft` với converter tự viết phải dùng `CultureInfo.InvariantCulture`.
- Lưu trong `OnDestroy` khi scene unload: object khác đã bị destroy, `SaveData` ghi ra một nửa trạng thái. Lưu **trước** khi gọi `LoadSceneAsync`.
- Danh sách chỉ thêm không xoá (`killLog`, `visitedRooms` theo lần) lớn 10KB mỗi giờ chơi; sau 100 giờ, ghi save mất 200ms. Cap hoặc gộp thành số đếm.
- `Application.Quit()` trên iOS không tồn tại, `OnApplicationQuit` không được gọi trên mobile. Điểm lưu cuối là `OnApplicationPause(true)`.
- Đổi `Product Name` để rebrand → `persistentDataPath` đổi → mọi người chơi bắt đầu lại. Nếu bắt buộc, code dò đường dẫn cũ và di dời.

## Kiểm tra nhanh
- Script lưu 1.000 lần trong vòng lặp, `adb shell am force-stop` ngẫu nhiên giữa chừng: file luôn parse được, hoặc `.bak` cứu được?
- Nạp fixture v1 từ bản phát hành đầu: chơi tiếp được, không `NullReferenceException`, không item `null`?
- Đổi tên một asset `ItemData` trong Editor: save cũ vẫn resolve đúng?
- Build IL2CPP, stripping `High`, cài máy thật: save → tắt app → mở lại khớp Editor?
- File save sau 10 giờ chơi dưới 200KB?

## 🤖 Prompt cho AI

AI dùng `PlayerPrefs` cho tiến trình "để đơn giản", `BinaryFormatter` vì nó "serialize mọi thứ", lưu thẳng tham chiếu `ScriptableObject`, ghi bằng `File.WriteAllText` không atomic, và không có field `version`.

**Phải nêu rõ:**
- Danh sách field thật sự cần lưu và field nào là runtime-only
- Serializer: `JsonUtility` hay Newtonsoft, và giới hạn đi kèm (không Dictionary với JsonUtility)
- Số slot, có autosave không, bao nhiêu bản xoay vòng
- Tham chiếu asset resolve bằng gì: `ItemDatabase` SO hay Addressables address
- Nền tảng đích (quyết định `persistentDataPath`, WebGL syncfs, iCloud) và stripping level
- Mục tiêu bảo mật: không / chống casual / server authoritative

**Mẫu prompt**

```
Viết SaveService cho Unity 6000.0, Android + iOS, IL2CPP, Managed Stripping High.

SaveData: [Serializable] class PHẲNG, field public, có `int version = 1`, `long savedAtUnixMs`,
`double playtimeSec`, level, gold, List<string> unlockedItemIds, List<InventoryEntry> inventory.
Serialize bằng JsonUtility. CẤM Dictionary, CẤM DateTime, CẤM property, CẤM BinaryFormatter, CẤM Newtonsoft.
CẤM lưu tham chiếu ScriptableObject/prefab — chỉ lưu id string; resolve qua ItemDatabase.Get(id) (đã có),
trả null thì log warning và bỏ qua, KHÔNG throw.

Ghi: WriteAtomic (tmp → File.Replace, giữ .bak). Đường dẫn: persistentDataPath/saves/slot{n}/.
3 slot manual + autosave xoay vòng 3 bản mỗi slot. Autosave gọi ở checkpoint và OnApplicationPause(true),
đồng bộ, KHÔNG async. Nạp thử manual → manual.bak → auto mới nhất; bản nào nạp được thì báo qua event.

SaveMigrator: while-loop theo version, switch từng bước, throw nếu version > Current (KHÔNG ghi đè).
Viết sẵn khung cho v1→v2 dù chưa có gì để migrate.
PlayerPrefs CHỈ cho SettingsData (âm lượng, ngôn ngữ), KHÔNG chạm tiến trình.

Kèm EditMode test: nạp Tests/SaveFixtures/v1.json, file rỗng, file cụt, file version 99 — nêu kỳ vọng từng ca.
Không mã hoá ở bước này.
```

**Bẫy thường gặp:** AI cho `SaveData` chứa `Dictionary<string,int> inventory` rồi "serialize" bằng `JsonUtility` — biên dịch được, `ToJson` cho ra `{}` không lỗi, test trong Editor có vẻ ổn vì dữ liệu còn trong RAM. Người chơi mở lại app: inventory trống. Kiểm tra bằng cách **in JSON ra và đọc bằng mắt** sau lần ghi đầu tiên, đừng tin round-trip trong cùng phiên.

## 💻 Code

Demo dựng `SaveSystem` static ghi atomic qua `.tmp` → `File.Replace` (giữ `.bak`), nạp theo chuỗi chính → bak, và migration v1→v2→v3 với version đọc trước bằng `JsonUtility.FromJson<VersionOnly>`. `SaveDebugMenu` cho menu chuột phải để phá file, ghi fixture v1 và nạp lại — kiểm chứng được là file cụt không làm mất tiến trình và save cũ đi qua đúng từng bước migrate.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 330" role="img" aria-label="Hierarchy có SaveDebug với danh sách Context Menu và ba file trong thư mục saves; Inspector hiện SaveDebugMenu với Slot 0 và Autosave Interval 30, đường dẫn persistentDataPath ba nền tảng và Console mong đợi">
  <rect x="10" y="10" width="200" height="310" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">▾ SaveDemo</text>
  <rect x="16" y="72" width="188" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="22" y="87" class="fig-label" font-size="12" font-weight="600">▸ SaveDebug</text>
  <text x="22" y="108" class="fig-muted" font-size="11">Main Camera</text>
  <text x="22" y="140" class="fig-label" font-size="12" font-weight="600">Context menu (⋮ trên component)</text>
  <text x="34" y="158" class="fig-muted" font-size="11">Save</text>
  <text x="34" y="176" class="fig-muted" font-size="11">Load</text>
  <text x="34" y="194" class="fig-muted" font-size="11">Progress: +100 gold, level +1</text>
  <text x="34" y="212" font-size="11" fill="#ff8787">Corrupt main file (cắt nửa)</text>
  <text x="34" y="230" font-size="11" fill="#b197fc">Write v1 fixture</text>
  <text x="22" y="262" class="fig-label" font-size="12" font-weight="600">saves/ sau 2 lần Save</text>
  <text x="34" y="280" class="fig-muted" font-size="11">slot0.json</text>
  <text x="34" y="298" class="fig-muted" font-size="11">slot0.json.bak</text>
  <text x="34" y="314" class="fig-muted" font-size="11">slot0.json.tmp  (chỉ lúc đang ghi)</text>
  <rect x="226" y="10" width="424" height="310" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector — SaveDebug</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Save Debug Menu (Script)</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Slot</text><text x="440" y="82" class="fig-label" font-size="11">0</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Autosave Interval</text><text x="440" y="98" class="fig-label" font-size="11">30</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Data (runtime, không serialize)</text><text x="440" y="114" class="fig-label" font-size="11">v3 · level 1 · gold 0</text>
  <rect x="234" y="124" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="137" class="fig-label" font-size="12" font-weight="600">persistentDataPath/saves/</text>
  <text x="250" y="156" class="fig-muted" font-size="11">Windows</text><text x="320" y="156" class="fig-label" font-size="11">%USERPROFILE%\AppData\LocalLow\&lt;Company&gt;\&lt;Product&gt;\saves\</text>
  <text x="250" y="172" class="fig-muted" font-size="11">Android</text><text x="320" y="172" class="fig-label" font-size="11">/storage/emulated/0/Android/data/&lt;package&gt;/files/saves/</text>
  <text x="250" y="188" class="fig-muted" font-size="11">iOS</text><text x="320" y="188" class="fig-label" font-size="11">&lt;App&gt;/Documents/saves/   (mặc định lên iCloud backup)</text>
  <text x="250" y="204" class="fig-muted" font-size="11">Editor dùng đường dẫn Windows/macOS với Company/Product của project — khác build.</text>
  <rect x="234" y="214" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="227" class="fig-label" font-size="12" font-weight="600">Console mong đợi sau Corrupt → Load</text>
  <text x="250" y="246" font-size="11" fill="#ff8787">[Save] Không nạp được slot0.json: JSON parse error…</text>
  <text x="250" y="262" class="fig-muted" font-size="11">[Save] Nạp từ slot0.json.bak · level 2 · gold 100 · unlock 1</text>
  <text x="250" y="286" class="fig-label" font-size="11" font-weight="600">Sau Write v1 fixture → Load</text>
  <text x="250" y="302" class="fig-muted" font-size="11">[Save] migrate → v2   ·   [Save] migrate → v3   ·   gold 121 · unlock 2</text>
</svg>
<figcaption>Một GameObject, một script. Mọi việc ghi/đọc là static trong <code>SaveSystem</code> nên gọi được từ <code>OnApplicationPause</code> hay EditMode test mà không cần scene.</figcaption>
</figure>

**Script**

```csharp
// SaveData.cs — Unity 6 (6000.x). Class PHẲNG cho JsonUtility: field public, không property, không Dictionary, không DateTime.
using System;
using System.Collections.Generic;

[Serializable]
public sealed class SaveData
{
    public int version = SaveSystem.CurrentVersion;
    public long savedAtUnixMs;                    // long, KHÔNG DateTime
    public ProgressData progress = new();
    public SettingsData settings = new();
    public List<string> unlockedIds = new();      // id string ổn định, KHÔNG tham chiếu asset

    // Field cũ, chỉ migration đọc. Không xoá — save v1/v2 ngoài kia vẫn phải đi qua đúng con đường này.
    public float legacy_coins;                    // v1: vàng là float ở gốc
    public List<int> legacy_unlockIndices;        // v2: unlock bằng chỉ số bảng
}

[Serializable]
public sealed class ProgressData
{
    public int level = 1;
    public int gold;
    public double playtimeSec;                    // đơn điệu tăng — tiêu chí giải quyết conflict cloud
    public string checkpointId = "";
}

[Serializable]
public sealed class SettingsData
{
    public float musicVolume = 0.8f;
    public float sfxVolume = 1f;
    public string language = "vi";
}

/// <summary>Chỉ đọc version — biết JSON thuộc phiên bản nào trước khi parse toàn bộ.</summary>
[Serializable]
public sealed class VersionOnly { public int version; }
```

```csharp
// SaveSystem.cs — Unity 6 (6000.x). Static: ghi atomic (.tmp → Replace, giữ .bak), nạp có fallback, migrate theo chuỗi.
using System;
using System.IO;
using UnityEngine;

public static class SaveSystem
{
    public const int CurrentVersion = 3;

    public static string Dir => Path.Combine(Application.persistentDataPath, "saves");
    public static string PathFor(int slot) => Path.Combine(Dir, $"slot{slot}.json");

    public static void Save(int slot, SaveData data)
    {
        data.version = CurrentVersion;
        data.savedAtUnixMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        string json = JsonUtility.ToJson(data, prettyPrint: true);   // đọc được bằng mắt; release bỏ prettyPrint
        WriteAtomic(PathFor(slot), json);
    }

    /// <summary>Thử file chính rồi .bak. Trả null nếu cả hai hỏng; loadedFrom cho biết đã phải lùi bản hay chưa.</summary>
    public static SaveData Load(int slot, out string loadedFrom)
    {
        string main = PathFor(slot);
        foreach (var p in new[] { main, main + ".bak" })
        {
            var d = TryRead(p);
            if (d == null) continue;
            loadedFrom = p;
            return d;
        }
        loadedFrom = null;
        return null;
    }

    static void WriteAtomic(string path, string json)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(path));
        string tmp = path + ".tmp";
        File.WriteAllText(tmp, json);                    // app bị giết ở đây: file chính còn nguyên
        if (!File.Exists(path)) { File.Move(tmp, path); return; }
        try
        {
            File.Replace(tmp, path, path + ".bak");      // hoán đổi nguyên tử, bản cũ thành .bak
        }
        catch (PlatformNotSupportedException)            // lối thoát KHÔNG nguyên tử cho nền tảng lạ
        {
            File.Copy(path, path + ".bak", overwrite: true);
            File.Delete(path);
            File.Move(tmp, path);
        }
    }

    static SaveData TryRead(string path)
    {
        if (!File.Exists(path)) return null;
        try
        {
            string json = File.ReadAllText(path);
            if (string.IsNullOrWhiteSpace(json)) throw new InvalidDataException("file rỗng");

            int v = JsonUtility.FromJson<VersionOnly>(json).version;   // đọc version trước, chưa đụng phần còn lại
            if (v <= 0) throw new InvalidDataException("thiếu version");
            if (v > CurrentVersion) throw new InvalidDataException($"save từ bản mới hơn (v{v} > v{CurrentVersion}) — không ghi đè");

            return Migrate(JsonUtility.FromJson<SaveData>(json));
        }
        catch (Exception e)                              // file cụt → ArgumentException "JSON parse error"
        {
            Debug.LogWarning($"[Save] Không nạp được {Path.GetFileName(path)}: {e.Message}");
            return null;
        }
    }

    static SaveData Migrate(SaveData d)
    {
        while (d.version < CurrentVersion)
        {
            switch (d.version)
            {
                case 1: From1To2(d); break;
                case 2: From2To3(d); break;
                default: throw new InvalidDataException($"thiếu bước migrate từ v{d.version}");
            }
            d.version++;
            Debug.Log($"[Save] migrate → v{d.version}");
        }
        return d;
    }

    // v1 lưu vàng là float 'coins' ở gốc → v2 chuyển sang progress.gold (int)
    static void From1To2(SaveData d)
    {
        d.progress.gold = Mathf.RoundToInt(d.legacy_coins);
        d.legacy_coins = 0f;
    }

    // v2 lưu unlock bằng chỉ số bảng → v3 bằng id string. Bảng cũ đóng băng ở đây, KHÔNG đọc từ ItemDatabase hiện tại.
    static readonly string[] legacyItemTable = { "sword_basic", "bow_short", "potion_small", "shield_wood" };
    static void From2To3(SaveData d)
    {
        if (d.legacy_unlockIndices != null)
            foreach (int i in d.legacy_unlockIndices)
                if (i >= 0 && i < legacyItemTable.Length && !d.unlockedIds.Contains(legacyItemTable[i]))
                    d.unlockedIds.Add(legacyItemTable[i]);   // chỉ số ngoài bảng: bỏ qua, KHÔNG crash
        d.legacy_unlockIndices = null;
    }
}
```

```csharp
// SaveDebugMenu.cs — Unity 6 (6000.x). Trên GameObject "SaveDebug". Chuột phải header component (⋮) để Save/Load/phá file.
using System.IO;
using UnityEngine;

public sealed class SaveDebugMenu : MonoBehaviour
{
    [SerializeField, Min(0)] int slot = 0;
    [SerializeField, Min(5f)] float autosaveInterval = 30f;   // giây, đo bằng unscaled — pause không hoãn autosave

    public SaveData Data { get; private set; } = new();
    float autosaveTimer;

    void Start()
    {
        Debug.Log($"[Save] persistentDataPath = {Application.persistentDataPath}");
        LoadNow();
    }

    void Update()
    {
        Data.progress.playtimeSec += Time.unscaledDeltaTime;
        autosaveTimer += Time.unscaledDeltaTime;
        if (autosaveTimer >= autosaveInterval) { autosaveTimer = 0f; SaveNow(); }
    }

    void OnApplicationPause(bool paused) { if (paused) SaveNow(); }   // Android: điểm lưu đáng tin cuối cùng, đồng bộ
    void OnApplicationQuit() => SaveNow();                             // desktop; mobile hầu như không gọi

    [ContextMenu("Save")]
    void SaveNow()
    {
        SaveSystem.Save(slot, Data);
        long bytes = new FileInfo(SaveSystem.PathFor(slot)).Length;
        Debug.Log($"[Save] Đã ghi slot {slot} · v{Data.version} · {bytes} B · gold {Data.progress.gold}");
    }

    [ContextMenu("Load")]
    void LoadNow()
    {
        Data = SaveSystem.Load(slot, out var from) ?? new SaveData();
        Debug.Log(from == null
            ? "[Save] Không có save nạp được — tạo mới"
            : $"[Save] Nạp từ {Path.GetFileName(from)} · level {Data.progress.level} · gold {Data.progress.gold} · unlock {Data.unlockedIds.Count}");
    }

    [ContextMenu("Progress: +100 gold, level +1")]
    void Progress()
    {
        Data.progress.gold += 100;
        Data.progress.level++;
        Data.unlockedIds.Add($"item_{Data.progress.level}");
    }

    [ContextMenu("Corrupt main file (cắt nửa)")]
    void Corrupt()
    {
        string p = SaveSystem.PathFor(slot);
        if (!File.Exists(p)) { Debug.LogWarning("[Save] Chưa có file để phá — Save trước"); return; }
        string json = File.ReadAllText(p);
        File.WriteAllText(p, json.Substring(0, json.Length / 2));   // giả lập app bị giết giữa lúc ghi KHÔNG atomic
        Debug.Log("[Save] Đã cắt nửa file chính — Load sẽ phải lùi về .bak");
    }

    [ContextMenu("Write v1 fixture")]
    void WriteV1()
    {
        string p = SaveSystem.PathFor(slot);
        Directory.CreateDirectory(Path.GetDirectoryName(p));
        File.WriteAllText(p, "{\"version\":1,\"legacy_coins\":120.7,\"legacy_unlockIndices\":[0,2,7]}");
        Debug.Log("[Save] Đã ghi save v1 giả — Load để xem migrate v1→v2→v3");
    }
}
```

**Chạy thử**
- Play: Console in `persistentDataPath` và `Không có save nạp được — tạo mới`. Chuột phải component ▸ Save: `Đã ghi slot 0 · v3 · ~300 B`; mở đường dẫn đó thấy `saves/slot0.json` đọc được bằng mắt, có `"version": 3` và `"progress": {…}`.
- Progress rồi Save lần 2: thư mục giờ có thêm `slot0.json.bak` (bản gold 0). Corrupt → Load: một warning `Không nạp được slot0.json: JSON parse error` rồi `Nạp từ slot0.json.bak · level 1 · gold 0` — mất một bước tiến, không mất tất cả. Bỏ `.bak` đi (xoá tay) và Corrupt lần nữa: Load trả về `tạo mới` — đó là lý do có bản backup.
- Write v1 fixture → Load: hai dòng `migrate → v2`, `migrate → v3`, rồi `gold 121 · unlock 2` (120.7 làm tròn; chỉ số 7 ngoài bảng bị bỏ, `[0,2]` thành `sword_basic`, `potion_small`). Save ngay: file giờ là v3 với `"legacy_coins": 0` và `"legacy_unlockIndices": []` — field legacy vẫn có mặt, đúng thiết kế.
- Sửa tay file thành `"version": 99` → Load: warning `save từ bản mới hơn (v99 > v3) — không ghi đè`, nạp `.bak` hoặc tạo mới. Lưu ý autosave 30 giây sau **sẽ** ghi đè file chính (bản v99 chuyển thành `.bak`) — dự án thật phải khoá ghi khi gặp ca này.
- Đặt `Autosave Interval` 5, bấm Esc để `Time.timeScale = 0` (nếu có GameFlow) hoặc gõ `Time.timeScale = 0` trong Console: log `Đã ghi` vẫn đều 5 giây một lần vì đếm bằng `unscaledDeltaTime`. Trên Android: nhận thưởng → Home ngay → kill từ Recent Apps → mở lại: gold còn, vì `OnApplicationPause(true)` đã ghi đồng bộ.
