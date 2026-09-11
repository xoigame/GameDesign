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
