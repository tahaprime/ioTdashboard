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
    
    # Extract UID from MQTT message (e.g., "UID:E280689401A9")
    subject = data.get('subject', 'Unknown')
    user_name = subject
    user_type = 'unknown'
    
    # If subject looks like a UID (starts with UID: or is hex), look up the user
    if subject.startswith('UID:'):
        uid = subject.replace('UID:', '').strip()
        rfid_user = db.get_rfid_user(uid)
        if rfid_user:
            user_name = rfid_user.get('name', uid)
            user_type = 'rfid'
        else:
            user_name = f"Unknown UID: {uid}"
            user_type = 'rfid_unknown'
    elif len(subject) > 3 and not subject.startswith('Unknown'):
        # Could be a UID without prefix, try to look it up
        rfid_user = db.get_rfid_user(subject)
        if rfid_user:
            user_name = rfid_user.get('name', subject)
            user_type = 'rfid'
    
    # Add to notifications list
    notification = {
        'id': len(notifications) + 1,
        'type': 'room_entry',
        'subject': user_name,
        'uid': subject,
        'topic': data.get('topic', ''),
        'timestamp': data.get('timestamp', datetime.now().isoformat()),
        'message': f"Entry detected: {user_name}"
    }
    notifications.append(notification)
    
    # Keep only last 50 notifications
    if len(notifications) > 50:
        notifications.pop(0)
    
    # Log to database with proper user info
    db.log_room_entry(None, user_name, user_type)

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

# ============= AUTHENTICATION ENDPOINTS (NEW) =============
@app.route('/api/auth/rfid', methods=['POST'])
def auth_rfid():
    """Authenticate RFID user"""
    data = request.get_json()
    
    if not data.get('uid'):
        return jsonify({'error': 'uid is required'}), 400
    
    user = db.authenticate_user(data['uid'], source='rfid')
    
    if not user:
        # Log failed attempt
        db.log_access('auth_failed', None, data['uid'], 'rfid', {'reason': 'User not found or inactive'})
        return jsonify({'error': 'Access denied'}), 401
    
    # Log successful authentication
    db.log_access('auth_success', None, user['name'], 'rfid', {'uid': data['uid']})
    
    return jsonify({
        'status': 'granted',
        'user': user,
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/auth/face', methods=['POST'])
def auth_face():
    """Authenticate Face Recognition user"""
    data = request.get_json()
    
    if not data.get('username'):
        return jsonify({'error': 'username is required'}), 400
    
    user = db.authenticate_user(data['username'], source='face')
    
    if not user:
        # Log failed attempt
        db.log_access('auth_failed', None, data['username'], 'face', {'reason': 'User not found'})
        return jsonify({'error': 'Access denied'}), 401
    
    # Log successful authentication
    db.log_access('auth_success', None, user['name'], 'face', {'username': data['username']})
    
    return jsonify({
        'status': 'granted',
        'user': user,
        'timestamp': datetime.now().isoformat()
    }), 200

# ============= RFID USER ENDPOINTS (NEW) =============
@app.route('/api/rfid-users', methods=['GET'])
def get_rfid_users():
    """Get all RFID users"""
    users = db.get_all_rfid_users()
    return jsonify(users), 200

@app.route('/api/rfid-users/<uid>', methods=['GET'])
def get_rfid_user(uid):
    """Get specific RFID user"""
    user = db.get_rfid_user(uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user), 200

@app.route('/api/rfid-users', methods=['POST'])
def create_rfid_user():
    """Create new RFID user"""
    data = request.get_json()
    
    required = ['uid', 'name']
    if not all(key in data for key in required):
        return jsonify({'error': f'Required fields: {", ".join(required)}'}), 400
    
    user = db.create_rfid_user(
        uid=data['uid'],
        name=data['name'],
        active=data.get('active', True),
        face_id=data.get('faceId')
    )
    
    if not user:
        return jsonify({'error': 'Failed to create user'}), 400
    
    return jsonify(user), 201

@app.route('/api/rfid-users/<uid>', methods=['PUT'])
def update_rfid_user(uid):
    """Update RFID user"""
    data = request.get_json()
    
    success = db.update_rfid_user(uid, **data)
    
    if not success:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'User updated successfully',
        'uid': uid
    }), 200

@app.route('/api/rfid-users/<uid>', methods=['DELETE'])
def delete_rfid_user(uid):
    """Delete RFID user"""
    success = db.delete_rfid_user(uid)
    
    if not success:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'User deleted successfully',
        'uid': uid
    }), 200

# ============= FACE RECOGNITION USER ENDPOINTS (NEW) =============
@app.route('/api/face-users', methods=['GET'])
def get_face_users():
    """Get all face recognition users"""
    users = db.get_all_face_users()
    return jsonify(users), 200

@app.route('/api/face-users/<username>', methods=['GET'])
def get_face_user(username):
    """Get specific face user"""
    user = db.get_face_user(username)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user), 200

@app.route('/api/face-users', methods=['POST'])
def create_face_user():
    """Create new face recognition user"""
    data = request.get_json()
    
    required = ['username', 'name']
    if not all(key in data for key in required):
        return jsonify({'error': f'Required fields: {", ".join(required)}'}), 400
    
    user = db.create_face_user(
        username=data['username'],
        name=data['name'],
        class_ids=data.get('classIds', [])
    )
    
    if not user:
        return jsonify({'error': 'Failed to create user'}), 400
    
    return jsonify(user), 201

