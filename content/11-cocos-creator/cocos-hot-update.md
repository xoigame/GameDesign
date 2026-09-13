---
id: cocos-hot-update
title: Hot update & phát hành
icon: 🔄
summary: Cập nhật asset và script trên bản native mà không chờ duyệt store: manifest, CDN, đường lùi khi tải hỏng, và quy trình phát hành không làm chết người chơi cũ.
status: deep
read: 885
level: advanced
order: 100
tags: [cocos, hot-update, release, live-ops, cdn]
related: [cocos-creator, cocos-assets-bundle, liveops, cocos-minigame]
---

Trên bản native, Cocos cho phép **tải phần chênh lệch và nạp đè** khi app khởi động. Đổi số cân bằng, thay ảnh sự kiện, vá một bug script — không qua duyệt store, không bắt người chơi cài lại.

Với game live-ops chạy sự kiện hàng tuần ([[liveops]]), riêng điều này đã đủ là lý do chọn Cocos. Nhưng nó chuyển một phần trách nhiệm của store sang bạn: **phiên bản, CDN, và chuyện gì xảy ra khi tải hỏng giữa chừng**.

## Cơ chế: hai manifest

<figure class="fig">
<svg viewBox="0 0 660 250" role="img" aria-label="App khởi động, so version.manifest cục bộ với bản trên CDN; khác thì tải phần chênh lệch vào thư mục ghi được rồi đổi search path, giống thì vào game ngay">
  <defs>
    <marker id="chu-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="10"  y="96"  width="140" height="60" rx="9" class="fig-box"/>
    <rect x="188" y="96"  width="170" height="60" rx="9" class="fig-box"/>
    <rect x="400" y="16"  width="246" height="58" rx="9" class="fig-box"/>
    <rect x="400" y="96"  width="246" height="58" rx="9" class="fig-box"/>
    <rect x="400" y="178" width="246" height="58" rx="9" class="fig-box"/>
  </g>
  <text x="80"  y="122" text-anchor="middle" class="fig-label" font-size="13">Khởi động</text>
  <text x="80"  y="141" text-anchor="middle" class="fig-muted" font-size="11">đọc manifest cục bộ</text>
  <text x="273" y="122" text-anchor="middle" class="fig-label" font-size="13">So với CDN</text>
  <text x="273" y="141" text-anchor="middle" class="fig-muted" font-size="11">version.manifest</text>
  <text x="523" y="40"  text-anchor="middle" class="fig-label" font-size="13">Giống → vào game ngay</text>
  <text x="523" y="59"  text-anchor="middle" class="fig-muted" font-size="11">không tải gì</text>
  <text x="523" y="120" text-anchor="middle" class="fig-label" font-size="13">Khác → tải phần chênh lệch</text>
  <text x="523" y="139" text-anchor="middle" class="fig-muted" font-size="11">ghi vào thư mục ghi được · đổi search path</text>
  <text x="523" y="202" text-anchor="middle" class="fig-label" font-size="13">Hỏng → LÙI VỀ BẢN CŨ</text>
  <text x="523" y="221" text-anchor="middle" class="fig-muted" font-size="11">xoá bản tải dở, vào game bằng bản gốc</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#chu-a)" fill="none">
    <path d="M150 126 H184"/>
    <path d="M358 112 Q379 112 379 45 H396"/>
    <path d="M358 126 H396"/>
    <path d="M358 140 Q379 140 379 207 H396"/>
  </g>
</svg>
<figcaption>Nhánh thứ ba là nhánh hay bị quên nhất, và là nhánh người chơi thật hay đi nhất.</figcaption>
</figure>

Hai file, sinh ra lúc build:

- **`project.manifest`** — đóng trong gói cài đặt, mô tả phiên bản gốc.
- **`version.manifest`** — đặt trên CDN, chỉ chứa số phiên bản để so nhanh mà không tải cả danh sách file.

Manifest liệt kê từng asset kèm **md5 và kích thước**, nên `AssetsManager` biết đúng file nào đổi và chỉ tải từng ấy.

## Bốn luật giữ cho hot update không thành thảm hoạ

**1. Luôn có đường lùi.** Tải hỏng ở 70% vì mất mạng là chuyện thường ngày ở Việt Nam. App phải: xoá phần tải dở, chạy bằng bản cũ, và **vẫn vào được game**. Treo màn hình "Đang cập nhật 70%" vĩnh viễn là cách mất người chơi nhanh nhất.

