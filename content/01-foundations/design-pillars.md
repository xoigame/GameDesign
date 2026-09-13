---
title: Design Pillars
icon: 🏛️
summary: Ba câu định nghĩa game của bạn — công cụ ra quyết định, và là thứ đầu tiên AI agent cần đọc.
status: deep
read: 30
level: basic
order: 10
tags: [foundations, pillar, process]
related: [core-loop, gdd-for-ai, genre-conventions]
---

**Design pillars** là 2–4 câu ngắn định nghĩa game của bạn *là gì* và *không là gì*. Chúng tồn tại để trả lời một loại câu hỏi duy nhất: *"có nên thêm tính năng X không?"*

## Một pillar tốt trông như thế nào

Pillar dở — đúng nhưng vô dụng:

> ❌ "Game phải vui." · "Đồ hoạ đẹp." · "Chiến đấu hấp dẫn."

Vô dụng vì không loại bỏ được gì. Không tính năng nào bị chúng bác bỏ.

Pillar tốt — **có khả năng nói KHÔNG**:

> ✅ "Mỗi cái chết phải là lỗi của người chơi, không bao giờ là do hên xui."
> → bác bỏ: crit ngẫu nhiên, quái spawn sau lưng, damage roll.

> ✅ "Người chơi luôn hiểu được vì sao mình thua trong vòng 2 giây."
> → bác bỏ: buff ẩn, sát thương theo thời gian không có chỉ báo, combo quái quá rối.

> ✅ "Một ván kéo dài dưới 3 phút."
> → bác bỏ: cắt cảnh, đường chạy dài, hồi máu chậm.

Kiểm tra: **nếu pillar không giết được ít nhất một tính năng bạn từng muốn làm, nó chưa phải pillar.**

## Viết như thế nào

1. Chơi 3 game gần nhất với ý tưởng của bạn. Viết ra điều **duy nhất** bạn muốn làm khác đi.
2. Diễn đạt thành câu khẳng định về *trải nghiệm người chơi*, không phải về tính năng. "Người chơi cảm thấy…" chứ không phải "Game có…".
3. Giới hạn ở 3 câu. Bốn là nhiều rồi. Năm nghĩa là bạn chưa quyết định gì cả.
4. Với mỗi pillar, viết kèm **danh sách những gì nó loại trừ**. Phần này quan trọng ngang phần khẳng định.

## Dùng làm bộ lọc

Khi có ý tưởng mới, đối chiếu:

- Củng cố pillar → làm.
- Trung tính → cắt (độ phức tạp có giá, sự trung tính thì không).
- Mâu thuẫn pillar → cắt, hoặc sửa pillar một cách có ý thức và ghi lại lý do.

Việc sửa pillar không sai. Sửa *lặng lẽ* mới sai — đó là lúc game bắt đầu trôi dạt thành một mớ tính năng chắp vá.

## 🤖 Prompt cho AI

Đây là **phần context có giá trị cao nhất** bạn đưa cho Codex/Claude. Không có pillar, AI mặc định chọn phương án generic nhất trong dữ liệu huấn luyện của nó — nghĩa là game của bạn sẽ giống mọi tutorial trên YouTube.

Đặt ngay đầu [[gdd-for-ai]]:

```markdown
## Design Pillars (bất khả xâm phạm)

1. **Không có ngẫu nhiên trong chiến đấu.**
   Mọi sát thương đều tất định. KHÔNG crit, KHÔNG miss, KHÔNG damage range.
   Nếu một đề xuất cần RNG trong combat → từ chối và nói rõ lý do.

2. **Một ván dưới 3 phút.**
   Mọi hệ thống phải giải quyết xong trong khung thời gian này.

3. **Người chơi hiểu nguyên nhân thất bại trong 2 giây.**
   Mọi sát thương phải có chỉ báo hình ảnh trước đó ít nhất 0.3s.
```

Dòng *"nếu một đề xuất cần RNG → từ chối"* là mấu chốt: nó biến pillar từ lời mô tả thành **một luật mà agent có thể thi hành**. Xem [[agent-guardrails]].

## 🎮 Unity

Pillars chỉ có tác dụng khi **máy kiểm tra được**. Trong Unity, biến pillar thành test là việc một buổi chiều và nó chặn trôi dạt suốt dự án.

**Nơi pillars sống trong project**

- `CLAUDE.md` ở gốc repo — để AI agent đọc mỗi phiên
- `Assets/Tests/EditMode/PillarTests.cs` — test cưỡng chế
- `Assets/Editor/PillarValidator.cs` — quét asset

**Pillar → test**

