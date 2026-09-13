---
id: arena-async
title: Arena Async — blueprint tham chiếu
summary: Một GDD đã điền đầy đủ cho game PvP bất đồng bộ có server thật — dùng làm ví dụ mẫu, và làm hệ thống cụ thể để kể khi đi phỏng vấn.
status: deep
read: 155
level: intermediate
order: 30
tags: [blueprint, client-server, pvp, reference]
related: [gdd-template, project, client-server-flow, project-postmortem]
---

> **Đây là blueprint tham chiếu, không phải dự án đang làm.** Nó tồn tại vì hai lý do:
> làm một ví dụ **đã điền đầy đủ** để đối chiếu khi bạn điền [[gdd-template]] cho game
> của mình; và làm một **hệ thống cụ thể** để bám vào khi trả lời phỏng vấn, thay vì
> nói lý thuyết chung chung — xem [[project-postmortem]].
>
> Đừng để agent thực thi file này. GDD của dự án thật nằm ở file riêng.

Chọn thể loại PvP bất đồng bộ là có chủ ý: nó chạm **mọi thứ phía server** — tài khoản, ví, IAP, master data, ghép trận, bảng xếp hạng, mùa giải — mà **không** cần netcode realtime. Nhờ vậy nó là ví dụ nhỏ nhất còn đủ để nói chuyện kiến trúc cho ra hồn.

## 0. TL;DR

Game đấu đội hình theo lượt, mobile. Người chơi dựng đội 5 nhân vật rồi thách đấu **đội hình phòng thủ** của người khác — đối thủ không cần online. Mỗi trận khoảng 90 giây, mô phỏng ở server, client chỉ phát lại. Mùa giải 4 tuần, phần thưởng theo hạng.

## 1. Design Pillars — BẤT KHẢ XÂM PHẠM

1. **Một phiên là 3 phút.** Mọi tính năng phải vừa một lần mở app lúc chờ xe. Thứ gì cần ngồi 20 phút thì không thuộc game này.
2. **Thua vì đội hình, không vì phản xạ.** Quyết định nằm ở lúc dựng đội, không ở lúc đánh. Không có thao tác thời gian thực trong trận.
3. **Người không trả tiền vẫn leo được hạng cao nhất**, chỉ chậm hơn. Tiền mua **tốc độ**, không mua **trần sức mạnh**.

## 2. Core Loop

**Micro (90 giây)** — chọn đối thủ → xem trận mô phỏng → nhận thưởng → điều chỉnh đội.

**Mid (1 tuần)** — tích tài nguyên, nâng nhân vật, đổi đội hình theo meta đang gặp.

**Macro (4 tuần)** — một mùa giải: leo hạng, chốt phần thưởng, reset một phần điểm.

Chi tiết nguyên lý ở [[core-loop]]; ở đây chỉ ghi quyết định cho game này.

## 3. Hệ thống

### 3.1 Trận đấu

- Server mô phỏng **toàn bộ** trận từ một seed và hai đội hình. Client nhận `(seed, đội A, đội B, kết quả)` rồi phát lại bằng chính logic hiển thị.
- Mô phỏng **xác định**: cùng seed cộng cùng đầu vào luôn cho cùng kết quả. Không dùng số thực trong logic chiến đấu, chỉ số nguyên.
- Client phát lại lệch với kết quả server thì **tin server** và nhảy tới kết quả cuối, kèm một dòng log gửi về để điều tra.

### 3.2 Đội hình phòng thủ

- Mỗi tài khoản có một đội hình phòng thủ **chốt lại tại thời điểm cuối cùng người chơi sửa nó**. Đối thủ đánh vào bản chốt đó, không phải bản đang sửa dở.
- Thua khi phòng thủ **không mất tài nguyên**, chỉ mất điểm hạng. Quyết định này bảo vệ pillar 3: người chơi ít online không bị rút cạn.

### 3.3 Kinh tế

