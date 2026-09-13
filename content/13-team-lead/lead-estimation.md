---
id: lead-estimation
title: Ước lượng và lịch
summary: Vì sao ước lượng game sai nhiều hơn phần mềm thường, cách chia task theo độ bất định thay vì ước lượng đều tay, hệ số lịch sử của chính đội bạn, và bốn tín hiệu trượt mốc lộ ra từ giữa chặng.
status: deep
read: 1020
level: intermediate
order: 20
tags: [team, planning, milestone, process, metrics]
related: [team-lead, project-milestones, lead-upward, lead-crisis]
---

Ước lượng phần mềm đã khó. Ước lượng game khó hơn một bậc vì một lý do rất cụ thể: **phần lớn công việc không có điều kiện dừng rõ ràng.**

"Viết API mua item" thì xong là xong. "Làm cho đòn đánh đã tay" thì xong là khi nào? Thử ba lần hay mười hai lần? Câu hỏi đó không trả lời được trước, và nó chiếm phần đáng kể lịch của một dự án game.

Việc của lead không phải ước lượng chính xác — không ai làm được. Việc của lead là **biết loại nào ước lượng được, loại nào không, và xử lý hai loại đó bằng hai cách khác nhau.**

## Bốn loại task, bốn cách xử lý

Ước lượng đều tay cho mọi task là sai lầm gốc. Chia theo **độ bất định**, không theo độ lớn:

| Loại | Ví dụ trong game | Sai số điển hình | Cách xử lý |
|---|---|---|---|
| **Đã làm rồi** | Thêm loại item vào shop, thêm một màn theo template có sẵn | ±20% | Ước lượng bình thường, tin được |
| **Mới nhưng biết cách** | Tích hợp SDK quảng cáo, dựng bảng xếp hạng đầu tiên | ×1,5–2 | Ước lượng rồi nhân hệ số, ghi rõ hệ số vào lịch |
| **Chưa ai biết kết quả đúng là gì** | Cảm giác điều khiển, độ khó boss, nhịp một trận | **Không ước lượng được** | Đặt **timebox** + tiêu chí dừng |
| **Bug không tái hiện được** | Crash 0,3% trên một dòng máy, desync hiếm | **Không ước lượng được** | Timebox điều tra, rồi quyết tiếp |

Hai loại dưới là chỗ mọi lịch chết. Cách duy nhất xử lý được chúng là **đổi câu hỏi**: thay vì "mất bao lâu", hỏi "cho việc này bao nhiêu thời gian, và hết thời gian đó thì quyết gì".

Ví dụ một timebox viết đúng: *"Ba ngày cho cảm giác nhảy. Hết ba ngày, lấy bản tốt nhất đang có và khoá lại; muốn đổi nữa thì phải đợi sau mốc."* Nó cho phép lên lịch một việc vốn không lên lịch được, và quan trọng hơn: nó cho người làm quyền dừng mà không thấy mình làm dở.

Về nguyên tắc thiết kế cho phần cảm giác, xem [[game-feel]] và [[prototyping]] — prototype rẻ chính là cách giảm số vòng lặp cần timebox.

## Hệ số của đội bạn, không phải hệ số của ngành

Đừng dùng "nhân đôi mọi ước lượng" như câu vui truyền miệng. Đo hệ số thật, mất mười lăm phút:

1. Lấy **ba mốc gần nhất**.
2. Với mỗi mốc: tổng ước lượng ban đầu (ngày-người) và tổng thực tế đã tiêu.
3. Hệ số = thực tế ÷ ước lượng. Lấy trung bình.

Đội bình thường ra khoảng **1,3 tới 2,0**. Con số đó là tài sản của bạn: nó biến ước lượng của đội thành cam kết bạn dám nói với sếp. Và nó phải **công khai với đội** — giấu đi thì người ta tưởng bạn đang ép, còn công khai thì hệ số thành mục tiêu chung để kéo xuống.

Hai điều chỉnh quan trọng:

- **Không phạt người ước lượng thấp.** Nếu ước lượng thấp bị mắng, lần sau mọi người ước lượng cao gấp đôi và bạn mất luôn tín hiệu. Hệ số tồn tại để bạn không cần mắng ai.
- **Hệ số tính trên khối lượng, không tính trên người.** Ai cũng có phân bố riêng, nhưng quản lý theo cá nhân thì biến ước lượng thành chuyện đánh giá thay vì chuyện lịch.

## Buffer đặt ở cuối, không rải vào từng task

Rải buffer vào từng task là cách chắc chắn nhất để mất nó: việc luôn giãn ra vừa hết thời gian được cấp, nên buffer rải sẽ bị tiêu hết mà không ai biết nó đã bị tiêu.

Đặt **một khối buffer cuối mốc, 20–30% khối lượng**, gọi đúng tên là buffer, và theo dõi nó như một tài nguyên:

| Cách đặt | Kết quả |
|---|---|
| Mỗi task +30% | Buffer biến mất âm thầm, và bạn không bao giờ biết mình còn bao nhiêu |
| Một khối 25% ở cuối mốc | Tiêu tới đâu nhìn thấy tới đó — "còn 4 ngày buffer" là câu nói được trong họp |
| Không có buffer | Mọi sự cố nhỏ đều thành trượt mốc; và sự cố nhỏ thì chắc chắn có |

Ba thứ gần như luôn bị quên khỏi lịch của một mốc game, cộng lại thường chiếm hơn một tuần: **đợt QA cuối**, **thời gian duyệt/chứng chỉ store**, và **ngày nghỉ lễ cùng phép của đội**. Xem [[project-milestones]] về định nghĩa từng mốc.

## Trượt lộ ra từ giữa chặng, nếu bạn chịu nhìn

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Biểu đồ khối lượng còn lại theo tuần: đường kế hoạch giảm đều, đường thực tế giảm chậm hơn từ tuần thứ hai rồi phẳng hẳn ở 20 phần trăm cuối, cho thấy trượt lộ ra từ giữa chặng">
  <defs>
    <marker id="lest-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <line x1="70" y1="258" x2="640" y2="258" stroke="#6ea8fe" stroke-width="1.5" marker-end="url(#lest-a)"/>
  <line x1="70" y1="258" x2="70" y2="34" stroke="#6ea8fe" stroke-width="1.5" marker-end="url(#lest-a)"/>
  <text x="356" y="292" text-anchor="middle" class="fig-muted" font-size="11">tuần trong mốc</text>
  <text x="26" y="146" text-anchor="middle" class="fig-muted" font-size="11" transform="rotate(-90 26 146)">khối lượng còn lại</text>
  <line x1="250" y1="46" x2="250" y2="258" stroke="#ffd43b" stroke-width="1.5" stroke-dasharray="5 4"/>
  <polyline points="70,60 160,92 250,124 340,156 430,188 520,220 610,252" fill="none" stroke="#51cf9b" stroke-width="2.5"/>
  <polyline points="70,60 160,106 250,152 340,172 430,182 520,187 610,190" fill="none" stroke="#ff8787" stroke-width="2.5"/>
  <text x="600" y="240" text-anchor="end" class="fig-label" font-size="12">kế hoạch</text>
  <text x="600" y="178" text-anchor="end" class="fig-label" font-size="12">thực tế</text>
  <text x="258" y="44" class="fig-muted" font-size="10">tuần 2 — chênh đã đủ để biết</text>
  <text x="470" y="208" text-anchor="middle" class="fig-muted" font-size="10">"còn 20% nữa thôi" kéo dài ba tuần</text>
  <text x="356" y="278" text-anchor="middle" class="fig-muted" font-size="10">khoảng cách giữa hai đường ở tuần 2 đã dự báo được điểm kết thúc thật</text>
</svg>
<figcaption>Mốc không trượt ở tuần cuối, nó trượt ở tuần thứ hai. Cái đuôi phẳng cuối biểu đồ là phần việc bị báo "xong 90%" từ lâu.</figcaption>
</figure>

