const mongoose = require("mongoose");

/**
 * Connects to the MongoDB database.
 * 
 * @throws {Error} If the connection to the database fails.
 */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
