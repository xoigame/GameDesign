---
title: Machine Learning & RL
icon: 🧬
summary: Học tăng cường và ML-Agents trong game — khi nào đáng dùng, và vì sao thường thì không.
status: stub
read: 520
level: advanced
order: 100
tags: [ai, ml, advanced, experimental]
related: [utility-ai, behavior-tree, balancing-math]
---

Reinforcement learning cho ra những kết quả ấn tượng (AlphaStar, OpenAI Five), nhưng tỉ lệ dùng trong game thương mại vẫn rất thấp. Có lý do chính đáng cho điều đó.

## Cần bồi đắp

- [ ] Unity ML-Agents: quy trình thực tế, thời gian huấn luyện, chi phí
- [ ] Thiết kế hàm thưởng và hiện tượng reward hacking
- [ ] Self-play cho bot đối kháng
- [ ] Imitation learning từ dữ liệu người chơi
- [ ] Dùng RL để **kiểm thử** game thay vì để chơi game

## Ghi chú tạm

**Ba vấn đề khiến RL hiếm khi phù hợp:**

1. **Không kiểm soát được.** Nhà thiết kế muốn NPC làm X trong tình huống Y. Với RL, bạn chỉ có thể sửa hàm thưởng rồi huấn luyện lại và hy vọng. So với việc sửa một dòng trong [[behavior-tree]], đây là bước lùi khổng lồ về năng suất.

2. **Không gỡ lỗi được.** NPC làm điều kỳ quặc. Vì sao? Không ai biết. Không có trạng thái để in ra, không có nhánh để theo dõi.

3. **Quá giỏi.** Agent huấn luyện tốt thường vượt xa người chơi, và như đã nói ở [[game-ai]], mục tiêu không phải là mạnh mà là *thú vị*. Phải cố tình làm nó yếu đi — và lúc đó bạn đã quay lại việc điều chỉnh thủ công.

**Chỗ RL thật sự có giá trị — kiểm thử tự động.** Thả agent RL vào game để:
- Tìm lỗi vượt địa hình, kẹt hình học
- Phát hiện chiến thuật phá game mà playtester chưa nghĩ ra
- Đo xem một màn chơi có hoàn thành được không

Đây là ứng dụng ít hào nhoáng nhưng có ROI cao nhất, và nó bổ sung tốt cho mô phỏng Monte Carlo ở [[balancing-math]].

## 🤖 Prompt cho AI

Trước khi nhờ AI dựng RL, hãy nhờ nó **can ngăn bạn**. Phần lớn trường hợp, câu trả lời đúng là đừng dùng.

**Mẫu prompt phản biện (chạy cái này trước)**

```
Tôi đang định dùng reinforcement learning cho <mục đích>.

Hãy phản biện, đừng ủng hộ:
1. Hành vi này viết bằng Behavior Tree hay Utility AI được không? Cụ thể thế nào?
2. Thời gian huấn luyện và chi phí thực tế là bao nhiêu?
3. Khi agent làm điều kỳ quặc, tôi gỡ lỗi bằng cách nào?
4. Nếu nhà thiết kế muốn NPC LUÔN làm X trong tình huống Y, tôi làm sao?
5. Reward hacking nào có thể xảy ra với hàm thưởng tôi mô tả?

Kết luận: nên hay không nên. Nếu không nên, đề xuất phương án thay thế.
```

**Chỗ RL thật sự đáng dùng — kiểm thử tự động:**

```
Viết agent RL đơn giản để KIỂM THỬ game, không phải để chơi cùng người chơi.

Mục tiêu: tìm lỗi, không phải chơi hay.
- Thưởng cho việc tới được vị trí bất thường (ngoài collider, kẹt hình học)
- Thưởng cho việc kết thúc màn nhanh bất thường (phát hiện đường tắt lỗi)
- Log mọi trạng thái dẫn tới crash hoặc kẹt > 30s

Chạy 500 episode, xuất báo cáo: toạ độ các điểm kẹt, seed tái hiện được.
```

**Bẫy thường gặp:** nhờ AI "làm bot thông minh bằng ML" rồi nhận về một agent mạnh hơn người chơi rất nhiều — sau đó tốn thêm nhiều công để làm nó yếu đi một cách thú vị. Xem [[game-ai]] về việc mục tiêu không phải là mạnh.

## 🎮 Unity

Trong Unity, RL nghĩa là package **ML-Agents**. Trước khi cài, đọc phần "Mẫu prompt phản biện" ở tab Prompt — phần lớn trường hợp câu trả lời đúng là không dùng.

**Chi phí thực tế cần biết trước**

| Thứ | Thực tế |
|---|---|
| Cài đặt | Package Unity + môi trường Python riêng, phiên bản phải khớp |
| Huấn luyện | Hàng giờ tới hàng ngày cho hành vi đơn giản |
| Lặp lại | Đổi reward → huấn luyện lại từ đầu |
| Gỡ lỗi | Gần như không có công cụ; chỉ có đồ thị reward |
| Ship | Model `.onnx` chạy qua Sentis/Barracuda, tốn thêm bộ nhớ |

So với sửa một dòng trong [[behavior-tree]] rồi bấm Play, đây là bước lùi lớn về năng suất.

**Nơi RL thật sự đáng dùng trong Unity: kiểm thử tự động**

```csharp
// Agent không để chơi cùng người chơi — để TÌM LỖI
public class BugHunterAgent : Agent {
    public override void CollectObservations(VectorSensor sensor) {
        sensor.AddObservation(transform.localPosition);
        sensor.AddObservation(rb.linearVelocity);
    }

    void FixedUpdate() {
        // Thưởng cho việc tới được chỗ BẤT THƯỜNG
        if (!Physics.CheckSphere(transform.position, 0.1f, groundMask)
            && transform.position.y < -5f) {
            Debug.LogError($"Lọt địa hình tại {transform.position}");
            AddReward(1f);                       // khuyến khích tìm thêm chỗ tương tự
            LogRepro();
            EndEpisode();
        }
        if (stuckTimer > 30f) { Debug.LogWarning($"Kẹt tại {transform.position}"); EndEpisode(); }
    }
}
```

Chạy 500 episode qua đêm, sáng ra có danh sách toạ độ lọt địa hình kèm seed tái hiện. Đây là ứng dụng ít hào nhoáng nhưng có ROI cao nhất.

**Bẫy Unity cụ thể**
- **Phiên bản không khớp** giữa package ML-Agents, Python package và PyTorch — nguồn lãng phí thời gian số một. Ghim phiên bản chính xác, đừng dùng `latest`.
- **`Time.timeScale` cao để huấn luyện nhanh** làm vật lý sai lệch. Dùng `--time-scale` của trainer, không tự đặt `timeScale`.
- **Reward hacking**: thưởng cho "gần người chơi" → agent học cách đứng dính vào người chơi mà không tấn công.

**Kiểm tra nhanh**
- Chạy được `mlagents-learn --help` trong môi trường Python của dự án?
- Agent huấn luyện xong có **thua được** không? Nếu không, bạn phải làm nó yếu đi — và lúc đó nên xem lại có cần RL thật không.
