---
id: unity-network-client
title: Lớp gọi backend từ Unity
summary: Một ApiClient duy nhất — timeout, retry có backoff và jitter, token tự refresh, idempotency key giữ qua lần mở lại app, và hàng đợi cho lệnh không được phép mất.
status: deep
read: 762
level: intermediate
order: 62
tags: [unity, network, api, retry, token]
related: [unity-multiplayer, project-contract, client-server-flow, unity-save-data]
---

Đây **không phải** netcode. [[unity-multiplayer]] nói về đồng bộ trận đấu — NGO, Mirror, tick rate, prediction. Node này nói về thứ mọi game có server đều cần, kể cả game không có multiplayer: **gọi API backend của chính mình**.

Phần lớn dự án bắt đầu bằng một `UnityWebRequest` viết thẳng trong màn shop. Sáu tháng sau có bốn mươi chỗ như thế, mỗi chỗ xử lý lỗi một kiểu, và không chỗ nào retry đúng.

Luật: **một cửa duy nhất ra khỏi client.** Mọi request đi qua nó.

## Một cửa, năm trách nhiệm

| Trách nhiệm | Vì sao không để mỗi nơi tự làm |
|---|---|
| Base URL theo môi trường | Đổi sang staging phải sửa bốn mươi chỗ |
| Timeout | Mặc định của Unity quá dài; người chơi nhìn vòng xoay 30 giây rồi tắt app |
| Retry có backoff | Mỗi nơi tự retry thì lúc server quá tải cả client cùng dội vào |
| Token và refresh | Bốn mươi chỗ cùng gặp 401 thì bốn mươi lần refresh song song |
| Map lỗi sang thông báo | Người chơi thấy chuỗi lỗi kỹ thuật |

Cụ thể trong Unity, thêm hai thứ nữa mà backend không phải lo: **request phải huỷ được khi đổi scene**, và **callback phải chạy trên main thread** — đụng vào `GameObject` từ thread khác là lỗi ngay.

## Retry: chỉ ba nhóm, và phải có jitter

Retry mù là cách tự tạo ra sự cố. Quy tắc bám theo bảng mã lỗi ở [[project-contract]]:

| Nhóm lỗi | Retry? | Cách |
|---|---|---|
| Mất mạng, timeout, 5xx, `TEMP_*` | **Có** | Backoff 1s → 2s → 4s, tối đa 3 lần, **cộng jitter ngẫu nhiên 0–500ms** |
| `RATE_*` | Có | Chờ đúng `retry_after` server trả về, không tự đoán |
| `AUTH_*` | Một lần | Refresh token rồi thử lại đúng **một** lần |
| `ECON_*`, `VERSION_*`, `BUG_*` | **Không** | Retry không bao giờ làm nó khỏi |

Jitter là phần hay bị bỏ và nó quan trọng hơn vẻ ngoài. Không có jitter, khi server chập chờn 5 giây thì **toàn bộ client cùng retry đúng giây thứ 1, thứ 3, thứ 7** — server vừa gượng dậy đã bị dội tiếp. Đây là hiệu ứng bầy đàn, và một dòng random chặn được nó.

Với lệnh đổi ví tiền, retry **chỉ được phép khi request mang idempotency key**. Không có key thì thà báo lỗi còn hơn trừ tiền hai lần.

