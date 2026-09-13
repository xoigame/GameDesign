---
title: Thiết kế trợ lý AI cho team Unity
icon: 🛠️
summary: Bốn lớp của một trợ lý dùng được thật — ngữ cảnh, công cụ, vòng lặp tự sửa, cổng người — và vì sao Unity khó hơn web đối với agent.
status: deep
read: 136
level: advanced
order: 60
tags: [ai, agent, architecture, unity, tooling]
related: [agent-guardrails, ai-limits, ai-workflow, ai-tooling, unity-editor-tools]
---

Câu hỏi "dùng AI thế nào" đã có ở [[ai-workflow]]. Node này là câu hỏi khác: **nếu bạn phải xây trợ lý đó cho cả team, nó gồm những gì?** Đây cũng là câu hỏi phỏng vấn ở các studio đang đưa AI vào quy trình — và người ta nghe bạn nói về *hệ thống*, không nghe bạn khoe prompt hay.

Một trợ lý dùng được có bốn lớp. Thiếu lớp nào thì hỏng theo đúng kiểu của lớp đó.

| Lớp | Trả lời câu | Hỏng thì thấy gì |
|---|---|---|
| **Ngữ cảnh** | Agent biết gì về dự án này? | Code đúng cú pháp nhưng sai quy ước, đặt file sai chỗ, tự phát minh lại thứ đã có |
| **Công cụ** | Agent *làm* được gì, không chỉ *viết* được gì? | Không biết mình vừa làm gãy build |
| **Vòng lặp** | Sai rồi thì tự sửa thế nào, tối đa mấy vòng? | Hoặc bỏ cuộc quá sớm, hoặc lặp 30 lần đốt tiền |
| **Cổng người** | Ai duyệt, duyệt cái gì, dựa trên gì? | Thay đổi trôi vào nhánh chính rồi không ai truy được vì sao |

## Vì sao Unity khó hơn web

Với dự án web, agent đọc file, sửa file, chạy test — vòng lặp khép kín. Unity có năm thứ phá vòng đó, và nói được chúng là dấu hiệu bạn đã làm thật:

1. **GUID và `.meta`.** Tham chiếu giữa asset không nằm trong code mà nằm trong file `.meta`. Agent đổi tên file bằng lệnh shell là mọi tham chiếu đứt — lỗi không xuất hiện lúc compile mà xuất hiện dưới dạng `Missing` trong Inspector.
2. **Prefab và scene là YAML sinh bởi máy.** Sửa tay được trên lý thuyết, nhưng một sai lệch nhỏ làm hỏng asset mà compiler không biết. Đây là vùng agent **không nên** chạm.
3. **Editor mới là nơi nhiều thứ được quyết**: gán tham chiếu trong Inspector, bake ánh sáng, import settings, xây NavMesh. Không có công cụ, agent chỉ viết được phần code và bỏ lại phần "cắm dây".
4. **Compile chậm và không headless tự nhiên.** Vòng phản hồi của web là vài giây; của Unity là vài chục giây tới vài phút, nên **số vòng lặp là tài nguyên phải phân bổ**, không phải thứ vô hạn.
5. **Trạng thái Editor dai dẳng**: Domain Reload, Library cache, Play Mode đang chạy. Agent cần biết Editor đang ở trạng thái nào trước khi ra lệnh.

## Lớp 1 — Ngữ cảnh: ít mà đúng, không nhiều mà đủ

Sai lầm đầu tiên của mọi đội là nhồi cả repo vào context. Nó đắt, chậm, và làm model lạc giữa những thứ không liên quan. Cấu trúc đã chứng minh hiệu quả là **ba tầng, đọc theo thứ tự**:

| Tầng | Nội dung | Kích cỡ mong muốn |
|---|---|---|
| **Luật** | Quy ước dự án, ranh giới, lệnh kiểm tra — một file ở gốc repo (`AGENTS.md` / `CLAUDE.md`) | Vài trang, agent **luôn** đọc |
| **Mục lục** | Danh sách module/hệ thống + một câu mỗi cái + đường dẫn | Một file, để agent tự chọn mở gì |
| **Chi tiết** | File code, GDD, node kiến thức — chỉ mở đúng cái cần | Theo nhiệm vụ |

