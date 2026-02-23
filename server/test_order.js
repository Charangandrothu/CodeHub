require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const testOrder = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({});
        if (!user) {
            console.log("No user found");
            process.exit(0);
        }

        console.log("Testing with UID:", user.uid);

        const res = await fetch("http://localhost:5000/api/payment/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user-uid": user.uid
            },
            body: JSON.stringify({
                plan_id: "pro",
                billing_cycle: "yearly"
            })
        });

        const txt = await res.text();
        console.log("Response status:", res.status);
        console.log("Response text:", txt);
    } catch (err) {
        console.error("Fetch error:", err);
    } finally {
        mongoose.disconnect();
    }
}

testOrder();
