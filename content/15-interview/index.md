---
id: interview
title: Phỏng vấn game developer
icon: 🎤
summary: Nhánh ôn phỏng vấn theo đúng lịch bốn vòng của một studio game Nhật — giải thuật, CV, tình huống công việc, tính cách — kèm câu "có biết Cocos Creator không". Mỗi node có bộ thẻ 🎤 để luyện nói ra miệng.
status: deep
read: 1100
level: intermediate
order: 90
map: true
mapLabel: Phỏng vấn
tags: [interview, career, checklist]
related: [csharp-interview-kit, project-postmortem, cocos-creator, team-lead]
---

Các nhánh khác dạy **biết**. Nhánh này dạy **nói ra được, đúng lúc, trong đúng vòng** — vì mỗi vòng phỏng vấn chấm một thứ khác nhau, và câu trả lời hay ở vòng này có thể là câu trả lời dở ở vòng kia.

Nhánh được dựng quanh một lịch phỏng vấn có thật (Ateam Việt Nam, vị trí Mobile Game Developer, cuối 2026), nhưng khung bốn vòng này phổ biến ở hầu hết studio game có gốc Nhật tại Việt Nam.

## Lịch bốn vòng và mỗi vòng chấm gì

| Vòng | Hình thức | Họ thật sự chấm | Node ôn |
|---|---|---|---|
| **1. Giải thuật** | Code 3 câu, có giờ | Nhận diện dạng bài, độ phức tạp, code chạy đúng biên | [[interview-algorithm]], [[interview-algorithm-set2]], [[interview-oop-math]], [[interview-csharp-output]] |
| **2. Theo CV** | Hỏi đào từng dòng trong CV | Bạn có **thật sự làm** những gì đã ghi, và hiểu nó tới đâu | [[interview-cv]], [[interview-csharp-bank]], [[interview-unity-scripting]], [[interview-unity-csharp-traps]], [[interview-unity-tech]], [[interview-live-service]], [[interview-multiplayer]], [[interview-graphics]], [[interview-mobile-platform]], [[interview-system-design]], [[interview-debug-cases]], [[interview-ai-gamedev]] |
| **3. Xử lý công việc** | Tình huống giả định | Cách bạn làm việc trong đội: ưu tiên, báo cáo, bất đồng, sự cố, quy trình | [[interview-situations]], [[interview-process]] |
| **4. Tính cách** | Trò chuyện | Thành công/thất bại, có hiểu sản phẩm của họ không, có hợp văn hoá không | [[interview-personality]], [[interview-game-sense]] |
| Câu phụ | "Có biết Cocos Creator không?" | Trung thực về mức độ + tốc độ bắt nhịp | [[interview-cocos]] |

Ba điều đúng với **cả bốn vòng**:

1. **Có số.** "Tối ưu được game" không phải câu trả lời; "frame time từ X ms xuống Y ms trên máy Z" mới là câu trả lời.
2. **Nói "tôi", không nói "chúng tôi".** Người phỏng vấn tuyển bạn, không tuyển đội cũ của bạn.
3. **Không biết thì nói không biết, rồi nói cách sẽ tìm ra.** Bịa một lần là mọi câu sau bị nghe với thái độ nghi ngờ.

## Về công ty (tra ngày 2026-11-09)

Ateam là tập đoàn Nhật, mảng game tách thành **Ateam Entertainment**. Các game đang vận hành để chuẩn bị cho vòng 4:

| Game | Thể loại | Điểm đáng nói |
|---|---|---|
| **Valkyrie Connect** | RPG fantasy, đội hình, auto/real-time | Kỷ niệm **10 năm** (6/2026), hơn 30 triệu lượt tải; sống bằng collab (hololive, Fate, Overlord, Konosuba) |
| **Unison League** | RPG nhiều người chơi real-time | Chơi cùng bạn theo nhóm; collab Persona 3/4/5 (3/2026) |
| **FRAGARIAMEMORIES** | RPG, hợp tác Sanrio | Ra mắt khoảng cuối 2025 |

