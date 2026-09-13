---
title: Protobuf giữa Go và Unity
icon: 📦
summary: Một file .proto làm hợp đồng cho cả hai phía — sinh ra .go và .cs, đánh số field để không bao giờ vỡ tương thích, và gói mọi message trong một Envelope.
status: deep
read: 586
level: advanced
order: 15
tags: [backend, go, protobuf, protocol, unity]
related: [game-server-go, unity-multiplayer, go-gamedev-tools, master-data]
---

Vấn đề thật không phải "JSON chậm". Vấn đề là **hai bản định nghĩa message** — một trong Go, một trong C# — và chúng sẽ lệch nhau vào một ngày không ai nhớ: ai đó đổi `hp` từ `int` sang `float`, client cũ đọc rác, và bug chỉ xuất hiện trên máy người chơi.

Protobuf sửa đúng chỗ đó: **`.proto` là nguồn chân lý duy nhất**, cả `.go` lẫn `.cs` đều do máy sinh ra. Lệch schema trở thành lỗi biên dịch trong CI thay vì lỗi hiển thị sai ở người chơi.

## Khi nào dùng protobuf, khi nào cứ JSON

| | JSON | Protobuf |
|---|---|---|
| Kích thước gói tin | Chuẩn so sánh | Nhỏ hơn 2–5 lần với dữ liệu nhiều số |
| Parse | Chậm hơn, sinh rác | Nhanh hơn, ít cấp phát |
| Đọc bằng mắt | `curl` là thấy | Phải có công cụ giải mã |
| Đổi schema | Không ai bắt lỗi | CI bắt được thay đổi phá tương thích |
| Chi phí ban đầu | 0 | Codegen, thêm bước build, thêm DLL vào Unity |

Quy tắc thực dụng: **REST meta cứ JSON, realtime dùng protobuf.** Login, shop, inventory gọi vài lần một phút — JSON ở đó đáng giá vì bạn debug bằng `curl` và đọc log bằng mắt. Còn 20 gói tin mỗi giây cho mỗi người trong phòng thì mỗi byte và mỗi lần cấp phát đều nhân lên theo số người chơi — xem bảng giao thức ở [[game-server-go]].

Có một lý do thứ hai, đôi khi quan trọng hơn cả băng thông: **protobuf ép bạn có một hợp đồng viết ra**. Nhiều đội chuyển sang protobuf không phải vì tốc độ mà vì hết chịu nổi cảnh client và server hiểu khác nhau về cùng một message.

