// ================= API CLIENT =================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  // ============= USERS =============
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getUser(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async createUser(name, email, role = 'user') {
    // For backward compatibility - create as RFID user by default
    // Or pass uid/username in data object
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role })
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  // ============= RFID USER ENDPOINTS (NEW) =============
  async getRfidUsers() {
    const response = await fetch(`${API_BASE_URL}/rfid-users`);
    if (!response.ok) throw new Error('Failed to fetch RFID users');
    return response.json();
  },

  async getRfidUser(uid) {
    const response = await fetch(`${API_BASE_URL}/rfid-users/${uid}`);
    if (!response.ok) throw new Error('Failed to fetch RFID user');
    return response.json();
  },

  async createRfidUser(uid, name, active = true, faceId = null) {
    const response = await fetch(`${API_BASE_URL}/rfid-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, name, active, faceId })
    });
    if (!response.ok) throw new Error('Failed to create RFID user');
    return response.json();
  },

  async updateRfidUser(uid, data) {
    const response = await fetch(`${API_BASE_URL}/rfid-users/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update RFID user');
    return response.json();
  },

  async deleteRfidUser(uid) {
    const response = await fetch(`${API_BASE_URL}/rfid-users/${uid}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete RFID user');
    return response.json();
  },

  // ============= FACE USER ENDPOINTS (NEW) =============
  async getFaceUsers() {
    const response = await fetch(`${API_BASE_URL}/face-users`);
    if (!response.ok) throw new Error('Failed to fetch face users');
    return response.json();
  },

  async getFaceUser(username) {
    const response = await fetch(`${API_BASE_URL}/face-users/${username}`);
    if (!response.ok) throw new Error('Failed to fetch face user');
    return response.json();
  },

  async createFaceUser(username, name, classIds = []) {
    const response = await fetch(`${API_BASE_URL}/face-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name, classIds })
    });
    if (!response.ok) throw new Error('Failed to create face user');
    return response.json();
  },

  async updateFaceUser(username, data) {
    const response = await fetch(`${API_BASE_URL}/face-users/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update face user');
    return response.json();
  },

  async addClassToFaceUser(username, classId) {
    const response = await fetch(`${API_BASE_URL}/face-users/${username}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId })
    });
    if (!response.ok) throw new Error('Failed to add class');
    return response.json();
  },

  async removeClassFromFaceUser(username, classId) {
    const response = await fetch(`${API_BASE_URL}/face-users/${username}/classes/${classId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove class');
    return response.json();
  },

  async deleteFaceUser(username) {
    const response = await fetch(`${API_BASE_URL}/face-users/${username}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete face user');
    return response.json();
  },

  // ============= AUTHENTICATION (NEW) =============
  async authenticateRfid(uid) {
    const response = await fetch(`${API_BASE_URL}/auth/rfid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'RFID authentication failed');
    }
    return response.json();
  },

  async authenticateFace(username) {
    const response = await fetch(`${API_BASE_URL}/auth/face`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Face authentication failed');
    }
    return response.json();
  },

  // ============= ROOMS =============
  async getRooms() {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    if (!response.ok) throw new Error('Failed to fetch rooms');
    return response.json();
  },

  async getRoom(roomId) {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
    if (!response.ok) throw new Error('Failed to fetch room');
    return response.json();
  },

  async createRoom(name, location, capacity, ownerId) {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location, capacity, owner_id: ownerId })
    });
    if (!response.ok) throw new Error('Failed to create room');
    return response.json();
  },

  // ============= ACCESS CONTROL =============
  async grantAccess(roomId, userIdentifier, userType = 'rfid') {
    const response = await fetch(`${API_BASE_URL}/access/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, user_identifier: userIdentifier, user_type: userType })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to grant access');
    }
    return response.json();
  },

  async revokeAccess(roomId, userIdentifier) {
    const response = await fetch(`${API_BASE_URL}/access/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, user_identifier: userIdentifier })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to revoke access');
    }
    return response.json();
  },

  async checkAccess(roomId, userIdentifier) {
    const response = await fetch(`${API_BASE_URL}/access/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, user_identifier: userIdentifier })
    });
    if (!response.ok) throw new Error('Failed to check access');
    return response.json();
  },

  async getUserRooms(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/rooms`);
    if (!response.ok) throw new Error('Failed to fetch user rooms');
    return response.json();
  },

  async getRoomAccess(roomId) {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/access`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Failed to fetch room access (${response.status}):`, errorData);
      throw new Error(`Failed to fetch room access: ${response.status} ${errorData}`);
    }
    return response.json();
  },

  // ============= LOGS =============
  async getAccessLogs(limit = 50) {
    const response = await fetch(`${API_BASE_URL}/logs/access?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  },

  async getRoomLogs(roomId, limit = 20) {
    const response = await fetch(`${API_BASE_URL}/logs/room/${roomId}?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch room logs');
    return response.json();
  },

  // ============= NOTIFICATIONS =============
  async getNotifications(limit = 20) {
    const response = await fetch(`${API_BASE_URL}/notifications?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  async getLatestNotification() {
    const response = await fetch(`${API_BASE_URL}/notifications/latest`);
    if (!response.ok) throw new Error('Failed to fetch latest notification');
    return response.json();
  },

  async clearNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications/clear`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to clear notifications');
    return response.json();
  },

  // ============= HEALTH =============
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  }
};
