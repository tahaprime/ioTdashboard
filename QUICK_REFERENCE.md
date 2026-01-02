# 🎯 Quick Reference Guide

## 🚀 Start Here (60 seconds)

### 1. Install Dependencies
```bash
npm install && npm run backend-install
```

### 2. Start Backend (Terminal 1)
```bash
cd back && python app.py
```
Expected output: `✅ Connected to MQTT Broker`

### 3. Start Frontend (Terminal 2)
```bash
npm run dev
```
Expected output: `Local: http://localhost:5173`

### 4. Open Browser
```
http://localhost:5173
```

✅ **You're ready to go!**

---

## 📚 Key Files

| File | Purpose | Location |
|------|---------|----------|
| `app.py` | Flask API server | `back/` |
| `database.py` | In-memory data store | `back/` |
| `mqtt_client.py` | MQTT connection | `back/` |
| `RoomAccessManagement.jsx` | Access control UI | `src/components/` |
| `Toast.jsx` | Notifications | `src/components/` |
| `App.jsx` | Main app & routing | `src/` |

---

## 🎮 Features Quick Demo

### Grant Room Access
1. Click `🔐 Room Access` in navbar
2. Select room from left panel
3. Click `Grant` next to any user
4. ✅ Toast confirms, user list updates

### Create New User
1. Go to `🔐 Room Access` page
2. Right panel: Enter name and email
3. Click `Create User`
4. ✅ User appears in list

### View Room Logs
1. Go to `🔐 Room Access` page
2. Select room
3. Click `📋 Activity Log` tab
4. See all grant/revoke/entry events

### Test MQTT
```bash
mosquitto_pub -h broker.mqttdashboard.com -t /iot/room/enter -m '{"subject":"Test"}'
```
✅ Toast notification appears in bottom-right

---

## 🔌 API Quick Reference

### Users
```bash
# List users
curl http://localhost:5000/api/users

# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com"}'
```

### Rooms
```bash
# List rooms
curl http://localhost:5000/api/rooms

# Get room access list
curl http://localhost:5000/api/rooms/room-001/access
```

### Access Control
```bash
# Grant access
curl -X POST http://localhost:5000/api/access/grant \
  -H "Content-Type: application/json" \
  -d '{"room_id":"room-001","user_id":"2"}'

# Revoke access
curl -X POST http://localhost:5000/api/access/revoke \
  -H "Content-Type: application/json" \
  -d '{"room_id":"room-001","user_id":"2"}'

# Check access
curl -X POST http://localhost:5000/api/access/check \
  -H "Content-Type: application/json" \
  -d '{"room_id":"room-001","user_id":"2"}'
```

### Notifications
```bash
# Get MQTT notifications
curl http://localhost:5000/api/notifications

# Get latest notification
curl http://localhost:5000/api/notifications/latest
```

---

## 👥 Default Users

| ID | Name | Email | Role |
|---|---|---|---|
| 1 | Admin User | admin@iot.com | admin |
| 2 | John Doe | john@iot.com | user |
| 3 | Jane Smith | jane@iot.com | user |
| 4 | Bob Johnson | bob@iot.com | user |

---

## 🚪 Default Rooms

| ID | Name | Location | Capacity | Access |
|---|---|---|---|---|
| room-001 | Conference Room A | Building 1, Floor 2 | 20 | Users 2,3 |
| room-002 | Lab Room B | Building 2, Floor 3 | 50 | Users 2,3,4 |
| room-003 | Meeting Room C | Building 1, Floor 1 | 10 | User 3 |

---

## 🎨 UI Navigation

```
Home Page
├── 📊 Dashboard
│   ├── Status Bar
│   ├── KPI Cards
│   ├── Map Visualization
│   ├── Analytics Charts
│   └── Alert Ticker
│
└── 🔐 Room Access
    ├── Left: Room Selection
    ├── Center: Access Control
    │   ├── Users With Access
    │   ├── Grant Access
    │   └── Activity Log
    └── Right: User Management
```

