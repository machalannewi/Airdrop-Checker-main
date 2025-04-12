import express from "express";
import Deposit from "../Models/Transaction.js"; // Import the Deposit model
import authMiddleware from "../middleware/authMiddleware.js"; // Ensure user is authenticated

const router = express.Router();

// User submits deposit request
router.post("/submit", authMiddleware, async (req, res) => {
    try {
        // const userId = req.user && req.user.userId; // ✅ Ensure correct extraction

        // const { amount, currency, transactionHash } = req.body;

        const { amount, paymentMethod, reference, walletAddress, network, transactionHash } = req.body;
        const userId = req.user && req.user.userId;

        if (!userId) {
            return res.status(401).json({ msg: "Unauthorized: No user ID found" });
        }

        if (!amount || !paymentMethod || !transactionHash) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // Ensure transaction hash is unique
        const existingDeposit = await Deposit.findOne({ transactionHash });
        if (existingDeposit) {
            return res.status(400).json({ msg: "Transaction hash already exists" });
        }

        // const deposit = new Deposit({
        //     userId,
        //     amount,
        //     currency,
        //     transactionHash,
        //     status: "pending"
        // });

        const newTransaction = new Deposit({
            userId,
            amount,
            transactionHash,
            reference,
            paymentMethod: "Crypto",
            walletAddress,
            network,
            status: "pending",
          });

        await newTransaction.save();
        res.status(201).json({ msg: "Deposit submitted. Awaiting admin approval." });
    } catch (error) {
        res.status(500).json({ msg: "Server error", error: error.message });
    }
});


// GET /api/deposits/user - fetch user's deposits
router.get("/user", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ msg: "Unauthorized: No user ID found" });
        }
        console.log("📥 Fetching deposits for:", userId);


        const deposits = await Deposit.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ deposits });
        // console.log(deposits)
        
    } catch (error) {
        console.error("❌ Error fetching user deposits:", error.message);
        res.status(500).json({ msg: "Failed to fetch deposits" });
    }
});

export default router;
