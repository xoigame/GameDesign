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

**Dùng AI thế nào để tự dựng rào chắn cho nó**

Nghe ngược nhưng hiệu quả: **nhờ agent biến bất biến của bạn thành test**, rồi test đó ràng buộc chính nó.

Ba việc theo thứ tự:

1. **Sinh test từ bất biến** — bạn viết luật bằng tiếng Việt, nó viết test phát hiện vi phạm. Nếu một luật không test tự động được, nó nói ra và đề nghị viết lại cho kiểm tra được.
2. **Rà soát cuối phiên** — đối chiếu thay đổi với `CLAUDE.md`, xuất bảng vi phạm. Chưa sửa gì.
3. **Đưa vào CI** — test chạy tự động, đỏ khi ai đó (kể cả agent) vi phạm.

Điểm mấu chốt: rào chắn **do máy thi hành** mạnh hơn rào chắn do bạn nhắc mỗi phiên. Bạn sẽ quên nhắc; CI thì không.

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

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Ba loại rào chắn cho AI agent là gì?**
  → **Bất biến thiết kế** — luật về game. **Ràng buộc kỹ thuật** — luật về code. **Giới hạn phạm vi** — những gì agent không được tự ý làm. Loại thứ ba hay thiếu nhất, vì agent có xu hướng mở rộng phạm vi để "làm cho trọn vẹn", và đó là lúc một PR sửa ba dòng biến thành một PR sửa ba mươi file.
- `Junior` **Một bất biến viết thế nào để nó là luật chứ không phải nguyện vọng?**
  → Phải viết ở dạng **có thể vi phạm được**, và mỗi luật kèm một dòng **cách phát hiện vi phạm**. Dòng "Phát hiện:" là thứ biến nguyện vọng thành luật — có nó thì mình yêu cầu được: "rà toàn bộ thay đổi vừa rồi theo INV-01..05 và báo cáo vi phạm". Không có nó thì luật chỉ là một câu trong tài liệu.
- `Junior` **Vì sao agent tự thêm "+5 HP vĩnh viễn mỗi lần mở khoá" dù không ai yêu cầu?**
  → Vì **AI mặc định về giá trị trung bình của ngành** — đó là mẫu phổ biến nhất trong dữ liệu huấn luyện. Nó không sai về kỹ thuật nhưng có thể mâu thuẫn với thiết kế tiến trình của mình. Quy luật chung: **mọi thứ mình muốn làm khác đi đều phải nói ra tường minh**, nếu không nó bị kéo về mặc định.
- `Mid` **Ràng buộc kỹ thuật nên đặt ở đâu, và vì sao?**
  → Ở **file luật tại gốc repo** mà agent đọc mỗi phiên. Lý do: nó đi cùng code trong cùng một PR nên review được, nó chạy được trong CI, và nó không trôi khỏi dự án như tài liệu ở nơi khác. Ràng buộc nằm trong đầu người hoặc trong chat lịch sử thì chỉ có tác dụng tới cuối phiên đó.
- `Mid` **Giới hạn phạm vi cụ thể gồm những gì?**
  → Những việc agent **không được tự ý làm**: thêm dependency, đổi số cân bằng, sửa file tự sinh, đổi cấu trúc thư mục, sửa bất biến. Quan trọng là câu kèm theo: đôi khi bất biến *nên* được sửa — nhưng đó phải là quyết định **có ý thức của người**, không phải điều xảy ra âm thầm trong một lần refactor.
- `Mid` **Guardrail mạnh nhất là loại nào?**
  → Loại **máy tự chạy được**. Nhiều bất biến chuyển thành test được, và chạy trong CI thì chúng được thi hành **kể cả khi mình quên nhắc agent**. Đây là khoản đầu tư nhỏ với giá trị lớn khi dự án kéo dài — vì trí nhớ của người và của phiên chat đều hết hạn, còn test thì không.
- `Senior` **Danh sách kiểm sau mỗi phiên làm việc với agent gồm gì?**
  → Code làm **đúng thứ được yêu cầu, không hơn không kém**; không bất biến nào bị vi phạm; không dependency mới ngoài dự kiến; **số cân bằng không bị tiện tay chỉnh**; mình hiểu được toàn bộ code vừa nhận; game **vẫn chạy được** (đã chạy thử, không chỉ build được); và nếu thiết kế thay đổi thì tài liệu đã cập nhật.
- `Senior` **"Mình hiểu được toàn bộ code vừa nhận" — vì sao đây là mục bắt buộc?**
  → Vì code không ai hiểu là **nợ không có lãi suất công bố**: nó chạy cho tới ngày cần sửa, và lúc đó chi phí rơi vào người khác hoặc vào chính mình sáu tháng sau. Nếu không hiểu thì hai lựa chọn đúng là bắt agent giải thích và đơn giản hoá, hoặc từ chối nhận — chứ không phải merge rồi hy vọng.
