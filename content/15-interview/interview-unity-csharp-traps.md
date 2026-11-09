---
id: interview-unity-csharp-traps
title: Bẫy ở chỗ Unity gặp C#
icon: 🪤
summary: Những chỗ C# trong Unity hành xử khác C# thuần mà người phỏng vấn rất thích hỏi — null giả và toán tử ?., Destroy cuối frame, async/await với object đã huỷ, IL2CPP và AOT, bẫy serialization, static không reset khi tắt domain reload, struct trả về qua property, chuỗi trong API.
status: deep
read: 1123
level: advanced
order: 22
tags: [interview, unity, csharp, il2cpp, async]
related: [interview-unity-tech, csharp-exception-null, csharp-async, unity-csharp-memory, unity-build-platform]
---

Người viết C# thuần mười năm vẫn có thể trượt những câu này, vì đáp án không nằm trong ngôn ngữ mà nằm ở **cách Unity bọc ngôn ngữ**: một object C# đứng trước một object C++ trong engine, một runtime AOT thay cho JIT, một serializer riêng với luật riêng. Người phỏng vấn hỏi các câu này để phân biệt **người dùng Unity lâu năm** với **người biết C# rồi mới học Unity**.

## 1. Null giả — object C# còn, object engine đã mất

Mỗi `UnityEngine.Object` (GameObject, Component, asset) là **hai nửa**: vỏ C# trên managed heap và phần thật trong engine C++. `Destroy` huỷ nửa C++; vỏ C# vẫn còn cho tới khi không ai tham chiếu. Unity **nạp chồng `==`** để vỏ đó so bằng `null`.

| Cách kiểm | Với object đã Destroy | Ghi chú |
|---|---|---|
| `obj == null` | `true` | Dùng toán tử Unity nạp chồng |
| `if (obj)` | `false` | Chuyển kiểu bool của Unity |
| `obj?.Foo()` | **Gọi vào** → `MissingReferenceException` | `?.` bỏ qua toán tử nạp chồng |
| `obj ?? fallback` | Trả **obj** (vỏ chết) | `??` cũng bỏ qua |
| `obj is null` | `false` | So tham chiếu thật |
| Biến kiểu **interface** trỏ tới component đã huỷ | `== null` là `false` | `==` của interface không phải của Unity |

Hệ quả thực tế: không dùng `?.` và `??` với `UnityEngine.Object`; khi giữ component qua interface thì ép về `Object` hoặc kiểm bằng `(obj as Object) == null`. Chi tiết ở [[csharp-exception-null]].

## 2. Destroy không xảy ra ngay

`Destroy(obj)` chỉ **đánh dấu**; object bị huỷ thật ở **cuối frame hiện tại** (sau Update/LateUpdate, trước render). Trong phần còn lại của frame, object vẫn đọc được, vẫn nằm trong `transform.childCount`, vẫn được `GetComponent` tìm thấy. `DestroyImmediate` huỷ ngay nhưng chỉ nên dùng trong Editor script — dùng lúc chạy dễ huỷ nhầm asset và làm vỡ vòng lặp đang duyệt.

Bẫy kinh điển: `foreach (Transform child in parent) Destroy(child.gameObject);` rồi ngay sau đó tạo con mới và đếm `childCount` — số con cũ vẫn còn trong frame này.

## 3. async/await trong Unity

| Điều | Đúng là | Vì sao quan trọng |
|---|---|---|
| `await` tiếp tục ở đâu | **Main thread**, nhờ `SynchronizationContext` của Unity | Code sau `await` được gọi API Unity |
| `Task.Run` | Chạy trên **thread pool** | Không được chạm API Unity trong đó |
| Object bị huỷ trong lúc `await` | Code sau `await` **vẫn chạy** | Phải kiểm `this == null` hoặc dùng token huỷ |
| `destroyCancellationToken` | Token tự huỷ khi MonoBehaviour bị huỷ (từ Unity 2022.2) | Truyền vào mọi `await` dài |
| `async void` | Exception không bắt được từ nơi gọi | Chỉ dùng cho handler sự kiện, bọc try/catch |
| Thoát Play Mode trong Editor | Task đang chạy **không tự dừng** | Task cũ chạy tiếp, chạm object không còn |
| `Awaitable` (Unity 2023.1+/Unity 6) | Kiểu await gọn của Unity, được pool lại | **Không await một instance hai lần** |
| Coroutine | Dừng khi GameObject inactive hoặc bị huỷ | Async thì không — khác biệt hay bị hỏi |

