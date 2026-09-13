---
id: cocos-assets-bundle
title: Asset & Bundle
icon: 📦
summary: Ba cách lấy asset, chia Asset Bundle để gói chính nhẹ, đếm tham chiếu và ba kiểu rò, cùng cách nạp trước trong lúc người chơi còn ở menu.
status: deep
read: 860
level: intermediate
order: 60
tags: [cocos, asset, bundle, loading, memory]
related: [cocos-creator, cocos-minigame, unity-addressables, cocos-optimization]
---

Ở Unity, Addressables là thứ bạn thêm vào khi dự án đủ lớn. Ở Cocos, **Asset Bundle là cơ chế chính** — vì hạn mức gói của mini game và thời gian tải của H5 buộc bạn phải chia từ đầu, không phải tối ưu về sau.

## Ba cách lấy asset

| Cách | Asset nằm ở đâu | Dùng khi |
|---|---|---|
| `@property(SpriteFrame)` kéo trong Editor | **Đóng cùng** scene/prefab chứa nó | Thứ luôn cần: UI chính, nhân vật người chơi |
| `resources.load(path, Type, cb)` | Thư mục `assets/resources/` | Ít dùng — mọi thứ trong `resources/` đều vào gói chính |
| `bundle.load(path, Type, cb)` | Thư mục đã cấu hình thành bundle | **Mặc định cho nội dung lớn**: màn chơi, sự kiện, skin |

Luật thực dụng: **`resources/` càng nhỏ càng tốt**. Mọi thứ trong đó nằm trong gói chính, và gói chính là thứ bị chặn dung lượng.

## Cấu hình bundle

Chọn thư mục trong Editor → tick *Configure as Bundle*. Bốn tuỳ chọn quan trọng:

- **Bundle Name** — tên dùng để `loadBundle('ten')`. Đổi tên là gãy mọi chỗ gọi.
- **Priority** — bundle ưu tiên cao được nạp trước khi có tranh chấp.
- **Compression Type** — `Merge Dep` gộp phụ thuộc cho ít request hơn (tốt cho web), `Zip` nhỏ hơn nhưng tốn thời gian giải nén trên máy yếu.
- **Is Remote Bundle** — bundle nằm trên CDN, không nằm trong gói cài đặt. Đây là công tắc quyết định gói chính to hay nhỏ.

```ts
import { assetManager, SpriteFrame } from 'cc';

assetManager.loadBundle('level-pack', (err, bundle) => {
    if (err) { /* xử lý: thử lại hoặc báo người chơi */ return; }
    bundle.load('bg/level-3', SpriteFrame, (e, frame) => { /* … */ });
});
```

## Chia bundle theo "khi nào cần", không theo "loại gì"

Cách chia sai phổ biến: `textures`, `audio`, `prefabs` — nghe gọn nhưng vô dụng, vì để chơi màn 1 vẫn phải tải cả ba.

Cách chia đúng bám theo **hành trình người chơi**:

<figure class="fig">
<svg viewBox="0 0 660 260" role="img" aria-label="Gói chính chứa boot và UI cơ bản; trong lúc người chơi ở menu thì bundle game tải nền; bundle sự kiện tải khi mở sự kiện">
  <defs>
    <marker id="cab-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="20"  width="190" height="66" rx="9" class="fig-box"/>
    <rect x="244" y="20"  width="190" height="66" rx="9" class="fig-box"/>
    <rect x="478" y="20"  width="168" height="66" rx="9" class="fig-box"/>
    <rect x="10"  y="150" width="636" height="80" rx="9" class="fig-box"/>
  </g>
  <text x="105" y="46"  text-anchor="middle" class="fig-label" font-size="13">Gói chính</text>
  <text x="105" y="66"  text-anchor="middle" class="fig-muted" font-size="11">boot · UI · font · logo</text>
  <text x="339" y="46"  text-anchor="middle" class="fig-label" font-size="13">bundle "game"</text>
  <text x="339" y="66"  text-anchor="middle" class="fig-muted" font-size="11">tải nền lúc ở menu</text>
  <text x="562" y="46"  text-anchor="middle" class="fig-label" font-size="13">bundle "event"</text>
  <text x="562" y="66"  text-anchor="middle" class="fig-muted" font-size="11">chỉ khi mở sự kiện</text>
  <text x="328" y="176" text-anchor="middle" class="fig-label" font-size="13">Tiêu chí chia: thứ cần cho FRAME ĐẦU TIÊN nằm ở gói chính, phần còn lại là remote</text>
  <text x="328" y="200" text-anchor="middle" class="fig-muted" font-size="11">Người chơi đọc tiêu đề menu trong 3 giây — đó là 3 giây bạn có để tải phần còn lại</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cab-a)" fill="none">
    <path d="M200 53 H240"/>
    <path d="M434 53 H474"/>
  </g>
