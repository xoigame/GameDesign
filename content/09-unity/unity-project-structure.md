---
title: Tổ chức dự án & Assembly
icon: 🗂️
summary: Thư mục theo feature, Assembly Definition đúng liều, prefab variant thay kế thừa, scene additive để 4 người không giẫm chân, và Git không phá project.
status: deep
read: 620
level: intermediate
order: 20
tags: [unity, workflow, team, architecture]
related: [tech-stack, ai-workflow, unity-editor-tools, unity-build-platform]
---

Cấu trúc dự án là thứ **rẻ nhất để làm đúng ở tuần 1 và đắt nhất để sửa ở tháng 6**. Không phải vì Unity ép buộc gì (nó không ép), mà vì mỗi tham chiếu prefab, mỗi GUID trong scene, mỗi asmdef là một sợi dây; kéo lại một thư mục có 400 file khi ba người khác đang mở scene là cách nhanh nhất mất một ngày cả team.

Quyết định cốt lõi: **tổ chức theo feature, không theo loại asset**, và **mọi thứ của bạn nằm dưới một thư mục gốc**.

## `_Project/` và tổ chức theo feature

```
Assets/
├── _Project/                    ← gạch dưới để xếp đầu, tách khỏi asset store
│   ├── Core/                    bootstrap, service, interface dùng chung
│   ├── Features/
│   │   ├── Combat/  {Scripts, Prefabs, Data, Art, Tests}
│   │   ├── Inventory/
│   │   └── Dialogue/
│   ├── Art/                     thứ dùng chung thật sự: font, UI atlas, skybox
│   ├── Scenes/
│   ├── Settings/                URP asset, Input Actions, Presets, Addressables
│   └── Editor/
├── Plugins/                     native lib, SDK bên thứ ba
└── <TênAssetStore>/             KHÔNG sửa, KHÔNG di chuyển — update sẽ ghi đè
```

| | Theo loại (`Scripts/`, `Prefabs/`, `Materials/`) | Theo feature |
|---|---|---|
| 1 người, < 100 file | Ổn | Ổn, hơi thừa |
| 3+ người | `Scripts/` có 400 file; sửa Combat đụng 5 thư mục; PR nào cũng conflict ở thư mục chung | Một feature = một thư mục = một PR; xoá feature = xoá thư mục |
| Assembly Definition | Không chia được theo phụ thuộc | Mỗi feature một asmdef, tự nhiên |
| Tìm "mọi thứ về Combat" | Search 5 nơi | Mở một thư mục |

Ranh giới quan trọng: thứ trong `Core/` **không được tham chiếu** thứ trong `Features/`. Feature nói chuyện với nhau qua interface và event channel đặt ở `Core/` (xem [[unity-design-patterns]]). Nếu `Combat` cần biết `Inventory`, nó đọc `IInventoryQuery` từ Core, không `using Game.Inventory`.

## Assembly Definition: đúng liều

Không có asmdef, mọi script vào `Assembly-CSharp` và **đổi một dòng là compile lại tất cả**. 800 script, máy trung bình: 8–15 giây mỗi lần lưu, cộng Domain Reload. Chia asmdef thì đổi một dòng ở feature lá chỉ compile feature đó và những gì phụ thuộc nó: 1–3 giây.

Nhưng 40 asmdef mỗi cái 10 file là quá liều: mỗi assembly có chi phí nạp cố định, thời gian build tăng, và bạn dành cả buổi sửa "type not found" vì quên tick reference. **5–12 asmdef** là vùng hợp lý cho dự án 6–18 tháng:

```
Game.Core            không tham chiếu ai — interface, event channel, tiện ích
Game.Gameplay        → Core
Game.UI              → Core   (KHÔNG → Gameplay: UI nghe event, không gọi thẳng)
Game.Features.Combat → Core, Gameplay
Game.Editor          → tất cả; Platforms = Editor only
Game.Tests.EditMode  → Core, Gameplay; tick "Test Assemblies"
```

