# GLOSSARY — từ điển thuật ngữ

Mỗi thuật ngữ là một heading cấp 2. Cú pháp:

```
## thuật-ngữ | tên gọi khác | alias nữa
Giải thích ngắn, 1–3 câu. Nói CÁI NÓ LÀ và VÌ SAO nó quan trọng.
see: node-id
```

- Tên sau `|` là alias — cùng một giải thích.
- Dòng `see:` (tuỳ chọn) trỏ tới node đọc sâu; popover hiện nút mở node đó.
- So khớp **không phân biệt hoa/thường và không phân biệt dấu**.

Web tô màu và cho bấm những chỗ khớp từ điển, ở **hai đường**:

1. `inline code` — khớp cả dạng `Thing.member` (`AudioSettings.dspTime` → `dspTime`).
2. **Văn xuôi** — khớp đúng cách viết ở heading và alias, kể cả có dấu
   (`lạm phát`, `mã hoá kép`). Chỉ tô **lần xuất hiện đầu tiên** trong mỗi mục;
   bỏ qua chữ trong code, trong link, trong tiêu đề và trong SVG.

Nghĩa là: **tên thuật ngữ trong `_GLOSSARY.md` phải viết đúng như cách nó xuất
hiện trong nội dung**, nếu không sẽ không có gì được tô. Thêm alias cho các cách
viết khác.

Bản tiếng Anh (`_GLOSSARY.en.md`) chưa có — chế độ EN tạm dùng giải thích tiếng Việt.

---

## core loop
Chuỗi hành động ngắn nhất người chơi lặp đi lặp lại — đơn vị vui nhỏ nhất của game. Nếu vòng này không vui trong 30 giây, không hệ thống meta nào cứu được.
see: core-loop

## design pillars | pillar | pillars
2–4 câu định nghĩa game của bạn *là gì* và *không là gì*. Pillar tốt phải có khả năng nói KHÔNG với một tính năng cụ thể; nếu nó không loại trừ được gì thì chỉ là khẩu hiệu.
see: design-pillars

## game feel | juice
Cảm giác vật lý khi điều khiển. Quyết định phần lớn ấn tượng 30 giây đầu, và gần như nằm ngoài phần "tính năng" của tài liệu thiết kế.
see: game-feel

## hitstop | freeze frame
Dừng hình 50–120ms ngay khi trúng đòn. Công cụ tạo cảm giác lực rẻ nhất và mạnh nhất — hiệu quả hơn tăng âm lượng hay tăng sát thương.
see: game-feel

## screenshake
Rung camera khi có va chạm. Biên độ 4–10px, 100–200ms, **phải giảm dần**. Cường độ nên tỉ lệ với ý nghĩa sự kiện; nếu mọi thứ đều rung mạnh thì không gì đáng chú ý.
see: game-feel

## coyote time
Khoảng 80–120ms sau khi rời mép nền mà vẫn nhảy được. Một trong những thủ thuật "nói dối cho hợp trực giác" cơ bản nhất.
see: game-feel

## input buffer
Ghi nhận lần bấm sớm 100–150ms trước khi hành động khả dụng. Trong Unity: buffer ở `Update`, xử lý ở `FixedUpdate`.
see: game-feel

## squash & stretch
Biến dạng ±15–25% khi nhảy và tiếp đất. Nguyên tắc animation cổ điển, rẻ và hiệu quả cho cảm giác chuyển động.
see: game-feel

## MDA | MDA framework
Mechanics → Dynamics → Aesthetics. Người thiết kế đi từ trái sang phải, người chơi trải nghiệm từ phải sang trái — nên thiết kế phải truy ngược từ cảm xúc mong muốn về luật chơi.
see: mda-framework

## SDT | self-determination theory
Ba nhu cầu tâm lý: competence (cảm giác giỏi lên), autonomy (cảm giác tự quyết), relatedness (cảm giác kết nối). Game thoả cả ba đều gây nghiện.
see: player-motivation

## competence
Cảm giác mình đang giỏi lên — không phải chỉ số tăng, mà *bản thân người chơi* chơi giỏi hơn. Đây là nhu cầu mà DDA lộ liễu phá huỷ.
see: player-motivation

