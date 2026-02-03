# 🚀 Setup Guide - Chuck King

> **Hướng dẫn setup môi trường theo 3 subteam (static frontend + backend qua Firebase/API)**

---

## 📋 Prerequisites

### Tất cả team cần:

- **Git** - [Download](https://git-scm.com/downloads)
- **VS Code** - [Download](https://code.visualstudio.com/)
- **Browser** - Chrome/Firefox/Edge (latest version)
- **Node.js** (chỉ cần cho Subteam 3 khi làm Firebase/Functions) - [Download](https://nodejs.org/) (v18+)

### VS Code Extensions (khuyến nghị):

- **GitLens** - Git visualization
- **Thunder Client** - API testing (cho Subteam 3)
- **Live Server** - Local development server
- **Prettier** - Code formatting
- **ES6 String HTML** - Syntax highlighting

---

## 🎯 Setup theo subteam

### Setup chung (ai cũng cần)

#### Setup cơ bản

```bash
# 1. Clone repository
git clone <repository-url>
cd chuck-king

# 2. Checkout develop branch
git checkout develop

# 3. Tạo feature branch
git checkout -b feature/<subteam>-<your-task>

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

### Subteam 1 — Game Dev & AI- (Hưng, Bình, Tiến)

#### Setup

```bash
# 1. Clone và checkout branch
git clone <repository-url>
cd chuck-king
git checkout develop
git checkout -b feature/subteam1-your-task

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

### Subteam 2 — UI/UX & Assets (Quỳnh, Huyền, Minh)

#### Mục tiêu setup
- Chạy game local bằng Live Server, đảm bảo UI không lag.
- Làm việc chủ yếu ở `index.html`, `styles/main.css`, `js/ui/UIManager.js`.

#### Tips nhanh
- Nếu UI không update đúng: mở DevTools (F12) → Console để xem event `aiMessage` và state HUD.
- Ưu tiên animation nhẹ (fade/slide), tránh DOM update liên tục mỗi frame.

---

### Subteam 3 — Backend & API (AI + Firebase) (Hưng, Thắng, Ân)

> Frontend host GitHub Pages nên **không** nhét OpenAI key vào `js/`.  
> Subteam 3 triển khai AI endpoint + Firebase DB và cung cấp `<AI_ENDPOINT>` cho team test.

#### Firebase CLI + Project

```bash
# 1) Cài Firebase CLI
npm i -g firebase-tools

# 2) Login
firebase login

# 3) Init (trong thư mục repo) - chọn Functions (và Firestore nếu cần)
firebase init
```

#### API endpoint cho AI

- Implement endpoint theo `docs/API_CONTRACT.md` (POST `<AI_ENDPOINT>`).
- Khi deploy/emulate xong, báo cho team:
  - URL endpoint
  - CORS policy (allow `http://localhost:5500` + GitHub Pages origin)
  - Schema context/triggerType version

#### Cấu hình endpoint ở frontend (để team test)

- Tạo `js/config.js` (file này nằm trong `.gitignore`):

```js
export const API_CONFIG = {
  endpoint: "<AI_ENDPOINT>",
  apiKey: null,
  model: null
};
```

## 🔧 Common Issues & Solutions

### Issue 1: CORS Error

**Problem:** Frontend (GitHub Pages / localhost) không gọi được API endpoint

**Solution:**
- Backend (Firebase Function/Cloud Run/...) phải allow origin:
  - `http://localhost:5500` (Live Server)
  - GitHub Pages origin của repo
- Nếu dùng Firebase HTTP Function: bật CORS đúng cách hoặc dùng callable function + Firebase SDK.

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

---

## ✅ Checklist Setup

### Setup chung:
- [ ] Git installed và configured
- [ ] VS Code installed với extensions
- [ ] Repository cloned
- [ ] Feature branch created
- [ ] Game chạy được trên localhost
- [ ] Browser DevTools mở được

### Subteam 1 (Game Dev & AI-):
- [ ] Gameplay chạy ổn, không tụt FPS
- [ ] Physics/collision test pass

### Subteam 2 (UI/UX & Assets):
- [ ] HUD/menu/settings render đúng
- [ ] UI animations không làm lag

### Subteam 3 (Backend & API):
- [ ] Node.js installed (v18+)
- [ ] Firebase CLI login OK
- [ ] Có `<AI_ENDPOINT>` (deployed hoặc emulator)
- [ ] Update `API_CONTRACT.md` khi đổi schema

---

## 📚 Resources

- **Git Tutorial:** [Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials)
- **VS Code:** [VS Code Docs](https://code.visualstudio.com/docs)
- **Firebase Docs:** [Firebase Documentation](https://firebase.google.com/docs)
- **OpenAI API:** [OpenAI Docs](https://platform.openai.com/docs)

---

**Last Updated**: 2026-02-03  
**Maintained by**: All Subteams

