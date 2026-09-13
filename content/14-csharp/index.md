---
id: csharp
title: C# cho lập trình game
icon: 🔷
summary: Nhánh ngôn ngữ — value type và reference type, collection, delegate, generic, async, và chỗ C# trong Unity trả lời khác C# trên server. Viết để dùng được ở hai chỗ: bàn phỏng vấn và file gameplay chạy 60 lần mỗi giây.
status: deep
read: 786
level: basic
order: 64
map: true
mapLabel: C#
tags: [csharp, language, interview, unity, dotnet]
related: [unity, unity-csharp-memory, unity-design-patterns, go-for-unity-dev]
---

Nhánh [[unity]] dạy **engine**: component nào, đặt ở đâu, Inspector khai gì. Nhánh này dạy **ngôn ngữ** chạy bên dưới nó. Hai thứ khác nhau, và vòng phỏng vấn Unity gần như luôn tách làm hai phần đúng theo ranh giới đó: nửa đầu hỏi engine, nửa sau hỏi C# thuần — `struct` khác `class` chỗ nào, `Dictionary` tra cứu bằng cách nào, `event` rò rỉ bộ nhớ kiểu gì.

Phần thứ hai mới là phần trượt nhiều. Lý do rất đời: người làm Unity vài năm viết được game nhưng chưa bao giờ phải nói ra miệng **vì sao** `list[i].hp -= 10` không biên dịch. Biết làm và nói được là hai kỹ năng khác nhau, và phỏng vấn chỉ đo được cái thứ hai.

## Bản đồ nhánh

<figure class="fig">
<svg viewBox="0 0 680 300" role="img" aria-label="Bốn cụm kiến thức C#: ngôn ngữ lõi gồm type system, OOP và generic; dữ liệu gồm collection, LINQ và bộ nhớ; luồng chạy gồm delegate, async và đa luồng; an toàn gồm exception null và C# hiện đại; tất cả dẫn vào bộ đề phỏng vấn">
  <defs>
    <marker id="cs-idx-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <rect x="14" y="26" width="150" height="150" rx="10" class="fig-box"/>
  <rect x="186" y="26" width="150" height="150" rx="10" class="fig-box"/>
  <rect x="358" y="26" width="150" height="150" rx="10" class="fig-box"/>
  <rect x="530" y="26" width="136" height="150" rx="10" class="fig-box"/>
  <text x="89" y="48" text-anchor="middle" class="fig-label" font-size="13" font-weight="600">Ngôn ngữ lõi</text>
  <text x="261" y="48" text-anchor="middle" class="fig-label" font-size="13" font-weight="600">Dữ liệu</text>
  <text x="433" y="48" text-anchor="middle" class="fig-label" font-size="13" font-weight="600">Luồng chạy</text>
  <text x="598" y="48" text-anchor="middle" class="fig-label" font-size="13" font-weight="600">An toàn</text>
  <line x1="24" y1="58" x2="154" y2="58" class="fig-line"/>
  <line x1="196" y1="58" x2="326" y2="58" class="fig-line"/>
  <line x1="368" y1="58" x2="498" y2="58" class="fig-line"/>
  <line x1="540" y1="58" x2="656" y2="58" class="fig-line"/>
  <text x="30" y="80" class="fig-muted" font-size="11">Type system · struct/class</text>
  <text x="30" y="102" class="fig-muted" font-size="11">OOP · interface · SOLID</text>
  <text x="30" y="124" class="fig-muted" font-size="11">Generic · constraint · AOT</text>
  <text x="30" y="152" class="fig-muted" font-size="10">nền của mọi câu hỏi khác</text>
  <text x="202" y="80" class="fig-muted" font-size="11">Collection · độ phức tạp</text>
  <text x="202" y="102" class="fig-muted" font-size="11">LINQ · deferred execution</text>
  <text x="202" y="124" class="fig-muted" font-size="11">Bộ nhớ · boxing · Span</text>
  <text x="202" y="152" class="fig-muted" font-size="10">chỗ fps đi mất</text>
  <text x="374" y="80" class="fig-muted" font-size="11">Delegate · event · rò rỉ</text>
  <text x="374" y="102" class="fig-muted" font-size="11">async/await · Task</text>
  <text x="374" y="124" class="fig-muted" font-size="11">Đa luồng · lock · Job</text>
  <text x="374" y="152" class="fig-muted" font-size="10">chỗ bug khó tái hiện</text>
  <text x="546" y="80" class="fig-muted" font-size="11">Exception · null</text>
  <text x="546" y="102" class="fig-muted" font-size="11">fake null của Unity</text>
  <text x="546" y="124" class="fig-muted" font-size="11">C# 8/9 · record</text>
  <text x="546" y="152" class="fig-muted" font-size="10">chỗ crash trên máy người chơi</text>
  <line x1="89" y1="176" x2="300" y2="238" class="fig-line" marker-end="url(#cs-idx-a)"/>
  <line x1="261" y1="176" x2="320" y2="238" class="fig-line" marker-end="url(#cs-idx-a)"/>
  <line x1="433" y1="176" x2="370" y2="238" class="fig-line" marker-end="url(#cs-idx-a)"/>
  <line x1="598" y1="176" x2="390" y2="238" class="fig-line" marker-end="url(#cs-idx-a)"/>
  <rect x="250" y="240" width="190" height="46" rx="9" class="fig-box"/>
  <text x="345" y="260" text-anchor="middle" class="fig-label" font-size="12" font-weight="600">Bộ đề phỏng vấn</text>
  <text x="345" y="277" text-anchor="middle" class="fig-muted" font-size="10">60 câu + 6 bài live-coding</text>