Vòng phụ thuộc là lỗi biên dịch ngay lập tức ("cyclic references detected"). Đó là **tính năng**: nó ép bạn quyết định ai phụ thuộc ai thay vì để `using` mọc tự do.

Bẫy đáng nhớ:
- **Code không nằm trong asmdef nào** rơi vào `Assembly-CSharp`, và asmdef của bạn **không thể tham chiếu** `Assembly-CSharp`. Asset store không kèm asmdef (nhiều cái) → code của bạn trong asmdef không gọi được nó. Cách xử: tạo asmdef riêng trong thư mục third-party (mất khi update, phải làm lại), hoặc dùng file `Assembly Definition Reference`.
- `Auto Referenced` tắt → `Assembly-CSharp` không thấy assembly này. Tắt cho toàn bộ asmdef của bạn để **ép mọi code mới phải thuộc một asmdef**, không lọt vào thùng chung.
- Code `using UnityEditor` ngoài asmdef Editor-only hoặc ngoài thư mục `Editor/` → Editor chạy bình thường, **build fail**. Bọc `#if UNITY_EDITOR` nếu bắt buộc ở chung file.
- `Version Defines` trong asmdef (`DOTWEEN` khi có package `com.demigiant.dotween`) cho code tuỳ chọn, thay vì define toàn cục trong Player Settings.

## Prefab Variant thay cho kế thừa

`Enemy_Base` là prefab có mọi component. `Enemy_Goblin`, `Enemy_Orc` là **Variant** chỉ ghi đè cái khác biệt: mesh, `EnemyData`, vài collider. Nested prefab cho phần lặp lại (thanh máu, điểm gắn vũ khí). Sửa base, mọi variant nhận. Đây là composition ở tầng asset, đúng tinh thần [[architecture-patterns]].

Ba bẫy override lộ ra sau vài tuần:
- **Override thắng âm thầm.** Bạn đổi HP của base từ 100 lên 120; `Enemy_Goblin` vẫn 100 vì ai đó từng "chỉnh thử" rồi không revert. Không lỗi, không cảnh báo. Mở dropdown Overrides của variant định kỳ và revert những gì không cố ý.
- **Apply All từ instance trong scene** đẩy cả vị trí, rotation, và những thứ chỉ có ý nghĩa trong scene đó về prefab. Apply từng thuộc tính, hoặc chỉ Apply khi đang mở Prefab Mode.
- **Override mảng theo chỉ số.** Variant ghi đè phần tử [2] của mảng drop table. Base chèn một phần tử ở [1] → override của variant giờ đè lên phần tử khác. Mảng trong prefab phải ổn định về thứ tự, hoặc chuyển bảng đó sang ScriptableObject.

## Scene additive theo vai trò

Một scene `Level01.unity` do 4 người cùng sửa là chuỗi conflict không hồi kết dù có Smart Merge. Tách:

```
Level01_Env.unity        artist — mesh, đèn, bake lighting, reflection probe
Level01_Gameplay.unity   designer — spawn point, trigger, patrol path
Level01_Audio.unity      sound — vùng reverb, nguồn ambient
UI.unity                 nạp một lần từ Boot, xem [[unity-game-loop]]
```

Mỗi người sở hữu một file. Nạp cả nhóm bằng một ScriptableObject `LevelDefinition` liệt kê tên scene.

Đổi lại: **không tham chiếu Inspector xuyên scene**. Unity từ chối serialize tham chiếu từ object scene A sang object scene B. Trigger ở Gameplay muốn mở cửa ở Env phải qua event channel hoặc tìm theo id lúc nạp. Lighting bake ghi vào **scene active** — set Env làm active trước khi bake, không thì lightmap dính vào scene Gameplay. NavMesh và Occlusion cũng theo scene: bake ở Env.

## Git cho Unity

`Edit > Project Settings > Editor > Asset Serialization = Force Text` (mặc định với project mới, kiểm tra với project cũ). Không có nó, scene là binary, không diff, không merge.

