import { test, expect } from "@playwright/test";
import { LOCALE_STORAGE_KEY } from "../../src/i18n/messages";

const HUB = "/how-it-works";
const STEPS = ["kesfet", "teklif", "kazan", "teslim"] as const;
const JOURNEYS = ["alici", "satici", "danisman", "kurumsal", "operasyon"] as const;

async function dismissCookie(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    localStorage.setItem("ihaleal_cookie_consent_v1", new Date().toISOString());
    localStorage.setItem("ihaleal_locale", "tr");
  });
}

test.describe("how-it-works hub + detail pages", () => {
  test("hub loads with video asset available and step cards", async ({ page, request, baseURL }) => {
    const origin = baseURL ?? "http://localhost:4173";
    const videoRes = await request.head(`${origin}/videos/ihaleal-tanitim.mp4`);
    expect(videoRes.status(), "tanitim mp4 must be served").toBe(200);

    await page.goto(HUB);
    await dismissCookie(page);
    await page.reload();

    await expect(page.getByRole("heading", { name: /^Nasıl çalışır\?$/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Platform tanıtımı/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Tanıtım videosunu oynat/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Detaylı rehber/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Tam yolculuk rehberi/i })).toBeVisible();
  });

  test("promo video plays after click", async ({ page }) => {
    await page.goto(HUB);
    await dismissCookie(page);
    await page.reload();

    await page.getByRole("button", { name: /Tanıtım videosunu oynat/i }).click();
    const video = page.locator("video source[src='/videos/ihaleal-tanitim.mp4']");
    await expect(video).toBeAttached({ timeout: 10_000 });
    await expect(page.locator("video")).toBeVisible();
  });

  for (const slug of STEPS) {
    test(`step detail /how-it-works/adim/${slug} loads with related links`, async ({ page }) => {
      await page.goto(`${HUB}/adim/${slug}`);
      await dismissCookie(page);
      await expect(page.getByRole("link", { name: /Nasıl çalışır ana sayfa/i })).toBeVisible();
      await expect(page.locator("section, .card-warm, article").first()).toBeVisible();
      const links = page.locator('a[href^="/"]');
      expect(await links.count()).toBeGreaterThan(2);
    });
  }

  for (const slug of JOURNEYS) {
    test(`journey detail /how-it-works/yol/${slug} loads four steps`, async ({ page }) => {
      await page.goto(`${HUB}/yol/${slug}`);
      await dismissCookie(page);
      await expect(page.getByText(/Yapılacaklar/i).first()).toBeVisible();
      await expect(page.getByText(/^1$/).first()).toBeVisible();
    });
  }

  test("legacy /nasil-calisir redirects to hub", async ({ page }) => {
    await page.goto("/nasil-calisir?yol=alici");
    await dismissCookie(page);
    await expect(page).toHaveURL(/\/how-it-works\?yol=alici/);
  });

  test("home how-it-works steps link to detail pages", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((key) => localStorage.setItem(key, "tr"), LOCALE_STORAGE_KEY);
    await page.reload();
    await dismissCookie(page);

    const stepLink = page.locator(".premium-step--link").first();
    await expect(stepLink).toBeVisible();
    await stepLink.click();
    await expect(page).toHaveURL(/\/how-it-works\/adim\/kesfet/);
  });
});
