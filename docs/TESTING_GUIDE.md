# 🧪 Testing Guide - Chuck King

> **Hướng dẫn test cho từng team và integration testing**

---

## 🎯 Testing Strategy

### Testing Levels:

1. **Unit Testing** - Test từng function/module riêng lẻ
2. **Integration Testing** - Test kết nối giữa các modules
3. **End-to-End Testing** - Test toàn bộ flow từ đầu đến cuối

---

## 👥 Testing theo subteam (3 subteam)

### Subteam 2 — UI/UX & Assets

#### UI/UX Testing

**Test Cases:**

1. **Mute Button:**
   - [ ] Click mute button → AI không nói nữa
   - [ ] Click unmute → AI hoạt động lại
   - [ ] Button text thay đổi đúng (Mute/Unmute)
   - [ ] Button có visual feedback khi click

2. **Stats Display:**
   - [ ] Death count hiển thị đúng
   - [ ] Idle time update mỗi giây
   - [ ] Stats không bị overlap với game canvas

3. **AI Dialog:**
   - [ ] Dialog hiển thị khi AI nói
   - [ ] Dialog tự ẩn sau 3 giây
   - [ ] Dialog không che game canvas
   - [ ] Text readable, không bị cắt

4. **Responsive Design:**
   - [ ] Test trên desktop (1920x1080)
   - [ ] Test trên laptop (1366x768)
   - [ ] Test trên mobile (375x667) - nếu có

**Manual Testing:**

```javascript
// Test trong browser console
// 1. Test mute button
document.getElementById('mute-ai-btn').click();
// Check: Button text thay đổi

// 2. Test stats update
// Chơi game và check stats hiển thị đúng
```

---

#### Canvas & Rendering Testing

**Test Cases:**

1. **Canvas Setup:**
   - [ ] Canvas có đúng size (400x600)
   - [ ] Canvas responsive trên các màn hình
   - [ ] Canvas không bị blur/pixelated

2. **Rendering:**
   - [ ] Game render mượt (60 FPS)
   - [ ] Không có flickering
   - [ ] Colors hiển thị đúng

**Performance Testing:**

```javascript
// Test FPS trong console
let lastTime = performance.now();
let frameCount = 0;

function checkFPS() {
  frameCount++;
  const currentTime = performance.now();
  if (currentTime >= lastTime + 1000) {
    console.log('FPS:', frameCount);
    frameCount = 0;
    lastTime = currentTime;
  }
  requestAnimationFrame(checkFPS);
}
checkFPS();
```

---

#### Integration Testing (shared: Subteam 1/2/3)

**Test Cases:**

1. **Module Integration:**
   - [ ] Tất cả modules import đúng
   - [ ] Game khởi tạo không có errors
   - [ ] Events được pass đúng giữa modules

2. **API Integration:**
   - [ ] API calls được gửi đúng format
   - [ ] Error handling hoạt động
   - [ ] Fallback về hardcoded khi API fail

**Test với Mock API:**

```javascript
// Tạo mock API response
const mockResponse = {
  status: 'success',
  message: 'Test message'
};

// Test trong AIMessageGenerator.js
// Thay thế fetch() với mock
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  if (url.includes('/api/ai/generate')) {
    return {
      ok: true,
      json: async () => mockResponse
    };
  }
  return originalFetch(url, options);
};
```

---

### Subteam 1 — Game Dev & AI-

#### Game Loop & Physics Testing

**Test Cases:**

1. **Game Loop:**
   - [ ] Game loop chạy liên tục
   - [ ] Update và render được gọi đúng thứ tự
   - [ ] Delta time tính đúng

2. **Player Physics:**
   - [ ] Jump hoạt động đúng
   - [ ] Gravity áp dụng đúng
   - [ ] Velocity không tăng vô hạn
   - [ ] Player không đi xuyên qua platforms

3. **Collision Detection:**
   - [ ] Player đứng trên platform
   - [ ] Player không rơi xuyên platform
   - [ ] Collision chính xác ở edges

**Manual Testing:**

```javascript
// Test trong console
// 1. Check player position
console.log('Player:', player.x, player.y);

// 2. Check velocity
console.log('Velocity:', player.vx, player.vy);

// 3. Force jump để test
player.vy = -10;
```

