---
id: cocos-optimization
title: Tối ưu & profiling
icon: ⚡
summary: Đo trước khi sửa, luật gộp draw call, nguồn rác GC trên JS, chi phí ẩn của update, và ngân sách cho máy Android tầm thấp.
status: deep
read: 870
level: advanced
order: 70
tags: [cocos, performance, draw-call, gc, profiling]
related: [cocos-creator, cocos-ui, performance, unity-optimization]
---

Nguyên tắc chung — **đo trước, sửa sau** — không đổi theo engine, đọc [[performance]]. Node này nói ba thứ riêng của Cocos: draw call gộp theo luật nào, rác JS đến từ đâu, và chi phí ẩn của `update`.

Một lời cảnh báo mở đầu: trên web và mini game, **thiết bị của bạn nói dối**. Laptop dev chạy 60fps ở mọi cấu hình tệ nhất. Con số duy nhất đáng tin là con số đo trên chiếc Android rẻ tiền mà bạn để trong ngăn bàn.

## Đo cái gì, bằng gì

| Cần biết | Công cụ | Nhìn vào |
|---|---|---|
| Draw call, fps, số node | Panel thống kê của Cocos | `draw call`, `frame time`, `game logic` |
| Hàm nào tốn CPU | Chrome DevTools → Performance | Ngọn lửa cao nhất trong mỗi frame |
| Rác GC | DevTools → Memory → Allocation timeline | Cưa răng đều đặn = rác mỗi frame |
| Texture ăn RAM | DevTools Memory, hoặc log `assetManager` | Tổng bytes texture |
| Trên thiết bị thật | Remote debug qua Chrome (Android), IDE của nền tảng (mini game) | Cùng bộ số trên, nhưng đúng máy |

Thứ tự làm việc, **đừng đảo**: đo → tìm thủ phạm lớn nhất → sửa **một** thứ → đo lại. Sửa ba thứ cùng lúc rồi thấy nhanh hơn thì bạn không biết thứ nào có tác dụng, và lần sau sẽ lặp lại cả ba.

## Draw call: luật gộp

Cocos gộp hai phần tử liền nhau khi chúng **cùng texture và cùng material**. "Liền nhau" tính theo **thứ tự vẽ**, tức thứ tự node trong cây.

<figure class="fig">
<svg viewBox="0 0 660 230" role="img" aria-label="So sánh hai thứ tự node: xen kẽ atlas A và B cho ra sáu draw call, gom theo atlas cho ra hai draw call">
  <g class="fig-box-g">
    <rect x="10"  y="16" width="310" height="196" rx="9" class="fig-box"/>
    <rect x="340" y="16" width="306" height="196" rx="9" class="fig-box"/>
  </g>
  <text x="165" y="42"  text-anchor="middle" class="fig-label" font-size="13">Xen kẽ — 6 draw call</text>
  <text x="30"  y="72"  class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="30"  y="96"  class="fig-muted" font-size="12">Label   (texture riêng)</text>
  <text x="30"  y="120" class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="30"  y="144" class="fig-muted" font-size="12">Sprite (atlas B)</text>
  <text x="30"  y="168" class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="30"  y="192" class="fig-muted" font-size="12">Label   (texture riêng)</text>
  <text x="493" y="42"  text-anchor="middle" class="fig-label" font-size="13">Gom theo atlas — 2 draw call</text>
  <text x="360" y="72"  class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="360" y="96"  class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="360" y="120" class="fig-muted" font-size="12">Sprite (atlas A)</text>
  <text x="360" y="144" class="fig-muted" font-size="12">Sprite (atlas B)</text>
  <text x="360" y="168" class="fig-muted" font-size="12">Label BITMAP · Label BITMAP</text>
  <text x="360" y="196" class="fig-muted" font-size="11">hai Label dùng chung atlas động → gộp được</text>
</svg>
<figcaption>Cùng từng ấy phần tử, khác mỗi thứ tự node. Đây là lý do "sắp xếp theo ý nghĩa" lại tốn tiền.</figcaption>
</figure>

