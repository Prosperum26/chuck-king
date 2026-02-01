# 👥 Team Division - Chuck King

> **Tóm tắt cách chia team 9 người**

---

## 📊 Tổng quan

**Tổng số:** 9 người  
**Trình độ:** Cơ bản, lần đầu làm project với AI  
**Mục tiêu:** Chia team hợp lý để mỗi người có thể làm việc độc lập nhưng vẫn phối hợp tốt

---

## 🎯 Cách chia team

### 1. Frontend Team (3 người)

#### FE-1: UI/UX Manager
**Trách nhiệm:**
- Design và implement UI components
- CSS styling (`styles/main.css`)
- UI Manager logic (`js/ui/UIManager.js`)
- Responsive design

**Files quản lý:**
- `styles/main.css`
- `js/ui/UIManager.js`

**Kỹ năng cần:**
- HTML/CSS cơ bản
- UI/UX design sense
- JavaScript cơ bản

**Độ khó:** ⭐⭐ (Trung bình)

---

#### FE-2: Game Canvas & Rendering
**Trách nhiệm:**
- HTML structure (`index.html`)
- Canvas setup và initialization
- Basic rendering helpers

**Files quản lý:**
- `index.html` (structure)

**Kỹ năng cần:**
- HTML cơ bản
- Canvas API cơ bản
- Responsive design

**Độ khó:** ⭐⭐ (Trung bình)

---

#### FE-3: Frontend Integration
**Trách nhiệm:**
- Main entry point (`js/main.js`)
- Kết nối các modules
- API calls từ frontend
- Error handling

**Files quản lý:**
- `js/main.js`

**Kỹ năng cần:**
- JavaScript ES6 modules
- API calls (fetch)
- Error handling
- Hiểu flow của toàn bộ frontend

**Độ khó:** ⭐⭐⭐ (Khó hơn - cần hiểu tổng thể)

---

### 2. Game Engine Team (2 người)

#### GE-1: Game Loop & Physics
**Trách nhiệm:**
- Game loop (`js/engine/GameEngine.js`)
- Player physics (`js/entities/Player.js`)
- Input handling
- Performance optimization

**Files quản lý:**
- `js/engine/GameEngine.js`
- `js/entities/Player.js`

**Kỹ năng cần:**
- JavaScript
- Game loop concepts
- Physics cơ bản (velocity, gravity)
- Performance optimization

**Độ khó:** ⭐⭐⭐⭐ (Khó - core game logic)

---

#### GE-2: Entities & Platforms
**Trách nhiệm:**
- Platform entities (`js/entities/Platform.js`)
- Collision detection
- Thêm entities mới (nếu có)

**Files quản lý:**
- `js/entities/Platform.js`

**Kỹ năng cần:**
- JavaScript
- Collision detection cơ bản
- Geometry cơ bản

**Độ khó:** ⭐⭐⭐ (Trung bình-Khó)

---

### 3. AI System Team (2 người)

#### AI-1: AI Integration & API
**Trách nhiệm:**
- AI message generation (`js/systems/AIMessageGenerator.js`)
- API calls đến backend
- Fallback system
- API configuration

**Files quản lý:**
- `js/systems/AIMessageGenerator.js`
- `js/config.js` (KHÔNG commit)

**Kỹ năng cần:**
- JavaScript async/await
- API calls (fetch)
- Error handling
- Hiểu API contracts

**Độ khó:** ⭐⭐⭐ (Khó - cần phối hợp với backend)

---

#### AI-2: Event Tracking & Rules
**Trách nhiệm:**
- Event tracking (`js/systems/EventTracker.js`)
- AI trigger rules (`js/systems/AIRuleEngine.js`)
- Context building

**Files quản lý:**
- `js/systems/EventTracker.js`
- `js/systems/AIRuleEngine.js`

**Kỹ năng cần:**
- JavaScript
- Logic programming
- State management cơ bản

**Độ khó:** ⭐⭐⭐ (Trung bình-Khó)

---

### 4. Backend Team (2 người)

#### BE-1: API Server & Database
**Trách nhiệm:**
- Express server setup (`backend/server.js`)
- Database setup (nếu cần)
- CORS configuration
- Environment variables
- Server deployment

**Files quản lý:**
- `backend/server.js`
- `backend/models/`
- `backend/middleware/`
- `backend/config/`

