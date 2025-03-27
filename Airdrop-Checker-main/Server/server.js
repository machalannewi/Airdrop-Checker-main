// import express from "express";
// import puppeteer from "puppeteer";
// import cors from "cors";

// const app = express();
// app.use(cors()); // Enable frontend access

// app.get('/api/airdrops', async (req, res) => {
//     let browser;
//     try {
//         browser = await puppeteer.launch({ headless: "new" });
//         const page = await browser.newPage();
//         await page.goto('https://airdrop.io', { waitUntil: 'networkidle2' });

//         const airdrops = await page.evaluate(() => {
//             return Array.from(document.querySelectorAll('a.w-full.aspect-square')).map(airdrop => {
//                 const title = airdrop.querySelector('h3')?.innerText.trim() || 'No title';
//                 const rewardContainer = airdrop.querySelector('[class*="text-[#A8A8A8]"]'); 
//                 const rewardText = rewardContainer?.innerText.trim() || 'No reward';
//                 const [amount, currency] = rewardText.split(' ') || ['Unknown', 'Unknown'];
//                 const link = airdrop.href ? `https://airdrop.io${airdrop.getAttribute('href')}` : 'No link';

//                 return { title, amount, currency, link };
//             });
//         });

//         res.json(airdrops);
//     } catch (error) {
//         console.error("Scraping failed:", error);
//         res.status(500).json({ error: 'Unable to fetch Airdrop' });
//     } finally {
//         if (browser) await browser.close();
//     }
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}/api/airdrops`));



import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import airdropRoutes from "./routes/airdropRoutes.js";
import userRoutes from "./routes/userRoutes.js";



const port = process.env.PORT || 5000;

dotenv.config();  // Load environment variables

const app = express();
app.use(cors()); // Enable frontend access
app.use(express.json()); // Middleware to parse JSON



// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};
connectDB();
app.use("/api/auth", authRoutes);
app.use("/api", airdropRoutes);  // Protected Airdrop Route
app.use("/api/users", userRoutes);  // Protected User Route

app.listen(port, () => console.log(`Server running on port ${port}`));
