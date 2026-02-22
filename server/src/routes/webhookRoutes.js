const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhookController');
const { verifyWebhook } = require('../middleware/verifyWebhook');

// Razorpay webhook endpoint
router.post('/razorpay', verifyWebhook, WebhookController.handleWebhook);

module.exports = router;