`.gitignore` từ template Unity của GitHub, điểm mấu chốt: bỏ `Library/`, `Temp/`, `Logs/`, `UserSettings/`, `*.csproj`, `*.sln`; **giữ** `ProjectSettings/`, `Packages/manifest.json` và `packages-lock.json`.

`.gitattributes`:

```
*.unity  merge=unityyamlmerge eol=lf
*.prefab merge=unityyamlmerge eol=lf
*.asset  merge=unityyamlmerge eol=lf
*.png *.psd *.tga *.fbx *.wav *.ogg *.mp4 filter=lfs diff=lfs merge=lfs -text
```

`UnityYAMLMerge` nằm trong `<Editor>/Data/Tools/`; cấu hình driver `merge.unityyamlmerge.driver` một lần trên mỗi máy. Nó merge được 80% conflict scene; 20% còn lại là hai người sửa **cùng một object**, không công cụ nào cứu — đó là lý do chia scene ở trên.

Git LFS cho binary: bắt buộc từ khi repo vượt vài trăm MB. Biết trước: GitHub miễn phí 1GB băng thông/tháng, team 5 người clone vài lần là hết; tự host hoặc trả tiền.

**Meta file** là sợi dây GUID nối mọi thứ. Hai tai nạn quen mặt:
- Thêm file qua Explorer, commit không kèm `.meta` → máy khác Unity sinh GUID mới → mọi tham chiếu tới nó thành `Missing`. Quy tắc: mọi thao tác file làm **trong Unity**, và `.gitignore` không bao giờ có `*.meta`.
- Copy thư mục kèm meta ra chỗ khác → trùng GUID → Unity cảnh báo một dòng rồi **tự gán lại một trong hai**, tham chiếu trỏ vào cái nào tuỳ may.

Thư mục rỗng có `.meta` nhưng Git không lưu thư mục rỗng → máy khác báo "orphan meta". Vô hại nhưng ồn; xoá hoặc thêm `.gitkeep`.

## Đặt tên và Presets

Tên asset là để **search**, không phải để đọc. Project window tìm `t:Prefab goblin` nhanh hơn duyệt cây. Tiền tố theo loại giúp Hierarchy và Addressables: `P_Goblin`, `SO_GoblinData`, `M_Goblin`, `T_Goblin_Albedo`, `SFX_Goblin_Hit`, `Anim_Goblin_Attack`. Không dấu tiếng Việt, không khoảng trắng (Addressables key, command line, Android packaging).

**Import settings là code.** Một texture UI 2048 quên tắt mipmap và Read/Write tốn 16MB thay vì 4MB, và không ai nhận ra vì Editor có 32GB RAM. Preset (`Assets/_Project/Settings/Presets/`) + Preset Manager với filter theo đường dẫn: `_Project/Art/UI/**` nhận preset Sprite-2D-no-mipmap, `**/SFX_*` nhận Decompress On Load, `**/Music_*` nhận Streaming. Preset chỉ áp **lúc import lần đầu**; asset đã có phải áp tay hoặc qua validator, xem [[unity-editor-tools]].

## `manifest.json`, `Library/`, và phiên bản

`Packages/manifest.json` ghim phiên bản chính xác (`"com.unity.cinemachine": "3.1.2"`), commit cùng `packages-lock.json`. Package từ Git URL ghim bằng tag `#v1.2.3`, không bằng branch. Nút "Update" trong Package Manager là một PR riêng, không phải việc tiện tay.

`ProjectSettings/ProjectVersion.txt` commit, và **cả team cùng một phiên bản Editor** tới số patch. Mở project bằng bản mới hơn là chuyến đi một chiều: asset bị reserialize, người dùng bản cũ không mở được nữa.

`Library/` corrupt lộ ra bằng material hồng khắp nơi, script `Missing` hàng loạt, hoặc import treo. Cách chữa duy nhất đáng tin: đóng Unity, xoá `Library/`, mở lại. Project 20GB mất 30–60 phút reimport. Đó là lý do team từ 3 người nên chạy Unity Accelerator: reimport lấy từ cache, còn 3–5 phút.

## Bẫy hay gặp

