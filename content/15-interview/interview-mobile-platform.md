---
id: interview-mobile-platform
title: Nền tảng mobile Android và iOS
icon: 📱
summary: Mười hai mảng nền tảng mà game dev Unity bị hỏi khi vị trí ghi điểm cộng "app native" — vòng đời app, bộ nhớ và nhiệt, build Android/iOS, native plugin, push, IAP, store review, crash native — kèm cách nói trung thực về mức native của mình.
status: deep
read: 1127
level: intermediate
order: 25
tags: [interview, mobile, android, ios, build]
related: [interview-unity-tech, unity-build-platform, unity-monetization-sdk, unity-debug-crash]
---

Node [[interview-unity-tech]] hỏi về Unity. Node này hỏi về **thứ nằm dưới Unity**: hệ điều hành, store, toolchain. Tin tuyển ghi "điểm cộng app native Android/iOS" không có nghĩa là họ cần bạn viết app bằng Kotlin hay Swift; họ muốn biết bạn có **hiểu máy mà game đang chạy trên đó** hay chỉ bấm Build. Người ship game nhiều năm thường biết nhiều hơn mình nghĩ — vấn đề là chưa gọi tên được. Mỗi mảng dưới đây gồm đoạn kiến thức cô đọng và bảng "câu hỏi → ý bắt buộc phải chạm". Chi tiết build nằm ở [[unity-build-platform]], SDK kiếm tiền ở [[unity-monetization-sdk]], crash ở [[unity-debug-crash]].

**Về con số chính sách store**: API level yêu cầu, giới hạn kích thước, yêu cầu SDK Xcode đều đổi theo năm. Node chỉ ghi quy luật ("target API phải theo mốc hằng năm của Google Play"), còn số cụ thể thì **tra lại số hiện hành** trên trang chính thức trước khi nói.

## 1. Vòng đời app và việc bị kill ở nền

Trên mobile, app **không chết êm**. Người chơi nhận cuộc gọi, kéo thanh thông báo, bấm Home: Unity gọi `OnApplicationPause(true)` (và `OnApplicationFocus(false)`), rồi hệ điều hành có thể giết process **mà không báo gì thêm**. `OnApplicationQuit` trên mobile không đáng tin để lưu dữ liệu, vì app bị kill ở nền thường không chạy tới đó. Vì vậy dữ liệu quan trọng phải được ghi **khi vào pause**, và ghi atomic ([[unity-save-data]]). Thứ tự gọi `Pause`/`Focus` khác nhau giữa Android và iOS và giữa các phiên bản Unity, nên đừng viết logic phụ thuộc thứ tự. Nhớ thêm: dừng audio, dừng timer mạng, và khi quay lại (`pause = false`) phải tính lại thời gian đã trôi (offline reward) bằng giờ server chứ không bằng `Time.time`.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Lưu game lúc nào trên mobile | `OnApplicationPause(true)` là điểm chắc nhất; không dựa vào `OnApplicationQuit`; kết hợp lưu định kỳ sau sự kiện quan trọng |
| `Pause` khác `Focus` | Pause: app xuống nền; Focus mất: có thể chỉ do popup hệ thống hoặc chia đôi màn hình; xử lý riêng |
| App bị kill ở nền thì sao | Không có callback; lần mở sau là cold start; save phải sống sót mọi lúc bị cắt |
| Quay lại từ nền cần làm gì | Tính thời gian trôi bằng giờ server, nối lại mạng, refresh token/session, bật lại audio |

## 2. Bộ nhớ: Android và iOS giết app khác nhau

Android dùng **low memory killer**: hết RAM thì giết process nền ưu tiên thấp trước, và app của bạn có thể bị giết cả khi đang ở nền lâu. iOS dùng **jetsam**: mỗi app có ngưỡng RAM tuỳ thiết bị, vượt là bị giết ngay, kể cả đang ở trước màn hình. Cả hai đều **không có exception để bắt**; người chơi chỉ thấy game "tự thoát". Báo hiệu sớm duy nhất: `Application.lowMemory` trong Unity (iOS ánh xạ từ `didReceiveMemoryWarning`) — nên dùng để xả cache, unload asset không cần ([[unity-memory-optimization]]). Máy 2–3GB RAM là nơi lỗi này lộ ra nhiều nhất.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Android vs iOS giết app khác nhau | Android: low memory killer, ưu tiên theo trạng thái process; iOS: jetsam, ngưỡng theo thiết bị, giết cả foreground |
| `Application.lowMemory` làm gì | Cảnh báo sớm; xả pool, cache texture, `Resources.UnloadUnusedAssets`; không đủ nếu đã sát ngưỡng |
| Phát hiện OOM ở người chơi thật | Crashlytics ghi nhận hạn chế với OOM; dùng breadcrumb + cờ "phiên trước không thoát sạch" |

## 3. Nhiệt, pin và frame rate

Mobile không có quạt: chạy nặng vài phút thì SoC **thermal throttling**, hạ xung, frame time tăng dần. Nhiều game đo ở máy nguội 60fps nhưng phút thứ 15 tụt. Đối sách: đặt `Application.targetFrameRate` rõ ràng (mặc định mobile thường là 30, không phải 60), chọn 30 cho game không cần 60 để tiết kiệm pin và nhiệt, tắt `vSyncCount` khi tự quản frame rate, hạ độ phân giải render, và dùng **Adaptive Performance** (package của Unity, tích hợp Samsung/Google API) để tự hạ chất lượng khi máy nóng. Thiết kế quanh khung 33,3ms ở 30fps hay 16,6ms ở 60fps ([[unity-optimization]]).

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Thermal throttling là gì | Hạ xung để giảm nhiệt, frame time tăng dần; đo ở phút 15 chứ không chỉ phút 1 |
| 30 hay 60fps | Theo thể loại: puzzle/RPG menu 30 tiết kiệm pin; action cần 60; phải đặt `targetFrameRate` chủ động |
| Adaptive Performance làm gì | Nhận cảnh báo nhiệt từ thiết bị, tự hạ quality/LOD/framerate theo kịch bản đã khai |

## 4. Màn hình: notch, safe area, tỉ lệ

