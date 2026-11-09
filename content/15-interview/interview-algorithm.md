---
id: interview-algorithm
title: Vòng 1 — Giải thuật code 3 câu
icon: 🧮
summary: Đề thi giải thuật ba câu (dễ–vừa–khó, 60–90 phút) thường ra những dạng nào, cách phân giờ, mười dạng lõi cộng thêm các dạng mở rộng (heap, union-find, topo sort, Dijkstra, DP chuỗi, bit, mô phỏng), bài mang màu game, mẹo C# cho thi online, lộ trình ôn 5–7 ngày và 19 lời giải C# chạy được.
status: deep
read: 1110
level: intermediate
order: 10
tags: [interview, algorithm, data-structures, csharp, live-coding]
related: [csharp-interview-kit, csharp-collections, pathfinding]
---

Vòng 1 của nhiều studio game (kể cả studio Nhật tuyển Mobile Game Developer) không hỏi Unity mà **thi giải thuật**: ba đề, code trong một khung giờ cố định. Người làm Unity lâu năm hay chủ quan ở đây — mười năm viết gameplay không làm tay quen với `Dictionary`, BFS hay DP. Node này ôn đúng vòng đó. Sáu bài live-coding hướng engine (pool, event bus, LRU, heap…) nằm ở [[csharp-interview-kit]], đừng ôn lặp; về chỗ ngồi của node này trong cả nhánh xem [[interview]].

## Đề ba câu thường ra thế nào

| Câu | Mức | Thường là | Điểm tương đối |
|---|---|---|---|
| 1 | Dễ | Hash map đếm/ghép cặp, xử lý chuỗi, mảng cơ bản, mô phỏng | Chắc chắn phải xong |
| 2 | Vừa | Two pointers, sliding window, sort + greedy, BFS/DFS trên lưới, binary search | Quyết định đậu rớt |
| 3 | Khó | DP, đồ thị, backtracking có cắt tỉa, hoặc bài vừa nhưng test lớn bắt O(n log n) | Phần thưởng; làm được một phần vẫn có điểm |

Thời lượng 60–90 phút nghĩa là mỗi câu trung bình 20–30 phút **gồm cả đọc đề, code và tự test**. Nền tảng chưa rõ: nếu là HackerRank/Codility thì có test ẩn, chấm tự động theo từng test case; nếu là giấy thì chấm cách nghĩ, tên biến, xử lý biên.

### Chiến lược phân giờ (90 phút)

| Phút | Việc |
|---|---|
| 0–5 | **Đọc hết cả ba đề** trước khi gõ gì. Xếp thứ tự theo độ chắc, không theo số thứ tự |
| 5–25 | Câu chắc ăn nhất. Nộp bản chạy được |
| 25–55 | Câu thứ hai. Quá 35 phút mà chưa ra hướng thì dừng, nộp bản brute force đang có |
| 55–80 | Câu khó. Mục tiêu là điểm một phần: brute force đúng ăn test nhỏ |
| 80–90 | Rà lại cả ba: biên, tràn số, đọc input |

Thói quen nên có trên từng câu:

1. **Viết ngay độ phức tạp mục tiêu** dựa vào giới hạn đề (bảng ở dưới). Giới hạn là gợi ý đề đang đòi gì.
2. **Nộp bản brute force chạy được trước**, tối ưu sau. Bản đúng-nhưng-chậm vẫn ăn điểm test nhỏ; bản tối ưu dở dang ăn 0.
3. **Tự test biên bằng tay** trước khi nộp: mảng rỗng, một phần tử, tất cả giống nhau, giá trị lớn nhất, đáp án không tồn tại.
4. **Ghi độ phức tạp** thành comment trên đầu hàm — trên giấy đó là điểm cộng rõ ràng.

### Ba bẫy ăn điểm vô lý

- **Đọc input.** Nền tảng có stdin thì dùng `Console.ReadLine()` và `Split(' ')`; đừng viết parser cầu kỳ. Với n cỡ 10^5–10^6 dòng thì tránh gọi `Console.Write` từng dòng — gom vào `StringBuilder` rồi in một lần. Hỏi (hoặc đọc kỹ) định dạng: có dòng đầu là n không, ngăn cách bằng dấu cách hay xuống dòng.
- **Tràn `int`.** `int` dừng ở khoảng 2,1 tỉ. Tổng 10^5 số mỗi số 10^5 là 10^10 — tràn. Thấy tổng, tích, hoặc `n*(n+1)/2` thì dùng `long` ngay từ biến đầu tiên, và nhớ ép kiểu **trước** khi nhân: `(long)a * b`, không phải `(long)(a * b)`.
- **Off-by-one.** Binary search `lo < hi` hay `lo <= hi`, `mid = lo + (hi - lo) / 2` (không phải `(lo + hi) / 2` khi giá trị lớn), cửa sổ `[left, right]` đóng hay nửa mở. Chọn một quy ước, ghi comment, giữ nguyên cho cả hàm.

## Mười dạng bài hay gặp

Cột "nhận diện" là câu trong đề báo hiệu dạng bài. Cột game là chỗ bạn đã gặp cùng cấu trúc đó trong công việc.

| # | Dạng | Nhận diện trong đề | Kỹ thuật | Độ phức tạp | Liên hệ game |
|---|---|---|---|---|---|
| 1 | **Hash map** | "tìm cặp tổng = k", "đếm số lần xuất hiện", "có trùng không" | `Dictionary<giá trị, chỉ số/đếm>`, kiểm phần tử bù trước khi thêm | O(n) thời gian, O(n) bộ nhớ | Đếm vật phẩm trong inventory, tìm hai món ghép được thành công thức |
| 2 | **Two pointers** | Mảng đã sắp xếp, "cặp/bộ ba", đảo ngược, bỏ trùng tại chỗ | Hai chỉ số từ hai đầu (hoặc cùng chiều), dịch theo so sánh | O(n) sau khi sort | Ghép cặp matchmaking theo điểm sức mạnh |
| 3 | **Sliding window** | "đoạn con liên tiếp", "dài nhất/ngắn nhất thoả điều kiện" | Cửa sổ `[left, right]`, mở rộng `right`, thu `left` khi vi phạm | O(n) | Cửa sổ thời gian của combo: chuỗi đòn trong 1,5 giây |
| 4 | **Prefix sum** | "tổng đoạn [l, r]" nhiều truy vấn, "số đoạn có tổng = k" | `pre[i]` = tổng i phần tử đầu; đoạn = `pre[r+1] - pre[l]`; kết hợp hash map đếm | O(n) dựng, O(1) mỗi truy vấn | Tổng sát thương theo từng giây trong log trận |
| 5 | **Stack** | Ngoặc/thẻ lồng nhau, "phần tử lớn hơn kế tiếp", undo | Đẩy khi mở; với "next greater" giữ stack giảm dần | O(n) | Undo/redo; kiểm cú pháp skill script |
| 6 | **Binary search (trên đáp án)** | "giá trị nhỏ nhất/lớn nhất sao cho…", tính khả thi đơn điệu | Đoán đáp án `mid`, hàm `Feasible(mid)`, thu hẹp nửa | O(n log M) | Tốc độ tối thiểu để kịp qua hết checkpoint trong thời gian cho trước |
| 7 | **BFS trên lưới/đồ thị** | "đường đi ngắn nhất" khi mọi bước giá như nhau, "số bước tối thiểu" | Queue, mảng `dist`, đánh dấu lúc đẩy vào hàng đợi | O(V+E), lưới O(R·C) | Pathfinding trên tilemap — xem [[pathfinding]] |
| 8 | **DFS / backtracking** | "đếm vùng liên thông", "liệt kê mọi tổ hợp/hoán vị", "có tồn tại cách…" | DFS đánh dấu đã thăm; backtracking: chọn → đệ quy → bỏ chọn, cắt tỉa sớm | Vùng liên thông O(V+E); liệt kê tổ hợp luỹ thừa | Đếm đảo/phòng trên map; thử mọi cách xếp đội hình |
| 9 | **Sort + greedy** | "khoảng thời gian chồng nhau", "xếp lịch", "ít … nhất" | Sort theo đầu mút, quét một lượt, giữ trạng thái hiện tại | O(n log n) | Gộp các khoảng buff chồng thời gian; lên lịch spawn |
| 10 | **DP 1 chiều / 2 chiều** | "số cách", "tối thiểu/tối đa", bài toán con lặp lại | Định nghĩa `dp[i]`, công thức chuyển, khởi tạo, thứ tự điền | Coin change O(n·k); LIS O(n log n); knapsack O(n·W) | Chọn vật phẩm tối đa giá trị trong giới hạn ô túi đồ (knapsack) |

### Nhìn giới hạn đề mà đoán độ phức tạp

| n trong đề | Cần | Gợi ý |
|---|---|---|
| ≤ 10–12 | O(n!) hoặc O(2^n·n) | Backtracking, bitmask |
| ≤ 20–25 | O(2^n) | Duyệt tập con |
| ≤ 500 | O(n³) | DP 2 chiều có vòng thứ ba, Floyd–Warshall |
| ≤ 5 000 | O(n²) | DP 2 chiều, hai vòng lồng |
| ≤ 10^5 | O(n log n) | Sort, heap, binary search, `Dictionary` |
| ≤ 10^6–10^7 | O(n) | Hai con trỏ, sliding window, prefix sum, đếm |
| ≤ 10^18 | O(log n) | Binary search, luỹ thừa nhanh |

### Lưới và hướng đi — đoạn code viết tay trôi chảy

Bốn hướng gõ ra mà không nghĩ, vì BFS/DFS lưới chiếm gần nửa số bài khó:

```csharp
int[] dr = { 1, -1, 0, 0 };
int[] dc = { 0, 0, 1, -1 };
for (int k = 0; k < 4; k++)
{
    int nr = r + dr[k], nc = c + dc[k];
    if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;   // kiểm biên TRƯỚC khi chạm mảng
}
```

## Các dạng mở rộng — mỗi dạng một mục ngắn

Mười dạng ở bảng trên là phần lõi. Phần này thêm các dạng hay lọt vào câu 2–3 của đề, theo thứ tự **nhận diện → ý tưởng → độ phức tạp → bẫy**. Có lời giải chạy được ở mục 💻 cho: two pointers, prefix sum, top-K, union-find, topo sort, Dijkstra, edit distance.

### Two pointers (mở rộng)

