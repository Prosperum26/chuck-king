# 📁 Project Structure - Chuck King

> **Tài liệu này mô tả cấu trúc thư mục và trách nhiệm của từng team.**

---

## 🌳 Cấu trúc thư mục

```
chuck-king/
├── index.html                 # Entry point - Start menu (GitHub Pages)
├── game.html                  # Game page (canvas, API modal, main game)
├── styles/
│   └── main.css              # All styles (Subteam 2)
├── js/
│   ├── main.js               # Main entry, khởi tạo game (Subteam 1/2/3 - shared integration point)
│   ├── config.js             # Runtime config local (KHÔNG commit)
│   ├── config.example.js     # Example config (commit)
│   ├── config.default.js     # Safe defaults for GitHub Pages (commit)
│   ├── engine/
│   │   └── GameEngine.js     # Game loop, update/render, input (Subteam 1)
│   ├── entities/
│   │   ├── Player.js         # Player entity, physics (Subteam 1)
│   │   └── Platform.js       # Platform entity, collision helper (Subteam 1)
│   ├── systems/
│   │   ├── EventTracker.js   # Track player behavior & metrics (Subteam 1)
│   │   ├── AIRuleEngine.js   # AI trigger rules (Subteam 1)
│   │   └── AIMessageGenerator.js  # Taunt messages (rule-based + optional API) (Subteam 1 + Subteam 3 shared)
│   └── ui/
│       └── UIManager.js      # UI overlay, HUD, dialog (Subteam 2)
├── docs/                      # Documentation
│   ├── API_CONTRACT.md
│   ├── PROJECT_STRUCTURE.md
│   ├── GIT_WORKFLOW.md
│   ├── SETUP_GUIDE.md
│   └── TESTING_GUIDE.md
└── .gitignore                # Git ignore rules
```

---

## 👥 Team Responsibilities

> Áp dụng cho mô hình **3 subteam** (Game Dev & AI-, UI/UX & Assets, Backend & API).

### Subteam 1 — Game Dev & AI- (Core gameplay + rule-based AI + SFX)

**Files own:**
- `js/engine/GameEngine.js`
- `js/entities/Player.js`
- `js/entities/Platform.js`
- `js/systems/EventTracker.js`
- `js/systems/AIRuleEngine.js`

**⚠️ Lưu ý:**
- Không làm phần API/LLM thật (gọi OpenAI/Claude/Firebase) trong giai đoạn “AI-”.
- Khi cần thêm trigger/metric mới, phải update `EventTracker` + `AIRuleEngine` + thông báo Subteam 2 (UI) nếu có UI mới.

---

### Subteam 2 — Frontend (UI/UX) & Assets

**Files own:**
- `index.html` (start menu)
- `game.html` (game UI shell)
- `styles/main.css`, `styles/menu.css`
- `js/ui/UIManager.js`

**⚠️ Lưu ý:**
- UI/HUD không được block game loop (tránh DOM update quá dày).
- Visual feedback (shake/flash/particle) nên đi theo event/state mà Subteam 1 cung cấp.

---

### Subteam 3 — Backend & API (AI + Firebase Database)

**⚠️ Lưu ý:**
- Repo này là **static** (JS/HTML/CSS) để host dễ trên GitHub Pages.
- “Backend” được triển khai dạng **dịch vụ ngoài** (Firebase/Cloud Functions/Cloud Run/…).
- Subteam 3 chịu trách nhiệm **API contract + endpoint thật + Firebase schema/rules**, và cung cấp hướng dẫn/SDK JS tối giản để frontend gọi được.

---

## 🤝 Shared / Split ownership (quan trọng)

Một số file là “điểm giao” giữa subteam:

- `js/main.js` (**shared**): wiring/init game, config load, glue code.
  - Subteam 1: thêm hook/event cần cho gameplay.
  - Subteam 2: đảm bảo UI elements/DOM ids đúng và không phá init flow.
  - Subteam 3: đảm bảo config/API init không làm lộ secrets và có fallback.

- `js/systems/AIMessageGenerator.js` (**split ownership**):
  - Subteam 1: hardcoded messages, mapping triggerType → message pool, tone levels.
  - Subteam 3: `callAIAPI()`, parse response, auth headers, rate-limit/backoff (nếu có), và spec API trong `docs/API_CONTRACT.md`.
  - Rule: không đổi schema request/response nếu chưa update `API_CONTRACT.md`.

## 🔒 File Ownership Rules

### Quy tắc sửa file:

1. **Own file**: Team member có thể sửa tự do
2. **Shared file**: Phải thông báo trước khi sửa
3. **Core file**: Cần review trước khi merge

### File Categories:

**Own Files:**
- Mỗi subteam có file own (xem trên).

**Shared Files:**
- `js/main.js` - integration point (Subteam 1/2/3)
- `js/systems/AIMessageGenerator.js` - split ownership (Subteam 1 + 3)

**Core Files (cần review):**
- `js/engine/GameEngine.js` - ảnh hưởng toàn bộ gameplay feel
- `js/main.js` - entry point / integration
- `js/systems/EventTracker.js` + `js/systems/AIRuleEngine.js` - ảnh hưởng AI triggers & telemetry

---

## 📦 Dependencies

### Frontend
- Vanilla JavaScript (ES6 modules)
- No external dependencies (hiện tại)

### External services (optional)
- Firebase (Firestore/Realtime DB/Auth) cho lưu stats/settings/leaderboard
- AI API (OpenAI/Claude/...) qua endpoint serverless để tránh lộ key

---

## 🚫 Files không được commit

- `js/config.js` - Chứa API keys
- `.env` - Environment variables
- `*.log` - Log files

Xem `.gitignore` để biết chi tiết.

---

## 📝 Naming Conventions

### Files
- PascalCase cho classes: `GameEngine.js`, `Player.js`
- camelCase cho utilities: `eventTracker.js` (nếu có)

### Variables
- camelCase: `deathCount`, `idleTime`
- Constants: UPPER_SNAKE_CASE: `API_CONFIG`

### Functions
- camelCase: `generateMessage()`, `checkTriggers()`

---

**Last Updated**: 2026-02-03  
**Maintained by**: All Subteams