Điện thoại hiện đại có notch, đục lỗ camera, thanh gesture, góc bo. Phần UI quan trọng (nút, HUD) phải nằm trong **safe area**: `Screen.safeArea` trả về hình chữ nhật an toàn (pixel), từ đó neo lại RectTransform gốc của Canvas. Tỉ lệ khung hình trải từ 16:9 đến trên 20:9 và máy gập; thiết kế UI theo **anchor** và `Canvas Scaler` (Scale With Screen Size, Match theo chiều phù hợp), nền thì cho tràn viền. Độ phân giải native cao hơn nhiều so với cần: hạ Render Scale hoặc đặt `Screen.SetResolution` để giảm GPU. Xoay màn hình cũng đổi safe area, nên phải cập nhật khi đổi hướng.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Xử lý notch thế nào | `Screen.safeArea` → quy sang anchor trên Canvas; nền tràn, nút nằm trong vùng an toàn; cập nhật khi đổi hướng |
| Hỗ trợ nhiều tỉ lệ | Anchor + Canvas Scaler; kiểm bằng Device Simulator và máy thật; tránh hardcode pixel |
| Độ phân giải cao có cần không | Không; hạ Render Scale tiết kiệm GPU/pin, UI vẫn sắc nếu vẽ ở độ phân giải gốc |

## 5. Build Android

Unity build Android bằng **Gradle**: sinh project Gradle (hoặc export để mở bằng Android Studio), gộp thư viện từ plugin, rồi đóng gói. Mấy khái niệm phải nói trôi chảy:

- **APK vs AAB**: AAB (Android App Bundle) là định dạng nộp lên Google Play, Google tự sinh APK theo thiết bị (tách theo ABI, mật độ màn hình), nên người dùng tải nhỏ hơn. APK dùng để cài thử hoặc kênh ngoài store.
- **minSdk / targetSdk**: min là máy cũ nhất chạy được; target là API mà app khai báo đã kiểm tương thích. Google Play bắt target phải theo mốc hằng năm (tra lại số hiện hành), còn min do bạn chọn theo thị trường.
- **64-bit**: Google Play yêu cầu có ARM64; IL2CPP cho ra ARM64, ARMv7 là tuỳ chọn cho máy rất cũ.
- **Keystore và Play App Signing**: keystore là khoá ký. Với Play App Signing, Google giữ khoá ký cuối; bạn giữ **upload key**. Mất upload key còn reset được qua Google; mất keystore ký trực tiếp (không dùng Play App Signing) thì mất khả năng cập nhật app. Không bao giờ commit keystore và mật khẩu lên repo.
- **Play Asset Delivery**: AAB base có giới hạn kích thước (tra lại số hiện hành), nội dung lớn đẩy sang asset pack (install-time, fast-follow, on-demand).
- **R8/ProGuard**: thu nhỏ và làm rối code Java/Kotlin. SDK dùng reflection dễ bị cắt nhầm, nên cần file rules (`proguard-user.txt`). Lỗi chỉ lộ ở bản release.
- **Manifest merge**: `AndroidManifest.xml` của app và của từng `.aar` được gộp. Xung đột quyền hoặc `activity` trùng báo lỗi lúc build; dùng `tools:replace`, `tools:node` để xử lý.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| AAB khác APK | AAB là bản nộp, Google sinh APK theo thiết bị; APK để cài trực tiếp |
| Mất keystore thì sao | Có Play App Signing: reset upload key được; không có: không cập nhật được app đó nữa |
| Build release crash mà debug thì không | R8 cắt/đổi tên code; thêm keep rules; kiểm mapping file |
| Build fail "Duplicate class" | Hai thư viện kéo cùng dependency khác phiên bản; dùng EDM4U Resolve, loại trừ trong `mainTemplate.gradle` ([[unity-third-party]]) |
| Manifest merge lỗi | Đọc `manifest-merger-report`, xung đột `uses-permission`/`application` attribute, xử lý bằng `tools:` |

## 6. Build iOS

Unity không build ra IPA trực tiếp: nó **sinh project Xcode**, rồi Xcode biên dịch và ký. Mỗi lần sinh lại sẽ ghi đè Xcode project, nên mọi chỉnh sửa (capability, plist, framework) phải làm bằng script **post-process build** (`PBXProject`, `PlistDocument`) chứ không sửa tay. Phần ký:

- **Certificate** (danh tính nhà phát triển) + **Provisioning Profile** (cho phép app, bundle id, thiết bị, capability nào) + **Bundle ID**. Dùng automatic signing cho máy cá nhân, CI thường dùng manual signing hoặc fastlane match.
- **Bitcode đã bị bỏ**: Xcode 14 trở đi không dùng nữa; ai còn bảo "nhớ bật bitcode" là kiến thức cũ.
- **App Store Connect**: nơi tạo app, nhập metadata, quản lý build, giá, IAP. **TestFlight**: phát bản thử cho tester nội bộ (không cần review) và ngoại bộ (cần Beta Review đầu tiên).
- **Privacy manifest** (`PrivacyInfo.xcprivacy`): Apple yêu cầu khai các API nhạy cảm app và SDK dùng cùng lý do; SDK bên thứ ba cũng cần có bản của họ. Thiếu có thể bị từ chối khi nộp.
- **ATT (App Tracking Transparency)**: muốn lấy IDFA để quảng cáo cá nhân hoá phải hỏi người dùng bằng `ATTrackingManager`, kèm `NSUserTrackingUsageDescription` trong plist. Từ chối thì IDFA là số 0, ảnh hưởng đo lường quảng cáo ([[unity-monetization-sdk]]).
- Dùng **CocoaPods** cho thư viện iOS; EDM4U sinh Podfile giúp.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Quy trình ra bản iOS | Unity build → Xcode project → ký (certificate + profile) → archive → upload App Store Connect → TestFlight → submit review |
| Vì sao sửa Xcode project bằng tay là bẫy | Unity sinh lại, ghi đè; dùng post-process script để lặp lại được trên CI |
| Provisioning profile là gì | Giấy phép gắn certificate + bundle id + thiết bị/capability; hết hạn hoặc lệch là lỗi ký |
| ATT khác consent GDPR | ATT là cơ chế hệ điều hành cho IDFA; GDPR/UMP là consent theo luật khu vực; hai cái độc lập, cần cả hai tuỳ thị trường |
| Bitcode còn dùng không | Đã bỏ từ Xcode 14; đừng dựa vào |

## 7. Native plugin: cầu nối Unity với hệ điều hành

