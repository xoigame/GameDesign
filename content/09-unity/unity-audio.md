---
title: Audio trong Unity
icon: 🔊
summary: Import settings quyết định RAM và CPU nhiều hơn code; pool AudioSource thay PlayOneShot; nhạc đúng nhịp chỉ có một cách là PlayScheduled trên dspTime.
status: deep
read: 690
level: intermediate
order: 100
tags: [unity, audio]
related: [audio-implementation, audio-design, adaptive-music, unity-optimization]
---

Kiến trúc bus, mức dB tham chiếu, ducking, và công thức slider → dB đã nằm ở [[audio-implementation]] (kể cả code `SetBusVolume` và Snapshot). Node này bắt đầu từ chỗ đó kết thúc: **những quyết định Unity-specific mà sound designer không thấy và lập trình viên không biết là mình đã quyết**.

Hai quyết định đắt nhất: **import settings của từng loại clip** (sai là ăn 200 MB RAM hoặc khựng 80 ms mỗi lần phát) và **cách phát nhạc** (`Play()` + timer không bao giờ khớp nhịp, dù code trông đúng).

## AudioMixer — ba thứ ngoài bus

**Snapshot cho trạng thái, không chỉ cho ducking.** Mỗi trạng thái game có một snapshot: `Normal`, `Paused` (lowpass 800 Hz trên Master, Music −6 dB, SFX −80), `Underwater`, `Menu`. Chuyển bằng `snapshot.TransitionTo(0.25f)`. Rẻ hơn viết state machine audio riêng, và sound designer chỉnh trong Editor không cần code. Giới hạn: snapshot lưu **giá trị**, không lưu bật/tắt effect — effect luôn chạy, chỉ tham số đổi; lowpass cutoff 22000 Hz coi như tắt.

**Expose parameter phải làm bằng tay** — chuột phải vào tham số → *Expose to script* — và `SetFloat` trả `false` âm thầm nếu quên. Đặt tên expose vào một `static class MixerParams` với `const string`, không rải string khắp code.

**Volume expose là dB, không phải 0–1.** Slider 0–1 → `Mathf.Log10(Mathf.Max(v, 0.0001f)) * 20f`. Người mới gán thẳng `SetFloat("MusicVol", slider.value)` và slider chỉ có tác dụng ở 0.9–1.0 vì mixer nhận 0 dB = full, 1 = +1 dB.

`AudioMixer.SetFloat` không chạy trong `Awake` (mixer chưa init) — gọi từ `Start` trở đi, và **snapshot đang transition đè lên `SetFloat`** cho cùng tham số. Tham số người chơi chỉnh (volume bus) không được nằm trong snapshot; để snapshot đụng effect và các group con thôi.

## Pool AudioSource — không PlayOneShot, không PlayClipAtPoint

`audioSource.PlayOneShot(clip)` trên một source chung: không dừng được từng tiếng, mọi tiếng chung `pitch`/`volume`/`spatialBlend` của source đó, không biết cái nào đang phát để giới hạn instance. Đủ cho prototype, hỏng khi cần `maxInstances` như [[audio-design]] yêu cầu.

`AudioSource.PlayClipAtPoint` tệ hơn: tạo GameObject "One shot audio" **mới mỗi lần gọi**, `Destroy` sau khi hết clip, và **không đi qua AudioMixerGroup nào** — tiếng đó lọt khỏi bus, settings volume không đụng được, ducking vô hiệu. Cấm trong codebase; grep khi review.

Pool 8–16 `AudioSource` cho SFX là đủ cho game 2D/3D indie (voice tổng 24–32 tính cả nhạc và ambience):