Thứ phá gộp, theo mức độ hay gặp:

1. **Sprite khác atlas chen vào giữa** — gom lại theo atlas, không gom theo ý nghĩa logic.
2. **`Label` để `cacheMode = NONE`** — mỗi label một texture. Chữ tĩnh đổi sang `BITMAP`, số nhảy đổi sang `CHAR`.
3. **`Mask`** — mỗi cái ≈ **+2 draw call** và cắt đôi chuỗi gộp. Mask lồng nhau tệ theo cấp số.
4. **`Graphics`** — không gộp với gì.
5. **`UIOpacity` ở node cha** — cả cây con bị xử lý riêng.

Mốc thực dụng: **dưới ~50 draw call** cho một màn H5. Cách tìm thủ phạm nhanh nhất: tắt lần lượt từng lớp UI trong Editor rồi nhìn con số tụt bao nhiêu.

## Rác GC: nguồn và cách bịt

GC của JS engine dừng cả thế giới. Trên máy yếu, mỗi lần dọn là một cú khựng. Rác đến từ những dòng trông rất vô hại:

| Dòng code | Rác sinh ra mỗi frame |
|---|---|
| `const v = new Vec3(...)` trong `update` | Một object |
| `arr.forEach(x => ...)` trong `update` | Một closure |
| `label.string = 'Điểm: ' + score` mỗi frame | Một chuỗi mới |
| `const list = [...]` trong hàm nóng | Một mảng |
| `node.getComponent(Sprite)` mỗi frame | Không sinh rác, nhưng tốn CPU — cache lại |

Bốn cách chữa, đủ cho 95% trường hợp:

```ts
// 1. Vector tái sử dụng ở cấp class
private readonly tmp = new Vec3();

// 2. Vòng lặp for thường thay cho forEach/map trong hot path
for (let i = 0; i < list.length; i++) { /* … */ }

// 3. Chỉ cập nhật chuỗi khi giá trị đổi
if (score !== this.lastScore) { this.label.string = String(score); this.lastScore = score }

// 4. Cache component ở onLoad
private sprite!: Sprite;
onLoad() { this.sprite = this.getComponent(Sprite)! }
```

Cách kiểm: mở Memory → Allocation timeline, chơi 30 giây. Đường phải **gần phẳng** khi không có gì sinh ra. Cưa răng đều đặn nghĩa là có rác mỗi frame, và nó sẽ thành giật trên máy yếu dù laptop bạn không thấy gì.

## Chi phí ẩn của `update`

Mỗi component có `update` là một lời gọi hàm mỗi frame. Hai trăm component mỗi cái làm một việc nhỏ vẫn cộng lại thành một khoản cố định — và profiler chỉ vào "engine", không chỉ vào bạn.

Ba cách giảm:

- **Xoá `update` rỗng.** Hàm `update` tồn tại nhưng không làm gì vẫn bị gọi.
- **Một manager tick nhiều đối tượng** thay vì mỗi đối tượng tự tick. 200 viên đạn nên là một vòng lặp trong một component, không phải 200 component.
- **`schedule` cho việc không cần mỗi frame.** Hồi máu mỗi giây, kiểm tra nhiệm vụ mỗi 2 giây: `this.schedule(this.tick, 1)` thay vì đếm dt trong `update`.

## Texture: nơi RAM bốc hơi

Một texture 2048×2048 không nén chiếm khoảng **16 MB** RAM (2048 × 2048 × 4 byte), bất kể file PNG trên đĩa chỉ 300 KB. Đây là khác biệt mà người mới hay bỏ sót: **dung lượng file không phải dung lượng bộ nhớ**.

- Atlas giữ ở **1024 hoặc 2048**, chia theo màn chơi thay vì nhét hết vào một cái.
- Bật nén theo nền tảng trong `.meta` (xem [[cocos-project-structure]]).
- Ảnh nền lớn dùng một mình thì **đừng** nhét vào atlas — nó kéo cả atlas vào RAM chỉ vì một ảnh.
- Giải phóng bundle của màn cũ khi chắc chắn không dùng nữa ([[cocos-assets-bundle]]).

