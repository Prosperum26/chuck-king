# 📚 Documentation Index - Chuck King

> **Tài liệu hướng dẫn cho team 9 người**

---

## 🚀 Bắt đầu nhanh

### Cho người mới:

1. **Đọc trước:**
   - [Team Division](./TEAM_DIVISION.md) - Cách chia 3 subteam & nhiệm vụ
   - [Setup Guide](./SETUP_GUIDE.md) - Setup môi trường
   - [Project Structure](./PROJECT_STRUCTURE.md) - Hiểu cấu trúc project
   - [Git Workflow](./GIT_WORKFLOW.md) - Cách dùng Git

2. **Khi bắt đầu code:**
   - [API Contract](./API_CONTRACT.md) - Interface giữa game (frontend) và API (AI/Firebase)
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
Định nghĩa interface giữa game (frontend) và các API ngoài (AI endpoint, Firebase API).

**Nội dung:**
- API endpoints
- Request/Response format
- Error handling
- Testing examples

**Dành cho:** Subteam 3 (Backend & API), và bất kỳ ai gọi API (Subteam 1/2 khi cần)

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
- Setup cho Subteam 1 (Game Dev & AI-)
- Setup cho Subteam 2 (UI/UX & Assets)
- Setup cho Subteam 3 (Backend & API: Firebase/AI)
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

### Subteam 1 — Game Dev & AI- (Hưng, Bình, Tiến)

**Files:**
- `js/engine/GameEngine.js`
- `js/entities/Player.js`, `js/entities/Platform.js`
- `js/systems/EventTracker.js`, `js/systems/AIRuleEngine.js`
- (shared) `js/main.js`

**Docs cần đọc:**
- [Team Division](./TEAM_DIVISION.md#-subteam-1--game-dev--ai--core-gameplay--ai-logic--sfx)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Testing Guide](./TESTING_GUIDE.md)

---

### Subteam 2 — Frontend (UI/UX) & Assets (Quỳnh, Huyền, Minh)

**Files:**
- `index.html` (menu), `game.html` (game)
- `styles/main.css`, `styles/menu.css`
- `js/ui/UIManager.js`
- (shared) `js/main.js`

**Docs cần đọc:**
- [Team Division](./TEAM_DIVISION.md#-subteam-2--frontend-uiux--game-assets)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Testing Guide](./TESTING_GUIDE.md)

---

### Subteam 3 — Backend & API (AI + Firebase) (Hưng, Thắng, Ân)

**Files:**
- `docs/API_CONTRACT.md`
- `js/config.example.js`, `js/config.default.js`, `js/config.js` (KHÔNG commit)
- (shared split) `js/systems/AIMessageGenerator.js` (phần gọi API)

**Docs cần đọc:**
- [Team Division](./TEAM_DIVISION.md#-subteam-3--backend--api-ai--firebase-database)
- [API Contract](./API_CONTRACT.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)

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

### 2026-02-03
- Reworked team structure into 3 subteams (Game Dev & AI-, UI/UX & Assets, Backend & API)
- Updated docs references to remove `backend/` folder (static hosting + external APIs)

---

## 💬 Questions?

Nếu có câu hỏi:
1. Check documentation trước
2. Hỏi trong team chat
3. Escalate nếu cần

---

**Last Updated**: 2026-02-03  
**Maintained by**: All Subteams

