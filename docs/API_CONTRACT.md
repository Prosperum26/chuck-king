# 📋 API Contract - Chuck King

> **Tài liệu này định nghĩa interface giữa Frontend và Backend.**
> 
> ⚠️ **QUAN TRỌNG**: Mọi thay đổi API phải được cập nhật ở đây và thông báo cho team ngay lập tức!

---

## 🔗 Base URL

```
Development: http://localhost:3000
Production: (sẽ cập nhật sau)
```

---

## 📡 Endpoints

### 1. POST `/api/ai/generate`

**Mô tả**: Generate AI message dựa trên game events

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "triggerType": "death" | "idle" | "stuck",
  "context": {
    "deathCount": 5,
    "idleTime": 12.5,
    "lastDeathZone": "top" | "mid" | "bottom" | null,
    "deathZones": {
      "top": 1,
      "mid": 3,
      "bottom": 1
    }
  }
}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "message": "Câu trêu chọc từ AI",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response (Error - 400):**
```json
{
  "status": "error",
  "error": "Invalid triggerType. Must be 'death', 'idle', or 'stuck'",
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

### 2. GET `/api/health`

**Mô tả**: Health check endpoint

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

---

### 3. POST `/api/game/stats` (Future - Optional)

**Mô tả**: Lưu game statistics (nếu cần)

**Request Body:**
```json
{
  "playerId": "player-123",
  "deathCount": 10,
  "playTime": 300,
  "highestPlatform": 200
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
POST http://localhost:3000/api/ai/generate
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
curl -X POST http://localhost:3000/api/ai/generate \
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

---

## ⚠️ Breaking Changes

Nếu có breaking changes, phải:
1. Tăng version number
2. Thông báo cho tất cả team members
3. Update frontend code cùng lúc
4. Document migration guide

---

**Last Updated**: 2024-01-15
**Maintained by**: Backend Team (BE-1, BE-2)

