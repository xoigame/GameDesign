---
title: Agent Guardrails
icon: 🚧
summary: Rào chắn để AI agent không phá vỡ thiết kế — bất biến, phạm vi, và cách viết luật mà máy thi hành được.
status: deep
read: 130
level: basic
order: 40
tags: [ai-dev, safety, process]
related: [gdd-for-ai, design-pillars, ai-workflow]
---

Agent càng mạnh thì càng chủ động, và càng chủ động thì càng dễ "giúp" bạn theo hướng bạn không muốn. Guardrails là cách biến ý định thiết kế thành **luật kiểm tra được**.

## Ba loại rào chắn

**Bất biến thiết kế** — luật về game, không về code.
**Ràng buộc kỹ thuật** — luật về code.
**Giới hạn phạm vi** — những gì agent không được tự ý làm.

## Bất biến thiết kế

Viết dưới dạng **luật có thể vi phạm được**, không phải nguyện vọng. Mỗi luật nên kèm cách phát hiện vi phạm:

```markdown
## BẤT BIẾN — không được vi phạm nếu chưa hỏi tôi

INV-01  Không có RNG trong chiến đấu.
        Mọi sát thương tất định. Không crit, không miss, không damage range.
        Phát hiện: xuất hiện Random.* trong thư mục Combat/

INV-02  Một ván kết thúc trong 3 phút.
        Mọi hệ thống phải giải quyết xong trong khung này.
        Phát hiện: có cơ chế cần > 180s để hoàn thành một chu kỳ

INV-03  Người chơi không bị mất tiến trình vĩnh viễn.
        Chết không xoá vật phẩm đã mở khoá.
        Phát hiện: có lệnh xoá dữ liệu trong luồng xử lý cái chết

INV-04  Mọi sát thương có chỉ báo trước ít nhất 0.3s.
        Phát hiện: đòn tấn công nào có startup < 18 frames

INV-05  Tiến trình vĩnh viễn chỉ mở khoá LỰA CHỌN, không cộng SỨC MẠNH.
        Phát hiện: nâng cấp meta nào chạm vào chỉ số cơ bản
```

Dòng `Phát hiện:` là thứ biến nguyện vọng thành luật. Bạn có thể yêu cầu agent tự kiểm tra: *"rà toàn bộ thay đổi vừa rồi theo INV-01..05, báo cáo vi phạm."*

## Vì sao INV-05 cần tồn tại

Ví dụ này đáng chú ý vì nó minh hoạ đúng vấn đề: bạn nói *"làm roguelike có meta progression"*. Agent thêm "+5 HP vĩnh viễn mỗi lần mở khoá" — vì đó là mẫu phổ biến nhất trong dữ liệu huấn luyện. Nó không sai về mặt kỹ thuật, nhưng nó mâu thuẫn với [[progression]] của bạn.

**AI mặc định về giá trị trung bình của ngành.** Mọi thứ bạn muốn làm khác đi đều phải nói ra tường minh. Đây là quy luật chung, không phải ngoại lệ.

## Ràng buộc kỹ thuật

Đặt trong `CLAUDE.md` ở gốc repo để được đọc mỗi phiên:

```markdown
## Quy ước code — bắt buộc

- Unity 6, C#. KHÔNG dùng API đã deprecated.
- KHÔNG gọi GetComponent/Find trong Update hay FixedUpdate.
- KHÔNG cấp phát (new, LINQ, string concat) trong vòng lặp mỗi frame.
- Mọi hằng số cân bằng nằm trong ScriptableObject, KHÔNG hardcode.
- Một class một file, tên file trùng tên class.
- Hệ thống mới phải có unit test cho logic thuần (không phụ thuộc MonoBehaviour).

## Không được tự ý

- Thêm package/dependency mới → phải hỏi trước
- Đổi kiến trúc thư mục → phải hỏi trước
- Sửa file trong Assets/ThirdParty/ → không bao giờ
- Chỉnh số cân bằng "cho hợp lý" → không bao giờ, đó là quyết định của tôi
- Thêm tính năng không có trong yêu cầu → không bao giờ
```

