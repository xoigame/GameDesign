---
title: UX Flow
icon: 🧭
summary: Luồng ngoài lúc chơi — menu, settings, lưu game, xử lý lỗi. Phần ít ai thiết kế và ai cũng phải dùng.
status: deep
read: 370
level: intermediate
order: 50
tags: [presentation, ux, flow]
related: [ui-design, onboarding, accessibility, ux-hud]
---

Người chơi gặp menu **trước** khi gặp gameplay, và gặp lại nó mỗi phiên. Nhưng menu thường là thứ được làm cuối cùng, vội vàng, bởi người đã chán.

## Lần chạy đầu tiên

Đường đi từ lúc bấm icon đến lúc chơi được càng ngắn càng tốt:

```
Khởi động → [logo] → Menu chính → Chơi
```

Quy tắc thực dụng:
- **Logo bỏ qua được.** Mọi cutscene khởi động phải skip được bằng bất kỳ phím nào.
- **"Tiếp tục" nằm trên cùng** nếu đã có save. Người chơi cũ chiếm đa số lượt mở game.
- **Đừng hỏi gì trước khi cho chơi.** Chọn ngôn ngữ, độ khó, tên nhân vật — đẩy vào trong hoặc đoán mặc định hợp lý rồi cho đổi sau.
- **Dưới 30 giây** từ lúc mở app tới lúc điều khiển được nhân vật.

## Settings — tối thiểu phải có

Đây là danh sách người chơi thực sự cần, xếp theo mức độ bị bỏ sót:

**Âm thanh** — slider riêng cho Master / Music / SFX / UI. Áp dụng **ngay khi kéo**, không cần bấm Apply. Xem [[audio-implementation]].

**Hình ảnh** — độ phân giải, chế độ cửa sổ, giới hạn FPS, v-sync.

**Điều khiển** — **đổi phím được**. Đây là yêu cầu trợ năng, không phải tiện ích. Kèm nút reset về mặc định.

**Trợ năng** — cỡ chữ, giảm rung màn hình, giảm hiệu ứng chớp, tốc độ văn bản, chế độ mù màu. Xem [[accessibility]].

**Lối chơi** — độ nhạy chuột, đảo trục Y, giữ hay bấm để chạy, bật/tắt gợi ý.

Nguyên tắc chung: **mỗi setting phải có hiệu lực ngay hoặc nói rõ khi nào có hiệu lực.** "Khởi động lại để áp dụng" mà không báo là nguồn bực bội quen thuộc.

## Lưu game

Ba câu hỏi phải trả lời tường minh trong thiết kế:

1. **Lưu khi nào?** Tự động ở checkpoint, hay người chơi tự lưu, hay cả hai?
2. **Người chơi biết đã lưu chưa?** Cần chỉ báo — icon nhỏ, không phải hộp thoại chặn.
3. **Chuyện gì xảy ra nếu tắt game giữa chừng?** Trả lời được câu này thì người chơi mới dám tắt.

**Không bao giờ ghi đè save mà không hỏi.** Và luôn giữ ít nhất một bản sao lưu — file save hỏng do tắt máy giữa lúc ghi là chuyện xảy ra thật, và mất tiến trình là lỗi người chơi không tha thứ.

## Xử lý lỗi

Thông báo lỗi tốt có ba phần:

```
❌ "Error: NullReferenceException at SaveManager.Load()"

✅ "Không đọc được file lưu.
    Bản lưu gần nhất (hôm qua 21:40) vẫn dùng được.
    [Dùng bản đó]  [Bắt đầu lại]  [Gửi báo lỗi]"
```

Chuyện gì xảy ra · Mất gì · **Làm gì tiếp**. Phần thứ ba quan trọng nhất và hay thiếu nhất.

## Điều hướng — hỗ trợ cả ba

Mọi màn hình phải dùng được bằng **chuột, bàn phím, và tay cầm**:

- Mỗi màn hình có một phần tử **focus mặc định** khi mở
- `Esc` / `B` luôn quay lại một cấp, ở mọi nơi, không ngoại lệ
- Thứ tự Tab đi theo thứ tự đọc, không theo thứ tự tạo phần tử
- Không có phần tử nào **chỉ** bấm được bằng chuột

Điểm cuối là thứ phá vỡ nhiều nhất. Xem yêu cầu trạng thái `focused` ở [[ui-design]].

## Tạm dừng

- **Tạm dừng thật sự dừng game** — trừ game nhiều người chơi.
- Tắt SFX nhưng **giữ nhạc** ở âm lượng thấp hơn (dễ làm nếu có bus, xem [[audio-implementation]]).
- Menu tạm dừng có: Tiếp tục, Settings, Thoát. Ba mục, không hơn ở tầng đầu.
- **Thoát luôn phải xác nhận** — và nói rõ mất gì.

