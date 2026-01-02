# SCADA Dashboard - Component API Reference

## Quick Import Guide

```javascript
import StatusBar from './components/StatusBar';
import KPICard from './components/KPICard';
import MapVisualization from './components/MapVisualization';
import DonutChart from './components/DonutChart';
import BarChart from './components/BarChart';
import AlertTicker from './components/AlertTicker';
```

---

## 📊 StatusBar

**Purpose**: Top header with system status and live clock

### Props
```typescript
{
  systemName: string;      // Dashboard title
  status: string;          // System status (currently unused, always shows "ONLINE")
  timestamp: string;       // Current time (HH:MM:SS format)
}
```

### Example
```jsx
<StatusBar 
  systemName="ARITHMETIC NETWORK COCKPIT" 
  status="online"
  timestamp="14:32:18"
/>
```

---

## 📈 KPICard

**Purpose**: Display key performance indicators with trend

### Props
```typescript
{
  title: string;           // Metric name
  value: number;           // Main value
  unit?: string;           // Optional unit (e.g., "ms", "%")
  icon?: string;           // Emoji or icon character
  trend?: 'up' | 'down';   // Trend direction
  trendValue?: string;     // Trend percentage (e.g., "+12%")
}
```

### Example
```jsx
<KPICard 
  title="People Inside"
  value={2048}
  icon="👥"
  trend="up"
  trendValue="+12%"
/>
```

---

## 🗺️ MapVisualization

**Purpose**: Interactive facility map with zone grid

### Props
```typescript
// No props - fully self-contained
```

### Features
- 3x3 interactive zone grid
- Hover to see zone details
- Active zone indicators
- Scanning animation
- Corner decorations

### Example
```jsx
<MapVisualization />
```

---

## 🍩 DonutChart

**Purpose**: Circular chart showing proportional data

### Props
```typescript
{
  data: Array<{
    label: string;         // Segment label
    value: number;         // Segment value
    color: string;         // Hex color (e.g., "#00d4ff")
  }>;
  title: string;           // Chart title
}
```

### Example
```jsx
<DonutChart 
  title="Occupancy Distribution"
  data={[
    { label: 'Occupied', value: 65, color: '#00d4ff' },
    { label: 'Available', value: 25, color: '#10b981' },
    { label: 'Maintenance', value: 10, color: '#f59e0b' }
  ]}
/>
```

---

## 📊 BarChart

**Purpose**: Horizontal bar chart for comparative data

### Props
```typescript
{
  data: Array<{
    label: string;         // Bar label
    value: number;         // Bar value
    color: string;         // Hex color (e.g., "#00d4ff")
  }>;
  title: string;           // Chart title
}
```

### Example
```jsx
<BarChart 
  title="Performance by Region"
  data={[
    { label: 'NY', value: 6010, color: '#00d4ff' },
    { label: 'LA', value: 3781, color: '#06b6d4' },
    { label: 'SF', value: 5420, color: '#0ea5e9' }
  ]}
/>
```

---

## 🚨 AlertTicker

**Purpose**: Scrolling alert feed at bottom of dashboard

### Props
```typescript
{
  alerts: Array<{
    level: 'critical' | 'warning' | 'info';  // Severity level
    message: string;                          // Alert message
    time: string;                             // Timestamp (HH:MM:SS)
  }>;
}
```

### Example
```jsx
<AlertTicker 
  alerts={[
    { 
      level: 'critical', 
      message: 'Server EC2 high CPU usage', 
      time: '14:32:18' 
    },
    { 
      level: 'warning', 
      message: 'Temperature threshold exceeded', 
      time: '14:30:45' 
    },
    { 
      level: 'info', 
      message: 'Backup completed successfully', 
      time: '14:28:12' 
    }
  ]}
/>
```

---

## 🎨 Custom CSS Classes

### Glass Effects
```css
.glass-card              /* Basic glass card */
.glass-card-glow         /* Glass card with neon glow */
```

