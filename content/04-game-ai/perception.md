---
title: Perception & Senses
icon: 👁️
summary: Tầm nhìn, thính giác, trí nhớ — hệ thống làm cho AI vừa công bằng vừa trông có vẻ công bằng.
status: deep
read: 450
level: intermediate
order: 80
tags: [ai, npc, systems]
related: [fsm, behavior-tree, level-design]
---

Perception là thứ quyết định AI **cảm thấy** công bằng hay gian lận. Một AI đọc vị trí người chơi trực tiếp từ bộ nhớ sẽ luôn bị cảm nhận là ăn gian, dù cân bằng số liệu hoàn hảo.

Lý do nằm ở chỗ này: người chơi không đánh giá AI bằng độ khó, họ đánh giá bằng **khả năng dự đoán**. Một NPC phát hiện ra bạn vì bạn đi qua vùng sáng là công bằng — bạn biết mình sai ở đâu. Một NPC quay đầu đúng lúc bạn nhấp chuột thì không, dù xác suất hai việc giống hệt nhau.

## Nón nhìn: bốn tham số và một vùng hay bị quên

<figure class="fig">
<svg viewBox="0 0 660 268" role="img" aria-label="Nón nhìn của NPC nhìn từ trên xuống: vùng tập trung, vùng ngoại vi, vùng cận kề, và tường chặn tầm nhìn">
  <circle cx="150" cy="140" r="118" fill="#6ea8fe" opacity="0.05"/>
  <circle cx="150" cy="140" r="118" stroke="#6ea8fe" stroke-width="1" stroke-dasharray="4 4" fill="none"/>
  <text x="150" y="36" text-anchor="middle" class="fig-muted" font-size="10">bán kính NGHE — không phụ thuộc hướng</text>
  <path d="M150 140 L296 68 A163 163 0 0 0 296 212 Z" fill="#ffd43b" opacity="0.14"/>
  <path d="M150 140 L268 82 A132 132 0 0 0 268 198 Z" fill="#ff8787" opacity="0.16"/>
  <circle cx="150" cy="140" r="30" fill="#ff8787" opacity="0.22"/>
  <circle cx="150" cy="140" r="8" class="fig-box"/>
  <text x="150" y="164" text-anchor="middle" class="fig-muted" font-size="10">NPC</text>
  <path d="M150 140 L240 140" stroke="#6b7488" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="246" y="144" class="fig-muted" font-size="10">hướng nhìn</text>
  <rect x="300" y="150" width="16" height="76" rx="2" class="fig-box"/>
  <text x="308" y="242" text-anchor="middle" class="fig-muted" font-size="10">tường</text>
  <path d="M150 140 L300 188" stroke="#51cf9b" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/>
  <circle cx="340" cy="200" r="6" fill="#51cf9b"/>
  <text x="354" y="204" font-size="10" fill="#51cf9b">trong nón nhưng BỊ CHE → không thấy</text>
  <text x="360" y="76" class="fig-label" font-size="11">1 · Vùng tập trung</text>
  <text x="360" y="92" class="fig-muted" font-size="10">nón hẹp, tầm xa — phát hiện nhanh</text>
  <text x="360" y="116" class="fig-label" font-size="11">2 · Vùng ngoại vi</text>
  <text x="360" y="132" class="fig-muted" font-size="10">nón rộng, tầm ngắn hơn — phát hiện chậm</text>
  <text x="360" y="156" class="fig-label" font-size="11">3 · Vùng cận kề</text>
  <text x="360" y="172" class="fig-muted" font-size="10">vòng tròn quanh NPC, KHÔNG cần trong nón</text>
  <text x="360" y="188" class="fig-muted" font-size="10">— vùng hay bị quên nhất</text>
</svg>
<figcaption>Thiếu vùng 3, người chơi đứng sát sau lưng lính mà không bị phát hiện — chuyện phi lý làm hỏng toàn bộ cảm giác đáng tin của hệ thống.</figcaption>
</figure>

Bốn tham số phải phơi ra để chỉnh được, và một quy tắc:

| Tham số | Khởi điểm hợp lý | Ghi chú |
|---|---|---|
| Góc nón | 90–120° | Hẹp hơn thì lén lút quá dễ, rộng hơn thì không có đường sau lưng |
| Tầm xa | 15–25 m | Phải đặt cùng đơn vị với thiết kế màn — xem [[level-design]] |
| Bán kính cận kề | 2–3 m | Bỏ qua góc nhìn hoàn toàn |
| Raycast che khuất | bắt buộc | Trong nón nhưng sau tường thì **không thấy** |

