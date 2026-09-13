---
id: cocos-minigame
title: Mini game & nền tảng
icon: 📲
summary: Build lên WeChat, Douyin, Facebook Instant hay Zalo: hạn mức gói, subpackage, danh sách domain, đăng nhập và thanh toán qua SDK nền tảng.
status: deep
read: 880
level: advanced
order: 90
tags: [cocos, mini-game, wechat, platform, publishing]
related: [cocos-creator, cocos-assets-bundle, backend-go, cocos-hot-update]
---

Mini game là game chạy **bên trong một siêu ứng dụng** — WeChat, Douyin, Zalo, Messenger — thay vì cài từ store. Người chơi bấm một cái là vào, không cài đặt, và đó là lý do thể loại này sống được ở thị trường mà mỗi lượt cài là một rào cản.

Cái giá của sự tiện đó là ba ràng buộc cứng, và cả ba đều lộ ra muộn nếu bạn không biết trước.

## Ba ràng buộc, biết trước thì đỡ phải làm lại

| Ràng buộc | Nghĩa là gì | Lộ ra khi nào nếu không biết trước |
|---|---|---|
| **Hạn mức gói** | Gói chính cỡ vài MB (WeChat quanh 4 MB, tổng với subpackage quanh 20 MB) | Ngày đóng gói phát hành — quá muộn để chia lại asset |
| **Không có DOM** | Không `document`, không `new Image()`, không tải script động | Lần build đầu lên nền tảng, sau khi web chạy ngon vài tháng |
| **Mạng bị kiểm soát** | Mọi domain phải khai trước trong bảng quản trị của nền tảng | Lúc test trên máy thật: mọi request im lặng thất bại |

Con số dung lượng **nền tảng đổi theo thời gian** — tra lại tài liệu chính thức trước khi lập kế hoạch, đừng tin con số trong bất kỳ bài viết nào, kể cả bài này.

## Bản đồ nền tảng

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="Một dự án Cocos build ra bốn hướng nền tảng: WeChat và Douyin là mini game thật, Facebook Instant là web đóng gói, Zalo dùng bản web-mobile">
  <defs>
    <marker id="cmg-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="90"  width="150" height="70" rx="9" class="fig-box"/>
    <rect x="230" y="10"  width="200" height="52" rx="9" class="fig-box"/>
    <rect x="230" y="80"  width="200" height="52" rx="9" class="fig-box"/>
    <rect x="230" y="150" width="200" height="52" rx="9" class="fig-box"/>
    <rect x="470" y="10"  width="176" height="52" rx="9" class="fig-box"/>
    <rect x="470" y="80"  width="176" height="52" rx="9" class="fig-box"/>
    <rect x="470" y="150" width="176" height="52" rx="9" class="fig-box"/>
  </g>
  <text x="85"  y="118" text-anchor="middle" class="fig-label" font-size="13">Dự án Cocos</text>
  <text x="85"  y="138" text-anchor="middle" class="fig-muted" font-size="11">một codebase</text>
  <text x="330" y="32"  text-anchor="middle" class="fig-label" font-size="13">Target mini game</text>
  <text x="330" y="50"  text-anchor="middle" class="fig-muted" font-size="11">WeChat · Douyin · Alipay</text>
  <text x="330" y="102" text-anchor="middle" class="fig-label" font-size="13">Target Instant Games</text>
  <text x="330" y="120" text-anchor="middle" class="fig-muted" font-size="11">Facebook / Messenger</text>
  <text x="330" y="172" text-anchor="middle" class="fig-label" font-size="13">Target web-mobile</text>
  <text x="330" y="190" text-anchor="middle" class="fig-muted" font-size="11">Zalo · link · webview</text>
  <text x="558" y="32"  text-anchor="middle" class="fig-label" font-size="13">SDK riêng, gói bị chặn</text>
  <text x="558" y="50"  text-anchor="middle" class="fig-muted" font-size="11">login · pay · ads · rank</text>
  <text x="558" y="102" text-anchor="middle" class="fig-label" font-size="13">SDK riêng, duyệt riêng</text>
  <text x="558" y="120" text-anchor="middle" class="fig-muted" font-size="11">bạn bè · chia sẻ</text>
  <text x="558" y="172" text-anchor="middle" class="fig-label" font-size="13">Trình duyệt đầy đủ</text>
  <text x="558" y="190" text-anchor="middle" class="fig-muted" font-size="11">tự lo tài khoản, thanh toán</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cmg-a)" fill="none">
    <path d="M160 110 Q195 110 195 36 H226"/>
    <path d="M160 125 H226"/>
    <path d="M160 140 Q195 140 195 176 H226"/>
    <path d="M430 36 H466"/>
    <path d="M430 106 H466"/>
    <path d="M430 176 H466"/>
  </g>
