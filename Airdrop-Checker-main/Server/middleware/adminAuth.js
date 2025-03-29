import jwt from "jsonwebtoken";
import Admin from "../Models/admin.js"; // Adjust the path based on your project structure
import dotenv from "dotenv";
dotenv.config();

const adminAuth = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ msg: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ msg: "Invalid token" });
    }
};

export const adminAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) return res.status(401).json({ msg: "Unauthorized: No token" });

        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("🔑 Decoded Token:", decoded);
        console.log("🔍 Looking for Admin with ID:", decoded.adminId); // ✅ Now using adminId

        const admin = await Admin.findById(decoded.adminId); // ✅ Now querying with adminId

        console.log("🔍 Admin Data:", admin); // ✅ Debug log

        if (!admin) {
            console.log("❌ Access denied: Admin not found");
            return res.status(403).json({ msg: "Forbidden: Admin only" });
        }

        req.user = admin;
        next();
    } catch (error) {
        console.error("❌ Authentication error:", error.message);
        res.status(401).json({ msg: "Unauthorized: Invalid or expired token" });
    }
};

export default adminAuth;
