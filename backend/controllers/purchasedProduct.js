const { PurchasedProduct, Product, User, Company } = require('../models');

exports.createPurchase = async (req, res) => {
    try {
        const {
            productId,
            companyId,
            // userId, // We will use req.user.id from token
            userWalletAddress,
            companyWalletAddress,
            transactionHash,
            cost,
            duration,
            coverageAmount,
            policyType,
            productName // Although we can fetch this, user might send it or we fetch it
        } = req.body;

        const userId = req.user.id; // Get ID from authenticated user token

        // Optional: Fetch product details if not provided or to verify
        // For now, trust the incoming data as per requirement to just store it

        const newPurchase = await PurchasedProduct.create({
            productId,
            companyId,
            userId,
            userWalletAddress,
            companyWalletAddress,
            transactionHash,
            cost,
            duration,
            coverageAmount,
            policyType,
            productName,
            purchaseDate: new Date()
        });

        res.status(201).json({
            message: 'Purchase recorded successfully',
            purchase: newPurchase
        });
    } catch (error) {
        console.error('Error recording purchase:', error);
        res.status(500).json({
            message: 'Failed to record purchase',
            error: error.message
        });
    }
};

exports.getAllPurchases = async (req, res) => {
    try {
        const purchases = await PurchasedProduct.findAll({
            include: [
                { model: Product, as: 'product' },
                { model: Company, as: 'company' },
                { model: User, as: 'user' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(purchases);
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({
            message: 'Failed to fetch purchases',
            error: error.message
        });
    }
};

exports.getUserPurchases = async (req, res) => {
    try {
        const { userId } = req.params;
        const purchases = await PurchasedProduct.findAll({
            where: { userId },
            include: [
                { model: Product, as: 'product' },
                { model: Company, as: 'company' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(purchases);
    } catch (error) {
        console.error('Error fetching user purchases:', error);
        res.status(500).json({
            message: 'Failed to fetch user purchases',
            error: error.message
        });
    }
};
