---
id: cocos-animation-audio
title: Animation, tween & âm thanh
icon: 🏃
summary: Animation clip, Spine và cache mode, tween đúng cách, particle có ngân sách, và âm thanh trên web — nơi trình duyệt cấm phát trước khi người chơi chạm.
status: deep
read: 850
level: intermediate
order: 50
tags: [cocos, animation, tween, spine, audio, game-feel]
related: [cocos-creator, game-feel, cocos-optimization, audio-implementation]
---

Node này là lớp **cảm giác**: thứ làm một cú bắn trúng "đã tay" hay nhạt nhẽo. Lý thuyết ở [[game-feel]] và [[animation-game]] không đổi theo engine; đây là cách làm trong Cocos, cộng một cái bẫy chỉ có trên web mà không tài liệu nào nói đủ to: **trình duyệt cấm phát âm thanh trước khi người chơi chạm màn hình**.

## Ba cách làm chuyển động, chọn đúng cái

| Cách | Khi nào | Chi phí |
|---|---|---|
| `tween()` | Chuyển động do code quyết: bay lên, phóng to, mờ dần, đếm số | Rẻ nhất, không cần asset |
| `Animation` + clip | Chuyển động do người làm art vẽ ra theo khung hình | Trung bình |
| Spine / DragonBones | Nhân vật có xương, nhiều trạng thái, dùng lại nhiều | Đắt nhất, xem phần cache mode bên dưới |

Sai lầm hay gặp: dựng clip Animation cho một cú "phóng to rồi thu lại" — việc mà ba dòng tween làm được, lại chỉnh số được ngay trong code.

## Tween: mạnh, và dễ rò

```ts
import { tween, Vec3, UIOpacity } from 'cc';

tween(node)
    .to(0.12, { scale: new Vec3(1.25, 0.8, 1) }, { easing: 'quadOut' })   // squash
    .to(0.18, { scale: Vec3.ONE }, { easing: 'backOut' })                 // bật lại
    .start();
```

Ba luật bắt buộc khi dùng tween chung với pool ([[cocos-scene-component]]):

1. **Trả node về pool thì phải `Tween.stopAllByTarget(node)` trước.** Không thì tween của lần dùng trước còn chạy và kéo node mới đi lung tung.
2. **Đừng tween `node.position` bằng cách sửa vector tại chỗ.** Tween tự gọi `setPosition`, nhưng code của bạn xen vào giữa thì hỏng.
3. **Tween trên node đã huỷ** không tự dừng ở mọi trường hợp — dừng tường minh ở `onDisable`.

Chuỗi hay dùng: `.delay()`, `.call()`, `.union()` (gộp thành một khối để `repeat` cả cụm), `.repeatForever()`. Muốn hai thứ chạy song song thì dùng hai tween trên hai đối tượng, đừng cố nhét vào một chuỗi.

## Spine: cache mode là đòn bẩy hiệu năng lớn nhất

Spine trong Cocos có ba chế độ, và khoảng cách giữa chúng rất lớn:

| Chế độ | Cách chạy | Dùng cho |
|---|---|---|
| `REALTIME` (mặc định) | Tính xương mỗi frame trên CPU | Nhân vật chính, cần trộn động tác, cần gắn vũ khí vào xương |
| `SHARED_CACHE` | Tính **một lần**, mọi bản sao dùng chung | **Quái nhỏ xuất hiện hàng chục con cùng lúc** |
| `PRIVATE_CACHE` | Tính một lần cho riêng đối tượng đó | Trung gian: mỗi con chạy lệch pha nhau |

```ts
skeleton.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
skeleton.setAnimation(0, 'run', true);
```

Đổi 30 con quái từ `REALTIME` sang `SHARED_CACHE` thường là tối ưu một dòng cho ra vài fps trên máy yếu. Cái giá: cache không trộn được động tác, không đổi được xương lúc chạy, và đổi chế độ **phải làm trước khi** `setAnimation`.

## Particle: có ngân sách, có pool

`ParticleSystem2D` đẹp và tốn. Hai luật:

- **Ngân sách trước, hiệu ứng sau.** Ví dụ: tối đa 6 hiệu ứng nổ cùng lúc, mỗi cái ≤ 30 hạt. Vượt thì bỏ hiệu ứng cũ nhất, đừng xếp hàng.
- **Pool cả hiệu ứng.** `instantiate` một prefab particle mỗi lần nổ là cách chắc chắn tạo cưa răng GC.

