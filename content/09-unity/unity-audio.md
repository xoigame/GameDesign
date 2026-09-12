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

## 💻 Code

Demo dựng tầng audio tối thiểu đủ ship cho game indie: pool 16 AudioSource qua bus SFX thay `PlayOneShot`, slider 0–1 → dB đúng công thức và snapshot Paused chuyển trong 0.2 s, nhạc intro → loop nối khít theo `dspTime`. Kiểm chứng bằng cửa sổ AudioMixer, Profiler ▸ Audio và tai.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 340" role="img" aria-label="Hierarchy AudioRoot với 16 AudioSource con và hai source nhạc, sơ đồ bus MainMixer; Inspector hiện SfxPool, MixerController, MusicScheduler">
  <rect x="10" y="10" width="200" height="320" rx="8" class="fig-box"/>
  <text x="22" y="32" class="fig-label" font-size="13" font-weight="600">Hierarchy</text>
  <line x1="10" y1="42" x2="210" y2="42" class="fig-line"/>
  <rect x="16" y="50" width="188" height="18" rx="4" fill="#6ea8fe" opacity="0.18"/>
  <text x="22" y="63" class="fig-label" font-size="12" font-weight="600">▾ AudioRoot  (3 script)</text>
  <text x="38" y="81" class="fig-muted" font-size="11">Sfx_00 … Sfx_15</text>
  <text x="38" y="97" class="fig-muted" font-size="11">(AudioSource, tạo lúc Awake)</text>
  <text x="38" y="115" class="fig-muted" font-size="11">Music_Intro · Music_Loop</text>
  <text x="22" y="133" class="fig-muted" font-size="11">Main Camera  (AudioListener)</text>
  <line x1="10" y1="148" x2="210" y2="148" class="fig-line"/>
  <text x="22" y="168" class="fig-label" font-size="12" font-weight="600">MainMixer.mixer</text>
  <text x="22" y="186" class="fig-muted" font-size="11">Master   ─ Lowpass (snapshot)</text>
  <text x="34" y="202" class="fig-muted" font-size="11">├ Music    expose MusicVol</text>
  <text x="34" y="218" class="fig-muted" font-size="11">├ SFX       expose SfxVol</text>
  <text x="34" y="234" class="fig-muted" font-size="11">└ UI</text>
  <text x="22" y="256" class="fig-muted" font-size="11">Snapshots: Normal · Paused</text>
  <text x="22" y="272" class="fig-muted" font-size="11">Paused = Lowpass 800 Hz trên Master</text>
  <text x="22" y="288" class="fig-muted" font-size="11">MusicVol/SfxVol KHÔNG ở trong snapshot</text>
  <text x="22" y="316" class="fig-muted" font-size="11">Demo: Space SFX 2D · F SFX 3D · P pause</text>
  <rect x="226" y="10" width="424" height="320" rx="8" class="fig-box"/>
  <text x="238" y="32" class="fig-label" font-size="13" font-weight="600">Inspector — AudioRoot</text>
  <line x1="226" y1="42" x2="650" y2="42" class="fig-line"/>
  <rect x="234" y="50" width="408" height="18" rx="3" fill="#6ea8fe" opacity="0.22"/>
  <text x="242" y="63" class="fig-label" font-size="12" font-weight="600">Sfx Pool (Script)</text>
  <text x="250" y="82" class="fig-muted" font-size="11">Mixer Group</text><text x="440" y="82" class="fig-label" font-size="11">SFX (MainMixer)</text>
  <text x="250" y="98" class="fig-muted" font-size="11">Pool Size</text><text x="440" y="98" class="fig-label" font-size="11">16</text>
  <text x="250" y="114" class="fig-muted" font-size="11">Pitch Jitter</text><text x="440" y="114" class="fig-label" font-size="11">0.05</text>
  <text x="250" y="130" class="fig-muted" font-size="11">Rolloff / Min Distance / Max Distance</text><text x="440" y="130" class="fig-label" font-size="11">Linear  /  2  /  30</text>
  <text x="250" y="146" class="fig-muted" font-size="11">Test Clip</text><text x="440" y="146" class="fig-label" font-size="11">sfx_hit</text>
  <rect x="234" y="156" width="408" height="18" rx="3" fill="#51cf9b" opacity="0.22"/>
  <text x="242" y="169" class="fig-label" font-size="12" font-weight="600">Mixer Controller (Script)</text>
  <text x="250" y="188" class="fig-muted" font-size="11">Mixer</text><text x="440" y="188" class="fig-label" font-size="11">MainMixer</text>
  <text x="250" y="204" class="fig-muted" font-size="11">Normal Snapshot / Paused Snapshot</text><text x="440" y="204" class="fig-label" font-size="11">Normal  /  Paused</text>
  <text x="250" y="220" class="fig-muted" font-size="11">Fade Seconds</text><text x="440" y="220" class="fig-label" font-size="11">0.2</text>
  <rect x="234" y="230" width="408" height="18" rx="3" fill="#ffd43b" opacity="0.22"/>
  <text x="242" y="243" class="fig-label" font-size="12" font-weight="600">Music Scheduler (Script)</text>
  <text x="250" y="262" class="fig-muted" font-size="11">Intro Clip / Loop Clip</text><text x="440" y="262" class="fig-label" font-size="11">bgm_intro  /  bgm_loop</text>
  <text x="250" y="278" class="fig-muted" font-size="11">Music Group</text><text x="440" y="278" class="fig-label" font-size="11">Music (MainMixer)</text>
  <text x="250" y="294" class="fig-muted" font-size="11">Lead Time</text><text x="440" y="294" class="fig-label" font-size="11">0.1</text>
  <text x="250" y="316" class="fig-muted" font-size="11">Import: SFX = ADPCM · Decompress On Load · Mono; Music = Vorbis · Streaming</text>