Bốn tín hiệu đáng tin hơn cảm giác, rà hằng tuần trong vòng tuần:

| Tín hiệu | Ngưỡng đáng lo | Nó nói lên điều gì |
|---|---|---|
| Số task ở trạng thái "đang làm" | Nhiều hơn số người | Mọi người đang nhảy qua lại, không ai đóng được cái nào |
| Task nằm ở "gần xong" | Quá 3 ngày | Phần khó chưa bị chạm tới, không phải sắp xong |
| PR chờ review | Quá 1 ngày làm việc | Luồng đang tắc ở bạn hoặc ở người review |
| Bug mở / bug đóng trong tuần | Tỉ lệ > 1 hai tuần liền | Đội đang tạo lỗi nhanh hơn sửa — mốc sẽ trượt kể cả khi tính năng "xong" |

Tín hiệu thứ tư là tín hiệu ít đội nhỏ theo dõi nhất, và nó dự báo trượt chính xác nhất ở giai đoạn cuối mốc.

## "Xong 90%" và cách chặn nó

Không có task nào 90%. Có task **chưa chạm phần khó** và task **đã chạy được từ đầu tới cuối**.

Cách chặn, rẻ và hiệu quả: **bỏ hẳn phần trăm, dùng trạng thái nhị phân theo lát cắt dọc.** Một tính năng shop không đo bằng 90%, mà đo bằng: *mua được một item, tiền trừ đúng trong database, chạy trên máy người khác*. Chưa đủ ba điều đó thì là 0%.

Cách thứ hai, dành cho việc dài hơn một tuần: **yêu cầu mốc giữa chạy được.** Không phải báo cáo tiến độ, mà một thứ bấm được. Việc không có mốc giữa chạy được thì chia lại — nếu không chia được, nó thuộc loại "chưa ai biết kết quả đúng là gì" và phải chuyển sang timebox.

## Khi đội ước lượng, bạn làm gì

Ước lượng là của người làm, không phải của lead. Nhưng lead có ba việc trong buổi đó:

1. **Đảm bảo người ước lượng là người sẽ làm.** Ước lượng hộ luôn thấp hơn, vì người ước lượng hộ không nhớ phần lặt vặt.
2. **Hỏi ba câu chuẩn** cho mỗi task lớn: *cái này đã có ai làm bao giờ chưa · nó phụ thuộc vào ai · nếu sai hoàn toàn thì sai vì lý do gì*. Câu thứ ba moi ra rủi ro nhanh hơn mọi bảng rủi ro.
3. **Không sửa số của người ta trong buổi họp.** Nếu bạn thấy thấp, hỏi "phần test và phần chạy trên máy khác đã tính chưa" — để họ tự sửa. Số bị lead sửa thì lần sau không ai buồn nghĩ nữa.

## Bẫy thường gặp

- **Nhân hệ số rồi giấu.** Sếp hỏi "sao lâu thế" thì không giải thích được, và đội thì thấy lịch trên trời rơi xuống.
- **Ước lượng theo giờ cho việc bất định.** "Làm boss này 16 giờ" — con số đó sai ngay từ khi viết ra, và nó khoá cả lịch quanh một thứ tưởng tượng.
- **Coi buffer là phần thưởng.** Còn buffer thì thêm tính năng. Thế là mốc nào cũng đúng hạn trong kế hoạch và trượt trong thực tế.
- **Chỉ nhìn tiến độ ở tuần cuối.** Lúc đó ba đòn bẩy đều đã hết tác dụng — xem [[lead-crisis]].
- **Ước lượng không tính phần tích hợp hai phía.** Client xong, server xong, nhưng nối lại mất ba ngày mà không ai đặt vào lịch — xem [[project-teamwork]].

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc ước lượng và lập lịch**

