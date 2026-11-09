---
id: interview-algorithm-set2
title: Đề thi thử vòng 1 — 15 bài có lời giải
icon: 📝
summary: Bộ đề luyện bấm giờ cho vòng giải thuật ba câu — ba đề thi thử (dễ–vừa–khó) cộng sáu bài lẻ, phát biểu như đề thật với input/output/ràng buộc, mang màu game (túi đồ, bảng xếp hạng, hầm ngục, quest phụ thuộc, đếm đường đi), mỗi bài có gợi ý, lời giải, độ phức tạp, bẫy biên và một file C# chạy kiểm cả 15 bài.
status: deep
read: 1111
level: intermediate
order: 12
tags: [interview, algorithm, practice, csharp, live-coding]
related: [interview-algorithm, csharp-collections, pathfinding]
---

[[interview-algorithm]] dạy **dạng bài và cách nhận diện**; node này là **bộ đề để bấm giờ**. Cách dùng: mở một đề, đặt đồng hồ 90 phút, đọc cả ba câu trước khi gõ, nộp bản chạy được trước, tối ưu sau. Chỉ đọc mục **Gợi ý** khi đã kẹt quá 15 phút ở câu đó; đọc **Lời giải** sau khi nộp. Không bài nào trùng bài đã giải ở node kia (Two Sum, chuỗi không lặp, ngoặc, ăn chuối, BFS/đảo, gộp khoảng, coin change, LIS, cặp tổng ≤ k, top-K, union-find, topo, Dijkstra, edit distance, match-3, gacha, xoay ma trận).

Tất cả đề viết theo kiểu **stdin/stdout** (dòng đầu là kích thước). Nếu nền tảng thi cho chữ ký hàm có sẵn thì bỏ phần đọc input, thuật toán giữ nguyên. Collection nào hợp cho từng việc xem [[csharp-collections]]; bài lưới nào cần đi đường ngắn nhất theo trọng số thì xem [[pathfinding]].

| Đề | Câu 1 (dễ) | Câu 2 (vừa) | Câu 3 (khó) |
|---|---|---|---|
| Đề 1 | Gộp túi đồ — hash map | Chuỗi đòn ngắn nhất hạ boss — sliding window | Hầm ngục — DP chạy ngược |
| Đề 2 | Bảng xếp hạng đồng hạng — sort + map | Đài hồi máu gần nhất — BFS nhiều nguồn | Quest phụ thuộc — topo + đường dài nhất |
| Đề 3 | Robot trong phòng — mô phỏng | Chia đợt quái — binary search trên đáp án | Hai ngân sách — knapsack 2 chiều |
| Bài lẻ | Dãy id liên tiếp · quái mạnh hơn kế tiếp · đếm đường đi · nhóm hoán vị · đội hình · buff cửa sổ | | |

## Đề 1 — Kho đồ và hầm ngục

### Bài 1 — Gộp túi đồ (dễ, 15 phút)

> Túi đồ của người chơi nhận `n` dòng nhặt đồ `(id, qty)`. Cùng `id` thì gộp lại; mỗi ô chứa tối đa `cap` món cùng loại. Hãy in danh sách các ô sau khi gộp: các `id` theo thứ tự **xuất hiện đầu tiên**, với mỗi `id` thì các ô đầy trước, ô dư (nếu có) sau cùng.
>
> **Input:** dòng 1 là `n cap`; `n` dòng sau mỗi dòng `id qty`.
> **Output:** dòng 1 là số ô `m`; `m` dòng sau mỗi dòng `id qty`.
> **Ràng buộc:** `1 ≤ n ≤ 10^5`, `10 ≤ cap ≤ 999`, `1 ≤ qty ≤ 10^4`, tổng `qty` ≤ 10^7.
> **Ví dụ:** vào `3 99` / `1 150` / `2 40` / `1 60` → ra `4` / `1 99` / `1 99` / `1 12` / `2 40`.

**Gợi ý:** cộng dồn theo `id` trước, chia ô sau — đừng xếp ô ngay khi đọc từng dòng.

**Lời giải ý tưởng:** `Dictionary<int, long>` cộng tổng theo `id`, kèm `List<int>` ghi thứ tự xuất hiện đầu tiên (Dictionary không hứa giữ thứ tự chèn). Duyệt danh sách thứ tự, với mỗi tổng `t` thì thêm `t / cap` ô đầy rồi một ô dư `t % cap` nếu khác 0.

**Độ phức tạp:** O(n + m) thời gian, O(số id) bộ nhớ, `m` là số ô xuất ra.

**Bẫy biên:** tổng chia hết `cap` thì **không** thêm ô rỗng; cộng `qty` vào `int` khi nhiều dòng cùng id (dùng `long`); in từng ô bằng `Console.WriteLine` khi `m` lên 10^6 — dùng `StringBuilder`.

### Bài 2 — Chuỗi đòn ngắn nhất hạ boss (vừa, 25 phút)

> Boss có `S` máu. Bạn có dãy `n` đòn đánh liên tiếp theo thời gian, đòn thứ `i` gây `dmg[i]` sát thương. Hãy tìm **số đòn ít nhất** trong một đoạn đòn **liên tiếp** mà tổng sát thương ≥ `S`. Không có đoạn nào đủ thì in `0`.
>
> **Input:** dòng 1 là `n S`; dòng 2 là `n` số `dmg`.
> **Output:** một số nguyên.
> **Ràng buộc:** `1 ≤ n ≤ 2·10^5`, `1 ≤ dmg[i] ≤ 10^4`, `1 ≤ S ≤ 10^9`.
> **Ví dụ:** vào `6 7` / `2 3 1 2 4 3` → ra `2` (đoạn `4 3`).

**Gợi ý:** mọi `dmg` dương nên thêm phần tử vào phải thì tổng chỉ tăng — cửa sổ co giãn được.

**Lời giải ý tưởng:** sliding window `[left, right]`. Mở rộng `right` cộng vào `sum`; khi `sum ≥ S` thì ghi nhận độ dài, rồi thu `left` (trừ `dmg[left]`) **liên tục** chừng nào còn đủ — mỗi lần thu là một ứng viên ngắn hơn. Hết mảng thì in kết quả nhỏ nhất.

**Độ phức tạp:** O(n) — `left` và `right` mỗi con trỏ đi tối đa n bước; O(1) bộ nhớ.

**Bẫy biên:** dùng `if` thay `while` khi thu cửa sổ (bỏ sót đoạn ngắn hơn); `sum` kiểu `int` (2·10^5 × 10^4 = 2·10^9 sát ngưỡng) — dùng `long`; khởi tạo kết quả `int.MaxValue` nhưng quên đổi về `0` khi không có đoạn nào. Nếu đề cho số âm thì cách này **sai** (xem bài prefix sum ở node kia).

### Bài 3 — Hầm ngục (khó, 40 phút)

> Hầm ngục là lưới `R × C`. Bạn xuất phát ở góc trên trái, cần tới góc dưới phải, mỗi bước chỉ đi **phải** hoặc **xuống**. Ô có giá trị âm làm bạn mất máu, giá trị dương hồi máu (ô xuất phát và ô đích cũng tính). HP phải luôn ≥ 1 sau khi vào bất kỳ ô nào, kể cả ô cuối. Tìm HP khởi đầu **nhỏ nhất** để tới được đích.
>
> **Input:** dòng 1 là `R C`; `R` dòng sau mỗi dòng `C` số.
> **Output:** một số nguyên ≥ 1.
> **Ràng buộc:** `1 ≤ R, C ≤ 500`, `|giá trị| ≤ 1000`.
> **Ví dụ:** lưới `-2 -3 3 / -5 -10 1 / 10 30 -5` → ra `7` (đi phải, phải, xuống, xuống).

**Gợi ý:** DP xuôi từ góc đầu không đủ thông tin — hãy hỏi "để bước *vào* ô này cần tối thiểu bao nhiêu máu" và chạy từ đích về.

**Lời giải ý tưởng:** `dp[r][c]` = HP tối thiểu khi bước vào ô `(r, c)` để còn sống tới đích. Từ ô sau (phải hoặc xuống) lấy cái cần ít hơn, trừ giá trị ô hiện tại, rồi chặn dưới bằng 1: `dp[r][c] = max(1, min(dp[r+1][c], dp[r][c+1]) - g[r][c])`. Ô đích coi như có hai "lính gác" bằng 1 ở sau. Đáp án `dp[0][0]`.

**Độ phức tạp:** O(R·C) thời gian; O(R·C) bộ nhớ, giảm còn O(C) nếu chỉ giữ một hàng.

**Bẫy biên:** chạy DP xuôi và giữ "tổng nhỏ nhất" — sai, vì đường có tổng cao nhưng đoạn đầu chết vẫn không qua (cần tối ưu hai đại lượng một lúc); quên `max(1, …)` nên ô hồi máu lớn cho đáp án ≤ 0; lưới 1×1 chỉ có một ô dương → đáp án 1; hàng/cột ngoài biên phải là vô cực để `min` không chọn nhầm.

## Đề 2 — Bảng điểm, đài hồi máu, quest

### Bài 4 — Bảng xếp hạng đồng hạng (dễ, 15 phút)

> Có `n` người chơi, người thứ `i` có điểm `score[i]`. Hạng của một người = 1 + số người có điểm **cao hơn hẳn**. Như vậy điểm `100, 90, 90, 80` cho hạng `1, 2, 2, 4`. In hạng của từng người theo thứ tự đầu vào.
>
> **Input:** dòng 1 là `n`; dòng 2 là `n` điểm.
> **Output:** `n` số cách nhau dấu cách.
> **Ràng buộc:** `1 ≤ n ≤ 10^5`, `0 ≤ score ≤ 10^9`.
> **Ví dụ:** vào `4` / `100 90 90 80` → ra `1 2 2 4`.