## autonomy
Cảm giác lựa chọn của mình có ý nghĩa. Ba build đều khả thi thì có autonomy; ba build mà một cái trội hẳn thì chỉ là lựa chọn giả.
see: player-motivation

## Bartle
Phân loại bốn kiểu người chơi: Achiever, Explorer, Socialiser, Killer. Dùng để kiểm tra độ phủ, không dùng để cố phục vụ cả bốn.
see: player-motivation

## flow | vùng dòng chảy
Trạng thái chìm đắm khi thử thách xấp xỉ kỹ năng. Quá khó → lo âu; quá dễ → chán. Cả hai đều dẫn tới bỏ game.
see: difficulty-curve

## source | faucet
Nơi tài nguyên sinh ra trong nền kinh tế: rơi đồ, thưởng nhiệm vụ, thu hoạch.
see: economy-design

## sink | drain
Nơi tài nguyên biến mất: mua bán, nâng cấp, sửa chữa, phí. Sink phải tăng **cùng bậc** với source, nếu không đến cuối game tiền vô nghĩa.
see: economy-design

## lạm phát | inflation
Source > sink kéo dài. Tiền mất giá, mọi phần thưởng vô nghĩa, người chơi hết mục tiêu. Phát hiện bằng cách xem vàng tồn kho trung vị có tăng đơn điệu sau ngày 7 không.
see: economy-design

## tường cày cuốc | grind wall
Điểm mà chi phí tăng nhanh hơn thu nhập, làm thời gian tới mốc kế tiếp nhảy vọt. Đây là nơi người chơi bỏ game.
see: progression

## vertical progression | tiến trình dọc
Số to hơn: HP 100 → 500. Dễ làm, dễ điều tiết, nhưng làm mất giá nội dung cũ và dễ bùng nổ chỉ số.
see: progression

## horizontal progression | tiến trình ngang
Nhiều lựa chọn hơn: thêm vũ khí, kỹ năng, đường build. Giữ nội dung cũ còn giá trị và tạo autonomy.
see: progression

## mastery
Người chơi giỏi lên, nhân vật không đổi. Dạng tiến trình bền vững nhất: không lạm phát, không mất giá.
see: progression

## startup | windup
Giai đoạn vung lên trước khi đòn gây sát thương. Đây là *telegraph* — toàn bộ thông tin người chơi có để phản ứng, và là giai đoạn quan trọng nhất về mặt thiết kế.
see: combat-systems

## active frames
Cửa sổ đòn đánh thực sự gây sát thương.
see: combat-systems

## recovery
Giai đoạn thu đòn về. Đây là cửa sổ trừng phạt — phần thưởng cho đối phương vì đã né đúng.
see: combat-systems

## telegraph | tell
Tín hiệu báo trước đòn đánh. Phải dài hơn thời gian phản ứng người thật (~250ms) cộng thời gian thực hiện hành động né — tức thường ≥ 400ms cho đòn cần phản ứng.
see: combat-systems

## frame data
Bảng số startup/active/recovery của từng đòn. Trong game hành động, frame data **là** luật chơi — nên nó phải là dữ liệu, không phải animation event.
see: combat-systems

## animation cancel
Cho phép huỷ animation đang chạy để chuyển sang hành động khác. Công cụ responsiveness mạnh nhất; không cho cancel gì cả làm nhân vật cảm thấy mất kiểm soát.
see: animation-game

## poise | stagger
Thanh ẩn, đầy thì kẻ địch choáng. Thưởng cho việc gây áp lực liên tục thay vì đánh rồi lùi.
see: combat-systems

## TTK | time to kill
Thời gian hạ một mục tiêu. Biến thiên giữa các cặp không nên vượt ~2×; chênh lệch lớn nghĩa là một số kẻ địch bị bỏ qua.
see: balancing-math

## winrate
Tỉ lệ thắng của một build hoặc nhân vật. PvE lành mạnh 45–65%; PvP cần 48–52%. Quan trọng hơn con số là **phân bố**.
see: balancing-math

## pick rate
Tỉ lệ người chơi chọn một lựa chọn. Một lựa chọn vượt ~25% nghĩa là các lựa chọn khác đang vô nghĩa — autonomy chỉ là ảo giác.
see: balancing-math

