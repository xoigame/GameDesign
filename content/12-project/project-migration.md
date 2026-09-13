---
id: project-migration
title: Migration — schema, master data và save
summary: Ba tầng migration với ba nhịp khác nhau, mô hình expand–contract để deploy không rớt, backfill dữ liệu triệu dòng mà không khoá bảng, và migration save ở phía client.
status: deep
read: 945
level: advanced
order: 45
tags: [project, migration, database, schema, save]
related: [game-database, project-contract, unity-save-data, go-deploy-ops]
---

Migration là mảnh bị nhắc ở khắp nơi mà không ai sở hữu: [[game-database]] nói phải có, [[go-docker]] nói chạy ở đâu, [[go-deploy-ops]] nói chạy lúc nào. Node này nói **làm thế nào**.

Và trước hết là làm rõ một chuyện: **"migration" trong một dự án game là ba thứ khác nhau**, ba nhịp, ba cách rollback. Gộp chúng lại là nguồn gốc của phần lớn nhầm lẫn.

## Ba tầng, ba nhịp

| | Schema database | Master data | Save / dữ liệu client |
|---|---|---|---|
| Đổi cái gì | Cấu trúc bảng | Bảng cân bằng | Cấu trúc file save |
| Ai chạy | Lập trình server | Designer publish | Chính client, lúc mở app |
| Nhịp | Vài lần một tháng | Hằng ngày | Theo bản phát hành |
| Rollback | **Khó** — phải viết đường lùi | Đổi con trỏ version, tức thì | **Không có** — đã chạy là xong |
| Sai thì | Mất dữ liệu, hỏng deploy | Số sai, sửa lại là xong | **Mất save của người chơi** |
| Node chi tiết | Node này | [[master-data]] | [[unity-save-data]] |

Cột thứ ba đáng sợ nhất vì không có đường lùi: bản client đã chạy migration save rồi thì không quay lại được, và bạn không có quyền truy cập máy người chơi để sửa.

## Schema: luật nền

Bốn luật, và chúng giải quyết gần hết vấn đề:

1. **Một file, một thay đổi, đánh số tăng dần.** `0001_init.sql`, `0002_add_wallet.sql`. File đã merge thì **không bao giờ sửa** — sửa nghĩa là máy đã chạy rồi sẽ khác máy chưa chạy.
2. **Chạy như một bước riêng**, không phải trong `main()` của server. Scale lên N bản là N lần migration chạy cùng lúc.
3. **Chạy được hai lần cho cùng kết quả.** Công cụ migration lo việc này bằng bảng ghi nhận, nhưng bản thân câu lệnh nên phòng thủ: `IF NOT EXISTS` ở chỗ dùng được.
4. **Luôn tương thích ngược một bậc.** Trong lúc deploy, bản cũ và bản mới cùng đọc một database — xem [[go-deploy-ops]].

Luật 4 là luật sinh ra toàn bộ phần dưới.

## Expand–contract: đổi schema mà không rớt ai

Đây là mô hình cần thuộc. Đổi một cột không bao giờ là một lần deploy, nó là **ba** — trải qua hai hoặc ba lần phát hành.