## Token: một chỗ refresh, mọi chỗ chờ

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Sơ đồ xử lý token hết hạn: nhiều request cùng nhận lỗi 401, chỉ một request thực hiện refresh, các request còn lại xếp hàng chờ rồi thử lại bằng token mới">
  <defs>
    <marker id="unc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="14"  y="30"  width="128" height="40" rx="8" class="fig-box"/>
    <rect x="14"  y="90"  width="128" height="40" rx="8" class="fig-box"/>
    <rect x="14"  y="150" width="128" height="40" rx="8" class="fig-box"/>
    <rect x="216" y="76"  width="164" height="68" rx="9" class="fig-box"/>
    <rect x="450" y="30"  width="196" height="54" rx="9" class="fig-box"/>
    <rect x="450" y="140" width="196" height="54" rx="9" class="fig-box"/>
  </g>
  <text x="78"  y="55"  text-anchor="middle" class="fig-muted" font-size="11">GET /me → 401</text>
  <text x="78"  y="115" text-anchor="middle" class="fig-muted" font-size="11">GET /shop → 401</text>
  <text x="78"  y="175" text-anchor="middle" class="fig-muted" font-size="11">POST /buy → 401</text>
  <text x="298" y="100" text-anchor="middle" class="fig-label" font-size="12">Cổng refresh</text>
  <text x="298" y="122" text-anchor="middle" class="fig-muted" font-size="10">chỉ MỘT lần gọi thật</text>
  <text x="548" y="52"  text-anchor="middle" class="fig-label" font-size="12">POST /auth/refresh</text>
  <text x="548" y="70"  text-anchor="middle" class="fig-muted" font-size="10">đúng một request bay đi</text>
  <text x="548" y="162" text-anchor="middle" class="fig-label" font-size="12">Thử lại cả ba</text>
  <text x="548" y="180" text-anchor="middle" class="fig-muted" font-size="10">bằng token mới, mỗi cái một lần</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#unc-a)" fill="none">
    <path d="M142 50  Q180 50  180 96  H212"/>
    <path d="M142 110 H212"/>
    <path d="M142 170 Q180 170 180 124 H212"/>
    <path d="M380 96  Q416 96  416 57 H446"/>
    <path d="M380 124 Q416 124 416 167 H446"/>
  </g>
  <text x="298" y="212" text-anchor="middle" class="fig-muted" font-size="10">Không có cổng này: ba refresh song song, hai cái làm token của cái thứ ba hết hiệu lực</text>
</svg>
<figcaption>Bão refresh là lỗi kinh điển và nó chỉ lộ ra khi nhiều màn hình cùng tải một lúc — tức là đúng lúc vào game.</figcaption>
</figure>

Ba luật cho token:

1. **Refresh token lưu bằng cơ chế an toàn nhất nền tảng cho phép**, không phải `PlayerPrefs`. Access token thì để trong RAM là đủ, mất cũng không sao.
2. **Chỉ một request refresh tại một thời điểm.** Cái thứ hai chờ kết quả của cái thứ nhất.
3. **Refresh thất bại thì về màn đăng nhập**, không thử lại vô hạn. Refresh token hết hạn hoặc bị thu hồi là trạng thái bình thường, không phải sự cố.

## Hàng đợi cho lệnh không được phép mất

Một số hành động không được rơi khi mạng chập chờn: nhận thưởng hằng ngày, chốt kết quả màn chơi, xác nhận hoàn tất hướng dẫn. Với chúng, thêm một lớp nữa:

- Ghi hành động **xuống đĩa** kèm idempotency key, **trước khi** gửi.
- Gửi. Thành công thì xoá khỏi hàng đợi.
- App mở lại mà hàng đợi còn mục nào thì gửi lại — cùng key, nên server không thực hiện hai lần.

Điểm mấu chốt là key phải **sống qua lần khởi động lại app**, nên nó nằm trong file hàng đợi chứ không phải trong RAM. Cách ghi file an toàn ở [[unity-save-data]].

Đừng đưa mọi request vào hàng đợi. Chỉ những lệnh mà mất đi thì người chơi thiệt thật.

## Bẫy lộ ra khi build

- **`UnityWebRequest` không được `Dispose`** — rò bộ nhớ native, không hiện trong Profiler managed.
- **Callback đụng UI sau khi scene đã đổi** — `MissingReferenceException` ngẫu nhiên, rất khó tái hiện. Huỷ mọi request đang bay khi đổi scene.
- **IL2CPP strip class model JSON** không được tham chiếu tĩnh. Giữ lại bằng `link.xml` — cùng loại lỗi mô tả ở [[unity-save-data]].
- **WebGL không cho đặt một số header** và không có thread; mọi thứ phải là coroutine hoặc async đúng cách.
- **Chứng chỉ tự ký ở staging** làm request im lặng thất bại trên thiết bị thật.
- **Timeout mặc định quá dài.** Đặt 10 giây cho request thường, 30 giây cho tải file lớn.

