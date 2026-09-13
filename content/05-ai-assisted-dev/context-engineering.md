---
id: context-engineering
title: Ngữ cảnh và token
summary: Vì sao phiên chat dài tốn tiền theo bình phương, bảy đòn bẩy tiết kiệm xếp theo hiệu quả thật, cách cho agent mục lục thay vì cả repo, và dấu hiệu bạn đã cắt ngữ cảnh quá tay.
status: deep
read: 125
level: intermediate
order: 35
tags: [ai-dev, context, cost, agent, performance]
related: [ai-assistant-architecture, knowledge-base-for-agents, coding-agents, prompt-patterns, ai-eval]
---

Tiết kiệm token thường bị hiểu là chuyện tiền. Tiền chỉ là nửa lý do, và là nửa ít quan trọng hơn.

Nửa còn lại: **ngữ cảnh loãng làm chất lượng giảm**. Một agent được đưa đúng năm file trả lời tốt hơn agent tự mò năm mươi file — không phải vì nó "quá tải", mà vì thứ quan trọng bị chôn giữa đống không liên quan, và vì mọi dòng thừa đều là một cơ hội để nó bám vào chi tiết sai. Hai mục tiêu — rẻ hơn và đúng hơn — đi cùng một hướng, nên gần như mọi cách tiết kiệm token trong node này cũng làm kết quả tốt lên.

## Token đi đâu

Mỗi lượt bạn gõ một câu ngắn, nhưng thứ được gửi đi là **toàn bộ phiên từ đầu**:

| Thành phần | Ai đưa vào | Lặp lại mỗi lượt? |
|---|---|---|
| Prompt hệ thống của công cụ | Công cụ | Có |
| File luật ở gốc repo (`AGENTS.md`, `CLAUDE.md`) | Bạn, một lần | Có |
| Mục lục / danh sách file | Bạn hoặc agent | Có |
| Nội dung file agent đã mở | Agent | **Có — kể cả file mở từ 30 lượt trước** |
| Output lệnh đã chạy (build, test, log) | Agent | Có |
| Câu hỏi và câu trả lời trước đó | Cả hai | Có |
| Lượt hiện tại | Bạn | — |

Hệ quả ít người tính ra: **chi phí một phiên tăng theo bình phương số lượt.** Mỗi lượt thêm khoảng 2.000 token vào lịch sử thì lượt thứ 40 phải gửi lại ~80.000 token; cộng dồn cả phiên là cỡ 1,6 triệu token — trong khi mười lượt đầu chỉ tốn khoảng 100.000. Cùng khối lượng công việc, cùng model, khác nhau chỗ bạn đóng phiên lúc nào.

<figure class="fig">
<svg viewBox="0 0 660 230" role="img" aria-label="Hai biểu đồ: bên trái là ngân sách một lượt chia theo thành phần với phần lịch sử phình to nhất; bên phải là chi phí tích luỹ của phiên tăng theo hình tam giác khi số lượt tăng">
  <text x="20" y="20" class="fig-label" font-size="12">Một lượt gửi đi những gì</text>
  <rect x="20" y="34" width="52" height="26" rx="4" class="fig-box" fill="#6ea8fe" fill-opacity="0.35"/>
  <rect x="72" y="34" width="44" height="26" rx="4" class="fig-box" fill="#51cf9b" fill-opacity="0.35"/>
  <rect x="116" y="34" width="70" height="26" rx="4" class="fig-box" fill="#ffd43b" fill-opacity="0.35"/>
  <rect x="186" y="34" width="114" height="26" rx="4" class="fig-box" fill="#ff8787" fill-opacity="0.35"/>
  <text x="46" y="76" text-anchor="middle" class="fig-muted" font-size="9">luật</text>
  <text x="94" y="76" text-anchor="middle" class="fig-muted" font-size="9">mục lục</text>
  <text x="151" y="76" text-anchor="middle" class="fig-muted" font-size="9">file đã mở</text>
  <text x="243" y="76" text-anchor="middle" class="fig-muted" font-size="9">lịch sử hội thoại</text>
  <text x="20" y="104" class="fig-muted" font-size="10">Ba phần đầu ổn định → cache được.</text>
  <text x="20" y="120" class="fig-muted" font-size="10">Phần đỏ phình mỗi lượt và không bao giờ co lại.</text>
  <text x="20" y="146" class="fig-muted" font-size="10">Đóng phiên = cắt phần đỏ về 0.</text>
  <line x1="330" y1="34" x2="330" y2="200" class="fig-line" stroke-dasharray="3 3"/>
  <text x="360" y="20" class="fig-label" font-size="12">Chi phí tích luỹ theo số lượt</text>
  <line x1="368" y1="180" x2="640" y2="180" class="fig-line"/>
  <line x1="368" y1="180" x2="368" y2="40" class="fig-line"/>
  <path d="M368 180 L640 44" class="fig-line" stroke="#ff8787" fill="none"/>
  <path d="M368 180 L640 44 L640 180 Z" fill="#ff8787" fill-opacity="0.12" stroke="none"/>
  <line x1="436" y1="180" x2="436" y2="146" class="fig-line" stroke="#51cf9b"/>
  <text x="436" y="196" text-anchor="middle" class="fig-muted" font-size="9">lượt 10</text>
  <text x="640" y="196" text-anchor="end" class="fig-muted" font-size="9">lượt 40</text>
  <text x="470" y="86" class="fig-muted" font-size="10">diện tích = tổng token đã trả</text>
  <text x="470" y="102" class="fig-muted" font-size="10">gấp ~16 lần khi số lượt gấp 4</text>
