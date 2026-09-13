---
title: Động lực người chơi
icon: 🧭
summary: Vì sao người ta chơi tiếp — Self-Determination Theory, Bartle, Quantic Foundry và cách chuyển thành hệ thống cụ thể.
status: deep
read: 50
level: basic
order: 30
tags: [foundations, psychology]
related: [progression, core-loop, meta-systems]
---

Thiết kế mà không biết mình đang phục vụ động lực nào thì chỉ là bắt chước game khác.

## Self-Determination Theory — cái gốc

Ba nhu cầu tâm lý cơ bản. Game nào thoả cả ba đều gây nghiện, không ngoại lệ:

**Competence (cảm giác giỏi lên).** Người chơi cần thấy mình tiến bộ — không phải vì chỉ số tăng, mà vì *họ thật sự chơi giỏi hơn*. Dark Souls không cho bạn mạnh lên nhiều; nó làm bạn giỏi lên. Xem [[difficulty-curve]].

**Autonomy (cảm giác tự quyết).** Người chơi cần thấy lựa chọn của mình có ý nghĩa. Ba build đều khả thi thì có autonomy; ba build mà một cái trội hẳn thì chỉ là một lựa chọn giả. Đây là lý do [[balancing-math]] quan trọng về mặt *cảm xúc*, không chỉ về mặt toán.

**Relatedness (cảm giác kết nối).** Với người khác (co-op, guild, leaderboard) hoặc với thế giới trong game (NPC có ký ức, thú cưng, căn cứ của mình). Xem [[llm-npc]].

Kiểm tra nhanh: gỡ bỏ một hệ thống bất kỳ trong game bạn và hỏi *"cái này phục vụ nhu cầu nào trong ba nhu cầu trên?"*. Không trả lời được thì hệ thống đó là mỡ thừa.

## Bartle — bốn kiểu người chơi

Ra đời cho MUD, vẫn hữu dụng để kiểm tra độ phủ:

- **Achiever** — muốn hoàn thành, 100%, leaderboard, thành tựu.
- **Explorer** — muốn khám phá bản đồ, tìm bí mật, hiểu hệ thống ngầm.
- **Socialiser** — muốn chơi cùng và nói chuyện với người khác.
- **Killer** — muốn áp đảo người chơi khác.

Đừng cố phục vụ cả bốn như nhau — game nhỏ mà dàn trải sẽ nhạt ở mọi mặt. **Chọn một nhóm chính, một nhóm phụ**, ghi rõ vào [[design-pillars]].

## Quantic Foundry — chi tiết hơn, dùng được hơn

Nghiên cứu trên hàng trăm nghìn người chơi, rút ra 12 động lực gom thành 6 cặp: *Action, Social, Mastery, Achievement, Immersion, Creativity*. Điểm giá trị nhất của mô hình này là nó chỉ ra các động lực **xung khắc**:

- **Action/Excitement** kỵ **Immersion/Story** — người thích nổ tung màn hình thường bỏ qua cốt truyện.
- **Mastery/Challenge** kỵ **Achievement/Completion** — người thích thử thách khó chịu với checklist cày cuốc.

Nhồi cả hai vế của một cặp xung khắc vào cùng một game là cách nhanh nhất để không ai thấy vừa ý.

## Từ động lực → hệ thống

Bảng dịch trực tiếp, dùng khi thiết kế [[systems]]:

| Động lực | Hệ thống nên có | Đừng làm |
|---|---|---|
| Competence | Đường cong khó tăng dần, phản hồi tức thì, skill ceiling cao | Auto-play, thắng do chỉ số |
| Autonomy | Nhiều build khả thi, đường đi phân nhánh | Chỉ một meta tối ưu |
| Achievement | Thành tựu, bộ sưu tập, %hoàn thành | Checklist vô nghĩa để kéo dài giờ chơi |
| Exploration | Bí mật, lore rải rác, bản đồ mở dần | Đánh dấu sẵn mọi thứ trên minimap |
| Social | Co-op, chia sẻ build, guild | Ép social vào game single-player |
| Creativity | Xây dựng, tuỳ biến, chia sẻ tác phẩm | Tuỳ biến chỉ đổi màu |

## Cảnh báo về mặt đạo đức

Nhiều kỹ thuật "giữ chân" khai thác đúng các cơ chế tâm lý này theo hướng gây hại: variable-ratio reward (cơ chế của máy đánh bạc), loot box, timer ép quay lại, FOMO. Chúng *hiệu quả* về số liệu và cũng chính là thứ khiến người chơi ghét game của bạn về lâu dài — và ở nhiều nước giờ là vấn đề pháp lý.

