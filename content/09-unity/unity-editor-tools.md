---
title: Editor Tools tự viết
icon: 🔧
summary: Một giờ viết tool tiết kiệm mười giờ của team; tool là thứ để designer không phải gọi lập trình viên — và là việc AI agent làm tốt nhất trong toàn bộ dự án Unity.
status: deep
read: 770
level: intermediate
order: 170
tags: [unity, editor, tooling, workflow]
related: [ai-workflow, data-driven-design, unity-project-structure, playtesting-metrics]
---

Luận điểm: **mỗi lần designer phải hỏi lập trình viên "số này ở đâu" hay "làm sao thử cái này" là một lỗi tooling.** Team 3 người mất 20 phút mỗi ngày cho những câu như vậy là 100 giờ một năm — đủ để viết mọi tool trong node này ba lần. Và đây là loại code AI agent viết tốt nhất: phạm vi hẹp, không cần cảm nhận gameplay, kiểm chứng ngay trong Editor. Dữ liệu tách khỏi code ([[data-driven-design]]) chỉ có ích khi có tool để nhìn, sửa và kiểm tra dữ liệu đó.

Quyết định quan trọng nhất: **viết tool ở tuần 2, không phải tuần 20.** Tool viết muộn phải tương thích với 200 asset đã lệch chuẩn; tool viết sớm ép chuẩn từ asset đầu.

## Tầng 0: attribute — miễn phí, làm ngay

Trước khi viết một dòng editor code, Inspector mặc định đã đi được 60% đường:

```csharp
[CreateAssetMenu(menuName = "Game/Enemy")]
public class EnemyData : ScriptableObject {
    [Header("Chiến đấu")]
    [Min(1)] public int hp = 30;
    [Range(0f, 20f), Tooltip("Đơn vị/giây. Player là 8.")] public float speed = 4f;
    [Min(0.05f)] public float attackCooldown = 0.8f;

    [Header("Hành vi")]
    [SerializeReference] public IEnemyBrain brain;      // đa hình trong Inspector — cần drawer hoặc Odin để chọn type

    [TextArea(2, 5)] public string designNote;

    [ContextMenu("Copy từ Player làm mốc")]              // chuột phải vào header component
    void CopyPlayerBaseline() { speed = 8f; hp = 100; }

    void OnValidate() {                                  // chạy mỗi lần chỉnh trong Inspector và khi load
        if (attackCooldown * speed > 20f)
            Debug.LogWarning($"{name}: nhanh và đánh liên tục — kiểm tra lại", this);
    }
}
```

`[Min]`, `[Range]` chặn giá trị vô lý trước khi vào game; `[Tooltip]` là tài liệu duy nhất designer đọc; `OnValidate` là validator rẻ nhất — truyền `this` vào `Debug.LogWarning` để bấm log là nhảy tới asset. `OnValidate` không được gọi `AssetDatabase` hay sửa asset khác — nó chạy cả lúc load domain, làm việc nặng ở đó là Editor treo khi mở project.

## Tầng 1: Odin, NaughtyAttributes, hay tự viết

| | NaughtyAttributes (MIT) | Odin Inspector (~$55/seat) | Tự viết PropertyDrawer |
|---|---|---|---|
| `[Button]`, `[ShowIf]`, `[ReorderableList]`, `[Expandable]` | Có | Có, nhiều hơn | Tự viết từng cái |
| Serialize Dictionary, đa hình, nested SO inline | Không | **Có** (Odin Serializer) | Không thực tế |
| Ảnh hưởng build | Không | Không nếu chỉ dùng attribute; Odin Serializer thì có | Không |
| Khi team lớn / nhiều SO phức tạp | Đủ đến ~50 loại SO | Đáng tiền từ ngày 1 | — |
| AI agent sinh code | Rất tốt, API nhỏ | Tốt, API rộng dễ dùng sai version | Tốt cho drawer ≤ 50 dòng |

Khuyến nghị: **NaughtyAttributes cho dự án indie**, Odin khi có ≥ 2 designer làm dữ liệu cả ngày. PropertyDrawer tự viết chỉ cho thứ hai package không có (chọn id từ bảng, preview curve theo level).

## Tầng 2: custom Editor bằng UI Toolkit

Unity 6 khuyến nghị UI Toolkit cho Editor; IMGUI vẫn chạy và đôi khi ngắn hơn cho một nút. Mẫu chuẩn — Inspector mặc định + một nút:

```csharp
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.UIElements;
using UnityEngine.UIElements;

[CustomEditor(typeof(EnemyData))]
public class EnemyDataEditor : Editor {
    public override VisualElement CreateInspectorGUI() {
        var root = new VisualElement();
        InspectorElement.FillDefaultInspector(root, serializedObject, this);   // giữ mọi field mặc định

        var status = new HelpBox("", HelpBoxMessageType.None);
        var validate = new Button(() => {
            var data = (EnemyData)target;
            if (data.Validate(out var errors)) { status.text = "OK"; status.messageType = HelpBoxMessageType.Info; }
            else { status.text = string.Join("\n", errors); status.messageType = HelpBoxMessageType.Error; }
        }) { text = "Validate" };

        root.Add(validate);
        root.Add(status);
        return root;
    }
}
#endif
```

Editor script đặt trong thư mục `Editor/` hoặc asmdef `Editor-only` ([[unity-project-structure]]) — không thì build lỗi vì `UnityEditor` không tồn tại trong player. `#if UNITY_EDITOR` là lưới an toàn thứ hai, không thay được thư mục.

`Validate(out List<string>)` nằm trên data class, không trong Editor — cùng hàm đó chạy ở build step và ở test.

## Gizmo và Handles: nhìn thấy dữ liệu

Tầm đánh, bán kính nhận biết, đường tuần tra, spawn point — designer chỉnh số mà không thấy hình là chỉnh mù:

```csharp
public class EnemySpawner : MonoBehaviour {
    [SerializeField] EnemyData data;
    [SerializeField] Transform[] patrolPoints;

    void OnDrawGizmosSelected() {                        // CHỈ khi chọn — không phải OnDrawGizmos
        if (data == null) return;
        Gizmos.color = new Color(1f, 0.3f, 0.3f, 0.6f);
        Gizmos.DrawWireSphere(transform.position, data.attackRange);
        Gizmos.color = Color.yellow;
        for (int i = 0; i < patrolPoints.Length; i++) {
            if (!patrolPoints[i]) continue;
            var next = patrolPoints[(i + 1) % patrolPoints.Length];
            if (next) Gizmos.DrawLine(patrolPoints[i].position, next.position);
#if UNITY_EDITOR
            UnityEditor.Handles.Label(patrolPoints[i].position + Vector3.up * 0.5f, $"P{i}");
#endif
        }
    }
}
```

`OnDrawGizmos` (không `Selected`) chạy cho **mọi** instance mỗi lần Scene view vẽ lại — 3000 object có gizmo là Scene view 8 FPS và người ta tưởng máy chậm. Dùng `OnDrawGizmosSelected`, hoặc `[DrawGizmo(GizmoType.NonSelected)]` static trong Editor script với cờ bật/tắt trong `EditorPrefs`. `Handles` (thuộc `UnityEditor`) cho label, disc, và **handle kéo được** (`Handles.PositionHandle`) — designer kéo điểm tuần tra trực tiếp trong Scene thay vì gõ toạ độ.

## EditorWindow cho công cụ level

Paint prefab, snap grid, đặt hàng loạt: `EditorWindow` + `SceneView.duringSceneGui`. Khung tối thiểu:

```csharp
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

public class PrefabPainter : EditorWindow {
    GameObject prefab; float grid = 1f; bool painting;

    [MenuItem("Tools/Level/Prefab Painter")]
    static void Open() => GetWindow<PrefabPainter>("Painter");

    void OnEnable()  => SceneView.duringSceneGui += OnScene;
    void OnDisable() => SceneView.duringSceneGui -= OnScene;

    void OnGUI() {
        prefab = (GameObject)EditorGUILayout.ObjectField("Prefab", prefab, typeof(GameObject), false);
        grid = EditorGUILayout.FloatField("Grid", grid);
        painting = GUILayout.Toggle(painting, painting ? "Đang paint (Esc để dừng)" : "Bắt đầu paint", "Button");
    }

    void OnScene(SceneView sv) {
        if (!painting || prefab == null) return;
        var e = Event.current;
        HandleUtility.AddDefaultControl(GUIUtility.GetControlID(FocusType.Passive)); // chặn chọn object khi click
        if (e.type == EventType.KeyDown && e.keyCode == KeyCode.Escape) { painting = false; Repaint(); return; }
        if (e.type != EventType.MouseDown || e.button != 0) return;

        var ray = HandleUtility.GUIPointToWorldRay(e.mousePosition);
        if (!Physics.Raycast(ray, out var hit, 500f)) return;
        var p = hit.point;
        p.x = Mathf.Round(p.x / grid) * grid; p.z = Mathf.Round(p.z / grid) * grid;

        var go = (GameObject)PrefabUtility.InstantiatePrefab(prefab);       // giữ liên kết prefab, không Instantiate
        go.transform.position = p;
        Undo.RegisterCreatedObjectUndo(go, "Paint prefab");                 // Ctrl+Z hoạt động — bắt buộc
        e.Use();
    }
}
#endif
```

Hai thứ mọi tool Scene phải có: **`Undo`** (tool không undo được là tool designer sợ dùng) và **`PrefabUtility.InstantiatePrefab`** thay `Instantiate` để object trong scene vẫn là prefab instance. Trạng thái tool (prefab đang chọn, grid) lưu vào `EditorPrefs` (qua các phiên) hoặc `SessionState` (chỉ trong phiên Editor, mất khi tắt) — field của EditorWindow reset khi domain reload.

## Sinh asset hàng loạt

Menu item + `AssetDatabase`, và **luôn** bọc trong `StartAssetEditing`:

```csharp
[MenuItem("Tools/Data/Sinh 20 biến thể Enemy")]
static void GenerateVariants() {
    var basePath = "Assets/Data/Enemies";
    AssetDatabase.StartAssetEditing();                   // gom import — không có là 20 lần refresh, 20 lần chậm
    try {
        for (int i = 1; i <= 20; i++) {
            var so = ScriptableObject.CreateInstance<EnemyData>();
            so.hp = 30 + i * 5; so.speed = 4f + i * 0.1f;
            AssetDatabase.CreateAsset(so, $"{basePath}/Enemy_T{i:00}.asset");
        }
    } finally {
        AssetDatabase.StopAssetEditing();                // finally: exception giữa chừng mà không Stop là Editor kẹt
    }
    AssetDatabase.SaveAssets();
}
```

Import CSV → ScriptableObject ở [[data-driven-design]] dùng đúng khung này. `ScriptableWizard` là lựa chọn cũ có sẵn form nhập; EditorWindow linh hoạt hơn và cùng công.

## AssetPostprocessor: import settings là code

Texture 2048 chưa nén, audio `Decompress On Load` 3 phút — mỗi cái tốn hơn mọi tối ưu thuật toán. Ép theo thư mục, tự động, không cần ai nhớ:

```csharp
#if UNITY_EDITOR
using UnityEditor;

class ImportRules : AssetPostprocessor {
    void OnPreprocessTexture() {
        var imp = (TextureImporter)assetImporter;
        if (assetPath.StartsWith("Assets/Art/UI/")) {
            imp.textureType = TextureImporterType.Sprite;
            imp.mipmapEnabled = false;                    // UI không cần mip
            imp.maxTextureSize = 1024;
        }
        var android = imp.GetPlatformTextureSettings("Android");
        android.overridden = true;
        android.format = TextureImporterFormat.ASTC_6x6; // không để mặc định RGBA32 lọt vào build
        imp.SetPlatformTextureSettings(android);
    }

    void OnPreprocessAudio() {
        var imp = (AudioImporter)assetImporter;
        var s = imp.defaultSampleSettings;
        if (assetPath.StartsWith("Assets/Audio/Music/")) {
            s.loadType = AudioClipLoadType.Streaming;
            s.compressionFormat = AudioCompressionFormat.Vorbis; s.quality = 0.7f;
        } else if (assetPath.StartsWith("Assets/Audio/SFX/")) {
            s.loadType = AudioClipLoadType.DecompressOnLoad;
            s.compressionFormat = AudioCompressionFormat.ADPCM;
            imp.forceToMono = true;
        }
        imp.defaultSampleSettings = s;
    }
}
#endif
```