## Ngân sách cho máy tầm thấp

Đặt ngân sách **trước**, đo **trong lúc làm**, không phải trước khi phát hành hai tuần:

| Chỉ số | Mốc cho H5 / mini game trên Android tầm thấp |
|---|---|
| Draw call mỗi màn | < 50 |
| Node trong scene | < 1500 |
| Texture trong RAM | < 120 MB |
| Rác mỗi frame | ~0 ở trạng thái nghỉ |
| Thời gian tới frame chơi được | < 5 giây trên 3G |

Con số là điểm khởi đầu để tranh luận, không phải luật. Nhưng có ngân sách viết ra thì mới cãi nhau được bằng số liệu; không có thì cãi bằng cảm giác.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho tối ưu**

Đây là chỗ AI dễ gây hại nhất nếu dùng sai thứ tự, vì nó **không đo được**. Hỏi "tối ưu giúp tôi" thì nó sẽ đề xuất pool, atlas, object reuse theo quán tính — đúng sách vở, và có thể chẳng liên quan gì tới thủ phạm thật trong dự án của bạn.

Cách dùng đúng: **bạn đo, nó sửa.**

| Giao cho AI | Bạn phải làm trước |
|---|---|
| Viết lại một hàm để bỏ cấp phát | **Đo** và chỉ ra đúng hàm đó |
| Gom vòng lặp 200 đối tượng vào một manager tick | Xác nhận `update` thật sự là thủ phạm |
| Script kiểm ngân sách (draw call, node count) trong CI | Chốt con số ngân sách |
| Chuyển Label sang CHAR/BITMAP hàng loạt | Biết draw call đang bao nhiêu và mục tiêu bao nhiêu |

**Phải nêu rõ** (thiếu là AI tối ưu mò):

- **Số đo trước khi sửa**: draw call bao nhiêu, fps bao nhiêu, trên máy nào.
- **Thủ phạm đã khoanh vùng** — dán ảnh profiler hoặc mô tả hàm nào cao nhất.
- **Ngân sách mục tiêu**.
- **Ràng buộc**: không đổi kiến trúc, không đổi asset, chỉ sửa trong file X.

**Mẫu prompt**

```
Cocos Creator 3.8.x. Đo trên Android 4 nhân 3GB RAM, màn chiến đấu:
- fps 32, mục tiêu 60
- draw call 178, mục tiêu < 50
- DevTools Performance: 42% thời gian frame nằm ở EnemyController.update
  (mỗi enemy một component update, 40 enemy cùng lúc)
- Allocation timeline: cưa răng ~2MB mỗi giây

Việc: gom 40 EnemyController thành MỘT EnemySystem tick tập trung.

RÀNG BUỘC:
- KHÔNG đổi prefab, KHÔNG đổi asset, chỉ sửa trong scripts/game/enemy/.
- CẤM cấp phát trong vòng lặp tick: vector tái sử dụng, vòng for thường.
- Giữ nguyên hành vi gameplay: không đổi tốc độ, không đổi thứ tự xử lý.
- Sau khi viết, nói rõ tôi phải đo lại chỉ số nào để biết có tác dụng.
```

**Bẫy thường gặp:** nhờ AI "tối ưu file này" mà không đưa số đo — nó sẽ viết lại code cho "sạch hơn", đổi hành vi ở vài chỗ nhỏ, và hiệu năng không nhúc nhích vì thủ phạm nằm ở chỗ khác. Bẫy thứ hai: nó đề xuất Web Worker hoặc WASM cho một game 2D đang tốn thời gian ở draw call.

## 💻 Code

