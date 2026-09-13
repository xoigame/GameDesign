---
title: Machine Learning & RL
icon: 🧬
summary: Học tăng cường và ML-Agents trong game — khi nào đáng dùng, và vì sao thường thì không.
status: deep
read: 520
level: advanced
order: 100
tags: [ai, ml, advanced, experimental]
related: [utility-ai, behavior-tree, balancing-math]
---

Reinforcement learning cho ra những kết quả ấn tượng (AlphaStar, OpenAI Five), nhưng tỉ lệ dùng trong game thương mại vẫn rất thấp. Có lý do chính đáng cho điều đó.

Lý do không phải là RL yếu. Nó thường **quá mạnh cho sai việc**: bạn bỏ ra hàng tuần để có một agent chơi giỏi hơn mọi người chơi, trong khi thứ cần làm là một kẻ địch biết thua một cách thú vị.

## Ba vấn đề khiến RL hiếm khi phù hợp

1. **Không kiểm soát được.** Nhà thiết kế muốn NPC làm X trong tình huống Y. Với RL, bạn chỉ có thể sửa hàm thưởng rồi huấn luyện lại và hy vọng. So với việc sửa một dòng trong [[behavior-tree]], đây là bước lùi khổng lồ về năng suất.

2. **Không gỡ lỗi được.** NPC làm điều kỳ quặc. Vì sao? Không ai biết. Không có trạng thái để in ra, không có nhánh để theo dõi.

3. **Quá giỏi.** Agent huấn luyện tốt thường vượt xa người chơi, và như đã nói ở [[game-ai]], mục tiêu không phải là mạnh mà là *thú vị*. Phải cố tình làm nó yếu đi — và lúc đó bạn đã quay lại việc điều chỉnh thủ công.

Đặt cạnh các kỹ thuật khác thì vị trí của RL rõ ngay:

<figure class="fig">
<svg viewBox="0 0 660 262" role="img" aria-label="Biểu đồ so sánh các kỹ thuật AI theo mức kiểm soát của nhà thiết kế và chi phí để thử một thay đổi">
  <line x1="112" y1="26" x2="112" y2="206" class="fig-line"/>
  <line x1="112" y1="206" x2="632" y2="206" class="fig-line"/>
  <text x="16" y="34" class="fig-muted" font-size="10">chi phí thử</text>
  <text x="16" y="48" class="fig-muted" font-size="10">một thay đổi</text>
  <text x="16" y="62" class="fig-muted" font-size="10">— hàng giờ</text>
  <text x="16" y="196" class="fig-muted" font-size="10">— vài giây</text>
  <text x="372" y="240" text-anchor="middle" class="fig-muted" font-size="11">nhà thiết kế kiểm soát được hành vi tới đâu →</text>
  <text x="140" y="228" class="fig-muted" font-size="10">không</text>
  <text x="600" y="228" class="fig-muted" font-size="10">hoàn toàn</text>
  <circle cx="168" cy="56" r="10" fill="#ff8787"/>
  <text x="188" y="52" class="fig-label" font-size="12">RL end-to-end</text>
  <text x="188" y="68" class="fig-muted" font-size="10">sửa hàm thưởng → huấn luyện lại → chờ</text>
  <circle cx="266" cy="132" r="9" fill="#ffd43b"/>
  <text x="286" y="128" class="fig-label" font-size="11">Imitation learning</text>
  <text x="286" y="143" class="fig-muted" font-size="10">bắt chước dữ liệu người chơi</text>
  <circle cx="420" cy="168" r="9" fill="#6ea8fe"/>
  <text x="440" y="164" class="fig-label" font-size="11">GOAP · Utility AI</text>
  <text x="440" y="179" class="fig-muted" font-size="10">chỉnh trọng số, thấy kết quả ngay</text>
  <circle cx="556" cy="192" r="9" fill="#51cf9b"/>
  <text x="546" y="180" text-anchor="end" class="fig-label" font-size="11">FSM · Behavior Tree</text>
  <rect x="128" y="30" width="120" height="52" rx="6" stroke="#ff8787" stroke-width="1" stroke-dasharray="4 3" fill="none"/>
  <text x="372" y="96" text-anchor="middle" class="fig-muted" font-size="10">vùng đỏ không phải "kỹ thuật kém" — nó là vùng bạn trả bằng thời gian lặp</text>
  <text x="372" y="112" text-anchor="middle" class="fig-muted" font-size="10">chỉ đáng khi hành vi cần có KHÔNG viết ra được thành luật</text>
