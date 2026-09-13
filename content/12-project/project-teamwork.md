---
id: project-teamwork
title: Hai phía làm song song
summary: Contract-first, mock server dựng từ chính hợp đồng, ba môi trường, và cách nối hai phía hằng ngày thay vì dồn tích hợp vào tháng cuối.
status: deep
read: 960
level: intermediate
order: 60
tags: [project, teamwork, ci, mock, environment]
related: [project-contract, go-docker, unity-testing-ci, go-gamedev-tools]
---

Bài toán: người làm client cần API để test; người làm server cần client để biết API đúng chưa. Cả hai cùng chờ nhau.

Lối thoát tệ mà phổ biến: mỗi người làm phần mình bằng dữ liệu giả, hẹn "cuối tháng ghép". Tháng cuối thì phát hiện hai bên hiểu khác nhau về một nửa số message, và không còn thời gian.

Lối thoát đúng chỉ có một: **hợp đồng merge trước, code sau.**

## Contract-first, cụ thể là gì

<figure class="fig">
<svg viewBox="0 0 660 270" role="img" aria-label="Quy trình contract-first: file proto trong repo dùng chung, CI sinh code Go và C# và dựng mock server, client làm việc với mock trong khi server thật đang viết, mỗi đêm nối thử với server thật">
  <defs>
    <marker id="ptw-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="238" y="14"  width="184" height="54" rx="9" class="fig-box"/>
    <rect x="238" y="102" width="184" height="46" rx="9" class="fig-box"/>
    <rect x="22"  y="182" width="180" height="64" rx="9" class="fig-box"/>
    <rect x="238" y="182" width="184" height="64" rx="9" class="fig-box"/>
    <rect x="458" y="182" width="180" height="64" rx="9" class="fig-box"/>
  </g>
  <text x="330" y="36"  text-anchor="middle" class="fig-label" font-size="13">contract.proto</text>
  <text x="330" y="56"  text-anchor="middle" class="fig-muted" font-size="10">repo dùng chung · review trước khi merge</text>
  <text x="330" y="122" text-anchor="middle" class="fig-label" font-size="12">CI sinh code</text>
  <text x="330" y="140" text-anchor="middle" class="fig-muted" font-size="10">.go · .cs · mock server</text>
  <text x="112" y="206" text-anchor="middle" class="fig-label" font-size="12">Client Unity</text>
  <text x="112" y="224" text-anchor="middle" class="fig-muted" font-size="10">chạy với mock</text>
  <text x="112" y="240" text-anchor="middle" class="fig-muted" font-size="10">không chờ ai</text>
  <text x="330" y="206" text-anchor="middle" class="fig-label" font-size="12">Mock server</text>
  <text x="330" y="224" text-anchor="middle" class="fig-muted" font-size="10">dữ liệu mẫu · lỗi giả</text>
  <text x="330" y="240" text-anchor="middle" class="fig-muted" font-size="10">độ trễ giả 150ms</text>
  <text x="548" y="206" text-anchor="middle" class="fig-label" font-size="12">Server Go thật</text>
  <text x="548" y="224" text-anchor="middle" class="fig-muted" font-size="10">viết song song</text>
  <text x="548" y="240" text-anchor="middle" class="fig-muted" font-size="10">nối thử mỗi đêm</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#ptw-a)" fill="none">
    <path d="M330 68 V96"/>
    <path d="M300 148 Q240 148 240 176"/>
    <path d="M330 148 V176"/>
    <path d="M360 148 Q420 148 420 176"/>
    <path d="M202 214 H232"/>
  </g>
</svg>
<figcaption>Mock server sinh ra từ chính hợp đồng, không viết tay. Hợp đồng đổi thì mock đổi theo — không có chỗ cho chúng lệch nhau.</figcaption>
</figure>

Quy trình cụ thể, bốn bước, áp dụng cho mỗi nhóm tính năng:

1. **Bàn hợp đồng trước khi code.** 30 phút hai người ngồi với nhau, viết `.proto` cho nhóm message sắp làm. Đây là cuộc họp đáng giá nhất trong tuần.
2. **Merge hợp đồng.** CI sinh `.go`, `.cs`, và mock server. Từ giờ hai phía có cùng một định nghĩa.
3. **Làm song song.** Client cắm vào mock, server viết thật. Không ai chờ ai.
4. **Nối thử hằng ngày.** Client đổi sang server thật ở môi trường dev, chạy một lượt. Lệch gì lộ ra trong ngày, không phải trong tháng.

