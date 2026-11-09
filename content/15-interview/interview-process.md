---
id: interview-process
title: Git, quy trình làm việc và testing
icon: 🔀
summary: Câu hỏi về cách làm việc trong đội game — Git và xung đột scene/prefab, nhánh và release, code review, CI build, test tự động trong Unity, QA, ước lượng và sprint. Thứ người phỏng vấn dùng để biết bạn có vào đội là chạy được ngay không.
status: deep
read: 1135
level: intermediate
order: 35
tags: [interview, git, process, testing, ci]
related: [interview-situations, unity-testing-ci, unity-project-structure, project-teamwork, lead-estimation]
---

Câu hỏi quy trình nghe nhàm nhưng lọc rất mạnh: người đã làm trong đội lớn trả lời trôi chảy bằng chi tiết, người chỉ làm một mình trả lời bằng định nghĩa. Với hồ sơ vừa có đội lớn vừa tự làm game, hãy kể **chi tiết của đội** — đó là thứ studio cần.

## Git trong dự án Unity

| Chủ đề | Điều phải biết | Bẫy |
|---|---|---|
| **Cái gì commit** | `Assets/`, `Packages/`, `ProjectSettings/`, file `.meta` | Bỏ `.meta` ⇒ mất GUID, mọi tham chiếu vỡ |
| **Cái gì không commit** | `Library/`, `Temp/`, `Logs/`, `obj/`, `Build/`, `UserSettings/` | Commit `Library/` ⇒ repo phình, xung đột vô nghĩa |
| **Asset Serialization** | Force Text để diff/merge được scene, prefab | Binary ⇒ không merge được |
| **Git LFS** | Texture, audio, model, video lớn | Quên cài LFS trên máy mới ⇒ chỉ thấy file con trỏ |
| **Merge scene/prefab** | UnityYAMLMerge (Smart Merge), chia nhỏ scene, prefab lồng nhau | Hai người sửa cùng scene ⇒ một người mất việc |
| **Khoá file** | LFS lock hoặc quy ước "ai đang giữ scene nào" | Không có quy ước ⇒ xung đột lặp lại |

Cách giảm xung đột hiệu quả nhất không phải công cụ mà là **cấu trúc**: scene chỉ chứa khung, nội dung nằm trong prefab, mỗi người sở hữu prefab của mình. Chi tiết ở [[unity-project-structure]].

SVN vẫn còn ở nhiều đội làm với Nhật: khoá file (lock) là tính năng chính, commit thẳng lên trung tâm, không có nhánh nhẹ như Git. Đã dùng cả hai thì nói được điểm khác này là điểm cộng.

## Nhánh và release

| Mô hình | Hợp với | Cái giá |
|---|---|---|
| **Trunk-based** (nhánh ngắn, merge hằng ngày, feature flag) | Đội live-service ra bản thường xuyên | Cần CI tốt và cờ tắt tính năng chưa xong |
| **Git Flow** (develop, feature, release, hotfix) | Bản phát hành theo đợt, nhiều phiên bản song song | Nhánh sống lâu ⇒ merge đau |
| **Nhánh release + hotfix** | Game đã lên store cần vá gấp | Vá trên release phải merge ngược về nhánh chính |

Với game live-service, câu hỏi hay gặp là **hotfix**: sửa trên nhánh release đang chạy, build, test nhanh trên máy thật, nộp store (hoặc vá bằng tải asset/master data nếu không cần build), rồi **merge ngược** về nhánh chính để bản sau không mất bản vá.

## Code review

Thứ tự review: **đúng yêu cầu → ranh giới và phụ thuộc → vòng đời và tài nguyên → hiệu năng → đặt tên và phong cách**. Riêng Unity, ba thứ hay bị bỏ lọt:

- `+=` sự kiện không có `-=` tương ứng ⇒ rò bộ nhớ, gọi vào object đã huỷ.
- Alloc trong `Update` (LINQ, nối chuỗi, `GetComponent` lặp lại).
- Load asset không release, hoặc `.material` sinh bản sao không huỷ.

