import { chromium } from "playwright";

const BASE = "http://localhost:5174/";
const LOCALE_KEY = "ihaleal_locale";

const browser = await chromium.launch();
const errors = [];

async function capture(label, locale, paths) {
  const ctx = await browser.newContext({ viewport: paths.desktop ? { width: 1440, height: 900 } : { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${label} pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") {
      errors.push(`${label} ${m.type()}: ${m.text()}`);
    }
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  if (locale) {
    await page.evaluate(
      ([key, value]) => localStorage.setItem(key, value),
      [LOCALE_KEY, locale],
    );
    await page.reload({ waitUntil: "networkidle" });
  }
  await page.waitForTimeout(2000);

  if (paths.desktop) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: paths.desktop, fullPage: true });
  }
  if (paths.mobile) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: paths.mobile, fullPage: true });
  }

  await ctx.close();
}

await capture("tr", null, {
  desktop: "screenshots/home-desktop.png",
  mobile: "screenshots/home-mobile.png",
});

await capture("en", "en", {
  desktop: "screenshots/home-desktop-en.png",
});

console.log("CONSOLE_ERRORS:", JSON.stringify(errors, null, 2));
await browser.close();
