---
title: Matchmaking & phòng chờ
icon: 🎯
summary: Ghép trận bằng Go và Redis — dải MMR nới theo thời gian chờ, chốt cặp nguyên tử, ready check, và ba tham số không bao giờ cùng tốt được.
status: deep
read: 588
level: advanced
order: 30
tags: [backend, go, matchmaking, multiplayer, redis]
related: [game-server-go, game-database, unity-multiplayer, balancing-math]
---

Matchmaking trông như một bài toán thuật toán, nhưng phần khó nằm ở chỗ khác: **bạn không có đủ người chơi**. Thuật toán ghép hoàn hảo với 50.000 người online là chuyện của Riot; với 200 người online lúc 3 giờ sáng, mọi hệ thống ghép đều quy về cùng một câu hỏi — *chờ thêm hay hạ tiêu chuẩn?*

## Ba tham số không cùng tối ưu được

| Tham số | Muốn gì | Trả giá bằng |
|---|---|---|
| **Chất lượng cặp đấu** | Chênh MMR nhỏ, cùng region, cùng cỡ party | Thời gian chờ dài |
| **Thời gian chờ** | Vào trận trong 15 giây | Ghép lệch, trận một chiều |
| **Số người online** | Ai cũng có trận | Không điều khiển được — nó là hệ quả của marketing và giờ trong ngày |

Bạn chọn được hai. Và vì tham số thứ ba nằm ngoài tầm với, thiết kế thực dụng là: **bắt đầu chặt, nới dần theo thời gian chờ, có trần**. Trần quan trọng không kém phần nới: ghép một người 1500 với một người 2600 tệ hơn là bắt họ chờ thêm — người thua bỏ game, và bạn mất cả hai.

<figure class="fig">
<svg viewBox="0 0 660 240" role="img" aria-label="Dải MMR chấp nhận được loe rộng theo thời gian chờ, từ cộng trừ 50 ở giây 0 tới trần cộng trừ 400 ở giây 35">
  <defs>
    <marker id="gmm-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-line" stroke-width="1" fill="none">
    <path d="M60 200 H636"/>
    <path d="M60 26 V200"/>
  </g>
  <text x="348" y="224" text-anchor="middle" class="fig-muted" font-size="11">thời gian chờ (giây)</text>
  <text x="60" y="216" text-anchor="middle" class="fig-muted" font-size="10">0</text>
  <text x="246" y="216" text-anchor="middle" class="fig-muted" font-size="10">20</text>
  <text x="433" y="216" text-anchor="middle" class="fig-muted" font-size="10">40</text>
  <text x="620" y="216" text-anchor="middle" class="fig-muted" font-size="10">60</text>
  <path d="M60 110 H636" stroke="#b197fc" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
  <text x="636" y="106" text-anchor="end" class="fig-label" font-size="11" fill="#b197fc">MMR của bạn: 1500</text>
  <g stroke="#6ea8fe" stroke-width="2" fill="none">
    <path d="M60 101 L386 39 H636"/>
    <path d="M60 119 L386 181 H636"/>
  </g>
  <text x="96" y="92" text-anchor="start" class="fig-muted" font-size="10">±50 ngay từ giây 0</text>
  <text x="470" y="33" text-anchor="start" class="fig-muted" font-size="10">trần ±400 từ giây 35 — không nới thêm nữa</text>
  <g fill="#8b93a7">
    <circle cx="120" cy="62" r="4"/>
    <circle cx="180" cy="170" r="4"/>
    <circle cx="300" cy="52" r="4"/>
    <circle cx="500" cy="150" r="4"/>
  </g>
  <circle cx="172" cy="128" r="6" fill="#51cf9b"/>
  <text x="186" y="140" text-anchor="start" font-size="11" fill="#51cf9b">ghép ở giây 12: chênh 90 MMR, trong dải ±170</text>
  <text x="126" y="54" text-anchor="start" class="fig-muted" font-size="10">người này ở ngoài dải lúc đó — chờ tiếp</text>
</svg>
<figcaption>Người chơi trong hàng đợi là các chấm. Dải loe ra theo thời gian chờ của <em>chính bạn</em>; người kia cũng có dải của họ, và phải khớp cả hai chiều.</figcaption>
</figure>

## Nới dải theo thời gian chờ

Công thức đủ dùng cho gần như mọi game: `dải(t) = min(base + rate × t, trần)`.

