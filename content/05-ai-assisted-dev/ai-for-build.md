---
title: AI ở khâu hiện thực hoá
icon: 🔨
summary: Dùng AI để viết game — chia nhiệm vụ, kế hoạch trước code, và những chỗ bạn vẫn phải tự vào Editor.
status: deep
read: 96
level: basic
order: 7
tags: [ai-dev, code, workflow]
related: [ai-for-design, ai-for-publish, ai-workflow, agent-guardrails, architecture-patterns]
---

Đây là khâu AI mạnh nhất, và cũng là khâu dễ tạo ra **nợ kỹ thuật nhanh nhất** nếu làm sai cách.

## Xếp theo mức độ AI làm tốt

| Việc | Mức | Ghi chú |
|---|---|---|
| Thuật toán có định nghĩa rõ | ⭐⭐⭐ | A*, procgen, state machine — kiểm chứng được |
| Editor tool, validator | ⭐⭐⭐ | Không đụng gameplay nên rủi ro thấp |
| Unit test cho logic thuần | ⭐⭐⭐ | Nó viết test tốt hơn nhiều người |
| Boilerplate, refactor máy móc | ⭐⭐⭐ | Không cần bàn |
| Hệ thống có đặc tả số rõ | ⭐⭐ | Tốt nếu bạn đưa đủ số |
| Sửa bug từ triệu chứng cụ thể | ⭐⭐ | Tốt nếu bạn đưa bằng chứng, không đưa kết luận |
| Tích hợp nhiều hệ thống | ⭐ | Từng phần đúng, ghép lại hỏng |
| Tinh chỉnh cảm giác | ✗ | Nó không cảm nhận được |

**Thứ đáng chú ý:** hai dòng ⭐⭐⭐ ở giữa (editor tool và test) là hai việc lập trình viên hay làm sơ sài vì nhàm. Giao cho AI là đổi thời gian của bạn từ việc nhàm sang việc chỉ bạn làm được.

## Kích thước nhiệm vụ

Một nhiệm vụ tốt = **một commit, chạy được, kiểm chứng được**.

```
❌ "Làm hệ thống chiến đấu"
   → 2000 dòng, không chạy, không biết lỗi ở đâu

✅ "Thêm HealthComponent với API TakeDamage(amount, source),
    event OnDamaged/OnDeath, bất tử 0.5s sau khi trúng.
    Kèm unit test. Chưa cần UI."
   → một commit, bấm Play là biết đúng sai
```

Lý do ranh giới này quan trọng hơn nó trông: khi ba nhiệm vụ chồng lên nhau mà có lỗi, bạn không biết lỗi đến từ đâu và thường phải bỏ cả ba.

## Vòng lặp có một bước hay bị bỏ

```
1. BẠN   nhiệm vụ + tham chiếu node trong kho
2. AI    KẾ HOẠCH (file nào, API nào, rủi ro gì)   ← DỪNG. Đọc.
3. BẠN   duyệt hoặc sửa hướng
4. AI    viết code
5. BẠN   chạy thử trong game thật
6. BẠN   commit, hoặc mô tả lỗi cụ thể → về 4
```

**Bước 2 là bước tiết kiệm nhiều thời gian nhất và hay bị bỏ nhất.** Đọc kế hoạch mất 30 giây; đọc 300 dòng code sai hướng mất 20 phút.

Với nhiệm vụ lớn, nói thẳng: *"trình bày kế hoạch trước, chưa viết code, chờ tôi duyệt."*

## Debug — đưa bằng chứng, không đưa kết luận

```
❌ "Tôi nghĩ bug là do race condition, sửa giúp"
   → AI sẽ sửa theo giả thuyết của bạn, dù bạn đoán sai

✅ "Triệu chứng: nhân vật xuyên nền khi rơi nhanh.
    Tần suất ~1/20, chỉ khi velocity.y < -25.
    Đã thử giảm Fixed Timestep — giảm nhưng không hết.
    Đừng đoán. Liệt kê giả thuyết theo thứ tự khả năng, và với mỗi cái
    nói tôi cần kiểm tra gì. Chờ tôi báo kết quả."
```

Câu "chờ tôi báo kết quả" chặn được thói quen sửa-ngay-triệu-chứng. AI sửa ngay thường che nguyên nhân thật.

## Điểm mù — bốn thứ AI không tự biết mình sai

**Tích hợp.** Mỗi phần đúng, ghép lại hỏng. Chỉ lộ ra khi chạy thật.

**Hiệu năng.** Code sạch nhưng cấp phát trong vòng lặp mỗi frame. Xem [[performance]].

**Tương tác giữa hệ thống.** Thêm hệ thống mới làm hỏng cân bằng hệ thống cũ. Nó không thấy được điều đó.

