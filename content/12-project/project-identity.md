---
id: project-identity
title: Master User và danh tính người chơi
summary: Bảng gốc mà mọi thứ treo vào, bảy nhánh của luồng tài khoản mà ai cũng quên, liên kết khách sang tài khoản thật, chuyển thiết bị, và xoá tài khoản theo yêu cầu của store.
status: deep
read: 935
level: advanced
order: 35
tags: [project, identity, account, auth, master-user]
related: [master-data, game-database, client-server-flow, project-migration]
---

Ở [[project-kickoff]] có một câu: tài khoản là tính năng nghe như việc một ngày và thực tế chiếm một phần đáng kể dự án. Node này là phần chi tiết của câu đó.

Lý do nó đắt không phải kỹ thuật. Đăng nhập thì dễ. Cái đắt là **bảy nhánh còn lại** — và mỗi nhánh đều dẫn tới câu hỏi *"người chơi này có còn là người chơi kia không"*, câu hỏi mà trả lời sai thì mất tiến trình của người thật.

## Master User: bảng gốc

[[master-data]] phân biệt hai loại dữ liệu: master data là bảng cân bằng dùng chung, **Master User** là bảng gốc của người chơi. Mọi thứ khác treo vào nó.

| Thuộc về | Ví dụ | Ghi chú |
|---|---|---|
| **Master User** (một dòng, một người) | `user_id`, ngày tạo, trạng thái, ngôn ngữ, quốc gia | `user_id` là khoá ngoại của **mọi** bảng khác |
| Thông tin đăng nhập (nhiều dòng) | device id, Google, Apple, số điện thoại | Một người có nhiều cách đăng nhập |
| Dữ liệu chơi | ví, inventory, tiến trình | Tra theo `user_id` |
| Phiên | access token, refresh token | Redis, tự hết hạn |

Luật quan trọng nhất, và nó quyết định phần lớn những gì còn lại:

> **`user_id` sinh một lần và không bao giờ đổi.** Thông tin đăng nhập thì thêm, bớt, đổi được — `user_id` thì không.

Nếu đăng nhập bằng Google mà lấy chính Google ID làm khoá chính, thì người chơi đổi email là mất tài khoản, và bạn không thêm được cách đăng nhập thứ hai. Tách hai khái niệm ra từ đầu tốn một bảng; gộp rồi tách sau tốn một đợt migration trên dữ liệu thật.

## Bảy nhánh của luồng tài khoản

<figure class="fig">
<svg viewBox="0 0 680 300" role="img" aria-label="Luồng tài khoản từ mở app lần đầu: tạo tài khoản khách theo device id, chơi, rồi rẽ thành các nhánh liên kết tài khoản thật, chuyển thiết bị, mất thiết bị, hai người dùng chung máy, và xoá tài khoản">
  <defs>
    <marker id="pid-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="14"  y="120" width="132" height="60" rx="9" class="fig-box"/>
    <rect x="186" y="120" width="132" height="60" rx="9" class="fig-box"/>
    <rect x="384" y="14"  width="140" height="46" rx="8" class="fig-box"/>
    <rect x="384" y="72"  width="140" height="46" rx="8" class="fig-box"/>
    <rect x="384" y="130" width="140" height="46" rx="8" class="fig-box"/>
    <rect x="384" y="188" width="140" height="46" rx="8" class="fig-box"/>
    <rect x="384" y="246" width="140" height="46" rx="8" class="fig-box"/>
    <rect x="556" y="130" width="110" height="46" rx="8" class="fig-box"/>
  </g>
  <text x="80"  y="145" text-anchor="middle" class="fig-label" font-size="12">Mở app lần đầu</text>
  <text x="80"  y="164" text-anchor="middle" class="fig-muted" font-size="10">chưa có gì</text>
  <text x="252" y="145" text-anchor="middle" class="fig-label" font-size="12">Tài khoản khách</text>
  <text x="252" y="164" text-anchor="middle" class="fig-muted" font-size="10">user_id sinh ngay</text>
  <text x="454" y="33"  text-anchor="middle" class="fig-label" font-size="11">Liên kết Google/Apple</text>
  <text x="454" y="50"  text-anchor="middle" class="fig-muted" font-size="9">giữ nguyên user_id</text>
  <text x="454" y="91"  text-anchor="middle" class="fig-label" font-size="11">Máy mới, đã liên kết</text>
  <text x="454" y="108" text-anchor="middle" class="fig-muted" font-size="9">đăng nhập là về</text>
  <text x="454" y="149" text-anchor="middle" class="fig-label" font-size="11">Máy mới, chưa liên kết</text>
  <text x="454" y="166" text-anchor="middle" class="fig-muted" font-size="9">MẤT — nói trước điều này</text>
  <text x="454" y="207" text-anchor="middle" class="fig-label" font-size="11">Hai người một máy</text>
  <text x="454" y="224" text-anchor="middle" class="fig-muted" font-size="9">phải đăng xuất được</text>
  <text x="454" y="265" text-anchor="middle" class="fig-label" font-size="11">Yêu cầu xoá</text>
  <text x="454" y="282" text-anchor="middle" class="fig-muted" font-size="9">store bắt buộc có</text>
  <text x="611" y="149" text-anchor="middle" class="fig-label" font-size="11">Khôi phục</text>
  <text x="611" y="166" text-anchor="middle" class="fig-muted" font-size="9">mã hỗ trợ</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#pid-a)" fill="none">
    <path d="M146 150 H182"/>
    <path d="M318 140 Q350 140 350 37 H380"/>
    <path d="M318 145 Q352 145 352 95 H380"/>
    <path d="M318 150 H380"/>
    <path d="M318 155 Q352 155 352 211 H380"/>
    <path d="M318 160 Q350 160 350 269 H380"/>
    <path d="M524 153 H552"/>
  </g>