## Kiểm tra nhanh

- [ ] Mọi request đi qua đúng một lớp
- [ ] Timeout đặt rõ ràng, không dùng mặc định
- [ ] Retry có backoff **và jitter**, chỉ cho nhóm lỗi tạm thời
- [ ] Lệnh đổi ví tiền luôn mang idempotency key, key sống qua lần mở lại app
- [ ] Chỉ một refresh token tại một thời điểm
- [ ] Request bị huỷ khi đổi scene
- [ ] Thử với mạng giả 150ms và 5% mất gói, không phải WiFi văn phòng

## 🤖 Prompt cho AI

**Dùng AI thế nào cho lớp network phía client**

Đây là loại code **có khuôn mẫu rõ ràng nhưng nhiều chi tiết dễ quên** — hợp với AI, miễn là bạn liệt kê đủ ràng buộc. Giao cho nó viết khung `ApiClient`, wrapper cho từng endpoint, và test với mock.

Việc **không** giao: quyết định lệnh nào cần idempotency key, lệnh nào vào hàng đợi. Đó là quyết định nghiệp vụ, và AI đoán sai theo hướng nguy hiểm — nó hay retry mọi thứ.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Unity bản nào** và có dùng UniTask hay không — quyết định coroutine hay async/await.
- **Nền tảng đích**: WebGL thì không thread, không đặt được vài header.
- **Nhóm mã lỗi của server** — không có thì nó retry mọi lỗi.
- **Lệnh nào là lệnh tiền** — phải nói thẳng để nó gắn idempotency key.
- **Có cần hàng đợi ghi xuống đĩa không.**

**Mẫu prompt**

```
Unity 6 (6000.x), không dùng UniTask, target Android + WebGL.
Server trả lỗi theo nhóm: AUTH_*, VERSION_*, ECON_*, RATE_*, TEMP_*, BUG_*.
Lệnh đổi ví tiền: /buy, /claim-reward, /finish-match.

Việc: viết một class ApiClient duy nhất, MonoBehaviour singleton, dùng UnityWebRequest.
Yêu cầu:
- Timeout 10s; retry chỉ với TEMP_*, timeout và lỗi mạng: 1s/2s/4s + jitter 0–500ms, tối đa 3 lần.
- RATE_* thì chờ đúng retry_after. AUTH_* thì refresh token rồi thử lại ĐÚNG MỘT lần.
- ECON_*, VERSION_*, BUG_* KHÔNG retry.
- Chỉ một refresh chạy tại một thời điểm; request khác chờ kết quả đó.
- Ba endpoint tiền ở trên bắt buộc nhận idempotency key từ bên gọi.
- Huỷ mọi request đang bay khi đổi scene. Dispose đầy đủ.

Ràng buộc:
- KHÔNG thêm thư viện ngoài.
- KHÔNG tự retry endpoint tiền khi thiếu idempotency key — ném lỗi rõ ràng.
- Callback phải chạy trên main thread.
```

**Bẫy thường gặp:** AI retry mọi lỗi vì "cho chắc" — kể cả lỗi không đủ tiền. Bẫy thứ hai: nó bỏ jitter, và code nhìn vẫn đúng cho tới ngày server chập chờn. Bẫy thứ ba: nó refresh token ngay trong từng request, tạo bão refresh khi nhiều màn hình cùng tải. Bẫy thứ tư: quên `Dispose`, vì đoạn mẫu trên mạng thường quên.

## 💻 Code