Khi Unity không có sẵn API (chia sẻ, review in-app, haptic tuỳ chỉnh, đọc thông tin máy), bạn viết **native plugin**.

- **Android**: đóng gói `.aar` hoặc `.jar` (hoặc mã Java/Kotlin trong `Plugins/Android`), gọi từ C# bằng `AndroidJavaClass` / `AndroidJavaObject`. Lấy activity hiện tại qua `UnityPlayer.currentActivity`. Chạy UI native phải `runOnUiThread`. Gọi qua JNI chậm và dễ typo tên phương thức (lỗi chỉ lộ lúc chạy), nên bọc gọn một lớp C# và kiểm bằng `#if UNITY_ANDROID && !UNITY_EDITOR`.
- **iOS**: viết `.mm` (Objective-C++) hoặc `.m` + `.h` trong `Plugins/iOS`, xuất hàm với `extern "C"`, C# khai báo `[DllImport("__Internal")]`. Chuỗi trả về phải cấp phát bằng bộ nhớ mà phía C# giải phóng được (`strdup`).
- **Gọi ngược về Unity**: `UnitySendMessage("TênGameObject", "TênPhươngThức", "chuỗi")` — chỉ truyền được **một chuỗi**, GameObject phải tồn tại. Cách bền hơn: callback delegate qua `[MonoPInvokeCallback]` (iOS) hoặc `AndroidJavaProxy` (Android).
- **Dependency**: `.aar` kéo thêm thư viện Gradle, pod iOS kéo thêm pod. **External Dependency Manager (EDM4U)** đọc file `*Dependencies.xml` và giải quyết cả Gradle lẫn CocoaPods ([[unity-third-party]]).

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Gọi Java từ C# thế nào | `AndroidJavaObject`/`AndroidJavaClass` qua JNI, `UnityPlayer.currentActivity`; UI phải `runOnUiThread`; bọc lớp C# riêng |
| Gọi code iOS từ C# | `.mm` + `extern "C"` + `[DllImport("__Internal")]`; chuỗi trả về cần quản lý bộ nhớ |
| Native báo kết quả về Unity | `UnitySendMessage` (một chuỗi) hoặc callback delegate; chạy trên main thread của Unity cần chuyển luồng |
| Lỗi chỉ ở bản build | Plugin không có trong Editor; bọc bằng `#if`, có bản giả để chạy Editor |
| Plugin kéo thư viện phiên bản xung đột | EDM4U Resolve, ép phiên bản, loại trừ module |

## 8. Push notification, deep link, local notification

**Push**: Android dùng **FCM** (Firebase Cloud Messaging), iOS dùng **APNs**; FCM cũng gửi được tới iOS bằng cách giữ APNs key. Luồng: app xin quyền (iOS luôn hỏi; Android 13 trở lên cũng cần quyền thông báo lúc chạy), nhận **device token**, gửi lên server của bạn, server gửi qua FCM/APNs. Token đổi được nên phải gửi lại khi refresh. **Local notification** (nhắc hồi năng lượng, hết giờ xây dựng) lên lịch ngay trên máy bằng package Mobile Notifications, không cần server. **Deep link**: Android dùng `intent-filter` (App Links có xác minh domain), iOS dùng **Universal Links** (file `apple-app-site-association` trên domain). Unity nhận qua `Application.deepLinkActivated`. Dùng cho chiến dịch, mời bạn bè, quay lại đúng màn hình.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Push hoạt động thế nào | Xin quyền → device token → lưu ở server → server gửi qua FCM/APNs → hệ điều hành hiển thị |
| Vì sao không nhận được push trên iOS | Thiếu APNs key/certificate, thiếu capability Push Notifications, chưa xin quyền, token lỗi thời |
| Local vs remote notification | Local lên lịch trên máy, không cần mạng; remote cần server và token |
| Universal Link vs URI scheme | Universal Link dùng domain https có xác minh, mở được cả khi chưa cài thì rơi về web; scheme tuỳ biến dễ bị app khác chiếm |

## 9. IAP: hai store, hai mô hình

**Google Play Billing** và **StoreKit** khác nhau về cách hoàn tất. Google yêu cầu **acknowledge** giao dịch trong khoảng 3 ngày, không thì tự hoàn tiền; consumable phải **consume**. Apple yêu cầu `finishTransaction`, giao dịch chưa finish sẽ bị gửi lại ở lần mở sau. Cả hai có trạng thái **pending** (thanh toán chờ duyệt, phụ huynh phê duyệt, tiền mặt tại cửa hàng ở một số nước): không được trao hàng khi pending. **Refund** xảy ra ngoài app; server nên nhận thông báo từ store (RTDN của Google, App Store Server Notifications) để thu hồi quyền lợi. Xác thực biên nhận ở server, không tin client. Có **restore purchases** cho non-consumable và subscription, Apple bắt buộc có nút này. Chi tiết luồng ở [[unity-monetization-sdk]].

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Vì sao phải acknowledge/consume | Google tự hoàn tiền nếu không acknowledge trong thời hạn (tra lại số hiện hành); consume để mua lại được |
| Giao dịch pending xử lý sao | Không trao hàng, lưu trạng thái, trao khi store báo hoàn tất; xử lý cả khi app bị đóng giữa chừng |
| Refund thì làm gì | Nhận thông báo server-to-server từ store, thu hồi vật phẩm; với game offline thì chấp nhận rủi ro có kiểm soát |
| Chống gian lận mua hàng | Validate biên nhận ở server, kiểm chữ ký/trạng thái, chống replay; không dựa vào cờ client |

## 10. Store review và chính sách

Review là rủi ro lịch trình thật. Mảng hay vướng:

- **Trẻ em** (Designed for Families / Kids Category, COPPA, GDPR-K): hạn chế quảng cáo cá nhân hoá, SDK phải được phép dùng cho trẻ em, không thu thập định danh.
- **Gacha / loot box**: Apple và Google yêu cầu **công bố tỉ lệ rơi**; một số quốc gia cấm hoặc hạn chế. Phải hiển thị trước khi mua.
- **Đánh giá trong app**: dùng API chính thức (`SKStoreReviewController`, Play In-App Review), không tự chặn người dùng chỉ cho đánh giá tốt, không hỏi quá thường xuyên.
- **Lý do từ chối thường gặp**: crash khi review, thiếu nút restore purchases, mô tả/ảnh chụp không khớp, link chính sách quyền riêng tư hỏng, khai sai data safety / privacy label, quyền xin không có lý do, SDK dùng API nhạy cảm mà thiếu privacy manifest, nội dung bên thứ ba không kiểm duyệt.
- Phải có **chính sách quyền riêng tư**, khai **Data safety** (Google) và **App Privacy** (Apple) khớp với SDK đang dùng — SDK quảng cáo/analytics thu thập gì thì phải khai.

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Bản bị từ chối thì làm gì | Đọc lý do chính xác, sửa, trả lời qua Resolution Center có bằng chứng; không nộp lại y nguyên |
| Gacha cần gì | Công bố tỉ lệ rơi, tuân thủ luật từng vùng, giới hạn chi tiêu cho trẻ nếu thị trường yêu cầu |
| Game có trẻ em khác gì | Hạn chế SDK, quảng cáo, thu thập dữ liệu; chọn đúng nhãn đối tượng |
| Data safety/privacy label sai thì sao | Có thể bị gỡ hoặc từ chối cập nhật; đối chiếu từng SDK |

## 11. Crash native, ANR, symbolicate

Crash C# có stack sẵn; **crash native** (SIGSEGV trong `libil2cpp.so`, driver GPU, thư viện bên thứ ba) chỉ là dãy địa chỉ. Trên Android, log là **tombstone** (`/data/tombstones`, hoặc Crashlytics ghi lại); muốn đọc thành tên hàm cần file **symbols** (`.so` có debug symbols, Unity sinh `symbols.zip`) và công cụ như `ndk-stack`/`addr2line`. Trên iOS, crash log cần **dSYM** để **symbolicate**; upload dSYM lên Crashlytics (script build phase hoặc `upload-symbols`) thì stack tự đọc được; thiếu dSYM chỉ thấy địa chỉ hex. **ANR** (Application Not Responding) là Android khi main thread bị chặn quá lâu (khoảng 5 giây với input, tra lại số hiện hành): thường do I/O hay gọi native trên main thread, hoặc SDK chặn. **Watchdog** iOS giết app khởi động quá lâu. Chi tiết ở [[unity-debug-crash]].

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Native crash không có tên hàm | Thiếu symbols: upload `symbols.zip`/dSYM lên Crashlytics hoặc dùng `ndk-stack`; build giữ lại symbols cho từng bản |
| ANR là gì, tìm sao | Main thread bị chặn; xem trace ANR trên Play Console/Crashlytics, tìm I/O hoặc lock trên main thread |
| Crashlytics đủ chưa | Cần thêm breadcrumb, custom key (bản build, màn hình), và theo dõi tỉ lệ crash-free session |
| Crash chỉ ở một dòng máy | Lọc theo thiết bị/OS/RAM; thường driver GPU hoặc OOM; cần máy thật hoặc farm |

## 12. Kiểm thử trên thiết bị thật

Editor che gần hết lỗi mobile. Nguyên tắc: có **máy yếu nhất** trong danh sách hỗ trợ (RAM thấp, GPU yếu) và ít nhất một máy mỗi hãng lớn (Samsung, Xiaomi/Oppo, Pixel) vì skin và driver khác nhau, cộng iPhone cũ nhất còn hỗ trợ. Công cụ: **logcat** (`adb logcat -s Unity`) cho Android, **Xcode console / Devices and Simulators** cho iOS, **Android Studio Profiler** và **Xcode Instruments** cho CPU, bộ nhớ, năng lượng, **Firebase Test Lab** hoặc farm cloud (BrowserStack, AWS Device Farm) khi thiếu máy. Pre-launch report của Google Play chạy bản build trên vài thiết bị tự động. Soft launch theo vùng nhỏ cho dữ liệu thật ([[project-launch]]).

| Câu hỏi | Ý bắt buộc phải chạm |
|---|---|
| Chọn thiết bị test thế nào | Máy yếu nhất hỗ trợ + đại diện các hãng/chip + iPhone cũ nhất; dựa số liệu thị phần của chính game |
| Xem log từ máy thật | `adb logcat` lọc tag Unity; Xcode console; bản Development Build; kết nối không dây để thử như người chơi |
| Không có đủ máy thì sao | Farm cloud, Firebase Test Lab, pre-launch report; vẫn cần máy yếu thật để đo hiệu năng |

## Nói thật về mức native

Đừng nói quá và đừng nói thấp hơn thực tế. Chia ba tầng rõ ràng: **đã làm** (ship Unity lên hai store nhiều năm, tích hợp SDK, plugin cầu nối, đọc log native, debug bằng Xcode và Android Studio), **hiểu nhưng chưa làm sản phẩm thật** (viết app Kotlin/Swift từ đầu, UI native), và **sẵn sàng học** với kế hoạch cụ thể. Người phỏng vấn thích câu "tôi chưa làm X, nhưng đã làm Y gần X, và nếu cần tôi sẽ học theo cách này" hơn là khoe sai rồi bị hỏi một câu là lộ. Chuẩn bị sẵn **một chuyện thật** về chỗ bạn phải chui vào tầng native để sửa lỗi (build fail Gradle, crash symbolicate, plugin cầu nối), vì chuyện có chi tiết đáng tin hơn mọi lời tuyên bố. Cụm "ít native" chỉ nên đi kèm câu "tôi tự gỡ được lỗi build và crash native khi nó chặn việc ship".

## Cách dùng node này trước ngày phỏng vấn

Hai ngày trước: đọc từng mảng, che cột phải của bảng và tự nói. Một ngày trước: gắn mỗi mảng với **một chuyện thật** của bạn (lần bị reject, lần crash OOM, lần fix Gradle) và học thuộc khung 60 giây ở mục 🎤. Chạy chế độ Luyện phỏng vấn trên web, chỉ lật thẻ sau khi nói to. Với mọi con số chính sách, mở trang chính thức của Google Play và Apple để lấy giá trị hiện hành, đừng mang con số của năm trước vào phòng.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho ôn nền tảng mobile Android và iOS**