</svg>
<figcaption>Ba script cùng nằm trên AudioRoot. Hai tham số MusicVol/SfxVol phải Expose to script bằng tay trong AudioMixer; snapshot Paused chỉ đụng Lowpass cutoff (800 Hz), không đụng volume để không đè lên slider.</figcaption>
</figure>

**Script**

```csharp
// SfxPool.cs — Unity 6 (6000.x). 16 AudioSource con tạo lúc Awake, mọi tiếng đi qua bus SFX. Thay cho PlayOneShot / PlayClipAtPoint.
using UnityEngine;
using UnityEngine.Audio;
using UnityEngine.InputSystem;

public class SfxPool : MonoBehaviour
{
    public static SfxPool I { get; private set; }

    [SerializeField] AudioMixerGroup mixerGroup;              // MainMixer ▸ Master ▸ SFX
    [SerializeField, Range(4, 32)] int poolSize = 16;
    [SerializeField, Range(0f, 0.2f)] float pitchJitter = 0.05f;

    [Header("3D")]
    [SerializeField] AudioRolloffMode rolloff = AudioRolloffMode.Linear;
    [SerializeField] float minDistance = 2f;
    [SerializeField] float maxDistance = 30f;

    [Header("Demo")]
    [SerializeField] AudioClip testClip;                      // Space = 2D, F = 3D tại điểm ngẫu nhiên

    AudioSource[] pool;
    int cursor;

    void Awake()
    {
        I = this;
        pool = new AudioSource[poolSize];
        for (int i = 0; i < poolSize; i++)
        {
            var src = new GameObject($"Sfx_{i:00}").AddComponent<AudioSource>();
            src.transform.SetParent(transform, false);
            src.outputAudioMixerGroup = mixerGroup;           // mọi tiếng qua bus, không ngoại lệ
            src.playOnAwake = false;
            src.dopplerLevel = 0f;
            src.rolloffMode = rolloff;
            src.minDistance = minDistance;
            src.maxDistance = maxDistance;
            pool[i] = src;
        }
    }

    /// Tiếng 2D (UI, cảnh báo boss): không phụ thuộc vị trí listener.
    public AudioSource Play(AudioClip clip, float volume = 1f, int priority = 128)
        => PlayInternal(clip, Vector3.zero, 0f, volume, priority);

    /// Tiếng 3D tại một điểm trong thế giới.
    public AudioSource Play3D(AudioClip clip, Vector3 pos, float volume = 1f, int priority = 128)
        => PlayInternal(clip, pos, 1f, volume, priority);

    AudioSource PlayInternal(AudioClip clip, Vector3 pos, float spatialBlend, float volume, int priority)
    {
        if (clip == null) return null;
        var src = Acquire();
        src.transform.position = pos;
        src.clip = clip;
        src.volume = volume;
        src.spatialBlend = spatialBlend;
        src.priority = priority;                              // 0 cao nhất … 256 thấp nhất
        src.pitch = 1f + Random.Range(-pitchJitter, pitchJitter);   // ±5%: 20 bước chân không nghe "máy"
        src.Play();
        return src;                                           // caller giữ để Stop nếu cần
    }

    AudioSource Acquire()
    {
        // Quét từ cursor: source rỗi đầu tiên. Hết thì cướp source có priority thấp nhất (số lớn nhất).
        for (int i = 0; i < pool.Length; i++)
        {
            var s = pool[(cursor + i) % pool.Length];
            if (!s.isPlaying) { cursor = (cursor + i + 1) % pool.Length; return s; }
        }
        var victim = pool[cursor];
        foreach (var s in pool) if (s.priority > victim.priority) victim = s;
        cursor = (cursor + 1) % pool.Length;
        return victim;
    }

    public int PlayingCount
    {
        get { int n = 0; foreach (var s in pool) if (s.isPlaying) n++; return n; }
    }

    void Update()
    {
        var kb = Keyboard.current;
        if (kb == null || testClip == null) return;
        if (kb.spaceKey.wasPressedThisFrame) Play(testClip);
        if (kb.fKey.wasPressedThisFrame) Play3D(testClip, Random.insideUnitSphere * 20f, 1f, 96);
    }
}
```