<figure class="fig">
<svg viewBox="0 0 660 200" role="img" aria-label="Một file proto sinh ra code Go và code C-thăng, kèm bước kiểm tra phá tương thích trong CI">
  <defs>
    <marker id="gpb-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="#6ea8fe"/>
    </marker>
  </defs>
  <g class="fig-box-g">
    <rect x="14"  y="62" width="150" height="64" rx="9" class="fig-box"/>
    <rect x="256" y="14" width="170" height="58" rx="9" class="fig-box"/>
    <rect x="256" y="118" width="170" height="58" rx="9" class="fig-box"/>
    <rect x="486" y="14" width="160" height="58" rx="9" class="fig-box"/>
    <rect x="486" y="118" width="160" height="58" rx="9" class="fig-box"/>
  </g>
  <text x="89"  y="88"  text-anchor="middle" class="fig-label" font-size="13">proto/game.proto</text>
  <text x="89"  y="108" text-anchor="middle" class="fig-muted" font-size="11">hợp đồng — nguồn chân lý</text>
  <text x="341" y="38"  text-anchor="middle" class="fig-label" font-size="12">protoc-gen-go</text>
  <text x="341" y="57"  text-anchor="middle" class="fig-muted" font-size="11">sinh lúc build, không commit tay</text>
  <text x="341" y="142" text-anchor="middle" class="fig-label" font-size="12">protoc --csharp_out</text>
  <text x="341" y="161" text-anchor="middle" class="fig-muted" font-size="11">sinh lúc build, không commit tay</text>
  <text x="566" y="38"  text-anchor="middle" class="fig-label" font-size="12">Server Go</text>
  <text x="566" y="57"  text-anchor="middle" class="fig-muted" font-size="11">gen/gamepb/*.pb.go</text>
  <text x="566" y="142" text-anchor="middle" class="fig-label" font-size="12">Client Unity</text>
  <text x="566" y="161" text-anchor="middle" class="fig-muted" font-size="11">Assets/Scripts/Gen/*.cs</text>
  <g stroke="#6ea8fe" stroke-width="2" marker-end="url(#gpb-a)" fill="none">
    <path d="M164 82 Q210 82 210 43 H252"/>
    <path d="M164 106 Q210 106 210 147 H252"/>
    <path d="M426 43 H482"/>
    <path d="M426 147 H482"/>
  </g>
  <text x="334" y="196" text-anchor="middle" class="fig-muted" font-size="11">CI chạy <tspan class="fig-label">buf breaking</tspan>: đổi số field hay đổi kiểu là build đỏ, không phải bug ở người chơi</text>
</svg>
<figcaption>Code sinh ra không sửa tay và tốt nhất là không commit — sinh lại trong CI để không ai lỡ sửa bản sinh mà quên sửa <code>.proto</code>.</figcaption>
</figure>

## File .proto là hợp đồng

```proto
syntax = "proto3";
package game.v1;                    // version nằm ngay trong package: v1 và v2 sống song song được
option go_package = "example.com/server/gen/gamepb;gamepb";
option csharp_namespace = "Game.Net";

// Mọi gói tin đi qua MỘT Envelope: WebSocket chỉ đưa cho bạn một mảng byte,
// không có chỗ nào nói "đây là message loại gì". oneof giải quyết đúng việc đó.
message Envelope {
  uint32 seq = 1;                   // field 1..15 dùng tag 1 byte — để dành cho thứ gửi thường xuyên
  oneof body {
    MoveIntent    move_intent   = 2;
    AttackIntent  attack_intent = 3;
    StateSnapshot snapshot      = 4;
    ErrorMsg      error         = 5;
  }
}

message MoveIntent {
  sint32 dx   = 1;                  // sint32 cho số CÓ THỂ ÂM: mã zigzag, nhỏ hơn int32 nhiều
  sint32 dy   = 2;
  uint32 tick = 3;
}

message PlayerState {
  string id = 1;
  sint32 x  = 2;
  sint32 y  = 3;
  int32  hp = 4;
  optional bool is_dead = 5;        // optional: phân biệt được "không gửi" với "gửi false"
}

message StateSnapshot {
  uint32 tick = 1;
  repeated PlayerState players = 2;
}

enum ErrorCode {
  ERROR_CODE_UNSPECIFIED     = 0;   // BẮT BUỘC có giá trị 0, và nó phải nghĩa là "chưa xác định"
  ERROR_CODE_NOT_ENOUGH_GOLD = 1;
  ERROR_CODE_COOLDOWN        = 2;
}

message ErrorMsg {
  ErrorCode code = 1;
  string detail  = 2;               // chỉ để log, ĐỪNG hiện thẳng cho người chơi
}
```

## Bốn luật đánh số field

Số field là thứ đi trên dây, **tên field thì không**. Hệ quả trực tiếp:

1. **Không bao giờ đổi số của một field đã phát hành.** Đổi tên thì an toàn về mặt wire (chỉ vỡ code), đổi số thì client cũ đọc byte của field này thành field khác — im lặng và sai.
2. **Không bao giờ tái dùng số đã xoá.** Dùng `reserved 3, 7 to 9;` và `reserved "old_hp";` để compiler chặn hộ. Người mới vào đội sẽ thấy số 3 trống và muốn xài lại — `reserved` là lời cảnh báo duy nhất còn lại.
3. **Không đổi kiểu.** `int32` → `int64` tương thích được, nhưng `int32` → `string` thì không. Cần đổi thật thì thêm field mới và giữ field cũ một thời gian.
4. **Dành 1–15 cho field gửi mỗi tick.** Tag của chúng chiếm 1 byte, từ 16 trở lên là 2 byte. Trong snapshot 20 người × 20 tick/giây, một byte lẻ là 400 byte/giây cho mỗi người xem.

Proto3 có một hành vi phải thuộc: **giá trị mặc định không được gửi lên dây.** `hp = 0` và "không gửi hp" là **cùng một gói tin**. Cần phân biệt (ví dụ "đặt hp về 0" khác "giữ nguyên hp") thì phải khai `optional` như `is_dead` ở trên.

## Sinh code cho cả hai phía

```bash
# Cách gọn nhất hiện nay là buf: một file cấu hình, tự tải plugin, có lint và kiểm tương thích.
buf generate                       # sinh cả Go lẫn C# theo buf.gen.yaml
buf lint                           # bắt sai quy ước đặt tên, enum thiếu giá trị 0
buf breaking --against '.git#branch=main'   # ĐÂY là thứ đáng giá nhất: chặn thay đổi phá tương thích

# Không dùng buf thì protoc thuần cũng được:
protoc -I proto --go_out=gen --go_opt=paths=source_relative proto/game.proto
protoc -I proto --csharp_out=unity/Assets/Scripts/Gen proto/game.proto
```

Ba quyết định đi kèm, chốt sớm để khỏi cãi nhau về sau:

- **`.proto` ở đâu.** Một thư mục `proto/` trong repo server, client lấy qua submodule hoặc qua bước CI copy sang. Đừng để mỗi bên giữ một bản.
- **Code sinh ra có commit không.** Tốt nhất là **không** với Go (`buf generate` trong CI), nhưng **có** với Unity — vì Unity cần file `.cs` tồn tại để mở project được. Nếu commit thì CI phải kiểm "sinh lại có khác không", nếu khác là ai đó sửa tay bản sinh.
- **`buf breaking` chạy trong CI trên mọi pull request.** Đây là lý do chính để dùng protobuf; bỏ bước này thì bạn chỉ đang đổi JSON lấy một định dạng khó đọc hơn.

## Đọc và ghi ở phía Go

```go
// Gửi: gói vào Envelope rồi ghi một BinaryMessage. WebSocket giữ ranh giới message hộ bạn,
// nên KHÔNG cần prefix độ dài. Trên TCP thuần thì cần (varint length prefix).
env := &gamepb.Envelope{
    Seq:  atomic.AddUint32(&c.seq, 1),
    Body: &gamepb.Envelope_MoveIntent{
        MoveIntent: &gamepb.MoveIntent{Dx: dx, Dy: dy, Tick: tick},
    },
}
b, err := proto.Marshal(env)
if err != nil {
    return err
}
if err := c.conn.WriteMessage(websocket.BinaryMessage, b); err != nil {
    return err
}

// Nhận: switch trên oneof. Mọi nhánh đều phải có default — client có thể là bản mới hơn server.
var in gamepb.Envelope
if err := proto.Unmarshal(data, &in); err != nil {
    return fmt.Errorf("gói tin hỏng từ %s: %w", c.userID, err)   // ngắt kết nối, đừng đoán
}
switch body := in.Body.(type) {
case *gamepb.Envelope_MoveIntent:
    room.Send(Msg{Type: MsgMove, Move: body.MoveIntent})         // vẫn phải VALIDATE, proto chỉ bảo đảm KIỂU
case *gamepb.Envelope_AttackIntent:
    room.Send(Msg{Type: MsgAttack, Attack: body.AttackIntent})
default:
    slog.Warn("message không hiểu", "user", c.userID, "seq", in.Seq)  // bỏ qua, KHÔNG ngắt kết nối
}
```

Hai điều dễ hiểu nhầm về protobuf, cùng ở đoạn trên:

- **Protobuf bảo đảm kiểu, không bảo đảm luật chơi.** `dx` là số nguyên hợp lệ không có nghĩa là người chơi được phép đi 500 ô một tick. Mọi kiểm tra quyền, khoảng cách, cooldown ở [[game-server-go]] vẫn nguyên giá trị.
- **Envelope không phải cách duy nhất.** Có hệ thống đặt loại message vào *khung tin* thay vì vào payload: vài byte header trước dữ liệu protobuf cho WebSocket, hoặc một header HTTP mang tên message cho REST. Đổi lại: payload sạch hơn và không phải sửa `.proto` mỗi lần thêm loại message, nhưng bạn tự cầm phần định tuyến và tự chịu trách nhiệm đồng bộ bảng mã giữa hai phía. Một bản đã chạy thật ở [[go-production-arch]].
- **Message lạ thì bỏ qua, đừng ngắt kết nối.** Trong lúc deploy dần, client mới gửi loại message server cũ chưa biết là chuyện bình thường. Còn gói tin *giải mã hỏng* thì mới ngắt — đó là dấu hiệu sai giao thức hoặc có người thử tay.

## Bẫy thường gặp

| Bẫy | Hậu quả |
|---|---|
| Tái dùng số field đã xoá | Client cũ đọc byte của field mới thành field cũ — sai im lặng, cực khó lần |
| Enum không có giá trị 0, hoặc 0 mang nghĩa thật | Field không gửi trở thành một giá trị hợp lệ nhưng sai |
| Quên rằng proto3 không gửi giá trị mặc định | "Đặt hp = 0" và "không đụng tới hp" giống hệt nhau trên dây |
| Dùng `float`/`double` cho tiền | Đúng cái luật số nguyên ở [[game-database]] bị phá ngay ở tầng giao thức |
| Commit code sinh ra rồi sửa tay | Lần `buf generate` sau xoá sạch, hoặc tệ hơn: hai phía lệch nhau |
| Không có `buf breaking` trong CI | Mất gần hết lợi ích của protobuf, chỉ còn lại phần khó đọc |
| Gửi `map<string, X>` rồi dựa vào thứ tự | Map trong protobuf không có thứ tự bảo đảm |
| Đặt tất cả field vào số 16+ | Mỗi field tốn thêm 1 byte tag mỗi lần gửi |
| Dùng protobuf cho cả API meta | Mất `curl`, mất log đọc được, đổi lại vài byte không ai cảm thấy |

## 🤖 Prompt cho AI

**Dùng AI thế nào cho tầng giao thức**

Protobuf chia làm hai phần rạch ròi, và AI chỉ nên nhận một phần:

| Giao được | Đừng giao |
|---|---|
| Viết `.proto` từ mô tả message, đặt tên theo quy ước, sinh lệnh `buf` | Quyết định **message nào cần có** và gửi bao nhiêu lần mỗi giây |
| Lớp encode/decode, envelope switch, khung WebSocket | Quyết định field nào vào 1–15 (phụ thuộc nhịp gửi thật của game bạn) |
| Viết `buf.yaml`, `buf.gen.yaml`, bước CI kiểm phá tương thích | Sửa `.proto` đã phát hành — mọi thay đổi ở đó phải do người duyệt |
| Script đo: cùng payload, JSON nặng bao nhiêu byte, proto bao nhiêu | Kết luận "đủ nhanh rồi" — phải nhìn số đo |

Cách dùng hiệu quả: đưa nó **JSON bạn đang gửi** và nhịp gửi, bắt nó đề xuất `.proto` tương đương **kèm bảng so sánh kích thước từng message**. Có bảng đó bạn mới biết việc chuyển sang protobuf có đáng hay không, thay vì làm theo cảm giác.

Khi sửa `.proto` đã phát hành, bắt AI trả lời đúng một câu trước khi viết code: *thay đổi này có phá tương thích với client đang chạy ngoài kia không, và vì sao?*

**Phải nêu rõ** (thiếu là AI tự bịa):

- **Nhịp gửi của từng message** (mỗi tick, mỗi lần bấm, mỗi phút) và **số người trong phòng** — nó quyết định field nào được vào 1–15.
- **Đã phát hành chưa.** Chưa thì đổi thoải mái; rồi thì mọi thay đổi phải tương thích ngược.
- **Kênh truyền:** WebSocket (có ranh giới message) hay TCP thuần (phải tự prefix độ dài).
- **Phiên bản:** proto3, `protoc-gen-go` mới (`google.golang.org/protobuf`, không phải `github.com/golang/protobuf` đã cũ), Unity 6 + IL2CPP.
- **Code sinh ra có commit không**, và sinh vào thư mục nào ở cả hai repo.

**Mẫu prompt**

```
Chuyển giao thức realtime của game từ JSON sang protobuf. Go 1.22 server,
Unity 6 client (IL2CPP), WebSocket. Phòng 8 người, tick 20Hz.

JSON đang gửi hiện nay:
<dán 3 message thật, kèm nhịp gửi của từng cái>

Yêu cầu:
1. File .proto (proto3, package game.v1) với MỘT Envelope dùng oneof.
   Field gửi mỗi tick phải nằm trong số 1..15. Giải thích lựa chọn số cho từng field.
2. Bảng so sánh: mỗi message hiện nặng bao nhiêu byte JSON, dự kiến bao nhiêu byte proto,
   và tổng băng thông mỗi người chơi mỗi giây ở 20Hz với 8 người.
3. buf.yaml + buf.gen.yaml sinh cả Go lẫn C#, kèm bước CI chạy `buf lint` và
   `buf breaking --against` nhánh main.
4. Lớp đọc/ghi phía Go: message lạ thì BỎ QUA, message giải mã hỏng thì NGẮT kết nối.

KHÔNG dùng github.com/golang/protobuf (đã cũ). KHÔNG đặt field tiền tệ kiểu float.
KHÔNG sửa số field sau khi tôi duyệt .proto.
```

**Bẫy thường gặp:** AI sinh `.proto` theo thói quen viết API web — mỗi request một message riêng, không có envelope — rồi lớp WebSocket của nó phải tự nhét thêm một byte "type" ở đầu mảng byte, tức là dựng lại `oneof` bằng tay và sai chỗ đầu tiên có người thêm message mới. Ba cái nữa: nó đặt `ERROR_CODE_UNSPECIFIED = 0` rồi vẫn dùng số 0 cho một lỗi thật; nó dùng `int32` cho toạ độ có thể âm thay vì `sint32` (gói tin to hơn mà không ai để ý); và khi bạn nhờ sửa schema, nó **đánh số lại toàn bộ field cho gọn** — thao tác phá tương thích với mọi client đang chạy, và trông hoàn toàn vô hại trong diff.

## 🎮 Unity

Phía Unity, protobuf là một DLL runtime cộng với các file `.cs` do `protoc` sinh. Không có gì đặc biệt — trừ ba chỗ IL2CPP và stripping hay cắn.

**Component & nơi đặt**

- `Assets/Plugins/Google.Protobuf.dll` — runtime, lấy từ NuGet (`Google.Protobuf`) hoặc qua `com.google.protobuf` nếu đội bạn đã có registry riêng.
- `Assets/Scripts/Gen/` — file `.cs` do `protoc --csharp_out` sinh. **Không sửa tay**, và thêm một `.asmdef` riêng để không phải biên dịch lại cả game mỗi lần đổi `.proto`.
- `Assets/Scripts/Net/GameSocket.cs` — lớp gửi/nhận, dùng `NativeWebSocket` hoặc `ClientWebSocket` của .NET.

**Code**

```csharp
using System;
using Game.Net;                 // namespace do option csharp_namespace sinh ra
using Google.Protobuf;
using UnityEngine;

// Gửi/nhận Envelope qua WebSocket nhị phân. Không có JSON ở đây, và không dùng reflection.
public class GameSocket : MonoBehaviour
{
    uint seq;

    public byte[] EncodeMove(int dx, int dy, uint tick)
    {
        var env = new Envelope
        {
            Seq = ++seq,
            MoveIntent = new MoveIntent { Dx = dx, Dy = dy, Tick = tick },
        };
        return env.ToByteArray();          // cấp phát mảng mới mỗi lần — xem phần bẫy bên dưới
    }

    public void OnBinaryMessage(byte[] data)
    {
        Envelope env;
        try
        {
            env = Envelope.Parser.ParseFrom(data);
        }
        catch (InvalidProtocolBufferException e)
        {
            Debug.LogError($"Gói tin hỏng: {e.Message}");   // sai giao thức: báo và ngắt, đừng đoán
            return;
        }

        switch (env.BodyCase)                               // oneof sinh ra enum BodyCase
        {
            case Envelope.BodyOneofCase.Snapshot:
                ApplySnapshot(env.Snapshot);
                break;
            case Envelope.BodyOneofCase.Error:
                ShowError(env.Error.Code);                  // dùng CODE, đừng hiện env.Error.Detail cho người chơi
                break;
            default:
                break;                                      // server mới hơn client: bỏ qua, KHÔNG ngắt
        }
    }

    void ApplySnapshot(StateSnapshot s) { /* nội suy về trạng thái mới */ }
    void ShowError(ErrorCode code) { /* tra bảng nội địa hoá theo code */ }
}
```

**Bẫy Unity cụ thể**

- **IL2CPP + Managed Stripping.** Code sinh ra dùng ít reflection nên thường sống sót, nhưng `JsonFormatter` và `Any` thì không. Dùng chúng thì phải có `link.xml` giữ `Google.Protobuf`; nếu không, Editor chạy ngon còn bản build im lặng ném `MissingMethodException`.
- **`ToByteArray()` cấp phát mỗi lần gọi.** Ở 20Hz với vài message mỗi tick là rác GC đều đặn — đúng loại giật định kỳ nói ở [[unity-optimization]]. Gửi liên tục thì dùng `MessageExtensions.WriteTo(stream)` với một `MemoryStream` tái dùng.
- **File `.cs` sinh ra nằm chung assembly với game** làm mỗi lần đổi `.proto` phải biên dịch lại toàn bộ. Tách `.asmdef` cho `Gen/` là vài phút đổi lấy hàng chục giây mỗi lần lặp.
- **WebGL không dùng được `ClientWebSocket`** của .NET — phải qua jslib (NativeWebSocket làm sẵn việc này). Và WebGL vẫn cần server trả CORS.
- **Quên sinh lại `.cs` sau khi `.proto` đổi.** Server gửi field mới, client đọc thiếu, không lỗi gì cả — chỉ là giá trị mặc định. Đưa bước `protoc` vào script build hoặc vào menu Editor như ở [[go-gamedev-tools]].
- **Đừng hiện `error.detail` cho người chơi.** Nó là chuỗi tiếng Anh dành cho log; hiện thẳng nghĩa là lộ chi tiết nội bộ và không nội địa hoá được. Nội địa hoá theo `ErrorCode`.

**Kiểm tra nhanh**

- Sửa `.proto` đổi số một field rồi build lại **chỉ phía server**: client cũ phải hiện sai hoặc mất dữ liệu — chứng minh vì sao `buf breaking` trong CI là bắt buộc. Sau đó hoàn tác.
- Bật Network Profiler hoặc đếm byte trong `OnBinaryMessage`: snapshot 8 người ở 20Hz phải nhỏ hơn bản JSON tương đương vài lần.
- Build IL2CPP (không phải Mono) rồi chạy: parse vẫn đúng, không `MissingMethodException`.
- Cho server gửi một loại message client chưa biết: client bỏ qua và **vẫn chơi tiếp**, không ngắt kết nối.

## 🎤 Phỏng vấn

**Câu hay gặp**

- `Junior` **Khi nào dùng protobuf, khi nào cứ JSON?**
  → REST meta thì JSON, realtime thì protobuf. Login, shop, inventory gọi vài lần một phút — JSON ở đó đáng giá vì debug được bằng `curl` và đọc log bằng mắt. Còn 20 gói mỗi giây cho mỗi người trong phòng thì mỗi byte và mỗi lần cấp phát đều nhân lên theo số người; protobuf nhỏ hơn 2–5 lần với dữ liệu nhiều số.
- `Junior` **Envelope để làm gì?**
  → Vì WebSocket chỉ đưa cho bạn một mảng byte, không có chỗ nào nói "đây là message loại gì". Gói mọi message trong một `Envelope` có `oneof` giải đúng việc đó, và cho bạn thêm chỗ đặt `seq` để đánh số gói. Không có envelope thì phải tự phát minh một byte header — và nó sẽ thiếu thứ bạn cần ở tháng thứ ba.
- `Mid` **Bốn luật đánh số field là gì?**
  → Chỉ thêm không đổi nghĩa; không tái sử dụng số đã bỏ, đánh dấu `reserved`; field mới phải chạy đúng khi client cũ không gửi nó; và bỏ field theo ba nhịp — ngừng dùng, chờ, rồi mới xoá. Field 1 tới 15 dùng tag một byte nên để dành cho thứ gửi thường xuyên nhất.
- `Mid` **Vì sao không commit code sinh ra từ `.proto`?**
  → Vì có bản sinh trong repo là có người sửa nó rồi quên sửa `.proto` — và từ đó hợp đồng không còn là nguồn chân lý nữa. Sinh lại trong CI thì lệch schema thành build đỏ chứ không phải bug ở máy người chơi.
- `Senior` **Làm sao biết một thay đổi `.proto` sẽ phá client cũ?**
  → Chạy `buf breaking` trong CI, so với bản trên nhánh chính. Đổi số field hay đổi kiểu là build đỏ ngay. Đây là bước rẻ nhất trong toàn bộ pipeline và nó chặn đúng loại lỗi đắt nhất — loại chỉ lộ ra ở máy người chơi đã cài bản cũ.
- `Senior` **Protobuf trên Unity có bẫy gì riêng?**
  → IL2CPP strip code không được tham chiếu tĩnh, nên reflection trong runtime protobuf có thể ném `MissingMethodException` chỉ ở bản build, không ở Editor. Phải test trên **bản IL2CPP thật**, không phải Mono, và giữ lại thứ cần bằng `link.xml`. Thêm nữa, client phải **bỏ qua message chưa biết** thay vì ngắt kết nối, vì server luôn được nâng cấp trước client.

**Khung trả lời 60 giây** — "Thêm field vào message đang chạy production?"

> Lấy một số field **chưa dùng bao giờ**, không đụng số cũ. Field số 5 là `gold` thì vĩnh viễn là `gold` — cần thứ khác thì thêm field số 12. Và field mới phải chạy đúng khi client cũ không gửi nó, tức là giá trị rỗng phải có nghĩa hợp lý ở phía server.
>
> Cái tôi không bao giờ làm là **dùng lại số đã bỏ**. Client cũ sẽ đọc dữ liệu mới bằng nghĩa cũ, không báo lỗi gì cả — sai lặng lẽ là loại lỗi đắt nhất. Bỏ field thì đánh dấu `reserved` rồi quên số đó đi.
>
> Để không phụ thuộc vào trí nhớ, CI chạy `buf breaking` so với nhánh chính: đổi số hay đổi kiểu là build đỏ ngay, thay vì thành bug ở máy người chơi ba tuần sau.

**Họ sẽ đào tiếp**

- *"`sint32` khác `int32` chỗ nào?"* → `sint32` dùng mã zigzag nên số âm nhỏ gọn hơn nhiều. Với toạ độ hay delta — thứ thường xuyên âm và gửi 20 lần mỗi giây — chọn đúng kiểu là tiết kiệm thật, không phải tối ưu vặt.
- *"Vì sao version nằm trong package?"* → `package game.v1` cho phép v1 và v2 sống song song trong cùng một binary. Khi buộc phải phá vỡ tương thích, bạn chạy hai bản cùng lúc cho tới khi client cũ hết, thay vì ép mọi người cập nhật trong một đêm.
- *"Protobuf có che giấu dữ liệu không?"* → Không. Nó là mã hoá nhị phân để gọn và nhanh, không phải để bảo mật — ai bắt được gói tin đều giải mã được bằng công cụ có sẵn. Bảo mật vẫn phải là TLS cộng với việc server không tin số nào client gửi.
- *"Chi phí ban đầu của protobuf?"* → Codegen, thêm một bước build, thêm DLL vào Unity, và mất khả năng nhìn gói tin bằng mắt. Với dự án nhỏ chỉ có meta game thì cái giá đó không đáng; lý do đáng nhất để trả nó thường **không phải băng thông** mà là để có một hợp đồng viết ra giữa hai đội.
- *"Ai sửa `.proto`?"* → Cả hai phía cùng review trước khi merge. File này là nơi duy nhất hai đội gặp nhau, nên nó xứng đáng có quy trình riêng thay vì trôi qua như một commit bình thường.

**Cờ đỏ**

- Đánh số lại field khi "dọn dẹp" file contract.
- Commit code sinh ra rồi sửa tay nó.
- Thêm field bắt buộc và gọi đó là tương thích ngược.
- Coi protobuf là một lớp bảo mật.
- Chỉ test trên Mono trong Editor rồi kết luận IL2CPP cũng chạy.
- Client ngắt kết nối khi gặp message lạ, thay vì bỏ qua.

**Số / ví dụ nên thuộc**

- Protobuf nhỏ hơn JSON **2–5 lần** với dữ liệu nhiều số.
- Field **1–15** dùng tag một byte — dành cho message gửi thường xuyên.
- `buf breaking` trong CI là cổng chặn thay đổi phá tương thích.
- Version trong package: `game.v1` — v1 và v2 sống song song được.

**Kể trong dự án**

- *"Ai đề xuất dùng protobuf?"* → Nếu là bạn, nêu **lý do thật**: thường không phải băng thông mà là hết chịu nổi cảnh hai phía hiểu khác nhau về cùng một field. Lý do đó nghe đáng tin hơn nhiều so với lý do hiệu năng.
- *"Khó khăn gặp phải?"* → Mẫu tốt: build Editor chạy ngon, build IL2CPP ném `MissingMethodException` khi parse. Kể cách bạn khoanh vùng ra là strip code và xử lý bằng `link.xml` — chi tiết này chỉ người từng build thật mới kể được.
- *"Anh thêm gì vào quy trình?"* → Nếu bạn đưa `buf breaking` vào CI, đó là đóng góp đếm được: nêu lần vỡ tương thích trước đó đã tốn bao nhiêu, và sau khi thêm thì không lặp lại nữa.
