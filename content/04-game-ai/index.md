---
title: AI trong Game
icon: 🤖
summary: AI điều khiển NPC và gameplay — FSM, Behavior Tree, GOAP, Utility AI, pathfinding, AI Director, LLM-NPC.
status: deep
read: 420
level: basic
order: 40
tags: [ai, npc]
related: [combat-systems, ai-assisted-dev, difficulty-curve]
---

Đây là **AI *trong* game**: con quái biết né đạn, NPC biết đi chợ, hệ thống biết điều tiết nhịp độ. Đừng nhầm với [[ai-assisted-dev]] — đó là dùng AI để *làm ra* game.

## Sự thật quan trọng nhất

> **Mục tiêu của game AI không phải là thông minh. Mục tiêu là *tỏ ra* thông minh và làm cho người chơi vui.**

AI chơi hoàn hảo thì dễ viết một cách đáng ngạc nhiên — và gây chán một cách đáng tin cậy. Bot aimbot bắn trăm phát trăm trúng không vui. Việc khó là làm AI **thua một cách thú vị**: đủ giỏi để đáng gờm, đủ đọc được để người chơi học được cách thắng.

Hệ quả: rất nhiều "AI" trong game xuất sắc thực ra là **sân khấu**. Kẻ địch trong F.E.A.R. hô báo động khi bọc sườn không phải vì chúng phối hợp — chúng hô để *bạn biết* chúng đang bọc sườn. Nếu AI thông minh mà người chơi không nhận ra, coi như không có.

## Chọn kiến trúc nào

| Kỹ thuật | Phù hợp | Độ phức tạp | Khả năng mở rộng |
|---|---|---|---|
| [[fsm]] | Hành vi đơn giản, ít trạng thái | Rất thấp | Kém — bùng nổ chuyển tiếp |
| [[behavior-tree]] | Hầu hết NPC trong game thương mại | Trung bình | Tốt |
| [[utility-ai]] | Quyết định nhiều lựa chọn cạnh tranh, sim | Trung bình | Tốt |
| [[goap]] | NPC cần lập kế hoạch nhiều bước | Cao | Trung bình |
| [[ml-rl]] | Nghiên cứu, bot đối kháng | Rất cao | Khó kiểm soát |
| [[llm-npc]] | Hội thoại, tính cách | Trung bình | Tốn tiền, độ trễ cao |

**Lời khuyên thực dụng:** bắt đầu bằng [[fsm]]. Chuyển sang [[behavior-tree]] khi FSM vượt quá ~6 trạng thái. Chỉ dùng [[goap]] khi thật sự cần NPC tự tìm ra chuỗi hành động. Phần lớn game không cần.

## Các node hỗ trợ

- **[[pathfinding]]** — A*, NavMesh, flow field. Nền tảng của mọi thứ biết di chuyển.
- **[[steering-flocking]]** — chuyển động mượt và hành vi bầy đàn.
- **[[perception]]** — tầm nhìn, thính giác, trí nhớ. Cái làm AI *có vẻ* công bằng.
- **[[ai-director]]** — AI ở tầng hệ thống, điều tiết nhịp độ cả trận.

## Ba nguyên tắc thiết kế AI

**Đọc được quan trọng hơn tối ưu.** Kẻ địch phải *thông báo* ý định. Xem telegraph ở [[combat-systems]].

**Sự bất hoàn hảo phải có chủ ý.** Thêm thời gian phản ứng (200–400ms), độ lệch khi ngắm, khoảng do dự. Nhưng đừng làm ngẫu nhiên thuần — hãy làm nhất quán để người chơi học được.

**AI phải chơi công bằng — và trông có vẻ công bằng.** Nếu AI biết vị trí người chơi xuyên tường, người chơi sẽ cảm thấy bị lừa dù số liệu cân bằng. Xem [[perception]].

## 🤖 Prompt cho AI

**Dùng AI thế nào ở nhánh này**

Hai bước, và bước một hay bị bỏ:

