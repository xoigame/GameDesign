---
id: interview-cv
title: Vòng 2 — Phỏng vấn theo CV
icon: 📄
summary: Người phỏng vấn đào từng dòng trong CV để xem bạn thật sự làm tới đâu. Cách biến mỗi dòng CV thành một câu chuyện STAR có số, bốn câu chuyện bắt buộc phải chuẩn bị, và các câu kỹ thuật Unity live-service sẽ bị hỏi theo đúng những gì CV ghi.
status: deep
read: 1120
level: intermediate
order: 20
tags: [interview, career, unity, storytelling, live-ops]
related: [interview, project-postmortem, csharp-interview-kit, unity-addressables, unity-network-client]
---

Vòng 2 nguy hiểm theo cách ngược với vòng 1: câu hỏi **dễ**, vì toàn hỏi về việc bạn đã làm — nhưng người hỏi chọn đúng dòng nào trong CV nghe kêu nhất rồi đào ba tầng. Tầng ba là nơi lộ ra ai làm thật, ai đứng cạnh người làm thật.

## Luật một dòng CV = một câu chuyện

Trước buổi phỏng vấn, đọc CV của chính mình và với **mỗi dòng** trả lời được bốn câu:

1. **Phần của tôi** là gì — không phải phần của đội.
2. **Khó nhất** ở đâu, vì sao khó.
3. **Con số** trước/sau, hoặc quy mô (bao nhiêu người, bao nhiêu màn hình, bao nhiêu người chơi).
4. **Nếu làm lại** tôi đổi gì.

Dòng nào không trả lời được câu 1 và câu 3 thì **bỏ khỏi CV** hoặc viết lại cho khớp thực tế. Một dòng không đỡ được là đủ để người hỏi nghi cả CV.

## Khung STAR, bản rút gọn để nói

| Chữ | Nói gì | Thời lượng |
|---|---|---|
| **S**ituation | Dự án gì, bối cảnh, vì sao có vấn đề | 1–2 câu |
| **T**ask | Việc **của tôi** cụ thể | 1 câu |
| **A**ction | Tôi đã làm gì, theo thứ tự, vì sao chọn cách đó | 3–4 câu — phần dài nhất |
| **R**esult | Con số, và bài học | 1–2 câu |

Cả câu chuyện **dưới 2 phút**. Người phỏng vấn sẽ cắt vào phần Action để đào — nên phần đó phải là phần bạn nắm chắc nhất.

## Bốn câu chuyện phải có sẵn

| # | Chủ đề | Lấy từ đâu trong CV | Vì sao họ sẽ hỏi |
|---|---|---|---|
| 1 | **Tối ưu hiệu năng** | Game live-service Unity 6/URP, máy tầm trung | Tin tuyển ghi mobile + đồ hoạ; mọi studio đều đau ở đây |
| 2 | **Sửa một crash/bug khó** | Build iOS/Android, SDK bên thứ ba | Cho thấy cách bạn suy luận khi không có đáp án sẵn |
| 3 | **Phát hành game một mình** | XOI GAME — 5 game trên store | Hiếm người có; chứng minh hiểu cả vòng đời sản phẩm |
| 4 | **Dựng hệ AI-agent làm game** | GameDev Hub, Claude Code | Điểm khác biệt; nhưng phải nói được giá trị cho **đội**, không chỉ cho mình |

Mỗi câu chuyện viết ra giấy theo STAR, điền **số thật của bạn** (đừng để AI điền hộ), đọc to bấm giờ. Phần 🎤 bên dưới có khung cho cả bốn.

## Câu kỹ thuật sẽ bị hỏi theo CV

CV ghi gì thì kỹ thuật bị hỏi đúng chỗ đó. Bảng ánh xạ:

| CV ghi | Họ sẽ hỏi | Ôn ở |
|---|---|---|
| Unity 6 / URP | SRP Batcher là gì, khác static/dynamic batching thế nào | [[unity-optimization]], [[unity-gpu-optimization]] |
| Addressables | Load/release thế nào, rò bộ nhớ ở đâu, catalog cập nhật ra sao | [[unity-addressables]] |
| Tối ưu bộ nhớ | Đo bằng gì, texture chiếm bao nhiêu, nén ASTC | [[unity-memory-optimization]], [[unity-profiling]] |
| GC / C# | Alloc mỗi frame, boxing, pool | [[unity-csharp-memory]], [[csharp-interview-kit]] |
| gRPC / protobuf | Vì sao chọn gRPC, xử lý mất mạng, retry, idempotency | [[unity-network-client]], [[go-protobuf]] |
| IAP | Luồng mua, xác thực receipt ở server, giao dịch treo | [[unity-monetization-sdk]], [[project-contract]] |
| Gacha / guild / ranking | Client hiển thị gì, server quyết gì | [[screen-gacha]], [[screen-ranking]] |
| Photon / SmartFoxServer | Authority, đồng bộ trạng thái, lag | [[unity-multiplayer]] |
| Cocos Creator | Biết tới đâu | [[interview-cocos]] |

## Đào ba tầng — trông thế nào

Người phỏng vấn vòng 2 hiếm khi hỏi câu mới; họ hỏi **tiếp** câu vừa rồi. Ví dụ với dòng "Addressables, tối ưu bộ nhớ":

| Tầng | Câu hỏi | Người làm thật trả lời | Người đứng cạnh trả lời |
|---|---|---|---|
| 1 | Anh dùng Addressables làm gì? | Chia group theo event, load từ CDN | Giống hệt — tầng 1 ai cũng qua |
| 2 | Group chia theo tiêu chí nào, vì sao? | Theo thời điểm cần và theo vòng đời event, để gỡ được cả bundle khi event hết | "Theo loại asset" — không nói được vì sao |
| 3 | Một texture dùng chung cho hai event thì nằm bundle nào? | Kéo ra group dùng chung, nếu không sẽ bị nhân đôi; kiểm bằng Analyze | Im lặng hoặc đoán |

Chuẩn bị cho **tầng 3** của mỗi dòng CV. Tầng 1–2 tự đến.

## Câu hỏi theo từng chặng nghề

CV mười năm qua năm công ty cho người hỏi nhiều cửa để đào. Chuẩn bị một ý cho mỗi chặng:

| Chặng | Họ sẽ tò mò | Ý nên chạm |
|---|---|---|
| ASP.NET (2015–2016) | Vì sao chuyển từ web sang game | Nền C#/SQL giúp gì khi làm client–server sau này |
| Casual game (2016–2018) | Ads, IAP, tự làm trọn game nhỏ | Hiểu monetization từ sớm |
| Casino/slot + Cocos (2018–2019) | Cocos tới đâu, SmartFoxServer | Kết nối realtime, hai engine — xem [[interview-cocos]] |
| Game anime cho NPH Nhật (2020–2023) | Lên Senior vì sao, mentor ai, shader, multiplayer | Trách nhiệm tăng dần, có người kèm |
| Unity 6/URP live-service (2023–2026) | Codebase lớn, gRPC, SDK, tối ưu | Làm việc trong hệ thống lớn có sẵn mà không phá |
| Tự làm (song song) | Có ảnh hưởng việc chính không, có định nghỉ làm riêng không | Làm ngoài giờ, là nơi thử công nghệ mới |

## Câu hỏi khó về chính CV

Ba câu ít người chuẩn bị nhưng hay bị hỏi với hồ sơ hơn mười năm:

- **"Mười năm sao chưa làm lead?"** — Trả lời thật về lựa chọn: thích ở gần code, đã kèm người mới, sẵn sàng nhận nhóm nhỏ khi phù hợp. Không xin lỗi cho lựa chọn của mình. Xem [[team-lead]] nếu họ hỏi sâu về quản lý.
- **"Anh đang nghỉ việc, đã bao lâu, làm gì trong lúc đó?"** — Nói rõ mốc nghỉ, và những gì đang làm có sản phẩm thấy được (game, công cụ, ôn luyện).
- **"Anh có nhận việc ở mức lương thấp hơn trước không, sao lại ứng tuyển vị trí này?"** — Nói vì sao vị trí này khớp (sản phẩm, đội, remote), và khoảng lương đã cân nhắc — họ đang lo bạn sẽ đi ngay khi có chỗ trả cao hơn.

## 🤖 Prompt cho AI

**Dùng AI thế nào để luyện vòng hỏi theo CV**

Dán CV thật vào và bắt AI làm đúng việc của người phỏng vấn vòng 2: **chọn dòng nghe kêu nhất rồi đào ba tầng**. Đừng để AI viết câu chuyện hộ bạn — nó sẽ điền con số đẹp mà bạn không đỡ được khi bị hỏi lại. Dùng AI để **tìm lỗ hổng** trong câu chuyện bạn tự viết.

