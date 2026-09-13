---
id: csharp-delegate-event
title: Delegate, event và rò rỉ
icon: 📡
summary: Action/Func, khác biệt thật giữa delegate field và event, vì sao một dòng += giữ sống cả scene cũ, và luật OnEnable/OnDisable mà mọi dự án Unity phải có.
status: deep
read: 791
level: intermediate
order: 50
tags: [csharp, delegate, event, memory-leak, architecture, interview]
related: [csharp-linq, csharp-memory, unity-design-patterns, architecture-patterns]
---

Delegate là cách các hệ thống trong game nói chuyện với nhau mà không cần biết nhau: `HealthSystem` bắn `OnDeath`, còn ai nghe thì tuỳ — UI, âm thanh, hệ thống nhiệm vụ, bảng thống kê. Đó là lý do nó có mặt ở mọi dự án.

Cũng vì vậy nó là **nguồn rò rỉ bộ nhớ phổ biến nhất** trong code C# game. Cơ chế đơn giản tới mức khó tin: object phát sự kiện giữ tham chiếu tới object nghe, nên chừng nào người phát còn sống thì người nghe **không bao giờ** được thu dọn — kể cả khi scene đã đổi, GameObject đã destroy, và bạn tưởng nó chết từ lâu.

## Delegate, Action, Func — ba tên của một thứ

```csharp
delegate void DamageHandler(int amount);         // kiểu delegate tự khai — hiếm khi cần nữa
Action<int> onDamage;                            // trả về void, nhận 0–16 tham số
Func<Enemy, float> distanceOf;                   // tham số cuối là KIỂU TRẢ VỀ
Predicate<Enemy> isDead;                         // == Func<Enemy, bool>, dùng trong List.Find
```

Delegate là **con trỏ hàm có kiểu**, và nó đa hướng (multicast): một delegate giữ được nhiều hàm, gọi một lần chạy hết theo thứ tự đăng ký. Hai hệ quả ít người nói được:

- **Hàm nào ném exception thì các hàm đăng ký sau nó không chạy.** Một listener hỏng làm câm cả chuỗi.
- **Với `Func<T>` multicast, chỉ giá trị trả về của hàm cuối cùng được giữ lại.** Nên đừng multicast thứ có giá trị trả về.

Mỗi delegate còn giữ **hai** thứ: con trỏ hàm và `Target` — object chủ của hàm đó. Chính `Target` là thứ tạo ra rò rỉ.

## `event` khác gì một field delegate

```csharp
public Action OnDeath;              // field: ai cũng gọi được, ai cũng XOÁ SẠCH được
public event Action OnDeathSafe;    // event: bên ngoài chỉ được += và -=
```

Với field công khai, bất kỳ đoạn code nào cũng có thể viết `enemy.OnDeath = null` (xoá hết listener của người khác) hoặc `enemy.OnDeath()` (bắn sự kiện giả). Từ khoá `event` chặn cả hai: bên ngoài lớp khai báo chỉ còn `+=` và `-=`.

Đây là câu hỏi phỏng vấn rất hay gặp, và câu trả lời đầy đủ chỉ có một dòng: **`event` là bộ giới hạn quyền truy cập quanh một delegate, không phải một cơ chế khác.**

```csharp
public class Health
{
    public event Action<int> Damaged;               // chỉ Health mới bắn được

    public void Take(int dmg)
    {
        hp -= dmg;
        Damaged?.Invoke(dmg);                        // ?. đọc field một lần -> an toàn với đa luồng
    }
}
```

`?.Invoke` không chỉ gọn hơn `if (Damaged != null)`: nó đọc field vào biến tạm rồi mới gọi, nên không dính race "vừa kiểm tra xong thì listener cuối cùng huỷ đăng ký".

## Rò rỉ: ai giữ ai

