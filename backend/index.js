const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./models");

// Load environment variables for configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure CORS to allow requests from frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const kycRoutes = require("./routes/kycRoutes");
const companyRoutes = require("./routes/companyRoutes");
const userRoutes = require("./routes/userRoutes");
const purchasedProductRoutes = require("./routes/purchasedProductRoutes");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/user", userRoutes);
app.use("/api/purchases", purchasedProductRoutes);

// Root URL
app.get("/", (req, res) => {
  res.json({
    message: "Micro Insurance Platform API 🚀",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      admin: "/api/admin",
      kyc: "/api/kyc",
      company: "/api/company",
      user: "/api/user",
      purchases: "/api/purchases"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: db.sequelize ? "Connected" : "Disconnected"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Sync Database and Start Server
db.sequelize.sync({ alter: true }).then(() => {
  console.log("✅ Database synced successfully");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API documentation available at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Failed to sync database:", err.message);
});