Một component canh ngân sách: vượt là báo ngay trong lúc làm, không đợi tới lúc phát hành.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 210" role="img" aria-label="Inspector của BudgetWatch với ngưỡng draw call, node count, fps và khoảng thời gian kiểm tra">
  <g class="fig-box-g">
    <rect x="10" y="16" width="636" height="178" rx="9" class="fig-box"/>
  </g>
  <text x="30"  y="40"  class="fig-muted" font-size="11">INSPECTOR — BudgetWatch (gắn ở GameRoot, chỉ bật ở bản dev)</text>
  <text x="30"  y="72"  class="fig-label" font-size="13">Max Draw Calls</text>
  <text x="300" y="72"  class="fig-muted" font-size="12">50</text>
  <text x="30"  y="100" class="fig-label" font-size="13">Max Nodes</text>
  <text x="300" y="100" class="fig-muted" font-size="12">1500</text>
  <text x="30"  y="128" class="fig-label" font-size="13">Min FPS</text>
  <text x="300" y="128" class="fig-muted" font-size="12">50</text>
  <text x="30"  y="156" class="fig-label" font-size="13">Check Every (s)</text>
  <text x="300" y="156" class="fig-muted" font-size="12">2</text>
  <text x="380" y="72"  class="fig-muted" font-size="11">Vượt ngưỡng → log cảnh báo một lần mỗi loại,</text>
  <text x="380" y="92"  class="fig-muted" font-size="11">kèm scene và số đo, để không spam console.</text>
  <text x="380" y="128" class="fig-muted" font-size="11">Bản phát hành: tắt component này.</text>
</svg>
<figcaption>Ngân sách chỉ có tác dụng khi nó tự kêu. Ngân sách nằm trong tài liệu thì không ai đọc.</figcaption>
</figure>

**Script**

```ts
// BudgetWatch.ts — canh ngân sách hiệu năng trong lúc làm. Chỉ bật ở bản dev.
import { _decorator, Component, director, game, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BudgetWatch')
export class BudgetWatch extends Component {
    @property maxDrawCalls = 50;
    @property maxNodes = 1500;
    @property minFps = 50;
    @property checkEvery = 2;

    private frames = 0;
    private elapsed = 0;
    private warned = new Set<string>();

    onEnable() { this.frames = 0; this.elapsed = 0; this.warned.clear(); }

    update(dt: number) {
        this.frames++;
        this.elapsed += dt;
        if (this.elapsed < this.checkEvery) return;

        const fps = this.frames / this.elapsed;
        const scene = director.getScene()?.name ?? '?';
        const nodes = this.countNodes(director.getScene() as unknown as Node);
        const draws = (director.root as any)?.device?.numDrawCalls ?? -1;

        if (fps < this.minFps) this.warn('fps', `${scene}: ${fps.toFixed(1)} fps (ngưỡng ${this.minFps})`);
        if (nodes > this.maxNodes) this.warn('nodes', `${scene}: ${nodes} node (ngưỡng ${this.maxNodes})`);
        if (draws > this.maxDrawCalls) this.warn('draw', `${scene}: ${draws} draw call (ngưỡng ${this.maxDrawCalls})`);

        this.frames = 0;
        this.elapsed = 0;
    }

    /** Cảnh báo một lần cho mỗi loại mỗi scene — console sạch thì người ta mới đọc. */
    private warn(kind: string, msg: string) {
        const key = kind + '|' + (director.getScene()?.name ?? '');
        if (this.warned.has(key)) return;
        this.warned.add(key);
        console.warn('[NGÂN SÁCH] ' + msg);
    }

    private countNodes(root: Node | null): number {
        if (!root) return 0;
        let n = 1;
        for (const c of root.children) n += this.countNodes(c);
        return n;
    }
}
```

