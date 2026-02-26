# 👥 Team Division - Chuck King

> **Tóm tắt cách chia lại team 9 người theo 3 subteam và feature list hiện tại**

---

## 📊 Tổng quan

**Tổng số:** 9 người  
**Subteam:** 3 nhóm (có 1 người tham gia 2 subteam)  
**Mục tiêu:** Mỗi subteam phụ trách một “mảng lớn” của game, nhưng vẫn gắn với từng file cụ thể trong repo và các feature trong roadmap.

**Danh sách thành viên:**
- **Hưng**
- **Bình**
- **Tiến**
- **Quỳnh**
- **Huyền**
- **Minh**
- **Thắng**
- **Ân**

---

## 🎮 Subteam 1 — Game Dev & AI- (Core Gameplay + AI Logic + SFX)

**Thành viên:** Hưng, Bình, Tiến  
**Scope chính:**  
- Core gameplay, game loop & mechanics  
- AI taunt system (rule-based, không đụng tới API/LLM)  
- Sound effects và gameplay feedback cơ bản

### 1.1. Core Gameplay & Game Loop

**Feature list liên quan:**  
- I. CORE GAMEPLAY  
  - Player Control  
  - Physics & Collision  
  - Level / Map System  
- II. GAME LOOP & RAGE MECHANICS  
  - Death System  
  - Retry Flow  
  - Progress Tracking (mức cơ bản)

**Files chính:**
- `js/engine/GameEngine.js`
- `js/entities/Player.js`
- `js/entities/Platform.js`

**Nhiệm vụ cụ thể:**
- **Player Control**
  - Hoàn thiện **nhảy có quán tính (momentum)**: chỉnh `velocity`, `acceleration` để cảm giác “trơn” và khó điều khiển kiểu rage game.
  - Tinh chỉnh **giữ phím để điều chỉnh lực nhảy** (charge jump) để có nhiều “khung lực” rõ ràng.
- **Physics & Collision**
  - Cải thiện **precision collision** để cảm giác “suýt rơi” rõ ràng, phù hợp rage-style.
  - Thêm **boundary** (trên/dưới/trái/phải) rõ ràng.
  - Thiết kế cơ chế **fall damage / death khi rơi quá sâu** (ví dụ rơi ra khỏi màn hoặc rơi xuống dưới mốc X).
- **Level / Map System**
  - Thiết kế 1 **large vertical map** kiểu Jump King (layout platform, độ khó tăng dần).
  - Đa dạng platform:
    - Static (đã có, nhưng có thể thêm kích cỡ/spacing khác nhau).
    - Moving (optional, nếu kịp): platform di chuyển lên/xuống/trái/phải.
  - Cân nhắc **checkpoint** (có thể có 1–2 checkpoint nhẹ để game không quá toxic).
- **Camera System (phối hợp với Subteam 2 về trải nghiệm)**
  - Implement **camera follow player** (có smoothing).
  - **Camera bounds** để không lộ map ngoài vùng chơi.
  - **Dead zone**: người chơi di chuyển trong vùng nhỏ, camera chỉ follow khi ra khỏi zone đó.

---

### 1.2. AI Taunt Logic (Rule-based, không API)

**Feature list liên quan:**  
- III. AI TAUNT SYSTEM  
  - Player Behavior Tracking (đã có cơ bản)  
  - AI Taunt Logic (Rule-based)  
  - AI Response System (hardcoded)  

**Files chính:**
- `js/systems/EventTracker.js`
- `js/systems/AIRuleEngine.js`
- `js/systems/AIMessageGenerator.js` (chỉ phần hardcoded & trigger logic, **không** xử lý API)

**Nhiệm vụ cụ thể:**
- Bổ sung tracking:
  - **Death streak** (chết liên tiếp không vượt qua một mốc nào đó).
  - **Thời gian không tiến triển** (ví dụ: cao độ không tăng sau X giây).
  - **Rơi từ độ cao lớn**: so sánh highest height vs current death height.
