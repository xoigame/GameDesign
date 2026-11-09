---
id: interview-system-design
title: Thiết kế hệ thống phía client
icon: 🏛
summary: Phương pháp trả lời năm bước và mười ba bài thiết kế hệ thống client game có lời giải mẫu (inventory, quest, buff, save, UI stack, tutorial, combat turn-based, red dot, tải asset, localization, input, event bus, replay) cho vòng phỏng vấn senior.
status: deep
read: 1128
level: advanced
order: 26
tags: [interview, architecture, design, client, senior]
related: [interview-live-service, interview-oop-math, architecture-patterns, data-driven-design]
---

Ở vòng sâu với ứng viên senior, câu "thiết kế hệ thống X" hiếm khi đòi sơ đồ hoàn hảo. Người hỏi muốn xem bạn **nghĩ có thứ tự không**: có hỏi lại đề không, có biết dữ liệu của ai, có thấy chỗ nó sẽ hỏng, và có dám nói "tôi chọn A vì B, giá phải trả là C" không. Node này gồm ba phần: (A) phương pháp năm bước, (B) mười ba bài mẫu, (C) nguyên tắc chung xuyên suốt. Câu hỏi về client/server, gacha, IAP nằm ở [[interview-live-service]]; OOP, pattern, toán nằm ở [[interview-oop-math]] — node này không lặp lại chúng.

## A. Phương pháp trả lời năm bước

| Bước | Làm gì | Câu mẫu |
|---|---|---|
| 1. Hỏi ràng buộc | Chốt phạm vi trước khi vẽ | "Số lượng item cỡ nào? Server giữ hay client giữ? Có offline không?" |
| 2. Ranh giới dữ liệu | Ai sở hữu, ai chỉ đọc, ai được ghi | "Dữ liệu này server là nguồn chân lý, client giữ bản cache." |
| 3. Luồng chính | Một kịch bản đi từ đầu đến cuối | "Người chơi bấm X, event đi qua A, B, C, UI cập nhật ở D." |
| 4. Điểm hỏng & mở rộng | Mạng rớt, app bị kill, dữ liệu cũ, gấp 10 lần tải | "Nếu app bị kill giữa bước 2 và 3 thì…" |
| 5. Đánh đổi | Nói thẳng cái giá của lựa chọn | "Tôi chọn event bus vì tách rời, giá là khó truy vết; bù bằng log." |

**Câu hỏi ràng buộc mẫu** (chọn vài câu hợp đề, đừng hỏi hết): quy mô dữ liệu bao nhiêu (50 hay 5.000 bản ghi)? Server authoritative hay client tự quyết? Cần chạy offline không? Máy yếu nhất cần hỗ trợ là gì? Nội dung đổi bằng master data hay bằng bản build? Hệ thống này sẽ có thêm loại nào trong sáu tháng tới? Có cần replay/log để CS đối soát không?

**Lỗi hay gặp**
- **Nhảy vào class ngay**: vẽ `InventoryManager` trước khi biết item có stack không. Người hỏi thấy bạn thiết kế theo thói quen, không theo đề.
- Quên nói **ai sở hữu dữ liệu** nên mọi thứ thành "client tự giữ", mở cửa cho gian lận và lệch trạng thái.
- Chỉ kể đường vui (happy path); không nhắc mạng rớt, app bị kill, dữ liệu version cũ.
- Liệt kê pattern (Observer, Command, Factory…) mà không nói pattern đó giải quyết vấn đề gì ở đây.
- Không chốt đánh đổi: câu nào cũng "tuỳ" rồi không chọn.

Khuôn nói gọn cho mỗi bài: **yêu cầu → hỏi lại → dữ liệu → class chính → luồng → điểm hỏng → đánh đổi**. Mười hai bài dưới đây theo đúng khuôn ấy, mỗi bài ngắn để bạn thuộc cấu trúc, rồi tự nói rộng ra.

## B. Mười hai bài thiết kế

### B1. Inventory có stack, sort, filter

- **Yêu cầu**: hiển thị hàng nghìn vật phẩm, gộp stack, sắp xếp và lọc theo loại, cập nhật khi nhặt/dùng. Màn hình tham chiếu: [[screen-inventory]].
- **Hỏi lại**: item có thuộc tính riêng (trang bị có cấp cường hoá, khác với nguyên liệu)? Server hay client giữ số lượng? Giới hạn ô túi?
- **Dữ liệu**: tách `ItemDef` (master data, bất biến: id, loại, `maxStack`, độ hiếm — xem [[master-data]]) khỏi `ItemInstance` (của người chơi: `instanceId`, `defId`, `count`, tuỳ chọn `enhanceLevel`). Hàng tiêu hao chỉ cần `defId + count`; trang bị mới cần instance riêng.
- **Class chính**: `ItemDatabase` (tra `ItemDef`), `InventoryModel` (giữ `Dictionary<long, ItemInstance>` và phát `OnChanged(delta)`), `InventoryQuery` (filter + sort, trả danh sách chỉ số), `InventoryView` (scroll list ảo hoá, nhận danh sách đã lọc).
- **Luồng**: server trả thay đổi (delta) → `InventoryModel` áp vào → bắn `OnChanged` kèm danh sách id đổi → `InventoryView` chỉ làm mới ô liên quan. Sort/filter chạy trên model bằng comparator ghép được (`ByRarity.ThenBy(ById)`), không sắp xếp trong view.
- **Điểm hỏng**: delta đến sai thứ tự; số lượng âm do hai lệnh dùng item gần nhau (chặn bằng server trả số tuyệt đối thay vì chỉ delta); danh sách 2.000 ô tạo 2.000 GameObject (dùng scroll ảo hoá, chỉ dựng ô nhìn thấy); sort mỗi frame.
- **Đánh đổi**: lưu delta thì nhẹ nhưng lệch dần; lưu snapshot đầy đủ thì chắc nhưng tốn băng thông. Thường: snapshot lúc vào game, delta sau đó, kèm số tuần tự để phát hiện lệch rồi tải lại snapshot.

### B2. Hệ quest/mission theo sự kiện

