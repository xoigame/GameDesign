---
title: LiveOps — vận hành game sau khi phát hành
icon: 📡
summary: Remote config, feature flag, sự kiện theo lịch và A/B test — bộ máy cho phép sửa số, tắt tính năng hỏng và đổi nội dung mà không chờ store duyệt.
status: deep
read: 565
level: intermediate
order: 35
tags: [production, liveops, analytics, mobile, operations]
related: [playtesting-metrics, economy-design, data-driven-design, progression, unity-addressables]
---

Với game mobile, ngày phát hành không phải vạch đích mà là **vạch xuất phát**: phần lớn doanh thu và gần như toàn bộ việc giữ chân người chơi diễn ra sau đó. LiveOps là bộ máy để thay đổi game **khi người chơi đang chơi** — và câu hỏi đầu tiên của nó rất cụ thể: *một con số sai được phát hiện lúc 9 giờ sáng thì tới mấy giờ người chơi hết chịu ảnh hưởng?* Có LiveOps thì câu trả lời là 15 phút. Không có thì là ba ngày, tính cả thời gian store duyệt.

## Bốn trụ

| Trụ | Cho phép làm gì | Không có thì |
|---|---|---|
| **Remote config** | Đổi số (giá, drop rate, thời lượng sự kiện) không cần build | Mọi cân bằng phải chờ bản mới |
| **Nội dung tải về** | Thêm màn, skin, sự kiện qua CDN — xem [[unity-addressables]] | Nội dung mới = nộp store lại |
| **Analytics + funnel** | Biết chỗ người chơi rời đi, biết sự kiện có hiệu quả không | Quyết định bằng cảm giác |
| **Feature flag / kill switch** | Tắt một tính năng hỏng trong vài phút | Một bug IAP sống ba ngày |

Thứ tự dựng cũng nên là thứ tự đó. Đội hay bị cám dỗ làm A/B test trước khi có kill switch — tức là có khả năng thử nghiệm mà chưa có khả năng dừng.

## Feature flag là phanh, không phải tiện ích

Mỗi tính năng có rủi ro (IAP, sự kiện, hệ thống mới, SDK quảng cáo) nên nằm sau một cờ bật/tắt từ xa. Ba luật để cờ không trở thành nợ:

1. **Mặc định an toàn.** Không tải được config (mất mạng, server sập) thì game phải chạy theo giá trị mặc định đóng trong build, **không** treo ở màn hình chờ. Đây là lỗi hay gặp nhất và nó biến sự cố nhỏ của server thành game không mở được.
2. **Cờ có hạn sử dụng.** Tính năng ổn định rồi thì xoá cờ. Một dự án hai năm với 80 cờ còn sống là 2^80 tổ hợp trạng thái mà không ai test nổi.
3. **Bật dần, không bật hết.** 5% → theo dõi một giờ → 50% → 100%. Chỉ số cần nhìn khi mở dần: crash-free, thời lượng phiên, và chỉ số kinh tế của đúng tính năng đó.

## Chỉ số: ít mà hiểu, hơn nhiều mà không dùng

Bộ tối thiểu, và điều quan trọng là **biết mỗi cái trả lời câu hỏi gì**:

| Chỉ số | Trả lời câu hỏi | Bẫy khi đọc |
|---|---|---|
| **D1 / D7 / D30 retention** | Người chơi có lý do quay lại không | D1 tốt mà D7 tệ = onboarding ổn nhưng game không có chiều sâu |
| **Thời lượng và số phiên/ngày** | Game hợp với nhịp sống của họ không | Phiên dài chưa chắc tốt: có thể là grind bắt buộc |
| **Funnel onboarding theo bước** | Người chơi rớt ở bước nào | Phải chia theo dòng máy — rớt nhiều ở máy yếu thường là hiệu năng, không phải thiết kế |
| **ARPDAU / conversion** | Kinh tế có chạy không | Tăng do một nhóm nhỏ chi nhiều có thể che việc mất người chơi thường |
| **Crash-free sessions** | Bản này có ổn định không | Luôn nhìn **trước** mọi chỉ số khác: bản hỏng làm mọi số liệu khác vô nghĩa |

