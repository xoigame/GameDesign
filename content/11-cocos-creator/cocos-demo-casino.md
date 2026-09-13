---
id: cocos-demo-casino
title: Demo — game casino
icon: 🎰
summary: Dựng slot và game bài trong Cocos: server quyết kết quả, client chỉ diễn hoạt, bảng trọng số và RTP tính được, cùng ranh giới pháp lý phải biết trước.
status: deep
read: 895
level: advanced
order: 120
tags: [cocos, demo, casino, slot, rng, server-authoritative]
related: [cocos-creator, backend-go, randomness, economy-design]
---

Casino là thể loại lớn nhất của mảng H5 và mini game ở châu Á, và cũng là thể loại **dễ làm sai nhất về mặt kỹ thuật** — vì phần lớn hướng dẫn trên mạng cho client tự random rồi hiện kết quả.

Node này dựng một **slot machine** làm ví dụ chính, kèm phần riêng cho game bài. Lý thuyết ngẫu nhiên ở [[randomness]], kinh tế ở [[economy-design]]; đây là phần hiện thực hoá trong Cocos.

## Ranh giới phải chốt trước dòng code đầu tiên

| Loại | Nghĩa là gì | Hệ quả |
|---|---|---|
| **Social casino** | Chơi bằng tiền ảo, **không đổi ra tiền thật** | Đây là phạm vi của node này |
| **Real-money gambling** | Cược và rút được tiền thật | Cần giấy phép, kiểm định RNG độc lập, tuân thủ theo từng quốc gia — **ngoài phạm vi** |

Ba điều đúng cả với social casino, đừng bỏ qua vì "chỉ là tiền ảo":

- **Cửa hàng ứng dụng và siêu ứng dụng có chính sách riêng** cho thể loại này, kèm giới hạn độ tuổi và giới hạn theo vùng. Đọc trước khi làm, không phải trước khi phát hành.
- **Đừng hiển thị tỉ lệ sai sự thật.** Nếu game khoe "tỉ lệ thắng 95%" thì con số đó phải là con số thật trong bảng trọng số.
- **Đừng thiết kế để đánh lừa cảm giác xác suất**: near-miss giả (cố tình cho dừng sát ô jackpot khi kết quả đã là thua) là kỹ thuật bị soi ở nhiều thị trường. Muốn tạo hồi hộp thì tạo bằng nhịp quay và âm thanh, không bằng việc nói dối về xác suất.

## Luật số một: server quyết, client diễn

Đây là khác biệt giữa một demo và một sản phẩm.

<figure class="fig">
<svg viewBox="0 0 660 240" role="img" aria-label="Client gửi yêu cầu quay, server rút kết quả từ bảng trọng số và ghi sổ, trả về kết quả đã chốt; client chỉ chạy animation dừng đúng vào kết quả đó">
  <defs>
    <marker id="cdc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="90"  width="160" height="66" rx="9" class="fig-box"/>
    <rect x="250" y="20"  width="180" height="60" rx="9" class="fig-box"/>
    <rect x="250" y="160" width="180" height="60" rx="9" class="fig-box"/>
    <rect x="500" y="90"  width="146" height="66" rx="9" class="fig-box"/>
  </g>
  <text x="90"  y="116" text-anchor="middle" class="fig-label" font-size="13">Client</text>
  <text x="90"  y="136" text-anchor="middle" class="fig-muted" font-size="11">gửi "tôi muốn quay"</text>
  <text x="340" y="46"  text-anchor="middle" class="fig-label" font-size="13">Server: rút kết quả</text>
  <text x="340" y="65"  text-anchor="middle" class="fig-muted" font-size="11">bảng trọng số · seed · RNG</text>
  <text x="340" y="186" text-anchor="middle" class="fig-label" font-size="13">Server: ghi sổ cái</text>
  <text x="340" y="205" text-anchor="middle" class="fig-muted" font-size="11">trừ cược · cộng thưởng · idempotent</text>
  <text x="573" y="116" text-anchor="middle" class="fig-label" font-size="13">Client diễn hoạt</text>
  <text x="573" y="136" text-anchor="middle" class="fig-muted" font-size="11">quay rồi DỪNG ĐÚNG kết quả</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cdc-a)" fill="none">
    <path d="M170 110 Q210 110 210 50 H246"/>
    <path d="M340 80 V156"/>
    <path d="M430 190 Q466 190 466 123 H496"/>
  </g>
