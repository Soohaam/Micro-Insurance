const db = require("../models");

const Product = db.Product;
const Policy = db.Policy;
const Company = db.Company;
const Claim = db.Claim;

/**
 * Browse all available insurance products
 */
exports.browseProducts = async (req, res) => {
    try {
        const { category, region, minPremium, maxPremium, policyType, coverageType } = req.query;

        const where = { isActive: true };
        
        if (policyType) {
            where.policyType = policyType;
        }
        
        if (coverageType) {
            where.coverageType = coverageType;
        }

        const products = await Product.findAll({
            where,
            include: [
                {
                    model: Company,
                    as: 'company',
                    where: { status: 'approved' },
                    attributes: ['companyId', 'companyName', 'companyEmail'],
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        // Additional filtering
        let filteredProducts = products;

        if (region) {
            filteredProducts = filteredProducts.filter(p => 
                p.regionsCovered.includes(region)
            );
        }

        // Calculate sample premiums for display
        const productsWithSamples = filteredProducts.map(product => {
            const samplePremium = (product.sumInsuredMin * product.baseRate / 100).toFixed(2);
            return {
                ...product.toJSON(),
                samplePremium: parseFloat(samplePremium),
            };
        });

        res.json({
            count: productsWithSamples.length,
            products: productsWithSamples,
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error browsing products", 
            error: error.message 
        });
    }
};

/**
 * Get detailed product information
 */
exports.getProductDetails = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({
            where: { productId, isActive: true },
            include: [
                {
                    model: Company,
                    as: 'company',
                    where: { status: 'approved' },
                    attributes: ['companyId', 'companyName', 'companyEmail', 'companyPhone'],
                }
            ],
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found or no longer available" });
        }

        // Calculate sample premiums for different coverage amounts
        const sampleCoverages = [
            product.sumInsuredMin,
            (product.sumInsuredMin + product.sumInsuredMax) / 2,
            product.sumInsuredMax,
        ];

        const premiumExamples = sampleCoverages.map(coverage => ({
            coverage: coverage.toFixed(2),
            premium: (coverage * product.baseRate / 100).toFixed(2),
        }));

        res.json({
            ...product.toJSON(),
            premiumExamples,
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching product details", 
            error: error.message 
        });
    }
};

/**
 * Purchase an insurance policy
 * Requires KYC verification
 */
exports.purchasePolicy = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            productId,
            sumInsured,
            startDate,
            location,
            walletAddress,
            transactionHash, // MetaMask transaction hash
        } = req.body;

        // Validate required fields
        if (!productId || !sumInsured || !location) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Get product details
        const product = await Product.findOne({
            where: { productId, isActive: true },
            include: [
                {
                    model: Company,
                    as: 'company',
                    where: { status: 'approved' },
                }
            ],
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found or no longer available" });
        }

        // Validate sum insured is within product limits
        if (sumInsured < product.sumInsuredMin || sumInsured > product.sumInsuredMax) {
            return res.status(400).json({ 
                message: `Sum insured must be between ${product.sumInsuredMin} and ${product.sumInsuredMax}` 
            });
        }

        // Check if user has exceeded max policies for this product
        const userPoliciesCount = await Policy.count({
            where: { 
                userId, 
                productId,
                status: 'active',
            },
        });

        if (userPoliciesCount >= product.maxPoliciesPerUser) {
            return res.status(400).json({ 
                message: `You have reached the maximum number of policies (${product.maxPoliciesPerUser}) for this product` 
            });
        }

        // Calculate premium using product formula
        const premiumAmount = (sumInsured * product.baseRate / 100);

        // Calculate dates
        const policyStartDate = startDate ? new Date(startDate) : new Date();
        const policyEndDate = new Date(policyStartDate);
        policyEndDate.setDate(policyEndDate.getDate() + product.duration);

        // Generate policy number
        const policyNumber = `POL-${Date.now()}-${userId.substring(0, 8)}`;

        // Create policy
        const policy = await Policy.create({
            userId,
            companyId: product.companyId,
            productId,
            policyNumber,
            policyType: product.policyType,
            sumInsured,
            premiumAmount,
            startDate: policyStartDate,
            endDate: policyEndDate,
            location,
            oracleJobId: null, // Will be set when oracle is configured
            oracleStatus: 'pending',
            claimStatus: 'none',
            contractAddress: null, // Will be set by smart contract
            transactionHash: transactionHash || null,
            nftTokenId: null,
            status: 'active',
        });

        // Update company premiums collected
        await Company.increment(
            'totalPremiumsCollected', 
            { 
                by: premiumAmount,
                where: { companyId: product.companyId }
            }
        );

        res.status(201).json({
            message: "Policy purchased successfully",
            policy: {
                policyId: policy.policyId,
                policyNumber: policy.policyNumber,
                productName: product.productName,
                sumInsured: policy.sumInsured,
                premiumAmount: policy.premiumAmount,
                startDate: policy.startDate,
                endDate: policy.endDate,
                status: policy.status,
                transactionHash: policy.transactionHash,
            },
            nextSteps: "Your policy is now active. Claims will be automatically processed based on oracle data.",
        });
    } catch (error) {
        console.error("Error purchasing policy:", error);
        res.status(500).json({ 
            message: "Error purchasing policy", 
            error: error.message 
        });
    }
};

/**
 * Get user's policies
 */
exports.getMyPolicies = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        const where = { userId };
        if (status) {
            where.status = status;
        }

        const policies = await Policy.findAll({
            where,
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['productId', 'productName', 'policyType', 'coverageType'],
                },
                {
                    model: Company,
                    as: 'company',
                    attributes: ['companyId', 'companyName'],
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        // Calculate days remaining for each policy
        const policiesWithDetails = policies.map(policy => {
            const now = new Date();
            const endDate = new Date(policy.endDate);
            const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            
            return {
                ...policy.toJSON(),
                daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
                isExpired: daysRemaining <= 0,
            };
        });

        res.json({
            count: policiesWithDetails.length,
            policies: policiesWithDetails,
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching policies", 
            error: error.message 
        });
    }
};

/**
 * Get policy status and oracle data
 */
exports.getPolicyStatus = async (req, res) => {
    try {
        const { policyId } = req.params;
        const userId = req.user.id;

        const policy = await Policy.findOne({
            where: { policyId, userId },
            include: [
                {
                    model: Product,
                    as: 'product',
                },
                {
                    model: Company,
                    as: 'company',
                    attributes: ['companyId', 'companyName'],
                },
                {
                    model: Claim,
                    as: 'claims',
                    required: false,
                }
            ],
        });

        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        // TODO: Query Chainlink oracle for latest data
        // For now, return policy status

        res.json({
            policy,
            oracleInfo: {
                status: policy.oracleStatus,
                jobId: policy.oracleJobId,
                lastChecked: null, // TODO: Get from oracle
                nextCheck: null, // TODO: Calculate based on oracle schedule
            },
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching policy status", 
            error: error.message 
        });
    }
};

/**
 * Get user's claims
 */
exports.getMyClaims = async (req, res) => {
    try {
        const userId = req.user.id;

        const claims = await Claim.findAll({
            where: { userId },
            include: [
                {
                    model: Policy,
                    as: 'policy',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['productId', 'productName'],
                        }
                    ],
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json({
            count: claims.length,
            claims,
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching claims", 
            error: error.message 
        });
    }
};
