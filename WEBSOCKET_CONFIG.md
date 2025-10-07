# WebSocket Configuration Guide

## 🎉 Trạng thái hiện tại (Oct 7, 2025)

**WebSocket: ✅ HOẠT ĐỘNG** - Server đang chạy trên port 3456
**HTTP API: ✅ HOẠT ĐỘNG** - REST API sẵn sàng
**HTTP Polling: ✅ FALLBACK** - Dự phòng khi WebSocket disconnect

## Vấn đề đã được sửa

1. ✅ **Fixed infinite loop**: Component không còn re-render liên tục
2. ✅ **Fixed WebSocket URL**: Sử dụng đúng protocol `wss://` 
3. ✅ **Added HTTP polling fallback**: Tự động chuyển sang polling khi WebSocket fail
4. ✅ **Mock data support**: Hiển thị mock data khi API chưa sẵn sàng
5. ✅ **Better error handling**: Thông báo lỗi rõ ràng hơn

## Các thay đổi đã thực hiện

### 1. **WebSocket Hook (`src/hooks/use-signals-websocket.ts`)**
- ✅ Sửa URL từ `ws://` sang `wss://` cho bảo mật
- ✅ Thêm logic xác định URL dựa trên môi trường (dev/prod)
- ✅ Thêm HTTP polling fallback khi WebSocket fail
- ✅ Cải thiện error messages và logging

### 2. **Vite Configuration (`vite.config.ts`)**
- ✅ Thêm proxy configuration cho WebSocket trong development
- ✅ Proxy `/ws` requests tới `wss://warning.iqx.vn`

### 3. **Signal Monitor Component (`src/components/personalized/signal-monitor.tsx`)**
- ✅ Hiển thị trạng thái kết nối (WebSocket/HTTP Polling)
- ✅ Thêm indicator cho từng loại kết nối

## Cấu hình môi trường

### Development
```bash
# Tạo file .env.local (nếu chưa có)
# WebSocket sẽ tự động sử dụng proxy qua Vite
```

### Production
```bash
# File .env.production
VITE_SIGNALS_WS_URL=wss://warning.iqx.vn/ws
```

### Custom WebSocket Server (Optional)
```bash
# Nếu bạn có WebSocket server riêng
VITE_SIGNALS_WS_URL=ws://localhost:8080/ws
```

## Tính năng mới

### HTTP Polling Fallback
- Tự động chuyển sang HTTP polling khi WebSocket fail
- Polling interval mặc định: 60 giây
- Hiển thị badge "HTTP Polling" khi sử dụng fallback

### Connection States
- **WebSocket**: Kết nối real-time qua WebSocket
- **HTTP Polling**: Fallback khi WebSocket không khả dụng
- **Lỗi kết nối**: Không thể kết nối cả WebSocket và HTTP

## Testing

### Test WebSocket Connection
```javascript
// Console browser
// Kiểm tra URL đang sử dụng
console.log(import.meta.env.VITE_SIGNALS_WS_URL || 'wss://warning.iqx.vn/ws')
```

### Monitor Connection Status
- Xem badge trạng thái trong Signal Monitor component
- Console logs sẽ hiển thị chi tiết về connection attempts

## Troubleshooting

### Lỗi "ws:// from HTTPS"
- **Nguyên nhân**: Trang HTTPS không thể kết nối WebSocket không bảo mật
- **Giải pháp**: Đã chuyển sang sử dụng `wss://`

### Lỗi "Connection timeout"
- **Nguyên nhân**: Server WebSocket không phản hồi
- **Giải pháp**: Tự động chuyển sang HTTP polling

### Lỗi "Max reconnection attempts"
- **Nguyên nhân**: Không thể kết nối sau 3 lần thử
- **Giải pháp**: Fallback sang HTTP polling (nếu enabled)

## API Reference

### useSignalsWebSocket Hook

```typescript
const {
  signals,           // Dữ liệu tín hiệu
  isConnected,      // WebSocket đã kết nối?
  isConnecting,     // Đang kết nối?
  error,            // Lỗi (nếu có)
  reconnect,        // Function để reconnect
  usingFallback     // Đang dùng HTTP polling?
} = useSignalsWebSocket(symbols, {
  enabled: true,
  interval: 60000,
  useFallbackPolling: true,
  autoReconnect: true,
  reconnectDelay: 5000
})
```

## 🚀 Server Warning đã được cấu hình

Server WebSocket đang chạy trên **port 3456** với cấu hình sau:

### Backend (Warning Server)
- **Location**: `/Users/danhtrongtran/Documents/iqx/lastest/v1/warning`
- **Port**: 3456
- **WebSocket Path**: `/ws`
- **API Base**: `http://localhost:3456/api`

### Frontend đã được cấu hình
1. ✅ **WebSocket URL**: `ws://localhost:3456/ws` (development)
2. ✅ **API URL**: `http://localhost:3456/api`
3. ✅ **WebSocket enabled**: `WEBSOCKET_ENABLED = true`
4. ✅ **Removed mock data**: Sử dụng API thật

## 📝 Kiểm tra kết nối

### Test WebSocket trực tiếp:
```javascript
// Browser console
const ws = new WebSocket('wss://warning.iqx.vn/ws');
ws.onopen = () => console.log('Connected!');
ws.onerror = (e) => console.error('Error:', e);
```

### Test API endpoint:
```bash
curl -X POST https://api.iqx.vn/api/signals \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["VNM"]}'
```

## Notes

- **WebSocket URL production**: `wss://warning.iqx.vn/ws`
- **HTTP polling endpoint**: Uses SignalsService (currently mock data)
- **Max reconnection attempts**: 3
- **Default polling interval**: 60 seconds
- **Current status**: WebSocket disabled, using mock data
