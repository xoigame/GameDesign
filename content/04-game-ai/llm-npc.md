---
title: LLM-driven NPC
icon: 💬
summary: Dùng mô hình ngôn ngữ cho NPC — kiến trúc, chi phí, độ trễ, và những rào cản thật sự chưa ai giải xong.
status: deep
read: 510
level: advanced
order: 70
tags: [ai, llm, npc, experimental]
related: [narrative, behavior-tree, agent-guardrails]
---

Ý tưởng thì hấp dẫn: NPC nói chuyện tự nhiên, nhớ bạn, phản ứng theo tình huống. Thực tế có nhiều rào cản chưa được giải quyết tốt, và biết trước chúng sẽ giúp bạn tiết kiệm hàng tháng.

## Kiến trúc thực tế

Đừng để LLM điều khiển hành vi. Kiến trúc dùng được là **phân tầng**:

```
┌──────────────────────────────────────────┐
│ LLM  —  chỉ sinh lời thoại & sắc thái     │
├──────────────────────────────────────────┤
│ Tầng luật  —  lọc, kiểm duyệt, kiểm tra   │
├──────────────────────────────────────────┤
│ BT / FSM  —  hành vi thật, di chuyển,     │
│              chiến đấu, tương tác vật thể │
└──────────────────────────────────────────┘
```

LLM **không** được phép quyết định NPC tấn công hay không, mở cửa hay không, cho quest hay không. Nó chỉ diễn đạt quyết định mà tầng dưới đã đưa ra. Lý do: LLM không tất định, không kiểm chứng được, và không chịu ràng buộc luật game.

Cách làm phổ biến và ổn định: LLM trả về **hành động có cấu trúc** trong một tập đóng, rồi code kiểm tra hợp lệ:

```json
{
  "dialogue": "Ta đã bảo rồi, đừng có lảng vảng quanh kho thóc.",
  "emotion": "annoyed",
  "action": "warn",
  "relationship_delta": -5
}
```

`action` phải nằm trong enum `["greet","warn","trade","attack","give_quest","ignore"]`. Mọi giá trị ngoài danh sách → từ chối, dùng phản hồi dự phòng. Đây là ranh giới an toàn bắt buộc — xem [[agent-guardrails]].

## Bốn rào cản thật

**Độ trễ.** Gọi API mất 400ms–2s. Hội thoại chịu được; phản ứng thời gian thực thì không. Giải pháp: phát animation "đang suy nghĩ", phát trước một câu đệm chung, hoặc sinh sẵn phản hồi cho các tình huống thường gặp.

**Chi phí.** Mỗi NPC nói một câu tốn tiền thật. Với 50 NPC × 10.000 người chơi × 20 lượt hội thoại, hoá đơn vượt xa doanh thu game indie. Giải pháp thực tế: mô hình nhỏ chạy cục bộ, cache theo ngữ cảnh, hoặc **sinh sẵn khi build** thay vì sinh lúc chạy.

**Tính nhất quán.** LLM sẽ mâu thuẫn với chính nó. NPC nói rằng ông ta có ba người con, mười phút sau nói chưa vợ. Người chơi nhận ra ngay và mất hoàn toàn niềm tin vào thế giới. Giải pháp: **sự thật nằm trong dữ liệu game, không nằm trong LLM.** Bơm các sự kiện đã xác lập vào prompt mỗi lần gọi.

**Người chơi sẽ phá.** Ai đó sẽ thuyết phục NPC nói về chính trị, đọc system prompt, hoặc thoát vai. Cần lọc đầu ra, giới hạn chủ đề, và chấp nhận rằng không có biện pháp nào kín 100%.

## Trí nhớ

Đây là phần quyết định NPC có cảm giác "sống" hay không. Ba tầng:

```
Ngắn hạn   — 5-10 lượt gần nhất, đưa nguyên văn vào prompt
Trung hạn  — tóm tắt phiên chơi này, LLM tự tóm tắt định kỳ
Dài hạn    — dữ kiện có cấu trúc trong DB game (KHÔNG để LLM giữ)
```

Tầng dài hạn phải là dữ liệu game thật:

