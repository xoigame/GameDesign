---
title: Multiplayer & Netcode
icon: 🌐
summary: Multiplayer làm từ ngày đầu hoặc không bao giờ — retrofit gần như là viết lại. Chọn stack theo thể loại và ngân sách, không tin client, và test với lag giả từ tuần đầu.
status: deep
read: 760
level: advanced
order: 160
tags: [unity, multiplayer, netcode]
related: [combat-systems, architecture-patterns, unity-game-loop, unity-optimization]
---

Quyết định số một, trước cả chọn thư viện: **game này có multiplayer không — quyết ngay hôm nay, và nếu có thì mọi dòng code gameplay từ giờ viết theo mô hình mạng.** "Làm single trước, thêm co-op sau" là câu nói đắt nhất trong gamedev Unity: single-player cho phép mọi script tự đổi state, gọi thẳng nhau, tin `transform.position` của chính nó. Netcode đòi một bên có quyền quyết định, mọi thay đổi đi qua kênh đồng bộ, và presentation tách khỏi simulation. Retrofit nghĩa là đụng vào **mọi** script gameplay — thực tế là viết lại với ràng buộc mới.

Mặt khác: nếu game không *cần* multiplayer để vui, đừng làm. Nó nhân đôi thời gian mọi tính năng, thêm chi phí server hàng tháng, và một bug đồng bộ mất một tuần thay vì một giờ.

## Chọn stack

| | **Netcode for GameObjects (NGO)** | **Mirror** | **Photon Fusion 2** | **Netcode for Entities** |
|---|---|---|---|---|
| Mô hình | Server/host-authoritative; 2.x thêm Distributed Authority (cần UGS) | Server/host-authoritative | Host, Server, Shared mode | Server-authoritative, ECS |
| Prediction/rollback | **Tự viết** | **Tự viết** | Có sẵn (CSP + rollback) | Có sẵn (ghost prediction) |
| Số người thoải mái | 2–16 | 2–64 (tuỳ code) | 2–200 | 64–200+ |
| Hosting | Unity Relay, Multiplay, tự host | Tự host; Steam/Epic transport | Photon Cloud (bắt buộc) | Unity Relay, Multiplay |
| Chi phí | Miễn phí; Relay/Multiplay trả theo dùng | MIT, miễn phí | Miễn phí 20 CCU; ~95 USD/tháng cho 100 CCU | Miễn phí; server trả theo dùng |
| Hợp với | Co-op indie 2–8, party game, đội đã quen GameObject | Indie muốn kiểm soát code, cộng đồng lớn, nhiều transport | Action/shooter cần CSP mà không muốn tự viết, có ngân sách | Competitive quy mô lớn, đội đã dùng DOTS |

Bổ sung: **FishNet** miễn phí, có prediction sẵn, cộng đồng nhỏ hơn Mirror — đáng cân nhắc cho action indie không muốn trả Photon. Node này dùng **NGO 2.x** làm ví dụ vì nó là mặc định của Unity 6 và tích hợp Relay/Lobby/Multiplayer Play Mode.

Câu hỏi quyết định thật sự: **game có cần client-side prediction không?** Co-op PvE nhịp chậm, party game, board game: không — NGO/Mirror đủ, và bạn tiết kiệm được 2 tháng. Shooter, fighting, racing PvP: có — và tự viết CSP trên NGO là một dự án con 1–3 tháng cho một người giỏi. Nếu đội chưa từng làm, Fusion mua thời gian đó bằng tiền.

## Authority và hosting

| Mô hình | Ai quyết | Ưu | Nhược |
|---|---|---|---|
| **Client-authoritative** | Mỗi client tự báo vị trí/máu | Không lag cho chính mình, dễ viết | Gian lận tầm thường (sửa bộ nhớ là bay), không hợp mọi thứ PvP |
| **Host (listen server)** | Một người chơi là server | Không tốn server, NGO/Mirror mặc định | Host có lợi thế 0ms; host thoát là hết trận; cần Relay để vượt NAT |
| **Dedicated server** | Máy riêng, không render | Công bằng, chống gian lận, không host migration | Tốn tiền hàng tháng, cần build headless và vận hành |

