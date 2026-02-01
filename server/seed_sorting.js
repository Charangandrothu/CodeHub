const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
require('dotenv').config({ path: '.env' });

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
    title: "Sort an Array",
    slug: "sort-an-array",
    difficulty: "Medium",
    topic: "sorting",
    tags: ["Sorting", "Arrays", "Divide and Conquer"],
    description: `Given an array of integers \`nums\`, sort the array in ascending order and return it.

You must solve the problem without using any built-in sorting functions in O(nlog(n)) time complexity and with the smallest space complexity possible.`,
    examples: [
        {
            input: "nums = [5,2,3,1]",
            output: "[1,2,3,5]",
            explanation: "After sorting the array, the positions of some numbers are not changed (for example, 2 and 3), while the positions of other numbers are changed (for example, 1 and 5)."
        },
        {
            input: "nums = [5,1,1,2,0,0]",
            output: "[0,0,1,1,2,5]",
            explanation: "Note that the values of nums are not clearly unique."
        }
    ],
    constraints: [
        "1 <= nums.length <= 5 * 10^4",
        "-5 * 10^4 <= nums[i] <= 5 * 10^4"
    ],
    starterCode: {
        javascript: `function solve(nums) {
  // Write your code here
  // Return the sorted array
  return nums;
}`,
        python: `def solve(nums):
    # Write your code here
    # Return the sorted list
    return nums`
    },
    testCases: {
        visible: [
            { input: "[5,2,3,1]", output: "[1,2,3,5]" },
            { input: "[5,1,1,2,0,0]", output: "[0,0,1,1,2,5]" }
        ],
        hidden: [
            { input: "[5,4,3,2,1]", output: "[1,2,3,4,5]" },
            { input: "[1]", output: "[1]" },
            { input: "[-1,5,3,0,-2]", output: "[-2,-1,0,3,5]" }
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
