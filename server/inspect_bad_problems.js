const mongoose = require("mongoose");
require("dotenv").config();
const Problem = require("./src/models/Problem");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        console.error("DB Connection Error:", err.message);
        process.exit(1);
    }
};

const badSlugs = [
    "minimum-swaps-to-group-all-1s-together",
    "degree-of-an-array",
    "container-with-most-water",
    "3sum",
    "maximum-product-subarray",
    "subarray-sum-equals-k",
    "3sum-closest",
    "subarray-with-exactly-k-distinct-integers",
    "smallest-subarray-with-sum-greater-than-or-equal-k",
    "maximum-chunks-to-make-sorted",
    "minimum-operations-to-make-array-continuous",
    "find-all-duplicates-in-an-array",
    "maximum-points-you-can-obtain-from-cards",
    "trapping-rain-water",
    "reverse-pairs",
    "largest-rectangle-in-histogram",
    "maximum-sum-of-3-non-overlapping-subarrays"
];

const fs = require("fs");

const inspect = async () => {
    await connectDB();
    try {
        let output = "";
        const log = (msg) => { output += msg + "\n"; };
        for (const slug of badSlugs) {
            const p = await Problem.findOne({ slug });
            if (!p) {
                log(`Could not find problem with slug: ${slug}`);
                continue;
            }
            log(`\n==================================================`);
            log(`SLUG: ${p.slug}`);
            log(`TITLE: ${p.title}`);
            log(`STARTER CODE JS: ${p.starterCode?.javascript}`);
            log(`OPTIMAL JS SOLUTION: ${p.theory?.optimal?.solutionCode?.javascript || p.theory?.solutionCode?.javascript}`);
            log(`TEST CASES (VISIBLE, count=${p.testCases?.visible?.length || 0}):`);
            log(JSON.stringify(p.testCases?.visible?.slice(0, 2), null, 2));
            log(`TEST CASES (HIDDEN, count=${p.testCases?.hidden?.length || 0}):`);
            log(JSON.stringify(p.testCases?.hidden?.slice(0, 2), null, 2));
        }
        fs.writeFileSync("inspect_bad_problems_utf8.txt", output, "utf8");
        console.log("Wrote inspection output to inspect_bad_problems_utf8.txt");
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

inspect();