- Mọi thứ trong thư mục tên `Resources/` **luôn vào build** dù không ai dùng. Asset store hay có thư mục này; kích cỡ build tăng 100MB không rõ từ đâu. Xem [[unity-build-platform]].
- Windows không phân biệt hoa thường, CI Linux thì có: `Assets/art/` và `Assets/Art/` là hai thư mục trên máy build.
- Đường dẫn Windows giới hạn 260 ký tự; `Library/Artifacts` cộng thư mục feature sâu 6 tầng chạm giới hạn, lỗi báo mơ hồ "could not import".
- Scene không có trong Build Settings: Editor Play vẫn báo lỗi, nhưng nhiều người quen tắt lỗi này. Validator kiểm tra `LevelDefinition` ↔ Build Settings.
- Sửa file trong thư mục asset store để "fix nhanh" → update package ghi đè, bug quay lại 3 tháng sau.

## Kiểm tra nhanh
- Đổi một dòng trong script feature, lưu: Console báo compile xong dưới 3 giây?
- Clone repo lên máy sạch, mở, bấm Play: chạy không cần hỏi ai? (LFS pull đủ, package restore đủ, không Missing script)
- `git status` sau khi mở project và không làm gì: sạch? Nếu không, thứ gì đang bị Unity tự sửa.
- Chọn 10 texture ngẫu nhiên: cái nào không khớp preset của thư mục nó nằm?
- Đếm thư mục `Resources/` trong project: ngoài của bạn ra còn cái nào?

## 🤖 Prompt cho AI

AI sinh cấu trúc `Scripts/ Prefabs/ Materials/` theo loại vì đó là mẫu phổ biến nhất trong dữ liệu huấn luyện, đề xuất một asmdef cho mỗi thư mục, và không bao giờ nhắc tới `.meta`, LFS, hay Force Text.

**Phải nêu rõ:**
- Số người trong team và vai trò (artist, designer có sửa scene không)
- Danh sách feature dự kiến trong 6 tháng, cái nào phụ thuộc cái nào
- Asset store / package đã dùng, cái nào có asmdef sẵn
- Số asmdef tối đa cho phép và quy tắc phụ thuộc (Core không tham chiếu Features)
- Git hosting (giới hạn LFS) và có CI Linux không
- Phiên bản Editor chính xác tới patch

**Mẫu prompt**

```
Thiết kế cấu trúc thư mục + asmdef cho dự án Unity 6000.0.x, team 4 người (2 dev, 1 artist, 1 designer),
feature: Combat, Inventory, Dialogue, Shop. Shop phụ thuộc Inventory; không feature nào phụ thuộc Combat.

Yêu cầu:
- Mọi thứ của dự án dưới Assets/_Project/. Tổ chức THEO FEATURE, CẤM thư mục Scripts/Prefabs chung.
- Tối đa 8 asmdef. Game.Core không tham chiếu bất kỳ Feature nào. UI không tham chiếu Gameplay.
  Auto Referenced = false cho tất cả. Editor code chỉ trong asmdef Platforms = Editor.
- Package có sẵn: Cinemachine 3.1.2, Input System 1.11, DOTween (KHÔNG có asmdef) — nói cách asmdef của tôi gọi được DOTween.
- Mỗi level chia 3 scene additive: Env / Gameplay / Audio. Nói lighting bake vào scene nào.
- Xuất .gitignore, .gitattributes (UnityYAMLMerge + LFS cho png/psd/fbx/wav/ogg/mp4), lệnh cấu hình merge driver trên Windows.
- KHÔNG đề xuất tool/package mới. KHÔNG dùng thư mục Resources/.

Trả về dạng cây thư mục + bảng asmdef (tên, tham chiếu, platform) + 5 quy tắc đặt tên. Không viết code C#.
```