Ranh giới thực dụng: **phần thưởng nên đến từ việc chơi giỏi hơn, không đến từ việc chờ lâu hơn hoặc trả nhiều hơn.** Xem thêm [[economy-design]].

## 🤖 Prompt cho AI

Động lực là thứ AI **không suy ra được từ mô tả tính năng**. Nếu không nói, nó sẽ nhồi mọi hệ thống giữ chân phổ biến vào game bạn.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Động lực chính và phụ — chọn 1 chính, 1 phụ, không hơn
- Cặp động lực **xung khắc** mà bạn từ chối (Action vs Immersion, Mastery vs Completion)
- Ranh giới đạo đức: có/không loot box, timer, chuỗi ngày đăng nhập

**Mẫu prompt**

```
Game của tôi phục vụ: Mastery/Challenge (chính) + Discovery (phụ).
KHÔNG phục vụ: Achievement/Completion — không checklist, không % hoàn thành.

Đề xuất 5 hệ thống giữ chân người chơi, mỗi hệ thống phải nói rõ
nó phục vụ nhu cầu nào trong 3 nhu cầu SDT (competence / autonomy / relatedness).
Loại bỏ ngay mọi cơ chế dựa trên: chờ đợi, FOMO, variable-ratio reward.
```

**Bẫy thường gặp:** AI đề xuất "nhiệm vụ hằng ngày + chuỗi đăng nhập + battle pass" cho mọi thể loại, vì đó là mẫu phổ biến nhất trong dữ liệu huấn luyện. Bắt nó biện minh từng cơ chế theo SDT là cách lọc nhanh nhất.

## 🎮 Unity

Động lực không hiện thực hoá trực tiếp bằng code. Nhưng trong Unity có một việc cụ thể: **đo xem hệ thống bạn xây có thật phục vụ động lực đó không**.

**Log sự kiện gắn với nhu cầu SDT**

```csharp
// Competence — người chơi có thấy mình giỏi lên?
Analytics.Log("skill_progress", new {
    level = playerLevel,
    deathsLastHour = deaths,
    bossAttemptsBeforeWin = attempts      // giảm dần = đang giỏi lên thật
});

// Autonomy — các build có thật sự khả thi?
Analytics.Log("build_chosen", new { buildId, winRate });

// Relatedness — nếu có
Analytics.Log("coop_session", new { durationMinutes });
```

Không có log này, bạn chỉ **tin** rằng game tạo cảm giác competence. Có log thì thấy `bossAttemptsBeforeWin` có giảm theo thời gian hay không — đó là bằng chứng. Xem [[playtesting-metrics]].

**Kiểm tra autonomy bằng số: pick rate**

```csharp
[MenuItem("Tools/Balance/Pick Rate Report")]
static void Report() {
    // Đọc log, đếm tỉ lệ chọn từng build
    // Một build > 40% pick rate = các build khác đang vô nghĩa
    // -> autonomy chỉ là ảo giác
}
```

Đây là cách biến "người chơi có cảm thấy được tự quyết không" thành một con số kiểm tra được.

**Cấm cơ chế khai thác — cưỡng chế bằng test**

Nếu pillar của bạn từ chối loot box / timer / FOMO:

```csharp
[Test]
public void KhongCoTimerChoDoi() {
    // Không field nào tên kiểu *CooldownHours, *WaitTime, *EnergyRefill
    foreach (var t in typeof(GameAssembly).Assembly.GetTypes())
        foreach (var f in t.GetFields())
            Assert.IsFalse(Regex.IsMatch(f.Name, "(?i)(waittime|cooldownhours|energyrefill)"),
                $"{t.Name}.{f.Name} trông như timer chờ — vi phạm pillar");
    }
```

Hơi thô, nhưng nó chặn được việc cơ chế khai thác lẻn vào qua một PR không ai đọc kỹ.

**Kiểm tra nhanh**
- Có log `bossAttemptsBeforeWin` không? Nó có giảm theo thời gian không?
- Pick rate build cao nhất dưới 40% chứ?
- Grep tên field trông như timer chờ → bằng 0?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Ba nhu cầu trong Self-Determination Theory là gì?**
  → **Competence** — cảm giác giỏi lên, không phải chỉ số tăng mà là thật sự chơi giỏi hơn. **Autonomy** — cảm giác lựa chọn của mình có ý nghĩa. **Relatedness** — cảm giác kết nối, với người khác hoặc với thế giới trong game. Game thoả cả ba đều gây nghiện; đây là cái gốc mà mọi mô hình khác chỉ chi tiết hoá.
