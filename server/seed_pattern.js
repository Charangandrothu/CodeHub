const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
require('dotenv').config(); // Should pick up .env in current dir or pass path

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

const problemData = {
    title: "Solid Square Pattern",
    slug: "solid-square-pattern",
    difficulty: "Easy",
    topic: "patterns",
    tags: ["Pattern", "Loops"],
    description: `Given an integer \`n\`. You need to recreate the pattern given below for any value of \`n\`. 
    
Each row should be printed on a new line.

For \`n = 4\`:
****
****
****
****`,
    examples: [
        {
            input: "n = 3",
            output: "***\n***\n***",
            explanation: "For n=3, we print a 3x3 square of stars."
        }
    ],
    constraints: [
        "1 <= n <= 20"
    ],
    starterCode: {
        javascript: `function solve(n) {
  // Write your code here
  // Use console.log to print the output
}`,
        python: `def solve(n):
    # Write your code here
    # Use print() to output only the pattern`
    },
    testCases: {
        visible: [
            { input: "3", output: "***\n***\n***" }
        ],
        hidden: [
            { input: "1", output: "*" },
            { input: "2", output: "**\n**" },
            { input: "4", output: "****\n****\n****\n****" },
            { input: "5", output: "*****\n*****\n*****\n*****\n*****" }
        ]
    }
};

const seed = async () => {
    await connectDB();

    try {
        // Check if exists
        const exists = await Problem.findOne({ slug: problemData.slug });
        if (exists) {
            console.log('Problem already exists. Updating...');
            await Problem.findOneAndUpdate({ slug: problemData.slug }, problemData);
            console.log('Problem updated.');
        } else {
            await Problem.create(problemData);
            console.log('Problem created.');
        }
    } catch (error) {
        console.error('Error seeding problem:', error);
    } finally {
        mongoose.connection.close();
    }
};

seed();