## Giới hạn phạm vi

Đây là rào chắn hay thiếu nhất. Agent có xu hướng mở rộng phạm vi vì "làm cho trọn vẹn":

```markdown
## Phạm vi nhiệm vụ

Chỉ làm đúng những gì được yêu cầu.

Nếu phát hiện vấn đề ngoài phạm vi:
  → GHI CHÚ lại, KHÔNG tự sửa.

Nếu yêu cầu mơ hồ:
  → HỎI, đừng chọn giùm tôi.

Nếu cần vi phạm một bất biến để hoàn thành:
  → DỪNG, giải thích vì sao, chờ tôi quyết định.
```

Câu cuối quan trọng: đôi khi bất biến *nên* được sửa. Nhưng đó phải là quyết định có ý thức của bạn, không phải điều xảy ra âm thầm trong một lần refactor.

## Kiểm tra tự động

Guardrails mạnh nhất là loại máy tự chạy được. Nhiều bất biến chuyển thành test được:

```csharp
[Test]
public void INV01_KhongCoRandomTrongCombat() {
    var files = Directory.GetFiles("Assets/Scripts/Combat", "*.cs", SearchOption.AllDirectories);
    foreach (var f in files) {
        var src = File.ReadAllText(f);
        Assert.IsFalse(src.Contains("Random."), $"INV-01 bị vi phạm trong {f}");
    }
}

[Test]
public void INV04_MoiDonDanhCoTelegraphDuDai() {
    foreach (var atk in Resources.LoadAll<AttackData>("Attacks"))
        Assert.GreaterOrEqual(atk.startupFrames, 18,
            $"INV-04: {atk.name} có startup {atk.startupFrames}f < 18f");
}
```

Chạy trong CI thì bất biến được thi hành kể cả khi bạn quên nhắc agent. Đây là khoản đầu tư nhỏ với giá trị lớn khi dự án kéo dài.

## Danh sách kiểm tra sau mỗi phiên

- [ ] Code làm đúng thứ được yêu cầu — không hơn không kém
- [ ] Không bất biến nào bị vi phạm
- [ ] Không có dependency mới ngoài dự kiến
- [ ] Số cân bằng không bị "tiện tay chỉnh"
- [ ] Bạn hiểu được toàn bộ code vừa nhận
- [ ] Game vẫn chạy được (đã chạy thử, không chỉ build được)
- [ ] Nếu thiết kế thay đổi → tài liệu đã cập nhật (xem [[gdd-for-ai]])

## 🤖 Prompt cho AI

Guardrails chỉ có tác dụng khi agent **kiểm tra được** chúng. Hãy nhờ AI biến bất biến thành test.

**Mẫu prompt: sinh test từ bất biến**

```
Đọc design/invariants.md.

Với MỖI bất biến, viết một test tự động phát hiện vi phạm.
Nếu một bất biến không test tự động được, nói rõ và đề xuất cách
viết lại nó cho kiểm tra được.

Ví dụ mong đợi:
  INV-01 "không RNG trong combat"
    -> quét Assets/Scripts/Combat/**/*.cs tìm "Random."
  INV-04 "mọi đòn có telegraph >= 0.3s"
    -> duyệt mọi AttackData, assert startupFrames >= 18

Đặt trong Tests/Invariants/, chạy được trong CI.
```

**Mẫu prompt: rà soát cuối phiên**

```
Rà toàn bộ thay đổi bạn vừa thực hiện, đối chiếu design/invariants.md.

Báo cáo theo bảng: | bất biến | có vi phạm? | ở đâu | sửa thế nào |

Ngoài ra liệt kê:
- Dependency mới đã thêm (nếu có)
- Hằng số cân bằng bị hardcode (đáng lẽ phải nằm trong file dữ liệu)
- Tính năng bạn thêm mà tôi KHÔNG yêu cầu

Chưa sửa gì. Chỉ báo cáo.
```

