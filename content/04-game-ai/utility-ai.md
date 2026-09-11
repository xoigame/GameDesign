---
title: Utility AI
icon: 📊
summary: Chấm điểm mọi lựa chọn rồi chọn cái cao nhất — kiến trúc linh hoạt nhất cho NPC có nhiều nhu cầu cạnh tranh.
status: deep
read: 380
level: advanced
order: 40
tags: [ai, decision-making]
related: [behavior-tree, goap, ai-director]
---

Utility AI bỏ hoàn toàn khái niệm ưu tiên cứng. Thay vào đó, mỗi tick nó **chấm điểm mọi hành động khả dĩ** rồi chọn hành động điểm cao nhất.

```
Ăn         → 0.82   ← chọn cái này
Ngủ        → 0.41
Đi làm     → 0.65
Nói chuyện → 0.30
```

Đây là kiến trúc đằng sau The Sims, và ngày càng phổ biến trong game mô phỏng và chiến thuật.

## Hàm chấm điểm

Mỗi hành động có một hoặc nhiều **considerations** — các yếu tố đầu vào được chuẩn hoá về [0, 1] rồi đưa qua một đường cong:

```
Điểm(Ăn) = curve_đói(mức_đói) × curve_khoảngcách(khoảng_cách_tới_bếp)
```

Các dạng đường cong thường dùng:

| Dạng | Công thức | Dùng cho |
|---|---|---|
| Tuyến tính | `x` | Quan hệ đơn giản |
| Bậc hai | `x²` | Khẩn cấp tăng dần — đói nhẹ gần như không quan trọng, đói nặng thì rất |
| Nghịch đảo | `1 - x` | "Càng xa càng tệ" |
| Logistic | `1 / (1 + e^(-k(x-c)))` | Ngưỡng mềm — gần như tắt/bật nhưng không giật |

Dùng **nhân** thay vì **cộng** khi kết hợp: nếu một yếu tố bằng 0 (bếp không tới được), toàn bộ hành động bị loại — đúng như mong muốn. Cộng sẽ cho ra điểm dương dù hành động bất khả thi.

Cảnh báo về nhân: với nhiều yếu tố, điểm bị kéo về 0 (0.8⁵ = 0.33). Cách bù thường dùng là *compensation factor*:

```
điểm_cuối = điểm_nhân ^ (1 / số_yếu_tố)
```

## So sánh với BT

| | Behavior Tree | Utility AI |
|---|---|---|
| Quyết định | Ưu tiên cứng theo thứ tự | Điểm mềm, so sánh tương đối |
| Thêm hành vi | Chèn nhánh, phải cân nhắc vị trí | Thêm một hành động độc lập |
| Kiểm soát | Rất chính xác | Gián tiếp, chỉnh qua đường cong |
| Gỡ lỗi | Dễ — xem nhánh nào chạy | Trung bình — phải xem bảng điểm |
| Phù hợp | Kẻ địch chiến đấu | NPC sinh hoạt, sim, chiến thuật |

Điểm mạnh lớn nhất của Utility AI là **khả năng mở rộng**: thêm hành động thứ 40 không đụng chạm gì tới 39 hành động cũ. Với BT thì phải quyết định chèn nhánh mới vào chỗ nào trong thứ tự ưu tiên — và thứ tự đó ngày càng khó lý giải.

## Tránh dao động

Vấn đề cố hữu: hai hành động điểm 0.51 và 0.49 sẽ khiến NPC đổi ý liên tục.

Ba cách chữa, thường dùng kết hợp:

1. **Bonus quán tính** — cộng thêm 10–15% cho hành động đang thực hiện.
2. **Cam kết tối thiểu** — hành động đã chọn phải chạy ít nhất N giây.
3. **Chọn ngẫu nhiên trong top-K** — lấy 3 hành động điểm cao nhất, chọn ngẫu nhiên có trọng số. Vừa chống dao động vừa tạo cảm giác NPC có cá tính.

Cách 3 có tác dụng phụ rất có giá trị: **NPC không còn đoán trước được** mà vẫn hợp lý.

## Cài đặt gọn

```csharp
Action ChooseBest(Agent agent) {
    Action best = null;
    float bestScore = 0f;

    foreach (var action in agent.actions) {
        float score = 1f;
        foreach (var c in action.considerations)
            score *= c.Evaluate(agent);          // mỗi cái trả về [0,1]

        // bù cho việc nhân nhiều yếu tố
        if (action.considerations.Count > 1)
            score = Mathf.Pow(score, 1f / action.considerations.Count);

        if (action == agent.current) score *= 1.15f;   // quán tính

        if (score > bestScore) { bestScore = score; best = action; }
    }
    return best;
}
```

Toàn bộ kiến trúc nằm gọn trong một hàm. Độ phức tạp dồn vào các đường cong — và đó là chỗ nhà thiết kế chỉnh, không phải lập trình viên.

## 🤖 Prompt cho AI

Utility AI **data-driven tự nhiên**: các đường cong và trọng số nằm trong file dữ liệu, không nằm trong code. Điều này khớp rất tốt với [[data-driven-design]] và với cách làm việc cùng AI:

```
Viết hệ thống Utility AI cho NPC dân làng.

Considerations (mỗi cái trả [0,1]):
  hunger      : quadratic,  input = 1 - (food / max_food)
  fatigue     : logistic,   input = hours_awake / 16,  k=8, c=0.7
  distance    : inverse_lin, input = dist / 50, clamp 0..1
  is_night    : boolean

Actions (action = danh sách considerations nhân với nhau):
  Eat     = [hunger, distance_to_kitchen]
  Sleep   = [fatigue, is_night, distance_to_bed]
  Work    = [1 - fatigue, not is_night, distance_to_job]
  Socialize = [social_need, distance_to_npc]

Ràng buộc:
- Toàn bộ đường cong + tham số nạp từ JSON, KHÔNG hardcode
- Quán tính 1.15x cho hành động hiện tại
- Cam kết tối thiểu 2 giây
- Debug overlay: in bảng điểm mọi action của NPC đang chọn
```

Yêu cầu **debug overlay** không phải phụ kiện — với Utility AI, không nhìn được bảng điểm thì không tinh chỉnh được gì cả.
