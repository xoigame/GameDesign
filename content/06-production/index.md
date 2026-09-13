---
title: Production & Tech
icon: 🏭
summary: Biến prototype thành sản phẩm — kiến trúc, data-driven, đo đạc, hiệu năng.
status: deep
read: 530
level: basic
order: 60
tags: [production, tech]
related: [systems, ai-assisted-dev]
---

Nhánh này về **cách xây** chứ không về **xây cái gì**.

## Các node

- **[[architecture-patterns]]** — ECS, component, event bus, state machine ở tầng ứng dụng.
- **[[data-driven-design]]** — tách dữ liệu khỏi code. Điều kiện tiên quyết để cân bằng và để AI hỗ trợ hiệu quả.
- **[[playtesting-metrics]]** — đo cái gì, đo thế nào, và cách đọc kết quả.
- **[[liveops]]** — vận hành sau phát hành: remote config, feature flag, sự kiện theo lịch, A/B test làm cho đúng.
- **[[tech-stack]]** — chọn engine và công cụ.
- **[[performance]]** — ngân sách và tối ưu.

Phần chạy trên máy chủ — Go cho API và phòng realtime, Postgres/Redis cho dữ liệu — tách thành nhánh riêng: **[[backend-go]]**.

## Nguyên tắc

**Kiến trúc phục vụ tốc độ lặp.** Ở giai đoạn tìm tòi, thứ quan trọng nhất là *sửa và thử nhanh*. Kiến trúc đẹp mà mỗi lần đổi số phải build lại 3 phút là kiến trúc sai cho giai đoạn đó.

**Đừng tối ưu sớm, nhưng hãy đo sớm.** Đặt profiler vào từ đầu. Bạn không cần tối ưu ngay, nhưng cần biết khi nào mọi thứ bắt đầu xấu đi — và phát hiện sớm thì rẻ hơn nhiều.

**Dữ liệu tách khỏi code là quyết định kiến trúc quan trọng nhất.** Nó quyết định bạn cân bằng game được nhanh tới đâu, và quyết định AI agent sửa số được an toàn tới đâu. Xem [[data-driven-design]].

## 🤖 Prompt cho AI

**Dùng AI thế nào ở nhánh này**

Nhánh này AI làm được gần hết, vì nó thuần kỹ thuật và kiểm chứng được. Ba việc có ROI cao nhất — đều là việc lập trình viên hay làm sơ sài vì nhàm:

1. **Editor tool và validator** — không đụng gameplay nên rủi ro thấp, mà tiết kiệm thời gian thật mỗi ngày.
2. **Unit test cho logic thuần** — nó viết test tốt hơn nhiều người, và test là thứ cho phép nó tự kiểm chứng về sau.
3. **CI, build script** — thuần script, chạy được là biết đúng.

Việc **không** nhờ: quyết định kiến trúc mà chưa có số liệu. Hỏi "kiến trúc nào tốt hơn" mà không nêu số thực thể và ngân sách frame sẽ nhận về ECS cho một game 40 thực thể.

Kiến trúc tốt khiến AI agent hiệu quả hơn rõ rệt:

- **Ranh giới rõ ràng** → agent sửa một hệ thống mà không phá hệ thống khác.
- **Có test** → agent tự kiểm chứng được thay đổi của mình.
- **Dữ liệu ngoài code** → chỉnh cân bằng không cần đụng tới logic.
- **Quy ước nhất quán** → code sinh ra khớp với phần còn lại của dự án.

Ngược lại, một codebase rối sẽ khiến agent tạo ra nhiều lỗi hơn — nó không thấy được toàn cảnh và sẽ đoán.

## 🎮 Unity

Toàn bộ nhánh này có bản Unity chi tiết ở [[unity]]: [[unity-project-structure]], [[unity-design-patterns]], [[unity-optimization]], [[unity-build-platform]].

**Ba thứ dựng trong tuần đầu, không để sau**

