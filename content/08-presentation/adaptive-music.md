---
title: Adaptive Music
icon: 🎵
summary: Nhạc thay đổi theo trạng thái game — vertical layering, horizontal resequencing, và bài toán chuyển mượt.
status: deep
read: 410
level: advanced
order: 80
tags: [presentation, audio, music]
related: [audio-implementation, ai-director, pacing, difficulty-curve]
---

Nhạc tĩnh lặp mãi một track sẽ bị người chơi tắt sau vài giờ. Adaptive music làm nhạc **phản ứng với những gì đang xảy ra** — và khi làm đúng, nó là công cụ điều tiết cảm xúc mạnh nhất bạn có.

## Hai kỹ thuật nền

**Vertical layering (phân lớp dọc)** — nhiều track phát *đồng thời*, bật/tắt từng lớp:

```
Lớp 4  Trống dồn + brass      ← chỉ khi boss máu < 30%
Lớp 3  Trống nhịp             ← khi đang chiến đấu
Lớp 2  Bass + đệm             ← khi có kẻ địch gần
Lớp 1  Nền pad                ← luôn phát
```

Mọi lớp phát cùng lúc từ đầu, chỉ thay đổi **âm lượng**. Vì tất cả cùng timeline nên chuyển lớp **luôn khớp nhịp** — không bao giờ lệch phách. Đây là kỹ thuật dễ nhất và nên bắt đầu từ đây.

Chi phí: tốn bộ nhớ và voice (mọi lớp luôn decode), và phải sáng tác sao cho mọi tổ hợp lớp đều nghe được.

**Horizontal resequencing (nối ngang)** — các đoạn nhạc khác nhau nối tiếp nhau:

```
Khám phá  →  [điểm chuyển]  →  Chiến đấu  →  [đoạn kết]  →  Yên bình
```

Linh hoạt hơn về mặt sáng tác, nhưng khó: phải chờ tới **điểm chuyển hợp lệ** (thường cuối ô nhịp hoặc cuối câu nhạc) mới đổi được, nên có độ trễ 1–4 giây.

Thực tế hay dùng **kết hợp cả hai**: layering cho phản ứng nhanh, resequencing cho đổi bối cảnh lớn.

## Bài toán chuyển mượt

Đây là phần khó nhất. Ba giải pháp, từ đơn giản tới phức tạp:

| Cách | Độ trễ | Chất lượng |
|---|---|---|
| Crossfade thẳng | 0 | Nghe được, nhưng lệch nhịp nếu hai đoạn khác tempo |
| Chờ cuối ô nhịp | ≤ 1 ô | Khớp nhịp, độ trễ chấp nhận được |
| Stinger + chuyển | ~1 ô | Tốt nhất — một đoạn ngắn che chỗ nối |

**Stinger** là đoạn nhạc ngắn (1–2 giây) phát đè lên lúc chuyển, làm tai không nhận ra chỗ nối. Rẻ và hiệu quả.

Muốn chờ đúng nhịp thì hệ thống phải biết **tempo và số phách mỗi ô** của từng track — khai trong dữ liệu, đừng đoán.

## Nối với trạng thái game

Nhạc adaptive cần một **nguồn tín hiệu**, và [[ai-director]] là nguồn tự nhiên nhất. Nếu bạn đã có chỉ số `intensity` 0–1, hãy ánh xạ thẳng:

```
intensity 0.0-0.2  → chỉ lớp 1
intensity 0.2-0.5  → lớp 1+2
intensity 0.5-0.8  → lớp 1+2+3
intensity 0.8-1.0  → tất cả
```

**Quan trọng: thêm hysteresis.** Intensity dao động quanh 0.5 sẽ khiến lớp 3 bật tắt liên tục, nghe như lỗi. Vào lớp 3 ở 0.5, thoát ở 0.35. Cùng nguyên lý chống dao động ở [[behavior-tree]].

Ngoài ra nên có **thời gian tối thiểu giữ một trạng thái** (4–8 giây) — nhạc đổi quá nhanh gây mệt dù mỗi lần chuyển đều mượt.

## Nhạc như một chỉ báo gameplay