Demo dựng một `ApiClient` tối giản nhưng đủ luật: timeout, backoff có jitter, chỉ một refresh, và idempotency key cho lệnh tiền. Chạy được với bất kỳ endpoint HTTP nào trả JSON.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 260" role="img" aria-label="Hierarchy có GameObject tên ApiClient chứa script ApiClient, và Inspector hiện các trường Base Url, Timeout Seconds, Max Retries, Jitter Ms">
  <g class="fig-box-g">
    <rect x="14"  y="30" width="230" height="200" rx="9" class="fig-box"/>
    <rect x="268" y="30" width="378" height="200" rx="9" class="fig-box"/>
  </g>
  <text x="129" y="52"  text-anchor="middle" class="fig-label" font-size="12">Hierarchy</text>
  <text x="40"  y="84"  class="fig-muted" font-size="11">▾ SampleScene</text>
  <text x="56"  y="110" class="fig-label" font-size="11">◆ ApiClient</text>
  <text x="72"  y="132" class="fig-muted" font-size="10">ApiClient.cs</text>
  <text x="56"  y="162" class="fig-muted" font-size="11">◆ DemoCaller</text>
  <text x="72"  y="184" class="fig-muted" font-size="10">DemoCaller.cs</text>
  <text x="40"  y="214" class="fig-muted" font-size="9">ApiClient tự DontDestroyOnLoad</text>
  <text x="457" y="52"  text-anchor="middle" class="fig-label" font-size="12">Inspector — ApiClient</text>
  <text x="292" y="86"  class="fig-muted" font-size="11">Base Url</text>
  <text x="470" y="86"  class="fig-label" font-size="11">http://localhost:8080</text>
  <text x="292" y="116" class="fig-muted" font-size="11">Timeout Seconds</text>
  <text x="470" y="116" class="fig-label" font-size="11">10</text>
  <text x="292" y="146" class="fig-muted" font-size="11">Max Retries</text>
  <text x="470" y="146" class="fig-label" font-size="11">3</text>
  <text x="292" y="176" class="fig-muted" font-size="11">Max Jitter Ms</text>
  <text x="470" y="176" class="fig-label" font-size="11">500</text>
  <text x="292" y="210" class="fig-muted" font-size="9">Base Url trỏ tới mock server; đổi sang staging chỉ sửa đúng ô này</text>
</svg>
<figcaption>Hai GameObject rỗng. ApiClient là singleton sống xuyên scene; DemoCaller chỉ để bấm thử.</figcaption>
</figure>

**Script**

