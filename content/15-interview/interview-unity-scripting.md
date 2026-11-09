---
id: interview-unity-scripting
title: Unity scripting chuyên sâu
icon: 🧱
summary: Phần engine API dev Unity dùng hằng ngày nhưng hay bị hỏi sâu - vòng đời, serialization, ScriptableObject, prefab, coroutine, Time, scene, Job System, Editor scripting, Enter Play Mode Options.
status: deep
read: 1122
level: intermediate
order: 21
tags: [interview, unity, scripting, lifecycle, serialization]
related: [interview-unity-tech, unity-game-loop, unity-design-patterns, unity-save-data]
---

Node [[interview-unity-tech]] hỏi rộng (rendering, bộ nhớ, asset, build). Node này hỏi **hẹp mà sâu** ở phần người ta tưởng đã biết: API script hằng ngày. Senior 10 năm bị bắt bẻ đúng ở đây, vì câu "Awake khác Start" ai cũng thuộc, còn "Instantiate một prefab inactive thì Awake chạy lúc nào" thì ít người chắc. Nền tảng đọc thêm ở [[unity-game-loop]], [[unity-design-patterns]], [[unity-save-data]], [[unity-input]], [[unity-physics]], [[unity-dots-jobs]], [[unity-editor-tools]].

## 1. Vòng đời chi tiết

Thứ tự trong một script: `Awake` → `OnEnable` → `Start` → (lặp) `FixedUpdate` → `Update` → coroutine resume → `LateUpdate` → render → `OnDisable` → `OnDestroy`.

| Tình huống | Chuyện xảy ra |
|---|---|
| Script disabled nhưng GameObject active | `Awake` vẫn chạy; `OnEnable`, `Start`, `Update` thì không |
| GameObject inactive từ đầu (trong scene hay Instantiate) | `Awake`, `OnEnable`, `Start` đều chờ tới lần `SetActive(true)` đầu tiên |
| `Instantiate` prefab đang active | `Awake` và `OnEnable` chạy **ngay trong lời gọi** `Instantiate`; `Start` chạy trước `Update` đầu tiên của script đó |
| `SetActive(false)` rồi `true` | `OnDisable` rồi `OnEnable`; `Awake` và `Start` **không** chạy lại |
| `Destroy(obj)` | Object bị huỷ **cuối frame**, `OnDisable` rồi `OnDestroy`. `OnDestroy` chỉ chạy nếu `Awake` từng chạy |
| Đổi scene (Single) | Object trong scene cũ nhận `OnDisable` + `OnDestroy` (trừ `DontDestroyOnLoad`); scene mới `Awake` toàn bộ |

Thứ tự **giữa nhiều object** không đảm bảo: `Awake`/`OnEnable`/`Update` của hai script khác nhau chạy theo thứ tự không xác định. Hai công cụ ép thứ tự: `Edit > Project Settings > Script Execution Order` và thuộc tính `[DefaultExecutionOrder(-100)]` trên class (số nhỏ chạy trước). Cả hai chỉ ảnh hưởng thứ tự giữa **các script khác loại**, và là chỗ nên tránh lạm dụng - cách bền hơn là `Awake` tự khởi tạo mình, `Start` mới nối dây sang người khác.

Code chạy **trước khi có scene** dùng `[RuntimeInitializeOnLoadMethod]` trên hàm static, với `RuntimeInitializeLoadType`: `SubsystemRegistration` (sớm nhất, chỗ reset static khi tắt Domain Reload), `AfterAssembliesLoaded`, `BeforeSplashScreen`, `BeforeSceneLoad`, `AfterSceneLoad` (mặc định).

## 2. Serialization

Unity serialize một field khi thoả **tất cả**: là `public` hoặc có `[SerializeField]`; không `static`, `const`, `readonly`; kiểu được hỗ trợ (kiểu nguyên thuỷ, `string`, enum, struct/class có `[Serializable]`, `UnityEngine.Object`, mảng và `List<T>` của những thứ đó). **Không serialize**: `Dictionary`, `HashSet`, property (trừ `[field: SerializeField]` cho auto-property), field static, interface, delegate, kiểu generic ngoài `List<T>` và class generic cụ thể hoá có `[Serializable]`.

- `[NonSerialized]` loại field public khỏi serialization; `[HideInInspector]` **vẫn serialize** nhưng ẩn khỏi Inspector - hai thứ khác nhau.
- Class thường lồng nhau **không hỗ trợ null**: field null được serialize thành instance mặc định (khác `null` thật). Độ sâu lồng bị giới hạn (khoảng 10 tầng) và **không hỗ trợ đa hình** với field kiểu class cha.
- `[SerializeReference]` cho phép lưu đúng kiểu con (polymorphism), interface và null; đổi lại cần quản lý kiểu (đổi tên class hay namespace thì mất dữ liệu nếu không có `[MovedFrom]`), và Inspector mặc định không có menu chọn kiểu.
- `ISerializationCallbackReceiver` có `OnBeforeSerialize` / `OnAfterDeserialize`: chuyển `Dictionary` ↔ hai `List` để Inspector và file lưu được. Hai hàm này có thể chạy trên thread khác main, **không được gọi Unity API** trong đó.
- Giá trị Inspector **thắng** field initializer với object đã được serialize; field mới thêm vào class thì object cũ lấy giá trị initializer; sửa initializer sau đó **không** đổi object cũ. Nhầm lẫn này gây bug "đổi code mà game không đổi".
- `OnValidate` chạy trong Editor khi script load hoặc Inspector đổi giá trị (không chạy trên build). `Reset` chạy trong Editor khi thêm component hoặc bấm Reset.

## 3. ScriptableObject

`ScriptableObject` là asset chứa dữ liệu, không gắn GameObject: config (stat, bảng level), **event channel** (SO có `Raise()` để tách sender và receiver), **runtime set** (SO giữ danh sách object đang sống, đăng ký ở `OnEnable`, gỡ ở `OnDisable`). Giá trị: dữ liệu dùng chung một bản, designer sửa không cần code.