Bước 4 là bước hay bị bỏ vì "chưa xong đâu, nối làm gì". Chính vì chưa xong nên mới phải nối — lỗi tìm được lúc còn ít code thì rẻ.

## Mock server: đừng viết tay

Mock viết tay lệch với hợp đồng sau hai tuần, và khi đó nó tệ hơn không có mock — client được thử với thứ không tồn tại.

Sinh mock từ hợp đồng, và cho nó ba khả năng mà server thật khó tạo ra theo ý muốn:

| Khả năng | Vì sao cần | Cách dùng |
|---|---|---|
| **Độ trễ giả** | Mạng thật là 4G 150ms, không phải localhost 1ms | Đặt mặc định 150ms, đừng để 0 |
| **Lỗi theo yêu cầu** | Phải test được nhánh hỏng | Một tham số để ép trả về mã lỗi bất kỳ |
| **Dữ liệu biên** | Túi đồ đầy, tên dài nhất, số lớn nhất | Vài bộ dữ liệu mẫu đặt sẵn |

Client chạy với mock có độ trễ 150ms từ ngày đầu sẽ có UI **thiết kế đúng ngay từ đầu** — có trạng thái chờ, có khoá nút chống bấm hai lần. Client chạy với mock 0ms sẽ có UI giả định mọi thứ tức thì, và phải sửa lại toàn bộ khi gặp mạng thật.

## Ba môi trường, không hơn

| Môi trường | Ai dùng | Dữ liệu | Deploy khi nào |
|---|---|---|---|
| **dev** | Lập trình viên | Giả, xoá bất cứ lúc nào | Mỗi lần merge |
| **staging** | Cả đội, QA, designer | Giống thật, ẩn danh | Trước mỗi mốc |
| **prod** | Người chơi | Thật | Có kế hoạch |

Đội nhỏ thường muốn bỏ staging. Đừng — đó là chỗ duy nhất thử được **migration database** và **quy trình deploy** trước khi làm thật. Bỏ staging nghĩa là lần đầu bạn chạy migration thật là trên dữ liệu người chơi.

Ngược lại, đừng thêm môi trường thứ tư. Mỗi môi trường là một thứ phải bảo trì, và môi trường không ai dùng thì luôn hỏng đúng lúc cần.

Cách rẻ nhất để dựng dev giống nhau ở mọi máy: một file compose, một lệnh. Xem [[go-docker]].

## Chia việc theo chiều dọc, không theo tầng

Cách chia hay gặp và sai: "anh làm toàn bộ client, tôi làm toàn bộ server". Nghe hợp lý, nhưng nó tạo ra hai người không bao giờ ghép việc cho tới cuối.

Chia đúng: **theo tính năng, xuyên hai phía**.

| Chia sai | Chia đúng |
|---|---|
| A: tất cả UI · B: tất cả API | A: luồng shop (cả hai phía) · B: luồng ghép trận (cả hai phía) |
| Ghép ở tháng cuối | Mỗi tính năng ghép xong trong tuần |
| Mỗi người mù một nửa hệ thống | Mỗi người hiểu trọn một luồng |

Với đội hai người khác chuyên môn rõ rệt, thoả hiệp thực dụng: vẫn chia theo tính năng, nhưng người mạnh phía nào làm phần nặng phía đó — và **cùng nhau đưa tính năng tới trạng thái chạy được**, không tuyên bố xong khi mới xong nửa của mình.

## Ra khỏi chặng này với cái gì

- [ ] Repo hợp đồng, CI sinh code hai phía, không ai sửa file sinh ra
- [ ] Mock server sinh tự động, có độ trễ giả 150ms mặc định
- [ ] Ba môi trường dựng được bằng một lệnh
- [ ] Lịch nối thử hằng ngày ở dev
- [ ] Việc chia theo tính năng xuyên hai phía, không chia theo tầng

## Bẫy thường gặp

- **Mock viết tay.** Lệch hợp đồng lặng lẽ, và client tin vào thứ không có thật.
- **Mock không độ trễ.** Sinh ra UI giả định mọi thứ tức thì.
- **Bỏ staging.** Migration đầu tiên chạy thẳng trên dữ liệu người chơi.
- **Nối thử theo tuần thay vì theo ngày.** Lỗi tích tụ, và mỗi lần nối thành một buổi gỡ rối dài.
- **"Xong phần tôi rồi"** khi tính năng chưa chạy được từ đầu tới cuối — đó là định nghĩa xong tệ nhất trong dự án hai phía.

## 🤖 Prompt cho AI

**Dùng AI thế nào khi hai phía làm song song**

