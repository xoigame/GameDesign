---
title: AI ở khâu phát hành
icon: 🚀
summary: Store page, trailer, bản dịch, phân tích review, patch note — và ranh giới không được bước qua.
status: deep
read: 98
level: basic
order: 8
tags: [ai-dev, publish, marketing, workflow]
related: [ai-for-build, ai-limits, playtesting-metrics, narrative]
---

Khâu phát hành là chỗ AI có ích rõ mà ít người dùng — phần lớn người làm game indie làm khâu này một mình và làm lần đầu.

## Việc AI làm được

**Store page**
- Bản nháp mô tả ngắn/dài, nhiều phiên bản để bạn chọn giọng
- Danh sách tag/keyword đề xuất từ mô tả game
- Rà lỗi chính tả, độ dài, câu rườm rà

Nhưng: **quy định store về độ dài, nội dung, và công bố dùng AI thay đổi theo thời gian**. Tự kiểm tra với tài liệu chính thức của store tại thời điểm bạn phát hành, đừng dựa vào AI nhớ.

**Trailer**
- Kịch bản và shot list (không phải bản dựng)
- Thứ tự cảnh theo nguyên lý nhịp độ — xem [[pacing]]
- Bản nháp lời thoại/caption

Cái AI không làm được: **chọn được 8 giây hay nhất trong game của bạn**. Đó là gu, và nó không xem được gameplay.

**Bản dịch**
- Nháp dịch cho store page và nội dung trong game
- Phát hiện chuỗi hardcode còn sót

Ba lưu ý bắt buộc:
1. **Layout vỡ** — tiếng Đức dài hơn ~30%, tiếng Việt cao dòng hơn. Xem [[ui-design]].
2. **Thuật ngữ game cần glossary** — đưa bảng thuật ngữ, nếu không cùng một skill có ba tên khác nhau.
3. **Bản dịch nháp vẫn cần người bản ngữ đọc** trước khi ship, nhất là marketing copy.

**Phân tích phản hồi** — đây là mảng giá trị cao nhất
- Gom review/comment, phân loại theo chủ đề, đếm tần suất
- Tách "bug thật" khỏi "không thích thiết kế" khỏi "chơi sai cách"
- Phát hiện chủ đề mới xuất hiện sau một patch

Xem [[playtesting-metrics]] về cách đọc số liệu. Điểm mấu chốt: người chơi giỏi phát hiện vấn đề, dở đề xuất giải pháp — nên nhờ AI **gom nhóm triệu chứng**, không nhờ nó tổng hợp thành yêu cầu tính năng.

**Vận hành**
- Patch note từ git log
- Bản nháp devlog
- Bản nháp trả lời câu hỏi lặp lại (bạn đọc và sửa trước khi gửi)

## Ranh giới không bước qua

| Đừng | Vì sao |
|---|---|
| Tạo review giả | Vi phạm điều khoản mọi store, và bị phát hiện |
| Tự động đăng trả lời chưa đọc | Một câu sai giọng phá quan hệ cộng đồng lâu dài |
| Giả danh người khác | Rõ ràng |
| Dùng nghệ danh/thương hiệu người khác trong marketing | Rủi ro pháp lý |
| Nói game có tính năng chưa có | Bạn sẽ phải refund |

Về **công bố việc dùng AI**: một số store có yêu cầu khai báo asset sinh bằng AI, và quy định này đang thay đổi. Đây là việc phải tự xác minh với store tại thời điểm phát hành — xem thêm [[asset-generation]] về giấy phép.

## Thứ tự ưu tiên nếu ít thời gian

1. **Phân tích phản hồi** — ROI cao nhất, không rủi ro
2. **Patch note từ git log** — tiết kiệm thời gian thật, mỗi bản cập nhật
3. **Rà soát store page** — bắt lỗi bạn đọc quen mắt không thấy
4. **Nháp dịch** — chỉ khi có người bản ngữ review
5. **Kịch bản trailer** — hữu ích nhưng bạn vẫn phải dựng

## 🤖 Prompt cho AI

**Dùng AI thế nào cho khâu phát hành**

Nguyên tắc khác hẳn hai khâu trước: ở đây **mọi đầu ra đều hướng ra ngoài**, nên quy trình phải là **nháp → bạn đọc → bạn gửi**. Không có chế độ tự động.

| Chế độ | Dùng cho | Bạn làm gì sau |
|---|---|---|
| **Phân tích** | Review, log, comment | Đọc kết luận, tự quyết định sửa gì |
| **Nháp** | Store page, patch note, devlog | Sửa giọng, kiểm tra sự thật, rồi gửi |
| **Rà soát** | Bản bạn đã viết | Sửa theo góp ý bạn đồng ý |
| **Dịch** | Nội dung đã chốt | Người bản ngữ đọc lại |