**Bẫy thường gặp:** AI tạo asmdef `Game.UI` tham chiếu `Game.Gameplay` "để UI đọc HP của Player", rồi `Game.Gameplay` tham chiếu `Game.UI` "để hiện damage number". Từng bước hợp lý, cộng lại là vòng phụ thuộc — Unity báo lỗi, AI sửa bằng cách **gộp hai asmdef thành một**, và bạn quay về `Assembly-CSharp` với tên khác. Ràng buộc chiều phụ thuộc phải viết thành luật trong prompt, không để AI suy.

## 💻 Code

Demo dựng một validator Editor bấm từ menu `Tools/Validate Project`: quét bốn lỗi cấu trúc mà không lỗi biên dịch nào bắt được (asset lạc ngoài `_Project`, texture lớn chưa Override cho Android, prefab base nằm nhầm thư mục Variants, scene thiếu trong Build Settings), kèm một `.asmdef` mẫu cho `Game.Gameplay` với `Auto Referenced` tắt để mọi code mới bắt buộc thuộc một assembly.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 350" role="img" aria-label="Project window hiện cây thư mục _Project với các file asmdef và validator; Inspector của Game.Gameplay.asmdef hiện Name, References, Auto Referenced tắt, Platforms và Version Defines">
  <rect x="10" y="10" width="200" height="330" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Project</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">▾ Assets</text>
  <text x="34" y="82" class="fig-muted" font-size="12">▾ _Project</text>
  <text x="46" y="100" class="fig-muted" font-size="11">▾ Core</text>
  <text x="58" y="118" class="fig-muted" font-size="11">Game.Core.asmdef</text>
  <text x="46" y="136" class="fig-muted" font-size="11">▾ Gameplay</text>
  <rect x="52" y="144" width="152" height="18" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="58" y="157" class="fig-label" font-size="11" font-weight="600">Game.Gameplay.asmdef</text>
  <text x="46" y="176" class="fig-muted" font-size="11">▾ Features ▸ Combat</text>
  <text x="58" y="194" class="fig-muted" font-size="11">Scripts · Game.Features.Combat.asmdef</text>
  <text x="58" y="212" class="fig-muted" font-size="11">Prefabs ▸ Variants</text>
  <text x="46" y="230" class="fig-muted" font-size="11">Scenes   ·   Settings</text>
  <text x="46" y="248" class="fig-muted" font-size="11">▾ Editor  (Game.Editor, Editor only)</text>
  <text x="58" y="266" class="fig-muted" font-size="11">ProjectStructureValidator.cs</text>
  <text x="34" y="288" class="fig-muted" font-size="12">Plugins</text>
  <text x="34" y="306" class="fig-muted" font-size="12">&lt;AssetStore&gt;  (không sửa)</text>
  <text x="22" y="330" class="fig-muted" font-size="11">Menu: Tools ▸ Validate Project</text>
  <rect x="226" y="10" width="424" height="330" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector — Game.Gameplay (Assembly Definition)</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">General</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Name</text><text x="440" y="82" class="fig-label" font-size="11">Game.Gameplay</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Root Namespace</text><text x="440" y="98" class="fig-label" font-size="11">Game.Gameplay</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Auto Referenced</text><text x="440" y="114" class="fig-label" font-size="11">☐  (Assembly-CSharp không thấy assembly này)</text>
  <text x="250" y="130" class="fig-muted" font-size="11">Override References</text><text x="440" y="130" class="fig-label" font-size="11">☐</text>
  <text x="250" y="146" class="fig-muted" font-size="11">No Engine References</text><text x="440" y="146" class="fig-label" font-size="11">☐</text>
  <rect x="234" y="156" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="169" class="fig-label" font-size="12" font-weight="600">Assembly Definition References</text>
  <text x="250" y="188" class="fig-muted" font-size="11">[0]</text><text x="440" y="188" class="fig-label" font-size="11">Game.Core</text>
  <text x="250" y="204" class="fig-muted" font-size="11">[1]</text><text x="440" y="204" class="fig-label" font-size="11">Unity.InputSystem</text>
  <text x="250" y="220" class="fig-muted" font-size="11">[2]</text><text x="440" y="220" class="fig-label" font-size="11">Unity.Cinemachine</text>
  <rect x="234" y="230" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="243" class="fig-label" font-size="12" font-weight="600">Platforms</text>
  <text x="250" y="262" class="fig-muted" font-size="11">Any Platform</text><text x="440" y="262" class="fig-label" font-size="11">☑  (Game.Editor: chỉ tick Editor)</text>
  <rect x="234" y="272" width="408" height="18" rx="3" fill="#b197fc" opacity="0.22"/>
  <text x="242" y="285" class="fig-label" font-size="12" font-weight="600">Define Constraints · Version Defines</text>
  <text x="250" y="304" class="fig-muted" font-size="11">Define Constraints</text><text x="440" y="304" class="fig-label" font-size="11">(trống)</text>
  <text x="250" y="320" class="fig-muted" font-size="11">Version Defines [0]</text><text x="440" y="320" class="fig-label" font-size="11">com.demigiant.dotween → DOTWEEN</text>