Đây là phần bị đánh giá thấp: nhạc **truyền thông tin**.

- Lớp trống vào = có kẻ địch bạn chưa thấy
- Nhạc dừng đột ngột = sắp có gì đó (xem [[pacing]])
- Motif riêng cho từng boss = người chơi biết gặp ai trước khi nhìn thấy

Khi nhạc đáng tin cậy về mặt thông tin, người chơi học dùng nó — và game trở nên dễ đọc hơn mà không thêm một pixel UI nào.

## Cân nhắc trước khi làm

Adaptive music **tốn công sáng tác gấp nhiều lần** nhạc tuyến tính: mọi tổ hợp lớp phải nghe được, mọi điểm chuyển phải mượt.

Nếu ngân sách hạn chế, thứ tự ưu tiên thực dụng:
1. **Một track hay, lặp tốt, có đoạn lặng** — đã hơn hẳn không có gì
2. **Hai trạng thái (yên bình / chiến đấu) + stinger** — 80% giá trị với 20% công sức
3. Layering đầy đủ
4. Resequencing động

Đừng bắt đầu từ mục 4.

## 🤖 Prompt cho AI

AI **không sáng tác được nhạc dùng được cho game** và không nghe được kết quả. Việc của nó ở đây là **hệ thống điều phối**: theo dõi nhịp, chờ điểm chuyển, quản lý lớp, hysteresis.

**Phải nêu rõ:**
- Tempo (BPM) và số phách mỗi ô của từng track — hệ thống không đoán được
- Ngưỡng vào/ra cho từng lớp (hai số khác nhau, không phải một)
- Thời gian giữ tối thiểu mỗi trạng thái
- Nguồn tín hiệu: intensity lấy từ đâu

**Mẫu prompt**

```
Dựng AdaptiveMusicSystem cho <engine + phiên bản>.

Kỹ thuật: vertical layering + stinger khi đổi bối cảnh.

Track config (JSON, KHÔNG hardcode):
  bpm: 120, beatsPerBar: 4
  layers: [ambient, bass, drums, brass]   // 4 AudioSource, cùng timeline

Ánh xạ intensity -> lớp, CÓ HYSTERESIS (vào / ra):
  bass   0.20 / 0.12
  drums  0.50 / 0.35
  brass  0.80 / 0.65

Ràng buộc:
- Mọi lớp phát đồng thời từ t=0, CHỈ đổi volume. Không Play/Stop từng lớp
  (Play lại sẽ lệch timeline).
- Fade lớp 0.8s, đường cong equal-power, KHÔNG tuyến tính.
- Giữ tối thiểu 6s mỗi trạng thái trước khi cho đổi tiếp.
- Đổi bối cảnh (explore <-> combat): chờ tới cuối ô nhịp hiện tại rồi mới
  crossfade, phát stinger đè lên. Tính thời điểm từ bpm/beatsPerBar,
  KHÔNG dùng timer rời.
- intensity đọc từ IDirectorSignal (interface), không phụ thuộc trực tiếp Director.

Kèm debug overlay: intensity hiện tại, volume từng lớp, số phách tới điểm
chuyển kế tiếp, trạng thái đang giữ còn bao lâu.

Test: hysteresis không dao động khi intensity rung quanh ngưỡng;
điểm chuyển luôn rơi vào cuối ô nhịp (sai số < 20ms).
```

**Bẫy thường gặp:** dùng crossfade tuyến tính. Hai track cùng phát ở 50% âm lượng tuyến tính cho tổng năng lượng **thấp hơn** một track ở 100% — nghe như âm thanh bị tụt ở giữa đoạn chuyển. Phải nêu rõ *equal-power* (nhân với `cos`/`sin` của góc chuyển), AI mặc định làm tuyến tính.

## 🎮 Unity

Trong Unity, adaptive music đứng hoặc chết ở một API: **`AudioSettings.dspTime`**. Dùng `Time.time` là lệch nhịp, không có ngoại lệ.

**Vì sao không dùng `Time.time`**

`Time.time` cập nhật mỗi frame và trôi so với đồng hồ audio. Sau vài phút, "chờ tới cuối ô nhịp" tính bằng `Time.time` lệch cả trăm mili giây — tai nghe ra ngay.

