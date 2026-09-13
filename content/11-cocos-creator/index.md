---
id: cocos-creator
title: Cocos Creator
icon: 🥥
summary: Engine thứ hai trong kho — chọn Cocos hay Unity theo nơi phát hành, bản đồ khái niệm Unity → Cocos 3.x, và những bẫy chỉ lộ ra khi build ra web hoặc mini game.
status: deep
read: 800
level: intermediate
order: 66
map: true
mapLabel: Cocos
tags: [cocos, engine, typescript, web, mini-game]
related: [unity, production, performance]
refs:
  - "Cocos Creator 3.8 Manual — docs.cocos.com"
---

Nhánh [[unity]] trả lời *"trong Unity thì làm thế nào cho khỏi hỏng"*. Nhánh này trả lời câu đó cho **Cocos Creator 3.x** — engine mà phần lớn game H5, mini game trong siêu ứng dụng và game 2D mobile ở Việt Nam và Trung Quốc đang chạy trên đó.

Kiến thức thiết kế ở tám nhánh kia **không đổi theo engine**: core loop vẫn là core loop, kinh tế vẫn là faucet/drain. Thứ đổi là API, hạn mức gói, và tập bẫy. Nhánh này chỉ ghi phần đổi.

**Giả định xuyên suốt:** Cocos Creator **3.8+**, TypeScript, dự án 2D. Chỗ nào API khác giữa 2.x và 3.x sẽ ghi rõ — đó là nguồn lỗi lớn nhất của cả người mới lẫn AI.

## Các node

**Xương sống dự án**
- **[[cocos-project-structure]]** — thư mục dự án, `.meta` và uuid, cái gì commit, và vì sao scene/prefab là thứ khó merge nhất khi làm nhóm.
- **[[cocos-scene-component]]** — Node/Component, thứ tự vòng đời, boot scene, prefab, event và pool. Bộ xương mà mọi node khác móc vào.

**Gameplay**
- **[[cocos-ui]]** — design resolution và Fit Width/Height, Widget neo mép thật, Label và bẫy chữ tiếng Việt, danh sách cuộn dài phải tái dùng ô.
- **[[cocos-input-physics]]** — chạm ở node hay global, đổi hệ toạ độ, vật lý 2D với group/sensor, và khi nào **đừng** dùng engine vật lý.
- **[[cocos-animation-audio]]** — tween, Spine và cache mode, particle có ngân sách, hitstop khi không có `Time.timeScale`, và autoplay policy của trình duyệt.

**Vận hành**
- **[[cocos-assets-bundle]]** — ba cách lấy asset, chia bundle theo "khi nào cần", đếm tham chiếu và ba kiểu rò.
- **[[cocos-optimization]]** — đo trước sửa sau, luật gộp draw call, nguồn rác GC, chi phí ẩn của `update`, ngân sách máy tầm thấp.
- **[[cocos-minigame]]** — WeChat/Douyin/Zalo: hạn mức gói, subpackage, danh sách domain, đăng nhập ba bước và thanh toán qua SDK nền tảng.
- **[[cocos-hot-update]]** — manifest, CDN, đường lùi khi tải hỏng, phát hành theo tỉ lệ và rollback dưới năm phút.

**Demo theo thể loại**
- **[[cocos-demo-shooter]]** — game bắn máy bay dọc: kiến trúc hệ thống, wave đọc từ JSON, mẫu đạn, cân bằng TTK, ngân sách 300 viên đạn.
- **[[cocos-demo-casino]]** — slot và game bài: server quyết kết quả, bảng trọng số, RTP tính được bằng test, và ranh giới pháp lý.

Còn thiếu một node về **build native và debug trên thiết bị** (IL2CPP không có ở đây, nhưng `jsb`, symbolicate và remote debug thì có) — nói ra để không ai tưởng nhánh này đã phủ hết.

## Chọn Cocos hay Unity

Đừng chọn theo cảm tính hay theo engine bạn quen. Chọn theo **nơi game được mở ra**:

| Nếu đầu ra là… | Engine | Vì sao |
|---|---|---|
| Link mở trong Zalo / Messenger / trang web | **Cocos** | Gói engine nhỏ, mở là chạy, không có màn "Loading 60%" dài |
| Mini game trong siêu ứng dụng (WeChat, Douyin, Facebook Instant) | **Cocos** | Có target dựng sẵn cho từng nền tảng; Unity không phải sân này |
| Game 2D cho máy Android tầm thấp | **Cocos** | Khởi động nhanh, chiếm RAM ít hơn |
| Game 3D, hoặc cần hình ảnh nặng đô | **Unity** | Pipeline, tooling, hệ sinh thái 3D áp đảo |
| Console, VR/AR | **Unity** | Cocos gần như không có mặt |
| Dự án cần nhiều plugin bên thứ ba | **Unity** | Asset Store không có đối thủ — xem [[unity-third-party]] |

Hai điểm hay bị nói quá, cần nói cho đúng:

- **"Cocos nhẹ hơn"** đúng ở build web, và đúng theo bậc độ lớn: một build `web-mobile` 2D đã cắt module rơi vào cỡ **1 MB** engine sau nén, còn build WebGL tối thiểu của Unity nặng gấp nhiều lần. Nhưng trên native (APK/IPA) thì khoảng cách hẹp lại nhiều — đừng lấy lý do "nhẹ" để chọn Cocos cho một game chỉ phát hành lên store. Con số thật phải đo bằng chính build của bạn, không lấy từ bài viết nào.
- **"Cocos dùng TypeScript nên AI viết hộ dễ hơn"** là **sai ngược**. Model biết C#/Unity nhiều hơn hẳn, và phần lớn dữ liệu Cocos trong bộ huấn luyện là API **2.x đã chết**. Xem mục 🤖 bên dưới — đây là khác biệt thực tế lớn nhất khi làm Cocos với AI.

Còn một khả năng thứ ba hay bị bỏ qua: **dùng cả hai**. Bản H5 để phát hành nhanh và thử thị trường bằng Cocos, bản store bằng Unity — với điều kiện phần logic (kinh tế, cân bằng, bảng dữ liệu) nằm ở nơi dùng chung được, tức là ở data và ở server. Xem [[data-driven-design]] và [[backend-go]].

<figure class="fig">
<svg viewBox="0 0 660 270" role="img" aria-label="Một dự án Cocos build ra ba hướng: web-mobile mở trong Zalo hoặc Messenger, native Android iOS lên store có hot update, và mini game trong siêu ứng dụng với hạn mức gói">
  <defs>
    <marker id="cc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="8"   y="96"  width="150" height="78" rx="9" class="fig-box"/>
    <rect x="214" y="8"   width="190" height="60" rx="9" class="fig-box"/>
    <rect x="214" y="94"  width="190" height="60" rx="9" class="fig-box"/>
    <rect x="214" y="180" width="190" height="60" rx="9" class="fig-box"/>
    <rect x="452" y="8"   width="196" height="60" rx="9" class="fig-box"/>
    <rect x="452" y="94"  width="196" height="60" rx="9" class="fig-box"/>
    <rect x="452" y="180" width="196" height="60" rx="9" class="fig-box"/>
  </g>
  <text x="83"  y="128" text-anchor="middle" class="fig-label" font-size="13">Một dự án Cocos</text>
  <text x="83"  y="148" text-anchor="middle" class="fig-muted" font-size="11">assets/ + TypeScript</text>
  <text x="309" y="34"  text-anchor="middle" class="fig-label" font-size="13">Build web-mobile</text>
  <text x="309" y="54"  text-anchor="middle" class="fig-muted" font-size="11">một thư mục HTML + JS</text>
  <text x="309" y="120" text-anchor="middle" class="fig-label" font-size="13">Build native</text>
  <text x="309" y="140" text-anchor="middle" class="fig-muted" font-size="11">Android · iOS · engine C++</text>
  <text x="309" y="206" text-anchor="middle" class="fig-label" font-size="13">Build mini game</text>
  <text x="309" y="226" text-anchor="middle" class="fig-muted" font-size="11">WeChat · Douyin · Instant</text>
  <text x="550" y="34"  text-anchor="middle" class="fig-label" font-size="13">Mở trong Zalo / Messenger</text>
  <text x="550" y="54"  text-anchor="middle" class="fig-muted" font-size="11">không cài đặt, chạm là chơi</text>
  <text x="550" y="120" text-anchor="middle" class="fig-label" font-size="13">Store + hot update</text>
  <text x="550" y="140" text-anchor="middle" class="fig-muted" font-size="11">đổi asset không chờ duyệt</text>
  <text x="550" y="206" text-anchor="middle" class="fig-label" font-size="13">Hạn mức gói vài MB</text>
  <text x="550" y="226" text-anchor="middle" class="fig-muted" font-size="11">không DOM, SDK riêng</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#cc-a)" fill="none">
    <path d="M158 118 Q186 118 186 38 H210"/>
    <path d="M158 135 H210"/>
    <path d="M158 152 Q186 152 186 210 H210"/>
    <path d="M404 38 H448"/>
    <path d="M404 124 H448"/>
    <path d="M404 210 H448"/>
  </g>