</svg>
<figcaption>Làm game là công việc lặp đi lặp lại. Kỹ thuật nào làm vòng lặp "sửa — xem — sửa" dài ra hàng giờ đều phải trả một cái giá rất lớn để bù lại.</figcaption>
</figure>

## Hàm thưởng và reward hacking

Nếu vẫn quyết định dùng RL, đây là chỗ tốn thời gian nhất — và nó không phải chuyện kỹ thuật mà chuyện **diễn đạt ý định**.

Agent tối ưu đúng thứ bạn viết, không phải thứ bạn muốn. Ví dụ nổi tiếng nhất là agent đua thuyền của OpenAI: được thưởng theo điểm số, nó phát hiện ra rằng quay vòng liên tục ở một khu vực để nhặt lại các vật thưởng hồi sinh cho nhiều điểm hơn là về đích — nên nó không bao giờ hoàn thành cuộc đua. Không có lỗi nào trong code; hàm thưởng nói đúng như vậy.

Bốn nguyên tắc giảm rủi ro:

- **Thưởng cho kết quả, không thưởng cho hành vi trung gian.** Thưởng "tới gần kẻ địch" sẽ cho ra agent xoay quanh kẻ địch mãi. Thưởng "hạ được kẻ địch" thì khó học hơn nhưng đúng ý.
- **Phạt thời gian.** Một hình phạt nhỏ mỗi bước loại bỏ phần lớn hành vi kéo dài vô nghĩa.
- **Chuẩn hoá về khoảng nhỏ.** Giữ thưởng trong khoảng chừng −1 đến 1; giá trị lệch bậc lớn làm huấn luyện mất ổn định.
- **Xem agent chơi, đừng chỉ nhìn đường cong thưởng.** Đường cong đi lên đều đặn hoàn toàn tương thích với việc agent tìm ra một mẹo phá game.

## Quy trình ML-Agents: thời gian và chi phí thật

Thứ tự thực tế khi dùng Unity ML-Agents:

1. Định nghĩa **observation** (agent thấy gì) và **action** (làm được gì).
2. Viết hàm thưởng.
3. Huấn luyện bằng PPO — hàng triệu bước mô phỏng.
4. Nhìn kết quả, phát hiện hàm thưởng sai, **quay lại bước 2**.

Bước 4 là bước không ai nói tới trong tutorial, và nó là bước chiếm phần lớn thời gian.

| Hạng mục | Con số thực tế |
|---|---|
| Vòng huấn luyện một hành vi đơn giản | vài giờ tới vài ngày |
| Số bước mô phỏng cần | hàng triệu, thường hàng chục triệu |
| Thời gian từ khi sửa hàm thưởng tới khi thấy kết quả | **hàng giờ** |
| Cùng việc đó với behavior tree | **vài giây** |

Hai mẹo cắt thời gian nếu bạn vẫn đi đường này: chạy nhiều bản sao môi trường song song trong một build (ML-Agents hỗ trợ sẵn, và đây là cách tăng tốc lớn nhất), và tắt toàn bộ đồ hoạ khi huấn luyện.

Nhưng điều quan trọng hơn mọi mẹo: **so sánh tổng thời gian với phương án viết luật.** Nếu hành vi bạn muốn viết ra được thành luật, gần như chắc chắn viết luật rẻ hơn.

## Self-play và imitation learning

Hai biến thể dễ áp dụng hơn RL thuần:

**Self-play** — agent đấu với chính bản sao trước của nó, độ khó tự leo thang. Đây là cách tạo bot đối kháng mạnh cho game PvP, và nó tránh được việc phải tự thiết kế đối thủ luyện tập. Vấn đề cố hữu: nó hội tụ về lối chơi tối ưu, không về lối chơi *giống người*. Bot self-play thường khai thác những thứ người chơi không bao giờ nghĩ tới, và chơi với nó không vui.

**Imitation learning** — huấn luyện từ bản ghi người chơi thật thay vì từ phần thưởng. Đây là biến thể hợp với game nhất, vì mục tiêu của nó đúng với thứ ta cần: **giống người**, không phải mạnh nhất.

Ứng dụng đáng giá nhất của imitation learning không phải làm kẻ địch mà là **làm bot thay thế người chơi rớt mạng** trong game nhiều người, hoặc **ghost đua xe** bắt chước phong cách của chính người chơi. Cả hai đều là chỗ "giống người" quan trọng hơn "chơi giỏi".

Chi phí thật của nó là dữ liệu: cần nhiều giờ bản ghi, và bản ghi phải khớp với phiên bản game hiện tại. Mỗi lần cân bằng lại là một lần dữ liệu cũ mất giá.

## Chỗ RL thật sự có giá trị — kiểm thử tự động

**Thả agent RL vào game để:**
- Tìm lỗi vượt địa hình, kẹt hình học
- Phát hiện chiến thuật phá game mà playtester chưa nghĩ ra
- Đo xem một màn chơi có hoàn thành được không

Đây là ứng dụng ít hào nhoáng nhưng có ROI cao nhất, và nó bổ sung tốt cho mô phỏng Monte Carlo ở [[balancing-math]].

Lý do nó hợp: **cả ba vấn đề ở đầu bài đều biến mất.** Bạn không cần kiểm soát hành vi — bạn muốn nó làm điều bất ngờ. Bạn không cần gỡ lỗi agent — bạn chỉ cần nó báo cáo chỗ nó kẹt hoặc chỗ nó đạt điểm bất thường. Và "quá giỏi" trở thành ưu điểm: một agent tìm ra cách đạt điểm gấp mười lần dự kiến vừa tìm hộ bạn một lỗ hổng cân bằng.

Bộ khởi điểm thực dụng, không cần RL tinh vi:

| Mục tiêu kiểm thử | Thưởng agent theo |
|---|---|
| Tìm lỗi hình học | diện tích bản đồ đi tới được, ưu tiên chỗ lạ |
| Tìm khai thác cân bằng | điểm số / tài nguyên mỗi phút |
| Kiểm tra màn hoàn thành được | thời gian tới đích, phạt theo thời gian |
| Tìm crash | phủ nhiều tổ hợp hành động nhất có thể |

Một agent đi lang thang có thưởng theo độ phủ bản đồ đã tìm ra nhiều lỗi kẹt hơn phần lớn đợt QA thủ công — và nó chạy suốt đêm mà không mệt.

## Kiểm tra nhanh

- Hành vi bạn muốn có **viết ra được thành luật** không? Nếu có, đừng dùng RL.
- Vòng lặp "sửa — xem kết quả" của bạn dài bao lâu? Trên một giờ thì công việc thiết kế gần như dừng lại.
- Hàm thưởng của bạn thưởng cho **kết quả** hay cho **hành vi trung gian**?
- Đã ngồi xem agent chơi chưa, hay chỉ nhìn đường cong thưởng đi lên?
- Nếu cần "giống người": đã cân nhắc imitation learning thay vì RL chưa?
- Đã thử dùng RL cho **kiểm thử** trước khi dùng nó cho gameplay chưa?
- Nếu agent mạnh hơn người chơi: kế hoạch làm nó yếu đi là gì, và kế hoạch đó có rẻ hơn viết luật từ đầu không?

## 🤖 Prompt cho AI

Trước khi nhờ AI dựng RL, hãy nhờ nó **can ngăn bạn**. Phần lớn trường hợp, câu trả lời đúng là đừng dùng.

**Dùng AI thế nào cho chủ đề RL**

