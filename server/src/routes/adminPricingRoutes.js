const express = require('express');
const router = express.Router();
const PricingAdminController = require('../controllers/pricingAdminController');
const { requireAdmin } = require('../middleware/requireAdmin');

// Protected admin pricing commands enforcing RBAC, CSRF, and JWT via standard requireAdmin middleware execution
router.use(requireAdmin);

router.get('/plans', PricingAdminController.getPlans);
router.put('/plans/:plan_id', PricingAdminController.updatePlan);

router.get('/offers', PricingAdminController.getOffers);
router.post('/offers', PricingAdminController.createOffer);
router.put('/offers/:id', PricingAdminController.updateOffer);

module.exports = router;
