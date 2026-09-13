---
title: Meta Systems
icon: 🏰
summary: Những gì giữ người chơi giữa các phiên — căn cứ, bộ sưu tập, nhiệm vụ hằng ngày, mùa giải.
status: deep
read: 220
level: intermediate
order: 70
tags: [systems, retention, meta]
related: [progression, economy-design, player-motivation]
---

Meta system là mọi thứ tồn tại **bên ngoài** [[core-loop]]: căn cứ để nâng cấp, bộ sưu tập để hoàn thiện, nhiệm vụ hằng ngày để quay lại.

Chúng tồn tại để trả lời một câu hỏi mà core loop không trả lời được: *tại sao tôi mở game lại vào ngày mai?* Một core loop hay giữ người chơi trong phiên; meta system quyết định có phiên tiếp theo hay không. Nhưng chính vì thế, đây là mảng dễ trượt sang thao túng nhất trong toàn bộ thiết kế game.

## Câu hỏi kiểm tra: tệ hơn hay ngắn hơn?

Câu hỏi kiểm tra cho mọi meta system: **"nếu bỏ nó đi, game có tệ hơn hay chỉ ngắn hơn?"** Nếu chỉ ngắn hơn, nó là nội dung kéo dài thời gian chứ không phải thiết kế.

Câu hỏi này lọc được phần lớn tính năng giữ chân mà ngành sao chép lẫn nhau. Bỏ hệ thống căn cứ khỏi một roguelite thì game *tệ hơn* — người chơi mất chỗ tiêu tài nguyên và mất cảm giác tiến bộ giữa các run. Bỏ chuỗi ngày đăng nhập thì game chỉ *ngắn hơn* với những người vốn đã định bỏ, và **hay hơn** với những người còn lại.

Câu hỏi thứ hai, đắt hơn nhưng đáng: **người chơi nghỉ hai tuần rồi quay lại thì mất gì?** Câu trả lời đúng trong game single-player gần như luôn là *không mất gì*. Mỗi thứ họ mất là một lý do để không quay lại — vì quay lại lúc đó có nghĩa là đối mặt với khoảng trống mình đã tạo ra.

## Bốn họ meta system

| Họ | Ví dụ | Phục vụ động lực | Rủi ro |
|---|---|---|---|
| **Căn cứ / nhà chính** | Hades, Slay the Spire, Darkest Dungeon | competence — thấy mình mạnh dần | dễ trượt thành cộng chỉ số vĩnh viễn |
| **Bộ sưu tập** | thẻ bài, bestiary, skin, thành tựu | hoàn thiện, khám phá | rỗng nếu món sưu tập không đổi cách chơi |
| **Nhiệm vụ định kỳ** | daily, weekly | cấu trúc, gợi ý mục tiêu | dễ biến thành nghĩa vụ |
| **Mùa giải / battle pass** | season, ranked | tiến trình có hồi kết, xã hội | FOMO, sức ép thời gian |

Xếp theo trục động lực thì bức tranh rõ hơn — và bức tranh này quyết định hệ thống nào bạn nên xây trước:

<figure class="fig">
<svg viewBox="0 0 660 224" role="img" aria-label="Trục từ động lực nội tại sang ngoại tại, các meta system đặt theo vị trí trên trục và vùng nguy hiểm ở cực phải">
  <rect x="40" y="60" width="330" height="34" rx="6" fill="#51cf9b" opacity="0.14"/>
  <rect x="370" y="60" width="130" height="34" rx="6" fill="#ffd43b" opacity="0.16"/>
  <rect x="500" y="60" width="126" height="34" rx="6" fill="#ff8787" opacity="0.18"/>
  <line x1="40" y1="110" x2="620" y2="110" class="fig-line"/>
  <path d="M614 105 L626 110 L614 115 Z" class="fig-line" fill="currentColor"/>
  <text x="40" y="50" font-size="11" fill="#51cf9b">chơi vì MUỐN chơi</text>
  <text x="626" y="50" text-anchor="end" font-size="11" fill="#ff8787">chơi vì SỢ mất</text>
  <line x1="96" y1="104" x2="96" y2="116" class="fig-line"/>
  <text x="96" y="134" text-anchor="middle" class="fig-label" font-size="11">Căn cứ</text>
  <text x="96" y="150" text-anchor="middle" class="fig-muted" font-size="10">mở lựa chọn mới</text>
  <line x1="226" y1="104" x2="226" y2="116" class="fig-line"/>
  <text x="226" y="134" text-anchor="middle" class="fig-label" font-size="11">Bộ sưu tập</text>
  <text x="226" y="150" text-anchor="middle" class="fig-muted" font-size="10">tự đặt mục tiêu</text>
  <line x1="356" y1="104" x2="356" y2="116" class="fig-line"/>
  <text x="356" y="134" text-anchor="middle" class="fig-label" font-size="11">Nhiệm vụ tích luỹ</text>
  <text x="356" y="150" text-anchor="middle" class="fig-muted" font-size="10">có trần, không mất</text>
  <line x1="462" y1="104" x2="462" y2="116" class="fig-line"/>
  <text x="462" y="134" text-anchor="middle" class="fig-label" font-size="11">Battle pass</text>
  <text x="462" y="150" text-anchor="middle" class="fig-muted" font-size="10">hạn theo mùa</text>
  <line x1="566" y1="104" x2="566" y2="116" class="fig-line"/>
  <text x="566" y="134" text-anchor="middle" font-size="11" fill="#ff8787">Chuỗi đăng nhập</text>
  <text x="566" y="150" text-anchor="middle" class="fig-muted" font-size="10">mất là mất hẳn</text>
  <text x="330" y="184" text-anchor="middle" class="fig-muted" font-size="10">càng sang phải càng giữ chân tốt trong 30 ngày — và càng bào mòn hứng thú sau đó</text>
  <text x="330" y="202" text-anchor="middle" class="fig-muted" font-size="10">chỉ sang phải khi đã dùng hết dư địa bên trái</text>
</svg>
<figcaption>Hệ thống bên trái tự nuôi nhau: người chơi mở được lựa chọn mới thì muốn thử, thử thì lại mở thêm. Hệ thống bên phải mượn trước sự chú ý của ngày mai.</figcaption>
</figure>

## Căn cứ: nhịp nâng cấp quan trọng hơn nội dung nâng cấp

Căn cứ là nơi tài nguyên kiếm được trong run biến thành thứ nhìn thấy được. Nó hoạt động vì nó cho người chơi **một nơi thất bại vẫn có ích** — thua nhưng vẫn mang tài nguyên về.

Nhịp chuẩn hoạt động tốt với phần lớn roguelite:

- **Nâng cấp đầu tiên xong trong 1–2 run đầu.** Người chơi phải thấy vòng lặp khép kín trước khi họ quyết định có chơi tiếp không.
- **Giãn dần theo hàm nhân, không theo hàm cộng.** Mỗi bậc đắt hơn bậc trước khoảng 1,5–2 lần. Đắt quá thì cảm thấy tường cày cuốc, rẻ quá thì hết nội dung sau một buổi.
- **Luôn có ít nhất hai thứ đáng mua cùng lúc.** Một lựa chọn duy nhất không phải lựa chọn; đó chỉ là cái nút.

Bẫy lớn nhất: căn cứ trượt thành **cộng chỉ số vĩnh viễn**. Khi đó độ khó thật của game phụ thuộc vào số giờ đã cày chứ không vào kỹ năng, và mọi cân bằng [[difficulty-curve]] của bạn bị trôi. Cách tránh gọn nhất là ràng buộc ở tầng kiểu dữ liệu — mở khoá chỉ có hai loại là *lựa chọn mới* và *trang trí*, không có loại *cộng sức mạnh*. Xem [[progression]].

