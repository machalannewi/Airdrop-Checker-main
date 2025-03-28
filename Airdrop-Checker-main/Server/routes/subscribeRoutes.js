import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../Models/user.js";

const router = express.Router();



// Check if User is Subscribed (GET /api/users/status)
router.get("/status", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        res.json({ subscribed: user.isSubscribed }); // Send subscription status
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

export default router;