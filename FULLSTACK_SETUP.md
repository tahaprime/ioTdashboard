# IoT Room Access Control System - Full Stack

A dynamic fullstack IoT application that manages room access control with real-time MQTT broker integration. Users can grant/revoke access, track room entries, and manage system-wide access logs.

## 🚀 Features

### Frontend
- **Interactive Dashboard**: Real-time system overview with KPI cards
- **Room Access Management**: Grant/revoke user access to rooms with a modern UI
- **Live Notifications**: Real-time MQTT messages displayed as toasts
- **Activity Logs**: Track all access grant/revoke/entry events
- **Responsive Design**: Glassmorphism UI with neon blue cyberpunk aesthetic
- **Navigation System**: Easy switching between Dashboard and Room Access pages

### Backend
- **Flask REST API**: Complete CRUD operations for rooms, users, and access control
- **MQTT Integration**: Listens to room entry notifications from IoT devices
- **In-Memory Database**: Pre-populated with sample data (easily extensible to real DB)
- **Access Control**: Manage who can access which rooms
- **Activity Logging**: Complete audit trail of all operations
- **CORS Enabled**: Ready for frontend integration

## 📋 Project Structure

```
IoT/
├── src/                          # React Frontend
│   ├── components/
│   │   ├── RoomAccessManagement.jsx   # Main access control UI
│   │   ├── RoomAccessManagement.css   # Styling
│   │   ├── Toast.jsx            # Toast notifications component
│   │   ├── Toast.css            # Toast styling
│   │   ├── StatusBar.jsx        # System status display
│   │   ├── KPICard.jsx          # Metric cards
│   │   ├── MapVisualization.jsx # Facility map
│   │   ├── DonutChart.jsx       # Pie/donut charts
│   │   ├── BarChart.jsx         # Bar chart component
│   │   └── AlertTicker.jsx      # Scrolling alerts
│   ├── api/
│   │   └── client.js             # API client with all endpoints
│   ├── App.jsx                  # Main app with navigation
│   ├── index.css                # Global styles + navigation
│   └── main.jsx                 # Entry point
│
├── back/                         # Python Flask Backend
│   ├── app.py                   # Flask REST API server
│   ├── config.py                # Configuration management
│   ├── database.py              # In-memory database with sample data
│   ├── mqtt_client.py           # MQTT client for broker communication
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Environment variables
│
└── package.json                 # Frontend dependencies

```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16+) and npm
- Python 3.8+
- MQTT Broker (default: broker.mqttdashboard.com)

### Step 1: Install Frontend Dependencies

```bash
npm install
```

### Step 2: Install Backend Dependencies

```bash
npm run backend-install
# or manually:
cd back
pip install -r requirements.txt
```

### Step 3: Configure Environment (Optional)

Edit `back/.env` to change MQTT broker or API port:
```env
MQTT_BROKER=broker.mqttdashboard.com
MQTT_PORT=1883
MQTT_TOPIC_ENTER=/iot/room/enter
MQTT_TOPIC_EXIT=/iot/room/exit
API_PORT=5000
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd back
python app.py
```

Backend runs on `http://localhost:5000`

### Start Frontend (in another terminal)

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### API Endpoints

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/<user_id>` - Get specific user
- `POST /api/users` - Create new user

#### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/<room_id>` - Get specific room
- `POST /api/rooms` - Create new room

#### Access Control
- `POST /api/access/grant` - Grant user access to room
- `POST /api/access/revoke` - Revoke user access from room
- `POST /api/access/check` - Check if user has access
- `GET /api/users/<user_id>/rooms` - Get user's accessible rooms
- `GET /api/rooms/<room_id>/access` - Get users with room access

#### Logs
- `GET /api/logs/access` - Get access activity log
- `GET /api/logs/room/<room_id>` - Get room-specific logs

#### MQTT Notifications
- `GET /api/notifications` - Get recent MQTT notifications
- `GET /api/notifications/latest` - Get latest notification
- `POST /api/notifications/clear` - Clear notifications

## 🎯 Usage Guide

