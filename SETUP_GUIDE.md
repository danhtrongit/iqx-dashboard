# 🚀 Hướng dẫn Setup & Khởi động dự án IQX

## 📋 Tổng quan

Dự án bao gồm 2 phần:
1. **Dashboard** (Frontend) - React + Vite tại port 5173
2. **Warning** (Backend WebSocket + API) - Express + WebSocket tại port 3456

## ✅ Các vấn đề đã được khắc phục

### Vấn đề ban đầu:
- ❌ WebSocket không kết nối được
- ❌ URL sai: `ws://localhost:5173/warning.iqx.vn`
- ❌ Infinite loop re-render
- ❌ Server warning chưa chạy
- ❌ Frontend dùng mock data

### Giải pháp:
- ✅ Khởi động server warning trên port 3456
- ✅ Sửa URL WebSocket: `ws://localhost:3456/ws`
- ✅ Fix dependencies để tránh infinite loop
- ✅ Bật WebSocket (`WEBSOCKET_ENABLED = true`)
- ✅ Chuyển sang sử dụng API thật

## 🛠️ Cài đặt & Khởi động

### 1. Khởi động Backend (Warning Server)

```bash
# Terminal 1 - Backend
cd /Users/danhtrongtran/Documents/iqx/lastest/v1/warning

# Cài đặt dependencies (nếu chưa có)
pnpm install

# Khởi động server
pnpm run dev
```

**Kiểm tra server đã chạy:**
```bash
curl http://localhost:3456
# Nên trả về JSON với API info
```

### 2. Khởi động Frontend (Dashboard)

```bash
# Terminal 2 - Frontend
cd /Users/danhtrongtran/Documents/iqx/lastest/v1/dashboard

# Cài đặt dependencies (nếu chưa có)
pnpm install

# Khởi động dev server
pnpm run dev
```

**Truy cập:** http://localhost:5173

## 🔍 Kiểm tra kết nối

### Test WebSocket

Mở file test: `test-websocket.html` trong browser hoặc:

```javascript
// Browser Console
const ws = new WebSocket('ws://localhost:3456/ws');
ws.onopen = () => console.log('✅ Connected');
ws.onmessage = (e) => console.log('📨', JSON.parse(e.data));
ws.send(JSON.stringify({
  action: 'subscribe',
  symbols: ['VNM', 'VIC'],
  interval: 60000
}));
```

### Test REST API

```bash
# Test signals API
curl -X POST http://localhost:3456/api/signals \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["VNM", "VIC"]}'
```

### Test trong Dashboard

1. Mở http://localhost:5173
2. Đăng nhập và navigate đến Signal Monitor
3. Kiểm tra console:
   - `🔌 Attempting to connect to WebSocket`
   - `✅ Connected to IQX Signal WebSocket`
   - `📊 Received X signals`
4. Xem badge kết nối hiển thị "WebSocket" hoặc "HTTP Polling"

## 📊 Cấu trúc WebSocket Messages

### Client → Server

**Subscribe:**
```json
{
  "action": "subscribe",
  "symbols": ["VNM", "VIC", "HPG"],
  "interval": 60000
}
```

**Unsubscribe:**
```json
{
  "action": "unsubscribe",
  "symbols": ["VNM"]
}
```

**Get Subscriptions:**
```json
{
  "action": "getSubscriptions"
}
```

### Server → Client

**Connected:**
```json
{
  "type": "connected",
  "message": "Connected to IQX Real-Time Signal WebSocket",
  "timestamp": "2025-10-07T10:00:00.000Z"
}
```

**Subscribed:**
```json
{
  "type": "subscribed",
  "symbols": ["VNM", "VIC"],
  "interval": 60000,
  "message": "Subscribed to 2 symbols"
}
```

