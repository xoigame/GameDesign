---
title: Vòng đời game & Scene flow
icon: 🔁
summary: Bootstrap scene, state machine cấp ứng dụng, thứ tự Awake/Start, Time.timeScale và mọi thứ hỏng theo nó — xương sống mà mọi hệ thống khác móc vào.
status: deep
read: 610
level: basic
order: 10
tags: [unity, architecture, scene, lifecycle]
related: [core-loop, architecture-patterns, unity-design-patterns, unity-save-data]
---

Quyết định đầu tiên của dự án, trước cả nhân vật đầu tiên: **hệ thống sống ở đâu, và ai quyết định game đang ở trạng thái nào?** Dự án trả lời "ở scene Menu, trong GameManager" thì đến tháng thứ ba không Play được từ scene Level, không test được màn Result, và mỗi lần thêm màn hình là thêm một `if` vào GameManager.

Câu trả lời đã chứng minh: một **Bootstrap scene** chỉ chứa hệ thống, một **state machine cấp ứng dụng** nhỏ, và mọi scene gameplay được nạp **additive**. [[core-loop]] là vòng lặp của người chơi; node này là vòng lặp của chương trình bao quanh nó.

## Bootstrap scene: scene 0 không có gameplay

Scene đầu tiên trong Build Settings tên `Boot`, chứa đúng một GameObject `Systems` với các service (audio, save, input, UI root, scene loader) và **không có gì khác** — không camera gameplay, không nhân vật. Boot nạp `Menu` additive rồi đứng đó mãi.

Ba lợi ích không thấy ngay ở tuần 1:
- Hệ thống khởi tạo **một lần** theo thứ tự bạn kiểm soát, không phụ thuộc scene nào được mở.
- Chuyển scene không phá hệ thống — không cần `DontDestroyOnLoad` cho từng cái (Boot không bao giờ bị unload).
- Play từ bất kỳ scene nào trong Editor vẫn chạy, nhờ đoạn này:

```csharp
#if UNITY_EDITOR
public static class BootGuard {
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    static void EnsureBoot() {
        if (!SceneManager.GetSceneByName("Boot").isLoaded)
            SceneManager.LoadScene("Boot", LoadSceneMode.Additive);
    }
}
#endif
```

Hệ thống lúc này chỉ sẵn sàng từ frame thứ hai, nên gameplay script **không được đụng service trong `Awake`** — điều bạn vốn nên tuân theo dù có Boot hay không (xem mục thứ tự thực thi).

## State machine cấp ứng dụng

`Boot → Menu → Loading → Gameplay ⇄ Pause → Result`. Sáu trạng thái, một bảng chuyển hợp lệ, và **mọi thay đổi trạng thái đi qua một hàm**. Không phải để đẹp: để khi màn Result hiện giữa lúc đang Loading, bạn có một dòng log nói rõ ai gọi.

```csharp
using System; using System.Collections.Generic; using UnityEngine;

public enum GameState { Boot, Menu, Loading, Gameplay, Pause, Result }

public sealed class GameFlow : MonoBehaviour {
    public static GameFlow I { get; private set; }
    public GameState State { get; private set; } = GameState.Boot;
    public event Action<GameState, GameState> StateChanged;

    static readonly Dictionary<GameState, GameState[]> allowed = new() {
        [GameState.Boot]     = new[] { GameState.Menu },
        [GameState.Menu]     = new[] { GameState.Loading },
        [GameState.Loading]  = new[] { GameState.Gameplay, GameState.Menu },
        [GameState.Gameplay] = new[] { GameState.Pause, GameState.Result, GameState.Loading },
        [GameState.Pause]    = new[] { GameState.Gameplay, GameState.Loading },
        [GameState.Result]   = new[] { GameState.Loading, GameState.Menu },
    };

    void Awake() {
        if (I != null && I != this) { Destroy(gameObject); return; }   // chống trùng bản
        I = this;
    }

    public bool TrySet(GameState next) {
        if (Array.IndexOf(allowed[State], next) < 0) {
            Debug.LogError($"Chuyển trạng thái cấm: {State} → {next}", this);
            return false;
        }
        var prev = State;
        State = next;
        Time.timeScale = next == GameState.Pause ? 0f : 1f;   // nơi DUY NHẤT đụng timeScale
        StateChanged?.Invoke(prev, next);
        return true;
    }
}
```

