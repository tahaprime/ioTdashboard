# ================= DATABASE (In-Memory) =================
from datetime import datetime
import uuid
import json

class Database:
    def __init__(self):
        # Initialize with sample data
        self.users = {
            '1': {'id': '1', 'name': 'Admin User', 'email': 'admin@iot.com', 'role': 'admin'},
            '2': {'id': '2', 'name': 'John Doe', 'email': 'john@iot.com', 'role': 'user'},
            '3': {'id': '3', 'name': 'Jane Smith', 'email': 'jane@iot.com', 'role': 'user'},
            '4': {'id': '4', 'name': 'Bob Johnson', 'email': 'bob@iot.com', 'role': 'user'},
        }
        
        self.rooms = {
            'room-001': {
                'id': 'room-001',
                'name': 'Conference Room A',
                'location': 'Building 1, Floor 2',
                'capacity': 20,
                'owner_id': '1',
                'created_at': datetime.now().isoformat()
            },
            'room-002': {
                'id': 'room-002',
                'name': 'Lab Room B',
                'location': 'Building 2, Floor 3',
                'capacity': 50,
                'owner_id': '1',
                'created_at': datetime.now().isoformat()
            },
            'room-003': {
                'id': 'room-003',
                'name': 'Meeting Room C',
                'location': 'Building 1, Floor 1',
                'capacity': 10,
                'owner_id': '1',
                'created_at': datetime.now().isoformat()
            },
        }
        
        # Access control: room_id -> [user_ids]
        self.access_control = {
            'room-001': ['2', '3'],  # John and Jane can access
            'room-002': ['2', '3', '4'],  # John, Jane, and Bob can access
            'room-003': ['3'],  # Only Jane can access
        }
        
        # Access log
        self.access_log = []
    
    # ============= USER OPERATIONS =============
    def get_all_users(self):
        """Get all users"""
        return list(self.users.values())
    
    def get_user(self, user_id):
        """Get user by ID"""
        return self.users.get(user_id)
    
    def create_user(self, name, email, role='user'):
        """Create new user"""
        user_id = str(len(self.users) + 1)
        user = {
            'id': user_id,
            'name': name,
            'email': email,
            'role': role
        }
        self.users[user_id] = user
        return user
    
    # ============= ROOM OPERATIONS =============
    def get_all_rooms(self):
        """Get all rooms"""
        rooms = []
        for room in self.rooms.values():
            room_with_access = room.copy()
            room_with_access['users_with_access'] = self.access_control.get(room['id'], [])
            rooms.append(room_with_access)
        return rooms
    
    def get_room(self, room_id):
        """Get room by ID"""
        room = self.rooms.get(room_id)
        if room:
            room_with_access = room.copy()
            room_with_access['users_with_access'] = self.access_control.get(room_id, [])
            return room_with_access
        return None
    
    def create_room(self, name, location, capacity, owner_id):
        """Create new room"""
        room_id = f"room-{str(len(self.rooms) + 1).zfill(3)}"
        room = {
            'id': room_id,
            'name': name,
            'location': location,
            'capacity': capacity,
            'owner_id': owner_id,
            'created_at': datetime.now().isoformat()
        }
        self.rooms[room_id] = room
        self.access_control[room_id] = []
        return room
    
    # ============= ACCESS CONTROL OPERATIONS =============
    def grant_access(self, room_id, user_id):
        """Grant user access to room"""
        if room_id not in self.rooms:
            return False, "Room not found"
        
        if user_id not in self.users:
            return False, "User not found"
        
        if room_id not in self.access_control:
            self.access_control[room_id] = []
        
        if user_id in self.access_control[room_id]:
            return False, "User already has access"
        
        self.access_control[room_id].append(user_id)
        
        # Log the action
        self.log_access('grant', room_id, user_id)
        
        return True, "Access granted successfully"
    
    def revoke_access(self, room_id, user_id):
        """Revoke user access from room"""
        if room_id not in self.access_control:
            return False, "Room not found"
        
        if user_id not in self.access_control[room_id]:
            return False, "User does not have access"
        
        self.access_control[room_id].remove(user_id)
        
        # Log the action
        self.log_access('revoke', room_id, user_id)
        
        return True, "Access revoked successfully"
    
    def has_access(self, room_id, user_id):
        """Check if user has access to room"""
        if room_id not in self.access_control:
            return False
        return user_id in self.access_control[room_id]
    
    def get_user_rooms(self, user_id):
        """Get all rooms user has access to"""
        accessible_rooms = []
        for room_id, users in self.access_control.items():
            if user_id in users:
                room = self.rooms.get(room_id)
                if room:
                    accessible_rooms.append(room)
        return accessible_rooms
    
    # ============= ACCESS LOG OPERATIONS =============
    def log_access(self, action, room_id, user_id, details=None):
        """Log access action"""
        log_entry = {
            'id': str(uuid.uuid4()),
            'action': action,
            'room_id': room_id,
            'user_id': user_id,
            'timestamp': datetime.now().isoformat(),
            'details': details or {}
        }
        self.access_log.append(log_entry)
        return log_entry
    
    def log_room_entry(self, room_id, subject):
        """Log room entry from MQTT message"""
        log_entry = {
            'id': str(uuid.uuid4()),
            'action': 'room_entry',
            'room_id': room_id,
            'subject': subject,
            'timestamp': datetime.now().isoformat()
        }
        self.access_log.append(log_entry)
        return log_entry
    
    def get_access_log(self, limit=50):
        """Get recent access log"""
        return self.access_log[-limit:]
    
    def get_room_access_log(self, room_id, limit=20):
        """Get access log for specific room"""
        room_log = [entry for entry in self.access_log if entry.get('room_id') == room_id]
        return room_log[-limit:]

# Global database instance
db = Database()

def get_db():
    """Get the global database instance"""
    return db