| Thời gian chờ | Dải chấp nhận | Nghĩa là |
|---|---|---|
| 0s | ±50 | Chỉ ghép người gần ngang cơ |
| 10s | ±150 | Đã nới, vẫn là trận cân |
| 20s | ±250 | Bắt đầu lệch nhưng chơi được |
| 35s trở đi | ±400 (trần) | Dừng ở đây. Chưa có ai thì **chờ tiếp**, không hạ thêm |

```go
// Dải MMR chấp nhận được nới theo thời gian chờ: chờ càng lâu, tiêu chuẩn càng hạ — có trần.
const (
	bandBase = 50.0   // chênh MMR chấp nhận ngay ở giây 0
	bandRate = 10.0   // nới thêm mỗi giây chờ
	bandMax  = 400.0  // trần: quá mức này trận không còn vui, thà chờ tiếp
)

func band(waited time.Duration) float64 {
	return math.Min(bandBase+bandRate*waited.Seconds(), bandMax)
}

// Quét mỗi giây. Ticket nằm trong ZSET với score = MMR, nên ZRange trả về đã sắp tăng dần:
// ứng viên tốt nhất của một người luôn là người ĐỨNG NGAY CẠNH trong danh sách.
func (m *Matchmaker) tick(ctx context.Context, now time.Time) {
	q, err := m.rdb.ZRangeWithScores(ctx, m.key, 0, -1).Result()
	if err != nil || len(q) < 2 {
		return
	}
	for i := 0; i+1 < len(q); i++ {
		a, b := q[i], q[i+1]
		gap := b.Score - a.Score
		// Cả hai phải chấp nhận nhau: người chờ 60 giây không được kéo người
		// vừa bấm Tìm trận ra khỏi dải ±50 của họ.
		if gap > m.bandOf(a, now) || gap > m.bandOf(b, now) {
			continue
		}
		if m.claim(ctx, a.Member.(string), b.Member.(string)) {
			go m.createRoom(ctx, a, b)
			i++ // b đã bị lấy, đừng xét nó ở cặp sau
		}
	}
}
```

Quét toàn bộ hàng đợi mỗi giây nghe có vẻ phí, nhưng 5.000 ticket là 5.000 phần tử — vài trăm micro giây. Đừng tối ưu trước khi đo; cái đắt thật nằm ở Redis round-trip, không ở vòng lặp.

## Chốt cặp phải nguyên tử

Đây là chỗ hệ thống matchmaking hay hỏng nhất, và nó chỉ hỏng khi có tải thật: hai instance matchmaker (hoặc hai vòng quét chồng nhau) cùng nhìn thấy một ticket và cùng ghép nó vào hai trận khác nhau.

```go
// ZREM hai lệnh riêng có thể thành công một nửa: bạn xoá được A, mất B vào tay instance khác,
// và A bị ghép vào một trận không tồn tại. Kiểm tra và xoá phải nằm trong MỘT script Lua.
var claimScript = redis.NewScript(`
  if redis.call('ZSCORE', KEYS[1], ARGV[1]) and redis.call('ZSCORE', KEYS[1], ARGV[2]) then
    redis.call('ZREM', KEYS[1], ARGV[1], ARGV[2])
    return 1
  end
  return 0
`)

func (m *Matchmaker) claim(ctx context.Context, a, b string) bool {
	n, err := claimScript.Run(ctx, m.rdb, []string{m.key}, a, b).Int()
	return err == nil && n == 1 // chỉ khi lấy được CẢ HAI thì cặp này mới là của mình
}
```

Nguyên tắc rút ra dùng được cho mọi hàng đợi: **thao tác "kiểm tra rồi lấy" phải là một lệnh duy nhất từ phía Redis**, bằng Lua script hoặc bằng một lệnh có sẵn (`ZPOPMIN`, `SET NX`). Đọc xong rồi ghi ở hai lệnh là mời race vào cửa.

## MMR: chọn hệ nào

| Hệ | Hợp với | Điểm mấu chốt |
|---|---|---|
| **Elo** | 1v1, ít người, muốn dễ giải thích | `K` phải giảm theo số trận: 32 cho 30 trận đầu, 16 sau đó. Không giảm thì hạng nhảy loạn mãi mãi |
| **Glicko-2** | Người chơi nghỉ dài rồi quay lại | Có thêm **độ tin cậy** (RD): nghỉ lâu thì RD tăng, hệ thống dám điều chỉnh mạnh hơn |
| **TrueSkill / Bayes** | Đội, nhiều người, có vai trò | Mô hình đúng hơn nhưng khó giải thích cho người chơi và khó debug |

