---
title: Master Data & Master User
icon: 📊
summary: Hai loại dữ liệu, hai vòng đời — bảng cân bằng do designer viết trên Google Sheet rồi nạp vào database có version, và dữ liệu người chơi tham chiếu tới nó chứ không sao chép.
status: deep
read: 591
level: intermediate
order: 25
tags: [backend, database, master-data, pipeline, live-ops]
related: [game-database, data-driven-design, go-gamedev-tools, liveops]
---

Server game nào sống lâu cũng tự hội tụ về cùng một kiến trúc dữ liệu: **master data** (bảng cân bằng — vật phẩm, level, giá, tỉ lệ rơi đồ) do designer viết, chỉ đọc, phát hành theo version; và **user data** (vàng, đồ, tiến trình) do người chơi tạo ra, ghi liên tục, không được phép mất. Trộn hai thứ này là nguồn của gần hết những rắc rối về sau.

Cách phổ biến nhất — và thật sự hiệu quả — để designer viết master data là **Google Sheet**. Nhưng có một ranh giới phải giữ chặt: *Sheet là giao diện soạn thảo, database mới là nguồn server đọc.* Server đọc thẳng Google Sheets API lúc chạy là sai lầm kiến trúc tốn kém nhất trong cả node này.

## Hai loại dữ liệu, so cạnh nhau

| | Master data | User data (Master User) |
|---|---|---|
| Ai tạo | Designer | Người chơi |
| Ghi khi nào | Vài lần một tuần, theo đợt phát hành | Liên tục, mỗi hành động |
| Cần transaction | Không | **Có** — xem [[game-database]] |
| Mất thì sao | Nạp lại từ nguồn | Mất người chơi |
| Kích thước | Vài nghìn dòng, vừa trong RAM | Tăng theo số người chơi |
| Đọc thế nào | Nạp một lần vào RAM lúc khởi động | Query theo `user_id` mỗi request |
| Sửa thế nào | Publish version mới, có rollback | `UPDATE` trong transaction |
| Giống nhau giữa mọi người chơi | Có | Không |

Từ bảng này suy ra hai quyết định kỹ thuật quan trọng nhất của node:

1. **Master data nằm trong RAM của server**, không query database mỗi request. Vài nghìn dòng là vài MB — tra một map nhanh hơn một round-trip database khoảng mười nghìn lần.
2. **User data tham chiếu tới master, không sao chép master.** `user_item` lưu `item_id`, không lưu `price` hay `atk`. Sao chép nghĩa là buff kiếm sắt hôm nay chỉ có tác dụng với người mua từ ngày mai — và không ai hiểu vì sao.

## Đường đi từ Google Sheet tới server

<figure class="fig">
<svg viewBox="0 0 660 220" role="img" aria-label="Đường đi của master data: Google Sheet, export TSV, commit vào git để review, validator trong CI, import tạo version mới trong database, server nạp vào RAM, client tải theo version">
  <defs>
    <marker id="mdt-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="6"   y="40" width="104" height="58" rx="9" class="fig-box"/>
    <rect x="140" y="40" width="118" height="58" rx="9" class="fig-box"/>
    <rect x="288" y="40" width="118" height="58" rx="9" class="fig-box"/>
    <rect x="436" y="40" width="118" height="58" rx="9" class="fig-box"/>
    <rect x="436" y="132" width="118" height="52" rx="9" class="fig-box"/>
    <rect x="584" y="40" width="70" height="58" rx="9" class="fig-box"/>
  </g>
  <text x="58"  y="64"  text-anchor="middle" class="fig-label" font-size="12">Google Sheet</text>
  <text x="58"  y="83"  text-anchor="middle" class="fig-muted" font-size="10">designer soạn</text>
  <text x="199" y="64"  text-anchor="middle" class="fig-label" font-size="12">export TSV</text>
  <text x="199" y="83"  text-anchor="middle" class="fig-muted" font-size="10">service account</text>
  <text x="347" y="58"  text-anchor="middle" class="fig-label" font-size="12">git + review</text>
  <text x="347" y="76"  text-anchor="middle" class="fig-muted" font-size="10">có diff, có blame,</text>
  <text x="347" y="90"  text-anchor="middle" class="fig-muted" font-size="10">validator chạy ở CI</text>
  <text x="495" y="64"  text-anchor="middle" class="fig-label" font-size="12">import → version</text>
  <text x="495" y="83"  text-anchor="middle" class="fig-muted" font-size="10">database, không ghi đè</text>
  <text x="495" y="154" text-anchor="middle" class="fig-label" font-size="12">server: RAM</text>
  <text x="495" y="172" text-anchor="middle" class="fig-muted" font-size="10">đổi bằng thay con trỏ</text>
  <text x="619" y="64"  text-anchor="middle" class="fig-label" font-size="12">client</text>
  <text x="619" y="83"  text-anchor="middle" class="fig-muted" font-size="10">tải theo version</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#mdt-a)" fill="none">
    <path d="M110 69 H136"/>
    <path d="M258 69 H284"/>
    <path d="M406 69 H432"/>
    <path d="M495 98 V128"/>
    <path d="M554 69 H580"/>
  </g>
  <text x="334" y="206" text-anchor="middle" class="fig-muted" font-size="11">Không có mũi tên nào đi thẳng từ Google Sheet tới server đang chạy — đó là điểm mấu chốt của cả sơ đồ</text>
