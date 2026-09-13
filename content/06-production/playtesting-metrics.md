---
title: Playtesting & Metrics
icon: 📊
summary: Đo cái gì, hỏi thế nào, và vì sao người chơi nói sai về chính trải nghiệm của họ.
status: deep
read: 560
level: intermediate
order: 30
tags: [production, testing, data]
related: [difficulty-curve, balancing-math, prototyping]
---

## Luật nền

> **Người chơi rất giỏi phát hiện vấn đề, và rất dở đề xuất giải pháp.**

Khi ai đó nói *"nên cho nhân vật thêm cú nhảy đúp"*, thứ họ thực sự đang nói là *"tôi thấy bực khi di chuyển"*. Hãy nghe phần vấn đề, tự tìm giải pháp.

Hệ quả thứ hai, quan trọng hơn: **hãy quan sát, đừng chỉ hỏi.** Người chơi nói "vui lắm" trong khi số liệu cho thấy họ bỏ giữa chừng ở màn 3. Lời nói bị chi phối bởi phép lịch sự; hành vi thì không.

## Cách chạy một buổi playtest

**Trước:** viết ra câu hỏi cần trả lời. *"Người chơi có hiểu cơ chế đẩy lùi không?"* chứ không phải "game có hay không".

**Trong:**
- Đừng giải thích gì cả. Ngay khi bạn phải giải thích, bạn đã tìm ra một lỗi thiết kế.
- Ghi lại **khoảnh khắc họ do dự** — đó là chỗ giao diện hoặc tín hiệu chưa rõ.
- Ghi lại **chỗ họ chết** và phản ứng ngay sau đó.
- Yêu cầu nói thành tiếng suy nghĩ ("think aloud").
- Ngồi im. Chống lại mọi thôi thúc muốn hướng dẫn.

**Sau:** hỏi mở, tránh câu hỏi dẫn dắt.
- ✅ "Kể lại cho tôi chuyện gì vừa xảy ra."
- ✅ "Lúc nào bạn thấy khó chịu nhất?"
- ✅ "Bạn nghĩ mình nên làm gì tiếp theo?"
- ❌ "Bạn có thấy phần chiến đấu vui không?"

## Cỡ mẫu

- **1 người** đã phát hiện được lỗi khả dụng nghiêm trọng nhất.
- **5 người** phát hiện khoảng 80% vấn đề khả dụng.
- **20+ người** mới đủ để nói chuyện cân bằng.
- **Hàng trăm** mới đủ để phân tích số liệu định lượng đáng tin.

Đừng chờ có nhiều người mới test. Năm người bạn ngồi xem trực tiếp có giá trị hơn nhiều so với một khảo sát 200 người.

## Đo gì

**Chỉ số cốt lõi — luôn log:**

| Chỉ số | Cho biết |
|---|---|
| Tỉ lệ bỏ cuộc theo màn/phút | Chính xác nơi bạn mất người chơi |
| Số lần chết mỗi màn | Đỉnh đột biến = tường khó |
| Thời gian hoàn thành (trung vị + p90) | Đuôi dài = một nhóm đang vật lộn |
| Tỉ lệ thử lại sau khi chết | Giảm mạnh = vượt ngưỡng chịu đựng |
| Tỉ lệ sử dụng từng cơ chế/vũ khí | Gần 0 = người chơi không hiểu hoặc nó vô dụng |
| Độ dài phiên chơi | So với thiết kế của bạn |

**Chỉ số theo hệ thống:**
- Tồn kho tài nguyên theo thời gian → lạm phát ([[economy-design]])
- Winrate và pick rate mỗi build → cân bằng ([[balancing-math]])
- Thời gian tới mốc tiến trình kế tiếp → tường cày cuốc ([[progression]])

## Đọc số liệu cho đúng

**Dùng trung vị, không dùng trung bình.** Một người chơi để game chạy 8 tiếng sẽ kéo lệch mọi giá trị trung bình.

**Luôn xem phân bố, không chỉ xem một con số.** Thời gian hoàn thành trung vị 4 phút nghe ổn — nhưng nếu p90 là 22 phút thì 10% người chơi đang có trải nghiệm hoàn toàn khác.

**Tương quan không phải nhân quả.** "Người chơi dùng vũ khí A có tỉ lệ thắng cao hơn" có thể chỉ có nghĩa là người chơi giỏi thích vũ khí A.

**Phễu quan trọng hơn tổng số.** Không phải "1000 người chơi màn 1" mà là "1000 → 780 → 310 → 295". Cú rơi từ 780 xuống 310 là chỗ cần sửa, và nó rất cụ thể.

## Log thế nào