- `Junior` **Phép thử nhanh để biết một hệ thống có đáng giữ không?**
  → Gỡ nó ra và hỏi: **cái này phục vụ nhu cầu nào trong ba nhu cầu SDT?** Không trả lời được thì đó là mỡ thừa. Phép thử này mạnh vì nó buộc phải nói bằng động lực chứ không bằng "để người chơi có thêm thứ để làm" — câu sau đúng với mọi hệ thống nên không loại được gì.
- `Junior` **Bốn kiểu người chơi của Bartle là gì, và dùng thế nào?**
  → **Achiever** (hoàn thành, 100%, leaderboard), **Explorer** (khám phá, bí mật, hiểu hệ thống ngầm), **Socialiser** (chơi cùng người khác), **Killer** (áp đảo người khác). Dùng để kiểm tra độ phủ, không dùng để phục vụ đều cả bốn: chọn **một nhóm chính, một nhóm phụ** và ghi vào design pillars.
- `Mid` **Autonomy hỏng khi nào? Cho ví dụ cụ thể.**
  → Khi lựa chọn chỉ là lựa chọn **giả**: ba build nhưng một cái trội hẳn. Người chơi vẫn "được chọn" nhưng biết chỉ có một đáp án đúng, nên cảm giác tự quyết biến mất. Đây là lý do cân bằng quan trọng về mặt **cảm xúc** chứ không chỉ về mặt toán — chênh 15% sức mạnh là đủ để cộng đồng gọi hai build kia là bẫy.
- `Mid` **Hai cặp động lực xung khắc đáng nhớ nhất là gì?**
  → **Action/Excitement kỵ Immersion/Story** — người thích nổ tung màn hình thường bỏ qua cốt truyện. Và **Mastery/Challenge kỵ Achievement/Completion** — người thích thử thách khó chịu với checklist cày cuốc. Nhồi cả hai vế của một cặp vào cùng một game là cách nhanh nhất để không ai thấy vừa ý.
- `Mid` **Dịch một động lực thành hệ thống — cho hai ví dụ kèm cái không nên làm.**
  → **Competence** → đường cong khó tăng dần, phản hồi tức thì, skill ceiling cao; đừng làm auto-play hay thắng do chỉ số. **Exploration** → bí mật, lore rải rác, bản đồ mở dần; đừng đánh dấu sẵn mọi thứ trên minimap. Cột "đừng làm" quan trọng hơn cột "nên có", vì nó là chỗ người ta vô tình phá chính động lực mình đang bán.
- `Senior` **Sếp muốn thêm loot box vì số liệu tốt. Anh phản hồi thế nào?**
  → Tôi nói rõ nó hiệu quả **vì** nó khai thác variable-ratio reward — đúng cơ chế của máy đánh bạc — và nêu ba chi phí thật: thiện cảm dài hạn, rủi ro pháp lý ở nhiều thị trường (nhiều nơi bắt công bố tỉ lệ hoặc cấm với người chưa thành niên), và rủi ro nền tảng. Rồi đề xuất phương án đạt cùng mục tiêu doanh thu mà không dùng cơ chế đó, để cuộc trao đổi có lối ra chứ không chỉ có lời từ chối.
- `Senior` **Game của anh phục vụ hai nhóm người chơi mâu thuẫn nhau. Anh xử lý ra sao?**
  → Chọn một nhóm chính và nói thẳng nhóm kia là phụ — rồi thiết kế cho nhóm phụ bằng **tuỳ chọn tách rời** thay vì bằng thoả hiệp ở giữa: chế độ độ khó, tắt được checklist, chế độ story. Thoả hiệp ở giữa cho ra game nhạt với cả hai; tuỳ chọn tách rời tốn thêm công nhưng giữ được cả hai trải nghiệm nguyên vẹn.
- `Senior` **Vì sao biết động lực lại đổi được cách đọc số liệu?**
  → Vì cùng một con số nghĩa khác nhau tuỳ động lực mình đang bán. Thời lượng phiên tăng ở game Mastery là tín hiệu tốt; ở game Submission có thể là dấu hiệu người chơi đang bị mắc kẹt trong nghĩa vụ. Không chốt động lực trước thì mọi chỉ số đều trông như "càng cao càng tốt", và đó là cách một đội tối ưu game của mình đi sai hướng trong sáu tháng.

