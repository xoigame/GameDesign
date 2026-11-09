---
id: interview-cocos
title: "Anh có biết Cocos Creator không?"
icon: 🥥
summary: Cách trả lời trung thực mà mạnh khi nhà tuyển dụng hỏi về Cocos Creator lúc mình chủ yếu là Unity — kinh nghiệm thật nhưng cũ (2.x), TypeScript cho người viết C#, vòng đời, sự kiện, asset, UI, Spine, build, hot update, cocos2d-x, bảng Unity → Cocos, khác biệt 2.x → 3.x và kế hoạch ôn 3 ngày kèm mini project.
status: deep
read: 1160
level: intermediate
order: 60
tags: [interview, cocos, unity, typescript, engine]
related: [cocos-creator, cocos-scene-component, cocos-assets-bundle, cocos-optimization]
---

Câu hỏi "anh có biết Cocos Creator không?" nghe như câu có/không, nhưng người hỏi đang đo ba thứ cùng lúc: **có thật hay nói chơi**, **có trung thực về giới hạn không**, và **học nhanh tới đâu**. Trả lời "biết" trống không là rủi ro (bị đào một câu là lộ). Trả lời "không rành" là bỏ phí một lợi thế có thật. Node này dựng câu trả lời ở giữa: nói đúng những gì đã làm, nói đúng cái gì đã cũ, và cam kết bằng hành động.

Kiến thức kỹ thuật không chép lại ở đây — nó nằm ở nhánh [[cocos-creator]]. Node này chỉ làm hai việc: biến nó thành lời nói, và chỉ ra chỗ người từ Unity sang hay bị hỏi. Bối cảnh chung của nhánh phỏng vấn xem [[interview]].

## 1. Công thức trả lời câu hỏi mở

Sáu mảnh, theo thứ tự, mỗi mảnh một vế câu:

| # | Mảnh | Vì sao phải có |
|---|---|---|
| 1 | **Có** — nói thẳng, không rào đón | Người hỏi cần câu trả lời trước, giải thích sau |
| 2 | **Ở đâu** — công ty, khoảng thời gian | Kiểm chứng được; mơ hồ nghe như bịa |
| 3 | **Làm gì** — một việc cụ thể, không phải "tham gia dự án" | Cho thấy đã chạm vào code thật |
| 4 | **Phiên bản nào** — nói luôn là bản cũ (2.x) | Tự nói trước thì là trung thực; để họ khui ra thì là che giấu |
| 5 | **Đã cập nhật gì** — 3.x, ôn lại phần nào, làm gì để chứng minh | Biến điểm yếu thành bằng chứng chủ động |
| 6 | **Bắt nhịp bao lâu** — một con số và điều kiện | Họ cần biết rủi ro tuyển dụng là bao nhiêu tuần |

Hai thứ cấm: **bịa số liệu kinh doanh** (doanh thu, số người chơi của game cũ — nếu không nhớ chính xác thì để trống hoặc nói "cỡ"), và **chê một engine** để nâng engine kia. Studio tuyển "Unity hoặc Cocos2d-x" thường dùng cả hai; chê Cocos là chê chính đội của họ.

### Ví dụ câu trả lời mẫu theo hồ sơ này

> Có. Từ 2018 đến giữa 2019 ở ME CORP, tôi làm cả Unity lẫn Cocos Creator cho game casino và slot, nối với SmartFoxServer. Phần Cocos tôi làm là [điền: màn hình/tính năng cụ thể, ví dụ lobby, hiệu ứng quay slot, lớp kết nối server]. Lúc đó là bản 1.x–2.x viết JavaScript rồi TypeScript, nên tôi nói thẳng là kinh nghiệm thực chiến của tôi dừng ở 2.x. Mấy tuần nay tôi đã ôn lại 3.8: đọc lại mô hình Node và Component, phần import từ `cc`, UITransform tách khỏi Node, và dựng lại một mini game nhỏ để chắc tay. Với nền Unity 10 năm, phần khó nhất không phải engine mà là quen API, nên tôi ước tính cỡ [điền: 2–3] tuần để làm việc độc lập trên codebase của anh, và tuần đầu tôi muốn được review code chặt.

Chỗ đặt `[điền]` là chỗ chỉ người dùng biết; đừng để AI hay ai khác điền hộ. Nếu không nhớ chính xác, câu "tôi không nhớ tên tính năng, nhưng nhớ rõ phần nối socket với SmartFoxServer" vẫn tốt hơn một cái tên bịa.

## 2. Ánh xạ Unity → Cocos Creator 3.8

Chỉ những dòng chắc chắn đúng với 3.8. Bản đầy đủ và chỗ khác tinh tế nằm ở bảng của [[cocos-creator]].

| Unity | Cocos Creator 3.8 | Điều cần nói ra miệng |
|---|---|---|
| `GameObject` | `Node` | UI cũng là node, không có hệ cây riêng |
| `MonoBehaviour` | `Component` + `@ccclass('Ten')` | Class `export`, `@property` thay cho `[SerializeField]` |
| `Awake` / `Start` / `Update` / `LateUpdate` | `onLoad` / `start` / `update(dt)` / `lateUpdate(dt)` | `dt` là tham số, không có `Time.deltaTime` toàn cục |
| `OnEnable` / `OnDisable` / `OnDestroy` | `onEnable` / `onDisable` / `onDestroy` | Gỡ listener ở `onDisable` — không ai gỡ hộ |
| Prefab, `Instantiate`, `Destroy` | Prefab, `instantiate()`, `node.destroy()` | `destroy()` chạy cuối frame, không tức thì; sinh nhiều thì phải pool |
| ScriptableObject | Không có tương đương | Dữ liệu cấu hình thành JSON + `interface` TS; kênh sự kiện thành `EventTarget` |
| Coroutine | `async/await`, `scheduleOnce`, `schedule`, `tween()` | Không có `yield return`; `tween` dựng sẵn thay DOTween |
| Addressables | Asset Bundle (`assetManager.loadBundle`) | Là cơ chế chính, không phải tuỳ chọn nâng cao; xem [[cocos-assets-bundle]] |
| `Resources.Load` | `resources.load(path, Type, cb)` | Bất đồng bộ, không có bản đồng bộ |
| Canvas + RectTransform | Canvas + `UITransform` + `Widget` | Neo là component `Widget` riêng, phải gắn thêm |
| Sprite Atlas | Auto Atlas | Gom sprite cùng atlas cạnh nhau để batch |
| Batching / SRP Batcher | Gộp draw call theo atlas và thứ tự node | Sprite khác atlas chen giữa là vỡ batch; xem [[cocos-optimization]] |
| Physics2D (Box2D) | Physics 2D (Box2D hoặc builtin) | Có group và sensor; đôi khi không cần engine vật lý |
| `SceneManager.LoadScene` | `director.loadScene` / `preloadScene` | |
| `DontDestroyOnLoad` | `director.addPersistRootNode(node)` | Node phải là root của scene |

Trọng tâm khi nói về mô hình: Cocos giống Unity ở "mọi thứ là node mang component" và vòng đời gần như một-một, nên người từ Unity sang mất ít thời gian ở phần khái niệm. Chỗ thật sự phải học lại là **không có ScriptableObject**, **không có coroutine**, **UI tách thành component rời**, và **TypeScript chạy trên JS engine** (GC khác, không có `struct`). Chi tiết vòng đời và event ở [[cocos-scene-component]].