Mục lục là tầng hay bị bỏ qua nhất, và nó là tầng tiết kiệm nhiều nhất: nó biến "đọc 400 file để tìm chỗ sửa" thành "đọc một file rồi mở ba file".

Với dự án Unity, ngữ cảnh hữu ích **không chỉ là code**: danh sách ScriptableObject và schema của chúng, sơ đồ phụ thuộc giữa asmdef, quy ước đặt tên và thư mục, và các quyết định kiến trúc đã chốt. Phần lớn lỗi "code đúng nhưng sai dự án" đến từ việc thiếu đúng những thứ này.

## Lớp 2 — Công cụ: cho agent tay và mắt

Một agent chỉ sinh text thì bạn là người chạy tay mọi thứ nó đề xuất. Bộ công cụ tối thiểu, xếp theo giá trị trên công sức:

1. **Đọc/ghi file + chạy lệnh shell** — nền tảng, nhưng phải có allowlist: không `rm -rf`, không `git push`, không đụng `.meta` và `*.unity`.
2. **Biên dịch và đọc lỗi.** Đây là công cụ đổi đời: agent tự biết mình vừa viết sai. Với Unity là gọi Editor ở `-batchmode` hoặc đọc kết quả compile qua bridge.
3. **Chạy test.** `-runTests -testPlatform EditMode` cho kết quả máy đọc được — xem [[unity-testing-ci]].
4. **Cầu nối Editor** (mục 🎮 bên dưới): vào Play Mode, chụp màn hình, đọc Hierarchy, chạy một `MenuItem`. Đây là thứ cho agent "nhìn thấy" kết quả thay vì đoán.
5. **Truy vấn dự án**: tìm mọi ScriptableObject loại X, liệt kê prefab thiếu tham chiếu. Rẻ để viết, và thay được nhiều vòng hỏi đáp.

Nguyên tắc thiết kế công cụ: **mỗi công cụ trả về thứ máy đọc được và ngắn**. Trả về 5000 dòng log Unity là cách nhanh nhất để đốt context và khiến agent bỏ sót dòng lỗi thật; lọc lấy phần lỗi rồi trả về 20 dòng thì hữu ích gấp nhiều lần.

## Lớp 3 — Vòng lặp có ngân sách

Vòng lặp là: **kế hoạch → sửa → biên dịch → test → đọc lỗi → sửa tiếp**. Ba tham số phải đặt rõ:

- **Trần số vòng** (thường 3–5). Hết trần thì dừng và báo cáo, không im lặng thử tiếp. Agent lặp 30 vòng quanh cùng một lỗi là tiền và thời gian đổ xuống sông.
- **Điều kiện dừng tích cực**: build xanh + test xanh + diff nằm trong phạm vi cho phép.
- **Điều kiện dừng tiêu cực**: lỗi lặp lại y hệt hai lần liên tiếp — dấu hiệu agent không hiểu vấn đề, thêm vòng nữa chỉ làm tệ hơn.

Và một thói quen đáng giá: bắt agent **viết kế hoạch trước khi sửa** cho nhiệm vụ lớn hơn một file. Kế hoạch sai thì bạn phát hiện trong 20 giây đọc, thay vì sau 4 phút chờ nó sửa 12 file.

## Lớp 4 — Cổng người: review cái gì

Không ai đọc nổi 800 dòng diff mỗi lần. Nên cổng người phải **có trọng tâm**:

- **Diff theo phạm vi khai báo trước.** Nhiệm vụ nói "chỉ sửa `Combat/`" mà diff chạm `Save/` là cờ đỏ, xem trước tiên.
- **Ba câu hỏi cho mọi PR do agent tạo**: nó có tự phát minh lại thứ đã có không; nó có chạm vào bất biến nào không ([[agent-guardrails]]); và **test nào chứng minh nó chạy**.
- **Không commit thẳng vào nhánh chính.** Nhánh riêng hoặc worktree riêng cho mỗi nhiệm vụ; agent làm hỏng thì vứt nhánh, không phải dọn dẹp.