**Edge Cases:**
- [ ] Player ở góc platform
- [ ] Player jump từ edge
- [ ] Player rơi từ trên cao
- [ ] Multiple platforms gần nhau

---

#### Entities Testing

**Test Cases:**

1. **Platform Creation:**
   - [ ] Platforms được tạo đúng vị trí
   - [ ] Platforms có đúng size
   - [ ] Platforms render đúng

2. **Collision với Platforms:**
   - [ ] Player collide với tất cả platforms
   - [ ] Collision detection chính xác
   - [ ] Multiple platforms hoạt động đúng

**Test với nhiều platforms:**

```javascript
// Thêm platforms trong main.js
const platforms = [
  new Platform(50, 500, 300, 20),
  new Platform(100, 350, 200, 20),
  new Platform(150, 200, 150, 20),
  new Platform(200, 100, 100, 20), // Thêm platform mới
];
```

---

### AI Testing

#### (Subteam 3) AI API Integration Testing

**Test Cases:**

1. **API Calls (server-side endpoint):**
   - [ ] API request format đúng
   - [ ] Auth headers (nếu có) đúng (KHÔNG để secret key trong frontend)
   - [ ] Response được parse đúng
   - [ ] Error handling hoạt động

2. **Fallback System:**
   - [ ] Fallback về hardcoded khi API fail
   - [ ] Game vẫn chạy khi API down
   - [ ] Error messages không hiển thị cho user

**Test Scenarios:**

```javascript
// Test 1: API success
// Gọi API và check response

// Test 2: API fail (network error)
// Disconnect internet và test

// Test 3: API fail (invalid response)
// Mock invalid response format

// Test 4: API timeout
// Mock slow response (>5s)
```

**Test với Postman/Thunder Client:**

1. Test backend API trực tiếp
2. Check response format
3. Test error cases (400, 500, 503)

---

#### (Subteam 1) Event Tracking & Rule-based AI Testing

**Test Cases:**

1. **Death Tracking:**
   - [ ] Death count tăng khi player chết
   - [ ] Last death zone được ghi đúng
   - [ ] Death zones map update đúng

2. **Idle Tracking:**
   - [ ] Idle time tăng khi không có input
   - [ ] Idle time reset khi có input
   - [ ] Idle trigger hoạt động sau 12s

3. **Stuck Detection:**
   - [ ] Stuck trigger khi chết 3 lần cùng zone
   - [ ] Zone detection chính xác (top/mid/bottom)

**Manual Testing:**

```javascript
// Test trong console
// 1. Check event tracker state
console.log('Context:', eventTracker.getContext());

// 2. Force trigger events
eventTracker.recordDeath('mid');
eventTracker.updateIdleTime(15); // Force idle > 12s

// 3. Check death zones
console.log('Death zones:', eventTracker.deathZones);
```

---

### Subteam 3 — Backend & API (Firebase/AI)

#### API Service / Function Testing

**Test Cases:**

1. **Service Startup:**
   - [ ] Service/function start không có errors
   - [ ] Logs không lộ secrets
   - [ ] Environment/secrets load đúng (server-side)

2. **CORS:**
   - [ ] CORS cho phép frontend origin
   - [ ] Preflight requests hoạt động

3. **Health Endpoint (optional):**
   - [ ] GET /api/health trả về 200 (nếu có)
   - [ ] Response format đúng

**Test Commands:**

```bash
# Test health endpoint (nếu có)
curl "<API_BASE_URL>/api/health"

# Expected response:
# {"status":"ok","timestamp":"..."}
```

---

#### AI Endpoint Testing

**Test Cases:**

1. **POST <AI_ENDPOINT>:**
   - [ ] Valid request → success response
   - [ ] Missing triggerType → 400 error
   - [ ] Missing context → 400 error
   - [ ] Invalid triggerType → 400 error
   - [ ] API service down → 503 error

2. **Request Validation:**
   - [ ] Validate triggerType (death/idle/stuck/...)
   - [ ] Validate context structure
   - [ ] Validate required fields

3. **Error Handling:**
   - [ ] All errors return proper format
   - [ ] Error messages không expose sensitive info
   - [ ] Status codes đúng