Last Cloudia **không phải** của Ateam (của AIDIS) — nhầm chỗ này ở vòng 4 là mất điểm ngay. Văn phòng Việt Nam làm gì cụ thể cho các game trên thì chưa xác minh được từ nguồn công khai: hỏi lại ở vòng 2 hoặc cuối buổi.

**Trước vòng 4, cài và chơi thật ít nhất một game ở trên trong 2–3 ngày** — đủ để nói được core loop, hệ gacha, nhịp event và một chỗ bạn muốn cải thiện. Xem [[interview-personality]].

## Lộ trình ôn

| Ngày | Việc | Node |
|---|---|---|
| 1–3 | Mỗi ngày 3 bài giải thuật, bấm giờ 25 phút/bài; ngày 3 làm một đề thi thử trọn 3 câu; tối ôn OOP, pattern, vector | [[interview-algorithm]], [[interview-algorithm-set2]], [[interview-oop-math]] |
| 2 | Cài Valkyrie Connect hoặc Unison League, chơi mỗi tối 30 phút, ghi sổ quan sát | [[interview-personality]] |
| 3 | Viết ra 4 câu chuyện STAR, đọc to mỗi câu dưới 2 phút | [[interview-cv]] |
| 3–4 | **C# và Unity cốt lõi** — ưu tiên số một của vòng 2: ngân hàng C#, đoán output, Unity scripting, bẫy Unity × C# | [[interview-csharp-bank]], [[interview-csharp-output]], [[interview-unity-scripting]], [[interview-unity-csharp-traps]] |
| 4 | Ngân hàng câu kỹ thuật Unity + client live-service, mỗi ngày một nửa | [[interview-unity-tech]], [[interview-live-service]] |
| 4–5 | Tối: đồ hoạ/shader, nền tảng mobile, multiplayer, một bài thiết kế hệ thống mỗi ngày | [[interview-graphics]], [[interview-mobile-platform]], [[interview-multiplayer]], [[interview-system-design]] |
| 5 | 20 tình huống debug theo khung 6 bước; câu hỏi về dùng AI làm game | [[interview-debug-cases]], [[interview-ai-gamedev]] |
| 6 | Từ vựng sản phẩm (retention, ARPU, faucet/drain) trước khi nói về game của họ | [[interview-game-sense]] |
| 5 | Luyện tình huống theo khung 4 bước, viết thử 3 tin nhắn báo cáo; ôn Git và quy trình | [[interview-situations]], [[interview-process]] |
| 6 | Ôn Cocos 3.x, sửa một demo nhỏ | [[interview-cocos]], [[cocos-creator]] |
| 7 | Chế độ **🎤 Luyện phỏng vấn** trên web cho cả nhánh, bật đọc to, chấm thật thà | — |

## Ngày phỏng vấn

| Lúc | Việc |
|---|---|
| Tối hôm trước | Đọc lại 4 câu chuyện STAR và sổ ghi chép game; **không** học thêm kiến thức mới |
| Trước 30 phút | Kiểm mic, camera, mạng (nếu online); mở sẵn CV, giấy bút để ghi câu hỏi |
| Đầu buổi | Hỏi lại hình thức: bao lâu, ai hỏi, có code trực tiếp không |
| Trong buổi | Không hiểu câu thì hỏi lại; cần nghĩ thì xin 10 giây — im lặng có báo trước không bị trừ điểm |
| Cuối buổi | Hai câu hỏi lại đã chuẩn bị; hỏi bước tiếp theo và khi nào có kết quả |
| Sau buổi | Ghi ngay các câu đã bị hỏi và chỗ trả lời chưa tốt — dùng cho vòng sau |

## Câu nên hỏi lại, theo vòng