<figure class="fig">
<svg viewBox="0 0 680 280" role="img" aria-label="Ba giai đoạn expand contract khi đổi tên cột: expand thêm cột mới và ghi cả hai, migrate chuyển dữ liệu cũ sang cột mới, contract xoá cột cũ sau khi không còn bản nào dùng">
  <defs>
    <marker id="pmg-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="14"  y="52" width="200" height="150" rx="9" class="fig-box"/>
    <rect x="240" y="52" width="200" height="150" rx="9" class="fig-box"/>
    <rect x="466" y="52" width="200" height="150" rx="9" class="fig-box"/>
  </g>
  <text x="114" y="34"  text-anchor="middle" class="fig-label" font-size="13">1 · EXPAND</text>
  <text x="340" y="34"  text-anchor="middle" class="fig-label" font-size="13">2 · MIGRATE</text>
  <text x="566" y="34"  text-anchor="middle" class="fig-label" font-size="13">3 · CONTRACT</text>
  <text x="114" y="78"  text-anchor="middle" class="fig-muted" font-size="11">Thêm cột mới, cho phép NULL</text>
  <text x="114" y="100" text-anchor="middle" class="fig-muted" font-size="11">Code ghi vào CẢ HAI cột</text>
  <text x="114" y="122" text-anchor="middle" class="fig-muted" font-size="11">Code đọc từ cột CŨ</text>
  <text x="114" y="156" text-anchor="middle" class="fig-muted" font-size="10">Bản cũ vẫn chạy bình thường</text>
  <text x="114" y="178" text-anchor="middle" class="fig-muted" font-size="10">Rollback: an toàn</text>
  <text x="340" y="78"  text-anchor="middle" class="fig-muted" font-size="11">Backfill theo lô</text>
  <text x="340" y="100" text-anchor="middle" class="fig-muted" font-size="11">Đối soát hai cột khớp nhau</text>
  <text x="340" y="122" text-anchor="middle" class="fig-muted" font-size="11">Chuyển sang đọc cột MỚI</text>
  <text x="340" y="156" text-anchor="middle" class="fig-muted" font-size="10">Vẫn ghi cả hai — chưa bỏ được</text>
  <text x="340" y="178" text-anchor="middle" class="fig-muted" font-size="10">Rollback: an toàn</text>
  <text x="566" y="78"  text-anchor="middle" class="fig-muted" font-size="11">Ngừng ghi cột cũ</text>
  <text x="566" y="100" text-anchor="middle" class="fig-muted" font-size="11">Chờ — không còn bản nào dùng</text>
  <text x="566" y="122" text-anchor="middle" class="fig-muted" font-size="11">DROP COLUMN</text>
  <text x="566" y="156" text-anchor="middle" class="fig-muted" font-size="10">Sau bước này mới hết đường lùi</text>
  <text x="566" y="178" text-anchor="middle" class="fig-muted" font-size="10">Rollback: KHÔNG</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#pmg-a)" fill="none">
    <path d="M214 127 H236"/>
    <path d="M440 127 H462"/>
  </g>
  <text x="340" y="236" text-anchor="middle" class="fig-muted" font-size="11">Mỗi mũi tên là một lần phát hành riêng. Nhảy thẳng từ 1 sang 3 là cách mất dữ liệu nhanh nhất.</text>
  <text x="340" y="260" text-anchor="middle" class="fig-muted" font-size="10">Với client trên store, khoảng cách 2 → 3 tính bằng tháng, không phải ngày</text>
</svg>
<figcaption>Chi phí của expand–contract là sự chờ đợi, không phải công sức. Hãy lên kế hoạch cho việc chờ thay vì ngạc nhiên vì nó.</figcaption>
</figure>

Ví dụ cụ thể — đổi `gold` từ `int` sang `bigint` vì số tràn:

```sql
-- 0012_expand_gold.sql — giai đoạn EXPAND
ALTER TABLE wallet ADD COLUMN IF NOT EXISTS gold_v2 bigint;
-- Code deploy cùng lần này: ghi cả gold và gold_v2, vẫn đọc gold.

-- 0013_backfill_gold.sql — giai đoạn MIGRATE, chạy theo lô
UPDATE wallet SET gold_v2 = gold
WHERE gold_v2 IS NULL AND user_id IN (
  SELECT user_id FROM wallet WHERE gold_v2 IS NULL LIMIT 5000
);
-- Lặp tới khi không còn dòng nào. Đối soát trước khi đi tiếp:
-- SELECT count(*) FROM wallet WHERE gold_v2 IS DISTINCT FROM gold;  -- phải ra 0

-- 0014_contract_gold.sql — giai đoạn CONTRACT, sau khi chắc chắn
ALTER TABLE wallet DROP COLUMN gold;
ALTER TABLE wallet RENAME COLUMN gold_v2 TO gold;
```

Ba file, ba lần deploy. Làm một lần thì trong vài giây lúc deploy sẽ có một bản đọc cột không còn tồn tại — và đó là vài giây có người chơi đang mua đồ.

## Backfill triệu dòng mà không khoá bảng

`UPDATE` một phát trên bảng lớn khoá bảng đủ lâu để mọi request timeout. Luật:

- **Theo lô**, mỗi lô vài nghìn dòng, nghỉ giữa các lô.
- **Chạy ở worker**, không chạy trong migration đồng bộ và tuyệt đối không trong request người chơi.
- **Chạy lại được từ đầu**: điều kiện lô phải dựa trên trạng thái (`WHERE gold_v2 IS NULL`) chứ không dựa trên offset — worker chết giữa chừng là chuyện thường.
- **Đối soát trước khi contract.** Một truy vấn đếm chênh lệch, phải ra 0.

Riêng với `ALTER TABLE` trên Postgres: thêm cột cho phép `NULL` là thao tác rẻ; thêm cột `NOT NULL` có giá trị mặc định thì tuỳ phiên bản mà có thể phải viết lại cả bảng. Kiểm trên bản sao dữ liệu thật trước, đừng kiểm trên bảng rỗng ở máy mình.

## Master data: migration kiểu khác hẳn

