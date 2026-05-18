import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") {
    errors.push(m.type() + ": " + m.text());
  }
});

await page.goto("http://localhost:5174/", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.screenshot({ path: "screenshots/home-desktop.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "screenshots/home-mobile.png", fullPage: true });
await page.waitForTimeout(1000);

console.log("CONSOLE_ERRORS:", JSON.stringify(errors, null, 2));
await browser.close();