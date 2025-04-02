import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    paymentMethod: { type: String, enum: ["Paystack", "Crypto"], required: false },
    status: { type: String, enum: ["pending", "verified"], default: "pending" },
    reference: { type: String, required: false, unique: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Transaction", TransactionSchema);
