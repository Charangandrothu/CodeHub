const Order = require('../models/Order');
const SubscriptionService = require('../services/subscriptionService');
const crypto = require('crypto');

class WebhookController {

    // Webhook listener for explicit backend verification
    static async handleWebhook(req, res) {
        try {
            const rawBody = req.body;
            const signature = req.headers["x-razorpay-signature"];
            const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

            // 1. Verify Signature (This can also be mapped in middleware)
            const expectedSignature = crypto
                .createHmac("sha256", secret)
                .update(JSON.stringify(rawBody))
                .digest("hex");

            if (expectedSignature !== signature) {
                console.error("Webhook signature mismatch.");
                return res.status(400).send("Invalid signature.");
            }

            // 2. Handle specific events safely
            const event = rawBody.event;

            // Listen to order.paid. (This indicates successfully collected order amount)
            if (event === 'order.paid') {
                const orderData = rawBody.payload.order.entity;
                const razorpayOrderId = orderData.id;
                const receivedAmount = orderData.amount;
                const receivedCurrency = orderData.currency;

                // 3. Find our internal order
                const dbOrder = await Order.findOne({ razorpay_order_id: razorpayOrderId });

                if (!dbOrder) {
                    console.error("Webhook Error: Order not found in DB ->", razorpayOrderId);
                    return res.status(404).json({ error: "Order not found" });
                }

                // Protect against replay attacks or double processing
                if (dbOrder.status === 'paid') {
                    return res.status(200).json({ message: "Already processed" });
                }

                // 4. Validate Amount and Currency Matches Our DB Exactly
                if (dbOrder.amount !== receivedAmount || dbOrder.currency !== receivedCurrency) {
                    console.error("Webhook Error: Amount/Currency Mismatch -> Database:", dbOrder.amount, "Webhook:", receivedAmount);
                    return res.status(400).json({ error: "Payment verification failed due to data mismatch" });
                }

                // 5. IF Valid: Activate Subscription & Mark Paid
                await SubscriptionService.activateSubscription(
                    dbOrder.user_id,
                    dbOrder.plan_id,
                    dbOrder.billing_cycle,
                    razorpayOrderId
                );

                dbOrder.status = 'paid';
                dbOrder.expireAt = undefined; // Do not let MongoDB delete paid orders
                await dbOrder.save();

                return res.status(200).json({ status: "success" });
            }

            // We simply acknowledge events we don't care about actively
            return res.status(200).json({ status: "ignored" });

        } catch (error) {
            console.error("Webhook Processing Error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = WebhookController;
