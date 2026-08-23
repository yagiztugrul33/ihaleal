import { chromium, devices } from "playwright";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:4173";

const browser = await chromium.launch();

for (const [name, vp, ua] of [
  ["desktop", { width: 1440, height: 900 }, "Mozilla/5.0 Chrome/120"],
  ["mobile", { width: 390, height: 844 }, devices["iPhone 13"].userAgent],
]) {
  const ctx = await browser.newContext({ viewport: vp, userAgent: ua, serviceWorkers: "block" });
  const page = await ctx.newPage();
  for (const route of ["/degerleme", "/raporlar", "/borsa/sehir/istanbul", "/ihale-ac"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const slug = route.replace(/[/?#=]/g, "_").replace(/^_+/, "");
    const png1 = resolve(__dirname, `after-${name}-${slug}.png`);
    await page.screenshot({ path: png1, fullPage: false });
    console.log(`  📸 ${png1}`);
    // Scroll to form/button
    await page.evaluate(() => {
      const f = document.querySelector("form, button[type=submit]");
      if (f) f.scrollIntoView({ behavior: "instant", block: "center" });
    });
    await page.waitForTimeout(300);
    const png2 = resolve(__dirname, `after-${name}-${slug}-form.png`);
    await page.screenshot({ path: png2, fullPage: false });
    console.log(`  📸 ${png2}`);
  }
  await ctx.close();
}
await browser.close();
