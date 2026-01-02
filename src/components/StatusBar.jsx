import React from 'react';

const StatusBar = ({ systemName, status, timestamp }) => {
    return (
        <div className="glass-card-glow p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-glow"></div>
                        <span className="text-sm font-medium text-green-400">SYSTEM ONLINE</span>
                    </div>
                    <div className="h-4 w-px bg-neon-blue/30"></div>
                    <h1 className="text-xl font-bold neon-text tracking-wider">{systemName}</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Last Update</p>
                        <p className="text-sm font-mono text-neon-cyan">{timestamp}</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
