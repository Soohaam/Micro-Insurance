const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = db.User;
const Company = db.Company;
const Admin = db.Admin;

// Hardcoded Admin Credentials
const ADMIN_CREDENTIALS = {
    email: "admin@microinsurance.com",
    password: "adminpassword123",
};

exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, address, password, walletAddress } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            email,
            phone,
            address,
            passwordHash,
            walletAddress,
        });

        res.status(201).json({ message: "User registered successfully", user });
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

        const passwordHash = await bcrypt.hash(password, 10);

        const company = await Company.create({
            companyName,
            companyEmail,
            companyPhone,
            address,
            registrationNumber,
            passwordHash,
            walletAddress,
        });

        res.status(201).json({ message: "Company registered successfully. Pending approval.", company });
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
            if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
                const token = jwt.sign({ id: "admin", role: "admin" }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
                return res.json({ message: "Admin login successful", token, role: "admin" });
            } else {
                return res.status(401).json({ message: "Invalid admin credentials" });
            }
        } else if (role === "company") {
            user = await Company.findOne({ where: { companyEmail: email } });
            if (!user) return res.status(404).json({ message: "Company not found" });
            isMatch = await bcrypt.compare(password, user.passwordHash);
        } else {
            user = await User.findOne({ where: { email } });
            if (!user) return res.status(404).json({ message: "User not found" });
            isMatch = await bcrypt.compare(password, user.passwordHash);
        }

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.userId || user.companyId, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

        res.json({ message: "Login successful", token, role: user.role, user });
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
            user = { role: "admin", email: "admin@microinsurance.com" }; // Mock admin
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