- **Yêu cầu**: nhiệm vụ "hạ 10 quái", "đăng nhập 3 ngày", nhiều loại điều kiện, nhiều quest chạy song song. Màn hình: [[screen-mission]].
- **Hỏi lại**: tiến độ do server tính hay client đếm? Quest hằng ngày reset theo giờ nào? Có quest chuỗi/phụ thuộc không?
- **Dữ liệu**: `QuestDef` (master: `id`, `conditionType`, `target`, `reward`, `resetType`), `QuestProgress` (của người chơi: `questId`, `current`, `state`).
- **Class chính**: `QuestService` (lưu progress, tra def), `IQuestCondition` (mỗi loại điều kiện một lớp: `KillEnemyCondition`, `LoginDaysCondition`), `GameEventBus`, `QuestTracker` (lắng nghe sự kiện game, gọi condition).
- **Luồng**: gameplay bắn `EnemyKilled{enemyId}` lên bus → `QuestTracker` hỏi các quest đang mở có quan tâm loại sự kiện này không (đăng ký theo `conditionType`, không quét hết) → condition tăng `current` → đạt `target` thì đổi state `Claimable` → UI hiện chấm đỏ (xem B8). Nhận thưởng gửi lên server kèm id yêu cầu (idempotent).
- **Điểm hỏng**: bỏ lỡ sự kiện khi đang loading; reset lệch múi giờ (dùng giờ server); thêm loại điều kiện mới phải sửa code lõi.
- **Đánh đổi**: server đếm thì chống gian lận nhưng mỗi hành động tốn một gói tin (gộp theo lô); client đếm thì mượt nhưng phải để server xác nhận khi nhận thưởng.

### B3. Hệ buff/debuff có stack và thời hạn

- **Yêu cầu**: buff tăng công, độc gây sát thương theo giây, có chồng lớp, hết hạn, làm mới thời gian, hiển thị icon.
- **Hỏi lại**: chồng lớp theo kiểu cộng dồn, thay thế hay lấy giá trị lớn nhất? Hết hạn theo giây thật hay theo lượt (turn-based)? Có miễn nhiễm/xoá buff (dispel)?
- **Dữ liệu**: `BuffDef` (master: `id`, `duration`, `maxStacks`, `stackRule`, `tickInterval`, danh sách `StatModifier`); `BuffInstance` (`def`, `remaining`, `stacks`, `sourceId`).
- **Class chính**: `BuffController` (trên mỗi đơn vị), `BuffInstance`, `StatModifier` (loại `Flat`/`PercentAdd`/`PercentMul` + nguồn), `StatCalculator`.
- **Luồng**: áp buff → tra `stackRule` → tạo mới hay cộng lớp/làm mới → phát `OnBuffChanged`. Mỗi tick giảm `remaining`; hết thì gỡ và tính lại chỉ số. **Chỉ số cuối = tính lại từ gốc + danh sách modifier**, không bao giờ "cộng rồi trừ ngược" vì sẽ trôi số khi buff chồng.
- **Điểm hỏng**: cộng/trừ ngược gây sai số; thứ tự Flat/Percent ra kết quả khác nhau (phải quy ước cố định); đơn vị chết còn buff tick; nhiều buff cùng chết một đơn vị tạo vòng lặp sự kiện.
- **Đánh đổi**: tính lại toàn bộ chỉ số mỗi lần đổi buff tốn hơn nhưng chắc chắn đúng; cache kết quả và đánh dấu dirty để tính lười.

### B4. Save/load có version và migration

- **Yêu cầu**: lưu tiến trình cục bộ (và/hoặc cloud), bản build mới đọc được save cũ, không hỏng khi app bị kill giữa lúc ghi. Xem [[unity-save-data]].
- **Hỏi lại**: server giữ dữ liệu chính hay save cục bộ mới là chính? Có cần đồng bộ nhiều thiết bị? Mức nhạy cảm (chống sửa file)?
- **Dữ liệu**: một `SaveData` có trường `schemaVersion` ở **gốc**; các khối con tách theo hệ (`ProfileBlock`, `SettingsBlock`).
- **Class chính**: `SaveService` (đọc/ghi), `ISaveSerializer`, `SaveMigrator` (chuỗi `Migrate_1_to_2`, `Migrate_2_to_3`), `SaveBackup`.
- **Luồng**: đọc file → đọc `schemaVersion` → chạy từng bước migration đến phiên bản hiện tại → deserialize → dùng. Ghi: serialize vào `save.tmp` → flush → đổi tên đè `save.json` (ghi nguyên tử), giữ bản `.bak`.
- **Điểm hỏng**: kill giữa lúc ghi (nên ghi tmp rồi đổi tên); save từ phiên bản **mới hơn** app (người chơi hạ bản — từ chối và báo, đừng ghi đè); migration bỏ bước; đổi tên trường mà không migrate; JSON bị cắt cụt (thử `.bak`).
- **Đánh đổi**: migration theo chuỗi từng bước dễ kiểm thử nhưng dài dần; mỗi bước nhỏ, có test dữ liệu mẫu từng phiên bản. Dữ liệu quan trọng (ví, vật phẩm) thuộc server, save cục bộ chỉ giữ cài đặt và cache.

### B5. UI framework: stack màn hình, popup, nút Back Android, preload

- **Yêu cầu**: mở/đóng màn hình, popup chồng lên nhau, nút Back của Android đóng đúng thứ cần đóng, chuyển cảnh không giật. Nền tảng: [[unity-ui]].
- **Hỏi lại**: một Canvas hay nhiều? Màn hình có trạng thái giữ lại khi quay về? Popup có chặn nhau theo hàng đợi?
- **Dữ liệu**: `ScreenId` (enum hoặc chuỗi), cấu hình `ScreenDef` (đường dẫn prefab, `layer`, `cachePolicy`, danh sách asset cần preload).
- **Class chính**: `UIManager`, `UIScreen` (vòng đời `OnOpen/OnShow/OnHide/OnClose`), `UIPopup`, `ScreenStack`, `UILayer` (Screen/Popup/Overlay/Toast), `BackButtonRouter`.
- **Luồng**: `UIManager.Open(id, args)` → nạp prefab (đã preload hoặc tải) → ẩn màn hình dưới (không huỷ, nếu cache) → đẩy vào stack → hiển thị với transition. Back: `BackButtonRouter` hỏi phần tử trên cùng của popup trước, rồi screen; mỗi cái có thể trả "đã xử lý" hoặc "để tôi đóng".
- **Điểm hỏng**: bấm hai lần mở hai màn; mở màn trong lúc đang chuyển cảnh (hàng đợi hoặc khoá input); popup đứng khi màn dưới bị huỷ; Back đóng nhầm khi đang loading (khoá khi có overlay chặn); rò bộ nhớ vì không Release asset khi đóng.
- **Đánh đổi**: cache màn hình mở lại nhanh nhưng giữ bộ nhớ; huỷ khi đóng tiết kiệm RAM nhưng mở lại chậm. Thường cache màn hay quay lại (sảnh, inventory), huỷ màn hiếm dùng.

### B6. Hệ tutorial/onboarding theo bước

