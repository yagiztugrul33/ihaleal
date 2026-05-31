import { chromium, devices } from "playwright";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:4173";

const browser = await chromium.launch();
for (const [name, viewport, ua] of [
  ["desktop", { width: 1440, height: 900 }, "Mozilla/5.0 (Windows NT 10.0) Chrome/120"],
  ["mobile", { width: 390, height: 844 }, devices["iPhone 13"].userAgent],
]) {
  const ctx = await browser.newContext({ viewport, userAgent: ua });
  const page = await ctx.newPage();
  for (const route of ["/ilan/prop-010", "/ilan/1", "/ilan/saçma-id"]) {
    const slug = route.replace(/[/?#=]/g, "_").replace(/^_+/, "");
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const png = resolve(__dirname, `screenshot-${name}-${slug}.png`);
    await page.screenshot({ path: png, fullPage: false });
    console.log(`  📸 ${png}`);
  }
  await ctx.close();
}
await browser.close();