Enum + bảng đủ cho cấp ứng dụng. FSM đầy đủ với class per-state (xem [[unity-design-patterns]]) dành cho gameplay, nơi trạng thái có logic riêng mỗi frame. Đừng nhét logic tính điểm, spawn, hay UI vào `GameFlow` — nó chỉ **phát sự kiện**, các hệ thống tự nghe. Đây chính là chỗ `GameManager` phình ra nếu bạn không kỷ luật.

## Thứ tự thực thi: Awake là của mình, Start là của người khác

Trong một scene, Unity gọi `Awake` của **mọi** object, rồi `OnEnable` của mọi object, rồi `Start` của mọi object, trước `Update` đầu tiên. Thứ tự **giữa các object trong cùng pha là không xác định** — nó trông ổn định trong Editor và đổi trên build hoặc sau khi bạn thêm một prefab.

Hệ quả thành luật:
- `Awake`: `GetComponent` trên **chính mình**, khởi tạo field. Không gọi sang object khác — object đó có thể chưa `Awake`.
- `OnEnable`: đăng ký event. Nhưng nếu đăng ký vào một singleton, singleton đó phải `Awake` trước — nghĩa là nó phải nằm ở Boot.
- `Start`: nói chuyện với người khác. Mọi thứ đã `Awake` xong.
- Object `Instantiate` lúc chạy: `Awake` và `OnEnable` chạy **ngay trong lệnh Instantiate**, `Start` chạy trước `Update` kế. Truyền dữ liệu cho object vừa spawn qua hàm `Init()` gọi sau `Instantiate`, đừng trông vào `Start` đọc field đã gán kịp.

Khi bắt buộc cần thứ tự, dùng attribute thay Project Settings để nó nằm trong code và trong Git:

```csharp
[DefaultExecutionOrder(-100)]          // chạy Awake/Update trước mọi script mặc định (0)
public sealed class InputReader : MonoBehaviour { … }
```

Số âm cho hệ thống đọc input và thời gian; số dương lớn cho camera (chạy sau mọi chuyển động). Không quá 5 script có số khác 0 — nhiều hơn là dấu hiệu bạn đang dùng thứ tự thực thi để che phụ thuộc ngầm.

## `Time.timeScale = 0` không dừng những gì bạn nghĩ

| Dừng theo timeScale | Không dừng |
|---|---|
| `Time.deltaTime` về 0; `FixedUpdate` không chạy | `Update`/`LateUpdate` **vẫn được gọi** mỗi frame |
| Animator (`Update Mode = Normal`) | Animator `Unscaled Time` — dùng cho UI menu pause |
| Particle System (`Simulation Speed` theo scaled) | `Time.unscaledDeltaTime`, `Time.realtimeSinceStartup` |
| `WaitForSeconds`, `Invoke`, `InvokeRepeating` | `WaitForSecondsRealtime`; `Awaitable.NextFrameAsync` |
| DOTween mặc định | DOTween `.SetUpdate(true)` |
| Physics, NavMeshAgent | **AudioSource** — nhạc vẫn chạy, `pitch` không đổi |

Hậu quả thực tế: menu pause dùng `WaitForSeconds(0.3f)` cho hiệu ứng mở → menu **không bao giờ mở**. Coroutine đếm cooldown bằng `WaitForSeconds` bị pause là đúng; tween của menu bằng `WaitForSeconds` là sai. Audio thì ngược lại: muốn nhạc tạm dừng phải gọi `AudioListener.pause = true` (hoặc chuyển snapshot mixer, xem [[unity-audio]]), timeScale không giúp gì.

