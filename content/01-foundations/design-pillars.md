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
