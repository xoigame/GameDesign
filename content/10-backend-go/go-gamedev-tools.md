---
title: Công cụ gamedev bằng Go
icon: 🔧
summary: Go ngoài phần server — validator dữ liệu, asset pipeline, tool build, bot load test: một binary tĩnh chạy được trên máy mọi người trong team.
status: deep
read: 584
level: intermediate
order: 8
tags: [backend, go, tooling, pipeline, ci]
related: [go-for-unity-dev, unity-editor-tools, data-driven-design, game-server-go]
---

Cách rẻ nhất để đưa Go vào một dự án game **không phải** dựng server, mà là viết một cái tool. Lý do rất cụ thể: `go build` ra **một file chạy được, không phụ thuộc gì** — artist và designer chạy được mà không cần cài Python, Node hay .NET, và CI chạy được mà không cần image nặng.

Đây cũng là chặng 1–3 của lộ trình học trong [[go-for-unity-dev]] biến thành thứ dùng được thật, thay vì bài tập vứt đi.

## Bốn loại tool đáng viết

| Loại | Làm gì | Vì sao Go hợp |
|---|---|---|
| **Validator dữ liệu** | Kiểm bất biến của bảng cân bằng trước khi nó vào build | Chạy trong CI, exit code khác 0 là build đỏ. Xem [[data-driven-design]] |
| **Asset pipeline** | Đóng atlas, nén texture, sinh manifest, kiểm quy ước đặt tên | Xử lý hàng nghìn file song song bằng goroutine, nhanh hơn script tuần tự nhiều lần |
| **Build & release** | Gọi Unity `-batchmode`, gắn version, upload, sinh changelog | Một binary chạy giống hệt trên máy dev, máy build và CI |
| **Bot / load test** | Giả lập vài trăm client nói chuyện với server của bạn | Mỗi bot một goroutine; 500 bot trên một laptop là bình thường |

Thứ tự nên làm: **validator trước**. Nó nhỏ, không đụng gameplay, và ngăn đúng loại lỗi đắt nhất — dữ liệu sai lọt vào bản phát hành rồi mới lộ ra ở người chơi.

## Validator: tool đáng viết đầu tiên

```go
// cmd/validate/main.go — kiểm bất biến của dữ liệu cân bằng trước khi nó vào build.
// go build -o bin/validate ./cmd/validate && bin/validate -in Assets/Data/items.json
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
)

type Item struct {
	ID      string  `json:"id"`
	Price   int64   `json:"price"`
	Rarity  string  `json:"rarity"`
	DropPct float64 `json:"dropPct"`
}

var rarities = map[string]bool{"common": true, "rare": true, "epic": true, "legendary": true}

func main() {
	path := flag.String("in", "Assets/Data/items.json", "file dữ liệu cần kiểm")
	flag.Parse()

	raw, err := os.ReadFile(*path)
	if err != nil {
		fmt.Fprintln(os.Stderr, "không đọc được:", err)
		os.Exit(2) // 2 = tool hỏng, khác với 1 = dữ liệu sai
	}
	var items []Item
	if err := json.Unmarshal(raw, &items); err != nil {
		fmt.Fprintln(os.Stderr, "JSON hỏng:", err)
		os.Exit(2)
	}

	seen := make(map[string]bool, len(items))
	var errs []string
	totalDrop := 0.0

	for i, it := range items {
		switch {
		case it.ID == "":
			errs = append(errs, fmt.Sprintf("phần tử #%d: thiếu id", i))
		case seen[it.ID]:
			errs = append(errs, fmt.Sprintf("%s: id trùng", it.ID))
		case it.Price <= 0:
			errs = append(errs, fmt.Sprintf("%s: giá %d phải > 0", it.ID, it.Price))
		case !rarities[it.Rarity]:
			errs = append(errs, fmt.Sprintf("%s: rarity %q không có trong danh sách", it.ID, it.Rarity))
		}
		seen[it.ID] = true
		totalDrop += it.DropPct
	}
	if totalDrop < 99.99 || totalDrop > 100.01 {
		errs = append(errs, fmt.Sprintf("tổng dropPct = %.2f, phải bằng 100", totalDrop))
	}

	for _, e := range errs {
		fmt.Fprintln(os.Stderr, "✗", e)
	}
	if len(errs) > 0 {
		fmt.Fprintf(os.Stderr, "\n%d lỗi trong %s\n", len(errs), *path)
		os.Exit(1) // CI đỏ, Unity build dừng
	}
	fmt.Printf("✓ %d vật phẩm hợp lệ, tổng drop = %.2f%%\n", len(items), totalDrop)
}
```