Raycast là phần tốn tính toán nhất và cũng là phần không được cắt. Một NPC nhìn xuyên tường phá vỡ niềm tin nhanh hơn bất kỳ lỗi cân bằng nào. Nếu cần tiết kiệm, hãy giảm **tần suất** kiểm tra (5–10 lần/giây là đủ) chứ đừng bỏ kiểm tra.

## Thang nhận biết thay cho công tắc

**Đừng dùng `canSeePlayer: bool`.** Dùng một giá trị tích luỹ:

```
awareness += visibility × dt / time_to_detect     // 0 → 1
```

với `visibility` phụ thuộc khoảng cách, góc nhìn, ánh sáng, tư thế người chơi. Điều này cho người chơi **cửa sổ để phản ứng** — rút lui trước khi bị phát hiện hẳn — và đó chính là phần gameplay lén lút.

Bốn mức cho ra bốn hành vi khác nhau, và người chơi phải phân biệt được cả bốn:

| `awareness` | Trạng thái | NPC làm gì | Người chơi thấy gì |
|---|---|---|---|
| 0 – 0,25 | Không biết | tuần tra bình thường | không có chỉ báo |
| 0,25 – 0,6 | Nghi ngờ | dừng lại, quay nhìn về hướng đó | chỉ báo bắt đầu đầy, âm thanh nhẹ |
| 0,6 – 1,0 | Điều tra | đi tới kiểm tra, chưa báo động | chỉ báo gần đầy, nhạc đổi |
| = 1,0 | Phát hiện | báo động, chuyển sang truy đuổi | dấu hiệu rõ + âm báo động |

Thời gian đầy thang nên khác nhau theo vùng: khoảng **0,5 giây** ở vùng cận kề hoặc giữa nón ở cự ly gần, **3–4 giây** ở rìa nón hoặc cự ly xa. Chính chênh lệch này tạo ra khoảng trống để chơi.

Thang phải **tụt xuống** khi mất dấu, nhưng tụt chậm hơn lúc lên — tỉ lệ 1:2 hoặc 1:3 là khởi điểm tốt. Tụt nhanh bằng lúc lên thì người chơi chỉ cần nấp một giây là an toàn, và lén lút mất hết căng thẳng.

## Thính giác: bán kính theo hành động

Thính giác đơn giản hơn tầm nhìn về mặt kỹ thuật — thường chỉ là khoảng cách — nhưng nó là thứ dạy người chơi rằng **mọi hành động đều có giá**.

| Hành động | Bán kính nghe khởi điểm |
|---|---|
| Đứng yên / bò | 0 m |
| Đi lén | 3–5 m |
| Đi bình thường | 8–10 m |
| Chạy | 15–20 m |
| Vật thể rơi, cửa đóng mạnh | 15–25 m |
| Súng có giảm thanh | 10–15 m |
| Súng không giảm thanh | 40 m + |

Ba chi tiết làm hệ thống này đáng tin:

- **Âm thanh đi qua tường, ánh sáng thì không.** Đây là điểm khác biệt cốt lõi giữa hai giác quan, và là thứ cho người chơi công cụ: gây tiếng động ở chỗ khác để kéo lính đi.
- **Tiếng động tạo ra một điểm điều tra, không phải một vụ phát hiện.** NPC đi tới **vị trí phát ra âm thanh**, không đi tới vị trí người chơi. Nếu bạn để nó đi thẳng tới người chơi, mọi tiếng động thành máy dò và ném đá lạc hướng trở nên vô dụng.
- **Bề mặt nên đổi bán kính.** Đi trên kim loại ồn hơn trên thảm. Chi phí một trường dữ liệu, đổi lại người chơi đọc được bản đồ theo cách hoàn toàn mới.

## Trí nhớ và hành vi tìm kiếm

**Trí nhớ tạo ra hành vi tìm kiếm.** NPC mất dấu nên đi tới vị trí cuối cùng nhìn thấy, tìm quanh đó vài giây, rồi mới quay về tuần tra. Hành vi này đơn giản về mặt kỹ thuật nhưng tạo ấn tượng thông minh rất mạnh — đúng tinh thần "sân khấu" ở [[game-ai]].

Ba trường dữ liệu là đủ cho phần lớn game:

```
lastKnownPosition   // vị trí cuối cùng thấy người chơi
lastSeenTime        // lúc nào
suspicionLevel      // thang awareness ở trên
```

Thời gian quên là tham số định hình cảm giác nhiều nhất: **10–20 giây** cho lính thường. Quên quá nhanh thì AI trông ngớ ngẩn; quên quá chậm thì người chơi không bao giờ thoát được và lén lút trở thành trò kiên nhẫn.

Một chi tiết nhỏ làm hành vi này thuyết phục hẳn: **NPC nên đoán hướng di chuyển, không chỉ tới điểm cuối.** Nếu thấy người chơi chạy về phía đông rồi mất dấu, hãy tìm xa hơn một chút về phía đông. Việc này chỉ tốn một phép cộng vector và tạo ấn tượng NPC đang suy luận.

Và quan trọng: sau khi tìm không thấy, NPC **không nên quay về trạng thái y hệt ban đầu**. Cho nó tuần tra rộng hơn hoặc cảnh giác hơn trong một phút — trạng thái "vẫn nghi ngờ" này nói với người chơi rằng hành động của họ để lại dấu vết.

## Nhận thức nhóm: chia sẻ nhưng có độ trễ

Khi một NPC phát hiện người chơi, các NPC khác biết theo cách nào? Đây là chỗ hệ thống dễ trượt sang cảm giác gian lận nhất.

Hai cực đoan đều sai: không chia sẻ gì thì cả nhóm trông như những cá thể mù; chia sẻ tức thì và toàn cục thì người chơi cảm thấy bị cả bản đồ soi cùng lúc.

Cách ở giữa, theo thứ tự nên làm:

1. **Chia sẻ theo bán kính, có độ trễ.** Chỉ NPC trong tầm hét (20–30 m) nhận được, sau **1–3 giây**. Độ trễ này là thứ tạo ra cảm giác thông tin đang *lan truyền* chứ không phải được *phát sóng*.
2. **Chia sẻ vị trí cuối cùng, không chia sẻ vị trí hiện tại.** NPC thứ hai chạy tới chỗ NPC thứ nhất *thấy* bạn, không chạy tới chỗ bạn đang đứng.
3. **Phải có hành động nhìn thấy được.** Tiếng hét, bắn pháo hiệu, chạy tới bảng báo động. Nếu thông tin lan mà không có gì hiện ra, người chơi chỉ thấy mọi NPC đột nhiên biết — đó chính là định nghĩa của cảm giác ăn gian.

Điểm 3 quan trọng hơn hai điểm trên: nó cho người chơi **cơ hội ngăn chặn**. Giết kẻ định hét trước khi nó hét là một khoảnh khắc gameplay; không có hành động nhìn thấy được thì không có khoảnh khắc nào cả.

## Chỉ báo: công bằng phải nhìn thấy được

**Luôn hiển thị trạng thái nhận biết.** Người chơi cần biết mình đang bị chú ý tới mức nào. Không có chỉ báo, lén lút trở thành trò đoán mò.

Chỉ báo tốt trả lời ba câu, và thiếu câu nào cũng hỏng:

- **Ai đang để ý tôi?** Chỉ báo gắn với NPC cụ thể, không phải một thanh chung trên HUD.
- **Ở mức nào?** Đầy dần, không nhảy bậc.
- **Từ hướng nào?** Nếu người chơi không thấy NPC đó, chỉ báo phải cho biết hướng.

Về hình thức, xem [[ux-hud]]. Nhưng có một nguyên tắc thuộc về perception chứ không thuộc về UI: **chỉ báo phải phản ánh đúng biến trong code.** Nếu thanh cảnh giác chạy theo một hàm làm đẹp riêng còn quyết định của AI dùng biến khác, người chơi sẽ học một mô hình sai — và mọi sự công bằng bạn xây đều vô nghĩa vì nó không truyền đạt được.

## Kiểm tra nhanh

- Grep logic quyết định của AI: có chỗ nào đọc thẳng transform người chơi không?
- Đứng sát sau lưng NPC: nó có phát hiện không? (phải có — vùng cận kề)
- Đứng sau tường trong nón nhìn: nó có thấy không? (không được)
- Gây tiếng động ở xa: NPC đi tới **chỗ phát ra tiếng** hay đi tới chỗ bạn?
- Nấp một giây rồi ló ra: thang cảnh giác đã tụt bao nhiêu? (không nên về 0)
- Một NPC phát hiện bạn: các NPC khác biết sau bao lâu, và có **hành động nhìn thấy được** nào không?
- Thanh cảnh giác trên màn hình có chạy đúng biến mà AI dùng để quyết định không?