## 🤖 Prompt cho AI

AI dựng luồng menu rất nhanh nhưng mặc định bỏ qua ba thứ: điều hướng bàn phím, xử lý lỗi, và trạng thái "đang tải / đang lưu".

**Phải nêu rõ:**
- Danh sách màn hình và cấu trúc phân cấp
- Yêu cầu điều hướng cả ba loại input
- Trạng thái bất thường: lưu hỏng, đang tải, mất kết nối
- Setting nào áp dụng ngay, setting nào cần khởi động lại

**Mẫu prompt**

```
Dựng luồng UX ngoài gameplay cho <engine + phiên bản>.

Màn hình: Boot, MainMenu, Settings(Audio/Video/Controls/Accessibility/Gameplay),
          SaveSlots, Pause, Confirm, Error

Ràng buộc điều hướng (BẮT BUỘC, không phải tuỳ chọn):
- Mọi màn hình dùng được bằng chuột, bàn phím VÀ tay cầm
- Mỗi màn hình có focus mặc định khi mở
- Esc / nút B luôn lùi một cấp, ở MỌI màn hình, không ngoại lệ
- KHÔNG phần tử nào chỉ bấm được bằng chuột

Settings:
- Audio/Gameplay/Accessibility: áp dụng NGAY khi thay đổi
- Video: nói rõ cái nào cần khởi động lại, hiện nhãn trên chính setting đó
- Điều khiển đổi phím được + nút reset mặc định
- Lưu ra file, không dùng PlayerPrefs cho cấu hình phức tạp

Trạng thái bất thường PHẢI xử lý (đừng bỏ qua):
- File save hỏng -> đề nghị bản backup, KHÔNG crash
- Đang lưu -> chỉ báo, chặn thoát
- Đang tải -> màn hình tải có tiến độ, không đứng hình
- Mọi thông báo lỗi có đủ 3 phần: chuyện gì / mất gì / LÀM GÌ TIẾP

Kèm test: mọi màn hình tới được và thoát ra được bằng riêng bàn phím.
```

**Bẫy thường gặp:** làm menu bằng chuột trước, tính chuyện tay cầm sau. Đến lúc đó thì mọi màn hình phải làm lại vì không có hệ thống focus. Ràng buộc điều hướng phải nằm trong **prompt đầu tiên**, không phải yêu cầu bổ sung.

## 🎮 Unity

Luồng menu trong Unity là câu hỏi **scene hay panel**, và trả lời sai thì mọi màn hình sau đều mệt.

**Scene hay panel?**

| | Scene riêng | Panel trong một scene |
|---|---|---|
| Tải | Có màn hình loading | Tức thì |
| Trạng thái | Reset sạch | Phải tự dọn |
| Quay lại game | Load lại scene game | Chỉ tắt panel |
| Phù hợp | Main menu | Pause, settings, inventory |

Kết hợp thường dùng: **một `Bootstrap` scene luôn tồn tại** (chứa AudioManager, ConfigLoader, UI Root), cộng scene gameplay load additive. Main menu là panel trong Bootstrap, không phải scene riêng. Chi tiết ở [[unity-game-loop]].

**UI phải chạy khi `timeScale = 0`**

Đây là bẫy làm mất cả buổi:

```csharp
// ❌ đứng mãi khi pause
yield return new WaitForSeconds(0.3f);

// ✅
yield return new WaitForSecondsRealtime(0.3f);
```

Và với Animator trên UI: `Update Mode = Unscaled Time`. Với Input System, Actions vẫn chạy khi pause (tốt), nhưng `Time.deltaTime` bằng 0 — mọi animation UI tính theo `unscaledDeltaTime`.

**Settings áp dụng ngay — đừng bắt Apply**

```csharp
volumeSlider.onValueChanged.AddListener(v => {
    AudioManager.I.SetBusVolume("MusicVol", v);   // hiệu lực ngay
    settings.musicVolume = v;
    settings.SaveDebounced();                      // ghi file sau 0.5s im lặng
});
```

`SaveDebounced` quan trọng: `onValueChanged` bắn mỗi frame khi kéo slider, ghi file mỗi frame sẽ giật.

**Lưu game — ghi atomic, luôn giữ backup**

Chi tiết ở [[unity-save-data]]. Điểm tối thiểu:

```csharp
// Ghi ra file tạm rồi đổi tên. Tắt máy giữa lúc ghi không làm hỏng save cũ.
File.WriteAllText(tmp, json);
if (File.Exists(path)) File.Replace(tmp, path, backup);
else File.Move(tmp, path);
```

**Không dùng `PlayerPrefs` cho tiến trình.** Nó nằm trong registry (Windows), không sao lưu được, và giới hạn kích thước. `PlayerPrefs` chỉ cho settings.

