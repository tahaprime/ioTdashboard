import React from 'react';

const BarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(item => item.value));

    return (
        <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>

            <div className="space-y-3">
                {data.map((item, index) => {
                    const percentage = (item.value / maxValue) * 100;

                    return (
                        <div key={index} className="group">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-400">{item.label}</span>
                                <span className="text-xs font-mono text-neon-cyan">{item.value}</span>
                            </div>
                            <div className="relative h-6 bg-gray-900/50 rounded-full overflow-hidden border border-neon-blue/20">
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out group-hover:shadow-neon"
                                    style={{
                                        width: `${percentage}%`,
                                        background: `linear-gradient(90deg, ${item.color}00 0%, ${item.color} 100%)`,
                                        boxShadow: `0 0 10px ${item.color}80`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10"></div>
                                </div>
                                {/* Animated scanning line */}
                                <div
                                    className="absolute inset-y-0 w-1 bg-white/50 animate-pulse"
                                    style={{ left: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BarChart;
