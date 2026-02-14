# AI Triggers Test Guide

## AI Message Flow (Chi tiết)

Dự án đã được cải tiến để AI gửi message đúng theo 3 trigger:

### 1. **DEATH Trigger** - Người chơi chết
- **Điều kiện**: Rơi xuống đáy map (y > canvas.height + 100)
- **AI sẽ nói**: Mỉa mai khi người chơi chết lần thứ N
- **Ví dụ**: "Lại chết rồi à?", "Dễ vậy mà không làm được?"

### 2. **IDLE Trigger** - Không nhấn phím
- **Điều kiện**: Chưa nhấn phím trong > 12 giây
- **AI sẽ nói**: Trêu chọc vì người chơi không làm gì
- **Ví dụ**: "Đang làm gì đấy?", "Ngủ rồi à?"
- **Note**: Cooldown 8 giây để tránh spam

### 3. **STUCK Trigger** - Chết nhiều lần ở cùng khu vực
- **Điều kiện**: Chết ≥ 3 lần ở cùng zone (top/mid/bottom)
- **AI sẽ nói**: Gièm pha người chơi vì không thể vượt qua  
- **Ví dụ**: "Kẹt ở đây rồi à?", "Làm sao mà chết hoài vậy?"
- **Note**: Trigger chỉ 1 lần per zone

---

## Cách Test

### Cách 1: Test DEATH Trigger

1. **Mở game** (mà không cần API - dùng hardcoded)
2. **Nhảy vài lần** để quen kiếm soát
3. **Rơi xuống đáy** (không có platform dưới)
4. **Kỳ vọng**: AI nói "Lại chết rồi à?" hoặc câu tương tự
5. **Lặp lại** 2-3 lần → AI sẽ nói messages khác nhau

**Console Log**:
```
💀 DEATH trigger: Lần chết thứ 1
[AIMessageGenerator] 💬 death: "Lại chết rồi à?"
```

### Cách 2: Test IDLE Trigger

1. **Mở game**
2. **Đứng yên** mà không nhấn phím
3. **Chờ 12+ giây**
4. **Kỳ vọng**: AI nói "Đang làm gì đấy?" hoặc tương tự
5. **Đợi 8+ giây**, rồi đứng yên tiếp → AI sẽ nói message khác

**Console Log**:
```
😴 IDLE trigger: Chưa input 12 giây
[AIMessageGenerator] 💬 idle: "Đang làm gì đấy?"
```

### Cách 3: Test STUCK Trigger

1. **Mở game**
2. **Chọn một zone** (ví dụ khu vực "bottom")
3. **Chết 3 lần ở cùng zone** bằng cách:
   - Rơi xuống → respawn → rơi xuống → respawn → rơi xuống
4. **Lần thứ 3 chết**: AI sẽ trigger STUCK message
5. **Kỳ vọng**: AI nói "Kẹt ở đây rồi à?" hoặc "Học hỏi đi chứ!"

**Console Log**:
```
🎯 STUCK trigger: Chết 3 lần ở zone bottom
[AIMessageGenerator] 💬 stuck: "Kẹt ở đây rồi à?"
```

---

## Test với API (OpenAI)

Nếu có OpenAI API key:

1. **Điền API Endpoint**: `https://api.openai.com/v1/chat/completions`
2. **Điền API Key**: `sk-...`
3. **Click "Kiểm Tra API"** → Đợi status ✅
4. **Click "Bắt Đầu Game"**
5. **Trigger AI như trên** → AI sẽ gọi OpenAI API
6. **Console Log sẽ có**:
```
[AIMessageGenerator] 🤖 AI: "Câu nói generated từ OpenAI"
```

### Fallback nếu API fail

Nếu API key sai/hết quota/timeout → AI sẽ tự động fallback về **hardcoded messages**:
```
[AIMessageGenerator] ❌ API Key sai hoặc hết hạn (401)
[AIMessageGenerator] 💬 death: "Lại chết rồi à?" (hardcoded)
```

---

## Key Points

✅ **Death Trigger**
- Trigger liền khi người chơi chết
- Mỗi lần chết = 1 message gửi
- Có cooldown 5s để tránh spam

✅ **Idle Trigger**
- Chỉ trigger khi idleTime > 12s
- Có cooldown 8s giữa các lần trigger
- Reset khi người chơi nhấn phím

✅ **Stuck Trigger**
- Trigger khi chết ≥ 3 lần ở cùng zone
- Chỉ trigger 1 lần per zone (để tránh spam)
- Reset khi chuyển sang zone khác

✅ **Zone Detection**
- `top`: y < 250
- `mid`: 250 ≤ y < 400
- `bottom`: y ≥ 400

---

## Debug Tips

1. **Mở Developer Console** (F12)
2. **Tab Console** - Xem event logs (console.log)
3. **Tab Network** - Xem API calls (nếu dùng API)
4. **Mute AI** - Click nút ở góc dưới phải để tắt AI (không trigger)
5. **Game stats** - Xem ở góc trên phải (Death Count, Idle Time)

---

## Expected Flow

```
Game Start (modal)
    ↓
[Không nhập API] → Click "Bỏ Qua"
    ↓
Game starts (hardcoded messages enabled)
    ↓
Event: Player dies → DEATH trigger → 💬 "Lại chết rồi à?"
Event: 12s idle → IDLE trigger → 💬 "Đang làm gì đấy?"
Event: Die 3x at bottom → STUCK trigger → 💬 "Kẹt ở đây rồi à?"
    ↓
Cooldown prevents spam (5s default)
    ↓
Game continues...
```

---

## Troubleshooting

### ❌ AI không nói gì
- Check Console (F12) có lỗi không
- Đã mute AI? (Click nút 🔇 để unmute)
- Đang quá spam? (Cooldown 5s)

### ❌ DEATH không trigger
- Phải rơi xuống đáy mới chết (y > 700 approx)
- Check death count tăng ở stats

### ❌ IDLE không trigger
- Phải đứng yên > 12s (check idle time ở stats)
- Đợi tiếp nếu vừa trigger (cooldown 8s)

### ❌ STUCK không trigger
- Phải chết 3 lần ở CÙNG zone
- Các zone: top/mid/bottom
- Chỉ trigger 1 lần per zone

### ❌ API error
- Check API key format (sk-...)
- Check endpoint: https://api.openai.com/v1/chat/completions
- Check key đã active/có balance
- Fallback là dùng hardcoded (tự động)

---

## Summary

| Trigger | Condition | Message Cooldown | Examples |
|---------|-----------|------------------|----------|
| DEATH | Player falls & dies | 5s | "Lại chết rồi à?" |
| IDLE | No input > 12s | 5s + 8s idle cooldown | "Đang làm gì đấy?" |
| STUCK | Die ≥3x at same zone | 5s | "Kẹt ở đây rồi à?" |

**Features:**
- ✅ API Call Logic (generateStory, generateRage)
- ✅ Error Handling (timeout, quota, invalid key)
- ✅ Graceful Fallback (hardcoded messages)
- ✅ ❌ No key storage - chỉ trong memory
- ✅ No UI disruption - messages overlay game