## 3. Khác biệt 2.x → 3.x hay bị hỏi

Đây là câu "đã cập nhật gì" sẽ bị đào. Người từng làm 2.x phải nói trôi được bảng này:

| Chủ đề | 2.x | 3.x |
|---|---|---|
| Truy cập API | Global `cc.` (`cc.Node`, `cc.Vec2`) | `import { Node, Vec3 } from 'cc'`, không còn global `cc` làm đường chính |
| Khai báo component | `cc.Class({...})` hoặc `@ccclass` | `@ccclass` + `_decorator`, TypeScript là chuẩn |
| Vị trí | `node.x`, `node.y`, `node.position` kiểu `Vec2` | `node.position` là `Vec3`, **chỉ đọc**; ghi bằng `setPosition(...)`; 2D vẫn có z |
| Kích thước, anchor | Trên `Node` (`node.width`, `node.anchorX`) | Tách sang component `UITransform` (`contentSize`, `anchorPoint`) |
| Màu, độ trong suốt | `node.color`, `node.opacity` | Màu nằm ở component (`Sprite.color`, `Label.color`); độ trong suốt qua `UIOpacity` |
| Render UI | Canvas tự có camera | Canvas cần Camera; hiển thị theo `layer` và visibility của camera |
| Nạp asset | `cc.loader` (đã deprecated từ 2.4) | `assetManager`, `resources`, bundle là đường chính |
| Event chạm | `node.on(cc.Node.EventType.TOUCH_START)` | `node.on(Node.EventType.TOUCH_START, cb, this)`; thêm `input.on(Input.EventType...)` toàn cục |
| Tween | `cc.tween` | `tween()` import từ `cc` |
| Kiểu dữ liệu | JS động là chính | TypeScript strict, phải khai kiểu `@property(Node)` |

Câu chốt khi nói miệng: "Khác biệt nằm ở **cú pháp và cách tách trách nhiệm**, không phải ở khái niệm. 3.x tách UITransform khỏi Node và đưa mọi thứ về import có kiểu, nên code 2.x không chạy thẳng được, nhưng đọc là hiểu ngay."

```ts
import { _decorator, Component, Node, Vec3, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Mover')
export class Mover extends Component {
    @property(Node) target: Node = null!;
    private readonly tmp = new Vec3();

    update(dt: number) {
        // 3.x: position chỉ đọc, ghi qua setPosition
        const p = this.node.position;
        this.tmp.set(p.x + 240 * dt, p.y, p.z);
        this.node.setPosition(this.tmp);
        // kích thước nằm ở UITransform, không phải node.width
        const w = this.node.getComponent(UITransform)!.contentSize.width;
    }
}
```

## 4. Kế hoạch ôn 3 ngày và bằng chứng

Mục tiêu không phải học hết Cocos, mà là **nói được và làm được vài thứ cụ thể** trước buổi phỏng vấn.

| Ngày | Việc | Xong khi |
|---|---|---|
| 1 | Cài 3.8, dựng project 2D. Đọc [[cocos-scene-component]]: vòng đời, boot scene, event, pool. Viết lại component `Mover` ở trên và một nút bấm có `Widget` | Giải thích được thứ tự `onLoad` → `onEnable` → `start` → `update` mà không nhìn tài liệu |
| 2 | Đọc [[cocos-assets-bundle]] và [[cocos-optimization]]. Chia một bundle, `loadBundle` + `preload`, đo draw call trước và sau khi gom atlas | Nói được con số draw call trước/sau của chính mình |
| 3 | Dựng mini project (bên dưới), build `web-mobile`, đọc lướt [[cocos-hot-update]] để trả lời được câu cập nhật không qua store | Có link chạy được hoặc video quay màn hình |

**Mini project để chứng minh** (chọn một, đủ nhỏ để xong trong một ngày):

- Theo [[cocos-demo-casino]]: màn quay slot 3 cột, **server quyết kết quả, client chỉ diễn hoạt**, kết quả đọc từ JSON giả lập. Hợp nhất với hồ sơ ME CORP và dễ kể thành một câu chuyện liền mạch.
- Theo [[cocos-demo-shooter]]: bắn máy bay dọc với pool đạn và wave đọc từ JSON, kèm ảnh chụp panel thống kê.

Đưa lên GitHub kèm README ngắn: dùng bản nào (3.8.x), cấu trúc thư mục, một con số đo được. Một repo nhỏ có thật đáng giá hơn mười câu "tôi sẽ học nhanh".

## 5. TypeScript cho người viết C#

Phần này là chỗ người từ Unity bị hỏi nhiều nhất, vì nó quyết định code có "ra dáng" hay không. Bảng dưới là những điểm khác C# thật sự gây lỗi:

| Chủ đề | C# / Unity | TypeScript / Cocos 3.8 | Lưu ý khi nói |
|---|---|---|---|
| Kiểu dữ liệu | Kiểu tĩnh, biên dịch | Kiểu tĩnh **chỉ lúc biên dịch**, chạy ra JS; kiểu biến mất | Dữ liệu từ JSON/server không được kiểm kiểu lúc chạy, phải tự validate |
| `number` | `int`, `float`, `long`… | Chỉ có một `number` (double) | Không có `int`; chia nguyên phải `Math.floor`; tiền lớn dễ mất chính xác |
| `struct` / value type | Có | Không; mọi object là tham chiếu | `Vec3` là class: gán `a = b` là **chung một đối tượng**, phải `clone()` hoặc `set()` |
| `interface` | Hợp đồng cho class | Mô tả **hình dạng** object, không cần class cài đặt | Hợp để mô tả dòng JSON cấu hình; xem mục ScriptableObject ở trên |
| `enum` | Có | Có `enum`; muốn hiện trong Inspector phải bọc `Enum(...)` | Hay quên `Enum` nên dropdown không hiện |
| `class` | Có `public/private/protected` | Có từ khoá tương tự, nhưng `private` chỉ ràng buộc lúc biên dịch | Mặc định không ghi modifier là public |
| `[SerializeField]` | Thuộc tính Unity | `@property` (decorator) | `@property(Node)` hoặc `@property({ type: Node })`; mảng là `@property({ type: [Node] })` |
| `MonoBehaviour` | Kế thừa | `@ccclass('Ten')` + `extends Component` + `export` | Quên `export` hoặc trùng tên class là lỗi hay gặp |
| `null` | Một giá trị rỗng | Có cả `null` lẫn `undefined` | `getComponent` trả `null` khi không thấy; dùng `?.` và `??` thay vì `if` lồng |
| `Task` / `async` | `async Task`, `await` | `async` + `Promise<T>`, `await` | API của engine hay dùng callback, tự bọc thành Promise |
| Delegate / lambda | `Action`, `=>` | Hàm là giá trị; `=>` | Hàm mũi tên **giữ nguyên `this`**, hàm thường thì không |
| Namespace / `using` | `using X;` | `import { X } from 'cc'` / `'./file'` | Mỗi file là một module; import vòng tròn gây giá trị `undefined` lúc nạp |

### Closure và `this`: bẫy số một

