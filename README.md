# 👑 Chuck King – AI Rage Platformer

<p align="center">
  <img src="assets/icon.png" width="120" alt="Chuck King Logo"/>
</p>

<p align="center">
  <b>2D Vertical Rage Platformer with AI Taunting System</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Engine-Canvas%202D-blue.svg" />
  <img src="https://img.shields.io/badge/Language-JavaScript-yellow.svg" />
  <img src="https://img.shields.io/badge/Architecture-Modular-green.svg" />
  <img src="https://img.shields.io/badge/AI-Rule--Based%20%2B%20API-purple.svg" />
  <img src="https://img.shields.io/badge/Deployment-Static%20Hosting-orange.svg" />
  <img src="https://img.shields.io/github/last-commit/Prosperum26/chuck-king" />
</p>

---

## 🎮 About The Game

**Chuck King** là một web-based 2D vertical rage platformer, lấy cảm hứng từ *Jump King*.

Người chơi điều khiển nhân vật bằng cơ chế **charge jump**:
- Giữ phím để tích lực
- Thả để nhảy
- Rơi là... mất hết thành quả 😈

Điểm đặc biệt của game:

> 🤖 **AI Rage System** – hệ thống AI sẽ trêu chọc người chơi khi:
- Rơi quá nhiều lần
- Idle quá lâu
- Bị kẹt tại một khu vực

Game được xây dựng hoàn toàn bằng **Canvas 2D thuần JavaScript**, không sử dụng framework.

---

## 🚀 Live Demo

```
https://prosperum26.github.io/chuck-king/
```

---

## 🛠 Tech Stack

- **Rendering Engine:** HTML5 Canvas 2D
- **Language:** Vanilla JavaScript (ES6+)
- **Architecture:** Modular OOP
- **AI System:** 
  - Rule-based event engine
  - Optional external AI API (OpenAI-compatible)
- **Deployment:** Static hosting (GitHub Pages / Vercel / Netlify)

---

## ⚡ Quick Start

### 1️⃣ Run Directly (No AI API)

Mở file:

```
index.html
```

Hoặc vào thẳng:

```
game.html
```

---

### 2️⃣ Recommended: Run with Local Server

Game dùng `fetch()` để load JSON map nên nên chạy qua HTTP:

```bash
python -m http.server 8000
```

Hoặc:

```bash
npx http-server
```

Sau đó mở:

```
http://localhost:8000
```

---

### 3️⃣ Enable AI API (Optional)

Trong game có modal cấu hình:

- **Endpoint:** `https://api.openai.com/v1/chat/completions`
- **API Key:** key của bạn

Nếu không cấu hình → game tự fallback sang hardcoded messages.

---

## 🎮 Controls

| Action | Key |
|--------|------|
| Move Left | `Arrow Left` / `A` |
| Move Right | `Arrow Right` / `D` |
| Charge Jump | Hold `Space` / `Arrow Up` |
| Release Jump | Release key |
| Mute AI | Button góc phải dưới |

---

## 🧠 AI Rage System

### 🔍 Event Tracking

- `fallCount`
- `idleTime`
- `lastFallZone`
- `fallZones`
- `bounceCount`
- `stuckState`

### 🎯 Triggers

- Player falls off map
- Player idle too long
- Repeated fall in same zone
- Excessive retry loop

### 🧊 Cooldown System

AI có cooldown để tránh spam.

### 🗣 Message Sources

- Hardcoded taunts
- External AI API (optional)

---

## 🏗 Architecture Overview

```
js/
├── main.js
├── engine/
│   └── GameEngine.js
├── entities/
│   ├── Player.js
│   ├── Platform.js
│   └── HanChicken.js
├── systems/
│   ├── Camera.js
│   ├── EventTracker.js
│   ├── AIRuleEngine.js
│   ├── AIMessageGenerator.js
│   ├── NPCDialogSystem.js
│   ├── SoundManager.js
│   └── APIKeyManager.js
└── ui/
    └── UIManager.js
```

### 🧩 Design Philosophy

- Separation of concerns
- Event-driven AI trigger
- Modular system architecture
- Easily extendable platform types
- AI fallback mechanism

---

## 🎨 Features

- Vertical map (4320px height)
- Multiple platform types:
  - Normal
  - Ice
  - Bouncy
  - Moving
  - Broken
  - Slope
- Enemy / NPC interaction
- Camera tracking
- Sound system
- HUD system
- AI taunting dialogue
- API configuration UI

---

## 📂 Documentation

Chi tiết dev documentation nằm trong:

```
docs/
```

- `PROJECT_STRUCTURE.md`
- `API_CONTRACT.md`
- `SETUP_GUIDE.md`
- `TESTING_GUIDE.md`
- `GIT_WORKFLOW.md`

---

## 📦 Deployment

Có thể deploy lên:

- GitHub Pages
- Vercel
- Netlify
- Bất kỳ static hosting nào

Không cần backend server.

---

## 🗺 Roadmap

- [ ] Leaderboard
- [ ] Save progress system
- [ ] Difficulty modes
- [ ] Advanced AI personality modes
- [ ] Mobile touch control

---

## 📜 License

Free to use for educational and personal purposes.

---

## 🌌 Meet The Team

<div align="center">

### 👑 Chuck King Dev Squad 👑

**Quảng Phú Hưng**  
**Nguyễn Thị Ngọc Quỳnh**  
**Huỳnh Nhật Huyền**  
**Nguyễn Thanh Bình**  
**Mai Danh Tiến**  
**Bùi Tần Uy Minh**  
**Võ Văn Thiện**  
**Ngô Hồng Ân**  
**Trần Hữu Thắng**

⚡ United by challenge. Driven by chaos. ⚡

</div>

---
<p align="center">
  Made with rage and JavaScript 🔥
</p>