- Hai loại tiền: **vàng** (rơi từ trận, dùng để nâng cấp) và **đá quý** (mua bằng tiền thật hoặc rơi rất chậm, dùng để rút ngắn thời gian chờ).
- Đá quý **không** mua được nhân vật mạnh hơn trần — nó chỉ mua lượt chơi thêm và rút ngắn nâng cấp. Xem [[economy-design]].
- Mọi thay đổi tài nguyên đi qua sổ cái append-only ([[game-database]]).

### 3.4 Ghép trận

- Tìm đối thủ theo điểm hạng, dải nới theo thời gian chờ, có trần — xem [[go-matchmaking]].
- Vì async nên "hàng đợi" thực chất là truy vấn danh sách ứng viên; không có ready check.
- Một đối thủ không bị nhiều người đánh cùng lúc quá một ngưỡng, để tránh một tài khoản bị bào.

### 3.5 Mùa giải

- 4 tuần. Cuối mùa chốt bảng xếp hạng từ Redis ZSET xuống Postgres, phát thưởng bằng **worker**, không phát trong request của người chơi.
- Điểm reset về một phần, không về 0 — giữ cảm giác tiến bộ giữa các mùa.

## 4. Nội dung

**Nhân vật** — 24 ở bản đầu, 4 vai trò (chắn, sát thương, hỗ trợ, phá giáp). Mỗi vai trò phải có ít nhất 2 lựa chọn dùng được ở hạng cao, nếu không meta chết.

**Cấp độ** — 10 cấp mỗi nhân vật. Đường cong chi phí nhân 1.6 mỗi cấp; con số này chốt sau khi mô phỏng, xem [[balancing-math]].

## 5. Ràng buộc kỹ thuật

| Hạng mục | Quyết định | Lý do |
|---|---|---|
| Client | Unity 2022 LTS, Android trước | Đội đã quen; iOS ở giai đoạn 2 |
| Server | Go — API stateless + worker, **không có room server** | Async nên không cần process giữ trận trong RAM |
| Giao thức | REST + JSON | Vài request mỗi phút mỗi người; debug bằng `curl` đáng giá hơn vài mili giây |
| Database | Postgres là nguồn chân lý; Redis cho ZSET xếp hạng và phiên | Xem [[game-database]] |
| Master data | Google Sheet → validator → bản có version | Designer chỉnh số không cần build lại; xem [[master-data]] |
| Mô phỏng trận | Chạy ở server, code Go viết riêng | Đánh đổi: phải giữ hai bản logic đồng bộ — xem mục 8 |
| Quy mô mục tiêu | 3.000 CCU tháng đầu | Một VPS đủ; xem [[go-deploy-ops]] |

Tuyến xuyên suốt của một phiên chơi theo đúng [[client-server-flow]], bỏ các mốc 11–12 vì không có WebSocket.

## 6. BẤT BIẾN — không vi phạm nếu chưa hỏi

- **INV-01** — Server là nguồn chân lý của mọi tài nguyên. Client không bao giờ gửi lên số lượng tiền hay vật phẩm.
- **INV-02** — Mọi lệnh làm đổi tài nguyên mang `request_id` do client sinh, `UNIQUE` ở database, ghi trong cùng transaction.
- **INV-03** — Kết quả trận do server tính từ seed. Client chỉ phát lại.
- **INV-04** — Thua khi phòng thủ không làm mất tài nguyên.
- **INV-05** — Không có cơ chế nào cho phép tiền thật vượt trần sức mạnh.
- **INV-06** — Mọi mốc thời gian dùng `now()` của server.
- **INV-07** — Master data chỉ publish theo version, không bao giờ `UPDATE` tại chỗ.

## 7. KHÔNG thuộc phạm vi

- **Realtime PvP.** Vi phạm pillar 1 và kéo theo room server, netcode, drain khi deploy.
- **Bang hội / chat.** Kéo theo kiểm duyệt nội dung và báo cáo vi phạm — một dự án riêng.
- **Giao dịch giữa người chơi.** Mở ra toàn bộ mảng chống gian lận kinh tế và rửa tài khoản.
- **Web/PC.** WebGL sẽ ép đổi quyết định về giao thức và dung lượng gói.

