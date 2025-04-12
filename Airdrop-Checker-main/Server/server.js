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
import { sendRenewalReminder, sendSubscriptionExpiredEmail } from "./routes/mailer.js"; // Import mailer functions
import depositRoutes from "./routes/depositRoutes.js"; // Import deposit routes
import walletRoutes from "./routes/walletRoutes.js"; // Import wallet routes
import withdrawalRoutes from "./routes/withdrawalRoutes.js"; // Import withdrawal routes



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



// // Run every midnight to check for expired subscriptions
// cron.schedule("0 0 * * *", async () => {
//   console.log("🔍 Running subscription expiry check...");
//   const now = new Date();
//   // console.log("Current Date:", now);

//   try {
//       // Find users with expired subscriptions
//       const expiredUsers = await User.find({
//           isSubscribed: true,
//           subscriptionExpiry: { $lte: now }
//       });

//       if (expiredUsers.length > 0) {
//           // Update them to mark as unsubscribed
//           await User.updateMany(
//               { subscriptionExpiry: { $lte: now } },
//               { $set: { isSubscribed: false } }
//           );

//           console.log(`✅ Subscription expired for ${expiredUsers.length} users.`);
//       } else {
//           console.log("✅ No expired subscriptions found.");
//       }
//   } catch (error) {
//       console.error("❌ Error updating subscriptions:", error);
//   }
// });




// 1. Check for RENEWAL reminders (3 days before expiry) - Runs at 9 AM daily
cron.schedule("0 9 * * *", async () => {
  // console.log("🔔 Checking for expiring subscriptions (renewal reminders)...");
  const now = new Date();
  // console.log("🕒 Current server time:", now.toISOString());

  // Set warning window to 3 days from now IN UTC
  const warningDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 3, // Add 3 days
      now.getUTCHours(),
      now.getUTCMinutes()
    )
  );
  // console.log("⚠️ Checking subscriptions expiring before:", warningDate.toISOString());

  try {
    // Find users whose subscriptions expire in 3 days
    const expiringSoonUsers = await User.find({
      isSubscribed: true,
      subscriptionExpiry: {
        $gte: now.toISOString(),  // After current moment
        $lte: warningDate.toISOString() // Before 3-day window
      }
    });

    // console.log("🔍 Found subscriptions:", expiringSoonUsers.length);
    // Send renewal reminders
    for (const user of expiringSoonUsers) {
      await sendRenewalReminder(user.email, user.subscriptionExpiry);
    }
    

    console.log(`📩 Sent ${expiringSoonUsers.length} renewal reminders.`);
  } catch (error) {
    console.error("❌ Renewal reminder error:", error);
  }
});

// 2. Check for EXPIRED subscriptions - Runs at midnight daily
cron.schedule("0 0 * * *", async () => {
  console.log("🔍 Running subscription expiry check...");
  const now = new Date();
  console.log("⏰ Running expiry check at:", now.toISOString());

  try {
    // Find users with expired subscriptions
    const expiredUsers = await User.find({
      isSubscribed: true,
      subscriptionExpiry: { 
        $lte: now.toISOString() // Explicit UTC handling
      }
    });

    if (expiredUsers.length > 0) {
      // Mark as unsubscribed
      // await User.updateMany(
      //   { subscriptionExpiry: { $lte: now } },
      //   { $set: { isSubscribed: false } }
      // );

     // 2. Batch update + send emails
      await User.updateMany(
        { _id: { $in: expiredUsers.map(u => u._id) } },
        { $set: { isSubscribed: false, lastExpiryNotification: now } }
      );
      


      // 3. Parallel email sending with error handling
      const emailResults = await Promise.allSettled(
        expiredUsers.map(user => 
          sendSubscriptionExpiredEmail(user.email)
            .then(() => ({ success: true, email: user.email }))
            .catch(e => ({ success: false, email: user.email, error: e.message }))
        )
      );

     // 4. Detailed logging
      const failedEmails = emailResults.filter(r => !r.value.success);
      console.log(`📉 Expired ${expiredUsers.length} subscriptions.`);
      console.log(`📩 Sent ${emailResults.length - failedEmails.length} expiry emails.`);
      if (failedEmails.length > 0) {
        console.error("❌ Failed emails:", failedEmails);
      }

      // // Notify users of expiry
      // for (const user of expiredUsers) {
      //   await sendSubscriptionExpiredEmail(user.email);
      // }

      console.log(`📉 Subscription expired for ${expiredUsers.length} users.`);
    } else {
      console.log("✅ No expired subscriptions found.");
    }
  } catch (error) {
    console.error("❌ Expiry check error:", error);
  }
});

// async function testExpiryJob() {
//   const testUser = await User.findOneAndUpdate(
//     { email: "danielekene6b@gmail.com" },
//     { 
//       isSubscribed: true,
//       subscriptionExpiry: new Date(Date.now() - 1000) // Expired 1 second ago
//     },
//     { new: true }
//   );
//   console.log("Test user prepared:", testUser);
//   // require("./cron-expiry-job.js"); // Manually trigger
// }
// testExpiryJob();

console.log("⏰ Cron jobs for subscriptions are active.");


app.use("/api/auth", authRoutes);
app.use("/api", airdropRoutes);  // Protected Airdrop Route
app.use("/api/users", userRoutes); // Protected User Route
app.use("/api/users", subscribeRoutes);  // Protected Subscribe status Route
app.use("/api/paystack", paystackRoutes);  // Paystack Payment Route
app.use("/api/admin", adminRoutes); // Protected Admin Route
app.use("/api/deposits", depositRoutes); // Deposit Route
app.use("/api/withdrawals", withdrawalRoutes); // Withdraw Route
app.use("/api/wallets", walletRoutes); // Wallet Route





app.listen(port, () => console.log(`Server running on port ${port}`));