</svg>
<figcaption>Thời gian người chơi đứng ở menu là tài nguyên miễn phí. Dùng nó để nạp trước.</figcaption>
</figure>

`preload` tải về nhưng **chưa** dựng thành asset — rẻ và không giật:

```ts
// Ở menu: tải trước bundle game, không chặn giao diện
assetManager.preloadBundle?.('game');
bundle.preload('scenes/level-1', SceneAsset, (finished, total) => {
    this.progress.progress = finished / total;
});
```

## Đếm tham chiếu và ba kiểu rò

Asset trong Cocos dùng **đếm tham chiếu**. Hiểu sai chỗ này cho ra hai triệu chứng trái ngược nhau: hết bộ nhớ, hoặc **ảnh biến thành ô trắng giữa lúc chơi**.

| Kiểu rò | Triệu chứng | Nguyên nhân |
|---|---|---|
| Giữ tham chiếu | RAM tăng dần, chơi lâu thì crash | Biến tĩnh/mảng cache còn trỏ tới asset của màn cũ |
| Giải phóng sớm | Sprite thành ô trắng, chữ mất | `release` asset mà vẫn còn node đang dùng |
| Giải phóng nhầm nhánh | Màn sau thiếu ảnh ngẫu nhiên | `bundle.releaseAll()` trong khi bundle khác đang dùng chung asset |

Cách an toàn, theo thứ tự ưu tiên:

1. **Để engine tự lo** trong phần lớn trường hợp: scene có tuỳ chọn tự giải phóng asset khi rời scene.
2. **Dùng `addRef()` / `decRef()`** khi bạn chủ động giữ một asset qua nhiều scene.
3. **Chỉ `bundle.releaseAll()`** cho bundle rõ ràng là độc lập, ví dụ bundle sự kiện đã đóng.

```ts
// Giữ một asset xuyên scene: tăng đếm, và nhớ giảm khi không cần nữa
this.icon = frame;
this.icon.addRef();
// …
this.icon.decRef();
this.icon = null!;
```

Kiểm rò rất đơn giản: chơi vòng menu → màn chơi → menu **năm lần**, rồi nhìn bộ nhớ. Đường đồ thị phải về gần mức ban đầu sau mỗi vòng. Đi lên theo bậc thang là có rò.

## Bundle remote và phiên bản

Bundle remote nằm trên CDN. Hai điều phải chốt trước khi phát hành:

- **Địa chỉ CDN theo môi trường** (dev / staging / live), không hardcode trong code game.
- **Hash phiên bản**: build sinh ra tên file có hash, nên khi cập nhật nội dung thì URL đổi theo — người chơi không dính cache cũ. Đừng tự tắt hash để "dễ debug" rồi quên bật lại; đó là cách tạo ra lỗi "người chơi thấy nội dung cũ" không thể tái hiện trên máy bạn.

Tải bundle remote **phải có đường lùi**: mạng 3G rớt ở 70% là chuyện thường ngày. Thử lại có backoff, và nếu vẫn hỏng thì báo người chơi bằng tiếng người, đừng treo màn hình loading vô tận.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho khâu nạp asset**

