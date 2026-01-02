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
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role })
    });
    if (!response.ok) throw new Error('Failed to create user');
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
  async grantAccess(roomId, userId) {
    const response = await fetch(`${API_BASE_URL}/access/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, user_id: userId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to grant access');
    }
    return response.json();
  },

  async revokeAccess(roomId, userId) {
    const response = await fetch(`${API_BASE_URL}/access/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, user_id: userId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to revoke access');
    }
    return response.json();
  },

  async checkAccess(roomId, userId) {
    const response = await fetch(`${API_BASE_URL}/access/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, user_id: userId })
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
    if (!response.ok) throw new Error('Failed to fetch room access');
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
