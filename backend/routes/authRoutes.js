const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register/user', authController.registerUser);
router.post('/register/company', authController.registerCompany);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/wallet', verifyToken, authController.updateWalletAddress);

module.exports = router;
