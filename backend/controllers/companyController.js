const db = require("../models");

const Company = db.Company;
const Product = db.Product;
const Policy = db.Policy;

/**
 * Upload company documents (license, compliance certificates)
 * Requires file upload middleware
 */
exports.uploadDocuments = async (req, res) => {
    try {
        const companyId = req.user.id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        // Get Cloudinary URLs
        const documentUrls = req.files.map(file => file.path);

        // Update company documents
        company.documents = [...(company.documents || []), ...documentUrls];
        await company.save();

        res.json({
            message: "Documents uploaded successfully",
            documents: company.documents,
            status: company.status,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error uploading documents",
            error: error.message
        });
    }
};

/**
 * Create a new insurance product
 * Only approved companies can create products
 */
exports.createProduct = async (req, res) => {
    try {
        const companyId = req.user.id;
        const {
            productName,
            description,
            policyType,
            coverageType,
            sumInsuredMin,
            sumInsuredMax,
            premiumRateFormula,
            baseRate,
            duration,
            eligibilityCriteria,
            oracleTriggerType,
            triggerThreshold,
            payoutFormula,
            policyDocument,
            maxPoliciesPerUser,
            regionsCovered,
            companyWalletAddress,
        } = req.body;

        // Validate required fields
        if (!productName || !policyType || !coverageType || !sumInsuredMin || !sumInsuredMax || !duration || !oracleTriggerType || !triggerThreshold) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Create product
        const product = await Product.create({
            companyId,
            productName,
            description,
            policyType,
            coverageType,
            sumInsuredMin,
            sumInsuredMax,
            premiumRateFormula: premiumRateFormula || 'sumInsured * 0.05',
            baseRate: baseRate || 5.0,
            duration,
            eligibilityCriteria: eligibilityCriteria || {},
            oracleTriggerType,
            triggerThreshold,
            payoutFormula: payoutFormula || 'sumInsured * 1.0',
            policyDocument,
            maxPoliciesPerUser: maxPoliciesPerUser || 1,
            regionsCovered: regionsCovered || [],
            companyWalletAddress: companyWalletAddress || null,
            isActive: true,
        });

        res.status(201).json({
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating product",
            error: error.message
        });
    }
};

/**
 * Get all products for a company
 */
exports.getCompanyProducts = async (req, res) => {
    try {
        const companyId = req.user.id;

        const products = await Product.findAll({
            where: { companyId },
            order: [['createdAt', 'DESC']],
        });

        res.json({
            count: products.length,
            products,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching products",
            error: error.message
        });
    }
};

/**
 * Update product
 */
exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const companyId = req.user.id;

        const product = await Product.findOne({
            where: { productId, companyId },
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized" });
        }

        // Check if there are active policies linked to this product
        const activePolicies = await Policy.count({
            where: {
                productId,
                status: 'active',
            },
        });

        if (activePolicies > 0) {
            return res.status(400).json({
                message: "Cannot update product with active policies",
                activePolicies,
            });
        }

        // Update product
        const updatedProduct = await product.update(req.body);

        res.json({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating product",
            error: error.message
        });
    }
};

/**
 * Deactivate product
 */
exports.deactivateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const companyId = req.user.id;

        const product = await Product.findOne({
            where: { productId, companyId },
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found or unauthorized" });
        }

        product.isActive = false;
        await product.save();

        res.json({
            message: "Product deactivated successfully",
            product,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deactivating product",
            error: error.message
        });
    }
};

/**
 * Get company dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const companyId = req.user.id;

        const company = await Company.findByPk(companyId);

        // Get product count
        const productsActive = await Product.count({
            where: { companyId, isActive: true },
        });

        // Get policy statistics
        const totalPoliciesSold = await Policy.count({
            where: { companyId },
        });

        const activePolicies = await Policy.count({
            where: { companyId, status: 'active' },
        });

        // Get financial metrics
        const policies = await Policy.findAll({
            where: { companyId },
            attributes: ['premiumAmount', 'sumInsured', 'claimStatus'],
        });

        const totalPremiumsCollected = policies.reduce((sum, p) => sum + parseFloat(p.premiumAmount || 0), 0);
        const riskExposure = policies.filter(p => p.status === 'active').reduce((sum, p) => sum + parseFloat(p.sumInsured || 0), 0);

        res.json({
            totalPoliciesSold,
            activePolicies,
            totalPremiumsCollected: totalPremiumsCollected.toFixed(2),
            totalPayoutsMade: company.totalPayoutsMade,
            poolBalance: company.poolBalance,
            riskExposure: riskExposure.toFixed(2),
            productsActive,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard stats",
            error: error.message
        });
    }
};

/**
 * Get policies purchased from this company
 */
exports.getCompanyPolicies = async (req, res) => {
    try {
        const companyId = req.user.id;
        const { status, page = 1, limit = 20 } = req.query;

        const where = { companyId };
        if (status) {
            where.status = status;
        }

        const offset = (page - 1) * limit;

        const { count, rows: policies } = await Policy.findAndCountAll({
            where,
            include: [
                {
                    model: db.User,
                    as: 'user',
                    attributes: ['userId', 'fullName', 'email', 'phone'],
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['productId', 'productName', 'policyType'],
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
        });

        res.json({
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit),
            policies,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching policies",
            error: error.message
        });
    }
};