Ba chi tiết làm nên khác biệt giữa tool dùng được và tool bị bỏ xó:

- **Gom hết lỗi rồi mới thoát**, đừng dừng ở lỗi đầu tiên. Designer sửa một lượt thay vì chạy lại mười lần.
- **Exit code có nghĩa**: `0` sạch, `1` dữ liệu sai, `2` tool hỏng. CI và Unity đọc đúng mã này để quyết định.
- **Lỗi in ra `stderr`, kết quả in ra `stdout`**. Nhờ vậy `bin/validate > report.txt` vẫn thấy lỗi trên màn hình.

## Xử lý hàng nghìn file: song song bằng goroutine

```go
// Kiểm quy ước đặt tên và kích thước của mọi texture — ba dòng để chạy song song.
sem := make(chan struct{}, runtime.NumCPU()) // giới hạn số việc chạy cùng lúc
var wg sync.WaitGroup
var mu sync.Mutex
var bad []string

for _, f := range files {
	wg.Add(1)
	go func(f string) {
		defer wg.Done()
		sem <- struct{}{}                   // xin chỗ
		defer func() { <-sem }()            // trả chỗ

		if w, h, err := imageSize(f); err != nil || w%4 != 0 || h%4 != 0 {
			mu.Lock()
			bad = append(bad, f)            // slice KHÔNG an toàn khi ghi song song
			mu.Unlock()
		}
	}(f)
}
wg.Wait()
```

Không có `sem` thì 8.000 file thành 8.000 goroutine mở file cùng lúc, và bạn chạm giới hạn file descriptor của hệ điều hành. Đây là nơi `sync.Mutex` **đúng chỗ**: một biến chung, giữ khoá vài nano giây. Khác hẳn state của phòng chơi trong [[game-server-go]], nơi mutex là sai lựa chọn.

## Bot client: load test bằng chính giao thức của game

```go
// 500 "người chơi" gọi API cùng lúc, in p50/p99 — số duy nhất đáng tin trước khi mở cửa.
lat := make([]time.Duration, n)
var wg sync.WaitGroup

for i := 0; i < n; i++ {
	wg.Add(1)
	go func(i int) {
		defer wg.Done()
		t0 := time.Now()
		resp, err := http.Post(url, "application/json", bytes.NewReader(body))
		if err == nil {
			io.Copy(io.Discard, resp.Body) // PHẢI đọc hết rồi Close, không thì kết nối
			resp.Body.Close()              // không được tái dùng và bạn đo nhầm chi phí bắt tay
		}
		lat[i] = time.Since(t0)            // mỗi goroutine ghi MỘT ô riêng: không cần khoá
	}(i)
}
wg.Wait()

slices.Sort(lat)
fmt.Printf("p50 %v · p95 %v · p99 %v\n", lat[n/2], lat[n*95/100], lat[n*99/100])
```

Tự viết bot có một lợi thế mà `k6` hay `vegeta` không có: nó nói **đúng giao thức game của bạn** — đăng nhập thật, giữ JWT, mở WebSocket, gửi input đúng nhịp tick. Số ra từ đó mới là số thật.

## Bẫy thường gặp