**Gợi ý:** đừng đếm "ai cao hơn" cho từng người; hạng của một mức điểm chỉ phụ thuộc vị trí đầu tiên của mức đó khi đã xếp.

**Lời giải ý tưởng:** sao chép mảng, sort giảm dần; duyệt mảng đã sort và với mỗi giá trị **chưa gặp** thì ghi `rankOf[giá trị] = vị trí + 1`. Cuối cùng tra `rankOf` cho từng điểm đầu vào.

**Độ phức tạp:** O(n log n) thời gian, O(n) bộ nhớ. Cách ngây thơ đếm từng cặp là O(n²) = 10^10 — quá giờ.

**Bẫy biên:** nhầm với dense rank (`1, 2, 2, 3`) — đọc kỹ ví dụ để biết đề muốn kiểu nào; comparer giảm dần viết `b - a` tràn khi điểm lớn (dùng `b.CompareTo(a)`); toàn bộ điểm bằng nhau → tất cả hạng 1; ghi đè `rankOf` mỗi lần gặp (mất vị trí đầu tiên) thay vì chỉ ghi lần đầu.

### Bài 5 — Đài hồi máu gần nhất (vừa, 25 phút)

> Bản đồ là lưới `R × C`: `#` là tường, `.` là ô trống, `F` là đài hồi máu. Mỗi bước đi sang ô kề (4 hướng) không phải tường. Với mỗi ô trống, tính khoảng cách tới đài **gần nhất**. In khoảng cách **lớn nhất** trong các ô trống đó. Nếu có ô trống không tới được đài nào, in `-1`; nếu không có ô trống nào, in `0`.
>
> **Input:** dòng 1 là `R C`; `R` dòng sau mỗi dòng một chuỗi dài `C`.
> **Output:** một số nguyên.
> **Ràng buộc:** `1 ≤ R, C ≤ 1000`.
> **Ví dụ:** lưới `F..#` / `.#..` / `...F` → ra `2`.

**Gợi ý:** chạy BFS từ từng ô trống thì quá chậm; đảo ngược — cho mọi đài cùng xuất phát một lúc.

**Lời giải ý tưởng:** BFS nhiều nguồn: đẩy **tất cả** ô `F` vào queue với `dist = 0` ngay từ đầu, rồi chạy BFS lưới bình thường. Sóng từ các đài loang đồng thời nên lần đầu một ô được chạm chính là khoảng cách tới đài gần nhất. Cuối cùng quét các ô `.`: gặp ô `dist = -1` thì trả `-1`, còn lại lấy max.

**Độ phức tạp:** O(R·C) thời gian và bộ nhớ (10^6 ô). Chạy BFS riêng cho từng ô là O((RC)²).

**Bẫy biên:** không có đài mà có ô trống → `-1`; không có ô trống → `0`; đánh dấu đã thăm lúc **đẩy vào** queue chứ không phải lúc lấy ra (nếu không một ô bị đẩy nhiều lần); một ô trống bị tường bao kín nhưng có đài ở xa — vẫn `-1`.

### Bài 6 — Quest phụ thuộc (khó, 40 phút)

> Có `n` quest đánh số `0..n-1`, quest `i` mất `dur[i]` thời gian. Có `m` ràng buộc `a b` nghĩa là quest `a` phải **hoàn thành** trước khi bắt đầu `b`. Người chơi có thể làm nhiều quest song song không giới hạn. Tìm thời gian ngắn nhất để hoàn thành mọi quest. Nếu các ràng buộc tạo vòng (không thể hoàn thành) in `-1`.
>
> **Input:** dòng 1 là `n m`; dòng 2 là `n` số `dur`; `m` dòng sau mỗi dòng `a b`.
> **Output:** một số nguyên.
> **Ràng buộc:** `1 ≤ n ≤ 10^5`, `0 ≤ m ≤ 2·10^5`, `1 ≤ dur ≤ 10^9`.
> **Ví dụ:** `dur = 3 2 4 1`, ràng buộc `0 1`, `0 2`, `1 3`, `2 3` → ra `8` (đường 0 → 2 → 3 = 3 + 4 + 1).

**Gợi ý:** đáp án là độ dài đường **dài nhất** trong DAG, tính theo thứ tự mà mọi tiên quyết đã xong.

**Lời giải ý tưởng:** topo sort Kahn. Duy trì `finish[v]` = thời điểm quest `v` xong. Quest bậc vào 0 có `finish = dur`. Khi lấy `u` ra khỏi queue, với mỗi quest kề `v` cập nhật `finish[v] = max(finish[v], finish[u] + dur[v])` rồi giảm bậc vào; về 0 thì vào queue. Đáp án là `max(finish)`; số quest lấy ra < `n` nghĩa là có vòng → `-1`.

**Độ phức tạp:** O(n + m) thời gian và bộ nhớ.

**Bẫy biên:** `finish` phải là `long` (đường dài 10^5 quest × 10^9 = 10^14); lấy `finish[u] + dur[v]` thay vì `max` nên quest chờ nhiều tiên quyết bị tính sai; quest cô lập vẫn phải được tính (đáp án có thể chính là quest cô lập dài nhất); cạnh trùng nhau không phá thuật toán nhưng làm bậc vào đếm đúng theo từng cạnh — giữ nhất quán giữa lúc cộng và lúc trừ; kiểm vòng bằng số quest lấy ra, không phải bằng "queue rỗng".

## Đề 3 — Robot, đợt quái, hai ngân sách

### Bài 7 — Robot trong phòng (dễ, 15 phút)

> Phòng là lưới `R × C`: `#` là tường, `.` trống, `S` là chỗ robot đứng, ban đầu quay mặt hướng **Bắc** (lên trên). Cho chuỗi lệnh gồm `F` (tiến một ô theo hướng đang quay), `L` (xoay trái 90°), `R` (xoay phải 90°). Lệnh `F` mà ô phía trước là tường hoặc ngoài lưới thì robot **đứng yên** (và vẫn đọc lệnh tiếp). In vị trí cuối.
>
> **Input:** dòng 1 là `R C`; `R` dòng lưới; dòng cuối là chuỗi lệnh.
> **Output:** `r c D` (hàng, cột đếm từ 0; `D` ∈ `N E S W`).
> **Ràng buộc:** `1 ≤ R, C ≤ 100`, độ dài lệnh ≤ 10^5.
> **Ví dụ:** lưới `...` / `.#.` / `S..`, lệnh `FFRFFLF` → ra `0 2 N`.

**Gợi ý:** mã hoá hướng bằng chỉ số 0–3 theo chiều kim đồng hồ để xoay chỉ là cộng modulo.

**Lời giải ý tưởng:** hai mảng `dr = {-1,0,1,0}`, `dc = {0,1,0,-1}` ứng với `N,E,S,W`. `R` là `d = (d+1) % 4`, `L` là `d = (d+3) % 4`. `F` tính ô mới, kiểm biên rồi kiểm tường, hợp lệ mới cập nhật toạ độ.

**Độ phức tạp:** O(|lệnh|) thời gian, O(1) bộ nhớ thêm.

**Bẫy biên:** `(d - 1) % 4` ra số âm trong C# (`-1 % 4 = -1`); kiểm tường trước kiểm biên làm văng `IndexOutOfRange`; nhầm hàng/cột (`r` là dòng, bắc là `r - 1`); đứng yên khi đâm tường chứ không dừng cả chương trình; chuỗi lệnh rỗng → in vị trí ban đầu.

### Bài 8 — Chia đợt quái (vừa, 25 phút)

> Có `n` đợt quái xếp theo thứ tự, đợt `i` có tổng máu `hp[i]`. Bạn phải chia chúng thành đúng `k` ngày, mỗi ngày đánh một đoạn **liên tiếp** (không đổi thứ tự, mỗi ngày ít nhất một đợt). Gánh nặng một ngày là tổng máu các đợt của ngày đó. Hãy chia sao cho ngày nặng nhất **nhẹ nhất có thể** và in gánh nặng đó.
>
> **Input:** dòng 1 là `n k`; dòng 2 là `n` số `hp`.
> **Output:** một số nguyên.
> **Ràng buộc:** `1 ≤ k ≤ n ≤ 10^5`, `1 ≤ hp[i] ≤ 10^9`.
> **Ví dụ:** vào `5 2` / `7 2 5 10 8` → ra `18` (chia `7 2 5 | 10 8`).

**Gợi ý:** "min của max" gần như luôn là binary search trên đáp án; khó là viết hàm hỏi "với sức chứa X thì cần mấy ngày".

**Lời giải ý tưởng:** đáp án nằm trong `[max(hp), sum(hp)]`. Với `mid`, đi tham lam: cộng dồn đợt vào ngày hiện tại, thêm đợt sẽ vượt `mid` thì mở ngày mới. Số ngày ≤ `k` nghĩa là `mid` đủ → thử nhỏ hơn (`hi = mid`), ngược lại tăng (`lo = mid + 1`). Tính khả thi đơn điệu: sức chứa lớn hơn thì không cần nhiều ngày hơn.

**Độ phức tạp:** O(n · log(tổng)) ≈ 10^5 × 47; O(1) bộ nhớ.

**Bẫy biên:** tổng lên 10^14 — mọi biến phải `long`; chặn dưới phải là `max(hp)` (nhỏ hơn thì không đợt nào vừa); số ngày dùng ít hơn `k` vẫn hợp lệ vì có thể tách thêm (mỗi ngày ít nhất một đợt đã được đảm bảo khi `k ≤ n`); `k = 1` cho đáp án là tổng, `k = n` cho đáp án là `max`.

### Bài 9 — Hai ngân sách (khó, 40 phút)