- **Nhận diện:** mảng đã sắp xếp (hoặc cho phép sort), "cặp/bộ ba có tổng…", "đếm cặp có tổng ≤ k", bỏ trùng tại chỗ, đảo ngược, gộp hai mảng sorted.
- **Ý tưởng:** `l` ở đầu, `r` ở cuối. Tổng nhỏ quá thì `l++`, lớn quá thì `r--`. Với "đếm cặp tổng ≤ k": khi `a[l]+a[r] ≤ k` thì `a[l]` ghép được với **mọi** phần tử từ `l+1` tới `r`, cộng `r-l` rồi `l++`. Bộ ba (3Sum): cố định `i`, chạy two pointers trên phần còn lại.
- **Độ phức tạp:** O(n) sau sort, tổng O(n log n); 3Sum là O(n²). Bộ nhớ O(1).
- **Bẫy:** quên sort (và sort làm mất chỉ số gốc nếu đề đòi trả chỉ số — khi đó dùng hash); 3Sum không bỏ qua giá trị trùng nên in lặp bộ ba; `l < r` hay `l <= r` (cặp cần hai phần tử khác nhau thì `l < r`).

### Prefix sum và difference array

- **Nhận diện:** nhiều truy vấn "tổng đoạn [l, r]"; "đếm mảng con có tổng = k"; "cộng v vào đoạn [l, r]" nhiều lần rồi hỏi mảng cuối.
- **Ý tưởng:** `pre[i+1] = pre[i] + a[i]`, tổng đoạn = `pre[r+1] - pre[l]`. Đếm mảng con tổng k (kể cả số âm): duyệt, giữ `Dictionary<tổng tiền tố, số lần>`, mỗi bước cộng `freq[pre - k]`; khởi tạo `freq[0] = 1`. **Difference array** là chiều ngược: `d[l] += v; d[r+1] -= v`, cuối cùng prefix sum của `d` ra mảng thật — cập nhật đoạn O(1). Bản 2 chiều: `pre[r][c]` = tổng hình chữ nhật từ gốc.
- **Độ phức tạp:** dựng O(n), mỗi truy vấn O(1); đếm mảng con tổng k là O(n).
- **Bẫy:** quên `freq[0] = 1` làm mất các đoạn bắt đầu từ phần tử đầu; dùng `int` cho tổng tiền tố (tràn); difference array cần mảng dài `n+1`; sliding window **không** thay được prefix + hash khi có số âm (cửa sổ mất tính đơn điệu).

### Monotonic stack

- **Nhận diện:** "phần tử lớn hơn kế tiếp", "nhiệt độ ấm hơn sau bao nhiêu ngày", "hình chữ nhật lớn nhất trong histogram", "nước đọng".
- **Ý tưởng:** stack giữ **chỉ số** của các phần tử theo thứ tự đơn điệu (giảm dần cho next greater). Gặp `a[i]` lớn hơn đỉnh thì pop đỉnh và ghi đáp án của nó là `i`; sau đó push `i`. Histogram: stack tăng dần, pop khi gặp cột thấp hơn, tính diện tích với chiều rộng từ phần tử dưới đỉnh.
- **Độ phức tạp:** O(n) — mỗi phần tử vào và ra stack đúng một lần, dù có vòng `while` lồng trong `for`.
- **Bẫy:** push giá trị thay vì chỉ số (mất vị trí); quên xử lý phần tử còn lại trong stack cuối vòng (với histogram thêm cột cao 0 ở cuối làm lính gác); bài vòng tròn thì duyệt 2n.

### Heap và top-K

- **Nhận diện:** "K phần tử lớn nhất/thường gặp nhất", "trung vị của luồng", "luôn lấy cái nhỏ nhất rồi cập nhật", gộp K danh sách đã sort.
- **Ý tưởng:** top-K lớn nhất dùng **min-heap kích thước K**: đẩy vào, nếu quá K thì bỏ đỉnh (phần tử nhỏ nhất). Cuối cùng heap chứa đúng K lớn nhất. Trung vị luồng: hai heap (max-heap nửa dưới, min-heap nửa trên), giữ chênh lệch kích thước ≤ 1.
- **Độ phức tạp:** O(n log K), bộ nhớ O(K). Sort cả mảng là O(n log n); nếu K nhỏ so với n thì heap thắng, nếu K ≈ n thì sort cho gọn. Quickselect là O(n) trung bình.
- **Bẫy:** dùng **max-heap** để giữ K lớn nhất (sai — phải min-heap để loại được phần tử nhỏ nhất); `PriorityQueue<TElement, TPriority>` có từ .NET 6 nhưng **Unity (Mono/.NET Standard 2.1) không có** — tự viết heap mảng (xem [[csharp-interview-kit]]) hoặc `SortedSet` kèm khoá phá hoà (SortedSet không cho phần tử trùng); `PriorityQueue` mặc định là min-heap, muốn max-heap phải đảo dấu priority hoặc truyền `Comparer`.

### Hash + sort (anagram, nhóm theo khoá)

- **Nhận diện:** "nhóm các từ là hoán vị của nhau", "hai chuỗi có phải anagram", "tần suất cao nhất", đếm trùng.
- **Ý tưởng:** biến mỗi phần tử thành một **khoá chuẩn** rồi nhóm bằng `Dictionary<khoá, List<…>>`. Anagram: khoá là chuỗi sau khi sort ký tự (O(L log L)) hoặc mảng đếm 26 ô ghép thành chuỗi (O(L)). Kiểm hai chuỗi anagram: mảng đếm 26 ô, cộng cho chuỗi một, trừ cho chuỗi hai, cuối cùng toàn 0.
- **Độ phức tạp:** nhóm n từ độ dài L: O(n · L log L) với khoá sort, O(n · L) với khoá đếm.
- **Bẫy:** `string` làm khoá thì ổn, nhưng `int[]` làm khoá là so sánh **tham chiếu** — phải đổi thành chuỗi (`string.Join(",", cnt)`); quên phân biệt hoa/thường nếu đề yêu cầu; ký tự Unicode không nằm trong 26 ô.

### Union-Find (DSU)

- **Nhận diện:** "hai nút có cùng nhóm không", "đếm thành phần liên thông" khi các cạnh đến **dần dần**, "mạng này có chu trình không", Kruskal (cây khung nhỏ nhất), "bạn của bạn".
- **Ý tưởng:** mỗi nút trỏ tới cha, `Find` đi lên gốc có **nén đường** (path compression), `Union` gắn cây nhỏ vào cây lớn (**union by size**). Mỗi cạnh `Union` thành công thì số thành phần giảm 1; `Union` thất bại nghĩa là cạnh đó tạo chu trình.
- **Độ phức tạp:** gần O(1) mỗi thao tác (O(α(n)), α là hàm Ackermann ngược, ≤ 4 trong thực tế). Tổng O((n+m)·α(n)).
- **Bẫy:** `Find` đệ quy sâu trên chuỗi dài gây stack overflow — viết vòng lặp; so sánh `parent[a] == parent[b]` thay vì `Find(a) == Find(b)` (chưa nén thì sai); DSU **không hỗ trợ xoá cạnh** — bài cần xoá thì làm ngược thời gian.

### Topological sort

- **Nhận diện:** "môn A phải học trước B", "thứ tự build các module", "có chu trình phụ thuộc không", đồ thị có hướng không chu trình (DAG).
- **Ý tưởng:** **Kahn**: tính bậc vào của mỗi nút, đẩy các nút bậc 0 vào queue; lấy ra, giảm bậc các nút kề, nút nào về 0 thì vào queue. Nếu số nút lấy ra < n thì có chu trình. Biến thể DFS: hậu thứ tự đảo ngược, nhưng cần bắt chu trình bằng 3 màu.
- **Độ phức tạp:** O(V + E).
- **Bẫy:** hướng cạnh ngược (đề nói "A trước B" thì cạnh A→B, nhiều người đảo); quên nút cô lập vẫn phải nằm trong kết quả; nhiều thứ tự hợp lệ thì đề thường chấp nhận bất kỳ hoặc đòi nhỏ nhất theo từ điển (khi đó đổi queue thành min-heap).

### Dijkstra

- **Nhận diện:** "đường đi ngắn nhất" nhưng **cạnh có trọng số khác nhau và không âm**; chi phí di chuyển theo địa hình; "thời gian sớm nhất tới nơi".
- **Ý tưởng:** `dist[]` khởi tạo vô cực, nguồn bằng 0; min-heap theo `dist`. Lấy nút có `dist` nhỏ nhất, nới lỏng (relax) các cạnh ra. Bản "lazy deletion": đẩy bản ghi mới thay vì sửa, bỏ qua bản ghi cũ khi `d > dist[u]`. Đường đi trên lưới có chi phí ô: ô là nút, chi phí vào ô là trọng số.
- **Độ phức tạp:** O((V + E) log V) với heap; O(V²) nếu quét mảng (vẫn ổn khi V ≤ 5 000 và đồ thị dày).
- **Bẫy:** có **cạnh âm** thì Dijkstra sai (dùng Bellman-Ford); `dist` kiểu `int` cộng với vô cực `int.MaxValue` tràn — dùng `long` hoặc kiểm vô cực trước khi cộng; bài thi không có `PriorityQueue` (Unity) thì tự viết heap; mọi cạnh trọng số 1 thì BFS đủ và nhanh hơn. Xem thêm [[pathfinding]].

### DP trên lưới

- **Nhận diện:** "số đường đi từ góc trên trái xuống góc dưới phải khi chỉ đi phải/xuống", "tổng nhỏ nhất của đường đi", lưới có chướng ngại.
- **Ý tưởng:** `dp[r][c]` = số cách (hoặc chi phí tối thiểu) tới ô `(r, c)`. Công thức: `dp[r][c] = dp[r-1][c] + dp[r][c-1]` (đếm) hoặc `grid[r][c] + min(dp[r-1][c], dp[r][c-1])`. Ô tường thì `dp = 0` (đếm) hoặc vô cực (tối thiểu). Hàng/cột đầu khởi tạo riêng.
- **Độ phức tạp:** O(R·C); bộ nhớ O(C) nếu chỉ giữ một hàng.
- **Bẫy:** khi có thể đi cả bốn hướng thì **không** phải DP mà là BFS/Dijkstra (vì có vòng lặp); đếm số đường đi dễ tràn — đề thường đòi chia dư cho 10^9+7, nhớ `%` sau **mỗi** phép cộng; ô xuất phát là tường thì đáp án 0.

### DP chuỗi (edit distance, LCS)

- **Nhận diện:** "số thao tác ít nhất để biến chuỗi A thành B" (edit distance), "dãy con chung dài nhất" (LCS), "palindrome con", "khớp mẫu".
- **Ý tưởng:** `dp[i][j]` = đáp án cho `i` ký tự đầu của A và `j` ký tự đầu của B. LCS: nếu `A[i-1] == B[j-1]` thì `dp[i-1][j-1] + 1`, ngược lại `max(dp[i-1][j], dp[i][j-1])`. Edit distance: nếu bằng nhau thì `dp[i-1][j-1]`, ngược lại `1 + min(thay, xoá, chèn)`. Cơ sở: `dp[i][0] = i`, `dp[0][j] = j`.
- **Độ phức tạp:** O(m·n) thời gian; bộ nhớ O(m·n), cuộn hàng còn O(min(m, n)) nhưng mất khả năng dựng lại chuỗi.
- **Bẫy:** nhầm chỉ số `i` (số ký tự) với vị trí (`i-1`); quên cơ sở hàng/cột 0; **dãy con** (subsequence, không cần liên tiếp) khác **chuỗi con** (substring, liên tiếp) — bài substring chung dài nhất reset về 0 khi khác nhau.