**API lỗi thời.** Tri thức model có thời điểm cắt; engine cập nhật liên tục. Luôn nêu phiên bản chính xác.

## Kiểm soát phiên bản là phần của quy trình

Commit **trước** mỗi nhiệm vụ lớn. Nếu kết quả tệ, `git reset --hard` rẻ hơn nhiều so với gỡ rối thủ công — và đây là lý do nhiệm vụ nhỏ có giá trị kép: nó cũng là đơn vị hoàn tác.

## 🤖 Prompt cho AI

**Dùng AI thế nào cho việc viết code**

Bốn chế độ, mỗi chế độ một câu mở đầu khác nhau:

| Chế độ | Câu mở đầu | Khi nào |
|---|---|---|
| **Kế hoạch** | "Trình bày kế hoạch trước, chưa viết code" | Nhiệm vụ > 1 file |
| **Thực thi** | "[BỐI CẢNH]…[RÀNG BUỘC]…[ĐẦU RA]…" | Đã duyệt kế hoạch |
| **Chẩn đoán** | "Đừng đoán. Liệt kê giả thuyết…" | Có bug |
| **Rà soát** | "Rà thay đổi vừa rồi, đối chiếu CLAUDE.md" | Cuối phiên |

Chuyển chế độ giữa phiên là bình thường và nên làm. Dùng chế độ "thực thi" cho một bug là cách nhận về bản sửa che triệu chứng.

**Phải nêu rõ:**
- Phiên bản engine **chính xác** (không "Unity 6" mà `6000.0.32f1`)
- Kiến trúc hiện có: file nào đã tồn tại, quy ước gì
- Ràng buộc phủ định: KHÔNG dùng gì, KHÔNG đụng vào đâu
- Hành vi khi thất bại — chỗ AI hay bỏ trống nhất
- Đầu ra mong đợi: file nào, có test không, cần bạn làm gì tiếp

**Mẫu prompt — chế độ thực thi**

```
[BỐI CẢNH]
<engine + phiên bản chính xác>. Đã có: <các class liên quan>.
Quy ước: <asmdef, không GetComponent ngoài Awake, v.v.>

[MỤC TIÊU]
<một câu, mức hành vi quan sát được>

[RÀNG BUỘC]
- Logic thuần vào <đâu>, KHÔNG phụ thuộc engine
- Mọi hằng số vào <config asset>, KHÔNG hardcode
- KHÔNG cấp phát trong vòng lặp mỗi frame
- Hành vi khi thất bại: <nêu rõ>

[DỮ LIỆU]
<bảng số cụ thể>

[ĐẦU RA]
- File nào
- Unit test cho: <trường hợp thường + từng biên>
- Nói tôi cần thiết lập gì bằng tay
```

**Bẫy thường gặp:** bỏ dòng cuối. AI không thao tác được Editor nên nó phải **nói bạn cần làm gì** — thiếu dòng đó, code đúng mà chạy ra `NullReferenceException` vì field chưa gán.

## 🎮 Unity

Unity có một đặc thù làm thay đổi cách chia việc: **bạn phải vào Editor giữa mỗi bước**, và agent không vào được.

**Ranh giới cứng**

| Agent làm | Bạn làm |
|---|---|
| Viết script C# | Gắn component vào prefab |
| Viết ScriptableObject class | Tạo asset instance, gán giá trị |
| Viết editor tool | Chạy nó, đọc kết quả |
| Viết test EditMode | Xem test đỏ/xanh |
| Mô tả setting cần đổi | Đổi trong ProjectSettings |

Ràng buộc này nên nằm trong `CLAUDE.md` của Unity project:

```markdown
## Không được tự ý (Unity)
- Sửa .prefab / .unity / .asset bằng text → KHÔNG BAO GIỜ.
  Cần đổi thì MÔ TẢ cho tôi làm trong Editor.
- Sửa ProjectSettings → KHÔNG. Nói tôi setting nào cần đổi.
- Dùng Input.GetKey (Input Manager cũ) → dự án dùng Input System mới.
```

Dòng đầu quan trọng nhất: agent sửa prefab bằng text làm hỏng GUID reference, và lỗi chỉ lộ ra khi mở Editor — thường là vài commit sau.

**Cho agent một cách tự kiểm chứng**

```bash
Unity -batchmode -runTests -testPlatform EditMode \
      -projectPath . -testResults results.xml -quit
```

Agent chạy được lệnh này là nó tự biết code mình viết có pass test không. Đây là khác biệt lớn nhất giữa "agent viết code rồi bạn phát hiện lỗi" và "agent viết code rồi tự sửa". Xem [[unity-build-platform]].