Thư viện **UniTask** phổ biến trong game Nhật: struct-based, không alloc, có `PlayerLoopTiming`, có huỷ theo vòng đời. Xem [[csharp-async]].

## 4. IL2CPP và AOT

Build mobile dùng **IL2CPP**: IL được dịch sang C++ rồi biên dịch trước (AOT). Không có JIT nên:

- **Không sinh code lúc chạy**: `System.Reflection.Emit` không dùng được; thư viện dựa vào nó (một số serializer, DI container) phải có chế độ AOT.
- **Generic với value type** phải được "nhìn thấy" lúc build. Generic chỉ tạo qua reflection có thể thiếu bản biên dịch → lỗi lúc chạy. Cách chữa: gọi mẫu một lần trong code để buộc sinh ra.
- **Managed Stripping** bỏ code "không thấy ai dùng"; code chỉ gọi qua reflection (JSON, tên kiểu dạng chuỗi) bị cắt. Giữ lại bằng `link.xml` hoặc `[Preserve]`.
- **Lỗi chỉ có trên build** — Editor chạy Mono có JIT nên không lộ. Đây là lý do mọi tính năng dùng reflection phải được test trên build IL2CPP thật.

Xem [[unity-build-platform]].

## 5. Serialization — serializer của Unity có luật riêng

| Luật | Bẫy |
|---|---|
| Serialize field `public` hoặc `[SerializeField]`, không serialize property | Đổi field thành property tự động → mất dữ liệu đã lưu; dùng `[field: SerializeField]` |
| Không serialize `Dictionary`, interface, static, `readonly` | Khai `Dictionary` public rồi ngạc nhiên vì Inspector trống |
| Giá trị trong Inspector **đè** giá trị khởi tạo field | Sửa `= 10` trong code mà prefab cũ vẫn giữ `5` |
| Đổi tên field → dữ liệu cũ mất | Dùng `[FormerlySerializedAs("tenCu")]` |
| Class thường được serialize **theo giá trị**, null thành instance rỗng | Không có đa hình; cần `[SerializeReference]` |
| Lồng sâu quá 10 cấp bị cắt | Cấu trúc đệ quy (cây) không serialize được theo cách thường |
| Sửa ScriptableObject trong Play Mode | Trong Editor thay đổi **lưu luôn** vào asset; trên build thì mất khi tắt app |

## 6. Domain reload và static

Bật **Enter Play Mode Options** mà tắt domain reload thì vào Play nhanh hơn hẳn, nhưng **static field không reset** giữa các lần Play: singleton còn instance cũ (đã bị huỷ), static event còn handler của lần trước, bộ đếm tiếp tục tăng. Cách chữa: reset trong hàm có `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]`.

## 7. Struct trả về qua property

`transform.position`, `material.color`, `rigidbody.velocity` trả về **bản sao** struct. Vì vậy `transform.position.x = 5` **lỗi biên dịch** (CS1612): sửa bản sao tạm thì vô nghĩa. Phải lấy ra, sửa, gán lại. Ngoại lệ gây bối rối: `ParticleSystem.main` trả về struct nhưng gán thuộc tính của nó **có tác dụng**, vì struct đó chỉ là lớp bọc gọi thẳng vào engine.

## 8. Chuỗi và chi phí ẩn

| Gọi | Chi phí ẩn | Thay bằng |
|---|---|---|
| `animator.SetTrigger("Attack")` | Băm chuỗi mỗi lần gọi | `static readonly int Attack = Animator.StringToHash("Attack")` |
| `material.SetFloat("_Power", v)` | Tra chuỗi | `Shader.PropertyToID` lưu sẵn |
| `material` (không phải `sharedMaterial`) | Tạo bản sao material, phải tự huỷ | `sharedMaterial` hoặc MaterialPropertyBlock (biết cái giá với SRP Batcher) |
| `GetComponent<T>()` trong `Update` | Tìm mỗi frame | Lưu trong `Awake` |
| `gameObject.tag == "Enemy"` | Tạo chuỗi mới | `CompareTag("Enemy")` |
| `Debug.Log` trong bản phát hành | Tạo chuỗi, ghi log, stack trace | Bọc bằng hàm `[Conditional]` hoặc tắt log |
| Thuộc tính `mesh`, `materials` | Mỗi lần gọi trả bản sao/mảng mới | `sharedMesh`, lưu mảng |

## 🤖 Prompt cho AI

**Dùng AI thế nào để luyện các bẫy Unity × C#**

