const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken, isCompany, isApprovedCompany } = require('../middleware/auth');
const { uploadCompanyDocs } = require('../config/cloudinary');

// All company routes require authentication and company role
router.use(verifyToken, isCompany);

// Document upload (can be done before approval)
router.post('/documents', uploadCompanyDocs.array('documents', 10), companyController.uploadDocuments);

// Product management (requires approval)
router.post('/products', isApprovedCompany, companyController.createProduct);
router.get('/products', companyController.getCompanyProducts);
router.put('/products/:productId', isApprovedCompany, companyController.updateProduct);
router.post('/products/:productId/deactivate', isApprovedCompany, companyController.deactivateProduct);

// Dashboard and analytics
router.get('/dashboard/stats', companyController.getDashboardStats);
router.get('/policies', companyController.getCompanyPolicies);

module.exports = router;
