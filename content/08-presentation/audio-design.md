---
title: Audio Design
icon: 🔊
summary: Thiết kế SFX — layering, biến thể chống lặp, chia dải tần, và vì sao âm thanh là phản hồi rẻ nhất.
status: deep
read: 390
level: intermediate
order: 60
tags: [presentation, audio, feel]
related: [game-feel, audio-implementation, combat-systems, accessibility]
---

Âm thanh là **kênh phản hồi có tỉ lệ hiệu quả trên công sức cao nhất** trong game, và cũng là thứ bị cắt đầu tiên khi thiếu thời gian. Tắt tiếng một game hay và nó lập tức cảm thấy như prototype.

Lý do: tai phản ứng nhanh hơn mắt, và âm thanh truyền thông tin **không chiếm diện tích màn hình**.

## Layering — cách dựng một SFX

Một âm thanh tốt hiếm khi là một file. Nó là nhiều lớp chồng lên nhau, mỗi lớp một nhiệm vụ:

```
Transient  (0-20ms)    — cú va chạm. Quyết định cảm giác "trúng".
Body       (20-200ms)  — chất liệu. Kim loại? Gỗ? Thịt?
Tail       (200ms+)    — không gian. Vang trong hang khác ngoài trời.
```

Ví dụ tiếng kiếm chém trúng giáp:
- Transient: tiếng "tách" sắc, ngắn
- Body: tiếng kim loại cọ
- Tail: vọng nhẹ

**Muốn đòn đánh mạnh hơn? Tăng transient, đừng tăng âm lượng tổng.** Đây là sai lầm phổ biến nhất — tăng volume chỉ làm ồn, không làm nặng.

## Chống lặp — ba kỹ thuật

Tai người phát hiện lặp cực nhanh. Nghe đúng một file 20 lần trong một phút là khó chịu ngay.

1. **Ngẫu nhiên cao độ ±5–10%.** Rẻ nhất, hiệu quả nhất. Áp cho gần như mọi SFX.
2. **Nhiều biến thể (3–5 file), chọn không lặp lại liền.** Dùng shuffle bag, không dùng random thuần — xem [[randomness]].
3. **Ngẫu nhiên âm lượng ±2–3 dB.** Nhẹ thôi, quá tay thì nghe như lỗi.

Kết hợp cả ba: 4 biến thể × pitch ngẫu nhiên ≈ không bao giờ nghe giống hệt.

**Ngoại lệ:** âm thanh UI và âm báo trạng thái quan trọng **không** nên ngẫu nhiên. Chúng cần nhất quán để người chơi học nhận diện.

## Chia dải tần — tránh tranh chấp

Nhiều âm thanh cùng lúc mà cùng dải tần thì chúng che nhau và thành một mớ đục. Phân bổ có chủ ý:

| Dải | Dành cho |
|---|---|
| 20–80 Hz | Nổ, bước chân boss, cảm giác "rung" |
| 80–250 Hz | Nhạc nền phần trầm, ambience |
| 250 Hz–2 kHz | Giọng nói, thân âm thanh chính |
| 2–6 kHz | **Phản hồi quan trọng**: trúng đòn, nhặt đồ, cảnh báo |
| 6 kHz+ | Chi tiết, không khí, độ "sáng" |

Dải **2–6 kHz là nơi tai nhạy nhất** — hãy giữ nó cho thông tin gameplay quan trọng, và cắt bớt nhạc/ambience ở dải đó để nhường chỗ. Đây là lý do kỹ thuật của ducking ở [[audio-implementation]].

## Âm thanh là thông tin, không chỉ trang trí

Mỗi SFX nên trả lời một câu hỏi:

- **Hành động của tôi có tác dụng không?** → tiếng trúng khác tiếng hụt rõ rệt
- **Có nguy hiểm không?** → âm cảnh báo trước đòn, xem telegraph ở [[combat-systems]]
- **Nguy hiểm ở đâu?** → âm thanh có hướng, xem [[audio-implementation]]
- **Trạng thái tôi thế nào?** → nhịp tim khi máu thấp, tiếng thở khi hết stamina

**Kiểm tra tắt hình:** nhắm mắt chơi 30 giây. Bạn biết được chuyện gì đang xảy ra không? Nếu không, âm thanh đang chỉ trang trí.

Ngược lại — **kiểm tra tắt tiếng** cũng phải qua (xem [[accessibility]]). Thông tin sống còn cần cả hai kênh.

## Ngân sách thực tế

- **Số âm thanh đồng thời:** 16–32 là đủ cho game 2D. Vượt quá thì không ai nghe ra gì nữa.
- **Giới hạn mỗi loại:** tối đa 3–4 instance cùng lúc của cùng một SFX. Mười viên đạn bắn cùng frame không được phát mười tiếng — clip và méo.
- **Khoảng cách tối thiểu giữa hai lần phát:** 30–50ms cho cùng một âm thanh.

