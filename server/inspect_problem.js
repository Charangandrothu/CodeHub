const mongoose = require('mongoose');
require('dotenv').config();
const Problem = require('./src/models/Problem');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const checkSpecificProblem = async () => {
    await connectDB();
    try {
        // Fetch by ID found in the previous step
        const problem = await Problem.findById("696e5d316382892c474280d3");
        console.log(JSON.stringify(problem, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

checkSpecificProblem();