</svg>
<figcaption>Cùng một codebase, ba hướng build — nhưng ràng buộc ở cột phải khác nhau hoàn toàn. Chọn hướng phát hành trước khi viết dòng code đầu tiên, vì cột phải quyết định cả kiến trúc nạp asset lẫn ngân sách dung lượng.</figcaption>
</figure>

## Bản đồ Unity → Cocos 3.x

Nếu bạn đến từ Unity, đây là thứ tiết kiệm cho bạn nhiều ngày nhất:

| Unity | Cocos Creator 3.x | Khác ở chỗ |
|---|---|---|
| GameObject | `Node` | UI cũng là node, không có hệ cây riêng |
| MonoBehaviour | `Component` + `@ccclass('Ten')` | Class phải `export`, và tên file nên trùng tên class |
| `[SerializeField]` | `@property` | Kiểu phức tạp phải khai rõ: `@property(Node)` |
| `Awake` / `Start` / `Update` / `LateUpdate` | `onLoad` / `start` / `update(dt)` / `lateUpdate(dt)` | `dt` là **tham số**, không có `Time.deltaTime` toàn cục |
| `OnEnable` / `OnDisable` / `OnDestroy` | `onEnable` / `onDisable` / `onDestroy` | Giống hệt |
| `Instantiate` / `Destroy` | `instantiate()` / `node.destroy()` | `destroy()` thực thi ở **cuối frame**, không tức thì |
| `DontDestroyOnLoad` | `game.addPersistRootNode(node)` | Node phải là root |
| `Resources.Load` | `resources.load(path, Type, cb)` | Bất đồng bộ, có callback — không có bản đồng bộ |
| AssetBundle / Addressables | Asset Bundle (`assetManager.loadBundle`) | Là cơ chế **chính**, không phải tuỳ chọn nâng cao — đối chiếu khái niệm ở [[unity-addressables]] |
| `SceneManager.LoadScene` | `director.loadScene` / `director.preloadScene` | |
| Coroutine, `yield return` | `async/await` hoặc `this.scheduleOnce` | Không có coroutine; `async` là đường chính |
| RectTransform + Canvas Scaler | `UITransform` + `Widget` + design resolution ở Canvas | Neo (`Widget`) là component rời, phải gắn thêm |
| Animator Controller | `Animation` (clip) hoặc animation graph của 3.8 | Hệ state machine mỏng hơn Animator nhiều |
| DOTween | `tween()` dựng sẵn trong engine | Không cần cài gì |
| ScriptableObject | **Không có tương đương** | Khác biệt kiến trúc lớn nhất — đọc tiếp bên dưới |

**Chỗ đau nhất là dòng cuối.** Rất nhiều pattern trong [[unity-design-patterns]] dựa vào ScriptableObject làm dữ liệu và làm kênh sự kiện. Cocos không có thứ đó. Thay thế thực dụng:

- **Dữ liệu cấu hình** → file JSON trong `assets/`, nạp bằng `JsonAsset`, kèm một `interface` TS định nghĩa kiểu để không bị `any` bò khắp nơi. Thêm một script kiểm tra tính hợp lệ chạy trong CI — xem [[data-driven-design]].
- **Kênh sự kiện** → một `EventTarget` dùng chung (engine có sẵn class này), hoặc event bus tự viết. Nhớ **gỡ listener trong `onDisable`**: không có ai gỡ hộ, và node bị destroy mà còn listener là kiểu rò bộ nhớ kinh điển.

## Viết một component cho đúng 3.x

```ts
import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Mover')
export class Mover extends Component {
    @property speed = 240;                      // kiểu number suy ra từ giá trị mặc định
    @property(Node) target: Node = null!;       // kiểu phức tạp phải khai rõ

    private _pos = new Vec3();                  // tái dùng, không cấp phát mỗi frame

    onEnable() {
        this.node.on(Node.EventType.TOUCH_END, this.onTap, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_END, this.onTap, this);
    }

    update(dt: number) {
        // SAI: this.node.position.x += this.speed * dt
        // position trả về vector nội bộ; sửa tại chỗ KHÔNG đánh dấu transform bẩn.
        this.node.getPosition(this._pos);
        this._pos.x += this.speed * dt;
        this.node.setPosition(this._pos);
    }

    private onTap() {
        this.speed = -this.speed;
    }
}
```

Ba điều trong đoạn trên là luật, không phải phong cách:

1. **`setPosition`, không sửa `position` tại chỗ.** Điều này đúng cho cả `UITransform.contentSize` và `Node.scale`. Lỗi này không báo gì cả: giá trị trong object đúng, màn hình không đổi.
2. **Không `new Vec3()` trong `update`.** Web và mini game chạy trên JS engine có GC dừng thế giới; rác trong vòng lặp nóng biến thành giật định kỳ. Nguyên lý giống [[unity-csharp-memory]], chỉ khác là bạn không có struct để né.
3. **Gỡ listener trong `onDisable`.** Cặp `on`/`off` phải khớp đủ ba tham số (sự kiện, hàm, `this`) thì mới gỡ đúng.

## UI: chốt tỉ lệ trước, làm màn sau

Canvas có **design resolution** và hai ô tick `Fit Width` / `Fit Height`. Bốn tổ hợp cho bốn hành vi khác nhau:

| Fit Width | Fit Height | Kết quả |
|---|---|---|
| ✓ | ✗ | Giữ nguyên bề ngang, chiều cao co giãn theo máy — **mặc định cho game dọc** |
| ✗ | ✓ | Giữ nguyên chiều cao, bề ngang co giãn — **mặc định cho game ngang** |
| ✓ | ✓ | Nội dung luôn nằm trọn, chấp nhận viền trống |
| ✗ | ✗ | Lấp đầy màn hình, cắt phần thừa |

Quy trình đỡ đau nhất: chọn design resolution (720×1280 dọc, 1280×720 ngang), tick **một** chiều, rồi **neo mọi thứ trên HUD bằng `Widget`** vào mép màn hình thật chứ không vào design resolution. Gắn component `SafeArea` cho thanh trạng thái và tai thỏ. Kiểm chứng bằng cách đổi tỉ lệ preview sang 4:3 rồi 20:9 — nếu HUD chỉ đúng ở một tỉ lệ thì bạn đang neo sai, và điều đó không tự lộ ra trên máy của bạn.

Nguyên tắc thiết kế HUD thì không đổi theo engine — xem [[ux-hud]] và [[ui-design]].

## Hiệu năng: draw call và dung lượng gói

Hai con số quyết định game H5 có chơi được trên máy rẻ hay không.

**Draw call.** Cocos gộp các sprite liền kề dùng **cùng texture và cùng material** thành một lệnh vẽ. Thứ phá gộp, theo thứ tự hay gặp:

- Một sprite dùng atlas khác chen giữa hai sprite cùng atlas → **thứ tự node quyết định số draw call**. Gom theo atlas, đừng gom theo ý nghĩa logic.
- `Label` mặc định vẽ texture riêng. Chữ tĩnh thì đặt cache mode `BITMAP` để vào atlas động; số nhảy liên tục (điểm, đồng hồ) thì `CHAR` để dùng chung atlas ký tự.
- `Mask` dùng stencil: **mỗi mask thêm 2 draw call** và cắt đôi chuỗi gộp. Danh sách cuộn lồng ba lớp mask là cách chắc chắn nhất để tụt fps trên máy yếu.
- `Graphics` không gộp được với gì cả.

Mốc thực dụng cho một màn H5: **dưới ~50 draw call**. Bật panel thống kê rồi bấm thử từng màn — số này đo được trong ba mươi giây, đừng đoán. Nguyên tắc chung về đo trước khi sửa ở [[performance]] và [[unity-optimization]].

**Dung lượng gói.** Đây là ràng buộc mà bên Unity gần như không phải nghĩ tới:

- Mini game có **hạn mức gói chính cỡ vài MB** (WeChat quanh mức 4 MB, tổng với subpackage quanh 20 MB). Con số này nền tảng đổi theo thời gian — tra lại tài liệu chính thức trước khi lập kế hoạch, đừng tin con số trong bất kỳ bài viết nào, kể cả bài này.
- Cách sống với nó là Asset Bundle: gói chính chỉ chứa màn đầu và thứ cần cho **frame đầu tiên**; phần còn lại để bundle `remote` tải từ CDN trong lúc người chơi còn ở menu.
- Texture chiếm chỗ, không phải code. Auto Atlas (`.pac`) cho sprite, nén phù hợp từng nền tảng, và **đừng để một PNG 2048 không nén** lọt vào gói chính.
- Âm thanh trên web: preload nhạc nền là lý do tải lâu phổ biến nhất. Nhạc thì stream, hiệu ứng ngắn mới preload.

## Bốn bẫy đắt nhất

**1. Trộn API 2.x và 3.x.** Đây là bẫy số một, và nó đến từ mọi hướng: blog cũ, diễn đàn, và AI. Nhận diện trong ba giây:

| Thấy cái này là 2.x (đã chết) | 3.x viết là |
|---|---|
| `cc.Class({ extends: cc.Component, properties: {...} })` | `@ccclass` + `export class X extends Component` |
| `cc.v2(x, y)`, `cc.Vec2` | `v3(x, y, 0)`, `Vec3` |
| `this.node.width`, `this.node.height` | `this.node.getComponent(UITransform).contentSize` |
| `cc.find`, `cc.director`, `require(...)` | `find`, `director`, `import { ... } from 'cc'` |

Code 2.x dán vào dự án 3.x thì hoặc không biên dịch, hoặc — tệ hơn — biên dịch được rồi sai im lặng.

**2. `.meta` và uuid.** Mỗi asset có một file `.meta` chứa uuid; scene và prefab tham chiếu asset **bằng uuid**, không bằng đường dẫn. Đổi tên, di chuyển hay xoá asset **bên ngoài Editor** làm gãy tham chiếu mà không báo gì — mở scene ra thấy ô trống. Luật: thao tác asset trong Editor, commit toàn bộ `.meta`, **không** commit `library/`, `temp/`, `build/`. Cùng một bài học `.meta` như bên Unity, xem [[unity-project-structure]].

**3. Mini game không phải trình duyệt.** Không có `document`, không `new Image()`, không tải script động, và request mạng phải nằm trong danh sách domain đã khai báo với nền tảng. Code dùng DOM chạy ngon trên `web-mobile` rồi chết ngay khi đóng gói WeChat/Douyin. Luật: mọi thứ đi qua API của engine (`sys`, `assetManager`, `director`), và **build thử lên đúng nền tảng đích từ tuần đầu**, không phải tuần cuối.