AI hợp nhất ở vai **người phỏng vấn đào vào chỗ bạn chưa làm native**: nó hỏi, nghe bạn nói, rồi chỉ ra ý bạn thiếu hoặc nói sai. AI không hợp ở việc **khẳng định API và chính sách hiện hành**: kiến thức nó dừng ở một mốc, mà Google Play và Apple đổi yêu cầu hằng năm, nên nó rất hay đưa API level cũ, bảo bật bitcode, hoặc dùng class StoreKit đã bị thay. Quy trình: (1) tự nói miệng trước, (2) dán câu trả lời để AI chấm theo các ý ở bảng, (3) mọi con số chính sách, tên API, tên cờ Gradle phải đối chiếu tài liệu chính thức trước khi tin.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| **Hỏi đáp một-một** | Ôn từng mảng | "Đóng vai người phỏng vấn mobile game dev, hỏi mảng build Android, từng câu một." |
| **Soi chỗ yếu native** | Tập nói trung thực | "Tôi chưa làm app native thuần. Hỏi tôi 5 câu về native Android/iOS và chấm cách tôi thừa nhận giới hạn." |
| **Bẫy cơ chế** | Kiểm chỗ hổng | "Tôi sẽ giải thích cơ chế X. Chỉ ra chỗ tôi sai hoặc lỗi thời." |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Phiên bản Unity** và hệ build (Gradle phiên bản nào, IL2CPP, Unity 6 hay 2022 LTS), vì template Gradle và API khác nhau.
- **Năm và mốc yêu cầu hiện hành**: bắt AI nói rõ "con số này cần tra lại" cho API level, kích thước, phiên bản Xcode.
- **Những gì bạn đã làm thật** (SDK nào, plugin nào, lỗi build nào đã gỡ) để câu hỏi bám vào kinh nghiệm thật.
- **Vị trí và công ty mục tiêu** (mobile game developer, studio Nhật) và mức nhắm tới.
- Thời lượng mỗi câu trả lời (60–90 giây) và yêu cầu **chấm gắt**.

**Mẫu prompt**

```
Đóng vai người phỏng vấn mobile game developer cho studio game Nhật. Tôi là Senior
Unity, đã ship 5 game lên Google Play và App Store (AdMob, IAP, Firebase, Adjust),
nhưng CHƯA làm app native thuần Kotlin/Swift. Tôi dùng Unity 6, IL2CPP, Gradle.

Luật:
- Hỏi TỪNG CÂU MỘT về mảng: <vòng đời app / build Android / build iOS / native plugin
  / IAP / store review / crash native>. Hỏi xong thì DỪNG, chờ tôi trả lời.
- Sau mỗi câu trả lời: chỉ ra ý tôi THIẾU hoặc LỖI THỜI, rồi hỏi một câu đào sâu. Chấm
  GẮT, KHÔNG khen xã giao.
- CẤM tự khẳng định con số chính sách (API level, giới hạn kích thước, phiên bản Xcode).
  Với mỗi con số, nói "cần tra lại trên trang chính thức" thay vì đưa số.
- CẤM dùng API đã bỏ (bitcode, API level cũ, class StoreKit cũ); nếu không chắc API còn
  dùng được không thì nói không chắc.
- KHÔNG liệt kê trước đáp án.
- Khi tôi thừa nhận chưa làm native, đánh giá cách tôi nói: có chuyện thật gần nhất
  không, có kế hoạch học không.
```

**Bẫy thường gặp:** AI đưa kiến thức cũ nghe rất chắc: bảo bật bitcode cho iOS, nói target API 30 là đủ, chỉ cách ký APK bằng `jarsigner` tay trong khi Play App Signing đã là mặc định, hoặc dùng class `SKPaymentQueue` cũ như chuẩn duy nhất. Bẫy thứ hai: AI khuyên bạn khoe kinh nghiệm native lớn hơn thực tế, nghe tự tin nhưng bị hỏi hai câu là lộ; bắt nó chấm cả độ trung thực. Bẫy thứ ba: AI bịa tên cờ Gradle, key plist hay tên hàm Unity (ví dụ phương thức không có trong `AndroidJavaObject`); mọi tên API phải mở tài liệu hoặc thử build thật mới mang đi nói.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`OnApplicationPause` và `OnApplicationQuit` khác nhau thế nào trên mobile, anh lưu game ở đâu?**
  → `OnApplicationPause(true)` chạy khi app xuống nền, còn `OnApplicationQuit` trên mobile thường không chạy khi hệ điều hành giết app ở nền. Vì vậy tôi lưu ở lúc vào pause và sau các sự kiện quan trọng, ghi atomic để không hỏng file nếu bị cắt giữa chừng.
- `Mid` **Người chơi nhận cuộc gọi rồi quay lại game, anh cần xử lý gì?**
  → Khi pause tôi lưu trạng thái, dừng audio và timer mạng. Khi quay lại tôi tính thời gian đã trôi bằng giờ server chứ không bằng `Time.time`, vì đồng hồ game không chạy lúc ở nền, rồi nối lại mạng và refresh session. Làm thế thì offline reward và sự kiện theo giờ không bị sai.
- `Mid` **App bị kill ở nền thì lần mở sau bạn xử lý thế nào?**
  → Đó là cold start bình thường, không có callback nào báo trước nên mọi dữ liệu quan trọng phải đã được lưu ở lần pause trước. Tôi ghi thêm cờ "phiên trước không thoát sạch" để phân tích tần suất bị kill, vì đó là dấu hiệu của OOM hoặc crash mà không có log.
- `Mid` **Android và iOS giết app vì thiếu RAM khác nhau thế nào?**
  → Android dùng low memory killer, giết process nền ưu tiên thấp trước khi RAM cạn. iOS dùng jetsam với ngưỡng RAM theo thiết bị, vượt ngưỡng là bị giết ngay kể cả khi đang ở trước màn hình. Vì cả hai đều không cho bắt exception, tôi phải giữ bộ nhớ thấp chủ động và dùng cảnh báo sớm.
- `Mid` **`Application.lowMemory` dùng để làm gì?**
  → Đây là cảnh báo sớm từ hệ điều hành (iOS ánh xạ từ memory warning), tôi dùng để xả pool, cache texture và gọi `Resources.UnloadUnusedAssets`. Nó không cứu được nếu app đã sát ngưỡng, vì vậy nó là lớp phụ, còn gốc rễ là đo bộ nhớ đỉnh trên máy 2–3GB bằng Memory Profiler.
