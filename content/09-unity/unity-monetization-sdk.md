---
title: SDK kiếm tiền — quảng cáo, IAP, đo lường
icon: 💳
summary: Mediation, vòng đời một lần hiện rewarded, consent GDPR/ATT, acknowledge hoá đơn trong 3 ngày, và build hell do EDM4U — nhóm SDK mà một lỗi nhỏ làm mất tiền thật hoặc khoá tài khoản.
status: deep
read: 785
level: intermediate
order: 185
tags: [unity, monetization, ads, iap, analytics, mobile]
related: [unity-third-party, unity-build-platform, liveops, economy-design, unity-debug-crash]
---

SDK kiếm tiền khác mọi thư viện khác ở ba điểm, và cả ba đều đắt: chúng **đụng native** nên kéo theo Gradle và CocoaPods; chúng bị **chính sách store và luật quyền riêng tư** chi phối nên sai là bị gỡ app chứ không phải bị lỗi biên dịch; và chúng dính thẳng vào **doanh thu** nên một callback đặt sai chỗ là mất tiền thật mỗi ngày mà không ai thấy trong log. Node này là phần thực chiến; phần *nên kiếm tiền thế nào* nằm ở [[economy-design]] và [[liveops]].

## Ba nhóm, và thứ tự nên tích hợp

| Nhóm | Việc | Lựa chọn phổ biến | Tích hợp lúc nào |
|---|---|---|---|
| **Đo lường** | Biết người chơi rớt ở đâu, bản nào ổn định | Firebase Analytics, GameAnalytics; Adjust/AppsFlyer cho attribution | **Sớm nhất** — không có số thì mọi quyết định sau đều mù |
| **IAP** | Bán vật phẩm, gói, subscription | Unity IAP (`com.unity.purchasing`) | Khi đã có thứ đáng bán |
| **Quảng cáo + mediation** | Doanh thu từ người không trả tiền | AdMob (+ UMP), AppLovin MAX, Unity LevelPlay | Cuối, vì nó nặng nhất và khó gỡ nhất |

Thứ tự này không phải sở thích: SDK quảng cáo là thứ **khó rút ra nhất** sau khi đã vào, vì mediation kéo theo hàng chục adapter native. Chọn nền tảng mediation gần như là quyết định một chiều — đổi sau khi phát hành tốn hàng tuần.

## Mediation: vì sao không dùng một mạng duy nhất

Một mạng quảng cáo không bao giờ lấp hết inventory của bạn: **fill rate** và **eCPM** đổi theo vùng, theo giờ, theo mùa. Mediation là một SDK mẹ gọi nhiều mạng con qua **adapter**, chọn ra giá tốt nhất cho từng lượt hiển thị.

Hai cơ chế cần phân biệt được khi bị hỏi:

- **Waterfall** — xếp các mạng theo thứ tự giá dự kiến, gọi lần lượt cho tới khi có mạng nhận. Đơn giản, nhưng giá là *dự kiến* nên thường bỏ sót giá tốt, và mỗi tầng trượt là thêm độ trễ.
- **In-app bidding** — mọi mạng cùng trả giá theo thời gian thực cho đúng lượt đó, giá cao nhất thắng. Chuẩn hiện tại; tốt hơn cả về doanh thu lẫn độ trễ.

Cái giá của mediation nằm ở chỗ ít ai nói: **mỗi adapter là một thư viện native**, nên mọi vấn đề ở [[unity-third-party]] — trùng thư viện, xung đột Gradle, `minSdk` bị đẩy lên — đều nhân lên theo số mạng bạn bật.

## Vòng đời một lần hiện rewarded

Đây là thứ được hỏi nhiều nhất, vì nó là chỗ **mất tiền và mất lòng tin** dễ nhất:

| Thời điểm | Việc phải làm | Hỏng thì thấy gì |
|---|---|---|
| Sớm, trước khi cần | **Preload** quảng cáo; nạp lại sau mỗi lần hiện | Bấm nút xong chờ 4 giây rồi không có gì — người chơi tưởng game treo |
| Trước khi hiện | Kiểm tra đã nạp xong chưa; có đường lui nếu chưa | Nút "xem quảng cáo nhận thưởng" bấm không ăn |
| Lúc hiện | **Dừng game và tắt tiếng**: `Time.timeScale = 0` **không** dừng audio — phải `AudioListener.pause = true`; khoá input | Nhạc game chồng lên tiếng quảng cáo; nhân vật chết trong lúc xem |
| Nhận thưởng | **Chỉ** trao trong callback "người dùng đã nhận thưởng" | Trao ở `OnAdClosed` = ai đóng sớm cũng có thưởng, và bạn trả tiền cho lượt không hoàn tất |
| Trước khi trao | Ghi **phần thưởng chờ** xuống đĩa, rồi mới trao và xoá | App bị kill giữa lúc trao: người chơi xem xong mà mất thưởng — loại review một sao khó gỡ nhất |
| Sau khi đóng | Bật lại timeScale và audio, preload lượt kế | Game đứng im sau khi đóng quảng cáo |

Hai chi tiết kỹ thuật hay bị bỏ qua: callback của SDK native **có thể không đến trên main thread** — mọi thứ chạm tới API Unity phải được đẩy về main thread; và quảng cáo đã nạp có **hạn sử dụng** (thường khoảng một giờ), nên preload từ lúc mở app rồi để đó là nạp hỏng.

## Consent, ATT và chính sách — phần làm bị gỡ app

- **Consent trước, init sau.** Ở khu vực áp dụng GDPR, form consent (UMP của AdMob hoặc CMP của mediation) phải chạy **trước khi** khởi tạo SDK quảng cáo. Init trước rồi mới hỏi là vi phạm, và không sửa được bằng bản vá nội dung.
- **ATT trên iOS**: `ATTrackingManager.RequestTrackingAuthorization` cần khoá `NSUserTrackingUsageDescription` trong `Info.plist`. Thiếu khoá đó thì **app crash ngay khi gọi**, và App Store từ chối. Gọi sau khi app đã active, thường sau một màn hình giải thích ngắn — hỏi đúng lúc là khác biệt vài chục phần trăm tỉ lệ đồng ý.
- **SKAdNetwork**: khai danh sách `SKAdNetworkItems` trong `Info.plist` theo đúng danh sách mạng mediation cung cấp. Thiếu thì mất dữ liệu phân bổ, mà không có lỗi nào báo.
- **Privacy manifest (iOS)** và **Data safety (Play Console)** phải **khớp với thứ SDK thật sự thu thập** — đây là khai báo pháp lý, không phải thủ tục.
- **Game cho trẻ em** có luật riêng (COPPA, Families Policy): phải gắn cờ child-directed cho SDK, và nhiều mạng quảng cáo không dùng được.
- **Test ads là bắt buộc.** Dùng ad unit test hoặc đăng ký thiết bị test. **Bấm vào quảng cáo thật trong lúc phát triển là đường ngắn nhất tới khoá tài khoản AdMob** — tai nạn kinh điển, và nó khoá cả tài khoản chứ không chỉ một app.
- **app-ads.txt** đặt trên domain khai trong store listing, để mạng xác minh inventory là của bạn.

## IAP: năm điều phải đúng

1. **Xác thực hoá đơn phía server.** Kiểm tra ở client chỉ là gợi ý — mọi thứ có giá trị thật đều phải được server xác nhận với store trước khi ghi vào tài khoản người chơi. Cùng lý do với "không tin client" ở [[unity-multiplayer]].
2. **Acknowledge đúng hạn.** Trên Google Play, giao dịch không được xác nhận (consumable thì `consume`, còn lại thì `acknowledge`) trong **ba ngày** sẽ **tự động hoàn tiền** — người chơi mất đồ, bạn mất doanh thu, và không có lỗi nào trong log của bạn.
3. **Giao dịch chờ (pending/deferred)** là trạng thái thật: thẻ quà tặng, thanh toán chậm, "gia đình phê duyệt" trên iOS. Trao đồ khi chưa hoàn tất là cho không.
4. **Nút khôi phục mua hàng.** iOS **bắt buộc** với sản phẩm không tiêu hao; thiếu là bị từ chối duyệt.
5. **Hoàn tiền sau khi đã tiêu.** Người chơi có thể mua, tiêu hết, rồi xin hoàn tiền. Cần server ghi nhận và một chính sách thu hồi — quyết định kinh doanh, nhưng phải có đường kỹ thuật để làm.