## Bộ sưu tập: chỉ hiệu quả khi món sưu tập đổi cách chơi

Bộ sưu tập nhắm vào nhóm người chơi thích hoàn thiện — thấy thanh tiến độ 47/60 là tự sinh ra mục tiêu mà không cần ai giao. Đây là dạng meta rẻ nhất để làm và dễ làm rỗng nhất.

Phân biệt hai loại:

- **Sưu tập có tác dụng** — mỗi món mở ra một cách chơi khác (vũ khí, nhân vật, biến thể luật). Người chơi sưu tập vì muốn *thử*, và mỗi món mới lại kéo họ về core loop.
- **Sưu tập thuần trang trí** — skin, bestiary, tranh minh hoạ. Vẫn có giá trị, nhưng nó tiêu thụ thời gian chứ không tạo ra lý do chơi mới.

Tỉ lệ lành mạnh: phần lớn món sưu tập nên thuộc loại đầu. Bestiary 200 mục mà không mục nào đổi cách chơi là 200 ô trống chờ được lấp — nó đo sự kiên nhẫn, không đo sự tò mò.

Một chi tiết nhỏ có tác dụng lớn: **hiện cái còn thiếu, đừng chỉ hiện cái đã có.** Ô xám có hình bóng mờ tạo ra câu hỏi "làm sao lấy được?"; danh sách chỉ gồm thứ đã sở hữu thì không.

## Nhiệm vụ định kỳ: ranh giới giữa động lực và nghĩa vụ

Cạm bẫy lớn nhất là **nhiệm vụ hằng ngày biến thành nghĩa vụ**. Khi người chơi đăng nhập vì sợ mất chuỗi ngày chứ không vì muốn chơi, bạn đã chuyển từ động lực nội tại sang ngoại tại — và nghiên cứu tâm lý cho thấy điều này *làm giảm* hứng thú lâu dài. Xem [[player-motivation]].

Dấu hiệu nhận ra trong dữ liệu: người chơi đăng nhập, làm xong daily trong 6 phút, rồi thoát. Chỉ số giữ chân đẹp, thời lượng chơi tụt, và vài tuần sau họ biến mất hẳn — thường không bao giờ quay lại, vì mối quan hệ với game đã thành công việc.

Biến thể lành mạnh hơn, theo thứ tự quan trọng:

1. **Tích luỹ được, có trần.** Nghỉ ba ngày thì quay lại có ba nhiệm vụ đang chờ, không phải ba cơ hội đã mất. Trần 7 ngày là con số thường dùng — đủ để đi nghỉ, không đủ để tích cả tháng rồi làm một lượt.
2. **Thưởng cho đa dạng, không thưởng cho tần suất.** "Thắng bằng ba nhân vật khác nhau" đẩy người chơi khám phá; "đăng nhập 7 ngày liên tiếp" chỉ đẩy họ đăng nhập.
3. **Không bao giờ phạt vì nghỉ.** Không mất chuỗi, không tụt hạng, không mất tài nguyên. Phần thưởng cho sự có mặt thì được, hình phạt cho sự vắng mặt thì không.
4. **Nhiệm vụ phải làm được trong lúc chơi bình thường.** Nhiệm vụ bắt người chơi chơi theo kiểu họ không thích là thuế đánh vào niềm vui.

## Mùa giải và battle pass

Mùa giải giải quyết một vấn đề thật: [[progression]] vô hạn thì mất ý nghĩa, còn hữu hạn thì hết. Chia thời gian thành mùa cho phép tiến trình vừa có đích vừa lặp lại.

Cấu trúc thường gặp: mùa **8–10 tuần**, một đường tiến độ có mốc thưởng đều đặn, và một phần đầu miễn phí. Ngắn hơn 6 tuần thì người chơi bận một đợt là lỡ cả mùa; dài hơn 12 tuần thì nửa sau mùa không ai còn quan tâm.