Luật một dòng: **gameplay đo bằng `deltaTime`, UI và hệ thống đo bằng `unscaledDeltaTime`**. Slow-motion (`timeScale = 0.3`) đi qua đúng đường này miễn phí. Từ Unity 2022 không cần tự scale `fixedDeltaTime` theo `timeScale` nữa trừ khi vật lý trông giật khi quay chậm.

## Loading không khựng

`SceneManager.LoadScene` đồng bộ đóng băng frame 0.5–4 giây trên mobile. Thanh loading không nhích, người chơi tưởng treo. Dùng async và giữ scene ở 90% cho tới khi UI sẵn sàng:

```csharp
using UnityEngine; using UnityEngine.SceneManagement;

public sealed class SceneLoader : MonoBehaviour {
    public async Awaitable LoadLevelAsync(string sceneName, System.IProgress<float> progress = null) {
        if (!GameFlow.I.TrySet(GameState.Loading)) return;
        var previous = SceneManager.GetActiveScene();

        var op = SceneManager.LoadSceneAsync(sceneName, LoadSceneMode.Additive);
        op.allowSceneActivation = false;                 // giữ ở 0.9 — nạp xong nhưng chưa Awake
        while (op.progress < 0.9f) {
            progress?.Report(op.progress / 0.9f);
            await Awaitable.NextFrameAsync();
        }
        await Awaitable.WaitForSecondsAsync(0.25f);      // chống nhấp nháy khi nạp quá nhanh
        op.allowSceneActivation = true;                  // frame này sẽ nặng: Awake của cả scene
        await op;                                        // Unity 6: AsyncOperation await được trực tiếp

        SceneManager.SetActiveScene(SceneManager.GetSceneByName(sceneName));
        if (previous.name != "Boot") await SceneManager.UnloadSceneAsync(previous);
        GameFlow.I.TrySet(GameState.Gameplay);
    }
}
```

`Awaitable` có từ Unity 2023.1; bản 2022 dùng coroutine hoặc UniTask (`op.ToUniTask()`). UniTask là tuỳ chọn tốt nếu team đã quen, nhưng đừng thêm chỉ vì đoạn này. Khoảnh khắc `allowSceneActivation = true` **vẫn khựng** một frame vì toàn bộ `Awake` của scene mới chạy trong frame đó — scene có 2.000 object thì khựng 200ms; đó là lý do thanh loading nên đứng ở 100% thêm một nhịp thay vì hứa "sẵn sàng" sớm.

Hai bẫy đi kèm: `Awaitable.WaitForSecondsAsync` **theo scaled time** (dừng khi pause), và mọi `await` sống lâu hơn object gọi nó — truyền `destroyCancellationToken` nếu hàm có thể bị huỷ giữa đường.

## `DontDestroyOnLoad` và bản trùng

Có Boot scene thì gần như không cần `DontDestroyOnLoad`. Nếu vẫn dùng (prefab hệ thống tự spawn), ba tình huống tạo bản trùng: quay về Menu bằng `LoadScene("Boot")`, Play từ scene có sẵn một bản trong Editor, hoặc prefab bị kéo vào hai scene. Guard trong `Awake` (như `GameFlow` ở trên) là bắt buộc, và **nên `Destroy(gameObject)` bản mới, không phải bản cũ** — bản cũ đang có người đăng ký event.

## Thứ tự init hệ thống và chờ nhau

Hệ thống có phụ thuộc: input cần save (để nạp rebinding), UI cần input và audio (tiếng bấm nút). Viết thứ tự đó **thành một hàm tuần tự**, không rải qua `Awake` của từng service với `[DefaultExecutionOrder]`:

```csharp
public sealed class Bootstrapper : MonoBehaviour {
    [SerializeField] AudioService audio;
    [SerializeField] SaveService save;
    [SerializeField] InputService input;
    [SerializeField] UIRoot ui;

    async void Start() {                    // async void CHỈ ở điểm vào này; nơi khác trả Awaitable
        try {
            await audio.InitAsync();        // nhanh, nhưng phải xong trước tiếng bấm nút đầu tiên
            await save.LoadAsync();         // đọc file, có thể 50–300ms trên mobile
            await input.InitAsync(save.Data.bindings);
            await ui.InitAsync();
            GameFlow.I.TrySet(GameState.Menu);
        } catch (System.Exception e) {
            Debug.LogException(e);
            ui.ShowFatal("Không khởi động được. Thử cài lại.");   // đừng để màn đen im lặng
        }
    }
}
```