</svg>
<figcaption>Client không bao giờ biết kết quả trước khi server chốt, và cũng không bao giờ tự quyết. Animation chỉ là cách kể lại một chuyện đã xong.</figcaption>
</figure>

Hệ quả thực hành, cả ba đều bắt buộc:

1. **Client gửi ý định** (`spin` với mức cược), **server trả kết quả** (ô dừng, tiền thắng, số dư mới).
2. **Mọi lệnh mang `request_id` UNIQUE** — mất mạng bấm lại không thành hai lần trừ tiền. Xem idempotency ở [[backend-go]].
3. **Ghi sổ cái append-only**: mỗi lần quay là một dòng không sửa được, để đối soát khi có khiếu nại.

Vì sao nghiêm ngặt tới vậy: gói JS của mini game nằm trên máy người chơi, đọc và sửa được. Bất cứ thứ gì client tự quyết thì client sửa được.

## Reel strip và bảng trọng số

Slot không random ra biểu tượng — nó random ra **vị trí dừng trên một dải reel**. Cấu trúc dữ liệu:

```json
// assets/data/slot.json — chỉ để CLIENT vẽ; bản thật nằm ở server
{
  "reels": [
    ["cherry","bell","seven","cherry","bar","cherry","bell","seven","bar","cherry"],
    ["bell","cherry","bar","seven","cherry","bell","bar","cherry","seven","bell"],
    ["seven","cherry","bell","bar","cherry","seven","bell","cherry","bar","bell"]
  ],
  "paylines": [[1,1,1],[0,0,0],[2,2,2],[0,1,2],[2,1,0]],
  "payouts": { "seven3": 200, "bar3": 50, "bell3": 20, "cherry3": 10, "cherry2": 2 }
}
```

Tần suất mỗi biểu tượng trên dải reel **chính là** xác suất của nó. Muốn `seven` hiếm thì cho nó xuất hiện 1 lần trên dải 20 ô, không phải viết `if (random < 0.05)` ở đâu đó — cách thứ hai làm bảng trả thưởng không tính được.

## RTP: con số phải tính được, không phải cảm giác

**RTP** (return to player) là tỉ lệ tiền trả lại người chơi trên tổng tiền cược, tính trên vô hạn lượt. Nó là **hệ quả của bảng trọng số và bảng trả thưởng**, không phải tham số bạn chỉnh riêng.

Hai cách tính, làm cả hai:

- **Tính chính xác** khi số tổ hợp đủ nhỏ: 3 reel × 20 ô = 8.000 tổ hợp — duyệt hết trong vài mili giây.
- **Mô phỏng** 10 triệu lượt bằng `node` để xác nhận con số chính xác kia, và để nhìn **phương sai**: hai bảng cùng RTP 92% có thể cho hai trải nghiệm hoàn toàn khác nhau, một bên thắng nhỏ liên tục, một bên im lặng rất lâu rồi nổ lớn.

Cả hai chạy trong `scripts/core/` không import `'cc'` ([[cocos-project-structure]]), nên chúng là **test**, không phải việc làm tay.

Đổi một ô trên dải reel là đổi RTP. Vì vậy bảng reel phải nằm trong CI: test khoá RTP trong một khoảng, ai sửa làm lệch là build đỏ.

## Client: quay thế nào để dừng đúng ô

Bài toán: server trả về "reel 0 dừng ở ô 7, reel 1 ở ô 2, reel 2 ở ô 5", client phải quay cho đẹp rồi dừng **chính xác** vào đó.

Cách làm gọn nhất là quay theo **quãng đường**, không theo thời gian:

1. Tính vị trí cuối cùng = `(số vòng nguyên) × chiều dài dải + vị trí đích`.
2. Tween từ vị trí hiện tại tới vị trí đó bằng easing `quintOut` hoặc `backOut` nhẹ.
3. Mỗi reel dừng lệch nhau 0.2–0.3 giây để tạo nhịp.

Ba chi tiết tạo ra cảm giác "thật":

- **Reel cuối quay lâu hơn** một chút — đó là chỗ hồi hộp nằm.
- **Bật lại nhẹ khi dừng** (`backOut` biên độ nhỏ) cho cảm giác cơ học.
- **Âm thanh từng ô trôi qua**, tắt dần khi chậm lại. Chi tiết này làm nhiều việc hơn mọi hiệu ứng hạt.