</svg>
<figcaption>Bước "git + review" là bước hay bị bỏ nhất và là bước đáng giá nhất: nó cho bạn diff, blame và một chỗ để validator chạy trước khi dữ liệu chạm tới người chơi.</figcaption>
</figure>

**Vì sao không đọc thẳng Sheets API từ server:** Google có rate limit và có lúc lỗi (game bạn chết theo); không có version nên không rollback được; một designer sửa nhầm một ô là production đổi ngay lập tức không qua ai duyệt; và độ trễ mỗi lần đọc tính bằng trăm mili giây. Sheet để *soạn*, database để *phục vụ*.

## Quy ước Google Sheet

Một sheet = một bảng. Tên sheet = tên bảng (`item`, `level`, `shop`).

| Hàng | Nội dung | Ví dụ |
|---|---|---|
| 1 | Tên cột, `snake_case`, khớp tên cột trong database | `id`, `name_key`, `price`, `rarity` |
| 2 | Kiểu dữ liệu cho validator | `string`, `int`, `float`, `bool`, `enum:rarity`, `ref:item.id` |
| 3 | Ghi chú cho designer (validator bỏ qua) | "giá bán trong shop, đơn vị vàng" |
| 4+ | Dữ liệu | `sword_iron`, `item.sword_iron.name`, `1200`, `rare` |

Sáu quy ước bắt buộc, mỗi cái đổi lấy một loại sự cố:

- **`id` là chuỗi do người đặt và không bao giờ đổi** (`sword_iron`, không phải `1`). Nó nằm trong save của người chơi mãi mãi; đổi id nghĩa là mọi người mất đồ.
- **Không để chữ hiển thị trong master data.** Lưu `name_key`, chữ thật nằm ở bảng nội địa hoá — nếu không, thêm một ngôn ngữ là phải sửa cả bảng cân bằng.
- **Đặt định dạng cột số là "Plain text"** trong Sheets. Không thì `1-2` thành ngày tháng, và `1.5` thành `1,5` trên máy đặt locale Việt Nam — hai lỗi âm thầm kinh điển.
- **Không dùng `IMPORTRANGE` hay công thức trỏ sang file khác.** Nó vỡ khi quyền chia sẻ đổi, và vỡ im lặng.
- **Không có hàng trống ở giữa** và không có ô gộp. Validator coi hàng trống là hết bảng.
- **Không xoá cột, chỉ ngừng dùng.** Xoá cột làm lệch mọi thứ phía sau nếu importer đọc theo vị trí — hãy đọc theo *tên* cột ở hàng 1, và vẫn giữ luật này cho chắc.

Export bằng **service account chỉ có quyền đọc** (Sheets API), ghi ra TSV rồi **commit vào một repo dữ liệu**. TSV thay vì CSV vì dữ liệu game đầy dấu phẩy trong chữ.

## Version hoá: không bao giờ sửa tại chỗ

```sql
-- Mỗi lần publish tạo một version MỚI. Dữ liệu master không bao giờ bị UPDATE.
CREATE TABLE master_version (
  id         bigserial PRIMARY KEY,
  checksum   text        NOT NULL,   -- hash của bộ TSV đã import: phát hiện import nhầm bộ
  note       text        NOT NULL,   -- "buff kiếm sắt, mở sự kiện Tết"
  created_by text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Con trỏ "bản nào đang chạy" cho từng môi trường. Rollback = UPDATE đúng một dòng.
CREATE TABLE master_active (
  env        text   PRIMARY KEY,     -- 'dev' | 'staging' | 'prod'
  version_id bigint NOT NULL REFERENCES master_version(id)
);

CREATE TABLE master_item (
  version_id bigint NOT NULL REFERENCES master_version(id),
  id         text   NOT NULL,        -- id designer đặt, KHÔNG BAO GIỜ đổi
  name_key   text   NOT NULL,
  price      bigint NOT NULL CHECK (price > 0),
  rarity     text   NOT NULL,
  PRIMARY KEY (version_id, id)
);
```