Đảo vai: đừng hỏi AI *"cái này mất bao lâu"* — nó không biết đội bạn, không biết codebase, và con số nó đưa ra có vẻ tự tin y hệt lúc đúng và lúc sai. Hãy dùng nó cho **ba việc mà nó thật sự hơn người**: chia nhỏ, tìm việc bị quên, và phản biện kế hoạch.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Chia nhỏ | Có một tính năng to, cần xé thành task ≤2 ngày | "Xé tính năng này thành task tối đa 2 ngày, đánh dấu task nào phụ thuộc task nào" |
| Tìm việc bị quên | Trước khi chốt lịch mốc | "Liệt kê việc mốc này chắc chắn cần mà danh sách dưới đây chưa có" |
| Phản biện | Sau khi có lịch nháp | "Ba lý do khiến lịch này trượt, xếp theo xác suất, mỗi lý do kèm dấu hiệu sớm" |
| Phân loại bất định | Khi rà danh sách task | "Xếp mỗi task vào: đã làm rồi / mới nhưng biết cách / chưa biết kết quả đúng / không tái hiện được" |

Chế độ cuối là chế độ đáng giá nhất và ít người dùng: nó tách ra được nhóm task **không nên ước lượng** để bạn chuyển chúng sang timebox trước khi chúng phá lịch.

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Hệ số lịch sử của đội** (thực tế ÷ ước lượng ba mốc gần nhất) — không có thì nó lấy giả định lạc quan mặc định.
- **Ai làm việc này, đã từng làm việc tương tự chưa** — cùng một task, người đã làm rồi và người chưa làm chênh nhau gấp ba.
- **Ngày nghỉ, phép, lễ trong kỳ** và **thời gian duyệt store** nếu mốc có phát hành.
- **Định nghĩa "xong" của đội** — không nói thì nó ước lượng tới lúc code chạy trên máy người viết, thiếu hẳn phần test và nối hai phía.
- **Phần nào của tính năng là cảm giác** (game feel, độ khó) — đó là phần không ước lượng được và phải tách ra.

**Mẫu prompt**

```
Bối cảnh: đội <N> người, client Unity + server Go. Định nghĩa "xong" của đội:
chạy từ client tới database ở môi trường dev, có người khác thử lại, không cờ bật tay.
Hệ số lịch sử 3 mốc gần nhất: thực tế ÷ ước lượng = <1.x>.
Kỳ này có <N> ngày nghỉ lễ. Mốc có nộp store: <có/không>.

Việc: với danh sách tính năng dưới đây,
1. Xé thành task tối đa 2 ngày, ghi rõ task nào chặn task nào.
2. Xếp MỖI task vào một trong bốn nhóm: [đã làm rồi] [mới nhưng biết cách]
   [chưa biết kết quả đúng là gì] [không tái hiện được].
3. Với nhóm 3 và 4: KHÔNG ước lượng. Đề xuất timebox + tiêu chí dừng cho từng cái.
4. Liệt kê việc mốc này chắc chắn cần mà tôi chưa liệt kê.

Ràng buộc:
- KHÔNG đưa tổng số ngày cho cả mốc. Tôi tự cộng và tự nhân hệ số.
- KHÔNG bỏ qua phần nối hai phía và phần test — tính thành task riêng.
- Task nào bạn không đủ thông tin để phân nhóm thì ghi "cần hỏi", đừng đoán.

<dán danh sách tính năng>
```

**Bẫy thường gặp:** AI đưa ra con số ngày với giọng chắc nịch cho cả việc nó không có cơ sở nào để biết — và con số đó rất dễ trôi thẳng vào lịch bạn gửi sếp. Bẫy thứ hai: nó ước lượng tới lúc "code chạy", bỏ mất test, nối hai phía, sửa sau review và đợt QA — ba thứ này cộng lại thường bằng chính phần code. Bẫy thứ ba: nó coi phần cảm giác game như một task kỹ thuật bình thường, cho nó hai ngày, trong khi đó là thứ duy nhất trong danh sách không có điều kiện dừng.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao ước lượng trong game hay sai hơn phần mềm thường?**
  → Vì phần lớn công việc thiết kế không có điều kiện dừng rõ ràng. "Viết API mua item" xong là xong, nhưng "làm cho đòn đánh đã tay" thì không ai biết trước cần ba vòng lặp hay mười hai. Cộng thêm phụ thuộc chéo giữa code, art và design, nên một task trễ thường kéo theo ba task khác đứng chờ.
