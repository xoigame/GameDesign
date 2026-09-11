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