Pull request tốt: nhỏ (dưới vài trăm dòng), mô tả vì sao chứ không chỉ cái gì, có ảnh/video với thay đổi UI, có số đo với thay đổi hiệu năng.

## CI và build

CI cho Unity: máy build (Jenkins, Drone, GitHub Actions + runner riêng, Unity Build Automation) chạy build theo nhánh, đánh số version tự động, chạy test, đẩy bản thử cho QA (TestFlight, Firebase App Distribution, Play internal testing). Giá trị cốt lõi: **bản build không phụ thuộc máy một người**, và lỗi build bị bắt lúc merge chứ không phải đêm trước ngày nộp store. Xem [[unity-testing-ci]].

Ba thứ hay hỏng trên máy build mà máy dev không hỏng: thiếu module platform, khác phiên bản Unity, và cache `Library/` cũ.

## Test trong Unity

| Loại | Công cụ | Dùng cho |
|---|---|---|
| **EditMode test** | Unity Test Framework (NUnit) | Logic thuần: công thức sát thương, inventory, parse master data |
| **PlayMode test** | Unity Test Framework, `[UnityTest]` coroutine | Vòng đời, scene, luồng nhiều frame |
| **Test hiệu năng** | Performance Testing package | Đặt ngưỡng ms/alloc để không ai làm tụt |
| **Smoke test build** | Script tự chạy qua màn chính | Bắt crash lúc boot trước khi gửi QA |
| **Test thủ công** | QA với checklist | UX, máy thật, trường hợp lạ |

Điều kiện để test được là **tách logic khỏi MonoBehaviour**: lớp C# thuần nhận dữ liệu vào, trả kết quả ra; MonoBehaviour chỉ nối với engine. Code dồn hết vào `Update` thì không test tự động được — đó là câu trả lời thật cho câu "sao dự án anh ít test".

## Làm việc với QA

- Bug report tốt có: bước tái hiện, kết quả mong đợi, kết quả thực tế, máy + phiên bản build, tần suất, log/video.
- Mức độ: **crash/mất dữ liệu/sai tiền** > chặn tiến trình > sai chức năng > hiển thị.
- Sửa xong ghi rõ nguyên nhân và phạm vi ảnh hưởng để QA test lại đúng chỗ, kể cả các màn liên quan.

## Sprint và ước lượng

Đội game thường chạy sprint 1–2 tuần: planning, daily ngắn, review, retro. Câu hỏi hay gặp không phải "Scrum là gì" mà là **"anh làm gì khi task trong sprint phình ra"** — trả lời ở [[interview-situations]] và [[lead-estimation]].

## 🤖 Prompt cho AI

**Dùng AI thế nào để luyện câu quy trình**

Câu quy trình chấm bằng **chi tiết thật**, nên dùng AI để bắt bạn kể chi tiết chứ đừng để AI đưa định nghĩa. Bảo AI đóng vai lead đang tuyển người vào đội có sẵn quy trình, hỏi về những tình huống cụ thể (xung đột scene, hotfix, review) và chấm câu nào nghe như sách.

**Phải nêu rõ**
- Công cụ bạn đã dùng thật: Git hay SVN, CI nào, có test tự động không.
- Mô hình nhánh của đội cũ, để AI hỏi đúng chỗ.
- Bạn ở vai nào trong quy trình (dùng CI hay dựng CI, review hay được review).
- Yêu cầu AI hỏi "anh đã làm thế nào" chứ không hỏi "X là gì".

**Mẫu prompt**

```
Đóng vai lead client của một studio Unity mobile live-service. Tôi ứng tuyển
Unity developer. Hỏi tôi về quy trình làm việc: Git với scene/prefab, nhánh và
hotfix, code review, CI build, test tự động, làm việc với QA.
- Hỏi TỪNG câu, chờ tôi trả lời.
- Ưu tiên câu tình huống ("hai người sửa cùng prefab thì sao") hơn định nghĩa.
- Chấm: có chi tiết thật không, có nói công cụ cụ thể không, có nói vì sao không.
- Câu nào nghe như đọc sách thì nói thẳng.
```