Khâu này AI viết code **chạy đúng trên máy nhanh** rồi hỏng ở đúng chỗ khó tái hiện nhất: mạng chậm, mạng rớt, người chơi thoát giữa chừng. Vậy nên yêu cầu nó viết **đường hỏng trước**, đường thành công sau.

| Giao cho AI | Bạn quyết |
|---|---|
| Lớp `AssetService`: loadBundle có retry, preload có tiến độ, hàng đợi | Chia bundle nào, bundle nào remote |
| Chuyển code Addressables (Unity) sang bundle Cocos | Cái gì phải có ở frame đầu tiên |
| Script kiểm kích thước gói chính trong CI | Ngân sách dung lượng |
| Test giả lập mạng chậm / rớt | Địa chỉ CDN và quy trình phát hành |

**Phải nêu rõ** (thiếu là AI viết kiểu tải đồng bộ trên mạng lý tưởng):

- **Danh sách bundle và bundle nào là remote.**
- **Hạn mức gói chính** (ví dụ 4 MB) — nó không tự biết.
- **Hành vi khi tải hỏng**: thử lại mấy lần, rồi làm gì.
- **Có hiển thị tiến độ không**, và tiến độ tính theo gì.
- **Người chơi có được thoát giữa chừng không** — nếu có thì phải huỷ được request.

**Mẫu prompt**

```
Cocos Creator 3.8.x, TypeScript strict. Đích: web-mobile + WeChat mini game.
Bundle: "ui" (local), "game" (remote), "event-tet" (remote).
Gói chính phải dưới 4MB. Mạng mục tiêu: 3G Việt Nam, có lúc rớt.

Việc: viết `AssetService` (singleton trên GameRoot) với API:
  loadBundle(name): Promise<AssetManager.Bundle>
  preload(bundle, paths, onProgress): Promise<void>
  releaseBundle(name): void

RÀNG BUỘC:
- Thử lại 3 lần, backoff 0.5s / 1s / 2s. Hỏng hẳn thì reject với mã lỗi rõ ràng.
- Có thể huỷ: người chơi thoát màn loading thì request đang chạy phải dừng.
- KHÔNG release bundle đang có scene dùng — kiểm tra trước, không thì chỉ log cảnh báo.
- Tiến độ tính theo số asset hoàn tất / tổng, làm tròn, KHÔNG nhảy lùi.
- Viết ĐƯỜNG HỎNG TRƯỚC: liệt kê mọi cách hỏng rồi mới viết code.
```

**Bẫy thường gặp:** AI viết `assetManager.releaseAsset()` rải rác cho "gọn bộ nhớ" — và tạo ra ô trắng ngẫu nhiên rất khó tái hiện, vì asset đó đang được một node khác dùng. Bẫy thứ hai: nó nhét mọi thứ vào `resources/` cho tiện `resources.load`, làm gói chính phình vượt hạn mức mini game mà tới lúc build mới lộ.

## 💻 Code

`AssetService` có retry và huỷ được — thứ mà mọi dự án H5 đều cần và thường viết lại ba lần.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 220" role="img" aria-label="Luồng: gọi loadBundle, thử lại ba lần với backoff, thành công trả bundle, hỏng hẳn thì báo lỗi cho UI">
  <defs>
    <marker id="cab-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="82" width="140" height="60" rx="9" class="fig-box"/>
    <rect x="196" y="82" width="180" height="60" rx="9" class="fig-box"/>
    <rect x="430" y="14" width="216" height="58" rx="9" class="fig-box"/>
    <rect x="430" y="150" width="216" height="58" rx="9" class="fig-box"/>
  </g>
  <text x="80"  y="108" text-anchor="middle" class="fig-label" font-size="13">loadBundle()</text>
  <text x="80"  y="128" text-anchor="middle" class="fig-muted" font-size="11">có thể huỷ</text>
  <text x="286" y="108" text-anchor="middle" class="fig-label" font-size="13">thử lại ×3</text>
  <text x="286" y="128" text-anchor="middle" class="fig-muted" font-size="11">backoff 0.5 · 1 · 2 giây</text>
  <text x="538" y="40"  text-anchor="middle" class="fig-label" font-size="13">Bundle sẵn sàng</text>
  <text x="538" y="59"  text-anchor="middle" class="fig-muted" font-size="11">cache lại, lần sau trả ngay</text>
  <text x="538" y="176" text-anchor="middle" class="fig-label" font-size="13">Báo lỗi cho UI</text>
  <text x="538" y="195" text-anchor="middle" class="fig-muted" font-size="11">có nút Thử lại, KHÔNG treo</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cab-b)" fill="none">
    <path d="M150 112 H192"/>
    <path d="M376 100 Q403 100 403 43 H426"/>
    <path d="M376 124 Q403 124 403 179 H426"/>
  </g>