```csharp
public class SfxPool : MonoBehaviour {
    [SerializeField] AudioMixerGroup sfxGroup;
    [SerializeField, Range(4, 32)] int size = 12;
    AudioSource[] pool; int cursor;

    void Awake() {
        pool = new AudioSource[size];
        for (int i = 0; i < size; i++) {
            var src = new GameObject($"Sfx_{i}").AddComponent<AudioSource>();
            src.transform.SetParent(transform, false);
            src.outputAudioMixerGroup = sfxGroup;       // mọi tiếng qua bus, không ngoại lệ
            src.playOnAwake = false;
            src.dopplerLevel = 0f;                      // Doppler tắt, xem audio-implementation
            src.rolloffMode = AudioRolloffMode.Linear;
            src.minDistance = 2f; src.maxDistance = 30f;
            pool[i] = src;
        }
    }

    public AudioSource Play(AudioClip clip, Vector3 pos, float volume = 1f,
                            float spatialBlend = 1f, int priority = 128, float pitchVar = 0.05f) {
        var src = Acquire();
        src.transform.position = pos;
        src.clip = clip;
        src.volume = volume;
        src.spatialBlend = spatialBlend;                // 0 = 2D (UI, cảnh báo boss), 1 = 3D
        src.priority = priority;                        // 0 cao nhất … 256 thấp nhất
        src.pitch = 1f + Random.Range(-pitchVar, pitchVar);
        src.Play();
        return src;                                     // caller giữ để Stop nếu cần
    }

    AudioSource Acquire() {
        for (int i = 0; i < pool.Length; i++) {
            var s = pool[(cursor + i) % pool.Length];
            if (!s.isPlaying) { cursor = (cursor + i + 1) % pool.Length; return s; }
        }
        var victim = pool[0];                           // hết source: cướp tiếng ít quan trọng nhất
        foreach (var s in pool) if (s.priority > victim.priority) victim = s;
        return victim;
    }
}
```

Quy tắc `priority` phải viết ra: nhạc 0, giọng/cảnh báo boss 16, đòn trúng người chơi 32, nổ 48, đòn thường 96, bước chân/va chạm nhỏ 200. Không đặt thì mọi thứ 128 và Unity cắt ngẫu nhiên.

## Import settings — bảng quyết định

Đây là phần lập trình viên phải làm chủ, vì mặc định của Unity (`Vorbis`, `Decompress On Load`, quality 100) sai cho **mọi** loại clip.

| Loại clip | Load Type | Compression | Vì sao | 1 phút stereo 44.1k chiếm |
|---|---|---|---|---|
| SFX ngắn < 1 s, phát nhiều (đòn, bước chân, UI) | Decompress On Load | **ADPCM** (hoặc PCM nếu < 0.2 s và cần sạch) | Phát tức thì, giải nén 1 lần lúc load, CPU gần 0 khi phát | ~2.6 MB (ADPCM 3.5:1) |
| SFX dài 1–10 s, ít phát (kết liễu, cutscene) | Compressed In Memory | Vorbis q 0.5–0.7 | Không chiếm RAM PCM, giải nén lúc phát tốn CPU nhưng ít instance | ~1.1 MB |
| Nhạc 1–5 phút | **Streaming** | Vorbis q 0.6–0.8 | Không nạp vào RAM, đọc từ đĩa ~200 KB buffer; tối đa 2–4 stream cùng lúc | ~1.2 MB trên đĩa, ~0.2 MB RAM |
| Ambience loop 20–60 s | Compressed In Memory | Vorbis q 0.4–0.6 | Streaming nhiều file loop cùng lúc làm seek đĩa; in-memory nén là cân bằng | ~0.8 MB |
| Giọng nói | Streaming hoặc Compressed In Memory | Vorbis q 0.5 | Nhiều file, mỗi file phát một lần | — |

Đối chiếu: **PCM không nén 1 phút stereo = 10.6 MB**. Nhạc `Decompress On Load` + Vorbis là bẫy kinh điển: Unity giải nén Vorbis ra PCM đầy đủ lúc load → 3 bài nhạc 3 phút = 95 MB RAM trên điện thoại 3 GB, và load scene khựng 400 ms để giải nén.

Ba checkbox đi kèm:
- **Force To Mono** cho mọi SFX 3D. Spatializer trộn về mono trước khi pan; giữ stereo là tốn gấp đôi RAM cho thứ bị vứt đi. Chỉ giữ stereo cho nhạc, ambience 2D, và UI có ý đồ stereo.
- **Sample Rate: Override 22050 Hz** cho SFX không có nội dung > 10 kHz (bước chân, va chạm trầm, UI trầm). Giảm nửa RAM, tai không phân biệt trong game. Không đụng nhạc và cymbal/kính vỡ.
- **Load In Background** cho clip > 1 s để `LoadAudioData` không chặn main thread; **Preload Audio Data** tắt cho clip hiếm dùng — nhưng phải tự gọi `clip.LoadAudioData()` trước khi cần (lúc load level, khi enemy spawn), không thì **lần đầu phát khựng 20–80 ms** đúng lúc đòn trúng. Đó là lý do "tiếng nổ đầu tiên mỗi màn bị trễ" mà không ai đo ra.