**Bẫy thường gặp:** AI cho rằng mọi đội đều dùng Git Flow và CI hoàn hảo — câu trả lời kiểu đó nghe như sách; đội thật có nợ quy trình, và nói được nợ đó cùng cách mình xoay xở mới thuyết phục. Bẫy thứ hai: AI khuyên khoe "luôn viết test cho mọi thứ" — người phỏng vấn biết game hiếm khi như vậy, nói thật mức test và chỗ test có giá trị nhất. Bẫy thứ ba: AI trộn lệnh Git sai (nhầm `reset --hard` với `revert`) — kiểm lại mọi lệnh trước khi nói ra.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Trong dự án Unity, những thư mục nào commit lên Git, những gì không?**
  → Commit `Assets`, `Packages`, `ProjectSettings` và toàn bộ file `.meta`; bỏ `Library`, `Temp`, `Logs`, `obj`, `Build`, `UserSettings` vì chúng sinh lại được và khác nhau theo máy. File `.meta` bắt buộc phải commit vì chứa GUID — mất nó là mọi tham chiếu tới asset đó vỡ.
- `Junior` **Vì sao phải để Asset Serialization ở chế độ Force Text?**
  → Để scene, prefab, ScriptableObject là YAML đọc được, diff và merge được bằng Git. Ở chế độ binary, hai người sửa cùng file thì chỉ chọn được bản của một người. Text còn giúp review thấy thay đổi giá trị trong prefab.
- `Junior` **Git LFS dùng để làm gì trong dự án game?**
  → Lưu file nhị phân lớn (texture, audio, model, video) ngoài lịch sử Git thường, repo chỉ giữ con trỏ, nhờ vậy clone nhanh và repo không phình. Bẫy hay gặp là máy mới quên cài LFS nên chỉ thấy file con trỏ và asset hồng. LFS còn có khoá file, hữu ích cho asset không merge được.
- `Mid` **Hai người cùng sửa một scene, Git báo xung đột. Anh xử lý thế nào?**
  → Trước hết thử UnityYAMLMerge (Smart Merge) vì nó hiểu cấu trúc YAML của Unity. Nếu vẫn vỡ thì giữ bản của một người và người kia làm lại phần của mình — merge tay YAML scene rất dễ hỏng tham chiếu. Lâu dài thì sửa gốc: scene chỉ chứa khung, nội dung nằm trong prefab riêng, và có quy ước ai đang giữ scene nào.
- `Mid` **Anh tổ chức project thế nào để giảm xung đột?**
  → Chia theo tính năng thay vì theo loại file, mỗi màn hình/tính năng là một prefab do một người sở hữu, prefab lồng nhau và prefab variant thay vì nhân bản. Scene mỏng, nạp nội dung lúc chạy. Cấu trúc tốt giảm xung đột nhiều hơn mọi công cụ merge.
- `Mid` **Merge và rebase khác nhau thế nào, anh dùng cái nào?**
  → Merge giữ nguyên lịch sử và tạo commit gộp; rebase viết lại commit của mình lên đỉnh nhánh đích cho lịch sử thẳng. Tôi rebase nhánh cá nhân trước khi mở PR cho gọn, nhưng không bao giờ rebase nhánh đã có người khác dùng, vì viết lại lịch sử chung làm người khác bị lệch.
- `Mid` **Lỡ commit nhầm lên nhánh chung, anh hoàn tác thế nào?**
  → Trên nhánh chung tôi dùng `git revert` để tạo commit đảo ngược, vì nó không viết lại lịch sử người khác đã kéo về. `reset --hard` rồi `push --force` chỉ chấp nhận trên nhánh riêng của mình. Commit lộ mật khẩu hay key thì revert không đủ — phải thu hồi key ngay vì lịch sử vẫn còn.
- `Mid` **Đội anh dùng mô hình nhánh nào, vì sao?**
  → Kể mô hình thật đã dùng: nhánh chính, nhánh tính năng ngắn, nhánh release cho từng bản lên store, hotfix tách từ release. Nói vì sao hợp với nhịp ra bản của game live-service, và cái giá: nhánh sống lâu thì merge đau, nên đội cố giữ nhánh tính năng ngắn.