**Bước 1 — bắt nó chọn kiến trúc và biện minh.** Mô tả hành vi ở mức *quan sát được*, cho ràng buộc (số NPC, ngân sách CPU, mức kiểm soát bạn cần), rồi yêu cầu so sánh FSM / BT / Utility / GOAP cho **trường hợp này** và khuyến nghị một cái. Chưa viết code.

**Bước 2 — đưa cây/bảng đã vẽ sẵn, nó cài đặt.** Đừng để nó tự thiết kế cấu trúc ưu tiên; đó là quyết định thiết kế.

**Bẫy đặc trưng của nhánh này:** AI mặc định đề xuất GOAP hoặc machine learning vì nghe thông minh hơn. Với phần lớn game indie, câu trả lời đúng là FSM hoặc Behavior Tree. Ràng buộc *"tôi cần chỉnh tay được mà không sửa code"* thường tự loại GOAP và RL.

Và luôn yêu cầu **phần sân khấu**: AI thông minh mà người chơi không nhận ra thì bằng không.

**Phải nêu rõ:**
- Hành vi mong muốn mô tả ở mức **quan sát được**, không ở mức kỹ thuật
- Số lượng NPC đồng thời và ngân sách CPU
- Mức độ kiểm soát bạn cần (nhà thiết kế có phải chỉnh tay không)
- Người chơi phải **nhận ra** được điều gì — phần "sân khấu"

**Mẫu prompt chọn kiến trúc**

```
Trước khi viết code, hãy TƯ VẤN CHỌN KIẾN TRÚC.

Hành vi mong muốn (mức quan sát được):
- Kẻ địch tuần tra, phát hiện người chơi, truy đuổi, tấn công
- Máu thấp thì tìm chỗ nấp và hồi máu
- Nhiều con cùng lúc thì biết tản ra, không chen nhau

Ràng buộc: tối đa 30 NPC đồng thời, ngân sách 2ms/frame cho toàn bộ AI.
Tôi cần chỉnh tay được độ ưu tiên hành vi mà không phải sửa code.

So sánh FSM / Behavior Tree / Utility AI / GOAP cho trường hợp NÀY.
Khuyến nghị MỘT cái, nêu rõ đánh đổi. Chưa viết code.
```

**Bẫy thường gặp:** AI mặc định đề xuất GOAP hoặc machine learning vì nghe "thông minh hơn". Với 90% game indie, câu trả lời đúng là FSM hoặc Behavior Tree. Ràng buộc *"tôi cần chỉnh tay được"* thường tự loại GOAP và RL ra.

**Nhớ yêu cầu phần sân khấu:** AI thông minh mà người chơi không nhận ra thì bằng không. Luôn thêm: *"mỗi khi NPC đổi ý định, phát tín hiệu người chơi thấy được — lời thoại, biểu tượng, đổi tư thế."*

## 🎮 Unity

Unity không có hệ AI dựng sẵn nào đáng dùng cho gameplay — `Animator` state machine là để hiển thị, không phải để ra quyết định. Bạn sẽ tự viết, và đó là chuyện tốt.

**Bố cục thư mục khuyến nghị**

```
Assets/Scripts/AI/
├── Core/            ← C# thuần: State, BTNode, Blackboard, Scorer
├── Behaviours/      ← state/node cụ thể của game
├── Perception/      ← Perception.cs, ghi vào blackboard
├── Data/            ← EnemyConfig (ScriptableObject)
└── Debug/           ← gizmo, overlay
```

**Ba thứ dựng trước, dùng cho mọi kiến trúc**

```csharp
// 1. Blackboard — nơi duy nhất chứa trạng thái AI
public class Blackboard {
    readonly Dictionary<string, object> data = new();
    public T Get<T>(string k) => data.TryGetValue(k, out var v) ? (T)v : default;
    public void Set<T>(string k, T v) => data[k] = v;
}

// 2. Tick có điều tiết — KHÔNG chạy AI mỗi frame
public abstract class AiBrain : MonoBehaviour {
    [SerializeField] protected float tickHz = 10f;
    float timer;
    void Start() => timer = Random.Range(0f, 1f / tickHz);   // lệch pha
    void Update() {
        timer -= Time.deltaTime;
        if (timer > 0f) return;
        timer += 1f / tickHz;
        Think(1f / tickHz);
    }
    protected abstract void Think(float dt);
}

// 3. Gizmo hiển thị "AI đang nghĩ gì"
#if UNITY_EDITOR
void OnDrawGizmosSelected() =>
    UnityEditor.Handles.Label(transform.position + Vector3.up * 2f, DebugLabel);
#endif
```