</svg>
<figcaption>Zalo chạy bản <code>web-mobile</code> trong webview — tức là bạn được trình duyệt đầy đủ, nhưng cũng phải tự lo tài khoản và thanh toán.</figcaption>
</figure>

## Chia gói: subpackage và remote

Hai cơ chế, dùng chung được:

- **Subpackage của nền tảng** — chia gói theo cấu hình của WeChat/Douyin, tải khi cần. Nằm trong hạn mức tổng.
- **Asset Bundle remote trên CDN của bạn** — không tính vào hạn mức nền tảng, nhưng phải khai domain. Đây là cửa thoát cho game có nhiều nội dung.

Chiến lược thực dụng: gói chính chỉ có **màn đầu tiên chơi được**, phần còn lại là bundle remote tải trong lúc người chơi ở menu ([[cocos-assets-bundle]]). Người chơi mini game rất thiếu kiên nhẫn — họ vào từ một cái chạm, và họ thoát cũng bằng một cái chạm.

## Đăng nhập: đừng tin client

Luồng chuẩn, và **bước 3 là bước không được bỏ**:

1. Client gọi API đăng nhập của nền tảng (ví dụ `wx.login`) → nhận về một **mã tạm**.
2. Client gửi mã đó lên **server của bạn**.
3. **Server** gọi API của nền tảng để đổi mã lấy định danh người chơi, rồi phát token của riêng bạn.

Bỏ bước 3 và để client tự khai "tôi là người chơi X" thì bất kỳ ai cũng khai được. Đây đúng là nguyên tắc *client gửi ý định, server trả sự thật* ở [[backend-go]] — chỉ khác cái tên API.

Cùng lý do: **kết quả trận, phần thưởng, số tiền đều do server quyết**. Mini game rất dễ bị sửa gói JS, vì toàn bộ code chạy trên máy người chơi và không có bước biên dịch nào che giấu nó.

## Thanh toán và quảng cáo

Đi qua SDK nền tảng, không qua cổng của bạn. Ba điều luôn đúng dù nền tảng nào:

- **Đối soát ở server.** Nền tảng gọi webhook hoặc bạn chủ động hỏi lại; không bao giờ cộng vật phẩm chỉ vì client nói "mua thành công".
- **Phần thưởng chờ.** Người chơi xem hết quảng cáo, app bị kill đúng lúc trao — nếu phần thưởng chưa được ghi xuống trước đó thì họ mất, và họ sẽ nhớ rất lâu. Cùng bài học ở [[unity-monetization-sdk]].
- **Idempotency.** Mọi lệnh cộng tiền mang một `request_id` do client sinh, UNIQUE ở database, để bấm hai lần không thành hai lần cộng.

Một đặc sản của WeChat đáng biết: **open data domain** — một vùng chạy tách biệt chỉ để hiện bảng xếp hạng bạn bè, không truy cập được mạng và không chia sẻ biến với game chính. Vẽ bảng xếp hạng ở đó bằng canvas riêng. Nghe kỳ quặc cho tới khi hiểu lý do: nền tảng không cho game đọc danh sách bạn bè ra ngoài.

## Bẫy chỉ lộ trên thiết bị thật

- **`document`, `window`, `new Image()`** — không có. Mọi thứ đi qua API engine (`sys`, `assetManager`, `director`).
- **Font hệ thống khác máy bạn.** Layout căn theo bề rộng chữ sẽ lệch. Dùng BMFont đủ dấu tiếng Việt, hoặc chừa chỗ co giãn — xem [[cocos-ui]].
- **Số âm thanh phát cùng lúc bị giới hạn**, khắt khe hơn web.
- **Lưu trữ cục bộ có hạn mức riêng** (thường quanh 10 MB mỗi người chơi). Save lớn phải đẩy lên server.
- **Vào lại từ nền** (người chơi chuyển app rồi quay lại) phải xử lý: nhạc dừng, timer lệch, socket rớt.

Luật một câu: **build lên đúng nền tảng đích từ tuần đầu**, không phải tuần cuối. Mỗi nền tảng có một IDE riêng để chạy thử; cài nó cùng lúc với cài Cocos.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho nền tảng mini game**