Có một cái bẫy đặc thù ở đây: đây là chủ đề mà **AI rất sẵn lòng giúp bạn làm sai việc**. Hỏi "viết ML-Agents cho kẻ địch của tôi" thì bạn sẽ nhận được code chạy được, tutorial mạch lạc, và không một câu hỏi nào về việc liệu bạn có nên làm thế không. Tài liệu huấn luyện của nó đầy bài hướng dẫn RL, và bài hướng dẫn thì không bao giờ bắt đầu bằng "đừng làm điều này".

Vì vậy hãy **ép nó vào vai phản biện trước**, và chỉ chuyển sang vai thực thi sau khi bản thân bạn đã trả lời được câu "vì sao luật không đủ".

| Bước | Vai | Câu mở đầu |
|---|---|---|
| 1 | Người can ngăn | "Trình bày phương án KHÔNG dùng ML cho yêu cầu này, và ước tính thời gian hai bên" |
| 2 | Người soi hàm thưởng | "Đây là hàm thưởng. Liệt kê cách agent có thể đạt điểm cao mà KHÔNG làm điều tôi muốn" |
| 3 | Người dựng | "Viết observation, action, reward cho ML-Agents theo đặc tả đã chốt" |
| 4 | Người dựng bộ kiểm thử | "Viết agent lang thang thưởng theo độ phủ bản đồ, xuất báo cáo chỗ kẹt" |

Bước 2 là bước đáng tiền nhất và hay bị bỏ qua nhất. Liệt kê cách phá một hàm thưởng là việc AI làm rất tốt, và làm rẻ hơn nhiều so với phát hiện ra sau sáu giờ huấn luyện.

**Phải nêu rõ:**
- Hành vi mong muốn, và **vì sao viết luật không đủ**
- Mục tiêu: giống người hay mạnh nhất (quyết định RL hay imitation learning)
- Ngân sách thời gian huấn luyện và vòng lặp chấp nhận được
- Observation và action space cụ thể, không để AI tự chọn
- Dùng cho gameplay hay cho kiểm thử

**Mẫu prompt phản biện (chạy cái này trước)**

```
Tôi định dùng RL cho: <hành vi cụ thể>.

Đừng viết code. Làm 3 việc:
1. Trình bày phương án làm điều này bằng behavior tree hoặc utility AI.
   Ước tính thời gian. Nói rõ nó THIẾU gì so với RL.
2. Ước tính thời gian cho phương án RL, tính CẢ số vòng sửa hàm thưởng
   (giả định tôi sẽ sai hàm thưởng ít nhất 3 lần).
3. Kết luận thẳng: nên dùng cái nào cho trường hợp NÀY.

Nếu kết luận là RL, hãy liệt kê 5 cách agent có thể "ăn gian" hàm thưởng
mà tôi chưa nghĩ tới.
```

**Bẫy thường gặp:** AI dựng xong pipeline ML-Agents chạy được và bạn tưởng mình đã xong 80% — thực tế phần khó chưa bắt đầu, vì nó nằm ở vài chục vòng sửa hàm thưởng phía sau. Bẫy thứ hai: AI đề xuất hàm thưởng dày đặc phần thưởng trung gian ("thưởng khi tới gần mục tiêu") vì nó giúp agent học nhanh hơn — và đó chính là công thức sinh ra reward hacking.

## 🎮 Unity

Trong Unity, RL nghĩa là package **ML-Agents**. Trước khi cài, đọc phần "Mẫu prompt phản biện" ở tab Prompt — phần lớn trường hợp câu trả lời đúng là không dùng.

**Chi phí thực tế cần biết trước**

| Thứ | Thực tế |
|---|---|
| Cài đặt | Package Unity + môi trường Python riêng, phiên bản phải khớp |
| Huấn luyện | Hàng giờ tới hàng ngày cho hành vi đơn giản |
| Lặp lại | Đổi reward → huấn luyện lại từ đầu |
| Gỡ lỗi | Gần như không có công cụ; chỉ có đồ thị reward |
| Ship | Model `.onnx` chạy qua Sentis/Barracuda, tốn thêm bộ nhớ |

