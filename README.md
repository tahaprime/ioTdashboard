# SCADA Dashboard - Documentation

## 🚀 Overview
A futuristic SCADA-style control center dashboard built with React and Tailwind CSS. Features glassmorphism effects, neon blue glowing borders, and a dark cyberpunk aesthetic inspired by industrial control systems.

## 📋 Features

### Layout Structure
- **Top Status Bar**: Live system status with animated indicators
- **Left Panel**: KPI cards showing key metrics (People Inside, Open Rooms, Active Lectures, Total Capacity)
- **Center Panel**: Interactive facility map visualization with zone indicators
- **Right Panel**: Analytics with donut chart and bar chart
- **Bottom Ticker**: Scrolling alert feed with severity levels

### Design Elements
✨ **Glassmorphism**: Translucent cards with backdrop blur
🌟 **Neon Glow**: Blue glowing borders and text shadows
🎨 **Dark Theme**: Deep blue gradient background
📊 **Interactive Charts**: Animated donut and bar charts
⚡ **Animations**: Pulsing indicators, scrolling ticker, hover effects
🎯 **Responsive**: Adapts to different screen sizes

## 🛠️ Tech Stack
- **React 18**: Component-based UI framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS v4**: Utility-first CSS framework (using new @theme syntax)
- **Custom CSS**: Animations and glassmorphism effects

## 📁 Project Structure
```
IoT/
├── src/
│   ├── components/
│   │   ├── StatusBar.jsx       # Top status bar with live indicators
│   │   ├── KPICard.jsx          # Reusable KPI metric card
│   │   ├── MapVisualization.jsx # Center map with zone grid
│   │   ├── DonutChart.jsx       # SVG donut chart component
│   │   ├── BarChart.jsx         # Horizontal bar chart
│   │   └── AlertTicker.jsx      # Scrolling alert feed
│   ├── App.jsx                  # Main dashboard layout
│   ├── index.css                # Tailwind v4 + custom styles (@theme)
│   └── main.jsx                 # React entry point
├── postcss.config.js            # PostCSS setup (@tailwindcss/postcss)
└── package.json                 # Dependencies
```

## 🎨 Component Details

### StatusBar
- Live system status indicator (green pulsing dot)
- Dashboard title with neon glow
- Real-time clock display
- Animated loading dots

### KPICard
Props:
- `title`: Metric name
- `value`: Numeric value
- `unit`: Optional unit label
- `icon`: Emoji or icon
- `trend`: 'up' or 'down'
- `trendValue`: Percentage change

### MapVisualization
- 3x3 grid of interactive zones
- Hover effects showing zone details
- Active zone indicators (green dots)
- Scanning animation effect
- Corner decorations

### DonutChart
Props:
- `data`: Array of {label, value, color}
- `title`: Chart title

Features:
- SVG-based rendering
- Percentage calculations
- Color-coded legend
- Glow effects on segments

### BarChart
Props:
- `data`: Array of {label, value, color}
- `title`: Chart title

Features:
- Gradient-filled bars
- Animated width transitions
- Scanning indicator line
- Hover glow effects

### AlertTicker
Props:
- `alerts`: Array of {level, message, time}

Features:
- Infinite scroll animation
- Color-coded severity (critical/warning/info)
- Timestamp display

## 🎨 Custom Tailwind Classes

### Utility Classes
- `.glass-card`: Basic glassmorphism card
- `.glass-card-glow`: Glass card with neon glow
- `.neon-border`: Glowing border effect
- `.neon-text`: Glowing text effect
- `.grid-pattern`: Background grid overlay

### Custom Colors
- `dark-bg`: #0a0e27
- `card-bg`: rgba(15, 23, 42, 0.6)
- `neon-blue`: #00d4ff
- `neon-cyan`: #00ffff

### Custom Shadows
- `shadow-neon`: Soft blue glow
- `shadow-neon-strong`: Intense blue glow

## 🔧 Customization

### Changing Colors
Edit `src/index.css` using the `@theme` directive:
```css
@theme {
  --color-neon-blue: '#YOUR_COLOR';
  --color-neon-cyan: '#YOUR_COLOR';
  --color-dark-bg: '#YOUR_COLOR';
}
```

> **Note**: Tailwind CSS v4 uses the `@theme` directive instead of `tailwind.config.js`. See `TAILWIND_V4_MIGRATION.md` for details.

### Modifying Data
Update dummy data in `App.jsx`:
```javascript
const kpiData = [
  { title: 'Your Metric', value: 100, ... }
];
```

### Adding New Components
1. Create component in `src/components/`
2. Import in `App.jsx`
3. Add to layout grid

## 🚀 Running the Project

### Development
```bash
npm run dev
```
Server runs at: http://localhost:5173/

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📊 Data Structure Examples

### KPI Data
```javascript
{
  title: 'People Inside',
  value: 2048,
  unit: '',
  icon: '👥',
  trend: 'up',
  trendValue: '+12%'
}
```

### Chart Data
```javascript
// Donut Chart
{
  label: 'Occupied',
  value: 65,
  color: '#00d4ff'
}

// Bar Chart
{
  label: 'NY',
  value: 6010,
  color: '#00d4ff'
}
```

### Alert Data
```javascript
{
  level: 'critical', // 'critical' | 'warning' | 'info'
  message: 'Server EC2 Arithmetic Requirements',
  time: '14:32:18'
}
```

## 🎯 Performance Tips
- Charts use CSS transforms for smooth animations
- Ticker animation is GPU-accelerated
- Glassmorphism uses backdrop-filter (may impact performance on low-end devices)
- Consider reducing blur intensity for better performance

## 🔮 Future Enhancements
- [ ] Real-time data integration via WebSocket
- [ ] Interactive zone click handlers
- [ ] Export dashboard as PDF/image
- [ ] Dark/light theme toggle
- [ ] Customizable layout (drag & drop)
- [ ] Historical data charts
- [ ] Alert filtering and search
- [ ] User authentication
- [ ] Multi-dashboard support

## 📝 License
MIT

## 👨‍💻 Author
Built with ❤️ using React + Tailwind CSS
