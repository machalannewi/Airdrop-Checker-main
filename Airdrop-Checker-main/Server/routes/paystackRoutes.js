import express from "express";
import dotenv from "dotenv";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../Models/user.js";
import axios from "axios";

dotenv.config();
const router = express.Router();

// Initialize Paystack Payment
router.post("/pay", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const { email } = user;
        const amount = 5000 * 100; // Subscription fee in kobo (e.g., ₦5000 -> 500000 kobo)

        const paystackResponse = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email,
                amount,
                currency: "NGN",
                callback_url: "http://localhost:5000/api/paystack/verify",
            },
            {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
            }
        );

        res.json({ authorization_url: paystackResponse.data.data.authorization_url });
    } catch (error) {
        console.error("Paystack error:", error.response?.data || error.message);
        res.status(500).json({ msg: "Payment initialization failed" });
    }
});


// Verify Paystack Payment
router.get("/verify", async (req, res) => {
    try {
        const { reference } = req.query;
        if (!reference) return res.status(400).json({ msg: "No transaction reference provided" });

        const paystackResponse = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
            }
        );

        if (paystackResponse.data.data.status === "success") {
            const user = await User.findOne({ email: paystackResponse.data.data.customer.email });
            if (user) {
                user.isSubscribed = true;
                await user.save();
                return res.redirect("http://localhost:3000/dashboard?success=true");
            }
        }

        res.redirect("http://localhost:3000/dashboard?success=false");
    } catch (error) {
        console.error("Verification error:", error.response?.data || error.message);
        res.status(500).json({ msg: "Payment verification failed" });
    }
});


export default router;