Indie không có server: **Host + Unity Relay** (vượt NAT không cần port-forward, join code 6 ký tự) + **Unity Lobby** (danh sách phòng, heartbeat). Trực tiếp UDP không relay thất bại ở khoảng một phần ba mạng gia đình — Relay là mặc định, không phải tuỳ chọn. Lobby yêu cầu host gửi heartbeat ≤ 30s một lần, không thì phòng biến mất. Chuyển sang dedicated (Multiplay hoặc VPS tự thuê) khi PvP có xếp hạng hoặc trận đấu không được phép chết vì host rớt mạng.

## NGO cụ thể: NetworkVariable hay Rpc

Hai công cụ, hai việc khác nhau — dùng nhầm là bug đồng bộ khó thấy nhất:

- **`NetworkVariable<T>`** là *trạng thái*: máu, điểm, cửa mở/đóng. Chỉ gửi khi đổi, người vào sau nhận giá trị hiện tại, đồng bộ trễ ~1 tick. Mặc định **chỉ server ghi**; đổi write permission sang Owner cho thứ client tự quyết (tên, màu skin).
- **`Rpc`** là *sự kiện*: "phát âm thanh trúng đòn ở đây", "xin tấn công mục tiêu X". Không có trạng thái, người vào sau **không nhận** — dùng Rpc cho máu là late joiner thấy kẻ địch đầy máu.

NGO 1.8+/2.x dùng `[Rpc(SendTo.X)]` thống nhất; `[ServerRpc]`/`[ClientRpc]` cũ vẫn biên dịch nhưng đừng viết mới. Tên phương thức **bắt buộc kết thúc bằng `Rpc`** — codegen dựa vào đó.

```csharp
using Unity.Netcode;
using UnityEngine;

public class NetHealth : NetworkBehaviour {
    [SerializeField] AttackData attack;
    [SerializeField] float attackRange = 2f;

    // Trạng thái: server ghi, mọi người đọc. Late joiner nhận giá trị hiện tại.
    public NetworkVariable<int> Hp = new(100,
        NetworkVariableReadPermission.Everyone,
        NetworkVariableWritePermission.Server);

    public override void OnNetworkSpawn() {
        Hp.OnValueChanged += (oldHp, newHp) => HealthBar.Set(gameObject, newHp);
        HealthBar.Set(gameObject, Hp.Value);                       // giá trị lúc spawn, không có sự kiện
    }

    // Client XIN — server QUYẾT. Không nhận damage từ client, chỉ nhận ý định.
    [Rpc(SendTo.Server)]
    public void RequestAttackRpc(ulong targetNetId, RpcParams rpcParams = default) {
        ulong sender = rpcParams.Receive.SenderClientId;
        if (sender != OwnerClientId) return;                        // không được đánh thay người khác
        if (!NetworkManager.SpawnManager.SpawnedObjects.TryGetValue(targetNetId, out var targetObj)) return;
        var target = targetObj.GetComponent<NetHealth>();
        if (target == null || target.Hp.Value <= 0) return;
        if (Vector3.Distance(transform.position, target.transform.position) > attackRange * 1.2f) return;   // 20% dung sai cho lag
        if (!Cooldowns.Ready(sender, attack)) return;               // rate-limit theo client, không theo lời client kể

        target.Hp.Value = Mathf.Max(0, target.Hp.Value - attack.damage);
        target.PlayHitFxRpc(transform.position);
    }

    // Sự kiện một lần cho presentation — Rpc, không phải NetworkVariable
    [Rpc(SendTo.ClientsAndHost)]
    void PlayHitFxRpc(Vector3 from) => HitFx.Play(transform.position, from);
}
```

Struct tự định nghĩa trong `NetworkVariable` hay tham số Rpc phải implement `INetworkSerializable` — NGO không serialize bằng reflection, và nhờ vậy nó sống được qua IL2CPP stripping.

## NetworkTransform, tick rate, băng thông

`NetworkTransform` đồng bộ vị trí/xoay/scale theo **tick** (`NetworkConfig.TickRate`, mặc định 30). Bật `Interpolate` cho mọi vật thể người khác nhìn thấy; tắt kênh không cần (2D: bỏ Z, bỏ xoay X/Y); `Position Threshold` 0.01 để không gửi khi đứng yên; `Use Half Float Precision` và `Use Quaternion Compression` khi map dưới 1km. NGO 2.x có `AuthorityMode` Server/Owner trên chính component — Owner cho nhân vật của người chơi trong co-op (mượt, chấp nhận gian lận), Server cho PvP (kèm prediction, bên dưới).

