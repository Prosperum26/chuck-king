# 🔑 Hướng dẫn lấy OpenAI API Key

## Bước 1: Đăng ký OpenAI Account

1. Truy cập: https://platform.openai.com/signup
2. Chọn phương thức đăng ký:
   - **Google Account** (nhanh nhất)
   - **Email** + mật khẩu
   - **Microsoft Account**
3. Xác thực email (check inbox)
4. Điền thông tin cơ bản (tên, password)

---

## Bước 2: Xác minh số điện thoại

1. OpenAI yêu cầu **xác minh số điện thoại**
2. Nhập số điện thoại của bạn (ví dụ: +84 912345678)
3. Nhập mã OTP nhận được qua SMS

---

## Bước 3: Thêm Payment Method (Thẻ tín dụng)

⚠️ **Quan trọng**: OpenAI cần thẻ tín dụng để xác minh, nhưng bạn có **$5 free credit** đầu tiên (hết sau 3 tháng)

1. Sau khi xác minh phone → "Add payment method" 
2. Chọn **Credit Card** (Visa, Mastercard, Amex)
3. Nhập:
   - Số thẻ
   - Ngày hết hạn (MM/YY)
   - CVC (3 chữ số phía sau)
   - Tên + địa chỉ
4. Click "Submit"

**Free Credits:**
- $5 khi bạn vừa signup (hết sau 3 tháng)
- Dùng được cho gpt-3.5-turbo, gpt-4, etc.

---

## Bước 4: Lấy API Key

### Cách 1: Via Website Dashboard

1. Đăng nhập: https://platform.openai.com/account
2. Click menu **"API keys"** (trái sidebar)
3. Click **"+ Create new secret key"**
4. Đặt tên (ví dụ: "chuck-king-game")
5. Click **"Create secret key"**
6. **Copy API key** ngay (chỉ hiển thị 1 lần!)

✅ Format sẽ như: `sk-...` (rất dài)

### Cách 2: Via Settings

1. Click **Profile (góc phải trên)**
2. Click **"API keys"**
3. Làm như trên

---

## Bước 5: Kiểm tra quota/usage

1. Vào https://platform.openai.com/account/billing/overview
2. Xem:
   - **Unspent credits**: Còn bao nhiêu tiền free
   - **Usage**: Đã dùng bao nhiêu
   - **Billing period**: Kỳ thanh toán (1 tháng)

---

## ✅ Tips khi sử dụng API Key

### Bảo mật
- ❌ **KHÔNG share** API key cho người khác
- ❌ **KHÔNG commit** vào Git (GitHub sẽ detect tự động!)
- ✅ Nếu key bị leak → Delete nó ở Dashboard ngay

### Giáp hạn (Rate Limits)
- **gpt-3.5-turbo**: Rẻ nhất, 1 triệu tokens = $0.50
- **gpt-4**: Mắc hơn, 1 triệu tokens = $10-30
- Nên dùng **gpt-3.5-turbo** cho game

### Xem usage hiện tại
```
1. Vào: https://platform.openai.com/account/billing/overview
2. Xem "Unspent balance"
3. Xem "Usage by model"
```

---

## ⚠️ Lỗi thường gặp

### Error: "Unauthorized - 401"
- ✗ API key sai
- ✗ API key hết hạn
- ✗ Sai endpoint
- ✓ **Fix**: Copy lại key mới từ dashboard

### Error: "Rate limit exceeded - 429"
- ✗ Gọi API quá nhanh
- ✗ Vượt quá quota hàng tháng
- ✓ **Fix**: Chờ 1 phút, hoặc check usage

### Error: "Timeout - (vượt quá 15s)"
- ✗ Network chậm
- ✗ Server OpenAI quá tải
- ✓ **Fix**: Thử lại sau vài giây

### Error: "Invalid endpoint"
- ✗ Endpoint sai
- ✓ **Fix**: Dùng: `https://api.openai.com/v1/chat/completions`

---

## 🎮 Sử dụng API Key trong Game

### 1. Lần đầu mở game:
```
1. Mở index.html
2. Modal hiển thị:
   - API Endpoint: https://api.openai.com/v1/chat/completions (✓ đã có)
   - API Key: [Nhập API key vào đây]
3. Click "🔍 Kiểm Tra API" → Chờ
4. Nếu ✅ xanh → Key hợp lệ
5. Click "Bắt Đầu Game"
```

### 2. Không có API Key:
```
1. Click "Bỏ Qua"
2. Game sẽ chạy với hardcoded messages
3. Vẫn chơi được bình thường
```

### 3. API Key sai:
```
1. Click "🔍 Kiểm Tra API"
2. Sẽ báo: "❌ API key không hợp lệ hoặc hết hạn"
3. Tìm nguyên nhân:
   - Copy lại key chính xác
   - Kiểm tra endpoint
   - Kiểm tra status account
```

---

## 📊 Ước tính chi phí

Nếu dùng API trong game:

| Model | Chi phí | Ước tính |
|-------|---------|---------|
| gpt-3.5-turbo | $0.5 / 1M tokens | 1 game = ~50 tokens → $0.000025 |
| gpt-4 | $3 / 1M input tokens | 1 game = ~50 tokens → $0.00015 |

**Với $5 free credit:**
- gpt-3.5-turbo: ~100,000 API calls
- gpt-4: ~16,000 API calls

---

## Video Hướng dẫn (Tìm trên YouTube)
- "OpenAI API Key Setup"
- "How to get ChatGPT API key"
- "OpenAI Platform Tutorial"

---

## ❓ FAQ

**Q: Free credit kéo dài bao lâu?**
A: 3 tháng từ ngày signup, sau đó cần thanh toán

**Q: Có thể dùng ChatGPT Plus account không?**
A: KHÔNG - ChatGPT Plus khác với API. Phải đăng ký API riêng.

**Q: API Key bao lâu hết hạn?**
A: Không hết hạn, nhưng nên regenerate hàng năm (security)

**Q: Có thể share API Key không?**
A: KHÔNG - Cấm tuyệt đối. Mỗi người dùng phải có key riêng.

**Q: Tạo được bao nhiêu API Key?**
A: Unlimited, nhưng nên disable key cũ khi không dùng

---

## Quick Checklist ✓

- [ ] Đăng ký OpenAI account
- [ ] Xác minh số điện thoại
- [ ] Thêm credit card
- [ ] Lấy API Key (copy + paste)
- [ ] Kiểm tra API Key hợp lệ (click button test)
- [ ] Chơi game!

---

**Cần giúp thêm? Check console (F12) để xem error message chi tiết!**
