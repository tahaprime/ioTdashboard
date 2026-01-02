import React, { useState } from 'react';

const MapVisualization = () => {
    const [selectedZone, setSelectedZone] = useState(null);

    // Realistic building zones with actual room types
    const zones = [
        { id: 1, name: 'Main Building', type: 'Administrative', status: 'active', occupancy: 85, rooms: 12 },
        { id: 2, name: 'Lecture Hall A', type: 'Classroom', status: 'active', occupancy: 120, rooms: 8 },
        { id: 3, name: 'Lecture Hall B', type: 'Classroom', status: 'active', occupancy: 95, rooms: 8 },
        { id: 4, name: 'Library', type: 'Study Area', status: 'active', occupancy: 65, rooms: 4 },
        { id: 5, name: 'Science Labs', type: 'Laboratory', status: 'maintenance', occupancy: 45, rooms: 6 },
        { id: 6, name: 'Computer Center', type: 'IT Lab', status: 'active', occupancy: 110, rooms: 5 },
        { id: 7, name: 'Cafeteria', type: 'Dining', status: 'active', occupancy: 150, rooms: 2 },
        { id: 8, name: 'Sports Complex', type: 'Recreation', status: 'active', occupancy: 78, rooms: 3 },
        { id: 9, name: 'Auditorium', type: 'Event Hall', status: 'inactive', occupancy: 0, rooms: 1 },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 border-green-400';
            case 'maintenance': return 'bg-yellow-500/20 border-yellow-400';
            case 'inactive': return 'bg-gray-500/20 border-gray-400';
            default: return 'bg-neon-blue/20 border-neon-blue';
        }
    };

    const getStatusDot = (status) => {
        switch (status) {
            case 'active': return 'bg-green-400';
            case 'maintenance': return 'bg-yellow-400';
            case 'inactive': return 'bg-gray-400';
            default: return 'bg-neon-blue';
        }
    };

    return (
        <div className="glass-card-glow p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neon-blue">FACILITY OVERVIEW</h2>
                <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs bg-neon-blue/20 border border-neon-blue/50 rounded hover:bg-neon-blue/30 transition-colors">
                        Live View
                    </button>
                    <button className="px-3 py-1 text-xs bg-neon-blue/20 border border-neon-blue/50 rounded hover:bg-neon-blue/30 transition-colors">
                        Heatmap
                    </button>
                </div>
            </div>

            <div className="flex-1 relative rounded-lg border border-neon-blue/30 overflow-hidden">
                {/* School Background Image with Opacity */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(/school-background.png)',
                        opacity: 0.15,
                        filter: 'grayscale(50%) brightness(0.8)'
                    }}
                />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 grid-pattern opacity-40" />

                {/* Building Layout */}
                <div className="absolute inset-0 p-6">
                    <div className="grid grid-cols-3 grid-rows-3 h-full gap-3">
                        {zones.map((zone, i) => (
                            <div
                                key={zone.id}
                                className={`relative border-2 rounded-lg backdrop-blur-sm transition-all cursor-pointer group ${getStatusColor(zone.status)} ${selectedZone === zone.id ? 'ring-2 ring-neon-cyan shadow-neon-strong' : ''
                                    }`}
                                onClick={() => setSelectedZone(zone.id)}
                                onMouseEnter={() => setSelectedZone(zone.id)}
                            >
                                {/* Zone Content */}
                                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-neon-cyan uppercase tracking-wide">
                                                {zone.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{zone.type}</p>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${getStatusDot(zone.status)} ${zone.status === 'active' ? 'animate-pulse' : ''
                                            }`} />
                                    </div>

                                    {/* Stats - Show on hover or selection */}
                                    <div className={`transition-opacity ${selectedZone === zone.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        }`}>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-gray-400">Occupancy:</span>
                                                <span className="text-neon-cyan font-mono">{zone.occupancy}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-gray-400">Rooms:</span>
                                                <span className="text-neon-cyan font-mono">{zone.rooms}</span>
                                            </div>
                                            {/* Occupancy bar */}
                                            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-1">
                                                <div
                                                    className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan transition-all duration-500"
                                                    style={{ width: `${(zone.occupancy / 150) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Zone Number Badge */}
                                <div className="absolute top-1 left-1 w-5 h-5 bg-neon-blue/30 border border-neon-blue/50 rounded flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-neon-cyan">{zone.id}</span>
                                </div>

                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 bg-neon-blue/0 group-hover:bg-neon-blue/10 transition-all rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scanning effect */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50 animate-pulse" />
                </div>

                {/* Corner decorations */}
                <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-neon-blue/60" />
                <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-neon-blue/60" />
                <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-neon-blue/60" />
                <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-neon-blue/60" />
            </div>

            {/* Legend and Info */}
            <div className="mt-4 flex justify-between items-center text-xs">
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-gray-400">Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        <span className="text-gray-400">Maintenance</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-gray-400">Inactive</span>
                    </div>
                </div>
                <span className="text-gray-400">Last Scan: 2.3s ago</span>
            </div>
        </div>
    );
};

export default MapVisualization;