- `Senior` **Agent đề xuất sửa một bất biến vì nó cản việc. Anh xử lý thế nào?**
  → Coi đó là **tín hiệu hữu ích**, không phải yêu cầu được duyệt. Tôi hỏi ba câu: bất biến này bảo vệ điều gì, tính năng đang cần có xứng với việc mất điều đó không, và có cách nào đạt mục tiêu mà giữ được bất biến không. Nếu vẫn sửa thì **ghi rõ lý do vào tài liệu** cùng ngày — bất biến bị bào mòn lặng lẽ là cách một game trôi dạt thành mớ tính năng chắp vá.

**Khung trả lời 60 giây** — "Anh giữ cho agent không phá vỡ thiết kế bằng cách nào?"

> Bằng cách biến ý định thiết kế thành **luật kiểm tra được**, chia ba loại: bất biến thiết kế, ràng buộc kỹ thuật, và giới hạn phạm vi. Loại thứ ba hay thiếu nhất — agent luôn có xu hướng mở rộng phạm vi để "làm cho trọn vẹn".
>
> Điểm mấu chốt ở cách viết: mỗi bất biến phải **có thể vi phạm được** và kèm một dòng **cách phát hiện**. Dòng đó biến một nguyện vọng thành một luật, vì nó cho phép tôi yêu cầu agent tự rà và báo cáo vi phạm. Còn "hãy giữ thiết kế nhất quán" thì không kiểm được gì.
>
> Và guardrail mạnh nhất là loại **máy tự chạy**: chuyển bất biến thành test rồi chạy trong CI, để chúng được thi hành kể cả khi tôi quên nhắc. Cuối mỗi phiên tôi chạy một danh sách kiểm ngắn: đúng phạm vi, không vi phạm bất biến, không dependency mới, **số cân bằng không bị tiện tay chỉnh**, tôi hiểu hết code vừa nhận, và game thật sự chạy chứ không chỉ build được.

**Họ sẽ đào tiếp**

- *"Vì sao 'số cân bằng không bị tiện tay chỉnh' lại là một mục riêng?"* → Vì nó là thay đổi **im lặng nhất** trong mọi thay đổi: không lỗi biên dịch, không test đỏ, và diff nhìn vô hại. Nhưng nó phá đúng thứ tốn nhiều công nhất để đạt được. Nên nó xứng đáng có một dòng riêng, và lý tưởng hơn là một test khoá các giá trị then chốt.
- *"Bất biến nào chuyển thành test được?"* → Phần lớn bất biến về **dữ liệu và cấu trúc**: không có chỉ số cộng vĩnh viễn trong bảng mở khoá, mọi id tham chiếu tồn tại, không file nào trong vùng cấm bị đổi, không dependency ngoài danh sách. Bất biến về **cảm giác** thì không, và đó chính là ranh giới giữa thứ giao được cho CI và thứ phải giữ cho con người.
- *"Agent không đọc file luật thì sao?"* → Thì file luật đang quá dài hoặc quá mơ hồ. Cách chữa thực dụng: đưa các luật cứng lên đầu ở dạng **câu lệnh ngắn**, để phần giải thích xuống dưới, và có một mục lục để agent tự chọn phần cần mở. Luật viết như một bài luận thì bị đọc lướt — đúng như với người mới vào dự án.
- *"Rào chắn có làm chậm công việc không?"* → Có ở giai đoạn dựng, và tiết kiệm về sau — cùng dạng đánh đổi với test. Cách giữ chi phí thấp là chỉ đặt bất biến cho những thứ **đắt khi sai**: kinh tế, save, tiến trình, ranh giới kiến trúc. Đặt bất biến cho mọi thứ thì không ai đọc, và lúc đó nó thành trang trí.

**Cờ đỏ**

- Bất biến viết ở dạng nguyện vọng: "giữ cho game cân bằng".
- Không có dòng "cách phát hiện vi phạm".
- Không có giới hạn phạm vi, agent tự thêm dependency và đổi cấu trúc.
- Không có kiểm tra tự động nào, mọi thứ dựa vào việc người nhớ nhắc.
- Merge code mình không hiểu vì "nó chạy được".

**Số / ví dụ nên thuộc**

- Ba loại rào chắn: **bất biến thiết kế · ràng buộc kỹ thuật · giới hạn phạm vi**.
- Mỗi bất biến phải có **cách phát hiện vi phạm**; đánh mã kiểu **INV-01…INV-05**.
- Guardrail mạnh nhất = **test chạy trong CI**.
- Quy luật nền: **AI mặc định về trung bình của ngành** — mọi thứ khác đi phải nói tường minh.
- Danh sách kiểm cuối phiên: đúng phạm vi · không vi phạm bất biến · không dependency mới · **số cân bằng nguyên vẹn** · hiểu hết code · game chạy được.
