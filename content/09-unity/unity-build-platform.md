---
title: Build & nền tảng
icon: 📦
summary: Build ra máy thật từ tuần đầu và build hàng đêm trên CI — vì IL2CPP, stripping, bộ nhớ và driver GPU là những lỗi chỉ tồn tại ngoài Editor, và chúng tích luỹ âm thầm.
status: deep
read: 750
level: advanced
order: 150
tags: [unity, build, mobile, platform]
related: [tech-stack, unity-optimization, unity-save-data, unity-project-structure]
---

Luận điểm duy nhất của node này: **bản build là sản phẩm, Editor chỉ là công cụ soạn thảo**. Một dự án build lần đầu ở tháng 4 sẽ phát hiện cùng lúc: reflection bị strip, texture 21MB, keystore chưa có, Gradle lỗi phiên bản, và app bị giết ở 1.5GB — mỗi thứ mất một ngày, cộng lại là một tuần không ai dự trù. Build ra máy thật **trong tuần đầu**, và để CI build **mỗi đêm** rồi báo khi hỏng. Việc chọn nền tảng nào và vì sao thuộc [[tech-stack]]; node này nói cái gì xảy ra sau khi đã chọn.

Unity 6 thay `File > Build Settings` bằng **Build Profiles**: mỗi profile có scene list, scripting define và override Player Settings riêng. Dùng nó — một profile `Android-Dev`, một `Android-Release`, một `iOS-Release` — thay vì đổi tay checkbox trước mỗi lần build và quên đổi lại.

## Mono vs IL2CPP và Managed Stripping

IL2CPP **bắt buộc** cho Android ARM64 (Google Play yêu cầu 64-bit từ 2019), iOS và WebGL. Mono chỉ còn cho PC và Android 32-bit — nghĩa là mọi game mobile đều ship IL2CPP, và nó khác Mono ở ba điểm gây lỗi thật:

1. **Build chậm hơn 3–5 lần** (C# → C++ → native). Lần đầu 15–40 phút. Cache incremental trong `Library/Il2cppBuildCache` — không xoá `Library` trên CI nếu muốn build đêm xong trước sáng. *IL2CPP Code Generation: Faster (smaller) builds* dùng generic sharing, nhanh build hơn ~30%, chậm chạy vài phần trăm — chọn cho bản Dev.
2. **Không có JIT** → không `dynamic`, không `Reflection.Emit`, và generic virtual method với kiểu struct lạ có thể ném `ExecutionEngineException: no AOT code was generated`. Thư viện .NET viết cho server thường vướng.
3. **Managed Stripping Level** (Player Settings) xoá code "không ai gọi" — nhưng code gọi **qua reflection** thì linker không thấy: JSON serializer tạo type bằng `Activator.CreateInstance`, Addressables, DI container, `Enum.Parse` trên type chỉ dùng trong JSON. Editor chạy bình thường, build ném `MissingMethodException` hoặc trả object rỗng.

Cách sống chung: mức **Low** cho bản Dev, **Medium** cho Release và sửa hết cảnh báo; **High** chỉ khi bạn hiểu từng dòng `link.xml`. Giữ type bằng:

```xml
<!-- Assets/link.xml — giữ nguyên assembly hoặc từng type -->
<linker>
  <assembly fullname="Newtonsoft.Json" preserve="all"/>
  <assembly fullname="Game.Runtime">
    <type fullname="Game.Save.*" preserve="all"/>      <!-- mọi DTO save, xem unity-save-data -->
  </assembly>
</linker>
```

hoặc `[UnityEngine.Scripting.Preserve]` trên class/constructor. Kiểm chứng duy nhất là **chạy bản Release trên máy thật và load một file save thật** — Editor không bao giờ lộ lỗi này. Cấu trúc dữ liệu save và migration xem [[unity-save-data]].

## Kích cỡ build

Đọc **Build Report** trước khi đoán: `Window > Analysis > Build Report Inspector` (package) hoặc phần *Build Report* trong `Editor.log` — liệt kê asset theo kích cỡ giảm dần. Kinh nghiệm ổn định qua nhiều dự án:

- **Texture chưa nén là 80% vấn đề.** Một PNG 2048 để mặc định vào Android là 21MB; nén ASTC còn 2.5MB (bảng ở [[unity-optimization]]). Sprite UI 4096 "cho nét" là dấu hiệu chưa ai mở Build Report.
- Audio: nhạc **Vorbis quality 70%**, *Streaming*; SFX ngắn Vorbis hoặc ADPCM. Một track WAV 3 phút là 30MB.
- *Strip Engine Code* bật (mặc định) bỏ module Unity không dùng — nhưng module chỉ dùng qua Addressables cũng bị bỏ; nếu build thiếu Cloth/Terrain lúc load remote, thêm vào `link.xml`.
- **Addressables** tách nội dung không cần ngay khỏi app: level 5–20, skin, voice ngôn ngữ phụ tải sau. App 80MB download nhanh hơn 400MB, và Play/App Store có ngưỡng download qua di động.
- Android: **Play Asset Delivery** (Build App Bundle `.aab`, asset pack *install-time* / *fast-follow* / *on-demand*). iOS: *App Thinning* tự chọn texture theo máy nếu bạn dùng variant ASTC/PVRTC đúng, và *On-Demand Resources* qua Addressables.

## Android

- **Min API** 23 là tối thiểu Unity 6 cho phép; thực dụng đặt **24–26** để bỏ máy quá cũ không chạy nổi Vulkan. **Target API** phải là mức Google Play đang yêu cầu (mới nhất trừ một năm — hiện 35), không thì không upload được; Unity tự tải SDK nếu bạn dùng bộ Android SDK/NDK/JDK **Unity cài kèm** — trộn với Android Studio là nguồn "Gradle build failed" phổ biến nhất.
- **ARM64 only** cho Release (ARMv7 thêm 40% kích cỡ cho máy ra trước 2015). x86-64 chỉ khi nhắm Chromebook.
- **Gradle template**: bật *Custom Main Gradle Template* / *Custom Gradle Properties* chỉ khi plugin bên thứ ba bắt buộc — mỗi lần nâng Unity là template cũ vênh phiên bản Gradle/AGP. Giữ file template trong Git và diff sau mỗi lần nâng.
- **Keystore mất là mất app**: không upload được bản mới cho listing cũ. Dùng *Play App Signing* (Google giữ khoá ký, bạn giữ upload key có thể reset), và backup keystore + password ở password manager team, không trong repo.
- Đọc log: `adb logcat -s Unity` (hoặc `adb logcat Unity:I *:S` lọc chặt hơn). Crash native hiện dưới tag `DEBUG`/`libunity`; `adb logcat -b crash` sau khi app chết.
- **Graphics APIs**: tắt *Auto Graphics API*, thứ tự **Vulkan, OpenGLES3** — Unity thử theo thứ tự. Vulkan nhanh hơn 10–30% trên Adreno/Mali mới nhưng driver của vài SoC 2017–2019 crash khi khởi tạo; giữ GLES3 làm phương án lùi và test trên đúng máy đó. Texture **ASTC** cho mọi target còn hỗ trợ.
- Bật *Create symbols.zip: Debugging* để upload cho crash reporting đọc được stack native.

## iOS

Unity không build `.ipa` — nó **sinh Xcode project**, Xcode mới build. Chọn *Append* để giữ chỉnh sửa trong project cũ (pod, capability), *Replace* khi Append gãy (thường sau nâng Unity). Signing: điền *Team ID* trong Player Settings và *Automatically Sign* — CI cần certificate + provisioning profile cài trên máy Mac build, không có đường tắt. *Bitcode* đã bị Xcode 14 bỏ, Unity 2022+ không sinh nữa; nếu Xcode kêu về bitcode là plugin cũ mang theo.

Bộ nhớ là kẻ giết người trên iOS: hệ thống **kill app khoảng 1.4–1.6GB trên máy 3GB** (iPhone 8/X/SE2), không báo lỗi, chỉ có "app biến mất". Xcode → Debug Navigator → Memory là nơi đọc số thật (Unity Profiler thiếu phần native của Metal). Kiểm tra trên **thiết bị yếu nhất còn hỗ trợ**, không phải iPhone mới của bạn; `Application.lowMemory` là cơ hội cuối để xoá cache.

## WebGL

WebGL là nền tảng **khác về mô hình**, không chỉ là target khác:
- **Không có thread**: `Task.Run`, `Thread` ném lỗi hoặc treo; Jobs chạy trên main thread; Burst không hỗ trợ. Code dùng `async/await` trên `UnityWebRequest`/`Awaitable` vẫn chạy vì nó không cần thread.
- `System.IO` ghi vào **hệ file ảo trong bộ nhớ** — mất khi tải lại trang. `PlayerPrefs` và `Application.persistentDataPath` được đồng bộ vào IndexedDB, nhưng phải chờ hệ thống sync; save quan trọng nên gửi lên server.
- Bộ nhớ heap wasm: *Initial Memory* 32MB, *Memory Growth Mode: Geometric* — vượt 2GB là hết (giới hạn 32-bit). Texture chưa nén ở đây là lỗi crash tab, không phải lag.
- **Compression Brotli** nhỏ hơn Gzip ~20% nhưng server phải trả `Content-Encoding: br` và `Content-Type` đúng cho `.wasm.br`, `.data.br` — nếu không cấu hình được server, bật *Decompression Fallback* (tăng kích cỡ, chậm load). Brotli còn yêu cầu HTTPS.
- **Audio bị trình duyệt chặn** tới khi người dùng chạm/click — màn "Click to start" không phải trang trí, là bắt buộc.
- Unity 6 có **WebGPU** thử nghiệm (compute shader, hiệu năng gần native) — chưa dùng cho sản phẩm, nhưng đáng bật thử để biết game bạn có chạy được năm sau không.

## PC / Steam

**Steamworks.NET** (hoặc Facepunch.Steamworks) + `steam_appid.txt` cạnh exe khi chạy ngoài Steam client. Achievement: `SteamUserStats.SetAchievement("ACH_ID")` rồi **`StoreStats()`** — quên dòng thứ hai là achievement không bao giờ hiện. Cloud save: *Steam Auto-Cloud* theo đường dẫn `persistentDataPath` không cần code; Remote Storage API khi cần điều khiển conflict.

Độ phân giải: `Screen.SetResolution(w, h, FullScreenMode.FullScreenWindow)` (borderless — alt-tab không mất 2 giây như Exclusive), liệt kê `Screen.resolutions` cho menu, lưu lựa chọn. UI phải chịu được **16:10 (Steam Deck 1280×800)** và ultrawide 21:9 — Canvas Scaler *Scale With Screen Size*, match 0.5, và test cả hai. Steam Deck chạy bản Windows qua Proton tốt hơn bản Linux native với nhiều plugin — verify cả hai trước khi quyết định ship Linux.

## Addressables

- **Group theo lúc cần**: `Core` (local, luôn có), `Level_01..N` (remote hoặc local tuỳ chiến lược), `Skins` (remote, on-demand). Không group theo loại asset (mọi texture một group) — tải một level sẽ kéo cả bundle texture của mọi level.
- **Local vs Remote** Build/Load Path trong profile; *Build Remote Catalog* bật để **cập nhật nội dung không cần build lại app**: sửa level → *Update a Previous Build* với `addressables_content_state.bin` của bản đã ship → upload bundle + catalog mới → app tải catalog qua `Addressables.CheckForCatalogUpdates`. Mất file `.bin` là mất khả năng update bản đó.
- **Duplicate dependency** làm bundle phình: hai group cùng tham chiếu một texture không Addressable → texture bị đóng vào cả hai bundle. *Analyze → Check Duplicate Bundle Dependencies → Fix* gom chúng vào group chung. Chạy trước mỗi lần build content.
- **Release**: mỗi `LoadAssetAsync` trả handle phải `Addressables.Release(handle)`; `InstantiateAsync` → `ReleaseInstance(go)`. Không release là bundle sống mãi — Memory Profiler hiện *AssetBundle* tăng theo số lần đổi scene.
- Test với *Play Mode Script: Use Existing Build* ít nhất một lần trước khi ship — *Use Asset Database* trong Editor che mọi lỗi bundle.

## Code theo nền tảng

`#if UNITY_ANDROID … #elif UNITY_IOS` rải khắp code là cách nhanh nhất làm một nền tảng lặng lẽ hỏng khi sửa nền tảng khác — và code trong nhánh không compile không được kiểm tra. Thay bằng **interface + implementation per platform**, chọn một lần ở bootstrap:

```csharp
public interface IPlatformServices { void ShowAchievement(string id); string DeviceTier(); }

public static class Platform {
    public static readonly IPlatformServices Services =
#if UNITY_ANDROID && !UNITY_EDITOR
        new AndroidServices();
#elif UNITY_IOS && !UNITY_EDITOR
        new IosServices();
#else
        new EditorServices();          // Editor luôn chạy nhánh này — log thay vì gọi SDK
#endif
}
```

Một `#if` duy nhất, các implementation là class thường compile ở mọi nền tảng (đặt SDK call sau `#if` bên trong class đó nếu SDK không có cho platform khác). Cấu trúc asmdef để tách xem [[unity-project-structure]]. Với Unity 6, define riêng cho từng Build Profile (`DEMO`, `CHEATS_ENABLED`) khai trong profile, không trong Player Settings chung.

## Crash reporting và symbol

Bản Release IL2CPP không có symbol → stack trace là `libil2cpp.so + 0x3a4f2c`. Ba lựa chọn: **Unity Cloud Diagnostics** (bật trong Services, tự upload symbol khi build qua Editor), **Backtrace**, **Firebase Crashlytics** (kèm analytics). Điểm chung: phải **upload `symbols.zip` (Android) / dSYM (iOS) cho đúng build** — CI build thì CI upload, không có bước tay. Kèm `Debug.LogException` cho lỗi managed bắt được, vì crash native chỉ chiếm phần nhỏ so với exception C# nuốt âm thầm.

## Build pipeline script hoá

```csharp
// Assets/Editor/BuildScript.cs — gọi: Unity -batchmode -nographics -quit -projectPath . -executeMethod BuildScript.Android -logFile -
using UnityEditor; using UnityEditor.Build.Reporting;

public static class BuildScript {
    public static void Android() {
        int build = int.Parse(System.Environment.GetEnvironmentVariable("BUILD_NUMBER") ?? "1");
        PlayerSettings.Android.bundleVersionCode = build;             // tăng theo CI, không tay
        PlayerSettings.bundleVersion = $"1.2.{build}";
        EditorUserBuildSettings.buildAppBundle = true;

        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions {
            scenes = new[] { "Assets/Scenes/Boot.unity", "Assets/Scenes/Game.unity" },
            locationPathName = $"Builds/game-{build}.aab",
            target = BuildTarget.Android,
            options = BuildOptions.None                                  // Development: BuildOptions.Development | BuildOptions.ConnectWithProfiler
        });
        if (report.summary.result != BuildResult.Succeeded) EditorApplication.Exit(1);   // CI phải thấy fail
    }
}
```

CI (GitHub Actions với GameCI, hoặc Jenkins/Mac mini cho iOS): cache thư mục `Library/` theo hash của `Packages/manifest.json` — không cache là mỗi build import lại 20 phút; **Unity Accelerator** cho team > 3 người. Build đêm chạy **Release thật** rồi cài lên máy test tự động qua `adb install`; bản Dev chỉ để profile.

## Bẫy lộ ra khi build

- **Development Build ≠ Release**: Dev giữ `Debug.Log` trong console, bật profiler, `Debug.isDebugBuild = true`, IL2CPP config Debug chậm hơn 10–30%. Release vẫn chạy `Debug.Log` (tốn) nhưng không có `UNITY_ASSERTIONS`. Bug "chỉ xảy ra trên Release" thường là stripping hoặc code trong `#if DEVELOPMENT_BUILD`.
- `UnityEditor` namespace trong script runtime không có `#if UNITY_EDITOR` → build fail ở phút 30. Đặt code Editor vào thư mục `Editor/` hoặc asmdef Editor-only.
- `Application.persistentDataPath` khác nhau mọi nền tảng và có thể **chưa tồn tại** trên Android lần đầu — `Directory.CreateDirectory` trước khi ghi.
- Scene không có trong Build Profile → `LoadScene` ném lỗi chỉ trên build; Editor load được mọi scene trong project.
- Bật *Split Application Binary* / OBB kiểu cũ trên Android là con đường không còn được Play chấp nhận — dùng `.aab` + Play Asset Delivery.

## Kiểm tra nhanh
- Có bản build **Release** trên máy đích trong 7 ngày gần nhất không?
- Build Report: 10 asset lớn nhất chiếm bao nhiêu % tổng — có texture RGBA32 hoặc audio chưa nén nào không?
- Load một save thật từ bản Release, Managed Stripping Medium: mọi trường có giá trị không?
- `adb logcat -s Unity` trong 5 phút chơi: có `MissingMethodException` / `ExecutionEngineException` không?
- CI: build đêm qua xanh không, và ai nhận thông báo khi đỏ?

## 🤖 Prompt cho AI

AI viết code chạy hoàn hảo trong Editor với Mono và không biết IL2CPP + stripping tồn tại — nó dùng reflection, `dynamic`, `Task.Run` cho WebGL, và `#if UNITY_ANDROID` rải mọi file.

**Phải nêu rõ:**
- Nền tảng đích, backend (IL2CPP), Managed Stripping Level đang dùng
- Min/target API Android, phiên bản iOS thấp nhất, có WebGL hay không (quyết định thread và IO)
- Có dùng Addressables không, local hay remote, có content update không
- Thư viện bên thứ ba dùng reflection (JSON, DI) → cần `link.xml`
- Crash reporting nào và ai upload symbol
- CI nào, build number lấy từ đâu

**Mẫu prompt**

```
Viết BuildScript.cs cho Unity 6 (6000.0.x), gọi từ CI bằng -batchmode -nographics -executeMethod.

Target: Android .aab, IL2CPP, ARM64 ONLY (KHÔNG ARMv7), Min API 24, Target API 35, Managed Stripping Medium, Graphics APIs [Vulkan, OpenGLES3] (KHÔNG Auto), texture ASTC.
Hai hàm: BuildAndroidDev (Development + ConnectWithProfiler, stripping Low) và BuildAndroidRelease.
- bundleVersionCode = biến môi trường BUILD_NUMBER; bundleVersion = "1.4.{BUILD_NUMBER}".
- Keystore path/password đọc từ biến môi trường, CẤM hardcode, CẤM commit keystore.
- Bật Create symbols.zip (Debugging) cho Release.
- Nếu BuildResult != Succeeded thì EditorApplication.Exit(1) để CI đỏ.
- Sau build, in 20 asset lớn nhất từ BuildReport ra log.
- Dùng Build Profile "Android-Release" nếu API BuildProfile có; nếu không, BuildPlayerOptions thường.
Kèm link.xml giữ Newtonsoft.Json và mọi type trong Game.Save.*.
Không thêm package. Không đụng Player Settings ngoài các mục nêu trên.
```

**Bẫy thường gặp:** AI thêm `[Preserve]` lên **class** DTO nhưng stripping vẫn xoá **constructor không tham số** và property setter không ai gọi trực tiếp → JSON deserialize thành object với mọi trường default, không exception. Trông như "save file rỗng" trong khi file trên đĩa đầy dữ liệu. Với DTO, dùng `preserve="all"` ở cấp type trong `link.xml`, và test load trên bản Release.

## 💻 Code

Demo dựng một **script build Android chạy được từ menu và từ CI** (`-executeMethod`), ép đúng các Player Settings hay bị quên (IL2CPP, ARM64, stripping Medium, Vulkan + GLES3), in Build Report với 10 asset to nhất, và một `link.xml` giữ những gì stripping hay xoá nhầm. Kiểm chứng: CI đỏ khi build fail, log có bảng asset.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 370" role="img" aria-label="Project có Assets/Editor/BuildScript.cs, Assets/link.xml và thư mục Builds/Android; menu Build ▸ Android Release; panel Player Settings Android với IL2CPP, ARM64, Managed Stripping Medium, Min API 24, Graphics APIs Vulkan và OpenGLES3; panel Build Report với tổng kích cỡ và top asset">
  <rect x="10" y="10" width="200" height="350" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Project</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <text x="22" y="64" class="fig-muted" font-size="12">▾ Assets</text>
  <rect x="16" y="72" width="188" height="20" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="38" y="87" class="fig-label" font-size="12" font-weight="600">Editor/BuildScript.cs</text>
  <text x="38" y="107" class="fig-muted" font-size="12">link.xml</text>
  <text x="38" y="125" class="fig-muted" font-size="12">Scenes/Boot.unity, Game.unity</text>
  <text x="22" y="147" class="fig-muted" font-size="12">▾ Builds/Android  (gitignore)</text>
  <text x="38" y="165" class="fig-muted" font-size="11">game-123.aab</text>
  <text x="38" y="181" class="fig-muted" font-size="11">game-123.symbols.zip</text>
  <text x="22" y="209" class="fig-label" font-size="12" font-weight="600">Menu</text>
  <text x="22" y="227" class="fig-muted" font-size="11">Build ▸ Android Release</text>
  <text x="22" y="243" class="fig-muted" font-size="11">(CI gọi BuildScript.BuildAndroidCI)</text>
  <rect x="16" y="256" width="188" height="96" rx="4" class="fig-box"/>
  <text x="22" y="272" class="fig-label" font-size="11" font-weight="600">Build Profile ▸ Android-Release</text>
  <text x="22" y="288" class="fig-muted" font-size="10">Scene List: Boot, Game</text>
  <text x="22" y="302" class="fig-muted" font-size="10">Build App Bundle (.aab)  ☑ (theo -aab)</text>
  <text x="22" y="316" class="fig-muted" font-size="10">Development Build  ☐</text>
  <text x="22" y="330" class="fig-muted" font-size="10">Version 1.4.123  ·  Bundle Code 123</text>
  <text x="22" y="344" class="fig-muted" font-size="10">Create symbols.zip  Debugging (bật tay)</text>
  <rect x="226" y="10" width="424" height="350" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Player Settings ▸ Android  (script ép lại mỗi lần build)</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Other Settings ▸ Configuration</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Scripting Backend</text><text x="440" y="82" class="fig-label" font-size="11">IL2CPP</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Target Architectures</text><text x="440" y="98" class="fig-label" font-size="11">ARM64 ☑   ARMv7 ☐   x86-64 ☐</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Managed Stripping Level</text><text x="440" y="114" class="fig-label" font-size="11">Medium</text>
  <text x="250" y="130" class="fig-muted" font-size="11">Minimum API Level</text><text x="440" y="130" class="fig-label" font-size="11">Android 7.0 (API 24)</text>
  <text x="250" y="146" class="fig-muted" font-size="11">Target API Level</text><text x="440" y="146" class="fig-label" font-size="11">Automatic (highest installed)</text>
  <rect x="234" y="156" width="408" height="18" rx="3" fill="#b197fc" opacity="0.22"/>
  <text x="242" y="169" class="fig-label" font-size="12" font-weight="600">Other Settings ▸ Rendering</text>
  <text x="250" y="188" class="fig-muted" font-size="11">Auto Graphics API</text><text x="440" y="188" class="fig-label" font-size="11">☐</text>
  <text x="250" y="204" class="fig-muted" font-size="11">Graphics APIs (thứ tự thử)</text><text x="440" y="204" class="fig-label" font-size="11">1. Vulkan   2. OpenGLES3</text>
  <text x="250" y="220" class="fig-muted" font-size="11">Texture Compression</text><text x="440" y="220" class="fig-label" font-size="11">ASTC</text>
  <rect x="234" y="230" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="243" class="fig-label" font-size="12" font-weight="600">Build Report  (log sau build)</text>
  <text x="250" y="262" class="fig-muted" font-size="11">Result / Time</text><text x="440" y="262" class="fig-label" font-size="11">Succeeded   /   00:18:42</text>
  <text x="250" y="278" class="fig-muted" font-size="11">Total Size</text><text x="440" y="278" class="fig-label" font-size="11">87.4 MB   (0 error, 3 warning)</text>
  <text x="250" y="294" class="fig-muted" font-size="11">Top assets (packedAssets)</text><text x="440" y="294" class="fig-label" font-size="11">6.2 MB  T_Env_Atlas.png</text>
  <text x="440" y="310" class="fig-label" font-size="11">4.1 MB  bgm_main.ogg</text>
  <text x="440" y="326" fill="#ff8787" font-size="11">3.9 MB  UI_Splash_4096.png  ← RGBA32?</text>
  <text x="440" y="342" class="fig-label" font-size="11">2.5 MB  T_Hero_Albedo.png  …</text>
  <text x="250" y="342" class="fig-muted" font-size="10">Editor.log cũng có bảng này</text>
</svg>
<figcaption>Script không tin Player Settings đang lưu trong repo — mỗi lần build nó ép lại các mục ở panel giữa, nên ai đó đổi tay trong Editor cũng không lọt vào bản CI.</figcaption>
</figure>

**Script**

```csharp
// Assets/Editor/BuildScript.cs — Unity 6 (6000.x). Phải nằm trong thư mục Editor/ (hoặc asmdef Editor-only) vì dùng UnityEditor.
// Menu: Build ▸ Android Release.  CI: -executeMethod BuildScript.BuildAndroidCI -buildNumber 123 [-aab]  (xem dòng lệnh dưới)
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;
using UnityEngine.Rendering;

public static class BuildScript
{
    const string OutputDir = "Builds/Android";
    const string VersionPrefix = "1.4.";          // bundleVersion = 1.4.<buildNumber>

    [MenuItem("Build/Android Release")]
    public static void BuildAndroidReleaseMenu()
        => Build(buildNumber: PlayerSettings.Android.bundleVersionCode + 1, appBundle: false, exitOnFail: false);

    /// <summary>Điểm vào cho CI. Không có tham số — -executeMethod chỉ gọi được static void không tham số.</summary>
    public static void BuildAndroidCI()
    {
        string arg = GetArg("-buildNumber") ?? Environment.GetEnvironmentVariable("BUILD_NUMBER") ?? "1";
        if (!int.TryParse(arg, out int buildNumber)) buildNumber = 1;
        Build(buildNumber, appBundle: HasArg("-aab"), exitOnFail: true);
    }

    static void Build(int buildNumber, bool appBundle, bool exitOnFail)
    {
        // --- Ép Player Settings: không tin giá trị đang lưu, ai đó có thể đã đổi tay ---
        var android = NamedBuildTarget.Android;
        PlayerSettings.SetScriptingBackend(android, ScriptingImplementation.IL2CPP);
        PlayerSettings.SetManagedStrippingLevel(android, ManagedStrippingLevel.Medium);   // Low cho bản Dev
        PlayerSettings.SetIl2CppCodeGeneration(android, Il2CppCodeGeneration.OptimizeSpeed); // Dev: OptimizeSize (build nhanh hơn ~30%)
        PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;            // KHÔNG ARMv7: +40% kích cỡ cho máy trước 2015
        PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel24;
        PlayerSettings.SetUseDefaultGraphicsAPIs(BuildTarget.Android, false);
        PlayerSettings.SetGraphicsAPIs(BuildTarget.Android, new[] { GraphicsDeviceType.Vulkan, GraphicsDeviceType.OpenGLES3 });

        PlayerSettings.Android.bundleVersionCode = Math.Max(1, buildNumber);              // tăng theo CI, không tay
        PlayerSettings.bundleVersion = VersionPrefix + buildNumber;
        EditorUserBuildSettings.buildAppBundle = appBundle;                               // .aab cho Play, .apk cho adb install
        // Symbols: Unity 6 dùng UnityEditor.Android.UserBuildSettings.DebugSymbols.level (cần Android module) — để tay trong Build Profile cho demo gọn.

        ApplyKeystoreFromEnv();

        string ext = appBundle ? "aab" : "apk";
        Directory.CreateDirectory(OutputDir);
        var options = new BuildPlayerOptions
        {
            scenes = EditorBuildSettings.scenes.Where(s => s.enabled).Select(s => s.path).ToArray(),
            locationPathName = Path.Combine(OutputDir, $"game-{buildNumber}.{ext}"),
            target = BuildTarget.Android,
            options = BuildOptions.None          // Dev: BuildOptions.Development | BuildOptions.ConnectWithProfiler
        };

        BuildReport report = BuildPipeline.BuildPlayer(options);
        LogSummary(report);

        if (report.summary.result != BuildResult.Succeeded && exitOnFail)
            EditorApplication.Exit(1);           // CI phải thấy fail; không có dòng này log đỏ nhưng job xanh
    }

    static void ApplyKeystoreFromEnv()
    {
        // CẤM hardcode, CẤM commit keystore. Thiếu biến → ký debug key, chỉ dùng để test cài máy.
        string path = Environment.GetEnvironmentVariable("ANDROID_KEYSTORE_PATH");
        if (string.IsNullOrEmpty(path)) { Debug.LogWarning("[Build] Không có ANDROID_KEYSTORE_PATH → ký debug key"); return; }
        PlayerSettings.Android.useCustomKeystore = true;
        PlayerSettings.Android.keystoreName = path;
        PlayerSettings.Android.keystorePass = Environment.GetEnvironmentVariable("ANDROID_KEYSTORE_PASS");
        PlayerSettings.Android.keyaliasName = Environment.GetEnvironmentVariable("ANDROID_KEYALIAS_NAME");
        PlayerSettings.Android.keyaliasPass = Environment.GetEnvironmentVariable("ANDROID_KEYALIAS_PASS");
    }

    static void LogSummary(BuildReport report)
    {
        BuildSummary s = report.summary;
        var sb = new StringBuilder(2048);
        sb.AppendLine($"[Build] {s.result}  size {s.totalSize / (1024.0 * 1024.0):F1} MB  time {s.totalTime:hh\\:mm\\:ss}  " +
                      $"errors {s.totalErrors}  warnings {s.totalWarnings}  → {s.outputPath}");

        // Gom mọi PackedAssetInfo theo đường dẫn asset gốc (một texture có thể nằm trong nhiều file), lấy 10 to nhất
        var bySource = new Dictionary<string, ulong>();
        foreach (PackedAssets pack in report.packedAssets)
            foreach (PackedAssetInfo info in pack.contents)
            {
                string key = string.IsNullOrEmpty(info.sourceAssetPath) ? $"<{info.type?.Name}>" : info.sourceAssetPath;
                bySource[key] = bySource.TryGetValue(key, out var v) ? v + info.packedSize : info.packedSize;
            }
        sb.AppendLine("[Build] Top 10 asset theo kích cỡ đóng gói:");
        foreach (var kv in bySource.OrderByDescending(kv => kv.Value).Take(10))
            sb.AppendLine($"  {kv.Value / (1024.0 * 1024.0),7:F2} MB  {kv.Key}");

        if (s.result == BuildResult.Succeeded) Debug.Log(sb.ToString()); else Debug.LogError(sb.ToString());
        File.WriteAllText(Path.Combine(OutputDir, "last-build-report.txt"), sb.ToString());   // artifact cho CI đính kèm
    }

    // -executeMethod không truyền tham số → tự đọc từ dòng lệnh: "-buildNumber 123"
    static string GetArg(string name)
    {
        string[] args = Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length - 1; i++)
            if (string.Equals(args[i], name, StringComparison.OrdinalIgnoreCase)) return args[i + 1];
        return null;
    }

    static bool HasArg(string name) => Environment.GetCommandLineArgs().Any(a => string.Equals(a, name, StringComparison.OrdinalIgnoreCase));
}
```

```xml
<!-- Assets/link.xml — Managed Stripping Medium xoá code "không ai gọi"; những gì được gọi qua reflection phải khai ở đây. -->
<linker>
  <!-- JSON serializer tạo type bằng Activator/reflection: giữ nguyên assembly cho chắc (giá: ~600KB) -->
  <assembly fullname="Newtonsoft.Json" preserve="all"/>

  <!-- DTO save: preserve="all" ở cấp TYPE giữ cả constructor rỗng và property setter — [Preserve] trên class thì KHÔNG -->
  <assembly fullname="Game.Runtime">
    <type fullname="Game.Save.SaveData" preserve="all"/>
    <type fullname="Game.Save.SaveData/InventorySlot" preserve="all"/>   <!-- nested type dùng dấu / -->
  </assembly>

  <!-- Renderer Feature chỉ được tham chiếu từ asset Universal Renderer (không từ code) — Strip Engine Code có thể bỏ -->
  <assembly fullname="Unity.RenderPipelines.Universal.Runtime">
    <type fullname="UnityEngine.Rendering.Universal.DecalRendererFeature" preserve="all"/>
  </assembly>
</linker>
```

```bash
# CI (Windows runner). Linux/macOS: thay Unity.exe bằng đường dẫn Unity của bạn, cú pháp arg giống nhau.
"C:/Program Files/Unity/Hub/Editor/6000.0.40f1/Editor/Unity.exe" -batchmode -nographics -quit -projectPath "%CD%" -buildTarget Android -executeMethod BuildScript.BuildAndroidCI -buildNumber 123 -aab -logFile -
```

**Chạy thử**
- Menu `Build ▸ Android Release` trong Editor: Console hiện `[Build] Succeeded  size … MB  time …` và bảng 10 asset — dòng nào là `.png` trên 3 MB thì mở Build Report Inspector kiểm format (RGBA32 chưa Platform Override là nghi phạm số một). File `Builds/Android/last-build-report.txt` cũng có bảng này.
- Sau build, mở Player Settings ▸ Android: Scripting Backend đã là **IL2CPP**, ARMv7 **bỏ chọn**, Managed Stripping **Medium**, Graphics APIs **Vulkan, OpenGLES3** — dù trước đó bạn cố đổi tay. Đây là điểm mấu chốt: cấu hình sống trong script, không trong ổ đĩa của ai.
- Chạy dòng lệnh CI với `-buildNumber 123`: `bundleVersionCode` = 123, tên file `game-123.aab`, `bundleVersion` = `1.4.123`. Bỏ `-aab` → ra `.apk` cài được bằng `adb install`.
- Cố ý đổi `locationPathName` sang ổ không tồn tại (`Z:/...`) rồi chạy CI: process kết thúc với **exit code 1** (`echo %ERRORLEVEL%` / `echo $?`) — đó là thứ làm job CI đỏ; bỏ `EditorApplication.Exit(1)` thì exit code vẫn 0 dù log đầy lỗi.
- Cài bản Release lên máy thật, load một save thật: mọi trường của `SaveData` có giá trị. Xoá dòng `Game.Save.SaveData` khỏi `link.xml`, build lại, load save: object rỗng nhưng **không exception** — đúng bẫy ở mục 🤖.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | Mono và IL2CPP khác nhau thế nào? Khi nào bắt buộc IL2CPP? |
| Junior | Build chạy trong Editor nhưng lỗi trên thiết bị — anh tìm nguyên nhân ở đâu? |
| Mid | Build Android 300MB, cần xuống dưới 150MB. Anh cắt ở đâu? |
| Mid | Managed Stripping Level làm gì? Vì sao nó hay làm hỏng deserialize? |
| Senior | Crash chỉ xảy ra trên bản Release ở một dòng máy. Quy trình của anh? |
| Senior | Build pipeline của team anh tự động tới đâu? |

**Khung trả lời 60 giây** — "Cắt kích cỡ build Android thế nào?"

> Mở **Build Report** trước, đừng đoán: nó nói thẳng asset nào chiếm bao nhiêu, và gần như luôn là texture và audio chứ không phải code. Thứ tự tôi làm: texture sang **ASTC** và hạ Max Size cho thứ không cần nét (một texture 2048 không nén là 21MB, ASTC 6×6 còn 2.5MB); audio nhạc sang **Streaming** + Vorbis, SFX ngắn ADPCM; xoá asset mồ côi và mọi thứ trong `Resources/` (mọi thứ trong đó **luôn** vào build kể cả không ai dùng).
>
> Rồi mới tới cấu trúc: **Play Asset Delivery / Addressables** để đẩy nội dung ra khỏi gói cài — Google Play giới hạn base AAB 200MB, và người dùng ở mạng yếu thì kích cỡ tải là tỉ lệ rớt cài đặt. Cuối cùng là code: IL2CPP + Managed Stripping Level, nhưng đó là vài MB, không phải hàng trăm.

**Họ sẽ đào tiếp**

- *"IL2CPP?"* → Dịch IL sang C++ rồi biên dịch native: bắt buộc cho iOS, bắt buộc cho Android 64-bit trên Play Store, nhanh hơn Mono lúc chạy, khó dịch ngược hơn. Cái giá: **build lâu hơn nhiều**, và là AOT nên không có JIT — `System.Reflection.Emit`, một số generic trên value type, và `dynamic` sẽ nổ lúc chạy chứ không phải lúc biên dịch.
- *"Stripping ăn mất gì?"* → Thứ chỉ được gọi qua **reflection**: DTO của JSON, class nạp bằng tên, enum trong attribute. Bẫy tinh vi: đánh `[Preserve]` lên class nhưng stripping vẫn xoá **constructor không tham số** và setter không ai gọi trực tiếp → deserialize ra object toàn giá trị mặc định, **không có exception**. Nhìn như "save rỗng" trong khi file trên đĩa đầy dữ liệu. Cách chắc: `preserve="all"` ở cấp type trong `link.xml`, và test trên bản Release chứ không phải Development.
- *"Crash chỉ trên Release?"* → Bật `Development Build` + `Script Debugging` để có stack trace tên hàm, dựng **symbol** (`symbols.zip` cho Android, dSYM cho iOS) và symbolicate log từ Crashlytics/Play Console. Nếu chỉ xảy ra ở Release mà không ở Development thì nghi stripping, `[Conditional]` code bị xoá, hoặc race lộ ra vì timing khác.
- *"iOS/Android khác gì đáng nhớ?"* → Android: keystore phải giữ **vĩnh viễn** (mất là không update app được nữa), 64-bit bắt buộc, target API level theo hạn Google. iOS: bitcode đã bỏ, cần Privacy Manifest, và App Store từ chối nếu app ghi cache lớn vào thư mục được iCloud backup.
- *"Pipeline?"* → Tối thiểu: một hàm `[MenuItem]`/CLI `-batchmode -executeMethod` để build một lệnh, version code tự tăng, symbol upload tự động, và một bản build đêm cho QA. Không cần Jenkins mới gọi là pipeline, nhưng "tôi bấm Build trong Editor rồi kéo file lên Drive" là câu trả lời của dự án một người.

**Cờ đỏ**

- Để asset trong `Resources/` vì "cho tiện".
- Không biết `Development Build` chậm hơn và **không** được dùng để đo hiệu năng cuối.
- Test hiệu năng và bộ nhớ trên máy flagship rồi kết luận cho cả thị trường.
- Mất keystore, hoặc không biết nó nằm ở đâu.
- Đổi bundle id/Company Name sau phát hành.

**Số / ví dụ nên thuộc**

- Google Play: base AAB **200MB**, tổng có thể lớn hơn nhờ Play Asset Delivery.
- Texture 2048²: RGBA32 21MB → ASTC 6×6 2.5MB.
- iOS bắt buộc IL2CPP; Play Store bắt buộc 64-bit.
