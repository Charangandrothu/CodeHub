const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const PricingService = require('../services/pricingService');
const crypto = require('crypto');

class PaymentController {

    // 1. Create Order API
    static async createOrder(req, res) {
        try {
            const { plan_id, billing_cycle } = req.body;
            const currency = req.currency; // Provided by geoLocation middleware
            const userId = req.user.uid; // Provided by auth middleware

            if (!['pro', 'elite'].includes(plan_id)) {
                return res.status(400).json({ error: "Invalid Plan ID" });
            }

            if (!['monthly', 'yearly'].includes(billing_cycle)) {
                return res.status(400).json({ error: "Invalid Billing Cycle" });
            }

            // 1. Calculate price securely (Backend Truth)
            const { finalAmount } = await PricingService.calculatePrice(plan_id, billing_cycle, currency);

            // Razorpay won't process less than ₹1 (100 paise) unless it's a test hook maybe, but mathematically correct
            if (finalAmount <= 0) {
                return res.status(400).json({ error: "Invalid amount calculated." });
            }

            // 2. Generate unique receipt ID
            const receiptId = `rcpt_${userId.substring(0, 5)}_${Date.now()}`;

            // 3. Create Razorpay Order
            const options = {
                amount: finalAmount, // Amount is in paise/cents
                currency: currency,
                receipt: receiptId,
            };

            const rpOrder = await razorpay.orders.create(options);

            if (!rpOrder || !rpOrder.id) {
                throw new Error("Razorpay Order Creation Failed");
            }

            // 4. Save Order in DB with status "created"
            const expireTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

            const newOrder = new Order({
                user_id: userId,
                plan_id,
                billing_cycle,
                currency,
                amount: finalAmount,
                razorpay_order_id: rpOrder.id,
                status: 'created',
                expireAt: expireTime
            });

            await newOrder.save();

            // 5. Return safe data to frontend
            return res.status(200).json({
                success: true,
                order_id: rpOrder.id,
                currency: rpOrder.currency,
                amount: rpOrder.amount, // safe to pass, frontend uses it for checkout modal display
                key_id: process.env.RAZORPAY_KEY_ID // Safe to expose public key
            });

        } catch (error) {
            console.error("Order Creation Error:", error);
            return res.status(500).json({ error: "Failed to create order" });
        }
    }

    // 2. Fetch Pricing Data for Frontend
    static async getPricing(req, res) {
        try {
            const currency = req.currency || 'INR'; // Detected by GeoLocation middleware
            const plans = ['pro', 'elite'];
            const responseData = {};

            for (const planId of plans) {
                const monthly = await PricingService.calculatePrice(planId, 'monthly', currency);
                const yearly = await PricingService.calculatePrice(planId, 'yearly', currency);

                responseData[planId] = {
                    monthly: Math.floor(monthly.finalAmount / 100),       // Convert back from paise/cents to display format
                    yearly: Math.floor(yearly.finalAmount / 100),
                    originalMonthly: Math.floor(monthly.basePrice / 100),
                    originalYearly: Math.floor(yearly.basePrice / 100),
                    currencySymbol: currency === 'INR' ? '₹' : '$',
                    currencyCode: currency
                };
            }

            return res.status(200).json({ success: true, pricing: responseData });

        } catch (error) {
            console.error("Fetch Pricing Error:", error);
            return res.status(500).json({ error: "Failed to fetch pricing" });
        }
    }
}

module.exports = PaymentController;