Ước lượng băng thông để không mù: một cập nhật NetworkTransform ≈ 12B vị trí + 4–16B xoay + ~20B header ≈ **40B**. Ở tick 30 là 1.2 KB/s **cho mỗi vật thể, cho mỗi client nhận**. 8 người chơi: mỗi client nhận 7 × 1.2 ≈ 8.4 KB/s, host gửi 8 × 7 × 1.2 ≈ 67 KB/s ≈ 0.5 Mbit/s upload — vừa đủ cho mạng gia đình, và là lý do host 16 người bắt đầu nghẽn. Tick 60 gấp đôi mọi con số; chỉ đáng cho fighting/shooter. Tick 20 đủ cho co-op nhịp chậm. 100 kẻ địch AI đồng bộ bằng NetworkTransform ở tick 30 là 120 KB/s mỗi client — thay bằng đồng bộ **seed + input** hoặc chỉ đồng bộ kẻ địch trong tầm nhìn (`NetworkObject.CheckObjectVisibility`).

## Prediction, reconciliation, lag compensation

Nhân vật của **chính mình** với server-authoritative mà không prediction: bấm sang trái, 100ms sau mới nhích — không chơi được. Ba kỹ thuật, ba đối tượng khác nhau:

1. **Client-side prediction + reconciliation** cho *nhân vật mình*: client chạy simulation ngay với input local, gửi `(tick, input)` lên server, giữ buffer input 1 giây. Server mô phỏng cùng input, gửi về `(tick, state)`. Client so với state đã dự đoán ở tick đó; lệch quá 0.01 thì đặt lại state rồi **chạy lại** mọi input từ tick đó tới hiện tại. Điều kiện bắt buộc: simulation là hàm thuần `Step(state, input, dt)` không đụng `Time`, không random không seed, không đọc gì ngoài tham số.
2. **Interpolation** cho *người khác*: hiển thị họ ở quá khứ 2–3 tick (67–100ms ở tick 30) để luôn có hai snapshot mà nội suy — mượt, đổi lại họ "chậm" 100ms. Đây là thứ `NetworkTransform.Interpolate` làm.
3. **Lag compensation** cho *hitscan*: người bắn nhìn thấy mục tiêu ở quá khứ (RTT/2 + interpolation delay); server khi kiểm tra trúng phải **tua lại hitbox** của mục tiêu về đúng thời điểm đó. Server giữ ring buffer vị trí hitbox 1 giây (30 snapshot ở tick 30), tính `rewindTick = serverTick − (rtt/2 + interpDelay) / tickInterval`, raycast vào hitbox tại tick đó. Không có nó, người ping 150ms phải "bắn trước" mục tiêu — và họ sẽ bỏ game.

Đạn bay chậm (projectile) không cần lag compensation: spawn trên server, client dự đoán bằng RPC bắn ngay tại chỗ với id tạm rồi khớp với bản server khi tới.

## Tách simulation khỏi presentation

Server headless **không render, không có Animator chạy, không có AudioSource**, và không nên có — mỗi component presentation trên server là CPU và RAM lãng phí, và nếu logic đọc `animator.GetCurrentAnimatorStateInfo` để quyết định hitbox thì server không có đáp án. Ranh giới của [[architecture-patterns]] — logic thuần trong `Core/`, MonoBehaviour là vỏ — ở đây không còn là "nên" mà là **bắt buộc**: cùng một `CombatSim.Step()` chạy trên server, trên client để prediction, và trong test không mạng.

Unity 6 có platform **Dedicated Server** riêng khi build (`#if UNITY_SERVER`): strip renderer, chạy `-batchmode -nographics`. Đặt `Application.targetFrameRate = tickRate` trong build server — không thì vòng lặp chạy vô hạn tốc độ và ăn 100% một nhân CPU cho mỗi phòng. Tách prefab: `Player_Sim` (NetworkObject, collider, logic) spawn ở mọi nơi; `Player_View` (mesh, Animator, VFX) chỉ client spawn thêm và bám theo.

## Determinism: PhysX không có