## Monte Carlo | mô phỏng Monte Carlo
Chạy hàng nghìn lượt mô phỏng có yếu tố ngẫu nhiên để xem **phân bố** kết quả, không chỉ giá trị trung bình. Cách duy nhất cân bằng mà không đoán mò.
see: balancing-math

## lợi ích giảm dần | diminishing returns
Đường cong bão hoà cho mọi thứ cộng dồn: `hiệu quả = tối đa × (1 - e^(-k·n))`. Thiếu nó, người chơi dồn hết vào một chỉ số và phá vỡ game.
see: balancing-math

## degenerate strategy | chiến lược suy biến
Cách chơi tối ưu nhưng nhàm chán, thường sinh ra từ việc nhân các phần trăm với nhau. Người chơi sẽ tìm ra nó; câu hỏi là bạn có tìm trước không.
see: balancing-math

## input randomness
Ngẫu nhiên xảy ra **trước** quyết định của người chơi: bài trên tay, bản đồ được sinh. Người chơi thích nghi với nó → tạo ra kỹ năng.
see: randomness

## output randomness
Ngẫu nhiên xảy ra **sau** quyết định: tỉ lệ trúng, crit, damage roll. Người chơi chịu đựng nó → tạo ra ức chế. Nên ưu tiên input randomness.
see: randomness

## pity system | bad-luck protection
Tăng dần xác suất theo số lần thất bại liên tiếp, để chuỗi xui không kéo dài vô hạn. `p = min(1, p_gốc + tăng_dần × số_lần_trượt)`.
see: randomness

## shuffle bag
Rút không lặp lại trong một lượt rồi mới trộn lại. Dùng thay random thuần cho biến thể âm thanh và drop, vì tai và mắt phát hiện lặp rất nhanh.
see: randomness

## seed
Số khởi tạo bộ sinh ngẫu nhiên. Cùng seed phải cho cùng kết quả — thiếu tính tất định này thì không tái hiện được bug, không làm được daily challenge.
see: procedural-generation

## DDA | dynamic difficulty adjustment
Điều chỉnh độ khó theo hiệu suất người chơi lúc chạy. Nguyên tắc sống còn: người chơi không được phép nhận ra, nếu không mọi chiến thắng mất ý nghĩa.
see: difficulty-curve

## răng cưa | sawtooth
Hình dạng đường cong khó hiệu quả: giới thiệu (dễ) → luyện tập → thử thách đỉnh → hạ xuống. Đoạn hạ xuống là nơi người chơi *cảm nhận được* mình đã mạnh lên.
see: difficulty-curve

## rubber-banding
Điều chỉnh độ khó theo vị trí người chơi trong game đua. Ví dụ kinh điển về DDA làm sai: ai cũng nhận ra, và nó làm việc chơi giỏi trở nên vô nghĩa.
see: difficulty-curve

## FSM | finite state machine | máy trạng thái
NPC luôn ở đúng một trạng thái, chuyển khi điều kiện thoả. Kiến trúc AI đơn giản nhất và dễ gỡ lỗi nhất; giới hạn là số chuyển tiếp tăng theo bình phương số trạng thái.
see: fsm

## behavior tree | BT
Cây ưu tiên: mỗi tick duyệt từ gốc, node đầu tiên chạy được sẽ chạy. Chuẩn công nghiệp cho AI NPC. Đổi ưu tiên chỉ cần kéo nhánh lên/xuống.
see: behavior-tree

## selector
Node BT kiểu HOẶC: chạy con lần lượt tới khi một con thành công.
see: behavior-tree

## sequence
Node BT kiểu VÀ: chạy con lần lượt tới khi một con thất bại.
see: behavior-tree

## blackboard
Từ điển key-value dùng chung cho một agent. Tách **cảm nhận** (perception ghi vào) khỏi **quyết định** (BT/FSM đọc ra) — kiến trúc sạch và test được.
see: behavior-tree

## hysteresis | ngưỡng trễ
Hai ngưỡng khác nhau cho vào và ra một trạng thái: vào chế độ chạy trốn ở HP < 25%, thoát ở HP > 40%. Cách chống dao động cơ bản nhất.
see: behavior-tree

## GOAP | goal-oriented action planning
NPC tự tìm chuỗi hành động đạt mục tiêu, bằng A* trong không gian trạng thái. Linh hoạt nhưng đắt CPU và rất khó gỡ lỗi.
see: goap