- `Mid` **Game đang chạy cần hotfix gấp. Quy trình nhánh thế nào?**
  → Tách nhánh hotfix từ đúng bản release đang chạy chứ không phải từ nhánh chính đang có tính năng dở. Sửa nhỏ nhất có thể, build, test trên máy thật, nộp store hoặc vá bằng asset/master data nếu không cần build. Cuối cùng merge ngược về nhánh chính để bản sau không mất bản vá.
- `Mid` **Feature flag là gì, dùng khi nào?**
  → Cờ bật/tắt tính năng điều khiển từ server hoặc master data, cho phép merge code chưa xong mà không lộ ra người chơi, bật dần theo tỉ lệ, và tắt nóng khi tính năng gây lỗi. Cái giá là code có hai nhánh logic và phải dọn cờ cũ, nếu không sẽ thành nợ.
- `Mid` **Anh review code theo thứ tự nào?**
  → Đúng yêu cầu và có test không, rồi ranh giới (đúng tầng chưa, có phụ thuộc vòng không), rồi vòng đời và tài nguyên (`+=` có `-=`, load có release), rồi hiệu năng (alloc trong `Update`), cuối cùng mới tới đặt tên. Đảo thứ tự thì tốn thời gian bàn tên biến mà lọt bug thật.
- `Mid` **Một pull request tốt trông thế nào?**
  → Nhỏ, một mục đích, mô tả vì sao thay đổi và cách kiểm, có ảnh hoặc video nếu đổi UI, có số đo trước/sau nếu đổi hiệu năng. PR nhỏ được review kỹ và nhanh; PR hai nghìn dòng thì chỉ được duyệt cho qua.
- `Mid` **Bị review bình luận gắt vào code của mình, anh phản ứng thế nào?**
  → Tách bình luận khỏi cảm xúc: đọc xem đúng không, đúng thì sửa và cảm ơn, chưa rõ thì hỏi lại lý do, không đồng ý thì đưa lý do kỹ thuật hoặc số đo. Review là để code tốt hơn, không phải để thắng, và người review gắt thường là người bắt được bug thật.
- `Mid` **CI build Unity của đội anh hoạt động thế nào?**
  → Kể pipeline thật: máy build kéo nhánh, build bằng command line với phương thức build tĩnh, tự đánh số version, chạy test, đẩy bản lên kênh test cho QA. Nói rõ mình dựng hay chỉ dùng và sửa job. Giá trị chính là build không phụ thuộc máy cá nhân và lỗi bị bắt ngay khi merge.
- `Mid` **Build trên máy anh chạy, trên CI lỗi. Anh tìm nguyên nhân thế nào?**
  → So khác biệt môi trường: phiên bản Unity, module platform, SDK Android/Xcode, biến môi trường, và cache `Library` cũ trên máy build. Đọc log build từ lỗi đầu tiên chứ không phải dòng cuối. Thường gặp nhất là file chưa commit trên máy mình — CI mới là nguồn sự thật.
- `Mid` **Anh viết test tự động trong Unity thế nào?**
  → Dùng Unity Test Framework: EditMode test cho logic thuần như công thức sát thương, inventory, parse master data; PlayMode test cho luồng cần vòng đời engine. Điều kiện là tách logic ra lớp C# thuần, MonoBehaviour chỉ nối với engine. Phần có giá trị nhất để test là thứ dính tới tiền và dữ liệu người chơi.
- `Mid` **Dự án game ít khi có nhiều test. Theo anh nên test cái gì trước?**
  → Test chỗ sai thì đắt nhất: tính toán tiền và phần thưởng, parse master data, migration save, logic kết quả trận. UI và cảm giác chơi để QA thủ công. Thêm một smoke test build tự chạy qua màn chính để bắt crash lúc boot — rẻ mà cứu được nhiều lần nộp store.