Postprocessor chỉ chạy **khi import** — asset đã có phải `Reimport` (chuột phải thư mục) một lần sau khi thêm rule. Cách không cần code: **Preset** + `Preset Manager` với filter theo đường dẫn (`glob:"Assets/Art/UI/**"`) — designer tự sửa được, nhưng không có logic điều kiện. Thêm một menu item `Tools/Validate/Import Settings` duyệt mọi asset và log cái lệch chuẩn, chạy trong CI trước build ([[unity-build-platform]]).

## Cheat console và debug overlay trong build

QA và designer cần god mode, spawn enemy, nhảy level, đổi tốc độ — **trong build trên máy thật**, không chỉ Editor. Bọc bằng `#if DEVELOPMENT_BUILD || UNITY_EDITOR` để bản release không có:

```csharp
#if DEVELOPMENT_BUILD || UNITY_EDITOR
public class CheatConsole : MonoBehaviour {
    readonly Dictionary<string, Action<string[]>> cmds = new();
    string input = ""; bool open;
    [SerializeField] EnemySpawner spawner; [SerializeField] PlayerHealth player;

    void Awake() {
        cmds["god"]   = _ => player.Invulnerable = !player.Invulnerable;
        cmds["spawn"] = a => spawner.SpawnById(a[0], int.Parse(a.Length > 1 ? a[1] : "1"));
        cmds["level"] = a => GameFlow.I.LoadLevel(int.Parse(a[0]));
        cmds["speed"] = a => Time.timeScale = float.Parse(a[0]);   // chỉ chỗ này được đụng timeScale ngoài TimeManager
    }

    void Update() {
        if (Keyboard.current.backquoteKey.wasPressedThisFrame) open = !open;      // Input System
        if (Touchscreen.current != null && Touchscreen.current.touches.Count(t => t.isInProgress) >= 3) open = true;
    }

    void OnGUI() {                                          // IMGUI đủ cho tool debug, không cần Canvas
        if (!open) return;
        GUI.SetNextControlName("cheat");
        input = GUI.TextField(new Rect(10, 10, 400, 30), input);
        GUI.FocusControl("cheat");
        if (Event.current.isKey && Event.current.keyCode == KeyCode.Return && input.Length > 0) {
            var parts = input.Split(' ');
            if (cmds.TryGetValue(parts[0], out var cmd)) cmd(parts[1..]); else Debug.LogWarning($"Không có lệnh {parts[0]}");
            input = "";
        }
    }
}
#endif
```

Cùng file, thêm **debug overlay** hiện state hiện tại của FSM nhân vật/enemy, giá trị input, số enemy sống — chữ trắng góc trên bằng `GUI.Label`. Với behavior tree hoặc utility AI, overlay hiện điểm của từng lựa chọn là cách duy nhất debug được "vì sao nó làm thế". Playtest có overlay bật cho biết thứ mà người chơi không nói ra ([[playtesting-metrics]]).

Log có cấu trúc và strip khỏi release:

```csharp
public static class Log {
    [System.Diagnostics.Conditional("UNITY_EDITOR"), System.Diagnostics.Conditional("DEVELOPMENT_BUILD")]
    public static void Dev(string tag, string msg, UnityEngine.Object ctx = null) => Debug.Log($"[{tag}] {msg}", ctx);
}
// Log.Dev("Combat", $"hit {target.name} dmg={dmg}");  -> cả lời gọi VÀ phép nối chuỗi biến mất ở release
```

`[Conditional]` xoá **cả lời gọi lẫn việc đánh giá tham số** — khác với `if (Debug.isDebugBuild)` vẫn tạo string. `Debug.Log` trong release còn tốn thêm vì stack trace: `Project Settings > Player > Stack Trace` đặt `None` cho `Log`, giữ `ScriptOnly` cho `Error`.

## Vòng lặp Editor nhanh hơn

**Enter Play Mode Options** (`Project Settings > Editor`): tắt `Reload Domain` giảm thời gian bấm Play từ 5–15 s xuống dưới 1 s ở dự án trung bình. Đổi lại: **static field không reset** giữa các lần Play — `static int score` giữ giá trị cũ, `static event` giữ subscriber của lần trước (gọi vào object đã destroy → `MissingReferenceException` khó hiểu). Sửa: mọi static có trạng thái được reset trong

```csharp
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
static void ResetStatics() { Instance = null; OnScoreChanged = null; }
```

Quy tắc team: bật tắt Domain Reload từ ngày 1 để lỗi static lộ sớm, không phải khi đã có 80 static.

`[InitializeOnLoad]` (static constructor chạy khi Editor load/recompile) và `[InitializeOnLoadMethod]` để đăng ký callback, kiểm tra settings project khi mở (ví dụ cảnh báo nếu `Color Space` không phải Linear). `EditorApplication.playModeStateChanged` để chạy validator trước khi vào Play.

## Test cho logic thuần

Unity Test Framework (package `com.unity.test-framework`) chạy `[Test]` NUnit trong Edit Mode cho code không đụng MonoBehaviour: công thức sát thương, drop table, state machine, parser save. Điều kiện: logic đó phải nằm trong class C# thuần trong asmdef riêng — đó cũng là lý do [[unity-project-structure]] khuyên tách `Gameplay.Core` khỏi `Gameplay.Unity`. Test cho MonoBehaviour (Play Mode test) chậm và giòn; giữ số lượng ít, chỉ cho luồng bootstrap.

```csharp
[Test]
public void CritMultiplier_ClampsAtCap() {
    var f = new DamageFormula(critCap: 3f);
    Assert.AreEqual(3f, f.Multiplier(critLevel: 99));
}
```

Validator asset (`Validate()` trên mọi SO) cũng chạy như test: một `[Test]` duyệt `AssetDatabase.FindAssets("t:EnemyData")` và fail khi bất kỳ asset nào trả lỗi. CI chạy `-runTests -testPlatform EditMode` là bước chặn dữ liệu hỏng trước build.