## 🤖 Prompt cho AI

Perception quyết định AI **cảm thấy** công bằng hay ăn gian. AI code mặc định sẽ đọc thẳng vị trí người chơi — phải cấm.

**Dùng AI thế nào cho hệ thống perception**

Đây là chủ đề mà mô hình ngôn ngữ có một thiên lệch cụ thể và dễ đoán: nó tối ưu cho **code ngắn và chạy đúng**, mà cách ngắn nhất để NPC "biết" người chơi ở đâu luôn là đọc thẳng transform. Mọi thứ làm hệ thống *cảm thấy* công bằng — raycast, độ trễ, thang tích luỹ, trí nhớ — đều là code thêm vào, nên nó sẽ bị bỏ qua trừ khi bạn yêu cầu rõ.

Cách dùng hiệu quả là **giao ràng buộc kiến trúc trước, giao hành vi sau**:

| Bước | Giao gì | Câu mở đầu |
|---|---|---|
| 1 | Ranh giới truy cập | "Viết PerceptionSystem là nguồn duy nhất biết về người chơi. Không class nào khác được đọc transform đó" |
| 2 | Thang và tham số | "Thang awareness 0–1, phơi mọi tham số ra ScriptableObject, không hardcode" |
| 3 | Hành vi từ thang | "Behavior tree đọc awareness, không đọc vị trí trực tiếp" |
| 4 | Kiểm chứng | "Viết test: người chơi sau tường thì awareness không tăng" |

Việc **không** nên giao: chọn các con số. Góc nón và thời gian quên quyết định game của bạn lén lút kiểu gì — đó là thiết kế, và phải chỉnh bằng tay khi chơi thử.

**Phải nêu rõ:**
- Cấm truy cập trực tiếp transform của người chơi trong logic quyết định
- Thông số nón nhìn, bán kính nghe, thời gian quên
- Thang nhận biết (không phải cờ bool)
- Chỉ báo hiển thị cho người chơi
- Tiếng động tạo điểm điều tra, **không** tạo vụ phát hiện
- Chia sẻ thông tin nhóm: bán kính, độ trễ, và hành động nhìn thấy được

**Mẫu prompt**

```
Viết hệ thống perception cho NPC lính. Ràng buộc cứng:

1. PerceptionSystem là NƠI DUY NHẤT đọc vị trí người chơi.
   Behavior tree và FSM chỉ được đọc: awareness (0-1), lastKnownPosition,
   lastSeenTime. Mọi truy cập player.transform ở nơi khác là vi phạm.
2. Tầm nhìn 3 vùng: tập trung (nón 60°, 25m) / ngoại vi (nón 120°, 12m)
   / cận kề (bán kính 2.5m, BỎ QUA góc nhìn).
   Mọi vùng đều phải raycast che khuất. Kiểm tra 8 lần/giây, không mỗi frame.
3. awareness tích luỹ: đầy trong 0.5s ở cận kề, 3.5s ở rìa ngoại vi.
   Tụt khi mất dấu, tốc độ tụt = 1/3 tốc độ lên.
4. Nghe: bán kính theo hành động (bò 0 / lén 4m / đi 9m / chạy 18m).
   Tiếng động tạo ĐIỂM ĐIỀU TRA tại nguồn âm, KHÔNG tiết lộ vị trí người chơi.
5. Quên sau 15s. Khi tìm, đoán thêm theo hướng di chuyển cuối cùng.
6. Chia sẻ nhóm: bán kính 25m, độ trễ 2s, và PHẢI phát animation hét
   trước khi thông tin lan.

Mọi con số ở trên phơi ra ScriptableObject, không hardcode.

Kèm test:
- người chơi sau tường, trong nón → awareness KHÔNG tăng
- người chơi sát lưng NPC → awareness tăng (vùng cận kề)
- tiếng động ở A, người chơi ở B → NPC đi tới A
```

**Bẫy thường gặp:** AI viết `if (Vector3.Distance(transform.position, player.position) < range)` rồi coi như xong — không góc nhìn, không raycast, không thang. Ràng buộc "PerceptionSystem là nơi duy nhất đọc vị trí người chơi" là câu chặn hiệu quả nhất vì nó kiểm tra được bằng grep. Bẫy thứ hai: AI cài thang awareness nhưng để behavior tree đọc thẳng `canSee` suy ra từ thang — lúc đó thang chỉ là trang trí, hành vi vẫn nhị phân.