</svg>
<figcaption>Phần đỏ bên trái là thứ duy nhất tăng đơn điệu. Bên phải: vì mỗi lượt gửi lại cả lịch sử, tổng chi phí là diện tích tam giác chứ không phải chiều cao.</figcaption>
</figure>

## Bảy đòn bẩy, xếp theo hiệu quả thật

| # | Đòn bẩy | Tiết kiệm | Ảnh hưởng chất lượng |
|---|---|---|---|
| 1 | **Một nhiệm vụ, một phiên** | Rất lớn | Tăng — agent không lôi theo quyết định cũ đã đổi |
| 2 | **Chỉ định file thay vì để agent tìm** | Lớn | Tăng |
| 3 | **Mục lục phẳng thay vì quét repo** | Lớn | Tăng |
| 4 | **Giữ phần đầu prompt ổn định để cache** | Vừa (và nhanh hơn) | Không đổi |
| 5 | **Lọc đầu vào máy sinh trước khi dán** | Vừa | Tăng |
| 6 | **Model theo tác vụ** | Vừa | Giảm nếu chọn sai việc |
| 7 | **Đẩy việc đọc nhiều sang phiên con** | Vừa | Tăng |

**1. Một nhiệm vụ, một phiên.** Đòn bẩy mạnh nhất và rẻ nhất: đóng phiên khi nhiệm vụ xong. Tiếp tục nhiệm vụ khác trong cùng phiên nghĩa là trả tiền lại cho mọi thứ đã nói, mỗi lượt, tới cuối ngày. Cần mang gì sang phiên mới thì viết nó vào file — file là bộ nhớ dài hạn, hội thoại thì không.

**2. Chỉ định file.** *"Sửa cooldown trong `Combat/SkillRunner.cs`, cấu hình ở `Data/Skills/`"* rẻ hơn *"tìm chỗ xử lý cooldown rồi sửa"* một bậc. Bạn mất mười giây tra cứu; agent tiết kiệm hai mươi lượt đọc file. Không biết file nào thì hỏi một lượt khảo sát **chỉ đọc**, ghi lại kết quả, rồi mở phiên mới để sửa.

**3. Mục lục phẳng.** Kho này là ví dụ đo được: `KNOWLEDGE_INDEX.md` liệt kê 128 node kèm id, tóm tắt và đường dẫn trong vài chục nghìn token, trong khi `content/` đầy đủ là hơn 300.000 từ. Agent đọc mục lục rồi mở đúng hai node — rẻ hơn hai chữ số lần so với "đọc hết để nắm bối cảnh". Cách dựng mục lục ở [[knowledge-base-for-agents]].

**4. Cache phần đầu.** Nhà cung cấp cache theo **tiền tố giống hệt nhau tới từng byte**: phần đầu không đổi thì lượt sau vừa rẻ hơn vừa trả lời nhanh hơn. Nguyên tắc thực hành: xếp phần ổn định lên đầu (prompt hệ thống → file luật → mục lục), phần hay đổi xuống cuối; đừng chèn thời gian, số ngẫu nhiên hay "hôm nay là ngày…" vào đầu prompt — một ký tự đổi là hỏng cache của toàn bộ phần sau.

**5. Lọc trước khi dán.** Đầu vào do máy sinh là chỗ token bốc hơi nhanh nhất. Đừng dán cả file log, hãy dán thứ bạn đã lọc:

```bash
grep -n "error CS" build.log | head -30           # lỗi compile Unity, không cần 8000 dòng còn lại
go test ./... 2>&1 | grep -A 5 -- "--- FAIL"      # chỉ test hỏng và năm dòng ngữ cảnh
git diff --stat                                    # để agent chọn file cần xem, rồi mới diff file đó
```

**6. Model theo tác vụ.** Model mạnh cho việc phải *quyết định* — kế hoạch, sửa lỗi khó, thiết kế. Model nhỏ nhanh cho việc *cơ học* — đổi tên, sinh test lặp lại, dịch chuỗi UI, phân loại log. Sai lầm hay gặp là dùng model nhỏ cho bước lập kế hoạch: kế hoạch tồi khiến bạn trả tiền ba vòng sửa, đắt hơn nhiều phần tiết kiệm được.

**7. Phiên con cho việc đọc nhiều.** Việc dạng "đọc ba mươi file rồi tóm tắt một đoạn" nên chạy ở phiên riêng: ngữ cảnh khổng lồ ở lại đó, phiên chính chỉ nhận phần kết luận. Nếu công cụ không có cơ chế phiên con, làm thủ công cũng được: chạy khảo sát trước, lưu kết luận ra file, mở phiên mới.

## Thứ tốn token nhất trong một dự án game

| Loại | Vì sao tốn | Cách xử lý |
|---|---|---|
| `*.unity`, `*.prefab` | YAML hàng nghìn dòng, gần như không có thông tin hữu ích cho agent | Cấm mở. Cần biết cấu trúc thì mô tả bằng lời |
| Log build / crash Unity | Vài nghìn dòng, phần cần chỉ mươi dòng | `grep` lỗi + 5 dòng ngữ cảnh; xem [[unity-debug-crash]] |
| Master data (JSON/CSV) | Hàng nghìn dòng dữ liệu giống nhau | Đưa **schema + 3 dòng mẫu**, không đưa cả bảng; xem [[master-data]] |
| File tự sinh (`graph.json`, `*.pb.go`) | To, và không phải nguồn chân lý | Cấm đọc; chỉ đọc file nguồn sinh ra chúng |
| Ảnh chụp màn hình | Tốn token hình ảnh cho thứ mô tả bằng một câu là đủ | Chỉ dùng khi vấn đề **là** thị giác (layout lệch, artifact shader) |
| Stack trace lồng nhau | Phần lặp lại chiếm chín phần mười | Dán khung đầu + dòng chạm code của bạn |

## Ba tầng ngữ cảnh

Đây là phần "thiết kế hệ thống" của việc tiết kiệm token: quyết định thứ gì **luôn** được gửi, thứ gì gửi **theo yêu cầu**.

| Tầng | Nội dung | Trả tiền khi nào |
|---|---|---|
| **1 — Luôn có** | File luật, quy ước, ranh giới cấm chạm, phiên bản engine | Mỗi lượt |
| **2 — Bản đồ** | Mục lục file/node, cây thư mục rút gọn, danh sách endpoint | Mỗi lượt (nhưng nhỏ) |
| **3 — Theo yêu cầu** | Nội dung file, log, dữ liệu | Chỉ khi agent mở |

Tiêu chí cho tầng 1 rất chặt, vì mỗi dòng ở đó bạn trả tiền mỗi lượt: **phát biểu này có làm agent làm khác đi không?** "Giữ code sạch" thì không — xoá. "Assembly `Game.Core` không được tham chiếu `UnityEngine`" thì có — giữ. Một file luật 200 dòng toàn lời khuyên chung đắt hơn và tệ hơn một file 40 dòng toàn ràng buộc kiểm được.

## Mục lục tĩnh hay RAG?

Với repo mã nguồn cỡ vài nghìn file, **mục lục + `grep` thắng RAG** trong hầu hết trường hợp: kết quả xác định (cùng câu hỏi cho cùng file), không cần hạ tầng embedding, và khi agent tìm sai bạn debug được bằng cách chạy lại chính lệnh đó. Code có cấu trúc cây và tên định danh — hai thứ `grep` khai thác tốt hơn vector.

RAG đáng dựng khi: tài liệu lớn hơn nhiều lần repo và không theo cây (hàng nghìn trang GDD cũ, log support, wiki), hoặc câu hỏi mang tính ngữ nghĩa chứ không phải định danh ("ai đó từng nói gì về việc nerf skill này"). Chi tiết kiến trúc ở [[ai-assistant-architecture]].