Bẫy lớn nhất: trong Editor, SO là asset thật nên **sửa nó ở Play Mode giữ nguyên sau khi Stop** (và lưu xuống đĩa khi save project); trên build, SO nạp từ gói build và chỉ sửa được trong bộ nhớ, thoát app là mất. Hệ quả: bug "chạy đúng ở lần Play thứ nhất, sai ở lần hai" trong Editor mà build sạch. Quy tắc: SO chứa dữ liệu **chỉ đọc**; state runtime ở field `[NonSerialized]` hoặc instance copy bằng `Instantiate(so)`. Tạo SO trong code bằng `ScriptableObject.CreateInstance<T>()`, không dùng `new`.

## 4. Prefab

- **Nested prefab**: prefab chứa prefab khác, mỗi cái vẫn là asset riêng. **Prefab Variant**: kế thừa prefab gốc và chỉ lưu phần override; sửa gốc thì mọi variant ăn theo trừ phần đã override.
- **Override** ghi trên instance: property đổi, component thêm/bớt, object con thêm/bớt. Xem và xử lý bằng `PrefabUtility.GetObjectOverrides`, `ApplyPrefabInstance`, `RevertPrefabInstance`.
- Trong tool Editor: `PrefabUtility.InstantiatePrefab(asset)` giữ liên kết prefab, còn `Object.Instantiate` thì **mất** liên kết. `PrefabUtility.LoadPrefabContents` / `SaveAsPrefabAsset` để sửa prefab bằng code.
- **Chi phí `Instantiate`**: sao chép toàn bộ cây object, gọi `Awake`/`OnEnable` của mọi component, cấp phát bộ nhớ; prefab nặng ném spike vài chục ms trên mobile. Cách xử lý: pooling, instantiate rải ra nhiều frame, hoặc `InstantiateAsync` (Unity 2022.3 trở lên) để chạy phần nặng ngoài main thread.
- Prefab vs scene object: scene object gắn cứng trong scene (nạp cùng scene), prefab là khuôn tái dùng và nạp bằng reference/Addressables; thứ lặp từ hai lần trở lên nên là prefab.

## 5. Coroutine, Awaitable và UniTask

Coroutine chạy **trên main thread**, không phải thread riêng; `yield` chỉ nhường quyền về cho Unity gọi lại sau.

| `yield return` | Tiếp tục khi nào |
|---|---|
| `null` | frame kế, sau `Update` (trước `LateUpdate`) |
| `new WaitForSeconds(t)` | sau `t` giây **theo `Time.timeScale`** |
| `WaitForSecondsRealtime(t)` | sau `t` giây thật, bỏ qua timeScale |
| `WaitForFixedUpdate` | sau bước physics kế |
| `WaitForEndOfFrame` | cuối frame, sau khi render xong camera (dùng chụp screenshot) |
| `WaitUntil(() => cond)` / `WaitWhile` | kiểm điều kiện mỗi frame, chạy sau `Update` |
| `StartCoroutine(Other())` | chờ coroutine kia xong |

Coroutine **chết khi GameObject bị inactive hoặc Destroy**, nhưng **không chết khi chỉ disable component** - hay bị nhớ ngược. Bật lại GameObject không chạy lại coroutine. Dừng: `StopCoroutine(handle)` (giữ `Coroutine` trả về, đừng truyền chuỗi tên) hoặc `StopAllCoroutines()`. Cache `new WaitForSeconds(0.5f)` thành field để khỏi cấp phát mỗi vòng.

Unity 2023.1 trở lên (Unity 6) có **`Awaitable`**: `await Awaitable.NextFrameAsync()`, `WaitForSecondsAsync`, `EndOfFrameAsync`, `BackgroundThreadAsync()` / `MainThreadAsync()`; kiểu này được pool nên rẻ hơn `Task`. Unity 2022.2 trở lên có `MonoBehaviour.destroyCancellationToken` để huỷ async khi object chết. **UniTask** (thư viện bên thứ ba) nhanh hơn, zero-alloc, có `PlayerLoopTiming`, `WhenAll`, và là lựa chọn thực tế nếu dự án cần cho đến khi Awaitable đủ dùng. Xem thêm [[interview-unity-tech]] mục 2.

## 6. Time

- `Time.deltaTime`: giây từ frame trước, **có nhân timeScale**. Trong `FixedUpdate` nó trả về `fixedDeltaTime` (mặc định 0,02 giây = 50Hz).
- `Time.unscaledDeltaTime`: không nhân timeScale, dùng cho UI/pause menu. `Time.realtimeSinceStartup`: giờ thật.
- `Time.timeScale = 0`: `deltaTime` = 0, **`FixedUpdate` không chạy** (vật lý đứng), `WaitForSeconds` không bao giờ xong, Animator ở chế độ Normal đứng; **`Update` vẫn chạy** mỗi frame và input vẫn đọc được. Animator đặt `Update Mode = Unscaled Time` mới chạy tiếp. `Time.maximumDeltaTime` (0,333 giây) chặn spiral of death của physics.

## 7. Tìm và tham chiếu

- `GameObject.Find`, `FindObjectOfType` quét **toàn scene**: O(n), chỉ chấp nhận ở khởi tạo. Unity 2023.1 trở lên (Unity 6) `FindObjectOfType` bị đánh dấu lỗi thời: dùng `FindFirstObjectByType<T>()` (có thứ tự xác định) hoặc `FindAnyObjectByType<T>()` (nhanh hơn, không bảo đảm thứ tự); số nhiều là `FindObjectsByType<T>(FindObjectsSortMode.None)`.
- `GetComponent` cache vào field ở `Awake`. `TryGetComponent(out T)` tránh cấp phát chuỗi thông báo lỗi trong Editor khi thiếu component.
- Tag: `CompareTag("Enemy")` thay cho `obj.tag == "Enemy"` vì `.tag` cấp phát chuỗi mới mỗi lần.
- `SendMessage`/`BroadcastMessage` gọi hàm theo **tên chuỗi qua reflection**: chậm, lỗi chính tả không báo lúc biên dịch, đổi tên hàm là gãy âm thầm. Dùng interface, C# event hoặc tham chiếu trực tiếp.

## 8. Scene

