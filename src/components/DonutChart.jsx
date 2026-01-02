import React from 'react';

const DonutChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const segments = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (item.value / total) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;

        return {
            ...item,
            percentage,
            startAngle,
            angle
        };
    });

    return (
        <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>

            <div className="flex items-center gap-6">
                {/* Donut Chart */}
                <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        {segments.map((segment, index) => {
                            const radius = 40;
                            const circumference = 2 * Math.PI * radius;
                            const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;
                            const strokeDashoffset = -((segment.startAngle / 360) * circumference);

                            return (
                                <circle
                                    key={index}
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    fill="none"
                                    stroke={segment.color}
                                    strokeWidth="12"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-300 hover:stroke-width-[14]"
                                    style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-2xl font-bold neon-text">{total}</p>
                            <p className="text-[10px] text-gray-500">Total</p>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                    {segments.map((segment, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: segment.color, boxShadow: `0 0 8px ${segment.color}` }}
                                ></div>
                                <span className="text-gray-400">{segment.label}</span>
                            </div>
                            <span className="font-mono text-gray-300">{segment.percentage.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DonutChart;