```csharp
// ✅ đồng hồ của audio thread, không trôi
double nextBarTime = startDspTime + barsPlayed * (60d / bpm * beatsPerBar);
```

**Phát đúng nhịp: `PlayScheduled`**

```csharp
public class AdaptiveMusic : MonoBehaviour {
    [SerializeField] AudioSource[] layers;     // cùng độ dài, cùng tempo
    [SerializeField] float bpm = 120f;
    [SerializeField] int beatsPerBar = 4;
    double startDsp;

    void Start() {
        // Lên lịch TẤT CẢ lớp cùng một mốc dsp -> không bao giờ lệch nhau
        startDsp = AudioSettings.dspTime + 0.2;    // đệm 200ms để kịp lên lịch
        foreach (var a in layers) {
            a.volume = 0f;
            a.loop = true;
            a.PlayScheduled(startDsp);             // KHÔNG dùng Play()
        }
    }

    public double SecondsToNextBar() {
        double barLen = 60d / bpm * beatsPerBar;
        double elapsed = AudioSettings.dspTime - startDsp;
        return barLen - (elapsed % barLen);
    }
}
```

Điểm mấu chốt: **mọi lớp `PlayScheduled` cùng một mốc và không bao giờ `Stop()`**. Chỉ đổi `volume`. `Stop()` rồi `Play()` lại sẽ lệch timeline và không cách nào đồng bộ lại.

**Fade equal-power, không tuyến tính**

```csharp
// Hai lớp cùng ở volume 0.5 tuyến tính cho tổng NĂNG LƯỢNG thấp hơn một lớp ở 1.0
// -> nghe như âm thanh bị tụt ở giữa đoạn chuyển
float t = Mathf.Clamp01(elapsed / fadeDuration);
outgoing.volume = Mathf.Cos(t * Mathf.PI * 0.5f);
incoming.volume = Mathf.Sin(t * Mathf.PI * 0.5f);
```

Đây là lỗi AI gần như luôn mắc nếu không nêu rõ.

**Hysteresis — chống rung lớp**

```csharp
// intensity dao động quanh 0.5 sẽ bật/tắt lớp drums liên tục, nghe như lỗi
bool drumsOn;
drumsOn = drumsOn ? intensity > 0.35f : intensity > 0.50f;
```

Nguồn `intensity` nên là [[ai-director]] — nó đã có sẵn chỉ số 0..1.

**Bẫy Unity cụ thể**
- **`AudioSettings.dspTime` không nhích khi `timeScale = 0`?** Sai — nó *vẫn chạy*, vì nó là đồng hồ audio thread. Đây là điều tốt: nhạc không đứng khi hitstop. Nhưng nghĩa là không dùng nó để đo thời gian gameplay.
- **`AudioSettings.OnAudioConfigurationChanged`** bắn khi người chơi cắm tai nghe — mọi `PlayScheduled` đang chờ bị mất. Phải lên lịch lại.
- **Lớp có độ dài khác nhau** → lệch sau vài vòng loop. Mọi clip phải cùng số ô nhịp.

**Kiểm tra nhanh**
- Chơi 10 phút liên tục: các lớp còn khớp nhau không?
- Cắm/rút tai nghe giữa lúc chơi: nhạc có tiếp tục không?
- Đổi lớp giữa đoạn: có nghe ra chỗ nối không? (không được)
- `intensity` rung quanh ngưỡng: lớp có bật tắt liên tục không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vertical layering là gì, và vì sao nên bắt đầu từ nó?**
  → Nhiều track phát **đồng thời** từ đầu, chỉ thay đổi **âm lượng** từng lớp theo trạng thái game. Vì mọi lớp cùng một timeline nên chuyển lớp **luôn khớp nhịp**, không bao giờ lệch phách — đó là lý do nó dễ nhất và nên làm trước. Chi phí: tốn bộ nhớ và voice vì mọi lớp luôn decode.