```ts
import { _decorator, Component, Node, Prefab, resources, isValid } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Hud')
export class Hud extends Component {
    @property(Node) panel: Node = null!;   // "!" = hứa với compiler: Editor sẽ gán

    onEnable()  { this.node.on(Node.EventType.TOUCH_END, this.onTap, this); } // tham số thứ 3 = this
    onDisable() { this.node.off(Node.EventType.TOUCH_END, this.onTap, this); } // gỡ đúng cặp

    private onTap() { /* this.* đúng nhờ truyền target */ }

    // Bọc callback API thành Promise để dùng await (không có sẵn như coroutine)
    private loadPrefab(path: string): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            resources.load(path, Prefab, (err, asset) => err ? reject(err) : resolve(asset));
        });
    }

    async showLater() {
        const prefab = await this.loadPrefab('ui/Popup');
        if (!isValid(this.node)) return;   // node có thể đã bị destroy trong lúc chờ
        // ...
    }
}
```

Hai điểm rút ra để nói miệng: truyền `this` làm tham số cuối của `node.on` (hoặc dùng hàm mũi tên) thì `this` mới đúng; và sau mỗi `await` phải kiểm `isValid(this.node)` vì scene có thể đã đổi, không có cơ chế tự huỷ coroutine như `StopAllCoroutines` hay tự dừng khi `GameObject` bị huỷ.

Về module: `import { Node, Vec3 } from 'cc'` lấy engine; `import { Foo } from './Foo'` lấy file của mình; có thể dùng đường dẫn `db://assets/...` trong Editor. Không còn "tự thấy mọi class trong project" như C# cùng assembly: thiếu `import` là lỗi ngay.

## 6. Vòng đời component chi tiết, so với Unity

| Cocos | Unity tương đương | Khi nào chạy | Làm gì ở đây |
|---|---|---|---|
| `onLoad` | `Awake` | Một lần, khi node (đang active) được nạp | Cache component, khởi tạo biến nội bộ; **chưa** chắc node khác đã sẵn sàng |
| `onEnable` | `OnEnable` | Mỗi lần component/node bật | Đăng ký listener, bắt đầu schedule |
| `start` | `Start` | Một lần, trước `update` đầu tiên | Việc cần node khác đã `onLoad` xong |
| `update(dt)` | `Update` | Mỗi frame | Logic; `dt` là giây |
| `lateUpdate(dt)` | `LateUpdate` | Mỗi frame, sau mọi `update` | Camera theo sau, sắp xếp lại |
| `onDisable` | `OnDisable` | Mỗi lần tắt | **Gỡ listener, dừng schedule** |
| `onDestroy` | `OnDestroy` | Khi bị huỷ | Dọn tài nguyên, `decRef` asset |

Điểm hay bị hỏi:

- **Thứ tự**: mọi `onLoad` của các node cùng nạp chạy trước, rồi `onEnable`, rồi `start`; trong cùng một node, thứ tự giữa các component theo thứ tự gắn trong Inspector (đừng dựa vào nó, hãy dùng `start` để chờ).
- **Node tắt ngay từ đầu** (`active = false`) thì `onLoad` và `start` chưa chạy cho đến lần bật đầu tiên, giống `Awake` của Unity với object inactive; hay bị bất ngờ vì UI popup thường để tắt sẵn.
- **`destroy()` không tức thì**: node thực sự bị huỷ ở cuối frame; coi node đã `destroy()` là đã chết, đừng giữ tham chiếu và kiểm `isValid` trước khi dùng lại.
- **Không có `FixedUpdate`**: vật lý 2D chạy theo bước cố định riêng của hệ vật lý; logic gameplay chạy trong `update(dt)`, nên dùng `dt` mọi chỗ để không phụ thuộc fps.

Chi tiết boot scene, pool và thứ tự khởi tạo đã có ở [[cocos-scene-component]].

## 7. Hệ sự kiện, scheduler và tween

**Sự kiện** có ba tầng, đừng trộn:

| Tầng | API | Dùng cho |
|---|---|---|
| Sự kiện trên node | `node.on(Node.EventType.TOUCH_START, cb, this)`, `node.once`, `node.off`, `node.emit('ten', ...args)`, `node.targetOff(this)` | Chạm/bấm trên một node; sự kiện cục bộ giữa node cha–con; chạm có bubble lên node cha |
| Input toàn cục | `input.on(Input.EventType.KEY_DOWN, cb, this)`, touch/mouse/gyro | Phím, điều khiển không gắn vào node nào |
| Kênh dùng chung | `new EventTarget()` import từ `cc`, `on/emit/off` | Hệ thống tách rời: UI nghe "đổi tiền", logic phát — thay cho ScriptableObject event channel |

Hai quy tắc: **mọi `on` phải có `off` tương ứng** (hoặc `targetOff(this)` ở `onDisable`), và **nhận sự kiện chạm thì node cần `UITransform`** (có kích thước) mới bắt được. Chi tiết input xem [[cocos-input-physics]].

**Scheduler** (thay Coroutine và `Invoke`):

- `this.scheduleOnce(fn, delay)` ~ `Invoke`; `this.schedule(fn, interval, repeat, delay)` ~ `InvokeRepeating`; `this.unschedule(fn)` / `unscheduleAllCallbacks()`.
- Schedule gắn với component; để chắc chắn, huỷ chủ động (`unschedule`) ở `onDisable` thay vì đoán engine tự dừng.
- Chuỗi hành động có thứ tự: `async/await` bọc `scheduleOnce` trong Promise, hoặc `tween().delay().call()`.

**Tween** dựng sẵn trong engine (không cần DOTween): `tween(node).to(0.3, { position: new Vec3(0, 100, 0) }).call(() => ...).start()`, ghép bằng `sequence` / `parallel` / `repeatForever`, huỷ bằng `Tween.stopAllByTarget(node)`. Nên dừng tween chủ động trong `onDisable`/`onDestroy` để không có tween chạy lên node đã chết. Animation clip, Spine, âm thanh xem [[cocos-animation-audio]].

## 8. Asset, UI, render, Spine, physics

### Asset manager, bundle, release

- `resources.load('thu-muc/ten', Prefab, cb)` đọc từ thư mục đặc biệt `resources` (không có bản đồng bộ). Với ảnh phải load đúng loại con, ví dụ `SpriteFrame` lấy theo đường dẫn kết thúc `/spriteFrame`.
- Bundle: `assetManager.loadBundle('name', cb)` rồi `bundle.load / preload / loadDir`. Chia bundle theo "khi nào cần": menu, mỗi màn chơi, tài nguyên dùng chung. Xem [[cocos-assets-bundle]].
- **Bộ nhớ**: asset có đếm tham chiếu (`addRef` / `decRef`); `releaseAsset` thủ công dễ gây ô trắng khi node khác còn dùng. Quy trình an toàn: asset dùng chung giữ ref, asset của một màn thì `decRef` khi rời màn; đo lại bằng thống kê bộ nhớ sau khi chuyển scene vài lần để xem có rò không.
- Hai nguồn rò thường gặp: listener/tween không gỡ (closure giữ cả cây con) và bundle load xong không bao giờ release.

### UI

| Thành phần | Dùng cho | Điều cần nhớ |
|---|---|---|
| `Canvas` | Gốc UI, giữ design resolution | Cần Camera; chọn fit width hay fit height theo hướng màn |
| `Widget` | Neo mép theo cha, co giãn đa tỉ lệ | Phải gắn thêm; đừng đặt cùng `Layout` trên một node |
| `Layout` | Xếp ngang / dọc / lưới tự động | Tốn khi con đổi liên tục; danh sách dài thì không dùng |
| `ScrollView` | Danh sách cuộn | Dùng `Mask`; danh sách dài phải **tái dùng ô** (virtual list) |
| `Label` / `RichText` | Chữ | `Label` có cache mode; `RichText` gồm thẻ định dạng (màu, cỡ, ảnh) nhưng đắt hơn |
| `Mask` | Cắt vùng hiển thị | Mỗi cái ≈ +2 draw call và cắt chuỗi gộp |