## Cắt quá tay cũng là một lỗi

Tiết kiệm token tới mức agent phải đoán thì bạn trả giá đắt hơn nhiều. Bốn dấu hiệu đã cắt quá:

- Agent **bịa tên hàm hoặc tên file** — nó đang suy diễn thay vì đọc.
- Agent **viết lại thứ đã có** trong dự án, ở chỗ khác, tên khác.
- Agent hỏi lại hai, ba lượt trước khi làm được — mỗi lượt hỏi lại vẫn tính tiền.
- Code chạy nhưng **lệch quy ước** dự án: đặt tên khác, tầng khác, tự chọn thư viện khác.

Quy tắc: cắt **khối lượng**, đừng cắt **ràng buộc**. Bỏ bớt file cho agent đọc thì tốt; bỏ dòng "server là nguồn chân lý cho tiền tệ" để tiết kiệm 15 token thì đó là tiết kiệm ngu nhất có thể.

## Đo cái gì

Ba chỉ số, không phải giá mỗi nghìn token:

- **Chi phí mỗi nhiệm vụ hoàn thành.** Model đắt gấp ba mà xong trong một vòng thì rẻ hơn.
- **Tỉ lệ xong trong một vòng.** Rơi xuống thì thường là thiếu ngữ cảnh, không phải thiếu model mạnh.
- **Phần token chi cho việc đọc lại thứ đã đọc.** Cao thì vấn đề nằm ở độ dài phiên và thiếu mục lục.

Cách dựng bộ đo và so sánh hai cấu hình mà không tự lừa mình: [[ai-eval]].

## 🤖 Prompt cho AI

**Dùng AI thế nào để ngữ cảnh vừa rẻ vừa đúng**

Đừng nhờ AI "tối ưu token" một cách chung chung — nó sẽ trả về lời khuyên ai cũng biết. Giao ba loại việc cụ thể, đo được:

| Việc | Câu mở đầu | Kết quả nhận về |
|---|---|---|
| **Rút gọn file luật** | "Với mỗi dòng trong file này, nói nó làm agent làm khác đi thế nào. Dòng nào không trả lời được thì đề xuất xoá." | File ngắn hơn, toàn ràng buộc kiểm được |
| **Dựng mục lục** | "Sinh mục lục: mỗi file một dòng gồm đường dẫn, vai trò, khi nào cần mở. Không chép nội dung." | Tầng 2 để agent tự chọn file |
| **Lọc đầu vào** | "Viết lệnh shell lọc log này còn phần liên quan tới lỗi X, tối đa 40 dòng." | Lệnh tái dùng được, không phải một lần dán |

Điều **không** nên giao: nhờ AI đoán chi phí bằng cách tự đếm token trong đầu — nó đếm sai. Số thật lấy từ công cụ (bộ đếm của nhà cung cấp, bảng usage), không lấy từ lời model nói.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Trần cụ thể: bao nhiêu file được mở, bao nhiêu dòng log được dán, bao nhiêu vòng tự sửa.
- Thứ gì thuộc tầng 1 (luôn gửi) và thứ gì cấm mở hẳn (file tự sinh, scene, prefab).
- Phiên này làm **một** nhiệm vụ nào — đừng để "tiện thể làm luôn".
- Đầu ra mong muốn ở dạng gì: diff, danh sách file, hay một đoạn kết luận mang sang phiên khác.

**Mẫu prompt**

```
Phiên này chỉ làm MỘT việc: tìm nguyên nhân lỗi mất vật phẩm khi mạng chập chờn.

Ngân sách ngữ cảnh:
- Mở tối đa 6 file. Trước khi mở, liệt kê file định mở và lý do — chờ tôi gật.
- KHÔNG mở: *.unity, *.prefab, *.pb.go, file trong Assets/Data/ (chỉ đọc schema).
- Log tôi đã lọc sẵn ở dưới; đừng xin cả file log.

Kết quả cần: 3 khả năng xếp theo xác suất, mỗi khả năng kèm cách kiểm chứng
bằng MỘT lệnh hoặc MỘT dòng log cần tìm. Chưa sửa code.

Cuối cùng: viết 10 dòng tóm tắt để tôi dán sang phiên sửa lỗi — gồm file liên
quan, giả thuyết đã loại, và giả thuyết còn lại.
```