Ép settings theo thư mục bằng `AssetPostprocessor` ([[unity-editor-tools]]) — `Assets/Audio/SFX/` = ADPCM + mono + Decompress, `Assets/Audio/Music/` = Vorbis + Streaming. Không dựa vào tay người.

## Nhạc đúng nhịp: `PlayScheduled` và `dspTime`

`source.Play()` bắt đầu ở lần mixer tick kế tiếp — trễ 5–20 ms không xác định. Coroutine `WaitForSeconds(barLength)` rồi `Play()` lệch cộng dồn theo frame time. Với nhạc, cách duy nhất chính xác đến mẫu là **lịch theo đồng hồ DSP**:

```csharp
public class MusicScheduler : MonoBehaviour {
    [SerializeField] AudioSource[] layers;      // vertical layering: cùng độ dài, cùng BPM
    [SerializeField] float bpm = 120f;
    [SerializeField] int beatsPerBar = 4;
    double startDsp;

    public void StartAll() {
        startDsp = AudioSettings.dspTime + 0.2;             // 200 ms lead để mọi source kịp prepare
        foreach (var l in layers) { l.loop = true; l.PlayScheduled(startDsp); }
        // sau đó CHỈ đổi l.volume — không Play/Stop từng layer, xem adaptive-music
    }

    double BarLength => 60.0 / bpm * beatsPerBar;

    public double NextBarDsp() {
        double elapsed = AudioSettings.dspTime - startDsp;
        return startDsp + (System.Math.Floor(elapsed / BarLength) + 1) * BarLength;
    }

    /// Horizontal resequencing: đoạn mới vào đúng đầu ô nhịp, đoạn cũ kết thúc cùng thời điểm.
    public void SwitchSegment(AudioSource current, AudioSource next, AudioSource stinger = null) {
        double t = NextBarDsp();
        if (t - AudioSettings.dspTime < 0.05) t += BarLength;   // quá gần, dời sang ô sau
        next.PlayScheduled(t);
        current.SetScheduledEndTime(t);
        if (stinger) stinger.PlayScheduled(t - 0.12);           // stinger đè lên chỗ nối, xem adaptive-music
    }
}
```

Điểm mấu chốt: `dspTime` là `double`, độc lập `Time.timeScale` và frame rate. **Mọi phép tính nhịp dùng `double`**, không ép về `float` — sai số float sau 10 phút là vài ms, đủ nghe lệch.

**Loop không khớp:** Vorbis và ADPCM loop sạch nếu file được cắt đúng ở DAW; MP3 có padding đầu/cuối từ encoder → **không bao giờ dùng MP3 cho loop**. Loop kiểu "intro rồi vào loop" làm bằng hai clip và `PlayScheduled(startDsp + intro.length)` cho clip loop, không dùng `loopStart`.

**Crossfade** dùng đường equal-power (`cos`/`sin` của góc), không tuyến tính — [[adaptive-music]] có lý do. Fade volume trên `AudioSource.volume` là tuyến tính amplitude, nên `volume = Mathf.Cos(t * Mathf.PI / 2)` cho bên ra và `Sin` cho bên vào.

## 3D sound — số thực tế

Mặc định `Logarithmic Rolloff`, min 1, max 500. Nghĩa là: ở 500 m **vẫn nghe** (log không về 0, chỉ clamp ở max). Đây là lý do người chơi nghe bước chân enemy ở đầu kia bản đồ.

- **Linear** với min 2–3, max 25–40 (đơn vị thế giới) cho game hành động: designer đoán được "ngoài 30 m là im".
- **Custom curve** khi cần "gần thì to đều, xa thì tụt nhanh" — vẽ trong Inspector, và lưu thành preset để dùng chung.
- **Spread** 0 = điểm, 180 = bao quanh. Đặt 40–60 cho tiếng người chơi tự phát ra (bước chân của mình) để không "nhảy" trái phải khi xoay camera.
- **Doppler Level = 0** trừ game đua/máy bay.
- Tiếng cảnh báo, boss telegraph, UI: `spatialBlend = 0`.

`AudioListener` một cái, trên camera (3D) hoặc trên nhân vật (top-down 2D — camera xa nên listener trên camera làm mọi thứ nhỏ và trung tính). Hai listener → Unity cảnh báo và chỉ dùng một.