Đa tỉ lệ và bẫy chữ tiếng Việt nằm ở [[cocos-ui]].

### Render 2D, batching, Auto Atlas

Draw call gộp theo **thứ tự node trong cây** và **cùng atlas/material**: node cùng atlas liền nhau thì gộp, chen một sprite khác atlas hoặc `Mask`/`Graphics` vào giữa thì vỡ. Vì vậy xếp lớp UI theo atlas và dùng **Auto Atlas** để gom ảnh; chữ tĩnh dùng `BITMAP`, số nhảy dùng `CHAR`. Con số và cách đo xem [[cocos-optimization]].

### Spine và DragonBones

Hai thư viện hoạt hình xương: Spine mạnh và phổ biến hơn, DragonBones miễn phí. Cả hai vào Cocos bằng component `Skeleton`/`ArmatureDisplay`. Đòn bẩy hiệu năng chính của Spine là **cache mode** (`REALTIME` / `SHARED_CACHE` / `PRIVATE_CACHE`): quái đông đặt chia sẻ cache vì tính một lần, nhân vật chính cần trộn động tác thì giữ `REALTIME`. Chi tiết ở [[cocos-animation-audio]].

### Physics 2D

Có hai backend: **Box2D** (đầy đủ khớp, vật rơi, vận tốc) và **builtin** (chỉ va chạm, nhẹ, không mô phỏng lực). Bắn đạn, va chạm hộp thì builtin thường đủ, và đỡ tốn CPU hơn. Dùng `Collider2D` + `RigidBody2D`, phân **group** để chỉ các cặp cần thiết va chạm, đăng ký `Contact2DType.BEGIN_CONTACT` trên collider. Không nên đổi trạng thái body ngay trong callback va chạm (nên đẩy sang frame sau). Xem [[cocos-input-physics]].

## 9. Build, hot update, debug và profiler

| Đích | Ghi nhớ |
|---|---|
| `web-mobile` / `web-desktop` | Build ra thư mục tĩnh để đặt lên CDN/host; kiểm CORS, nén gzip/brotli, chính sách autoplay âm thanh của trình duyệt |
| Android / iOS (native) | Cần Android Studio/NDK hoặc Xcode; JS chạy trên engine native qua **JSB (JavaScript Binding)** nối sang lõi C++; build chậm hơn web |
| Mini game (WeChat, Douyin…) | Giới hạn gói chính, subpackage, danh sách domain — xem [[cocos-minigame]] |

**Hot update** chỉ áp dụng cho bản native, không cho web: so manifest, tải phần chênh, đổi search path, có đường lùi khi tải hỏng. Nội dung đầy đủ ở [[cocos-hot-update]]. Luật cửa hàng (nhất là iOS) cũng giới hạn việc đổi code sau khi phát hành; nói rõ "tôi ưu tiên cập nhật tài nguyên và cấu hình, còn code logic thì theo chính sách từng store".

**Debug và profiler**:

- Web: Chrome DevTools (breakpoint, network, memory, performance); bật panel thống kê trong game để xem FPS, draw call, số node.
- Native: debug từ xa qua Chrome DevTools khi bật tuỳ chọn tương ứng lúc build, kèm log của Logcat/Xcode.
- Mini game: dùng IDE của nền tảng, và **luôn thử trên máy thật** vì font, giới hạn bộ nhớ khác máy dev.
- Quy trình: đo trước (draw call, frame time, bộ nhớ), thay đổi một thứ, đo lại.

## 10. Cocos2d-x (C++) là gì, khác Cocos Creator ở đâu

Tin tuyển ghi "Unity hoặc Cocos2d-x" nên phải phân biệt rõ hai thứ cùng họ nhưng không cùng loại:

| | Cocos2d-x | Cocos Creator |
|---|---|---|
| Bản chất | **Thư viện/framework C++**, dựng game bằng code | **Engine kèm Editor** (kéo thả scene, prefab, Inspector) |
| Ngôn ngữ chính | C++ (có thêm Lua, JS ở các bản cũ) | TypeScript (JavaScript) |
| Mô hình | `Director`, `Scene`, `Layer`, `Sprite`, `Action`; kế thừa class | Node + Component, giống Unity |
| Quản lý bộ nhớ | Đếm tham chiếu (`retain/release`, autorelease pool) | GC của JS, cộng đếm tham chiếu asset |
| Làm UI | Dựng bằng code hoặc công cụ ngoài | Editor dựng UI trực quan |
| Web | Rất hạn chế | Là đích chính (web-mobile) |
| Công việc điển hình | Game đã có codebase cũ, cần tối ưu native/C++ | Game mới 2D, H5, mini game |

Cách nói an toàn khi hồ sơ chưa làm cocos2d-x: "Tôi chưa làm C++ cocos2d-x trong dự án thật; tôi làm Cocos Creator và Unity. Mô hình scene–node–action tôi quen, và kinh nghiệm C++ của tôi là [điền: có/không, ở đâu]. Tôi sẽ nói rõ phần chưa làm." Không nên khẳng định rành cocos2d-x nếu chưa từng viết C++ cho nó, và nên hỏi thẳng nhà tuyển dụng dự án của họ dùng bản nào, đã chuyển sang Creator chưa.

## 11. Bảng "câu Unity quen → cách làm trong Cocos" mở rộng

| Unity quen | Cocos Creator 3.8 | Ghi chú |
|---|---|---|
| `StartCoroutine` / `yield return` | `async/await`, `scheduleOnce`, `schedule`, `tween().delay().call()` | Không có coroutine; nhớ kiểm `isValid` sau `await` |
| `WaitForSeconds(t)` | `this.scheduleOnce(fn, t)` hoặc Promise bọc `scheduleOnce` | |
| `Invoke` / `InvokeRepeating` | `scheduleOnce` / `schedule` | Huỷ bằng `unschedule` |
| `Instantiate(prefab)` | `instantiate(prefab)` rồi `parent.addChild(n)` hoặc `n.parent = p` | Sinh nhiều thì dùng `NodePool` |
| `Destroy(go)` | `node.destroy()` | Chạy cuối frame |
| `GetComponent<T>()` | `this.getComponent(T)` / `node.getComponent(T)` | Trả `null` nếu không có |
| `GetComponentInChildren<T>()` | `getComponentInChildren(T)` | |
| `transform.Find("a/b")` | `node.getChildByPath('a/b')`, `find('Canvas/a')` | |
| `transform.position = v` | `node.setPosition(v)` | `position` chỉ đọc |
| `transform.SetParent(p)` | `node.parent = p` hoặc `p.addChild(node)` | |
| `gameObject.SetActive` | `node.active = true/false` | `activeInHierarchy` cho trạng thái thật |
| `SendMessage` / `BroadcastMessage` | Không có | Gọi trực tiếp, `node.emit`, hoặc `EventTarget` |
| `UnityEvent` | `Button.clickEvents` trong Inspector; `EventTarget` trong code | |
| `PlayerPrefs` | `sys.localStorage.setItem/getItem` | Chỉ lưu chuỗi; tự `JSON.stringify` |
| `Resources.Load` | `resources.load(path, Type, cb)` | Bất đồng bộ |
| `Addressables.LoadAssetAsync` | `assetManager.loadBundle` + `bundle.load` | |
| `DontDestroyOnLoad` | `director.addPersistRootNode(node)` (2.x: `cc.game.addPersistRootNode`) | Node phải là root của scene |
| `SceneManager.LoadScene` | `director.loadScene('name')` | `preloadScene` để nạp trước |
| `Time.deltaTime` | tham số `dt` trong `update(dt)` | |
| `Application.targetFrameRate` | `game.frameRate = 60` | |
| `Debug.Log` | `console.log` | Trên native xem Logcat/Xcode |
| `Mathf.Lerp / Clamp` | `math.lerp`, `math.clamp` (import `math` từ `cc`) | |
| `Vector3` (struct) | `Vec3` (class, mutable) | `clone()`; dùng lại đối tượng để tránh rác |
| `Animator` / Animation | Component `Animation` (clip), `tween`; Spine cho xương | |
| `AudioSource` | `AudioSource` | Web cần chạm trước khi phát |
| `JsonUtility` / `TextAsset` | `JsonAsset`, `JSON.parse` | Validate dữ liệu lúc chạy |
| `Layer`/`LayerMask` | `node.layer`, physics **group** | Camera chọn lớp hiển thị theo `visibility` |
| `Physics2D.OverlapCircle` | `PhysicsSystem2D.instance.testPoint / testAABB / raycast` | Cần backend Box2D |