## utility AI
Chấm điểm mọi hành động khả dĩ mỗi tick rồi chọn điểm cao nhất. Mở rộng rất sạch — thêm hành động thứ 40 không đụng 39 cái cũ.
see: utility-ai

## consideration
Một yếu tố đầu vào của utility AI, chuẩn hoá về [0,1] rồi qua một đường cong. Nhân các consideration với nhau, và nhớ bù luỹ thừa.
see: utility-ai

## A* | A star
Thuật toán tìm đường ưu tiên node có `f = g + h` nhỏ nhất. Heuristic phải không bao giờ ước lượng cao hơn chi phí thật, nếu không kết quả không tối ưu.
see: pathfinding

## heuristic
Hàm ước lượng chi phí còn lại trong A*. Chọn sai dạng heuristic cho dạng lưới là lỗi phổ biến nhất — Manhattan cho 4 hướng, octile cho 8 hướng.
see: pathfinding

## NavMesh
Chia bề mặt đi được thành các đa giác lồi. Ít node hơn lưới ô vuông rất nhiều và cho đường đi tự nhiên hơn. Từ Unity 2022 nằm ở package AI Navigation.
see: pathfinding

## flow field
Tính một lần từ đích ra toàn bản đồ, mỗi ô lưu hướng đi kế tiếp. Cho hàng trăm đơn vị chung đích, đây là hai bậc độ lớn nhanh hơn N lần A*.
see: pathfinding

## steering
Cách *đi như thế nào* (mượt, tránh nhau), khác pathfinding là *đi đâu*. Dùng Arrive thay Seek thuần, nếu không agent rung quanh đích.
see: steering-flocking

## boids
Ba luật tạo hành vi bầy đàn: separation, alignment, cohesion. Đàn chim, đàn cá, bầy zombie đều là cùng thuật toán khác bộ trọng số.
see: steering-flocking

## AI director
AI cấp hệ thống điều tiết nhịp độ cả trận — quyết định khi nào spawn và khi nào cho nghỉ. Mô hình Left 4 Dead: BuildUp → SustainPeak → PeakFade → Relax.
see: ai-director

## intensity
Chỉ số 0–1 đo cường độ trải nghiệm hiện tại, dùng làm tín hiệu cho AI director và adaptive music.
see: ai-director

## perception
Hệ thống tầm nhìn, thính giác, trí nhớ của NPC. Quyết định AI *cảm thấy* công bằng hay ăn gian — đọc vị trí người chơi trực tiếp là ăn gian, dù số liệu cân bằng.
see: perception

## awareness
Thang nhận biết 0–1 thay cho cờ bool "thấy/không thấy". Cho người chơi cửa sổ để rút lui trước khi bị phát hiện hẳn — đó chính là gameplay lén lút.
see: perception

## procgen | procedural generation
Sinh nội dung bằng thuật toán. Nên **sắp xếp lại nội dung thủ công** thay vì sinh từ số không — đa dạng thống kê không phải đa dạng cảm nhận.
see: procedural-generation

## wave function collapse | WFC
Sinh nội dung bằng lan truyền ràng buộc từ một mẫu ví dụ. Kết quả cục bộ nhất quán ấn tượng, nhưng khó điều khiển mục tiêu tổng thể và có thể thất bại.
see: procedural-generation

## silhouette | hình bóng
Hình dạng nhận ra được khi tô đen trắng thuần. Bài kiểm tra art rẻ nhất và bị bỏ qua nhiều nhất: nếu vẫn phân biệt được nhân vật, kẻ địch, lối đi thì hình khối tốt.
see: art-direction

## mã hoá kép | double encoding
Mọi phân biệt quan trọng dùng màu **cộng** một kênh thứ hai (hình dạng, icon, vị trí). Khoảng 8% nam giới mù màu đỏ-lục, nên chỉ dùng màu là loại bỏ một phần người chơi.
see: accessibility

## diegetic UI
UI nằm trong thế giới game (đồng hồ trên vũ khí, đèn trên áo giáp). Tăng nhập vai nhưng đọc chậm hơn và khó scale qua nhiều độ phân giải.
see: ux-hud