**Kỹ năng cần:**
- Node.js cơ bản
- Express.js
- Environment variables
- CORS concepts

**Độ khó:** ⭐⭐⭐ (Khó - cần setup server)

---

#### BE-2: API Endpoints & Integration
**Trách nhiệm:**
- API endpoints (`backend/routes/ai.js`)
- Business logic (`backend/controllers/`)
- OpenAI API integration
- Request/response validation

**Files quản lý:**
- `backend/routes/ai.js`
- `backend/controllers/`

**Kỹ năng cần:**
- Node.js/Express
- API design
- Request validation
- Error handling
- OpenAI API (hoặc AI API khác)

**Độ khó:** ⭐⭐⭐⭐ (Khó - core backend logic)

---

## 🔗 Dependencies giữa các team

### Critical Dependencies:

1. **FE-3 ↔ BE-2**: API integration
   - FE-3 cần API endpoint từ BE-2
   - BE-2 cần test với frontend

2. **AI-1 ↔ BE-2**: API contract
   - AI-1 cần biết API format
   - BE-2 implement theo contract

3. **GE-1 ↔ AI-2**: Event flow
   - GE-1 emit events
   - AI-2 track events

4. **FE-3 ↔ All**: Integration point
   - FE-3 kết nối tất cả modules

### Non-Critical Dependencies:

- FE-1, FE-2 có thể làm độc lập
- GE-2 có thể làm sau GE-1
- BE-1 có thể setup server trước

---

## 📅 Timeline đề xuất

### Tuần 1: Setup & Planning

**Ngày 1-2:**
- Setup môi trường (tất cả team)
- Đọc documentation
- Hiểu codebase hiện tại

**Ngày 3-4:**
- Mỗi team bắt đầu làm feature riêng
- Define API contract (BE-2 + AI-1 + FE-3)

**Ngày 5:**
- Integration meeting
- Test kết nối FE-BE cơ bản

### Tuần 2: Development

**Ngày 6-10:**
- Mỗi team làm feature riêng
- Daily standup 15 phút
- Integration test mỗi ngày

**Cuối tuần:**
- Integration test toàn bộ
- Fix bugs
- Demo

---

## ⚠️ Lưu ý quan trọng

### 1. Communication là key
- Thông báo ngay khi có thay đổi API
- Thông báo khi bị block
- Daily standup bắt buộc

### 2. API Contract là single source of truth
- Mọi thay đổi API phải update contract
- Frontend và Backend phải sync

### 3. Test thường xuyên
- Test sau mỗi feature nhỏ
- Integration test mỗi ngày
- Đừng đợi đến cuối mới test

### 4. Git workflow
- Mỗi team làm trên branch riêng
- Merge vào develop sau khi test
- Không force push vào shared branches

### 5. Fallback system
- Frontend phải có fallback khi API fail
- Game phải chạy được không cần backend
- AI phải có hardcoded messages

---

## 🎯 Success Criteria

### Mỗi team hoàn thành khi:

**Frontend:**
- [ ] UI hoàn chỉnh, không có lỗi
- [ ] API integration hoạt động
- [ ] Fallback system hoạt động

**Game Engine:**
- [ ] Game chạy mượt (60 FPS)
- [ ] Physics hoạt động đúng
- [ ] Events được emit đúng

**AI System:**
- [ ] Event tracking chính xác
- [ ] AI triggers hoạt động
- [ ] API integration hoạt động
- [ ] Fallback hoạt động

**Backend:**
- [ ] Server chạy ổn định
- [ ] API endpoints đúng contract
- [ ] Error handling đầy đủ
- [ ] CORS configured đúng

### Integration hoàn thành khi:

- [ ] FE + BE integration test pass
- [ ] Toàn bộ flow hoạt động: Game → Event → AI → API → Response
- [ ] Không có breaking changes
- [ ] Code chạy được trên production

---

## 📚 Tài liệu liên quan

- [Project Structure](./PROJECT_STRUCTURE.md) - Chi tiết files và responsibilities
- [Team Coordination](./TEAM_COORDINATION.md) - Cách phối hợp
- [API Contract](./API_CONTRACT.md) - Interface FE-BE
- [Git Workflow](./GIT_WORKFLOW.md) - Cách dùng Git
- [Setup Guide](./SETUP_GUIDE.md) - Setup môi trường

---

**Last Updated**: 2024-01-15
**Maintained by**: All Teams

