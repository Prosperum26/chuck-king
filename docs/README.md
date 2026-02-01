# 📚 Documentation Index - Chuck King

> **Tài liệu hướng dẫn cho team 9 người**

---

## 🚀 Bắt đầu nhanh

### Cho người mới:

1. **Đọc trước:**
   - [Team Division](./TEAM_DIVISION.md) - Cách chia team 9 người
   - [Setup Guide](./SETUP_GUIDE.md) - Setup môi trường
   - [Project Structure](./PROJECT_STRUCTURE.md) - Hiểu cấu trúc project
   - [Git Workflow](./GIT_WORKFLOW.md) - Cách dùng Git

2. **Khi bắt đầu code:**
   - [API Contract](./API_CONTRACT.md) - Interface giữa FE và BE
   - [Testing Guide](./TESTING_GUIDE.md) - Cách test code

3. **Khi làm việc nhóm:**
   - [Team Coordination](./TEAM_COORDINATION.md) - Cách phối hợp

---

## 📖 Tài liệu đầy đủ

### 0. [Team Division](./TEAM_DIVISION.md)
Tóm tắt cách chia team 9 người, trách nhiệm từng người, và dependencies.

**Dành cho:** Tất cả team members (đọc đầu tiên)

---

### 1. [API Contract](./API_CONTRACT.md)
Định nghĩa interface giữa Frontend và Backend.

**Nội dung:**
- API endpoints
- Request/Response format
- Error handling
- Testing examples

**Dành cho:** Backend Team (BE-1, BE-2), Frontend Integration (FE-3), AI Integration (AI-1)

---

### 2. [Project Structure](./PROJECT_STRUCTURE.md)
Cấu trúc thư mục và trách nhiệm của từng team.

**Nội dung:**
- File structure
- Team responsibilities
- File ownership rules
- Naming conventions

**Dành cho:** Tất cả team members

---

### 3. [Git Workflow](./GIT_WORKFLOW.md)
Hướng dẫn sử dụng Git cho team.

**Nội dung:**
- Branching strategy
- Commit message format
- Merge workflow
- Conflict resolution

**Dành cho:** Tất cả team members

---

### 4. [Setup Guide](./SETUP_GUIDE.md)
Hướng dẫn setup môi trường cho từng team.

**Nội dung:**
- Prerequisites
- Setup cho Frontend team
- Setup cho Game Engine team
- Setup cho AI System team
- Setup cho Backend team
- Common issues & solutions

**Dành cho:** Tất cả team members (đọc phần của team mình)

---

### 5. [Testing Guide](./TESTING_GUIDE.md)
Hướng dẫn test cho từng team và integration testing.

**Nội dung:**
- Testing strategy
- Test cases cho từng team
- Integration testing
- Debugging tips
- Pre-merge checklist

**Dành cho:** Tất cả team members

---

### 6. [Team Coordination](./TEAM_COORDINATION.md)
Hướng dẫn phối hợp giữa các team.

**Nội dung:**
- Communication channels
- Notification rules
- Cross-team dependencies
- Integration points
- Conflict resolution

**Dành cho:** Tất cả team members

---

## 👥 Team Quick Reference

### Frontend Team (3 người)

**Files:**
- `index.html`, `styles/main.css`, `js/ui/UIManager.js` (FE-1)
- `index.html`, Canvas setup (FE-2)
- `js/main.js`, Integration (FE-3)