```csharp
// ApiClient.cs — một cửa duy nhất ra khỏi client.
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class ApiClient : MonoBehaviour
{
    public static ApiClient I { get; private set; }

    [SerializeField] string baseUrl = "http://localhost:8080";
    [SerializeField] int timeoutSeconds = 10;
    [SerializeField] int maxRetries = 3;
    [SerializeField] int maxJitterMs = 500;

    string accessToken;
    string refreshToken = "demo-refresh-token";
    bool refreshing;

    readonly List<UnityWebRequest> inFlight = new List<UnityWebRequest>();

    void Awake()
    {
        if (I != null && I != this) { Destroy(gameObject); return; }
        I = this;
        DontDestroyOnLoad(gameObject);
    }

    /// Lệnh đọc: retry thoải mái với lỗi tạm thời.
    public Coroutine Get(string path, Action<string> onOk, Action<string> onErr)
        => StartCoroutine(Send("GET", path, null, null, onOk, onErr));

    /// Lệnh đổi ví tiền: BẮT BUỘC có idempotencyKey, nếu không thì từ chối gửi.
    public Coroutine PostMoney(string path, string json, string idempotencyKey,
                               Action<string> onOk, Action<string> onErr)
    {
        if (string.IsNullOrEmpty(idempotencyKey))
        {
            onErr?.Invoke("BUG_MISSING_IDEMPOTENCY_KEY");
            return null;
        }
        return StartCoroutine(Send("POST", path, json, idempotencyKey, onOk, onErr));
    }

    IEnumerator Send(string method, string path, string json, string idemKey,
                     Action<string> onOk, Action<string> onErr)
    {
        var attempt = 0;
        var authRetried = false;

        while (true)
        {
            var req = new UnityWebRequest(baseUrl + path, method);
            req.timeout = timeoutSeconds;
            req.downloadHandler = new DownloadHandlerBuffer();
            if (json != null)
            {
                req.uploadHandler = new UploadHandlerRaw(System.Text.Encoding.UTF8.GetBytes(json));
                req.SetRequestHeader("Content-Type", "application/json");
            }
            if (!string.IsNullOrEmpty(accessToken))
                req.SetRequestHeader("Authorization", "Bearer " + accessToken);
            if (!string.IsNullOrEmpty(idemKey))
                req.SetRequestHeader("Idempotency-Key", idemKey);

            inFlight.Add(req);
            yield return req.SendWebRequest();
            inFlight.Remove(req);

            var code = (int)req.responseCode;
            var body = req.downloadHandler != null ? req.downloadHandler.text : "";
            var netError = req.result != UnityWebRequest.Result.Success && code == 0;
            req.Dispose();

            // 401: refresh đúng một lần, và chỉ một refresh chạy tại một thời điểm.
            if (code == 401 && !authRetried)
            {
                authRetried = true;
                yield return RefreshOnce();
                if (string.IsNullOrEmpty(accessToken)) { onErr?.Invoke("AUTH_EXPIRED"); yield break; }
                continue;
            }

            var temporary = netError || code >= 500 || code == 429;
            if (!temporary)
            {
                if (code >= 200 && code < 300) onOk?.Invoke(body);
                else onErr?.Invoke($"HTTP_{code}:{body}");
                yield break;
            }

            attempt++;
            if (attempt > maxRetries) { onErr?.Invoke("TEMP_GAVE_UP"); yield break; }

            // Backoff 1s / 2s / 4s + jitter — jitter là thứ chặn hiệu ứng bầy đàn.
            var backoff = Mathf.Pow(2f, attempt - 1);
            var jitter = UnityEngine.Random.Range(0, maxJitterMs) / 1000f;
            Debug.Log($"[ApiClient] retry {attempt}/{maxRetries} sau {backoff + jitter:F2}s — {path}");
            yield return new WaitForSecondsRealtime(backoff + jitter);
        }
    }

    IEnumerator RefreshOnce()
    {
        if (refreshing) { while (refreshing) yield return null; yield break; }

        refreshing = true;
        var req = UnityWebRequest.PostWwwForm(baseUrl + "/auth/refresh", "");
        req.timeout = timeoutSeconds;
        req.SetRequestHeader("X-Refresh-Token", refreshToken);
        yield return req.SendWebRequest();

        accessToken = req.result == UnityWebRequest.Result.Success
            ? req.downloadHandler.text.Trim('"')
            : null;
        req.Dispose();
        refreshing = false;
    }

    /// Đổi scene thì huỷ mọi request đang bay — tránh callback đụng object đã chết.
    public void AbortAll()
    {
        for (var i = inFlight.Count - 1; i >= 0; i--) inFlight[i].Abort();
        inFlight.Clear();
    }

    void OnDestroy() { if (I == this) AbortAll(); }
}
```

```csharp
// DemoCaller.cs — bấm phím để thử từng nhánh.
using System;
using UnityEngine;

public class DemoCaller : MonoBehaviour
{
    string pendingKey;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Alpha1))
            ApiClient.I.Get("/me",
                ok => Debug.Log("[GET /me] " + ok),
                err => Debug.LogWarning("[GET /me] lỗi: " + err));

        if (Input.GetKeyDown(KeyCode.Alpha2))
        {
            // Key sinh MỘT lần cho MỘT hành động; bấm lại vẫn dùng key cũ.
            if (pendingKey == null) pendingKey = Guid.NewGuid().ToString("N");
            ApiClient.I.PostMoney("/buy", "{\"item_id\":42}", pendingKey,
                ok => { Debug.Log("[POST /buy] " + ok); pendingKey = null; },
                err => Debug.LogWarning("[POST /buy] lỗi: " + err));
        }

        if (Input.GetKeyDown(KeyCode.Alpha3))
            ApiClient.I.PostMoney("/buy", "{\"item_id\":42}", null,
                ok => Debug.Log(ok),
                err => Debug.LogWarning("[POST /buy] bị chặn: " + err));
    }
}
```

**Chạy thử**

