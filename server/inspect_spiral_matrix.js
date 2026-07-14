const mongoose = require("mongoose");
require("dotenv").config();
const Problem = require("./src/models/Problem");

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const problem = await Problem.findOne({ slug: "spiral-matrix" });
    if (problem) {
        console.log(`TITLE: ${problem.title}`);
        console.log(`--- C++ OPTIMAL CODE ---`);
        console.log(problem.theory?.optimal?.solutionCode?.cpp || problem.theory?.solutionCode?.cpp || "None");
    } else {
        console.log("Problem not found!");
    }
    await mongoose.connection.close();
};

run().catch(console.error);