| Vòng | Câu hỏi |
|---|---|
| 1 | "Đề thi có chấm cả độ phức tạp và cách trình bày code không?" |
| 2 | "Đội Việt Nam phụ trách phần nào, của game nào, dùng Unity hay Cocos?" · "Đội đo hiệu năng bằng gì, máy yếu nhất phải hỗ trợ là gì?" |
| 3 | "Quy trình review và release/hotfix cho event diễn ra thế nào?" · "Đội Việt Nam làm việc với đội Nhật qua kênh nào?" |
| 4 | "Ba tháng đầu, người ở vị trí này được kỳ vọng làm được gì?" · "Điều anh/chị thích nhất khi làm ở đây là gì?" |

Phần kỹ thuật C#/Unity sâu hơn (struct/class, GC, async, live-coding pool/LRU) đã có ở [[csharp-interview-kit]] — vòng 2 rất dễ rẽ sang đó.

## 🤖 Prompt cho AI

**Dùng AI thế nào để ôn theo lịch nhiều vòng**

Đừng nhờ AI "soạn câu hỏi phỏng vấn game developer" chung chung — kết quả là danh sách 50 câu mà vòng nào cũng hỏi được, nên không vòng nào thực sự được ôn. Hãy cho AI **lịch vòng cụ thể** và bắt nó đóng vai đúng người phỏng vấn của từng vòng: vòng 2 là lead kỹ thuật đọc CV của bạn, vòng 3 là quản lý dự án, vòng 4 là giám đốc hoặc HR người Nhật.

**Phải nêu rõ**
- Vòng nào, hình thức nào, người hỏi là vai gì (lead, PM, giám đốc).
- Dán CV thật hoặc tóm tắt dự án — không có CV thì vòng 2 AI sẽ hỏi chung chung.
- Tên công ty và game của họ, để AI hỏi câu "game nào của chúng tôi bạn đã chơi".
- Ngôn ngữ phỏng vấn (Việt/Anh/Nhật) và thời lượng mỗi câu trả lời.

**Mẫu prompt**

```
Tôi sắp phỏng vấn vị trí Mobile Game Developer (Unity) ở một studio game Nhật.
Lịch: V1 giải thuật 3 câu; V2 hỏi theo CV; V3 tình huống công việc; V4 tính cách.
CV của tôi: <dán>.

Hôm nay luyện VÒNG <số>. Đóng vai <lead kỹ thuật / PM / giám đốc>.
Luật:
- Hỏi TỪNG câu một rồi DỪNG chờ tôi trả lời.
- Sau mỗi câu trả lời: chấm 1–5, chỉ ra chỗ thiếu số liệu, chỗ nói "chúng tôi"
  thay vì "tôi", chỗ nghe như học thuộc; rồi hỏi một câu đào sâu.
- Chấm gắt, không khen xã giao. Hết 8 câu thì tổng kết 3 điểm yếu nhất.
```

**Bẫy thường gặp:** AI tự bịa con số cho câu chuyện của bạn ("giảm 40% crash") — trong phòng phỏng vấn họ đào đúng con số đó, và bạn không trả lời được. Mọi số phải là số thật của bạn. Bẫy thứ hai: AI trộn câu của các vòng với nhau nên bạn không biết mình yếu vòng nào — luyện từng vòng một. Bẫy thứ ba: AI nói sai thông tin về công ty (nhầm game của studio khác) — kiểm lại trên trang chính thức trước khi mang vào phòng.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Anh giới thiệu bản thân trong hai phút.**
  → Theo ba nhịp: tôi là ai (Unity developer hơn 10 năm, phần lớn là game anime live-service cho đối tác Nhật), tôi giỏi gì nhất có bằng chứng (client live-service, tối ưu mobile, tự phát hành 5 game), và vì sao tôi ở đây (sản phẩm của công ty khớp đúng mảng tôi đã làm). Dừng ở đó, để họ chọn chỗ đào — kể hết mọi thứ là lấy mất câu hỏi của họ.