- **Yêu cầu**: dẫn người chơi qua chuỗi bước (bấm nút A, mở màn B, đọc hội thoại), lưu tiến độ, không kẹt nếu bỏ giữa chừng. Xem [[onboarding]].
- **Hỏi lại**: tutorial bắt buộc hay bỏ qua được? Bước có điều kiện phức tạp? Người dùng cũ chuyển máy có phải học lại?
- **Dữ liệu**: `TutorialDef` là danh sách `TutorialStep` kiểu data (id, `trigger`, `highlightTarget`, `completeCondition`), nằm trong master data; tiến độ `completedStepId` lưu **server**.
- **Class chính**: `TutorialRunner`, `ITutorialStep` (`ShowDialogStep`, `HighlightButtonStep`, `WaitEventStep`), `UITargetRegistry` (tra phần tử UI theo id chuỗi), `TutorialMask` (lớp chặn input, chỉ chừa lỗ quanh mục tiêu).
- **Luồng**: sự kiện kích hoạt → `TutorialRunner` nạp bước kế → hiện mask + chỉ dẫn → chờ điều kiện hoàn thành (nghe bus) → ghi tiến độ → bước tiếp. Mục tiêu UI đăng ký tên (`TutorialTarget("btn_summon")`) thay vì tìm theo đường dẫn.
- **Điểm hỏng**: bước chờ phần tử chưa tồn tại (retry có timeout); người chơi làm sai thứ tự; tắt app giữa bước (lưu theo bước đã **hoàn tất**, mở lại lặp bước dang dở); bug làm tutorial không thể bỏ qua (luôn có thoát hiểm, ví dụ nút "Bỏ qua" sau N giây hoặc kill switch từ config).
- **Đánh đổi**: data-driven thêm bước không cần build mới nhưng phải có bộ kiểu bước đủ rộng; script cứng linh hoạt hơn nhưng mỗi lần sửa phải phát hành.

### B7. Skill & combat turn-based (RPG gacha): lệnh, hàng đợi, replay deterministic

- **Yêu cầu**: trận theo lượt, nhiều đơn vị, skill có hiệu ứng phức tạp, chạy nhanh/skip, replay lại được, server kiểm tra được kết quả. Xem [[combat-systems]].
- **Hỏi lại**: kết quả trận do server hay client tính? Có auto-battle, tăng tốc? Cần replay cho CS không?
- **Dữ liệu**: `SkillDef` (master), `UnitState` (HP, chỉ số, buff), hạt giống ngẫu nhiên `seed`, danh sách `BattleCommand` đầu vào.
- **Class chính**: `BattleSimulation` (**thuần logic, không biết Unity**), `TurnQueue` (hàng đợi theo tốc độ), `ICommand` (`UseSkillCommand`, `SwapUnitCommand`), `SkillEffect` (data + `IEffectExecutor`), `BattleEvent` (kết quả: `DamageDealt`, `UnitDied`), `BattlePresenter` (đọc luồng `BattleEvent` rồi diễn hoạt).
- **Luồng**: lấy đơn vị tới lượt → nhận lệnh (người chơi hoặc AI) → `BattleSimulation.Execute(cmd)` sinh ra danh sách `BattleEvent` → `BattlePresenter` phát hoạt ảnh từng sự kiện. Mô phỏng chạy xong **trước** hoạt ảnh nên skip chỉ là bỏ phần trình chiếu.
- **Deterministic**: cùng `seed` + cùng chuỗi lệnh ra cùng kết quả. Dùng bộ sinh số ngẫu nhiên riêng có seed (không `UnityEngine.Random` dùng chung), không dùng float không kiểm soát được giữa máy (dùng số nguyên/fixed-point cho chỉ số quan trọng), duyệt đơn vị theo thứ tự cố định (không theo thứ tự hash của `Dictionary`).
- **Điểm hỏng**: hoạt ảnh quyết kết quả (hỏng skip); logic lẫn với `MonoBehaviour` (không test, không replay); `Dictionary` duyệt thứ tự khác nhau giữa lần chạy; hiệu ứng kích hoạt hiệu ứng vô hạn (giới hạn độ sâu).
- **Đánh đổi**: tách mô phỏng khỏi view tốn thêm lớp trung gian nhưng đổi lại test được, replay được, server chạy lại kiểm được. Đây là đánh đổi nên chọn gần như mặc định cho game gacha.

### B8. Hệ thông báo chấm đỏ (red dot tree)

- **Yêu cầu**: chấm đỏ ở nút ngoài sảnh hiện khi có thứ cần xử lý bên trong (quest nhận được, thư mới, hero đủ nguyên liệu lên cấp), lan lên theo cây.
- **Hỏi lại**: chấm đỏ có số hay chỉ chấm? Có loại tồn tại tới khi người dùng xem (kiểu "NEW")? Dữ liệu nguồn nằm ở đâu?
- **Dữ liệu**: cây khoá chuỗi `main/quest/daily`, `main/mail`; mỗi nút lá có `count`; nút cha = tổng (hoặc OR) các con.
- **Class chính**: `RedDotService` (giữ cây, `SetCount(path, n)`, `GetCount(path)`), `RedDotNode`, `RedDotView` (gắn lên icon, đăng ký theo path), `IRedDotProvider` (mỗi hệ như quest/mail tự tính count của nó và báo lên).
- **Luồng**: hệ nguồn đổi (nhận mail) → provider gọi `SetCount("main/mail", 3)` → service cập nhật nút lá, **chỉ đi ngược lên cha khi giá trị đổi**, phát `OnChanged(path)` → `RedDotView` đăng ký đúng path tự cập nhật.
- **Điểm hỏng**: logic chấm đỏ rải trong từng màn hình (lệch nhau); tính lại cả cây mỗi frame; view đăng ký rồi không huỷ khi bị destroy (rò); dữ liệu sai vì tính ở client trong khi server mới là nguồn.
- **Đánh đổi**: provider đẩy (push) nhanh nhưng phải nhớ đẩy ở mọi chỗ đổi; service kéo (pull) định kỳ đơn giản nhưng chậm và tốn. Thường push theo sự kiện, có thêm kéo lại một lần khi mở sảnh để tự sửa lệch.

### B9. Hệ tải asset có ưu tiên và huỷ

- **Yêu cầu**: tải bundle/asset qua mạng, tải trước nội dung sắp dùng, ưu tiên cái đang cần ngay, huỷ khi người chơi đổi màn. Nền tảng: [[unity-addressables]].
- **Hỏi lại**: tổng dung lượng và băng thông? Tải ở nền khi đang chơi hay chặn màn hình? Có tiếp tục tải sau khi tắt app?
- **Dữ liệu**: `AssetRequest` (key, `priority`, `CancellationToken`, nơi gọi).
- **Class chính**: `AssetLoader` (cổng duy nhất), `LoadQueue` (hàng đợi ưu tiên, giới hạn số tải song song), `HandleTracker` (đếm tham chiếu, `Release` đúng đối ứng), `DownloadPreloader` (tải trước theo nhóm).
- **Luồng**: yêu cầu vào hàng đợi theo `priority` (Blocking > Visible > Prefetch) → tải tối đa N cái song song → hoàn tất trả về callback/await → ghi nhận handle. Đổi màn: huỷ mọi yêu cầu thuộc màn cũ; yêu cầu đã chạy dở thì bỏ kết quả và Release.
- **Điểm hỏng**: yêu cầu trùng key (gộp, không tải hai lần); huỷ nhưng vẫn giữ handle (rò); tải trước chiếm băng thông của tải cần ngay (hạ ưu tiên và tạm dừng); mất mạng giữa chừng (retry có backoff, tiếp tục từ chỗ dở); đĩa đầy.
- **Đánh đổi**: tải trước nhiều thì mượt nhưng tốn dung lượng và dữ liệu di động; nên hỏi người chơi trước khi tải lớn qua 4G.