Đây là mảng AI **yếu nhất** trong cả nhánh, vì tài liệu nền tảng phần lớn là tiếng Trung, đổi liên tục, và model hay trộn API của WeChat với API của Douyin. Coi mọi tên hàm nó đưa ra là **giả thuyết cần tra lại**, không phải sự thật.

Chỗ nó thật sự có ích: **lớp trừu tượng**. Bạn định nghĩa interface, nó viết bản cài đặt cho từng nền tảng, và bạn tra lại đúng những lời gọi API.

| Giao cho AI | Bạn phải tự tra |
|---|---|
| Interface `PlatformAdapter` và bản cài đặt cho web (không SDK) | Tên hàm và tham số của SDK từng nền tảng |
| Logic phía server: đổi mã lấy định danh, đối soát, idempotency | Hạn mức gói hiện hành |
| Script CI kiểm kích thước gói chính | Quy trình duyệt và yêu cầu nội dung |
| Xử lý vào lại từ nền, hàng đợi phần thưởng chờ | Danh sách domain phải khai |

**Phải nêu rõ**:

- **Nền tảng nào**, và phiên bản SDK.
- **Hạn mức gói** bạn đang phải sống trong đó.
- **Có server không** — không có thì đừng nhờ nó làm đăng nhập "cho nhanh".
- **Cái gì authoritative**: tiền, vật phẩm, kết quả trận.
- **Cấm DOM** — nói thẳng, vì nó sẽ dùng theo quán tính web.

**Mẫu prompt**

```
Cocos Creator 3.8.x, TypeScript strict. Đích: WeChat mini game + web-mobile (Zalo).
Có backend Go. Gói chính < 4MB. Mọi tài nguyên do server quyết.

Việc: viết interface `PlatformAdapter` + hai bản cài đặt (web, wechat) cho:
  login(): Promise<{ code: string }>        // web trả code rỗng
  share(payload): Promise<void>
  rewardedAd(): Promise<'completed' | 'skipped' | 'unavailable'>
  vibrate(ms): void

RÀNG BUỘC:
- CẤM document / window / new Image() ở mọi nhánh code dùng chung.
- Nền tảng không hỗ trợ thì trả 'unavailable', KHÔNG throw — game phải chạy tiếp.
- Mọi lời gọi SDK nền tảng bọc trong try/catch; SDK vắng mặt không được làm crash game.
- ĐÁNH DẤU RÕ mọi tên hàm SDK bạn không chắc bằng comment "// TRA LẠI:" để tôi kiểm.
- Phần thưởng quảng cáo chỉ được cộng sau khi SERVER xác nhận; client chỉ gửi ý định.
```

**Bẫy thường gặp:** AI bịa tên hàm SDK nghe rất hợp lý (`wx.getUserProfileAsync`, `tt.showRewardVideo`) và bạn chỉ phát hiện khi chạy trên máy thật. Yêu cầu nó đánh dấu `// TRA LẠI:` là cách rẻ nhất để biến vấn đề đó thành một checklist thay vì một buổi debug. Bẫy thứ hai: nó làm đăng nhập hoàn toàn ở client vì "không thấy server trong đoạn code bạn đưa".

## 💻 Code

Lớp `PlatformAdapter`: game chỉ gọi interface, mỗi nền tảng một bản cài đặt. Nhờ nó mà thêm nền tảng thứ ba không phải sửa code gameplay.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 210" role="img" aria-label="Game gọi interface PlatformAdapter, phía dưới là ba bản cài đặt web, wechat và douyin">
  <defs>
    <marker id="cmg-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="230" y="14"  width="200" height="52" rx="9" class="fig-box"/>
    <rect x="230" y="92"  width="200" height="52" rx="9" class="fig-box"/>
    <rect x="20"  y="158" width="180" height="42" rx="9" class="fig-box"/>
    <rect x="240" y="158" width="180" height="42" rx="9" class="fig-box"/>
    <rect x="460" y="158" width="180" height="42" rx="9" class="fig-box"/>
  </g>
  <text x="330" y="36"  text-anchor="middle" class="fig-label" font-size="13">Code gameplay</text>
  <text x="330" y="55"  text-anchor="middle" class="fig-muted" font-size="11">không biết nền tảng nào</text>
  <text x="330" y="114" text-anchor="middle" class="fig-label" font-size="13">interface PlatformAdapter</text>
  <text x="330" y="133" text-anchor="middle" class="fig-muted" font-size="11">login · share · rewardedAd · vibrate</text>
  <text x="110" y="185" text-anchor="middle" class="fig-muted" font-size="12">WebAdapter</text>
  <text x="330" y="185" text-anchor="middle" class="fig-muted" font-size="12">WechatAdapter</text>
  <text x="550" y="185" text-anchor="middle" class="fig-muted" font-size="12">DouyinAdapter</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cmg-b)" fill="none">
    <path d="M330 66 V88"/>
    <path d="M290 144 Q290 154 200 154 V154"/>
    <path d="M330 144 V154"/>
    <path d="M370 144 Q370 154 460 154 V154"/>
  </g>