- Chưa cần server: bấm `1`. Request lỗi mạng nên Console in đúng **ba dòng** `retry 1/3`, `retry 2/3`, `retry 3/3` với khoảng cách tăng dần 1s → 2s → 4s (cộng jitter), rồi kết thúc bằng `TEMP_GAVE_UP`.
- Bấm `3`: không có dòng retry nào, lỗi `BUG_MISSING_IDEMPOTENCY_KEY` hiện **ngay lập tức** — lệnh tiền thiếu key thì bị chặn ở client, không bay ra mạng.
- Dựng mock server trả 200 ở `/me` (xem [[project-teamwork]]): bấm `1` thấy body trả về, không có dòng retry nào.
- Cho mock trả 500 hai lần rồi 200: Console in `retry 1/3`, `retry 2/3` rồi in body — chứng tỏ backoff dừng đúng lúc thành công.
- Chạy hai lần bấm `2` liên tiếp khi mạng chậm: cả hai request mang **cùng một** `Idempotency-Key`, server chỉ trừ tiền một lần.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao gom mọi request vào một class thay vì gọi `UnityWebRequest` tại chỗ?**
  → Vì năm thứ phải nhất quán toàn app: base URL theo môi trường, timeout, retry, token refresh, và cách map lỗi ra thông báo. Gọi tại chỗ thì sáu tháng sau có bốn mươi chỗ, mỗi chỗ xử lý lỗi một kiểu, và đổi sang staging phải sửa cả bốn mươi. Riêng trong Unity còn thêm hai việc chung: huỷ request khi đổi scene và `Dispose` để không rò bộ nhớ native.
- `Junior` **Timeout nên đặt bao nhiêu, và vì sao không dùng mặc định?**
  → 10 giây cho request thường, 30 giây cho tải file lớn. Mặc định của Unity quá dài, và người chơi nhìn vòng xoay 30 giây thì tắt app chứ không chờ — thà báo lỗi sớm kèm nút thử lại còn hơn treo im lặng.
- `Mid` **Request nào được retry, request nào không?**
  → Theo nhóm mã lỗi: mất mạng, timeout, 5xx và `TEMP_*` thì retry 1s/2s/4s cộng jitter, tối đa ba lần; `RATE_*` thì chờ đúng `retry_after` server trả về. Lỗi nghiệp vụ — không đủ tiền, hết hàng, client quá cũ — thì không bao giờ retry vì nó không tự khỏi. Riêng lệnh đổi ví chỉ được retry khi request mang idempotency key.
- `Mid` **Jitter trong backoff để làm gì?**
  → Chống hiệu ứng bầy đàn. Không có jitter thì khi server chập chờn, mọi client cùng retry đúng giây thứ 1, thứ 3, thứ 7 — server vừa gượng dậy đã bị dội tiếp và không bao giờ hồi phục. Một dòng random 0–500ms rải các lần thử ra là đủ chặn.
- `Senior` **Nhiều màn hình cùng gặp token hết hạn. Chuyện gì xảy ra nếu không xử lý?**
  → Bão refresh: mỗi request tự gọi refresh, và nếu server xoay vòng refresh token thì cái sau làm cái trước hết hiệu lực — người chơi bị đá về màn đăng nhập dù token vẫn còn hạn. Lỗi này chỉ lộ khi nhiều màn hình cùng tải trên mạng chậm, tức là đúng lúc vào game. Cách chặn là một cổng refresh: chỉ một lần gọi thật, các request khác chờ kết quả rồi thử lại một lần.
- `Senior` **Hành động nào anh cho vào hàng đợi ghi xuống đĩa, và vì sao không phải tất cả?**
  → Chỉ những hành động mà mất đi thì người chơi thiệt thật: nhận thưởng hằng ngày, chốt kết quả màn, xác nhận xong hướng dẫn. Ghi xuống đĩa kèm key **trước khi** gửi, xoá khi thành công, gửi lại lúc mở app. Không đưa mọi request vào hàng đợi vì phần lớn là lệnh đọc — gọi lại là xong, xếp hàng chỉ thêm trạng thái phải bảo trì.

**Khung trả lời 60 giây** — "Request nào được retry, request nào không?"