## AI agent viết editor tool

Đây là nhiệm vụ agent làm tốt hơn phần lớn việc khác ([[ai-workflow]]): phạm vi rõ, kiểm chứng tức thì, không cần chơi thử. Cách yêu cầu khác với code gameplay:
- Nêu **API Editor cụ thể** (UI Toolkit hay IMGUI, `SceneView.duringSceneGui` hay `Editor.OnSceneGUI`) — agent trộn API 2019 và Unity 6 nếu không nêu.
- Yêu cầu **Undo cho mọi thay đổi** và `SetDirty`/`SaveAssets` đúng chỗ.
- Cấm `AssetDatabase.Refresh()` trong vòng lặp và cấm `Resources.FindObjectsOfTypeAll` mỗi frame.
- Chỉ đường dẫn `Editor/` hoặc asmdef Editor, và `#if UNITY_EDITOR` cho code trong runtime assembly.
- Bảo agent **chạy tool trên asset thật** rồi báo cái gì đổi — agent có thể dùng `-executeMethod` từ dòng lệnh nếu môi trường cho phép.

Guardrail như [[agent-guardrails]]: agent được viết tool sinh/kiểm dữ liệu, không được tự đổi số cân bằng trong asset đã có.

## Bẫy lộ ra khi build

- Script trong runtime assembly `using UnityEditor;` không bọc `#if UNITY_EDITOR` → build fail ở phút cuối. Asmdef Editor-only là cách chặn cấu trúc.
- `CheatConsole` để ngoài `#if DEVELOPMENT_BUILD` "tạm thời" → người chơi bấm `~` là god mode. Kiểm tra bằng grep trước mỗi release.
- `OnValidate` gọi `AssetDatabase.SaveAssets` → mỗi lần gõ một chữ trong Inspector là lưu toàn project.
- `EditorPrefs` là **toàn máy**, chung cho mọi project — đặt key có tiền tố tên project, không thì tool của hai dự án ghi đè nhau.
- `[SerializeReference]` với IL2CPP `Managed Stripping Level = High` strip class không được tham chiếu tĩnh → deserialize ra `null` trên build. `[Preserve]` hoặc `link.xml`.

## Kiểm tra nhanh

- Bấm Play ở dự án hiện tại: < 2 s. Trên 5 s là chưa tắt Domain Reload hoặc có `[InitializeOnLoad]` nặng.
- Mở Scene lớn nhất, chọn không gì cả: Scene view ≥ 60 FPS. Thấp hơn là có `OnDrawGizmos` không `Selected` trên object đông.
- Chọn 10 asset ngẫu nhiên trong `Assets/Art/` và `Assets/Audio/`: import settings đúng bảng 10/10.
- Development Build trên máy thật: mở cheat console bằng 3 ngón, gõ `level 5` — nhảy được. Release build: không mở được.
- `Window > General > Test Runner` > Run All Edit Mode: xanh, dưới 30 s.

## 🤖 Prompt cho AI

AI viết editor tool trộn IMGUI với UI Toolkit, dùng `Instantiate` thay `PrefabUtility.InstantiatePrefab`, quên `Undo`, đặt `using UnityEditor` trong runtime assembly, và gọi `AssetDatabase.Refresh()` sau mỗi asset.

**Phải nêu rõ:**
- Phiên bản Unity và API Editor muốn dùng (UI Toolkit `CreateInspectorGUI` hay IMGUI `OnInspectorGUI`)
- Tool chạy trong Editor hay trong Development Build (quyết định `#if` và có được dùng `UnityEditor` không)
- Asmdef/thư mục Editor tool phải nằm
- Dữ liệu tool đọc/ghi: loại ScriptableObject, đường dẫn thư mục, có được sửa asset có sẵn không
- Yêu cầu Undo, SetDirty, StartAssetEditing
- Trạng thái tool lưu ở đâu (EditorPrefs với tiền tố / SessionState)

**Mẫu prompt**

```
Viết editor tool cho Unity 6000.0 LTS. Code đặt trong Assets/_Project/Editor/ (asmdef Project.Editor,
Editor-only). CẤM using UnityEditor ở assembly runtime.

Tool 1 — EnemyDataEditor: CustomEditor cho EnemyData bằng UI Toolkit (CreateInspectorGUI,
FillDefaultInspector), KHÔNG IMGUI. Thêm nút "Validate" gọi EnemyData.Validate(out errors) và hiện
kết quả trong HelpBox. Validate() nằm trên EnemyData, không trong Editor.

Tool 2 — Menu Tools/Data/Import Enemies CSV: đọc Assets/Data/Balance/enemies.csv, tạo hoặc cập nhật
Assets/Data/Enemies/<id>.asset. Bọc StartAssetEditing/StopAssetEditing trong try/finally,
EditorUtility.SetDirty mỗi asset, SaveAssets một lần cuối. CẤM Refresh() trong vòng lặp.
KHÔNG đổi field không có trong CSV.

Tool 3 — AssetPostprocessor ImportRules: Assets/Art/UI/** -> Sprite, no mipmap, max 1024;
Android override ASTC_6x6 cho mọi texture. Assets/Audio/SFX/** -> ADPCM, DecompressOnLoad, mono.

Tool 4 — Gizmo: EnemySpawner vẽ attackRange (wire sphere) và đường tuần tra chỉ trong OnDrawGizmosSelected.
CẤM OnDrawGizmos không Selected.

Mọi thay đổi scene qua Undo.RecordObject / RegisterCreatedObjectUndo. Trạng thái tool lưu
EditorPrefs với tiền tố "MyGame.". Sau khi viết, liệt kê mọi lời gọi AssetDatabase và giải thích vì sao ở đó.
```

**Bẫy thường gặp:** AI viết `OnValidate` hoặc custom Editor chỉnh field rồi **quên `EditorUtility.SetDirty(target)`** (hoặc dùng `serializedObject.ApplyModifiedProperties` sai chỗ) — giá trị hiện đúng trong Inspector, đúng trong Play Mode, rồi **biến mất khi mở lại project** vì asset chưa bao giờ được đánh dấu cần lưu. Kiểm tra bằng: chỉnh qua tool, đóng Unity, mở lại, xem asset.