## Chi phí, độ trễ và lựa chọn model

Ba đòn bẩy, theo thứ tự hiệu quả:

1. **Ngữ cảnh nhỏ hơn** — ảnh hưởng cả tiền lẫn chất lượng. Một agent đọc đúng 5 file trả lời tốt hơn agent đọc 50 file.
2. **Cache phần đầu prompt** (luật, mục lục) nếu nhà cung cấp hỗ trợ: phần này lặp lại ở mọi lượt.
3. **Model theo tác vụ**: model mạnh cho kế hoạch và sửa lỗi khó; model nhỏ/nhanh cho việc cơ học như đổi tên, viết test lặp lại, dịch chuỗi.

Điều đáng nói trong phỏng vấn là **cách bạn quyết**: đo thời gian từ lúc giao việc tới lúc PR xanh, và chi phí mỗi nhiệm vụ hoàn thành — chứ không phải chi phí mỗi nghìn token. Một model đắt gấp ba mà làm xong trong một vòng thì rẻ hơn.

## Ranh giới: việc agent không nên nhận

Không phải vì "AI dốt", mà vì **kết quả không kiểm chứng được bằng compile hay test** — mà đó là hai giác quan duy nhất của nó:

- Gán tham chiếu trong Inspector, sắp xếp scene, dựng prefab phức tạp.
- Bake ánh sáng, NavMesh, occlusion.
- Quyết định cảm giác: cong gia tốc nhảy, thời lượng hitstop, nhịp âm thanh.
- Chỉnh import settings hàng loạt mà không ai xem lại (một quyết định sai nhân với 500 asset).
- Sửa YAML của prefab/scene bằng tay.

Danh sách này nên nằm thẳng trong file luật ở gốc repo, ở dạng câu lệnh: *"Không sửa `*.unity`, `*.prefab`, `*.meta`. Cần đổi scene thì mô tả các bước cho người làm."*

## Kiểm tra nhanh

- [ ] Có một file luật ở gốc repo mà agent **luôn** đọc trước
- [ ] Có mục lục cho agent tự chọn file cần mở, thay vì quét cả repo
- [ ] Agent biên dịch được và **đọc được lỗi** ở dạng ngắn, đã lọc
- [ ] Có trần số vòng tự sửa, và có báo cáo khi chạm trần
- [ ] Agent làm việc trên nhánh/worktree riêng, không commit thẳng
- [ ] Danh sách "không được chạm" viết thành luật máy hiểu, không phải lời dặn miệng
- [ ] Có số đo: thời gian tới PR xanh, tỉ lệ nhiệm vụ xong trong một vòng — xem [[ai-eval]]

## 🤖 Prompt cho AI

**Dùng AI thế nào khi chính bạn đang xây trợ lý**

Việc này có một đặc điểm dễ bỏ qua: **AI viết rất tốt phần công cụ cho chính nó**. Bridge Editor, hàm lọc log, hàm tóm tắt lỗi compile, script truy vấn ScriptableObject — đều là code nhỏ, rõ đầu vào–đầu ra, kiểm chứng được ngay. Giao hết phần đó.

Phần **không** giao: quyết định ranh giới (agent được chạm gì), trần số vòng, và cách chấm điểm kết quả. Ba thứ này là chính sách của đội, và AI sẽ vui vẻ đề xuất một chính sách dễ dãi vì nó tối ưu cho "hoàn thành nhiệm vụ", không phải cho "không làm hỏng dự án".

Cách làm hiệu quả nhất: xây bridge theo từng lệnh một, mỗi lệnh xong thì tự dùng nó cho nhiệm vụ thật một ngày. Lệnh nào bạn không dùng trong một tuần thì xoá — bộ công cụ phình ra là cách làm agent lạc hướng.

**Phải nêu rõ** (thiếu là AI tự bịa):
- Agent chạy ở đâu: cùng máy với Editor, hay trên CI không có Editor.
- Danh sách thao tác **cấm** (file, thư mục, lệnh git).
- Kết quả trả về được phép dài bao nhiêu — nếu không nói, nó sẽ trả cả log Unity.
- Trạng thái Editor được phép đổi không (vào Play Mode, đổi scene đang mở).
- Phiên bản Unity: API Editor đổi khá nhiều giữa các bản.