- `Mid` **Đội anh ước lượng một mốc hết 40 ngày-người. Anh nói gì với sếp?**
  → Tôi không nói 40. Tôi lấy hệ số lịch sử ba mốc gần nhất — thực tế chia ước lượng, thường ra 1,3 tới 2,0 — nhân vào, rồi cộng phần hay bị quên: đợt QA cuối, thời gian duyệt store, ngày nghỉ lễ. Con số đó mới là con số tôi cam kết, và tôi nói rõ nó gồm những gì để sếp thấy đây là tính toán chứ không phải phòng thủ.
- `Mid` **Task báo "xong 90%" ba ngày liền. Anh làm gì?**
  → Tôi coi 90% là 0% và đi tìm phần khó chưa bị chạm. Thường là phần nối hai phía, xử lý lỗi, hoặc chạy trên máy người khác. Tôi hỏi một câu duy nhất: cho tôi xem nó chạy — nếu chưa chạy được từ đầu tới cuối thì chúng tôi chia lại task ngay hôm đó thay vì chờ thêm.
- `Senior` **Có phần việc không ước lượng được — cảm giác điều khiển chẳng hạn. Anh đưa nó vào lịch kiểu gì?**
  → Tôi đổi câu hỏi từ "mất bao lâu" sang "cho nó bao nhiêu và hết thì quyết gì". Cụ thể là một timebox có tiêu chí dừng: ba ngày cho cảm giác nhảy, hết ba ngày lấy bản tốt nhất đang có và khoá lại, muốn đổi nữa thì đợi sau mốc. Cách này vừa cho lịch một con số dùng được, vừa cho người làm quyền dừng mà không thấy mình bỏ dở.
- `Senior` **Anh nhận ra mốc sắp trượt bằng gì, và sớm tới mức nào?**
  → Bằng bốn tín hiệu rà hằng tuần, chứ không bằng cảm giác cuối chặng: số task "đang làm" nhiều hơn số người, task nằm ở "gần xong" quá ba ngày, PR chờ review quá một ngày làm việc, và tỉ lệ bug mở trên bug đóng lớn hơn một trong hai tuần liền. Thường tới tuần thứ hai của một mốc sáu tuần là khoảng cách giữa đường kế hoạch và đường thực tế đã đủ để dự báo điểm kết thúc thật.

**Khung trả lời 60 giây** — "Anh ước lượng một tính năng game thế nào?"

> Tôi không ước lượng đều tay. Trước hết tôi chia task theo **độ bất định** thành bốn nhóm: việc đã làm rồi thì ước lượng tin được, sai chừng 20%; việc mới nhưng biết cách thì nhân 1,5 tới 2; còn hai nhóm cuối — thứ chưa ai biết kết quả đúng là gì, như cảm giác điều khiển, và bug không tái hiện được — thì tôi **không ước lượng**, tôi đặt timebox kèm tiêu chí dừng.
>
> Sau đó tôi để chính người sẽ làm đưa con số, rồi nhân **hệ số lịch sử của đội** — thực tế chia ước lượng của ba mốc gần nhất, thường 1,3 đến 2,0. Hệ số đó công khai với cả đội, vì giấu thì người ta tưởng mình ép.
>
> Buffer tôi đặt **một khối 20–30% ở cuối mốc**, không rải vào từng task — rải thì nó bị tiêu hết mà không ai biết. Và tôi luôn cộng riêng ba thứ hay bị quên: đợt QA cuối, thời gian duyệt store, ngày nghỉ lễ.

**Họ sẽ đào tiếp**

