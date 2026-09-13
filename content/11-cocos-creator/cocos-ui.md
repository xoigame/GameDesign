---
id: cocos-ui
title: UI & đa tỉ lệ màn hình
icon: 🖼️
summary: Canvas và design resolution, Widget neo mép thật, Layout, Label và bẫy chữ tiếng Việt, ScrollView danh sách dài, và chỗ UI ăn draw call.
status: deep
read: 830
level: basic
order: 30
tags: [cocos, ui, layout, label, scrollview]
related: [cocos-creator, cocos-optimization, ui-design, ux-hud]
---

UI chiếm phần lớn thời gian làm một game H5 hay mini game, và cũng là chỗ hiệu năng bốc hơi nhanh nhất. Node này về **ba thứ luôn đi cùng nhau**: tỉ lệ màn hình, cách neo, và số draw call mà cách neo đó tạo ra.

Nguyên tắc thiết kế HUD không đổi theo engine — đọc [[ux-hud]] và [[ui-design]] trước. Node này chỉ nói phần Cocos.

## Chốt tỉ lệ trước, dựng màn sau

`Canvas` có **design resolution** và hai ô tick `Fit Width` / `Fit Height`. Bốn tổ hợp, bốn hành vi:

| Fit Width | Fit Height | Kết quả | Dùng khi |
|---|---|---|---|
| ✓ | ✗ | Giữ bề ngang, chiều cao co giãn | **Game dọc** — điện thoại dao động từ 16:9 tới 21:9 theo chiều cao |
| ✗ | ✓ | Giữ chiều cao, bề ngang co giãn | **Game ngang** |
| ✓ | ✓ | Nội dung luôn nằm trọn, có thể thừa viền | Bàn cờ / bàn bài phải thấy trọn vẹn |
| ✗ | ✗ | Lấp đầy màn hình, cắt phần thừa | Nền trang trí, không đặt thứ quan trọng ở mép |

Quy ước: **720×1280** cho game dọc, **1280×720** cho game ngang, tick một chiều.

Điều quan trọng nhất và hay bị bỏ qua: **design resolution không phải màn hình thật**. Neo HUD vào toạ độ tính từ design resolution là cách chắc chắn để nút bấm rơi ra ngoài trên máy 20:9. Mọi thứ chạm mép phải neo bằng `Widget`.

## Widget: neo vào mép thật

`Widget` là component rời, phải gắn thêm:

```ts
const w = node.addComponent(Widget);
w.isAlignTop = true;  w.top = 24;
w.isAlignLeft = true; w.left = 16;
w.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
```

Ba điều phải nhớ:

- **`alignMode`**: `ONCE` tính một lần (rẻ nhất, dùng cho thứ không đổi), `ON_WINDOW_RESIZE` tính lại khi xoay máy, `ALWAYS` tính **mỗi frame** — chỉ dùng khi node cha thật sự đổi kích thước liên tục. Để `ALWAYS` cho vài chục node là một khoản phí vô hình.
- **Widget neo theo node cha**, không theo màn hình. Cha nhỏ hơn màn hình thì "neo mép phải" là mép phải của cha.
- **Widget đè lên nhau với Layout**: một node vừa nằm trong `Layout` vừa có `Widget` sẽ giằng co. Chọn một.

Tai thỏ và thanh trạng thái: gắn component **`SafeArea`** vào node chứa HUD trên cùng. Không có nó thì trên iPhone có notch, nút back nằm dưới cái tai.

## UITransform: không có `node.width`

Đây là khác biệt 2.x → 3.x làm người cũ vấp nhiều nhất:

```ts
// SAI (2.x): this.node.width = 200
const ui = this.node.getComponent(UITransform)!;
ui.setContentSize(200, 80);
ui.anchorPoint = new Vec2(0.5, 0.5);   // gốc toạ độ nằm ở đâu trong khung
```

`UITransform` cũng là thứ quyết định **vùng nhận chạm**. Node không có `UITransform`, hoặc có mà `contentSize` bằng 0, thì `node.on(Node.EventType.TOUCH_START)` sẽ không bao giờ chạy — và không có lỗi nào được in ra.

## Label và bẫy chữ tiếng Việt