<figure class="fig">
<svg viewBox="0 0 660 210" role="img" aria-label="Sơ đồ rò rỉ sự kiện: GameEvents tĩnh giữ delegate, delegate giữ Target là một UI panel đã bị destroy, nên GC không thu dọn được panel và cả scene cũ treo theo">
  <rect x="14" y="30" width="150" height="70" rx="9" class="fig-box"/>
  <text x="89" y="54" text-anchor="middle" class="fig-label" font-size="12" font-weight="600">GameEvents (static)</text>
  <text x="89" y="72" text-anchor="middle" class="fig-muted" font-size="10">sống tới hết app</text>
  <text x="89" y="88" text-anchor="middle" class="fig-muted" font-size="10">event Action OnScore</text>
  <line x1="164" y1="65" x2="236" y2="65" class="fig-line" stroke="#ff8787" stroke-width="2"/>
  <text x="200" y="56" text-anchor="middle" class="fig-muted" font-size="10">giữ</text>
  <rect x="240" y="30" width="150" height="70" rx="9" class="fig-box"/>
  <text x="315" y="54" text-anchor="middle" class="fig-label" font-size="12" font-weight="600">Delegate</text>
  <text x="315" y="72" text-anchor="middle" class="fig-muted" font-size="10">Method: OnScoreChanged</text>
  <text x="315" y="88" text-anchor="middle" class="fig-muted" font-size="10">Target: ← chỗ rò rỉ</text>
  <line x1="390" y1="65" x2="462" y2="65" class="fig-line" stroke="#ff8787" stroke-width="2"/>
  <text x="426" y="56" text-anchor="middle" class="fig-muted" font-size="10">giữ</text>
  <rect x="466" y="30" width="180" height="70" rx="9" fill="#ff8787" opacity="0.16"/>
  <text x="556" y="54" text-anchor="middle" class="fig-label" font-size="12" font-weight="600">ScorePanel (đã Destroy)</text>
  <text x="556" y="72" text-anchor="middle" class="fig-muted" font-size="10">GameObject đã chết,</text>
  <text x="556" y="88" text-anchor="middle" class="fig-muted" font-size="10">object C# thì CHƯA</text>
  <line x1="556" y1="100" x2="556" y2="128" class="fig-line" stroke="#ff8787" stroke-width="2"/>
  <rect x="440" y="130" width="206" height="56" rx="9" class="fig-box"/>
  <text x="543" y="150" text-anchor="middle" class="fig-muted" font-size="10">…giữ luôn sprite, texture,</text>
  <text x="543" y="166" text-anchor="middle" class="fig-muted" font-size="10">danh sách item, và mọi thứ</text>
  <text x="543" y="181" text-anchor="middle" class="fig-muted" font-size="10">panel đó tham chiếu tới</text>
  <text x="20" y="150" class="fig-label" font-size="11">Chiều tham chiếu đi từ NGƯỜI PHÁT sang NGƯỜI NGHE</text>
  <text x="20" y="168" class="fig-muted" font-size="11">— ngược với chiều bạn nghĩ. Người nghe không giữ người phát;</text>
  <text x="20" y="184" class="fig-muted" font-size="11">người phát giữ người nghe, nên người nghe mới là thứ không chết được.</text>
</svg>
<figcaption>Rò rỉ sự kiện không phải rò rỉ một object mà là rò rỉ cả cụm object treo theo nó. Một panel UI còn đăng ký giữ sống mọi texture nó tham chiếu.</figcaption>
</figure>

Trong Unity, hình này thành ba triệu chứng cụ thể:

1. **Bộ nhớ tăng dần mỗi lần đổi scene** và không bao giờ trả lại.
2. **`MissingReferenceException` khi bắn sự kiện** — object C# còn sống nhưng GameObject của nó đã destroy.
3. **Handler chạy hai lần, rồi ba lần** — vì mỗi lần vào scene lại `+=` thêm một lần nữa.

Luật chữa, áp dụng không ngoại lệ:

```csharp
void OnEnable()  { GameEvents.OnScore += OnScoreChanged; }     // đăng ký khi bật
void OnDisable() { GameEvents.OnScore -= OnScoreChanged; }     // HUỶ khi tắt hoặc destroy
```

`OnDisable` chạy cả khi GameObject bị tắt lẫn khi bị destroy, nên cặp `OnEnable`/`OnDisable` phủ mọi đường ra. Đăng ký ở `Start` rồi huỷ ở `OnDestroy` là cặp *lệch*: object bị tắt/bật lại sẽ đăng ký hai lần.

## Lambda đăng ký rồi thì không huỷ được

