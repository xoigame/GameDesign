---
id: project-kickoff
title: Chốt phạm vi trước khi viết code
summary: Hai tuần đầu quyết định chi phí của cả dự án — bảy câu phải trả lời xong, cách cắt phạm vi cho đúng, và ba thứ luôn bị quên cho tới khi quá muộn.
status: deep
read: 910
level: basic
order: 10
tags: [project, scope, planning, kickoff]
related: [design-pillars, tech-stack, gdd-template, prototyping]
---

Dự án game hỏng hiếm khi vì code tồi. Chúng hỏng vì **tháng thứ năm mới phát hiện ra hai người đang làm hai game khác nhau**, hoặc vì một tính năng ai cũng tưởng là nhỏ hoá ra kéo theo cả hệ thống tài khoản.

Chặng này không sinh ra dòng code nào. Nó sinh ra **một tài liệu và bảy câu trả lời** — và đó là thứ rẻ nhất bạn từng mua.

## Bảy câu phải trả lời xong tuần đầu

Viết thành văn bản, không để trong đầu. Câu nào chưa trả lời được thì ghi rõ *"chưa biết, sẽ chốt trước ngày X"* — điều tối kỵ là để trống rồi mỗi người tự điền một kiểu.

| # | Câu hỏi | Sai thì hỏng cái gì |
|---|---|---|
| 1 | Người chơi làm gì trong 30 giây đầu, và vì sao họ mở lại ngày mai? | Không có câu trả lời thì mọi tính năng đều "có vẻ cần" |
| 2 | Có tiền thật đi qua hệ thống không? | Có IAP là toàn bộ chương transaction, đối soát, hoàn tiền bật lên |
| 3 | Có người chơi thấy nhau không, và thấy **cùng lúc** hay lệch giờ? | Realtime hay async là hai kiến trúc khác nhau hoàn toàn |
| 4 | Nền tảng đích là gì? | WebGL gạch UDP và gRPC; iOS thêm quy trình duyệt store vào mọi mốc |
| 5 | Bao nhiêu người chơi ở tháng thứ nhất — con số, không phải "hy vọng nhiều"? | Quy mô quyết định hạ tầng; xem [[go-deploy-ops]] |
| 6 | Đội mấy người, ai phụ trách phía nào? | Một người ôm cả hai phía thì quy trình khác hẳn hai người hai phía |
| 7 | Ngày nào phải có bản chơi được cho người ngoài đội? | Không có ngày là không có áp lực cắt phạm vi |

Câu 3 là câu hay bị trả lời sai nhất. "Có leaderboard" **không** phải multiplayer — đó là async, một request mỗi phút. "Hai người đánh nhau cùng lúc" mới là realtime, và nó đắt gấp nhiều lần.

## Cắt phạm vi: cắt theo chiều nào

Ai cũng biết phải cắt. Chỗ sai là **cắt theo chiều ngang** — làm 100% của ba hệ thống rồi hết thời gian, còn lại 12 hệ thống chưa động tới, và không có gì chơi được từ đầu tới cuối.

Cắt đúng là **cắt theo chiều dọc**: chọn một lát mỏng xuyên qua toàn bộ hệ thống và làm nó chạy thật.