`Label` có ba chế độ cache, chọn sai là mất fps hoặc mất chữ:

| cacheMode | Cách hoạt động | Dùng cho |
|---|---|---|
| `NONE` (mặc định) | Mỗi Label một texture riêng | Chữ ít, ít đổi |
| `BITMAP` | Gộp vào atlas động chung | **Chữ tĩnh** — tiêu đề, nhãn nút |
| `CHAR` | Atlas theo từng ký tự, tái dùng | **Số nhảy liên tục** — điểm, đồng hồ, combo |

Đặt `CHAR` cho đồng hồ đếm ngược là một trong những tối ưu rẻ nhất: không còn dựng lại texture mỗi giây.

**Bẫy tiếng Việt:** dùng font bitmap (BMFont) làm sẵn theo bộ ký tự — thiếu `ế`, `ượ`, `ỹ` là ra ô vuông. Hai cách chữa: xuất BMFont với đủ bộ ký tự tiếng Việt (nhớ cả chữ hoa có dấu), hoặc dùng font TTF và chấp nhận chi phí dựng texture. Kiểm bằng một chuỗi thử duy nhất, để sẵn trong dự án:

```
ĂÂĐÊÔƠƯ ăâđêôơư ạảấầẩẫậắằẳẵặ ẹẻẽếềểễệ ịỉĩ ọỏốồổỗộớờởỡợ ụủứừửữự ỳỵỷỹ
```

Trên mini game, font hệ thống của nền tảng có thể **khác** font trên máy bạn — thử trên thiết bị thật trước khi chốt layout theo bề rộng chữ.

## ScrollView danh sách dài: phải tái dùng ô

`ScrollView` dựng sẵn dùng `Mask` để cắt. Mỗi `Mask` tốn thêm **2 draw call** và cắt đứt chuỗi gộp — nên danh sách 300 dòng, mỗi dòng vài node, là cách nhanh nhất để tụt fps.

Luật: **quá ~30 ô thì phải tái dùng** (virtual list). Chỉ dựng đủ số ô che kín màn hình cộng hai ô đệm, cuộn tới đâu thì đổi dữ liệu của ô đã ra khỏi khung. Code hoàn chỉnh ở mục 💻.

Vài điều khác đáng nhớ ở ScrollView: tắt `Inertia` cho danh sách ngắn để cảm giác dứt khoát hơn; `Brake` quanh 0.75 là điểm phần lớn người chơi thấy tự nhiên; và nếu ô có nút bấm thì phải chừa ngưỡng kéo, không thì người chơi cuộn lại thành bấm nhầm.

## UI ăn draw call ở đâu

Thứ tự thường gặp, từ nặng tới nhẹ:

1. **Mask lồng nhau** — mỗi lớp +2 draw call, và cắt gộp.
2. **Sprite xen kẽ khác atlas** — thứ tự node quyết định số draw call. Gom theo atlas, không gom theo ý nghĩa.
3. **Label `NONE`** nằm giữa hai sprite cùng atlas — chen vào giữa là gãy chuỗi gộp.
4. **`Graphics`** — không gộp được với gì.
5. **`UIOpacity` ở node cha** — làm cả cây con phải xử lý riêng; mờ dần cả panel thì chấp nhận được, nhưng đừng để mặc định trên mọi node.

Mốc thực dụng: **dưới ~50 draw call** cho một màn H5. Đo bằng panel thống kê, tắt bật từng lớp UI để biết lớp nào tốn — xem [[cocos-optimization]].

## 🤖 Prompt cho AI

**Dùng AI thế nào cho UI**

AI dựng được **cấu trúc và logic** UI rất nhanh, nhưng nó **không nhìn thấy scene của bạn**, nên mọi thứ liên quan tới bố cục trực quan đều là nó đoán. Chia việc theo đúng ranh giới đó:

| Giao cho AI | Bạn tự làm |
|---|---|
| Component điều khiển UI: binding dữ liệu, mở/đóng popup, hàng đợi thông báo | Kéo thả layout trong Editor |
| Virtual list, pool ô, adapter dữ liệu | Chọn design resolution và tick Fit |
| Code gắn `Widget`/`SafeArea` bằng script khi cần dựng động | Quyết định thứ tự node (nó không thấy để tối ưu draw call) |
| Kiểm tra chuỗi dịch, sinh bộ ký tự cho BMFont | Xác nhận trên thiết bị thật |

