---
title: Narrative Design
icon: 📖
summary: Kể chuyện bằng phương tiện của game — không gian, cơ chế, hệ thống — chứ không chỉ bằng cắt cảnh.
status: stub
read: 290
level: intermediate
order: 40
tags: [content, narrative]
related: [level-design, llm-npc, pacing]
---

Narrative design khác writing. Writing tạo ra chữ; narrative design quyết định **câu chuyện được truyền đạt qua đâu**.

## Ba kênh kể chuyện

- **Environmental storytelling** — hiện trường kể chuyện. Hai bộ xương cạnh một cánh cửa khoá kể nhiều hơn ba trang nhật ký.
- **Systemic / emergent** — câu chuyện nảy sinh từ luật chơi. Dwarf Fortress, RimWorld không viết sẵn gì cả.
- **Authored** — cắt cảnh, hội thoại, văn bản. Mạnh nhất về mặt kiểm soát, yếu nhất về mặt tham gia.

## Cần bồi đắp

- [ ] Ludonarrative dissonance: khi cơ chế mâu thuẫn với câu chuyện
- [ ] Cấu trúc cây hội thoại vs hội thoại theo trạng thái
- [ ] Kể chuyện trong game không có cốt truyện (roguelike, puzzle)
- [ ] Lore rải rác: liều lượng và vị trí đặt
- [ ] Nhân vật: từ archetype tới động cơ

## Ghi chú tạm

Câu hỏi kiểm tra: **"nếu bỏ hết chữ, còn lại câu chuyện gì?"** Nếu câu trả lời là "không có gì", bạn đang viết tiểu thuyết có nút bấm.

Về [[llm-npc]]: LLM hứa hẹn hội thoại vô hạn, nhưng hội thoại vô hạn **không có trọng lượng**. Nếu NPC nói gì cũng được, không câu nào đáng nhớ. Ràng buộc mới là thứ tạo ra ý nghĩa — vì vậy hãy dùng LLM cho *biến thể diễn đạt* và *phản ứng theo bối cảnh*, chứ không phải cho *nội dung cốt truyện*.

## 🤖 Prompt cho AI

LLM viết chữ rất nhanh, nên nguy cơ ở đây là **quá nhiều chữ chất lượng trung bình**.

**Phải nêu rõ:**
- Kênh kể chuyện chính: môi trường / hệ thống / viết sẵn
- Giọng và độ dài: bao nhiêu từ mỗi dòng thoại, mỗi mẩu lore
- Sự thật cố định (canon) mà AI không được mâu thuẫn
- Cấm: giải thích lộ liễu, nhân vật nói ra chủ đề của game

**Mẫu prompt**

```
Kênh chính: environmental storytelling. Hội thoại chỉ chiếm ~20%.

Canon (KHÔNG được mâu thuẫn):
- Thành phố bị bỏ hoang 40 năm trước vì nguồn nước nhiễm độc
- Không ai trong game biết nguyên nhân thật
- Không có phép thuật, không có sinh vật siêu nhiên

Viết 12 "hiện trường kể chuyện": mỗi cái gồm
  - bố trí vật thể (tối đa 4 vật)
  - điều người chơi suy ra được, KHÔNG viết ra thành chữ
  - 0 hoặc 1 mẩu văn bản, tối đa 25 từ

CẤM: nhật ký giải thích toàn bộ sự việc. CẤM: NPC nói ra chủ đề của game.
```

**Bẫy thường gặp:** AI mặc định viết "nhật ký của người sống sót" giải thích mọi thứ — đó là cách kể chuyện lười nhất. Giới hạn số từ là công cụ chặn hiệu quả nhất.

## 🎮 Unity

Trong Unity, câu chuyện sống ở **asset text ngoài code**, không phải chuỗi trong script. Đây là quyết định làm hay phá khả năng dịch thuật về sau.

**Nơi các quyết định sống**

- `Assets/Localization/strings.csv` — mọi chuỗi, có key
- `Core/Narrative/DialogueGraph.cs` — cấu trúc hội thoại (C# thuần)
- `Assets/Data/Narrative/*.asset` — cây hội thoại, biên tập trong Editor

**Không bao giờ hardcode chuỗi**

```csharp
// ❌ không dịch được, không biên tập được ngoài Unity
dialogueText.text = "Ta đã bảo rồi, đừng lảng vảng quanh kho thóc.";

// ✅ key + bảng chuỗi
dialogueText.text = Loc.Get("gorn.warn.barn");
```

Unity có package **Localization** chính thức (`com.unity.localization`) với String Table và Smart String. Đáng dùng nếu có kế hoạch dịch; nếu không, một `Dictionary<string,string>` nạp từ CSV là đủ.

**Chuỗi dài làm vỡ layout — vấn đề thật**

Tiếng Đức dài hơn tiếng Anh khoảng 30%, tiếng Việt có dấu làm chiều cao dòng tăng. Layout phải co giãn:

```
Text (TMP) + Content Size Fitter (Vertical: Preferred)
Parent      + Vertical Layout Group
```

Đặt chiều cao cố định cho hộp hội thoại là cách chắc chắn nhất để chữ bị cắt ở ngôn ngữ khác. Chi tiết ở [[unity-ui]].

**Environmental storytelling — prefab, không phải scene**

```
Assets/Prefabs/Story/
├── Scene_SkeletonAtDoor.prefab      ← 2 bộ xương + cánh cửa khoá
└── Scene_AbandonedCamp.prefab
```

Gom mỗi "hiện trường kể chuyện" thành một prefab. Nhờ vậy đặt lại được ở nhiều màn, sửa một chỗ, và không lẫn vào bố cục màn chơi.

**Timeline cho cutscene — nếu có**

Unity Timeline tốt cho cutscene ngắn. Nhưng: **Timeline không skip được sẵn** — phải tự viết. Và nhớ `Director.time = Director.duration` để nhảy tới cuối thay vì `Stop()`, nếu không các signal cuối không bắn.

**Bẫy Unity cụ thể**
- **`TMP_Text` thiếu glyph tiếng Việt** — font atlas phải có dấu. Kiểm tra bằng cách hiện một chuỗi đủ dấu; thiếu thì hiện ô vuông.
- **`text +=` trong hiệu ứng gõ chữ** cấp phát mỗi frame. Dùng `TMP_Text.maxVisibleCharacters` — không cấp phát gì cả.
- **Cutscene không skip được** → playtester phải xem lại 40 lần.

**Kiểm tra nhanh**
- Grep chuỗi tiếng Việt hardcode trong `.cs` → nên bằng 0.
- Thay mọi chuỗi bằng bản dài gấp 1.5: layout có vỡ không?
- Hiệu ứng gõ chữ: GC Alloc = 0 B?
- Mọi cutscene skip được bằng bất kỳ phím nào chứ?