**2. Không bao giờ hot update phần tăng phiên bản gốc.** Nếu bản mới cần code native mới (SDK mới, quyền mới), nó **phải** đi qua store. Hot update chỉ dành cho asset và script chạy trên engine. Nhầm chỗ này thì người chơi tải về một bản script gọi API native không tồn tại, và app crash ngay khi khởi động — không sửa được từ xa nữa, vì nó crash trước cả bước kiểm tra cập nhật.

**3. Tách phiên bản gốc và phiên bản nội dung.** Đặt tên kiểu `1.4.2 / content 87`. Người chơi ở `1.3` không được nhận manifest của `1.4` — vì asset mới có thể tham chiếu thứ mà code cũ không hiểu. Manifest phải khai rõ nó dành cho khoảng phiên bản gốc nào.

**4. Phát hành theo tỉ lệ.** Cho 5% người chơi nhận bản mới trước, xem báo lỗi trong một tiếng, rồi mới mở rộng. Đây là cái lợi thật của hot update: không chỉ nhanh hơn store, mà còn **lùi được trong vài phút**.

## iOS: giới hạn phải biết

Apple cho phép nội dung tải về được diễn giải bởi engine, nhưng **không cho** thay đổi bản chất và tính năng chính của app so với bản đã duyệt. Thực tế nghĩa là: vá bug, chỉnh số cân bằng, thêm sự kiện — được. Biến một game xếp hình thành một game bắn súng — không.

Đây là ranh giới chính sách, không phải ranh giới kỹ thuật: kỹ thuật thì làm được, và đó chính là chỗ nguy hiểm. Chốt ranh giới này với người ra quyết định sản phẩm **trước khi** dựng hệ thống, không phải sau khi bị gỡ app.

## Thư mục ghi được và search path

Bản gốc nằm trong gói cài (chỉ đọc). Bản cập nhật ghi vào thư mục ghi được của app, rồi `AssetsManager` **chèn đường dẫn đó lên đầu search path** để engine tìm thấy file mới trước.

Hai chi tiết hay làm hỏng:

- **Search path phải được lưu lại và khôi phục ở lần khởi động sau** — nếu không, app chạy lại bằng bản gốc và người chơi "mất" bản cập nhật vừa tải.
- **Gỡ cài đặt sẽ xoá sạch** thư mục đó. Bình thường, nhưng nhớ là save game của người chơi không được nằm chung chỗ với nội dung tải về.

## Quy trình phát hành một bản nội dung

1. Sửa content, chạy test (gồm cả test khoá RTP hoặc khoá cân bằng nếu có — xem [[cocos-demo-casino]]).
2. Build, sinh manifest mới, đẩy lên CDN **staging**.
3. Một người trong đội cài bản store cũ, mở app, xác nhận cập nhật chạy đúng **và** xác nhận đường lùi khi tắt mạng giữa chừng.
4. Đẩy lên CDN live cho 5% người chơi. Theo dõi tỉ lệ crash và tỉ lệ vào game thành công trong một tiếng.
5. Mở rộng dần. Có sự cố thì đẩy lại manifest cũ — đó là "rollback", và nó phải nhanh hơn năm phút.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho hot update**

Đây là mảng mà **đường hỏng quan trọng hơn đường thành công**, và AI theo mặc định chỉ viết đường thành công. Bắt nó liệt kê mọi cách hỏng trước khi viết dòng code đầu tiên.

| Giao cho AI | Bạn quyết |
|---|---|
| Lớp bọc `AssetsManager`: kiểm tra, tải, tiến độ, thử lại | Ranh giới: cái gì được hot update, cái gì phải qua store |
| Xử lý mọi trạng thái lỗi và đường lùi | Chính sách phát hành theo tỉ lệ |
| Script CI sinh manifest và đẩy CDN | Cấu trúc phiên bản (gốc / nội dung) |
| Màn hình cập nhật: tiến độ, nút thử lại, thông báo | Nội dung thông báo cho người chơi |

**Phải nêu rõ**:

- **Chỉ native** — hot update không áp dụng cho web hay mini game.
- **Khoảng phiên bản gốc** mà manifest này dành cho.
- **Hành vi khi tải hỏng**: bắt buộc vào được game bằng bản cũ.
- **Có phát hành theo tỉ lệ không.**
- **CDN nào cho môi trường nào.**

**Mẫu prompt**