### B10. Hệ localization

- **Yêu cầu**: nhiều ngôn ngữ (Nhật, Anh, Việt), đổi ngôn ngữ lúc chạy, chuỗi có tham số, số nhiều, font cho CJK.
- **Hỏi lại**: bản dịch nằm trong build hay tải từ CDN? Có chữ trong ảnh? Văn bản dài khác nhau phá bố cục?
- **Dữ liệu**: bảng `key → {ngôn ngữ → chuỗi}`, khoá ổn định kiểu `ui.shop.buy_button`; tham số kiểu `{0}` hoặc tên (`{itemName}`).
- **Class chính**: `LocalizationService` (`Get(key, args)`, `SetLanguage`, sự kiện `OnLanguageChanged`), `StringTable`, `LocalizedText` (component gắn vào `TMP_Text`, lưu key), `FontProvider` (font fallback theo ngôn ngữ).
- **Luồng**: đổi ngôn ngữ → nạp bảng mới → bắn `OnLanguageChanged` → mọi `LocalizedText` đang sống tự gọi lại `Get`. Chuỗi động gọi `Get` với tham số, **không ghép chuỗi bằng cộng** (thứ tự từ khác nhau giữa các ngôn ngữ).
- **Điểm hỏng**: thiếu khoá (rơi về ngôn ngữ mặc định và log, đừng hiện khoá trần); font thiếu glyph (ô vuông); dịch dài làm tràn nút (thiết kế co dãn, kiểm với ngôn ngữ dài nhất); số nhiều sai; tách một câu thành nhiều khoá nối lại.
- **Đánh đổi**: nạp mọi ngôn ngữ nhanh khi đổi nhưng tốn RAM; chỉ nạp ngôn ngữ đang dùng thì tiết kiệm nhưng đổi cần tải. Với game có tên nhân vật, kỹ năng do master data cấp, bản dịch cũng nên là một phần master data.

### B11. Hệ input remap

- **Yêu cầu**: người chơi đổi phím/nút, hỗ trợ bàn phím, tay cầm, cảm ứng, lưu cấu hình. Nền tảng: [[unity-input]].
- **Hỏi lại**: nền tảng nào (di động có cần remap không)? Một người hay local multiplayer? Xung đột phím xử lý ra sao?
- **Dữ liệu**: `InputAction` trừu tượng (`Jump`, `Skill1`) ánh xạ tới `Binding` (phím/nút) theo từng thiết bị; override của người chơi lưu riêng khỏi mặc định.
- **Class chính**: `InputService`, `ActionMap`, `BindingProfile` (mặc định + override), `RebindOperation` (chờ phím kế, kiểm xung đột), `InputPrompt` (hiện biểu tượng nút đúng theo thiết bị đang dùng).
- **Luồng**: gameplay chỉ hỏi `InputService.WasPressed(Action.Jump)`, không bao giờ hỏi phím cụ thể. Rebind: bắt đầu chờ → nhận phím → kiểm xung đột (hoán đổi hoặc báo) → ghi override → lưu.
- **Điểm hỏng**: gameplay hardcode `KeyCode.Space`; xung đột hai hành động một phím; rebind trong lúc đang giữ phím; biểu tượng sai khi người chơi chuyển từ bàn phím sang tay cầm; override cũ không hợp lệ sau khi thêm hành động mới (có giá trị mặc định cho khoá lạ).
- **Đánh đổi**: dùng gói Input System có sẵn rebind và serialize overrides, tiết kiệm thời gian nhưng phụ thuộc vào API của nó; tự viết lớp mỏng quanh nó để game không dính trực tiếp.

### B12. Event bus toàn cục và cách tránh spaghetti

- **Yêu cầu**: các hệ tách rời nhau (quest, thành tựu, âm thanh, thống kê) cùng nghe một sự kiện gameplay mà không biết nhau. Xem [[csharp-delegate-event]], [[unity-design-patterns]].
- **Hỏi lại**: có cần bất đồng bộ hay luôn đồng bộ? Số sự kiện/giây? Có cần thứ tự giữa người nghe?
- **Dữ liệu**: mỗi sự kiện là một `struct` nhỏ (`EnemyKilled`, `CurrencyChanged`), bất biến.
- **Class chính**: `EventBus` (`Publish<T>(T evt)`, `Subscribe<T>(Action<T>)` trả `IDisposable`), `Subscription`, `EventLog` (chỉ bản debug).
- **Luồng**: nguồn gọi `Publish` → bus duyệt danh sách người nghe của kiểu `T` → gọi từng cái. `Subscribe` trả handle; người nghe huỷ ở `OnDestroy` bằng `Dispose`.
- **Chống spaghetti**: (1) sự kiện là **thông báo điều đã xảy ra** (`EnemyKilled`), không phải lệnh (`GiveReward`); (2) mỗi sự kiện có chủ rõ ràng, nằm trong một chỗ; (3) không dùng bus để trả giá trị hay chờ phản hồi — cần hỏi thì gọi interface; (4) không chuỗi `A phát → B phát → C phát` sâu quá hai tầng; (5) log mọi sự kiện ở bản debug để truy vết ai nghe ai; (6) giới hạn phạm vi bus theo hệ (bus trận, bus UI) thay vì một bus khổng lồ cho cả game.
- **Điểm hỏng**: quên huỷ đăng ký (rò, gọi vào object đã destroy); sửa danh sách người nghe lúc đang duyệt (duyệt bản sao hoặc hoãn); sự kiện phát lúc khởi tạo trước khi người nghe sẵn sàng; allocation mỗi lần `Publish` nếu dùng delegate đa hình/boxing.
- **Đánh đổi**: tách rời nhưng luồng điều khiển ẩn, khó đọc code để biết "cái gì chạy khi X". Bù bằng quy ước đặt tên, log và giới hạn phạm vi; chỗ cần luồng rõ thì gọi trực tiếp.

### B13. Hệ replay / ghi lại trận

