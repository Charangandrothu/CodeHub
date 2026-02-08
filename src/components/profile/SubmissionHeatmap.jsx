import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const SubmissionHeatmap = ({ submissions = [] }) => {

    // 1. Process Submissions Map
    const activityMap = useMemo(() => {
        const map = {};
        if (submissions && Array.isArray(submissions)) {
            submissions.forEach(sub => {
                if (sub.submittedAt) {
                    const date = new Date(sub.submittedAt);
                    const key = date.toISOString().split('T')[0];
                    map[key] = (map[key] || 0) + 1;
                }
            });
        }
        return map;
    }, [submissions]);

    // 2. Generate Last 12 Months Data
    const monthsData = useMemo(() => {
        const today = new Date();
        const months = [];

        // Generate last 12 months (0 = current month, 11 = 11 months ago)
        for (let i = 11; i >= 0; i--) {
            // Get the 1st day of that month
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = d.getFullYear();
            const monthIndex = d.getMonth();
            const monthName = d.toLocaleString('default', { month: 'short' });

            // Number of days in this month
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

            // Padding for the start of the month (0=Sun, 1=Mon, etc.)
            const startPadding = d.getDay();

            // Build flat array of slots for the grid
            // Grid fills columns (weeks) first if we use grid-flow-col with rows-7
            const days = [];

            // Add empty slots for padding
            for (let p = 0; p < startPadding; p++) {
                days.push({ type: 'empty', id: `pad-${p}` });
            }

            // Add actual days
            for (let day = 1; day <= daysInMonth; day++) {
                const dateObj = new Date(year, monthIndex, day);
                const dateStr = dateObj.toISOString().split('T')[0];
                const count = activityMap[dateStr] || 0;

                // Check if future
                const isFuture = dateObj.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0);

                days.push({
                    type: 'day',
                    date: dateObj,
                    dateStr,
                    count,
                    isFuture
                });
            }

            months.push({ name: monthName, year, days });
        }
        return months;
    }, [activityMap]);

    // Color Scale
    const getColor = (count) => {
        if (count === 0) return "bg-[#161b22]"; // Dark/Empty
        if (count <= 2) return "bg-[#0e4429]";  // Low
        if (count <= 4) return "bg-[#006d32]";  // Medium
        if (count <= 8) return "bg-[#26a641]";  // High
        return "bg-[#39d353]";                  // Max
    };

    return (
        <div className="w-full overflow-x-auto custom-scrollbar pb-2">
            <div className="flex gap-4 min-w-max px-2">
                {monthsData.map((month, idx) => (
                    <div key={`${month.name}-${month.year}`} className="flex flex-col gap-1.8">
                        {/* Days Grid: 7 rows (Sun-Sat), fills columns automatically */}
                        <div className="grid grid-rows-7 grid-flow-col gap-[2.2px]">
                            {month.days.map((item, i) => {
                                if (item.type === 'empty') {
                                    return <div key={item.id} className="w-[10px] h-[10px]" />;
                                }
                                return (
                                    <div
                                        key={item.dateStr}
                                        title={item.isFuture ? "Future" : `${item.count} submissions on ${item.date.toDateString()}`}
                                        className={`w-[10px] h-[10px] rounded-[2px] ${item.isFuture ? 'opacity-0' : getColor(item.count)} ${!item.isFuture && 'border border-white/5 hover:border-white/50 cursor-pointer transition-all'}`}
                                    />
                                );
                            })}
                        </div>
                        {/* Month Label */}
                        <span className="text-[10px] font-medium text-gray-400 text-center">{month.name}</span>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-[10px] text-gray-500 justify-end px-2">
                <span>Less</span>
                <div className={`w-[10px] h-[10px] rounded-[2px] ${getColor(0)}`} />
                <div className={`w-[10px] h-[10px] rounded-[2px] ${getColor(1)}`} />
                <div className={`w-[10px] h-[10px] rounded-[2px] ${getColor(3)}`} />
                <div className={`w-[10px] h-[10px] rounded-[2px] ${getColor(6)}`} />
                <div className={`w-[10px] h-[10px] rounded-[2px] ${getColor(10)}`} />
                <span>More</span>
            </div>
        </div>
    );
};

export default SubmissionHeatmap;