Hiệu ứng trúng đòn thường **không cần** particle: một cú giật khung hình (hitstop), một cái nháy trắng, một con số bay lên là đủ và rẻ hơn nhiều. Xem [[game-feel]].

## Hitstop và rung màn: làm thế nào khi không có `Time.timeScale`

Cocos không có công tắc làm chậm cả thế giới. Tự làm, và làm ở đúng ba chỗ:

```ts
// GameClock.ts — mọi hệ thống gameplay lấy dt qua đây, không lấy thẳng từ update
export class GameClock {
    private freeze = 0;
    scale = 1;
    hitstop(seconds: number) { this.freeze = Math.max(this.freeze, seconds); }
    /** Trả về dt đã điều chỉnh. Gọi một lần mỗi frame ở component có executionOrder nhỏ nhất. */
    step(rawDt: number): number {
        if (this.freeze > 0) { this.freeze -= rawDt; return 0; }
        return rawDt * this.scale;
    }
}
```

Ba chỗ phải chạm tới khi pause hoặc slow-motion: **dt của gameplay** (như trên), **`PhysicsSystem2D.instance.enable`** nếu đang bật vật lý, và **tween** (`Tween.pauseAllByTarget`). Quên chỗ thứ ba là lỗi hay gặp nhất: game "dừng" nhưng UI vẫn trôi mượt, trông như hỏng.

## Âm thanh: cái bẫy chỉ có trên web

Trình duyệt **chặn mọi âm thanh cho tới khi người chơi tương tác lần đầu**. Một game H5 phát nhạc nền ở `start()` sẽ im lặng, không lỗi, và trên máy dev thì… vẫn kêu (vì bạn vừa bấm vào cửa sổ). Đây là lý do "game em ở nhà có nhạc, lên host thì không".

Cách chữa đúng: **mồi âm thanh trong handler của lần chạm đầu tiên**.

```ts
import { AudioSource, director, Node } from 'cc';

private primed = false;
onEnable() { director.getScene()!.on(Node.EventType.TOUCH_START, this.prime, this, true); }

private prime() {
    if (this.primed) return;
    this.primed = true;
    this.bgm.play();               // lần chạm đầu tiên: bắt đầu nhạc nền
    director.getScene()!.off(Node.EventType.TOUCH_START, this.prime, this, true);
}
```

Bốn điều nữa về audio trên Cocos:

- **`playOneShot(clip, volume)`** cho hiệu ứng ngắn — không chiếm `AudioSource`, chồng được nhiều tiếng. `play()` cho nhạc nền.
- **Đừng preload nhạc dài.** Nhạc nền 3 phút nạp sẵn là lý do phổ biến nhất khiến màn tải lâu. Để chế độ stream.
- **Một `AudioSource` cho nhạc, một pool nhỏ cho hiệu ứng** — mỗi lần phát lại `addComponent(AudioSource)` là rò.
- **Trên mini game**, âm thanh đi qua API của nền tảng; giới hạn số âm thanh phát cùng lúc khắt khe hơn web. Thử trên thiết bị thật sớm — xem [[cocos-minigame]].

## 🤖 Prompt cho AI

**Dùng AI thế nào cho lớp cảm giác**

Nghịch lý: AI viết được ngay chuỗi tween "squash rồi stretch", nhưng **không biết con số nào cho ra cảm giác đúng** — 0.12 giây hay 0.4 giây là khác biệt giữa "đã tay" và "lờ đờ", mà nó không có cách nào biết. Vậy nên:

| Giao cho AI | Bạn giữ |
|---|---|
| Khung code: GameClock, pool hiệu ứng, hàng đợi âm thanh, hàm shake | **Mọi con số thời lượng và biên độ** — chỉnh bằng mắt |
| Mồi âm thanh, xử lý autoplay policy, quản lý AudioSource | Chọn hiệu ứng nào cho hành động nào |
| Chuyển DOTween (Unity) sang `tween()` của Cocos | Ngân sách particle |
| Script đổi hàng loạt Spine sang SHARED_CACHE | Con nào được giữ REALTIME |

