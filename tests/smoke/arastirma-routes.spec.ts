import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/arastirma", heading: /Arazi|terminali|zekasi/i },
  { path: "/arastirma/war-room", heading: /War Room|Stratejik/i },
  { path: "/arastirma/ges", heading: /GES muhendislik/i },
  { path: "/arastirma/parsel", heading: /parsel istihbarat/i },
  { path: "/arastirma/yatirim", heading: /Yatirim terminali/i },
] as const;

test.describe("intelligence routes (direct refresh)", () => {
  for (const { path, heading } of ROUTES) {
    test(`${path} renders (no React 404)`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await page.goto(path, { waitUntil: "networkidle" });

      await expect(page.locator("h1").first()).toBeVisible({ timeout: 20_000 });
      await expect(page.locator("h1").first()).toContainText(heading);
      await expect(page.getByText(/^404$/)).toHaveCount(0);
      await expect(page.getByText(/sayfa bulunamad/i)).toHaveCount(0);

      const chunkErrors = errors.filter((e) =>
        /Failed to fetch dynamically imported module|Loading chunk|ChunkLoadError/i.test(e),
      );
      expect(chunkErrors, `console errors: ${errors.join("; ")}`).toHaveLength(0);

      await page.screenshot({
        path: `_audit/komut2/screenshot-preview${path.replace(/\//g, "-")}.png`,
        fullPage: true,
      });
    });
  }
});