# Enhanced Map Visualization - Documentation

## 🎉 What's New

Your SCADA dashboard now features a **realistic school facility map** with:

✅ **School Background Image** - Aerial view with adjustable opacity  
✅ **Realistic Building Zones** - 9 actual facility areas  
✅ **Interactive Hover Effects** - Click or hover to see details  
✅ **Status Indicators** - Active, Maintenance, Inactive states  
✅ **Live Occupancy Data** - Real-time room and people counts  
✅ **Visual Legend** - Color-coded status guide  

---

## 🏫 Building Zones

The map displays 9 realistic school facility zones:

| Zone | Name | Type | Rooms | Default Status |
|------|------|------|-------|----------------|
| 1 | Main Building | Administrative | 12 | Active |
| 2 | Lecture Hall A | Classroom | 8 | Active |
| 3 | Lecture Hall B | Classroom | 8 | Active |
| 4 | Library | Study Area | 4 | Active |
| 5 | Science Labs | Laboratory | 6 | Maintenance |
| 6 | Computer Center | IT Lab | 5 | Active |
| 7 | Cafeteria | Dining | 2 | Active |
| 8 | Sports Complex | Recreation | 3 | Active |
| 9 | Auditorium | Event Hall | 1 | Inactive |

---

## 🎨 Visual Features