## Game bài: ba thứ khác slot

Nếu làm tiến lên, phỏm, mậu binh hay poker, ba điểm khác biệt đáng lưu ý:

- **Bộ bài xáo ở server, chia ở server.** Client chỉ biết bài của chính mình. Gửi cả bộ bài xuống rồi "ẩn đi trên giao diện" là lỗi bảo mật, không phải lỗi giao diện.
- **Xáo bài đúng cách**: Fisher–Yates, dùng nguồn ngẫu nhiên an toàn ở server. `Math.random()` của client không bao giờ được quyết bài.
- **Trạng thái ván phải khôi phục được.** Người chơi rớt mạng giữa ván là chuyện thường; server giữ trạng thái, client vào lại thì đồng bộ lại — đây là phần khó nhất của game bài nhiều người.

Luật bài thì nên nằm trong `scripts/core/` để chạy được cả ở client (dự đoán, gợi ý nước đi) lẫn ở server (phân xử) — nhưng **server luôn là bên phân xử cuối cùng**.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho game casino**

AI viết phần toán của slot rất tốt vì nó **kiểm chứng được bằng mô phỏng**, nhưng nó có đúng một thói quen nguy hiểm: **để client tự random**, vì mọi tutorial đều làm thế. Đó là thứ bạn phải cấm thẳng trong prompt.

| Giao cho AI | Bạn quyết |
|---|---|
| Hàm tính RTP chính xác + mô phỏng 10 triệu lượt | Bảng reel và bảng trả thưởng (đó là thiết kế) |
| Fisher–Yates, chọn theo trọng số, test thống kê | Mức cược, giới hạn, nhịp phần thưởng |
| Code client: quay reel, dừng đúng ô, hiệu ứng thắng | Ranh giới pháp lý và chính sách nền tảng |
| Luồng idempotency, sổ cái, khôi phục ván | RTP mục tiêu và mức phương sai |

**Phải nêu rõ** (thiếu là AI cho client tự random):

- **Có server không**, và server quyết cái gì — nói thẳng "client KHÔNG được random".
- **RTP mục tiêu** và khoảng chấp nhận được.
- **Bảng reel** thật, hoặc kích thước của nó.
- **Mức cược và giới hạn**.
- **Đây là social casino, tiền ảo** — để nó không sinh code thanh toán thật.

**Mẫu prompt**

```
Cocos Creator 3.8.x + backend Go. Social casino, TIỀN ẢO, không đổi tiền thật.
Slot 3 reel × 20 ô, 5 payline. RTP mục tiêu 92% (chấp nhận 91.5–92.5%).

Việc: viết scripts/core/slot.ts (KHÔNG import 'cc') gồm:
  evaluate(stops: number[], reels: string[][], paylines, payouts): number   // tiền thắng
  exactRTP(reels, paylines, payouts, bet): number                           // duyệt hết tổ hợp
  simulate(n, seed, ...): { rtp, hitRate, maxWin, variance }

RÀNG BUỘC:
- Hàm THUẦN, không side effect, test được bằng `node --test`.
- RNG nhận seed để mô phỏng lặp lại được (xorshift hoặc mulberry32), KHÔNG Math.random.
- CẤM mọi code quyết định kết quả ở client — client chỉ nhận stops từ server.
- Kèm test: exactRTP nằm trong 91.5–92.5%, và simulate(10_000_000) lệch < 0.3% so với exactRTP.
- Không sinh code thanh toán; tiền ảo do server quản.

Viết test TRƯỚC, rồi mới viết hàm.
```

**Bẫy thường gặp:** AI sinh `Math.random()` ở client rồi hiện kết quả — chạy đúng trong demo, và là lỗ hổng nghiêm trọng ngay khi có tiền ảo mua được bằng tiền thật. Bẫy thứ hai: nó "chỉnh RTP" bằng cách nhân kết quả với một hệ số ở cuối, làm bảng trả thưởng không còn tính được và mọi con số quảng bá thành sai.

## 💻 Code

