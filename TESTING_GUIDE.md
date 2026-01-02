# Testing Guide - IoT Room Access Control System

## 🧪 Manual Testing Scenarios

### Scenario 1: Grant and Revoke Access

**Setup:**
- Backend running on localhost:5000
- Frontend running on localhost:5173
- Logged into the system

**Steps:**
1. Click "🔐 Room Access" in navigation
2. Select "Conference Room A" from left panel
3. In center panel, scroll to "Grant Access" section
4. Find "John Doe" and click "Grant"
   - ✅ Toast: "✓ Access granted to John Doe"
   - ✅ John Doe moves to "Users With Access"
5. Click "Revoke" next to John Doe
   - ✅ Toast: "✓ Access revoked from John Doe"
   - ✅ John Doe moves back to "Grant Access"

**Expected Result:** All operations succeed with toast confirmations

---

### Scenario 2: Create New User

**Steps:**
1. Go to "🔐 Room Access" page
2. In right panel, fill in:
   - Name: "Alice Cooper"
   - Email: "alice@iot.com"
3. Click "Create User"
   - ✅ Toast: "✓ User "Alice Cooper" created successfully"
   - ✅ Alice appears in user list
4. Grant Alice access to any room
   - ✅ Works immediately

**Expected Result:** New user created and available for room access

---

### Scenario 3: Create New Room

**Steps:**
1. Go to "🔐 Room Access" page
2. Click "+ New Room" in left panel
3. Fill in:
   - Room name: "Dev Lab"
   - Location: "Building 3, Floor 1"
   - Capacity: "15"
4. Click "Create"
   - ✅ Toast: "✓ Room "Dev Lab" created successfully"
   - ✅ Room appears in room list
5. Click on new room to select it
   - ✅ All users available for access grant
   - ✅ No initial users have access

**Expected Result:** New room created and fully functional

---

### Scenario 4: View Activity Logs

**Steps:**
1. Go to "🔐 Room Access" page
2. Select "Lab Room B"
3. Click "📋 Activity Log" tab
4. Review log entries:
   - ✅ Shows past grant/revoke actions
   - ✅ Each entry has timestamp
   - ✅ Action type clearly labeled
   - ✅ Subject/user name shown
5. Perform a new grant/revoke action
6. Return to Activity Log
   - ✅ New entry appears at top

**Expected Result:** Activity logs display correctly with new entries updating in real-time

---

### Scenario 5: MQTT Notifications

**Test 1 - Monitor Backend**
1. Start backend, watch console
2. In another terminal, publish test message:
   ```bash
   mosquitto_pub -h broker.mqttdashboard.com -t /iot/room/enter -m '{"subject":"Device001"}'
   ```
3. Check backend console
   - ✅ Message printed: "📩 Message received on /iot/room/enter"
   - ✅ Subject extracted: "Device001"

**Test 2 - Frontend Notification**
1. Backend running with MQTT connected
2. Frontend open to any page
3. Publish MQTT message:
   ```bash
   mosquitto_pub -h broker.mqttdashboard.com -t /iot/room/enter -m '{"subject":"TestUser123"}'
   ```
4. Within 2 seconds
   - ✅ Blue toast appears bottom-right
   - ✅ Message: "🚪 Room Entry: TestUser123"
   - ✅ Toast auto-dismisses after 3 seconds

**Expected Result:** MQTT messages properly received, logged, and displayed

---

### Scenario 6: Navigation and Page Switching

**Steps:**
1. Frontend home page → Dashboard
   - ✅ Shows system overview
   - ✅ KPI cards visible
   - ✅ Map visualization present
2. Click "🔐 Room Access" button
   - ✅ Switches to Room Access page
   - ✅ Three-panel layout loads
   - ✅ Room list populated
3. Click "📊 Dashboard" button
   - ✅ Switches back to dashboard
   - ✅ State preserved (can switch back/forth)

**Expected Result:** Navigation works smoothly, pages load correctly