**Điều hướng tay cầm — focus mặc định mỗi màn hình**

```csharp
void OnEnable() {
    EventSystem.current.SetSelectedGameObject(null);   // xoá focus cũ trước
    EventSystem.current.SetSelectedGameObject(firstButton);
}
```

Bước `SetSelectedGameObject(null)` trước là cần thiết — nếu không, mở lại cùng panel đôi khi không đổi focus.

**Kiểm tra nhanh**
- Pause game rồi mở settings: animation UI còn chạy không?
- Kéo slider âm lượng liên tục 5 giây: có ghi file mỗi frame không?
- Rút chuột, chỉ dùng bàn phím: tới được mọi màn hình và thoát ra được chứ?
- Tắt game giữa lúc đang lưu (Task Manager): save cũ còn nguyên không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Đường đi từ lúc bấm icon tới lúc chơi được nên như thế nào?**
  → Càng ngắn càng tốt, mục tiêu **dưới 30 giây** từ lúc mở app tới lúc điều khiển được nhân vật. Bốn luật: **logo bỏ qua được** bằng bất kỳ phím nào; **"Tiếp tục" nằm trên cùng** nếu đã có save, vì người chơi cũ chiếm đa số lượt mở; **đừng hỏi gì trước khi cho chơi** — ngôn ngữ, độ khó, tên nhân vật đều đẩy vào trong hoặc đoán mặc định rồi cho đổi sau.
- `Junior` **Settings tối thiểu phải có những gì?**
  → Năm nhóm: **Âm thanh** (slider riêng Master/Music/SFX/UI, áp dụng **ngay khi kéo**, không bấm Apply). **Hình ảnh** (độ phân giải, chế độ cửa sổ, giới hạn FPS, v-sync). **Điều khiển** — **đổi phím được**, kèm nút reset. **Trợ năng** (cỡ chữ, giảm rung, giảm chớp, tốc độ văn bản, chế độ mù màu). Và **lối chơi** (độ nhạy, đảo trục Y, giữ hay bấm để chạy).
- `Junior` **Ba câu hỏi phải trả lời tường minh về hệ thống lưu game?**
  → **Lưu khi nào** — tự động ở checkpoint, người chơi tự lưu, hay cả hai? **Người chơi có biết đã lưu chưa** — cần một chỉ báo nhỏ, không phải hộp thoại chặn. Và **chuyện gì xảy ra nếu tắt game giữa chừng** — trả lời được câu này thì người chơi mới dám tắt, và đó là điều kiện để họ quay lại.
- `Mid` **Thông báo lỗi tốt gồm mấy phần?**
  → Ba: **chuyện gì xảy ra · mất gì · làm gì tiếp**. Phần thứ ba quan trọng nhất và hay thiếu nhất. "Error: NullReferenceException at SaveManager.Load()" không có phần nào cả; "Không đọc được file lưu. Bản gần nhất (hôm qua 21:40) vẫn dùng được. [Dùng bản đó] [Bắt đầu lại] [Gửi báo lỗi]" có đủ ba.
- `Mid` **Điều hướng UI phải thoả những gì để dùng được bằng cả ba thiết bị?**
  → Mỗi màn hình có một phần tử **focus mặc định** khi mở. `Esc` hoặc `B` **luôn** quay lại một cấp, ở mọi nơi, không ngoại lệ. Thứ tự Tab theo **thứ tự đọc**, không theo thứ tự tạo phần tử. Và **không có phần tử nào chỉ bấm được bằng chuột** — điểm cuối là thứ bị phá vỡ nhiều nhất.
- `Mid` **Menu tạm dừng thiết kế thế nào?**
  → Tạm dừng phải **thật sự dừng game**, trừ game nhiều người chơi. Tắt SFX nhưng **giữ nhạc** ở âm lượng thấp hơn — dễ làm nếu audio có bus riêng. Tầng đầu chỉ ba mục: Tiếp tục, Settings, Thoát. Và **Thoát luôn phải xác nhận**, kèm câu nói rõ sẽ mất gì.
- `Senior` **Vì sao menu hay là phần tệ nhất của một game?**
  → Vì nó được làm **cuối cùng, vội vàng, bởi người đã chán** — trong khi người chơi gặp nó **trước** gameplay và gặp lại mỗi phiên. Cách chữa về mặt quy trình là đưa luồng ngoài gameplay vào lịch sớm và coi nó là tính năng có tiêu chí nghiệm thu, chứ không phải phần dọn dẹp cuối dự án.