Quy tắc thực dụng: mỗi chỉ số phải có **người chịu trách nhiệm** và **ngưỡng cảnh báo**. Chỉ số không ai nhìn là chi phí không lợi ích.

## A/B test làm cho đúng

Sai lầm phổ biến không phải ở công cụ mà ở kỷ luật. Năm điều kiện, thiếu một là kết quả không dùng được:

1. **Một biến mỗi lần.** Đổi cùng lúc giá gói và phần thưởng ngày đầu thì thắng cũng không biết nhờ cái nào.
2. **Phân nhóm ổn định theo id người chơi**, giữ nguyên suốt thử nghiệm. Phân nhóm theo phiên là cách để cùng một người thấy hai giá khác nhau — vừa sai số liệu vừa mất lòng tin.
3. **Chạy trọn chu kỳ tuần.** Hành vi cuối tuần khác hẳn ngày thường; một thử nghiệm ba ngày chỉ đo được ba ngày đó.
4. **Định trước chỉ số quyết định và chỉ số bảo vệ.** Ví dụ: quyết định bằng conversion, bảo vệ bằng D7 retention — tăng doanh thu mà mất người chơi là thua.
5. **Không nhìn giữa chừng rồi dừng khi thấy có lợi.** Ngó liên tục và dừng đúng lúc đang thắng là cách chắc chắn để tin vào nhiễu.

Với game nhỏ, thành thật mà nói: lượng người chơi thường **không đủ** để A/B test có ý nghĩa thống kê. Lúc đó thứ trung thực hơn là so sánh theo mốc thời gian có ghi chú rõ ("đổi drop rate ngày 12/3") và đọc xu hướng, chứ không phải giả vờ có kết quả kiểm định.

## Sự kiện: nhịp và chi phí thật

Lịch sự kiện là thứ giữ nhịp cho game live, nhưng nó là **chi phí vận hành lặp lại**, không phải một lần. Trước khi hứa "sự kiện mỗi tuần", tính thật: mỗi sự kiện cần nội dung, cân bằng, QA, ảnh quảng bá, và một người trực khi nó chạy. Đội kiệt sức vì lịch sự kiện là cách phổ biến để giết một game đang sống.

Quy trình một sự kiện, rút gọn:

1. Nội dung và số liệu chuẩn bị trước ít nhất một nhịp (đang chạy sự kiện này thì sự kiện sau đã sẵn sàng).
2. QA trên môi trường staging **với đồng hồ tua tới ngày sự kiện** — lỗi múi giờ và lỗi "sự kiện không tự kết thúc" chỉ lộ ra ở đây.
3. Bật cho 5%, theo dõi một giờ, rồi mở hết.
4. Có sẵn **đường tắt**: kill switch cho chính sự kiện đó.
5. Hồi cứu sau sự kiện: số liệu so với dự đoán, ghi lại cho lần sau. Sự kiện không có bước 5 sẽ lặp lại đúng sai lầm cũ.

## Rủi ro riêng của LiveOps

- **Version skew.** Người chơi nằm rải ở nhiều bản app; config mới phải an toàn với **bản cũ nhất còn sống**. Thêm một trường mà bản cũ không hiểu là chấp nhận được; đổi ý nghĩa một trường cũ là tai nạn.
- **Config sai gây hại nhanh hơn code sai**, vì nó tới tay mọi người trong vài phút và không qua vòng duyệt nào. Phải có schema validate và bản ghi ai đổi gì lúc nào.
- **Kinh tế trôi.** Mỗi sự kiện phát thêm tài nguyên; không có drain tương ứng thì lạm phát và mọi giá trị cũ mất nghĩa — xem [[economy-design]].
- **Nợ dữ liệu.** Event analytics đặt tên tuỳ hứng trong sáu tháng sẽ thành một kho không truy vấn nổi. Đặt quy ước tên ngay từ đầu.

## Kiểm tra nhanh

- [ ] Mọi giá trị cân bằng quan trọng đọc được từ remote config, có **giá trị mặc định trong build**
- [ ] Game chạy bình thường khi **không tải được config**
- [ ] Mỗi tính năng rủi ro có kill switch, đã thử tắt thật một lần
- [ ] Bật dần theo phần trăm, không bật 100% ngay
- [ ] Mỗi chỉ số có người chịu trách nhiệm và ngưỡng cảnh báo
- [ ] Quy ước đặt tên event analytics viết ra thành tài liệu
- [ ] Sự kiện được QA với đồng hồ tua tới đúng ngày, và có kiểm tra tự kết thúc

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc vận hành live**