## Voice limit và priority

`Project Settings > Audio > Max Real Voices` mặc định 32 — số tiếng thực sự được trộn; `Max Virtual Voices` 512 — số tiếng được theo dõi. Vượt 32, Unity **ảo hoá** (im nhưng vẫn chạy thời gian) những tiếng có `priority` số lớn nhất và volume nghe nhỏ nhất. Không đặt priority thì tiếng bước chân của 8 enemy (mỗi tiếng 0.3 s, liên tục) nuốt mất tiếng nổ boss — bug người chơi mô tả là "đôi khi không có tiếng".

Bảng priority phía trên giải quyết. Thêm hai kiểm soát ở tầng game: `maxInstances` mỗi SFX (3 cho bước chân, 2 cho đòn) và `minInterval` 40 ms — đều là logic trong `SfxPool`, không phải của Unity.

Mobile: giảm `Max Real Voices` xuống 24 và **`DSP Buffer Size`** để `Good Latency` (512 mẫu ≈ 11 ms) — `Best Latency` (256) crackle trên Android tầm thấp khi CPU bận, `Best Performance` (1024, ~23 ms) đủ thấy trễ ở game nhịp. Android vốn có latency hệ thống 20–80 ms ngoài tầm Unity; iOS ~10 ms. Tiếng đòn đánh trên Android nên **phát ở frame va chạm**, không đợi animation event như PC.

## Pause, focus, và `timeScale`

`Time.timeScale = 0` **không dừng audio** — nhạc chạy tiếp, SFX đang phát chạy tiếp, và coroutine phát SFX theo `WaitForSeconds` thì đứng. Hai cách:
- `AudioListener.pause = true` dừng **mọi** source, kể cả tiếng UI menu pause → đặt `ignoreListenerPause = true` trên source UI.
- Snapshot `Paused` (lowpass + duck Music) nếu muốn nhạc vẫn nghe nhỏ dưới menu như [[ux-flow]] khuyên. Đây là cách phần lớn game làm.

`OnApplicationPause(true)` (điện thoại nhận cuộc gọi, ra Home) → `AudioListener.pause = true` và lưu `dspTime` để tính lại lịch nhạc khi về; nhạc `PlayScheduled` đã lên lịch trước khi pause sẽ **lệch** sau khi resume — gọi lại `StartAll()` từ đầu ô nhịp là rẻ nhất. iOS: `Mute Other Audio Sources` tắt trong Player Settings nếu muốn người chơi nghe Spotify song song (game puzzle nên tắt, game có nhạc quan trọng nên bật).

## FMOD / Wwise — khi nào đáng

Đáng khi **có sound designer riêng** làm việc toàn thời gian với audio, hoặc adaptive music nhiều hơn 2 trạng thái + layering ([[adaptive-music]] mức 3–4). Họ chỉnh ducking, RTPC, transition trong tool riêng, không đụng Unity, không đợi build. Chi phí: license (miễn phí dưới ngưỡng doanh thu, vẫn phải đăng ký), 1–2 tuần tích hợp, build size +5–10 MB, bank phải load/unload tay, và **AI agent gần như không sửa được** vì project FMOD là binary.

Team ≤ 5 người, không có sound designer chuyên trách: AudioMixer + pool + `PlayScheduled` như trên đủ đến ship. Đừng tích hợp FMOD vì "sau này cần".

## Bẫy lộ ra khi build

- `Decompress On Load` + Vorbis trên clip dài — Editor không thấy vì RAM dư, build mobile bị kill khi load scene 2. Đo bằng Memory Profiler, cột AudioClip.
- Clip có `Preload Audio Data` tắt và không ai gọi `LoadAudioData` → lần phát đầu khựng; Editor đã cache nên không thấy.
- WebGL: **không có streaming**, không có `PlayScheduled` chính xác trước khi người dùng tương tác (autoplay policy), và mọi clip nén phải giải nén trong trình duyệt. Nhạc trên WebGL = Compressed In Memory, và nút "Chạm để bắt đầu" là bắt buộc.
- Android: `AudioSource.time` không chính xác với Vorbis streaming (sai vài chục ms). Đồng bộ theo `dspTime` đã lưu, không đọc `source.time`.
- Sample rate hệ thống Android có thể là 48000 trong khi clip 44100 → Unity resample lúc chạy, tốn CPU. Đặt `Project Settings > Audio > System Sample Rate` khớp phần lớn máy đích, hoặc để 0 (theo máy) và import clip ở 48 k.

