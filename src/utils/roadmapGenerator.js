export const TOPICS = [
    { name: "Arrays", slug: "arrays", full: 40, inter: 25, quick: 10, expert: 43 },
    { name: "Strings", slug: "strings", full: 25, inter: 15, quick: 8, expert: 27 },
    { name: "Hashing", slug: "hashing", full: 25, inter: 18, quick: 8, expert: 27 },
    { name: "Binary Search", slug: "binary-search", full: 20, inter: 15, quick: 8, expert: 22 },
    { name: "Linked List", slug: "linked-list", full: 25, inter: 18, quick: 8, expert: 27 },
    { name: "Stack & Queue", slug: "stack-queue", full: 25, inter: 18, quick: 8, expert: 27 },
    { name: "Recursion & Backtracking", slug: "recursion", full: 30, inter: 22, quick: 10, expert: 32 },
    { name: "Greedy", slug: "greedy", full: 20, inter: 15, quick: 6, expert: 22 },
    { name: "Heaps", slug: "heaps", full: 15, inter: 12, quick: 6, expert: 16 },
    { name: "Trees", slug: "trees", full: 45, inter: 30, quick: 10, expert: 48 },
    { name: "Graphs", slug: "graphs", full: 35, inter: 22, quick: 9, expert: 37 },
    { name: "Dynamic Programming", slug: "dynamic-programming", full: 35, inter: 20, quick: 9, expert: 37 }
];

export const generateRoadmap = (daysSelected) => {
    let mode = "Beginner Full Mastery";
    let levelKey = "full";
    let levelLabel = "Beginner"; // For UI color matching if needed

    // Mode Detection Logic
    if (daysSelected <= 60) {
        mode = "Quick Revision";
        levelKey = "quick";
        levelLabel = "Advanced";
    } else if (daysSelected < 160) {
        mode = "Intermediate";
        levelKey = "inter";
        levelLabel = "Intermediate";
    } else {
        mode = "Expert Mastery";
        levelKey = "expert";
        levelLabel = "Expert";
    }

    let generatedTotal = 0;

    // 1. Calculate Problem Counts per Topic
    const sections = TOPICS.map((topic) => {
        const count = topic[levelKey] !== undefined ? topic[levelKey] : topic.full;
        generatedTotal += count;
        return {
            ...topic,
            problemCount: count,
            allocatedDays: 0
        };
    });

    // 2. Distribute Days
    // We distribute days proportionally to the problem count relative to total problems.
    // We ensure every topic gets at least 1 day.
    let remainingDays = daysSelected;
    let currentStartDay = 1;

    const finalSections = sections.map((section, idx) => {
        let days = Math.max(1, Math.round((section.problemCount / generatedTotal) * daysSelected));

        // Adjust last item to fit exact days
        if (idx === sections.length - 1) {
            days = Math.max(1, remainingDays);
        } else {
            // Simple safeguard to not exhaust days before end
            if (remainingDays - days < (sections.length - 1 - idx)) {
                days = remainingDays - (sections.length - 1 - idx);
            }
            if (days < 1) days = 1;
            remainingDays -= days;
        }

        const start = currentStartDay;
        const end = currentStartDay + days - 1;
        currentStartDay += days;

        // 3. Generate Daily Tasks
        const tasks = [];
        // Safe against 0 days div by zero though we handled min 1 above
        const daysDivisor = days < 1 ? 1 : days;
        const problemsPerDay = Math.ceil(section.problemCount / daysDivisor);

        for (let d = 0; d < days; d++) {
            const dayNum = start + d;
            const tasksForDay = [];

            // Calculate exact remaining needed to be distributed
            const problemsDistributed = d * problemsPerDay;
            const needed = section.problemCount - problemsDistributed;

            // On the last day, take whatever is left; else take the calc chunk
            // Or simpler: Math.min(problemsPerDay, needed)
            let dailyCount = Math.min(problemsPerDay, Math.max(0, needed));

            if (dailyCount > 0) {
                // Distribute difficulty based on mode
                let easyCount = 0;
                let mediumCount = 0;
                let hardCount = 0;

                if (mode === "Quick Revision") {
                    // Focus on Medium/Hard, less Easy
                    mediumCount = Math.ceil(dailyCount * 0.7);
                    hardCount = dailyCount - mediumCount;
                } else if (mode === "Intermediate") {
                    easyCount = Math.floor(dailyCount * 0.3);
                    mediumCount = dailyCount - easyCount;
                } else if (mode === "Expert Mastery") {
                    // Heavily weighted towards Medium/Hard but with volume
                    easyCount = Math.floor(dailyCount * 0.2);
                    mediumCount = Math.floor(dailyCount * 0.5);
                    hardCount = dailyCount - easyCount - mediumCount;
                } else {
                    // Beginner: More easy foundations
                    easyCount = Math.ceil(dailyCount * 0.5);
                    mediumCount = dailyCount - easyCount;
                }

                // Sanity check to ensure counts aren't negative if logic drifts
                if (easyCount < 0) easyCount = 0;
                if (mediumCount < 0) mediumCount = 0;
                if (hardCount < 0) hardCount = 0;

                // Final balance check
                const diff = (easyCount + mediumCount + hardCount) - dailyCount;
                if (diff !== 0) {
                    // If we have rounding errors, adjust medium
                    mediumCount -= diff;
                }

                if (easyCount > 0) {
                    tasksForDay.push({
                        id: `${section.slug}-d${dayNum}-easy`,
                        text: `${easyCount} Easy ${section.name} Problems`,
                        link: `/dsa?topic=${section.slug}&difficulty=easy`,
                        difficulty: "Easy",
                        completed: false
                    });
                }
                if (mediumCount > 0) {
                    tasksForDay.push({
                        id: `${section.slug}-d${dayNum}-med`,
                        text: `${mediumCount} Medium ${section.name} Problems`,
                        link: `/dsa?topic=${section.slug}&difficulty=medium`,
                        difficulty: "Medium",
                        completed: false
                    });
                }
                if (hardCount > 0) {
                    tasksForDay.push({
                        id: `${section.slug}-d${dayNum}-hard`,
                        text: `${hardCount} Hard ${section.name} Problems`,
                        link: `/dsa?topic=${section.slug}&difficulty=hard`,
                        difficulty: "Hard",
                        completed: false
                    });
                }
            }

            if (tasksForDay.length > 0) {
                tasks.push({
                    day: dayNum,
                    displayDay: `Day ${dayNum}`,
                    items: tasksForDay
                });
            }
        }

        return {
            title: section.name,
            slug: section.slug,
            level: levelLabel, // Keep for legacy UI computability if needed
            totalProblems: section.problemCount,
            completed: 0,
            startDay: start,
            endDay: end,
            tasks: tasks
        };
    });

    return {
        daysSelected,
        detectedLevel: mode, // "Quick Revision", "Intermediate", "Beginner Full Mastery", "Expert Mastery"
        totalProblems: generatedTotal,
        sections: finalSections
    };
};