- `Junior` **Vì sao anh ứng tuyển vào công ty chúng tôi?**
  → Nói một lý do về **sản phẩm** (đã chơi game của họ, thích điểm gì cụ thể), một lý do về **cách làm** (đội làm việc với Nhật, quy trình rõ), một lý do về **bản thân** (kinh nghiệm live-service của tôi dùng được ngay). Tránh "vì công ty lớn, lương tốt" — đúng, nhưng không phân biệt được bạn với ai khác.
- `Mid` **Vì sao anh nghỉ công ty cũ?**
  → Trả lời ngắn, thật, hướng về phía trước: dự án/hợp đồng kết thúc hoặc muốn một bước khác, và điều tôi tìm ở công việc tiếp theo. Không chê công ty cũ, vì người nghe sẽ tự hỏi bạn sẽ nói gì về họ sau này.
- `Mid` **Điểm mạnh và điểm yếu của anh?**
  → Điểm mạnh nói kèm bằng chứng, không nói tính từ. Điểm yếu chọn một cái **thật** và đang sửa, kèm cách sửa: ví dụ "tôi hay ôm việc tự làm cho nhanh, giờ tôi tách task và giao rõ đầu ra từ đầu". Điểm yếu kiểu "tôi quá cầu toàn" bị nghe là né câu hỏi.
- `Senior` **Anh mong muốn mức lương bao nhiêu?**
  → Đưa một khoảng có cơ sở, không đưa một con số đơn lẻ, và hỏi lại tổng gói (thưởng, review lương, remote). Nếu tin tuyển đã ghi trần thì nói rõ mình biết trần đó và nằm ở đâu trong khoảng, vì trả lời lệch hẳn khỏi trần làm hồ sơ bị loại trước khi ai kịp đàm phán.
- `Senior` **Anh có câu hỏi gì cho chúng tôi không?**
  → Luôn có hai câu: một về sản phẩm ("đội Việt Nam đang phụ trách phần nào của game nào"), một về cách làm ("ba tháng đầu người ở vị trí này được giao gì, đo thành công bằng gì"). Không hỏi gì bị hiểu là không quan tâm.
- `Junior` **Anh biết gì về công ty chúng tôi?**
  → Ba ý ngắn: công ty Nhật, mảng game tách thành Ateam Entertainment, và tên hai ba game đang vận hành với một điểm cụ thể — Valkyrie Connect đã chạy mười năm và sống bằng collab. Kết bằng lý do điều đó hấp dẫn bạn. Trả lời được câu này chứng tỏ bạn ứng tuyển có chủ đích, không rải hồ sơ.
- `Junior` **Anh thấy mình hợp với vị trí này ở điểm nào?**
  → Đối chiếu thẳng với tin tuyển: hơn ba năm làm game (tôi có hơn mười), Unity hoặc Cocos (tôi dùng cả hai), sản phẩm đã ra mắt, client–server, đồ hoạ và shader. Nói thêm một điểm tin tuyển không yêu cầu nhưng có ích, như kinh nghiệm làm với đối tác Nhật. Câu này họ chờ bạn nối CV với nhu cầu của họ.
- `Junior` **Anh làm remote hay lên văn phòng?**
  → Nói rõ mong muốn và sự linh hoạt: tôi ở TP.HCM, làm remote được và lên văn phòng khi cần, theo đúng những gì tin tuyển mô tả. Hỏi lại nhịp lên văn phòng thường lệ của đội. Câu trả lời cứng nhắc kiểu "chỉ làm remote" làm hẹp cơ hội không cần thiết.
- `Mid` **Anh có câu hỏi gì về công việc trước khi chúng ta bắt đầu không?**
  → Hỏi hình thức buổi phỏng vấn: bao lâu, có code trực tiếp không, ai sẽ tham gia. Câu hỏi ngắn này giúp bạn phân bổ thời gian, và cho thấy bạn chuẩn bị có phương pháp.