**Phải nêu rõ:**
- Giọng và đối tượng (người chơi roguelike hardcore ≠ người chơi casual)
- Sự thật về game — AI **sẽ bịa tính năng** nếu bạn không liệt kê
- Giới hạn độ dài của store bạn nhắm tới
- Cấm tuyệt đối: không nói tính năng chưa có, không so sánh với game khác bằng tên

**Mẫu prompt — phân tích phản hồi**

```
Đây là 200 review/comment về game tôi: <dán hoặc trỏ file>

Phân loại từng cái vào MỘT nhóm:
  BUG          — mô tả hành vi sai, tái hiện được
  KHÓ CHỊU     — cơ chế hoạt động đúng nhưng gây bực
  KHÔNG THÍCH  — không đồng ý với quyết định thiết kế
  CHƠI SAI     — chưa hiểu cơ chế (→ vấn đề onboarding)
  KHEN         — không cần hành động

Xuất bảng: | nhóm | số lượng | chủ đề lặp lại nhiều nhất | ví dụ nguyên văn |

Ba ưu tiên hàng đầu theo (số lượng × mức nghiêm trọng). Với mỗi cái, nói rõ
nó là vấn đề THIẾT KẾ hay vấn đề TRUYỀN ĐẠT — vì cách sửa khác nhau.

Đừng đề xuất tính năng mới. Chỉ phân loại và xếp ưu tiên.
```

Câu cuối quan trọng: không có nó, AI biến 200 phàn nàn thành một danh sách 40 tính năng, và đó không phải thứ bạn cần.

**Mẫu prompt — patch note**

```
Git log từ tag v0.8 tới HEAD: <dán>

Viết patch note cho NGƯỜI CHƠI, không cho lập trình viên.

Quy tắc:
- Nhóm theo trải nghiệm (Chiến đấu / Cân bằng / Sửa lỗi / Hiệu năng),
  KHÔNG nhóm theo module code
- Bỏ commit refactor, đổi tên, sửa typo nội bộ
- Mỗi dòng nói NGƯỜI CHƠI CẢM NHẬN gì, không nói code đổi gì
  ("Boss giờ báo đòn sớm hơn 0.2s" chứ không "sửa startupFrames")
- ĐỪNG bịa gì không có trong log. Không rõ thì hỏi tôi.
```

**Bẫy thường gặp:** nhờ viết store page mà không đưa danh sách tính năng thật → AI bịa ra thứ nghe hợp lý cho thể loại đó. Bạn đọc qua thấy trôi, người chơi mua rồi mới phát hiện. Luôn dán danh sách tính năng và thêm *"chỉ viết về những gì tôi liệt kê"*.

## 🎮 Unity

Khâu phát hành trong Unity có hai chỗ AI giúp thật, và cả hai đều là **script chứ không phải văn bản**.

**1. Build pipeline và CI**

Đây là việc AI làm rất tốt: thuần script, kiểm chứng được, không đụng gameplay.

```csharp
// Assets/Editor/BuildScript.cs — gọi từ CI
public static class BuildScript {
    public static void BuildWindows() {
        var opts = new BuildPlayerOptions {
            scenes = EditorBuildSettings.scenes
                       .Where(s => s.enabled).Select(s => s.path).ToArray(),
            locationPathName = "Build/Windows/Game.exe",
            target = BuildTarget.StandaloneWindows64,
            options = BuildOptions.None,
        };
        var report = BuildPipeline.BuildPlayer(opts);
        if (report.summary.result != BuildResult.Succeeded)
            EditorApplication.Exit(1);       // BẮT BUỘC: CI phải đỏ khi build fail
    }
}
```

Dòng `EditorApplication.Exit(1)` là thứ hay bị quên — thiếu nó, CI báo xanh dù build thất bại.

**2. Kiểm tra trước khi ship**

Nhờ AI viết validator quét những thứ chỉ lộ ra ở build:

```
Viết editor tool "Pre-ship checklist" quét project và báo cáo:
1. Scene nào trong Build Settings mà KHÔNG có trong Assets/Scenes/ (đường dẫn chết)
2. Texture nào chưa nén (Compression = None) ngoài thư mục pixel art
3. AudioClip nào Load Type = Decompress On Load mà dài hơn 10 giây
4. Script nào còn Debug.Log không bọc #if UNITY_EDITOR
5. Asset nào trong Resources/ (vào build hết, không strip được)
6. Player Settings: Company/Product name còn mặc định không?
7. Có development build flag nào còn bật không?

Xuất EditorWindow dạng bảng, bấm vào dòng thì select object.
```

Bảy mục này là bảy lần "ship rồi mới phát hiện" phổ biến. Xem [[unity-build-platform]] về chi tiết từng mục.

**3. Localization — cái AI không thấy**

