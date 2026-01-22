const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./src/models/User");

dotenv.config();

const args = process.argv.slice(2);
const uid = args[0];
const email = args[1];

if (!uid || !email) {
    console.error("Usage: node set_pro_user.js <uid> <email>");
    process.exit(1);
}

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB...");

        try {
            const user = await User.findOneAndUpdate(
                { uid: uid },
                {
                    uid: uid,
                    email: email,
                    isPro: true
                },
                { upsert: true, new: true }
            );

            console.log("✅ User updated successfully!");
            console.log(user);
        } catch (error) {
            console.error("Error updating user:", error);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err);
    });