```csharp
// Pillar: "Không có ngẫu nhiên trong chiến đấu"
[Test]
public void Pillar_KhongRngTrongCombat() {
    var files = Directory.GetFiles("Assets/Scripts/Combat", "*.cs", SearchOption.AllDirectories);
    foreach (var f in files) {
        var src = File.ReadAllText(f);
        Assert.IsFalse(Regex.IsMatch(src, @"\bRandom\."),
            $"Pillar 1 bị vi phạm: {f} dùng Random");
    }
}

// Pillar: "Người chơi hiểu nguyên nhân thất bại trong 2 giây"
[Test]
public void Pillar_MoiDonCoTelegraph() {
    foreach (var atk in AssetDatabase.FindAssets("t:AttackData")
             .Select(g => AssetDatabase.LoadAssetAtPath<AttackData>(AssetDatabase.GUIDToAssetPath(g)))) {
        if (!atk.isEnemyAttack) continue;
        Assert.GreaterOrEqual(atk.startupFrames, 18,
            $"Pillar 3: {atk.name} có startup {atk.startupFrames}f < 18f (0.3s)");
    }
}

// Pillar: "Một ván dưới 3 phút"
[Test]
public void Pillar_MatchDuoi3Phut() {
    foreach (var lvl in LoadAll<LevelData>())
        Assert.Less(lvl.EstimatedSeconds, 180f, $"Pillar 2: {lvl.name} dự kiến {lvl.EstimatedSeconds}s");
}
```

Ba test này chạy trong mili giây và chúng **không cho phép trôi dạt lặng lẽ**. Đây là điều khiến pillar khác một câu khẩu hiệu.

**Chạy trong CI**

```yaml
- run: |
    Unity -batchmode -runTests -testPlatform EditMode \
          -projectPath . -testResults results.xml
```

CI đỏ khi ai đó (kể cả AI agent) vi phạm pillar. Xem [[unity-build-platform]] về CI cho Unity.

**Bẫy Unity cụ thể**
- **Test quét chuỗi dễ báo nhầm** — comment có chữ `Random.` cũng bị bắt. Loại comment trước khi quét, hoặc chấp nhận và whitelist.
- **`AssetDatabase` chỉ dùng được trong Editor** — test này phải ở `Tests/EditMode/`, không PlayMode.

**Kiểm tra nhanh**
- Cố tình thêm `Random.value` vào `Combat/`: test có đỏ không?
- Test pillar chạy dưới 1 giây chứ?
- CI có chạy test EditMode không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Design pillar là gì? Cho một ví dụ tốt và một ví dụ tệ.**
  → Là 2–4 câu ngắn định nghĩa game **là gì và không là gì**, tồn tại để trả lời một loại câu hỏi: "có nên thêm tính năng X không?". Tệ: "Game phải vui" — không bác bỏ được gì. Tốt: "Mỗi cái chết phải là lỗi của người chơi, không bao giờ do hên xui" — nó bác bỏ crit ngẫu nhiên, quái spawn sau lưng, damage roll.
- `Junior` **Phép thử một câu để biết pillar đã đủ sắc chưa?**
  → **Nếu pillar không giết được ít nhất một tính năng bạn từng muốn làm, nó chưa phải pillar.** Đó là lý do mỗi pillar phải viết kèm **danh sách những gì nó loại trừ** — phần loại trừ quan trọng ngang phần khẳng định, và là phần duy nhất dùng được khi tranh luận.
- `Junior` **Viết pillar về trải nghiệm hay về tính năng?**
  → Về **trải nghiệm người chơi**: "Người chơi cảm thấy…", không phải "Game có…". Viết theo tính năng thì pillar hết tác dụng ngay khi tính năng đó đổi, và nó không giúp quyết định gì về những tính năng khác. Viết theo trải nghiệm thì nó còn dùng được suốt dự án.
- `Mid` **Có ý tưởng mới, anh dùng pillar để lọc thế nào?**
  → Ba nhánh: **củng cố** pillar thì làm; **trung tính** thì cắt — độ phức tạp có giá còn sự trung tính thì không mang lại gì; **mâu thuẫn** thì cắt, hoặc sửa pillar một cách có ý thức và ghi lại lý do. Nhánh giữa là nhánh khó nhất vì ai cũng muốn giữ những thứ "cũng hay mà".
- `Mid` **Bao nhiêu pillar là vừa? Vì sao?**
  → Ba. Bốn là nhiều rồi, **năm nghĩa là chưa quyết định gì cả** — càng nhiều pillar thì càng ít thứ bị loại, mà loại bỏ mới là công dụng duy nhất của chúng. Danh sách năm câu đẹp đẽ thường là danh sách mong muốn chứ không phải bộ lọc.
- `Mid` **Sửa pillar giữa dự án có được không?**
  → Được, và đôi khi bắt buộc. Cái sai không phải là sửa mà là **sửa lặng lẽ**: pillar trôi dần theo từng quyết định nhỏ mà không ai tuyên bố, và game biến thành một mớ tính năng chắp vá. Sửa đúng cách là nêu rõ pillar cũ bị thay bởi cái gì, vì sao, và những gì đã quyết theo pillar cũ có phải xem lại không.
- `Senior` **Viết pillar cho một dự án mới, anh bắt đầu từ đâu?**
  → Chơi 3 game gần nhất với ý tưởng, rồi viết ra điều **duy nhất** mình muốn làm khác đi — pillar sinh ra từ một khác biệt cụ thể, không sinh ra từ trang giấy trắng. Sau đó diễn đạt thành câu về trải nghiệm, giới hạn ở ba câu, và với mỗi câu viết kèm danh sách loại trừ.
