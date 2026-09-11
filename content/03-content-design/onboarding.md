---
title: Onboarding & Tutorial
icon: 🚪
summary: Dạy người chơi mà không cần hộp thoại hướng dẫn — 5 phút đầu quyết định họ ở lại hay đi.
status: stub
read: 270
level: intermediate
order: 25
tags: [content, ux, onboarding]
related: [level-design, ux-hud, pacing, difficulty-curve]
---

Phần lớn người chơi rời đi trước phút thứ 5. Onboarding không phải màn hướng dẫn — nó là **cách bạn thiết kế 5 phút đầu tiên**.

## Cần bồi đắp

- [ ] Ba nhịp dạy học: bối cảnh an toàn → áp dụng có phạt → kết hợp
- [ ] Tutorial ẩn vs tutorial hiện: khi nào chấp nhận được hộp thoại
- [ ] Giới thiệu cơ chế theo thứ tự nào
- [ ] Phút đầu tiên: người chơi phải làm được gì trong 30 giây
- [ ] Đo đạc: tỉ lệ rơi rụng theo từng bước onboarding

## Ghi chú tạm

**Nguyên tắc: nếu phải giải thích, thiết kế đã thất bại.** Mỗi hộp thoại hướng dẫn là một chỗ mà bố cục, hình khối hoặc phản hồi chưa đủ rõ. Xem kỹ thuật dạy bằng không gian ở [[level-design]].

**Đừng khoá tay người chơi.** Tutorial ép làm đúng một thao tác duy nhất ("nhấn W để đi tới") biến người chơi thành khán giả. Hãy tạo tình huống mà hành động đúng là hành động tự nhiên nhất.

**Dạy một thứ mỗi lần.** Ba cơ chế mới trong một phòng nghĩa là không cơ chế nào được học. Chu trình răng cưa ở [[difficulty-curve]] áp dụng trực tiếp ở đây.

**Đo, đừng đoán.** Log từng bước onboarding và xem người chơi rơi ở đâu — đây là phễu có tỉ lệ cải thiện cao nhất trong toàn bộ game. Xem [[playtesting-metrics]].

## 🤖 Prompt cho AI

Onboarding là chỗ AI mặc định đẻ ra hộp thoại hướng dẫn. Phải cấm từ đầu.

**Phải nêu rõ:**
- Người chơi phải làm được gì trong 30 giây đầu
- Thứ tự giới thiệu cơ chế, **mỗi lần một cơ chế**
- Cấm hộp thoại / cấm khoá input
- Điểm đo: log sự kiện nào để biết người chơi rơi ở đâu

**Mẫu prompt**

```
Thiết kế 5 phút đầu, KHÔNG có hộp thoại hướng dẫn, KHÔNG khoá input.

Ràng buộc:
- 0-30s: người chơi phải thực hiện trọn vẹn core loop ít nhất 1 lần
- Mỗi phòng dạy ĐÚNG MỘT cơ chế, theo 3 nhịp:
    bối cảnh an toàn -> áp dụng có phạt -> kết hợp với cơ chế cũ
- Cơ chế mới được dạy bằng BỐ TRÍ KHÔNG GIAN (xem [[level-design]]),
  không bằng chữ. Nếu một cơ chế không dạy được bằng bố trí, hãy nói ra.

Thứ tự: di chuyển -> đánh -> né -> kết hợp né+đánh -> tài nguyên

Kèm: danh sách sự kiện cần log ở mỗi bước để dựng phễu rơi rụng.
```

**Bẫy thường gặp:** AI đề xuất "hiện tooltip: nhấn Space để nhảy". Câu `KHÔNG có hộp thoại` buộc nó phải nghĩ ra tình huống — ví dụ một hố nhỏ không thể không nhảy qua.

## 🎮 Unity

Trong Unity, onboarding hỏng vì một lý do kỹ thuật rất cụ thể: **thứ tự khởi tạo**. Tutorial bật trước khi hệ thống nó dạy sẵn sàng.

**Nơi các quyết định sống**

- `Assets/Scenes/Level_00_Tutorial.unity` — màn đầu, dựng bằng bố cục
- `Core/Onboarding/TutorialFlow.cs` — chuỗi bước, C# thuần
- `Assets/Data/Onboarding/*.asset` — điều kiện hoàn thành từng bước

**Thứ tự khởi tạo — nguồn bug số một**

```csharp
// ❌ Awake của TutorialManager có thể chạy TRƯỚC PlayerController
void Awake() => player.EnableMovement(false);   // player có thể chưa tồn tại

// ✅ đợi hệ thống báo sẵn sàng
void OnEnable() => GameBootstrap.OnSystemsReady += StartTutorial;
```

Thứ tự `Awake` giữa các GameObject **không xác định** trừ khi bạn đặt Script Execution Order. Cách chắc chắn hơn là một bootstrap phát event khi mọi hệ thống đã sẵn sàng — xem [[unity-game-loop]].

**Dạy bằng bố cục, cưỡng chế bằng collider**

Nguyên tắc "không hộp thoại" ở phần trên hiện thực hoá thế nào: dùng **trigger collider** làm cửa một chiều.

```csharp
// Phòng đầu tiên: một hố nhỏ không thể không nhảy qua.
// Người chơi học nhảy vì không có cách nào khác, không vì có tooltip.
void OnTriggerEnter(Collider other) {
    if (other.CompareTag("Player")) TutorialFlow.Complete("learned_jump");
}
```

Không khoá input, không hiện chữ. Bố cục làm việc dạy.

**Log phễu — thứ quyết định bạn sửa đúng chỗ**

```csharp
// Mỗi bước một event. Không có log thì không biết người chơi rơi ở đâu.
Analytics.Log("tutorial_step", new { step = "learned_dodge", seconds = elapsed });
```

Xem [[playtesting-metrics]] về cách đọc phễu. Đây là phễu có tỉ lệ cải thiện cao nhất trong toàn game, nên đừng bỏ log.

**Bẫy Unity cụ thể**
- **`Awake` order không xác định** → tutorial chạm vào object chưa khởi tạo.
- **Khoá input bằng `Time.timeScale = 0`** rồi quên rằng coroutine dùng `WaitForSeconds` sẽ đứng. Dùng `WaitForSecondsRealtime` — xem [[ux-flow]].
- **Tutorial trong cùng scene với gameplay** → không test riêng được. Tách scene hoặc tách prefab bật/tắt.
- **`DontDestroyOnLoad` cho TutorialManager** → nó sống sang màn 2 và bật lại. Đừng.

**Kiểm tra nhanh**
- Load thẳng vào Level_00 từ Editor: tutorial chạy đúng không?
- Load vào Level_03: tutorial có bật nhầm không?
- Đếm số hộp thoại hướng dẫn: bao nhiêu? (càng gần 0 càng tốt)
- 30 giây đầu: người chơi đã làm trọn core loop chưa?
