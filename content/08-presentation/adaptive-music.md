---
title: Adaptive Music
icon: 🎵
summary: Nhạc thay đổi theo trạng thái game — vertical layering, horizontal resequencing, và bài toán chuyển mượt.
status: deep
read: 410
level: advanced
order: 80
tags: [presentation, audio, music]
related: [audio-implementation, ai-director, pacing, difficulty-curve]
---

Nhạc tĩnh lặp mãi một track sẽ bị người chơi tắt sau vài giờ. Adaptive music làm nhạc **phản ứng với những gì đang xảy ra** — và khi làm đúng, nó là công cụ điều tiết cảm xúc mạnh nhất bạn có.

## Hai kỹ thuật nền

**Vertical layering (phân lớp dọc)** — nhiều track phát *đồng thời*, bật/tắt từng lớp:

```
Lớp 4  Trống dồn + brass      ← chỉ khi boss máu < 30%
Lớp 3  Trống nhịp             ← khi đang chiến đấu
Lớp 2  Bass + đệm             ← khi có kẻ địch gần
Lớp 1  Nền pad                ← luôn phát
```

Mọi lớp phát cùng lúc từ đầu, chỉ thay đổi **âm lượng**. Vì tất cả cùng timeline nên chuyển lớp **luôn khớp nhịp** — không bao giờ lệch phách. Đây là kỹ thuật dễ nhất và nên bắt đầu từ đây.

Chi phí: tốn bộ nhớ và voice (mọi lớp luôn decode), và phải sáng tác sao cho mọi tổ hợp lớp đều nghe được.

**Horizontal resequencing (nối ngang)** — các đoạn nhạc khác nhau nối tiếp nhau:

```
Khám phá  →  [điểm chuyển]  →  Chiến đấu  →  [đoạn kết]  →  Yên bình
```

Linh hoạt hơn về mặt sáng tác, nhưng khó: phải chờ tới **điểm chuyển hợp lệ** (thường cuối ô nhịp hoặc cuối câu nhạc) mới đổi được, nên có độ trễ 1–4 giây.

Thực tế hay dùng **kết hợp cả hai**: layering cho phản ứng nhanh, resequencing cho đổi bối cảnh lớn.

## Bài toán chuyển mượt

Đây là phần khó nhất. Ba giải pháp, từ đơn giản tới phức tạp:

| Cách | Độ trễ | Chất lượng |
|---|---|---|
| Crossfade thẳng | 0 | Nghe được, nhưng lệch nhịp nếu hai đoạn khác tempo |
| Chờ cuối ô nhịp | ≤ 1 ô | Khớp nhịp, độ trễ chấp nhận được |
| Stinger + chuyển | ~1 ô | Tốt nhất — một đoạn ngắn che chỗ nối |

**Stinger** là đoạn nhạc ngắn (1–2 giây) phát đè lên lúc chuyển, làm tai không nhận ra chỗ nối. Rẻ và hiệu quả.

Muốn chờ đúng nhịp thì hệ thống phải biết **tempo và số phách mỗi ô** của từng track — khai trong dữ liệu, đừng đoán.

## Nối với trạng thái game

Nhạc adaptive cần một **nguồn tín hiệu**, và [[ai-director]] là nguồn tự nhiên nhất. Nếu bạn đã có chỉ số `intensity` 0–1, hãy ánh xạ thẳng:

```
intensity 0.0-0.2  → chỉ lớp 1
intensity 0.2-0.5  → lớp 1+2
intensity 0.5-0.8  → lớp 1+2+3
intensity 0.8-1.0  → tất cả
```

**Quan trọng: thêm hysteresis.** Intensity dao động quanh 0.5 sẽ khiến lớp 3 bật tắt liên tục, nghe như lỗi. Vào lớp 3 ở 0.5, thoát ở 0.35. Cùng nguyên lý chống dao động ở [[behavior-tree]].

