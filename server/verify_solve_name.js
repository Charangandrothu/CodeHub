const mongoose = require("mongoose");
require("dotenv").config();
const Problem = require("./src/models/Problem");

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const problems = await Problem.find({});
    console.log(`Checking ${problems.length} problems...`);

    let nonSolveCount = 0;
    for (const problem of problems) {
        const langs = ["javascript", "python", "java", "cpp"];
        for (const lang of langs) {
            const code = problem.theory?.optimal?.solutionCode?.[lang] || problem.theory?.solutionCode?.[lang];
            if (!code) continue;

            // Check if code contains "solve"
            if (!code.includes("solve")) {
                nonSolveCount++;
                console.log(`Problem "${problem.title}" (${problem.slug}) in ${lang} does not contain "solve" in code.`);
                console.log(`Code excerpt:\n${code.substring(0, 200)}\n------------------`);
            }
        }
    }
    console.log(`Done. Found ${nonSolveCount} optimal solution codes without "solve".`);
    await mongoose.connection.close();
};

run().catch(console.error);
