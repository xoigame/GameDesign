---
title: Audio Implementation
icon: 🎚️
summary: Kiến trúc bus, mixing, ducking, âm thanh không gian — phần kỹ thuật quyết định game nghe sạch hay đục.
status: deep
read: 400
level: advanced
order: 70
tags: [presentation, audio, architecture]
related: [audio-design, adaptive-music, architecture-patterns, accessibility]
---

Âm thanh hay mà lắp sai vẫn nghe tệ. Đây là phần kỹ thuật, và là **quyết định kiến trúc khó sửa về sau** — giống như tách dữ liệu khỏi code ở [[data-driven-design]].

## Kiến trúc bus — dựng từ ngày đầu

Không bao giờ phát âm thanh trực tiếp. Mọi thứ đi qua bus:

<figure class="fig">
<svg viewBox="0 0 660 260" role="img" aria-label="Cây audio bus: Master chứa Music, SFX (Player, Enemy, World), UI, Ambience, Voice">
  <rect x="266" y="14" width="128" height="38" rx="8" fill="#4dd4e0" opacity="0.18" stroke="#4dd4e0"/>
  <text x="330" y="38" text-anchor="middle" class="fig-label" font-size="14">Master</text>
  <text x="404" y="38" class="fig-muted" font-size="10">≤ −1 dBFS</text>
  <g class="fig-line" stroke-width="1.5">
    <path d="M330 52 V72"/>
    <path d="M70 72 H590"/>
    <path d="M70 72 V96 M200 72 V96 M330 72 V96 M460 72 V96 M590 72 V96"/>
  </g>
  <g>
    <rect x="18"  y="96" width="104" height="34" rx="7" class="fig-box"/>
    <rect x="148" y="96" width="104" height="34" rx="7" fill="#6ea8fe" opacity="0.16" stroke="#6ea8fe"/>
    <rect x="278" y="96" width="104" height="34" rx="7" class="fig-box"/>
    <rect x="408" y="96" width="104" height="34" rx="7" class="fig-box"/>
    <rect x="538" y="96" width="104" height="34" rx="7" class="fig-box"/>
  </g>
  <g text-anchor="middle" class="fig-label" font-size="12.5">
    <text x="70" y="117">Music</text><text x="200" y="117">SFX</text>
    <text x="330" y="117">UI</text><text x="460" y="117">Ambience</text><text x="590" y="117">Voice</text>
  </g>
  <g text-anchor="middle" class="fig-muted" font-size="9.5">
    <text x="70" y="144">−14</text><text x="200" y="144">−8</text>
    <text x="330" y="144">−14</text><text x="460" y="144">−26</text><text x="590" y="144">−10</text>
  </g>
  <g class="fig-line" stroke-width="1.5">
    <path d="M200 130 V158"/>
    <path d="M118 158 H282"/>
    <path d="M118 158 V178 M200 158 V178 M282 158 V178"/>
  </g>
  <g>
    <rect x="72"  y="178" width="92" height="30" rx="6" class="fig-box"/>
    <rect x="154" y="178" width="92" height="30" rx="6" class="fig-box"/>
    <rect x="236" y="178" width="92" height="30" rx="6" class="fig-box"/>
  </g>
  <g text-anchor="middle" class="fig-muted" font-size="11.5">
    <text x="118" y="197">Player</text><text x="200" y="197">Enemy</text><text x="282" y="197">World</text>
  </g>
  <rect x="408" y="178" width="234" height="52" rx="7" fill="#ff8787" opacity="0.10" stroke="#ff8787" stroke-dasharray="4 3"/>
  <text x="525" y="197" text-anchor="middle" font-size="11" fill="#ff8787">ducking khi có sự kiện quan trọng</text>
  <text x="525" y="214" text-anchor="middle" class="fig-muted" font-size="10">Music −6 dB · Ambience −10 dB</text>
  <path d="M408 204 H340" class="fig-line" stroke="#ff8787" stroke-dasharray="3 3"/>
  <text x="330" y="250" text-anchor="middle" class="fig-muted" font-size="11">
    Không âm thanh nào được phát ngoài cây này — nếu không, settings và ducking đều vô hiệu
  </text>
</svg>
<figcaption>Cây bus phải dựng trước khi làm âm thanh thứ hai. Thêm nó sau khi đã có 200 âm thanh phát trực tiếp là việc rất mệt.</figcaption>
</figure>

Lợi ích cụ thể:
- Người chơi chỉnh được từng nhóm trong settings (yêu cầu tối thiểu, xem [[ux-flow]])
- Ducking hoạt động được (mục dưới)
- Tạm dừng game thì tắt SFX nhưng giữ Music, chỉ cần một dòng
- Đo được nhóm nào đang chiếm headroom