- *"Vì sao buffer không rải vào từng task?"* → Vì việc luôn giãn ra vừa hết thời gian được cấp. Rải thì buffer biến mất âm thầm và tới cuối mốc bạn không biết mình còn bao nhiêu; gom một khối thì "còn bốn ngày buffer" trở thành câu nói được trong họp và cân nhắc được.
- *"Hệ số lịch sử lấy ở đâu ra nếu đội mới?"* → Mốc đầu thì đành dùng 1,5 và nói rõ đó là giả định. Nhưng phải đo ngay từ mốc đầu tiên, vì sau ba mốc là có số thật; dùng mãi con số truyền miệng "nhân đôi" thì vừa không đúng đội mình vừa không cải thiện được.
- *"Timebox khác bỏ cuộc chỗ nào?"* → Timebox có **tiêu chí dừng và quyết định kèm theo**: hết giờ thì lấy bản tốt nhất đang có, khoá lại, và hẹn xem lại sau mốc. Bỏ cuộc thì không có bản nào được chọn và cũng không ai biết bao giờ quay lại.
- *"Sao lại coi 90% là 0%?"* → Vì phần trăm trong phần mềm đo thứ đã làm, không đo thứ còn lại, mà phần còn lại thường chứa toàn bộ cái khó: nối hai phía, lỗi, chạy trên máy khác. Nhị phân theo lát cắt dọc — mua được item, tiền trừ đúng trong database, chạy trên máy người khác — thì không nói dối được.
- *"Nếu đội ước lượng thấp thì anh có sửa số không?"* → Không sửa trong buổi họp. Tôi hỏi lại "phần test và phần chạy trên máy khác tính chưa" để họ tự sửa, vì số bị lead sửa thì lần sau không ai buồn nghĩ nữa và tôi mất luôn tín hiệu.

**Cờ đỏ**

- "Cứ nhân đôi là chuẩn" — dùng câu vui truyền miệng thay cho hệ số đo từ chính đội mình.
- Ước lượng theo giờ cho phần cảm giác game, rồi khoá lịch quanh con số đó.
- Phạt người ước lượng thấp — cách nhanh nhất để lần sau không còn tín hiệu nào dùng được.
- Chỉ nhìn tiến độ ở tuần cuối, khi cả ba đòn bẩy phạm vi, thời gian và người đều đã hết tác dụng.
- Ước lượng bỏ quên phần nối hai phía, đợt QA và thời gian duyệt store.

**Số / ví dụ nên thuộc**

- Hệ số lịch sử đội bình thường: **1,3–2,0** (thực tế ÷ ước lượng, ba mốc gần nhất).
- Sai số nhóm "đã làm rồi": **±20%** · nhóm "mới nhưng biết cách": **×1,5–2**.
- Buffer: **một khối 20–30%** ở cuối mốc, không rải.
- Ngưỡng tín hiệu: task "gần xong" quá **3 ngày** · PR chờ quá **1 ngày làm việc** · bug mở/đóng **> 1** hai tuần liền.
- Task xé nhỏ tới tối đa **2 ngày**.

**Kể trong dự án**

- *"Dự án của anh có trượt mốc không?"* → Đừng nói không, không ai tin. Kể một lần trượt, **phát hiện ở tuần nào**, và bạn đã dùng đòn bẩy nào — cắt phạm vi, đổi ngày, hay chấp nhận trượt và báo sớm.
- *"Anh cải thiện được gì về mặt lập kế hoạch?"* → Câu chuyện mạnh nhất thường là chuyển từ ước lượng cảm tính sang đo hệ số lịch sử: nêu hệ số ban đầu, hệ số sau ba mốc, và bạn đã đổi cái gì để nó giảm.
- *"Ai quyết định cắt tính năng?"* → Nêu rõ vai: bạn đưa lựa chọn kèm cái mất đi của từng lựa chọn, người quyết là ai. Lead giỏi không phải người tự quyết hết, mà là người làm cho quyết định của cấp trên có đủ thông tin.