**Mẫu prompt**

```
Unity 6. Viết AgentBridge (Editor script) để một agent chạy ngoài Editor
điều khiển Editor qua FILE, không qua socket:
- Đọc Temp/Agent/command.json {id, action, arg}, ghi Temp/Agent/result.json {id, ok, output}
- action: status | errors | play | stop | hierarchy | menu
- "errors" trả TỐI ĐA 20 dòng, đã lọc chỉ lấy error thật (bỏ warning)
- "menu" chỉ chạy MenuItem nằm trong allowlist khai báo trong code
- KHÔNG sửa file trong Assets/, KHÔNG chạy lệnh shell, KHÔNG đụng .meta
Giải thích script sống sót qua Domain Reload bằng cách nào.
```

**Bẫy thường gặp:** AI viết bridge giữ trạng thái trong biến `static` rồi mất sạch sau mỗi lần **Domain Reload** (biên dịch lại, vào/ra Play Mode) — lệnh gửi lúc Unity đang compile rơi vào hư không, agent chờ kết quả không bao giờ tới, rồi thử lại và làm đúng việc đó hai lần. Trạng thái phải nằm trên **đĩa** (file lệnh, file kết quả) và mọi lệnh phải có `id` để phát hiện trùng; `[InitializeOnLoad]` chỉ dùng để đăng ký lại vòng lặp sau mỗi lần reload.

## 🎮 Unity

Điểm mấu chốt: agent chạy **ngoài** Unity nhưng nhiều thứ chỉ Editor mới làm được. Cầu nối rẻ và bền nhất không phải socket mà là **file** — vì file sống sót qua Domain Reload, còn kết nối thì không.

**Component & nơi đặt**
- `Assets/_Project/Editor/AgentBridge.cs` — Editor script, `[InitializeOnLoad]`, đăng ký lại sau mỗi lần reload.
- `Temp/Agent/command.json` và `Temp/Agent/result.json` — hộp thư. `Temp/` không bị Unity import và không vào git.

**Code**