**Khung trả lời 60 giây** — "Anh dựa vào gì để biết người chơi sẽ chơi tiếp?"

> Tôi bắt đầu từ **Self-Determination Theory** vì nó là cái gốc: competence, autonomy, relatedness. Phép thử tôi dùng hằng ngày rất thô — gỡ một hệ thống ra và hỏi nó phục vụ nhu cầu nào trong ba cái đó. Không trả lời được thì đó là mỡ thừa, và cắt nó rẻ hơn nuôi nó.
>
> Ở tầng chiến lược tôi dùng **Bartle** để kiểm tra độ phủ và **Quantic Foundry** để biết mình đang đứng ở đâu. Phần giá trị nhất của Quantic Foundry không phải danh sách động lực mà là các cặp **xung khắc**: Action kỵ Immersion, Mastery kỵ Completion. Nhồi cả hai vế vào một game là cách nhanh nhất để không ai thấy vừa ý.
>
> Và tôi giữ một ranh giới đạo đức rõ: variable-ratio reward, loot box, timer ép quay lại đều **hiệu quả về số liệu** và đều bào mòn thiện cảm — nhiều nơi giờ còn là vấn đề pháp lý. Tôi không coi việc chúng chạy tốt là lý lẽ kết thúc cuộc tranh luận.

**Họ sẽ đào tiếp**

- *"Competence khác 'cho người chơi mạnh lên' chỗ nào?"* → Mạnh lên là **chỉ số**, competence là **kỹ năng**. Dark Souls không cho bạn mạnh lên nhiều, nó làm bạn giỏi lên — và đó là lý do cảm giác chiến thắng ở đó lớn hơn hẳn game cho cộng chỉ số. Hệ quả thiết kế: nếu mọi thứ khó đều giải được bằng cày thêm thì game đang đổi competence lấy thời gian.
- *"Relatedness trong game single-player làm thế nào?"* → Với thế giới thay vì với người: NPC nhớ hành động của người chơi, thú cưng, căn cứ của riêng mình, hoặc dấu vết ẩn danh của người chơi khác. Ba thứ rẻ mà hiệu quả: bảng xếp hạng thử thách cùng seed, chia sẻ build bằng mã, và thống kê kiểu "12% người chơi chọn nhánh này".
- *"Bartle có lỗi thời không?"* → Nó ra đời cho MUD và mô tả hơi thô so với dữ liệu hiện đại, nhưng vẫn hữu ích như một **danh sách kiểm tra độ phủ** trong năm phút. Khi cần quyết định thật thì tôi dùng Quantic Foundry vì nó dựa trên hàng trăm nghìn người chơi và nói được cả phần xung khắc — thứ Bartle không có.
- *"Đo động lực của người chơi thật thì làm sao?"* → Không hỏi thẳng, vì người chơi mô tả sai lý do của chính họ. Nhìn hành vi: họ dành thời gian cho hoạt động nào, bỏ hoạt động nào ngay khi hết thưởng, và chỗ họ tự đặt mục tiêu riêng. Hoạt động mà người chơi làm khi **không có phần thưởng nào** là câu trả lời đáng tin nhất.

**Cờ đỏ**

- Thiết kế theo "game khác cũng có" mà không nói được nó phục vụ động lực nào.
- Cố phục vụ cả bốn nhóm Bartle như nhau trong một game nhỏ.
- Nhồi cả hai vế của một cặp xung khắc rồi ngạc nhiên vì review chia rẽ.
- Coi chỉ số giữ chân tăng là bằng chứng đủ, không nhìn cơ chế tạo ra nó.
- Gọi variable-ratio reward là "gamification" để tránh phải nói về đạo đức.

**Số / ví dụ nên thuộc**

- SDT ba nhu cầu: **competence · autonomy · relatedness**.
- Bartle bốn kiểu: **Achiever · Explorer · Socialiser · Killer**; chọn một chính, một phụ.
- Quantic Foundry: **12 động lực, 6 cặp** — Action, Social, Mastery, Achievement, Immersion, Creativity.
- Hai cặp xung khắc phải thuộc: **Action ⟂ Immersion**, **Mastery ⟂ Completion**.
- Phép thử một câu: hệ thống này phục vụ nhu cầu nào trong ba nhu cầu SDT?