Mỗi service có `InitAsync` trả `Awaitable` và **không làm gì trong `Awake`** ngoài cache tham chiếu. Thêm service mới = thêm một dòng `await`, và thứ tự nằm ngay trước mắt. Save/load chi tiết ở [[unity-save-data]].

## Dọn dẹp khi rời scene

Object trong scene Level đăng ký `GameFlow.I.StateChanged += OnState` trong `Start`, rồi scene bị unload. Delegate vẫn giữ tham chiếu tới object đã destroy. Lần đổi trạng thái kế: `MissingReferenceException` — hoặc tệ hơn, handler chạy trên object "chết" và ghi vào field của nó mà không báo gì.

- Đăng ký trong `OnEnable`, gỡ trong `OnDisable`. **Không** cặp `Start`/`OnDestroy`: object bị disable rồi enable lại sẽ đăng ký hai lần.
- Không đăng ký bằng lambda — `-=` với lambda mới là no-op, không gỡ được.
- Static event và static field **sống qua scene**, và nếu tắt Domain Reload trong Enter Play Mode Options thì sống qua cả lần Play sau. Reset chúng bằng `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]`.
- Coroutine chạy trên object bị destroy tự dừng; `Awaitable`/`Task` thì **không** — kiểm tra `this == null` sau mỗi `await` hoặc dùng `destroyCancellationToken`.

## Mobile: pause là lúc phải lưu

Trên Android, `OnApplicationPause(true)` là **thời điểm đáng tin cuối cùng** trước khi hệ điều hành có thể giết tiến trình; `OnApplicationQuit` thường không được gọi. Trên iOS gần như không bao giờ được gọi. Vì vậy:

```csharp
void OnApplicationPause(bool paused) {
    if (paused) { SaveService.I.SaveNow(); AudioListener.pause = true; }   // đồng bộ, KHÔNG await — bạn không có thời gian
    else        { AudioListener.pause = false; ResumeTimers(); }
}
void OnApplicationFocus(bool focus) {
    if (!focus && GameFlow.I.State == GameState.Gameplay) GameFlow.I.TrySet(GameState.Pause);   // popup thông báo cũng mất focus
}
```

Thứ tự trên Android: `OnApplicationFocus(false)` → `OnApplicationPause(true)`. Focus mất khi có popup quyền, quảng cáo, thông báo hệ thống — chỉ nên pause gameplay ở đó, **không lưu** (lưu 5 lần trong 3 giây khi người dùng kéo notification). Khi resume, `Time.unscaledDeltaTime` của frame đầu **không bị kẹp** bởi `Maximum Delta Time` — bộ đếm dùng unscaled sẽ nhảy 20 phút; tính thời gian rời game bằng `DateTime.UtcNow` lưu lúc pause, đừng trông vào delta.

## Bẫy lộ ra khi build

- `Application.targetFrameRate` mặc định trên mobile là 30 (theo vSync). Editor chạy không giới hạn nên bạn không biết game mình 30 FPS cho tới khi cài lên máy. Đặt tường minh trong Boot.
- Nạp scene theo **index** rồi ai đó kéo lại thứ tự Build Settings → nạp sai scene, không có lỗi biên dịch. Nạp theo tên, hoặc giữ tên trong ScriptableObject.
- WebGL không có thread: `Task.Run`, `Task.Delay` không chạy hoặc treo. Dùng `Awaitable` và coroutine nếu WebGL là mục tiêu. Xem [[unity-build-platform]].
- Trong Editor, `Task` tiếp tục chạy sau khi thoát Play Mode và ghi vào asset. `Awaitable` được huỷ khi thoát Play — một lý do để chọn nó.
- Scene có Auto Generate Lighting bật sẽ bake lại mỗi lần mở → mở scene chậm và Git thay đổi liên tục. Tắt, bake tay.

