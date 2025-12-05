require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for most cloud PostgreSQL providers
  },
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully");
    client.release();
  } catch (error) {
    console.error("❌ Error connecting to PostgreSQL:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, pool };