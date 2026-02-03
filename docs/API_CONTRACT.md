# 📋 API Contract - Chuck King

> **Tài liệu này định nghĩa interface giữa game (frontend) và các API bên ngoài (AI endpoint, Firebase database API).**
> 
> ⚠️ **QUAN TRỌNG**: Mọi thay đổi API phải được cập nhật ở đây và thông báo cho team ngay lập tức!

---

## 🔗 API endpoints được cấu hình như thế nào?

Game hiện chạy dạng **static site** (host GitHub Pages). Vì vậy:

- **Không được để API key bí mật (OpenAI key, service key, …) trong frontend**.
- Nếu cần gọi AI “thật”, bắt buộc gọi thông qua **backend endpoint** (Firebase Cloud Functions/Cloud Run/…).

### Client config (frontend)

Frontend sẽ cấu hình endpoint trong `js/config.js` (file này **KHÔNG commit**):

```js
export const API_CONFIG = {
  endpoint: "https://<YOUR-AI-ENDPOINT>", // full URL tới AI taunt endpoint
  apiKey: null, // KHÔNG khuyến nghị dùng ở frontend (để null)
  model: null
};
```

---

## 📡 Endpoints

### 1. POST `<AI_ENDPOINT>` (AI Taunt)

**Mô tả**: Generate AI taunt message dựa trên game events/context.

**Ví dụ AI_ENDPOINT:**
- Firebase HTTP Function: `https://<region>-<project>.cloudfunctions.net/api/ai/generate`
- Cloud Run: `https://<service>-<hash>-<region>.a.run.app/api/ai/generate`

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "triggerType": "death" | "idle" | "stuck" | "fall_high" | "death_streak",
  "context": {
    "deathCount": 5,
    "idleTime": 12.5,
    "lastDeathZone": "top" | "mid" | "bottom" | null,
    "deathZones": {
      "top": 1,
      "mid": 3,
      "bottom": 1
    },
    "deathStreak": 3,
    "highestHeight": 420,
    "currentHeight": 120,
    "lastProgressAtMs": 1700000000000
  }
}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Câu trêu chọc từ AI",
  "timestamp": "2026-02-03T10:30:00Z"
}
```

**Response (Error - 400):**
```json
{
  "status": "error",
  "error": "Invalid triggerType",
  "code": "INVALID_TRIGGER"
}
```

**Response (Error - 500):**
```json
{
  "status": "error",
  "error": "Internal server error",
  "code": "SERVER_ERROR"
}
```

**Response (Error - 503):**
```json
{
  "status": "error",
  "error": "AI service unavailable",
  "code": "AI_SERVICE_DOWN"
}
```

---

### 2. GET `/api/health` (Optional)

**Mô tả**: Health check endpoint (tuỳ backend triển khai có hay không).

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-02-03T10:30:00Z",
  "version": "1.0.0"
}
```

---

### 3. POST `/api/game/stats` (Optional - Firebase)

**Mô tả**: Lưu game statistics (dùng Firebase/DB).

**Request Body:**
```json
{
  "playerId": "player-123", 
  "sessionId": "session-uuid",
  "deathCount": 10,
  "playTimeSec": 300,
  "bestHeight": 200,
  "totalFallsFromBest": 2
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Stats saved"
}
```

---

## 🔄 Error Handling

### Standard Error Format

Tất cả error responses đều follow format:
```json
{
  "status": "error",
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid API key)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `503` - Service Unavailable (AI service down)

---

## 🧪 Testing

### Test với Postman/Thunder Client

**Collection Example:**
```json
POST <AI_ENDPOINT>
Content-Type: application/json

{
  "triggerType": "death",
  "context": {
    "deathCount": 5,
    "idleTime": 0,
    "lastDeathZone": "mid",
    "deathZones": {
      "top": 1,
      "mid": 3,
      "bottom": 1
    }
  }
}
```

### Test với cURL

```bash
curl -X POST "<AI_ENDPOINT>" \
  -H "Content-Type: application/json" \
  -d '{
    "triggerType": "death",
    "context": {
      "deathCount": 5,
      "idleTime": 0,
      "lastDeathZone": "mid",
      "deathZones": {"top": 1, "mid": 3, "bottom": 1}
    }
  }'
```

---

## 📝 Changelog

### Version 1.0.0 (2024-01-15)
- Initial API contract
- `/api/ai/generate` endpoint
- `/api/health` endpoint

### Version 1.1.0 (2026-02-03)
- Updated to static hosting model (GitHub Pages) + external API endpoints
- Extended triggerType and context for upcoming rage metrics

---

## ⚠️ Breaking Changes

Nếu có breaking changes, phải:
1. Tăng version number
2. Thông báo cho tất cả team members
3. Update frontend code cùng lúc
4. Document migration guide

---

**Last Updated**: 2026-02-03  
**Maintained by**: Subteam 3 (Backend & API)

