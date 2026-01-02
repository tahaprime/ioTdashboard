import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import './RoomAccessManagement.css';

export default function RoomAccessManagement({ addToast }) {
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [newRoomForm, setNewRoomForm] = useState(false);
  const [roomLogs, setRoomLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  // Form states
  const [newRoom, setNewRoom] = useState({
    name: '',
    location: '',
    capacity: ''
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    loadData();
    
    // Poll for notifications every 2 seconds
    const interval = setInterval(pollNotifications, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, usersData] = await Promise.all([
        apiClient.getRooms(),
        apiClient.getUsers()
      ]);
      setRooms(roomsData);
      setUsers(usersData);
      setAllUsers(usersData);
      if (roomsData.length > 0) {
        selectRoom(roomsData[0]);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      addToast(`Error loading data: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const pollNotifications = async () => {
    try {
      const notification = await apiClient.getLatestNotification();
      if (notification && notification.subject) {
        addToast(`🚪 Room Entry: ${notification.subject}`, 'info');
      }
    } catch (err) {
      // Silent fail for polling
    }
  };

  const selectRoom = async (room) => {
    setSelectedRoom(room);
    try {
      const access = await apiClient.getRoomAccess(room._id);
      setRoomUsers(access.users || []);
      
      // Load room logs
      const logs = await apiClient.getRoomLogs(room._id);
      setRoomLogs(logs || []);
    } catch (err) {
      console.error('Error loading room details:', err);
      addToast(`Error loading room details: ${err.message}`, 'error');
      // Set empty data on error
      setRoomUsers([]);
      setRoomLogs([]);
    }
  };

  const handleGrantAccess = async (user) => {
    if (!selectedRoom || !user) return;
    
    try {
      // Get the correct identifier based on user type
      const identifier = user.type === 'face' ? user._id : (user.uid || user._id);
      const userType = user.type || 'rfid';
      
      await apiClient.grantAccess(selectedRoom._id, identifier, userType);
      addToast(`✓ Access granted to ${user.name}`, 'success');
      selectRoom(selectedRoom); // Refresh
      loadData(); // Refresh rooms list
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleRevokeAccess = async (user) => {
    if (!selectedRoom || !user) return;
    
    try {
      // Get the correct identifier based on user type
      const identifier = user.type === 'face' ? user._id : (user.uid || user._id);
      
      await apiClient.revokeAccess(selectedRoom._id, identifier);
      addToast(`✓ Access revoked from ${user.name}`, 'success');
      selectRoom(selectedRoom); // Refresh
      loadData(); // Refresh rooms list
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!newRoom.name || !newRoom.location || !newRoom.capacity) {
      addToast('Please fill in all fields', 'warning');
      return;
    }

    try {
      const room = await apiClient.createRoom(
        newRoom.name,
        newRoom.location,
        parseInt(newRoom.capacity),
        '1' // Default to admin user
      );
      addToast(`✓ Room "${room.name}" created successfully`, 'success');
      setNewRoom({ name: '', location: '', capacity: '' });
      setNewRoomForm(false);
      loadData();
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email) {
      addToast('Please fill in all fields', 'warning');
      return;
    }

    try {
      const user = await apiClient.createUser(newUser.name, newUser.email);
      addToast(`✓ User "${user.name}" created successfully`, 'success');
      setNewUser({ name: '', email: '' });
      loadData();
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    }
  };

  const getUsername = (user) => {
    if (typeof user === 'string') {
      // If it's a string (old ID), find user in users array
      const foundUser = users.find(u => u._id === user || u.id === user);
      return foundUser ? foundUser.name : `User ${user}`;
    }
    return user.name || 'Unknown User';
  };

  const getAvailableUsers = () => {
    if (!selectedRoom) return [];
    // Get room user identifiers
    const roomUserIdentifiers = roomUsers.map(u => {
      return u.type === 'face' ? u._id : (u.uid || u._id);
    });
    // Filter out users that already have access
    return allUsers.filter(u => {
      const identifier = u.type === 'face' ? u._id : (u.uid || u._id);
      return !roomUserIdentifiers.includes(identifier);
    });
  };

  if (loading) {
    return (
      <div className="ram-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ram-container">
      <div className="ram-header">
        <h1>🔐 Room Access Management</h1>
        <p>Grant and revoke user access to rooms</p>
      </div>

      {error && <div className="ram-error">{error}</div>}

      <div className="ram-layout">
        {/* Left Panel - Rooms */}
        <div className="ram-panel ram-rooms">
          <div className="ram-panel-header">
            <h2>Rooms ({rooms.length})</h2>
            <button
              className="btn-primary-small"
              onClick={() => setNewRoomForm(!newRoomForm)}
            >
              {newRoomForm ? '✕' : '+ New Room'}
            </button>
          </div>

          {newRoomForm && (
            <form className="ram-form" onSubmit={handleCreateRoom}>
              <input
                type="text"
                placeholder="Room name"
                value={newRoom.name}
                onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                className="ram-input"
              />
              <input
                type="text"
                placeholder="Location"
                value={newRoom.location}
                onChange={e => setNewRoom({ ...newRoom, location: e.target.value })}
                className="ram-input"
              />
              <input
                type="number"
                placeholder="Capacity"
                value={newRoom.capacity}
                onChange={e => setNewRoom({ ...newRoom, capacity: e.target.value })}
                className="ram-input"
              />
              <button type="submit" className="btn-primary">Create</button>
            </form>
          )}

          <div className="ram-list">
            {rooms.map(room => (
              <div
                key={room.id}
                className={`ram-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => selectRoom(room)}
              >
                <div className="ram-item-title">🚪 {room.name}</div>
                <div className="ram-item-subtitle">{room.location}</div>
                <div className="ram-item-meta">
                  <span className="badge">👥 {room.users_with_access?.length || 0}</span>
                  <span className="badge">📊 Cap: {room.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Room Details & Access */}
        <div className="ram-panel ram-main">
          {selectedRoom ? (
            <>
              <div className="ram-panel-header">
                <div>
                  <h2>{selectedRoom.name}</h2>
                  <p>{selectedRoom.location}</p>
                </div>
                <div className="ram-stats">
                  <div className="stat">
                    <span className="stat-label">Capacity</span>
                    <span className="stat-value">{selectedRoom.capacity}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Users</span>
                    <span className="stat-value">{roomUsers.length}</span>
                  </div>
                </div>
              </div>

              <div className="ram-tabs">
                <button
                  className={`tab ${!showLogs ? 'active' : ''}`}
                  onClick={() => setShowLogs(false)}
                >
                  👤 Access Control
                </button>
                <button
                  className={`tab ${showLogs ? 'active' : ''}`}
                  onClick={() => setShowLogs(true)}
                >
                  📋 Activity Log
                </button>
              </div>

              {!showLogs ? (
                <div className="ram-content">
                  <div className="access-section">
                    <h3>Users With Access</h3>
                    {roomUsers.length > 0 ? (
                      <div className="users-list">
                        {roomUsers.map(user => {
                          const userId = user.type === 'face' ? user._id : (user.uid || user._id);
                          return (
                            <div key={userId} className="user-item has-access">
                              <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="user-email">{user.type === 'face' ? user._id : user.uid}</div>
                              </div>
                              <button
                                className="btn-danger"
                                onClick={() => handleRevokeAccess(user)}
                              >
                                Revoke
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="empty-state">No users have access yet</p>
                    )}
                  </div>

                  {getAvailableUsers().length > 0 && (
                    <div className="access-section">
                      <h3>Grant Access</h3>
                      <div className="users-list">
                        {getAvailableUsers().map(user => {
                          const userId = user.type === 'face' ? user._id : (user.uid || user._id);
                          return (
                            <div key={userId} className="user-item no-access">
                              <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="user-email">{user.type === 'face' ? user._id : user.uid}</div>
                              </div>
                              <button
                                className="btn-success"
                                onClick={() => handleGrantAccess(user)}
                              >
                                Grant
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ram-content">
                  <h3>Activity Log</h3>
                  {roomLogs.length > 0 ? (
                    <div className="logs-list">
                      {roomLogs.map(log => (
                        <div key={log.id} className="log-item">
                          <div className="log-time">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                          <div className="log-action">
                            {log.action === 'grant' && '✓ Access Granted'}
                            {log.action === 'revoke' && '✕ Access Revoked'}
                            {log.action === 'room_entry' && '🚪 Entry Detected'}
                          </div>
                          {log.subject && (
                            <div className="log-subject">{log.subject}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No activity yet</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>Select a room to manage access</p>
            </div>
          )}
        </div>

        {/* Right Panel - Users */}
        <div className="ram-panel ram-users">
          <div className="ram-panel-header">
            <h2>Users ({users.length})</h2>
            <button
              className="btn-primary-small"
              onClick={() => setNewRoomForm(false)} // Just to show we can add users
            >
              + Add User
            </button>
          </div>

          <div className="ram-form-compact">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              className="ram-input-compact"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              className="ram-input-compact"
            />
            <button onClick={handleCreateUser} className="btn-primary-compact">
              Create User
            </button>
          </div>

          <div className="ram-list">
            {users.map(user => {
              const userId = user.type === 'face' ? user._id : (user.uid || user._id);
              return (
                <div key={userId} className="ram-user-item">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.type === 'face' ? user._id : user.uid}</div>
                    <div className="user-role">{user.type}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