Những câu này là câu "biết thì trả lời trong một câu, không biết thì không suy ra được". Dùng AI tạo **đoạn code có bẫy** rồi hỏi bạn chỗ sai — đúng dạng người phỏng vấn hay làm. Và vì AI cũng hay mắc chính các bẫy này khi viết code Unity, đây cũng là danh sách để soát code AI viết.

**Phải nêu rõ**
- Phiên bản Unity và scripting backend (Mono/IL2CPP) — đáp án khác theo đó.
- Yêu cầu bẫy phải là **riêng Unity**, không phải lỗi C# chung.
- Bắt AI đưa code trước, giấu đáp án cho tới khi bạn trả lời.
- Yêu cầu AI nói rõ API nào thay đổi theo phiên bản (`FindObjectOfType`, `Awaitable`, `destroyCancellationToken`).

**Mẫu prompt**

```
Tôi phỏng vấn vị trí Unity developer (Unity 6, build IL2CPP cho mobile).
Đưa tôi TỪNG đoạn code MonoBehaviour 5–15 dòng có MỘT bẫy riêng của Unity
(null giả với ?., Destroy cuối frame, await sau khi object bị huỷ,
serialization, static khi tắt domain reload, struct qua property,
reflection bị strip trên IL2CPP...).
- Không nói bẫy là gì. Hỏi: "đoạn này sai ở đâu, khi nào lộ ra?"
- Chờ tôi trả lời rồi chấm và giải thích cơ chế.
Làm 10 đoạn, trộn độ khó.
```

**Bẫy thường gặp:** AI tự viết `obj?.DoSomething()` cho component Unity — chính bẫy null giả — nên đừng tin code mẫu của nó ở chỗ này. Bẫy thứ hai: AI dùng API đã đổi tên (`FindObjectOfType` thay vì `FindFirstObjectByType`/`FindAnyObjectByType` ở bản mới) hoặc dùng `Awaitable` cho phiên bản Unity chưa có. Bẫy thứ ba: AI nói "Unity không hỗ trợ async" — sai từ lâu; cái cần nói là async **không gắn với vòng đời GameObject** như coroutine.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao không nên dùng `?.` với component Unity?**
  → Vì Unity nạp chồng `==` để object đã `Destroy` so bằng null, còn `?.` bỏ qua toán tử nạp chồng và chỉ kiểm tham chiếu C# thật. Vỏ C# của object đã huỷ vẫn còn nên `?.` vẫn gọi vào và ném `MissingReferenceException`. Với `UnityEngine.Object` tôi kiểm bằng `== null` hoặc `if (obj)`.
- `Junior` **`transform.position.x = 5;` có biên dịch được không, vì sao?**
  → Không, lỗi CS1612. `position` là property trả về bản sao struct `Vector3`, sửa field của bản sao tạm là vô nghĩa nên trình biên dịch chặn. Phải lấy ra biến, sửa `x`, rồi gán lại `transform.position = p`.
- `Junior` **Gọi `Destroy(obj)` xong, ngay dòng sau `obj` có còn không?**
  → Còn, vì `Destroy` chỉ đánh dấu và huỷ thật ở cuối frame hiện tại. Trong phần còn lại của frame object vẫn tìm thấy, vẫn được đếm trong con của parent. Muốn bỏ khỏi cây ngay thì tách parent trước khi huỷ, còn `DestroyImmediate` chỉ dùng trong Editor script.
- `Junior` **Vì sao nên dùng `CompareTag` thay vì `tag == "Enemy"`?**
  → Đọc thuộc tính `tag` tạo ra chuỗi mới mỗi lần, gây alloc nếu gọi thường xuyên như trong va chạm. `CompareTag` so sánh bên trong engine không tạo chuỗi. Với code chạy mỗi frame, khác biệt này cộng dồn thành rác GC.
- `Junior` **Đổi tên một field public trong script, dữ liệu trong prefab có mất không?**
  → Mất, vì serializer của Unity khớp dữ liệu theo tên field. Giữ lại bằng cách gắn `[FormerlySerializedAs("tenCu")]` lên field mới, để Unity đọc dữ liệu cũ rồi lưu lại theo tên mới. Sau khi mọi asset đã lưu lại thì có thể bỏ attribute.