Master data **không migrate**, nó **publish version mới** — xem [[master-data]]. Nhưng có một tình huống giao với schema, và nó hay bị bỏ sót:

Khi thêm một cột vào bảng master (ví dụ `item` có thêm `element`), bạn cần cả hai: một migration schema cho cột mới, **và** một quyết định cho các bản master cũ đang được tham chiếu. Cách đơn giản nhất là cột mới có giá trị mặc định hợp lý, để bản cũ vẫn đọc được mà không cần sinh lại.

Điều không bao giờ được làm: **đổi ý nghĩa của một `id` đã phát hành**. `sword_iron` là kiếm sắt vĩnh viễn. Cần thứ khác thì thêm id mới — id nằm trong save của người chơi và trong sổ cái, đổi nghĩa là làm sai lệch lịch sử.

## Save phía client: tầng không có đường lùi

Client cũng có migration, và nó nguy hiểm hơn vì chạy trên máy người chơi:

- **Mọi save có `version`** ngay từ bản đầu tiên. Thiếu nó thì bản thứ hai đã kẹt.
- **Migration theo chuỗi**: v1→v2→v3, mỗi bước một hàm nhỏ. Đừng viết hàm nhảy thẳng v1→v3, nó sẽ nhân đôi khi có v4.
- **Sao lưu file cũ trước khi migrate.** Migration lỗi thì còn đường khôi phục — đây là thứ duy nhất thay cho rollback ở tầng này.
- **Test bằng save thật của bản cũ**, giữ lại một bộ save mẫu cho mỗi bản đã phát hành.
- **Save không đọc được thì không được crash.** Xử lý như tài khoản mới và ghi log, đừng để app chết ở màn hình đầu.

Chi tiết ở [[unity-save-data]]. Điểm nối với node này: nếu dữ liệu quan trọng nằm ở server ([[project-architecture]]) thì tầng này chỉ còn giữ cài đặt và cache — và đó là lý do mạnh để đặt ranh giới đúng ngay từ đầu.

## Ra khỏi chặng này với cái gì

- [ ] Thư mục `migrations/` đánh số, file đã merge không bao giờ sửa
- [ ] Migration là bước riêng trong quy trình deploy, không nằm trong `main()`
- [ ] Đã chạy thử migration **và rollback** trên staging với dữ liệu giống thật
- [ ] Mọi thay đổi cột dùng expand–contract, có kế hoạch ba lần deploy
- [ ] Backfill chạy theo lô ở worker, có truy vấn đối soát
- [ ] Save client có `version` và chuỗi migration, có sao lưu trước khi chạy
- [ ] Bộ save mẫu của mỗi bản đã phát hành, dùng để test

## Bẫy thường gặp

- **Sửa file migration đã merge.** Máy đã chạy khác máy chưa chạy, và không ai phát hiện cho tới lúc sự cố.
- **Auto-migrate lúc server khởi động.** N bản chạy cùng lúc khi scale.
- **Đổi cột trong một lần deploy.** Vài giây có bản đọc cột không còn.
- **`UPDATE` một phát trên bảng triệu dòng.** Khoá bảng, mọi request timeout.
- **Backfill dựa trên offset.** Worker chết giữa chừng là bỏ sót hoặc làm trùng.
- **Save không có version.** Bản thứ hai đã kẹt và không có đường ra sạch.
- **Chỉ test migration trên bảng rỗng.** Thứ chết người là thời gian khoá trên dữ liệu thật.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho migration**

AI viết SQL migration tốt, nhưng **mặc định của nó là nguy hiểm**: nó gộp mọi thay đổi vào một file và giả định không có ai đang dùng hệ thống. Luôn nói rõ rằng có người chơi đang online.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Chia expand–contract | Mỗi lần đổi cột | "Chia thay đổi này thành các lần deploy, mỗi lần rollback được" |
| Viết backfill | Khi có dữ liệu cũ | "Viết backfill theo lô, chạy lại được, kèm truy vấn đối soát" |
| Soi rủi ro khoá bảng | Trước khi chạy thật | "Lệnh nào ở đây khoá bảng, và bao lâu trên 2 triệu dòng?" |
| Chuỗi migration save | Khi đổi cấu trúc save | "Viết chuỗi migration v3→v4 cho class SaveData này" |

**Phải nêu rõ** (thiếu là AI tự bịa):
- **Có người chơi đang online không** — không nói thì nó viết migration kiểu dừng dịch vụ.
- **Kích thước bảng thật** — quyết định có cần backfill theo lô hay không.
- **Phiên bản database** — hành vi `ALTER TABLE` khác nhau giữa các bản Postgres.
- **Bản client cũ nhất còn phải đỡ** — quyết định khi nào được contract.