| Bẫy | Hậu quả |
|---|---|
| Tool luôn `os.Exit(0)` | CI xanh trong khi dữ liệu sai — tệ hơn là không có tool |
| Đường dẫn cứng theo máy tác giả | Chạy trên máy người khác là hỏng; nhận đường dẫn qua `flag` |
| Ghi đè file gốc tại chỗ | Tool lỗi một lần là mất dữ liệu; ghi ra file tạm rồi `os.Rename` |
| Quên `sem` giới hạn goroutine | Hết file descriptor, hoặc ăn sạch RAM với file lớn |
| Không `Close` response body khi load test | Đo ra số đẹp giả vì kết nối không tái dùng được |
| Tool chỉ chạy trên máy một người | Cross-compile sẵn cho `windows/amd64` và `darwin/arm64`, commit vào `tools/` hoặc phát qua release |
| Viết tool xử lý asset nhị phân từ đầu | Atlas, nén texture đã có sẵn công cụ tốt; Go nên làm phần *điều phối* và *kiểm tra* |

## 🤖 Prompt cho AI

**Dùng AI thế nào cho tool nội bộ**

Đây là chỗ **an toàn nhất** để giao cho AI trong cả kho: tool không đụng gameplay, chạy được là biết đúng, và sai thì hậu quả dừng ở "build đỏ" chứ không ra tới người chơi. Vì vậy hãy giao **trọn gói** thay vì từng mảnh: mô tả bất biến, để nó viết tool + test + lệnh chạy.

Hai việc vẫn phải tự làm: **liệt kê bất biến** (AI không biết game bạn coi cái gì là sai), và **quyết định tool được phép ghi đè cái gì** (mặc định: không ghi đè gì, chỉ báo cáo).

Ba tool đầu tiên đáng giao, theo thứ tự ROI: validator dữ liệu → tool kiểm quy ước đặt tên asset → bot load test. Cả ba đều là việc người ta làm sơ sài vì nhàm, nên AI làm hộ là lợi nhất.

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Bất biến cụ thể**, viết ra từng dòng: id duy nhất, giá > 0, tổng drop = 100, rarity thuộc danh sách nào.
- **Định dạng đầu vào thật** — dán 5 dòng dữ liệu mẫu, đừng mô tả bằng lời.
- **Exit code muốn gì** và lỗi in ra `stderr` hay `stdout`.
- **Chạy ở đâu**: CI Linux, máy Windows của designer, hay từ menu Unity Editor — nó quyết định cách xử lý đường dẫn và cross-compile.
- **Tool được phép ghi không**, hay chỉ đọc và báo cáo.
- **Chỉ stdlib** — tool nội bộ không đáng để kéo theo cây phụ thuộc.

**Mẫu prompt**

```
Viết CLI Go 1.22 (CHỈ stdlib) kiểm dữ liệu cân bằng, chạy trong CI Linux và trên
Windows của designer.

Đầu vào — 5 dòng thật từ Assets/Data/items.json:
<dán dữ liệu>

BẤT BIẾN, mỗi dòng một lỗi riêng:
1. id không rỗng và không trùng.
2. price là số nguyên > 0 và <= 1.000.000.
3. rarity thuộc {common, rare, epic, legendary}.
4. tổng dropPct của toàn file = 100 (sai số 0.01).
5. mọi item epic/legendary phải có field "icon" trỏ tới file CÓ THẬT trên đĩa.

YÊU CẦU:
- Gom HẾT lỗi rồi mới thoát, không dừng ở lỗi đầu tiên.
- Exit 0 sạch, 1 dữ liệu sai, 2 tool hỏng. Lỗi ra stderr, tóm tắt ra stdout.
- Nhận đường dẫn qua flag -in, KHÔNG hardcode.
- CHỈ ĐỌC, không ghi đè bất cứ file nào.
- Kèm file _test.go với 1 case sạch và 1 case sai mỗi loại.

Đưa luôn lệnh build cho windows/amd64 và linux/amd64.
```

