# 🚀 Quick Start - API Extensions Feature

Hướng dẫn nhanh để sử dụng và test tính năng API Extensions vừa được implement.

---

## 📦 Tính năng đã implement

### 1. API Usage Tracking
- Hiển thị số API calls đã sử dụng / tổng số
- Progress bar màu động (xanh → cam → đỏ)
- Cảnh báo khi sắp hết quota (≥80%)
- Alert khi hết quota (100%)

### 2. API Extension Packages
- Xem danh sách gói mở rộng
- So sánh giá và tiết kiệm
- Mua gói mở rộng
- Xem lịch sử mua hàng

### 3. Integration với AriX Pro
- Usage display trong chat sidebar
- Real-time updates
- Auto refresh

---

## 🎯 Cách sử dụng

### A. Xem API Usage (AriX Pro)

1. **Đăng nhập** vào ứng dụng
2. **Click vào AriX Pro** từ menu hoặc `/arix-pro`
3. **Xem sidebar bên phải** - Usage display hiển thị:
   - Số calls đã dùng / tổng số
   - Progress bar
   - Cảnh báo nếu sắp hết

**Screenshot locations:**
```
Sidebar phải → API Usage card
```

---

### B. Mua gói mở rộng

#### Option 1: Từ AriX Pro
1. Trong AriX Pro, click **"Mua gói mở rộng"** button trong usage card
2. Sẽ redirect đến `/api-extensions`

#### Option 2: Từ User Menu
1. Click **avatar** ở góc phải trên
2. Click **"Gói mở rộng API"** (icon Zap ⚡)
3. Hoặc dùng shortcut `⌘E` (Cmd+E trên Mac)

#### Tại trang API Extensions:
1. **Tab "Gói mở rộng"** - Xem các gói available
2. **Chọn gói** phù hợp (1K, 5K, hoặc 10K calls)
3. **Click "Mua ngay"**
4. **Xác nhận** trong dialog
5. **Success!** - Toast notification hiện lên
6. **Check "Gói đã mua"** tab để xem gói vừa mua

---

### C. Xem lịch sử mua hàng

1. Vào `/api-extensions`
2. Click tab **"Lịch sử"**
3. Xem:
   - Tổng số lần mua
   - Tổng chi tiêu
   - Chi tiết từng lần mua (date, price, calls)

---

### D. Kiểm tra gói đã mua hiện tại

1. Vào `/api-extensions`
2. Click tab **"Gói đã mua"**
3. Xem:
   - Tổng API calls đã mua thêm
   - Danh sách các extension của subscription hiện tại
   - Ngày mua, giá, payment reference

---

## 🧪 Test Scenarios

### Test 1: View Usage ✅
```
1. Login
2. Go to /arix-pro
3. Check sidebar → API Usage card present?
4. See current usage / limit?
5. Progress bar correct color?
```

### Test 2: View Packages ✅
```
1. Go to /api-extensions
2. See 3 packages?
3. Prices displayed correctly?
4. "Tiết kiệm X%" badges shown?
5. Can click "Mua ngay"?
```

### Test 3: Purchase (Mock) ✅
```
1. Click "Mua ngay" on a package
2. Dialog opens?
3. Confirm purchase
4. Success toast shows?
5. Check "Gói đã mua" tab
6. New extension appears?
```

### Test 4: View History ✅
```
1. Go to "Lịch sử" tab
2. Purchases shown?
3. Total spent correct?
4. Dates correct?
```

### Test 5: Warning States ✅
```
Scenario A: Normal (< 80%)
- Green progress bar
- No warning

Scenario B: Near limit (80-99%)
- Orange progress bar
- Warning message shown

Scenario C: At limit (100%)
- Red progress bar
- Error alert shown
- Strong CTA to buy extension
```

### Test 6: Responsive ✅
```
1. Desktop (> 1024px)
   - 3 columns grid
   - Full sidebar

2. Tablet (768px - 1024px)
   - 2 columns grid
   - Responsive cards

3. Mobile (< 768px)
   - 1 column grid
   - Stacked layout
```

### Test 7: Dark Mode ✅
```
1. Toggle dark mode
2. All colors adapt?
3. Gradients visible?
4. Text readable?
```

---

## 🎨 UI Elements

### Colors Used

#### Status Colors (Usage)
- 🟢 **Green** (`bg-green-500`) - Normal usage (< 80%)
- 🟠 **Orange** (`bg-orange-500`) - Warning (80-99%)
- 🔴 **Red** (`bg-red-500`) - At limit (100%)

#### Brand Colors
- 🟣 **Purple** (`from-purple-500 to-indigo-600`) - Primary brand
- 🟡 **Yellow** (`from-yellow-500`) - Premium/Extensions
- 🔵 **Blue** (`from-blue-500`) - Info/Current

#### Package Cards
- Gói 1K: Standard card
- Gói 5K: With "Tiết kiệm 20%" badge
- Gói 10K: With "Tiết kiệm 30%" badge

---

## 📱 Pages & Routes

### New Routes Added
```
/api-extensions         → API Extensions page (protected)
```