```csharp
// AgentBridge.cs — Unity 6, đặt trong thư mục Editor/.
// Agent ghi command.json, Editor thực thi rồi ghi result.json. Không socket, không port.
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEditor.Compilation;
using UnityEditor.SceneManagement;
using UnityEngine;

[InitializeOnLoad]
public static class AgentBridge
{
    const string Dir = "Temp/Agent";
    static readonly string CmdPath = Dir + "/command.json";
    static readonly string OutPath = Dir + "/result.json";

    // Chỉ những MenuItem trong danh sách này mới chạy được. Mở rộng có chủ đích.
    static readonly HashSet<string> AllowedMenu = new()
    {
        "Tools/Validate Data", "Assets/Refresh",
    };

    static readonly List<string> errors = new();
    static double nextPoll;

    static AgentBridge()
    {
        Directory.CreateDirectory(Dir);
        CompilationPipeline.compilationStarted += _ => errors.Clear();
        CompilationPipeline.assemblyCompilationFinished += (_, messages) =>
        {
            foreach (var m in messages)
                if (m.type == CompilerMessageType.Error)
                    errors.Add($"{m.file}({m.line}): {m.message}");
        };
        EditorApplication.update += Tick;      // đăng ký lại sau MỖI lần Domain Reload
    }

    [Serializable] class Command { public string id; public string action; public string arg; }
    [Serializable] class Result  { public string id; public bool ok; public string output; }

    static void Tick()
    {
        if (EditorApplication.timeSinceStartup < nextPoll) return;
        nextPoll = EditorApplication.timeSinceStartup + 0.5;     // nửa giây một lần là đủ

        if (EditorApplication.isCompiling || EditorApplication.isUpdating) return;
        if (!File.Exists(CmdPath)) return;

        Command cmd;
        try { cmd = JsonUtility.FromJson<Command>(File.ReadAllText(CmdPath)); }
        catch (Exception e) { Write(new Result { ok = false, output = "command.json hỏng: " + e.Message }); return; }

        File.Delete(CmdPath);                                    // xử lý đúng một lần
        try { Write(Execute(cmd)); }
        catch (Exception e) { Write(new Result { id = cmd.id, ok = false, output = e.Message }); }
    }

    static Result Execute(Command c)
    {
        switch (c.action)
        {
            case "status":
                return Ok(c, $"compiling={EditorApplication.isCompiling} playing={EditorApplication.isPlaying} " +
                             $"errors={errors.Count} scene={EditorSceneManager.GetActiveScene().name}");

            case "errors":                                       // TỐI ĐA 20 dòng: giữ context của agent gọn
                return Ok(c, errors.Count == 0 ? "(không có lỗi biên dịch)"
                                               : string.Join("\n", errors.GetRange(0, Math.Min(20, errors.Count))));

            case "play":  EditorApplication.isPlaying = true;  return Ok(c, "đang vào Play Mode");
            case "stop":  EditorApplication.isPlaying = false; return Ok(c, "đã thoát Play Mode");

            case "hierarchy":
                var sb = new StringBuilder();
                foreach (var go in EditorSceneManager.GetActiveScene().GetRootGameObjects())
                    sb.Append(go.name).Append(go.activeSelf ? "\n" : "  (tắt)\n");
                return Ok(c, sb.ToString());

            case "menu":
                if (!AllowedMenu.Contains(c.arg))                 // allowlist, không phải blocklist
                    return new Result { id = c.id, ok = false, output = "MenuItem không nằm trong allowlist: " + c.arg };
                return Ok(c, EditorApplication.ExecuteMenuItem(c.arg) ? "đã chạy " + c.arg : "không chạy được " + c.arg);

            default:
                return new Result { id = c.id, ok = false, output = "action lạ: " + c.action };
        }
    }

    static Result Ok(Command c, string output) => new() { id = c.id, ok = true, output = output };

    static void Write(Result r) => File.WriteAllText(OutPath, JsonUtility.ToJson(r, true));
}
```

**Bẫy Unity cụ thể**
- Giữ trạng thái trong `static` mà không nghĩ tới **Domain Reload**: biên dịch lại hoặc vào/ra Play Mode là xoá sạch. Hộp thư phải nằm trên đĩa; `[InitializeOnLoad]` chỉ để đăng ký lại `EditorApplication.update`.
- Không kiểm tra `isCompiling`/`isUpdating` trước khi thực thi: lệnh chạy giữa lúc Unity đang import cho kết quả sai hoặc treo Editor.
- Quên xoá file lệnh: Editor chạy lại cùng một lệnh mỗi nửa giây.
- Cho phép chạy **mọi** MenuItem: một `Assets/Delete` là mất dữ liệu. Allowlist, không phải blocklist.
- Trả cả log Unity về cho agent: 5000 dòng đốt hết context và dòng lỗi thật bị chôn ở giữa.
- Đặt hộp thư trong `Assets/`: mỗi lần ghi file là một lần Unity import lại, Editor khựng liên tục. `Temp/` là đúng chỗ.

**Kiểm tra nhanh**
- Ghi `{"id":"1","action":"status"}` vào `Temp/Agent/command.json`; trong một giây phải có `result.json` với `ok: true`.
- Cố tình viết một lỗi cú pháp trong script bất kỳ, đợi compile xong, gọi `errors`: phải thấy đúng file và số dòng.
- Gọi `menu` với một MenuItem ngoài allowlist: phải bị từ chối, không thực thi.
- Bấm Play rồi gọi `status`: `playing=True`, và bridge vẫn trả lời sau khi thoát Play (sống sót Domain Reload).

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Anh dùng AI vào việc gì trong công việc hằng ngày?**
  → Trả lời bằng **quy trình**, không bằng danh sách công cụ. Cụ thể: việc đọc kỹ và tẻ nhạt (soát cấp phát ẩn, dò mâu thuẫn giữa các file), việc chuyển dạng (bảng số sang struct, JSON sang class), và bản nháp đầu tiên của test. Việc tôi không giao là những gì compile và test không kiểm chứng được.
