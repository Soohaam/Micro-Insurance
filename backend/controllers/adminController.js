const db = require("../models");

const Company = db.Company;
const User = db.User;
const KYC = db.KYC;

/**
 * Get all companies (with optional status filter)
 */
exports.getCompanies = async (req, res) => {
    try {
        const { status } = req.query;

        const where = {};
        if (status) {
            where.status = status;
        }

        const companies = await Company.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });

        res.json({
            count: companies.length,
            companies,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching companies",
            error: error.message
        });
    }
};

/**
 * Get pending company approvals
 */
exports.getPendingCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll({
            where: { status: 'pending' },
            order: [['createdAt', 'ASC']],
        });

        res.json({
            count: companies.length,
            companies,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching pending companies",
            error: error.message
        });
    }
};

/**
 * Get company details by ID
 */
exports.getCompanyById = async (req, res) => {
    try {
        const { companyId } = req.params;

        const company = await Company.findByPk(companyId);

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.json(company);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching company details",
            error: error.message
        });
    }
};

/**
 * Approve or reject company registration
 */
exports.updateCompanyStatus = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { status, remarks } = req.body; // status: 'approved' or 'rejected'

        if (!['approved', 'rejected', 'blocked', 'suspended'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be 'approved', 'rejected', 'blocked', or 'suspended'"
            });
        }

        const company = await Company.findByPk(companyId);

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        company.status = status;
        await company.save();

        // TODO: Send email notification to company about status change

        res.json({
            message: `Company status updated to ${status}`,
            company: {
                companyId: company.companyId,
                companyName: company.companyName,
                status: company.status,
            },
            remarks,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating company status",
            error: error.message
        });
    }
};

/**
 * Get all users (with optional filters)
 */
exports.getUsers = async (req, res) => {
    try {
        const { kycStatus, page = 1, limit = 20 } = req.query;

        const where = {};
        if (kycStatus) {
            where.kycStatus = kycStatus;
        }

        const offset = (page - 1) * limit;

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['passwordHash'] }, // Don't send password hash
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
        });

        res.json({
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit),
            users,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error: error.message
        });
    }
};

/**
 * Get user details by ID
 */
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['passwordHash'] },
            include: [
                {
                    model: KYC,
                    as: 'kyc',
                    required: false,
                }
            ],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user details",
            error: error.message
        });
    }
};

/**
 * Update user KYC status (via KYC controller is preferred)
 * This is a backup/manual method
 */
exports.updateUserKYCStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { kycStatus, remarks } = req.body;

        if (!['pending', 'verified', 'rejected'].includes(kycStatus)) {
            return res.status(400).json({
                message: "Invalid KYC status"
            });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.kycStatus = kycStatus;
        await user.save();

        // TODO: Send notification to user

        res.json({
            message: `User KYC status updated to ${kycStatus}`,
            user: {
                userId: user.userId,
                fullName: user.fullName,
                kycStatus: user.kycStatus,
            },
            remarks,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating user KYC status",
            error: error.message
        });
    }
};

/**
 * Suspend or reactivate a user account
 */
exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive, reason } = req.body;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isActive = isActive;
        await user.save();

        // TODO: Log suspension reason and notify user

        res.json({
            message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
            user: {
                userId: user.userId,
                fullName: user.fullName,
                isActive: user.isActive,
            },
            reason,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating user status",
            error: error.message
        });
    }
};

/**
 * Get platform statistics
 */
exports.getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const verifiedUsers = await User.count({ where: { kycStatus: 'verified' } });
        const pendingKYC = await KYC.count({ where: { status: 'pending' } });

        const totalCompanies = await Company.count();
        const approvedCompanies = await Company.count({ where: { status: 'approved' } });
        const pendingCompanies = await Company.count({ where: { status: 'pending' } });

        const PurchasedProduct = db.PurchasedProduct;
        const totalPolicies = await PurchasedProduct.count();

        // Calculate active policies
        // We need to fetch all purchases and check dates because we don't store "active" status in DB
        const allPolicies = await PurchasedProduct.findAll({
            attributes: ['purchaseDate', 'duration']
        });

        const now = new Date();
        let activePolicies = 0;

        allPolicies.forEach(p => {
            const purchaseDate = new Date(p.purchaseDate);
            const durationDays = p.duration || 365;
            const endDate = new Date(purchaseDate);
            endDate.setDate(endDate.getDate() + durationDays);

            if (endDate > now) {
                activePolicies++;
            }
        });

        const pendingProducts = await db.Product.count({ where: { approvalStatus: 'pending' } });

        const totalClaims = await db.Claim.count();
        const paidClaims = await db.Claim.count({ where: { claimStatus: 'paid' } });

        res.json({
            users: {
                total: totalUsers,
                verified: verifiedUsers,
                pendingKYC,
            },
            companies: {
                total: totalCompanies,
                approved: approvedCompanies,
                pending: pendingCompanies,
            },
            policies: {
                total: totalPolicies,
                active: activePolicies,
            },
            products: {
                pending: pendingProducts,
            },
            claims: {
                total: totalClaims,
                paid: paidClaims,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching platform stats",
            error: error.message
        });
    }
};

/**
 * Get all products (with optional status filter)
 */
exports.getProducts = async (req, res) => {
    try {
        const { status } = req.query;
        const Product = db.Product;
        const Company = db.Company;

        const where = {};
        if (status && status !== 'all') {
            where.approvalStatus = status;
        }

        const products = await Product.findAll({
            where,
            include: [{
                model: Company,
                as: 'company',
                attributes: ['companyId', 'companyName', 'companyEmail'],
            }],
            order: [['createdAt', 'DESC']],
        });

        res.json({
            count: products.length,
            products,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching products",
            error: error.message,
        });
    }
};

/**
 * Get pending product approvals
 */
exports.getPendingProducts = async (req, res) => {
    try {
        const Product = db.Product;
        const Company = db.Company;

        const products = await Product.findAll({
            where: { approvalStatus: 'pending' },
            include: [{
                model: Company,
                as: 'company',
                attributes: ['companyId', 'companyName', 'companyEmail'],
            }],
            order: [['createdAt', 'ASC']],
        });

        res.json({
            count: products.length,
            products,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching pending products",
            error: error.message,
        });
    }
};

/**
 * Get product by ID (for approval review)
 */
exports.getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const Product = db.Product;
        const Company = db.Company;

        const product = await Product.findByPk(productId, {
            include: [{
                model: Company,
                as: 'company',
            }],
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching product",
            error: error.message,
        });
    }
};

/**
 * Approve or reject product
 */
exports.updateProductStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const { status, rejectionReason } = req.body;
        const Product = db.Product;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be 'approved' or 'rejected'"
            });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.approvalStatus !== 'pending') {
            return res.status(400).json({
                message: "Product has already been reviewed"
            });
        }

        // Update product status
        product.approvalStatus = status;
        product.approvedBy = req.user.id; // From auth middleware
        product.approvedAt = new Date();

        if (status === 'rejected' && rejectionReason) {
            product.rejectionReason = rejectionReason;
            product.isActive = false; // Deactivate rejected products
        } else if (status === 'approved') {
            product.isActive = true; // Activate approved products
        }

        await product.save();

        res.json({
            message: `Product ${status} successfully`,
            product,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating product status",
            error: error.message,
        });
    }
};