- `Mid` **Game chạy 60fps lúc đầu rồi tụt dần sau 10–15 phút, anh nghĩ tới gì?**
  → Thermal throttling: SoC nóng nên hạ xung, frame time tăng dần. Tôi đo ở phút 15 chứ không chỉ phút 1, đặt `targetFrameRate` chủ động, cân nhắc 30fps cho thể loại không cần 60, và hạ Render Scale. Có thể dùng Adaptive Performance để tự hạ chất lượng khi máy nóng.
- `Junior` **Mặc định mobile chạy bao nhiêu fps và anh đổi thế nào?**
  → Mặc định thường là 30fps trên mobile, nên muốn 60 phải đặt `Application.targetFrameRate = 60` và kiểm `vSyncCount`. Tôi chọn theo thể loại, vì 60fps ngốn pin và sinh nhiệt nhiều hơn, game puzzle hay RPG menu hầu như không cần.
- `Mid` **Anh xử lý notch và nhiều tỉ lệ màn hình thế nào?**
  → UI quan trọng neo vào `Screen.safeArea`, nền cho tràn viền, còn Canvas Scaler đặt Scale With Screen Size để UI co theo. Tôi cập nhật lại khi đổi hướng vì safe area đổi theo, và kiểm bằng Device Simulator rồi máy thật có notch.
- `Junior` **APK và AAB khác nhau thế nào, vì sao Google Play dùng AAB?**
  → AAB là định dạng nộp lên Google Play, Google tự sinh APK tối ưu theo thiết bị (ABI, mật độ màn hình), nên người dùng tải nhỏ hơn. APK là gói cài trực tiếp, tôi dùng cho thử nghiệm nội bộ.
- `Mid` **`minSdk` và `targetSdk` khác nhau thế nào?**
  → `minSdk` là máy Android cũ nhất chạy được app, còn `targetSdk` khai báo app đã kiểm tương thích với hành vi của phiên bản đó. Google Play bắt `targetSdk` phải theo mốc hằng năm, nên đây là con số tôi tra lại trên trang chính thức mỗi năm. `minSdk` thì tôi chọn theo thị trường và thị phần máy cũ.
- `Mid` **Keystore là gì và Play App Signing thay đổi gì?**
  → Keystore chứa khoá ký app. Với Play App Signing, Google giữ khoá ký cuối cùng còn tôi giữ upload key, nên nếu mất upload key vẫn xin reset được. Không dùng Play App Signing mà mất keystore thì không cập nhật được app đó nữa, vì vậy tôi sao lưu keystore ở nơi an toàn và không commit lên repo.
- `Senior` **Build release crash nhưng debug thì không, anh nghĩ tới gì?**
  → Thủ phạm hay gặp là R8/ProGuard cắt hoặc đổi tên code Java mà SDK gọi bằng reflection, hoặc managed stripping của Unity. Tôi thêm keep rules cho SDK liên quan, thêm `link.xml` cho phía C#, và giữ mapping file để đọc stack. Quan trọng là test bản release trên máy thật sớm vì Editor không bao giờ lộ lỗi này.
- `Mid` **Build Gradle báo "Duplicate class" thì anh xử lý thế nào?**
  → Hai thư viện kéo cùng một dependency với phiên bản khác nhau. Tôi chạy External Dependency Manager Resolve, xem cây dependency để biết thư viện nào kéo vào, rồi ép một phiên bản hoặc loại trừ module trong `mainTemplate.gradle`. Tránh sửa tay file Gradle được sinh vì Unity ghi đè.
- `Mid` **AndroidManifest bị gộp từ nhiều thư viện, xung đột thì làm sao?**
  → Tôi đọc `manifest-merger-report` để biết thuộc tính nào xung đột, rồi dùng `tools:replace` hoặc `tools:node="remove"` ở manifest chính để quyết định. Lý do cần cẩn thận là SDK quảng cáo hay tự thêm quyền mà tôi không muốn, ảnh hưởng đến khai Data safety.
- `Mid` **Quy trình đưa một bản iOS từ Unity lên TestFlight?**
  → Unity sinh project Xcode, Xcode ký bằng certificate và provisioning profile, archive rồi upload lên App Store Connect, build xử lý xong thì thêm tester nội bộ trong TestFlight. Tester ngoại bộ cần qua Beta Review ở bản đầu. Mọi chỉnh sửa Xcode project tôi làm trong post-process script vì Unity sinh lại sẽ ghi đè bản sửa tay.
- `Mid` **Certificate và provisioning profile khác nhau thế nào?**
  → Certificate chứng minh danh tính nhà phát triển, còn provisioning profile là giấy phép gắn certificate với bundle ID, thiết bị và capability cụ thể. Lỗi ký thường do profile hết hạn, thiếu capability như Push, hoặc certificate không khớp trên máy CI.
- `Mid` **Bitcode còn cần bật không?**
  → Không, Apple đã bỏ bitcode từ Xcode 14, nên khuyên bật nó là kiến thức cũ. Tôi nhắc điều này vì nhiều hướng dẫn cũ trên mạng vẫn bảo bật, và nếu SDK còn dùng bản có bitcode thì phải cập nhật.
- `Senior` **ATT là gì và khác consent GDPR thế nào?**
  → ATT là cơ chế của iOS: muốn lấy IDFA để quảng cáo cá nhân hoá phải hỏi bằng `ATTrackingManager`, người dùng từ chối thì IDFA là số 0. GDPR/UMP là consent theo luật khu vực, độc lập với ATT, nên tuỳ thị trường tôi có thể cần cả hai. Tôi bật ATT sau màn giải thích giá trị, vì tỉ lệ đồng ý phụ thuộc vào thời điểm hỏi.
- `Mid` **Privacy manifest của Apple là gì?**
  → Là file `PrivacyInfo.xcprivacy` khai các API nhạy cảm app và SDK dùng kèm lý do, cộng loại dữ liệu thu thập. Thiếu hoặc sai có thể bị từ chối khi nộp, và SDK bên thứ ba cũng phải có bản của họ, nên khi nâng cấp SDK tôi kiểm có kèm privacy manifest chưa.
- `Mid` **Anh gọi code Java Android từ C# thế nào?**
  → Qua JNI bằng `AndroidJavaClass` và `AndroidJavaObject`, lấy activity bằng `UnityPlayer.currentActivity`, và tác vụ UI phải `runOnUiThread`. Vì lỗi tên phương thức chỉ lộ lúc chạy, tôi bọc thành một lớp C# riêng có `#if UNITY_ANDROID && !UNITY_EDITOR` và bản giả cho Editor.
