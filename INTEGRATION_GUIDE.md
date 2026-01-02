# Real Data Integration Guide

This guide shows how to replace dummy data with real API data in your SCADA dashboard.

## 🔌 Integration Patterns

### Option 1: REST API (Polling)
Best for: Data that updates every few seconds

### Option 2: WebSocket
Best for: Real-time streaming data

### Option 3: Server-Sent Events (SSE)
Best for: One-way real-time updates

---

## 📡 REST API Integration

### Step 1: Create API Service

Create `src/services/api.js`:

```javascript
const API_BASE_URL = 'https://your-api.com/api';

export const fetchKPIData = async () => {
  const response = await fetch(`${API_BASE_URL}/kpis`);
  if (!response.ok) throw new Error('Failed to fetch KPI data');
  return response.json();
};

export const fetchOccupancyData = async () => {
  const response = await fetch(`${API_BASE_URL}/occupancy`);
  if (!response.ok) throw new Error('Failed to fetch occupancy data');
  return response.json();
};

export const fetchPerformanceData = async () => {
  const response = await fetch(`${API_BASE_URL}/performance`);
  if (!response.ok) throw new Error('Failed to fetch performance data');
  return response.json();
};

export const fetchAlerts = async () => {
  const response = await fetch(`${API_BASE_URL}/alerts`);
  if (!response.ok) throw new Error('Failed to fetch alerts');
  return response.json();
};
```

### Step 2: Update App.jsx

```javascript
import React, { useState, useEffect } from 'react';
import { fetchKPIData, fetchOccupancyData, fetchPerformanceData, fetchAlerts } from './services/api';

function App() {
  const [kpiData, setKpiData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [kpis, occupancy, performance, alertsData] = await Promise.all([
          fetchKPIData(),
          fetchOccupancyData(),
          fetchPerformanceData(),
          fetchAlerts()
        ]);
        
        setKpiData(kpis);
        setOccupancyData(occupancy);
        setPerformanceData(performance);
        setAlerts(alertsData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Poll every 5 seconds
    const interval = setInterval(loadData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neon-blue text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Rest of your dashboard */}
    </div>
  );
}
```

---

## 🔄 WebSocket Integration

### Step 1: Create WebSocket Hook

Create `src/hooks/useWebSocket.js`:

```javascript
import { useEffect, useState, useRef } from 'react';

export const useWebSocket = (url) => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setData(message);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const sendMessage = (message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { data, isConnected, sendMessage };
};
```

### Step 2: Use in App.jsx

```javascript
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const { data: wsData, isConnected } = useWebSocket('wss://your-api.com/ws');
  
  const [kpiData, setKpiData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (wsData) {
      // Update state based on message type
      switch (wsData.type) {
        case 'kpi_update':
          setKpiData(wsData.payload);
          break;
        case 'new_alert':
          setAlerts(prev => [wsData.payload, ...prev].slice(0, 10));
          break;
        default:
          console.log('Unknown message type:', wsData.type);
      }
    }
  }, [wsData]);

  return (
    <div className="min-h-screen p-6">
      {/* Connection indicator */}
      <div className={`fixed top-4 right-4 w-3 h-3 rounded-full ${
        isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
      }`} />
      
      {/* Rest of dashboard */}
    </div>
  );
}
```

---

## 📊 Expected API Response Formats

### KPI Data
```json
[
  {
    "title": "People Inside",
    "value": 2048,
    "unit": "",
    "icon": "👥",
    "trend": "up",
    "trendValue": "+12%"
  }
]
```

### Occupancy Data (Donut Chart)
```json
[
  {
    "label": "Occupied",
    "value": 65,
    "color": "#00d4ff"
  }
]
```

### Performance Data (Bar Chart)
```json
[
  {
    "label": "NY",
    "value": 6010,
    "color": "#00d4ff"
  }
]
```

### Alerts
```json
[
  {
    "level": "critical",
    "message": "Server EC2 high CPU usage",
    "time": "14:32:18"
  }
]
```

---

## 🔐 Authentication

### Add Auth Token

```javascript
// src/services/api.js
const API_BASE_URL = 'https://your-api.com/api';
const AUTH_TOKEN = 'your-auth-token'; // Store in env variable

export const fetchKPIData = async () => {
  const response = await fetch(`${API_BASE_URL}/kpis`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - check your token');
    }
    throw new Error('Failed to fetch KPI data');
  }
  
  return response.json();
};
```

### Environment Variables

Create `.env`:
```
VITE_API_BASE_URL=https://your-api.com/api
VITE_AUTH_TOKEN=your-auth-token
VITE_WS_URL=wss://your-api.com/ws
```