> Có `n` nhiệm vụ, nhiệm vụ `i` tốn `st[i]` thể lực và `tm[i]` phút, thưởng `v[i]`. Mỗi nhiệm vụ làm tối đa một lần. Bạn có tổng `S` thể lực và `T` phút. Chọn tập nhiệm vụ sao cho tổng thể lực ≤ `S`, tổng phút ≤ `T`, và tổng thưởng lớn nhất.
>
> **Input:** dòng 1 là `n S T`; `n` dòng sau mỗi dòng `st tm v`.
> **Output:** một số nguyên.
> **Ràng buộc:** `1 ≤ n ≤ 100`, `1 ≤ S, T ≤ 100`, `1 ≤ st, tm ≤ 100`, `1 ≤ v ≤ 10^4`.
> **Ví dụ:** `4 5 5` / `2 3 5` / `3 2 4` / `4 4 7` / `1 1 2` → ra `9`.

**Gợi ý:** knapsack 0/1 thông thường có một ngân sách; bài này có hai — thêm một chiều cho bảng.

**Lời giải ý tưởng:** `dp[s][t]` = thưởng tối đa với tối đa `s` thể lực và `t` phút. Với từng nhiệm vụ, cập nhật `dp[s][t] = max(dp[s][t], dp[s - st][t - tm] + v)`, hai vòng `s` và `t` đều chạy **từ lớn xuống nhỏ** để mỗi nhiệm vụ chỉ dùng một lần (chỉ duyệt ngược một chiều là đủ khi chi phí ở chiều đó của mọi nhiệm vụ luôn > 0; có nhiệm vụ tốn 0 ở chiều đó thì chiều kia cũng phải ngược — nên cứ để cả hai ngược cho chắc). Đáp án `dp[S][T]`.

**Độ phức tạp:** O(n · S · T) = 10^6 thao tác; O(S · T) bộ nhớ.

**Bẫy biên:** chạy cả hai vòng xuôi thì nhiệm vụ bị dùng nhiều lần (thành knapsack không giới hạn); nhiệm vụ có chi phí vượt ngân sách thì vòng lặp tự bỏ qua, đừng truy cập chỉ số âm; "đúng bằng" và "không quá" khác nhau — bài này là "không quá" nên khởi tạo toàn 0 (nếu đề đòi đúng bằng thì khởi tạo vô cực trừ ô gốc); không có nhiệm vụ nào vừa → đáp án 0.

## Sáu bài lẻ

Mỗi bài làm trong 10–20 phút. Dùng để vá điểm yếu theo dạng, không cần theo thứ tự.

### Bài 10 — Dãy id liên tiếp dài nhất (hash set)

> Cho `n` id vật phẩm (có thể trùng, không sắp xếp). Tìm độ dài dãy giá trị **liên tiếp** (`x, x+1, x+2, …`) dài nhất xuất hiện trong tập. **Input:** `n`, rồi `n` số. **Output:** một số. **Ràng buộc:** `0 ≤ n ≤ 10^6`, `0 ≤ id ≤ 10^9`. **Ví dụ:** `100 4 200 1 3 2` → `4` (dãy `1 2 3 4`).

**Gợi ý:** sort được nhưng là O(n log n); với hash set có cách O(n) nếu chỉ bắt đầu đếm ở "đầu dãy".

**Lời giải ý tưởng:** đưa mọi id vào `HashSet`. Với mỗi `x` mà `x - 1` **không** có trong set (x là đầu dãy), đếm tiến `x+1, x+2, …` tới khi hụt. Mỗi phần tử bị đếm đúng một lần trong tổng thể vì chỉ đầu dãy mới bắt đầu vòng đếm.

**Độ phức tạp:** O(n) kỳ vọng, O(n) bộ nhớ.

**Bẫy biên:** duyệt mảng gốc (có trùng) thay vì set — mỗi giá trị trùng đếm lại; bỏ qua điều kiện đầu dãy làm thành O(n²) với dãy dài; `n = 0` → `0`; nếu id có thể là `int.MinValue` thì `x - 1` tràn (dùng `long`).

### Bài 11 — Quái mạnh hơn kế tiếp (monotonic stack)

> Hàng quái xếp thành dãy `p[0..n-1]` là sức mạnh. Với mỗi quái, in số bước phải đi về phía sau để gặp quái **mạnh hơn hẳn**; không có thì in `0`. **Input:** `n`, rồi `n` số. **Output:** `n` số. **Ràng buộc:** `1 ≤ n ≤ 10^5`, `1 ≤ p ≤ 10^9`. **Ví dụ:** `73 74 75 71 69 72 76 73` → `1 1 4 2 1 1 0 0`.

**Gợi ý:** hai vòng lồng là O(n²); giữ một stack các quái "chưa tìm được đối thủ mạnh hơn".

**Lời giải ý tưởng:** stack lưu **chỉ số**, giá trị tương ứng giảm dần từ đáy lên đỉnh. Gặp `p[i]` lớn hơn `p[đỉnh]` thì pop đỉnh `j` và ghi `res[j] = i - j`, lặp tới khi đỉnh không nhỏ hơn; rồi push `i`. Phần tử còn lại trong stack giữ `0`.

**Độ phức tạp:** O(n) — mỗi chỉ số vào và ra stack đúng một lần; O(n) bộ nhớ.

**Bẫy biên:** push giá trị thay chỉ số (mất khoảng cách); dùng `≤` thay `<` ở điều kiện pop (bằng nhau **không** tính là mạnh hơn hẳn); dãy giảm dần → toàn `0`; dãy toàn bằng nhau → toàn `0`.

### Bài 12 — Đếm đường đi có tường (DP lưới, chia dư)

> Lưới `R × C`, `#` là tường, `.` là ô trống. Đi từ góc trên trái xuống góc dưới phải, chỉ đi **phải** hoặc **xuống**, không đi vào tường. In số đường đi, chia dư `1_000_000_007`. **Input:** `R C`, rồi `R` dòng lưới. **Output:** một số. **Ràng buộc:** `1 ≤ R, C ≤ 1000`. **Ví dụ:** `...` / `.#.` / `...` → `2`; lưới trống `18×18` → `333606206`.

**Gợi ý:** số cách tới một ô = số cách tới ô trên + số cách tới ô bên trái.

**Lời giải ý tưởng:** `dp[r][c] = dp[r-1][c] + dp[r][c-1]` nếu ô không phải tường, ngược lại `0`. Chỉ cần một hàng: khi xét ô `(r, c)`, `dp[c]` đang giữ giá trị ô phía trên và `dp[c-1]` đã là ô bên trái của hàng hiện tại. Chia dư sau **mỗi** phép cộng.

**Độ phức tạp:** O(R·C) thời gian, O(C) bộ nhớ.

**Bẫy biên:** ô xuất phát hoặc ô đích là tường → `0`; lưới 1×1 trống → `1`; bỏ `% MOD` thì giá trị cộng dồn vượt `int` chỉ sau vài chục hàng (lưới trống 18×18 đã là 2,3 tỉ); quên đặt `dp[c] = 0` khi gặp tường (giữ lại giá trị hàng trên cũ).

### Bài 13 — Nhóm tên vật phẩm là hoán vị (hash + sort)

> Cho `n` tên vật phẩm (chữ thường). Hai tên cùng nhóm nếu là hoán vị của nhau. In số nhóm và kích thước nhóm lớn nhất. **Input:** `n`, rồi `n` chuỗi. **Output:** `số_nhóm kích_thước_lớn_nhất`. **Ràng buộc:** `1 ≤ n ≤ 10^4`, độ dài ≤ 20. **Ví dụ:** `eat tea tan ate nat bat` → `3 3`.

**Gợi ý:** biến mỗi tên thành một "khoá chuẩn" giống nhau cho mọi hoán vị.

**Lời giải ý tưởng:** khoá = chuỗi sau khi sort ký tự; `Dictionary<string, int>` đếm số tên theo khoá. Số nhóm là `Count` của dictionary, nhóm lớn nhất là `max(Values)`.

**Độ phức tạp:** O(n · L log L) với L ≤ 20; bộ nhớ O(n · L).

**Bẫy biên:** dùng `int[26]` làm khoá — so sánh tham chiếu, mỗi tên thành một khoá riêng (phải `string.Join`); quên rằng `Array.Sort` trên `char[]` sửa tại chỗ (cần `ToCharArray` để không đụng chuỗi gốc); chuỗi rỗng là một nhóm hợp lệ.

### Bài 14 — Đếm đội hình (backtracking có cắt tỉa)

> Có `n` anh hùng sức mạnh `power[i]`. Một đội hình là tập **đúng `k`** anh hùng (phân biệt theo chỉ số, hai anh hùng cùng sức mạnh vẫn là hai người khác nhau). Đếm số đội hình có tổng sức mạnh ≤ `P`. **Input:** `n k P`, rồi `n` số. **Output:** một số. **Ràng buộc:** `1 ≤ n ≤ 20`, `1 ≤ k ≤ n`, `1 ≤ power ≤ 10^8`, `P ≤ 10^9`. **Ví dụ:** `3 1 4 1 5`, `k=2`, `P=5` → `5`.

**Gợi ý:** n ≤ 20 cho phép liệt kê; sort trước thì cắt được cả nhánh.

**Lời giải ý tưởng:** sort tăng dần, đệ quy `Go(start, đã_chọn, tổng)`: lần lượt chọn `a[i]` với `i ≥ start`. Nếu `tổng + a[i] > P` thì `break` (các phần tử sau chỉ lớn hơn). Nếu số người còn lại không đủ để chọn tiếp thì `break`. Đủ `k` người thì đếm một đội.

**Độ phức tạp:** tệ nhất O(C(n, k)) ≤ 184 756 với n = 20; cắt tỉa giảm nhiều. Bộ nhớ O(k) cho ngăn xếp đệ quy.