```csharp
// MixerController.cs — slider 0–1 → dB cho hai expose param, và chuyển snapshot Normal/Paused khi pause.
using UnityEngine;
using UnityEngine.Audio;
using UnityEngine.InputSystem;

public class MixerController : MonoBehaviour
{
    public static class Params                         // tên expose — khớp đúng chữ trong AudioMixer, không rải string khắp code
    {
        public const string SfxVol = "SfxVol";
        public const string MusicVol = "MusicVol";
    }

    [SerializeField] AudioMixer mixer;                 // MainMixer.mixer
    [SerializeField] AudioMixerSnapshot normalSnapshot;
    [SerializeField] AudioMixerSnapshot pausedSnapshot;
    [SerializeField, Min(0f)] float fadeSeconds = 0.2f;

    readonly AudioMixerSnapshot[] snapshots = new AudioMixerSnapshot[1];
    readonly float[] weights = { 1f };
    bool paused;

    void Start()
    {
        // KHÔNG gọi SetFloat trong Awake — mixer chưa init, SetFloat trả false âm thầm.
        SetSfxVolume(PlayerPrefs.GetFloat(Params.SfxVol, 0.8f));
        SetMusicVolume(PlayerPrefs.GetFloat(Params.MusicVol, 0.7f));
    }

    public void SetSfxVolume(float linear01)   => SetLinear(Params.SfxVol, linear01);    // gắn vào Slider.onValueChanged
    public void SetMusicVolume(float linear01) => SetLinear(Params.MusicVol, linear01);

    void SetLinear(string param, float v)
    {
        v = Mathf.Clamp01(v);
        float dB = Mathf.Log10(Mathf.Max(v, 0.0001f)) * 20f;     // 1 → 0 dB, 0.5 → −6 dB, 0.1 → −20 dB, 0 → −80 dB
        if (!mixer.SetFloat(param, dB))
            Debug.LogError($"Tham số '{param}' chưa Expose to script trong {mixer.name}", mixer);
        PlayerPrefs.SetFloat(param, v);
    }

    public void SetPaused(bool value)
    {
        if (paused == value) return;
        paused = value;
        snapshots[0] = value ? pausedSnapshot : normalSnapshot;
        mixer.TransitionToSnapshots(snapshots, weights, fadeSeconds);   // Paused: lowpass 800 Hz. Không đụng Time.timeScale.
    }

    void Update()
    {
        var kb = Keyboard.current;
        if (kb != null && kb.pKey.wasPressedThisFrame) SetPaused(!paused);
    }
}
```

