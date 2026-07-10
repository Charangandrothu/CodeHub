const mongoose = require("mongoose");
require("dotenv").config();
const Problem = require("./src/models/Problem");
const CompanyQuestion = require("./src/models/CompanyQuestion");
const MockTest = require("./src/models/MockTest");
const MockTestAttempt = require("./src/models/MockTestAttempt");

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully.");

        const problemsCount = await Problem.countDocuments();
        console.log(`Problem count: ${problemsCount}`);

        const companyQuestionsCount = await CompanyQuestion.countDocuments();
        console.log(`CompanyQuestion count: ${companyQuestionsCount}`);

        const mockTestsCount = await MockTest.countDocuments();
        console.log(`MockTest count: ${mockTestsCount}`);

        const attemptsCount = await MockTestAttempt.countDocuments();
        console.log(`MockTestAttempt count: ${attemptsCount}`);

        const testAptCount = await CompanyQuestion.countDocuments({ section: { $in: ['aptitude', 'reasoning', 'verbal'] }, isActive: true });
        console.log(`Aptitude/Reasoning/Verbal Active CompanyQuestions: ${testAptCount}`);

        const publicEasyDsa = await Problem.countDocuments({ difficulty: 'Easy', visibility: 'public' });
        const publicMedDsa = await Problem.countDocuments({ difficulty: 'Medium', visibility: 'public' });
        const publicHardDsa = await Problem.countDocuments({ difficulty: 'Hard', visibility: 'public' });
        console.log(`Public Easy DSA: ${publicEasyDsa}`);
        console.log(`Public Medium DSA: ${publicMedDsa}`);
        console.log(`Public Hard DSA: ${publicHardDsa}`);

        console.log("All checks done.");
        process.exit(0);
    } catch (err) {
        console.error("Error running DB checks:", err);
        process.exit(1);
    }
};

run();