Ba thứ có được từ đúng ba bảng này: **rollback trong một câu lệnh** khi bản cân bằng mới hỏng; **staging chạy version khác production** để QA thử trước; và **trả lời được câu "hôm qua giá kiếm sắt là bao nhiêu"** khi người chơi khiếu nại.

Đừng xoá version cũ. Vài nghìn dòng mỗi bản, giữ cả trăm bản vẫn chưa bằng một ngày log.

## Server nạp master vào RAM

```go
// Toàn bộ master data là MỘT struct chỉ đọc. Nạp một lần, đổi bằng cách thay con trỏ.
type Master struct {
    Version int64
    Items   map[string]*Item   // KHÔNG ghi vào map này sau khi Load xong
    Levels  []*LevelRow
    Shops   map[string]*Shop
}

type Catalog struct {
    pool   *pgxpool.Pool
    master atomic.Pointer[Master]   // hàng nghìn goroutine đọc không cần khoá
}

// M() là cách DUY NHẤT để đọc master. Handler gọi c.M().Items[id], không query database.
func (c *Catalog) M() *Master { return c.master.Load() }

// Reload nạp version đang active rồi đổi con trỏ trong một thao tác nguyên tử.
// Request đang xử lý dở vẫn dùng bản cũ tới khi xong — không có trạng thái nửa nạp nửa chưa.
func (c *Catalog) Reload(ctx context.Context, env string) error {
    m, err := loadMaster(ctx, c.pool, env)
    if err != nil {
        return fmt.Errorf("nạp master (%s): %w", env, err)   // hỏng thì GIỮ bản cũ, không chạy với bản rỗng
    }
    c.master.Store(m)
    slog.Info("master data đã đổi", "version", m.Version, "items", len(m.Items))
    return nil
}
```

`atomic.Pointer` thay cho `sync.RWMutex` ở đây là lựa chọn có lý do: master được đọc hàng chục nghìn lần mỗi giây và ghi vài lần một tuần. Đổi con trỏ cũng làm việc hot reload trở nên đơn giản — **một lệnh admin hoặc một thông điệp Redis pub/sub** là mọi instance cùng nạp bản mới, không cần restart và không rớt ai.

Một luật đi kèm: **không bao giờ ghi vào map trong `Master`**. Nó được chia sẻ giữa mọi goroutine mà không có khoá; một lần ghi là một data race thật, và `go test -race` sẽ bắt được nếu bạn có test.

## Master User: bảng gốc của người chơi

```sql
-- user_id sinh ở server và là khoá của MỌI bảng user_* về sau.
CREATE TABLE users (
  user_id      uuid PRIMARY KEY,
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  status       text NOT NULL DEFAULT 'active'   -- active | banned | deleted
);

-- Danh tính đăng nhập tách RIÊNG: một người có thể có device + Google + Apple.
CREATE TABLE user_auth (
  provider     text NOT NULL,                   -- 'device' | 'google' | 'apple'
  provider_uid text NOT NULL,
  user_id      uuid NOT NULL REFERENCES users(user_id),
  PRIMARY KEY (provider, provider_uid)
);

-- Tách bảng theo TẦN SUẤT GHI, không theo "cho gọn".
CREATE TABLE user_profile (
  user_id  uuid PRIMARY KEY REFERENCES users(user_id),
  nickname text NOT NULL,
  avatar_id text NOT NULL                       -- tham chiếu master_avatar.id
);

CREATE TABLE user_item (
  user_id uuid NOT NULL REFERENCES users(user_id),
  item_id text NOT NULL,        -- THAM CHIẾU master_item.id — không copy price/atk vào đây
  qty     int  NOT NULL CHECK (qty >= 0),
  level   int  NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, item_id)
);
```

Sáu luật cho phần user, mỗi luật đổi lấy một sự cố cụ thể:

1. **`user_id` do server sinh, không phải email hay device id.** Người chơi đổi máy, gộp tài khoản, thêm cách đăng nhập — `user_id` phải sống sót qua tất cả. Danh tính đăng nhập nằm ở `user_auth`.
2. **Mọi bảng `user_*` có `user_id` ở cột đầu của khoá chính.** Ngày cần chia dữ liệu theo shard, đây là khác biệt giữa một tuần và sáu tháng.
3. **Tách theo tần suất ghi.** `user_currency` bị `UPDATE` liên tục, `user_profile` gần như không đổi. Gộp chung là mọi lần tiêu vàng lại viết lại cả hàng có nickname và avatar.
4. **Lưu tham chiếu, không lưu giá trị suy ra được.** `user_item` giữ `item_id` và `level`; sát thương tính từ master lúc chạy. Ngoại lệ duy nhất là thứ **không được đổi theo thời gian**: giá đã trả ghi vào sổ cái ở [[game-database]], vì đó là sự kiện lịch sử chứ không phải thuộc tính.
5. **Xoá mềm trước, xoá thật sau.** `status = 'deleted'` rồi mới xoá dữ liệu theo hạn — người chơi hối hận sau hai ngày là chuyện thường, và luật bảo vệ dữ liệu ở nhiều nước cũng yêu cầu xoá được thật khi họ đòi.
6. **`last_seen_at` cập nhật có tiết chế.** Ghi mỗi request là mỗi request thành một lần `UPDATE`; ghi mỗi 5 phút một lần là đủ cho mọi báo cáo bạn sẽ làm.

## Khi master đổi mà user data đã trỏ vào bản cũ

Câu hỏi hay gặp nhất trong kiến trúc này: xoá một item khỏi master thì người đang sở hữu nó ra sao?

- **Đừng xoá, hãy đánh dấu.** Thêm cột `enabled` (hoặc `sunset_at`) trong master. Item tắt thì không xuất hiện trong shop, nhưng người đang có vẫn dùng được — và code không phải xử lý trường hợp "tra map ra `nil`".
- **Server phải chịu được `nil`.** Dù có luật trên, vẫn luôn kiểm tra khi tra cứu: một id mồ côi không được phép làm sập handler. Log nó ra để biết mà sửa dữ liệu.
- **Đổi giá trị thì áp dụng cho tất cả** — đó chính là điểm của việc tham chiếu. Nếu một thay đổi *không* được phép hồi tố (ví dụ giá đã mua), thì thứ đó vốn thuộc về sổ cái, không thuộc về master.

## Bẫy thường gặp

| Bẫy | Hậu quả |
|---|---|
| Server đọc thẳng Google Sheets API lúc chạy | Google lỗi là game chết; không rollback được; sửa nhầm một ô là production đổi ngay |
| Không commit TSV vào git | Không diff, không blame, không trả lời được "ai đổi giá lúc 2 giờ sáng" |
| `UPDATE` master tại chỗ thay vì tạo version | Bản cân bằng hỏng không rollback được, và không tra được lịch sử |
| Copy giá trị master vào bảng user | Buff/nerf chỉ có tác dụng với người mới — không ai hiểu vì sao |
| Dùng số thứ tự làm `id` trong Sheet | Chèn một dòng giữa bảng là lệch toàn bộ save của người chơi |
| Để Sheets tự định dạng cột số | `1-2` thành ngày tháng, `1.5` thành `1,5` theo locale — import ra số rác |
| Đọc cột theo **vị trí** thay vì theo tên | Designer chèn một cột là mọi trường lệch một ô |
| Query master từ database mỗi request | Thêm một round-trip vào mọi endpoint, chẳng đổi lấy gì |
| Ghi vào map master lúc chạy | Data race thật, lộ ra dưới tải như một crash ngẫu nhiên |
| Gộp mọi cột user vào một bảng rộng | Mỗi lần tiêu vàng lại viết lại cả hàng, và khoá dài hơn cần thiết |
| Nạp master hỏng rồi vẫn `Store` bản rỗng | Cả server chạy với shop trống — tệ hơn hẳn so với giữ bản cũ |

## 🤖 Prompt cho AI

**Dùng AI thế nào cho pipeline dữ liệu**

Pipeline master data gần như toàn bộ là việc khuôn mẫu, kiểm chứng được bằng máy — nên giao được nhiều. Nhưng có đúng một quyết định AI không thể thay bạn: **cột nào thuộc master, cột nào thuộc user, cột nào là sự kiện lịch sử.** Trả lời sai câu đó thì code sinh ra càng đẹp càng tốn công gỡ về sau.

