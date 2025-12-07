const db = require("../models");

const Company = db.Company;
const Product = db.Product;
const Policy = db.Policy;
const PurchasedProduct = db.PurchasedProduct;

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
            cost,
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
            cost: cost || null,
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

        // Get total product count
        const totalProducts = await Product.count({
            where: { companyId },
        });

        // Get purchase statistics from PurchasedProduct
        const purchases = await PurchasedProduct.findAll({
            where: { companyId },
            attributes: ['cost', 'coverageAmount', 'purchaseDate', 'duration', 'policyType']
        });

        // Calculate active policies and financial metrics
        let activePolicies = 0;
        let totalPremiumsCollected = 0;
        let riskExposure = 0;

        const now = new Date();

        purchases.forEach(p => {
            // Money metrics
            totalPremiumsCollected += parseFloat(p.cost || 0);

            // Active status calculation
            const purchaseDate = new Date(p.purchaseDate);
            const durationDays = p.duration || 365;
            const endDate = new Date(purchaseDate);
            endDate.setDate(endDate.getDate() + durationDays);

            if (endDate > now) {
                activePolicies++;
                riskExposure += parseFloat(p.coverageAmount || 0);
            }
        });

        console.log(`Debug Stats for Company ${companyId}: Products=${totalProducts}, Purchases=${purchases.length}`);

        res.json({
            stats: {
                totalProducts,
                activePolicies,
                totalPremiums: totalPremiumsCollected, // Send as number
                totalPayouts: company.totalPayoutsMade || 0,
                poolBalance: company.poolBalance || 0,
                riskExposure: riskExposure // Send as number
            },
            companyStatus: company.status
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
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
        // Status filtering would technically need post-processing if not stored in DB,
        // but for pagination efficiency, we might just return sorted by date and filter on frontend or ignore status 
        // if user asks for specific status we might need to fetch all and filter or add a column.
        // For now, let's ignore status filter in the DB query for PurchasedProduct as we don't have a simple column,
        // or we rely on frontend filtering if total count isn't massive.

        const offset = (page - 1) * limit;

        const { count, rows: purchases } = await PurchasedProduct.findAndCountAll({
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

        // Remap to match frontend Policy interface expectation where possible
        const policies = purchases.map(p => {
            const purchaseDate = new Date(p.purchaseDate);
            const durationDays = p.duration || 365;
            const endDate = new Date(purchaseDate);
            endDate.setDate(endDate.getDate() + durationDays);

            const now = new Date();
            let currentStatus = 'active';
            if (endDate < now) {
                currentStatus = 'expired';
            }

            return {
                _id: p.purchaseId,
                policyNumber: p.purchaseId.substring(0, 8).toUpperCase(),
                product: p.product ? {
                    productName: p.product.productName
                } : { productName: p.productName || 'Unknown' },
                user: p.user ? {
                    name: p.user.fullName,
                    email: p.user.email
                } : { name: 'Unknown', email: 'N/A' },
                sumInsured: parseFloat(p.coverageAmount || 0),
                premiumPaid: parseFloat(p.cost || 0),
                startDate: p.purchaseDate,
                endDate: endDate,
                status: currentStatus, // calculated status
                duration: p.duration
            };
        });

        res.json({
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit),
            policies,
        });
    } catch (error) {
        console.error("Error fetching policies:", error);
        res.status(500).json({
            message: "Error fetching policies",
            error: error.message
        });
    }
};