**Bẫy Unity cụ thể**
- **Đừng dùng Animator Controller làm FSM gameplay.** Không test được, không in ra được, và trộn hiển thị với luật chơi.
- **`Random.Range` lúc `Start()` để lệch pha tick** — thiếu nó thì 30 NPC cùng tick một frame, Profiler thấy spike đều đặn.
- **AI đọc `player.transform` trực tiếp = gian lận.** Mọi thứ phải đi qua [[perception]].

**Kiểm tra nhanh**
- Chọn một NPC trong Scene view: có thấy nó đang ở trạng thái/hành động nào không?
- Profiler với 30 NPC: mục AI dưới 2ms/frame?
- `grep -r "using UnityEngine" Assets/Scripts/AI/Core/` → nên rỗng.

## 🎤 Phỏng vấn

Node con trong nhánh này đều có mục 🎤 riêng. Mục này gom câu hỏi **chọn kiến trúc AI** — loại câu
mà người phỏng vấn dùng để phân biệt người biết tên kiến trúc với người đã chịu hậu quả của một lựa chọn.

**AI programmer được hỏi ở ba dạng**

| Dạng | Họ đo cái gì | Node nên ôn |
|---|---|---|
| "Chọn kiến trúc cho NPC này" | Bạn chọn theo hình dạng bài toán hay theo độ hiện đại | [[fsm]], [[behavior-tree]], [[utility-ai]], [[goap]] |
| "NPC làm điều kỳ quặc, sửa sao" | Bạn có công cụ nhìn được AI đang nghĩ gì không | [[behavior-tree]], [[perception]] |
| "Hàng trăm agent tụt frame" | Bạn biết chỗ chi phí thật nằm ở đâu | [[pathfinding]], [[steering-flocking]] |

**Câu hay gặp**

- `Junior` **FSM, behavior tree, utility AI, GOAP — chọn cái nào cho kẻ địch thường?**
  → Theo **số hành vi và mức chúng chia sẻ điều kiện**. Dưới năm trạng thái, ít điều kiện chung: **FSM**, vì nó rẻ và dễ chẩn đoán nhất. Nhiều hành vi có ưu tiên cạnh tranh: **BT**. Nhiều nhu cầu cần chấm điểm liên tục: **utility**. Cần tự tìm chuỗi hành động cho mục tiêu chưa lường trước: **GOAP**. Rất nhiều game thương mại dùng FSM cho địch thường và BT cho boss.
- `Junior` **Vì sao không dùng `canSeePlayer` kiểu bool?**
  → Vì nó xoá mất toàn bộ vùng chơi: lén lút diễn ra trong khoảng giữa "chưa biết" và "đã biết". Thang awareness 0→1 còn cho bốn trạng thái hành vi phân biệt được — tuần tra, nghi ngờ, điều tra, báo động — và cho người chơi cửa sổ để phản ứng, tức là phần gameplay thật của thể loại.
- `Mid` **AI của anh đổi ý liên tục, hành vi giật cục. Nguyên nhân chung là gì?**
  → **Thrashing** — hai lựa chọn có giá trị gần nhau quanh một ngưỡng. Cách chữa giống nhau ở mọi kiến trúc: **ngưỡng trễ (hysteresis)** — vào chế độ chạy trốn ở HP < 25% nhưng chỉ thoát ở HP > 40% — cộng cooldown hoặc **cam kết tối thiểu N giây** cho quyết định đã chọn.
