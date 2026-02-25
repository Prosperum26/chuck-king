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
Subteam 2: Hôm qua làm HUD (timer/height), hôm nay làm menu + settings, không có block
Subteam 3: Hôm qua draft API contract cho AI endpoint, hôm nay POC Firebase Function, cần schema context từ Subteam 1
```

---

## 🔔 Notification Rules

### Khi nào cần thông báo:

1. **API Changes:**
   ```
   ⚠️ BREAKING: Đã thay đổi API format
   - Endpoint: POST <AI_ENDPOINT>
   - Change: Thêm field "deathStreak" vào context
   - Action: Subteam 1 update context emit, Subteam 3 update backend parse/prompt
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
   🚫 BLOCKED: Cần endpoint (Firebase Function) từ Subteam 3
   - Issue: Không thể test AI API integration
   - Need: Subteam 3 deploy hoặc bật emulator + cung cấp <AI_ENDPOINT>
   ```

---

## 🤝 Cross-Team Dependencies

### Subteam 1 ↔ Subteam 2 (Gameplay ↔ UI/UX)

**Subteam 2 cần từ Subteam 1:**
- Game state/events để render HUD (death, timer, height, best height, death streak…)
- Event cadence (tần suất emit) để tránh UI update quá dày

**Subteam 1 cần từ Subteam 2:**
- UI flow (menu/settings) để expose gameplay toggles (shake on/off, mute…)
- Assets/feedback spec (khi nào shake/flash/particle)

**Communication:**
- Chốt event names + payload trước khi code sâu
- Test UI updates với gameplay events mỗi ngày
- Thông báo ngay khi đổi UI ids/DOM structure (ảnh hưởng `UIManager`)

---

### Subteam 1 ↔ Subteam 3 (AI context ↔ API)

**Subteam 3 cần từ Subteam 1:**
- Context schema: deathCount, idleTime, deathStreak, highestHeight, fall-from-high, …
- Trigger policy: khi nào gọi API vs khi nào dùng rule-based/hardcoded

**Subteam 1 cần từ Subteam 3:**
- `<AI_ENDPOINT>` ổn định (deployed hoặc emulator)
- Response/error format chuẩn để UI không bị crash

**Communication:**
- `API_CONTRACT.md` là single source of truth
- Thông báo ngay khi có breaking change (context/triggerType)

---

### Subteam 2 ↔ Subteam 3 (Settings/Stats ↔ Firebase API)

**Subteam 2 cần từ Subteam 3:**
- API/SDK để load/save settings + stats (optional)
- Quy ước “guest user” (anonymous) hay không cần login

**Subteam 3 cần từ Subteam 2:**
- UX requirement: cần lưu gì, hiển thị gì (best height, total deaths…)
- Tần suất ghi (để tránh spam writes)

**Communication:**
- Chốt data model + security rules trước khi code
- Test trên GitHub Pages origin để check CORS

---

## 📋 Integration Points

### 1. Gameplay → UI (Subteam 1 + Subteam 2)

**Flow:**
```
Game loop/state → UIManager → HUD/Menu/Settings
```

**Coordination:**
- Subteam 1: expose state/events (death, time, height, streak…)
- Subteam 2: render UI, animation, feedback (shake/flash/particles)

**Checklist:**
- [ ] HUD hiển thị đúng state
- [ ] UI không làm tụt FPS
- [ ] Menu/settings không phá gameplay loop

---

### 2. Event Flow (Subteam 1 internal)

**Flow:**
```
Player Action → GameEngine → EventTracker → AIRuleEngine → AIMessageGenerator → UI
```

**Coordination:**
- Subteam 1: đảm bảo tracking đúng + cooldown không spam
- Subteam 2: UI nhận event `aiMessage` ổn định

**Checklist:**
- [ ] Event interface đã định nghĩa
- [ ] Events được emit đúng lúc
- [ ] Events được track chính xác
- [ ] Context được build đúng

---

### 3. AI API Integration (Subteam 1 + Subteam 3) — Giai đoạn sau

**Flow:**
```
Game Event → EventTracker → AIRuleEngine → AIMessageGenerator → (fetch) <AI_ENDPOINT> → Response → UI
```

**Coordination:**
- Subteam 1: build context + call generator
- Subteam 3: implement endpoint + prompt + rate limit + return message

**Checklist:**
- [ ] `API_CONTRACT.md` đúng với backend
- [ ] CORS OK (GitHub Pages origin)
- [ ] Error handling + fallback OK
- [ ] Không lộ secrets trong frontend

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
   - Subteam 3 quyết định (single source of truth)
   - Update API_CONTRACT.md
   - Các subteam khác update code cùng lúc

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

**Last Updated**: 2026-02-03  
**Maintained by**: All Subteams