**Bẫy thường gặp:** viết bất biến dạng nguyện vọng ("game phải công bằng"). Không kiểm tra được thì không phải bất biến. Mỗi luật cần một cột *"cách phát hiện vi phạm"*.

## 🎮 Unity

Trong Unity, guardrail mạnh nhất không phải lời nhắc — là **test EditMode chạy trong CI**.

**Bất biến → test, cho Unity**

```csharp
public class InvariantTests {

    // INV-01: không RNG trong combat
    [Test] public void INV01() {
        foreach (var f in Dir("Assets/Scripts/Core/Combat"))
            Assert.IsFalse(Src(f).Contains("Random."), $"INV-01: {f}");
    }

    // INV-02: Core không phụ thuộc UnityEngine
    // (asmdef noEngineReferences đã chặn ở compile, test này là lớp thứ hai)
    [Test] public void INV02() {
        var core = System.Reflection.Assembly.Load("Game.Core");
        Assert.IsFalse(core.GetReferencedAssemblies()
            .Any(a => a.Name.StartsWith("UnityEngine")));
    }

    // INV-03: không cấp phát trong hot path — kiểm tra bằng attribute đánh dấu
    [Test] public void INV03() {
        foreach (var f in Dir("Assets/Scripts"))
            foreach (var line in Lines(f))
                if (line.Contains("void Update()") || line.Contains("void FixedUpdate()"))
                    /* quét N dòng sau tìm new/LINQ/string concat */ ;
    }

    // INV-04: mọi đòn kẻ địch có telegraph >= 18 frame
    [Test] public void INV04() {
        foreach (var a in LoadAll<AttackData>().Where(x => x.isEnemyAttack))
            Assert.GreaterOrEqual(a.startupFrames, 18, a.name);
    }

    // INV-05: meta-progression chỉ mở khoá lựa chọn
    [Test] public void INV05() {
        foreach (var u in LoadAll<UnlockDef>())
            Assert.AreNotEqual(UnlockKind.StatBoost, u.kind, u.name);
    }
}
```

**Ràng buộc riêng cho Unity — viết vào `CLAUDE.md`**

```markdown
## Không được tự ý (Unity)

- Sửa file .prefab, .unity, .asset bằng text → KHÔNG BAO GIỜ.
  Cần đổi prefab thì mô tả cho tôi làm trong Editor.
- Sửa ProjectSettings/*.asset → KHÔNG. Nói tôi setting nào cần đổi.
- Thêm package vào manifest.json → hỏi trước.
- Đổi Assembly Definition references → hỏi trước.
- Dùng `Input.GetKey` (Input Manager cũ) → dự án dùng Input System mới.
- `GameObject.Find` / `FindObjectOfType` trong Update → không bao giờ.
- Đổi số cân bằng trong ScriptableObject → đó là quyết định của tôi.
```

Dòng đầu quan trọng nhất: agent sửa prefab bằng text làm hỏng GUID reference, và lỗi chỉ lộ ra khi mở Editor.

**Rà soát cuối phiên — thêm mục Unity**

```
Rà thay đổi vừa rồi, đối chiếu CLAUDE.md. Báo cáo bảng:
| bất biến | vi phạm? | file | cách sửa |

Thêm vào báo cáo:
- File .prefab/.unity/.asset nào bị sửa? (phải là 0)
- Package mới nào được thêm?
- API nào dùng mà có thể đã deprecated ở Unity 6?
- Component nào tôi cần gán trong Inspector để code này chạy?

Chưa sửa gì.
```

**Kiểm tra nhanh**
- Test EditMode chạy trong CI chưa?
- `git diff --stat` sau một phiên agent: có `.prefab`/`.unity` nào không?
- `CLAUDE.md` có khối "không được tự ý (Unity)" chưa?