So với sửa một dòng trong [[behavior-tree]] rồi bấm Play, đây là bước lùi lớn về năng suất.

**Nơi RL thật sự đáng dùng trong Unity: kiểm thử tự động**

```csharp
// Agent không để chơi cùng người chơi — để TÌM LỖI
public class BugHunterAgent : Agent {
    public override void CollectObservations(VectorSensor sensor) {
        sensor.AddObservation(transform.localPosition);
        sensor.AddObservation(rb.linearVelocity);
    }

    void FixedUpdate() {
        // Thưởng cho việc tới được chỗ BẤT THƯỜNG
        if (!Physics.CheckSphere(transform.position, 0.1f, groundMask)
            && transform.position.y < -5f) {
            Debug.LogError($"Lọt địa hình tại {transform.position}");
            AddReward(1f);                       // khuyến khích tìm thêm chỗ tương tự
            LogRepro();
            EndEpisode();
        }
        if (stuckTimer > 30f) { Debug.LogWarning($"Kẹt tại {transform.position}"); EndEpisode(); }
    }
}
```

Chạy 500 episode qua đêm, sáng ra có danh sách toạ độ lọt địa hình kèm seed tái hiện. Đây là ứng dụng ít hào nhoáng nhưng có ROI cao nhất.

**Bẫy Unity cụ thể**
- **Phiên bản không khớp** giữa package ML-Agents, Python package và PyTorch — nguồn lãng phí thời gian số một. Ghim phiên bản chính xác, đừng dùng `latest`.
- **`Time.timeScale` cao để huấn luyện nhanh** làm vật lý sai lệch. Dùng `--time-scale` của trainer, không tự đặt `timeScale`.
- **Reward hacking**: thưởng cho "gần người chơi" → agent học cách đứng dính vào người chơi mà không tấn công.

**Kiểm tra nhanh**
- Chạy được `mlagents-learn --help` trong môi trường Python của dự án?
- Agent huấn luyện xong có **thua được** không? Nếu không, bạn phải làm nó yếu đi — và lúc đó nên xem lại có cần RL thật không.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Reinforcement learning trong game khác AI truyền thống ở chỗ nào?**
  → AI truyền thống (FSM, behavior tree, utility) là **luật do người viết**: mình quyết định trong tình huống nào làm gì. RL là **chính sách do máy học** từ hàng triệu lần thử và một hàm thưởng. Đổi lại sự linh hoạt, mình mất khả năng nói "trong tình huống Y hãy làm X" bằng một dòng code.
- `Junior` **Reward hacking là gì? Cho một ví dụ.**
  → Agent tối ưu đúng thứ mình **viết**, không phải thứ mình **muốn**. Ví dụ kinh điển là agent đua thuyền của OpenAI: thưởng theo điểm, nó phát hiện quay vòng nhặt lại vật thưởng hồi sinh cho nhiều điểm hơn là về đích, nên không bao giờ hoàn thành cuộc đua. Không có bug nào trong code — hàm thưởng nói đúng như vậy.
- `Mid` **Vì sao RL hiếm được dùng trong game thương mại?**
  → Ba lý do, và cả ba đều là vấn đề sản xuất chứ không phải vấn đề kỹ thuật. **Không kiểm soát được** — muốn NPC làm X trong tình huống Y thì chỉ có cách sửa hàm thưởng, huấn luyện lại và hy vọng. **Không gỡ lỗi được** — không có trạng thái nào để in ra. Và thường **quá giỏi**, trong khi AI game cần thú vị chứ không cần mạnh.
- `Mid` **Tránh reward hacking bằng cách nào?**
  → Thưởng cho **kết quả**, không thưởng cho hành vi trung gian — thưởng "tới gần kẻ địch" cho ra agent xoay quanh kẻ địch mãi mãi. Thêm phạt thời gian nhỏ mỗi bước để loại hành vi kéo dài vô nghĩa. Chuẩn hoá thưởng về khoảng −1…1. Và quan trọng nhất: **ngồi xem agent chơi**.
