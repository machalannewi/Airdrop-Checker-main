import express from "express";
import Deposit from "../Models/deposit.js"; // Import the Deposit model
import authMiddleware from "../middleware/authMiddleware.js"; // Ensure user is authenticated

const router = express.Router();

// User submits deposit request
router.post("/submit", authMiddleware, async (req, res) => {
    try {
        const userId = req.user && req.user.userId; // ✅ Ensure correct extraction

        const { amount, currency, transactionHash } = req.body;

        if (!userId) {
            return res.status(401).json({ msg: "Unauthorized: No user ID found" });
        }

        if (!amount || !currency || !transactionHash) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // Ensure transaction hash is unique
        const existingDeposit = await Deposit.findOne({ transactionHash });
        if (existingDeposit) {
            return res.status(400).json({ msg: "Transaction hash already exists" });
        }

        const deposit = new Deposit({
            userId,
            amount,
            currency,
            transactionHash,
            status: "pending"
        });


        await deposit.save();
        res.status(201).json({ msg: "Deposit submitted. Awaiting admin approval." });
    } catch (error) {
        res.status(500).json({ msg: "Server error", error: error.message });
    }
});

export default router;