</svg>
<figcaption>Đường hỏng là đường được vẽ trước — vì nó là đường người chơi thật hay đi nhất.</figcaption>
</figure>

**Script**

```ts
// AssetService.ts — nạp bundle có retry, có huỷ, có tiến độ. Đặt trên GameRoot.
import { _decorator, Component, AssetManager, assetManager, Asset } from 'cc';
const { ccclass } = _decorator;

export class LoadCancelled extends Error { constructor() { super('cancelled') } }

@ccclass('AssetService')
export class AssetService extends Component {
    static inst: AssetService;
    private cache = new Map<string, AssetManager.Bundle>();
    private cancelled = new Set<string>();

    onLoad() { AssetService.inst = this; }

    /** Huỷ mọi lần nạp đang chờ của bundle này (người chơi thoát màn loading). */
    cancel(name: string) { this.cancelled.add(name); }

    async loadBundle(name: string, retries = 3): Promise<AssetManager.Bundle> {
        const hit = this.cache.get(name);
        if (hit) return hit;
        this.cancelled.delete(name);

        const delays = [500, 1000, 2000];
        let lastErr: unknown = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
            if (this.cancelled.has(name)) throw new LoadCancelled();
            try {
                const bundle = await new Promise<AssetManager.Bundle>((res, rej) => {
                    assetManager.loadBundle(name, (err, b) => (err ? rej(err) : res(b)));
                });
                this.cache.set(name, bundle);
                return bundle;
            } catch (e) {
                lastErr = e;
                if (attempt === retries) break;
                await this.wait(delays[Math.min(attempt, delays.length - 1)]);
            }
        }
        throw new Error(`Không nạp được bundle "${name}" sau ${retries + 1} lần: ${lastErr}`);
    }

    /** Nạp trước, báo tiến độ. Tiến độ chỉ tăng, không nhảy lùi. */
    async preload(name: string, paths: string[], onProgress?: (p: number) => void): Promise<void> {
        const bundle = await this.loadBundle(name);
        let best = 0;
        await new Promise<void>((res, rej) => {
            bundle.preload(paths, Asset,
                (finished, total) => {
                    const p = total > 0 ? finished / total : 1;
                    if (p > best) { best = p; onProgress?.(best) }
                },
                (err) => (err ? rej(err) : res()));
        });
        onProgress?.(1);
    }

    /** Chỉ gọi khi chắc chắn không scene nào đang dùng bundle này. */
    releaseBundle(name: string) {
        const b = this.cache.get(name);
        if (!b) return;
        b.releaseAll();
        assetManager.removeBundle(b);
        this.cache.delete(name);
    }

    private wait(ms: number) { return new Promise((r) => this.scheduleOnce(() => r(null), ms / 1000)); }
}
```

**Chạy thử**
- Chặn mạng trong DevTools rồi gọi `loadBundle('game')`: phải thấy **ba lần thử** cách nhau 0.5s / 1s / 2s rồi mới reject, không treo.
- Bật lại mạng ở giữa lần thử thứ hai: phải thành công, không cần tải lại trang.
- Gọi `cancel('game')` trong lúc đang thử lại: reject bằng `LoadCancelled`, và không có request nào tiếp theo.
- Gọi `loadBundle('game')` lần hai sau khi đã thành công: trả về **ngay lập tức** từ cache.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **`resources.load` khác `bundle.load` ở đâu? Vì sao nên hạn chế `resources/`?**
  → Cả hai đều nạp bất đồng bộ, nhưng mọi thứ trong `assets/resources/` đều bị đóng vào **gói chính**, còn bundle thì tách ra được và đặt remote trên CDN. Mini game bị chặn gói chính ở mức vài MB, nên `resources/` càng phình thì càng sớm chạm trần.
