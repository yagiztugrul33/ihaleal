import { test, expect } from "@playwright/test";
import { LOCALE_STORAGE_KEY } from "../../src/i18n/messages";

test.describe("home + navbar GES regression", () => {
  test("homepage shows module showcase (GES, Valuation, Research)", async ({ page }) => {
    await page.goto("/?fresh=1");
    await expect(page.getByRole("heading", { name: /GES & Arazi Analizi/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: /^AI Değerleme$/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Araştırma Intelligence/i })).toBeVisible();
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

  test("homepage hero English by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Real Estate Auctions/i);
    await expect(page.getByText(/Dubai, UAE/i)).toBeVisible();
  });

  test("homepage switches to Turkish", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((key) => {
      localStorage.setItem(key, "tr");
    }, LOCALE_STORAGE_KEY);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/İhalelerinin Geleceği/i);
    await expect(page.getByText(/Sarıyer/i)).toBeVisible();
    await expect(page.getByText("KVKK", { exact: true }).first()).toBeVisible();
  });
});