Ba quyết định định hình toàn bộ cảm giác của hệ thống:

| Quyết định | Lành mạnh | Bào mòn |
|---|---|---|
| Phần thưởng hết mùa | giữ lại vĩnh viễn | mất nếu chưa nhận |
| Tốc độ tiến độ | chơi bình thường là xong | phải chơi hằng ngày mới kịp |
| Nội dung mùa cũ | quay lại được sau | không bao giờ có lại |

Cột phải làm chỉ số 30 ngày đẹp hơn thật. Nó cũng là lý do người chơi mô tả game bằng từ "grind" trên diễn đàn, và đó là thứ marketing không mua lại được.

Nếu game của bạn là single-player, hãy thành thật: mùa giải chủ yếu phục vụ [[economy-design]] và lịch phát hành nội dung, không phục vụ trải nghiệm. Điều đó không sai — nhưng đừng tự thuyết phục mình rằng nó là tính năng cho người chơi.

## Xã hội trong game single-player

Không cần multiplayer để có yếu tố xã hội, và đây là mảng hay bị bỏ sót vì nó bị nhầm với "làm netcode".

Ba dạng rẻ và hiệu quả:

- **Bảng xếp hạng cho thử thách hằng ngày** — cùng seed cho mọi người, so sánh công bằng. Chỉ cần lưu điểm số, không cần đồng bộ trạng thái.
- **Chia sẻ build / seed bằng mã chuỗi.** Người chơi tự tạo nội dung cho nhau: một chuỗi ký tự dán vào Discord là đủ tái tạo cấu hình. Chi phí gần như bằng không, giá trị cộng đồng rất lớn.
- **Thống kê ẩn danh tổng hợp** — "12% người chơi chọn nhánh này". Tạo cảm giác có người khác ở đó mà không cần ai thật sự ở đó.

Điểm chung: cả ba đều **không tạo nghĩa vụ xã hội**. Người chơi không phải chờ ai, không phụ ai, không bị bỏ lại — đó là lý do chúng hợp với single-player.

## Kiểm tra nhanh

- Với từng meta system: bỏ nó đi thì game **tệ hơn** hay chỉ **ngắn hơn**?
- Người chơi nghỉ hai tuần quay lại thì mất gì? Có món nào mất vĩnh viễn không?
- Mở khoá của bạn là **lựa chọn mới** hay **cộng chỉ số**? Có ràng buộc ở tầng kiểu dữ liệu không?
- Nhiệm vụ định kỳ có tích luỹ được không? Trần bao nhiêu ngày?
- Có hình phạt nào cho việc nghỉ chơi không? (nên là không)
- Món sưu tập có đổi cách chơi không, hay chỉ lấp ô trống?
- Người chơi làm xong daily trong mấy phút rồi thoát? Nếu dưới 10 phút, hãy xem lại.

## 🤖 Prompt cho AI

Meta system là nơi AI nhồi mọi cơ chế giữ chân của ngành nếu bạn không chặn.

**Dùng AI thế nào cho thiết kế meta**

Lý do phải cẩn thận ở đây khác các chủ đề khác: dữ liệu huấn luyện của AI **thiên lệch mạnh** về game dịch vụ vận hành lâu dài, vì đó là loại game được viết về nhiều nhất. Hỏi chung chung thì bạn sẽ nhận về daily quest, chuỗi đăng nhập và battle pass cho cả một game phiêu lưu đơn tuyến 6 giờ.

Dùng nó theo hai vai, đừng gộp:

| Vai | Khi nào | Câu mở đầu |
|---|---|---|
| Người đề xuất bị trói | đang tìm ý tưởng | "Đề xuất meta phục vụ \<động lực\>, với danh sách CẤM dưới đây" |
| Người phản biện | đã có thiết kế | "Với mỗi hệ thống: bỏ nó đi thì game tệ hơn hay ngắn hơn? Cái nào chỉ ngắn hơn thì loại" |

