import React from 'react';

const KPICard = ({ title, value, unit, icon, trend, trendValue }) => {
    return (
        <div className="glass-card p-4 hover:shadow-neon-strong transition-all duration-300 group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold neon-text group-hover:text-neon-cyan transition-colors">
                            {value}
                        </span>
                        {unit && <span className="text-sm text-gray-500">{unit}</span>}
                    </div>
                </div>
                {icon && (
                    <div className="text-neon-blue/60 text-2xl">
                        {icon}
                    </div>
                )}
            </div>

            {trend && (
                <div className="flex items-center gap-1 text-xs">
                    <span className={trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                        {trend === 'up' ? '↑' : '↓'}
                    </span>
                    <span className="text-gray-400">
                        {trendValue} from last hour
                    </span>
                </div>
            )}
        </div>
    );
};

export default KPICard;
