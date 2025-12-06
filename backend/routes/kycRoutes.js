const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const { verifyToken, isUser } = require('../middleware/auth');
const { uploadKYC } = require('../config/cloudinary');

// All KYC routes require authentication
router.use(verifyToken);

// User KYC routes (requires user role)
router.post('/upload', isUser, uploadKYC.single('aadhaar'), kycController.uploadAadhaar);
router.get('/status', isUser, kycController.getKYCStatus);

module.exports = router;
