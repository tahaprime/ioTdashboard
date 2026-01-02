import React, { useState, useEffect } from 'react';
import StatusBar from './components/StatusBar';
import KPICard from './components/KPICard';
import MapVisualization from './components/MapVisualization';
import DonutChart from './components/DonutChart';
import BarChart from './components/BarChart';
import AlertTicker from './components/AlertTicker';
import RoomAccessManagement from './components/RoomAccessManagement';
import { useToast, ToastContainer } from './components/Toast';
import './index.css';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { toasts, addToast, removeToast } = useToast();

  // State for real data from backend
  const [kpiData, setKpiData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://127.0.0.1:5000/api';

  // Fetch data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch users and rooms in parallel
        const [usersRes, roomsRes, logsRes, notificationsRes] = await Promise.all([
          fetch(`${API_BASE}/users`),
          fetch(`${API_BASE}/rooms`),
          fetch(`${API_BASE}/logs/access?limit=20`),
          fetch(`${API_BASE}/notifications?limit=20`)
        ]);

        const users = usersRes.ok ? await usersRes.json() : [];
        const rooms = roomsRes.ok ? await roomsRes.json() : [];
        const logs = logsRes.ok ? await logsRes.json() : [];
        const notifications = notificationsRes.ok ? await notificationsRes.json() : [];

        // Build KPI data
        const kpis = [
          { title: 'People Inside', value: users.length || 0, unit: '', icon: '👥', trend: 'up', trendValue: '+12%' },
          { title: 'Open Rooms', value: rooms.filter(r => r.status === 'available').length || 0, unit: '', icon: '🚪', trend: 'down', trendValue: '-3%' },
          { title: 'Active Access', value: logs.length || 0, unit: '', icon: '🔑', trend: 'up', trendValue: '+8%' },
          { title: 'System Health', value: 98, unit: '%', icon: '⚡', trend: 'up', trendValue: '+2%' },
        ];
        setKpiData(kpis);

        // Build occupancy data from rooms
        const occupied = rooms.filter(r => r.status === 'occupied').length || 0;
        const available = rooms.filter(r => r.status === 'available').length || 0;
        const maintenance = rooms.filter(r => r.status === 'maintenance').length || 0;

        setOccupancyData([
          { label: 'Occupied', value: occupied, color: '#00d4ff' },
          { label: 'Available', value: available, color: '#10b981' },
          { label: 'Maintenance', value: maintenance, color: '#f59e0b' },
        ]);

        // Build performance data from room distribution
        const performanceByType = {};
        rooms.forEach(room => {
          const type = room.location || 'Other';
          performanceByType[type] = (performanceByType[type] || 0) + 1;
        });

        const colors = ['#00d4ff', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'];
        const perfData = Object.entries(performanceByType)
          .slice(0, 5)
          .map(([label, value], index) => ({
            label,
            value,
            color: colors[index],
          }));
        setPerformanceData(perfData.length > 0 ? perfData : [
          { label: 'Meeting Rooms', value: 0, color: '#00d4ff' },
          { label: 'Lab Spaces', value: 0, color: '#06b6d4' },
        ]);

        // Build alerts from notifications
        const alertsList = notifications.map((notif, idx) => ({
          level: idx === 0 ? 'critical' : idx === 1 ? 'warning' : 'info',
          message: notif.message || `${notif.subject} - ${notif.type}`,
          time: new Date(notif.timestamp).toLocaleTimeString('en-US', { hour12: false }),
        }));
        setAlerts(alertsList.length > 0 ? alertsList : [
          { level: 'info', message: 'System ready for operations', time: new Date().toLocaleTimeString('en-US', { hour12: false }) },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        addToast('Failed to load dashboard data', 'error');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-content">
          <div className="nav-brand">
            <span className="nav-icon">📡</span>
            <span>IoT Control Center</span>
          </div>
          <div className="nav-links">
            <button
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-link ${currentPage === 'rooms' ? 'active' : ''}`}
              onClick={() => setCurrentPage('rooms')}
            >
              🔐 Room Access
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'dashboard' && (
        <div className="min-h-screen p-6">
          {/* Status Bar */}
          <StatusBar
            systemName="IoT DASHBOARD"
            status={loading ? 'loading' : 'online'}
            timestamp={currentTime.toLocaleTimeString('en-US', { hour12: false })}
          />

          {loading && (
            <div className="glass-card p-6 mb-6 text-center">
              <p className="text-neon-cyan">Loading dashboard data...</p>
            </div>
          )}

          {/* Main Grid Layout */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            {/* Left Panel - KPIs */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <div className="glass-card p-4">
                <h2 className="text-sm font-semibold text-neon-blue mb-4 uppercase tracking-wider">
                  System Overview
                </h2>
                <div className="space-y-3">
                  {kpiData.map((kpi, index) => (
                    <KPICard key={index} {...kpi} />
                  ))}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Room Statistics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neon-blue/10 border border-neon-blue/30 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-neon-cyan">12</p>
                    <p className="text-[10px] text-gray-400 mt-1">Total Rooms</p>
                  </div>
                  <div className="bg-neon-blue/10 border border-neon-blue/30 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-neon-cyan">48</p>
                    <p className="text-[10px] text-gray-400 mt-1">Users</p>
                  </div>
                  <div className="bg-neon-blue/10 border border-neon-blue/30 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-neon-cyan">156</p>
                    <p className="text-[10px] text-gray-400 mt-1">Access Grants</p>
                  </div>
                  <div className="bg-neon-blue/10 border border-neon-blue/30 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-neon-cyan">8</p>
                    <p className="text-[10px] text-gray-400 mt-1">Logged Today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Panel - Map */}
            <div className="col-span-12 lg:col-span-6">
              <div className="h-[600px]">
                <MapVisualization />
              </div>
            </div>

            {/* Right Panel - Analytics */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <div className="glass-card p-4">
                <h2 className="text-sm font-semibold text-neon-blue mb-4 uppercase tracking-wider">
                  Room Distribution
                </h2>

                <DonutChart data={occupancyData} title="Room Status" />
              </div>

              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Access Summary</h3>
                <div className="bg-neon-blue/10 border border-neon-blue/30 rounded p-3 mb-3">
                  <p className="text-xs text-gray-400">Active Rooms</p>
                  <p className="text-sm text-neon-cyan font-mono">10/12</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400 mb-1">Access Control</p>
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500">Grant</span>
                        <span className="text-gray-300">156</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500">Revoke</span>
                        <span className="text-gray-300">23</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500">Active</span>
                        <span className="text-gray-300">133</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Today's Activity</p>
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500">Entries</span>
                        <span className="text-gray-300">42</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500">Denials</span>
                        <span className="text-gray-300">3</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-gray-500">Alerts</span>
                        <span className="text-gray-300">2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <BarChart data={performanceData} title="Room Utilization" />
            </div>
          </div>

          {/* Bottom Alert Ticker */}
          <AlertTicker alerts={alerts} />
        </div>
      )}

      {currentPage === 'rooms' && (
        <RoomAccessManagement addToast={addToast} />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