**Docs cần đọc:**
- [Setup Guide - Frontend](./SETUP_GUIDE.md#frontend-team)
- [Testing Guide - Frontend](./TESTING_GUIDE.md#frontend-team)
- [API Contract](./API_CONTRACT.md) (FE-3)

---

### Game Engine Team (2 người)

**Files:**
- `js/engine/GameEngine.js`, `js/entities/Player.js` (GE-1)
- `js/entities/Platform.js` (GE-2)

**Docs cần đọc:**
- [Setup Guide - Game Engine](./SETUP_GUIDE.md#game-engine-team)
- [Testing Guide - Game Engine](./TESTING_GUIDE.md#game-engine-team)
- [Project Structure](./PROJECT_STRUCTURE.md#game-engine-team)

---

### AI System Team (2 người)

**Files:**
- `js/systems/AIMessageGenerator.js`, `js/config.js` (AI-1)
- `js/systems/EventTracker.js`, `js/systems/AIRuleEngine.js` (AI-2)

**Docs cần đọc:**
- [Setup Guide - AI System](./SETUP_GUIDE.md#ai-system-team)
- [Testing Guide - AI System](./TESTING_GUIDE.md#ai-system-team)
- [API Contract](./API_CONTRACT.md) (AI-1)

---

### Backend Team (2 người)

**Files:**
- `backend/server.js`, `backend/models/`, `backend/config/` (BE-1)
- `backend/routes/ai.js`, `backend/controllers/` (BE-2)

**Docs cần đọc:**
- [Setup Guide - Backend](./SETUP_GUIDE.md#backend-team)
- [Testing Guide - Backend](./TESTING_GUIDE.md#backend-team)
- [API Contract](./API_CONTRACT.md) (quan trọng!)

---

## 🎯 Workflow Checklist

### Ngày đầu tiên:

- [ ] Đọc [Setup Guide](./SETUP_GUIDE.md)
- [ ] Setup môi trường theo hướng dẫn
- [ ] Clone repository và checkout develop
- [ ] Tạo feature branch
- [ ] Đọc [Project Structure](./PROJECT_STRUCTURE.md) để hiểu codebase
- [ ] Đọc phần của team mình trong [Testing Guide](./TESTING_GUIDE.md)

### Trước khi code:

- [ ] Đọc [API Contract](./API_CONTRACT.md) (nếu làm FE/BE/AI integration)
- [ ] Đọc [Git Workflow](./GIT_WORKFLOW.md)
- [ ] Đọc [Team Coordination](./TEAM_COORDINATION.md)
- [ ] Sync với team về dependencies

### Trước khi merge:

- [ ] Test code theo [Testing Guide](./TESTING_GUIDE.md)
- [ ] Check [Pre-merge Checklist](./TESTING_GUIDE.md#pre-merge-checklist)
- [ ] Follow [Git Workflow](./GIT_WORKFLOW.md)
- [ ] Thông báo team nếu có breaking changes

---

## 🔍 Tìm kiếm nhanh

### "Làm sao để..."
- **Setup môi trường?** → [Setup Guide](./SETUP_GUIDE.md)
- **Commit code?** → [Git Workflow](./GIT_WORKFLOW.md)
- **Test code?** → [Testing Guide](./TESTING_GUIDE.md)
- **Gọi API?** → [API Contract](./API_CONTRACT.md)
- **Phối hợp với team?** → [Team Coordination](./TEAM_COORDINATION.md)
- **Hiểu cấu trúc project?** → [Project Structure](./PROJECT_STRUCTURE.md)

### "Lỗi gì đó..."
- **CORS error?** → [Setup Guide - Common Issues](./SETUP_GUIDE.md#common-issues--solutions)
- **Merge conflict?** → [Git Workflow - Conflict Resolution](./GIT_WORKFLOW.md#xử-lý-merge-conflicts)
- **API không hoạt động?** → [Testing Guide - Integration Testing](./TESTING_GUIDE.md#integration-testing)

---

## 📝 Changelog

### 2024-01-15
- Initial documentation created
- API Contract defined
- Project Structure documented
- Git Workflow established
- Setup guides for all teams
- Testing guides for all teams
- Team coordination guide

---

## 💬 Questions?

Nếu có câu hỏi:
1. Check documentation trước
2. Hỏi trong team chat
3. Escalate nếu cần

---

**Last Updated**: 2024-01-15
**Maintained by**: All Teams