**Test với Thunder Client:**

**Test 1: Valid Request**
```
POST <AI_ENDPOINT>
Content-Type: application/json

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

**Test 2: Missing triggerType**
```
POST <AI_ENDPOINT>
Content-Type: application/json

{
  "context": {...}
}
```
Expected: 400 error

**Test 3: Invalid triggerType**
```
POST <AI_ENDPOINT>
Content-Type: application/json

{
  "triggerType": "invalid",
  "context": {...}
}
```
Expected: 400 error

---

## 🔗 Integration Testing

### Frontend + API Integration (static site ↔ external endpoint)

**Test Flow:**

1. **Setup:**
   - Frontend chạy trên `http://localhost:5500`
   - API chạy ở `<AI_ENDPOINT>` (deployed hoặc emulator)

2. **Test Scenarios:**

   **Scenario 1: Happy Path**
   - [ ] Player chết → Event tracked
   - [ ] AI trigger → API call sent
   - [ ] API response → Message hiển thị

   **Scenario 2: API Error**
   - [ ] API return 500 error
   - [ ] Frontend fallback về hardcoded
   - [ ] Game vẫn chạy bình thường

   **Scenario 3: Network Error**
   - [ ] API down
   - [ ] Frontend handle error gracefully
   - [ ] Fallback hoạt động

**Test Checklist:**

```markdown
## Integration Test Checklist

### Setup
- [ ] Frontend running
- [ ] API reachable
- [ ] CORS configured
- [ ] API endpoint accessible

### Game Flow
- [ ] Start game → No errors
- [ ] Player jump → Physics works
- [ ] Player die → Event tracked
- [ ] AI trigger → API called
- [ ] API response → Message displayed

### Error Cases
- [ ] API down → Fallback works
- [ ] Invalid API response → Fallback works
- [ ] Network timeout → Fallback works
```

---

## 🐛 Debugging Tips

### Frontend Debugging

```javascript
// 1. Console logging
console.log('Debug:', variable);

// 2. Breakpoints trong VS Code
// Click vào line number để set breakpoint

// 3. Network tab
// Check API calls trong DevTools → Network

// 4. Performance profiling
// DevTools → Performance → Record
```

### API Debugging (Subteam 3)

```javascript
// 1. Console logging
console.log('Request:', req.body);
console.log('Response:', response);

// 2. Cloud logs / emulator logs
// Firebase Functions logs / Cloud Run logs

// 3. Postman/Thunder Client
// Test endpoints trực tiếp
```

---

## ✅ Pre-Merge Checklist

### Trước khi merge vào develop:

**Frontend:**
- [ ] Code chạy được trên localhost
- [ ] Không có console errors
- [ ] UI không bị vỡ
- [ ] Test với mock API (nếu BE chưa sẵn sàng)

**Subteam 3 (API):**
- [ ] Endpoint trả đúng schema theo `API_CONTRACT.md`
- [ ] CORS OK với localhost + GitHub Pages
- [ ] Error handling đầy đủ + fallback phía frontend hoạt động

**Subteam 1 (Gameplay & AI-):**
- [ ] Game chạy mượt (60 FPS)
- [ ] Physics hoạt động đúng
- [ ] Không có memory leaks

**Subteam 2 (UI/UX):**
- [ ] UI/HUD/menu/settings hoạt động đúng
- [ ] AI dialog animation không che gameplay

**AI (rule-based + optional API):**
- [ ] Event tracking chính xác
- [ ] Triggers hoạt động + cooldown không spam
- [ ] Fallback system test (khi API fail)

**Integration:**
- [ ] Test frontend + API cùng nhau
- [ ] Test toàn bộ flow
- [ ] Không có breaking changes

---

## 📊 Test Results Template

```markdown
## Test Results - [Feature Name]

**Date:** 2024-01-15
**Tester:** [Name]
**Branch:** feature/team-task

### Test Cases
- [ ] Test case 1: ✅ Pass / ❌ Fail
- [ ] Test case 2: ✅ Pass / ❌ Fail

### Issues Found
1. Issue description
   - Steps to reproduce
   - Expected vs Actual

### Notes
- Additional notes
```

---

**Last Updated**: 2026-02-03  
**Maintained by**: All Subteams