### Existing Routes Updated
```
/arix-pro              → Now shows usage display
```

### Menu Items
```
User Menu → Gói mở rộng API (⌘E)
```

---

## 🔧 Configuration

### Environment Variables
```bash
# .env
VITE_BASE_API=http://localhost:3000/api
```

### Development Server
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
http://localhost:5173
```

---

## 📂 File Structure

```
dashboard/
├── src/
│   ├── types/
│   │   ├── api-extension.ts          # ✨ NEW
│   │   └── subscription.ts           # ✏️ UPDATED
│   ├── services/
│   │   └── api-extension.service.ts  # ✨ NEW
│   ├── hooks/
│   │   └── use-api-extensions.ts     # ✨ NEW
│   ├── components/
│   │   ├── charts/
│   │   │   └── api-usage-display.tsx # ✨ NEW
│   │   ├── chatbot/
│   │   │   └── AriXProChatbot.tsx    # ✏️ UPDATED
│   │   └── layout/
│   │       └── user-button.tsx       # ✏️ UPDATED
│   ├── pages/
│   │   └── api-extensions.tsx        # ✨ NEW
│   └── main.tsx                      # ✏️ UPDATED
├── FRONTEND_IMPLEMENTATION.md        # ✨ NEW
├── IMPLEMENTATION_CHECKLIST.md       # ✨ NEW
└── QUICK_START.md                    # ✨ NEW (this file)
```

---

## 🐛 Troubleshooting

### Issue: "No packages shown"
**Solution:** Check backend API is running at `http://localhost:3000`

### Issue: "401 Unauthorized"
**Solution:** Login again, JWT token expired

### Issue: "Purchase fails"
**Solution:** 
1. Check if you have active subscription
2. Check backend logs
3. Verify payment integration

### Issue: "Usage not updating"
**Solution:**
1. Refresh the page
2. Check React Query dev tools
3. Clear cache and reload

### Issue: "Styles not working"
**Solution:**
1. Check Tailwind is working
2. Verify dark mode toggle
3. Clear browser cache

---

## 📊 Backend Requirements

### Required Endpoints
```
✅ GET  /api/api-extensions/packages
✅ GET  /api/api-extensions/packages/:id
✅ POST /api/api-extensions/purchase
✅ GET  /api/api-extensions/my-extensions
✅ GET  /api/api-extensions/history
✅ GET  /api/chat/usage
```

### Expected Response Formats

#### GET /api/api-extensions/packages
```json
[
  {
    "id": "uuid",
    "name": "Gói Mở Rộng 1K",
    "description": "...",
    "additionalCalls": 1000,
    "price": 49000,
    "currency": "VND",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### POST /api/api-extensions/purchase
```json
{
  "success": true,
  "message": "...",
  "extension": { ... },
  "newLimit": 6000,
  "remaining": 5020
}
```

#### GET /api/chat/usage
```json
{
  "currentUsage": 450,
  "limit": 1000,
  "remaining": 550,
  "resetDate": "2025-11-05T00:00:00.000Z"
}
```

---

## ✅ Quick Checklist

Before testing, ensure:
- [ ] Backend API running on port 3000
- [ ] Frontend dev server running on port 5173
- [ ] User is logged in
- [ ] User has active subscription (for purchase)
- [ ] Database has seeded extension packages
- [ ] `.env` has correct `VITE_BASE_API`

---

## 🎓 Key Concepts

### API Extensions vs Subscriptions
- **Subscription**: Gói chính (Cơ Bản, Chuyên Nghiệp, etc.)
- **Extension**: Gói mở rộng thêm API calls cho subscription hiện tại
- Extensions chỉ áp dụng cho subscription ACTIVE hiện tại
- Khi gia hạn subscription → extensions reset

### API Limits
- **apiLimit**: Limit gốc từ subscription package
- **apiCallsLimit**: Total limit (apiLimit + extensions)
- **apiCallsUsed**: Số calls đã dùng
- **remaining**: apiCallsLimit - apiCallsUsed

### Purchase Flow
```
User có subscription active
  ↓
Mua extension package
  ↓
apiCallsLimit += additionalCalls
  ↓
User có thể dùng thêm calls
  ↓
Khi gia hạn subscription
  ↓
apiCallsLimit reset về apiLimit gốc
```

---

## 🚀 Next Steps

1. **Test tất cả scenarios** trong phần Test Scenarios
2. **Kiểm tra responsive** trên mobile/tablet
3. **Toggle dark mode** và verify
4. **Test error cases** (network error, 401, etc.)
5. **Integrate payment gateway** (PayOS) - for production

---

## 📞 Support

Nếu có vấn đề:
1. Check [FRONTEND_IMPLEMENTATION.md](./FRONTEND_IMPLEMENTATION.md) - Chi tiết implementation
2. Check [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) - Checklist đầy đủ
3. Check backend API docs in `../api/` folder
4. Check browser console for errors
5. Check React Query dev tools

---

**Happy Testing! 🎉**

**Version:** 1.0.0  
**Last Updated:** October 5, 2025  
**Status:** ✅ Ready to Use

