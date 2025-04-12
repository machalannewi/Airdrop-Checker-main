// routes/withdrawals.js
import express from 'express';
import Withdrawal from '../Models/Withdrawal.js';
import User from '../Models/user.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { amount, method, walletAddress } = req.body;
    const userId = req.user.userId;

    if (!amount || !method || !walletAddress) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const user = await User.findById(userId);
    const methodKey = `${method.toLowerCase()}_balance`;

    if (!user[methodKey] || user[methodKey] < amount) {
      return res.status(400).json({ msg: "Insufficient balance" });
    }

    // Deduct balance immediately (optional until admin approves)
    user[methodKey] -= amount;
    user.deposited -= amount;
    await user.save();

    const newWithdrawal = new Withdrawal({
      userId,
      amount,
      method,
      walletAddress
    });

    await newWithdrawal.save();

    res.status(200).json({ msg: "Withdrawal request submitted", withdrawal: newWithdrawal });

  } catch (error) {
    console.error("❌ Withdrawal Error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