**Ba lỗi Unity agent mắc lặp lại nếu không nêu**

1. **`rb.velocity`** — đổi tên thành `rb.linearVelocity` từ Unity 6. Bất kỳ API nào bị migration 6.0 chạm đến đều là ứng viên.
2. **`[SerializeField]` chưa gán** — code đúng, chạy null. Yêu cầu nó dùng `[RequireComponent]` hoặc kiểm tra trong `Awake` và log rõ.
3. **Layer/collision matrix** — nó không thấy được, nên va chạm không xảy ra mà code trông đúng. Ghi layer number vào `CLAUDE.md`.

**Kiểm tra nhanh**
- `git diff --stat` sau một phiên agent: có `.prefab`/`.unity` nào không? (phải không có)
- Agent chạy được test EditMode chưa?
- `CLAUDE.md` có ghi layer number và phiên bản chính xác chưa?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Việc lập trình nào AI làm tốt nhất trong gamedev?**
  → Bốn nhóm ba sao: **thuật toán có định nghĩa rõ** (A*, procgen, state machine — kiểm chứng được), **editor tool và validator** (không đụng gameplay nên rủi ro thấp), **unit test cho logic thuần**, và **boilerplate cùng refactor máy móc**. Điểm đáng chú ý: hai nhóm giữa là hai việc lập trình viên hay làm sơ sài vì nhàm.
- `Junior` **Việc nào AI làm kém nhất ở khâu hiện thực hoá?**
  → **Tích hợp nhiều hệ thống** — từng phần đúng, ghép lại hỏng — và **tinh chỉnh cảm giác**, thứ nó không làm được vì không cảm nhận được. Giữa hai cực đó là sửa bug (tốt nếu mình đưa bằng chứng chứ không đưa kết luận) và hệ thống có đặc tả số rõ (tốt nếu mình đưa đủ số).
- `Junior` **Một nhiệm vụ tốt để giao cho agent trông thế nào?**
  → **Một commit, chạy được, kiểm chứng được.** Ranh giới này quan trọng hơn nó trông: khi ba nhiệm vụ chồng lên nhau mà có lỗi thì không biết lỗi đến từ đâu, và thường phải bỏ cả ba. Chia theo **ranh giới kiểm chứng được**, không chia theo số dòng.
- `Mid` **Bước nào trong vòng lặp hay bị bỏ nhất, và vì sao nó đắt?**
  → **Đọc kế hoạch trước khi agent viết code.** Đọc kế hoạch mất 30 giây; đọc 300 dòng code sai hướng mất 20 phút — và tệ hơn, sau khi đã có 300 dòng thì tâm lý muốn "cứu" chúng thay vì bỏ đi. Với nhiệm vụ lớn tôi nói thẳng: "trình bày kế hoạch trước, chưa viết code, chờ tôi duyệt."
- `Mid` **Nhờ AI sửa bug thì cung cấp gì?**
  → **Bằng chứng, không đưa kết luận của mình**: log, hành vi quan sát được, các bước tái hiện. Rồi yêu cầu liệt kê giả thuyết kèm cách kiểm chứng **trước khi** sửa. Đưa kết luận sớm thì nó đi tìm bằng chứng ủng hộ kết luận đó; và agent sửa ngay thường sửa **triệu chứng** chứ không sửa nguyên nhân.
- `Mid` **Vì sao giao editor tool và test cho AI lại là một lựa chọn chiến lược?**
  → Vì đó là hai việc **rủi ro thấp** (không đụng gameplay) và **lập trình viên hay làm sơ sài vì nhàm**. Giao chúng đi là đổi thời gian của mình từ việc nhàm sang việc chỉ mình làm được — và tiện thể nâng chất lượng hai thứ vốn hay bị bỏ bê nhất trong dự án game.
- `Senior` **Khâu này dễ tạo nợ kỹ thuật nhanh nhất. Anh chặn bằng gì?**
  → Ba chốt. **Kích thước nhiệm vụ** một commit, kiểm chứng được. **Đọc kế hoạch trước khi có code.** Và **ngưỡng nhận**: không giải thích được đoạn code cho người khác thì không commit. Thêm một thứ về quy trình: **commit trước mỗi nhiệm vụ lớn**, vì `git reset` rẻ hơn gỡ rối thủ công rất nhiều.
- `Senior` **Chỗ nào anh vẫn phải tự vào Editor làm?**
  → Những việc **compile và test không kiểm chứng được**: gán tham chiếu Inspector, dựng scene, bake ánh sáng, và mọi quyết định cảm giác — đường cong nhảy, hitstop, độ rung camera. Đây cũng chính là danh sách vùng cấm nên viết thẳng vào file luật ở dạng câu lệnh, chứ không dặn miệng từng phiên.