## 8. Nhật ký quyết định

**2026-03-02 — Mô phỏng trận ở server, không ở client.**
Chọn vì INV-03 và vì bảng xếp hạng có phần thưởng thật. Cái giá là **hai bản logic chiến đấu**: Go ở server để tính, C# ở client để phát lại. Chấp nhận vì logic chiến đấu theo lượt đủ nhỏ, và có bộ test dùng chung: 200 ca `(seed, đội A, đội B) → kết quả` chạy ở cả hai phía trong CI, lệch một ca là build đỏ.

**2026-03-09 — REST thay vì WebSocket.**
Async nên không có gì cần đẩy xuống theo thời gian thực. Thông báo kết quả trận phòng thủ dùng push notification, không cần giữ kết nối. Xem lại quyết định này nếu thêm chế độ realtime.

**2026-03-16 — Thua khi phòng thủ không mất tài nguyên.**
Bản thử nghiệm cho mất 10% vàng: người chơi mở app ít đi vì sợ lỗ, ngược hẳn mục tiêu. Bỏ hoàn toàn phần phạt.

## 9. Đang bỏ ngỏ

- ❓ Reset điểm cuối mùa: reset về bao nhiêu phần trăm? Cần dữ liệu từ mùa đầu.
- ❓ Có cho xem đội hình đối thủ trước khi đánh không? Xem trước làm giảm tính bất ngờ nhưng hợp pillar 2.
- ❓ TODO: chốt ngưỡng số lần một tài khoản bị đánh mỗi ngày.

## 🤖 Prompt cho AI

**Dùng AI thế nào với một blueprint đã điền**

Blueprint đầy đủ đổi hẳn cách làm việc với agent: thay vì mô tả lại game mỗi lần, bạn **chỉ tới file** và yêu cầu nó xác nhận ràng buộc trước khi viết code.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Xác nhận ràng buộc | Trước mỗi tính năng | "Đọc blueprint này, liệt kê bất biến nào áp dụng cho tính năng X" |
| Soi vi phạm | Sau khi có code | "Đoạn code này vi phạm bất biến nào trong mục 6?" |
| Sinh hợp đồng | Khi thêm luồng mới | "Từ mục 3.3, soạn `.proto` cho luồng mua, tuân thủ INV-02" |
| Đối chiếu phạm vi | Khi có đề xuất mới | "Tính năng này có rơi vào mục 7 không, và vi phạm pillar nào?" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Đây là blueprint tham chiếu hay dự án thật** — nếu tham chiếu, nói rõ để nó không đề xuất sửa file.
- **Tính năng cụ thể** đang làm, không hỏi chung chung.
- **Bất biến nào được phép nới** — mặc định là không cái nào.
- **Phần nào trong mục 9 đã chốt** kể từ khi file được viết.

**Mẫu prompt**

```
Đọc content/07-blueprints/arena-async.md. Đó là GDD tham chiếu — KHÔNG sửa file này.

Tôi cần làm luồng "nâng cấp nhân vật" (mục 3.3 và mục 4).

Việc 1: liệt kê bất biến nào ở mục 6 áp dụng cho luồng này, và mỗi cái ràng buộc điều gì cụ thể.
Việc 2: soạn thiết kế API cho luồng: endpoint, payload, mã lỗi, và chỗ đặt request_id.
Việc 3: chỉ ra chỗ nào trong mục 9 (đang bỏ ngỏ) chặn việc triển khai, nếu có.

Ràng buộc:
- KHÔNG đề xuất tính năng nằm trong mục 7.
- KHÔNG cho client gửi lên số vàng hoặc cấp sau nâng — vi phạm INV-01.
- Nếu thiết kế của tôi buộc phải vi phạm một bất biến, nói thẳng bất biến nào thay vì lách.
```