Phần toán của slot: thuần, test được, chạy bằng `node`. Đây là phần phải đúng trước khi nghĩ tới hiệu ứng.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Sơ đồ: slot.ts trong scripts core được dùng bởi cả server Go và client Cocos; test chạy bằng node kiểm RTP">
  <defs>
    <marker id="cdc-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="240" y="96" width="180" height="62" rx="9" class="fig-box"/>
    <rect x="20"  y="16" width="180" height="52" rx="9" class="fig-box"/>
    <rect x="20"  y="186" width="180" height="52" rx="9" class="fig-box"/>
    <rect x="460" y="16" width="180" height="52" rx="9" class="fig-box"/>
    <rect x="460" y="186" width="180" height="52" rx="9" class="fig-box"/>
  </g>
  <text x="330" y="122" text-anchor="middle" class="fig-label" font-size="13">core/slot.ts</text>
  <text x="330" y="142" text-anchor="middle" class="fig-muted" font-size="11">hàm thuần, không import 'cc'</text>
  <text x="110" y="38"  text-anchor="middle" class="fig-label" font-size="12">Server (quyết kết quả)</text>
  <text x="110" y="56"  text-anchor="middle" class="fig-muted" font-size="10">rút stops · ghi sổ cái</text>
  <text x="110" y="208" text-anchor="middle" class="fig-label" font-size="12">node --test</text>
  <text x="110" y="226" text-anchor="middle" class="fig-muted" font-size="10">khoá RTP trong CI</text>
  <text x="550" y="38"  text-anchor="middle" class="fig-label" font-size="12">Client Cocos</text>
  <text x="550" y="56"  text-anchor="middle" class="fig-muted" font-size="10">chỉ diễn hoạt + tô payline</text>
  <text x="550" y="208" text-anchor="middle" class="fig-label" font-size="12">Mô phỏng 10 triệu lượt</text>
  <text x="550" y="226" text-anchor="middle" class="fig-muted" font-size="10">xem RTP và phương sai</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cdc-b)" fill="none">
    <path d="M200 42 Q270 42 290 92"/>
    <path d="M200 212 Q270 212 290 162"/>
    <path d="M420 110 Q480 110 490 72"/>
    <path d="M420 144 Q480 144 490 182"/>
  </g>
</svg>
<figcaption>Cùng một file toán dùng cho cả ba phía. Server là bên duy nhất được gọi hàm rút kết quả.</figcaption>
</figure>

**Script**

```ts
// scripts/core/slot.ts — toán của slot. KHÔNG import 'cc'. Chạy được bằng node.
export type Reels = string[][];
export type Paylines = number[][];          // mỗi payline: hàng được chọn ở từng reel (0..2)
export type Payouts = Record<string, number>;

/** RNG có seed: mô phỏng lặp lại được. KHÔNG dùng Math.random cho thứ liên quan tới tiền. */
export function mulberry32(seed: number) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Ba ô nhìn thấy của một reel khi nó dừng ở vị trí `stop`. */
export function windowAt(reel: string[], stop: number): [string, string, string] {
    const n = reel.length;
    return [reel[stop % n], reel[(stop + 1) % n], reel[(stop + 2) % n]];
}

/** Tiền thắng của một lần quay. `stops` do SERVER rút ra. */
export function evaluate(stops: number[], reels: Reels, lines: Paylines, pay: Payouts, bet: number): number {
    const grid = stops.map((s, i) => windowAt(reels[i], s));
    let win = 0;
    for (const line of lines) {
        const a = grid[0][line[0]], b = grid[1][line[1]], c = grid[2][line[2]];
        if (a === b && b === c) win += (pay[a + '3'] ?? 0) * bet;
        else if (a === b && a === 'cherry') win += (pay['cherry2'] ?? 0) * bet;
    }
    return win;
}

/** RTP chính xác: duyệt HẾT tổ hợp. 3 reel × 20 ô = 8.000 tổ hợp, vài mili giây. */
export function exactRTP(reels: Reels, lines: Paylines, pay: Payouts, bet = 1): number {
    const [r0, r1, r2] = reels.map((r) => r.length);
    let total = 0;
    for (let a = 0; a < r0; a++)
        for (let b = 0; b < r1; b++)
            for (let c = 0; c < r2; c++) total += evaluate([a, b, c], reels, lines, pay, bet);
    return total / (r0 * r1 * r2 * bet);
}

/** Mô phỏng: xác nhận RTP chính xác, và cho biết phương sai — thứ quyết định "cảm giác". */
export function simulate(spins: number, seed: number, reels: Reels, lines: Paylines, pay: Payouts, bet = 1) {
    const rnd = mulberry32(seed);
    const stops = [0, 0, 0];
    let paid = 0, hits = 0, maxWin = 0, sumSq = 0;
    for (let i = 0; i < spins; i++) {
        for (let r = 0; r < 3; r++) stops[r] = Math.floor(rnd() * reels[r].length);
        const w = evaluate(stops, reels, lines, pay, bet);
        paid += w; sumSq += w * w;
        if (w > 0) hits++;
        if (w > maxWin) maxWin = w;
    }
    const mean = paid / spins;
    return {
        rtp: paid / (spins * bet),
        hitRate: hits / spins,
        maxWin,
        variance: sumSq / spins - mean * mean,
    };
}
```