- Cải thiện **trigger rules**:
  - Trigger riêng cho:
    - Chết quá nhiều trong thời gian ngắn.
    - Idle quá lâu (đã có, nhưng có thể tinh chỉnh ngưỡng).
    - Rơi từ gần đỉnh xuống dưới.
  - Thêm nhiều **level taunt** (nhẹ → nặng dần theo số death/idle/stuck).
- Cải thiện **cooldown system**:
  - Giữ cooldown hiện tại nhưng cho phép:
    - Ưu tiên trigger “đặc biệt” (ví dụ rơi từ rất cao) override một số trigger thường.
    - Chống spam khi nhiều điều kiện cùng đúng lúc.
- Mở rộng **hardcoded messages**:
  - Thêm nhiều câu cho từng loại trigger (death, idle, stuck, fall from high).
  - Có thể thêm **tag** cho câu (nhẹ, vừa, nặng) để logic chọn theo độ rage.

---

### 1.3. Sound Effects & Gameplay Feedback

**Feature list liên quan:**  
- V. AUDIO & FEEDBACK  
  - Sound Effects  
  - Visual Feedback (phối hợp với Subteam 2)

**Files/chỗ cần đụng:**
- Có thể thêm module mới `js/systems/AudioManager.js` (nếu cần).
- Tích hợp vào `GameEngine`, `Player`, `UIManager`.

**Nhiệm vụ cụ thể:**
- Thêm SFX cho:
  - **Jump / Charge full / Release jump**
  - **Landing (mạnh/nhẹ)**  
  - **Death / Falling dài**
  - **UI click** (menu, restart, settings).
- Hỗ trợ **mute/unmute sound** (phối hợp với UI team cho nút Settings).
- Gợi ý phối hợp với Subteam 2 để:
  - Trigger **screen shake**, **flash khi chết**, **particle khi nhảy/va chạm** (Subteam 1 lo phần data/event, Subteam 2 lo phần visual).

---

## 🎨 Subteam 2 — Frontend (UI/UX) & Game Assets

**Thành viên:** Quỳnh, Huyền, Minh  
**Scope chính:**  
- Toàn bộ UI/UX, HUD, menu, settings  
- Visual design, animation, particle, camera feel  
- Asset (sprite, background, font, màu sắc)

### 2.1. In-game UI & HUD

**Feature list liên quan:**  
- IV. UI / UX  
  - In-game UI  
  - AI Dialogue UI  
  - Menu System  
  - Settings

**Files chính:**
- `index.html` (start menu), `game.html` (game page)
- `styles/main.css`, `styles/menu.css`
- `js/ui/UIManager.js`

**Nhiệm vụ cụ thể:**
- **In-game UI**
  - Hoàn thiện **death counter** (đã có).
  - Thêm:
    - **Timer** (thời gian chơi hiện tại).
    - **Height indicator** (mức cao nhất đang đứng hoặc đã đạt).
  - Thiết kế **minimal HUD** không che gameplay (vị trí, kích thước, màu).
- **AI Dialogue UI**
  - Cải thiện bubble/box cho **AI taunt**:
    - Animation xuất hiện/biến mất (fade-in, slide, shake nhẹ).
    - Vị trí hợp lý, không che nhân vật quá nhiều.
  - Thử các kiểu hiển thị: speech bubble, toast message, popup ngắn.
- **Menu System**
  - Thêm các màn:
    - **Start screen** (Play, Instructions, Credits).
    - **Pause menu** (Resume, Restart, Settings, Quit to main menu).
    - **Game over / Victory screen** (nếu có đích tới).
  - Flow UX:
    - Vào game → Start screen → Play → In-game UI.
    - Khả năng restart nhanh mà không reload trang.
- **Settings**
  - UI cho:
    - Sound on/off.
    - Music on/off.
    - Camera shake on/off.
  - Phối hợp với Subteam 1 (SFX) và Subteam 3 (nếu sau này lưu setting qua API/local storage).

---

### 2.2. Visual Design, Animation & Assets

