# 🚀 Setup Guide - Chuck King

> **Hướng dẫn setup môi trường cho từng team**

---

## 📋 Prerequisites

### Tất cả team cần:

- **Git** - [Download](https://git-scm.com/downloads)
- **VS Code** - [Download](https://code.visualstudio.com/)
- **Browser** - Chrome/Firefox/Edge (latest version)
- **Node.js** (cho Backend team) - [Download](https://nodejs.org/) (v18+)

### VS Code Extensions (khuyến nghị):

- **GitLens** - Git visualization
- **Thunder Client** - API testing (cho Backend team)
- **Live Server** - Local development server
- **Prettier** - Code formatting
- **ES6 String HTML** - Syntax highlighting

---

## 🎯 Setup cho từng team

### Frontend Team

#### FE-1, FE-2, FE-3: Setup cơ bản

```bash
# 1. Clone repository
git clone <repository-url>
cd chuck-king

# 2. Checkout develop branch
git checkout develop

# 3. Tạo feature branch
git checkout -b feature/frontend-your-task

# 4. Mở VS Code
code .
```

#### Chạy game:

**Cách 1: Mở trực tiếp**
- Double-click `index.html`
- Hoặc kéo thả vào browser

**Cách 2: Live Server (khuyến nghị)**
- Cài extension "Live Server" trong VS Code
- Right-click `index.html` → "Open with Live Server"
- Game sẽ chạy tại `http://localhost:5500`

#### Test với mock API:

Tạo file `js/mock-api.js` để test khi backend chưa sẵn sàng:

```javascript
// js/mock-api.js
export const mockAIAPI = async (triggerType, context) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockMessages = {
    death: ["Lại chết rồi à?", "Thử lại đi!", "Không dễ đâu!"],
    idle: ["Đang làm gì đó?", "Còn chơi không?", "Ngủ rồi à?"],
    stuck: ["Bị kẹt rồi nhỉ?", "Thử cách khác đi!", "Khó quá hả?"]
  };
  
  const messages = mockMessages[triggerType] || ["Hmm..."];
  return {
    status: "success",
    message: messages[Math.floor(Math.random() * messages.length)]
  };
};
```

Sử dụng trong `AIMessageGenerator.js`:
```javascript
import { mockAIAPI } from './mock-api.js';

// Trong callAIAPI function, nếu API fail:
const mockResponse = await mockAIAPI(triggerType, context);
return mockResponse.message;
```

---

### Game Engine Team

#### GE-1, GE-2: Setup

```bash
# 1. Clone và checkout branch
git clone <repository-url>
cd chuck-king
git checkout develop
git checkout -b feature/game-engine-your-task

# 2. Mở VS Code
code .
```

#### Test game mechanics:

1. **Test Player physics:**
   - Mở `index.html` trong browser
   - Test jump, gravity, collision
   - Check console (F12) cho errors

2. **Debug tools:**
   ```javascript
   // Thêm vào GameEngine.js để debug
   console.log('Player position:', player.x, player.y);
   console.log('Player velocity:', player.vx, player.vy);
   ```

3. **Performance check:**
   - Mở DevTools → Performance tab
   - Record và check FPS (nên đạt 60 FPS)

---

### AI System Team

#### AI-1: AI Integration Setup

```bash
# 1. Clone và setup
git clone <repository-url>
cd chuck-king
git checkout develop
git checkout -b feature/ai-integration-your-task

# 2. Tạo config file (KHÔNG commit)
cp js/config.js js/config.local.js
# Edit js/config.local.js với API key của bạn
```

**Cấu hình API:**

1. **Lấy OpenAI API key:**
   - Đăng ký tại [OpenAI Platform](https://platform.openai.com/)
   - Tạo API key tại [API Keys](https://platform.openai.com/api-keys)

2. **Cấu hình trong `js/config.local.js`:**
   ```javascript
   export const API_CONFIG = {
     endpoint: 'https://api.openai.com/v1/chat/completions',
     apiKey: 'sk-your-key-here',
     model: 'gpt-3.5-turbo'
   };
   ```

3. **Update `main.js` để dùng local config:**
   ```javascript
   // Thay vì import từ config.js
   import { API_CONFIG } from './config.local.js';
   ```

**Test API:**

```javascript
// Test trong browser console
const testAPI = async () => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-your-key'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10
    })
  });
  console.log(await response.json());
};
```

#### AI-2: Event Tracking Setup

```bash
# 1. Clone và setup
git clone <repository-url>
cd chuck-king
git checkout develop
git checkout -b feature/ai-tracking-your-task
```

**Test event tracking:**

1. **Mở game và test triggers:**
   - Chết → Check `eventTracker.deathCount`
   - Idle > 12s → Check `eventTracker.idleTime`
   - Chết 3 lần cùng zone → Check `eventTracker.deathZones`

2. **Debug trong console:**
   ```javascript
   // Thêm vào EventTracker.js
   console.log('Event context:', this.getContext());
   ```

---

### Backend Team

#### BE-1: Server Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd chuck-king

# 2. Tạo backend folder
mkdir backend
cd backend

# 3. Initialize Node.js project
npm init -y

# 4. Install dependencies
npm install express cors dotenv

# 5. Tạo .env file
touch .env
```

**`.env` file:**
```env
PORT=3000
OPENAI_API_KEY=sk-your-key-here
NODE_ENV=development
```

**`backend/server.js` (basic setup):**
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Chạy server:**
```bash
node server.js
# Hoặc với nodemon (auto-reload)
npm install -g nodemon
nodemon server.js
```

#### BE-2: API Endpoints Setup

**Tạo `backend/routes/ai.js`:**
```javascript
const express = require('express');
const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { triggerType, context } = req.body;
    
    // Validate input
    if (!triggerType || !context) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing triggerType or context',
        code: 'INVALID_INPUT'
      });
    }
    
    // TODO: Call OpenAI API
    // TODO: Return message
    
    res.json({
      status: 'success',
      message: 'Mock message',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
```

**Test với Thunder Client:**
1. Cài extension "Thunder Client" trong VS Code
2. Tạo request:
   - Method: POST
   - URL: `http://localhost:3000/api/ai/generate`
   - Body (JSON):
     ```json
     {
       "triggerType": "death",
       "context": {
         "deathCount": 5,
         "idleTime": 0,
         "lastDeathZone": "mid",
         "deathZones": {"top": 1, "mid": 3, "bottom": 1}
       }
     }
     ```

---

## 🔧 Common Issues & Solutions

### Issue 1: CORS Error

**Problem:** Frontend không gọi được backend API

**Solution:**
```javascript
// backend/server.js
app.use(cors({
  origin: 'http://localhost:5500', // Frontend URL
  credentials: true
}));
```

### Issue 2: Module not found

**Problem:** `Cannot find module`

**Solution:**
```bash
# Check import paths
# Frontend: Use relative paths
import { GameEngine } from './engine/GameEngine.js';

# Backend: Check node_modules
npm install
```

### Issue 3: API key exposed

**Problem:** API key bị commit lên Git

**Solution:**
```bash
# 1. Remove từ Git history (nếu đã commit)
git rm --cached js/config.js

# 2. Add vào .gitignore
echo "js/config.js" >> .gitignore

# 3. Tạo config.example.js
cp js/config.js js/config.example.js
# Remove API key từ example file
```

### Issue 4: Port already in use

**Problem:** `Port 3000 is already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

---

## ✅ Checklist Setup

### Frontend Team:
- [ ] Git installed và configured
- [ ] VS Code installed với extensions
- [ ] Repository cloned
- [ ] Feature branch created
- [ ] Game chạy được trên localhost
- [ ] Browser DevTools mở được

### Game Engine Team:
- [ ] Git setup
- [ ] VS Code với extensions
- [ ] Repository cloned
- [ ] Game chạy được
- [ ] Console không có errors
- [ ] FPS đạt 60

### AI System Team:
- [ ] Git setup
- [ ] VS Code với extensions
- [ ] Repository cloned
- [ ] API key có sẵn (AI-1)
- [ ] Config file setup (KHÔNG commit)
- [ ] Test API calls thành công

### Backend Team:
- [ ] Node.js installed (v18+)
- [ ] Git setup
- [ ] VS Code với Thunder Client
- [ ] Repository cloned
- [ ] Backend folder created
- [ ] Dependencies installed
- [ ] Server chạy được
- [ ] Health endpoint test OK

---

## 📚 Resources

- **Git Tutorial:** [Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials)
- **VS Code:** [VS Code Docs](https://code.visualstudio.com/docs)
- **Express.js:** [Express Guide](https://expressjs.com/en/guide/routing.html)
- **OpenAI API:** [OpenAI Docs](https://platform.openai.com/docs)

---

**Last Updated**: 2024-01-15
**Maintained by**: All Teams