</svg>
<figcaption>Bốn cụm, mười hai node. Ba cụm đầu là kiến thức; cụm cuối là chỗ nó bị hỏi lại thành câu.</figcaption>
</figure>

| # | Node | Trả lời câu gì |
|---|---|---|
| 1 | [[csharp-type-system]] | `struct` hay `class`, copy hay tham chiếu, boxing xảy ra lúc nào |
| 2 | [[csharp-oop-interface]] | `abstract` hay `interface`, `virtual`/`override`/`new`, khi nào bỏ kế thừa |
| 3 | [[csharp-collections]] | Chọn `List`/`Dictionary`/`HashSet` theo cái gì, và cái giá lúc nó lớn lên |
| 4 | [[csharp-linq]] | LINQ chạy lúc nào, tốn gì, chỗ nào trong game thì cấm dùng |
| 5 | [[csharp-delegate-event]] | `Action`, `event`, và cách một dòng `+=` giữ sống cả scene cũ |
| 6 | [[csharp-generic]] | Constraint, variance, và vì sao generic nổ trên IL2CPP mà không nổ trong Editor |
| 7 | [[csharp-memory]] | Stack/heap, `IDisposable`, `string`, `Span<T>` — mô hình bộ nhớ ở mức ngôn ngữ |
| 8 | [[csharp-async]] | `async/await` thật sự làm gì, `Task` khác Coroutine ra sao, deadlock từ đâu |
| 9 | [[csharp-threading]] | `lock`, `Interlocked`, race condition, và luật một-thread của Unity |
| 10 | [[csharp-exception-null]] | Bắt lỗi ở đâu, `null` của Unity khác `null` của C# thế nào |
| 11 | [[csharp-modern]] | Unity hỗ trợ C# mấy, dùng được `record`/pattern matching tới đâu |
| 12 | [[csharp-interview-kit]] | Bộ đề 60 câu + bài code trên giấy, có đáp án và tiêu chí chấm |

## Ba thứ khiến C# trong Unity không giống C# ở chỗ khác

Đây là phần người học C# từ khoá web hoặc backend luôn vấp, và cũng là phần người phỏng vấn dùng để phân biệt "biết C#" với "biết C# trong game":

