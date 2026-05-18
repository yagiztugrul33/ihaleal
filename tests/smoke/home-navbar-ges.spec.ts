import { test, expect } from "@playwright/test";
import { LOCALE_STORAGE_KEY } from "../../src/i18n/messages";

test.describe("home + navbar GES regression", () => {
  test("homepage shows cinematic hero and live auctions", async ({ page }) => {
    await page.goto("/?fresh=1");
    await expect(page.getByTestId("premium-cinematic-home")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Gayrimenkul/i);
    await expect(page.getByRole("heading", { name: /Canlı Müzayedeler/i })).toBeVisible();
    await expect(page.getByText(/Bodrum, Muğla/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /ihaleal Kurumsal/i })).toBeVisible();
  });

  test("navbar GES via Services dropdown — desktop", async ({ page }) => {
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

  test("homepage hero visible with premium search strip", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Açık Artırma/i);
    await expect(page.getByPlaceholder(/Müzayede veya bölge ara/i)).toBeVisible();
  });

  test("homepage shows footer on marketing home", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((key) => {
      localStorage.setItem(key, "tr");
    }, LOCALE_STORAGE_KEY);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Geleceği/i);
    await expect(page.getByText(/Bodrum, Muğla/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /KVKK/i }).first()).toBeVisible();
  });
});