**Bẫy thường gặp:** để agent tự do "khám phá repo" ở đầu mỗi phiên. Nó sẽ mở vài chục file, phần lớn không liên quan, và toàn bộ đống đó theo bạn tới cuối phiên — trả tiền lại mỗi lượt và làm loãng thứ thật sự quan trọng. Bẫy thứ hai, ngược lại: cắt ngữ cảnh tới mức agent phải đoán tên hàm, rồi mất ba vòng sửa những thứ nó bịa ra.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao phiên chat dài lại tốn tiền nhanh thế?**
  → Vì mỗi lượt gửi lại toàn bộ lịch sử chứ không chỉ câu vừa gõ, nên chi phí cộng dồn theo hình tam giác: số lượt gấp bốn thì tổng token gấp khoảng mười sáu. Cách chữa rẻ nhất không phải đổi model mà là đóng phiên khi nhiệm vụ xong, và ghi thứ cần mang theo vào file.
- `Junior` **Tiết kiệm token có làm câu trả lời tệ đi không?**
  → Ngược lại, nếu cắt đúng thứ. Cắt khối lượng — số file agent mở, số dòng log dán vào — thì chất lượng tăng vì thứ quan trọng không bị chôn. Cắt ràng buộc thì chất lượng sụp: bỏ một dòng "server là nguồn chân lý cho tiền tệ" để tiết kiệm mười lăm token là đổi lấy một lỗi kiến trúc.
- `Mid` **Prompt caching hoạt động theo nguyên tắc gì, và làm gì để tận dụng?**
  → Nhà cung cấp cache theo tiền tố giống hệt nhau, nên tôi xếp phần ổn định lên đầu — prompt hệ thống, file luật, mục lục — và để phần hay đổi xuống cuối. Kèm một luật nhỏ: không chèn thời gian hay số ngẫu nhiên vào đầu prompt, vì một ký tự đổi là hỏng cache của tất cả phần sau.
- `Mid` **Agent nên đọc cả repo hay bạn chỉ định file?**
  → Chỉ định, gần như luôn luôn. Tôi mất mười giây tra cứu, agent tiết kiệm hai mươi lượt đọc file và không bám vào file sai. Khi thật sự chưa biết code nằm đâu thì tôi chạy một lượt khảo sát chỉ-đọc, lưu kết luận ra file, rồi mở phiên mới để sửa — chứ không để phần khám phá nằm lại trong ngữ cảnh suốt buổi.
- `Mid` **Dự án game có loại dữ liệu nào đặc biệt tốn token?**
  → Bốn thứ: scene và prefab dạng YAML hàng nghìn dòng, log build Unity, master data JSON, và file tự sinh. Cách xử lý giống nhau — không đưa dữ liệu, đưa cái mô tả dữ liệu: schema kèm ba dòng mẫu thay cho cả bảng, lỗi đã `grep` kèm năm dòng ngữ cảnh thay cho cả log.
- `Senior` **Thiết kế lớp ngữ cảnh cho một trợ lý nội bộ thì anh chia thế nào?**
  → Ba tầng: tầng luôn gửi gồm luật và ranh giới cấm chạm, tầng bản đồ là mục lục để agent tự chọn, tầng theo yêu cầu là nội dung file. Tiêu chí vào tầng một rất chặt vì mỗi dòng ở đó trả tiền mỗi lượt — phát biểu nào không làm agent làm khác đi thì xoá. Bốn mươi dòng ràng buộc kiểm được tốt hơn hai trăm dòng lời khuyên.
- `Senior` **Khi nào cần RAG, khi nào mục lục tĩnh là đủ?**
  → Với repo mã nguồn cỡ vài nghìn file thì mục lục cộng `grep` thắng: kết quả xác định, không cần hạ tầng embedding, và tìm sai thì debug được bằng chính lệnh đó. Tôi chỉ dựng RAG khi corpus lớn hơn nhiều lần repo và không theo cây — wiki cũ, log support — hoặc khi câu hỏi mang tính ngữ nghĩa chứ không phải định danh.
- `Senior` **Anh đo hiệu quả của việc tối ưu ngữ cảnh bằng gì?**
  → Không đo bằng giá mỗi nghìn token mà bằng chi phí và thời gian cho **mỗi nhiệm vụ hoàn thành**, tỉ lệ xong trong một vòng, và phần token chi để đọc lại thứ đã đọc. Model đắt gấp ba mà xong trong một vòng thì rẻ hơn hai model rẻ chạy ba vòng.