**Phải nêu rõ** (thiếu là AI dựng UI kiểu web):

- **Design resolution và hướng màn hình**, tick `Fit Width` hay `Fit Height`.
- **Neo bằng `Widget` vào đâu** — mép trên, mép dưới, hay giữa; có `SafeArea` không.
- **Danh sách dài bao nhiêu ô** — quá 30 là phải virtual list, nói thẳng điều đó.
- **Ngân sách draw call** cho màn đó.
- **Font**: TTF hay BMFont, có cần đủ dấu tiếng Việt không.

**Mẫu prompt**

```
Cocos Creator 3.8.x, TypeScript strict. Game dọc, design resolution 720x1280,
Canvas tick Fit Width. HUD trên cùng nằm trong node có SafeArea.

Việc: viết component `RankingList` cho bảng xếp hạng 500 dòng trong ScrollView.

RÀNG BUỘC:
- PHẢI tái dùng ô (virtual list): tối đa 12 node ô tồn tại, bất kể 500 hay 5000 dòng.
- Kích thước ô lấy qua UITransform.setContentSize, CẤM node.width/height (API 2.x).
- CẤM cấp phát trong update() và trong callback cuộn.
- Label điểm số đặt cacheMode = CHAR; Label tên để BITMAP.
- Ô lấy từ pool, trả về pool khi ra khỏi khung — KHÔNG destroy.
- CẤM find() theo chuỗi; mọi tham chiếu qua @property.

Nói trước: cần những @property nào, và cấu trúc node của một ô ra sao.
```

**Bẫy thường gặp:** AI sinh code 2.x cho UI nhiều hơn mọi mảng khác, vì phần lớn ví dụ UI trên mạng là 2.x — dấu hiệu là `node.width`, `cc.Sprite`, `cc.Label`. Bẫy thứ hai: nó dựng danh sách bằng vòng lặp `instantiate` cho đủ 500 dòng, chạy mượt trên máy bạn và chết trên điện thoại 3GB RAM.

## 💻 Code

Virtual list: 500 dòng nhưng chỉ 12 node tồn tại. Đây là đoạn code có ích nhất trong cả node này.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 300" role="img" aria-label="Hierarchy: ScrollView chứa view và content; Inspector của RankingList với cell prefab, chiều cao ô, khoảng cách, số ô đệm">
  <g class="fig-box-g">
    <rect x="10"  y="16" width="280" height="268" rx="9" class="fig-box"/>
    <rect x="320" y="16" width="326" height="268" rx="9" class="fig-box"/>
  </g>
  <text x="26"  y="40"  class="fig-muted" font-size="11">HIERARCHY</text>
  <text x="26"  y="68"  class="fig-label" font-size="13">▾ Canvas</text>
  <text x="42"  y="92"  class="fig-label" font-size="13">▾ ScrollView   ← RankingList.ts</text>
  <text x="58"  y="116" class="fig-muted" font-size="12">▾ view  (Mask)</text>
  <text x="74"  y="140" class="fig-muted" font-size="12">content  (UITransform)</text>
  <text x="42"  y="170" class="fig-label" font-size="13">cell.prefab</text>
  <text x="58"  y="194" class="fig-muted" font-size="12">Label Rank (CHAR)</text>
  <text x="58"  y="218" class="fig-muted" font-size="12">Label Name (BITMAP)</text>
  <text x="58"  y="242" class="fig-muted" font-size="12">Label Score (CHAR)</text>
  <text x="336" y="40"  class="fig-muted" font-size="11">INSPECTOR — RankingList</text>
  <text x="336" y="68"  class="fig-label" font-size="13">Scroll</text>
  <text x="580" y="68"  class="fig-muted" font-size="12">ScrollView</text>
  <text x="336" y="96"  class="fig-label" font-size="13">Cell Prefab</text>
  <text x="580" y="96"  class="fig-muted" font-size="12">cell.prefab</text>
  <text x="336" y="124" class="fig-label" font-size="13">Cell Height</text>
  <text x="580" y="124" class="fig-muted" font-size="12">96</text>
  <text x="336" y="152" class="fig-label" font-size="13">Spacing</text>
  <text x="580" y="152" class="fig-muted" font-size="12">8</text>
  <text x="336" y="180" class="fig-label" font-size="13">Buffer</text>
  <text x="580" y="180" class="fig-muted" font-size="12">2</text>
  <text x="336" y="222" class="fig-muted" font-size="11">content KHÔNG gắn Layout — script tự đặt vị trí ô.</text>