- `Mid` **Sửa giá trị khởi tạo field từ 5 thành 10 trong code, vì sao game vẫn dùng 5?**
  → Giá trị đã được serialize trong prefab hoặc scene đè lên giá trị khởi tạo trong code. Giá trị khởi tạo chỉ dùng khi component được thêm mới hoặc bấm Reset. Muốn đổi cho mọi chỗ thì sửa trong prefab gốc, hoặc chuyển giá trị đó vào ScriptableObject cấu hình dùng chung.
- `Mid` **Vì sao `Dictionary` không hiện trong Inspector, anh làm thế nào?**
  → Serializer của Unity không hỗ trợ `Dictionary`. Tôi serialize một `List` các cặp khoá–giá trị rồi dựng `Dictionary` trong `Awake`, hoặc dùng `ISerializationCallbackReceiver` để chuyển đổi hai chiều. Với dữ liệu lớn thì để trong master data thay vì Inspector.
- `Mid` **`[SerializeReference]` khác `[SerializeField]` thế nào?**
  → `[SerializeField]` lưu class thường theo giá trị, không có đa hình và null thành instance rỗng. `[SerializeReference]` lưu theo tham chiếu kèm kiểu thật, nên một field kiểu interface hoặc lớp cha có thể chứa nhiều lớp con khác nhau, giữ được null và tham chiếu dùng chung. Hợp với danh sách hiệu ứng skill có nhiều loại.
- `Mid` **Sửa ScriptableObject trong lúc chơi, có lưu lại không?**
  → Trong Editor là có: thay đổi trong Play Mode ghi thẳng vào asset và còn sau khi dừng — bẫy làm hỏng dữ liệu cân bằng. Trên bản build thì không, giá trị quay về như lúc build khi tắt app. Vì vậy dữ liệu chạy thì copy ra runtime, ScriptableObject chỉ giữ cấu hình.
- `Mid` **Code sau `await` có chạy trên main thread không?**
  → Có, nếu `await` bắt đầu từ main thread, vì Unity cài `SynchronizationContext` đưa phần tiếp theo về main thread. Nhưng code bên trong `Task.Run` chạy trên thread pool và không được chạm API Unity. Đây là lý do async dùng được cho game mà không cần tự chuyển thread.
- `Mid` **Object bị huỷ trong lúc đang `await`, chuyện gì xảy ra?**
  → Code sau `await` vẫn chạy, vì async không gắn với vòng đời GameObject như coroutine, và lúc đó chạm `transform` sẽ ném `MissingReferenceException`. Tôi truyền `destroyCancellationToken` (từ Unity 2022.2) vào các tác vụ dài, hoặc kiểm `this == null` ngay sau `await`.
- `Mid` **Coroutine và async khác nhau thế nào khi GameObject bị tắt?**
  → Coroutine dừng khi GameObject inactive hoặc bị huỷ, và không tự chạy lại khi bật lại. Async thì chạy tiếp bất kể trạng thái GameObject. Chọn coroutine cho luồng gắn chặt với object, async cho tác vụ cần trả kết quả hoặc huỷ có kiểm soát.
- `Mid` **Vì sao `async void` nguy hiểm?**
  → Exception trong `async void` không thể bắt từ nơi gọi, vì không có `Task` nào giữ nó. Chỉ dùng `async void` cho handler sự kiện như nút UI, và bọc toàn bộ thân trong try/catch có log. Còn lại trả về `Task`, `UniTask` hoặc `Awaitable`.
- `Mid` **Thoát Play Mode trong Editor, task async đang chạy có dừng không?**
  → Không, vì task không thuộc vòng đời của Unity — nó có thể chạy tiếp và chạm object không còn tồn tại, gây lỗi khó hiểu trong lần Play sau. Phải huỷ bằng token theo vòng đời, hoặc dùng UniTask/Awaitable vốn gắn với vòng lặp người chơi của Unity.
- `Mid` **UniTask là gì, vì sao game Nhật hay dùng?**
  → Thư viện async cho Unity dựa trên struct nên gần như không alloc, chạy trên vòng lặp người chơi của Unity với thời điểm chọn được, có huỷ theo vòng đời và tiện ích chờ frame, chờ thời gian. Nó thay coroutine mà vẫn trả về giá trị và bắt lỗi được. Nhiều dự án dùng từ trước khi Unity có `Awaitable`.
- `Mid` **`Awaitable` của Unity 6 có bẫy gì?**
  → Instance được Unity pool lại để không alloc, nên không được await cùng một instance hai lần hoặc giữ lại dùng sau. Ngoài ra phải chú ý nó chạy tiếp ở thread nào khi dùng các hàm chuyển sang background. Dùng đúng kiểu "tạo, await một lần, bỏ".