| Giao được | Đừng giao |
|---|---|
| Exporter Sheets → TSV, importer TSV → bảng version, script publish/rollback | Phân loại master / user / sổ cái |
| Validator kiểu và ràng buộc tham chiếu (`ref:item.id`) — xem [[go-gamedev-tools]] | Chọn `id` cho vật phẩm (nó sống trong save mãi mãi) |
| Sinh struct Go và lớp truy cập từ hàng 1–2 của Sheet | Quyết định thứ gì được phép hồi tố khi đổi cân bằng |
| Test: import hai lần cùng bộ TSV phải ra cùng checksum | Chạy publish lên production |

Quy trình dùng được: dán **hàng 1, 2 và 3 dòng dữ liệu thật** của Sheet, bắt AI sinh *một mạch* schema + importer + validator + struct Go, rồi tự mình kiểm đúng một thứ — import hai lần cùng một bộ TSV phải cho ra **cùng checksum và không tạo version thừa**.

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Hàng 1 và hàng 2 thật của Sheet** (tên cột và kiểu). Mô tả bằng lời luôn ra sai kiểu.
- **Cột nào là `id`** và cam kết id không bao giờ đổi.
- **Bảng nào là master, bảng nào là user.** Không nói thì AI gộp hết vào một schema.
- **Có bao nhiêu dòng** mỗi bảng (vài trăm hay vài triệu) — nó quyết định có nạp hết vào RAM được không.
- **Môi trường:** dev/staging/prod dùng chung database hay tách, và ai được phép publish.
- **Locale của người soạn Sheet** — dấu thập phân là `.` hay `,` quyết định cách parse.

**Mẫu prompt**

```
Dựng pipeline master data cho game: Google Sheet → TSV → PostgreSQL 16 có version →
server Go 1.22 nạp vào RAM. Master ~3.000 dòng chia 8 bảng. Designer soạn bằng
locale Việt Nam (dấu thập phân có thể là dấu phẩy).

Hàng 1 và 2 của sheet "item" (thật):
id            name_key      price   rarity        drop_pct
string        string        int     enum:rarity   float

3 dòng dữ liệu mẫu:
<dán>

Cần, theo thứ tự, dừng chờ tôi duyệt sau mỗi bước:
1. Schema: master_version, master_active, master_item — publish tạo version MỚI,
   KHÔNG UPDATE tại chỗ. Rollback bằng một câu lệnh.
2. Importer Go: đọc TSV theo TÊN cột ở hàng 1 (không theo vị trí), parse số theo
   InvariantCulture, tính checksum của cả bộ, import trong MỘT transaction.
   Chạy lại cùng bộ TSV phải KHÔNG tạo version mới.
3. Lớp đọc phía server: struct Master chỉ đọc + atomic.Pointer, hàm Reload giữ
   bản cũ nếu nạp lỗi. Handler KHÔNG được query database để đọc master.
4. Test: import hai lần cùng checksum; import bộ có ref gãy phải thất bại TOÀN BỘ.

KHÔNG đọc Google Sheets API từ server lúc chạy. KHÔNG dùng ORM.
KHÔNG copy giá trị master vào bảng user.
```

**Bẫy thường gặp:** AI mặc định đề xuất server gọi thẳng Google Sheets API (có khi kèm cache 5 phút) vì đó là cách ngắn nhất và là cách phần lớn bài hướng dẫn trên mạng làm — bạn nhận về một hệ thống không rollback được, không review được, và chết theo mỗi lần Google chậm. Ba cái nữa: importer của nó đọc cột **theo vị trí** nên chèn một cột là lệch hết; nó dùng `strconv.ParseFloat` trên chuỗi `"1,5"` rồi lặng lẽ trả lỗi hoặc số 0; và nó rất hay `UPDATE ... ON CONFLICT` vào bảng master (ghi đè tại chỗ) thay vì tạo version mới, làm mất sạch khả năng rollback mà bạn vừa yêu cầu.

## 🎮 Unity

Client cũng cần master data — để hiện shop, hiện chỉ số, hiện tên vật phẩm — và đây là chỗ **lệch version giữa client và server** sinh ra loại bug khó chịu nhất: giá trên UI khác giá server tính, người chơi bấm mua rồi báo lỗi.

**Component & nơi đặt**

- `MasterCatalog.cs` — singleton chỉ đọc, nạp một lần lúc vào game, đặt ở `Assets/Scripts/Data/`.
- Cache file ở `Application.persistentDataPath/master/<version>.tsv`; giữ bản cũ tới khi tải xong bản mới.
- Bản dựng sẵn (fallback) trong `StreamingAssets` để lần chạy đầu không phải chờ mạng.