**4. Không có `Time.timeScale` dùng chung.** Cocos không có một công tắc làm chậm cả thế giới. Muốn pause hay slow-motion thì phải tự làm đủ ba chỗ: nhân `dt` của chính code gameplay, tắt `PhysicsSystem.instance.enable` (hoặc `PhysicsSystem2D`), và dừng tween bằng `Tween.pauseAllByTarget`. Quên một chỗ thì game "pause" nhưng hiệu ứng vẫn chạy tiếp — và [[game-feel]] hỏng ở đúng khoảnh khắc người chơi đang nhìn.

Vài bẫy nhỏ hơn nhưng gặp gần như chắc chắn: audio trên web không phát được cho tới lần chạm đầu tiên (phải resume trong handler của sự kiện chạm); `sys.localStorage` chỉ khoảng 5 MB trên web và có hạn mức riêng trên mini game, nên save lớn phải đẩy lên server ([[backend-go]]); và `node.on(TOUCH_START)` chỉ bắt được nếu node có `UITransform` với kích thước đúng.

## Hot update — thứ Unity không cho bạn dễ dàng

Trên bản native, Cocos có `AssetsManager` với hai file manifest (`project` và `version`): app khởi động, so manifest, tải phần chênh lệch, nạp đè. Tức là **sửa số cân bằng, đổi asset, vá bug script mà không chờ duyệt store** — với game live-ops chạy sự kiện hàng tuần thì riêng điều này đã đủ mạnh để chọn Cocos. Xem [[liveops]] về nhịp vận hành mà cơ chế này phục vụ.

Ba cái giá phải trả: bạn tự lo CDN và quản lý phiên bản; phải có đường lùi khi tải hỏng giữa chừng (người chơi mất mạng ở 70% là chuyện thường ngày); và trên iOS thì việc cập nhật phải nằm trong ranh giới quy định của Apple — vá lỗi và đổi nội dung thì được, **biến nó thành game khác thì không**.

## 🤖 Prompt cho AI

**Dùng AI thế nào khi làm Cocos Creator**

Điều quan trọng nhất phải biết trước khi gõ prompt đầu tiên: **AI biết Cocos kém hơn hẳn biết Unity, và phần nó biết chủ yếu là 2.x**. Cocos 2.x sống lâu, tài liệu nhiều; 3.x đổi gần như toàn bộ bề mặt API. Kết quả thực tế: model trả lời rất tự tin bằng API đã chết, và vì khâu này không có compiler nghiêm như C#, sai sót trôi tới lúc chạy mới lộ.

Vì vậy chia việc theo **mức độ dính engine**, không theo độ khó:

| Giao được cho AI | Tự làm hoặc soi kỹ |
|---|---|
| Logic TS thuần: kinh tế, state machine, thuật toán, parse dữ liệu, test | Bất cứ code nào gọi API `cc` — soi từng dòng theo bảng 2.x/3.x |
| Chuyển khái niệm Unity → Cocos (dùng bảng ánh xạ ở trên) | Cấu trúc scene, thứ tự node — thứ quyết định draw call |
| Script công cụ: kiểm tra JSON cấu hình, sinh atlas, script CI | Cấu hình build cho từng nền tảng mini game |
| Viết lại code 2.x thành 3.x **khi bạn đưa mẫu 3.x của chính dự án** | Hạn mức gói, cách chia bundle — phải đo mới biết |

**Ranh giới cứng:** agent **không sửa** `.scene`, `.prefab`, `.meta`. Chúng là JSON chứa uuid; sửa tay làm gãy tham chiếu im lặng đúng như sửa `.prefab` của Unity. Xem [[ai-limits]].

Mẹo hiệu quả hơn mọi lời nhắc: **dán một file component 3.x có sẵn trong dự án** vào đầu phiên và bảo *"viết theo đúng phong cách và đúng tập API của file này"*. Một ví dụ thật ép model về 3.x tốt hơn mười câu "hãy dùng Cocos 3.8".