```csharp
// SAI: -= tạo ra một delegate MỚI, không khớp cái đã +=
GameEvents.OnScore += () => UpdateLabel();
GameEvents.OnScore -= () => UpdateLabel();     // không xoá gì cả, im lặng

// ĐÚNG: giữ lại tham chiếu
Action handler;
void OnEnable()  { handler = () => UpdateLabel(); GameEvents.OnScore += handler; }
void OnDisable() { GameEvents.OnScore -= handler; }

// ĐƠN GIẢN HƠN: dùng method group, nó so sánh được
void OnEnable()  { GameEvents.OnScore += UpdateLabel; }
void OnDisable() { GameEvents.OnScore -= UpdateLabel; }
```

Hai lambda có cùng thân nhưng là hai object khác nhau, và `-=` so sánh theo `Target` + method. Đây là bẫy im lặng nhất trong nhóm: không lỗi, không cảnh báo, chỉ là một listener không bao giờ biến mất.

## `event` của C# hay `UnityEvent`

| | C# `event` | `UnityEvent` |
|---|---|---|
| Khai được listener trong Inspector | Không | **Có** — designer nối được |
| Tốc độ gọi | Nhanh, gọi thẳng | Chậm hơn vài lần, listener khai trong Inspector đi qua reflection |
| Lưu trong prefab/scene | Không | Có (được serialize) |
| An toàn kiểu lúc biên dịch | **Có** | Chỉ kiểm lúc chạy — đổi tên hàm là đứt kết nối, không báo lỗi |
| Rò rỉ | Có, nếu quên `-=` | Cũng có, nhưng listener khai trong Inspector tự chết theo object |

Cách chia dùng trong thực tế: **`UnityEvent` ở ranh giới với designer** (nút bấm, trigger vùng, timeline), **C# `event` ở giữa các hệ thống code**. Đừng dùng `UnityEvent` cho sự kiện bắn mỗi frame.

## Event bus — tiện tới mức nguy hiểm

```csharp
public static class GameEvents
{
    public static event Action<int> ScoreChanged;
    public static void RaiseScore(int v) => ScoreChanged?.Invoke(v);
}
```

Ba thứ phải quyết trước khi dựng một cái như trên, vì sửa sau rất đắt:

- **Ai được bắn.** Để `public static event` thì mọi file trong dự án đều bắn được, và sáu tháng sau không ai biết sự kiện này từ đâu ra. Đặt hàm `Raise…` rồi giữ quyền bắn ở một chỗ.
- **Huỷ đăng ký lúc nào.** Sự kiện tĩnh sống tới hết app; mọi listener đều phải tự dọn.
- **Được phép huỷ đăng ký *trong lúc* đang xử lý sự kiện không.** Nếu có, phải copy danh sách trước khi gọi — nếu không sẽ hỏng giữa chừng.

Và bẫy riêng của Unity: bật **Enter Play Mode Options** (tắt Domain Reload) để vào Play nhanh hơn thì **biến tĩnh không được reset** giữa các lần Play. Sự kiện tĩnh sẽ còn nguyên listener của phiên chơi trước — bug chỉ xuất hiện trong Editor, không có trên bản build. Cách chữa: `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]` để xoá tay.

## Chi phí

- **Mỗi lần `+=` cấp phát**: nó tạo một delegate mới rồi gộp thành một multicast delegate mới. Đăng ký/huỷ liên tục trong `Update` là rác đều đặn.
- **Truyền method group làm tham số** (`list.ForEach(Print)`) cũng tạo delegate mỗi lần gọi — cache vào field nếu ở chỗ nóng.
- **Gọi qua delegate chậm hơn gọi thẳng** vì thêm một lần gián tiếp và khó inline. Ở vài trăm lần mỗi frame thì vô hình; ở vài chục nghìn lần thì nên gọi trực tiếp hoặc dùng generic + interface — xem [[csharp-generic]].

## Kiểm tra nhanh

- [ ] Mọi `+=` có một `-=` đối xứng, và cặp đó là `OnEnable`/`OnDisable`
- [ ] Không `+=` lambda ở chỗ cần huỷ đăng ký về sau
- [ ] Mọi event công khai đều khai `event`, không phải field delegate trần
- [ ] Bắn sự kiện bằng `?.Invoke(...)`
- [ ] Sự kiện tĩnh có chỗ reset khi tắt Domain Reload
- [ ] Handler không ném exception ra ngoài — một listener hỏng không được làm câm cả chuỗi