1. **Assembly Definition** — `Game.Core` với `noEngineReferences: true`. Nó cho bạn test EditMode nhanh và mô phỏng ngoài Unity; thêm sau nghĩa là sửa hàng trăm `using`.
2. **`.gitignore` đúng cho Unity** — `Library/`, `Temp/`, `Logs/`, `obj/`, `*.csproj`, `*.sln`. Commit `Library/` một lần là repo phình lên hàng GB.
3. **Build ra máy đích** — không phải cuối dự án, mà tuần đầu. IL2CPP, stripping, và giới hạn bộ nhớ chỉ lộ ra ở build thật. Xem [[unity-build-platform]].

**Git cho Unity — ba thứ bắt buộc**

```
# .gitattributes — KHÔNG có dòng này thì scene/prefab merge sẽ hỏng im lặng
*.unity   binary
*.prefab  binary
*.asset   binary
```

Đánh dấu binary làm git **từ chối** merge thay vì merge sai. Bạn sẽ phải chọn một bên — mệt, nhưng tốt hơn một scene hỏng không ai biết.

Và bật **Force Text** cho serialization (`Project Settings > Editor > Asset Serialization > Force Text`) để diff đọc được, dù vẫn treat as binary khi merge.

**Meta file phải commit**

`.meta` giữ GUID. Không commit `.meta` nghĩa là mọi tham chiếu vỡ trên máy người khác. Đây là lỗi phổ biến nhất khi người mới setup Unity repo.

**Kiểm tra nhanh**
- `git check-attr merge Assets/Scenes/Main.unity` → binary?
- `.meta` có được commit không?
- `Library/` có trong `.gitignore` không?
- Đã build ra máy đích ít nhất một lần chưa?

## 🎤 Phỏng vấn

Node con trong nhánh này đều có mục 🎤 riêng. Mục này gom câu hỏi về **cách dự án được vận hành** —
phần mà người phỏng vấn dùng để biết bạn đã ship game thật chưa.

**Production được hỏi ở ba dạng**

| Dạng | Họ đo cái gì | Node nên ôn |
|---|---|---|
| "Game chậm, anh làm gì" | Bạn đo trước hay đoán trước | [[performance]], [[architecture-patterns]] |
| "Chọn công nghệ cho dự án này" | Bạn chọn theo đội hay theo xu hướng | [[tech-stack]], [[data-driven-design]] |
| "Sau khi phát hành thì sao" | Bạn có từng vận hành một game đang sống chưa | [[liveops]], [[playtesting-metrics]] |

**Câu hay gặp**

- `Junior` **Game tụt fps trên máy yếu. Việc đầu tiên anh làm?**
  → **Đo trước, không sửa gì cả.** Build Development lên đúng máy đích, nối profiler, chụp ở cảnh đông nhất, và chụp ở **cả phút 1 lẫn phút 15** vì máy nóng lên thì bị throttle. Rồi tách CPU-bound hay GPU-bound trước khi chọn hướng sửa — sai bên thì mọi công sức không đổi được gì.
- `Junior` **Vì sao báo cáo hiệu năng nên dùng mili giây thay vì fps?**
  → Vì fps không tuyến tính: 60 → 50 fps là mất **3,3 ms**, còn 30 → 25 fps là mất **6,7 ms** — cùng "mất 5 fps" nhưng khối lượng phải cắt khác nhau gấp đôi. Và chỉ số nên dùng là **1% thấp nhất**, không phải trung bình, vì người chơi cảm nhận cú khựng tệ nhất chứ không cảm nhận trung bình.
- `Mid` **Chọn engine cho một dự án mới — tiêu chí nặng nhất?**
  → **Kinh nghiệm sẵn có của đội**, và nó hay bị coi nhẹ nhất. Một engine "kém hơn" mà đội đã thạo gần như luôn thắng engine "tốt hơn" phải học từ đầu, vì thời gian học còn là thời gian mắc những lỗi mà cộng đồng đã biết cách tránh. Sau đó mới tới nền tảng đích — phải chốt **trước** khi chọn engine.