## Kiểm tra nhanh
- Bấm Play từ **mỗi** scene trong project: không NullReference nào trong 2 giây đầu.
- Pause 30 giây rồi tiếp tục: cooldown, timer, nhạc đúng vị trí? Menu pause có mở được khi `timeScale = 0`?
- Menu → Level → Menu → Level 5 vòng: Hierarchy `DontDestroyOnLoad` không tăng object; Memory Profiler không tăng quá 10MB mỗi vòng.
- Nạp scene nặng nhất: thanh loading giữ trên 30 FPS, frame khựng duy nhất là lúc kích hoạt.
- Android: nhận thưởng → bấm Home ngay → kill từ Recent Apps → mở lại: thưởng còn không?

## 🤖 Prompt cho AI

AI viết một `GameManager` vừa giữ trạng thái vừa `LoadScene` đồng bộ, pause bằng `timeScale = 0` rồi dùng `WaitForSeconds` cho menu, và không có scene bootstrap — code chạy trong Editor từ scene Menu, hỏng khi Play từ Level.

**Phải nêu rõ:**
- Có Boot scene không, tên là gì, và hệ thống nào sống ở đó
- Danh sách trạng thái và bảng chuyển hợp lệ (cấm chuyển gì)
- Scene nạp additive hay single; unload scene cũ lúc nào
- Cái gì chạy theo `deltaTime` và cái gì theo `unscaledDeltaTime` khi pause
- Dùng coroutine, `Awaitable` (Unity 6) hay UniTask cho async
- Nền tảng: có mobile không (quyết định `OnApplicationPause` + autosave), có WebGL không (cấm `Task`)

**Mẫu prompt**

```
Viết GameFlow + SceneLoader cho Unity 6000.0 (URP), mobile Android/iOS, KHÔNG WebGL.

Cấu trúc: scene "Boot" (index 0) chứa GameObject "Systems" với GameFlow, SceneLoader,
AudioService, SaveService, InputService. Boot KHÔNG bị unload. Mọi scene khác nạp Additive.

GameFlow: enum Boot/Menu/Loading/Gameplay/Pause/Result, bảng chuyển hợp lệ dạng Dictionary,
TrySet() log lỗi và trả false khi chuyển cấm. CẤM chứa logic gameplay/UI; chỉ phát event StateChanged.
Time.timeScale chỉ được gán ở MỘT chỗ trong TrySet.

SceneLoader.LoadLevelAsync(string name): trả Awaitable (KHÔNG Task, KHÔNG coroutine),
allowSceneActivation = false tới 0.9, giữ tối thiểu 0.25s, báo progress 0–1 qua IProgress<float>,
unload scene cũ sau khi scene mới active. Nạp theo TÊN, KHÔNG theo index.

Bootstrapper.Start: async void duy nhất trong project, gọi tuần tự
audio.InitAsync → save.LoadAsync → input.InitAsync → ui.InitAsync, có try/catch hiện màn lỗi.
Mọi service: Awake chỉ cache tham chiếu, CẤM gọi service khác trong Awake.

Event: đăng ký OnEnable / gỡ OnDisable, CẤM lambda. OnApplicationPause(true) gọi SaveNow() đồng bộ.
Menu pause dùng Animator Unscaled Time và WaitForSecondsRealtime; CẤM WaitForSeconds trong UI.

Sau khi viết, liệt kê mọi chỗ đọc Time.deltaTime và nói vì sao chỗ đó không phải unscaled.
```

**Bẫy thường gặp:** AI đặt guard trùng bản là `if (Instance != null) Destroy(Instance.gameObject)` — huỷ **bản cũ** đang có mọi subscriber và tham chiếu, giữ bản mới rỗng. Trong Editor chỉ có một bản nên không lộ; trên build khi quay về Menu, mọi event chết lặng. Phải `Destroy(gameObject)` bản mới và `return` ngay để phần còn lại của `Awake` không chạy.