- `Mid` **Vì sao code dùng reflection chạy trong Editor nhưng lỗi trên build mobile?**
  → Editor chạy Mono có JIT, còn build mobile dùng IL2CPP biên dịch trước và bật managed stripping. Kiểu hoặc hàm chỉ được dùng qua reflection (serializer JSON, tạo kiểu từ chuỗi) bị cắt vì trình strip không thấy ai gọi. Giữ lại bằng `link.xml` hoặc `[Preserve]`, và luôn test tính năng đó trên build thật.
- `Mid` **Vì sao không dùng `System.Reflection.Emit` trên iOS?**
  → iOS không cho sinh mã máy lúc chạy, và IL2CPP là AOT nên không có JIT để chạy code sinh động. Thư viện dựa trên Emit (một số serializer nhanh, DI, proxy) phải có chế độ sinh code lúc build hoặc chế độ AOT. Đây là một tiêu chí khi chọn thư viện bên thứ ba.
- `Mid` **`animator.SetTrigger("Attack")` có vấn đề gì?**
  → Mỗi lần gọi Unity phải băm chuỗi thành id. Tôi lưu `static readonly int` từ `Animator.StringToHash` một lần và dùng id đó; tương tự `Shader.PropertyToID` cho thuộc tính material. Ngoài tiết kiệm, nó còn tránh gõ sai tên chuỗi rải rác trong code.
- `Mid` **Gọi `renderer.material` khác `renderer.sharedMaterial` thế nào?**
  → `material` tạo bản sao material riêng cho renderer đó ở lần gọi đầu, tốn bộ nhớ và phải tự `Destroy` khi không dùng nếu không sẽ rò. `sharedMaterial` sửa asset dùng chung — trong Editor là sửa luôn file asset. Muốn khác màu từng object thì dùng bản sao có quản lý hoặc MaterialPropertyBlock, biết rằng cái sau làm vỡ SRP Batcher.
- `Mid` **Vì sao `Debug.Log` nên tắt trong bản phát hành?**
  → Mỗi lần gọi tạo chuỗi, ghi log ra hệ thống và có thể kèm stack trace, tốn CPU và alloc dù không ai đọc. Tôi bọc log trong hàm có `[Conditional("ENABLE_LOG")]` để lời gọi bị xoá khỏi bản build không có define đó, kể cả phần nối chuỗi tham số.
- `Senior` **Tắt domain reload để vào Play nhanh, có rủi ro gì?**
  → Static field không reset giữa các lần Play: singleton giữ instance của lần trước đã bị huỷ, static event còn handler cũ, bộ đếm tăng tiếp. Lỗi chỉ xuất hiện từ lần Play thứ hai nên rất khó hiểu. Tôi reset static trong hàm `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]`.
- `Senior` **Giữ component qua biến kiểu interface, kiểm null thế nào?**
  → `==` trên biến interface là so tham chiếu C# thường, không phải toán tử của Unity, nên component đã huỷ vẫn khác null. Tôi ép về `UnityEngine.Object` rồi so `== null`, hoặc viết hàm tiện ích kiểm cả hai trường hợp. Bẫy này hay gặp khi làm hệ thống tương tác dùng interface `IDamageable`.
- `Senior` **Generic với value type gây lỗi gì trên IL2CPP?**
  → IL2CPP phải sinh code C++ cho từng tổ hợp generic với value type ngay lúc build; tổ hợp chỉ xuất hiện qua reflection hoặc tạo động có thể không được sinh, dẫn tới lỗi lúc chạy. Cách chữa là gọi mẫu tổ hợp đó ở đâu đó trong code để trình biên dịch thấy. Tổ hợp với kiểu tham chiếu thì dùng chung một bản nên ít gặp hơn.
- `Senior` **`ParticleSystem.main` trả về struct, vậy sao gán `main.startSpeed` lại có tác dụng?**
  → Struct module đó không chứa dữ liệu thật mà chỉ là lớp bọc giữ tham chiếu tới hệ hạt, mỗi lần gán thuộc tính gọi thẳng vào engine. Nên lấy ra biến tạm rồi gán vẫn đổi được hệ hạt, khác hẳn `Vector3` của `transform.position`. Câu này kiểm tra bạn hiểu struct là bản sao dữ liệu chứ không phải "không sửa được".
