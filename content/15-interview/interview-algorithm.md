---
id: interview-algorithm
title: Vòng 1 — Giải thuật code 3 câu
icon: 🧮
summary: Đề thi giải thuật ba câu (dễ–vừa–khó, 60–90 phút) thường ra những dạng nào, cách phân giờ, mười dạng bài kèm kỹ thuật và độ phức tạp, lộ trình ôn 5–7 ngày và chín lời giải C# chạy được.
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

Một file C# console gồm chín lời giải tiêu biểu, phủ tám trong mười dạng ở bảng trên (two pointers và prefix sum chưa có bài mẫu riêng — luyện ở ngày 2–3 của lộ trình). Mỗi bài có comment độ phức tạp; `Main` in `OK`/`FAIL` cho từng ca kiểm.

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
    }
}
```

**Chạy thử**
- Chạy `dotnet run` (nếu console hiện sai dấu tiếng Việt thì đặt `chcp 65001` trước). Phải ra đúng 13 dòng, tất cả bắt đầu bằng `OK`:

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
```

- Phá thử để thấy vì sao có comment: trong `TwoSum` đảo hai dòng (thêm vào `seen` trước khi kiểm) rồi chạy `TwoSum([3,2,4], 6)` — nó sẽ ghép `3` với chính nó. Trong `LongestUnique` bỏ điều kiện `p >= left` thì ca `abba` trả 3 thay vì 2.
- Tự viết lại từng hàm không nhìn, rồi so với bản này; bài nào quá 25 phút thì đánh dấu để ôn lại ở ngày 7.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Tìm hai số trong mảng có tổng bằng k. Làm sao tránh O(n²)?**
  → Dùng `Dictionary` ghi các giá trị đã gặp, mỗi phần tử tra xem `k - x` có trong đó chưa; được O(n) thời gian, đổi lại O(n) bộ nhớ. Vì kiểm trước rồi mới thêm nên không ghép một phần tử với chính nó. Nếu mảng đã sắp xếp thì two pointers cho O(n) mà không cần bộ nhớ phụ.
- `Junior` **Kiểm tra chuỗi ngoặc `([]{})` hợp lệ. Dùng cấu trúc gì, vì sao?**
  → Dùng stack: gặp ngoặc mở thì đẩy, gặp ngoặc đóng thì lấy ra và so khớp loại. Stack hợp vì ngoặc mở gần nhất phải đóng trước (vào sau ra trước). Cuối cùng stack phải rỗng, vì còn dư là có ngoặc mở chưa đóng; và đóng khi stack rỗng cũng là sai.
- `Junior` **Sliding window khác two pointers ở chỗ nào?**
  → Sliding window là hai con trỏ cùng chiều tạo thành một đoạn liên tiếp, mở rộng bên phải và thu bên trái khi vi phạm điều kiện, dùng cho bài "đoạn con dài/ngắn nhất". Two pointers tổng quát thường xuất phát hai đầu mảng đã sắp xếp và tiến vào giữa. Cả hai đều O(n) vì mỗi con trỏ chỉ đi một chiều, không bao giờ lùi.
- `Mid` **Đường đi ngắn nhất trên lưới có tường: vì sao BFS mà không DFS?**
  → Mọi bước có giá như nhau nên BFS duyệt theo từng lớp khoảng cách, lần đầu chạm đích chính là đường ngắn nhất. DFS đi sâu một nhánh và có thể tới đích bằng đường dài trước. Độ phức tạp O(R·C); chú ý đánh dấu đã thăm lúc đẩy vào hàng đợi, không phải lúc lấy ra, nếu không một ô bị đẩy nhiều lần.
- `Mid` **Binary search trên đáp án là gì? Cho ví dụ.**
  → Khi đáp án là một số và có hàm kiểm "với giá trị x thì đủ chưa" đơn điệu, ta chặt nhị phân trên chính x thay vì trên mảng. Ví dụ tốc độ ăn chuối tối thiểu để xong trong h giờ: tốc độ càng cao càng dễ xong, nên thử mid rồi thu một nửa, tổng O(n log M). Điều kiện bắt buộc là tính đơn điệu; không có nó thì chặt nhị phân sai.
- `Mid` **Bài nhận n = 10^5 mà bạn đang có lời giải O(n²). Làm gì?**
  → 10^5 bình phương là 10^10 phép, quá giới hạn khoảng 10^8–10^9 phép mỗi giây của một bài thi, nên phải xuống O(n log n) hoặc O(n). Tôi tìm xem vòng lồng bên trong có thay được bằng tra cứu hash, con trỏ thứ hai, binary search hoặc prefix sum không. Nếu chưa nghĩ ra, tôi nộp bản O(n²) để ăn test nhỏ rồi quay lại sau.
- `Mid` **Coin change: định nghĩa `dp[x]` và công thức chuyển là gì?**
  → `dp[x]` là số xu ít nhất để đổi đúng số tiền x; `dp[0] = 0`, còn lại khởi tạo vô cực. Với mỗi loại xu c ≤ x thì `dp[x] = min(dp[x], dp[x - c] + 1)`. Độ phức tạp O(amount · số loại xu). Khởi tạo vô cực bằng `int.MaxValue / 2` để cộng một không tràn, và cuối cùng còn vô cực thì trả -1.
- `Senior` **LIS làm O(n²) được rồi, sao còn cần O(n log n)?**
  → Bản O(n²) với `dp[i]` là độ dài dãy tăng dài nhất kết thúc ở i, chạy được tới n khoảng 5 000. Với n = 10^5 phải dùng mảng `tails`, trong đó `tails[k]` là đuôi nhỏ nhất của mọi dãy tăng độ dài k+1; mỗi phần tử tìm vị trí bằng binary search nên O(n log n). Mảng `tails` không phải dãy con thật, chỉ cho đúng độ dài.