AI dịch được chuỗi, nhưng **không thấy layout vỡ**. Quy trình dùng được:

```
Bước 1 (AI):  dịch String Table, giữ nguyên key
Bước 2 (AI):  viết editor tool thay mọi chuỗi bằng bản DÀI NHẤT trong các
              ngôn ngữ, để bạn chụp màn hình kiểm tra layout
Bước 3 (BẠN): chạy tool, đi hết mọi màn hình, tìm chữ bị cắt
Bước 4 (người bản ngữ): đọc lại trước khi ship
```

Bước 2 là bước AI giúp được mà ít ai nghĩ tới — nó biến việc kiểm tra layout từ "dịch xong rồi mới biết" thành "biết trước khi dịch".

**Kiểm tra nhanh**
- Build script có `Exit(1)` khi thất bại chứ?
- Đã chạy pre-ship checklist trên bản build cuối chưa?
- Đã xem mọi màn hình UI với chuỗi dài nhất chưa?
- Có asset nào chưa rõ giấy phép trong build không? Xem [[ai-limits]].

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **AI giúp được gì ở khâu phát hành?**
  → Bốn nhóm: **store page** (bản nháp mô tả nhiều phiên bản, gợi ý tag/keyword, rà lỗi và câu rườm rà), **trailer** (kịch bản và shot list, không phải bản dựng), **bản dịch** nháp, và **phân tích phản hồi**. Đây là khâu AI có ích rõ mà ít người dùng, vì phần lớn người làm indie làm khâu này một mình và làm lần đầu.
- `Junior` **Trailer thì AI làm được gì và không làm được gì?**
  → Làm được **kịch bản, shot list, thứ tự cảnh theo nguyên lý nhịp độ, và bản nháp caption**. Không làm được việc quan trọng nhất: **chọn được 8 giây hay nhất trong game của mình**. Đó là gu, và nó không xem được gameplay — nên phần quyết định vẫn nằm ở người đã chơi game hàng trăm giờ.
- `Junior` **Ba lưu ý bắt buộc khi dùng AI dịch game?**
  → **Layout vỡ** — tiếng Đức dài hơn khoảng 30%, tiếng Việt cao dòng hơn, nên UI phải co giãn được. **Thuật ngữ game cần glossary** — không đưa bảng thuật ngữ thì cùng một skill có ba tên khác nhau ở ba màn hình. Và **bản dịch nháp vẫn cần người bản ngữ đọc** trước khi ship, nhất là marketing copy.
- `Mid` **Mảng nào ở khâu phát hành có giá trị cao nhất?**
  → **Phân tích phản hồi**: gom review và comment, phân loại theo chủ đề, đếm tần suất; tách "bug thật" khỏi "không thích thiết kế" khỏi "chơi sai cách"; và phát hiện chủ đề mới xuất hiện sau một patch. Nó biến hàng nghìn dòng cảm tính thành một bảng có thể hành động.
- `Mid` **Nhờ AI đọc phản hồi người chơi thì nhờ đến đâu là dừng?**
  → Nhờ nó **gom nhóm triệu chứng**, không nhờ nó tổng hợp thành yêu cầu tính năng. Lý do là luật nền của playtest: **người chơi giỏi phát hiện vấn đề, dở đề xuất giải pháp** — nếu để AI tổng hợp thẳng thành "nên thêm nhảy đúp" thì mình vừa khuếch đại đúng phần yếu nhất của dữ liệu.
- `Mid` **Quy định store về nội dung và công bố dùng AI thì tra ở đâu?**
  → Ở **tài liệu chính thức của store tại thời điểm phát hành**. Quy định về độ dài, nội dung, và yêu cầu công bố nội dung AI **thay đổi theo thời gian** và khác nhau giữa các nền tảng — đây là loại thông tin tôi không hỏi AI, vì nó nằm sau thời điểm cắt dữ liệu và sai ở đây thì tốn cả một vòng duyệt.
- `Senior` **Ranh giới nào không bước qua ở khâu này?**
  → **Tạo review giả** (vi phạm điều khoản mọi store và bị phát hiện), **tự động đăng trả lời chưa đọc** (một câu sai giọng phá quan hệ cộng đồng lâu dài), **giả danh người khác**, và **dùng nghệ danh hay thương hiệu người khác trong marketing** (rủi ro pháp lý). Ba cái đầu đều có chung đặc điểm: lợi ích ngắn hạn nhỏ, thiệt hại dài hạn không hoàn tác được.
- `Senior` **Patch note và devlog sinh bằng AI — quy trình an toàn là gì?**
  → Sinh **bản nháp từ git log**, rồi người đọc và sửa trước khi đăng. Hai chỗ phải kiểm: nó có nêu thứ **chưa được phát hành** không, và nó có diễn giải sai một thay đổi kỹ thuật thành lời hứa với người chơi không. Cả hai đều là lỗi im lặng — đọc trôi chảy, sai về sự thật.