**Feature list liên quan:**  
- V. AUDIO & FEEDBACK (phần visual).  
- VI. TECHNICAL (Asset Management liên quan tới frontend).  

**Nhiệm vụ cụ thể:**
- **Visual Feedback**
  - Implement:
    - **Screen shake** khi chết hoặc rơi mạnh (coi input event từ Subteam 1).
    - **Flash khi chết** (overlay trắng/đỏ nhanh).
    - **Particle** khi nhảy, va chạm, landing.
- **Game Assets**
  - Thiết kế hoặc chọn:
    - Background image(s), gradient, theme màu.
    - Player sprite (hoặc đơn giản nhưng có animation).
    - Platform style (nhiều loại cho các khu vực khác nhau).
  - Tối ưu:
    - Dùng **lightweight asset format** (PNG nhỏ, SVG, hoặc shapes vẽ bằng Canvas).
- **Responsiveness & Feel**
  - Tối ưu để chơi **desktop-first**, nhưng không bị vỡ layout trên màn hình khác nhau.
  - Cân nhắc:
    - Hỗ trợ **keyboard** là chính.
    - Chuẩn bị nền tảng cho **touch control** (optional, nếu còn thời gian).

---

## 🧠 Subteam 3 — Backend & API (AI + Firebase Database)

**Thành viên:** Hưng, Thắng, Ân  
**Scope chính:**  
- Thiết kế và maintain **API cho AI taunt**  
- Thiết kế **Firebase database/API** cho thống kê, leaderboard, setting,…  
- Đảm bảo toàn bộ API có contract rõ ràng và dễ gọi từ frontend (game đang host trên GitHub Pages / static hosting).

> 📌 Lưu ý: Repo hiện tại là **JS/HTML/CSS thuần**, không có thư mục `backend/`.  
> Subteam 3 tập trung vào: thiết kế API, viết tài liệu (`docs/API_CONTRACT.md`), POC với Firebase / serverless (Cloud Functions/Cloud Run/Service khác), và cung cấp SDK đơn giản cho frontend.

### 3.1. AI API Design & Integration (Server-side)

**Feature list liên quan:**  
- III. AI TAUNT SYSTEM (giai đoạn có API)  
- VI. TECHNICAL (API & performance)  

**Docs/files chính:**
- `docs/API_CONTRACT.md`
- `js/config.js` / `js/config.example.js` (config endpoint, key, model)

**Nhiệm vụ cụ thể:**
- Thiết kế và maintain endpoint chính:
  - `POST /api/ai/generate` (hoặc tương đương URL Firebase/Cloud Function).
  - Chuẩn hóa request body: `triggerType`, `context` (deathCount, idleTime, lastDeathZone, deathZones,…).
  - Chuẩn hóa response: `{ status, message, timestamp }`.
- Tích hợp với dịch vụ AI:
  - OpenAI / Claude / custom model (tùy nhóm chọn).
  - Thiết lập **prompt** sử dụng context game (theo EventTracker).
  - Thêm **rate limit**, **fallback** khi AI down.
- Cập nhật docs:
  - Đảm bảo `API_CONTRACT.md` luôn đúng với thực tế.
  - Viết guideline cho Subteam 1, 2 về cách gọi API, cách handle error.

---

### 3.2. Firebase Database & Game Data API

**Feature list liên quan:**  
- VII. DATA & STATE  
- Một phần của II. GAME LOOP & RAGE MECHANICS (thống kê dài hạn).

**Nhiệm vụ cụ thể:**
- Thiết kế data model trên Firebase (Firestore hoặc Realtime DB) cho:
  - **Best height**.
  - **Total deaths**.
  - Có thể thêm: total play time, số lần rơi từ mốc cao, v.v.
- Đề xuất API:
  - `POST /api/game/stats` — lưu stats cuối session.
  - `GET /api/leaderboard` — lấy top players (nếu làm leaderboard).
- Xử lý:
  - **Auth** (nếu cần, có thể bắt đầu với anonymous/guest).
  - **Security rules** cơ bản.

---

