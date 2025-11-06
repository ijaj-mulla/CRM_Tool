// backend/config/db.js
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MongoDB connection URI not found in environment variables");
    }

    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully to Atlas!");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