```csharp
// MusicScheduler.cs — intro → loop nối khít theo dspTime, không Play() + coroutine. Mọi biến thời gian nhạc là double.
using UnityEngine;
using UnityEngine.Audio;

public class MusicScheduler : MonoBehaviour
{
    [SerializeField] AudioClip introClip;             // cắt đúng ở DAW; không MP3 (padding đầu/cuối làm hở mối nối)
    [SerializeField] AudioClip loopClip;
    [SerializeField] AudioMixerGroup musicGroup;      // MainMixer ▸ Master ▸ Music
    [SerializeField, Range(0.05f, 0.5f)] float leadTime = 0.1f;   // 100 ms cho source kịp prepare trước mốc

    AudioSource introSrc, loopSrc;
    double startDsp, loopStartDsp;

    void Awake()
    {
        introSrc = Create("Music_Intro");
        loopSrc = Create("Music_Loop");
        loopSrc.loop = true;
    }

    AudioSource Create(string name)
    {
        var src = new GameObject(name).AddComponent<AudioSource>();
        src.transform.SetParent(transform, false);
        src.outputAudioMixerGroup = musicGroup;
        src.playOnAwake = false;
        src.spatialBlend = 0f;                        // nhạc là 2D
        src.priority = 0;                             // nhạc không bao giờ bị cướp voice
        return src;
    }

    void Start() => Play();

    public void Play()
    {
        introSrc.clip = introClip;
        loopSrc.clip = loopClip;

        startDsp = AudioSettings.dspTime + leadTime;
        // Độ dài intro = mẫu / tần số, tính bằng double — clip.length là float, lệch vài mẫu là nghe "click" ở mối nối
        double introLength = (double)introClip.samples / introClip.frequency;
        loopStartDsp = startDsp + introLength;

        introSrc.PlayScheduled(startDsp);
        introSrc.SetScheduledEndTime(loopStartDsp);   // intro dừng đúng mẫu mà loop bắt đầu
        loopSrc.PlayScheduled(loopStartDsp);
    }

    public void Stop() { introSrc.Stop(); loopSrc.Stop(); }

    void OnApplicationPause(bool pauseStatus)
    {
        AudioListener.pause = pauseStatus;            // dừng mọi source; source UI muốn kêu thì ignoreListenerPause = true
        if (pauseStatus || AudioSettings.dspTime < loopStartDsp) return;
        // Đã ở đoạn loop khi bị pause: lịch cũ lệch, lên lịch lại loop từ đầu ô nhịp, bỏ intro
        loopSrc.Stop();
        loopStartDsp = AudioSettings.dspTime + leadTime;
        loopSrc.PlayScheduled(loopStartDsp);
    }

    /// Cho debug overlay và cho SwitchSegment: âm là đã vào loop.
    public double SecondsUntilLoop => loopStartDsp - AudioSettings.dspTime;

#if UNITY_EDITOR || DEVELOPMENT_BUILD
    void OnGUI()
    {
        double now = AudioSettings.dspTime;
        string state = now < startDsp ? "chờ" : now < loopStartDsp ? "intro" : "loop";
        GUI.Label(new Rect(10, 10, 520, 22),
            $"music: {state}   tới loop: {loopStartDsp - now:F3} s   dsp: {now:F3}   sfx đang phát: {SfxPool.I?.PlayingCount}");
    }
#endif
}
```

**Chạy thử**
- Play: overlay góc trên hiện `chờ` đúng ~0.1 s → `intro` → `loop` khi `tới loop` qua 0.000; mối nối không khựng, không click. Đổi tạm `PlayScheduled` thành `Play()` trong coroutine `WaitForSeconds(introClip.length)` để nghe lệch 5–30 ms và lệch khác nhau mỗi lần.
- Bấm F 20 lần trong 1 giây: Hierarchy thấy `Sfx_00…Sfx_15` lần lượt sáng (icon loa), `sfx đang phát` tối đa 16; lần thứ 17 khi cả 16 còn kêu → cướp source priority thấp nhất, không lỗi, không GameObject mới. Pitch mỗi tiếng khác nhau trong ±5%.
- Gọi `SetSfxVolume(0.5f)` (Slider hoặc Inspector Debug): cửa sổ AudioMixer hiện SfxVol = −6.0 dB; 0.1 → −20 dB; 0 → −80 dB (im hẳn). Quên Expose to script → Console lỗi đỏ ghi đúng tên tham số ngay ở Start.
- Nhấn P: trong 0.2 s nhạc "tối" lại (lowpass 800 Hz), Space vẫn phát SFX qua pool, `Time.timeScale` vẫn 1; P lần nữa trở về Normal. Kéo slider MusicVol trong lúc Paused: slider vẫn có tác dụng vì snapshot không giữ MusicVol.
- Trên điện thoại bấm Home 10 s rồi quay lại: im hoàn toàn khi ẩn, khi về loop bắt đầu lại sau 0.1 s, không "dồn" một loạt SFX. Grep `PlayClipAtPoint` và `PlayOneShot` trong project: 0 kết quả.

## 🎤 Phỏng vấn

**Câu hay gặp**

| Mức | Câu hỏi |
|---|---|
| Junior | Slider âm lượng kéo tới 0.9 mới thấy nhỏ đi. Vì sao? |
| Junior | `PlayOneShot` và `PlayClipAtPoint` có vấn đề gì khi bắn 200 phát đạn? |
| Mid | Import settings cho SFX, nhạc nền, ambience — khác nhau thế nào và vì sao? |
| Mid | Nhạc phải đổi đúng nhịp khi vào combat. Anh làm thế nào? |
| Senior | 30 kẻ địch cùng gầm một lúc, âm thanh vỡ nát. Xử lý? |
| Senior | Khi nào đáng đưa FMOD/Wwise vào dự án? |