## 🤖 Prompt cho AI

**Dùng AI thế nào để chuẩn bị câu hỏi về một engine mình ít dùng gần đây**

AI giỏi ở ba việc: đóng vai người phỏng vấn đào tiếp từng câu, soạn lại câu trả lời cho ngắn và nói được thành lời, và kiểm tra bảng khác biệt 2.x → 3.x mình tự viết. AI **không** giỏi ở việc nói đúng API Cocos Creator 3.x từ trí nhớ, vì phần lớn dữ liệu về Cocos nó thấy là bản 2.x đã chết. Quy trình ba bước: (1) mình tự viết câu trả lời từ trải nghiệm thật, (2) đưa cho AI đóng vai người phỏng vấn đào tiếp, (3) mọi dòng code hay tên hàm AI nói ra đều đối chiếu với tài liệu 3.8 trước khi thuộc.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Phiên bản Cocos đã dùng thật, ở công ty nào, khoảng thời gian nào, làm phần nào — để AI không "thổi phồng" thành kinh nghiệm 3.x.
- Phiên bản đích để ôn: Cocos Creator 3.8, TypeScript, 2D.
- Số tuần mình thật sự cần để bắt nhịp; AI hay chọn con số đẹp.
- Những chỗ chưa làm bao giờ (native build, jsb, hot update thật) để AI không dạy mình nói như đã làm.

**Mẫu prompt**

```
Đóng vai kỹ sư senior của studio game Nhật, phỏng vấn tôi về Cocos Creator.
Hồ sơ THẬT của tôi: Unity dev 10+ năm; 2018–06/2019 ở ME CORP làm Unity và
Cocos Creator 1.x/2.x (JS/TS) cho game casino/slot nối SmartFoxServer.
Chưa từng làm Cocos 3.x trong dự án thật; đã tự ôn 3.8 trong 3 ngày.
Hỏi tôi 8 câu, MỖI LẦN MỘT CÂU, chờ tôi trả lời rồi mới đào tiếp.
Sau mỗi câu trả lời, chỉ ra: (a) chỗ nghe như bịa, (b) chỗ trộn API 2.x và 3.x.
KHÔNG tự bịa kinh nghiệm cho tôi. KHÔNG viết câu trả lời thay tôi.
Mọi API bạn nhắc phải ghi rõ là 2.x hay 3.x; không chắc thì nói "không chắc".
Cuối buổi: liệt kê 3 câu tôi trả lời yếu nhất kèm gợi ý đọc tài liệu 3.8.
```

**Bẫy thường gặp:** AI trộn API 2.x và 3.x trong cùng một câu trả lời nghe rất trôi chảy — ví dụ `cc.loader.loadRes` cạnh `import { resources } from 'cc'`, hoặc `node.x = 10` (đã bỏ ở 3.x). Bẫy thứ hai: nhờ AI "viết câu trả lời cho tôi", nó thêm vào những dự án và con số mình chưa từng làm, và đúng thứ đó bị người phỏng vấn hỏi tiếp. Bẫy thứ ba: nó khuyên "nói mình rất rành Cocos" cho mạnh, trong khi chiến lược đúng của hồ sơ này là nói thẳng "bản cũ, đã cập nhật".

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Trong Cocos Creator, thứ tự vòng đời của một Component là gì?**
  → `onLoad` chạy khi node được nạp, trước mọi thứ hiển thị; `onEnable` mỗi lần bật; `start` ngay trước frame `update` đầu tiên; sau đó `update(dt)` và `lateUpdate(dt)` mỗi frame; cuối cùng `onDisable` rồi `onDestroy`. Điểm khác Unity là `dt` được truyền vào làm tham số, không có `Time.deltaTime` toàn cục, và `node.destroy()` chỉ thực thi cuối frame. Tôi đăng ký listener ở `onEnable` và gỡ ở `onDisable`, vì không ai gỡ hộ và đó là nguồn rò bộ nhớ số một.
- `Junior` **Cocos Creator và Unity khác nhau ở mô hình Node/Component chỗ nào?**
  → Cả hai đều là cây đối tượng mang component và vòng đời gần như một-một, nên tôi chuyển khái niệm rất nhanh. Khác ở ba chỗ: không có ScriptableObject nên dữ liệu thành JSON cộng interface TS; không có coroutine nên dùng `async/await` hoặc `schedule`; UI cũng chỉ là node mang `UITransform`, `Widget`, không có hệ RectTransform riêng. Ngôn ngữ cũng là TypeScript chạy trên JS engine, nên cách nghĩ về GC khác C#.
- `Mid` **Game tụt fps trên Android tầm thấp, anh giảm draw call trong Cocos thế nào?**
  → Tôi đo trước bằng panel thống kê của Cocos rồi mới sửa, vì máy dev luôn chạy 60fps. Draw call tăng khi sprite khác atlas chen giữa, `Label` để cache mode `NONE`, dùng `Mask` (mỗi cái cộng khoảng 2 draw call) hoặc `Graphics`. Tôi gom sprite vào Auto Atlas, đổi chữ tĩnh sang `BITMAP`, và đặt mốc dưới khoảng 50 draw call mỗi màn H5; cách tìm thủ phạm nhanh nhất là tắt lần lượt từng lớp UI và xem con số tụt bao nhiêu.
- `Mid` **Asset Bundle trong Cocos so với Addressables, và giải phóng bộ nhớ thế nào cho an toàn?**
  → Asset Bundle là cơ chế chính của Cocos, tương đương Addressables về ý tưởng: chia theo "khi nào cần", `loadBundle` rồi `preload` trong lúc người chơi còn ở menu. Về giải phóng, tôi dùng đếm tham chiếu `addRef()` và `decRef()` khi giữ asset qua nhiều scene, chứ không rải `releaseAsset` khắp nơi, vì asset có thể đang được node khác dùng và gây ô trắng ngẫu nhiên. Rò hay gặp nhất là listener không gỡ, vì closure giữ cả cây con.
