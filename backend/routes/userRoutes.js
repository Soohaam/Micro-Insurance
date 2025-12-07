const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isUser, isKYCVerified } = require('../middleware/auth');

// Browse products (public - no authentication required)
router.get('/products', userController.browseProducts);
router.get('/products/:productId', userController.getProductDetails);

// User-specific routes (requires authentication and user role)
router.use(verifyToken, isUser);

// Purchase policy (requires KYC verification)
router.post('/policies/purchase', isKYCVerified, userController.purchasePolicy);

// View user's policies and claims
router.get('/policies', userController.getMyPolicies);
router.get('/policies/:policyId/status', userController.getPolicyStatus);
router.get('/claims', userController.getMyClaims);

module.exports = router;