- `Mid` **500 đơn vị cùng đuổi người chơi. Anh dùng gì?**
  → **Flow field**: một lần Dijkstra từ đích ra toàn bản đồ, mỗi ô lưu hướng tốt nhất, mỗi agent chỉ đọc O(1). Chênh hai bậc độ lớn so với 500 lần A*. Và bất kể thuật toán nào, khi có nhiều agent thì việc rẻ nhất và ăn nhất vẫn là **trải đều tìm đường theo thời gian** — hàng đợi, giới hạn N lần mỗi frame.
- `Senior` **Làm sao để AI vừa công bằng vừa trông có vẻ công bằng?**
  → Hai phần tách rời. **Công bằng**: một nguồn duy nhất được biết về người chơi — `PerceptionSystem` — mọi truy cập `player.transform` ở nơi khác là vi phạm, và luật đó **kiểm tra được bằng grep**. **Trông có vẻ công bằng**: chia sẻ thông tin trong nhóm phải kèm **hành động nhìn thấy được** như tiếng hét, và chỉ báo cảnh giác phải chạy theo đúng biến AI dùng để quyết định.
- `Senior` **NPC thông minh mà người chơi không nhận ra. Vấn đề ở đâu?**
  → Ở phần **sân khấu**, không ở phần AI. Kẻ địch F.E.A.R. trông như biết bọc sườn một phần nhờ planner chèn bước di chuyển, một phần nhờ câu thoại "Bọc sườn nó!" phát đúng lúc đó. Thiếu lời thoại thì người chơi chỉ thấy địch biến mất rồi xuất hiện ở sườn — không phân biệt được với đi lung tung.

**Khung trả lời 60 giây** — "Anh chọn kiến trúc AI cho một game thế nào?"

> Theo **hình dạng bài toán**, không theo độ hiện đại của kiến trúc. Ít trạng thái và ít điều kiện chung thì FSM là đủ, và nó có một ưu thế không kiến trúc nào khác có: in tên trạng thái ra là biết ngay AI đang nghĩ gì. Giới hạn của nó là số chuyển tiếp tăng theo **bình phương** — năm trạng thái là hai mươi cạnh, mười hai trạng thái là một trăm ba mươi hai.
>
> Khi nhiều hành vi có ưu tiên cạnh tranh thì chuyển sang **behavior tree**, vì ở đó ưu tiên nằm ở **cấu trúc**: kéo một nhánh lên xuống là đổi độ ưu tiên, các nhánh khác không biết gì về nhau. Nhiều nhu cầu cần chấm điểm liên tục thì **utility**; cần tự tìm chuỗi hành động cho tình huống chưa lường trước thì **GOAP** — nhưng GOAP đắt CPU và khó gỡ lỗi, nên trong sản phẩm thật nó thường là **GOAP chiến lược cộng BT chiến thuật**.
>
> Và bất kể kiến trúc nào, tôi luôn làm hai thứ: tách **perception thành nguồn duy nhất** biết về người chơi, và dựng công cụ **nhìn được AI đang nghĩ gì** — bảng điểm, đường đi của tick, kế hoạch đã chọn.

**Cờ đỏ**

- Chọn kiến trúc theo độ hiện đại, không nói được ngưỡng nó vỡ ở đâu.
- `Vector3.Distance < range` rồi coi như đã có perception.
- Không có cơ chế chống dao động nào.
- Không có công cụ nhìn được AI đang quyết định gì.
- Tính lại đường đi mỗi frame, hoặc cho mọi agent tìm đường trong cùng một frame.

**Số / ví dụ nên thuộc**

- FSM: chuyển tiếp tăng theo **bình phương** — 5 trạng thái **20 cạnh**, 12 trạng thái **132 cạnh**.
- BT: **40–50 node** thì tách subtree; tick **5–10 lần/giây**, trải đều giữa agent.
- Hysteresis mẫu: vào ở **25%**, thoát ở **40%**.
- Perception: nón **90–120°**, tầm **15–25 m**, vùng cận kề **2–3 m**; raycast **5–10 lần/giây**.
- Nhiều agent: **flow field** khi chung đích; **6–8 láng giềng** cho bầy đàn; trải đều tìm đường theo thời gian.