## audio bus
Nhóm âm thanh trong mixer. Mọi âm thanh phải đi qua bus, nếu không settings âm lượng và ducking đều vô hiệu. Dựng cây bus trước khi làm âm thanh thứ hai.
see: audio-implementation

## ducking
Hạ tạm các bus khác khi âm thanh quan trọng phát, để thông tin nổi lên khỏi nền. Không có ducking, âm cảnh báo bị chìm đúng lúc cần nghe nhất.
see: audio-implementation

## layering
Dựng một SFX từ nhiều lớp: transient (cú va chạm) + body (chất liệu) + tail (không gian). Muốn đòn mạnh hơn thì tăng transient, đừng tăng âm lượng tổng.
see: audio-design

## adaptive music
Nhạc thay đổi theo trạng thái game. Vertical layering (bật/tắt lớp) dễ hơn horizontal resequencing (nối đoạn), và luôn khớp nhịp vì mọi lớp cùng timeline.
see: adaptive-music

## equal-power crossfade
Chuyển giữa hai track bằng `cos`/`sin` thay vì tuyến tính. Crossfade tuyến tính làm tổng năng lượng tụt ở giữa đoạn chuyển — nghe như âm thanh bị hụt.
see: adaptive-music

## ECS | entity component system
Kiến trúc data-oriented cho hiệu năng ở quy mô lớn. **Bị lạm dụng nghiêm trọng** — dưới 200 thực thể thì nó chỉ thêm độ phức tạp và làm chậm việc thử nghiệm.
see: architecture-patterns

## object pooling
Tái dùng object thay vì tạo/huỷ liên tục. Lý do không chỉ là tốc độ: cấp phát liên tục gây GC spike, và giật lag định kỳ rõ ràng hơn FPS thấp đều.
see: architecture-patterns

## event bus
Các hệ thống giao tiếp qua sự kiện, không biết nhau. Đổi lại luồng thực thi trở nên vô hình — dùng cho giao tiếp giữa các hệ thống lớn, không dùng trong nội bộ một hệ thống.
see: architecture-patterns

## data-driven design
Logic nằm trong code, con số nằm trong dữ liệu. Điều kiện tiên quyết để cân bằng nhanh, và để AI agent chỉnh số mà không phá vỡ logic.
see: data-driven-design

## ScriptableObject
Asset chứa dữ liệu trong Unity. **Chỉ đọc lúc chạy** — gán vào field của nó sẽ ghi thẳng vào asset và còn nguyên sau khi thoát Play Mode.
see: data-driven-design

## hot reload
Sửa file dữ liệu và game cập nhật ngay, không cần khởi động lại. Rút vòng lặp cân bằng từ "sửa → build 90s → chơi lại" xuống "sửa → F5".
see: data-driven-design

## GC | garbage collection
Thu gom bộ nhớ tự động. Cấp phát trong vòng lặp mỗi frame làm GC chạy định kỳ và gây khựng — chỉ tiêu thực dụng là 0 B cấp phát mỗi frame.
see: performance

## draw call
Một lệnh gửi tới GPU. Nhiều draw call là nguyên nhân tụt FPS phổ biến ở UI và sprite; gom vào atlas hoặc batch để giảm.
see: performance

## overdraw
Vẽ nhiều lớp trong suốt chồng lên nhau. Kẻ giết frame rate thật của particle, không phải số lượng hạt.
see: performance

## profiler
Công cụ đo hiệu năng. Ba cột cần nhìn trước: GC Alloc (quan trọng nhất), Time ms, Calls. Đo trước rồi tối ưu — trực giác về hiệu năng gần như luôn sai.
see: performance

## GDD | game design document
Tài liệu thiết kế. GDD cho AI đọc thì ngắn, đặc, có số, và có **ràng buộc phủ định** — nêu rõ điều KHÔNG được làm.
see: gdd-for-ai

## bất biến | invariant | INV
Luật về game mà agent không được vi phạm, kèm cách phát hiện vi phạm. Dòng "cách phát hiện" là thứ biến nguyện vọng thành luật máy kiểm tra được.
see: agent-guardrails

## guardrail | rào chắn
Ràng buộc biến ý định thiết kế thành luật kiểm tra được. Rào chắn mạnh nhất là test chạy trong CI — bạn sẽ quên nhắc, CI thì không.
see: agent-guardrails