**Bẫy thường gặp:** agent đọc blueprint rồi vẫn đề xuất thứ nằm trong mục "Không thuộc phạm vi", vì thể loại này "thường có" — bang hội, chat, giao dịch. Bẫy thứ hai: nó coi bất biến là gợi ý và lách qua bằng cách đổi tên khái niệm. Bẫy thứ ba: nó sửa luôn file blueprint để khớp với code nó vừa viết, thay vì báo mâu thuẫn.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Kể một game anh đã làm và kiến trúc của nó.**
  → Dùng blueprint này làm khung nếu bạn chưa có dự án riêng đủ sâu, nhưng **nói rõ đó là dự án cá nhân hay bài tập**, đừng để người nghe tưởng là sản phẩm thương mại. Nêu thể loại, nền tảng, và một câu về ranh giới client–server, rồi để họ chọn chỗ đào tiếp.
- `Junior` **Vì sao mô phỏng trận ở server chứ không ở client?**
  → Vì bảng xếp hạng có phần thưởng thật, nên kết quả trận là thứ có giá trị — để client tính là mời người ta sửa. Server mô phỏng từ seed, client chỉ phát lại; lệch thì tin server. Cái giá phải trả là hai bản logic chiến đấu, và đó là một đánh đổi có ý thức chứ không phải lỡ tay.
- `Mid` **Hai bản logic ở hai ngôn ngữ thì giữ đồng bộ kiểu gì?**
  → Bằng bộ test dùng chung: khoảng 200 ca `(seed, đội A, đội B) → kết quả` chạy ở cả Go lẫn C# trong CI, lệch một ca là build đỏ. Không có cơ chế đó thì hai bản chắc chắn trôi xa nhau, và triệu chứng sẽ là người chơi thấy mình thắng còn server nói thua.
- `Mid` **Vì sao chọn REST thay vì WebSocket cho game này?**
  → Vì async: không có gì cần đẩy xuống theo thời gian thực, và mỗi người chỉ gọi vài request mỗi phút. REST đổi lại cho tôi khả năng debug bằng `curl` và đọc log proxy bằng mắt — đáng giá hơn nhiều so với vài chục mili giây không ai cảm nhận được. Thông báo kết quả trận phòng thủ dùng push notification.
- `Senior` **Ba pillar của game này ràng buộc kiến trúc thế nào?**
  → Pillar 1 (một phiên 3 phút) loại bỏ realtime, nên không có room server — kéo theo không phải drain khi deploy, hạ tầng gọn hẳn. Pillar 2 (thua vì đội hình) cho phép mô phỏng ở server thay vì đồng bộ theo tick. Pillar 3 (không trả tiền vẫn leo được) biến thành INV-05 và nó chặn mọi đề xuất bán sức mạnh sau này.
- `Senior` **Thua khi phòng thủ mà không mất gì — nghe như thiết kế mềm quá?**
  → Đó là kết quả đo được chứ không phải thiện chí. Bản thử cho mất 10% vàng khiến người chơi **mở app ít đi** vì sợ lỗ, ngược hẳn mục tiêu giữ chân. Phạt khi vắng mặt trừng phạt đúng nhóm người chơi bận rộn, tức là nhóm mà game một-phiên-ba-phút đang nhắm tới.

**Khung trả lời 60 giây** — "Kể kiến trúc của game này"

> Game PvP **bất đồng bộ**: người chơi thách đấu đội hình phòng thủ của người khác, đối thủ không cần online. Chính quyết định đó cắt bỏ toàn bộ netcode realtime — không có room server, nên cũng không có chuyện drain khi deploy.
>
> Phía server chỉ còn **API stateless và worker**, viết bằng Go, nói REST/JSON. Postgres là nguồn chân lý cho ví và tiến trình; Redis giữ bảng xếp hạng bằng ZSET và chốt xuống Postgres cuối mùa. Phát thưởng cuối mùa chạy ở worker, không chạy trong request của người chơi.
>
> Luật xuyên suốt là server tính kết quả trận từ một seed, client chỉ phát lại. Đổi lại tôi phải giữ hai bản logic chiến đấu đồng bộ, và tôi giải bằng 200 ca test dùng chung chạy ở cả hai phía trong CI.