### 3.3. Technical Design & Dev Experience

**Nhiệm vụ cụ thể:**
- Đề xuất **cách frontend gọi Firebase/AI API**:
  - Qua fetch trực tiếp đến endpoint public.
  - Hoặc qua một wrapper JS nhỏ (SDK mini) để Subteam 1/2 dùng dễ dàng.
- Đảm bảo:
  - CORS hoạt động với GitHub Pages / static hosting.
  - Tài liệu **setup Firebase** được ghi rõ trong `docs/SETUP_GUIDE.md`.

---

## 🔗 Dependencies giữa các subteam

### Critical Dependencies:

1. **Subteam 1 ↔ Subteam 2** (Gameplay & Presentation)
   - Subteam 1 emit events (death, jump, fall, progress) → Subteam 2 dùng để update UI, animation, feedback.
   - Cần thống nhất: event names, payload, tần suất emit.

2. **Subteam 1 ↔ Subteam 3** (AI Context & API)
   - Subteam 1 định nghĩa context cần gửi lên API (deathCount, idleTime, v.v.).
   - Subteam 3 định nghĩa exact schema và update `API_CONTRACT.md`.

3. **Subteam 2 ↔ Subteam 3** (Data & Settings)
   - Subteam 2 cần biết: API/SDK để load/save stats, settings.
   - Subteam 3 phải đảm bảo: endpoint ổn định, error rõ ràng.

### Non-Critical Dependencies:

- Subteam 2 có thể làm **mock UI** trước, dùng dữ liệu fake.
- Subteam 3 có thể thiết kế API contract và mock server (Firebase emulator, JSON server,...) trước khi AI thật sẵn sàng.

---

## 📅 Timeline gợi ý

### Tuần 1: Foundation

- **Subteam 1:**
  - Ổn định core gameplay (jump, physics, collision).
  - Hoàn thiện basic rage mechanics (death, reset, counter).
  - Thiết kế event context cho AI (dù chưa gọi API).
- **Subteam 2:**
  - Khung UI/HUD cơ bản (death counter, timer layout).
  - Style AI dialog box, HUD, màu sắc chính của game.
  - Start screen đơn giản.
- **Subteam 3:**
  - Draft `API_CONTRACT.md` cho `/api/ai/generate`.
  - Chọn stack AI (OpenAI/Firebase callable function/...).

### Tuần 2: Rage & AI-Polish

- **Subteam 1:**
  - Nâng cấp AI rule-based (death streak, high-fall, idle,...).
  - Bắt đầu thêm sound effects cơ bản.
- **Subteam 2:**
  - Thêm animation cho AI dialog, menu system, settings.
  - Visual feedback (shake, flash, particles).
- **Subteam 3:**
  - POC AI endpoint (mock AI hoặc kết nối thật).
  - Thiết kế Firebase schema cho stats.

### Tuần 3+: Online & Polish

- Kết nối API thật (nếu kịp).
- Lưu stats, hiển thị leaderboard (optional).
- Final polish UI/UX + performance.

---

## ⚠️ Lưu ý chung

- **Communication là key:**
  - Thông báo khi đổi API, đổi event, đổi UI flow.
  - Daily standup ngắn để sync 3 subteam.
- **Docs là nguồn chân lý:**
  - `API_CONTRACT.md` cho API.
  - `PROJECT_STRUCTURE.md` cho file ownership.
  - Update khi có thay đổi lớn.

---

## 📚 Tài liệu liên quan

- [Project Structure](./PROJECT_STRUCTURE.md) - Chi tiết files và responsibilities
- [Team Coordination](./TEAM_COORDINATION.md) - Cách phối hợp 3 subteam
- [API Contract](./API_CONTRACT.md) - Interface giữa game (frontend) và API (AI & Firebase)
- [Git Workflow](./GIT_WORKFLOW.md) - Cách dùng Git
- [Setup Guide](./SETUP_GUIDE.md) - Setup môi trường & Firebase/API

---

**Last Updated**: 2026-02-03  
**Maintained by**: All Subteams