```
Cocos Creator 3.8.x, bản native Android + iOS. Có CDN riêng.
Phiên bản: gốc 1.4.x, nội dung đánh số riêng. Mạng mục tiêu: 3G, hay rớt.

Việc: viết `HotUpdateService` bọc jsb.AssetsManager.

LIỆT KÊ TRƯỚC mọi cách hỏng (mạng rớt giữa chừng, hết dung lượng, manifest hỏng,
md5 không khớp, app bị kill giữa lúc tải, phiên bản gốc không khớp), rồi mới viết code.

RÀNG BUỘC:
- Hỏng ở bất kỳ bước nào thì XOÁ phần tải dở và VÀO GAME bằng bản cũ. CẤM treo.
- Lưu và khôi phục search path ở lần khởi động sau.
- KHÔNG áp dụng khi chạy trên web hoặc mini game — kiểm tra nền tảng và bỏ qua.
- Manifest khai khoảng phiên bản gốc; không khớp thì bỏ qua cập nhật và log rõ.
- Tiến độ chỉ tăng, có nút Thử lại, có nút Bỏ qua sau 3 lần hỏng.
```

**Bẫy thường gặp:** AI viết luồng cập nhật chỉ có nhánh thành công, và khi tải hỏng thì `reject` rồi… không ai bắt — người chơi nhìn màn hình 70% mãi mãi. Bẫy thứ hai: nó quên lưu search path, nên bản cập nhật "biến mất" sau lần khởi động thứ hai và người chơi tải lại mỗi lần mở app.

## 💻 Code

Lớp bọc có đủ ba nhánh: không cần cập nhật, cập nhật thành công, và **hỏng thì vẫn vào được game**.

**Setup**

<figure class="fig">
<svg viewBox="0 0 660 200" role="img" aria-label="Inspector của HotUpdateService với địa chỉ CDN, số lần thử lại và cờ bật tắt">
  <g class="fig-box-g">
    <rect x="10" y="16" width="636" height="168" rx="9" class="fig-box"/>
  </g>
  <text x="30"  y="40"  class="fig-muted" font-size="11">INSPECTOR — HotUpdateService (gắn ở node đầu tiên của boot.scene)</text>
  <text x="30"  y="70"  class="fig-label" font-size="13">Manifest Url</text>
  <text x="250" y="70"  class="fig-muted" font-size="12">https://cdn.../version.manifest</text>
  <text x="30"  y="98"  class="fig-label" font-size="13">Max Retries</text>
  <text x="250" y="98"  class="fig-muted" font-size="12">3</text>
  <text x="30"  y="126" class="fig-label" font-size="13">Native Version</text>
  <text x="250" y="126" class="fig-muted" font-size="12">1.4</text>
  <text x="30"  y="154" class="fig-label" font-size="13">Skip On Failure</text>
  <text x="250" y="154" class="fig-muted" font-size="12">true  ← LUÔN để true</text>
  <text x="420" y="98"  class="fig-muted" font-size="11">Skip On Failure = false nghĩa là</text>
  <text x="420" y="118" class="fig-muted" font-size="11">người chơi mất mạng thì không vào được game.</text>
</svg>
<figcaption>Ô cuối cùng là ô quan trọng nhất trong cả màn hình này.</figcaption>
</figure>

**Script**