Ba việc giao được ngay, đều là loại "nhiều chi tiết, dễ kiểm": **viết schema config** kèm giá trị mặc định và ràng buộc; **viết lớp đọc config** có fallback, cache offline và validate; và **soát danh sách event analytics** cho nhất quán tên, tham số, đơn vị. Việc thứ ba bị đánh giá thấp nhưng trả lãi trong sáu tháng.

Việc **không** giao: quyết định nội dung sự kiện, mức thưởng, và diễn giải số liệu. AI sẵn sàng nói "tăng drop rate lên 15% sẽ cải thiện retention" với giọng rất tự tin và **không có dữ liệu nào** — nó đang tạo ra một câu nghe hợp lý, không phải một kết luận. Với số liệu, chỉ dùng nó để kiểm tra cách đọc của mình: *"những cách giải thích nào khác cho việc D7 tăng cùng lúc tôi đổi hai thứ?"*

Một chỗ nó giúp thật nhiều: viết **checklist hồi cứu sau sự kiện** và chuẩn bị các câu hỏi phản biện trước khi bạn quyết định — vai trò người soát, không phải người quyết.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Nền tảng config (Firebase Remote Config, Unity Remote Config, server tự viết) và giới hạn của nó.
- **Bản app cũ nhất còn sống** — quyết định config được phép đổi gì.
- Hành vi khi mất mạng: dùng cache cũ hay dùng mặc định trong build.
- Config được áp lúc nào: ngay lập tức, hay chỉ ở ranh giới màn chơi (rất quan trọng — đổi giá giữa trận là lỗi).
- Quy mô người chơi thật, nếu định nói tới A/B test.

**Mẫu prompt**

```
Unity 6, mobile, dùng Firebase Remote Config. Bản app cũ nhất còn sống: 1.2.0.
Viết lớp GameConfig:
- Đọc ~20 giá trị (giá gói, drop rate, thời lượng sự kiện, cờ tính năng)
- Mặc định NẰM TRONG BUILD; mất mạng thì dùng cache gần nhất, không có cache
  thì dùng mặc định — KHÔNG BAO GIỜ treo màn hình chờ
- Validate: giá trị ngoài khoảng cho phép thì bỏ qua, ghi cảnh báo, dùng mặc định
- Chỉ áp giá trị mới ở ranh giới màn chơi, không áp giữa trận
- Có chế độ override tại chỗ cho QA (đọc file JSON local trong bản Development)
Nêu rõ điều gì xảy ra nếu server trả về một trường mà bản 1.2.0 không biết.
```

**Bẫy thường gặp:** AI viết lớp config `await` lấy giá trị từ server **ngay trong luồng khởi động** và không có nhánh timeout — trong Editor với mạng tốt thì mượt, còn ngoài thực tế, một lần server chậm là toàn bộ người chơi kẹt ở màn hình loading, và bạn không sửa được bằng cách đẩy config mới vì họ có vào nổi đâu mà nhận. Luật phải viết vào prompt: **khởi động không bao giờ phụ thuộc mạng**; config tới muộn thì áp ở ranh giới màn chơi kế tiếp.

## 🎮 Unity

Điểm mấu chốt trong Unity: **config là dữ liệu bất đồng bộ có thể không bao giờ tới**, nên mọi hệ thống phải đọc nó qua một lớp có giá trị mặc định — và giá trị mới chỉ được áp ở ranh giới màn chơi.

**Component & nơi đặt**
- `GameConfig.cs` — service trong Boot scene, sống suốt phiên (xem [[unity-game-loop]]).
- `DefaultConfig` (ScriptableObject) — `Assets/_Project/Settings/DefaultConfig.asset`: **nguồn chân lý khi offline**, và cũng là tài liệu về những khoá đang tồn tại.
- `ConfigOverride.json` — file local chỉ đọc ở bản Development, để QA ép giá trị mà không cần server.