**Bẫy biên:** dùng `continue` thay `break` sau khi sort (vẫn đúng nhưng mất cắt tỉa); đếm cùng một tập nhiều lần do duyệt từ 0 mỗi tầng thay vì từ `start`; tổng cộng dồn `int` có thể tràn nếu `power` lớn (truyền `long`); `k = n` mà tổng cả đội > `P` → `0`.

### Bài 15 — Buff mạnh nhất trong cửa sổ (deque đơn điệu)

> Dãy buff `a[0..n-1]`. Với mọi cửa sổ gồm `k` phần tử liên tiếp, in giá trị **lớn nhất** trong cửa sổ đó. **Input:** `n k`, rồi `n` số. **Output:** `n - k + 1` số. **Ràng buộc:** `1 ≤ k ≤ n ≤ 10^6`, `|a| ≤ 10^9`. **Ví dụ:** `1 3 -1 -3 5 3 6 7`, `k=3` → `3 3 5 5 6 7`.

**Gợi ý:** quét lại `k` phần tử cho mỗi cửa sổ là O(nk); giữ một hàng đợi hai đầu chỉ chứa ứng viên còn có thể thành max.

**Lời giải ý tưởng:** deque lưu **chỉ số**, giá trị giảm dần từ đầu đến cuối. Với `a[i]` mới: pop cuối khi phần tử đó `≤ a[i]` (nó không bao giờ là max nữa vì có phần tử mới hơn và lớn hơn). Push `i`. Nếu chỉ số ở đầu đã trượt khỏi cửa sổ (`≤ i - k`) thì bỏ đầu. Từ `i ≥ k - 1`, đầu deque chính là max cửa sổ.

**Độ phức tạp:** O(n), mỗi chỉ số vào và ra tối đa một lần; O(k) bộ nhớ.

**Bẫy biên:** lưu giá trị thay chỉ số nên không biết khi nào phần tử hết hạn; so sánh `<` thay `≤` làm deque giữ bản trùng (vẫn đúng nhưng phình); `k = 1` → in lại cả mảng; `k = n` → một số duy nhất; dùng `List.RemoveAt(0)` làm deque (O(n) mỗi lần) — dùng `LinkedList` hoặc mảng vòng.

## Chấm điểm và cách ôn

| Mục tiêu | Cách |
|---|---|
| Chấm một đề | Câu dễ đúng hết test = 1 điểm; câu vừa đúng và qua giờ = 2; câu khó 3; làm brute force đúng được nửa điểm câu đó |
| Mốc đạt | Đề 1 và 2 đạt ≥ 4/6 điểm trong 90 phút trước khi thi thật |
| Sau khi chấm | Bài sai: ghi **loại sai** (nhận dạng sai / biên / tràn số / quá giờ), không ghi "làm lại" chung chung |
| Vòng hai | Làm lại đúng bài sai sau 2 ngày, không xem lời giải |

Xem lời giải chạy được ở mục 💻 sau khi đã nộp bản của mình, không trước.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho thi thử giải thuật**

AI ở đây là **người cầm đồng hồ và người chấm**, không phải người giải. Giao được: giữ đề ở dạng giấu lời giải, sinh thêm test (nhất là test biên và test lớn), chạy code của bạn và báo test nào fail, chấm theo bảng điểm ở trên. Không giao: gợi ý khi bạn mới kẹt 5 phút, hoặc tự "sửa giúp" code của bạn — bản sửa của AI che mất đúng lỗi bạn cần học. Quy trình: (1) bạn dán đề (không dán lời giải trong node này); (2) AI báo "bắt đầu" và bạn tự bấm giờ trên đồng hồ thật — AI không có đồng hồ đáng tin; (3) hết giờ thì bạn dán code, AI **chạy thật** với test bạn đã đưa cộng test AI sinh, rồi mới nói đúng sai; (4) chỉ khi đã chấm xong mới hỏi gợi ý nấc một.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Thi nguyên đề | Cuối tuần ôn | "Tôi làm Đề 2, bấm 90 phút, đừng nói gì tới khi tôi dán code" |
| Chấm hộ | Sau khi nộp | "Chạy code này với test ẩn của bạn, báo loại lỗi, chưa nói cách sửa" |
| Sinh test lớn | Kiểm tốc độ | "Sinh test n = 10^6 cho bài 15, đo xem O(n) có qua 1 giây không" |
| Đề tương tự | Vá điểm yếu | "Ra bài cùng dạng với bài 8 nhưng đổi vỏ, giữ giới hạn n" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- Phiên bản C# và nền tảng giả lập: stdin/stdout kiểu HackerRank hay hàm có chữ ký sẵn kiểu Codility; `PriorityQueue` và LINQ có được dùng không.
- Giới hạn `n` thật của đề (nếu không nói, AI chấm bằng test nhỏ và brute force O(n²) vẫn qua).
- Quy tắc chấm: tính giờ mỗi câu hay cả đề, brute force đúng được bao nhiêu điểm.
- Phần nào là "không xem lời giải": cấm AI nhắc tên dạng bài, cấm gợi ý cấu trúc dữ liệu.
- Bài đã làm rồi (để AI không ra lại) và dạng bạn thấy yếu nhất.

**Mẫu prompt**

```
Bạn là giám khảo vòng 1 giải thuật, C# .NET 8, nền tảng đọc stdin/in stdout,
CÓ PriorityQueue, CẤM thư viện ngoài. Tôi thi thử Đề 2 (3 câu, 90 phút,
tôi tự bấm giờ). Đề nằm ở dưới. Lời giải KHÔNG được cho tôi xem.

Quy tắc:
1. KHÔNG gợi ý, KHÔNG nói tên dạng bài, KHÔNG nhận xét hướng đi trong lúc làm.
2. Khi tôi dán code từng câu: CHẠY THẬT bằng dotnet với (a) ví dụ trong đề,
   (b) 8 test biên bạn tự sinh (n = 1, rỗng, toàn bằng nhau, giá trị lớn nhất
   gây tràn int, vô nghiệm), (c) 1 test n tối đa để đo thời gian.
3. Báo từng test đúng/sai và thời gian. KHÔNG sửa code hộ tôi.
4. Kết luận: điểm theo bảng (dễ 1, vừa 2, khó 3), loại lỗi của mỗi câu sai
   (nhận dạng / biên / tràn / quá giờ) và MỘT lỗi quan trọng nhất.
5. Chỉ khi tôi gõ "gợi ý N" mới cho nấc N: nấc 1 hướng, nấc 2 cấu trúc dữ
   liệu, nấc 3 pseudo-code.

Đề: <dán Bài 4, Bài 5, Bài 6 — chỉ phần đề, không dán Gợi ý/Lời giải>
```

**Bẫy thường gặp:** AI "chấm" bằng cách đọc code và khen đúng, trong khi chưa chạy — bắt nó in output thật và thời gian chạy. AI tự sinh test biên thường quá hiền (n nhỏ, không có giá trị làm tràn `int`), nên đòi test cụ thể: tổng 10^14 cho bài 8, 18×18 lưới trống cho bài 12, mảng toàn bằng nhau cho bài 4 và 11. Khi bạn dán cả đề lẫn "Gợi ý" thì mất tác dụng thi thử, nên chỉ dán phần đề. AI hay chuyển bài về dạng quen (bài 3 thành "đường đi tổng nhỏ nhất") và chấm theo phiên bản đã đổi — đối chiếu lại đề gốc. Cuối cùng, AI không có đồng hồ: mọi con số "bạn làm hết 31 phút" nó nói đều là bịa, chỉ tin đồng hồ của bạn.

## 💻 Code

Một file C# console chứa lời giải đủ 15 bài (bài 1–9 của ba đề, bài 10–15 là bài lẻ). Mỗi hàm có comment độ phức tạp và điểm bẫy; `Main` chạy ví dụ của từng bài cộng vài ca biên (26 ca) và in `OK`/`FAIL` so với đáp án mong đợi. Chạy được trên .NET 6 trở lên, không cần `PriorityQueue`, nên cũng dán được vào Unity nếu cần thử trong Editor.

**Setup**

```
dotnet new console -n Algo2
cd Algo2
# thay Program.cs bằng file bên dưới, rồi:
dotnet run
```

**Script**

