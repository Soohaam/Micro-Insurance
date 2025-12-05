const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/companies", adminController.getCompanies);
router.post("/company/status", adminController.updateCompanyStatus);

module.exports = router;