**Phải nêu rõ**
- CV đầy đủ, và dòng nào bạn **lo** nhất (để AI tấn công đúng chỗ).
- Vị trí đang ứng tuyển và tin tuyển — AI sẽ hỏi phần CV khớp với tin.
- Yêu cầu đào **ba tầng** mỗi dòng: làm gì → vì sao chọn cách đó → nếu điều kiện X đổi thì sao.
- Cấm AI gợi ý câu trả lời trước khi bạn tự trả lời.

**Mẫu prompt**

```
Đây là CV của tôi: <dán>. Đây là tin tuyển: <dán>.
Đóng vai lead kỹ thuật phỏng vấn vòng "hỏi theo CV".
- Chọn 5 dòng trong CV mà một lead sẽ nghi ngờ nhất. Không nói trước là dòng nào.
- Mỗi dòng hỏi 3 tầng, TỪNG câu một, chờ tôi trả lời.
- Sau mỗi câu: tôi có nói rõ phần CỦA TÔI không? Có con số không? Có câu nào
  nghe như đọc từ tài liệu không? Chấm gắt.
- Cuối buổi: liệt kê dòng CV nào tôi nên viết lại hoặc bỏ.
```

**Bẫy thường gặp:** AI khen câu chuyện "rất ấn tượng" kể cả khi không có số nào — phải bắt nó kiểm riêng tiêu chí con số. Bẫy thứ hai: AI đào sang kiến thức chung (định nghĩa Addressables) thay vì đào **việc bạn đã làm** — nhắc nó hỏi "anh đã làm gì" chứ không hỏi "X là gì". Bẫy thứ ba: dùng câu chuyện AI viết lại cho "hay hơn" — văn hay mà không phải giọng bạn thì nói ra nghe như học thuộc.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Mid` **Kể về lần anh tối ưu hiệu năng một game.**
  → STAR: game live-service Unity 6/URP bị khựng/tràn bộ nhớ trên máy tầm trung; phần của tôi là tìm nguyên nhân và sửa. Tôi đo bằng Profiler và Memory Profiler trên máy thật trước, tìm ra thủ phạm chính (texture không nén đúng, atlas thừa, asset load mà không release), sửa từng thứ một và đo lại sau mỗi lần sửa. Kết quả nói bằng số thật của bạn: bộ nhớ/frame time trước và sau, máy nào.
- `Mid` **Kể về một crash khó nhất anh từng sửa.**
  → Chọn crash chỉ xảy ra trên build thật (IL2CPP, iOS, SDK bên thứ ba) vì đó là loại cần suy luận nhất. Kể theo trình tự: tái hiện được bằng cách nào, đọc log/symbolicate ra sao, thu hẹp bằng cách tắt dần SDK hay so với bản build cũ, nguyên nhân gốc là gì. Kết thúc bằng việc tôi làm để nó **không lặp lại** (thêm kiểm tra, log, checklist build) — đó là phần phân biệt senior.
- `Mid` **Anh tự phát hành 5 game, kể về quá trình đó.**
  → Một người làm từ ý tưởng tới store: Unity, art/asset, tích hợp AdMob và IAP, build Android + iOS, đưa lên Play Console và App Store, chạy quảng cáo, đọc chỉ số. Nói thật về kết quả (lượt tải, rating, doanh thu dù nhỏ) và một bài học cụ thể, ví dụ retention ngày 1 thấp dạy tôi làm onboarding kỹ hơn. Điều người hỏi muốn nghe là bạn hiểu cả vòng đời sản phẩm, không chỉ phần code.
- `Senior` **Anh dựng hệ AI-agent làm game thế nào, nó giúp được gì?**
  → GameDev Hub: một CLI Python điều phối nhiều agent Claude Code theo vai planner / worker / tester / auditor, có bộ nhớ dài hạn, kho asset Unity dùng chung giữ GUID và bộ khung game gắn bằng git submodule. Giá trị không phải "AI code hộ" mà là quy trình: có spec, có người kiểm, có luật cấm agent sửa thứ không được sửa. Nói rõ giới hạn — AI sai ở đâu và tôi chặn thế nào — vì người hỏi sẽ lo bạn đẩy code AI chưa kiểm vào dự án của họ.
- `Mid` **Trong dự án live-service, phần của anh là gì?**
  → Nêu tên hệ thống cụ thể bạn sở hữu đầu–cuối (ví dụ một màn hình gacha, hệ guild, tích hợp IAP, pipeline Addressables), không liệt kê mọi thứ đội làm. Nói quy mô: số người trong đội client, chu kỳ release/event, và bạn phối hợp với server, planner, artist thế nào. Câu này là cửa vào mọi câu đào sau, nên câu trả lời phải đủ cụ thể để họ có chỗ bám.
- `Mid` **Anh dùng Addressables thế nào, từng gặp vấn đề gì?**
  → Chia group theo thời điểm cần (lúc boot, theo màn, theo event), load bằng handle và luôn release đúng số lần đã load, vì Addressables đếm tham chiếu. Vấn đề hay gặp: asset bị kéo trùng vào nhiều bundle do phụ thuộc ngầm, và rò bộ nhớ khi quên release; tôi kiểm bằng Analyze rules và Memory Profiler. Với game live-service còn có cập nhật catalog từ CDN để ra event mà không cần build mới.
- `Mid` **Vì sao dự án dùng gRPC, client xử lý mất mạng ra sao?**
  → gRPC + protobuf cho contract chặt giữa client và server, payload nhỏ, sinh code hai phía từ cùng file `.proto`. Phía client mọi lời gọi có timeout, retry có giới hạn cho lời gọi idempotent, còn lời gọi thay đổi tài nguyên (mua, nhận thưởng) đi kèm khoá idempotency để retry không trừ tiền hai lần. Mất mạng thì hiện màn chờ/kết nối lại chứ không để người chơi bấm tiếp trên trạng thái cũ.
- `Mid` **Luồng IAP anh làm thế nào cho an toàn?**
  → Client mua qua store, nhận receipt, gửi receipt lên server; **server** xác thực với Apple/Google rồi mới cộng vật phẩm, client chỉ hiển thị kết quả server trả. Giao dịch chỉ được đóng (confirm/finish) sau khi server cộng xong, nên app bị kill giữa chừng thì lần mở sau vẫn xử lý tiếp được. Hai lỗi kinh điển: client tự cộng vật phẩm, và finish giao dịch trước khi server xác nhận.
- `Senior` **Anh làm việc với spec tiếng Nhật và đội Nhật thế nào?**
  → Đọc spec, gom câu hỏi thành một danh sách có đánh số thay vì hỏi rải rác, và xác nhận lại bằng chữ những chỗ hiểu có thể lệch. Báo tiến độ và rủi ro **sớm**, vì văn hoá làm việc với Nhật coi trọng không bất ngờ hơn tốc độ. Ví dụ một lần phát hiện spec mâu thuẫn và hỏi trước khi làm đã tiết kiệm được việc làm lại.
- `Senior` **Mười năm qua anh thấy mình tiến bộ nhất ở đâu?**
  → Từ "làm cho chạy" sang "làm cho đội vận hành được": đo trước khi tối ưu, viết để người khác bảo trì, và tự động hoá phần lặp lại. Lấy một ví dụ đối chiếu trước/sau cụ thể của chính bạn, vì câu này họ đang đo khả năng tự nhìn lại.
- `Junior` **Vì sao anh chuyển từ lập trình web ASP.NET sang làm game?**
  → Nói một lý do thật về đam mê sản phẩm và một lý do thực tế: game cho thấy kết quả việc mình làm ngay trên tay người chơi. Rồi nối với lợi thế: nền C#, SQL và web giúp tôi hiểu phía server, nên khi làm client live-service với gRPC tôi nói chuyện được với đội backend. Đó là cách biến một chặng "lạc đề" trong CV thành điểm cộng.
- `Junior` **Anh làm game casual có quảng cáo và IAP ở công ty đầu tiên thế nào?**
  → Kể quy mô (đội mấy người, mấy game) và phần của mình: gameplay, tích hợp SDK quảng cáo, IAP, build lên store. Điều đáng nói nhất là bài học sớm về monetization: vị trí đặt quảng cáo ảnh hưởng retention thế nào. Kinh nghiệm này nối thẳng sang 5 game tự phát hành sau này.
- `Mid` **Ở công ty casino/slot anh làm gì với SmartFoxServer?**
  → SmartFoxServer là server realtime cho game nhiều người; phía client tôi xử lý kết nối, gửi nhận sự kiện phòng chơi, và cập nhật UI theo trạng thái server gửi về. Bài học chính là client không bao giờ tự quyết kết quả quay — server quyết, client chỉ diễn hoạt cảnh cho khớp. Đây cũng là chỗ tôi làm cả Unity lẫn Cocos Creator.
- `Mid` **Anh lên Senior năm 2022 — điều gì thay đổi trong công việc?**
  → Từ nhận task sang chịu trách nhiệm một mảng: tôi review code, kèm người mới, ước lượng cho phần mình, và trao đổi trực tiếp với phía Nhật về spec. Nói một ví dụ cụ thể về việc kèm một bạn junior hoặc một quyết định kỹ thuật bạn chốt. Họ đang xem bạn có làm được việc của Senior chứ không chỉ mang chức danh.
- `Mid` **Anh từng viết shader gì, vì sao phải viết tay?**
  → Kể một hiệu ứng cụ thể (outline nhân vật, dissolve, hiệu ứng UI, post-processing) và lý do không dùng sẵn: cần nhẹ hơn trên mobile, hoặc cần đúng phong cách art. Nói thêm cách kiểm hiệu năng: số variant, chi phí trên GPU máy tầm trung. Shader viết đẹp mà làm tụt fps là câu chuyện ngược.
- `Mid` **Anh làm multiplayer với Photon thế nào, xử lý lag ra sao?**
  → Nói rõ mô hình: ai có quyền quyết định (master client hay server), đồng bộ gì bằng RPC, gì bằng state. Với lag thì nội suy vị trí của người chơi khác, dự đoán phía client cho chính mình, và để server/master quyết kết quả quan trọng. Nêu một lỗi đồng bộ thật bạn đã gặp và cách sửa.
- `Mid` **Codebase hàng nghìn script, anh làm quen và sửa thế nào mà không phá?**
  → Tuần đầu đọc luồng chính (boot, đăng nhập, một màn hình điển hình) thay vì đọc hết, và hỏi người cũ về chỗ "đừng đụng vào". Khi sửa, tôi tìm mọi chỗ gọi tới, sửa nhỏ, có review, và test lại trên máy thật các màn liên quan. Codebase lớn không đáng sợ bằng việc sửa mà không biết ai đang dùng code đó.
- `Mid` **Anh tích hợp những SDK nào, cái nào khó nhất?**
  → Kể tên: Firebase, Adjust, IAP, CRIWare cho âm thanh/video, Utage cho phần kể chuyện. Chọn một cái khó và nói vì sao — xung đột thư viện native Android, cấu hình iOS, hay phiên bản SDK vỡ khi nâng Unity. Kèm cách làm cho lần nâng sau an toàn hơn: tách lớp bọc SDK, ghi checklist build.
- `Mid` **Anh dùng CI để build thế nào?**
  → Mô tả pipeline đã dùng (Jenkins hoặc Drone): build tự động theo nhánh, đánh số version, đẩy bản thử cho QA. Giá trị chính là bản build không phụ thuộc máy của một người, và lỗi build bị phát hiện ngay khi merge chứ không phải lúc sắp ra bản. Nếu chỉ tham gia dùng chứ không dựng, nói rõ như vậy.
- `Mid` **Anh làm việc từ xa có kỷ luật thế nào?**
  → Giờ làm cố định, báo đầu ngày việc sẽ làm và cuối ngày việc đã xong, đẩy code nhỏ và thường xuyên để người khác thấy tiến độ. Hỏi bằng chữ rõ ràng, có đánh số, để người ở múi giờ khác trả lời được không cần họp. Mấy năm làm với đội Nhật và tự làm game ở nhà là bằng chứng tôi đã quen nhịp này.
- `Senior` **Anh dùng AI trong công việc thế nào, có lo lộ code của công ty không?**
  → Tôi dùng AI để đọc code nhanh, viết test, viết công cụ và việc lặp lại; mọi đoạn code AI viết đều qua review và test như code người viết. Về bảo mật: tuân thủ quy định của công ty, không đưa code hay tài liệu nội bộ lên công cụ không được phép. Chủ động hỏi chính sách AI của công ty trước là điểm cộng.
- `Senior` **Mười năm sao anh chưa làm lead?**
  → Trả lời thật về lựa chọn: tôi muốn ở gần code và sản phẩm, trong lúc vẫn kèm người mới và chịu trách nhiệm một mảng kỹ thuật. Nói rõ sẵn sàng dẫn nhóm nhỏ khi có cơ hội, kèm bằng chứng đã làm một phần việc của lead. Không xin lỗi cho lựa chọn của mình, vì nghe như tự ti.
- `Senior` **Thời gian gần đây anh không đi làm, anh đã làm gì?**
  → Nói mốc nghỉ rõ ràng và những gì có sản phẩm thấy được: phát triển game riêng, hệ công cụ AI làm game, ôn kỹ thuật cho bước tiếp theo. Người hỏi muốn biết kỹ năng có bị mai một không, nên đưa ra thứ cụ thể đã làm trong thời gian đó.
- `Senior` **Nếu vào công ty, ba tháng đầu anh sẽ làm gì?**
  → Tháng đầu học codebase và quy trình, nhận bug và task nhỏ để hiểu hệ thống. Tháng hai nhận một tính năng nhỏ trọn vẹn. Tháng ba bắt đầu đóng góp ngoài task: đo hiệu năng, công cụ cho đội, cải tiến quy trình build. Câu trả lời cho thấy bạn không vội phá cái có sẵn nhưng cũng không thụ động.

**Khung trả lời 60 giây** — "Kể về dự án anh tự hào nhất"

> Dự án tôi tự hào nhất là một game RPG anime live-service cho đối tác Nhật, Unity, chạy cả Android và iOS. Phần của tôi là client các tính năng meta và tối ưu.
>
> Khó nhất là game chạy nặng trên máy tầm trung khi event có nhiều asset mới. Tôi đo trên máy thật bằng Profiler và Memory Profiler, tìm ra ba thủ phạm chính rồi sửa từng thứ và đo lại sau mỗi bước. Kết quả là [số trước] xuống [số sau], và event sau đó ra mà không phát sinh crash vì bộ nhớ.
>
> Điều tôi học được là tối ưu không phải mẹo, mà là quy trình: đo, sửa một thứ, đo lại, và để lại công cụ kiểm để lần sau không ai làm hỏng lại.

**Họ sẽ đào tiếp**

- *"Ba thủ phạm đó là gì cụ thể?"* → Kể tên đúng kỹ thuật (texture format, atlas, asset không release, alloc mỗi frame) và vì sao mỗi thứ tốn.
- *"Sao anh biết đó là nguyên nhân chứ không phải trùng hợp?"* → Vì sửa từng thứ một và đo lại sau mỗi lần; số đổi theo đúng từng thay đổi.
- *"Nếu làm lại từ đầu anh làm khác gì?"* → Đặt ngân sách bộ nhớ/frame ngay từ đầu dự án và đưa đo hiệu năng vào quy trình build, thay vì chữa cháy khi event đã ra.
- *"Đội anh khi đó bao nhiêu người, ai quyết định?"* → Nói rõ quy mô và ranh giới: phần nào tôi đề xuất, phần nào lead duyệt.

**Cờ đỏ**

- Kể câu chuyện không có con số nào, hoặc con số tròn đẹp mà không nói được đo bằng gì.
- Dùng "chúng tôi" suốt, không tách được phần của mình.
- Dòng CV ghi một công nghệ nhưng không trả lời nổi câu hỏi thứ hai về nó.
- Nói về hệ AI-agent như thể AI làm thay mọi thứ — người hỏi nghe thành "không kiểm code".
- Kể lộ thông tin nội bộ của công ty cũ (số doanh thu, code, tài liệu) — bị coi là không giữ bí mật.

**Số / ví dụ nên thuộc**

- Mốc nghề: **2015** ASP.NET → **2016** Unity → **2018–2019** Unity + Cocos Creator (casino/slot) → **2020–2023** game anime cho NPH Nhật (Senior từ 2022) → **2023–10/2026** Unity 6/URP, gRPC.
- **5 game** tự phát hành: Last Tower, Stickman Archer Duel, Marble Rush, Find Numbers 1-100, Stickman Block Defense.
- STAR: **S 1–2 câu, T 1 câu, A 3–4 câu, R có số** — tổng dưới **2 phút**.
- Bốn câu chuyện: **tối ưu · crash khó · tự phát hành · AI-agent**.
