---
title: Prompt Patterns cho Gamedev
icon: 💡
summary: Các mẫu prompt đã kiểm chứng cho từng loại việc — hệ thống, cân bằng, thuật toán, debug, refactor.
status: deep
read: 120
level: basic
order: 30
tags: [ai-dev, prompt, practical]
related: [gdd-for-ai, agent-guardrails, ai-workflow]
---

## Bộ khung chung

Prompt gamedev hiệu quả gần như luôn có 5 phần:

```
[BỐI CẢNH]    Engine, phiên bản, ngôn ngữ, kiến trúc hiện tại
[MỤC TIÊU]    Cần đạt được gì, ở mức hành vi quan sát được
[RÀNG BUỘC]   Phải / không được. Bao gồm ràng buộc thiết kế lẫn kỹ thuật
[DỮ LIỆU]     Số cụ thể, bảng, công thức
[ĐẦU RA]      Định dạng, file nào, có test không
```

Thiếu phần RÀNG BUỘC là nguyên nhân số một khiến kết quả "đúng mà không dùng được".

## Mẫu: xây một hệ thống

```
[BỐI CẢNH] Unity 6, C#, 2D. Đã có PlayerController và HealthComponent.
           Dự án dùng ScriptableObject cho mọi dữ liệu cấu hình.

[MỤC TIÊU] Hệ thống stamina: chạy và né tiêu stamina, hết thì không né được.

[RÀNG BUỘC]
- Stamina hồi sau 1.2s không tiêu (không hồi ngay lập tức)
- Không né được khi stamina < 20 — nhưng vẫn di chuyển được
- KHÔNG dùng Update cho việc hồi; dùng thời gian trôi qua khi truy vấn
- KHÔNG gọi GetComponent ngoài Awake
- Mọi hằng số nằm trong StaminaConfig : ScriptableObject

[DỮ LIỆU]
  max: 100 | hồi: 25/giây | trễ hồi: 1.2s
  chi phí né: 25 | chi phí chạy: 12/giây

[ĐẦU RA]
- StaminaComponent.cs + StaminaConfig.cs
- Sự kiện OnStaminaChanged(float normalized) cho UI
- Unit test: tiêu, hồi, trễ hồi, chặn né khi thiếu
```

## Mẫu: cân bằng số

Điểm mấu chốt — **bắt AI chạy mô phỏng, đừng nhận số nó đưa ra trực tiếp.**

```
Viết script Python mô phỏng cân bằng, KHÔNG đưa ra con số dựa trên trực giác.

Mô hình:
- Người chơi: hp=100, dps=f(level), armor=g(level)
- 5 loại kẻ địch, chỉ số trong bảng dưới
- Mô phỏng 10.000 trận mỗi cặp (build × kẻ địch)

Xuất ra:
- Winrate và TTK trung vị cho mỗi cặp
- Cảnh báo cặp nào winrate < 40% hoặc > 75%
- Đồ thị phân bố TTK (phát hiện đuôi dài)

Sau khi có kết quả, đề xuất điều chỉnh và CHẠY LẠI để chứng minh.
```

Chi tiết quan trọng: yêu cầu chạy lại sau khi điều chỉnh. Không có bước đó, "đề xuất" chỉ là phỏng đoán có vẻ khoa học.

## Mẫu: thuật toán

```
Cài [thuật toán] cho [bối cảnh].

Đặc tả:
- Đầu vào / đầu ra chính xác
- Độ phức tạp mong muốn
- Ràng buộc bộ nhớ: KHÔNG cấp phát trong vòng lặp nóng

Trường hợp biên (phải xử lý rõ ràng, không được ném ngoại lệ):
- [liệt kê...]

Hành vi khi thất bại: [nêu rõ — đây là chỗ hay bị bỏ sót]

Kèm unit test cho: trường hợp thường, mỗi trường hợp biên, và giới hạn hiệu năng.
```

## Mẫu: debug

Đưa **bằng chứng**, đừng đưa kết luận của bạn:

```
Triệu chứng: nhân vật thỉnh thoảng xuyên qua nền khi rơi nhanh.
Tần suất: ~1/20 lần, chỉ khi tốc độ rơi > 25 đơn vị/giây.

Đã thử: tăng Fixed Timestep từ 0.02 xuống 0.01 — giảm nhưng không hết.

[dán code xử lý va chạm]

Đừng đoán. Hãy:
1. Liệt kê các giả thuyết theo thứ tự khả năng
2. Với mỗi giả thuyết, nói tôi cần kiểm tra gì để xác nhận/loại trừ
3. Chờ tôi báo kết quả rồi mới sửa
```

Bước 3 quan trọng: agent sửa ngay thường "sửa" triệu chứng chứ không sửa nguyên nhân.

## Mẫu: phản biện thiết kế

Dùng AI như một người phản biện, không phải người tán thành:

```
Đây là thiết kế hệ thống kinh tế của tôi: [mô tả]

Hãy đóng vai người chơi cố tình phá game:
1. Có vòng lặp nào tạo tài nguyên vô hạn không?
2. Chiến lược tối ưu (degenerate) là gì? Nó có nhàm chán không?
3. Chỗ nào gây lạm phát sau 20 giờ chơi?
4. Ba điểm yếu lớn nhất của thiết kế này?

Không cần khen. Chỉ liệt kê vấn đề.
```

Câu cuối có tác dụng thật — không có nó, phản hồi thường mở đầu bằng một đoạn khen ngợi vô ích.

## Mẫu: refactor an toàn

```
Refactor [file] để [mục tiêu].

BẮT BUỘC:
- Hành vi quan sát được KHÔNG đổi
- Giữ nguyên mọi API công khai
- Chạy test hiện có trước và sau, cả hai phải xanh
- Nếu phải đổi API công khai, DỪNG LẠI và hỏi tôi trước

Trình bày diff theo từng bước nhỏ, đừng viết lại cả file một lần.
```

## Điều nên tránh

**Đừng hỏi "cách nào tốt nhất?"** — sẽ nhận về câu trả lời trung bình hoá. Hỏi: *"So sánh A và B cho trường hợp cụ thể của tôi: [ràng buộc]. Khuyến nghị một cái và nói rõ đánh đổi."*

**Đừng chấp nhận code không đọc.** Nếu không hiểu, hỏi lại cho tới khi hiểu. Code bạn không hiểu là nợ kỹ thuật ngay từ ngày đầu.

**Đừng để agent tự ý mở rộng phạm vi.** Nếu nó thêm tính năng bạn không yêu cầu, hãy chỉ ra và yêu cầu gỡ. Xem [[agent-guardrails]].

## 🤖 Prompt cho AI

Node này *là* tập mẫu prompt. Phần dưới là cách dùng AI để **cải thiện chính prompt của bạn**.

**Mẫu prompt: nhờ AI vá lỗ hổng trong prompt**

```
Đây là prompt tôi định gửi cho một coding agent:

<dán prompt của bạn>

Đừng thực hiện nó. Thay vào đó:
1. Liệt kê mọi chỗ agent sẽ phải TỰ QUYẾT vì tôi không nói rõ.
2. Với mỗi chỗ, đoán xem agent sẽ mặc định chọn gì (giá trị phổ biến nhất).
3. Chỉ ra ràng buộc PHỦ ĐỊNH nào tôi đang thiếu — tức là thứ tôi KHÔNG muốn
   nhưng chưa cấm.
4. Viết lại prompt cho chặt, giữ nguyên ý định của tôi.
```

**Mẫu prompt: bắt AI phản biện thiết kế**

```
Đây là thiết kế <hệ thống>: <mô tả>

Đóng vai người chơi cố tình phá game:
1. Vòng lặp nào tạo tài nguyên hoặc sức mạnh vô hạn?
2. Chiến lược tối ưu (degenerate) là gì? Nó có nhàm chán không?
3. Chỗ nào hỏng sau 20 giờ chơi?
4. Ba điểm yếu lớn nhất?

Không cần khen. Chỉ liệt kê vấn đề.
```

**Bẫy thường gặp:** hỏi "cách nào tốt nhất?" — nhận về câu trả lời trung bình hoá. Luôn hỏi dạng *"so sánh A và B cho ràng buộc cụ thể của tôi, khuyến nghị một cái, nói rõ đánh đổi."*
