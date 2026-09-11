---
title: Balancing & Math
icon: 🧮
summary: Công thức, bảng số và mô phỏng Monte Carlo — thay việc đoán mò bằng việc đo đạc.
status: deep
read: 240
level: advanced
order: 40
tags: [systems, math, simulation]
related: [economy-design, combat-systems, difficulty-curve, mda-framework]
---

Cân bằng không phải là làm mọi thứ bằng nhau. Cân bằng là làm cho **mọi lựa chọn đều đáng cân nhắc trong một bối cảnh nào đó**.

## Ba công thức nền

**Giảm sát thương theo giáp** — dùng đường cong bão hoà, không dùng phép trừ:

```
sát_thương_nhận = sát_thương_gốc × (K / (K + giáp))
```

Với `K = 100`: giáp 100 → giảm 50%; giáp 300 → giảm 75%. Không bao giờ chạm 0, không bao giờ âm. Phép trừ thẳng (`dmg - armor`) tạo ra trường hợp suy biến ở cả hai đầu: sát thương bằng 0, hoặc giáp thành vô dụng.

**Chi phí tăng theo cấp số nhân** — cho mọi thứ mua được nhiều lần:

```
chi_phí(n) = gốc × tăng_trưởng^n        # tăng_trưởng 1.15 – 1.35
```

**Lợi ích giảm dần** — cho mọi thứ cộng dồn:

```
hiệu_quả(n) = tối_đa × (1 - e^(-k·n))
```

Nếu không có dạng bão hoà này, người chơi sẽ dồn hết vào một chỉ số và phá vỡ game.

## Luật phòng chống bùng nổ

Trường hợp suy biến gần như luôn đến từ **nhân các phần trăm với nhau**:

```
❌  sát_thương × (1+0.5) × (1+0.5) × (1+0.5) = 3.4×
✅  sát_thương × (1 + 0.5 + 0.5 + 0.5)       = 2.5×
```

Nguyên tắc: **cộng trong cùng một loại, nhân giữa các loại khác nhau.** Tất cả bonus "% sát thương" cộng lại với nhau, rồi mới nhân với hệ số crit, rồi mới nhân với hệ số kháng.

Đặt trần cứng cho mọi chỉ số có thể tạo vòng lặp vô hạn: hút máu, giảm cooldown, tốc đánh.

## Mô phỏng Monte Carlo

Đây là chỗ AI tạo khác biệt lớn nhất. Thay vì tranh cãi build nào mạnh, hãy chạy thử:

```python
# Mô phỏng: 10.000 trận cho mỗi build, thống kê kết quả
import random, statistics

def sim_battle(build, enemy):
    hp, e_hp = build.hp, enemy.hp
    t = 0.0
    while hp > 0 and e_hp > 0 and t < 120:
        e_hp -= build.dps * 0.1
        hp   -= enemy.dps * 0.1 * (100 / (100 + build.armor))
        t    += 0.1
    return {"win": e_hp <= 0, "time": t, "hp_left": max(0, hp)}

for build in BUILDS:
    runs = [sim_battle(build, ENEMY) for _ in range(10_000)]
    wr   = sum(r["win"] for r in runs) / len(runs)
    ttk  = statistics.median(r["time"] for r in runs)
    print(f"{build.name:12} winrate={wr:.1%}  TTK={ttk:.1f}s")
```

Cái cần nhìn **không phải giá trị trung bình mà là phân bố**. Build có winrate 55% ổn định thì lành mạnh; build 55% nhưng là hỗn hợp của 90% và 10% tuỳ tình huống thì đang bị "hard counter" — nghĩa là kết quả quyết định trước khi trận đấu bắt đầu.

## Ngưỡng chẩn đoán

| Chỉ số | Khoảng lành mạnh | Ý nghĩa khi lệch |
|---|---|---|
| Winrate mỗi build (PvE) | 45–65% | <40% = bỏ đi; >75% = thống trị |
| Winrate mỗi nhân vật (PvP) | 48–52% | Lệch >5% là người chơi giỏi sẽ nhận ra |
| Tỉ lệ chọn (pick rate) | không quá 25% | Một lựa chọn hút hết = các lựa chọn khác vô nghĩa |
| TTK (thời gian hạ mục tiêu) | biến thiên <2× | Chênh lệch lớn nghĩa là một số kẻ địch bị bỏ qua |
| Độ lệch chuẩn thời gian clear | <30% trung vị | Cao = quá phụ thuộc RNG, xem [[randomness]] |

## Cân bằng "đủ tốt"

Toán học chỉ đưa bạn tới khoảng 80%. Hai mươi phần trăm còn lại là *cảm nhận*:

- Một lựa chọn hơi mạnh nhưng khó dùng thường **lành mạnh** — nó thưởng cho kỹ năng.
- Một lựa chọn cân bằng hoàn hảo nhưng nhàm chán thì **tệ hơn** một lựa chọn hơi lệch mà thú vị.
- Cân bằng nhận thức quan trọng ngang cân bằng thực tế. Nếu người chơi *tin* rằng thứ gì đó quá mạnh, nó gây hại thật — dù số liệu nói ngược lại.

Vì vậy: dùng mô phỏng để loại bỏ những thứ hỏng rõ ràng, dùng [[playtesting-metrics]] để tinh chỉnh phần còn lại.

## 🤖 Prompt cho AI

Rất hiệu quả:
- Viết harness mô phỏng từ mô tả bằng lời.
- Dò tìm trường hợp suy biến: *"tìm tổ hợp 3 vật phẩm cho sát thương >10× baseline"*.
- Suy ra bảng số từ ràng buộc: *"cho tôi 12 mức nâng cấp sao cho thời gian đạt mỗi mức nằm trong 8–14 phút"*.
- Phân tích log playtest thật, chỉ ra chỗ lệch.

Cần cảnh giác:
- AI đề xuất con số **nghe hợp lý mà không kiểm chứng**. Luôn bắt nó chạy mô phỏng rồi đưa ra số liệu, đừng nhận số trực tiếp.
- AI thiên về các giá trị "tròn trịa" quen thuộc trong dữ liệu huấn luyện (10%, 25%, 1.5×) chứ không phải giá trị đúng cho game của bạn.