- `Senior` **Làm sao biết đã cắt ngữ cảnh quá tay?**
  → Bốn dấu hiệu: agent bịa tên hàm, viết lại thứ dự án đã có, hỏi lại nhiều lượt trước khi làm được, hoặc code chạy nhưng lệch quy ước. Cả bốn đều đắt hơn phần tiết kiệm được, nên tôi coi chúng là tín hiệu để nới ràng buộc chứ không phải để đổi model.

**Khung trả lời 60 giây** — "Anh làm gì để dùng AI không bị đội chi phí?"

> Tôi coi ngữ cảnh là thứ phải thiết kế, không phải thứ để mặc nó phình. Điểm đầu tiên là hiểu tiền đi đâu: mỗi lượt gửi lại cả lịch sử, nên chi phí một phiên tăng theo hình tam giác — bốn mươi lượt tốn cỡ mười sáu lần mười lượt. Vì thế quy tắc mạnh nhất của tôi rất đơn giản: một nhiệm vụ, một phiên; thứ cần mang theo thì viết vào file, vì file là bộ nhớ dài hạn còn hội thoại thì không.
>
> Thứ hai là chia ngữ cảnh ba tầng: luật và ranh giới thì luôn gửi, mục lục để agent tự chọn file, còn nội dung chỉ mở theo yêu cầu. Trong repo này mục lục là vài chục nghìn token trong khi toàn bộ nội dung là hơn ba trăm nghìn từ, nên chênh lệch là hai chữ số lần.
>
> Và tôi đo bằng chi phí mỗi nhiệm vụ hoàn thành chứ không phải giá mỗi nghìn token. Cắt thì cắt khối lượng — số file mở, số dòng log dán — chứ không cắt ràng buộc; bỏ một dòng ràng buộc để tiết kiệm mười lăm token là cách đắt nhất để tiết kiệm.

**Họ sẽ đào tiếp**

- *"Nếu nhiệm vụ thật sự dài thì sao?"* → Chia theo mốc kiểm chứng được và bàn giao giữa các phiên bằng file: mười dòng tóm tắt gồm file liên quan, giả thuyết đã loại, việc còn lại. Bàn giao bằng file rẻ hơn kéo cả lịch sử, và có thêm cái lợi là người khác đọc được.
- *"Cache có làm kết quả kém đi không?"* → Không, nó chỉ ảnh hưởng chi phí và độ trễ; nội dung gửi đi vẫn nguyên. Ràng buộc duy nhất là tiền tố phải giống hệt nhau, nên đừng chèn thời gian hay nội dung xáo trộn vào đầu prompt.
- *"Model nhỏ dùng ở đâu?"* → Việc cơ học có định nghĩa rõ: đổi tên, sinh test lặp lại, dịch chuỗi UI, phân loại log. Tôi không dùng model nhỏ cho bước lập kế hoạch, vì kế hoạch tồi khiến trả tiền ba vòng sửa — đắt hơn phần tiết kiệm được nhiều lần.
- *"Đưa ảnh chụp màn hình có tốn không?"* → Có, và thường không đáng: mô tả bằng một câu là đủ cho phần lớn trường hợp. Tôi chỉ đưa ảnh khi vấn đề thật sự là thị giác — layout lệch, artifact của shader — vì khi đó lời mô tả mới là thứ mất thông tin.

**Cờ đỏ**

- Nói "tôi dùng model rẻ nhất để tiết kiệm" mà không nói tới số vòng phải làm lại.
- Đếm token bằng cách hỏi chính model — nó đếm sai.
- Tối ưu token bằng cách cắt ràng buộc trong file luật.
- Dựng RAG cho một repo hai nghìn file trong khi `grep` và một mục lục giải quyết xong.
- Để một phiên chạy cả ngày cho năm nhiệm vụ khác nhau rồi than đắt.

**Số / ví dụ nên thuộc**

- Chi phí phiên tăng theo **bình phương số lượt**: gấp 4 lượt ≈ gấp 16 tổng token.
- Ba tầng ngữ cảnh: **luôn gửi / bản đồ / theo yêu cầu**.
- Kho này: **mục lục vài chục nghìn token vs hơn 300.000 từ nội dung**.
- Cache ăn theo **tiền tố giống hệt tới từng byte** — phần ổn định lên đầu.
- Bốn dấu hiệu thiếu ngữ cảnh: **bịa tên hàm · viết lại thứ đã có · hỏi lại nhiều lượt · lệch quy ước**.