**Phải nêu rõ** (thiếu là AI bịa số và bịa API):

- **Có dùng Spine/DragonBones không**, và con nào cần trộn động tác.
- **Có pool không** — nếu có thì bắt buộc `Tween.stopAllByTarget` khi trả về.
- **Pause/slow-motion hoạt động ra sao** trong dự án (có `GameClock` chưa).
- **Nền tảng**: web hay mini game — quyết định cách xử lý audio.
- **Ngân sách**: bao nhiêu hiệu ứng cùng lúc, bao nhiêu hạt mỗi hiệu ứng.

**Mẫu prompt**

```
Cocos Creator 3.8.x, TypeScript strict, game bắn 2D, đích web-mobile + WeChat.
Đã có GameClock.step(dt) trả dt đã điều chỉnh; mọi gameplay dùng dt đó.
Đã có class Pool. Ngân sách: tối đa 6 hiệu ứng nổ cùng lúc, 30 hạt mỗi cái.

Việc: viết `JuiceKit` cung cấp hitstop(ms), shake(cường độ, thời lượng),
popupDamage(vị trí, số), tất cả dùng tween và pool.

RÀNG BUỘC:
- CHỈ API 3.x. CẤM cc.tween / cc.v2 / node.width.
- Node trả về pool PHẢI gọi Tween.stopAllByTarget trước.
- CẤM cấp phát Vec3 trong hàm gọi mỗi lần trúng đòn — dùng vector tái sử dụng.
- Âm thanh: playOneShot cho hiệu ứng; KHÔNG addComponent(AudioSource) mỗi lần phát.
- Mọi thời lượng để thành @property chỉnh được trong Inspector, ĐỪNG hardcode.

Ghi rõ giá trị mặc định bạn chọn và vì sao — tôi sẽ tự chỉnh lại bằng mắt.
```

**Bẫy thường gặp:** AI viết `AudioSource` mới cho mỗi lần phát hiệu ứng — sau vài phút chơi là vài trăm component sống, âm thanh bắt đầu trễ và bộ nhớ leo. Bẫy thứ hai: nó phát nhạc nền trong `start()` rồi khẳng định đã xong, trong khi trên host thật thì im lặng vì autoplay policy.

## 💻 Code

Bộ "juice" tối thiểu: hitstop, rung màn, số damage bay lên. Ba thứ này làm được 80% cảm giác đã tay.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 260" role="img" aria-label="Hierarchy: GameRoot chứa JuiceKit và AudioPool; Canvas chứa Camera node và PopupLayer; Inspector của JuiceKit với các thời lượng">
  <g class="fig-box-g">
    <rect x="10"  y="16" width="280" height="228" rx="9" class="fig-box"/>
    <rect x="320" y="16" width="326" height="228" rx="9" class="fig-box"/>
  </g>
  <text x="26"  y="40"  class="fig-muted" font-size="11">HIERARCHY</text>
  <text x="26"  y="68"  class="fig-label" font-size="13">▾ GameRoot</text>
  <text x="42"  y="92"  class="fig-muted" font-size="12">JuiceKit.ts · AudioSource (BGM)</text>
  <text x="26"  y="122" class="fig-label" font-size="13">▾ Canvas</text>
  <text x="42"  y="146" class="fig-muted" font-size="12">ShakeRoot   ← mọi thứ rung nằm trong đây</text>
  <text x="58"  y="170" class="fig-muted" font-size="12">GameLayer · UILayer</text>
  <text x="42"  y="198" class="fig-muted" font-size="12">PopupLayer  ← số damage, KHÔNG rung</text>
  <text x="336" y="40"  class="fig-muted" font-size="11">INSPECTOR — JuiceKit</text>
  <text x="336" y="68"  class="fig-label" font-size="13">Shake Root</text>
  <text x="580" y="68"  class="fig-muted" font-size="12">ShakeRoot</text>
  <text x="336" y="96"  class="fig-label" font-size="13">Popup Layer</text>
  <text x="580" y="96"  class="fig-muted" font-size="12">PopupLayer</text>
  <text x="336" y="124" class="fig-label" font-size="13">Hitstop Seconds</text>
  <text x="580" y="124" class="fig-muted" font-size="12">0.06</text>
  <text x="336" y="152" class="fig-label" font-size="13">Shake Seconds</text>
  <text x="580" y="152" class="fig-muted" font-size="12">0.18</text>
  <text x="336" y="180" class="fig-label" font-size="13">Popup Rise</text>
  <text x="580" y="180" class="fig-muted" font-size="12">90</text>
