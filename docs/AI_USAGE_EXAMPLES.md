# AI Call Logic - Hướng dẫn sử dụng

## Tổng quan

Dự án hiện tại bao gồm các hàm để gọi AI API từ OpenAI:

- **`generateStory(apiKey)`** - Sinh ra một câu chuyện khích lệ cho game
- **`generateRage(apiKey, stage)`** - Sinh ra một câu nói trêu chọc dựa trên stage

Tất cả các hàm đều có **error handling** hoàn chỉnh:
- ✅ Xử lý API key không hợp lệ
- ✅ Xử lý hết quota (HTTP 429)
- ✅ Xử lý timeout
- ✅ ❌ **KHÔNG lưu key** - Quan trọng!

---

## Cấu trúc thư mục

```
js/systems/
├── AICallLogic.js          # ← Static methods: generateStory, generateRage
├── APIKeyManager.js        # Quản lý API key (chỉ trong memory)
├── AIMessageGenerator.js   # Sinh taunts dựa trên event game
└── ...
```

---

## Cách sử dụng từ JavaScript

### 1. Import AICallLogic

```javascript
import { AICallLogic } from './systems/AICallLogic.js';
```

### 2. Sử dụng generateStory()

```javascript
const apiKey = 'sk-...'; // Lấy từ người dùng
const endpoint = 'https://api.openai.com/v1/chat/completions';
const model = 'gpt-3.5-turbo'; // optional, default là 'gpt-3.5-turbo'

const result = await AICallLogic.generateStory(apiKey, endpoint, model);

if (result.success) {
    console.log('Story:', result.story);
    // Sử dụng story ở đây (e.g., hiển thị, phát âm, etc)
} else {
    console.error('Error:', result.message);
    // Xử lý lỗi:
    // - result.error = 'INVALID_KEY' → API key sai
    // - result.error = 'QUOTA_EXCEEDED' → Hết quota
    // - result.error = 'TIMEOUT' → Timeout
    // - result.error = 'NETWORK_ERROR' → Lỗi mạng
}
```

### 3. Sử dụng generateRage()

```javascript
const stage = 5; // Stage trong game

const result = await AICallLogic.generateRage(apiKey, endpoint, stage, model);

if (result.success) {
    console.log('Rage:', result.rage);
} else {
    console.error('Error:', result.message);
    // Xử lý lỗi giống như trên
}
```

### 4. Test API trước

```javascript
const testResult = await AICallLogic.testAPI(apiKey, endpoint);

if (testResult.success) {
    console.log('✅ API key hợp lệ!');
} else {
    console.error('❌ ' + testResult.message);
}
```

---

## Sử dụng qua gameAI helper (main.js)

Trong file `main.js`, tôi đã tạo một helper object tên `gameAI` để giúp sử dụng AICallLogic dễ hơn:

```javascript
// Set credentials từ modal input
gameAI.setCredentials(apiKey, endpoint, model);

// Generate story
const storyResult = await gameAI.generateStory();

// Generate rage
const rageResult = await gameAI.generateRage(5); // stage 5

// Test API
const testResult = await gameAI.testAPI();

// Clear credentials khi skip API
gameAI.clearCredentials();

// Check xem có credentials không
if (gameAI.hasValidCredentials()) {
    // Có API
}
```

---

## Xử lý lỗi chi tiết

### 1. Invalid Key (401)
```javascript
if (result.error === 'INVALID_KEY') {
    // Hiển thị: "API key không hợp lệ hoặc hết hạn. Vui lòng kiểm tra và nhập lại."
    // Action: Yêu cầu người dùng nhập lại key
}
```

### 2. Quota Exceeded (429)
```javascript
if (result.error === 'QUOTA_EXCEEDED') {
    // Hiển thị: "Đã vượt quá giới hạn request. Hết quota hoặc rate limit. Vui lòng thử lại sau."
    // Action: Không gọi API nửa, chờ hay fallback về hardcoded messages
}
```

### 3. Timeout
```javascript
if (result.error === 'TIMEOUT') {
    // Hiển thị: "API timeout (vượt quá 15s). Server không phản hồi kịp thời. Vui lòng thử lại."
    // Action: Thử lại sau hoặc fallback
}
```

### 4. Network Error
```javascript
if (result.error === 'NETWORK_ERROR') {
    // Hiển thị: "API endpoint không hợp lệ hoặc lỗi kết nối mạng."
    // Action: Kiểm tra endpoint URL
}
```

---

## ❌ Quan trọng: Không lưu API key

**API key KHÔNG được phép lưu** vào `localStorage`, `sessionStorage`, hoặc bất kỳ storage nào.

- ✅ Key chỉ tồn tại trong **memory** của `gameAI` object
- ✅ Key bị xoá khi reload trang
- ✅ Key bị xoá khi click "Skip API" hoặc "Bỏ Qua"

```javascript
// ❌ KHÔNG làm thế này
localStorage.setItem('apiKey', apiKey);

// ✅ Làm thế này
gameAI.setCredentials(apiKey, endpoint);
```

---

## Ví dụ đầy đủ: Gọi generateRage() khi chơi game

```javascript
// Trong game code (ví dụ: khi người chơi chết)
async function onPlayerDeath(stage) {
    if (gameAI.hasValidCredentials()) {
        const result = await gameAI.generateRage(stage);
        
        if (result.success) {
            // Hiển thị rage message
            displayRageMessage(result.rage);
        } else {
            // Lỗi: log và fallback về hardcoded
            console.warn('Failed to generate rage:', result.message);
            displayHardcodedTaunt();
        }
    } else {
        // Không có API config - dùng hardcoded
        displayHardcodedTaunt();
    }
}
```

---

## Configuration

### Default values

```javascript
// Model mặc định
const DEFAULT_MODEL = 'gpt-3.5-turbo';

// Timeout mặc định (15 giây)
const API_TIMEOUT = 15000;

// Max tokens cho generateStory
const STORY_MAX_TOKENS = 80;

// Max tokens cho generateRage
const RAGE_MAX_TOKENS = 50;
```

### Thay đổi model

```javascript
// Nếu muốn sử dụng GPT-4
gameAI.setCredentials(apiKey, endpoint, 'gpt-4');
```

---

## Debugging

Để debug, bạn có thể sử dụng `window.gameAI` trong console:

```javascript
// Kiểm tra credentials
window.gameAI.hasValidCredentials(); // true/false

// Test API
await window.gameAI.testAPI();

// Generate story
await window.gameAI.generateStory();

// Clear
window.gameAI.clearCredentials();
```

---

## Tổng kết

| Chức năng | Mô tả | Lỗi có thể |
|-----------|-------|----------|
| `generateStory()` | Sinh câu chuyện khích lệ | INVALID_KEY, QUOTA_EXCEEDED, TIMEOUT, NETWORK_ERROR |
| `generateRage()` | Sinh câu trêu chọc | INVALID_KEY, QUOTA_EXCEEDED, TIMEOUT, NETWORK_ERROR |
| `testAPI()` | Test API credentials | INVALID_KEY, QUOTA_EXCEEDED, TIMEOUT, NETWORK_ERROR |

✅ Tất cả lỗi đều được handle gracefully
✅ Fallback về hardcoded messages nếu API fail
✅ API key không được lưu
✅ Timeout = 15 giây