</svg>
<figcaption>Validator nằm trong <code>_Project/Editor/</code> thuộc asmdef <code>Game.Editor</code> (Platforms = Editor) nên không lọt vào build. <code>Game.Gameplay</code> chỉ tham chiếu <code>Game.Core</code> và package; không tham chiếu UI hay Features.</figcaption>
</figure>

**Script**

```csharp
// Editor/ProjectStructureValidator.cs — Unity 6 (6000.x). Đặt trong Assets/_Project/Editor/ (asmdef Game.Editor, Platforms = Editor).
// Menu Tools/Validate Project: quét 4 lỗi cấu trúc, mỗi lỗi một dòng warning bấm được để ping asset.
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEngine;

public static class ProjectStructureValidator
{
    const string Root = "Assets/_Project";
    const int MaxTextureSize = 2048;

    // Thư mục được phép nằm ngoài _Project. Cài asset store thì THÊM tên nó vào đây, không di chuyển nó.
    static readonly string[] allowedRoots =
    {
        Root, "Assets/Plugins", "Assets/StreamingAssets", "Assets/TextMesh Pro",
    };

    [MenuItem("Tools/Validate Project")]
    public static void Run()
    {
        int issues = 0;
        issues += CheckAssetsOutsideRoot();
        issues += CheckLargeTexturesWithoutAndroidOverride();
        issues += CheckVariantFolders();
        issues += CheckScenesInBuildSettings();
        if (issues == 0) Debug.Log("[Validate] Sạch — 0 vấn đề.");
        else Debug.LogWarning($"[Validate] {issues} vấn đề. Bấm vào từng dòng để ping asset.");
    }

    // 1. Mọi file của dự án nằm dưới _Project hoặc thư mục third-party đã khai
    static int CheckAssetsOutsideRoot()
    {
        int n = 0;
        foreach (var path in AllPaths("", "Assets"))
        {
            if (AssetDatabase.IsValidFolder(path)) continue;
            if (allowedRoots.Any(r => path.StartsWith(r + "/"))) continue;
            Report(path, $"nằm ngoài {Root} — kéo vào feature tương ứng, hoặc khai thư mục vào allowedRoots nếu là asset store");
            n++;
        }
        return n;
    }

    // 2. Texture cho phép > 2048 mà Android không Override → build Android tải texture 4096 vào RAM điện thoại
    static int CheckLargeTexturesWithoutAndroidOverride()
    {
        int n = 0;
        foreach (var path in AllPaths("t:Texture2D", Root))
        {
            if (AssetImporter.GetAtPath(path) is not TextureImporter imp) continue;
            var android = imp.GetPlatformTextureSettings("Android");
            bool leaks = imp.maxTextureSize > MaxTextureSize
                      && (!android.overridden || android.maxTextureSize > MaxTextureSize);
            if (!leaks) continue;
            Report(path, $"Max Size {imp.maxTextureSize} > {MaxTextureSize} và Android chưa Override — áp Preset hoặc tick Override for Android");
            n++;
        }
        return n;
    }

    // 3. Prefab trong Features/*/Prefabs/Variants phải là Variant thật — prefab base kéo nhầm vào đây là sai chỗ
    static int CheckVariantFolders()
    {
        int n = 0;
        foreach (var path in AllPaths("t:Prefab", Root + "/Features"))
        {
            if (!path.Contains("/Prefabs/Variants/")) continue;
            var go = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            if (go == null || PrefabUtility.GetPrefabAssetType(go) == PrefabAssetType.Variant) continue;
            Report(path, "không phải Prefab Variant nhưng nằm trong Prefabs/Variants — chuyển ra Prefabs/ hoặc tạo lại bằng Create ▸ Prefab Variant");
            n++;
        }
        return n;
    }

    // 4. Scene trong _Project/Scenes phải có trong Build Settings, trừ thư mục Sandbox/ (scene thử của từng người)
    static int CheckScenesInBuildSettings()
    {
        var inBuild = new HashSet<string>(EditorBuildSettings.scenes.Where(s => s.enabled).Select(s => s.path));
        int n = 0;
        foreach (var path in AllPaths("t:Scene", Root + "/Scenes"))
        {
            if (path.Contains("/Sandbox/") || inBuild.Contains(path)) continue;
            Report(path, "không có trong Build Settings — LoadScene theo tên lúc chạy sẽ báo 'Scene couldn't be loaded'");
            n++;
        }
        return n;
    }

    static IEnumerable<string> AllPaths(string filter, string folder)
    {
        if (!AssetDatabase.IsValidFolder(folder)) yield break;
        foreach (var guid in AssetDatabase.FindAssets(filter, new[] { folder }))
            yield return AssetDatabase.GUIDToAssetPath(guid);
    }

    static void Report(string path, string message) =>
        Debug.LogWarning($"[Validate] {path}: {message}", AssetDatabase.LoadMainAssetAtPath(path));
}
```

