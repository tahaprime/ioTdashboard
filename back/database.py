# ================= DATABASE (MongoDB Integration) =================
from datetime import datetime
from pymongo import MongoClient
import uuid
import json
from bson import ObjectId
import os

class Database:
    def __init__(self):
        # MongoDB Atlas Connection
        self.connection_string = os.getenv(
            'MONGODB_URI',
            'mongodb+srv://bleutahadata_db_user:bcyjqK6HX3KLKLAH@facedoorauth.5ik54fz.mongodb.net/FaceIDClasse'
        )
        
        try:
            self.client = MongoClient(self.connection_string)
            self.db = self.client['FaceIDClasse']
            
            # Collections
            self.rfid_users = self.db['rfid_users']  # RFID users collection
            self.face_users = self.db['face_users']  # Face recognition users
            self.rooms = self.db['rooms']  # Room data
            self.access_control = self.db['access_control']  # Access permissions
            self.access_log = self.db['access_log']  # Access history
            
            # Create indexes
            self._create_indexes()
            
            print("✅ MongoDB Atlas connected successfully")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            raise
    
    def _create_indexes(self):
        """Create necessary database indexes"""
        try:
            # RFID indexes
            self.rfid_users.create_index('uid', unique=True)
            self.rfid_users.create_index('active')
            
            # Face users indexes
            self.face_users.create_index('_id')
            
            # Access log indexes
            self.access_log.create_index('timestamp')
            self.access_log.create_index('subject')
            self.access_log.create_index('room_id')
            
            print("✅ Database indexes created")
        except Exception as e:
            print(f"⚠️  Index creation warning: {e}")
    
    # ============= UNIFIED USER AUTHENTICATION =============
    def authenticate_user(self, identifier, source='unknown'):
        """
        Authenticate user from either RFID or Face Recognition
        identifier: UID (RFID) or username (Face)
        source: 'rfid' or 'face'
        Returns: user_data or None
        """
        try:
            # Try RFID first if identifier looks like a UID
            if source == 'rfid' or len(identifier) > 8:
                rfid_user = self.rfid_users.find_one({
                    'uid': identifier,
                    'active': True
                })
                if rfid_user:
                    # Convert ObjectId to string for JSON serialization
                    rfid_user['_id'] = str(rfid_user.get('_id', ''))
                    return {
                        'type': 'rfid',
                        'data': rfid_user,
                        'name': rfid_user.get('name', 'Unknown'),
                        'uid': rfid_user.get('uid'),
                        'faceId': rfid_user.get('faceId')
                    }
            
            # Try Face Recognition
            if source == 'face' or len(identifier) <= 8:
                face_user = self.face_users.find_one({'_id': identifier})
                if face_user:
                    return {
                        'type': 'face',
                        'data': face_user,
                        'name': face_user.get('name', 'Unknown'),
                        'username': face_user.get('_id'),
                        'classes': face_user.get('ClasseID', [])
                    }
            
            return None
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return None
    
    # ============= RFID USER OPERATIONS =============
    def get_all_rfid_users(self):
        """Get all RFID users"""
        try:
            users = list(self.rfid_users.find())
            return [self._serialize_object(user) for user in users]
        except Exception as e:
            print(f"❌ Error fetching RFID users: {e}")
            return []
    
    def get_rfid_user(self, uid):
        """Get RFID user by UID"""
        try:
            user = self.rfid_users.find_one({'uid': uid})
            return self._serialize_object(user) if user else None
        except Exception as e:
            print(f"❌ Error fetching RFID user: {e}")
            return None
    
    def create_rfid_user(self, uid, name, active=True, face_id=None):
        """Create new RFID user"""
        try:
            user = {
                'uid': uid,
                'name': name,
                'active': active,
                'faceId': face_id,
                'createdAt': datetime.now()
            }
            result = self.rfid_users.insert_one(user)
            user['_id'] = str(result.inserted_id)
            return user
        except Exception as e:
            print(f"❌ Error creating RFID user: {e}")
            return None
    
    def update_rfid_user(self, uid, **kwargs):
        """Update RFID user"""
        try:
            result = self.rfid_users.update_one(
                {'uid': uid},
                {'$set': kwargs}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"❌ Error updating RFID user: {e}")
            return False
    
    def delete_rfid_user(self, uid):
        """Delete RFID user"""
        try:
            result = self.rfid_users.delete_one({'uid': uid})
            return result.deleted_count > 0
        except Exception as e:
            print(f"❌ Error deleting RFID user: {e}")
            return False
    
    # ============= FACE RECOGNITION USER OPERATIONS =============
    def get_all_face_users(self):
        """Get all face recognition users"""
        try:
            users = list(self.face_users.find())
            return [self._serialize_object(user) for user in users]
        except Exception as e:
            print(f"❌ Error fetching face users: {e}")
            return []
    
    def get_face_user(self, username):
        """Get face user by username"""
        try:
            user = self.face_users.find_one({'_id': username})
            return self._serialize_object(user) if user else None
        except Exception as e:
            print(f"❌ Error fetching face user: {e}")
            return None
    
    def create_face_user(self, username, name, class_ids=None):
        """Create new face recognition user"""
        try:
            user = {
                '_id': username,
                'name': name,
                'ClasseID': class_ids or [],
                'createdAt': datetime.now()
            }
            self.face_users.insert_one(user)
            return user
        except Exception as e:
            print(f"❌ Error creating face user: {e}")
            return None
    
    def update_face_user(self, username, **kwargs):
        """Update face user"""
        try:
            result = self.face_users.update_one(
                {'_id': username},
                {'$set': kwargs}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"❌ Error updating face user: {e}")
            return False
    
    def add_class_to_face_user(self, username, class_id):
        """Add class to face user's ClasseID array"""
        try:
            result = self.face_users.update_one(
                {'_id': username},
                {'$addToSet': {'ClasseID': int(class_id)}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"❌ Error adding class to face user: {e}")
            return False
    
    def remove_class_from_face_user(self, username, class_id):
        """Remove class from face user's ClasseID array"""
        try:
            result = self.face_users.update_one(
                {'_id': username},
                {'$pull': {'ClasseID': int(class_id)}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"❌ Error removing class from face user: {e}")
            return False
    
    def delete_face_user(self, username):
        """Delete face user"""
        try:
            result = self.face_users.delete_one({'_id': username})
            return result.deleted_count > 0
        except Exception as e:
            print(f"❌ Error deleting face user: {e}")
            return False
    
    # ============= ROOM OPERATIONS =============
    def get_all_rooms(self):
        """Get all rooms"""
        try:
            rooms = list(self.rooms.find())
            return [self._serialize_object(room) for room in rooms]
        except Exception as e:
            print(f"❌ Error fetching rooms: {e}")
            return []
    
    def get_room(self, room_id):
        """Get room by ID"""
        try:
            room = self.rooms.find_one({'_id': ObjectId(room_id) if self._is_valid_objectid(room_id) else room_id})
            return self._serialize_object(room) if room else None
        except Exception as e:
            print(f"❌ Error fetching room: {e}")
            return None
    
    def create_room(self, name, location, capacity, owner_id):
        """Create new room"""
        try:
            room = {
                'name': name,
                'location': location,
                'capacity': capacity,
                'owner_id': owner_id,
                'createdAt': datetime.now()
            }
            result = self.rooms.insert_one(room)
            room['_id'] = str(result.inserted_id)
            return room
        except Exception as e:
            print(f"❌ Error creating room: {e}")
            return None
    
    # ============= ACCESS CONTROL OPERATIONS =============
    def grant_access(self, room_id, user_identifier, user_type='rfid'):
        """Grant user access to room"""
        try:
            # Convert room_id to ObjectId if valid
            room_id_obj = ObjectId(room_id) if self._is_valid_objectid(room_id) else room_id
            
            access_entry = {
                'room_id': room_id_obj,
                'user_identifier': user_identifier,
                'user_type': user_type,  # 'rfid' or 'face'
                'grantedAt': datetime.now()
            }
            result = self.access_control.insert_one(access_entry)
            access_entry['_id'] = str(result.inserted_id)
            
            # Log the action
            self.log_access('grant_access', room_id, user_identifier, user_type)
            
            return True
        except Exception as e:
            print(f"❌ Error granting access: {e}")
            return False
    
    def revoke_access(self, room_id, user_identifier):
        """Revoke user access from room"""
        try:
            # Convert room_id to ObjectId if valid
            room_id_obj = ObjectId(room_id) if self._is_valid_objectid(room_id) else room_id
            
            result = self.access_control.delete_one({
                'room_id': room_id_obj,
                'user_identifier': user_identifier
            })
            
            self.log_access('revoke_access', room_id, user_identifier)
            
            return result.deleted_count > 0
        except Exception as e:
            print(f"❌ Error revoking access: {e}")
            return False
    
    def has_access(self, room_id, user_identifier):
        """Check if user has access to room"""
        try:
            # Convert room_id to ObjectId if valid
            room_id_obj = ObjectId(room_id) if self._is_valid_objectid(room_id) else room_id
            
            access = self.access_control.find_one({
                'room_id': room_id_obj,
                'user_identifier': user_identifier
            })
            return access is not None
        except Exception as e:
            print(f"❌ Error checking access: {e}")
            return False
    
    def get_room_access_users(self, room_id):
        """Get all users with access to a room"""
        try:
            # Convert room_id to ObjectId if valid
            room_id_obj = ObjectId(room_id) if self._is_valid_objectid(room_id) else room_id
            
            accesses = list(self.access_control.find({'room_id': room_id_obj}))
            return [self._serialize_object(access) for access in accesses]
        except Exception as e:
            print(f"❌ Error fetching room access users: {e}")
            return []
    
    # ============= ACCESS LOG OPERATIONS =============
    def log_access(self, action, room_id, user_identifier, user_type='unknown', details=None):
        """Log access action"""
        try:
            log_entry = {
                'action': action,
                'room_id': room_id,
                'subject': user_identifier,
                'user_type': user_type,
                'timestamp': datetime.now(),
                'details': details or {}
            }
            result = self.access_log.insert_one(log_entry)
            log_entry['_id'] = str(result.inserted_id)
            return log_entry
        except Exception as e:
            print(f"❌ Error logging access: {e}")
            return None
    
    def log_room_entry(self, room_id, subject, user_type='unknown'):
        """Log room entry from MQTT/RFID"""
        return self.log_access('room_entry', room_id, subject, user_type)
    
    def get_access_log(self, limit=50):
        """Get recent access log"""
        try:
            logs = list(self.access_log.find().sort('timestamp', -1).limit(limit))
            return [self._serialize_object(log) for log in logs]
        except Exception as e:
            print(f"❌ Error fetching access log: {e}")
            return []
    
    def get_room_access_log(self, room_id, limit=20):
        """Get access log for specific room"""
        try:
            # Convert room_id to ObjectId if valid
            room_id_obj = ObjectId(room_id) if self._is_valid_objectid(room_id) else room_id
            
            logs = list(
                self.access_log.find({'room_id': room_id_obj})
                .sort('timestamp', -1)
                .limit(limit)
            )
            return [self._serialize_object(log) for log in logs]
        except Exception as e:
            print(f"❌ Error fetching room access log: {e}")
            return []
    
    # ============= UTILITY FUNCTIONS =============
    def _serialize_object(self, obj):
        """Convert MongoDB objects to JSON-serializable format"""
        if obj is None:
            return None
        
        if '_id' in obj:
            obj['_id'] = str(obj['_id'])
        
        if 'timestamp' in obj and hasattr(obj['timestamp'], 'isoformat'):
            obj['timestamp'] = obj['timestamp'].isoformat()
        
        if 'createdAt' in obj and hasattr(obj['createdAt'], 'isoformat'):
            obj['createdAt'] = obj['createdAt'].isoformat()
        
        if 'grantedAt' in obj and hasattr(obj['grantedAt'], 'isoformat'):
            obj['grantedAt'] = obj['grantedAt'].isoformat()
        
        return obj
    
    def _is_valid_objectid(self, oid):
        """Check if string is a valid ObjectId"""
        try:
            ObjectId(oid)
            return True
        except:
            return False

# Global database instance
db = Database()

def get_db():
    """Get the global database instance"""
    return db