Rollback đòi hỏi: cùng input + cùng state → cùng kết quả, **bit-exact**, trên mọi máy. PhysX và Box2D trong Unity **không đảm bảo** điều đó giữa máy khác nhau (thứ tự solver, SIMD, float trên ARM vs x86). Hệ quả thẳng thừng: game rollback/lockstep (fighting, RTS) **phải tự viết vật lý** — vật lý tự viết ở [[unity-physics]] không còn là lựa chọn cảm giác mà là điều kiện kỹ thuật. Dùng số nguyên/fixed-point cho vị trí nếu cần chạy cross-platform; float cùng một build IL2CPP trên cùng kiến trúc *thường* khớp nhưng không ai ký bảo hành. Server-authoritative với prediction chịu được lệch nhỏ (reconciliation sửa), nên vẫn dùng được PhysX ở đó — chỉ rollback thuần mới bị cấm.

## Spawn và pool network object

Chỉ server spawn: `Instantiate(prefab)` rồi `GetComponent<NetworkObject>().SpawnWithOwnership(clientId)`; client gọi `Instantiate` trên prefab có `NetworkObject` sẽ có object "ma" không ai biết. Prefab phải nằm trong `NetworkPrefabsList` **giống hệt** giữa client và server — lệch một prefab là lỗi hash lúc kết nối, và chỉ lộ khi hai bên build khác nhau.

Pool: implement `INetworkPrefabInstanceHandler` và đăng ký qua `NetworkManager.PrefabHandler.AddHandler(prefab, handler)` — NGO gọi `Instantiate`/`Destroy` của bạn thay cho của nó, bạn trả object từ pool. Đạn 20 viên/giây qua `Instantiate` mạng là GC spike ở cả hai đầu; xem [[unity-optimization]].

## Không tin client

Server-authoritative làm được 80% chống gian lận nếu tuân đúng ba luật, và không có anti-cheat nào cứu được nếu vi phạm:

- **Client gửi ý định, không gửi kết quả.** `RequestAttackRpc(target)`, không phải `ApplyDamageRpc(target, 9999)`. Vị trí do owner gửi (co-op) phải kiểm `distance / dt ≤ maxSpeed × 1.2`.
- **Validate mọi Rpc lên server:** người gửi có phải owner, mục tiêu có tồn tại, khoảng cách, cooldown, còn sống. Mỗi kiểm tra một dòng `return`.
- **Rate-limit theo client:** 20 Rpc/giây cho một action là nghi ngờ; log và ngắt. `ConnectionApproval` bật để kiểm phiên bản build và token đăng nhập trước khi cho vào.

Chi phí thật của anti-cheat nằm ở 20% còn lại (aimbot, wallhack đọc bộ nhớ) — chỉ đáng khi có xếp hạng và tiền.

## Test từ tuần đầu

- **Multiplayer Play Mode** (Unity 6, package `com.unity.multiplayer.playmode`): tối đa 4 virtual player trong một Editor, tag `-server`/`-client`, không cần build. Thay cho ParrelSync (clone project) của thời 2022.
- **Network Simulator** (package `com.unity.multiplayer.tools`): thêm component, chọn preset hoặc tự đặt. Tối thiểu phải chạy ổn ở **latency 150ms, jitter 20ms, packet loss 3%** — đó là mobile 4G bình thường. Game chỉ test ở localhost 0ms là game chưa test.
- **Runtime Net Stats Monitor** cùng package: bytes/s, RPC/s, tick lệch — dán lên góc màn hình build dev.
- Kịch bản bắt buộc: client vào giữa trận (late join thấy đúng state?), client rớt 10s rồi quay lại, host alt-tab 30s (mobile: app xuống nền là transport timeout ~10s).

## Chi phí ẩn

| Việc | Ẩn ở đâu |
|---|---|
| Matchmaking / Lobby | UI chờ, huỷ giữa chừng, người rời khi đang tìm, phòng đầy đúng lúc bấm vào |
| Reconnect | State phải gắn với **playerId** ổn định, không phải `clientId` (đổi mỗi lần kết nối); giữ chỗ 30–60s |
| Host migration | NGO không có sẵn; hầu hết game indie chấp nhận "host thoát là hết trận" hoặc lên dedicated |
| Server | VPS 2 vCPU chạy 24/7 ~20–40 USD/tháng chưa tính băng thông; Multiplay tính theo giờ máy — game chết vẫn phải trả hoặc tắt |
| QA | Mọi bug có N góc nhìn; cần 4 máy hoặc MPPM, và người test cùng lúc |
| Phiên bản | Client cũ + server mới = lỗi hash; cần force update và bảng tương thích |