- `Mid` **Hot update trong Cocos hoạt động thế nào và cần chú ý gì?**
  → Có hai manifest: `project.manifest` đóng trong gói cài đặt và `version.manifest` trên CDN để so phiên bản nhanh, khác thì tải phần chênh vào thư mục ghi được rồi đổi search path. Quan trọng nhất là có đường lùi: tải hỏng ở 70% thì phải xoá phần dở và vẫn vào được game bằng bản cũ. Tôi cũng tách phiên bản gốc và phiên bản nội dung, phát hành theo tỉ lệ khoảng 5% trước, và rollback bằng cách đẩy lại manifest cũ. Phần này chỉ áp dụng cho bản native, không phải web.
- `Mid` **Anh từng làm Cocos 2.x, chuyển sang 3.x thì gặp những khác biệt nào?**
  → Lớn nhất là API: 2.x dùng global `cc.`, 3.x import từ `'cc'` và TypeScript là chuẩn. `node.position` là `Vec3` chỉ đọc nên ghi bằng `setPosition`, kích thước và anchor tách sang `UITransform`, độ trong suốt qua `UIOpacity`, Canvas cần Camera. Nạp asset thì `cc.loader` đã bỏ, dùng `assetManager` và `resources`. Khái niệm không đổi, nên cái cần học lại chủ yếu là cú pháp và cách tách trách nhiệm.
- `Mid` **TypeScript trong Cocos so với C# trong Unity, anh thấy khác gì khi viết gameplay?**
  → TypeScript có kiểu tĩnh nên gần C# về cảm giác, nhưng chạy trên JS engine nên không có `struct` hay value type, và `new Vec3()` trong `update` sinh rác mỗi frame. Tôi tái dùng vector ở cấp class, dùng vòng `for` thường trong hot path, cache component ở `onLoad`. Bù lại, vòng lặp sửa–chạy nhanh hơn vì không biên dịch lại domain như Unity, và dữ liệu cấu hình viết thẳng JSON với `interface`.
- `Senior` **Cho một game casino 2D phát hành trên web và store, anh chọn Unity hay Cocos?**
  → Tôi chọn theo nơi game được mở ra, không theo engine quen. Nếu đầu ra là link mở trong trình duyệt hay siêu ứng dụng, 2D và máy yếu thì Cocos thắng vì gói nhỏ và khởi động nhanh. Nếu là store native với nhiều plugin bên thứ ba, 3D hoặc hiệu ứng nặng thì Unity. Với slot thì logic và RTP nằm ở server nên client rất mỏng, càng nghiêng về Cocos cho bản H5; cũng có thể dùng cả hai miễn là dữ liệu và kinh tế nằm ở nơi dùng chung.
- `Senior` **Anh sẽ kiểm chứng và bắt nhịp với codebase Cocos của chúng tôi thế nào trong tháng đầu?**
  → Tuần một tôi đọc cấu trúc dự án, boot scene, cách chia bundle và quy ước event, chạy thử build rồi sửa một bug nhỏ có review chặt. Tuần hai đến ba tôi nhận một tính năng nhỏ trọn vẹn, đo draw call và bộ nhớ trước và sau. Tôi nói trước thời gian bắt nhịp dự kiến là [điền: 2–3] tuần, vì với nền Unity 10 năm phần khó là quen API chứ không phải khái niệm.
- `Junior` **`@ccclass` và `@property` làm gì? Quên `@property` thì sao?**
  → `@ccclass('Ten')` đăng ký class với hệ thống serialize của engine để Editor nhận ra component và lưu được; `@property` đánh dấu field hiện trong Inspector và được lưu, giống `[SerializeField]`. Quên `@property` thì field vẫn chạy được trong code nhưng không kéo thả được và là `null`/`undefined` lúc chạy, nên lỗi hay hiện ra là "Cannot read properties of null". Tôi viết `@property(Node) target: Node = null!` để khai báo rõ kiểu.
- `Junior` **`this` trong callback bị sai thì xử lý thế nào?**
  → Hàm thường truyền làm callback mất `this`, nên `this.xxx` ra `undefined`. Tôi truyền `this` làm tham số cuối của `node.on(..., cb, this)` hoặc dùng hàm mũi tên, vì hàm mũi tên giữ nguyên `this` của chỗ định nghĩa. Cũng vì thế tôi giữ tham chiếu hàm để `off` đúng cặp.
- `Junior` **`null` và `undefined` trong TypeScript khác gì, tránh crash thế nào?**
  → `null` là "có chủ ý rỗng", `undefined` là "chưa gán"; `getComponent` trả `null` khi không thấy, còn field chưa gán là `undefined`. Tôi dùng `?.` và `??` để không crash và bật `strict` để compiler bắt thiếu kiểm tra. Với field chắc chắn được Editor gán thì dùng `!`, vì đỡ rào kiểm tra thừa nhưng phải nhớ là đang hứa với compiler.
- `Junior` **Không có Coroutine thì làm chuyện "chờ 2 giây rồi làm tiếp" thế nào?**
  → Có ba cách: `this.scheduleOnce(fn, 2)` cho việc đơn giản; bọc `scheduleOnce` trong Promise để `await` thành chuỗi tuần tự; hoặc `tween(node).delay(2).call(fn).start()` khi gắn với hoạt ảnh. Điểm phải nhớ là sau `await` node có thể đã bị huỷ, nên kiểm `isValid(this.node)`, vì coroutine của Unity tự dừng còn Promise thì không.
- `Mid` **Hệ sự kiện của Cocos gồm những gì, anh chọn cái nào cho UI cập nhật khi tiền đổi?**
  → Có sự kiện trên node (`node.on`/`emit`, chạm có bubble), `input.on` toàn cục cho phím, và `EventTarget` để làm kênh dùng chung. Tiền đổi là thông tin nhiều chỗ cùng nghe nên tôi dùng một `EventTarget` làm event bus, thay cho ScriptableObject channel của Unity. Điều kiện bắt buộc là mọi chỗ đăng ký phải gỡ ở `onDisable`, vì node bị huỷ mà listener vẫn trỏ vào nó là rò bộ nhớ lẫn gọi vào đối tượng đã chết.
- `Mid` **Vì sao nên cache `getComponent` ở `onLoad` thay vì gọi trong `update`?**
  → `getComponent` phải tìm theo kiểu trong danh sách component của node, gọi mỗi frame cho nhiều node là một khoản phí không cần. Tôi cache ở `onLoad`, và cache luôn các `Vec3` tạm ở cấp class để không `new` mỗi frame, vì JS không có struct nên mỗi `new Vec3` là một lần xin GC. Cách làm này cũng đúng với Unity, chỉ khác là rác ở đây đến từ object chứ không phải boxing.
- `Mid` **Anh thiết kế danh sách 500 dòng bảng xếp hạng trong ScrollView thế nào?**
  → Không dựng 500 dòng, mà giữ cỡ chục node đủ phủ màn hình cộng hai ô đệm rồi tái dùng khi cuộn, vì mỗi dòng vài node cộng `Mask` sẽ làm bùng số node và draw call. Content phải do script tính chiều cao, không gắn `Layout` vì hai bên sẽ giành quyền xếp. Chi tiết và mã mẫu nằm ở [[cocos-ui]].