</svg>
<figcaption>Số damage nằm ngoài <code>ShakeRoot</code> — chữ rung theo màn hình thì đọc không nổi.</figcaption>
</figure>

**Script**

```ts
// JuiceKit.ts — hitstop, rung màn, số damage. Mọi thời lượng chỉnh trong Inspector.
import { _decorator, Component, Node, Prefab, Vec3, Label, tween, Tween,
         instantiate, AudioSource, AudioClip, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JuiceKit')
export class JuiceKit extends Component {
    @property(Node) shakeRoot: Node = null!;
    @property(Node) popupLayer: Node = null!;
    @property(Prefab) popupPrefab: Prefab = null!;
    @property(AudioSource) sfxSource: AudioSource = null!;
    @property hitstopSeconds = 0.06;
    @property shakeSeconds = 0.18;
    @property shakeAmount = 12;
    @property popupRise = 90;
    @property popupSeconds = 0.55;

    private freeze = 0;
    private pool: Node[] = [];
    private readonly home = new Vec3();
    private readonly tmp = new Vec3();

    onLoad() { this.shakeRoot.getPosition(this.home); }

    /** Gọi ở đầu mỗi frame. Trả 0 khi đang đóng băng → gameplay đứng, UI vẫn chạy. */
    step(rawDt: number): number {
        if (this.freeze > 0) { this.freeze -= rawDt; return 0; }
        return rawDt;
    }

    hitstop(seconds = this.hitstopSeconds) {
        this.freeze = Math.max(this.freeze, seconds);
    }

    shake(scale = 1) {
        Tween.stopAllByTarget(this.shakeRoot);
        const amp = this.shakeAmount * scale;
        const step = this.shakeSeconds / 4;
        tween(this.shakeRoot)
            .to(step, { position: new Vec3(this.home.x + amp, this.home.y - amp * 0.6, 0) })
            .to(step, { position: new Vec3(this.home.x - amp * 0.7, this.home.y + amp * 0.4, 0) })
            .to(step, { position: new Vec3(this.home.x + amp * 0.35, this.home.y, 0) })
            .to(step, { position: this.home.clone() })
            .start();
    }

    popupDamage(worldPos: Vec3, amount: number, crit = false) {
        const n = this.pool.pop() ?? instantiate(this.popupPrefab);
        if (!n.parent) n.setParent(this.popupLayer);
        Tween.stopAllByTarget(n);                       // BẮT BUỘC trước khi tái dùng
        n.active = true;
        n.setPosition(worldPos);
        n.setScale(crit ? 1.4 : 1, crit ? 1.4 : 1, 1);

        const label = n.getComponent(Label)!;
        label.string = String(amount);
        const op = n.getComponent(UIOpacity) ?? n.addComponent(UIOpacity);
        op.opacity = 255;

        this.tmp.set(worldPos.x, worldPos.y + this.popupRise, 0);
        tween(n).to(this.popupSeconds, { position: this.tmp }, { easing: 'quadOut' }).start();
        tween(op).delay(this.popupSeconds * 0.5)
                 .to(this.popupSeconds * 0.5, { opacity: 0 })
                 .call(() => { n.active = false; this.pool.push(n) })
                 .start();
    }

    playSfx(clip: AudioClip, volume = 1) {
        this.sfxSource.playOneShot(clip, volume);       // KHÔNG tạo AudioSource mới
    }

    /** Trúng đòn: gọi một hàm này là đủ. */
    onHit(worldPos: Vec3, damage: number, clip?: AudioClip) {
        this.hitstop();
        this.shake(damage > 50 ? 1.6 : 1);
        this.popupDamage(worldPos, damage, damage > 50);
        if (clip) this.playSfx(clip);
    }
}
```