</svg>
<figcaption>Thêm nền tảng = thêm một file adapter. Không sửa dòng nào trong gameplay.</figcaption>
</figure>

**Script**

```ts
// platform.ts — một interface, nhiều nền tảng. Gameplay chỉ biết interface này.
import { sys } from 'cc';

export type AdResult = 'completed' | 'skipped' | 'unavailable';

export interface PlatformAdapter {
    readonly name: string;
    /** Mã tạm để SERVER đổi lấy định danh. Web trả chuỗi rỗng. */
    login(): Promise<{ code: string }>;
    share(title: string, imageUrl?: string): Promise<void>;
    rewardedAd(): Promise<AdResult>;
    vibrate(ms: number): void;
}

/** Web / Zalo webview: không có SDK nền tảng, mọi thứ suy biến an toàn. */
class WebAdapter implements PlatformAdapter {
    readonly name = 'web';
    async login() { return { code: '' }; }
    async share() { /* không hỗ trợ: im lặng bỏ qua, KHÔNG throw */ }
    async rewardedAd(): Promise<AdResult> { return 'unavailable'; }
    vibrate(ms: number) { (globalThis as any).navigator?.vibrate?.(ms); }
}

/** WeChat mini game. Mọi lời gọi SDK đều bọc try/catch: thiếu SDK không được làm sập game. */
class WechatAdapter implements PlatformAdapter {
    readonly name = 'wechat';
    private get wx(): any { return (globalThis as any).wx; }

    login(): Promise<{ code: string }> {
        return new Promise((res) => {
            try {
                // TRA LẠI: tên và chữ ký hàm theo tài liệu WeChat bản hiện hành
                this.wx.login({
                    success: (r: any) => res({ code: r?.code ?? '' }),
                    fail: () => res({ code: '' }),
                });
            } catch { res({ code: '' }) }
        });
    }

    async share(title: string, imageUrl?: string) {
        try { this.wx.shareAppMessage({ title, imageUrl }) } catch { /* bỏ qua */ }
    }

    rewardedAd(): Promise<AdResult> {
        return new Promise((res) => {
            try {
                // TRA LẠI: API quảng cáo có thưởng của nền tảng
                const ad = this.wx.createRewardedVideoAd({ adUnitId: 'YOUR_AD_UNIT' });
                const done = (r: AdResult) => { ad.offClose?.(); res(r) };
                ad.onClose((r: any) => done(r?.isEnded ? 'completed' : 'skipped'));
                ad.onError(() => done('unavailable'));
                ad.show().catch(() => ad.load().then(() => ad.show()).catch(() => done('unavailable')));
            } catch { res('unavailable') }
        });
    }

    vibrate(ms: number) {
        try { ms > 20 ? this.wx.vibrateLong() : this.wx.vibrateShort() } catch { /* bỏ qua */ }
    }
}

function detect(): PlatformAdapter {
    if ((globalThis as any).wx?.createRewardedVideoAd) return new WechatAdapter();
    // Thêm DouyinAdapter ở đây khi cần — gameplay không đổi một dòng nào.
    return new WebAdapter();
}

export const platform: PlatformAdapter = detect();

/** Phần thưởng quảng cáo: client chỉ GỬI Ý ĐỊNH, server mới là nơi cộng. */
export async function watchAdForReward(api: { claimAdReward(requestId: string): Promise<boolean> }) {
    const result = await platform.rewardedAd();
    if (result !== 'completed') return false;
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return api.claimAdReward(requestId);      // idempotent ở phía server
}
```