@app.route('/api/face-users/<username>', methods=['PUT'])
def update_face_user(username):
    """Update face user"""
    data = request.get_json()
    
    success = db.update_face_user(username, **data)
    
    if not success:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'User updated successfully',
        'username': username
    }), 200

@app.route('/api/face-users/<username>/classes', methods=['POST'])
def add_class_to_face_user(username):
    """Add class to face user"""
    data = request.get_json()
    
    if not data.get('classId'):
        return jsonify({'error': 'classId is required'}), 400
    
    success = db.add_class_to_face_user(username, data['classId'])
    
    if not success:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'Class added successfully',
        'username': username,
        'classId': data['classId']
    }), 200

@app.route('/api/face-users/<username>/classes/<int:class_id>', methods=['DELETE'])
def remove_class_from_face_user(username, class_id):
    """Remove class from face user"""
    success = db.remove_class_from_face_user(username, class_id)
    
    if not success:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'Class removed successfully',
        'username': username,
        'classId': class_id
    }), 200

@app.route('/api/face-users/<username>', methods=['DELETE'])
def delete_face_user(username):
    """Delete face user"""
    success = db.delete_face_user(username)
    
    if not success:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'User deleted successfully',
        'username': username
    }), 200

# ============= USER ENDPOINTS (LEGACY - kept for backward compatibility) =============
@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users (combined RFID and Face)"""
    rfid_users = [u | {'type': 'rfid'} for u in db.get_all_rfid_users()]
    face_users = [u | {'type': 'face'} for u in db.get_all_face_users()]
    return jsonify(rfid_users + face_users), 200

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create new user (RFID or Face based on data)"""
    data = request.get_json()
    
    # If it has 'uid', create as RFID user
    if data.get('uid'):
        user = db.create_rfid_user(
            uid=data['uid'],
            name=data.get('name', 'Unknown'),
            active=data.get('active', True),
            face_id=data.get('faceId')
        )
        if user:
            user['type'] = 'rfid'
        return jsonify(user), 201
    
    # If it has 'username', create as Face user
    elif data.get('username'):
        user = db.create_face_user(
            username=data['username'],
            name=data.get('name', 'Unknown'),
            class_ids=data.get('classIds', [])
        )
        if user:
            user['type'] = 'face'
        return jsonify(user), 201
    
    # Fallback: create as RFID user using email as uid if no uid/username provided
    elif data.get('email'):
        user = db.create_rfid_user(
            uid=data.get('email'),  # Use email as UID for backward compatibility
            name=data.get('name', 'Unknown'),
            active=True
        )
        if user:
            user['type'] = 'rfid'
        return jsonify(user), 201
    
    else:
        return jsonify({'error': 'Either uid, username, or email is required'}), 400

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
    
    if not data.get('room_id') or not data.get('user_identifier'):
        return jsonify({'error': 'room_id and user_identifier are required'}), 400
    
    success = db.grant_access(
        data['room_id'],
        data['user_identifier'],
        data.get('user_type', 'rfid')
    )
    
    if not success:
        return jsonify({'error': 'Failed to grant access'}), 400
    
    return jsonify({
        'success': True,
        'message': 'Access granted successfully',
        'room_id': data['room_id'],
        'user_identifier': data['user_identifier'],
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/access/revoke', methods=['POST'])
def revoke_access():
    """Revoke user access from room"""
    data = request.get_json()
    
    if not data.get('room_id') or not data.get('user_identifier'):
        return jsonify({'error': 'room_id and user_identifier are required'}), 400
    
    success = db.revoke_access(data['room_id'], data['user_identifier'])
    
    if not success:
        return jsonify({'error': 'Access not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'Access revoked successfully',
        'room_id': data['room_id'],
        'user_identifier': data['user_identifier'],
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/access/check', methods=['POST'])
def check_access():
    """Check if user has access to room"""
    data = request.get_json()
    
    if not data.get('room_id') or not data.get('user_identifier'):
        return jsonify({'error': 'room_id and user_identifier are required'}), 400
    
    has_access = db.has_access(data['room_id'], data['user_identifier'])
    
    return jsonify({
        'room_id': data['room_id'],
        'user_identifier': data['user_identifier'],
        'has_access': has_access
    }), 200

@app.route('/api/rooms/<room_id>/access', methods=['GET'])
def get_room_access(room_id):
    """Get all users with access to room"""
    try:
        room = db.get_room(room_id)
        if not room:
            return jsonify({'error': 'Room not found'}), 404
        
        accesses = db.get_room_access_users(room_id)
        
        # Fetch actual user data for each access entry
        users_data = []
        for access in accesses:
            user_identifier = access.get('user_identifier')
            user_type = access.get('user_type', 'unknown')
            
            user = None
            if user_type == 'rfid':
                user = db.get_rfid_user(user_identifier)
            elif user_type == 'face':
                user = db.get_face_user(user_identifier)
            
            if user:
                # Add user_type to the user object for frontend identification
                user['type'] = user_type
                users_data.append(user)
            else:
                print(f"⚠️ User not found: {user_type}/{user_identifier}")
        
        room_data = db._serialize_object(room)
        return jsonify({
            'room_id': room_id,
            'room_name': room_data.get('name'),
            'users': users_data,
            'count': len(users_data)
        }), 200
    except Exception as e:
        print(f"❌ Error in get_room_access: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

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