- `Mid` **Bug report tốt cần có gì? Anh đã nhận bug report tệ chưa?**
  → Bước tái hiện, kết quả mong đợi, kết quả thực tế, máy và phiên bản build, tần suất, log hoặc video. Gặp report thiếu thì hỏi lại đủ thông tin thay vì đóng bug, và đề xuất mẫu report chung cho đội. Bug không tái hiện được thì thêm log để lần sau có dữ liệu.
- `Mid` **Sửa xong bug, anh báo lại QA thế nào?**
  → Ghi nguyên nhân gốc, cách sửa, và phạm vi ảnh hưởng — những màn hình hay tính năng nào cũng có thể bị đụng — để QA test lại đúng chỗ, không chỉ đúng bước cũ. Ghi phiên bản build có bản sửa. Thiếu phạm vi ảnh hưởng là cách bug mới lọt ra từ bản sửa bug cũ.
- `Mid` **Anh từng dùng SVN chưa, khác Git thế nào?**
  → SVN là tập trung: commit thẳng lên server, khoá file là tính năng chính, nhánh nặng hơn Git. Git phân tán, nhánh nhẹ, làm offline được, nhưng file nhị phân cần LFS. Nhiều đội làm với Nhật vẫn dùng SVN cho asset vì khoá file hợp với asset không merge được.
- `Mid` **Daily meeting của anh nói gì?**
  → Ba ý trong dưới một phút: hôm qua xong gì, hôm nay làm gì, đang vướng gì cần ai giúp. Vướng thì nói ngay ở daily rồi bàn chi tiết sau, không biến daily thành buổi giải quyết vấn đề của cả đội.
- `Mid` **Retro sprint, anh thường góp ý gì?**
  → Một điều đã làm tốt nên giữ, một điều cụ thể nên đổi kèm đề xuất, ví dụ "build cho QA hay trễ vì làm tay — đề xuất thêm job tự động". Góp ý về quy trình, không về người. Retro không có hành động cụ thể thì lần sau lặp lại y nguyên.
- `Senior` **Anh đưa test hiệu năng vào quy trình thế nào?**
  → Chọn vài kịch bản chuẩn (màn đông nhất, gacha, chuyển scene), đo frame time và alloc bằng Performance Testing package hoặc profiler tự động trên máy tham chiếu, đặt ngưỡng; vượt ngưỡng thì CI cảnh báo. Mục tiêu là không ai vô tình đưa alloc hay draw call quay lại sau khi đã tối ưu.
- `Senior` **Quy trình release một bản lên store của đội anh gồm những bước nào?**
  → Đóng băng tính năng, cắt nhánh release, QA vòng đầy đủ trên danh sách máy, sửa bug chặn, build bản ứng viên, kiểm phiên bản và số build, nộp review, phát hành dần (staged rollout) và theo dõi crash ngày đầu. Nói kèm đường lùi: dừng rollout, tắt tính năng bằng cờ, hoặc hotfix.
- `Senior` **Theo anh, codebase nhiều nghìn script cần những quy tắc gì để không loạn?**
  → Quy ước thư mục theo tính năng, assembly definition để tách module và tăng tốc biên dịch, quy tắc phụ thuộc một chiều giữa các tầng, linter/analyzer chạy trên CI, và mẫu code cho các loại màn hình lặp lại. Quy tắc được máy kiểm mới sống lâu; quy tắc chỉ nằm trong tài liệu thì mờ dần.
- `Senior` **Assembly Definition giúp gì cho dự án lớn?**
  → Chia code thành nhiều assembly nên sửa một file chỉ biên dịch lại assembly đó, rút ngắn thời gian chờ đáng kể với codebase lớn. Nó còn ép ranh giới phụ thuộc: module A không tham chiếu được B nếu không khai, nên phụ thuộc vòng bị chặn từ lúc biên dịch. Cái giá là phải thiết kế tầng rõ từ đầu.
- `Senior` **Anh đưa người mới vào codebase thế nào?**
  → Tài liệu ngắn về luồng chính và quy ước, một task nhỏ thật trong tuần đầu kèm review kỹ, và một người cụ thể để hỏi. Ghi lại câu hỏi người mới hỏi để bổ sung tài liệu. Đo bằng việc người mới tự làm được task đầu tiên nhanh tới đâu.