- `Mid` **Cái giá thật của RL trong sản xuất nằm ở đâu?**
  → Ở độ dài vòng lặp. Sửa một dòng behavior tree mất vài giây; sửa hàm thưởng rồi chờ kết quả mất hàng giờ, và huấn luyện cần hàng triệu tới hàng chục triệu bước mô phỏng. Làm game là công việc lặp đi lặp lại, nên kỹ thuật nào kéo dài vòng lặp đó phải bù lại rất nhiều mới đáng.
- `Senior` **Sếp muốn dùng ML-Agents cho kẻ địch. Anh phản hồi thế nào?**
  → Hỏi một câu trước: **hành vi mình muốn có viết ra được thành luật không?** Có thì behavior tree hoặc utility AI gần như luôn rẻ hơn. Rồi tôi đề xuất hướng khác thay vì nói không: dùng RL cho **kiểm thử tự động**. Ở đó cả ba vấn đề của RL biến mất và ROI cao nhất.
- `Senior` **Khi nào RL thật sự đáng dùng trong một dự án game?**
  → Kiểm thử tự động: thả agent vào để tìm lỗi vượt địa hình, phát hiện chiến thuật phá game mà playtester chưa nghĩ ra, kiểm tra màn có hoàn thành được không. Ở đó tôi **muốn** nó làm điều bất ngờ, không cần gỡ lỗi nó, và "quá giỏi" thành ưu điểm — agent đạt điểm gấp mười lần dự kiến vừa tìm hộ mình một lỗ hổng cân bằng.
- `Senior` **Self-play hay imitation learning cho bot đối kháng?**
  → Tuỳ mục tiêu là **mạnh** hay **giống người**. Self-play hội tụ về lối chơi tối ưu chứ không về lối chơi giống người — bot của nó khai thác thứ người chơi không nghĩ tới và chơi với nó không vui. Imitation learning hợp game hơn; ứng dụng đáng giá nhất là bot thay người rớt mạng, hoặc ghost đua xe bắt chước chính người chơi. Cái giá là dữ liệu: nhiều giờ bản ghi, và bản ghi mất giá mỗi lần cân bằng lại.
- `Senior` **Đường cong thưởng đi lên đều. Đủ để kết luận agent học tốt chưa?**
  → Chưa. Đường cong đi lên đều hoàn toàn tương thích với việc agent vừa tìm ra một mẹo phá game — nó đang thu thưởng rất hiệu quả theo đúng hàm mình viết. Bằng chứng duy nhất đáng tin là **xem nó chơi**, cộng với vài chỉ số hành vi: độ phủ bản đồ, thời gian tới đích, tỉ lệ hành động khác nhau.

**Khung trả lời 60 giây** — "Sếp muốn ML-Agents cho kẻ địch, anh nói gì?"

> Tôi hỏi một câu trước: **hành vi mình muốn có viết ra được thành luật không?** Nếu có thì behavior tree hoặc utility AI gần như luôn rẻ hơn, vì ba lý do. Không kiểm soát được — muốn NPC làm X trong tình huống Y thì với RL chỉ có cách sửa hàm thưởng, huấn luyện lại và hy vọng. Không gỡ lỗi được — NPC làm điều kỳ quặc thì không có trạng thái nào để in ra. Và thường là **quá giỏi** — agent huấn luyện tốt vượt xa người chơi, mà mục tiêu của AI trong game là thú vị chứ không phải mạnh, nên lại phải làm nó yếu đi bằng tay.
>
> Cái giá thật nằm ở **vòng lặp**. Sửa một dòng behavior tree là vài giây; sửa hàm thưởng rồi chờ kết quả là hàng giờ. Làm game là công việc lặp đi lặp lại, nên kỹ thuật nào kéo dài vòng lặp đó phải bù lại rất nhiều mới đáng.
>
> Rồi tôi đề xuất hướng khác: dùng RL cho **kiểm thử tự động** thay vì cho gameplay. Ở đó cả ba vấn đề biến mất và ROI cao nhất.

**Họ sẽ đào tiếp**

