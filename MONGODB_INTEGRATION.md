# MongoDB Integration Guide

Your Flask backend is now fully integrated with MongoDB Atlas to handle both **RFID users** and **Face Recognition users** dynamically.

## Database Structure

### Collections

#### 1. **rfid_users** - RFID Card Users
```json
{
  "_id": ObjectId,
  "uid": "E280689401A9",        // Unique RFID UID
  "name": "ALTAF",
  "active": true,
  "faceId": "yaacoub",           // Optional link to face user
  "createdAt": ISODate()
}
```

#### 2. **face_users** - Face Recognition Users
```json
{
  "_id": "yaacoub",              // Username as ID
  "name": "yaacoub bourzak",
  "ClasseID": [1, 2],            // Array of class IDs
  "createdAt": ISODate()
}
```

#### 3. **rooms** - Room Data
#### 4. **access_control** - Room Access Permissions
#### 5. **access_log** - All access history and authentication events

## New API Endpoints

### Authentication Endpoints

#### RFID Authentication
```bash
POST /api/auth/rfid
Content-Type: application/json

{
  "uid": "E280689401A9"
}

# Response
{
  "status": "granted",
  "user": {
    "type": "rfid",
    "name": "ALTAF",
    "uid": "E280689401A9",
    "faceId": "yaacoub"
  },
  "timestamp": "2025-01-02T..."
}
```

#### Face Recognition Authentication
```bash
POST /api/auth/face
Content-Type: application/json

{
  "username": "yaacoub"
}

# Response
{
  "status": "granted",
  "user": {
    "type": "face",
    "name": "yaacoub bourzak",
    "username": "yaacoub",
    "classes": [1, 2]
  },
  "timestamp": "2025-01-02T..."
}
```

### RFID User Management

#### Get All RFID Users
```bash
GET /api/rfid-users
```

#### Get Specific RFID User
```bash
GET /api/rfid-users/<uid>
```

#### Create RFID User
```bash
POST /api/rfid-users
Content-Type: application/json

{
  "uid": "E280689401A9",
  "name": "ALTAF",
  "active": true,
  "faceId": "yaacoub"  // Optional
}
```

#### Update RFID User
```bash
PUT /api/rfid-users/<uid>
Content-Type: application/json

{
  "name": "ALTAF Updated",
  "active": false,
  "faceId": "username2"
}
```

#### Delete RFID User
```bash
DELETE /api/rfid-users/<uid>
```

### Face Recognition User Management

#### Get All Face Users
```bash
GET /api/face-users
```

#### Get Specific Face User
```bash
GET /api/face-users/<username>
```

#### Create Face User
```bash
POST /api/face-users
Content-Type: application/json

{
  "username": "yaacoub",
  "name": "yaacoub bourzak",
  "classIds": [1, 2]  // Optional
}
```

#### Update Face User
```bash
PUT /api/face-users/<username>
Content-Type: application/json

{
  "name": "New Name"
}
```

#### Add Class to Face User
```bash
POST /api/face-users/<username>/classes
Content-Type: application/json

{
  "classId": 3
}
```

#### Remove Class from Face User
```bash
DELETE /api/face-users/<username>/classes/3
```

#### Delete Face User
```bash
DELETE /api/face-users/<username>
```

### Room Access Control (Updated for Dynamic Users)

#### Grant Access
```bash
POST /api/access/grant
Content-Type: application/json

{
  "room_id": "room-001",
  "user_identifier": "E280689401A9",  // UID or username
  "user_type": "rfid"                  // 'rfid' or 'face'
}
```

#### Revoke Access
```bash
POST /api/access/revoke
Content-Type: application/json

{
  "room_id": "room-001",
  "user_identifier": "E280689401A9"
}
```

#### Check Access
```bash
POST /api/access/check
Content-Type: application/json

{
  "room_id": "room-001",
  "user_identifier": "E280689401A9"
}
```

#### Get Room Users
```bash
GET /api/rooms/<room_id>/access
```

## Backend Database Methods

### Unified Authentication
```python
# Works for both RFID and Face users
user = db.authenticate_user(identifier, source='rfid')  # or 'face'

if user:
    if user['type'] == 'rfid':
        # RFID user
        uid = user['uid']
        name = user['name']
    else:
        # Face user
        username = user['username']
        classes = user['classes']
```

### RFID Operations
```python
db.get_all_rfid_users()
db.get_rfid_user(uid)
db.create_rfid_user(uid, name, active=True, face_id=None)
db.update_rfid_user(uid, **kwargs)
db.delete_rfid_user(uid)
```

### Face Recognition Operations
```python
db.get_all_face_users()
db.get_face_user(username)
db.create_face_user(username, name, class_ids=[])
db.update_face_user(username, **kwargs)
db.add_class_to_face_user(username, class_id)
db.remove_class_from_face_user(username, class_id)
db.delete_face_user(username)
```

### Access Control (Now Dynamic)
```python
db.grant_access(room_id, user_identifier, user_type='rfid')
db.revoke_access(room_id, user_identifier)
db.has_access(room_id, user_identifier)
db.get_room_access_users(room_id)
```

### Logging
```python
db.log_access(action, room_id, user_identifier, user_type='unknown', details=None)
db.log_room_entry(room_id, subject, user_type='unknown')
db.get_access_log(limit=50)
db.get_room_access_log(room_id, limit=20)
```

## Installation

Install MongoDB dependencies:
```bash
pip install pymongo dnspython
```

The requirements.txt has already been updated.

## Connection String

The backend uses MongoDB Atlas with this connection:
```
mongodb+srv://bleutahadata_db_user:bcyjqK6HX3KLKLAH@facedoorauth.5ik54fz.mongodb.net/FaceIDClasse
```

You can override it with the `MONGODB_URI` environment variable.

## Key Features

✅ **Unified Authentication** - Seamlessly authenticate both RFID and Face Recognition users
✅ **Dynamic Collections** - Automatically queries the correct collection based on user type
✅ **Access Control** - Manage room permissions for both user types
✅ **Comprehensive Logging** - Track all authentication and access events
✅ **Class Management** - Dynamic ClasseID array management for face users
✅ **Error Handling** - Robust error handling with detailed logging

## Migration Notes

- Old in-memory database has been replaced with MongoDB
- All existing endpoints are still supported
- New dedicated endpoints for RFID and Face users
- `/api/users` now returns combined results from both collections (with 'type' field)
