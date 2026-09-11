---
title: Perception & Senses
icon: 👁️
summary: Tầm nhìn, thính giác, trí nhớ — hệ thống làm cho AI vừa công bằng vừa trông có vẻ công bằng.
status: stub
read: 450
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
