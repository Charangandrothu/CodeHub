export const generateMockRoadmap = (daysSelected, mockTests = []) => {
    let mode = "Standard Prep";
    let levelLabel = "Medium";

    if (daysSelected <= 30) {
        mode = "Intense Bootcamp";
        levelLabel = "Advanced";
    } else if (daysSelected <= 60) {
        mode = "Steady Placement Pace";
        levelLabel = "Intermediate";
    } else {
        mode = "Comprehensive Mastery";
        levelLabel = "Beginner";
    }

    // Default mock tests structures (to fall back on if API list is empty or doesn't match)
    const defaultTemplates = [
        { name: "DSA & Aptitude Starter Mock", key: "starter", difficulty: "Easy", dsaCount: 3, aptitudeCount: 20, timeLimit: 45 },
        { name: "TCS Ninja Simulation", key: "tcs", difficulty: "Easy", dsaCount: 3, aptitudeCount: 30, timeLimit: 60 },
        { name: "Cognizant GenC Challenge", key: "genc", difficulty: "Medium", dsaCount: 3, aptitudeCount: 40, timeLimit: 75 },
        { name: "Wipro Elite Practice Test", key: "wipro", difficulty: "Medium", dsaCount: 3, aptitudeCount: 50, timeLimit: 90 },
        { name: "Accenture Placement Special", key: "accenture", difficulty: "Medium", dsaCount: 3, aptitudeCount: 50, timeLimit: 90 },
        { name: "Infosys DSE Mock Exam", key: "infosys", difficulty: "Medium", dsaCount: 3, aptitudeCount: 50, timeLimit: 90 },
        { name: "DSA Coding Sprint", key: "coding-sprint", difficulty: "Medium", dsaCount: 3, aptitudeCount: 10, timeLimit: 60 },
        { name: "Elite Placement Mock - 1", key: "elite-1", difficulty: "Hard", dsaCount: 3, aptitudeCount: 50, timeLimit: 120 },
        { name: "Elite Placement Mock - 2", key: "elite-2", difficulty: "Hard", dsaCount: 3, aptitudeCount: 50, timeLimit: 120 },
        { name: "Grand Placement Marathon", key: "marathon", difficulty: "Mixed", dsaCount: 3, aptitudeCount: 100, timeLimit: 180 }
    ];

    // Align mockTests from API with our template order
    const testsList = defaultTemplates.map(tpl => {
        const found = mockTests.find(t => t.name.toLowerCase().includes(tpl.name.toLowerCase()) || tpl.name.toLowerCase().includes(t.name.toLowerCase()));
        return found ? found : { ...tpl, _id: tpl.key }; // Fallback to key if not found in db
    });

    const sectionsData = [
        {
            title: "Foundation & Service-Based Mocks",
            slug: "service-based",
            tests: [testsList[0], testsList[1], testsList[2], testsList[3], testsList[4]],
            ratio: 0.50
        },
        {
            title: "Product-Based Mocks",
            slug: "product-based",
            tests: [testsList[5], testsList[6]],
            ratio: 0.25
        },
        {
            title: "Elite & FAANG Simulations",
            slug: "elite-mocks",
            tests: [testsList[7], testsList[8], testsList[9]],
            ratio: 0.25
        }
    ];

    let remainingDays = daysSelected;
    let currentStartDay = 1;

    const sections = sectionsData.map((sec, idx) => {
        let days = Math.max(2, Math.round(sec.ratio * daysSelected));
        if (idx === sectionsData.length - 1) {
            days = remainingDays;
        } else {
            remainingDays -= days;
        }

        const start = currentStartDay;
        const end = currentStartDay + days - 1;
        currentStartDay += days;

        const tasks = [];
        const numTests = sec.tests.length;

        for (let d = 0; d < days; d++) {
            const dayNum = start + d;
            let items = [];

            // Determine if this is a Mock Test Day vs Prep Day
            // We want to distribute the mock tests evenly in the section's days.
            // E.g., if we have 5 tests and 15 days, we do a test every 3rd day.
            const testSpacing = Math.max(1, Math.floor(days / numTests));
            const isTestDay = d % testSpacing === 0 && Math.floor(d / testSpacing) < numTests;
            
            if (isTestDay) {
                const testIndex = Math.floor(d / testSpacing);
                const test = sec.tests[testIndex];
                const isRealTest = test._id && test._id !== test.key;

                items = [
                    {
                        id: `${sec.slug}-day-${dayNum}-attempt`,
                        text: `Take Placement Simulation: ${test.name} (${test.timeLimit} mins)`,
                        link: isRealTest ? `/mock-tests/test/${test._id}` : `/mock-tests`,
                        difficulty: test.difficulty || 'Medium',
                        type: 'test',
                        completed: false
                    },
                    {
                        id: `${sec.slug}-day-${dayNum}-analyze`,
                        text: `Analyze your score, read explanations for wrong answers, and record weak topics.`,
                        link: `/mock-tests`,
                        difficulty: 'Easy',
                        type: 'analysis',
                        completed: false
                    }
                ];
            } else {
                // Non-test prep/revision days
                const prevTestIndex = Math.max(0, Math.min(numTests - 1, Math.floor(d / testSpacing) - 1));
                const prevTest = sec.tests[prevTestIndex];
                
                const prepTopic = d % 3 === 0 
                    ? { name: "Quantitative Aptitude Formulas", link: "/roadmap/aptitude", focus: "Percentages, Profit/Loss, and Time & Work" }
                    : d % 3 === 1 
                    ? { name: "DSA Problem-Solving Core", link: "/roadmap/dsa", focus: "Arrays, Strings, and Hashing algorithms" }
                    : { name: "Weak Topics Targeting", link: "/mock-tests", focus: `reviewing incorrect questions from ${prevTest.name}` };

                items = [
                    {
                        id: `${sec.slug}-day-${dayNum}-prep-1`,
                        text: `Focus Prep: Revise ${prepTopic.name} (${prepTopic.focus}).`,
                        link: prepTopic.link,
                        difficulty: 'Medium',
                        type: 'prep',
                        completed: false
                    },
                    {
                        id: `${sec.slug}-day-${dayNum}-prep-2`,
                        text: `Solve at least 2 practice problems related to these concepts.`,
                        link: prepTopic.link,
                        difficulty: 'Hard',
                        type: 'practice',
                        completed: false
                    }
                ];
            }

            tasks.push({
                day: dayNum,
                displayDay: `Day ${dayNum}`,
                items
            });
        }

        const totalProblems = tasks.reduce((sum, task) => sum + task.items.length, 0);

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