**Signals Data:**
```json
{
  "type": "signals",
  "timestamp": "2025-10-07T10:00:00.000Z",
  "data": [
    {
      "symbol": "VNM",
      "price": 85000,
      "indicators": {
        "ema20": 84000,
        "ema50": 83000,
        "ema200": 82000,
        "rsi": 65,
        "macd": { "macd": 500, "signal": 400, "histogram": 100 },
        "return1D": 2.5
      },
      "analysis": {
        "trend": "UPTREND",
        "strength": "STRONG",
        "signals": {
          "xuHuongTang": true,
          "suyYeu": false,
          "tinHieuBan": false,
          "quaMua": false,
          "quaBan": false
        },
        "conditions": { /* ... */ }
      },
      "priceVsEMA20": 1.19,
      "priceVsEMA50": 2.41,
      "timestamp": "2025-10-07T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

## 🔧 Configuration Files

### Frontend (`dashboard/src/hooks/use-signals-websocket.ts`)

```typescript
// Line 56: WebSocket is enabled
const WEBSOCKET_ENABLED = true

// Line 67: Development WebSocket URL
return 'ws://localhost:3456/ws'
```

### Frontend API (`dashboard/src/services/signals.service.ts`)

```typescript
// Line 9: API base URL
const API_BASE_URL = "http://localhost:3456/api"
```

### Backend (`warning/src/server.ts`)

```typescript
// Line 429: Server port
const PORT = process.env.PORT || 3456

// Line 10: WebSocket path
const wss = new WebSocketServer({ server, path: "/ws" })
```

## 🚨 Troubleshooting

### WebSocket không kết nối

**Kiểm tra:**
1. Server warning có đang chạy không?
   ```bash
   lsof -i :3456
   ```
2. URL có đúng không? `ws://localhost:3456/ws`
3. Browser console có lỗi gì?

**Fix:**
```bash
# Restart warning server
cd /Users/danhtrongtran/Documents/iqx/lastest/v1/warning
pkill -f "tsx src/server.ts"
pnpm run dev
```

### API trả về lỗi 404

**Kiểm tra base URL trong `signals.service.ts`:**
```typescript
const API_BASE_URL = "http://localhost:3456/api" // Đúng
// NOT: "https://api.iqx.vn/api"
```

### Infinite loop / Re-render liên tục

Đã được fix bằng cách:
- Giảm dependencies trong `useCallback`
- Chỉ re-run effect khi `enabled` thay đổi
- Check polling state trước khi start

### Component hiển thị "HTTP Polling" thay vì "WebSocket"

**Nguyên nhân:**
- WebSocket đã disconnect
- Server không phản hồi trong thời gian timeout
- Auto fallback sang HTTP polling

**Giải pháp:**
1. Click button "Kết nối lại"
2. Hoặc tự động reconnect sau 5s

## 📝 Development Notes

### Ports
- **Frontend (Dashboard)**: 5173
- **Backend (Warning)**: 3456

### Auto-reconnect
- Max attempts: 3
- Delay: 5 seconds
- Auto fallback to HTTP polling nếu fail

### Polling Interval
- Default: 60 seconds (60000ms)
- Có thể config khi subscribe

## 🎯 Next Steps

Khi deploy production:

1. **Update WebSocket URL** trong `use-signals-websocket.ts`:
   ```typescript
   // Line 71: Production URL
   return 'wss://warning.iqx.vn/ws'
   ```

2. **Update API Base URL** trong `signals.service.ts`:
   ```typescript
   const API_BASE_URL = process.env.VITE_SIGNALS_API_URL || "https://warning.iqx.vn/api"
   ```

3. **Environment Variables** (`.env.production`):
   ```bash
   VITE_SIGNALS_WS_URL=wss://warning.iqx.vn/ws
   VITE_SIGNALS_API_URL=https://warning.iqx.vn/api
   ```

4. **Deploy warning server** với PM2:
   ```bash
   cd warning
   pnpm run build
   pnpm run pm2:start
   ```

## 📚 Documentation

- **API Reference**: http://localhost:3456/api/docs
- **WebSocket Test**: Open `test-websocket.html` in browser
- **Config Guide**: `WEBSOCKET_CONFIG.md`

## ✅ Checklist Setup

- [ ] Cài đặt dependencies cho cả 2 projects
- [ ] Khởi động warning server (port 3456)
- [ ] Khởi động dashboard (port 5173)
- [ ] Test WebSocket connection (test-websocket.html)
- [ ] Test API endpoint (curl command)
- [ ] Verify trong dashboard Signal Monitor
- [ ] Check browser console không có lỗi

---

**Last Updated**: Oct 7, 2025
**Status**: ✅ Both servers running and connected successfully

