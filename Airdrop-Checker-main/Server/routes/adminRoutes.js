import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../Models/admin.js";
import dotenv from "dotenv";
import adminAuth from "../middleware/adminAuth.js"; // Middleware to protect admin routes
import Transaction from "../Models/Transaction.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js"; // Middleware to protect admin routes

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

        // Update transaction status
        transaction.status = "verified";
        await transaction.save();

        res.json({ msg: "Transaction verified successfully", transaction });
    } catch (error) {
        console.error("Error verifying transaction:", error);
        res.status(500).json({ msg: "Server error" });
    }
});



export default router;