```json
{
  "npc_id": "blacksmith_gorn",
  "facts": {
    "player_name": "Kael",
    "player_saved_his_daughter": true,
    "relationship": 72,
    "items_sold_to_player": ["iron_sword"],
    "last_met_day": 14
  }
}
```

Những dữ kiện này được chèn vào prompt mỗi lần gọi. Chúng là sự thật; LLM chỉ diễn đạt chúng.

## Vấn đề thiết kế, không phải kỹ thuật

Một điều ít được nói tới: **hội thoại vô hạn thường làm game tệ đi**.

Cây hội thoại viết tay có trọng lượng vì mỗi dòng đều được chọn lọc. Khi NPC nói gì cũng được, không câu nào đáng nhớ. Người chơi chuyển từ *nghe một nhân vật* sang *nghịch một chatbot* — và họ ngừng quan tâm tới cốt truyện.

Vì vậy các ứng dụng hứa hẹn nhất hiện nay không phải là thay thế cây hội thoại, mà là:

- **Diễn đạt lại lời thoại viết tay** theo tâm trạng và mối quan hệ hiện tại.
- **Phản ứng vụn** với hành động người chơi (bạn đốt nhà → dân làng bình luận).
- **Lời thoại lấp khoảng** — NPC nói chuyện với nhau ở nền, tạo không khí.
- **Sinh nội dung lúc build**, con người biên tập lại — an toàn nhất về chi phí và chất lượng.

Xem thêm phần cuối [[narrative]].

## Danh sách kiểm tra trước khi đưa vào game

- [ ] LLM chỉ sinh lời thoại, không quyết định hành vi
- [ ] Đầu ra có schema, validate, có phản hồi dự phòng khi lỗi
- [ ] Sự thật lấy từ DB game, không lấy từ trí nhớ mô hình
- [ ] Lọc nội dung đầu ra
- [ ] Xử lý được khi API hỏng hoặc người chơi offline
- [ ] Ước tính chi phí ở quy mô thật — trước khi viết code
- [ ] Đã thử: NPC có thật sự hay hơn cây hội thoại viết tốt không?

## 🤖 Prompt cho AI

Đây là chủ đề AI dễ "giúp quá tay" nhất — nó sẽ cho LLM quyền quyết định hành vi nếu bạn không cấm rõ.

**Phải nêu rõ:**
- Ranh giới: LLM chỉ sinh lời thoại, tầng luật quyết định hành vi
- Schema đầu ra đóng, kèm hành vi dự phòng khi lỗi
- Nguồn sự thật: DB game, không phải trí nhớ mô hình
- Ngân sách chi phí và độ trễ tối đa

**Mẫu prompt**

```
Tích hợp LLM cho hội thoại NPC. Kiến trúc PHÂN TẦNG bắt buộc:

TẦNG 1 (BT/FSM) quyết định hành vi: tấn công, giao dịch, cho quest, bỏ qua.
TẦNG 2 (luật)   kiểm tra và lọc.
TẦNG 3 (LLM)    CHỈ diễn đạt thành lời quyết định đã có.

CẤM: LLM quyết định NPC làm gì. CẤM: LLM là nguồn sự thật về thế giới.

Đầu ra LLM bắt buộc theo schema:
{ "dialogue": string (<= 200 ký tự),
  "emotion": enum[neutral,happy,annoyed,afraid,angry],
  "action": enum[greet,warn,trade,give_quest,ignore] }
action PHẢI trùng quyết định tầng 1. Lệch -> loại bỏ, dùng câu dự phòng.

Sự thật bơm vào prompt mỗi lần gọi, lấy từ DB game:
  player_name, relationship (0-100), đã cứu con gái NPC?, ngày gặp gần nhất

Ràng buộc vận hành:
- Timeout 1.5s -> dùng câu viết sẵn, KHÔNG để người chơi chờ
- API lỗi hoặc offline -> fallback về cây hội thoại tĩnh
- Cache theo (npc_id, intent, relationship_bucket)
- Ước tính chi phí ở 10.000 người chơi × 20 lượt/người TRƯỚC khi viết code
```

