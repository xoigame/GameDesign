---
title: Go cho lập trình viên Unity
icon: 🧑‍💻
summary: Học Go khi đã biết C# — cái gì ánh xạ thẳng, bốn thói quen phải bỏ, bảy thứ vấp ngay tuần đầu, và lộ trình hai tuần có bài kiểm tra.
status: deep
read: 583
level: intermediate
order: 5
tags: [backend, go, learning, tooling]
related: [game-server-go, go-gamedev-tools, architecture-patterns]
---

Người đã viết C# vài năm học Go **nhanh hơn mình tưởng về cú pháp và chậm hơn mình tưởng về thói quen**: hai ngày là viết chạy được, hai tuần mới hết viết C# bằng từ vựng Go. Node này nói đúng phần chênh lệch đó — không dạy lại vòng lặp và biến.

Đừng học Go bằng cách đọc hết spec. Học bằng cách **viết lại một thứ bạn đã có trong game**: một hàm tính sát thương, một validator dữ liệu, một endpoint leaderboard. Bạn đã biết kết quả đúng trông thế nào, nên sai là thấy ngay.

## Ánh xạ từ C# sang Go

| C# / Unity | Go | Khác ở chỗ nào |
|---|---|---|
| `class` + kế thừa | `struct` + embedding | Không có kế thừa. Tái dùng bằng nhúng struct hoặc bằng interface |
| `interface` khai báo `: IFoo` | interface **ngầm** | Kiểu nào có đủ method là tự thoả interface. Không khai báo, không sửa file gốc |
| `try/catch/throw` | `return err` | Lỗi là **giá trị trả về**, không phải luồng điều khiển |
| `null` | zero value | Biến luôn có giá trị dùng được: `""`, `0`, `nil` map/slice đọc được |
| `async/await`, `Task` | `go f()` + `chan` | Không màu hàm, không `ConfigureAwait`. Đổi lại: bạn phải tự dọn goroutine |
| `CancellationToken` | `context.Context` | Truyền qua **tham số đầu tiên**, không cất trong struct |
| `List<T>`, `Dictionary<K,V>` | `[]T`, `map[K]V` | Nằm trong ngôn ngữ, không phải thư viện. Xem bẫy bên dưới |
| LINQ | vòng `for` (và `slices`, `maps` từ 1.21) | Cố ý không có LINQ. Code dài hơn, đọc thẳng hơn |
| `namespace` | `package` (một thư mục = một package) | Tên package là danh từ ngắn: `room`, `store` — không `utils` |
| `public`/`private` | chữ **hoa**/thường đầu tên | `Player` xuất ra ngoài package, `player` thì không |
| `partial`, attribute, reflection | `go:generate`, struct tag | Sinh code lúc build thay vì phản chiếu lúc chạy |
| NuGet | `go mod` | Không có global install. Phiên bản ghi trong `go.mod`, dựng lại được y hệt |

## Bốn thói quen C# phải bỏ

**1. Cây kế thừa.** Không có `abstract class BaseEnemy`. Cái thay thế đúng là thứ bạn đã nên dùng trong Unity: composition — xem [[architecture-patterns]]. Interface trong Go nên **nhỏ** (một tới ba method) và **do bên dùng định nghĩa**, không phải bên cung cấp.

**2. Exception làm luồng điều khiển.** `if err != nil` lặp lại nhiều thật, nhưng nó ép bạn quyết định *tại chỗ* mỗi lỗi xử lý thế nào. `panic` chỉ dành cho lỗi lập trình (index vượt mảng, nil pointer), không dùng cho "không đủ vàng".

**3. `async` lan khắp nơi.** Trong Go mọi hàm đều "đồng bộ"; muốn chạy song song thì `go f()`. Cái giá đổi lại: **không ai tự dọn goroutine cho bạn**. Mỗi `go` phải trả lời được câu "nó thoát bằng đường nào" — thường là `ctx.Done()`.

**4. Nghĩ theo `null`.** Go không có `null` cho kiểu giá trị. `var p Player` là một Player dùng được ngay. Nhưng `var m map[string]int` thì **đọc được, ghi vào là panic** — đó là bẫy số 3 bên dưới.

## Bảy thứ vấp ngay tuần đầu

