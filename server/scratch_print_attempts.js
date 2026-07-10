const mongoose = require("mongoose");
require("dotenv").config();
const MockTestAttempt = require("./src/models/MockTestAttempt");

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully.");

        const attempts = await MockTestAttempt.find().sort({ createdAt: -1 }).limit(5);
        console.log(`Fetched ${attempts.length} recent attempts:`);

        attempts.forEach((att, idx) => {
            console.log(`\n--- Attempt ${idx + 1} ---`);
            console.log(`ID: ${att._id}`);
            console.log(`testName: ${att.testName}`);
            console.log(`userId: ${att.userId}`);
            console.log(`isCompleted: ${att.isCompleted}`);
            console.log(`score: ${att.score}`);
            console.log(`accuracy: ${att.accuracy}`);
            console.log(`answers keys size:`, att.answers ? att.answers.size : 'N/A');
            console.log(`answers:`, att.answers);
            console.log(`questionsList: Aptitude count: ${att.questionsList?.aptitude?.length}, DSA count: ${att.questionsList?.dsa?.length}`);
            console.log(`createdAt: ${att.createdAt}`);
        });

        process.exit(0);
    } catch (err) {
        console.error("Error printing attempts:", err);
        process.exit(1);
    }
};

run();