- `Junior` **Horizontal resequencing khác gì, và khó ở đâu?**
  → Các đoạn nhạc khác nhau **nối tiếp nhau** thay vì chồng lên nhau. Linh hoạt hơn về sáng tác nhưng khó vì phải chờ tới **điểm chuyển hợp lệ** — thường cuối ô nhịp hoặc cuối câu nhạc — nên có độ trễ **1–4 giây**. Thực tế hay kết hợp cả hai: layering cho phản ứng nhanh, resequencing cho đổi bối cảnh lớn.
- `Junior` **Stinger là gì?**
  → Một đoạn nhạc ngắn **1–2 giây** phát đè lên đúng lúc chuyển, làm tai không nhận ra chỗ nối. Nó rẻ và hiệu quả nhất trong ba cách chuyển: crossfade thẳng (độ trễ 0 nhưng lệch nhịp nếu khác tempo), chờ cuối ô nhịp (khớp nhịp, trễ ≤ một ô), và **stinger + chuyển** (tốt nhất).
- `Mid` **Muốn chuyển đúng nhịp thì hệ thống cần biết gì?**
  → **Tempo và số phách mỗi ô** của từng track, và những giá trị đó phải **khai trong dữ liệu** chứ đừng đoán hay dò lúc chạy. Có hai con số đó thì tính được thời điểm ô nhịp kế tiếp và lên lịch chuyển; thiếu chúng thì mọi chuyển đoạn đều là crossfade mù, và nhạc sẽ lệch phách ở đúng chỗ người nghe chú ý nhất.
- `Mid` **Nối nhạc adaptive với trạng thái game bằng gì?**
  → Bằng một **nguồn tín hiệu** duy nhất, và `intensity` của AI Director là nguồn tự nhiên nhất: đã có sẵn một con số 0–1 mô tả mức căng, ánh xạ thẳng sang số lớp đang bật. Dùng nhiều nguồn rời rạc — máu, số địch, vị trí — thì các quyết định mâu thuẫn nhau và nhạc nhấp nháy.
- `Mid` **Nhạc bật tắt lớp liên tục nghe như lỗi. Sửa thế nào?**
  → Thêm **hysteresis**: vào lớp 3 ở intensity 0,5 nhưng chỉ thoát ra ở 0,35. Intensity dao động quanh một ngưỡng duy nhất sẽ làm lớp bật tắt liên tục — cùng đúng vấn đề thrashing của behavior tree và cùng đúng cách chữa. Kèm theo là thời gian tối thiểu giữ một lớp trước khi được phép đổi.
- `Senior` **Chọn layering hay resequencing cho một game cụ thể — dựa vào gì?**
  → Dựa vào **tốc độ phản ứng cần thiết** và **khác biệt giữa các trạng thái**. Cần đổi trong dưới một giây và các trạng thái chỉ khác nhau về mức căng: layering. Các trạng thái khác hẳn nhau về hoà âm hoặc tempo — khám phá so với chiến đấu boss — thì resequencing, chấp nhận trễ một ô nhịp và che bằng stinger.
- `Senior` **Chi phí kỹ thuật của vertical layering trên mobile là gì?**
  → Mọi lớp **luôn decode** kể cả khi âm lượng bằng 0, nên nó tốn voice và CPU giải nén liên tục. Với mobile, điều đó nghĩa là cân nhắc số lớp (thường 3–4 là trần thực tế), dùng định dạng nén phù hợp, và nhớ rằng nhạc nên **Streaming** — mà mỗi stream là một luồng đọc, nên số lớp bị giới hạn bởi cả I/O chứ không chỉ CPU.
- `Senior` **Nhạc adaptive ảnh hưởng gì tới cách sáng tác?**
  → Rất nhiều, và đây là phần hay bị bỏ qua khi lên kế hoạch. Với layering, nhạc sĩ phải viết sao cho **mọi tổ hợp lớp đều nghe được**, không chỉ tổ hợp đầy đủ — đó là ràng buộc sáng tác thật. Với resequencing, mỗi đoạn phải vào và ra được từ nhiều đoạn khác. Nên quyết định kỹ thuật này phải chốt **trước khi** đặt nhạc, không phải sau.

**Khung trả lời 60 giây** — "Anh làm nhạc thích ứng thế nào?"