> Tôi chia theo **nhóm mã lỗi** server trả về, không theo cảm tính. Lỗi tạm thời — mất mạng, timeout, 5xx — thì retry với backoff 1, 2, 4 giây **cộng jitter ngẫu nhiên nửa giây**. Bị giới hạn tần suất thì chờ đúng `retry_after` server nói, không tự đoán.
>
> Lỗi nghiệp vụ thì **không bao giờ** retry: không đủ tiền, hết hàng, client quá cũ. Retry bao nhiêu lần cũng thế, chỉ tốn pin và làm người chơi chờ lâu hơn trước khi thấy thông báo đúng.
>
> Riêng lệnh đổi ví tiền, tôi chỉ cho phép retry khi request **mang idempotency key**. Thiếu key thì lớp network từ chối gửi luôn — thà báo lỗi còn hơn có khả năng trừ tiền hai lần.

**Họ sẽ đào tiếp**

- *"Jitter để làm gì?"* → Chống hiệu ứng bầy đàn. Không có jitter thì khi server chập chờn, mọi client cùng retry đúng giây thứ 1, thứ 3, thứ 7 — server vừa gượng dậy đã bị dội tiếp. Một dòng random chặn được.
- *"Bão refresh là gì?"* → Nhiều request cùng nhận 401 và mỗi cái tự gọi refresh. Nếu server xoay vòng refresh token thì cái sau làm cái trước hết hiệu lực, và người chơi bị đá về màn đăng nhập dù token vẫn còn hạn. Cách chặn: một cổng refresh, chỉ một lần gọi thật, các request khác chờ kết quả rồi thử lại.
- *"Hàng đợi xuống đĩa cho cái gì?"* → Những hành động mất đi thì người chơi thiệt thật: nhận thưởng, chốt kết quả màn, xác nhận xong hướng dẫn. Ghi xuống đĩa **kèm key trước khi gửi**, xoá khi thành công, gửi lại lúc mở app. Không đưa mọi request vào hàng đợi vì phần lớn request đọc thì gọi lại là xong.
- *"Vì sao key phải sống qua lần mở lại app?"* → Vì hành vi thật của người chơi là thấy treo thì tắt app. Nếu key nằm trong RAM, lần mở lại sinh key mới và server coi đó là giao dịch thứ hai.
- *"Có gì riêng của Unity ở đây?"* → Ba thứ: phải `Dispose` `UnityWebRequest` nếu không rò bộ nhớ native; phải huỷ request đang bay khi đổi scene để callback không đụng object đã chết; và IL2CPP có thể strip class model JSON không được tham chiếu tĩnh.

**Cờ đỏ**

- Retry mọi lỗi, kể cả lỗi nghiệp vụ.
- Retry lệnh trừ tiền mà không có idempotency key.
- Backoff không có jitter.
- Mỗi màn hình tự gọi `UnityWebRequest` và tự xử lý lỗi.
- Lưu refresh token trong `PlayerPrefs`.
- Test toàn bộ trên localhost rồi kết luận lớp network ổn.

**Số / ví dụ nên thuộc**

- Timeout **10 giây** cho request thường, 30 giây cho tải file lớn.
- Backoff **1s → 2s → 4s**, tối đa **3 lần**, jitter **0–500ms**.
- 401 thì refresh và thử lại đúng **một** lần.
- Mạng thử nghiệm tối thiểu: **150ms trễ, 5% mất gói**.

**Kể trong dự án**

- *"Anh viết lớp này à?"* → Nếu bạn gom code rải rác thành một lớp, đó là câu chuyện tốt: kể số chỗ gọi rải rác trước đó và cái gì hỏng vì chúng không nhất quán.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: người chơi bị đá về màn đăng nhập ngẫu nhiên, không tái hiện được ở văn phòng. Nguyên nhân là bão refresh, chỉ xảy ra khi nhiều màn hình cùng tải trên mạng chậm. Kể cách bạn tái hiện bằng cách giả lập trễ 150ms.
- *"Anh kiểm chứng thế nào?"* → Nói về việc thử với mạng giả có trễ và mất gói, không phải WiFi văn phòng. Chi tiết này phân biệt người đã ship game mobile với người chưa.
