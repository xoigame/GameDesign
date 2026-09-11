---
title: Unity thực chiến
icon: 🎮
summary: Kinh nghiệm hiện thực hoá game trong Unity — vật lý, animation, pattern, UI, audio, shader, ánh sáng, tối ưu, multiplayer. Không phải docs, là những gì lộ ra khi làm thật.
status: deep
read: 600
level: basic
order: 65
tags: [unity, engine, implementation]
related: [production, presentation, architecture-patterns, performance]
---

Tám nhánh kia trả lời câu hỏi **"nên làm gì và vì sao"**. Nhánh này trả lời **"trong Unity thì làm thế nào cho khỏi hỏng"**.

Tài liệu chính thức của Unity đã đủ tốt để tra cứu API. Thứ nó không nói là: cái gì trông đúng trong Editor nhưng gãy trên build, quyết định nào ở tuần 1 sẽ làm bạn trả giá ở tháng 6, và pattern nào đẹp trên slide nhưng làm team 3 người khổ sở. Nhánh này ghi lại đúng phần đó.

**Giả định xuyên suốt:** Unity 6 (6000.x) + URP. Chỗ nào API khác giữa 2022 LTS và Unity 6 sẽ ghi rõ. Không bàn cài đặt, tạo project, hay giao diện Editor cơ bản.

## Các node

**Xương sống dự án**
- **[[unity-game-loop]]** — vòng đời game trong Unity: bootstrap scene, state machine cấp game, thứ tự thực thi, `Time` và pause. Nơi mọi thứ khác móc vào.
- **[[unity-project-structure]]** — tổ chức thư mục, Assembly Definition, prefab variant, scene additive, làm việc nhóm với Git.
- **[[unity-design-patterns]]** — pattern chạy tốt trong MonoBehaviour: ScriptableObject làm dữ liệu và kênh sự kiện, service locator có kỷ luật, state machine, command, pool.
- **[[unity-save-data]]** — lưu game: JSON có version, ghi atomic, migration, và cái bẫy ScriptableObject giữ dữ liệu runtime.

**Gameplay**
- **[[unity-physics]]** — Rigidbody vs kinematic vs tự viết, FixedUpdate và interpolation, collision matrix, raycast không cấp phát, vật lý cho platformer.
- **[[unity-animation]]** — Animator thoát khỏi spaghetti, Has Exit Time, blend tree, animation event, root motion, và khi nào bỏ Animator mà điều khiển bằng code.
- **[[unity-input]]** — Input System: action map, rebinding, input buffer, đổi thiết bị nóng, touch trên mobile.
- **[[unity-camera]]** — Cinemachine: follow 2D/3D, dead zone, look-ahead, impulse rung, pixel perfect, camera stacking.

**Trình bày**
- **[[unity-ui]]** — UGUI vs UI Toolkit, tách Canvas để khỏi rebuild cả màn, safe area, TextMeshPro, binding dữ liệu.
- **[[unity-audio]]** — AudioMixer với snapshot, pool AudioSource, cài đặt nén cho từng loại âm, `PlayScheduled` cho nhạc đúng nhịp, khi nào cần FMOD/Wwise.
- **[[unity-vfx]]** — Particle System vs VFX Graph, ngân sách hiệu ứng, hitstop, rung camera, pool particle, sorting trong 2D.
- **[[unity-shader]]** — Shader Graph vs HLSL trong URP, hiệu ứng thường gặp, MaterialPropertyBlock, shader variant và thời gian build, độ chính xác trên mobile.
- **[[unity-lighting]]** — realtime / baked / mixed, light probe, reflection probe, giới hạn đèn URP, Volume post-processing, Linear vs Gamma.

**Vận hành**
- **[[unity-optimization]]** — quy trình profiling, GC, draw call và batching, texture, LOD/culling, UI rebuild, mobile, Burst/Jobs khi nào đáng.
- **[[unity-build-platform]]** — IL2CPP, stripping, kích thước build, Android/iOS/WebGL, Addressables, crash report.
- **[[unity-multiplayer]]** — chọn giữa Netcode for GameObjects / Mirror / Photon Fusion, mô hình authority, prediction, tick rate, test nhiều client.
- **[[unity-editor-tools]]** — công cụ tự viết: custom inspector, gizmo, cheat console, validator asset. Thứ giúp team đi nhanh hơn mọi framework.

## Bốn bài học đắt nhất