Với game nhỏ: **Elo với K giảm dần là đủ**, và bạn hiểu được vì sao ai đó lên hạng. Ẩn con số MMR khỏi người chơi (hiện bậc: Đồng/Bạc/Vàng) để không ai chơi vì con số — xem [[balancing-math]] về cách chọn bước nhảy giữa các bậc.

Ba việc phải làm dù chọn hệ nào: cho người mới một **giai đoạn định hạng** (5–10 trận, biến động mạnh), **đừng trừ điểm khi mất kết nối do server**, và giữ **một MMR riêng cho mỗi chế độ chơi**.

## Ready check và cấp phòng

Ghép xong chưa phải là xong. Trình tự đủ chặt:

1. **Claim** hai ticket bằng script trên. Từ lúc này hai người không còn trong hàng đợi.
2. **Xin phòng**: gọi room server (hoặc Agones) xin một chỗ. Xin **trước** khi báo cho client — báo rồi mới phát hiện hết chỗ là kiểu lỗi tệ nhất.
3. **Ready check** 10 giây. Ai không bấm thì huỷ trận; người còn lại **được trả về đầu hàng đợi với thời gian chờ tích luỹ giữ nguyên** — họ không có lỗi gì.
4. **Phạt người bỏ ready check**: khoá hàng đợi 1 phút, tăng dần nếu lặp lại. Không có phạt thì người ta sẽ ghép rồi bỏ để né đối thủ mạnh.
5. **Ticket có TTL** trong Redis (ví dụ 5 phút) và client phải gia hạn. App bị kill giữa chừng mà không có TTL thì ticket ma nằm lại và bạn ghép người với không khí.

## Đo cái gì

| Chỉ số | Ngưỡng đáng báo động |
|---|---|
| **p99 thời gian chờ** (không phải trung bình) | Trung bình luôn đẹp; p99 mới là người bỏ game |
| Chênh MMR trung bình của các cặp đã ghép | Tăng đều = hàng đợi đang cạn người |
| Tỉ lệ huỷ ở ready check | > 10% là có người né đối thủ, hoặc UI ready check dở |
| Tỉ lệ ticket hết TTL | Cao = client mất kết nối nhiều, xem lại phía Unity |
| Tỉ lệ trận một chiều (chênh điểm > X) | Là thước đo *chất lượng ghép*, khác với thước đo thời gian chờ |

Ghi mọi lần ghép vào bảng `match_history` ([[game-database]]): hai MMR, thời gian chờ, kết quả. Không có bảng đó thì mọi tinh chỉnh `bandRate` sau này đều là đoán.

## Bẫy thường gặp

| Bẫy | Lộ ra lúc nào |
|---|---|
| "Kiểm tra rồi xoá" ở hai lệnh Redis | Một người vào hai trận, hoặc ticket biến mất — chỉ khi có tải thật |
| Chỉ kiểm dải của một bên | Người chờ lâu kéo người mới vào trận lệch, người mới bỏ game |
| Không có trần dải | 3 giờ sáng ghép 1500 với 2600, cả hai đều không vui |
| Ticket không TTL | Ticket ma tích lại, ghép với người đã thoát |
| Bỏ qua region | Ghép được ngay nhưng ping 250ms — tệ hơn chờ thêm 20 giây |
| Party 2 người ghép vào đội 5 người rời rạc | Nhóm bạn nghiền nát người đi lẻ; cần tách hàng đợi hoặc cộng MMR ẩn cho party |
| Nới dải theo **số lần quét** thay vì theo **thời gian thật** | Tải cao thì quét chậm lại, dải nới chậm theo, thời gian chờ nổ |
| Đo thời gian chờ trung bình | Che mất đúng nhóm người sắp bỏ game |

## 🤖 Prompt cho AI

**Dùng AI thế nào cho matchmaking**

Matchmaking chia làm hai nửa rất khác nhau, và chỉ một nửa giao được:

| Giao được | Đừng giao |
|---|---|
| Vòng quét, script Lua chốt cặp, TTL, ready check, API | Chọn `base`, `rate`, `trần` — đó là quyết định thiết kế, phụ thuộc số người online của *bạn* |
| Test đồng thời: 2 matchmaker cùng chạy, 500 ticket vào cùng lúc | Chọn hệ MMR và cách hiển thị hạng cho người chơi |
| Mô phỏng: đổ log hàng đợi thật vào, in p99 chờ và chênh MMR | Kết luận "tham số này tốt" — phải nhìn số mô phỏng rồi tự quyết |

