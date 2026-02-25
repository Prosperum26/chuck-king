# 🎮 Hướng Dẫn Chạy Game Chuck King

## Cách 1: Chạy trực tiếp (Không cần API)

1. **Mở file `index.html`** (trang menu) trong trình duyệt web (Chrome, Firefox, Edge...)
   - Có thể double-click vào file `index.html`
   - Nhấn **START** → nhập tên → **GET READY** để vào game (mở `game.html`)
   - Hoặc mở trực tiếp `game.html` để chơi ngay
   - Game chạy với **hardcoded messages** nếu không cấu hình API

2. **Chơi game:**
   - Giữ **Space** hoặc **Arrow Up** để charge jump
   - Thả phím để nhảy
   - Rơi xuống đáy = chết và respawn
   - AI sẽ trêu chọc khi bạn chết, idle, hoặc bị kẹt

## Cách 2: Chạy với AI API (OpenAI)

### Bước 1: Lấy API Key

1. Đăng ký tài khoản tại [OpenAI](https://platform.openai.com/)
2. Vào [API Keys](https://platform.openai.com/api-keys)
3. Tạo API key mới (format: `sk-...`)

### Bước 2: Cấu hình API

1. Mở file **`js/config.js`**
2. Điền thông tin:

```javascript
export const API_CONFIG = {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: 'sk-YOUR_API_KEY_HERE', // Dán API key của bạn vào đây
    model: 'gpt-3.5-turbo' // hoặc 'gpt-4'
};
```

**Lưu ý:** 
- ⚠️ **KHÔNG commit API key lên Git!** 
- File `config.js` nên được thêm vào `.gitignore` nếu push code lên GitHub

### Bước 3: Chạy game

1. Mở `game.html` (hoặc từ menu: index.html → START → GET READY) trong trình duyệt
2. Mở **Developer Console** (F12) để xem log
3. Nếu thấy `✅ AI API configured` = thành công!
4. Chơi game và AI sẽ tự động generate messages

### Bước 4: Test AI

Để trigger AI messages:
- **Chết**: Rơi xuống đáy map
- **Idle**: Không nhấn phím > 12 giây
- **Stuck**: Chết ≥ 3 lần ở cùng một khu vực

## Cách 3: Chạy với Local Server (Khuyến nghị)

Nếu gặp lỗi CORS khi gọi API, dùng local server:

### Option A: Python (nếu đã cài Python)

```bash
# Python 3
python -m http.server 8000

# Hoặc Python 2
python -m SimpleHTTPServer 8000
```

Sau đó mở: `http://localhost:8000`

### Option B: Node.js (nếu đã cài Node)

```bash
npx http-server
```

### Option C: VS Code Live Server

1. Cài extension "Live Server" trong VS Code
2. Right-click vào `index.html` (menu) hoặc `game.html` (game) → "Open with Live Server"

## 🔍 Debug

### Kiểm tra API có hoạt động không:

1. Mở **Developer Console** (F12)
2. Xem tab **Console**:
   - `✅ AI API configured` = API đã được cấu hình
   - `ℹ️ Using hardcoded AI messages` = đang dùng fallback
3. Xem tab **Network**:
   - Khi AI trigger, sẽ có request đến API endpoint
   - Check status code (200 = OK, 401 = sai API key, 429 = rate limit)

### Lỗi thường gặp:

- **CORS Error**: Dùng local server thay vì mở file trực tiếp
- **401 Unauthorized**: API key sai hoặc hết hạn
- **429 Too Many Requests**: Vượt quá rate limit, đợi một chút
- **AI không nói**: Check console xem có lỗi không, game sẽ tự fallback về hardcoded

## 🎯 Tips

- Game sẽ tự động fallback về hardcoded messages nếu API fail
- Có thể mute AI bằng nút ở góc dưới bên phải
- Stats hiển thị số lần chết và thời gian idle

---

**Chúc bạn chơi vui! 😈**

