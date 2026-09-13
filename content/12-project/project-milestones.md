---
id: project-milestones
title: Mốc bàn giao và dấu hiệu trượt
summary: Bốn mốc từ vertical slice tới soft launch, tiêu chí ra mốc viết thành câu kiểm được, và năm dấu hiệu dự án đang trượt mà bảng kế hoạch không hiện ra.
status: deep
read: 950
level: intermediate
order: 50
tags: [project, milestone, planning, process, qa]
related: [project-kickoff, playtesting-metrics, unity-testing-ci, project-launch]
---

Mốc dự án không phải là ngày trên lịch. Nó là **một câu kiểm được**: đúng hay sai, không có "gần xong".

"Xong hệ thống chiến đấu" không phải tiêu chí — ai cũng gật, và ba tuần sau vẫn còn việc. "Một người chưa từng chơi game này tự mở app, đăng nhập, đánh xong một trận, nhận thưởng, và số vàng trong database khớp với thứ họ thấy trên màn hình" mới là tiêu chí: thử là biết.

## Bốn mốc

| Mốc | Câu kiểm được | Thời điểm điển hình |
|---|---|---|
| **M1 · Vertical slice** | Một người ngoài đội chơi được một vòng đầy đủ từ đăng nhập tới nhận thưởng, chạm mọi tầng, trên **máy thật** | 20–25% thời gian dự án |
| **M2 · Alpha tính năng** | Mọi hệ thống trong phạm vi đều **có mặt**, có thể còn xấu và chưa cân bằng | 50–60% |
| **M3 · Beta khoá tính năng** | Không thêm tính năng nữa. Chỉ sửa lỗi, cân bằng số, và làm mượt | 75–80% |
| **M4 · Soft launch** | Phát hành hạn chế ở một thị trường nhỏ, đo số liệu thật — xem [[project-launch]] | 100% |

Ba điều làm bốn mốc này khác với bảng kế hoạch thông thường:

- **M1 phải chạm tầng server thật**, không phải dữ liệu giả. Lát mỏng nhưng xuyên suốt — đây là điểm đã nói ở [[project-kickoff]].
- **M3 là mốc khoá tính năng, và nó phải được tôn trọng.** Mốc này tồn tại để bảo vệ phần cân bằng và sửa lỗi khỏi bị nuốt. Thêm "một tính năng nhỏ" sau M3 là cách quen thuộc nhất để hỏng chất lượng bản phát hành.
- **Mỗi mốc có một người duy nhất tuyên bố đạt hay không.** Không phải bỏ phiếu.

## Tiêu chí ra mốc: viết thành câu thử được

Mẫu cho M1 của một game có server — sao chép rồi sửa theo dự án:

- [ ] Cài bản build lên **máy Android thật**, không phải Editor
- [ ] Đăng nhập khách thành công, tài khoản mới xuất hiện trong database
- [ ] Master data tải từ server, đổi một con số trên Google Sheet thì client thấy số mới **mà không build lại** ([[master-data]])
- [ ] Chơi xong một trận, phần thưởng ghi vào database trong một transaction
- [ ] Tắt WiFi giữa trận rồi bật lại: client nối lại được, không mất tiến trình
- [ ] Bấm mua hai lần liên tiếp: chỉ trừ tiền một lần ([[client-server-flow]])
- [ ] Thời gian từ chạm icon tới sảnh dưới ngân sách đã chốt
- [ ] Server restart giữa lúc có người chơi: không mất dữ liệu đã ghi

Tám dòng, thử trong hai tiếng, và chúng bắt được phần lớn lỗi kiến trúc. So sánh với "xong phần login" — câu đó không thử được.

## Năm dấu hiệu trượt mà kế hoạch không hiện

Bảng kế hoạch luôn nói dự án đúng tiến độ cho tới tuần cuối. Năm dấu hiệu sau đến sớm hơn nhiều:

<figure class="fig">
<svg viewBox="0 0 660 210" role="img" aria-label="Năm dấu hiệu dự án trượt tiến độ: task tồn đọng quá ba ngày, bug cũ tăng nhanh hơn bug sửa, không ai chơi bản mới nhất, tích hợp dồn cuối, và ước lượng lặp lại tuần này">
  <g class="fig-box-g">
    <rect x="14"  y="46" width="120" height="120" rx="9" class="fig-box"/>
    <rect x="146" y="46" width="120" height="120" rx="9" class="fig-box"/>
    <rect x="278" y="46" width="120" height="120" rx="9" class="fig-box"/>
    <rect x="410" y="46" width="120" height="120" rx="9" class="fig-box"/>
    <rect x="542" y="46" width="104" height="120" rx="9" class="fig-box"/>
  </g>
  <text x="330" y="28" text-anchor="middle" class="fig-label" font-size="13">Năm dấu hiệu đến trước khi bảng kế hoạch đổi màu</text>
  <text x="74"  y="76"  text-anchor="middle" class="fig-label" font-size="11">Task ba ngày</text>
  <text x="74"  y="100" text-anchor="middle" class="fig-muted" font-size="10">vẫn chưa xong</text>
  <text x="74"  y="118" text-anchor="middle" class="fig-muted" font-size="10">sang tuần thứ hai</text>
  <text x="74"  y="146" text-anchor="middle" class="fig-muted" font-size="9">chưa hiểu vấn đề</text>
  <text x="206" y="76"  text-anchor="middle" class="fig-label" font-size="11">Bug tồn tăng</text>
  <text x="206" y="100" text-anchor="middle" class="fig-muted" font-size="10">mở nhiều hơn đóng</text>
  <text x="206" y="118" text-anchor="middle" class="fig-muted" font-size="10">ba tuần liền</text>
  <text x="206" y="146" text-anchor="middle" class="fig-muted" font-size="9">nợ kỹ thuật đang lãi</text>
  <text x="338" y="76"  text-anchor="middle" class="fig-label" font-size="11">Không ai chơi</text>
  <text x="338" y="100" text-anchor="middle" class="fig-muted" font-size="10">bản mới nhất</text>
  <text x="338" y="118" text-anchor="middle" class="fig-muted" font-size="10">quá một tuần</text>
  <text x="338" y="146" text-anchor="middle" class="fig-muted" font-size="9">build đang hỏng</text>
  <text x="470" y="76"  text-anchor="middle" class="fig-label" font-size="11">Tích hợp dồn</text>
  <text x="470" y="100" text-anchor="middle" class="fig-muted" font-size="10">hai phía chưa nối</text>
  <text x="470" y="118" text-anchor="middle" class="fig-muted" font-size="10">quá hai tuần</text>
  <text x="470" y="146" text-anchor="middle" class="fig-muted" font-size="9">rủi ro chưa lộ</text>
  <text x="594" y="76"  text-anchor="middle" class="fig-label" font-size="11">Ước lượng</text>
  <text x="594" y="100" text-anchor="middle" class="fig-muted" font-size="10">lặp lại</text>
  <text x="594" y="118" text-anchor="middle" class="fig-muted" font-size="10">"tuần này xong"</text>
  <text x="594" y="146" text-anchor="middle" class="fig-muted" font-size="9">lần thứ ba</text>
</svg>
<figcaption>Dấu hiệu thứ tư nguy hiểm nhất trong dự án có client và server: hai phía chạy tốt riêng lẻ không nói gì về lúc ghép.</figcaption>
</figure>

Cách xử lý từng cái:

1. **Task kéo dài** — không phải người làm chậm, mà là task chưa được hiểu. Ngồi xuống chia nhỏ lại, hoặc đổi cách tiếp cận.
2. **Bug tồn tăng ba tuần liền** — dừng làm tính năng một tuần. Càng hoãn càng đắt; đây là lãi kép.
3. **Không ai chơi bản mới** — build đang hỏng, hoặc chơi quá phiền. Sửa quy trình build trước khi sửa game ([[unity-testing-ci]]).
4. **Tích hợp dồn** — nối hai phía **hằng ngày**, dù còn xấu. Xem [[project-teamwork]].
5. **Ước lượng lặp lại lần thứ ba** — đổi cách chia việc, không đổi lời hứa.

## Nhịp tuần tối thiểu

Không cần quy trình nặng. Ba việc mỗi tuần là đủ cho đội nhỏ:

| Việc | Khi nào | Mất bao lâu |
|---|---|---|
| **Bản build chơi được** | Cố định một ngày, tự động | 0 nếu CI chạy đúng |
| **Cả đội chơi 20 phút** | Ngay sau khi có build | 20 phút |
| **Nhìn ba con số** | Cùng lúc đó | 10 phút |

Ba con số: **số bug đang mở**, **thời gian build**, và **một chỉ số gameplay** phù hợp với thể loại — xem [[playtesting-metrics]]. Đừng dựng bảng số liệu hai mươi ô ở giai đoạn này; không ai nhìn.

Việc "cả đội chơi 20 phút" nghe nhẹ nhưng là việc giá trị nhất trong bảng. Đội không chơi game của mình là đội không biết game của mình đang ở đâu.

## Ra khỏi chặng này với cái gì

- [ ] Bốn mốc có ngày và có **người tuyên bố đạt**
- [ ] Mỗi mốc có danh sách câu kiểm được, không có câu nào dạng "xong X"
- [ ] Lịch build tự động cố định hằng tuần
- [ ] Ba con số theo dõi, xem cùng lúc mỗi tuần
- [ ] Quy ước rõ: sau M3 không thêm tính năng, ai được phép phá lệ

## Bẫy thường gặp

- **Mốc là ngày, không phải tiêu chí.** Tới ngày thì tuyên bố đạt vì đã tới ngày.
- **Vertical slice dùng dữ liệu giả.** Rủi ro server dời sang tháng cuối, đúng lúc hết chỗ xoay.
- **Khoá tính năng rồi vẫn thêm "cái nhỏ".** Mỗi cái nhỏ kéo theo một vòng test và một đợt lỗi hồi quy.
- **Cân bằng số để tới cuối.** Cân bằng cần nhiều lượt chơi thật; nhồi vào hai tuần cuối là không đủ ([[balancing-math]]).
- **Không ai chơi bản build.** Mốc đạt trên giấy, hỏng trên máy.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc quản lý mốc**

AI không quản lý dự án hộ bạn, nhưng nó làm tốt ba việc cụ thể:

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Đổi mục tiêu mờ thành câu kiểm được | Khi viết tiêu chí mốc | "Đổi 'xong hệ thống shop' thành danh sách câu thử được trên máy thật" |
| Soi rủi ro tích hợp | Đầu mỗi mốc | "Hai phía đang làm những gì; chỗ nào sẽ vỡ khi ghép, xếp theo khả năng" |
| Viết kịch bản test thủ công | Trước mỗi mốc | "Viết kịch bản 30 phút để kiểm M1, mỗi bước có kết quả mong đợi cụ thể" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Mốc này bảo vệ cái gì** — M3 bảo vệ thời gian sửa lỗi, không phải cột mốc trang trí.
- **Đội mấy người và ai làm phía nào.**
- **Cái gì đã chạy thật, cái gì còn là dữ liệu giả** — AI không đoán được, và đây là thông tin quyết định.
- **Thời gian còn lại tính bằng tuần.**

**Mẫu prompt**