- `Senior` **Tích hợp là điểm yếu — anh thiết kế quy trình thế nào để nó không dồn về cuối?**
  → Chia nhiệm vụ theo **lát cắt dọc** thay vì theo tầng: mỗi nhiệm vụ đi xuyên qua các tầng và chạy thật được, thay vì làm xong toàn bộ tầng dữ liệu rồi mới tới tầng UI. Như vậy lỗi tích hợp lộ ra ở nhiệm vụ thứ hai chứ không phải ở tuần cuối — cùng lý do vertical slice đứng trước bước nhân rộng.

**Khung trả lời 60 giây** — "Anh dùng AI để viết code game thế nào?"

> Đây là khâu AI mạnh nhất và cũng là khâu tạo **nợ kỹ thuật nhanh nhất** nếu làm sai. Tôi xếp việc theo mức nó làm tốt: thuật toán có định nghĩa rõ, editor tool và validator, unit test, boilerplate — bốn nhóm này giao được gần như hoàn toàn. Còn tích hợp nhiều hệ thống thì nó yếu, và tinh chỉnh cảm giác thì không làm được.
>
> Cách làm việc có ba chốt. **Kích thước nhiệm vụ**: một commit, chạy được, kiểm chứng được — chồng ba nhiệm vụ lên nhau thì khi lỗi không biết lỗi ở đâu. **Đọc kế hoạch trước khi có code** — ba mươi giây đổi lấy hai mươi phút. Và **commit trước mỗi nhiệm vụ lớn**, vì `git reset` rẻ hơn gỡ rối.
>
> Khi nhờ sửa bug, tôi đưa **bằng chứng chứ không đưa kết luận** — log, hành vi quan sát được, các bước tái hiện — và yêu cầu liệt kê giả thuyết kèm cách kiểm chứng trước khi sửa, vì sửa ngay thường là sửa triệu chứng. Ngưỡng cuối cùng của tôi: **không giải thích được đoạn code cho người khác thì không commit**.

**Họ sẽ đào tiếp**

- *"Vì sao nó viết test tốt hơn nhiều người?"* → Vì viết test là việc **đọc kỹ và liệt kê đều tay các trường hợp** — đúng thế mạnh của máy, và đúng chỗ con người chán rồi bỏ qua trường hợp biên. Điều kiện để nó làm tốt là logic đã tách khỏi engine; test cho code bám chặt MonoBehaviour thì nó cũng vật lộn như mình.
- *"Ba nhiệm vụ chồng nhau rồi có lỗi thì sao?"* → Thường phải **bỏ cả ba và làm lại từng cái**, vì không tách được thay đổi nào gây lỗi. Đó là lý do ranh giới một-commit không phải là sự sạch sẽ hình thức mà là **cách giới hạn thiệt hại**. Cùng nguyên lý với việc chỉ đổi một biến mỗi lần khi chạy eval.
- *"Kế hoạch thì yêu cầu trình bày cái gì?"* → File nào sẽ chạm, API mới nào sẽ thêm, cách tiếp cận và **lý do chọn nó thay vì phương án khác**, và cách kiểm chứng khi xong. Bốn mục đó đọc trong nửa phút và chặn được phần lớn sai hướng — nhất là mục thứ hai, vì nó lộ ra ngay khi agent định mở rộng phạm vi.
- *"Refactor thì giao thế nào cho an toàn?"* → Nêu rõ **hành vi không được đổi**, phạm vi file được chạm, và **test nào phải xanh sau khi xong**. Refactor là việc AI làm nhanh và cũng là việc nó dễ âm thầm đổi hành vi nhất, nên ranh giới "không đổi gì ngoài cấu trúc" phải viết ra chứ không ngầm hiểu.

**Cờ đỏ**

- Giao "làm hệ thống chiến đấu" rồi review 800 dòng một lượt.
- Không đọc kế hoạch, đi thẳng vào đọc code.
- Đưa kết luận của mình khi nhờ debug.
- Commit code không giải thích được.
- Để agent tự chạm vào scene, prefab, và số cân bằng.

**Số / ví dụ nên thuộc**

- Nhóm ba sao: **thuật toán rõ · editor tool/validator · unit test logic thuần · boilerplate/refactor máy móc**.
- Nhóm một sao và không: **tích hợp nhiều hệ thống** · **tinh chỉnh cảm giác**.
- Nhiệm vụ tốt = **một commit, chạy được, kiểm chứng được**.
- Đọc kế hoạch: **30 giây** đổi lấy **20 phút**.
- Ngưỡng commit: **giải thích được cho người khác**; và **commit trước** mỗi nhiệm vụ lớn.