```go
// 1. Slice chia sẻ mảng nền — append có thể GHI ĐÈ dữ liệu của slice khác.
all := []int{1, 2, 3, 4}
head := all[:2]
head = append(head, 99)        // all[2] vừa bị đổi thành 99, không ai báo gì
safe := all[:2:2]              // full slice expression: append buộc phải cấp mảng mới
safe = append(safe, 99)        // all giữ nguyên

// 2. Thứ tự duyệt map là NGẪU NHIÊN — cố ý, mỗi lần chạy một khác.
for id := range players { }    // đừng dùng cho thứ cần tái lập: replay, seed, checksum
keys := slices.Sorted(maps.Keys(players))   // Go 1.23; trước đó tự sort

// 3. Map nil: đọc được, ghi thì panic.
var scores map[string]int
_ = scores["a"]                // 0, không sao
scores["a"] = 1                // panic: assignment to entry in nil map
scores = make(map[string]int)  // phải khởi tạo

// 4. Value receiver sửa BẢN SAO.
func (p Player) AddGold(n int)  { p.Gold += n }   // không có tác dụng gì
func (p *Player) AddGold(n int) { p.Gold += n }   // đúng

// 5. Interface chứa con trỏ nil KHÁC nil.
var e *MyError = nil
var err error = e
fmt.Println(err == nil)        // false — nguồn của những bug "err không nil mà rỗng"

// 6. defer chạy khi HÀM kết thúc, không phải cuối mỗi vòng lặp.
for _, f := range files {
    fh, _ := os.Open(f)
    defer fh.Close()           // 10.000 file mở cùng lúc rồi mới đóng
}                              // sửa: tách thân vòng lặp thành một hàm riêng

// 7. Biến vòng lặp bắt vào goroutine — Go 1.22 đã sửa, nhưng go.mod quyết định.
for _, p := range players {
    go handle(p)               // đúng nếu go.mod ghi go 1.22+; sai nếu còn 1.21
}
```

Bảy cái này chiếm gần hết số bug của tuần đầu tiên, và **không cái nào bị compiler bắt**. `go vet` bắt được một phần, `go test -race` bắt phần đồng thời.

## `if err != nil` để làm gì

Không phải nghi lễ. Ba việc thật:

```go
// Bọc lỗi kèm ngữ cảnh — %w giữ lại lỗi gốc để kiểm tra được ở tầng trên.
if err := store.BuyItem(ctx, uid, item, reqID, price); err != nil {
    return fmt.Errorf("mua %s cho %s: %w", item, uid, err)
}

// Ở tầng trên, phân loại bằng errors.Is / errors.As chứ không so chuỗi.
switch {
case errors.Is(err, ErrNotEnoughGold):
    http.Error(w, "không đủ vàng", http.StatusPaymentRequired)   // lỗi của người chơi
case errors.Is(err, context.DeadlineExceeded):
    http.Error(w, "thử lại", http.StatusServiceUnavailable)      // lỗi tạm thời
default:
    slog.Error("buy thất bại", "err", err, "uid", uid)           // lỗi của mình: log đủ để điều tra
    http.Error(w, "lỗi hệ thống", http.StatusInternalServerError)
}
```

Ranh giới cần thuộc: **lỗi của người chơi** (trả 4xx, không log ầm ĩ), **lỗi tạm thời** (trả 5xx, client retry được), **bug của mình** (log kèm đủ ngữ cảnh, cảnh báo). Trộn ba loại này là lý do bảng log đầy mà vẫn không tìm được sự cố.

## Bộ công cụ phải thuộc

| Lệnh | Làm gì | Chạy khi nào |
|---|---|---|
| `go mod tidy` | Dọn và khoá phụ thuộc | Sau mỗi lần thêm/bỏ import |
| `gofmt` / `goimports` | Format — không có tranh cãi style trong Go | Tự động lúc lưu file |
| `go vet ./...` | Bắt lỗi ngớ ngẩn: `printf` sai kiểu, copy struct có mutex | Mỗi lần commit |
| `staticcheck ./...` | Linter thật: code chết, so sánh vô nghĩa, API lỗi thời | CI |
| `go test -race ./...` | **Bắt data race** — thứ `go build` không bao giờ thấy | CI, bắt buộc |
| `go test -bench . -benchmem` | Đo tốc độ **và số lần cấp phát** mỗi thao tác | Khi tối ưu vòng lặp nóng |
| `go tool pprof` | Hồ sơ CPU / heap / goroutine của process đang chạy | Khi server chậm hoặc phình RAM |
| `dlv debug` | Debugger có breakpoint | Khi `slog` không đủ |