**Code**

```csharp
// GameConfig.cs — Unity 6. Mặc định trong build, cache khi offline, áp ở ranh giới màn chơi.
using System.Collections.Generic;
using UnityEngine;

public class GameConfig : MonoBehaviour
{
    public static GameConfig Instance { get; private set; }

    [SerializeField] DefaultConfig defaults;          // ScriptableObject: giá trị an toàn
    Dictionary<string, string> active = new();        // đang dùng
    Dictionary<string, string> pending;               // vừa tải, chờ ranh giới màn chơi

    void Awake()
    {
        if (Instance != null && Instance != this) { Destroy(gameObject); return; }
        Instance = this; DontDestroyOnLoad(gameObject);
        active = defaults.ToDictionary();             // chạy được NGAY, không đợi mạng
        FetchAsync();                                 // không await: khởi động không phụ thuộc mạng
    }

    public float GetFloat(string key, float fallback)
    {
        if (active.TryGetValue(key, out var raw) && float.TryParse(raw, out var v)) return v;
        return fallback;                              // khoá lạ hoặc giá trị hỏng: fallback, không ném
    }

    public bool IsEnabled(string flag) => GetFloat(flag, 0f) > 0.5f;

    /// Gọi ở màn hình loading / menu — KHÔNG gọi giữa trận.
    public void ApplyPendingAtBoundary()
    {
        if (pending == null) return;
        active = pending; pending = null;
        Debug.Log("[Config] đã áp cấu hình mới ở ranh giới màn chơi");
    }

    async void FetchAsync()
    {
        try
        {
            var fetched = await RemoteConfigService.FetchAsync(destroyCancellationToken); // SDK thật ở đây
            pending = Validate(fetched);              // chỉ nhận giá trị hợp lệ
        }
        catch (System.Exception e)
        {
            Debug.LogWarning("[Config] không tải được, dùng mặc định/cache: " + e.Message);
        }
    }

    Dictionary<string, string> Validate(Dictionary<string, string> raw)
    {
        var ok = new Dictionary<string, string>(active);
        foreach (var kv in raw)
        {
            if (!defaults.Knows(kv.Key)) continue;                 // khoá bản này không biết: bỏ qua
            if (!defaults.InRange(kv.Key, kv.Value))               // ngoài khoảng cho phép: giữ cũ
            { Debug.LogWarning($"[Config] {kv.Key}={kv.Value} ngoài khoảng, bỏ qua"); continue; }
            ok[kv.Key] = kv.Value;
        }
        return ok;
    }
}
```

**Bẫy Unity cụ thể**
- `await` lấy config **trong luồng khởi động**: một lần server chậm là toàn bộ người chơi kẹt ở màn hình loading — và bạn không đẩy config sửa lỗi tới họ được, vì họ chưa vào nổi game.
- Áp giá trị mới **giữa trận**: giá đổi giữa lúc người chơi đang mở shop, hoặc drop rate đổi giữa màn. Luôn gom vào `pending` rồi áp ở ranh giới.
- Đọc config trong `Awake` của hệ thống khác mà không đảm bảo `GameConfig` đã `Awake` trước → giá trị mặc định của C# (0) lọt vào gameplay. Dùng `[DefaultExecutionOrder]` hoặc để hệ thống khác đọc ở `Start`.
- Lưu cache config vào `PlayerPrefs` rồi quên version: bản app mới đọc lại cache của bản cũ. Cache phải kèm phiên bản app.
- Ép kiểu bằng `float.Parse` không `TryParse`: server gõ nhầm dấu phẩy thập phân là exception ngay lúc khởi động trên đúng những locale nhất định.

**Kiểm tra nhanh**
- Bật chế độ máy bay rồi mở game từ trạng thái vừa cài: phải vào được tới gameplay bằng giá trị mặc định.
- Đặt một khoá về giá trị vô lý trên server (giá âm): game phải bỏ qua, ghi cảnh báo, và vẫn chạy.
- Đổi config trong lúc đang chơi: số liệu **không** được đổi giữa trận; vào lại menu thì đổi.
- Tắt một feature flag: tính năng biến mất hoàn toàn ở lần vào màn kế, không để lại nút bấm chết.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Remote config dùng để làm gì? Cho ví dụ.**
  → Để đổi **số** mà không cần ra bản mới: giá gói, tỉ lệ rơi, thời lượng sự kiện, ngưỡng độ khó. Ví dụ thật: hạ giá gói khởi đầu trong cuối tuần, hoặc giảm HP một con boss mà 70% người chơi kẹt ở đó. Ranh giới cần thuộc: config đổi **số**, đổi **logic** thì vẫn phải ra bản mới.
