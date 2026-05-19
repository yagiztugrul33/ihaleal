import { test, expect } from "@playwright/test";
import { LOCALE_STORAGE_KEY } from "../../src/i18n/messages";

async function setLocaleTr(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate((key) => {
    localStorage.setItem(key, "tr");
  }, LOCALE_STORAGE_KEY);
  await page.reload();
}

test.describe("home + navbar GES regression", () => {
  test("homepage shows cinematic hero, deprem bands and live auctions", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setLocaleTr(page);
    await expect(page.getByTestId("premium-cinematic-home")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Gayrimenkul/i);
    await expect(page.getByRole("heading", { name: /Öne Çıkan Canlı Müzayedeler/i })).toBeVisible();
    await expect(page.getByText(/LIVE/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Kurumsal Altyapısı/i })).toBeVisible();
    await expect(page.getByText(/Stratejik War Room/i)).toBeVisible();
    await expect(page.locator(".premium-hero__visual .premium-live-card__value")).toBeVisible();
  });

  test("navbar GES via Services mega menu — desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.getByTestId("nav-services-trigger").click();
    const ges = page.getByTestId("nav-services-ges");
    await expect(ges).toBeVisible({ timeout: 15_000 });
    await expect(ges).toHaveText(/GES Land|GES Arazi/i);
    await ges.click();
    await expect(page).toHaveURL(/\/arastirma\/ges/, { timeout: 15_000 });
  });

  test("navbar GES via Services — mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /Open menu|Menüyü aç/i }).click();
    const ges = page.getByTestId("nav-services-ges-mobile");
    await expect(ges).toBeVisible({ timeout: 15_000 });
    await ges.click();
    await expect(page).toHaveURL(/\/arastirma\/ges/, { timeout: 15_000 });
  });

  test("homepage hero visible with navbar search", async ({ page }) => {
    await setLocaleTr(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Geleceği/i);
    await expect(page.getByText(/İhale, lokasyon ara/i)).toBeVisible();
  });

  test("mobile menu shows login and signup portal sections", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /Open menu|Menüyü aç/i }).click();
    const menu = page.getByTestId("nav-mobile-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByText("Bireysel giriş")).toBeVisible();
    await expect(menu.getByText("Yatırımcı portalı")).toBeVisible();
    await expect(menu.getByText("Emlakçı portalı")).toBeVisible();
    await expect(menu.getByText("Müteahhit portalı")).toBeVisible();
    await expect(menu.getByText("Bireysel kayıt")).toBeVisible();
    await expect(menu.getByText("Müteahhit kaydı")).toBeVisible();
  });

  test("homepage hero has no intro video", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setLocaleTr(page);
    await expect(page.locator(".premium-hero__video")).toHaveCount(0);
    await expect(page.locator(".premium-kicker")).toHaveCount(0);
  });

  test("homepage category cards use turizm and ges public slugs", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setLocaleTr(page);
    await expect(page.locator('a.premium-category-card[href="/ilanlar/turizm"]')).toBeVisible();
    await expect(page.locator('a.premium-category-card[href="/ilanlar/ges"]')).toBeVisible();
    await page.locator('a.premium-category-card[href="/ilanlar/turizm"]').click();
    await expect(page).toHaveURL(/\/ilanlar\/konaklama/, { timeout: 15_000 });
  });
});
