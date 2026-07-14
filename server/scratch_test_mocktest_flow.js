const mongoose = require("mongoose");
require("dotenv").config();
const Problem = require("./src/models/Problem");
const CompanyQuestion = require("./src/models/CompanyQuestion");
const MockTest = require("./src/models/MockTest");
const MockTestAttempt = require("./src/models/MockTestAttempt");
const User = require("./src/models/User");

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully.");

        // Pick the first mock test
        const test = await MockTest.findOne();
        if (!test) {
            console.error("No mock test found.");
            process.exit(1);
        }
        console.log(`Using mock test: ${test.name} (${test._id})`);

        // Find user
        const user = await User.findOne({ role: 'admin' });
        if (!user) {
            console.error("No user found.");
            process.exit(1);
        }
        console.log(`Using user: ${user.email} (${user.uid})`);

        // Simulate start logic
        const testId = test._id.toString();
        const userId = user.uid;

        console.log("\n--- SIMULATING TEST START ---");
        let selectedApt = [];
        let selectedDsa = [];

        if (test.isCustom) {
            selectedApt = await CompanyQuestion.find({ _id: { $in: test.aptitudeQuestions } });
            selectedDsa = await Problem.find({ _id: { $in: test.dsaQuestions } });
        } else {
            selectedApt = await CompanyQuestion.aggregate([
                { $match: { section: { $in: ['aptitude', 'reasoning', 'verbal'] }, isActive: true } },
                { $sample: { size: test.aptitudeCount || 50 } }
            ]);

            const easyDsa = await Problem.aggregate([
                { $match: { difficulty: 'Easy', visibility: 'public' } },
                { $sample: { size: 1 } }
            ]);
            const medDsa = await Problem.aggregate([
                { $match: { difficulty: 'Medium', visibility: 'public' } },
                { $sample: { size: 1 } }
            ]);
            const hardDsa = await Problem.aggregate([
                { $match: { difficulty: 'Hard', visibility: 'public' } },
                { $sample: { size: 1 } }
            ]);

            if (easyDsa[0]) selectedDsa.push(easyDsa[0]);
            if (medDsa[0]) selectedDsa.push(medDsa[0]);
            if (hardDsa[0]) selectedDsa.push(hardDsa[0]);

            if (selectedDsa.length < (test.dsaCount || 3)) {
                const limit = (test.dsaCount || 3) - selectedDsa.length;
                const additionalDsa = await Problem.aggregate([
                    { $match: { visibility: 'public', _id: { $nin: selectedDsa.map(s => s._id) } } },
                    { $sample: { size: limit } }
                ]);
                selectedDsa = [...selectedDsa, ...additionalDsa];
            }
        }

        console.log(`Selected Apt questions: ${selectedApt.length}`);
        console.log(`Selected DSA questions: ${selectedDsa.length}`);

        const mappedApt = selectedApt.map(q => ({
            id: q._id.toString(),
            questionText: q.questionText || '',
            options: q.options || [],
            correctAnswer: q.correctAnswer || 'A',
            explanation: q.explanation || '',
            formulaHint: q.formulaHint || '',
            section: q.section || 'aptitude',
            topic: q.topic || 'Percentages',
            difficulty: q.difficulty || 'Medium'
        }));

        const mappedDsa = selectedDsa.map(q => ({
            id: q._id.toString(),
            title: q.title || '',
            slug: q.slug || '',
            difficulty: q.difficulty || 'Medium',
            topic: q.topic || 'Arrays',
            description: q.description || '',
            constraints: q.constraints || [],
            examples: q.examples || [],
            starterCode: q.starterCode || { javascript: '', python: '', cpp: '', java: '' },
            testCases: q.testCases || { visible: [], hidden: [] },
            solutionCode: q.theory?.solutionCode || q.theory?.optimal?.solutionCode || {}
        }));

        const newAttempt = new MockTestAttempt({
            userId,
            userName: user.displayName || 'Candidate',
            userEmail: user.email,
            testId: test._id,
            testName: test.name,
            timeLimit: test.timeLimit,
            startedAt: new Date(),
            isCompleted: false,
            questionsList: {
                aptitude: mappedApt,
                dsa: mappedDsa
            },
            answers: {},
            questionStatuses: {}
        });

        await newAttempt.save();
        console.log(`✅ Attempt created successfully. ID: ${newAttempt._id}`);

        console.log("\n--- SIMULATING PROGRESS SAVE ---");
        const attemptId = newAttempt._id;
        const answersObj = {};
        mappedApt.slice(0, 3).forEach((q, idx) => {
            answersObj[q.id] = 'B'; // answer 'B'
        });
        mappedDsa.slice(0, 1).forEach((q, idx) => {
            answersObj[q.id] = "function solve() { return 1; } // longer than 30 characters";
        });

        const attemptObj = await MockTestAttempt.findById(attemptId);
        attemptObj.answers = answersObj;
        await attemptObj.save();
        console.log(`✅ Progress saved successfully.`);

        console.log("\n--- SIMULATING SUBMIT ---");
        const finalAnswers = attemptObj.answers;
        const aptList = attemptObj.questionsList.aptitude || [];
        const dsaList = attemptObj.questionsList.dsa || [];

        let aptCorrectCount = 0;
        const topicStats = {};

        aptList.forEach(q => {
            const answer = finalAnswers.get(q.id);
            const isCorrect = answer === q.correctAnswer;
            if (isCorrect) aptCorrectCount++;

            const topic = q.topic || 'General';
            if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
            topicStats[topic].total++;
            if (isCorrect) topicStats[topic].correct++;
        });

        const aptScorePercent = aptList.length > 0 ? (aptCorrectCount / aptList.length) * 100 : 0;

        let totalDsaPassed = 0;
        dsaList.forEach(q => {
            const code = finalAnswers.get(q.id);
            if (code && code.trim().length > 30) {
                totalDsaPassed++;
            }
        });

        const dsaScorePercent = dsaList.length > 0 ? (totalDsaPassed / dsaList.length) * 100 : 0;

        const overallScore = Math.round((aptScorePercent + dsaScorePercent) / 2);
        const totalAttempted = finalAnswers.size;
        const accuracy = totalAttempted > 0 
            ? Math.round(((aptCorrectCount + totalDsaPassed) / totalAttempted) * 100)
            : 0;

        const timeSpent = Math.max(30, Math.floor((new Date() - attemptObj.startedAt) / 1000));

        const weakAreas = [];
        Object.entries(topicStats).forEach(([topic, stats]) => {
            const acc = (stats.correct / stats.total) * 100;
            if (acc < 60) weakAreas.push(topic);
        });

        attemptObj.isCompleted = true;
        attemptObj.completedAt = new Date();
        attemptObj.score = overallScore;
        attemptObj.accuracy = accuracy;
        attemptObj.timeTaken = timeSpent;
        attemptObj.dsaScore = Math.round(dsaScorePercent);
        attemptObj.aptitudeScore = Math.round(aptScorePercent);
        attemptObj.topicAnalysis = topicStats;
        attemptObj.weakAreas = weakAreas;
        attemptObj.rankEstimated = Math.max(12, Math.floor(100 - overallScore + Math.random() * 8));

        await attemptObj.save();
        console.log(`✅ Attempt submitted and graded successfully. Score: ${overallScore}, Accuracy: ${accuracy}`);

        // Clean up the created test attempt
        await MockTestAttempt.findByIdAndDelete(attemptId);
        console.log("Cleaned up database attempt document.");

        process.exit(0);
    } catch (err) {
        console.error("❌ MOCK TEST FLOW FARED:", err);
        process.exit(1);
    }
};

run();