```
Dự án: <mô tả>. Đội: 3 người. Còn 7 tuần tới M3 (khoá tính năng).
Đã chạy thật: đăng nhập, master data, một chế độ chơi.
Còn là dữ liệu giả: shop, bảng xếp hạng, phần thưởng cuối trận.

Việc 1: viết tiêu chí ra mốc M3 thành danh sách câu THỬ ĐƯỢC trên máy Android thật.
Mỗi dòng: thao tác | kết quả mong đợi | cách xác nhận (nhìn UI hay tra database).
Việc 2: chỉ ra mục nào trong danh sách trên có rủi ro trượt cao nhất và vì sao.

Ràng buộc:
- KHÔNG viết tiêu chí dạng "hoàn thiện X" hay "tối ưu Y" — phải thử được, đúng hoặc sai.
- Mỗi tiêu chí kiểm được trong dưới 5 phút.
- Nêu rõ tiêu chí nào cần dữ liệu thật từ server thay vì dữ liệu giả.
```

**Bẫy thường gặp:** AI sinh danh sách tiêu chí dài và mềm — "đảm bảo trải nghiệm mượt mà", "tối ưu hiệu năng" — nghe như kế hoạch nhưng không thử được. Ép nó bằng câu "mỗi dòng phải đúng hoặc sai trong 5 phút". Bẫy thứ hai: nó bỏ qua mọi thứ liên quan tới tích hợp hai phía vì bạn mô tả hai phía riêng rẽ.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vertical slice khác demo chỗ nào?**
  → Demo diễn cho người xem: dữ liệu dựng sẵn, máy đã chuẩn bị, đường đi được sắp đặt. Vertical slice chạy thật qua mọi tầng trên máy thật, người lạ cầm cũng chơi được. Demo giấu rủi ro để trông đẹp; slice phơi rủi ro ra để bạn còn kịp xử lý.
- `Mid` **Làm sao anh biết một mốc đã đạt?**
  → Tiêu chí viết thành câu thử được, đúng hoặc sai trong dưới năm phút. Không phải "xong hệ thống shop" mà "trên máy Android thật: mua một món, tiền trừ đúng, món vào túi, và bảng giao dịch có đúng một dòng". Mỗi mốc có một người tuyên bố đạt hay chưa — bỏ phiếu thì mốc nào cũng đạt vì ai cũng ngại làm người nói không.
- `Mid` **Sếp muốn thêm một tính năng sau khi đã khoá. Anh xử lý thế nào?**
  → Tôi không nói không, tôi nói cái giá: thêm cái này thì bỏ cái gì, hoặc lùi bao nhiêu, và vòng test hồi quy tốn thêm bao lâu. Đưa lựa chọn kèm giá để người có thẩm quyền quyết. Cái tôi từ chối là thêm mà không đổi gì cả — vì khi đó thứ bị cắt sẽ là thời gian sửa lỗi, một cách lặng lẽ.
- `Senior` **Dấu hiệu sớm nào cho anh biết dự án đang trượt?**
  → Bốn cái đến trước khi bảng kế hoạch đổi màu: task ước lượng ba ngày sang tuần thứ hai; bug mở nhiều hơn đóng ba tuần liền; không ai chơi bản build mới nhất quá một tuần; và hai phía chưa ghép với nhau quá hai tuần. Cái cuối nguy hiểm nhất trong dự án có client và server, vì hai phía chạy tốt riêng lẻ không nói gì về lúc ghép.
- `Senior` **Dự án chắc chắn trễ. Anh báo cáo thế nào, và báo lúc nào?**
  → Ngay khi biết, kèm ba thứ: trễ bao lâu, vì sao, và hai phương án đánh đổi cụ thể. Báo sớm là tin xấu, báo muộn là mất niềm tin — và thứ phá niềm tin nhanh nhất là hứa "tuần này xong" tới lần thứ ba.

**Khung trả lời 60 giây** — "Làm sao biết một mốc đã đạt?"