- `Mid` **Gọi code Objective-C từ Unity iOS thế nào?**
  → Viết file `.mm` trong `Plugins/iOS`, xuất hàm với `extern "C"`, và C# khai báo bằng `[DllImport("__Internal")]`. Chuỗi trả về từ native phải cấp phát bằng `strdup` để phía quản lý được, nếu không dễ rò hoặc crash.
- `Senior` **Native báo kết quả bất đồng bộ về Unity thế nào, và bẫy ở đâu?**
  → Cách đơn giản là `UnitySendMessage` với tên GameObject, tên phương thức và đúng một chuỗi, nên phải tuần tự hoá dữ liệu và GameObject phải còn tồn tại. Cách bền hơn là callback delegate (`MonoPInvokeCallback` ở iOS, `AndroidJavaProxy` ở Android). Callback có thể đến từ luồng khác, nên tôi chuyển về main thread trước khi đụng API Unity.
- `Mid` **External Dependency Manager (EDM4U) làm gì?**
  → Nó đọc file `*Dependencies.xml` của các SDK và giải quyết dependency Gradle cho Android, CocoaPods cho iOS. Tôi chạy Resolve sau khi thêm hoặc nâng SDK; build fail kiểu thiếu thư viện hay trùng phiên bản gần như luôn bắt đầu kiểm từ đây.
- `Mid` **Push notification hoạt động thế nào từ app tới người dùng?**
  → App xin quyền thông báo, nhận device token từ FCM (Android) hoặc APNs (iOS), gửi token lên server của tôi, rồi server gọi FCM/APNs để gửi. Token có thể đổi nên phải gửi lại khi refresh. Trên iOS còn cần capability Push và APNs key, thiếu một trong hai là không nhận được dù code đúng.
- `Junior` **Local notification khác push thế nào, dùng khi nào?**
  → Local notification được lên lịch ngay trên máy bằng package Mobile Notifications, không cần mạng hay server. Tôi dùng cho nhắc hồi năng lượng hay hết giờ xây dựng, vì thông tin đã biết trước ở client, trong khi push dùng cho sự kiện phát sinh từ server.
- `Mid` **Deep link và Universal Link khác nhau thế nào?**
  → Deep link kiểu URI scheme tuỳ biến dễ bị app khác chiếm tên. Universal Link (iOS) và App Links (Android) dùng domain https có xác minh qua file trên domain, nên an toàn hơn và rơi về web nếu chưa cài app. Unity nhận qua `Application.deepLinkActivated`.
- `Senior` **Luồng IAP đúng trên Android và iOS khác nhau chỗ nào?**
  → Google yêu cầu acknowledge giao dịch trong khoảng 3 ngày (tra lại số hiện hành), consumable phải consume, không thì tự hoàn tiền. Apple yêu cầu `finishTransaction`, chưa finish thì giao dịch gửi lại lần sau. Cả hai tôi trao hàng chỉ sau khi validate biên nhận ở server, vì tin cờ phía client là mở cửa cho gian lận.
- `Senior` **Giao dịch pending xử lý thế nào và vì sao quan trọng?**
  → Pending là thanh toán chờ duyệt, ví dụ phụ huynh phê duyệt hay trả tiền mặt tại cửa hàng. Tôi không trao hàng, lưu trạng thái, và xử lý khi store báo hoàn tất, kể cả khi app đã bị đóng giữa chừng và được mở lại. Nếu trao hàng ngay thì người chơi nhận quà rồi giao dịch bị huỷ.
- `Senior` **Người chơi refund thì anh thu hồi vật phẩm thế nào?**
  → Refund xảy ra ngoài app nên client không biết. Tôi nhận thông báo server-to-server của store (RTDN của Google, App Store Server Notifications của Apple) và thu hồi quyền lợi ở server. Với game offline hoàn toàn thì chấp nhận rủi ro có kiểm soát vì không có server để thu hồi.
- `Mid` **Gacha có yêu cầu gì từ store?**
  → Apple và Google yêu cầu công bố tỉ lệ rơi trước khi mua, và một số quốc gia hạn chế hoặc cấm loot box, nên tôi kiểm luật từng thị trường mục tiêu. Với studio Nhật tôi cũng để ý quy định tự điều tiết trong nước, vì tỉ lệ công bố phải khớp với tỉ lệ thật của server.
- `Mid` **Bản gửi review bị từ chối, anh làm gì?**
  → Đọc đúng lý do trong Resolution Center, sửa gốc rễ rồi trả lời kèm bằng chứng, không nộp lại y nguyên. Lý do hay gặp là crash khi review, thiếu nút restore purchases, privacy label khai không khớp SDK, quyền xin không có lý do. Để tránh, tôi chạy checklist cho từng bản trước khi nộp.
- `Senior` **Nếu game nhắm cả trẻ em thì khác gì?**
  → Chọn đúng nhãn đối tượng, hạn chế quảng cáo cá nhân hoá, chỉ dùng SDK được phép cho trẻ em và không thu thập định danh. Vì sai ở đây có thể bị gỡ khỏi store và dính luật như COPPA, tôi coi đây là quyết định sản phẩm làm từ đầu chứ không sửa sau.
- `Senior` **Crash native không có tên hàm, anh làm sao đọc?**
  → Stack chỉ là địa chỉ vì thiếu symbols. Trên Android tôi upload `symbols.zip` của đúng bản build lên Crashlytics hoặc dùng `ndk-stack` với `.so` có symbol; trên iOS upload dSYM. Quy tắc của tôi là CI lưu symbols cho từng bản build ngay lúc build, vì không lấy lại được sau khi mất.
- `Mid` **ANR là gì và tìm nguyên nhân thế nào?**
  → ANR là Android báo app không phản hồi khi main thread bị chặn quá lâu (khoảng 5 giây với input, tra lại số hiện hành). Tôi xem trace ANR trên Play Console hoặc Crashlytics để tìm I/O, lock hoặc SDK chạy trên main thread, rồi chuyển việc nặng sang luồng khác.