- `Mid` **Đang chơi thì một số ảnh biến thành ô trắng. Nguyên nhân nào hay gặp nhất?**
  → Giải phóng asset trong khi vẫn còn node đang dùng, thường do rải `releaseAsset` để "tiết kiệm RAM". Đếm tham chiếu về 0 quá sớm thì texture bị thu hồi còn node vẫn vẽ, ra ô trắng. Cách an toàn là để scene tự giải phóng, hoặc `addRef`/`decRef` khi chủ động giữ asset qua nhiều scene.
- `Senior` **Gói chính vượt hạn mức mini game 4MB. Anh cắt theo thứ tự nào?**
  → Đầu tiên là texture, vì đó là thứ chiếm chỗ: chuyển ảnh màn chơi sang bundle remote, bật nén theo nền tảng, tách ảnh nền lớn khỏi atlas. Rồi rút `resources/` xuống tối thiểu. Tiêu chí giữ lại rất gọn: chỉ thứ cần cho **frame đầu tiên** mới ở gói chính, phần còn lại tải nền trong lúc người chơi ở menu.

**Khung trả lời 60 giây** — "Chia Asset Bundle theo tiêu chí gì?"

> Tôi chia theo **khi nào cần**, không theo loại asset. Chia thành textures, audio, prefabs thì nghe gọn nhưng để chơi được màn một vẫn phải tải cả ba. Nên gói chính chỉ chứa thứ cần cho frame đầu tiên: boot, UI cơ bản, font, logo — phần còn lại thành bundle remote. Rồi tôi dùng khoảng thời gian người chơi đứng ở menu để `preload` bundle game chạy nền, vì ba giây họ đọc tiêu đề là ba giây miễn phí. Mọi lần tải remote đều phải có đường lùi: thử lại có backoff, hỏng hẳn thì hiện nút Thử lại chứ không treo màn loading. Và kiểm bằng cách thật: bật giả lập 3G rồi ngắt mạng giữa chừng, chứ không phải test trên wifi văn phòng.

**Họ sẽ đào tiếp**

- *"Vì sao ảnh thành ô trắng?"* → Giải phóng asset trong khi vẫn còn node dùng. Đếm tham chiếu về 0 quá sớm.
- *"Vậy khi nào mới `releaseAll`?"* → Khi bundle chắc chắn độc lập và không scene nào đang dùng — ví dụ bundle sự kiện vừa đóng.
- *"Kiểm rò bộ nhớ thế nào?"* → Vào ra màn chơi năm lần, nhìn đồ thị bộ nhớ có về gần mức ban đầu không.
- *"Hash phiên bản để làm gì?"* → Để URL đổi khi nội dung đổi, người chơi không dính cache cũ.

**Cờ đỏ**

- Nhét mọi thứ vào `resources/` cho tiện.
- Rải `releaseAsset` khắp nơi để "tiết kiệm RAM".
- Không có đường xử lý khi tải hỏng — chỉ có đường thành công.
- Test tải trên wifi văn phòng rồi kết luận là ổn.

**Số / ví dụ nên thuộc**

- Gói chính mini game: hạn mức cỡ **4 MB** (WeChat), tổng với subpackage cỡ 20 MB — tra lại tài liệu nền tảng.
- Tiêu chí gói chính: **thứ cần cho frame đầu tiên**.
- Retry: **3 lần**, backoff 0.5 / 1 / 2 giây.
- Kiểm rò: vào ra màn chơi **5 lần**, bộ nhớ phải về gần mức ban đầu.
- `preload` tải về nhưng **chưa dựng asset** — nên không gây giật.
