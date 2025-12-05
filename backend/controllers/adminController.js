const db = require("../models");
const Company = db.Company;

exports.getCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll();
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching companies", error: error.message });
    }
};

exports.updateCompanyStatus = async (req, res) => {
    try {
        const { companyId, status } = req.body;
        const company = await Company.findByPk(companyId);

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        company.status = status;
        await company.save();

        res.json({ message: `Company status updated to ${status}`, company });
    } catch (error) {
        res.status(500).json({ message: "Error updating company status", error: error.message });
    }
};