## 💻 Code

Demo dựng hai tool viết ở tuần 2: `ImportRules` ép import settings theo thư mục (không ai còn phải nhớ ASTC hay ADPCM) kèm menu kiểm lệch chuẩn, và `DebugConsole` chạy trong Development Build trên máy thật (mở bằng `~` hoặc 3 ngón), biến mất hoàn toàn ở release.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 320" role="img" aria-label="Project view thư mục _Project với Art/UI, Audio/SFX, Audio/Music, Editor, Scripts; Inspector hiện Texture Importer bị ép, Audio Importer bị ép và DebugConsole">
  <rect x="10" y="10" width="200" height="300" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Project</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <text x="22" y="63" class="fig-label" font-size="12" font-weight="600">▾ Assets/_Project</text>
  <text x="30" y="81" class="fig-label" font-size="12">▾ Art/UI</text>
  <rect x="16" y="86" width="188" height="18" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="46" y="99" class="fig-label" font-size="12" font-weight="600">icon_sword.png</text>
  <text x="30" y="117" class="fig-label" font-size="12">▾ Audio/SFX</text>
  <text x="46" y="133" class="fig-muted" font-size="11">hit_01.wav</text>
  <text x="30" y="151" class="fig-label" font-size="12">▾ Audio/Music</text>
  <text x="46" y="167" class="fig-muted" font-size="11">bgm_loop.ogg  (Vorbis, Streaming)</text>
  <text x="30" y="185" class="fig-label" font-size="12">▾ Editor  (asmdef Editor-only)</text>
  <text x="46" y="201" class="fig-muted" font-size="11">ImportRules.cs</text>
  <text x="30" y="219" class="fig-label" font-size="12">▾ Scripts</text>
  <text x="46" y="235" class="fig-muted" font-size="11">DebugConsole.cs</text>
  <line x1="10" y1="248" x2="210" y2="248" class="fig-line"/>
  <text x="22" y="268" class="fig-label" font-size="12" font-weight="600">Hierarchy</text>
  <text x="22" y="286" class="fig-muted" font-size="11">_Debug  (DebugConsole)</text>
  <text x="22" y="302" class="fig-muted" font-size="11">chỉ tồn tại trong Development Build</text>
  <rect x="226" y="10" width="424" height="300" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Texture Importer  ·  icon_sword.png</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Texture Type</text><text x="440" y="82" class="fig-label" font-size="11">Sprite (2D and UI)</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Sprite Mode</text><text x="440" y="98" class="fig-label" font-size="11">Single</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Generate Mip Maps</text><text x="440" y="114" class="fig-label" font-size="11">☐</text>
  <text x="250" y="130" class="fig-muted" font-size="11">Max Size (Default)</text><text x="440" y="130" class="fig-label" font-size="11">2048</text>
  <text x="250" y="146" class="fig-muted" font-size="11">Android ▸ Override / Format</text><text x="440" y="146" class="fig-label" font-size="11">☑  /  ASTC 6x6</text>
  <text x="250" y="162" class="fig-muted" font-size="11">(sửa tay rồi Reimport → ImportRules ghi đè lại; đổi GetVersion → tự reimport cả thư mục)</text>
  <rect x="234" y="172" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="185" class="fig-label" font-size="12" font-weight="600">Audio Importer  ·  hit_01.wav</text>
  <text x="250" y="204" class="fig-muted" font-size="11">Force To Mono</text><text x="440" y="204" class="fig-label" font-size="11">☑</text>
  <text x="250" y="220" class="fig-muted" font-size="11">Load Type / Compression Format</text><text x="440" y="220" class="fig-label" font-size="11">Decompress On Load  /  ADPCM</text>
  <rect x="234" y="230" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="243" class="fig-label" font-size="12" font-weight="600">Debug Console (Script)  ·  _Debug</text>
  <text x="250" y="262" class="fig-muted" font-size="11">Toggle Key</text><text x="440" y="262" class="fig-label" font-size="11">Backquote</text>
  <text x="250" y="278" class="fig-muted" font-size="11">Max Lines</text><text x="440" y="278" class="fig-label" font-size="11">20</text>
  <text x="250" y="294" class="fig-muted" font-size="11">Touch Fingers</text><text x="440" y="294" class="fig-label" font-size="11">3</text>
</svg>
<figcaption>ImportRules.cs nằm trong thư mục Editor (asmdef Editor-only) — không cần #if. DebugConsole.cs nằm ở assembly runtime, bọc toàn bộ bằng #if DEVELOPMENT_BUILD || UNITY_EDITOR nên release build không có class này.</figcaption>
</figure>

**Script**

