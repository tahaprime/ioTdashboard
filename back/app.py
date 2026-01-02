# ================= FLASK API =================
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import config
from database import get_db, db
from mqtt_client import init_mqtt, get_mqtt_client
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Global state for active notifications
notifications = []

def on_mqtt_message(data):
    """Handle incoming MQTT messages"""
    print(f"🔔 MQTT Message Handler called: {data}")
    
    # Add to notifications list
    notification = {
        'id': len(notifications) + 1,
        'type': 'room_entry',
        'subject': data.get('subject', 'Unknown'),
        'topic': data.get('topic', ''),
        'timestamp': data.get('timestamp', datetime.now().isoformat()),
        'message': f"Entry detected: {data.get('subject', 'Unknown')}"
    }
    notifications.append(notification)
    
    # Keep only last 50 notifications
    if len(notifications) > 50:
        notifications.pop(0)
    
    # Log to database
    db.log_room_entry(None, data.get('subject', 'Unknown'))

# Initialize MQTT client
init_mqtt(app, on_message_callback=on_mqtt_message)

# ================= API ROUTES =================

# ============= HEALTH CHECK =============
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    mqtt_client = get_mqtt_client()
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'mqtt_connected': mqtt_client.connected if mqtt_client else False
    }), 200

# ============= USER ENDPOINTS =============
@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    users = db.get_all_users()
    return jsonify(users), 200

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get specific user"""
    user = db.get_user(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user), 200

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create new user"""
    data = request.get_json()
    
    if not data.get('name') or not data.get('email'):
        return jsonify({'error': 'Name and email are required'}), 400
    
    user = db.create_user(
        name=data['name'],
        email=data['email'],
        role=data.get('role', 'user')
    )
    return jsonify(user), 201

# ============= ROOM ENDPOINTS =============
@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    """Get all rooms"""
    rooms = db.get_all_rooms()
    return jsonify(rooms), 200

@app.route('/api/rooms/<room_id>', methods=['GET'])
def get_room(room_id):
    """Get specific room"""
    room = db.get_room(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    return jsonify(room), 200

@app.route('/api/rooms', methods=['POST'])
def create_room():
    """Create new room"""
    data = request.get_json()
    
    required = ['name', 'location', 'capacity', 'owner_id']
    if not all(key in data for key in required):
        return jsonify({'error': f'Required fields: {", ".join(required)}'}), 400
    
    room = db.create_room(
        name=data['name'],
        location=data['location'],
        capacity=int(data['capacity']),
        owner_id=data['owner_id']
    )
    return jsonify(room), 201

# ============= ACCESS CONTROL ENDPOINTS =============
@app.route('/api/access/grant', methods=['POST'])
def grant_access():
    """Grant user access to room"""
    data = request.get_json()
    
    if not data.get('room_id') or not data.get('user_id'):
        return jsonify({'error': 'room_id and user_id are required'}), 400
    
    success, message = db.grant_access(data['room_id'], data['user_id'])
    
    if not success:
        return jsonify({'error': message}), 400
    
    return jsonify({
        'success': True,
        'message': message,
        'room_id': data['room_id'],
        'user_id': data['user_id'],
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/access/revoke', methods=['POST'])
def revoke_access():
    """Revoke user access from room"""
    data = request.get_json()
    
    if not data.get('room_id') or not data.get('user_id'):
        return jsonify({'error': 'room_id and user_id are required'}), 400
    
    success, message = db.revoke_access(data['room_id'], data['user_id'])
    
    if not success:
        return jsonify({'error': message}), 400
    
    return jsonify({
        'success': True,
        'message': message,
        'room_id': data['room_id'],
        'user_id': data['user_id'],
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/access/check', methods=['POST'])
def check_access():
    """Check if user has access to room"""
    data = request.get_json()
    
    if not data.get('room_id') or not data.get('user_id'):
        return jsonify({'error': 'room_id and user_id are required'}), 400
    
    has_access = db.has_access(data['room_id'], data['user_id'])
    
    return jsonify({
        'room_id': data['room_id'],
        'user_id': data['user_id'],
        'has_access': has_access
    }), 200

@app.route('/api/users/<user_id>/rooms', methods=['GET'])
def get_user_rooms(user_id):
    """Get all rooms user has access to"""
    user = db.get_user(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    rooms = db.get_user_rooms(user_id)
    return jsonify(rooms), 200

@app.route('/api/rooms/<room_id>/access', methods=['GET'])
def get_room_access(room_id):
    """Get all users with access to room"""
    room = db.get_room(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    
    user_ids = db.access_control.get(room_id, [])
    users = [db.get_user(uid) for uid in user_ids]
    users = [u for u in users if u]  # Filter out None values
    
    return jsonify({
        'room_id': room_id,
        'room_name': room['name'],
        'users': users,
        'count': len(users)
    }), 200

# ============= ACCESS LOG ENDPOINTS =============
@app.route('/api/logs/access', methods=['GET'])
def get_access_logs():
    """Get access log"""
    limit = request.args.get('limit', default=50, type=int)
    logs = db.get_access_log(limit)
    return jsonify(logs), 200

@app.route('/api/logs/room/<room_id>', methods=['GET'])
def get_room_logs(room_id):
    """Get logs for specific room"""
    limit = request.args.get('limit', default=20, type=int)
    logs = db.get_room_access_log(room_id, limit)
    return jsonify(logs), 200

# ============= MQTT NOTIFICATION ENDPOINTS =============
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get recent MQTT notifications"""
    limit = request.args.get('limit', default=20, type=int)
    return jsonify(notifications[-limit:]), 200

@app.route('/api/notifications/latest', methods=['GET'])
def get_latest_notification():
    """Get latest notification"""
    if not notifications:
        return jsonify(None), 200
    return jsonify(notifications[-1]), 200

@app.route('/api/notifications/clear', methods=['POST'])
def clear_notifications():
    """Clear all notifications"""
    global notifications
    notifications = []
    return jsonify({'success': True, 'message': 'Notifications cleared'}), 200

# ============= ERROR HANDLERS =============
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ================= MAIN =================
if __name__ == '__main__':
    print("=" * 60)
    print("🚀 IoT Room Access Control - Backend Server")
    print("=" * 60)
    print(f"📡 MQTT Broker: {config.MQTT_BROKER}:{config.MQTT_PORT}")
    print(f"📨 MQTT Topic: {config.MQTT_TOPIC}")
    print(f"🌐 API: http://{config.API_HOST}:{config.API_PORT}")
    print("=" * 60)
    
    app.run(
        host=config.API_HOST,
        port=config.API_PORT,
        debug=config.DEBUG
    )
