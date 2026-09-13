---
title: Core Loop
icon: 🔁
summary: Chuỗi hành động người chơi lặp lại liên tục — nếu vòng này không vui trong 30 giây, không hệ thống meta nào cứu nổi.
status: deep
read: 40
level: basic
order: 20
tags: [foundations, pillar, core]
related: [progression, player-motivation, game-feel]
---

**Core loop** là chuỗi hành động ngắn nhất mà người chơi lặp đi lặp lại. Nó là đơn vị vui nhỏ nhất của game.

Công thức tổng quát:

<figure class="fig">
<svg viewBox="0 0 660 200" role="img" aria-label="Vòng lặp bốn bước: Hành động, Phản hồi, Phần thưởng, Năng lực mới, rồi quay lại Hành động">
  <defs>
    <marker id="cl-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="14"  y="26" width="140" height="54" rx="9" class="fig-box"/>
    <rect x="184" y="26" width="140" height="54" rx="9" class="fig-box"/>
    <rect x="354" y="26" width="140" height="54" rx="9" class="fig-box"/>
    <rect x="524" y="26" width="122" height="54" rx="9" class="fig-box"/>
  </g>
  <text x="84"  y="49" text-anchor="middle" class="fig-label" font-size="14">Hành động</text>
  <text x="84"  y="68" text-anchor="middle" class="fig-muted" font-size="11">bấm nút</text>
  <text x="254" y="49" text-anchor="middle" class="fig-label" font-size="14">Phản hồi</text>
  <text x="254" y="68" text-anchor="middle" class="fig-muted" font-size="11">hitstop, âm thanh</text>
  <text x="424" y="49" text-anchor="middle" class="fig-label" font-size="14">Phần thưởng</text>
  <text x="424" y="68" text-anchor="middle" class="fig-muted" font-size="11">loot, XP</text>
  <text x="585" y="49" text-anchor="middle" class="fig-label" font-size="14">Năng lực mới</text>
  <text x="585" y="68" text-anchor="middle" class="fig-muted" font-size="11">mạnh hơn</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cl-a)" fill="none">
    <path d="M156 53 H180"/>
    <path d="M326 53 H350"/>
    <path d="M496 53 H520"/>
    <path d="M585 82 V132 Q585 150 567 150 H102 Q84 150 84 132 V86"/>
  </g>
  <text x="334" y="172" text-anchor="middle" class="fig-muted" font-size="11">
    lặp lại hàng nghìn lần — mỗi vòng người chơi phải mạnh hơn một chút
  </text>
</svg>
<figcaption>Vòng lặp khép kín: điểm mấu chốt là mũi tên quay về — nếu vòng kết thúc ở &ldquo;phần thưởng&rdquo; mà năng lực không đổi, đó chỉ là điểm số chứ chưa phải core loop.</figcaption>
</figure>

## Ví dụ thật

| Game | Core loop |
|---|---|
| Vampire Survivors | Di chuyển né → tự động sát thương → nhặt gem → lên cấp chọn skill → né được nhiều hơn |
| Slay the Spire | Rút bài → đánh giá thế trận → chơi bài → dọn phòng → thêm bài vào deck |
| Hades | Vào phòng → chiến đấu → nhận boon → mạnh hơn → phòng khó hơn |
| Stardew Valley | Sáng tưới cây → ngày trôi → thu hoạch → bán → mua hạt tốt hơn |

Chú ý: cả bốn đều **mô tả được trong một câu**, và vòng lặp kết thúc bằng *năng lực tăng lên* chứ không chỉ là điểm số.

## Ba tầng lặp

Game tốt gần như luôn có nhiều vòng lặp lồng nhau theo thang thời gian khác nhau:

- **Micro (1–10 giây)** — một cú đánh, một lần nhảy, một lượt bài. Đây là nơi [[game-feel]] sống.
- **Mid (2–10 phút)** — một trận, một tầng hầm, một ngày trong game. Có mở đầu, cao trào, kết thúc rõ ràng.
- **Macro (nhiều giờ)** — mở khoá nhân vật, lên cấp tài khoản, cày trang bị. Đây là [[progression]].

Vòng micro giữ người chơi trong *phiên hiện tại*. Vòng macro kéo họ *quay lại ngày mai*. Thiếu micro → game chán ngay. Thiếu macro → chơi vài hôm rồi bỏ.

## Kiểm tra core loop của bạn