`SceneManager.LoadSceneAsync(name, mode)` trả `AsyncOperation`; `progress` chạy 0 → 0,9 rồi **dừng** nếu `allowSceneActivation = false`, đặt `true` mới kích hoạt (giá trị 0,9 là "đã nạp xong, chờ kích hoạt"). `LoadSceneMode.Additive` cộng thêm scene mà không dỡ scene cũ - dùng cho Bootstrap/UI/level tách rời; `SetActiveScene` chọn scene nhận object mới. `DontDestroyOnLoad(obj)` chỉ áp cho **GameObject gốc** (root), và gọi lại scene chứa nó sẽ sinh bản trùng nếu không tự chặn. Sự kiện: `SceneManager.sceneLoaded`, `sceneUnloaded`, `activeSceneChanged`.

## 9. Messaging và event

| | C# `event Action<T>` | `UnityEvent<T>` |
|---|---|---|
| Nối dây | Trong code | Trong Inspector + code |
| Serialize | Không | Có |
| Chi phí gọi | Nhẹ (delegate) | Nặng hơn vì qua lớp bọc, listener persistent gọi qua reflection |
| Rủi ro | Quên `-=` gây leak và gọi vào object chết | Listener Inspector bị mất khi đổi tên hàm |

Quy tắc: logic thuần code dùng C# event hoặc `Action`; chỗ designer cần nối (button, trigger) dùng `UnityEvent`. Luôn `+=` ở `OnEnable` và `-=` ở `OnDisable`.

## 10. Input System mới và Input Manager cũ

Input Manager cũ (`Input.GetKey`, `GetAxis`) đọc theo string và polling. Input System mới (package `com.unity.inputsystem`) dùng **Input Actions asset** (action map, binding, control scheme), có callback `started/performed/canceled`, rebinding, đa thiết bị, và class C# sinh sẵn để tránh string. Chọn ở `Project Settings > Player > Active Input Handling` (Old / New / Both). Chi tiết ở [[unity-input]].

## 11. Job System và Burst cơ bản

Job là struct implement `IJob`/`IJobParallelFor`; dữ liệu vào-ra qua `NativeArray<T>` (bộ nhớ unmanaged, **tự `Dispose`**). Job **không** được dùng kiểu managed, field static hay Unity API (trừ vài ngoại lệ như `IJobParallelForTransform`). **Safety system** (chỉ có trong Editor) ném lỗi khi hai job ghi cùng một container hoặc khi main thread đọc dữ liệu job chưa `Complete`. Đánh dấu `[ReadOnly]` để cho nhiều job cùng đọc. `[BurstCompile]` biên dịch struct sang mã native qua LLVM, cần dữ liệu blittable. Chi tiết [[unity-dots-jobs]].

```csharp
[BurstCompile]
struct MoveJob : IJobParallelFor
{
    public NativeArray<float3> pos;
    [ReadOnly] public NativeArray<float3> vel;
    public float dt;
    public void Execute(int i) => pos[i] += vel[i] * dt;
}
// var h = new MoveJob{...}.Schedule(n, 64); h.Complete();
```

## 12. Editor scripting

- `[ExecuteAlways]` (thay cho `[ExecuteInEditMode]` cũ) cho `Update`/`OnEnable` chạy cả trong Edit Mode - nhớ kiểm `Application.isPlaying`.
- `[CustomEditor(typeof(X))]` thay Inspector của một component; `PropertyDrawer` vẽ lại một **kiểu field** ở mọi nơi nó xuất hiện; `EditorWindow` là cửa sổ riêng; `AssetPostprocessor` (`OnPostprocessAllAssets`, `OnPreprocessTexture`) chạy khi import asset để ép setting đồng nhất.
- Sửa dữ liệu qua `SerializedObject` / `FindProperty` / `ApplyModifiedProperties` thì Undo và prefab override tự đúng. Sửa thẳng object thì phải `Undo.RecordObject` **trước** khi đổi và `EditorUtility.SetDirty` sau đó.
- Code Editor đặt trong thư mục `Editor/` hoặc asmdef chỉ build cho Editor; code lẫn trong runtime thì bọc `#if UNITY_EDITOR`, nếu không **build thất bại** vì không có `UnityEditor`.

## 13. Enter Play Mode Options

`Project Settings > Editor > Enter Play Mode Options`: tắt `Reload Domain` và/hoặc `Reload Scene` để vào Play gần như tức thì. Giá phải trả: **biến `static` và event static giữ nguyên giá trị** từ lần Play trước, vì domain không nạp lại. Cách chữa: reset trong hàm `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]` và gỡ đăng ký event static. Bug thường gặp: singleton "sống" qua lần Play, danh sách static phình, subscribe đôi.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho script Unity**

AI giỏi viết khung MonoBehaviour và giải thích API, nhưng hay trộn API của nhiều đời Unity. Việc giao được: sinh boilerplate (CustomEditor, PropertyDrawer, job), giải thích lỗi `NullReferenceException`, dựng câu hỏi ôn tập. Việc không giao: khẳng định **thứ tự gọi** của vòng đời hay hành vi serialization mà không kiểm. Quy trình: bảo nó nêu phiên bản Unity giả định, viết đoạn log chứng minh thứ tự (`Debug.Log` ở từng hàm), rồi tự chạy trong Editor.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Phiên bản Unity cụ thể (2021 LTS, 2022 LTS, Unity 6) vì `FindObjectOfType`, `Awaitable`, `linearVelocity` khác nhau theo bản.
- Có dùng Input System mới hay Input Manager cũ, có UniTask hay không, có tắt Domain Reload không.
- Chạy trên Editor, mobile build hay cả hai (IL2CPP stripping ảnh hưởng `[SerializeReference]` và reflection).
- Script nằm trong asmdef nào (code Editor cần asmdef platform Editor).

**Mẫu prompt**

```
Unity 6 (6000.x), URP, IL2CPP, Domain Reload TẮT.
Viết MonoBehaviour EnemySpawner: Instantiate prefab từ pool, đăng ký vào
một ScriptableObject runtime set ở OnEnable, gỡ ở OnDisable.
Ràng buộc: KHÔNG dùng FindObjectOfType, KHÔNG dùng SendMessage, KHÔNG để
static field không reset (dùng RuntimeInitializeOnLoadMethod
SubsystemRegistration), cache WaitForSeconds, dùng CompareTag.
Kèm bảng thứ tự gọi Awake/OnEnable/Start khi prefab được Instantiate lúc
GameObject active và lúc inactive. Chỉ nêu điều chắc chắn đúng ở Unity 6.
```