### Bit manipulation cơ bản

- **Nhận diện:** "số xuất hiện đúng một lần, các số khác hai lần", "đếm bit 1", "lũy thừa của 2", "tập con", cờ trạng thái (flags), n ≤ 20 với bitmask.
- **Ý tưởng:** `x & (x - 1)` xoá bit 1 thấp nhất (đếm bit, kiểm luỹ thừa 2: `x > 0 && (x & (x-1)) == 0`); `x & -x` lấy bit 1 thấp nhất; `a ^ a = 0` nên XOR cả mảng ra số lẻ lần; `1 << k` bật bit k, `x >> k & 1` đọc bit k. Duyệt mọi tập con của n phần tử: `for (int mask = 0; mask < (1 << n); mask++)`.
- **Độ phức tạp:** thao tác bit O(1); duyệt mọi tập con O(2^n · n).
- **Bẫy:** ưu tiên toán tử — `x & 1 == 0` bị hiểu thành `x & (1 == 0)`, phải viết `(x & 1) == 0`; `1 << 31` tràn `int`, dùng `1L << k` với k ≥ 31; `>>` trên số âm giữ dấu (dịch số học), muốn dịch logic dùng `>>>` (C# 11+) hoặc ép sang `uint`. Với game: cờ trạng thái nhân vật, layer mask của Unity chính là bitmask.

### Xử lý chuỗi

- **Nhận diện:** đảo từ, palindrome, nén chuỗi (`aaabb` → `a3b2`), tách/ghép, đếm ký tự, so khớp đơn giản.
- **Ý tưởng:** làm việc trên `char[]` hoặc `StringBuilder`, không nối `string` trong vòng lặp. Palindrome: two pointers từ hai đầu (bỏ ký tự không phải chữ số/chữ cái nếu đề yêu cầu). Palindrome con dài nhất: mở rộng từ tâm, O(n²). Bảng đếm `int[26]` hoặc `int[128]` thay `Dictionary<char,int>` khi bảng chữ nhỏ.
- **Độ phức tạp:** thường O(n); nối `string` bằng `+=` trong vòng lặp là O(n²) vì mỗi lần cấp phát bản mới.
- **Bẫy:** `string` bất biến, `s[i] = 'x'` không biên dịch; `Split(' ')` ra phần tử rỗng khi có hai dấu cách liền nhau (dùng `StringSplitOptions.RemoveEmptyEntries`); `ToLower()` phụ thuộc culture — thi thì dùng `ToLowerInvariant()`; so sánh `==` giữa chuỗi là so giá trị, ổn.

### Mô phỏng (simulation)

- **Nhận diện:** đề mô tả một quy trình từng bước (xoay ma trận, game of life, rơi khối, xếp hàng đợi, robot đi theo lệnh) và hỏi trạng thái sau T bước. **Hay ra nhất ở studio game** vì kiểm tra khả năng đọc kỹ spec và code không sót biên.
- **Ý tưởng:** làm đúng như đề, không tối ưu sớm. Điểm then chốt là **không sửa trạng thái trong khi vẫn đọc nó**: Game of Life phải tính lưới mới từ lưới cũ (hai mảng, hoặc mã hoá trạng thái `0→1`, `1→0` thành 4 giá trị). Xoay 90° tại chỗ: transpose rồi đảo từng hàng; ma trận chữ nhật thì phải tạo mảng mới kích thước đổi chỗ `R×C → C×R`. Rơi khối (gravity): quét từng cột từ dưới lên, dồn phần tử khác trống xuống.
- **Độ phức tạp:** O(số bước · kích thước lưới); nếu T rất lớn, tìm **chu kỳ lặp** của trạng thái.
- **Bẫy:** thứ tự cập nhật (đọc ô đã bị ghi đè); biên của 8 hướng lân cận; đề nói "đồng thời" mà bạn xử lý tuần tự; T lên 10^9 mà bạn mô phỏng từng bước (phải tìm chu kỳ).

## Bài toán mang màu game

Studio game thích đề có vỏ game: bên dưới vẫn là các dạng ở trên. Nhận ra **cấu trúc**, bỏ qua vỏ.

| Đề bọc trong game | Cấu trúc thật | Cách làm | Độ phức tạp |
|---|---|---|---|
| Match-3: tìm mọi ô thuộc dãy ≥ 3 cùng loại | Quét dãy liên tiếp | Quét từng hàng rồi từng cột, gom dãy cùng giá trị, đánh dấu ô có dãy ≥ 3 vào mảng `bool` **riêng** rồi mới xoá (xoá ngay sẽ phá dãy chữ L/T chưa quét) | O(R·C) |
| Match-3: nhóm kề nhau ≥ 3 (kiểu Puzzle Bobble, Toon Blast) | Vùng liên thông | BFS/DFS flood fill từ ô chưa thăm, đếm kích thước nhóm cùng màu | O(R·C) |
| Flood fill / tô màu / lan lửa, nước | BFS/DFS lưới | Giống đếm đảo; lan theo bước thời gian thì BFS nhiều nguồn (đẩy mọi nguồn vào queue từ đầu) | O(R·C) |
| Xoay mảnh tetris | Xoay ma trận | Vuông: transpose + đảo hàng; mảnh chữ nhật: tạo mảng mới `C×R`, `new[c, R-1-r] = old[r, c]` | O(R·C) |
| Rơi khối sau khi ăn (gravity) | Mô phỏng | Từng cột, con trỏ ghi từ đáy, đọc từ đáy lên | O(R·C) |
| Inventory: gộp stack cùng loại, mỗi ô tối đa 99 | Hash + chia | `Dictionary<id, tổng>` rồi chia thành `tổng / 99` ô đầy và một ô dư; giữ thứ tự xuất hiện đầu tiên nếu đề yêu cầu ổn định | O(n) |
| Tổng damage/combo trong cửa sổ 1,5 giây | Sliding window / prefix sum | Mảng sự kiện đã sort theo thời gian; hai con trỏ giữ cửa sổ, hoặc `pre` + binary search | O(n) |
| Bốc thăm gacha có trọng số | Prefix sum + binary search | Dựng mảng tiền tố trọng số, quay số nguyên trong `[0, tổng)`, tìm phần tử đầu tiên có tiền tố **lớn hơn** số quay | Dựng O(n), quay O(log n) |
| Đường đi trên lưới có chi phí địa hình (rừng 3, đường 1, nước 5) | Dijkstra | Nút = ô, trọng số = chi phí vào ô; cạnh bằng nhau thì BFS | O(RC log RC) |
| Thứ tự mở khoá cây kỹ năng, quest phụ thuộc | Topo sort | Cạnh tiên quyết → kỹ năng; số nút lấy ra < tổng nghĩa là có vòng phụ thuộc (lỗi data) | O(V+E) |
| Gộp các khoảng buff chồng nhau, tổng thời gian có buff | Sort + gộp khoảng | Như bài gộp khoảng; hỏi "tổng độ dài hợp" thì cộng độ dài các khoảng sau gộp | O(n log n) |
| Chọn vật phẩm tối đa giá trị trong giới hạn trọng lượng túi | Knapsack 0/1 | `dp[w]` chạy `w` từ lớn xuống nhỏ (nếu chạy xuôi thì mỗi món dùng nhiều lần) | O(n·W) |

Bẫy chung của nhóm này: mô phỏng game thường yêu cầu **kết quả xác định** (cùng input cùng output), nên khi đề có "ngẫu nhiên" họ truyền sẵn dãy số hoặc seed — đừng dùng `Random` không seed. Với gacha, đề hay cho trọng số nguyên và tổng nhỏ; nếu trọng số là số thực thì quay `NextDouble() * tổng` và so với tiền tố kiểu `double`, nhớ rằng so sánh bằng với số thực không đáng tin.

## C# cho thi online

Phần lớn nền tảng (HackerRank, Codility, AtCoder, Codeforces) chấm tự động theo thời gian, nên cách đọc/ghi và chọn collection ảnh hưởng đến điểm.

### Đọc input nhanh

```csharp
// Dòng 1: n; dòng 2: n số nguyên cách nhau dấu cách
int n = int.Parse(Console.ReadLine());
int[] a = Array.ConvertAll(Console.ReadLine().Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);

// Nhiều dòng, n lớn (10^5 trở lên): StreamReader + một lần đọc
var sr = new StreamReader(Console.OpenStandardInput());
string[] tok = sr.ReadToEnd().Split(new[] { ' ', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
int idx = 0;
long NextLong() => long.Parse(tok[idx++]);

// In nhiều dòng: gom lại rồi in MỘT lần
var sb = new System.Text.StringBuilder();
for (int i = 0; i < n; i++) sb.AppendLine(a[i].ToString());
Console.Write(sb);
```

- `Console.ReadLine()` trả `null` khi hết input; vòng `while ((line = Console.ReadLine()) != null)` đọc đến hết.
- `Console.Write` từng dòng với 10^5–10^6 dòng chậm đáng kể (mỗi lần gọi là một lần flush ra stream); `StringBuilder` + một `Console.Write` là chuẩn.
- Dùng `int.Parse`, không dùng `Convert.ToInt32` trong vòng nóng; số lớn dùng `long.Parse`.
- Nền tảng kiểu Codility/LeetCode cho **chữ ký hàm có sẵn**: không đọc stdin, chỉ viết thân hàm — đọc kỹ đề xem thuộc kiểu nào.

### Kiểu số và so sánh

| Chủ đề | Quy tắc |
|---|---|
| `int` vs `long` | `int` ≈ ±2,1·10^9; tổng/tích/đếm cặp (n² với n = 10^5 là 10^10) dùng `long`. Nhân: `(long)a * b` |
| Chia và dư | `-7 / 2 = -3`, `-7 % 2 = -1` (làm tròn về 0, dư mang dấu số bị chia). Muốn dư không âm: `((x % m) + m) % m` |
| Làm tròn lên | `(a + b - 1) / b` cho số dương; `Math.Ceiling` trả `double`, mất chính xác với số lớn |
| `double` | Không so `==`; so `Math.Abs(a - b) < 1e-9`. Đề thi thích dùng số nguyên để tránh chuyện này |
| `checked` | `checked(a * b)` ném `OverflowException` thay vì tràn im lặng — hữu ích khi tự test |

### Sort và comparer

```csharp
Array.Sort(a);                                       // tăng dần, introsort O(n log n), không ổn định
Array.Sort(a, (x, y) => y.CompareTo(x));             // giảm dần
Array.Sort(keys, items);                             // sort items theo keys (hai mảng song song)
list.Sort((p, q) => p.s != q.s ? p.s.CompareTo(q.s) : q.e.CompareTo(p.e)); // nhiều khoá
var sorted = list.OrderBy(x => x.s).ThenBy(x => x.e).ToList(); // LINQ: ỔN ĐỊNH nhưng chậm hơn, cấp phát
```

- `List.Sort` và `Array.Sort` **không ổn định**; cần ổn định (giữ thứ tự phần tử bằng nhau) thì dùng `OrderBy` hoặc thêm chỉ số gốc làm khoá phụ.
- Viết comparer bằng `CompareTo`, **đừng** `return x - y`: tràn khi `x` rất lớn dương, `y` rất lớn âm, dẫn tới sort sai âm thầm.
- Comparer không nhất quán (a<b và b<a cùng đúng) có thể làm `Sort` ném `InvalidOperationException` hoặc sai.

### Chọn collection

| Cần | Dùng | Chi phí | Ghi chú |
|---|---|---|---|
| Tra theo khoá | `Dictionary<K,V>` | O(1) trung bình | Đọc khoá chưa có thì ném lỗi — dùng `TryGetValue` / `GetValueOrDefault` |
| Chỉ biết có/không, loại trùng | `HashSet<T>` | O(1) | `Add` trả `false` nếu đã có — dùng làm "đã thăm" |
| Cần thứ tự, tìm kế cận | `SortedSet<T>` | O(log n) | Có `GetViewBetween`, `Min`, `Max`; **không** cho phần tử trùng |
| Khoá có thứ tự | `SortedDictionary<K,V>` | O(log n) | Duyệt theo khoá tăng dần |
| FIFO (BFS) | `Queue<T>` | O(1) | `Dequeue` khi rỗng ném lỗi — kiểm `Count` |
| LIFO (DFS, ngoặc) | `Stack<T>` | O(1) | Thay đệ quy sâu |
| Lấy min/max liên tục | `PriorityQueue<TElement,TPriority>` | O(log n) | .NET 6+, **không có ở Unity**; min-heap |
| Danh sách động | `List<T>` | `Add` O(1) khấu hao; `Insert(0,x)`, `Remove`, `Contains` O(n) | Cấp trước `new List<T>(n)` nếu biết n |

### Tránh LINQ trong vòng nóng

- `foreach` + biến tích luỹ nhanh hơn `Sum/Max/Where/ToList` vì LINQ cấp phát iterator và delegate. Trong đề có n = 10^6, chỗ này có thể là khác biệt giữa qua và quá giờ.
- `list.Count()` (LINQ) trên `List<T>` vẫn O(1), nhưng `Where(...).Count()` là O(n) mỗi lần gọi; gọi trong vòng lặp thì thành O(n²).
- `string.Contains`, `list.Contains`, `Distinct()` trong vòng lặp: kiểm tra độ phức tạp ẩn.
- LINQ ổn cho lần chuẩn bị dữ liệu đầu hoặc bài n nhỏ; xem [[csharp-linq]] để biết cái gì tốn.

## Lộ trình ôn 5–7 ngày

Giả định bạn đã biết khái niệm, cần **tay quen lại**. Mỗi bài tự bấm giờ, không nhìn lời giải trong 25 phút đầu; kẹt quá 25 phút thì đọc gợi ý, không đọc code.

| Ngày | Chủ đề | Bài luyện (bấm giờ) | Mục tiêu |
|---|---|---|---|
| 1 | Hash map + mảng | Two Sum (10'), tìm phần tử trùng (10'), nhóm anagram (20') | Phản xạ `Dictionary.TryGetValue`; đọc/ghi stdin trơn tru |
| 2 | Two pointers + sliding window | Chuỗi con dài nhất không lặp (20'), gộp hai mảng đã sắp xếp (10'), mảng con tổng ≥ s ngắn nhất (20') | Phân biệt khi nào thu cửa sổ |
| 3 | Stack + prefix sum + sort/greedy | Ngoặc hợp lệ (10'), next greater (20'), gộp khoảng (20'), số mảng con có tổng = k (25') | Nhận ra "sort trước thì dễ" |
| 4 | Binary search + đồ thị lưới | Binary search biên trái/phải (15'), tốc độ ăn chuối (25'), đường đi ngắn nhất có tường (25'), đếm đảo (20') | Viết BFS không tra cứu; tránh off-by-one |
| 5 | DP | Fibonacci/leo cầu thang (10'), coin change (25'), LIS (25'), knapsack 0/1 (30'), đường đi lưới có chướng ngại (20') | Nói được `dp[i]` nghĩa là gì trước khi viết |
| 6 | Backtracking + thi thử | Sinh tập con/hoán vị (25'), rồi **thi thử đủ 3 câu trong 90 phút**, lấy đề trộn dạng | Thực hành chiến lược phân giờ |
| 7 | Sửa điểm yếu | Làm lại đúng dạng rớt ở ngày 6; ôn bảng nhận diện và bảng giới hạn | Nhớ dạng, không nhớ lời giải |

Chỉ có 5 ngày: gộp ngày 1 với 2, ngày 3 với 4, và bỏ ngày 7. Ưu tiên theo xác suất xuất hiện: hash map, sliding window, BFS lưới, DP cơ bản, binary search. Cấu trúc dữ liệu nền (`List`, `Dictionary`, `HashSet`, `Queue`, `Stack`) xem [[csharp-collections]]; nếu bài cho phép LINQ để gọn, đọc [[csharp-linq]] trước để biết cái gì tốn.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho luyện giải thuật**

AI ở đây là **người ra đề và người chấm**, không phải người giải hộ. Giao được: sinh đề đúng dạng, đúng giới hạn, kèm test ẩn và test biên; chấm bản của bạn bằng cách chạy thật; chỉ ra test nào làm hỏng và vì sao. Không giao: đưa lời giải ngay khi bạn kẹt — đọc lời giải làm bạn *tưởng* mình biết, đến lúc thi tay vẫn trống. Quy trình ba bước: (1) AI ra đề, giấu lời giải; (2) bạn code và nộp trong thời gian bấm giờ; (3) AI chạy test, báo kết quả, rồi mới gợi ý từng nấc (hướng → cấu trúc dữ liệu → pseudo-code → code).

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Ra đề đơn | Luyện một dạng yếu | "Ra 1 đề dạng sliding window mức vừa, chưa đưa lời giải" |
| Thi thử | Ngày 6 của lộ trình | "Mô phỏng vòng thi 3 câu dễ–vừa–khó, 90 phút, chấm cuối giờ" |
| Chấm bài | Sau khi bạn nộp | "Đây là code của tôi, chạy với test biên và báo test nào fail" |
| Gợi ý có nấc | Kẹt quá 25 phút | "Gợi ý nấc 1, chỉ hướng, không nêu cấu trúc dữ liệu" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- Ngôn ngữ và phiên bản (C# .NET 6+), có cho dùng LINQ và `PriorityQueue` không (nhiều nền tảng cũ chưa có).
- Giới hạn n và giá trị lớn nhất — nếu không nói, AI sẽ ra đề n = 10 mà thật ra thi n = 10^5, brute force vẫn qua.
- Nền tảng giả lập: đọc stdin/in stdout kiểu HackerRank, hay hàm cho sẵn chữ ký kiểu Codility, hay viết giấy.
- Dạng bài cần luyện và mức độ; dạng nào đã vững để khỏi lặp lại.
- Thời gian bấm giờ và cách chấm: đúng/sai theo test ẩn, hay có chấm cả độ phức tạp.

**Mẫu prompt**

```
Bạn là người ra đề và chấm bài thi giải thuật. Tôi luyện cho vòng thi 3 câu
(dễ–vừa–khó, 90 phút), ngôn ngữ C# .NET 6, KHÔNG dùng thư viện ngoài.

Ra 1 đề dạng: <sliding window | BFS lưới | DP 1 chiều>, mức <vừa>.
Ràng buộc đề: n tối đa 10^5, giá trị tối đa 10^9, nhập từ stdin (dòng 1 là n).

CẤM đưa lời giải hay gợi ý cấu trúc dữ liệu cho tới khi tôi nộp code.
CẤM nói tên dạng bài trong đề (tôi phải tự nhận diện).
Đề gồm: mô tả, định dạng input/output, 2 ví dụ, 5 test biên bạn giữ kín
(rỗng, 1 phần tử, toàn giống nhau, giá trị lớn nhất gây tràn int, vô nghiệm).

Khi tôi nộp code: chạy nó thật với các test (không phỏng đoán bằng mắt), báo
test nào đúng/sai, độ phức tạp thực tế, rồi chỉ MỘT lỗi quan trọng nhất.
Nếu tôi xin gợi ý: cho từng nấc (hướng -> cấu trúc dữ liệu -> pseudo-code),
mỗi nấc chờ tôi xin tiếp.
```

**Bẫy thường gặp:** AI ra đề "vừa" nhưng thật ra là bài nổi tiếng nên nó nhớ lời giải mà không kiểm — hỏi nó tự giải và chạy test trước khi giao đề. AI chấm bằng cách *đọc* code rồi khẳng định đúng; bắt nó chạy thật. AI hay để lộ tên dạng bài ngay trong đề ("cho mảng và cửa sổ…"), mất bước nhận diện — vốn là kỹ năng chính của vòng thi. Lời giải AI viết thường dùng `int` ở chỗ cần `long` hoặc `PriorityQueue` mà nền tảng thi chưa có; luôn hỏi lại hai điểm đó.

## 💻 Code

Một file C# console gồm mười chín lời giải tiêu biểu: chín bài lõi (hash map, sliding window, stack, binary search trên đáp án, BFS lưới, DFS đếm đảo, gộp khoảng, coin change, LIS) và mười bài mở rộng (two pointers, prefix sum, top-K heap, union-find, topo sort, Dijkstra, edit distance, match-3, gacha có trọng số, xoay ma trận). Mỗi bài có comment độ phức tạp; `Main` in `OK`/`FAIL` cho từng ca kiểm. Chạy bằng .NET 6 trở lên (cần `PriorityQueue`); trên Unity thay bằng heap tự viết.

**Setup**

```
dotnet new console -n Algo
cd Algo
# thay Program.cs bằng file bên dưới, rồi:
dotnet run
```

**Script**

```csharp
// Program.cs — dotnet new console -n Algo ; thay Program.cs bằng file này ; dotnet run
using System;
using System.Collections.Generic;
using System.Linq;

public static class Program
{
    // 1) Two Sum — hash map. Thời gian O(n), bộ nhớ O(n).
    static int[] TwoSum(int[] a, int target)
    {
        var seen = new Dictionary<int, int>(); // giá trị -> chỉ số
        for (int i = 0; i < a.Length; i++)
        {
            if (seen.TryGetValue(target - a[i], out int j)) return new[] { j, i };
            seen[a[i]] = i; // thêm SAU khi kiểm, để không ghép phần tử với chính nó
        }
        return Array.Empty<int>();
    }

    // 2) Chuỗi con dài nhất không lặp ký tự — sliding window. O(n) thời gian, O(k) bộ nhớ (k = bảng chữ).
    static int LongestUnique(string s)
    {
        var last = new Dictionary<char, int>(); // ký tự -> vị trí xuất hiện gần nhất
        int best = 0, left = 0;
        for (int right = 0; right < s.Length; right++)
        {
            if (last.TryGetValue(s[right], out int p) && p >= left) left = p + 1; // thu cửa sổ
            last[s[right]] = right;
            best = Math.Max(best, right - left + 1);
        }
        return best;
    }

    // 3) Ngoặc hợp lệ — stack. O(n) thời gian, O(n) bộ nhớ.
    static bool ValidParentheses(string s)
    {
        var st = new Stack<char>();
        foreach (char c in s)
        {
            if (c == '(' || c == '[' || c == '{') st.Push(c);
            else
            {
                if (st.Count == 0) return false; // đóng thừa
                char o = st.Pop();
                if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;
            }
        }
        return st.Count == 0; // mở thừa
    }

    // 4) Binary search trên đáp án — tốc độ ăn chuối tối thiểu để xong trong h giờ.
    // O(n log M) với M = max(piles), O(1) bộ nhớ. Điều kiện: "đủ nhanh" đơn điệu theo tốc độ.
    static int MinEatingSpeed(int[] piles, int h)
    {
        int lo = 1, hi = piles.Max();
        while (lo < hi)
        {
            int mid = lo + (hi - lo) / 2;
            long hours = 0; // long: n lớn + pile lớn dễ tràn int
            foreach (int p in piles) hours += (p + mid - 1) / mid; // làm tròn lên
            if (hours <= h) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    // 5) BFS lưới — đường ngắn nhất từ (0,0) tới góc đối diện, '#' là tường. O(R*C) thời gian và bộ nhớ.
    static int ShortestPath(string[] grid)
    {
        int R = grid.Length, C = grid[0].Length;
        if (grid[0][0] == '#' || grid[R - 1][C - 1] == '#') return -1;
        var dist = new int[R, C];
        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) dist[r, c] = -1;
        var q = new Queue<(int r, int c)>();
        dist[0, 0] = 0; q.Enqueue((0, 0));
        int[] dr = { 1, -1, 0, 0 }, dc = { 0, 0, 1, -1 };
        while (q.Count > 0)
        {
            var (r, c) = q.Dequeue();
            if (r == R - 1 && c == C - 1) return dist[r, c];
            for (int k = 0; k < 4; k++)
            {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
                if (grid[nr][nc] == '#' || dist[nr, nc] != -1) continue;
                dist[nr, nc] = dist[r, c] + 1; // đánh dấu lúc ĐẨY vào hàng đợi, không phải lúc lấy ra
                q.Enqueue((nr, nc));
            }
        }
        return -1;
    }

    // 6) Đếm đảo — DFS bằng stack tường minh (tránh tràn call stack trên lưới lớn). O(R*C).
    static int CountIslands(string[] grid)
    {
        int R = grid.Length, C = grid[0].Length, count = 0;
        var seen = new bool[R, C];
        int[] dr = { 1, -1, 0, 0 }, dc = { 0, 0, 1, -1 };
        for (int r0 = 0; r0 < R; r0++)
            for (int c0 = 0; c0 < C; c0++)
            {
                if (grid[r0][c0] != '1' || seen[r0, c0]) continue;
                count++;
                var st = new Stack<(int, int)>();
                st.Push((r0, c0)); seen[r0, c0] = true;
                while (st.Count > 0)
                {
                    var (r, c) = st.Pop();
                    for (int k = 0; k < 4; k++)
                    {
                        int nr = r + dr[k], nc = c + dc[k];
                        if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
                        if (grid[nr][nc] != '1' || seen[nr, nc]) continue;
                        seen[nr, nc] = true; st.Push((nr, nc));
                    }
                }
            }
        return count;
    }

    // 7) Gộp khoảng — sort + greedy. O(n log n) thời gian (do sort), O(n) bộ nhớ.
    static List<(int s, int e)> MergeIntervals(List<(int s, int e)> a)
    {
        var res = new List<(int s, int e)>();
        foreach (var iv in a.OrderBy(x => x.s))
        {
            if (res.Count > 0 && iv.s <= res[^1].e) // chạm nhau tính là gộp
                res[^1] = (res[^1].s, Math.Max(res[^1].e, iv.e));
            else res.Add(iv);
        }
        return res;
    }

    // 8) Coin change — DP 1 chiều, số xu ít nhất. O(amount * số loại xu), O(amount) bộ nhớ.
    static int CoinChange(int[] coins, int amount)
    {
        const int INF = int.MaxValue / 2; // /2 để INF + 1 không tràn
        var dp = new int[amount + 1];
        Array.Fill(dp, INF); dp[0] = 0;
        for (int x = 1; x <= amount; x++)
            foreach (int c in coins)
                if (c <= x && dp[x - c] + 1 < dp[x]) dp[x] = dp[x - c] + 1;
        return dp[amount] >= INF ? -1 : dp[amount];
    }

    // 9) LIS — dãy con tăng dài nhất, patience sorting. O(n log n) thời gian, O(n) bộ nhớ.
    static int Lis(int[] a)
    {
        var tails = new List<int>(); // tails[i] = đuôi nhỏ nhất của dãy tăng độ dài i+1
        foreach (int x in a)
        {
            int lo = 0, hi = tails.Count; // lower_bound: vị trí đầu tiên >= x (tăng nghiêm ngặt)
            while (lo < hi) { int m = (lo + hi) / 2; if (tails[m] < x) lo = m + 1; else hi = m; }
            if (lo == tails.Count) tails.Add(x); else tails[lo] = x;
        }
        return tails.Count;
    }

    // 10) Two pointers — mảng ĐÃ sort, đếm cặp (i<j) có tổng <= k. O(n) sau sort, O(1) bộ nhớ.
    static int PairsAtMost(int[] a, int k)
    {
        int l = 0, r = a.Length - 1, count = 0;
        while (l < r)
        {
            if (a[l] + a[r] <= k) { count += r - l; l++; } // a[l] ghép được với mọi phần tử từ l+1..r
            else r--;
        }
        return count;
    }

    // 11) Prefix sum + hash — đếm mảng con liên tiếp có tổng = k (số âm vẫn đúng). O(n), O(n) bộ nhớ.
    static int SubarraySumK(int[] a, int k)
    {
        var freq = new Dictionary<long, int> { [0] = 1 }; // tiền tố rỗng có tổng 0
        long pre = 0; int count = 0;
        foreach (int x in a)
        {
            pre += x;
            if (freq.TryGetValue(pre - k, out int c)) count += c; // đoạn kết thúc ở đây = pre - (pre-k)
            freq[pre] = freq.GetValueOrDefault(pre) + 1;
        }
        return count;
    }

    // 12) Top-K phần tử lớn nhất — min-heap kích thước k. O(n log k), O(k) bộ nhớ.
    // PriorityQueue có từ .NET 6; Unity KHÔNG có -> tự viết heap hoặc dùng SortedSet (xem csharp-interview-kit).
    static int[] TopK(int[] a, int k)
    {
        var pq = new PriorityQueue<int, int>(); // min-heap: đỉnh là phần tử NHỎ nhất trong top-k
        foreach (int x in a)
        {
            pq.Enqueue(x, x);
            if (pq.Count > k) pq.Dequeue(); // đẩy phần tử nhỏ nhất ra
        }
        var res = new List<int>();
        while (pq.Count > 0) res.Add(pq.Dequeue());
        res.Reverse();
        return res.ToArray();
    }

    // 13) Union-Find — đếm thành phần liên thông. Gần O(n·α(n)) nhờ path compression + union by size.
    class DSU
    {
        readonly int[] parent, size;
        public int Components;
        public DSU(int n)
        {
            parent = new int[n]; size = new int[n]; Components = n;
            for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
        }
        public int Find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
        public bool Union(int a, int b)
        {
            a = Find(a); b = Find(b);
            if (a == b) return false;
            if (size[a] < size[b]) (a, b) = (b, a);
            parent[b] = a; size[a] += size[b]; Components--;
            return true;
        }
    }
    static int CountComponents(int n, int[][] edges)
    {
        var d = new DSU(n);
        foreach (var e in edges) d.Union(e[0], e[1]);
        return d.Components;
    }

    // 14) Topological sort (Kahn) — thứ tự học môn; rỗng nếu có chu trình. O(V+E).
    static List<int> TopoSort(int n, int[][] deps) // deps[i] = {before, after}
    {
        var adj = new List<int>[n]; var indeg = new int[n];
        for (int i = 0; i < n; i++) adj[i] = new List<int>();
        foreach (var d in deps) { adj[d[0]].Add(d[1]); indeg[d[1]]++; }
        var q = new Queue<int>();
        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.Enqueue(i);
        var order = new List<int>();
        while (q.Count > 0)
        {
            int u = q.Dequeue(); order.Add(u);
            foreach (int v in adj[u]) if (--indeg[v] == 0) q.Enqueue(v);
        }
        return order.Count == n ? order : new List<int>(); // chưa đủ n nút = còn chu trình
    }

    // 15) Dijkstra — đường ngắn nhất, cạnh không âm. O((V+E) log V) với heap.
    static long[] Dijkstra(int n, List<(int to, int w)>[] adj, int src)
    {
        var dist = new long[n];
        Array.Fill(dist, long.MaxValue); dist[src] = 0;
        var pq = new PriorityQueue<int, long>();
        pq.Enqueue(src, 0);
        while (pq.TryDequeue(out int u, out long d))
        {
            if (d > dist[u]) continue; // bản ghi cũ (lazy deletion)
            foreach (var (v, w) in adj[u])
                if (d + w < dist[v]) { dist[v] = d + w; pq.Enqueue(v, dist[v]); }
        }
        return dist;
    }

    // 16) Edit distance — DP chuỗi 2 chiều. O(m·n) thời gian, O(m·n) bộ nhớ (cuộn hàng còn O(n)).
    static int EditDistance(string a, string b)
    {
        var dp = new int[a.Length + 1, b.Length + 1];
        for (int i = 0; i <= a.Length; i++) dp[i, 0] = i; // xoá hết a
        for (int j = 0; j <= b.Length; j++) dp[0, j] = j; // chèn hết b
        for (int i = 1; i <= a.Length; i++)
            for (int j = 1; j <= b.Length; j++)
                dp[i, j] = a[i - 1] == b[j - 1]
                    ? dp[i - 1, j - 1]
                    : 1 + Math.Min(dp[i - 1, j - 1], Math.Min(dp[i - 1, j], dp[i, j - 1])); // thay / xoá / chèn
        return dp[a.Length, b.Length];
    }

    // 17) Match-3 — tìm mọi ô thuộc dãy >= 3 giống nhau theo hàng hoặc cột. O(R*C). 0 = ô trống.
    static bool[,] FindMatches(int[,] g)
    {
        int R = g.GetLength(0), C = g.GetLength(1);
        var mark = new bool[R, C];
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; )
            {
                int e = c;
                while (e < C && g[r, e] == g[r, c]) e++;           // [c, e) là một dãy cùng loại
                if (e - c >= 3 && g[r, c] != 0) for (int k = c; k < e; k++) mark[r, k] = true;
                c = e;
            }
        for (int c = 0; c < C; c++)
            for (int r = 0; r < R; )
            {
                int e = r;
                while (e < R && g[e, c] == g[r, c]) e++;
                if (e - r >= 3 && g[r, c] != 0) for (int k = r; k < e; k++) mark[k, c] = true;
                r = e;
            }
        return mark;
    }

    // 18) Gacha có trọng số — prefix sum + binary search. Dựng O(n), mỗi lần quay O(log n).
    class Gacha
    {
        readonly long[] pre; // pre[i] = tổng trọng số của i+1 món đầu
        public Gacha(int[] weights)
        {
            pre = new long[weights.Length]; long s = 0;
            for (int i = 0; i < weights.Length; i++) { s += weights[i]; pre[i] = s; }
        }
        public long Total => pre[^1];
        public int Pick(long roll) // roll trong [0, Total)
        {
            int lo = 0, hi = pre.Length - 1;
            while (lo < hi) { int mid = lo + (hi - lo) / 2; if (pre[mid] > roll) hi = mid; else lo = mid + 1; }
            return lo; // phần tử đầu tiên có pre > roll
        }
    }

    // 19) Xoay ma trận vuông 90 độ cùng chiều kim đồng hồ TẠI CHỖ — transpose rồi đảo mỗi hàng. O(n²), O(1) bộ nhớ.
    static void RotateRight(int[,] m)
    {
        int n = m.GetLength(0);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) (m[i, j], m[j, i]) = (m[j, i], m[i, j]);
        for (int i = 0; i < n; i++)
            for (int l = 0, r = n - 1; l < r; l++, r--) (m[i, l], m[i, r]) = (m[i, r], m[i, l]);
    }

    static void Check(string name, object got, object want)
    {
        bool ok = got.ToString() == want.ToString();
        Console.WriteLine($"{(ok ? "OK  " : "FAIL")} {name}: {got}");
    }

    public static void Main()
    {
        Check("TwoSum [2,7,11,15] t=9", string.Join(",", TwoSum(new[] { 2, 7, 11, 15 }, 9)), "0,1");
        Check("LongestUnique abcabcbb", LongestUnique("abcabcbb"), 3);
        Check("LongestUnique abba", LongestUnique("abba"), 2);
        Check("Parentheses ([]{})", ValidParentheses("([]{})"), true);
        Check("Parentheses (]", ValidParentheses("(]"), false);
        Check("MinEatingSpeed [3,6,7,11] h=8", MinEatingSpeed(new[] { 3, 6, 7, 11 }, 8), 4);
        Check("ShortestPath 3x3", ShortestPath(new[] { "..#", "#..", "..." }), 4);
        Check("ShortestPath bị chặn", ShortestPath(new[] { ".#", "#." }), -1);
        Check("CountIslands", CountIslands(new[] { "11000", "11000", "00100", "00011" }), 3);
        var merged = MergeIntervals(new List<(int, int)> { (1, 3), (8, 10), (2, 6), (15, 18), (17, 20) });
        Check("MergeIntervals", string.Join(" ", merged.Select(x => $"[{x.s},{x.e}]")), "[1,6] [8,10] [15,20]");
        Check("CoinChange [1,2,5] 11", CoinChange(new[] { 1, 2, 5 }, 11), 3);
        Check("CoinChange [2] 3", CoinChange(new[] { 2 }, 3), -1);
        Check("LIS [10,9,2,5,3,7,101,18]", Lis(new[] { 10, 9, 2, 5, 3, 7, 101, 18 }), 4);
        Check("PairsAtMost [1,2,3,4,5] k=6", PairsAtMost(new[] { 1, 2, 3, 4, 5 }, 6), 6);
        Check("SubarraySumK [1,-1,0] k=0", SubarraySumK(new[] { 1, -1, 0 }, 0), 3);
        Check("SubarraySumK [1,2,3] k=3", SubarraySumK(new[] { 1, 2, 3 }, 3), 2);
        Check("TopK [5,1,9,3,7] k=3", string.Join(",", TopK(new[] { 5, 1, 9, 3, 7 }, 3)), "9,7,5");
        Check("UnionFind 5 nút 2 cạnh", CountComponents(5, new[] { new[] { 0, 1 }, new[] { 3, 4 } }), 3);
        Check("TopoSort 4 môn", string.Join(",", TopoSort(4, new[] { new[] { 0, 1 }, new[] { 1, 2 }, new[] { 0, 3 } })), "0,1,3,2");
        Check("TopoSort chu trình", TopoSort(2, new[] { new[] { 0, 1 }, new[] { 1, 0 } }).Count, 0);
        var adj = new List<(int, int)>[4];
        for (int i = 0; i < 4; i++) adj[i] = new List<(int, int)>();
        adj[0].Add((1, 4)); adj[0].Add((2, 1)); adj[2].Add((1, 2)); adj[1].Add((3, 5));
        Check("Dijkstra 0->3", Dijkstra(4, adj, 0)[3], 8);
        Check("EditDistance kitten sitting", EditDistance("kitten", "sitting"), 3);
        Check("EditDistance rỗng", EditDistance("", "abc"), 3);
        var board = new[,] { { 1, 1, 1, 2 }, { 2, 3, 2, 2 }, { 3, 3, 2, 1 }, { 1, 3, 1, 1 } };
        var mk = FindMatches(board); int cnt = 0;
        foreach (bool b in mk) if (b) cnt++;
        Check("Match-3 số ô bị ăn", cnt, 6);
        var gacha = new Gacha(new[] { 50, 30, 15, 5 });
        Check("Gacha roll 0/49/50/79/80/99", string.Join(",", new[] { 0L, 49, 50, 79, 80, 99 }.Select(x => gacha.Pick(x))), "0,0,1,1,2,3");
        var mat = new[,] { { 1, 2, 3 }, { 4, 5, 6 }, { 7, 8, 9 } };
        RotateRight(mat);
        Check("RotateRight 3x3", $"{mat[0, 0]}{mat[0, 1]}{mat[0, 2]} {mat[1, 0]}{mat[1, 1]}{mat[1, 2]} {mat[2, 0]}{mat[2, 1]}{mat[2, 2]}", "741 852 963");
    }
}
```

**Chạy thử**
- Chạy `dotnet run` (nếu console hiện sai dấu tiếng Việt thì đặt `chcp 65001` trước). Phải ra đúng 26 dòng, tất cả bắt đầu bằng `OK`:

```
OK   TwoSum [2,7,11,15] t=9: 0,1
OK   LongestUnique abcabcbb: 3
OK   LongestUnique abba: 2
OK   Parentheses ([]{}): True
OK   Parentheses (]: False
OK   MinEatingSpeed [3,6,7,11] h=8: 4
OK   ShortestPath 3x3: 4
OK   ShortestPath bị chặn: -1
OK   CountIslands: 3
OK   MergeIntervals: [1,6] [8,10] [15,20]
OK   CoinChange [1,2,5] 11: 3
OK   CoinChange [2] 3: -1
OK   LIS [10,9,2,5,3,7,101,18]: 4
OK   PairsAtMost [1,2,3,4,5] k=6: 6
OK   SubarraySumK [1,-1,0] k=0: 3
OK   SubarraySumK [1,2,3] k=3: 2
OK   TopK [5,1,9,3,7] k=3: 9,7,5
OK   UnionFind 5 nút 2 cạnh: 3
OK   TopoSort 4 môn: 0,1,3,2
OK   TopoSort chu trình: 0
OK   Dijkstra 0->3: 8
OK   EditDistance kitten sitting: 3
OK   EditDistance rỗng: 3
OK   Match-3 số ô bị ăn: 6
OK   Gacha roll 0/49/50/79/80/99: 0,0,1,1,2,3
OK   RotateRight 3x3: 741 852 963
```

- Phá thử để thấy vì sao có comment: trong `TwoSum` đảo hai dòng (thêm vào `seen` trước khi kiểm) rồi chạy `TwoSum([3,2,4], 6)` — nó sẽ ghép `3` với chính nó. Trong `LongestUnique` bỏ điều kiện `p >= left` thì ca `abba` trả 3 thay vì 2. Trong `SubarraySumK` đổi khởi tạo thành `new Dictionary<long,int>()` (bỏ `[0] = 1`) thì ca `[1,2,3]` k=3 trả 1 thay vì 2. Trong `Gacha.Pick` đổi `pre[mid] > roll` thành `>=` thì roll = 50 rơi nhầm vào món đầu.
- `PriorityQueue` ở bài `TopK` và `Dijkstra` chạy trên .NET 6+; Unity không có, nên nếu thi bằng môi trường Unity phải thay bằng heap tự viết.
- Tự viết lại từng hàm không nhìn, rồi so với bản này; bài nào quá 25 phút thì đánh dấu để ôn lại ở ngày 7.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Tìm hai số trong mảng có tổng bằng k. Làm sao tránh O(n²)?**
  → Dùng `Dictionary` ghi các giá trị đã gặp, mỗi phần tử tra xem `k - x` có trong đó chưa; được O(n) thời gian, đổi lại O(n) bộ nhớ. Vì kiểm trước rồi mới thêm nên không ghép một phần tử với chính nó. Nếu mảng đã sắp xếp thì two pointers cho O(n) mà không cần bộ nhớ phụ.
- `Junior` **Kiểm tra chuỗi ngoặc `([]{})` hợp lệ. Dùng cấu trúc gì, vì sao?**
  → Dùng stack: gặp ngoặc mở thì đẩy, gặp ngoặc đóng thì lấy ra và so khớp loại. Stack hợp vì ngoặc mở gần nhất phải đóng trước (vào sau ra trước). Cuối cùng stack phải rỗng, vì còn dư là có ngoặc mở chưa đóng; và đóng khi stack rỗng cũng là sai.
- `Junior` **Sliding window khác two pointers ở chỗ nào?**
  → Sliding window là hai con trỏ cùng chiều tạo thành một đoạn liên tiếp, mở rộng bên phải và thu bên trái khi vi phạm điều kiện, dùng cho bài "đoạn con dài/ngắn nhất". Two pointers tổng quát thường xuất phát hai đầu mảng đã sắp xếp và tiến vào giữa. Cả hai đều O(n) vì mỗi con trỏ chỉ đi một chiều, không bao giờ lùi.
- `Junior` **Phát hiện phần tử trùng trong mảng: nêu ba cách và so sánh.**
  → Hai vòng lồng là O(n²) thời gian, O(1) bộ nhớ; sort rồi so hàng xóm là O(n log n), O(1) bộ nhớ nếu sort tại chỗ; `HashSet` là O(n) thời gian nhưng O(n) bộ nhớ. Tôi chọn `HashSet` khi n lớn và bộ nhớ dư, vì `Add` trả `false` ngay khi gặp trùng nên còn dừng sớm được. Chọn sort khi đề cấm bộ nhớ phụ.
- `Junior` **Vì sao `int` dễ sai trong bài đếm cặp hoặc cộng tổng, và sửa thế nào?**
  → `int` chỉ chứa tới khoảng 2,1 tỉ, mà với n = 10^5 số đếm cặp đã là 5·10^9 và tổng 10^5 số cỡ 10^5 là 10^10. Tôi khai báo biến tích luỹ là `long` từ đầu và ép kiểu trước khi nhân, `(long)a * b`, vì `(long)(a * b)` đã tràn xong rồi mới ép. Test biên luôn có một ca giá trị lớn nhất để bắt lỗi này.
- `Junior` **Khi nào dùng `HashSet`, khi nào `List`, khi nào `Dictionary`?**
  → `List` khi cần giữ thứ tự và truy cập theo chỉ số; `HashSet` khi chỉ cần biết "có hay chưa" và loại trùng; `Dictionary` khi cần gắn dữ liệu (đếm, chỉ số) với khoá. Lý do chọn là chi phí: `List.Contains` là O(n) còn `HashSet.Contains` và `Dictionary.TryGetValue` trung bình O(1). Nhét `Contains` của `List` vào vòng lặp là cách phổ biến nhất biến O(n) thành O(n²).
- `Mid` **Đường đi ngắn nhất trên lưới có tường: vì sao BFS mà không DFS?**
  → Mọi bước có giá như nhau nên BFS duyệt theo từng lớp khoảng cách, lần đầu chạm đích chính là đường ngắn nhất. DFS đi sâu một nhánh và có thể tới đích bằng đường dài trước. Độ phức tạp O(R·C); chú ý đánh dấu đã thăm lúc đẩy vào hàng đợi, không phải lúc lấy ra, nếu không một ô bị đẩy nhiều lần.
- `Mid` **Binary search trên đáp án là gì? Cho ví dụ.**
  → Khi đáp án là một số và có hàm kiểm "với giá trị x thì đủ chưa" đơn điệu, ta chặt nhị phân trên chính x thay vì trên mảng. Ví dụ tốc độ ăn chuối tối thiểu để xong trong h giờ: tốc độ càng cao càng dễ xong, nên thử mid rồi thu một nửa, tổng O(n log M). Điều kiện bắt buộc là tính đơn điệu; không có nó thì chặt nhị phân sai.
- `Mid` **Bài nhận n = 10^5 mà bạn đang có lời giải O(n²). Làm gì?**
  → 10^5 bình phương là 10^10 phép, quá giới hạn khoảng 10^8–10^9 phép mỗi giây của một bài thi, nên phải xuống O(n log n) hoặc O(n). Tôi tìm xem vòng lồng bên trong có thay được bằng tra cứu hash, con trỏ thứ hai, binary search hoặc prefix sum không. Nếu chưa nghĩ ra, tôi nộp bản O(n²) để ăn test nhỏ rồi quay lại sau.
- `Mid` **Coin change: định nghĩa `dp[x]` và công thức chuyển là gì?**
  → `dp[x]` là số xu ít nhất để đổi đúng số tiền x; `dp[0] = 0`, còn lại khởi tạo vô cực. Với mỗi loại xu c ≤ x thì `dp[x] = min(dp[x], dp[x - c] + 1)`. Độ phức tạp O(amount · số loại xu). Khởi tạo vô cực bằng `int.MaxValue / 2` để cộng một không tràn, và cuối cùng còn vô cực thì trả -1.
- `Mid` **Đếm số mảng con liên tiếp có tổng bằng k, mảng có cả số âm. Sliding window dùng được không?**
  → Không, vì có số âm thì thêm phần tử không còn làm tổng tăng đơn điệu, nên không biết lúc nào thu cửa sổ. Dùng prefix sum kèm `Dictionary` đếm tần suất các tổng tiền tố: mỗi vị trí cộng `freq[pre - k]`, khởi tạo `freq[0] = 1`. Được O(n) thời gian và O(n) bộ nhớ.
- `Mid` **Tìm K phần tử lớn nhất của mảng n phần tử. Có những cách nào, chọn cách nào?**
  → Sort cả mảng là O(n log n); min-heap kích thước K là O(n log K); quickselect là O(n) trung bình nhưng O(n²) xấu nhất. Tôi chọn min-heap khi K nhỏ hoặc dữ liệu đến dạng luồng, vì chỉ giữ K phần tử trong bộ nhớ; K gần n thì sort cho đơn giản. Phải là min-heap chứ không phải max-heap, vì cần loại ngay phần tử nhỏ nhất khi heap vượt K.
- `Mid` **Nhóm các từ là anagram của nhau. Khoá của `Dictionary` là gì?**
  → Khoá chuẩn là chuỗi sau khi sort các ký tự, hoặc chuỗi ghép từ mảng đếm 26 ô. Cách đếm là O(L) mỗi từ so với O(L log L) của sort, nhưng sort ngắn gọn hơn khi gõ trong giờ thi. Không dùng `int[]` làm khoá vì C# so sánh mảng theo tham chiếu, hai mảng bằng nội dung vẫn là hai khoá khác nhau.
- `Mid` **BFS và Dijkstra khác nhau thế nào, chọn khi nào?**
  → BFS đúng khi mọi cạnh cùng giá, dùng queue và O(V+E). Cạnh có trọng số khác nhau nhưng không âm thì cần Dijkstra, dùng min-heap theo khoảng cách, O((V+E) log V). Vì BFS coi mọi bước như nhau nên trên lưới có địa hình tốn kém khác nhau nó trả đường ít bước nhất chứ không phải rẻ nhất; cạnh âm thì cả hai đều sai, phải dùng Bellman-Ford.
- `Mid` **Union-Find để làm gì, độ phức tạp ra sao, khác BFS đếm thành phần liên thông chỗ nào?**
  → Union-Find trả lời "hai nút cùng nhóm chưa" và gộp nhóm gần O(1) mỗi thao tác nhờ nén đường và gộp theo kích thước. Nó vượt BFS khi cạnh đến dần dần, vì BFS phải chạy lại từ đầu mỗi lần thêm cạnh. Nếu đồ thị cho sẵn một lần thì BFS/DFS cũng đủ và đơn giản hơn.
- `Mid` **Phát hiện chu trình phụ thuộc giữa các module/skill bằng cách nào?**
  → Dùng topological sort theo Kahn: tính bậc vào, lấy dần các nút bậc 0 và giảm bậc các nút kề. Nếu số nút lấy ra ít hơn tổng số nút thì có chu trình, vì các nút trong vòng không bao giờ về bậc 0. Độ phức tạp O(V+E), và nó cho luôn thứ tự build hợp lệ khi không có chu trình.
- `Mid` **Edit distance: định nghĩa trạng thái, công thức và cách giảm bộ nhớ.**
  → `dp[i][j]` là số thao tác tối thiểu biến `i` ký tự đầu của A thành `j` ký tự đầu của B. Nếu hai ký tự cuối bằng nhau thì `dp[i-1][j-1]`, ngược lại `1 + min` của thay, xoá, chèn; cơ sở `dp[i][0] = i`, `dp[0][j] = j`. Mỗi ô chỉ phụ thuộc hàng trước và ô bên trái nên cuộn hàng được, từ O(m·n) xuống O(n) bộ nhớ, nhưng mất khả năng dựng lại dãy thao tác.
- `Mid` **Đọc input 10^6 số trong C# sao cho không bị quá giờ?**
  → Đọc cả luồng một lần bằng `StreamReader` rồi `Split` với `RemoveEmptyEntries`, và gom output vào `StringBuilder` in một lần. Gọi `Console.WriteLine` một triệu lần chậm vì mỗi lần là một lần ghi ra stream. Parse bằng `int.Parse` hoặc `long.Parse` thẳng, tránh LINQ trong đường đọc.
- `Mid` **Câu game: tìm mọi ô thuộc dãy từ 3 viên cùng loại trở lên trên bảng match-3.**
  → Quét từng hàng rồi từng cột, gom các dãy liên tiếp cùng giá trị, dãy dài từ 3 thì đánh dấu vào mảng `bool` riêng. Phải đánh dấu rồi mới xoá hàng loạt, vì xoá ngay trong lúc quét sẽ phá các dãy chữ L, chữ T giao nhau chưa kịp tính. Độ phức tạp O(R·C), và phải bỏ qua ô trống khi so sánh.
- `Mid` **Câu game: gộp các item cùng loại vào ô túi, mỗi ô tối đa 99.**
  → Dùng `Dictionary` cộng tổng số lượng theo id, rồi mỗi id sinh `tổng / 99` ô đầy và một ô dư nếu `tổng % 99 > 0`. Cộng gộp trước rồi chia mới đúng, vì chia từng stack cũ rồi ghép lại dễ để lại nhiều ô dư lẻ. Giữ thứ tự xuất hiện lần đầu của id nếu đề yêu cầu kết quả ổn định.
- `Senior` **Bốc thăm gacha có trọng số: thiết kế sao cho mỗi lần quay nhanh.**
  → Dựng mảng tiền tố trọng số một lần O(n), mỗi lần quay sinh số nguyên trong `[0, tổng)` rồi binary search phần tử đầu tiên có tiền tố lớn hơn số quay, tức O(log n). Cách duyệt tuyến tính mỗi lần là O(n) và chậm khi bảng có hàng nghìn món. Chú ý dùng `>` chứ không `>=` để giữ xác suất đúng theo trọng số, và dùng `long` nếu tổng trọng số lớn.
- `Senior` **LIS làm O(n²) được rồi, sao còn cần O(n log n)?**
  → Bản O(n²) với `dp[i]` là độ dài dãy tăng dài nhất kết thúc ở i, chạy được tới n khoảng 5 000. Với n = 10^5 phải dùng mảng `tails`, trong đó `tails[k]` là đuôi nhỏ nhất của mọi dãy tăng độ dài k+1; mỗi phần tử tìm vị trí bằng binary search nên O(n log n). Mảng `tails` không phải dãy con thật, chỉ cho đúng độ dài.
- `Senior` **Backtracking bị chậm thì cải thiện bằng cách nào?**
  → Cắt tỉa sớm: bỏ nhánh khi biết chắc không thể tốt hơn đáp án hiện có, hoặc sort đầu vào để dừng khi tổng đã vượt. Nếu các bài toán con lặp lại thì thêm memo thành DP, vì khi đó số trạng thái thật sự đếm được. Còn không, tôi ước lượng số nhánh (ví dụ 2^n) để biết n tối đa mà cách này chịu nổi.
- `Senior` **Gộp các khoảng chồng nhau: cách làm và độ phức tạp?**
  → Sort theo đầu mút trái, rồi quét một lượt: nếu khoảng mới bắt đầu không vượt quá đầu mút phải của khoảng cuối trong kết quả thì kéo dài khoảng cuối, ngược lại thêm khoảng mới. Sort quyết định O(n log n), phần quét chỉ O(n). Phải chốt với đề xem hai khoảng chỉ chạm tại một điểm như `[1,3]` và `[3,5]` có tính là chồng nhau không.
- `Senior` **Đề cho đường đi ngắn nhất trên lưới 1000×1000 với chi phí từng ô. Chọn thuật toán nào?**
  → Có 10^6 nút nên cần Dijkstra với min-heap, O(RC log RC) khoảng 2·10^7 phép, qua giờ thoải mái; Floyd–Warshall O(n³) hay O(V²) đều chết. Nếu chi phí chỉ có vài giá trị nhỏ (1, 2, 3) thì 0-1 BFS hoặc bucket queue còn nhanh hơn. Tôi dùng `long` cho khoảng cách và bỏ qua bản ghi cũ trong heap (`d > dist[u]`) vì heap của .NET không có thao tác giảm khoá.
- `Senior` **Tối ưu thêm được không: DP đếm đường đi trên lưới R×C dùng O(R·C) bộ nhớ?**
  → Được: `dp[r][c]` chỉ phụ thuộc hàng trên và ô bên trái nên một mảng một chiều dài C là đủ, cập nhật tại chỗ `dp[c] += dp[c-1]`, giảm bộ nhớ xuống O(C). Cái giá là không dựng lại được đường đi cụ thể. Nếu đề đòi chia dư 10^9+7 thì thêm `%` sau mỗi phép cộng, vì cộng dồn nhiều lần sẽ tràn `long`.
- `Senior` **Xoay ma trận vuông n×n 90 độ tại chỗ, và nếu ma trận chữ nhật thì sao?**
  → Vuông: transpose rồi đảo từng hàng, O(n²) thời gian và O(1) bộ nhớ, vì mỗi ô chỉ hoán đổi với ô đối xứng. Chữ nhật R×C thì kích thước đổi thành C×R nên không làm tại chỗ được, phải tạo mảng mới và gán `new[c, R-1-r] = old[r, c]`. Xoay ngược chiều thì đảo hàng trước rồi transpose, hoặc đảo cột sau transpose.
- `Senior` **Khi nào bạn thà nộp bản chậm mà đúng còn hơn tối ưu tiếp?**
  → Khi thời gian còn lại ít hơn thời gian ước tính để tối ưu và rà lỗi, vì bản chậm đúng ăn điểm các test nhỏ còn bản tối ưu dở dang ăn 0. Tôi nộp bản đúng, ghi comment độ phức tạp thực tế, rồi nếu còn giờ mới quay lại tối ưu trên một bản sao. Đề dạy quyết định này quan trọng ngang bản thân thuật toán, vì thi là bài toán phân bổ giờ.
- `Senior` **Unity không có `PriorityQueue`, bạn cần Dijkstra hay A* trong game thì làm gì?**
  → Tự viết binary heap trên mảng (đẩy lên, chìm xuống, O(log n)), hoặc dùng `SortedSet<(cost, id)>` với `id` làm khoá phá hoà vì `SortedSet` không chứa phần tử trùng. Heap mảng nhanh và ít cấp phát hơn; `SortedSet` cấp phát nút cho mỗi phần tử nên gây GC. Trong gameplay chạy mỗi frame, tránh cấp phát nên heap tự viết với mảng tái sử dụng là lựa chọn đúng.

**Khung trả lời 60 giây** — "Anh tiếp cận một bài thuật toán lạ thế nào?"

> Việc đầu tiên tôi đọc kỹ đề và nhìn giới hạn n, vì giới hạn cho biết độ phức tạp tối đa: n tới 10^5 thì tôi cần O(n log n) trở xuống. Tiếp đó tôi thử một ví dụ nhỏ bằng tay và viết bản brute force trước, để chắc mình hiểu đề và có bản đúng để đối chiếu. Rồi tôi tự hỏi bài giống dạng nào đã biết: có chuỗi liên tiếp thì sliding window, có "ngắn nhất" trên lưới thì BFS, có "số cách" hay "tối thiểu" với bài toán con lặp thì DP. Tôi nói ra cấu trúc dữ liệu định dùng và độ phức tạp trước khi gõ. Gõ xong, tôi tự chạy các ca biên: rỗng, một phần tử, tràn int, vô nghiệm, vì phần lớn điểm mất ở đó chứ không ở ý tưởng chính.

**Họ sẽ đào tiếp**

- *"Độ phức tạp thời gian và bộ nhớ của lời giải là bao nhiêu?"* → Phải nêu cả hai, chỉ ra vòng nào đóng góp bậc cao nhất, và nói được cái gì bị đổi lấy cái gì (hash đổi bộ nhớ lấy thời gian).
- *"Có cách nào dùng ít bộ nhớ hơn không?"* → Thường là two pointers sau khi sort, hoặc DP cuộn (chỉ giữ hàng trước); nêu cái giá là mất thứ tự gốc hoặc không dựng lại được đường đi.
- *"Test nào làm lời giải của anh sai?"* → Tự liệt kê: rỗng, một phần tử, trùng nhau, giá trị cực đại gây tràn, vô nghiệm; chứng tỏ bạn nghĩ tới biên trước khi bị hỏi.
- *"Tại sao BFS chứ không phải Dijkstra?"* → BFS đúng khi mọi cạnh cùng giá; có trọng số khác nhau thì cần Dijkstra hoặc A* (xem [[pathfinding]]), cái giá là thêm heap và O(E log V).
- *"Giải recursion này thành vòng lặp được không?"* → Được bằng stack tường minh; lý do cần là call stack có hạn và lưới lớn dễ gây stack overflow.
- *"Chứng minh vì sao hai con trỏ không bỏ sót đáp án."* → Nêu bất biến: mỗi lần dịch con trỏ chỉ loại những cặp chắc chắn không thoả (ví dụ tổng đã quá lớn thì mọi cặp dùng `a[r]` với phần tử bên phải `l` cũng quá lớn), nên mỗi con trỏ đi một chiều mà không mất đáp án.
- *"Union-Find vì sao gần O(1)?"* → Nén đường làm cây gần phẳng, gộp theo kích thước giữ chiều cao O(log n); kết hợp hai cách ra hàm Ackermann ngược, không quá 4 với mọi n thực tế.
- *"Dijkstra có cạnh âm thì sao?"* → Sai, vì nó chốt nút ngay khi lấy ra khỏi heap với giả định đi thêm không thể ngắn hơn; cạnh âm phá giả định đó, cần Bellman-Ford O(V·E) hoặc phát hiện chu trình âm.
- *"Test lớn nhất của bài này chạy mất bao lâu, ước lượng thế nào?"* → Đếm số phép nguyên thủy (n log n với n = 10^5 là khoảng 1,7·10^6), so với 10^8 phép mỗi giây; nói được bạn tính chứ không đoán.
- *"Nếu dữ liệu không vừa bộ nhớ thì sao?"* → Xử lý luồng với cấu trúc kích thước cố định (heap K phần tử, cửa sổ trượt), hoặc sort ngoài theo khối rồi gộp; nêu được cái giá là chỉ đọc tuần tự một lượt.

**Cờ đỏ**

- Gõ code ngay không đọc hết đề, không hỏi lại giới hạn. Nghe nhanh nhưng thường làm sai bài.
- Chỉ có lời giải brute force rồi nói "chạy được là đủ" mà không nhắc tới n lớn; hoặc ngược lại, sa vào tối ưu non mà không có bản chạy được.
- Dùng `int` cho tổng/tích mà không nghĩ tới tràn, hoặc viết `(long)(a * b)` thay vì `(long)a * b`.
- Không nói được độ phức tạp, hoặc nói "O(n)" cho vòng lặp có `List.Contains`/`Insert(0, x)` bên trong (thực chất O(n²)).
- Nhét LINQ vào chỗ nóng (`OrderBy().First()` thay cho một lần quét) rồi nói đó là "cho gọn".
- Kẹt thì im lặng thay vì nói ra hướng đang nghĩ; người chấm không biết bạn nghĩ gì thì không cho điểm cách nghĩ.
- Nói "tôi dùng `PriorityQueue`" mà không biết Unity không có, hoặc không hỏi môi trường thi có phiên bản .NET nào.
- Dùng sliding window cho bài có số âm hoặc dùng Dijkstra cho đồ thị có cạnh âm: nghe giống đã nhận ra dạng bài nhưng điều kiện áp dụng không thoả.
- Nói "hash là O(1)" tuyệt đối. Đúng phải là trung bình O(1); nhiều khoá va chạm có thể xuống O(n), và băm chuỗi dài tốn O(độ dài).
- Mô phỏng game of life/rơi khối mà sửa ngay trên lưới đang đọc, cho kết quả lệch mà vẫn tự tin "đã test".

**Số / ví dụ nên thuộc**

- Giới hạn → độ phức tạp: n ≤ 10^5 cần O(n log n); n ≤ 5 000 chịu được O(n²); n ≤ 20 thì O(2^n); n ≤ 10^6 trở lên cần O(n). Tham chiếu: khoảng 10^8 phép đơn giản mỗi giây.
- `int` tràn ở khoảng 2,1 · 10^9 (2^31 − 1); `long` tới khoảng 9,2 · 10^18. Tổng của 10^5 số cỡ 10^5 là 10^10, đã tràn `int`.
- Sort là O(n log n); `Dictionary` tra cứu trung bình O(1); `List.Contains` và `List.Remove` là O(n); `Queue`/`Stack` thao tác O(1); `PriorityQueue` và `SortedSet` O(log n).
- BFS/DFS trên lưới R×C: O(R·C) thời gian và bộ nhớ. Binary search trên đáp án: O(n log M). Dijkstra O((V+E) log V). Union-Find gần O(1). Topo sort O(V+E).
- Top-K bằng min-heap O(n log K); edit distance/LCS O(m·n); prefix sum dựng O(n), truy vấn O(1); gacha trọng số quay O(log n) sau khi dựng O(n).
- Mẫu cố định cần gõ không nghĩ: mảng hướng `dr/dc` bốn hướng, `mid = lo + (hi - lo) / 2`, `(p + mid - 1) / mid` làm tròn lên, `int.MaxValue / 2` làm vô cực cho DP, `x & (x - 1)` xoá bit 1 thấp nhất, `((x % m) + m) % m` dư không âm.
- Ví dụ chuẩn để kiểm tay: edit distance `kitten → sitting` = 3; coin change `[1,2,5]`, 11 = 3 xu; LIS `[10,9,2,5,3,7,101,18]` = 4; xoay `{1,2,3;4,5,6;7,8,9}` thành `{7,4,1;8,5,2;9,6,3}`.
