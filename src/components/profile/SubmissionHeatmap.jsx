import React, { useMemo } from 'react';

const SubmissionHeatmap = ({ submissions = [] }) => {

    // Process submissions into a map of "YYYY-MM-DD" -> count
    const activityMap = useMemo(() => {
        const map = {};
        if (!submissions || !Array.isArray(submissions)) return map;

        submissions.forEach(sub => {
            if (sub.submittedAt) {
                const date = new Date(sub.submittedAt);
                const key = date.toISOString().split('T')[0];
                map[key] = (map[key] || 0) + 1;
            }
        });
        return map;
    }, [submissions]);

    // Generate last 365 days
    const weeks = useMemo(() => {
        const today = new Date();
        const data = [];
        // Generate 365 days back
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split('T')[0];
            data.push({
                date,
                count: activityMap[key] || 0
            });
        }

        // Reverse to start from 1 year ago -> today
        const reversedData = data.reverse();

        // Group into weeks (columns)
        const chunkedWeeks = [];
        let currentWeek = [];

        reversedData.forEach((day, index) => {
            currentWeek.push(day);
            // If week is full (7 days) or last day
            if (currentWeek.length === 7 || index === reversedData.length - 1) {
                chunkedWeeks.push(currentWeek);
                currentWeek = [];
            }
        });
        return chunkedWeeks;

    }, [activityMap]);

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-[700px]">
                <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => {
                                let colorClass = "bg-[#161b22]"; // Empty
                                if (day.count > 0) colorClass = "bg-[#0e4429]";
                                if (day.count > 1) colorClass = "bg-[#006d32]";
                                if (day.count > 3) colorClass = "bg-[#26a641]";
                                if (day.count > 5) colorClass = "bg-[#39d353]";

                                return (
                                    <div
                                        key={dayIndex}
                                        title={`${day.count} submissions on ${day.date.toDateString()}`}
                                        className={`w-3 h-3 rounded-sm ${colorClass} hover:ring-1 hover:ring-white/50 transition-all cursor-pointer`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 justify-end">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-[#161b22]" />
                    <div className="w-3 h-3 rounded-sm bg-[#0e4429]" />
                    <div className="w-3 h-3 rounded-sm bg-[#006d32]" />
                    <div className="w-3 h-3 rounded-sm bg-[#26a641]" />
                    <div className="w-3 h-3 rounded-sm bg-[#39d353]" />
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default SubmissionHeatmap;
