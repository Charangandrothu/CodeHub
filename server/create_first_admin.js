require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminUser = require('./src/models/AdminUser');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = process.env.INITIAL_ADMIN_EMAIL;
        const plainPassword = process.env.INITIAL_ADMIN_PASSWORD;
        const password_hash = await bcrypt.hash(plainPassword, 12);

        await AdminUser.findOneAndUpdate(
            { email },
            {
                email,
                password_hash,
                role: 'super_admin'
            },
            { upsert: true }
        );

        console.log("\n=============================================");
        console.log("✅ Secure Super Admin seeded successfully!");
        console.log("Email:", email);
        console.log("Password:", plainPassword);
        console.log("=============================================\n");
        process.exit(0);

    } catch (error) {
        console.error("Failed to seed admin:", error);
        process.exit(1);
    }
}
createAdmin();