Test IAP luôn tốn thời gian hơn dự kiến: tài khoản sandbox trên iOS, license tester trên Google, sản phẩm phải được duyệt trước, và giá theo vùng phải kiểm riêng.

## Build và hiệu năng

- **EDM4U** (External Dependency Manager) là nguồn lỗi build số một của nhóm này: nhiều SDK mang theo bản riêng, giữ **bản mới nhất** rồi *Force Resolve*. Lỗi điển hình là `Duplicate class` lúc dựng Gradle.
- **`minSdk` bị đẩy lên** bởi một adapter, khiến máy đời cũ mất khỏi thị trường của bạn — kiểm tra trước khi bật thêm mạng.
- **SDK init không được chặn khởi động.** Init bất đồng bộ sau frame đầu tiên và đo thời gian init: SDK quảng cáo là một trong những nguồn ANR quen mặt nhất, xem [[unity-debug-crash]].
- **Video quảng cáo ngốn RAM.** Trên máy yếu, xem một video rồi quay lại game là lúc app hay bị hệ điều hành kill — nếu đo thấy đúng dạng đó, đừng đi tìm rò rỉ trong gameplay.
- Bật thêm một mạng mediation thường làm **build phình thêm vài chục MB** và tăng thời gian build đáng kể.

## Bẫy lộ ra sau khi phát hành

- Thưởng trao ở `OnAdClosed` thay vì callback nhận thưởng — doanh thu thấp hơn hẳn kỳ vọng mà không ai hiểu vì sao.
- Không có phần thưởng chờ lưu xuống đĩa: mất thưởng khi app bị kill giữa chừng.
- Quảng cáo chen quá dày hoặc chen ngay sau khi mở app: vừa vi phạm chính sách, vừa giết retention.
- Quên tắt `AudioListener.pause` sau khi đóng quảng cáo — game im tiếng vĩnh viễn cho tới khi khởi động lại.
- Consent form chỉ hiện ở EU nhưng không test được vì máy dev không ở EU — phải ép bằng chế độ debug geography của SDK.

## Kiểm tra nhanh

- [ ] Thưởng trao **chỉ** trong callback nhận thưởng, và có phần thưởng chờ lưu xuống đĩa
- [ ] `Time.timeScale = 0` **và** `AudioListener.pause = true` khi quảng cáo hiện; bật lại cả hai khi đóng
- [ ] Chạy bằng **ad unit test** trên mọi máy dev; không ai từng bấm quảng cáo thật
- [ ] Consent chạy **trước** khi init SDK quảng cáo; đã test bằng chế độ giả lập khu vực
- [ ] `NSUserTrackingUsageDescription` và `SKAdNetworkItems` có trong `Info.plist`
- [ ] Hoá đơn được xác thực ở server; giao dịch được acknowledge trong 3 ngày
- [ ] Có nút khôi phục mua hàng
- [ ] Init SDK không nằm trên đường khởi động; đã đo thời gian init trên máy yếu

## 🤖 Prompt cho AI

**Dùng AI thế nào cho SDK kiếm tiền**

Chia rõ hai vùng. Vùng **giao được**: lớp bọc quanh SDK (interface, hàng đợi phần thưởng chờ, marshal callback về main thread, cooldown giữa hai lần hiện), code lưu/khôi phục phần thưởng, và checklist trước phát hành. Đây là code thuần C#, kiểm chứng bằng test được, và không phụ thuộc phiên bản SDK nếu bạn định nghĩa interface trước.

Vùng **không giao**: chọn nền tảng mediation (quyết định một chiều, phụ thuộc thị trường và hợp đồng), **quyết định về consent và quyền riêng tư** (rủi ro pháp lý, luật đổi theo khu vực và theo thời điểm — dữ liệu huấn luyện của model luôn cũ), và logic **xác thực hoá đơn** phía server (bảo mật; sai là mất tiền hoặc bị lạm dụng). Ở ba chỗ đó, AI hữu ích nhất khi làm người soát: *"đây là luồng của tôi, chỉ ra chỗ nào có thể mất thưởng hoặc trao thưởng hai lần"*.