- `Senior` **Thuộc tính `mesh` và `sharedMesh` khác nhau thế nào?**
  → Đọc `mesh` lần đầu tạo bản sao mesh riêng cho object đó, giống `material`, và bạn phải tự huỷ khi xong. `sharedMesh` trỏ thẳng vào asset dùng chung. Đọc `mesh` vô tình trong vòng lặp cho nhiều object là cách nhân đôi bộ nhớ mesh mà không biết.
- `Senior` **Anh phát hiện các bẫy này trong code review thế nào?**
  → Có danh sách kiểm cụ thể: `?.` hoặc `??` với kiểu Unity, `await` không có token huỷ, chuỗi trong API animator/material, `material`/`mesh` thay vì bản dùng chung, reflection không có `[Preserve]`. Phần lặp lại thì đưa vào analyzer chạy trên CI, vì Unity có analyzer bắt được một số lỗi kiểu này. Người review không nên phải nhớ hết.

**Khung trả lời 60 giây** — "Null giả trong Unity là gì, nó gây lỗi ở đâu?"

> Mỗi object Unity có hai nửa: vỏ C# và phần thật trong engine C++. Khi tôi gọi `Destroy`, phần C++ bị huỷ ở cuối frame nhưng vỏ C# vẫn còn, và Unity nạp chồng toán tử `==` để vỏ đó so bằng null.
>
> Vấn đề là chỉ `==` và chuyển kiểu bool hiểu điều này. Toán tử `?.` và `??` bỏ qua phần nạp chồng, nên `enemy?.TakeDamage()` vẫn gọi vào object đã chết và ném `MissingReferenceException`. Biến kiểu interface trỏ tới component cũng không dùng toán tử của Unity.
>
> Vì vậy với `UnityEngine.Object` tôi luôn kiểm bằng `== null` hoặc `if (obj)`, và khi giữ qua interface thì ép về `Object` trước khi kiểm.

**Họ sẽ đào tiếp**

- *"`obj is null` thì sao?"* → So tham chiếu thật nên trả `false` với object đã huỷ — cũng sai như `?.`.
- *"Vì sao Unity không bỏ cơ chế này?"* → Thay đổi sẽ phá rất nhiều code cũ; Unity giữ để tương thích ngược.
- *"Async gắn với vòng đời thế nào cho an toàn?"* → `destroyCancellationToken`, hoặc UniTask/Awaitable có huỷ theo vòng đời.
- *"`link.xml` viết gì?"* → Khai assembly và kiểu cần giữ để trình strip không cắt.
- *"Sao không serialize property được?"* → Serializer làm việc với field; property chỉ là hàm. Dùng `[field: SerializeField]` cho property tự động.
- *"Đổi tên class của ScriptableObject có mất dữ liệu không?"* → Asset tham chiếu script qua GUID của file `.cs`, nên đổi tên class phải đổi tên file theo và giữ nguyên file `.meta`.
- *"Có analyzer nào bắt được những lỗi này?"* → Unity có bộ analyzer Roslyn riêng cho một số bẫy; đội có thể viết thêm quy tắc riêng.

**Cờ đỏ**

- Dùng `?.` với component Unity và không biết vì sao lỗi.
- Nói "Destroy xoá object ngay lập tức".
- "Unity không dùng được async" hoặc ngược lại, không biết code sau `await` vẫn chạy khi object đã huỷ.
- Không biết tại sao code chạy trong Editor mà lỗi trên build IL2CPP.
- Khai báo `Dictionary` public và tưởng Inspector sẽ hiện.
- Sửa ScriptableObject lúc chạy mà không biết nó ghi vào asset trong Editor.
- Gọi `material` trong vòng lặp mà không biết đã tạo bản sao.

**Số / ví dụ nên thuộc**

- Kiểm null Unity: **`== null`** hoặc **`if (obj)`** — không **`?.`**, **`??`**, **`is null`**.
- `Destroy` có hiệu lực **cuối frame**; `DestroyImmediate` chỉ trong **Editor script**.
- `transform.position.x = 5` → lỗi **CS1612**.
- `destroyCancellationToken` có từ **Unity 2022.2**; `Awaitable` từ **Unity 2023.1** (có trong Unity 6).
- Giữ code khỏi strip: **`link.xml`**, **`[Preserve]`**.
- Đổi tên field: **`[FormerlySerializedAs]`**; property tự động: **`[field: SerializeField]`**.
- Reset static khi tắt domain reload: **`RuntimeInitializeLoadType.SubsystemRegistration`**.
- Id chuỗi: **`Animator.StringToHash`**, **`Shader.PropertyToID`**.