- `Senior` **Anh dùng AI trong quy trình làm việc của đội thế nào cho an toàn?**
  → Dùng cho việc lặp lại, viết test, đọc code, viết công cụ; mọi code AI viết đi qua review và CI như code người viết. Tuân thủ chính sách công ty về việc đưa code lên công cụ bên ngoài. Tôi đã dựng quy trình agent có vai kiểm tra riêng, nên hiểu chỗ AI hay sai và cách chặn.

**Khung trả lời 60 giây** — "Quy trình làm việc của đội cũ anh thế nào?"

> Đội client của tôi làm theo sprint hai tuần, Git với nhánh tính năng ngắn, mỗi bản lên store có nhánh release riêng, và hotfix tách từ đúng bản đang chạy rồi merge ngược về nhánh chính.
>
> Mọi thay đổi qua pull request có review; tôi review theo thứ tự đúng yêu cầu, ranh giới, vòng đời tài nguyên, rồi mới tới phong cách. Máy build tự động build theo nhánh và đẩy bản thử cho QA, nên bản build không phụ thuộc máy của ai.
>
> Chỗ đội còn yếu là test tự động — chủ yếu dựa vào QA thủ công. Nếu làm lại, tôi sẽ ưu tiên test cho phần tính tiền, phần thưởng và parse master data trước, vì đó là chỗ sai thì đắt nhất.

**Họ sẽ đào tiếp**

- *"Hai người sửa cùng prefab thì sao?"* → Smart Merge trước; không được thì giữ một bản, người kia làm lại; lâu dài chia prefab nhỏ và quy ước sở hữu.
- *"Anh dựng CI hay chỉ dùng?"* → Nói thật vai của mình, và một job cụ thể mình đã sửa hoặc thêm.
- *"Sao đội không có nhiều test?"* → Logic dính vào MonoBehaviour nên khó test; cách gỡ là tách lớp C# thuần cho phần quan trọng.
- *"Hotfix xong có quên merge ngược không?"* → Có checklist release ghi rõ bước merge ngược, và CI so nhánh để cảnh báo.
- *"Anh xử lý thế nào khi lỡ push key bí mật?"* → Thu hồi key ngay, rồi mới xoá khỏi lịch sử; xoá lịch sử không đủ vì người khác có thể đã kéo về.
- *"Code review mất bao lâu là hợp lý?"* → Trong ngày làm việc; PR để lâu thì nhánh lệch và merge đau.
- *"Staged rollout là gì?"* → Phát hành cho một phần trăm người dùng trước, theo dõi crash rồi mới mở rộng.
- *"Anh có dùng Unity Version Control (Plastic) không?"* → Nói thật; điểm mạnh của nó là xử lý file lớn và khoá file tốt cho đội có nhiều artist.

**Cờ đỏ**

- Không commit file `.meta`, hoặc không biết vì sao phải commit.
- Dùng `push --force` lên nhánh chung như chuyện bình thường.
- "Đội tôi không cần review vì ai cũng giỏi."
- Nói "luôn viết test cho mọi thứ" — nghe như sách, người phỏng vấn biết là không thật.
- Đóng bug với lý do "không tái hiện được" mà chưa hỏi thêm thông tin.
- Hotfix từ nhánh chính đang có tính năng dở.
- Không phân biệt được `revert` và `reset`.

**Số / ví dụ nên thuộc**

- Commit: **Assets · Packages · ProjectSettings · .meta**; bỏ: **Library · Temp · Logs · obj · Build · UserSettings**.
- Serialization: **Force Text**; merge: **UnityYAMLMerge**; file lớn: **Git LFS**.
- Review: **đúng → ranh giới → vòng đời/tài nguyên → hiệu năng → phong cách**.
- Hotfix: **từ nhánh release → sửa nhỏ → test máy thật → nộp → merge ngược**.
- Test: **EditMode** cho logic thuần, **PlayMode** cho luồng nhiều frame.
- Bug report: **bước · mong đợi · thực tế · máy + build · tần suất · log/video**.
- Daily: **xong gì · làm gì · vướng gì**, dưới 1 phút.