Ghi **sự kiện**, đừng ghi trạng thái tổng hợp. Sự kiện thô cho phép bạn đặt câu hỏi mới sau này mà không cần thu thập lại.

```json
{"t": 142.3, "event": "player_death", "level": 3, "cause": "brute_slam", "hp_before": 12, "attempt": 4}
{"t": 145.1, "event": "retry",        "level": 3, "attempt": 5}
{"t": 203.8, "event": "level_complete","level": 3, "time": 58.7, "deaths": 4}
```

Nguyên tắc riêng tư: chỉ log dữ liệu gameplay, không log thông tin định danh cá nhân. Nếu phát hành thương mại, cần thông báo rõ và cho phép từ chối.

## 🤖 Prompt cho AI

**Phân tích log** — dán file log vào, yêu cầu tìm điểm bất thường. Việc này AI làm nhanh và tốt:

> *"Đây là log của 50 phiên chơi. Tìm các màn có tỉ lệ bỏ cuộc bất thường, các nguyên nhân chết chiếm ưu thế, và các cơ chế gần như không được dùng. Đưa ra 3 giả thuyết cho mỗi bất thường."*

**Viết công cụ phân tích** — dashboard, biểu đồ, phễu. Công việc lặp lại mà AI dựng trong vài phút.

**Mô phỏng bổ sung cho playtest** — mô phỏng cho biết *có cân bằng không*, playtest cho biết *có vui không*. Cần cả hai; không cái nào thay được cái nào.

Điều AI **không** làm được: quan sát nét mặt người chơi lúc họ bực. Phần đó vẫn phải ngồi xem.

## 🎮 Unity

Trong Unity, phần khó không phải thu thập số liệu — là **thu thập mà không làm giật game và không mất dữ liệu khi crash**.

**Nơi các quyết định sống**