Quy trình dùng được: bắt AI viết **mô phỏng trước khi viết service**. Đưa nó phân bố MMR và nhịp người vào hàng đợi (lấy từ log thật, hoặc ước lượng), để nó chạy 10.000 ticket ảo với ba bộ tham số và in bảng p50/p99 thời gian chờ cùng chênh MMR trung bình. Chọn tham số từ bảng đó, rồi mới code service — ngược lại là chỉnh số theo cảm giác suốt nhiều tháng.

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Số người online thật lúc thấp điểm** — đây là con số quyết định mọi thứ. Nói "200 CCU lúc 3 giờ sáng" thì AI mới thôi đề xuất ghép ±25.
- **Cỡ trận và party**: 1v1, 5v5, có cho đi nhóm không, nhóm tối đa mấy người.
- **Region và ngưỡng ping** chấp nhận được.
- **Có ready check không**, và phạt người bỏ ra sao.
- **Hệ MMR** đang dùng và có giai đoạn định hạng không.
- **Chạy mấy instance matchmaker** — một hay nhiều, vì nó quyết định mức độ nguyên tử cần thiết.

**Mẫu prompt**

```
Viết matchmaker Go 1.22 + Redis 7 cho game 1v1, 1 region, cho phép chạy NHIỀU instance
song song. Lúc thấp điểm chỉ có ~200 người online.

Quy tắc:
- Ticket trong ZSET, score = MMR, TTL 5 phút, client gia hạn mỗi 30 giây.
- Dải chấp nhận: min(50 + 10*t, 400) với t là thời gian chờ THẬT tính bằng giây.
- Cả hai phía đều phải nằm trong dải của nhau.
- Chốt cặp phải NGUYÊN TỬ (Lua script), không được có trường hợp lấy được một nửa.
- Ready check 10 giây; ai không bấm thì huỷ, người còn lại quay lại hàng đợi
  GIỮ NGUYÊN thời gian chờ đã tích luỹ.

Giao theo thứ tự, dừng chờ tôi duyệt:
1. Mô phỏng (không cần Redis): 10.000 ticket với phân bố MMR chuẩn quanh 1500 (σ=300),
   nhịp vào 3 người/giây. In p50/p99 thời gian chờ và chênh MMR trung bình cho
   ba bộ tham số: rate 5, 10, 20. KẾT LUẬN để tôi chọn, đừng tự chọn.
2. Service thật dùng tham số tôi chọn.
3. Test: hai matchmaker chạy song song trên cùng Redis, 500 ticket — phải KHÔNG có
   ai bị ghép hai lần và KHÔNG ticket nào biến mất. Chạy `go test -race`, dán output thật.
```

**Bẫy thường gặp:** AI viết `ZSCORE` để kiểm rồi `ZREM` để lấy ở hai lệnh riêng — code chạy hoàn hảo trong test một luồng và hỏng đúng lúc có người chơi thật, theo kiểu khó tái hiện nhất (một người vào hai trận). Hai cái nữa: nó tính thời gian chờ bằng **số vòng quét** thay vì thời gian thật (tải cao là dải nới chậm lại đúng lúc cần nới nhanh), và nó tự chọn `base/rate/trần` theo thói quen của các blog Riot/Valorant — những con số sinh ra cho hệ thống có hàng chục nghìn người online cùng lúc.

## 🎮 Unity

Màn hình tìm trận là nơi lỗi backend hiện ra dưới dạng "game bị treo". Ba thứ phía client quyết định trải nghiệm: **huỷ phải thật sự huỷ**, **ước lượng thời gian phải trung thực**, và **app vào nền không được để lại ticket ma**.

**Component & nơi đặt**

- `MatchmakingScreen.cs` — một MonoBehaviour sống theo màn hình tìm trận, đặt ở `Assets/Scripts/Net/`.
- Gia hạn ticket bằng coroutine 30 giây một lần; **huỷ trong `OnDisable` và `OnApplicationPause(true)`**, không chỉ ở nút Huỷ.

**Code**