## 🤖 Prompt cho AI

AI **không nghe được**. Nó không đánh giá được âm thanh hay dở. Nhưng nó dựng rất tốt **hệ thống phát âm thanh** có đủ chống lặp, giới hạn và ưu tiên — phần mà lập trình viên hay làm sơ sài.

**Phải nêu rõ:**
- Giới hạn: bao nhiêu voice tổng, bao nhiêu instance mỗi loại
- Quy tắc ngẫu nhiên: pitch/volume bao nhiêu, âm nào KHÔNG được ngẫu nhiên
- Ưu tiên khi vượt giới hạn: âm nào bị cắt trước
- Khoảng cách tối thiểu giữa hai lần phát cùng một âm

**Mẫu prompt**

```
Viết SfxPlayer cho <engine + phiên bản>.

Cấu hình mỗi SFX nằm trong ScriptableObject/JSON, KHÔNG hardcode:
  clips: AudioClip[]        (chọn theo shuffle bag, không lặp liền)
  pitchVariance: 0.08
  volumeVariance: 2         (dB)
  maxInstances: 3
  minIntervalMs: 40
  priority: 0-100
  bus: "SFX" | "UI" | "Ambience"

Ràng buộc:
- Tổng voice tối đa 24. Vượt thì cắt âm có priority THẤP NHẤT và đã phát lâu nhất.
- SFX có flag isUI=true thì BỎ QUA mọi ngẫu nhiên (phải nhất quán để học nhận diện).
- Object pool cho AudioSource, KHÔNG Instantiate lúc chạy.
- Không cấp phát trong Update.

Kèm:
- Debug overlay: danh sách voice đang phát, priority, thời gian còn lại
- Test: shuffle bag không lặp liền; vượt maxInstances thì không phát thêm;
  vượt tổng voice thì cắt đúng cái priority thấp nhất
```

**Bẫy thường gặp:** không giới hạn instance. Một vụ nổ spawn 30 mảnh, mỗi mảnh phát một tiếng va chạm → 30 âm chồng lên nhau, clip, méo, và nghe như lỗi. `maxInstances` là ràng buộc phải nêu ngay từ đầu.

## 🎮 Unity

Phần kiến trúc audio trong Unity nằm ở [[unity-audio]]. Mục này chỉ nói cách nối **quyết định thiết kế SFX** vào Unity.

**Layering trong Unity: một SFX = nhiều clip phát cùng lúc**

```csharp
[CreateAssetMenu(menuName = "Audio/Sfx Event")]
public class SfxEvent : ScriptableObject {
    [System.Serializable] public struct Layer {
        public AudioClip[] variants;    // shuffle bag, không random thuần
        public float volumeDb;
        public float delayMs;           // transient 0ms, body 0ms, tail có thể trễ
    }
    public Layer[] layers;
    public float pitchVariance = 0.08f;
    public int maxInstances = 3;
    public int priority = 128;          // 0 = cao nhất trong Unity, KHÔNG phải 255
}
```

`AudioSource.priority` trong Unity ngược trực giác: **0 là ưu tiên cao nhất**, 256 là thấp nhất. Đặt ngược là lý do âm thanh quan trọng bị cắt trước.

**Shuffle bag, không `Random.Range`**

```csharp
// Random thuần sẽ phát cùng một clip hai lần liền — tai nghe ra ngay
public class ShuffleBag {
    readonly int[] order; int cursor;
    public int Next() {
        if (cursor == 0) Shuffle();          // trộn lại khi hết lượt
        return order[cursor++ % order.Length];
    }
}
```

**Import settings quyết định RAM nhiều hơn code**

Bảng quyết định đầy đủ ở [[unity-audio]]. Tóm lại:

| Loại | Load Type | Compression |
|---|---|---|
| SFX ngắn, phát thường xuyên | Decompress On Load | ADPCM hoặc PCM |
| SFX dài, thưa | Compressed In Memory | Vorbis |
| Nhạc, ambience | Streaming | Vorbis |

Để nhạc ở `Decompress On Load` là cách nhanh nhất ăn hết 200MB RAM.

**Chia dải tần — làm được trong Unity**

AudioMixer có sẵn EQ effect. Đặt trên bus `Music`: cắt nhẹ 2–6 kHz (khoảng −3 dB) để nhường dải đó cho SFX gameplay. Đây là cách kỹ thuật thực hiện nguyên tắc ở phần trên, và nó hiệu quả hơn việc hạ toàn bộ âm lượng nhạc.

**Kiểm tra nhanh**
- Cho 20 viên đạn bắn cùng frame: có bị clip/méo không? (`maxInstances` phải chặn)
- `priority` của âm cảnh báo có **nhỏ hơn** âm phụ không?
- Profiler mục Audio: bao nhiêu voice đang phát? Vượt 32 là không ai nghe ra gì.
- Build ra máy thật: dung lượng RAM cho audio bao nhiêu?