**Chạy thử**
- Gọi `onHit` liên tục 30 giây: `popupLayer.children.length` chững lại quanh 8–12, không tăng mãi.
- Đặt `hitstopSeconds = 0.3`: game phải **đứng hình rõ rệt** rồi chạy tiếp — xác nhận `step()` đang được dùng thay cho `dt` thô.
- Trên trình duyệt: tải trang, **không chạm gì**, gọi `playSfx` → không có tiếng (đúng như mong đợi). Chạm một cái rồi gọi lại → có tiếng.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Khi nào dùng tween, khi nào dùng Animation clip?**
  → Tween cho chuyển động do code quyết và cần chỉnh số nhanh: phóng to thu lại, bay lên, mờ dần — ba dòng là xong, không cần asset. Animation clip cho chuyển động do người làm art vẽ theo khung hình. Dựng clip cho một cú squash 0.12 giây là tự làm khó mình vì mỗi lần chỉnh phải mở Editor.
- `Mid` **Game H5 trên host không có nhạc, ở máy anh thì có. Nguyên nhân?**
  → Autoplay policy: trình duyệt chặn âm thanh cho tới khi người chơi tương tác lần đầu, và chặn im lặng không báo lỗi. Ở máy dev mình vừa bấm vào cửa sổ nên nghe được. Chữa bằng cách mồi âm thanh trong chính handler của lần chạm đầu tiên rồi gỡ listener đi.
- `Senior` **40 con quái Spine làm tụt fps. Anh xử lý theo thứ tự nào?**
  → Đổi những con không cần trộn động tác sang `SHARED_CACHE` trước, vì đó là tối ưu một dòng và phải đặt **trước** `setAnimation`. Cái giá là không trộn được động tác và không gắn được vật vào xương, nên nhân vật chính vẫn giữ `REALTIME`. Nếu vẫn chưa đủ thì giảm số con hiển thị cùng lúc, chứ đừng giảm chất lượng animation của con chính.

**Khung trả lời 60 giây** — "Game trên web không có âm thanh, nguyên nhân?"

> Gần như chắc chắn là autoplay policy: trình duyệt chặn âm thanh cho tới khi người chơi tương tác lần đầu. Ở máy dev thì mình vừa bấm vào cửa sổ nên nó kêu, còn người chơi mở link, chưa chạm gì, nhạc gọi `play()` trong `start()` thì bị chặn im lặng, không có lỗi nào cả. Cách chữa là mồi âm thanh trong chính handler của lần chạm đầu tiên rồi gỡ listener đi. Tôi cũng tách một `AudioSource` cho nhạc nền và dùng `playOneShot` cho hiệu ứng, vì tạo `AudioSource` mới mỗi lần phát là vừa rò vừa làm tiếng bị trễ dần. Trên mini game thì audio đi qua API nền tảng và giới hạn khắt khe hơn, nên tôi thử trên thiết bị thật từ sớm.

**Họ sẽ đào tiếp**

- *"Spine tụt fps thì làm gì trước?"* → Đổi những con không cần trộn động tác sang `SHARED_CACHE`, và phải đổi **trước** `setAnimation`. Đó là tối ưu một dòng.
- *"Cache mode mất gì?"* → Không trộn được động tác, không đổi xương lúc chạy, không gắn được vật vào xương động.
- *"Pause trong Cocos làm sao?"* → Không có `Time.timeScale`. Phải chạm ba chỗ: dt của gameplay, `PhysicsSystem2D.enable`, và tween.
- *"Trả node về pool cần gì?"* → `Tween.stopAllByTarget` trước tiên, rồi reset trạng thái. Quên thì tween cũ kéo node mới đi.

**Cờ đỏ**

- Dựng Animation clip cho những thứ tween ba dòng làm xong.
- Không biết autoplay policy, đổ cho "host lỗi".
- Tạo `AudioSource` mới cho mỗi tiếng động.
- Hiệu ứng không có ngân sách: nổ bao nhiêu cũng phát, rồi ngạc nhiên vì tụt fps ở phút thứ ba.

**Số / ví dụ nên thuộc**

- Hitstop cho đòn thường: **0.05–0.08 giây**. Dài hơn 0.15 là thấy khựng khó chịu.
- Squash/stretch: **0.10–0.15 giây** mỗi chặng.
- Spine: `SHARED_CACHE` cho quái nhỏ, `REALTIME` cho nhân vật chính.
- Pause cần chạm **ba** chỗ: dt gameplay · vật lý · tween.
- Âm thanh web chỉ phát được **sau tương tác đầu tiên** của người chơi.
