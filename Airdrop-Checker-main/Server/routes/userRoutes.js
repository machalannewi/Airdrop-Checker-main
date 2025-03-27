import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../Models/user.js";

const router = express.Router();

// 🔥 Subscribe User (POST /api/users/subscribe)
router.post("/subscribe", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (user.isSubscribed) {
            return res.status(400).json({ msg: "User is already subscribed" });
        }

        console.log("User found:", user);

        user.isSubscribed = true;
        await user.save();
        console.log("Updated user:", user);

        res.json({ msg: "Subscription successful!" });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

export default router;