**Chạy thử**
- Chạy trên trình duyệt: `platform.name` ra `web`, `rewardedAd()` trả `'unavailable'`, game **vẫn chơi bình thường**.
- Chạy trong IDE của nền tảng: `platform.name` ra `wechat`, nút xem quảng cáo hoạt động.
- Xoá `wx` khỏi global giữa lúc chạy: không có exception nào thoát ra ngoài adapter.
- Bấm nút nhận thưởng hai lần liên tiếp: server chỉ cộng **một** lần (nhờ `requestId`).

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Mini game khác game H5 chạy trong trình duyệt ở chỗ nào?**
  → Mini game chạy trong môi trường của siêu ứng dụng: không có DOM, gói chính bị chặn ở mức vài MB, mạng phải khai domain trước, và mọi thứ như đăng nhập hay thanh toán đều đi qua SDK nền tảng. H5 thường thì được trình duyệt đầy đủ nhưng phải tự lo tài khoản và thanh toán.
- `Mid` **Người chơi xem hết quảng cáo nhưng không nhận được thưởng. Anh thiết kế lại luồng thế nào?**
  → Phần thưởng phải được ghi xuống **trước khi** trao, dưới dạng phần thưởng chờ, rồi mới cộng và xoá cờ. Vì app bị kill đúng khoảnh khắc giữa "xem xong" và "cộng vật phẩm" là chuyện xảy ra thật, và người chơi nhớ rất lâu. Kèm theo đó mọi lệnh cộng mang `request_id` UNIQUE để bấm hai lần không thành hai lần cộng.
- `Senior` **Đăng nhập mini game: luồng đúng gồm những bước nào, và bước nào không được bỏ?**
  → Client gọi API nền tảng lấy mã tạm, gửi mã đó lên server, rồi **server** đổi mã lấy định danh người chơi và phát token của mình. Bước server là bước không được bỏ: bỏ nó thì client tự khai mình là ai cũng được, mà gói JS của mini game thì ai cũng đọc và sửa được.

**Khung trả lời 60 giây** — "Đưa một game H5 đang chạy lên mini game, anh làm gì đầu tiên?"

> Việc đầu tiên là đo dung lượng, vì đó là ràng buộc cứng nhất: gói chính bị chặn ở mức vài MB trong khi bản web thường không ai để ý chuyện đó. Tôi chia lại asset — chỉ giữ thứ cần cho màn đầu chơi được trong gói chính, phần còn lại thành bundle remote tải lúc người chơi ở menu. Song song đó tôi rà mọi chỗ chạm DOM, vì `document` và `new Image()` không tồn tại trên nền tảng và code đó chạy ngon suốt mấy tháng trên web. Rồi khai danh sách domain, dựng lớp `PlatformAdapter` để login, share và quảng cáo không rải khắp gameplay. Cuối cùng, và quan trọng nhất, build lên đúng IDE của nền tảng ngay tuần đầu chứ không để tới tuần cuối.

**Họ sẽ đào tiếp**

- *"Vì sao phải có lớp adapter?"* → Vì nền tảng thứ hai luôn tới, và không có adapter thì mỗi lời gọi SDK nằm rải trong gameplay.
- *"Open data domain là gì?"* → Vùng chạy tách biệt của WeChat để hiện bảng xếp hạng bạn bè, không truy cập mạng, không chia sẻ biến với game chính — vì nền tảng không cho game đọc danh sách bạn bè ra ngoài.
- *"Gói chính vượt hạn mức thì cắt gì?"* → Texture trước: chuyển sang bundle remote, bật nén theo nền tảng, tách ảnh nền lớn khỏi atlas.
- *"Vào lại từ nền cần xử lý gì?"* → Nhạc dừng, timer lệch, socket rớt — phải đồng bộ lại thời gian với server chứ không tin đồng hồ máy.

**Cờ đỏ**

- Tin client về kết quả trận hoặc số tiền, vì "code đã minify rồi".
- Không biết gói chính có hạn mức, hoặc trả lời con số mà không kèm "phải tra lại".
- Rải lời gọi `wx.*` khắp code gameplay.
- Test toàn bộ trên trình duyệt rồi kết luận mini game sẽ chạy tương tự.

**Số / ví dụ nên thuộc**

- Gói chính WeChat: quanh **4 MB**, tổng với subpackage quanh **20 MB** — kèm câu "nền tảng đổi, phải tra lại".
- Lưu trữ cục bộ mini game: quanh **10 MB** mỗi người chơi.
- Luồng đăng nhập **ba bước**, bước server là bước bắt buộc.
- Mọi lệnh cộng tài nguyên mang `request_id` **UNIQUE**.
- Nền tảng không hỗ trợ một tính năng thì trả `'unavailable'`, **không throw**.
