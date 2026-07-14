const mongoose = require("mongoose");
require("dotenv").config();
const Problem = require("./src/models/Problem");
const { buildBatchDriver, executeWithPolling, normalizeOutput, languageIds } = require("./src/utils/judgeHelpers");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        console.error("DB Connection Error:", err.message);
        process.exit(1);
    }
};

const runAllTests = async () => {
    await connectDB();
    try {
        const problems = await Problem.find({ topic: "arrays" });
        console.log(`Found ${problems.length} array problems. Testing optimal solutions...`);

        for (const problem of problems) {
            console.log(`\n--------------------------------------------`);
            console.log(`Problem: "${problem.title}" (${problem.slug})`);

            // Use Javascript as the testing language
            const javascriptSolution = problem.theory?.optimal?.solutionCode?.javascript || problem.theory?.solutionCode?.javascript;
            if (!javascriptSolution) {
                console.log(`⚠️ No JavaScript optimal solution found, skipping.`);
                continue;
            }

            const visibleCases = problem.testCases?.visible || [];
            const hiddenCases = problem.testCases?.hidden || [];
            const allCases = [...visibleCases, ...hiddenCases];

            if (allCases.length === 0) {
                console.log(`⚠️ No test cases defined, skipping.`);
                continue;
            }

            const batchDriver = buildBatchDriver(javascriptSolution, "javascript");
            if (!batchDriver) {
                console.log(`❌ Failed to build batch driver for JavaScript solution.`);
                continue;
            }

            // Stdin for batch driver is structured as: T\n tc1_input\n tc2_input\n ...
            const combinedStdin = `${allCases.length}\n` + allCases.map(tc => tc.input.trim()).join("\n") + "\n";

            try {
                const result = await executeWithPolling(
                    batchDriver,
                    languageIds.javascript,
                    combinedStdin,
                    5 // generous timeout
                );

                if (result.status?.id !== 3 && result.status?.id !== 4) { // Not Accepted/Wrong Answer (e.g. compilation/runtime error)
                    console.log(`❌ Execution failed with status: ${result.status?.description}`);
                    console.log(`Stderr/Compile Error:`, result.stderr || result.compile_output);
                    continue;
                }

                const rawOutputs = (result.stdout || "").split(/\n?~---~\n?/);
                let failedCount = 0;

                for (let i = 0; i < allCases.length; i++) {
                    const tc = allCases[i];
                    const expected = normalizeOutput(tc.output);
                    const actual = normalizeOutput(rawOutputs[i] || "");

                    if (actual !== expected) {
                        failedCount++;
                        const isHidden = i >= visibleCases.length;
                        console.log(`  [Mismatch] ${isHidden ? 'Hidden' : 'Visible'} Test Case #${i + 1}:`);
                        console.log(`    Input: ${JSON.stringify(tc.input.trim())}`);
                        console.log(`    Expected Output: "${expected}"`);
                        console.log(`    Actual Output:   "${actual}"`);
                    }
                }

                if (failedCount === 0) {
                    console.log(`✅ All ${allCases.length} test cases PASSED!`);
                } else {
                    console.log(`❌ ${failedCount} / ${allCases.length} test cases FAILED due to mismatches.`);
                }

            } catch (err) {
                console.error(`❌ Error during execution:`, err.message);
            }
        }

    } catch (err) {
        console.error("Error during runAllTests:", err);
    } finally {
        mongoose.connection.close();
    }
};

runAllTests();