```csharp
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

// Vòng đời một ticket tìm trận: mở → gia hạn định kỳ → (ghép được | huỷ) → đóng.
public class MatchmakingScreen : MonoBehaviour
{
    [SerializeField] string baseUrl = "https://api.example.com";
    [SerializeField] float pollSeconds = 2f;
    [SerializeField] float renewSeconds = 30f;

    string ticketId;
    float startedAt;

    public void OnFindPressed()
    {
        startedAt = Time.unscaledTime;
        StartCoroutine(Find());
        StartCoroutine(Renew());
    }

    public void OnCancelPressed() => StartCoroutine(Cancel());

    // Rời màn hình hoặc app bị đưa vào nền: PHẢI huỷ, không thì ticket ma nằm lại
    // trong Redis và server ghép người khác với một người không còn ở đó.
    void OnDisable() { if (ticketId != null) StartCoroutine(Cancel()); }
    void OnApplicationPause(bool paused) { if (paused && ticketId != null) StartCoroutine(Cancel()); }

    IEnumerator Find()
    {
        using (var req = UnityWebRequest.Post(baseUrl + "/v1/mm/enqueue", "", "application/json"))
        {
            yield return req.SendWebRequest();
            if (req.result != UnityWebRequest.Result.Success) { ShowError(); yield break; }
            ticketId = req.downloadHandler.text.Trim('"');
        }

        while (ticketId != null)
        {
            yield return new WaitForSecondsRealtime(pollSeconds);   // Realtime: popup đặt timeScale = 0 vẫn chạy
            using (var req = UnityWebRequest.Get($"{baseUrl}/v1/mm/status?ticket={ticketId}"))
            {
                yield return req.SendWebRequest();
                if (req.result != UnityWebRequest.Result.Success) continue;      // mạng chập: thử lại, ĐỪNG huỷ
                if (req.downloadHandler.text.Contains("\"matched\"")) { EnterReadyCheck(req.downloadHandler.text); yield break; }
            }
            ShowWaiting(Time.unscaledTime - startedAt);
        }
    }

    IEnumerator Renew()
    {
        while (ticketId != null)
        {
            yield return new WaitForSecondsRealtime(renewSeconds);
            if (ticketId == null) yield break;
            using (var req = UnityWebRequest.Post($"{baseUrl}/v1/mm/renew?ticket={ticketId}", "", "application/json"))
                yield return req.SendWebRequest();
        }
    }

    IEnumerator Cancel()
    {
        string id = ticketId;
        ticketId = null;                                   // dừng mọi vòng lặp trước, gửi sau
        if (id == null) yield break;
        using (var req = UnityWebRequest.Post($"{baseUrl}/v1/mm/cancel?ticket={id}", "", "application/json"))
            yield return req.SendWebRequest();
    }

    void ShowWaiting(float waited) { /* hiện thời gian chờ THẬT + ước lượng p50 server trả về */ }
    void EnterReadyCheck(string json) { /* mở ready check 10 giây */ }
    void ShowError() { /* báo lỗi tử tế, cho bấm thử lại */ }
}
```

**Bẫy Unity cụ thể**

- **Huỷ chỉ gắn vào nút Huỷ.** Người chơi thoát màn hình, tắt app, hoặc mất mạng thì ticket vẫn nằm đó. TTL phía server là lưới cuối, nhưng client phải chủ động huỷ ở `OnDisable` và `OnApplicationPause`.
- **`WaitForSeconds` trong màn hình có popup `timeScale = 0`**: vòng poll đứng im, người chơi tưởng treo. Dùng `WaitForSecondsRealtime`.
- **Coi mọi lỗi mạng là "huỷ tìm trận".** Một lần 5xx giữa chừng không có nghĩa là ticket mất — cứ poll tiếp, chỉ dừng khi server nói ticket không còn.
- **Hiện thời gian chờ ước lượng bằng trung bình.** Người chơi so nó với đồng hồ thật của họ và mất niềm tin ngay lần đầu lệch. Hiện p50 của server và nói rõ "thường khoảng…", hoặc chỉ hiện đồng hồ đếm lên.
- **Ready check dùng `Time.time`**: nếu có popup dừng game thì đồng hồ 10 giây cũng dừng theo, trong khi server vẫn đếm. Dùng `Time.unscaledTime` và **lấy hạn chót từ server**, đừng tự đếm.
- **Mobile: app vào nền hơn 30 giây** thì coroutine gia hạn không chạy (hệ điều hành treo app). Đó chính là lý do phải huỷ khi `OnApplicationPause(true)`, và tìm lại từ đầu khi quay lại.

**Kiểm tra nhanh**

- Bấm Tìm trận rồi tắt app ngay: trong Redis, ticket biến mất trong vài giây (không phải chờ hết TTL 5 phút).
- Bấm Tìm trận, bật Airplane Mode 10 giây rồi tắt: vẫn đang tìm, không nhảy ra lỗi và không tạo ticket thứ hai.
- Mở hai bản build cùng lúc với MMR chênh 90: ghép được trong vài giây; chênh 900 thì phải chờ tới khi dải chạm trần.
- Ghép xong rồi cố tình không bấm Ready ở một máy: máy kia quay lại hàng đợi và **không** bị reset đồng hồ chờ về 0.