</svg>
<figcaption>Nhánh giữa — máy mới mà chưa liên kết — là nhánh đau nhất, và nó chiếm phần lớn khiếu nại hỗ trợ. Cách rẻ nhất để giảm là nhắc liên kết đúng lúc người chơi đã đầu tư đủ để quan tâm.</figcaption>
</figure>

Bảy nhánh, và việc phải làm với từng cái:

1. **Đăng nhập khách.** Tạo `user_id` ngay lần mở đầu, không hỏi gì. Đừng bắt đăng ký trước khi người chơi biết game có đáng không.
2. **Liên kết sang tài khoản thật.** Thêm một dòng đăng nhập, **giữ nguyên `user_id`**. Đây là thao tác thêm, không phải tạo mới.
3. **Máy mới, đã liên kết.** Đăng nhập Google/Apple là về đúng `user_id` cũ với toàn bộ tiến trình.
4. **Máy mới, chưa liên kết.** Tiến trình **mất thật**. Điều duy nhất làm được là nói trước cho người chơi — nhắc liên kết sau khi họ đã đầu tư đủ để quan tâm, đừng nhắc ở màn hình đầu tiên khi họ chưa có gì để mất.
5. **Hai người dùng chung một máy.** Phải đăng xuất được, và đăng xuất **không** được xoá dữ liệu cục bộ của người kia một cách không hồi lại.
6. **Yêu cầu xoá tài khoản.** Cả App Store lẫn Google Play đều yêu cầu có đường xoá. Xem phần dưới.
7. **Khôi phục qua hỗ trợ.** Người chơi mất máy và chưa liên kết: cần một mã hiện trong game để đội hỗ trợ tra được `user_id`. Không có nó thì mọi khiếu nại đều là lời khai không kiểm chứng được.

## Liên kết tài khoản: chỗ dễ mất dữ liệu nhất

Tình huống: người chơi có tài khoản khách đã chơi 20 giờ trên máy A, và một tài khoản Google đã từng chơi trên máy B. Họ bấm liên kết. **Hai `user_id` cùng tồn tại, giữ cái nào?**

Đây không phải câu hỏi kỹ thuật, nó là quyết định sản phẩm và phải chốt trước khi viết code:

| Cách xử lý | Ưu | Nhược |
|---|---|---|
| **Hỏi người chơi**, hiện tóm tắt hai bên | Minh bạch, họ tự chịu trách nhiệm | Thêm màn hình; phải hiện đủ thông tin để chọn đúng |
| Luôn giữ tài khoản Google | Đơn giản, dễ giải thích | Người chơi mất 20 giờ tiến trình khách |
| Tự chọn cái "nhiều tiến trình hơn" | Không mất phần lớn | Định nghĩa "nhiều hơn" luôn gây tranh cãi |
| Gộp hai tài khoản | Không mất gì | **Rất khó làm đúng** — nhân đôi vật phẩm, gộp ví, trùng vật phẩm chỉ có một |

Khuyến nghị thực dụng: **hỏi người chơi, hiện tóm tắt hai bên (cấp, ngày chơi cuối, số tiền), và ghi log lựa chọn đó**. Gộp tài khoản nghe hào phóng nhưng nó mở ra một mảng lỗi kinh tế mà đội nhỏ không nên đụng vào.

