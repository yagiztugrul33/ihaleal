import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "screenshots", "audit");
const baseUrl = process.env.AUDIT_BASE_URL || "http://localhost:5174";

const PATHS = [
  "/",
  "/ilanlar",
  "/auctions",
  "/emlakci",
  "/muteahhit",
  "/kapali-teklif",
  "/teklif-al",
  "/yorumlar",
  "/destek",
  "/reels",
  "/fiyatlandirma",
  "/bildirimler",
  "/takas",
  "/kyc",
  "/yatirimci/panel",
  "/yasal/guvenlik",
  "/kurumsal/basinda-biz",
  "/iletisim",
];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem("ihaleal_cookie_consent_v1", new Date().toISOString());
  });

  for (const routePath of PATHS) {
    const slug = routePath === "/" ? "home" : routePath.replace(/^\//, "").replace(/\//g, "-");
    for (const [label, viewport] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize(viewport);
      const url = `${baseUrl}${routePath}`;
      await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 }).catch(() => null);
      await page.waitForTimeout(1000);
      const file = path.join(outDir, `${slug}--${label}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log("saved", file);
    }
  }

  await browser.close();
  console.log("Screenshots done:", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