**Bẫy thường gặp:** AI dùng `FindObjectOfType` (đã lỗi thời từ Unity 2023.1) hoặc `rb.velocity` thay `linearVelocity` ở Unity 6; viết `Dictionary` có `[SerializeField]` và tin rằng Inspector hiện được; để SO giữ state runtime rồi báo "chạy tốt" vì chỉ thử trong Editor; quên `Undo.RecordObject` trong tool Editor; trộn code `UnityEditor` vào runtime không có `#if UNITY_EDITOR`.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`Awake`, `OnEnable`, `Start` chạy khi nào và mỗi cái chạy mấy lần?**
  → `Awake` chạy một lần khi script load, kể cả script đang disabled miễn GameObject active; `OnEnable` chạy mỗi lần bật; `Start` chạy một lần ngay trước `Update` đầu tiên của script đó. Vì vậy `Awake` để tự khởi tạo, `OnEnable` để đăng ký event, `Start` để nối sang object khác đã `Awake` xong. Tách vậy vì thứ tự giữa các object chỉ đảm bảo ở `Start`.
- `Junior` **`Update`, `FixedUpdate`, `LateUpdate` khác nhau chỗ nào?**
  → `Update` chạy mỗi frame, `FixedUpdate` chạy theo bước cố định 0,02 giây (có frame chạy 0 hay 2-3 lần), `LateUpdate` chạy sau mọi `Update`. Camera follow đặt ở `LateUpdate` vì nhân vật đã di chuyển xong, còn lực vật lý đặt ở `FixedUpdate` vì physics tích hợp theo bước cố định.
- `Mid` **Prefab đang active được `Instantiate`: `Awake`, `OnEnable`, `Start` chạy lúc nào?**
  → `Awake` và `OnEnable` chạy ngay trong lời gọi `Instantiate`, trước khi nó trả về; `Start` chạy ở frame đó trước `Update` đầu tiên. Nên gán field sau `Instantiate` (ví dụ `Init(data)`) thì `Awake` đã chạy mà dữ liệu chưa có, vì vậy phải viết `Init` độc lập với `Awake`.
- `Mid` **`Instantiate` một prefab inactive thì sao, và vì sao pool hay dùng cách này?**
  → `Awake`, `OnEnable`, `Start` đều không chạy cho tới lần `SetActive(true)` đầu tiên. Cách này cho phép đặt dữ liệu trước rồi mới kích hoạt, vì thế `Awake` đọc được giá trị đã gán và pool tạo trước hàng loạt mà không phát sinh logic.
- `Mid` **`SetActive(false)` rồi `true` thì hàm nào chạy lại?**
  → Chỉ `OnDisable` rồi `OnEnable`; `Awake` và `Start` không chạy lại, và coroutine đang chạy đã chết. Vì vậy reset state của object pool phải đặt ở `OnEnable` hoặc hàm `Spawn()` riêng, không đặt ở `Start`. Nhớ vậy vì hay có người đặt reset ở `Start` rồi thắc mắc không chạy.
- `Mid` **Hai script phụ thuộc nhau lúc khởi tạo, thứ tự `Awake` có đảm bảo không?**
  → Không đảm bảo giữa hai script khác loại. Cách bền là `Awake` chỉ tự khởi tạo mình, `Start` mới truy cập object khác, hoặc dùng `[DefaultExecutionOrder(-100)]` cho script nền; thứ tự khai báo trong Script Execution Order dễ vỡ vì ngầm định dễ bị quên khi team đổi code.
- `Senior` **`Script Execution Order` và `[DefaultExecutionOrder]` khác nhau thế nào, anh dùng khi nào?**
  → Cả hai quy định thứ tự giữa các loại script, số nhỏ chạy trước; thuộc tính nằm cạnh code nên review thấy, còn setting trong Project Settings thì ẩn và chỉ đè lên thuộc tính khi cùng script. Tôi chỉ dùng cho vài script hạ tầng (input, bootstrap) vì quá nhiều số âm dương là dấu hiệu thiết kế phụ thuộc sai.
- `Mid` **`[RuntimeInitializeOnLoadMethod]` dùng làm gì và `LoadType` nào chạy sớm nhất?**
  → Chạy hàm static trước hoặc sau khi scene đầu tiên nạp mà không cần object trong scene, ví dụ tạo service hoặc reset static. Sớm nhất là `SubsystemRegistration`, nên reset static khi tắt Domain Reload đặt ở đó, vì các loại sau có thể đã dùng tới static chưa reset.
- `Mid` **`OnDestroy` có luôn chạy không?**
  → Không: chỉ chạy nếu `Awake` từng chạy, nên object inactive từ đầu rồi bị huỷ sẽ không nhận `OnDestroy`. Vì vậy dọn dẹp tài nguyên đăng ký ở `OnEnable` phải đặt ở `OnDisable` (cặp đối xứng) thay vì chỉ trông vào `OnDestroy`.
- `Junior` **Khi nào Unity serialize một field?**
  → Khi field `public` hoặc có `[SerializeField]`, không `static`/`const`/`readonly`, và kiểu được hỗ trợ (nguyên thuỷ, enum, `[Serializable]` struct/class, `UnityEngine.Object`, mảng và `List<T>`). Ví dụ `private float speed` không hiện trong Inspector vì chưa có `[SerializeField]`.
- `Junior` **`[NonSerialized]` và `[HideInInspector]` khác nhau thế nào?**
  → `[NonSerialized]` loại hẳn field khỏi serialization nên giá trị không được lưu; `[HideInInspector]` chỉ ẩn khỏi Inspector nhưng giá trị **vẫn được lưu** trong scene/prefab. Vì thế field "ẩn mà vẫn thấy giá trị cũ khi mở lại scene" là `HideInInspector`, còn runtime state không muốn lưu phải `NonSerialized`. Phân biệt vì hai thuộc tính này hay bị đảo nghĩa.
- `Mid` **Vì sao `Dictionary` không hiện trong Inspector và cách xử lý?**
  → Serializer của Unity không hỗ trợ `Dictionary`. Cách xử lý là cho class implement `ISerializationCallbackReceiver`, chép sang hai `List` key và value ở `OnBeforeSerialize`, dựng lại ở `OnAfterDeserialize`; vì hai callback có thể chạy ngoài main thread nên không được gọi Unity API trong đó.
