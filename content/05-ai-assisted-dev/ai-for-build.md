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
