import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../Models/admin.js";
import dotenv from "dotenv";
import adminAuth from "../middleware/adminAuth.js"; // Middleware to protect admin routes
import Transaction from "../Models/Transaction.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js"; // Middleware to protect admin routes
// import Deposit from "../Models/deposit.js";
import User from "../Models/user.js";
import { sendDepositApprovalEmail } from "./mailer.js"; // Import the email function
import { sendSubscriptionRenewalEmail } from "./mailer.js"; // Import the email function

dotenv.config(); 

const router = express.Router();

// 🔥 Admin Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // const hashedPassword = await bcrypt.hash("your_admin_password", 10);
        // console.log(hashedPassword); // To hash the password 

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ msg: "Server error" });
    }
});


router.get("/dashboard", adminAuth, (req, res) => {
    res.json({ msg: "Welcome to the admin dashboard!" });
});



// **1️⃣ Get all transactions (Admin Only)**
router.get("/transactions", adminAuthMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find().populate("userId", "username email");
        res.json({transactions});
    } catch (error) {
        res.status(500).json({ msg: "Error fetching transactions" });
    }
});

// Verify transaction API
router.patch("/verify-transaction/:id", adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the transaction
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ msg: "Transaction not found" });
        }

        // Ensure it's still pending
        if (transaction.status !== "pending") {
            return res.status(400).json({ msg: "Transaction already verified" });
        }

        // Fetch the user associated with the transaction
        const user = await User.findById(transaction.userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }


        // Update transaction status
        transaction.status = "verified";
        if(transaction.status === "verified") {
                     if (user) {
                            const currentDate = new Date();
                            let newExpiryDate;
            
                            if (user.isSubscribed && user.subscriptionExpiry > currentDate) {
                                // Extend subscription from current expiry date
                                newExpiryDate = new Date(user.subscriptionExpiry);
                                newExpiryDate.setDate(newExpiryDate.getDate() + 30);
                            } else {
                                // New subscription or expired subscription
                                newExpiryDate = new Date();
                                newExpiryDate.setDate(newExpiryDate.getDate() + 30);
                            }
            
                            user.isSubscribed = true;
                            user.subscriptionExpiry = newExpiryDate;
                            await user.save();
            

              await sendDepositApprovalEmail(user.email, transaction.amount, "crypto", transaction.reference);
             await sendSubscriptionRenewalEmail(user.email, newExpiryDate); // Send renewal email
             await transaction.save();
                                    
            res.json({ msg: "Transaction verified successfully", transaction });
             } else {
                // User not found despite successful payment
                console.error(`User with email ${email} not found after successful payment`);
            }
        }
        // await sendDepositApprovalEmail(user.email, transaction.amount, "crypto", transaction.reference);
        // await transaction.save();

        // res.json({ msg: "Transaction verified successfully", transaction });
    } catch (error) {
        console.error("Error verifying transaction:", error);
        res.status(500).json({ msg: "Server error" });
    }
});


// Admin verifies deposit
router.put("/verify-deposit/:id", adminAuthMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ msg: "Invalid status" });
        }

        const deposit = await Transaction.findById(id);
        if (!deposit) {
            return res.status(404).json({ msg: "Deposit not found" });
        }

        if (deposit.status !== "pending") {
            return res.status(400).json({ msg: "Deposit already processed" });
        }

        deposit.status = status;
        await deposit.save();

        // If approved, update user balance
        if (status === "approved") {
            const user = await User.findById(deposit.userId);
            if (!user) return res.status(404).json({ msg: "User not found" });

            // Update user's method-specific balance
            const balanceField = `${deposit.currency.toLowerCase()}_balance`; // Example: btc_balance
            user[balanceField] = (user[balanceField] || 0) + deposit.amount;
            await user.save();
        }

        res.json({ msg: `Deposit ${status} successfully` });
    } catch (error) {
        res.status(500).json({ msg: "Server error", error: error.message });
    }
});


export default router;