## vertical slice
Một phần game hoàn chỉnh theo chiều dọc: một màn chơi được, một kẻ địch, một vũ khí, **có juice đầy đủ**. Đây là lúc kiểm chứng core loop có vui không.
see: ai-workflow

## assembly definition | asmdef
Chia project Unity thành các assembly riêng. `noEngineReferences: true` biến "Core không dùng UnityEngine" từ lời nhắc thành lỗi compile.
see: unity-project-structure

## prefab variant
Prefab kế thừa từ prefab khác, chỉ ghi đè phần khác biệt. Cơ chế Unity làm tốt và ít dự án dùng đủ — thay thế cho cây kế thừa class.
see: unity-project-structure

## FixedUpdate
Vòng lặp chạy ở tần số cố định trong Unity. Luật chơi cần tất định thì ở đây; đọc input thì ở `Update`, nếu không mất input khi frame rate cao.
see: unity-physics

## timeScale
Hệ số thời gian trong Unity. Đặt 0 để hitstop hoặc pause — nhưng khi đó `WaitForSeconds` đứng mãi, phải dùng `WaitForSecondsRealtime`.
see: game-feel

## dspTime
Đồng hồ của audio thread trong Unity (`AudioSettings.dspTime`). Dùng nó cho nhạc đúng nhịp — `Time.time` trôi so với đồng hồ audio và lệch dần.
see: adaptive-music

## canvas rebuild
Unity vẽ lại toàn bộ Canvas khi một phần tử trong đó đổi. Vì vậy phải tách Canvas theo tần suất đổi, nếu không thanh máu đổi 60 lần/giây kéo cả khung tĩnh theo.
see: unity-ui

## CanvasScaler
Component quyết định UI scale thế nào qua các độ phân giải. `Match = 1` khớp theo chiều cao là lựa chọn đúng cho hầu hết game.
see: ui-design

## Linear color space
Chế độ màu đúng về mặt vật lý cho blending và lighting. Phải chọn từ ngày đầu — đổi sau làm mọi màu lệch và phải làm lại art.
see: unity-lighting

## IL2CPP
Backend biên dịch C# sang C++ của Unity. Cùng với stripping, đây là nguồn lỗi "chạy trong Editor mà crash trong build" — nên phải build ra máy đích từ tuần đầu.
see: unity-build-platform

## goroutine
Đơn vị chạy song song của Go, rẻ hơn thread hệ điều hành nhiều lần (stack khởi điểm 8 KB rồi tự lớn) nên mở hàng chục nghìn cái là bình thường. Cái giá: goroutine không có đường thoát sẽ rò, và chỉ lộ ra sau vài ngày chạy liên tục.
see: game-server-go

## idempotency | idempotent
Tính chất "gọi lại lần thứ hai không làm đổi kết quả". Với lệnh ghi đi qua mạng di động, đây là điều kiện tối thiểu để retry không nhân đôi vật phẩm — làm bằng một request_id do client sinh và ràng buộc UNIQUE ở database.
see: game-database

## sổ cái | ledger | append-only
Bảng chỉ thêm, không sửa không xoá, mỗi thay đổi tài nguyên một dòng. Cho phép dựng lại số dư khi nghi ngờ, hoàn đồ có bằng chứng, và đo faucet/drain thật mà không cần dựng thêm hệ thống đo nào.
see: game-database

## ZSET | sorted set
Kiểu dữ liệu Redis giữ tập phần tử kèm điểm và luôn ở trạng thái đã sắp xếp. Là cách đúng để làm bảng xếp hạng: lấy hạng của một người là O(log N), thay vì ORDER BY trên cả triệu dòng ở mỗi request.
see: game-database

## authoritative | server authoritative
Server quyết kết quả, client chỉ gửi ý định. Endpoint nào nhận nguyên trạng thái (vàng, inventory) từ client là endpoint tự nhân bản vật phẩm — và nó trông hoàn toàn bình thường lúc review code.
see: game-server-go

## JWT
Token đã ký, server đọc được mà không cần tra database. Dùng cho access token ngắn hạn (10–15 phút) đi kèm refresh token thu hồi được; đừng nhét dữ liệu game (vàng, level) vào vì nó cũ ngay khi vừa phát hành.
see: game-server-go