- `Mid` **Property `public int Hp { get; set; }` có hiện trong Inspector không?**
  → Không, vì Unity chỉ serialize field, không serialize property. Muốn lưu auto-property dùng `[field: SerializeField] public int Hp { get; private set; }`, khi đó Unity serialize backing field của nó.
- `Senior` **`[SerializeReference]` giải quyết bài toán gì và đánh đổi ra sao?**
  → Cho phép lưu field kiểu cha/interface với kiểu con thật và cho phép null, ví dụ danh sách `ICondition` trong data quest. Đổi lại đổi tên class hay namespace làm mất dữ liệu (cần `[MovedFrom]`), Inspector mặc định không có chọn kiểu, và IL2CPP stripping mức cao có thể xoá class chỉ xuất hiện trong dữ liệu, vì không có tham chiếu code nào tới nó.
- `Mid` **Class lồng `[Serializable]` để null được không?**
  → Không: field null của class thường được serialize thành instance mặc định, nên lúc nạp lại không còn là `null`. Kiểm `== null` trên nó luôn sai; muốn null thật phải dùng `[SerializeReference]` hoặc cờ bool riêng, vì serializer luôn tạo object.
- `Mid` **Field có initializer `int hp = 100` và Inspector đang là 50, thì giá trị khi chạy là gì?**
  → 50: giá trị đã serialize thắng initializer. Initializer chỉ có tác dụng với object mới tạo hoặc field mới thêm sau khi asset đã được lưu, nên đổi `= 100` sang `= 200` không làm instance cũ thay đổi, một nguồn bug "sửa code mà không thấy gì". Cần nhớ vì giá trị lưu trong file luôn thắng code.
- `Junior` **`OnValidate` và `Reset` chạy khi nào?**
  → `OnValidate` chạy trong Editor khi script load hoặc khi sửa giá trị trong Inspector, dùng clamp giá trị (`hp = Mathf.Max(0, hp)`); `Reset` chạy khi thêm component hoặc bấm Reset, dùng gán giá trị mặc định thông minh như tự `GetComponent`. Cả hai không chạy trên build vì chúng nằm trong code Editor-only của vòng đời.
- `Junior` **ScriptableObject khác MonoBehaviour thế nào?**
  → ScriptableObject là asset dữ liệu không gắn GameObject, không có `Update`, nạp một bản dùng chung cho nhiều object. Ví dụ một `EnemyStats` SO dùng chung cho 200 enemy tiết kiệm bộ nhớ hơn 200 bản sao trong prefab, vì chỉ có một instance dữ liệu.
- `Mid` **Event channel bằng ScriptableObject hoạt động ra sao và rủi ro là gì?**
  → SO giữ một event; sender gọi `Raise()`, receiver đăng ký ở `OnEnable` và gỡ ở `OnDisable`, nên hai bên không biết nhau. Rủi ro là nếu delegate nằm ở field không `[NonSerialized]` hoặc không gỡ đăng ký thì listener cũ còn trong SO sang lần Play sau, vì SO sống lâu hơn scene.
- `Senior` **Vì sao sửa SO ở Play Mode, trong Editor thì giữ, trên build thì không?**
  → Trong Editor SO là asset thật trên đĩa nên thay đổi ở Play Mode không bị hoàn tác khi Stop (khác scene object), còn trên build asset nằm trong gói chỉ đọc và thay đổi mất khi thoát app. Hệ quả là test thấy "đúng" trong Editor mà build lỗi, nên SO chỉ chứa dữ liệu bất biến và state runtime để ở bản `Instantiate` hoặc `[NonSerialized]`. Nhớ vì đây là lý do bug chỉ xuất hiện trên build.
- `Mid` **Prefab Variant khác nested prefab thế nào?**
  → Nested prefab là prefab chứa prefab khác như một phần cấu trúc; Variant là prefab **kế thừa** prefab gốc và chỉ lưu phần override. Ví dụ `Goblin` gốc và `GoblinBoss` là Variant đổi mesh và máu, nên sửa AI ở `Goblin` ăn theo mọi variant trừ field đã override. Chọn Variant khi cần biến thể vì nó giữ liên kết kế thừa.
- `Mid` **Trong tool Editor, `PrefabUtility.InstantiatePrefab` khác `Object.Instantiate` thế nào?**
  → `InstantiatePrefab` tạo instance **giữ liên kết** với prefab asset nên còn theo dõi override và Apply/Revert; `Instantiate` tạo bản sao đứt liên kết. Tool sinh level nên dùng `InstantiatePrefab` vì designer sau đó sửa prefab gốc thì cả level được cập nhật.
- `Senior` **`Instantiate` gây spike 30ms trên máy yếu, anh xử lý thế nào?**
  → Đo trước xem phần nặng là `Awake`/`OnEnable` của component con hay là sao chép cây; sau đó dùng pool tạo sẵn lúc loading, rải `Instantiate` qua nhiều frame, hoặc `InstantiateAsync` (Unity 2022.3 trở lên) cho prefab lớn. Pool thắng vì chuyển chi phí khỏi gameplay, nhưng phải reset state đầy đủ ở `OnEnable`.
- `Junior` **Coroutine có chạy trên thread khác không?**
  → Không, chạy trên main thread: mỗi `yield` chỉ trả quyền điều khiển và Unity gọi tiếp ở thời điểm tương ứng. Vì vậy vòng lặp nặng trong coroutine vẫn làm giật frame, và muốn chạy ngoài main thread phải dùng job hoặc `Awaitable.BackgroundThreadAsync`. Vì thế việc nặng vẫn phải đo bằng Profiler. Đo bằng Profiler vì ở đây không có thread nào gánh hộ.
- `Junior` **Coroutine có chạy tiếp khi `SetActive(false)` rồi bật lại không?**
  → Không: coroutine bị dừng khi GameObject inactive và không tự chạy lại khi bật. Ví dụ hiệu ứng nhấp nháy bằng coroutine sẽ đứng sau khi pool trả object về, nên phải gọi `StartCoroutine` lại ở `OnEnable`. Đây là hành vi cần nhớ vì pool rất hay vấp.
