# MongoDB Setup Guide - RFID User Mapping

## Problem: "Room Entry: unknown"

This happens when the MQTT message contains an RFID UID that isn't mapped to a user in MongoDB.

## Solution: Populate rfid_users Collection

### Sample Data for rfid_users Collection

```json
// Document 1
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "uid": "E280689401A9",
  "name": "ALTAF",
  "active": true,
  "faceId": null,
  "createdAt": ISODate("2025-01-02T10:00:00Z")
}

// Document 2
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "uid": "A1B2C3D4E5F6",
  "name": "yaacoub",
  "active": true,
  "faceId": "yaacoub",  // Link to face user if applicable
  "createdAt": ISODate("2025-01-02T10:05:00Z")
}

// Document 3
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "uid": "12345678ABCD",
  "name": "JOHN DOE",
  "active": true,
  "faceId": null,
  "createdAt": ISODate("2025-01-02T10:10:00Z")
}
```

### How to Add RFID Users to MongoDB

#### Option 1: Via API (POST request)

```bash
POST http://localhost:5000/api/rfid-users
Content-Type: application/json

{
  "uid": "E280689401A9",
  "name": "ALTAF",
  "active": true,
  "faceId": null
}
```

#### Option 2: Via MongoDB Atlas Console

1. Go to [MongoDB Atlas Console](https://cloud.mongodb.com)
2. Select your cluster: `facedoorauth`
3. Select database: `FaceIDClasse`
4. Select collection: `rfid_users`
5. Click "Insert Document"
6. Paste:
```json
{
  "uid": "E280689401A9",
  "name": "ALTAF",
  "active": true,
  "faceId": null,
  "createdAt": new Date()
}
```

#### Option 3: Via MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb+srv://bleutahadata_db_user:bcyjqK6HX3KLKLAH@facedoorauth.5ik54fz.mongodb.net/FaceIDClasse`
3. Navigate to `rfid_users` collection
4. Click "Insert Document" and paste the JSON above

#### Option 4: Via Python Script

```python
from pymongo import MongoClient

client = MongoClient('mongodb+srv://bleutahadata_db_user:bcyjqK6HX3KLKLAH@facedoorauth.5ik54fz.mongodb.net/FaceIDClasse')
db = client['FaceIDClasse']
rfid_users = db['rfid_users']

# Insert RFID users
users = [
    {
        "uid": "E280689401A9",
        "name": "ALTAF",
        "active": True,
        "faceId": None
    },
    {
        "uid": "A1B2C3D4E5F6",
        "name": "yaacoub",
        "active": True,
        "faceId": "yaacoub"
    },
    {
        "uid": "12345678ABCD",
        "name": "JOHN DOE",
        "active": True,
        "faceId": None
    }
]

result = rfid_users.insert_many(users)
print(f"Inserted {len(result.inserted_ids)} users")
```

## Data Flow - How It Works Now

```
┌─────────────────┐
│  Arduino/RFID   │
│   Reader        │
└────────┬────────┘
         │ Sends: "UID:E280689401A9"
         │
         ▼
┌─────────────────┐
│  MQTT Broker    │
│ (mosquitto)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Flask Backend  │
│  on_mqtt_message│
└────────┬────────┘
         │ Looks up UID in rfid_users
         │
         ▼
┌─────────────────────────────┐
│  MongoDB rfid_users         │
│  Finds: "E280689401A9"      │
│  Returns: name = "ALTAF"    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  access_log Collection      │
│  Records: "ALTAF entered"   │
│  (not "Unknown")            │
└─────────────────────────────┘
```

## What Gets Logged

### Before (without rfid_users mapping):
```json
{
  "action": "room_entry",
  "subject": "Unknown UID: E280689401A9",
  "user_type": "rfid_unknown",
  "timestamp": ISODate()
}
```

### After (with proper mapping):
```json
{
  "action": "room_entry",
  "subject": "ALTAF",
  "user_type": "rfid",
  "timestamp": ISODate()
}
```

## Verify Your Setup

### Check if users are in MongoDB:

```bash
# Using Python
from pymongo import MongoClient

client = MongoClient('mongodb+srv://bleutahadata_db_user:bcyjqK6HX3KLKLAH@facedoorauth.5ik54fz.mongodb.net/FaceIDClasse')
db = client['FaceIDClasse']

# Check RFID users
print("RFID Users:")
for user in db['rfid_users'].find():
    print(f"  UID: {user['uid']}, Name: {user['name']}, Active: {user['active']}")

# Check Face users
print("\nFace Users:")
for user in db['face_users'].find():
    print(f"  Username: {user['_id']}, Name: {user['name']}, Classes: {user['ClasseID']}")

# Check recent access logs
print("\nRecent Access Logs:")
for log in db['access_log'].find().sort('timestamp', -1).limit(10):
    print(f"  {log['timestamp']}: {log['subject']} - {log['action']}")
```

### Using API endpoint:

```bash
# Get all RFID users
curl http://localhost:5000/api/rfid-users

# Example response:
{
  "_id": "507f1f77bcf86cd799439011",
  "uid": "E280689401A9",
  "name": "ALTAF",
  "active": true,
  "faceId": null,
  "createdAt": "2025-01-02T10:00:00"
}
```

## Troubleshooting

### Still Getting "Unknown"?

1. **Check MQTT message format**: Arduino should send something like:
   - `UID:E280689401A9`
   - Or just the UID: `E280689401A9`

2. **Verify UID in MongoDB**: Make sure the UID matches EXACTLY (case-sensitive):
   ```python
   rfid_user = db['rfid_users'].find_one({'uid': 'E280689401A9'})
   if rfid_user:
       print(f"Found: {rfid_user['name']}")
   else:
       print("UID not in database!")
   ```

3. **Check active status**: The user must have `active: true`

4. **Restart Flask server**: After adding users to MongoDB, restart the Flask app

## Example Complete Setup

```python
from pymongo import MongoClient
from datetime import datetime

# Connect
client = MongoClient('mongodb+srv://bleutahadata_db_user:bcyjqK6HX3KLKLAH@facedoorauth.5ik54fz.mongodb.net/FaceIDClasse')
db = client['FaceIDClasse']

# Clear and repopulate (for testing)
db['rfid_users'].delete_many({})
db['face_users'].delete_many({})

# Add RFID users
rfid_data = [
    {"uid": "E280689401A9", "name": "ALTAF", "active": True, "faceId": None},
    {"uid": "A1B2C3D4E5F6", "name": "yaacoub", "active": True, "faceId": "yaacoub"},
]
db['rfid_users'].insert_many(rfid_data)

# Add Face users
face_data = [
    {"_id": "yaacoub", "name": "yaacoub bourzak", "ClasseID": [1, 2]},
]
db['face_users'].insert_many(face_data)

print("✅ MongoDB setup complete!")
```

Now when you scan an RFID card, you should see "Entry detected: ALTAF" instead of "Entry detected: Unknown"!
