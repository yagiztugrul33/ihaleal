/* global window, document */
import { chromium } from "playwright";

const BASE = process.env.AUDIT_BASE || "http://localhost:5173";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
await page.getByRole("link", { name: "Değerleme" }).first().click();
await page.waitForTimeout(1500);
const url1 = page.url();
const h1a = await page.locator("h1").first().textContent();
const hasHero = await page.getByText("gayrimenkul işlemleri").count();

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.9));
await page.waitForTimeout(400);
await page.getByRole("link", { name: "Aracı aç" }).first().click();
await page.waitForTimeout(1500);
const url2 = page.url();
const h1b = await page.locator("h1").first().textContent();

console.log(
  JSON.stringify(
    {
      navDegerleme: { url: url1, h1: h1a?.trim(), stillHome: hasHero > 0 },
      araciAc: { url: url2, h1: h1b?.trim() },
    },
    null,
    2,
  ),
);
await browser.close();
