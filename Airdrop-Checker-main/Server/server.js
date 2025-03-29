import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import airdropRoutes from "./routes/airdropRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import paystackRoutes from "./routes/paystackRoutes.js";



const port = process.env.PORT || 5000;

dotenv.config();  // Load environment variables

const app = express();
app.use(cors()); // Enable frontend access
app.use(express.json()); // Middleware to parse JSON



// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};
connectDB();
app.use("/api/auth", authRoutes);
app.use("/api", airdropRoutes);  // Protected Airdrop Route
app.use("/api/users", userRoutes);  // Protected User Route
app.use("/api/users", subscribeRoutes);  // Protected Subscribe status Route
app.use("/api/paystack", paystackRoutes);  // Paystack Payment Route




app.listen(port, () => console.log(`Server running on port ${port}`));