- *"Reward hacking là gì?"* → Agent tối ưu đúng thứ mình viết, không phải thứ mình muốn. Ví dụ kinh điển là agent đua thuyền của OpenAI: được thưởng theo điểm, nó phát hiện quay vòng nhặt lại vật thưởng hồi sinh cho nhiều điểm hơn về đích, nên không bao giờ hoàn thành cuộc đua. Không có lỗi nào trong code — hàm thưởng nói đúng như vậy.
- *"Tránh nó thế nào?"* → Thưởng cho **kết quả**, không thưởng cho hành vi trung gian; thưởng "tới gần kẻ địch" cho ra agent xoay quanh kẻ địch mãi. Thêm phạt thời gian nhỏ mỗi bước để loại hành vi kéo dài vô nghĩa. Chuẩn hoá thưởng về khoảng chừng âm một tới một. Và quan trọng nhất là **ngồi xem agent chơi** — đường cong thưởng đi lên đều hoàn toàn tương thích với việc nó vừa tìm ra một mẹo phá game.
- *"RL đáng dùng ở đâu?"* → Kiểm thử tự động. Thả agent vào để tìm lỗi vượt địa hình, phát hiện chiến thuật phá game playtester chưa nghĩ ra, kiểm tra màn có hoàn thành được không. Ở đó tôi **muốn** nó làm điều bất ngờ, tôi không cần gỡ lỗi nó, và "quá giỏi" thành ưu điểm — agent đạt điểm gấp mười lần dự kiến vừa tìm hộ mình một lỗ hổng cân bằng.
- *"Self-play hay imitation learning?"* → Tuỳ mục tiêu là mạnh hay giống người. Self-play hội tụ về lối chơi **tối ưu**, không về lối chơi giống người — bot của nó khai thác những thứ người chơi không nghĩ tới và chơi với nó không vui. Imitation learning hợp với game hơn vì mục tiêu của nó đúng với cái mình cần. Ứng dụng đáng giá nhất là bot thay người rớt mạng, hoặc ghost đua xe bắt chước chính người chơi.
- *"Chi phí imitation learning?"* → Dữ liệu. Cần nhiều giờ bản ghi, và bản ghi phải khớp phiên bản game hiện tại — mỗi lần cân bằng lại là một lần dữ liệu cũ mất giá.
- *"Dùng AI để giúp làm RL thì sao?"* → Cẩn thận, vì đây là chủ đề AI rất sẵn lòng giúp mình làm sai việc: hỏi "viết ML-Agents cho kẻ địch" thì nhận code chạy được mà không có câu hỏi nào về việc có nên làm thế không. Tôi ép nó vào vai phản biện trước, và giao nó việc đáng tiền nhất là **liệt kê cách phá hàm thưởng** — rẻ hơn nhiều so với phát hiện sau sáu giờ huấn luyện.

**Cờ đỏ**

- Chọn RL vì nó hiện đại, không vì luật không viết được.
- Đánh giá agent bằng đường cong thưởng mà chưa từng xem nó chơi.
- Hàm thưởng dày đặc phần thưởng trung gian để "học nhanh hơn".
- Tưởng pipeline chạy được là đã xong 80% công việc.
- Không tính số vòng sửa hàm thưởng vào ước lượng thời gian.
- Dùng bot self-play làm đối thủ cho người chơi thường rồi ngạc nhiên vì không ai thích.

**Số / ví dụ nên thuộc**

- Ba vấn đề: **không kiểm soát · không gỡ lỗi · quá giỏi**.
- Vòng lặp: sửa behavior tree **vài giây** ↔ sửa hàm thưởng **hàng giờ**.
- Huấn luyện cần **hàng triệu tới hàng chục triệu** bước mô phỏng.
- Thưởng nên chuẩn hoá về khoảng **−1 … 1**.
- Ví dụ reward hacking: agent đua thuyền quay vòng nhặt điểm, **không về đích**.
- Ứng dụng ROI cao nhất: **kiểm thử tự động** — độ phủ bản đồ, điểm mỗi phút, thời gian tới đích.