---

## 🔧 API Testing with cURL

### Test 1: Get All Rooms

```bash
curl http://localhost:5000/api/rooms | jq
```

**Expected Response:**
```json
[
  {
    "id": "room-001",
    "name": "Conference Room A",
    "location": "Building 1, Floor 2",
    "capacity": 20,
    "users_with_access": ["2", "3"]
  },
  ...
]
```

---

### Test 2: Get All Users

```bash
curl http://localhost:5000/api/users | jq
```

**Expected Response:**
```json
[
  {
    "id": "1",
    "name": "Admin User",
    "email": "admin@iot.com",
    "role": "admin"
  },
  ...
]
```

---

### Test 3: Grant Access

```bash
curl -X POST http://localhost:5000/api/access/grant \
  -H "Content-Type: application/json" \
  -d '{"room_id": "room-001", "user_id": "4"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Access granted successfully",
  "room_id": "room-001",
  "user_id": "4"
}
```

---

### Test 4: Check Access

```bash
curl -X POST http://localhost:5000/api/access/check \
  -H "Content-Type: application/json" \
  -d '{"room_id": "room-001", "user_id": "2"}'
```

**Expected Response:**
```json
{
  "room_id": "room-001",
  "user_id": "2",
  "has_access": true
}
```

---

### Test 5: Get Room Access List

```bash
curl http://localhost:5000/api/rooms/room-002/access | jq
```

**Expected Response:**
```json
{
  "room_id": "room-002",
  "room_name": "Lab Room B",
  "users": [
    {"id": "2", "name": "John Doe", ...},
    {"id": "3", "name": "Jane Smith", ...},
    {"id": "4", "name": "Bob Johnson", ...}
  ],
  "count": 3
}
```

---

### Test 6: Get Logs

```bash
curl "http://localhost:5000/api/logs/access?limit=5" | jq
```

**Expected Response:** Array of recent access log entries

---

### Test 7: Get Notifications

```bash
curl "http://localhost:5000/api/notifications?limit=5" | jq
```

**Expected Response:** Array of MQTT notifications received

---

## ❌ Error Testing

### Test Error 1: Grant Access to Non-existent User

```bash
curl -X POST http://localhost:5000/api/access/grant \
  -H "Content-Type: application/json" \
  -d '{"room_id": "room-001", "user_id": "999"}'
```

**Expected:**
- Status: 400 Bad Request
- Response: `{"error": "User not found"}`
- UI Toast: Red error message

---

### Test Error 2: Grant Access to Non-existent Room

```bash
curl -X POST http://localhost:5000/api/access/grant \
  -H "Content-Type: application/json" \
  -d '{"room_id": "room-999", "user_id": "2"}'
```

**Expected:**
- Status: 400 Bad Request
- Response: `{"error": "Room not found"}`
- UI Toast: Red error message

---

### Test Error 3: Revoke Non-existent Access

```bash
curl -X POST http://localhost:5000/api/access/revoke \
  -H "Content-Type: application/json" \
  -d '{"room_id": "room-001", "user_id": "4"}'
```

**Expected:**
- Status: 400 Bad Request
- Response: `{"error": "User does not have access"}`
- UI Toast: Red error message

---

