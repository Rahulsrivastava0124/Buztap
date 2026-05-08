const mongoose = require("mongoose");

const MAX_RETRIES = 10;
const BASE_DELAY_MS = 3000; // 3 s initial, doubles each attempt, capped at 30 s

async function connectDB(attempt = 1) {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/tableqr";
  try {
    await mongoose.connect(uri);
    console.info("✅ MongoDB connected");
  } catch (err) {
    console.error(
      `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`,
    );
    if (attempt < MAX_RETRIES) {
      const delay = Math.min(BASE_DELAY_MS * attempt, 30_000);
      console.info(`   Retrying in ${delay / 1000}s…`);
      setTimeout(() => connectDB(attempt + 1), delay);
    } else {
      console.error("MongoDB: max retries reached — running without database.");
    }
  }
}

module.exports = connectDB;
