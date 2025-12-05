const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register/user", authController.registerUser);
router.post("/register/company", authController.registerCompany);
router.post("/login", authController.login);
router.get("/me", authController.getProfile);

module.exports = router;
