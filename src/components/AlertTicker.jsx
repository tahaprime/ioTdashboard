import React from 'react';

const AlertTicker = ({ alerts }) => {
    return (
        <div className="glass-card-glow p-3 overflow-hidden">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                        Live Alerts
                    </span>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <div className="flex gap-8 animate-ticker whitespace-nowrap">
                        {[...alerts, ...alerts].map((alert, index) => (
                            <div key={index} className="flex items-center gap-3 flex-shrink-0">
                                <span className={`text-xs px-2 py-1 rounded ${alert.level === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                                        alert.level === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                                            'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                    }`}>
                                    {alert.level.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-300">{alert.message}</span>
                                <span className="text-xs text-gray-500 font-mono">{alert.time}</span>
                                <div className="w-px h-4 bg-neon-blue/30"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertTicker;
