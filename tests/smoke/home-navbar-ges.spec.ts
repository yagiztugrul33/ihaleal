import { test, expect } from "@playwright/test";

test.describe("home + navbar GES regression", () => {
  test("homepage shows module showcase (GES, Valuation, Research)", async ({ page }) => {
    await page.goto("/?fresh=1");
    await expect(page.getByRole("heading", { name: /GES & Arazi Analizi/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: /^AI Değerleme$/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Araştırma Intelligence/i })).toBeVisible();
  });

  test("navbar GES Land via Services dropdown — desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.getByTestId("nav-services-trigger").click();
    const ges = page.getByTestId("nav-services-ges");
    await expect(ges).toBeVisible({ timeout: 15_000 });
    await expect(ges).toHaveText(/GES Land/i);
    await ges.click();
    await expect(page).toHaveURL(/\/arastirma\/ges/, { timeout: 15_000 });
  });

  test("navbar GES Land via Services — mobile menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /Open menu/i }).click();
    const ges = page.getByTestId("nav-services-ges-mobile");
    await expect(ges).toBeVisible({ timeout: 15_000 });
    await ges.click();
    await expect(page).toHaveURL(/\/arastirma\/ges/, { timeout: 15_000 });
  });

  test("homepage hero is English", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Real Estate Auctions/i);
    await expect(page.getByText(/Dubai, UAE/i)).toBeVisible();
    await expect(page.getByText("GDPR", { exact: true }).first()).toBeVisible();
  });
});
