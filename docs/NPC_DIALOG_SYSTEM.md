# NPC Dialog System (tích hợp AI)

## Tổng quan

NPC dùng **một hộp thoại** cho hai việc:
1. **Dialog** – intro, 4 stage, ending (nội dung từ API hoặc default).
2. **Trêu chọc** – death / idle / stuck do AIRuleEngine kích hoạt (API hoặc default).

- **Có API**: prompt gửi AI, response được chia dòng và dùng cho dialog; trêu chọc cũng gọi API.
- **Không API**: dùng nội dung mặc định trong `AIMessageGenerator`.

## Luồng

- **Trêu chọc**: `EventTracker` → `AIRuleEngine.checkTriggers()` → `AIMessageGenerator.generateMessage()` → event `npcTaunt` → `NPCDialogSystem.showTaunt()` → hiển thị trong `#npc-dialog-box`.
- **Dialog**: `triggerNPCDialog('intro' | 'stage1' | ... | 'ending')` hoặc `changeStage('stage1')` → `NPCDialogSystem.showDialog(key)` → `AIMessageGenerator.getDialogContent(key)` (API hoặc default) → hiển thị dòng đầu trong `#npc-dialog-box`.

## File liên quan

| File | Vai trò |
|------|--------|
| `js/config/NPCDialogConfig.js` | **Config**: nội dung default (trêu chọc + dialog) và prompt gửi API; chỉnh file này để đổi lời / prompt |
| `js/systems/AIMessageGenerator.js` | Default dialogs + taunt; gọi API cho dialog/taunt nếu có config |
| `js/systems/NPCDialogSystem.js` | UI dialog box; lắng nghe `npcTaunt`, gọi `getDialogContent()` cho intro/stage/ending |
| `js/systems/AIRuleEngine.js` | Trigger death/idle/stuck → gọi `AIMessageGenerator.generateMessage()` |
| `game.html` | `#npc-dialog-box`, nút Demo (Intro, Stage 1–4, Ending) |

## Dialog keys

| Key | Mô tả |
|-----|--------|
| `intro` | Chào mừng khi vào game |
| `stage1` | Stage 1 (dễ) |
| `stage2` | Stage 2 (trung bình) |
| `stage3` | Stage 3 (khó) |
| `stage4` | Stage 4 / Boss |
| `ending` | Kết thúc khi thắng |

## Cách test

- Trong game: dùng nhóm nút **Demo** (Intro, Stage 1, Stage 2, Stage 3, Stage 4, Ending) để bật từng dialog.
- Console: `triggerNPCDialog('intro')`, `triggerNPCDialog('stage2')`, `triggerNPCDialog('ending')`, v.v.
- Trêu chọc: chơi bình thường (chết, đứng yên, kẹt một chỗ) để AIRuleEngine trigger; lời trêu chọc xuất hiện trong cùng hộp NPC.

## API

- Cấu hình API trong modal ⚙️ API (endpoint + key). Khi có API, dialog (intro/stage/ending) và trêu chọc đều có thể dùng response từ AI; không có API thì dùng default trong `AIMessageGenerator`.