- **Yêu cầu**: xem lại trận, chia sẻ, CS đối soát, hoặc debug lỗi người chơi báo.
- **Hỏi lại**: ghi **đầu vào** (input/lệnh) hay ghi **kết quả** (trạng thái từng frame)? Dung lượng cho phép? Có phát lại đúng nhịp thời gian thật?
- **Dữ liệu**: replay kiểu đầu vào = `seed + phiên bản luật + chuỗi lệnh có dấu thời gian/lượt`. Replay kiểu kết quả = chuỗi `BattleEvent` hoặc snapshot.
- **Class chính**: `ReplayRecorder` (thu lệnh và seed), `ReplayFile` (có `contentVersion` của master data và luật), `ReplayPlayer` (chạy lại mô phỏng với lệnh đã ghi), `ReplayController` (tua, tạm dừng, đổi tốc độ).
- **Luồng**: lúc chơi, `ReplayRecorder` ghi mọi lệnh qua cùng cổng `Execute` mà mô phỏng dùng. Phát lại: khởi tạo cùng `seed` và cùng master data → cấp lại từng lệnh → mô phỏng ra cùng kết quả. Tua tới lượt N = chạy nhanh đến N rồi dừng.
- **Điểm hỏng**: replay cũ không chạy được sau khi cân bằng đổi (lưu `contentVersion`, giữ master data cũ hoặc ghi kết quả thay vì chỉ lệnh); mô phỏng không deterministic (lệch dần); replay dài tốn dung lượng (chỉ ghi lệnh thì chỉ vài KB); thông tin nhạy cảm trong file.
- **Đánh đổi**: ghi đầu vào nhỏ gọn nhưng phụ thuộc deterministic và phiên bản luật; ghi kết quả nặng hơn nhưng phát lại được kể cả khi logic đã đổi. Nhiều game ghi cả hai: kết quả để xem, lệnh+seed để server kiểm.

## C. Nguyên tắc chung xuyên các bài

| Nguyên tắc | Ý chính | Vì sao |
|---|---|---|
| **Data-driven** | Hành vi mô tả bằng dữ liệu (`Def` trong master data), code chỉ là bộ thực thi — xem [[data-driven-design]] | Đổi nội dung không cần build; designer tự thêm; live-service sống nhờ nó |
| **Tách logic khỏi view** | Model/Service thuần C#, View là `MonoBehaviour` mỏng nghe model | Test được không cần Unity; replay và server dùng lại cùng logic |
| **Deterministic** | Cùng đầu vào, cùng đầu ra: seed riêng, thứ tự duyệt cố định, tránh float không kiểm soát | Replay, đối soát, debug tái hiện được |
| **Pool** | Tái dùng đối tượng đắt tạo (đạn, hiệu ứng, ô danh sách) thay vì `Instantiate/Destroy` | Tránh GC spike và giật frame trên máy yếu |
| **DI vs Singleton** | Singleton nhanh nhưng giấu phụ thuộc, khó test, thứ tự khởi tạo mơ hồ; DI (constructor hoặc container) lộ rõ phụ thuộc | Chọn theo quy mô: dự án nhỏ singleton có kiểm soát, dự án lớn nhiều người thì DI — xem [[architecture-patterns]], [[project-architecture]] |
| **Một chủ cho mỗi dữ liệu** | Mỗi mảnh dữ liệu có đúng một nơi ghi | Hết lệch trạng thái giữa các hệ |
| **Thiết kế cho hỏng** | Mạng rớt, app bị kill, dữ liệu cũ là đường đi bình thường | Người chơi di động gặp chúng hằng ngày |

Mẫu pattern thực tế trong Unity nằm ở [[unity-patterns-in-practice]]; máy trạng thái ([[fsm]]) và [[behavior-tree]] hay xuất hiện ở B6, B7.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho luyện thiết kế hệ thống client**

AI làm tốt vai **người phỏng vấn khó tính**: hỏi lại đề, chọc vào điểm hỏng, bắt bạn nêu đánh đổi. Nó làm kém vai **người thiết kế thay bạn**: sơ đồ nó vẽ thường đẹp mà thiếu ràng buộc thật, và bạn không học được gì. Quy trình: (1) tự trả lời bằng miệng theo năm bước trước; (2) đưa bản trả lời cho AI chấm theo đúng khuôn; (3) bắt nó hỏi tiếp ba câu đào sâu; (4) trả lời lại.

| Chế độ | Khi nào | Câu mở đầu |
|---|---|---|
| Phỏng vấn giả lập | Luyện nói | "Hãy hỏi tôi một bài thiết kế hệ thống client, đừng gợi ý, chỉ trả lời khi tôi hỏi ràng buộc." |
| Chấm bài | Sau khi tự nói | "Chấm theo năm bước, chỉ ra bước nào thiếu." |
| Tạo đề mới | Hết đề | "Ra đề mới tương tự B3 nhưng đổi ràng buộc." |

**Phải nêu rõ** (thiếu là AI tự bịa):
- Thể loại và nền tảng (RPG gacha live-service, di động Android/iOS) để nó không đưa lời giải của game PC.
- Ai giữ dữ liệu: server authoritative hay client tự quyết.
- Mức người hỏi: Mid hay Senior, thời lượng (15 hay 45 phút).
- Công nghệ ràng buộc (Unity, Addressables, gRPC) để nó không đề xuất thứ bạn không dùng.
- Bạn muốn nó chấm theo tiêu chí nào (đủ năm bước, có đánh đổi, có điểm hỏng).

**Mẫu prompt**

```
Đóng vai người phỏng vấn senior Unity ở studio game RPG live-service di động.
Ra cho tôi MỘT bài "thiết kế hệ thống phía client": hệ thống buff có stack và thời hạn.
Quy tắc:
- KHÔNG đưa lời giải, KHÔNG gợi ý class. Chỉ trả lời khi tôi hỏi ràng buộc.
- Sau khi tôi trình bày, chấm theo 5 bước: ràng buộc, ranh giới dữ liệu, luồng chính,
  điểm hỏng, đánh đổi. Mỗi bước cho điểm 0-2 và nói thiếu gì.
- Đặt đúng 3 câu đào sâu, ít nhất 1 câu về mạng rớt hoặc app bị kill giữa chừng.
- CẤM khen chung chung; CẤM thêm yêu cầu mà tôi chưa hỏi.
Tôi: server giữ dữ liệu người chơi, client Unity 6 dùng Addressables.
```

