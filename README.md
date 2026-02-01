# Chuck King - AI Rage Game MVP

> Một web game platformer đơn giản với hệ thống AI trêu chọc người chơi, được thiết kế như một study case để tích hợp AI vào game.

## 🎮 Game là gì?

**Chuck King** là một game platformer 2D màn hình dọc, lấy cảm hứng từ Jump King. Người chơi điều khiển một nhân vật phải nhảy lên các platform để leo lên cao. Game có cơ chế **charge jump** - giữ phím để tích lực nhảy, thả phím để nhảy.

Điểm đặc biệt của game là hệ thống **AI Rage System** - một NPC mỉa mai sẽ trêu chọc người chơi khi họ chết, idle quá lâu, hoặc bị kẹt ở một khu vực.

## 🚀 Cách chạy

1. Clone hoặc download project
2. Mở file `index.html` trong trình duyệt web (Chrome, Firefox, Edge...)
3. Không cần cài đặt gì thêm - game chạy hoàn toàn trên trình duyệt!

### Controls

- **Space** hoặc **Arrow Up**: Giữ để charge jump, thả để nhảy
- **Mute AI**: Nút ở góc dưới bên phải để tắt/bật AI

## 🏗️ Kiến trúc Code

Project được chia thành các module rõ ràng:

```
js/
├── main.js                 # Entry point, khởi tạo game
├── engine/
│   └── GameEngine.js      # Game loop, rendering, input handling
├── entities/
│   ├── Player.js          # Nhân vật với physics và jump charge
│   └── Platform.js        # Platform tĩnh
├── systems/
│   ├── EventTracker.js    # Theo dõi hành vi người chơi
│   ├── AIRuleEngine.js    # Rule engine quyết định khi nào AI phản ứng
│   └── AIMessageGenerator.js  # Tạo message AI (hardcoded + API)
└── ui/
    └── UIManager.js       # Quản lý UI overlay (dialog, stats)
```

## 🤖 Hệ thống AI hoạt động thế nào?

### Event Tracking

Game theo dõi các sự kiện sau:
- **deathCount**: Số lần người chơi chết
- **idleTime**: Thời gian không có input (giây)
- **lastDeathZone**: Khu vực chết lần cuối (`top`, `mid`, `bottom`)
- **deathZones**: Map đếm số lần chết theo từng zone

### AI Triggers (Rule-based)

AI sẽ phản ứng khi:

1. **Death Trigger**: Người chơi chết
2. **Idle Trigger**: Không có input > 12 giây
3. **Stuck Trigger**: Chết ≥ 3 lần ở cùng một zone

### Cooldown System

- Sau mỗi lần AI nói, có cooldown **6 giây** trước khi có thể trigger lại
- Tránh spam message

### AI Message Generation

#### 1. Hardcoded Messages (Fallback)

Mặc định game sử dụng danh sách câu trêu chọc hardcoded theo từng trigger type:
- `death`: Câu khi chết
- `idle`: Câu khi idle
- `stuck`: Câu khi bị kẹt

#### 2. AI API Integration (Optional)

Game có sẵn function stub để gọi AI API:

```javascript
// Trong js/systems/AIMessageGenerator.js
const aiGenerator = new AIMessageGenerator();

// Cấu hình API endpoint (nếu có)
aiGenerator.setAPIEndpoint('https://your-ai-api.com/generate', 'your-api-key');
```

**API Request Format:**
```json
{
  "prompt": "Bạn là một NPC mỉa mai... [context]",
  "max_tokens": 20,
  "temperature": 0.9
}
```

**API Response Format (expected):**
```json
{
  "message": "Câu trêu chọc từ AI"
}
// Hoặc
{
  "text": "Câu trêu chọc từ AI"
}
// Hoặc (OpenAI format)
{
  "choices": [{"text": "Câu trêu chọc từ AI"}]
}
```

**Prompt Template:**
- AI được mô tả là NPC mỉa mai, cay đắng
- Context về trigger (death count, idle time, stuck zone)
- Yêu cầu: Câu ngắn ≤ 15 từ, có thể mỉa mai sâu cay

**Fallback:**
- Nếu API fail hoặc không cấu hình → dùng hardcoded messages
- Game vẫn chạy bình thường

## 📊 Input / Output của AI

### Input (Context)

```javascript
{
  deathCount: 5,
  idleTime: 12.5,
  lastDeathZone: "mid",
  deathZones: {
    "top": 1,
    "mid": 3,
    "bottom": 1
  }
}
```

### Output

- **Message**: String ngắn (≤ 15 từ)
- **Display**: Hiển thị trong AI dialog box 3 giây
- **Cooldown**: 6 giây trước khi có thể trigger lại

## 🔧 Hướng mở rộng trong tương lai

### Gameplay
- [ ] Thêm nhiều platform, obstacles
- [ ] Power-ups, checkpoints
- [ ] Nhiều level/map
- [ ] Leaderboard (localStorage)
- [ ] Particle effects, animations

### AI System
- [ ] Tích hợp OpenAI API, Anthropic Claude, hoặc local LLM
- [ ] Fine-tune model với game context
- [ ] Voice synthesis (text-to-speech)
- [ ] Dynamic difficulty adjustment dựa trên AI analysis
- [ ] AI có thể "học" từng người chơi

### Event Tracking
- [ ] Track thêm metrics: jump attempts, platform touches
- [ ] Heatmap của deaths
- [ ] Export analytics data
- [ ] A/B testing với AI prompts khác nhau

### UI/UX
- [ ] Settings menu
- [ ] Tutorial/instructions
- [ ] Sound effects, background music
- [ ] Responsive design cho mobile

### Technical
- [ ] Webpack/Vite build system
- [ ] TypeScript migration
- [ ] Unit tests
- [ ] Performance optimization

## 📝 Notes

- Game được thiết kế **MVP** - đơn giản nhưng đủ để demo concept
- Code clean, comment vừa đủ, dễ đọc và mở rộng
- Không cần backend - chạy hoàn toàn client-side
- AI API integration là optional - game vẫn chơi được không cần AI

## 🎯 Study Case Goals

Project này phục vụ như một study case để:
1. Hiểu cách tích hợp AI vào game loop
2. Thiết kế event tracking system
3. Xây dựng rule-based AI triggers
4. Tạo fallback system khi AI không available
5. Demo cách AI có thể tăng engagement (rage game mechanic)

## 📄 License

Free to use for study purposes.

---

**Enjoy the rage! 😈**