**Bẫy thường gặp:** để LLM giữ trí nhớ. Nó sẽ mâu thuẫn với chính nó trong 10 phút và người chơi mất hết niềm tin vào thế giới. Sự thật phải nằm trong DB.

## 🎮 Unity

Trong Unity, phần khó không phải gọi API mà là **không làm đứng game khi chờ mạng**.

**Component & nơi đặt**
- `LlmClient.cs` — `UnityWebRequest`, không chặn main thread
- `DialogueGate.cs` — tầng luật: kiểm tra schema, lọc, quyết định fallback
- `NpcFacts` (ScriptableObject hoặc save data) — nguồn sự thật, **không** để LLM nhớ

**Gọi API không chặn**

```csharp
public async Task<NpcReply> AskAsync(string prompt, CancellationToken ct) {
    using var req = new UnityWebRequest(endpoint, "POST");
    req.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(prompt));
    req.downloadHandler = new DownloadHandlerBuffer();
    req.SetRequestHeader("Content-Type", "application/json");
    req.timeout = 2;                                    // giây — cứng

    var op = req.SendWebRequest();
    while (!op.isDone) {
        if (ct.IsCancellationRequested) { req.Abort(); return NpcReply.Fallback; }
        await Task.Yield();                             // nhường frame, KHÔNG chặn
    }
    if (req.result != UnityWebRequest.Result.Success) return NpcReply.Fallback;
    return Validate(req.downloadHandler.text);
}
```

**Tầng luật — LLM không được quyết định hành vi**

```csharp
NpcReply Validate(string json) {
    NpcReply r;
    try { r = JsonUtility.FromJson<NpcReply>(json); }
    catch { return NpcReply.Fallback; }

    // action PHẢI trùng quyết định của BT/FSM. Lệch -> vứt.
    if (r.action != decidedAction) return NpcReply.Fallback;
    if (!System.Enum.IsDefined(typeof(Emotion), r.emotion)) return NpcReply.Fallback;
    if (r.dialogue.Length > 200) r.dialogue = r.dialogue[..200];
    return r;
}
```

**API key — không nhúng vào build**

Key trong `Resources/` hoặc `PlayerPrefs` là key công khai: build client dễ dàng bị bóc. Cách duy nhất an toàn là **proxy server của bạn** giữ key, client gọi proxy. Nếu chưa có proxy, đừng ship tính năng này.

**Bẫy Unity cụ thể**
- **`await` trong Unity không tự quay về main thread** ở mọi ngữ cảnh. Chạm `Transform`/`UI` sau `await` phải chắc đang ở main thread — `Task.Yield()` trong PlayerLoop thì an toàn, `Task.Run` thì không.
- **Quên `CancellationToken`** → NPC chết/scene unload mà request vẫn chạy, callback chạm object đã huỷ → `MissingReferenceException`.
- **`JsonUtility` không đọc được mảng ở cấp gốc** và bỏ qua trường thiếu mà không báo. Với schema phức tạp dùng thư viện JSON khác.
- **Không có fallback** → người chơi đứng nhìn NPC im lặng 2 giây. Luôn có câu viết sẵn.

**Kiểm tra nhanh**
- Rút mạng giữa hội thoại: game có tiếp tục bình thường không?
- Bật Profiler lúc gọi API: main thread có khựng không?
- Sửa response giả thành `action` sai: có bị chặn không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Cho LLM điều khiển NPC thì tầng nào được phép làm gì?**
  → Kiến trúc phân tầng: game logic quyết định **hành vi** (tấn công hay không, mở cửa hay không, cho quest hay không), LLM chỉ **diễn đạt** quyết định đó thành lời. Lý do rất cụ thể: LLM không tất định, không kiểm chứng được, và không chịu ràng buộc luật game — ba thứ mà mọi quyết định gameplay đều cần.
- `Junior` **Đầu ra của LLM nên có dạng gì?**
  → **Có cấu trúc, trong một tập đóng**: `action` phải nằm trong enum như `["greet","warn","trade","attack","give_quest","ignore"]`, kèm phần lời thoại tự do. Code kiểm tra hợp lệ trước khi dùng; giá trị ngoài danh sách thì từ chối và dùng phản hồi dự phòng. Không có bước này thì không có ranh giới an toàn nào.