- `Senior` **Vì sao "tự động đăng trả lời chưa đọc" lại nguy hiểm hơn nó trông?**
  → Vì quan hệ cộng đồng là **tài sản tích luỹ chậm và mất nhanh**: một câu trả lời sai giọng trong một luồng đang bức xúc có thể thành ảnh chụp màn hình lan đi xa hơn mọi bài marketing. Và vì đây là chỗ **tốc độ không phải vấn đề cần giải quyết** — trả lời chậm hơn nửa giờ không ai để ý, trả lời sai thì có.

**Khung trả lời 60 giây** — "Anh dùng AI ở khâu phát hành thế nào?"

> Đây là khâu AI có ích rõ mà ít người dùng, vì phần lớn người làm indie làm nó một mình và làm lần đầu. Tôi dùng cho **bản nháp**: mô tả store nhiều phiên bản để chọn giọng, gợi ý tag, kịch bản và shot list cho trailer, patch note từ git log, và bản dịch nháp.
>
> Mảng giá trị cao nhất là **phân tích phản hồi** — gom review và comment, phân loại theo chủ đề, đếm tần suất, tách bug thật khỏi chuyện không thích thiết kế. Nhưng tôi chỉ nhờ nó **gom nhóm triệu chứng**, không nhờ tổng hợp thành yêu cầu tính năng, vì người chơi giỏi phát hiện vấn đề và dở đề xuất giải pháp.
>
> Hai ranh giới cứng. Về **sự thật**: quy định store và yêu cầu công bố nội dung AI thay đổi theo thời gian, nên tôi tra tài liệu chính thức tại thời điểm phát hành chứ không hỏi AI. Về **đạo đức và pháp lý**: không review giả, không tự động đăng trả lời chưa đọc, không giả danh, không mượn thương hiệu người khác.

**Họ sẽ đào tiếp**

- *"Vì sao AI không chọn được 8 giây hay nhất?"* → Vì nó không xem được gameplay, và vì "hay nhất" ở đây nghĩa là **khoảnh khắc truyền đạt được cái đặc biệt của game trong vài giây** — thứ chỉ người đã chơi hàng trăm giờ và biết game này bán cái gì mới chọn đúng. Nó dựng được khung nhịp cho trailer, nhưng nội dung từng shot thì không.
- *"Glossary cho bản dịch gồm gì?"* → Tên riêng, tên skill và vật phẩm, thuật ngữ hệ thống, và **những từ cố ý không dịch**. Kèm theo nên có ghi chú ngữ cảnh cho các chuỗi ngắn — "Fire" là danh từ hay động từ quyết định bản dịch, và đó chính là lỗi dịch máy phổ biến nhất trong game.
- *"Phát hiện chuỗi hardcode còn sót thế nào?"* → Giao cho nó quét mã tìm chuỗi hiển thị không đi qua hệ thống localization — việc duyệt đều tay, máy làm nhanh và không bỏ sót. Kèm theo là một bài kiểm thực dụng: chạy game với **ngôn ngữ giả** kéo dài mọi chuỗi thêm 40%, chỗ nào vỡ layout hoặc vẫn hiện tiếng gốc thì lộ ra ngay.
- *"Đo xem khâu này có hiệu quả không bằng gì?"* → Bằng thứ vốn đã đo ở khâu phát hành: tỉ lệ chuyển đổi trên trang store, thời gian xem trailer, và **thời gian mình bỏ ra cho mỗi bản cập nhật cộng đồng**. Cái cuối là chỉ số trung thực nhất, vì lợi ích thật của AI ở đây là rút ngắn công việc một người đang làm một mình.

**Cờ đỏ**

- Trả lời câu hỏi về quy định store bằng trí nhớ của AI.
- Để AI tổng hợp phản hồi người chơi thẳng thành danh sách tính năng.
- Ship bản dịch máy cho marketing copy mà không có người bản ngữ đọc.
- Tự động đăng trả lời cộng đồng chưa qua người đọc.
- Không kiểm layout với ngôn ngữ dài hơn 30%.

**Số / ví dụ nên thuộc**

- Bốn nhóm việc: **store page · trailer (kịch bản, không phải bản dựng) · bản dịch · phân tích phản hồi**.
- Tiếng Đức dài hơn **~30%**; tiếng Việt cao dòng hơn — UI phải co giãn.
- Nhờ AI **gom nhóm triệu chứng**, không nhờ tổng hợp thành yêu cầu tính năng.
- Quy định store và **công bố nội dung AI**: tra nguồn chính thức tại thời điểm phát hành.
- Bốn ranh giới không bước qua: **review giả · đăng trả lời chưa đọc · giả danh · mượn thương hiệu người khác**.