Việc hợp nhất: AI viết **mock server, dữ liệu mẫu và test tích hợp** — ba thứ ai cũng biết là cần, ai cũng hoãn vì chán.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Sinh mock | Ngay sau khi merge hợp đồng | "Từ file proto này, viết mock server Go có độ trễ giả và tham số ép lỗi" |
| Sinh dữ liệu biên | Khi làm UI | "Sinh 5 bộ dữ liệu mẫu cho màn túi đồ: rỗng, đầy, tên dài nhất, số lớn nhất, đang chờ đồng bộ" |
| Viết test tích hợp | Trước mỗi lần nối thử | "Viết test chạy trọn luồng mua hàng qua HTTP thật, kể cả nhánh không đủ tiền" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Hợp đồng hiện tại** — dán file vào, đừng mô tả bằng lời.
- **Mock cần giả lập lỗi nào** — không nói thì nó chỉ làm đường thành công.
- **Độ trễ mục tiêu**, nếu không nó để 0.
- **Dữ liệu mẫu phải phản ánh biên nào** của game bạn.

**Mẫu prompt**

```
Đây là contract.proto hiện tại: <dán>.

Việc: viết mock server Go phục vụ toàn bộ message trong file này.
Yêu cầu:
- Độ trễ mặc định 150ms, đổi được bằng biến môi trường.
- Header X-Mock-Error=<mã lỗi> thì trả về đúng lỗi đó thay vì kết quả bình thường.
- 5 tài khoản mẫu: mới tinh, túi đầy, nhiều tiền, đang bị khoá, đã có trận đang dở.
- Giữ trạng thái trong RAM, có endpoint reset.

Ràng buộc:
- CHỈ dùng thư viện chuẩn, không thêm dependency.
- KHÔNG tự thêm message không có trong contract.
- Mỗi handler một hàm, đặt tên theo đúng tên message.
```

**Bẫy thường gặp:** AI viết mock chỉ có đường thành công, độ trễ 0, và trả về dữ liệu đẹp — loại mock khiến client nhìn ổn cho tới ngày gặp mạng thật. Bẫy thứ hai: nó thêm message không có trong hợp đồng vì "sẽ cần", và thế là hai phía lệch nhau qua chính công cụ sinh ra để chống lệch.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Chưa có API thì anh làm client kiểu gì?**
  → Tôi không chờ API, tôi chờ hợp đồng — và hợp đồng chỉ tốn nửa buổi để chốt. Sau khi merge `.proto`, CI sinh code hai phía và sinh luôn mock server, client cắm vào mock làm thật. Điểm mấu chốt là mock **sinh ra từ hợp đồng**, không viết tay, nếu không thì hai tuần sau nó lệch và client đang test với thứ không tồn tại.
- `Junior` **Mock server nên đặt độ trễ bao nhiêu?**
  → Khoảng 150ms, xấp xỉ 4G thật, và luôn có tham số ép trả về lỗi. Mock 0ms sinh ra UI giả định mọi thứ tức thì — không trạng thái chờ, không khoá nút chống bấm hai lần — và toàn bộ phần đó phải viết lại khi gặp mạng thật. Mock phải khó bằng hoặc hơn thật, không được dễ hơn.
- `Mid` **Contract-first nghĩa là gì trong thực tế hằng ngày?**
  → Bốn bước cho mỗi nhóm tính năng: hai bên ngồi 30 phút viết `.proto`; merge để CI sinh code và mock; hai phía làm song song; và nối thử hằng ngày ở môi trường dev. Bước cuối hay bị bỏ vì "chưa xong đâu nối làm gì" — nhưng chính vì chưa xong nên mới phải nối, lỗi tìm lúc còn ít code thì rẻ.
- `Mid` **Dự án của anh có mấy môi trường, mỗi cái để làm gì?**
  → Ba: dev cho lập trình viên với dữ liệu giả xoá lúc nào cũng được, staging giống thật cho QA và designer, prod cho người chơi. Không bỏ staging vì đó là chỗ duy nhất thử migration database và quy trình deploy trước khi làm thật — bỏ nó nghĩa là lần đầu bạn chạy migration thật là trên dữ liệu người chơi.
- `Senior` **Hai người hai phía, anh chia việc thế nào?**
  → Theo tính năng xuyên hai phía, không theo tầng. Chia "anh làm hết client, tôi làm hết server" tạo ra hai người mù một nửa hệ thống và chỉ gặp nhau ở tháng cuối. Chia theo luồng — một người ôm trọn luồng shop, một người ôm trọn luồng ghép trận — thì mỗi tuần có một thứ chạy được từ đầu tới cuối.
