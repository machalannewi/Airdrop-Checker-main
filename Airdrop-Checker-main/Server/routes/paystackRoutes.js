import express from "express";
import dotenv from "dotenv";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../Models/user.js";
import Transaction from "../Models/Transaction.js";
import axios from "axios";

dotenv.config();
const router = express.Router();

// Initialize Paystack Payment
router.post("/pay", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const { email } = user;
        const amount = 500 * 100; // Subscription fee in kobo (e.g., ₦5000 -> 500000 kobo)

        
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
        const amount = paystackResponse.data.data.amount / 100;  // Convert amount to correct units (NGN)

       

        // Check if payment was successful
        if (paystackResponse.data.data.status === "success") {
            // const email = paystackResponse.data.data.customer.email;
            // let user = await User.findOne({ email });
            const email = paystackResponse.data.data.customer.email.toLowerCase();
            let user = await User.findOne({ email: email.toLowerCase() });

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


                                // Assuming you have a Transaction model
                                const newTransaction = new Transaction({
                                    userId: user._id,
                                    amount: amount,
                                    paymentMethod: "Paystack",
                                    status: "verified",
                                    currency: "NGN",
                                    reference: reference
                                });
                                
                                await newTransaction.save();

                // Successful payment and user update
                return res.redirect("http://localhost:3000/dashboard?success=true");
            } else {
                // User not found despite successful payment
                console.error(`User with email ${email} not found after successful payment`);
                return res.redirect("http://localhost:3000/dashboard?success=false&reason=user_not_found");
            }
        } else {
            // Payment wasn't successful according to Paystack
            console.error(`Payment failed: ${paystackResponse.data.data.status}, reference: ${reference}`);
            return res.redirect("http://localhost:3000/dashboard?success=false&reason=payment_failed");
        }
    }catch (error) {
        console.error("Verification error details:", {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
            reference: req.query.reference
        });
        
        return res.redirect("http://localhost:3000/dashboard?success=false&reason=verification_error");
    }
});



export default router;