- `Senior` **Sếp muốn thêm một tính năng mâu thuẫn pillar. Anh xử lý thế nào?**
  → Không tranh luận về tính năng mà đưa **danh sách loại trừ** ra: tính năng này nằm trong danh sách mình đã thống nhất bỏ, và đây là những quyết định khác đã được ra dựa trên pillar đó. Rồi hỏi: ta đổi pillar, hay đổi tính năng? Câu hỏi đó biến một cuộc cãi nhau về sở thích thành một quyết định có phạm vi.
- `Senior` **Pillar liên quan gì tới việc làm game cùng AI agent?**
  → Pillar là **thứ đầu tiên agent cần đọc**, vì nó là ràng buộc cứng mà agent không suy ra được từ code. Không có nó thì agent tối ưu theo mặc định của thể loại và đề xuất đúng những thứ pillar muốn loại. Viết kèm danh sách loại trừ ở dạng câu lệnh là cách rẻ nhất để agent từ chối đúng chỗ.

**Khung trả lời 60 giây** — "Pillar tốt khác pillar dở ở chỗ nào?"

> Ở **khả năng nói không**. "Game phải vui", "đồ hoạ đẹp", "chiến đấu hấp dẫn" đều đúng và đều vô dụng, vì không tính năng nào bị chúng bác bỏ. Pillar dùng được thì kèm được một danh sách những thứ nó giết: "mỗi cái chết phải là lỗi của người chơi" bác bỏ crit ngẫu nhiên, quái spawn sau lưng, damage roll.
>
> Nên khi viết, tôi luôn viết đôi: một câu khẳng định về **trải nghiệm** — "người chơi cảm thấy…", không phải "game có…" — và ngay dưới là danh sách loại trừ. Phần loại trừ mới là phần được dùng tới trong các cuộc họp.
>
> Giới hạn ba câu. Bốn là nhiều, năm nghĩa là chưa quyết định gì. Và khi một ý tưởng mới tới, ba nhánh: củng cố thì làm, trung tính thì **cắt** — vì độ phức tạp có giá còn trung tính thì không — mâu thuẫn thì cắt hoặc sửa pillar một cách có ý thức, kèm lý do ghi lại.

**Họ sẽ đào tiếp**

- *"Vì sao trung tính lại cắt?"* → Vì mọi tính năng đều có chi phí: thời gian làm, thời gian QA, thời gian dạy người chơi, và diện tích trên màn hình. Tính năng trung tính trả chi phí đó mà không mua lại gì. Cắt nó là quyết định rẻ nhất trong dự án, và cũng là quyết định khó thuyết phục nhất vì không ai ghét nó.
- *"Pillar và USP có phải một không?"* → Không. USP là thứ nói với **người mua**, pillar là thứ nói với **đội làm**. Chúng có thể trùng nhau nhưng mục đích khác: USP phải hấp dẫn, pillar phải sắc. Một pillar tốt có thể nghe rất chán trong trailer mà vẫn làm đúng việc của nó.
- *"Đội không đồng ý về pillar thì sao?"* → Đó là dấu hiệu tốt: bất đồng đang lộ ra ở tháng thứ nhất thay vì ở tháng thứ tám. Cách gỡ nhanh là bỏ tranh luận trừu tượng và đưa ra một danh sách **năm tính năng cụ thể**, hỏi từng người giữ hay bỏ. Bất đồng thật luôn nằm ở danh sách loại trừ, không nằm ở câu khẳng định.
- *"Làm sao biết pillar đang bị bỏ quên?"* → Nhìn các quyết định gần nhất và hỏi cái nào đã bị bác bỏ nhờ pillar. Ba tháng không bác bỏ được gì nghĩa là pillar đã thành trang trí — hoặc vì nó quá mềm, hoặc vì không ai mở nó ra nữa. Cả hai đều cần xử lý, và cả hai đều rẻ khi phát hiện sớm.

**Cờ đỏ**

- Pillar là tính từ: "vui", "đẹp", "hấp dẫn".
- Không có danh sách loại trừ đi kèm.
- Năm hay sáu pillar, mỗi cái một hướng.
- Pillar nói về tính năng thay vì về trải nghiệm.
- Pillar trôi dần qua từng quyết định nhỏ mà không ai tuyên bố.

**Số / ví dụ nên thuộc**

- **2–4 câu**, lý tưởng là 3; năm là chưa quyết định gì.
- Phép thử: pillar phải **giết được ít nhất một tính năng** mình từng muốn làm.
- Ba nhánh lọc: củng cố → làm · trung tính → **cắt** · mâu thuẫn → cắt hoặc sửa pillar có ghi lý do.
- Ví dụ thuộc lòng: "Mỗi cái chết là lỗi của người chơi" → bác bỏ crit ngẫu nhiên, quái spawn sau lưng, damage roll.
- Dạng câu đúng: "Người chơi cảm thấy…" chứ không phải "Game có…".