<figure class="fig">
<svg viewBox="0 0 660 260" role="img" aria-label="So sánh cắt ngang và cắt dọc phạm vi dự án: cắt ngang hoàn thiện vài hệ thống nhưng không chơi được, cắt dọc mỏng nhưng thông suốt từ client qua server tới database">
  <g class="fig-box-g">
    <rect x="20"  y="40"  width="270" height="180" rx="9" class="fig-box"/>
    <rect x="370" y="40"  width="270" height="180" rx="9" class="fig-box"/>
  </g>
  <text x="155" y="28" text-anchor="middle" class="fig-label" font-size="13">Cắt ngang — sai</text>
  <text x="505" y="28" text-anchor="middle" class="fig-label" font-size="13">Cắt dọc — đúng</text>
  <g fill="#6ea8fe" opacity="0.55">
    <rect x="36"  y="60"  width="238" height="26" rx="4"/>
    <rect x="36"  y="94"  width="238" height="26" rx="4"/>
  </g>
  <g fill="none" stroke="#6ea8fe" stroke-width="1.5" opacity="0.5">
    <rect x="36"  y="128" width="238" height="26" rx="4"/>
    <rect x="36"  y="162" width="238" height="26" rx="4"/>
  </g>
  <text x="155" y="78"  text-anchor="middle" class="fig-label" font-size="11">Chiến đấu — xong 100%</text>
  <text x="155" y="112" text-anchor="middle" class="fig-label" font-size="11">Inventory — xong 100%</text>
  <text x="155" y="146" text-anchor="middle" class="fig-muted" font-size="11">Tài khoản — chưa động</text>
  <text x="155" y="180" text-anchor="middle" class="fig-muted" font-size="11">Lưu tiến trình — chưa động</text>
  <text x="155" y="208" text-anchor="middle" class="fig-muted" font-size="10">Không chơi thử được. Không biết mình sai ở đâu.</text>
  <g fill="#6ea8fe" opacity="0.55">
    <rect x="386" y="60"  width="70" height="128" rx="4"/>
  </g>
  <g fill="none" stroke="#6ea8fe" stroke-width="1.5" opacity="0.5">
    <rect x="466" y="60"  width="70" height="128" rx="4"/>
    <rect x="546" y="60"  width="78" height="128" rx="4"/>
  </g>
  <text x="421" y="80"  text-anchor="middle" class="fig-label" font-size="10">1 màn</text>
  <text x="421" y="98"  text-anchor="middle" class="fig-label" font-size="10">1 kẻ địch</text>
  <text x="421" y="116" text-anchor="middle" class="fig-label" font-size="10">1 phần thưởng</text>
  <text x="421" y="134" text-anchor="middle" class="fig-label" font-size="10">login thật</text>
  <text x="421" y="152" text-anchor="middle" class="fig-label" font-size="10">ghi DB thật</text>
  <text x="501" y="126" text-anchor="middle" class="fig-muted" font-size="10">màn 2..N</text>
  <text x="585" y="126" text-anchor="middle" class="fig-muted" font-size="10">tính năng sau</text>
  <text x="505" y="208" text-anchor="middle" class="fig-muted" font-size="10">Chơi được thật. Mọi rủi ro kỹ thuật lộ ra ngay tuần 6.</text>
</svg>
<figcaption>Cắt dọc để lộ rủi ro sớm. Lát đầu tiên phải chạm vào mọi tầng — kể cả tầng bạn ngại nhất, thường là tầng server.</figcaption>
</figure>

Lát dọc đầu tiên nên chứa đúng **một** thứ khó nhất. Nếu phần đáng sợ nhất là đồng bộ realtime, lát đầu phải có nó; đừng để dành tới tháng thứ tư.

## Ba thứ luôn bị quên

Ba khoản này không nằm trong bản GDD nào, không ai ước lượng, và cộng lại thường chiếm **20–30% thời gian dự án**:

1. **Tài khoản và đăng nhập.** Nghe như việc một ngày. Thực tế: đăng nhập khách, nâng cấp lên tài khoản thật, chuyển thiết bị, mất thiết bị, hai người dùng chung máy, xoá tài khoản theo yêu cầu của store. Xem [[master-data]] phần Master User.
2. **Cập nhật khi đã lên store.** Người chơi **không** cập nhật app. Bạn phải sống chung với ba phiên bản client cùng lúc, vĩnh viễn. Quyết định về version ở [[project-contract]] sinh ra từ đây.
3. **Công cụ cho người không phải lập trình viên.** Designer cần sửa bảng cân bằng mà không cần build lại. Không có đường đi từ Google Sheet tới server thì mọi thay đổi số đều biến thành một task của bạn — xem [[master-data]].

## Chốt stack: ba câu là đủ

Đừng mở cuộc họp bốn tiếng về engine. Ba câu quyết định gần hết:

- **Phát hành ở đâu?** Link mở trong trình duyệt hoặc mini game thì nghiêng Cocos; store và 3D thì Unity. Chi tiết ở [[tech-stack]] và [[cocos-creator]].
- **Đội đã biết gì?** Học engine mới giữa dự án có lịch là cách chắc chắn để trượt hạn.
- **Server có cần mô phỏng gameplay không?** Không thì Go là lựa chọn rẻ về vận hành. Có thì cân nhắc Unity headless chạy chính code gameplay — xem [[backend-go]] phần cái giá của việc không chia sẻ code.

Viết quyết định **kèm lý do và ngày** vào mục Nhật ký quyết định của [[gdd-template]]. Sáu tháng sau sẽ có người hỏi "sao hồi đó không chọn X" — và người đó có thể là chính bạn.

## Ra khỏi chặng này với cái gì

- [ ] GDD điền xong ba mục cứng: Design Pillars, Bất biến, Không thuộc phạm vi ([[design-pillars]])
- [ ] Bảy câu ở trên có câu trả lời bằng văn bản
- [ ] Lát dọc đầu tiên được mô tả bằng một đoạn văn: người chơi làm gì, chạm những tầng nào
- [ ] Ngày demo nội bộ đầu tiên đã có trên lịch
- [ ] Stack chốt, kèm lý do, kèm ngày

## Bẫy thường gặp

- **Prototype thành production.** Bản dựng vội để thử vui hoá thành nền móng vì "đang chạy mà". Quy ước trước: prototype nằm ở project riêng, và nó **sẽ** bị xoá — xem [[prototyping]].
- **Không ai sở hữu phạm vi.** Ai cũng thêm được tính năng thì phạm vi chỉ có một chiều: phình.
- **Chốt engine theo sở thích, chốt server theo bài viết đọc được tối qua.**
- **Bỏ qua câu số 5.** Không có con số người chơi mục tiêu thì mọi tranh luận về hạ tầng đều là tranh luận về niềm tin.

## 🤖 Prompt cho AI

**Dùng AI thế nào ở chặng chốt phạm vi**

AI ở đây là **người phản biện**, không phải người quyết định. Ba cách dùng hiệu quả:

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Soi lỗ hổng | Sau khi viết xong bản GDD nháp | "Đọc GDD này, liệt kê mọi thứ tôi chưa quyết mà sẽ phải quyết trong tháng đầu" |
| Ước lượng ngược | Khi nghi phạm vi quá lớn | "Với đội N người trong M tháng, phạm vi này thừa những gì?" |
| Đóng vai người phỏng vấn | Trước khi trình bày với sếp/nhà đầu tư | "Đặt cho tôi 10 câu hỏi khó nhất về tính khả thi của dự án này" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Số người và số tháng** — không có thì AI luôn kết luận "khả thi".
- **Trình độ đội**: junior hay đã ship game rồi, quyết định ước lượng khác hẳn.
- **Ràng buộc cứng không đổi được**: nền tảng, hạn nộp store, ngân sách hạ tầng mỗi tháng.
- **Đã có sẵn gì**: codebase cũ, SDK đã tích hợp, server đang chạy.

**Mẫu prompt**

```
Đọc bản GDD nháp dưới đây. Đội 3 người (1 client Unity, 1 server Go, 1 art bán thời gian),
4 tháng tới bản soft launch. Android trước, iOS sau. Có IAP. Mục tiêu 2.000 CCU.

Việc: trả về 3 bảng.
1. RỦI RO — thứ tự giảm dần theo "khả năng làm trượt hạn", kèm dấu hiệu nhận biết sớm.
2. CHƯA QUYẾT — quyết định còn bỏ ngỏ sẽ chặn người khác làm việc, kèm hạn chót đề xuất.
3. ĐỀ XUẤT CẮT — tính năng nên bỏ khỏi bản đầu, kèm lý do và cái mất khi bỏ.

Ràng buộc:
- KHÔNG viết lại GDD của tôi, chỉ phản biện.
- KHÔNG nói "tuỳ thuộc vào nhiều yếu tố" — nêu giả định anh đang dùng rồi kết luận.
- Mỗi đề xuất cắt phải nói rõ nó tiết kiệm khoảng bao nhiêu tuần.
```

