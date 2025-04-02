import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const verifyPaystackPayment = async (reference) => {
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        });

        return response.data.status && response.data.data.status === "success";
    } catch (error) {
        console.error("Paystack verification error:", error);
        return false;
    }
};
