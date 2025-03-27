import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config(); // Ensure this is loaded

const authMiddleware = (req, res, next) => {
    // Get token from request header
    let token = req.header("Authorization");

    console.log("Received Token:", token); // Debugging line

    // Check if token exists
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

        // If token has "Bearer ", remove it
        token = token.replace("Bearer ", "").trim();

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Store user data in request object
        next(); // Move to the next middleware
    } catch (err) {
        console.error("JWT Verification Error:", err.message); // Debugging line
        res.status(401).json({ msg: "Invalid token" });
    }
};

export default authMiddleware;