Một đặc thù đáng nhớ: API của plugin quảng cáo **đổi khá nhiều giữa các bản lớn**, và model trộn lẫn chúng. Mọi prompt phải có số hiệu phiên bản, và tốt nhất là dán kèm đoạn tài liệu của đúng bản đó.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Tên SDK **và số hiệu phiên bản**, cộng phiên bản Unity.
- Nền tảng: Android, iOS, hay cả hai (quyết định ATT, SKAdNetwork, Gradle).
- Loại quảng cáo: rewarded, interstitial, banner — vòng đời khác nhau hoàn toàn.
- Game có dừng khi quảng cáo hiện không, và audio xử lý thế nào.
- Phần thưởng có giá trị thật không (có thì phải qua server, không thì lưu local là đủ).
- Đối tượng người chơi có gồm trẻ em không — đổi cả bộ luật áp dụng.

**Mẫu prompt**

```
Unity 6, Android + iOS, rewarded video qua mediation. Viết RewardedAdService:
- Bọc sau interface IAdService của tôi: <dán>
- Chỉ trao thưởng trong callback "user earned reward", KHÔNG trao ở OnAdClosed
- Ghi phần thưởng chờ xuống đĩa TRƯỚC khi trao; khởi động lại app thì trao nốt
- Pause game: Time.timeScale = 0 và AudioListener.pause = true; khôi phục cả hai
  kể cả khi quảng cáo lỗi hoặc bị đóng bất thường
- Callback SDK có thể không ở main thread: đẩy về main thread trước khi chạm Unity API
- Cooldown tối thiểu giữa hai lần hiện: tham số, mặc định 30 giây

Ràng buộc: KHÔNG gọi thẳng API SDK ngoài file adapter. Liệt kê mọi trạng thái lỗi
bạn xử lý (chưa nạp, nạp hỏng, mất mạng, người chơi đóng sớm, app bị kill giữa chừng).
```

**Bẫy thường gặp:** AI viết `Time.timeScale = 0` khi quảng cáo hiện rồi đặt lại `= 1` trong callback đóng — đúng trong trường hợp thường, và **treo game vĩnh viễn** khi quảng cáo lỗi hoặc callback đóng không bao giờ tới (chuyện xảy ra thật với một số adapter). Luật phải viết vào prompt: **khôi phục trạng thái ở một chỗ duy nhất, gọi được nhiều lần không sao, và có timeout**. Bẫy anh em của nó: quên `AudioListener.pause = false`, game im tiếng cho tới khi khởi động lại — và lỗi này không bao giờ xuất hiện trong Editor vì bạn test bằng quảng cáo giả.

## 💻 Code