**Phải nêu rõ** (thiếu là AI mặc định về Cocos 2.x + web desktop):

- **Phiên bản chính xác** (`3.8.x`), và nói thẳng *"KHÔNG dùng API 2.x"* kèm vài ví dụ cấm (`cc.Class`, `cc.v2`, `node.width`).
- **Nền tảng đích**: `web-mobile`, mini game nào, hay native — quyết định cả kiến trúc nạp asset lẫn API được phép gọi.
- **Design resolution và hướng màn hình** (720×1280 dọc? tick Fit Width?) — thiếu thì mọi code UI nó viết đều neo sai.
- **2D hay 3D**, và backend vật lý đang bật (builtin / Box2D / PhysX).
- **Ngân sách**: bao nhiêu draw call, gói chính bao nhiêu MB, máy yếu nhất phải chạy được.
- **TypeScript strict hay không**, và có thư viện ngoài nào được dùng không.

**Mẫu prompt**

```
Dự án Cocos Creator 3.8.x, TypeScript strict, game 2D dọc.
Design resolution 720x1280, Canvas tick Fit Width. Vật lý: Box2D.
Đích phát hành: web-mobile (mở trong Zalo) + WeChat mini game.
Máy yếu nhất: Android 4 nhân, 3GB RAM. Ngân sách: < 50 draw call mỗi màn,
gói chính < 4MB.

RÀNG BUỘC CHO MỌI CODE:
- CHỈ API Cocos Creator 3.x, ES module `import { ... } from 'cc'`.
  CẤM tuyệt đối: cc.Class, cc.v2, cc.Vec2, node.width/height, require().
- Đổi vị trí bằng setPosition. CẤM sửa node.position tại chỗ.
- CẤM cấp phát (new Vec3, new Array, closure) bên trong update().
- Listener đăng ký ở onEnable phải gỡ ở onDisable, khớp đủ 3 tham số.
- CẤM dùng document / window / new Image() — phải chạy được trên mini game.
- KHÔNG sửa file .scene, .prefab, .meta. Cần đổi ở đó thì MÔ TẢ cho tôi làm tay.

Đây là một component thật của dự án, viết theo đúng phong cách và tập API này:
<dán file .ts của bạn>

Việc cần làm: <mô tả>. Trước khi viết, nói component này gắn vào node nào và vì sao.
```

**Bẫy thường gặp:** AI trả về code 2.x rồi **khẳng định đó là 3.x** — dấu hiệu nhận ra nhanh nhất là `cc.` đứng trước mọi thứ và một object `properties: {}`. Bẫy thứ hai nguy hiểm hơn vì khó thấy: nó viết `this.node.position.x += v * dt`, code đọc rất hợp lý, chạy thì node đứng yên. Bẫy thứ ba: nhờ "tối ưu giúp tôi" mà không đưa số đo — nó sẽ đề xuất pool và atlas theo quán tính, trong khi thủ phạm thật có thể là ba lớp `Mask` lồng nhau mà nó không nhìn thấy trong scene.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Cocos Creator 2.x và 3.x khác nhau ở đâu? Kể ba thứ đọc phát là biết ngay 2.x.**
  → 3.x đổi gần như toàn bộ bề mặt API: ES module `import { Component } from 'cc'` thay cho `cc.Class({...})`, `Vec3` thay `cc.v2`, và kích thước qua `UITransform.setContentSize` thay cho `node.width`. Ba dấu hiệu đó đủ để nhận ra code lấy từ blog cũ, và quan trọng vì code 2.x dán vào 3.x hoặc không biên dịch, hoặc sai im lặng.
- `Mid` **Game H5 mở trên điện thoại tầm trung bị giật khi cuộn danh sách. Anh tìm nguyên nhân thế nào?**
  → Bật panel thống kê xem draw call trước, vì danh sách dài thường kéo theo nhiều `Mask` mà mỗi cái tốn khoảng 2 draw call và cắt chuỗi gộp. Nếu draw call ổn thì xem allocation timeline: cuộn mà sinh rác mỗi frame là do cấp phát trong callback. Chữa gốc là tái dùng ô khi quá ~30 dòng, vì vài nghìn node thì tối ưu kiểu gì cũng không cứu nổi.
