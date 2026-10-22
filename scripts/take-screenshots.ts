import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function takeScreenshots() {
  const outDir = path.join(process.cwd(), "public", "brick-cards-screenshots");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log("Launching browser for screenshot capture...");
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  const viewports = [
    { name: "1440px-desktop", width: 1440, height: 1200 },
    { name: "1024px-laptop", width: 1024, height: 1100 },
    { name: "768px-tablet", width: 768, height: 1024 },
    { name: "390px-mobile", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.addInitScript(() => {
      try {
        localStorage.setItem("fm_gender", "male");
      } catch (e) {}
    });
    console.log(`Navigating to http://localhost:3000/shop at ${vp.width}px...`);
    await page.goto("http://localhost:3000/shop?nogate=true", { waitUntil: "domcontentloaded" });
    // Wait for images and layouts to settle
    await page.waitForTimeout(3000);

    const shotPath = path.join(outDir, `shop-${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot: ${shotPath}`);

    if (vp.width === 1440) {
      // Hover the first card to capture hover state
      console.log("Capturing hover state at 1440px...");
      const firstCard = page.locator(".brick-card").first();
      await firstCard.hover({ force: true });
      await page.waitForTimeout(800);
      const hoverShotPath = path.join(outDir, "shop-1440px-hover.png");
      await page.screenshot({ path: hoverShotPath, fullPage: false });
      console.log(`Saved hover screenshot: ${hoverShotPath}`);
    }

    await page.close();
  }

  await browser.close();
  console.log("All screenshots captured successfully.");
}

takeScreenshots().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