## CCU | concurrent users
Số người chơi online cùng lúc — đơn vị để tính chi phí server và để chọn kiến trúc. Khác hẳn DAU: 100.000 DAU có thể chỉ tương ứng 3.000 CCU.
see: backend-go

## p99
Ngưỡng mà 99% request nằm dưới. Số trung bình luôn đẹp và luôn che mất chỗ đau; p99 mới là cái người chơi kể lại trên store.
see: game-server-go

## graceful shutdown
Tắt process theo trình tự: ngừng nhận việc mới, làm nốt việc đang dở, rồi mới thoát. Thiếu nó thì mỗi lần deploy là một lần người chơi mất trận — và cả đội sẽ sợ deploy.
see: game-server-go

## mediation
Một SDK mẹ gọi nhiều mạng quảng cáo con qua adapter, rồi chọn giá tốt nhất cho từng lượt hiển thị. Cần nó vì không mạng nào lấp hết inventory; cái giá là mỗi adapter là một thư viện native, nên mọi vấn đề build nhân lên theo số mạng bật.
see: unity-monetization-sdk

## eCPM
Doanh thu ước tính trên mỗi 1000 lượt hiển thị. Đổi theo vùng, theo mùa và theo định dạng quảng cáo — nên so eCPM giữa hai thị trường khác nhau là so hai thứ khác nhau.
see: unity-monetization-sdk

## fill rate
Tỉ lệ lượt yêu cầu quảng cáo thật sự có quảng cáo trả về. Fill rate thấp nghĩa là người chơi bấm nút mà không có gì hiện — lý do chính khiến người ta dùng mediation thay vì một mạng duy nhất.
see: unity-monetization-sdk

## in-app bidding | bidding
Mọi mạng cùng trả giá theo thời gian thực cho đúng lượt hiển thị đó, giá cao nhất thắng. Thay thế waterfall (xếp sẵn theo giá dự kiến) và cho doanh thu lẫn độ trễ tốt hơn.
see: unity-monetization-sdk

## EDM4U | External Dependency Manager
Công cụ giải phụ thuộc native (Android `.aar`, iOS CocoaPods) mà hầu hết SDK của Google và các mạng quảng cáo đều mang theo. Nhiều SDK cùng mang mỗi bản một phiên bản là nguyên nhân lỗi build số một của nhóm này: giữ bản mới nhất, xoá phần còn lại, rồi Force Resolve.
see: unity-third-party

## tween
Nội suy một giá trị từ A tới B theo thời gian và theo đường ease — thứ tạo ra phần lớn chuyển động UI. Unity không có tween chính thức nên đây là chỗ thư viện ngoài (DOTween, PrimeTween) hay được dùng nhất.
see: unity-third-party

## phần thưởng chờ | pending reward
Phần thưởng đã được xác nhận nhưng chưa ghi vào tài khoản người chơi, lưu xuống đĩa trước khi trao. Không có nó thì app bị kill đúng lúc trao là người chơi xem xong quảng cáo mà mất thưởng.
see: unity-monetization-sdk

## mini game | minigame | mini-game
Game chạy bên trong một siêu ứng dụng (WeChat, Douyin, Zalo, Messenger) thay vì cài từ store. Đổi lại sự tiện đó là ba ràng buộc cứng: hạn mức dung lượng gói chính, không có DOM của trình duyệt, và phải dùng SDK riêng của từng nền tảng.
see: cocos-creator

## hot update | cập nhật nóng
Tải phần chênh lệch của asset và script rồi nạp đè khi app khởi động, không qua duyệt store. Là lợi thế lớn của bản native Cocos cho game live-ops — kèm nghĩa vụ tự lo CDN, phiên bản, và đường lùi khi tải hỏng giữa chừng.
see: cocos-creator

## value type
Kiểu mà biến giữ **chính dữ liệu**: gán là copy toàn bộ, không do GC quản. `struct`, `int`, `enum`, `Vector3` đều là value type — nên `transform.position.x = 5` không biên dịch, vì `position` trả về một bản sao.
see: csharp-type-system

## reference type
Kiểu mà biến chỉ giữ **địa chỉ** của object nằm trên heap: gán là copy tham chiếu, hai biến trỏ cùng một object, và GC là thứ dọn nó. Mọi `class` đều là reference type.
see: csharp-type-system

