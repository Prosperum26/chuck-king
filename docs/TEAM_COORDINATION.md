# 👥 Team Coordination Guide - Chuck King

> **Hướng dẫn phối hợp giữa các team**

---

## 📞 Communication Channels

### Daily Standup (15 phút mỗi ngày)

**Thời gian:** 9:00 AM hoặc đầu giờ làm việc

**Format:**
1. **Đã làm gì hôm qua?** (What did you do?)
2. **Hôm nay làm gì?** (What will you do today?)
3. **Có block gì không?** (Any blockers?)

**Ví dụ:**
```
FE-1: Hôm qua làm mute button UI, hôm nay làm stats display, không có block
BE-2: Hôm qua implement /api/ai/generate, hôm nay test với OpenAI API, cần API key từ AI-1
```

---

## 🔔 Notification Rules

### Khi nào cần thông báo:

1. **API Changes:**
   ```
   ⚠️ BREAKING: Đã thay đổi API format
   - Endpoint: POST /api/ai/generate
   - Change: Thêm field "playerId" vào request
   - Action: Frontend cần update API call
   ```

2. **Breaking Changes:**
   ```
   ⚠️ BREAKING: Đã thay đổi GameEngine API
   - File: js/engine/GameEngine.js
   - Change: Method update() giờ nhận thêm parameter
   - Action: Tất cả code gọi update() cần update
   ```

3. **Merge vào develop:**
   ```
   ✅ Merged: feature/frontend-ui-mute-button vào develop
   - Changes: Thêm mute button UI
   - Test: Đã test local, cần integration test
   ```

4. **Blockers:**
   ```
   🚫 BLOCKED: Cần API endpoint từ backend team
   - Issue: Frontend không thể test API integration
   - Need: Backend team cần implement /api/ai/generate trước
   ```

---

## 🤝 Cross-Team Dependencies

### Frontend ↔ Backend

**Frontend cần từ Backend:**
- API endpoints theo contract
- CORS configuration
- Error response format

**Backend cần từ Frontend:**
- Request format validation
- Test cases từ frontend
- Performance requirements

**Communication:**
- Sync API contract trước khi code
- Test integration mỗi ngày
- Thông báo ngay khi có thay đổi API

---

### Game Engine ↔ AI System

**AI System cần từ Game Engine:**
- Player death events
- Player position (để tính zone)
- Input events (để tính idle)

**Game Engine cần từ AI System:**
- Event tracking không ảnh hưởng performance
- AI system không block game loop

**Communication:**
- Define event interface trước
- Test event flow cùng nhau

---

### Frontend ↔ Game Engine

**Frontend cần từ Game Engine:**
- Game state để hiển thị UI
- Events để trigger UI updates

**Game Engine cần từ Frontend:**
- Canvas setup
- Input handling (có thể)

**Communication:**
- Define interface giữa UI và game
- Test UI updates với game events

---

## 📋 Integration Points

### 1. API Integration (FE-3 + BE-2 + AI-1)

**Flow:**
```
Game Event → EventTracker → AIRuleEngine → AIMessageGenerator → API Call → Backend → Response → UI
```

**Coordination:**
- FE-3: Implement API call trong AIMessageGenerator
- BE-2: Implement endpoint theo contract
- AI-1: Test integration end-to-end

**Checklist:**
- [ ] API contract đã được định nghĩa
- [ ] Backend endpoint đã implement
- [ ] Frontend API call đã implement
- [ ] Error handling đã test
- [ ] Fallback system hoạt động

---

### 2. Event Flow (GE-1 + AI-2)

**Flow:**
```
Player Action → GameEngine → EventTracker → AIRuleEngine
```

**Coordination:**
- GE-1: Emit events khi player chết/idle
- AI-2: Track events và build context

**Checklist:**
- [ ] Event interface đã định nghĩa
- [ ] Events được emit đúng lúc
- [ ] Events được track chính xác
- [ ] Context được build đúng

---

### 3. UI Updates (FE-1 + FE-3 + Game)

**Flow:**
```
Game State → UIManager → UI Elements
```

**Coordination:**
- Game: Update game state
- FE-3: Pass state to UIManager
- FE-1: Render UI elements

**Checklist:**
- [ ] UI state được update đúng
- [ ] UI không block game loop
- [ ] UI responsive và không lag

---

## 🚨 Conflict Resolution

### Khi có conflict:

1. **Code Conflict:**
   - Pull latest develop
   - Resolve conflicts locally
   - Test sau khi resolve
   - Commit với message: `[TEAM] Resolve conflict with [other-team]`

2. **Design Conflict:**
   - Discuss trong team chat
   - Nếu không đồng ý → Escalate to team lead
   - Document decision

3. **API Contract Conflict:**
   - Backend team quyết định (single source of truth)
   - Update API_CONTRACT.md
   - Frontend team update code

---

## 📅 Weekly Sync Meeting

**Thời gian:** Cuối tuần (Friday 5:00 PM)

**Agenda:**
1. Review progress tuần này
2. Demo features đã hoàn thành
3. Discuss blockers
4. Plan tuần sau
5. Integration testing

**Output:**
- Summary email/document
- Action items cho tuần sau
- Updated timeline

---

## 🎯 Definition of Done

### Feature được coi là "Done" khi:

1. **Code:**
   - [ ] Code đã được review (nếu có thể)
   - [ ] Code follow conventions
   - [ ] No console errors
   - [ ] No linter errors

2. **Testing:**
   - [ ] Unit tests pass (nếu có)
   - [ ] Manual testing pass
   - [ ] Integration test với related features

3. **Documentation:**
   - [ ] Code comments đầy đủ
   - [ ] API changes documented (nếu có)
   - [ ] Breaking changes documented

4. **Merge:**
   - [ ] Merged vào develop
   - [ ] No conflicts
   - [ ] Team notified

---

## 📊 Progress Tracking

### Daily Updates Template:

```markdown
## Daily Update - [Date]

### [Team Member Name]
**Branch:** feature/team-task
**Status:** ✅ In Progress / ✅ Done / 🚫 Blocked

**Completed:**
- Task 1
- Task 2

**In Progress:**
- Task 3

**Blockers:**
- Need X from Y team

**Next Steps:**
- Task 4
- Task 5
```

---

## 🔗 Useful Links

- **API Contract:** `docs/API_CONTRACT.md`
- **Project Structure:** `docs/PROJECT_STRUCTURE.md`
- **Git Workflow:** `docs/GIT_WORKFLOW.md`
- **Setup Guide:** `docs/SETUP_GUIDE.md`
- **Testing Guide:** `docs/TESTING_GUIDE.md`

---

## 💡 Tips for Beginners

1. **Đừng ngại hỏi:**
   - Nếu không hiểu → hỏi ngay
   - Better ask than assume

2. **Test thường xuyên:**
   - Test sau mỗi feature nhỏ
   - Đừng đợi đến cuối mới test

3. **Commit thường xuyên:**
   - Commit sau mỗi feature hoàn thành
   - Small commits > Large commits

4. **Communicate:**
   - Thông báo khi có thay đổi
   - Thông báo khi bị block
   - Thông báo khi hoàn thành

5. **Read documentation:**
   - Đọc API contract trước khi code
   - Đọc project structure để hiểu codebase
   - Đọc git workflow để tránh conflicts

---

**Last Updated**: 2024-01-15
**Maintained by**: All Teams