**1. Thứ chạy trong Editor không phải thứ ship.** Editor dùng Mono, JIT, có `Resources` load tức thì, đĩa SSD, RAM 32GB. Build IL2CPP trên điện thoại 3GB thì khác hoàn toàn: reflection bị strip, texture không nén ăn hết bộ nhớ, `Debug.Log` vẫn chạy và tốn. Build ra máy thật **từ tuần đầu**, không phải tuần cuối. Xem [[unity-build-platform]].

**2. Mọi thứ trong `Update()` là một khoản nợ.** Một dự án 200 script, mỗi script có `Update()` làm việc nhỏ, cộng lại là 2ms chỉ để gọi hàm rỗng. Chuyện này không lộ ra khi có 20 script. Quy tắc: `Update()` chỉ dành cho thứ thật sự cần chạy mỗi frame; còn lại dùng event, coroutine, hoặc một manager tick tập trung. Xem [[unity-optimization]].

**3. Singleton `GameManager.Instance` là chỗ mọi thứ chui vào.** Tuần 1 nó giữ điểm số. Tháng 3 nó giữ 40 trường, biết mọi hệ thống, và không test được. Không cần DI framework, nhưng cần **kỷ luật**: mỗi hệ thống một class, giao tiếp qua event hoặc interface, và `GameManager` chỉ điều phối trạng thái. Xem [[unity-design-patterns]].

**4. Asset pipeline quyết định hiệu năng nhiều hơn code.** Một texture 2048 chưa nén, một audio clip `Decompress On Load` dài 3 phút, một mesh không bật Read/Write đúng lúc — mỗi thứ tốn hơn mọi tối ưu thuật toán bạn viết. Import settings là code. Dùng preset và validator để ép chúng. Xem [[unity-editor-tools]].

## Quan hệ với các nhánh khác

Nhánh này **không lặp lại lý thuyết**. Node [[unity-animation]] giả định bạn đã đọc [[animation-game]] và biết vì sao frame 1 phải phản hồi; nó chỉ nói cách làm điều đó với Animator. Tương tự [[unity-audio]] dựa trên [[audio-implementation]], [[unity-optimization]] dựa trên [[performance]], [[unity-design-patterns]] dựa trên [[architecture-patterns]].

Nhiều node ở các nhánh kia có tab **🎮 Unity** với code cho đúng kỹ thuật đó. Nhánh này đi ngược lại: lấy Unity làm trục, kỹ thuật là chi tiết.

## 🤖 Prompt cho AI

AI viết code Unity **chạy được nhưng không ship được**: dùng `FindObjectOfType` trong Update, `Resources.Load` khắp nơi, singleton cho mọi thứ, và không hề biết build target là gì.

**Phải nêu rõ** (thiếu là AI mặc định về Unity 2019 + Built-in RP + PC):
- Phiên bản Unity chính xác và render pipeline (URP / HDRP / Built-in)
- Nền tảng đích và máy yếu nhất phải chạy được
- Hệ input đang dùng (Input System mới hay Input Manager cũ)
- Hệ UI đang dùng (UGUI hay UI Toolkit)
- Có dùng Addressables / Cinemachine / DOTween / UniTask không
- Backend script: Mono hay IL2CPP

**Mẫu prompt — khối định vị cho mọi phiên làm Unity**

```
Dự án Unity 6000.0.x LTS, URP, Input System 1.x, UGUI + TextMeshPro.
Nền tảng: Android (API 24+, IL2CPP, ARM64), máy yếu nhất: 3GB RAM, Mali-G52.
Thư viện có sẵn: Cinemachine 3, Addressables, DOTween. KHÔNG thêm package khác.

Ràng buộc cho MỌI code:
- Cache tham chiếu trong Awake, CẤM GetComponent/Find trong Update
- Không dùng Resources.Load; asset lấy qua tham chiếu Inspector hoặc Addressables
- Không singleton mới; dùng ScriptableObject event channel có sẵn ở Assets/Data/Events
- Field public để chỉnh trong Inspector dùng [SerializeField] private
- Code phải biên dịch được với IL2CPP (không reflection động, không dynamic)
- Mọi giá trị chỉnh được nằm trong ScriptableObject, không hardcode

Trước khi viết, nói bạn sẽ đặt script vào GameObject nào và vì sao.
```

**Bẫy thường gặp:** AI trộn API các phiên bản — `rb.velocity` (cũ) với `rb.linearVelocity` (Unity 6), `Input.GetKey` với Input System, `FindObjectOfType` (đã deprecated) thay vì `FindFirstObjectByType`. Kết quả biên dịch được với warning rồi hỏng ở phiên bản khác. Luôn nêu phiên bản, và yêu cầu AI **không dùng API đã deprecated ở phiên bản đó**.
