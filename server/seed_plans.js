require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('./src/models/Plan');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

const seedPlans = async () => {
    await connectDB();

    const plans = [
        {
            id: 'pro',
            name: 'Pro',
            monthly_inr: 19900, // INR 199 (in paise)
            yearly_inr: 99900,  // INR 999 (in paise)
            monthly_usd: 499,   // USD 4.99 (in cents)
            yearly_usd: 3999    // USD 39.99 (in cents)
        },
        {
            id: 'elite',
            name: 'Elite',
            monthly_inr: 39900, // INR 399
            yearly_inr: 199900, // INR 1999
            monthly_usd: 899,   // USD 8.99
            yearly_usd: 6999    // USD 69.99
        }
    ];

    try {
        for (const planData of plans) {
            await Plan.findOneAndUpdate(
                { id: planData.id },
                planData,
                { upsert: true, new: true }
            );
            console.log(`Plan ${planData.name} seeded successfully.`);
        }
        console.log('Seed completed!');
    } catch (error) {
        console.error('Error seeding plans:', error);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
};

seedPlans();