1. **Test 30 giây** — trong 30 giây đầu, người chơi đã thực hiện trọn vẹn vòng lặp ít nhất một lần chưa?
2. **Test không phần thưởng** — tắt hết điểm, XP, loot. Hành động cốt lõi còn vui không? Nếu không, bạn đang dùng phần thưởng để che một cơ chế nhạt. Phần thưởng khuếch đại niềm vui, không tạo ra nó.
3. **Test một câu** — mô tả vòng lặp trong một câu không có chữ "và". Không làm được nghĩa là loop chưa rõ.
4. **Test lần thứ 100** — lần lặp thứ 100 có khác lần thứ nhất không? Nếu giống hệt, bạn cần thêm biến số ([[randomness]]) hoặc chiều sâu quyết định.

## 🤖 Prompt cho AI

Đây là mục **AI hay bịa nhất**. Hãy khai báo tường minh trong [[gdd-for-ai]]:

```yaml
core_loop:
  micro:
    action: "Nhấn chuột trái để chém, cooldown 0.4s"
    feedback: "hitstop 90ms + screenshake 6px + số sát thương bay lên"
    reward: "rơi 1-3 mảnh linh hồn"
  mid:
    unit: "một phòng (~90 giây), 3-6 quái"
    resolution: "dọn sạch phòng → chọn 1 trong 3 buff"
  macro:
    unit: "một run (~25 phút)"
    persistence: "linh hồn còn lại sau khi chết dùng mở khoá vĩnh viễn"
```

Số cụ thể như `0.4s`, `90ms`, `1-3 mảnh` là thứ biến prompt mơ hồ thành code chạy đúng ngay lần đầu. Xem thêm [[prompt-patterns]].

## 🎮 Unity

Core loop trong Unity là câu hỏi **vòng lặp nào chạy ở đâu**. Đặt sai tầng là nguồn bug timing khó truy.

**Ba tầng lặp → ba nơi trong Unity**

| Tầng | Unity | Lưu ý |
|---|---|---|
| Micro (1–10s) | `Update` / `FixedUpdate` | Frame data ở `FixedUpdate`, xem [[combat-systems]] |
| Mid (2–10 phút) | State máy cấp scene | Không `DontDestroyOnLoad` |
| Macro (nhiều giờ) | State máy cấp app + save | Bootstrap scene, xem [[unity-game-loop]] |

**Vòng micro: `Update` hay `FixedUpdate`?**

```csharp
// Input: Update (bắt mọi lần bấm, kể cả frame nhanh)
void Update() {
    if (input.AttackPressed) queuedAttack = true;     // BUFFER, không xử lý ngay
}

// Luật chơi: FixedUpdate (tất định, 60Hz)
void FixedUpdate() {
    if (queuedAttack) { queuedAttack = false; ExecuteAttack(); }
}
```

Đọc input trong `FixedUpdate` sẽ **bỏ lỡ** lần bấm nếu frame rate cao hơn 60. Xử lý luật trong `Update` thì frame rate cao/thấp cho kết quả khác nhau. Buffer trong `Update`, xử lý trong `FixedUpdate` là cách đúng — và nó cũng chính là `input buffer` ở [[game-feel]].

**Vòng mid: state máy cấp scene, không cờ rải rác**

```csharp
public enum RoomState { Entering, Fighting, Cleared, Rewarding, Exiting }

// Một enum, một chỗ chuyển. KHÔNG dùng bool isFighting + bool isCleared —
// hai cờ cho bốn trạng thái, hai trong đó vô nghĩa.
```

**Vòng macro: bootstrap + additive scene**

```csharp
// Bootstrap scene sống suốt, chứa AudioManager/ConfigLoader/SaveSystem.
// Scene gameplay load additive và unload khi hết run.
await SceneManager.LoadSceneAsync("Run", LoadSceneMode.Additive);
```

Chi tiết ở [[unity-game-loop]]. Điểm quan trọng: **đừng `DontDestroyOnLoad` từng manager một** — chúng sẽ nhân bản khi load lại scene. Một bootstrap scene giải quyết gọn.

**Bẫy Unity cụ thể**
- **Đọc input trong `FixedUpdate`** → mất input ở frame rate cao.
- **`Time.deltaTime` trong `FixedUpdate`** → dùng `Time.fixedDeltaTime`.
- **`DontDestroyOnLoad` nhiều manager** → nhân bản sau khi load scene lại.
- **Hitstop bằng `timeScale = 0`** làm `FixedUpdate` dừng — đúng ý, nhưng coroutine phải dùng `WaitForSecondsRealtime`.