```csharp
// Editor/ImportRules.cs — Unity 6 (6000.x). Đặt trong Assets/_Project/Editor/ (asmdef Editor-only). Chạy khi import; asset cũ phải Reimport một lần.
using UnityEditor;
using UnityEngine;

public class ImportRules : AssetPostprocessor
{
    const string UiTextures = "Assets/_Project/Art/UI/";
    const string Sfx        = "Assets/_Project/Audio/SFX/";
    const string Music      = "Assets/_Project/Audio/Music/";

    // Tăng số này mỗi khi đổi rule → Unity tự reimport mọi asset đi qua postprocessor này, không cần Reimport tay
    public override uint GetVersion() => 3;

    void OnPreprocessTexture()
    {
        if (!assetPath.StartsWith(UiTextures)) return;
        var imp = (TextureImporter)assetImporter;
        imp.textureType = TextureImporterType.Sprite;
        imp.spriteImportMode = SpriteImportMode.Single;
        imp.mipmapEnabled = false;                    // UI không cần mip
        imp.maxTextureSize = 2048;
        imp.alphaIsTransparency = true;

        var android = imp.GetPlatformTextureSettings("Android");
        android.overridden = true;
        android.maxTextureSize = 2048;
        android.format = TextureImporterFormat.ASTC_6x6;   // không để RGBA32 mặc định lọt vào build
        imp.SetPlatformTextureSettings(android);

        var ios = imp.GetPlatformTextureSettings("iPhone");
        ios.overridden = true;
        ios.maxTextureSize = 2048;
        ios.format = TextureImporterFormat.ASTC_6x6;
        imp.SetPlatformTextureSettings(ios);
    }

    void OnPreprocessAudio()
    {
        bool isSfx = assetPath.StartsWith(Sfx);
        bool isMusic = assetPath.StartsWith(Music);
        if (!isSfx && !isMusic) return;

        var imp = (AudioImporter)assetImporter;
        var s = imp.defaultSampleSettings;
        if (isSfx)
        {
            imp.forceToMono = true;                   // spatializer trộn về mono trước khi pan — giữ stereo là tốn gấp đôi RAM cho thứ bị vứt
            imp.loadInBackground = false;
            s.loadType = AudioClipLoadType.DecompressOnLoad;
            s.compressionFormat = AudioCompressionFormat.ADPCM;
        }
        else
        {
            imp.forceToMono = false;
            imp.loadInBackground = true;
            s.loadType = AudioClipLoadType.Streaming; // nhạc không nạp vào RAM
            s.compressionFormat = AudioCompressionFormat.Vorbis;
            s.quality = 0.7f;
        }
        imp.defaultSampleSettings = s;
    }

    // Bước kiểm: duyệt asset đã có và log cái lệch chuẩn. Chạy tay hoặc từ CI: -executeMethod ImportRules.ValidateAll
    [MenuItem("Tools/Validate/Import Settings")]
    public static void ValidateAll()
    {
        int bad = 0;
        foreach (var guid in AssetDatabase.FindAssets("t:Texture2D", new[] { UiTextures.TrimEnd('/') }))
        {
            var path = AssetDatabase.GUIDToAssetPath(guid);
            if (AssetImporter.GetAtPath(path) is not TextureImporter t) continue;
            var android = t.GetPlatformTextureSettings("Android");
            if (t.textureType != TextureImporterType.Sprite || t.mipmapEnabled || t.maxTextureSize > 2048
                || !android.overridden || android.format != TextureImporterFormat.ASTC_6x6)
            {
                bad++;
                Debug.LogWarning($"Lệch chuẩn UI texture: {path}", AssetDatabase.LoadMainAssetAtPath(path));
            }
        }
        foreach (var guid in AssetDatabase.FindAssets("t:AudioClip", new[] { Sfx.TrimEnd('/') }))
        {
            var path = AssetDatabase.GUIDToAssetPath(guid);
            if (AssetImporter.GetAtPath(path) is not AudioImporter a) continue;
            var s = a.defaultSampleSettings;
            if (!a.forceToMono || s.loadType != AudioClipLoadType.DecompressOnLoad || s.compressionFormat != AudioCompressionFormat.ADPCM)
            {
                bad++;
                Debug.LogWarning($"Lệch chuẩn SFX: {path}", AssetDatabase.LoadMainAssetAtPath(path));
            }
        }
        Debug.Log(bad == 0 ? "Import settings: OK" : $"Import settings: {bad} asset lệch chuẩn — chọn thư mục ▸ Reimport");
    }
}
```

