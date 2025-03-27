import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import checkSubscription from "../middleware/subscriptionMiddleware.js";

const router = express.Router();

// Protected route: Only authenticated users can access airdrops
router.get("/airdrops", authMiddleware, (req, res) => {
    res.json({ msg: "Welcome to the airdrop dashboard!", user: req.user });
});

// 🔥 Only logged-in & subscribed users can access
router.get("/", authMiddleware, checkSubscription, async (req, res) => {
    try {
        res.json({ msg: "Here is your airdrop list!", airdrops: [] });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

export default router;
