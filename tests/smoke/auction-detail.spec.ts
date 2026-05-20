import { expect, test } from "@playwright/test";

test.describe("AuctionDetail smoke", () => {
  test("renders detail page and primary bid action", async ({ page }) => {
    await page.goto("/ilan/1");

    await expect(page).toHaveURL(/\/ilan\/1/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: /İhaleal Endeksi/i }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("button", { name: /Teklif ver|Kapalı teklif ver/i })).toBeVisible({
      timeout: 20_000,
    });
  });
});