Hai thứ nên bật từ ngày đầu: format lúc lưu, và `-race` trong CI. Cả hai gần như miễn phí và xoá sạch một nhóm bug.

## Bố cục project

```
server/
├── cmd/                     ← mỗi thư mục con là MỘT binary
│   ├── api/main.go
│   ├── roomd/main.go
│   └── validate/main.go     ← tool, xem [[go-gamedev-tools]]
├── internal/                ← module khác KHÔNG import được (compiler chặn)
│   ├── game/                ← logic thuần: không net, không db, test trong mili giây
│   ├── store/               ← pgx, redis
│   ├── httpapi/             ← handler, middleware
│   └── room/                ← vòng lặp phòng
├── migrations/
├── go.mod
└── Makefile
```

`internal/game/` **không import `net/http` và không import `pgx`** — đây đúng là ranh giới `Assets/Scripts/Core/` không `using UnityEngine` của [[architecture-patterns]], áp sang phía server. Nó cho bạn mô phỏng 10.000 trận không cần database, và cho AI agent tự kiểm chứng thay đổi của nó.

## Lộ trình hai tuần

<figure class="fig">
<svg viewBox="0 0 660 210" role="img" aria-label="Lộ trình học Go năm chặng: cú pháp, đồng thời, HTTP và database, viết một service thật, rồi đọc code người khác">
  <defs>
    <marker id="gfu-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="8"   y="40" width="118" height="56" rx="9" class="fig-box"/>
    <rect x="142" y="40" width="118" height="56" rx="9" class="fig-box"/>
    <rect x="276" y="40" width="118" height="56" rx="9" class="fig-box"/>
    <rect x="410" y="40" width="118" height="56" rx="9" class="fig-box"/>
    <rect x="544" y="40" width="108" height="56" rx="9" class="fig-box"/>
  </g>
  <text x="67"  y="64"  text-anchor="middle" class="fig-label" font-size="12">1. Cú pháp</text>
  <text x="67"  y="82"  text-anchor="middle" class="fig-muted" font-size="11">1–2 ngày</text>
  <text x="201" y="64"  text-anchor="middle" class="fig-label" font-size="12">2. Đồng thời</text>
  <text x="201" y="82"  text-anchor="middle" class="fig-muted" font-size="11">1–2 ngày</text>
  <text x="335" y="64"  text-anchor="middle" class="fig-label" font-size="12">3. HTTP + DB</text>
  <text x="335" y="82"  text-anchor="middle" class="fig-muted" font-size="11">2–3 ngày</text>
  <text x="469" y="64"  text-anchor="middle" class="fig-label" font-size="12">4. Viết thật</text>
  <text x="469" y="82"  text-anchor="middle" class="fig-muted" font-size="11">5–7 ngày</text>
  <text x="598" y="64"  text-anchor="middle" class="fig-label" font-size="12">5. Đọc code</text>
  <text x="598" y="82"  text-anchor="middle" class="fig-muted" font-size="11">liên tục</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#gfu-a)" fill="none">
    <path d="M128 68 H138"/>
    <path d="M262 68 H272"/>
    <path d="M396 68 H406"/>
    <path d="M530 68 H540"/>
  </g>
  <text x="67"  y="122" text-anchor="middle" class="fig-muted" font-size="10">viết lại 3 hàm C#</text>
  <text x="201" y="122" text-anchor="middle" class="fig-muted" font-size="10">worker pool + ctx</text>
  <text x="335" y="122" text-anchor="middle" class="fig-muted" font-size="10">3 endpoint có test</text>
  <text x="469" y="122" text-anchor="middle" class="fig-muted" font-size="10">leaderboard thật</text>
  <text x="598" y="122" text-anchor="middle" class="fig-muted" font-size="10">net/http, nakama</text>
  <text x="334" y="168" text-anchor="middle" class="fig-label" font-size="12">Mỗi chặng có một bài kiểm tra: chưa qua thì đừng sang chặng sau</text>
  <text x="334" y="188" text-anchor="middle" class="fig-muted" font-size="11">Chặng 4 là chặng duy nhất tạo ra thứ dùng được — đừng cắt nó để học thêm lý thuyết</text>
</svg>
<figcaption>Hai tuần là mốc thực tế cho người đã viết C# vài năm, với 2–3 giờ mỗi ngày.</figcaption>
</figure>