Dù chọn cách nào: **không bao giờ xoá dữ liệu bên thua ngay.** Đánh dấu là đã bỏ, giữ ít nhất 30 ngày. Khiếu nại "tôi bấm nhầm" luôn tới, và không có bản giữ lại thì bạn không giúp được.

## Token và phiên

Nhắc lại từ [[client-server-flow]] với phần thuộc về server:

- **Access token ngắn hạn** (15–60 phút), không chứa gì ngoài `user_id` và hạn. Đừng nhét `gold` hay `level` vào — nó cũ ngay lập tức và mời người ta thử sửa.
- **Refresh token dài hạn, lưu trong database** để **thu hồi được**. Token chỉ ký mà không lưu thì không có cách nào đá một tài khoản bị chiếm ra khỏi phiên.
- **Thu hồi hết phiên** khi người chơi đổi mật khẩu hoặc báo mất tài khoản.
- Phía client: một cổng refresh duy nhất — xem [[unity-network-client]].

## Xoá tài khoản: làm cho đúng

Store yêu cầu, nên đây không phải lựa chọn. Ba điểm hay làm sai:

1. **Xoá mềm trước, xoá cứng sau.** Đánh dấu, hẹn 14–30 ngày, rồi mới xoá thật. Người chơi đổi ý là chuyện thường.
2. **Dữ liệu tài chính phải giữ lại** theo yêu cầu kế toán và đối soát với store. Cách đúng là **ẩn danh hoá**: giữ dòng giao dịch, bỏ liên kết tới danh tính. Sổ cái ở [[game-database]] không được phép có lỗ hổng.
3. **Bảng xếp hạng và nội dung xã hội.** Quyết trước: tên hiện thành "Người chơi đã rời", hay xoá khỏi bảng. Không quyết thì code sẽ tự quyết bằng cách ném lỗi khi tra một `user_id` không còn.

Và một điều thường bị quên: **xoá tài khoản phải xoá được cả khi người chơi không đăng nhập vào được nữa** — nếu không thì yêu cầu xoá lại trở thành một khiếu nại hỗ trợ.

## Bẫy thường gặp

- **Dùng thông tin đăng nhập làm khoá chính.** Đổi email là mất tài khoản; thêm cách đăng nhập thứ hai là không thể.
- **Device id coi là danh tính vĩnh viễn.** Nó đổi khi cài lại hệ điều hành, và có thể trùng trên vài dòng máy cũ.
- **Nhắc liên kết ở màn hình đầu tiên.** Người chơi chưa có gì để mất nên bỏ qua, rồi mất tiến trình ở tháng thứ hai.
- **Đăng xuất xoá sạch dữ liệu cục bộ.** Người chơi bấm nhầm là mất cache và phải tải lại tất cả — hoặc tệ hơn, mất hàng đợi chưa gửi.
- **Không có mã hỗ trợ.** Mọi khiếu nại mất tài khoản đều không kiểm chứng được.
- **Xoá cứng ngay khi có yêu cầu.** Không có đường quay lại, và có thể vi phạm yêu cầu lưu trữ dữ liệu tài chính.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho luồng tài khoản**

Đây là chủ đề AI **biết nhiều mẫu nhưng chọn sai mặc định**: nó hay đề xuất dùng email làm khoá chính và bỏ qua hoàn toàn luồng khách. Dùng nó để **liệt kê nhánh** và **soi chỗ mất dữ liệu**, đừng để nó quyết chính sách.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Liệt kê nhánh | Trước khi viết code | "Với luồng tài khoản này, liệt kê mọi nhánh dẫn tới mất tiến trình" |
| Soi chính sách liên kết | Khi làm phần liên kết | "Hai user_id cùng tồn tại khi liên kết — liệt kê cách xử lý và cái mất của từng cách" |
| Viết kịch bản test | Trước khi phát hành | "Viết kịch bản test thủ công cho 7 nhánh tài khoản, mỗi bước có kết quả mong đợi" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Có đăng nhập khách không** — không nói thì nó bỏ qua và thiết kế quanh email.
- **Những cách đăng nhập nào** cần hỗ trợ, và có bắt buộc cái nào không.
- **Chính sách khi hai tài khoản gặp nhau** — đây là quyết định của bạn, không phải của nó.
- **Yêu cầu xoá tài khoản** của store bạn phát hành.

**Mẫu prompt**

