---
title: Randomness & RNG
icon: 🎲
summary: Input vs output randomness, pity system, shuffle bag — dùng ngẫu nhiên để tạo kịch tính chứ không tạo bất công.
status: stub
read: 210
level: intermediate
order: 60
tags: [systems, rng, math]
related: [balancing-math, procedural-generation, difficulty-curve]
---

## Phân biệt quan trọng nhất

**Input randomness** — ngẫu nhiên xảy ra *trước* quyết định của người chơi. Bài trên tay, bản đồ được sinh ra, vật phẩm được chào bán. Người chơi **thích nghi** với nó → tạo ra kỹ năng.

**Output randomness** — ngẫu nhiên xảy ra *sau* quyết định. Tỉ lệ trúng, sát thương dao động, crit. Người chơi **chịu đựng** nó → tạo ra ức chế.

Nguyên tắc: **ưu tiên input randomness.** Nếu dùng output randomness, hãy để nó ảnh hưởng tới mức độ tốt, đừng để nó quyết định thành/bại.

## Cần bồi đắp

- [ ] Pity system / bad-luck protection: công thức và ngưỡng
- [ ] Shuffle bag (random không lặp) so với random thuần
- [ ] Pseudo-random distribution kiểu DotA — tăng dần xác suất
- [ ] Seed cố định để tái hiện bug và làm daily challenge
- [ ] Ngẫu nhiên có trọng số và weighted table đọc được từ file dữ liệu

## Ghi chú tạm

**Người chơi cảm nhận ngẫu nhiên rất tệ.** Chuỗi 5 lần hụt liên tiếp với tỉ lệ trúng 80% xảy ra khá thường xuyên (~0.03% mỗi lượt 5 đòn, nghĩa là gặp hoài trong hàng nghìn lượt), nhưng ai cũng cho rằng game bị hỏng. Vì vậy random thuần hiếm khi là lựa chọn đúng.

Công thức pity đơn giản, dễ hiểu và dễ đưa cho AI:

```
p_thực_tế(n) = min(1, p_gốc + tăng_dần × số_lần_thất_bại_liên_tiếp)
```

Với XacSuat gốc 5% và tăng dần 3%: lần thất bại thứ 32 là chắc chắn trúng. Người chơi cảm thấy công bằng mà vẫn giữ được yếu tố bất ngờ.

Xem thêm [[procedural-generation]] cho ngẫu nhiên ở cấp độ nội dung.

## 🤖 Prompt cho AI

AI mặc định dùng `Random.value < p` cho mọi thứ. Đó là output randomness thuần — dạng gây ức chế nhất.

**Phải nêu rõ:**
- Chỗ nào dùng input randomness, chỗ nào (nếu có) dùng output randomness
- Có pity system không, công thức thế nào
- Seed: tất định hay không, dùng mấy bộ sinh riêng biệt
- Ngưỡng "xui liên tiếp" tối đa chấp nhận được

**Mẫu prompt**

```
Hệ thống ngẫu nhiên, ràng buộc cứng:

1. Chiến đấu TẤT ĐỊNH hoàn toàn. Không crit, không miss, không damage range.
   → mọi Random.* trong thư mục Combat/ là vi phạm.
2. Ngẫu nhiên chỉ ở INPUT: bài rút, vật phẩm được chào, bố cục phòng.
3. Drop table dùng pity: p_thực = min(1, p_gốc + 0.03 * số_lần_trượt_liên_tiếp)
   với p_gốc = 0.05 → chậm nhất lần thứ 32 chắc chắn trúng.
4. HAI bộ sinh số riêng: rngContent (seed cố định, cho procgen)
   và rngGameplay. Hành động người chơi KHÔNG được ảnh hưởng rngContent.
5. Mọi bộ sinh nhận seed; cùng seed cho ra kết quả giống hệt.

Viết lớp RngService thoả 5 điều trên, kèm test: cùng seed -> cùng chuỗi,
pity đạt trần đúng lần thứ 32, rngGameplay không đụng rngContent.
```

**Bẫy thường gặp:** dùng chung một `Random` toàn cục. Khi đó người chơi bắn thêm một phát là bố cục phòng kế tiếp đổi — không tái hiện được bug, không làm được daily challenge.
