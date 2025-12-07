const express = require('express');
const router = express.Router();
const purchasedProductController = require('../controllers/purchasedProduct');

const { verifyToken } = require('../middleware/auth');

// Route to create a new purchase record
router.post('/', verifyToken, purchasedProductController.createPurchase);

// Route to get all purchases (for admin or debugging)
router.get('/', purchasedProductController.getAllPurchases);

// Route to get purchases for a specific user
router.get('/user/:userId', purchasedProductController.getUserPurchases);

module.exports = router;