**Chạy thử**
- Đặt `maxDrawCalls = 1`: phải thấy đúng **một** dòng cảnh báo cho scene hiện tại, không spam mỗi 2 giây.
- Đổi scene rồi quay lại: cảnh báo hiện lại một lần cho scene mới.
- Bật panel thống kê của Cocos và so: con số draw call của hai bên phải khớp nhau.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Draw call là gì, và cái gì làm nó tăng trong UI Cocos?**
  → Draw call là một lệnh gửi cho GPU; Cocos gộp các phần tử liền nhau khi chúng cùng texture và cùng material. Thứ làm nó tăng là sprite khác atlas chen vào giữa, `Label` để `cacheMode = NONE`, `Mask` (mỗi cái khoảng +2), và `Graphics` — vì tất cả đều cắt chuỗi gộp.
- `Mid` **Game tụt fps trên Android tầm trung. Bước đầu tiên của anh là gì?**
  → Không sửa gì cho tới khi có số: bật panel thống kê trên đúng máy yếu đó, ghi fps, draw call, frame time, rồi xem DevTools Performance tìm ngọn lửa cao nhất. Lý do là laptop dev chạy 60fps ở mọi cấu hình tệ nhất, nên mọi kết luận đo ở máy dev đều vô nghĩa.
- `Senior` **Giật từng nhịp đều đặn mỗi vài giây, fps trung bình vẫn cao. Chuyện gì đang xảy ra?**
  → Gần như chắc chắn là GC: rác sinh đều mỗi frame, tới ngưỡng thì engine dọn và dừng cả thế giới. Mở Memory allocation timeline thấy cưa răng là xác nhận. Thủ phạm thường là `new Vec3` trong `update`, closure từ `forEach`, hoặc gán `label.string` mỗi frame dù giá trị không đổi.

**Khung trả lời 60 giây** — "Game tụt fps, anh làm gì đầu tiên?"

> Tôi không sửa gì cho tới khi có số. Bật panel thống kê trên đúng thiết bị yếu nhất mình hỗ trợ, ghi lại ba con số: fps, draw call, và thời gian mỗi frame. Rồi mở DevTools Performance xem ngọn lửa nào cao nhất trong một frame, và Memory allocation timeline xem có cưa răng không. Đến đây thường lộ ra một trong ba nhóm: draw call quá nhiều do UI xen kẽ atlas và mask, rác mỗi frame do cấp phát trong update, hoặc chi phí cố định do hàng trăm component cùng có update. Tôi sửa **một** thứ rồi đo lại, vì sửa ba thứ cùng lúc thì không biết thứ nào có tác dụng. Và con số chỉ tin khi đo trên máy thật — laptop dev chạy mượt ở mọi cấu hình tệ nhất.

**Họ sẽ đào tiếp**

- *"Giật đều đặn mà fps trung bình cao là dấu hiệu gì?"* → GC. Nhìn allocation timeline; tìm cấp phát trong vòng lặp nóng.
- *"UI 180 draw call thì cắt từ đâu?"* → Mask trước (mỗi cái +2 và cắt gộp), rồi Label `NONE` sang `BITMAP`/`CHAR`, rồi sắp lại thứ tự node theo atlas.
- *"Texture 2048 không nén tốn bao nhiêu RAM?"* → Khoảng 16 MB, bất kể file PNG chỉ vài trăm KB.
- *"200 component có `update` thì sao?"* → Một khoản cố định mỗi frame. Gom thành một manager tick, và xoá mọi `update` rỗng.

**Cờ đỏ**

- Đề xuất giải pháp trước khi đo.
- "Tôi bật pool và atlas là mượt hơn" mà không có số trước/sau.
- Kết luận hiệu năng dựa trên máy dev.
- Không phân biệt dung lượng file với dung lượng bộ nhớ của texture.

**Số / ví dụ nên thuộc**

- Ngân sách H5 máy tầm thấp: **< 50 draw call**, **< 1500 node**, **< 120 MB** texture.
- Mỗi `Mask` ≈ **+2 draw call**.
- Texture 2048×2048 không nén ≈ **16 MB** RAM.
- `Label`: chữ tĩnh → `BITMAP`, số nhảy → `CHAR`.
- Quy trình: **đo → sửa một thứ → đo lại**.