- `Mid` **Anh có biết tiếng Nhật không?**
  → Nói thật mức độ và cách đã làm việc với spec tiếng Nhật: đọc với sự hỗ trợ công cụ, hỏi lại bằng chữ những chỗ không chắc. Nếu chưa có JLPT thì nói rõ, kèm sẵn sàng học nếu vị trí cần. Bịa mức tiếng Nhật là thứ bị kiểm tra ngay tại chỗ.
- `Mid` **Tiếng Anh của anh thế nào?**
  → Nói thật: đọc tài liệu kỹ thuật và viết trao đổi công việc được, nói và nghe còn hạn chế. Nhấn vào cách bù: trao đổi bằng chữ rõ ràng, có đánh số, và đang luyện thêm. Trả lời thật lúc này tốt hơn nhiều so với bị lộ khi họ chuyển sang hỏi tiếng Anh.
- `Senior` **Nếu có hai offer cùng lúc, anh chọn dựa trên gì?**
  → Nêu tiêu chí theo thứ tự thật của bạn: sản phẩm và đội, cơ hội phát triển, điều kiện làm việc, rồi mới tới lương. Không cần nói tên công ty khác. Câu trả lời cho thấy bạn quyết định có cân nhắc, không chạy theo con số.
- `Senior` **Anh mong đợi gì từ người quản lý trực tiếp?**
  → Mục tiêu rõ ràng, phản hồi thẳng và thường xuyên, được tin tưởng trong phần kỹ thuật của mình. Đổi lại tôi báo cáo đều và sớm, không để quản lý phải đi hỏi. Câu này đo xem bạn có cần quản lý sát hay tự chủ được.

**Khung trả lời 60 giây** — "Giới thiệu về bản thân anh"

> Tôi là Nhân, làm Unity hơn mười năm, trong đó khoảng sáu năm làm client cho game anime live-service của đối tác Nhật — gacha, guild, chat, xếp hạng, IAP, kết nối server bằng gRPC.
>
> Ba thứ tôi làm tốt nhất: dựng tính năng live-service chạy ổn định trên cả Android lẫn iOS, tối ưu bộ nhớ và render cho máy tầm trung, và làm việc theo spec tiếng Nhật với đội Nhật.
>
> Ngoài giờ tôi tự phát hành năm game mobile lên Google Play và App Store, nên tôi hiểu cả phần sau khi code xong: build, store, quảng cáo, đo chỉ số. Tôi ứng tuyển vì sản phẩm của công ty là đúng mảng RPG live-service tôi đã làm nhiều năm.

**Họ sẽ đào tiếp**

- *"Sáu năm live-service, anh sở hữu hệ thống nào?"* → Nêu tên hệ thống cụ thể bạn chịu trách nhiệm đầu-cuối, không liệt kê mọi thứ đội làm; xem [[interview-cv]].
- *"Tự phát hành 5 game, có game nào thành công không?"* → Nói số thật (lượt tải, doanh thu, rating) kể cả khi nhỏ, và bài học rút ra; con số nhỏ nói thật mạnh hơn con số to nói mập mờ.
- *"Anh có dự định lâu dài với công ty không?"* → Nói điều làm bạn muốn ở lại (sản phẩm, đội, hướng phát triển), vì họ đang tính chi phí đào tạo bạn.

**Cờ đỏ**

- Giới thiệu bản thân bằng cách đọc lại CV từ năm đầu tiên.
- Không nói tên được một game nào của công ty.
- Nói "chúng tôi làm…" suốt buổi, không rõ phần của mình.
- Chê công ty cũ hoặc đồng nghiệp cũ.
- Không có câu hỏi nào khi được mời hỏi lại.

**Số / ví dụ nên thuộc**

- **10+ năm** làm game, **6+ năm** client live-service cho đối tác Nhật, **5 game** tự phát hành.
- Bốn vòng: **giải thuật 3 câu → CV → tình huống → tính cách**.
- Game Ateam: **Valkyrie Connect** (10 năm, 30 triệu+ lượt tải), **Unison League**, **FRAGARIAMEMORIES**.
- Câu chuyện nào cũng có **vai trò của tôi + con số + bài học**.
