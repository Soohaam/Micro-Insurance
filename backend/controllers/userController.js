const db = require("../models");

const Product = db.Product;
const Policy = db.Policy;
const Company = db.Company;
const Claim = db.Claim;
const PurchasedProduct = db.PurchasedProduct;

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
            const minSum = parseFloat(product.sumInsuredMin);
            const baseRate = parseFloat(product.baseRate);
            const samplePremium = (minSum * baseRate / 100).toFixed(2);

            return {
                ...product.toJSON(),
                sumInsuredMin: minSum,
                sumInsuredMax: parseFloat(product.sumInsuredMax),
                baseRate: baseRate,
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
        console.log('=== GET PRODUCT DETAILS ===');
        console.log('Product ID:', productId);

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

        console.log('Product found:', product ? 'Yes' : 'No');

        if (!product) {
            console.log('Product not found or not active');
            return res.status(404).json({ message: "Product not found or no longer available" });
        }

        console.log('Product data exists, generating response...');

        // Calculate sample premiums for different coverage amounts
        const minSum = parseFloat(product.sumInsuredMin);
        const maxSum = parseFloat(product.sumInsuredMax);
        const baseRate = parseFloat(product.baseRate);

        const sampleCoverages = [
            minSum,
            (minSum + maxSum) / 2,
            maxSum,
        ];

        const premiumExamples = sampleCoverages.map(coverage => ({
            coverage: coverage.toFixed(2),
            premium: (coverage * baseRate / 100).toFixed(2),
        }));

        console.log('Response prepared successfully');
        res.json({
            ...product.toJSON(),
            sumInsuredMin: parseFloat(product.sumInsuredMin),
            sumInsuredMax: parseFloat(product.sumInsuredMax),
            baseRate: parseFloat(product.baseRate),
            premiumExamples,
        });
    } catch (error) {
        console.error('!!! ERROR in getProductDetails !!!');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
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
        // Note: 'status' field might not exist on PurchasedProduct directly in the same way, 
        // effectively filtering by calculated status might be harder in DB query, 
        // so we might filter in memory or rely on mapped status.
        // For now, let's fetch all and filter in memory if needed or ignore status query for DB 
        // if PurchasedProduct doesn't store 'active'/'expired' explicitly.
        // However, the frontend sends 'active', 'expired', 'claimed' (which implies it expects filter).
        // Let's fetch all then filter after mapping.

        const purchases = await PurchasedProduct.findAll({
            where: { userId },
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

        // Map to frontend Policy interface
        const policiesWithDetails = purchases.map(purchase => {
            const now = new Date();
            const startDate = new Date(purchase.purchaseDate);
            const durationDays = purchase.duration || 365; // Default to 1 year if missing
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + durationDays);

            const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

            let currentStatus = 'active';
            if (daysRemaining <= 0) {
                currentStatus = 'expired';
            }
            // Logic for 'claimed' is not yet linked to PurchasedProduct easily without joining Claims
            // For now, we stick to active/expired.

            return {
                _id: purchase.purchaseId,
                policyNumber: purchase.purchaseId.substring(0, 8).toUpperCase(), // Fake a policy number from ID
                product: {
                    productName: purchase.productName || (purchase.product ? purchase.product.productName : 'Unknown Product'),
                    coverageType: purchase.policyType || (purchase.product ? purchase.product.coverageType : 'Unknown Type'), // usage of policyType for coverageType slot
                },
                company: {
                    name: purchase.company ? purchase.company.companyName : 'Unknown Company',
                },
                sumInsured: parseFloat(purchase.coverageAmount || 0),
                premiumPaid: parseFloat(purchase.cost || 0),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                status: currentStatus,
                daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
            };
        });

        // Apply status filter if present
        const filteredPolicies = status && status !== 'all'
            ? policiesWithDetails.filter(p => p.status === status)
            : policiesWithDetails;

        res.json({
            count: filteredPolicies.length,
            policies: filteredPolicies,
        });
    } catch (error) {
        console.error("Error fetching policies:", error);
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