## 🤖 Prompt cho AI

**Dùng AI thế nào cho kiến trúc sự kiện**

AI viết được ngay một event bus trông chuyên nghiệp, và đó chính là vấn đề: nó sinh ra thứ **dễ dùng tới mức mọi hệ thống bắt đầu nói chuyện với nhau qua đó**, và sáu tháng sau không ai lần được luồng chạy. Việc đáng giao cho AI không phải là "thiết kế hệ thống sự kiện" mà là ba việc hẹp hơn: **rà các cặp `+=`/`-=` lệch nhau**, **đổi lambda đăng ký thành method group để huỷ được**, và **sinh code reset sự kiện tĩnh**.

Trước khi nhờ AI dựng event bus, hãy tự trả lời: những sự kiện nào **thật sự** cần phát rộng? Phần lớn quan hệ trong game là một-một và nên là lời gọi hàm thẳng, không phải sự kiện.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Người nghe sống lâu hơn hay ngắn hơn người phát** — quyết định có cần huỷ đăng ký không.
- **Sự kiện có tham số gì và bắn bao nhiêu lần mỗi giây** — mỗi frame thì cấm dùng `UnityEvent`.
- **Có cần designer nối trong Inspector không** — quyết định `UnityEvent` hay C# `event`.
- **Được phép huỷ đăng ký trong lúc đang xử lý không** — quyết định có phải copy danh sách trước khi gọi.
- **Enter Play Mode Options đang bật hay tắt** — quyết định có cần code reset biến tĩnh.

**Mẫu prompt**

```
Unity 6, C# 9. Rà file dưới đây về vòng đời đăng ký sự kiện.

<dán file>

Việc:
1. Liệt kê MỌI chỗ += và chỗ -= tương ứng. Chỉ ra cặp nào lệch (đăng ký ở Start,
   huỷ ở OnDestroy; hoặc += lambda rồi -= lambda khác).
2. Với mỗi chỗ lệch: nói rõ hậu quả cụ thể (rò rỉ cái gì, handler chạy mấy lần).
3. Viết lại theo cặp OnEnable/OnDisable, dùng method group thay vì lambda.
4. Nếu có event static: sinh hàm reset kèm [RuntimeInitializeOnLoadMethod].

KHÔNG đề xuất thêm thư viện messaging. KHÔNG đổi kiến trúc, chỉ sửa vòng đời.
```

**Bẫy thường gặp:** AI "sửa rò rỉ" bằng cách thêm `-=` vào `OnDestroy` trong khi `+=` nằm ở `OnEnable` — object bị tắt rồi bật lại sẽ đăng ký hai lần, và triệu chứng là handler chạy hai lần chứ không phải rò rỉ, nên rất khó lần. Bẫy thứ hai: nó đề xuất event bus cho mọi liên kết giữa hai lớp, kể cả quan hệ một-một hiển nhiên. Bẫy thứ ba: nó viết `-=` cho một lambda vừa `+=` và khẳng định đã huỷ đăng ký — không có tác dụng gì.

## 💻 Code

Demo chứng minh rò rỉ bằng số chứ không bằng lời: dùng `WeakReference` để xem object nghe có được GC thu dọn không, sau khi huỷ đăng ký đúng và sau khi "huỷ" bằng lambda. Kèm trường hợp một listener ném exception làm câm các listener sau. Chạy bằng `dotnet run`.

**Script**

