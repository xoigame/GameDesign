---
title: Perception & Senses
icon: 👁️
summary: Tầm nhìn, thính giác, trí nhớ — hệ thống làm cho AI vừa công bằng vừa trông có vẻ công bằng.
status: stub
read: 350
level: intermediate
order: 80
tags: [ai, npc, systems]
related: [fsm, behavior-tree, level-design]
---

Perception là thứ quyết định AI **cảm thấy** công bằng hay gian lận. Một AI đọc vị trí người chơi trực tiếp từ bộ nhớ sẽ luôn bị cảm nhận là ăn gian, dù cân bằng số liệu hoàn hảo.

## Cần bồi đắp

- [ ] Nón nhìn: góc, tầm xa, raycast che khuất, các mức độ nhận biết
- [ ] Thính giác: bán kính âm thanh theo loại hành động (đi bộ / chạy / bắn)
- [ ] Trí nhớ: vị trí cuối cùng nhìn thấy, thời gian quên, hành vi tìm kiếm
- [ ] Nhận thức nhóm: chia sẻ thông tin giữa các NPC và độ trễ lan truyền
- [ ] Chỉ báo cho người chơi: thanh cảnh giác, dấu chấm than, âm thanh báo động

## Ghi chú tạm

**Thang nhận biết thay cho công tắc.** Đừng dùng `canSeePlayer: bool`. Dùng một giá trị tích luỹ:

```
awareness += visibility × dt / time_to_detect     // 0 → 1
```

với `visibility` phụ thuộc khoảng cách, góc nhìn, ánh sáng, tư thế người chơi. Điều này cho người chơi **cửa sổ để phản ứng** — rút lui trước khi bị phát hiện hẳn — và đó chính là phần gameplay lén lút.

**Luôn hiển thị trạng thái nhận biết.** Người chơi cần biết mình đang bị chú ý tới mức nào. Không có chỉ báo, lén lút trở thành trò đoán mò.

**Trí nhớ tạo ra hành vi tìm kiếm.** NPC mất dấu nên đi tới vị trí cuối cùng nhìn thấy, tìm quanh đó vài giây, rồi mới quay về tuần tra. Hành vi này đơn giản về mặt kỹ thuật nhưng tạo ấn tượng thông minh rất mạnh — đúng tinh thần "sân khấu" ở [[game-ai]].

## 🤖 Prompt cho AI

Perception quyết định AI **cảm thấy** công bằng hay ăn gian. AI code mặc định sẽ đọc thẳng vị trí người chơi — phải cấm.

**Phải nêu rõ:**
- Cấm truy cập trực tiếp transform của người chơi trong logic quyết định
- Thông số nón nhìn, bán kính nghe, thời gian quên
- Thang nhận biết (không phải cờ bool)
- Chỉ báo hiển thị cho người chơi

**Mẫu prompt**

```
Hệ thống perception cho NPC.

RÀNG BUỘC CỨNG: logic quyết định (BT/FSM) KHÔNG được truy cập
player.transform trực tiếp. Chỉ được đọc blackboard do PerceptionSystem ghi.

Thị giác: nón 110 độ, tầm 18m, raycast kiểm tra che khuất.
Thính giác: bán kính theo hành động — đi bộ 4m, chạy 12m, bắn 35m.

Nhận biết là THANG [0..1], không phải bool:
  awareness += visibility * dt / time_to_detect
  visibility giảm theo khoảng cách, góc lệch, và tư thế người chơi (ngồi = 0.5)
  awareness giảm 0.25/giây khi mất tầm nhìn
Ngưỡng: 0.5 = nghi ngờ (quay đầu nhìn), 1.0 = phát hiện.

Trí nhớ: lưu lastKnownPos, tìm quanh đó 6 giây rồi mới về tuần tra.

Bắt buộc kèm: chỉ báo UI cho người chơi thấy awareness hiện tại,
và debug gizmo vẽ nón nhìn + giá trị awareness trên đầu mỗi NPC.
```

**Bẫy thường gặp:** AI viết `if (Vector3.Distance(transform.position, player.position) < 15) chase()`. Chạy đúng, nhưng NPC "nhìn xuyên tường" và người chơi cảm thấy bị lừa ngay lập tức.