```ts
// scripts/core/slot.test.ts — chạy: node --test
import { test } from 'node:test';
import assert from 'node:assert';
import { exactRTP, simulate, evaluate } from './slot';

const reels = [
    ['cherry','bell','seven','cherry','bar','cherry','bell','seven','bar','cherry'],
    ['bell','cherry','bar','seven','cherry','bell','bar','cherry','seven','bell'],
    ['seven','cherry','bell','bar','cherry','seven','bell','cherry','bar','bell'],
];
const lines = [[1,1,1],[0,0,0],[2,2,2],[0,1,2],[2,1,0]];
const pay = { seven3: 200, bar3: 50, bell3: 20, cherry3: 10, cherry2: 2 };

test('RTP nằm trong khoảng đã chốt với nhà thiết kế', () => {
    const rtp = exactRTP(reels, lines, pay);
    assert.ok(rtp > 0.60 && rtp < 1.20, `RTP ngoài khoảng cho phép: ${(rtp * 100).toFixed(2)}%`);
});

test('mô phỏng khớp với con số chính xác', () => {
    const exact = exactRTP(reels, lines, pay);
    const sim = simulate(2_000_000, 12345, reels, lines, pay);
    assert.ok(Math.abs(sim.rtp - exact) < 0.01, `lệch ${(Math.abs(sim.rtp - exact) * 100).toFixed(2)}%`);
});

test('mô phỏng lặp lại được với cùng seed', () => {
    const a = simulate(100_000, 7, reels, lines, pay);
    const b = simulate(100_000, 7, reels, lines, pay);
    assert.deepStrictEqual(a, b);
});
```

```ts
// ReelView.ts — client CHỈ diễn hoạt. Không có một lời gọi random nào ở đây.
import { _decorator, Component, Node, Vec3, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ReelView')
export class ReelView extends Component {
    @property(Node) strip: Node = null!;      // node chứa các ô, xếp dọc
    @property cellHeight = 120;
    @property stripLength = 10;
    @property spins = 4;                      // số vòng nguyên trước khi dừng
    @property duration = 1.4;

    private readonly tmp = new Vec3();

    /** stop do SERVER trả về. Hàm này chỉ có nhiệm vụ dừng đúng chỗ đó. */
    spinTo(stop: number, extraDelay = 0): Promise<void> {
        return new Promise((resolve) => {
            Tween.stopAllByTarget(this.strip);
            const loop = this.stripLength * this.cellHeight;
            const startY = this.strip.position.y;
            const targetY = startY - (this.spins * loop + stop * this.cellHeight);

            this.tmp.set(this.strip.position.x, targetY, 0);
            tween(this.strip)
                .delay(extraDelay)
                .to(this.duration + extraDelay * 0.5, { position: this.tmp }, { easing: 'quintOut' })
                .call(() => {
                    // gói vị trí về trong một vòng để lần quay sau không trôi ra vô hạn
                    this.strip.getPosition(this.tmp);
                    this.tmp.y = ((this.tmp.y % loop) + loop) % loop - loop;
                    this.strip.setPosition(this.tmp);
                    resolve();
                })
                .start();
        });
    }
}
```

