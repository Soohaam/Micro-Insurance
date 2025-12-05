const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./models");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Root URL
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running 🚀" });
});

// Sync Database and Start Server
db.sequelize.sync({ alter: true }).then(() => {
  console.log("✅ Database synced successfully");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Failed to sync database:", err.message);
});