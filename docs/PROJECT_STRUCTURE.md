# 📁 Project Structure - Chuck King

> **Tài liệu này mô tả cấu trúc thư mục và trách nhiệm của từng team.**

---

## 🌳 Cấu trúc thư mục

```
chuck-king/
├── index.html                 # Entry point (FE-3 quản lý)
├── styles/
│   └── main.css              # All styles (FE-1 quản lý)
├── js/
│   ├── main.js               # Main entry, khởi tạo game (FE-3 quản lý)
│   ├── config.js             # API config (AI-1 quản lý, KHÔNG commit)
│   ├── engine/
│   │   └── GameEngine.js     # Game loop, rendering (GE-1 quản lý)
│   ├── entities/
│   │   ├── Player.js         # Player entity, physics (GE-1 quản lý)
│   │   └── Platform.js       # Platform entity (GE-2 quản lý)
│   ├── systems/
│   │   ├── EventTracker.js   # Track game events (AI-2 quản lý)
│   │   ├── AIRuleEngine.js   # AI trigger rules (AI-2 quản lý)
│   │   └── AIMessageGenerator.js  # AI message generation (AI-1 quản lý)
│   └── ui/
│       └── UIManager.js      # UI overlay, dialog (FE-1 quản lý)
├── backend/                   # Backend server (BE-1, BE-2 quản lý)
│   ├── server.js             # Express server setup (BE-1)
│   ├── routes/
│   │   └── ai.js             # AI endpoints (BE-2)
│   ├── models/               # Database models (BE-1)
│   ├── controllers/          # Business logic (BE-2)
│   ├── middleware/           # Middleware functions (BE-1)
│   └── config/               # Backend config (BE-1)
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

### Frontend Team (3 người)

#### FE-1: UI/UX Manager
**Files:**
- `styles/main.css` - Tất cả CSS styles
- `js/ui/UIManager.js` - UI logic, dialog management

**Responsibilities:**
- Design và implement UI components
- Responsive design
- UI animations và transitions
- Dialog box styling

**⚠️ Lưu ý:**
- Không sửa logic game trong `GameEngine.js`
- Chỉ làm việc với UI layer

---

#### FE-2: Game Canvas & Rendering
**Files:**
- `index.html` - HTML structure
- Canvas setup và rendering helpers

**Responsibilities:**
- HTML structure
- Canvas initialization
- Responsive canvas sizing
- Basic rendering utilities

**⚠️ Lưu ý:**
- Không sửa game logic
- Chỉ làm việc với HTML/CSS và canvas setup

---

#### FE-3: Frontend Integration
**Files:**
- `js/main.js` - Main entry point
- Integration giữa các modules

**Responsibilities:**
- Khởi tạo game engine
- Kết nối các modules với nhau
- API calls từ frontend
- Error handling cho API calls

**⚠️ Lưu ý:**
- Phải hiểu flow của toàn bộ frontend
- Phối hợp với BE team về API integration

---

### Game Engine Team (2 người)

#### GE-1: Game Loop & Physics
**Files:**
- `js/engine/GameEngine.js` - Game loop, update cycle
- `js/entities/Player.js` - Player physics, movement

**Responsibilities:**
- Game loop (update, render)
- Player physics (jump, gravity, collision)
- Input handling
- Performance optimization

**⚠️ Lưu ý:**
- Không sửa UI code
- Không sửa AI system logic
- Chỉ focus vào game mechanics

---

#### GE-2: Entities & Platforms
**Files:**
- `js/entities/Platform.js` - Platform entities
- Thêm entities mới (nếu có)

**Responsibilities:**
- Platform creation và management
- Collision detection với platforms
- Thêm obstacles, power-ups (future)
- Level design helpers

**⚠️ Lưu ý:**
- Phối hợp với GE-1 về collision detection
- Không sửa Player physics

---

### AI System Team (2 người)

#### AI-1: AI Integration & API
**Files:**
- `js/systems/AIMessageGenerator.js` - AI message generation
- `js/config.js` - API configuration

**Responsibilities:**
- API calls đến backend
- Parse API responses
- Fallback về hardcoded messages
- Error handling cho API calls

**⚠️ Lưu ý:**
- Phối hợp chặt với BE team về API format
- Đảm bảo fallback luôn hoạt động
- KHÔNG commit `config.js` có API key

---

#### AI-2: Event Tracking & Rules
**Files:**
- `js/systems/EventTracker.js` - Track game events
- `js/systems/AIRuleEngine.js` - AI trigger rules

**Responsibilities:**
- Track player events (death, idle, stuck)
- Implement trigger rules
- Context building cho AI
- Cooldown management

**⚠️ Lưu ý:**
- Phối hợp với GE-1 để nhận events
- Phối hợp với AI-1 để pass context

---

### Backend Team (2 người)

#### BE-1: API Server & Database
**Files:**
- `backend/server.js` - Express server setup
- `backend/models/` - Database models
- `backend/middleware/` - Middleware
- `backend/config/` - Configuration

**Responsibilities:**
- Setup Express server
- Database setup (nếu cần)
- CORS configuration
- Server deployment
- Environment variables

**⚠️ Lưu ý:**
- Đảm bảo CORS cho phép frontend origin
- Không hardcode sensitive data

---

#### BE-2: API Endpoints & Integration
**Files:**
- `backend/routes/ai.js` - AI endpoints
- `backend/controllers/` - Business logic

**Responsibilities:**
- Implement API endpoints theo contract
- AI API integration (OpenAI, etc.)
- Request/response validation
- Error handling

**⚠️ Lưu ý:**
- Phải follow `API_CONTRACT.md` chính xác
- Phối hợp với AI-1 về response format
- Test với Postman trước khi merge

---

## 🔒 File Ownership Rules

### Quy tắc sửa file:

1. **Own file**: Team member có thể sửa tự do
2. **Shared file**: Phải thông báo trước khi sửa
3. **Core file**: Cần review trước khi merge

### File Categories:

**Own Files:**
- Mỗi team member có files riêng (xem trên)

**Shared Files:**
- `js/main.js` - FE-3 + tất cả teams (integration point)
- `index.html` - FE-2 + FE-3

**Core Files (cần review):**
- `js/engine/GameEngine.js` - Ảnh hưởng toàn bộ game
- `js/main.js` - Entry point

---

## 📦 Dependencies

### Frontend
- Vanilla JavaScript (ES6 modules)
- No external dependencies (hiện tại)

### Backend
- Node.js
- Express.js
- (Sẽ thêm khi implement)

---

## 🚫 Files không được commit

- `js/config.js` - Chứa API keys
- `.env` - Environment variables
- `node_modules/` - Dependencies
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

**Last Updated**: 2024-01-15
**Maintained by**: All Teams