**Code**

```csharp
using System.Collections.Generic;
using System.Globalization;
using UnityEngine;

// Master data phía client: chỉ đọc, nạp một lần, và LUÔN nhớ version đang dùng.
public class MasterCatalog
{
    public long Version { get; private set; }
    readonly Dictionary<string, ItemRow> items = new();

    public class ItemRow { public string Id, NameKey, Rarity; public long Price; public float DropPct; }

    public ItemRow Item(string id) => items.TryGetValue(id, out var r) ? r : null;   // id mồ côi KHÔNG được làm sập UI

    public void Load(long version, string tsv)
    {
        Version = version;
        items.Clear();

        var lines = tsv.Split('\n');
        var header = lines[0].TrimEnd('\r').Split('\t');
        int cId = System.Array.IndexOf(header, "id");            // đọc theo TÊN cột, không theo vị trí
        int cName = System.Array.IndexOf(header, "name_key");
        int cPrice = System.Array.IndexOf(header, "price");
        int cRarity = System.Array.IndexOf(header, "rarity");
        int cDrop = System.Array.IndexOf(header, "drop_pct");

        for (int i = 3; i < lines.Length; i++)                   // hàng 1 tên cột, 2 kiểu, 3 ghi chú
        {
            var line = lines[i].TrimEnd('\r');
            if (string.IsNullOrWhiteSpace(line)) continue;
            var c = line.Split('\t');
            if (c.Length <= cId || string.IsNullOrEmpty(c[cId])) continue;

            items[c[cId]] = new ItemRow
            {
                Id = c[cId],
                NameKey = c[cName],
                Rarity = c[cRarity],
                // InvariantCulture BẮT BUỘC: máy đặt locale VN sẽ parse "1.5" thành 15
                Price = long.Parse(c[cPrice], CultureInfo.InvariantCulture),
                DropPct = float.Parse(c[cDrop], CultureInfo.InvariantCulture),
            };
        }
        Debug.Log($"Master v{Version}: {items.Count} vật phẩm");
    }
}
```

**Bẫy Unity cụ thể**

- **`float.Parse` không có `InvariantCulture`.** Trên máy đặt locale Việt Nam hoặc Đức, `"1.5"` bị đọc thành `15`. Đây là bug kinh điển: chạy đúng trên máy bạn, sai trên máy người chơi, và không có thông báo lỗi nào. Áp dụng cho cả `ToString()` khi gửi số lên server.
- **Client và server dùng version khác nhau.** Server nên trả `masterVersion` trong mọi phản hồi; client thấy khác bản mình đang giữ thì tải lại và hiện thông báo nhẹ. Không có cơ chế này thì UI hiện giá cũ còn server tính giá mới.
- **Nạp master trên main thread lúc vào game.** Vài nghìn dòng parse đồng bộ là một khựng hình rõ rệt — parse trong `Task.Run` hoặc chia theo frame, và đừng dùng `JsonUtility` cho mảng lớn.
- **Ghi đè cache trước khi tải xong.** Tải về file tạm rồi mới `File.Move`; mất mạng giữa chừng mà đã xoá bản cũ thì lần vào game sau là màn hình trống.
- **Đưa chữ hiển thị vào master.** Dùng `name_key` và bảng nội địa hoá; nếu không, mỗi lần thêm ngôn ngữ là một lần đụng vào bảng cân bằng.
- **Tin master data client gửi lên.** Client có thể sửa file cache. Server tính giá từ master **của server**; client chỉ hiện — đúng nguyên tắc authoritative ở [[game-server-go]].

**Kiểm tra nhanh**

- Đặt Windows sang locale Việt Nam (dấu thập phân là phẩy) rồi chạy: `drop_pct` vẫn đúng — nếu sai, thiếu `InvariantCulture` ở đâu đó.
- Publish một version master mới trên staging trong lúc client đang mở: client nhận ra lệch version và tải lại, không cần đóng game.
- Sửa file cache trong `persistentDataPath` để hạ giá một vật phẩm xuống 1 vàng: UI hiện 1 vàng nhưng server vẫn trừ đúng giá thật và trả lỗi nếu không đủ.
- Xoá một item khỏi master rồi mở túi đồ của người đang sở hữu nó: UI không sập, chỉ báo thiếu dữ liệu.