- `Junior` **Vì sao NPC nói mâu thuẫn với chính nó, và sửa thế nào?**
  → Vì LLM không có nguồn sự thật — nó sinh ra thứ nghe hợp lý. NPC nói có ba người con, mười phút sau nói chưa vợ, và người chơi mất niềm tin vào cả thế giới. Nguyên tắc chữa: **sự thật nằm trong dữ liệu game, không nằm trong LLM** — bơm các sự kiện đã xác lập vào prompt mỗi lần gọi.
- `Mid` **Bốn rào cản thật khi đưa LLM vào NPC là gì?**
  → **Độ trễ** 400 ms–2 s: hội thoại chịu được, phản ứng thời gian thực thì không. **Chi phí**: 50 NPC × 10.000 người chơi × 20 lượt là hoá đơn vượt xa doanh thu game indie. **Tính nhất quán**: LLM mâu thuẫn với chính nó. **Người chơi sẽ phá**: thuyết phục NPC thoát vai, đọc system prompt, nói chuyện ngoài chủ đề.
- `Mid` **Xử lý độ trễ trong hội thoại thế nào?**
  → Ba cách, thường dùng cùng nhau: phát **animation "đang suy nghĩ"** để độ trễ trở thành diễn xuất; phát trước một **câu đệm chung** trong lúc chờ; và **sinh sẵn** phản hồi cho các tình huống thường gặp. Cái không làm được là giấu độ trễ — nên biến nó thành một phần của nhân vật thay vì cố che.
- `Mid` **Chi phí vận hành kiểm soát bằng cách nào?**
  → Mô hình nhỏ chạy cục bộ, **cache theo ngữ cảnh**, và quan trọng nhất: **sinh sẵn khi build** thay vì sinh lúc chạy. Cách cuối chuyển chi phí từ biến đổi theo số người chơi sang cố định theo dự án — đó là khác biệt giữa một tính năng khả thi và một tính năng phá vỡ mô hình kinh doanh.
- `Senior` **Trí nhớ của NPC thiết kế thế nào?**
  → Ba tầng: ngắn hạn (lượt hội thoại hiện tại), trung hạn (phiên chơi), và **dài hạn phải là dữ liệu game thật** — các dữ kiện đã xác lập, được chèn vào prompt mỗi lần gọi. Không lưu trí nhớ **trong** LLM: nó là thứ sinh văn bản, không phải cơ sở dữ liệu, và mọi thứ chỉ tồn tại trong ngữ cảnh đều sẽ trôi mất.
- `Senior` **Vì sao hội thoại vô hạn thường làm game tệ đi?**
  → Vì **ràng buộc tạo ra ý nghĩa**. Cây hội thoại viết tay có trọng lượng vì mỗi dòng đều được chọn lọc; khi NPC nói gì cũng được thì không câu nào đáng nhớ, và người chơi chuyển từ *nghe một nhân vật* sang *nghịch một chatbot* — rồi ngừng quan tâm tới cốt truyện. Đây là vấn đề thiết kế, không phải vấn đề kỹ thuật, nên mô hình mạnh hơn không giải quyết được.
- `Senior` **Vậy ứng dụng nào của LLM cho NPC là hứa hẹn nhất hiện nay?**
  → Bốn, và không cái nào là thay thế cây hội thoại: **diễn đạt lại lời thoại viết tay** theo tâm trạng và quan hệ hiện tại; **phản ứng vụn** với hành động người chơi (đốt nhà → dân làng bình luận); **lời thoại lấp khoảng** giữa các NPC để tạo không khí; và **sinh nội dung lúc build** rồi con người biên tập — an toàn nhất về cả chi phí lẫn chất lượng.

**Khung trả lời 60 giây** — "Anh sẽ đưa LLM vào NPC thế nào?"