| Chặng | Học gì | Bài kiểm tra — xong khi nào |
|---|---|---|
| 1. Cú pháp | *A Tour of Go* hết phần Methods & Interfaces. Viết lại 3 hàm C# bạn đang có sang Go | Viết được struct, method, interface mà không phải tra cú pháp |
| 2. Đồng thời | goroutine, `chan`, `select`, `context`, `sync.WaitGroup`, `sync.Mutex` | Giải thích được vì sao channel không buffer treo, và `ctx` huỷ goroutine bằng đường nào |
| 3. HTTP + DB | `net/http`, `encoding/json`, `pgx`, `httptest` | 3 endpoint có test, `go test -race` xanh, `curl` gọi được |
| 4. Viết thật | Một service nhỏ **thật** của game bạn: leaderboard hoặc điểm danh hàng ngày | Deploy lên VPS và client Unity gọi được — xem [[go-deploy-ops]] |
| 5. Đọc code | Đọc `net/http`, rồi một backend game mã nguồn mở (Nakama, Open Match) | Nhận ra idiom lặp lại và bắt đầu thấy code mình viết "chưa Go" |

Ba thứ **đừng** học ở hai tuần đầu vì chưa dùng tới: generics nâng cao, reflection, và framework web (gin, echo, fiber). `net/http` trong stdlib đủ cho cả một game đã phát hành.

## Bẫy thường gặp

| Bẫy | Hậu quả |
|---|---|
| Viết Java bằng Go: getter/setter cho mọi field, interface một implementation, DI container | Code dài gấp đôi, không ai trong cộng đồng Go đọc quen |
| Package tên `utils`, `common`, `helpers` | Thành thùng rác, rồi thành vòng import lẫn nhau |
| Nhét `context.Context` vào struct | Không huỷ được đúng chỗ; context phải là tham số đầu tiên của hàm |
| Dùng `interface{}` / `any` thay generics | Mất kiểm tra kiểu, và chậm hơn vì boxing |
| Bỏ qua lỗi bằng `_` cho nhanh | Lỗi biến mất im lặng — đúng loại bug đắt nhất ở server |
| Copy code từ blog cũ: `ioutil.ReadFile`, `interface{}`, `golang.org/x/net/context` | API đã lỗi thời từ Go 1.16–1.18 |
| Học hết lý thuyết rồi mới viết | Ba tuần sau vẫn chưa có gì chạy được |

## 🤖 Prompt cho AI

**Dùng AI thế nào khi đang HỌC Go**

Đây là tình huống ngược với mọi node khác trong kho: mục tiêu không phải lấy code chạy được, mà là **bạn hiểu được**. Nhờ AI viết hộ lúc này là tự lấy mất phần học. Ba chế độ dùng đúng:

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| **Dịch + giải thích** | Bạn đã có code C# và biết nó đúng | "Viết lại đoạn C# này bằng Go idiomatic, rồi chỉ ra 3 chỗ tôi viết theo thói quen C#" |
| **Soát idiom** | Bạn vừa tự viết xong | "Đây là code Go của tôi. Chỉ nhận xét về *idiom*: chỗ nào người Go sẽ viết khác, và vì sao. ĐỪNG viết lại hộ" |
| **Giải thích lỗi** | Compiler hoặc `-race` kêu | "Giải thích lỗi này theo mô hình bộ nhớ của Go, và cho một ví dụ nhỏ nhất tái hiện được" |

Quy tắc dùng được: **AI giải thích, bạn gõ.** Nếu bạn dán code nó viết vào project mà không gõ lại được từ đầu, chặng đó coi như chưa qua.

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Nền của bạn:** "tôi viết C#/Unity 5 năm, chưa từng viết Go" — nếu không nó sẽ giải thích lại vòng lặp và biến.
- **Phiên bản Go** (1.22+) và **chỉ dùng stdlib**. Không nói thì nó kéo `gin`, `gorm`, `logrus` vào bài học.
- **Bạn đang ở chặng nào** trong lộ trình trên — chặng 1 mà nó dạy generics là lãng phí.
- **Muốn giải thích hay muốn code.** Nói thẳng "ĐỪNG viết code, chỉ giải thích" khi đang học.

**Mẫu prompt**