## 🎮 Unity

Perception trong Unity là nơi rất dễ viết ra AI "nhìn xuyên tường" mà không nhận ra.

**Component & nơi đặt**
- `Perception.cs` — trên NPC, chạy độc lập với FSM/BT
- Ghi kết quả vào blackboard; **logic quyết định chỉ đọc blackboard**

**Code — nón nhìn có kiểm tra che khuất**

```csharp
public class Perception : MonoBehaviour {
    [SerializeField] float viewAngle = 110f;
    [SerializeField] float viewRange = 18f;
    [SerializeField] LayerMask targetMask, obstacleMask;
    [SerializeField] float timeToDetect = 1.2f;

    public float Awareness { get; private set; }     // 0..1, KHÔNG phải bool
    public Vector3 LastKnownPos { get; private set; }

    readonly Collider[] buf = new Collider[8];

    public void Tick(float dt) {
        float visibility = ComputeVisibility();
        Awareness = Mathf.Clamp01(visibility > 0f
            ? Awareness + visibility * dt / timeToDetect
            : Awareness - 0.25f * dt);
        if (visibility > 0f) LastKnownPos = target.position;
    }

    float ComputeVisibility() {
        int n = Physics.OverlapSphereNonAlloc(transform.position, viewRange, buf, targetMask);
        for (int i = 0; i < n; i++) {
            Vector3 dir = (buf[i].transform.position - transform.position);
            if (Vector3.Angle(transform.forward, dir) > viewAngle * 0.5f) continue;

            // BẮT BUỘC: chặn bởi tường thì không thấy
            if (Physics.Raycast(transform.position, dir.normalized, dir.magnitude, obstacleMask))
                continue;

            float distFactor = 1f - dir.magnitude / viewRange;
            return Mathf.Clamp01(distFactor);
        }
        return 0f;
    }
}
```

**Thang nhận biết, không phải công tắc**

`Awareness` là số 0..1, không phải `bool canSee`. Điều này cho người chơi **cửa sổ để rút lui** trước khi bị phát hiện hẳn — và đó chính là gameplay lén lút.

Ngưỡng: `0.5` = nghi ngờ (NPC quay đầu nhìn), `1.0` = phát hiện.

**Gizmo — vẽ nón nhìn ngay từ đầu**

```csharp
#if UNITY_EDITOR
void OnDrawGizmosSelected() {
    UnityEditor.Handles.color = new Color(1, 1, 0, 0.15f);
    UnityEditor.Handles.DrawSolidArc(transform.position, Vector3.up,
        Quaternion.Euler(0, -viewAngle / 2f, 0) * transform.forward,
        viewAngle, viewRange);
    UnityEditor.Handles.Label(transform.position + Vector3.up * 2.2f,
        $"aware {Awareness:F2}");
}
#endif
```

Không nhìn được nón nhìn thì không chỉnh được perception. Đây là 10 dòng đáng giá nhất của mục này.

**Chỉ báo cho người chơi**

Awareness phải hiện ra UI (dấu chấm than mờ dần, thanh nhỏ trên đầu NPC). Không có chỉ báo, lén lút thành trò đoán mò — và đó cũng là vấn đề trợ năng.

**Kiểm tra nhanh**
- Grep trong FSM/BT: có chỗ nào đọc `player.transform` trực tiếp không? Phải bằng 0.
- Đứng sau tường trong tầm nhìn: NPC có phát hiện không? (không được)
- `Awareness` có hiện lên UI cho người chơi thấy không?

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Vì sao không dùng `canSeePlayer` kiểu bool?**
  → Vì nó xoá mất toàn bộ vùng chơi. Lén lút diễn ra trong khoảng giữa "chưa biết" và "đã biết"; bool thì không có khoảng giữa. Thang 0→1 còn cho tôi bốn trạng thái hành vi phân biệt được: tuần tra, nghi ngờ dừng lại nhìn, đi điều tra, và báo động.
- `Junior` **Nón nhìn cần những tham số gì?**
  → Góc **90–120°**, tầm **15–25 m**, và một vùng **cận kề 2–3 m bỏ qua góc nhìn**. Vùng cận kề hay bị quên nhất — thiếu nó thì người chơi đứng sát lưng lính mà không bị phát hiện. Mọi vùng đều phải raycast che khuất, chỉ giảm tần suất xuống 5–10 lần/giây chứ không bỏ.