- `Mid` **Vì sao tách dữ liệu khỏi code lại quan trọng đến vậy?**
  → Vì nó quyết định **số lần mình thử được**. Cân bằng là hàng trăm lần chỉnh; mỗi lần phải build 90 giây rồi chơi lại từ đầu thì phần lớn ý tưởng không bao giờ được thử. Thứ đáng làm sớm nhất là **hot reload**. Đổi lại, trình biên dịch không bảo vệ nữa nên **validation lúc build là bắt buộc**, và phải fail build chứ không chỉ cảnh báo.
- `Senior` **Phát hiện giá một gói IAP bị sai lúc 9 giờ sáng. Anh làm gì?**
  → Câu quyết định là có **remote config** hay không. Có thì sửa giá trị, đẩy cho **5%** trước, xác nhận trên thiết bị thật rồi mở 100% — khoảng 15 phút, song song dựng danh sách người mua nhầm để bù. Không có thì phải ra bản mới và chờ store duyệt: **2–3 ngày** sống chung với lỗi, và việc cần làm là tắt gói đó bằng kill switch nếu có.
- `Senior` **Anh đọc số liệu của một game đang live thế nào?**
  → **Crash-free sessions trước tiên** — dưới 99% là có vấn đề rõ, và bản hỏng làm mọi số khác vô nghĩa. Rồi D1/D7, thời lượng phiên, ARPDAU, và funnel onboarding **chia theo dòng máy**. Luôn dùng **trung vị và p90**, không dùng trung bình; và luôn nhìn **phễu** thay vì tổng số, vì phễu chỉ thẳng vào bước cần sửa.

**Khung trả lời 60 giây** — "Anh vận hành phần kỹ thuật của một dự án game thế nào?"

> Ba nguyên tắc, và cả ba đều là về **rút ngắn vòng lặp**. Thứ nhất, **đo trước khi sửa**: build lên máy đích, profiler thật, chụp ở cả phút 1 và phút 15, và tách CPU-bound với GPU-bound trước khi chọn hướng — sửa nhầm bên là mất nhiều ngày mà không đổi được gì.
>
> Thứ hai, **logic trong code, con số trong dữ liệu**, kèm hot reload. Nó đổi vòng lặp cân bằng từ "sửa, build chín mươi giây, chơi lại" thành "sửa, bấm F5, thấy ngay", và khác biệt là số lần thử nghiệm chứ không phải vài phút mỗi lần. Đổi lại thì **validation phải fail build**, vì trình biên dịch không bảo vệ nữa.
>
> Thứ ba, **phanh phải có trước khi cần**: remote config và feature flag cho mọi thứ có rủi ro tiền bạc hay dữ liệu, bật dần 5% rồi 50% rồi 100%, và giá trị mặc định đóng trong build để mất mạng vẫn chơi được. Không có LiveOps thì vòng sửa một con số sai là hai tới ba ngày chờ store duyệt.

**Cờ đỏ**

- Tối ưu thứ mình nghĩ là chậm, chưa đo.
- Báo cáo hiệu năng bằng fps trung bình, không nói máy đích.
- Chọn engine theo độ phổ biến, chốt engine trước khi chốt nền tảng.
- Số cân bằng nằm rải trong code, không có hot reload.
- Game treo ở màn hình chờ khi không tải được config.

**Số / ví dụ nên thuộc**

- Ngân sách frame: **16,6 ms** cho 60 fps, thực tế nhắm **~12 ms**; chỉ số dùng là **1% thấp nhất**.
- Mobile: throttle sau **10–15 phút**, nên luôn đo sau **15 phút** chơi liên tục.
- Cửa sổ đổi engine: tháng **0–2** còn đổi được · **2–6** đắt · **6+** là viết lại.
- LiveOps: bật dần **5% → 50% → 100%**; không có remote config thì vòng sửa là **2–3 ngày**.
- Crash-free sessions: **< 99%** có vấn đề, **≥ 99,5%** ổn định; đọc số bằng **trung vị + p90**.