- `Senior` **Anh chọn thiết bị để test thế nào?**
  → Máy yếu nhất trong danh sách hỗ trợ (RAM thấp, GPU yếu), một máy mỗi hãng lớn vì skin và driver khác nhau, và iPhone cũ nhất còn hỗ trợ. Danh sách dựa trên thị phần thiết bị của chính game từ Firebase, rồi bổ sung farm cloud hoặc pre-launch report khi thiếu máy. Lý do chọn máy yếu là nó lộ OOM và throttling sớm nhất.
- `Junior` **Xem log từ máy thật thế nào?**
  → Android dùng `adb logcat` lọc tag `Unity`, iOS dùng console trong Xcode (Devices and Simulators). Cần Development Build để có stack C# đầy đủ. Tôi còn kết nối không dây để thử đúng cách người chơi cầm máy, vì cáp USB che lỗi sạc và nhiệt.

**Khung trả lời 60 giây** — "Anh có kinh nghiệm native Android/iOS không?"

> Nói thật thì tôi chưa viết một app native thuần bằng Kotlin hay Swift cho sản phẩm. Phần tôi làm nhiều là Unity ship lên Google Play và App Store: tự phát hành năm game nhiều năm, tích hợp AdMob, IAP, Firebase và Adjust, nên tôi thường xuyên đụng tầng native để cho nó chạy được. Cụ thể tôi quen mở Android Studio và Xcode để debug bản build, đọc logcat, xử lý lỗi Gradle trùng dependency, manifest merge, ký app, và viết hoặc sửa plugin cầu nối giữa C# với Java hay Objective-C. Tôi cũng đọc được crash native bằng symbols và dSYM. Chỗ tôi còn mỏng là thiết kế UI và kiến trúc app native từ đầu. Nếu vị trí cần, tôi sẽ học theo hướng làm một app nhỏ bằng Kotlin và Swift, vì tôi đã hiểu hệ điều hành bên dưới nên chỉ thiếu thư viện UI của họ.

**Họ sẽ đào tiếp**

- *"Anh kể một lần phải chui vào native để sửa lỗi?"* → Chọn một chuyện có chi tiết: lỗi Duplicate class, crash chỉ ở bản release do R8, hoặc plugin cầu nối; nêu triệu chứng, cách khoanh vùng, cách sửa, và bài học để lỗi không quay lại.
- *"Vì sao ở Unity bạn không viết native hết?"* → Một codebase cho hai nền tảng, tốc độ ra nội dung, và native chỉ dùng cho phần Unity không phủ; nêu đánh đổi (kích thước, hiệu năng, bảo trì hai bản).
- *"Plugin cầu nối viết thế nào, chạy luồng nào?"* → JNI/`DllImport`, chuyển callback về main thread Unity, bọc lớp C#, có bản giả cho Editor.
- *"Làm sao biết bản release đúng khi Editor không lộ lỗi?"* → Test bản IL2CPP Release trên máy thật sớm, CI build hằng đêm, Firebase Test Lab, soft launch ([[project-launch]]).
- *"Mất upload key hoặc keystore thì sao?"* → Có Play App Signing thì reset upload key qua Google; không có thì không cập nhật được; vì vậy sao lưu và phân quyền khoá.
- *"Crash 2% trên một dòng máy, anh làm gì?"* → Lọc theo thiết bị/OS/RAM trong Crashlytics, symbolicate, tái hiện trên máy thật, tắt tính năng cho nhóm máy đó trong lúc sửa.
- *"Cập nhật SDK mà store từ chối vì privacy?"* → Kiểm privacy manifest và khai báo Data safety/App Privacy khớp SDK, yêu cầu bản mới từ nhà cung cấp SDK.
- *"Học Kotlin/Swift bao lâu để làm được?"* → Đừng đưa số lớn; mô tả kế hoạch (app nhỏ, đọc tài liệu chính thức, đối chiếu với kiến thức hệ điều hành đã có) và mốc kiểm tra.

**Cờ đỏ**

- Nói "Unity lo hết, native không cần biết" khi vị trí ghi điểm cộng native.
- Khoe đã làm app native thuần mà không kể được một chi tiết cụ thể nào.
- Bảo "bật bitcode" hoặc nói API level cũ như chuẩn hiện tại.
- Lưu game ở `OnApplicationQuit` trên mobile rồi cho rằng đủ.
- Trao hàng IAP ngay khi client báo thành công, không validate ở server, không biết pending và refund.
- Không biết khác nhau giữa APK và AAB, hoặc giữa upload key và khoá ký cuối.
- Chỉ test trên máy mạnh của mình, không nhắc máy yếu nhất hay thermal throttling.
- Chê store hay Apple "khó tính" thay vì nói quy trình xử lý reject.
- Nói con số chính sách chắc như đinh mà không nhắc đã tra lại số hiện hành.

**Số / ví dụ nên thuộc**

- Ngân sách frame: **33,3ms** ở 30fps, **16,6ms** ở 60fps; mobile mặc định thường **30fps** nếu không đặt `targetFrameRate`.
- Pause: `OnApplicationPause(true)` là điểm lưu chắc nhất; `OnApplicationQuit` **không đáng tin** khi app bị kill ở nền.
- Android: **AAB** là bản nộp, Google sinh **APK** theo thiết bị; cần **ARM64**; ARMv7 thêm khoảng **40%** kích cỡ (con số từ [[interview-unity-tech]]).
- Google Play: acknowledge giao dịch trong khoảng **3 ngày**, target API theo mốc hằng năm, giới hạn kích thước base — **tra lại số hiện hành**.
- ANR: main thread bị chặn khoảng **5 giây** với input (tra lại số hiện hành).
- iOS: **bitcode đã bỏ** từ Xcode 14; ATT từ chối thì **IDFA = 0**; cần **privacy manifest**.
- Hai khoá ký Android: **upload key** (bạn giữ) và **khoá ký cuối** (Google giữ với Play App Signing).
- Công cụ: `adb logcat`, `ndk-stack`, Xcode Instruments, Firebase Crashlytics, EDM4U Resolve, Firebase Test Lab.
- Gọi native: Android `AndroidJavaObject` + `runOnUiThread`; iOS `.mm` + `extern "C"` + `DllImport("__Internal")`; callback `UnitySendMessage` chỉ truyền **một chuỗi**.
- Câu chuyện của riêng bạn: **lỗi native nào đã gỡ, đo/đọc bằng công cụ gì, kết quả ra sao** (build fail, reject, crash symbolicate).
