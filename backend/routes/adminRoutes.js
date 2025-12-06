const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const kycController = require('../controllers/kycController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(verifyToken, isAdmin);

// Company management
router.get('/companies', adminController.getCompanies);
router.get('/companies/pending', adminController.getPendingCompanies);
router.get('/companies/:companyId', adminController.getCompanyById);
router.put('/companies/:companyId/status', adminController.updateCompanyStatus);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId/kyc-status', adminController.updateUserKYCStatus);
router.put('/users/:userId/status', adminController.updateUserStatus);

// KYC management
router.get('/kyc/pending', kycController.getPendingKYC);
router.get('/kyc/:kycId', kycController.getKYCById);
router.put('/kyc/:kycId/status', kycController.updateKYCStatus);

// Product approval management
router.get('/products', adminController.getProducts);
router.get('/products/pending', adminController.getPendingProducts);
router.get('/products/:productId', adminController.getProductById);
router.put('/products/:productId/status', adminController.updateProductStatus);

// Platform statistics
router.get('/stats', adminController.getPlatformStats);

module.exports = router;
