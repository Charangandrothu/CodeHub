const mongoose = require("mongoose");
require("dotenv").config();
const Problem = require("./src/models/Problem");
const { buildBatchDriver, executeWithPolling, normalizeOutput, languageIds, timeLimits } = require("./src/utils/judgeHelpers");

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
        console.log(`Found ${problems.length} array problems. Testing optimal solutions for all languages...\n`);

        let overallFailures = 0;
        let overallSuccess = 0;
        let overallSkipped = 0;

        for (const problem of problems) {
            console.log(`\n============================================================`);
            console.log(`Problem: "${problem.title}" (${problem.slug})`);
            console.log(`============================================================`);

            const visibleCases = problem.testCases?.visible || [];
            const hiddenCases = problem.testCases?.hidden || [];
            const allCases = [...visibleCases, ...hiddenCases];

            if (allCases.length === 0) {
                console.log(`⚠️ No test cases defined, skipping problem.`);
                continue;
            }

            const languages = ["javascript", "python", "java", "cpp"];

            for (const lang of languages) {
                const solution = problem.theory?.optimal?.solutionCode?.[lang] || problem.theory?.solutionCode?.[lang];
                if (!solution || !solution.trim()) {
                    console.log(`⚠️  [${lang.toUpperCase()}] No optimal solution found, skipping.`);
                    overallSkipped++;
                    continue;
                }

                console.log(`⏳ [${lang.toUpperCase()}] Building batch driver and executing...`);

                const batchDriver = buildBatchDriver(solution, lang);
                if (!batchDriver) {
                    console.log(`❌  [${lang.toUpperCase()}] Failed to build batch driver.`);
                    overallFailures++;
                    continue;
                }

                // Stdin format: T\n tc1_input\n tc2_input\n ...
                const combinedStdin = `${allCases.length}\n` + allCases.map(tc => tc.input.trim()).join("\n") + "\n";
                const cpuTimeLimit = Math.min((timeLimits[lang] || 2) * allCases.length, 15);

                try {
                    const result = await executeWithPolling(
                        batchDriver,
                        languageIds[lang],
                        combinedStdin,
                        cpuTimeLimit
                    );

                    const statusId = result.status?.id;

                    if (statusId !== 3 && statusId !== 4) { // Not Accepted/Wrong Answer (e.g. compilation/runtime error)
                        console.log(`❌  [${lang.toUpperCase()}] Execution failed with status: ${result.status?.description}`);
                        console.log(`    Stderr/Compile Error:`, result.stderr || result.compile_output);
                        overallFailures++;
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
                            console.log(`    [Mismatch] ${isHidden ? 'Hidden' : 'Visible'} Test Case #${i + 1}:`);
                            console.log(`      Input: ${JSON.stringify(tc.input.trim())}`);
                            console.log(`      Expected Output: "${expected}"`);
                            console.log(`      Actual Output:   "${actual}"`);
                        }
                    }

                    if (failedCount === 0) {
                        console.log(`✅  [${lang.toUpperCase()}] All ${allCases.length} test cases PASSED!`);
                        overallSuccess++;
                    } else {
                        console.log(`❌  [${lang.toUpperCase()}] ${failedCount} / ${allCases.length} test cases FAILED due to mismatches.`);
                        overallFailures++;
                    }

                } catch (err) {
                    console.error(`❌  [${lang.toUpperCase()}] Error during execution:`, err.message);
                    overallFailures++;
                }
            }
        }

        console.log(`\n============================================================`);
        console.log(`SUMMARY OF TESTING:`);
        console.log(`- Successes: ${overallSuccess}`);
        console.log(`- Failures:  ${overallFailures}`);
        console.log(`- Skipped:   ${overallSkipped}`);
        console.log(`============================================================`);

        if (overallFailures > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }

    } catch (err) {
        console.error("Error during runAllTests:", err);
        process.exit(1);
    } finally {
        mongoose.connection.close();
    }
};

runAllTests();
