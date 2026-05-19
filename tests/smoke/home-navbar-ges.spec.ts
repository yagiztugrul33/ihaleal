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

  test("homepage shows footer on marketing home", async ({ page }) => {
    await setLocaleTr(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Geleceği/i);
    await expect(page.getByText(/LIVE/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /KVKK/i }).first()).toBeVisible();
  });
});
