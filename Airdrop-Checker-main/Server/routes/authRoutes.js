import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../Models/user.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();


// 🔥 User Signup
router.post(
  "/signup",
  [
    body("fullname").notEmpty().withMessage("Full name is required"),
    body("username").notEmpty().isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
    body("email").isEmail().withMessage("Enter a valid email").trim().toLowerCase(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { fullname, username, email, password } = req.body;
      const userExists = await User.findOne({ email });

      if (userExists) return res.status(400).json({ msg: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({ fullname, username, email, password: hashedPassword });
      await user.save();

      // Generate JWT Token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({ msg: "User registered successfully", token });
    } catch (error) {
      res.status(500).json({ msg: "Server error", error });
    }
  }
);



// User Login
router.post("/login", [
  body("email").isEmail().withMessage("Enter a valid email").trim().toLowerCase(),
  body("password").notEmpty().withMessage("Password is required"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ msg: "Login successful", token, isSubscribed: user.isSubscribed });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
});





export default router;