---

## ⚙️ Configuration

### Backend (.env)
```env
MQTT_BROKER=broker.mqttdashboard.com
MQTT_PORT=1883
MQTT_TOPIC_ENTER=/iot/room/enter
MQTT_TOPIC_EXIT=/iot/room/exit
API_HOST=0.0.0.0
API_PORT=5000
```

### Frontend
API automatically targets: `http://localhost:5000/api`

---

## 🔐 Security Features

✅ CORS enabled for frontend  
✅ Input validation on backend  
✅ Error handling for all operations  
✅ Activity logging for audit trails  
✅ Safe MQTT message parsing  

**For production, add:**
- JWT authentication
- User roles & permissions
- HTTPS/SSL
- Real database
- Rate limiting

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check port 5000 is free, Python installed |
| API calls fail | Ensure backend running, check CORS |
| No MQTT notifications | Check broker connection in logs |
| Toasts not showing | Check browser console for JS errors |
| UI not loading | Clear browser cache, check Vite running |

---

## 📊 Database Structure

### Users Table
```json
{
  "1": {
    "id": "1",
    "name": "Admin User",
    "email": "admin@iot.com",
    "role": "admin"
  }
}
```

### Rooms Table
```json
{
  "room-001": {
    "id": "room-001",
    "name": "Conference Room A",
    "location": "Building 1, Floor 2",
    "capacity": 20,
    "owner_id": "1"
  }
}
```

### Access Control
```json
{
  "room-001": ["2", "3"],  // User IDs with access
  "room-002": ["2", "3", "4"]
}
```

---

## 📦 Project Stats

- **Total Files**: 29 new/updated
- **Lines of Code**: 3000+
- **API Endpoints**: 18+
- **React Components**: 10+
- **Features**: 15+

---

## 📝 Documentation Files

| Document | Purpose |
|----------|---------|
| `FULLSTACK_SETUP.md` | Detailed setup & usage |
| `PROJECT_COMPLETION_SUMMARY.md` | Feature overview |
| `TESTING_GUIDE.md` | Manual testing scenarios |
| `ARCHITECTURE.md` | System design & flows |
| `FILES_MANIFEST.md` | Complete file listing |
| This file | Quick reference |

---

## 🔗 Important Links

- **Frontend**: http://localhost:5173
- **API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api
- **MQTT Broker**: broker.mqttdashboard.com:1883

---

## 💡 Pro Tips

1. **Keep backend terminal visible** to see MQTT connections
2. **Test MQTT with mosquitto_pub** for debugging
3. **Check browser DevTools** → Network tab for API issues
4. **Use browser DevTools** → Console for JavaScript errors
5. **Reload page** after making backend changes

---

## 🚀 Next Steps

After setup works:

1. ✅ Test grant/revoke access
2. ✅ Create new users/rooms
3. ✅ Send MQTT test message
4. ✅ Check activity logs
5. ✅ Explore API endpoints
6. ✅ Customize styling
7. ✅ Add real database
8. ✅ Deploy to production

---

## 📞 Need Help?

1. Check **TROUBLESHOOTING** section above
2. Read **TESTING_GUIDE.md** for examples
3. Review **FULLSTACK_SETUP.md** for details
4. Check **ARCHITECTURE.md** for system design

---

## ✅ Checklist Before Production

- [ ] Switch to real database
- [ ] Add JWT authentication
- [ ] Implement user roles
- [ ] Add rate limiting
- [ ] Use HTTPS
- [ ] Configure CORS properly
- [ ] Set environment variables
- [ ] Test with real MQTT broker
- [ ] Load testing
- [ ] Security audit

---

**Version**: 1.0.0  
**Created**: January 2, 2026  
**Status**: ✅ Fully Operational  

**Happy coding! 🎉**