- `Junior` **Vòng lặp tự sửa của agent nên có trần bao nhiêu?**
  → **3–5 vòng** sửa–biên dịch–test, chạm trần thì dừng và báo cáo. Và dừng sớm hơn nữa khi lỗi lặp lại y hệt hai lần — lúc đó agent đang đi vòng tròn, mỗi vòng thêm chỉ đốt thêm token và làm diff rối hơn cho người review.
- `Mid` **Làm sao để AI viết code đúng quy ước dự án, không phải code chung chung?**
  → Một **file luật ở gốc repo** mà agent luôn đọc, cộng một mục lục để nó tự chọn file cần mở — thay vì nhồi cả repo vào context, vốn vừa đắt vừa làm nó lạc. Luật phải viết dưới dạng kiểm tra được ("không dùng `Resources/`"), không phải lời khuyên ("giữ code sạch").
- `Mid` **Agent viết xong thì ai kiểm, và kiểm cái gì?**
  → Agent làm trên **nhánh riêng**, người review theo **phạm vi đã khai báo trước**: nó được chạm những file nào, và diff có nằm trong đó không. Kiểm ba thứ theo thứ tự: có chạm vùng cấm không, test có thật sự kiểm cái đang sửa không, và phần nào của diff là thừa. Không bao giờ để agent commit thẳng vào nhánh chính.
- `Mid` **Vì sao lọc đầu ra công cụ lại quan trọng hơn làm công cụ mạnh?**
  → Vì trả về 5000 dòng log Unity là cách nhanh nhất để đốt context và chôn mất dòng lỗi thật. Trả về **≤ 20 dòng đã lọc** thì hữu ích gấp nhiều lần. Công cụ tốt không phải công cụ mạnh, mà là công cụ **trả lời ngắn và đúng** — đó cũng là chỗ dễ cải thiện nhất mà ít người đụng tới.
- `Senior` **Nếu phải xây trợ lý AI cho cả team Unity, anh thiết kế thế nào?**
  → Bốn lớp: **ngữ cảnh** (file luật + mục lục) → **công cụ** (biên dịch được và đọc được lỗi đã lọc, chạy test, cầu nối Editor với allowlist) → **vòng lặp** (trần 3–5 vòng) → **cổng người** (nhánh riêng, review theo phạm vi). Thiếu lớp nào thì lớp sau phải gánh, và lớp gánh nhiều nhất luôn là con người.
- `Senior` **Vì sao Unity khó cho agent hơn một dự án web?**
  → Năm thứ. Tham chiếu nằm trong **GUID/`.meta`** chứ không trong code, nên đổi tên file bằng shell là đứt hết. Prefab và scene là YAML sinh bởi máy, sửa tay hỏng âm thầm. Nhiều quyết định chỉ tồn tại trong Editor. Vòng biên dịch chậm nên **số vòng lặp là tài nguyên có hạn**. Và trạng thái Editor dai dẳng: Domain Reload, Play Mode.
- `Senior` **Cầu nối giữa agent và Unity Editor nên làm thế nào?**
  → Dùng **file**, không dùng socket: agent ghi `command.json`, Editor script `[InitializeOnLoad]` đọc và ghi `result.json`. Lý do rất cụ thể — file sống sót qua **Domain Reload**, kết nối thì không, mà Domain Reload xảy ra mỗi lần biên dịch lại. Hộp thư đặt trong `Temp/` để Unity không import lại mỗi lần ghi.
- `Senior` **Anh không cho agent làm gì, và vì sao?**
  → Những việc **compile và test không kiểm chứng được**: gán tham chiếu Inspector, dựng scene, bake, quyết định cảm giác (đường cong nhảy, hitstop), và sửa YAML prefab bằng tay. Vùng cấm cụ thể: `*.unity`, `*.prefab`, `*.meta`. Danh sách đó nằm thẳng trong file luật ở dạng câu lệnh, không phải lời dặn miệng.

**Khung trả lời 60 giây** — "Thiết kế trợ lý AI cho team Unity thế nào?"

