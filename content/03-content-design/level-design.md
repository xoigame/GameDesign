---
title: Level Design
icon: 🏗️
summary: Dẫn dắt người chơi bằng không gian — sight line, landmark, vòng lặp không gian, và dạy học không lời.
status: deep
read: 260
level: intermediate
order: 10
tags: [content, level]
related: [pacing, combat-systems, difficulty-curve, procedural-generation]
---

Level design là nghệ thuật **khiến người chơi làm điều bạn muốn mà họ tưởng đó là ý mình**.

## Dẫn dắt không lời

Người chơi đi theo, gần như vô thức, theo thứ tự ưu tiên sau:

1. **Ánh sáng** — mạnh nhất. Mắt luôn đi về phía sáng nhất trong khung hình.
2. **Chuyển động** — cờ bay, hơi nước, NPC đi lại.
3. **Tương phản màu** — một điểm màu ấm giữa nền lạnh.
4. **Đường dẫn hình học** — hành lang, lan can, vệt sáng trên sàn.
5. **Landmark** — công trình cao nhìn thấy từ xa, làm điểm định hướng.

Half-Life 2 và Dishonored là giáo trình mẫu mực của bốn kỹ thuật đầu. Nếu phải đặt biển chỉ đường, thường là bố cục đã thất bại.

## Ngôn ngữ hình khối

Người chơi học nghĩa từ hình dạng rất nhanh, miễn là bạn nhất quán:

- Chỗ bám được luôn có màu/chất liệu riêng (vàng trong Uncharted, trắng trong Mirror's Edge).
- Chỗ phá được luôn có cùng dấu hiệu nứt.
- Kẻ địch nguy hiểm có hình bóng khác biệt ở kích thước thu nhỏ.

**Kiểm tra bằng hình bóng đen:** tô toàn bộ màn hình thành đen trắng thuần. Nếu vẫn phân biệt được kẻ địch, vật thể tương tác và lối đi, thiết kế hình khối của bạn tốt.

## Vòng lặp không gian

Level tuyến tính buộc người chơi đi ngược đường cũ để quay lại — chán. Giải pháp: **vòng lặp và đường tắt**.

Cấu trúc của Dark Souls: đi xa, mở một cánh cửa tắt quay về điểm xuất phát. Hiệu ứng kép:
- Phần thưởng không gian, cảm nhận được ngay, không cần vật phẩm.
- Người chơi xây được bản đồ trong đầu → cảm giác làm chủ nơi chốn.

## Nhịp không gian

Đừng để mọi căn phòng đều là trận đánh. Nhịp cơ bản:

```
Khám phá  →  Chiến đấu  →  Thưởng  →  Nghỉ  →  (lặp)
   ngắn       cao trào     ngắn      dài
```

Khoảng nghỉ **cần thiết về mặt chức năng**, không phải thời gian chết: nó cho phép người chơi xử lý thông tin, và tạo tương phản khiến trận sau căng hơn. Xem [[pacing]].

## Dạy học qua ba nhịp

Công thức đưa cơ chế mới vào mà không cần tutorial:

1. **Bối cảnh an toàn** — giới thiệu cơ chế ở nơi thất bại không bị phạt. (Nấm đầu tiên trong Mario đi *về phía* người chơi trong một hành lang kín — không thể tránh được việc học.)
2. **Áp dụng có phạt** — dùng cơ chế đó với rủi ro thật.
3. **Kết hợp** — cơ chế mới + cơ chế cũ trong cùng một bài toán.

Sau ba nhịp này, cơ chế đã thuộc về vốn từ vựng của người chơi và có thể dùng tự do.

## Danh sách kiểm tra một màn chơi

- [ ] Người chơi luôn biết đi hướng nào trong vòng 3 giây sau khi vào phòng mới.
- [ ] Có ít nhất một landmark nhìn thấy từ nhiều vị trí.
- [ ] Có đường tắt hoặc vòng lặp, không phải hành lang một chiều.
- [ ] Cơ chế mới được giới thiệu an toàn trước khi bị kiểm tra.
- [ ] Có khoảng nghỉ trước và sau cao trào.
- [ ] Test hình bóng đen vẫn đọc được.
- [ ] Có ít nhất một tuyến đường thay thế hoặc bí mật cho người chơi tò mò.

## 🤖 Prompt cho AI

AI **rất kém ở bố cục không gian** — nó không có trực giác 3D và không cảm nhận được khoảng cách hay tầm nhìn. Đừng nhờ nó "thiết kế một màn chơi hay".

Nhưng nó rất hữu ích ở những việc quanh đó:
- Sinh bố cục dạng lưới theo **ràng buộc** bạn viết ra ("9×9, đúng 1 lối vào, 2 lối ra, không có hành lang cụt dài quá 3 ô, tối thiểu 2 vòng lặp").
- Kiểm tra bất biến trên dữ liệu màn chơi: có đường đi được không, có phòng mồ côi không, mật độ kẻ địch có vượt ngân sách không.
- Sinh biến thể trang trí từ một bố cục nền do bạn dựng.

Nói cách khác: **bạn thiết kế không gian, AI thi hành luật và kiểm tra.**

## 🎮 Unity

Unity là công cụ dựng màn tốt, nhưng **nó không ngăn bạn tạo màn không đi được**. Phần đó phải tự viết validator.

**Nơi các quyết định sống**

- `Assets/Scenes/Levels/Level_XX.unity` — bố cục, dựng bằng mắt
- `Assets/Data/Levels/Level_XX.asset` — ngân sách quái, cơ chế (xem [[difficulty-curve]])
- `Assets/Editor/LevelValidator.cs` — quét scene, cảnh báo lỗi bố cục

**Dựng khối: ProBuilder hay Tilemap**

- **2D:** Tilemap + Rule Tile. Rule Tile tự chọn sprite theo lân cận — tiết kiệm rất nhiều công vẽ viền.
- **3D:** ProBuilder cho greybox. Đừng dựng greybox bằng Cube scale — không sửa được hình dạng sau.

Dựng greybox bằng primitive rồi thay art sau là con đường đúng, nhưng phải dùng **cùng một collider layout** để thay art không đổi gameplay.

**Validator — quét bố cục ngay trong Editor**

```csharp
[MenuItem("Tools/Level/Validate Current Scene")]
static void Validate() {
    // 1. Đích đến có tới được không — flood fill trên NavMesh
    var spawn = GameObject.FindWithTag("PlayerSpawn").transform.position;
    var exit  = GameObject.FindWithTag("LevelExit").transform.position;
    var path  = new NavMeshPath();
    if (!NavMesh.CalculatePath(spawn, exit, NavMesh.AllAreas, path)
        || path.status != NavMeshPathStatus.PathComplete)
        Debug.LogError("Không có đường từ spawn tới exit — bake NavMesh chưa?");

    // 2. Landmark nhìn thấy từ nhiều chỗ
    var landmarks = GameObject.FindGameObjectsWithTag("Landmark");
    if (landmarks.Length == 0) Debug.LogWarning("Màn không có landmark nào");

    // 3. Vật thể lơ lửng — lỗi hay gặp khi copy-paste
    foreach (var r in Object.FindObjectsByType<Renderer>(FindObjectsSortMode.None))
        if (!Physics.Raycast(r.bounds.center, Vector3.down, 50f))
            Debug.LogWarning($"{r.name} có thể đang lơ lửng", r);
}
```

Ba kiểm tra này bắt được phần lớn lỗi màn chơi "không chơi được", và chạy trong một giây.

**Test silhouette ngay trong Scene view**

Scene view có **Shading Mode → Shaded Wireframe**, và quan trọng hơn là **Draw Mode → Overdraw**. Nhưng để test silhouette (đọc được hình khối), cách nhanh nhất là một `Volume` với Saturation = −100 gán vào camera phụ — xem [[art-direction]].

**Occlusion Culling — bake sau khi bố cục ổn**

`Window > Rendering > Occlusion Culling`. Chỉ bake khi hình khối đã chốt, vì nó phải bake lại mỗi lần đổi geometry tĩnh. Đánh dấu `Occluder Static` / `Occludee Static` đúng — chi tiết ở [[unity-optimization]].

**Bẫy Unity cụ thể**
- **Quên bake NavMesh** sau khi sửa geometry → validator báo không có đường, hoặc tệ hơn là NPC đứng im trong build.
- **Lighting chưa bake** → màn trông khác hoàn toàn giữa Editor và build. Xem [[unity-lighting]].
- **Scene merge conflict** — hầu như không giải được. Chia scene theo người, dùng additive.

**Kiểm tra nhanh**
- Chạy Validate: có đường từ spawn tới exit chứ?
- Build ra rồi chơi: lighting giống Editor không?
- Có ít nhất một vòng lặp/đường tắt trong màn chứ? (validator khó tự kiểm, phải tự đi thử)