- `Senior` **Game phải ra cả bản mini game lẫn bản store. Anh chia gói và chia code ra sao, và vì sao chọn Cocos chứ không Unity?**
  → Gói chính chỉ chứa thứ cần cho frame đầu vì mini game bị chặn ở mức vài MB, phần còn lại thành Asset Bundle remote tải nền lúc người chơi ở menu. Logic kinh tế và cân bằng nằm ở `scripts/core/` không import `'cc'` để dùng chung và test được ngoài engine. Chọn Cocos vì đầu ra là link mở trong ứng dụng chat: build web 2D sau khi cắt module chỉ cỡ 1 MB engine, còn WebGL của Unity nặng gấp nhiều lần.

**Khung trả lời 60 giây** — "Vì sao chọn Cocos Creator cho dự án này?"

> Tôi chọn theo nơi game được mở ra, không theo engine tôi quen. Đầu ra của dự án là link mở trong ứng dụng chat và một bản mini game, nên thứ quyết định là dung lượng và thời gian tới frame đầu tiên: build web 2D của Cocos sau khi cắt module rơi vào cỡ một MB engine, còn gói chính của mini game bị chặn ở mức vài MB nên tôi phải chia Asset Bundle ngay từ đầu chứ không phải tối ưu về sau. Đổi lại tôi chấp nhận ba cái giá: hệ sinh thái plugin mỏng hơn Unity nhiều, 3D gần như không tính tới, và AI hỗ trợ kém hơn vì phần lớn tài liệu ngoài kia vẫn là 2.x. Nếu đầu ra là game 3D lên store thì tôi đã chọn Unity.

**Họ sẽ đào tiếp**

- *"Cụ thể anh chia bundle theo tiêu chí gì?"* → phải chạm tới: gói chính chỉ chứa thứ cần cho frame đầu, phần còn lại tải nền lúc người chơi ở menu, và có đường lùi khi tải hỏng.
- *"Draw call bao nhiêu là nhiều?"* → nêu cách **đo** (panel thống kê, bật tắt từng lớp UI) trước khi nêu con số; nói mốc dưới ~50 cho một màn H5 và nói rõ đó là mốc thực dụng, không phải luật.
- *"Vì sao `node.position.x += 1` không chạy?"* → vì đó là vector nội bộ, sửa tại chỗ không đánh dấu transform bẩn, phải `setPosition`. Câu này lọc rất nhanh người đã làm thật.
- *"Hot update có rủi ro gì?"* → CDN và phiên bản tự lo, tải hỏng giữa chừng phải lùi được, và ranh giới quy định của store.

**Cờ đỏ**

- Nói "Cocos nhẹ hơn Unity" mà không phân biệt build web với build native — nhẹ hơn theo bậc độ lớn chỉ đúng ở vế đầu.
- Trả lời bằng API 2.x cho một dự án 3.x. Người phỏng vấn nghe `cc.v2` là biết ngay bạn học từ blog cũ.
- "Tối ưu thì dùng object pooling" — đúng nhưng vô thưởng vô phạt, và nói trước khi đo là cờ đỏ ở mọi engine.
- Không biết `.meta` để làm gì. Nó là chỗ mọi tham chiếu sống, và là nguồn xung đột Git thường xuyên nhất của cả đội.

**Số / ví dụ nên thuộc**

- Gói chính mini game cỡ vài MB (WeChat quanh 4 MB, tổng với subpackage quanh 20 MB) — và biết nói thêm "số này nền tảng đổi, phải tra lại".
- Mốc draw call cho một màn H5: dưới ~50.
- Mỗi `Mask` tốn thêm 2 draw call.
- Design resolution hay dùng: 720×1280 dọc, 1280×720 ngang; game dọc thì tick Fit Width.
- `localStorage` trên web khoảng 5 MB — mốc để quyết định khi nào save phải lên server.