```csharp
// Program.cs — .NET 6+ (dotnet new console && dotnet run)
using System;

// Người phát: sống tới hết chương trình, giống một event static trong game
static class GameEvents
{
    public static event Action<int> ScoreChanged;
    public static void Raise(int v) => ScoreChanged?.Invoke(v);
    public static int ListenerCount => ScoreChanged?.GetInvocationList().Length ?? 0;

    // Bắn an toàn: gọi từng listener riêng, một cái hỏng không làm câm những cái sau.
    // GetInvocationList() chỉ gọi được TRONG lớp khai báo event — đó chính là điều `event` bảo vệ.
    public static void RaiseSafe(int v)
    {
        var list = ScoreChanged?.GetInvocationList();
        if (list == null) return;
        foreach (Action<int> h in list)
            try { h(v); } catch (Exception e) { Console.WriteLine($"   nuốt lỗi của một listener: {e.Message}"); }
    }
}

// Người nghe: giống một panel UI, giữ theo nó một mảng lớn để thấy rõ cái giá của rò rỉ
class ScorePanel
{
    readonly byte[] textureIsh = new byte[1_000_000];   // 1 MB "tài nguyên" treo theo panel
    public readonly string Name;
    Action<int> boundLambda;

    public ScorePanel(string name) { Name = name; }

    public void SubscribeWithMethod() => GameEvents.ScoreChanged += OnScore;
    public void UnsubscribeMethod() => GameEvents.ScoreChanged -= OnScore;

    public void SubscribeWithLambda() { boundLambda = v => OnScore(v); GameEvents.ScoreChanged += boundLambda; }
    public void FakeUnsubscribeLambda() => GameEvents.ScoreChanged -= v => OnScore(v);  // KHÔNG xoá gì
    public void RealUnsubscribeLambda() => GameEvents.ScoreChanged -= boundLambda;      // xoá đúng

    void OnScore(int v) { if (textureIsh.Length == 0) Console.WriteLine(v); }
}

static class Program
{
    static void Main()
    {
        Console.WriteLine("— 1) huỷ đăng ký ĐÚNG bằng method group —");
        Console.WriteLine($"   sống sót sau GC: {SurvivesGc(p => { p.SubscribeWithMethod(); p.UnsubscribeMethod(); })}");

        Console.WriteLine("— 2) 'huỷ' bằng một lambda khác —");
        Console.WriteLine($"   sống sót sau GC: {SurvivesGc(p => { p.SubscribeWithLambda(); p.FakeUnsubscribeLambda(); })}   <- RÒ RỈ");

        Console.WriteLine("— 3) huỷ đúng lambda đã lưu —");
        Console.WriteLine($"   sống sót sau GC: {SurvivesGc(p => { p.SubscribeWithLambda(); p.RealUnsubscribeLambda(); })}");

        Console.WriteLine($"\nListener còn treo trên event: {GameEvents.ListenerCount}");

        Console.WriteLine("\n— 4) một listener ném exception —");
        GameEvents.ScoreChanged += v => Console.WriteLine("   A chạy");
        GameEvents.ScoreChanged += v => throw new InvalidOperationException("B hỏng");
        GameEvents.ScoreChanged += v => Console.WriteLine("   C chạy  <- dòng này KHÔNG in ra");
        try { GameEvents.Raise(10); } catch (Exception e) { Console.WriteLine($"   bắt được: {e.Message}"); }

        Console.WriteLine("\n— 5) cách chặn: bắn qua RaiseSafe, gọi từng listener trong try/catch —");
        GameEvents.RaiseSafe(10);
    }

    // Tạo một panel, chạy kịch bản đăng ký/huỷ, rồi xem GC có thu dọn được không
    static bool SurvivesGc(Action<ScorePanel> scenario)
    {
        var weak = MakePanel(scenario);
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();
        return weak.IsAlive;
    }

    static WeakReference MakePanel(Action<ScorePanel> scenario)
    {
        var panel = new ScorePanel("HUD");
        scenario(panel);
        return new WeakReference(panel);      // không giữ tham chiếu mạnh nào nữa
    }
}
```

> `RaiseSafe` nằm **trong** `GameEvents` chứ không ở ngoài, vì `GetInvocationList()` chỉ truy cập được từ lớp khai báo event — đúng cái mà từ khoá `event` bảo vệ. Trong dự án thật, đó là chỗ duy nhất được phép bắn sự kiện.