```
Luồng tài khoản: đăng nhập khách bằng device id ngay lần mở đầu, sau đó liên kết
Google hoặc Apple. user_id sinh một lần, không bao giờ đổi. Phát hành Android + iOS.

Việc 1: liệt kê MỌI nhánh dẫn tới người chơi mất tiến trình, kèm xác suất xảy ra thực tế
và cách giảm thiểu ở từng nhánh.
Việc 2: thiết kế bảng: master user, bảng thông tin đăng nhập (nhiều dòng mỗi người), phiên.
Nêu rõ khoá chính, khoá ngoại, và ràng buộc UNIQUE ở đâu.
Việc 3: viết kịch bản test thủ công cho nhánh "liên kết khi cả hai tài khoản đã có tiến trình".

Ràng buộc:
- KHÔNG dùng email hay Google ID làm khoá chính.
- KHÔNG đề xuất gộp hai tài khoản — nêu lý do vì sao tôi nên tránh.
- Xoá tài khoản phải là xoá mềm, và dữ liệu giao dịch phải được ẩn danh hoá chứ không xoá.
- Nhánh nào cần tôi quyết chính sách thì ghi "CẦN QUYẾT", đừng tự chọn.
```

**Bẫy thường gặp:** AI thiết kế quanh email và mật khẩu vì đó là mẫu phổ biến nhất trong dữ liệu nó học — trong khi game mobile hầu như luôn bắt đầu bằng khách. Bẫy thứ hai: nó đề xuất gộp tài khoản vì nghe hào phóng, mà không nêu mảng lỗi kinh tế đi kèm. Bẫy thứ ba: nó bỏ hẳn nhánh "máy mới, chưa liên kết" vì đó là nhánh không có giải pháp kỹ thuật đẹp.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao không dùng email hoặc Google ID làm khoá chính của người chơi?**
  → Vì thông tin đăng nhập đổi được còn danh tính thì không. Lấy Google ID làm khoá chính thì người chơi đổi email là mất tài khoản, và bạn không thêm được cách đăng nhập thứ hai. Đúng là `user_id` riêng sinh một lần, còn các cách đăng nhập nằm ở bảng khác, nhiều dòng cho một người.
- `Junior` **Vì sao cho chơi khách trước thay vì bắt đăng ký?**
  → Vì bắt đăng ký ở màn hình đầu là mất một phần đáng kể người mới trước khi họ kịp biết game có đáng không. Tạo `user_id` ngay lần mở đầu, không hỏi gì, rồi nhắc liên kết **sau khi** họ đã đầu tư đủ để quan tâm tới việc mất tiến trình.
- `Mid` **Người chơi có tài khoản khách 20 giờ và một tài khoản Google cũ. Họ bấm liên kết. Anh làm gì?**
  → Đây là quyết định sản phẩm, phải chốt trước khi viết code. Tôi hỏi người chơi, hiện tóm tắt hai bên — cấp, ngày chơi cuối, số tiền — để họ chọn, rồi ghi log lựa chọn. Và **không xoá bên thua ngay**: đánh dấu đã bỏ, giữ ít nhất 30 ngày, vì khiếu nại "tôi bấm nhầm" luôn tới.
- `Mid` **Vì sao refresh token phải lưu trong database?**
  → Để **thu hồi được**. Token chỉ ký mà không lưu thì không có cách nào đá một tài khoản bị chiếm ra khỏi phiên, và cũng không thu hồi hết phiên được khi người chơi báo mất tài khoản. Access token thì ngắn hạn 15–60 phút và chỉ chứa `user_id` với hạn — nhét `gold` vào là vừa cũ ngay vừa mời người ta thử sửa.
- `Senior` **Xoá tài khoản theo yêu cầu của store, anh làm thế nào?**
  → Xoá mềm trước, hẹn 14–30 ngày rồi mới xoá cứng, vì người chơi đổi ý là chuyện thường. Dữ liệu giao dịch thì **ẩn danh hoá chứ không xoá** — giữ dòng sổ cái, bỏ liên kết tới danh tính — vì đối soát với store và kế toán cần nó, và sổ cái không được phép có lỗ hổng. Và phải xoá được cả khi người chơi không đăng nhập vào được nữa.
- `Senior` **Nhánh nào của luồng tài khoản tốn nhiều chi phí hỗ trợ nhất?**
  → "Máy mới, chưa liên kết" — tiến trình mất thật và không có giải pháp kỹ thuật nào cứu được. Giảm thiểu bằng hai việc: nhắc liên kết đúng lúc người chơi đã có thứ để mất, và có **mã hỗ trợ** hiện trong game để đội hỗ trợ tra được `user_id`. Không có mã đó thì mọi khiếu nại đều là lời khai không kiểm chứng được.

**Khung trả lời 60 giây** — "Thiết kế hệ thống tài khoản cho game mobile"