### Test Error 4: Missing Required Fields

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User"}'
```

**Expected:**
- Status: 400 Bad Request
- Response: Error about missing email field

---

## 🎨 UI Component Testing

### Toast Component Tests

1. **Success Toast**
   - Action: Grant access
   - ✅ Green toast appears
   - ✅ Green checkmark icon
   - ✅ Appropriate message
   - ✅ Auto-dismisses

2. **Error Toast**
   - Action: Try to grant access to non-existent user
   - ✅ Red toast appears
   - ✅ Red X icon
   - ✅ Error message displayed
   - ✅ Auto-dismisses

3. **Warning Toast**
   - Action: Try form submission with empty fields
   - ✅ Orange toast appears
   - ✅ Orange warning icon
   - ✅ Clear message

4. **Info Toast**
   - Trigger: MQTT room entry message
   - ✅ Blue toast appears
   - ✅ Blue info icon
   - ✅ Shows subject/timestamp

---

### Navigation Testing

1. **Active State**
   - ✅ Active page button highlighted
   - ✅ Gradient background
   - ✅ Neon glow effect

2. **Hover Effects**
   - ✅ Non-active buttons respond to hover
   - ✅ Background color changes
   - ✅ Border color changes

3. **Page Transitions**
   - ✅ Smooth transitions between pages
   - ✅ No flickering
   - ✅ Content loads properly

---

### Room Access Panel Testing

1. **Left Panel (Rooms)**
   - ✅ List scrolls for many rooms
   - ✅ Selection highlight visible
   - ✅ Stats (user count, capacity) show

2. **Center Panel (Details)**
   - ✅ Room info displays correctly
   - ✅ Tabs switch smoothly
   - ✅ User lists update in real-time
   - ✅ Buttons properly enable/disable

3. **Right Panel (Users)**
   - ✅ User list scrolls for many users
   - ✅ User avatars display correctly
   - ✅ Form inputs work properly

---

## 📊 Performance Testing

### Test 1: Large User List
- Create 50 users
- ✅ UI remains responsive
- ✅ Scrolling is smooth
- ✅ No lag when selecting

### Test 2: Large Room List
- Create 20 rooms
- ✅ List loads quickly
- ✅ Room access updates fast
- ✅ No UI freezing

### Test 3: Rapid Operations
- Grant/revoke access 10 times rapidly
- ✅ All operations complete successfully
- ✅ Logs updated correctly
- ✅ No data loss

---

## 🔐 Security Testing

### Test 1: XSS Prevention
- Create user with name: `<script>alert('xss')</script>`
- ✅ Script not executed
- ✅ Text displayed literally

### Test 2: CORS Testing
- Verify API responds to frontend requests
- ✅ No CORS errors in console
- ✅ Requests complete successfully

---

## ✅ Checklist for Full Testing

- [ ] All grant/revoke operations work
- [ ] User creation works
- [ ] Room creation works
- [ ] Activity logs display and update
- [ ] MQTT notifications appear as toasts
- [ ] Navigation switches pages correctly
- [ ] Toast notifications show for all actions
- [ ] Error messages display properly
- [ ] API endpoints respond correctly
- [ ] No console errors
- [ ] No network errors
- [ ] Responsive design works
- [ ] All buttons are clickable
- [ ] Forms validate properly
- [ ] Data persists through page refreshes*

*Note: In-memory database resets on server restart

---

## 🐛 Common Issues & Solutions

### Issue: "Connection refused" on API calls
**Solution:** Make sure backend is running on port 5000
```bash
cd back && python app.py
```

### Issue: MQTT notifications not appearing
**Solution:** Check backend is connected to broker
- Look for "✅ Connected to MQTT Broker" in backend logs
- Try publishing test message

### Issue: Toast notifications not showing
**Solution:** Check browser console for JavaScript errors
- Should see "🔔 MQTT Message Handler called" when message arrives

### Issue: Room/User list not loading
**Solution:** Check network tab in browser dev tools
- Should see successful GET requests to `/api/rooms` and `/api/users`

---

## 🎓 What to Test First

1. **Core Functionality** (5 min)
   - Grant access
   - Revoke access
   - View access list

2. **CRUD Operations** (5 min)
   - Create user
   - Create room
   - View all items

3. **Activity Log** (3 min)
   - Perform action
   - Check logs updated

4. **Notifications** (5 min)
   - Publish MQTT message
   - Verify toast appears

5. **Error Handling** (3 min)
   - Try invalid operations
   - Verify error messages

---

**Total Testing Time**: ~20 minutes for complete validation

All tests should pass without errors! ✅
