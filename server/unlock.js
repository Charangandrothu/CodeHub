const mongoose = require('mongoose');
const AdminUser = require('./src/models/AdminUser');
require('dotenv').config({ path: '.env' });

const unlock = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
        const admin = await AdminUser.findOne({ email: adminEmail });
        admin.failedLoginAttempts = 0;
        admin.lockUntil = null;
        await admin.save();
        console.log("Admin unlocked!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
unlock();
