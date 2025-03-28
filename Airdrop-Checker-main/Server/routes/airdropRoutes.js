import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import checkSubscription from "../middleware/subscriptionMiddleware.js";

const router = express.Router();

// 🔥 Only logged-in & subscribed users can access
router.get("/", authMiddleware, checkSubscription, async (req, res) => {
    
    try {
        const { airdropId } = req.body; // Airdrop ID from request
        res.json({ msg: "Here is your airdrop list!", airdrops: [] });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});


export default router;
