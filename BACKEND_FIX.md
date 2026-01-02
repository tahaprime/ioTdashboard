# 🚀 Backend Fix - Working Setup

## Issue Fixed
✅ Changed API host from `0.0.0.0` to `127.0.0.1` (localhost)
✅ This avoids socket permission errors on Windows

## ✅ How to Start (Guaranteed to Work)

### Step 1: Open PowerShell as Administrator
1. Press `Win + X`
2. Click "Windows PowerShell (Admin)"
3. Click "Yes" when prompted

### Step 2: Start Backend
```bash
cd C:\Users\Taha\Desktop\IoT\back
python app.py
```

**Expected output:**
```
============================================================
🚀 IoT Room Access Control - Backend Server
============================================================
📡 MQTT Broker: broker.mqttdashboard.com:1883
📨 MQTT Topic: /sourcPy/Reponse
🌐 API: http://127.0.0.1:5000
============================================================
 * Running on http://127.0.0.1:5000
✅ Connected to MQTT Broker
📡 Subscribed to topic: /sourcPy/Reponse
```

### Step 3: Open Another PowerShell (Regular, not Admin)
```bash
cd C:\Users\Taha\Desktop\IoT
npm run dev
```

**Expected output:**
```
  VITE v7.2.4  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 4: Open Browser
```
http://localhost:5173
```

✅ **You're done!** System is running.

---

## 🎯 Test the System

### 1. Test Backend API
```bash
curl http://127.0.0.1:5000/api/health
```

Should return:
```json
{"status":"healthy","timestamp":"2026-01-02T...","mqtt_connected":true}
```

### 2. Test Frontend
- Click `🔐 Room Access` in navbar
- Try granting access to any user
- Should show green ✓ toast

### 3. Test MQTT
```bash
mosquitto_pub -h broker.mqttdashboard.com -t /sourcPy/Reponse -m '{"subject":"Test"}'
```

Should show blue toast: "Room Entry: Test"

---

## ❓ If Still Having Issues

### Backend won't start?
```bash
# Check if port 5000 is free
netstat -ano | findstr :5000

# If something uses it, kill it
taskkill /PID <PID> /F

# Or use different port - edit back/.env
API_PORT=5001
```

### Frontend can't connect to API?
Make sure both are running:
- Backend: `http://127.0.0.1:5000`
- Frontend: `http://localhost:5173`
- Check browser console (F12) for errors

### MQTT not working?
Check backend logs - should show:
```
✅ Connected to MQTT Broker
📡 Subscribed to topic: /sourcPy/Reponse
```

---

## 📝 Configuration Files Updated

✅ `back/.env` - API_HOST changed to `127.0.0.1`
✅ `back/config.py` - Uses localhost binding
✅ `src/api/client.js` - Connects to `http://localhost:5000/api`

---

## 🎉 Everything Should Work Now!

Both backend and frontend are configured to work together.

**Quick Commands:**
```bash
# Backend (Admin PowerShell)
cd C:\Users\Taha\Desktop\IoT\back && python app.py

# Frontend (Regular PowerShell)
cd C:\Users\Taha\Desktop\IoT && npm run dev

# Then open browser
http://localhost:5173
```

---

**Status: ✅ Ready to Use**