Vai thứ hai là vai giá trị nhất, và nó chỉ hoạt động khi bạn bắt trả lời **từng hệ thống một** — hỏi tổng thể thì nhận về lời khen tổng thể.

**Phải nêu rõ:**
- Meta system phục vụ động lực nào (xem [[player-motivation]])
- Cơ chế giữ chân nào bị **cấm tuyệt đối**
- Người chơi nghỉ 2 tuần rồi quay lại thì mất gì (câu trả lời đúng thường là: không mất gì)
- Game là single-player hay dịch vụ vận hành — quyết định hẳn bộ công cụ hợp lệ
- Độ dài game dự kiến: meta cho game 6 giờ khác hẳn meta cho game 200 giờ

**Mẫu prompt**

```
Thiết kế meta-progression cho roguelike. Single-player, không server.
Dự kiến người chơi gắn bó 20-40 giờ.

Ràng buộc cứng:
- CHỈ mở khoá LỰA CHỌN (vũ khí, nhân vật, biến thể). KHÔNG cộng chỉ số vĩnh viễn.
- KHÔNG chuỗi ngày đăng nhập, KHÔNG timer chờ, KHÔNG nội dung giới hạn thời gian.
- Nhiệm vụ hằng ngày (nếu có) phải TÍCH LUỸ được, có trần 7 ngày,
  và thưởng cho ĐA DẠNG lối chơi chứ không cho tần suất đăng nhập.
- Nghỉ 2 tuần quay lại: không mất gì, không bị tụt hạng.

Với mỗi hệ thống bạn đề xuất, trả lời: "nếu bỏ nó đi, game TỆ HƠN hay chỉ NGẮN HƠN?"
Cái nào chỉ ngắn hơn thì loại.

Rồi cho tôi nhịp nâng cấp căn cứ dạng bảng: bậc | giá | mở ra gì |
ước tính run thứ mấy thì mua được. Giá tăng theo hệ số 1.5-2 mỗi bậc.
```

**Bẫy thường gặp:** AI đề xuất "nhiệm vụ hằng ngày + chuỗi đăng nhập + battle pass" cho mọi thể loại. Bắt nó trả lời câu "tệ hơn hay ngắn hơn" cho từng hệ thống là cách lọc nhanh nhất. Bẫy thứ hai: AI cho mở khoá cộng chỉ số vì đó là cách dễ nhất tạo cảm giác tiến bộ — hãy cấm ở tầng kiểu dữ liệu chứ đừng cấm bằng lời, vì lời nhắc sẽ trôi khỏi ngữ cảnh sau vài lượt.

## 🎮 Unity

Meta system là mảng có **nhiều trạng thái cần lưu nhất**, nên nó đứng hoặc chết ở [[unity-save-data]].

**Nơi các quyết định sống**