</svg>
<figcaption>Chiều cao <code>content</code> được tính bằng code theo số dòng; <code>Layout</code> phải tắt, nếu không nó sẽ giành quyền sắp xếp.</figcaption>
</figure>

**Script**

```ts
// RankingList.ts — danh sách ảo: 500 dòng, tối đa ~12 node tồn tại.
import { _decorator, Component, Node, Prefab, ScrollView, UITransform, Vec3, Label, instantiate } from 'cc';
const { ccclass, property } = _decorator;

export interface RankRow { rank: number; name: string; score: number }

@ccclass('RankingList')
export class RankingList extends Component {
    @property(ScrollView) scroll: ScrollView = null!;
    @property(Prefab) cellPrefab: Prefab = null!;
    @property cellHeight = 96;
    @property spacing = 8;
    @property buffer = 2;

    private rows: RankRow[] = [];
    private pool: Node[] = [];
    private inUse = new Map<number, Node>();   // index dòng -> node đang hiện
    private step = 0;
    private viewH = 0;
    private readonly tmp = new Vec3();

    onLoad() {
        this.step = this.cellHeight + this.spacing;
        this.viewH = this.scroll.node.getComponent(UITransform)!.height;
    }

    onEnable() { this.scroll.node.on('scrolling', this.refresh, this); }
    onDisable() { this.scroll.node.off('scrolling', this.refresh, this); }

    /** Nạp dữ liệu. Gọi lại bao nhiêu lần cũng được, không sinh thêm node. */
    setData(rows: RankRow[]) {
        this.rows = rows;
        const content = this.scroll.content!.getComponent(UITransform)!;
        content.setContentSize(content.width, Math.max(this.viewH, rows.length * this.step));
        for (const [i, n] of this.inUse) { this.pool.push(n); n.active = false; this.inUse.delete(i) }
        this.refresh();
    }

    private refresh() {
        if (!this.rows.length) return;
        const top = this.scroll.content!.position.y;            // >= 0, tăng khi cuộn xuống
        const first = Math.max(0, Math.floor(top / this.step) - this.buffer);
        const last = Math.min(this.rows.length - 1,
            Math.floor((top + this.viewH) / this.step) + this.buffer);

        // trả về pool những dòng đã ra khỏi khung
        for (const [i, n] of this.inUse) {
            if (i < first || i > last) { n.active = false; this.pool.push(n); this.inUse.delete(i) }
        }
        // lấy ô cho những dòng vừa vào khung
        for (let i = first; i <= last; i++) {
            if (this.inUse.has(i)) continue;
            const n = this.pool.pop() ?? this.makeCell();
            n.active = true;
            this.tmp.set(0, -i * this.step, 0);
            n.setPosition(this.tmp);
            this.bind(n, this.rows[i]);
            this.inUse.set(i, n);
        }
    }

    private makeCell(): Node {
        const n = instantiate(this.cellPrefab);
        n.setParent(this.scroll.content!);
        return n;
    }

    private bind(cell: Node, row: RankRow) {
        cell.getChildByName('Rank')!.getComponent(Label)!.string = String(row.rank);
        cell.getChildByName('Name')!.getComponent(Label)!.string = row.name;
        cell.getChildByName('Score')!.getComponent(Label)!.string = row.score.toLocaleString('vi-VN');
    }
}
```

**Chạy thử**
- `setData` với 500 dòng: đếm `scroll.content.children.length` phải ra khoảng **10–14**, không phải 500.
- Cuộn hết từ đầu tới cuối rồi đếm lại: con số không được tăng.
- Bật panel thống kê: draw call phải **đứng yên** trong lúc cuộn. Nhảy lên theo từng dòng nghĩa là ô đang dùng atlas khác nhau.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Design resolution là gì? Game dọc thì tick `Fit Width` hay `Fit Height`, vì sao?**
  → Design resolution là khung quy chiếu bạn dựng UI lên, ví dụ 720×1280, không phải kích thước màn hình thật. Game dọc tick `Fit Width` vì bề ngang là chiều cần giữ nguyên, còn chiều cao mới là chiều dao động giữa các máy từ 16:9 tới 21:9.