```csharp
// Program.cs — dotnet new console -n Algo2 ; thay Program.cs bằng file này ; dotnet run
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

public static class Program
{
    // ===== ĐỀ 1 =====

    // Bài 1 — Gộp túi đồ: gộp cùng id, mỗi ô tối đa cap, giữ thứ tự xuất hiện đầu tiên.
    // Hash map: O(n + số ô), bộ nhớ O(số id).
    static List<(int id, int qty)> PackInventory(int[][] items, int cap)
    {
        var total = new Dictionary<int, long>();
        var order = new List<int>();
        foreach (var it in items)
        {
            if (!total.ContainsKey(it[0])) { total[it[0]] = 0; order.Add(it[0]); }
            total[it[0]] += it[1]; // long: nhiều dòng cùng id cộng lại dễ vượt int
        }
        var slots = new List<(int, int)>();
        foreach (int id in order)
        {
            long t = total[id];
            for (; t >= cap; t -= cap) slots.Add((id, cap)); // ô đầy trước
            if (t > 0) slots.Add((id, (int)t));              // ô dư; t = 0 thì KHÔNG thêm ô rỗng
        }
        return slots;
    }

    // Bài 2 — Số đòn ít nhất (liên tiếp) có tổng sát thương >= S. Sliding window, mọi phần tử dương.
    // O(n) thời gian, O(1) bộ nhớ. Trả 0 nếu không có.
    static int MinHits(int[] dmg, long s)
    {
        int best = int.MaxValue, left = 0;
        long sum = 0;
        for (int right = 0; right < dmg.Length; right++)
        {
            sum += dmg[right];
            while (sum >= s) // thu cửa sổ càng nhiều càng tốt khi vẫn đủ
            {
                best = Math.Min(best, right - left + 1);
                sum -= dmg[left++];
            }
        }
        return best == int.MaxValue ? 0 : best;
    }

    // Bài 3 — Hầm ngục: đi phải/xuống, ô âm là mất máu, dương là hồi. HP khởi đầu tối thiểu để luôn >= 1.
    // DP chạy NGƯỢC từ đích. O(R*C), bộ nhớ O(R*C).
    static int MinInitialHp(int[][] g)
    {
        int R = g.Length, C = g[0].Length;
        var dp = new int[R + 1, C + 1]; // dp[r,c] = HP tối thiểu khi BƯỚC VÀO ô (r,c)
        for (int r = 0; r <= R; r++) for (int c = 0; c <= C; c++) dp[r, c] = int.MaxValue;
        dp[R, C - 1] = dp[R - 1, C] = 1; // lính gác: sau ô đích còn lại >= 1
        for (int r = R - 1; r >= 0; r--)
            for (int c = C - 1; c >= 0; c--)
            {
                int need = Math.Min(dp[r + 1, c], dp[r, c + 1]) - g[r][c];
                dp[r, c] = Math.Max(1, need); // ô hồi nhiều cũng không cho phép HP < 1
            }
        return dp[0, 0];
    }

    // ===== ĐỀ 2 =====

    // Bài 4 — Bảng xếp hạng đồng hạng kiểu 1-2-2-4. Sort giảm dần + dictionary điểm -> hạng.
    // O(n log n), bộ nhớ O(n).
    static int[] Ranks(int[] scores)
    {
        var sorted = (int[])scores.Clone();
        Array.Sort(sorted, (a, b) => b.CompareTo(a)); // KHÔNG return b - a (tràn)
        var rankOf = new Dictionary<int, int>();
        for (int i = 0; i < sorted.Length; i++)
            if (!rankOf.ContainsKey(sorted[i])) rankOf[sorted[i]] = i + 1; // vị trí ĐẦU TIÊN của điểm đó
        return scores.Select(x => rankOf[x]).ToArray();
    }

    // Bài 5 — Đài hồi máu: nhiều nguồn BFS. Trả khoảng cách xa nhất từ một ô trống tới đài gần nhất.
    // -1 nếu có ô trống không tới được đài nào. O(R*C).
    static int FarthestFromFountain(string[] g)
    {
        int R = g.Length, C = g[0].Length;
        var dist = new int[R, C];
        var q = new Queue<(int, int)>();
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++)
            {
                dist[r, c] = -1;
                if (g[r][c] == 'F') { dist[r, c] = 0; q.Enqueue((r, c)); } // đẩy MỌI nguồn trước khi chạy
            }
        int[] dr = { 1, -1, 0, 0 }, dc = { 0, 0, 1, -1 };
        while (q.Count > 0)
        {
            var (r, c) = q.Dequeue();
            for (int k = 0; k < 4; k++)
            {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
                if (g[nr][nc] == '#' || dist[nr, nc] != -1) continue;
                dist[nr, nc] = dist[r, c] + 1;
                q.Enqueue((nr, nc));
            }
        }
        int far = 0;
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++)
            {
                if (g[r][c] != '.') continue;
                if (dist[r, c] == -1) return -1;
                far = Math.Max(far, dist[r, c]);
            }
        return far;
    }

    // Bài 6 — Quest phụ thuộc: thời gian hoàn thành tất cả khi làm song song không giới hạn.
    // Topo (Kahn) + DP đường dài nhất. O(V + E). Có vòng phụ thuộc -> -1.
    static long CriticalPath(int[] dur, int[][] edges)
    {
        int n = dur.Length;
        var adj = new List<int>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<int>();
        var indeg = new int[n];
        foreach (var e in edges) { adj[e[0]].Add(e[1]); indeg[e[1]]++; }
        var finish = new long[n]; // finish[v] = thời điểm quest v xong
        var q = new Queue<int>();
        for (int i = 0; i < n; i++)
            if (indeg[i] == 0) { q.Enqueue(i); finish[i] = dur[i]; }
        int done = 0; long best = 0;
        while (q.Count > 0)
        {
            int u = q.Dequeue(); done++;
            best = Math.Max(best, finish[u]);
            foreach (int v in adj[u])
            {
                finish[v] = Math.Max(finish[v], finish[u] + dur[v]); // chờ tiên quyết xong CHẬM nhất
                if (--indeg[v] == 0) q.Enqueue(v);
            }
        }
        return done == n ? best : -1;
    }

    // ===== ĐỀ 3 =====

    // Bài 7 — Robot mô phỏng. Bắt đầu ở 'S' hướng Bắc; F tiến 1 ô nếu không tường/không ra biên; L/R xoay.
    // O(|lệnh|). Trả "r c D".
    static string RobotWalk(string[] g, string cmds)
    {
        int R = g.Length, C = g[0].Length, r = 0, c = 0;
        for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) if (g[i][j] == 'S') { r = i; c = j; }
        int[] dr = { -1, 0, 1, 0 }, dc = { 0, 1, 0, -1 }; // N, E, S, W theo chiều kim đồng hồ
        string name = "NESW";
        int d = 0;
        foreach (char ch in cmds)
        {
            if (ch == 'L') d = (d + 3) % 4;       // +3 thay vì -1: tránh số âm
            else if (ch == 'R') d = (d + 1) % 4;
            else if (ch == 'F')
            {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nc >= 0 && nr < R && nc < C && g[nr][nc] != '#') { r = nr; c = nc; }
            }
        }
        return $"{r} {c} {name[d]}";
    }

    // Bài 8 — Chia đợt quái cho k ngày (đoạn liên tiếp), tối thiểu hoá tổng HP lớn nhất của một ngày.
    // Binary search trên đáp án. O(n log tổng), O(1) bộ nhớ.
    static long SplitDays(int[] hp, int k)
    {
        long lo = hp.Max(), hi = hp.Sum(x => (long)x); // đáp án nằm trong [max, tổng]
        while (lo < hi)
        {
            long mid = lo + (hi - lo) / 2;
            int days = 1; long cur = 0;
            foreach (int x in hp)
            {
                if (cur + x > mid) { days++; cur = 0; } // mở ngày mới
                cur += x;
            }
            if (days <= k) hi = mid; else lo = mid + 1; // đủ ngày -> thử giảm sức chứa
        }
        return lo;
    }

    // Bài 9 — Knapsack hai tài nguyên: mỗi nhiệm vụ tốn (thể lực, thời gian), thưởng v. Ngân sách S, T.
    // dp[s,t] = thưởng tối đa. O(n*S*T) thời gian, O(S*T) bộ nhớ. Duyệt NGƯỢC cả hai chiều (0/1).
    static int TwoBudgetKnapsack(int[][] items, int S, int T)
    {
        var dp = new int[S + 1, T + 1];
        foreach (var it in items)
        {
            int cs = it[0], ct = it[1], v = it[2];
            for (int s = S; s >= cs; s--)
                for (int t = T; t >= ct; t--)
                    dp[s, t] = Math.Max(dp[s, t], dp[s - cs, t - ct] + v);
        }
        return dp[S, T];
    }

    // ===== BÀI LẺ =====

    // Bài 10 — Dãy id liên tiếp dài nhất. HashSet, chỉ bắt đầu đếm từ đầu dãy. O(n).
    static int LongestRun(int[] ids)
    {
        var set = new HashSet<int>(ids);
        int best = 0;
        foreach (int x in set)
        {
            if (set.Contains(x - 1)) continue; // không phải đầu dãy -> bỏ qua, giữ O(n)
            int len = 1;
            while (set.Contains(x + len)) len++;
            best = Math.Max(best, len);
        }
        return best;
    }

    // Bài 11 — Quái mạnh hơn kế tiếp cách bao xa. Monotonic stack lưu CHỈ SỐ. O(n).
    static int[] StepsToStronger(int[] p)
    {
        var res = new int[p.Length];
        var st = new Stack<int>();
        for (int i = 0; i < p.Length; i++)
        {
            while (st.Count > 0 && p[st.Peek()] < p[i]) { int j = st.Pop(); res[j] = i - j; }
            st.Push(i);
        }
        return res; // phần tử còn trong stack giữ 0
    }

    // Bài 12 — Đếm đường đi phải/xuống có tường, chia dư 1e9+7. DP một hàng. O(R*C), bộ nhớ O(C).
    static int CountPaths(string[] g)
    {
        const int MOD = 1_000_000_007;
        int R = g.Length, C = g[0].Length;
        var dp = new int[C];
        dp[0] = g[0][0] == '#' ? 0 : 1;
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++)
            {
                if (g[r][c] == '#') { dp[c] = 0; continue; }
                if (r == 0 && c == 0) continue;
                int fromUp = dp[c];                // dp[c] cũ = ô phía trên
                int fromLeft = c > 0 ? dp[c - 1] : 0;
                dp[c] = (fromUp + fromLeft) % MOD; // % sau MỖI phép cộng
            }
        return dp[C - 1];
    }

    // Bài 13 — Nhóm tên vật phẩm là hoán vị của nhau. Khoá = chuỗi đã sort. O(n * L log L).
    static (int groups, int biggest) AnagramGroups(string[] words)
    {
        var map = new Dictionary<string, int>();
        foreach (string w in words)
        {
            var arr = w.ToCharArray(); Array.Sort(arr);
            string key = new string(arr);
            map[key] = map.TryGetValue(key, out int c) ? c + 1 : 1;
        }
        return (map.Count, map.Count == 0 ? 0 : map.Values.Max());
    }

    // Bài 14 — Đếm đội hình đúng k anh hùng có tổng sức mạnh <= P (n <= 20). Backtracking + cắt tỉa trên mảng đã sort.
    // Tệ nhất O(C(n,k)), cắt tỉa giảm mạnh.
    static int CountSquads(int[] power, int k, int P)
    {
        var a = (int[])power.Clone(); Array.Sort(a);
        int count = 0;
        void Go(int start, int picked, long sum)
        {
            if (picked == k) { count++; return; }
            for (int i = start; i < a.Length; i++)
            {
                if (sum + a[i] > P) break;                  // đã sort tăng dần -> các phần tử sau chỉ lớn hơn
                if (a.Length - i < k - picked) break;       // không đủ người để chọn tiếp
                Go(i + 1, picked + 1, sum + a[i]);          // sum truyền theo giá trị nên không cần "bỏ chọn"
            }
        }
        Go(0, 0, 0);
        return count;
    }

    // Bài 15 — Buff mạnh nhất trong cửa sổ k. Deque đơn điệu giảm lưu chỉ số. O(n), O(k).
    static int[] WindowMax(int[] a, int k)
    {
        var res = new List<int>();
        var dq = new LinkedList<int>();
        for (int i = 0; i < a.Length; i++)
        {
            while (dq.Count > 0 && a[dq.Last.Value] <= a[i]) dq.RemoveLast(); // phần tử nhỏ hơn không bao giờ là max nữa
            dq.AddLast(i);
            if (dq.First.Value <= i - k) dq.RemoveFirst();                    // chỉ số trượt khỏi cửa sổ
            if (i >= k - 1) res.Add(a[dq.First.Value]);
        }
        return res.ToArray();
    }

    // ===== KHUNG KIỂM =====
    static int fails = 0;
    static void Check<T>(string name, T actual, T expected)
    {
        bool ok = EqualityComparer<T>.Default.Equals(actual, expected);
        if (!ok) fails++;
        Console.WriteLine($"{(ok ? "OK  " : "FAIL")} {name}: {actual}" + (ok ? "" : $" (mong đợi {expected})"));
    }

    public static void Main()
    {
        Console.OutputEncoding = Encoding.UTF8;
        string Slots(List<(int id, int qty)> s) => string.Join(" ", s.Select(x => $"{x.id}:{x.qty}"));

        // Đề 1
        Check("B1 Inventory cap=99", Slots(PackInventory(new[] { new[] { 1, 150 }, new[] { 2, 40 }, new[] { 1, 60 } }, 99)), "1:99 1:99 1:12 2:40");
        Check("B1 Inventory chia hết", Slots(PackInventory(new[] { new[] { 7, 99 }, new[] { 7, 99 } }, 99)), "7:99 7:99");
        Check("B2 MinHits [2,3,1,2,4,3] S=7", MinHits(new[] { 2, 3, 1, 2, 4, 3 }, 7), 2);
        Check("B2 MinHits không đủ", MinHits(new[] { 1, 1, 1 }, 100), 0);
        Check("B3 Dungeon 3x3", MinInitialHp(new[] { new[] { -2, -3, 3 }, new[] { -5, -10, 1 }, new[] { 10, 30, -5 } }), 7);
        Check("B3 Dungeon toàn hồi máu", MinInitialHp(new[] { new[] { 5 } }), 1);

        // Đề 2
        Check("B4 Ranks [100,90,90,80]", string.Join(",", Ranks(new[] { 100, 90, 90, 80 })), "1,2,2,4");
        Check("B4 Ranks toàn bằng nhau", string.Join(",", Ranks(new[] { 50, 50, 50 })), "1,1,1");
        Check("B5 Fountain 3x4", FarthestFromFountain(new[] { "F..#", ".#..", "...F" }), 2);
        Check("B5 Fountain không tới được", FarthestFromFountain(new[] { "F#." }), -1);
        Check("B6 CriticalPath kim cương", CriticalPath(new[] { 3, 2, 4, 1 }, new[] { new[] { 0, 1 }, new[] { 0, 2 }, new[] { 1, 3 }, new[] { 2, 3 } }), 8L);
        Check("B6 CriticalPath có vòng", CriticalPath(new[] { 1, 1 }, new[] { new[] { 0, 1 }, new[] { 1, 0 } }), -1L);

        // Đề 3
        var room = new[] { "...", ".#.", "S.." };
        Check("B7 Robot FFRFFLF", RobotWalk(room, "FFRFFLF"), "0 2 N");
        Check("B7 Robot RFLF (đâm tường)", RobotWalk(room, "RFLF"), "2 1 N");
        Check("B8 SplitDays [7,2,5,10,8] k=2", SplitDays(new[] { 7, 2, 5, 10, 8 }, 2), 18L);
        Check("B8 SplitDays k=n", SplitDays(new[] { 7, 2, 5, 10, 8 }, 5), 10L);
        Check("B9 TwoBudget S=5 T=5", TwoBudgetKnapsack(new[] { new[] { 2, 3, 5 }, new[] { 3, 2, 4 }, new[] { 4, 4, 7 }, new[] { 1, 1, 2 } }, 5, 5), 9);

        // Bài lẻ
        Check("B10 LongestRun [100,4,200,1,3,2]", LongestRun(new[] { 100, 4, 200, 1, 3, 2 }), 4);
        Check("B10 LongestRun rỗng", LongestRun(new int[0]), 0);
        Check("B11 StepsToStronger", string.Join(",", StepsToStronger(new[] { 73, 74, 75, 71, 69, 72, 76, 73 })), "1,1,4,2,1,1,0,0");
        Check("B12 CountPaths 3x3 tường giữa", CountPaths(new[] { "...", ".#.", "..." }), 2);
        Check("B12 CountPaths 3x3 trống", CountPaths(new[] { "...", "...", "..." }), 6);
        var big = Enumerable.Repeat(new string('.', 18), 18).ToArray();
        Check("B12 CountPaths 18x18 (mod)", CountPaths(big), 333606206);
        Check("B13 AnagramGroups", AnagramGroups(new[] { "eat", "tea", "tan", "ate", "nat", "bat" }), (3, 3));
        Check("B14 CountSquads [3,1,4,1,5] k=2 P=5", CountSquads(new[] { 3, 1, 4, 1, 5 }, 2, 5), 5);
        Check("B15 WindowMax k=3", string.Join(",", WindowMax(new[] { 1, 3, -1, -3, 5, 3, 6, 7 }, 3)), "3,3,5,5,6,7");

        Console.WriteLine(fails == 0 ? "TẤT CẢ OK" : $"CÓ {fails} CA FAIL");
    }
}
```