Demo dựng `RewardedAdService` **chạy được ngay không cần SDK nào**: phần SDK thật nằm sau `IRewardedAdProvider`, và bản demo dùng một provider giả có độ trễ nạp. Bên trong là đúng bốn thứ hay làm sai: chỉ trao thưởng ở callback nhận thưởng, phần thưởng chờ ghi xuống đĩa trước khi trao, khôi phục trạng thái một chỗ duy nhất có timeout, và callback được đẩy về main thread.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 320" role="img" aria-label="Sơ đồ dòng thời gian một lần hiện rewarded và Inspector của RewardedAdService">
  <rect x="10" y="10" width="640" height="128" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Dòng thời gian một lần hiện rewarded</text>
  <line x1="10" y1="42" x2="650" y2="42" class="fig-line"/>
  <line x1="40" y1="86" x2="620" y2="86" class="fig-line"/>
  <circle cx="70" cy="86" r="5" fill="#6ea8fe"/>
  <text x="48" y="68" class="fig-muted" font-size="10">preload</text>
  <text x="44" y="106" class="fig-muted" font-size="10">sớm, nạp lại</text>
  <text x="48" y="118" class="fig-muted" font-size="10">sau mỗi lần</text>
  <circle cx="200" cy="86" r="5" fill="#ffd43b"/>
  <text x="168" y="68" class="fig-label" font-size="10">người chơi bấm</text>
  <text x="160" y="106" class="fig-muted" font-size="10">timeScale = 0</text>
  <text x="160" y="118" class="fig-muted" font-size="10">AudioListener.pause</text>
  <circle cx="340" cy="86" r="5" fill="#51cf9b"/>
  <text x="300" y="68" class="fig-label" font-size="10">earned reward</text>
  <text x="286" y="106" class="fig-label" font-size="10">ghi pending xuống đĩa</text>
  <text x="300" y="118" class="fig-muted" font-size="10">RỒI mới trao</text>
  <circle cx="470" cy="86" r="5" fill="#ff8787"/>
  <text x="440" y="68" class="fig-muted" font-size="10">ad closed</text>
  <text x="420" y="106" class="fig-muted" font-size="10">KHÔNG trao thưởng ở đây</text>
  <circle cx="590" cy="86" r="5" fill="#6ea8fe"/>
  <text x="556" y="68" class="fig-muted" font-size="10">resume</text>
  <text x="540" y="106" class="fig-muted" font-size="10">một chỗ duy nhất</text>
  <text x="548" y="118" class="fig-muted" font-size="10">+ timeout 60s</text>
  <rect x="10" y="148" width="310" height="162" rx="8" class="fig-box"/>
  <text x="22" y="170" class="fig-label" font-size="13" font-weight="600">Hierarchy  (scene Boot)</text>
  <line x1="10" y1="180" x2="320" y2="180" class="fig-line"/>
  <text x="22" y="200" class="fig-muted" font-size="12">▾ Systems</text>
  <rect x="26" y="208" width="286" height="20" rx="4" fill="#51cf9b" opacity="0.18"/>
  <text x="34" y="223" class="fig-label" font-size="12" font-weight="600">RewardedAdService</text>
  <text x="34" y="244" class="fig-muted" font-size="11">CrashContext, SaveService…</text>
  <line x1="10" y1="256" x2="320" y2="256" class="fig-line"/>
  <text x="22" y="276" class="fig-muted" font-size="11">Provider thật cắm vào chỗ duy nhất:</text>
  <text x="22" y="292" class="fig-label" font-size="11">IRewardedAdProvider</text>
  <text x="22" y="306" class="fig-muted" font-size="10">Demo dùng FakeRewardedAdProvider.</text>
  <rect x="336" y="148" width="314" height="162" rx="8" class="fig-box"/>
  <text x="348" y="170" class="fig-label" font-size="13" font-weight="600">Inspector</text>
  <line x1="336" y1="180" x2="650" y2="180" class="fig-line"/>
  <rect x="344" y="188" width="298" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="352" y="201" class="fig-label" font-size="12" font-weight="600">Rewarded Ad Service (Script)</text>
  <text x="358" y="220" class="fig-muted" font-size="11">Cooldown Seconds</text><text x="560" y="220" class="fig-label" font-size="11">30</text>
  <text x="358" y="236" class="fig-muted" font-size="11">Show Timeout Seconds</text><text x="560" y="236" class="fig-label" font-size="11">60</text>
  <text x="358" y="252" class="fig-muted" font-size="11">Use Fake Provider</text><text x="560" y="252" class="fig-label" font-size="11">☑ (bỏ tick khi cắm SDK)</text>
  <text x="358" y="268" class="fig-muted" font-size="11">Fake Load Seconds</text><text x="560" y="268" class="fig-label" font-size="11">1.5</text>
  <text x="358" y="284" class="fig-muted" font-size="11">Fake Result</text><text x="560" y="284" class="fig-label" font-size="11">Rewarded ▾</text>
  <text x="352" y="304" class="fig-muted" font-size="10">Đổi Fake Result để thử nhánh lỗi mà không cần SDK.</text>
</svg>
<figcaption>Provider giả cho phép test đủ năm nhánh — nhận thưởng, đóng sớm, chưa nạp, nạp hỏng, callback không bao giờ tới — ngay trong Editor.</figcaption>
</figure>

**Script**

```csharp
// IAdService.cs — hợp đồng của BẠN. Gameplay chỉ biết file này.
using System;

public enum AdResult { Rewarded, Dismissed, NotReady, Failed }

/// Phần SDK thật cắm vào đây. Callback CÓ THỂ đến từ thread khác.
public interface IRewardedAdProvider
{
    bool IsLoaded { get; }
    void Load();
    void Show(Action<AdResult> onFinished);
}

public interface IAdService
{
    bool CanShowRewarded { get; }
    /// onGranted(true) chỉ được gọi khi người chơi THẬT SỰ nhận thưởng.
    void ShowRewarded(string rewardId, Action<bool> onGranted);
}
```