- `Junior` **Thang awareness lên xuống nhanh chậm thế nào?**
  → Đầy trong khoảng **0,5 giây** ở vùng cận kề, **3–4 giây** ở rìa nón. Tụt khi mất dấu nhưng chậm hơn lúc lên, cỡ **một phần ba** tốc độ — nếu tụt nhanh bằng lúc lên thì nấp một giây là an toàn và toàn bộ căng thẳng biến mất.
- `Mid` **Người chơi kêu "lính nhìn xuyên tường, game ăn gian". Anh kiểm tra thế nào?**
  → Trước hết bật vẽ debug nón nhìn và tia raycast để xem có thật sự nhìn xuyên không, hay awareness được cộng từ **kênh khác** — tiếng động, chia sẻ nhóm — mà người chơi không thấy. Rất thường là kênh khác. Lúc đó lỗi nằm ở chỗ thiếu tín hiệu, không phải ở chỗ thiếu công bằng.
- `Mid` **Tiếng động nên làm NPC biết vị trí người chơi hay không?**
  → Không. Tiếng động tạo một **điểm điều tra tại nguồn âm**. Cho NPC đi thẳng tới người chơi thì mọi tiếng động thành máy dò, và ném đá lạc hướng — công cụ chính của thể loại — thành vô dụng. Đây cũng là chỗ thính giác khác thị giác: âm thanh đi qua tường, ánh sáng thì không.
- `Mid` **Chỉ báo cảnh giác trên HUD làm sao cho đúng?**
  → Gắn với NPC cụ thể, đầy dần chứ không nhảy bậc, và chỉ hướng nếu người chơi không thấy NPC đó. Quan trọng nhất: nó phải chạy theo **đúng cái biến AI dùng để quyết định**. Thanh chạy theo một hàm làm đẹp riêng thì người chơi học một mô hình sai, và mọi sự công bằng mình xây đều không truyền đạt được.
- `Senior` **Một NPC phát hiện người chơi thì cả nhóm biết kiểu gì cho công bằng?**
  → Chia sẻ theo bán kính **20–30 m** với độ trễ **1–3 giây**, chia sẻ **vị trí cuối cùng** chứ không phải vị trí hiện tại, và bắt buộc có **hành động nhìn thấy được** — tiếng hét, pháo hiệu. Điểm cuối quan trọng nhất: giết kẻ định hét trước khi nó hét là một khoảnh khắc gameplay.
- `Senior` **Làm sao ngăn code AI đọc thẳng vị trí người chơi trong cả một đội?**
  → Một nguồn duy nhất được biết về người chơi: `PerceptionSystem`. Behavior tree và FSM chỉ được đọc `awareness`, `lastKnownPosition`, `lastSeenTime`. Mọi truy cập `player.transform` ở nơi khác là vi phạm — và cái hay là luật này **kiểm tra được bằng grep**, không phải bằng niềm tin hay bằng review.
- `Senior` **Mẹo nào làm NPC trông thông minh mà gần như miễn phí?**
  → Đoán theo hướng di chuyển cuối: thấy người chơi chạy về phía đông rồi mất dấu thì tìm xa hơn một chút về phía đông. Tốn một phép cộng vector. Cùng loại với việc sau khi tìm không thấy thì tuần tra rộng hơn trong một phút thay vì về đúng trạng thái ban đầu — hành động của người chơi để lại dấu vết.

**Khung trả lời 60 giây** — "Làm sao để AI vừa công bằng vừa trông có vẻ công bằng?"

> Nguyên tắc của tôi là **một nguồn duy nhất được biết về người chơi**: một `PerceptionSystem`. Behavior tree và FSM chỉ được đọc `awareness`, `lastKnownPosition`, `lastSeenTime` — mọi truy cập `player.transform` ở nơi khác là vi phạm, và cái hay là nó kiểm tra được bằng grep chứ không phải bằng niềm tin.
>
> Nhận biết là **thang tích luỹ 0 đến 1**, không phải cờ bool. Thang cho người chơi cửa sổ để phản ứng, và đó chính là phần gameplay của lén lút. Đầy khoảng nửa giây ở vùng cận kề, ba bốn giây ở rìa nón; tụt khi mất dấu nhưng chậm hơn lúc lên, tỉ lệ chừng một phần ba, nếu không thì nấp một giây là an toàn và mọi căng thẳng biến mất.
>
> Tầm nhìn chia ba vùng — tập trung, ngoại vi, và **cận kề bỏ qua góc nhìn** — vùng cuối hay bị quên nhất, thiếu nó thì người chơi đứng sát lưng lính mà không bị phát hiện. Mọi vùng đều raycast che khuất; muốn tiết kiệm thì giảm tần suất xuống tám lần một giây, không bỏ kiểm tra.