- `Mid` **Chữ tiếng Việt bị ô vuông hoặc lệch trong Label, anh nghĩ ngay tới nguyên nhân nào?**
  → Với font bitmap làm sẵn thì thiếu ký tự có dấu (như `ế`, `ượ`) sẽ ra ô vuông, nên tôi xuất BMFont đủ bộ ký tự tiếng Việt hoặc dùng font hệ thống. Trên mini game, font hệ thống khác máy dev nên layout theo bề rộng chữ phải chừa chỗ co giãn và thử trên máy thật. Tôi cũng đặt cache mode phù hợp: `BITMAP` cho chữ tĩnh, `CHAR` cho số nhảy liên tục.
- `Mid` **Spine làm tụt fps khi có 40 quái, anh xử lý theo thứ tự nào?**
  → Đổi những con không cần trộn động tác sang `SHARED_CACHE` trước, vì xương chỉ tính một lần cho mọi bản sao, và phải đặt cache mode trước `setAnimation`. Nhân vật chính giữ `REALTIME` vì cần trộn động tác. Sau đó mới tới giảm số xương, bớt mesh, gộp atlas, và chốt bằng số đo trước–sau.
- `Mid` **Physics 2D trong Cocos: khi nào dùng Box2D, khi nào chỉ cần builtin?**
  → Cần mô phỏng thật (khớp, lực, vật rơi) thì Box2D; chỉ cần phát hiện va chạm giữa đạn và kẻ địch thì builtin nhẹ hơn. Tôi luôn đặt **group** để chỉ các cặp cần va chạm mới được tính, vì ma trận va chạm mặc định rộng. Trong callback va chạm tôi tránh đổi trạng thái body ngay, mà đẩy sang frame sau.
- `Mid` **Anh gỡ lỗi game Cocos chạy sai trên máy Android thật thế nào?**
  → Tôi xem log qua Logcat, bật debug từ xa bằng Chrome DevTools khi build native, và bật panel thống kê để xem FPS, draw call, số node. Nếu là web thì dùng DevTools trực tiếp, mini game thì IDE của nền tảng cộng máy thật vì font và bộ nhớ khác máy dev. Quy tắc của tôi là đo trước, đổi một thứ, đo lại, để biết thay đổi nào có tác dụng.
- `Mid` **Build native Cocos khác build web ở những điểm nào?**
  → Native cần Android Studio/NDK hoặc Xcode, JS chạy trên engine native qua JSB nối sang lõi C++, nên build chậm hơn và lỗi có thể nằm ở lớp binding hoặc môi trường build chứ không ở code TypeScript. Web thì chỉ là thư mục tĩnh đặt lên CDN, nhưng phải để ý CORS, nén và chính sách autoplay âm thanh. Phần native tôi nói thẳng mức đã làm thật trên 3.x là [điền: mức độ thật].
- `Mid` **Mini game (WeChat, Zalo…) có điểm gì khiến code Cocos phải khác?**
  → Mini game không phải trình duyệt: không có `document`, không tải script động, request mạng phải nằm trong danh sách domain khai báo, gói chính bị giới hạn vài MB nên phải chia bundle và subpackage từ đầu. Vì thế tôi gói phần phụ thuộc nền tảng (đăng nhập, quảng cáo, thanh toán) sau một interface adapter để game không biết đang chạy ở đâu. Chi tiết ở [[cocos-minigame]].
- `Mid` **Cocos2d-x và Cocos Creator khác nhau thế nào? Anh có làm cocos2d-x không?**
  → Cocos2d-x là framework C++ dựng game bằng code, còn Cocos Creator là engine có Editor kéo thả, viết TypeScript và theo mô hình Node + Component. Tôi làm Creator và Unity, chưa viết C++ cocos2d-x trong dự án thật ([điền: nếu có kinh nghiệm C++ liên quan thì nói]); khái niệm scene–node–action thì quen, còn phần cần học là C++ và quản lý bộ nhớ đếm tham chiếu. Tôi sẽ hỏi lại dự án của anh dùng bản nào, và nói rõ mình cần bao lâu để bắt nhịp.
- `Senior` **Kể một dự án Cocos anh làm: kiến trúc, khó khăn lớn nhất và bài học.**
  → Tôi nói theo khung: bối cảnh (ME CORP, casino/slot, SmartFoxServer), phần mình phụ trách [điền: tính năng cụ thể], quyết định kiến trúc then chốt là server quyết kết quả, client chỉ diễn hoạt, vì lý do công bằng và chống gian lận. Khó khăn lớn nhất tôi nhớ là [điền: một vấn đề thật như đồng bộ trạng thái, độ trễ mạng, hay hiệu năng] và cách xử lý. Tôi nói luôn đó là bản 1.x–2.x và nêu điều tôi làm khác đi với kiến thức hiện nay, không bịa số liệu kinh doanh.
- `Senior` **Thiết kế kiến trúc client Cocos cho game casino nhiều màn: chia module, bundle, dữ liệu, mạng ra sao?**
  → Tôi chia bundle theo "khi nào cần": lõi và lobby nhỏ để vào nhanh, mỗi game một bundle tải khi chọn; dữ liệu cấu hình là JSON kiểm bằng `interface`; lớp mạng tách khỏi UI qua một event bus, nhận trạng thái từ server rồi chỉ diễn hoạt. Kết nối realtime phải có timeout, tự nối lại và đồng bộ lại trạng thái, vì mạng di động rớt thường xuyên. Xem thêm [[cocos-demo-casino]].
- `Senior` **Anh dùng hot update thế nào để phát hành an toàn và khi nào không nên dùng?**
  → Dùng cho tài nguyên và cấu hình ở bản native, phát hành theo tỉ lệ nhỏ trước (cỡ 5%), có đường lùi nếu tải hỏng và rollback bằng đẩy lại manifest cũ. Không dùng cho web, vì web luôn tải bản mới nhất; với iOS cần cân nhắc chính sách cửa hàng khi muốn đổi code logic, nên tôi ưu tiên đổi tài nguyên và cấu hình. Chi tiết ở [[cocos-hot-update]].
- `Senior` **Team đang tụt fps nhiều chỗ: anh dẫn quy trình tối ưu cho cả team thế nào?**
  → Tôi đặt ngân sách chung (số draw call, số node, RAM texture), đo bằng panel thống kê trên máy thật tầm thấp, và đưa script kiểm ngân sách vào CI để vi phạm là thấy ngay. Sửa theo thứ tự ít tốn nhất trước: gom atlas, đổi cache mode `Label`, tái dùng ô danh sách, `SHARED_CACHE` cho Spine, bỏ `Mask` lồng. Mỗi thay đổi ghi số trước–sau, vì không đo thì không biết bước nào đáng giá. Xem [[cocos-optimization]].
- `Senior` **Có nên chuyển codebase Cocos 2.x sang 3.x không? Anh làm thế nào?**
  → Cân nhắc lợi ích (TypeScript chuẩn, công cụ mới, hỗ trợ lâu dài) với chi phí (API đổi, plugin cũ không chạy). Tôi sẽ chuyển theo từng module nhỏ có thể kiểm chứng, bắt đầu từ phần ít phụ thuộc UI, và giữ nhánh chạy 2.x cho tới khi 3.x ngang tính năng. Cái đáng giá nhất khi chuyển là tách trách nhiệm (UITransform, UIOpacity) chứ không phải đổi cú pháp.

**Khung trả lời 60 giây** — "Anh có biết Cocos Creator không?"