**Mẫu prompt**

```
PostgreSQL 16. Bảng wallet có 2 triệu dòng. Có người chơi online 24/7, KHÔNG được dừng dịch vụ.
Client cũ nhất còn phải hỗ trợ: bản phát hành 3 tháng trước.

Thay đổi tôi cần: đổi cột gold từ int sang bigint.

Việc 1: chia thành các lần deploy theo expand–contract. Mỗi lần ghi rõ:
file SQL | code phải đổi gì | rollback được không | điều kiện để đi tiếp.
Việc 2: viết backfill theo lô 5000 dòng, chạy lại được từ đầu, kèm truy vấn đối soát.
Việc 3: chỉ ra lệnh nào khoá bảng và ước lượng thời gian khoá trên 2 triệu dòng.

Ràng buộc:
- KHÔNG gộp expand và contract vào một lần deploy.
- KHÔNG dùng offset/limit làm điều kiện lô — phải dựa trên trạng thái dòng.
- Backfill chạy ở worker, KHÔNG trong migration đồng bộ.
- Nêu rõ bước nào là điểm không quay lại được.
```

**Bẫy thường gặp:** AI viết một file `ALTER TABLE ... ALTER COLUMN TYPE` gọn gàng và đúng cú pháp — nó sẽ khoá bảng và làm sập game giờ cao điểm. Bẫy thứ hai: backfill dùng `LIMIT/OFFSET`, chạy lại sau khi worker chết là bỏ sót dòng. Bẫy thứ ba: nó viết hàm migration save nhảy thẳng từ version cũ nhất lên mới nhất, thay vì chuỗi từng bước.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao migration không chạy lúc server khởi động?**
  → Vì khi scale lên nhiều bản, tất cả cùng chạy migration một lúc và bạn không kiểm soát được thời điểm. Migration phải là một bước riêng trong quy trình deploy, chạy một lần, xong rồi mới khởi động server. Trong compose thì đó là service chạy một lần với `service_completed_successfully`.
- `Junior` **Vì sao không sửa file migration đã merge?**
  → Vì máy đã chạy file cũ sẽ khác máy chưa chạy, mà công cụ migration chỉ ghi nhận "file này đã chạy" chứ không kiểm tra nội dung. Hai môi trường lệch schema mà không ai biết, cho tới khi một truy vấn hỏng ở đúng production. Cần đổi thì thêm file mới.
- `Mid` **Đổi tên một cột trên hệ thống đang có người chơi, anh làm thế nào?**
  → Expand–contract, ba lần deploy. Expand: thêm cột mới cho phép NULL, code ghi cả hai nhưng vẫn đọc cột cũ. Migrate: backfill theo lô, đối soát hai cột khớp, rồi chuyển sang đọc cột mới. Contract: ngừng ghi cột cũ, chờ tới khi không còn bản nào dùng, rồi mới `DROP`. Gộp lại một lần thì có vài giây bản cũ đọc cột không còn tồn tại.
- `Mid` **Backfill 2 triệu dòng, làm sao không khoá bảng?**
  → Theo lô vài nghìn dòng, nghỉ giữa các lô, chạy ở worker chứ không trong migration đồng bộ. Điều kiện lô phải dựa trên **trạng thái dòng** — ví dụ `WHERE col_v2 IS NULL` — chứ không dựa trên offset, vì worker chết giữa chừng là chuyện thường và với offset thì chạy lại sẽ bỏ sót. Trước khi contract thì chạy một truy vấn đếm chênh lệch, phải ra 0.
- `Senior` **Ba tầng migration trong một dự án game là gì?**
  → Schema database — nhịp vài lần một tháng, rollback khó, phải viết đường lùi. Master data — nhịp hằng ngày, không migrate mà publish version mới, rollback là đổi con trỏ. Save phía client — nhịp theo bản phát hành, chạy trên máy người chơi và **không có rollback** vì bạn không với tới máy họ. Ba nhịp, ba cách xử lý, gộp lại là nguồn nhầm lẫn.
- `Senior` **Migration save ở client nguy hiểm hơn ở server chỗ nào?**
  → Vì không có đường lùi và không có quyền truy cập. Server hỏng thì bạn restore từ backup; client hỏng thì save của người chơi mất và bạn chỉ biết qua khiếu nại. Nên ba việc bắt buộc: save có `version` từ bản đầu tiên, migration theo chuỗi từng bước, và **sao lưu file cũ trước khi migrate** — đó là thứ duy nhất thay cho rollback ở tầng này.