Thêm bus sau khi đã có 200 âm thanh phát trực tiếp là việc rất mệt. **Dựng cây bus trước khi làm âm thanh thứ hai.**

## Mixing — mốc thực dụng

Làm việc theo **headroom**, không theo "nghe được là xong":

| Bus | Mức tham chiếu | Ghi chú |
|---|---|---|
| Master peak | ≤ −1 dBFS | Chừa chỗ tránh clip |
| Music | −18 đến −12 LUFS | Nền, không tranh chấp |
| SFX quan trọng | −12 đến −6 dBFS | Trúng đòn, cảnh báo |
| SFX phụ | −24 đến −18 dBFS | Bước chân, va chạm nhỏ |
| UI | −18 đến −12 dBFS | Nhất quán, không giật mình |
| Ambience | −30 đến −24 dBFS | Có mặt mà không chú ý |

Quan trọng hơn con số tuyệt đối: **khoảng cách giữa SFX quan trọng và phần còn lại phải ít nhất 6–10 dB.** Đó là thứ khiến thông tin nổi lên khỏi nền.

## Ducking — nhường chỗ cho thông tin

Khi âm thanh quan trọng phát, hạ tạm các bus khác:

```
Sự kiện: người chơi trúng đòn
  → Music  −6 dB trong 400ms, hồi trong 600ms
  → Ambience −10 dB
  → SFX World −4 dB
```

Đây là cách kỹ thuật để thực hiện nguyên tắc "dải 2–6 kHz dành cho gameplay" ở [[audio-design]]. Không có ducking, âm cảnh báo bị chìm đúng lúc cần nghe nhất.

Ducking bằng sidechain compressor (nếu engine hỗ trợ) tự nhiên hơn ducking bằng volume envelope, nhưng envelope đủ dùng và dễ kiểm soát hơn.

## Âm thanh không gian

**2D:** panning theo trục X là đủ, và thường **tốt hơn** 3D thật. Giới hạn pan ở ±0.7 — pan cực đại nghe như âm thanh ở ngoài màn hình.

**3D:** cần quyết định
- Đường cong suy giảm: logarithmic tự nhiên hơn linear
- Khoảng cách min/max: dưới min là full volume, trên max là im
- Doppler: thường nên **tắt** trừ game đua, vì nó gây nhiễu thông tin

**Cả hai:** âm thanh cảnh báo quan trọng nên phát ở **2D, không suy giảm theo khoảng cách**. Người chơi cần nghe boss chuẩn bị ra đòn dù đang đứng xa.

## Cắt giảm, không chỉ thêm vào

Sai lầm phổ biến: mỗi khi thấy thiếu, thêm âm thanh mới. Kết quả là một mớ ồn.

Ngược lại, **khoảng lặng là công cụ**. Im lặng 200ms ngay trước đòn kết liễu làm nó nặng hơn mọi cách tăng âm lượng. Xem [[pacing]] — cùng nguyên lý tương phản.

Kiểm tra: **tắt từng bus một và nghe.** Bus nào tắt đi mà không thấy thiếu gì → bus đó đang chỉ làm ồn.

## Middleware hay tự viết

- **Tự viết** (AudioSource + AudioMixer của engine): đủ cho game nhỏ, không phụ thuộc, dễ cho AI agent sửa.
- **FMOD / Wwise**: mạnh hơn nhiều về adaptive music và mixing động, nhưng thêm dependency, thêm license, và agent khó thao tác vì cấu hình nằm trong file binary riêng.

Với dự án indie làm cùng AI, **tự viết trên hệ thống của engine thường đúng hơn** — mọi thứ là text, agent đọc và sửa được. Xem lưu ý ở [[tech-stack]].

## 🤖 Prompt cho AI

Đây là phần AI làm **rất tốt**: thuần kiến trúc và số, không cần tai nghe.

**Phải nêu rõ:**
- Cây bus đầy đủ
- Bảng ducking: sự kiện nào duck bus nào, bao nhiêu dB, attack/release
- Mức tham chiếu cho từng bus
- Quy tắc 2D/3D và âm nào bỏ qua suy giảm khoảng cách

**Mẫu prompt**

