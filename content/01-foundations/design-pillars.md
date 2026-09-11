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