**Kiểm tra nhanh**
- Chạy ở 240 FPS (tắt vsync): bấm tấn công nhanh có mất input không?
- Load lại scene gameplay: có manager nào bị nhân đôi không?
- `Time.fixedDeltaTime` dùng đúng trong `FixedUpdate` chứ?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Core loop là gì? Mô tả core loop của một game anh thích.**
  → Là chuỗi hành động **ngắn nhất** người chơi lặp đi lặp lại — đơn vị vui nhỏ nhất của game. Mô tả phải gọn trong một câu không có chữ "và": Hades là "vào phòng → chiến đấu → nhận boon → mạnh hơn → phòng khó hơn". Điểm mấu chốt là vòng lặp **kết thúc bằng năng lực tăng lên**, không phải bằng điểm số.
- `Junior` **Ba tầng lặp micro / mid / macro là gì?**
  → Micro **1–10 giây** (một cú đánh, một lượt bài) — nơi game feel sống. Mid **2–10 phút** (một trận, một tầng hầm) — có mở đầu, cao trào, kết thúc. Macro **nhiều giờ** (mở khoá, lên cấp). Micro giữ người chơi trong phiên hiện tại, macro kéo họ quay lại ngày mai.
- `Junior` **Test 30 giây nghĩa là gì?**
  → Trong 30 giây đầu, người chơi phải thực hiện trọn vẹn vòng lặp **ít nhất một lần**. Không đạt thì có thứ gì đó đang chen vào giữa người chơi và câu trả lời cho "tôi làm gì ở đây" — thường là logo, cutscene, hoặc màn chọn nhân vật. Đây cũng là con số dễ đo nhất khi xem người lạ chơi.
- `Mid` **Thiếu vòng micro và thiếu vòng macro khác nhau ra sao trong dữ liệu?**
  → Thiếu **micro** thì người chơi bỏ trong phiên đầu — tỉ lệ rơi tập trung ở 5 phút đầu, thời lượng phiên rất ngắn. Thiếu **macro** thì phiên đầu đẹp nhưng D7 tụt: chơi vài hôm rồi không có lý do mở lại. Hai triệu chứng khác nhau nên cách chữa cũng khác — thêm daily quest không cứu được một vòng micro nhạt.
- `Mid` **"Test không phần thưởng" dùng để làm gì?**
  → Tắt hết điểm, XP, loot rồi hỏi: hành động cốt lõi còn vui không? Không còn thì mình đang dùng phần thưởng để **che một cơ chế nhạt**. Phần thưởng khuếch đại niềm vui chứ không tạo ra nó — nhận ra điều này sớm rẻ hơn nhiều so với nhận ra sau khi đã xây xong ba tầng meta lên trên.
- `Mid` **Lần lặp thứ 100 giống hệt lần thứ nhất. Anh sửa thế nào?**
  → Đó là thiếu **biến số** hoặc thiếu **chiều sâu quyết định**. Biến số là ngẫu nhiên có kiểm soát: bố cục, vật phẩm, thứ tự gặp. Chiều sâu quyết định là mỗi lần lặp người chơi phải chọn khác đi vì thế trận khác. Thêm nội dung mà không thêm một trong hai thứ đó chỉ kéo dài thời gian tới lúc chán.
- `Senior` **Core loop và progression khác nhau chỗ nào? Vì sao hay bị lẫn?**
  → Core loop là thứ **vui ngay bây giờ**; progression là thứ **giữ người chơi quay lại**. Lẫn nhau vì cả hai đều "thưởng". Hệ quả của lẫn rất cụ thể: đội thấy giữ chân kém thì đi thêm battle pass, trong khi vấn đề nằm ở việc mười giây gameplay không vui — và cái thứ hai không bao giờ được sửa.
- `Senior` **Đánh giá một pitch mới, anh hỏi gì đầu tiên về core loop?**
  → "Người chơi làm gì trong ba mươi giây, và vì sao họ muốn làm lại lần thứ hai?" Nếu câu trả lời phải dùng tới hệ thống meta hoặc cốt truyện để biện minh thì vòng lặp chưa đứng được một mình. Câu hỏi kiểm tra thứ hai: mô tả nó trong một câu không có chữ "và".
- `Senior` **Khi nào nên đổi core loop, và khi nào chỉ nên đổi tham số?**
  → Đổi tham số khi playtest cho thấy nhịp sai nhưng người chơi **vẫn muốn lặp lại**. Đổi loop khi họ lặp lại vì nghĩa vụ chứ không vì muốn — dấu hiệu là tester chơi đúng số vòng mình yêu cầu rồi dừng. Đổi loop sau tháng thứ sáu gần như luôn là làm lại dự án, nên đây là câu hỏi phải trả lời ở giai đoạn prototype.