> Tách hai khái niệm từ đầu: **danh tính** và **cách đăng nhập**. `user_id` sinh một lần ở lần mở app đầu tiên, không bao giờ đổi, và là khoá ngoại của mọi bảng khác. Các cách đăng nhập — device id, Google, Apple — nằm ở bảng riêng, nhiều dòng cho một người.
>
> Người chơi bắt đầu bằng **tài khoản khách**, không hỏi gì. Liên kết Google hay Apple về sau chỉ là **thêm một dòng đăng nhập**, giữ nguyên `user_id`. Nhờ tách như vậy, thêm cách đăng nhập thứ ba sau này không đụng gì tới dữ liệu chơi.
>
> Phần tốn thời gian không phải đăng nhập mà là **bảy nhánh còn lại**: liên kết khi cả hai bên đã có tiến trình, máy mới chưa liên kết, hai người dùng chung máy, khôi phục qua hỗ trợ, và xoá tài khoản theo yêu cầu của store. Mỗi nhánh đều phải có quyết định viết ra trước khi code.

**Họ sẽ đào tiếp**

- *"Device id có đáng tin không?"* → Không hẳn. Nó đổi khi cài lại hệ điều hành, và trên một số dòng máy cũ có thể trùng. Nên nó đủ để tạo tài khoản khách, nhưng **không** đủ để làm bằng chứng sở hữu khi có khiếu nại — chỗ đó cần mã hỗ trợ hoặc một cách đăng nhập thật.
- *"Có nên gộp hai tài khoản không?"* → Tôi tránh. Nghe hào phóng nhưng nó mở ra cả mảng lỗi kinh tế: gộp ví thế nào, vật phẩm độc bản trùng thì sao, giới hạn số lượng bị vượt thì sao. Đội nhỏ không nên đụng; hỏi người chơi chọn một bên là đủ tốt và giải thích được.
- *"Đăng xuất thì xoá gì ở máy?"* → Xoá token và dữ liệu định danh, **không** xoá cache master data và tuyệt đối không xoá hàng đợi lệnh chưa gửi. Đăng xuất là thao tác người chơi hay bấm nhầm, nên nó phải rẻ để hồi lại.
- *"Chống chiếm tài khoản thì sao?"* → Thu hồi được phiên là điều kiện tiên quyết, nên refresh token phải nằm trong database. Cộng thêm log đăng nhập có thiết bị và thời điểm, để khi điều tra còn có gì mà nhìn.
- *"`user_id` nên là kiểu gì?"* → UUID hoặc tương đương, không phải số tự tăng — số tự tăng để lộ quy mô người chơi và cho phép đoán id người khác. Và khi gửi qua JSON thì gửi dạng chuỗi, vì id số lớn bị công cụ JavaScript đọc thành số thực và sai ở chữ số cuối.

**Cờ đỏ**

- Dùng email hoặc Google ID làm khoá chính.
- Không có luồng khách, bắt đăng ký ở màn hình đầu.
- Xoá cứng tài khoản ngay khi có yêu cầu.
- Xoá luôn cả dòng giao dịch khi xoá tài khoản.
- Không có cách nào thu hồi phiên.
- Nhắc liên kết tài khoản ở màn hình đầu tiên rồi không nhắc lại nữa.

**Số / ví dụ nên thuộc**

- Access token **15–60 phút**; refresh token lưu database để thu hồi được.
- Giữ tài khoản bên thua sau khi liên kết: ít nhất **30 ngày**.
- Xoá mềm trước khi xoá cứng: **14–30 ngày**.
- Bảy nhánh: khách · liên kết · máy mới đã liên kết · máy mới chưa liên kết · chung máy · xoá · khôi phục.

**Kể trong dự án**

- *"Anh làm phần tài khoản à?"* → Nêu **số nhánh bạn xử lý**, không chỉ "tôi làm login". Nói được bảy nhánh cho thấy bạn đã sống với hệ thống này sau khi phát hành, chứ không chỉ viết nó.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: người chơi liên kết Google rồi mất sạch tiến trình khách, và khiếu nại tới hàng loạt. Kể cách bạn dựng màn hình chọn có tóm tắt hai bên, và quan trọng hơn — giữ lại bên thua 30 ngày để còn khôi phục cho những người đã mất.
- *"Anh có phải khôi phục tài khoản cho ai chưa?"* → Nếu có, kể bạn dựa vào gì để xác minh: mã hỗ trợ, lịch sử giao dịch, hay thiết bị. Câu trả lời này lộ ngay bạn có thiết kế cho khâu hỗ trợ hay chỉ thiết kế cho đường thành công.