```ts
// HotUpdateService.ts — chỉ chạy trên bản native. Hỏng ở bất kỳ đâu vẫn vào được game.
import { _decorator, Component, sys, native } from 'cc';
const { ccclass, property } = _decorator;

export type UpdateOutcome = 'up-to-date' | 'updated' | 'skipped';

@ccclass('HotUpdateService')
export class HotUpdateService extends Component {
    @property manifestUrl = '';
    @property maxRetries = 3;
    @property nativeVersion = '1.4';
    @property skipOnFailure = true;         // LUÔN true trên bản phát hành

    private am: any = null;
    private storagePath = '';

    /** Trả về kết quả, KHÔNG bao giờ throw. Người chơi luôn vào được game. */
    async run(onProgress?: (p: number, label: string) => void): Promise<UpdateOutcome> {
        if (!sys.isNative) return 'skipped';           // web và mini game không dùng cơ chế này
        try {
            return await this.tryUpdate(onProgress);
        } catch (e) {
            console.warn('[hot-update] bỏ qua vì lỗi:', e);
            this.cleanupPartial();
            return 'skipped';
        }
    }

    private tryUpdate(onProgress?: (p: number, label: string) => void): Promise<UpdateOutcome> {
        return new Promise((resolve, reject) => {
            const jsb = (globalThis as any).jsb;
            if (!jsb?.AssetsManager) { resolve('skipped'); return }

            this.storagePath = (jsb.fileUtils.getWritablePath() || '/') + 'hot-update';
            this.am = new jsb.AssetsManager('', this.storagePath, (a: string, b: string) => {
                // So phiên bản nội dung bằng số, không so chuỗi
                const na = Number(a.split('.').pop()) || 0;
                const nb = Number(b.split('.').pop()) || 0;
                return na - nb;
            });

            let retries = 0;
            this.am.setEventCallback((ev: any) => {
                const code = ev.getEventCode();
                const E = jsb.EventAssetsManager;

                switch (code) {
                    case E.ALREADY_UP_TO_DATE:
                        this.finish(); resolve('up-to-date'); break;

                    case E.NEW_VERSION_FOUND:
                        // Manifest phải khai đúng khoảng phiên bản GỐC. Không khớp thì bỏ qua.
                        if (!this.matchesNativeVersion()) { this.finish(); resolve('skipped'); break }
                        onProgress?.(0, 'Đang tải nội dung mới');
                        this.am.update();
                        break;

                    case E.UPDATE_PROGRESSION:
                        onProgress?.(ev.getPercent(), 'Đang tải nội dung mới');
                        break;

                    case E.UPDATE_FINISHED: {
                        // Chèn thư mục vừa tải lên ĐẦU search path, và LƯU LẠI cho lần sau
                        const paths: string[] = [this.storagePath, ...jsb.fileUtils.getSearchPaths()];
                        jsb.fileUtils.setSearchPaths(paths);
                        sys.localStorage.setItem('hot-update:paths', JSON.stringify(paths));
                        this.finish();
                        resolve('updated');
                        break;
                    }

                    case E.UPDATE_FAILED:
                    case E.ERROR_DOWNLOAD_MANIFEST:
                    case E.ERROR_PARSE_MANIFEST:
                    case E.ERROR_NO_LOCAL_MANIFEST:
                        if (retries < this.maxRetries && code === E.UPDATE_FAILED) {
                            retries++;
                            onProgress?.(0, `Thử lại lần ${retries}`);
                            this.am.downloadFailedAssets();
                        } else if (this.skipOnFailure) {
                            this.cleanupPartial();
                            this.finish();
                            resolve('skipped');                 // VÀO GAME bằng bản cũ
                        } else {
                            this.finish();
                            reject(new Error('hot update thất bại, code ' + code));
                        }
                        break;
                }
            });

            this.am.loadLocalManifest(this.manifestUrl);
            if (!this.am.getLocalManifest()?.isLoaded()) { resolve('skipped'); return }
            this.am.checkUpdate();
        });
    }

    /** Khôi phục search path đã lưu — gọi TRƯỚC mọi thứ khác khi app khởi động. */
    static restoreSearchPaths() {
        if (!sys.isNative) return;
        const jsb = (globalThis as any).jsb;
        const saved = sys.localStorage.getItem('hot-update:paths');
        if (!saved || !jsb?.fileUtils) return;
        try { jsb.fileUtils.setSearchPaths(JSON.parse(saved)) } catch { /* bản lưu hỏng: bỏ qua */ }
    }

    private matchesNativeVersion(): boolean {
        const remote = this.am?.getRemoteManifest?.()?.getManifestRoot?.() ?? '';
        return String(remote).includes(this.nativeVersion) || this.nativeVersion === '';
    }

    private cleanupPartial() {
        const jsb = (globalThis as any).jsb;
        try { jsb?.fileUtils?.removeDirectory?.(this.storagePath + '_temp/') } catch { /* bỏ qua */ }
    }

    private finish() { this.am?.setEventCallback(null); this.am = null; }
}
```