```
Tôi viết C#/Unity 5 năm, mới học Go, đang ở chặng 2 (đồng thời). Go 1.22, chỉ stdlib.

Đây là code Go tôi tự viết cho một worker pool xử lý kết quả trận:
<dán code>

Yêu cầu — theo đúng thứ tự này:
1. Nó có data race hay goroutine rò không? Chỉ ra DÒNG cụ thể, đừng nói chung chung.
2. Ba chỗ tôi đang viết C# bằng từ vựng Go. Với mỗi chỗ: cách viết Go và VÌ SAO
   người Go làm vậy (lý do kỹ thuật, không phải "quy ước").
3. Một bài tập nhỏ để tôi tự sửa.

ĐỪNG viết lại toàn bộ code hộ tôi. ĐỪNG dùng thư viện ngoài stdlib.
```

**Bẫy thường gặp:** AI sinh Go trông như Java/C# — `type PlayerService interface` với đúng một implementation, getter/setter cho mọi field, DI container, `errors.New` không bọc ngữ cảnh — và code đó **biên dịch được, chạy đúng**, nên bạn không có tín hiệu nào để biết mình đang học sai. Hai cái nữa: nó hay dùng API đã lỗi thời (`ioutil`, `interface{}` thay generics) vì blog cũ chiếm phần lớn dữ liệu huấn luyện, và nó khẳng định "đã kiểm tra race" mà không chạy `-race` — trong khi race chỉ hiện ra khi chạy thật.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Go không có kế thừa thì tái dùng code kiểu gì?**
  → Bằng embedding struct và bằng interface. Nhúng một struct vào struct khác để dùng lại field và method; còn hành vi chung thì tách thành interface. Kết quả là quan hệ "có một" thay vì "là một", và nó tránh được cây kế thừa sâu — thứ trong Unity hay biến thành `MonoBehaviour` gốc ôm mọi thứ.
- `Junior` **Interface trong Go khác C# chỗ nào?**
  → Nó **ngầm**: kiểu nào có đủ method là tự thoả interface, không khai báo `: IFoo` và không cần sửa file gốc. Nhờ vậy bạn định nghĩa được interface ở phía **người dùng** thay vì phía người cung cấp — tức là mỗi package khai đúng thứ nó cần, thay vì nhận một interface to do người khác thiết kế.
- `Mid` **Bốn thói quen C# nào phải bỏ khi sang Go?**
  → Dùng exception làm luồng điều khiển — trong Go lỗi là giá trị trả về và phải xử lý ngay tại chỗ. Dựng interface cho mọi thứ khi chỉ có một implementation. Cất `CancellationToken` trong struct — `context.Context` truyền qua tham số đầu tiên. Và viết getter/setter cho mọi field, thứ Go không cần vì đã có quy ước chữ hoa chữ thường.
- `Mid` **`if err != nil` lặp đi lặp lại để làm gì?**
  → Để mọi nhánh hỏng đều hiện ra trong code thay vì ẩn sau một `catch` ở đâu đó xa. Đổi lại là dài dòng, nhưng khi đọc một hàm bạn thấy ngay nó hỏng được ở những đâu. Cái quan trọng là **bọc ngữ cảnh** khi trả lỗi lên trên, chứ không phải trả lại nguyên lỗi trần — nếu không thì log chỉ có một dòng vô nghĩa lặp lại khắp nơi.
- `Senior` **Lệnh nào trong bộ công cụ Go là bắt buộc trong CI?**
  → `go vet` cho lỗi ngớ ngẩn, `staticcheck` cho code chết và API lỗi thời, và quan trọng nhất là **`go test -race`** — vì `go build` không bao giờ thấy data race, và race trong server phòng chỉ hiện ra khi đông người. Cộng thêm `go test -bench -benchmem` khi tối ưu, vì nó đo cả **số lần cấp phát**, không chỉ thời gian.
- `Senior` **Code Go do AI sinh thường sai ở đâu mà vẫn chạy đúng?**
  → Nó viết Go trông như Java hoặc C#: interface cho mọi thứ với đúng một implementation, getter/setter, DI container, `errors.New` không bọc ngữ cảnh. Code đó **biên dịch được và chạy đúng**, nên bạn không có tín hiệu nào để biết mình đang học sai — đó mới là phần nguy hiểm.

**Khung trả lời 60 giây** — "Anh học Go từ nền C#, cái gì khó nhất?"

