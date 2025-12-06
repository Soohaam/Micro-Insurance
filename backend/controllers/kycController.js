const db = require("../models");
const { processAadhaarCard } = require("../utils/ocrProcessor");

const User = db.User;
const KYC = db.KYC;

/**
 * Upload Aadhaar card and extract details
 * Requires file upload middleware
 */
exports.uploadAadhaar = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Get Cloudinary URL
        const aadhaarImageUrl = req.file.path;

        console.log("Processing Aadhaar card for user:", userId);
        console.log("Image URL:", aadhaarImageUrl);

        // Process image with OCR
        const ocrResult = await processAadhaarCard(aadhaarImageUrl);

        if (!ocrResult.success) {
            return res.status(400).json({ 
                message: "Failed to extract Aadhaar details from image", 
                error: ocrResult.error 
            });
        }

        const { aadhaarNumber, name, dob, gender } = ocrResult.data;

        // Check if Aadhaar number already exists
        const existingKYC = await KYC.findOne({ where: { aadhaarNumber } });
        if (existingKYC) {
            return res.status(400).json({ 
                message: "Aadhaar number already registered",
                kycId: existingKYC.kycId
            });
        }

        // Create KYC record
        const kyc = await KYC.create({
            userId,
            aadhaarNumber,
            aadhaarName: name,
            aadhaarImage: aadhaarImageUrl,
            documentType: 'aadhaar',
            status: 'pending',
            metadata: {
                dob,
                gender,
                rawOCRText: ocrResult.rawText,
                uploadedAt: new Date(),
            },
        });

        // Update user KYC status
        const user = await User.findByPk(userId);
        if (user) {
            user.kycStatus = 'pending';
            user.kycDocuments = [...(user.kycDocuments || []), aadhaarImageUrl];
            await user.save();
        }

        res.status(201).json({
            message: "Aadhaar uploaded successfully. Pending admin verification.",
            kyc: {
                kycId: kyc.kycId,
                aadhaarNumber: kyc.aadhaarNumber,
                aadhaarName: kyc.aadhaarName,
                status: kyc.status,
            },
            extractedData: {
                name,
                aadhaarNumber,
                dob,
                gender,
            },
        });
    } catch (error) {
        console.error("Error uploading Aadhaar:", error);
        res.status(500).json({ 
            message: "Error processing Aadhaar card", 
            error: error.message 
        });
    }
};

/**
 * Get user's KYC status
 */
exports.getKYCStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const kyc = await KYC.findOne({ 
            where: { userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'fullName', 'email', 'kycStatus'],
                }
            ],
        });

        if (!kyc) {
            return res.status(404).json({ 
                message: "No KYC record found. Please upload your Aadhaar card.",
                kycStatus: 'not_started'
            });
        }

        res.json({
            kycId: kyc.kycId,
            status: kyc.status,
            aadhaarName: kyc.aadhaarName,
            aadhaarNumber: kyc.aadhaarNumber.replace(/(\d{4})\d{4}(\d{4})/, "$1****$2"), // Mask middle digits
            documentType: kyc.documentType,
            submittedAt: kyc.createdAt,
            verifiedAt: kyc.verifiedAt,
            rejectionReason: kyc.rejectionReason,
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching KYC status", 
            error: error.message 
        });
    }
};

/**
 * Get all pending KYC requests (Admin only)
 */
exports.getPendingKYC = async (req, res) => {
    try {
        const pendingKYCs = await KYC.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'fullName', 'email', 'phone', 'walletAddress'],
                }
            ],
            order: [['createdAt', 'ASC']],
        });

        res.json({
            count: pendingKYCs.length,
            kycs: pendingKYCs,
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching pending KYC requests", 
            error: error.message 
        });
    }
};

/**
 * Approve or reject KYC (Admin only)
 */
exports.updateKYCStatus = async (req, res) => {
    try {
        const { kycId } = req.params;
        const { status, rejectionReason } = req.body; // status: 'verified' or 'rejected'
        const adminId = req.user.id;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status. Must be 'verified' or 'rejected'" 
            });
        }

        if (status === 'rejected' && !rejectionReason) {
            return res.status(400).json({ 
                message: "Rejection reason is required when rejecting KYC" 
            });
        }

        const kyc = await KYC.findByPk(kycId, {
            include: [
                {
                    model: User,
                    as: 'user',
                }
            ],
        });

        if (!kyc) {
            return res.status(404).json({ message: "KYC record not found" });
        }

        if (kyc.status !== 'pending') {
            return res.status(400).json({ 
                message: `KYC already ${kyc.status}`, 
                currentStatus: kyc.status 
            });
        }

        // Update KYC record
        kyc.status = status;
        kyc.verifiedBy = adminId;
        kyc.verifiedAt = new Date();
        if (rejectionReason) {
            kyc.rejectionReason = rejectionReason;
        }
        await kyc.save();

        // Update user KYC status
        if (kyc.user) {
            kyc.user.kycStatus = status;
            await kyc.user.save();
        }

        res.json({
            message: `KYC ${status === 'verified' ? 'approved' : 'rejected'} successfully`,
            kyc: {
                kycId: kyc.kycId,
                userId: kyc.userId,
                status: kyc.status,
                verifiedAt: kyc.verifiedAt,
                rejectionReason: kyc.rejectionReason,
            },
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error updating KYC status", 
            error: error.message 
        });
    }
};

/**
 * Get KYC details by ID (Admin only)
 */
exports.getKYCById = async (req, res) => {
    try {
        const { kycId } = req.params;

        const kyc = await KYC.findByPk(kycId, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'fullName', 'email', 'phone', 'walletAddress', 'address'],
                }
            ],
        });

        if (!kyc) {
            return res.status(404).json({ message: "KYC record not found" });
        }

        res.json(kyc);
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching KYC details", 
            error: error.message 
        });
    }
};