**Chạy thử**
- `node --test scripts/core/`: cả ba test xanh. Sửa một ô trên dải reel rồi chạy lại — RTP đổi, và bạn thấy ngay nó đổi bao nhiêu.
- `simulate(10_000_000, seed)`: `rtp` lệch dưới 0.3% so với `exactRTP`; `hitRate` cho biết bao lâu người chơi thắng một lần.
- Trên client: ép server trả cùng một `stops` mười lần liên tiếp — reel phải dừng **đúng cùng một ô** cả mười lần.
- Quay liên tục 200 lần: vị trí `strip.position.y` không được trôi ra một số khổng lồ (xác nhận phần gói vị trí hoạt động).

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao kết quả quay không được random ở client?**
  → Vì gói JS của mini game nằm trên máy người chơi và sửa được, nên bất cứ thứ gì client tự quyết thì client gian lận được. Client chỉ gửi ý định "tôi muốn quay mức cược này", server rút kết quả, ghi sổ, rồi trả về ô dừng — animation chỉ là cách kể lại một chuyện đã xong.
- `Mid` **RTP 92% nghĩa là gì, và anh chỉnh nó bằng cách nào?**
  → Là tỉ lệ tiền trả lại người chơi trên tổng tiền cược tính trên vô hạn lượt, và nó là **hệ quả** của bảng reel cộng bảng trả thưởng chứ không phải một tham số chỉnh riêng. Muốn đổi thì đổi tần suất biểu tượng trên dải reel hoặc đổi mức trả, rồi tính lại chính xác bằng cách duyệt hết 8.000 tổ hợp. Nhân kết quả với một hệ số ở cuối là cách làm bảng trả thưởng không còn tính được.
- `Senior` **Hai bảng cùng RTP 92% nhưng người chơi thấy khác hẳn nhau. Vì sao, và anh đo bằng gì?**
  → Vì phương sai khác nhau: một bảng thắng nhỏ liên tục, một bảng im rất lâu rồi nổ lớn. RTP không nói gì về chuyện đó. Tôi đo bằng mô phỏng 10 triệu lượt, nhìn hit rate, phương sai và max win, vì đó mới là những con số quyết định cảm giác phiên chơi.

**Khung trả lời 60 giây** — "Thiết kế luồng một lần quay slot, từ lúc bấm tới lúc hiện kết quả?"

> Client gửi lên một lệnh quay kèm mức cược và một `request_id` sinh ở client. Server kiểm số dư, rút vị trí dừng bằng RNG có seed của nó, tính tiền thắng từ bảng reel và payline, ghi một dòng vào sổ cái append-only, rồi trả về ô dừng cộng số dư mới. `request_id` là UNIQUE trong database nên người chơi mất mạng bấm lại cũng chỉ bị trừ một lần. Client nhận kết quả rồi mới chạy animation, quay vài vòng và dừng đúng vào ô server đã chốt, reel cuối lâu hơn một chút cho hồi hộp. Tức là client không bao giờ biết kết quả trước server, và cũng không bao giờ quyết nó.

**Họ sẽ đào tiếp**

- *"Mất mạng giữa lúc quay thì sao?"* → Gửi lại cùng `request_id`; server thấy trùng thì trả kết quả cũ chứ không quay lại.
- *"Near-miss có nên làm không?"* → Tạo hồi hộp bằng nhịp quay và âm thanh thì được; cố tình dừng sát jackpot khi kết quả đã là thua là nói dối về xác suất và bị soi ở nhiều thị trường.
- *"Game bài thì khác gì?"* → Xáo và chia ở server bằng Fisher–Yates với nguồn ngẫu nhiên an toàn; client chỉ biết bài của mình, và trạng thái ván phải khôi phục được khi rớt mạng.
- *"Làm sao chắc bảng reel không bị sửa nhầm?"* → Test khoá RTP trong CI: ai sửa dải reel làm RTP ra ngoài khoảng đã chốt thì build đỏ.

**Cờ đỏ**

- `Math.random()` ở client quyết kết quả.
- Gửi cả bộ bài xuống client rồi "ẩn trên giao diện".
- Không phân biệt social casino với real-money gambling, và không biết mảng sau cần giấy phép.
- Nói RTP là một tham số chỉnh trực tiếp.

**Số / ví dụ nên thuộc**

- 3 reel × 20 ô = **8.000 tổ hợp** — đủ nhỏ để tính RTP chính xác bằng cách duyệt hết.
- Mô phỏng **10 triệu lượt** phải khớp RTP chính xác trong khoảng **0.3%**.
- Mỗi lệnh cược mang **`request_id` UNIQUE**, sổ cái **append-only**.
- Reel cuối dừng trễ **0.2–0.3 giây** so với reel trước.
- RNG có **seed** để mô phỏng lặp lại được — không dùng `Math.random` cho thứ dính tới tiền.