**Chạy thử**
- Trường hợp 1 và 3 in `False`: panel được GC thu dọn, 1 MB kèm theo được trả lại.
- Trường hợp 2 in **`True`** — panel vẫn sống dù không còn ai tham chiếu tới nó, chỉ vì một lambda đăng ký không huỷ được. Đây là rò rỉ sự kiện, nhìn thấy bằng số.
- Dòng "Listener còn treo" in ra **1**: đúng một listener ma còn lại.
- Phần 4: `C chạy` **không** được in — listener ném exception chặn mọi listener đăng ký sau nó. Đây là lý do hàm bắn sự kiện trong dự án thật nên gọi từng listener trong `try/catch`.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`delegate`, `Action`, `Func` khác nhau thế nào?**
  → `delegate` là cơ chế: một con trỏ hàm có kiểu, giữ được nhiều hàm cùng lúc. `Action` và `Func` chỉ là các kiểu delegate dựng sẵn trong .NET — `Action` trả về `void`, `Func` có kiểu trả về ở tham số generic cuối cùng. Ngày nay hầu như không cần tự khai `delegate` nữa, trừ khi muốn đặt tên có nghĩa cho một chữ ký dùng nhiều nơi.
- `Junior` **`event` khác gì một field kiểu `Action` để public?**
  → `event` là bộ giới hạn quyền quanh chính delegate đó: bên ngoài lớp khai báo chỉ được `+=` và `-=`. Với field trần thì bất kỳ ai cũng gán được `= null` để xoá sạch listener của người khác, hoặc tự bắn sự kiện giả. Cơ chế bên dưới giống hệt nhau.
- `Junior` **Vì sao viết `Handler?.Invoke(x)` chứ không `if (Handler != null) Handler(x)`?**
  → Vì `?.` đọc field vào một biến tạm rồi mới gọi, nên nếu listener cuối cùng huỷ đăng ký ngay giữa hai dòng thì vẫn không `NullReferenceException`. Gọn hơn chỉ là phần thưởng thêm.
- `Mid` **Sự kiện gây rò rỉ bộ nhớ bằng cách nào?**
  → Delegate giữ `Target` — chính là object có hàm được đăng ký. Nên **người phát giữ người nghe**, ngược chiều với cảm giác thông thường. Người phát sống lâu, ví dụ một event static, thì người nghe không bao giờ được GC thu dọn, kéo theo mọi thứ nó tham chiếu: sprite, texture, danh sách item. Trong Unity triệu chứng là bộ nhớ tăng dần mỗi lần đổi scene.
- `Mid` **Vì sao đăng ký ở `OnEnable` và huỷ ở `OnDisable`, không phải `Start`/`OnDestroy`?**
  → Vì `OnEnable`/`OnDisable` là cặp đối xứng: `OnDisable` chạy cả khi object bị tắt lẫn khi bị destroy. Đăng ký ở `Start` mà huỷ ở `OnDestroy` thì object tắt rồi bật lại sẽ đăng ký lần thứ hai, và triệu chứng là handler chạy hai lần — rất khó lần vì nó không giống lỗi rò rỉ.
- `Mid` **`+=` một lambda rồi `-=` đúng lambda đó viết lại có huỷ được không?**
  → Không. Hai lambda cùng thân vẫn là hai object khác nhau, và `-=` so khớp theo `Target` cộng method. Muốn huỷ được thì lưu delegate vào một field, hoặc dùng method group — `+= UpdateLabel` và `-= UpdateLabel` khớp nhau bình thường.
- `Mid` **C# `event` hay `UnityEvent`?**
  → `UnityEvent` ở ranh giới với designer: nút bấm, trigger, timeline — vì nó serialize được và nối trong Inspector. C# `event` ở giữa các hệ thống code: nhanh hơn, an toàn kiểu lúc biên dịch, đổi tên hàm thì compiler báo lỗi ngay. Không dùng `UnityEvent` cho thứ bắn mỗi frame.
- `Senior` **Một listener ném exception thì sao?**
  → Các listener đăng ký sau nó **không chạy** — multicast delegate gọi tuần tự và exception thoát khỏi cả chuỗi. Đây là lỗi khó chẩn đoán vì triệu chứng nằm ở một hệ thống khác hẳn nơi có bug. Cách chặn là hàm bắn sự kiện tự duyệt `GetInvocationList()` và gọi từng listener trong `try/catch`, ghi log rồi đi tiếp.
- `Senior` **Event bus tiện, vậy vấn đề của nó là gì?**
  → Nó xoá mất luồng chạy. Sáu tháng sau, câu hỏi "ai làm điểm số tăng" không trả lời được bằng cách đọc code, vì mọi thứ đều nói chuyện gián tiếp. Luật của tôi: sự kiện dành cho quan hệ **một-nhiều thật sự** và cho việc phá vòng phụ thuộc; quan hệ một-một thì gọi hàm thẳng. Và quyền bắn sự kiện giữ trong một lớp, không để `public static event` cho cả dự án bắn.
