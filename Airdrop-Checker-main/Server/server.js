import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";   // For scheduling tasks
import User from "./Models/user.js"; // Import User model;
import authRoutes from "./routes/authRoutes.js";
import airdropRoutes from "./routes/airdropRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import paystackRoutes from "./routes/paystackRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";



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



// Run every midnight to check for expired subscriptions
cron.schedule("0 0 * * *", async () => {
  console.log("🔍 Running subscription expiry check...");
  const now = new Date();
  // console.log("Current Date:", now);

  try {
      // Find users with expired subscriptions
      const expiredUsers = await User.find({
          isSubscribed: true,
          subscriptionExpiry: { $lte: now }
      });

      if (expiredUsers.length > 0) {
          // Update them to mark as unsubscribed
          await User.updateMany(
              { subscriptionExpiry: { $lte: now } },
              { $set: { isSubscribed: false } }
          );

          console.log(`✅ Subscription expired for ${expiredUsers.length} users.`);
      } else {
          console.log("✅ No expired subscriptions found.");
      }
  } catch (error) {
      console.error("❌ Error updating subscriptions:", error);
  }
});
app.use("/api/auth", authRoutes);
app.use("/api", airdropRoutes);  // Protected Airdrop Route
app.use("/api/users", userRoutes); // Protected User Route
app.use("/api/users", subscribeRoutes);  // Protected Subscribe status Route
app.use("/api/paystack", paystackRoutes);  // Paystack Payment Route
app.use("/api/admin", adminRoutes); // Protected Admin Route




app.listen(port, () => console.log(`Server running on port ${port}`));
