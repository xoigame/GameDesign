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