**Chạy thử**
- Chạy `dotnet run` (nếu console hiện sai dấu tiếng Việt thì đặt `chcp 65001` trước). Phải ra đúng 27 dòng: 26 dòng bắt đầu bằng `OK` rồi dòng cuối `TẤT CẢ OK`:

```
OK   B1 Inventory cap=99: 1:99 1:99 1:12 2:40
OK   B1 Inventory chia hết: 7:99 7:99
OK   B2 MinHits [2,3,1,2,4,3] S=7: 2
OK   B2 MinHits không đủ: 0
OK   B3 Dungeon 3x3: 7
OK   B3 Dungeon toàn hồi máu: 1
OK   B4 Ranks [100,90,90,80]: 1,2,2,4
OK   B4 Ranks toàn bằng nhau: 1,1,1
OK   B5 Fountain 3x4: 2
OK   B5 Fountain không tới được: -1
OK   B6 CriticalPath kim cương: 8
OK   B6 CriticalPath có vòng: -1
OK   B7 Robot FFRFFLF: 0 2 N
OK   B7 Robot RFLF (đâm tường): 2 1 N
OK   B8 SplitDays [7,2,5,10,8] k=2: 18
OK   B8 SplitDays k=n: 10
OK   B9 TwoBudget S=5 T=5: 9
OK   B10 LongestRun [100,4,200,1,3,2]: 4
OK   B10 LongestRun rỗng: 0
OK   B11 StepsToStronger: 1,1,4,2,1,1,0,0
OK   B12 CountPaths 3x3 tường giữa: 2
OK   B12 CountPaths 3x3 trống: 6
OK   B12 CountPaths 18x18 (mod): 333606206
OK   B13 AnagramGroups: (3, 3)
OK   B14 CountSquads [3,1,4,1,5] k=2 P=5: 5
OK   B15 WindowMax k=3: 3,3,5,5,6,7
TẤT CẢ OK
```

- Phá thử để thấy vì sao có comment: ở `MinInitialHp` bỏ `Math.Max(1, need)` thì ca 1×1 trả `-4` thay vì `1`. Ở `Ranks` ghi đè `rankOf` mỗi lần gặp (bỏ `if (!ContainsKey)`) thì ca `100,90,90,80` ra hạng `1,3,3,4`. Ở `CountPaths` bỏ hẳn `% MOD` thì ca 18×18 tràn `int` và ra sai. Ở `TwoBudgetKnapsack` đổi **cả hai** vòng `s` và `t` thành chạy xuôi thì một nhiệm vụ có thể bị dùng nhiều lần, đáp án sai thành lớn hơn đáp án đúng (chạy thử để thấy con số cụ thể).
- Tự gõ lại từng hàm không nhìn rồi so với bản này; bài nào quá giờ gợi ý ở trên thì đánh dấu ôn lại sau hai ngày.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Bài gộp túi đồ (cùng id, mỗi ô tối đa 99) dùng cách gì, độ phức tạp bao nhiêu, bẫy ở đâu?**
  → Dùng `Dictionary<int, long>` cộng tổng theo id rồi chia `t / cap` ô đầy và `t % cap` ô dư, ghi thêm thứ tự xuất hiện đầu tiên vì Dictionary không đảm bảo thứ tự chèn. Thời gian O(n + số ô), bộ nhớ O(số id). Bẫy là tổng chia hết thì không được thêm ô rỗng, và cộng tổng nên dùng `long` vì nhiều dòng cùng id dễ vượt `int`.