> Bắt đầu bằng **vertical layering**: nhiều lớp phát đồng thời từ đầu, chỉ đổi âm lượng. Vì mọi lớp cùng một timeline nên chuyển lớp luôn khớp nhịp — đó là lý do nó dễ nhất và nên làm trước. Đổi lại là tốn bộ nhớ và voice, vì mọi lớp luôn decode kể cả khi im.
>
> Khi cần đổi bối cảnh lớn, tôi thêm **horizontal resequencing**, và lúc đó bài toán khó là chỗ nối. Ba cách theo thứ tự chất lượng: crossfade thẳng, chờ cuối ô nhịp, và **stinger** — một đoạn một tới hai giây phát đè lên để tai không nhận ra chỗ nối. Muốn chờ đúng nhịp thì tempo và số phách mỗi ô phải khai trong dữ liệu, đừng đoán.
>
> Nguồn tín hiệu tôi nối vào là `intensity` của AI Director, vì nó đã là một con số 0–1 mô tả mức căng. Và bắt buộc có **hysteresis**: vào lớp ba ở 0,5, thoát ra ở 0,35 — nếu không thì intensity dao động quanh ngưỡng sẽ làm nhạc nhấp nháy, và người nghe đọc nó là lỗi chứ không phải là thiết kế.

**Họ sẽ đào tiếp**

- *"Vì sao chuyển lớp không bao giờ lệch phách?"* → Vì các lớp **chưa bao giờ dừng**: chúng phát song song từ đầu và luôn ở cùng vị trí timeline, nên bật một lớp chỉ là mở âm lượng của thứ đang chạy sẵn. Đó cũng là lý do kỹ thuật này tốn tài nguyên — mình trả bằng voice để mua sự đồng bộ.
- *"Độ trễ 1–4 giây của resequencing có chấp nhận được không?"* → Tuỳ sự kiện. Vào chiến đấu boss thì một ô nhịp là chấp nhận được và stinger che gần hết. Nhưng phản ứng với một cú đánh trúng thì không — loại đó phải là layering hoặc SFX. Quy tắc: sự kiện càng ngắn thì càng không dùng resequencing.
- *"Nhạc thích ứng có làm hỏng ý đồ của nhạc sĩ không?"* → Có, nếu kỹ thuật được chọn sau khi nhạc đã viết. Cách tránh là chốt kỹ thuật và **số lớp trước khi đặt nhạc**, rồi đưa nhạc sĩ đúng ràng buộc: mọi tổ hợp lớp phải nghe được, mỗi đoạn phải vào ra được từ những đoạn nào.
- *"Dùng AI ở khâu này thế nào?"* → Nhạc nền chung thì AI làm được khá, nhưng **nhạc thích ứng thì khó** vì nó cần stem tách lớp khớp nhau tuyệt đối về tempo và hoà âm. Việc đáng giao hơn là phần hệ thống: sinh code lên lịch theo ô nhịp, dựng bộ test chuyển trạng thái, và soát dữ liệu tempo của mọi track có khớp thực tế không.

**Cờ đỏ**

- Crossfade thẳng giữa hai track khác tempo rồi gọi đó là nhạc thích ứng.
- Không có hysteresis, nhạc bật tắt lớp liên tục.
- Tempo và số phách dò lúc chạy thay vì khai trong dữ liệu.
- Chọn kỹ thuật sau khi nhạc đã được viết xong.
- Dùng resequencing cho phản ứng tức thời với một sự kiện ngắn.

**Số / ví dụ nên thuộc**

- Hai kỹ thuật: **vertical layering** (đồng thời, đổi âm lượng) · **horizontal resequencing** (nối tiếp, chờ điểm chuyển).
- Độ trễ resequencing **1–4 giây**; stinger dài **1–2 giây**.
- Ba cách chuyển: crossfade thẳng · chờ cuối ô nhịp · **stinger + chuyển** (tốt nhất).
- Hysteresis mẫu: vào lớp 3 ở **0,5**, thoát ở **0,35**.
- Layering trên mobile: trần thực tế khoảng **3–4 lớp**, và nhạc nên **Streaming**.