- `Junior` **Feature flag là gì và vì sao cần?**
  → Là công tắc tắt/bật một tính năng từ xa. Tôi coi nó là **phanh**, không phải tiện ích: mọi thứ có rủi ro tiền bạc hay dữ liệu đều nằm sau một cờ tắt được từ xa. Và cờ đó phải được **thử tắt thật** ít nhất một lần trước khi phát hành — cờ chưa bao giờ tắt thử thì chưa phải là phanh.
- `Junior` **Không tải được config thì game làm gì?**
  → Chạy bằng **giá trị mặc định đóng trong build**, không bao giờ treo ở màn hình chờ. Mất mạng, server sập, người chơi ở vùng chặn — tất cả đều phải chơi được. Treo ở màn hình chờ vì không tải được một file JSON là cách tự biến sự cố nhỏ của mình thành sự cố toàn bộ người chơi.
- `Mid` **Chỉ số nào anh nhìn hằng ngày cho một game đang live?**
  → **Crash-free sessions** trước tiên — dưới 99% là có vấn đề, và bản hỏng làm mọi số khác vô nghĩa. Rồi D1/D7, thời lượng phiên, ARPDAU, và funnel onboarding **chia theo dòng máy**: rớt nhiều ở máy yếu thường là hiệu năng chứ không phải thiết kế.
- `Mid` **Vì sao config sai còn nguy hơn code sai?**
  → Vì nó tới tay mọi người trong vài phút và **không qua vòng duyệt nào**. Ba lớp bảo vệ tối thiểu: schema validate phía client (giá trị ngoài khoảng thì bỏ qua và dùng mặc định), bật dần theo phần trăm **5% → 50% → 100%** với ít nhất một giờ mỗi bậc, và nhật ký ai đổi gì lúc nào.
- `Mid` **Sự kiện hằng tuần tốn gì mà đội hay quên tính?**
  → Chi phí **lặp lại**: mỗi sự kiện cần nội dung, cân bằng, QA với đồng hồ tua tới đúng ngày, ảnh quảng bá, và người trực. Cộng thêm một chi phí kinh tế: mỗi sự kiện phát thêm tài nguyên, nên phải có drain tương ứng, nếu không thì sau ba tháng kinh tế lạm phát và mọi giá trong shop mất nghĩa.
- `Senior` **Thiết kế một A/B test cho giá gói khởi đầu — anh làm thế nào?**
  → Một biến duy nhất. Phân nhóm **ổn định theo id người chơi**, không theo phiên — nếu không cùng một người sẽ thấy hai giá. Chạy trọn chu kỳ tuần. Định trước chỉ số quyết định (conversion) **và** chỉ số bảo vệ (D7 retention), vì tăng doanh thu mà mất người chơi là thua. Và không nhìn giữa chừng rồi dừng lúc đang thắng.
- `Senior` **Lượng người chơi không đủ để có ý nghĩa thống kê thì sao?**
  → Nói thẳng là không đủ mẫu, rồi so theo mốc thời gian có ghi chú thay vì giả vờ có kiểm định. Cái tệ hơn cả việc không test là test rồi tin vào một kết quả nhiễu — nó khoá đội vào một quyết định sai kèm cảm giác đã có bằng chứng.
- `Senior` **Config mới làm game bản cũ crash. Phòng bằng cách nào?**
  → Đây là **version skew**: người chơi nằm rải ở nhiều bản app, nên config phải an toàn với bản cũ nhất còn sống. Thêm trường mới thì bản cũ bỏ qua — không sao. **Đổi ý nghĩa một trường cũ** mới là tai nạn, vì bản cũ vẫn diễn giải theo cách cũ. Luật của tôi: chỉ thêm trường, không tái sử dụng tên cũ cho nghĩa mới.