**Bẫy thường gặp:** AI viết tool dừng ngay ở lỗi đầu tiên (`log.Fatal` trong vòng lặp) vì đó là mẫu code phổ biến nhất — designer sẽ phải chạy lại mười lần cho mười lỗi và sẽ bỏ dùng tool sau ngày thứ hai. Hai cái nữa: nó mặc định `os.Exit(0)` ở cuối kể cả khi có lỗi đã in ra (CI xanh trong khi dữ liệu sai), và nó thích "sửa luôn cho tiện" — ghi đè file gốc mà không ai yêu cầu.

## 🎮 Unity

Tool Go chạy từ Unity Editor là một `Process`, không có gì huyền bí. Điểm mấu chốt là **đọc exit code** và **đưa lỗi vào Console** để không ai phải mở terminal.

**Component & nơi đặt**

- Binary đặt ở `Tools/` ngoài `Assets/` — nếu để trong `Assets/` thì Unity import nó như một asset và nhồi vào build.
- `Editor/DataValidatorMenu.cs` — đặt trong thư mục `Editor/`, không đi vào bản build.

**Code**

```csharp
using System.Diagnostics;
using UnityEditor;
using UnityEngine;

// Chạy tool Go từ menu và đổ kết quả vào Console. Exit code khác 0 = build không được phép đi tiếp.
public static class DataValidatorMenu
{
    [MenuItem("Tools/Kiểm dữ liệu cân bằng %#v")]     // Ctrl/Cmd + Shift + V
    public static bool Validate()
    {
        string exe = Application.platform == RuntimePlatform.WindowsEditor
            ? "Tools/validate.exe" : "Tools/validate";

        var psi = new ProcessStartInfo
        {
            FileName = exe,
            Arguments = "-in Assets/Data/items.json",
            WorkingDirectory = System.IO.Directory.GetCurrentDirectory(),  // gốc project, KHÔNG phải Assets/
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        using (var p = Process.Start(psi))
        {
            string stdout = p.StandardOutput.ReadToEnd();   // đọc TRƯỚC WaitForExit:
            string stderr = p.StandardError.ReadToEnd();    // buffer đầy sẽ làm tool treo mãi
            p.WaitForExit();

            if (p.ExitCode == 0) { UnityEngine.Debug.Log(stdout); return true; }
            UnityEngine.Debug.LogError($"Dữ liệu không hợp lệ (exit {p.ExitCode}):\n{stderr}");
            return false;
        }
    }
}
```

**Bẫy Unity cụ thể**

- **`WaitForExit()` trước khi đọc output làm tool treo** khi output dài hơn buffer của pipe. Luôn `ReadToEnd()` trước, hoặc dùng event `OutputDataReceived`.
- **`WorkingDirectory` mặc định là thư mục project**, nhưng đừng dựa vào may rủi — đặt rõ ra, vì đường dẫn tương đối trong tool tính từ đó.
- **Binary không có quyền chạy trên macOS/Linux** sau khi clone (`chmod +x`), và macOS còn chặn binary chưa ký (Gatekeeper). Ghi rõ trong README của repo.
- **Đừng để binary trong `Assets/`** — Unity import nó, sinh `.meta`, và có khi nhét cả vào StreamingAssets của bản phát hành.
- **Muốn chặn build khi dữ liệu sai**: gọi `Validate()` trong `IPreprocessBuildWithReport` và ném `BuildFailedException` — chứ đừng chỉ log rồi để build chạy tiếp.

**Kiểm tra nhanh**

- Sửa một `price` thành `0` trong JSON rồi bấm menu: Console hiện **đúng một** dòng đỏ nêu tên item, và bấm vào không mở nhầm file khác.
- Đổi tên file JSON đi: tool trả exit 2 và Console nói "không đọc được", không phải "dữ liệu sai".
- Chạy `Tools/validate -in <file>` thẳng trong terminal: kết quả giống hệt trong Editor.
- Trên CI: cố tình push một file sai — job phải đỏ ở bước validate, trước bước build Unity.