**Khung trả lời 60 giây** — "Anh kiểm tra một core loop bằng cách nào?"

> Tôi có bốn phép thử, và chúng rẻ nên tôi chạy hết. **Test một câu**: mô tả vòng lặp trong một câu không có chữ "và" — không làm được nghĩa là loop chưa rõ, và mọi tranh cãi sau đó sẽ là tranh cãi về hai game khác nhau.
>
> **Test 30 giây**: người chơi phải chạy trọn vòng lặp ít nhất một lần trong 30 giây đầu. **Test không phần thưởng**: tắt hết điểm, XP, loot; hành động cốt lõi còn vui không? Đây là phép thử tôi tin nhất, vì phần thưởng khuếch đại niềm vui chứ không tạo ra nó. Và **test lần thứ 100**: lần lặp thứ 100 có khác lần thứ nhất không — không khác thì thiếu biến số hoặc thiếu chiều sâu quyết định.
>
> Bốn phép thử này chạy được trên giấy và trên prototype greybox, tức là trước khi tiêu tiền. Đó mới là điểm của chúng.

**Họ sẽ đào tiếp**

- *"Vì sao vòng lặp phải kết thúc bằng năng lực, không phải điểm số?"* → Vì năng lực đổi **cách chơi vòng sau**, còn điểm số chỉ đổi con số. Vampire Survivors: nhặt gem → lên cấp → chọn skill → **né được nhiều hơn** — vòng sau chơi khác thật. Nếu bỏ mũi tên quay về đó thì cái còn lại là một bảng điểm, và người chơi hết lý do lặp lại sau vài phút.
- *"Làm sao biết vòng micro đang hỏng chứ không phải vòng macro?"* → Nhìn chỗ người chơi rơi. Rơi trong 5 phút đầu và thời lượng phiên ngắn là micro; phiên đầu bình thường mà D7 tụt là macro. Và test không phần thưởng phân biệt hai thứ này nhanh hơn mọi biểu đồ.
- *"Game không có tiến trình năng lực thì sao — cờ vua, Tetris?"* → Năng lực tăng nằm ở **người chơi**, không nằm trong game. Loại này đánh đổi: không cần hệ thống meta, nhưng đường cong học phải rất sạch vì không có gì bù cho người chơi khi họ chưa giỏi. Đó cũng là lý do chúng thường có nhiều chế độ độ khó hoặc matchmaking.
- *"Ba tầng lặp có bắt buộc đủ ba không?"* → Không, nhưng thiếu tầng nào thì phải biết mình đang đổi lấy gì. Game premium 6 giờ bỏ hẳn tầng macro là lựa chọn đúng; game dịch vụ bỏ tầng macro là tự sát. Điều không được phép là **không biết** mình đang thiếu tầng nào.
- *"Dùng AI ở khâu này thế nào?"* → Việc nó làm tốt là đóng vai người chơi lần thứ 100: đưa mô tả vòng lặp và bắt nó liệt kê những gì lặp lại y hệt sau 100 lần. Việc nó làm dở là nói vòng lặp có vui không — cái đó chỉ playtest trả lời được, và tin vào đánh giá của AI ở đây là tự lừa mình bằng một câu văn trôi chảy.

**Cờ đỏ**

- Mô tả core loop bằng một đoạn văn, hoặc bằng một câu đầy chữ "và".
- Vòng lặp kết thúc ở phần thưởng, không có mũi tên quay về năng lực.
- Chữa "game chán" bằng cách thêm hệ thống meta, chưa từng chạy test không phần thưởng.
- Chỉ có một tầng lặp và không biết mình đang thiếu hai tầng kia.
- Thêm nội dung để chữa lần lặp thứ 100 giống lần thứ nhất.

**Số / ví dụ nên thuộc**

- Ba tầng: micro **1–10 giây** · mid **2–10 phút** · macro **nhiều giờ**.
- Bốn phép thử: **một câu · 30 giây · không phần thưởng · lần thứ 100**.
- Ví dụ mô tả một câu: Slay the Spire — "rút bài → đánh giá thế trận → chơi bài → dọn phòng → thêm bài vào deck".
- Vampire Survivors: vòng lặp kết thúc bằng **né được nhiều hơn**, không phải bằng điểm.
- Dấu hiệu trong dữ liệu: rơi ở **5 phút đầu** = micro · **D7 tụt** = macro.