**Họ sẽ đào tiếp**

- *"Vì sao mô phỏng phải xác định?"* → Vì client phát lại từ cùng seed và phải ra cùng kết quả. Nên logic chiến đấu chỉ dùng **số nguyên**, không dùng số thực — số thực làm kết quả lệch giữa hai nền tảng, và lệch thì người chơi thấy trận phát lại khác với kết quả họ nhận.
- *"Ghép trận async khác realtime chỗ nào?"* → Không có hàng đợi thật, chỉ là truy vấn danh sách ứng viên theo dải điểm hạng, và không có ready check vì đối thủ không online. Nhưng vẫn cần trần cho dải, và cần giới hạn số lần một tài khoản bị đánh mỗi ngày để không ai bị bào.
- *"Vì sao phát thưởng cuối mùa chạy ở worker?"* → Vì nó quét toàn bộ tài khoản. Chạy chung với API là ăn hết pool kết nối database và request của người chơi bắt đầu timeout — triệu chứng sẽ là "game lag mỗi đầu mùa" trong khi nguyên nhân nằm ở một job.
- *"Mục Không thuộc phạm vi để làm gì?"* → Để từ chối có căn cứ. Bang hội và chat kéo theo kiểm duyệt nội dung; giao dịch giữa người chơi kéo theo cả mảng chống rửa tài khoản. Viết ra trước thì lúc có đề xuất, cuộc thảo luận là về việc có đổi phạm vi hay không, chứ không phải về việc ai nhớ đúng.
- *"Nếu phải thêm realtime thì sao?"* → Đó là thay đổi kiến trúc, không phải thêm tính năng: thêm room server stateful, thêm WebSocket, thêm drain khi deploy, và phải xem lại pillar 1. Tôi sẽ đưa nó thành quyết định có ghi ngày và lý do, không lặng lẽ nhét vào.

**Cờ đỏ**

- Kể blueprint tham chiếu như thể đó là sản phẩm thương mại đã phát hành.
- Không giải thích được vì sao chọn async thay vì realtime.
- Nói "server tính hết cho an toàn" mà không nhận ra mình vừa nhận nợ hai bản logic.
- Không biết mục Bất biến để làm gì, hoặc coi nó là gợi ý.
- Dùng số thực trong logic mô phỏng rồi khẳng định nó xác định.

**Số / ví dụ nên thuộc**

- Phiên **3 phút**; trận **90 giây**; mùa **4 tuần**.
- 24 nhân vật, 4 vai trò, mỗi vai ít nhất 2 lựa chọn dùng được ở hạng cao.
- Chi phí nâng cấp nhân **1.6** mỗi cấp, 10 cấp.
- **200 ca** test dùng chung giữ hai bản logic đồng bộ.
- Quy mô mục tiêu **3.000 CCU** — một VPS đủ.

**Kể trong dự án**

- *"Đây là dự án thật hay bài tập?"* → Trả lời thẳng. Một dự án cá nhân được kể trung thực và có chiều sâu kỹ thuật tốt hơn nhiều so với một dự án thương mại được kể mập mờ — và người phỏng vấn phân biệt được hai thứ đó rất nhanh.
- *"Khó khăn gặp phải?"* → Với game kiểu này, khó khăn thật nhất là **hai bản logic trôi xa nhau**: client phát lại ra kết quả khác server. Kể cách bạn phát hiện qua báo cáo của người chơi và cách bộ test dùng chung chặn nó tái diễn.
- *"Anh sẽ đổi gì nếu làm lại?"* → Một câu trả lời thật và đáng giá: dựng bộ test dùng chung **ngay từ ca đầu tiên**, thay vì thêm sau khi đã lệch. Cùng một công sức, nhưng làm trước thì nó là lưới an toàn, làm sau thì nó là dọn hậu quả.