- `Mid` **Bảng xếp hạng 500 dòng, cuộn giật trên máy tầm trung. Anh sửa thế nào?**
  → Dựng đủ 500 dòng là vài nghìn node cộng với `Mask` của ScrollView, nên phải tái dùng ô: chỉ giữ khoảng 12 node đủ che màn hình cộng hai ô đệm, cuộn tới đâu đổi dữ liệu tới đó. Kiểm bằng cách đếm `content.children.length` — phải ra 10–14 chứ không phải 500.
- `Senior` **Một màn UI đang 180 draw call. Anh kéo xuống dưới 50 bằng cách nào, theo thứ tự nào?**
  → Bỏ `Mask` trước vì mỗi cái tốn khoảng 2 draw call và cắt chuỗi gộp, nhất là mask lồng nhau. Rồi đổi `Label` từ `NONE` sang `BITMAP` cho chữ tĩnh và `CHAR` cho số nhảy. Cuối cùng sắp lại thứ tự node theo atlas, vì sprite khác atlas chen vào giữa là gãy gộp — và sau mỗi bước đo lại chứ không sửa cả ba rồi đoán.

**Khung trả lời 60 giây** — "Làm sao UI chạy đúng trên mọi tỉ lệ màn hình?"

> Tôi chốt design resolution trước khi dựng màn nào: 720×1280 cho game dọc, và tick `Fit Width` vì chiều thay đổi trên điện thoại là chiều cao, từ 16:9 tới 21:9. Sau đó nguyên tắc là mọi thứ chạm mép màn hình đều neo bằng `Widget` vào mép thật chứ không đặt theo toạ độ tính từ design resolution, còn HUD trên cùng thì nằm trong node có `SafeArea` để tránh tai thỏ. `alignMode` để `ON_WINDOW_RESIZE`, không để `ALWAYS` trừ khi cha thật sự đổi kích thước liên tục. Cuối cùng là kiểm chứng: đổi tỉ lệ preview sang 4:3 rồi 20:9 — nếu chỉ đúng ở một tỉ lệ thì tôi đang neo sai, và cái đó không tự lộ ra trên máy mình.

**Họ sẽ đào tiếp**

- *"`ALWAYS` tốn ở chỗ nào?"* → Tính lại vị trí mỗi frame cho từng widget. Vài chục node là một khoản phí cố định mà profiler không chỉ thẳng vào.
- *"Vì sao 500 dòng lại giật?"* → Vài nghìn node và nhiều `Mask`. Chữa bằng virtual list, tối đa hơn chục ô tồn tại.
- *"Mỗi `Mask` tốn bao nhiêu?"* → Khoảng 2 draw call, và nó cắt chuỗi gộp — nên mask lồng nhau tệ theo cấp số.
- *"Chữ tiếng Việt bị ô vuông thì do đâu?"* → BMFont thiếu ký tự có dấu. Chữa bằng cách xuất đủ bộ, hoặc dùng TTF; và luôn có một chuỗi thử đủ dấu trong dự án.

**Cờ đỏ**

- Đặt UI theo toạ độ tuyệt đối rồi "chỉnh cho vừa máy mình".
- Không biết `Mask` tốn draw call, hoặc dùng `Mask` chỉ để bo góc.
- Trả lời "tôi tăng số ô lên cho mượt" thay vì tái dùng ô.
- Dùng `node.width` — API 2.x, lộ ngay là học từ tài liệu cũ.

**Số / ví dụ nên thuộc**

- 720×1280 dọc / 1280×720 ngang; game dọc tick `Fit Width`.
- Mỗi `Mask` ≈ **+2 draw call**.
- Ngưỡng phải virtual list: **~30 ô**.
- `Label` số nhảy liên tục → `cacheMode = CHAR`; chữ tĩnh → `BITMAP`.
- Mốc draw call cho một màn H5: **dưới ~50**.