**Bẫy thường gặp:** AI đồng ý với mọi phạm vi bạn đưa ra — nó không có động cơ nói "cái này quá sức đội anh". Phải ép nó bằng con số người và tháng, và hỏi thẳng *"cái gì phải cắt"* thay vì *"có khả thi không"*. Bẫy thứ hai: nó đề xuất kiến trúc cho quy mô lớn hơn thực tế vài bậc, vì tài liệu nó học được viết bởi công ty lớn.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Trước khi code, anh cần biết những gì về dự án?**
  → Bảy thứ, viết thành văn bản: người chơi làm gì trong 30 giây đầu; có tiền thật đi qua không; người chơi có thấy nhau cùng lúc không; nền tảng đích; số người chơi mục tiêu tháng đầu; đội mấy người ai làm phía nào; và ngày phải có bản chơi được cho người ngoài. Thiếu câu nào thì ghi "chưa biết, chốt trước ngày X" — tệ nhất là để trống rồi mỗi người tự điền một kiểu.
- `Junior` **Vertical slice là gì, và vì sao làm nó trước?**
  → Là một lát mỏng chạy thật xuyên qua mọi tầng: người chơi đăng nhập, chơi một trận, nhận thưởng, và phần thưởng ghi vào database thật. Làm trước vì nó phơi rủi ro tích hợp ra ở tuần thứ sáu thay vì tháng cuối. Khác với demo ở chỗ demo diễn cho người xem bằng dữ liệu dựng sẵn, còn slice thì người lạ cầm máy thật cũng chơi được.
- `Mid` **Dự án còn một nửa thời gian mà còn hai phần ba việc. Anh cắt cái gì?**
  → Cắt theo chiều rộng, không cắt chiều sâu: giữ một chế độ chơi thay vì ba, năm màn thay vì hai mươi, một loại tiền thay vì hai. Ba thứ tôi không cắt là luồng tài khoản, luồng thanh toán, và khả năng đổi số cân bằng mà không build lại — cắt chúng thì tiết kiệm vài tuần nhưng mất khả năng sửa game sau khi phát hành.
- `Mid` **Cắt phạm vi và cắt chất lượng khác nhau thế nào?**
  → Cắt phạm vi là bỏ bớt thứ game làm được: ít chế độ hơn, ít màn hơn. Cắt chất lượng là bỏ test, bỏ xử lý lỗi, bỏ trạng thái chờ trên UI — nó không tiết kiệm thời gian mà chỉ dời chi phí sang tháng sau với lãi suất. Người phỏng vấn hỏi câu này để xem bạn có gọi cái thứ hai bằng tên của cái thứ nhất không.
- `Senior` **Anh ước lượng thời gian kiểu gì?**
  → Chia tới mức không task nào quá ba ngày; cái nào không chia nhỏ được nghĩa là chưa hiểu, và đó mới là rủi ro thật chứ không phải độ dài. Phần chưa từng làm bao giờ thì nhân hệ số. Và tôi đưa ra một khoảng kèm giả định, không đưa một con số chính xác — con số chính xác luôn sai và nó làm mất chỗ để nói về rủi ro.
- `Senior` **Tính năng nào nghe nhỏ nhưng thực ra đắt?**
  → Ba cái, cộng lại chiếm cỡ 20–30% dự án mà không bao giờ nằm trong ước lượng ban đầu: hệ thống tài khoản với đủ nhánh chuyển thiết bị và mất thiết bị; sống chung với ba phiên bản client trên store vì người chơi không cập nhật; và công cụ để designer sửa bảng số mà không cần build lại.

**Khung trả lời 60 giây** — "Còn một nửa thời gian mà còn hai phần ba việc, cắt gì?"