### Neon Effects
```css
.neon-border             /* Glowing border */
.neon-text               /* Glowing text */
.shadow-neon             /* Soft glow shadow */
.shadow-neon-strong      /* Intense glow shadow */
```

### Backgrounds
```css
.grid-pattern            /* Grid overlay background */
```

### Animations
```css
.animate-pulse-glow      /* Pulsing glow effect */
.animate-ticker          /* Scrolling ticker animation */
```

---

## 🎨 Color Palette

### Primary Colors
```javascript
'dark-bg': '#0a0e27'           // Main background
'card-bg': 'rgba(15,23,42,0.6)' // Card background
'neon-blue': '#00d4ff'          // Primary accent
'neon-cyan': '#00ffff'          // Secondary accent
```

### Chart Colors (Recommended)
```javascript
'#00d4ff'  // Neon Blue
'#06b6d4'  // Cyan 500
'#0ea5e9'  // Sky 500
'#3b82f6'  // Blue 500
'#6366f1'  // Indigo 500
'#10b981'  // Green 500
'#f59e0b'  // Amber 500
'#ef4444'  // Red 500
```

---

## 📐 Layout Grid

The dashboard uses a 12-column grid:

```jsx
<div className="grid grid-cols-12 gap-6">
  {/* Left Panel - 3 columns */}
  <div className="col-span-12 lg:col-span-3">
    {/* KPIs */}
  </div>
  
  {/* Center Panel - 6 columns */}
  <div className="col-span-12 lg:col-span-6">
    {/* Map */}
  </div>
  
  {/* Right Panel - 3 columns */}
  <div className="col-span-12 lg:col-span-3">
    {/* Analytics */}
  </div>
</div>
```

---

## 🔧 Customization Examples

### Change Neon Color
```javascript
// tailwind.config.js
colors: {
  'neon-blue': '#ff00ff',  // Change to magenta
}
```

### Add New KPI
```javascript
// App.jsx
const kpiData = [
  ...kpiData,
  { 
    title: 'Energy Usage', 
    value: 1250, 
    unit: 'kWh',
    icon: '⚡', 
    trend: 'down', 
    trendValue: '-5%' 
  }
];
```

### Customize Alert Colors
```javascript
// AlertTicker.jsx - modify className logic
alert.level === 'critical' ? 'bg-purple-500/20 text-purple-400' :
alert.level === 'warning' ? 'bg-orange-500/20 text-orange-400' :
'bg-cyan-500/20 text-cyan-400'
```

---

## 🚀 Performance Optimization

### Reduce Animation Load
```css
/* index.css - reduce blur */
.glass-card {
  backdrop-filter: blur(4px);  /* Default: blur(12px) */
}
```

### Disable Ticker Animation
```css
/* index.css - comment out */
/* .animate-ticker {
  animation: ticker-scroll 30s linear infinite;
} */
```

### Optimize Chart Rendering
```javascript
// Use React.memo for charts
export default React.memo(DonutChart);
export default React.memo(BarChart);
```

---

## 📱 Responsive Breakpoints

```javascript
// Tailwind breakpoints
sm: '640px'   // Small devices
md: '768px'   // Medium devices
lg: '1024px'  // Large devices (dashboard optimized for this)
xl: '1280px'  // Extra large
2xl: '1536px' // 2X Extra large
```

### Mobile Optimization
```jsx
{/* Stack vertically on mobile */}
<div className="col-span-12 lg:col-span-3">
```

---

## 🐛 Troubleshooting

### Charts not rendering?
- Check data format matches expected structure
- Ensure color values are valid hex codes
- Verify values are numbers, not strings

### Animations not working?
- Check if `index.css` is imported in `main.jsx`
- Verify Tailwind is processing the CSS
- Clear browser cache

### Glassmorphism not showing?
- Ensure browser supports `backdrop-filter`
- Check if parent has background
- Try increasing blur value

---

## 📚 Additional Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [CSS Glassmorphism Generator](https://ui.glass/generator)