## Bẫy lộ ra khi build

- Build server quên `targetFrameRate` → 100% CPU, hoá đơn Multiplay gấp 3.
- `NetworkPrefabsList` khác nhau giữa build client và server vì ai đó thêm prefab mà không commit — chỉ lộ lúc kết nối thật.
- WebGL: UDP không có, `UnityTransport` phải bật `UseWebSockets`; Relay hỗ trợ WSS nhưng độ trễ cao hơn.
- Mobile app xuống nền quá timeout là disconnect — flow reconnect không phải tính năng phụ, nó là đường về của 30% phiên chơi.
- Domain Reload tắt trong Editor: static `NetworkManager.Singleton` sống xuyên Play, phiên thứ hai kết nối vào xác phiên thứ nhất.

## Kiểm tra nhanh
- Network Simulator 150ms / 3% loss: nhân vật mình có giật khi đi thẳng không? Người khác có warp không?
- Net Stats Monitor ở cảnh đông nhất: mỗi client nhận < 20 KB/s?
- Dùng debugger đặt `Hp.Value = 9999` phía client: server có ghi đè về giá trị đúng trong 1 tick không?
- Rút mạng 10 giây rồi cắm lại: về được phòng cũ với đúng state không?
- 4 client MPPM chạy 30 phút: memory của host tăng bao nhiêu MB? Trên 50MB là có rò.

## 🤖 Prompt cho AI

AI viết netcode bằng API NGO 1.x (`[ServerRpc]`, `[ClientRpc]`, `ServerRpcParams`), cho client ghi thẳng `NetworkVariable`, và không validate gì trong Rpc lên server.

**Phải nêu rõ:**
- Thư viện và phiên bản chính xác (NGO 2.x / Mirror / Fusion 2) — API khác hẳn nhau
- Mô hình: host + Relay, hay dedicated server; ai có authority với vật thể nào
- Tick rate, số người chơi tối đa, và ngân sách băng thông mỗi client
- Có client-side prediction không; nếu có thì hàm simulation nào phải thuần
- Cái gì là NetworkVariable (state) và cái gì là Rpc (event) — liệt kê từng trường
- Điều kiện validate cho từng Rpc lên server (khoảng cách, cooldown, quyền)

**Mẫu prompt**

```
Viết NetHealth và NetAttack cho co-op 4 người, Unity 6, Netcode for GameObjects 2.x, host + Unity Relay.
Dùng [Rpc(SendTo.Server)] / [Rpc(SendTo.ClientsAndHost)] với RpcParams. CẤM [ServerRpc]/[ClientRpc] cũ.
Tên mọi phương thức Rpc kết thúc bằng "Rpc".

Authority: server quyết máu, sát thương, chết. Owner quyết vị trí nhân vật mình (NetworkTransform AuthorityMode = Owner).
Tick rate 30. Ngân sách: mỗi client nhận < 15 KB/s với 4 người + 20 kẻ địch.

State (NetworkVariable, Server write, Everyone read): Hp (int), IsDead (bool).
Event (Rpc): RequestAttackRpc(targetId) client→server; PlayHitFxRpc(pos) server→clients.
KHÔNG dùng Rpc để đồng bộ máu. KHÔNG cho client ghi Hp.

Validate trong RequestAttackRpc, mỗi điều kiện một dòng return:
- sender == OwnerClientId; target tồn tại trong SpawnManager; target chưa chết
- khoảng cách ≤ attackRange × 1.2; cooldown theo sender còn ≥ attack.cooldown
- quá 10 request/giây từ một client → log warning và bỏ qua

Late joiner phải thấy đúng Hp lúc vào: đọc Hp.Value trong OnNetworkSpawn, không chỉ nghe OnValueChanged.
Struct tự định nghĩa phải implement INetworkSerializable. Không reflection.
Kèm: cách test bằng Multiplayer Play Mode với 1 host + 2 client và Network Simulator 150ms/3% loss.
```

**Bẫy thường gặp:** AI đăng ký `Hp.OnValueChanged` trong `OnNetworkSpawn` và dừng ở đó — client vào giữa trận nhận giá trị hiện tại **không qua sự kiện**, nên thanh máu hiện 100 trong khi server nói 35. Chạy 2 client cùng lúc từ đầu thì hoàn toàn đúng; chỉ lộ khi có người vào sau — đúng kịch bản ít ai test.