**Chạy thử**
- Bản cài mới nhất, không có cập nhật: `run()` trả `'up-to-date'` trong dưới một giây.
- Đẩy manifest mới lên CDN staging: `run()` trả `'updated'`, khởi động lại **vẫn thấy nội dung mới** (xác nhận search path được lưu).
- **Tắt mạng giữa lúc tải 50%**: sau 3 lần thử phải trả `'skipped'` và **game vào được** bằng nội dung cũ.
- Sửa `nativeVersion` thành `'9.9'`: `run()` trả `'skipped'`, không tải gì — xác nhận khoá theo phiên bản gốc hoạt động.
- Chạy trên web: `run()` trả `'skipped'` ngay, không chạm tới `jsb`.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Hot update của Cocos cập nhật được những gì, và không được những gì?**
  → Cập nhật được asset và script chạy trên engine — ảnh, âm thanh, bảng số, logic JS/TS. Không cập nhật được code native: thêm SDK mới hay quyền mới thì bắt buộc qua store. Nhầm chỗ này thì người chơi nhận script gọi API native không tồn tại và app crash ngay lúc khởi động, lúc đó không sửa từ xa được nữa.
- `Mid` **Người chơi mất mạng ở 70% quá trình tải. Hệ thống của anh làm gì?**
  → Thử lại vài lần bằng `downloadFailedAssets`, hết số lần thì xoá phần tải dở và **vào game bằng bản cũ**. Nguyên tắc là không bao giờ chặn người chơi vì một bản cập nhật nội dung: mất một sự kiện thì họ vẫn chơi được, còn treo ở màn hình 70% thì họ gỡ app.
- `Senior` **Anh phát hành một bản nội dung như thế nào cho an toàn?**
  → Đẩy staging trước và tự cài bản store cũ để kiểm cả đường thành công lẫn đường tắt mạng giữa chừng. Rồi mở cho 5% người chơi, theo dõi tỉ lệ crash và tỉ lệ vào game trong một tiếng, sau đó mới mở rộng. Điểm mấu chốt là rollback phải nhanh hơn năm phút — chỉ cần đẩy lại manifest cũ — vì đó mới là giá trị thật của hot update so với chờ store.

**Khung trả lời 60 giây** — "Thiết kế hệ thống hot update cho một game live-ops?"

> App khởi động thì việc đầu tiên là khôi phục search path đã lưu, rồi so `version.manifest` cục bộ với bản trên CDN. Giống thì vào game ngay. Khác thì tải phần chênh lệch theo md5 vào thư mục ghi được, xong thì chèn thư mục đó lên đầu search path và lưu lại cho lần khởi động sau — quên bước lưu là bản cập nhật biến mất ở lần mở app tiếp theo. Điều quan trọng nhất là nhánh thứ ba: hỏng ở bất kỳ đâu thì xoá phần tải dở và vẫn vào game bằng bản cũ, vì mạng 3G rớt giữa chừng là chuyện hằng ngày. Manifest phải khai khoảng phiên bản gốc để người chơi bản cũ không nhận nội dung của bản mới. Và phát hành theo tỉ lệ, bắt đầu 5%.

**Họ sẽ đào tiếp**

- *"Vì sao phải khoá theo phiên bản gốc?"* → Vì asset mới có thể tham chiếu tính năng mà code native cũ không có; thả ra là crash hàng loạt trên bản cũ.
- *"iOS có cho hot update không?"* → Nội dung được engine diễn giải thì được, nhưng không được đổi bản chất app so với bản đã duyệt. Đây là ranh giới chính sách, không phải kỹ thuật.
- *"Rollback làm sao?"* → Đẩy lại manifest cũ lên CDN. Vì vậy manifest cũ phải được giữ, và tên file phải có phiên bản.
- *"Save game để ở đâu?"* → Không nằm chung thư mục với nội dung tải về, vì thư mục đó có thể bị xoá khi gỡ cài hoặc khi dọn bản tải dở.

**Cờ đỏ**

- Không có nhánh xử lý tải hỏng, hoặc để người chơi kẹt ở màn hình cập nhật.
- Nghĩ hot update thay được việc phát hành qua store cho mọi thay đổi.
- Không lưu search path, dẫn tới tải lại mỗi lần mở app.
- Phát hành 100% ngay lần đầu vì "đã test kỹ trên máy mình".

**Số / ví dụ nên thuộc**

- Hai manifest: **`project.manifest`** trong gói, **`version.manifest`** trên CDN.
- Manifest liệt kê **md5 + kích thước** từng file để chỉ tải phần chênh lệch.
- Phát hành theo tỉ lệ, bắt đầu **5%**, theo dõi **1 tiếng**.
- Rollback phải xong **dưới 5 phút** bằng cách đẩy lại manifest cũ.
- Nguyên tắc bất di bất dịch: **hỏng thì vẫn vào được game**.
