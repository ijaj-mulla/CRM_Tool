// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use Atlas connection string directly (no .env)
    const uri = "mongodb+srv://ijajmulla:Eajaj09@crmcluster.rgvkk3m.mongodb.net/CRM_Tool?retryWrites=true&w=majority";
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully TO ATLAS!");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