- `Senior` **Nguyên tắc nào về việc áp dụng một setting?**
  → **Mỗi setting phải có hiệu lực ngay, hoặc nói rõ khi nào có hiệu lực.** Âm lượng phải đổi ngay khi kéo để người chơi nghe được kết quả; thứ cần khởi động lại thì phải ghi rõ ngay tại chỗ. "Khởi động lại để áp dụng" mà không báo là nguồn bực bội quen thuộc, và nó khiến người chơi nghĩ setting bị hỏng.
- `Senior` **Rủi ro lớn nhất quanh hệ thống save trong UX là gì?**
  → **Ghi đè save mà không hỏi**, và **không giữ bản sao lưu**. File save hỏng do tắt máy giữa lúc ghi là chuyện xảy ra thật, và mất tiến trình là lỗi người chơi không tha thứ — nó cũng là loại review một sao không gỡ được. Nên luôn ghi atomic, luôn giữ ít nhất một `.bak`, và luôn hỏi trước khi đè.

**Khung trả lời 60 giây** — "Anh thiết kế luồng ngoài gameplay thế nào?"

> Bắt đầu từ **lần chạy đầu tiên**, vì đó là nơi mất người chơi nhiều nhất mà ít ai đo: logo bỏ qua được, "Tiếp tục" nằm trên cùng khi đã có save, không hỏi gì trước khi cho chơi, và mục tiêu **dưới ba mươi giây** từ lúc mở app tới lúc điều khiển được nhân vật.
>
> Rồi tới **settings**, và tôi coi danh sách này là tối thiểu chứ không phải tuỳ chọn: âm thanh có bốn slider riêng và áp dụng ngay khi kéo; hình ảnh; **đổi phím được** — đây là yêu cầu trợ năng, không phải tiện ích; nhóm trợ năng; và nhóm lối chơi.
>
> Hai chỗ tôi chú ý nhất vì chúng quyết định lòng tin: **lưu game** — người chơi phải biết đã lưu chưa và biết mất gì nếu tắt giữa chừng, không bao giờ ghi đè mà không hỏi — và **thông báo lỗi** ba phần: chuyện gì xảy ra, mất gì, **làm gì tiếp**. Phần thứ ba hay thiếu nhất và cũng là phần duy nhất người chơi dùng được.

**Họ sẽ đào tiếp**

- *"Vì sao 'Tiếp tục' phải nằm trên cùng?"* → Vì sau vài giờ đầu, **phần lớn lượt mở game là của người chơi cũ**. Đặt "Chơi mới" trên cùng là tối ưu cho lần duy nhất và phạt mọi lần còn lại — và tệ hơn, nó tạo rủi ro bấm nhầm rồi đè save. Đây là ví dụ điển hình của việc thiết kế theo thứ tự logic thay vì theo tần suất thật.
- *"Thứ tự Tab theo thứ tự tạo phần tử thì sao?"* → Thì focus nhảy lung tung theo lịch sử dựng UI chứ không theo thứ tự nhìn, và người dùng tay cầm không đoán được nút tiếp theo ở đâu. Nó cũng là loại lỗi không ai phát hiện bằng chuột — nên phải test bằng cách rút chuột ra và đi hết mọi màn hình.
- *"Tạm dừng trong game nhiều người chơi thì làm gì?"* → Không dừng thế giới được, nên phải bù bằng thứ khác: tắt input của người chơi đó nhưng giữ họ an toàn trong vài giây, hoặc cho phép mở menu mà không dừng và nói rõ điều đó. Cái không được làm là để người chơi tưởng game đã dừng trong khi họ vẫn đang bị đánh.
- *"Dùng AI ở khâu này thế nào?"* → Giao cho nó dựng **danh sách kiểm luồng**: mọi màn hình có focus mặc định chưa, `Esc` có quay lại được từ mọi nơi không, có phần tử nào chỉ bấm được bằng chuột không, setting nào cần khởi động lại mà chưa ghi chú. Đó là việc đối chiếu đều tay trên nhiều màn hình — đúng chỗ con người bỏ sót.

**Cờ đỏ**

- Cutscene khởi động không skip được.
- Hỏi ngôn ngữ, độ khó, tên nhân vật trước khi cho chơi.
- Thông báo lỗi in ra tên exception.
- Có phần tử chỉ bấm được bằng chuột.
- Ghi đè save mà không hỏi, hoặc không có bản sao lưu nào.

**Số / ví dụ nên thuộc**

- Mục tiêu: **< 30 giây** từ mở app tới điều khiển được nhân vật.
- Settings năm nhóm: **âm thanh · hình ảnh · điều khiển (đổi phím được) · trợ năng · lối chơi**.
- Âm lượng: bốn bus **Master / Music / SFX / UI**, áp dụng **ngay khi kéo**.
- Thông báo lỗi ba phần: **chuyện gì · mất gì · làm gì tiếp**.
- Menu tạm dừng tầng đầu: **ba mục**; Thoát **luôn phải xác nhận**.
