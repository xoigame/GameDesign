---
id: interview-cocos
title: "Anh có biết Cocos Creator không?"
icon: 🥥
summary: Cách trả lời trung thực mà mạnh khi nhà tuyển dụng hỏi về Cocos Creator lúc mình chủ yếu là Unity — có kinh nghiệm thật nhưng cũ (2.x), bản đồ Unity → Cocos 3.x, khác biệt 2.x → 3.x, và kế hoạch ôn 3 ngày kèm mini project làm bằng chứng.
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
| `DontDestroyOnLoad` | `game.addPersistRootNode(node)` | Node phải là root của scene |

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

**Khung trả lời 60 giây** — "Anh có biết Cocos Creator không?"

> Có. Từ 2018 đến giữa 2019 ở ME CORP, tôi làm cả Unity lẫn Cocos Creator cho game casino và slot nối với SmartFoxServer. Phần Cocos tôi phụ trách là [điền: màn hình hoặc tính năng cụ thể]. Tôi nói thẳng là đó là bản 1.x đến 2.x, nên kinh nghiệm thực chiến của tôi dừng ở đó. Mấy ngày nay tôi đã ôn lại 3.8: import từ `cc`, UITransform tách khỏi Node, vị trí chỉ đọc qua `setPosition`, và dựng lại một mini game để chắc tay. Mô hình Node và Component với vòng đời thì gần như giống Unity, nên cái tôi cần quen là API và TypeScript, không phải khái niệm. Tôi ước tính khoảng [điền: 2–3] tuần để làm việc độc lập, và tuần đầu mong được review code chặt.

**Họ sẽ đào tiếp**

- *"Cụ thể anh làm gì bằng Cocos ở ME CORP?"* → nêu một việc cụ thể (lobby, hiệu ứng quay, lớp kết nối SmartFoxServer), không nói "tham gia dự án"; nếu không nhớ chi tiết thì nói thẳng phần nhớ rõ nhất.
- *"2.x và 3.x khác nhau ở đâu?"* → import từ `cc`, `position` chỉ đọc, `UITransform` tách khỏi Node, Canvas cần Camera, `cc.loader` thành `assetManager`; kết bằng "khái niệm không đổi, API đổi".
- *"Sao anh biết ôn vài ngày là đủ?"* → không khẳng định đủ; nói đây là mức đủ để làm được việc nhỏ có review, và có repo mini project làm bằng chứng.
- *"Vì sao Unity dev lại nên làm Cocos?"* → chạm tới lý do kinh doanh: H5 và máy yếu cần gói nhỏ, khởi động nhanh, và mình chọn công cụ theo nơi phát hành.
- *"Anh xử lý ScriptableObject ở Cocos thế nào?"* → không có tương đương: dữ liệu thành JSON cộng `interface` TS kiểm trong CI, kênh sự kiện thành `EventTarget`.

**Cờ đỏ**

- Nói "biết Cocos" rồi khi bị hỏi thì lộ chỉ biết 2.x, không hề nhắc trước: nghe như che giấu, dù kinh nghiệm thật.
- Chê Cocos là "engine đồ chơi" hay chê Cocos2d-x để nâng Unity: studio dùng cả hai sẽ xem đó là thiếu tôn trọng và thiếu linh hoạt.
- Bịa số liệu của game cũ (doanh thu, lượng người chơi) hoặc tên tính năng không nhớ rõ.
- Hứa "một tuần là quen hết" mà không có cơ sở, hoặc ngược lại nói "cần vài tháng" khiến họ ngại rủi ro.
- Trả lời mọi câu bằng phép so sánh với Unity mà không tự mô tả được cơ chế của Cocos.
- Dùng API 2.x (`cc.loader`, `node.x`) khi nói về 3.x.

**Số / ví dụ nên thuộc**

- Cocos Creator **3.8**, TypeScript; kinh nghiệm cũ là **2018 – 06/2019, 1.x/2.x**.
- Vòng đời: `onLoad` → `onEnable` → `start` → `update(dt)` → `lateUpdate(dt)` → `onDisable` → `onDestroy`.
- Mốc draw call cho một màn H5: dưới khoảng **50**; `Mask` cộng khoảng **+2** draw call mỗi cái.
- Texture 2048×2048 không nén chiếm khoảng **16 MB** RAM dù file PNG chỉ vài trăm KB.
- Ngân sách máy Android tầm thấp: node trong scene dưới khoảng **1500**, texture trong RAM dưới **120 MB**.
- Hot update: hai manifest (`project.manifest`, `version.manifest`); phát hành **5%** trước; rollback dưới **5 phút**.
- Khác biệt 2.x → 3.x: `import { ... } from 'cc'`, `node.position` là `Vec3` chỉ đọc, `UITransform`, `UIOpacity`, `assetManager`.
- Thời gian bắt nhịp cam kết: [điền: 2–3 tuần], tuần đầu có review.
