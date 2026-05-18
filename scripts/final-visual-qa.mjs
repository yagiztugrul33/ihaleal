import { chromium } from "playwright";
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "_audit", "final-visual");
const baseUrl = process.env.QA_TARGET === "local"
  ? process.env.LOCAL_URL || "http://127.0.0.1:4173"
  : process.env.PROD_URL || "https://ihaleal.vercel.app";

function fileUrl(p) {
  return `file:///${p.replace(/\\/g, "/")}`;
}

async function dismissCookie(page) {
  await page.addInitScript(() => {
    localStorage.setItem("ihaleal_cookie_consent_v1", new Date().toISOString());
  });
}

async function capture(page, filename, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/?fresh=${Date.now()}`, {
    waitUntil: "networkidle",
    timeout: 90_000,
  });
  await page.waitForTimeout(1200);
  await page.locator("#hero").waitFor({ state: "visible", timeout: 25_000 }).catch(() => {});
  await page.screenshot({ path: path.join(outDir, filename), fullPage: true });
}

async function buildComparison(browser, prodDesktopPath) {
  const refPath = path.join(root, "reference", "proje.png");
  let hasRef = false;
  try {
    await access(refPath);
    hasRef = true;
  } catch {
    // missing
  }

  const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
  const leftLabel = hasRef ? "Reference (reference/proje.png)" : "Reference missing (duplicate capture)";
  const rightLabel = `Site capture (${baseUrl})`;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
body{margin:0;background:#050b16;color:#cbd5e1;font-family:system-ui,sans-serif}
h2{font-size:13px;text-align:center;margin:16px 8px;color:#f8fafc}
.row{display:flex;gap:12px;padding:12px}
.col{width:50%}
img{width:100%;border-radius:10px;border:1px solid rgba(255,255,255,.12)}
</style></head><body><motion.div class="row">
<div class="col"><h2>${leftLabel}</h2><img src="${fileUrl(hasRef ? refPath : prodDesktopPath)}"/></div>
<div class="col"><h2>${rightLabel}</h2><img src="${fileUrl(prodDesktopPath)}"/></div>
</div></body></html>`.replace('<motion.div class="row">', '<div class="row">');

  await page.setContent(html);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, "screenshot-reference-comparison.png"), fullPage: true });
  await page.close();
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
await dismissCookie(page);
const desktopPath = path.join(outDir, "screenshot-home-desktop.png");
await capture(page, "screenshot-home-desktop.png", { width: 1920, height: 1080 });
await capture(page, "screenshot-home-desktop-1440.png", { width: 1440, height: 900 });
await capture(page, "screenshot-home-tablet.png", { width: 834, height: 1112 });
await capture(page, "screenshot-home-mobile.png", { width: 390, height: 844 });
await page.close();
await buildComparison(browser, desktopPath);
await browser.close();
console.log("QA done:", outDir, baseUrl);