**Khung trả lời 60 giây** — "Giá một gói IAP bị sai, phát hiện lúc 9 giờ sáng?"

> Câu hỏi quyết định là hệ thống có **remote config** hay không. Có thì: sửa giá trị, đẩy cho **5%** trước, xác nhận đúng trên thiết bị thật rồi mở 100% — tổng cộng khoảng 15 phút; song song đó dựng danh sách người chơi đã mua nhầm để bù. Không có thì phải ra bản mới và chờ store duyệt, tức là hai tới ba ngày sống chung với lỗi — lúc đó việc cần làm là **tắt** gói đó bằng kill switch nếu có, hoặc chấp nhận và chuẩn bị kịch bản đền bù.
>
> Đó cũng là lý do tôi coi feature flag là **phanh**, không phải tiện ích: mọi thứ có rủi ro tiền bạc hay dữ liệu đều nằm sau một cờ tắt được từ xa, và cờ đó phải được thử tắt thật ít nhất một lần trước khi phát hành.
>
> Kèm theo là luật an toàn: mất mạng hoặc server sập thì game chạy bằng **giá trị mặc định đóng trong build**, không bao giờ treo ở màn hình chờ.

**Họ sẽ đào tiếp**

- *"Config sai còn nguy hơn code sai?"* → Đúng, vì nó tới tay mọi người trong vài phút và **không qua vòng duyệt nào**. Nên cần schema validate phía client (giá trị ngoài khoảng thì bỏ qua và dùng mặc định), bật dần theo phần trăm, và nhật ký ai đổi gì lúc nào.
- *"Version skew?"* → Người chơi nằm rải ở nhiều bản app, nên config phải an toàn với **bản cũ nhất còn sống**. Thêm trường mới thì bản cũ bỏ qua — không sao. Đổi *ý nghĩa* một trường cũ mới là tai nạn, vì bản cũ vẫn diễn giải theo cách cũ.
- *"A/B test cho giá?"* → Một biến duy nhất; phân nhóm ổn định theo id người chơi (không theo phiên, nếu không cùng một người sẽ thấy hai giá); chạy trọn chu kỳ tuần; định trước chỉ số quyết định (conversion) **và** chỉ số bảo vệ (D7 retention) — tăng doanh thu mà mất người chơi là thua; và không nhìn giữa chừng rồi dừng lúc đang thắng. Nếu lượng người chơi không đủ thì tôi nói thẳng là không đủ mẫu và so theo mốc thời gian có ghi chú, thay vì giả vờ có kiểm định.
- *"Chỉ số hằng ngày?"* → Crash-free sessions trước tiên — bản hỏng làm mọi số khác vô nghĩa. Rồi D1/D7, thời lượng phiên, ARPDAU, và funnel onboarding **chia theo dòng máy**: rớt nhiều ở máy yếu thường là hiệu năng chứ không phải thiết kế.
- *"Sự kiện hằng tuần?"* → Tính chi phí lặp lại trước khi hứa: mỗi sự kiện cần nội dung, cân bằng, QA với **đồng hồ tua tới đúng ngày**, ảnh quảng bá, và người trực. Và mỗi sự kiện phát thêm tài nguyên, nên phải có drain tương ứng nếu không muốn kinh tế lạm phát.

**Cờ đỏ**

- Game treo ở màn hình chờ khi không tải được config.
- Đẩy config cho 100% người chơi ngay lần đầu.
- Không phân biệt "đổi số" (config) với "đổi logic" (phải ra bản mới).
- Đọc ARPDAU tăng là thành công mà không nhìn retention.
- 80 feature flag còn sống sau hai năm, không ai dám xoá.

**Số / ví dụ nên thuộc**

- Bật dần: **5% → 50% → 100%**, theo dõi ít nhất một giờ ở mỗi bậc.
- Crash-free sessions: < 99% là có vấn đề; ≥ 99.5% là ổn định.
- A/B test: một biến, phân nhóm theo id, trọn chu kỳ tuần, có chỉ số bảo vệ.
- Không có LiveOps: vòng sửa lỗi là **2–3 ngày** (chờ store duyệt) thay vì 15 phút.