- `Senior` **Bẫy nào chỉ xuất hiện trong Editor?**
  → Tắt Domain Reload bằng Enter Play Mode Options thì **biến tĩnh không reset** giữa các lần Play, nên event tĩnh còn nguyên listener của phiên trước: handler chạy hai lần, tham chiếu trỏ vào object đã chết. Bản build không có triệu chứng này. Cách chữa là hàm reset gắn `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]`.

**Khung trả lời 60 giây** — "Sự kiện gây rò rỉ bộ nhớ thế nào, anh phòng ra sao?"

> Cơ chế nằm ở chỗ delegate giữ hai thứ: con trỏ hàm và **`Target`**, tức object chủ của hàm đó. Nên chiều tham chiếu đi từ **người phát sang người nghe** — ngược với cảm giác thông thường. Nếu người phát sống lâu, ví dụ một `static event`, thì người nghe không bao giờ được thu dọn, và nó kéo theo mọi thứ nó tham chiếu: cả panel UI, cả texture.
>
> Trong Unity triệu chứng có ba dạng: bộ nhớ tăng dần mỗi lần đổi scene, `MissingReferenceException` lúc bắn sự kiện, và handler chạy hai ba lần vì mỗi lần vào scene lại đăng ký thêm.
>
> Cách phòng của tôi là một luật không ngoại lệ: đăng ký ở **`OnEnable`**, huỷ ở **`OnDisable`** — cặp đối xứng, phủ cả trường hợp tắt lẫn destroy. Và luôn dùng **method group** chứ không `+=` lambda, vì lambda thì `-=` không khớp được. Với event static thì thêm một hàm reset để đỡ trường hợp tắt Domain Reload trong Editor.

**Họ sẽ đào tiếp**

- *"Vì sao không dùng `Start`/`OnDestroy`?"* → Không đối xứng: object tắt rồi bật lại sẽ `+=` lần nữa mà chưa từng `-=`. Triệu chứng là handler chạy hai lần, dễ bị nhầm với bug logic.
- *"Lambda thì sao?"* → `-=` với một lambda viết lại không xoá gì, vì đó là object khác. Phải lưu delegate vào field, hoặc dùng method group.
- *"Có cách nào không cần nhớ huỷ đăng ký?"* → Có mẫu weak event hoặc một lớp `EventBinding` tự huỷ khi object chết, nhưng chúng thêm phức tạp và che mất chi phí. Tôi thích luật `OnEnable`/`OnDisable` hơn vì nó hiển nhiên khi đọc code.
- *"Một listener hỏng thì sao?"* → Các listener sau nó không chạy. Hàm bắn sự kiện nên duyệt `GetInvocationList()` và gọi từng cái trong `try/catch`.
- *"`+=` có cấp phát không?"* → Có: tạo một delegate mới rồi gộp thành multicast delegate mới. Không sao nếu đăng ký lúc khởi tạo; thành rác đều đặn nếu đăng ký/huỷ mỗi frame.

**Cờ đỏ**

- Nghĩ người nghe giữ người phát — tức là hiểu ngược chiều tham chiếu.
- "Unity tự dọn khi destroy GameObject nên không cần `-=`" — object C# không chết theo GameObject.
- `+=` lambda ở khắp nơi rồi khẳng định có huỷ đăng ký đầy đủ.
- Dựng event bus tĩnh cho mọi liên kết, kể cả quan hệ một-một.
- Không biết exception trong một listener chặn các listener sau.

**Số / ví dụ nên thuộc**

- Delegate giữ **Method + Target** — `Target` là nguyên nhân rò rỉ.
- Cặp vòng đời chuẩn trong Unity: **`OnEnable` += / `OnDisable` -=**.
- `-=` so khớp theo Target + method ⇒ **lambda không huỷ được**.
- `UnityEvent` chậm hơn C# `event` vài lần; đổi lại nối được trong Inspector.
- Exception trong một listener làm **mọi listener sau nó không chạy**.
