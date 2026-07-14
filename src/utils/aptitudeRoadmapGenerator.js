export const generateAptitudeRoadmap = (daysSelected) => {
    let mode = "Beginner Full Mastery";
    let levelLabel = "Beginner";

    if (daysSelected <= 60) {
        mode = "Quick Revision";
        levelLabel = "Advanced";
    } else if (daysSelected < 160) {
        mode = "Intermediate";
        levelLabel = "Intermediate";
    } else {
        mode = "Expert Mastery";
        levelLabel = "Expert";
    }

    const sectionsData = [
        {
            key: 'aptitude',
            title: 'Quantitative Aptitude',
            slug: 'aptitude',
            topics: [
                { name: 'Percentages', slug: 'percentages', priority: 'Very High' },
                { name: 'Profit & Loss', slug: 'profit-loss', priority: 'Very High' },
                { name: 'Time & Work', slug: 'time-work', priority: 'High' },
                { name: 'Time, Speed & Distance', slug: 'time-speed-distance', priority: 'High' },
                { name: 'Averages', slug: 'averages', priority: 'Medium' },
                { name: 'Ratio & Proportion', slug: 'ratio-proportion', priority: 'Medium' },
                { name: 'Number Series', slug: 'number-series', priority: 'High' },
                { name: 'Data Interpretation', slug: 'data-interpretation', priority: 'High' },
                { name: 'Simple & Compound Interest', slug: 'interest', priority: 'Medium' },
                { name: 'Permutations & Combinations', slug: 'permutations-combinations', priority: 'Medium' },
                { name: 'Probability', slug: 'probability', priority: 'Medium' },
                { name: 'Mixtures & Alligation', slug: 'mixtures', priority: 'Low' },
                { name: 'Boats & Streams', slug: 'boats-streams', priority: 'Low' },
                { name: 'Number System', slug: 'number-systems', priority: 'Medium' },
            ],
            ratio: 0.45
        },
        {
            key: 'reasoning',
            title: 'Logical Reasoning',
            slug: 'reasoning',
            topics: [
                { name: 'Seating Arrangements', slug: 'seating-arrangements', priority: 'Very High' },
                { name: 'Direction Sense', slug: 'direction-sense', priority: 'High' },
                { name: 'Coding-Decoding', slug: 'coding-decoding', priority: 'Very High' },
                { name: 'Blood Relations', slug: 'blood-relations', priority: 'High' },
                { name: 'Syllogisms', slug: 'syllogisms', priority: 'High' },
                { name: 'Analogies', slug: 'analogies', priority: 'Medium' },
                { name: 'Odd One Out', slug: 'odd-one-out', priority: 'Medium' },
                { name: 'Puzzles', slug: 'puzzles', priority: 'High' },
                { name: 'Data Sufficiency', slug: 'data-sufficiency', priority: 'Medium' },
                { name: 'Clocks & Calendars', slug: 'clocks-calendars', priority: 'Medium' },
            ],
            ratio: 0.30
        },
        {
            key: 'verbal',
            title: 'Verbal Ability',
            slug: 'verbal',
            topics: [
                { name: 'Error Identification', slug: 'error-identification', priority: 'Very High' },
                { name: 'Reading Comprehension', slug: 'reading-comprehension', priority: 'Very High' },
                { name: 'Sentence Completion', slug: 'sentence-completion', priority: 'High' },
                { name: 'Synonyms & Antonyms', slug: 'synonyms-antonyms', priority: 'High' },
                { name: 'Para Jumbles', slug: 'para-jumbles', priority: 'Medium' },
                { name: 'Idioms & Phrases', slug: 'idioms-phrases', priority: 'Medium' },
                { name: 'Prepositions & Conjunctions', slug: 'prepositions-conjunctions', priority: 'Medium' },
                { name: 'Active & Passive Voice', slug: 'active-passive', priority: 'High' },
            ],
            ratio: 0.25
        }
    ];

    let remainingDays = daysSelected;
    let currentStartDay = 1;

    const sections = sectionsData.map((sec, idx) => {
        let days = Math.max(1, Math.round(sec.ratio * daysSelected));
        if (idx === sectionsData.length - 1) {
            days = remainingDays;
        } else {
            remainingDays -= days;
        }

        const start = currentStartDay;
        const end = currentStartDay + days - 1;
        currentStartDay += days;

        const tasks = [];
        const topicsCount = sec.topics.length;

        for (let d = 0; d < days; d++) {
            const dayNum = start + d;
            
            // Map day to topic
            const topicIndex = Math.floor((d / days) * topicsCount);
            const topic = sec.topics[topicIndex] || sec.topics[topicsCount - 1];

            const items = [
                {
                    id: `${sec.key}-${topic.slug}-d${dayNum}-1`,
                    text: `Master ${topic.name} concepts & Practice (Part 1)`,
                    link: `/companies/all/practice/${sec.key}/${topic.slug}`,
                    difficulty: topic.priority === 'Very High' || topic.priority === 'High' ? 'Medium' : 'Easy',
                    completed: false
                },
                {
                    id: `${sec.key}-${topic.slug}-d${dayNum}-2`,
                    text: `Practice ${topic.name} Placement-level Questions (Part 2)`,
                    link: `/companies/all/practice/${sec.key}/${topic.slug}`,
                    difficulty: topic.priority === 'Very High' || topic.priority === 'High' ? 'Hard' : 'Medium',
                    completed: false
                }
            ];

            tasks.push({
                day: dayNum,
                displayDay: `Day ${dayNum}`,
                items
            });
        }

        const totalProblems = days * 2;

        return {
            title: sec.title,
            slug: sec.slug,
            level: levelLabel,
            totalProblems: totalProblems,
            completed: 0,
            startDay: start,
            endDay: end,
            tasks
        };
    });

    const totalProblems = sections.reduce((acc, s) => acc + s.totalProblems, 0);

    return {
        daysSelected,
        detectedLevel: mode,
        totalProblems,
        sections
    };
};