```
Dựng hệ thống audio cho <engine + phiên bản>. Tự viết, KHÔNG dùng FMOD/Wwise.

Cây bus: Master > [Music, SFX > (Player, Enemy, World), UI, Ambience]

Mức khởi điểm (đưa hết vào file config, chỉnh được lúc chạy):
  Master -1 | Music -14 | SFX -8 | UI -14 | Ambience -26   (dBFS)

Bảng ducking (bus bị hạ, dB, attack ms, release ms):
  onPlayerHit      -> Music -6, Ambience -10, SFX.World -4 | 40ms | 600ms
  onBossTelegraph  -> Music -4, Ambience -12               | 20ms | 400ms
  onUIOpen         -> SFX -8, Ambience -6                  | 80ms | 200ms

Quy tắc không gian:
- Mặc định 2D, pan theo X, giới hạn ±0.7
- SFX có flag ignoreDistance=true phát 2D full volume (cảnh báo boss)
- Doppler TẮT

Settings người chơi: slider riêng cho Master/Music/SFX/UI, lưu vào file,
áp dụng ngay khi kéo (không cần restart).

RÀNG BUỘC:
- KHÔNG phát âm thanh nào không qua bus. Viết test phát hiện vi phạm.
- Giá trị dB -> linear dùng 10^(dB/20), không dùng chia tuyến tính.
- Không cấp phát trong Update.

Kèm debug overlay: mức peak từng bus theo thời gian thực, bus nào đang bị duck.
```

**Bẫy thường gặp:** nhân slider 0–1 thẳng vào volume. Tai nghe theo thang logarit, nên slider ở 0.5 phải là khoảng −6 dB chứ không phải một nửa biên độ. Không nêu công thức `10^(dB/20)` thì AI gần như luôn làm tuyến tính, và người chơi thấy slider "chỉ có tác dụng ở đoạn cuối".

## 🎮 Unity

Unity có sẵn AudioMixer — dùng nó, đừng tự quản volume bằng `AudioSource.volume` rải rác.

**Component & nơi đặt**
- `Assets/Audio/MainMixer.mixer` — một AudioMixer asset
- Bus = AudioMixerGroup con trong mixer đó
- `AudioManager.cs` — singleton, nơi duy nhất gọi `SetFloat` lên mixer

**Setup mixer (làm bằng tay trong Editor)**

1. `Assets > Create > Audio Mixer`
2. Tạo cây group: `Master > Music, SFX (> Player, Enemy, World), UI, Ambience`
3. Với mỗi group cần chỉnh từ code: chuột phải vào **Volume** trong Inspector → **Expose 'Volume' to script**
4. Ở cửa sổ Audio Mixer, góc trên phải **Exposed Parameters** → đổi tên thành `MusicVol`, `SfxVol`, `UiVol`, `AmbienceVol`

Bước 3 là bước hay bị quên — không expose thì `SetFloat` trả về `false` và không có gì xảy ra, **không báo lỗi**.

**Code — chuyển đổi slider sang dB**

```csharp
public class AudioManager : MonoBehaviour {
    [SerializeField] AudioMixer mixer;

    /// slider 0..1 -> dB. Tai người nghe theo thang logarit, nên KHÔNG
    /// gán tuyến tính — slider ở 0.5 phải là ~ -6 dB, không phải nửa biên độ.
    public void SetBusVolume(string exposedParam, float linear01) {
        float dB = linear01 <= 0.0001f
            ? -80f                                   // tắt hẳn
            : Mathf.Log10(Mathf.Clamp01(linear01)) * 20f;
        mixer.SetFloat(exposedParam, dB);
    }
}
```

Nếu bỏ qua công thức này, người chơi sẽ thấy slider "chỉ có tác dụng ở đoạn cuối" — lỗi cảm nhận rất phổ biến.

**Ducking bằng Snapshot**

AudioMixer có **Snapshot** — lưu lại toàn bộ trạng thái mixer và chuyển mượt giữa chúng:

```csharp
[SerializeField] AudioMixerSnapshot normal, ducked;

public void DuckForHit() {
    ducked.TransitionTo(0.04f);                          // attack 40ms
    StartCoroutine(Restore(0.4f));
}
IEnumerator Restore(float delay) {
    yield return new WaitForSeconds(delay);
    normal.TransitionTo(0.6f);                           // release 600ms
}
```

Cách này gọn hơn nhiều so với tự lerp từng bus, và Unity lo phần nội suy.

**Lưu ý version:** `AudioMixer.SetFloat` **không hoạt động trong `Awake()`** — mixer chưa khởi tạo xong. Gọi trong `Start()` hoặc muộn hơn.

**Kiểm tra nhanh**
- Grep `AudioSource.volume` và `.PlayOneShot` không qua bus — phải bằng 0.
- Kéo slider Music xuống 50%: có nghe giảm khoảng một nửa *độ to cảm nhận* không?
- Tạm dừng game: SFX tắt, nhạc vẫn chạy?