| | C# thường (.NET 8 server) | C# trong Unity 6 |
|---|---|---|
| Phiên bản ngôn ngữ | C# 12–13, cập nhật mỗi năm | **C# 9**, đứng yên nhiều năm |
| Runtime | CoreCLR, GC phân thế hệ + nén | Mono/IL2CPP, GC Boehm không nén — xem [[unity-csharp-memory]] |
| Sinh code lúc chạy | Có (`Reflection.Emit`, `dynamic`) | **Không** trên IL2CPP vì là AOT — xem [[csharp-generic]] |
| Đa luồng | Thoải mái, `Parallel.For` | API engine **chỉ chạy trên main thread** — xem [[csharp-threading]] |
| `null` | Một nghĩa duy nhất | `UnityEngine.Object` có null giả — xem [[csharp-exception-null]] |
| Ngân sách | Tính bằng request mỗi giây | **16.6ms mỗi frame**, một lần GC là người chơi thấy |

Câu ngắn để nhớ: **ngôn ngữ thì cũ hơn, runtime thì khắt khe hơn, và mọi thứ bạn cấp phát đều có người nhìn thấy.**

## Đọc theo mục đích

Không ai đọc hết một nhánh ngôn ngữ theo thứ tự. Ba lộ trình thật:

| Bạn đang | Đọc theo thứ tự này | Bỏ qua được |
|---|---|---|
| **Có phỏng vấn trong một tuần** | 1 → 5 → 3 → 7 → 8 → 12 | 6, 9, 11 nếu mô tả công việc không nhắc tới |
| **Viết gameplay code hằng ngày** | 1 → 3 → 5 → 10 → 4 | 6, 9 cho tới khi thật sự cần |
| **Đang tối ưu, game đang khựng** | 7 → 3 → 4 → [[unity-csharp-memory]] | phần còn lại |

Bốn node **1, 3, 5, 7** là lõi: gần như mọi câu hỏi C# trong phỏng vấn game đều quy về một trong bốn cái đó.

## Nguyên tắc của nhánh này

- **Mọi khẳng định phải kèm lý do cơ chế.** "Dùng `struct` cho nhanh" là câu học thuộc; "`struct` copy theo giá trị nên không tạo rác cho GC, nhưng copy 40 byte × 500 lần mỗi frame thì đắt hơn một tham chiếu 8 byte" mới là câu trả lời.
- **Code trong node phải biên dịch được.** Không giả mã. Chỗ nào Unity khác .NET thì nói rõ phiên bản.
- **Tối ưu phải có số.** Nhánh này nói `List` với `Dictionary` khác nhau bao nhiêu, không nói "cái kia nhanh hơn".
- **Không lặp lại nhánh Unity.** GC và alloc trong Unity đã có ở [[unity-csharp-memory]]; ở đây là mô hình ngôn ngữ. Pattern (Singleton, Object Pool, Observer) đã có ở [[unity-design-patterns]]; ở đây là cơ chế C# làm cho chúng chạy được.

## 🤖 Prompt cho AI

**Dùng AI thế nào khi học và viết C#**

Ba chế độ, và chọn nhầm chế độ là lý do phổ biến nhất khiến AI trả về code trông đúng mà chạy sai trong Unity:

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| **Giải thích cơ chế** | Bạn đã biết cú pháp, muốn hiểu vì sao | "Giải thích ở mức IL/runtime chuyện gì xảy ra khi…" |
| **Viết lại code** | Đã có code chạy, cần sạch hoặc nhanh hơn | "Đây là code hiện tại kèm số đo. Viết lại, giữ nguyên hành vi…" |
| **Luyện phỏng vấn** | Chuẩn bị đi phỏng vấn | "Hỏi tôi 5 câu về X ở mức mid, hỏi từng câu một, chấm câu trả lời của tôi" |