> Có. Từ 2018 đến giữa 2019 ở ME CORP, tôi làm cả Unity lẫn Cocos Creator cho game casino và slot nối với SmartFoxServer. Phần Cocos tôi phụ trách là [điền: màn hình hoặc tính năng cụ thể]. Tôi nói thẳng là đó là bản 1.x đến 2.x, nên kinh nghiệm thực chiến của tôi dừng ở đó. Mấy ngày nay tôi đã ôn lại 3.8: import từ `cc`, UITransform tách khỏi Node, vị trí chỉ đọc qua `setPosition`, và dựng lại một mini game để chắc tay. Mô hình Node và Component với vòng đời thì gần như giống Unity, nên cái tôi cần quen là API và TypeScript, không phải khái niệm. Tôi ước tính khoảng [điền: 2–3] tuần để làm việc độc lập, và tuần đầu mong được review code chặt.

**Họ sẽ đào tiếp**

- *"Cụ thể anh làm gì bằng Cocos ở ME CORP?"* → nêu một việc cụ thể (lobby, hiệu ứng quay, lớp kết nối SmartFoxServer), không nói "tham gia dự án"; nếu không nhớ chi tiết thì nói thẳng phần nhớ rõ nhất.
- *"2.x và 3.x khác nhau ở đâu?"* → import từ `cc`, `position` chỉ đọc, `UITransform` tách khỏi Node, Canvas cần Camera, `cc.loader` thành `assetManager`; kết bằng "khái niệm không đổi, API đổi".
- *"Sao anh biết ôn vài ngày là đủ?"* → không khẳng định đủ; nói đây là mức đủ để làm được việc nhỏ có review, và có repo mini project làm bằng chứng.
- *"Vì sao Unity dev lại nên làm Cocos?"* → chạm tới lý do kinh doanh: H5 và máy yếu cần gói nhỏ, khởi động nhanh, và mình chọn công cụ theo nơi phát hành.
- *"Anh xử lý ScriptableObject ở Cocos thế nào?"* → không có tương đương: dữ liệu thành JSON cộng `interface` TS kiểm trong CI, kênh sự kiện thành `EventTarget`.
- *"Tại sao dùng `async/await` thay coroutine, rủi ro là gì?"* → coroutine tự dừng khi object bị huỷ còn Promise thì không; phải kiểm `isValid` sau `await` và chọn nơi huỷ chuỗi, vì mất cái này là lỗi gọi vào node đã chết.
- *"Draw call tăng đột ngột thì nghi gì trước?"* → sprite khác atlas chen giữa, `Label` mode `NONE`, `Mask`, `Graphics`; tắt lần lượt từng lớp UI để tìm thủ phạm.
- *"Rò bộ nhớ trong Cocos thường đến từ đâu?"* → listener và tween không gỡ, bundle không release, asset giữ ref không `decRef`; kiểm bằng cách chuyển scene nhiều lần và xem bộ nhớ có tăng.
- *"Kết nối SmartFoxServer ở client làm sao cho bền?"* → có timeout, tự nối lại, đồng bộ lại trạng thái sau nối lại, và lớp mạng tách khỏi UI qua event để thay giao thức không đụng giao diện. Kể theo trải nghiệm thật: [điền: cái đã làm].
- *"Anh chọn Unity hay Cocos cho dự án mới của chúng tôi?"* → hỏi lại đích phát hành (store native, H5, mini game), 2D hay 3D, máy mục tiêu, đội hiện có; rồi chọn theo đó, không theo thói quen.

**Cờ đỏ**

- Nói "biết Cocos" rồi khi bị hỏi thì lộ chỉ biết 2.x, không hề nhắc trước: nghe như che giấu, dù kinh nghiệm thật.
- Chê Cocos là "engine đồ chơi" hay chê Cocos2d-x để nâng Unity: studio dùng cả hai sẽ xem đó là thiếu tôn trọng và thiếu linh hoạt.
- Bịa số liệu của game cũ (doanh thu, lượng người chơi) hoặc tên tính năng không nhớ rõ.
- Hứa "một tuần là quen hết" mà không có cơ sở, hoặc ngược lại nói "cần vài tháng" khiến họ ngại rủi ro.
- Trả lời mọi câu bằng phép so sánh với Unity mà không tự mô tả được cơ chế của Cocos.
- Dùng API 2.x (`cc.loader`, `node.x`) khi nói về 3.x.
- Nói "Cocos giống Unity hết" mà không nhắc ScriptableObject, coroutine, `struct`, UITransform: lộ chưa từng làm kỹ.
- Giả vờ rành cocos2d-x C++ khi chưa viết dòng C++ nào cho nó: một câu hỏi về `retain/release` là lộ.
- Quên gỡ listener, tween, schedule, rồi nói "engine tự dọn": đó là nguồn rò bộ nhớ số một.
- Nói hot update chạy được trên web hoặc mini game: nó chỉ dành cho native.
- Nói chắc nịch về API mini game (WeChat, Douyin) mà không tra lại tài liệu nền tảng: chúng đổi liên tục.

**Số / ví dụ nên thuộc**

- Cocos Creator **3.8**, TypeScript; kinh nghiệm cũ là **2018 – 06/2019, 1.x/2.x**.
- Vòng đời: `onLoad` → `onEnable` → `start` → `update(dt)` → `lateUpdate(dt)` → `onDisable` → `onDestroy`.
- Mốc draw call cho một màn H5: dưới khoảng **50**; `Mask` cộng khoảng **+2** draw call mỗi cái.
- Texture 2048×2048 không nén chiếm khoảng **16 MB** RAM dù file PNG chỉ vài trăm KB.
- Ngân sách máy Android tầm thấp: node trong scene dưới khoảng **1500**, texture trong RAM dưới **120 MB**.
- Hot update: hai manifest (`project.manifest`, `version.manifest`); phát hành **5%** trước; rollback dưới **5 phút**.
- Khác biệt 2.x → 3.x: `import { ... } from 'cc'`, `node.position` là `Vec3` chỉ đọc, `UITransform`, `UIOpacity`, `assetManager`.
- Thời gian bắt nhịp cam kết: [điền: 2–3 tuần], tuần đầu có review.
- Sự kiện: `node.on(type, cb, this)` ↔ `node.off`; `EventTarget` import từ `cc`; `input.on` cho phím; `targetOff(this)` gỡ hàng loạt.
- Chờ/trì hoãn: `scheduleOnce` / `schedule`; chuỗi: `async/await` hoặc `tween().delay().call()`; sau `await` kiểm `isValid`.
- Asset: `resources.load`, `assetManager.loadBundle`, `addRef` / `decRef`; chia bundle theo "khi nào cần".
- Spine: `REALTIME` (nhân vật chính) / `SHARED_CACHE` (quái đông) / `PRIVATE_CACHE`; đặt cache mode **trước** `setAnimation`.
- Label cache mode: `BITMAP` cho chữ tĩnh, `CHAR` cho số nhảy.
- Physics 2D: Box2D (mô phỏng đầy đủ) so với builtin (chỉ va chạm); dùng **group**.
- Build: `web-mobile`, native qua JSB nối sang lõi C++, mini game có giới hạn gói chính cỡ vài MB (tra lại số hiện hành).
- Cocos2d-x = framework C++ (code-only); Cocos Creator = engine + Editor, TypeScript, Node + Component.
- `PlayerPrefs` → `sys.localStorage`; `Instantiate` → `instantiate`; `Destroy` → `node.destroy()`; `DontDestroyOnLoad` → `director.addPersistRootNode`; `Time.deltaTime` → `dt`.