> Tôi chia bốn lớp. **Ngữ cảnh**: một file luật ở gốc repo mà agent luôn đọc, cộng một mục lục để nó tự chọn file cần mở — thay vì nhồi cả repo vào context, vốn vừa đắt vừa làm nó lạc. **Công cụ**: cho nó biên dịch được và **đọc được lỗi đã lọc**, chạy được test, và một cầu nối Editor để vào Play Mode, đọc Hierarchy, chạy MenuItem trong allowlist. **Vòng lặp** sửa–biên dịch–test có trần 3 đến 5 vòng, chạm trần thì dừng và báo cáo. **Cổng người**: agent làm trên nhánh riêng, review theo phạm vi đã khai báo trước.
>
> Cái tôi coi là quan trọng nhất và hay bị bỏ qua là **lọc đầu ra của công cụ**. Trả về 5000 dòng log Unity là cách nhanh nhất để đốt context và chôn mất dòng lỗi thật; trả về 20 dòng đã lọc thì hữu ích gấp nhiều lần. Công cụ tốt không phải công cụ mạnh, mà là công cụ trả lời ngắn và đúng.

**Họ sẽ đào tiếp**

- *"Vì sao Unity khó hơn web?"* → Năm thứ: tham chiếu nằm trong **GUID/`.meta`** chứ không trong code (đổi tên file bằng shell là đứt hết); prefab/scene là YAML sinh bởi máy, sửa tay là hỏng âm thầm; nhiều quyết định chỉ tồn tại trong Editor (gán Inspector, bake, import settings); vòng biên dịch chậm nên **số vòng lặp là tài nguyên có hạn**; và trạng thái Editor dai dẳng — Domain Reload, Play Mode.
- *"Cầu nối Editor làm thế nào?"* → Tôi dùng **file** chứ không dùng socket: agent ghi `command.json`, Editor script `[InitializeOnLoad]` đọc và ghi `result.json`. Lý do rất cụ thể: file sống sót qua Domain Reload, kết nối thì không — và Domain Reload xảy ra mỗi lần biên dịch lại. Hộp thư đặt trong `Temp/` để Unity không import lại mỗi lần ghi.
- *"Agent không được làm gì?"* → Những việc **compile và test không kiểm chứng được**: gán tham chiếu Inspector, dựng scene, bake, quyết định cảm giác (cong nhảy, hitstop), và sửa YAML prefab bằng tay. Danh sách đó nằm thẳng trong file luật ở dạng câu lệnh, không phải lời dặn miệng.
- *"Biết trợ lý có tốt lên không?"* → Bằng số, không bằng cảm giác: tỉ lệ nhiệm vụ xong trong một vòng, thời gian tới PR xanh, và bao nhiêu phần diff bị người sửa lại. Chi tiết ở [[ai-eval]].
- *"Chi phí?"* → Đòn bẩy lớn nhất là ngữ cảnh nhỏ hơn, rồi tới cache phần luật lặp lại, rồi mới tới chọn model theo tác vụ. Và đo **chi phí mỗi nhiệm vụ hoàn thành**, không phải giá mỗi nghìn token — model đắt gấp ba mà xong trong một vòng thì rẻ hơn.

**Cờ đỏ**

- Trả lời bằng danh sách công cụ ("tôi dùng Copilot và ChatGPT") mà không có quy trình nào.
- Để agent commit thẳng vào nhánh chính.
- Không có trần số vòng tự sửa.
- Cho agent chạy mọi lệnh shell, hoặc mọi MenuItem của Editor.
- Nói AI "sẽ thay lập trình viên" — hoặc ngược lại, bác bỏ hoàn toàn mà chưa thử dựng vòng lặp nào.

**Số / ví dụ nên thuộc**

- Bốn lớp: **ngữ cảnh → công cụ → vòng lặp → cổng người**.
- Trần vòng tự sửa: **3–5**; dừng sớm khi lỗi lặp lại y hệt hai lần.
- Đầu ra công cụ: **≤ 20 dòng** đã lọc, không phải log thô.
- Vùng cấm: `*.unity`, `*.prefab`, `*.meta`.