**Họ sẽ đào tiếp**

- *"Vì sao bool là sai?"* → Vì nó xoá mất toàn bộ vùng chơi. Lén lút diễn ra trong khoảng giữa "chưa biết" và "đã biết"; bool thì không có khoảng giữa. Thang còn cho tôi bốn trạng thái hành vi phân biệt được: tuần tra, nghi ngờ dừng lại nhìn, đi điều tra, và báo động.
- *"Tiếng động có tiết lộ vị trí người chơi không?"* → Không. Tiếng động tạo một **điểm điều tra tại nguồn âm**. Nếu để NPC đi thẳng tới người chơi thì mọi tiếng động thành máy dò, và ném đá lạc hướng — công cụ chính của thể loại — trở nên vô dụng. Đây cũng là chỗ thính giác khác tầm nhìn: âm thanh đi qua tường, ánh sáng thì không.
- *"Cả nhóm biết kiểu gì?"* → Chia sẻ theo bán kính hai lăm mét với độ trễ một tới ba giây, chia sẻ **vị trí cuối cùng** chứ không phải vị trí hiện tại, và bắt buộc phải có **hành động nhìn thấy được** — tiếng hét, pháo hiệu. Điểm cuối quan trọng nhất vì nó cho người chơi cơ hội ngăn chặn: giết kẻ định hét trước khi nó hét là một khoảnh khắc gameplay.
- *"Thời gian quên đặt bao nhiêu?"* → Mười lăm giây quanh đó cho lính thường. Quên quá nhanh thì AI trông ngớ ngẩn, quá chậm thì người chơi không bao giờ thoát được và lén lút thành trò kiên nhẫn. Và sau khi tìm không thấy, tôi không cho nó về trạng thái y hệt ban đầu — tuần tra rộng hơn một phút, để hành động của người chơi có để lại dấu vết.
- *"Mẹo nào làm NPC trông thông minh mà rẻ?"* → Đoán theo hướng di chuyển cuối: thấy người chơi chạy về phía đông rồi mất dấu thì tìm xa hơn một chút về phía đông. Tốn một phép cộng vector, tạo ấn tượng đang suy luận.
- *"Chỉ báo cảnh giác thì sao?"* → Phải gắn với NPC cụ thể, đầy dần chứ không nhảy bậc, và cho biết hướng nếu người chơi không thấy NPC đó. Quan trọng nhất: nó phải chạy **đúng cái biến AI dùng để quyết định**. Nếu thanh chạy theo một hàm làm đẹp riêng thì người chơi học một mô hình sai, và mọi sự công bằng mình xây đều không truyền đạt được.

**Cờ đỏ**

- `Vector3.Distance < range` rồi coi như đã có perception.
- Bỏ raycast che khuất để tiết kiệm hiệu năng.
- Chỉ có nón nhìn, không có vùng cận kề.
- Thông tin lan khắp nhóm tức thì, không có hành động nhìn thấy được.
- Có thang awareness nhưng behavior tree vẫn đọc một cờ nhị phân suy ra từ thang.
- Không có chỉ báo, rồi giải thích rằng "người chơi sẽ tự cảm nhận".

**Số / ví dụ nên thuộc**

- Nón: góc **90–120°**, tầm **15–25 m**, vùng cận kề **2–3 m** (bỏ qua góc).
- Raycast **5–10 lần/giây**, không mỗi frame.
- Thang awareness đầy trong **0,5 s** ở cận kề, **3–4 s** ở rìa nón; tốc độ tụt **1/3** tốc độ lên.
- Bán kính nghe: bò **0** · lén **3–5 m** · đi **8–10 m** · chạy **15–20 m** · súng không giảm thanh **40 m+**.
- Thời gian quên **10–20 giây**.
- Chia sẻ nhóm: bán kính **20–30 m**, độ trễ **1–3 giây**.