### Background Image
- **Opacity**: 15% (subtle, doesn't overpower the UI)
- **Filter**: Grayscale 50%, Brightness 80%
- **Effect**: Creates depth without distraction

### Zone Cards
Each zone displays:
- **Zone Name** (e.g., "Main Building")
- **Zone Type** (e.g., "Administrative")
- **Status Indicator** (colored dot)
- **Zone Number Badge** (1-9)

### Interactive Stats (on hover/click)
- **Occupancy Count** - Current number of people
- **Room Count** - Total rooms in the zone
- **Occupancy Bar** - Visual percentage indicator

### Status Colors
- 🟢 **Green** - Active (normal operation)
- 🟡 **Yellow** - Maintenance (under repair)
- ⚪ **Gray** - Inactive (not in use)

---

## 🖱️ Interactions

### Hover Effects
- Zone highlights with glow effect
- Stats fade in smoothly
- Border intensifies

### Click/Select
- Zone gets cyan ring border
- Strong neon glow shadow
- Stats remain visible

### Visual Feedback
- Smooth transitions (300-500ms)
- Backdrop blur on zones
- Gradient occupancy bars

---

## 🔧 Customization Guide

### Change Background Image

Replace the school image with your own:

```bash
# Place your image in public folder
public/your-school-image.png
```

Then update `MapVisualization.jsx`:
```javascript
style={{
  backgroundImage: 'url(/your-school-image.png)',
  opacity: 0.15,  // Adjust opacity (0.0 - 1.0)
  filter: 'grayscale(50%) brightness(0.8)'
}}
```

### Adjust Background Opacity

```javascript
opacity: 0.15,  // Lower = more subtle (0.1 - 0.3 recommended)
```

### Modify Zones

Edit the `zones` array in `MapVisualization.jsx`:

```javascript
const zones = [
  { 
    id: 1, 
    name: 'Your Building Name', 
    type: 'Building Type', 
    status: 'active',  // 'active' | 'maintenance' | 'inactive'
    occupancy: 85,     // Current people count
    rooms: 12          // Total rooms
  },
  // Add more zones...
];
```

### Change Status Colors

Update the `getStatusColor` function:

```javascript
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-500/20 border-green-400';
    case 'maintenance': return 'bg-yellow-500/20 border-yellow-400';
    case 'inactive': return 'bg-gray-500/20 border-gray-400';
    // Add custom statuses here
    case 'emergency': return 'bg-red-500/20 border-red-400';
    default: return 'bg-neon-blue/20 border-neon-blue';
  }
};
```

---

## 📊 Data Integration

### Connect to Real-Time Data

Replace static zones with API data:

```javascript
const MapVisualization = () => {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    // Fetch zones from API
    const fetchZones = async () => {
      const response = await fetch('/api/zones');
      const data = await response.json();
      setZones(data);
    };

    fetchZones();
    
    // Poll every 5 seconds
    const interval = setInterval(fetchZones, 5000);
    return () => clearInterval(interval);
  }, []);

  // Rest of component...
};
```

### Expected API Response Format

```json
[
  {
    "id": 1,
    "name": "Main Building",
    "type": "Administrative",
    "status": "active",
    "occupancy": 85,
    "rooms": 12
  }
]
```

---

## 🎯 Advanced Features

### Add More Zone Details

Expand the zone data structure:

```javascript
const zones = [
  { 
    id: 1, 
    name: 'Main Building',
    type: 'Administrative',
    status: 'active',
    occupancy: 85,
    rooms: 12,
    // Add these:
    capacity: 120,           // Max capacity
    temperature: 22.5,       // Current temp
    humidity: 45,            // Humidity %
    lastUpdated: '2:40 PM',  // Last data update
    alerts: []               // Active alerts
  }
];
```

### Display Additional Stats

Update the stats section:

```javascript
<div className="space-y-1">
  <div className="flex justify-between text-[10px]">
    <span className="text-gray-400">Occupancy:</span>
    <span className="text-neon-cyan font-mono">
      {zone.occupancy}/{zone.capacity}
    </span>
  </div>
  <div className="flex justify-between text-[10px]">
    <span className="text-gray-400">Temperature:</span>
    <span className="text-neon-cyan font-mono">{zone.temperature}°C</span>
  </div>
  <div className="flex justify-between text-[10px]">
    <span className="text-gray-400">Humidity:</span>
    <span className="text-neon-cyan font-mono">{zone.humidity}%</span>
  </div>
</div>
```

### Add Click Actions

Handle zone clicks:

```javascript
const handleZoneClick = (zone) => {
  setSelectedZone(zone.id);
  
  // Open detailed view
  // showZoneDetails(zone);
  
  // Or navigate to zone page
  // navigate(`/zones/${zone.id}`);
  
  // Or show modal
  // setModalData(zone);
  // setShowModal(true);
};

<div
  onClick={() => handleZoneClick(zone)}
  // ...
>
```

---

## 🎨 Styling Tips

### Increase Background Visibility

```javascript
opacity: 0.25,  // More visible
filter: 'grayscale(30%) brightness(0.9)'
```

### Remove Grayscale (Full Color)

```javascript
opacity: 0.2,
filter: 'brightness(0.7)'  // Remove grayscale
```

### Add Blur to Background

```javascript
opacity: 0.2,
filter: 'grayscale(50%) brightness(0.8) blur(2px)'
```

### Adjust Grid Pattern

In `index.css`:

```css
.grid-pattern {
  background-image: 
    linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;  /* Larger grid */
}
```

---

## 🔍 Troubleshooting

### Background Image Not Showing

1. **Check file location**: Image must be in `public/` folder
2. **Verify file name**: Must match exactly (case-sensitive)
3. **Check path**: Use `/school-background.png` (starts with `/`)
4. **Clear cache**: Hard refresh browser (Ctrl+Shift+R)

### Image Too Visible/Invisible

Adjust opacity:
```javascript
opacity: 0.15,  // Default
// Try: 0.1 (subtle), 0.2 (visible), 0.3 (prominent)
```

### Zones Not Interactive

1. Check `onClick` and `onMouseEnter` handlers are present
2. Verify `selectedZone` state is working
3. Check CSS transitions are not disabled

### Performance Issues

1. Reduce background image size (optimize to ~500KB)
2. Lower opacity for less rendering work
3. Disable backdrop-blur on low-end devices:

```javascript
className="... backdrop-blur-sm"  // Remove this
```

---

## 📸 Screenshot Comparison

### Before
- Generic 3x3 grid
- No background image
- Simple zone labels
- Basic hover effects

### After
- ✅ School aerial view background
- ✅ 9 realistic building zones
- ✅ Detailed zone information
- ✅ Status indicators (Active/Maintenance/Inactive)
- ✅ Interactive occupancy stats
- ✅ Visual legend
- ✅ Enhanced hover/click effects

---

## 🚀 Next Steps

### Recommended Enhancements

1. **Real-Time Updates**
   - Connect to WebSocket for live occupancy
   - Auto-refresh zone statuses

2. **Zone Details Modal**
   - Click zone to open detailed view
   - Show room-by-room breakdown
   - Display historical data

3. **Heatmap View**
   - Color zones by occupancy percentage
   - Show traffic patterns
   - Identify busy areas

4. **Floor Plans**
   - Add floor selector
   - Show detailed room layouts
   - Indoor navigation

5. **Alerts Integration**
   - Show alerts per zone
   - Visual indicators for issues
   - Click to view alert details

---

## 📝 File Changes

### Modified Files
- `src/components/MapVisualization.jsx` - Enhanced with realistic zones and background

### New Files
- `public/school-background.png` - Aerial school image

### No Changes Needed
- All other components work as before
- Styling remains compatible
- No breaking changes

---

## 🎓 Tips for Your School

### Customize Zone Names

Match your actual buildings:
```javascript
{ id: 1, name: 'Administration Block', ... },
{ id: 2, name: 'Engineering Wing', ... },
{ id: 3, name: 'Medical Sciences', ... },
```

### Add Your School Logo

Place logo in zone header:
```javascript
<img src="/school-logo.png" className="w-4 h-4" alt="Logo" />
```

### Use Real Occupancy Data

Integrate with your school's systems:
- Student attendance system
- Room booking system
- Access control system
- WiFi analytics

---

## ✅ Summary

Your map visualization is now:
- 🎨 **Visually Enhanced** with school background
- 🏫 **Realistic** with actual building zones
- 📊 **Informative** with occupancy and room data
- 🖱️ **Interactive** with hover and click effects
- 🎯 **Production-Ready** for real data integration

**Enjoy your enhanced SCADA dashboard!** 🎉