- `Mid` **Disable component (`enabled = false`) có dừng coroutine của nó không?**
  → Không, chỉ `SetActive(false)` hoặc `Destroy` mới dừng; disable component chỉ tắt `Update` và các hàm tương tự. Đây là bẫy nhớ ngược phổ biến, nên muốn dừng thật phải gọi `StopCoroutine`. Cần nhớ vì lỗi này không báo gì, coroutine vẫn chạy ngầm.
- `Mid` **`yield return null`, `WaitForEndOfFrame`, `WaitForFixedUpdate` khác nhau thế nào?**
  → `null` tiếp tục ở frame kế sau `Update`; `WaitForFixedUpdate` sau bước physics kế tiếp; `WaitForEndOfFrame` cuối frame sau khi render xong, hay dùng để chụp màn hình bằng `ScreenCapture`. Chọn sai gây lệch một frame, ví dụ đọc `Rigidbody` ở `null` thay vì sau Fixed thì thấy vị trí chưa cập nhật.
- `Mid` **Vì sao nên cache `WaitForSeconds`?**
  → `new WaitForSeconds` là class nên mỗi lần `new` cấp phát heap (khoảng vài chục byte), vòng lặp 60 lần mỗi giây thành GC garbage. Cache vào field `static readonly` hoặc instance khi thời gian không đổi, vì nhờ đó Profiler hiện `GC.Alloc` bằng 0.
- `Senior` **Coroutine, `Awaitable` (Unity 6) và UniTask chọn thế nào?**
  → Coroutine đơn giản, gắn vòng đời GameObject, đủ cho hiệu ứng ngắn; `Awaitable` có sẵn trong Unity 2023.1 trở lên, được pool nên rẻ hơn `Task` và dùng được `destroyCancellationToken`; UniTask thêm `WhenAll`, `PlayerLoopTiming`, zero-alloc và dùng được từ Unity 2018. Dự án Unity 2022 trở xuống tôi chọn UniTask, Unity 6 mới nhỏ thì `Awaitable`, vì không thêm dependency khi chưa cần.
- `Mid` **`Time.timeScale = 0` ảnh hưởng gì và không ảnh hưởng gì?**
  → `deltaTime` về 0, `FixedUpdate` ngừng, `WaitForSeconds` không bao giờ xong, Animator ở chế độ Normal đứng; nhưng `Update` vẫn chạy mỗi frame, input vẫn đọc, và `unscaledDeltaTime` vẫn chạy. Vì vậy menu pause phải dùng `unscaledDeltaTime`, `WaitForSecondsRealtime` và Animator `Unscaled Time`. Cần phân biệt vì pause menu thường vỡ ở đúng chỗ này.
- `Junior` **`Time.deltaTime` trong `FixedUpdate` trả về gì?**
  → Trả về `Time.fixedDeltaTime` (mặc định 0,02 giây) chứ không phải thời gian frame, vì Unity đổi giá trị theo ngữ cảnh. Nên dùng `Time.deltaTime` cho cả hai hàm là an toàn, không cần phân nhánh.
- `Senior` **Game dùng `Time.deltaTime` trong `Update` để di chuyển nhưng frame spike 200ms, đạn xuyên tường. Anh sửa thế nào?**
  → Giới hạn bước bằng `Time.maximumDeltaTime` hoặc `Mathf.Min(dt, 0.05f)`, và đạn nhanh dùng raycast/spherecast quét quãng đường frame thay vì chỉ so vị trí. Cách này chặn xuyên vì quãng đi lớn bị cắt nhỏ, còn ở bước vật lý thì dùng `Continuous Dynamic` collision detection.
- `Mid` **Vì sao không nên gọi `FindObjectOfType` ở `Update`, và dùng gì thay ở Unity 6?**
  → Nó quét mọi object trong scene (O(n)) mỗi lần gọi nên tốn vài trăm micro giây tới ms ở scene lớn. Từ Unity 2023.1 nó lỗi thời, thay bằng `FindFirstObjectByType` (thứ tự xác định) hoặc `FindAnyObjectByType` (nhanh hơn); nhưng cách tốt vẫn là cache một lần hoặc inject, vì tìm kiếm mỗi frame luôn là mùi thiết kế.
- `Junior` **`TryGetComponent` có lợi gì so với `GetComponent`?**
  → Trả `bool` kèm `out` nên không cần kiểm null thủ công, và trong Editor nó không cấp phát chuỗi thông báo lỗi khi component thiếu, còn `GetComponent` có. Dù tốc độ chạy build gần như bằng nhau, nó gọn và không làm rác bộ nhớ Editor, nên dùng cho các lần kiểm có/không. Dùng nó vì code ngắn hơn và không rác Editor.
- `Junior` **Vì sao dùng `CompareTag` thay `obj.tag == "Enemy"`?**
  → `obj.tag` tạo chuỗi managed mới mỗi lần gọi (cấp phát GC), còn `CompareTag` so sánh nội bộ không cấp phát và còn báo lỗi nếu tag chưa khai báo. Ở `OnTriggerEnter` gọi hàng trăm lần mỗi giây, sự khác biệt thể hiện thành GC spike. Nên dùng `CompareTag` vì không tốn gì thêm.
- `Mid` **`SendMessage` có gì sai và thay bằng gì?**
  → Nó gọi hàm theo tên chuỗi qua reflection nên chậm hơn gọi trực tiếp, không báo lỗi lúc biên dịch khi gõ sai hoặc đổi tên, và chỉ ném cảnh báo lúc chạy. Thay bằng interface (`GetComponent<IDamageable>()`), C# event, hoặc tham chiếu trực tiếp, vì tất cả đều được trình biên dịch kiểm tra.
- `Mid` **`LoadSceneAsync` với `allowSceneActivation = false` thì `progress` dừng ở đâu?**
  → Dừng ở 0,9: scene đã nạp xong dữ liệu nhưng chưa kích hoạt, chờ bạn đặt `allowSceneActivation = true`. Vì vậy thanh loading phải chuẩn hoá `progress / 0.9f`, nếu không thanh không bao giờ đầy. Chuẩn hoá vì nếu không UI loading kẹt ở 90%.
- `Mid` **`LoadSceneMode.Additive` dùng khi nào và cần chú ý gì?**
  → Dùng để giữ Bootstrap/UI/Audio ở một scene riêng và nạp level cộng thêm, hoặc cho level streaming. Phải gọi `SceneManager.SetActiveScene` để object mới và lighting thuộc về scene đúng, và `UnloadSceneAsync` scene cũ, vì scene cộng dồn không tự dỡ.