- `Senior` **Tích hợp hai phía luôn đau. Anh làm gì để nó bớt đau?**
  → Chuyển đau từ một cục lớn ở cuối thành nhiều vết nhỏ hằng ngày: nối thử mỗi ngày dù chưa xong, và định nghĩa "xong" là chạy được từ client tới database chứ không phải "xong phần tôi". Cộng thêm mock sinh từ hợp đồng để hai bên không bao giờ hiểu khác nhau về cùng một field.

**Khung trả lời 60 giây** — "Chưa có API thì làm client kiểu gì?"

> Tôi không chờ API, tôi chờ **hợp đồng** — và hợp đồng chỉ tốn nửa buổi để chốt. Hai bên ngồi viết `.proto` cho nhóm message sắp làm, merge, rồi CI sinh code cho cả hai phía **và sinh luôn mock server**.
>
> Từ đó client cắm vào mock và làm thật. Điểm mấu chốt là mock **sinh ra từ hợp đồng**, không viết tay — viết tay thì hai tuần sau nó lệch và client đang test với thứ không tồn tại.
>
> Mock của tôi luôn đặt độ trễ giả 150ms và có tham số ép lỗi. Nhờ vậy UI có trạng thái chờ và xử lý lỗi **ngay từ đầu**, thay vì phải sửa lại toàn bộ khi gặp mạng 4G thật.

**Họ sẽ đào tiếp**

- *"Nối thử bao lâu một lần?"* → Hằng ngày ở môi trường dev, kể cả khi chưa xong. Chưa xong mới càng phải nối: lỗi tìm lúc còn ít code thì rẻ. Để hai tuần mới nối thì mỗi lần nối là một buổi gỡ rối dài.
- *"Mấy môi trường?"* → Ba: dev cho lập trình viên, staging giống thật cho QA và designer, prod cho người chơi. Không bỏ staging vì đó là chỗ duy nhất thử migration và quy trình deploy trước khi làm thật. Và không thêm cái thứ tư, vì môi trường không ai dùng thì luôn hỏng đúng lúc cần.
- *"Chia việc theo tầng hay theo tính năng?"* → Theo tính năng, xuyên hai phía. Chia theo tầng tạo ra hai người mù một nửa hệ thống và chỉ gặp nhau ở tháng cuối. Theo tính năng thì mỗi tuần có một luồng chạy được từ đầu tới cuối.
- *"Xong nghĩa là gì trong đội anh?"* → Chạy được từ client tới database ở môi trường dev, có người khác thử lại. "Xong phần tôi" không phải xong — đó là định nghĩa làm hỏng mọi dự án hai phía.
- *"Mock có nguy hiểm không?"* → Có, nếu nó dễ hơn thật: không trễ, không lỗi, dữ liệu luôn đẹp. Nên mock phải khó **bằng hoặc hơn** thật — trễ 150ms, ép được lỗi, có dữ liệu biên xấu xí.

**Cờ đỏ**

- "Chúng tôi làm riêng rồi ghép cuối tháng."
- Mock viết tay và không đồng bộ với hợp đồng.
- Chỉ có môi trường dev và prod.
- Không có định nghĩa "xong" chung cho cả hai phía.
- Test toàn bộ trên localhost với độ trễ bằng không.

**Số / ví dụ nên thuộc**

- Mock đặt độ trễ giả **150ms** — xấp xỉ 4G thật, không phải localhost.
- Ba môi trường: dev · staging · prod.
- Nối thử: **hằng ngày**, không phải hằng tuần.
- Bàn hợp đồng trước mỗi nhóm tính năng: khoảng **30 phút**.

**Kể trong dự án**

- *"Anh làm việc với người phía kia thế nào?"* → Kể **cơ chế**, không kể cảm xúc: buổi chốt hợp đồng, mock sinh tự động, lịch nối thử. Người phỏng vấn nghe ra ngay bạn đã ở trong dự án hai phía thật hay chưa.
- *"Khó khăn gặp phải?"* → Mẫu tốt: hai bên hiểu khác nhau về một field — ví dụ `timestamp` là giây hay mili giây, hoặc giá đã trừ khuyến mãi hay chưa. Kể cách phát hiện và cách bạn ngăn tái diễn bằng việc ghi đơn vị vào tên field.
- *"Anh đề xuất thay đổi gì cho quy trình?"* → Nếu bạn đưa mock server hay lịch nối thử vào đội, đó là câu trả lời tốt. Đóng góp quy trình khó thấy trên CV nhưng rất dễ kể thành câu chuyện có trước-có sau.