Use in code:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;
```

---

## 🧪 Testing with Mock Data

### Create Mock Server

Install `json-server`:
```bash
npm install -D json-server
```

Create `db.json`:
```json
{
  "kpis": [
    {
      "title": "People Inside",
      "value": 2048,
      "unit": "",
      "icon": "👥",
      "trend": "up",
      "trendValue": "+12%"
    }
  ],
  "occupancy": [
    { "label": "Occupied", "value": 65, "color": "#00d4ff" },
    { "label": "Available", "value": 25, "color": "#10b981" },
    { "label": "Maintenance", "value": 10, "color": "#f59e0b" }
  ],
  "alerts": [
    {
      "level": "critical",
      "message": "Server EC2 high CPU usage",
      "time": "14:32:18"
    }
  ]
}
```

Add to `package.json`:
```json
{
  "scripts": {
    "mock-api": "json-server --watch db.json --port 3001"
  }
}
```

Run mock server:
```bash
npm run mock-api
```

Update API URL:
```javascript
const API_BASE_URL = 'http://localhost:3001';
```

---

## 🔄 Data Transformation

### Transform API Response

```javascript
// src/utils/transformers.js

export const transformKPIData = (apiData) => {
  return apiData.map(item => ({
    title: item.metric_name,
    value: item.current_value,
    unit: item.unit || '',
    icon: getIconForMetric(item.metric_name),
    trend: item.change >= 0 ? 'up' : 'down',
    trendValue: `${item.change >= 0 ? '+' : ''}${item.change}%`
  }));
};

const getIconForMetric = (metricName) => {
  const iconMap = {
    'people_inside': '👥',
    'open_rooms': '🚪',
    'active_lectures': '📚',
    'total_capacity': '📊'
  };
  return iconMap[metricName] || '📊';
};

export const transformChartData = (apiData) => {
  return apiData.map((item, index) => ({
    label: item.name,
    value: item.value,
    color: item.color || getColorForIndex(index)
  }));
};

const getColorForIndex = (index) => {
  const colors = ['#00d4ff', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'];
  return colors[index % colors.length];
};
```

Use in App.jsx:
```javascript
import { transformKPIData, transformChartData } from './utils/transformers';

const loadData = async () => {
  const rawKpis = await fetchKPIData();
  setKpiData(transformKPIData(rawKpis));
};
```

---

## 🚨 Error Handling

### Retry Logic

```javascript
// src/utils/retry.js
export const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    console.log(`Retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
};
```

Use in API calls:
```javascript
import { fetchWithRetry } from './utils/retry';

const loadData = async () => {
  try {
    const kpis = await fetchWithRetry(() => fetchKPIData());
    setKpiData(kpis);
  } catch (error) {
    setError('Failed to load data after multiple attempts');
  }
};
```

---

## 📈 Performance Optimization

### Debounce Updates

```javascript
import { useEffect, useRef } from 'react';

const useDebouncedUpdate = (callback, delay = 500) => {
  const timeoutRef = useRef(null);

  return (data) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(data);
    }, delay);
  };
};

// Usage
const debouncedSetKpiData = useDebouncedUpdate(setKpiData, 500);
```

### Memoize Expensive Calculations

```javascript
import { useMemo } from 'react';

function App() {
  const totalOccupancy = useMemo(() => {
    return occupancyData.reduce((sum, item) => sum + item.value, 0);
  }, [occupancyData]);
  
  return (
    // Use totalOccupancy
  );
}
```

---

## 🔍 Debugging

### Add Logging

```javascript
// src/utils/logger.js
export const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

Use in code:
```javascript
import { logger } from './utils/logger';

const loadData = async () => {
  try {
    logger.info('Fetching KPI data...');
    const kpis = await fetchKPIData();
    logger.info('KPI data loaded', kpis);
    setKpiData(kpis);
  } catch (error) {
    logger.error('Failed to load KPI data', error);
  }
};
```

---

## 📦 Complete Example

```javascript
// src/App.jsx - Full integration example
import React, { useState, useEffect } from 'react';
import { fetchKPIData, fetchOccupancyData, fetchAlerts } from './services/api';
import { transformKPIData, transformChartData } from './utils/transformers';
import { fetchWithRetry } from './utils/retry';
import { logger } from './utils/logger';

function App() {
  const [kpiData, setKpiData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        logger.info('Loading dashboard data...');
        
        const [rawKpis, rawOccupancy, rawAlerts] = await Promise.all([
          fetchWithRetry(() => fetchKPIData()),
          fetchWithRetry(() => fetchOccupancyData()),
          fetchWithRetry(() => fetchAlerts())
        ]);
        
        setKpiData(transformKPIData(rawKpis));
        setOccupancyData(transformChartData(rawOccupancy));
        setAlerts(rawAlerts);
        
        setError(null);
        logger.info('Dashboard data loaded successfully');
      } catch (err) {
        logger.error('Failed to load dashboard data', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className="min-h-screen p-6">
      {/* Your dashboard components */}
    </div>
  );
}

export default App;
```

---

## 🎯 Next Steps

1. ✅ Set up your API endpoints
2. ✅ Create API service functions
3. ✅ Add data transformers if needed
4. ✅ Implement error handling
5. ✅ Test with mock data first
6. ✅ Connect to real API
7. ✅ Add loading states
8. ✅ Optimize performance

---

Happy coding! 🚀
