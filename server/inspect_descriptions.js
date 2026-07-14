const mongoose = require("mongoose");
require("dotenv").config();
const Problem = require("./src/models/Problem");
const fs = require("fs");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        console.error("DB Connection Error:", err.message);
        process.exit(1);
    }
};

const slugs = [
    "minimum-swaps-to-group-all-1s-together",
    "degree-of-an-array",
    "container-with-most-water",
    "3sum",
    "maximum-product-subarray",
    "maximum-chunks-to-make-sorted",
    "minimum-operations-to-make-array-continuous",
    "find-all-duplicates-in-an-array",
    "trapping-rain-water",
    "largest-rectangle-in-histogram"
];

const inspect = async () => {
    await connectDB();
    try {
        let output = "";
        for (const slug of slugs) {
            const p = await Problem.findOne({ slug });
            if (p) {
                output += `\n==================================================\n`;
                output += `SLUG: ${p.slug}\n`;
                output += `TITLE: ${p.title}\n`;
                output += `DESCRIPTION:\n${p.description}\n`;
            }
        }
        fs.writeFileSync("descriptions.txt", output, "utf8");
        console.log("Wrote descriptions to descriptions.txt");
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

inspect();