```csharp
// RewardedAdService.cs — Unity 6. Đặt trên "Systems" ở scene Boot.
// Chạy được ngay với provider giả; cắm SDK thật bằng cách thay MakeProvider().
using System;
using System.Collections;
using System.Collections.Concurrent;
using UnityEngine;

public class RewardedAdService : MonoBehaviour, IAdService
{
    const string PendingKey = "ads.pending_reward";

    [SerializeField] float cooldownSeconds = 30f;
    [SerializeField] float showTimeoutSeconds = 60f;
    [SerializeField] bool useFakeProvider = true;
    [SerializeField] float fakeLoadSeconds = 1.5f;
    [SerializeField] AdResult fakeResult = AdResult.Rewarded;

    /// Bắn ra khi một phần thưởng được xác nhận — kể cả phần thưởng chờ từ phiên trước.
    public event Action<string> RewardGranted;

    IRewardedAdProvider provider;
    readonly ConcurrentQueue<Action> mainThread = new();   // callback SDK -> main thread
    float nextAllowedShow;
    bool showing;
    Coroutine timeoutRoutine;

    public bool CanShowRewarded => provider != null && provider.IsLoaded
                                   && !showing && Time.unscaledTime >= nextAllowedShow;

    void Awake()
    {
        provider = MakeProvider();
        provider.Load();
        GrantPendingFromDisk();            // app bị kill giữa lúc trao ở phiên trước
    }

    void Update()
    {
        while (mainThread.TryDequeue(out var action)) action();
    }

    public void ShowRewarded(string rewardId, Action<bool> onGranted)
    {
        if (!CanShowRewarded) { onGranted?.Invoke(false); return; }   // nút phải tự mờ trước đó

        showing = true;
        PauseForAd(true);
        timeoutRoutine = StartCoroutine(FailSafe(rewardId, onGranted));

        provider.Show(result =>
            // Callback có thể ở thread khác: KHÔNG chạm API Unity ở đây.
            mainThread.Enqueue(() => Finish(result, rewardId, onGranted)));
    }

    void Finish(AdResult result, string rewardId, Action<bool> onGranted)
    {
        if (!showing) return;                                  // đã xử lý bởi timeout
        showing = false;
        if (timeoutRoutine != null) { StopCoroutine(timeoutRoutine); timeoutRoutine = null; }

        if (result == AdResult.Rewarded)
        {
            // Ghi xuống đĩa TRƯỚC khi trao: app bị kill ngay lúc này vẫn không mất thưởng.
            PlayerPrefs.SetString(PendingKey, rewardId);
            PlayerPrefs.Save();
            RewardGranted?.Invoke(rewardId);
            PlayerPrefs.DeleteKey(PendingKey);
            PlayerPrefs.Save();
        }

        nextAllowedShow = Time.unscaledTime + cooldownSeconds;
        PauseForAd(false);
        provider.Load();                                       // nạp sẵn cho lượt sau
        onGranted?.Invoke(result == AdResult.Rewarded);
    }

    /// Có adapter không bao giờ gọi callback đóng. Không có nhánh này thì game treo vĩnh viễn.
    IEnumerator FailSafe(string rewardId, Action<bool> onGranted)
    {
        yield return new WaitForSecondsRealtime(showTimeoutSeconds);
        Debug.LogWarning("[Ads] quảng cáo không phản hồi sau " + showTimeoutSeconds + "s — khôi phục trạng thái");
        timeoutRoutine = null;
        Finish(AdResult.Failed, rewardId, onGranted);
    }

    /// MỘT chỗ duy nhất đổi trạng thái game, gọi nhiều lần không sao.
    void PauseForAd(bool paused)
    {
        Time.timeScale = paused ? 0f : 1f;
        AudioListener.pause = paused;      // timeScale = 0 KHÔNG dừng audio
    }

    void GrantPendingFromDisk()
    {
        var pending = PlayerPrefs.GetString(PendingKey, "");
        if (string.IsNullOrEmpty(pending)) return;
        Debug.Log("[Ads] trao nốt phần thưởng chờ từ phiên trước: " + pending);
        RewardGranted?.Invoke(pending);
        PlayerPrefs.DeleteKey(PendingKey);
        PlayerPrefs.Save();
    }

    IRewardedAdProvider MakeProvider()
    {
        // Cắm SDK thật ở ĐÚNG một dòng này; phần trên không đổi.
        // return new AdMobRewardedProvider(adUnitId);
        return new FakeRewardedAdProvider(this, fakeLoadSeconds, fakeResult);
    }
}
```