File `Assets/_Project/Gameplay/Game.Gameplay.asmdef` — tham chiếu ghi theo **tên** (bỏ tick "Use GUIDs") để diff Git đọc được:

```json
{
    "name": "Game.Gameplay",
    "rootNamespace": "Game.Gameplay",
    "references": [
        "Game.Core",
        "Unity.InputSystem",
        "Unity.Cinemachine"
    ],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false,
    "overrideReferences": false,
    "precompiledReferences": [],
    "autoReferenced": false,
    "defineConstraints": [],
    "versionDefines": [
        {
            "name": "com.demigiant.dotween",
            "expression": "",
            "define": "DOTWEEN"
        }
    ],
    "noEngineReferences": false
}
```

**Chạy thử**
- Tools ▸ Validate Project trên project sạch: Console một dòng `[Validate] Sạch — 0 vấn đề.` Quét project 5.000 asset mất dưới 1 giây.
- Kéo một texture ra thẳng `Assets/`: một warning `nằm ngoài Assets/_Project`; bấm dòng log, Project window ping đúng file. Kéo về `_Project/Features/Combat/Art/` → chạy lại hết.
- Import ảnh 4096×4096 vào `Features/Combat/Art/`, tab Default đặt Max Size 4096, không tick Android: một warning. Tick `Override for Android` + Max Size 2048 → chạy lại hết. Đây chính là texture đáng ra Preset phải bắt lúc import.
- Kéo prefab base `P_Enemy` vào `Prefabs/Variants/`: warning; xoá và tạo lại bằng Create ▸ Prefab Variant từ `P_Enemy` → hết. Tạo scene mới trong `Scenes/` chưa thêm Build Settings → warning; thêm vào → hết.
- Với asmdef: sửa một dòng trong `Features/Combat/Scripts/`, lưu — Console báo compile xong dưới 3 giây vì chỉ `Game.Features.Combat` build lại. Thêm `Game.UI` vào references của `Game.Gameplay` trong khi `Game.UI` đã tham chiếu `Game.Gameplay` → Apply là lỗi ngay `cyclic references detected`. Viết một script ngoài mọi asmdef có `using Game.Gameplay;` → `type or namespace not found`: đó là `Auto Referenced ☐` đang làm việc, không phải bug.
