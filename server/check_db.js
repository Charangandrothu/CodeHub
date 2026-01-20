const mongoose = require('mongoose');
require('dotenv').config();
const Problem = require('./src/models/Problem');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // console.log('MongoDB Connected'); // Reduce noise
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const checkProblems = async () => {
    await connectDB();
    try {
        const problems = await Problem.find({}, 'title slug topic');
        console.log(JSON.stringify(problems, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

checkProblems();