Chế độ thứ ba bị bỏ quên nhưng hiệu quả nhất: bắt AI **hỏi từng câu một và chờ bạn trả lời**, thay vì đưa luôn danh sách hỏi–đáp để bạn đọc. Đọc đáp án tạo cảm giác đã thuộc; nói ra miệng mới lộ ra chỗ hổng.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Chạy ở đâu**: Unity (bản nào, Mono hay IL2CPP) hay .NET thường. AI mặc định trả lời cho .NET mới nhất và sẽ dùng cú pháp C# 11–12 không biên dịch được trong Unity.
- **Code này chạy bao nhiêu lần**: một lần lúc load, hay 500 lần mỗi frame. Quyết định toàn bộ lời khuyên về cấp phát.
- **Đang hỏi để hiểu hay để sửa code thật.** Hai câu trả lời khác nhau: một bên cần cơ chế, một bên cần diff nhỏ nhất.
- **Mức phỏng vấn nhắm tới** nếu đang luyện: junior/mid/senior đổi hẳn độ sâu của câu hỏi.

**Mẫu prompt**

```
Bối cảnh: Unity 6 (C# 9), IL2CPP, Android. Code chạy mỗi frame với ~200 đối tượng.

Việc: giải thích chuyện gì xảy ra ở mức runtime với đoạn dưới đây, rồi viết lại
cho không cấp phát.

<dán code>

Ràng buộc:
- KHÔNG dùng cú pháp C# 10 trở lên (file-scoped namespace, global using, required)
- KHÔNG thêm package ngoài
- Với mỗi thay đổi, nói rõ nó bỏ được khoản cấp phát nào VÀ vì sao
- Cuối cùng liệt kê chỗ bạn KHÔNG chắc thay vì đoán
```

**Bẫy thường gặp:** AI trả về C# 10–12 (file-scoped namespace, `required`, raw string literal, list pattern) vì nó mặc định .NET mới nhất — Unity 6 dừng ở **C# 9** nên code đó đỏ lòm trong IDE. Bẫy thứ hai: nó khẳng định một đoạn "không cấp phát" mà không nói vì sao; hỏi lại lý do là cách rẻ nhất để phát hiện kết luận sai. Bẫy thứ ba: nó gợi ý `Parallel.For` hoặc `Task.Run` rồi trong đó gọi `transform.position` — đúng trên .NET, ném exception trong Unity.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Anh dùng C# phiên bản nào, và biết Unity hỗ trợ tới đâu không?**
  → Unity 6 và 2022 LTS dừng ở **C# 9**: dùng được record, pattern matching, switch expression, target-typed `new`; không dùng được file-scoped namespace, `global using`, `required` — chúng là C# 10 trở lên. Biết ranh giới này quan trọng vì code chép từ mạng hay từ AI thường là C# 11–12 và sẽ không biên dịch.