**Khung trả lời 60 giây** — "Kiến trúc audio của anh?"

> AudioMixer với ba bus Music / SFX / UI, và **snapshot cho từng trạng thái game**: Normal, Paused (lowpass 800Hz trên Master, Music −6dB), Underwater, Menu — chuyển bằng `TransitionTo(0.25f)`. Rẻ hơn viết state machine audio riêng, và sound designer chỉnh được trong Editor không cần code.
>
> Phát âm thanh đi qua một **pool AudioSource** có voice limit và priority, không `PlayOneShot` rải rác: 200 viên đạn cùng lúc là 200 voice, và hệ thống sẽ tự cắt bừa cái nào cũng được — thường là cắt đúng cái quan trọng. Pool cho phép tôi nói "tối đa 4 tiếng súng cùng loại, cái mới cướp chỗ cái cũ nhất".
>
> Và một chi tiết rất hay bị sai: **volume expose là dB, không phải 0–1**. Slider phải quy đổi `Mathf.Log10(Mathf.Max(v, 0.0001f)) * 20f`, nếu không slider chỉ có tác dụng trong khoảng 0.9–1.0.

**Họ sẽ đào tiếp**

- *"Import settings?"* → SFX ngắn dưới 1s: **Decompress On Load + ADPCM** — giải nén một lần lúc load, phát tức thì, CPU gần 0. Nhạc: **Streaming + Vorbis** — không nạp vào RAM, nhưng tối đa 2–4 stream cùng lúc vì mỗi stream là một luồng đọc đĩa. Ambience loop: Compressed In Memory. Sai bảng này là hoặc RAM nổ, hoặc giật mỗi lần phát.
- *"Nhạc đúng nhịp?"* → Dùng `AudioSettings.dspTime` và `PlayScheduled`, **không** dùng `Time.time`. Mọi biến thời gian nhạc phải là `double`: `Time.time` chịu `timeScale` và trôi theo frame time, `dspTime` thì không — lệch tích luỹ sau vài phút và không ai hiểu vì sao. Intro-rồi-loop làm bằng hai clip + `PlayScheduled(startDsp + intro.length)`.
- *"Loop bị hở?"* → **Không bao giờ dùng MP3 cho loop**: encoder chèn padding đầu/cuối. Vorbis hoặc ADPCM, cắt đúng ở DAW.
- *"Crossfade?"* → Equal-power (`cos`/`sin`), không tuyến tính — vì `AudioSource.volume` là amplitude tuyến tính nên fade tuyến tính sẽ nghe "tụt" ở giữa.
- *"30 con gầm cùng lúc?"* → Voice limit theo nhóm + priority + cooldown theo âm thanh; cộng thêm biến thiên pitch nhẹ (±5%) để không nghe ra hiệu ứng "vọng máy". Nguyên nhân vỡ tiếng là cộng dồn biên độ, không phải chất lượng file.
- *"FMOD/Wwise?"* → Khi có **sound designer thật** làm việc song song và cần họ tự làm layer, RTPC, adaptive music mà không chờ lập trình; hoặc khi cần profiling audio nghiêm túc. Game nhỏ thì AudioMixer + snapshot là đủ, và mỗi middleware là thêm một build step, thêm một license.

**Cờ đỏ**

- Gán `SetFloat("MusicVol", slider.value)` thẳng từ slider.
- `PlayClipAtPoint` trong `Update` (tạo GameObject mới mỗi lần).
- Quên *Expose to script* rồi không hiểu vì sao `SetFloat` trả `false` mà không có lỗi.
- Không tắt tiếng khi app mất focus trên mobile (`OnApplicationFocus`) — nhạc vẫn chạy khi người chơi nhận cuộc gọi.
- Để tất cả clip ở `Decompress On Load` vì "nhanh nhất".

**Số / ví dụ nên thuộc**

- dB: `20 * log10(v)`; −80dB coi như tắt, 0dB là full.
- Streaming tối đa 2–4 stream cùng lúc.
- 1 phút stereo 44.1k: ADPCM ~2.6MB · Vorbis q0.5 ~1.1MB.
- `AudioSettings.dspTime` là `double`, không chịu `timeScale`.