**Bẫy thường gặp:** AI hay (1) vẽ kiến trúc nhiều tầng quá mức (repository, mediator, saga) cho bài vài trăm dòng và bỏ qua đánh đổi; (2) quên ai sở hữu dữ liệu nên để client tự cộng tiền; (3) nói "dùng event bus" như phép màu mà không nhắc rò đăng ký và truy vết khó; (4) bịa số liệu hiệu năng không nguồn; (5) đưa lời giải hoàn hảo cho đề mơ hồ thay vì hỏi lại ràng buộc.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Mid` **Anh thiết kế hệ thống inventory cho RPG: tách dữ liệu thế nào?**
  → Tách `ItemDef` là master data bất biến (loại, `maxStack`, độ hiếm) khỏi `ItemInstance` là dữ liệu người chơi (`instanceId`, `defId`, `count`, cấp cường hoá). Hàng tiêu hao chỉ cần `defId + count`, trang bị cần instance riêng. Vì master data cache được và đổi bằng dữ liệu, còn instance thuộc server nên tách ra mới đồng bộ gọn.
- `Mid` **Inventory 2.000 vật phẩm, hiển thị thế nào cho không giật?**
  → Dùng scroll ảo hoá: chỉ dựng đủ ô nhìn thấy cộng vài ô đệm rồi tái dùng khi cuộn, nên số GameObject cố định cỡ vài chục thay vì 2.000. Sort và filter chạy trên model trả danh sách chỉ số, view chỉ vẽ. Vì tạo và layout hàng nghìn UI element là thứ giết frame trên máy yếu.
- `Mid` **Server gửi thay đổi inventory dạng delta thì lệch phải làm sao?**
  → Gửi kèm số tuần tự; client thấy nhảy số hoặc sai thứ tự thì bỏ delta và tải lại snapshot. Tốt hơn nữa là server trả số lượng tuyệt đối của item đổi, không chỉ chênh lệch. Vì delta nhẹ nhưng lỗi tích luỹ, còn snapshot chắc nhưng tốn, nên dùng cả hai.
- `Mid` **Hệ quest theo sự kiện, làm sao thêm loại điều kiện mới không sửa code lõi?**
  → Mỗi loại điều kiện là một lớp thực thi `IQuestCondition` đăng ký theo `conditionType`; `QuestTracker` chỉ phân phối sự kiện từ bus tới quest quan tâm. Thêm loại mới là thêm một lớp và một dòng đăng ký, định nghĩa quest nằm trong master data. Vì nguyên tắc open/closed: mở rộng bằng thêm, không sửa chỗ đã chạy.
- `Senior` **Tiến độ quest do server hay client đếm?**
  → Với thứ có giá trị (thưởng thật), server là nguồn chân lý; client đếm chỉ để hiển thị mượt, gộp báo lên theo lô, và khi nhận thưởng server xác nhận lại. Vì client đếm hoàn toàn thì sửa bộ nhớ là nhận thưởng giả. Cái giá là thêm gói tin và độ trễ, bù bằng gộp lô.
- `Mid` **Quest hằng ngày reset lúc nào, client xử lý ra sao?**
  → Reset theo giờ server (ví dụ 5 giờ sáng giờ Nhật), client chỉ lấy offset để hiển thị đếm ngược và hỏi lại trạng thái khi qua mốc. Không bao giờ dùng đồng hồ máy để quyết định. Vì người chơi đổi giờ máy được và múi giờ mỗi nơi khác nhau.
- `Mid` **Hệ buff có stack: chỉ số cuối tính thế nào?**
  → Luôn tính lại từ chỉ số gốc cộng danh sách modifier theo thứ tự cố định (Flat, rồi PercentAdd, rồi PercentMul), không cộng rồi trừ ngược khi buff hết. Cache kết quả và đánh dấu dirty khi buff đổi. Vì cộng trừ ngược trôi số khi nhiều buff chồng, còn tính lại thì luôn đúng.
- `Senior` **Buff chồng lớp có mấy kiểu, chọn kiểu nào?**
  → Cộng dồn lớp tới `maxStacks`, thay thế (lấy cái mới), làm mới thời gian, hoặc lấy giá trị lớn nhất; kiểu nào là một trường `stackRule` trong `BuffDef`, không viết cứng trong code. Chọn theo thiết kế skill, và quan trọng là data-driven để designer đổi không cần build. Đánh đổi là bộ luật phải đủ rộng để khỏi đẻ ngoại lệ.
- `Mid` **Save/load: làm sao bản build mới đọc được save cũ?**
  → Ghi `schemaVersion` ở gốc dữ liệu, đọc xong chạy chuỗi migration từng bước (`1→2`, `2→3`…) đến phiên bản hiện tại rồi mới deserialize. Mỗi bước nhỏ và có test với dữ liệu mẫu phiên bản đó. Vì nhảy thẳng từ bản rất cũ sang mới thì không ai kiểm hết các tổ hợp.
- `Senior` **App bị kill giữa lúc ghi save. Chống hỏng file thế nào?**
  → Ghi ra file tạm, flush, rồi đổi tên đè file chính (thao tác nguyên tử), và giữ một bản `.bak`; lúc đọc nếu file chính cụt thì thử `.bak`. Vì ghi thẳng đè file chính mà bị kill giữa chừng thì mất cả hai. Dữ liệu quan trọng như ví thuộc server, save cục bộ chỉ giữ cài đặt và cache.
- `Senior` **Save từ phiên bản mới hơn app (người chơi hạ bản) xử lý sao?**
  → Từ chối đọc, báo người chơi cập nhật, và tuyệt đối không ghi đè. Ghi đè bằng schema cũ sẽ làm rơi các trường mới và mất dữ liệu vĩnh viễn. Đánh đổi là người chơi bị chặn tạm thời, nhưng mất save tệ hơn nhiều.
- `Mid` **UI manager quản lý màn hình bằng stack, nút Back Android xử lý ra sao?**
  → Có `BackButtonRouter` hỏi từ trên xuống: popup trên cùng trước, rồi screen; mỗi cái trả "đã xử lý" hoặc để manager đóng nó. Khi có overlay loading chặn thì Back bị nuốt. Vì nếu Back đóng nhầm tầng hoặc đóng giữa lúc đang thanh toán thì lỗi rất khó thấy.
- `Mid` **Hai popup bật cùng lúc thì làm sao?**
  → Popup đi qua hàng đợi theo ưu tiên trong `UILayer`: cái quan trọng (lỗi mạng) chen lên, cái thông thường (quảng cáo sự kiện) xếp hàng hiện lần lượt. Vì chồng nhiều popup làm người chơi bối rối và Back không biết đóng cái nào trước.
- `Senior` **Cache màn hình hay huỷ khi đóng?**
  → Cache màn hay quay lại (sảnh, inventory) để mở lại tức thì, huỷ màn hiếm dùng để trả RAM, và luôn `Release` asset đúng đối ứng khi huỷ. Đánh đổi là bộ nhớ lấy tốc độ mở lại; trên máy yếu đặt trần số màn được cache.
- `Mid` **Tutorial theo bước làm data-driven thế nào?**
  → `TutorialDef` là danh sách bước trong master data (`trigger`, mục tiêu làm nổi, điều kiện hoàn thành), `TutorialRunner` chạy từng `ITutorialStep`, mục tiêu UI đăng ký bằng tên chuỗi nên không phụ thuộc đường dẫn Hierarchy. Vì thêm hoặc sửa bước không cần build, còn đường dẫn cứng hỏng mỗi khi designer đổi prefab.
- `Senior` **Người chơi tắt app giữa tutorial, mở lại thì sao? Kẹt thì sao?**
  → Tiến độ lưu theo bước đã hoàn tất lên server, mở lại lặp bước đang dở; bước chờ phần tử UI có timeout và luôn có lối thoát (nút bỏ qua hoặc kill switch từ config). Vì tutorial lỗi là loại bug chặn người mới ngay phút đầu, và retention ngày 1 mất theo.
- `Senior` **Thiết kế combat turn-based cho replay deterministic.**
  → Tách `BattleSimulation` thuần logic khỏi view: nhận `ICommand` rồi sinh danh sách `BattleEvent`; `BattlePresenter` chỉ diễn hoạt các sự kiện đó. Cùng `seed` cộng cùng chuỗi lệnh phải ra cùng kết quả. Vì thế skip animation chỉ là bỏ trình chiếu, server chạy lại kiểm được, và replay gần như miễn phí.
- `Senior` **Điều gì làm mô phỏng trận mất tính deterministic?**
  → Dùng `UnityEngine.Random` dùng chung, duyệt `Dictionary` theo thứ tự hash không cố định, float khác nhau giữa CPU, và logic phụ thuộc `Time.deltaTime`. Sửa bằng bộ sinh số có seed riêng, danh sách có thứ tự, số nguyên hoặc fixed-point cho chỉ số quan trọng, và mô phỏng theo lượt thay vì theo thời gian thực. Vì chỉ cần lệch một số lẻ, replay phân kỳ sau vài chục lượt.
- `Senior` **Skill kích hoạt skill khác (phản đòn, chain) thì kiểm soát vòng lặp ra sao?**
  → Hiệu ứng đẩy vào hàng đợi sự kiện xử lý lần lượt thay vì gọi đệ quy, có giới hạn độ sâu hoặc cờ "đã kích hoạt trong chuỗi này". Vì gọi đệ quy khó kiểm soát thứ tự và tràn stack, còn hàng đợi cho thứ tự rõ và dừng được.
- `Mid` **Hệ chấm đỏ thiết kế thế nào?**
  → Cây khoá theo đường dẫn (`main/quest/daily`), nút lá giữ số đếm, nút cha tổng hợp con, `RedDotView` đăng ký đúng path và tự cập nhật. Mỗi hệ (quest, mail) là provider tự báo count của nó. Vì gom logic về một service thì không bị lệch giữa các màn như khi mỗi màn tự tính.
- `Senior` **Chấm đỏ tính lại cả cây mỗi lần đổi thì chậm, tối ưu thế nào?**
  → Chỉ lan ngược lên cha khi giá trị nút thật sự đổi, và chỉ phát sự kiện cho path bị ảnh hưởng. Khi mở sảnh kéo lại một lần để tự sửa lệch. Vì push theo sự kiện nhanh nhưng dễ sót, kéo định kỳ chậm nhưng chắc; kết hợp cả hai là cân bằng.
- `Mid` **Hệ tải asset có ưu tiên và huỷ: cấu trúc?**
  → `AssetLoader` là cổng duy nhất, `LoadQueue` ưu tiên (Blocking > Visible > Prefetch) với trần số tải song song, `HandleTracker` đếm tham chiếu để `Release` đúng. Đổi màn thì huỷ yêu cầu của màn cũ. Vì tải rải rác từ mọi nơi thì không huỷ được và rò handle.
- `Senior` **Tải trước (prefetch) tranh băng thông với tải cần ngay, xử lý sao?**
  → Hạ ưu tiên prefetch và tạm dừng khi có yêu cầu Blocking, giới hạn số kết nối song song, và hỏi người chơi trước khi tải lớn qua 4G. Vì người chơi chỉ nhớ lần họ phải chờ, không nhớ lần đã tải trước thành công.
- `Mid` **Localization: vì sao không ghép chuỗi bằng cộng?**
  → Thứ tự từ khác nhau giữa các ngôn ngữ (Nhật, Anh, Việt), nên chuỗi phải có tham số `{0}` hoặc tên và dịch nguyên câu. Tách một câu thành nhiều khoá rồi nối lại sẽ dịch sai ngữ pháp và không xử lý được số nhiều. Vì dịch viên cần thấy cả câu mới dịch đúng.
- `Senior` **Thêm tiếng Nhật vào game đang có: những gì dễ vỡ?**
  → Font thiếu glyph (dùng TMP font fallback cho CJK, tránh nhồi cả bộ vào một atlas), chuỗi dài hoặc xuống dòng khác tiếng Anh làm tràn nút, chữ nằm trong ảnh, và khoá thiếu bản dịch. Kiểm với ngôn ngữ dài nhất và bật log khoá thiếu. Vì lỗi chữ hiện ra ngay trước mắt người chơi, nặng hơn nhiều lỗi ẩn.
- `Mid` **Input remap: gameplay nên hỏi gì?**
  → Hỏi hành động trừu tượng (`InputService.WasPressed(Action.Jump)`), không hỏi phím cụ thể; `BindingProfile` ánh xạ hành động sang phím theo thiết bị, override của người chơi lưu riêng khỏi mặc định. Vì hardcode `KeyCode` làm remap, tay cầm, và cảm ứng thành sửa khắp nơi.
- `Senior` **Event bus toàn cục: khi nào nó thành spaghetti, tránh thế nào?**
  → Khi sự kiện dùng làm lệnh, chuỗi phát nối tiếp nhiều tầng, và không ai biết ai đang nghe. Giữ sự kiện là thông báo điều đã xảy ra, không dùng bus để hỏi–đáp, giới hạn độ sâu chuỗi, chia bus theo hệ, log sự kiện bản debug. Vì tách rời thì có giá là luồng điều khiển ẩn, và quy ước cộng log là cách giữ nó truy vết được.
- `Mid` **Event bus hay gặp lỗi gì khi chạy?**
  → Quên huỷ đăng ký nên gọi vào object đã destroy, sửa danh sách người nghe lúc đang duyệt, và cấp phát bộ nhớ mỗi lần `Publish` do boxing. Sửa bằng `Subscribe` trả `IDisposable` huỷ ở `OnDestroy`, duyệt bản sao hoặc hoãn thay đổi, và dùng `struct` sự kiện kiểu generic. Vì ba lỗi này gây crash ngẫu nhiên và GC spike khó lần ra.
- `Senior` **Replay: ghi đầu vào hay ghi kết quả?**
  → Ghi đầu vào (seed + phiên bản luật + chuỗi lệnh) thì rất nhỏ, vài KB, nhưng chỉ phát lại đúng khi mô phỏng deterministic và đúng phiên bản master data. Ghi kết quả (chuỗi `BattleEvent`) nặng hơn nhưng phát được kể cả khi cân bằng đã đổi. Thường ghi cả hai: kết quả để xem, lệnh cộng seed để server kiểm.
- `Senior` **DI hay Singleton cho các service game?**
  → Singleton nhanh và đủ cho dự án nhỏ, nhưng giấu phụ thuộc, thứ tự khởi tạo mơ hồ, và khó thay bằng giả lập khi test. DI (inject qua constructor hoặc một container) lộ rõ phụ thuộc và test được, giá là thêm khung và đường cong học. Với dự án nhiều người và nhiều năm tôi chọn DI mỏng; với prototype thì singleton có kiểm soát.
- `Senior` **Khi nào nên dùng object pool, khi nào không?**
  → Pool cho thứ tạo và huỷ thường xuyên và đắt (đạn, hiệu ứng, ô danh sách cuộn) để tránh GC spike và giật frame. Không pool thứ hiếm tạo hoặc trạng thái phức tạp khó reset, vì reset sót là nguồn bug "đối tượng mang trạng thái cũ". Đánh đổi là bộ nhớ giữ sẵn và độ phức tạp của vòng đời.
- `Senior` **Anh test logic thế nào khi hệ thống dính Unity?**
  → Tách logic thành lớp C# thuần (model, service, mô phỏng), view `MonoBehaviour` mỏng chỉ nghe và vẽ; phụ thuộc ngoài (thời gian, mạng, random) đi qua interface để giả lập. Test chạy bằng Edit Mode không cần Play. Vì logic lẫn view thì chỉ test tay được, và replay hay server dùng lại logic cũng không được.

**Khung trả lời 60 giây** — "Anh thiết kế hệ thống inventory cho game RPG thế nào?"

> Trước hết tôi hỏi lại vài thứ: server hay client giữ số lượng, trang bị có cấp cường hoá riêng không, túi có giới hạn ô không. Giả sử server authoritative, tôi tách hai loại dữ liệu: `ItemDef` là master data bất biến, còn `ItemInstance` là của người chơi, hàng tiêu hao chỉ cần id và số lượng, trang bị thì có instance riêng. Phía client có `InventoryModel` giữ bản cache, nhận delta từ server kèm số tuần tự và bắn sự kiện khi đổi; sort với filter chạy trên model, view chỉ dùng scroll ảo hoá để vài nghìn ô không thành vài nghìn object. Điểm hỏng tôi lo nhất là delta lệch hay mạng rớt giữa chừng, nên khi số tuần tự nhảy thì tải lại snapshot. Đánh đổi là tôi chọn delta cộng snapshot dự phòng, nhẹ băng thông hơn gửi cả túi mỗi lần, đổi lại phải có cơ chế phát hiện lệch.

**Họ sẽ đào tiếp**

- *"Hai lệnh dùng cùng một item gần nhau thì sao?"* → server là nguồn chân lý, trả số tuyệt đối; client khoá nút hoặc idempotency key, không tự trừ rồi để lệch.
- *"Sort 2.000 ô mỗi lần mở có chậm không?"* → sort trên model bằng comparator ghép, chỉ khi dữ liệu đổi (dirty flag), view chỉ vẽ ô nhìn thấy.
- *"Trang bị có cường hoá, dữ liệu để đâu?"* → instance riêng với `instanceId`, tách khỏi `ItemDef`; không nhét vào `count`.
- *"Mạng rớt khi đang dùng vật phẩm?"* → lệnh có request id ghi đĩa, hỏi lại trạng thái bằng cùng id, không áp kết quả khi chưa được xác nhận.
- *"Thêm loại vật phẩm mới thì sửa gì?"* → thêm dòng master data (và lớp hành vi nếu cần), không sửa lõi `InventoryModel`.
- *"Vì sao không để view giữ dữ liệu?"* → không test được, mất đồng bộ khi nhiều màn cùng hiển thị, không tái dùng cho server hay replay.
- *"Máy yếu thì sao?"* → scroll ảo hoá, pool ô, tải icon bất đồng bộ và Release khi đóng màn.
- *"Có cần offline không?"* → tuỳ yêu cầu; nếu có thì hàng đợi lệnh ghi đĩa và đối soát khi có mạng, server vẫn quyết cuối.

**Cờ đỏ**

- Mở đầu bằng vẽ class `InventoryManager` mà không hỏi một câu ràng buộc nào.
- Để client tự cộng trừ số lượng rồi "đồng bộ sau", không nhắc ai là nguồn chân lý.
- Dùng một lớp `Item` duy nhất gộp cả định nghĩa và dữ liệu người chơi, nên không phân biệt được stack với trang bị.
- Nói "dùng Singleton `GameManager` giữ hết" rồi không nêu cái giá.
- Chỉ kể đường vui, không nhắc mạng rớt, app bị kill, hoặc dữ liệu lệch.
- Trả lời "tuỳ" cho mọi đánh đổi, không chọn hướng.
- Liệt kê tên pattern (Observer, Factory) mà không nói giải quyết vấn đề gì ở đây.
- Sort hoặc dựng toàn bộ danh sách UI mỗi lần mở, không có scroll ảo hoá.

**Số / ví dụ nên thuộc**

- Năm bước: ràng buộc → ranh giới dữ liệu → luồng chính → điểm hỏng & mở rộng → đánh đổi.
- Cách chia dữ liệu: `Def` (master, bất biến) và `Instance` (của người chơi) — dùng lại cho item, quest, buff, skill.
- Chỉ số cuối = tính lại từ gốc + modifier theo thứ tự cố định (Flat → PercentAdd → PercentMul), không cộng trừ ngược.
- Ghi save nguyên tử: ghi `.tmp` → flush → đổi tên đè → giữ `.bak`; `schemaVersion` ở gốc, migration từng bước `N→N+1`.
- Deterministic cần: seed riêng, thứ tự duyệt cố định, tránh float không kiểm soát, không phụ thuộc `Time.deltaTime`.
- Replay đầu vào: `seed + contentVersion + chuỗi lệnh`, vài KB; replay kết quả: chuỗi `BattleEvent`.
- Ưu tiên tải asset: Blocking > Visible > Prefetch, trần tải song song, huỷ khi đổi màn và `Release` đúng đối ứng.
- Event bus: sự kiện là thông báo điều đã xảy ra, `struct` nhỏ, `Subscribe` trả `IDisposable`, không chuỗi phát quá hai tầng.
- Red dot: cây khoá theo path, chỉ lan lên cha khi giá trị nút đổi.