Ngoài ra nên có **thời gian tối thiểu giữ một trạng thái** (4–8 giây) — nhạc đổi quá nhanh gây mệt dù mỗi lần chuyển đều mượt.

## Nhạc như một chỉ báo gameplay

Đây là phần bị đánh giá thấp: nhạc **truyền thông tin**.

- Lớp trống vào = có kẻ địch bạn chưa thấy
- Nhạc dừng đột ngột = sắp có gì đó (xem [[pacing]])
- Motif riêng cho từng boss = người chơi biết gặp ai trước khi nhìn thấy

Khi nhạc đáng tin cậy về mặt thông tin, người chơi học dùng nó — và game trở nên dễ đọc hơn mà không thêm một pixel UI nào.

## Cân nhắc trước khi làm

Adaptive music **tốn công sáng tác gấp nhiều lần** nhạc tuyến tính: mọi tổ hợp lớp phải nghe được, mọi điểm chuyển phải mượt.

Nếu ngân sách hạn chế, thứ tự ưu tiên thực dụng:
1. **Một track hay, lặp tốt, có đoạn lặng** — đã hơn hẳn không có gì
2. **Hai trạng thái (yên bình / chiến đấu) + stinger** — 80% giá trị với 20% công sức
3. Layering đầy đủ
4. Resequencing động

Đừng bắt đầu từ mục 4.

## 🤖 Prompt cho AI

AI **không sáng tác được nhạc dùng được cho game** và không nghe được kết quả. Việc của nó ở đây là **hệ thống điều phối**: theo dõi nhịp, chờ điểm chuyển, quản lý lớp, hysteresis.

**Phải nêu rõ:**
- Tempo (BPM) và số phách mỗi ô của từng track — hệ thống không đoán được
- Ngưỡng vào/ra cho từng lớp (hai số khác nhau, không phải một)
- Thời gian giữ tối thiểu mỗi trạng thái
- Nguồn tín hiệu: intensity lấy từ đâu

**Mẫu prompt**

```
Dựng AdaptiveMusicSystem cho <engine + phiên bản>.

Kỹ thuật: vertical layering + stinger khi đổi bối cảnh.

Track config (JSON, KHÔNG hardcode):
  bpm: 120, beatsPerBar: 4
  layers: [ambient, bass, drums, brass]   // 4 AudioSource, cùng timeline

Ánh xạ intensity -> lớp, CÓ HYSTERESIS (vào / ra):
  bass   0.20 / 0.12
  drums  0.50 / 0.35
  brass  0.80 / 0.65

Ràng buộc:
- Mọi lớp phát đồng thời từ t=0, CHỈ đổi volume. Không Play/Stop từng lớp
  (Play lại sẽ lệch timeline).
- Fade lớp 0.8s, đường cong equal-power, KHÔNG tuyến tính.
- Giữ tối thiểu 6s mỗi trạng thái trước khi cho đổi tiếp.
- Đổi bối cảnh (explore <-> combat): chờ tới cuối ô nhịp hiện tại rồi mới
  crossfade, phát stinger đè lên. Tính thời điểm từ bpm/beatsPerBar,
  KHÔNG dùng timer rời.
- intensity đọc từ IDirectorSignal (interface), không phụ thuộc trực tiếp Director.

Kèm debug overlay: intensity hiện tại, volume từng lớp, số phách tới điểm
chuyển kế tiếp, trạng thái đang giữ còn bao lâu.

Test: hysteresis không dao động khi intensity rung quanh ngưỡng;
điểm chuyển luôn rơi vào cuối ô nhịp (sai số < 20ms).
```

**Bẫy thường gặp:** dùng crossfade tuyến tính. Hai track cùng phát ở 50% âm lượng tuyến tính cho tổng năng lượng **thấp hơn** một track ở 100% — nghe như âm thanh bị tụt ở giữa đoạn chuyển. Phải nêu rõ *equal-power* (nhân với `cos`/`sin` của góc chuyển), AI mặc định làm tuyến tính.