### Dashboard Page
- View real-time system statistics
- Monitor room occupancy and access status
- Check system health and activity alerts
- Access summary of today's activities

### Room Access Management Page
- **Left Panel**: Select and view rooms with quick stats
- **Center Panel**: 
  - View current users with access
  - Grant access to available users
  - See activity logs for the room
- **Right Panel**: 
  - Create new users
  - Browse all system users

### Toast Notifications
- Automatically appear when MQTT messages arrive
- Shows room entry notifications with timestamp
- Real-time updates every 2 seconds

## 📡 MQTT Integration

The backend listens to MQTT topics for room entry notifications:

### Subscribe Topics
```
/iot/room/enter  - User enters a room
/iot/room/exit   - User exits a room
```

### Message Format
```json
{
  "subject": "User123",
  "timestamp": "2024-01-02T15:30:45.123456",
  "topic": "/iot/room/enter"
}
```

## 🗄️ Database (In-Memory)

Pre-populated with sample data:

### Users
- Admin User (ID: 1)
- John Doe (ID: 2)
- Jane Smith (ID: 3)
- Bob Johnson (ID: 4)

### Rooms
- Conference Room A (room-001) - Building 1, Floor 2
- Lab Room B (room-002) - Building 2, Floor 3
- Meeting Room C (room-003) - Building 1, Floor 1

### Default Access
- room-001: John (2), Jane (3)
- room-002: John (2), Jane (3), Bob (4)
- room-003: Jane (3)

## 🎨 UI Features

### Navigation Bar
- Sticky navigation with active page indicator
- Brand logo and quick links to Dashboard and Room Access

### Toast System
- Success (green) - Access granted/revoked
- Error (red) - Operation failures
- Warning (orange) - Validation warnings
- Info (blue) - MQTT entry notifications
- Auto-dismiss after 3 seconds

### Styling
- Glassmorphism with backdrop blur
- Neon blue color scheme
- Dark theme (0a0e27 background)
- Responsive grid layouts
- Smooth transitions and animations

## 🔒 Security Considerations

This is a prototype application. For production:
- Add JWT authentication
- Implement user roles and permissions
- Use real database (PostgreSQL/MongoDB)
- Add rate limiting
- Implement input validation
- Use HTTPS with certificate
- Add CSRF protection
- Implement proper access control checks

## 🐛 Troubleshooting

### Backend won't connect to MQTT broker
- Check internet connection
- Verify broker URL in `.env`
- Try changing to your own MQTT broker

### Frontend API calls failing
- Ensure backend is running on port 5000
- Check CORS is enabled (it is by default)
- Open browser console for detailed errors

### No MQTT notifications appearing
- Verify broker topics match `/iot/room/enter` and `/iot/room/exit`
- Publish test message: `mosquitto_pub -h broker.mqttdashboard.com -t /iot/room/enter -m '{"subject":"test"}'`
- Check backend logs for MQTT connection status

## 📝 Example API Calls

### Grant Access
```bash
curl -X POST http://localhost:5000/api/access/grant \
  -H "Content-Type: application/json" \
  -d '{"room_id": "room-001", "user_id": "2"}'
```

### Get Room Access
```bash
curl http://localhost:5000/api/rooms/room-001/access
```

### Get Notifications
```bash
curl http://localhost:5000/api/notifications?limit=5
```

## 🚀 Future Enhancements

- Real database integration (PostgreSQL)
- JWT authentication system
- User roles (admin, manager, user)
- Mobile app (React Native)
- Advanced analytics dashboard
- Room booking system
- Integration with access control hardware
- WebSocket for real-time updates
- Email/SMS notifications
- Geolocation-based access
- Machine learning for usage patterns

## 📄 License

This project is part of the IoT suite developed for smart facility management.

## 👨‍💻 Development

Built with:
- **Frontend**: React 19, Tailwind CSS v4, Vite
- **Backend**: Flask, Python 3, paho-mqtt
- **Database**: In-memory (easily upgradeable)
- **Broker**: MQTT (any compatible broker)

---

**Created**: January 2, 2026
**Version**: 1.0.0
**Status**: Fully Operational ✅