- `Junior` **Bảng xếp hạng đồng hạng kiểu 1-2-2-4 làm thế nào để tránh O(n²)?**
  → Sort bản sao giảm dần rồi ghi vào dictionary vị trí đầu tiên của mỗi mức điểm cộng một; sau đó tra dictionary cho từng người. Tổng O(n log n) vì có một lần sort, còn đếm "bao nhiêu người cao hơn" cho từng người là 10^10 phép với n = 10^5. Bẫy là nhầm với dense rank 1-2-2-3 và viết comparer `b - a` bị tràn.
- `Mid` **Bài chuỗi đòn ngắn nhất có tổng ≥ S: vì sao sliding window đúng, và khi nào nó sai?**
  → Đúng vì mọi `dmg` dương nên mở rộng phải làm tổng tăng, thu trái làm tổng giảm — tính đơn điệu đó cho phép hai con trỏ chỉ đi tới, tổng O(n). Nếu đề cho phép số âm thì thu trái có thể làm tổng tăng, cửa sổ mất đơn điệu và phải chuyển sang prefix sum cộng cấu trúc tra cứu. Bẫy cụ thể là dùng `if` thay `while` khi thu cửa sổ.
- `Mid` **Hầm ngục: vì sao phải chạy DP từ đích về, không chạy xuôi từ đầu?**
  → Vì có hai yêu cầu cùng lúc: tổng cuối và HP không bao giờ xuống dưới 1 ở giữa đường. Chạy xuôi giữ "tổng nhỏ nhất" thì bỏ sót đường có đoạn đầu chết dù tổng tốt; chạy ngược định nghĩa `dp[r][c]` là máu tối thiểu **khi bước vào** ô, nên công thức `max(1, min(phải, xuống) - g)` đảm bảo cả hai. Độ phức tạp O(R·C).
- `Mid` **Đài hồi máu gần nhất: vì sao BFS nhiều nguồn tốt hơn BFS từ từng ô trống?**
  → Đẩy mọi đài vào queue với khoảng cách 0 ngay từ đầu, các sóng loang đồng thời nên lần đầu một ô được chạm là đúng khoảng cách tới đài gần nhất. Cả lưới chỉ một lần BFS O(R·C) = 10^6; chạy riêng từng ô trống là O((RC)²) = 10^12 và quá giờ. Bẫy là phải đánh dấu đã thăm lúc đẩy vào hàng đợi, và nhớ trường hợp ô trống bị tường bao kín trả `-1`.
- `Mid` **Quest phụ thuộc có song song: vì sao là "đường dài nhất", và kiểm vòng thế nào?**
  → Các quest song song nên thời gian tổng bằng chuỗi tiên quyết nặng nhất, tức đường dài nhất trong DAG. Dùng topo sort Kahn và `finish[v] = max(finish[v], finish[u] + dur[v])` khi lấy `u` ra; số quest lấy ra nhỏ hơn n nghĩa là có vòng và trả `-1`. Cần `long` cho `finish` vì 10^5 quest × 10^9 là 10^14.
- `Mid` **Robot đi theo lệnh: bẫy thường gặp là gì?**
  → Hai chỗ: xoay trái viết `(d - 1) % 4` ra số âm trong C# (`-1 % 4` là `-1`), nên dùng `(d + 3) % 4`; và kiểm tường trước kiểm biên làm văng `IndexOutOfRange`, phải kiểm biên trước. Ngoài ra đâm tường chỉ làm robot đứng yên, vẫn đọc lệnh tiếp. Bài mô phỏng nên mã hoá hướng bằng chỉ số 0–3 để xoay chỉ là phép cộng modulo.
- `Mid` **Chia đợt quái cho k ngày để ngày nặng nhất nhẹ nhất: nhận ra binary search thế nào?**
  → Cụm "tối thiểu hoá giá trị lớn nhất" cùng tính đơn điệu — sức chứa lớn hơn thì không cần nhiều ngày hơn — là dấu hiệu binary search trên đáp án. Biên là `[max(hp), tổng]`, hàm kiểm đi tham lam mở ngày mới khi vượt `mid`, tổng O(n log tổng) ≈ 47 vòng với n = 10^5. Tổng lên 10^14 nên mọi biến phải `long`.
- `Senior` **Hai ngân sách (thể lực và thời gian): mở rộng knapsack thế nào, vì sao hai vòng đều chạy ngược?**
  → Thêm một chiều: `dp[s][t]` là thưởng tối đa với tối đa s thể lực và t phút, mỗi nhiệm vụ cập nhật từ `dp[s - st][t - tm]`. Cả hai vòng chạy từ lớn xuống nhỏ để ô được đọc vẫn là trạng thái *trước* khi thêm nhiệm vụ này; chạy xuôi cả hai thì nhiệm vụ bị lấy nhiều lần (chỉ ngược một vòng là đủ khi chi phí ở chiều đó luôn dương; nhiệm vụ tốn 0 thể lực sẽ phá điều đó, nên giữ cả hai ngược cho chắc). Độ phức tạp O(n·S·T), với 100×100×100 là 10^6.
- `Junior` **Dãy id liên tiếp dài nhất O(n) bằng HashSet: vì sao vòng đếm lồng không làm thành O(n²)?**
  → Vì chỉ những giá trị mà `x - 1` không có trong set mới được bắt đầu đếm, tức mỗi dãy chỉ được đếm đúng một lần từ đầu dãy. Tổng số bước của mọi vòng đếm bằng số phần tử trong set, tức O(n). Bỏ điều kiện đầu dãy thì dãy dài 10^5 bị đếm lại từ mọi vị trí giữa và thành O(n²).
- `Mid` **Quái mạnh hơn kế tiếp: vì sao monotonic stack là O(n) dù có `while` lồng trong `for`?**
  → Mỗi chỉ số được push đúng một lần và pop tối đa một lần, nên tổng số lần pop không vượt n bất kể vòng `while` trông lồng. Stack lưu chỉ số để tính được khoảng cách `i - j`, và điều kiện pop là `<` chứ không phải `≤` vì bằng nhau không tính là mạnh hơn hẳn. Phần tử còn trong stack cuối cùng không có đối thủ nên giữ `0`.
- `Mid` **Đếm đường đi có tường mod 1e9+7: gặp lỗi tràn ở đâu, và bỏ được bộ nhớ O(R·C) không?**
  → Không chia dư thì giá trị cộng dồn vượt `int` rất sớm (lưới trống 18×18 đã ra 2,3 tỉ), nên phải `% MOD` ngay sau mỗi phép cộng. Bộ nhớ giảm còn O(C) vì ô `(r, c)` chỉ cần ô trên (giá trị cũ của `dp[c]`) và ô trái (`dp[c-1]` của hàng hiện tại). Gặp tường phải đặt `dp[c] = 0`, nếu quên thì giữ nhầm số cách của hàng trên.
- `Junior` **Nhóm tên vật phẩm là hoán vị: dùng khoá gì, sai ở đâu?**
  → Khoá là chuỗi sau khi sort ký tự, đếm bằng `Dictionary<string, int>`; độ phức tạp O(n · L log L) với L ≤ 20 nên rất nhỏ. Nếu dùng mảng đếm `int[26]` làm khoá thì C# so sánh theo tham chiếu, mỗi tên thành một khoá riêng — phải đổi mảng đếm thành chuỗi bằng `string.Join`. Nhớ `ToCharArray` trước khi sort vì `string` bất biến.
- `Mid` **Đếm đội hình đúng k anh hùng có tổng ≤ P với n ≤ 20: chọn backtracking hay bitmask, cắt tỉa ra sao?**
  → Cả hai đều ổn vì tối đa C(20,10) = 184 756 đội. Backtracking sau khi sort tăng dần cắt được mạnh: gặp `tổng + a[i] > P` thì `break` luôn vì mọi phần tử sau chỉ lớn hơn; bitmask luôn duyệt 2^20 ≈ 10^6 tập. Bẫy là duyệt lại từ 0 ở mỗi tầng làm đếm trùng tập, phải duyệt từ `start`.
- `Senior` **Buff lớn nhất trong cửa sổ k, n = 10^6: vì sao deque đơn điệu, và vì sao không dùng heap?**
  → Deque lưu chỉ số giá trị giảm dần: phần tử mới lớn hơn thì mọi phần tử nhỏ hơn ở cuối không bao giờ là max nữa nên pop luôn; đầu deque trượt khỏi cửa sổ thì bỏ. Mỗi chỉ số vào ra một lần nên O(n), trong khi heap cho O(n log n) và cần xoá lười phần tử hết hạn. Tránh `List.RemoveAt(0)` làm deque vì O(n) mỗi lần.
- `Senior` **Người chấm hỏi: "Nếu n = 10^6 thì bài X của anh còn chạy kịp không?" Anh trả lời thế nào?**
  → Đọc lại độ phức tạp đã ghi trên hàm và đổi ra số phép: O(n log n) ở 10^6 khoảng 2·10^7 phép nên dưới một giây, O(n²) là 10^12 nên chắc chắn quá giờ. Sau đó nói thẳng điểm sẽ chậm trước: đọc input và in output (dùng `StreamReader` và `StringBuilder`) chứ không phải thuật toán. Nếu bài dùng đệ quy thì thêm là phải đổi sang stack tường minh để khỏi tràn call stack.
- `Mid` **"Bỏ được bộ nhớ phụ không?" — hỏi lại sau khi anh nộp bài dùng mảng 2 chiều, trả lời thế nào?**
  → Nêu ngay cái gì thật sự cần: DP lưới ô `(r, c)` chỉ đọc hàng trên và ô bên trái nên cuộn một hàng, O(R·C) còn O(C); sliding window và hai con trỏ vốn đã O(1). Rồi nói cái giá: cuộn hàng thì không dựng lại được đường đi. Ví dụ bài hầm ngục chỉ cần con số HP nên cuộn hàng an toàn.