**Khung trả lời 60 giây** — "Đổi schema mà không rớt người chơi?"

> Bằng **expand–contract**, và điều quan trọng nhất là nó không phải một lần deploy mà là ba.
>
> **Expand**: thêm cột mới cho phép NULL, code ghi vào cả hai cột nhưng vẫn đọc cột cũ. Bản cũ chạy bình thường, rollback an toàn. **Migrate**: backfill theo lô ở worker, mỗi lô vài nghìn dòng, điều kiện dựa trên trạng thái dòng để chạy lại được; đối soát hai cột khớp nhau rồi mới chuyển sang đọc cột mới. **Contract**: ngừng ghi cột cũ, chờ tới khi không còn bản nào dùng, rồi mới `DROP`.
>
> Chi phí thật của mô hình này là **sự chờ đợi**, không phải công sức viết code — và với client đã lên store thì khoảng cách giữa bước hai và bước ba tính bằng tháng. Nhảy thẳng từ expand sang contract là cách mất dữ liệu nhanh nhất tôi biết.

**Họ sẽ đào tiếp**

- *"Vì sao migration phải tương thích ngược?"* → Vì trong lúc rolling deploy, bản cũ và bản mới cùng đọc một database trong vài giây tới vài phút. Thêm cột thì an toàn; đổi tên hay xoá cột thì bản cũ sẽ hỏng — và đó là vài phút có người đang mua đồ.
- *"Rollback schema thì sao?"* → Rollback thật sự chỉ an toàn ở giai đoạn expand và migrate. Sau khi `DROP COLUMN` là hết đường lùi, nên tôi coi contract là điểm không quay lại và chỉ làm khi đã đối soát xong. Ở mức thực dụng, đường lùi đáng tin nhất vẫn là backup đã phục hồi thử.
- *"Test migration thế nào?"* → Trên staging với **dữ liệu giống thật về kích thước**, không phải bảng rỗng ở máy mình. Thứ giết bạn không phải cú pháp sai mà là thời gian khoá bảng, và nó chỉ hiện ra khi đủ dòng.
- *"Master data có migration không?"* → Không theo nghĩa này. Nó publish version mới, bất biến, và rollback là trỏ lại version cũ trong vài giây. Chỗ giao với schema là khi thêm cột vào bảng master — lúc đó cần cả migration schema lẫn một giá trị mặc định hợp lý để các bản master cũ vẫn đọc được.
- *"`id` trong master data có đổi được không?"* → Không bao giờ đổi **ý nghĩa** của id đã phát hành. `sword_iron` là kiếm sắt vĩnh viễn, vì id đó nằm trong save của người chơi và trong sổ cái giao dịch — đổi nghĩa là làm sai lệch lịch sử đã ghi.

**Cờ đỏ**

- Sửa file migration đã merge.
- `ALTER TABLE ... ALTER COLUMN TYPE` một phát trên bảng triệu dòng đang có người dùng.
- Auto-migrate trong `main()` của server.
- Backfill bằng `LIMIT/OFFSET`.
- Save client không có trường `version`.
- Test migration chỉ trên bảng rỗng ở máy mình.
- Coi expand–contract là "làm phức tạp lên" khi hệ thống đang có người chơi.

**Số / ví dụ nên thuộc**

- Expand–contract: **ba lần deploy**, không phải một.
- Backfill theo lô **vài nghìn dòng**, điều kiện dựa trên trạng thái, không dùng offset.
- Đối soát trước khi contract: truy vấn đếm chênh lệch phải ra **0**.
- Ba tầng: schema (vài lần/tháng) · master data (hằng ngày) · save client (theo bản phát hành).
- Save client: **không có rollback** — chỉ có sao lưu trước khi migrate.

**Kể trong dự án**

- *"Anh có chạy migration trên production chưa?"* → Nếu có, kể **quy mô và thời gian khoá**: bao nhiêu dòng, mất bao lâu, có ai bị ảnh hưởng không. Đây là loại chi tiết chỉ người làm thật mới có.
- *"Khó khăn gặp phải?"* → Mẫu rất thật: một `ALTER TABLE` chạy ngon ở staging với bảng nhỏ, lên production khoá bảng và mọi request timeout. Kể cách bạn xử lý ngay lúc đó và cách bạn đổi quy trình sau đó — test trên bản sao dữ liệu thật về kích thước.
- *"Anh có làm mất dữ liệu bao giờ chưa?"* → Nếu có thì kể thẳng, kèm cách phát hiện và khôi phục. Trung thực ở câu này được đánh giá cao hơn nhiều so với một hồ sơ không tì vết — người phỏng vấn biết ai làm nhiều thì có lúc gặp.