- `Core/Analytics/EventLogger.cs` — buffer + ghi theo lô (C# thuần được)
- `Application.persistentDataPath` — nơi ghi file log
- `Assets/Editor/LogAnalyzer.cs` — đọc log, vẽ phễu

**Ghi log không gây giật**

```csharp
public class EventLogger {
    readonly List<string> buffer = new(256);
    float lastFlush;

    public void Log(string name, string json) {
        // Ghi vào buffer trong bộ nhớ — KHÔNG chạm đĩa ở đây
        buffer.Add($"{{\"t\":{Time.unscaledTime:F2},\"e\":\"{name}\",\"d\":{json}}}");
        if (buffer.Count >= 200) Flush();
    }

    public void Flush() {
        if (buffer.Count == 0) return;
        File.AppendAllLines(logPath, buffer);   // một lần ghi cho 200 dòng
        buffer.Clear();
    }
}
```

Ghi từng dòng ra đĩa mỗi sự kiện là nguồn giật lag rõ ràng. Ghi theo lô 200 dòng gần như miễn phí.

**Đừng mất dữ liệu khi crash**

```csharp
void OnApplicationPause(bool paused) { if (paused) logger.Flush(); }
void OnApplicationFocus(bool focus)  { if (!focus)  logger.Flush(); }
void OnApplicationQuit()             { logger.Flush(); }
```

Ba callback này bắt gần hết trường hợp. Crash cứng thì vẫn mất buffer — nên đặt ngưỡng flush thấp hơn (50 dòng) nếu đang tìm bug crash.

**`unscaledTime`, không `time`**

`Time.time` bị `timeScale` ảnh hưởng, nên hitstop và pause làm số liệu lệch. Mọi mốc thời gian trong log dùng `Time.unscaledTime`.

**Vẽ phễu ngay trong Editor**

```csharp
[MenuItem("Tools/Analytics/Funnel")]
static void Funnel() {
    var events = LoadAllSessions();          // đọc mọi file log
    var steps = new[] { "level_start", "level_complete" };
    // đếm session đi qua từng bước, in tỉ lệ rơi rụng
    // 1000 -> 780 -> 310 -> 295 : cú rơi 780->310 là chỗ cần sửa
}
```

Không cần dashboard bên ngoài cho giai đoạn playtest nội bộ. Một EditorWindow đọc file JSON là đủ và làm trong một buổi.

**Bẫy Unity cụ thể**
- **`Application.persistentDataPath` khác nhau mỗi nền tảng** — đừng hardcode đường dẫn.
- **`File.AppendAllLines` trên WebGL không hoạt động** — WebGL không có filesystem thật. Dùng `PlayerPrefs` hoặc gửi lên server.
- **Ghi log trong `Update`** — kể cả vào buffer, `string` interpolation cấp phát. Chỉ log sự kiện, không log mỗi frame.
- **Quên ẩn danh** — không log tên máy, đường dẫn chứa tên người dùng.

**Kiểm tra nhanh**
- Profiler khi đang log nhiều: GC Alloc có tăng không?
- Alt-Tab ra rồi vào: log có được flush không?
- Log dùng `unscaledTime` chứ?
- Có dữ liệu định danh cá nhân nào trong log không? (không được)

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Luật nền của playtest là gì?**
  → **Người chơi rất giỏi phát hiện vấn đề và rất dở đề xuất giải pháp.** Ai đó nói "nên cho nhân vật nhảy đúp" thì thứ họ thực sự nói là "tôi thấy bực khi di chuyển". Nghe phần vấn đề, tự tìm giải pháp. Hệ quả thứ hai quan trọng hơn: **quan sát, đừng chỉ hỏi** — lời nói bị chi phối bởi phép lịch sự, hành vi thì không.
- `Junior` **Cần bao nhiêu người để một buổi playtest có giá trị?**
  → **1 người** đã phát hiện được lỗi khả dụng nghiêm trọng nhất. **5 người** phát hiện khoảng 80% vấn đề khả dụng. **20+ người** mới đủ nói chuyện cân bằng, và **hàng trăm** mới đủ cho phân tích định lượng đáng tin. Năm người ngồi xem trực tiếp có giá trị hơn một khảo sát 200 người.
- `Junior` **Trong buổi test anh làm gì và không làm gì?**
  → **Không giải thích gì cả** — ngay khi phải giải thích là đã tìm ra một lỗi thiết kế. Ghi lại **khoảnh khắc do dự** (chỗ tín hiệu chưa rõ), ghi chỗ họ chết và phản ứng ngay sau đó, yêu cầu nói thành tiếng suy nghĩ. Và ngồi im, chống lại mọi thôi thúc muốn hướng dẫn.
- `Mid` **Hỏi sau buổi test thế nào cho đúng?**
  → Hỏi mở, tránh dẫn dắt. Tốt: "Kể lại cho tôi chuyện gì vừa xảy ra", "Lúc nào bạn thấy khó chịu nhất?", "Bạn nghĩ mình nên làm gì tiếp theo?". Tệ: "Bạn có thấy phần chiến đấu vui không?" — câu đó vừa gợi ý câu trả lời vừa buộc người ta lịch sự, nên gần như luôn nhận được "có".
- `Mid` **Vì sao dùng trung vị chứ không dùng trung bình?**
  → Vì một người để game chạy 8 tiếng sẽ kéo lệch mọi giá trị trung bình. Và quan trọng hơn: **luôn xem phân bố, không chỉ một con số** — thời gian hoàn thành trung vị 4 phút nghe ổn, nhưng p90 là 22 phút nghĩa là 10% người chơi đang có trải nghiệm hoàn toàn khác.
- `Mid` **Vì sao phễu quan trọng hơn tổng số?**
  → Vì tổng số không chỉ được chỗ nào hỏng. "1000 người chơi màn 1" không hành động được; "1000 → 780 → 310 → 295" thì chỉ thẳng vào cú rơi từ 780 xuống 310. Sửa theo **bước rơi lớn nhất** đáng hơn mọi cải thiện khác cộng lại, và nó cũng cho một tiêu chí rõ để biết đã sửa xong.
- `Senior` **Chỉ số cốt lõi nào anh luôn log?**
  → Tỉ lệ bỏ cuộc theo màn/phút, số lần chết mỗi màn, thời gian hoàn thành (**trung vị + p90**), tỉ lệ thử lại sau khi chết, **tỉ lệ sử dụng từng cơ chế/vũ khí** (gần 0 nghĩa là người chơi không hiểu hoặc nó vô dụng), và độ dài phiên chơi so với thiết kế. Theo hệ thống thì thêm: tồn kho tài nguyên theo thời gian, winrate và pick rate, thời gian tới mốc tiến trình kế tiếp.
- `Senior` **Log sự kiện hay log trạng thái tổng hợp? Vì sao?**
  → **Log sự kiện thô.** Sự kiện cho phép đặt **câu hỏi mới sau này** mà không cần thu thập lại — còn tổng hợp sẵn thì khoá mình vào đúng những câu hỏi đã nghĩ ra hôm nay. Kèm theo là nguyên tắc riêng tư: chỉ log dữ liệu gameplay, không log thông tin định danh cá nhân, và nếu phát hành thương mại thì phải thông báo rõ và cho phép từ chối.
- `Senior` **"Người chơi dùng vũ khí A có tỉ lệ thắng cao hơn" — anh kết luận gì?**
  → Chưa kết luận gì cả, vì **tương quan không phải nhân quả**: rất có thể người chơi giỏi thích vũ khí A. Cách tách là so trong cùng nhóm kỹ năng, hoặc nhìn winrate của chính những người chơi đó khi họ dùng vũ khí khác. Đây là cái bẫy phổ biến nhất khi một đội bắt đầu có đủ dữ liệu để tự tin.

**Khung trả lời 60 giây** — "Anh chạy một buổi playtest thế nào?"

> **Trước** buổi test tôi viết ra câu hỏi cần trả lời, và nó phải cụ thể: "người chơi có hiểu cơ chế đẩy lùi không", chứ không phải "game có hay không". Không có câu hỏi thì buổi test cho ra ý kiến, không cho ra kết luận.
>
> **Trong** buổi test, luật quan trọng nhất là **không giải thích gì cả** — ngay khi tôi phải mở miệng giải thích thì tôi đã tìm ra một lỗi thiết kế. Tôi ghi ba thứ: chỗ họ do dự, chỗ họ chết và phản ứng ngay sau đó, và những gì họ nói thành tiếng. Rồi ngồi im.
>
> **Sau** đó hỏi mở chứ không dẫn dắt: "kể lại chuyện vừa xảy ra", "lúc nào bạn khó chịu nhất". Và tôi nhớ luật nền: người chơi **giỏi phát hiện vấn đề, dở đề xuất giải pháp**, nên tôi nghe phần vấn đề và tự tìm giải pháp. Về quy mô thì một người đã đủ thấy lỗi nặng nhất, năm người thấy khoảng 80% vấn đề khả dụng — đừng chờ có hai mươi người mới bắt đầu.

**Họ sẽ đào tiếp**

- *"Vì sao chỗ do dự lại quan trọng hơn chỗ chết?"* → Vì chết là thứ người chơi kể lại được, còn **do dự thì họ quên ngay** — nhưng nó chính là dấu vết của một tín hiệu chưa đủ rõ. Một giây dừng lại trước ba cánh cửa giống nhau không bao giờ xuất hiện trong khảo sát, mà nó là lỗi thiết kế thật.
- *"Test từ xa và test trực tiếp khác nhau ra sao?"* → Trực tiếp cho mình **khuôn mặt và độ do dự**; từ xa cho mình **số lượng**. Tôi dùng trực tiếp cho câu hỏi "vì sao", từ xa cho câu hỏi "bao nhiêu". Sai lầm hay gặp là dùng khảo sát từ xa để trả lời câu hỏi "vì sao" — và nhận về những lời giải thích mà chính người chơi cũng đang đoán.
- *"Tỉ lệ sử dụng một vũ khí gần 0 — sửa thế nào?"* → Trước hết phân biệt **không hiểu** và **vô dụng**: cho vài tester dùng nó có hướng dẫn rồi xem họ có thích không. Không hiểu thì sửa truyền đạt và vị trí giới thiệu; vô dụng thì sửa số. Đổi số cho một thứ mà người chơi chưa từng thử là cách tiêu công vào chỗ không ai nhìn thấy.
- *"Dùng AI ở khâu này thế nào?"* → Giao cho nó **phân tích log thô**: dựng phễu, tìm bước rơi lớn nhất, so phân bố giữa các nhóm, và gợi ý giả thuyết. Việc nó không làm được là ngồi xem người chơi do dự — nên tôi coi nó là công cụ cho nửa định lượng, còn nửa định tính vẫn phải tự ngồi.

**Cờ đỏ**

- Hỏi "game có vui không" rồi ghi lại câu trả lời như dữ liệu.
- Giải thích cho tester trong lúc họ chơi.
- Báo cáo bằng trung bình, không có phân bố hay phễu.
- Làm theo đúng giải pháp người chơi đề xuất.
- Chờ đủ hai mươi người mới bắt đầu test.

**Số / ví dụ nên thuộc**

- Cỡ mẫu: **1 người** thấy lỗi nặng nhất · **5 người** ≈ 80% vấn đề khả dụng · **20+** cho cân bằng · hàng trăm cho định lượng.
- Luôn dùng **trung vị + p90**, không dùng trung bình.
- Phễu dạng **1000 → 780 → 310 → 295**; sửa theo bước rơi lớn nhất.
- Chỉ số cốt lõi: bỏ cuộc theo màn · chết mỗi màn · thời gian hoàn thành · **tỉ lệ thử lại** · tỉ lệ sử dụng cơ chế · độ dài phiên.
- Log **sự kiện thô**, không log trạng thái tổng hợp; không log thông tin định danh cá nhân.