- `Mid` **`DontDestroyOnLoad` có bẫy gì?**
  → Chỉ áp cho GameObject gốc; nếu nó là con của object khác thì cảnh báo và không có tác dụng. Quay lại scene chứa object đó sinh bản trùng (hai `GameManager`) nếu không chặn trong `Awake`, vì scene khởi tạo lại object mà bản cũ vẫn sống.
- `Mid` **`UnityEvent` hay C# `event`, chọn thế nào?**
  → C# `event` nhẹ, nối trong code, kiểm tra lúc biên dịch; `UnityEvent` serialize được để designer nối trong Inspector nhưng gọi qua lớp bọc nặng hơn và listener persistent dùng reflection. Logic nội bộ tôi dùng C# event, nút UI cho designer dùng `UnityEvent`, vì lợi ích Inspector chỉ có giá trị ở chỗ designer thực sự chỉnh.
- `Senior` **Quên `-=` một event gây hậu quả gì và cách phòng?**
  → Publisher giữ tham chiếu tới subscriber nên subscriber không được GC, và gọi vào object đã `Destroy` gây `MissingReferenceException` hoặc logic chạy hai lần. Luôn đối xứng `+=` ở `OnEnable` / `-=` ở `OnDisable`, và nhớ `?.Invoke()` không bắt được "null giả" của `UnityEngine.Object`, vì toán tử đó bỏ qua `==` của Unity.
- `Junior` **Input System mới khác Input Manager cũ ở đâu?**
  → Cũ đọc theo tên chuỗi bằng polling (`Input.GetAxis("Horizontal")`); mới dùng Input Actions asset với binding, control scheme, callback `started/performed/canceled`, rebinding và hỗ trợ nhiều thiết bị. Ưu điểm lớn là tách "hành động" khỏi "phím", nên một action "Jump" chạy được cho bàn phím, tay cầm và màn hình cảm ứng. Chuyển sang vì rebinding và đa thiết bị gần như bắt buộc ở mobile + tay cầm.
- `Mid` **Một job chạy trong `IJobParallelFor` chạy được những gì, không chạy được những gì?**
  → Chạy trên `NativeArray` và kiểu blittable, có thể đọc/ghi qua `Execute(int i)`; không được dùng kiểu managed (class, string), biến static, hay hầu hết Unity API. Lý do là job chạy trên worker thread, nên mọi thứ cần an toàn thread phải truyền qua native container. Cần nhớ vì lỗi vi phạm chỉ báo trong Editor.
- `Mid` **Safety system của Job System bắt lỗi gì, có chạy trên build không?**
  → Nó bắt hai job ghi cùng container, hoặc main thread đọc dữ liệu job chưa `Complete`, và ném lỗi rõ ràng trong Editor. Safety chỉ có trong Editor (kèm leak detection) nên build không tốn chi phí đó, vì vậy bug race condition chỉ lộ ra nếu bạn từng chạy Editor với safety bật.
- `Mid` **Quên `Dispose` một `NativeArray` thì sao?**
  → Rò rỉ bộ nhớ unmanaged mà GC không dọn; Editor báo cảnh báo `A Native Collection has not been disposed` còn build thì im lặng và RAM tăng dần. Dùng `Allocator.TempJob` cho job ngắn, `Persistent` kèm `Dispose` ở `OnDestroy`, hoặc `using` khi dùng cục bộ, vì allocator xác định ai chịu trách nhiệm dọn.
- `Mid` **Burst làm code nhanh bằng cách nào, nó có tự đa luồng không?**
  → Burst biên dịch C# (tập con) sang mã native tối ưu bằng LLVM, có SIMD, không GC; nó **không** tự đa luồng - đa luồng đến từ Job System. Vì vậy `IJobParallelFor` + `[BurstCompile]` mới cho tăng tốc kép, còn Burst một mình vẫn chạy trên một thread. Cần phân biệt vì nhiều người tưởng bật Burst là đủ.
- `Mid` **`[ExecuteAlways]` làm gì và bẫy ở đâu?**
  → Cho script chạy `Awake`/`OnEnable`/`Update` cả trong Edit Mode (thay `[ExecuteInEditMode]` cũ). Bẫy: logic game chạy lúc không Play làm sửa scene ngoài ý muốn, nên phải kiểm `Application.isPlaying`, vì Edit Mode không có vòng đời đầy đủ như Play Mode.
- `Mid` **`CustomEditor` và `PropertyDrawer` khác nhau thế nào?**
  → `CustomEditor` thay Inspector của **một component** (cả khung), còn `PropertyDrawer` thay cách vẽ **một kiểu field** ở mọi nơi nó xuất hiện. Ví dụ drawer cho struct `Range` dùng lại ở mọi script, vì thế rẻ hơn viết CustomEditor cho từng class.
- `Mid` **Vì sao dùng `SerializedObject` thay vì sửa trực tiếp field trong Editor script?**
  → `SerializedObject.FindProperty` + `ApplyModifiedProperties` tự xử lý Undo, đánh dấu dirty, multi-object edit và prefab override. Sửa thẳng field thì phải tự `Undo.RecordObject` và `EditorUtility.SetDirty`, nếu quên thì thay đổi mất khi đóng scene. Nên dùng vì Undo đúng ngay từ đầu.
- `Mid` **`AssetPostprocessor` dùng để làm gì?**
  → Chạy code khi asset được import, ví dụ `OnPreprocessTexture` ép format ASTC cho mọi texture trong thư mục `UI/`, `OnPostprocessAllAssets` để tự sinh data. Giá trị nằm ở chỗ ép quy ước ngay lúc import, nên không ai nhớ bấm tay, nhưng phải idempotent, vì import có thể chạy lại bất cứ lúc nào.
- `Junior` **Vì sao build thất bại khi script runtime có `using UnityEditor`?**
  → Vì `UnityEditor` không tồn tại trong player build. Giải pháp: bọc `#if UNITY_EDITOR ... #endif`, hoặc đặt code vào thư mục `Editor/` / asmdef chỉ Editor. Nên bọc từ đầu vì lỗi chỉ lộ khi build.