- `Junior` **C# trong Unity khác C# backend chỗ nào?**
  → Ba chỗ: phiên bản ngôn ngữ cũ hơn (C# 9), GC là Boehm không nén nên heap chỉ lớn lên, và API engine chỉ gọi được từ main thread. Hệ quả thực tế là thứ trên server viết thoải mái — LINQ trong vòng lặp, `Task.Run` cho mọi việc nặng — thì trong game phải cân nhắc từng chỗ.
- `Mid` **Bốn chủ đề C# nào anh nghĩ là quan trọng nhất cho một gameplay programmer?**
  → Value type với reference type, vì nó quyết định copy hay tham chiếu và có sinh rác không. Collection, vì chọn sai cấu trúc là chỗ duy nhất một dòng code làm chậm cả game. Delegate/event, vì đó là cách các hệ thống nói chuyện với nhau và cũng là nguồn rò rỉ phổ biến nhất. Và mô hình bộ nhớ, vì ngân sách của game là 16.6ms mỗi frame.
- `Mid` **Anh học một tính năng ngôn ngữ mới thế nào trước khi đưa vào dự án?**
  → Viết một file nhỏ thử nó, nhìn Profiler xem có cấp phát không, rồi mới đưa vào. Với Unity còn một bước nữa: build thử một bản IL2CPP, vì nhiều thứ chạy trong Editor nhưng nổ trên AOT — generic virtual method trên value type là ví dụ kinh điển.
- `Senior` **Khi nào anh chấp nhận viết code C# "xấu" trong game?**
  → Khi nó nằm trong vòng lặp nóng và có số đo chứng minh. Ví dụ tôi sẽ bỏ LINQ, bỏ `foreach` trên interface, lặp bằng chỉ số trên mảng, gom dữ liệu vào struct cho vừa cache — code xấu hơn nhưng 0 B mỗi frame. Ngoài vòng lặp nóng thì ngược lại: ưu tiên đọc được, vì phần lớn code trong game chạy vài lần chứ không phải vài nghìn lần.

**Khung trả lời 60 giây** — "C# trong game khác C# thường ở chỗ nào?"

> Ngôn ngữ thì giống, ràng buộc thì khác hẳn. Ba chỗ tôi luôn để ý. Thứ nhất là **phiên bản**: Unity 6 dừng ở C# 9, nên nửa số mẹo trên mạng không biên dịch được. Thứ hai là **GC**: Unity dùng Boehm, không nén và không phân thế hệ, nên heap chỉ lớn lên chứ không co lại, và một lần thu gom giữa trận là người chơi nhìn thấy.
>
> Thứ ba, và quan trọng nhất, là **ngân sách 16.6ms mỗi frame**. Trên server tôi tối ưu theo request mỗi giây và nhìn trung bình là đủ; trong game thì cái giết mình là phần đuôi — một frame 40ms giữa lúc bắn nhau đáng sợ hơn trung bình 8ms.
>
> Nên thói quen của tôi là: ngoài vòng lặp nóng thì viết cho dễ đọc, trong vòng lặp nóng thì đo trước rồi mới viết, và mục tiêu là 0 byte cấp phát mỗi frame khi chơi bình thường.

**Họ sẽ đào tiếp**

- *"Unity 6 dùng C# mấy?"* → C# 9, trên .NET Standard 2.1. Record và pattern matching dùng được; file-scoped namespace và `required` thì không, vì chúng là C# 10 trở lên.
- *"Vì sao GC của Unity đau hơn?"* → Boehm: non-generational, non-compacting. Heap không trả lại hệ điều hành và thời gian thu gom tỉ lệ với số object đang sống — chi tiết ở [[unity-csharp-memory]].
- *"Cái gì hay cấp phát mà nhìn code không ra?"* → Closure trong lambda, boxing khi struct bị ép sang interface, LINQ trong `Update`, và nội suy chuỗi với số — nó đóng hộp giá trị vì Unity còn ở .NET Standard 2.1.
- *"Anh đo bằng gì?"* → Cột GC Alloc trong Profiler Hierarchy, hoặc `ProfilerRecorder` để hiện overlay ngay trong Play Mode. Luôn đo trên bản build Release ở máy yếu nhất, không đo trong Editor.

**Cờ đỏ**

- Trả lời câu C# bằng câu Unity: hỏi `struct` với `class` mà kể về `ScriptableObject`.
- Nói "dùng `struct` cho nhanh" mà không nói được copy tốn gì và boxing xảy ra ở đâu.
- Khẳng định chắc nịch về một tính năng C# 11 mà không biết Unity không hỗ trợ.
- Không phân biệt được "không cấp phát" và "cấp phát ít" — trong vòng lặp mỗi frame, hai thứ đó khác nhau về bản chất.

**Số / ví dụ nên thuộc**

- Unity 6 và 2022 LTS: **C# 9**, .NET Standard 2.1. C# 10 trở lên không biên dịch.
- Ngân sách một frame: **16.6ms** ở 60fps, **33.3ms** ở 30fps.
- Mục tiêu cấp phát khi chơi bình thường: **0 B/frame**.
- Bốn node lõi của nhánh: type system · collection · delegate/event · bộ nhớ.