> Kiến trúc phân tầng, và ranh giới rất cứng: **game logic quyết định hành vi, LLM chỉ diễn đạt**. Nó không được phép quyết định NPC tấn công hay không, mở cửa hay không, cho quest hay không — vì nó không tất định, không kiểm chứng được và không chịu ràng buộc luật game. Đầu ra phải có **schema**: `action` nằm trong một enum đóng, ngoài danh sách thì từ chối và dùng phản hồi dự phòng.
>
> Bốn rào cản tôi tính trước: độ trễ 400 ms tới 2 giây — biến nó thành animation "đang suy nghĩ" chứ đừng cố giấu; chi phí — cache và **sinh sẵn lúc build** thay vì sinh lúc chạy; tính nhất quán — **sự thật nằm trong dữ liệu game**, bơm vào prompt mỗi lần gọi; và việc người chơi sẽ tìm cách phá, nên phải lọc đầu ra và chấp nhận không có biện pháp nào kín tuyệt đối.
>
> Nhưng câu trả lời quan trọng hơn là về thiết kế: **hội thoại vô hạn thường làm game tệ đi**, vì ràng buộc mới tạo ra trọng lượng. Nên tôi dùng LLM cho diễn đạt lại lời thoại đã viết, phản ứng vụn, thoại lấp khoảng — chứ không dùng để thay cây hội thoại.

**Họ sẽ đào tiếp**

- *"Nếu để LLM quyết định hành vi thì hỏng thế nào?"* → Hỏng ở chỗ không tái hiện được và không cân bằng được: cùng một tình huống cho hai kết quả khác nhau, nên bug không truy được và designer không chỉnh được. Thêm nữa, người chơi sẽ tìm ra cách nói chuyện để mở khoá thứ lẽ ra phải làm nhiệm vụ mới có — và đó là lỗ hổng gameplay, không phải lỗi văn bản.
- *"Chặn prompt injection từ người chơi thế nào?"* → Coi mọi thứ người chơi gõ là **dữ liệu, không phải chỉ thị**: tách rõ trong prompt, lọc đầu ra theo danh sách chủ đề, giới hạn độ dài, và không bao giờ để đầu ra của LLM đi thẳng vào một hành động có hậu quả. Và phải giả định sẽ có người vượt qua, nên thiệt hại tối đa khi bị vượt phải là "NPC nói một câu lạc đề", không phải "người chơi nhận được vật phẩm".
- *"Sinh lúc build khác gì sinh lúc chạy?"* → Chi phí cố định thay vì biến đổi, độ trễ bằng không, **con người biên tập được**, và nội dung nằm trong bản build nên QA kiểm được. Đổi lại là mất tính phản ứng theo tình huống. Với phần lớn game, đánh đổi đó nghiêng hẳn về phía sinh lúc build.
- *"Đo chất lượng của phần này thế nào?"* → Bằng eval như mọi tính năng LLM khác: một bộ tình huống cố định, chạy n lần, chấm theo tiêu chí máy đọc được — có đúng schema không, có nhắc tới sự kiện đã xác lập không, có thoát vai không. Ấn tượng chủ quan sau vài lần thử là cách phổ biến nhất để tự lừa mình ở đây.

**Cờ đỏ**

- Để LLM quyết định hành vi hoặc phần thưởng.
- Không có schema, không validate, không có phản hồi dự phòng.
- Lưu trí nhớ NPC trong ngữ cảnh của LLM thay vì trong dữ liệu game.
- Không ước tính chi phí theo số người chơi trước khi bắt đầu.
- Coi hội thoại vô hạn là mục tiêu, không nhận ra ràng buộc mới tạo ra trọng lượng.

**Số / ví dụ nên thuộc**

- Độ trễ gọi API **400 ms – 2 s**; hội thoại chịu được, thời gian thực thì không.
- Ranh giới: **LLM diễn đạt, game logic quyết định**.
- Đầu ra **có schema**, `action` trong enum đóng, ngoài danh sách thì từ chối.
- Ba tầng trí nhớ: lượt · phiên · **dữ liệu game** (tầng dài hạn).
- Bốn ứng dụng hứa hẹn: diễn đạt lại thoại viết tay · phản ứng vụn · thoại lấp khoảng · **sinh lúc build có người biên tập**.
