import { test, expect } from "@playwright/test";

test.describe("hash routes (preview)", () => {
  test("ana sayfa yuklenir", async ({ page }) => {
    await page.goto("/#/");
    await expect(page).toHaveTitle(/ihaleal/i);
    await expect(page.locator("main")).toBeVisible();
  });

  test("yasal agency contract sayfasi", async ({ page }) => {
    await page.goto("/#/yasal/agency-contract");
    await expect(page.getByRole("heading", { name: /agency_contract/i })).toBeVisible();
    await expect(page.getByText(/taslak|Kaynak/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test("giris sayfasi", async ({ page }) => {
    await page.goto("/#/giris");
    await expect(page.locator("h1").first()).toContainText(/Giriş|Giris/i, { timeout: 20_000 });
  });
});
