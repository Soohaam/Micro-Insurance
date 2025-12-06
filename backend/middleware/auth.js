const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and extract user info
exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded; // { id, role }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
    }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// Middleware to check if user is company
exports.isCompany = (req, res, next) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ message: 'Access denied. Company only.' });
    }
    next();
};

// Middleware to check if user is a regular user (beneficiary)
exports.isUser = (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ message: 'Access denied. User only.' });
    }
    next();
};

// Middleware to check if company is approved
exports.isApprovedCompany = async (req, res, next) => {
    try {
        const db = require('../models');
        const company = await db.Company.findByPk(req.user.id);
        
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        
        if (company.status !== 'approved') {
            return res.status(403).json({ 
                message: `Access denied. Company status: ${company.status}`,
                status: company.status
            });
        }
        
        req.company = company;
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Error verifying company status', error: error.message });
    }
};

// Middleware to check if user has completed KYC
exports.isKYCVerified = async (req, res, next) => {
    try {
        const db = require('../models');
        const user = await db.User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.kycStatus !== 'verified') {
            return res.status(403).json({ 
                message: `KYC not verified. Current status: ${user.kycStatus}`,
                kycStatus: user.kycStatus
            });
        }
        
        req.userProfile = user;
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Error verifying KYC status', error: error.message });
    }
};