> Tôi viết tiêu chí thành **câu thử được**, không phải mô tả. Không phải "xong hệ thống shop" mà "trên máy Android thật: mua một món, tiền trừ đúng, món xuất hiện trong túi, và bảng giao dịch trong database có đúng một dòng."
>
> Với dự án có server, tiêu chí của mốc đầu tiên bắt buộc phải chạm **dữ liệu thật**, không phải dữ liệu giả. Vì rủi ro lớn nhất nằm ở chỗ nối hai phía, mà chỗ đó chỉ lộ ra khi ghép thật.
>
> Và mỗi mốc có **một người** tuyên bố đạt hay chưa, không bỏ phiếu. Bỏ phiếu thì mốc nào cũng đạt, vì ai cũng ngại là người nói không.

**Họ sẽ đào tiếp**

- *"Vertical slice khác demo thế nào?"* → Demo diễn cho người xem, thường có dữ liệu dựng sẵn và chạy trên máy đã chuẩn bị. Vertical slice là lát mỏng **chạy thật** qua mọi tầng, trên máy thật, người lạ cầm cũng chơi được. Demo giấu rủi ro; slice phơi rủi ro ra.
- *"Thêm tính năng sau khi khoá?"* → Tôi không nói không, tôi nói **cái giá**: thêm tính năng này thì bỏ cái gì, hoặc lùi bao nhiêu, và vòng test hồi quy tốn thêm bao lâu. Đưa lựa chọn có giá kèm theo, để người có thẩm quyền quyết. Cái tôi từ chối là thêm mà không đổi gì cả.
- *"Dấu hiệu trượt sớm?"* → Task ba ngày sang tuần thứ hai; bug mở nhiều hơn đóng ba tuần liền; không ai chơi bản mới nhất; hai phía chưa ghép quá hai tuần. Bốn cái này đến trước khi bảng kế hoạch đổi màu.
- *"Báo trễ lúc nào?"* → Ngay khi biết, kèm ba thứ: trễ bao lâu, vì sao, và hai phương án đánh đổi. Báo sớm là tin xấu; báo muộn là mất niềm tin. Điều tệ nhất là hứa "tuần này xong" lần thứ ba.
- *"Cân bằng số làm lúc nào?"* → Từ M2, không phải hai tuần cuối. Cân bằng cần nhiều lượt chơi thật để có dữ liệu; dồn vào cuối thì chỉ kịp chỉnh theo cảm giác.

**Cờ đỏ**

- Tiêu chí mốc dạng "hoàn thiện", "tối ưu", "đảm bảo mượt mà".
- Vertical slice chạy bằng dữ liệu giả và server giả.
- "Chúng tôi không khoá tính năng, làm tới đâu hay tới đó."
- Không biết bao nhiêu bug đang mở.
- Báo trễ ở tuần cuối cùng.

**Số / ví dụ nên thuộc**

- M1 ở 20–25% thời gian · M2 ở 50–60% · M3 ở 75–80%.
- Task ước lượng quá **3 ngày** là chưa chia đủ nhỏ.
- Bug mở nhiều hơn đóng **3 tuần liền** là lúc dừng làm tính năng.
- Nhịp tuần tối thiểu: một build chơi được, 20 phút cả đội chơi, ba con số.

**Kể trong dự án**

- *"Anh có tham gia lập kế hoạch không?"* → Nếu không, kể **cái bạn chủ động thêm vào**: danh sách kiểm tra trước mốc, hay thói quen build hằng tuần. Sáng kiến quy trình từ người không phải quản lý được đánh giá cao hơn bạn nghĩ.
- *"Khó khăn gặp phải?"* → Mẫu tốt: mốc tuyên bố đạt trên giấy nhưng khi cài lên máy thật thì hỏng, vì cả đội test trong Editor. Kể cách bạn đưa bước "cài lên máy thật" thành điều kiện bắt buộc.
- *"Dự án có kịp hạn không?"* → Nếu trễ thì nói thẳng trễ bao lâu và vì sao. Người phỏng vấn đã làm dự án trễ rồi; họ đánh giá cách bạn phản ứng, không đánh giá việc trễ.
