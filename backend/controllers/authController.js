const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = db.User;
const Company = db.Company;
const Admin = db.Admin;

exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, address, password, walletAddress } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Validate wallet address if provided
        if (walletAddress) {
            const existingWallet = await User.findOne({ where: { walletAddress } });
            if (existingWallet) {
                return res.status(400).json({ message: "Wallet address already registered" });
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            email,
            phone,
            address,
            passwordHash,
            walletAddress: walletAddress || `temp_${Date.now()}`, // Temporary, will be updated when MetaMask connects
            kycStatus: 'pending',
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.userId, role: user.role }, 
            process.env.JWT_SECRET || "secret", 
            { expiresIn: "7d" }
        );

        res.status(201).json({ 
            message: "User registered successfully. Please complete KYC verification.", 
            user: {
                userId: user.userId,
                fullName: user.fullName,
                email: user.email,
                kycStatus: user.kycStatus,
                role: user.role,
            },
            token,
            redirectTo: '/kyc', // Frontend should redirect to KYC page
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
};

exports.registerCompany = async (req, res) => {
    try {
        const { companyName, companyEmail, companyPhone, address, registrationNumber, password, walletAddress } = req.body;

        // Check if company already exists
        const existingCompany = await Company.findOne({ where: { companyEmail } });
        if (existingCompany) {
            return res.status(400).json({ message: "Company already exists" });
        }

        // Validate wallet address
        if (walletAddress) {
            const existingWallet = await Company.findOne({ where: { walletAddress } });
            if (existingWallet) {
                return res.status(400).json({ message: "Wallet address already registered" });
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const company = await Company.create({
            companyName,
            companyEmail,
            companyPhone,
            address,
            registrationNumber,
            passwordHash,
            walletAddress: walletAddress || `temp_company_${Date.now()}`,
            status: 'pending', // Needs admin approval
        });

        res.status(201).json({ 
            message: "Company registered successfully. Pending admin approval.", 
            company: {
                companyId: company.companyId,
                companyName: company.companyName,
                companyEmail: company.companyEmail,
                status: company.status,
                role: company.role,
            },
            info: "Please upload your license and compliance documents for verification."
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering company", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        let user;
        let isMatch = false;

        if (role === "admin") {
            // Use database admin instead of hardcoded
            user = await Admin.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: "Admin not found" });
            }
            
            // Check if admin is active
            if (!user.isActive) {
                return res.status(403).json({ message: "Admin account is deactivated" });
            }
            
            isMatch = await bcrypt.compare(password, user.passwordHash);
            
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid admin credentials" });
            }
            
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            
            const token = jwt.sign(
                { id: user.adminId, role: "admin" }, 
                process.env.JWT_SECRET || "secret", 
                { expiresIn: "24h" }
            );
            
            return res.json({ 
                message: "Admin login successful", 
                token, 
                role: "admin",
                user: {
                    id: user.adminId,
                    email: user.email,
                    name: user.fullName,
                    role: 'admin',
                }
            });
        } else if (role === "company") {
            user = await Company.findOne({ where: { companyEmail: email } });
            if (!user) return res.status(404).json({ message: "Company not found" });
            isMatch = await bcrypt.compare(password, user.passwordHash);
            
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign(
                { id: user.companyId, role: "company" }, 
                process.env.JWT_SECRET || "secret", 
                { expiresIn: "7d" }
            );

            return res.json({ 
                message: "Login successful", 
                token, 
                role: "company",
                user: {
                    id: user.companyId,
                    email: user.companyEmail,
                    name: user.companyName,
                    role: "company",
                    status: user.status,
                    walletAddress: user.walletAddress,
                }
            });
        } else {
            user = await User.findOne({ where: { email } });
            if (!user) return res.status(404).json({ message: "User not found" });
            isMatch = await bcrypt.compare(password, user.passwordHash);
        }

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.userId, role: "user" }, 
            process.env.JWT_SECRET || "secret", 
            { expiresIn: "7d" }
        );

        res.json({ 
            message: "Login successful", 
            token, 
            role: "user",
            user: {
                id: user.userId,
                email: user.email,
                name: user.fullName,
                role: "user",
                kycStatus: user.kycStatus,
                walletAddress: user.walletAddress,
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

        let user;
        if (decoded.role === "admin") {
            user = await Admin.findByPk(decoded.id);
            if (!user) return res.status(404).json({ message: "Admin not found" });
        } else if (decoded.role === "company") {
            user = await Company.findByPk(decoded.id);
        } else {
            user = await User.findByPk(decoded.id);
        }

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
};

// Update wallet address (for MetaMask connection)
exports.updateWalletAddress = async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) return res.status(401).json({ message: "No token provided" });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        
        if (!walletAddress || !walletAddress.startsWith('0x')) {
            return res.status(400).json({ message: "Invalid wallet address" });
        }

        let user;
        if (decoded.role === "company") {
            // Check if wallet already exists
            const existingWallet = await Company.findOne({ where: { walletAddress } });
            if (existingWallet && existingWallet.companyId !== decoded.id) {
                return res.status(400).json({ message: "Wallet address already in use" });
            }
            
            user = await Company.findByPk(decoded.id);
            if (!user) return res.status(404).json({ message: "Company not found" });
            
            user.walletAddress = walletAddress;
            await user.save();
        } else if (decoded.role === "user") {
            // Check if wallet already exists
            const existingWallet = await User.findOne({ where: { walletAddress } });
            if (existingWallet && existingWallet.userId !== decoded.id) {
                return res.status(400).json({ message: "Wallet address already in use" });
            }
            
            user = await User.findByPk(decoded.id);
            if (!user) return res.status(404).json({ message: "User not found" });
            
            user.walletAddress = walletAddress;
            await user.save();
        } else {
            return res.status(403).json({ message: "Invalid role" });
        }

        res.json({ 
            message: "Wallet address updated successfully", 
            walletAddress: user.walletAddress 
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating wallet address", error: error.message });
    }
};