```csharp
// FakeRewardedAdProvider.cs — provider giả: chạy và test đủ mọi nhánh mà không cần SDK.
using System;
using System.Collections;
using UnityEngine;

public sealed class FakeRewardedAdProvider : IRewardedAdProvider
{
    readonly MonoBehaviour host;
    readonly float loadSeconds;
    readonly AdResult result;

    public bool IsLoaded { get; private set; }

    public FakeRewardedAdProvider(MonoBehaviour host, float loadSeconds, AdResult result)
    { this.host = host; this.loadSeconds = loadSeconds; this.result = result; }

    public void Load()
    {
        IsLoaded = false;
        host.StartCoroutine(LoadRoutine());
    }

    IEnumerator LoadRoutine()
    {
        // Realtime: lúc này timeScale có thể đang bằng 0 vì quảng cáo trước chưa đóng.
        yield return new WaitForSecondsRealtime(loadSeconds);
        IsLoaded = true;
    }

    public void Show(Action<AdResult> onFinished)
    {
        IsLoaded = false;
        if (result == AdResult.Failed) { onFinished(AdResult.Failed); return; }
        host.StartCoroutine(ShowRoutine(onFinished));
    }

    IEnumerator ShowRoutine(Action<AdResult> onFinished)
    {
        yield return new WaitForSecondsRealtime(2f);              // "đang xem quảng cáo"
        if (result == AdResult.NotReady) yield break;             // giả lập adapter KHÔNG BAO GIỜ
                                                                  // gọi callback -> thử nhánh timeout
        onFinished(result);
    }
}
```

**Chạy thử** — năm nhánh, không cần cài SDK nào:

1. `Fake Result = Rewarded`: gọi `ShowRewarded("gold_100", ok => Debug.Log(ok))`. Sau 2 giây: Console in `True`, `Time.timeScale` về 1, `AudioListener.pause` về false. Bật một bản nhạc trước khi thử — phải **im tiếng trong lúc quảng cáo** rồi có lại.
2. `Fake Result = Dismissed`: `onGranted(false)`, **không** có phần thưởng nào — đây là nhánh mà code trao thưởng ở `OnAdClosed` sẽ trao nhầm.
3. `Fake Result = Failed`: lỗi ngay lập tức, trạng thái game vẫn được khôi phục.
4. `Fake Result = NotReady` + hạ `Show Timeout Seconds` xuống 5: quảng cáo không bao giờ trả lời, sau 5 giây failsafe in cảnh báo và **game chạy lại** thay vì treo vĩnh viễn. Đây là nhánh cứu bạn khỏi một bản phát hành hỏng.
5. **Phần thưởng chờ**: dừng Play, chạy `PlayerPrefs.SetString("ads.pending_reward", "gold_100")` (một MenuItem debug là đủ), rồi Play lại từ scene Boot — Console in `trao nốt phần thưởng chờ từ phiên trước`. Đó là mô phỏng đúng tình huống app bị kill ngay sau khi người chơi xem xong.

Kiểm tra thêm bằng Profiler: trong lúc "quảng cáo" hiện, `Time.timeScale` bằng 0 mà coroutine failsafe vẫn đếm — vì nó dùng `WaitForSecondsRealtime`. Dùng `WaitForSeconds` ở đây là đứng đợi vĩnh viễn, và đó là một bug rất khó nhìn ra khi đọc code.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | Rewarded, interstitial, banner khác nhau thế nào? |
| Junior | Tích hợp quảng cáo vào game Unity gồm những bước gì? |
| Mid | Người chơi xem hết quảng cáo mà không nhận được thưởng. Nguyên nhân? |
| Mid | Mediation là gì? Vì sao không dùng một mạng duy nhất? |
| Senior | Doanh thu rewarded thấp hơn hẳn số lượt hiển thị. Anh tìm ở đâu? |
| Senior | Xác thực hoá đơn IAP ở đâu, và vì sao? |

**Khung trả lời 60 giây** — "Luồng hiện một rewarded của anh thế nào?"