- `Mid` **Hầm ngục có thêm ô được đi cả bốn hướng thì còn DP được không?**
  → Không, vì có thể đi vòng lại ô cũ nên thứ tự điền bảng không còn hướng cố định; khi đó bài thành đường đi trên đồ thị có trọng số, dùng Dijkstra trên trạng thái hoặc kết hợp binary search trên HP khởi đầu cộng BFS kiểm khả thi. Lý do cốt lõi là DP chỉ đúng khi đồ thị trạng thái không có chu trình. Xem [[pathfinding]] cho phần đường đi có trọng số.
- `Mid` **Bài quest phụ thuộc: đề đổi thành "chỉ có k người làm song song" thì sao?**
  → Bài trở nên khó hơn nhiều (lập lịch có tài nguyên, thuộc nhóm NP-khó ở dạng tổng quát), nên đề thi sẽ không ra dạng đó trừ khi đơn giản hoá, ví dụ mỗi quest dài 1 đơn vị. Khi đó dùng topo sort theo từng đợt: mỗi đợt lấy tối đa k quest đang sẵn sàng (cho lịch hợp lệ chứ chưa chắc tối ưu, trừ cấu trúc đặc biệt). Câu trả lời tốt là nói rõ đã đổi bài từ đường dài nhất sang lập lịch tham lam và hỏi lại ràng buộc.
- `Junior` **Khi đề có giá trị tới 10^9 và n tới 10^5, những chỗ nào trong bộ này phải đổi sang `long`?**
  → Tổng sát thương cửa sổ (bài 2), tổng máu chia ngày (bài 8, lên 10^14), thời điểm hoàn thành quest (bài 6), tổng cộng dồn theo id (bài 1) và tổng sức mạnh đội hình (bài 14). Lý do là `int` dừng ở khoảng 2,1 tỉ, và những đại lượng này đều là tổng của nhiều số lớn. Nhân thì ép kiểu trước: `(long)a * b`.
- `Mid` **Cùng một lưới, khi nào chọn BFS, Dijkstra, hay DP?**
  → Chỉ đi phải/xuống và hỏi số cách hoặc tổng nhỏ nhất thì DP O(R·C); đi bốn hướng với mọi bước giá bằng nhau thì BFS; đi bốn hướng nhưng chi phí ô khác nhau thì Dijkstra O(RC log RC). Dấu hiệu chuyển là chu trình: có thể quay lại ô cũ thì DP thứ tự cố định không còn dùng được. Nhiều nguồn như bài đài hồi máu vẫn là một lần BFS.
- `Senior` **Anh chọn bài nào làm trước trong đề ba câu, và nộp thế nào nếu hết giờ giữa chừng?**
  → Đọc cả ba câu trong 5 phút rồi làm câu chắc nhất trước, không theo số thứ tự; mỗi câu nộp bản brute force đúng trước để ăn test nhỏ, tối ưu sau. Câu khó như hầm ngục hay hai ngân sách còn dư thì cứ nộp bản đúng nhưng chậm, vì bản tối ưu dở dang ăn 0. Dành 10 phút cuối rà biên và tràn số.
- `Mid` **Hai đáp án khác nhau trên test của anh: bài mô phỏng robot chạy ra sai, anh gỡ thế nào?**
  → Tự dò bằng tay với ví dụ nhỏ trong đề, in trạng thái sau từng lệnh và so với bảng viết tay; mô phỏng sai thường nằm ở thứ tự kiểm tra (biên trước tường) hoặc quy ước hướng/hàng/cột. Vì mô phỏng xác định nên sai đúng một chỗ đầu tiên là tìm được, bằng cách chia đôi chuỗi lệnh. Không đoán rồi sửa nhiều chỗ cùng lúc vì không biết chỗ nào đã đúng.
- `Senior` **Người chấm đưa test làm hỏng bài của anh (ví dụ mảng toàn bằng nhau). Anh phản ứng thế nào?**
  → Nói thẳng điều kiện biên đã bỏ sót, sửa đúng chỗ, rồi tự thêm hai test cùng họ (rỗng, một phần tử) để cho thấy mình rà theo họ lỗi chứ không vá một ca. Người chấm đánh giá cách bạn xử lý lỗi cao hơn việc không có lỗi. Với bài như bảng xếp hạng thì ca toàn bằng nhau phải ra hạng 1 cho tất cả, kiểm nhanh bằng ví dụ ba người điểm 50.
- `Mid` **Anh dùng `Dictionary` cho bảng hạng, có lúc nào `Dictionary` chậm hơn mảng, và bài này có cần không?**
  → Khi miền giá trị nhỏ và biết trước (ví dụ ký tự a–z, điểm 0–100) thì mảng đếm nhanh hơn do không băm. Bài bảng hạng có điểm đến 10^9 nên không lập mảng được; có thể nén toạ độ bằng sort rồi tra bằng binary search, nhưng `Dictionary` vẫn O(1) kỳ vọng và gọn hơn. Chọn gọn vì n = 10^5 chưa đủ ép tối ưu hằng số.

**Khung trả lời 60 giây** — "Anh trình bày lời giải của mình cho người chấm thế nào?"

> Tôi làm theo bốn bước. Trước hết tôi nói lại đề bằng lời của mình và đọc giới hạn: ví dụ n bằng 10^5 thì tôi cần O(n log n) trở xuống, n² là 10^10 chắc chắn quá giờ. Rồi tôi nêu dạng bài và lý do chọn cấu trúc dữ liệu, ví dụ đây là đoạn liên tiếp với giá trị dương nên tôi dùng sliding window, hoặc đây là min của max nên tôi dùng binary search trên đáp án. Sau đó tôi nói độ phức tạp thời gian và bộ nhớ, và chỉ ra hai bẫy tôi đã xử lý như tổng cần `long` hay chặn dưới bằng 1. Cuối cùng tôi tự chạy ví dụ trong đề và một ca biên, vì kết quả chạy thuyết phục hơn lời tôi nói.

**Họ sẽ đào tiếp**

- *"Nếu n = 10^6 thì sao?"* → đổi độ phức tạp ra số phép, chỉ ra điểm nghẽn thật là I/O và cấp phát, không chỉ thuật toán; nếu đệ quy thì chuyển sang stack tường minh.
- *"Bỏ bộ nhớ phụ được không?"* → nói cái gì cuộn được (DP lưới theo hàng) và cái giá mất (không dựng lại được đường đi).
- *"Có cách nhanh hơn không?"* → so sánh với bản brute force bằng số liệu cụ thể, và nói lý do bản hiện tại là tối ưu hoặc điều kiện nào làm nó tối ưu hơn được.
- *"Test nào làm chương trình của anh sai?"* → kể tên các họ biên: rỗng, một phần tử, toàn bằng nhau, tràn `int`, vô nghiệm, tường bao kín; tự ra ví dụ chứ không đáp "chắc không".
- *"Đề đổi một chút thì lời giải còn đúng không?"* → nêu giả thiết mà lời giải dựa vào (giá trị dương, DAG, đi phải/xuống) và việc nào phá giả thiết đó.
- *"Vì sao anh chọn cấu trúc dữ liệu này mà không phải cái kia?"* → nêu thao tác chủ đạo và chi phí của nó (`Dictionary` O(1) tra cứu, deque O(1) hai đầu, `List.RemoveAt(0)` O(n)).
- *"Anh sẽ test tự động bài này thế nào?"* → so với bản brute force trên nhiều test ngẫu nhiên nhỏ, cộng test biên cố định và một test n tối đa để đo thời gian.

**Cờ đỏ**

- Gõ ngay khi đọc xong đề mà chưa nhìn giới hạn n, rồi nộp O(n²) cho n = 10^5.
- Không chạy ví dụ trong đề trước khi nộp, hoặc chạy xong mới biết kết quả sai và sửa mò nhiều chỗ cùng lúc.
- Dùng `int` cho tổng, tích hoặc cộng dồn rồi nói "chắc không tràn" mà không tính thử giá trị lớn nhất.
- Không nói được độ phức tạp của chính code mình vừa viết, hoặc nói sai (ví dụ nhận O(n) cho `while` lồng mà quên mỗi phần tử vào ra một lần).
- Chuyển sang bài khác ngay khi bài đầu có bản brute force đúng chưa nộp, rốt cuộc không bài nào có điểm.
- Dùng comparer `x - y` hoặc quên rằng `Array.Sort` không ổn định rồi phụ thuộc thứ tự phần tử bằng nhau.
- Phản ứng phòng thủ khi người chấm chỉ ra test fail ("đề không nói thế") thay vì sửa và hỏi lại ràng buộc.

**Số / ví dụ nên thuộc**

- Bảng giới hạn: n ≤ 10^5 cần O(n log n); n ≤ 10^6 cần O(n); n ≤ 5 000 mới cho O(n²); n ≤ 20 cho O(2^n).
- `int` dừng ở khoảng 2,1 · 10^9; tổng 10^5 số mỗi số 10^9 là 10^14, cần `long`.
- `-7 % 2 = -1` trong C#; xoay trái an toàn là `(d + 3) % 4`.
- Binary search trên đáp án mất khoảng log₂(10^14) ≈ 47 vòng.
- Bài lẻ có ví dụ để tự kiểm: lưới trống 18×18 → `333606206`; `100 4 200 1 3 2` → `4`; `73 74 75 71 69 72 76 73` → `1 1 4 2 1 1 0 0`.
- C(20,10) = 184 756, nên n = 20 backtracking chọn k người vẫn nhỏ so với 2^20 ≈ 10^6.
- Mỗi chỉ số vào và ra stack/deque đúng một lần nên `while` lồng `for` vẫn O(n).
- Knapsack 0/1 chạy chiều ngược; thêm một ngân sách thì thêm một chiều và một vòng ngược.