- `Senior` **Tắt Domain Reload để Play nhanh hơn thì được gì, mất gì?**
  → Vào Play gần như tức thì (từ vài giây còn dưới một giây trên dự án lớn), nhưng biến `static` và event static giữ giá trị từ lần Play trước vì domain không nạp lại. Chữa bằng hàm `[RuntimeInitializeOnLoadMethod(SubsystemRegistration)]` reset static và gỡ đăng ký event, vì không có bước reset đó thì bug chỉ lộ ở lần Play thứ hai.

**Khung trả lời 60 giây** — "Vòng đời MonoBehaviour diễn ra thế nào, anh đặt code khởi tạo ở đâu?"

> Với tôi vòng đời chia ba giai đoạn. Khi object active, `Awake` chạy một lần, rồi `OnEnable` mỗi lần bật, rồi `Start` một lần trước `Update` đầu tiên. Sau đó mỗi frame là `FixedUpdate` theo bước cố định 0,02 giây, `Update`, coroutine, `LateUpdate`, và cuối đời là `OnDisable` rồi `OnDestroy`. Thứ tự giữa hai script khác nhau không đảm bảo, nên tôi để `Awake` chỉ làm việc nội bộ như cache `GetComponent`, `OnEnable` đăng ký event và `OnDisable` gỡ đúng đối xứng, còn `Start` mới nối sang object khác vì lúc đó mọi `Awake` xong rồi. Với prefab, tôi nhớ `Instantiate` khi active chạy `Awake` và `OnEnable` ngay trong lời gọi, còn prefab inactive thì chờ `SetActive`, nên dữ liệu khởi tạo truyền qua hàm `Init` rõ ràng chứ không giả định `Awake` chạy sau. Cuối cùng, chỗ cần thứ tự cứng tôi dùng một Bootstrap scene hoặc `[DefaultExecutionOrder]` cho vài script hạ tầng, vì ép thứ tự rải rác trong dự án là mùi thiết kế.

**Họ sẽ đào tiếp**

- *"`Instantiate` prefab inactive rồi gán dữ liệu rồi mới `SetActive`, vì sao cách này an toàn?"* → `Awake` chưa chạy nên đọc được dữ liệu đã gán; nêu thứ tự và pool.
- *"Dictionary không hiện Inspector, anh làm gì?"* → `ISerializationCallbackReceiver`, hai List, callback không gọi Unity API.
- *"`[SerializeReference]` đổi tên class thì sao?"* → mất dữ liệu, `[MovedFrom]`, stripping IL2CPP.
- *"SO sửa trong Play Mode lưu hay không?"* → Editor giữ, build mất; lý do asset là file thật; `[NonSerialized]`.
- *"Coroutine dừng khi nào?"* → GameObject inactive/Destroy, không phải disable component; cách chạy lại.
- *"`timeScale = 0` thì `Update` còn chạy không?"* → còn, `FixedUpdate` ngừng, dùng unscaled cho menu.
- *"`FindObjectOfType` ở Unity 6 thì thế nào?"* → lỗi thời, `FindFirstObjectByType`/`FindAnyObjectByType`, lý do chọn.
- *"Event static + tắt Domain Reload gây bug gì?"* → listener cũ sống qua lần Play, reset ở SubsystemRegistration.
- *"Job chạy chậm hơn bản gốc, vì sao?"* → dữ liệu nhỏ, `Complete` ngay, overhead schedule, thiếu Burst.
- *"Tool Editor sửa asset mà đóng Unity thì mất, vì sao?"* → thiếu `SetDirty`/`SaveAssets`, nên dùng `SerializedObject`.

**Cờ đỏ**

- Nói "`Awake` luôn chạy trước `Start` của mọi object nên không cần lo thứ tự" mà không biết `OnEnable` và thứ tự giữa các script khác loại là không đảm bảo.
- Nói "`HideInInspector` thì không lưu" - sai, nó vẫn serialize.
- Nói "tắt component thì coroutine dừng" hoặc "bật lại GameObject thì coroutine chạy tiếp".
- Nói "coroutine chạy thread riêng nên không làm giật frame".
- Dùng `SendMessage`, `FindObjectOfType` hay `GameObject.Find` ở `Update` mà cho là "đơn giản nên được".
- Sửa SO làm state runtime rồi nói "trong Editor chạy tốt nên ổn".
- Nói `?.` kiểm null được `UnityEngine.Object` đã `Destroy`.
- Đặt `using UnityEditor` trong script runtime không bọc `#if UNITY_EDITOR`.
- Tắt Domain Reload "cho nhanh" mà không có kế hoạch reset static.
- Cho rằng Burst tự đa luồng, hoặc quên `Dispose` NativeArray vì "GC sẽ dọn".

**Số / ví dụ nên thuộc**

- `Fixed Timestep` mặc định 0,02 giây (50Hz); `Maximum Allowed Timestep` 0,333 giây.
- `LoadSceneAsync` với `allowSceneActivation = false`: `progress` dừng ở **0,9**.
- `Awake` → `OnEnable` → `Start`; `OnDisable` → `OnDestroy`; `Destroy` thực thi cuối frame.
- Serialize: `public` hoặc `[SerializeField]`, không static/const/readonly; độ sâu lồng khoảng 10 tầng.
- `Dictionary`, property, interface, static **không** serialize; `[field: SerializeField]` cho auto-property.
- `FindObjectOfType` lỗi thời từ **Unity 2023.1**; thay bằng `FindFirstObjectByType` / `FindAnyObjectByType` / `FindObjectsByType`.
- `Awaitable` từ Unity 2023.1 trở lên (Unity 6); `destroyCancellationToken` từ Unity 2022.2.
- `InstantiateAsync` từ Unity 2022.3 trở lên.
- `RuntimeInitializeLoadType`: `SubsystemRegistration` → `AfterAssembliesLoaded` → `BeforeSplashScreen` → `BeforeSceneLoad` → `AfterSceneLoad`.
- `Allocator`: `Temp` (một frame) · `TempJob` (tối đa 4 frame) · `Persistent` (tự dispose).
- `[DefaultExecutionOrder(-100)]`: số nhỏ chạy trước; Editor luôn cặp `Undo.RecordObject` + `EditorUtility.SetDirty`.
- `WaitForSeconds` theo timeScale, `WaitForSecondsRealtime` thì không; `CompareTag` không cấp phát, `.tag ==` có.