> Cú pháp thì một tuần. Cái mất thời gian là **mô hình đồng thời**. Trong C# tôi quen chia sẻ state rồi bảo vệ bằng lock; trong Go cách đúng là để **một goroutine sở hữu state** và mọi thứ khác đi vào qua channel. Bỏ được lock thì cũng bỏ được cả lớp lỗi deadlock và race.
>
> Thứ hai là xử lý lỗi. `try/catch` cho phép đẩy lỗi lên chỗ khác lo; Go bắt tôi quyết định ngay tại chỗ, và bọc ngữ cảnh khi trả lên trên. Dài dòng hơn, nhưng đọc một hàm là thấy hết nhánh hỏng của nó.
>
> Thứ ba là bỏ thói quen dựng interface cho mọi thứ. Trong Go interface là **ngầm** và nên khai ở phía người dùng — nên tôi chỉ tạo nó khi thật sự có hai implementation, không tạo trước cho "sau này".

**Họ sẽ đào tiếp**

- *"Zero value có gì hay?"* → Biến luôn có giá trị dùng được ngay: chuỗi rỗng, số 0, map `nil` vẫn đọc được. Nó bỏ được phần lớn kiểm tra `null` mà C# phải làm. Cái bẫy là map `nil` đọc được nhưng **ghi vào thì panic** — đó là một trong những thứ vấp ngay tuần đầu.
- *"`context.Context` dùng thế nào cho đúng?"* → Truyền qua tham số đầu tiên của hàm, không cất trong struct. Nó mang cả hạn chót lẫn tín hiệu huỷ, nên mọi goroutine đều có đường thoát — thiếu nó là goroutine chỉ tăng chứ không bao giờ giảm.
- *"Vì sao Go cố ý không có LINQ?"* → Đánh đổi có chủ ý: code dài hơn nhưng đọc thẳng, không có tầng trừu tượng che mất chi phí thực. Từ Go 1.21 có `slices` và `maps` cho những thao tác phổ biến nhất, nhưng vòng `for` vẫn là cách viết bình thường chứ không phải dấu hiệu người mới.
- *"Đặt tên package thế nào?"* → Một thư mục là một package, tên là danh từ ngắn như `room` hay `store`. Tránh `utils` — nó luôn phình thành chỗ chứa mọi thứ không thuộc về đâu, và trong Go điều đó tệ hơn vì tên package là một phần của tên hàm khi gọi.
- *"Học bao lâu thì làm việc được?"* → Với người đã biết C#, khoảng hai tuần là viết được service nhỏ, nhưng hai tuần đó phải có **bài kiểm tra thật** — viết một API có database và một test chạy với `-race` — chứ không phải đọc tài liệu.

**Cờ đỏ**

- Viết Go như viết Java: interface cho mọi thứ, getter/setter, DI container.
- Dùng `panic`/`recover` thay cho trả lỗi.
- Cất `context.Context` trong struct.
- Bỏ qua `err` bằng `_` cho "gọn".
- Khẳng định không có race mà chưa bao giờ chạy `-race`.
- Dùng `interface{}` thay generics vì đọc được blog cũ.

**Số / ví dụ nên thuộc**

- `go test -race` là bắt buộc trong CI — `go build` không bao giờ thấy race.
- `go test -bench . -benchmem` đo cả **số lần cấp phát**.
- Một thư mục = một package; tên là danh từ ngắn, không `utils`.
- Lộ trình từ nền C#: khoảng **hai tuần** kèm một bài kiểm tra thật.

**Kể trong dự án**

- *"Anh học Go lúc nào?"* → Nếu học trong lúc làm dự án, nói thẳng — và kể **cái bạn làm để giảm rủi ro**: bắt đầu bằng tool thay vì bằng server production, hoặc nhờ review kỹ phần đồng thời. Người phỏng vấn đánh giá cách bạn quản lý rủi ro của chính mình.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: một data race chỉ lộ ra khi đông người, không tái hiện được ở môi trường dev. Kể cách bạn bật `-race` trong CI và tìm ra nó, và vì sao trước đó code trông hoàn toàn hợp lý.
- *"Anh có thấy Go hạn chế không?"* → Trả lời trung thực thì tốt hơn khen một chiều: không dùng chung được code với client C#, nên struct định nghĩa hai lần và sẽ lệch — đó chính là lý do phải sinh từ protobuf. Nêu được cái giá của lựa chọn cho thấy bạn chọn có ý thức.
