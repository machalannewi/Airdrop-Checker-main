import express from "express";
import puppeteer from "puppeteer";
import authMiddleware from "../middleware/authMiddleware.js";
import checkSubscription from "../middleware/subscriptionMiddleware.js";

const router = express.Router();

router.get("/airdrops", authMiddleware, checkSubscription, async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://airdrop.io', { waitUntil: 'networkidle2' });

    const airdrops = await page.evaluate(() => {
      const parseTimerToSeconds = (timerText) => {
        if (!timerText) return 0;

        const timeParts = {
          mo: 0,
          d: 0,
          h: 0,
          m: 0,
          s: 0,
        };

        const regex = /(\d+)\s*(mo|d|h|m|s)/g;
        let match;
        while ((match = regex.exec(timerText)) !== null) {
          const value = parseInt(match[1]);
          const unit = match[2];
          timeParts[unit] = value;
        }

        const seconds =
          timeParts.mo * 30 * 24 * 60 * 60 + // 1 month = 30 days
          timeParts.d * 24 * 60 * 60 +
          timeParts.h * 60 * 60 +
          timeParts.m * 60 +
          timeParts.s;

        return seconds;
      };

      return Array.from(document.querySelectorAll('a.w-full.aspect-square')).map(airdrop => {
        const image = airdrop.querySelector('img')?.src || 'No image';
        const imageAlt = airdrop.querySelector('img')?.alt || 'No alt text';
        const timerText = airdrop.querySelector('[class*="bg-airdropio-green"]')?.innerText.trim() || '0s';
        const timerSeconds = parseTimerToSeconds(timerText);

        const title = airdrop.querySelector('h3')?.innerText.trim() || 'No title';
        const rewardContainer = airdrop.querySelector('[class*="text-[#A8A8A8]"]');
        const rewardText = rewardContainer?.innerText.trim() || 'No reward';
        const [amount, currency] = rewardText.split(' ') || ['Unknown', 'Unknown'];
        const link = airdrop.href ? `https://airdrop.io${airdrop.getAttribute('href')}` : 'No link';

        return {
          title,
          amount,
          currency,
          link,
          image,
          imageAlt,
          timer: timerText,
          timerSeconds
        };
      });
    });

    // Scrape expiry date from each airdrop's detail page
    for (let i = 0; i < airdrops.length; i++) {
      try {
        const detailPage = await browser.newPage();
        await detailPage.goto(airdrops[i].link, { waitUntil: "networkidle2" });

        const expiry = await detailPage.evaluate(() => {
          const paragraphs = Array.from(document.querySelectorAll("p"));
          for (let p of paragraphs) {
            if (p.innerText.trim().startsWith("End date:")) {
              const match = p.innerText.trim().match(/End date:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/);
              if (match) {
                const [, month, day, year] = match;
                return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`).getTime();
              }
            }
          }
          return null;
        });

        airdrops[i].expiry = expiry;
        await detailPage.close();
      } catch (err) {
        console.error(`Error scraping expiry for ${airdrops[i].title}:`, err);
        airdrops[i].expiry = null;
      }
    }

    res.json(airdrops);
  } catch (error) {
    console.error("Scraping failed:", error);
    res.status(500).json({ error: 'Unable to fetch Airdrop' });
  } finally {
    if (browser) await browser.close();
  }
});



export default router;
