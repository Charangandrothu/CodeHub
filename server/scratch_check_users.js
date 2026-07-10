const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./src/models/User");

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully.");

        const users = await User.find().limit(20);
        console.log(`Found ${users.length} users:`);
        users.forEach((u, i) => {
            console.log(`${i+1}. UID: ${u.uid}, Email: ${u.email}, Username: ${u.username}, Role: ${u.role}, Plan: ${u.plan}`);
        });

        process.exit(0);
    } catch (err) {
        console.error("Error checking users:", err);
        process.exit(1);
    }
};

run();
