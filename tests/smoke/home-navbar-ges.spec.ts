import { test, expect } from "@playwright/test";

test.describe("home + navbar GES regression", () => {
  test("ana sayfada 3 modul showcase (GES, Degerleme, Arastirma)", async ({ page }) => {
    await page.goto("/?fresh=1");
    await expect(page.getByRole("heading", { name: /GES & Arazi Analizi/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: /^AI Değerleme$/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Araştırma Intelligence/i })).toBeVisible();
  });

  test("navbar GES Arazi masaustu — /arastirma/ges", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const ges = page.locator('.nav-desktop-links a[href="/arastirma/ges"]');
    await expect(ges).toBeVisible({ timeout: 15_000 });
    await expect(ges).toHaveText(/GES Arazi/i);
    await ges.click();
    await expect(page).toHaveURL(/\/arastirma\/ges/, { timeout: 15_000 });
  });

  test("navbar GES Arazi mobil menu — /arastirma/ges", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /Menüyü aç/i }).click();
    const ges = page.getByRole("link", { name: "GES Arazi" });
    await expect(ges).toBeVisible({ timeout: 15_000 });
    await ges.click();
    await expect(page).toHaveURL(/\/arastirma\/ges/, { timeout: 15_000 });
  });
});