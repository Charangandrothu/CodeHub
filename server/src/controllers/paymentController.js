const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Subscription
exports.createSubscription = async (req, res) => {
    try {
        const { uid } = req.body;

        // Use the plan ID from environment or request. 
        // User requested hardcoded/mapped plan.
        const plan_id = process.env.RAZORPAY_PLAN_ID;

        if (!plan_id) {
            return res.status(500).json({ error: "Configuration Error: Plan ID missing" });
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: plan_id,
            customer_notify: 1, // Notify via email/sms
            total_count: 120, // 10 years (or effectively unlimited for now until cancelled)
            notes: {
                uid: uid
            }
        });

        res.json({
            subscriptionId: subscription.id,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Create Subscription Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, uid } = req.body;

        const secret = process.env.RAZORPAY_KEY_SECRET;

        // Signature verification formula for Subscriptions:
        // razorpay_payment_id + "|" + razorpay_subscription_id
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_payment_id + "|" + razorpay_subscription_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // 1. Create Payment Record (for Admin Dashboard)
        const paymentRecord = new Payment({
            userId: uid,
            email: req.body.email || "", // Assuming email is passed or can be fetched
            amount: 499, // Hardcoded for now based on context, or fetch from plan details
            plan: 'Pro Monthly',
            status: 'success',
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_subscription_id // Using subscription ID as Order ID proxy
        });
        await paymentRecord.save();

        // 2. Update User in MongoDB
        const updatedUser = await User.findOneAndUpdate(
            { uid: uid },
            {
                $set: {
                    isPro: true,
                    plan: 'PRO',
                    paymentStatus: 'active',
                    subscriptionId: razorpay_subscription_id,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        res.json({ success: true, message: "Subscription activated", user: updatedUser });

    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ error: error.message });
    }
};
