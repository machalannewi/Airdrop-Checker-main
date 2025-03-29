import express from "express";
import puppeteer from "puppeteer";
import authMiddleware from "../middleware/authMiddleware.js";
import checkSubscription from "../middleware/subscriptionMiddleware.js";

const router = express.Router();

// 🔥 Only logged-in & subscribed users can access
router.get("/airdrops", authMiddleware, checkSubscription, async (req, res) => {
    
  let browser;
      try {
          browser = await puppeteer.launch({ headless: "new" });
          const page = await browser.newPage();
          await page.goto('https://airdrop.io', { waitUntil: 'networkidle2' });
  
          const airdrops = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('a.w-full.aspect-square')).map(airdrop => {
                  const title = airdrop.querySelector('h3')?.innerText.trim() || 'No title';
                  const rewardContainer = airdrop.querySelector('[class*="text-[#A8A8A8]"]'); 
                  const rewardText = rewardContainer?.innerText.trim() || 'No reward';
                  const [amount, currency] = rewardText.split(' ') || ['Unknown', 'Unknown'];
                  const link = airdrop.href ? `https://airdrop.io${airdrop.getAttribute('href')}` : 'No link';
  
                  return { title, amount, currency, link };
              });
          });
  
          res.json(airdrops);
      } catch (error) {
          console.error("Scraping failed:", error);
          res.status(500).json({ error: 'Unable to fetch Airdrop' });
      } finally {
          if (browser) await browser.close();
      }
});


export default router;