```csharp
// DebugConsole.cs — cheat console cho Development Build, vẽ bằng IMGUI để không phụ thuộc Canvas. Toàn bộ class biến mất ở release nhờ #if.
#if DEVELOPMENT_BUILD || UNITY_EDITOR
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.SceneManagement;

public class DebugConsole : MonoBehaviour
{
    [SerializeField] Key toggleKey = Key.Backquote;        // phím `~`
    [SerializeField, Range(5, 100)] int maxLines = 20;
    [SerializeField, Range(2, 5)] int touchFingers = 3;    // mobile: 3 ngón chạm cùng lúc để mở

    public static bool GodMode { get; private set; }       // gameplay đọc: if (DebugConsole.GodMode) return;

    readonly Dictionary<string, Action<string[]>> cmds = new(StringComparer.OrdinalIgnoreCase);
    readonly List<string> lines = new();
    string input = "";
    bool open;
    Vector2 scroll;

    void Awake()
    {
        cmds["help"]  = _ => Print(string.Join("  ", cmds.Keys));
        cmds["god"]   = _ => { GodMode = !GodMode; Print($"god = {GodMode}"); };
        cmds["spawn"] = a => Spawn(a.Length > 0 ? int.Parse(a[0]) : 1);
        cmds["time"]  = a =>
        {
            Time.timeScale = a.Length > 0 ? float.Parse(a[0], System.Globalization.CultureInfo.InvariantCulture) : 1f;
            Print($"timeScale = {Time.timeScale}");           // chỗ duy nhất được đụng timeScale ngoài TimeManager
        };
        cmds["level"] = a => { if (a.Length > 0) SceneManager.LoadScene(a[0]); else Print("level <tên scene>"); };
        cmds["clear"] = _ => lines.Clear();
        Print("DebugConsole sẵn sàng — gõ help");
    }

    void Update()
    {
        var kb = Keyboard.current;
        if (kb != null && kb[toggleKey].wasPressedThisFrame) open = !open;

        var ts = Touchscreen.current;
        if (ts != null && !open)
        {
            int active = 0;
            foreach (var t in ts.touches) if (t.isInProgress) active++;   // ReadOnlyArray: không alloc
            if (active >= touchFingers) open = true;
        }
    }

    void OnGUI()
    {
        if (!open) return;
        const float lineH = 20f;
        float w = Mathf.Min(Screen.width - 20f, 640f);
        var box = new Rect(10, 10, w, lineH * (maxLines + 2));
        GUI.Box(box, GUIContent.none);

        // Log — chỉ maxLines dòng cuối
        GUILayout.BeginArea(new Rect(box.x + 6, box.y + 6, box.width - 12, lineH * maxLines));
        scroll = GUILayout.BeginScrollView(scroll);
        for (int i = Mathf.Max(0, lines.Count - maxLines); i < lines.Count; i++) GUILayout.Label(lines[i]);
        GUILayout.EndScrollView();
        GUILayout.EndArea();

        // Enter chạy lệnh — kiểm trước khi vẽ TextField để TextField không nuốt sự kiện
        var e = Event.current;
        if (e.type == EventType.KeyDown && e.keyCode == KeyCode.Return && input.Length > 0)
        {
            Execute(input); input = ""; e.Use();
        }
        GUI.SetNextControlName("cheat");
        input = GUI.TextField(new Rect(box.x + 6, box.yMax - lineH - 6, box.width - 12, lineH), input);
        input = input.Replace("`", "");                        // phím mở console không lọt vào ô nhập
        GUI.FocusControl("cheat");
    }

    void Execute(string line)
    {
        Print("> " + line);
        var parts = line.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return;
        if (!cmds.TryGetValue(parts[0], out var cmd)) { Print($"Không có lệnh '{parts[0]}' — gõ help"); return; }
        try { cmd(parts[1..]); }
        catch (Exception ex) { Print($"Lỗi: {ex.Message}"); }  // int.Parse sai không được làm chết console
    }

    void Print(string s)
    {
        lines.Add(s);
        if (lines.Count > maxLines * 4) lines.RemoveAt(0);
        scroll.y = float.MaxValue;                             // luôn cuộn xuống dòng mới
    }

    void Spawn(int n)
    {
        // Demo: n cube trước camera. Dự án thật gọi EnemySpawner.SpawnById(id, n).
        var cam = Camera.main;
        for (int i = 0; i < n; i++)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = $"Spawned_{i}";
            go.transform.position = cam
                ? cam.transform.position + cam.transform.forward * 5f + UnityEngine.Random.insideUnitSphere * 2f
                : Vector3.zero;
        }
        Print($"spawn {n}");
    }
}
#endif
```

**Chạy thử**
- Kéo một PNG 4096×4096 vào `_Project/Art/UI/`: Inspector hiện ngay Sprite, Generate Mip Maps ☐, Max Size 2048, tab Android Override ☑ ASTC 6x6; preview cuối Inspector ghi 2048×2048 ASTC 6x6 ≈ 1.9 MB (RGBA32 cùng cỡ là 16 MB). Kéo cùng file vào `Art/Characters/`: giữ mặc định, chứng tỏ rule chỉ ăn theo đường dẫn.
- Sửa tay Max Size thành 4096 rồi Apply: Unity reimport và giá trị quay về 2048 — code thắng tay. Đổi `GetVersion()` từ 3 thành 4, chờ compile: mọi texture trong `Art/UI` và mọi clip trong `Audio/**` tự reimport, không cần chuột phải Reimport.
- Kéo một WAV stereo vào `Audio/SFX/`: Force To Mono ☑, Decompress On Load, ADPCM; cột Imported Size nhỏ hơn ~7 lần so với PCM stereo. Kéo OGG 3 phút vào `Audio/Music/`: Streaming + Vorbis 0.7, Memory Profiler cột AudioClip không tăng khi phát.
- Tools ▸ Validate ▸ Import Settings: Console `Import settings: OK`. Dùng Explorer chép một file vào `Art/UI` khi Unity đang mở nhưng tắt Auto Refresh: menu báo `1 asset lệch chuẩn`, bấm log nhảy đúng asset.
- Development Build trên điện thoại: 3 ngón chạm mở console; gõ `time 0.2` → slow-mo, `god` → `god = True`, `spawn 5` → 5 cube trước camera, `level Level_02` → nhảy scene (scene phải có trong Build Profiles), `spawn abc` → dòng `Lỗi:` thay vì crash. Release build: gõ `~` không có gì, và `DebugConsole` không xuất hiện trong Build Report.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`[SerializeField] private` khác `public` chỗ nào? Vì sao nên dùng cái đầu?**
  → Cả hai đều hiện trong Inspector, nhưng `public` còn mở field đó cho **mọi script khác** ghi vào. `[SerializeField] private` giữ được đóng gói: designer chỉnh trong Inspector, code bên ngoài không chạm được. Dùng `public` cho mọi field chỉ để hiện Inspector là cách biến mọi thứ thành trạng thái toàn cục.
- `Junior` **`OnValidate` chạy khi nào? Dùng nó để làm gì?**
  → Chạy **trong Editor** khi giá trị đổi hoặc script được biên dịch lại. Tốt để kiểm tra ràng buộc và cảnh báo sớm: `minDamage > maxDamage`, prefab thiếu collider. Không nên làm việc nặng hay gọi sang scene khác — và nhớ nó cũng chạy khi Unity load asset, nên code có side effect ở đây sinh ra những thay đổi git khó giải thích.
- `Junior` **Vì sao code Editor phải nằm trong thư mục `Editor/`?**
  → Vì `UnityEditor` **không tồn tại lúc runtime**: để ngoài thì build lỗi, và lỗi chỉ xuất hiện ở khâu build chứ không phải trong Editor. Thư mục `Editor/` (hoặc một asmdef khai platform Editor) là cách Unity tách phần code đó ra khỏi bản phát hành.
- `Mid` **Designer phải sửa 200 asset cùng một trường. Anh làm gì?**
  → Một `MenuItem` duyệt `AssetDatabase.FindAssets("t:EnemyData")`, sửa, rồi **`EditorUtility.SetDirty(obj)` + `AssetDatabase.SaveAssets()`**. Quên `SetDirty` là bẫy kinh điển: giá trị hiện đúng trong Inspector, đúng trong Play Mode, rồi biến mất khi mở lại project. Cách kiểm chứng duy nhất đáng tin: chạy tool → đóng Unity → mở lại → xem asset.
- `Mid` **Tắt Domain Reload để Play nhanh hơn — được gì, mất gì?**
  → Được: thời gian bấm Play từ 5–15 giây xuống dưới 1 giây, ở dự án trung bình là hàng chục phút mỗi ngày mỗi người. Mất: **`static` không reset** giữa các lần Play — `static int score` giữ giá trị cũ, `static event` giữ subscriber của lần trước và gọi vào object đã destroy. Muốn dùng thì mọi static có trạng thái phải reset trong `[RuntimeInitializeOnLoadMethod(SubsystemRegistration)]`.
- `Mid` **Hai tool nào nên làm sớm vì trả lãi ngay?**
  → **AssetPostprocessor** để import settings đúng tự động — import settings là code chứ không phải sở thích, và sửa sau khi đã có 500 asset thì rất đắt. Và **Gizmo/Handles** để nhìn thấy dữ liệu: tầm đánh, waypoint, vùng spawn vẽ thẳng trong Scene view. Nhìn thấy sai nhanh hơn đọc số sai rất nhiều.
- `Senior` **Anh đã viết editor tool nào tiết kiệm được bao nhiêu thời gian cho team?**
  → Trả lời phải có **con số và người dùng cụ thể**: việc gì, ai làm, trước mất bao lâu, sau mất bao lâu, dùng bao nhiêu lần một tuần. Ví dụ dễ đo nhất là **cheat console trong bản Development**: nhảy màn, cho vàng, bất tử, hiện FPS — nó rút ngắn vòng lặp QA hơn mọi thứ khác, và phải `#if DEVELOPMENT_BUILD` để tắt hoàn toàn ở Release.
- `Senior` **Khi nào không nên viết tool?**
  → Khi việc chỉ lặp vài lần. Khi tool sẽ cần bảo trì nhiều hơn việc nó thay thế. Và khi vấn đề thật ra là **dữ liệu thiết kế sai** — lúc đó tool chỉ làm việc sai trở nên nhanh hơn. Ước lượng thô của tôi: đáng viết khi *thời gian viết < thời gian tiết kiệm trong một tháng*.
- `Senior` **Làm Inspector dễ dùng thì leo tầng thế nào?**
  → **Tầng 0** là attribute có sẵn — `[SerializeField]`, `[Range]`, `[Header]`, `[Tooltip]`, `[ContextMenu]`: miễn phí và giải quyết khoảng 70% cảm giác "Inspector khó dùng". **Tầng 1** là thư viện attribute (NaughtyAttributes, Odin) cho `[Button]`, `[ShowIf]`. **Tầng 2** là custom Editor / EditorWindow, chỉ leo lên khi một việc lặp đủ nhiều để tính ra thời gian tiết kiệm.

**Khung trả lời 60 giây** — "Anh làm tool cho team thế nào?"

> Theo tầng, từ rẻ tới đắt. **Tầng 0** là attribute có sẵn: `[SerializeField]`, `[Range]`, `[Header]`, `[Tooltip]`, `[ContextMenu]` — miễn phí, làm ngay, và giải quyết 70% cảm giác "Inspector khó dùng". **Tầng 1** là thư viện attribute (NaughtyAttributes miễn phí, Odin nếu team có ngân sách và nhiều SO phức tạp) cho `[Button]`, `[ShowIf]`, list sắp xếp được. **Tầng 2** mới là custom Editor / EditorWindow, và tôi chỉ leo lên đó khi một việc lặp lại đủ nhiều để tính được thời gian tiết kiệm.
>
> Hai thứ tôi luôn làm sớm vì chúng trả lãi ngay: **AssetPostprocessor** để import settings đúng tự động (import settings là code, không phải sở thích), và **Gizmo/Handles** để nhìn thấy dữ liệu — tầm đánh, waypoint, vùng spawn vẽ thẳng trong Scene view. Nhìn thấy sai nhanh hơn đọc số sai rất nhiều.

**Họ sẽ đào tiếp**

- *"Sửa 200 asset?"* → Không sửa tay: một `MenuItem` duyệt `AssetDatabase.FindAssets("t:EnemyData")`, sửa, rồi **`EditorUtility.SetDirty(obj)` + `AssetDatabase.SaveAssets()`**. Quên `SetDirty` là bẫy kinh điển: giá trị hiện đúng trong Inspector, đúng trong Play Mode, rồi biến mất khi mở lại project vì asset chưa bao giờ được đánh dấu cần lưu. Cách kiểm chứng duy nhất đáng tin: chỉnh qua tool → đóng Unity → mở lại → xem asset.
- *"Tắt Domain Reload?"* → Thời gian bấm Play từ 5–15 giây xuống dưới 1 giây, ở dự án trung bình đó là hàng chục phút mỗi ngày cho mỗi người. Cái giá: **static không reset** giữa các lần Play — `static int score` giữ giá trị cũ, `static event` giữ subscriber của lần trước và gọi vào object đã destroy. Muốn dùng thì mọi static có trạng thái phải reset trong `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]`.
- *"`OnValidate`?"* → Chạy trong Editor khi giá trị đổi hoặc script recompile. Tốt để **kiểm tra ràng buộc và cảnh báo sớm** ("minDamage > maxDamage", "prefab thiếu collider"). Không nên làm việc nặng, không gọi tới scene khác, và nhớ nó cũng chạy khi Unity load asset — code có side effect ở đây sinh ra những thay đổi git khó giải thích.
- *"Cheat console trong build?"* → Một overlay debug bật bằng tổ hợp phím, có trong bản Development của QA: nhảy màn, cho vàng, bất tử, hiện FPS/bộ nhớ. Nó rút ngắn vòng lặp QA hơn mọi thứ khác, và phải có cách **tắt hoàn toàn** ở bản Release (`#if DEVELOPMENT_BUILD`).
- *"Khi nào không viết tool?"* → Khi việc chỉ lặp vài lần, khi tool sẽ cần bảo trì nhiều hơn việc nó thay thế, hoặc khi vấn đề thật ra là dữ liệu thiết kế sai. Tôi ước lượng thô: tool đáng viết khi *thời gian viết < thời gian tiết kiệm trong một tháng*.

**Cờ đỏ**

- Dùng `public` cho mọi field để hiện trong Inspector.
- Viết EditorWindow cho một việc làm ba lần.
- Code editor nằm ngoài thư mục `Editor/` hoặc ngoài asmdef Editor → **build lỗi** vì `UnityEditor` không tồn tại lúc runtime.
- Sửa asset bằng script mà không `SetDirty`/`SaveAssets`.
- Không kể được một ví dụ thật nào về tool đã làm — với vị trí mid trở lên, đây là câu hỏi đo mức độ quan tâm tới người dùng nội bộ.

**Số / ví dụ nên thuộc**

- Domain Reload: 5–15s → <1s, đổi lại static không reset.
- `EditorUtility.SetDirty` + `AssetDatabase.SaveAssets` — cặp không được quên.
- Code Editor phải nằm trong `Editor/` hoặc asmdef có platform Editor.