- `Core/Meta/` — logic mở khoá, tiến trình (C# thuần)
- `SaveData.cs` — **một class phẳng, có version**
- `Assets/Data/Unlocks/*.asset` — định nghĩa mở khoá

**Lưu id, không lưu tham chiếu**

```csharp
// ❌ ScriptableObject không serialize được vào JSON — mất hết khi load
[System.Serializable] public class SaveData {
    public List<WeaponData> unlockedWeapons;
}

// ✅ lưu id chuỗi, tra lại khi load
[System.Serializable] public class SaveData {
    public int version = 3;
    public List<string> unlockedWeaponIds = new();
}
```

Đây là lỗi phổ biến nhất của meta-progression trong Unity. `JsonUtility` sẽ serialize object reference thành `{"instanceID": 0}` — load lại là mất trắng.

**Version và migration từ ngày đầu**

```csharp
static SaveData Migrate(SaveData d) {
    if (d.version < 2) { d.unlockedWeaponIds ??= new(); d.version = 2; }
    if (d.version < 3) { d.dailyStreak = 0; d.version = 3; }
    return d;
}
```

Thêm version sau khi đã có người chơi nghĩa là bạn không biết file save cũ có cấu trúc gì. Bắt đầu từ `version = 1` ngay commit đầu — chi phí bằng không.

**Mở khoá định nghĩa bằng dữ liệu**

```csharp
[CreateAssetMenu(menuName = "Game/Unlock")]
public class UnlockDef : ScriptableObject {
    public string id;                    // khớp với chuỗi trong SaveData
    public UnlockKind kind;              // Choice | Cosmetic — KHÔNG có StatBoost
    public int cost;
    public string[] requires;            // id điều kiện tiên quyết
}
```

Enum **không có** `StatBoost` là cách cưỡng chế bất biến "chỉ mở khoá lựa chọn, không cộng sức mạnh" ở [[progression]]. Ai muốn thêm phải sửa enum — và lúc đó có review.

**Nhiệm vụ hằng ngày — đừng dùng thời gian máy**

```csharp
// ❌ người chơi lùi đồng hồ hệ thống là ăn thưởng vô hạn
if (DateTime.Now.Date > lastClaim.Date) Grant();

// ✅ lưu cả UtcNow và kiểm tra không đi lùi
if (DateTime.UtcNow < save.lastServerSeenUtc) { FlagSuspicious(); return; }
```

Không có server thì không chống được hoàn toàn. Cách thực dụng cho game offline: **chấp nhận**, và thiết kế thưởng hằng ngày tích luỹ có trần (xem phần trên) để việc gian lận không đáng.

**Kiểm tra nhanh**
- Xoá file save: game có chạy được từ đầu không? (không crash)
- Sửa `version` trong file save xuống 1: migration có chạy không?
- Lùi đồng hồ hệ thống: có ăn thưởng hằng ngày hai lần được không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Meta system là gì? Cho ví dụ trong một game anh biết.**
  → Là hệ thống nằm **ngoài** core loop, trả lời câu "vì sao tôi mở game ngày mai" chứ không phải "vì sao phút này vui". Ví dụ: căn cứ nâng cấp của Hades, bộ sưu tập bestiary, battle pass, chuỗi đăng nhập. Core loop giữ người chơi trong phiên; meta system đưa họ quay lại giữa các phiên.
- `Junior` **Vì sao roguelite cần căn cứ mà roguelike thì không?**
  → Vì roguelite hứa rằng run thua vẫn để lại thứ gì đó; căn cứ là nơi tiêu tài nguyên mang về, tức là nơi lời hứa đó thành hiện thực. Roguelike thuần lấy chính kỹ năng người chơi làm meta-progression, nên thêm căn cứ vào là phá lời hứa "mỗi run bắt đầu từ số 0".
- `Junior` **Trục động lực nội tại → ngoại tại dùng để làm gì?**
  → Để biết mình đang đứng đâu trước khi thêm hệ thống mới. Thứ tự quen thuộc: căn cứ → bộ sưu tập → nhiệm vụ tích luỹ → battle pass → chuỗi đăng nhập. Càng sang phải càng giữ chân tốt trong 30 ngày đầu và càng bào mòn hứng thú sau đó — nên chỉ sang phải khi đã dùng hết dư địa bên trái.
- `Mid` **Sếp muốn thêm chuỗi ngày đăng nhập. Anh nói gì?**
  → Tôi hỏi nó giải quyết vấn đề gì. Nếu là "người chơi không quay lại" thì chuỗi đăng nhập chữa triệu chứng: nó tạo lý do quay lại mà không tạo lý do chơi. Tôi đề xuất bản tích luỹ có trần 7 ngày — giữ phần thưởng cho sự có mặt, bỏ hình phạt cho sự vắng mặt, và thường giữ được gần hết chỉ số.
- `Mid` **Retention 7 ngày đẹp nhưng thời lượng mỗi phiên tụt. Chuyện gì đang xảy ra?**
  → Dấu hiệu kinh điển của daily biến thành nghĩa vụ: người chơi vào, làm xong nhiệm vụ trong sáu phút, thoát. Chỉ số 7 ngày rất đẹp, rồi vài tuần sau họ biến mất hẳn vì quan hệ với game đã thành công việc. Tôi nhìn **phân bố** thời lượng phiên, không nhìn trung bình — cụm dưới 10 phút là cảnh báo.
- `Mid` **Bộ sưu tập thế nào là tốt?**
  → Món sưu tập phải **đổi cách chơi**, không chỉ lấp ô trống. Bestiary 200 mục mà không mục nào đổi lối chơi là đo sự kiên nhẫn chứ không đo tò mò. Và hiện cái còn thiếu dưới dạng bóng mờ chứ đừng chỉ hiện cái đã có — ô xám mới tạo ra câu hỏi "làm sao lấy được".
- `Senior` **Làm sao ngăn meta-progression phá cân bằng độ khó?**
  → Ràng buộc ở tầng kiểu dữ liệu, không ràng buộc bằng tài liệu: enum mở khoá chỉ có hai giá trị — lựa chọn mới và trang trí, không có giá trị cộng chỉ số. Ai muốn thêm phải sửa enum, và lúc đó có review. Cho cộng chỉ số vĩnh viễn thì độ khó thật phụ thuộc số giờ đã cày chứ không phụ thuộc kỹ năng.
- `Senior` **Game single-player 6 giờ thì cần meta system gì?**
  → Gần như không cần. Meta trả lời câu "tại sao tôi mở game ngày mai", mà game 6 giờ thì người chơi chơi hết trong hai ba buổi. Thêm daily quest vào đó là sao chép hình thức của game dịch vụ mà không có bài toán của game dịch vụ — được chỉ số ảo, mất nhịp của một câu chuyện ngắn.
- `Senior` **Thêm yếu tố xã hội vào single-player mà không tạo nghĩa vụ — làm thế nào?**
  → Ba thứ rẻ mà hiệu quả: bảng xếp hạng thử thách hằng ngày cùng seed, chia sẻ build bằng mã chuỗi, và thống kê ẩn danh kiểu "12% người chơi chọn nhánh này". Cả ba đều không bắt chờ ai và không phụ ai — điểm phân biệt là người chơi nghỉ hai tuần quay lại có mất gì không.

**Khung trả lời 60 giây** — "Anh quyết định giữ hay bỏ một meta system bằng cách nào?"

> Một câu hỏi duy nhất: **bỏ nó đi thì game tệ hơn hay chỉ ngắn hơn?** Nếu chỉ ngắn hơn thì đó là nội dung kéo dài thời gian, không phải thiết kế. Bỏ hệ thống căn cứ khỏi roguelite thì game tệ hơn thật — người chơi mất chỗ tiêu tài nguyên và mất cảm giác tiến bộ giữa các run. Bỏ chuỗi đăng nhập thì game chỉ ngắn hơn với những người vốn đã định bỏ, và hay hơn với số còn lại.
>
> Câu hỏi thứ hai tôi luôn hỏi: **nghỉ hai tuần quay lại thì mất gì?** Trong single-player câu trả lời đúng gần như luôn là không mất gì, vì mỗi thứ họ mất là một lý do để không quay lại — quay lại lúc đó nghĩa là đối mặt với khoảng trống mình tạo ra.
>
> Và tôi xếp mọi hệ thống lên một trục từ động lực nội tại sang ngoại tại. Càng sang phải càng giữ chân tốt trong 30 ngày đầu và càng bào mòn hứng thú sau đó. Nên chỉ sang phải khi đã dùng hết dư địa bên trái.

**Họ sẽ đào tiếp**

- *"Retention đẹp mà thời lượng phiên tụt?"* → Dấu hiệu kinh điển của daily biến thành nghĩa vụ: người chơi vào, làm xong nhiệm vụ trong sáu phút, thoát. Chỉ số 7 ngày rất đẹp, rồi vài tuần sau họ biến mất hẳn và thường không quay lại, vì mối quan hệ với game đã thành công việc. Tôi sẽ nhìn phân bố thời lượng phiên chứ không nhìn trung bình.
- *"Sếp muốn chuỗi đăng nhập"* → Tôi hỏi nó giải quyết vấn đề gì. Nếu là "người chơi không quay lại" thì chuỗi đăng nhập chữa triệu chứng: nó tạo lý do quay lại mà không tạo lý do chơi. Tôi đề xuất bản tích luỹ có trần 7 ngày — giữ được phần thưởng cho sự có mặt, bỏ phần phạt cho sự vắng mặt, và thường giữ được hầu hết chỉ số.
- *"Ngăn meta phá cân bằng thế nào?"* → Ràng buộc ở tầng kiểu dữ liệu, không ràng buộc bằng tài liệu. Enum mở khoá chỉ có hai giá trị: lựa chọn mới và trang trí. Không có giá trị cộng chỉ số, nên ai muốn thêm phải sửa enum, và lúc đó có review. Nếu cho cộng chỉ số vĩnh viễn thì độ khó thật phụ thuộc số giờ đã cày chứ không phụ thuộc kỹ năng, và mọi cân bằng đường cong độ khó bị trôi.
- *"Game 6 giờ thì cần meta gì?"* → Gần như không cần. Meta trả lời câu "tại sao tôi mở game ngày mai", mà game 6 giờ thì người chơi chơi hết trong hai ba buổi. Thêm daily quest vào đó là sao chép hình thức của game dịch vụ mà không có bài toán của game dịch vụ.
- *"Bộ sưu tập thế nào là tốt?"* → Món sưu tập phải **đổi cách chơi**, không chỉ lấp ô trống. Bestiary 200 mục mà không mục nào đổi lối chơi là đo sự kiên nhẫn chứ không đo tò mò. Và hiện cái còn thiếu dưới dạng bóng mờ, đừng chỉ hiện cái đã có — ô xám mới tạo ra câu hỏi "làm sao lấy được".
- *"Xã hội trong single-player?"* → Ba thứ rẻ mà hiệu quả: bảng xếp hạng thử thách hằng ngày cùng seed, chia sẻ build bằng mã chuỗi, và thống kê ẩn danh kiểu "12% người chơi chọn nhánh này". Cả ba đều không tạo nghĩa vụ xã hội — không phải chờ ai, không phụ ai.

**Cờ đỏ**

- Đề xuất daily + streak + battle pass mà chưa hỏi game thuộc loại nào, dài bao lâu.
- Không phân biệt được mở khoá lựa chọn và cộng chỉ số vĩnh viễn.
- Dùng retention 7 ngày làm bằng chứng duy nhất cho việc hệ thống hoạt động tốt.
- Thiết kế có hình phạt cho việc nghỉ chơi, và gọi đó là động lực.
- Nói "người chơi thích cày" mà không có dữ liệu, chỉ có giả định.

**Số / ví dụ nên thuộc**

- Câu hỏi lọc: **"tệ hơn hay chỉ ngắn hơn?"** — hỏi cho **từng** hệ thống, không hỏi tổng thể.
- Nhịp căn cứ: nâng cấp đầu trong **1–2 run**, giá tăng hệ số **1,5–2** mỗi bậc, luôn có **≥ 2** lựa chọn đáng mua.
- Daily tích luỹ: trần **7 ngày**.
- Mùa giải: **8–10 tuần**; dưới 6 tuần là lỡ cả mùa khi bận, trên 12 tuần là nửa sau không ai quan tâm.
- Cảnh báo trong dữ liệu: phiên chơi **dưới 10 phút** đủ làm xong daily rồi thoát.
- Trục động lực: căn cứ → bộ sưu tập → nhiệm vụ tích luỹ → battle pass → **chuỗi đăng nhập** (cực ngoại tại).