## boxing
Copy một value type lên heap và bọc trong một object — xảy ra khi ép struct sang `object` hoặc sang interface. Mỗi lần tốn một lần cấp phát (~24 byte cho một `int`) cộng một lần copy, nên trong vòng lặp mỗi frame nó là nguồn rác lớn.
see: csharp-type-system

## closure
Object do trình biên dịch sinh ra để giữ biến mà một lambda "bắt" từ bên ngoài. Lambda không bắt biến nào thì được cache lại và không cấp phát; bắt một biến cục bộ thì mỗi lần chạy sinh một object mới.
see: csharp-linq

## deferred execution
Truy vấn LINQ là **công thức**, không phải kết quả: `Where(...)` không duyệt gì cho tới khi có người `foreach`, `ToList()` hay `Count()`. Hệ quả là duyệt hai lần thì chạy hai lần, và nguồn đổi giữa chừng thì kết quả đổi theo.
see: csharp-linq

## swap-back
Mẹo xoá phần tử khỏi `List` bằng cách kéo phần tử cuối lấp vào chỗ vừa xoá rồi cắt đuôi — O(1) thay vì O(n) của `RemoveAt`. Cái giá là mất thứ tự, chấp nhận được với danh sách enemy hay đạn đang bay.
see: csharp-collections

## delegate
Con trỏ hàm có kiểu, giữ được nhiều hàm cùng lúc (multicast). Nó giữ cả `Target` — object chủ của hàm — và chính `Target` là nguyên nhân khiến sự kiện chưa huỷ đăng ký gây rò rỉ bộ nhớ.
see: csharp-delegate-event

## IDisposable
Hợp đồng "tôi nắm thứ GC không biết dọn": file, socket, native buffer, `NativeArray`. Dùng qua `using` để `Dispose` chạy cả khi có exception — khác hẳn finalizer vì thời điểm là xác định.
see: csharp-memory

## finalizer
Hàm `~MyClass()` chạy lúc GC quyết định, không xác định thời điểm và có thể không bao giờ chạy. Nó làm object sống thêm ít nhất một chu kỳ GC, nên chỉ dùng làm lưới an toàn cho handle native, không thay được `Dispose`.
see: csharp-memory

## Span | Span<T> | ReadOnlySpan
Cửa sổ nhìn vào một vùng nhớ có sẵn — mảng, chuỗi, hoặc `stackalloc` — cho phép cắt và xử lý mà không copy, không cấp phát. Là `ref struct` nên không làm field của class được và không dùng trong `async`.
see: csharp-memory

## race condition
Kết quả phụ thuộc vào thứ tự chạy của các thread, ví dụ hai thread cùng làm `counter++` (đọc–cộng–ghi) và mất một lần đếm. Dấu hiệu nhận biết là kết quả khác nhau ở mỗi lần chạy.
see: csharp-threading

## SynchronizationContext
Thứ quyết định phần code sau `await` chạy trên thread nào. Unity cài một context đưa bạn về main thread — đó là lý do `await` dùng được với API engine, và cũng là lý do `.Result` trên main thread gây khoá chết.
see: csharp-async

## CancellationToken
Cách huỷ **hợp tác**: không ai giết được tác vụ của bạn, chính code phải kiểm token và tự dừng. Trong Unity, mọi `MonoBehaviour` có sẵn `destroyCancellationToken` để continuation không quay lại chạm object đã destroy.
see: csharp-async

## null giả | fake null
Unity nạp chồng toán tử `==` để object đã `Destroy` được coi như `null`, dù tham chiếu C# vẫn còn. Hệ quả: `?.` và `??` **không** nhận ra vì chúng bỏ qua toán tử nạp chồng, nên với `UnityEngine.Object` chỉ dùng `== null`.
see: csharp-exception-null

## AOT | ahead-of-time
Biên dịch sẵn toàn bộ mã máy lúc build thay vì sinh lúc chạy. IL2CPP là AOT, nên mọi tổ hợp generic với value type phải xuất hiện tĩnh trong code — thiếu là `ExecutionEngineException` trên thiết bị dù Editor chạy tốt.
see: csharp-generic