- `Senior` **Backtracking bị chậm thì cải thiện bằng cách nào?**
  → Cắt tỉa sớm: bỏ nhánh khi biết chắc không thể tốt hơn đáp án hiện có, hoặc sort đầu vào để dừng khi tổng đã vượt. Nếu các bài toán con lặp lại thì thêm memo thành DP, vì khi đó số trạng thái thật sự đếm được. Còn không, tôi ước lượng số nhánh (ví dụ 2^n) để biết n tối đa mà cách này chịu nổi.
- `Senior` **Gộp các khoảng chồng nhau: cách làm và độ phức tạp?**
  → Sort theo đầu mút trái, rồi quét một lượt: nếu khoảng mới bắt đầu không vượt quá đầu mút phải của khoảng cuối trong kết quả thì kéo dài khoảng cuối, ngược lại thêm khoảng mới. Sort quyết định O(n log n), phần quét chỉ O(n). Phải chốt với đề xem hai khoảng chỉ chạm tại một điểm như `[1,3]` và `[3,5]` có tính là chồng nhau không.

**Khung trả lời 60 giây** — "Anh tiếp cận một bài thuật toán lạ thế nào?"

> Việc đầu tiên tôi đọc kỹ đề và nhìn giới hạn n, vì giới hạn cho biết độ phức tạp tối đa: n tới 10^5 thì tôi cần O(n log n) trở xuống. Tiếp đó tôi thử một ví dụ nhỏ bằng tay và viết bản brute force trước, để chắc mình hiểu đề và có bản đúng để đối chiếu. Rồi tôi tự hỏi bài giống dạng nào đã biết: có chuỗi liên tiếp thì sliding window, có "ngắn nhất" trên lưới thì BFS, có "số cách" hay "tối thiểu" với bài toán con lặp thì DP. Tôi nói ra cấu trúc dữ liệu định dùng và độ phức tạp trước khi gõ. Gõ xong, tôi tự chạy các ca biên: rỗng, một phần tử, tràn int, vô nghiệm, vì phần lớn điểm mất ở đó chứ không ở ý tưởng chính.

**Họ sẽ đào tiếp**

- *"Độ phức tạp thời gian và bộ nhớ của lời giải là bao nhiêu?"* → Phải nêu cả hai, chỉ ra vòng nào đóng góp bậc cao nhất, và nói được cái gì bị đổi lấy cái gì (hash đổi bộ nhớ lấy thời gian).
- *"Có cách nào dùng ít bộ nhớ hơn không?"* → Thường là two pointers sau khi sort, hoặc DP cuộn (chỉ giữ hàng trước); nêu cái giá là mất thứ tự gốc hoặc không dựng lại được đường đi.
- *"Test nào làm lời giải của anh sai?"* → Tự liệt kê: rỗng, một phần tử, trùng nhau, giá trị cực đại gây tràn, vô nghiệm; chứng tỏ bạn nghĩ tới biên trước khi bị hỏi.
- *"Tại sao BFS chứ không phải Dijkstra?"* → BFS đúng khi mọi cạnh cùng giá; có trọng số khác nhau thì cần Dijkstra hoặc A* (xem [[pathfinding]]), cái giá là thêm heap và O(E log V).
- *"Giải recursion này thành vòng lặp được không?"* → Được bằng stack tường minh; lý do cần là call stack có hạn và lưới lớn dễ gây stack overflow.

**Cờ đỏ**

- Gõ code ngay không đọc hết đề, không hỏi lại giới hạn. Nghe nhanh nhưng thường làm sai bài.
- Chỉ có lời giải brute force rồi nói "chạy được là đủ" mà không nhắc tới n lớn; hoặc ngược lại, sa vào tối ưu non mà không có bản chạy được.
- Dùng `int` cho tổng/tích mà không nghĩ tới tràn, hoặc viết `(long)(a * b)` thay vì `(long)a * b`.
- Không nói được độ phức tạp, hoặc nói "O(n)" cho vòng lặp có `List.Contains`/`Insert(0, x)` bên trong (thực chất O(n²)).
- Nhét LINQ vào chỗ nóng (`OrderBy().First()` thay cho một lần quét) rồi nói đó là "cho gọn".
- Kẹt thì im lặng thay vì nói ra hướng đang nghĩ; người chấm không biết bạn nghĩ gì thì không cho điểm cách nghĩ.

**Số / ví dụ nên thuộc**

- Giới hạn → độ phức tạp: n ≤ 10^5 cần O(n log n); n ≤ 5 000 chịu được O(n²); n ≤ 20 thì O(2^n); n ≤ 10^6 trở lên cần O(n). Tham chiếu: khoảng 10^8 phép đơn giản mỗi giây.
- `int` tràn ở khoảng 2,1 · 10^9 (2^31 − 1); `long` tới khoảng 9,2 · 10^18. Tổng của 10^5 số cỡ 10^5 là 10^10, đã tràn `int`.
- Sort là O(n log n); `Dictionary` tra cứu trung bình O(1); `List.Contains` và `List.Remove` là O(n); `Queue`/`Stack` thao tác O(1).
- BFS/DFS trên lưới R×C: O(R·C) thời gian và bộ nhớ. Binary search trên đáp án: O(n log M).
- Mẫu cố định cần gõ không nghĩ: mảng hướng `dr/dc` bốn hướng, `mid = lo + (hi - lo) / 2`, `(p + mid - 1) / mid` làm tròn lên, `int.MaxValue / 2` làm vô cực cho DP.