## Kiểm tra nhanh

- Profiler > Audio: `Total Audio CPU` ở cảnh đông nhất < 5% trên máy yếu nhất; `Playing Audio Sources` không vượt `Max Real Voices`.
- Memory Profiler: tổng AudioClip trong RAM < 25 MB (mobile) — clip nào > 3 MB phải là Streaming hoặc Compressed In Memory.
- Grep `PlayClipAtPoint` và `PlayOneShot` ngoài `SfxPool`: kết quả rỗng.
- Bật `Audio Profiler` chi tiết, chạy nhạc 3 phút, so `dspTime` của điểm chuyển với lý thuyết: sai số < 5 ms.
- Nhận cuộc gọi (hoặc bấm Home) giữa trận rồi quay lại: nhạc còn khớp nhịp không, SFX có "dồn" một lượt không?

## 🤖 Prompt cho AI

AI viết audio Unity bằng `PlayOneShot` trên một `AudioSource` chung, phát nhạc bằng `Play()` + coroutine đếm giây, để mặc định import settings, và không biết `timeScale = 0` không dừng âm thanh.

**Phải nêu rõ:**
- Số source trong pool và bảng `priority` cho từng nhóm tiếng
- BPM, số phách/ô nhịp, và yêu cầu dùng `dspTime` (double) cho mọi phép tính nhịp
- Import settings theo thư mục (Load Type × Compression × mono × sample rate)
- Rolloff và min/max distance thực tế; tiếng nào là 2D
- Hành vi khi pause và khi mất focus (`OnApplicationPause`)
- Nền tảng: mobile cần `DSP Buffer Size`, WebGL cần nút bắt đầu

**Mẫu prompt**

```
Viết tầng audio cho Unity 6000.0 LTS, mobile Android/iOS, AudioMixer MainMixer.mixer đã có bus
Master > Music, SFX, UI, Ambience (expose: MusicVol, SfxVol, UiVol, AmbVol — đã expose).

SfxPool: 12 AudioSource tạo trong Awake, outputAudioMixerGroup = SFX, playOnAwake false,
Doppler 0, rolloff Linear min 2 max 30. Hết source thì cướp source có priority số lớn nhất.
Priority: boss telegraph 16, player hit 32, explosion 48, attack 96, footstep 200.
maxInstances mỗi SFX (đọc từ SfxData ScriptableObject), minInterval 40 ms, pitch ±5%.
CẤM AudioSource.PlayClipAtPoint. CẤM PlayOneShot ngoài SfxPool. CẤM new GameObject lúc chạy.

MusicScheduler: 3 layer PlayScheduled cùng dspTime + 0.2; đổi trạng thái CHỈ bằng volume,
fade equal-power 0.8 s. Đổi đoạn: PlayScheduled ở đầu ô nhịp kế (bpm 128, 4/4) + SetScheduledEndTime.
Mọi phép tính dùng double, KHÔNG dùng Time.time hay coroutine đếm giây.

Pause: snapshot Paused.TransitionTo(0.2f), KHÔNG dùng timeScale để dừng audio.
OnApplicationPause(true): AudioListener.pause = true; khi resume gọi lại StartAll từ đầu ô nhịp.

AssetPostprocessor OnPreprocessAudio:
  Assets/Audio/SFX/**   -> ADPCM, Decompress On Load, Force To Mono, 22050 Hz
  Assets/Audio/Music/** -> Vorbis 0.7, Streaming, stereo
  Assets/Audio/Amb/**   -> Vorbis 0.5, Compressed In Memory

Kèm debug overlay: source đang phát + priority, Audio CPU %, dspTime tới ô nhịp kế.
```

**Bẫy thường gặp:** AI tính điểm chuyển nhạc bằng `AudioSettings.dspTime` nhưng lưu vào `float` hoặc so với `Time.time` — trông đúng vì cùng đơn vị giây, chạy đúng trong 30 giây đầu, rồi lệch dần vì `Time.time` chịu `timeScale` và frame time còn `dspTime` thì không. Yêu cầu tường minh: **mọi biến thời gian nhạc là `double` và chỉ so với `dspTime`**, test bằng bài 5 phút và đo sai số điểm chuyển cuối.
