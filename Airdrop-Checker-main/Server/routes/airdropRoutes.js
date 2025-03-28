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
        const { airdropId } = req.body; // Airdrop ID from request
        res.json({ msg: "Here is your airdrop list!", airdrops: [] });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});


// 🔥 Claim an Airdrop (Only for Subscribed Users)
// router.post("/claim", authMiddleware, async (req, res) => {
//     try {
//         const { airdropId } = req.body; // Airdrop ID from request
//         const user = await user.findById(req.user.userId);

//         if (!user) {
//             return res.status(404).json({ msg: "User not found" });
//         }

//         if (!user.subscribed) {
//             return res.status(403).json({ msg: "You must be subscribed to claim airdrops" });
//         }

//         if (user.claimedAirdrops.includes(airdropId)) {
//             return res.status(400).json({ msg: "You have already claimed this airdrop" });
//         }

//         user.claimedAirdrops.push(airdropId);
//         await user.save();

//         res.json({ msg: "Airdrop claimed successfully!" });
//     } catch (err) {
//         res.status(500).json({ msg: "Server error" });
//     }
// });


export default router;