> Preload sớm và nạp lại sau mỗi lần hiện, vì quảng cáo đã nạp có hạn sử dụng. Lúc hiện thì dừng game **và tắt tiếng** — `Time.timeScale = 0` không dừng audio, phải `AudioListener.pause = true`, đây là lỗi rất hay gặp vì trong Editor test bằng quảng cáo giả thì không ai nghe thấy gì.
>
> Phần quan trọng nhất là **chỉ trao thưởng trong callback "người dùng đã nhận thưởng"**, không trao ở sự kiện đóng quảng cáo — trao ở đó nghĩa là ai đóng sớm cũng có thưởng, còn bạn vẫn trả tiền cho lượt không hoàn tất. Và trước khi trao, tôi ghi **phần thưởng chờ xuống đĩa** rồi mới trao rồi mới xoá: app bị kill đúng lúc đó là chuyện có thật, và "xem xong mà mất thưởng" là loại review một sao khó gỡ nhất.
>
> Cuối cùng là hai thứ phòng thủ: khôi phục trạng thái ở **một chỗ duy nhất** gọi nhiều lần không sao, kèm **timeout** — có adapter không bao giờ gọi callback đóng, và không có nhánh đó thì game treo vĩnh viễn. Callback SDK cũng có thể không ở main thread nên phải đẩy về trước khi chạm API Unity.

**Họ sẽ đào tiếp**

- *"Doanh thu thấp hơn số lượt hiển thị?"* → Nghi theo thứ tự: trao thưởng sai chỗ nên đếm lượt "hoàn tất" nhiều hơn thực tế; **eCPM theo vùng** (cùng một lượt xem ở các thị trường khác nhau chênh nhiều lần); fill rate thấp nên nhiều lượt không có quảng cáo; hoặc mediation đang chạy waterfall cũ thay vì bidding. Số cần so là **doanh thu trên mỗi DAU**, không phải số impression.
- *"Consent làm thế nào?"* → Form consent phải chạy **trước khi init SDK quảng cáo** ở khu vực áp dụng GDPR — init trước rồi mới hỏi là vi phạm. Trên iOS còn có ATT: cần `NSUserTrackingUsageDescription` trong `Info.plist`, thiếu khoá đó là **crash ngay khi gọi**. Và test consent phải ép bằng chế độ giả lập khu vực của SDK, vì máy dev không ở EU.
- *"Xác thực hoá đơn?"* → **Ở server.** Kiểm ở client chỉ là gợi ý; ai sửa được bộ nhớ thì cũng "mua" được. Kèm hai thứ hay quên: trên Google Play, giao dịch không được acknowledge trong **ba ngày** sẽ tự hoàn tiền — người chơi mất đồ, bạn mất doanh thu, và log của bạn sạch sẽ; còn iOS **bắt buộc** có nút khôi phục mua hàng, thiếu là bị từ chối duyệt.
- *"Build hỏng sau khi thêm SDK?"* → EDM4U trùng bản là nguyên nhân số một — giữ bản mới nhất rồi Force Resolve. Sau đó: `minSdk` bị adapter đẩy lên, template Gradle tự sửa đã cũ, và thư viện native chưa hỗ trợ yêu cầu page size mới của Android.
- *"Tài khoản AdMob bị khoá vì gì?"* → Bấm vào quảng cáo thật trong lúc phát triển. Luôn dùng ad unit test hoặc thiết bị test đã đăng ký — và nói cho cả đội, kể cả QA, vì khoá là khoá **cả tài khoản**, không chỉ một app.

**Cờ đỏ**

- Trao thưởng ở `OnAdClosed`.
- Không có timeout khi hiện quảng cáo.
- `Time.timeScale = 0` mà không tắt audio.
- "Cứ để client kiểm hoá đơn cho nhanh."
- Không biết vì sao game của mình cần mediation, hoặc chọn mạng theo tên tuổi chứ không theo fill rate ở thị trường của mình.
- Nhét quảng cáo chen ngay sau khi mở app, hoặc quá dày — vi phạm chính sách và giết retention.

**Số / ví dụ nên thuộc**

- Google Play: acknowledge trong **3 ngày**, không thì tự hoàn tiền.
- Quảng cáo đã nạp thường hết hạn sau khoảng **một giờ** — preload rồi để đó là nạp hỏng.
- `AudioListener.pause = true` — thứ `timeScale = 0` không làm.
- Hai khoá bắt buộc trong `Info.plist`: `NSUserTrackingUsageDescription`, `SKAdNetworkItems`.
- Bật thêm một mạng mediation: build thường phình **vài chục MB**.