> Tôi không cắt theo tính năng trước, tôi **cắt theo chiều**. Nguyên tắc là giữ một lát dọc chơi được từ đầu tới cuối, rồi bỏ bề rộng: giữ một chế độ chơi thay vì ba, năm màn thay vì hai mươi, một loại tiền thay vì hai.
>
> Thứ tôi **không** cắt là ba thứ: luồng tài khoản, luồng thanh toán, và khả năng cập nhật số liệu cân bằng mà không build lại. Cắt ba cái đó thì tiết kiệm được vài tuần nhưng mất khả năng sửa game sau khi phát hành.
>
> Thực tế ở dự án gần nhất, chúng tôi bỏ chế độ chơi thứ hai và toàn bộ hệ thống bang hội — khoảng sáu tuần — để giữ ngày soft launch. Cái mất là chỉ số giữ chân ngày 7 thấp hơn dự kiến, và đó là đánh đổi có ý thức, ghi vào nhật ký quyết định.

**Họ sẽ đào tiếp**

- *"Vì sao cắt dọc chứ không cắt ngang?"* → Vì cắt ngang cho bạn ba hệ thống hoàn hảo không ghép được với nhau, và rủi ro tích hợp lộ ra ở tháng cuối — đúng lúc không còn thời gian. Cắt dọc ép mọi tầng chạm nhau từ tuần sáu.
- *"Tính năng nào nghe nhỏ mà đắt?"* → Tài khoản và chuyển thiết bị; cập nhật khi đã có ba phiên bản client trên store; và công cụ cho designer sửa số. Ba cái này chiếm cỡ một phần tư dự án mà không bao giờ nằm trong ước lượng ban đầu.
- *"Anh ước lượng thế nào?"* → Chia tới mức không task nào quá ba ngày; cái nào không chia được nghĩa là chưa hiểu, và đó mới là rủi ro thật. Nhân hệ số cho phần chưa từng làm bao giờ. Và nói rõ ước lượng là khoảng, không phải một con số.
- *"Prototype có được dùng lại không?"* → Không, và phải nói trước điều đó. Prototype tối ưu cho tốc độ trả lời câu hỏi thiết kế; production tối ưu cho sáu tháng bảo trì. Trộn hai thứ là cách sinh ra codebase không ai dám động vào.

**Cờ đỏ**

- "Chúng tôi làm hết rồi ghép sau."
- Ước lượng bằng một con số chính xác ("6 tuần") thay vì một khoảng có giả định.
- Không phân biệt được cắt phạm vi và cắt chất lượng — bỏ test, bỏ xử lý lỗi rồi gọi đó là cắt phạm vi.
- Nói rằng ở dự án cũ "không có gì để cắt vì mọi thứ đều cần thiết".

**Số / ví dụ nên thuộc**

- Tài khoản, cập nhật client, công cụ cho designer: cỡ **20–30%** thời gian dự án, luôn bị quên.
- Task nào ước lượng quá **3 ngày** thì chưa chia đủ nhỏ.
- Lát dọc đầu tiên nên chạm **mọi tầng** và chứa đúng **một** rủi ro lớn nhất.

**Kể trong dự án**

- *"Anh tham gia từ giai đoạn nào?"* → Nếu bạn vào giữa dự án, nói thẳng, rồi kể **cái bạn phải sửa vì quyết định của người trước**. Đó là câu chuyện mạnh hơn giả vờ mình chốt kiến trúc từ đầu.
- *"Có lần nào anh cắt sai không?"* → Nên có một ví dụ thật. Mẫu tốt: cắt công cụ cho designer để kịp hạn, sau đó mỗi lần đổi số cân bằng đều tốn một lần build và một ngày chờ duyệt — cái giá lộ ra sau khi phát hành, không phải lúc cắt.
- *"Ai quyết định phạm vi ở dự án đó?"* → Trả lời trung thực về quyền hạn của mình. "Tôi không quyết, nhưng tôi là người đưa ra bảng chi phí để người quyết nhìn vào" là câu trả lời tốt và thật.
