import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "_audit", "visual-parity");
const base = process.env.PREVIEW_URL || "http://127.0.0.1:4173";

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(outDir, "after-desktop.png"), fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/?fresh=1`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(outDir, "after-mobile.png"), fullPage: true });

await browser.close();
console.log("Screenshots saved to", outDir);
